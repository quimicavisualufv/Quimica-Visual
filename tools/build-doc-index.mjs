import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(projectRoot, 'Chat', 'widget', 'textos-acessibilidade');
const outputPath = path.join(projectRoot, 'assets', 'chat', 'docs', 'doc_index.json');

async function listMarkdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(target);
    return entry.isFile() && entry.name.endsWith('.md') ? [target] : [];
  }));
  return nested.flat().sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function stripMarkdown(text) {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function chunkDocument(markdown, maxLength = 920) {
  const blocks = markdown
    .split(/\n\s*\n/)
    .map(stripMarkdown)
    .filter(Boolean);
  const chunks = [];
  let current = '';
  for (const block of blocks) {
    if (current && current.length + block.length + 1 > maxLength) {
      chunks.push(current);
      current = '';
    }
    if (block.length > maxLength) {
      if (current) chunks.push(current);
      current = '';
      for (let offset = 0; offset < block.length; offset += maxLength) {
        chunks.push(block.slice(offset, offset + maxLength).trim());
      }
      continue;
    }
    current = current ? `${current} ${block}` : block;
  }
  if (current) chunks.push(current);
  return chunks;
}

const files = await listMarkdownFiles(sourceRoot);
const chunks = [];
for (const file of files) {
  const markdown = await fs.readFile(file, 'utf8');
  const relative = path.relative(projectRoot, file).split(path.sep).join('/');
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const fileName = heading || path.basename(file, '.md').replace(/[_-]+/g, ' ');
  chunkDocument(markdown).forEach((text, chunkIndex) => {
    chunks.push({
      id: `${relative}#${chunkIndex + 1}`,
      text,
      source: relative,
      file_name: fileName,
      file_type: 'markdown',
      page: null,
      chunk_index: chunkIndex,
    });
  });
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify({ version: 1, generated_from: 'textos-acessibilidade', chunks }, null, 2)}\n`, 'utf8');
console.log(`Índice criado: ${chunks.length} trechos de ${files.length} documentos.`);
