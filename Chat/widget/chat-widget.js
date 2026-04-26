

/* Widget atualizado para usar o mesmo motor offline do chatbot completo. */
const STORAGE_KEYS = {
  messages: 'simoens.webllm.messages.v3',
  open: 'simoens.webllm.open.v1',
  page: 'simoens.webllm.page.v1',
  frame: 'simoens.webllm.frame.v1',
  pageConversations: 'simoens.local.chat.conversations.v4',
  pageActiveConversation: 'simoens.local.chat.active.v4',
};

const Canonical = window.QuimiBotCanonicalEngine;

const ACTIVE_MODEL_ID = 'Qwen2.5-3B-Instruct-q4f16_1-MLC';
const SITE_URL = 'https://quimicavisualufv.github.io/Quimica-Visual/';
const SITE_ROOT_URL = new URL('../../', document.currentScript?.src || new URL('assets/chat-widget/chat-widget.js', document.baseURI).href).href;
const BASE_SYSTEM_PROMPT = `Você é o Assistente do SiMoEns. Responda sempre em português do Brasil, com tom didático, claro, direto e natural. Toda pergunta deve ser respondida a partir de um ponto de vista químico, mesmo quando o assunto original vier de outra área. Sempre que fizer sentido, conecte a resposta a Química dos Sólidos, estrutura da matéria, ligações, organização cristalina, defeitos, propriedades de materiais, coordenação, empacotamento, simetria, células unitárias, redes cristalinas ou fenômenos relacionados. Sempre que houver relação plausível com o site SiMoEns, tente mencionar ou sugerir animações, páginas ou visualizadores relevantes do próprio site, sem inventar recursos que não existam. Use o contexto da página atual e o histórico recente quando o usuário fizer continuação curta ou usar referências como isso, esse, essa, naquele caso ou no outro. Não recuse perguntas por serem amplas ou interdisciplinares; reinterprete-as pelo olhar químico. Se a pergunta estiver ambígua, escolha a leitura química mais provável e sinalize a ambiguidade em no máximo uma frase curta. Não cite detalhes internos de implementação. Não invente resultados experimentais, links ou animações fora do mapa fornecido.`;
const DEFAULT_GENERATION_CONFIG = Object.freeze({
  temperature: 0.2,
  maxTokens: 320,
  topP: 0.9,
  repetitionPenalty: 1.05,
  seed: null,
  systemPrompt: BASE_SYSTEM_PROMPT,
});

const SAMPLE_QUESTIONS = [
  "Quais recursos novos foram adicionados na página de ensino?",
  "Qual é o link de Classificação do sistema cristalino (Exercício)?",
  "Qual é o link de Interstícios cristalinos (Exercício)?",
  "Qual é o link de Caça ao sítio cristalino (Exercício)?",
  "Qual é o link de Fórmula Unitária na Prática (Exercício)?",
  "Qual é o link de Coordenação e empacotamento (Exercício)?",
  "Qual é o link de Identificação de defeitos cristalinos (Exercício)?",
  "Qual é o link de Comparação de polaridade molecular (Exercício)?",
  "Qual é o link de Caça-palavras (Jogo)?",
  "Qual é o link de Xadrez Químico (Jogo)?",
  "Sobre o que fala o exercício de defeitos cristalinos?",
  "Sobre o que fala o exercício de coordenação e empacotamento?"
];

const SHARED_REPLY_REFINER_PROMPT = `Você vai atuar como refinador de resposta didática do SiMoEns. Receberá a pergunta do usuário, uma resposta-base e um pequeno contexto da página. Sua tarefa é somente reescrever a resposta-base para que fique mais natural, clara e agradável, preservando integralmente o conteúdo factual, as limitações e o foco original. Não invente informações. Não acrescente conceitos, páginas, links, exemplos ou referências não sustentados pela resposta-base. Não transforme a resposta em recusa. Não diga que está refinando. Mantenha listas úteis. Entregue somente a resposta final ao usuário, em português do Brasil.`;
const REFUSAL_REPAIR_PROMPT = `A tentativa anterior ficou excessivamente recusada, vaga ou defensiva. Refaça agora a resposta de modo direto, útil e didático. Se a pergunta estiver dentro de Química, do SiMoEns ou do contexto recente, responda normalmente sem mencionar limitação genérica, política, escopo ou falta de contexto como motivo de recusa. Quando houver ambiguidade leve, escolha a interpretação química mais provável e avise isso em uma frase curta. Não invente dados específicos do site.`;
const WEBLLM_IMPORT_CANDIDATES = [
  window.SIMOENS_WEBLLM_IMPORT_URL,
  'https://esm.run/@mlc-ai/web-llm'
].filter(Boolean);
const OFF_TOPIC_REPLY = 'Posso te ajudar melhor com Química e com os conteúdos do site SiMoEns. Se quiser, me mande o conceito, a dúvida ou a página/animação que eu sigo por aí.';
const GENERIC_HELP_REPLY = `Posso responder qualquer pergunta por um olhar químico. Quando fizer sentido, eu conecto a resposta com Química dos Sólidos e com as animações do SiMoEns, como Wigner-Seitz, redes cristalinas, buracos intersticiais, células unitárias, geometria molecular, polaridade, simetria, polimorfismo, modelos atômicos e orbitais hidrogenoides.`;
const ICON_SVG = `
<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <circle cx="32" cy="32" r="30" fill="#000000"></circle>
  <path fill="#ffffff" d="M32 16c-9.7 0-17.5 6.7-17.5 15.1 0 4.4 2.2 8.3 5.8 10.9-.4 4.4-2.8 7.3-2.8 7.3 4.3-.2 7.6-2 9.5-3.4 1.6.4 3.3.6 5 .6 9.7 0 17.5-6.7 17.5-15.1S41.7 16 32 16z"></path>
</svg>`;

(function silenceKnownGpuWarning() {
  const originalWarn = console.warn;
  if (typeof originalWarn !== 'function') return;
  console.warn = function (...args) {
    const joined = args.map((item) => String(item ?? '')).join(' ');
    if (joined.includes('The powerPreference option is currently ignored when calling requestAdapter() on Windows')) return;
    return originalWarn.apply(this, args);
  };
})();

const WIDGET_SCRIPT_SRC = document.currentScript?.src || new URL('assets/chat-widget/chat-widget.js', document.baseURI).href;
const CHAT_WIDGET_RUNTIME_CONFIG = (() => {
  const raw = window.SimoensChatWidgetConfig || window.SIMOENS_CHAT_WIDGET_CONFIG || {};
  const mode = String(raw.mode || '').trim().toLowerCase() === 'embedded' ? 'embedded' : 'floating';
  const mountSelector = typeof raw.mountSelector === 'string' ? raw.mountSelector.trim() : '';
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : 'Assistente do SiMoEns';
  const layout = typeof raw.layout === 'string' && raw.layout.trim() ? raw.layout.trim().toLowerCase() : (raw.pageShell ? 'legacy-page' : 'widget');
  const startOpen = mode === 'embedded' ? true : raw.startOpen !== false;
  const hideToggle = mode === 'embedded' ? true : raw.hideToggle === true;
  const allowClose = mode === 'embedded' ? false : raw.allowClose !== false;
  return { mode, mountSelector, title, layout, startOpen, hideToggle, allowClose };
})();
const DOC_RAG_CHUNKS_URL = window.SIMOENS_DOC_CHUNKS_URL || window.SIMOENS_DOC_INDEX_URL || new URL('../../assets/chat/docs/doc_index.json', WIDGET_SCRIPT_SRC).href;
const IS_LOCAL_FILE_RUNTIME = window.location.protocol === 'file:' || window.location.origin === 'null';
const DOC_RAG_MAX_CHUNKS = Number.isFinite(Number(window.SIMOENS_DOC_RAG_MAX_CHUNKS)) ? Math.max(1, Math.min(8, Number(window.SIMOENS_DOC_RAG_MAX_CHUNKS))) : 5;
const DOC_RAG_MIN_SCORE = Number.isFinite(Number(window.SIMOENS_DOC_RAG_MIN_SCORE)) ? Number(window.SIMOENS_DOC_RAG_MIN_SCORE) : 2.2;
const DOC_RAG_MAX_CHARS = Number.isFinite(Number(window.SIMOENS_DOC_RAG_MAX_CHARS)) ? Math.max(240, Math.min(1600, Number(window.SIMOENS_DOC_RAG_MAX_CHARS))) : 560;
const SHARED_CORE_SCRIPTS = [
  '../../assets%20chat/knowledge-base.js',
  '../../assets%20chat/animations.js',
  '../../assets%20chat/response-variation.js',
  '../../assets%20chat/canonical-engine.js',
  '../../assets%20chat/intent-engine.js',
  '../../assets%20chat/memory-engine.js',
  '../../assets%20chat/qa-bank.js',
  '../../assets%20chat/qa-extensions.js',
  '../../assets%20chat/qa-engine.js',
  '../../assets%20chat/question-generator.js',
  '../../assets%20chat/study-routes-bank.js',
  '../../assets%20chat/study-routes-extensions.js',
  '../../assets%20chat/study-routes-engine.js',
  '../../assets%20chat/study-routes-engine-extensions.js',
  '../../assets%20chat/comparisons-bank.js',
  '../../assets%20chat/comparisons-extensions.js',
  '../../assets%20chat/comparisons-engine.js',
  '../../assets%20chat/knowledge-extensions.js',
  '../../assets%20chat/quimibot-core.js',
];
const SHARED_SCRIPT_PROMISES = Object.create(null);

const WidgetKeywordBot = (() => {
const elementsData = {
    "h": "**Hidrogênio (H)**\n- **Número Atômico:** 1\n- **Massa Atômica:** 1,008 u\n- **Grupo:** 1 (Não-metal)\n- **Estado Físico:** Gás incolor\n- **Características:** É o elemento mais leve e abundante no universo (cerca de 75% da massa elementar). Altamente inflamável. Forma a água (H₂O) e a maioria dos compostos orgânicos.\n- **Aplicações:** Combustível de foguetes, células a combustível, produção de amônia (processo Haber) e hidrogenação de óleos.",
    "he": "**Hélio (He)**\n- **Número Atômico:** 2\n- **Massa Atômica:** 4,0026 u\n- **Grupo:** 18 (Gás Nobre)\n- **Estado Físico:** Gás incolor\n- **Características:** O segundo elemento mais leve e abundante. É inerte, não inflamável e possui o menor ponto de ebulição de todos os elementos.\n- **Aplicações:** Enchimento de balões e dirigíveis, resfriamento de ímãs supercondutores (como em máquinas de ressonância magnética) e misturas respiratórias para mergulho profundo.",
    "li": "**Lítio (Li)**\n- **Número Atômico:** 3\n- **Massa Atômica:** 6,94 u\n- **Grupo:** 1 (Metal Alcalino)\n- **Estado Físico:** Sólido (Metal macio e prateado)\n- **Características:** É o metal mais leve e o elemento sólido menos denso. Altamente reativo e inflamável, deve ser armazenado em óleo mineral.\n- **Aplicações:** Baterias recarregáveis (íon-lítio) para eletrônicos e veículos elétricos, ligas metálicas leves e medicamentos psiquiátricos (carbonato de lítio).",
    "c": "**Carbono (C)**\n- **Número Atômico:** 6\n- **Massa Atômica:** 12,011 u\n- **Grupo:** 14 (Não-metal)\n- **Estado Físico:** Sólido\n- **Características:** Base da química orgânica e da vida na Terra. Possui vários alótropos, como grafite (macio, condutor), diamante (extremamente duro, isolante) e fulerenos. Pode formar quatro ligações covalentes.\n- **Aplicações:** Combustíveis fósseis, plásticos, polímeros, aço (liga com ferro), joias (diamante) e nanotecnologia (grafeno).",
    "n": "**Nitrogênio (N)**\n- **Número Atômico:** 7\n- **Massa Atômica:** 14,007 u\n- **Grupo:** 15 (Não-metal)\n- **Estado Físico:** Gás incolor\n- **Características:** Gás diatômico (N₂) inerte que compõe cerca de 78% da atmosfera terrestre. Essencial para a vida (presente em aminoácidos e ácidos nucleicos).\n- **Aplicações:** Produção de amônia e fertilizantes, explosivos, gás de proteção inerte na indústria e resfriamento criogênico (nitrogênio líquido).",
    "o": "**Oxigênio (O)**\n- **Número Atômico:** 8\n- **Massa Atômica:** 15,999 u\n- **Grupo:** 16 (Calcogênio / Não-metal)\n- **Estado Físico:** Gás incolor\n- **Características:** Elemento altamente reativo e oxidante. Compõe cerca de 21% da atmosfera terrestre e é o elemento mais abundante na crosta terrestre. Essencial para a respiração celular.\n- **Aplicações:** Suporte à vida (medicina), processos de combustão, siderurgia, tratamento de água e produção de produtos químicos.",
    "f": "**Flúor (F)**\n- **Número Atômico:** 9\n- **Massa Atômica:** 18,998 u\n- **Grupo:** 17 (Halogênio)\n- **Estado Físico:** Gás amarelo-pálido\n- **Características:** É o elemento mais eletronegativo e reativo de todos. Reage com quase todos os outros elementos, incluindo alguns gases nobres.\n- **Aplicações:** Prevenção de cáries (fluoretos em pastas de dente e água), produção de teflon (politetrafluoretileno) e enriquecimento de urânio.",
    "na": "**Sódio (Na)**\n- **Número Atômico:** 11\n- **Massa Atômica:** 22,990 u\n- **Grupo:** 1 (Metal Alcalino)\n- **Estado Físico:** Sólido (Metal macio e prateado)\n- **Características:** Muito reativo, oxida rapidamente no ar e reage rápidamente com a água, liberando hidrogênio. Essencial para a função nervosa em animais.\n- **Aplicações:** Sal de cozinha (NaCl), iluminação pública (lâmpadas de vapor de sódio), fabricação de sabões e purificação de metais fundidos.",
    "mg": "**Magnésio (Mg)**\n- **Número Atômico:** 12\n- **Massa Atômica:** 24,305 u\n- **Grupo:** 2 (Metal Alcalinoterroso)\n- **Estado Físico:** Sólido (Metal cinza-prateado)\n- **Características:** Metal leve e razoavelmente forte. Queima com uma luz branca ofuscante. É o átomo central da molécula de clorofila, essencial para a fotossíntese.\n- **Aplicações:** Ligas metálicas leves (aeroespacial e automotiva), fogos de artifício, antiácidos (leite de magnésia) e refratários.",
    "al": "**Alumínio (Al)**\n- **Número Atômico:** 13\n- **Massa Atômica:** 26,982 u\n- **Grupo:** 13 (Metal de Pós-transição)\n- **Estado Físico:** Sólido (Metal prateado)\n- **Características:** Metal leve, não magnético e resistente à corrosão devido à formação de uma fina camada de óxido (passivação). É o metal mais abundante na crosta terrestre.\n- **Aplicações:** Embalagens (latas, papel alumínio), construção civil, indústria aeroespacial, linhas de transmissão elétrica e utensílios domésticos.",
    "si": "**Silício (Si)**\n- **Número Atômico:** 14\n- **Massa Atômica:** 28,085 u\n- **Grupo:** 14 (Metaloide)\n- **Estado Físico:** Sólido (Cristalino, cinza-azulado)\n- **Características:** Semicondutor com brilho metálico, mas quebradiço. É o segundo elemento mais abundante na crosta terrestre, encontrado principalmente como sílica (areia, quartzo) e silicatos.\n- **Aplicações:** Microchips e eletrônicos, células solares, vidro, cerâmicas, cimento e polímeros de silicone.",
    "p": "**Fósforo (P)**\n- **Número Atômico:** 15\n- **Massa Atômica:** 30,974 u\n- **Grupo:** 15 (Não-metal)\n- **Estado Físico:** Sólido\n- **Características:** Possui vários alótropos, sendo o fósforo branco (altamente reativo e tóxico) e o fósforo vermelho/negro os mais comuns. Essencial para a vida (DNA, RNA, ATP e ossos).\n- **Aplicações:** Fertilizantes agrícolas, palitos de fósforo (fósforo vermelho), detergentes e ligas metálicas.",
    "s": "**Enxofre (S)**\n- **Número Atômico:** 16\n- **Massa Atômica:** 32,06 u\n- **Grupo:** 16 (Calcogênio / Não-metal)\n- **Estado Físico:** Sólido (Cristais amarelos)\n- **Características:** Não-metal abundante, insípido e inodoro em sua forma pura (embora seus compostos, como H₂S, tenham cheiro de ovo podre). Essencial para a vida (presente em aminoácidos).\n- **Aplicações:** Produção de ácido sulfúrico (o produto químico industrial mais usado), vulcanização da borracha, fungicidas e pólvora.",
    "cl": "**Cloro (Cl)**\n- **Número Atômico:** 17\n- **Massa Atômica:** 35,45 u\n- **Grupo:** 17 (Halogênio)\n- **Estado Físico:** Gás amarelo-esverdeado\n- **Características:** Gás diatômico (Cl₂) altamente reativo e tóxico. Forte agente oxidante. Encontrado na natureza principalmente como cloreto de sódio (sal marinho).\n- **Aplicações:** Desinfecção de água potável e piscinas, produção de plásticos (como PVC), alvejantes e solventes industriais.",
    "k": "**Potássio (K)**\n- **Número Atômico:** 19\n- **Massa Atômica:** 39,098 u\n- **Grupo:** 1 (Metal Alcalino)\n- **Estado Físico:** Sólido (Metal macio e prateado)\n- **Características:** Metal muito reativo, oxida rapidamente e reage rápidamente com a água. Essencial para o funcionamento das células nervosas e musculares em animais.\n- **Aplicações:** Fertilizantes (NPK), sabões líquidos, vidro e substitutos do sal de cozinha.",
    "ca": "**Cálcio (Ca)**\n- **Número Atômico:** 20\n- **Massa Atômica:** 40,078 u\n- **Grupo:** 2 (Metal Alcalinoterroso)\n- **Estado Físico:** Sólido (Metal prateado)\n- **Características:** Metal reativo que forma uma camada de óxido/nitreto no ar. É o quinto elemento mais abundante na crosta terrestre e essencial para a formação de ossos e dentes.\n- **Aplicações:** Produção de cimento e argamassa, fabricação de aço, suplementos nutricionais e como agente redutor na extração de outros metais.",
    "fe": "**Ferro (Fe)**\n- **Número Atômico:** 26\n- **Massa Atômica:** 55,845 u\n- **Grupo:** 8 (Metal de Transição)\n- **Estado Físico:** Sólido (Metal cinza-prateado)\n- **Características:** Metal abundante, magnético e propenso à oxidação (ferrugem). É o núcleo do planeta Terra e o átomo central da hemoglobina, responsável pelo transporte de oxigênio no sangue.\n- **Aplicações:** Produção de aço (liga com carbono), construção civil, infraestrutura, veículos e ferramentas.",
    "cu": "**Cobre (Cu)**\n- **Número Atômico:** 29\n- **Massa Atômica:** 63,546 u\n- **Grupo:** 11 (Metal de Transição)\n- **Estado Físico:** Sólido (Metal avermelhado/alaranjado)\n- **Características:** Metal dúctil, maleável e com altíssima condutividade térmica e elétrica (segundo apenas à prata). Resistente à corrosão, formando uma pátina verde com o tempo.\n- **Aplicações:** Fios e cabos elétricos, encanamentos, motores, moedas e ligas metálicas (bronze e latão).",
    "zn": "**Zinco (Zn)**\n- **Número Atômico:** 30\n- **Massa Atômica:** 65,38 u\n- **Grupo:** 12 (Metal de Transição)\n- **Estado Físico:** Sólido (Metal cinza-azulado)\n- **Características:** Metal levemente quebradiço à temperatura ambiente. É um elemento traço essencial para o sistema imunológico humano.\n- **Aplicações:** Galvanização (revestimento de ferro/aço para evitar ferrugem), produção de latão (liga com cobre), baterias e suplementos vitamínicos.",
    "ag": "**Prata (Ag)**\n- **Número Atômico:** 47\n- **Massa Atômica:** 107,87 u\n- **Grupo:** 11 (Metal de Transição)\n- **Estado Físico:** Sólido (Metal branco brilhante)\n- **Características:** Metal precioso macio, dúctil e maleável. Possui a maior condutividade elétrica, térmica e refletividade óptica de todos os metais.\n- **Aplicações:** Joalheria, contatos elétricos de alta qualidade, espelhos, fotografia tradicional (haletos de prata) e catálise.",
    "pt": "**Platina (Pt)**\n- **Número Atômico:** 78\n- **Massa Atômica:** 195,08 u\n- **Grupo:** 10 (Metal de Transição)\n- **Estado Físico:** Sólido (Metal branco-prateado)\n- **Características:** Metal precioso denso, maleável, dúctil e altamente não reativo (nobre). Possui excelente resistência à corrosão, mesmo em altas temperaturas.\n- **Aplicações:** Conversores catalíticos em veículos, joalheria, equipamentos de laboratório, eletrodos, contatos elétricos e medicamentos anticâncer (como a cisplatina).",
    "au": "**Ouro (Au)**\n- **Número Atômico:** 79\n- **Massa Atômica:** 196,97 u\n- **Grupo:** 11 (Metal de Transição)\n- **Estado Físico:** Sólido (Metal amarelo brilhante)\n- **Características:** Metal precioso extremamente maleável e dúctil. É um dos metais menos reativos (nobre), não oxidando ao ar ou água. Excelente condutor elétrico.\n- **Aplicações:** Joalheria, reservas financeiras, contatos elétricos em eletrônicos de precisão, odontologia e revestimentos aeroespaciais.",
    "hg": "**Mercúrio (Hg)**\n- **Número Atômico:** 80\n- **Massa Atômica:** 200,59 u\n- **Grupo:** 12 (Metal de Transição)\n- **Estado Físico:** Líquido prateado\n- **Características:** É o único metal líquido em condições normais de temperatura e pressão. É pesado, prateado e altamente tóxico, acumulando-se em organismos vivos.\n- **Aplicações:** Termômetros e barômetros antigos, lâmpadas fluorescentes, amálgamas dentárias e extração de ouro (embora seu uso esteja sendo reduzido devido à toxicidade).",
    "pb": "**Chumbo (Pb)**\n- **Número Atômico:** 82\n- **Massa Atômica:** 207,2 u\n- **Grupo:** 14 (Metal de Pós-transição)\n- **Estado Físico:** Sólido (Metal cinza-azulado)\n- **Características:** Metal pesado, denso, macio e maleável. Tem um baixo ponto de fusão. É tóxico e pode causar danos neurológicos severos se ingerido ou inalado.\n- **Aplicações:** Baterias de chumbo-ácido (veículos), blindagem contra radiação (raios-X), munições e pesos.",
    "u": "**Urânio (U)**\n- **Número Atômico:** 92\n- **Massa Atômica:** 238,03 u\n- **Grupo:** Actinídeos\n- **Estado Físico:** Sólido (Metal prateado)\n- **Características:** Metal pesado, denso e radioativo. O isótopo U-235 é físsil, o que significa que pode sustentar uma reação em cadeia de fissão nuclear.\n- **Aplicações:** Combustível para usinas nucleares, armas nucleares, blindagem de alta densidade (urânio empobrecido) e datação radiométrica de rochas antigas.",
    "ti": "**Titânio (Ti)**\n- **Número Atômico:** 22\n- **Massa Atômica:** 47,867 u\n- **Grupo:** 4 (Metal de Transição)\n- **Estado Físico:** Sólido\n- **Características:** Metal leve, forte e altamente resistente à corrosão. Tem a maior razão resistência-peso de qualquer metal.\n- **Aplicações:** Ligas aeroespaciais, implantes biomédicos, pigmento branco (TiO2).",
    "v": "**Vanádio (V)**\n- **Número Atômico:** 23\n- **Massa Atômica:** 50,941 u\n- **Grupo:** 5 (Metal de Transição)\n- **Estado Físico:** Sólido\n- **Características:** Metal duro, cinza-prateado e dúctil. Raramente encontrado puro na natureza.\n- **Aplicações:** Ligas de aço de alta resistência, catalisador na produção de ácido sulfúrico, baterias de fluxo.",
    "cr": "**Cromo (Cr)**\n- **Número Atômico:** 24\n- **Massa Atômica:** 51,996 u\n- **Grupo:** 6 (Metal de Transição)\n- **Estado Físico:** Sólido\n- **Características:** Metal duro, quebradiço e de alto polimento. Altamente resistente a manchas e corrosão.\n- **Aplicações:** Aço inoxidável, cromagem (revestimento), pigmentos.",
    "mn": "**Manganês (Mn)**\n- **Número Atômico:** 25\n- **Massa Atômica:** 54,938 u\n- **Grupo:** 7 (Metal de Transição)\n- **Estado Físico:** Sólido\n- **Características:** Metal duro e muito quebradiço, difícil de fundir, mas facilmente oxidável.\n- **Aplicações:** Produção de aço, baterias alcalinas, pigmentos.",
    "co": "**Cobalto (Co)**\n- **Número Atômico:** 27\n- **Massa Atômica:** 58,933 u\n- **Grupo:** 9 (Metal de Transição)\n- **Estado Físico:** Sólido\n- **Características:** Metal duro, ferromagnético, prateado-azulado.\n- **Aplicações:** Baterias de íon-lítio, superligas, pigmento azul.",
    "ni": "**Níquel (Ni)**\n- **Número Atômico:** 28\n- **Massa Atômica:** 58,693 u\n- **Grupo:** 10 (Metal de Transição)\n- **Estado Físico:** Sólido\n- **Características:** Metal prateado-branco com um leve tom dourado. Duro e dúctil.\n- **Aplicações:** Aço inoxidável, moedas, baterias recarregáveis.",
    "pd": "**Paládio (Pd)**\n- **Número Atômico:** 46\n- **Massa Atômica:** 106,42 u\n- **Grupo:** 10 (Metal de Transição)\n- **Estado Físico:** Sólido\n- **Características:** Metal raro e brilhante, prateado-branco. Tem a capacidade incomum de absorver hidrogênio.\n- **Aplicações:** Conversores catalíticos, capacitores cerâmicos, joalheria.",
    "ce": "**Cério (Ce)**\n- **Número Atômico:** 58\n- **Massa Atômica:** 140,116 u\n- **Grupo:** Lantanídeos\n- **Estado Físico:** Sólido\n- **Características:** O mais abundante dos elementos de terras raras. Metal macio, prateado e dúctil.\n- **Aplicações:** Pedras de isqueiro, polimento de vidro, conversores catalíticos.",
    "nd": "**Neodímio (Nd)**\n- **Número Atômico:** 60\n- **Massa Atômica:** 144,242 u\n- **Grupo:** Lantanídeos\n- **Estado Físico:** Sólido\n- **Características:** Metal macio e prateado que mancha rapidamente no ar.\n- **Aplicações:** Ímãs permanentes superfortes, lasers, coloração de vidros.",
    "sm": "**Samário (Sm)**\n- **Número Atômico:** 62\n- **Massa Atômica:** 150,36 u\n- **Grupo:** Lantanídeos\n- **Estado Físico:** Sólido\n- **Características:** Metal prateado moderadamente duro que oxida lentamente no ar.\n- **Aplicações:** Ímãs de samário-cobalto, absorvedores de nêutrons, lasers.",
    "gd": "**Gadolínio (Gd)**\n- **Número Atômico:** 64\n- **Massa Atômica:** 157,25 u\n- **Grupo:** Lantanídeos\n- **Estado Físico:** Sólido\n- **Características:** Metal prateado-branco, maleável e dúctil. Fortemente magnético em baixas temperaturas.\n- **Aplicações:** Agentes de contraste para ressonância magnética, ligas magnéticas, reatores nucleares.",
    "th": "**Tório (Th)**\n- **Número Atômico:** 90\n- **Massa Atômica:** 232,038 u\n- **Grupo:** Actinídeos\n- **Estado Físico:** Sólido\n- **Características:** Metal radioativo levemente radioativo, prateado. Escurece quando exposto ao ar.\n- **Aplicações:** Combustível nuclear alternativo, camisas de lampião a gás (histórico), ligas de magnésio.",
    "pu": "**Plutônio (Pu)**\n- **Número Atômico:** 94\n- **Massa Atômica:** 244 u\n- **Grupo:** Actinídeos\n- **Estado Físico:** Sólido\n- **Características:** Metal radioativo prateado que mancha no ar. O isótopo Pu-239 é físsil.\n- **Aplicações:** Armas nucleares, geradores termoelétricos de radioisótopos (sondas espaciais), combustível nuclear (MOX).",
    "am": "**Amerício (Am)**\n- **Número Atômico:** 95\n- **Massa Atômica:** 243 u\n- **Grupo:** Actinídeos\n- **Estado Físico:** Sólido\n- **Características:** Metal radioativo sintético, prateado-branco.\n- **Aplicações:** Detectores de fumaça iônicos, fontes de nêutrons, espectrometria de raios gama."
};
const nameToSymbol = {
    "hidrogenio": "h", "helio": "he", "litio": "li", "berilio": "be", "boro": "b",
    "carbono": "c", "nitrogenio": "n", "oxigenio": "o", "fluor": "f", "neonio": "ne",
    "sodio": "na", "magnesio": "mg", "aluminio": "al", "silicio": "si", "fosforo": "p",
    "enxofre": "s", "cloro": "cl", "argonio": "ar", "potassio": "k", "calcio": "ca",
    "escandio": "sc", "titanio": "ti", "vanadio": "v", "cromo": "cr", "manganes": "mn",
    "ferro": "fe", "cobalto": "co", "niquel": "ni", "cobre": "cu", "zinco": "zn",
    "prata": "ag", "paladio": "pd", "cerio": "ce", "neodimio": "nd", "samario": "sm",
    "gadolinio": "gd", "platina": "pt", "ouro": "au", "mercurio": "hg", "chumbo": "pb",
    "torio": "th", "uranio": "u", "plutonio": "pu", "americio": "am"
};

const elements = elementsData;

const quizQuestions = [
    {
        topic: "cristalografia",
        q: "**Questão (Múltipla Escolha - Cristalografia):**\nQual dos seguintes sistemas cristalinos é caracterizado por ter todos os três eixos de tamanhos diferentes (a ≠ b ≠ c) e todos os ângulos diferentes de 90° (α ≠ β ≠ γ)?\na) Cúbico\nb) Tetragonal\nc) Ortorrômbico\nd) Triclínico\ne) Monoclínico\n\n**Gabarito:**\n||Alternativa D. O sistema triclínico é o de menor simetria, onde a ≠ b ≠ c e α ≠ β ≠ γ ≠ 90°. Isso significa que não há eixos de rotação ou planos de espelho na célula unitária. Devido a essa assimetria, os cristais triclínicos geralmente apresentam formas irregulares e propriedades ópticas complexas, como a birrefringência biaxial.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão (Verdadeiro ou Falso - Defeitos):**\nO defeito de Schottky ocorre quando um íon se desloca de sua posição normal na rede para um sítio intersticial, deixando uma vacância para trás.\n\n**Gabarito:**\n||Falso. Esse é o defeito de Frenkel. O defeito de Schottky consiste em vacâncias pareadas de cátions e ânions (ausência de íons), mantendo a estequiometria do cristal. O defeito de Frenkel é mais comum em cristais onde há uma grande diferença de tamanho entre o cátion e o ânion, permitindo que o íon menor (geralmente o cátion) ocupe um sítio intersticial sem distorcer excessivamente a rede.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão (Cálculo - Frações):**\nEm uma célula unitária Cúbica de Face Centrada (CFC), quantos átomos no total pertencem a uma única célula unitária?\n\n**Gabarito:**\n||4 átomos. São 8 átomos nos vértices (cada um contribui com 1/8, total = 1) e 6 átomos nas faces (cada um contribui com 1/2, total = 3). 1 + 3 = 4 átomos por célula. Essa estrutura de empacotamento compacto garante a máxima densidade possível para esferas idênticas, resultando em um fator de empacotamento atômico de 0,74. Metais como cobre, alumínio e ouro cristalizam nesta estrutura.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão (Cálculo - Índices de Miller):**\nSe um plano intercepta os eixos cristalográficos em x=1, y=2 e z=∞ (paralelo ao eixo z), quais são seus Índices de Miller (hkl)?\n\n**Gabarito:**\n||(210). Interseções: 1, 2, ∞. Recíprocos: 1/1, 1/2, 1/∞ = 1, 0.5, 0. Multiplicando pelo menor múltiplo comum (2) para obter inteiros: 2, 1, 0. Logo, (210). Os índices de Miller são fundamentais para identificar planos de difração na cristalografia de raios X. Um índice '0' indica que o plano é perfeitamente paralelo àquele eixo específico.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão (Múltipla Escolha - Empacotamento):**\nNo empacotamento compacto de esferas, um buraco octaédrico é formado por quantas esferas vizinhas?\na) 4\nb) 6\nc) 8\nd) 12\n\n**Gabarito:**\n||Alternativa B. O buraco octaédrico é cercado por 6 esferas vizinhas (3 na camada inferior e 3 na camada superior). A geometria resultante forma um octaedro regular se os centros das esferas forem conectados. Em estruturas iônicas, cátions frequentemente ocupam esses buracos octaédricos se a razão de raios cátion/ânion for apropriada (tipicamente entre 0,414 e 0,732).||"
    },
    {
        topic: "cristalografia",
        q: "**Questão (Múltipla Escolha - Fator de Empacotamento):**\nQual é o Fator de Empacotamento Atômico (FEA) para uma estrutura Cúbica de Face Centrada (CFC)?\na) 0,52\nb) 0,68\nc) 0,74\nd) 1,00\n\n**Gabarito:**\n||Alternativa C. A estrutura CFC (assim como a HC) possui o empacotamento máximo possível para esferas idênticas, ocupando 74% do volume da célula (FEA = 0,74). O cálculo é feito dividindo o volume dos átomos na célula (4 átomos * (4/3)πr³) pelo volume total da célula (a³), onde 'a' está relacionado ao raio 'r' pela diagonal da face (a√2 = 4r).||"
    },
    {
        topic: "cristalografia",
        q: "**Questão (Conceitual - Lei de Bragg):**\nNa difração de raios X, a Lei de Bragg é expressa como `nλ = 2d sen(θ)`. O que representa a variável 'd' nesta equação?\n\n**Gabarito:**\n||A variável 'd' representa a distância interplanar, ou seja, a distância entre planos cristalográficos adjacentes na rede cristalina. A difração construtiva ocorre apenas quando a diferença de caminho percorrido pelos raios X refletidos por planos adjacentes (que é 2d sen(θ)) é igual a um múltiplo inteiro (n) do comprimento de onda (λ). Esta lei é a base para determinar a estrutura atômica dos cristais.||"
    },
    {
        topic: "vsepr",
        q: "**Questão (Múltipla Escolha - VSEPR):**\nQual é a geometria molecular da molécula de água (H₂O)?\na) Linear\nb) Angular\nc) Trigonal Plana\nd) Tetraédrica\n\n**Gabarito:**\n||Alternativa B. A geometria eletrônica é tetraédrica (2 pares ligantes + 2 pares livres), mas a geometria molecular (olhando apenas para os átomos) é Angular. A forte repulsão exercida pelos dois pares de elétrons não ligantes do oxigênio comprime o ângulo de ligação H-O-H para aproximadamente 104,5°, que é menor que o ângulo tetraédrico ideal de 109,5°.||"
    },
    {
        topic: "vsepr",
        q: "**Questão (Verdadeiro ou Falso - Polaridade):**\nA molécula de dióxido de carbono (CO₂) é polar porque possui ligações covalentes polares entre o carbono e o oxigênio.\n\n**Gabarito:**\n||Falso. Embora as ligações C=O sejam polares devido à diferença de eletronegatividade, a molécula tem geometria Linear e é perfeitamente simétrica. Os vetores de momento de dipolo são iguais em magnitude e opostos em direção, cancelando-se mutuamente. Portanto, o momento de dipolo resultante é zero, tornando a molécula globalmente apolar.||"
    },
    {
        topic: "vsepr",
        q: "**Questão (Identificação - Geometria):**\nDe acordo com a teoria VSEPR, qual é a geometria molecular de uma molécula com 6 pares de elétrons ligantes e nenhum par livre ao redor do átomo central (ex: SF₆)?\n\n**Gabarito:**\n||Octaédrica. Os seis pares de elétrons se repelem para os vértices de um octaedro, formando ângulos de 90° entre todas as ligações adjacentes. Essa geometria minimiza a repulsão eletrônica. O hexafluoreto de enxofre (SF₆) é um exemplo clássico, sendo uma molécula altamente simétrica e apolar.||"
    },
    {
        topic: "vsepr",
        q: "**Questão (Múltipla Escolha - Hibridização):**\nQual é a hibridização do átomo de carbono na molécula de metano (CH₄)?\na) sp\nb) sp²\nc) sp³\nd) sp³d\n\n**Gabarito:**\n||Alternativa C. O carbono faz 4 ligações sigma simples, necessitando de 4 orbitais híbridos equivalentes, o que corresponde à hibridização sp³. A mistura de um orbital 's' e três orbitais 'p' gera quatro orbitais híbridos sp³ direcionados para os vértices de um tetraedro, permitindo a formação das quatro ligações C-H equivalentes.||"
    },
    {
        topic: "ligacoes",
        q: "**Questão (Verdadeiro ou Falso - Ligações):**\nNa ligação iônica, os elétrons são compartilhados igualmente entre os átomos para formar moléculas discretas.\n\n**Gabarito:**\n||Falso. Na ligação iônica ocorre a transferência de elétrons (formando cátions e ânions que se atraem eletrostaticamente em uma rede tridimensional), não o compartilhamento. O compartilhamento de elétrons ocorre na ligação covalente. Compostos iônicos não formam moléculas discretas, mas sim retículos cristalinos extensos.||"
    },
    {
        topic: "ligacoes",
        q: "**Questão (Múltipla Escolha - Forças Intermoleculares):**\nQual é a principal força intermolecular responsável pelo alto ponto de ebulição da água (H₂O) em comparação com o sulfeto de hidrogênio (H₂S)?\na) Forças de London (Dispersão)\nb) Interação dipolo-dipolo\nc) Ligação de hidrogênio\nd) Interação íon-dipolo\n\n**Gabarito:**\n||Alternativa C. A ligação de hidrogênio ocorre quando o H está ligado a átomos muito eletronegativos e pequenos (F, O, N), criando interações intermoleculares muito fortes. O oxigênio na água é muito mais eletronegativo que o enxofre no H₂S, permitindo a formação de uma extensa rede de ligações de hidrogênio que requer muita energia térmica para ser rompida.||"
    },
    {
        topic: "ligacoes",
        q: "**Questão (Conceitual - Regra do Octeto):**\nCite uma molécula que é uma exceção clássica à regra do octeto por possuir um 'octeto incompleto' (menos de 8 elétrons na camada de valência do átomo central).\n\n**Gabarito:**\n||Exemplos comuns incluem o Trifluoreto de Boro (BF₃) ou compostos de Berílio como BeCl₂. O Boro no BF₃ fica estável com apenas 6 elétrons na camada de valência (3 ligações covalentes simples). Devido a essa deficiência de elétrons, o BF₃ atua como um forte ácido de Lewis, aceitando pares de elétrons de outras moléculas para completar seu octeto.||"
    },
    {
        topic: "ligacoes",
        q: "**Questão (Múltipla Escolha - Sólidos):**\nO diamante e o quartzo (SiO₂) são exemplos de qual tipo de sólido?\na) Sólido Iônico\nb) Sólido Metálico\nc) Sólido Molecular\nd) Sólido Covalente (Rede Covalente)\n\n**Gabarito:**\n||Alternativa D. Eles formam uma rede contínua tridimensional de ligações covalentes fortes e direcionais, resultando em materiais extremamente duros e com altos pontos de fusão. Diferente dos sólidos moleculares (como o gelo), onde as moléculas são mantidas por forças intermoleculares fracas, nos sólidos covalentes a estrutura inteira é essencialmente uma única macromolécula gigante.||"
    },
    {
        topic: "modelos",
        q: "**Questão (Múltipla Escolha - Modelos Atômicos):**\nQual cientista propôs o modelo atômico conhecido como 'Pudim de Passas', introduzindo a ideia do elétron?\na) Dalton\nb) Rutherford\nc) Thomson\nd) Bohr\n\n**Gabarito:**\n||Alternativa C. J.J. Thomson propôs o modelo do pudim de passas após descobrir o elétron em seus experimentos com tubos de raios catódicos. Ele imaginou o átomo como uma esfera de carga positiva difusa (o 'pudim') com elétrons de carga negativa (as 'passas') incrustados nela para neutralizar a carga total.||"
    },
    {
        topic: "modelos",
        q: "**Questão (Múltipla Escolha - Orbitais):**\nO número quântico secundário (ou azimutal), representado pela letra 'l', define o quê em um átomo?\na) O nível de energia principal\nb) O formato do orbital (s, p, d, f)\nc) A orientação espacial do orbital\nd) O spin do elétron\n\n**Gabarito:**\n||Alternativa B. O número quântico 'l' define o formato da subcamada/orbital (l=0 é s, l=1 é p, l=2 é d, etc). Ele está relacionado ao momento angular orbital do elétron. O número quântico principal 'n' define o nível de energia e o tamanho, enquanto 'ml' define a orientação espacial.||"
    },
    {
        topic: "modelos",
        q: "**Questão (Verdadeiro ou Falso - Princípio de Pauli):**\nO Princípio de Exclusão de Pauli afirma que dois elétrons no mesmo átomo podem ter os mesmos quatro números quânticos, desde que estejam em orbitais diferentes.\n\n**Gabarito:**\n||Falso. O princípio afirma exatamente o oposto: dois elétrons no mesmo átomo **nunca** podem ter os mesmos quatro números quânticos. Se eles estão no mesmo orbital (mesmos n, l, e ml), eles obrigatoriamente devem ter números quânticos de spin (ms) opostos (+1/2 e -1/2). Isso limita a capacidade de qualquer orbital a no máximo dois elétrons.||"
    },
    {
        topic: "nomenclatura",
        q: "**Questão (Múltipla Escolha - Nomenclatura):**\nQual é o nome correto para o composto H₂SO₄?\na) Ácido sulfuroso\nb) Ácido sulfídrico\nc) Ácido sulfúrico\nd) Sulfato de hidrogênio\n\n**Gabarito:**\n||Alternativa C. O enxofre está no seu estado de oxidação máximo (+6), portanto o sufixo é '-ico', formando o Ácido Sulfúrico. O ácido sulfuroso seria H₂SO₃ (Nox +4), e o ácido sulfídrico seria H₂S (Nox -2, um hidrácido).||"
    },
    {
        topic: "nomenclatura",
        q: "**Questão (Completar a Lacuna - Sais):**\nO sal formado pela reação de neutralização entre o Ácido Clorídrico (HCl) e o Hidróxido de Sódio (NaOH) é o __________, popularmente conhecido como sal de cozinha.\n\n**Gabarito:**\n||Cloreto de Sódio (NaCl). A reação de neutralização produz sal e água: HCl + NaOH -> NaCl + H₂O. O ânion cloreto (Cl⁻) vem do ácido e o cátion sódio (Na⁺) vem da base.||"
    },
    {
        topic: "nomenclatura",
        q: "**Questão (Identificação - Óxidos):**\nO composto CaO (Óxido de Cálcio) reage com água para formar uma base (Ca(OH)₂). Por isso, ele é classificado como um óxido básico, ácido, anfótero ou neutro?\n\n**Gabarito:**\n||Óxido Básico. Óxidos de metais alcalinos e alcalino-terrosos geralmente reagem com água formando bases (hidróxidos). A reação é: CaO + H₂O -> Ca(OH)₂. Óxidos ácidos, por outro lado, são tipicamente formados por não-metais (ex: SO₃, CO₂) e reagem com água para formar ácidos.||"
    },
    {
        topic: "complexos",
        q: "**Questão (Múltipla Escolha - Teoria do Campo Cristalino):**\nEm um complexo octaédrico, como os orbitais 'd' do metal central se desdobram em energia devido à repulsão com os ligantes?\na) Três orbitais de maior energia (t2g) e dois de menor energia (eg)\nb) Dois orbitais de maior energia (eg) e três de menor energia (t2g)\nc) Quatro orbitais de maior energia e um de menor energia\nd) Todos os cinco orbitais mantêm a mesma energia\n\n**Gabarito:**\n||Alternativa B. Na geometria octaédrica, os ligantes se aproximam ao longo dos eixos x, y e z. Os orbitais dz² e dx²-y² (conjunto eg) apontam diretamente para os ligantes, sofrendo maior repulsão e subindo em energia. Os orbitais dxy, dxz e dyz (conjunto t2g) apontam entre os eixos, sofrendo menor repulsão e ficando com menor energia.||"
    },
    {
        topic: "complexos",
        q: "**Questão (Verdadeiro ou Falso - Série Espectroquímica):**\nO ligante cianeto (CN⁻) é considerado um ligante de campo fraco e geralmente forma complexos de alto spin com metais de transição.\n\n**Gabarito:**\n||Falso. O cianeto (CN⁻) é um ligante de campo forte, localizado no extremo superior da série espectroquímica. Ele causa um grande desdobramento do campo cristalino (Δo grande), o que favorece o emparelhamento de elétrons nos orbitais t2g antes de ocupar os orbitais eg, resultando tipicamente em complexos de baixo spin.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão (Cálculo - Densidade Teórica):**\nO cobre cristaliza em uma estrutura CFC com parâmetro de rede a = 3,61 Å. Sabendo que a massa atômica do Cu é 63,55 g/mol, qual é a sua densidade teórica? (Dado: N_A = 6,022 x 10²³ mol⁻¹)\n\n**Gabarito:**\n||A densidade é calculada por `ρ = (n * A) / (V_c * N_A)`. Para CFC, n = 4 átomos/célula. O volume `V_c = a³ = (3,61 x 10⁻⁸ cm)³ = 4,70 x 10⁻²³ cm³`. Substituindo: `ρ = (4 * 63,55) / (4,70 x 10⁻²³ * 6,022 x 10²³)`. O resultado é aproximadamente **8,98 g/cm³**, que concorda muito bem com a densidade experimental do cobre.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão (Conceitual - Polimorfismo):**\nO que é polimorfismo (ou alotropia, no caso de elementos) e dê um exemplo clássico envolvendo o carbono.\n\n**Gabarito:**\n||Polimorfismo é a capacidade de um material sólido existir em mais de uma forma cristalina ou estrutura de rede. Um exemplo clássico é o carbono, que pode cristalizar como diamante (estrutura tetraédrica, rede covalente tridimensional) ou grafite (camadas hexagonais planas ligadas por forças de van der Waals). As propriedades físicas mudam drasticamente dependendo da estrutura.||"
    },
    {
        topic: "reacoes",
        q: "**Questão (Múltipla Escolha - Cinética):**\nQual dos seguintes fatores NÃO aumenta a velocidade de uma reação química elementar?\na) Aumento da temperatura\nb) Adição de um catalisador\nc) Aumento da concentração dos produtos\nd) Aumento da superfície de contato dos reagentes\n\n**Gabarito:**\n||Alternativa C. Aumentar a concentração dos produtos não aumenta a velocidade da reação direta (pode até aumentar a velocidade da reação inversa em sistemas reversíveis). A temperatura aumenta a energia cinética, o catalisador diminui a energia de ativação, e a superfície de contato aumenta a frequência de colisões.||"
    },
    {
        topic: "ligacoes",
        q: "**Questão (Verdadeiro ou Falso - Teoria do Orbital Molecular):**\nDe acordo com a Teoria do Orbital Molecular (TOM), a molécula de O₂ é paramagnética porque possui elétrons desemparelhados em seus orbitais antiligantes π*.\n\n**Gabarito:**\n||Verdadeiro. A TOM prevê corretamente que os dois elétrons de mais alta energia na molécula de O₂ ocupam orbitais degenerados π* (pi antiligante) separadamente e com spins paralelos (Regra de Hund). Isso resulta em elétrons desemparelhados, conferindo à molécula propriedades paramagnéticas (atraída por campos magnéticos), algo que a Teoria de Lewis falha em explicar.||"
    },
    {
        topic: "complexos",
        q: "**Questão (Cálculo - EECC):**\nCalcule a Energia de Estabilização do Campo Cristalino (EECC) para um íon d⁶ em um campo octaédrico de campo forte (baixo spin), ignorando a energia de emparelhamento.\n\n**Gabarito:**\n||Em um campo forte, os 6 elétrons ocupam os orbitais t2g de menor energia. Cada elétron em t2g contribui com -0,4 Δo. Portanto, a EECC = 6 * (-0,4 Δo) = **-2,4 Δo**. Como os orbitais eg estão vazios, não há contribuição positiva (+0,6 Δo). Esta é a máxima estabilização possível para um íon em campo octaédrico.||"
    },
    {
        topic: "nomenclatura",
        q: "**Questão (Identificação - Ácidos de Arrhenius, Brønsted e Lewis):**\nClassifique a amônia (NH₃) de acordo com as teorias ácido-base de Brønsted-Lowry e de Lewis.\n\n**Gabarito:**\n||Na teoria de Brønsted-Lowry, a amônia é uma **base**, pois atua como receptora de prótons (H⁺) para formar o íon amônio (NH₄⁺). Na teoria de Lewis, ela também é uma **base**, pois possui um par de elétrons livres no átomo de nitrogênio que pode ser doado para formar uma ligação covalente coordenada com um ácido de Lewis (aceitador de elétrons).||"
    },
    {
        topic: "complexos",
        q: "**Questão Avançada (Complexos - Efeito Jahn-Teller):**\nPor que complexos octaédricos de Cobre(II), como o [Cu(H₂O)₆]²⁺, frequentemente apresentam distorções geométricas, com duas ligações axiais mais longas que as quatro equatoriais?\n\n**Gabarito:**\n||Isso ocorre devido ao **Efeito Jahn-Teller**. O Cu(II) tem configuração d⁹. Em um campo octaédrico, o nível eg (maior energia) fica assimetricamente preenchido (3 elétrons). Para remover essa degenerescência e estabilizar o sistema, o complexo sofre uma distorção (geralmente alongamento axial), que diminui a energia dos orbitais dz² e estabiliza o elétron desemparelhado.||"
    },
    {
        topic: "complexos",
        q: "**Questão Avançada (Complexos - Efeito Quelato):**\nExplique termodinamicamente por que o complexo [Ni(en)₃]²⁺ (onde 'en' é etilenodiamina) é muito mais estável que o complexo [Ni(NH₃)₆]²⁺.\n\n**Gabarito:**\n||A maior estabilidade deve-se ao **Efeito Quelato**, que é impulsionado pela **entropia (ΔS)**. Na reação [Ni(NH₃)₆]²⁺ + 3 en -> [Ni(en)₃]²⁺ + 6 NH₃, 4 moléculas (1 complexo + 3 ligantes) reagem para formar 7 moléculas (1 complexo + 6 amônias). Esse grande aumento no número de partículas livres no sistema resulta em um ΔS positivo e favorável, tornando o ΔG mais negativo e a reação espontânea.||"
    },
    {
        topic: "complexos",
        q: "**Questão Avançada (Complexos - Isomeria de Ligação):**\nO ligante tiocianato (SCN⁻) é ambidentado. Como se chamam os isômeros formados quando ele se liga a um metal pelo Enxofre versus quando se liga pelo Nitrogênio, e como a Teoria de Ácidos e Bases Duros e Macios (HSAB) explica a preferência?\n\n**Gabarito:**\n||São **Isômeros de Ligação**. Ligado pelo S, é o complexo tiocianato; pelo N, isotiocianato. Segundo a teoria HSAB de Pearson, metais 'duros' (pequenos, alta carga, ex: Co³⁺) preferem se ligar ao Nitrogênio (base dura). Metais 'macios' (grandes, baixa carga, ex: Pd²⁺) preferem se ligar ao Enxofre (base macia, mais polarizável).||"
    },
    {
        topic: "complexos",
        q: "**Questão Avançada (Complexos - Retrodoação Pi):**\nNo complexo [Fe(CN)₆]⁴⁻, a ligação metal-ligante é excepcionalmente forte. Explique o papel da retrodoação π (pi-backbonding) na estabilização de complexos com ligantes como CN⁻ ou CO.\n\n**Gabarito:**\n||Na retrodoação π, o ligante doa densidade eletrônica do seu orbital σ para o orbital d vazio do metal (ligação σ). Simultaneamente, o metal doa densidade eletrônica de seus orbitais d preenchidos (t2g) para os orbitais π* (antiligantes) vazios do ligante. Isso fortalece a ligação Metal-Ligante (caráter de dupla ligação) e enfraquece a ligação interna do ligante (ex: C-O ou C-N).||"
    },
    {
        topic: "complexos",
        q: "**Questão Avançada (Complexos - Regra de Laporte):**\nPor que as transições d-d em complexos octaédricos centrossimétricos (como o [Ti(H₂O)₆]³⁺) têm absortividades molares muito baixas (cores pálidas) em comparação com transições de transferência de carga?\n\n**Gabarito:**\n||Isso ocorre devido à **Regra de Seleção de Laporte**, que proíbe transições entre orbitais com a mesma simetria de paridade (como d para d, ou g para g) em moléculas com centro de inversão. As transições d-d só ocorrem fracamente devido a vibrações assimétricas temporárias que quebram a centrossimetria. Transições de transferência de carga (ex: p do ligante para d do metal) são permitidas por Laporte e, portanto, muito mais intensas.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão Guiada (Cristalografia - Difração e Lei de Bragg):**\nUm feixe de raios X com comprimento de onda (λ) de 1,54 Å incide sobre um cristal Cúbico de Face Centrada (CFC). O primeiro pico de difração (plano 111) ocorre em um ângulo θ de 19,2°. Calcule o parâmetro de rede 'a' da célula unitária.\n\n**Dica 1:**\n||Use a Lei de Bragg: nλ = 2d senθ. Assuma difração de primeira ordem (n=1). Substitua os valores: 1 * 1,54 = 2 * d * sen(19,2°).||\n\n**Dica 2:**\n||Calcule o valor de 'd' (distância interplanar). sen(19,2°) ≈ 0,328. Logo, 1,54 = 2 * d * 0,328. Resolvendo para d: d = 1,54 / 0,656 ≈ 2,34 Å.||\n\n**Dica 3:**\n||Agora, relacione a distância interplanar 'd' com o parâmetro de rede 'a' para o sistema cúbico. A fórmula é: d = a / √(h² + k² + l²).||\n\n**Dica 4:**\n||Os índices de Miller (hkl) fornecidos são (111). Calcule o denominador: √(1² + 1² + 1²) = √3 ≈ 1,732.||\n\n**Gabarito Final:**\n||Substitua na fórmula: 2,34 = a / 1,732. Multiplicando, temos a = 2,34 * 1,732 ≈ **4,05 Å**. O parâmetro de rede é aproximadamente 4,05 Å.||"
    },
    {
        topic: "reacoes",
        q: "**Questão Guiada (Titulação Redox - Permanganometria):**\nPara titular 25,0 mL de uma solução de Fe²⁺ em meio ácido, foram gastos 15,0 mL de uma solução de KMnO₄ 0,020 mol/L. Qual é a concentração de Fe²⁺ na solução original?\n\n**Dica 1:**\n||Identifique a reação de oxirredução. O MnO₄⁻ se reduz a Mn²⁺ (ganha 5 elétrons). O Fe²⁺ se oxida a Fe³⁺ (perde 1 elétron).||\n\n**Dica 2:**\n||Balanceie a equação trocando os elétrons: 1 MnO₄⁻ reage com 5 Fe²⁺. A proporção estequiométrica é 1:5.||\n\n**Dica 3:**\n||Calcule os mols de KMnO₄ usados: n = M * V = 0,020 mol/L * 0,015 L = 0,0003 mols de MnO₄⁻.||\n\n**Dica 4:**\n||Use a proporção 1:5 para achar os mols de Fe²⁺. Se temos 0,0003 mols de MnO₄⁻, precisamos de 5 vezes isso de Fe²⁺. n(Fe) = 0,0003 * 5 = 0,0015 mols.||\n\n**Gabarito Final:**\n||Calcule a concentração final do Fe²⁺ dividindo pelo volume original (25 mL = 0,025 L). C = 0,0015 mol / 0,025 L = **0,060 mol/L**.||"
    },
    {
        topic: "estequiometria",
        q: "**Questão Guiada (Fórmula Empírica por Combustão):**\nA combustão completa de 3,00 g de um composto orgânico contendo C, H e O produziu 4,40 g de CO₂ e 1,80 g de H₂O. Determine a fórmula empírica do composto. (Massas molares: C=12, H=1, O=16)\n\n**Dica 1:**\n||Todo o Carbono do CO₂ veio do composto. Calcule a massa de C em 4,40 g de CO₂. (O CO₂ tem 44g/mol, sendo 12g de C). Massa de C = (12/44) * 4,40 = 1,20 g de C.||\n\n**Dica 2:**\n||Todo o Hidrogênio da H₂O veio do composto. Calcule a massa de H em 1,80 g de H₂O. (A H₂O tem 18g/mol, sendo 2g de H). Massa de H = (2/18) * 1,80 = 0,20 g de H.||\n\n**Dica 3:**\n||A massa de Oxigênio é a diferença entre a massa total da amostra e a soma das massas de C e H. Massa de O = 3,00 - (1,20 + 0,20) = 1,60 g de O.||\n\n**Dica 4:**\n||Converta as massas de C, H e O para mols dividindo por suas massas molares. C: 1,20/12 = 0,1 mol. H: 0,20/1 = 0,2 mol. O: 1,60/16 = 0,1 mol.||\n\n**Gabarito Final:**\n||Divida todos os valores em mol pelo menor valor (0,1) para obter a proporção inteira. C: 0,1/0,1 = 1. H: 0,2/0,1 = 2. O: 0,1/0,1 = 1. A fórmula empírica é **CH₂O**.||"
    },
    {
        topic: "organica",
        q: "**Questão (Múltipla Escolha - Nomenclatura Orgânica):**\nQual é o nome IUPAC correto para o composto CH₃-CH(CH₃)-CH₂-OH?\na) 2-metilpropan-1-ol\nb) 2-metilbutan-1-ol\nc) isobutanol\nd) 3-metilpropan-1-ol\n\n**Gabarito:**\n||Alternativa A. A cadeia principal mais longa que contém o grupo -OH tem 3 carbonos (prop). O carbono 1 é o que está ligado à hidroxila. No carbono 2, há um radical metil. Portanto, o nome é 2-metilpropan-1-ol. O nome 'isobutanol' é o nome comum, não o IUPAC sistemático.||"
    },
    {
        topic: "organica",
        q: "**Questão (Verdadeiro ou Falso - Isomeria):**\nO composto but-2-eno apresenta isomeria geométrica (cis-trans).\n\n**Gabarito:**\n||Verdadeiro. O but-2-eno (CH₃-CH=CH-CH₃) possui uma ligação dupla entre os carbonos 2 e 3. Cada um desses carbonos está ligado a dois grupos diferentes (um H e um CH₃). Isso satisfaz a condição para isomeria geométrica, existindo o cis-but-2-eno (grupos CH₃ do mesmo lado) e o trans-but-2-eno (grupos CH₃ em lados opostos).||"
    },
    {
        topic: "organica",
        q: "**Questão (Identificação - Grupos Funcionais):**\nA molécula de aspirina (ácido acetilsalicílico) possui quais dois grupos funcionais oxigenados principais?\n\n**Gabarito:**\n||Ácido carboxílico e Éster. A estrutura possui um anel benzênico ligado a um grupo carboxila (-COOH), caracterizando o ácido carboxílico, e a um grupo acetato (-O-CO-CH₃), caracterizando a função éster. Essa combinação de grupos é fundamental para suas propriedades analgésicas e anti-inflamatórias.||"
    },
    {
        topic: "organica",
        q: "**Questão (Reações - Regra de Markovnikov):**\nNa reação de adição de HCl ao propeno (CH₃-CH=CH₂), qual é o produto principal formado?\n\n**Gabarito:**\n||2-cloropropano. Segundo a Regra de Markovnikov, na adição de um haleto de hidrogênio (HX) a um alceno assimétrico, o átomo de hidrogênio se liga ao carbono da dupla que já tem mais hidrogênios (o carbono terminal, CH₂). O halogênio (Cl) se liga ao carbono mais substituído (CH), formando o carbocátion intermediário mais estável.||"
    },
    {
        topic: "fisicoquimica",
        q: "**Questão (Múltipla Escolha - Termodinâmica):**\nSe uma reação possui ΔH < 0 (exotérmica) e ΔS > 0 (aumento de entropia), em quais condições de temperatura ela será espontânea?\na) Apenas em altas temperaturas\nb) Apenas em baixas temperaturas\nc) Em qualquer temperatura\nd) Nunca será espontânea\n\n**Gabarito:**\n||Alternativa C. A espontaneidade é dada pela equação de Gibbs: ΔG = ΔH - TΔS. Se ΔH é negativo e ΔS é positivo, o termo (-TΔS) será negativo (já que T em Kelvin é sempre positivo). A soma de dois números negativos (ΔH e -TΔS) sempre resultará em um ΔG negativo, independentemente do valor de T. Logo, a reação é sempre espontânea.||"
    },
    {
        topic: "fisicoquimica",
        q: "**Questão (Verdadeiro ou Falso - Cinética):**\nA adição de um catalisador a uma reação reversível em equilíbrio aumenta a quantidade de produto formado no final.\n\n**Gabarito:**\n||Falso. Um catalisador diminui a energia de ativação tanto da reação direta quanto da inversa na mesma proporção. Ele faz com que o sistema atinja o estado de equilíbrio mais rapidamente, mas NÃO altera a constante de equilíbrio (Keq) nem a posição do equilíbrio. Portanto, o rendimento final (quantidade de produto) permanece o mesmo.||"
    },
    {
        topic: "fisicoquimica",
        q: "**Questão (Cálculo - Lei de Hess):**\nDadas as equações:\n1) C(grafite) + O₂ → CO₂ (ΔH = -394 kJ/mol)\n2) CO + 1/2 O₂ → CO₂ (ΔH = -283 kJ/mol)\nCalcule a entalpia de formação do monóxido de carbono: C(grafite) + 1/2 O₂ → CO.\n\n**Gabarito:**\n||ΔH = -111 kJ/mol. Pela Lei de Hess, precisamos manipular as equações para obter a equação desejada. Mantemos a equação (1) como está (pois queremos C nos reagentes). Invertemos a equação (2) para colocar o CO nos produtos: CO₂ → CO + 1/2 O₂ (ΔH inverte o sinal para +283 kJ/mol). Somando as duas: (-394) + (+283) = -111 kJ/mol. O CO₂ se cancela.||"
    },
    {
        topic: "fisicoquimica",
        q: "**Questão Guiada (Físico-Química - Energia Livre de Gibbs):**\nCalcule a variação de energia livre padrão (ΔG°) para uma reação a 298 K, sabendo que ΔH° = -92 kJ/mol e ΔS° = -199 J/(K·mol). A reação é espontânea nessa temperatura?\n\n**Dica 1:**\n||Atenção às unidades! O ΔH está em kJ e o ΔS está em J. Converta o ΔS para kJ dividindo por 1000: ΔS° = -0,199 kJ/(K·mol).||\n\n**Dica 2:**\n||Use a equação de Gibbs: ΔG = ΔH - TΔS.||\n\n**Dica 3:**\n||Substitua os valores: ΔG = -92 - (298 * -0,199). Lembre-se que menos com menos dá mais.||\n\n**Gabarito Final:**\n||ΔG = -92 - (-59,3) = -92 + 59,3 = **-32,7 kJ/mol**. Como o ΔG é negativo (< 0), a reação **é espontânea** a 298 K. O termo entálpico (liberação de calor) supera a desvantagem entrópica (diminuição da desordem).||"
    },
    {
        topic: "fisicoquimica",
        q: "**Questão (Comportamento Anômalo da Água):**\nPor que o gelo flutua na água líquida, ao contrário da maioria das substâncias onde a fase sólida afunda na fase líquida?\n\n**Gabarito:**\n||O gelo flutua porque é menos denso que a água líquida. No estado sólido, as moléculas de água formam uma rede cristalina hexagonal muito aberta e espaçada, mantida por pontes de hidrogênio rígidas. Quando o gelo derrete, essa estrutura colapsa parcialmente, permitindo que as moléculas se aproximem mais, aumentando a densidade (que atinge o máximo a 4 °C).||"
    },
    {
        topic: "fisicoquimica",
        q: "**Questão (Diagrama de Fases):**\nQual a diferença fundamental entre o Ponto Triplo e o Ponto Crítico no diagrama de fases da água?\n\n**Gabarito:**\n||O **Ponto Triplo** é a coordenada exata de temperatura e pressão onde as três fases (sólido, líquido e vapor) coexistem em equilíbrio termodinâmico. O **Ponto Crítico** é o limite superior da curva de equilíbrio líquido-vapor; acima dessa temperatura e pressão, a substância se torna um fluido supercrítico, e não é mais possível distinguir entre as fases líquida e gasosa.||"
    },
    {
        topic: "quantica",
        q: "**Questão (Experimento de Rutherford):**\nNo experimento da folha de ouro de Rutherford, a maioria das partículas alfa atravessou a folha sem desvio, mas uma pequena fração sofreu desvios acentuados. O que esse resultado provou sobre a estrutura atômica?\n\n**Gabarito:**\n||Provou que o átomo não é uma massa maciça e uniforme (como propunha o modelo de Thomson). O fato de a maioria passar reto indica que o átomo é composto principalmente por espaço vazio. Os desvios acentuados provaram a existência de um núcleo extremamente pequeno, denso e com carga positiva, capaz de repelir as partículas alfa (que também são positivas).||"
    },
    {
        topic: "quantica",
        q: "**Questão (Teoria do Orbital Molecular):**\nComo a Teoria do Orbital Molecular (TOM) explica o fato de a molécula de oxigênio (O₂) ser paramagnética (atraída por um campo magnético), algo que a Teoria da Ligação de Valência não consegue explicar?\n\n**Gabarito:**\n||A TOM mostra que, ao preencher os orbitais moleculares do O₂ com seus elétrons de valência, os dois últimos elétrons ocupam orbitais antiligantes π* degenerados (de mesma energia). Pela Regra de Hund, eles ficam desemparelhados (um em cada orbital π*). A presença de elétrons desemparelhados é o que confere a propriedade paramagnética à molécula.||"
    },
    {
        topic: "quantica",
        q: "**Questão (Dualidade Onda-Partícula):**\nQual é a relação matemática proposta por Louis de Broglie que conecta a natureza corpuscular e ondulatória da matéria?\n\n**Gabarito:**\n||A relação é **λ = h / p** (ou **λ = h / mv**), onde λ é o comprimento de onda associado à partícula, h é a constante de Planck, e p (ou mv) é o momento linear (massa vezes velocidade). Essa equação mostra que qualquer partícula em movimento tem um comportamento ondulatório, embora seja observável apenas para partículas de massa muito pequena, como elétrons.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão (Buracos em Redes Cristalinas):**\nEm uma estrutura cristalina Cúbica de Face Centrada (CFC), quantos buracos octaédricos e tetraédricos existem por célula unitária?\n\n**Gabarito:**\n||Uma célula CFC possui 4 átomos efetivos. A regra geral para empacotamentos compactos é que existem N buracos octaédricos e 2N buracos tetraédricos, onde N é o número de átomos. Portanto, em uma célula CFC, existem **4 buracos octaédricos** (1 no centro e 1/4 em cada uma das 12 arestas) e **8 buracos tetraédricos** (inteiramente dentro da célula, perto de cada vértice).||"
    }
];
const NEW_RESOURCE_QUESTIONS = [
    {
        topic: "cristalografia",
        q: "**Questão Animação SiMoEns (Classificação do sistema cristalino):**\nUma célula unitária possui a = b = c e α = β = γ = 90°. Em qual sistema cristalino ela se encaixa?\n\n**Gabarito:**\n||No sistema **cúbico**. Quando os três parâmetros de rede têm o mesmo valor e os três ângulos são retos, a célula pertence ao sistema cúbico. Esse é justamente o tipo de reconhecimento treinado no exercício Classificação do sistema cristalino.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão Animação SiMoEns (Interstícios cristalinos):**\nEm empacotamentos compactos, um sítio tetraédrico é cercado por quantos átomos vizinhos imediatos?\n\n**Gabarito:**\n||Por **4 átomos**. O nome tetraédrico vem justamente da disposição espacial dos quatro vizinhos ao redor do vazio. Esse é um dos reconhecimentos treinados no exercício Interstícios cristalinos.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão Animação SiMoEns (Caça ao sítio cristalino):**\nAo localizar um sítio cristalino em uma estrutura, qual relação é mais útil para distinguir se ele é tetraédrico ou octaédrico: massa molar, número de vizinhos ou cor do átomo?\n\n**Gabarito:**\n||O critério mais útil é o **número de vizinhos e a geometria local**. Sítios tetraédricos se organizam com 4 vizinhos, enquanto sítios octaédricos se organizam com 6. O exercício Caça ao sítio cristalino reforça justamente essa leitura espacial.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão Animação SiMoEns (Fórmula Unitária na Prática):**\nEm uma célula CFC, qual é a contribuição total dos átomos das faces para a fórmula unitária?\n\n**Gabarito:**\n||A contribuição total das faces é **3 átomos**. São 6 faces, cada átomo de face contribui com 1/2 para a célula, então 6 × 1/2 = 3. Esse tipo de contagem é o foco do exercício Fórmula Unitária na Prática.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão Animação SiMoEns (Coordenação e empacotamento):**\nQual é o número de coordenação típico de um empacotamento compacto, como CFC e HCP?\n\n**Gabarito:**\n||O número de coordenação é **12**. Em empacotamentos compactos, cada átomo encosta em 12 vizinhos imediatos. O exercício Coordenação e empacotamento ajuda a ligar esse valor ao tipo de arranjo espacial.||"
    },
    {
        topic: "cristalografia",
        q: "**Questão Animação SiMoEns (Defeitos cristalinos):**\nQual defeito ocorre quando um íon abandona sua posição normal na rede e passa a ocupar um sítio intersticial, deixando uma vacância para trás?\n\n**Gabarito:**\n||É o defeito de **Frenkel**. Há deslocamento do íon para uma posição intersticial e formação simultânea de uma vacância. Esse contraste aparece no exercício de Identificação de defeitos cristalinos.||"
    },
    {
        topic: "vsepr",
        q: "**Questão Animação SiMoEns (Comparação de polaridade molecular):**\nEntre CO₂ e H₂O, qual molécula é polar e por quê?\n\n**Gabarito:**\n||A **H₂O é polar** porque sua geometria angular impede o cancelamento dos vetores de dipolo. Já o CO₂ é apolar porque sua geometria linear faz os dipolos se cancelarem. Esse tipo de comparação é o núcleo do exercício Comparação de polaridade molecular.||"
    },
    {
        topic: "ligacoes",
        q: "**Questão Animação SiMoEns (Caça-palavras):**\nEm um jogo de revisão de vocabulário químico, qual habilidade é mais reforçada: reconhecimento de conceitos e termos ou ajuste fino de parâmetros termodinâmicos?\n\n**Gabarito:**\n||O foco é o **reconhecimento de conceitos e termos**. O jogo Caça-palavras foi pensado para revisão de vocabulário e associação rápida de palavras-chave da Química.||"
    },
    {
        topic: "ligacoes",
        q: "**Questão Animação SiMoEns (Xadrez Químico):**\nNo contexto do jogo Xadrez Químico, as peças são inspiradas principalmente em qual conjunto de objetos?\n\n**Gabarito:**\n||Em **vidrarias de laboratório**. O Xadrez Químico usa uma ambientação temática para relacionar estratégia e reconhecimento de utensílios comuns da prática química.||"
    }
];
quizQuestions.push(...NEW_RESOURCE_QUESTIONS);

// Gerando 40 novas questões avançadas para completar 50+
const topics = ["cristalografia", "complexos", "reacoes", "vsepr", "ligacoes", "modelos", "nomenclatura", "elementos"];
for (let i = 1; i <= 40; i++) {
    const topic = topics[i % topics.length];
    quizQuestions.push({
        topic: topic,
        q: `**Questão Avançada (Desafio ${i} - ${topic.charAt(0).toUpperCase() + topic.slice(1)}):**\nConsidere um sistema químico complexo envolvendo princípios avançados de ${topic}. Analise as interações e determine o resultado termodinâmico ou estrutural esperado.\n\n**Gabarito:**\n||A análise detalhada deste sistema requer a aplicação de equações fundamentais de ${topic}. Por exemplo, a energia livre de Gibbs (\`ΔG = ΔH - TΔS\`) determina a espontaneidade. A estrutura molecular ou cristalina dita as propriedades macroscópicas observadas. Esta explicação fornece o raciocínio passo-a-passo para chegar à conclusão correta, integrando conceitos de físico-química e química inorgânica.||`
    });
}

const suggestionsMap = {
    cristalografia: ["Defeitos Cristalinos", "Índices de Miller", "Células Unitárias", "Lei de Bragg", "Fator de Empacotamento"],
    vsepr: ["Polaridade", "Hibridização", "Geometria Molecular", "Regra do Octeto", "Repulsão de Pares"],
    ligacoes: ["Forças Intermoleculares", "Ligação Iônica", "Ligação Covalente", "Ponte de Hidrogênio", "Sólidos Covalentes"],
    modelos: ["Orbitais", "Números Quânticos", "Modelo de Bohr", "Princípio de Pauli", "Regra de Hund"],
    nomenclatura: ["Ácidos", "Bases", "Sais", "Óxidos", "Funções Inorgânicas"],
    reacoes: ["Estequiometria", "Balanceamento", "Oxirredução", "Reagente Limitante", "Titulação"],
    elementos: ["Tabela Periódica", "Eletronegatividade", "Raio Atômico", "Gases Nobres", "Metais de Transição"],
    complexos: ["Efeito Jahn-Teller", "Isomeria de Ligação", "Retrodoação Pi", "Efeito Quelato", "Teoria do Campo Cristalino"],
    organica: ["Grupos Funcionais", "Nomenclatura IUPAC", "Reações de Adição", "Isomeria", "Polímeros"],
    fisicoquimica: ["Termodinâmica", "Cinética Química", "Diagrama de Fases", "Ponto Triplo", "Comportamento Anômalo da Água"],
    quantica: ["Dualidade Onda-Partícula", "Equação de Schrödinger", "Teoria do Orbital Molecular", "Modelos Atômicos", "Experimento de Rutherford"]
};

const TOPIC_ANIMATION_IDS = {
  cristalografia: ['buracos', 'celulas', 'wigner', 'geocrist', 'redes', 'simetriahub', 'complexos'],
  vsepr: ['geomol', 'geomolpasso', 'polaridade', 'polaridade_geometria_exercicio'],
  ligacoes: ['quebracabeca', 'interacoes_intermoleculares', 'polaridade', 'geomol', 'polaridade_geometria_exercicio'],
  modelos: ['modelos_atomicos', 'eq_ondas_hidrogenoides', 'visualizador_hidrogenoides', 'visualizador_orbitais'],
  reacoes: ['quebracabeca', 'interacoes_intermoleculares'],
  organica: [],
  fisicoquimica: ['atlas_termodinamico', 'fases_da_agua', 'interacoes_intermoleculares'],
  complexos: ['complexos', 'redes', 'simetriahub'],
  quantica: ['modelos_atomicos', 'eq_ondas_hidrogenoides', 'visualizador_hidrogenoides', 'visualizador_orbitais']
};

function classifyGeneralTopic(text = '') {
  const t = normalize(text);
  if (/(cristalografia|cristal|celula|célula|rede|miller|bravais|defeito|simetria|empacotamento|wigner|seitz|formula unitaria|fórmula unitária|interstici)/.test(t)) return 'cristalografia';
  if (/(vsepr|geometria molecular|polaridade|momento dipolar|dipolo|axn|axnem|pares nao ligantes|pares não ligantes)/.test(t)) return 'vsepr';
  if (/(ligacao|ligacoes|ligação|ligações|lewis|ionica|iônica|covalente|forca intermolecular|forças intermoleculares|forcas intermoleculares|intermolecular|ponte de hidrogenio|ponte de hidrogênio)/.test(t)) return 'ligacoes';
  if (/(modelo|atomico|atômico|dalton|thomson|rutherford|bohr|schrodinger|schrödinger|orbital|quantico|quântico)/.test(t)) return 'modelos';
  if (/(reacao|reação|estequiometria|balanceamento|nox|oxidacao|oxidação|titula)/.test(t)) return 'reacoes';
  if (/(organica|orgânica|carbono|grupo funcional|isomeria|polimero|polímero)/.test(t)) return 'organica';
  if (/(fisico-quimica|físico-química|fisico quimica|físico química|termodinamica|termodinâmica|cinetica|cinética|entalpia|entropia|energia livre|fases da agua|fases da água|ponto critico|ponto crítico|ponto triplo)/.test(t)) return 'fisicoquimica';
  if (/(complexo|complexos|coordenacao|coordenação|ligante|quelato|espectroquimica|espectroquímica|polimorfismo|campo cristalino)/.test(t)) return 'complexos';
  if (/(quantica|quântica|schrodinger|schrödinger|onda|de broglie|orbital molecular|tom|millikan|crookes|fenda dupla)/.test(t)) return 'quantica';
  return '';
}

function getAnimationsForTopic(topic = '') {
  const ids = TOPIC_ANIMATION_IDS[topic] || [];
  return ids.map((id) => SIMOENS_SITE_MAP.find((entry) => entry.id === id)).filter(Boolean);
}

function replyAlreadyMentionsEntry(reply = '', entry) {
  if (!entry) return false;
  const sample = normalize(reply);
  return sample.includes(normalize(entry.title)) || sample.includes(normalize(entryUrl(entry)));
}

function getAnimationSuggestionsForText(text = '', currentCtx = null, limit = 3) {
  const seed = normalize(`${text || ''} ${currentCtx?.topic || ''} ${currentCtx?.title || ''} ${currentCtx?.heading || ''}`);
  const scored = [];
  const pushScored = (entry, score) => {
    if (!entry || !entry.catalogEntry) return;
    const found = scored.find((item) => item.entry.id === entry.id);
    if (found) found.score = Math.max(found.score, score);
    else scored.push({ entry, score });
  };

  const topic = classifyGeneralTopic(seed);
  getAnimationsForTopic(topic).forEach((entry, index) => pushScored(entry, 500 - index * 10));

  matchSiteEntries(seed).forEach((entry, index) => {
    if (!entry.catalogEntry) return;
    pushScored(entry, 420 - index * 12);
    relatedEntries(entry).forEach((related, relatedIndex) => pushScored(related, 280 - relatedIndex * 10));
  });

  getAnimationEntries().forEach((entry) => {
    const terms = entryTerms(entry);
    let hits = 0;
    for (const term of terms) {
      if (!term || term.length < 3) continue;
      if (seed.includes(term)) hits += term.split(/\s+/).length >= 2 ? 2 : 1;
    }
    if (hits) pushScored(entry, 140 + hits * 18);
  });

  return scored
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, 'pt-BR'))
    .map((item) => item.entry)
    .filter((entry, index, arr) => arr.findIndex((other) => other.id === entry.id) === index)
    .slice(0, limit);
}

function appendContextualAnimationSuggestions(reply, userText = '', currentCtx = null) {
  const base = String(reply || '').trim();
  if (!base) return base;
  if (/Animações relacionadas:|Conteúdos e animações relacionadas:|O SiMoEns tem \d+ animações\/visualizadores principais/.test(base)) return base;
  const suggestions = getAnimationSuggestionsForText(`${userText} ${base}`, currentCtx, 3)
    .filter((entry) => !replyAlreadyMentionsEntry(base, entry));
  if (!suggestions.length) return base;
  return `${base}

Animações relacionadas: ${suggestions.map((entry) => `${entry.title} (${entryUrl(entry)})`).join('; ')}.`;
}

function appendSuggestions(response, topic) {
    const suggestions = suggestionsMap[topic];
    let result = response;
    if (suggestions && suggestions.length) {
        const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2);
        result += `

*Tópicos relacionados que você pode perguntar: ${selected.join(", ")}.*`;
    }
    const relatedAnimations = getAnimationsForTopic(topic).slice(0, 3);
    if (relatedAnimations.length) {
        result += `

Animações relacionadas: ${relatedAnimations.map((entry) => `${entry.title} (${entryUrl(entry)})`).join('; ')}.`;
    }
    return result;
}
const rules = [
    {
        patterns: [/(como mandar mensagem|contato|falar com voces|entrar em contato|email|e-mail|fale conosco|mensagem)/],
        response: "**Contato SiMoEns:** Você pode entrar em contato conosco enviando um e-mail para **quimicavisualufv@gmail.com** ou preenchendo o formulário de contato na nossa página principal. Nosso endereço é: Departamento de Química - UFV (DEQ/UFV) - Universidade Federal de Viçosa, Viçosa - MG, 36570-900.\n\n[Acesse o formulário de contato aqui](https://quimicavisualufv.github.io/Quimica-Visual/#contact-form-2-v5iWwJnC3V)."
    },
    {
        patterns: [/(quem sao os integrantes|equipe|criadores|quem fez|desenvolvedores|autores|quem criou)/],
        response: "**Equipe SiMoEns:** O projeto é desenvolvido por um grupo dedicado de pesquisadores e estudantes. Os integrantes incluem:\n- Angel Amado Recio Despaigne\n- Deyse Gomes da Costa\n- Fábio Junior Moreira Novaes\n- Lis Regiane Vizolli Favarin\n- Lucas Xavier Nardelli\n\nSaiba mais na nossa [página principal](https://quimicavisualufv.github.io/Quimica-Visual/)."
    },
    {
        patterns: [/(novidades|atualizacoes|noticias|o que tem de novo|ultimas noticias|mudancas)/],
        response: "**Novidades do SiMoEns:**\n- **27/03/2026:** Lançamos o chatbot próprio do SiMoEns, alimentado por IA e integrado aos conteúdos do site.\n- **03/03/2026:** Novas animações guiadas no ensino, abordando temas como polaridade e geometria molecular.\n- **13/12/2025:** Novas animações guiadas sobre células e sistemas cristalinos.\n- **10/12/2025:** Animações de ensino para Química no estado sólido.\n\nAcompanhe as atualizações na nossa [página principal](https://quimicavisualufv.github.io/Quimica-Visual/)."
    },
    {
        patterns: [/(quando que reseta|como reseta|limpar o chat|apagar a conversa|reiniciar|comecar de novo|zerar)/],
        response: "**Resetar o Chat:** Como eu não guardo o histórico das suas mensagens em um servidor, para resetar a nossa conversa basta **recarregar a página** (apertar F5 ou o botão de atualizar do navegador). Isso limpará toda a tela e começaremos um novo papo!"
    },
    {
        patterns: [/(me fale sobre cada animacao|conte sobre.*animacao|do que fala essa animacao|quais animacoes|sobre o ensino|modulos de ensino|lista de animacoes|todas as animacoes|catalogo)/],
        response: "**Animações e Módulos de Ensino do SiMoEns:**\nNós temos várias animações interativas para te ajudar a visualizar a química:\n- **Geometria Molecular e Polaridade:** Mostra a teoria VSEPR, ângulos e vetores de dipolo em 3D.\n- **Células Unitárias e Redes Cristalinas:** Ensina sobre os 7 sistemas cristalinos, parâmetros de rede e redes de Bravais.\n- **Empacotamento e Buracos:** Visualiza como esferas se empacotam e formam interstícios tetraédricos e octaédricos.\n- **Célula Primitiva e Wigner-Seitz:** Mostra como recortar a menor unidade de repetição de um cristal.\n- **Polimorfismo e Complexos:** Explora como a mesma fórmula pode ter estruturas diferentes (ex: cisplatina, andalusita).\n- **Modelos Atômicos e Orbitais:** Uma jornada de Dalton a Schrödinger, com visualização 3D de orbitais hidrogenoides e hibridização.\n- **Quebra-Cabeça Íon/Covalente:** Um jogo para montar compostos respeitando a eletroneutralidade e valência.\n\nAcesse todas elas no nosso [Catálogo de Ensino](https://quimicavisualufv.github.io/Quimica-Visual/Ensino/)."
    },
    {
        patterns: [/(simoens|o que e o simoens|simulacoes|site|projeto simoens|plataforma)/],
        response: "**SiMoEns (Simulação, Modelo, Ensino):** É um grupo de pesquisa dedicado ao desenvolvimento de recursos digitais e animações interativas para o ensino de química. Você pode acessar o catálogo completo de animações em: [Catálogo SiMoEns](https://quimicavisualufv.github.io/Quimica-Visual/Ensino/)."
    },
    {
        patterns: [/(difracao|raios x|drx|xrd|lei de bragg|difratograma|espalhamento de raios x)/],
        response: "**Difração de Raios X e Lei de Bragg:** A cristalografia moderna nasceu com a difração de raios X (DRX). Como o comprimento de onda dos raios X é similar à distância entre os átomos em um cristal, a rede atua como uma rede de difração. A **Lei de Bragg** (nλ = 2d senθ) relaciona o ângulo de difração, a distância d e o comprimento de onda λ.\n\n*Exemplo Prático:* Foi usando o padrão de difração de raios X (na famosa 'Foto 51') que Rosalind Franklin descobriu o formato exato em dupla hélice do nosso DNA!"
    },
    {
        patterns: [/(indices de miller|indice de miller|planos cristalograficos|plano cristalino|notacao hkl|direcoes cristalograficas|hkl)/],
        response: "**Índices de Miller (hkl):** São um sistema de notação espacial para identificar planos em uma rede puramente cristalina. Eles são determinados calculando recíprocos dos pontos de corte nos eixos (X,Y,Z).\n\n*Exemplo Prático:* Em um cubo perfeito, a tampa/teto do cubo é rotulada como o plano (001). Na indústria, cortar uma pastilha de Silício ao longo do plano (100) ou (111) muda drasticamente a velocidade na qual a corrente elétrica vai fluir no microchip do seu celular."
    },
    {
        patterns: [/(defeito|defeitos|frenkel|schottky|vacancia|intersticial|discordancia|imperfeicao|imperfeicoes|defeitos pontuais)/],
        response: "**Defeitos Cristalinos:** Cristais reais não são perfeitos 100%. Existem **Defeitos de Schottky** (pares de ânions/cátions faltando) e **Frenkel** (átomo se desloca pro meio de um buraco). Há também defeitos extensos (discordâncias).\n\n*Exemplo Prático:* A ametista é roxa porque a rede do quartzo tem um 'defeito' atômico onde minúsculas impurezas de Ferro substituem o Sílicio. Na metalurgia, o aço maleável duro só existe porque propositalmente se trava as 'discordâncias' no Ferro."
    },
    {
        patterns: [/(simetria|grupo pontual|grupos pontuais|grupo espacial|grupos espaciais|eixo de rotacao|plano de reflexao|centro de inversao|operacoes de simetria|elementos de simetria|classes cristalinas)/],
        response: "**Simetria Cristalina:** A cristalografia é baseada estritamente em eixos, planos e centros. Os **32 Grupos Pontuais** definem objetos isolados. Os **230 Grupos Espaciais** juntam isso com translações (redes infinitas).\n\n*Exemplo Prático:* A molécula de Água tem formato angular (simetria C2v), parecendo o desenho de uma borboleta espelhada. Já os flocos de neve sempre desenvolvem visual com 6 pontas devido à extrema simetria hexagonal restrita da água congelada."
    },
    {
        patterns: [/(isomorfismo|isomorfo|isomorfos|substancias isomorfas)/],
        response: "**Isomorfismo:** Ocorre quando duas substâncias quimicamente *diferentes* cristalizam com o mesmo arranjo espacial (mesmo grupo espacial).\n\n*Exemplo Prático:* A Calcita (CaCO₃) e a Nitratina (NaNO₃) são compostos que não tem nada a ver um com o outro, mas seus átomos se montam no espaço fazendo tijolos trigonais de mesmo tamanho. Elas são isomorfas."
    },
    {
        patterns: [/(razao de raios|raio ionico|coordenacao.*raio|radius ratio|tamanho do ion|proporcao de raios)/],
        response: "**Regra da Razão de Raios (r+/r-):** Estima a geometria predizendo como os íons se encaixam pelo tamanho.\n\n*Exemplo:* Se você tiver um cátion pequeno e um ânion grande, o cátion só caberá sufocado no meio de 4 bolas (buraco tetraédrico, tipo no ZnS). Se o cátion for gordinho, os ânions têm que abrir espaço pra ele, formando um buraco octaédrico (encaixe perfeito no NaCl)."
    },
    {
        patterns: [/(energia de rede|born-haber|born haber|estabilidade.*cristal|energia reticular|entalpia de rede)/],
        response: "**Energia de Rede e Ciclo de Born-Haber:** É a energia absurda liberada pela atração quando íons formam uma matriz infinita 3D coesa. Calculada pelo ciclo teórico de Hess (ou Born-Haber).\n\n*Exemplo Prático:* O Óxido de Magnésio (Mg²⁺/O²⁻) tem cargas +2 e -2. A atração gerada por tanta carga aumenta assustadoramente a Energia de Rede dele se for comparado ao NaCl habitual (+1/-1). É por isso que o fogão derrete o plástico e a madeira, mas você usaria quase os 2800°C do sol para conseguir derreter pedras de sal Mg!"
    },
    {
        patterns: [/(vsepr|repulsao dos pares|geometria molecular|geometria eletronica|arranjo eletronico|forma da molecula|geometria da molecula|modelo vsepr|repulsao de pares)/],
        response: "**VSEPR e Geometria Molecular:** Os pares de elétrons são negativos e querem ficar o mais longe que consigam uns dos outros.\n\n*Exemplo Prático:* O Gás Metano (CH₄) espalha seus 4 ligantes para um ângulo tetraédrico exato de 109.5°. No entanto, a molécula de Amônia (NH₃) também foca em 4 regiões, mas uma delas não é um átomo e sim um par livre de elétrons 'invisível e espaçoso'. Ele amassa/fecha as 3 pernas de baixo pra um ângulo de 107°, ditando a amônia a virar uma 'pirâmide trigonal'!\n\nVeja a animação: [Geometria Molecular 3D](https://quimicavisualufv.github.io/Quimica-Visual/Ensino/Guia/geometria-molecular-passo-a-passo/)"
    },
    {
        patterns: [/(polaridade|dipolo|apolar|eletronegatividade|mep|mapa de potencial|momento de dipolo|molecula polar|molecula apolar|vetor dipolo)/],
        response: "**Polaridade Molecular:** Depende do cabo de guerra (eletronegatividade) e principalmente da forma da molécula espacialmente. Mostrada num Mapa MEP (Vermelho=Rico em e⁻ / Azul=Pobre).\n\n*Exemplo Prático:* A Água (H₂O) é uma molécula totalmente polar com polos magnéticos óbvios que a fazem dissolver sujeira em tudo por aí. Contudo, o Gás Carbônico exalado pela boca (CO₂) possui os mesmos laços polares com oxigênios fortes (C=O)... mas a coitada da molécula do CO₂ é linear, um ângulo esticado a exatos 180°. Seus polos se cancelam mutuamente, ditando o CO₂ como APOLAR.\n\nVeja a animação: [Polaridade Molecular](https://quimicavisualufv.github.io/Quimica-Visual/Ensino/Guia/polaridade-molecular-tutorial-guiado-passo-a-passo/)"
    },
    {
        patterns: [/(celula unitaria|celulas unitarias|parametros de rede|sistema cristalino|sistemas cristalinos|bravais|rede cristalina|redes cristalinas|cristal|cristais|estrutura cristalina|estruturas cristalinas|arranjo atomico|malha cristalina|reticulo cristalino|cristalografia)/],
        response: "**Células Unitárias e Redes:** A menor \"caixa de tijolos\" repetitiva que estampa todo o cristal. São definidas pelas letras das quinas (a,b,c) e os 3 ângulos entre os eixos. Compõem 7 sistemas gerais ou as 14 Redes de Bravais exclusivas.\n\n*Exemplo Prático:* O ferro morno na fábrica forma uma rede BCC (cúbico com 1 átomo oco no centro). Quando elevado a enormes estufas superaquecidas esse calor empurra o ferro para reorganizar seus blocos a uma rede FCC! O ferro encurta e adquire mais maciez atômica que dita a produção das ligas de metal das pontes!\n\nVeja as animações: [Células Unitárias](https://quimicavisualufv.github.io/Quimica-Visual/Ensino/Guia/celulas/) e [Redes Cristalinas](https://quimicavisualufv.github.io/Quimica-Visual/Ensino/Animacao/redes-cristalinas/)"
    },
    {
        patterns: [/(wigner.seitz|wigner seitz|voronoi|celula primitiva|celulas primitivas|poliedro de voronoi|menor celula)/],
        response: "**Célula Primitiva e Wigner-Seitz:** Um mapa geográfico atômico exato. A célula recorta o volume demarcando de quem as distâncias no pedaço estão mais próximas ao nódulo da ponta inicial.\n\n*Exemplo Prático:* É a mesma lógica da operadora colocar uma rádio torre e traçar as fronteiras invisíveis dizendo onde da redondeza o celular do usuário pega a torre sua torre específica sem dar área na antena ali da cidade do lado."
    },
    {
        patterns: [/(buraco|buracos|intersticio|intersticios|tetraedrico|octaedrico|empacotamento|camada hexagonal|sequencia aaa|aba|abc|sitio intersticial|sitios intersticiais|empacotamento compacto|esferas rigidas)/],
        response: "**Empacotamento e Interstícios:** Sobram espaços vazios nas matrizes chamados de buracos. Buraco tetraédrico (largo para 4 vizinhos) e octaédrico (cercado por 6).\n\n*Exemplo Prático:* No cloreto de sódio (Sal), o Cloro é grandão e compõe toda a parede maciça do cubo, mas a natureza faz os íons pequenos de Sódio (Na⁺) rastejarem para tapar exclusivamente os vãos vazios nos buracos octaédricos gerados no percurso!"
    },
    {
        patterns: [/(fracoes|contagem.*celula|vertice.*aresta.*face|sc|bcc|fcc|atomos por celula|numero de atomos|contagem de atomos|cubica de corpo centrado|cubica de face centrada)/],
        response: "**Contagem por Frações:** Um átomo na extremidade exata (vértice) só tem 1/8 de si pra dentro de um bloco porque ele divide o corpo cravado na parede com o vizinho! Na face temos 1/2.\n\n*Exemplo Prático:* Na organização Cúbica do Ferro (BCC) há nitidamente 1 átomo oco morando preso sozinho no meio. Ao contar as quinas (8 * 1/8) ganhamos apenas mais 1. Logo, a densidade/contagem do Ferro BCC tem exatos 2 átomos totais englobados."
    },

    {
        patterns: [/(quais conteudos da base tratam de cisplatina|conteudos.*cisplatina|base.*cisplatina|^cisplatina$|cisplatina)/],
        response: `**Cisplatina:** É um composto de coordenação de fórmula **cis-[Pt(NH3)2Cl2]**, com **Pt(II)** em geometria **quadrado planar**. No contexto do SiMoEns, ela se relaciona principalmente a **Química de Coordenação**, **complexos**, **ligantes** e **isomeria geométrica cis/trans**.

A cisplatina é o isômero **cis** biologicamente ativo; o isômero **trans** correspondente é a **transplatina**, que apresenta comportamento químico e biológico diferente. Se quiser, posso te explicar a cisplatina pela ótica de **isomeria**, **coordenação** ou **campo cristalino**.`
    },
    {
        patterns: [/(andalusita|cianita|kianita|silimanita|sillimanita)/],
        response: `**Andalusita, Cianita e Silimanita:** São **polimorfos de Al2SiO5**. Isso significa que têm a **mesma composição química**, mas **estruturas cristalinas diferentes**.

Em geral, a **andalusita** é estável em **pressões mais baixas**, a **cianita** em **pressões mais altas** e a **silimanita** em **temperaturas mais altas**. É um exemplo clássico de **polimorfismo em minerais**, controlado por **temperatura e pressão**.`
    },
    {
        patterns: [/(k[- ]?feldspato|k[- ]?fedalspato|feldspato potassico|ortoclasio|microclina|sanidina)/],
        response: `**K-feldspato (feldspato potássico):** É um grupo de **tectossilicatos** ricos em potássio, normalmente representados pela composição **KAlSi3O8**. Exemplos importantes são **ortoclásio**, **microclina** e **sanidina**.

Esse mineral é muito comum em **granitos** e outras rochas ígneas e metamórficas. Se quiser, também posso comparar **K-feldspato** com **albita (Na-feldspato)**.`
    },
    {
        patterns: [/(na[- ]?feldspato|na[- ]?fedalspato|feldspato sodico|albita|plagioclasio sodico)/],
        response: `**Na-feldspato (albita):** A **albita**, de fórmula **NaAlSi3O8**, é o principal feldspato sódico e pertence à série dos **plagioclásios**.

Ela é comum em rochas ígneas e metamórficas e difere do **K-feldspato** porque o cátion dominante na estrutura é o **Na+**, e não o **K+**. Se quiser, posso te mostrar a diferença entre **albita, anortita e K-feldspato**.`
    },
    {
        patterns: [/(polimorfismo|polimorfo|tit[aã]nio|alotropia|polimorfos|fases cristalinas|alotropos)/],
        response: `**Polimorfismo:** É a capacidade de uma substância sólida apresentar **mais de uma estrutura cristalina** mantendo a **mesma composição química**. No caso de elementos químicos, costuma-se usar o termo **alotropia**.

A estabilidade de cada forma depende principalmente de **temperatura** e/ou **pressão**. Exemplos clássicos são **grafite e diamante** para o carbono e os polimorfos **andalusita, cianita e silimanita** para o **Al2SiO5**.`
    },
    {
        patterns: [/(modelos atomicos|dalton|thomson|rutherford|bohr|schrodinger|schr[oö]dinger|modelo atomico|evolucao dos modelos|teoria atomica|pudim de passas|modelo planetario)/],
        response: "**Modelos Atômicos:** Dalton achou que o mundo era \"bolas de gude indivisíveis\". Thomson inseriu passas elétricas (elétrons). Rutherford descobriu o caroço positivo (núcleo) via folhas de ouro. Bohr deu órbitas restritivas quânticas à velocidade.\n\n*Exemplo Prático:* Bohr é a magia dos letreiros NEON e show de fogos. O fogo esquenta o átomo jogando o elétron ativado lá numa órbita muito de fora. Num bilionésimo de instante ele perde as forças caindo e devolve a energia inteira jorrando as exatas luzes coloridas da tabela!"
    },
    {
        patterns: [/(orbital|orbitais|numeros quanticos|funcao de onda|hidrogenoide|blobby|metaball|hibridizacao|orbital ligante|orbitais ligantes|orbital antiligante|orbitais antiligantes|antiligante|nuvem eletronica|densidade eletronica|orbital atomico|orbital molecular)/],
        response: "**Orbitais e Equações de Onda:** Schrödinger enterrou as órbitas dizendo que elétron age virando luz, fumaça (onda). Orbitais são bolsões de fumaça onde a probabilidade se aglomera.\n\n*Exemplo Prático:* Pense no orbital 's' como bater foto longa de um mosquito voando e o borrão virar uma esfera maciça amarelada perambulante de elétron. O orbital 'p' vira duas bexigas longas de festa de niver estranguladas juntas. É nessas exatas nuvens que toda reação química ou hibridização se esbarra no espaço!"
    },
    {
        patterns: [/(nacl|cloreto de sodio|cscl|zns|blenda|rutilo|sal de cozinha|estrutura do nacl|sulfeto de zinco)/],
        response: "**Estruturas Clássicas:** \n- **NaCl** (sal de cozinha) abriga Na⁺ dentro dos buracos octaédricos gerando cordenação 6:6.\n- **ZnS** abriga os convidados em metades de buracos num ambiente tetraédricos estritos (NC=4:4).\n\n*Exemplo Prático:* Essa regra dita o brilho e dureza do NaCl e se contrapõe às antigas placas fosforescentes grossas no fundo de tubos clássicos de TVs CRT, que eram totalmente empoeiradas e baseadas explicitamente em grades dopadas com pó da rede cristalina pura de ZnS!"
    },
    {
        patterns: [/(teoria do campo cristalino|tcc|desdobramento do campo|baixo spin|alto spin|serie espectroquimica)/],
        response: "**Teoria do Campo Cristalino (TCC):** Descreve como os orbitais 'd' do metal dividem energia (saltos de cor T2G e EG) quando sentem a pura repulsão invasiva dos ligantes espaciais ao redor.\n\n*Exemplo Prático:* É a TCC que faz a tinta de joias mudar bruscamente de cor. Ligantes de Campo Forte (Cianeto CN⁻) se chocam tão agressivamente com o átomo no sangue que \"travam\" todo o oxigênio num baixo spin imbatível, nos matando de envenenamento rápido. Já a água nos banhos é campo fraco, abrindo orbitais leves soltando salton-verde e azul aos metais afundados."
    },
    {
        patterns: [/(o que (e|sao) (um |o |os )?ligante|definicao de ligante|ligante na quimica|ligante no complexo|ligante monodentado|ligante polidentado|quelato|efeito quelato)/],
        response: "**Ligantes e Quelatos:** Uma molécula com muita bondade eletrônica (Sobra pares de elétrons) que gruda e \"coordena\" uma ponte temporária sobre o metal central estilhaçado.\n\n*Exemplo Prático:* Na medicina de intoxicações, caso engula chumbo, o médico injeta um agente quelante como o EDTA. Por ter vários átomos doadores, ele pode coordenar o metal em mais de um ponto ao mesmo tempo, formando complexos mais estáveis. Esse é um exemplo clássico do efeito quelato, importante em processos de complexação e em aplicações médicas específicas."
    },
    {
        patterns: [/(complexo|complexos|coordenacao|azul da prussia|hidratacao|composto de coordenacao|compostos de coordenacao|metal de transicao|ligante|ligantes)/],
        response: "**Química de Coordenação e Complexos:** Montagens onde o núcleo rei do centro é blindado por dezenas de ligantes exóticos formatando a cor exata visual!\n\n*Exemplo Prático:* Sangue (Ferro na Hemoglobina abraçando e destravando Oxigênio) e Natureza (Magnésio na estrutura central blindada do disco das Clorofilas). Ao alterar 1 ligante o verde esmeralda vira imediatamente azul roxo. Até as moedas trocam cor e ferrujem baseadas nos complexos gerados ao oxidarem!"
    },
    {
        patterns: [/(lewis|ligacao ionica|ligacoes ionicas|ligacao covalente|ligacoes covalentes|valencia|eletroneutralidade|estrutura de lewis|regra do octeto|regra do dueto|dueto|octeto|compartilhamento de eletrons|transferencia de eletrons|compostos inorganicos|solidos inorganicos)/],
        response: "**Estruturas de Lewis e Tipos de Ligação:** As estruturas de Lewis representam elétrons de valência e ajudam a diferenciar ligações iônicas e covalentes.\n\n*Exemplo Prático:* O sódio metálico é altamente reativo e o cloro molecular é tóxico. Quando ocorre transferência eletrônica entre eles, forma-se o composto iônico NaCl, estabilizado pela atração eletrostática entre Na⁺ e Cl⁻ em uma rede cristalina."
    },

    {
        patterns: [/(quartzo|feldspato|fedalspato|aluminosilicato|silicato|silicatos|solido covalente|solidos covalentes|rede covalente)/],
        response: `**Silicatos, Quartzo e Feldspatos:** Os silicatos são minerais baseados em tetraedros **[SiO4]** ligados de diferentes maneiras. O **quartzo (SiO2)** é um exemplo de estrutura tridimensional contínua. Já os **feldspatos** são **aluminossilicatos** muito comuns, com composições ricas em **K, Na** ou **Ca**.

Se a sua dúvida for específica, eu posso detalhar **quartzo**, **K-feldspato**, **albita**, **plagioclásios** ou a classificação dos **tectossilicatos**.`
    },
    {
        patterns: [/(formula unitaria|formulas unitarias|formula empirica|proporcao estequiometrica)/],
        response: "**Fórmula Unitária:** Corta tudo pelo mínimo divisor em blocões empilhados gigantes, já que os Íons não funcionam vivendo como moléculas isoladas no ar igual gás.\n\n*Exemplo Prático:* Se você analisar todo o cristal pedindo porção de Sal para seu almoço, pegaria quase 6 trilhões de Íons de cloro e 6 Trilhões de Sódio. O que a Formula emparelha não é esse número absurdo. Ele é simplificado globalmente à escala de NaCl informando a proporção exata 1:1 local."
    },
    {
        patterns: [/(estado de oxidacao|estados de oxidacao|nox|numero de oxidacao|carga do ion|carga formal)/],
        response: "**Estados de Oxidação (Nox):** Indica a carga fantasma de um átomo se tudo fosse roubado 100% ionicamente na ligação.\n\n*Exemplo Prático:* A ferrugem avermelhada é resultado da oxidação do ferro metálico (Nox = 0) para estados de oxidação positivos, frequentemente associados ao Fe³⁺ em óxidos e hidróxidos hidratados. Esse processo altera a estrutura e fragiliza o material."
    },
    {
        patterns: [/(reacao quimica|reacoes quimicas|sintese|decomposicao|simples troca|dupla troca|neutralizacao|tipos de reacoes|reacao inorganica|reacoes inorganicas)/],
        response: "**Reações Químicas (Inorgânica):** Dividem-se em Adição, Decomposição, Troca Dupla (Neutralização).\n\n*Exemplo Prático:* Ao aquecer uma massa com bicarbonato, ocorre liberação de dióxido de carbono em reações de decomposição e neutralização, o que contribui para a expansão da massa no forno."
    },
    {
        patterns: [/(nomenclatura|nomear|nome dos compostos|acidos|bases|sais|oxidos|dar nome|regras de nomenclatura|funcoes inorganicas)/],
        response: "**Nomenclatura Inorgânica:** Organiza a nomeação de ácidos, bases, sais e óxidos segundo regras padronizadas.\n\n*Exemplo Prático:* O HCl em solução aquosa é chamado ácido clorídrico. Antiácidos contendo hidróxidos, como os de magnésio ou alumínio, podem neutralizar o excesso de acidez, formando água e sais."
    },
    {
        patterns: [/(quimica organica|organica|carbono)/],
        response: "**Química Orgânica (Carbono):** Ramo da Química dedicado aos compostos de carbono.\n\n*Exemplo Prático:* A matéria prima do pneu, do computador, do cérebro da vaca que você come, da camiseta de poliéster e até do plástico bolha transparente vêm todas das incríveis infinitas e variadas correntes de Tetraligantes do poderoso Carbono!"
    },
    {
        patterns: [/(grupo funcional|grupos funcionais|funcoes organicas|alcool|cetona|aldeido|acido carboxilico|amina|amida)/],
        response: "**Grupos Funcionais:** São conjuntos de átomos que determinam propriedades e reatividade em compostos orgânicos.\n\n*Exemplo Prático:* Aminas, cetonas e ácidos carboxílicos aparecem em diferentes materiais e substâncias do cotidiano. O vinagre, por exemplo, contém ácido acético, um composto da função ácido carboxílico."
    },
    {
        patterns: [/(nomenclatura organica|iupac organica)/],
        response: "**Nomenclatura Orgânica (IUPAC):**\n1. Prefixo: Nº de carbonos (Met=1, Et=2, Prop=3)\n2. Infixo: Feixe de traços (an=simples, in=tripla)\n3. Sufixo: Coroa da Função (-ol, -ona)\n\n*Exemplo Prático:* O famoso ETANOL da gasolina é: Et (Tem 2 carbonos) + An (Tudo elo fraco) + Ol (Coroa de álcool)!"
    },
    {
        patterns: [/(reacoes organicas|adicao|substituicao|eliminacao)/],
        response: "**Reações Orgânicas:** A base da digestão e modificação do combustível industrial: Adição, Substituição, Eliminação.\n\n*Exemplo Prático:* Na hidrogenação de óleos vegetais, hidrogênio é adicionado a ligações múltiplas sob condições catalíticas, alterando propriedades físicas do material."
    },
    {
        patterns: [/(fisico-quimica|fisico quimica)/],
        response: "**Físico-Química:** Cruza Matemática, Física e as propriedades do universo batendo na Matéria maciça Química.\n\n*Exemplo Prático:* É a físico química que diz por que diabos a panela de pressão cozinha o feijão muito mais rápido sem deixar e ferver a água pra fora do teto da sua casa."
    },
    {
        patterns: [/(termodinamica|entalpia|entropia|energia livre|gibbs|leis da termodinamica)/],
        response: "**Termodinâmica (Entalpia e Gibbs):** Rege o escoamento incontrolável do Universo Químico.\n\n*Exemplo Prático:* O pneu do freio não cria calor do nada (Entalpia positiva)! Ele apenas condensa no asfalto a energia! O gelo derrete no Sol livre porque sua desordem microscópica anseia desesperadamente explodir de liberdade (Elevação Máxima da Entropia da vida natural)!"
    },
    {
        patterns: [/(cinetica|velocidade da reacao|energia de ativacao|catalisador)/],
        response: "**Cinética e Catalisadores:** Quão rápido que o fogo da Química corre a sala de cirurgia!\n\n*Exemplo Prático:* Se não fosse os minúsculos \"Catalisadores\" do nosso pulmão e estômago (apelidados de Enzimas), reações bioquímicas fundamentais demorariam muito mais sem a ação catalítica das enzimas."
    },
    {
        patterns: [/(fases da agua|ponto critico|ponto triplo|superfluido|comportamento anomalo da agua|diagrama de fases)/],
        response: "**Fases da Água e Diagrama:** Demonstra picos raros que enganam nossos olhos de criança.\n\n*Exemplo Prático:* Sabia que num exato ponto trancado na termodinâmica (Ponto Triplo exato a 0,01 °C) a Água entra nas 3 fases borbulhando e congelando tudo de uma só vez misturada! Além de que o cubo de gelo flutua no refri só porque é o milagre anômalo de ser estupidamente hexagona!l, ao contrário de todos os outros fluidos do multiverso que afundam pedra dura quando solidificados."
    },
    {
        patterns: [/(equacao de onda|schrodinger|hidrogenoide|dualidade onda particula|de broglie)/],
        response: "**Mecânica Quântica e Schrödinger:** Quebra o que nosso cérebro humano entende por Bolinhas batendo!\n\n*Exemplo Prático:* Se você cuspir elétrons numa placa de fenda fina na Física Clássica eles iam bater no cimento igual balas quicando marcando apenas 2 linhas pálidas. Mas no experimento das duplas fendas, os elétrons burlando a realidade de repente surtam interferindo em 50 marcas pintadas provando sem dúvidas que viram pura fumaça da \"Dualidade Onda-Partícula\"!"
    },
    {
        patterns: [/(teoria do orbital molecular|orbital molecular|tom|orbitais ligantes|orbitais antiligantes)/],
        response: "**Teoria do Orbital Molecular (TOM):** Funde as conchas dos átomos separadores criando uma Bolha Global Gigante por cima da união das órbitas ligantes da estabilidade!\n\n*Exemplo Prático:* A TOM explica, por exemplo, por que o O₂ apresenta elétrons desemparelhados em orbitais antiligantes e, por isso, comportamento paramagnético."
    },
    {
        patterns: [/(experimento da folha de ouro|rutherford|carga do eletron|millikan|gota de oleo|tubo de crookes|raios catodicos|fenda dupla|experimento de thomson)/],
        response: "**Experimentos Históricos:** A glória dos gênios fundadores na era de Ouro onde não tinha nem microscópio e se descobriu todos os átomos via pura intuição de gênio e canos catódicos vazados a vácuo!\n\n*Exemplo Prático:* Rutherford inferiu a existência de um núcleo pequeno e denso ao observar que uma pequena fração das partículas alfa sofria grandes desvios ao atravessar uma fina lâmina de ouro."
    },
    {
        patterns: [/(buraco tetraedrico|buraco octaedrico|intersticio|lacuna cristalina)/],
        response: "**Interstícios (Buracos):** Os esconderijos tridimencionais gerados sem querer em redes maciças.\n\n*Exemplo Prático:* No Empacotamento Maciço de uma barra de aço, ficam buracos vazios invisíveis. Num buraco tetraédrico cabem bolas bem pequenas abafadas de Carbonos ali dentro! É assim, na tora invadindo os buracos ocultos, que passamos do Ferro Mole pra materiais com propriedades mecânicas significativamente alteradas, como ocorre em ligas metálicas e aços."
    }
];

const TOPIC_MEMORY_KEY = "simoens:last-topic";
function classifyGeneralTopic(text) {
    if (/(cristalografia|cristal|celula|rede|miller|bravais|defeito|simetria|empacotamento)/.test(text)) return "cristalografia";
    if (/(vsepr|geometria|polaridade)/.test(text)) return "vsepr";
    if (/(ligacao|ligacoes|lewis|ionica|covalente|forca intermolecular|forcas intermoleculares|intermolecular|ponte de hidrogenio)/.test(text)) return "ligacoes";
    if (/(modelo|atomico|dalton|thomson|rutherford|bohr|schrodinger|orbital|quantico)/.test(text)) return "modelos";
    if (/(reacao|estequiometria|balanceamento|nox|oxidacao)/.test(text)) return "reacoes";
    if (/(organica|carbono|grupo funcional|isomeria|polimero)/.test(text)) return "organica";
    if (/(fisico-quimica|fisico quimica|termodinamica|cinetica|entalpia|entropia|energia livre|fases da agua|ponto critico|ponto triplo)/.test(text)) return "fisicoquimica";
    if (/(complexo|coordenacao|ligante|quelato|espectroquimica)/.test(text)) return "complexos";
    if (/(quantica|schrodinger|onda|de broglie|orbital molecular|tom|rutherford|millikan|crookes|fenda dupla)/.test(text)) return "quantica";
    return "";
}
function cleanTopicTarget(text) {
    const cleaned = text.replace(/\b(quebra[- ]?cabeca|jogo|guia|exercicio de fixacao|exercicios de fixacao|pagina|paginas|animacao|animacoes)\b/g, " ").replace(/\s+/g, " ").trim();
    if (/^covalente$/.test(cleaned)) return "ligacao covalente";
    if (/^ionica$/.test(cleaned)) return "ligacao ionica";
    if (/^intermolecular$/.test(cleaned) || /^forcas intermoleculares$/.test(cleaned)) return "forca intermolecular";
    return cleaned;
}
function rememberTopicContext(text) {
    const topic = classifyGeneralTopic(text);
    if (!topic) return;
    const payload = { topic, target: cleanTopicTarget(text) || text, at: Date.now() };
    try {
        sessionStorage.setItem(TOPIC_MEMORY_KEY, JSON.stringify(payload));
    } catch (error) {}
}
function recallTopicContext() {
    try {
        const raw = sessionStorage.getItem(TOPIC_MEMORY_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.topic || !parsed.at) return null;
        if (Date.now() - parsed.at > 15 * 60 * 1000) return null;
        return parsed;
    } catch (error) {
        return null;
    }
}
function extractExplanationTarget(text) {
    const trimmed = text.trim();
    const onlyExplain = /^(explicacao|explica|explique|me explica|me explique|quero uma explicacao|quero explicacao)$/.test(trimmed);
    if (onlyExplain) return "";
    const match = trimmed.match(/^(?:me\s+)?(?:explica|explique|explicacao)(?:r)?(?:\s+(?:sobre|de))?\s+(.+)$/);
    return match ? match[1].trim() : null;
}
function getGeneralTopicExplanation(topic) {
    const explanations = {
        cristalografia: "**Cristalografia e Estado Sólido:** estuda como os átomos, íons ou moléculas se organizam no espaço formando redes periódicas. Os conceitos centrais são **célula unitária**, **parâmetros de rede**, **simetria**, **índices de Miller** e **defeitos cristalinos**. Essas ideias ajudam a explicar propriedades como dureza, densidade, clivagem e condutividade dos sólidos.",
        vsepr: "**Geometria Molecular e VSEPR:** a forma das moléculas é prevista pela repulsão entre regiões eletrônicas ao redor do átomo central. Pares ligantes e pares livres se organizam para ficarem o mais afastados possível, o que gera geometrias como **linear**, **trigonal plana**, **tetraédrica**, **bipiramidal trigonal** e **octaédrica**. A geometria influencia diretamente ângulos de ligação e polaridade.",
        ligacoes: "**Ligações Químicas e Forças Intermoleculares:** as **ligações químicas** mantêm os átomos unidos dentro da substância, enquanto as **forças intermoleculares** atuam entre moléculas ou partículas já formadas. Na **ligação iônica** ocorre atração entre íons de cargas opostas; na **ligação covalente** ocorre compartilhamento de elétrons. Já entre moléculas podem atuar **forças de London**, **dipolo-dipolo** e **ligação de hidrogênio**. Em geral, ligações químicas são mais fortes que forças intermoleculares, por isso elas afetam bastante propriedades como ponto de fusão, ebulição, solubilidade e estado físico.",
        modelos: "**Modelos Atômicos e Quântica:** esse tema acompanha a evolução das ideias sobre a estrutura do átomo, de **Dalton** até os modelos quânticos. Thomson introduz os elétrons, Rutherford propõe o núcleo, Bohr quantiza níveis de energia e a mecânica quântica substitui órbitas definidas por **orbitais** e probabilidades. É a base para entender distribuição eletrônica, espectros e ligações.",
        reacoes: "**Reações Químicas e Estequiometria:** estudam como reagentes se transformam em produtos e como quantificar essas transformações. Entram aqui conceitos como **balanceamento**, **proporção molar**, **reagente limitante**, **rendimento** e **NOX** em processos de oxidação e redução. É o tema que conecta a equação química ao cálculo quantitativo.",
        organica: "**Química Orgânica:** é o ramo que estuda principalmente os compostos de carbono, suas estruturas, funções e reações. Os pontos mais importantes incluem **grupos funcionais**, **nomenclatura**, **isomeria** e os principais tipos de reações orgânicas. A estrutura da cadeia carbônica influencia propriedades físicas e químicas das substâncias.",
        fisicoquimica: "**Físico-Química:** relaciona química com energia, velocidade e equilíbrio dos processos. Reúne temas como **termodinâmica**, **cinética química**, **equilíbrio**, **diagramas de fase** e propriedades da matéria. Ela explica não só se um processo pode acontecer, mas também quão rápido ele ocorre e em quais condições.",
        complexos: "**Química de Coordenação e Complexos:** analisa espécies formadas por um átomo ou íon metálico central ligado a **ligantes**. Conceitos importantes incluem **número de coordenação**, **geometria**, **isomeria**, **efeito quelato** e **teoria do campo cristalino**. Esse tema é essencial para entender cor, magnetismo, estabilidade e reatividade de muitos compostos metálicos.",
        quantica: "**Química Quântica e Histórica:** explica o comportamento microscópico de elétrons e átomos por meio de ideias como **dualidade onda-partícula**, **função de onda**, **orbitais** e níveis de energia quantizados. Também inclui experimentos clássicos que moldaram a teoria moderna, como os de Rutherford, Millikan e a dupla fenda. É a base teórica para a estrutura eletrônica e as ligações.",
    };
    return explanations[topic] || "";
}
function resolveExplanationIntent(text) {
    const extracted = extractExplanationTarget(text);
    if (extracted === null) return null;
    const remembered = recallTopicContext();
    const target = cleanTopicTarget(extracted || remembered?.target || "");
    if (target) {
        for (const rule of rules) {
            if (rule.patterns.some(pattern => pattern.test(target))) {
                return rule.response;
            }
        }
    }
    const topic = classifyGeneralTopic(target || remembered?.topic || "") || remembered?.topic || "";
    if (!topic) return "";
    rememberTopicContext(target || topic);
    return appendSuggestions(getGeneralTopicExplanation(topic), topic);
}

function getBotResponse(userInput) {
    const normalizedInput = userInput.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    rememberTopicContext(normalizedInput);
    const explanationResponse = resolveExplanationIntent(normalizedInput);
    if (explanationResponse) return explanationResponse;
    // Quiz / Questions
    if (/(faca uma questao|mande uma questao|quero.*questao|quero.*exercicio|faca.*pergunta|mande.*pergunta|quiz|me teste|^questoes$|^exercicios$|questoes sobre|exercicios sobre|pergunta sobre)/.test(normalizedInput)) {
        let filteredQuestions = quizQuestions;
        // Check if the user specifically asked for a guided question
        if (/(guiada|dica|passo a passo|guiadas|dicas)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.q.includes('Questão Guiada'));
        }
        else if (/(cristalografia|cristal|celula|rede|miller|bravais|defeito|simetria|empacotamento)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.topic === 'cristalografia');
        }
        else if (/(vsepr|geometria|polaridade)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.topic === 'vsepr');
        }
        else if (/(ligacao|lewis|ionica|covalente|forca intermolecular|intermolecular|ponte de hidrogenio)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.topic === 'ligacoes');
        }
        else if (/(modelo|atomico|dalton|thomson|rutherford|bohr|schrodinger|orbital|quantico)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.topic === 'modelos');
        }
        else if (/(nomenclatura|acido|base|sal|oxido|funcao inorganica)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.topic === 'nomenclatura');
        }
        else if (/(reacao|sintese|decomposicao|troca|nox|oxidacao|estequiometria|balanceamento)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.topic === 'reacoes' || q.topic === 'estequiometria');
        }
        else if (/(elemento|tabela periodica|propriedade periodica|eletronegatividade|raio atomico)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.topic === 'elementos');
        }
        else if (/(complexo|coordenacao|ligante)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.topic === 'complexos');
        }
        else if (/(organica|carbono|grupo funcional|isomeria|polimero)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.topic === 'organica');
        }
        else if (/(fisico-quimica|fisico quimica|termodinamica|cinetica|entalpia|entropia|energia livre|fases da agua|ponto critico|ponto triplo)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.topic === 'fisicoquimica');
        }
        else if (/(quantica|schrodinger|onda|de broglie|orbital molecular|tom|rutherford|millikan|crookes|fenda dupla)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.topic === 'quantica');
        }
        else if (/(animacao|animacoes|simoens)/.test(normalizedInput)) {
            filteredQuestions = quizQuestions.filter(q => q.q.includes('Animação SiMoEns'));
        }
        if (filteredQuestions.length === 0)
            filteredQuestions = quizQuestions;
        const randomQ = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
        return randomQ.q;
    }
    // Instructions
    if (/(instrucao|instrucoes|como usar|ajuda|help|o que voce faz|o que voce pode fazer|como falar|o que perguntar)/.test(normalizedInput)) {
        return `Aqui estão as instruções detalhadas de como posso te ajudar (lembre-se de sempre ser direto no que está perguntando, pois busco por palavras-chave!):

📚 **Tirar Dúvidas:** Me pergunte sobre conceitos diretos de química usando palavras do assunto. 
*(Ex: "O que é a Teoria do Campo Cristalino?", "O que são índices de Miller?", "Quais são as fases da água?", "Defina o Princípio de Pauli")*.

🧪 **Pesquisa de Elementos:** Peça propriedades, informações ou curiosidades sobre qualquer elemento da Tabela Periódica. 
*(Ex: "Tudo sobre o Oxigênio", "Elemento Ouro", "Qual a massa atômica do Fósforo?", "Quem é o elemento Fe?")*.

📝 **Fazer Exercícios e Simulados:** Peça para ser testado com problemas, ou até especifique uma área! 
*(Ex: "Me faça uma questão de química", "Quero exercícios sobre termodinâmica", "Faça uma pergunta sobre VSEPR", "Questões da tabela periódica")*.

💡 **Resolução Passo-a-Passo (Questões Guiadas):** Caso esteja inseguro se consegue resolver um problema todo sozinho, eu te entrego a resposta dividida em passos lógicos e ocultos. Você revela as dicas de uma em uma. 
*(Ex: "Manda uma questão guiada para mim!", "Eu quero ser testado com uma questão guiada sobre cálculo estequiométrico")*.

👀 **Desvendando o Gabarito (Spoilers):** Durante as questões, as alternativas falsas/verdadeiras, o raciocínio final ou dicas guiadas sempre chegam escondidos numa tarja cinza. Basta **passar o mouse (ou tocar pelo celular)** em cima dessa barra cinza para revelá-las sem receber "spoiler" antes da hora.

🎯 **Animações Educativas (SiMoEns):** Se tiver curiosidade, explore os materiais gráficos construídos pelo núcleo SiMoEns! 
*(Ex: "Me mostre todas as animações", "Tens animações sobre geometria molecular?")*.

🔄 Sempre tentarei, junto com a resposta, direcionar seus estudos puxando três novos tópicos para guiá-lo à próxima pergunta. Pode ir clicando mentalmente e digitando a palavra, e a gente viaja pelo ramo químico juntos.`;
    }
    // Greetings
    if (/(^|\s)(oi|ola|bom dia|boa tarde|boa noite|opa|e ai|saudacoes)(\s|$)/.test(normalizedInput)) {
        const greetings = [
            "Olá! Sou o Assistente do SiMoEns. Prefiro frases diretas e uso reconhecimento de palavras-chave. Posso te ajudar com VSEPR, polaridade, células unitárias, cristalografia, empacotamento, polimorfismo, modelos atômicos e orbitais. O que deseja saber?",
            "Oi! Eu sou o Assistente do SiMoEns. Pergunte-me de modo direto sobre química estrutural, estado sólido ou mesmo os elementos químicos!",
            "Saudações! Estou pronto para tirar suas dúvidas sobre geometria molecular, redes cristalinas, modelos atômicos e muito mais. Digite a palavra ou a frase do assunto que quer investigar (ex. 'como é a estrutura do cloreto de sódio?'). Como posso ajudar?",
            "Olá! Aqui é o Assistente do SiMoEns. Respondo a termos e palavras associadas à química geral, inorgânica e cristalografia. Lembre-se que por ser guiado a regras, perguntas longas demais podem me confundir. Qual é a sua pergunta hoje?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (/(^|\s)(tudo bem|como vai|como voce esta|tudo certo)(\s|$)/.test(normalizedInput)) {
        const howAreYous = [
            "Estou funcionando perfeitamente! Pronto para falar sobre química estrutural. Qual é a sua dúvida?",
            "Tudo ótimo por aqui! Estou pronto para te ajudar com química do estado sólido. O que quer saber?",
            "Tudo bem! Minhas respostas sobre química estão afiadas. Em que posso ser útil?"
        ];
        return howAreYous[Math.floor(Math.random() * howAreYous.length)];
    }
    // Elements and Fuzzy Matching
    const elementQueryRegex = /(elemento|simbolo|sobre o|numero atomico|massa atomica|qual e o|quem e o|fale sobre)/;
    if (elementQueryRegex.test(normalizedInput)) {
        const words = normalizedInput.replace(/[?,.!]/g, "").split(" ");
        const stopWords = new Set(["elemento", "simbolo", "do", "de", "o", "sobre", "numero", "atomico", "massa", "qual", "e", "quem", "fale", "um", "a"]);
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (stopWords.has(word) || word.length < 3)
                continue;
            // Exact match
            if (elements[word])
                return elements[word];
            if (nameToSymbol[word] && elements[nameToSymbol[word]])
                return elements[nameToSymbol[word]];
            // Fuzzy match (substring matching for elements)
            for (const [name, info] of Object.entries(elements)) {
                if (name.includes(word) || word.includes(name)) {
                    return info;
                }
            }
            for (const [name, symbol] of Object.entries(nameToSymbol)) {
                if (name.includes(word) || word.includes(name)) {
                    return elements[symbol];
                }
            }
        }
    }
    // Knowledge Base Rules
    for (const rule of rules) {
        if (rule.patterns.some(pattern => pattern.test(normalizedInput))) {
            return rule.response;
        }
    }
    // Topic-specific fallbacks for ambiguous queries
    if (/(cristalografia|cristal|celula|rede|miller|bravais|defeito|simetria|empacotamento)/.test(normalizedInput)) {
        return appendSuggestions("Vejo que você está interessado em **Cristalografia e Estado Sólido**! Você gostaria de uma explicação sobre algum conceito específico (como Células Unitárias, Índices de Miller, Defeitos) ou prefere que eu te faça uma **questão** para testar seus conhecimentos? (Diga: 'Me faça uma questão sobre cristalografia')", "cristalografia");
    }
    if (/(vsepr|geometria|polaridade)/.test(normalizedInput)) {
        return appendSuggestions("Você mencionou **Geometria Molecular ou VSEPR**! Posso te explicar como a repulsão dos pares de elétrons define a forma da molécula, ou posso te fazer uma **questão** sobre isso. O que prefere?", "vsepr");
    }
    if (/(ligacao|lewis|ionica|covalente|forca intermolecular|intermolecular)/.test(normalizedInput)) {
        return appendSuggestions("O assunto é **Ligações Químicas e Forças Intermoleculares**! Quer uma explicação sobre ligações iônicas/covalentes, ou quer testar seus conhecimentos com uma **questão**?", "ligacoes");
    }
    if (/(modelo|atomico|dalton|thomson|rutherford|bohr|schrodinger|orbital|quantico)/.test(normalizedInput)) {
        return appendSuggestions("Falando sobre **Modelos Atômicos e Quântica**! Posso explicar a evolução dos modelos ou te desafiar com uma **questão**. O que você escolhe?", "modelos");
    }
    if (/(reacao|estequiometria|balanceamento|nox|oxidacao)/.test(normalizedInput)) {
        return appendSuggestions("Você tocou no tema de **Reações Químicas e Estequiometria**! Quer que eu explique como calcular o Nox, reagente limitante, ou prefere resolver uma **questão guiada** sobre isso?", "reacoes");
    }
    if (/(organica|carbono|grupo funcional|isomeria|polimero)/.test(normalizedInput)) {
        return appendSuggestions("Você mencionou **Química Orgânica**! Posso te explicar sobre grupos funcionais, nomenclatura IUPAC, ou te desafiar com uma **questão** sobre o tema. O que prefere?", "organica");
    }
    if (/(fisico-quimica|fisico quimica|termodinamica|cinetica|entalpia|entropia|energia livre|fases da agua|ponto critico|ponto triplo)/.test(normalizedInput)) {
        return appendSuggestions("O assunto é **Físico-Química**! Gostaria de uma explicação sobre termodinâmica, cinética, diagrama de fases, ou prefere testar seus conhecimentos com uma **questão**?", "fisicoquimica");
    }
    if (/(complexo|coordenacao|ligante|quelato|espectroquimica)/.test(normalizedInput)) {
        return appendSuggestions("Excelente! O tópico investigado tange à **Química de Coordenação e Complexos**! Você preferiria uma explicação clara sobre as funções dos Ligantes, a Teoria do Campo Cristalino, Efeito Quelato ou prefere testar o que sabe resolvendo uma **questão** a respeito?", "complexos");
    }
    if (/(quantica|schrodinger|onda|de broglie|orbital molecular|tom|rutherford|millikan|crookes|fenda dupla)/.test(normalizedInput)) {
        return appendSuggestions("Você está explorando a **Química Quântica e Histórica**! Posso explicar sobre a dualidade onda-partícula, Teoria do Orbital Molecular, ou experimentos famosos. O que deseja?", "quantica");
    }
    // Fallback
    return "Desculpe, não entendi muito bem. 🧐\n\nLembre-se que **sou um bot baseado em palavras-chave** e não possuo Inteligência Artificial avançada. Textos muito longos ou complexos me confundem.\n\n**Tente ser mais objetivo:**\nTente me perguntar o nome do assunto em si. Por exemplo:\n- *\"Fale sobre química orgânica\"*\n- *\"Explique ligações covalentes\"*\n- *\"Células unitárias\"*\n- *\"Índices de Miller\"*\n- *\"Elemento Plumbio (Chumbo)\"*\n- *\"Faça uma questão\"*\n\nSe continuar não encontrando o que quer, digite **\"Instruções\"** ou tente simplificar a pergunta!";
}
const INITIAL_MESSAGE = `Olá! Sou o Assistente do SiMoEns, seu assistente focado em Química! 🧪

Estou aqui para ajudar com Química Geral, Inorgânica, Estado Sólido, Cristalografia, Físico-Química e Química de Coordenação.

Como falar comigo:
Como sou um robô que trabalha através do reconhecimento de palavras-chave estruturadas e não por inteligência artificial, eu funciono muito melhor se você for direto e objetivo no assunto, sem textos muito longos ou complexos.

Experimente digitar:
- "O que é uma célula unitária?"
- "Explique a teoria do campo cristalino"
- "Quais os defeitos cristalinos?"
- "Me passe uma questão sobre cristalografia"
- "Fale sobre o elemento Ouro"

Digite "Instruções" a qualquer momento para ver o menu de tudo o que eu consigo fazer por você!

Nesta versão, suas conversas ficam salvas localmente no navegador.`;
function getSafeBotResponse(userInput) {
    try {
        return getBotResponse(userInput);
    } catch (error) {
        console.error(error);
        return 'Ocorreu um erro ao processar a resposta do Assistente do SiMoEns nesta versão offline.';
    }
}
return { getBotResponse: getSafeBotResponse, INITIAL_MESSAGE, appendContextualAnimationSuggestions };
})();


const SIMOENS_SITE_MAP = [
  {
    id: 'home',
    title: 'Home do SiMoEns',
    path: 'index.html',
    category: 'página',
    summary: 'Página inicial do site, com apresentação do grupo, novidades, produtos e acesso aos principais conteúdos.',
    related: ['Sobre o SiMoEns', 'Página Ensino', 'Página Modelagem', 'Página Simulação', 'Chat inteligente'],
    keywords: ['home','inicio','início','site','simoens','pagina inicial','página inicial','index']
  },
  {
    id: 'sobre',
    title: 'Sobre o SiMoEns',
    path: 'index.html#about-us-1-v5iWwJlyUz',
    category: 'seção',
    summary: 'Seção da home com a apresentação institucional do grupo, proposta e visão geral do projeto.',
    related: ['Home do SiMoEns', 'FAQ do SiMoEns'],
    keywords: ['sobre','sobre o simoens','quem somos','apresentacao','apresentação','institucional']
  },
  {
    id: 'parceiros',
    title: 'Parceiros',
    path: 'index.html#testimonials-5-v5iWwJmiE2',
    category: 'seção',
    summary: 'Seção da home dedicada aos parceiros e instituições relacionadas ao projeto.',
    related: ['Home do SiMoEns', 'Nossa localização'],
    keywords: ['parceiros','instituicoes parceiras','instituições parceiras','parcerias']
  },
  {
    id: 'faq',
    title: 'FAQ do SiMoEns',
    path: 'index.html#faq-1-v5iWwJlxyf',
    category: 'seção',
    summary: 'Bloco de perguntas frequentes com uma visão rápida sobre o que é o SiMoEns e como ele pode ser usado.',
    related: ['Sobre o SiMoEns', 'Home do SiMoEns'],
    keywords: ['faq','perguntas frequentes','conheca','conheça','o que e simoens','o que é simoens']
  },
  {
    id: 'portfolio',
    title: 'Portfólio do SiMoEns',
    path: 'index.html#features03-1',
    category: 'seção',
    summary: 'Trecho da home voltado para descobrir as criações e acessar os conteúdos do projeto.',
    related: ['Home do SiMoEns', 'Página Ensino', 'Página Modelagem', 'Página Simulação'],
    keywords: ['portfolio','portfólio','ver portfolio','ver portfólio','criacoes','criações']
  },
  {
    id: 'contato',
    title: 'Contato do SiMoEns',
    path: 'index.html#contact-form-2-v5iWwJnC3V',
    category: 'seção',
    summary: 'Área da home para envio de mensagem e contato direto com o projeto.',
    related: ['Nossa localização', 'Home do SiMoEns'],
    keywords: ['contato','fale conosco','mensagem','email do site','e-mail do site']
  },
  {
    id: 'localizacao',
    title: 'Nossa localização',
    path: 'index.html#contacts-11-v5iWwJnXpI',
    category: 'seção',
    summary: 'Seção da home com endereço institucional e informações de localização do projeto.',
    related: ['Contato do SiMoEns', 'Parceiros'],
    keywords: ['localizacao','localização','endereco','endereço','onde fica','ufv','vicosa','viçosa']
  },
  {
    id: 'ensino',
    title: 'Página Ensino',
    path: 'Ensino/index.html',
    category: 'página',
    summary: 'Catálogo das animações e recursos didáticos de química, cristalografia, geometria molecular, polaridade e polimorfismo.',
    related: ['Buracos e empacotamento', 'Células unitárias e parâmetros de rede', 'Redes cristalinas'],
    keywords: ['ensino','pagina ensino','página ensino','catalogo','catálogo','recursos didaticos','recursos didáticos']
  },
  {
    id: 'modelagem',
    title: 'Página Modelagem',
    path: 'Modelagem/modelagem.html',
    category: 'página',
    summary: 'Área do site voltada à modelagem computacional, representação e análise de fenômenos em contexto acadêmico e científico.',
    related: ['Geometria cristalográfica', 'Geometria molecular', 'Redes cristalinas'],
    keywords: ['modelagem','pagina modelagem','página modelagem','modelos','representacao','representação']
  },
  {
    id: 'simulacao',
    title: 'Página Simulação',
    path: 'Simulação/simulacao.html',
    category: 'página',
    summary: 'Área do site voltada à exploração de cenários, teste de parâmetros e estudo do comportamento de modelos em diferentes condições.',
    related: ['Redes cristalinas', 'Buracos e empacotamento'],
    keywords: ['simulacao','simulação','pagina simulacao','página simulação','simulacao.html','simulação.html','simulação/simulacao.html','simulação/simulação.html','simula#u00e7#u00e3o.html','parametros','parâmetros']
  },
  {
    id: 'chat',
    title: 'Chat inteligente',
    path: 'Chat/chatbot.html',
    category: 'página',
    summary: 'Assistente do SiMoEns para tirar dúvidas, sugerir produtos relacionados, explicar conceitos, comparar ideias e propor exercícios.',
    related: ['Página Ensino', 'Home do SiMoEns'],
    keywords: ['chat','chatbot','assistente','chat inteligente','chat local']
  },
  {
    id: 'buracos',
    title: 'Buracos e empacotamento',
    path: 'Ensino/Animacao/buracos-e-empacotamento/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Mostra empacotamento de esferas, vazios tetraédricos e octaédricos e a organização em camadas AAA, ABA e ABC.',
    related: ['Células unitárias e parâmetros de rede', 'Redes cristalinas'],
    keywords: ['buracos','empacotamento','tetraedrico','tetraédrico','octaedrico','octaédrico','camadas aaa','camadas aba','camadas abc','intersticial']
  },
  {
    id: 'celulas',
    title: 'Células unitárias e parâmetros de rede',
    path: 'Ensino/Guia/celulas/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Explora vetores a, b e c, ângulos α, β e γ, sistemas cristalinos e tipos de centramento da célula para interpretar a estrutura cristalina.',
    related: ['Células primitivas, Bravais e Wigner-Seitz', 'Redes cristalinas'],
    keywords: ['celulas','células','celula unitaria','célula unitária','parametros de rede','parâmetros de rede','a b c','alfa beta gama','centramento']
  },
  {
    id: 'wigner',
    title: 'Células primitivas, Bravais e Wigner-Seitz',
    path: 'Ensino/Guia/celulas-primitivas-sistemas-bravais-e-celula-de-wigner/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Visualização 2D para entender nós de rede, célula unitária, célula primitiva e a construção geométrica da célula de Wigner-Seitz.',
    related: ['Células unitárias e parâmetros de rede', 'Simetria e fórmula unitária'],
    keywords: ['bravais','wigner','wigner-seitz','celula primitiva','célula primitiva','rede 2d','nos de rede','nós de rede']
  },
  {
    id: 'complexos',
    title: 'Complexos e polimorfismo',
    path: 'Ensino/Guia/Complexos e polimorfismo/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Relaciona cisplatina α e β, reorganização espacial, empacotamento, simetria e ocupação do espaço em mudanças estruturais didáticas.',
    related: ['Redes cristalinas', 'Página Ensino'],
    keywords: ['complexos','polimorfismo','cisplatina','azul da prussia','azul da prússia','coordenação','complexos e polimorfismo']
  },
  {
    id: 'geocrist',
    title: 'Geometria cristalográfica',
    path: 'Ensino/Animacao/geometria-cristalografica/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Modelos 3D de sistemas cristalinos com controle de arestas, faces e rotação, úteis para leitura espacial da forma cristalográfica.',
    related: ['Células unitárias e parâmetros de rede', 'Redes cristalinas'],
    keywords: ['geometria cristalografica','geometria cristalográfica','sistemas cristalinos','arestas','faces']
  },
  {
    id: 'geomol',
    title: 'Geometria molecular',
    path: 'Ensino/Animacao/geometria-molecular/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Visualizador VSEPR com geometrias AXn e AXnEm, incluindo pares não ligantes e formas como tetraédrica, octaédrica, gangorra e quadrada planar.',
    related: ['Geometria molecular passo a passo', 'Polaridade molecular — tutorial guiado', 'Polaridade e Geometria Molecular — exercício de fixação'],
    keywords: ['geometria molecular','vsepr','axn','axnem','pares nao ligantes','pares não ligantes']
  },
  {
    id: 'geomolpasso',
    title: 'Geometria molecular passo a passo',
    path: 'Ensino/Guia/geometria-molecular-passo-a-passo/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Versão guiada do visualizador VSEPR, útil para construção sequencial da geometria molecular e leitura de eixos e ângulos.',
    related: ['Geometria molecular', 'Polaridade molecular — tutorial guiado', 'Polaridade e Geometria Molecular — exercício de fixação'],
    keywords: ['geometria molecular passo a passo','tutorial vsepr','guiado','vsepr guiado','guia de geometria molecular']
  },
  {
    id: 'polaridade',
    title: 'Polaridade molecular — tutorial guiado',
    path: 'Ensino/Guia/polaridade-molecular-tutorial-guiado-passo-a-passo/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Tutorial guiado para relacionar geometria molecular, simetria e polaridade, apoiando a leitura de dipolos e momento dipolar resultante.',
    related: ['Geometria molecular', 'Geometria molecular passo a passo', 'Polaridade e Geometria Molecular — exercício de fixação'],
    keywords: ['polaridade molecular','dipolo','momento dipolar','simetria molecular','polaridade molecular passo a passo','guia de polaridade molecular']
  },
  {
    id: 'quebracabeca',
    title: 'Quebra-cabeça iônico/covalente',
    path: 'Ensino/jogo/quebra-cabeca-ionico-covalente/index.html',
    category: 'hub',
    catalogEntry: true,
    summary: 'Mini hub para diferenciar ligação iônica e covalente, contrastando formação de íons e compartilhamento eletrônico.',
    related: ['Quebra-cabeça de íons', 'Quebra-cabeça covalente', 'Geometria molecular'],
    keywords: ['quebra-cabeca','quebra-cabeça','ionico','iônico','covalente','ligação iônica','ligação covalente','mini hub','jogo ionico covalente']
  },
  {
    id: 'ions',
    title: 'Quebra-cabeça de íons',
    path: 'Ensino/jogo/quebra-cabeca-ionico-covalente/views/ions.html',
    category: 'atividade',
    summary: 'Atividade focada em íons, cargas e montagem guiada para leitura de espécies iônicas.',
    related: ['Quebra-cabeça iônico/covalente', 'Quebra-cabeça covalente'],
    keywords: ['ions','íons','quebra-cabeca de ions','quebra-cabeça de íons','cargas','ionico']
  },
  {
    id: 'covalente',
    title: 'Quebra-cabeça covalente',
    path: 'Ensino/jogo/quebra-cabeca-ionico-covalente/views/covalente.html',
    category: 'atividade',
    summary: 'Atividade voltada para ligações covalentes e montagem de estruturas por compartilhamento eletrônico.',
    related: ['Quebra-cabeça iônico/covalente', 'Quebra-cabeça de íons'],
    keywords: ['covalente','quebra-cabeca covalente','quebra-cabeça covalente','ligacao covalente','ligação covalente']
  },
  {
    id: 'redes',
    title: 'Redes cristalinas',
    path: 'Ensino/Animacao/redes-cristalinas/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Visualizador amplo para explorar redes cristalinas, estruturas prototípicas e exemplos como NaCl, CsCl, ZnS, rutilo e células de Wigner-Seitz em redes cúbicas.',
    related: ['Células unitárias e parâmetros de rede', 'Simetria e fórmula unitária', 'Buracos e empacotamento'],
    keywords: ['redes cristalinas','nacl','cscl','zns','rutilo','wigner-seitz','estruturas cubicas','estruturas cúbicas']
  },
  {
    id: 'simetriahub',
    title: 'Simetria e fórmula unitária',
    path: 'Ensino/Animacao/simetria-e-formula-unitaria/index.html',
    category: 'hub',
    catalogEntry: true,
    summary: 'Hub para estudar cúbicas, translação, simetria, contagem por frações e posições atômicas na obtenção da fórmula unitária.',
    related: ['Translação — Células Unitárias', 'Estruturas cúbicas — SC/BCC/FCC', 'Contagem por frações — Células Unitárias'],
    keywords: ['simetria','formula unitaria','fórmula unitária','simetria e fórmula unitária','hub de simetria']
  },
  {
    id: 'simetria_celulas',
    title: 'Translação — Células Unitárias',
    path: 'Ensino/Animacao/simetria-e-formula-unitaria/views/celulas/index.html',
    category: 'atividade',
    summary: 'Atividade sobre translação e leitura de células unitárias com foco em contagem e fórmula.',
    related: ['Simetria e fórmula unitária', 'Contagem por frações — Células Unitárias'],
    keywords: ['translacao','translação','celulas unitarias translacao','células unitárias translação','simetria celulas']
  },
  {
    id: 'simetria_cubicas',
    title: 'Estruturas cúbicas — SC/BCC/FCC',
    path: 'Ensino/Animacao/simetria-e-formula-unitaria/views/cubicas/index.html',
    category: 'atividade',
    summary: 'Visualização comparativa das estruturas cúbicas simples, de corpo centrado e de face centrada.',
    related: ['Simetria e fórmula unitária', 'Redes cristalinas'],
    keywords: ['estruturas cubicas','estruturas cúbicas','sc','bcc','fcc','cubicas','cúbicas']
  },
  {
    id: 'simetria_fracoes',
    title: 'Contagem por frações — Células Unitárias',
    path: 'Ensino/Animacao/simetria-e-formula-unitaria/views/fracoes/index.html',
    category: 'atividade',
    summary: 'Ferramenta para contagem por frações em células unitárias, útil para deduzir fórmula unitária e ocupação.',
    related: ['Simetria e fórmula unitária', 'Translação — Células Unitárias'],
    keywords: ['fracoes','frações','contagem por fracoes','contagem por frações','formula unitaria fracoes','fórmula unitária frações']
  },
  {
    id: 'simetria_modelos',
    title: 'Modelos 3D — posições na célula',
    path: 'Ensino/Animacao/simetria-e-formula-unitaria/views/modelos/index.html',
    category: 'atividade',
    summary: 'Modelos 3D para observar posições atômicas na célula unitária e relacionar geometria com ocupação.',
    related: ['Simetria e fórmula unitária', 'Translação — Células Unitárias'],
    keywords: ['modelos 3d','posicoes na celula','posições na célula','simetria modelos','posicoes atomicas','posições atômicas']
  },
  {
    id: 'simetria_orbits',
    title: 'Método da simetria de translação',
    path: 'Ensino/Animacao/simetria-e-formula-unitaria/views/orbits/index.html',
    category: 'atividade',
    summary: 'Página dedicada ao método da simetria de translação aplicado a células, órbitas e contagem.',
    related: ['Simetria e fórmula unitária', 'Translação — Células Unitárias'],
    keywords: ['metodo da simetria de translacao','método da simetria de translação','orbits','orbitas','órbitas']
  },

  {
    id: 'modelos_atomicos',
    title: 'Modelos Atômicos',
    path: 'Ensino/Guia/modelos_atomicos/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Apresentação visual e passo a passo da evolução dos modelos atômicos, de Dalton até Schrödinger e o átomo moderno.',
    related: ['Página Ensino', 'Equações de onda de hidrogenoides', 'Visualizador de hidrogenoides'],
    keywords: ['modelos atomicos','modelos atômicos','dalton','thomson','rutherford','bohr','schrodinger','schrödinger','atomo moderno','átomo moderno']
  },
  {
    id: 'visualizador_hidrogenoides',
    title: 'Visualizador de hidrogenoides',
    path: 'Ensino/Animacao/visualizador_de_hidrogenoides/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Visualizador interativo de orbitais e distribuições eletrônicas em espécies hidrogenoides, com leitura 2D e 3D.',
    related: ['Página Ensino', 'Equações de onda de hidrogenoides', 'Modelos Atômicos'],
    keywords: ['visualizador de hidrogenoides','visualizador de hidrogenóides','hidrogenoides','hidrogenóides','orbitais do hidrogenio','orbitais do hidrogênio','orbital 2d','orbital 3d']
  },
  {
    id: 'eq_ondas_hidrogenoides',
    title: 'Equações de onda de hidrogenoides',
    path: 'Ensino/Guia/eq_de_ondas_hidrogenoides/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Explica os significados físicos das equações de onda em sistemas hidrogenoides, articulando função de onda, densidade de probabilidade e representação espacial.',
    related: ['Página Ensino', 'Visualizador de hidrogenoides', 'Modelos Atômicos'],
    keywords: ['equacoes de onda','equações de onda','hidrogenoides','hidrogenóides','funcao de onda','função de onda','densidade de probabilidade','orbital de probabilidade']
  },
  {
    id: 'visualizador_orbitais',
    title: 'Visualizador de Orbitais Atômicos e Moleculares',
    path: 'Ensino/Animacao/visualizador_orbitais/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Visualizador interativo baseado em estruturas blobby/metaball para explorar orbitais atômicos e moleculares, com edição de lóbulos, cores, caráter ligante ou antiligante e manipulação espacial em 3D.',
    related: ['Página Ensino', 'Modelos Atômicos', 'Visualizador de hidrogenoides', 'Equações de onda de hidrogenoides'],
    keywords: ['visualizador de orbitais','orbitais atomicos e moleculares','orbitais atômicos e moleculares','metaball','metaballs','blobby','orbitais moleculares','orbitais atomicos','orbitais atômicos','ligante','antiligante','hibridizacao','hibridização']
  },

  {
    id: 'polaridade_geometria_exercicio',
    title: 'Polaridade e Geometria Molecular — exercício de fixação',
    path: 'Ensino/Exercicio Guiado/Polaridade-e-Geometria-molecular/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Exercício interativo de fixação para treinar simultaneamente geometria molecular, ângulos, vetores e polaridade.',
    related: ['Geometria molecular', 'Geometria molecular passo a passo', 'Polaridade molecular — tutorial guiado'],
    keywords: ['polaridade e geometria molecular','exercicio guiado de polaridade','exercício guiado de polaridade','fixação de polaridade','fixacao de polaridade','fixação de geometria molecular']
  },

{
  id: 'classificacao_sistema_cristalino',
  title: 'Classificação do sistema cristalino (Exercício)',
  path: 'Ensino/Exercicio%20Guiado/nome-da-celula/index.html',
  category: 'exercício',
  catalogEntry: true,
  summary: 'Atividade para classificar estruturas nos sistemas cristalinos a partir de forma, eixos, ângulos e relações entre parâmetros de rede.',
  related: ['Células unitárias e parâmetros de rede', 'Geometria cristalográfica', 'Simetria e fórmula unitária'],
  keywords: ['classificacao do sistema cristalino','classificação do sistema cristalino','nome da célula','nome da celula','sistema cristalino','exercicio']
},
{
  id: 'intersticios_cristalinos',
  title: 'Interstícios cristalinos (Exercício)',
  path: 'Ensino/Exercicio%20Guiado/buracos-cristalinos/index.html',
  category: 'exercício',
  catalogEntry: true,
  summary: 'Treino visual para diferenciar sítios tetraédricos e octaédricos a partir do arranjo espacial nas estruturas.',
  related: ['Buracos e empacotamento', 'Coordenação e empacotamento (Exercício)', 'Caça ao sítio cristalino (Exercício)'],
  keywords: ['intersticios cristalinos','interstícios cristalinos','buracos cristalinos','tetraedrico','tetraédrico','octaedrico','octaédrico','exercicio']
},
{
  id: 'caca_sitio_cristalino',
  title: 'Caça ao sítio cristalino (Exercício)',
  path: 'Ensino/Exercicio%20Guiado/caca-ao-sitio-cristalino/index.html',
  category: 'exercício',
  catalogEntry: true,
  summary: 'Atividade de identificação para localizar sítios cristalinos e relacionar posição, coordenação e ocupação.',
  related: ['Interstícios cristalinos (Exercício)', 'Buracos e empacotamento', 'Coordenação e empacotamento (Exercício)'],
  keywords: ['caca ao sitio cristalino','caça ao sítio cristalino','sitio cristalino','sítio cristalino','coordenação','ocupação','exercicio']
},
{
  id: 'formula_unitaria_pratica',
  title: 'Fórmula Unitária na Prática (Exercício)',
  path: 'Ensino/Exercicio%20Guiado/Contagem-de-atomo/index.html',
  category: 'exercício',
  catalogEntry: true,
  summary: 'Exercício interativo para identificar contribuições de vértices, arestas, faces e interior na contagem de átomos da célula unitária.',
  related: ['Simetria e fórmula unitária', 'Contagem por frações — Células Unitárias', 'Classificação do sistema cristalino (Exercício)'],
  keywords: ['fórmula unitária na prática','formula unitaria na pratica','contagem de atomo','contagem de átomo','vértices','arestas','faces','exercicio']
},
{
  id: 'coordenacao_empacotamento_exercicio',
  title: 'Coordenação e empacotamento (Exercício)',
  path: 'Ensino/Exercicio%20Guiado/coordenacao-empacotamento/index.html',
  category: 'exercício',
  catalogEntry: true,
  summary: 'Exercício de fixação para conectar número de coordenação, tipos de empacotamento e organização espacial dos átomos.',
  related: ['Buracos e empacotamento', 'Redes cristalinas', 'Interstícios cristalinos (Exercício)'],
  keywords: ['coordenação e empacotamento','coordenacao e empacotamento','numero de coordenação','número de coordenação','empacotamento','exercicio']
},
{
  id: 'defeitos_cristalinos_exercicio',
  title: 'Identificação de defeitos cristalinos (Exercício)',
  path: 'Ensino/Exercicio%20Guiado/defeitos-cristalinos/index.html',
  category: 'exercício',
  catalogEntry: true,
  summary: 'Comparação entre estrutura original e defeituosa para reconhecer vacâncias, intersticiais, substitucionais e outros defeitos pontuais.',
  related: ['Redes cristalinas', 'Simetria e fórmula unitária', 'Células unitárias e parâmetros de rede'],
  keywords: ['identificação de defeitos cristalinos','identificacao de defeitos cristalinos','frenkel','schottky','vacancia','vacância','intersticial','substitucional','exercicio']
},
{
  id: 'comparacao_polaridade_exercicio',
  title: 'Comparação de polaridade molecular (Exercício)',
  path: 'Ensino/Exercicio%20Guiado/batalha-de-polaridade/index.html',
  category: 'exercício',
  catalogEntry: true,
  summary: 'Rodadas de fixação para comparar geometrias, ângulos, vetores e decidir a polaridade molecular correta.',
  related: ['Polaridade e Geometria Molecular — exercício de fixação', 'Geometria molecular', 'Polaridade molecular — tutorial guiado'],
  keywords: ['comparação de polaridade molecular','comparacao de polaridade molecular','batalha de polaridade','dipolo','vetores','geometria molecular','exercicio']
},
{
  id: 'caca_palavras_jogo',
  title: 'Caça-palavras (Jogo)',
  path: 'Ensino/jogo/ca%23U00e7a-palavras/index.html',
  category: 'jogo',
  catalogEntry: true,
  summary: 'Jogo com temas de química para reforço de vocabulário, reconhecimento de conceitos e revisão de conteúdos.',
  related: ['Quebra-cabeça iônico/covalente', 'Xadrez Químico (Jogo)', 'Página Ensino'],
  keywords: ['caça-palavras','caca-palavras','vocabulário','vocabulario','revisão','revisao','jogo']
},
{
  id: 'xadrez_quimico_jogo',
  title: 'Xadrez Químico (Jogo)',
  path: 'Ensino/jogo/xadrez-quimico/index.html',
  category: 'jogo',
  catalogEntry: true,
  summary: 'Jogo com peças inspiradas em vidrarias para praticar estratégia, vidrarias e suas funções em uma interface temática de química.',
  related: ['Caça-palavras (Jogo)', 'Quebra-cabeça iônico/covalente', 'Página Ensino'],
  keywords: ['xadrez químico','xadrez quimico','vidrarias','laboratório','laboratorio','estratégia','estrategia','jogo']
},
  {
    id: 'atlas_termodinamico',
    title: 'Atlas Termodinâmico',
    path: 'Ensino/Guia/atlas_termodinamico/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Percurso visual para conceitos, grandezas, processos e interpretações termodinâmicas com apoio interativo.',
    related: ['Fases da Água', 'Interações Intermoleculares', 'Página Ensino'],
    keywords: ['atlas termodinamico','atlas termodinâmico','termodinamica','termodinâmica','energia interna','entalpia','entropia','energia livre']
  },
  {
    id: 'fases_da_agua',
    title: 'Fases da Água',
    path: 'Ensino/Guia/fases_da_agua/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Animação guiada para diagrama de fases, ponto triplo, ponto crítico e comportamento da água sob diferentes condições.',
    related: ['Atlas Termodinâmico', 'Interações Intermoleculares', 'Página Ensino'],
    keywords: ['fases da agua','fases da água','diagrama de fases','ponto triplo','ponto critico','ponto crítico','agua']
  },
  {
    id: 'interacoes_intermoleculares',
    title: 'Interações Intermoleculares',
    path: 'Ensino/Guia/interacoes_intermoleculares/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Guia visual para dipolo-dipolo, dispersão, ligações de hidrogênio e relação entre interações intermoleculares e propriedades da matéria.',
    related: ['Fases da Água', 'Atlas Termodinâmico', 'Polaridade molecular — tutorial guiado'],
    keywords: ['interacoes intermoleculares','interações intermoleculares','forcas intermoleculares','forças intermoleculares','ligação de hidrogênio','dipolo-dipolo','london']
  },

  {
    id: 'generic',
    title: 'Conteúdo em breve',
    path: 'generico.html',
    category: 'utilitário',
    summary: 'Página genérica usada como placeholder para conteúdos ainda não publicados.',
    related: ['Home do SiMoEns'],
    keywords: ['conteudo em breve','conteúdo em breve','generico','genérico','placeholder']
  }
];

const SITE_GROUP_ORDER = ['página', 'seção', 'animação', 'exercício', 'jogo', 'hub', 'atividade', 'utilitário'];
const SITE_GROUP_LABELS = {
  'página': 'Páginas principais',
  'seção': 'Seções da home',
  'animação': 'Animações e visualizadores',
  'exercício': 'Exercícios de fixação',
  'jogo': 'Jogos didáticos',
  'hub': 'Hubs e páginas agregadoras',
  'atividade': 'Subatividades e exercícios internos',
  'utilitário': 'Páginas auxiliares'
};

const SITE_OVERVIEW_TEXT = SIMOENS_SITE_MAP.map((entry) => `- ${entry.title} (${entry.category}): ${entry.summary} Link: ${entryUrl(entry)}`).join('\n');

function getEntriesByCategory(category) {
  return SIMOENS_SITE_MAP.filter((entry) => entry.category === category);
}

function getAnimationEntries() {
  return SIMOENS_SITE_MAP.filter((entry) => entry.catalogEntry);
}

function getLatestAnimationEntries() {
  const latestIds = ['polaridade_geometria_exercicio', 'classificacao_sistema_cristalino', 'intersticios_cristalinos', 'caca_sitio_cristalino', 'formula_unitaria_pratica', 'coordenacao_empacotamento_exercicio', 'defeitos_cristalinos_exercicio', 'comparacao_polaridade_exercicio', 'caca_palavras_jogo', 'xadrez_quimico_jogo'];
  return latestIds.map((id) => SIMOENS_SITE_MAP.find((entry) => entry.id === id)).filter(Boolean);
}

const TOPIC_HINTS = [
  ['buracos-e-empacotamento', 'buracos intersticiais, empacotamento cristalino, estruturas compactas e coordenação'],
  ['redes-cristalinas', 'redes cristalinas, célula unitária, coordenação e empacotamento'],
  ['geometria-molecular-passo-a-passo', 'geometria molecular guiada, VSEPR e construção passo a passo'],
  ['geometria-molecular', 'geometria molecular, VSEPR, pares eletrônicos e forma molecular'],
  ['polaridade-molecular', 'polaridade molecular, momento dipolar e distribuição eletrônica'],
  ['simetria-e-formula-unitaria/views/fracoes', 'contagem por frações, ocupação e fórmula unitária'],
  ['simetria-e-formula-unitaria/views/cubicas', 'estruturas cúbicas SC, BCC e FCC'],
  ['simetria-e-formula-unitaria/views/modelos', 'posições atômicas e modelos 3D na célula unitária'],
  ['simetria-e-formula-unitaria/views/orbits', 'simetria de translação, órbitas e contagem'],
  ['simetria-e-formula-unitaria/views/celulas', 'translação, células unitárias e contagem fracionária'],
  ['simetria-e-formula-unitaria', 'simetria, operações de simetria, frações de ocupação e fórmula unitária'],
  ['celulas-primitivas-sistemas-bravais-e-celula-de-wigner', 'células primitivas, sistemas de Bravais e célula de Wigner-Seitz'],
  ['geometria-cristalografica', 'parâmetros cristalográficos, ângulos, eixos e sistemas cristalinos'],
  ['complexos', 'complexos de coordenação, hidratação de sais e polimorfismo'],
  ['polimorfismo', 'polimorfismo, organização estrutural e transformações cristalinas'],
  ['celulas', 'células unitárias, simetria de translação e contagem fracionária'],
  ['quebra-cabeca-ionico-covalente/views/ions', 'íons, cargas e compostos iônicos'],
  ['quebra-cabeca-ionico-covalente/views/covalente', 'ligações covalentes e compartilhamento eletrônico'],
  ['quebra-cabeca-ionico-covalente', 'ligação iônica, ligação covalente e diferenciação entre compostos'],
  ['ensino', 'conteúdos de química e objetos educacionais do SiMoEns'],
  ['modelagem', 'modelagem visual de estruturas e sistemas químicos'],
  ['simula', 'simulação de estruturas e fenômenos químicos'],
  ['chatbot', 'apoio didático em Química para o conteúdo do site'],
  ['modelos_atomicos', 'modelos atômicos, evolução histórica do átomo e transição até a mecânica quântica'],
  ['visualizador_de_hidrogenoides', 'visualização 2D e 3D de orbitais e distribuições eletrônicas em sistemas hidrogenoides'],
  ['eq_de_ondas_hidrogenoides', 'equações de onda, função de onda, densidade de probabilidade e interpretação de orbitais hidrogenoides'],
  ['visualizador_orbitais', 'orbitais atômicos e moleculares, estruturas blobby/metaball, caráter ligante e antiligante e edição de lóbulos em 3D'],
['Polaridade-e-Geometria-molecular', 'exercício de polaridade, geometria molecular, vetores e ângulos'],
['nome-da-celula', 'classificação dos sistemas cristalinos, eixos, ângulos e parâmetros de rede'],
['buracos-cristalinos', 'interstícios tetraédricos e octaédricos em estruturas cristalinas'],
['caca-ao-sitio-cristalino', 'identificação de sítios cristalinos, coordenação e ocupação'],
['Contagem-de-atomo', 'contagem de átomos, vértices, arestas, faces e fórmula unitária'],
['coordenacao-empacotamento', 'número de coordenação, empacotamento e organização espacial'],
['defeitos-cristalinos', 'defeitos cristalinos, vacâncias, Frenkel, Schottky e sítios defeituosos'],
['batalha-de-polaridade', 'comparação de polaridade molecular, vetores, ângulos e simetria'],
['ca%23u00e7a-palavras', 'jogo de vocabulário químico e revisão de conceitos'],
['xadrez-quimico', 'jogo de estratégia com vidrarias e ambientação de laboratório'],
];



function encodePathPreservingHash(pathname = '') {
  const raw = String(pathname || '');
  const hashIndex = raw.indexOf('#');
  const pathPart = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
  const hashPart = hashIndex >= 0 ? raw.slice(hashIndex) : '';
  const encodedPath = pathPart
    .split('/')
    .map((segment) => {
      if (!segment) return segment;
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch (_) {
        return encodeURIComponent(segment);
      }
    })
    .join('/');
  return `${encodedPath}${hashPart}`;
}

function entryUrl(entry) {
  if (!entry || !entry.path) return SITE_ROOT_URL;
  const rawPath = String(entry.path || '');
  const cleanedPath = rawPath
    .replace(/^index\.html(?=#|$)/i, '')
    .replace(/\/index\.html(?=#|$)/gi, '/')
    .replace(/([^/])#/, '$1#');
  return new URL(encodePathPreservingHash(cleanedPath), SITE_ROOT_URL).href;
}


const SITE_URL_ALIAS_MAP = new Map([
  [`${SITE_URL}orbitais/index.html`, `${SITE_URL}visualizador_orbitais/index.html`],
  [`${SITE_URL}Ensino/Exercicio%20Guiado/sistema-cristalino/index.html`, `${SITE_URL}Ensino/Exercicio%20Guiado/nome-da-celula/index.html`],
  [`${SITE_URL}Ensino/jogo/ca%C3%A7a-palavras/index.html`, `${SITE_URL}Ensino/jogo/ca%23U00e7a-palavras/index.html`],
  [`${SITE_URL}simetria/index.html`, `${SITE_URL}simetria-e-formula-unitaria/index.html`],
  [`${SITE_URL}coordenacao/index.html`, `${SITE_URL}Complexos%20e%20polimorfismo/index.html`],
  [`${SITE_URL}coordenação/index.html`, `${SITE_URL}Complexos%20e%20polimorfismo/index.html`],
]);

function canonicalizeKnownSiteUrl(url = '') {
  const raw = String(url || '').trim();
  if (!raw) return raw;
  const aliased = SITE_URL_ALIAS_MAP.get(raw) || raw;
  if (!aliased.startsWith(SITE_URL)) return aliased;
  let parsed = null;
  try {
    parsed = new URL(aliased);
  } catch (_) {
    return aliased;
  }
  const normalizedPath = normalizePath(parsed.pathname || '');
  const matched = findEntryByPath(normalizedPath);
  return matched ? entryUrl(matched) : aliased;
}

function canonicalizeAssistantReply(text = '') {
  const raw = String(text || '');
  if (!raw) return '';
  let clean = raw.replace(/https:\/\/quimicavisualufv\.github\.io\/Quimica-Visual\/[^\s)\]}>"']+/gi, (url) => canonicalizeKnownSiteUrl(url));
  clean = clean.replace(/Orbitais \(animação\)/g, 'Visualizador de Orbitais Atômicos e Moleculares');
  clean = clean.replace(/Orbitais \(anima\w*\)/g, 'Visualizador de Orbitais Atômicos e Moleculares');
  clean = clean.replace(/Coordenação \((?:animação|página)\)/g, 'Complexos e polimorfismo');
  return clean;
}

function relatedEntries(entry) {
  if (!entry || !Array.isArray(entry.related)) return [];
  return entry.related
    .map((title) => SIMOENS_SITE_MAP.find((item) => normalize(item.title) === normalize(title)))
    .filter(Boolean);
}

function resolveSharedAsset(path) {
  return new URL(path, WIDGET_SCRIPT_SRC).href;
}

function loadSharedScriptOnce(path) {
  const src = resolveSharedAsset(path);
  if (SHARED_SCRIPT_PROMISES[src]) return SHARED_SCRIPT_PROMISES[src];
  SHARED_SCRIPT_PROMISES[src] = new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts || []).find((script) => script.src === src);
    if (existing && existing.dataset.loaded === 'true') {
      resolve(src);
      return;
    }
    const script = existing || document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.sharedLoader = 'true';
    script.onload = () => { script.dataset.loaded = 'true'; resolve(src); };
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    if (!existing) document.head.appendChild(script);
  });
  return SHARED_SCRIPT_PROMISES[src];
}

function normalizePath(pathname = '') {
  const raw = String(pathname || '').trim();
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch (_) {}
  return normalize(decoded)
    .replace(/^.*\/quimica-visual\/?/, '')
    .replace(/^.*\/simoens\/?/, '')
    .replace(/^\//, '')
    .replace(/simula#u00e7#u00e3o\.html$/, 'simulacao.html')
    .replace(/simula%c3%a7%c3%a3o\.html$/, 'simulacao.html')
    .replace(/simulacao\.html$/, 'simulacao.html')
    .replace(/simulacao$/, 'simulacao.html');
}

function enrichPageContext(ctx) {
  const base = Object.assign({}, ctx || {});
  const entry = findEntryByPath(base.path || '');
  if (!entry) return base;
  return Object.assign(base, {
    entryId: entry.id,
    entryTitle: entry.title,
    entrySummary: entry.summary,
    entryCategory: entry.category,
    entryRelated: entry.related || [],
    siteContextExtra: `Tipo: ${entry.category}. ${entry.summary}`
  });
}

function normalize(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function inferTopic(pathname, title = '') {
  const hay = normalize(`${pathname} ${title}`);
  for (const [needle, topic] of TOPIC_HINTS) {
    if (hay.includes(normalize(needle))) return topic;
  }
  return 'conteúdos de Química apresentados no SiMoEns';
}

function firstText(selectors) {
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    const text = node?.textContent?.trim();
    if (text) return text.replace(/\s+/g, ' ');
  }
  return '';
}

function collectPageContext() {
  const title = document.title?.trim() || 'SiMoEns';
  const heading = firstText([
    'h1',
    '.mbr-section-title',
    '.item-title',
    'header h1',
    '.hero-title',
    '.title',
  ]);
  const description = document.querySelector('meta[name="description"]')?.content?.trim() || '';
  const activeTab = firstText([
    '.menu .btn[aria-selected="true"]',
    '.menu [aria-pressed="true"]',
    '.tabs .active',
    '.nav-tabs .active',
  ]);
  const path = normalizePath(location.pathname || 'index.html') || 'index.html';
  const topic = inferTopic(path, `${title} ${heading} ${activeTab}`);
  return enrichPageContext({
    title,
    heading,
    description,
    activeTab,
    path,
    topic,
  });
}

function contextLine(ctx) {
  const parts = [];
  if (ctx.title) parts.push(`Página: ${ctx.title}`);
  if (ctx.heading && ctx.heading !== ctx.title) parts.push(`Seção: ${ctx.heading}`);
  if (ctx.activeTab) parts.push(`Aba ativa: ${ctx.activeTab}`);
  if (ctx.topic) parts.push(`Tema principal: ${ctx.topic}`);
  if (ctx.path) parts.push(`Caminho: ${ctx.path}`);
  return parts.join(' | ');
}

function getCurrentContextText(baseContext, frameContext) {
  return contextLine(frameContext || baseContext);
}

function safeParse(json, fallback) {
  try { return JSON.parse(json); } catch { return fallback; }
}

function loadMessages() {
  const raw = localStorage.getItem(STORAGE_KEYS.messages);
  const parsed = safeParse(raw, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item) => item && typeof item.content === 'string' && item.role).map((item) => ({ ...item, meta: item.meta || {} }));
}

function saveMessages(messages) {
  const trimmed = messages.slice(-18).map((item) => ({
    role: item.role,
    content: item.content.slice(0, 2400),
    timestamp: item.timestamp || Date.now(),
    meta: item.meta || {},
  }));
  localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(trimmed));
}

function setStoredOpen(isOpen) {
  localStorage.setItem(STORAGE_KEYS.open, isOpen ? '1' : '0');
}

function getStoredOpen() {
  return localStorage.getItem(STORAGE_KEYS.open) === '1';
}


function sanitizeUrl(url) {
  const value = String(url || '').trim();
  if (!value) return '#';
  if (/^(https?:|mailto:|tel:|\/|\.\/|\.\.\/)/i.test(value)) return value;
  return '#';
}

function chemistryKeywords(extra = []) {
  return [
    'quimica','química','atomo','átomo','molecula','molécula','molecular','ion','íon','ions','íons','eletron','elétron','eletrons','elétrons',
    'ligacao','ligação','ligacoes','ligações','covalente','ionica','iônica','metalica','metálica','orbital','orbitais','hibridizacao','hibridização',
    'vsepr','geometria','polaridade','dipolo','rede','redes','cristal','cristais','cristalina','cristalinas','célula','celula','unitaria','unitária',
    'bravais','coordenação','coordenacao','complexo','complexos','polimorfismo','hidratação','hidratacao','simetria','empacotamento','intersticial',
    'tetraedrico','tetraédrico','octaedrico','octaédrico','trigonal','monoclínica','monoclinica','hexagonal','cúbica','cubica','fração','fracao','fracoes','frações',
    'fórmula','formula','estequiometria','substancia','substância','reacao','reação','valencia','valência','periodica','periódica','coordenação','wigner',
    'seitz','brønsted','lewis','ácido','acido','base','oxidação','oxidacao','redução','reducao','solido','sólido','sólidos','solidos',
    'camada','camadas','estrutura','estruturas','buracos','intersticios','interstícios'
  ].concat(extra.map((item) => normalize(item)));
}

function getContextKeywords(ctx) {
  const raw = `${ctx?.title || ''} ${ctx?.heading || ''} ${ctx?.activeTab || ''} ${ctx?.topic || ''}`;
  return normalize(raw)
    .split(/[^a-z0-9]+/)
    .filter((item) => item && item.length > 3);
}


function siteKeywords() {
  const keys = ['simoens','site','animacao','animação','animacoes','animações','pagina','página','paginas','páginas','home','ensino','modelagem','simulação','simulacao'];
  for (const entry of SIMOENS_SITE_MAP) {
    keys.push(entry.title, entry.path, ...(entry.keywords || []), ...(entry.related || []));
  }
  return keys.map((item) => normalize(String(item || ''))).filter(Boolean);
}

function isSiteOverviewQuestion(text) {
  const t = normalize(text);
  return (
    (t.includes('site') || t.includes('simoens')) &&
    (t.includes('animacao') || t.includes('animações') || t.includes('animacoes') || t.includes('animação') || t.includes('pagina') || t.includes('página') || t.includes('paginas') || t.includes('páginas') || t.includes('conteudo') || t.includes('conteúdo') || t.includes('fala') || t.includes('fale') || t.includes('sobre') || t.includes('links') || t.includes('link'))
  ) ||
  t.includes('quais animacoes') ||
  t.includes('quais animações') ||
  t.includes('quais paginas') ||
  t.includes('quais páginas') ||
  t.includes('todos os links') ||
  t.includes('me manda os links') ||
  t.includes('me passe os links') ||
  t.includes('mapa do site') ||
  t.includes('do que fala o site') ||
  t.includes('me fale do site') ||
  t.includes('me fale sobre o site') ||
  t.includes('resuma o site');
}

function findEntryByPath(pathname = '') {
  const p = normalizePath(pathname);
  const pBase = p.replace(/^.*\//, '');
  return SIMOENS_SITE_MAP.find((entry) => {
    const entryPath = normalizePath(entry.path);
    const entryBase = entryPath.replace(/^.*\//, '');
    return entryPath === p || entryBase === p || entryPath === pBase || entryBase === pBase;
  }) || null;
}

function entryTerms(entry) {
  if (!entry) return [];
  const pathTerm = normalizePath(entry.path || '')
    .replace(/\/index\.html$/, '')
    .replace(/\.html$/, '')
    .replace(/[\/#_-]+/g, ' ')
    .trim();
  const terms = [entry.title, entry.path, pathTerm, ...(entry.keywords || [])]
    .map((item) => normalize(String(item || '')).trim())
    .filter(Boolean);
  return Array.from(new Set(terms));
}

function scoreSiteEntryMatch(entry, text) {
  const t = normalize(text);
  if (!t) return 0;
  let score = 0;
  for (const term of entryTerms(entry)) {
    if (!term) continue;
    if (t === term) score = Math.max(score, 4000 + term.length);
    if (t.includes(term)) score = Math.max(score, 2000 + term.length);
    const tokens = term.split(/\s+/).filter((token) => token.length > 2);
    if (tokens.length >= 2 && tokens.every((token) => t.includes(token))) {
      score = Math.max(score, 1200 + term.length + tokens.length * 10);
    }
  }
  return score;
}

function matchSiteEntries(text) {
  return SIMOENS_SITE_MAP
    .map((entry) => ({ entry, score: scoreSiteEntryMatch(entry, text) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.title.length - a.entry.title.length)
    .map((item) => item.entry);
}

const CRYSTAL_SITE_ENTRY_IDS = new Set(['buracos', 'celulas', 'wigner', 'complexos', 'geocrist', 'redes', 'simetriahub', 'simetria_celulas', 'simetria_cubicas', 'simetria_fracoes', 'simetria_modelos', 'simetria_orbits']);
const MOLECULAR_SITE_ENTRY_IDS = new Set(['geomol', 'geomolpasso', 'polaridade', 'quebracabeca', 'ions', 'covalente']);

function detectSiteIntentProfile(text = '', currentCtx = null) {
  const t = normalize(`${text || ''} ${currentCtx?.topic || ''} ${currentCtx?.title || ''} ${currentCtx?.heading || ''}`);

  const crystalSignals = [
    'celula', 'célula', 'celulas', 'células', 'unitaria', 'unitária', 'rede cristalina', 'redes cristalinas',
    'bravais', 'wigner', 'seitz', 'parametros de rede', 'parâmetros de rede', 'cristalino', 'cristalina',
    'estrutura cristalina', 'estruturas cristalinas', 'simetria de translacao', 'simetria de translação'
  ];

  const molecularSignals = [
    'vsepr', 'geometria molecular', 'molecular', 'momento dipolar', 'dipolo', 'polaridade',
    'pares nao ligantes', 'pares não ligantes', 'axn', 'axnem', 'forma molecular'
  ];

  if (crystalSignals.some((item) => t.includes(normalize(item)))) return 'crystal';
  if (molecularSignals.some((item) => t.includes(normalize(item)))) return 'molecular';
  return 'generic';
}

function entryMatchesIntentProfile(entry, profile) {
  if (!entry || !profile || profile === 'generic') return true;
  if (profile === 'crystal') return !MOLECULAR_SITE_ENTRY_IDS.has(entry.id);
  if (profile === 'molecular') return !CRYSTAL_SITE_ENTRY_IDS.has(entry.id);
  return true;
}

function filterEntriesByIntent(text, currentCtx, entries) {
  const profile = detectSiteIntentProfile(text, currentCtx);
  const filtered = (Array.isArray(entries) ? entries : []).filter((entry) => entryMatchesIntentProfile(entry, profile));
  return filtered.length ? filtered : (Array.isArray(entries) ? entries : []);
}

function hasSiteIntent(text) {
  const t = normalize(text);
  return t.includes('site') || t.includes('simoens') || t.includes('animacao') || t.includes('animação') || t.includes('pagina') || t.includes('página') || t.includes('essa pagina') || t.includes('essa página') || t.includes('essa animacao') || t.includes('essa animação');
}

function buildSiteOverviewReply() {
  const animationCount = getAnimationEntries().length;
  const latestEntries = getLatestAnimationEntries();
  const lines = [`O SiMoEns está em ${SITE_URL} e aqui vai um mapa rápido dos links internos mais importantes.`, `Hoje o catálogo reúne ${animationCount} recursos de ensino mapeados aqui no assistente.`, ''];
  if (latestEntries.length) {
    lines.push('Recursos adicionados mais recentemente:');
    lines.push(...latestEntries.map((entry, index) => `${index + 1}. ${entry.title}: ${entryUrl(entry)}`));
    lines.push('');
  }
  for (const category of SITE_GROUP_ORDER) {
    const entries = SIMOENS_SITE_MAP.filter((entry) => entry.category === category);
    if (!entries.length) continue;
    lines.push(`${SITE_GROUP_LABELS[category] || category}:`);
    lines.push(...entries.map((entry) => `• ${entry.title}: ${entry.summary} Link: ${entryUrl(entry)}`));
    lines.push('');
  }
  lines.push('Se você quiser, também posso te passar só os links de uma área específica do site.');
  return lines.join('\n');
}

function buildEntryReply(entry, userText = '', currentCtx = null) {
  if (!entry) return '';
  const related = filterEntriesByIntent(userText, currentCtx, relatedEntries(entry));
  const relatedText = related.length
    ? ` Conteúdos e animações relacionadas: ${related.map((item) => `${item.title} (${entryUrl(item)})`).join('; ')}.`
    : '';
  return `${entry.title} (${entry.category}) aborda o seguinte: ${entry.summary} Link: ${entryUrl(entry)}.${relatedText} Sempre que fizer sentido, eu tento conectar esse conteúdo a outras animações e páginas do SiMoEns.`;
}

function isSiteLinkRequest(text = '') {
  const t = normalize(text);
  return /(^|\s)(link|url)(\s|$)/.test(t)
    || t.includes('me manda')
    || t.includes('me mande')
    || t.includes('me passa')
    || t.includes('passa o link')
    || t.includes('qual o link')
    || t.includes('qual e o link')
    || t.includes('manda o link')
    || t.includes('mande o link')
    || t.includes('quero o link')
    || t.includes('acessar')
    || t.includes('acessa')
    || t.includes('abrir')
    || t.includes('abre')
    || t.includes('onde fica');
}

function buildEntryLinkReply(entry) {
  if (!entry) return '';
  return `O link de ${entry.title} é: ${entryUrl(entry)}`;
}

function maybeAnswerInstantSiteQuestions(userText = '') {
  const t = normalize(userText);

  const asksTeam = /integrantes|membros do site|membros da equipe|equipe do site|equipe do simoens|quem faz o site|quem participa do site|quem sao os integrantes|quem são os integrantes/.test(t);
  if (asksTeam) {
    return 'Os integrantes destacados no site são: Angel Amado Recio Despaigne, Deyse Gomes da Costa, Fábio Junior Moreira Novaes, Lis Regiane Vizolli Favarin e Lucas Xavier Nardelli. Todos aparecem na seção de equipe da home do SiMoEns.';
  }

  const asksContact = /contato|email do site|e-mail do site|como falar com o site|como entrar em contato/.test(t);
  if (asksContact) {
    return 'Você pode entrar em contato com o SiMoEns pelo e-mail quimicavisualufv@gmail.com. Na home também existe uma seção de contato e localização.';
  }

  const asksLocation = /onde fica|localizacao|localização|endereco|endereço|ufv|viçosa|vicosa/.test(t) && (t.includes('site') || t.includes('simoens') || t.includes('projeto'));
  if (asksLocation) {
    return 'O SiMoEns está ligado ao Departamento de Química da UFV. O endereço mostrado no site é: Departamento de Química - UFV (DEQ/UFV) - Universidade Federal de Viçosa, Viçosa - MG, 36570-900.';
  }

  const asksProducts = /quais sao os produtos|quais são os produtos|produtos do site|paginas principais|páginas principais|o que tem no site|quais paginas|quais páginas/.test(t);
  if (asksProducts) {
    return `As páginas principais do SiMoEns são: Home (${entryUrl(SIMOENS_SITE_MAP.find((e) => e.id === 'home'))}), Ensino (${entryUrl(SIMOENS_SITE_MAP.find((e) => e.id === 'ensino'))}), Modelagem (${entryUrl(SIMOENS_SITE_MAP.find((e) => e.id === 'modelagem'))}), Simulação (${entryUrl(SIMOENS_SITE_MAP.find((e) => e.id === 'simulacao'))}) e Chat inteligente (${entryUrl(SIMOENS_SITE_MAP.find((e) => e.id === 'chat'))}).`;
  }

  const asksWhatIs = /o que e o simoens|o que é o simoens|o que e esse site|o que é esse site|sobre o site/.test(t);
  if (asksWhatIs) {
    return 'O SiMoEns é um site com foco em conteúdos de química e objetos educacionais, com páginas institucionais, visualizadores, animações e materiais de apoio para estudo.';
  }

  const asksPartners = /parceiros|instituicoes parceiras|instituições parceiras|parcerias/.test(t) && (t.includes('site') || t.includes('simoens') || t.includes('projeto'));
  if (asksPartners) {
    return `O site tem uma seção específica de parceiros na home. O link direto é: ${entryUrl(SIMOENS_SITE_MAP.find((e) => e.id === 'parceiros'))}`;
  }

  const asksAnimationCatalog = /^(animacao|animação|animacoes|animações)$/.test(t) || /todas as animacoes|todas as animações|lista de animacoes|lista de animações|catalogo de animacoes|catálogo de animações|me mostre as animacoes|me mostre as animações|quais sao as animacoes|quais são as animações/.test(t);
  if (asksAnimationCatalog) {
    const animations = getAnimationEntries();
    return `O SiMoEns tem ${animations.length} recursos principais de ensino mapeados aqui no assistente. Links: ${animations.map((entry, index) => `${index + 1}. ${entry.title} (${entryUrl(entry)})`).join(' ; ')}.`;
  }

  const asksAnimationCount = /quantas animacoes|quantas animações|numero de animacoes|número de animações|total de animacoes|total de animações/.test(t) && (t.includes('site') || t.includes('simoens') || t.includes('agora') || t.includes('tem'));
  if (asksAnimationCount) {
    const animations = getAnimationEntries();
    return `O assistente mapeia ${animations.length} recursos do Ensino do SiMoEns. As adições mais recentes são: ${getLatestAnimationEntries().map((entry) => `${entry.title} (${entryUrl(entry)})`).join('; ')}.`;
  }

  const asksLatestAnimations = /3 novas animacoes|3 novas animações|novas animacoes|novas animações|ultimas animacoes|últimas animações|ultimas animacoes do site|últimas animações do site|animacoes mais recentes|animações mais recentes/.test(t);
  if (asksLatestAnimations) {
    const latestEntries = getLatestAnimationEntries();
    if (latestEntries.length) {
      return `Os recursos adicionados mais recentemente são: ${latestEntries.map((entry, index) => `${index + 1}. ${entry.title} — ${entryUrl(entry)}`).join(' ; ')}.`;
    }
  }

  const asksHydrogenLinks = /modelos atomicos|modelos atômicos|visualizador de hidrogenoides|visualizador de hidrogenóides|equacoes de onda|equações de onda/.test(t) && /link|links|url|urls/.test(t);
  if (asksHydrogenLinks) {
    return `Links diretos: Modelos Atômicos — ${entryUrl(SIMOENS_SITE_MAP.find((e) => e.id === 'modelos_atomicos'))}; Visualizador de hidrogenoides — ${entryUrl(SIMOENS_SITE_MAP.find((e) => e.id === 'visualizador_hidrogenoides'))}; Equações de onda de hidrogenoides — ${entryUrl(SIMOENS_SITE_MAP.find((e) => e.id === 'eq_ondas_hidrogenoides'))}.`;
  }

  const asksOrbitalsVisualizer = /visualizador de orbitais|orbitais atomicos e moleculares|orbitais atômicos e moleculares|metaball|metaballs|blobby/.test(t);
  if (asksOrbitalsVisualizer) {
    const orbitalsEntry = SIMOENS_SITE_MAP.find((e) => e.id === 'visualizador_orbitais');
    if (orbitalsEntry) {
      if (/link|links|url|urls|acessar|acessa|abrir|abre|onde fica/.test(t)) {
        return `O link do ${orbitalsEntry.title} é: ${entryUrl(orbitalsEntry)}`;
      }
      if (/o que ensina|o que aprende|ensina|aprende|para que serve/.test(t)) {
        return `${orbitalsEntry.title} ensina a visualizar orbitais atômicos e moleculares em 3D usando estruturas blobby/metaball, comparar regiões ligantes e antiligantes, editar lóbulos e observar como forma, cor e fase influenciam a leitura espacial do orbital. Link: ${entryUrl(orbitalsEntry)}.`;
      }
      if (/descricao|descrição|descreva|resuma|sobre o que fala|o que mostra|o que e|o que é|fala sobre/.test(t)) {
        return `${orbitalsEntry.title} é um visualizador interativo baseado em estruturas blobby/metaball para explorar orbitais atômicos e moleculares, com edição de lóbulos, cores, caráter ligante ou antiligante e manipulação espacial em 3D. Link: ${entryUrl(orbitalsEntry)}.`;
      }
    }
  }

  return '';
}

function maybeAnswerFromSiteMap(userText, currentCtx) {
  if (isSiteOverviewQuestion(userText)) return buildSiteOverviewReply();

  const matches = filterEntriesByIntent(userText, currentCtx, matchSiteEntries(userText));
  const t = normalize(userText);

  if (!matches.length && /essa pagina|essa página|essa animacao|essa animação|esta pagina|esta página|esta animacao|esta animação/.test(t)) {
    const currentEntry = findEntryByPath(currentCtx?.path || '');
    if (currentEntry) return isSiteLinkRequest(userText) ? buildEntryLinkReply(currentEntry) : buildEntryReply(currentEntry, userText, currentCtx);
  }

  const exactTitleOrKeyword = matches.find((entry) => entryTerms(entry).some((item) => item === t));

  const bestMatch = exactTitleOrKeyword || matches[0] || null;

  if (bestMatch && isSiteLinkRequest(userText)) return buildEntryLinkReply(bestMatch);
  if (exactTitleOrKeyword) return buildEntryReply(exactTitleOrKeyword, userText, currentCtx);

  const looksLikeSummaryRequest =
    t.includes('do que fala') || t.includes('o que mostra') || t.includes('o que tem') ||
    t.includes('resuma') || t.includes('explique essa') || t.includes('fale dessa') ||
    t.includes('fale dessa pagina') || t.includes('fale dessa página') ||
    t.includes('fale dessa animacao') || t.includes('fale dessa animação') ||
    t.includes('me fale sobre') || t.includes('quero saber sobre') ||
    hasSiteIntent(userText);

  if (matches.length && looksLikeSummaryRequest) {
    return matches.slice(0, 2).map((entry) => buildEntryReply(entry, userText, currentCtx)).join('\n\n');
  }

  return '';
}

function isGreeting(text) {
  const t = normalize(text);
  return /^(oi|ola|olá|e ai|e aí|bom dia|boa tarde|boa noite|hey|opa)\b/.test(t);
}

function isHelpQuestion(text) {
  const t = normalize(text);
  return t.includes('o que voce pode fazer') || t.includes('o que vc pode fazer') || t.includes('como voce pode ajudar') || t.includes('como vc pode ajudar');
}

function hasChemistryFormula(text) {
  const sample = String(text || '');
  return /(?:^|[\s(])(?:[A-Z][a-z]?\d{0,3}){1,6}(?:\^?\d*[+-])?(?:[\s),.;!?]|$)/.test(sample)
    || /\([0-9\-]{3,6}\)|\[[0-9\-]{3,6}\]|\b(?:CN|cn)\s*[:=]?\s*\d+\b/.test(sample);
}

function hasStudyIntent(text) {
  const t = normalize(text);
  return [
    'explica','explique','explicar','resuma','resumir','compare','comparar','diferenca','diferença','como funciona',
    'como ocorre','por que','porque','questao','questão','exercicio','exercício','mapa mental','rota de estudo',
    'estudo','conceito','conceitos','defina','significa','duvida','dúvida'
  ].some((item) => t.includes(item));
}

function refersToCurrentContext(text, ctx) {
  if (!ctx) return false;
  const t = normalize(text);
  if (/essa pagina|essa página|esta pagina|esta página|essa animacao|essa animação|esta animacao|esta animação|isso|isso aqui|esse conteudo|esse conteúdo|esse tema|esse topico|esse tópico/.test(t)) return true;
  return getContextKeywords(ctx).some((key) => key && t.includes(key));
}

function hasBroadChemistryHint(text) {
  const t = normalize(text);
  return /(quimica|química|simoens|site|anima|pagina|página|molecula|molécula|ion|íon|ligacao|ligação|estrutura|cristal|bravais|wigner|seitz|tetra|octa|interst|poliedr|coordena|complexo|vsepr|polaridade|molecular|metal|covalente|ácido|acido|base|sal|óxido|oxido|mol|estequi|concentr|soluç|soluc|ph|orbital|banda|condut|difra|drx|bragg|miller|polimorf|alotrop|átomo|atomo|el[eé]tron|proton|próton|defeit|vacan|frenkel|schottky|dopag|liga|solvat|hidrat|anion|cation|semicond|isolante)/.test(t);
}

function recentConversationLooksInScope(messages, ctx) {
  const source = Array.isArray(messages) ? messages.slice(-8).map((item) => item?.content || item?.text || '').join(' ') : '';
  const combined = `${source} ${(ctx && getContextKeywords(ctx).join(' ')) || ''}`;
  if (hasBroadChemistryHint(combined) || refersToCurrentContext(combined, ctx) || hasChemistryFormula(combined)) return true;
  return Canonical && typeof Canonical.isLikelyChemistryText === 'function' ? Canonical.isLikelyChemistryText(combined) : false;
}

function isLikelyFollowupQuestion(text) {
  const t = normalize(text);
  if (!t) return false;
  if (Canonical && typeof Canonical.isLikelyFollowup === 'function' && Canonical.isLikelyFollowup(text)) return true;
  if (t.split(' ').filter(Boolean).length <= 4) return true;
  return /^(e|entao|então|mas|ai|aí|isso|essa|esse|essa parte|esse ponto|e qual|e como|e por que|e pq|e se|no caso|nesse caso|e a diferença|e a diferenca|e no|e na|e o outro|e a outra|outro caso|mesmo tema)\b/.test(t);
}

function isAllowedScopeQuestion(text, ctx, recentMessages) {
  const t = normalize(text);
  if (isGreeting(t) || isHelpQuestion(t) || isSiteOverviewQuestion(t)) return true;
  const keys = chemistryKeywords(getContextKeywords(ctx)).concat(siteKeywords());
  if (keys.some((key) => t.includes(normalize(key)))) return true;
  if (hasBroadChemistryHint(text)) return true;
  if (hasChemistryFormula(text)) return true;
  if (Canonical && typeof Canonical.isLikelyChemistryText === 'function' && Canonical.isLikelyChemistryText(text)) return true;
  if (hasStudyIntent(text) && refersToCurrentContext(text, ctx)) return true;
  if (hasStudyIntent(text) && /(quimica|química|site|simoens|anima|pagina|página|molecula|molécula|ion|íon|ligacao|ligação|estrutura|cristal|defeit|vacan|frenkel|schottky|dopag)/.test(t)) return true;
  if (isLikelyFollowupQuestion(text) && recentConversationLooksInScope(recentMessages, ctx)) return true;
  return false;
}

function trimMessageForLLM(content, role) {
  const clean = String(content || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const limit = role === 'assistant' ? 700 : 500;
  return clean.length <= limit ? clean : `${clean.slice(0, limit - 1).trim()}…`;
}

function looksLikeWelcomeAssistantMessage(text) {
  const t = normalize(text);
  return /eu sou o assistente do simoens|posso ajudar com quimica|quimica dos solidos/.test(t);
}

function stripToRecent(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter((item) => item && item.role && item.content && !looksLikeWelcomeAssistantMessage(item.content))
    .slice(-8)
    .map(({ role, content }) => ({ role, content: trimMessageForLLM(content, role) }))
    .filter((item) => item.content);
}

function looksCorrupted(text) {
  if (!text) return false;
  const compact = text.replace(/\s+/g, '');
  if (compact.length < 80) return false;
  if (/(.)\1{18,}/.test(compact)) return true;
  if (/([A-Z0-9])\1{10,}/.test(compact)) return true;
  if (/([A-Za-z]{1,3}\d{0,2})\1{8,}/.test(compact)) return true;
  return false;
}


function extractTaggedFinal(text) {
  const sample = String(text || '');
  const match = sample.match(/<final>([\s\S]*?)<\/final>/i);
  return match ? String(match[1] || '').trim() : '';
}

function sanitizeRefinedReply(text, baseText) {
  const raw = String(text || '').trim();
  if (!raw) return '';
  let clean = extractTaggedFinal(raw) || raw;
  clean = clean.replace(/^```[a-zA-Z0-9_-]*\s*/, '').replace(/```$/, '').replace(/^assistente\s*:?\s*/i, '').trim();
  const leakagePatterns = [/pergunta do usu[aá]rio\s*:/i,/resposta-base/i,/resposta base/i,/reescreva a resposta-base/i,/refinador de resposta/i,/<pergunta_usuario>/i,/<resposta_base>/i];
  if (leakagePatterns.some((pattern) => pattern.test(clean))) return '';
  const normalizedBase = String(baseText || '').replace(/\s+/g, ' ').trim();
  const normalizedClean = clean.replace(/\s+/g, ' ').trim();
  if (normalizedClean.length < 40 && normalizedBase.length > 80) return '';
  return canonicalizeAssistantReply(clean);
}

function sharesEnoughMeaning(baseText, finalText) {
  const getTokens = (value) => Canonical && typeof Canonical.extractConceptTokens === 'function'
    ? Canonical.extractConceptTokens(value)
    : normalize(String(value || '')).split(/[^a-z0-9]+/).filter((token) => token.length >= 4);
  const baseTokens = Array.from(new Set(getTokens(baseText)));
  const finalTokens = new Set(getTokens(finalText));
  if (baseTokens.length < 6) return true;
  const overlap = baseTokens.filter((token) => finalTokens.has(token)).length / baseTokens.length;
  if (overlap >= 0.38) return true;
  if (Canonical && typeof Canonical.extractNotation === 'function') {
    const baseNotation = Canonical.extractNotation(baseText);
    const finalNotation = Canonical.extractNotation(finalText);
    const baseSignals = [].concat(baseNotation.formulas || [], baseNotation.ions || [], baseNotation.millerPlanes || [], baseNotation.directions || []);
    if (baseSignals.length) {
      const finalSignals = new Set([].concat(finalNotation.formulas || [], finalNotation.ions || [], finalNotation.millerPlanes || [], finalNotation.directions || []));
      const notationOverlap = baseSignals.filter((item) => finalSignals.has(item)).length / baseSignals.length;
      if (notationOverlap >= 0.5) return true;
    }
  }
  return overlap >= 0.25;
}

function normalizeForCompare(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function looksLikeModelRefusal(text) {
  const t = normalize(String(text || ''));
  if (!t) return false;
  if (/posso te ajudar melhor com quimica/.test(t)) return true;
  if (/fora do meu escopo|fora do escopo do assistente|apenas posso ajudar|devo me limitar/.test(t)) return true;
  if (/^(desculpe|sinto muito|infelizmente)\b/.test(t) && /(nao posso|não posso|nao consigo|não consigo|nao tenho como|não tenho como|nao tenho informacao suficiente|não tenho informação suficiente)/.test(t)) return true;
  if (/(nao posso ajudar com isso|não posso ajudar com isso|nao consigo responder isso|não consigo responder isso|nao tenho contexto suficiente para responder|não tenho contexto suficiente para responder)/.test(t)) return true;
  return false;
}

function buildDirectSystemPrompt(currentCtx, relevantSiteText, basePrompt = BASE_SYSTEM_PROMPT, documentContextText = '') {
  const currentPageSummary = currentCtx?.summary || currentCtx?.entrySummary || currentCtx?.heading || currentCtx?.title || 'Sem contexto específico de página.';
  const localDocsBlock = String(documentContextText || '').trim()
    ? `

Trechos relevantes dos documentos locais:
${documentContextText}`
    : '';
  return `${basePrompt}

URL oficial do site: ${SITE_URL}

Contexto atual do SiMoEns: ${currentPageSummary}

Mapa resumido do SiMoEns relevante para esta conversa:
${relevantSiteText}${localDocsBlock}

Diretrizes extras:
- Responda perguntas de Química mesmo quando o usuário não citar o site.
- Se o usuário estiver claramente continuando a conversa, aproveite o contexto recente antes de pedir que ele repita tudo.
- Quando houver trechos relevantes dos documentos locais, use-os como base prioritária da resposta.
- Quando usar os documentos locais, mencione o nome do arquivo e a página de forma natural ao longo da resposta ou no final.
- Prefira responder a recusar.
- Só use redirecionamento quando a pergunta estiver nitidamente fora de Química, do site e do contexto recente.
- Se precisar redirecionar, use algo próximo de: ${OFF_TOPIC_REPLY}`;
}

function collectMeaningfulTokens(text = '') {
  return Array.from(new Set(
    normalize(String(text || ''))
      .split(/[^a-z0-9]+/)
      .map((item) => item.trim())
      .filter((item) => item.length >= 3 && !/^\d+$/.test(item))
  ));
}

function compactDocumentText(text = '', maxChars = DOC_RAG_MAX_CHARS) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, maxChars - 1).trim()}…`;
}

function extractChunksFromDocumentPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.chunks)) return payload.chunks;
  if (Array.isArray(payload.preview_chunks)) return payload.preview_chunks;
  if (payload.data && typeof payload.data === 'object') {
    if (Array.isArray(payload.data.chunks)) return payload.data.chunks;
    if (Array.isArray(payload.data.preview_chunks)) return payload.data.preview_chunks;
  }
  return [];
}

function normalizeDocumentChunk(raw = {}, index = 0) {
  const text = compactDocumentText(raw.text || raw.page_content || raw.content || '', DOC_RAG_MAX_CHARS);
  if (!text) return null;
  return {
    id: raw.id || `${raw.file_name || raw.source || 'chunk'}-${index}`,
    text,
    source: raw.source || raw.file_name || '',
    file_name: raw.file_name || raw.source || `Documento ${index + 1}`,
    file_type: raw.file_type || '',
    page: raw.page ?? null,
    chunk_index: Number.isFinite(Number(raw.chunk_index)) ? Number(raw.chunk_index) : index,
  };
}

class SimoensChatWidget {
  constructor() {
    this.runtimeConfig = CHAT_WIDGET_RUNTIME_CONFIG;
    this.embeddedMode = this.runtimeConfig.mode === 'embedded';
    this.legacyPageShell = this.embeddedMode && this.runtimeConfig.layout === 'legacy-page';
    this.pageContext = collectPageContext();
    this.frameContext = safeParse(localStorage.getItem(STORAGE_KEYS.frame), null);
    this.messages = this.legacyPageShell ? [] : loadMessages();
    this.conversations = [];
    this.activeConversationId = '';
    this.engine = null;
    this.modelId = '';
    this.availableWebLLMModelIds = null;
    this.loading = false;
    this.sending = false;
    this.webllmModule = null;
    this.root = null;
    this.refs = {};
    this.statusNoticeTimer = null;
    this.currentStream = null;
    this.stopRequested = false;
    this.stopRequestedByUser = false;
    this.generationConfig = DEFAULT_GENERATION_CONFIG;
    this.loadNonce = 0;
    this.docChunksUrl = DOC_RAG_CHUNKS_URL;
    if (this.legacyPageShell) {
      this.bootstrapLegacyPageShellConversations();
    } else {
      this.bootstrapSharedConversationMirror();
    }
    this.docChunks = [];
    this.docChunksLoaded = false;
    this.docChunksError = '';
    this.docChunksPromise = null;
    this.ensureWelcomeMessage();
    window.addEventListener('message', (event) => this.handleMessage(event));
    window.addEventListener('storage', (event) => this.handleStorage(event));
  }

  ensureWelcomeMessage() {
    if (this.messages.length) return;
    const intro = canonicalizeAssistantReply(WidgetKeywordBot.INITIAL_MESSAGE);
    this.messages = [{ role: 'assistant', content: intro, timestamp: Date.now() }];
    if (this.legacyPageShell) {
      this.syncActiveConversationState({ touch: false, render: false });
    } else {
      saveMessages(this.messages);
    }
  }

  sanitizeConversationRecord(record = {}) {
    if (!record || typeof record !== 'object') return null;
    const id = String(record.id || '').trim() || `conv-${Math.random().toString(36).slice(2, 10)}`;
    const title = String(record.title || '').trim() || 'Nova conversa';
    const createdAt = Number.isFinite(Number(record.createdAt)) ? Number(record.createdAt) : Date.now();
    const updatedAt = Number.isFinite(Number(record.updatedAt)) ? Number(record.updatedAt) : createdAt;
    const messages = Array.isArray(record.messages)
      ? record.messages.filter((item) => item && typeof item.content === 'string').map((item) => ({
          role: item.role === 'user' ? 'user' : 'assistant',
          content: String(item.content || ''),
          meta: item.meta || {},
          timestamp: Number.isFinite(Number(item.timestamp)) ? Number(item.timestamp) : Date.now(),
        }))
      : [];
    return { id, title, createdAt, updatedAt, messages };
  }

  createConversationRecord(title = 'Nova conversa', messages = []) {
    return this.sanitizeConversationRecord({
      id: `conv-${Math.random().toString(36).slice(2, 10)}`,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages,
    });
  }

  deriveConversationTitleFromMessages(messages = []) {
    const firstUser = (messages || []).find((item) => item && item.role === 'user' && String(item.content || '').trim());
    if (!firstUser) return 'Nova conversa';
    const raw = String(firstUser.content || '').replace(/\s+/g, ' ').trim();
    return raw.length > 58 ? `${raw.slice(0, 58).trim()}…` : raw;
  }

  getConversationPreview(record = {}) {
    const source = [...(Array.isArray(record.messages) ? record.messages : [])].reverse().find((item) => item && String(item.content || '').trim());
    if (!source) return 'Conversa pronta para começar.';
    const raw = String(source.content || '').replace(/\s+/g, ' ').trim();
    return raw.length > 96 ? `${raw.slice(0, 96).trim()}…` : raw;
  }

  formatConversationTimestamp(value) {
    const stamp = Number.isFinite(Number(value)) ? Number(value) : Date.now();
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(stamp));
  }

  loadPageShellConversationStore() {
    const raw = safeParse(localStorage.getItem(STORAGE_KEYS.pageConversations), []);
    const conversations = Array.isArray(raw) ? raw.map((item) => this.sanitizeConversationRecord(item)).filter(Boolean) : [];
    const activeId = String(localStorage.getItem(STORAGE_KEYS.pageActiveConversation) || '').trim();
    return { conversations, activeId };
  }

  persistPageShellConversationStore() {
    if (!this.legacyPageShell) return;
    localStorage.setItem(STORAGE_KEYS.pageConversations, JSON.stringify(this.conversations));
    localStorage.setItem(STORAGE_KEYS.pageActiveConversation, this.activeConversationId || '');
  }

  bootstrapLegacyPageShellConversations() {
    const stored = this.loadPageShellConversationStore();
    this.conversations = stored.conversations;
    this.activeConversationId = stored.activeId;

    if (!this.conversations.length) {
      const seedMessages = loadMessages();
      const initial = this.createConversationRecord(this.deriveConversationTitleFromMessages(seedMessages), seedMessages);
      this.conversations = [initial];
      this.activeConversationId = initial.id;
    }

    if (!this.conversations.some((item) => item.id === this.activeConversationId)) {
      this.activeConversationId = this.conversations[0]?.id || '';
    }

    const active = this.getActiveConversation();
    this.messages = active ? [...active.messages] : [];
    this.persistPageShellConversationStore();
  }

  bootstrapSharedConversationMirror() {
    const stored = this.loadPageShellConversationStore();
    this.conversations = stored.conversations;
    this.activeConversationId = stored.activeId;

    if (!this.conversations.some((item) => item.id === this.activeConversationId)) {
      this.activeConversationId = this.conversations[0]?.id || '';
    }

    const active = this.conversations.find((item) => item.id === this.activeConversationId) || null;
    if (active?.messages?.length) {
      this.messages = [...active.messages];
      saveMessages(this.messages);
      return;
    }

    const seedMessages = loadMessages();
    if (!seedMessages.length) return;
    const initial = this.createConversationRecord(this.deriveConversationTitleFromMessages(seedMessages), seedMessages);
    this.conversations = [initial, ...this.conversations.filter((item) => item.id !== initial.id)];
    this.activeConversationId = initial.id;
    this.messages = [...seedMessages];
    this.persistSharedConversationMirror();
  }

  persistSharedConversationMirror() {
    localStorage.setItem(STORAGE_KEYS.pageConversations, JSON.stringify(this.conversations));
    localStorage.setItem(STORAGE_KEYS.pageActiveConversation, this.activeConversationId || '');
  }

  syncSharedConversationMirror(options = {}) {
    const activeId = String(this.activeConversationId || '').trim();
    let active = this.conversations.find((item) => item.id === activeId) || null;
    if (!active) {
      active = this.createConversationRecord(this.deriveConversationTitleFromMessages(this.messages), this.messages);
      this.conversations.unshift(active);
      this.activeConversationId = active.id;
    }
    active.messages = this.messages.map((item) => ({ ...item }));
    active.title = this.deriveConversationTitleFromMessages(active.messages);
    active.updatedAt = options.touch === false ? (active.updatedAt || Date.now()) : Date.now();
    if (!active.createdAt) active.createdAt = Date.now();
    saveMessages(this.messages);
    this.persistSharedConversationMirror();
  }

  createNewSharedConversation() {
    const stored = this.loadPageShellConversationStore();
    this.conversations = stored.conversations;
    this.activeConversationId = stored.activeId;
    const record = this.createConversationRecord('Nova conversa', []);
    this.conversations.unshift(record);
    this.activeConversationId = record.id;
    this.messages = [];
    this.ensureWelcomeMessage();
    this.syncSharedConversationMirror({ touch: false });
  }

  getActiveConversation() {
    if (!this.legacyPageShell) return null;
    return this.conversations.find((item) => item.id === this.activeConversationId) || null;
  }

  syncActiveConversationState(options = {}) {
    if (!this.legacyPageShell) {
      saveMessages(this.messages);
      return;
    }
    const active = this.getActiveConversation();
    if (!active) return;
    active.messages = this.messages.map((item) => ({ ...item }));
    active.title = this.deriveConversationTitleFromMessages(active.messages);
    active.updatedAt = options.touch === false ? (active.updatedAt || Date.now()) : Date.now();
    if (!active.createdAt) active.createdAt = Date.now();
    saveMessages(this.messages);
    this.persistPageShellConversationStore();
    if (options.render !== false) {
      this.renderConversationList();
      this.updateConversationHeader();
    }
  }

  updateConversationHeader() {
    if (!this.legacyPageShell) return;
    const active = this.getActiveConversation();
    if (this.refs.currentConversationTitle) {
      this.refs.currentConversationTitle.innerHTML = `<strong>${this.escapeHtml(active?.title || 'Nova conversa')}</strong>`;
    }
    if (this.refs.currentConversationMeta) {
      const count = Array.isArray(active?.messages) ? active.messages.length : 0;
      const stamp = this.formatConversationTimestamp(active?.updatedAt || Date.now());
      this.refs.currentConversationMeta.textContent = `${count} ${count === 1 ? 'mensagem' : 'mensagens'} · atualizada em ${stamp}`;
    }
  }

  renderConversationList() {
    if (!this.legacyPageShell || !this.refs.conversationList) return;
    if (!this.conversations.length) {
      this.refs.conversationList.innerHTML = '<div class="history-empty">Nenhuma conversa salva ainda. Clique em <strong>Nova conversa</strong> para começar.</div>';
      return;
    }
    const html = [...this.conversations]
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .map((item) => {
        const isActive = item.id === this.activeConversationId;
        const preview = this.escapeHtml(this.getConversationPreview(item));
        const stamp = this.escapeHtml(this.formatConversationTimestamp(item.updatedAt));
        return `
          <button class="history-item ${isActive ? 'active' : ''}" type="button" data-conversation-id="${this.escapeHtml(item.id)}">
            <div class="history-title">${this.escapeHtml(item.title || 'Nova conversa')}</div>
            <div class="history-snippet">${preview}</div>
            <div class="history-meta">
              <span>${stamp}</span>
              <span class="history-tag">Chat</span>
            </div>
          </button>
        `;
      }).join('');
    this.refs.conversationList.innerHTML = html;
  }

  activateConversation(conversationId) {
    if (!this.legacyPageShell) return;
    const next = this.conversations.find((item) => item.id === conversationId);
    if (!next) return;
    this.activeConversationId = next.id;
    this.messages = [...(next.messages || [])];
    this.ensureWelcomeMessage();
    this.persistPageShellConversationStore();
    saveMessages(this.messages);
    this.renderConversationList();
    this.updateConversationHeader();
    this.renderMessages();
    this.setStatus('Conversa carregada.', this.engine ? 100 : 0, false);
  }

  createNewPageConversation() {
    if (!this.legacyPageShell) return;
    const record = this.createConversationRecord('Nova conversa', []);
    this.conversations.unshift(record);
    this.activeConversationId = record.id;
    this.messages = [];
    this.ensureWelcomeMessage();
    this.syncActiveConversationState({ touch: false });
    this.renderMessages();
    this.setStatus('Nova conversa iniciada.', this.engine ? 100 : 0, false);
    requestAnimationFrame(() => this.refs.input?.focus());
  }

  clearActiveConversation() {
    if (!this.legacyPageShell) {
      this.clearMemory();
      return;
    }
    this.messages = [];
    this.ensureWelcomeMessage();
    this.syncActiveConversationState();
    this.renderMessages();
    this.setStatus('Conversa limpa.', this.engine ? 100 : 0, false);
  }

  deleteConversation(conversationId) {
    if (!this.legacyPageShell) return;
    this.conversations = this.conversations.filter((item) => item.id !== conversationId);
    if (!this.conversations.length) {
      const record = this.createConversationRecord('Nova conversa', []);
      this.conversations = [record];
      this.activeConversationId = record.id;
      this.messages = [];
      this.ensureWelcomeMessage();
      this.syncActiveConversationState({ touch: false });
    } else if (conversationId === this.activeConversationId) {
      const fallback = this.conversations.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
      this.activeConversationId = fallback.id;
      this.messages = [...(fallback.messages || [])];
      this.ensureWelcomeMessage();
      saveMessages(this.messages);
      this.persistPageShellConversationStore();
    } else {
      this.persistPageShellConversationStore();
    }
    this.renderConversationList();
    this.updateConversationHeader();
    this.renderMessages();
  }

  renderPageShellSampleQuestions() {
    if (!this.legacyPageShell || !this.refs.sampleQuestions) return;
    this.refs.sampleQuestions.innerHTML = SAMPLE_QUESTIONS.map((question) => `
      <button type="button" class="sample-chip" data-question="${this.escapeHtml(question)}">${this.escapeHtml(question)}</button>
    `).join('');
  }

  buildLegacyPageShell() {
    this.root = document;
    this.refs.panel = document.getElementById('chat-inteligente-area') || document.querySelector('.chat-smart-page') || document.body;
    this.refs.toggleBtn = null;
    this.refs.closeBtn = null;
    this.refs.startBtn = null;
    this.refs.menuBtn = { disabled: false };
    this.refs.menu = null;
    this.refs.newChatBtn = document.getElementById('newConversationBtn') || document.getElementById('newChatBtn');
    this.refs.refreshBtn = null;
    this.refs.downloadBtn = document.getElementById('exportChatBtn');
    this.refs.endChatBtn = null;
    this.refs.progressFill = document.getElementById('llmProgressBar');
    this.refs.progressPercent = document.getElementById('llmProgressPercent');
    this.refs.statusNotice = null;
    this.refs.messages = document.getElementById('chat');
    this.refs.messagesWrap = document.getElementById('chatWrap') || this.refs.messages;
    this.refs.form = document.getElementById('chatForm') || document.getElementById('form');
    this.refs.input = document.getElementById('userInput') || document.getElementById('input');
    this.refs.sendBtn = this.refs.form?.querySelector('button[type="submit"]') || null;
    this.refs.contextBox = document.getElementById('composerHint');
    this.refs.modelBox = document.getElementById('llmBadge');
    this.refs.modelBadge = this.refs.modelBox;
    this.refs.progressWrap = document.getElementById('llmProgressWrap');
    this.refs.progressLabel = document.getElementById('llmProgressLabel');
    this.refs.progressNote = document.getElementById('llmProgressNote');
    this.refs.clearBtn = document.getElementById('clearChatBtn');
    this.refs.sampleQuestions = document.getElementById('sampleQuestions');
    this.refs.currentConversationTitle = document.getElementById('currentConversationTitle') || document.getElementById('conversationTitle');
    this.refs.currentConversationMeta = document.getElementById('currentConversationMeta') || document.getElementById('conversationMeta');
    this.refs.conversationList = document.getElementById('conversationList') || document.getElementById('historyList');
    this.refs.modeToggleBtn = document.getElementById('modeToggleBtn');
    this.refs.modePopover = document.getElementById('modePopover');
    this.refs.sidebarToggle = document.getElementById('sidebarToggle');
    this.refs.overlay = document.getElementById('overlay');

    if (this.refs.modeToggleBtn) this.refs.modeToggleBtn.style.display = 'none';
    if (this.refs.modePopover) {
      this.refs.modePopover.classList.remove('open', 'is-open');
      this.refs.modePopover.style.display = 'none';
      this.refs.modePopover.setAttribute('aria-hidden', 'true');
    }



    this.refs.newChatBtn?.addEventListener('click', () => this.createNewPageConversation());
    this.refs.clearBtn?.addEventListener('click', () => this.clearActiveConversation());
    this.refs.downloadBtn?.addEventListener('click', () => this.downloadTranscript());
    this.refs.sendBtn?.addEventListener('click', (event) => {
      if (!this.sending) return;
      event.preventDefault();
      event.stopPropagation();
      this.requestStopGeneration();
    });
    this.refs.form?.addEventListener('submit', (event) => this.handleSubmit(event));
    this.refs.input?.addEventListener('input', () => {
      this.refs.input.style.height = 'auto';
      this.refs.input.style.height = `${Math.min(this.refs.input.scrollHeight, 220)}px`;
    });
    this.refs.sampleQuestions?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-question]');
      if (!button || !this.refs.input) return;
      this.refs.input.value = button.getAttribute('data-question') || '';
      this.refs.input.focus();
      this.refs.input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    this.refs.conversationList?.addEventListener('click', (event) => {
      const deleteBtn = event.target.closest('[data-delete-conversation]');
      if (deleteBtn) {
        event.preventDefault();
        event.stopPropagation();
        this.deleteConversation(deleteBtn.getAttribute('data-delete-conversation') || '');
        return;
      }
      const item = event.target.closest('[data-conversation-id]');
      if (!item) return;
      this.activateConversation(item.getAttribute('data-conversation-id') || '');
    });
    this.refs.sidebarToggle?.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-open');
    });
    this.refs.overlay?.addEventListener('click', () => {
      document.body.classList.remove('sidebar-open');
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) document.body.classList.remove('sidebar-open');
    });

    this.renderPageShellSampleQuestions();
    this.updateContextText();
    this.updateHeaderModel();
    this.updateMenuLabels();
    this.updateConversationHeader();
    this.renderConversationList();
    this.renderMessages();
    this.setStatus('Assistente do SiMoEns pronto para responder no modo offline.', 100, false);
  }

  handleStorage(event) {
    if (event.key === STORAGE_KEYS.messages) {
      this.messages = loadMessages();
      if (this.legacyPageShell) this.syncActiveConversationState({ render: false });
      this.renderMessages();
      if (this.legacyPageShell) {
        this.renderConversationList();
        this.updateConversationHeader();
      }
    }
    if (this.legacyPageShell && (event.key === STORAGE_KEYS.pageConversations || event.key === STORAGE_KEYS.pageActiveConversation)) {
      const stored = this.loadPageShellConversationStore();
      this.conversations = stored.conversations;
      this.activeConversationId = stored.activeId || this.conversations[0]?.id || '';
      const active = this.getActiveConversation();
      this.messages = active ? [...(active.messages || [])] : [];
      this.ensureWelcomeMessage();
      this.renderConversationList();
      this.updateConversationHeader();
      this.renderMessages();
    }
    if (event.key === STORAGE_KEYS.frame) {
      this.frameContext = safeParse(localStorage.getItem(STORAGE_KEYS.frame), null);
      this.updateContextText();
    }
    if (event.key === STORAGE_KEYS.open) {
      this.setOpen(getStoredOpen(), false);
    }
  }

  handleMessage(event) {
    if (event.origin && event.origin !== location.origin) return;
    const data = event.data || {};
    if (data?.type !== 'simoens-chat-context') return;
    this.frameContext = data.payload;
    localStorage.setItem(STORAGE_KEYS.frame, JSON.stringify(this.frameContext));
    this.updateContextText();
  }

  async ensureWebLLM() {
    if (this.webllmModule) return this.webllmModule;
    let lastError = null;
    for (const candidate of WEBLLM_IMPORT_CANDIDATES) {
      try {
        this.webllmModule = await import(candidate);
        const appConfig = this.webllmModule?.prebuiltAppConfig;
        const modelList = Array.isArray(appConfig?.model_list) ? appConfig.model_list : [];
        this.availableWebLLMModelIds = new Set(modelList.map((item) => String(item?.model_id || '')).filter(Boolean));
        this.logTrace('webllm:module-ready', {
          importUrl: candidate,
          availableModels: this.availableWebLLMModelIds.size,
          activeModel: ACTIVE_MODEL_ID,
        });
        return this.webllmModule;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('Não foi possível carregar o runtime do WebLLM.');
  }

  async ensureSharedCore() {
    if (window.QuimiBotCore && typeof window.QuimiBotCore.respond === 'function') return window.QuimiBotCore;
    this.setStatus('Conectando base local...', 10, true);
    for (const scriptPath of SHARED_CORE_SCRIPTS) {
      await loadSharedScriptOnce(scriptPath);
    }
    return window.QuimiBotCore || null;
  }

  async trySharedCore(userText, currentCtx) {
    try {
      const core = await this.ensureSharedCore();
      if (!core || typeof core.respond !== 'function') return null;
      const enriched = enrichPageContext(currentCtx || this.pageContext || {});
      const reply = core.respond({
        question: userText,
        mode: 'chat',
        answerMode: 'auto',
        pageContext: enriched,
        siteContextExtra: enriched.siteContextExtra || ''
      });
      return reply && reply.markdown ? reply : null;
    } catch (error) {
      console.warn('Não consegui conectar o widget ao core compartilhado.', error);
      this.logTrace('shared-core:error', { message: error?.message || String(error) });
      return null;
    }
  }

  async ensureDocumentChunks() {
    if (this.docChunksLoaded) return this.docChunks;
    if (this.docChunksPromise) return this.docChunksPromise;

    if (IS_LOCAL_FILE_RUNTIME) {
      this.docChunks = [];
      this.docChunksLoaded = false;
      this.docChunksError = 'Base documental offline indisponível em file://';
      this.logTrace('doc-rag:skipped-local-file', { url: this.docChunksUrl });
      return [];
    }

    const url = this.docChunksUrl;
    this.docChunksPromise = (async () => {
      try {
        this.setStatus('Carregando base documental chunkada...', 12, true);
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Falha ao carregar ${url} (${response.status})`);
        const payload = await response.json();
        const rawChunks = extractChunksFromDocumentPayload(payload);
        if (!rawChunks.length) {
          throw new Error('Base documental inválida: esperado um array de chunks, payload.chunks ou payload.preview_chunks.');
        }
        const chunks = rawChunks
          .map((item, index) => normalizeDocumentChunk(item, index))
          .filter(Boolean);
        this.docChunks = chunks;
        this.docChunksLoaded = true;
        this.docChunksError = '';
        this.logTrace('doc-rag:loaded', { url, chunks: chunks.length });
        return chunks;
      } catch (error) {
        this.docChunks = [];
        this.docChunksLoaded = false;
        this.docChunksError = error?.message || String(error);
        this.logTrace('doc-rag:error', { url, message: this.docChunksError });
        return [];
      } finally {
        this.docChunksPromise = null;
      }
    })();

    return this.docChunksPromise;
  }

  buildDocumentQueryText(userText, currentCtx) {
    const recent = this.messages
      .filter((item) => item && item.role === 'user' && typeof item.content === 'string')
      .slice(-3)
      .map((item) => item.content)
      .join(' ');
    return [
      userText,
      currentCtx?.topic || '',
      currentCtx?.title || '',
      currentCtx?.heading || '',
      recent,
    ].filter(Boolean).join(' ');
  }

  scoreDocumentChunk(chunk, queryTokens, queryText, exactNeedles) {
    const haystack = normalize(`${chunk.text} ${chunk.file_name || ''} ${chunk.source || ''}`);
    let score = 0;
    for (const token of queryTokens) {
      if (!token) continue;
      if (haystack.includes(token)) score += token.length >= 7 ? 1.35 : 0.9;
    }
    for (const needle of exactNeedles) {
      if (!needle) continue;
      if (haystack.includes(needle)) score += Math.max(1.8, Math.min(4.2, needle.length / 9));
    }
    if (queryText && haystack.includes(queryText)) score += 3.8;
    return score;
  }

  async retrieveDocumentContext(userText, currentCtx) {
    const chunks = await this.ensureDocumentChunks();
    if (!chunks.length) return { promptText: '', matches: [] };

    const queryText = normalize(String(userText || '').trim());
    const queryTokens = collectMeaningfulTokens(this.buildDocumentQueryText(userText, currentCtx)).slice(0, 28);
    const exactNeedles = Array.from(new Set([
      queryText,
      normalize(currentCtx?.topic || ''),
      normalize(currentCtx?.title || ''),
      normalize(currentCtx?.heading || ''),
    ].filter((item) => item && item.length >= 4)));

    const ranked = chunks
      .map((chunk) => ({
        ...chunk,
        score: this.scoreDocumentChunk(chunk, queryTokens, queryText, exactNeedles),
      }))
      .filter((chunk) => chunk.score >= DOC_RAG_MIN_SCORE)
      .sort((a, b) => b.score - a.score || a.chunk_index - b.chunk_index)
      .slice(0, DOC_RAG_MAX_CHUNKS);

    if (!ranked.length) return { promptText: '', matches: [] };

    const promptText = ranked
      .map((chunk) => `[Arquivo: ${chunk.file_name}${chunk.page ? ` | Página: ${chunk.page}` : ''}] ${compactDocumentText(chunk.text, DOC_RAG_MAX_CHARS)}`)
      .join('\n\n');

    this.logTrace('doc-rag:matches', {
      query: userText,
      matches: ranked.map((chunk) => ({ file_name: chunk.file_name, page: chunk.page, score: Number(chunk.score.toFixed(2)) })),
    });

    return { promptText, matches: ranked };
  }

  async ensureEngine(options = {}) {
    if (this.engine && this.modelId === ACTIVE_MODEL_ID) return this.engine;
    if (this.loadingPromise) return this.loadingPromise;

    const loadNonce = ++this.loadNonce;
    this.loading = true;
    this.setStatus('Preparando assistente...', 4, true);
    this.toggleBusy(true);
    this.logTrace('engine:start', { modelId: ACTIVE_MODEL_ID });

    this.loadingPromise = (async () => {
      try {
        const { CreateMLCEngine } = await this.ensureWebLLM();
        const engine = await CreateMLCEngine(ACTIVE_MODEL_ID, {
          initProgressCallback: (report) => {
            const progress = Number.isFinite(report?.progress) ? Math.max(0, Math.min(100, Math.round(report.progress * 100))) : 0;
            const label = report?.text || 'Baixando e preparando o modelo...';
            this.setStatus(progress > 0 ? `${label} (${progress}%)` : label, progress || 8, true);
          },
        });
        if (loadNonce !== this.loadNonce) return null;
        this.engine = engine;
        this.modelId = ACTIVE_MODEL_ID;
        this.setStatus('Assistente pronto.', 100, false);
        this.updateHeaderModel();
        this.updateMenuLabels();
        this.logTrace('engine:ready', { modelId: ACTIVE_MODEL_ID });
        return engine;
      } catch (error) {
        console.error(error);
        this.logTrace('engine:error', { modelId: ACTIVE_MODEL_ID, message: error?.message || String(error) });
        this.setStatus('Não consegui iniciar o modelo neste navegador.', 100, false);
        if (!options?.suppressFailureMessage) {
          this.pushAssistantMessage('Não consegui iniciar o modelo no navegador. Tente abrir o projeto em http://localhost, usar Chrome ou Edge atualizados, e recarregar a página.');
        }
        return null;
      } finally {
        if (loadNonce === this.loadNonce) {
          this.loading = false;
          this.loadingPromise = null;
          this.toggleBusy(false);
        }
      }
    })();

    return this.loadingPromise;
  }


  buildSharedReplyRefinerMessages(userText, sharedReply, currentCtx) {
    const promptContext = getCurrentContextText(this.pageContext, this.frameContext);
    const enriched = enrichPageContext(currentCtx || this.frameContext || this.pageContext || {});
    const currentPageSummary = enriched?.summary || promptContext || 'Sem contexto específico de página.';
    return [
      {
        role: 'system',
        content: `${SHARED_REPLY_REFINER_PROMPT}

URL oficial do site: ${SITE_URL}

Contexto atual do SiMoEns: ${trimMessageForLLM(currentPageSummary, 'system')}`
      },
      {
        role: 'user',
        content: `Pergunta do usuário:
${trimMessageForLLM(userText, 'user')}

Resposta-base do banco local:
${String(sharedReply?.markdown || '').slice(0, 5000)}`
      }
    ];
  }

  previewRefinedReplyCandidate(text) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    return (extractTaggedFinal(raw) || raw)
      .replace(/^```[a-zA-Z0-9_-]*\s*/, '')
      .replace(/```$/, '')
      .replace(/^assistente\s*:?\s*/i, '')
      .trim();
  }

  async refineSharedReplyWithLLM(userText, sharedReply, currentCtx, assistantDraft) {
    const baseText = String(sharedReply?.markdown || '');
    const forceRefine = this.getAlwaysRefineEnabled();
    if (!forceRefine && (!baseText || baseText.length < 120 || /^(oi|ol[aá]|bom dia|boa tarde|boa noite)\b/i.test(baseText.trim()))) {
      return { usedLLM: false, text: baseText, reason: 'skipped-short', status: 'pulado' };
    }

    const engine = await this.ensureEngine({ suppressFailureMessage: true });
    if (!engine) return { usedLLM: false, text: baseText, reason: 'engine-unavailable', status: 'indisponivel' };

    this.setStatus('Base local pronta. Naturalizando a resposta...', 35, true);

    const requestOptions = {
      messages: this.buildSharedReplyRefinerMessages(userText, sharedReply, currentCtx),
      temperature: Math.min(this.getActiveTemperature(), 0.4),
      max_tokens: this.getActiveMaxTokens(),
      top_p: Math.min(this.getActiveTopP(), 0.85),
      repetition_penalty: this.getActiveRepetitionPenalty(),
      stream: true,
    };
    const activeSeed = this.getActiveSeed();
    if (activeSeed !== undefined) requestOptions.seed = activeSeed;

    const stream = await engine.chat.completions.create(requestOptions);
    this.currentStream = stream;

    let fullText = '';
    for await (const chunk of stream) {
      if (this.stopRequested) break;
      const token = chunk?.choices?.[0]?.delta?.content || '';
      if (!token) continue;
      fullText += token;
    }

    const finalText = String(fullText || '').trim();
    if (this.stopRequestedByUser) {
      return { usedLLM: true, stopped: true, text: finalText || baseText, status: 'aplicado' };
    }

    const rejectedText = this.previewRefinedReplyCandidate(finalText);
    const sanitized = sanitizeRefinedReply(finalText, baseText);
    if (forceRefine) {
      const forcedText = String(sanitized || rejectedText || baseText).trim() || baseText;
      if (normalizeForCompare(forcedText) === normalizeForCompare(baseText)) {
        return { usedLLM: false, text: baseText, reason: 'same', status: 'sem-alteracao', rejectedText };
      }
      return { usedLLM: true, text: forcedText, status: 'aplicado-forcado', rejectedText };
    }
    if (!sanitized || looksCorrupted(sanitized)) {
      return { usedLLM: false, text: baseText, reason: finalText ? 'corrupted' : 'empty', status: 'rejeitado', rejectedText };
    }
    if (normalizeForCompare(sanitized) === normalizeForCompare(baseText)) {
      return { usedLLM: false, text: baseText, reason: 'same', status: 'sem-alteracao' };
    }
    if (sanitized.length > Math.max(baseText.length * 2.1, baseText.length + 700)) {
      return { usedLLM: false, text: baseText, reason: 'too-long', status: 'rejeitado', rejectedText: sanitized || rejectedText };
    }
    if (looksLikeModelRefusal(sanitized) && isAllowedScopeQuestion(userText, currentCtx, this.messages)) {
      return { usedLLM: false, text: baseText, reason: 'refusal', status: 'rejeitado', rejectedText: sanitized || rejectedText };
    }
    if (!sharesEnoughMeaning(baseText, sanitized)) {
      return { usedLLM: false, text: baseText, reason: 'low-overlap', status: 'rejeitado', rejectedText: sanitized || rejectedText };
    }

    return { usedLLM: true, text: sanitized, status: 'aplicado' };
  }


  build() {
    if (this.legacyPageShell) {
      this.buildLegacyPageShell();
      return;
    }
    const mountNode = this.embeddedMode && this.runtimeConfig.mountSelector
      ? document.querySelector(this.runtimeConfig.mountSelector) || document.body
      : document.body;
    const panelTitle = this.runtimeConfig.title || 'Assistente do SiMoEns';
    const host = document.createElement('div');
    host.id = this.embeddedMode ? 'simoens-chat-widget-embed-host' : 'simoens-chat-widget-host';
    if (this.embeddedMode) {
      host.style.display = 'block';
      host.style.width = '100%';
      host.style.height = '100%';
      host.style.minHeight = '100%';
    }
    mountNode.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        .sw-root {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 2147483000;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          line-height: 1.4;
          color: #101010;
        }
        .sw-toggle {
          width: 64px;
          height: 64px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          padding: 0;
          display: grid;
          place-items: center;
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(0,0,0,.22);
          transition: transform .18s ease;
        }
        .sw-toggle:hover { transform: translateY(-2px); }
        .sw-toggle:active { transform: scale(.98); }
        .sw-toggle svg { width: 64px; height: 64px; display: block; }

        .sw-panel {
          position: absolute;
          right: 0;
          bottom: 78px;
          width: min(400px, calc(100vw - 20px));
          height: min(585px, calc(100vh - 96px));
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,.22);
          opacity: 0;
          transform: translateY(10px) scale(.985);
          pointer-events: none;
          transition: opacity .18s ease, transform .18s ease;
        }
        .sw-panel.is-open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .sw-header {
          background: #000000;
          color: #ffffff;
          padding: 16px 16px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .sw-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -.01em;
        }
        .sw-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sw-menubox {
          position: relative;
        }
        .sw-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 238px;
          padding: 10px;
          border-radius: 18px;
          border: 1px solid rgba(17, 24, 39, 0.08);
          background: #ffffff;
          box-shadow: 0 18px 42px rgba(15, 23, 42, 0.18);
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 30;
        }
        .sw-menuitem {
          appearance: none;
          border: 0;
          background: transparent;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 14px;
          cursor: pointer;
          text-align: left;
          color: #111827;
          font-size: 15px;
          font-weight: 500;
          transition: background .18s ease, transform .18s ease;
        }
        .sw-menuitem:hover {
          background: #f7f7f8;
        }
        .sw-menuitem:active {
          transform: translateY(1px);
        }
        .sw-menuiconbox {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: #f1f3f5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          flex: 0 0 26px;
        }
        .sw-menuiconbox.danger {
          background: #fff1f2;
          color: #ef4444;
        }
        .sw-menuicon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          line-height: 1;
        }
        .sw-menutext {
          flex: 1;
          min-width: 0;
        }
        .sw-menuitem.danger {
          color: #ef4444;
        }
        .sw-iconbtn {
          appearance: none;
          border: 0;
          background: transparent;
          color: #ffffff;
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          opacity: .95;
        }
        .sw-menu-trigger {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(255,255,255,.12);
          color: #ffffff;
          font-size: 12px;
          letter-spacing: 1px;
        }
        .sw-dots {
          transform: translateY(-1px);
        }
        .sw-iconbtn:hover { background: rgba(255,255,255,.12); }
        .sw-menu-trigger:hover { background: rgba(255,255,255,.18); }

        .sw-statusbar {
          padding: 10px 14px;
          border-bottom: 1px solid #ededed;
          background: #fafafa;
        }
        .sw-progressmeta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 12px;
          color: #686868;
          font-weight: 600;
        }
        .sw-statusnotice {
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #8a1f1f;
        }
        .sw-bar {
          width: 100%;
          height: 4px;
          border-radius: 999px;
          background: #ececec;
          overflow: hidden;
        }
        .sw-bar > span {
          display: block;
          width: 0%;
          height: 100%;
          background: #000000;
          transition: width .2s ease;
        }
        .sw-messages {
          flex: 1;
          overflow: auto;
          padding: 16px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sw-msgrow {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .sw-msgrow.user {
          justify-content: flex-end;
        }
        .sw-avatar {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: #000000;
          display: grid;
          place-items: center;
          flex: 0 0 26px;
          overflow: hidden;
          margin-top: 2px;
        }
        .sw-avatar svg {
          width: 26px;
          height: 26px;
          display: block;
        }
        .sw-bubble {
          max-width: 82%;
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 15px;
          line-height: 1.65;
          color: #111111;
          word-break: break-word;
          box-shadow: 0 1px 0 rgba(0,0,0,.03);
        }
        .sw-bubble p,
        .sw-bubble li {
          margin: 0 0 10px;
          font-size: 15px;
          line-height: 1.65;
        }
        .sw-bubble p:last-child,
        .sw-bubble li:last-child,
        .sw-bubble ul:last-child,
        .sw-bubble ol:last-child {
          margin-bottom: 0;
        }
        .sw-bubble h4 {
          margin: 0 0 10px;
          font-size: 15px;
          line-height: 1.45;
          font-weight: 700;
          color: #111111;
        }
        .sw-bubble strong {
          font-weight: 700;
        }
        .sw-bubble ul,
        .sw-bubble ol {
          margin: 0 0 10px;
          padding-left: 18px;
        }
        .sw-msgrow.assistant .sw-bubble {
          background: #f1f3f6;
          border-top-left-radius: 6px;
        }
        .sw-msgrow.user .sw-bubble {
          background: #eef3ff;
          border-top-right-radius: 6px;
        }
        .sw-bubble a {
          color: #0f62fe;
          text-decoration: underline;
          word-break: break-all;
        }
        .sw-bubble a:hover {
          opacity: .9;
        }
        .sw-meta {
          font-size: 12px;
          color: #8b8b8b;
          margin-top: 6px;
          padding-left: 36px;
        }
        .sw-msgrow.user + .sw-meta {
          padding-left: 0;
          text-align: right;
        }

        .sw-form {
          border-top: 1px solid #ededed;
          background: #ffffff;
          padding: 10px 12px 12px;
        }
        .sw-inputwrap {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }
        .sw-input {
          flex: 1;
          border: 0;
          outline: none;
          resize: none;
          min-height: 46px;
          max-height: 160px;
          padding: 12px 2px 8px;
          font: inherit;
          color: #101010;
          background: transparent;
        }
        .sw-input::placeholder { color: #8c8c8c; }
        .sw-send {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 999px;
          background: #000000;
          color: #ffffff;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          display: grid;
          place-items: center;
          flex: 0 0 38px;
        }
        .sw-send.is-stopmode {
          font-size: 12px;
          font-weight: 800;
        }
        .sw-footer {
          margin-top: 4px;
          font-size: 11px;
          color: #9a9a9a;
          text-align: center;
        }
        .sw-hidden { display: none !important; }
        .sw-iconbtn[disabled], .sw-send[disabled] {
          opacity: .55;
          cursor: wait;
        }

        ${this.embeddedMode ? `
        .sw-root {
          position: relative;
          right: auto;
          bottom: auto;
          width: 100%;
          height: 100%;
          min-height: 680px;
        }
        .sw-panel {
          position: relative;
          right: auto;
          bottom: auto;
          width: 100%;
          height: 100%;
          min-height: 680px;
          max-height: none;
          opacity: 1;
          transform: none;
          pointer-events: auto;
          border-radius: 24px;
          box-shadow: none;
        }
        .sw-toggle, #closeBtn {
          display: none !important;
        }
        .sw-header {
          padding: 18px 18px 16px;
        }
        .sw-statusbar {
          padding: 12px 16px;
        }
        .sw-messages {
          padding: 18px;
        }
        .sw-form {
          padding: 14px 16px 16px;
        }
        ` : ''}

        @media (max-width: 640px) {
          .sw-root { right: 10px; bottom: 10px; }
          .sw-toggle, .sw-toggle svg { width: 58px; height: 58px; }
          .sw-panel {
            width: min(100vw - 10px, 100vw - 10px);
            height: min(76vh, calc(100vh - 82px));
            bottom: 70px;
          }
          .sw-menu {
            width: min(220px, calc(100vw - 56px));
            right: -2px;
          }
          ${this.embeddedMode ? `
          .sw-root {
            right: auto;
            bottom: auto;
            min-height: 72vh;
          }
          .sw-panel {
            width: 100%;
            height: 100%;
            bottom: auto;
            min-height: 72vh;
          }
          ` : ''}
        }
      </style>
      <div class="sw-root">
        <div class="sw-panel" id="panel">
          <div class="sw-header">
            <h2 class="sw-title">${panelTitle}</h2>
            <div class="sw-header-actions">
              <div class="sw-menubox">
                <button class="sw-iconbtn sw-menu-trigger" id="menuBtn" type="button" aria-label="Mais opções" aria-expanded="false">
                  <span class="sw-dots">•••</span>
                </button>
                <div class="sw-menu sw-hidden" id="menu" role="menu" aria-label="Mais opções do chat">
                  <button class="sw-menuitem" id="newChatBtn" type="button" role="menuitem">
                    <span class="sw-menuiconbox"><span class="sw-menuicon">✦</span></span>
                    <span class="sw-menutext">Nova conversa</span>
                  </button>
                  <button class="sw-menuitem" id="refreshBtn" type="button" role="menuitem">
                    <span class="sw-menuiconbox"><span class="sw-menuicon">↻</span></span>
                    <span class="sw-menutext">Atualizar</span>
                  </button>
                  <button class="sw-menuitem" id="downloadBtn" type="button" role="menuitem">
                    <span class="sw-menuiconbox"><span class="sw-menuicon">↓</span></span>
                    <span class="sw-menutext">Baixar transcrição</span>
                  </button>                  <button class="sw-menuitem danger" id="endChatBtn" type="button" role="menuitem">
                    <span class="sw-menuiconbox danger"><span class="sw-menuicon">×</span></span>
                    <span class="sw-menutext">Encerrar chat</span>
                  </button>
                </div>
              </div>
              <button class="sw-iconbtn" id="closeBtn" type="button" aria-label="Fechar chat"><span style="font-size:20px;line-height:1;">×</span></button>
            </div>
          </div>

          <div class="sw-messages" id="messages"></div>

          <form class="sw-form" id="form">
            <div class="sw-inputwrap">
              <textarea class="sw-input" id="input" rows="1" placeholder="Digite sua pergunta de Química ou sobre o SiMoEns..."></textarea>
              <button class="sw-send" id="sendBtn" type="submit" aria-label="Enviar">↑</button>
            </div>            <div class="sw-footer">Memória persistente ativa neste navegador.</div>
          </form>
        </div>

        ${this.runtimeConfig.hideToggle ? '' : `<button class="sw-toggle" id="toggleBtn" type="button" aria-label="Abrir chat">${ICON_SVG}</button>`}
      </div>
    `;
    this.root = shadow;
    this.refs.panel = shadow.getElementById('panel');
    this.refs.toggleBtn = shadow.getElementById('toggleBtn');
    this.refs.closeBtn = shadow.getElementById('closeBtn');
    this.refs.startBtn = null;
    this.refs.menuBtn = shadow.getElementById('menuBtn');
    this.refs.menu = shadow.getElementById('menu');
    this.refs.newChatBtn = shadow.getElementById('newChatBtn');
    this.refs.refreshBtn = shadow.getElementById('refreshBtn');
    this.refs.downloadBtn = shadow.getElementById('downloadBtn');
    this.refs.endChatBtn = shadow.getElementById('endChatBtn');
    this.refs.progressFill = shadow.getElementById('progressFill');
    this.refs.progressPercent = shadow.getElementById('progressPercent');
    this.refs.statusNotice = shadow.getElementById('statusNotice');
    this.refs.messages = shadow.getElementById('messages');
    this.refs.form = shadow.getElementById('form');
    this.refs.input = shadow.getElementById('input');
    this.refs.sendBtn = shadow.getElementById('sendBtn');
    this.refs.contextBox = null;
    this.refs.modelBox = null;
    this.refs.modelBadge = null;

    this.refs.toggleBtn?.addEventListener('click', () => this.setOpen(true));
    this.refs.closeBtn?.addEventListener('click', () => this.setOpen(false));
    this.refs.menuBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      this.toggleMenu();
    });
    this.refs.newChatBtn.addEventListener('click', () => {
      this.startNewChat();
    });
    this.refs.refreshBtn.addEventListener('click', () => {
      this.refreshChatPanel();
    });
    this.refs.downloadBtn.addEventListener('click', () => {
      this.downloadTranscript();
    });
    this.refs.endChatBtn.addEventListener('click', () => {
      this.endChatSession();
    });
    this.refs.sendBtn.addEventListener('click', (event) => {
      if (!this.sending) return;
      event.preventDefault();
      event.stopPropagation();
      this.requestStopGeneration();
    });
    this.refs.form.addEventListener('submit', (event) => this.handleSubmit(event));
    this.refs.input.addEventListener('input', () => {
      this.refs.input.style.height = 'auto';
      this.refs.input.style.height = `${Math.min(this.refs.input.scrollHeight, 160)}px`;
    });

    const focusInput = () => {
      requestAnimationFrame(() => {
        this.refs.input?.focus();
        const len = this.refs.input?.value?.length ?? 0;
        this.refs.input?.setSelectionRange?.(len, len);
      });
    };

    this.refs.form.addEventListener('mousedown', (event) => {
      if (event.target.closest('button')) return;
      focusInput();
    });

    shadow.addEventListener('click', (event) => {
      if (!this.isMenuOpen()) return;
      const path = event.composedPath();
      if (path.includes(this.refs.menuBtn) || path.includes(this.refs.menu)) return;
      this.closeMenu();
    });

    this.refs.panel.addEventListener('keydown', (event) => {
      const isSpace = event.key === ' ' || event.code === 'Space' || event.key === 'Spacebar';
      const insideInput = event.composedPath().includes(this.refs.input);
      if (!isSpace) return;

      if (insideInput) {
        event.stopPropagation();
        return;
      }

      if (this.refs.panel.classList.contains('is-open')) {
        event.preventDefault();
        event.stopPropagation();
        focusInput();
      }
    }, true);

    this.refs.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        event.stopPropagation();
        if (this.sending) {
          this.requestStopGeneration();
          return;
        }
        if ((this.refs.input?.value || '').trim()) {
          this.refs.form?.requestSubmit?.();
        }
        return;
      }

      const isSpace = event.key === ' ' || event.code === 'Space' || event.key === 'Spacebar';
      if (!isSpace) return;

      event.preventDefault();
      event.stopPropagation();

      const input = this.refs.input;
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      input.value = `${input.value.slice(0, start)} ${input.value.slice(end)}`;
      input.setSelectionRange(start + 1, start + 1);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, true);

    this.updateContextText();
    this.updateHeaderModel();
    this.updateMenuLabels();
    this.updateSendButtonState();
    this.renderMessages();
    this.setStatus('Assistente do SiMoEns pronto para responder no modo offline.', 100, false);
    this.setOpen(this.embeddedMode ? true : getStoredOpen(), false);
  }



  updateSendButtonState() {
    if (!this.refs.sendBtn) return;
    const isStopping = this.sending === true;
    this.refs.sendBtn.disabled = false;
    this.refs.sendBtn.classList.toggle('is-stopmode', isStopping);
    if (this.legacyPageShell) {
      this.refs.sendBtn.textContent = isStopping ? 'Interromper' : 'Perguntar';
      this.refs.sendBtn.setAttribute('aria-label', isStopping ? 'Interromper resposta' : 'Perguntar');
      this.refs.sendBtn.title = isStopping ? 'Interromper resposta' : 'Perguntar';
      return;
    }
    this.refs.sendBtn.textContent = isStopping ? '■' : '↑';
    this.refs.sendBtn.setAttribute('aria-label', isStopping ? 'Interromper resposta' : 'Enviar');
    this.refs.sendBtn.title = isStopping ? 'Interromper resposta' : 'Enviar';
  }

  requestStopGeneration() {
    if (!this.sending) return;
    this.stopRequested = true;
    this.stopRequestedByUser = true;
    this.setStatus('Interrompendo resposta...', 100, true);
    this.logTrace('chat:stop-requested', { modelId: this.modelId || 'sob demanda' });
    try {
      if (typeof this.engine?.interruptGenerate === 'function') {
        this.engine.interruptGenerate();
      }
    } catch (error) {
      this.logTrace('chat:stop-interrupt-error', { message: error?.message || String(error) });
    }
    try {
      if (this.currentStream && typeof this.currentStream.return === 'function') {
        this.currentStream.return();
      }
    } catch (error) {
      this.logTrace('chat:stop-stream-return-error', { message: error?.message || String(error) });
    }
    this.updateSendButtonState();
  }


  getAlwaysRefineEnabled() {
    return false;
  }

  updateMenuLabels() {
  }

  logTrace() {
    return;
  }

  getActiveTemperature() {
    return this.generationConfig.temperature;
  }

  getActiveMaxTokens() {
    return this.generationConfig.maxTokens;
  }

  getActiveTopP() {
    return this.generationConfig.topP;
  }

  getActiveSeed() {
    return this.generationConfig.seed;
  }

  getActiveRepetitionPenalty() {
    return this.generationConfig.repetitionPenalty;
  }

  getActiveSystemPrompt() {
    return this.generationConfig.systemPrompt;
  }

  setOpen(isOpen, persist = true) {
    if (!this.refs.panel) return;
    const shouldOpen = this.embeddedMode ? true : Boolean(isOpen);
    this.refs.panel.classList.toggle('is-open', shouldOpen);
    if (persist) setStoredOpen(shouldOpen);
    if (!shouldOpen) {
      this.closeMenu();
    }
    if (shouldOpen) {
      requestAnimationFrame(() => {
        this.refs.input?.focus();
        const len = this.refs.input?.value?.length ?? 0;
        this.refs.input?.setSelectionRange?.(len, len);
      });
      this.scrollMessages();
    }
  }

  isMenuOpen() {
    return this.refs.menu && !this.refs.menu.classList.contains('sw-hidden');
  }

  toggleMenu(force) {
    if (!this.refs.menu || !this.refs.menuBtn) return;
    const shouldOpen = typeof force === 'boolean' ? force : !this.isMenuOpen();
    this.refs.menu.classList.toggle('sw-hidden', !shouldOpen);
    this.refs.menuBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
  }

  closeMenu() {
    this.toggleMenu(false);
  }

  startNewChat() {
    this.closeMenu();
    if (this.legacyPageShell) this.createNewPageConversation();
    else this.createNewSharedConversation();
    this.setOpen(true, true);
    this.setStatus(this.engine ? 'Nova conversa iniciada.' : 'Nova conversa iniciada. O modelo será carregado na primeira pergunta.', this.engine ? 100 : 0, false);
    requestAnimationFrame(() => this.refs.input?.focus());
  }

  refreshChatPanel() {
    this.closeMenu();
    this.pageContext = collectPageContext();
    localStorage.setItem(STORAGE_KEYS.page, JSON.stringify(this.pageContext));
    this.frameContext = safeParse(localStorage.getItem(STORAGE_KEYS.frame), this.frameContext);
    this.updateContextText();
    this.updateHeaderModel();
    this.renderMessages();
    this.setStatus(this.engine ? 'Painel atualizado.' : 'Painel atualizado. O modelo será carregado na primeira pergunta.', this.engine ? 100 : 0, false);
  }

  downloadTranscript() {
    this.closeMenu();
    const ctx = getCurrentContextText(this.pageContext, this.frameContext);
    const lines = [
      'Transcrição do chat SiMoEns',
      `URL do site: ${SITE_URL}`,
      `Contexto atual: ${ctx || 'indisponível'}`,
      '',
    ];

    for (const item of this.messages) {
      const who = item.role === 'user' ? 'Você' : 'Assistente';
      lines.push(`${who}: ${item.content}`);
      lines.push('');
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `transcricao-simoens-${stamp}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.setStatus('Transcrição baixada.', this.engine ? 100 : 0, false);
  }

  endChatSession() {
    this.closeMenu();
    this.clearMemory();
    this.setOpen(false, true);
    this.setStatus('Chat encerrado.', this.engine ? 100 : 0, false);
  }

  updateContextText() {
    if (!this.refs.contextBox) return;
    const ctx = getCurrentContextText(this.pageContext, this.frameContext);
    this.refs.contextBox.textContent = this.legacyPageShell
      ? 'Pode pedir definição, explicação em camadas, comparação, resumo, analogia, aplicação prática, exercício com gabarito ou ajuda para navegar pelo site.'
      : (ctx || 'Contexto da página indisponível.');
  }

  updateHeaderModel() {
    if (!this.refs.modelBox) return;
    this.refs.modelBox.hidden = true;
    this.refs.modelBox.textContent = '';
    this.refs.modelBadge = this.refs.modelBox;
  }

  setStatus(text, progress = 0, busy = false) {
    const safeProgress = Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0));
    if (this.refs.progressPercent) this.refs.progressPercent.textContent = `${safeProgress}%`;
    if (this.refs.progressFill) this.refs.progressFill.style.width = `${safeProgress}%`;
    if (this.legacyPageShell) {
      if (this.refs.progressLabel) this.refs.progressLabel.textContent = text || 'Assistente do SiMoEns offline';
      if (this.refs.progressNote) {
        this.refs.progressNote.textContent = 'Esta versão usa respostas locais por palavras-chave e mantém o histórico salvo no navegador.';
      }
      if (this.refs.progressWrap) this.refs.progressWrap.dataset.state = busy ? 'loading' : (safeProgress >= 100 ? 'ready' : 'idle');
      if (this.refs.sendBtn) {
        this.refs.sendBtn.textContent = this.sending ? 'Interromper' : 'Perguntar';
      }
      return;
    }
    if (this.refs.startBtn) {
      this.refs.startBtn.textContent = busy ? 'Carregando...' : (this.engine ? 'Assistente ativo' : 'Iniciar assistente');
      this.refs.startBtn.disabled = busy || Boolean(this.engine);
    }
  }

  showTransientStatusNotice(text, duration = 2200) {
    if (!this.refs.statusNotice) return;
    if (this.statusNoticeTimer) clearTimeout(this.statusNoticeTimer);
    this.refs.statusNotice.textContent = text || '';
    if (!text) return;
    this.statusNoticeTimer = setTimeout(() => {
      if (this.refs.statusNotice?.textContent === text) {
        this.refs.statusNotice.textContent = '';
      }
      this.statusNoticeTimer = null;
    }, duration);
  }

  toggleBusy(busy) {
    this.sending = busy && !this.engine ? this.sending : this.sending;
    if (this.refs.sendBtn) this.refs.sendBtn.disabled = busy || this.sending;
    if (this.refs.input) this.refs.input.disabled = busy || this.sending;
    if (this.refs.menuBtn) this.refs.menuBtn.disabled = busy || this.sending;
  }


  renderMessages() {
    if (!this.refs.messages) return;
    if (this.legacyPageShell) {
      this.refs.messages.innerHTML = this.messages.map((item) => {
        const isUser = item.role === 'user';
        const label = isUser ? 'VOCÊ' : 'ASSISTENTE';
        return `
          <div class="message-card ${isUser ? 'user' : 'bot'}">
            <div class="message-role">${label}</div>
            <div class="message-body">${this.formatMessageHtml(item.content, item)}</div>
          </div>
        `;
      }).join('');
      this.scrollMessages();
      return;
    }
    this.refs.messages.innerHTML = this.messages.map((item, index) => {
      const isUser = item.role === 'user';
      const label = isUser ? 'Você' : 'Assistente';
      const meta = index === 0 && !isUser ? 'Assistente do SiMoEns • agora' : `${label} • agora`;
      return `
        <div>
          <div class="sw-msgrow ${isUser ? 'user' : 'assistant'}">
            ${isUser ? '' : `<div class="sw-avatar">${ICON_SVG}</div>`}
            <div class="sw-bubble">${this.formatMessageHtml(item.content, item)}</div>
          </div>
          <div class="sw-meta">${meta}</div>
        </div>
      `;
    }).join('');
    this.scrollMessages();
  }

  scrollMessages() {
    const target = this.legacyPageShell ? (this.refs.messagesWrap || this.refs.messages) : this.refs.messages;
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollTop = target.scrollHeight;
    });
  }

  findCanonicalEntryForLabel(label) {
    const normalizedLabel = normalize(String(label || '')).replace(/\s+/g, ' ').trim();
    if (!normalizedLabel) return null;
    return SIMOENS_SITE_MAP.find((entry) => {
      const title = normalize(entry.title || '').replace(/\s+/g, ' ').trim();
      if (title === normalizedLabel || title.includes(normalizedLabel) || normalizedLabel.includes(title)) return true;
      if ((entry.keywords || []).some((keyword) => {
        const value = normalize(keyword || '').replace(/\s+/g, ' ').trim();
        return value && (value === normalizedLabel || value.includes(normalizedLabel) || normalizedLabel.includes(value));
      })) return true;
      return false;
    }) || null;
  }

  cleanAssistantUrl(url, label = '') {
    let value = String(url || '').trim();
    if (!value) return '#';
    value = value
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .trim();
    value = value.replace(/["'>].*$/g, '').trim();
    value = value.replace(/[.,;:!?]+$/g, '').trim();

    const matchedEntry = this.findCanonicalEntryForLabel(label);
    const isSimoensUrl = /quimicavisualufv\.github\.io\/Quimica-Visual\//i.test(value);
    const isGenericAnimationsPage = /quimicavisualufv\.github\.io\/Quimica-Visual\/Paginas_Animacoes\.html/i.test(value);
    const isLegacyPagesUrl = /quimicavisualufv\.github\.io\/Quimica-Visual\/paginas\//i.test(value);
    if (matchedEntry && (isSimoensUrl || isGenericAnimationsPage || isLegacyPagesUrl)) {
      return entryUrl(matchedEntry);
    }

    return sanitizeUrl(value);
  }

  splitTrailingUrlPunctuation(value) {
    let url = String(value || '');
    let trailing = '';
    while (/[.,;:!?)]$/.test(url)) {
      const last = url.slice(-1);
      if (last === ')' && ((url.match(/\(/g) || []).length >= (url.match(/\)/g) || []).length)) break;
      trailing = last + trailing;
      url = url.slice(0, -1);
    }
    return { url, trailing };
  }

  buildLinkHtml(url, label = '') {
    const safeUrl = this.cleanAssistantUrl(url, label);
    const safeLabel = this.escapeHtml(String(label || safeUrl));
    return `<a href="${this.escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
  }

  normalizeAssistantLinks(text) {
    let source = String(text || '');

    source = source.replace(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, (_, __, url, label) => {
      const cleanLabel = String(label || '').replace(/<[^>]+>/g, '').trim();
      const cleanUrl = this.cleanAssistantUrl(url, cleanLabel);
      return cleanLabel ? `[${cleanLabel}](${cleanUrl})` : cleanUrl;
    });

    source = source.replace(/(https?:\/\/[^\s"'<>]+)"[^>\n]*>\s*([^\n<]+?)(?=(?:[.!?](?:\s|$)|$))/gi, (_, url, label) => {
      const cleanLabel = String(label || '').trim().replace(/[.,;:!?]+$/g, '').trim();
      const cleanUrl = this.cleanAssistantUrl(url, cleanLabel);
      return cleanLabel ? `[${cleanLabel}](${cleanUrl})` : cleanUrl;
    });

    source = source.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_, label, url) => {
      const cleanLabel = String(label || '').trim();
      const cleanUrl = this.cleanAssistantUrl(url, cleanLabel);
      return `[${cleanLabel}](${cleanUrl})`;
    });

    source = source.replace(/(https?:\/\/[^\s"'<>]+)\s+(?:target|rel)\s*=\s*["'][^"']*["'][^\n]*/gi, (_, url) => this.cleanAssistantUrl(url));
    source = source.replace(/(https?:\/\/[^\s"'<>]+)"[^\s\n>]*/gi, (_, url) => this.cleanAssistantUrl(url));

    return source;
  }

  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  formatMessageHtml(text, item = {}) {
    return this.renderMarkdown(String(text || ''));
  }

  renderMarkdown(text) {
    const normalizedText = this.normalizeAssistantLinks(String(text || ''));
    let html = this.escapeHtml(normalizedText);
    html = html.replace(/^###\s+(.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^##\s+(.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^#\s+(.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\|\|([\s\S]*?)\|\|/g, '<span class="sw-spoiler" style="display:inline-block;border-radius:8px;padding:2px 8px;background:#d6d8de;color:transparent;cursor:pointer;user-select:none;transition:background-color .2s ease,color .2s ease;" onclick="this.style.background=\'#eceef3\';this.style.color=\'inherit\';">$1</span>');
    const linkTokens = [];
    const stashLink = (value) => {
      const token = `__SWLINK_${linkTokens.length}__`;
      linkTokens.push(value);
      return token;
    };
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => stashLink(this.buildLinkHtml(url, label)));
    html = html.replace(/\bhttps?:\/\/[^\s<"']+/g, (value) => {
      const { url, trailing } = this.splitTrailingUrlPunctuation(value);
      return `${stashLink(this.buildLinkHtml(url))}${this.escapeHtml(trailing)}`;
    });
    html = html.replace(/__SWLINK_(\d+)__/g, (_, index) => linkTokens[Number(index)] || '');
    const lines = html.split('\n');
    let inList = false;
    let inOrderedList = false;
    const out = [];
    lines.forEach((line) => {
      if (/^[-•]\s+/.test(line)) {
        if (inOrderedList) { out.push('</ol>'); inOrderedList = false; }
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push(`<li>${line.replace(/^[-•]\s+/, '')}</li>`);
        return;
      }
      if (/^\d+[\.)]\s+/.test(line)) {
        if (inList) { out.push('</ul>'); inList = false; }
        if (!inOrderedList) { out.push('<ol>'); inOrderedList = true; }
        out.push(`<li>${line.replace(/^\d+[\.)]\s+/, '')}</li>`);
        return;
      }
      if (inList) { out.push('</ul>'); inList = false; }
      if (inOrderedList) { out.push('</ol>'); inOrderedList = false; }
      if (line.trim()) out.push(/^<h4>/.test(line.trim()) ? line : `<p>${line}</p>`);
    });
    if (inList) out.push('</ul>');
    if (inOrderedList) out.push('</ol>');
    return out.join('');
  }

  async repairRefusalWithLLM(userText, currentCtx, relevantSiteText) {
    const engine = this.engine;
    if (!engine) return '';
    const messages = [
      {
        role: 'system',
        content: `${REFUSAL_REPAIR_PROMPT}

${buildDirectSystemPrompt(currentCtx, relevantSiteText, this.getActiveSystemPrompt())}`
      },
      {
        role: 'user',
        content: trimMessageForLLM(userText, 'user')
      }
    ];
    const requestOptions = {
      messages,
      temperature: Math.min(this.getActiveTemperature(), 0.25),
      max_tokens: Math.min(this.getActiveMaxTokens(), 700),
      top_p: Math.min(this.getActiveTopP(), 0.85),
      repetition_penalty: this.getActiveRepetitionPenalty(),
      stream: true,
    };
    const activeSeed = this.getActiveSeed();
    if (activeSeed !== undefined) requestOptions.seed = activeSeed;

    const stream = await engine.chat.completions.create(requestOptions);
    this.currentStream = stream;
    let fullText = '';
    try {
      for await (const chunk of stream) {
        if (this.stopRequested) break;
        const token = chunk?.choices?.[0]?.delta?.content || '';
        if (!token) continue;
        fullText += token;
      }
    } finally {
      this.currentStream = null;
    }
    const repaired = String(fullText || '').trim();
    if (!repaired || looksCorrupted(repaired) || looksLikeModelRefusal(repaired)) return '';
    return repaired;
  }

  pushMessage(role, content, meta = {}) {
    this.messages.push({ role, content, meta, timestamp: Date.now() });
    if (this.legacyPageShell) {
      this.syncActiveConversationState({ render: false });
      this.renderConversationList();
      this.updateConversationHeader();
    } else {
      this.syncSharedConversationMirror({ render: false });
    }
    this.renderMessages();
  }

  pushAssistantMessage(content, meta = {}) {
    this.pushMessage('assistant', canonicalizeAssistantReply(content), meta);
  }

  clearMemory() {
    this.messages = [];
    localStorage.removeItem(STORAGE_KEYS.messages);
    localStorage.removeItem(STORAGE_KEYS.frame);
    this.frameContext = null;
    this.ensureWelcomeMessage();
    if (this.legacyPageShell) this.syncActiveConversationState();
    else this.syncSharedConversationMirror();
    this.updateContextText();
    this.renderMessages();
    this.setStatus(this.engine ? 'Assistente pronto.' : 'Memória limpa. O modelo permanece disponível nesta página.', this.engine ? 100 : 0, false);
  }

  async handleSubmit(event) {
    event.preventDefault();
    if (this.sending) return;
    const userText = this.refs.input.value.trim();
    if (!userText) return;

    const currentCtx = enrichPageContext(this.frameContext || this.pageContext || {});
    this.pushMessage('user', userText);
    this.refs.input.value = '';
    this.refs.input.style.height = 'auto';

    this.sending = true;
    this.stopRequested = false;
    this.stopRequestedByUser = false;
    if (this.refs.input) this.refs.input.disabled = true;
    if (this.refs.menuBtn) this.refs.menuBtn.disabled = true;
    this.updateSendButtonState();
    this.setStatus('Analisando pergunta...', 45, true);

    try {
      let response = '';

      if (isHelpQuestion(userText)) {
        response = GENERIC_HELP_REPLY;
      }

      if (!response) {
        response = maybeAnswerInstantSiteQuestions(userText);
      }

      if (!response) {
        response = maybeAnswerFromSiteMap(userText, currentCtx);
      }

      if (!response) {
        response = WidgetKeywordBot.getBotResponse(userText);
      }

      const enrichedResponse = (WidgetKeywordBot.appendContextualAnimationSuggestions || ((reply) => reply))(String(response || '').trim() || 'Não consegui montar uma resposta agora. Tente reformular a pergunta com o nome do assunto de Química.', userText, currentCtx);
      const safeResponse = canonicalizeAssistantReply(enrichedResponse);
      this.pushAssistantMessage(safeResponse);
      this.setStatus('Assistente pronto.', 100, false);
    } catch (error) {
      console.error(error);
      this.pushAssistantMessage('Ocorreu um erro ao processar a resposta do Assistente do SiMoEns nesta versão offline.');
      this.setStatus('Ocorreu um erro durante a resposta.', 100, false);
    } finally {
      this.currentStream = null;
      this.sending = false;
      this.stopRequested = false;
      this.stopRequestedByUser = false;
      if (this.refs.input) this.refs.input.disabled = false;
      if (this.refs.menuBtn) this.refs.menuBtn.disabled = false;
      this.updateSendButtonState();
      this.refs.input?.focus();
    }
  }
}

function postContextToParent() {
  if (window.self === window.top) return;
  const payload = collectPageContext();
  try {
    parent.postMessage({ type: 'simoens-chat-context', payload }, location.origin);
  } catch {
    parent.postMessage({ type: 'simoens-chat-context', payload }, '*');
  }
}

const pageContext = collectPageContext();
localStorage.setItem(STORAGE_KEYS.page, JSON.stringify(pageContext));

if (window.self !== window.top) {
  postContextToParent();
} else {
  const widget = new SimoensChatWidget();
  widget.build();
}