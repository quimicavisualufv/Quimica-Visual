import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeTemp = process.env.TMPDIR || path.join(root, 'test-results', '.runtime-tmp');
process.env.TMPDIR = runtimeTemp;
await fs.mkdir(runtimeTemp, { recursive: true });

function loadPlaywright() {
  try { return require('playwright'); } catch (firstError) {
    const moduleRoot = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
    if (moduleRoot) {
      try { return require(path.join(moduleRoot, 'playwright')); } catch {}
    }
    throw firstError;
  }
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    if (['.git', 'node_modules'].includes(entry.name)) return [];
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }));
  return nested.flat();
}

function createStaticServer() {
  return http.createServer(async (request, response) => {
    try {
      const parsed = new URL(request.url, 'http://127.0.0.1');
      let relative = decodeURIComponent(parsed.pathname).replace(/^\/+/, '').replace(/^Quimica-Visual\/?/i, '');
      let target = path.resolve(root, relative || 'index.html');
      if (target !== root && !target.startsWith(`${root}${path.sep}`)) return response.writeHead(403).end();
      const stat = await fs.stat(target);
      if (stat.isDirectory()) target = path.join(target, 'index.html');
      const data = await fs.readFile(target);
      const extension = path.extname(target).toLowerCase();
      const type = ({ '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' })[extension] || 'application/octet-stream';
      response.writeHead(200, { 'content-type': `${type}${type.startsWith('text/') || type === 'application/json' ? '; charset=utf-8' : ''}` }).end(data);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
}

function pagePath(file) {
  return path.relative(root, file).split(path.sep).map(encodeURIComponent).join('/');
}

const knownOptionalOrigins = new Set(['https://vlibras.gov.br', 'https://unpkg.com', 'https://www.google.com', 'https://esm.run', 'https://storage.googleapis.com']);
const report = { pages: 0, consoleErrors: [], pageErrors: [], localFailures: [], optionalExternalFailures: [], responsive: [], interactions: [] };
let playwright;
try {
  playwright = loadPlaywright();
} catch (error) {
  console.error(`RUNTIME_BROWSER_UNAVAILABLE: Playwright não pôde ser carregado: ${error.message}`);
  process.exit(2);
}

const server = createStaticServer();
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const origin = `http://127.0.0.1:${server.address().port}`;

let browser;
try {
  browser = await playwright.chromium.launch({ headless: true, args: ['--use-angle=swiftshader'] });
} catch (error) {
  await new Promise((resolve) => server.close(resolve));
  console.error(`RUNTIME_BROWSER_UNAVAILABLE: o Chromium não pôde ser iniciado: ${error.message}`);
  process.exit(2);
}

try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  await context.route('**/*', async (route) => {
    const target = new URL(route.request().url());
    if (target.origin === origin) return route.continue();
    report.optionalExternalFailures.push({ url: target.href, reason: 'blocked-offline-baseline' });
    return route.abort('blockedbyclient');
  });

  const files = await walk(root);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  for (const file of htmlFiles) {
    const page = await context.newPage();
    const relative = pagePath(file);
    const pageConsoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && !/Failed to load resource|ERR_BLOCKED_BY_CLIENT/i.test(message.text())) pageConsoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => report.pageErrors.push({ page: relative, message: error.message }));
    page.on('response', (response) => {
      const target = new URL(response.url());
      if (target.origin === origin && response.status() >= 400) report.localFailures.push({ page: relative, status: response.status(), url: target.pathname });
    });
    page.on('requestfailed', (request) => {
      const target = new URL(request.url());
      if (target.origin === origin) report.localFailures.push({ page: relative, failure: request.failure()?.errorText || 'request failed', url: target.pathname });
      else if (!knownOptionalOrigins.has(target.origin)) report.optionalExternalFailures.push({ page: relative, url: target.href, reason: request.failure()?.errorText || 'external failure' });
    });

    const response = await page.goto(`${origin}/${relative}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    assert.ok(response?.ok(), `${relative} não respondeu com HTTP 2xx.`);
    await page.waitForTimeout(500);
    assert.ok(await page.locator('body').count(), `${relative} não renderizou body.`);
    assert.ok((await page.title()).trim(), `${relative} não possui título de documento.`);
    const bodyTextLength = await page.locator('body').innerText().then((text) => text.trim().length).catch(() => 0);
    assert.ok(bodyTextLength > 0 || await page.locator('canvas, iframe, model-viewer').count(), `${relative} não exibiu conteúdo verificável.`);
    if (pageConsoleErrors.length) report.consoleErrors.push({ page: relative, messages: pageConsoleErrors });
    report.pages += 1;
    await page.close();
  }

  const responsivePages = [
    'index.html',
    'Ensino/index.html',
    'Ensino/Animacao/visualizador_orbitais/index.html',
    'Ensino/Animacao/redes-cristalinas/index.html',
    'Ensino/Exercicio%20Guiado/Contagem-de-atomo/index.html',
    'Ensino/jogo/quebra-cabeca-ionico-covalente/index.html',
    'Ensino/jogo/ca%C3%A7a-palavras/index.html',
    'Chat/chatbot.html',
  ];
  const viewports = [[320, 568], [360, 800], [390, 844], [412, 915], [768, 1024], [1024, 768], [1366, 768], [1440, 900], [1920, 1080]];
  for (const [width, height] of viewports) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height });
    for (const relative of responsivePages) {
      await page.goto(`${origin}/${relative}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(250);
      const state = await page.evaluate(() => ({
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        viewportWidth: document.documentElement.clientWidth,
        bodyWidth: document.body?.getBoundingClientRect().width || 0,
      }));
      report.responsive.push({ page: relative, width, height, ...state });
      assert.ok(state.horizontalOverflow <= 4, `${relative} excedeu a largura em ${state.horizontalOverflow}px no viewport ${width}×${height}.`);
    }
    await page.close();
  }

  const interactionPage = await context.newPage();
  await interactionPage.goto(`${origin}/Ensino/Animacao/redes-cristalinas/index.html`, { waitUntil: 'domcontentloaded' });
  const chatHost = interactionPage.locator('#simoens-chat-widget-host');
  await chatHost.waitFor({ state: 'attached', timeout: 10000 });
  await chatHost.locator('#toggleBtn').click();
  await chatHost.locator('#input').fill('o que eu estou vendo?');
  await chatHost.locator('#sendBtn').click();
  await chatHost.locator('.sw-msgrow.assistant').last().waitFor({ state: 'visible', timeout: 10000 });
  assert.match(await chatHost.locator('.sw-msgrow.assistant').last().innerText(), /Redes cristalinas/i, 'O chat não reconheceu a experiência atual.');
  await chatHost.locator('#input').fill('o que é uma célula unitária?');
  await chatHost.locator('#sendBtn').click();
  await interactionPage.waitForTimeout(300);
  assert.match(await chatHost.locator('.sw-msgrow.assistant').last().innerText(), /célula unitária/i, 'O chat não respondeu à pergunta conceitual.');
  await chatHost.locator('#input').fill('e qual exercício eu posso fazer sobre isso?');
  await chatHost.locator('#sendBtn').click();
  await interactionPage.waitForTimeout(300);
  assert.match(await chatHost.locator('.sw-msgrow.assistant').last().innerText(), /exercício|Fórmula Unitária/i, 'O chat perdeu o assunto no follow-up.');
  report.interactions.push('chat-context-and-follow-up');
  await interactionPage.close();

  const tabsPage = await context.newPage();
  await tabsPage.goto(`${origin}/Ensino/Animacao/simetria-e-formula-unitaria/index.html`, { waitUntil: 'domcontentloaded' });
  const firstTab = tabsPage.locator('[role="tab"]').first();
  await firstTab.focus();
  await firstTab.press('ArrowRight');
  assert.equal(await tabsPage.locator('#tab-celulas').getAttribute('aria-selected'), 'true', 'As abas de simetria não respondem a ArrowRight.');
  assert.match(await tabsPage.locator('#stage').getAttribute('title'), /Translação|Células/i, 'O iframe não atualizou seu título contextual.');
  report.interactions.push('simetria-tabs-keyboard');
  await tabsPage.close();

  const puzzleTabsPage = await context.newPage();
  await puzzleTabsPage.goto(`${origin}/Ensino/jogo/quebra-cabeca-ionico-covalente/index.html`, { waitUntil: 'domcontentloaded' });
  await puzzleTabsPage.locator('#tab-ions').focus();
  await puzzleTabsPage.locator('#tab-ions').press('ArrowRight');
  assert.equal(await puzzleTabsPage.locator('#tab-cov').getAttribute('aria-selected'), 'true', 'As abas do quebra-cabeça não respondem ao teclado.');
  assert.equal(await puzzleTabsPage.locator('#frame-cov').getAttribute('aria-hidden'), 'false', 'O iframe covalente não foi exposto ao selecionar a aba.');
  report.interactions.push('puzzle-tabs-keyboard');
  await puzzleTabsPage.close();

  const wordSearchPage = await context.newPage();
  await wordSearchPage.goto(`${origin}/Ensino/jogo/ca%C3%A7a-palavras/paginas/animacao-redes-cristalinas.html?mode=wordsearch&difficulty=easy`, { waitUntil: 'domcontentloaded' });
  const firstCell = wordSearchPage.locator('.ws-cell').first();
  await firstCell.focus();
  await firstCell.press('Enter');
  assert.equal(await firstCell.getAttribute('aria-selected'), 'true', 'O caça-palavras não iniciou seleção pelo teclado.');
  await firstCell.press('Escape');
  assert.equal(await firstCell.getAttribute('aria-selected'), 'false', 'O caça-palavras não cancelou a seleção pelo teclado.');
  report.interactions.push('word-search-keyboard');
  await wordSearchPage.close();

  const accessibilityPage = await context.newPage();
  await accessibilityPage.goto(`${origin}/Ensino/index.html`, { waitUntil: 'domcontentloaded' });
  await accessibilityPage.locator('.simoens-a11y-trigger').click();
  await accessibilityPage.locator('[data-a11y-toggle="contrast"]').click();
  assert.ok(await accessibilityPage.locator('html').evaluate((element) => element.classList.contains('simoens-a11y-contrast')), 'Alto contraste não foi aplicado.');
  await accessibilityPage.reload({ waitUntil: 'domcontentloaded' });
  assert.ok(await accessibilityPage.locator('html').evaluate((element) => element.classList.contains('simoens-a11y-contrast')), 'A preferência de contraste não persistiu.');
  await accessibilityPage.locator('.simoens-a11y-trigger').click();
  await accessibilityPage.locator('[data-a11y-action="reset"]').click();
  assert.ok(await accessibilityPage.locator('html').evaluate((element) => !element.classList.contains('simoens-a11y-contrast')), 'Restaurar ajustes não removeu o contraste.');
  report.interactions.push('accessibility-persistence-reset');
  await accessibilityPage.close();

  assert.deepEqual(report.pageErrors, [], `Exceções JavaScript:\n${JSON.stringify(report.pageErrors, null, 2)}`);
  assert.deepEqual(report.localFailures, [], `Falhas de recursos locais:\n${JSON.stringify(report.localFailures, null, 2)}`);
  assert.deepEqual(report.consoleErrors, [], `Erros de console:\n${JSON.stringify(report.consoleErrors, null, 2)}`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
