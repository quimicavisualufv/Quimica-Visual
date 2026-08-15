import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function extractBalancedLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `Marcador ausente: ${marker}`);
  let start = markerIndex + marker.length;
  while (/\s|=/.test(source[start] || '')) start += 1;
  const opening = source[start];
  const closing = opening === '[' ? ']' : opening === '{' ? '}' : '';
  assert.ok(closing, `Literal inválido após ${marker}`);
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }
    if (character === opening) depth += 1;
    if (character === closing) depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Literal não encerrado após ${marker}`);
}

function evaluateLiteral(source, marker, filename) {
  return vm.runInNewContext(`(${extractBalancedLiteral(source, marker)})`, Object.create(null), { filename, timeout: 1000 });
}

function wordExists(grid, rawWord) {
  const word = String(rawWord).toUpperCase();
  const height = grid.length;
  const width = grid[0]?.length || 0;
  const directions = [-1, 0, 1].flatMap((rowDelta) => [-1, 0, 1].map((columnDelta) => [rowDelta, columnDelta])).filter(([rowDelta, columnDelta]) => rowDelta || columnDelta);
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      for (const [rowDelta, columnDelta] of directions) {
        let matches = true;
        for (let offset = 0; offset < word.length; offset += 1) {
          const candidateRow = row + rowDelta * offset;
          const candidateColumn = column + columnDelta * offset;
          if (candidateRow < 0 || candidateRow >= height || candidateColumn < 0 || candidateColumn >= width || grid[candidateRow][candidateColumn] !== word[offset]) {
            matches = false;
            break;
          }
        }
        if (matches) return true;
      }
    }
  }
  return false;
}

const showPath = path.join(root, 'Ensino', 'jogo', 'show-do-milhao-da-quimica', 'assets', 'js', 'script1.js');
const showSource = await fs.readFile(showPath, 'utf8');
const questions = evaluateLiteral(showSource, 'const allQuestions', showPath);
assert.equal(questions.length, 151, 'A quantidade de perguntas do Show do Milhão mudou inesperadamente.');
assert.equal(new Set(questions.map((question) => question.id)).size, questions.length, 'IDs repetidos no Show do Milhão.');
for (const question of questions) {
  assert.ok(Number.isInteger(question.id), 'Pergunta sem ID inteiro no Show do Milhão.');
  assert.ok([1, 2, 3, 4].includes(question.difficulty), `Dificuldade inválida na pergunta ${question.id}.`);
  assert.ok(Array.isArray(question.options) && question.options.length >= 2, `Alternativas inválidas na pergunta ${question.id}.`);
  assert.ok(question.options.includes(question.answer), `Gabarito fora das alternativas na pergunta ${question.id}.`);
}

const exerciseRoot = path.join(root, 'Ensino', 'Exercicio Guiado');
const exerciseDirectories = await fs.readdir(exerciseRoot, { withFileTypes: true });
let exercisePages = 0;
let exerciseQuestions = 0;
for (const entry of exerciseDirectories) {
  if (!entry.isDirectory()) continue;
  const scriptPath = path.join(exerciseRoot, entry.name, 'assets', 'js', 'script1.js');
  let source;
  try { source = await fs.readFile(scriptPath, 'utf8'); } catch { continue; }
  if (!source.includes('const PAGE')) continue;
  const page = evaluateLiteral(source, 'const PAGE', scriptPath);
  exercisePages += 1;
  assert.ok(page.title, `Exercício sem título: ${entry.name}`);
  if (!Array.isArray(page.questions)) continue;
  assert.ok(page.questions.length > 0, `Exercício sem questões: ${entry.name}`);
  exerciseQuestions += page.questions.length;
  for (const [index, question] of page.questions.entries()) {
    assert.ok(Array.isArray(question.options) && question.options.length >= 2, `Alternativas inválidas em ${entry.name}, questão ${index + 1}.`);
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length, `Gabarito inválido em ${entry.name}, questão ${index + 1}.`);
  }
}
assert.ok(exercisePages >= 7, 'Poucos módulos de exercício foram localizados.');
assert.equal(exerciseQuestions, 48, 'A quantidade de questões estruturadas dos exercícios mudou inesperadamente.');

const battlePath = path.join(exerciseRoot, 'batalha-de-polaridade', 'assets', 'js', 'script1.js');
const battleSource = await fs.readFile(battlePath, 'utf8');
const duels = evaluateLiteral(battleSource, 'const duels', battlePath);
assert.equal(duels.length, 10, 'A quantidade de duelos de polaridade mudou inesperadamente.');
for (const duel of duels) {
  const expected = duel.left.polarity === duel.right.polarity ? 'tie' : duel.left.polarity > duel.right.polarity ? 'left' : 'right';
  assert.equal(duel.answer, expected, `Gabarito incompatível no duelo ${duel.left.name} × ${duel.right.name}.`);
}

const sitePath = path.join(exerciseRoot, 'caca-ao-sitio-cristalino', 'assets', 'js', 'script1.js');
const siteSource = await fs.readFile(sitePath, 'utf8');
const rounds = evaluateLiteral(siteSource, 'const rounds', sitePath);
assert.equal(rounds.length, 11, 'A quantidade de rodadas do caça ao sítio mudou inesperadamente.');
for (const [index, round] of rounds.entries()) {
  assert.ok(round.structure && round.prompt && Array.isArray(round.valid) && round.valid.length, `Rodada ${index + 1} inválida no caça ao sítio.`);
}

const wordSearchRoot = path.join(root, 'Ensino', 'jogo', 'caça-palavras');
const configSource = await fs.readFile(path.join(wordSearchRoot, 'assets', 'js', 'config.js'), 'utf8');
const themes = JSON.parse(extractBalancedLiteral(configSource, 'window.PUZZLE_THEMES'));
assert.equal(themes.length, 17, 'A quantidade de temas do caça-palavras mudou inesperadamente.');
let wordSearchBoards = 0;
let crosswordBoards = 0;
for (const theme of themes) {
  const themePath = path.join(wordSearchRoot, theme.file.replace(/\.html$/, '.inline-script-01.js'));
  const themeSource = await fs.readFile(themePath, 'utf8');
  const data = JSON.parse(extractBalancedLiteral(themeSource, 'window.PUZZLE_DATA'));
  for (const difficulty of ['easy', 'medium', 'hard']) {
    const wordSearch = data.wordsearch[difficulty];
    const widths = new Set(wordSearch.grid.map((row) => row.length));
    assert.equal(widths.size, 1, `Grade irregular em ${theme.file} (${difficulty}).`);
    for (const word of wordSearch.words) assert.ok(wordExists(wordSearch.grid, word.word), `Palavra ${word.word} ausente da grade ${theme.file} (${difficulty}).`);
    wordSearchBoards += 1;

    const crossword = data.crossword[difficulty];
    assert.ok(crossword.grid.length && crossword.width > 0, `Cruzadinha inválida em ${theme.file} (${difficulty}).`);
    for (const clue of [...crossword.across, ...crossword.down]) assert.ok(wordExists(crossword.grid, clue.answer), `Resposta ${clue.answer} ausente da cruzadinha ${theme.file} (${difficulty}).`);
    crosswordBoards += 1;
  }
}

console.log(`Integridade educacional concluída: ${questions.length} perguntas do Show do Milhão, ${exerciseQuestions} questões em ${exercisePages} exercícios, ${duels.length} duelos, ${rounds.length} rodadas, ${wordSearchBoards} caça-palavras e ${crosswordBoards} cruzadinhas.`);
