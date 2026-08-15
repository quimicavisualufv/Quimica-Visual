import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const core = require(path.join(root, 'Chat', 'widget', 'simoens-search-core.js'));
const registry = JSON.parse(await fs.readFile(path.join(root, 'assets', 'chat', 'content-registry.json'), 'utf8'));
const documentPayload = JSON.parse(await fs.readFile(path.join(root, 'assets', 'chat', 'docs', 'doc_index.json'), 'utf8'));
const widgetSource = await fs.readFile(path.join(root, 'Chat', 'widget', 'chat-widget.js'), 'utf8');
const resources = registry.resources;
const index = core.createIndex(resources);
const documentIndex = core.createIndex(documentPayload.chunks);

assert.equal(core.version, '2.0.0');
assert.equal(resources.length, 32, 'O registro canônico deve manter os 32 recursos auditados.');
assert.equal(new Set(resources.map((resource) => resource.id)).size, resources.length, 'IDs de recurso duplicados.');

const categoryCounts = resources.reduce((counts, resource) => {
  counts[resource.category] = (counts[resource.category] || 0) + 1;
  return counts;
}, {});
assert.deepEqual(categoryCounts, { animation: 10, guide: 10, game: 4, exercise: 8 });

function recommend(query) {
  const policy = core.recommendationPolicy(query);
  if (!policy.shouldRecommend) return { policy, results: [] };
  const subject = core.extractSubject(query);
  return {
    policy,
    results: core.rankResources(index, subject || policy.category || 'quimica', {
      category: policy.category,
      limit: policy.maxResults,
      minScore: 0.35,
      minCoverage: subject ? 0.34 : undefined,
    }),
  };
}

assert.equal(recommend('explique polaridade').policy.shouldRecommend, false, 'Explicações não devem receber indicações automáticas.');
assert.equal(recommend('oi').policy.shouldRecommend, false, 'Saudações não devem receber indicações.');

const singular = recommend('qual exercício posso fazer sobre polaridade?');
assert.equal(singular.policy.maxResults, 1);
assert.deepEqual(singular.results.map((result) => result.item.id), ['polaridade_geometria_exercicio']);

const plural = recommend('quais exercícios existem sobre polaridade?');
assert.equal(plural.policy.maxResults, 3);
assert.ok(plural.results.length >= 1 && plural.results.length <= 3);
assert.equal(plural.results[0].item.id, 'polaridade_geometria_exercicio');
assert.ok(plural.results.every((result) => result.item.category === 'exercise'));

const chemicalBondGame = recommend('tem algum jogo sobre ligação química?');
assert.deepEqual(chemicalBondGame.results.map((result) => result.item.id), ['quebracabeca']);
const genericGameList = recommend('quais jogos existem?');
assert.equal(genericGameList.results.length, 3);
assert.ok(genericGameList.results.every((result) => result.item.category === 'game'));

const nonexistent = recommend('indique uma animação sobre espectroscopia Raman');
assert.equal(nonexistent.policy.shouldRecommend, true);
assert.deepEqual(nonexistent.results, [], 'Um recurso inexistente não pode ser aproximado para um item sem relação lexical.');

const knownDocumentMatches = core.search(documentIndex, 'o que é uma célula unitária?', { limit: 5, minScore: 0.35 });
const knownConfidence = core.evaluateRetrievalConfidence('o que é uma célula unitária?', knownDocumentMatches);
assert.notEqual(knownConfidence.confidence, 'low', 'Uma consulta documental conhecida não deve ser bloqueada.');
const unknownDocumentMatches = core.search(documentIndex, 'simulador de espectroscopia Raman', { limit: 5, minScore: 0.35 });
const unknownConfidence = core.evaluateRetrievalConfidence('simulador de espectroscopia Raman', unknownDocumentMatches);
assert.equal(unknownConfidence.confidence, 'low', 'Baixa cobertura lexical deve bloquear uma aproximação documental indevida.');

const contextual = 'E qual exercício eu posso fazer sobre isso?';
assert.equal(core.isContextualReference(contextual), true);
assert.equal(core.extractSubject(contextual), '', 'A referência pronominal deve reutilizar o assunto anterior, não substituí-lo.');
assert.equal(core.resolveSelectionOrdinal('abra a segunda opção'), 1);
assert.equal(core.isContextualReference('abra a segunda opção'), true);
assert.equal(core.resolveSelectionOrdinal('explique o segundo princípio da termodinâmica'), -1);
assert.equal(core.isContextualReference('explique o segundo princípio da termodinâmica'), false);
assert.equal(core.isContextualReference('resuma os pontos principais'), true);
assert.equal(core.extractSubject('resuma os pontos principais'), '');

const elementAliases = { oxigenio: 'o', ferro: 'fe', o: 'o', fe: 'fe' };
assert.equal(core.resolveAlias('fale sobre oxigênio', elementAliases, { explicit: true, allowFuzzy: true }), 'o');
assert.equal(core.resolveAlias('qual é o ponto triplo?', elementAliases, { explicit: true, allowFuzzy: true }), null,
  'Palavras curtas não podem ser confundidas com símbolos químicos dentro de frases.');

assert.equal(core.isLikelyInScope('qual é a capital do Japão?'), false);
assert.equal(core.isLikelyInScope('explique a ligação covalente'), true);

const handleSubmitSource = widgetSource.slice(widgetSource.indexOf('async handleSubmit(event)'), widgetSource.indexOf('\n}\n\nfunction postContextToParent'));
assert.ok(!handleSubmitSource.includes('appendContextualAnimationSuggestions'), 'O envio não deve anexar recursos automaticamente.');
assert.ok(handleSubmitSource.indexOf("isLikelyInScope?.(userText) === false") < handleSubmitSource.lastIndexOf('WidgetKeywordBot.getBotResponse(userText)'),
  'O escopo deve ser validado antes do fallback educacional por palavras-chave.');
assert.ok(!widgetSource.includes('function getLatestAnimationEntries'), 'O chat não deve manter uma lista manual de recursos "mais recentes".');
assert.ok(!widgetSource.includes('\u0008'), 'Expressões regulares não podem conter caracteres de retrocesso no lugar de limites de palavra.');

const canonicalizeStart = widgetSource.indexOf('function canonicalizeAssistantReply');
const canonicalizeEnd = widgetSource.indexOf('function resolveSharedAsset', canonicalizeStart);
const canonicalizeSandbox = {};
vm.runInNewContext(`function canonicalizeKnownSiteUrl(value) { return value; }\n${widgetSource.slice(canonicalizeStart, canonicalizeEnd)}\nglobalThis.__canonicalize = canonicalizeAssistantReply;`, canonicalizeSandbox);
assert.equal(canonicalizeSandbox.__canonicalize('Orbitais (animação).'), 'Visualizador de Orbitais Atômicos e Moleculares.');
assert.equal(canonicalizeSandbox.__canonicalize('Coordenação (página)'), 'Complexos e polimorfismo');

const keywordBotStart = widgetSource.indexOf('const WidgetKeywordBot = (() => {');
const keywordBotEnd = widgetSource.indexOf('let SIMOENS_SITE_MAP', keywordBotStart);
assert.ok(keywordBotStart >= 0 && keywordBotEnd > keywordBotStart, 'Não foi possível isolar o mecanismo determinístico.');
const keywordBotSource = widgetSource.slice(keywordBotStart, keywordBotEnd);
const helpReplyMatch = widgetSource.match(/const GENERIC_HELP_REPLY = `([\s\S]*?)`;/);
assert.ok(helpReplyMatch, 'A resposta de ajuda não foi encontrada.');
const storage = new Map();
const sandbox = {
  console,
  window: { SiMoEnsSearchCore: core },
  GENERIC_HELP_REPLY: helpReplyMatch[1],
  sessionStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
  },
  SIMOENS_SITE_MAP: [],
};
const keywordBotPrelude = `
  const SITE_URL = 'https://quimicavisualufv.github.io/Quimica-Visual/';
  function normalize(value = '') { return String(value).normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\\s+/g, ' '); }
  function entryUrl(entry) { return entry && entry.path ? SITE_URL + entry.path : SITE_URL; }
`;
vm.runInNewContext(`${keywordBotPrelude}\n${keywordBotSource}\nglobalThis.__keywordBot = WidgetKeywordBot;`, sandbox);
const keywordBot = sandbox.__keywordBot;

const triplePointReply = keywordBot.getBotResponse('qual é o ponto triplo?');
assert.match(triplePointReply, /ponto triplo/i);
assert.doesNotMatch(triplePointReply, /Oxigênio \(O\)/i, 'Ponto triplo não pode ser confundido com o símbolo O.');
assert.match(keywordBot.getBotResponse('fale sobre oxigênio'), /Oxigênio \(O\)/);
assert.match(keywordBot.getBotResponse('fale sobre berílio'), /ainda não tenho uma ficha local revisada/i);

const topicReply = keywordBot.getBotResponse('cristalografia');
assert.match(topicReply, /Células unitárias e redes/);
assert.doesNotMatch(topicReply, /o que prefere|Animações relacionadas/i);
const greetingOne = keywordBot.getBotResponse('olá');
const greetingTwo = keywordBot.getBotResponse('olá');
assert.equal(greetingOne, greetingTwo, 'A saudação deve ser determinística.');
const polarityReply = keywordBot.getBotResponse('o que é polaridade molecular?');
assert.doesNotMatch(polarityReply, /https?:\/\/|Abrir recurso|Animações relacionadas/i,
  'Uma explicação conceitual não deve receber indicação automática.');
assert.match(keywordBot.getBotResponse('faça uma questão sobre VSEPR'), /Gabarito/);
assert.match(keywordBot.getBotResponse('instruções'), /As indicações aparecem quando você pede/);

console.log(JSON.stringify({
  status: 'PASS',
  coreVersion: core.version,
  resources: resources.length,
  categoryCounts,
  assertions: 47,
}, null, 2));
