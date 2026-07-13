import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(projectRoot, 'Ensino', 'jogo', 'show-do-milhao-da-quimica', 'assets', 'js', 'script1.js');
const mediaDirectory = path.join(projectRoot, 'Ensino', 'jogo', 'show-do-milhao-da-quimica', 'assets', 'media');
const source = await fs.readFile(scriptPath, 'utf8');
const counters = new Map();
const written = [];

const rewritten = source.replace(/data:(audio\/mpeg|image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/=]+)/g, (match, mime, data) => {
  const extension = mime === 'audio/mpeg' ? 'mp3' : mime.split('/')[1].replace('jpeg', 'jpg');
  const kind = mime.startsWith('audio/') ? 'audio' : 'image';
  const next = (counters.get(kind) || 0) + 1;
  counters.set(kind, next);
  const filename = `${kind}-${String(next).padStart(3, '0')}.${extension}`;
  written.push({ filename, buffer: Buffer.from(data, 'base64') });
  return `assets/media/${filename}`;
});

if (!written.length) {
  console.log('Nenhuma mídia incorporada encontrada; nada a fazer.');
  process.exit(0);
}

await fs.mkdir(mediaDirectory, { recursive: true });
await Promise.all(written.map(({ filename, buffer }) => fs.writeFile(path.join(mediaDirectory, filename), buffer)));
await fs.writeFile(scriptPath, rewritten, 'utf8');
console.log(`Extraídos ${written.length} arquivos; bundle reduzido para ${Buffer.byteLength(rewritten)} bytes.`);
