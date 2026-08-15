import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    if (['.git', 'node_modules'].includes(entry.name)) return [];
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }));
  return nested.flat();
}

function localTarget(documentPath, rawValue) {
  const value = rawValue.trim().replace(/&amp;/g, '&');
  if (!value || value.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|blob:|javascript:|\/\/)/i.test(value)) return null;
  const withoutHash = value.split('#')[0].split('?')[0];
  if (!withoutHash || /[{}$<>]/.test(withoutHash)) return null;
  let decoded = withoutHash;
  try { decoded = decodeURIComponent(withoutHash); } catch {}
  return decoded.startsWith('/')
    ? path.join(root, decoded.replace(/^\/+Quimica-Visual\/?/i, ''))
    : path.resolve(path.dirname(documentPath), decoded);
}

async function existsAsWebTarget(target) {
  try {
    const stat = await fs.stat(target);
    if (stat.isFile()) return true;
    if (stat.isDirectory()) {
      await fs.access(path.join(target, 'index.html'));
      return true;
    }
  } catch {}
  return false;
}

const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const jsonFiles = files.filter((file) => file.endsWith('.json'));
const scriptFiles = files.filter((file) => /\.(?:js|mjs)$/i.test(file));

for (const file of jsonFiles) {
  try {
    JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    errors.push(`JSON inválido em ${path.relative(root, file)}: ${error.message}`);
  }
}

for (const file of scriptFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    errors.push(`Sintaxe JavaScript inválida em ${path.relative(root, file)}: ${(result.stderr || result.stdout).trim()}`);
  }
}

for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  if (/<style\b/i.test(html)) errors.push(`CSS inline (<style>) em ${path.relative(root, file)}`);
  if (/<script\b(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script\s*>/i.test(html)) errors.push(`JavaScript/configuração inline (<script> sem src) em ${path.relative(root, file)}`);
  if (/\sstyle\s*=\s*["']/i.test(html)) errors.push(`Atributo style inline em ${path.relative(root, file)}`);
  if (/\son[a-z][a-z0-9_-]*\s*=\s*["']/i.test(html)) errors.push(`Event handler inline em ${path.relative(root, file)}`);

  if (!/<html\b/i.test(html)) continue;
  if (!/<html\b[^>]*\blang\s*=\s*["'][^"']+["']/i.test(html)) errors.push(`Idioma ausente em ${path.relative(root, file)}`);
  if (!/<title>\s*[^<]+\s*<\/title>/i.test(html)) errors.push(`Título ausente em ${path.relative(root, file)}`);
  if (!/<meta\b[^>]*\bname\s*=\s*["']viewport["']/i.test(html)) errors.push(`Viewport ausente em ${path.relative(root, file)}`);

  const ids = [...html.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2]);
  const idCounts = new Map();
  for (const id of ids) idCounts.set(id, (idCounts.get(id) || 0) + 1);
  for (const [id, count] of idCounts) {
    if (count > 1) errors.push(`ID duplicado "${id}" (${count} ocorrências) em ${path.relative(root, file)}`);
  }
  const idSet = new Set(ids);
  for (const match of html.matchAll(/\b(aria-labelledby|aria-describedby|aria-controls)\s*=\s*(["'])(.*?)\2/gi)) {
    for (const reference of match[3].trim().split(/\s+/).filter(Boolean)) {
      if (!idSet.has(reference)) errors.push(`${match[1]} aponta para ID ausente "${reference}" em ${path.relative(root, file)}`);
    }
  }
  for (const match of html.matchAll(/<label\b[^>]*\bfor\s*=\s*(["'])(.*?)\1[^>]*>/gi)) {
    if (!idSet.has(match[2])) errors.push(`label[for] aponta para ID ausente "${match[2]}" em ${path.relative(root, file)}`);
  }
  if (/<img\b(?![^>]*\balt\s*=)[^>]*>/i.test(html)) errors.push(`Imagem sem atributo alt em ${path.relative(root, file)}`);
  for (const match of html.matchAll(/<iframe\b([^>]*)>/gi)) {
    const title = match[1].match(/\btitle\s*=\s*(["'])(.*?)\1/i)?.[2]?.trim();
    if (!title || /^app(?:lication)?$/i.test(title)) errors.push(`iframe sem título significativo em ${path.relative(root, file)}`);
  }
  for (const match of html.matchAll(/<a\b([^>]*)>/gi)) {
    const attributes = match[1];
    if (/\btarget\s*=\s*(["'])_blank\1/i.test(attributes) && !/\brel\s*=\s*(["'])[^"']*\bnoopener\b[^"']*\1/i.test(attributes)) {
      errors.push(`Link target="_blank" sem rel="noopener" em ${path.relative(root, file)}`);
    }
  }
}
for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  const attributes = html.matchAll(/\b(?:href|src|poster|data-open-href)\s*=\s*(["'])(.*?)\1/gi);
  for (const match of attributes) {
    const target = localTarget(file, match[2]);
    if (target && !(await existsAsWebTarget(target))) {
      errors.push(`Recurso ausente em ${path.relative(root, file)}: ${match[2]}`);
    }
  }
}
for (const file of files.filter((candidate) => candidate.endsWith('.css'))) {
  const css = await fs.readFile(file, 'utf8');
  for (const match of css.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
    const target = localTarget(file, match[2]);
    if (target && !(await existsAsWebTarget(target))) errors.push(`Recurso CSS ausente em ${path.relative(root, file)}: ${match[2]}`);
  }
  for (const match of css.matchAll(/@import\s+(["'])(.*?)\1/gi)) {
    const target = localTarget(file, match[2]);
    if (target && !(await existsAsWebTarget(target))) errors.push(`Import CSS ausente em ${path.relative(root, file)}: ${match[2]}`);
  }
}

const sitemap = await fs.readFile(path.join(root, 'sitemap.xml'), 'utf8');
for (const match of sitemap.matchAll(/<loc>https:\/\/quimicavisualufv\.github\.io\/Quimica-Visual\/(.*?)<\/loc>/g)) {
  let relative = match[1].split('#')[0].split('?')[0];
  try { relative = decodeURIComponent(relative); } catch {}
  const target = path.join(root, relative);
  if (!(await existsAsWebTarget(target))) errors.push(`Rota inválida no sitemap: ${match[1]}`);
}

const textFiles = files.filter((file) => /\.(?:html|css|js|mjs|xml)$/i.test(file) && !file.startsWith(path.join(root, 'tests')));
const forbidden = [
  ['HDR remoto antigo', /raw\.githack\.com\/.*\/hdri\//i],
  ['fonte local absoluta', /file:\/\/\/[A-Za-z]:\//i],
  ['Caça-palavras com fragmento quebrado', /ca(?:%23|#)U00e7a-palavras/i],
  ['placeholder Lorem ipsum', /lorem ipsum/i],
];
for (const file of textFiles) {
  const text = await fs.readFile(file, 'utf8');
  for (const [label, pattern] of forbidden) {
    if (pattern.test(text)) errors.push(`${label}: ${path.relative(root, file)}`);
  }
  if (file.endsWith('.html') && /width=1280/i.test(text)) errors.push(`viewport fixo de 1280 px: ${path.relative(root, file)}`);
}

const hdrPath = path.join(root, 'assets', 'environment', 'city.exr');
const hdr = await fs.readFile(hdrPath);
if (hdr.length < 100_000 || hdr.readUInt32LE(0) !== 20000630) errors.push('O HDR/EXR local não parece um OpenEXR válido.');

const docs = JSON.parse(await fs.readFile(path.join(root, 'assets', 'chat', 'docs', 'doc_index.json'), 'utf8'));
if (!Array.isArray(docs.chunks) || docs.chunks.length < 100) errors.push('O índice documental do chat está ausente ou incompleto.');

const registryPath = path.join(root, 'assets', 'chat', 'content-registry.json');
const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));
if (!Array.isArray(registry.resources) || registry.resources.length < 25) errors.push('O registro canônico de conteúdo está ausente ou incompleto.');
const registryIds = new Set();
const registryUrls = new Set();
for (const resource of registry.resources || []) {
  const required = ['id', 'title', 'category', 'url', 'description', 'topics'];
  for (const field of required) {
    if (resource[field] == null || resource[field] === '') errors.push(`Registro ${resource.id || '(sem id)'} sem campo obrigatório: ${field}`);
  }
  if (!Array.isArray(resource.topics)) errors.push(`Registro ${resource.id || '(sem id)'} possui topics inválido.`);
  if (registryIds.has(resource.id)) errors.push(`ID duplicado no registro de conteúdo: ${resource.id}`);
  if (registryUrls.has(resource.url)) errors.push(`URL duplicada no registro de conteúdo: ${resource.url}`);
  registryIds.add(resource.id);
  registryUrls.add(resource.url);
  const target = localTarget(path.join(root, 'index.html'), resource.url);
  if (target && !(await existsAsWebTarget(target))) errors.push(`URL do registro não existe: ${resource.id} -> ${resource.url}`);
  if (resource.accessibilityDocument) {
    const documentTarget = path.resolve(root, resource.accessibilityDocument);
    if (!(await existsAsWebTarget(documentTarget))) errors.push(`Documento de acessibilidade ausente no registro: ${resource.id} -> ${resource.accessibilityDocument}`);
  }
  for (const relatedId of resource.related || []) {
    if (typeof relatedId !== 'string') errors.push(`Relação inválida no registro ${resource.id}.`);
  }
}
for (const resource of registry.resources || []) {
  for (const relatedId of resource.related || []) {
    if (!registryIds.has(relatedId)) errors.push(`Relação aponta para ID inexistente: ${resource.id} -> ${relatedId}`);
  }
}

const clutter = files.filter((file) => /\.(?:bak|orig|tmp|swp)$/i.test(file));
for (const file of clutter) errors.push(`Artefato temporário em produção: ${path.relative(root, file)}`);

const externalOrigins = new Set();
for (const file of htmlFiles) {
  const text = await fs.readFile(file, 'utf8');
  for (const match of text.matchAll(/\b(?:href|src|poster)\s*=\s*(["'])(https?:\/\/[^"']+)\1/gi)) {
    try { externalOrigins.add(new URL(match[2]).origin); } catch {}
  }
}
for (const file of files.filter((candidate) => candidate.endsWith('.css'))) {
  const text = await fs.readFile(file, 'utf8');
  for (const match of text.matchAll(/(?:@import\s+|url\()\s*(["']?)(https?:\/\/[^\s"')]+)\1/gi)) {
    try { externalOrigins.add(new URL(match[2]).origin); } catch {}
  }
}
for (const file of scriptFiles) {
  const text = await fs.readFile(file, 'utf8');
  for (const match of text.matchAll(/(?:\bfrom\s+|\b(?:import|fetch)\s*\()\s*(["'])(https?:\/\/[^"']+)\1/gi)) {
    try { externalOrigins.add(new URL(match[2]).origin); } catch {}
  }
}
if (externalOrigins.size) warnings.push(`Dependências/origens externas detectadas: ${[...externalOrigins].sort().join(', ')}`);

const largeFiles = [];
for (const file of files) {
  const stat = await fs.stat(file);
  if (stat.size >= 1_000_000) largeFiles.push({ file, size: stat.size });
}
const hashes = new Map();
for (const item of largeFiles) {
  const digest = createHash('sha256').update(await fs.readFile(item.file)).digest('hex');
  const key = `${item.size}:${digest}`;
  const group = hashes.get(key) || [];
  group.push(item.file);
  hashes.set(key, group);
}
for (const group of hashes.values()) {
  if (group.length > 1) warnings.push(`Arquivos grandes idênticos: ${group.map((file) => path.relative(root, file)).join(' = ')}`);
}

const showBundle = await fs.readFile(path.join(root, 'Ensino', 'jogo', 'show-do-milhao-da-quimica', 'assets', 'js', 'script1.js'), 'utf8');
if (/data:(?:audio|image)\//i.test(showBundle)) errors.push('O bundle do Show do Milhão ainda contém mídia em base64.');

if (warnings.length) console.warn(warnings.join('\n'));
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validação concluída: ${htmlFiles.length} páginas, ${scriptFiles.length} scripts, ${jsonFiles.length} JSON, ${files.length} arquivos, ${registry.resources.length} recursos canônicos e ${docs.chunks.length} trechos do chat sem falhas estruturais.`);
}
