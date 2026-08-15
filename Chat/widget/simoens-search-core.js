(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SiMoEnsSearchCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var STOP_WORDS = new Set([
    'a', 'ao', 'aos', 'aquela', 'aquele', 'aquilo', 'as', 'ate', 'com', 'como', 'da', 'das', 'de', 'dela', 'dele',
    'do', 'dos', 'e', 'ela', 'ele', 'em', 'entre', 'era', 'essa', 'esse', 'esta', 'este', 'eu', 'foi', 'ha', 'isso',
    'isto', 'ja', 'la', 'lhe', 'mais', 'mas', 'me', 'mesmo', 'meu', 'minha', 'muito', 'na', 'nas', 'no', 'nos',
    'nossa', 'nosso', 'o', 'os', 'ou', 'para', 'pela', 'pelo', 'por', 'qual', 'quando', 'que', 'quem', 'se', 'sem',
    'ser', 'seu', 'sua', 'tambem', 'tem', 'uma', 'um', 'voce', 'voces'
  ]);

  var TOKEN_CORRECTIONS = Object.freeze({
    molcular: 'molecular',
    molecuar: 'molecular',
    molecluar: 'molecular',
    geometriaa: 'geometria',
    geometrio: 'geometria',
    celuar: 'celular',
    celulla: 'celula',
    unitariaa: 'unitaria',
    cristalinoo: 'cristalino',
    cristlografia: 'cristalografia',
    cristalografiaa: 'cristalografia',
    polaridadee: 'polaridade',
    orbitall: 'orbital',
    covalentee: 'covalente',
    hidrogenoidees: 'hidrogenoides',
    estequiometriaa: 'estequiometria',
    intermolcular: 'intermolecular',
    termodinamicaa: 'termodinamica'
  });

  var CATEGORY_ALIASES = Object.freeze({
    exercise: ['exercicio', 'exercicios', 'atividade', 'atividades', 'praticar', 'pratica', 'treinar', 'resolver'],
    guide: ['guia', 'guias', 'tutorial', 'tutoriais', 'passo a passo', 'material', 'materiais', 'material de estudo', 'estudar', 'aprender'],
    animation: ['animacao', 'animacoes', 'visualizador', 'visualizadores', 'simulador', 'simuladores', 'simulacao', 'simulacoes', 'modelo 3d', 'ver em 3d', 'visualizar'],
    game: ['jogo', 'jogos', 'quiz', 'jogar', 'desafio', 'revisar jogando']
  });

  function normalize(value) {
    return String(value == null ? '' : value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  function lightStem(token) {
    var word = TOKEN_CORRECTIONS[token] || token;
    if (word.length <= 4 || /^(vsepr|wigner|seitz|bravais|nacl|cscl|zns|fcc|bcc|sc)$/.test(word)) return word;
    if (word.length >= 7 && word.endsWith('coes')) return word.slice(0, -4) + 'cao';
    if (word.length >= 6 && word.endsWith('ais')) return word.slice(0, -3) + 'al';
    if (word.length >= 6 && word.endsWith('eis')) return word.slice(0, -3) + 'el';
    var suffixes = [
      'amentos', 'imentos', 'adoras', 'adores', 'acoes', 'icoes', 'ezas', 'ismos', 'istas',
      'amento', 'imento', 'adora', 'ador', 'logias', 'encias', 'idades', 'mente',
      'acao', 'icao', 'logia', 'encia', 'idade', 'ivas', 'ivos', 'iva', 'ivo',
      'antes', 'ancia', 'ico', 'ica', 'icos', 'icas', 'osos', 'osas', 'oso', 'osa',
      'ais', 'eis', 'oes', 'es', 's'
    ];
    for (var i = 0; i < suffixes.length; i += 1) {
      var suffix = suffixes[i];
      if (word.length - suffix.length >= 4 && word.endsWith(suffix)) return word.slice(0, -suffix.length);
    }
    return word;
  }

  function tokenize(value, options) {
    var config = options || {};
    return normalize(value)
      .split(' ')
      .filter(Boolean)
      .map(function (token) { return TOKEN_CORRECTIONS[token] || token; })
      .filter(function (token) { return config.keepStopWords || !STOP_WORDS.has(token); })
      .filter(function (token) { return token.length > 1 || /^(h|c|n|o|p|s|k)$/.test(token); })
      .map(function (token) { return config.stem === false ? token : lightStem(token); });
  }

  function termFrequency(tokens) {
    var counts = Object.create(null);
    tokens.forEach(function (token) { counts[token] = (counts[token] || 0) + 1; });
    return counts;
  }

  function normalizePath(value) {
    var path = String(value || '').split(/[?#]/)[0];
    try { path = decodeURIComponent(path); } catch (_) {}
    return path
      .replace(/\\/g, '/')
      .replace(/^https?:\/\/[^/]+\//i, '')
      .replace(/^\/+/, '')
      .replace(/^quimica-visual\/?/i, '')
      .replace(/\/+/g, '/')
      .toLowerCase();
  }

  function documentFields(raw, index) {
    var doc = raw || {};
    return {
      id: String(doc.id || doc.source || doc.file_name || index),
      title: String(doc.title || doc.file_name || ''),
      topics: Array.isArray(doc.topics) ? doc.topics.join(' ') : String(doc.topics || doc.keywords || ''),
      category: String(doc.category || doc.registryCategory || ''),
      source: String(doc.source || doc.path || doc.url || ''),
      body: String(doc.text || doc.description || doc.summary || doc.content || '')
    };
  }

  function resolveResourceByPath(resources, pathname) {
    var list = Array.isArray(resources) ? resources : [];
    var path = normalizePath(pathname);
    if (!path) return null;
    function routeKey(value) {
      return normalizePath(value)
        .replace(/#.*$/, '')
        .replace(/\/index\.html$/, '')
        .replace(/^index\.html$/, '')
        .replace(/\/+$/, '');
    }
    var exact = list.find(function (entry) { return normalizePath(entry.path || entry.url) === path; });
    if (exact) return exact;
    var key = routeKey(path);
    var canonical = list.find(function (entry) { return routeKey(entry.path || entry.url) === key; });
    if (canonical) return canonical;
    var ancestor = list
      .map(function (entry) { return { entry: entry, key: routeKey(entry.path || entry.url) }; })
      .filter(function (candidate) { return candidate.key && key.startsWith(candidate.key + '/'); })
      .sort(function (left, right) { return right.key.length - left.key.length; })[0];
    if (ancestor) return ancestor.entry;
    var basename = path.replace(/^.*\//, '');
    if (!basename || basename === 'index.html') return null;
    var matches = list.filter(function (entry) { return normalizePath(entry.path || entry.url).replace(/^.*\//, '') === basename; });
    return matches.length === 1 ? matches[0] : null;
  }

  function createIndex(documents, options) {
    var config = options || {};
    var fieldWeights = Object.assign({ title: 4.2, topics: 2.8, category: 1.8, source: 1.5, body: 1 }, config.fieldWeights || {});
    var docs = (Array.isArray(documents) ? documents : []).map(function (raw, index) {
      var fields = documentFields(raw, index);
      var weighted = Object.create(null);
      var unweightedLength = 0;
      Object.keys(fieldWeights).forEach(function (field) {
        var tokens = tokenize(fields[field]);
        unweightedLength += tokens.length;
        var frequencies = termFrequency(tokens);
        Object.keys(frequencies).forEach(function (term) {
          weighted[term] = (weighted[term] || 0) + frequencies[term] * fieldWeights[field];
        });
      });
      return {
        raw: raw,
        fields: fields,
        terms: weighted,
        length: Math.max(1, unweightedLength),
        normalizedTitle: normalize(fields.title),
        normalizedTopics: normalize(fields.topics),
        normalizedSource: normalizePath(fields.source),
        normalizedBody: normalize(fields.body)
      };
    });
    var documentFrequency = Object.create(null);
    docs.forEach(function (doc) {
      Object.keys(doc.terms).forEach(function (term) {
        documentFrequency[term] = (documentFrequency[term] || 0) + 1;
      });
    });
    var averageLength = docs.length ? docs.reduce(function (sum, doc) { return sum + doc.length; }, 0) / docs.length : 1;
    return { docs: docs, documentFrequency: documentFrequency, averageLength: averageLength, size: docs.length };
  }

  function search(index, query, options) {
    var config = options || {};
    if (!index || !Array.isArray(index.docs) || !index.docs.length) return [];
    var queryText = normalize(query);
    var queryTokens = Array.from(new Set(tokenize(queryText)));
    if (!queryTokens.length) return [];
    var k1 = Number.isFinite(config.k1) ? config.k1 : 1.35;
    var b = Number.isFinite(config.b) ? config.b : 0.72;
    var currentPath = normalizePath(config.currentPath || '');
    var relatedSources = new Set((config.relatedSources || []).map(normalizePath));
    var contextTokens = new Set(tokenize(config.contextText || ''));
    var ranked = index.docs.map(function (doc) {
      var score = 0;
      queryTokens.forEach(function (term) {
        var frequency = doc.terms[term] || 0;
        if (!frequency) return;
        var df = index.documentFrequency[term] || 0;
        var idf = Math.log(1 + ((index.size - df + 0.5) / (df + 0.5)));
        var denominator = frequency + k1 * (1 - b + b * (doc.length / index.averageLength));
        score += idf * ((frequency * (k1 + 1)) / denominator);
      });
      if (queryText.length >= 4) {
        if (doc.normalizedTitle === queryText) score += 8;
        else if (doc.normalizedTitle.includes(queryText)) score += 5;
        if (doc.normalizedTopics.includes(queryText)) score += 3.2;
        if (doc.normalizedBody.includes(queryText)) score += 2.4;
      }
      if (/(?:^| )(?:quais|lista|todos|opcoes|disponiveis|existem)(?: |$)/.test(queryText)
          && (doc.normalizedTitle.includes('indice') || /\/00_[^/]+$/i.test(doc.normalizedSource))) {
        score += 6;
      }
      if (currentPath && doc.normalizedSource) {
        var sourceStem = doc.normalizedSource.replace(/\/index\.html$/, '');
        var currentStem = currentPath.replace(/\/index\.html$/, '');
        if (sourceStem && currentStem && (sourceStem.includes(currentStem) || currentStem.includes(sourceStem))) score += 5.5;
      }
      if (doc.normalizedSource && relatedSources.has(doc.normalizedSource)) score += 2.2;
      if (contextTokens.size) {
        var overlap = 0;
        contextTokens.forEach(function (term) { if (doc.terms[term]) overlap += 1; });
        score += Math.min(2.4, overlap * 0.35);
      }
      return { item: doc.raw, score: score, id: doc.fields.id };
    }).filter(function (result) {
      return result.score >= (Number.isFinite(config.minScore) ? config.minScore : 0.15);
    });
    ranked.sort(function (left, right) {
      return right.score - left.score || String(left.id).localeCompare(String(right.id), 'pt-BR');
    });
    return ranked.slice(0, Number.isFinite(config.limit) ? Math.max(1, config.limit) : 5);
  }

  function hasAny(text, patterns) {
    return patterns.some(function (pattern) { return pattern.test(text); });
  }

  function requestedCategory(value) {
    var text = normalize(value);
    var explicitCategories = [
      ['exercise', /\b(?:exercicio|exercicios|atividade|atividades)\b/],
      ['guide', /\b(?:guia|guias|tutorial|tutoriais|material|materiais|material de estudo)\b/],
      ['animation', /\b(?:animacao|animacoes|visualizador|visualizadores|simulador|simuladores|simulacao|simulacoes|modelo 3d)\b/],
      ['game', /\b(?:jogo|jogos|quiz|desafio)\b/]
    ];
    var explicitCategory = explicitCategories.find(function (candidate) { return candidate[1].test(text); });
    if (explicitCategory) return explicitCategory[0];
    var fallbackOrder = ['game', 'animation', 'exercise', 'guide'];
    for (var i = 0; i < fallbackOrder.length; i += 1) {
      var category = fallbackOrder[i];
      if (CATEGORY_ALIASES[category].some(function (alias) {
        var normalizedAlias = normalize(alias);
        return normalizedAlias && new RegExp('(?:^| )' + normalizedAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?: |$)').test(text);
      })) return category;
    }
    return '';
  }

  function detectFollowupMode(value) {
    var text = normalize(value);
    if (!text) return 'none';
    if (hasAny(text, [/\bnao entendi\b/, /\bmais simples\b/, /\bde outro jeito\b/, /\bem palavras simples\b/, /\bexplique melhor\b/, /\bexplica melhor\b/])) return 'simplify';
    if (hasAny(text, [/\b(?:de|da|um|uma|outro|outros)? exemplos?\b/, /\baplicacao pratica\b/, /\bna pratica\b/])) return 'example';
    if (hasAny(text, [/\bmais detalhes\b/, /\baprofunde\b/, /\bquero entender melhor\b/, /^por que isso\b/, /^e por que\b/, /^como isso\b/])) return 'deepen';
    if (hasAny(text, [/\brepita\b/, /\bde novo\b/, /\bo que voce disse\b/])) return 'repeat';
    return 'none';
  }

  function resolveOrdinal(value) {
    var text = normalize(value);
    var patterns = [
      { index: 0, pattern: /\b(?:primeiro|primeira|1|1o|1a)\b/ },
      { index: 1, pattern: /\b(?:segundo|segunda|2|2o|2a)\b/ },
      { index: 2, pattern: /\b(?:terceiro|terceira|3|3o|3a)\b/ }
    ];
    var match = patterns.find(function (candidate) { return candidate.pattern.test(text); });
    return match ? match.index : -1;
  }

  function resolveSelectionOrdinal(value) {
    var text = normalize(value);
    var index = resolveOrdinal(text);
    if (index < 0) return -1;
    if (/\b(?:opcao|alternativa|recurso|link)\b/.test(text)) return index;
    if (/^(?:abra|abrir|quero|acesse|acessar|mostre|mostrar|escolho|escolha) (?:a|o)? ?(?:primeiro|primeira|segundo|segunda|terceiro|terceira|[123])$/.test(text)) return index;
    return -1;
  }

  function detectIntent(value) {
    var text = normalize(value);
    if (!text) return { name: 'empty', confidence: 1 };
    if (/^(?:oi|ola|opa|e ai|bom dia|boa tarde|boa noite|saudacoes)(?: |$)/.test(text)) return { name: 'greeting', confidence: 0.99 };
    if (/^(?:obrigado|obrigada|valeu|agradeco|perfeito|entendi|show)(?: |$)/.test(text)) return { name: 'acknowledgement', confidence: 0.96 };
    if (hasAny(text, [/\bo que voce pode fazer\b/, /\bcomo voce pode ajudar\b/, /\bmostrar instrucoes\b/, /^ajuda$/, /^instrucoes$/])) return { name: 'help', confidence: 0.98 };
    if (hasAny(text, [/\bo que (?:eu )?estou vendo\b/, /\bo que (?:e|mostra|ensina) (?:esta|essa) (?:pagina|tela|animacao|atividade)\b/, /^\s*(?:esta|essa) (?:pagina|tela|animacao|atividade)\s*$/, /\bonde estou\b/, /\bconteudo atual\b/])) return { name: 'identify-current-experience', confidence: 0.98 };
    if (hasAny(text, [/\bacessibilidade\b/, /\bleitor de tela\b/, /\bcontraste\b/, /\breduzir (?:efeitos|movimento)\b/, /\baumentar fonte\b/, /\bguia de leitura\b/, /\bdaltonismo\b/, /\bouvir (?:a pagina|o texto)\b/])) return { name: 'accessibility-help', confidence: 0.94 };
    if (hasAny(text, [/\bcomo (?:uso|mexo|interajo|giro|arrasto|controlo)\b/, /\bpara que serve (?:esse|este) (?:botao|controle|slider|menu)\b/, /\bo que faz (?:esse|este) (?:botao|controle|slider|menu)\b/, /\bcomo funciona (?:essa|esta) (?:tela|animacao|atividade)\b/])) return { name: 'explain-interface', confidence: 0.93 };
    if (hasAny(text, [/\bmapa do site\b/, /\bo que (?:tem|existe) no simoens\b/, /\bquais conteudos\b/, /\bvisao geral do site\b/])) return { name: 'site-overview', confidence: 0.93 };

    var category = requestedCategory(text);
    var recommendationSignal = hasAny(text, [
      /\b(?:indique|indica|recomende|recomenda|sugira|sugere)\b/,
      /\b(?:tem|existe|ha) (?:algum|alguma|um|uma|quais?)\b/,
      /\b(?:onde|como) (?:encontro|acho|acesso)\b/,
      /\b(?:qual|quais) (?:eu )?(?:posso|devo) (?:fazer|ver|estudar|jogar)\b/,
      /\b(?:quero|posso) (?:praticar|treinar|estudar|aprender|visualizar|jogar)\b/
    ]);
    if (category && !/\b(?:esse|este|essa|esta) (?:exercicio|atividade|guia|tutorial|animacao|visualizador|jogo)\b/.test(text)) {
      recommendationSignal = recommendationSignal || /\b(?:qual|quais|tem|existe|existem|ha|onde)\b/.test(text);
      recommendationSignal = recommendationSignal || /^(?:exercicio|atividade|guia|tutorial|animacao|visualizador|simulador|simulacao|jogo)s?\b.*\b(?:sobre|de|para)\b/.test(text);
    }
    var directLinkSignal = /\b(?:link|url|abra|abrir|acesse|acessar)\b/.test(text);
    if (category && recommendationSignal && !directLinkSignal) return { name: 'recommend-resource', category: category, confidence: 0.96 };
    if (!category && !directLinkSignal && /\b(?:indique|indica|recomende|recomenda|sugira|sugere)\b/.test(text)) {
      return { name: 'recommend-resource', category: '', confidence: 0.9 };
    }
    if (hasAny(text, [/\b(?:faca|crie|gere|mande|me passe) (?:uma|um|duas|dois|\d+)? ?(?:questao|questoes|pergunta|perguntas|simulado)\b/, /\bme teste\b/])) return { name: 'generate-practice', confidence: 0.96 };
    if (hasAny(text, [/\b(?:onde|como) (?:encontro|acho|abro|acesso|vou)\b/, /\bqual (?:e o )?link\b/, /\b(?:abra|abrir|acesse|acessar)\b/, /\bnaveg/])) return { name: 'navigation-help', confidence: 0.9 };
    if (hasAny(text, [/\bcompare\b/, /\bdiferenca entre\b/, /\bqual a diferenca\b/])) return { name: 'compare-concepts', confidence: 0.88 };
    if (hasAny(text, [/\bresuma\b/, /\bresumo\b/, /\bsintetize\b/, /\bpontos principais\b/])) return { name: 'summarize', confidence: 0.94 };
    if (detectFollowupMode(text) !== 'none' || hasAny(text, [/^(?:e |mas |entao |nesse caso )/, /\b(?:isso|nisso|disso|ele|ela|esse|essa|anterior)\b/])) return { name: 'clarify-previous', mode: detectFollowupMode(text), confidence: 0.84 };
    if (hasAny(text, [/\bexplique\b/, /\bo que e\b/, /\bcomo funciona\b/, /\bpor que\b/, /\bdefina\b/])) return { name: 'explain-concept', confidence: 0.82 };
    return { name: 'general-chemistry', confidence: 0.5 };
  }

  function recommendationPolicy(value) {
    var text = normalize(value);
    var intent = detectIntent(text);
    var category = intent.category || requestedCategory(text);
    var asksForList = hasAny(text, [/\b(?:quais|opcoes|lista|liste|todos|todas)\b/, /\bmais de (?:um|uma)\b/]);
    return {
      shouldRecommend: intent.name === 'recommend-resource',
      category: category,
      maxResults: asksForList ? 3 : 1,
      mode: asksForList ? 'list' : 'single',
      intent: intent.name,
      explicit: intent.name === 'recommend-resource'
    };
  }

  function isContextualReference(value) {
    var text = normalize(value);
    return /^(?:e|mas|entao|nesse caso)\b/.test(text)
      || /\b(?:isso|nisso|disso|esse|essa|ele|ela|anterior|sobre isso)\b/.test(text)
      || /\b(?:primeiro|primeira|segundo|segunda|terceiro|terceira) (?:opcao|alternativa|recurso|link)\b/.test(text)
      || /^(?:abra|quero|acesse|mostre) (?:a|o) (?:primeiro|primeira|segundo|segunda|terceiro|terceira)$/.test(text)
      || /^(?:resuma|resumo|sintetize)(?: (?:os )?pontos principais| a resposta)?$/.test(text)
      || detectFollowupMode(text) !== 'none';
  }

  var ELEMENT_SYMBOLS = new Set(('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og').split(' '));

  function hasChemistryFormula(value) {
    var raw = String(value || '').trim();
    if (!raw) return false;
    var singleSymbol = raw.match(/^([A-Z][a-z]?)[?!.]*$/);
    if (singleSymbol && ELEMENT_SYMBOLS.has(singleSymbol[1])) return true;
    var candidates = raw.match(/\b(?:[A-Z][a-z]?\d*){2,8}\b/g) || [];
    return candidates.some(function (candidate) {
      var symbols = candidate.match(/[A-Z][a-z]?/g) || [];
      return symbols.length >= 2 && symbols.every(function (symbol) { return ELEMENT_SYMBOLS.has(symbol); });
    });
  }

  function isLikelyInScope(value) {
    var text = normalize(value);
    if (!text) return false;
    if (hasChemistryFormula(value)) return true;
    var intent = detectIntent(text);
    if (['greeting', 'acknowledgement', 'help', 'identify-current-experience', 'accessibility-help',
      'explain-interface', 'site-overview', 'recommend-resource'].includes(intent.name)) return true;
    if (intent.name === 'generate-practice') {
      return !/\b(?:matematica|fisica|biologia|historia|geografia|portugues|literatura|programacao|futebol)\b/.test(text);
    }
    if (isContextualReference(text)) return true;
    var scopeText = text + ' ' + tokenize(text, { stem: false }).join(' ');
    return /\b(?:simoens|quimica|quimico|atomo|atomico|elemento|molecula|molecular|geometria|ion|ionico|cation|anion|eletron|proton|neutron|orbital|ligacao|covalente|metalica|intermolecular|lewis|vsepr|polaridade|dipolo|estequiometria|reacao|reagente|produto|nox|oxidacao|reducao|acido|base|sal|oxido|ph|solucao|solvente|soluto|concentracao|mol|massa molar|termodinamica|entalpia|entropia|gibbs|cinetica|equilibrio|catalisador|cristal|cristalografia|celula unitaria|bravais|miller|empacotamento|intersticio|vacancia|frenkel|schottky|coordenacao|complexo|ligante|campo cristalino|organica|isomeria|polimero|laboratorio|vidraria|bureta|pipeta|bequer|erlenmeyer|gema|mineral|esmeralda|rubi|safira|quartzo|diamante|tabela periodica|modelo atomico|bohr|rutherford|schrodinger|hidrogenoide)\b/.test(scopeText);
  }

  function extractSubject(value) {
    var ignored = new Set([
      'explique', 'explica', 'entender', 'resuma', 'resumo', 'compare', 'indique', 'indica', 'recomende', 'recomenda', 'sugira',
      'exercicio', 'exercicios', 'atividade', 'atividades', 'guia', 'guias', 'tutorial', 'material', 'materiais', 'animacao', 'animacoes', 'visualizador',
      'visualizadores', 'simulador', 'simuladores', 'simulacao', 'simulacoes', 'jogo', 'jogos', 'conceito', 'sobre', 'fazer',
      'agora', 'quero', 'gostaria', 'posso', 'devo', 'algum', 'alguma', 'algo',
      'qual', 'quais', 'mais', 'simples', 'detalhes', 'exemplo', 'exemplos', 'entendi', 'entender', 'onde', 'encontro',
      'acho', 'acesso', 'acesse', 'acessar', 'abra', 'abrir', 'mostre', 'mostrar', 'liste', 'lista', 'existe', 'existem',
      'estudar', 'estudo', 'praticar', 'treinar', 'visualizar', 'jogar', 'jogando', 'recurso', 'recursos', 'opcao', 'opcoes',
      'pontos', 'principais', 'resposta', 'anterior', 'conteudo', 'link', 'links', 'url', 'urls'
    ]);
    return tokenize(value, { stem: false })
      .filter(function (token) { return !ignored.has(token); })
      .slice(0, 16)
      .join(' ');
  }

  function expandQuery(value, options) {
    var config = options || {};
    var text = normalize(value);
    var additions = [];
    var expansions = [
      [/\bligacoes? quimicas?\b/, 'ligacao ionica ligacao covalente ligacao metalica transferencia compartilhamento eletrons'],
      [/\bgeometria molecular\b|\bvsepr\b/, 'vsepr pares ligantes pares nao ligantes forma molecular angulo ligacao'],
      [/\bcelulas? unitarias?\b/, 'parametros de rede sistemas cristalinos centramento contagem atomos'],
      [/\bdefeitos? cristalinos?\b/, 'vacancia intersticial substitucional frenkel schottky'],
      [/\borbitais?\b/, 'orbital atomico orbital molecular densidade probabilidade funcao onda'],
      [/\bpolaridade\b/, 'momento dipolar geometria molecular vetores dipolo'],
      [/\bempacotamento\b/, 'coordenacao intersticios tetraedrico octaedrico camadas cristalinas'],
      [/\bvidrarias?\b|\bequipamentos? de laboratorio\b/, 'laboratorio instrumentos tecnicas bancada'],
      [/\btermodinamica\b/, 'entalpia entropia energia livre gibbs processos'],
      [/\bgemas?\b|\bgemologia\b/, 'centros de cor impurezas cromoforas defeitos cristalinos propriedades opticas'],
      [/\binteracoes? intermoleculares?\b/, 'forcas london dipolo dipolo ligacao hidrogenio']
    ];
    expansions.forEach(function (entry) { if (entry[0].test(text)) additions.push(entry[1]); });
    if (config.contextText) additions.push(normalize(config.contextText));
    return [text].concat(additions).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }

  function resourceQueryCoverage(query, resource) {
    var genericTerms = new Set(['quim', 'quimica', 'ensino', 'estudo', 'materia', 'conteudo', 'recurso']);
    var queryTokens = Array.from(new Set(tokenize(query).filter(function (token) {
      return token.length >= 3 && !genericTerms.has(token);
    })));
    if (!queryTokens.length) return 1;
    var resourceText = [resource && resource.title, resource && resource.topics, resource && resource.description,
      resource && resource.registryDescription, resource && resource.summary, resource && resource.keywords]
      .reduce(function (parts, value) { return parts.concat(Array.isArray(value) ? value : [value]); }, [])
      .filter(Boolean)
      .join(' ');
    var resourceTokens = new Set(tokenize(resourceText));
    var hits = queryTokens.filter(function (token) { return resourceTokens.has(token); }).length;
    return hits / queryTokens.length;
  }

  function evaluateRetrievalConfidence(query, matches, options) {
    var config = options || {};
    var ignored = new Set(config.ignoredTokens || ['explique', 'explica', 'resuma', 'resumo', 'pontos', 'principais', 'sobre', 'quero', 'saber', 'como', 'funciona']);
    var queryTokens = Array.from(new Set(tokenize(query).filter(function (token) {
      return token.length >= 3 && !ignored.has(token);
    })));
    var ranked = Array.isArray(matches) ? matches : [];
    var topText = normalize(ranked.slice(0, 2).map(function (match) {
      var item = match && match.item ? match.item : match || {};
      return (item.file_name || item.title || '') + ' ' + (item.text || item.description || item.summary || '');
    }).join(' '));
    var covered = queryTokens.filter(function (token) { return topText.includes(token); });
    var coverage = queryTokens.length ? covered.length / queryTokens.length : 0;
    var first = ranked[0] || {};
    var topScore = Number(first.score || 0);
    var confidence = topScore >= (config.highScore || 8) && coverage >= (config.highCoverage || 0.35)
      ? 'high'
      : topScore >= (config.mediumScore || 4.5) && coverage >= (config.mediumCoverage || 0.5)
        ? 'medium'
        : ranked.length ? 'low' : 'none';
    return { confidence: confidence, coverage: coverage, topScore: topScore, queryTokens: queryTokens, coveredTokens: covered };
  }

  function rankResources(index, query, options) {
    var config = options || {};
    var relatedIds = new Set(config.relatedIds || []);
    var excludedIds = new Set(config.excludeIds || []);
    var ranked = search(index, expandQuery(query, { contextText: config.contextText }), {
      limit: index && Number.isFinite(index.size) ? index.size : 100,
      minScore: Number.isFinite(config.minScore) ? config.minScore : 0.35,
      currentPath: config.currentPath || '',
      contextText: config.contextText || ''
    }).filter(function (result) {
      if (excludedIds.has(result.item && result.item.id)) return false;
      if (config.category && (!result.item || result.item.category !== config.category)) return false;
      return !Number.isFinite(config.minCoverage) || resourceQueryCoverage(query, result.item) >= config.minCoverage;
    }).map(function (result) {
      var relatedBoost = relatedIds.has(result.item && result.item.id) ? 1.6 : 0;
      return Object.assign({}, result, { baseScore: result.score, score: result.score + relatedBoost, related: relatedBoost > 0 });
    });
    ranked.sort(function (left, right) { return right.score - left.score || String(left.id).localeCompare(String(right.id), 'pt-BR'); });
    return ranked.slice(0, Number.isFinite(config.limit) ? Math.max(1, config.limit) : 3);
  }

  function boundedEditDistance(leftValue, rightValue, maximum) {
    var left = normalize(leftValue);
    var right = normalize(rightValue);
    if (Math.abs(left.length - right.length) > maximum) return maximum + 1;
    var previous = Array.from({ length: right.length + 1 }, function (_, index) { return index; });
    for (var i = 1; i <= left.length; i += 1) {
      var current = [i];
      var rowMinimum = i;
      for (var j = 1; j <= right.length; j += 1) {
        var value = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1));
        current[j] = value;
        rowMinimum = Math.min(rowMinimum, value);
      }
      if (rowMinimum > maximum) return maximum + 1;
      previous = current;
    }
    return previous[right.length];
  }

  function resolveAlias(value, aliases, options) {
    var config = options || {};
    var text = normalize(value);
    var map = aliases && typeof aliases === 'object' ? aliases : {};
    var names = Object.keys(map).map(function (name) { return normalize(name); }).filter(Boolean).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < names.length; i += 1) {
      var name = names[i];
      if (name.length <= 2 && text !== name) {
        var escapedShortName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var explicitShortAlias = config.explicit
          && new RegExp('(?:elemento|simbolo(?: quimico)?|elemento de simbolo) ' + escapedShortName + '$').test(text);
        if (!explicitShortAlias) continue;
      }
      var pattern = new RegExp('(?:^| )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?: |$)');
      if (pattern.test(text)) return map[Object.keys(map).find(function (raw) { return normalize(raw) === name; })];
    }
    if (!config.allowFuzzy || !config.explicit) return null;
    var tokens = text.split(' ').filter(function (token) { return token.length >= 4; });
    var fuzzyNames = names.filter(function (name) { return name.length >= 4 && !name.includes(' '); });
    for (var t = 0; t < tokens.length; t += 1) {
      for (var n = 0; n < fuzzyNames.length; n += 1) {
        var maximum = fuzzyNames[n].length >= 8 ? 2 : 1;
        if (boundedEditDistance(tokens[t], fuzzyNames[n], maximum) <= maximum) {
          var rawName = Object.keys(map).find(function (raw) { return normalize(raw) === fuzzyNames[n]; });
          return map[rawName];
        }
      }
    }
    return null;
  }

  return Object.freeze({
    version: '2.0.0',
    normalize: normalize,
    normalizePath: normalizePath,
    resolveResourceByPath: resolveResourceByPath,
    tokenize: tokenize,
    lightStem: lightStem,
    createIndex: createIndex,
    search: search,
    expandQuery: expandQuery,
    resourceQueryCoverage: resourceQueryCoverage,
    evaluateRetrievalConfidence: evaluateRetrievalConfidence,
    rankResources: rankResources,
    detectIntent: detectIntent,
    detectFollowupMode: detectFollowupMode,
    recommendationPolicy: recommendationPolicy,
    requestedCategory: requestedCategory,
    resolveOrdinal: resolveOrdinal,
    resolveSelectionOrdinal: resolveSelectionOrdinal,
    resolveAlias: resolveAlias,
    isContextualReference: isContextualReference,
    hasChemistryFormula: hasChemistryFormula,
    isLikelyInScope: isLikelyInScope,
    extractSubject: extractSubject
  });
});
