import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    if (['.git', 'node_modules'].includes(entry.name)) return [];
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }));
  return nested.flat();
}

function localRequestUrl(rawValue, pageUrl, origin) {
  const value = rawValue.trim().replace(/&amp;/g, '&');
  if (!value || value.startsWith('#') || /^(?:mailto:|tel:|data:|blob:|javascript:|\/\/)/i.test(value)) return null;
  try {
    const target = new URL(value, pageUrl);
    return target.origin === origin ? target : null;
  } catch {
    return null;
  }
}

function contentType(file) {
  const extension = path.extname(file).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.exr': 'image/x-exr',
  })[extension] || 'application/octet-stream';
}

const server = http.createServer(async (request, response) => {
  try {
    const parsed = new URL(request.url, 'http://127.0.0.1');
    let relative = decodeURIComponent(parsed.pathname).replace(/^\/+/, '').replace(/^Quimica-Visual\/?/i, '');
    let target = path.resolve(root, relative || 'index.html');
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end();
      return;
    }
    const stat = await fs.stat(target);
    if (stat.isDirectory()) target = path.join(target, 'index.html');
    const finalStat = await fs.stat(target);
    if (!finalStat.isFile()) throw new Error('not a file');
    response.writeHead(200, { 'content-type': contentType(target), 'content-length': finalStat.size });
    if (request.method === 'HEAD') response.end();
    else response.end(await fs.readFile(target));
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});

const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;
const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const resourceUrls = new Set();
const failures = [];

try {
  for (const file of htmlFiles) {
    const relative = path.relative(root, file).split(path.sep).map(encodeURIComponent).join('/');
    const pageUrl = new URL(relative, `${origin}/`);
    const response = await fetch(pageUrl);
    if (!response.ok) failures.push(`${response.status} ${pageUrl.pathname}`);
    const html = await response.text();
    assert.ok(html.trim().length > 0, `Corpo vazio em ${pageUrl.pathname}`);
    for (const match of html.matchAll(/\b(?:href|src|poster|data-open-href)\s*=\s*(["'])(.*?)\1/gi)) {
      const target = localRequestUrl(match[2], pageUrl, origin);
      if (target) resourceUrls.add(target.href.split('#')[0]);
    }
  }

  const registry = JSON.parse(await fs.readFile(path.join(root, 'assets', 'chat', 'content-registry.json'), 'utf8'));
  resourceUrls.add(new URL('/assets/chat/content-registry.json', origin).href);
  resourceUrls.add(new URL('/assets/chat/docs/doc_index.json', origin).href);
  resourceUrls.add(new URL('/Chat/widget/simoens-search-core.js', origin).href);
  for (const resource of registry.resources) {
    resourceUrls.add(new URL(resource.url.split('/').map(encodeURIComponent).join('/'), `${origin}/`).href);
    if (resource.accessibilityDocument) resourceUrls.add(new URL(resource.accessibilityDocument.split('/').map(encodeURIComponent).join('/'), `${origin}/`).href);
  }

  for (const url of resourceUrls) {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) failures.push(`${response.status} ${new URL(url).pathname}`);
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}

assert.deepEqual(failures, [], `Falhas HTTP locais:\n${failures.join('\n')}`);
console.log(`Smoke HTTP concluído: ${htmlFiles.length} páginas carregadas e ${resourceUrls.size} recursos locais responderam com sucesso.`);
