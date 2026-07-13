import { promises as fs } from 'node:fs';
import path from 'node:path';
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

const showBundle = await fs.readFile(path.join(root, 'Ensino', 'jogo', 'show-do-milhao-da-quimica', 'assets', 'js', 'script1.js'), 'utf8');
if (/data:(?:audio|image)\//i.test(showBundle)) errors.push('O bundle do Show do Milhão ainda contém mídia em base64.');

if (warnings.length) console.warn(warnings.join('\n'));
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validação concluída: ${htmlFiles.length} páginas, ${files.length} arquivos e ${docs.chunks.length} trechos do chat sem falhas estruturais.`);
}
