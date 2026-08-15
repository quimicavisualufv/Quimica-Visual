import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const core = require(path.join(root, 'Chat', 'widget', 'simoens-search-core.js'));
const documents = JSON.parse(await fs.readFile(path.join(root, 'assets', 'chat', 'docs', 'doc_index.json'), 'utf8')).chunks;
const resources = JSON.parse(await fs.readFile(path.join(root, 'assets', 'chat', 'content-registry.json'), 'utf8')).resources;
const evaluation = JSON.parse(await fs.readFile(path.join(root, 'tests', 'chat-evaluation-cases.json'), 'utf8'));

function uniqueSources(ranked) {
  const seen = new Set();
  return ranked.map((item) => item.source || item.item?.source).filter((source) => {
    if (!source || seen.has(source)) return false;
    seen.add(source);
    return true;
  });
}

function legacySearch(query) {
  const queryText = core.normalize(query);
  const queryTokens = [...new Set(queryText.split(/[^a-z0-9]+/).filter((token) => token.length >= 3 && !/^\d+$/.test(token)))];
  return documents
    .map((chunk) => {
      const haystack = core.normalize(`${chunk.text} ${chunk.file_name || ''} ${chunk.source || ''}`);
      let score = 0;
      for (const token of queryTokens) {
        if (haystack.includes(token)) score += token.length >= 7 ? 1.35 : 0.9;
      }
      if (queryText && haystack.includes(queryText)) score += 3.8;
      return { ...chunk, score };
    })
    .filter((chunk) => chunk.score >= 2.2)
    .sort((left, right) => right.score - left.score || left.chunk_index - right.chunk_index);
}

function metrics(ranks) {
  const count = ranks.length || 1;
  return {
    top1: ranks.filter((rank) => rank === 1).length / count,
    top3: ranks.filter((rank) => rank > 0 && rank <= 3).length / count,
    top5: ranks.filter((rank) => rank > 0 && rank <= 5).length / count,
  };
}

function rankOf(sources, expected) {
  const index = sources.indexOf(expected);
  return index < 0 ? 0 : index + 1;
}

const documentIndex = core.createIndex(documents);
const currentRanks = [];
const legacyRanks = [];
const misses = [];
for (const testCase of evaluation.retrieval) {
  const currentSources = uniqueSources(core.search(documentIndex, testCase.query, { limit: documents.length, minScore: 0.01 }).map((result) => result.item));
  const legacySources = uniqueSources(legacySearch(testCase.query));
  const currentRank = rankOf(currentSources, testCase.expectedSource);
  const legacyRank = rankOf(legacySources, testCase.expectedSource);
  currentRanks.push(currentRank);
  legacyRanks.push(legacyRank);
  if (!currentRank || currentRank > 5) misses.push({ query: testCase.query, expected: testCase.expectedSource, rank: currentRank, top: currentSources.slice(0, 5) });
}

const currentMetrics = metrics(currentRanks);
const legacyMetrics = metrics(legacyRanks);
assert.ok(currentMetrics.top1 >= legacyMetrics.top1, `Top-1 regrediu: ${(legacyMetrics.top1 * 100).toFixed(1)}% -> ${(currentMetrics.top1 * 100).toFixed(1)}%`);
assert.ok(currentMetrics.top3 >= legacyMetrics.top3, `Top-3 regrediu: ${(legacyMetrics.top3 * 100).toFixed(1)}% -> ${(currentMetrics.top3 * 100).toFixed(1)}%`);
assert.ok(currentMetrics.top5 >= legacyMetrics.top5, `Top-5 regrediu: ${(legacyMetrics.top5 * 100).toFixed(1)}% -> ${(currentMetrics.top5 * 100).toFixed(1)}%`);
assert.ok(currentMetrics.top1 >= 0.75, `Top-1 abaixo do mínimo: ${(currentMetrics.top1 * 100).toFixed(1)}%`);
assert.ok(currentMetrics.top3 >= 0.9, `Top-3 abaixo do mínimo: ${(currentMetrics.top3 * 100).toFixed(1)}%`);
assert.ok(currentMetrics.top5 >= 0.94, `Top-5 abaixo do mínimo: ${(currentMetrics.top5 * 100).toFixed(1)}%`);

for (const testCase of evaluation.intents) {
  const actual = core.detectIntent(testCase.query);
  assert.equal(actual.name, testCase.expected, `Intenção incorreta para "${testCase.query}"`);
  if (testCase.category) assert.equal(actual.category, testCase.category, `Categoria incorreta para "${testCase.query}"`);
}

for (const testCase of evaluation.paths) {
  const actual = core.resolveResourceByPath(resources, testCase.path);
  assert.equal(actual?.id || null, testCase.expectedId, `Contexto de página incorreto para ${testCase.path}`);
}

const resourceIndex = core.createIndex(resources);
for (const testCase of evaluation.resourceQueries) {
  const subject = core.extractSubject(testCase.query);
  const ranked = core.rankResources(resourceIndex, subject || testCase.query, {
    category: testCase.category || '',
    limit: resources.length,
    minScore: 0.35,
    minCoverage: subject ? 0.34 : undefined,
  });
  const actual = ranked[0]?.item?.id || null;
  assert.equal(actual, testCase.expectedId, `Recurso incorreto para "${testCase.query}": ${actual}`);
}

for (const testCase of evaluation.recommendationPolicy) {
  const actual = core.recommendationPolicy(testCase.query);
  assert.equal(actual.shouldRecommend, testCase.shouldRecommend, `Política de indicação incorreta para "${testCase.query}"`);
  assert.equal(actual.maxResults, testCase.maxResults, `Quantidade de indicações incorreta para "${testCase.query}"`);
  if (testCase.category) assert.equal(actual.category, testCase.category, `Categoria de indicação incorreta para "${testCase.query}"`);
}

for (const testCase of evaluation.followups) {
  assert.equal(core.detectFollowupMode(testCase.query), testCase.mode, `Modo de continuidade incorreto para "${testCase.query}"`);
  assert.equal(core.isContextualReference(testCase.query), true, `Continuidade não reconhecida para "${testCase.query}"`);
}

for (const testCase of evaluation.ordinals) {
  assert.equal(core.resolveSelectionOrdinal(testCase.query), testCase.index, `Seleção ordinal incorreta para "${testCase.query}"`);
}

for (const testCase of evaluation.scope) {
  assert.equal(core.isLikelyInScope(testCase.query), testCase.inScope, `Escopo incorreto para "${testCase.query}"`);
}

const elementAliases = {
  oxigenio: 'o',
  ferro: 'fe',
  o: 'o',
  fe: 'fe',
};
for (const testCase of evaluation.elementAliases) {
  const actual = core.resolveAlias(testCase.query, elementAliases, { explicit: testCase.explicit, allowFuzzy: true });
  assert.equal(actual, testCase.symbol, `Elemento incorreto para "${testCase.query}"`);
}

assert.equal(core.normalize('célula unitária'), core.normalize('celula unitaria'), 'A normalização deve ignorar acentos.');
assert.deepEqual(core.tokenize('geometria molcular'), core.tokenize('geometria molecular'), 'A correção de erro de digitação deve ser determinística.');
assert.deepEqual(core.tokenize('ligações'), core.tokenize('ligação'), 'Singular e plural em -ção devem convergir.');
assert.deepEqual(core.tokenize('orbitais'), core.tokenize('orbital'), 'Plural em -ais deve convergir para -al.');
assert.equal(core.isContextualReference('E qual exercício eu posso fazer sobre isso?'), true, 'A referência conversacional não foi detectada.');

const format = (value) => `${(value * 100).toFixed(1)}%`;
console.log(JSON.stringify({
  cases: evaluation.retrieval.length,
  legacy: { top1: format(legacyMetrics.top1), top3: format(legacyMetrics.top3), top5: format(legacyMetrics.top5) },
  bm25: { top1: format(currentMetrics.top1), top3: format(currentMetrics.top3), top5: format(currentMetrics.top5) },
  intents: evaluation.intents.length,
  paths: evaluation.paths.length,
  resourceQueries: evaluation.resourceQueries.length,
  recommendationPolicies: evaluation.recommendationPolicy.length,
  followups: evaluation.followups.length,
  ordinals: evaluation.ordinals.length,
  scope: evaluation.scope.length,
  elementAliases: evaluation.elementAliases.length,
  misses,
}, null, 2));
