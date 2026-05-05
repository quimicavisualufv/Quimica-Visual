import os
import re
import json
import time
import html
import textwrap
import traceback
import urllib.parse
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext, simpledialog
from html.parser import HTMLParser
from dataclasses import dataclass, field
from datetime import datetime

APP_NAME = "AcessMonitor via Code"
APP_VERSION = "3.0"
VOID_ELEMENTS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
    "param", "source", "track", "wbr"
}
HEADING_RE = re.compile(r"^h([1-6])$")
ARIA_VALID = {
    "aria-activedescendant", "aria-atomic", "aria-autocomplete", "aria-braillelabel",
    "aria-brailleroledescription", "aria-busy", "aria-checked", "aria-colcount",
    "aria-colindex", "aria-colindextext", "aria-colspan", "aria-controls", "aria-current",
    "aria-describedby", "aria-description", "aria-details", "aria-disabled", "aria-dropeffect",
    "aria-errormessage", "aria-expanded", "aria-flowto", "aria-grabbed", "aria-haspopup",
    "aria-hidden", "aria-invalid", "aria-keyshortcuts", "aria-label", "aria-labelledby",
    "aria-level", "aria-live", "aria-modal", "aria-multiline", "aria-multiselectable",
    "aria-orientation", "aria-owns", "aria-placeholder", "aria-posinset", "aria-pressed",
    "aria-readonly", "aria-relevant", "aria-required", "aria-roledescription", "aria-rowcount",
    "aria-rowindex", "aria-rowindextext", "aria-rowspan", "aria-selected", "aria-setsize",
    "aria-sort", "aria-valuemax", "aria-valuemin", "aria-valuenow", "aria-valuetext"
}
ROLE_VALID = {
    "alert", "alertdialog", "application", "article", "banner", "button", "cell",
    "checkbox", "columnheader", "combobox", "complementary", "contentinfo", "definition",
    "dialog", "directory", "document", "feed", "figure", "form", "grid", "gridcell",
    "group", "heading", "img", "link", "list", "listbox", "listitem", "log", "main",
    "marquee", "math", "menu", "menubar", "menuitem", "menuitemcheckbox", "menuitemradio",
    "navigation", "none", "note", "option", "presentation", "progressbar", "radio",
    "radiogroup", "region", "row", "rowgroup", "rowheader", "scrollbar", "search",
    "searchbox", "separator", "slider", "spinbutton", "status", "switch", "tab", "table",
    "tablist", "tabpanel", "term", "textbox", "timer", "toolbar", "tooltip", "tree",
    "treegrid", "treeitem"
}
INTERACTIVE_TAGS = {"a", "button", "input", "select", "textarea", "summary"}
INPUT_NAME_TYPES = {"button", "submit", "reset", "image"}
INPUT_LABEL_TYPES = {"text", "search", "email", "url", "tel", "password", "number", "date", "datetime-local", "month", "week", "time", "color", "file", "range", "checkbox", "radio"}
W3C_HTML_VALIDATOR_URL = "https://validator.w3.org/nu/?out=json"
W3C_HTML_VALIDATOR_FALLBACK_URL = "https://html5.validator.nu/?out=json"
W3C_CSS_VALIDATOR_URL = "https://jigsaw.w3.org/css-validator/validator"
AMAWEB_EVALUATOR_URL = "https://amaweb.unifesp.br/avaliador/"
AMAWEB_RESULTS_BASE_URL = "https://amaweb.unifesp.br/avaliador/results/"
AMAWEB_BROWSER_TIMEOUT = 35
W3C_HTML_DIRECT_MAX_BYTES = 700000
W3C_HTML_UPLOAD_MAX_BYTES = 2800000
W3C_CSS_DIRECT_MAX_BYTES = 650000
W3C_TIMEOUT = 8
W3C_REQUEST_INTERVAL = 1.0
MAX_EXTERNAL_FINDINGS = 80
LAST_W3C_REQUEST = 0.0
W3C_SERVICE_STATE = {
    "html_blocked": False,
    "html_reason": "",
    "css_blocked": False,
    "css_reason": ""
}

def reset_w3c_service_state():
    W3C_SERVICE_STATE["html_blocked"] = False
    W3C_SERVICE_STATE["html_reason"] = ""
    W3C_SERVICE_STATE["css_blocked"] = False
    W3C_SERVICE_STATE["css_reason"] = ""

class ValidatorRequestError(Exception):
    def __init__(self, code=0, reason="", body="", url=""):
        super().__init__(f"HTTP Error {code}: {reason}" if code else reason)
        self.code = code
        self.reason = reason
        self.body = body
        self.url = url

@dataclass
class Node:
    tag: str
    attrs: dict = field(default_factory=dict)
    raw_attrs: list = field(default_factory=list)
    children: list = field(default_factory=list)
    parent: object = None
    data: str = ""
    line: int = 1
    col: int = 0

class DOMParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("document")
        self.stack = [self.root]
        self.errors = []

    def handle_starttag(self, tag, attrs):
        line, col = self.getpos()
        low = tag.lower()
        attr_dict = {}
        raw = []
        for key, value in attrs:
            if key is None:
                continue
            lk = key.lower()
            attr_dict[lk] = "" if value is None else value
            raw.append((lk, "" if value is None else value))
        node = Node(low, attr_dict, raw, [], self.stack[-1], "", line, col)
        self.stack[-1].children.append(node)
        if low not in VOID_ELEMENTS:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        line, col = self.getpos()
        low = tag.lower()
        attr_dict = {}
        raw = []
        for key, value in attrs:
            if key is None:
                continue
            lk = key.lower()
            attr_dict[lk] = "" if value is None else value
            raw.append((lk, "" if value is None else value))
        node = Node(low, attr_dict, raw, [], self.stack[-1], "", line, col)
        self.stack[-1].children.append(node)

    def handle_endtag(self, tag):
        low = tag.lower()
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == low:
                self.stack = self.stack[:index]
                return

    def handle_data(self, data):
        if not data:
            return
        line, col = self.getpos()
        node = Node("#text", {}, [], [], self.stack[-1], data, line, col)
        self.stack[-1].children.append(node)

    def error(self, message):
        self.errors.append(message)

class Analyzer:
    def __init__(self, source_name, html_text, path="", run_external_validators=True, source_url=""):
        self.source_name = source_name
        self.path = path
        self.html_text = html_text
        self.source_url = self.normalize_public_url(source_url or path)
        self.findings = []
        self.accepted = []
        self.nodes = []
        self.id_map = {}
        self.labels_for = set()
        self.run_external_validators = run_external_validators
        self.w3c = self.new_w3c_report(run_external_validators)
        self.amaweb = self.new_amaweb_report(run_external_validators)

    def parse(self):
        parser = DOMParser()
        parser.feed(self.html_text)
        self.root = parser.root
        self.nodes = list(self.walk(self.root))
        for node in self.nodes:
            node_id = node.attrs.get("id")
            if node_id:
                self.id_map.setdefault(node_id, []).append(node)
            if node.tag == "label" and node.attrs.get("for"):
                self.labels_for.add(node.attrs.get("for"))

    def walk(self, node):
        for child in node.children:
            yield child
            yield from self.walk(child)

    def text_of(self, node):
        parts = []
        def collect(n):
            if n.tag == "#text":
                parts.append(n.data)
            for child in n.children:
                collect(child)
        collect(node)
        return self.clean(" ".join(parts))

    def clean(self, value):
        return re.sub(r"\s+", " ", html.unescape(value or "")).strip()

    def attr(self, node, name):
        return self.clean(node.attrs.get(name, ""))

    def normalize_public_url(self, value):
        value = self.clean(value or "")
        if not value:
            return ""
        parsed = urllib.parse.urlparse(value)
        if parsed.scheme in {"http", "https"} and parsed.netloc:
            return value
        return ""

    def add(self, level, rule, message, node=None, suggestion=""):
        self.findings.append({
            "level": level,
            "rule": rule,
            "message": message,
            "tag": "" if node is None else node.tag,
            "line": 0 if node is None else node.line,
            "col": 0 if node is None else node.col,
            "suggestion": suggestion
        })

    def ok(self, rule, message):
        self.accepted.append({"rule": rule, "message": message})

    def new_w3c_report(self, enabled):
        return {
            "enabled": bool(enabled),
            "html": self.new_w3c_test("HTML"),
            "css": self.new_w3c_test("CSS"),
            "global": {"score": None, "status": "pendente" if enabled else "desativado", "message": ""}
        }

    def new_w3c_test(self, name):
        return {
            "name": name,
            "score": None,
            "status": "pendente",
            "message": "",
            "errors": 0,
            "warnings": 0,
            "infos": 0,
            "items": []
        }

    def new_amaweb_report(self, enabled):
        return {
            "enabled": bool(enabled),
            "score": None,
            "status": "pendente" if enabled else "desativado",
            "message": "",
            "result_url": "",
            "source_url": self.source_url,
            "input_mode": "url" if self.source_url else "arquivo",
            "automation": "",
            "page_size": "",
            "elements_analyzed": None,
            "practices_identified": None,
            "errors": 0,
            "warnings": 0,
            "manual_review": 0,
            "accepted": 0,
            "items": []
        }

    def add_amaweb_item(self, level, message, suggestion=""):
        item = {"level": level, "message": self.clean(message), "suggestion": suggestion}
        self.amaweb["items"].append(item)
        if level == "erro":
            self.amaweb["errors"] += 1
        elif level == "revisar":
            self.amaweb["manual_review"] += 1
        elif level == "aceito":
            self.amaweb["accepted"] += 1
        else:
            self.amaweb["warnings"] += 1

    def finish_amaweb(self, status=None, message="", score=None):
        if status is None:
            status = "aprovado" if self.amaweb.get("errors", 0) == 0 and self.amaweb.get("manual_review", 0) == 0 else "com ocorrências"
        if score is None:
            score = self.amaweb.get("score")
        self.amaweb["score"] = score
        self.amaweb["status"] = status
        self.amaweb["message"] = message

    def add_w3c_item(self, test_key, level, message, line=0, col=0, suggestion=""):
        item = {
            "level": level,
            "message": message,
            "line": int(line or 0),
            "col": int(col or 0),
            "suggestion": suggestion
        }
        self.w3c[test_key]["items"].append(item)
        if level == "erro":
            self.w3c[test_key]["errors"] += 1
        elif level == "revisar":
            self.w3c[test_key]["warnings"] += 1
        else:
            self.w3c[test_key]["infos"] += 1

    def w3c_score(self, errors, warnings):
        return round(max(0, 10 - errors * 0.7 - warnings * 0.2), 1)

    def finish_w3c_test(self, test_key, status=None, message="", score=None):
        test = self.w3c[test_key]
        if status is None:
            status = "aprovado" if test.get("errors", 0) == 0 and test.get("warnings", 0) == 0 else "com ocorrências"
        if score is None and status not in {"não executado", "desativado"}:
            score = self.w3c_score(test.get("errors", 0), test.get("warnings", 0))
        test["score"] = score
        test["status"] = status
        test["message"] = message

    def finish_w3c_global(self):
        scores = []
        for key in ("html", "css"):
            value = self.w3c[key].get("score")
            if isinstance(value, (int, float)):
                scores.append(float(value))
        if not self.run_external_validators:
            self.w3c["global"] = {"score": None, "status": "desativado", "message": "Testes W3C online desativados nesta execução."}
        elif scores:
            score = round(sum(scores) / len(scores), 1)
            status = "aprovado" if score == 10 else "com ocorrências"
            self.w3c["global"] = {"score": score, "status": status, "message": "Média das notas W3C HTML e CSS executadas."}
        else:
            self.w3c["global"] = {"score": None, "status": "não executado", "message": "Nenhum teste W3C retornou nota nesta execução."}

    def accessible_name(self, node):
        if self.attr(node, "aria-label"):
            return self.attr(node, "aria-label")
        if self.attr(node, "aria-labelledby"):
            parts = []
            for ref in self.attr(node, "aria-labelledby").split():
                if ref in self.id_map:
                    parts.append(self.text_of(self.id_map[ref][0]))
            name = self.clean(" ".join(parts))
            if name:
                return name
        if node.tag == "img" and "alt" in node.attrs:
            return self.attr(node, "alt")
        text = self.text_of(node)
        if text:
            return text
        for key in ("value", "title", "placeholder"):
            if self.attr(node, key):
                return self.attr(node, key)
        return ""

    def node_role(self, node):
        role = self.attr(node, "role").lower()
        if role:
            return role.split()[0]
        if node.tag == "main":
            return "main"
        if node.tag == "nav":
            return "navigation"
        if node.tag == "aside":
            return "complementary"
        if node.tag == "footer":
            return "contentinfo"
        if node.tag == "header":
            return "banner"
        if node.tag == "section" and (self.attr(node, "aria-label") or self.attr(node, "aria-labelledby")):
            return "region"
        if node.tag == "form" and (self.attr(node, "aria-label") or self.attr(node, "aria-labelledby")):
            return "form"
        return ""

    def is_focusable(self, node):
        if self.attr(node, "tabindex") and self.attr(node, "tabindex") != "-1":
            return True
        if node.tag in {"button", "select", "textarea"}:
            return "disabled" not in node.attrs
        if node.tag == "a" and self.attr(node, "href"):
            return True
        if node.tag == "input":
            return self.attr(node, "type").lower() != "hidden" and "disabled" not in node.attrs
        return False

    def has_label(self, node):
        node_id = self.attr(node, "id")
        if node_id and node_id in self.labels_for:
            return True
        if self.attr(node, "aria-label") or self.attr(node, "aria-labelledby") or self.attr(node, "title"):
            return True
        ancestor = node.parent
        while ancestor is not None and ancestor.tag != "document":
            if ancestor.tag == "label":
                return True
            ancestor = ancestor.parent
        return False

    def analyze(self):
        self.parse()
        self.check_document_base()
        self.check_headings()
        self.check_links()
        self.check_images()
        self.check_forms_and_buttons()
        self.check_ids()
        self.check_aria()
        self.check_landmarks()
        self.check_skip_links()
        self.check_manual_items()
        self.check_external_validators()
        return self.build_report()

    def check_document_base(self):
        html_nodes = [n for n in self.nodes if n.tag == "html"]
        title_nodes = [n for n in self.nodes if n.tag == "title"]
        if not html_nodes:
            self.add("erro", "Estrutura HTML", "Não encontrei o elemento html.", suggestion="Inclua uma estrutura HTML completa com html, head e body.")
        else:
            lang = self.attr(html_nodes[0], "lang")
            if not lang:
                self.add("erro", "Idioma da página", "O elemento html não possui atributo lang.", html_nodes[0], "Defina lang=\"pt-BR\" ou o idioma real da página.")
            else:
                self.ok("Idioma da página", f"Idioma declarado como {lang}.")
        if not title_nodes or not self.text_of(title_nodes[0]):
            self.add("erro", "Título da página", "A página não possui título no elemento title.", suggestion="Inclua um título único e descritivo dentro de head.")
        else:
            self.ok("Título da página", "Elemento title encontrado.")

    def check_headings(self):
        headings = []
        for node in self.nodes:
            match = HEADING_RE.match(node.tag)
            if match:
                headings.append((int(match.group(1)), node, self.text_of(node)))
        h1s = [item for item in headings if item[0] == 1]
        if not h1s:
            self.add("erro", "Cabeçalho H1", "Identifiquei 0 cabeçalhos de nível 1. Deve haver um H1 por página.", suggestion="Inclua um H1 visível ou acessível que represente o tema principal da página.")
        elif len(h1s) > 1:
            self.add("revisar", "Cabeçalho H1", f"Identifiquei {len(h1s)} cabeçalhos H1.", h1s[1][1], "Mantenha um H1 principal e organize o restante como H2, H3 etc.")
        else:
            self.ok("Cabeçalho H1", "Há um cabeçalho H1 principal.")
        previous = 0
        for level, node, text in headings:
            if previous and level > previous + 1:
                self.add("erro", "Hierarquia de cabeçalhos", f"A sequência de cabeçalhos salta de H{previous} para H{level}.", node, "Use níveis consecutivos: H1 para o título principal, H2 para seções, H3 para subseções.")
            if previous == 0 and level > 1:
                self.add("erro", "Hierarquia de cabeçalhos", f"O primeiro cabeçalho encontrado é H{level}, antes de um H1.", node, "Comece a estrutura por H1 e avance de forma hierárquica.")
            if not text:
                self.add("erro", "Cabeçalho vazio", f"Há um {node.tag.upper()} sem texto acessível.", node, "Preencha o cabeçalho com texto descritivo.")
            previous = level

    def check_links(self):
        links = [n for n in self.nodes if n.tag == "a"]
        for node in links:
            href = self.attr(node, "href")
            name = self.accessible_name(node)
            title = self.attr(node, "title")
            visible = self.text_of(node)
            if not name:
                self.add("erro", "Link sem nome", "Encontrei um link sem texto acessível.", node, "Inclua texto visível, aria-label ou aria-labelledby.")
            if title and visible and self.clean(title).lower() == self.clean(visible).lower():
                self.add("erro", "Title repetido em link", "O atributo title do link apenas repete o texto já existente no próprio link.", node, "Remova o title redundante ou use title apenas para informação complementar real.")
            if href in {"#", "javascript:void(0)", "javascript:;"}:
                self.add("revisar", "Destino do link", "O link possui destino vazio ou genérico.", node, "Quando o elemento executa ação, prefira button; quando navega, informe um href real.")
        if links:
            self.ok("Links", f"{len(links)} links analisados.")

    def check_images(self):
        images = [n for n in self.nodes if n.tag == "img"]
        for node in images:
            if "alt" not in node.attrs:
                self.add("erro", "Imagem sem alternativa", "Imagem sem atributo alt.", node, "Inclua alt descritivo ou alt vazio quando a imagem for puramente decorativa.")
            elif self.attr(node, "alt") == "" and self.attr(node, "role") != "presentation":
                self.add("revisar", "Imagem decorativa", "Imagem com alt vazio. Confirme se ela é realmente decorativa.", node, "Se a imagem transmite informação, descreva o conteúdo no alt.")
        if images:
            self.ok("Imagens", f"{len(images)} imagens analisadas.")

    def check_forms_and_buttons(self):
        for node in self.nodes:
            if node.tag == "button":
                if not self.accessible_name(node):
                    self.add("erro", "Botão sem nome", "Botão sem nome acessível.", node, "Inclua texto visível, aria-label ou aria-labelledby.")
            if node.tag == "input":
                input_type = self.attr(node, "type").lower() or "text"
                if input_type in INPUT_NAME_TYPES and not self.accessible_name(node):
                    self.add("erro", "Controle sem nome", f"Input do tipo {input_type} sem nome acessível.", node, "Inclua value, alt, aria-label ou aria-labelledby.")
                if input_type in INPUT_LABEL_TYPES and not self.has_label(node):
                    self.add("erro", "Campo sem rótulo", f"Input do tipo {input_type} sem rótulo associado.", node, "Associe um label via for/id ou use aria-label/aria-labelledby.")
            if node.tag in {"select", "textarea"} and not self.has_label(node):
                self.add("erro", "Campo sem rótulo", f"Elemento {node.tag} sem rótulo associado.", node, "Associe um label via for/id ou use aria-label/aria-labelledby.")

    def check_ids(self):
        for id_value, nodes in self.id_map.items():
            if len(nodes) > 1:
                self.add("erro", "ID duplicado", f"O id '{id_value}' aparece {len(nodes)} vezes.", nodes[1], "Cada id deve ser único dentro da página.")

    def check_aria(self):
        for node in self.nodes:
            role = self.attr(node, "role").lower()
            if role:
                for role_item in role.split():
                    if role_item not in ROLE_VALID:
                        self.add("erro", "Role ARIA inválido", f"O role '{role_item}' não está na lista de roles ARIA reconhecidos.", node, "Use apenas roles válidos e necessários.")
            for name, value in node.attrs.items():
                if not name.startswith("aria-"):
                    continue
                if name not in ARIA_VALID:
                    self.add("erro", "ARIA inválido", f"A propriedade '{name}' não é uma propriedade ARIA reconhecida.", node, "Corrija o nome da propriedade ARIA ou remova o atributo.")
                    continue
                self.check_aria_context(node, name)
            if self.attr(node, "aria-hidden").lower() == "true" and self.is_focusable(node):
                self.add("erro", "ARIA hidden em foco", "Elemento focável está marcado como aria-hidden=true.", node, "Não esconda elementos focáveis de tecnologias assistivas.")

    def check_aria_context(self, node, name):
        role = self.node_role(node)
        tag = node.tag
        input_type = self.attr(node, "type").lower()
        interactive = tag in INTERACTIVE_TAGS or role in {"button", "link", "menuitem", "tab", "treeitem", "option", "checkbox", "radio", "switch", "slider", "combobox", "textbox"}
        if name == "aria-checked" and not (role in {"checkbox", "menuitemcheckbox", "radio", "menuitemradio", "switch", "option"} or input_type in {"checkbox", "radio"}):
            self.add("erro", "ARIA não permitido", "aria-checked foi usado em elemento sem papel compatível.", node, "Use aria-checked apenas em checkbox, radio, switch, option ou roles equivalentes.")
        if name == "aria-selected" and not (role in {"option", "row", "gridcell", "tab"} or tag == "option"):
            self.add("erro", "ARIA não permitido", "aria-selected foi usado em elemento sem papel compatível.", node, "Use aria-selected em option, tab, row ou gridcell.")
        if name in {"aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext"} and not (role in {"progressbar", "scrollbar", "slider", "spinbutton"} or input_type == "range" or tag in {"progress", "meter"}):
            self.add("erro", "ARIA não permitido", f"{name} foi usado em elemento sem papel de valor ajustável.", node, "Use atributos de valor apenas em slider, spinbutton, progressbar, scrollbar, progress ou meter.")
        if name == "aria-expanded" and not interactive:
            self.add("erro", "ARIA não permitido", "aria-expanded foi usado em elemento que não parece interativo.", node, "Aplique aria-expanded ao botão/link que controla a expansão.")
        if name == "aria-pressed" and not (tag == "button" or role == "button"):
            self.add("erro", "ARIA não permitido", "aria-pressed foi usado fora de botão ou role=button.", node, "Use aria-pressed apenas em botões alternáveis.")
        if name == "aria-modal" and role not in {"dialog", "alertdialog"}:
            self.add("erro", "ARIA não permitido", "aria-modal foi usado fora de dialog ou alertdialog.", node, "Aplique aria-modal apenas em diálogos modais.")

    def check_landmarks(self):
        landmarks = []
        for node in self.nodes:
            role = self.node_role(node)
            if role in {"main", "navigation", "complementary", "contentinfo", "banner", "search", "form", "region"}:
                landmarks.append((node, role))
        main_nodes = [node for node, role in landmarks if role == "main"]
        if len(main_nodes) == 0:
            self.add("erro", "Marco main", "Não encontrei nenhum elemento com semântica main.", suggestion="Use uma única tag main ou role=main para o conteúdo principal.")
        elif len(main_nodes) > 1:
            self.add("erro", "Marco main", f"Encontrei {len(main_nodes)} elementos com semântica main.", main_nodes[1], "Mantenha apenas um main por página.")
        else:
            self.ok("Marco main", "Há um único elemento com semântica main.")
        landmark_roles = {"main", "navigation", "complementary", "contentinfo", "banner", "search", "form", "region"}
        for node, role in landmarks:
            ancestor = node.parent
            while ancestor is not None and ancestor.tag != "document":
                ancestor_role = self.node_role(ancestor)
                if ancestor_role in landmark_roles:
                    if role in {"main", "contentinfo", "complementary"}:
                        self.add("erro", "Marco semântico aninhado", f"O elemento com semântica {role} está contido dentro de outro marco semântico ({ancestor_role}).", node, "Evite colocar main, footer/contentinfo ou aside/complementary dentro de outro marco estrutural quando isso prejudicar a navegação por leitor de tela.")
                    else:
                        self.add("revisar", "Marco semântico aninhado", f"O elemento com semântica {role} está dentro de {ancestor_role}.", node, "Confirme se a estrutura de landmarks continua clara para leitor de tela.")
                    break
                ancestor = ancestor.parent

    def check_skip_links(self):
        has_skip = False
        for node in self.nodes:
            if node.tag == "a":
                text = self.accessible_name(node).lower()
                href = self.attr(node, "href")
                if href.startswith("#") and ("conteúdo" in text or "conteudo" in text or "main" in text or "principal" in text):
                    has_skip = True
        if not has_skip:
            self.add("revisar", "Link de salto", "Não encontrei link de salto para o conteúdo principal.", suggestion="Inclua um link como 'Ir para o conteúdo' apontando para o main.")
        else:
            self.ok("Link de salto", "Link de salto identificado.")

    def check_manual_items(self):
        if re.search(r"<canvas\b", self.html_text, re.I):
            self.add("revisar", "Canvas", "A página usa canvas. O conteúdo renderizado pode exigir descrição textual equivalente.", suggestion="Inclua texto alternativo próximo ao canvas, aria-describedby ou painel descritivo sincronizado.")
        if re.search(r"<video\b|<audio\b", self.html_text, re.I):
            self.add("revisar", "Mídia", "A página usa áudio ou vídeo. Legendas, transcrição e controles precisam de revisão manual.", suggestion="Disponibilize legendas, transcrição e controles acessíveis.")

    def check_external_validators(self):
        if not self.run_external_validators:
            self.finish_w3c_test("html", "desativado", "Teste W3C HTML online desativado nesta execução.", None)
            self.finish_w3c_test("css", "desativado", "Teste W3C CSS online desativado nesta execução.", None)
            self.finish_w3c_global()
            self.finish_amaweb("desativado", "Teste AMAWeb online desativado nesta execução.", None)
            return
        if not W3C_SERVICE_STATE.get("html_blocked"):
            self.check_w3c_html_validator()
        else:
            self.finish_w3c_test("html", "não executado", W3C_SERVICE_STATE.get("html_reason", "Serviço W3C HTML indisponível nesta execução."), None)
        if not W3C_SERVICE_STATE.get("css_blocked"):
            self.check_w3c_css_validator()
        else:
            self.finish_w3c_test("css", "não executado", W3C_SERVICE_STATE.get("css_reason", "Serviço W3C CSS indisponível nesta execução."), None)
        self.finish_w3c_global()
        self.check_amaweb_validator()

    def wait_before_w3c_request(self):
        global LAST_W3C_REQUEST
        elapsed = time.monotonic() - LAST_W3C_REQUEST
        if elapsed < W3C_REQUEST_INTERVAL:
            time.sleep(W3C_REQUEST_INTERVAL - elapsed)

    def http_bytes(self, url, data=None, headers=None):
        global LAST_W3C_REQUEST
        self.wait_before_w3c_request()
        final_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
            "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
            "Connection": "close"
        }
        if headers:
            final_headers.update(headers)
        request = urllib.request.Request(url, data=data, headers=final_headers, method="POST" if data is not None else "GET")
        try:
            with urllib.request.urlopen(request, timeout=W3C_TIMEOUT) as response:
                raw = response.read()
            LAST_W3C_REQUEST = time.monotonic()
            return raw
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            LAST_W3C_REQUEST = time.monotonic()
            raise ValidatorRequestError(exc.code, exc.reason, body, url) from exc
        except urllib.error.URLError as exc:
            LAST_W3C_REQUEST = time.monotonic()
            reason = getattr(exc, "reason", exc)
            raise ValidatorRequestError(0, str(reason), "", url) from exc

    def http_json(self, url, data=None, headers=None):
        raw = self.http_bytes(url, data=data, headers=headers)
        return json.loads(raw.decode("utf-8", errors="replace"))

    def validator_error_text(self, exc):
        if exc.code in {403, 429}:
            return f"HTTP Error {exc.code}: {exc.reason}. O serviço público recusou a requisição automática nesta execução."
        if exc.code >= 500:
            return f"HTTP Error {exc.code}: {exc.reason}. O serviço público respondeu com instabilidade temporária."
        detail = self.clean(exc.body or "")
        if detail:
            if "just a moment" in detail.lower() or "cloudflare" in detail.lower():
                return f"HTTP Error {exc.code}: {exc.reason}. O serviço público ativou uma proteção automática e recusou a chamada."
            detail = detail[:180]
            return f"HTTP Error {exc.code}: {exc.reason}. {detail}" if exc.code else f"{exc.reason}. {detail}"
        return f"HTTP Error {exc.code}: {exc.reason}" if exc.code else exc.reason

    def check_w3c_html_validator(self):
        try:
            payload = self.request_w3c_html_validator()
        except ValidatorRequestError as exc:
            reason = self.validator_error_text(exc)
            if exc.code in {403, 429}:
                W3C_SERVICE_STATE["html_blocked"] = True
                W3C_SERVICE_STATE["html_reason"] = reason
            suggestion = "Se o arquivo for grande, publique a página e use Adicionar URL; o validador HTML do W3C impõe limite de envio para conteúdo local."
            self.add_w3c_item("html", "info", f"Teste online não executado pelo serviço externo: {reason}", suggestion=suggestion)
            self.finish_w3c_test("html", "não executado", reason, None)
            return
        except Exception as exc:
            reason = str(exc)
            self.add_w3c_item("html", "info", f"Teste online não executado pelo serviço externo: {reason}", suggestion="Verifique internet, proxy/firewall ou valide direto no validator.w3.org.")
            self.finish_w3c_test("html", "não executado", reason, None)
            return
        self.consume_w3c_html_payload(payload)

    def request_w3c_html_validator(self):
        data = self.html_text.encode("utf-8", errors="replace")
        if self.source_url:
            url = W3C_HTML_VALIDATOR_URL + "&doc=" + urllib.parse.quote(self.source_url, safe="")
            return self.http_json(url, headers={"Accept": "application/json, */*"})
        if len(data) <= W3C_HTML_DIRECT_MAX_BYTES:
            return self.http_json(
                W3C_HTML_VALIDATOR_URL,
                data=data,
                headers={
                    "Content-Type": "text/html; charset=utf-8",
                    "Accept": "application/json, */*"
                }
            )
        if len(data) <= W3C_HTML_UPLOAD_MAX_BYTES:
            body, content_type = self.make_multipart_upload_body(
                [("out", "json")],
                "file",
                self.source_name or "pagina.html",
                data,
                "text/html; charset=utf-8"
            )
            return self.http_json(
                W3C_HTML_VALIDATOR_URL,
                data=body,
                headers={
                    "Content-Type": content_type,
                    "Accept": "application/json, */*"
                }
            )
        size_mb = len(data) / (1024 * 1024)
        raise ValidatorRequestError(413, "Request Entity Too Large", f"Arquivo HTML com {size_mb:.2f} MB ultrapassou o limite aceito nesta chamada online do W3C.", W3C_HTML_VALIDATOR_URL)

    def make_multipart_upload_body(self, fields, file_field, filename, file_bytes, file_content_type):
        boundary = "----AcessMonitor" + str(int(time.time() * 1000))
        chunks = []
        for name, value in fields:
            chunks.append((f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n").encode("utf-8"))
        safe_filename = os.path.basename(filename or "arquivo.html").replace('"', "_")
        chunks.append((f"--{boundary}\r\nContent-Disposition: form-data; name=\"{file_field}\"; filename=\"{safe_filename}\"\r\nContent-Type: {file_content_type}\r\n\r\n").encode("utf-8"))
        chunks.append(file_bytes)
        chunks.append(f"\r\n--{boundary}--\r\n".encode("utf-8"))
        return b"".join(chunks), f"multipart/form-data; boundary={boundary}"

    def consume_w3c_html_payload(self, payload):
        messages = payload.get("messages", []) if isinstance(payload, dict) else []
        shown = 0
        for item in messages:
            if not isinstance(item, dict):
                continue
            item_type = str(item.get("type", "")).lower()
            subtype = str(item.get("subType", "")).lower()
            message = self.clean(item.get("message", ""))
            line = item.get("lastLine") or item.get("firstLine") or 0
            col = item.get("lastColumn") or item.get("firstColumn") or 0
            if item_type == "error":
                level = "erro"
            elif item_type in {"info", "warning"} or subtype == "warning":
                level = "revisar"
            else:
                continue
            if shown < MAX_EXTERNAL_FINDINGS:
                self.add_w3c_item(
                    "html",
                    level,
                    message or "Ocorrência retornada pelo Nu Html Checker.",
                    line,
                    col,
                    "Corrija a marcação HTML conforme o retorno do validator.w3.org."
                )
                shown += 1
            else:
                if level == "erro":
                    self.w3c["html"]["errors"] += 1
                elif level == "revisar":
                    self.w3c["html"]["warnings"] += 1
        total_occurrences = self.w3c["html"].get("errors", 0) + self.w3c["html"].get("warnings", 0)
        if total_occurrences == 0:
            self.finish_w3c_test("html", "aprovado", "Nenhum erro ou aviso retornado pelo validator.w3.org.")
        else:
            if total_occurrences > MAX_EXTERNAL_FINDINGS:
                self.add_w3c_item("html", "info", f"O retorno possui mais de {MAX_EXTERNAL_FINDINGS} ocorrências. O relatório exibiu apenas as primeiras para manter a leitura viável.", suggestion="Abra o relatório completo no validator.w3.org quando precisar da lista integral.")
            self.finish_w3c_test("html", "com ocorrências", f"{self.w3c['html'].get('errors', 0)} erro(s) e {self.w3c['html'].get('warnings', 0)} aviso(s) no W3C HTML Validator.")



    def check_amaweb_validator(self):
        source_url = self.source_url
        if source_url:
            self.check_amaweb_browser_url_validator(source_url)
            return
        self.check_amaweb_file_upload_validator()

    def check_amaweb_browser_url_validator(self, source_url):
        self.amaweb["source_url"] = source_url
        self.amaweb["input_mode"] = "url"
        try:
            import selenium
        except Exception:
            self.check_amaweb_url_validator(source_url)
            return
        try:
            page, current_url, mode = self.run_amaweb_browser_url(source_url, headless=True)
            if current_url:
                self.amaweb["result_url"] = current_url
            self.amaweb["automation"] = mode
            self.parse_amaweb_result(page)
            if self.amaweb_result_has_structured_data():
                return
            detail = self.amaweb.get("message") or "o relatório abriu, mas ainda não trouxe dados estruturados detectáveis"
            self.add_amaweb_item("info", f"Teste AMAWeb por URL não executado: {detail}", "O app faz uma única tentativa por arquivo/URL e segue para o próximo item.")
            self.finish_amaweb("não executado", detail, None)
        except Exception as exc:
            reason = str(exc)
            self.add_amaweb_item("info", f"Teste AMAWeb por URL não executado: {reason}", "O app faz uma única tentativa por arquivo/URL e segue para o próximo item.")
            self.finish_amaweb("não executado", reason, None)

    def check_amaweb_url_validator(self, source_url):
        encoded_url = urllib.parse.quote(source_url, safe="")
        result_url = AMAWEB_RESULTS_BASE_URL + encoded_url
        self.amaweb["source_url"] = source_url
        self.amaweb["result_url"] = result_url
        self.amaweb["input_mode"] = "url"
        try:
            raw = self.http_bytes(
                result_url,
                headers={
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Referer": AMAWEB_EVALUATOR_URL
                }
            )
            page = raw.decode("utf-8", errors="replace")
        except ValidatorRequestError as exc:
            reason = self.validator_error_text(exc)
            self.add_amaweb_item("info", f"Teste online por URL não executado pelo AMAWeb: {reason}", "Abra o link do AMAWeb manualmente para confirmar quando necessário.")
            self.finish_amaweb("não executado", reason, None)
            return
        except Exception as exc:
            reason = str(exc)
            self.add_amaweb_item("info", f"Teste online por URL não executado pelo AMAWeb: {reason}", "Verifique internet, proxy/firewall ou valide direto no AMAWeb.")
            self.finish_amaweb("não executado", reason, None)
            return
        self.parse_amaweb_result(page)

    def check_amaweb_file_upload_validator(self):
        self.amaweb["input_mode"] = "arquivo"
        try:
            import selenium
        except Exception as exc:
            reason = f"O modo de envio de arquivo do AMAWeb precisa do pacote Selenium instalado no Python: {exc}"
            self.add_amaweb_item("info", reason, "Instale Selenium no mesmo Python que executa este app e rode a análise novamente.")
            self.finish_amaweb("não executado", reason, None)
            return
        try:
            page, current_url, mode = self.run_amaweb_browser_upload(headless=True)
            if current_url:
                self.amaweb["result_url"] = current_url
            self.amaweb["automation"] = mode
            self.parse_amaweb_result(page)
            if self.amaweb_result_has_structured_data():
                return
            detail = self.amaweb.get("message") or "o relatório abriu, mas ainda não trouxe dados estruturados detectáveis"
            self.add_amaweb_item("info", f"Teste AMAWeb por envio de arquivo não executado: {detail}", "O app faz uma única tentativa e fecha o Chrome assim que obtém dados ou quando a tentativa falha.")
            self.finish_amaweb("não executado", detail, None)
        except Exception as exc:
            reason = str(exc)
            self.add_amaweb_item("info", f"Teste AMAWeb por envio de arquivo não executado: {reason}", "O app faz uma única tentativa e fecha o Chrome assim que obtém dados ou quando a tentativa falha.")
            self.finish_amaweb("não executado", reason, None)

    def amaweb_result_has_structured_data(self):
        return (
            self.amaweb.get("score") is not None
            or self.amaweb.get("elements_analyzed") is not None
            or self.amaweb.get("practices_identified") is not None
            or self.amaweb.get("errors", 0) > 0
            or self.amaweb.get("manual_review", 0) > 0
            or self.amaweb.get("accepted", 0) > 0
            or any(item.get("level") in {"erro", "revisar", "aceito"} for item in self.amaweb.get("items", []))
        )

    def run_amaweb_browser_url(self, source_url, headless=True):
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.support.ui import WebDriverWait
        driver = None
        try:
            options = Options()
            if headless:
                options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1366,900")
            options.add_argument("--no-first-run")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-blink-features=AutomationControlled")
            options.add_argument("--lang=pt-BR")
            options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
            driver = webdriver.Chrome(options=options)
            try:
                driver.execute_cdp_cmd("Network.enable", {})
            except Exception:
                pass
            driver.set_page_load_timeout(AMAWEB_BROWSER_TIMEOUT)
            wait = WebDriverWait(driver, AMAWEB_BROWSER_TIMEOUT)
            driver.get(AMAWEB_EVALUATOR_URL)
            wait.until(lambda d: self.amaweb_page_loaded(d))
            self.try_click_amaweb_text(driver, "Inserir URL")
            url_input = wait.until(lambda d: self.find_amaweb_url_input(d))
            driver.execute_script("arguments[0].scrollIntoView({block:'center', inline:'center'});", url_input)
            try:
                url_input.clear()
            except Exception:
                pass
            url_input.send_keys(source_url)
            self.dispatch_amaweb_text_change(driver, url_input)
            if not self.try_click_amaweb_submit(driver):
                raise RuntimeError("não encontrei o botão Iniciar avaliação habilitado no AMAWeb.")
            self.wait_for_amaweb_final_result(driver, timeout=AMAWEB_BROWSER_TIMEOUT)
            page = self.choose_best_amaweb_page(driver) + self.collect_amaweb_browser_data(driver)
            current_url = driver.current_url or ""
            body_text = ""
            try:
                body_text = driver.find_element(By.TAG_NAME, "body").text or ""
            except Exception:
                pass
            lower = (body_text or self.html_to_text(page)).lower()
            if not self.amaweb_text_looks_like_result(lower) and "/avaliador/results/" not in current_url:
                raise RuntimeError("URL enviada, mas o AMAWeb não abriu um relatório detectável. Texto atual: " + self.clean(body_text)[:320])
            return page, current_url, "selenium_url_headless" if headless else "selenium_url_visible"
        finally:
            try:
                if driver is not None:
                    driver.quit()
            except Exception:
                pass

    def run_amaweb_browser_upload(self, headless=True):
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.support.ui import WebDriverWait
        import tempfile
        temp_path = ""
        download_dir = ""
        driver = None
        try:
            upload_path = ""
            if self.path and os.path.isfile(self.path):
                upload_path = os.path.abspath(self.path)
            else:
                safe_name = re.sub(r"[^A-Za-z0-9_.-]+", "_", self.source_name or "pagina.html").strip("._") or "pagina.html"
                if not safe_name.lower().endswith((".html", ".htm")):
                    safe_name += ".html"
                with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix="_" + safe_name, delete=False) as temp_file:
                    temp_file.write(self.html_text or "")
                    temp_path = temp_file.name
                upload_path = temp_path
            if not upload_path or not os.path.isfile(upload_path):
                raise RuntimeError("não encontrei um arquivo HTML real para enviar ao AMAWeb.")
            download_dir = tempfile.mkdtemp(prefix="amaweb_download_")
            options = Options()
            prefs = {
                "download.default_directory": download_dir,
                "download.prompt_for_download": False,
                "download.directory_upgrade": True,
                "safebrowsing.enabled": True
            }
            options.add_experimental_option("prefs", prefs)
            if headless:
                options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1366,900")
            options.add_argument("--no-first-run")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-blink-features=AutomationControlled")
            options.add_argument("--lang=pt-BR")
            options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
            driver = webdriver.Chrome(options=options)
            try:
                driver.execute_cdp_cmd("Network.enable", {})
                driver.execute_cdp_cmd("Page.setDownloadBehavior", {"behavior": "allow", "downloadPath": download_dir})
            except Exception:
                pass
            driver.set_page_load_timeout(AMAWEB_BROWSER_TIMEOUT)
            wait = WebDriverWait(driver, AMAWEB_BROWSER_TIMEOUT)
            driver.get(AMAWEB_EVALUATOR_URL)
            wait.until(lambda d: self.amaweb_page_loaded(d))
            self.try_click_amaweb_text(driver, "Enviar arquivo HTML")
            time.sleep(0.1)
            file_input = wait.until(lambda d: self.find_amaweb_file_input(d))
            self.make_amaweb_file_input_ready(driver, file_input)
            file_input.send_keys(upload_path)
            self.dispatch_amaweb_file_change(driver, file_input)
            try:
                file_count = driver.execute_script("return arguments[0].files ? arguments[0].files.length : 0;", file_input)
            except Exception:
                file_count = 0
            if not file_count:
                raise RuntimeError("o campo de upload do AMAWeb foi encontrado, mas o arquivo não ficou incorporado ao input.")
            clicked = self.try_click_amaweb_submit(driver)
            if not clicked:
                clicked = self.try_submit_amaweb_form(driver, file_input)
            if not clicked:
                raise RuntimeError("o arquivo foi incorporado, mas não encontrei uma forma de iniciar a avaliação no AMAWeb.")
            self.wait_for_amaweb_final_result(driver, timeout=AMAWEB_BROWSER_TIMEOUT)
            page = self.choose_best_amaweb_page(driver) + self.collect_amaweb_browser_data(driver)
            current_url = driver.current_url or ""
            body_text = self.safe_body_text(driver)
            lower = (body_text or self.html_to_text(page)).lower()
            if not self.amaweb_text_looks_like_result(lower) and "/avaliador/results/" not in current_url:
                raise RuntimeError("arquivo enviado, mas o AMAWeb não abriu um relatório detectável. Texto atual: " + self.clean(body_text)[:520])
            return page, current_url, "selenium_upload_headless" if headless else "selenium_upload_visible"
        finally:
            try:
                if driver is not None:
                    driver.quit()
            except Exception:
                pass
            try:
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)
            except Exception:
                pass
            try:
                if download_dir and os.path.isdir(download_dir):
                    import shutil
                    shutil.rmtree(download_dir, ignore_errors=True)
            except Exception:
                pass

    def run_amaweb_browser_code(self, headless=True):
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.support.ui import WebDriverWait
        driver = None
        try:
            options = Options()
            if headless:
                options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1366,900")
            options.add_argument("--no-first-run")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-blink-features=AutomationControlled")
            options.add_argument("--lang=pt-BR")
            options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
            driver = webdriver.Chrome(options=options)
            try:
                driver.execute_cdp_cmd("Network.enable", {})
            except Exception:
                pass
            driver.set_page_load_timeout(AMAWEB_BROWSER_TIMEOUT)
            wait = WebDriverWait(driver, AMAWEB_BROWSER_TIMEOUT)
            driver.get(AMAWEB_EVALUATOR_URL)
            wait.until(lambda d: self.amaweb_page_loaded(d))
            self.try_click_amaweb_text(driver, "Inserir código HTML")
            textarea = wait.until(lambda d: self.find_amaweb_textarea(d))
            driver.execute_script("arguments[0].scrollIntoView({block:'center', inline:'center'});", textarea)
            try:
                textarea.clear()
            except Exception:
                pass
            textarea.send_keys(self.html_text or "")
            self.dispatch_amaweb_text_change(driver, textarea)
            self.try_click_amaweb_submit(driver)
            try:
                wait.until(lambda d: self.amaweb_browser_result_ready(d))
            except Exception:
                time.sleep(8)
            page = self.choose_best_amaweb_page(driver) + self.collect_amaweb_browser_data(driver)
            current_url = driver.current_url or ""
            body_text = ""
            try:
                body_text = driver.find_element(By.TAG_NAME, "body").text or ""
            except Exception:
                pass
            lower = (body_text or self.html_to_text(page)).lower()
            if not self.amaweb_text_looks_like_result(lower) and "/avaliador/results/" not in current_url:
                raise RuntimeError("código HTML enviado, mas o AMAWeb não abriu um relatório detectável. Texto atual: " + self.clean(body_text)[:320])
            return page, current_url, "selenium_codigo_headless" if headless else "selenium_codigo_visible"
        finally:
            try:
                if driver is not None:
                    driver.quit()
            except Exception:
                pass

    def collect_amaweb_browser_data(self, driver):
        try:
            storage_json = driver.execute_script("""
                const pick = (store) => {
                  const out = {};
                  const keys = ['amp_evaluation_data', 'amp_evaluation_url'];
                  for (const k of keys) {
                    try {
                      const v = store.getItem(k);
                      if (v !== null && v !== undefined) out[k] = v;
                    } catch (e) {}
                  }
                  return out;
                };
                return JSON.stringify({
                  url: location.href,
                  title: document.title,
                  text: document.body ? document.body.innerText : '',
                  localStorage: pick(localStorage),
                  sessionStorage: pick(sessionStorage)
                });
            """)
            if storage_json:
                return "\n<pre data-acessmonitor-amaweb-dump=\"1\">" + html.escape(storage_json[:650000]) + "</pre>"
        except Exception:
            pass
        return ""

    def try_download_amaweb_data(self, driver, download_dir):
        if not download_dir:
            return ""
        try:
            from selenium.webdriver.common.by import By
            labels = ["Baixar dados", "Download", "JSON", "Baixar JSON", "Exportar"]
            before = set(os.listdir(download_dir)) if os.path.isdir(download_dir) else set()
            clicked = False
            for label in labels:
                xpaths = [
                    "//a[contains(normalize-space(.), " + repr(label) + ")]",
                    "//button[contains(normalize-space(.), " + repr(label) + ")]",
                    "//*[@role='button' and contains(normalize-space(.), " + repr(label) + ")]"
                ]
                for xpath in xpaths:
                    for element in driver.find_elements(By.XPATH, xpath):
                        try:
                            driver.execute_script("arguments[0].scrollIntoView({block:'center', inline:'center'});", element)
                            try:
                                element.click()
                            except Exception:
                                driver.execute_script("arguments[0].click();", element)
                            clicked = True
                            time.sleep(0.1)
                            break
                        except Exception:
                            continue
                    if clicked:
                        break
                if clicked:
                    break
            if not clicked:
                return ""
            deadline = time.monotonic() + 30
            while time.monotonic() < deadline:
                if os.path.isdir(download_dir):
                    files = [name for name in os.listdir(download_dir) if not name.endswith(".crdownload") and name not in before]
                    if files:
                        files.sort(key=lambda name: os.path.getmtime(os.path.join(download_dir, name)), reverse=True)
                        path = os.path.join(download_dir, files[0])
                        raw = open(path, "rb").read()
                        for enc in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
                            try:
                                return raw.decode(enc)
                            except UnicodeDecodeError:
                                pass
                        return raw.decode("utf-8", errors="replace")
                time.sleep(0.1)
        except Exception:
            return ""
        return ""

    def amaweb_page_loaded(self, driver):
        try:
            text_value = driver.find_element("tag name", "body").text or ""
            lower = text_value.lower()
            return "amaweb" in lower and ("avaliador" in lower or "vamos avaliar" in lower or "enviar arquivo" in lower)
        except Exception:
            return False

    def try_click_amaweb_text(self, driver, text_value):
        try:
            from selenium.webdriver.common.by import By
            xpaths = [
                "//button[contains(normalize-space(.), " + repr(text_value) + ")]",
                "//*[@role='tab' and contains(normalize-space(.), " + repr(text_value) + ")]",
                "//*[@role='button' and contains(normalize-space(.), " + repr(text_value) + ")]",
                "//a[contains(normalize-space(.), " + repr(text_value) + ")]",
                "//*[contains(normalize-space(.), " + repr(text_value) + ")]"
            ]
            for xpath in xpaths:
                elements = driver.find_elements(By.XPATH, xpath)
                for element in elements:
                    try:
                        driver.execute_script("arguments[0].scrollIntoView({block:'center', inline:'center'});", element)
                        try:
                            element.click()
                        except Exception:
                            driver.execute_script("arguments[0].click();", element)
                        time.sleep(0.1)
                        return True
                    except Exception:
                        continue
        except Exception:
            pass
        return False

    def find_amaweb_url_input(self, driver):
        try:
            from selenium.webdriver.common.by import By
            selectors = [
                "input[type='url']",
                "input[name*='url' i]",
                "input[placeholder*='URL' i]",
                "input[aria-label*='URL' i]",
                "input[type='text']"
            ]
            for selector in selectors:
                inputs = driver.find_elements(By.CSS_SELECTOR, selector)
                for item in inputs:
                    try:
                        if item.is_displayed() and item.is_enabled():
                            return item
                    except Exception:
                        return item
        except Exception:
            pass
        return False

    def find_amaweb_file_input(self, driver):
        try:
            from selenium.webdriver.common.by import By
            selectors = [
                "input[type='file'][accept*='html']",
                "input[type='file'][accept*='.html']",
                "input[type='file']"
            ]
            for selector in selectors:
                inputs = driver.find_elements(By.CSS_SELECTOR, selector)
                for item in inputs:
                    return item
        except Exception:
            pass
        return False

    def find_amaweb_textarea(self, driver):
        try:
            from selenium.webdriver.common.by import By
            selectors = [
                "textarea",
                "[contenteditable='true']",
                "input[name*='html' i]"
            ]
            for selector in selectors:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                for item in elements:
                    return item
        except Exception:
            pass
        return False

    def dispatch_amaweb_text_change(self, driver, element):
        try:
            driver.execute_script("arguments[0].dispatchEvent(new Event('input', {bubbles:true})); arguments[0].dispatchEvent(new Event('change', {bubbles:true}));", element)
            time.sleep(0.1)
        except Exception:
            pass

    def make_amaweb_file_input_ready(self, driver, file_input):
        driver.execute_script("arguments[0].removeAttribute('hidden'); arguments[0].removeAttribute('disabled'); arguments[0].style.display='block'; arguments[0].style.visibility='visible'; arguments[0].style.opacity=1; arguments[0].style.width='1px'; arguments[0].style.height='1px'; arguments[0].style.position='fixed'; arguments[0].style.left='0'; arguments[0].style.top='0';", file_input)

    def dispatch_amaweb_file_change(self, driver, file_input):
        try:
            driver.execute_script("arguments[0].dispatchEvent(new Event('input', {bubbles:true})); arguments[0].dispatchEvent(new Event('change', {bubbles:true}));", file_input)
            time.sleep(0.1)
        except Exception:
            pass

    def send_amaweb_file(self, file_input, temp_path, driver):
        self.make_amaweb_file_input_ready(driver, file_input)
        file_input.send_keys(temp_path)
        self.dispatch_amaweb_file_change(driver, file_input)

    def try_click_amaweb_submit(self, driver):
        try:
            from selenium.webdriver.common.by import By
            selectors = [
                "//button[contains(normalize-space(.), 'Iniciar avaliação')]",
                "//button[contains(normalize-space(.), 'Iniciar avaliacao')]",
                "//button[contains(normalize-space(.), 'Avaliar')]",
                "//button[contains(normalize-space(.), 'Enviar')]",
                "//*[@role='button' and contains(normalize-space(.), 'Iniciar avaliação')]",
                "//*[@role='button' and contains(normalize-space(.), 'Iniciar avaliacao')]",
                "//input[@type='submit']",
                "//button[@type='submit']"
            ]
            for xpath in selectors:
                elements = driver.find_elements(By.XPATH, xpath)
                for element in elements:
                    try:
                        disabled = element.get_attribute("disabled") or element.get_attribute("aria-disabled")
                        if disabled and str(disabled).lower() not in {"false", "0", "none"}:
                            continue
                        driver.execute_script("arguments[0].scrollIntoView({block:'center', inline:'center'});", element)
                        try:
                            element.click()
                        except Exception:
                            driver.execute_script("arguments[0].click();", element)
                        return True
                    except Exception:
                        continue
        except Exception:
            pass
        return False

    def try_submit_amaweb_form(self, driver, element):
        try:
            result = driver.execute_script("""
                let el = arguments[0];
                let form = el.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
                    if (typeof form.requestSubmit === 'function') { form.requestSubmit(); }
                    else { form.submit(); }
                    return true;
                }
                return false;
            """, element)
            return bool(result)
        except Exception:
            return False

    def amaweb_text_looks_like_result(self, lower):
        if not lower:
            return False
        result_markers = [
            "nota",
            "elementos analisados",
            "práticas identificadas",
            "praticas identificadas",
            "itens a corrigir",
            "itens para revisar",
            "critério de sucesso",
            "criterio de sucesso",
            "baixar dados"
        ]
        return any(marker in lower for marker in result_markers) and ("amaweb" in lower or "avaliador" in lower)

    def amaweb_browser_result_ready(self, driver):
        try:
            text_value = self.safe_body_text(driver)
            lower = text_value.lower()
            if self.amaweb_text_has_structured_result(lower):
                return True
            current_url = driver.current_url or ""
            if "/avaliador/results/" in current_url and self.amaweb_text_looks_like_result(lower):
                return True
        except Exception:
            pass
        return False
    def amaweb_text_has_structured_result(self, lower):
        if not lower:
            return False
        structured_markers = [
            "elementos analisados",
            "práticas identificadas",
            "praticas identificadas",
            "nota de acessibilidade",
            "nota amaweb",
            "itens de acessibilidade a corrigir",
            "itens para revisar",
            "práticas aceitas",
            "praticas aceitas"
        ]
        return any(marker in lower for marker in structured_markers)

    def amaweb_browser_has_ready_payload(self, driver):
        try:
            raw = driver.execute_script("""
                const get = (store) => {
                  try { return store.getItem('amp_evaluation_data') || ''; }
                  catch (e) { return ''; }
                };
                return get(localStorage) || get(sessionStorage) || '';
            """)
            payload = self.load_amaweb_evaluation_payload(raw)
            if isinstance(payload, dict):
                data = ((payload.get('evaluation') or {}).get('data') or {})
                info = ((data.get('tot') or {}).get('info') or {})
                if info.get('score') is not None or info.get('htmlTags') is not None or data.get('tot') is not None:
                    return True
        except Exception:
            pass
        try:
            lower = self.safe_body_text(driver).lower()
            if self.amaweb_text_has_structured_result(lower):
                return True
            if 'nota:' in lower and ('elementos analisados' in lower or 'práticas identificadas' in lower or 'praticas identificadas' in lower):
                return True
        except Exception:
            pass
        return False

    def wait_for_amaweb_final_result(self, driver, timeout=None):
        timeout = timeout or AMAWEB_BROWSER_TIMEOUT
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            try:
                current_url = driver.current_url or ""
            except Exception:
                current_url = ""
            if self.amaweb_browser_has_ready_payload(driver):
                return True
            body_text = self.safe_body_text(driver)
            lower = body_text.lower()
            if "/avaliador/results/" in current_url and self.amaweb_text_has_structured_result(lower):
                return True
            if "/avaliador/results/" in current_url and "nota" in lower and ("elementos analisados" in lower or "práticas identificadas" in lower or "praticas identificadas" in lower):
                return True
            time.sleep(0.25)
        raise RuntimeError("o AMAWeb não retornou dados estruturados dentro da tentativa única.")

    def choose_best_amaweb_page(self, driver):
        try:
            body_text = driver.find_element("tag name", "body").text or ""
        except Exception:
            body_text = ""
        page_source = driver.page_source or ""
        if body_text and len(body_text) > len(self.html_to_text(page_source)):
            return "<html><body>" + html.escape(body_text) + "</body></html>"
        return page_source

    def parse_amaweb_result(self, page):
        text = self.html_to_text(page)
        if not text:
            self.finish_amaweb("não executado", "O AMAWeb retornou uma página sem texto interpretável.", None)
            return
        lower = text.lower()
        if "avaliador" not in lower and "amaweb" not in lower:
            self.finish_amaweb("não executado", "A resposta recebida não parece ser um relatório do AMAWeb.", None)
            return
        self.amaweb["page_size"] = self.regex_first(text, [r"Tamanho da página:\s*([^\n|]+)", r"Tamanho da pagina:\s*([^\n|]+)"])
        elements = self.regex_first_number(text, [
            r"Elementos analisados:\s*(\d+)",
            r'"(?:elementsAnalyzed|elementosAnalisados|elementos_analisados|totalElements|total_elementos)"\s*:\s*"?(\d+)"?'
        ])
        practices = self.regex_first_number(text, [
            r"Práticas identificadas:\s*(\d+)",
            r"Praticas identificadas:\s*(\d+)",
            r'"(?:practicesIdentified|praticasIdentificadas|praticas_identificadas|totalPractices|total_praticas)"\s*:\s*"?(\d+)"?'
        ])
        if elements is not None:
            self.amaweb["elements_analyzed"] = int(elements)
        if practices is not None:
            self.amaweb["practices_identified"] = int(practices)
        score = self.extract_amaweb_score(text, page)
        if score is not None:
            self.amaweb["score"] = score
        parsed_counts = self.extract_amaweb_counts(text, page)
        for key, value in parsed_counts.items():
            if value is not None:
                self.amaweb[key] = value
        self.collect_amaweb_items(text)
        if not self.amaweb.get("items") and score is None and elements is None and practices is None:
            self.add_amaweb_item("info", "O AMAWeb foi acessado, mas o resultado detalhado não pôde ser extraído automaticamente da página retornada.", "Use o link do relatório AMAWeb salvo no JSON/HTML para conferir a avaliação completa.")
            self.finish_amaweb("executado parcialmente", "Relatório AMAWeb acessado, mas sem dados estruturados suficientes para extrair nota e ocorrências.", score)
            return
        message_parts = []
        if self.amaweb.get("elements_analyzed") is not None:
            message_parts.append(f"{self.amaweb['elements_analyzed']} elemento(s) analisado(s)")
        if self.amaweb.get("practices_identified") is not None:
            message_parts.append(f"{self.amaweb['practices_identified']} prática(s) identificada(s)")
        if self.amaweb.get("result_url"):
            message_parts.append("link do relatório AMAWeb armazenado")
        message = ", ".join(message_parts) or "Relatório AMAWeb processado."
        self.finish_amaweb(None, message, score)

    def html_to_text(self, page):
        page = re.sub(r"<script\b[^>]*>.*?</script>", " ", page, flags=re.I | re.S)
        page = re.sub(r"<style\b[^>]*>.*?</style>", " ", page, flags=re.I | re.S)
        page = re.sub(r"<br\s*/?>", "\n", page, flags=re.I)
        page = re.sub(r"</(p|div|section|article|li|h[1-6]|tr|td|th)>", "\n", page, flags=re.I)
        page = re.sub(r"<[^>]+>", " ", page)
        page = html.unescape(page)
        page = re.sub(r"[ \t\r\f\v]+", " ", page)
        page = re.sub(r"\n\s+", "\n", page)
        page = re.sub(r"\n{3,}", "\n\n", page)
        return page.strip()

    def regex_first(self, text, patterns):
        for pattern in patterns:
            match = re.search(pattern, text, flags=re.I)
            if match:
                return self.clean(match.group(1))
        return ""

    def regex_first_number(self, text, patterns):
        value = self.regex_first(text, patterns)
        if not value:
            return None
        try:
            return int(re.sub(r"\D+", "", value))
        except ValueError:
            return None

    def extract_amaweb_counts(self, text, page):
        source = text + "\n" + page
        patterns = {
            "errors": [r"Erros?\s*[:\-]?\s*(\d+)", r'"(?:errors|erros)"\s*:\s*"?(\d+)"?'],
            "manual_review": [r"Revisar(?:\s+manualmente)?\s*[:\-]?\s*(\d+)", r'"(?:manualReview|manual_review|revisar|avisos)"\s*:\s*"?(\d+)"?'],
            "accepted": [r"Aceitos?\s*[:\-]?\s*(\d+)", r'"(?:accepted|aceitos|aprovados)"\s*:\s*"?(\d+)"?']
        }
        out = {}
        for key, pats in patterns.items():
            value = self.regex_first_number(source, pats)
            if value is not None:
                out[key] = int(value)
        return out

    def extract_amaweb_score(self, text, page):
        patterns = [
            r"Nota(?:\s+(?:global|da página|da pagina|final|de acessibilidade))?\s*[:\-]?\s*([0-9]+(?:[,.][0-9]+)?)",
            r"Pontuação(?:\s+(?:global|da página|da pagina|final))?\s*[:\-]?\s*([0-9]+(?:[,.][0-9]+)?)",
            r"Score(?:\s+(?:global|final))?\s*[:\-]?\s*([0-9]+(?:[,.][0-9]+)?)",
            r"(?:nota|score|pontuacao|pontuação)[^0-9]{0,25}([0-9]+(?:[,.][0-9]+)?)"
        ]
        for pattern in patterns:
            match = re.search(pattern, text, flags=re.I)
            if match:
                return self.normalize_score(match.group(1))
        search_space = html.unescape(page or "")
        json_patterns = [
            r'"(?:score|nota|pontuacao|pontuação|grade|rating)"\s*:\s*"?([0-9]+(?:[,.][0-9]+)?)"?',
            r"'(?:score|nota|pontuacao|pontuação|grade|rating)'\s*:\s*'?([0-9]+(?:[,.][0-9]+)?)'?"
        ]
        for pattern in json_patterns:
            match = re.search(pattern, search_space, flags=re.I)
            if match:
                return self.normalize_score(match.group(1))
        return None

    def normalize_score(self, value):
        try:
            number = float(str(value).replace(",", "."))
        except ValueError:
            return None
        if number > 10 and number <= 100:
            number = number / 10
        if number < 0:
            number = 0
        if number > 10:
            number = 10
        return round(number, 1)

    def collect_amaweb_items(self, text):
        lines = [self.clean(line) for line in text.splitlines()]
        lines = [line for line in lines if line]
        current_section = ""
        accepted_labels = {"aceito", "aceitos", "aprovado", "aprovados"}
        review_labels = {"revisar manualmente", "revisar", "aviso", "avisos"}
        error_labels = {"erro", "erros"}
        ignored = {"amaweb", "avaliador", "avaliação", "avaliacao", "avaliar novamente", "nova avaliação", "nova avaliacao", "ver no manual amaweb", "detalhar item", "apontar no código fonte", "apontar no codigo fonte"}
        for line in lines:
            low = line.lower().strip(" :")
            if low in error_labels:
                current_section = "erro"
                continue
            if low in review_labels:
                current_section = "revisar"
                continue
            if low in accepted_labels:
                current_section = "aceito"
                continue
            if not current_section:
                continue
            if len(line) < 18 or low in ignored or low.startswith("critério de sucesso") or low.startswith("criterio de sucesso") or low.startswith("técnica do wcag") or low.startswith("tecnica do wcag"):
                continue
            if len(self.amaweb["items"]) >= MAX_EXTERNAL_FINDINGS:
                break
            self.add_amaweb_item(current_section, line, "Confira o item completo no relatório do AMAWeb.")

    def extract_css_sources(self):
        items = []
        for index, match in enumerate(re.finditer(r"<style\b[^>]*>(.*?)</style>", self.html_text, re.I | re.S), 1):
            css_text = html.unescape(match.group(1) or "").strip()
            if css_text:
                items.append((f"style interno {index}", css_text))
        for index, match in enumerate(re.finditer(r"\sstyle\s*=\s*([\"'])(.*?)\1", self.html_text, re.I | re.S), 1):
            css_text = html.unescape(match.group(2) or "").strip()
            if css_text:
                items.append((f"style inline {index}", f".inline_style_{index}{{{css_text}}}"))
        base_dir = os.path.dirname(os.path.abspath(self.path)) if self.path else ""
        if base_dir:
            for node in self.nodes:
                if node.tag != "link":
                    continue
                rel = self.attr(node, "rel").lower()
                href = self.attr(node, "href")
                if "stylesheet" not in rel or not href:
                    continue
                parsed = urllib.parse.urlparse(href)
                if href.startswith("data:"):
                    continue
                if parsed.scheme in {"http", "https"} or href.startswith("//"):
                    css_url = href if parsed.scheme else "https:" + href
                    try:
                        raw = self.http_bytes(css_url, headers={"Accept": "text/css,*/*;q=0.8"})
                        css_text = raw.decode("utf-8", errors="replace")
                        if css_text.strip():
                            items.append((css_url, css_text))
                    except Exception as exc:
                        self.add_w3c_item("css", "revisar", f"Não consegui baixar o CSS externo referenciado em link: {href}. {exc}", getattr(node, "line", 0), getattr(node, "col", 0), "Se o CSS é externo, valide por URL pública ou confira se ele permite acesso direto.")
                    continue
                if self.source_url:
                    css_url = urllib.parse.urljoin(self.source_url, href)
                    try:
                        raw = self.http_bytes(css_url, headers={"Accept": "text/css,*/*;q=0.8"})
                        css_text = raw.decode("utf-8", errors="replace")
                        if css_text.strip():
                            items.append((css_url, css_text))
                    except Exception as exc:
                        self.add_w3c_item("css", "revisar", f"Não consegui baixar o CSS relativo da URL pública: {href}. {exc}", getattr(node, "line", 0), getattr(node, "col", 0), "Confirme se o caminho relativo está acessível publicamente.")
                    continue
                css_path = os.path.normpath(os.path.join(base_dir, urllib.parse.unquote(parsed.path)))
                if not css_path.startswith(base_dir) or not os.path.isfile(css_path):
                    self.add_w3c_item("css", "revisar", f"Não encontrei o CSS local referenciado em link: {href}", getattr(node, "line", 0), getattr(node, "col", 0), "Confirme se o caminho do arquivo CSS existe na pasta analisada.")
                    continue
                try:
                    css_text = self.read_text_file(css_path)
                except Exception as exc:
                    self.add_w3c_item("css", "revisar", f"Não consegui ler o CSS local {href}: {exc}", getattr(node, "line", 0), getattr(node, "col", 0), "Verifique permissões e codificação do arquivo CSS.")
                    continue
                if css_text.strip():
                    items.append((href, css_text))
        return items

    def read_text_file(self, path):
        raw = open(path, "rb").read()
        for enc in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
            try:
                return raw.decode(enc)
            except UnicodeDecodeError:
                pass
        return raw.decode("utf-8", errors="replace")

    def check_w3c_css_validator(self):
        try:
            if self.source_url:
                root = self.request_w3c_css_uri_validator(self.source_url)
                self.consume_w3c_css_root(root, self.source_url)
                total_errors = self.w3c["css"].get("errors", 0)
                total_warnings = self.w3c["css"].get("warnings", 0)
                if total_errors == 0 and total_warnings == 0:
                    self.finish_w3c_test("css", "aprovado", "Nenhum erro ou aviso retornado pelo jigsaw.w3.org/css-validator para a URL pública.")
                else:
                    self.finish_w3c_test("css", "com ocorrências", f"{total_errors} erro(s) e {total_warnings} aviso(s) no W3C CSS Validator para a URL pública.")
                return
            css_items = self.extract_css_sources()
            if not css_items:
                if self.w3c["css"].get("warnings", 0) or self.w3c["css"].get("errors", 0):
                    self.finish_w3c_test("css", "com ocorrências", "O CSS externo/local não pôde ser completamente lido para validação.")
                else:
                    self.finish_w3c_test("css", "aprovado", "Nenhum CSS interno, inline ou arquivo CSS local foi encontrado para validar.")
                return
            combined_parts = []
            for name, css_text in css_items:
                css_text = (css_text or "").strip()
                if css_text:
                    combined_parts.append(f"/* Fonte: {name} */\n{css_text}")
            combined_css = "\n\n".join(combined_parts).strip()
            if not combined_css:
                self.finish_w3c_test("css", "aprovado", "Nenhum conteúdo CSS válido foi encontrado para enviar ao validador.")
                return
            root = self.request_w3c_css_validator(combined_css, self.source_name or "pagina.css")
            self.consume_w3c_css_root(root, "CSS combinado da página")
            total_errors = self.w3c["css"].get("errors", 0)
            total_warnings = self.w3c["css"].get("warnings", 0)
            used_local_fallback = bool(self.w3c["css"].get("local_fallback"))
            if total_errors == 0 and total_warnings == 0:
                if used_local_fallback:
                    self.finish_w3c_test("css", "aprovado", f"O Jigsaw/W3C CSS Validator bloqueou a automação com verificação humana. Como fallback automático, o app validou a sintaxe CSS localmente em {len(css_items)} fonte(s) combinada(s) e não encontrou erros.")
                else:
                    self.finish_w3c_test("css", "aprovado", f"Nenhum erro ou aviso retornado pelo jigsaw.w3.org/css-validator em {len(css_items)} fonte(s) CSS combinada(s).")
            else:
                if total_errors + total_warnings > MAX_EXTERNAL_FINDINGS:
                    self.add_w3c_item("css", "info", f"O retorno possui mais de {MAX_EXTERNAL_FINDINGS} ocorrências. O relatório exibiu apenas as primeiras para manter a leitura viável.", suggestion="Abra o relatório completo no jigsaw.w3.org/css-validator quando precisar da lista integral.")
                if used_local_fallback:
                    self.finish_w3c_test("css", "com ocorrências", f"O Jigsaw/W3C CSS Validator bloqueou a automação com verificação humana. O fallback local encontrou {total_errors} erro(s) e {total_warnings} aviso(s) de sintaxe CSS.")
                else:
                    self.finish_w3c_test("css", "com ocorrências", f"{total_errors} erro(s) e {total_warnings} aviso(s) no W3C CSS Validator.")
        except ValidatorRequestError as exc:
            reason = self.validator_error_text(exc)
            if exc.code in {403, 429}:
                W3C_SERVICE_STATE["css_blocked"] = True
                W3C_SERVICE_STATE["css_reason"] = reason
            self.add_w3c_item("css", "info", f"Teste online não executado pelo serviço externo: {reason}", suggestion="O app tentou apenas uma validação online direta do Jigsaw. Se o serviço recusar/bloquear a automação, ele não abre navegador nem usa Selenium para o W3C CSS e segue para o próximo arquivo.")
            self.finish_w3c_test("css", "não executado", reason, None)
        except Exception as exc:
            reason = str(exc)
            self.add_w3c_item("css", "info", f"Teste online não executado pelo serviço externo: {reason}", suggestion="Verifique internet, proxy/firewall ou valide direto em https://jigsaw.w3.org/css-validator/. O W3C CSS não abre navegador/Selenium quando o Jigsaw recusa a automação.")
            self.finish_w3c_test("css", "não executado", reason, None)

    def consume_w3c_css_root(self, root, source_name):
        errors = self.css_soap_items(root, "error")
        warnings = self.css_soap_items(root, "warning")
        error_count = self.safe_int(self.css_first_text(root, "errorcount"), len(errors))
        warning_count = self.safe_int(self.css_first_text(root, "warningcount"), len(warnings))
        shown = len(self.w3c["css"].get("items", []))
        displayed_errors = 0
        displayed_warnings = 0
        for item in errors:
            if shown >= MAX_EXTERNAL_FINDINGS:
                break
            self.add_w3c_item(
                "css",
                "erro",
                f"[{source_name}] {self.css_soap_message(item)}",
                self.safe_int(self.css_child_text(item, "line"), 0),
                0,
                "Corrija a regra CSS indicada pelo jigsaw.w3.org/css-validator."
            )
            displayed_errors += 1
            shown += 1
        for item in warnings:
            if shown >= MAX_EXTERNAL_FINDINGS:
                break
            self.add_w3c_item(
                "css",
                "revisar",
                f"[{source_name}] {self.css_soap_message(item)}",
                self.safe_int(self.css_child_text(item, "line"), 0),
                0,
                "Revise o aviso do validador CSS e ajuste quando fizer sentido para o projeto."
            )
            displayed_warnings += 1
            shown += 1
        self.w3c["css"]["errors"] += max(0, error_count - displayed_errors)
        self.w3c["css"]["warnings"] += max(0, warning_count - displayed_warnings)

    def request_w3c_css_uri_validator(self, url_value):
        params = {
            "uri": url_value,
            "profile": "css3",
            "usermedium": "all",
            "warning": "1",
            "output": "soap12",
            "lang": "pt-BR"
        }
        encoded = urllib.parse.urlencode(params)
        try:
            raw = self.http_bytes(
                W3C_CSS_VALIDATOR_URL + "?" + encoded,
                headers={
                    "Accept": "application/soap+xml, application/xml, text/xml, */*",
                    "Referer": "https://jigsaw.w3.org/css-validator/",
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache"
                }
            )
            return self.parse_w3c_css_response(raw, W3C_CSS_VALIDATOR_URL)
        except ValidatorRequestError:
            raise
        except Exception as exc:
            raise ValidatorRequestError(0, str(exc), "", W3C_CSS_VALIDATOR_URL) from exc

    def request_w3c_css_uri_validator_browser_form(self, url_value):
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.support.ui import WebDriverWait
            import tempfile
        except Exception as exc:
            raise RuntimeError(f"Selenium não está disponível para validar CSS por URL no navegador: {exc}") from exc
        temp_path = ""
        driver = None
        try:
            form_html = """<!doctype html><html><head><meta charset=\"utf-8\"><title>CSS Validator URI Submit</title></head><body><form id=\"f\" action=\"https://jigsaw.w3.org/css-validator/validator\" method=\"get\"><input name=\"uri\" value=\"{uri}\"><input name=\"profile\" value=\"css3\"><input name=\"usermedium\" value=\"all\"><input name=\"warning\" value=\"1\"><input name=\"output\" value=\"soap12\"><input name=\"lang\" value=\"pt-BR\"></form><script>setTimeout(function(){{document.getElementById('f').submit();}}, 600);</script></body></html>""".format(uri=html.escape(url_value or "", quote=True))
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix="_jigsaw_uri.html", delete=False) as temp_file:
                temp_file.write(form_html)
                temp_path = temp_file.name
            options = Options()
            options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1280,900")
            options.add_argument("--no-first-run")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--lang=pt-BR")
            driver = webdriver.Chrome(options=options)
            driver.set_page_load_timeout(120)
            driver.get("file:///" + temp_path.replace("\\", "/"))
            wait = WebDriverWait(driver, 120)
            wait.until(lambda d: "cssvalidationresponse" in ((d.page_source or "") + " " + self.safe_body_text(d)).lower() or "validity" in self.safe_body_text(d).lower())
            combined = (driver.page_source or "") + "\n" + self.safe_body_text(driver)
            return self.parse_w3c_css_response_text(combined, W3C_CSS_VALIDATOR_URL)
        finally:
            try:
                if driver is not None:
                    driver.quit()
            except Exception:
                pass
            try:
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)
            except Exception:
                pass

    def request_w3c_css_validator(self, css_text, source_name="pagina.css"):
        css_bytes = (css_text or "").encode("utf-8", errors="replace")
        if len(css_bytes) > W3C_CSS_DIRECT_MAX_BYTES:
            size_mb = len(css_bytes) / (1024 * 1024)
            raise ValidatorRequestError(413, "Request Entity Too Large", f"CSS combinado com {size_mb:.2f} MB ultrapassou o limite seguro desta chamada online do W3C.", W3C_CSS_VALIDATOR_URL)
        form = urllib.parse.urlencode({
            "text": css_text or "",
            "profile": "css3",
            "usermedium": "all",
            "warning": "1",
            "output": "soap12",
            "lang": "pt-BR"
        }).encode("utf-8")
        raw = self.http_bytes(
            W3C_CSS_VALIDATOR_URL,
            data=form,
            headers={
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                "Accept": "application/soap+xml, application/xml, text/xml, */*",
                "Referer": "https://jigsaw.w3.org/css-validator/",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
            }
        )
        return self.parse_w3c_css_response(raw, W3C_CSS_VALIDATOR_URL)

    def request_w3c_css_validator_browser_form(self, css_text, source_name="pagina.css"):
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.support.ui import WebDriverWait
            import tempfile
        except Exception as exc:
            raise RuntimeError(f"Selenium não está disponível para o fallback do CSS Validator pelo navegador: {exc}") from exc
        temp_path = ""
        driver = None
        try:
            safe_css = (css_text or "").replace("</textarea", "<\\/textarea")
            form_html = """<!doctype html><html><head><meta charset=\"utf-8\"><title>CSS Validator Submit</title></head><body><form id=\"f\" action=\"https://jigsaw.w3.org/css-validator/validator\" method=\"post\"><textarea name=\"text\">{css}</textarea><input name=\"profile\" value=\"css3\"><input name=\"usermedium\" value=\"all\"><input name=\"warning\" value=\"1\"><input name=\"output\" value=\"soap12\"><input name=\"lang\" value=\"pt-BR\"></form><script>setTimeout(function(){{document.getElementById('f').submit();}}, 600);</script></body></html>""".format(css=html.escape(safe_css))
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix="_jigsaw_submit.html", delete=False) as temp_file:
                temp_file.write(form_html)
                temp_path = temp_file.name
            options = Options()
            options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1280,900")
            options.add_argument("--no-first-run")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--lang=pt-BR")
            driver = webdriver.Chrome(options=options)
            driver.set_page_load_timeout(120)
            driver.get("file:///" + temp_path.replace("\\", "/"))
            wait = WebDriverWait(driver, 120)
            wait.until(lambda d: "cssvalidationresponse" in ((d.page_source or "") + " " + self.safe_body_text(d)).lower() or "validity" in self.safe_body_text(d).lower())
            combined = (driver.page_source or "") + "\n" + self.safe_body_text(driver)
            return self.parse_w3c_css_response_text(combined, W3C_CSS_VALIDATOR_URL)
        finally:
            try:
                if driver is not None:
                    driver.quit()
            except Exception:
                pass
            try:
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)
            except Exception:
                pass

    def request_w3c_css_validator_browser_ui_upload(self, css_text, source_name="pagina.css"):
        errors = []
        for headless in (True, False):
            try:
                return self.request_w3c_css_validator_browser_ui_upload_once(css_text, source_name, headless=headless)
            except Exception as exc:
                mode = "headless" if headless else "visível"
                errors.append(f"{mode}: {exc}")
        raise RuntimeError(" | ".join(errors) or "fallback por navegador não retornou resultado do CSS Validator.")

    def request_w3c_css_validator_browser_ui_upload_once(self, css_text, source_name="pagina.css", headless=True):
        try:
            from selenium import webdriver
            from selenium.webdriver.common.by import By
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.support.ui import WebDriverWait
            import tempfile
        except Exception as exc:
            raise RuntimeError(f"Selenium não está disponível para usar o formulário real do CSS Validator: {exc}") from exc
        temp_path = ""
        driver = None
        try:
            safe_name = re.sub(r"[^A-Za-z0-9_.-]+", "_", os.path.basename(source_name or "pagina.css")).strip("._") or "pagina.css"
            if not safe_name.lower().endswith(".css"):
                safe_name += ".css"
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix="_" + safe_name, delete=False) as temp_file:
                temp_file.write(css_text or "")
                temp_path = temp_file.name
            options = Options()
            if headless:
                options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1366,900")
            options.add_argument("--no-first-run")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--lang=pt-BR")
            options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36")
            driver = webdriver.Chrome(options=options)
            driver.set_page_load_timeout(180)
            wait = WebDriverWait(driver, 180)
            driver.get("https://jigsaw.w3.org/css-validator/")
            wait.until(lambda d: "css validation service" in ((d.title or "") + " " + self.safe_body_text(d)).lower())
            file_input = wait.until(lambda d: self.find_first_css_file_input(d))
            driver.execute_script("arguments[0].removeAttribute('hidden'); arguments[0].removeAttribute('disabled'); arguments[0].style.display='block'; arguments[0].style.visibility='visible'; arguments[0].style.opacity=1; arguments[0].style.position='fixed'; arguments[0].style.left='0'; arguments[0].style.top='0';", file_input)
            file_input.send_keys(temp_path)
            file_count = driver.execute_script("return arguments[0].files ? arguments[0].files.length : 0;", file_input)
            if not file_count:
                raise RuntimeError("o CSS foi enviado ao input do Jigsaw, mas o arquivo não ficou incorporado.")
            submitted = driver.execute_script("""
                const input = arguments[0];
                const form = input.form || input.closest('form');
                if (!form) return false;
                const values = {profile:'css3', usermedium:'all', warning:'1', lang:'pt-BR'};
                for (const [name, value] of Object.entries(values)) {
                    let field = form.querySelector(`[name="${name}"]`);
                    if (!field) {
                        field = document.createElement('input');
                        field.type = 'hidden';
                        field.name = name;
                        form.appendChild(field);
                    }
                    field.value = value;
                }
                const out = form.querySelector('[name="output"]');
                if (out) out.remove();
                input.dispatchEvent(new Event('input', {bubbles:true}));
                input.dispatchEvent(new Event('change', {bubbles:true}));
                const submitter = form.querySelector('input[type=submit], button[type=submit], button');
                if (submitter) submitter.click();
                else form.submit();
                return true;
            """, file_input)
            if not submitted:
                raise RuntimeError("não consegui submeter o formulário real de upload do Jigsaw.")
            try:
                wait.until(lambda d: self.w3c_css_browser_result_ready(d))
            except Exception:
                current_url = driver.current_url or ""
                if "jigsaw.w3.org/css-validator/validator" not in current_url:
                    raise
                time.sleep(5.0)
            page = (driver.page_source or "") + "\n" + self.safe_body_text(driver)
            if "cssvalidationresponse" in page.lower():
                return self.parse_w3c_css_response_text(page, W3C_CSS_VALIDATOR_URL)
            return self.parse_w3c_css_html_result_to_root(page, source_name, W3C_CSS_VALIDATOR_URL)
        finally:
            try:
                if driver is not None:
                    driver.quit()
            except Exception:
                pass
            try:
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)
            except Exception:
                pass

    def w3c_css_browser_result_ready(self, driver):
        try:
            current_url = (driver.current_url or "").lower()
        except Exception:
            current_url = ""
        text_value = self.safe_body_text(driver)
        lower = ((driver.page_source or "") + "\n" + text_value).lower()
        markers = [
            "css validator results",
            "validation report",
            "congratulations",
            "no error found",
            "valid css",
            "errors found",
            "error found",
            "warnings",
            "cssvalidationresponse"
        ]
        return "jigsaw.w3.org/css-validator/validator" in current_url and any(marker in lower for marker in markers)

    def parse_w3c_css_html_result_to_root(self, page, source_name, url):
        text = self.html_to_text(page)
        lower = text.lower()
        if not text:
            raise ValidatorRequestError(0, "O CSS Validator abriu no navegador, mas retornou uma página sem texto.", "", url)
        if not any(marker in lower for marker in ("css validator", "css validation", "valid css", "no error", "erro", "error", "warning", "aviso")):
            raise ValidatorRequestError(0, "O CSS Validator abriu no navegador, mas a página retornada não parece ser um resultado de validação.", text[:500], url)
        error_count = self.extract_css_result_count(text, [r"(\d+)\s+errors?\b", r"errors?\s*[:(]\s*(\d+)", r"(\d+)\s+erros?\b", r"erros?\s*[:(]\s*(\d+)"])
        warning_count = self.extract_css_result_count(text, [r"(\d+)\s+warnings?\b", r"warnings?\s*[:(]\s*(\d+)", r"(\d+)\s+avisos?\b", r"avisos?\s*[:(]\s*(\d+)"])
        if error_count is None:
            if any(marker in lower for marker in ("no error found", "nenhum erro", "sem erro", "valid css", "congratulations")):
                error_count = 0
            elif "error" in lower or "erro" in lower:
                error_count = 1
            else:
                error_count = 0
        if warning_count is None:
            if any(marker in lower for marker in ("no warning", "nenhum aviso", "sem aviso")):
                warning_count = 0
            elif "warning" in lower or "aviso" in lower:
                warning_count = 1
            else:
                warning_count = 0
        error_messages = self.extract_css_result_lines(text, ("error", "erro"), error_count)
        warning_messages = self.extract_css_result_lines(text, ("warning", "aviso"), warning_count)
        return self.build_css_validation_root(error_count, warning_count, error_messages, warning_messages)

    def extract_css_result_count(self, text, patterns):
        for pattern in patterns:
            match = re.search(pattern, text, flags=re.I)
            if match:
                try:
                    return int(match.group(1))
                except Exception:
                    pass
        return None

    def extract_css_result_lines(self, text, keywords, expected_count):
        if not expected_count:
            return []
        lines = [self.clean(line) for line in text.splitlines()]
        out = []
        for line in lines:
            low = line.lower()
            if len(line) < 12:
                continue
            if any(key in low for key in keywords) and not any(skip in low for skip in ("no error", "nenhum erro", "no warning", "nenhum aviso")):
                if line not in out:
                    out.append(line)
            if len(out) >= min(expected_count, MAX_EXTERNAL_FINDINGS):
                break
        if not out and expected_count:
            label = "erro" if any(key in keywords for key in ("error", "erro")) else "aviso"
            out.append(f"O CSS Validator informou {expected_count} {label}(s), mas o texto detalhado não pôde ser extraído automaticamente da página renderizada.")
        return out[:MAX_EXTERNAL_FINDINGS]

    def build_css_validation_root(self, error_count, warning_count, error_messages, warning_messages):
        root = ET.Element("cssvalidationresponse")
        result = ET.SubElement(root, "result")
        ET.SubElement(result, "validity").text = "true" if int(error_count or 0) == 0 else "false"
        ET.SubElement(result, "errorcount").text = str(int(error_count or 0))
        ET.SubElement(result, "warningcount").text = str(int(warning_count or 0))
        errors_node = ET.SubElement(result, "errors")
        for message in error_messages[:MAX_EXTERNAL_FINDINGS]:
            error_node = ET.SubElement(errors_node, "error")
            ET.SubElement(error_node, "line").text = "0"
            ET.SubElement(error_node, "message").text = message
        warnings_node = ET.SubElement(result, "warnings")
        for message in warning_messages[:MAX_EXTERNAL_FINDINGS]:
            warning_node = ET.SubElement(warnings_node, "warning")
            ET.SubElement(warning_node, "line").text = "0"
            ET.SubElement(warning_node, "message").text = message
        return root

    def request_w3c_css_validator_browser_upload(self, css_text, source_name="pagina.css"):
        try:
            from selenium import webdriver
            from selenium.webdriver.common.by import By
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.support.ui import WebDriverWait
            import tempfile
        except Exception as exc:
            raise RuntimeError(f"Selenium não está disponível para o fallback por upload no CSS Validator: {exc}") from exc
        temp_path = ""
        driver = None
        try:
            safe_name = re.sub(r"[^A-Za-z0-9_.-]+", "_", os.path.basename(source_name or "pagina.css")).strip("._") or "pagina.css"
            if not safe_name.lower().endswith(".css"):
                safe_name += ".css"
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix="_" + safe_name, delete=False) as temp_file:
                temp_file.write(css_text or "")
                temp_path = temp_file.name
            options = Options()
            options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1280,900")
            options.add_argument("--no-first-run")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--lang=pt-BR")
            driver = webdriver.Chrome(options=options)
            driver.set_page_load_timeout(90)
            wait = WebDriverWait(driver, 90)
            driver.get("https://jigsaw.w3.org/css-validator/")
            wait.until(lambda d: "css" in (self.safe_body_text(d).lower() + " " + (d.title or "").lower()))
            self.try_click_text_anywhere(driver, ["By File Upload", "Upload", "Envio", "arquivo"])
            file_input = wait.until(lambda d: self.find_first_css_file_input(d))
            driver.execute_script("arguments[0].removeAttribute('hidden'); arguments[0].removeAttribute('disabled'); arguments[0].style.display='block'; arguments[0].style.visibility='visible'; arguments[0].style.opacity=1;", file_input)
            file_input.send_keys(temp_path)
            self.prepare_css_validator_form(driver, file_input)
            if not self.submit_parent_form(driver, file_input):
                raise RuntimeError("o CSS foi incorporado ao input, mas não consegui enviar o formulário do Jigsaw.")
            wait.until(lambda d: "cssvalidationresponse" in ((d.page_source or "") + " " + self.safe_body_text(d)).lower() or "validation" in self.safe_body_text(d).lower())
            page = (driver.page_source or "") + "\n" + self.safe_body_text(driver)
            return self.parse_w3c_css_response_text(page, W3C_CSS_VALIDATOR_URL)
        finally:
            try:
                if driver is not None:
                    driver.quit()
            except Exception:
                pass
            try:
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)
            except Exception:
                pass

    def find_first_css_file_input(self, driver):
        try:
            from selenium.webdriver.common.by import By
            inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='file']")
            for item in inputs:
                return item
        except Exception:
            pass
        return False

    def try_click_text_anywhere(self, driver, labels):
        try:
            from selenium.webdriver.common.by import By
            for label in labels:
                xpaths = [
                    "//a[contains(normalize-space(.), " + repr(label) + ")]",
                    "//button[contains(normalize-space(.), " + repr(label) + ")]",
                    "//*[@role='tab' and contains(normalize-space(.), " + repr(label) + ")]",
                    "//*[contains(normalize-space(.), " + repr(label) + ")]"
                ]
                for xpath in xpaths:
                    for element in driver.find_elements(By.XPATH, xpath):
                        try:
                            driver.execute_script("arguments[0].scrollIntoView({block:'center', inline:'center'});", element)
                            try:
                                element.click()
                            except Exception:
                                driver.execute_script("arguments[0].click();", element)
                            time.sleep(0.1)
                            return True
                        except Exception:
                            continue
        except Exception:
            pass
        return False

    def prepare_css_validator_form(self, driver, file_input):
        try:
            driver.execute_script("""
                const input = arguments[0];
                const form = input.form || input.closest('form');
                if (!form) return false;
                const values = {output:'soap12', profile:'css3', usermedium:'all', warning:'1', lang:'pt-BR'};
                for (const [name, value] of Object.entries(values)) {
                    let field = form.querySelector(`[name="${name}"]`);
                    if (!field) {
                        field = document.createElement('input');
                        field.type = 'hidden';
                        field.name = name;
                        form.appendChild(field);
                    }
                    field.value = value;
                }
                input.dispatchEvent(new Event('input', {bubbles:true}));
                input.dispatchEvent(new Event('change', {bubbles:true}));
                return true;
            """, file_input)
            time.sleep(0.1)
        except Exception:
            pass

    def submit_parent_form(self, driver, element):
        try:
            result = driver.execute_script("""
                const el = arguments[0];
                const form = el.form || el.closest('form');
                if (!form) return false;
                const submitter = form.querySelector('input[type=submit], button[type=submit], button, input[type=button]');
                if (submitter) {
                    submitter.click();
                } else {
                    form.submit();
                }
                return true;
            """, element)
            time.sleep(0.1)
            return bool(result)
        except Exception:
            return False

    def request_w3c_css_validator_browser(self, css_text, source_name="style.css"):
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.support.ui import WebDriverWait
        except Exception as exc:
            raise RuntimeError(f"Selenium não está instalado para o fallback do CSS Validator: {exc}") from exc
        params = {
            "text": css_text,
            "profile": "css3svg",
            "usermedium": "all",
            "warning": "1",
            "output": "soap12",
            "lang": "en"
        }
        encoded = urllib.parse.urlencode(params)
        if len(encoded) > 180000:
            raise RuntimeError("CSS muito grande para fallback por navegador via URL.")
        driver = None
        try:
            options = Options()
            options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1280,900")
            options.add_argument("--no-first-run")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--lang=pt-BR")
            driver = webdriver.Chrome(options=options)
            driver.set_page_load_timeout(75)
            target_url = W3C_CSS_VALIDATOR_URL + "?" + encoded
            driver.get(target_url)
            wait = WebDriverWait(driver, 75)
            wait.until(lambda d: "cssvalidationresponse" in ((d.page_source or "") + " " + self.safe_body_text(d)).lower())
            source = driver.page_source or ""
            body_text = self.safe_body_text(driver)
            combined = source + "\n" + body_text
            return self.parse_w3c_css_response_text(combined, target_url)
        finally:
            try:
                if driver is not None:
                    driver.quit()
            except Exception:
                pass

    def safe_body_text(self, driver):
        try:
            return driver.find_element("tag name", "body").text or ""
        except Exception:
            return ""

    def local_css_validation_root(self, css_text, source_name="pagina.css"):
        errors = []
        warnings = []
        try:
            import tinycss2
        except Exception as exc:
            errors.append(f"Validação local de CSS indisponível porque tinycss2 não está instalado: {exc}")
            return self.build_css_validation_root(len(errors), len(warnings), errors, warnings)
        try:
            errors.extend(self.css_balance_errors(css_text or ""))
            rules = tinycss2.parse_stylesheet(css_text or "", skip_comments=True, skip_whitespace=True)
            self.collect_tinycss_errors(rules, errors, "stylesheet")
            for rule in rules:
                if getattr(rule, "type", "") == "qualified-rule" and getattr(rule, "content", None) is not None:
                    declarations = tinycss2.parse_declaration_list(rule.content, skip_comments=True, skip_whitespace=True)
                    self.collect_tinycss_errors(declarations, errors, "declaração")
                elif getattr(rule, "type", "") == "at-rule" and getattr(rule, "content", None) is not None:
                    declarations = tinycss2.parse_declaration_list(rule.content, skip_comments=True, skip_whitespace=True)
                    self.collect_tinycss_errors(declarations, errors, "@regra")
        except Exception as exc:
            errors.append(f"Falha ao validar CSS localmente: {exc}")
        return self.build_css_validation_root(len(errors), len(warnings), errors, warnings)

    def css_balance_errors(self, css_text):
        cleaned = re.sub(r"/\*.*?\*/", "", css_text or "", flags=re.S)
        cleaned = re.sub(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'', '""', cleaned)
        pairs = [("{", "}"), ("(", ")"), ("[", "]")]
        out = []
        for opening, closing in pairs:
            balance = 0
            for char in cleaned:
                if char == opening:
                    balance += 1
                elif char == closing:
                    balance -= 1
                    if balance < 0:
                        out.append(f"sintaxe: fechamento '{closing}' sem abertura correspondente")
                        balance = 0
            if balance > 0:
                out.append(f"sintaxe: {balance} abertura(s) '{opening}' sem fechamento '{closing}'")
        return out[:MAX_EXTERNAL_FINDINGS]

    def collect_tinycss_errors(self, nodes, errors, context):
        for node in nodes or []:
            if getattr(node, "type", "") != "error":
                continue
            line = getattr(node, "source_line", 0) or 0
            column = getattr(node, "source_column", 0) or 0
            message = getattr(node, "message", "") or "erro de sintaxe CSS"
            if line or column:
                text = f"{context}: linha {line}, coluna {column}: {message}"
            else:
                text = f"{context}: {message}"
            if text not in errors:
                errors.append(text)
            if len(errors) >= MAX_EXTERNAL_FINDINGS:
                break

    def parse_w3c_css_response_text(self, text, url):
        text = (text or "").strip()
        if "&lt;" in text and "cssvalidationresponse" in text.lower():
            text = html.unescape(text)
        match = re.search(r"(<(?:[^>]+:)?cssvalidationresponse\b.*?</(?:[^>]+:)?cssvalidationresponse>)", text, flags=re.I | re.S)
        if match:
            text = match.group(1)
        else:
            env_match = re.search(r"(<(?:[^>]+:)?Envelope\b.*?</(?:[^>]+:)?Envelope>)", text, flags=re.I | re.S)
            if env_match:
                text = env_match.group(1)
        if not text:
            raise ValidatorRequestError(0, "O CSS Validator retornou uma resposta vazia.", "", url)
        try:
            root = ET.fromstring(text)
        except ET.ParseError as exc:
            raise ValidatorRequestError(0, f"O CSS Validator retornou uma resposta que não pôde ser lida como XML/SOAP: {exc}", text[:500], url) from exc
        if not any(self.css_local_name(node.tag) == "cssvalidationresponse" for node in root.iter()):
            raise ValidatorRequestError(0, "O CSS Validator respondeu, mas não no formato SOAP esperado.", text[:500], url)
        return root

    def parse_w3c_css_response(self, raw, url):
        text = raw.decode("utf-8", errors="replace").strip()
        return self.parse_w3c_css_response_text(text, url)

    def css_local_name(self, tag):
        return str(tag).split("}", 1)[-1]

    def css_child_text(self, node, name):
        for child in list(node):
            if self.css_local_name(child.tag) == name:
                return self.clean(child.text or "")
        return ""

    def css_first_text(self, root, name):
        for node in root.iter():
            if self.css_local_name(node.tag) == name:
                return self.clean(node.text or "")
        return ""

    def css_soap_items(self, root, item_name):
        items = []
        for node in root.iter():
            if self.css_local_name(node.tag) == item_name:
                items.append(node)
        return items

    def css_soap_message(self, item):
        parts = []
        for key in ("source", "context", "message", "property", "skippedstring"):
            value = self.css_child_text(item, key)
            if value:
                parts.append(value)
        return " | ".join(parts) or "Ocorrência retornada pelo CSS Validator."

    def css_validator_message(self, item):
        parts = []
        for key in ("source", "context", "message", "property", "skippedstring"):
            value = self.clean(item.get(key, ""))
            if value:
                parts.append(value)
        return " | ".join(parts) or "Ocorrência retornada pelo CSS Validator."

    def safe_int(self, value, default=0):
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    def build_report(self):
        counts = {"erro": 0, "revisar": 0, "aceito": len(self.accepted)}
        for item in self.findings:
            level = item.get("level")
            if level in {"erro", "revisar"}:
                counts[level] = counts.get(level, 0) + 1
        score = max(0, 10 - counts.get("erro", 0) * 0.55 - counts.get("revisar", 0) * 0.18)
        if self.w3c["global"].get("status") == "pendente":
            self.finish_w3c_global()
        return {
            "file": self.source_name,
            "path": self.path,
            "size_bytes": len(self.html_text.encode("utf-8", errors="replace")),
            "elements_analyzed": len([n for n in self.nodes if n.tag not in {"document", "#text"}]),
            "score": round(score, 1),
            "accessibility_score": round(score, 1),
            "w3c_score": self.w3c["global"].get("score"),
            "amaweb_score": self.amaweb.get("score"),
            "counts": counts,
            "findings": self.findings,
            "accepted": self.accepted,
            "w3c": self.w3c,
            "amaweb": self.amaweb
        }



    def parse_amaweb_result(self, page):
        text = self.html_to_text(page)
        if not text:
            self.finish_amaweb("não executado", "O AMAWeb retornou uma página sem texto interpretável.", None)
            return
        lower = text.lower()
        if "avaliador" not in lower and "amaweb" not in lower and "amp_evaluation_data" not in page:
            self.finish_amaweb("não executado", "A resposta recebida não parece ser um relatório do AMAWeb.", None)
            return
        structured = self.extract_amaweb_structured_payload(page, text)
        if structured is not None:
            self.apply_amaweb_structured_payload(structured, text)
            return
        self.amaweb["page_size"] = self.regex_first(text, [r"Tamanho da página:\s*([^\n|]+)", r"Tamanho da pagina:\s*([^\n|]+)"])
        elements = self.regex_first_number(text, [
            r"Elementos analisados:\s*(\d+)",
            r'"(?:elementsAnalyzed|elementosAnalisados|elementos_analisados|totalElements|total_elementos)"\s*:\s*"?(\d+)"?'
        ])
        practices = self.regex_first_number(text, [
            r"Práticas identificadas:\s*(\d+)",
            r"Praticas identificadas:\s*(\d+)",
            r'"(?:practicesIdentified|praticasIdentificadas|praticas_identificadas|totalPractices|total_praticas)"\s*:\s*"?(\d+)"?'
        ])
        if elements is not None:
            self.amaweb["elements_analyzed"] = int(elements)
        if practices is not None:
            self.amaweb["practices_identified"] = int(practices)
        score = self.extract_amaweb_score(text, page)
        if score is not None:
            self.amaweb["score"] = score
        counts = self.extract_amaweb_status_counts(text)
        if counts:
            self.amaweb["errors"] = counts.get("errors", 0)
            self.amaweb["manual_review"] = counts.get("manual_review", 0)
            self.amaweb["accepted"] = counts.get("accepted", 0)
        self.collect_amaweb_items(text)
        if not self.amaweb.get("items") and score is None and elements is None and practices is None:
            self.add_amaweb_item("info", "O AMAWeb foi acessado, mas o resultado detalhado não pôde ser extraído automaticamente da página retornada.", "Use o link do relatório AMAWeb salvo no JSON/HTML para conferir a avaliação completa.")
            self.finish_amaweb("executado parcialmente", "Relatório AMAWeb acessado, mas sem dados estruturados suficientes para extrair nota e ocorrências.", score)
            return
        message_parts = []
        if self.amaweb.get("elements_analyzed") is not None:
            message_parts.append(f"{self.amaweb['elements_analyzed']} elemento(s) analisado(s)")
        if self.amaweb.get("practices_identified") is not None:
            message_parts.append(f"{self.amaweb['practices_identified']} prática(s) identificada(s)")
        if self.amaweb.get("result_url"):
            message_parts.append("link do relatório AMAWeb armazenado")
        message = ", ".join(message_parts) or "Relatório AMAWeb processado."
        self.finish_amaweb(None, message, score)

    def extract_amaweb_structured_payload(self, page, text):
        candidates = []
        for source in (html.unescape(page or ""), text or ""):
            marker = '"amp_evaluation_data"'
            start_search = 0
            while True:
                marker_index = source.find(marker, start_search)
                if marker_index < 0:
                    break
                for start in self.possible_json_starts(source, marker_index):
                    value = self.try_decode_json_at(source, start)
                    if value is not None:
                        candidates.append(value)
                        break
                start_search = marker_index + len(marker)
        for value in candidates:
            payload = self.load_amaweb_evaluation_payload(value)
            if payload is not None:
                return payload
        return None

    def possible_json_starts(self, source, marker_index):
        starts = []
        pos = marker_index
        while True:
            pos = source.rfind("{", 0, pos)
            if pos < 0:
                break
            starts.append(pos)
            if len(starts) >= 25:
                break
        return starts

    def try_decode_json_at(self, source, start):
        try:
            decoder = json.JSONDecoder()
            value, _ = decoder.raw_decode(source[start:])
            return value
        except Exception:
            return None

    def load_amaweb_evaluation_payload(self, value):
        if isinstance(value, dict):
            if value.get("amp_evaluation_data") is not None:
                loaded = self.load_amaweb_evaluation_payload(value.get("amp_evaluation_data"))
                if loaded is not None:
                    return loaded
            local_storage = value.get("localStorage") or value.get("local_storage") or {}
            if isinstance(local_storage, dict):
                data = local_storage.get("amp_evaluation_data")
                loaded = self.load_amaweb_evaluation_payload(data)
                if loaded is not None:
                    return loaded
            if "evaluation" in value and isinstance(value.get("evaluation"), dict):
                return value
        if isinstance(value, str):
            try:
                return self.load_amaweb_evaluation_payload(json.loads(value))
            except Exception:
                return None
        return None

    def apply_amaweb_structured_payload(self, payload, text):
        data = ((payload.get("evaluation") or {}).get("data") or {}) if isinstance(payload, dict) else {}
        tot = data.get("tot") or {}
        info = tot.get("info") or {}
        self.amaweb["items"] = []
        self.amaweb["errors"] = 0
        self.amaweb["manual_review"] = 0
        self.amaweb["accepted"] = 0
        self.amaweb["warnings"] = 0
        score = self.normalize_score(info.get("score") or payload.get("score") or data.get("score"))
        if score is not None:
            self.amaweb["score"] = score
        if info.get("size"):
            try:
                self.amaweb["page_size"] = f"{round(int(info.get('size')) / 1024)} KB"
            except Exception:
                self.amaweb["page_size"] = str(info.get("size"))
        if info.get("htmlTags") is not None:
            try:
                self.amaweb["elements_analyzed"] = int(info.get("htmlTags"))
            except Exception:
                pass
        if info.get("tests") is not None:
            try:
                self.amaweb["practices_identified"] = int(info.get("tests"))
            except Exception:
                pass
        counts = self.extract_amaweb_status_counts(text)
        if counts:
            self.amaweb["errors"] = counts.get("errors", 0)
            self.amaweb["manual_review"] = counts.get("manual_review", 0)
            self.amaweb["accepted"] = counts.get("accepted", 0)
        else:
            conform = str(info.get("conform") or tot.get("conform") or "")
            nums = [int(x) for x in re.findall(r"\d+", conform)]
            if nums:
                self.amaweb["errors"] = sum(nums[:3])
        for level, message in self.iter_amaweb_structured_issue_items(data):
            if len(self.amaweb["items"]) >= MAX_EXTERNAL_FINDINGS:
                break
            self.amaweb["items"].append({"level": level, "message": message, "suggestion": "Confira o item completo no relatório do AMAWeb."})
        message_parts = []
        if self.amaweb.get("elements_analyzed") is not None:
            message_parts.append(f"{self.amaweb['elements_analyzed']} elemento(s) analisado(s)")
        if self.amaweb.get("practices_identified") is not None:
            message_parts.append(f"{self.amaweb['practices_identified']} prática(s) identificada(s)")
        if self.amaweb.get("result_url"):
            message_parts.append("link do relatório AMAWeb armazenado")
        if not self.amaweb.get("items") and self.amaweb.get("errors", 0) == 0:
            self.amaweb["items"].append({"level": "info", "message": "Nenhum erro automático retornado pelo AMAWeb.", "suggestion": "Revise manualmente os itens marcados como revisão quando existirem."})
        self.finish_amaweb(None, ", ".join(message_parts) or "Relatório AMAWeb processado com dados estruturados.", self.amaweb.get("score"))

    def extract_amaweb_status_counts(self, text):
        normalized = text or ""
        normalized = normalized.replace("\\n", " ").replace("\\t", " ")
        normalized = re.sub(r"[\s]+", " ", normalized)
        accepted = self.extract_amaweb_status_row(normalized, "Aceito")
        review = self.extract_amaweb_status_row(normalized, "Revisar manualmente")
        errors = self.extract_amaweb_status_row(normalized, "Erros")
        if accepted is None and review is None and errors is None:
            return None
        return {
            "accepted": sum(accepted or []),
            "manual_review": sum(review or []),
            "errors": sum(errors or [])
        }

    def extract_amaweb_status_row(self, text, label):
        pattern = re.escape(label) + r"\s+(\d+)\s+(\d+)\s+(\d+)"
        match = re.search(pattern, text, flags=re.I)
        if not match:
            return None
        return [int(match.group(1)), int(match.group(2)), int(match.group(3))]

    def iter_amaweb_structured_issue_items(self, data):
        nodes = data.get("nodes") or {}
        results = data.get("tot", {}).get("results", {}) if isinstance(data.get("tot"), dict) else {}
        seen = set()
        for rule, entries in nodes.items():
            if not isinstance(entries, list):
                continue
            verdicts = {str(item.get("verdict", "")).lower() for item in entries if isinstance(item, dict)}
            if any(v in verdicts for v in ("failed", "fail", "error", "erro")):
                level = "erro"
            elif any(v in verdicts for v in ("warning", "manual", "canttell", "inapplicable")):
                level = "revisar"
            else:
                continue
            descriptions = []
            for item in entries:
                if not isinstance(item, dict):
                    continue
                desc = self.clean(item.get("description", ""))
                if desc and desc not in descriptions:
                    descriptions.append(desc)
            message = f"{rule}: " + (" | ".join(descriptions[:2]) if descriptions else "item retornado pelo AMAWeb.")
            if message not in seen:
                seen.add(message)
                yield level, message

    def collect_amaweb_items(self, text):
        counts = self.extract_amaweb_status_counts(text)
        if counts:
            self.amaweb["errors"] = counts.get("errors", self.amaweb.get("errors", 0))
            self.amaweb["manual_review"] = counts.get("manual_review", self.amaweb.get("manual_review", 0))
            self.amaweb["accepted"] = counts.get("accepted", self.amaweb.get("accepted", 0))
        if self.amaweb.get("errors", 0) == 0 and self.amaweb.get("manual_review", 0) == 0:
            if not self.amaweb.get("items"):
                self.amaweb["items"].append({"level": "info", "message": "Nenhum erro automático retornado pelo AMAWeb.", "suggestion": "Confira o relatório completo do AMAWeb quando precisar da lista detalhada."})
            return
        lines = [self.clean(line) for line in (text or "").splitlines()]
        lines = [line for line in lines if line]
        current_section = ""
        for line in lines:
            low = line.lower().strip(" :")
            if low == "erros":
                current_section = "erro"
                continue
            if low == "revisar manualmente":
                current_section = "revisar"
                continue
            if low == "aceito":
                current_section = ""
                continue
            if low.startswith("nenhum erro"):
                current_section = ""
                continue
            if line.startswith("{") or "amp_evaluation_data" in line or len(line) < 18:
                continue
            if not current_section:
                continue
            if len(self.amaweb["items"]) >= MAX_EXTERNAL_FINDINGS:
                break
            if any(skip in low for skip in ("nível de conformidade", "criterio de sucesso", "critério de sucesso", "ver no manual", "acompanhe o amaweb", "desenvolvido por")):
                continue
            self.add_amaweb_item(current_section, line, "Confira o item completo no relatório do AMAWeb.")

    def request_w3c_css_validator_browser_ui_upload_once(self, css_text, source_name="pagina.css", headless=True):
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.support.ui import WebDriverWait
            import tempfile
        except Exception as exc:
            raise RuntimeError(f"Selenium não está disponível para usar upload real no CSS Validator: {exc}") from exc
        css_path = ""
        form_path = ""
        driver = None
        try:
            safe_name = re.sub(r"[^A-Za-z0-9_.-]+", "_", os.path.basename(source_name or "pagina.css")).strip("._") or "pagina.css"
            if not safe_name.lower().endswith(".css"):
                safe_name += ".css"
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix="_" + safe_name, delete=False) as temp_file:
                temp_file.write(css_text or "")
                css_path = temp_file.name
            form_html = """<!doctype html><html><head><meta charset=\"utf-8\"><title>CSS Validator Upload</title></head><body><form id=\"f\" action=\"https://jigsaw.w3.org/css-validator/validator\" method=\"post\" enctype=\"multipart/form-data\"><input id=\"file\" type=\"file\" name=\"file\"><input type=\"hidden\" name=\"profile\" value=\"css3\"><input type=\"hidden\" name=\"usermedium\" value=\"all\"><input type=\"hidden\" name=\"warning\" value=\"1\"><input type=\"hidden\" name=\"output\" value=\"soap12\"><input type=\"hidden\" name=\"lang\" value=\"pt-BR\"><button id=\"submit\" type=\"submit\">Enviar</button></form></body></html>"""
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix="_jigsaw_css_upload.html", delete=False) as form_file:
                form_file.write(form_html)
                form_path = form_file.name
            options = Options()
            if headless:
                options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1366,900")
            options.add_argument("--no-first-run")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--lang=pt-BR")
            options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36")
            driver = webdriver.Chrome(options=options)
            driver.set_page_load_timeout(180)
            wait = WebDriverWait(driver, 180)
            driver.get("file:///" + form_path.replace("\\", "/"))
            file_input = wait.until(lambda d: d.find_element("css selector", "input[type='file']"))
            file_input.send_keys(css_path)
            file_count = driver.execute_script("return arguments[0].files ? arguments[0].files.length : 0;", file_input)
            if not file_count:
                raise RuntimeError("o CSS foi enviado ao input local, mas o arquivo não ficou incorporado.")
            driver.find_element("id", "submit").click()
            wait.until(lambda d: self.w3c_css_browser_result_ready(d) or "cssvalidationresponse" in ((d.page_source or "") + " " + self.safe_body_text(d)).lower())
            page = (driver.page_source or "") + "\n" + self.safe_body_text(driver)
            if "cssvalidationresponse" in page.lower():
                return self.parse_w3c_css_response_text(page, W3C_CSS_VALIDATOR_URL)
            return self.parse_w3c_css_html_result_to_root(page, source_name, W3C_CSS_VALIDATOR_URL)
        finally:
            try:
                if driver is not None:
                    driver.quit()
            except Exception:
                pass
            for path in (css_path, form_path):
                try:
                    if path and os.path.exists(path):
                        os.remove(path)
                except Exception:
                    pass

class SimplePDF:
    def __init__(self):
        self.width = 595
        self.height = 842
        self.margin = 42
        self.pages = []
        self.current = []
        self.y = self.height - self.margin
        self.new_page()

    def new_page(self):
        if self.current:
            self.pages.append(b"\n".join(self.current))
        self.current = []
        self.y = self.height - self.margin

    def esc(self, text):
        text = str(text).replace("\r", " ").replace("\n", " ")
        raw = text.encode("cp1252", errors="replace")
        out = bytearray()
        for b in raw:
            if b in (40, 41, 92):
                out.append(92)
                out.append(b)
            elif b < 32:
                out.append(32)
            else:
                out.append(b)
        return bytes(out)

    def line(self, text, size=10, bold=False, indent=0):
        if self.y < self.margin + 28:
            self.new_page()
        font = b"F2" if bold else b"F1"
        x = self.margin + indent
        cmd = b"BT /" + font + b" " + str(size).encode() + b" Tf 1 0 0 1 " + str(x).encode() + b" " + str(int(self.y)).encode() + b" Tm (" + self.esc(text) + b") Tj ET"
        self.current.append(cmd)
        self.y -= size + 5

    def paragraph(self, text, size=10, bold=False, indent=0, gap=4):
        max_chars = max(28, int((self.width - self.margin * 2 - indent) / (size * 0.52)))
        lines = []
        for part in str(text).split("\n"):
            wrapped = textwrap.wrap(part, width=max_chars, replace_whitespace=True, drop_whitespace=True) or [""]
            lines.extend(wrapped)
        for item in lines:
            self.line(item, size, bold, indent)
        self.y -= gap

    def rule(self):
        if self.y < self.margin + 18:
            self.new_page()
        y = int(self.y)
        self.current.append(f"0.75 w {self.margin} {y} m {self.width - self.margin} {y} l S".encode())
        self.y -= 12

    def finish(self):
        if self.current:
            self.pages.append(b"\n".join(self.current))
            self.current = []
        objects = []
        def obj(data):
            objects.append(data)
            return len(objects)
        catalog_id = obj(b"")
        pages_id = obj(b"")
        font1_id = obj(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
        font2_id = obj(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
        page_ids = []
        content_ids = []
        for content in self.pages:
            content_id = obj(b"<< /Length " + str(len(content)).encode() + b" >>\nstream\n" + content + b"\nendstream")
            page_id = obj(b"")
            content_ids.append(content_id)
            page_ids.append(page_id)
        objects[catalog_id - 1] = b"<< /Type /Catalog /Pages " + str(pages_id).encode() + b" 0 R >>"
        kids = b" ".join([str(pid).encode() + b" 0 R" for pid in page_ids])
        objects[pages_id - 1] = b"<< /Type /Pages /Kids [" + kids + b"] /Count " + str(len(page_ids)).encode() + b" >>"
        for index, page_id in enumerate(page_ids):
            content_id = content_ids[index]
            objects[page_id - 1] = (
                b"<< /Type /Page /Parent " + str(pages_id).encode() + b" 0 R /MediaBox [0 0 " +
                str(self.width).encode() + b" " + str(self.height).encode() + b"] /Resources << /Font << /F1 " +
                str(font1_id).encode() + b" 0 R /F2 " + str(font2_id).encode() + b" 0 R >> >> /Contents " +
                str(content_id).encode() + b" 0 R >>"
            )
        pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
        offsets = [0]
        for i, data in enumerate(objects, 1):
            offsets.append(len(pdf))
            pdf.extend(str(i).encode() + b" 0 obj\n" + data + b"\nendobj\n")
        xref = len(pdf)
        pdf.extend(b"xref\n0 " + str(len(objects) + 1).encode() + b"\n0000000000 65535 f \n")
        for offset in offsets[1:]:
            pdf.extend(f"{offset:010d} 00000 n \n".encode())
        pdf.extend(b"trailer\n<< /Size " + str(len(objects) + 1).encode() + b" /Root " + str(catalog_id).encode() + b" 0 R >>\nstartxref\n" + str(xref).encode() + b"\n%%EOF")
        return bytes(pdf)

class AcessMonitorApp:
    def __init__(self, root):
        self.root = root
        self.root.title(APP_NAME)
        self.root.geometry("1180x720")
        self.sources = []
        self.results = []
        self.current_report_index = None
        self.sort_column = None
        self.sort_reverse = False
        self.enable_w3c = tk.BooleanVar(value=True)
        self.build_ui()

    def build_ui(self):
        self.style = ttk.Style()
        try:
            self.style.theme_use("clam")
        except tk.TclError:
            pass
        self.style.configure("Title.TLabel", font=("Segoe UI", 16, "bold"))
        self.style.configure("Accent.TButton", padding=(10, 7))
        top = ttk.Frame(self.root, padding=14)
        top.pack(fill="x")
        ttk.Label(top, text=APP_NAME, style="Title.TLabel").pack(side="left")
        ttk.Label(top, text="  análise local de acessibilidade para HTML", foreground="#555").pack(side="left")
        toolbar = ttk.Frame(self.root, padding=(14, 0, 14, 10))
        toolbar.pack(fill="x")
        ttk.Button(toolbar, text="Adicionar arquivos", command=self.add_files, style="Accent.TButton").pack(side="left", padx=(0, 8))
        ttk.Button(toolbar, text="Adicionar pasta", command=self.add_folder, style="Accent.TButton").pack(side="left", padx=(0, 8))
        ttk.Button(toolbar, text="Adicionar URL", command=self.add_url, style="Accent.TButton").pack(side="left", padx=(0, 8))
        ttk.Button(toolbar, text="Colar HTML", command=self.add_pasted_html, style="Accent.TButton").pack(side="left", padx=(0, 8))
        ttk.Button(toolbar, text="Remover selecionado", command=self.remove_selected_sources, style="Accent.TButton").pack(side="left", padx=(0, 8))
        ttk.Button(toolbar, text="Limpar", command=self.clear_all, style="Accent.TButton").pack(side="left", padx=(0, 8))
        ttk.Button(toolbar, text="Analisar", command=self.run_analysis, style="Accent.TButton").pack(side="left", padx=(0, 10))
        ttk.Checkbutton(toolbar, text="Testar W3C/AMAWeb online", variable=self.enable_w3c).pack(side="left", padx=(0, 20))
        self.btn_pdf = ttk.Button(toolbar, text="Baixar PDF", command=self.export_pdf, state="disabled", style="Accent.TButton")
        self.btn_pdf.pack(side="left", padx=(0, 8))
        self.btn_json = ttk.Button(toolbar, text="Baixar JSON", command=self.export_json, state="disabled", style="Accent.TButton")
        self.btn_json.pack(side="left", padx=(0, 8))
        self.btn_html = ttk.Button(toolbar, text="Baixar HTML", command=self.export_html, state="disabled", style="Accent.TButton")
        self.btn_html.pack(side="left", padx=(0, 8))
        main = ttk.PanedWindow(self.root, orient="horizontal")
        main.pack(fill="both", expand=True, padx=14, pady=(0, 10))
        left = ttk.Frame(main)
        right = ttk.Frame(main)
        main.add(left, weight=1)
        main.add(right, weight=2)
        columns = ("estado", "nota", "w3c_global", "w3c_html", "w3c_css", "amaweb", "erros", "revisar", "aceitos", "elementos")
        self.tree_column_labels = {
            "arquivo": "Arquivo",
            "estado": "Estado",
            "nota": "Nota Acess.",
            "w3c_global": "W3C Global",
            "w3c_html": "W3C HTML",
            "w3c_css": "W3C CSS",
            "amaweb": "AMAWeb",
            "erros": "Erros",
            "revisar": "Revisar",
            "aceitos": "Aceitos",
            "elementos": "Elementos"
        }
        self.tree_numeric_columns = {"nota", "w3c_global", "w3c_html", "w3c_css", "amaweb", "erros", "revisar", "aceitos", "elementos"}
        self.tree = ttk.Treeview(left, columns=columns, show="tree headings", height=22)
        self.tree.heading("#0", text=self.sort_heading_text("arquivo"), command=lambda: self.sort_tree_by("arquivo"))
        self.tree.column("#0", width=280)
        for col, text, width in [
            ("estado", "Estado", 82),
            ("nota", "Nota Acess.", 82),
            ("w3c_global", "W3C Global", 86),
            ("w3c_html", "W3C HTML", 78),
            ("w3c_css", "W3C CSS", 72),
            ("amaweb", "AMAWeb", 72),
            ("erros", "Erros", 60),
            ("revisar", "Revisar", 70),
            ("aceitos", "Aceitos", 70),
            ("elementos", "Elementos", 80)
        ]:
            self.tree.heading(col, text=self.sort_heading_text(col), command=lambda c=col: self.sort_tree_by(c))
            self.tree.column(col, width=width, anchor="center")
        self.tree.pack(fill="both", expand=True)
        self.tree.bind("<<TreeviewSelect>>", self.on_select)
        self.tree.bind("<Delete>", self.remove_selected_sources)
        self.tree.bind("<BackSpace>", self.remove_selected_sources)
        self.root.bind("<Delete>", self.remove_selected_sources)
        self.root.bind("<BackSpace>", self.remove_selected_sources)
        ttk.Label(left, text="Atalho: selecione um arquivo e pressione Delete para remover da lista.", foreground="#666", wraplength=430).pack(fill="x", pady=(6, 0))
        summary_frame = ttk.LabelFrame(right, text="Resumo")
        summary_frame.pack(fill="x", pady=(0, 10))
        self.summary = tk.StringVar(value="Adicione arquivos HTML, cole HTML ou adicione uma URL e clique em Analisar.")
        ttk.Label(summary_frame, textvariable=self.summary, padding=10, wraplength=680).pack(fill="x")
        detail_frame = ttk.LabelFrame(right, text="Detalhes do relatório")
        detail_frame.pack(fill="both", expand=True)
        self.detail = scrolledtext.ScrolledText(detail_frame, wrap="word", font=("Consolas", 10), borderwidth=0)
        self.detail.pack(fill="both", expand=True, padx=8, pady=8)
        self.detail.insert("1.0", "Os detalhes aparecerão aqui depois da análise.")
        self.detail.configure(state="disabled")
        self.status = tk.StringVar(value="Pronto.")
        ttk.Label(self.root, textvariable=self.status, padding=(14, 0, 14, 10), foreground="#555").pack(fill="x")

    def add_files(self):
        paths = filedialog.askopenfilenames(title="Selecionar arquivos HTML", filetypes=[("HTML", "*.html *.htm"), ("Todos os arquivos", "*.*")])
        self.add_paths(paths)

    def add_folder(self):
        folder = filedialog.askdirectory(title="Selecionar pasta com HTML")
        if not folder:
            return
        paths = []
        for root_dir, _, files in os.walk(folder):
            for name in files:
                if name.lower().endswith((".html", ".htm")):
                    paths.append(os.path.join(root_dir, name))
        self.add_paths(paths)

    def add_paths(self, paths):
        added = 0
        existing = {item.get("path") for item in self.sources if item.get("path")}
        for path in paths:
            if not path or path in existing:
                continue
            try:
                text = self.read_file(path)
            except Exception as exc:
                messagebox.showerror("Erro ao abrir arquivo", f"Não consegui abrir:\n{path}\n\n{exc}")
                continue
            self.sources.append({"name": os.path.basename(path), "path": path, "url": "", "content": text})
            iid = str(len(self.sources) - 1)
            self.tree.insert("", "end", iid=iid, text=os.path.basename(path), values=("pendente", "-", "-", "-", "-", "-", "-", "-", "-", "-"))
            added += 1
        if self.sort_column:
            self.apply_tree_sort()
        self.status.set(f"{added} arquivo(s) adicionado(s). Total: {len(self.sources)}.")

    def read_file(self, path):
        raw = open(path, "rb").read()
        for enc in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
            try:
                return raw.decode(enc)
            except UnicodeDecodeError:
                pass
        return raw.decode("utf-8", errors="replace")



    def add_url(self):
        url = simpledialog.askstring("Adicionar URL", "Digite a URL pública para analisar no AcessMonitor, W3C e AMAWeb:", parent=self.root)
        if not url:
            return
        url = url.strip()
        parsed = urllib.parse.urlparse(url)
        if not parsed.scheme:
            url = "https://" + url
            parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            messagebox.showwarning("URL inválida", "Informe uma URL pública começando com http:// ou https://.")
            return
        existing = {item.get("url") for item in self.sources if item.get("url")}
        if url in existing:
            messagebox.showinfo("URL já adicionada", "Essa URL já está na lista.")
            return
        self.status.set(f"Baixando HTML de {url}...")
        self.root.update_idletasks()
        try:
            content = self.fetch_url(url)
        except Exception as exc:
            messagebox.showerror("Erro ao baixar URL", f"Não consegui baixar o HTML de:\n{url}\n\n{exc}")
            self.status.set("Falha ao baixar URL.")
            return
        name = parsed.netloc + parsed.path
        if not parsed.path or parsed.path.endswith("/"):
            name = parsed.netloc + (parsed.path or "/")
        self.sources.append({"name": name, "path": url, "url": url, "content": content})
        iid = str(len(self.sources) - 1)
        self.tree.insert("", "end", iid=iid, text=name, values=("pendente", "-", "-", "-", "-", "-", "-", "-", "-", "-"))
        if self.sort_column:
            self.apply_tree_sort()
        self.status.set(f"URL adicionada. Total: {len(self.sources)}.")

    def fetch_url(self, url):
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
            "Connection": "close"
        }
        request = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(request, timeout=W3C_TIMEOUT) as response:
            raw = response.read()
            charset = response.headers.get_content_charset() or "utf-8"
        try:
            return raw.decode(charset)
        except UnicodeDecodeError:
            for enc in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
                try:
                    return raw.decode(enc)
                except UnicodeDecodeError:
                    pass
        return raw.decode("utf-8", errors="replace")

    def add_pasted_html(self):
        win = tk.Toplevel(self.root)
        win.title("Colar código HTML")
        win.geometry("780x520")
        frame = ttk.Frame(win, padding=12)
        frame.pack(fill="both", expand=True)
        ttk.Label(frame, text="Nome do arquivo virtual").pack(anchor="w")
        name_var = tk.StringVar(value=f"codigo_colado_{len(self.sources)+1}.html")
        ttk.Entry(frame, textvariable=name_var).pack(fill="x", pady=(0, 8))
        ttk.Label(frame, text="HTML").pack(anchor="w")
        text_box = scrolledtext.ScrolledText(frame, wrap="word", font=("Consolas", 10))
        text_box.pack(fill="both", expand=True, pady=(0, 10))
        def save():
            content = text_box.get("1.0", "end").strip()
            name = name_var.get().strip() or f"codigo_colado_{len(self.sources)+1}.html"
            if not content:
                messagebox.showwarning("HTML vazio", "Cole algum HTML antes de adicionar.")
                return
            self.sources.append({"name": name, "path": "", "url": "", "content": content})
            iid = str(len(self.sources) - 1)
            self.tree.insert("", "end", iid=iid, text=name, values=("pendente", "-", "-", "-", "-", "-", "-", "-", "-", "-"))
            if self.sort_column:
                self.apply_tree_sort()
            self.status.set(f"Código colado adicionado. Total: {len(self.sources)}.")
            win.destroy()
        ttk.Button(frame, text="Adicionar", command=save).pack(side="right")

    def clear_all(self):
        self.sources = []
        self.results = []
        self.current_report_index = None
        for item in self.tree.get_children():
            self.tree.delete(item)
        self.set_detail("Os detalhes aparecerão aqui depois da análise.")
        self.summary.set("Adicione arquivos HTML, cole HTML ou adicione uma URL e clique em Analisar.")
        self.btn_pdf.configure(state="disabled")
        self.btn_json.configure(state="disabled")
        self.btn_html.configure(state="disabled")
        self.sort_column = None
        self.sort_reverse = False
        self.update_sort_headings()
        self.status.set("Lista limpa.")

    def remove_selected_sources(self, event=None):
        widget = getattr(event, "widget", None) if event is not None else None
        if widget is not None and widget is not self.root and widget is not self.tree:
            return None
        selected = list(self.tree.selection())
        if not selected:
            return "break"
        indexes = []
        for item in selected:
            try:
                indexes.append(int(item))
            except ValueError:
                pass
        indexes = sorted(set(indexes), reverse=True)
        if not indexes:
            return "break"
        for index in indexes:
            if 0 <= index < len(self.sources):
                del self.sources[index]
            if 0 <= index < len(self.results):
                del self.results[index]
        self.current_report_index = None
        self.rebuild_tree()
        if self.results:
            self.update_summary()
            first = self.tree.get_children()[0]
            self.tree.selection_set(first)
            self.tree.focus(first)
            self.show_report(0)
            self.btn_pdf.configure(state="normal")
            self.btn_json.configure(state="normal")
            self.btn_html.configure(state="normal")
        else:
            self.set_detail("Os detalhes aparecerão aqui depois da análise.")
            if self.sources:
                self.summary.set(f"{len(self.sources)} arquivo(s) na lista. Clique em Analisar para gerar o relatório.")
            else:
                self.summary.set("Adicione arquivos HTML, cole HTML ou adicione uma URL e clique em Analisar.")
            self.btn_pdf.configure(state="disabled")
            self.btn_json.configure(state="disabled")
            self.btn_html.configure(state="disabled")
        self.status.set(f"{len(indexes)} arquivo(s) removido(s). Total: {len(self.sources)}.")
        return "break"

    def score_text(self, value):
        if isinstance(value, (int, float)):
            return round(value, 1)
        return "-"

    def get_w3c_test_score(self, report, key):
        return report.get("w3c", {}).get(key, {}).get("score")

    def tree_values_for_report(self, report):
        counts = report.get("counts", {})
        return (
            "analisado",
            self.score_text(report.get("score")),
            self.score_text(report.get("w3c", {}).get("global", {}).get("score")),
            self.score_text(self.get_w3c_test_score(report, "html")),
            self.score_text(self.get_w3c_test_score(report, "css")),
            self.score_text(report.get("amaweb", {}).get("score")),
            counts.get("erro", 0),
            counts.get("revisar", 0),
            counts.get("aceito", 0),
            report.get("elements_analyzed", 0)
        )

    def average_optional_score(self, getter):
        values = []
        for report in self.results:
            value = getter(report)
            if isinstance(value, (int, float)):
                values.append(float(value))
        return round(sum(values) / len(values), 1) if values else None

    def default_w3c_report(self):
        return {
            "enabled": bool(self.enable_w3c.get()),
            "html": {"name": "HTML", "score": None, "status": "não executado", "message": "Análise interrompida antes do teste W3C HTML.", "errors": 0, "warnings": 0, "infos": 0, "items": []},
            "css": {"name": "CSS", "score": None, "status": "não executado", "message": "Análise interrompida antes do teste W3C CSS.", "errors": 0, "warnings": 0, "infos": 0, "items": []},
            "global": {"score": None, "status": "não executado", "message": "Análise interrompida antes dos testes W3C."}
        }

    def default_amaweb_report(self, source=None):
        source = source or {}
        return {
            "enabled": bool(self.enable_w3c.get()),
            "score": None,
            "status": "não executado",
            "message": "Análise interrompida antes do teste AMAWeb.",
            "result_url": "",
            "source_url": source.get("url", ""),
            "input_mode": "url" if source.get("url", "") else "arquivo",
            "automation": "",
            "page_size": "",
            "elements_analyzed": None,
            "practices_identified": None,
            "errors": 0,
            "warnings": 0,
            "manual_review": 0,
            "accepted": 0,
            "items": []
        }

    def rebuild_tree(self):
        for item in self.tree.get_children():
            self.tree.delete(item)
        for index, source in enumerate(self.sources):
            if index < len(self.results):
                report = self.results[index]
                counts = report["counts"]
                values = self.tree_values_for_report(report)
            else:
                values = ("pendente", "-", "-", "-", "-", "-", "-", "-", "-", "-")
            self.tree.insert("", "end", iid=str(index), text=source["name"], values=values)
        if self.sort_column:
            self.apply_tree_sort()
            self.update_sort_headings()

    def sort_heading_text(self, column):
        label = self.tree_column_labels.get(column, column)
        if column != self.sort_column:
            return f"{label} ↕"
        return f"{label} {'↓' if self.sort_reverse else '↑'}"

    def update_sort_headings(self):
        if not hasattr(self, "tree") or not hasattr(self, "tree_column_labels"):
            return
        self.tree.heading("#0", text=self.sort_heading_text("arquivo"), command=lambda: self.sort_tree_by("arquivo"))
        for column in self.tree["columns"]:
            self.tree.heading(column, text=self.sort_heading_text(column), command=lambda c=column: self.sort_tree_by(c))

    def sortable_number(self, value):
        value = str(value).strip().replace(",", ".")
        if not value or value == "-":
            return None
        try:
            return float(value)
        except ValueError:
            return None

    def sort_value_for_item(self, item, column):
        if column == "arquivo":
            return self.tree.item(item, "text").casefold()
        if column in self.tree_numeric_columns:
            return self.sortable_number(self.tree.set(item, column))
        return str(self.tree.set(item, column)).casefold()

    def apply_tree_sort(self):
        if not self.sort_column:
            return
        items = list(self.tree.get_children(""))
        if not items:
            return
        selected = list(self.tree.selection())
        focus = self.tree.focus()
        if self.sort_column in self.tree_numeric_columns:
            valid_items = []
            empty_items = []
            for item in items:
                value = self.sort_value_for_item(item, self.sort_column)
                if value is None:
                    empty_items.append(item)
                else:
                    valid_items.append((value, self.tree.item(item, "text").casefold(), item))
            valid_items.sort(key=lambda row: (row[0], row[1]), reverse=self.sort_reverse)
            ordered = [item for _, _, item in valid_items] + empty_items
        else:
            ordered = sorted(items, key=lambda item: (self.sort_value_for_item(item, self.sort_column), self.tree.item(item, "text").casefold()), reverse=self.sort_reverse)
        for position, item in enumerate(ordered):
            self.tree.move(item, "", position)
        if selected:
            self.tree.selection_set([item for item in selected if self.tree.exists(item)])
        if focus and self.tree.exists(focus):
            self.tree.focus(focus)

    def sort_tree_by(self, column):
        if column == self.sort_column:
            self.sort_reverse = not self.sort_reverse
        else:
            self.sort_column = column
            self.sort_reverse = True if column in {"nota", "w3c_global", "w3c_html", "w3c_css", "amaweb"} else False
        self.apply_tree_sort()
        self.update_sort_headings()
        direction = "decrescente" if self.sort_reverse else "crescente"
        label = self.tree_column_labels.get(column, column)
        self.status.set(f"Tabela ordenada por {label.lower()} em ordem {direction}.")
        return "break"

    def run_analysis(self):
        if not self.sources:
            messagebox.showwarning("Sem arquivos", "Adicione arquivos HTML, cole um código ou adicione uma URL antes de analisar.")
            return
        reset_w3c_service_state()
        self.results = []
        for index, source in enumerate(self.sources):
            extra = " com W3C/AMAWeb online" if self.enable_w3c.get() else ""
            self.status.set(f"Analisando {source['name']}{extra}...")
            self.root.update_idletasks()
            try:
                report = Analyzer(source["name"], source["content"], source.get("path", ""), self.enable_w3c.get(), source.get("url", "")).analyze()
            except Exception:
                report = {
                    "file": source["name"],
                    "path": source.get("path", ""),
                    "size_bytes": len(source["content"].encode("utf-8", errors="replace")),
                    "elements_analyzed": 0,
                    "score": 0,
                    "counts": {"erro": 1, "revisar": 0, "aceito": 0},
                    "findings": [{"level": "erro", "rule": "Falha de análise", "message": traceback.format_exc(), "tag": "", "line": 0, "col": 0, "suggestion": "Verifique se o HTML está íntegro."}],
                    "accepted": [],
                    "w3c": self.default_w3c_report(),
                    "amaweb": self.default_amaweb_report(source),
                    "w3c_score": None,
                    "amaweb_score": None,
                    "accessibility_score": 0
                }
            self.results.append(report)
            self.tree.item(str(index), values=self.tree_values_for_report(report))
        if self.sort_column:
            self.apply_tree_sort()
            self.update_sort_headings()
        self.update_summary()
        self.btn_pdf.configure(state="normal")
        self.btn_json.configure(state="normal")
        self.btn_html.configure(state="normal")
        if self.results:
            first = self.tree.get_children()[0]
            self.tree.selection_set(first)
            self.tree.focus(first)
            self.show_report(0)
        self.status.set("Análise finalizada.")

    def update_summary(self):
        total_files = len(self.results)
        total_errors = sum(r["counts"].get("erro", 0) for r in self.results)
        total_review = sum(r["counts"].get("revisar", 0) for r in self.results)
        total_ok = sum(r["counts"].get("aceito", 0) for r in self.results)
        total_elements = sum(int(r.get("elements_analyzed") or 0) for r in self.results)
        total_amaweb_elements = sum(int(r.get("amaweb", {}).get("elements_analyzed") or 0) for r in self.results)
        avg = round(sum(r["score"] for r in self.results) / total_files, 1) if total_files else 0
        avg_w3c = self.average_optional_score(lambda r: r.get("w3c", {}).get("global", {}).get("score"))
        avg_amaweb = self.average_optional_score(lambda r: r.get("amaweb", {}).get("score"))
        w3c_text = self.score_text(avg_w3c)
        amaweb_text = self.score_text(avg_amaweb)
        amaweb_elements_text = total_amaweb_elements if total_amaweb_elements else "-"
        self.summary.set(f"{total_files} arquivo(s) analisado(s). Elementos analisados: {total_elements}. Elementos AMAWeb: {amaweb_elements_text}. Nota média acessibilidade: {avg}. Nota média W3C global: {w3c_text}. Nota média AMAWeb: {amaweb_text}. Erros: {total_errors}. Revisões manuais: {total_review}. Práticas aceitas: {total_ok}.")

    def on_select(self, _event):
        selected = self.tree.selection()
        if not selected:
            return
        try:
            index = int(selected[0])
        except ValueError:
            return
        if index < len(self.results):
            self.show_report(index)

    def show_report(self, index):
        self.current_report_index = index
        self.set_detail(self.format_report_text(self.results[index]))

    def set_detail(self, text):
        self.detail.configure(state="normal")
        self.detail.delete("1.0", "end")
        self.detail.insert("1.0", text)
        self.detail.configure(state="disabled")

    def format_report_text(self, report):
        lines = []
        actionable = [item for item in report["findings"] if item.get("level") != "info"]
        infos = [item for item in report["findings"] if item.get("level") == "info"]
        w3c = report.get("w3c", {})
        amaweb = report.get("amaweb", {})
        lines.append(f"Arquivo: {report['file']}")
        if report.get("path"):
            lines.append(f"Caminho: {report['path']}")
        lines.append(f"Tamanho: {report['size_bytes']} bytes")
        lines.append(f"Elementos analisados: {report['elements_analyzed']}")
        lines.append(f"Nota de acessibilidade: {report['score']}")
        lines.append(f"Nota W3C global: {self.score_text(w3c.get('global', {}).get('score'))}")
        lines.append(f"W3C HTML: {self.score_text(w3c.get('html', {}).get('score'))} | W3C CSS: {self.score_text(w3c.get('css', {}).get('score'))}")
        lines.append(f"Nota AMAWeb: {self.score_text(amaweb.get('score'))}")
        lines.append(f"Erros: {report['counts'].get('erro', 0)} | Revisar manualmente: {report['counts'].get('revisar', 0)} | Aceitos: {report['counts'].get('aceito', 0)}")
        lines.append("")
        lines.append("Itens de acessibilidade a corrigir")
        lines.append("-" * 72)
        if not actionable:
            lines.append("Nenhum item automático a corrigir foi identificado.")
        for idx, item in enumerate(actionable, 1):
            loc = ""
            if item.get("line"):
                loc = f" linha {item['line']}, coluna {item.get('col', 0)}"
            tag = f" <{item['tag']}>" if item.get("tag") else ""
            lines.append(f"{idx}. [{item['level'].upper()}] {item['rule']}{tag}{loc}")
            lines.append(f"   {item['message']}")
            if item.get("suggestion"):
                lines.append(f"   Sugestão: {item['suggestion']}")
            lines.append("")
        lines.append("Validação W3C separada")
        lines.append("-" * 72)
        global_w3c = w3c.get("global", {})
        lines.append(f"Global: {self.score_text(global_w3c.get('score'))} | Estado: {global_w3c.get('status', '-')}")
        if global_w3c.get("message"):
            lines.append(f"Observação: {global_w3c.get('message')}")
        for key, title in (("html", "HTML"), ("css", "CSS")):
            test = w3c.get(key, {})
            lines.append("")
            lines.append(f"W3C {title}: nota {self.score_text(test.get('score'))} | Estado: {test.get('status', '-')}")
            lines.append(f"Erros: {test.get('errors', 0)} | Avisos: {test.get('warnings', 0)} | Informações: {test.get('infos', 0)}")
            if test.get("message"):
                lines.append(f"Resumo: {test.get('message')}")
            items = test.get("items", [])
            if not items:
                lines.append("Nenhuma ocorrência listada.")
            for idx, item in enumerate(items, 1):
                loc = ""
                if item.get("line"):
                    loc = f" linha {item['line']}, coluna {item.get('col', 0)}"
                lines.append(f"{idx}. [{item.get('level', '').upper()}]{loc} {item.get('message', '')}")
                if item.get("suggestion"):
                    lines.append(f"   Sugestão: {item['suggestion']}")
        lines.append("")
        lines.append("Validação AMAWeb")
        lines.append("-" * 72)
        lines.append(f"AMAWeb: nota {self.score_text(amaweb.get('score'))} | Estado: {amaweb.get('status', '-')}")
        lines.append(f"Erros: {amaweb.get('errors', 0)} | Revisar: {amaweb.get('manual_review', 0)} | Aceitos: {amaweb.get('accepted', 0)}")
        if amaweb.get("source_url"):
            lines.append(f"URL analisada: {amaweb.get('source_url')}")
        if amaweb.get("result_url"):
            lines.append(f"Relatório AMAWeb: {amaweb.get('result_url')}")
        if amaweb.get("page_size"):
            lines.append(f"Tamanho da página no AMAWeb: {amaweb.get('page_size')}")
        if amaweb.get("elements_analyzed") is not None:
            lines.append(f"Elementos analisados no AMAWeb: {amaweb.get('elements_analyzed')}")
        if amaweb.get("practices_identified") is not None:
            lines.append(f"Práticas identificadas no AMAWeb: {amaweb.get('practices_identified')}")
        if amaweb.get("message"):
            lines.append(f"Resumo: {amaweb.get('message')}")
        ama_items = amaweb.get("items", [])
        if not ama_items:
            lines.append("Nenhuma ocorrência AMAWeb listada.")
        for idx, item in enumerate(ama_items, 1):
            lines.append(f"{idx}. [{item.get('level', '').upper()}] {item.get('message', '')}")
            if item.get("suggestion"):
                lines.append(f"   Sugestão: {item['suggestion']}")
        lines.append("")
        if infos:
            lines.append("Informações")
            lines.append("-" * 72)
            for idx, item in enumerate(infos, 1):
                lines.append(f"{idx}. [INFO] {item['rule']}")
                lines.append(f"   {item['message']}")
                if item.get("suggestion"):
                    lines.append(f"   Observação: {item['suggestion']}")
                lines.append("")
        lines.append("Práticas aceitas")
        lines.append("-" * 72)
        if not report["accepted"]:
            lines.append("Nenhuma prática aceita registrada.")
        for idx, item in enumerate(report["accepted"], 1):
            lines.append(f"{idx}. {item['rule']}: {item['message']}")
        return "\n".join(lines)

    def build_payload(self):
        generated = datetime.now().isoformat(timespec="seconds")
        total_files = len(self.results)
        return {
            "app": APP_NAME,
            "version": APP_VERSION,
            "generated_at": generated,
            "summary": {
                "files": total_files,
                "average_score": round(sum(r["score"] for r in self.results) / total_files, 1) if total_files else 0,
                "average_accessibility_score": round(sum(r["score"] for r in self.results) / total_files, 1) if total_files else 0,
                "average_w3c_score": self.average_optional_score(lambda r: r.get("w3c", {}).get("global", {}).get("score")),
                "average_w3c_html_score": self.average_optional_score(lambda r: r.get("w3c", {}).get("html", {}).get("score")),
                "average_w3c_css_score": self.average_optional_score(lambda r: r.get("w3c", {}).get("css", {}).get("score")),
                "average_amaweb_score": self.average_optional_score(lambda r: r.get("amaweb", {}).get("score")),
                "total_elements_analyzed": sum(int(r.get("elements_analyzed") or 0) for r in self.results),
                "total_amaweb_elements_analyzed": sum(int(r.get("amaweb", {}).get("elements_analyzed") or 0) for r in self.results),
                "errors": sum(r["counts"].get("erro", 0) for r in self.results),
                "manual_review": sum(r["counts"].get("revisar", 0) for r in self.results),
                "accepted": sum(r["counts"].get("aceito", 0) for r in self.results)
            },
            "reports": self.results
        }

    def export_json(self):
        if not self.results:
            messagebox.showwarning("Sem análise", "Analise os arquivos antes de baixar o JSON.")
            return
        path = filedialog.asksaveasfilename(title="Baixar JSON", defaultextension=".json", filetypes=[("JSON", "*.json")], initialfile="acessmonitor_relatorio.json")
        if not path:
            return
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.build_payload(), f, ensure_ascii=False, indent=2)
        self.status.set(f"JSON salvo em {path}")
        messagebox.showinfo("JSON salvo", "Relatório JSON gerado com sucesso.")

    def export_pdf(self):
        if not self.results:
            messagebox.showwarning("Sem análise", "Analise os arquivos antes de baixar o PDF.")
            return
        path = filedialog.asksaveasfilename(title="Baixar PDF", defaultextension=".pdf", filetypes=[("PDF", "*.pdf")], initialfile="acessmonitor_relatorio.pdf")
        if not path:
            return
        pdf = self.make_pdf()
        with open(path, "wb") as f:
            f.write(pdf)
        self.status.set(f"PDF salvo em {path}")
        messagebox.showinfo("PDF salvo", "Relatório PDF gerado com sucesso.")

    def export_html(self):
        if not self.results:
            messagebox.showwarning("Sem análise", "Analise os arquivos antes de baixar o HTML.")
            return
        path = filedialog.asksaveasfilename(title="Baixar HTML", defaultextension=".html", filetypes=[("HTML", "*.html")], initialfile="acessmonitor_relatorio.html")
        if not path:
            return
        with open(path, "w", encoding="utf-8") as f:
            f.write(self.make_html_report())
        self.status.set(f"HTML salvo em {path}")
        messagebox.showinfo("HTML salvo", "Relatório HTML gerado com sucesso.")

    def make_pdf(self):
        payload = self.build_payload()
        pdf = SimplePDF()
        pdf.paragraph(APP_NAME, 18, True)
        pdf.paragraph(f"Relatório gerado em {payload['generated_at']}", 10)
        pdf.rule()
        summary = payload["summary"]
        pdf.paragraph(f"Resumo: {summary['files']} arquivo(s), {summary.get('total_elements_analyzed', 0)} elemento(s) analisado(s) no total, {self.score_text(summary.get('total_amaweb_elements_analyzed'))} elemento(s) AMAWeb, nota média acessibilidade {summary['average_accessibility_score']}, nota média W3C global {self.score_text(summary.get('average_w3c_score'))}, nota média AMAWeb {self.score_text(summary.get('average_amaweb_score'))}, {summary['errors']} erro(s), {summary['manual_review']} revisão(ões) manual(is), {summary['accepted']} prática(s) aceita(s).", 11)
        for report in payload["reports"]:
            w3c = report.get("w3c", {})
            amaweb = report.get("amaweb", {})
            pdf.rule()
            pdf.paragraph(f"Arquivo: {report['file']}", 13, True)
            if report.get("path"):
                pdf.paragraph(f"Caminho: {report['path']}", 9)
            pdf.paragraph(f"Nota acessibilidade: {report['score']} | W3C global: {self.score_text(w3c.get('global', {}).get('score'))} | W3C HTML: {self.score_text(w3c.get('html', {}).get('score'))} | W3C CSS: {self.score_text(w3c.get('css', {}).get('score'))} | AMAWeb: {self.score_text(amaweb.get('score'))}", 10, True)
            pdf.paragraph(f"Elementos analisados: {report['elements_analyzed']} | Erros acess.: {report['counts'].get('erro', 0)} | Revisar: {report['counts'].get('revisar', 0)} | Aceitos: {report['counts'].get('aceito', 0)}", 10, True)
            actionable = [item for item in report["findings"] if item.get("level") != "info"]
            infos = [item for item in report["findings"] if item.get("level") == "info"]
            pdf.paragraph("Itens de acessibilidade a corrigir", 10, True)
            if not actionable:
                pdf.paragraph("Nenhum item automático a corrigir foi identificado.", 10)
            for idx, item in enumerate(actionable, 1):
                loc = ""
                if item.get("line"):
                    loc = f" linha {item['line']}, coluna {item.get('col', 0)}"
                title = f"{idx}. [{item['level'].upper()}] {item['rule']}{loc}"
                pdf.paragraph(title, 10, True)
                pdf.paragraph(item["message"], 9, False, 12)
                if item.get("suggestion"):
                    pdf.paragraph(f"Sugestão: {item['suggestion']}", 9, False, 12)
            pdf.paragraph("Validação W3C separada", 10, True)
            for key, title in (("html", "HTML"), ("css", "CSS")):
                test = w3c.get(key, {})
                pdf.paragraph(f"W3C {title}: nota {self.score_text(test.get('score'))} | estado {test.get('status', '-')} | erros {test.get('errors', 0)} | avisos {test.get('warnings', 0)}", 9, True)
                if test.get("message"):
                    pdf.paragraph(test.get("message"), 8, False, 12)
                for idx, item in enumerate(test.get("items", [])[:30], 1):
                    loc = ""
                    if item.get("line"):
                        loc = f" linha {item['line']}, coluna {item.get('col', 0)}"
                    pdf.paragraph(f"{idx}. [{item.get('level', '').upper()}]{loc} {item.get('message', '')}", 8, False, 12)
            pdf.paragraph("Validação AMAWeb", 10, True)
            pdf.paragraph(f"AMAWeb: nota {self.score_text(amaweb.get('score'))} | estado {amaweb.get('status', '-')} | erros {amaweb.get('errors', 0)} | revisar {amaweb.get('manual_review', 0)} | aceitos {amaweb.get('accepted', 0)}", 9, True)
            if amaweb.get("result_url"):
                pdf.paragraph(f"Relatório AMAWeb: {amaweb.get('result_url')}", 8, False, 12)
            if amaweb.get("message"):
                pdf.paragraph(amaweb.get("message"), 8, False, 12)
            for idx, item in enumerate(amaweb.get("items", [])[:30], 1):
                pdf.paragraph(f"{idx}. [{item.get('level', '').upper()}] {item.get('message', '')}", 8, False, 12)
            if infos:
                pdf.paragraph("Informações", 10, True)
                for idx, item in enumerate(infos, 1):
                    pdf.paragraph(f"{idx}. [INFO] {item['rule']}", 9, True)
                    pdf.paragraph(item["message"], 8, False, 12)
        return pdf.finish()

    def make_html_report(self):
        payload = self.build_payload()
        css = "body{font-family:Arial,sans-serif;margin:32px;color:#172033;background:#f8fafc}main{max-width:1120px;margin:auto}section{background:white;border:1px solid #e5e7eb;border-radius:16px;padding:22px;margin:18px 0;box-shadow:0 10px 30px rgba(15,23,42,.06)}h1,h2,h3{margin-top:0}.meta{color:#64748b}.pill{display:inline-block;border-radius:999px;padding:4px 10px;background:#e2e8f0;margin:3px}.erro{background:#fee2e2}.revisar{background:#fef3c7}.aceito{background:#dcfce7}.info{background:#dbeafe}.w3c{background:#ede9fe}.amaweb{background:#ccfbf1}li{margin:10px 0}.suggestion{color:#334155}"
        out = ["<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><title>AcessMonitor relatório</title><style>", css, "</style></head><body><main><h1>AcessMonitor via Code</h1>"]
        out.append(f"<p class='meta'>Relatório gerado em {html.escape(payload['generated_at'])}</p>")
        summary = payload["summary"]
        out.append(f"<section><h2>Resumo</h2><p><span class='pill'>Arquivos: {summary['files']}</span><span class='pill'>Elementos analisados: {summary.get('total_elements_analyzed', 0)}</span><span class='pill amaweb'>Elementos AMAWeb: {html.escape(str(self.score_text(summary.get('total_amaweb_elements_analyzed'))))}</span><span class='pill'>Nota acessibilidade: {summary['average_accessibility_score']}</span><span class='pill w3c'>W3C global: {html.escape(str(self.score_text(summary.get('average_w3c_score'))))}</span><span class='pill w3c'>W3C HTML: {html.escape(str(self.score_text(summary.get('average_w3c_html_score'))))}</span><span class='pill w3c'>W3C CSS: {html.escape(str(self.score_text(summary.get('average_w3c_css_score'))))}</span><span class='pill amaweb'>AMAWeb: {html.escape(str(self.score_text(summary.get('average_amaweb_score'))))}</span><span class='pill erro'>Erros: {summary['errors']}</span><span class='pill revisar'>Revisar: {summary['manual_review']}</span><span class='pill aceito'>Aceitos: {summary['accepted']}</span></p></section>")
        for report in payload["reports"]:
            w3c = report.get("w3c", {})
            amaweb = report.get("amaweb", {})
            out.append("<section>")
            out.append(f"<h2>{html.escape(report['file'])}</h2>")
            if report.get("path"):
                out.append(f"<p class='meta'>{html.escape(report['path'])}</p>")
            out.append(f"<p><span class='pill'>Nota acessibilidade: {report['score']}</span><span class='pill w3c'>W3C global: {html.escape(str(self.score_text(w3c.get('global', {}).get('score'))))}</span><span class='pill w3c'>W3C HTML: {html.escape(str(self.score_text(w3c.get('html', {}).get('score'))))}</span><span class='pill w3c'>W3C CSS: {html.escape(str(self.score_text(w3c.get('css', {}).get('score'))))}</span><span class='pill amaweb'>AMAWeb: {html.escape(str(self.score_text(amaweb.get('score'))))}</span><span class='pill'>Elementos: {report['elements_analyzed']}</span><span class='pill erro'>Erros: {report['counts'].get('erro', 0)}</span><span class='pill revisar'>Revisar: {report['counts'].get('revisar', 0)}</span><span class='pill aceito'>Aceitos: {report['counts'].get('aceito', 0)}</span></p>")
            actionable = [item for item in report["findings"] if item.get("level") != "info"]
            infos = [item for item in report["findings"] if item.get("level") == "info"]
            out.append("<h3>Itens de acessibilidade a corrigir</h3><ol>")
            if not actionable:
                out.append("<li>Nenhum item automático a corrigir foi identificado.</li>")
            for item in actionable:
                loc = ""
                if item.get("line"):
                    loc = f" linha {item['line']}, coluna {item.get('col', 0)}"
                out.append(f"<li><strong>[{html.escape(item['level'].upper())}] {html.escape(item['rule'])}{html.escape(loc)}</strong><br>{html.escape(item['message'])}")
                if item.get("suggestion"):
                    out.append(f"<br><span class='suggestion'>Sugestão: {html.escape(item['suggestion'])}</span>")
                out.append("</li>")
            out.append("</ol>")
            out.append("<h3>Validação W3C separada</h3>")
            global_w3c = w3c.get("global", {})
            out.append(f"<p><span class='pill w3c'>Global: {html.escape(str(self.score_text(global_w3c.get('score'))))}</span><span class='pill'>{html.escape(global_w3c.get('status', '-'))}</span></p>")
            for key, title in (("html", "HTML"), ("css", "CSS")):
                test = w3c.get(key, {})
                out.append(f"<h4>W3C {title}</h4><p><span class='pill w3c'>Nota: {html.escape(str(self.score_text(test.get('score'))))}</span><span class='pill'>Estado: {html.escape(test.get('status', '-'))}</span><span class='pill erro'>Erros: {test.get('errors', 0)}</span><span class='pill revisar'>Avisos: {test.get('warnings', 0)}</span><span class='pill info'>Infos: {test.get('infos', 0)}</span></p>")
                if test.get("message"):
                    out.append(f"<p>{html.escape(test.get('message'))}</p>")
                out.append("<ol>")
                if not test.get("items"):
                    out.append("<li>Nenhuma ocorrência listada.</li>")
                for item in test.get("items", []):
                    loc = ""
                    if item.get("line"):
                        loc = f" linha {item['line']}, coluna {item.get('col', 0)}"
                    out.append(f"<li><strong>[{html.escape(item.get('level', '').upper())}]{html.escape(loc)}</strong><br>{html.escape(item.get('message', ''))}")
                    if item.get("suggestion"):
                        out.append(f"<br><span class='suggestion'>Sugestão: {html.escape(item['suggestion'])}</span>")
                    out.append("</li>")
                out.append("</ol>")
            out.append("<h3>Validação AMAWeb</h3>")
            out.append(f"<p><span class='pill amaweb'>Nota: {html.escape(str(self.score_text(amaweb.get('score'))))}</span><span class='pill'>Estado: {html.escape(amaweb.get('status', '-'))}</span><span class='pill erro'>Erros: {amaweb.get('errors', 0)}</span><span class='pill revisar'>Revisar: {amaweb.get('manual_review', 0)}</span><span class='pill aceito'>Aceitos: {amaweb.get('accepted', 0)}</span></p>")
            if amaweb.get("source_url"):
                out.append(f"<p class='meta'>URL analisada: {html.escape(amaweb.get('source_url'))}</p>")
            if amaweb.get("result_url"):
                out.append(f"<p class='meta'>Relatório AMAWeb: {html.escape(amaweb.get('result_url'))}</p>")
            if amaweb.get("message"):
                out.append(f"<p>{html.escape(amaweb.get('message'))}</p>")
            out.append("<ol>")
            if not amaweb.get("items"):
                out.append("<li>Nenhuma ocorrência AMAWeb listada.</li>")
            for item in amaweb.get("items", []):
                out.append(f"<li><strong>[{html.escape(item.get('level', '').upper())}]</strong><br>{html.escape(item.get('message', ''))}")
                if item.get("suggestion"):
                    out.append(f"<br><span class='suggestion'>Sugestão: {html.escape(item['suggestion'])}</span>")
                out.append("</li>")
            out.append("</ol>")
            if infos:
                out.append("<h3>Informações</h3><ol>")
                for item in infos:
                    out.append(f"<li><strong>[INFO] {html.escape(item['rule'])}</strong><br>{html.escape(item['message'])}")
                    if item.get("suggestion"):
                        out.append(f"<br><span class='suggestion'>Observação: {html.escape(item['suggestion'])}</span>")
                    out.append("</li>")
                out.append("</ol>")
            out.append("<h3>Práticas aceitas</h3><ol>")
            if not report["accepted"]:
                out.append("<li>Nenhuma prática aceita registrada.</li>")
            for item in report["accepted"]:
                out.append(f"<li><strong>{html.escape(item['rule'])}</strong>: {html.escape(item['message'])}</li>")
            out.append("</ol></section>")
        out.append("</main></body></html>")
        return "".join(out)

def main():
    root = tk.Tk()
    app = AcessMonitorApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
