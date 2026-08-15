# Verificação do SiMoEns

Os testes não exigem build. Execute-os na raiz do projeto com uma versão atual do Node.js.

## Suíte disponível

| Comando | Cobertura principal |
| --- | --- |
| `node tests/validate-project.mjs` | HTML, CSS, JavaScript, JSON, links, assets, sitemap, ARIA, registro, arquivos temporários, dependências externas e duplicatas grandes |
| `node tests/http-smoke.mjs` | `GET` de todas as páginas e `HEAD` de referências locais por servidor HTTP real |
| `node tests/data-integrity.mjs` | Perguntas, respostas, IDs e conjuntos de dados de exercícios e jogos |
| `node tests/chat-retrieval.mjs` | Comparação do ranking legado com BM25, intenções, caminhos, contexto e descoberta de recursos |
| `node tests/chat-behavior.mjs` | Política de indicação, singular/plural, continuidade, ordinais, escopo, aliases de elementos e não fabricação de recursos |
| `node tests/chat-performance.mjs` | Tamanho dos artefatos, construção do índice e latência de busca local |
| `node tests/browser-runtime.mjs` | Páginas, console, exceções, recursos, interações, teclado, chat, acessibilidade e responsividade em Chromium |

Uma regressão estática completa pode ser executada sequencialmente:

```bash
node tests/validate-project.mjs
node tests/http-smoke.mjs
node tests/data-integrity.mjs
node tests/chat-retrieval.mjs
node tests/chat-behavior.mjs
node tests/chat-performance.mjs
```

## Teste em navegador

`tests/browser-runtime.mjs` requer o pacote Playwright e o binário do Chromium. Ele inicia seu próprio servidor HTTP local e bloqueia origens externas para verificar o baseline offline sem transformar serviços opcionais em falhas locais.

```bash
npx playwright install chromium
node tests/browser-runtime.mjs
```

O código de saída `2` significa que Playwright ou Chromium não está disponível; não significa que uma página foi aprovada ou reprovada. Quando o navegador inicia, qualquer exceção JavaScript, erro de console relevante, recurso local quebrado, overflow acima da tolerância ou interação inválida faz o teste falhar.

Viewports cobertos:

- 320 × 568
- 360 × 800
- 390 × 844
- 412 × 915
- 768 × 1024
- 1024 × 768
- 1366 × 768
- 1440 × 900
- 1920 × 1080

Interações cobertas pela automação de navegador:

- contexto de página e continuidade do chat;
- abas por teclado em Simetria e no quebra-cabeça;
- seleção por teclado no caça-palavras;
- persistência e restauração das preferências de acessibilidade.

WebGPU, WebLLM, áudio real, gestos multitoque e fidelidade visual precisam de uma matriz adicional de dispositivos/navegadores; a suíte não declara essas áreas aprovadas sem executá-las.
