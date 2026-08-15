import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const core = require(path.join(root, 'Chat', 'widget', 'simoens-search-core.js'));
const docPath = path.join(root, 'assets', 'chat', 'docs', 'doc_index.json');
const registryPath = path.join(root, 'assets', 'chat', 'content-registry.json');
const widgetPath = path.join(root, 'Chat', 'widget', 'chat-widget.js');
const corePath = path.join(root, 'Chat', 'widget', 'simoens-search-core.js');

const [docText, registryText, widgetStat, coreStat] = await Promise.all([
  fs.readFile(docPath, 'utf8'),
  fs.readFile(registryPath, 'utf8'),
  fs.stat(widgetPath),
  fs.stat(corePath),
]);
const documents = JSON.parse(docText).chunks;
const resources = JSON.parse(registryText).resources;

const indexStart = performance.now();
const documentIndex = core.createIndex(documents);
const resourceIndex = core.createIndex(resources);
const indexMs = performance.now() - indexStart;

const queries = [
  'o que é célula unitária',
  'geometria molcular VSEPR',
  'exercício sobre defeitos cristalinos',
  'jogo sobre ligação química',
  'orbitais ligantes e antiligantes',
  'forças intermoleculares e ligação de hidrogênio',
  'simulador de espectroscopia Raman',
];
for (let i = 0; i < 25; i += 1) {
  core.search(documentIndex, queries[i % queries.length], { limit: 5, minScore: 0.01 });
  core.search(resourceIndex, queries[i % queries.length], { limit: 5, minScore: 0.01 });
}

const durations = [];
for (let i = 0; i < 1000; i += 1) {
  const start = performance.now();
  core.search(documentIndex, queries[i % queries.length], { limit: 5, minScore: 0.01 });
  core.search(resourceIndex, queries[i % queries.length], { limit: 5, minScore: 0.01 });
  durations.push(performance.now() - start);
}
durations.sort((left, right) => left - right);
const percentile = (fraction) => durations[Math.min(durations.length - 1, Math.floor(durations.length * fraction))];
const round = (value) => Number(value.toFixed(3));

console.log(JSON.stringify({
  documents: documents.length,
  resources: resources.length,
  bytes: {
    documentIndex: Buffer.byteLength(docText),
    contentRegistry: Buffer.byteLength(registryText),
    chatWidget: widgetStat.size,
    searchCore: coreStat.size,
  },
  indexBuildMs: round(indexMs),
  combinedDocumentAndResourceSearchMs: {
    samples: durations.length,
    median: round(percentile(0.5)),
    p95: round(percentile(0.95)),
    maximum: round(durations[durations.length - 1]),
  },
}, null, 2));
