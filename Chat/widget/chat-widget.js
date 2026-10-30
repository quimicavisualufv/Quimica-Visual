(function () {
'use strict';

if (window.__simoensChatWidgetScriptLoaded) return;
window.__simoensChatWidgetScriptLoaded = true;

/* Widget atualizado para usar o mesmo motor offline do chatbot completo. */
const STORAGE_KEYS = {
  messages: 'simoens.webllm.messages.v3',
  open: 'simoens.webllm.open.v1',
  page: 'simoens.webllm.page.v1',
  frame: 'simoens.webllm.frame.v1',
  pageConversations: 'simoens.local.chat.conversations.v4',
  pageActiveConversation: 'simoens.local.chat.active.v4',
  conversationContext: 'simoens.local.chat.context.v1',
  aiMode: 'simoens.chat.ai-mode.v1',
};

const AI_MODES = Object.freeze(['auto','on','off']);
const CONVERSATION_DELETE_STYLES = `
.chat-smart-page .rail-head {flex-wrap:wrap;gap:10px;}
.chat-smart-page .history-actions {display:flex;justify-content:flex-end;margin:0 0 14px;flex-shrink:0;}
.chat-smart-page .history-delete-all {min-height:44px;max-width:100%;padding:10px 12px;border:1px solid #d6bdc1;border-radius:12px;background:#fff;color:#8b2637;font:600 .82rem/1.4 Inter,system-ui,sans-serif;cursor:pointer;}
.chat-smart-page .history-delete-all:disabled {opacity:.55;cursor:default;}
.chat-smart-page .history-row {display:grid;grid-template-columns:minmax(0,1fr) 44px;align-items:start;gap:4px;min-width:0;padding-right:8px;border:1.5px solid rgba(29,107,85,.2);border-radius:22px;background:rgba(255,255,255,.86);box-shadow:0 10px 24px rgba(18,18,18,.025);}
.chat-smart-page .history-row:hover,.chat-smart-page .history-row:focus-within {border-color:rgba(29,107,85,.5);}
.chat-smart-page .history-row.active {border-color:rgba(29,107,85,.5);background:#fff;box-shadow:0 12px 28px rgba(29,107,85,.1);}
.chat-smart-page .history-row .history-item {min-width:0;padding:14px 8px 14px 14px;border:0;background:transparent;box-shadow:none;transition:none;color:#203047;}
.chat-smart-page .history-row .history-title {overflow-wrap:anywhere;}
.chat-smart-page .history-delete {display:grid;place-items:center;width:44px;height:44px;min-width:44px;margin-top:6px;padding:10px;border:1px solid transparent;border-radius:12px;background:transparent;color:#8b2637;cursor:pointer;}
.chat-smart-page .history-delete:hover {border-color:#d6bdc1;background:#fff0f2;}
.chat-smart-page .history-delete svg {display:block;width:20px;height:20px;pointer-events:none;}
.chat-delete-dialog {box-sizing:border-box;position:fixed;inset:0;width:calc(100% - 32px);max-width:460px;max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);margin:auto;padding:24px;border:1px solid #ccd8e6;border-radius:20px;background:#fff;color:#203047;box-shadow:0 20px 80px rgba(13,30,50,.3);overflow:auto;font:400 1rem/1.6 Inter,system-ui,sans-serif;}
.chat-delete-dialog::backdrop {background:rgba(13,26,44,.6);}
.chat-delete-dialog h2 {margin:0 0 12px;color:inherit;font:700 1.3rem/1.35 Inter,system-ui,sans-serif;}
.chat-delete-dialog p {margin:0 0 14px;color:inherit;font:inherit;}
.chat-delete-dialog .chat-delete-target {padding:10px 12px;border:1px solid #dce4ed;border-radius:10px;background:#f7faff;overflow-wrap:anywhere;font-weight:600;}
.chat-delete-actions {display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px;margin-top:20px;}
.chat-delete-actions button {min-height:44px;max-width:100%;padding:10px 16px;border:1px solid #b7c7d9;border-radius:10px;background:#fff;color:#234568;font:600 .94rem/1.4 Inter,system-ui,sans-serif;cursor:pointer;}
.chat-delete-actions .chat-delete-confirm {border-color:#962b3d;background:#962b3d;color:#fff;}
.chat-delete-dialog button:focus-visible {outline:3px solid #3d84d8;outline-offset:3px;}
html.simoens-a11y-contrast .chat-smart-page .history-row,html.simoens-a11y-contrast .chat-delete-dialog,html.simoens-a11y-contrast .chat-delete-dialog p {background:#050505!important;color:#fff!important;border-color:#fff!important;}
html.simoens-a11y-contrast .chat-smart-page :is(#historyList button,#deleteAllChatsBtn),html.simoens-a11y-contrast #deleteConversationsDialog button {background:#050505!important;color:#ffff00!important;border:1px solid #ffff00!important;transition:none!important;animation:none!important;}
@media(max-width:991.98px){.chat-smart-page {padding-top:128px;}.chat-smart-page .left-rail {height:100vh;height:100dvh;}.chat-smart-page .left-rail-inner {box-sizing:border-box;min-height:0;height:100%;overflow:hidden;}.chat-smart-page .history {min-height:0;overflow-y:auto;overscroll-behavior:contain;}}
@media(max-width:380px){.chat-delete-dialog {padding:20px;}.chat-delete-actions {flex-direction:column;}.chat-delete-actions button {width:100%;}}
`;
const AI_MODE_STYLES = `
.sw-ai-settings {box-sizing:border-box;min-width:0;margin:0 0 12px;padding:10px 12px;border:1px solid #d6e1ee;border-radius:12px;background:#f7faff;color:#203047;font:500 13px/1.45 Inter,system-ui,sans-serif;}
.sw-ai-row {display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0;}
.sw-ai-row label {margin:0;min-width:0;line-height:1.4;font:inherit;font-weight:650;color:inherit;}
.sw-ai-row select {box-sizing:border-box;min-height:44px;width:150px;max-width:55%;min-width:0;margin:0;padding:8px 30px 8px 10px;border:1px solid #9db2ce;border-radius:9px;background:#fff;color:#203047;color-scheme:light;font:inherit;font-size:16px;cursor:pointer;}
.sw-ai-row select:focus-visible {outline:3px solid #3d84d8;outline-offset:2px;}
.sw-ai-help {margin:6px 0 0!important;color:#526981;font:400 12px/1.5 Inter,system-ui,sans-serif;overflow-wrap:anywhere;}
.sw-form .sw-ai-settings {padding:0 0 8px;margin-bottom:8px;border:0;border-bottom:1px solid #e0e7f0;border-radius:0;background:#fff;font-size:12px;}
.sw-form .sw-ai-help {position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
.sw-messages {min-height:64px;}
.sw-form,.sw-header {flex-shrink:0;}
html.simoens-a11y-contrast .chat-smart-page .sw-ai-settings,html.simoens-a11y-contrast .chat-smart-page .sw-ai-help,html.simoens-a11y-contrast .chat-smart-page .sw-ai-row select,:host-context(html.simoens-a11y-contrast) .sw-ai-settings,:host-context(html.simoens-a11y-contrast) .sw-ai-help,:host-context(html.simoens-a11y-contrast) .sw-ai-row select {background:#050505;color:#fff;border-color:#fff;color-scheme:dark;}
html.simoens-a11y-contrast .chat-smart-page :is(#exportChatBtn,#clearChatBtn,#newChatBtn,#sidebarToggle,#sendBtn) {background:#050505!important;background-image:none!important;color:#ffff00!important;border-color:#ffff00!important;transition:none!important;animation:none!important;}
@media(max-width:980px){body:has(.chat-smart-page) #vw-unique-widget-root {position:static!important;inset:auto!important;width:max-content;max-width:calc(100% - 24px);margin:12px!important;}}
@media(max-width:440px){.chat-smart-page .sw-ai-row {gap:8px;}.chat-smart-page .sw-ai-row select {width:140px;}.sw-ai-settings {padding:9px;font-size:12px;}}
`;
function normalizeAIMode(value){return AI_MODES.includes(value)?value:'auto';}
function loadAIMode(){try{return normalizeAIMode(localStorage.getItem(STORAGE_KEYS.aiMode));}catch{return 'auto';}}
function decideAIRefinement({mode='auto',text='',intent='',sourceIds=[],replyKind='',stopped=false}={}){
  mode=normalizeAIMode(mode);
  if(mode==='off')return {request:false,reason:'user-disabled'};
  if(stopped)return {request:false,reason:'cancelled'};
  if(replyKind==='calculation')return {request:false,reason:'fixed-calculation'};
  if(replyKind==='fixed-information')return {request:false,reason:'fixed-information'};
  if(/\*\*(?:Questão|Gabarito|Dica)/i.test(text)||intent==='generate-practice')return {request:false,reason:'fixed-practice'};
  if(['greeting','acknowledgement','help','navigation-help','recommend-resource','site-overview','identify-current-experience','accessibility-help','explain-interface'].includes(intent))return {request:false,reason:'fixed-information'};
  if(replyKind==='limitation'||!sourceIds.length||/ainda não encontrei|não encontrei conteúdo suficiente|não há uma questão/i.test(text))return {request:false,reason:'insufficient-base'};
  if(text.length>7000)return {request:false,reason:'size-limit'};
  if(text.trim().length<40)return {request:false,reason:'insufficient-base'};
  if(mode==='auto'&&text.length<120)return {request:false,reason:'local-sufficient'};
  return {request:true,reason:mode==='on'?'requested-on':'automatic-explanation'};
}

const Canonical = window.QuimiBotCanonicalEngine;

function reviewedChatUsageReply(value) {
  const t=window.SiMoEnsSearchCore?.normalizeQuery(value)||'';
  if(/\b(?:telefone pessoal|celular pessoal|endereco residencial)\b/.test(t))return 'Não tenho um contato pessoal revisado para fornecer. Para falar com o SiMoEns, use o canal público **quimicavisualufv@gmail.com** ou o formulário de contato da página principal.';
  if(/\b(?:exclu\w*|apag\w*)\b.*\bconversas?\b/.test(t))return /\b(?:todas|tudo)\b/.test(t)
    ? 'No chat completo, abra **Conversas** e use **Excluir todas as conversas**. Confira a confirmação antes de excluir; **Cancelar** mantém o histórico. A exclusão vale para o histórico salvo neste navegador.'
    : 'No chat completo, abra **Conversas** e toque na **lixeira à direita da conversa**. Confira o título e confirme **Excluir conversa**; **Cancelar** mantém o histórico. No celular, use o botão **Abrir histórico** para mostrar a lista.';
  if(/\b(?:ia|inteligencia artificial|aprimoramento|melhoramento)\b/.test(t)&&/\b(?:desativ\w*|deslig\w*|ligar|ativar|modo|automatico|nao foi aprimorada|nao foi aplicado)\b/.test(t))return 'Use **Aprimoramento da IA**, acima do campo da pergunta: **Desligado** usa a base local sem enviar pedidos de aprimoramento; **Ligado** tenta aprimorar explicações científicas com base suficiente; **Automático** seleciona as explicações elegíveis. Exercícios com gabarito, links e controles do chat ficam locais. A preferência é salva neste navegador; a nota em cada resposta informa se a IA foi aplicada, ficou indisponível ou teve a reformulação recusada na validação.';
  if(/\b(?:historico|conversas|mensagens)\b/.test(t)&&/\b(?:servidor|privacidade|salv\w*|grav\w*|envia\w*)\b/.test(t))return 'O histórico deste chat é salvo localmente neste navegador. Quando o aprimoramento por IA é solicitado, a pergunta, a resposta-base, o contexto da página e até quatro mensagens recentes são enviados ao serviço de aprimoramento via Cloudflare/Groq. Isso não é uma cópia de segurança do histórico. Selecione **Desligado** para impedir esses pedidos de aprimoramento.';
  if(/\b(?:voce|chat|chatbot|assistente)\b.*\b(?:pode errar|comete erros|e infalivel)\b/.test(t))return 'Sim, posso errar. A base revisada, as referências e a validação das reformulações ajudam a reduzir erros, mas não garantem que toda resposta esteja correta. Confira as condições do problema e as fontes citadas; se apontar um trecho duvidoso, posso retomar o conceito e explicitar os limites da resposta.';
  if(/\b(?:invente|inventar|fabrique)\b.*\b(?:referencia|fonte|citacao)\b/.test(t))return 'Não vou inventar referências. Posso explicar um conceito com as fontes cadastradas no SiMoEns ou informar quando a base não sustenta uma resposta.';
  if(/\b(?:cristais?|gemas?)\b.*\b(?:cura\w*|ansiedade|tratamento de saude)\b/.test(t)||/\bhoroscopo\b/.test(t))return 'Este chat aborda a composição, a estrutura e as propriedades químicas dos materiais. Não uso estruturas cristalinas ou conceitos quânticos para justificar efeitos terapêuticos ou horóscopos. Posso explicar o conteúdo científico do SiMoEns relacionado a esses materiais.';
  return '';
}

function reviewedClarificationReply(value,subject='') {
  const t=window.SiMoEnsSearchCore?.normalizeQuery(value)||'';
  if(subject&&/^qual (?:e )?(?:o )?valor correto$/.test(t))return '';
  if(/^(?:o que e (?:uma? )?)?celula$/.test(t))return 'Você quer saber sobre **célula unitária**, em cristalografia, ou usa “célula” em outro sentido?';
  if(/^(?:explique |o que e (?:a )?)?coordenacao$/.test(t))return 'Você quer **número de coordenação em um cristal**, contando vizinhos, ou **coordenação em complexos**, envolvendo átomos doadores e um centro metálico?';
  if(/^(?:me diga )?(?:o que e (?:uma? )?)?ligacao$/.test(t))return 'Você se refere a **ligação química**? Posso explicar ligações iônicas, covalentes e metálicas, ou compará-las com interações intermoleculares.';
  if(/^(?:o que e (?:uma? )?)?base$/.test(t))return 'Você quer uma **base em uma teoria ácido-base**, o **motivo associado a uma rede cristalina** ou outro uso da palavra? O contexto muda a definição.';
  if(/^(?:qual (?:e )?(?:o )?(?:valor correto|modelo (?:e )?melhor)|quem descobriu isso|qual e a sua massa)$/.test(t))return 'Informe o conceito, o modelo ou a grandeza a que você se refere. Preciso desse contexto para responder sem adivinhar.';
  if(!subject&&!window.SiMoEnsSearchCore?.hasChemistryFormula?.(value)&&!/\b(?:agua|amonia|metano)\b/.test(t)&&/\b(?:ele|ela|isso|esse|essa)\b/.test(t)&&/\b(?:polar|apolar)\b/.test(t))return 'De qual molécula ou espécie você está falando? Envie o nome ou a fórmula para eu analisar geometria e polaridade.';
  return '';
}

// Small, explicit calculations only. Missing or incompatible data never become guessed values.
function solveReviewedCalculation(value) {
  const raw=String(value||'').normalize('NFKC').replace(/[−–]/g,'-');
  const t=window.SiMoEnsSearchCore?.normalizeQuery(raw)||'';
  if(window.SiMoEnsSearchCore?.detectFollowupMode(raw)==='verify')return null;
  const operation=/\b(?:calcule|calcular|calculo|determine|balanceie)\b/.test(t);
  if(/^(?:como|qual (?:e )?a formula)\b/.test(t)&&(!/[0-9]/.test(raw)||/\b(?:radial|orbital)\b/.test(t)))return null;
  const requested=t.match(/\b(?:calcule|calcular|determine)\s+(?:(?:o|a|os|as|valor|da|de|do)\s+)*(.*)$/)?.[1]||'';
  const number='[+-]?(?:\\d+(?:[.,]\\d+)?|[.,]\\d+)(?:[eE][+-]?\\d+)?';
  const n=v=>Number(String(v).replace(',','.'));
  const fmt=v=>new Intl.NumberFormat('pt-BR',{maximumSignificantDigits:6,useGrouping:false}).format(Object.is(v,-0)?0:v).replace(/^-/, '−');
  const result=(text,sourceIds,kind='calculation')=>({text,sourceIds,kind});
  const missing=(text,sourceIds=[])=>result(text,sourceIds,'limitation');
  const match=pattern=>raw.match(new RegExp(pattern,'iu'));
  if(requested&&/^densidade radial|^probabilidade radial/.test(requested))return missing('A densidade radial usa P(r)=r²|R(r)|². Para um valor numérico, é necessário especificar o orbital, o raio e a função radial normalizada com unidades; o cálculo local disponível não avalia essas funções. Essa grandeza não é a densidade cristalográfica calculada por massa e volume.',['radial-probability']);
  if(requested&&!/^(?:gibbs|delta g|energia|densidade|d\b|espacamento|massa(?! molar)|volume|nos?\b|valores (?:de )?l\b|l\b)/.test(requested))return missing('A grandeza pedida não está entre os cálculos locais disponíveis nesse formato. Informe o enunciado completo; não vou calcular outra grandeza como se fosse a solicitada.');
  if(operation){
    const labels=[...raw.matchAll(/(Δ\s*[HSG]|2\s*θ|θ|λ|\b[TMZan])\s*[=:]/gu)].map(m=>m[1].replace(/\s/g,''));
    if(new Set(labels).size<labels.length)return missing('Há mais de um valor para a mesma grandeza no enunciado. Indique qual conjunto de dados devo usar ou peça um cálculo por vez.');
  }
  if((!operation||/^(?:nos?\b)/.test(requested))&&/\b(?:nos|no radial|no angular)\b/.test(t)){
    const orbital=raw.match(/\b([1-9]\d?)\s*([spdfgh])\b/iu);
    if(orbital){const principal=n(orbital[1]),l='spdfgh'.indexOf(orbital[2].toLowerCase());
      if(l>=principal)return missing('Esse orbital não é permitido no modelo hidrogenoide: deve valer 0 ≤ l ≤ n−1. Confira os números quânticos antes de contar os nós.',['quantum']);
      return result('**Cálculo — nós de um orbital hidrogenoide**\n\nPara '+orbital[1]+orbital[2].toLowerCase()+', n = '+principal+' e l = '+l+'.\n\nNós radiais = n − l − 1 = **'+(principal-l-1)+'**; nós angulares = l = **'+l+'**; total = n − 1 = **'+(principal-1)+'**. Um nó corresponde a ψ=0 e |ψ|²=0, não a uma parede material.',['quantum']);}
  }
  if((!operation||/^(?:valores (?:de )?l\b|l\b)/.test(requested))&&/\bvalores (?:possiveis )?(?:de )?l\b/.test(t)){
    const principal=match('\\bn\\s*=\\s*('+number+')');
    if(principal){const N=n(principal[1]);if(!Number.isInteger(N)||N<1)return missing('O número quântico principal n deve ser um inteiro positivo. Para esse modelo, l vai de 0 a n−1.',['quantum']);
      return result('**Cálculo — valores permitidos de l**\n\nPara n = '+N+', l assume os inteiros de 0 a n−1: **'+(N<=12?Array.from({length:N},(_,i)=>i).join(', '):'0, 1, …, '+(N-1))+'**. Esse conjunto vem da condição 0 ≤ l ≤ n−1, não de uma escolha arbitrária de orbitais.',['quantum']);}
  }
  if(operation&&/^(?:gibbs|delta g|energia (?:livre )?(?:de )?gibbs)\b/.test(requested)){
    const h=match('(?:Δ\\s*H|delta\\s*H|entalpia)\\s*[=:]?\\s*('+number+')\\s*(k?J)\\s*\\/?\\s*mol');
    const s=match('(?:Δ\\s*S|delta\\s*S|entropia)\\s*[=:]?\\s*('+number+')\\s*(k?J)\\s*[/·]?\\s*\\(?\\s*mol\\s*[·.*]?\\s*K\\)?');
    const temp=match('(?:\\bT|temperatura)\\s*[=:]?\\s*('+number+')\\s*(K|°?C)\\b');
    if(!h||!s||!temp)return missing('Para calcular ΔG = ΔH − TΔS, informe **ΔH, ΔS e a temperatura**, com unidades. Falta um desses dados ou a unidade não foi reconhecida. Use, por exemplo, kJ/mol para ΔH, J/(mol K) para ΔS e K para T. Não é possível obter um valor numérico de ΔG apenas com ΔH e T.',['gibbs']);
    const H=n(h[1])*(h[2].toLowerCase()==='kj'?1:.001),S=n(s[1])*(s[2].toLowerCase()==='kj'?1:.001),T=n(temp[1])+(temp[2].toUpperCase().includes('C')?273.15:0);
    if(![H,S,T].every(Number.isFinite)||T<=0)return missing('Confira os dados: a temperatura termodinâmica deve ser positiva em kelvin, e ΔH e ΔS precisam de valores finitos e unidades compatíveis.',['gibbs']);
    const G=H-T*S;
    return result('**Cálculo — energia de Gibbs**\n\nUsando os dados fornecidos na mesma temperatura: ΔG = ΔH − TΔS.\n\nΔH = '+fmt(H)+' kJ/mol; ΔS = '+fmt(S)+' kJ/(mol K); T = '+fmt(T)+' K.\n\nΔG = '+fmt(H)+' − ('+fmt(T)+' × '+fmt(S)+') = **'+fmt(G)+' kJ/mol**.\n\nA conversão de J para kJ é necessária antes da subtração. O resultado corresponde às condições informadas; não deve ser confundido automaticamente com ΔG° nem com a rapidez da reação.',['gibbs']);
  }
  if(operation&&/^(?:d\b|espacamento)/.test(requested)&&/\b(?:bragg|difracao)\b/.test(t)){
    const order=match('\\bn\\s*=\\s*(\\d+)\\b(?![.,]\\d)'),wave=match('(?:λ|lambda|comprimento de onda)\\s*[=:]?\\s*('+number+')\\s*(Å|angstrom|nm|pm|m)(?![A-Za-z])');
    const two=match('2\\s*(?:θ|theta)\\s*[=:]?\\s*('+number+')\\s*(?:°|graus)'),theta=two||match('(?:θ|theta)\\s*[=:]?\\s*('+number+')\\s*(?:°|graus)');
    if(!order||!wave||!theta)return missing('Para aplicar nλ = 2d sen θ, informe a ordem **n**, o comprimento de onda **λ com unidade** e o ângulo **θ ou 2θ em graus**. Não vou assumir que o ângulo do difratograma seja θ.',['bragg']);
    const N=n(order[1]),L=n(wave[1]),angle=n(theta[1])/(two?2:1);
    if(!Number.isInteger(N)||N<1||!Number.isFinite(L)||L<=0||!Number.isFinite(angle)||angle<=0||angle>90)return missing('Confira os dados de Bragg: n deve ser um inteiro positivo, λ deve ser positivo e o ângulo θ deve estar entre 0° e 90°, excluindo 0°.',['bragg']);
    const d=N*L/(2*Math.sin(angle*Math.PI/180));
    return result('**Cálculo — espaçamento pela lei de Bragg**\n\nnλ = 2d sen θ; portanto d = nλ/(2 sen θ).\n\n'+(two?'O ângulo informado é 2θ; por isso θ = '+fmt(angle)+'°.\n\n':'')+'Com n = '+N+', λ = '+fmt(L)+' '+wave[2]+' e θ = '+fmt(angle)+'°, resulta **d = '+fmt(d)+' '+wave[2]+'**. A unidade de d é a mesma de λ.',['bragg']);
  }
  if(operation&&/^densidade\b/.test(requested)){
    const structure=/\b(?:cfc|fcc)\b/.test(t)?4:/\b(?:ccc|bcc)\b/.test(t)?2:/\bcubica simples\b/.test(t)?1:0;
    const a=match('\\ba\\s*=\\s*('+number+')\\s*(Å|angstrom|nm|pm|cm|m)(?![A-Za-z])'),mass=match('\\bM\\s*=\\s*('+number+')\\s*(kg|g)\\s*\\/\\s*mol\\b');
    if(!structure||!a||!mass||!/\b(?:monoatomic[ao]|cobre|ferro|aluminio|metal)\b/.test(t))return missing('Informe **massa e volume**, ou, para o cálculo de uma célula cúbica monoatômica, **estrutura, parâmetro a com unidade e massa molar M**. A fórmula cristalográfica é ρ = N M/(Nₐ a³), e N depende do motivo; não vou supor um átomo por ponto de rede sem esse contexto.',['packing']);
    const factor={Å:1e-8,angstrom:1e-8,nm:1e-7,pm:1e-10,cm:1,m:100},length=n(a[1])*(factor[a[2]]||factor[a[2].toLowerCase()]),M=n(mass[1])*(mass[2].toLowerCase()==='kg'?1000:1);
    if(!Number.isFinite(length)||length<=0||!Number.isFinite(M)||M<=0)return missing('Parâmetro de rede e massa molar devem ser positivos, finitos e acompanhados de unidades reconhecidas.',['packing']);
    const density=structure*M/(6.02214076e23*length**3);
    if(!Number.isFinite(density))return missing('A combinação de dados não permitiu obter uma densidade finita. Confira valores e unidades.',['packing']);
    return result('**Cálculo — densidade cristalográfica**\n\nPara o modelo cúbico monoatômico informado, N = '+structure+' átomos por célula convencional.\n\nρ = N M/(Nₐ a³), com Nₐ = 6,02214076×10²³ mol⁻¹. Usando a = '+fmt(n(a[1]))+' '+a[2]+' e M = '+fmt(M)+' g/mol, obtém-se **ρ ≈ '+fmt(density)+' g/cm³**. A conversão do comprimento deve ser elevada ao cubo.',['packing']);
  }
  if(operation&&/^energia\b/.test(requested)&&/\bhidrogenio\b/.test(t)){
    const level=match('\\bn\\s*=\\s*(\\d+)\\b(?![.,]\\d)');
    if(!level||!Number.isSafeInteger(n(level[1]))||n(level[1])<1)return missing('Informe um nível n inteiro positivo para calcular a energia do hidrogênio no modelo hidrogenoide.',['quantum']);
    const levelN=n(level[1]),energy=-13.6/levelN**2;
    return result('**Cálculo — nível de energia do hidrogênio**\n\nNo modelo coulombiano não relativístico com núcleo fixo, Eₙ ≈ −13,6/n² eV para H, com Z=1.\n\nPara n = '+levelN+', **Eₙ ≈ '+fmt(energy)+' eV**. O zero de energia corresponde ao limite de ionização; esse valor é a energia do nível, não a energia de qualquer transição entre dois níveis.',['quantum']);
  }
  if(/\bquantos eletrons\b/.test(t)){
    const z=match('\\bZ\\s*=\\s*('+number+')\\b'),ions=[...raw.matchAll(/\b([A-Z][a-z]?)(\d{1,2})?([+-])(?=$|[\s,;.?])/gu)];
    if(ions.length>1)return missing('Informe um íon monoatômico por cálculo para eu identificar sem ambiguidade a carga e a contagem de elétrons.',['atomic-structure']);
    const ion=ions[0],knownZ=ion?window.SiMoEnsSearchCore?.atomicNumberForSymbol?.(ion[1]):null;
    if(ion&&knownZ){const Z=z?n(z[1]):knownZ,charge=n(ion[2]||1)*(ion[3]==='+'?1:-1),e=Z-charge;
      if(Z!==knownZ)return missing('O Z informado não corresponde ao símbolo químico: '+ion[1]+' tem Z='+knownZ+'. Confira o enunciado antes do cálculo.',['atomic-structure','periodic']);
      if(Z<1||Z>118||e<0||charge===0)return missing('Confira o número atômico e a carga: a contagem de elétrons deve ser não negativa e um íon indicado com sinal deve ter carga diferente de zero.',['atomic-structure']);
      return result('**Cálculo — elétrons de um íon monoatômico**\n\nNₑ = Z − q, com q como carga algébrica em unidades elementares. Para os dados fornecidos, Z = '+Z+' e q = '+fmt(charge)+'; portanto **Nₑ = '+e+' elétrons**. Perder elétrons não altera o número de prótons.',['atomic-structure']);}
  }
  if((operation&&/^massa(?! molar)\b/.test(requested))||/\bqual (?:e )?a massa(?! molar)\b/.test(t)){
    const amount=match('('+number+')\\s*(mmol|mol)\\b'),mass=match('\\bM\\s*=\\s*('+number+')\\s*(kg|g)\\s*\\/\\s*mol\\b');
    if(!amount||!mass)return missing('Para usar m = nM, informe a quantidade de matéria n e a massa molar M com unidades. Esse cálculo não determina sozinho a composição de uma amostra desconhecida.',['stoichiometry']);
    const mol=n(amount[1])*(amount[2].toLowerCase()==='mmol'?.001:1),M=n(mass[1])*(mass[2].toLowerCase()==='kg'?1000:1);
    if(!Number.isFinite(mol)||mol<0||!Number.isFinite(M)||M<=0)return missing('Confira os dados: quantidade de matéria não pode ser negativa, e a massa molar deve ser positiva.',['stoichiometry']);
    return result('**Cálculo — massa e quantidade de matéria**\n\nm = nM = '+fmt(mol)+' mol × '+fmt(M)+' g/mol = **'+fmt(mol*M)+' g**. O resultado usa a massa molar fornecida, sem confundi-la com número de massa de um isótopo.',['stoichiometry']);
  }
  if((!operation||/^volume\b/.test(requested))&&/\bbureta\b/.test(t)&&/\b(?:comeca|inicial)\b/.test(t)&&/\b(?:termina|final)\b/.test(t)){
    const initial=match('(?:começa|comeca|inicial)\\s*(?:em|de|[=:])?\\s*('+number+')\\s*mL'),final=match('(?:termina|final)\\s*(?:em|de|[=:])?\\s*('+number+')\\s*mL');
    if(!initial||!final)return missing('Informe as leituras inicial e final da bureta, identificadas e na mesma unidade, para calcular o volume entregue.',['lab']);
    const first=n(initial[1]),last=n(final[1]);
    if(first<0||last<first)return missing('Confira a sequência das leituras. Para uma bureta usual, sem reabastecimento, o volume entregue é leitura final menos inicial; os dados informados não atendem a essa condição.',['lab']);
    const places=value=>{const [mantissa,exponent='0']=value.toLowerCase().split('e');return Math.max(0,(mantissa.split(/[.,]/)[1]||'').length-Number(exponent));};
    const digits=Math.min(8,places(initial[1]),places(final[1]));
    const volume=(value,precision=digits)=>new Intl.NumberFormat('pt-BR',{minimumFractionDigits:precision,maximumFractionDigits:precision,useGrouping:false}).format(value);
    return result('**Cálculo — volume entregue pela bureta**\n\nSem reabastecimento entre as leituras: V = Vfinal − Vinicial = '+volume(last,Math.min(8,places(final[1])))+' − '+volume(first,Math.min(8,places(initial[1])))+' = **'+volume(last-first)+' mL**. O resultado foi arredondado às casas decimais da leitura menos detalhada; isso não substitui a avaliação da incerteza de leitura e de calibração do instrumento.',['lab']);
  }
  if(operation&&/\bbalanceie\b/.test(t)&&/H2\s*\+\s*O2\s*(?:->|→|=)\s*H2O\b/iu.test(raw))return result('**Balanceamento — formação da água**\n\n**2 H₂ + O₂ → 2 H₂O**.\n\nHá quatro átomos de H e dois de O em cada lado. Ajustam-se os coeficientes; os índices das fórmulas ficam preservados, porque alterá-los muda as espécies.',['balance']);
  if(operation)return missing('Ainda não tenho uma resolução local revisada para esse cálculo ou para esse formato de dados. Envie o enunciado completo e as unidades. Posso explicar o método correspondente quando houver base suficiente, mas não vou apresentar uma definição genérica como se fosse o resultado numérico.');
  return null;
}

const ACTIVE_MODEL_ID = 'Qwen2.5-3B-Instruct-q4f16_1-MLC';
const SITE_URL = 'https://quimicavisualufv.github.io/Quimica-Visual/';
const SITE_ROOT_URL = new URL('../../', document.currentScript?.src || new URL('assets/chat-widget/chat-widget.js', document.baseURI).href).href;
const BASE_SYSTEM_PROMPT = `Você é o Assistente do SiMoEns, especializado em Química e nos recursos educacionais da plataforma. Responda sempre em português do Brasil, com linguagem didática, natural e cientificamente cuidadosa. Comece pela resposta direta e só depois desenvolva o raciocínio necessário. Diferencie modelos didáticos de observações experimentais, não trate representações visuais como se estivessem necessariamente em escala e sinalize incerteza quando a base fornecida não sustentar uma conclusão. Use o contexto da página atual e o assunto recente para interpretar continuações como “isso”, “e por quê?”, “me dê um exemplo” ou “qual exercício posso fazer?”. Não force uma conexão artificial com Química quando a pergunta estiver claramente fora do escopo: explique brevemente o limite e convide o usuário a trazer uma dúvida de Química ou do SiMoEns. Só recomende uma página quando o usuário pedir indicação, navegação, uma forma de estudar, praticar, visualizar ou jogar. Não acrescente listas automáticas de links ao final de explicações conceituais. Toda página citada deve existir no mapa fornecido. Não invente recursos, URLs, funcionalidades, resultados experimentais nem conteúdo científico ausente do contexto. Não exponha detalhes internos de implementação.`;
const DEFAULT_GENERATION_CONFIG = Object.freeze({
  temperature: 0.2,
  maxTokens: 320,
  topP: 0.9,
  repetitionPenalty: 1.05,
  seed: null,
  systemPrompt: BASE_SYSTEM_PROMPT,
});

const SAMPLE_QUESTIONS = [
  "Quais recursos existem para estudar geometria molecular?",
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
  "Sobre o que fala o exercício de coordenação e empacotamento?",
  "Explique de forma científica por que gemas têm cores diferentes",
  "Quais defeitos cristalinos podem alterar a cor de uma gema?",
  "Qual é a diferença entre rubi e safira do ponto de vista químico?",
  "Me faça uma questão sobre gemas e centros de cor",
  "Qual é o link da animação Gemas e mudança de cor?",
  "O que mostra a animação Gemas e mudança de cor?",
  "Qual é o link do Laboratório Interativo de vidrarias?",
  "Quais vidrarias existem no laboratório interativo?",
  "Para que serve um béquer?",
  "Qual a diferença entre proveta, pipeta, bureta e balão volumétrico?",
  "Me faça uma questão sobre vidrarias de laboratório"
];

const SHARED_REPLY_REFINER_PROMPT = `Você vai atuar como refinador de uma resposta didática do SiMoEns. Receberá a pergunta do usuário, uma resposta-base fundamentada e o contexto da página. Reescreva apenas para melhorar clareza, fluidez e adequação pedagógica, preservando conteúdo factual, grau de certeza, limitações e foco. Comece pela resposta direta. Não acrescente conceitos, páginas, links, recomendações ou exemplos que não estejam na resposta-base. Não transforme uma explicação em propaganda da plataforma. Não diga que está refinando. Entregue somente a resposta final, em português do Brasil.`;
const REFUSAL_REPAIR_PROMPT = `A tentativa anterior ficou excessivamente recusada, vaga ou defensiva. Refaça agora a resposta de modo direto, útil e didático. Se a pergunta estiver dentro de Química, do SiMoEns ou do contexto recente, responda normalmente sem mencionar limitação genérica, política, escopo ou falta de contexto como motivo de recusa. Quando houver ambiguidade leve, escolha a interpretação química mais provável e avise isso em uma frase curta. Não invente dados específicos do site.`;
const WEBLLM_IMPORT_CANDIDATES = [
  window.SIMOENS_WEBLLM_IMPORT_URL,
  'https://esm.run/@mlc-ai/web-llm'
].filter(Boolean);
const OFF_TOPIC_REPLY = 'Meu foco é Química e os conteúdos do SiMoEns, então não tenho uma resposta confiável para esse assunto. Se quiser, envie um conceito químico, uma dúvida de estudo ou o nome de uma experiência da plataforma.';
const GENERIC_HELP_REPLY = `Posso ajudar destas formas:

- **Explicar e comparar conceitos:** por exemplo, "o que é célula unitária?" ou "compare ligação iônica e covalente".
- **Resumir um assunto, uma resposta ou um material local.**
- **Gerar questões:** simples, em conjunto ou guiadas passo a passo.
- **Encontrar recursos reais do SiMoEns:** informe o tema e peça um guia, exercício, visualizador ou jogo.
- **Explicar a experiência atual:** pergunte "o que estou vendo?" ou "como uso esta tela?".
- **Ajudar com acessibilidade e navegação:** pergunte sobre fonte, contraste, leitura em voz alta, redução de efeitos ou links.
- **Escolher o aprimoramento da IA:** use o seletor acima da caixa de mensagem: Automático, Ligado ou Desligado. Exercícios com gabarito, links e respostas sem base suficiente permanecem locais.

As indicações aparecem quando você pede um recurso ou uma forma de estudar, praticar, visualizar ou jogar. Se a base não sustentar a resposta, eu aviso em vez de inventar.`;
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
const DOC_RAG_CHUNKS_URL = window.SIMOENS_DOC_CHUNKS_URL || window.SIMOENS_DOC_INDEX_URL || new URL('../../assets/chat/docs/doc_index.json?v=20261025-science-r4', WIDGET_SCRIPT_SRC).href;
const IS_LOCAL_FILE_RUNTIME = window.location.protocol === 'file:' || window.location.origin === 'null';
const DOC_RAG_MAX_CHUNKS = Number.isFinite(Number(window.SIMOENS_DOC_RAG_MAX_CHUNKS)) ? Math.max(1, Math.min(8, Number(window.SIMOENS_DOC_RAG_MAX_CHUNKS))) : 5;
const DOC_RAG_MIN_SCORE = Number.isFinite(Number(window.SIMOENS_DOC_RAG_MIN_SCORE)) ? Number(window.SIMOENS_DOC_RAG_MIN_SCORE) : 2.2;
const DOC_RAG_MAX_CHARS = Number.isFinite(Number(window.SIMOENS_DOC_RAG_MAX_CHARS)) ? Math.max(240, Math.min(1600, Number(window.SIMOENS_DOC_RAG_MAX_CHARS))) : 1000;
const SEARCH_CORE_URL = window.SIMOENS_SEARCH_CORE_URL || new URL('simoens-search-core.js?v=20261025-content-r10', WIDGET_SCRIPT_SRC).href;
const CONTENT_REGISTRY_URL = window.SIMOENS_CONTENT_REGISTRY_URL || new URL('../../assets/chat/content-registry.json', WIDGET_SCRIPT_SRC).href;
// WebLLM remains a progressive enhancement. It is never downloaded unless a host
// explicitly opts in before this script is evaluated.
const WEBLLM_ENABLED = window.SIMOENS_ENABLE_WEBLLM === true;
// O widget é autocontido. A lista vazia evita requisições para módulos antigos
// que não fazem parte desta distribuição e mantém o modo offline sem erros 404.
const SHARED_CORE_SCRIPTS = [];
const SHARED_SCRIPT_PROMISES = Object.create(null);

const SCIENTIFIC_REFERENCES = Object.freeze({
  "packing": {
    "id": "packing",
    "title": "Chemistry 2e — 10.6. Lattice Structures in Crystalline Solids",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/10-6-lattice-structures-in-crystalline-solids",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "solids": {
    "id": "solids",
    "title": "Chemistry 2e — 10.5. The Solid State of Matter",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/10-5-the-solid-state-of-matter",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "vsepr": {
    "id": "vsepr",
    "title": "Chemistry 2e — 7.6. Molecular Structure and Polarity",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/7-6-molecular-structure-and-polarity",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "lewis": {
    "id": "lewis",
    "title": "Chemistry 2e — 7.4. Formal Charges and Resonance",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/7-4-formal-charges-and-resonance",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "interactions": {
    "id": "interactions",
    "title": "Chemistry 2e — 10.1. Intermolecular Forces",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/10-1-intermolecular-forces",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "enthalpy": {
    "id": "enthalpy",
    "title": "Chemistry 2e — 5.3. Enthalpy",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/5-3-enthalpy",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "entropy": {
    "id": "entropy",
    "title": "Chemistry 2e — 16.2. Entropy",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/16-2-entropy",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "gibbs": {
    "id": "gibbs",
    "title": "Chemistry 2e — 16.4. Free Energy",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/16-4-free-energy",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "catalysis": {
    "id": "catalysis",
    "title": "Chemistry 2e — 12.7. Catalysis",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/12-7-catalysis",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "equilibrium": {
    "id": "equilibrium",
    "title": "Chemistry 2e — 13.2. Equilibrium Constants",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/13-2-equilibrium-constants",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "ph": {
    "id": "ph",
    "title": "Chemistry 2e — 14.2. pH and pOH",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/14-2-ph-and-poh",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "stoichiometry": {
    "id": "stoichiometry",
    "title": "Chemistry 2e — 4.3. Reaction Stoichiometry",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "quantum": {
    "id": "quantum",
    "title": "Chemistry 2e — 6.3. Development of Quantum Theory",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/6-3-development-of-quantum-theory",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "mo": {
    "id": "mo",
    "title": "Chemistry 2e — 8.4. Molecular Orbital Theory",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/8-4-molecular-orbital-theory",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "coordination": {
    "id": "coordination",
    "title": "Chemistry 2e — 19.2. Coordination Chemistry of Transition Metals",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/19-2-coordination-chemistry-of-transition-metals",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "cft": {
    "id": "cft",
    "title": "Chemistry 2e — 19.3. Spectroscopic and Magnetic Properties of Coordination Compounds",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/19-3-spectroscopic-and-magnetic-properties-of-coordination-compounds",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "functional": {
    "id": "functional",
    "title": "Organic Chemistry — 3.1. Functional Groups",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/organic-chemistry/pages/3-1-functional-groups",
    "accessed": "2026-10-25",
    "year": 2023
  },
  "organic-names": {
    "id": "organic-names",
    "title": "Organic Chemistry — 17.1. Naming Alcohols and Phenols",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/organic-chemistry/pages/17-1-naming-alcohols-and-phenols",
    "accessed": "2026-10-25",
    "year": 2023
  },
  "markovnikov": {
    "id": "markovnikov",
    "title": "Organic Chemistry — 7.8. Orientation of Electrophilic Additions: Markovnikov’s Rule",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/organic-chemistry/pages/7-8-orientation-of-electrophilic-additions-markovnikovs-rule",
    "accessed": "2026-10-25",
    "year": 2023
  },
  "crystal": {
    "id": "crystal",
    "title": "Direct lattice",
    "publisher": "International Union of Crystallography — Online Dictionary",
    "url": "https://dictionary.iucr.org/Direct_lattice",
    "accessed": "2026-10-25"
  },
  "symmetry": {
    "id": "symmetry",
    "title": "How to read (and understand) Volume A of International Tables for Crystallography",
    "publisher": "Journal of Applied Crystallography / IUCr",
    "url": "https://journals.iucr.org/j/issues/2010/05/02/kk5061/index.html",
    "accessed": "2026-10-25",
    "year": 2010
  },
  "miller": {
    "id": "miller",
    "title": "Miller indices",
    "publisher": "International Union of Crystallography — Online Dictionary",
    "url": "https://dictionary.iucr.org/Miller_indices",
    "accessed": "2026-10-25"
  },
  "bragg": {
    "id": "bragg",
    "title": "Bragg’s law",
    "publisher": "International Union of Crystallography — Online Dictionary",
    "url": "https://dictionary.iucr.org/Bragg's_law",
    "accessed": "2026-10-25"
  },
  "oxidation": {
    "id": "oxidation",
    "title": "Comprehensive definition of oxidation state",
    "publisher": "IUPAC Recommendations",
    "url": "https://iupac.org/recommendation/comprehensive-definition-of-oxidation-state/",
    "accessed": "2026-10-25",
    "year": 2016
  },
  "jahn-teller": {
    "id": "jahn-teller",
    "title": "Jahn–Teller effect",
    "publisher": "IUPAC Gold Book",
    "url": "https://goldbook.iupac.org/terms/view/J03361",
    "accessed": "2026-10-25"
  },
  "atomic-weights": {
    "id": "atomic-weights",
    "title": "Abridged Standard Atomic Weights 2024",
    "publisher": "CIAAW / IUPAC",
    "url": "https://www.ciaaw.org/abridged-atomic-weights.htm",
    "accessed": "2026-10-25",
    "year": 2024
  },
  "radioisotopes": {
    "id": "radioisotopes",
    "title": "Radioactive Elements",
    "publisher": "CIAAW / IUPAC",
    "url": "https://www.ciaaw.org/radioactive-elements.htm",
    "accessed": "2026-10-25"
  },
  "gem-color": {
    "id": "gem-color",
    "title": "The origins of color in minerals — Kurt Nassau",
    "publisher": "American Mineralogist, v. 63, p. 219–229 / Mineralogical Society of America",
    "url": "https://msaweb.org/msa/Collectors_Corner/arc/color.htm",
    "accessed": "2026-10-25",
    "year": 1978
  },
  "alexandrite": {
    "id": "alexandrite",
    "title": "Explanation of the Colour Change in Alexandrites",
    "publisher": "Scientific Reports",
    "url": "https://www.nature.com/articles/s41598-020-62707-3",
    "accessed": "2026-10-25",
    "year": 2020
  },
  "gem-treatment": {
    "id": "gem-treatment",
    "title": "An Introduction to Gem Treatments",
    "publisher": "Gemological Institute of America",
    "url": "https://my.gia.edu/articles/gem-treatment",
    "accessed": "2026-10-25"
  },
  "smoky-quartz": {
    "id": "smoky-quartz",
    "title": "Irradiated Quartz Crystal (Smoky Quartz)",
    "publisher": "Oak Ridge Associated Universities — Museum of Radiation and Radioactivity",
    "url": "https://www.orau.org/health-physics-museum/collection/lichtenberg/gemstones/quartz.html",
    "accessed": "2026-10-25"
  },
  "amethyst": {
    "id": "amethyst",
    "title": "Amethyst",
    "publisher": "Oak Ridge Associated Universities — Museum of Radiation and Radioactivity",
    "url": "https://www.orau.org/health-physics-museum/collection/lichtenberg/gemstones/amethyst.html",
    "accessed": "2026-10-25"
  },
  "water": {
    "id": "water",
    "title": "NIST Standard Reference Database 10 — Steam",
    "publisher": "National Institute of Standards and Technology",
    "url": "https://www.nist.gov/document/steam-manual-222pdf",
    "accessed": "2026-10-25"
  },
  "lab": {
    "id": "lab",
    "title": "Using Standard Laboratory Equipment",
    "publisher": "Indiana University East — Experimental Chemistry Laboratory Manual",
    "url": "https://iu.pressbooks.pub/iuegenchemlabs/front-matter/using-standard-laboratory-equipment/",
    "accessed": "2026-10-25"
  },
  "lab-safety": {
    "id": "lab-safety",
    "title": "Prudent Practices in the Laboratory: Handling and Management of Chemical Hazards",
    "publisher": "National Research Council / National Academies Press",
    "url": "https://www.ncbi.nlm.nih.gov/books/NBK55878/",
    "accessed": "2026-10-25",
    "year": 2011
  },
  "opal": {
    "id": "opal",
    "title": "Opal — Gem Encyclopedia",
    "publisher": "Gemological Institute of America",
    "url": "https://www.gia.edu/opal-description",
    "accessed": "2026-10-25"
  },
  "ruby": {
    "id": "ruby",
    "title": "Ruby — Gem Encyclopedia",
    "publisher": "Gemological Institute of America",
    "url": "https://www.gia.edu/ruby-description",
    "accessed": "2026-10-25"
  },
  "emerald": {
    "id": "emerald",
    "title": "Emerald — Gem Encyclopedia",
    "publisher": "Gemological Institute of America",
    "url": "https://www.gia.edu/emerald-description",
    "accessed": "2026-10-25"
  },
  "sapphire": {
    "id": "sapphire",
    "title": "Sapphire — Gem Encyclopedia",
    "publisher": "Gemological Institute of America",
    "url": "https://www.gia.edu/sapphire-description",
    "accessed": "2026-10-25"
  },
  "diamond": {
    "id": "diamond",
    "title": "Diamond — Gem Encyclopedia",
    "publisher": "Gemological Institute of America",
    "url": "https://www.gia.edu/diamond-description",
    "accessed": "2026-10-25"
  },
  "alexandrite-gia": {
    "id": "alexandrite-gia",
    "title": "Alexandrite — Gem Encyclopedia",
    "publisher": "Gemological Institute of America",
    "url": "https://www.gia.edu/alexandrite-description",
    "accessed": "2026-10-25"
  },
  "balance": {
    "id": "balance",
    "title": "Chemistry 2e — 4.1. Writing and Balancing Chemical Equations",
    "publisher": "OpenStax",
    "year": 2019,
    "url": "https://openstax.org/books/chemistry-2e/pages/4-1-writing-and-balancing-chemical-equations",
    "accessed": "2026-10-25"
  },
  "periodic": {
    "id": "periodic",
    "title": "Periodic Table — element information, properties and uses",
    "publisher": "Royal Society of Chemistry",
    "url": "https://periodic-table.rsc.org/",
    "accessed": "2026-10-25"
  },
  "rate-laws": {
    "id": "rate-laws",
    "title": "Chemistry 2e — 12.3. Rate Laws",
    "publisher": "OpenStax",
    "year": 2019,
    "url": "https://openstax.org/books/chemistry-2e/pages/12-3-rate-laws",
    "accessed": "2026-10-25"
  },
  "unit-cell": {
    "id": "unit-cell",
    "title": "Unit cell",
    "publisher": "International Union of Crystallography — Online Dictionary",
    "url": "https://dictionary.iucr.org/Unit_cell",
    "accessed": "2026-10-25"
  },
  "primitive-cell": {
    "id": "primitive-cell",
    "title": "Primitive cell",
    "publisher": "International Union of Crystallography — Online Dictionary",
    "url": "https://dictionary.iucr.org/Primitive_cell",
    "accessed": "2026-10-25"
  },
  "atomic-structure": {
    "id": "atomic-structure",
    "title": "Chemistry 2e — 2.3. Atomic Structure and Symbolism",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "titration": {
    "id": "titration",
    "title": "Chemistry 2e — 4.5. Quantitative Chemical Analysis",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/4-5-quantitative-chemical-analysis",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "electrostatic-potential": {
    "id": "electrostatic-potential",
    "title": "Organic Chemistry — 2.1. Polar Covalent Bonds and Electronegativity",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/organic-chemistry/pages/2-1-polar-covalent-bonds-and-electronegativity",
    "accessed": "2026-10-25",
    "year": 2023
  },
  "electric-potential": {
    "id": "electric-potential",
    "title": "University Physics Volume 2 — 7.2. Electric Potential and Potential Difference",
    "publisher": "OpenStax",
    "year": 2016,
    "url": "https://openstax.org/books/university-physics-volume-2/pages/7-2-electric-potential-and-potential-difference",
    "accessed": "2026-10-25"
  },
  "radial-probability": {
    "id": "radial-probability",
    "title": "Physical Chemistry — Lectures 21–22: The Hydrogen Atom",
    "publisher": "MIT OpenCourseWare — 5.61",
    "year": 2007,
    "url": "https://ocw.mit.edu/courses/5-61-physical-chemistry-fall-2007/c2078ff25c61c136e67ceb6fd8eb9b34_lecture21to22.pdf",
    "accessed": "2026-10-25"
  },
  "electron-configuration": {
    "id": "electron-configuration",
    "title": "Chemistry 2e — 6.4. Electronic Structure of Atoms (Electron Configurations)",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/6-4-electronic-structure-of-atoms-electron-configurations",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "atomic-history": {
    "id": "atomic-history",
    "title": "Chemistry 2e — 2.2. Evolution of Atomic Theory",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/2-2-evolution-of-atomic-theory",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "hybrid-orbitals": {
    "id": "hybrid-orbitals",
    "title": "Chemistry 2e — 8.2. Hybrid Atomic Orbitals",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/8-2-hybrid-atomic-orbitals",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "valence-bond": {
    "id": "valence-bond",
    "title": "Chemistry 2e — 8.1. Valence Bond Theory",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/8-1-valence-bond-theory",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "resonance": {
    "id": "resonance",
    "title": "Chemistry 2e — 7.4. Formal Charges and Resonance",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/7-4-formal-charges-and-resonance",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "phase-transitions": {
    "id": "phase-transitions",
    "title": "Chemistry 2e — 10.3. Phase Transitions",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/10-3-phase-transitions",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "phase-diagrams": {
    "id": "phase-diagrams",
    "title": "Chemistry 2e — 10.4. Phase Diagrams",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/10-4-phase-diagrams",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "acid-strength": {
    "id": "acid-strength",
    "title": "Chemistry 2e — 14.3. Relative Strengths of Acids and Bases",
    "publisher": "OpenStax",
    "url": "https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases",
    "accessed": "2026-10-25",
    "year": 2019
  },
  "gem-identification": {
    "id": "gem-identification",
    "title": "How GIA Analyzes Colored Stones from Start to Finish",
    "publisher": "Gemological Institute of America",
    "url": "https://www.gia.edu/gia-news-research/guide-how-gia-analyzes-colored-stones",
    "accessed": "2026-10-25",
    "year": 2025
  },
  "gem-synthesis": {
    "id": "gem-synthesis",
    "title": "Man-made Diamonds: Questions and Answers",
    "publisher": "Gemological Institute of America",
    "url": "https://www.gia.edu/gia-news-research/manmade-diamonds-questions-answers",
    "accessed": "2026-10-25",
    "year": 2017
  },
  "lab-practices": {
    "id": "lab-practices",
    "title": "Prudent Practices in the Laboratory — Working with Chemicals",
    "publisher": "National Research Council / National Academies Press",
    "url": "https://www.ncbi.nlm.nih.gov/books/NBK55872/",
    "accessed": "2026-10-25",
    "year": 2011
  },
  "bleach-compatibility": {
    "id": "bleach-compatibility",
    "title": "Sodium Hypochlorite (Bleach) Incompatibility",
    "publisher": "University of Utah — Environmental Health and Safety",
    "url": "https://www.ehs.utah.edu/guidelines/sodium-hypochlorite-bleach-incompatibility/",
    "accessed": "2026-10-25"
  },
  "ion-dipole-origin": {
    "id": "ion-dipole-origin",
    "title": "Origin-Dependence of Dipole Moments of Charged Proteins: Theoretical Foundations and Implications, Revisited",
    "publisher": "Journal of Computational Chemistry — Wiley",
    "url": "https://doi.org/10.1002/jcc.70207",
    "accessed": "2026-10-25",
    "year": 2025
  },
  "permanganate-spectrum": {
    "id": "permanganate-spectrum",
    "title": "Absorption and luminescence spectroscopy of the MnO4 centers in alkali halide crystals",
    "publisher": "Journal of Alloys and Compounds — Elsevier",
    "url": "https://www.sciencedirect.com/science/article/pii/S0925838802001007",
    "accessed": "2026-10-25",
    "year": 2002
  },
  "crystal-definition": {
    "id": "crystal-definition",
    "title": "Crystal",
    "publisher": "International Union of Crystallography — Online Dictionary",
    "url": "https://dictionary.iucr.org/Crystal",
    "accessed": "2026-10-25"
  }
});

const WidgetKeywordBot = (() => {
function normalize(value = '') {
  return window.SiMoEnsSearchCore?.normalizeQuery?.(value) || window.SiMoEnsSearchCore?.normalize?.(value) || String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

const elementsData = {
  "h": "**Hidrogênio (H)**\n- **Número atômico:** 1\n- **Massa atômica média aproximada:** 1,008 u\n- **Grupo:** 1 (não metal)\n- **Estado físico a 25 °C e 1 bar:** Gás incolor\n- **Características:** É o elemento mais leve e abundante no universo (cerca de 75% da massa elementar). Altamente inflamável. Forma a água (H₂O) e a maioria dos compostos orgânicos.\n- **Aplicações do elemento ou de seus compostos:** Combustível de foguetes, células a combustível, produção de amônia (processo Haber) e hidrogenação de óleos.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "he": "**Hélio (He)**\n- **Número atômico:** 2\n- **Massa atômica média aproximada:** 4,0026 u\n- **Grupo:** 18 (Gás Nobre)\n- **Estado físico a 25 °C e 1 bar:** Gás incolor\n- **Características:** O segundo elemento mais leve e abundante. É quimicamente pouco reativo em condições ambientes e não inflamável. Seu ponto de ebulição à pressão atmosférica é o menor entre os elementos.\n- **Aplicações do elemento ou de seus compostos:** Enchimento de balões e dirigíveis, resfriamento de ímãs supercondutores (como em máquinas de ressonância magnética) e misturas respiratórias para mergulho profundo.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "li": "**Lítio (Li)**\n- **Número atômico:** 3\n- **Massa atômica média aproximada:** 6,94 u\n- **Grupo:** 1 (metal alcalino)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal macio e prateado)\n- **Características:** Metal alcalino leve e reativo. Compostos de lítio em baterias de íon-lítio não devem ser confundidos com uma peça de lítio metálico.\n- **Aplicações do elemento ou de seus compostos:** Baterias recarregáveis (íon-lítio) para eletrônicos e veículos elétricos, ligas metálicas leves e medicamentos psiquiátricos (carbonato de lítio).\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "c": "**Carbono (C)**\n- **Número atômico:** 6\n- **Massa atômica média aproximada:** 12,011 u\n- **Grupo:** 14 (não metal)\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Base da química orgânica e da vida na Terra. Possui vários alótropos, como grafite (macio, condutor), diamante (extremamente duro, isolante) e fulerenos. Pode formar quatro ligações covalentes.\n- **Aplicações do elemento ou de seus compostos:** Combustíveis fósseis, plásticos, polímeros, aço (liga com ferro), joias (diamante) e nanotecnologia (grafeno).\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "n": "**Nitrogênio (N)**\n- **Número atômico:** 7\n- **Massa atômica média aproximada:** 14,007 u\n- **Grupo:** 15 (não metal)\n- **Estado físico a 25 °C e 1 bar:** Gás incolor\n- **Características:** O N₂ compõe cerca de 78% do volume do ar seco. Sua ligação tripla contribui para a baixa reatividade em muitas condições ambientes, mas o gás não é absolutamente inerte. O nitrogênio integra aminoácidos e ácidos nucleicos.\n- **Aplicações do elemento ou de seus compostos:** Produção de amônia e fertilizantes, explosivos, gás de proteção inerte na indústria e resfriamento criogênico (nitrogênio líquido).\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "o": "**Oxigênio (O)**\n- **Número atômico:** 8\n- **Massa atômica média aproximada:** 15,999 u\n- **Grupo:** 16 (Calcogênio / não metal)\n- **Estado físico a 25 °C e 1 bar:** Gás incolor\n- **Características:** O O₂ compõe cerca de 21% do volume do ar seco e participa de processos oxidativos e da respiração aeróbia. O elemento também é abundante em óxidos e silicatos da crosta terrestre.\n- **Aplicações do elemento ou de seus compostos:** Suporte à vida (medicina), processos de combustão, siderurgia, tratamento de água e produção de produtos químicos.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "f": "**Flúor (F)**\n- **Número atômico:** 9\n- **Massa atômica média aproximada:** 18,998 u\n- **Grupo:** 17 (Halogênio)\n- **Estado físico a 25 °C e 1 bar:** Gás amarelo-pálido\n- **Características:** O F₂ é um gás muito reativo e oxidante. Flúor elementar e íons fluoreto são espécies distintas; a elevada eletronegatividade refere-se ao átomo em ligações, não a uma escala universal de reatividade.\n- **Aplicações do elemento ou de seus compostos:** Prevenção de cáries (fluoretos em pastas de dente e água), produção de teflon (politetrafluoretileno) e enriquecimento de urânio.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "na": "**Sódio (Na)**\n- **Número atômico:** 11\n- **Massa atômica média aproximada:** 22,990 u\n- **Grupo:** 1 (metal alcalino)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal macio e prateado)\n- **Características:** O metal reage com água e oxida-se facilmente. As funções biológicas e a composição do sal de cozinha envolvem principalmente Na⁺ em compostos ou em solução, não sódio metálico.\n- **Aplicações do elemento ou de seus compostos:** Sal de cozinha (NaCl), iluminação pública (lâmpadas de vapor de sódio), fabricação de sabões e purificação de metais fundidos.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "mg": "**Magnésio (Mg)**\n- **Número atômico:** 12\n- **Massa atômica média aproximada:** 24,305 u\n- **Grupo:** 2 (metal alcalinoterroso)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal cinza-prateado)\n- **Características:** Metal leve e razoavelmente forte. Queima com uma luz branca ofuscante. Na clorofila, Mg²⁺ ocupa o centro do sistema de coordenação; isso não significa que a molécula contenha magnésio metálico.\n- **Aplicações do elemento ou de seus compostos:** Ligas metálicas leves (aeroespacial e automotiva), fogos de artifício, antiácidos (leite de magnésia) e refratários.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "al": "**Alumínio (Al)**\n- **Número atômico:** 13\n- **Massa atômica média aproximada:** 26,982 u\n- **Grupo:** 13 (metal do bloco p)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal prateado)\n- **Características:** Metal leve e bom condutor, com passivação por uma camada superficial de óxido. Apresenta paramagnetismo fraco; “não magnético” não significa ausência de resposta a campos magnéticos.\n- **Aplicações do elemento ou de seus compostos:** Embalagens (latas, papel alumínio), construção civil, indústria aeroespacial, linhas de transmissão elétrica e utensílios domésticos.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "si": "**Silício (Si)**\n- **Número atômico:** 14\n- **Massa atômica média aproximada:** 28,085 u\n- **Grupo:** 14 (Metaloide)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Cristalino, cinza-azulado)\n- **Características:** Semicondutor com brilho metálico, mas quebradiço. É o segundo elemento mais abundante na crosta terrestre, encontrado principalmente como sílica (areia, quartzo) e silicatos.\n- **Aplicações do elemento ou de seus compostos:** Microchips e eletrônicos, células solares, vidro, cerâmicas, cimento e polímeros de silicone.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "p": "**Fósforo (P)**\n- **Número atômico:** 15\n- **Massa atômica média aproximada:** 30,974 u\n- **Grupo:** 15 (não metal)\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Possui vários alótropos, sendo o fósforo branco (altamente reativo e tóxico) e o fósforo vermelho/negro os mais comuns. Essencial para a vida (DNA, RNA, ATP e ossos).\n- **Aplicações do elemento ou de seus compostos:** Fosfatos em fertilizantes; fósforo vermelho em superfícies de atrito de fósforos de segurança; compostos de fósforo em diversos materiais. A aplicação depende da espécie química e do alótropo.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "s": "**Enxofre (S)**\n- **Número atômico:** 16\n- **Massa atômica média aproximada:** 32,06 u\n- **Grupo:** 16 (Calcogênio / não metal)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Cristais amarelos)\n- **Características:** A substância simples comum forma sólidos amarelos, como o enxofre molecular S₈. O odor associado a H₂S não é uma propriedade do enxofre elementar. Compostos sulfurados também participam de sistemas biológicos.\n- **Aplicações do elemento ou de seus compostos:** Produção de ácido sulfúrico (um dos produtos químicos industriais de maior produção), vulcanização da borracha, fungicidas e pólvora.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "cl": "**Cloro (Cl)**\n- **Número atômico:** 17\n- **Massa atômica média aproximada:** 35,45 u\n- **Grupo:** 17 (Halogênio)\n- **Estado físico a 25 °C e 1 bar:** Gás amarelo-esverdeado\n- **Características:** Gás diatômico (Cl₂) altamente reativo e tóxico. Forte agente oxidante. Encontrado na natureza principalmente como cloreto de sódio (sal marinho).\n- **Aplicações do elemento ou de seus compostos:** Desinfecção de água potável e piscinas, produção de plásticos (como PVC), alvejantes e solventes industriais.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "k": "**Potássio (K)**\n- **Número atômico:** 19\n- **Massa atômica média aproximada:** 39,098 u\n- **Grupo:** 1 (metal alcalino)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal macio e prateado)\n- **Características:** O potássio metálico é muito reativo. A função biológica envolve K⁺; os fertilizantes utilizam compostos de potássio, não o metal livre.\n- **Aplicações do elemento ou de seus compostos:** Fertilizantes (NPK), sabões líquidos, vidro e substitutos do sal de cozinha.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "ca": "**Cálcio (Ca)**\n- **Número atômico:** 20\n- **Massa atômica média aproximada:** 40,078 u\n- **Grupo:** 2 (metal alcalinoterroso)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal prateado)\n- **Características:** O metal é reativo. A presença de cálcio em ossos, dentes e minerais corresponde a íons e compostos, e não a cálcio metálico.\n- **Aplicações do elemento ou de seus compostos:** Produção de cimento e argamassa, fabricação de aço, suplementos nutricionais e como agente redutor na extração de outros metais.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "fe": "**Ferro (Fe)**\n- **Número atômico:** 26\n- **Massa atômica média aproximada:** 55,845 u\n- **Grupo:** 8 (metal de transição)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal cinza-prateado)\n- **Características:** Metal ferromagnético em condições ambientes, sujeito à corrosão. O ferro é um constituinte importante do núcleo terrestre e dos grupos heme da hemoglobina; essas ocorrências envolvem ambientes químicos diferentes.\n- **Aplicações do elemento ou de seus compostos:** Produção de aço (liga com carbono), construção civil, infraestrutura, veículos e ferramentas.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "cu": "**Cobre (Cu)**\n- **Número atômico:** 29\n- **Massa atômica média aproximada:** 63,546 u\n- **Grupo:** 11 (metal de transição)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal avermelhado/alaranjado)\n- **Características:** Metal avermelhado, dúctil e maleável, com elevadas condutividades térmica e elétrica. Pode formar produtos de corrosão superficiais; a composição da pátina depende do ambiente.\n- **Aplicações do elemento ou de seus compostos:** Fios e cabos elétricos, encanamentos, motores, moedas e ligas metálicas (bronze e latão).\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "zn": "**Zinco (Zn)**\n- **Número atômico:** 30\n- **Massa atômica média aproximada:** 65,38 u\n- **Grupo:** 12 (metal do bloco d)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal cinza-azulado)\n- **Características:** Metal levemente quebradiço à temperatura ambiente. É um elemento traço essencial para o sistema imunológico humano.\n- **Aplicações do elemento ou de seus compostos:** Galvanização (revestimento de ferro/aço para evitar ferrugem), produção de latão (liga com cobre), baterias e suplementos vitamínicos.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "ag": "**Prata (Ag)**\n- **Número atômico:** 47\n- **Massa atômica média aproximada:** 107,87 u\n- **Grupo:** 11 (metal de transição)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal branco brilhante)\n- **Características:** Metal dúctil e maleável, com condutividade elétrica muito elevada em comparação com outros metais puros em condições ambientes. Sua refletividade depende do comprimento de onda e do estado da superfície.\n- **Aplicações do elemento ou de seus compostos:** Joalheria, contatos elétricos de alta qualidade, espelhos, fotografia tradicional (haletos de prata) e catálise.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "pt": "**Platina (Pt)**\n- **Número atômico:** 78\n- **Massa atômica média aproximada:** 195,08 u\n- **Grupo:** 10 (metal de transição)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal branco-prateado)\n- **Características:** Metal precioso denso, maleável, dúctil e altamente não reativo (nobre). Possui excelente resistência à corrosão, mesmo em altas temperaturas.\n- **Aplicações do elemento ou de seus compostos:** Conversores catalíticos em veículos, joalheria, equipamentos de laboratório, eletrodos, contatos elétricos e medicamentos anticâncer (como a cisplatina).\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "au": "**Ouro (Au)**\n- **Número atômico:** 79\n- **Massa atômica média aproximada:** 196,97 u\n- **Grupo:** 11 (metal de transição)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal amarelo brilhante)\n- **Características:** Metal precioso extremamente maleável e dúctil. É um dos metais menos reativos (nobre), com elevada resistência à oxidação pelo ar e pela água em condições ambientes. Excelente condutor elétrico.\n- **Aplicações do elemento ou de seus compostos:** Joalheria, reservas financeiras, contatos elétricos em eletrônicos de precisão, odontologia e revestimentos aeroespaciais.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "hg": "**Mercúrio (Hg)**\n- **Número atômico:** 80\n- **Massa atômica média aproximada:** 200,59 u\n- **Grupo:** 12 (metal do bloco d)\n- **Estado físico a 25 °C e 1 bar:** Líquido prateado\n- **Características:** Metal líquido a 25 °C e 1 bar. Seu comportamento químico e sua toxicidade dependem da espécie e da forma de exposição; mercúrio metálico e compostos organomercuriais não são equivalentes.\n- **Aplicações do elemento ou de seus compostos:** Termômetros e barômetros antigos, lâmpadas fluorescentes, amálgamas dentárias e extração de ouro (embora seu uso esteja sendo reduzido devido à toxicidade).\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "pb": "**Chumbo (Pb)**\n- **Número atômico:** 82\n- **Massa atômica média aproximada:** 207,2 u\n- **Grupo:** 14 (metal do bloco p)\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal cinza-azulado)\n- **Características:** Metal pesado, denso, macio e maleável. Tem um baixo ponto de fusão. É tóxico e pode causar danos neurológicos severos se ingerido ou inalado.\n- **Aplicações do elemento ou de seus compostos:** Baterias de chumbo-ácido (veículos), blindagem contra radiação (raios-X), munições e pesos.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "u": "**Urânio (U)**\n- **Número atômico:** 92\n- **Massa atômica média aproximada:** 238,03 u\n- **Grupo:** actinoides\n- **Estado físico a 25 °C e 1 bar:** Sólido (Metal prateado)\n- **Características:** Metal pesado, denso e radioativo. O isótopo U-235 é físsil, o que significa que pode sustentar uma reação em cadeia de fissão nuclear.\n- **Aplicações do elemento ou de seus compostos:** Combustível para usinas nucleares, armas nucleares, blindagem de alta densidade (urânio empobrecido) e datação radiométrica de rochas antigas.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "ti": "**Titânio (Ti)**\n- **Número atômico:** 22\n- **Massa atômica média aproximada:** 47,867 u\n- **Grupo:** 4 (metal de transição)\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal de baixa densidade relativa, com boa resistência à corrosão e elevada relação resistência/massa em várias ligas. Essa relação depende da composição, da microestrutura e do processamento; não é universalmente a maior entre todos os metais.\n- **Aplicações do elemento ou de seus compostos:** Ligas aeroespaciais, implantes biomédicos, pigmento branco (TiO2).\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "v": "**Vanádio (V)**\n- **Número atômico:** 23\n- **Massa atômica média aproximada:** 50,941 u\n- **Grupo:** 5 (metal de transição)\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal duro, cinza-prateado e dúctil. Raramente encontrado puro na natureza.\n- **Aplicações do elemento ou de seus compostos:** Ligas de aço de alta resistência, compostos catalíticos, como V₂O₅, na produção de ácido sulfúrico, baterias de fluxo.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "cr": "**Cromo (Cr)**\n- **Número atômico:** 24\n- **Massa atômica média aproximada:** 51,996 u\n- **Grupo:** 6 (metal de transição)\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal duro, quebradiço e de alto polimento. Altamente resistente a manchas e corrosão.\n- **Aplicações do elemento ou de seus compostos:** Aço inoxidável, cromagem (revestimento), pigmentos.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "mn": "**Manganês (Mn)**\n- **Número atômico:** 25\n- **Massa atômica média aproximada:** 54,938 u\n- **Grupo:** 7 (metal de transição)\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal cinza, duro e relativamente quebradiço. Seus compostos apresentam diferentes estados de oxidação, importantes em reações de oxirredução.\n- **Aplicações do elemento ou de seus compostos:** Produção de aço, baterias alcalinas, pigmentos.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "co": "**Cobalto (Co)**\n- **Número atômico:** 27\n- **Massa atômica média aproximada:** 58,933 u\n- **Grupo:** 9 (metal de transição)\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal duro, ferromagnético, prateado-azulado.\n- **Aplicações do elemento ou de seus compostos:** Baterias de íon-lítio, superligas, pigmento azul.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "ni": "**Níquel (Ni)**\n- **Número atômico:** 28\n- **Massa atômica média aproximada:** 58,693 u\n- **Grupo:** 10 (metal de transição)\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal prateado-branco com um leve tom dourado. Duro e dúctil.\n- **Aplicações do elemento ou de seus compostos:** Aço inoxidável, moedas, baterias recarregáveis.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "pd": "**Paládio (Pd)**\n- **Número atômico:** 46\n- **Massa atômica média aproximada:** 106,42 u\n- **Grupo:** 10 (metal de transição)\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal raro e brilhante, prateado-branco. Tem a capacidade incomum de absorver hidrogênio.\n- **Aplicações do elemento ou de seus compostos:** Conversores catalíticos, capacitores cerâmicos, joalheria.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "ce": "**Cério (Ce)**\n- **Número atômico:** 58\n- **Massa atômica média aproximada:** 140,116 u\n- **Grupo:** lantanoides\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** O mais abundante dos elementos de terras raras. Metal macio, prateado e dúctil.\n- **Aplicações do elemento ou de seus compostos:** Ligas de ferro-cério em pedras de isqueiro, polimento de vidro, conversores catalíticos.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "nd": "**Neodímio (Nd)**\n- **Número atômico:** 60\n- **Massa atômica média aproximada:** 144,242 u\n- **Grupo:** lantanoides\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal macio e prateado que mancha rapidamente no ar.\n- **Aplicações do elemento ou de seus compostos:** Ímãs permanentes de alto desempenho, como os de Nd–Fe–B, lasers, coloração de vidros.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "sm": "**Samário (Sm)**\n- **Número atômico:** 62\n- **Massa atômica média aproximada:** 150,36 u\n- **Grupo:** lantanoides\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal prateado moderadamente duro que oxida lentamente no ar.\n- **Aplicações do elemento ou de seus compostos:** Ímãs de samário-cobalto, absorvedores de nêutrons, lasers.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "gd": "**Gadolínio (Gd)**\n- **Número atômico:** 64\n- **Massa atômica média aproximada:** 157,25 u\n- **Grupo:** lantanoides\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal de terras raras com propriedades magnéticas dependentes da temperatura. Apresenta ferromagnetismo abaixo de sua temperatura de Curie, próxima da temperatura ambiente.\n- **Aplicações do elemento ou de seus compostos:** Complexos quelatados de Gd(III) em agentes de contraste para ressonância magnética, ligas magnéticas, reatores nucleares.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "th": "**Tório (Th)**\n- **Número atômico:** 90\n- **Massa atômica média aproximada:** 232,038 u\n- **Grupo:** actinoides\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal radioativo prateado que escurece quando exposto ao ar.\n- **Aplicações do elemento ou de seus compostos:** Combustível nuclear alternativo, camisas de lampião a gás (histórico), ligas de magnésio.\n\nOs valores de massa são aproximações para composição isotópica usual; não são números de massa nem massas de cada isótopo.",
  "pu": "**Plutônio (Pu)**\n- **Número atômico:** 94\n- **Isótopo de referência:** Pu-244; número de massa 244. Não há massa atômica padrão para o elemento.\n- **Grupo:** actinoides\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal radioativo prateado que mancha no ar. O isótopo Pu-239 é físsil.\n- **Aplicações do elemento ou de seus compostos:** Pu-239 em aplicações de fissão e combustível MOX; Pu-238 como fonte de calor em geradores termoelétricos de radioisótopos, como os de determinadas sondas espaciais. São isótopos com funções diferentes.",
  "am": "**Amerício (Am)**\n- **Número atômico:** 95\n- **Isótopo de referência:** Am-243; número de massa 243. Não há massa atômica padrão para o elemento.\n- **Grupo:** actinoides\n- **Estado físico a 25 °C e 1 bar:** Sólido\n- **Características:** Metal radioativo sintético, prateado-branco.\n- **Aplicações do elemento ou de seus compostos:** Am-241 em certos detectores de fumaça por ionização; fontes de nêutrons Am–Be e fontes de calibração em detecção de radiação. A aplicação depende do radioisótopo e da montagem."
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
    "topic": "cristalografia",
    "q": "**Questão (múltipla escolha - Cristalografia):**\nQual sistema cristalino não impõe igualdades entre comprimentos nem ângulos específicos na escolha convencional de célula?\na) Cúbico\nb) Tetragonal\nc) Ortorrômbico\nd) Triclínico\ne) Monoclínico\n\n**Gabarito:**\n||Alternativa D. O sistema triclínico não impõe igualdades métricas nem ângulos específicos à célula convencional. As classes pontuais são 1 e −1; a segunda contém inversão. Ausência de restrições não significa proibição de igualdades acidentais. A classificação cristalina depende da simetria.||",
    "id": "question-001",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "symmetry"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão (verdadeiro ou falso - Defeitos):**\nO defeito de Schottky ocorre quando um íon se desloca de sua posição normal na rede para um sítio intersticial, deixando uma vacância para trás.\n\n**Gabarito:**\n||Falso. O deslocamento descrito produz um par de Frenkel: uma vacância e um intersticial da mesma espécie. Defeitos de Schottky envolvem conjuntos de vacâncias que mantêm a eletroneutralidade e, no modelo estequiométrico, a proporção do composto. Uma vacância de cada íon é o caso simples de um sal 1:1.||",
    "id": "question-002",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "packing",
      "crystal"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão (Cálculo - Frações):**\nEm uma célula unitária Cúbica de Face Centrada (CFC), quantos átomos no total pertencem a uma única célula unitária?\n\n**Gabarito:**\n||São 4 átomos por célula convencional CFC monoatômica: 8 × 1/8 + 6 × 1/2 = 4. Esse valor pressupõe um átomo em cada ponto da rede. Não é o número de coordenação, que vale 12 no modelo compacto.||",
    "id": "question-003",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "packing",
      "crystal"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão (Cálculo - Índices de Miller):**\nSe um plano intercepta os eixos cristalográficos em a, 2b e ∞c (unidades dos parâmetros de rede) (paralelo ao eixo z), quais são seus Índices de Miller (hkl)?\n\n**Gabarito:**\n||Os índices são (210). Os interceptos, expressos em unidades dos parâmetros a, b e c, são 1, 2 e ∞. Seus recíprocos são 1, 1/2 e 0; multiplicando por 2, obtém-se 2, 1 e 0. O índice zero indica paralelismo ao eixo c.||",
    "id": "question-004",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "miller"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão (múltipla escolha - Empacotamento):**\nNo empacotamento compacto de esferas, um buraco octaédrico é formado por quantas esferas vizinhas?\na) 4\nb) 6\nc) 8\nd) 12\n\n**Gabarito:**\n||Alternativa B. O sítio octaédrico tem seis vizinhos, cujos centros definem um octaedro no modelo ideal. Em camadas compactas, três vizinhos pertencem a cada uma de duas camadas adjacentes. A geometria não garante, por si, a ocupação do sítio por um íon real.||",
    "id": "question-005",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "packing",
      "crystal"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão (múltipla escolha - Fator de Empacotamento):**\nQual é o Fator de Empacotamento Atômico (FEA) para uma estrutura Cúbica de Face Centrada (CFC)?\na) 0,52\nb) 0,68\nc) 0,74\nd) 1,00\n\n**Gabarito:**\n||Alternativa C. Para esferas iguais em contato na estrutura CFC monoatômica, a√2 = 4r. A fração ocupada é 4(4πr³/3)/a³ = π/(3√2) ≈ 0,7405, ou cerca de 74%. O mesmo valor ideal ocorre no empacotamento hexagonal compacto.||",
    "id": "question-006",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "packing",
      "crystal"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão (Conceitual - Lei de Bragg):**\nNa difração de raios X, a Lei de Bragg é expressa como `nλ = 2d sen(θ)`. O que representa a variável 'd' nesta equação?\n\n**Gabarito:**\n||d é o espaçamento entre planos paralelos do conjunto considerado. A condição nλ = 2d sen θ relaciona esse espaçamento ao comprimento de onda e ao ângulo de Bragg. Atenção: muitos difratogramas mostram 2θ, e não θ.||",
    "id": "question-007",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "bragg"
    ]
  },
  {
    "topic": "vsepr",
    "q": "**Questão (múltipla escolha - VSEPR):**\nQual é a geometria molecular da molécula de água (H₂O)?\na) Linear\nb) Angular\nc) Trigonal Plana\nd) Tetraédrica\n\n**Gabarito:**\n||Alternativa B. A H₂O é angular. No modelo VSEPR, duas regiões ligantes e dois pares não ligantes dão um arranjo eletrônico aproximadamente tetraédrico. A geometria molecular considera as posições dos núcleos. O ângulo H–O–H da molécula isolada é próximo de 104,5°.||",
    "id": "question-008",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "vsepr"
    ]
  },
  {
    "topic": "vsepr",
    "q": "**Questão (verdadeiro ou falso - Polaridade):**\nA molécula de dióxido de carbono (CO₂) é polar porque possui ligações covalentes polares entre o carbono e o oxigênio.\n\n**Gabarito:**\n||Falso. O CO₂ isolado tem geometria linear e ligações C=O equivalentes, cujas contribuições de dipolo se cancelam por simetria. Seu momento dipolar permanente é zero. A polaridade de uma ligação não determina, isoladamente, a polaridade da molécula.||",
    "id": "question-009",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "vsepr"
    ]
  },
  {
    "topic": "vsepr",
    "q": "**Questão (Identificação - Geometria):**\nDe acordo com a teoria VSEPR, qual é a geometria molecular de uma molécula com seis regiões ligantes e nenhum par livre ao redor do átomo central (ex: SF₆)?\n\n**Gabarito:**\n||A geometria molecular é octaédrica. No modelo AX₆, seis regiões ligantes se distribuem ao redor do átomo central, com ângulos ideais de 90° entre posições adjacentes e 180° entre posições opostas. O SF₆ isolado não apresenta dipolo permanente.||",
    "id": "question-010",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "vsepr"
    ]
  },
  {
    "topic": "vsepr",
    "q": "**Questão (múltipla escolha - Hibridização):**\nQual é a hibridização do átomo de carbono na molécula de metano (CH₄)?\na) sp\nb) sp²\nc) sp³\nd) sp³d\n\n**Gabarito:**\n||Alternativa C. No modelo de ligação de valência com hibridização, a combinação de um orbital s e três p produz quatro orbitais sp³ orientados tetraedricamente. Essa é uma representação das ligações σ C–H do metano; a hibridização é um modelo, não uma etapa física que o átomo precisa executar antes de ligar-se.||",
    "id": "question-011",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "vsepr"
    ]
  },
  {
    "topic": "ligacoes",
    "q": "**Questão (verdadeiro ou falso - Ligações):**\nNa ligação iônica, os elétrons são compartilhados igualmente entre os átomos para formar moléculas discretas.\n\n**Gabarito:**\n||Falso. A descrição iônica enfatiza a atração eletrostática entre íons de cargas opostas. No NaCl sólido, os íons formam uma estrutura extensa. Compartilhamento de densidade eletrônica caracteriza a descrição covalente, que pode ser polar ou apolar. Ligações reais podem combinar esses caracteres.||",
    "id": "question-012",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lewis",
      "interactions"
    ]
  },
  {
    "topic": "ligacoes",
    "q": "**Questão (múltipla escolha - Forças Intermoleculares):**\nQual é a principal força intermolecular responsável pelo alto ponto de ebulição da água (H₂O) em comparação com o sulfeto de hidrogênio (H₂S)?\na) Forças de London (Dispersão)\nb) Interação dipolo-dipolo\nc) Ligação de hidrogênio\nd) Interação íon-dipolo\n\n**Gabarito:**\n||Alternativa C. A água forma uma rede de ligações de hidrogênio entre suas moléculas, o que contribui para sua temperatura de ebulição relativamente elevada. A vaporização reduz as interações entre moléculas; não consiste em romper as ligações covalentes O–H para separar hidrogênio e oxigênio.||",
    "id": "question-013",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "interactions"
    ]
  },
  {
    "topic": "ligacoes",
    "q": "**Questão (Conceitual - Regra do Octeto):**\nCite uma molécula que é uma exceção clássica à regra do octeto por possuir um 'octeto incompleto' (menos de 8 elétrons na camada de valência do átomo central).\n\n**Gabarito:**\n||BF₃ é um exemplo. Sua estrutura usual de Lewis atribui seis elétrons ao redor do boro. Ele pode aceitar um par eletrônico de uma base e formar um aduto. A regra do octeto é uma regularidade útil, com exceções, e não uma condição universal de existência das moléculas.||",
    "id": "question-014",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lewis",
      "interactions"
    ]
  },
  {
    "topic": "ligacoes",
    "q": "**Questão (múltipla escolha - Sólidos):**\nO diamante e o quartzo (SiO₂) são exemplos de qual tipo de sólido?\na) Sólido Iônico\nb) Sólido Metálico\nc) Sólido Molecular\nd) Sólido Covalente (Rede Covalente)\n\n**Gabarito:**\n||Alternativa D. Diamante e quartzo apresentam redes extensas de ligações covalentes. No quartzo, tetraedros SiO₄ compartilham oxigênios, resultando na composição SiO₂. O termo rede descreve a conectividade; não implica moléculas isoladas de SiO₂ nem propriedades idênticas para todos os sólidos covalentes.||",
    "id": "question-015",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lewis",
      "interactions"
    ]
  },
  {
    "topic": "modelos",
    "q": "**Questão (múltipla escolha - Modelos Atômicos):**\nQual cientista propôs o modelo atômico conhecido como 'Pudim de Passas', incorporando elétrons a uma distribuição de carga positiva?\na) Dalton\nb) Rutherford\nc) Thomson\nd) Bohr\n\n**Gabarito:**\n||Alternativa C. J. J. Thomson propôs um modelo com elétrons em uma distribuição de carga positiva. O modelo foi desenvolvido após estudos de raios catódicos e antecede o modelo nuclear. Sua importância histórica deve ser distinguida da validade do modelo quântico atual.||",
    "id": "question-016",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "quantum"
    ]
  },
  {
    "topic": "modelos",
    "q": "**Questão (múltipla escolha - Orbitais):**\nO número quântico secundário (ou azimutal), representado pela letra 'l', define o quê em um átomo?\na) O nível de energia principal\nb) O formato do orbital (s, p, d, f)\nc) A orientação espacial do orbital\nd) O spin do elétron\n\n**Gabarito:**\n||Alternativa B, no tratamento introdutório. O número quântico l caracteriza o momento angular orbital e os tipos s, p, d e f, associados a padrões angulares diferentes. Para um dado n, l pode assumir valores de 0 a n − 1. A energia depende apenas de n no modelo hidrogenoide não relativístico, mas não em geral nos átomos multieletrônicos.||",
    "id": "question-017",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "quantum"
    ]
  },
  {
    "topic": "modelos",
    "q": "**Questão (verdadeiro ou falso - Princípio de Pauli):**\nO Princípio de Exclusão de Pauli afirma que dois elétrons no mesmo átomo podem ter os mesmos quatro números quânticos, desde que estejam em orbitais diferentes.\n\n**Gabarito:**\n||Falso. Dois elétrons de um mesmo átomo não podem ter o mesmo conjunto de quatro números quânticos. Em um mesmo orbital espacial, no máximo dois elétrons podem existir, com projeções de spin opostas: mₛ = +1/2 e −1/2.||",
    "id": "question-018",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "quantum"
    ]
  },
  {
    "topic": "nomenclatura",
    "q": "**Questão (múltipla escolha - Nomenclatura):**\nQual é o nome usual para o composto H₂SO₄?\na) Ácido sulfuroso\nb) Ácido sulfídrico\nc) Ácido sulfúrico\nd) Sulfato de hidrogênio\n\n**Gabarito:**\n||Alternativa C. H₂SO₄ é ácido sulfúrico, nome tradicional aceito e amplamente empregado. A soma dos estados de oxidação é zero: 2(+1) + x + 4(−2) = 0, logo o enxofre tem NOX +6. H₂SO₃ é ácido sulfuroso; não se deve generalizar o sufixo −ico como regra universal de NOX máximo.||",
    "id": "question-019",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "oxidation"
    ]
  },
  {
    "topic": "nomenclatura",
    "q": "**Questão (Completar a Lacuna - Sais):**\nO sal formado pela reação de neutralização entre o Ácido Clorídrico (HCl) e o Hidróxido de Sódio (NaOH) é o __________, popularmente conhecido como sal de cozinha.\n\n**Gabarito:**\n||Cloreto de sódio, NaCl. Em solução aquosa, HCl + NaOH → NaCl + H₂O é a equação molecular usual. A equação iônica líquida pode ser escrita H₃O⁺ + OH⁻ → 2 H₂O. O sal dissolve-se como íons, não como moléculas NaCl isoladas.||",
    "id": "question-020",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "stoichiometry"
    ]
  },
  {
    "topic": "nomenclatura",
    "q": "**Questão (Identificação - Óxidos):**\nO composto CaO (Óxido de Cálcio) reage com água para formar uma base (Ca(OH)₂). Por isso, ele é classificado como um óxido básico, ácido, anfótero ou neutro?\n\n**Gabarito:**\n||Óxido básico. CaO + H₂O → Ca(OH)₂ representa sua reação com água. A classificação ácido–base também considera reações com ácidos e bases; nem todo óxido metálico reage diretamente com água, e nem todo óxido de não metal é ácido.||",
    "id": "question-021",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "stoichiometry"
    ]
  },
  {
    "topic": "complexos",
    "q": "**Questão (múltipla escolha - Teoria do Campo Cristalino):**\nEm um complexo octaédrico, como os orbitais 'd' do metal central se desdobram em energia devido à repulsão com os ligantes?\na) Três orbitais de maior energia (t2g) e dois de menor energia (eg)\nb) Dois orbitais de maior energia (eg) e três de menor energia (t2g)\nc) Quatro orbitais de maior energia e um de menor energia\nd) Todos os cinco orbitais mantêm a mesma energia\n\n**Gabarito:**\n||Alternativa B. No modelo octaédrico ideal, d_z² e d_x²−y² formam o conjunto e_g, de maior energia, enquanto d_xy, d_xz e d_yz formam t₂g, de menor energia. As energias são comparadas com o baricentro do conjunto d no modelo de campo cristalino.||",
    "id": "question-022",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "cft"
    ]
  },
  {
    "topic": "complexos",
    "q": "**Questão (verdadeiro ou falso - Série Espectroquímica):**\nO ligante cianeto (CN⁻) é considerado um ligante de campo fraco e geralmente forma complexos de alto spin com metais de transição.\n\n**Gabarito:**\n||Falso. CN⁻ costuma produzir campo forte. Para configurações octaédricas que admitem alternativas de spin, um desdobramento suficientemente grande em comparação com o custo de emparelhamento favorece baixo spin. O resultado depende também do metal, de seu estado de oxidação e da geometria.||",
    "id": "question-023",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "coordination",
      "cft"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão (Cálculo - Densidade Teórica):**\nO cobre cristaliza em uma estrutura CFC com parâmetro de rede a = 3,61 Å. Sabendo que a massa molar do Cu é 63,55 g mol⁻¹, qual é a sua densidade teórica? (Dado: N_A = 6,022 × 10²³ mol⁻¹)\n\n**Gabarito:**\n||Para uma estrutura CFC monoatômica, ρ = 4M/(Nₐa³). Com a = 3,61 × 10⁻⁸ cm, M = 63,55 g mol⁻¹ e Nₐ = 6,022 × 10²³ mol⁻¹, obtém-se aproximadamente 8,97 g cm⁻³. M é a massa molar; a massa de um átomo individual pode ser expressa em u. Evite arredondar o volume antes do resultado final.||",
    "id": "question-024",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "packing",
      "atomic-weights"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão (Conceitual - Polimorfismo):**\nO que é polimorfismo (ou alotropia, no caso de elementos) e dê um exemplo clássico envolvendo o carbono.\n\n**Gabarito:**\n||Polimorfismo é a ocorrência de estruturas cristalinas distintas para a mesma composição. Diamante e grafite são formas alotrópicas do carbono: o diamante tem uma rede tridimensional tetraédrica; o grafite tem camadas com ligações fortes no plano e interações mais fracas entre camadas.||",
    "id": "question-025",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "packing",
      "crystal"
    ]
  },
  {
    "topic": "reacoes",
    "q": "**Questão (múltipla escolha — Cinética):**\nUma reação tem lei de velocidade experimental v = k[A]. Mantendo a temperatura, o meio e k constantes, qual mudança dobra a velocidade prevista?\na) Dobrar a concentração de A\nb) Dobrar apenas a concentração de um produto que não aparece na lei\nc) Reduzir a concentração de A à metade\nd) Manter a concentração de A inalterada\n\n**Gabarito:**\n||Alternativa A. A lei é de primeira ordem em A: v₂/v₁ = [A]₂/[A]₁, com k constante. Dobrar [A] dobra v. A lei experimental, e não apenas a equação estequiométrica global, informa essa dependência.||",
    "id": "question-026",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "rate-laws"
    ]
  },
  {
    "topic": "ligacoes",
    "q": "**Questão (verdadeiro ou falso - Teoria do Orbital Molecular):**\nDe acordo com a Teoria do Orbital Molecular (TOM), a molécula de O₂ é paramagnética porque possui elétrons desemparelhados em seus orbitais antiligantes π*.\n\n**Gabarito:**\n||Verdadeiro para o O₂ em seu estado fundamental. A ocupação de dois orbitais π* degenerados com um elétron em cada, conforme a regra de Hund, resulta em dois elétrons desemparelhados. Esse estado é paramagnético.||",
    "id": "question-027",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "mo"
    ]
  },
  {
    "topic": "complexos",
    "q": "**Questão (Cálculo - EECC):**\nCalcule a Energia de Estabilização do Campo Cristalino (EECC) para um íon d⁶ em um campo octaédrico de campo forte (baixo spin), ignorando a energia de emparelhamento.\n\n**Gabarito:**\n||A configuração é t₂g⁶e_g⁰. Sem incluir emparelhamento, EECC = 6(−0,4Δₒ) = −2,4Δₒ em relação ao baricentro. Essa contribuição não é a energia total do complexo; a comparação entre estados de spin exige considerar os demais termos energéticos.||",
    "id": "question-028",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "cft"
    ]
  },
  {
    "topic": "nomenclatura",
    "q": "**Questão (Identificação - Ácidos de Arrhenius, Brønsted e Lewis):**\nClassifique a amônia (NH₃) de acordo com as teorias ácido-base de Brønsted-Lowry e de Lewis.\n\n**Gabarito:**\n||A NH₃ atua como base de Brønsted–Lowry ao receber um próton, formando NH₄⁺, e como base de Lewis ao doar um par eletrônico para formar uma ligação. Em água, NH₃ + H₂O ⇌ NH₄⁺ + OH⁻. Essas definições descrevem papéis em uma interação, não uma lista imutável de espécies.||",
    "id": "question-029",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "stoichiometry"
    ]
  },
  {
    "topic": "complexos",
    "q": "**Questão Avançada (Complexos - Efeito Jahn-Teller):**\nPor que complexos octaédricos de Cobre(II), como o [Cu(H₂O)₆]²⁺, frequentemente apresentam distorções geométricas, com duas ligações axiais mais longas que as quatro equatoriais?\n\n**Gabarito:**\n||O Cu(II) é d⁹. Na aproximação octaédrica, o estado eletrônico degenerado é instável a certas distorções de Jahn–Teller. Um alongamento axial separa as energias de d_z² e d_x²−y²; o elétron desemparelhado costuma ter caráter predominantemente d_x²−y². O teorema prevê a instabilidade, mas não determina sozinho o sentido ou a amplitude da distorção.||",
    "id": "question-030",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "jahn-teller"
    ]
  },
  {
    "topic": "complexos",
    "q": "**Questão Avançada (Complexos - Efeito Quelato):**\nExplique termodinamicamente por que o complexo [Ni(en)₃]²⁺ (onde 'en' é etilenodiamina) pode ser mais estável que o complexo [Ni(NH₃)₆]²⁺.\n\n**Gabarito:**\n||O efeito quelato pode favorecer complexos com etilenodiamina, um ligante bidentado. Na troca formal de seis NH₃ por três en, aumenta o número de espécies livres na equação, sugerindo uma contribuição entrópica favorável. A estabilidade real depende de ΔG = ΔH − TΔS, das atividades, da solvatação e das condições; a contagem de partículas não prova, sozinha, a preferência.||",
    "id": "question-031",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "coordination"
    ]
  },
  {
    "topic": "complexos",
    "q": "**Questão Avançada (Complexos - Isomeria de Ligação):**\nO ligante tiocianato (SCN⁻) é ambidentado. Como se chamam os isômeros formados quando ele se liga a um metal pelo Enxofre versus quando se liga pelo Nitrogênio, e como a Teoria de Ácidos e Bases Duros e Macios (HSAB) explica a preferência?\n\n**Gabarito:**\n||São isômeros de ligação. Pode-se especificar o átomo doador como tiocianato-κS ou tiocianato-κN; a forma N-coordenada também é tradicionalmente chamada isotiocianato. A regra HSAB ajuda a racionalizar preferências: centros mais duros tendem a interagir com N, e mais macios com S. A estrutura final depende de outros fatores e não é determinada apenas por essa regra.||",
    "id": "question-032",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "coordination",
      "cft"
    ]
  },
  {
    "topic": "complexos",
    "q": "**Questão Avançada (Complexos - Retrodoação Pi):**\nNo complexo [Fe(CN)₆]⁴⁻, explique o papel da retrodoação π (pi-backbonding) na estabilização de complexos com ligantes como CN⁻ ou CO.\n\n**Gabarito:**\n||A ligação pode combinar doação σ do ligante para orbitais adequados do metal e retrodoação de densidade eletrônica do metal para orbitais π* do ligante. A segunda contribuição tende a fortalecer a interação metal–ligante e a reduzir a ordem da ligação interna C–O ou C–N. O modelo deve considerar a ocupação e a simetria dos orbitais, sem exigir que toda doação σ utilize um orbital d vazio.||",
    "id": "question-033",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "coordination",
      "cft"
    ]
  },
  {
    "topic": "complexos",
    "q": "**Questão Avançada (Complexos - Regra de Laporte):**\nPor que as transições d-d em complexos octaédricos centrossimétricos (como o [Ti(H₂O)₆]³⁺) têm absortividades molares muito baixas (cores pálidas) em comparação com transições de transferência de carga?\n\n**Gabarito:**\n||Em um ambiente com centro de inversão, transições d–d têm a mesma paridade nos estados inicial e final e são proibidas pela regra de Laporte na aproximação de dipolo elétrico. Acoplamento vibrônico e mistura de estados podem conferir intensidade. Muitas transições de transferência de carga são mais intensas, mas as regras de seleção e a simetria devem ser verificadas para cada transição.||",
    "id": "question-034",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "coordination",
      "cft"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão Guiada (Cristalografia - Difração e Lei de Bragg):**\nUm feixe de raios X com comprimento de onda (λ) de 1,54 Å incide sobre um cristal Cúbico de Face Centrada (CFC). O primeiro pico de difração (plano 111) ocorre em um ângulo θ de 19,2°. Calcule o parâmetro de rede 'a' da célula unitária.\n\n**Dica 1:**\n||Use a Lei de Bragg: nλ = 2d senθ. Assuma difração de primeira ordem (n=1). Substitua os valores: 1 * 1,54 = 2 * d * sen(19,2°).||\n\n**Dica 2:**\n||Calcule o valor de 'd' (distância interplanar). sen(19,2°) ≈ 0,32887. Logo, 1,54 = 2 × d × 0,32887. Resolvendo para d: d = 1,54 / 0,65773 ≈ 2,341 Å. Preserve mais casas até o resultado final.||\n\n**Dica 3:**\n||Agora, relacione a distância interplanar 'd' com o parâmetro de rede 'a' para o sistema cúbico. A fórmula é: d = a / √(h² + k² + l²).||\n\n**Dica 4:**\n||Os índices de Miller (hkl) fornecidos são (111). Calcule o denominador: √(1² + 1² + 1²) = √3 ≈ 1,732.||\n\n**Gabarito Final:**\n||Usando os valores sem arredondamento intermediário, d = 1,54/[2 sen(19,2°)] ≈ 2,341 Å. Para o sistema cúbico, a = d√(1² + 1² + 1²) = d√3 ≈ 4,06 Å, com três algarismos significativos. O ângulo informado é θ; o pico seria mostrado em 2θ = 38,4° em muitos difratogramas.||",
    "id": "question-035",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "bragg"
    ]
  },
  {
    "topic": "reacoes",
    "q": "**Questão Guiada (Titulação Redox - Permanganometria):**\nPara titular 25,0 mL de uma solução de Fe²⁺ em meio ácido, foram gastos 15,0 mL de uma solução de KMnO₄ 0,020 mol/L. Qual é a concentração de Fe²⁺ na solução original?\n\n**Dica 1:**\n||Identifique a reação de oxirredução. O MnO₄⁻ se reduz a Mn²⁺ (ganha 5 elétrons). O Fe²⁺ se oxida a Fe³⁺ (perde 1 elétron).||\n\n**Dica 2:**\n||Balanceie a equação trocando os elétrons: 1 MnO₄⁻ reage com 5 Fe²⁺. A proporção estequiométrica é 1:5.||\n\n**Dica 3:**\n||Calcule os mol de KMnO₄ usados: n = M * V = 0,020 mol/L * 0,015 L = 0,0003 mol de MnO₄⁻.||\n\n**Dica 4:**\n||Use a proporção 1:5 para achar os mol de Fe²⁺. Se temos 0,0003 mol de MnO₄⁻, precisamos de 5 vezes isso de Fe²⁺. n(Fe) = 0,0003 * 5 = 0,0015 mol.||\n\n**Gabarito Final:**\n||Em meio suficientemente ácido: MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O. A quantidade de permanganato é 0,020 × 0,0150 = 3,0 × 10⁻⁴ mol; a de Fe²⁺, 1,5 × 10⁻³ mol. Dividindo por 0,0250 L, obtém-se 0,060 mol L⁻¹ de Fe²⁺.||",
    "id": "question-036",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "stoichiometry",
      "oxidation"
    ]
  },
  {
    "topic": "estequiometria",
    "q": "**Questão Guiada (Fórmula Empírica por Combustão):**\nA combustão completa de 3,00 g de um composto orgânico contendo C, H e O produziu 4,40 g de CO₂ e 1,80 g de H₂O. Determine a fórmula empírica do composto. (Massas molares aproximadas, em g mol⁻¹: C = 12, H = 1, O = 16)\n\n**Dica 1:**\n||Todo o Carbono do CO₂ veio do composto. Calcule a massa de C em 4,40 g de CO₂. (O CO₂ tem 44g/mol, sendo 12g de C). Massa de C = (12/44) * 4,40 = 1,20 g de C.||\n\n**Dica 2:**\n||Todo o Hidrogênio da H₂O veio do composto. Calcule a massa de H em 1,80 g de H₂O. (A H₂O tem 18g/mol, sendo 2g de H). Massa de H = (2/18) * 1,80 = 0,20 g de H.||\n\n**Dica 3:**\n||A massa de Oxigênio é a diferença entre a massa total da amostra e a soma das massas de C e H. Massa de O = 3,00 - (1,20 + 0,20) = 1,60 g de O.||\n\n**Dica 4:**\n||Converta as massas de C, H e O para mol dividindo por suas massas molares. C: 1,20/12 = 0,1 mol. H: 0,20/1 = 0,2 mol. O: 1,60/16 = 0,1 mol.||\n\n**Gabarito Final:**\n||A massa de carbono é 4,40 × 12/44 = 1,20 g; a de hidrogênio, 1,80 × 2/18 = 0,200 g. Como a amostra contém somente C, H e O, a massa de oxigênio é 3,00 − 1,20 − 0,200 = 1,60 g. As quantidades são 0,100; 0,200; 0,100 mol. A razão 1:2:1 fornece CH₂O. A fórmula molecular exigiria também a massa molar do composto.||",
    "id": "question-037",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "stoichiometry"
    ]
  },
  {
    "topic": "organica",
    "q": "**Questão (múltipla escolha - Nomenclatura Orgânica):**\nQual é o nome IUPAC correto para o composto CH₃-CH(CH₃)-CH₂-OH?\na) 2-metilpropan-1-ol\nb) 2-metilbutan-1-ol\nc) isobutanol\nd) 3-metilpropan-1-ol\n\n**Gabarito:**\n||Alternativa A. A cadeia parental contém três carbonos e o grupo principal é álcool. A numeração começa pela extremidade da hidroxila, que ocupa a posição 1; o metil está na posição 2. O nome sistemático é 2-metilpropan-1-ol. Isobutanol é o nome comum.||",
    "id": "question-038",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "organic-names"
    ]
  },
  {
    "topic": "organica",
    "q": "**Questão (verdadeiro ou falso - Isomeria):**\nO composto but-2-eno apresenta isomeria geométrica (cis-trans).\n\n**Gabarito:**\n||Verdadeiro. Cada carbono da ligação dupla do but-2-eno está ligado a H e CH₃. A rotação restrita permite os arranjos cis e trans, correspondentes, nesse caso, a Z e E. Não basta haver uma ligação dupla: cada um de seus carbonos precisa ter dois substituintes diferentes para permitir isomeria E/Z.||",
    "id": "question-039",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "functional"
    ]
  },
  {
    "topic": "organica",
    "q": "**Questão (Identificação - Grupos Funcionais):**\nA molécula de aspirina (ácido acetilsalicílico) possui quais dois grupos funcionais oxigenados principais?\n\n**Gabarito:**\n||Ácido carboxílico e éster. A molécula apresenta uma carboxila −COOH e a unidade −O−C(=O)−CH₃ de um éster. Não há uma hidroxila fenólica livre na aspirina. Identificar grupos funcionais ajuda a discutir reatividade, mas não determina sozinho a atividade farmacológica.||",
    "id": "question-040",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "functional"
    ]
  },
  {
    "topic": "organica",
    "q": "**Questão (Reações - Regra de Markovnikov):**\nNa adição eletrofílica usual de HCl ao propeno (CH₃-CH=CH₂), qual é o produto principal formado?\n\n**Gabarito:**\n||O produto principal é 2-cloropropano na adição eletrofílica usual. Primeiro, a protonação do alceno favorece o carbocátion secundário; em seguida, Cl⁻ ataca esse intermediário. O carbocátion não se forma pela ligação final do cloro. A orientação de Markovnikov depende desse contexto mecanístico.||",
    "id": "question-041",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "markovnikov"
    ]
  },
  {
    "topic": "fisicoquimica",
    "q": "**Questão (múltipla escolha - Termodinâmica):**\nConsiderando T e p constantes e um intervalo no qual ΔH < 0 e ΔS > 0 se mantêm, qual é o sinal de ΔG para T > 0?\na) Positivo em todo esse intervalo\nb) Igual a zero em todo esse intervalo\nc) Negativo em todo esse intervalo\nd) Indeterminado mesmo com esses sinais\n\n**Gabarito:**\n||Alternativa C, no intervalo em que ΔH < 0 e ΔS > 0 se mantêm e a comparação é feita a temperatura e pressão constantes. Para T > 0, ΔG = ΔH − TΔS é negativo. Não se deve extrapolar valores constantes através de mudanças de fase ou interpretar ΔG° como ΔG em qualquer composição.||",
    "id": "question-042",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "gibbs"
    ]
  },
  {
    "topic": "fisicoquimica",
    "q": "**Questão (verdadeiro ou falso - Cinética):**\nA adição de um catalisador a uma reação reversível em equilíbrio aumenta a quantidade de produto formado no final.\n\n**Gabarito:**\n||Falso. Um catalisador altera o caminho cinético e pode acelerar a aproximação ao equilíbrio, mas não muda K nem ΔᵣG° à mesma temperatura. Portanto, não desloca o equilíbrio. Não é necessário que as energias de ativação direta e inversa diminuam na mesma proporção.||",
    "id": "question-043",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "catalysis"
    ]
  },
  {
    "topic": "fisicoquimica",
    "q": "**Questão (Cálculo - Lei de Hess):**\nDadas as equações:\n1) C(grafite) + O₂ → CO₂ (ΔH = -394 kJ/mol)\n2) CO + 1/2 O₂ → CO₂ (ΔH = -283 kJ/mol)\nCalcule a entalpia de formação do monóxido de carbono: C(grafite) + 1/2 O₂ → CO.\n\n**Gabarito:**\n||ΔH = −394 + 283 = −111 kJ mol⁻¹ para a reação de formação indicada. Inverta a segunda equação, invertendo também o sinal de ΔH; depois some as equações e cancele as espécies comuns. As fases e as condições de referência devem ser mantidas consistentes.||",
    "id": "question-044",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "gibbs",
      "enthalpy"
    ]
  },
  {
    "topic": "fisicoquimica",
    "q": "**Questão Guiada (Físico-Química - Energia Livre de Gibbs):**\nCalcule a variação de energia livre padrão (ΔG°) para uma reação a 298 K, sabendo que ΔH° = -92 kJ/mol e ΔS° = -199 J/(K·mol). O que esse valor padrão permite concluir sobre o equilíbrio?\n\n**Dica 1:**\n||Atenção às unidades! O ΔH está em kJ e o ΔS está em J. Converta o ΔS para kJ dividindo por 1000: ΔS° = -0,199 kJ/(K·mol).||\n\n**Dica 2:**\n||Use a equação de Gibbs: ΔG° = ΔH° − TΔS°.||\n\n**Dica 3:**\n||Substitua os valores: ΔG° = −92 - (298 * -0,199). Lembre-se que menos com menos dá mais.||\n\n**Gabarito Final:**\n||ΔᵣG° = −92 − 298(−0,199) = −32,698 ≈ −32,7 kJ mol⁻¹. O resultado padrão negativo indica K > 1 nessa temperatura. Para avaliar a direção em uma mistura real, é necessário usar ΔᵣG = ΔᵣG° + RT ln Q. A conclusão depende da composição; o valor padrão não prova espontaneidade em quaisquer condições.||",
    "id": "question-045",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "gibbs"
    ]
  },
  {
    "topic": "fisicoquimica",
    "q": "**Questão (Comportamento Anômalo da Água):**\nPor que o gelo flutua na água líquida, ao contrário da maioria das substâncias onde a fase sólida afunda na fase líquida?\n\n**Gabarito:**\n||O gelo Iₕ comum tem uma estrutura aberta de ligações de hidrogênio e é menos denso que a água líquida próxima da fusão à pressão ambiente. Na fusão, a reorganização permite maior aproximação média das moléculas. A densidade máxima da água líquida ocorre próxima de 4 °C à pressão atmosférica. A afirmação não se aplica a todas as fases de gelo em altas pressões.||",
    "id": "question-046",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "gibbs",
      "enthalpy"
    ]
  },
  {
    "topic": "fisicoquimica",
    "q": "**Questão (Diagrama de Fases):**\nQual a diferença fundamental entre o Ponto Triplo e o Ponto Crítico no diagrama de fases da água?\n\n**Gabarito:**\n||No ponto triplo coexistem três fases em equilíbrio. Para a água comum, gelo Iₕ, líquido e vapor coexistem aproximadamente a 273,16 K e 611,657 Pa. O ponto crítico encerra a curva de coexistência líquido–vapor, a cerca de 647,096 K e 22,064 MPa. O termo supercrítico requer T e p acima dos respectivos valores críticos.||",
    "id": "question-047",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "water"
    ]
  },
  {
    "topic": "quantica",
    "q": "**Questão (Experimento de Rutherford):**\nNo experimento da folha de ouro de Rutherford, a maioria das partículas alfa atravessou a folha sem desvio, mas uma pequena fração sofreu desvios acentuados. Que evidência esse resultado forneceu sobre a estrutura atômica?\n\n**Gabarito:**\n||Os resultados forneceram evidência para um núcleo pequeno, com carga positiva e grande parte da massa atômica. A maioria das partículas alfa sofreu pequenos desvios; raros desvios grandes eram incompatíveis com o modelo positivo difuso. Os experimentos foram conduzidos por Geiger e Marsden e interpretados por Rutherford. Eles não demonstraram órbitas eletrônicas clássicas.||",
    "id": "question-048",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "quantum",
      "mo"
    ]
  },
  {
    "topic": "quantica",
    "q": "**Questão (Teoria do Orbital Molecular):**\nComo a Teoria do Orbital Molecular (TOM) explica o fato de a molécula de oxigênio (O₂) ser paramagnética (atraída por um campo magnético) em seu estado fundamental?\n\n**Gabarito:**\n||No modelo introdutório de orbitais moleculares, os elétrons ocupam dois orbitais π* degenerados separadamente, formando o estado fundamental triplete do O₂. Os dois elétrons desemparelhados explicam o paramagnetismo. A comparação adequada é com a estrutura simples de Lewis; formulações modernas da ligação de valência também podem descrever estados de spin.||",
    "id": "question-049",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "quantum",
      "mo"
    ]
  },
  {
    "topic": "quantica",
    "q": "**Questão (Dualidade Onda-Partícula):**\nQual é a relação matemática proposta por Louis de Broglie que conecta a natureza corpuscular e ondulatória da matéria?\n\n**Gabarito:**\n||A relação de de Broglie é λ = h/p. Para movimento não relativístico, p = mv. O comprimento de onda relaciona-se ao momento linear, não somente à massa. A interferência da matéria também foi observada com átomos e moléculas; sua observabilidade depende das escalas e das condições experimentais.||",
    "id": "question-050",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "quantum",
      "mo"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão (Buracos em Redes Cristalinas):**\nEm uma estrutura cristalina Cúbica de Face Centrada (CFC), quantos buracos octaédricos e tetraédricos existem por célula unitária?\n\n**Gabarito:**\n||Há 4 sítios octaédricos e 8 tetraédricos na célula convencional CFC do modelo compacto. A contagem octaédrica é 1 no centro + 12 × 1/4 nas arestas = 4. Os oito tetraédricos são internos. Em um empacotamento compacto com N esferas, existem N sítios octaédricos e 2N tetraédricos.||",
    "id": "question-051",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "packing",
      "crystal"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão Animação SiMoEns (Classificação do sistema cristalino):**\nQuais são as relações métricas de uma célula convencional cúbica? Elas bastam, isoladamente, para demonstrar simetria cúbica da estrutura?\n\n**Gabarito:**\n||Uma célula convencional cúbica tem a = b = c e α = β = γ = 90°. Essas relações são compatíveis com simetria cúbica, mas não provam, isoladamente, que a estrutura possui essa simetria: pode haver especialização métrica acidental de uma estrutura menos simétrica. A classificação rigorosa depende das operações de simetria.||",
    "id": "question-052",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "symmetry"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão Animação SiMoEns (Interstícios cristalinos):**\nEm empacotamentos compactos, um sítio tetraédrico é cercado por quantos átomos vizinhos imediatos?\n\n**Gabarito:**\n||Quatro vizinhos. No modelo ideal, seus centros ocupam os vértices de um tetraedro. A classificação depende da coordenação local e da geometria, não da cor ou do tamanho gráfico da esfera que marca o sítio.||",
    "id": "question-053",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "packing",
      "crystal"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão Animação SiMoEns (Caça ao sítio cristalino):**\nAo localizar um sítio cristalino em uma estrutura, qual relação é mais útil para distinguir se ele é tetraédrico ou octaédrico: massa molar, número de vizinhos ou cor do átomo?\n\n**Gabarito:**\n||O número de vizinhos e a geometria local. O sítio tetraédrico tem quatro vizinhos; o octaédrico, seis. As cores são convenções gráficas e a massa molar não determina essa classificação.||",
    "id": "question-054",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "packing",
      "crystal"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão Animação SiMoEns (Fórmula Unitária na Prática):**\nEm uma célula CFC, qual é a contribuição total dos átomos das faces para a fórmula unitária?\n\n**Gabarito:**\n||As faces contribuem com 6 × 1/2 = 3 átomos em uma célula convencional CFC monoatômica. Somando a contribuição dos vértices, obtém-se 4 átomos. Para um composto com motivo de várias espécies, é preciso contar cada espécie separadamente antes de obter a fórmula unitária.||",
    "id": "question-055",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "packing",
      "crystal"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão Animação SiMoEns (Coordenação e empacotamento):**\nQual é o número de coordenação típico de um empacotamento compacto, como CFC e HCP?\n\n**Gabarito:**\n||O número de coordenação é 12 no modelo de esferas iguais em contato, tanto no CFC quanto no hexagonal compacto. São seis vizinhos na mesma camada, três na camada superior e três na inferior. As estruturas diferem na sequência de empilhamento.||",
    "id": "question-056",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "packing",
      "crystal"
    ]
  },
  {
    "topic": "cristalografia",
    "q": "**Questão Animação SiMoEns (Defeitos cristalinos):**\nQual defeito ocorre quando um íon abandona sua posição normal na rede e passa a ocupar um sítio intersticial, deixando uma vacância para trás?\n\n**Gabarito:**\n||Forma-se um par de Frenkel, constituído por uma vacância e um intersticial da mesma espécie. O mecanismo deve ser distinguido da formação de conjuntos de vacâncias do tipo Schottky.||",
    "id": "question-057",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "packing",
      "crystal"
    ]
  },
  {
    "topic": "vsepr",
    "q": "**Questão Animação SiMoEns (Comparação de polaridade molecular):**\nEntre CO₂ e H₂O, qual molécula é polar e por quê?\n\n**Gabarito:**\n||A H₂O isolada é polar: sua geometria angular e sua distribuição eletrônica dão momento dipolar não nulo. O CO₂ isolado é apolar: as contribuições equivalentes das duas ligações C=O se cancelam na geometria linear. A análise é da molécula inteira.||",
    "id": "question-058",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "vsepr"
    ]
  },
  {
    "topic": "ligacoes",
    "q": "**Questão Animação SiMoEns (Caça-palavras):**\nEm um jogo de revisão de vocabulário químico, qual habilidade é mais reforçada: reconhecimento de conceitos e termos ou ajuste fino de parâmetros termodinâmicos?\n\n**Gabarito:**\n||O jogo reforça o reconhecimento de termos e suas associações conceituais. Encontrar uma palavra, isoladamente, não demonstra domínio de seu significado. Uma revisão complementar pode pedir ao estudante que explique ou aplique o conceito encontrado.||",
    "id": "question-059",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lewis",
      "interactions"
    ]
  },
  {
    "topic": "ligacoes",
    "q": "**Questão Animação SiMoEns (Xadrez Químico):**\nNo contexto do jogo Xadrez Químico, as peças são inspiradas principalmente em qual conjunto de objetos?\n\n**Gabarito:**\n||As peças usam representações de vidrarias e equipamentos de laboratório. A temática relaciona reconhecimento de instrumentos à dinâmica do xadrez. A função real do instrumento deve ser estudada separadamente de seu papel como peça do jogo.||",
    "id": "question-060",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lewis",
      "interactions"
    ]
  },
  {
    "topic": "gemas",
    "q": "**Questão (múltipla escolha - Cor em Gemas):**\nQual mecanismo está mais diretamente associado à cor verde da esmeralda no berilo?\na) Substituição de Be²⁺ por Na⁺ nos canais estruturais\nb) Substituição parcial de Al³⁺ por Cr³⁺ e/ou V³⁺\nc) Inclusões fluidas sem interação com a luz visível\nd) Apenas o formato externo da lapidação\n\n**Gabarito:**\n||Alternativa B. Cr³⁺ e/ou V³⁺ podem ocupar sítios de alumínio na estrutura do berilo. As energias das transições eletrônicas dependem do ambiente de coordenação. A matriz mantém sua identidade mineral, enquanto impurezas em baixa concentração modificam a absorção.||",
    "id": "question-061",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "emerald"
    ]
  },
  {
    "topic": "gemas",
    "q": "**Questão (verdadeiro ou falso - Defeitos Cristalinos):**\nCentros de cor são defeitos estruturais ou eletrônicos capazes de absorver determinados comprimentos de onda da luz visível.\n\n**Gabarito:**\n||Verdadeiro. Centros de cor são associados a defeitos que introduzem absorções ópticas. Podem envolver vacâncias, elétrons ou lacunas eletrônicas e combinações de defeitos. Nem todo defeito cristalino é um centro de cor, e nem toda cor mineral depende de um centro F.||",
    "id": "question-062",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "gem-color"
    ]
  },
  {
    "topic": "gemas",
    "q": "**Questão (Associação - Coríndon):**\nRubi e safira pertencem ao mesmo mineral, o coríndon (Al₂O₃). O que diferencia, em termos químicos, um rubi de uma safira azul?\n\n**Gabarito:**\n||No rubi, Cr³⁺ em sítios de alumínio é o cromóforo principal. Na safira azul, pares Fe²⁺–Ti⁴⁺ associados à transferência de carga são particularmente importantes. Ambos são coríndon, Al₂O₃. Safiras também existem em outras cores.||",
    "id": "question-063",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "ruby",
      "sapphire"
    ]
  },
  {
    "topic": "gemas",
    "q": "**Questão (múltipla escolha - Tratamentos):**\nQual tratamento é frequentemente usado para modificar ou intensificar a cor de algumas gemas, podendo alterar estados de oxidação e centros de cor?\na) Medição de densidade\nb) Aquecimento controlado\nc) Pesagem hidrostática\nd) Observação de hábito cristalino\n\n**Gabarito:**\n||Alternativa B. O aquecimento pode modificar certos centros e a distribuição de impurezas, dependendo do material e das condições. Esse efeito não é universal. Uma simulação de mudança de cor não reproduz nem especifica um procedimento real de tratamento.||",
    "id": "question-064",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "gem-treatment"
    ]
  },
  {
    "topic": "gemas",
    "q": "**Questão (Conceitual - Inclusões):**\nPor que inclusões internas podem ser importantes para a análise científica de uma gema?\n\n**Gabarito:**\n||Inclusões podem registrar crescimento, aprisionamento de fluidos e transformações posteriores. Sua observação pode contribuir para identificar material e investigar origem ou tratamentos. Nenhuma inclusão isolada fornece necessariamente um diagnóstico conclusivo; é preciso integrar outras evidências.||",
    "id": "question-065",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "gem-treatment"
    ]
  },
  {
    "topic": "gemas",
    "q": "**Questão (Comparação - Diamante):**\nCompare, de forma sucinta, o diamante amarelo e o diamante azul quanto ao tipo de impureza substitucional dominante.\n\n**Gabarito:**\n||Muitos diamantes amarelos apresentam centros associados ao nitrogênio; muitos azuis, ao boro substitucional. São associações frequentes, não uma regra que identifique toda amostra apenas pela cor. Diferentes defeitos e mecanismos podem contribuir para aparências semelhantes.||",
    "id": "question-066",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "diamond"
    ]
  },
  {
    "topic": "gemas",
    "q": "**Questão (múltipla escolha - Opala):**\nA iridescência de muitas opalas está mais relacionada a qual fenômeno?\na) Absorção d-d em íons de transição isolados\nb) Difração/interferência da luz em arranjos ordenados de esferas de sílica\nc) Ligação metálica entre átomos de silício\nd) Fusão parcial do retículo cristalino cúbico\n\n**Gabarito:**\n||Alternativa B. O jogo de cores de opalas preciosas está associado à difração e à interferência em arranjos ordenados de esferas de sílica. A cor muda com a geometria de iluminação e observação. Nem toda opala possui esse ordenamento ou apresenta jogo de cores.||",
    "id": "question-067",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "opal"
    ]
  },
  {
    "topic": "gemas",
    "q": "**Questão (verdadeiro ou falso - Lapidação):**\nA lapidação é a causa química primária da cor de uma gema.\n\n**Gabarito:**\n||Falso. A lapidação modifica o percurso da luz e a aparência, mas não é, em geral, o centro eletrônico que produz a absorção. Impurezas, defeitos e estruturas ópticas podem produzir a cor do material. Forma da lapidação e mecanismo de cor são aspectos relacionados, mas distintos.||",
    "id": "question-068",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "gem-color"
    ]
  },
  {
    "topic": "gemas",
    "q": "**Questão (Aplicação - Hackmanita):**\nA hackmanita pode apresentar tenebrescência. O que esse comportamento indica em termos de centros de cor?\n\n**Gabarito:**\n||A tenebrescência é uma mudança reversível de cor induzida por radiação. Na hackmanita, a fotoquímica de espécies sulfuradas e defeitos da estrutura participa do mecanismo. A resposta e sua reversão dependem do material e da iluminação. Não é o mesmo fenômeno que fluorescência ou pleocroísmo.||",
    "id": "question-069",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "gem-color"
    ]
  },
  {
    "topic": "gemas",
    "q": "**Questão (Síntese - Diagnóstico):**\nAo estudar uma gema colorida, por que é inadequado atribuir a cor apenas ao elemento químico presente em maior quantidade?\n\n**Gabarito:**\n||A concentração majoritária não identifica necessariamente o cromóforo. Traços, estados de oxidação, defeitos e arranjos de esferas ou inclusões podem controlar a absorção, o espalhamento ou a interferência da luz. A interpretação exige relacionar composição e estrutura a medidas ópticas.||",
    "id": "question-070",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "gem-color"
    ]
  },
  {
    "topic": "laboratorio",
    "q": "**Questão (Função de Vidraria):**\nEm uma titulação ácido-base, qual vidraria é mais adequada para liberar o titulante gota a gota com controle de volume?\na) Béquer\nb) Bureta\nc) Dessecador\nd) Vidro de relógio\n\n**Gabarito:**\n||Alternativa B. A bureta permite dispensar e medir a diferença entre leituras de volume. O ponto final observado por indicador não é necessariamente idêntico ao ponto de equivalência estequiométrico. A medida tem tolerância, incerteza e condições de calibração.||",
    "id": "question-071",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lab"
    ]
  },
  {
    "topic": "laboratorio",
    "q": "**Questão (Precisão Volumétrica):**\nPor que um balão volumétrico é mais adequado que um béquer para preparar uma solução de concentração conhecida?\n\n**Gabarito:**\n||O balão volumétrico é calibrado para conter um volume nominal na marca, à temperatura de referência, com tolerância especificada. O béquer fornece apenas estimativas de volume. Nenhuma medição experimental tem volume matematicamente exato; preparo e leitura do menisco também contribuem para a incerteza.||",
    "id": "question-072",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lab"
    ]
  },
  {
    "topic": "laboratorio",
    "q": "**Questão (Filtração a Vácuo):**\nQuais três componentes do laboratório interativo podem ser associados a uma montagem de filtração a vácuo?\n\n**Gabarito:**\n||Kitasato apropriado para vácuo, funil de Büchner com papel de filtro e uma fonte de vácuo compatível. Um adaptador faz a vedação. A compatibilidade e a integridade dos componentes devem ser verificadas; o desenho do simulador não comprova que qualquer frasco real suporta vácuo.||",
    "id": "question-073",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lab-safety"
    ]
  },
  {
    "topic": "laboratorio",
    "q": "**Questão (Segurança Laboratorial):**\nQual equipamento é indicado para manipular reagentes voláteis, tóxicos ou que liberam vapores irritantes?\n\n**Gabarito:**\n||Uma capela química de exaustão adequada e em funcionamento pode conter e remover vapores ou gases em procedimentos compatíveis. Ela é uma proteção coletiva e não substitui a avaliação de risco, o procedimento institucional ou os demais controles necessários.||",
    "id": "question-074",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lab-safety"
    ]
  },
  {
    "topic": "laboratorio",
    "q": "**Questão (Separação de Misturas):**\nQual vidraria é adequada para separar líquidos imiscíveis, como óleo e água, por diferença de densidade?\n\n**Gabarito:**\n||O funil de separação permite separar fases líquidas imiscíveis após a decantação. A densidade determina qual fase fica acima, mas não deve ser inferida apenas da palavra “orgânica”. É necessário identificar as fases e considerar a composição da mistura.||",
    "id": "question-075",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "topic": "laboratorio",
    "q": "**Questão (Aquecimento):**\nPor que uma manta de aquecimento é preferível à chama direta para aquecer um balão de fundo redondo em muitas reações orgânicas?\n\n**Gabarito:**\n||A manta pode fornecer aquecimento elétrico adaptado à curvatura do balão, evitando chama aberta. Isso não elimina riscos de ignição, superaquecimento ou incompatibilidade. A escolha depende do solvente, da temperatura e do procedimento aprovado para a montagem.||",
    "id": "question-076",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lab-safety"
    ]
  },
  {
    "topic": "laboratorio",
    "q": "**Questão (Análise Instrumental):**\nQual equipamento mede a condutividade elétrica de soluções e que tipo de informação essa medida sugere?\n\n**Gabarito:**\n||O condutivímetro mede a condutividade. O resultado depende da concentração e da mobilidade das espécies iônicas, da temperatura e da calibração da célula. Não identifica sozinho os íons nem fornece uma concentração única para qualquer mistura.||",
    "id": "question-077",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "topic": "laboratorio",
    "q": "**Questão (Destilação):**\nQual é a função do condensador de Liebig em uma montagem de destilação simples?\n\n**Gabarito:**\n||O condensador transfere calor dos vapores para um fluido de resfriamento, permitindo sua condensação no tubo interno. O fluido circula na camisa externa. Condensação não transforma a substância em outra espécie química; é uma mudança de fase.||",
    "id": "question-078",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "topic": "laboratorio",
    "q": "**Questão (Acessório de Agitação):**\nO que é um peixinho magnético e com qual equipamento ele costuma atuar?\n\n**Gabarito:**\n||É uma barra magnética revestida, frequentemente com PTFE, movimentada pelo campo de um agitador magnético. Agitação e aquecimento são funções distintas: o agitador pode operar sem aquecer. A compatibilidade do revestimento com a amostra deve ser considerada.||",
    "id": "question-079",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "topic": "laboratorio",
    "q": "**Questão (Armazenamento):**\nPor que um frasco de reagente âmbar é usado para certas substâncias?\n\n**Gabarito:**\n||O vidro âmbar atenua determinadas faixas de radiação e pode reduzir a degradação de substâncias fotossensíveis. A proteção depende do vidro, do espectro e do reagente; não bloqueia universalmente toda a luz. O recipiente também deve ser quimicamente compatível.||",
    "id": "question-080",
    "reviewed": "2026-10-25",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "id": "reviewed-r10-01",
    "topic": "cristalografia",
    "q": "**Questão (Interstícios CFC):** Uma célula CFC convencional tem quantos sítios tetraédricos e octaédricos?\na) 4 e 8\nb) 8 e 4\nc) 12 e 4\nd) 4 e 4\n\n**Gabarito:** ||b) Há oito tetraédricos e quatro octaédricos; existência não implica ocupação.||",
    "sourceIds": [
      "packing"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-02",
    "topic": "cristalografia",
    "q": "**Questão (HCP):** A contagem de seis átomos no prisma hexagonal maior contradiz o motivo de dois átomos da célula primitiva HCP?\n\n**Gabarito:** ||Não. O prisma maior reúne três células primitivas; as contagens referem-se a volumes diferentes.||",
    "sourceIds": [
      "packing"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-03",
    "topic": "modelos",
    "q": "**Questão (Números quânticos):** Qual orbital não é permitido no modelo atômico usual?\na) 1s\nb) 2p\nc) 2d\nd) 3d\n\n**Gabarito:** ||c) 2d. Para n=2, l só pode ser 0 ou 1.||",
    "sourceIds": [
      "quantum"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-04",
    "topic": "quantica",
    "q": "**Questão (Nós 3p):** Quantos nós radiais e angulares há em um orbital hidrogenoide 3p?\n\n**Gabarito:** ||Um radial e um angular: n−l−1=1 e l=1.||",
    "sourceIds": [
      "quantum"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-05",
    "topic": "quantica",
    "q": "**Questão (Cores dos orbitais):** As duas cores dos lobos de um orbital p indicam cargas positiva e negativa?\n\n**Gabarito:** ||Não. Na representação usual, indicam sinais ou fases de ψ; |ψ|² não é negativa. Confira a legenda.||",
    "sourceIds": [
      "quantum"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-06",
    "topic": "quantica",
    "q": "**Questão (O₂):** No estado fundamental, por que O₂ é paramagnético?\na) Possui dois elétrons desemparelhados\nb) Não tem elétrons\nc) Todos os elétrons estão emparelhados\nd) Possui dipolo permanente\n\n**Gabarito:** ||a) O modelo de orbitais moleculares prevê dois elétrons desemparelhados em orbitais π*.||",
    "sourceIds": [
      "mo"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-07",
    "topic": "vsepr",
    "q": "**Questão (Diatômicas):** HCl é uma molécula linear. Isso basta para classificá-la como apolar?\n\n**Gabarito:** ||Não. HCl tem uma ligação polar e momento dipolar permanente; não há cancelamento entre várias ligações.||",
    "sourceIds": [
      "vsepr"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-08",
    "topic": "fisicoquimica",
    "q": "**Questão (Ebulição):** A água pura ferve sempre a 100 °C?\n\n**Gabarito:** ||Não. Esse valor é aproximado para 1 atm; a temperatura de ebulição depende da pressão externa.||",
    "sourceIds": [
      "phase-transitions"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-09",
    "topic": "fisicoquimica",
    "q": "**Questão (Equilíbrio):** No equilíbrio químico, as concentrações de reagentes e produtos precisam ser iguais?\n\n**Gabarito:** ||Não. As velocidades direta e inversa são iguais; as concentrações permanecem constantes nas condições mantidas e não precisam ser iguais.||",
    "sourceIds": [
      "equilibrium"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-10",
    "topic": "fisicoquimica",
    "q": "**Questão (pH):** O valor de pH da neutralidade é sempre 7?\n\n**Gabarito:** ||Não. Ele depende da temperatura; o valor próximo de 7 é uma referência para água perto de 25 °C.||",
    "sourceIds": [
      "ph"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-11",
    "topic": "fisicoquimica",
    "q": "**Questão (Ácidos):** Um ácido forte é necessariamente mais concentrado que um ácido fraco?\n\n**Gabarito:** ||Não. Força envolve equilíbrio de ionização; concentração expressa a quantidade de soluto por uma unidade definida.||",
    "sourceIds": [
      "acid-strength"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-12",
    "topic": "laboratorio",
    "q": "**Questão (Pipetagem):** Qual é a prática correta para aspirar líquido em uma pipeta?\na) Pipetar com a boca se o líquido parecer água\nb) Provar uma gota\nc) Cheirar diretamente\nd) Usar um dispositivo de pipetagem apropriado\n\n**Gabarito:** ||d) Nunca se pipeta com a boca; aparência não demonstra segurança.||",
    "sourceIds": [
      "lab-practices"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-13",
    "topic": "gemas",
    "q": "**Questão (Origem das gemas):** Uma gema sintética é necessariamente uma imitação de composição diferente?\n\n**Gabarito:** ||Não. A sintética corresponde essencialmente à composição e à estrutura da gema natural correspondente; imitação pode ser outro material.||",
    "sourceIds": [
      "gem-synthesis"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-14",
    "topic": "ligacoes",
    "q": "**Questão (Forças de London):** Forças de London atuam apenas em moléculas apolares?\na) Sim, sempre\nb) Não, também contribuem em espécies polares\nc) Só em íons\nd) Só em metais\n\n**Gabarito:** ||b) As flutuações eletrônicas e as interações de dispersão também existem em espécies polares.||",
    "sourceIds": [
      "interactions"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-15",
    "topic": "ligacoes",
    "q": "**Questão (Forças de London):** O que melhor descreve a origem das forças de dispersão de London?\na) Transferência permanente de prótons\nb) Formação de uma ligação iônica\nc) Flutuações correlacionadas da distribuição eletrônica\nd) Ausência de elétrons\n\n**Gabarito:** ||c) As flutuações correlacionadas da distribuição eletrônica contribuem para a atração.||",
    "sourceIds": [
      "interactions"
    ],
    "reviewed": "2026-10-25"
  },
  {
    "id": "reviewed-r10-16",
    "topic": "ligacoes",
    "q": "**Questão (Forças de London):** A polarizabilidade pode influenciar a intensidade das forças de London?\n\n**Gabarito:** ||Sim. A facilidade de deformar a distribuição eletrônica e a geometria de contato importam; não há uma ordem universal independente das espécies comparadas.||",
    "sourceIds": [
      "interactions"
    ],
    "reviewed": "2026-10-25"
  }
];
const NEW_RESOURCE_QUESTIONS = [];
quizQuestions.push(...NEW_RESOURCE_QUESTIONS);
const GEM_QUESTIONS = [];
quizQuestions.push(...GEM_QUESTIONS);
const LABORATORY_ITEMS = Object.freeze([
  {
    "name": "Béquer",
    "group": "Vidrarias gerais de preparo e reação",
    "function": "preparar, misturar e aquecer líquidos de forma geral, sem finalidade de medição volumétrica precisa",
    "animations": "Líquido, agitação e aquecimento",
    "aliases": [
      "bequer",
      "becker"
    ],
    "note": "As graduações, quando presentes, são indicativas e não substituem vidraria volumétrica calibrada.",
    "id": "lab-01",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Erlenmeyer",
    "group": "Vidrarias gerais de preparo e reação",
    "function": "misturar líquidos com menor risco de respingos, realizar titulações e aquecer soluções de forma controlada",
    "animations": "Líquido, agitação e aquecimento",
    "aliases": [
      "frasco erlenmeyer"
    ],
    "note": "A forma cônica facilita agitação e titulações; a graduação não fornece volume de alta exatidão.",
    "id": "lab-02",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Kitasato",
    "group": "Vidrarias gerais de preparo e reação",
    "function": "realizar filtração a vácuo quando conectado a uma bomba e a um funil apropriado",
    "animations": "Líquido, agitação e gás",
    "aliases": [
      "kitassato",
      "frasco kitasato"
    ],
    "note": "O uso sob pressão reduzida requer frasco apropriado e íntegro, além de conexões compatíveis.",
    "id": "lab-03",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Balão de Fundo Redondo",
    "group": "Vidrarias gerais de preparo e reação",
    "function": "aquecer líquidos de modo uniforme em refluxo, destilação ou reações prolongadas",
    "animations": "Líquido, agitação e aquecimento",
    "aliases": [
      "balao de fundo redondo",
      "balão fundo redondo"
    ],
    "note": "O formato distribui o aquecimento e permite montagens com suporte; não implica compatibilidade com toda fonte térmica.",
    "id": "lab-04",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Proveta",
    "group": "Vidrarias gerais de preparo e reação",
    "function": "medir volumes líquidos com precisão moderada, sem aquecimento",
    "animations": "Líquido e agitação",
    "aliases": [
      "cilindro graduado"
    ],
    "note": "A leitura depende do menisco, da resolução e da calibração. Não é recipiente para aquecimento.",
    "id": "lab-05",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Tubo de Ensaio",
    "group": "Vidrarias gerais de preparo e reação",
    "function": "conter pequenas amostras e realizar reações em pequena escala",
    "animations": "Líquido, agitação e aquecimento",
    "aliases": [
      "tubos de ensaio"
    ],
    "note": "Material e resistência térmica dependem do modelo; a representação visual não define essas propriedades.",
    "id": "lab-06",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Balão Volumétrico",
    "group": "Vidrarias volumétricas, separação e amostragem",
    "function": "preparar soluções com volume final nominal calibrado até a marca de aferição",
    "animations": "Líquido e agitação",
    "aliases": [
      "balao volumetrico",
      "frasco volumétrico",
      "frasco volumetrico"
    ],
    "note": "O volume é nominal, com tolerância e temperatura de calibração. O instrumento é normalmente calibrado para conter, não para entregar o volume total.",
    "id": "lab-07",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Funil de Separação",
    "group": "Vidrarias volumétricas, separação e amostragem",
    "function": "separar líquidos imiscíveis por diferença de densidade, liberando uma fase pela torneira inferior",
    "animations": "Líquido, gás e despejar/abrir",
    "aliases": [
      "funil separador",
      "funil de decantação",
      "funil de decantacao"
    ],
    "note": "As fases precisam ser imiscíveis; sua posição depende da densidade. Uma fase orgânica não fica necessariamente acima.",
    "id": "lab-08",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Bureta",
    "group": "Vidrarias volumétricas, separação e amostragem",
    "function": "liberar titulante gota a gota com controle de volume em titulações",
    "animations": "Líquido, gás e despejar/abrir",
    "aliases": [
      "buretas"
    ],
    "note": "O volume dispensado é a diferença entre leituras. Ponto final experimental e ponto de equivalência não são necessariamente coincidentes.",
    "id": "lab-09",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Pipeta Graduada",
    "group": "Vidrarias volumétricas, separação e amostragem",
    "function": "medir e transferir volumes variáveis de líquido",
    "animations": "Líquido, gás e despejar/abrir",
    "aliases": [
      "pipeta graduada"
    ],
    "note": "A calibração e as marcas determinam a forma de entrega. Nem toda pipeta graduada deve ser esvaziada ou soprada da mesma maneira.",
    "id": "lab-10",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Cristalizador",
    "group": "Vidrarias volumétricas, separação e amostragem",
    "function": "evaporar solventes e favorecer a formação de cristais",
    "animations": "Líquido, agitação e aquecimento",
    "aliases": [
      "placa cristalizadora"
    ],
    "note": "Cristalização depende de solubilidade, supersaturação e condições de nucleação; o recipiente não garante pureza do sólido.",
    "id": "lab-11",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Vial de Amostra",
    "group": "Vidrarias volumétricas, separação e amostragem",
    "function": "armazenar pequenas amostras para análise ou transporte",
    "animations": "Líquido, agitação e gás",
    "aliases": [
      "vial",
      "frasco vial"
    ],
    "note": "A tampa, o septo e o material devem ser compatíveis com a análise e com a amostra.",
    "id": "lab-12",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Balão de Destilação",
    "group": "Vidrarias de destilação, armazenamento e análise",
    "function": "aquecer mistura líquida e conduzir vapores pelo braço lateral em uma destilação simples",
    "animations": "Líquido, agitação e aquecimento",
    "aliases": [
      "balao de destilacao",
      "balão destilação"
    ],
    "note": "A geometria do balão não determina sozinha a eficiência da separação; o equilíbrio líquido–vapor e a montagem também importam.",
    "id": "lab-13",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Condensador Liebig",
    "group": "Vidrarias de destilação, armazenamento e análise",
    "function": "resfriar vapores em um tubo interno usando circulação de água na camisa externa",
    "animations": "Líquido e gás",
    "aliases": [
      "condensador de liebig",
      "liebig"
    ],
    "note": "A circulação do fluido na camisa retira calor do vapor no tubo interno.",
    "id": "lab-14",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Dessecador",
    "group": "Vidrarias de destilação, armazenamento e análise",
    "function": "manter amostras protegidas da umidade em ambiente fechado",
    "animations": "Abrir/fechar",
    "aliases": [
      "dessecador de vidro"
    ],
    "note": "Um dessecante adequado reduz a umidade; amostras e condições de armazenamento devem ser compatíveis.",
    "id": "lab-15",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Frasco de Reagente (Âmbar)",
    "group": "Vidrarias de destilação, armazenamento e análise",
    "function": "armazenar reagentes sensíveis à luz",
    "animations": "Líquido e gás",
    "aliases": [
      "frasco âmbar",
      "frasco ambar",
      "frasco de reagente"
    ],
    "note": "Vidro âmbar atenua certas faixas de radiação, mas não oferece proteção universal contra toda a luz.",
    "id": "lab-16",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Pipeta Pasteur",
    "group": "Vidrarias de destilação, armazenamento e análise",
    "function": "transferir líquidos em pequenas gotas ou pequenas porções",
    "animations": "Líquido, gás e despejar/abrir",
    "aliases": [
      "pasteur"
    ],
    "note": "É usada em transferências sem exigência de volume calibrado; gotas não são unidades fixas de volume.",
    "id": "lab-17",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Tubo de Nessler",
    "group": "Vidrarias de destilação, armazenamento e análise",
    "function": "comparar visualmente coloração ou turbidez de soluções",
    "animations": "Líquido, agitação e gás",
    "aliases": [
      "nessler"
    ],
    "note": "A comparação requer geometria, caminho óptico e condições equivalentes para amostras e padrões.",
    "id": "lab-18",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Frasco de Drechsel",
    "group": "Vidrarias especializadas",
    "function": "borbulhar gases em líquidos para lavagem, absorção ou umidificação",
    "animations": "Líquido e gás",
    "aliases": [
      "drechsel",
      "lavador de gases"
    ],
    "note": "A interação gás–líquido depende do solvente e da espécie gasosa; o dispositivo não remove universalmente todos os contaminantes.",
    "id": "lab-19",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Coluna de Vigreux",
    "group": "Vidrarias especializadas",
    "function": "aumentar a eficiência de separação em destilação fracionada",
    "animations": "Líquido e gás",
    "aliases": [
      "vigreux"
    ],
    "note": "As superfícies internas favorecem sucessivas etapas de vaporização e condensação; eficiência depende também das condições da montagem.",
    "id": "lab-20",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Condensador Allihn",
    "group": "Vidrarias especializadas",
    "function": "condensar vapores com maior superfície de resfriamento, comum em refluxo",
    "animations": "Líquido e gás",
    "aliases": [
      "allihn",
      "condensador de bolas",
      "condensador de refluxo"
    ],
    "note": "As dilatações do tubo interno aumentam a área de troca térmica; o modelo é frequentemente empregado em refluxo.",
    "id": "lab-21",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Pipeta Volumétrica",
    "group": "Vidrarias especializadas",
    "function": "transferir um volume fixo e calibrado com resolução e incerteza especificadas",
    "animations": "Líquido, gás e despejar/abrir",
    "aliases": [
      "pipeta volumetrica"
    ],
    "note": "O volume nominal é entregue segundo a calibração. Em muitos modelos, a gota residual da ponta não deve ser expelida; siga a especificação do instrumento.",
    "id": "lab-22",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Cuba Cromatográfica",
    "group": "Vidrarias especializadas",
    "function": "criar uma atmosfera fechada para desenvolvimento de cromatografia",
    "animations": "Líquido e gás",
    "aliases": [
      "cuba cromatografica",
      "câmara cromatográfica",
      "camara cromatografica"
    ],
    "note": "A composição da fase móvel e a saturação da câmara influenciam o desenvolvimento da cromatografia planar.",
    "id": "lab-23",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Tubo de Cultura",
    "group": "Vidrarias especializadas",
    "function": "conter meios, amostras ou microrganismos em cultivo",
    "animations": "Líquido, agitação e gás",
    "aliases": [
      "tubos de cultura"
    ],
    "note": "Esterilidade e fechamento dependem do material e da finalidade; não são assegurados apenas pelo formato do tubo.",
    "id": "lab-24",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Frasco plástico para reagentes (designação P.A. no catálogo)",
    "group": "Frascos plásticos",
    "function": "armazenar e manusear reagentes em recipiente plástico resistente",
    "animations": "Líquido, agitação e gás",
    "aliases": [
      "frasco plastico pa",
      "frasco p.a.",
      "frasco pa"
    ],
    "note": "A sigla P.A. designa com frequência o grau “para análise” de reagentes, não uma composição universal de plástico. A compatibilidade depende do polímero do frasco.",
    "id": "lab-25",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Bico de Bunsen",
    "group": "Equipamentos de laboratório",
    "function": "produzir chama controlada para aquecimento, combustão ou esterilização",
    "animations": "Chama",
    "aliases": [
      "bunsen",
      "queimador bunsen"
    ],
    "note": "Chama aberta é incompatível com muitas situações envolvendo vapores inflamáveis; a escolha da fonte de aquecimento depende do procedimento.",
    "id": "lab-26",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Forno Mufla",
    "group": "Equipamentos de laboratório",
    "function": "aquecer amostras a temperaturas muito elevadas em câmara fechada",
    "animations": "Abrir/fechar e aquecimento",
    "aliases": [
      "mufla"
    ],
    "note": "Calcinação e tratamentos térmicos exigem compatibilidade da amostra, do recipiente e da temperatura.",
    "id": "lab-27",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Estufa de Secagem",
    "group": "Equipamentos de laboratório",
    "function": "secar vidrarias, materiais ou amostras em temperatura controlada",
    "animations": "Abrir/fechar e aquecimento",
    "aliases": [
      "estufa"
    ],
    "note": "Secagem não equivale automaticamente a esterilização. Tempo, temperatura e método dependem do material.",
    "id": "lab-28",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Evaporador Rotativo (Rotaevaporador)",
    "group": "Equipamentos de laboratório",
    "function": "remover solventes por evaporação com rotação, aquecimento e pressão reduzida",
    "animations": "Líquido e rotação",
    "aliases": [
      "rotaevaporador",
      "evaporador rotativo",
      "rotavapor"
    ],
    "note": "A pressão reduzida diminui a temperatura de ebulição; a recuperação do solvente envolve condensação em outra parte da montagem.",
    "id": "lab-29",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Aparelho de Ponto de Fusão",
    "group": "Equipamentos de laboratório",
    "function": "determinar a faixa de fusão de uma substância sólida",
    "animations": "Modelo estático",
    "aliases": [
      "aparelho ponto de fusão",
      "aparelho de fusão"
    ],
    "note": "O resultado é uma faixa de fusão nas condições de medição; não é uma prova isolada de identidade ou pureza.",
    "id": "lab-30",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Capela de Exaustão",
    "group": "Equipamentos de laboratório",
    "function": "conter e remover vapores, gases ou partículas durante procedimentos de risco",
    "animations": "Modelo estático",
    "aliases": [
      "capela",
      "capela quimica",
      "capela química"
    ],
    "note": "É proteção coletiva para procedimentos compatíveis e não substitui avaliação de risco nem outros controles.",
    "id": "lab-31",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Balança Analítica",
    "group": "Equipamentos de laboratório",
    "function": "medir massa com resolução e incerteza especificadas",
    "animations": "Modelo estático",
    "aliases": [
      "balanca analitica",
      "balança"
    ],
    "note": "Resolução, calibração, correntes de ar e temperatura influenciam a incerteza; muitas casas decimais não garantem exatidão.",
    "id": "lab-32",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Condutivímetro",
    "group": "Equipamentos de laboratório",
    "function": "medir a condutividade elétrica de soluções",
    "animations": "Modelo estático",
    "aliases": [
      "condutivimetro",
      "medidor de condutividade"
    ],
    "note": "O resultado depende de concentração, mobilidade iônica, temperatura e calibração; não identifica sozinho os íons presentes.",
    "id": "lab-33",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "pHmetro",
    "group": "Equipamentos de laboratório",
    "function": "medir o pH de uma solução por meio de eletrodo",
    "animations": "Modelo estático",
    "aliases": [
      "phmetro",
      "medidor de ph",
      "pH meter"
    ],
    "note": "O pH está relacionado à atividade de H⁺; a medida é potenciométrica e depende da calibração e das condições da amostra.",
    "id": "lab-34",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Chapa de Aquecimento e Agitação",
    "group": "Equipamentos de laboratório",
    "function": "aquecer recipientes e promover agitação magnética",
    "animations": "Modelo estático",
    "aliases": [
      "chapa aquecedora",
      "chapa de aquecimento",
      "agitador magnético",
      "agitador magnetico"
    ],
    "note": "Agitação e aquecimento podem ser controlados separadamente. A configuração deve ser compatível com o recipiente e o procedimento.",
    "id": "lab-35",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Manta de Aquecimento",
    "group": "Equipamentos de laboratório",
    "function": "aquecer balões de fundo redondo com distribuição de calor mais envolvente",
    "animations": "Modelo estático",
    "aliases": [
      "manta aquecedora"
    ],
    "note": "A ausência de chama aberta não elimina risco de superaquecimento ou ignição; é necessário controle térmico compatível.",
    "id": "lab-36",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Peixinho Magnético",
    "group": "Acessórios e materiais de apoio",
    "function": "agitar líquidos quando acionado por uma chapa magnética",
    "animations": "Rotação",
    "aliases": [
      "peixinho magnetico",
      "barra magnética",
      "barra magnetica"
    ],
    "note": "O revestimento, frequentemente de PTFE, deve ser compatível com a amostra; a barra não é uma sonda de temperatura.",
    "id": "lab-37",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Tripé com tela cerâmica sem amianto",
    "group": "Acessórios e materiais de apoio",
    "function": "sustentar recipientes durante aquecimento",
    "animations": "Modelo estático",
    "aliases": [
      "tripe",
      "tripé",
      "tela de amianto",
      "tripé de laboratório",
      "tela ceramica",
      "tripé com tela cerâmica sem amianto"
    ],
    "note": "“Tela de amianto” é uma denominação histórica encontrada no catálogo. Para a descrição atual, adote tela com centro cerâmico sem amianto; a imagem não comprova a composição de um objeto real.",
    "id": "lab-38",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Cadinho de Porcelana",
    "group": "Acessórios e materiais de apoio",
    "function": "aquecer sólidos em temperaturas elevadas",
    "animations": "Modelo estático",
    "aliases": [
      "cadinho"
    ],
    "note": "A porcelana deve ser compatível com a amostra e a temperatura; choques térmicos podem comprometer o recipiente.",
    "id": "lab-39",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Funil de Vidro",
    "group": "Acessórios e materiais de apoio",
    "function": "transferir líquidos ou apoiar papel de filtro em filtrações simples",
    "animations": "Modelo estático",
    "aliases": [
      "funil comum",
      "funil simples"
    ],
    "note": "Na filtração gravitacional, o papel de filtro faz a retenção das partículas; o funil sustenta e direciona o escoamento.",
    "id": "lab-40",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Funil de Büchner",
    "group": "Acessórios e materiais de apoio",
    "function": "realizar filtração a vácuo com papel de filtro",
    "animations": "Modelo estático",
    "aliases": [
      "funil de buchner",
      "buchner",
      "büchner"
    ],
    "note": "A pressão reduzida é produzida por um sistema externo e a vedação entre os componentes deve ser adequada.",
    "id": "lab-41",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Escova de Limpeza",
    "group": "Acessórios e materiais de apoio",
    "function": "limpar o interior de vidrarias estreitas",
    "animations": "Modelo estático",
    "aliases": [
      "escova para vidraria",
      "escova"
    ],
    "note": "O tipo de escova deve ser adequado à geometria e ao material, evitando riscos e quebra.",
    "id": "lab-42",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Pisseta Automática",
    "group": "Acessórios e materiais de apoio",
    "function": "lavar superfícies ou transferir jatos controlados de solvente",
    "animations": "Líquido",
    "aliases": [
      "pisseta",
      "frasco lavador",
      "pisseta automatica"
    ],
    "note": "Identifique o conteúdo: nem toda pisseta contém água. Material do frasco e ventilação devem ser compatíveis com o solvente.",
    "id": "lab-43",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Suporte Universal com Garra",
    "group": "Acessórios e materiais de apoio",
    "function": "sustentar aparelhagens, buretas, condensadores, funis e balões em montagens laboratoriais",
    "animations": "Modelo estático",
    "aliases": [
      "suporte universal",
      "garra universal",
      "suporte com garra"
    ],
    "note": "A estabilidade do suporte e a posição das garras são importantes; prender uma vidraria não comprova resistência à pressão ou ao calor.",
    "id": "lab-44",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Pinça Metálica Bico Curvo",
    "group": "Acessórios e materiais de apoio",
    "function": "segurar objetos pequenos, quentes ou de difícil manipulação",
    "animations": "Modelo estático",
    "aliases": [
      "pinca metalica",
      "pinça metálica",
      "pinça bico curvo",
      "pinca bico curvo"
    ],
    "note": "A capacidade de segurar material quente depende do tipo de pinça; a pinça de ponta fina não substitui automaticamente uma pinça para cadinhos.",
    "id": "lab-45",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Pinça de Madeira",
    "group": "Acessórios e materiais de apoio",
    "function": "segurar tubo de ensaio durante aquecimento",
    "animations": "Modelo estático",
    "aliases": [
      "pinca de madeira",
      "pinça para tubo"
    ],
    "note": "A fixação deve corresponder ao diâmetro do tubo e ao procedimento; madeira não é um isolante adequado para qualquer temperatura.",
    "id": "lab-46",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Filtro de Papel",
    "group": "Acessórios e materiais de apoio",
    "function": "reter sólidos e permitir passagem do líquido em filtrações",
    "animations": "Modelo estático",
    "aliases": [
      "papel filtro",
      "papel de filtro"
    ],
    "note": "A retenção depende de porosidade e tamanho das partículas; filtração comum não remove solutos dissolvidos.",
    "id": "lab-47",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Borracha para Filtração",
    "group": "Acessórios e materiais de apoio",
    "function": "vedar conexões em sistemas de filtração a vácuo",
    "animations": "Modelo estático",
    "aliases": [
      "borracha de filtração",
      "borracha para filtracao",
      "adaptador de borracha"
    ],
    "note": "O material deve ser compatível com o solvente e com a diferença de pressão aplicada.",
    "id": "lab-48",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Bomba a Vácuo",
    "group": "Equipamentos de laboratório",
    "function": "reduzir a pressão em sistemas conectados, auxiliando filtração ou evaporação",
    "animations": "Trabalho",
    "aliases": [
      "bomba de vácuo",
      "bomba a vacuo",
      "bomba de vacuo"
    ],
    "note": "Pressão final, vazão e compatibilidade química dependem do tipo de bomba e da proteção da linha.",
    "id": "lab-49",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Vidro de Relógio",
    "group": "Acessórios e materiais de apoio",
    "function": "evaporar pequenas quantidades, cobrir recipientes ou apoiar sólidos",
    "animations": "Modelo estático",
    "aliases": [
      "vidro de relogio"
    ],
    "note": "Não possui calibração volumétrica e não substitui recipientes destinados a pressurização.",
    "id": "lab-50",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Conjunto de Espátulas",
    "group": "Acessórios e materiais de apoio",
    "function": "transferir e manipular pequenas porções de sólidos",
    "animations": "Modelo estático",
    "aliases": [
      "espatula",
      "espátula",
      "espátulas",
      "espatulas"
    ],
    "note": "O material da espátula deve evitar reação com a amostra e contaminação cruzada.",
    "id": "lab-51",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Centrífuga",
    "group": "Equipamentos de laboratório",
    "function": "separar componentes por rotação rápida e diferença de densidade",
    "animations": "Rotação",
    "aliases": [
      "centrifuga"
    ],
    "note": "A sedimentação depende de tamanho, forma, densidade e meio, além da aceleração. A força centrífuga relativa não é sinônimo de rotações por minuto.",
    "id": "lab-52",
    "sourceIds": [
      "lab",
      "lab-safety"
    ]
  },
  {
    "name": "Criação",
    "group": "Cenas e mobiliário de laboratório",
    "function": "montar cenas personalizadas no Animation Maker",
    "animations": "Modelo estático",
    "aliases": [
      "animation maker",
      "criacao",
      "criação"
    ],
    "note": "É um recurso de criação da simulação, não um instrumento físico de medição.",
    "id": "lab-53",
    "sourceIds": []
  },
  {
    "name": "Bancada de Laboratório",
    "group": "Cenas e mobiliário de laboratório",
    "function": "representar a superfície de trabalho onde procedimentos e montagens são organizados",
    "animations": "Modelo estático",
    "aliases": [
      "bancada",
      "bancada de laboratorio"
    ],
    "note": "Mobiliário e superfície de trabalho dão suporte às montagens; não constituem instrumentos analíticos.",
    "id": "lab-54",
    "sourceIds": []
  }
]);

const LABORATORY_QUESTIONS = [];
quizQuestions.push(...LABORATORY_QUESTIONS);

const suggestionsMap = {
    cristalografia: ["Defeitos Cristalinos", "Índices de Miller", "Células Unitárias", "Lei de Bragg", "Fator de Empacotamento"],
    gemas: ["Gemas e mudança de cor", "Centros de Cor", "Impurezas Cromóforas", "Rubi e Safira", "Tratamentos Gemológicos"],
    laboratorio: ["Laboratório Interativo", "Vidrarias e Equipamentos", "Funções das Vidrarias", "Filtração a Vácuo", "Titulação"],
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

function classifyGeneralTopic(text = '') {
 const t=normalize(text);
 const topics=[
 ['laboratorio', /\b(?:laboratorio|laboratorial|vidrarias?|bequer|erlenmeyer|kitasato|kitassato|bureta|pipeta|proveta|balao volumetrico|condensador|destilacao|bico de bunsen|phmetro|pisseta|cadinho|buchner|capela de exaustao)\b/],
 ['gemas', /\b(?:gemas?|gemologia|gemologico|corindon?|rubi|safira|berilo|esmeralda|agua marinha|quartzo|ametista|citrino|diamante|opala|topazio|turmalina|granada|alexandrita|crisoberilo|diasporo|sodalita|hackmanita|escapolita|fluorita|centros? de cor|cromoforos?|pleocroismo|tenebrescencia)\b/],
 ['complexos', /\b(?:complexos?(?: metalicos?)?|quimica de coordenacao|ligantes?|quelato|espectroquimica|campo cristalino|jahn teller|retrodoacao)\b/],
 ['quantica', /\b(?:quantica|schrodinger|equacao de onda|dualidade onda particula|de broglie|orbitais? moleculares?|tom|millikan|crookes|fenda dupla|hidrogenoides?)\b/],
 ['cristalografia', /\b(?:cristalografia|cristais|cristal|celulas? unitarias?|redes? cristalinas?|miller|bravais|defeitos? cristalinos?|frenkel|schottky|simetria cristalina|empacotamento|wigner|seitz|formula unitaria|intersticios?)\b/],
 ['vsepr', /\b(?:vsepr|geometria molecular|geometria eletronica|polaridade|momento dipolar|dipolo|axn|axnem|pares nao ligantes)\b/],
 ['ligacoes', /\b(?:london|ligac(?:ao|oes)(?: quimicas?)?|lewis|ionica|covalente|forcas? intermoleculares?|intermolecular|interacoes? intermoleculares?|pontes? de hidrogenio|ligac(?:ao|oes) de hidrogenio)\b/],
 ['modelos', /\b(?:modelos? atomicos?|dalton|thomson|rutherford|bohr|orbitais? atomicos?|orbitais?|numeros? quanticos?)\b/],
 ['fisicoquimica', /\b(?:fisico quimica|termodinamica|cinetica|entalpia|entropia|gibbs|energia livre|fases da agua|ponto critico|ponto triplo|equilibrio quimico|catalisador)\b/],
 ['reacoes', /\b(?:reacoes? quimicas?|estequiometria|balanceamento|nox|oxidacao|titulacao|reagente limitante)\b/],
 ['nomenclatura', /\b(?:nomenclatura inorganica|funcoes inorganicas|nome dos compostos)\b/],
 ['organica', /\b(?:quimica organica|organica|grupos? funcionais?|isomeria|polimeros?|markovnikov|nomenclatura organica)\b/]
 ];
 return topics.find(([,pattern])=>pattern.test(t))?.[0] || '';
}

const rules = [{"patterns":[/(?:contato|fale conosco|email|e mail|como mandar mensagem ao simoens|falar com voces)/],"response":"**Contato SiMoEns:** Você pode entrar em contato conosco enviando um e-mail para **quimicavisualufv@gmail.com** ou preenchendo o formulário de contato na nossa página principal. Nosso endereço é: Departamento de Química - UFV (DEQ/UFV) - Universidade Federal de Viçosa, Viçosa - MG, 36570-900.\n\n[Acesse o formulário de contato aqui](https://quimicavisualufv.github.io/Quimica-Visual/#contact-form-2-v5iWwJnC3V).","id":"knowledge-00","sourceIds":[]},
{"patterns":[/(quem sao os integrantes|equipe|criadores|quem fez|desenvolvedores|autores|quem criou)/],"response":"**Equipe SiMoEns:** O projeto é desenvolvido por um grupo dedicado de pesquisadores e estudantes. Os integrantes incluem:\n- Angel Amado Recio Despaigne\n- Deyse Gomes da Costa\n- Fábio Junior Moreira Novaes\n- Lis Regiane Vizolli Favarin\n- Luana Ornellas Brito\n- Lucas Xavier Nardelli\n\nSaiba mais na nossa [página principal](https://quimicavisualufv.github.io/Quimica-Visual/).","id":"knowledge-01","sourceIds":[]},
{"patterns":[/(novidades|atualizacoes|noticias|o que tem de novo|ultimas noticias|mudancas)/],"response":"O registro local do assistente não possui datas editoriais suficientes para ordenar novidades com segurança. Consulte a [página principal do SiMoEns](https://quimicavisualufv.github.io/Quimica-Visual/) para ver os avisos publicados pelo projeto; se quiser, posso listar os recursos atualmente cadastrados por categoria ou assunto.","id":"knowledge-02","sourceIds":[]},
{"patterns":[/(quando que reseta|como reseta|limpar o chat|apagar a conversa|reiniciar|comecar de novo|zerar)/],"response":"**Reiniciar o chat:** use **Nova conversa** para começar outro diálogo ou **Limpar conversa** para apagar as mensagens atuais. Recarregar a página não apaga o histórico, porque ele fica salvo localmente neste navegador.","id":"knowledge-03","sourceIds":[]},
{"patterns":[/(?:lista de animacoes|todas as animacoes|catalogo de ensino|modulos de ensino)/],"response":"**Recursos de ensino do SiMoEns**\n\nO catálogo reúne visualizações, guias, exercícios e jogos sobre estrutura da matéria. Os temas incluem geometria molecular, cristalografia, empacotamento, orbitais, termodinâmica, gemas e instrumentos de laboratório.\n\nO recurso sobre complexos distingue isomeria molecular, como cis/trans, de polimorfismo cristalino. Esses fenômenos não são sinônimos.\n\n[Consultar o catálogo de ensino](https://quimicavisualufv.github.io/Quimica-Visual/Ensino/).","id":"knowledge-04","sourceIds":[]},
{"patterns":[/(?:o que e o simoens|projeto simoens|plataforma simoens|^simoens$)/],"response":"**SiMoEns (Simulação, Modelo, Ensino):** É um grupo de pesquisa dedicado ao desenvolvimento de recursos digitais e animações interativas para o ensino de química. Você pode acessar o catálogo completo de animações em: [Catálogo SiMoEns](https://quimicavisualufv.github.io/Quimica-Visual/Ensino/).","id":"knowledge-05","sourceIds":[]},
{"patterns":[/(difracao|raios x|drx|xrd|lei de bragg|difratograma|espalhamento de raios x)/],"response":"**Difração de raios X e lei de Bragg**\n\nA difração resulta da interferência das ondas espalhadas pela distribuição eletrônica do cristal. Para reflexões que satisfazem a condição de Bragg, **nλ = 2d sen θ**: n é a ordem, λ é o comprimento de onda, d é o espaçamento interplanar e θ é o ângulo entre o feixe incidente e os planos.\n\nUm difratograma costuma apresentar o ângulo **2θ**. Confundir θ com 2θ altera o cálculo de d. A posição e a intensidade das reflexões, analisadas em conjunto, fornecem informações estruturais.","id":"knowledge-06","sourceIds":["bragg"]},
{"targeted":true,"priority":15,"patterns":[new RegExp("plano (?:100|200)"),new RegExp("direcao 100"),/(indices de miller|indice de miller|planos cristalograficos|plano cristalino|notacao hkl|direcoes cristalograficas|hkl)/],"response":"**Índices de Miller**\n\nOs índices **(hkl)** descrevem a orientação de um conjunto de planos paralelos em relação à base cristalográfica escolhida. Calculam-se a partir dos recíprocos dos interceptos expressos em unidades de a, b e c, convertendo-os em inteiros.\n\nInterceptos a, 2b e ∞c dão recíprocos 1, 1/2 e 0, portanto **(210)**. Um índice zero indica paralelismo ao eixo correspondente. Use **[uvw]** para direções e **{hkl}** para uma família de planos relacionados por simetria; parênteses e chaves têm significados distintos.\n\nO plano (100) é paralelo aos eixos b e c; [100] indica uma direção ao longo de a. No sistema cúbico, d(hkl) = a/√(h²+k²+l²), de modo que d(100) = a e d(200) = a/2. Esses índices têm a mesma orientação, mas não o mesmo espaçamento; não reduza (200) a (100) em um cálculo de difração. A direção [hkl] é normal a (hkl) no sistema cúbico, não como regra geral para qualquer sistema.","id":"knowledge-07","sourceIds":["miller"]},
{"patterns":[/(defeito|defeitos|frenkel|schottky|vacancia|intersticial|discordancia|imperfeicao|imperfeicoes|defeitos pontuais)/],"response":"**Defeitos cristalinos**\n\nSão desvios em relação a uma estrutura ideal. Entre os defeitos pontuais estão **vacâncias**, espécies **intersticiais** e **substituições**. Discordâncias são defeitos lineares; contornos de grão são defeitos planares.\n\nUm par de Frenkel reúne uma vacância e a mesma espécie deslocada para um interstício. Um conjunto de Schottky envolve vacâncias nas proporções necessárias à eletroneutralidade e à estequiometria; somente em sais 1:1 isso corresponde ao caso simples de uma vacância catiônica e uma aniônica.\n\nOs efeitos dependem da concentração e do tipo de defeito: podem envolver difusão, transporte de carga, resistência mecânica e absorção óptica.","id":"knowledge-08","sourceIds":["solids"]},
{"patterns":[/(laboratorio interativo|laboratório interativo|vidraria|vidrarias|equipamentos de laboratorio|equipamentos de laboratório|catalogo de vidrarias|catálogo de vidrarias|bureta|pipeta|proveta|bequer|béquer|erlenmeyer|kitasato|bico de bunsen|funil de buchner|büchner|condensador|phmetro|pisseta)/],"response":"**Laboratório Interativo — Vidrarias e Equipamentos de Laboratório:** este recurso apresenta modelos 3D de vidrarias, equipamentos e acessórios de bancada, com foco em função, aplicação, forma do objeto e animações de líquido, gás, aquecimento, rotação e operação. Posso explicar qualquer item do catálogo, comparar instrumentos parecidos ou propor questões sobre técnicas laboratoriais. Link: [Laboratório Interativo](https://quimicavisualufv.github.io/Quimica-Visual/Ensino/Animacao/catalogo-de-vidrarias-animado/).","id":"knowledge-09","sourceIds":[]},
{"patterns":[/(gema|gemas|gemologia|gemologico|gemologica|mineral gemologico|minerais gemologicos|gemviewer|mudanca de cor em gemas|cor das gemas|cores das gemas|porque.*gema.*cor|por que.*gema.*cor)/],"response":"**Cor e estrutura das gemas**\n\nA aparência de uma gema depende da interação entre luz e material. A absorção seletiva pode estar associada a íons cromóforos, transferência de carga ou centros de cor. Inclusões, espalhamento e interferência também podem contribuir.\n\nA fórmula química ideal não determina, sozinha, a cor. Importam o estado de oxidação, a posição do íon na estrutura, os defeitos, a espessura observada e o espectro da iluminação. As cores e os tamanhos dos modelos digitais são convenções didáticas.","id":"knowledge-10","sourceIds":["gem-color"]},
{"patterns":[/(centro de cor|centros de cor|color center|centro f|vacancia.*eletron|eletron preso|lacuna eletronica|radiação.*cor|irradiacao.*gema|irradiação.*gema)/],"response":"**Centros de cor**\n\nSão defeitos ou conjuntos de defeitos que introduzem absorções ópticas no material. Um centro F, em sua descrição clássica, envolve um elétron associado a uma vacância aniônica. Nem todo centro de cor tem esse mecanismo.\n\nNo quartzo fumê, centros associados ao alumínio e à irradiação podem absorver luz visível. No diamante, determinadas vacâncias e combinações de defeitos também alteram a absorção. A cor observada depende do espectro transmitido ou refletido e da iluminação; não corresponde necessariamente a uma única cor complementar.","id":"knowledge-11","sourceIds":["smoky-quartz","gem-color"]},
{"patterns":[/(impureza|impurezas|cromoforo|cromoforos|cromóforo|cromóforos|elemento traco|elementos traco|traço|transicao d-d|transferencia de carga|transferência de carga)/],"response":"**Cromóforos e transferência de carga**\n\nÍons como Cr³⁺ podem ocupar sítios do cristal e apresentar transições eletrônicas cujas energias dependem de sua vizinhança. Por isso, a presença do mesmo elemento pode produzir cores diferentes em minerais diferentes.\n\nNa safira azul, pares Fe²⁺–Ti⁴⁺ são um exemplo importante de transferência de carga intervalente. Transições de transferência de carga e transições entre níveis d são mecanismos distintos. A identidade, o estado de oxidação e o ambiente de coordenação devem ser considerados conjuntamente.","id":"knowledge-12","sourceIds":["cft","gem-color"]},
{"patterns":[/(rubi|safira|corindo|corindon|coríndon|al2o3)/],"response":"**Coríndon, rubi e safira**\n\nRubi e safira são variedades do coríndon, **Al₂O₃**, de sistema trigonal. No rubi, o Cr³⁺ em sítios associados ao Al³⁺ é o principal responsável pela absorção que produz a cor vermelha.\n\nNa safira azul, a transferência de carga associada a Fe²⁺–Ti⁴⁺ é particularmente importante. Safiras também podem apresentar outras cores; portanto, “safira” não é sinônimo de material necessariamente azul. A classificação gemológica combina composição, propriedades e características de cor.","id":"knowledge-13","sourceIds":["ruby","sapphire"]},
{"patterns":[/(berilo|esmeralda|agua marinha|água marinha|aquamarina|gochenita|be3al2si6o18)/],"response":"**Berilo, esmeralda e água-marinha**\n\nO berilo tem fórmula ideal **Be₃Al₂Si₆O₁₈** e estrutura hexagonal. A variedade incolor é denominada gochenita. A cor verde da esmeralda está associada principalmente a Cr³⁺ e/ou V³⁺ em sítios de alumínio.\n\nNa água-marinha, o ferro e seus ambientes estruturais participam da coloração azul. A presença de um elemento, isoladamente, não identifica todos os centros responsáveis pela cor. Trata-se de variedades de uma mesma espécie mineral.","id":"knowledge-14","sourceIds":["emerald"]},
{"patterns":[/(?:quartzo|ametista|citrino|quartzo fume|sio2)/],"response":"**Variedades do quartzo**\n\nO α-quartzo, estável em condições ambientes, é **SiO₂** de sistema trigonal. Seus tetraedros SiO₄ compartilham oxigênios; não são moléculas isoladas de SiO₄.\n\nA ametista envolve centros relacionados ao ferro e à irradiação. No quartzo fumê, o alumínio substitucional e centros ativados por irradiação são importantes. Citrinos apresentam mecanismos relacionados ao ferro e ao histórico térmico. Esses mecanismos não devem ser reduzidos à simples presença de um único átomo colorido na rede.","priority":5,"id":"knowledge-15","sourceIds":["amethyst","smoky-quartz"]},
{"patterns":[/(diamante|diamante amarelo|diamante azul|diamante verde|diamante rosa|diamante marrom|diamante preto|fancy diamond)/],"response":"**Cor no diamante**\n\nO diamante é uma rede covalente tridimensional de carbono. Impurezas e defeitos podem introduzir absorções: nitrogênio está associado a muitos diamantes amarelos; boro, a muitos azuis; certos danos por radiação, a tons verdes.\n\nDeformações da rede também podem participar de cores rosas e marrons. Essas associações são exemplos importantes, não uma regra diagnóstica suficiente para qualquer amostra. A identificação do mecanismo requer análise espectroscópica e gemológica.","id":"knowledge-16","sourceIds":["diamond"]},
{"patterns":[/(opala|opalescencia|opalescência|jogo de cores|iridescencia|iridescência|sio2.*h2o)/],"response":"**Opala e jogo de cores**\n\nA opala é sílica hidratada, frequentemente representada por **SiO₂·nH₂O**. A expressão indica composição variável, não uma molécula com número fixo de águas.\n\nEm opalas preciosas, arranjos ordenados de pequenas esferas de sílica produzem difração e interferência da luz. O resultado é o jogo de cores, que varia com a direção de observação. Nem toda opala apresenta esse efeito. Ele deve ser distinguido da absorção eletrônica por impurezas.","id":"knowledge-17","sourceIds":["opal"]},
{"patterns":[/(?:alexandrita|crisoberilo|mudanca de cor|color change|efeito alexandrita|olho de gato|chatoyance|chatoyancia|pleocroismo)/],"response":"**Alexandrita, pleocroísmo e olho-de-gato**\n\nA alexandrita é uma variedade de crisoberilo, **BeAl₂O₄**, com cor associada ao Cr³⁺. Sua mudança de cor envolve o espectro de absorção do material, o espectro da fonte luminosa e a percepção visual.\n\n**Mudança de cor** compara iluminações diferentes. **Pleocroísmo** compara direções de propagação/polarização da luz no cristal. **Olho-de-gato**, ou chatoyância, é uma faixa luminosa associada a estruturas ou inclusões orientadas, especialmente visível em lapidações adequadas. Os três fenômenos não são equivalentes.","id":"knowledge-18","sourceIds":["alexandrite","alexandrite-gia"]},
{"patterns":[/(?:inclusao em gema|inclusoes em gemas|inclusoes|fraturas em gemas|clivagem|zonacao|zoneamento|defeito em gema|defeitos em gemas)/],"response":"**Inclusões e defeitos em gemas**\n\nInclusões são materiais ou feições internas, como cristais aprisionados e inclusões fluidas. Elas podem informar sobre crescimento e história do material. Fraturas e zoneamento de cor são feições distintas e devem ser descritas especificamente.\n\nDefeitos pontuais e discordâncias são características estruturais em escala atômica. Uma inclusão visível não é, por isso só, um defeito pontual. A interpretação de origem ou tratamento requer múltiplas evidências, não apenas uma feição isolada.","id":"knowledge-19","sourceIds":["gem-treatment"]},
{"patterns":[/(?:tratamentos? (?:de |em |das? )?gemas|gema tratada|gemas tratadas|aquecimento de gemas|tingimento|preenchimento de fraturas?|irradiacao de gemas|difusao em gemas)/],"response":"**Tratamentos gemológicos**\n\nAquecimento, irradiação, difusão, tingimento, revestimento e preenchimento de fraturas podem modificar características de determinadas gemas. Os resultados dependem do material e do procedimento; um tratamento não produz o mesmo efeito em todos os minerais.\n\nÉ necessário distinguir espécie mineral, material natural ou sintético e tratamento posterior. A identificação demanda procedimentos gemológicos apropriados. Na simulação, uma mudança de cor é uma representação conceitual e não constitui uma receita de tratamento real.","id":"knowledge-20","sourceIds":["gem-treatment"]},
{"targeted":true,"priority":15,"patterns":[new RegExp("translacao e rotacao"),new RegExp("centro de inversao"),/(simetria|grupo pontual|grupos pontuais|grupo espacial|grupos espaciais|eixo de rotacao|plano de reflexao|centro de inversao|operacoes de simetria|elementos de simetria|classes cristalinas)/],"response":"**Simetria cristalina**\n\nUma operação de simetria leva uma estrutura a uma configuração indistinguível da inicial. Em cristais periódicos tridimensionais, as combinações cristalográficas de rotações, reflexões e inversões organizam **32 grupos pontuais**. Incluindo operações com translação, existem **230 tipos de grupos espaciais**.\n\nEsses números se referem à classificação cristalográfica periódica usual. A simetria da estrutura não deve ser inferida apenas da forma externa de um cristal, que também depende do crescimento.\n\nUma translação desloca os pontos pelo mesmo vetor; uma rotação os gira em torno de um eixo. Na inversão em um centro tomado como origem, a posição (x,y,z) corresponde a (−x,−y,−z) de uma espécie equivalente. São operações distintas: só são simetrias quando preservam a estrutura e a identidade das espécies.","id":"knowledge-21","sourceIds":["symmetry"]},
{"patterns":[/(isomorfismo|isomorfo|isomorfos|substancias isomorfas)/],"response":"**Isomorfismo e estruturas relacionadas**\n\nSubstâncias de composições diferentes podem apresentar estruturas correspondentes ou estreitamente relacionadas. O termo isoestrutural destaca a correspondência estrutural; “isomorfo” também aparece historicamente em contextos de morfologia e substituição cristalina.\n\nTer o mesmo grupo espacial não demonstra, isoladamente, identidade de estrutura. É necessário comparar posições, coordenação e conectividade. Polimorfismo, por sua vez, envolve a mesma composição em estruturas cristalinas diferentes.","id":"knowledge-22","sourceIds":["crystal"]},
{"targeted":true,"priority":25,"patterns":[/(razao de raios|raio ionico|coordenacao.*raio|radius ratio|tamanho do ion|proporcao de raios)/],"response":"**Razão de raios iônicos**\n\nO modelo de esferas rígidas relaciona a razão r⁺/r⁻ a ambientes geométricos idealizados. Pode auxiliar na interpretação de coordenações tetraédricas, octaédricas e cúbicas.\n\nSeus limites são aproximados. Raios iônicos dependem de estado de oxidação e coordenação; covalência, polarização, pressão e temperatura também influenciam estruturas reais. Assim, a razão de raios não permite prever universalmente o número de coordenação de um composto.","id":"knowledge-23","sourceIds":["packing"]},
{"patterns":[/(energia de rede|born-haber|born haber|estabilidade.*cristal|energia reticular|entalpia de rede)/],"response":"**Energia reticular e ciclo de Born–Haber**\n\nA energia reticular quantifica a variação de energia associada a formar ou separar uma rede iônica, conforme a convenção adotada. Na formação a partir de íons gasosos, o sinal é normalmente negativo; na separação, positivo.\n\nO ciclo de Born–Haber aplica a lei de Hess para relacionar formação do sólido, atomização, ionização e captura de elétrons. Ao comparar valores, confira a definição e se os dados são energias internas ou entalpias. Cargas e distâncias iônicas são importantes, mas o modelo eletrostático simples não descreve toda a ligação real.","id":"knowledge-24","sourceIds":["enthalpy"]},
{"patterns":[/(vsepr|repulsao dos pares|geometria molecular|geometria eletronica|arranjo eletronico|forma da molecula|geometria da molecula|modelo vsepr|repulsao de pares)/],"response":"**VSEPR e geometria molecular**\n\nO modelo VSEPR estima o arranjo de regiões de densidade eletrônica ao redor de um átomo central. Uma ligação simples, dupla ou tripla conta como **uma região**, embora tenha efeitos repulsivos diferentes.\n\nSepare o arranjo eletrônico, que inclui pares não ligantes, da geometria molecular, definida pelas posições dos núcleos. CH₄ é tetraédrico; NH₃ é piramidal trigonal; H₂O é angular. Seus ângulos típicos são cerca de 109,5°, 107° e 104,5°, respectivamente. O modelo é aproximado e tem limitações, especialmente para muitos complexos metálicos.","id":"knowledge-25","sourceIds":["vsepr"]},
{"patterns":[/polaridade|dipolo|momento dipolar|apolar|eletronegatividade|mep|mapa de potencial|momento de dipolo|molecula polar|molecula apolar|vetor dipolo/],"response":"**Polaridade molecular**\n\nUma molécula é polar quando apresenta momento dipolar elétrico permanente diferente de zero. No modelo de dipolos de ligação, analisa-se a soma vetorial das contribuições na geometria molecular.\n\nO CO₂ isolado é linear: as duas contribuições C=O se cancelam. A H₂O é angular e possui dipolo resultante. Ligações polares não garantem, portanto, uma molécula polar. Mapas de potencial eletrostático representam potencial, não diretamente densidade eletrônica; sua escala de cores deve ser consultada.","id":"knowledge-26","sourceIds":["vsepr"]},
{"patterns":[/(?:celulas? unitarias?|parametros de rede|sistemas? cristalinos?|bravais|redes? cristalinas?|cristais|cristal|estrutura cristalina|cristalografia|reticulo cristalino)/],"response":"**Células unitárias e redes**\n\nA **rede de Bravais** é um conjunto periódico de pontos equivalentes. A **estrutura cristalina** resulta de associar um motivo, formado por átomos, íons ou moléculas, a cada ponto de rede. A **célula unitária**, repetida por translações, reproduz essa periodicidade.\n\nUma célula unitária não é necessariamente a menor possível: a **célula primitiva** tem volume mínimo para a rede e contém exatamente um ponto de rede na contagem compartilhada. Uma célula convencional centrada pode conter vários pontos de rede; ponto de rede não significa necessariamente um átomo.\n\nExistem sete sistemas cristalinos e 14 tipos de redes de Bravais no espaço tridimensional usual. A classificação depende da simetria; os parâmetros a, b, c, α, β e γ descrevem a célula, mas igualdades métricas acidentais não bastam para estabelecer a simetria.","id":"knowledge-27","sourceIds":["unit-cell", "primitive-cell", "symmetry"]},
{"patterns":[/(wigner.seitz|wigner seitz|voronoi|celula primitiva|celulas primitivas|poliedro de voronoi|menor celula)/],"response":"**Célula primitiva e Wigner–Seitz**\n\nUma célula primitiva contém exatamente **um ponto de rede**, contando as partes compartilhadas. Ela pode conter vários átomos, se o motivo associado ao ponto tiver mais de um átomo.\n\nA célula de Wigner–Seitz é a região cujos pontos estão tão próximos ou mais próximos de um ponto de rede escolhido que de qualquer outro. Constrói-se com planos mediadores dos segmentos até os vizinhos. É uma célula primitiva possível; outras escolhas primitivas podem ter formas diferentes e o mesmo volume.\n\nA célula de Wigner–Seitz não precisa ser um cubo. Sua forma depende da rede e da posição dos planos mediadores, e não de uma escolha obrigatória de caixa cúbica.","id":"knowledge-28","sourceIds":["crystal"]},
{"patterns":[/(?:empacotamento|camada hexagonal|sequencia aaa|sequencia aba|sequencia abc|empacotamento compacto|esferas rigidas|hcp)/],"response":"**Empacotamento e interstícios**\n\nEm um empacotamento de esferas iguais, os sítios tetraédricos têm quatro vizinhos e os octaédricos, seis. Nos empacotamentos compactos, há **N sítios octaédricos e 2N tetraédricos** para N esferas.\n\nO empilhamento ABAB corresponde ao hexagonal compacto; ABCABC, ao cúbico compacto, equivalente à estrutura monoatômica CFC. Ambos têm coordenação 12 e fração ocupada próxima de 0,7405 no modelo de esferas rígidas. Esses fatores não são valores universais para íons de tamanhos diferentes.","id":"knowledge-29","sourceIds":["packing"]},
{"patterns":[/contagem de atomos|fracoes na celula|atomos por celula|numero de atomos|cubica simples|centro de (?:uma |cada |a )?face|(?:vertice|vertice da celula)|cubica de corpo centrado|cubica de face centrada|sc|bcc|fcc|ccc|cfc/],"response":"**Contagem por frações na célula convencional cúbica**\n\nUm átomo em vértice contribui com 1/8; no centro de aresta, 1/4; no centro de face, 1/2; inteiramente no interior, 1.\n\nCom um átomo por ponto de rede: cúbica simples soma 1 átomo; CCC/BCC soma 2; CFC/FCC soma 4 por célula convencional. Se houver um motivo com vários átomos, a contagem deve incluir cada espécie. Número de átomos por célula, número de coordenação e número de fórmulas unitárias são grandezas diferentes.","id":"knowledge-30","sourceIds":["packing"]},
{"patterns":[/(quais conteudos da base tratam de cisplatina|conteudos.*cisplatina|base.*cisplatina|^cisplatina$|cisplatina)/],"response":"**Cisplatina e isomeria geométrica**\n\nA cisplatina, **cis-[Pt(NH₃)₂Cl₂]**, é um complexo quadrado planar de Pt(II). Os dois ligantes clorido ocupam posições adjacentes. Na transplatina, ocupam posições opostas.\n\nTrata-se de isomeria geométrica de complexos com a mesma composição, e não de polimorfismo cristalino. A disposição dos ligantes afeta a reatividade. As diferenças de atividade biológica entre os isômeros não podem ser deduzidas apenas da fórmula molecular.","id":"knowledge-31","sourceIds":["coordination"]},
{"patterns":[/(andalusita|cianita|kianita|silimanita|sillimanita)/],"response":"**Polimorfos de Al₂SiO₅**\n\nAndalusita, cianita e silimanita têm a mesma composição ideal, **Al₂SiO₅**, e estruturas distintas. São polimorfos.\n\nSeus campos de estabilidade dependem de pressão e temperatura. Em termos qualitativos, a cianita é favorecida em pressões mais elevadas, a silimanita em temperaturas elevadas e a andalusita em pressões relativamente baixas. Essa descrição qualitativa não substitui um diagrama de equilíbrio nem determina, sozinha, as condições de formação de uma rocha.","id":"knowledge-32","sourceIds":["symmetry"]},
{"patterns":[/(k[- ]?feldspato|k[- ]?fedalspato|feldspato potassico|ortoclasio|microclina|sanidina)/],"response":"**Feldspatos potássicos**\n\nO termo designa feldspatos próximos da composição **KAlSi₃O₈**, como sanidina, ortoclásio e microclina. São tectossilicatos: seus tetraedros formam uma rede tridimensional.\n\nAs diferenças envolvem simetria e ordenamento de Al e Si, associados ao histórico térmico. A composição ideal não descreve todas as substituições de amostras naturais. A albita é o membro sódico, NaAlSi₃O₈.","id":"knowledge-33","sourceIds":["crystal"]},
{"patterns":[/(na[- ]?feldspato|na[- ]?fedalspato|feldspato sodico|albita|plagioclasio sodico)/],"response":"**Albita e plagioclásios**\n\nA albita, **NaAlSi₃O₈**, é o membro sódico da série dos plagioclásios. A anortita, CaAl₂Si₂O₈, é o membro cálcico. A série envolve substituição acoplada entre Na–Si e Ca–Al, preservando a neutralidade elétrica.\n\nFeldspatos potássicos próximos de KAlSi₃O₈ pertencem a outro ramo composicional. Identificar um feldspato exige considerar composição e estrutura, não apenas a presença de sódio ou potássio.","id":"knowledge-34","sourceIds":["crystal"]},
{"patterns":[/(?:polimorfismo|polimorfos|fases cristalinas|alotropia|alotropos)/],"response":"**Polimorfismo e alotropia**\n\nPolimorfismo é a ocorrência de estruturas cristalinas diferentes para uma mesma composição. Andalusita, cianita e silimanita exemplificam esse fenômeno.\n\nPara substâncias elementares, usa-se também alotropia: diamante e grafite são formas alotrópicas do carbono. Não confunda polimorfismo com isomeria molecular, como cis/trans, nem com substituições químicas que alteram a composição. Estrutura, estabilidade termodinâmica e velocidade de transformação devem ser analisadas separadamente.","id":"knowledge-35","sourceIds":["solids"]},
{"patterns":[/(modelos atomicos|dalton|thomson|rutherford|bohr|schrodinger|schr[oö]dinger|modelo atomico|evolucao dos modelos|teoria atomica|pudim de passas|modelo planetario)/],"response":"**Modelos atômicos**\n\nDalton formulou uma teoria atômica para interpretar leis químicas. Thomson incorporou os elétrons a uma distribuição positiva. O espalhamento de partículas alfa estudado por Geiger e Marsden, interpretado por Rutherford, sustentou o modelo nuclear.\n\nBohr introduziu estados de energia quantizados para sistemas hidrogenoides. A mecânica quântica descreve estados por funções de onda e não por trajetórias eletrônicas clássicas. Cada modelo deve ser estudado com suas evidências, seu domínio de aplicação e suas limitações.","id":"knowledge-36","sourceIds":["quantum"]},
{"patterns":[/(?:orbital atomico|orbitais atomicos|orbital|orbitais|numeros quanticos|funcao de onda|hibridizacao|nuvem eletronica|densidade eletronica)/],"response":"**Orbital e órbita**\n\nUm **orbital** é uma função de onda de um elétron em um modelo quântico. Quando normalizada, sua densidade de probabilidade é dada por |ψ|²; a probabilidade em uma região é a integral dessa densidade no volume considerado.\n\nUma **órbita** é uma trajetória definida em um modelo clássico ou no modelo histórico de Bohr. O elétron não percorre o contorno de um orbital como um planeta percorre uma órbita.\n\nO orbital não é uma trajetória nem uma superfície rígida que contém o elétron. As superfícies desenhadas nas visualizações representam escolhas de densidade ou de probabilidade integrada, conforme a legenda e o modelo.","id":"knowledge-37","sourceIds":["quantum"]},
{"patterns":[/(?:nacl|cloreto de sodio|cscl|cloreto de cesio|zns|blenda|sal de cozinha|sulfeto de zinco)/],"response":"**Estruturas de NaCl, CsCl e ZnS**\n\n- **NaCl:** rede de Bravais CFC com motivo de dois íons; coordenação 6:6. Na célula convencional há quatro fórmulas NaCl.\n- **CsCl:** rede de Bravais cúbica primitiva com motivo de dois íons; coordenação 8:8. Não é uma rede BCC de pontos equivalentes, pois centro e vértices contêm espécies diferentes.\n- **ZnS, blenda:** rede CFC com motivo de dois átomos; coordenação 4:4. A wurtzita é outra estrutura de ZnS.\n\nCoordenação, motivo e tipo de rede são conceitos distintos.\n\nEm NaCl, cada Na⁺ tem seis Cl⁻ vizinhos mais próximos, e cada Cl⁻ tem seis Na⁺. Na descrição por empacotamento, todos os sítios octaédricos da sub-rede de ânions são ocupados. Na blenda ZnS, ocupa-se metade dos sítios tetraédricos, produzindo coordenação 4:4. A estabilidade dessas estruturas depende das interações e da estrutura eletrônica; a razão de raios é apenas um modelo aproximado.","priority":12,"id":"knowledge-38","sourceIds":["packing","crystal"]},
{"patterns":[/(teoria do campo cristalino|tcc|desdobramento do campo|baixo spin|alto spin|serie espectroquimica)/],"response":"**Teoria do campo cristalino**\n\nA TCC modela a interação do centro metálico com ligantes por um campo eletrostático. Em geometria octaédrica ideal, os orbitais d se separam nos conjuntos t₂g, de menor energia, e e_g, de maior energia, separados por Δₒ.\n\nPara configurações com alternativas de ocupação, a comparação entre desdobramento e energia de emparelhamento ajuda a discutir alto e baixo spin. A descrição não inclui integralmente a covalência; teorias de campo ligante e de orbitais moleculares ampliam o tratamento.","id":"knowledge-39","sourceIds":["cft"]},
{"patterns":[/(o que (e|sao) (um |o |os )?ligante|definicao de ligante|ligante na quimica|ligante no complexo|ligante monodentado|ligante polidentado|quelato|efeito quelato)/],"response":"**Ligantes e efeito quelato**\n\nLigantes coordenam-se a um centro por átomos doadores. A denticidade conta quantos desses átomos se ligam ao mesmo centro. Um ligante bidentado pode formar um anel de quelação; coordenação conta átomos doadores, não necessariamente o número de moléculas de ligante.\n\nO efeito quelato é o aumento de estabilidade de muitos complexos com ligantes multidentados em comparação com sistemas monodentados apropriados. Sua origem depende de contribuições entálpicas, entrópicas e de solvatação. Contar partículas numa equação é uma aproximação didática, não uma demonstração universal.","id":"knowledge-40","sourceIds":["coordination"]},
{"patterns":[/(?:quimica de coordenacao|compostos? de coordenacao|complexos? metalicos?|complexos?|numero de coordenacao do complexo|ligantes?)/],"response":"**Química de coordenação**\n\nUm complexo contém um centro, frequentemente metálico, ligado a ligantes por seus átomos doadores. Para descrevê-lo, identifique carga total, estado de oxidação, número de coordenação, denticidade e geometria.\n\nEm [Co(NH₃)₆]³⁺, os seis ligantes NH₃ são neutros; logo, o cobalto tem NOX +3 e coordenação 6. Geometria, cor e magnetismo dependem da estrutura eletrônica e do ambiente de ligação. Nem todo composto com metal de transição é colorido.","id":"knowledge-41","sourceIds":["coordination"]},
{"patterns":[/(lewis|ligacao ionica|ligacoes ionicas|ligacao covalente|ligacoes covalentes|valencia|eletroneutralidade|estrutura de lewis|regra do octeto|regra do dueto|dueto|octeto|compartilhamento de eletrons|transferencia de eletrons|compostos inorganicos|solidos inorganicos)/],"response":"**Lewis e ligações químicas**\n\nEstruturas de Lewis distribuem elétrons de valência entre ligações e pares não ligantes. A regra do octeto é útil para muitas espécies dos elementos representativos, mas possui exceções.\n\nA ligação covalente envolve densidade eletrônica compartilhada; a descrição iônica enfatiza a atração entre cátions e ânions. Um sólido como NaCl forma uma estrutura extensa, não um conjunto de moléculas isoladas NaCl. Ligações reais podem ter caráter iônico e covalente simultaneamente; a transferência de elétrons é um modelo de formação dos íons, não a definição completa da ligação.","id":"knowledge-42","sourceIds":["lewis","solids"]},
{"patterns":[/(quartzo|feldspato|fedalspato|aluminosilicato|silicato|silicatos|solido covalente|solidos covalentes|rede covalente)/],"response":"**Silicatos e redes covalentes**\n\nNos silicatos, tetraedros SiO₄ conectam-se de diferentes formas. O compartilhamento de oxigênios origina unidades isoladas, cadeias, folhas ou redes tridimensionais.\n\nNo quartzo, cada oxigênio faz a ponte entre dois silícios, dando a proporção global SiO₂. Feldspatos são aluminosilicatos em rede: substituir Si⁴⁺ por Al³⁺ exige compensação de carga, por exemplo por Na⁺, K⁺ ou Ca²⁺. A representação por tetraedros é um modelo estrutural, não uma coleção de moléculas isoladas.","id":"knowledge-43","sourceIds":["solids"]},
{"patterns":[/(formula unitaria|formulas unitarias|formula empirica|proporcao estequiometrica)/],"response":"**Fórmula unitária e fórmula empírica**\n\nA fórmula empírica expressa a menor proporção inteira entre elementos. Em compostos iônicos, a fórmula unitária representa a proporção estequiométrica das espécies, respeitando a neutralidade.\n\nCa²⁺ e Cl⁻ formam CaCl₂ na razão 1:2. Isso não significa que o sólido seja constituído por moléculas isoladas de CaCl₂. A célula convencional pode conter várias fórmulas unitárias; esse número é usualmente representado por Z.","id":"knowledge-44","sourceIds":["stoichiometry"]},
{"patterns":[/(?:estado de oxidacao|estados de oxidacao|nox|numero de oxidacao)/],"response":"**Estado de oxidação e carga formal**\n\nO estado de oxidação, ou NOX, atribui elétrons de ligação segundo uma aproximação iônica. Na carga formal de uma estrutura de Lewis, os elétrons de cada ligação são divididos igualmente entre os átomos. Os dois procedimentos não são equivalentes.\n\nEm H₂O, o oxigênio tem NOX −2 e os hidrogênios +1; na estrutura usual de Lewis, as cargas formais são zero. A soma dos NOX ou das cargas formais deve coincidir com a carga total da espécie. Carga parcial é ainda outro conceito e depende da distribuição eletrônica e do modelo de análise.","id":"knowledge-45","sourceIds":["oxidation","lewis"]},
{"patterns":[/(reacao quimica|reacoes quimicas|sintese|decomposicao|simples troca|dupla troca|neutralizacao|tipos de reacoes|reacao inorganica|reacoes inorganicas)/],"response":"**Reações químicas e estequiometria**\n\nUma equação química representa a transformação de reagentes em produtos. O balanceamento conserva o número de átomos de cada elemento e a carga total, ajustando coeficientes, sem modificar fórmulas.\n\nSíntese, decomposição, substituição, precipitação, neutralização e oxirredução são classificações úteis, que podem se sobrepor. Na neutralização de ácido e base fortes em água, H₃O⁺ + OH⁻ → 2 H₂O. A proporção quantitativa depende da equação balanceada e do reagente limitante.","id":"knowledge-46","sourceIds":["stoichiometry"]},
{"patterns":[/(?:nomenclatura inorganica|nome dos compostos|regras de nomenclatura|funcoes inorganicas)/],"response":"**Nomenclatura inorgânica**\n\nA nomenclatura relaciona composição, estrutura e nome. Identifique primeiro os constituintes e, quando necessário, o estado de oxidação. FeCl₂ é cloreto de ferro(II); FeCl₃, cloreto de ferro(III).\n\nOs nomes tradicionais de certos ácidos são aceitos e amplamente empregados: H₂SO₄ é ácido sulfúrico. Não existe uma regra única de sufixos que substitua todas as recomendações de nomenclatura. Para nomear uma espécie concreta, forneça sua fórmula e, se relevante, seu estado ou sua estrutura.","id":"knowledge-47","sourceIds":["stoichiometry"]},
{"patterns":[/(quimica organica|organica|carbono)/],"response":"**Química orgânica**\n\nEstuda principalmente a estrutura, as propriedades e as reações dos compostos de carbono. Algumas classes, como óxidos de carbono e carbonatos, são tradicionalmente estudadas na química inorgânica.\n\nA conectividade, os grupos funcionais e a estereoquímica influenciam a reatividade. Compostos orgânicos não precisam ser produzidos por seres vivos. Uma mesma fórmula molecular pode corresponder a estruturas diferentes, com propriedades distintas.","id":"knowledge-48","sourceIds":["functional"]},
{"patterns":[/(?:grupos? funcionais?|funcoes organicas|alcool|cetona|aldeido|acido carboxilico|amina|amida|ester)/],"response":"**Grupos funcionais**\n\nSão arranjos de átomos associados a padrões de propriedades e reatividade. Exemplos: hidroxila em álcoois; carbonila em aldeídos e cetonas; carboxila em ácidos carboxílicos; e o grupo −C(=O)−O− em ésteres.\n\nCH₃CH₂OH é um álcool e CH₃COOH é um ácido carboxílico. Um mesmo composto pode ter vários grupos funcionais. O comportamento da molécula depende também do restante da estrutura; reconhecer apenas um grupo não determina todas as propriedades.","id":"knowledge-49","sourceIds":["functional"]},
{"patterns":[/(nomenclatura organica|iupac organica)/],"response":"**Nomenclatura orgânica**\n\nPara compostos simples, identifique a função principal, escolha a cadeia ou o sistema parental apropriado e numere-o de acordo com as regras aplicáveis à função, às insaturações e aos substituintes.\n\nCH₃−CH(CH₃)−CH₂OH recebe o nome sistemático **2-metilpropan-1-ol**. A cadeia parental tem três carbonos e inclui o carbono ligado à hidroxila. Isobutanol é um nome comum. A numeração não consiste simplesmente em dar o menor número a qualquer substituinte.","id":"knowledge-50","sourceIds":["organic-names"]},
{"patterns":[/(?:reacoes organicas|adicao eletrofilica|markovnikov|reacao de adicao|reacao de substituicao|reacao de eliminacao)/],"response":"**Reações orgânicas**\n\nAdição, substituição, eliminação e oxirredução descrevem mudanças de ligação frequentes em química orgânica. A classificação deve ser acompanhada das condições de reação e do mecanismo considerado.\n\nNa adição eletrofílica usual de HCl ao propeno, o produto principal é 2-cloropropano. A protonação que favorece o intermediário carbocatiônico secundário precede o ataque de Cl⁻. Essa orientação é descrita pela regra de Markovnikov nesse contexto; ela não é uma lei para toda reação de adição.","id":"knowledge-51","sourceIds":["markovnikov"]},
{"patterns":[/(fisico-quimica|fisico quimica)/],"response":"**Físico-química**\n\nRelaciona estrutura da matéria, energia e transformações por modelos físicos e matemáticos. A termodinâmica trata de propriedades de estado, equilíbrio e direção possível dos processos sob condições especificadas. A cinética trata de velocidades e mecanismos.\n\nUma reação termodinamicamente favorável pode ser muito lenta. Por isso, espontaneidade, velocidade e rendimento experimental não devem ser tratados como sinônimos.","id":"knowledge-52","sourceIds":["gibbs","catalysis"]},
{"patterns":[/(?:termodinamica|leis da termodinamica)/],"response":"**Entalpia, entropia e energia de Gibbs**\n\nEntalpia é definida por H = U + pV. Sob pressão constante, em sistema fechado com apenas trabalho de expansão/compressão, ΔH corresponde ao calor trocado. Entropia relaciona-se à multiplicidade dos estados microscópicos e à distribuição de energia; “desordem” é apenas uma analogia limitada.\n\nA temperatura e pressão constantes, a diminuição de G caracteriza a direção termodinamicamente favorecida. Para estados à mesma temperatura, **ΔG = ΔH − TΔS**. Em reações, **ΔᵣG = ΔᵣG° + RT ln Q**: o valor padrão não substitui o valor nas condições reais. Espontaneidade não informa a velocidade.","id":"knowledge-53","sourceIds":["enthalpy","entropy","gibbs"]},
{"patterns":[/(cinetica|velocidade da reacao|energia de ativacao|catalisador)/],"response":"**Cinética e catálise**\n\nA cinética estuda a velocidade e o mecanismo de uma reação. Concentração, temperatura, área de contato e meio podem influenciar a velocidade; a relação depende da lei de velocidade e das condições.\n\nUm catalisador participa de um mecanismo alternativo e é regenerado no ciclo global. Ele permite atingir o equilíbrio mais rapidamente, mas não altera a constante de equilíbrio nem ΔᵣG° à mesma temperatura. Não é correto afirmar, em geral, que ele reduz as energias de ativação direta e inversa pela mesma proporção.","priority":10,"id":"knowledge-54","sourceIds":["catalysis"]},
{"patterns":[/(?:fases da agua|ponto critico|ponto triplo|comportamento anomalo da agua|diagrama de fases)/],"response":"**Diagrama de fases da água**\n\nAs regiões do diagrama indicam fases estáveis em condições de pressão e temperatura. No ponto triplo, gelo Iₕ, água líquida e vapor coexistem em equilíbrio: aproximadamente **273,16 K e 611,657 Pa** para água comum de composição especificada.\n\nO ponto crítico encerra a curva de coexistência líquido–vapor: cerca de **647,096 K e 22,064 MPa**. Fluido supercrítico requer temperatura e pressão acima dos valores críticos. Supercriticidade e superfluidez são fenômenos diferentes. O diagrama não informa, sozinho, a rapidez de uma transição.","id":"knowledge-55","sourceIds":["water"]},
{"patterns":[/(?:equacao de onda|equacao de schrodinger|hidrogenoide|hidrogenoides|dualidade onda particula|de broglie)/],"response":"**Equação de Schrödinger e sistemas hidrogenoides**\n\nNa forma estacionária, **Ĥψ = Eψ** relaciona a função de onda ao operador de energia e aos valores permitidos de energia. A interpretação probabilística usa |ψ|²; ψ pode ter sinal ou fase e não é, por si, uma probabilidade.\n\nSistemas hidrogenoides contêm um elétron, como H, He⁺ e Li²⁺. As soluções usuais pressupõem um modelo coulombiano não relativístico. Para mais elétrons, a repulsão eletrônica exige tratamento adicional. A função de onda não fornece uma órbita clássica do elétron.","id":"knowledge-56","sourceIds":["quantum"]},
{"patterns":[/(teoria do orbital molecular|orbital molecular|tom|orbitais ligantes|orbitais antiligantes)/],"response":"**Teoria dos orbitais moleculares**\n\nOrbitais moleculares são funções de onda deslocalizadas na molécula. No método de combinação de orbitais atômicos, combinações de simetrias e energias adequadas podem gerar orbitais ligantes, antiligantes e não ligantes.\n\nNo modelo introdutório, a ordem de ligação é **(N_ligantes − N_antiligantes)/2**. O O₂ no estado fundamental possui dois elétrons desemparelhados em orbitais π* e é paramagnético. Uma estrutura simples de Lewis não representa adequadamente esse estado eletrônico; isso não invalida todas as formulações modernas da ligação de valência.","id":"knowledge-57","sourceIds":["mo"]},
{"targeted":true,"priority":25,"patterns":[new RegExp("rutherford.*neutron"),new RegExp("chadwick"),/(experimento da folha de ouro|rutherford|carga do eletron|millikan|gota de oleo|tubo de crookes|raios catodicos|fenda dupla|experimento de thomson)/],"response":"**Evidências experimentais dos modelos atômicos**\n\nExperimentos com raios catódicos contribuíram para caracterizar o elétron e sua razão carga/massa. Millikan determinou a magnitude da carga elementar a partir de gotas eletrizadas. O espalhamento de partículas alfa estudado por Geiger e Marsden e interpretado por Rutherford sustentou a existência de um núcleo concentrado.\n\nEspectros e fenômenos de interferência também motivaram a teoria quântica. Cada experimento testa aspectos específicos; nenhum deles, isoladamente, estabelece todos os detalhes do modelo atual.\n\nO nêutron foi identificado por James Chadwick em 1932. Atribuir essa descoberta a Rutherford confunde resultados históricos diferentes: o modelo nuclear e a identificação do nêutron não são a mesma descoberta.","id":"knowledge-58","sourceIds":["atomic-history","quantum"]},
{"patterns":[/(?:buraco tetraedrico|buraco octaedrico|sitio tetraedrico|sitio octaedrico|intersticio|intersticios|lacuna cristalina|vacancia)/],"response":"**Interstício e vacância**\n\nUm interstício é uma posição entre os sítios normalmente ocupados da estrutura; uma vacância é a ausência de uma espécie em um sítio que estaria ocupado no modelo ideal. Portanto, os termos não são sinônimos.\n\nSítios tetraédricos e octaédricos são classificados pela geometria dos vizinhos, com coordenações quatro e seis, respectivamente. A ocupação real de um interstício depende da composição, do balanço de cargas e da estabilidade da estrutura.","id":"knowledge-59","sourceIds":["packing","solids"]},
{"id":"enthalpy","patterns":[/entalpia/],"response":"**Entalpia e calor**\n\nEntalpia é a função de estado H = U + pV. Em sistema fechado, sob pressão constante e com apenas trabalho de expansão/compressão, ΔH = qₚ. Fora dessas condições, a igualdade não pode ser aplicada automaticamente.\n\nΔH < 0 indica uma transformação exotérmica; ΔH > 0, endotérmica. A entalpia de reação refere-se à equação e à quantidade de transformação especificadas. O sinal de ΔH não determina, sozinho, a espontaneidade.","sourceIds":["enthalpy"]},
{"id":"entropy","patterns":[/entropia/],"response":"**Entropia**\n\nÉ uma função de estado que relaciona a descrição macroscópica às possibilidades microscópicas do sistema. Para microestados equiprováveis, S = kᵦ ln Ω. Em uma transformação reversível, dS = δqᵣₑᵥ/T.\n\nUm processo espontâneo irreversível aumenta a entropia total de um conjunto isolado. A entropia de uma parte pode diminuir se houver compensação na vizinhança. O termo cotidiano “desordem” é uma analogia limitada, não uma definição quantitativa.","sourceIds":["entropy"]},
{"id":"gibbs","patterns":[/gibbs|energia livre|espontaneidade|reacao espontanea|processo espontaneo|delta g/],"response":"**Energia de Gibbs e direção da reação**\n\nA temperatura e pressão constantes, a evolução espontânea de um sistema fechado reduz G até o equilíbrio. Para estados à mesma temperatura, ΔG = ΔH − TΔS.\n\nEm uma reação, ΔᵣG = ΔᵣG° + RT ln Q. O valor padrão relaciona-se ao equilíbrio por ΔᵣG° = −RT ln K, mas a direção na mistura depende de Q. Assim, ΔᵣG° < 0 não garante avanço direto em qualquer composição. Espontaneidade não é sinônimo de rapidez.","sourceIds":["gibbs","equilibrium"]},
{"id":"heat-work","patterns":[/(?:calor e trabalho|primeira lei|energia interna|trabalho de expansao|calor|temperatura|aquecimento|resfriamento)/],"response":"**Calor, trabalho e energia interna**\n\nCalor e trabalho são modos de transferência de energia, não substâncias armazenadas no corpo. Calor decorre de diferença de temperatura; temperatura não mede a quantidade total de energia.\n\nNa convenção química para sistema fechado, ΔU = q + w: q e w são positivos quando o sistema recebe energia. Para expansão/compressão contra pressão externa, w = −∫pₑₓₜ dV. A energia interna U é função de estado; q e w dependem do processo.","sourceIds":["enthalpy"]},
{"id":"hydrogen-bond","patterns":[/(?:ligac(?:ao|oes) de hidrogenio|pontes? de hidrogenio)/],"response":"**Ligação de hidrogênio**\n\nÉ uma interação direcional envolvendo um grupo doador X–H e uma região aceptora. Exemplos introdutórios frequentes envolvem N, O e F, mas essa lista não constitui uma definição universal. A ligação pode ser intermolecular ou intramolecular.\n\nNa água líquida, essas interações formam uma rede dinâmica. Sua ruptura ou reorganização em uma mudança de fase deve ser distinguida da quebra das ligações covalentes O–H.","sourceIds":["interactions"]},
{"id":"dispersion","patterns":[/(?:london|dispersao|polarizabilidade)/],"response":"**Forças de dispersão de London**\n\nResultam de flutuações correlacionadas da distribuição eletrônica e contribuem para a atração entre átomos e moléculas, inclusive polares. Sua intensidade depende da polarizabilidade e da geometria de contato.\n\nNão são exclusivas de moléculas apolares. Maior massa molar pode acompanhar maior polarizabilidade em uma série, mas a massa não é, isoladamente, a causa ou um critério universal de intensidade.","sourceIds":["interactions"]},
{"id":"intermolecular","patterns":[/forcas? intermoleculares?|interacoes? intermoleculares?|dipolo dipolo|ion dipolo|ion interage.*dipolo/],"response":"**Interações entre partículas**\n\nForças de dispersão contribuem em todas as espécies polarizáveis; moléculas polares também apresentam interações entre dipolos permanentes. Íons podem interagir com dipolos, como na hidratação de íons em água.\n\nA comparação deve considerar tamanho, polarizabilidade, forma e possibilidade de ligação de hidrogênio. Não há uma ordem universal de intensidade aplicável a quaisquer pares de substâncias. Essas interações ajudam a interpretar propriedades de fase e solubilidade.","sourceIds":["interactions"]},
{"id":"equilibrium","patterns":[new RegExp("equilibrio.*concentracoes"),new RegExp("q (?:for )?menor que k"),new RegExp("q (?:for )?maior que k"),/(?:equilibrio quimico|constante de equilibrio|le chatelier|quociente reacional)/],"response":"**Equilíbrio químico**\n\nÉ dinâmico: as reações direta e inversa continuam com velocidades iguais, mantendo as propriedades macroscópicas constantes nas condições fixadas. Isso não exige concentrações iguais.\n\nO quociente Q caracteriza a composição atual; no equilíbrio, Q = K. Atividades são adimensionais. Alterações de condições podem deslocar a composição de equilíbrio, enquanto um catalisador acelera sua aproximação sem mudar K à mesma temperatura.\n\nNo equilíbrio dinâmico, as velocidades direta e inversa são iguais; as concentrações ficam constantes nas condições mantidas, mas não precisam ser iguais entre si. Para a reação escrita, Q < K indica tendência no sentido direto e Q > K, no inverso, até o equilíbrio. Compare Q e K definidos para a mesma reação e temperatura.","sourceIds":["equilibrium","catalysis"]},
{"id":"ph","patterns":[/(?:ph|poh|acidez|basicidade)/],"response":"**pH e atividade**\n\nA definição usa a atividade do íon hidrogênio: pH = −log₁₀ a(H⁺). Em soluções aquosas suficientemente diluídas e sob aproximações adequadas, a atividade pode ser estimada a partir da concentração.\n\nNeutralidade corresponde à igualdade entre as atividades de H₃O⁺ e OH⁻. O valor neutro próximo de 7 refere-se à água perto de 25 °C; ele varia com a temperatura. A escala não é universalmente limitada ao intervalo de 0 a 14.","sourceIds":["ph"]},
{"id":"formal-charge","patterns":[/carga formal/],"response":"**Carga formal**\n\nNa estrutura de Lewis, CF = elétrons de valência do átomo neutro − elétrons não ligantes − metade dos elétrons ligantes. A soma das cargas formais deve reproduzir a carga total da espécie.\n\nNa H₂O representada com duas ligações O–H e dois pares livres no oxigênio, as cargas formais são zero. Já os NOX são −2 para O e +1 para H. Carga formal, NOX e carga parcial são descrições diferentes.","sourceIds":["lewis","oxidation"]},
{"id":"jahn-teller","patterns":[/jahn teller/],"response":"O Cu(II) é d⁹. Na aproximação octaédrica, o estado eletrônico degenerado é instável a certas distorções de Jahn–Teller. Um alongamento axial separa as energias de d_z² e d_x²−y²; o elétron desemparelhado costuma ter caráter predominantemente d_x²−y². O teorema prevê a instabilidade, mas não determina sozinho o sentido ou a amplitude da distorção.","sourceIds":["jahn-teller","cft"]},
{"id":"backbonding","patterns":[/(?:retrodoacao|backbonding|back donation)/],"response":"A ligação pode combinar doação σ do ligante para orbitais adequados do metal e retrodoação de densidade eletrônica do metal para orbitais π* do ligante. A segunda contribuição tende a fortalecer a interação metal–ligante e a reduzir a ordem da ligação interna C–O ou C–N. O modelo deve considerar a ocupação e a simetria dos orbitais, sem exigir que toda doação σ utilize um orbital d vazio.","sourceIds":["coordination","cft"]},
{"id":"laporte","patterns":[/laporte/],"response":"Em um ambiente com centro de inversão, transições d–d têm a mesma paridade nos estados inicial e final e são proibidas pela regra de Laporte na aproximação de dipolo elétrico. Acoplamento vibrônico e mistura de estados podem conferir intensidade. Muitas transições de transferência de carga são mais intensas, mas as regras de seleção e a simetria devem ser verificadas para cada transição.","sourceIds":["cft"]},
{"priority":4,"id":"chelate","patterns":[/efeito quelato|quelacao|denticidade|bidentad[oa]|multidentad[oa]|polidentad[oa]|ligantes?.*numero de coordenacao/],"response":"**Ligantes e efeito quelato**\n\nLigantes coordenam-se a um centro por átomos doadores. A denticidade conta quantos desses átomos se ligam ao mesmo centro. Um ligante bidentado pode formar um anel de quelação; coordenação conta átomos doadores, não necessariamente o número de moléculas de ligante.\n\nO efeito quelato é o aumento de estabilidade de muitos complexos com ligantes multidentados em comparação com sistemas monodentados apropriados. Sua origem depende de contribuições entálpicas, entrópicas e de solvatação. Contar partículas numa equação é uma aproximação didática, não uma demonstração universal.","sourceIds":["coordination"]},
{"id":"supercritical","patterns":[/superfluido|superfluidez|supercritico/],"response":"**Supercriticidade e superfluidez**\n\nUm fluido supercrítico está acima de sua temperatura e pressão críticas; nessa região não há separação líquido–vapor. Água supercrítica é um exemplo.\n\nSuperfluidez é um fenômeno quântico distinto, associado a estados como os de certos isótopos de hélio em temperaturas muito baixas. Ela não é uma fase da água que decorra simplesmente de ultrapassar o ponto crítico.","sourceIds":["water","quantum"]},
{"id":"lattice-motif","patterns":[/(?:rede e motivo|rede de bravais e estrutura|motivo cristalino|estrutura e rede)/],"response":"**Células unitárias e redes**\n\nA **rede de Bravais** é um conjunto periódico de pontos equivalentes. A **estrutura cristalina** resulta de associar um motivo, formado por átomos, íons ou moléculas, a cada ponto de rede. A **célula unitária**, repetida por translações, reproduz essa periodicidade.\n\nUma célula unitária não é necessariamente a menor possível: a **célula primitiva** tem volume mínimo para a rede e contém exatamente um ponto de rede na contagem compartilhada. Uma célula convencional centrada pode conter vários pontos de rede; ponto de rede não significa necessariamente um átomo.\n\nExistem sete sistemas cristalinos e 14 tipos de redes de Bravais no espaço tridimensional usual. A classificação depende da simetria; os parâmetros a, b, c, α, β e γ descrevem a célula, mas igualdades métricas acidentais não bastam para estabelecer a simetria.\n\nNo CsCl, centro e vértices contêm espécies diferentes e não são pontos equivalentes de uma rede CCC monoatômica: a rede de Bravais é cúbica primitiva com um motivo de duas espécies.","sourceIds":["unit-cell", "primitive-cell", "packing"]},
{"id":"nox-vs-formal","patterns":[/(?:nox e carga formal|carga formal e nox|oxidacao e carga formal|carga formal e estado de oxidacao)/],"response":"**Estado de oxidação e carga formal**\n\nO estado de oxidação, ou NOX, atribui elétrons de ligação segundo uma aproximação iônica. Na carga formal de uma estrutura de Lewis, os elétrons de cada ligação são divididos igualmente entre os átomos. Os dois procedimentos não são equivalentes.\n\nEm H₂O, o oxigênio tem NOX −2 e os hidrogênios +1; na estrutura usual de Lewis, as cargas formais são zero. A soma dos NOX ou das cargas formais deve coincidir com a carga total da espécie. Carga parcial é ainda outro conceito e depende da distribuição eletrônica e do modelo de análise.","sourceIds":["lewis","oxidation"]},
{"id":"measurement","patterns":[/(?:precisao e exatidao|exatidao e precisao|incerteza de medicao|volume exato)/],"response":"**Exatidão, precisão e incerteza**\n\nPrecisão descreve a concordância entre resultados de medições repetidas sob condições especificadas. Exatidão relaciona-se à proximidade de um valor de referência. Uma série pode ser muito repetível e ainda apresentar viés.\n\nToda medida experimental tem incerteza. Uma vidraria volumétrica fornece um volume nominal sob condições de calibração e tolerância determinadas; não um volume matematicamente exato.","sourceIds":["lab"]},
{"id":"bond-polarity","patterns":[/ligac(?:ao|oes) polares?/,/moleculas? polares?/],"response":"**Ligações polares e polaridade molecular**\n\nNão. Ter ligações polares não garante que uma molécula seja polar. No modelo de dipolos de ligação, é preciso considerar a soma vetorial das contribuições e a geometria molecular.\n\nO CO₂ isolado é linear: as contribuições C=O equivalentes se cancelam e a molécula é apolar. A H₂O é angular: as contribuições O–H não se cancelam e a molécula é polar.\n\nUma molécula polar apresenta momento dipolar elétrico permanente diferente de zero. A polaridade de cada ligação e a polaridade da molécula são conceitos relacionados, mas distintos.","sourceIds":["vsepr"]},
{"id":"electrostatic-map","patterns":[/mapas? (?:de )?potencial eletrostatico/,/potencial eletrostatico(?: molecular)?/,/mapa eletrostatico/,/^mep$/],"response":"**Mapa de potencial eletrostático**\n\nRepresenta como o potencial eletrostático varia nas posições ao redor de uma molécula, frequentemente por cores aplicadas a uma superfície. O potencial corresponde à energia potencial eletrostática por unidade de carga de prova positiva.\n\nO potencial é uma grandeza escalar, sem direção; ele não é a própria densidade eletrônica. A superfície escolhida para desenhar o mapa pode ser uma superfície de densidade eletrônica constante, mas as cores representam outra grandeza: o potencial.\n\nConsulte sempre a legenda e a escala: vermelho e azul não têm significado universal. O mapa pode ajudar a interpretar regiões de interação, mas, sozinho, não substitui a análise da geometria e do momento dipolar molecular.","sourceIds":["electrostatic-potential","electric-potential"]},
{"id":"mass-number","patterns":[/numero de massa/,/massa atomica(?: media| relativa)?/,/isotopos?/],"response":"**Número de massa e massa atômica**\n\nO **número de massa, A**, é a contagem de prótons e nêutrons no núcleo: A = Z + N. É um número inteiro, sem unidade de massa; Z é o número de prótons e N, o de nêutrons.\n\nA **massa atômica** é a massa de um átomo, geralmente expressa em unidade de massa atômica unificada, u. Não é simplesmente a contagem de partículas e não precisa ter valor inteiro nessa unidade.\n\nEm uma amostra com vários isótopos, a massa atômica média depende das massas e das abundâncias isotópicas. A massa atômica relativa, Aᵣ, é uma razão adimensional; o peso atômico padrão tabelado pode ser um valor ou um intervalo. Não se deve confundir nenhum desses valores com o número de massa de um isótopo.\n\nIsótopos têm o mesmo número de prótons, Z, e diferentes números de nêutrons. Ganhar ou perder elétrons forma íons e não muda Z nem, por esse processo eletrônico, o número de massa.","sourceIds":["atomic-structure", "atomic-weights"]},
{"id":"cubic-centering","patterns":[/corpo centrad[oa]s?/,/faces? centrad[oa]s?/,/ccc|cfc|bcc|fcc/],"response":"**Cúbica de corpo centrado e cúbica de faces centradas**\n\nNa célula cúbica convencional, a **CCC (BCC)** tem pontos de rede nos vértices e no centro do corpo; a contagem compartilhada equivale a **2 pontos de rede**. A **CFC (FCC)** tem pontos nos vértices e nos centros das faces, equivalentes a **4 pontos de rede**.\n\nNo modelo monoatômico de esferas iguais, isso corresponde a 2 e 4 átomos por célula convencional, respectivamente. O número de coordenação é **8 na CCC** e **12 na CFC**; as frações de empacotamento são aproximadamente **68%** e **74%**.\n\nEssas contagens de átomos pressupõem um átomo por ponto de rede. Em estruturas com um motivo mais complexo, a quantidade de átomos depende também desse motivo; ponto de rede e átomo não são sinônimos.","sourceIds":["packing"]},
{"id":"titration-endpoint","patterns":[/titulacao/,/ponto final/,/ponto de equivalencia/,/viragem do indicador/],"response":"**Ponto de equivalência e ponto final na titulação**\n\nO **ponto de equivalência** corresponde à proporção estequiométrica entre titulante e analito prevista para a reação. É definido pela quantidade de substância que reagiu, não pela cor do indicador.\n\nO **ponto final** é o sinal experimental usado para encerrar a titulação, como uma mudança de cor ou um critério instrumental. Ele procura indicar a equivalência, mas pode ocorrer antes ou depois dela.\n\nA diferença entre esses pontos contribui para o erro de titulação. Por isso, o indicador ou o método de detecção deve ser escolhido para a reação e as condições do experimento; a equivalência não corresponde necessariamente a pH 7.","sourceIds":["titration"]},
{"id":"pipette-types","patterns":[/pipetas? volumetricas? e (?:pipetas? )?graduadas?/,/pipetas? graduadas? e (?:pipetas? )?volumetricas?/],"response":"**Pipeta volumétrica e pipeta graduada**\n\nA **pipeta volumétrica** usual é calibrada para transferir um volume nominal fixo, indicado por uma marca de aferição. A **pipeta graduada** possui uma escala e permite transferir diferentes volumes dentro de sua faixa, por leituras inicial e final.\n\nEm condições comparáveis de capacidade e classe, a pipeta volumétrica geralmente apresenta tolerância menor. Essa comparação não é absoluta: consulte a classe, a capacidade e a tolerância declarada para cada instrumento.\n\nA temperatura de calibração, a leitura do menisco, o escoamento e a técnica de uso influenciam a medição. Nenhuma das duas fornece volume matematicamente exato; observe a indicação de calibração e as instruções do fabricante.","sourceIds":["lab"]},
{"id":"enthalpy-entropy","patterns":[/entalpia e entropia/,/entropia e entalpia/],"response":"**Entalpia e entropia**\n\nA **entalpia, H**, é uma função de estado definida por H = U + pV. Em um sistema fechado, a pressão constante e com apenas trabalho de expansão/compressão, sua variação corresponde ao calor trocado: ΔH = qₚ.\n\nA **entropia, S**, é outra função de estado, relacionada às possibilidades microscópicas compatíveis com o estado macroscópico. Em uma transformação reversível, dS = δqᵣₑᵥ/T; a ideia cotidiana de “desordem” é apenas uma analogia limitada.\n\nSão grandezas distintas: a entalpia é expressa em unidade de energia, enquanto a entropia é expressa em energia por temperatura. O sinal de ΔH, sozinho, não determina a espontaneidade de uma transformação.","sourceIds":["enthalpy", "entropy"]},
{"targeted":true,"priority":25,"id":"quantum-nodes","patterns":[new RegExp("no radial"),new RegExp("nos? (?:radiais|angulares)"),/um no.*(?:orbital|onda)/,/nos (?:radiais|angulares|de uma funcao)/,/superficie nodal|plano nodal|regiao nodal/],"response":"**Nós da função de onda**\n\nUm nó é uma posição ou superfície em que a função de onda ψ é zero; consequentemente, a densidade de probabilidade |ψ|² também é zero. Não é apenas uma região de probabilidade pequena.\n\nNos orbitais hidrogenoides, nós radiais estão associados a certas distâncias do núcleo; nós angulares estão associados à dependência angular. A representação deve distinguir a função de onda, que pode ter sinal ou fase, de seu módulo ao quadrado.\n\nEncontrar uma densidade nula em uma superfície não significa que o elétron percorra uma órbita ou que exista uma parede material naquele lugar.\n\nPara os orbitais hidrogenoides usuais: número de nós radiais = n − l − 1; número de nós angulares = l; total = n − 1. O orbital 3p tem n=3 e l=1: um nó radial e um angular. O 1s tem n=1 e l=0, portanto nenhum nó radial ou angular.","sourceIds":["quantum"]},
{"id":"radial-probability","patterns":[/densidade radial|probabilidade radial|distribuicao radial/],"response":"**Densidade radial de probabilidade**\n\nEla descreve a distribuição da distância r entre o elétron e o núcleo, considerando todas as direções. Não é a mesma grandeza que a densidade de probabilidade em um ponto do espaço.\n\nPara um orbital hidrogenoide separável, ψ = R(r)Y(θ,φ), com a parte angular normalizada, a densidade radial é P(r) = r²|R(r)|². A probabilidade de encontrar o elétron em uma casca entre r e r + dr é P(r)dr; em um intervalo finito, integra-se P(r) nesse intervalo.\n\nPara um orbital s esfericamente simétrico, também se pode escrever P(r) = 4πr²|ψ(r)|². As duas expressões usam funções diferentes e não devem ser misturadas: R é a parte radial, enquanto ψ é a função espacial completa.","sourceIds":["radial-probability", "quantum"]},
{"id":"probability-region","patterns":[/probabilidade.*(?:achar|encontrar|localizar).*eletron.*regiao/,/probabilidade.*eletron.*volume/,/integral.*densidade.*probabilidade/],"response":"**Probabilidade de encontrar o elétron em uma região**\n\nPara uma função de onda espacial normalizada, |ψ|² é a densidade de probabilidade. A probabilidade de encontrar o elétron em uma região é a integral de |ψ|² sobre o volume dessa região.\n\nÉ preciso considerar tanto a densidade quanto o elemento de volume; o valor da densidade em um único ponto não é, sozinho, uma probabilidade. Em coordenadas esféricas, o elemento de volume inclui fatores geométricos, que também aparecem na distribuição radial.\n\nEssa interpretação descreve resultados possíveis de medidas, sem atribuir ao elétron uma trajetória clássica definida.","sourceIds":["quantum"]},
{"targeted":true,"priority":35,"id":"meniscus-reading","patterns":[/menisco|erro de paralaxe|leitura volumetrica/],"response":"**Menisco e leitura de volume**\n\nO menisco é a superfície curva do líquido em contato com a parede do recipiente. A leitura deve ser feita com os olhos na altura da marca ou da escala para reduzir o erro de paralaxe.\n\nPara líquidos transparentes com menisco côncavo, a leitura usual usa a parte inferior da curva, conforme a calibração e as instruções do instrumento. Essa orientação não é universal para todo líquido ou método de leitura.\n\nTemperatura, limpeza, tempo de escoamento e técnica também influenciam o volume medido. Consulte a classe, a tolerância e a indicação de calibração da vidraria; enxergar mais casas na escala não elimina a incerteza.","sourceIds":["lab"]},
{"id":"packing-variants-reviewed","response":"**Cúbica simples e hexagonal compacta**\n\nNo modelo monoatômico de esferas iguais, a cúbica simples tem coordenação 6, um átomo efetivo por célula cúbica e fator de empacotamento π/6, aproximadamente 52%.\n\nA estrutura hexagonal compacta, HCP, tem coordenação 12 e empacotamento de aproximadamente 74% na razão axial ideal. A célula primitiva hexagonal contém um motivo de dois átomos; o prisma hexagonal maior usado em muitas ilustrações reúne três dessas células e contém seis átomos efetivos. Por isso, dois e seis se referem a escolhas de volume diferentes, não a respostas incompatíveis.","sourceIds":["packing"],"priority":30,"targeted":true,"patterns":[new RegExp("hexagonal compact[ao]"),new RegExp("cubica simples.*(?:fator|empacotamento|coordenacao)")]},
{"id":"interstitial-counts-reviewed","response":"**Quantos interstícios há na CFC?**\n\nUma célula CFC convencional contém quatro átomos efetivos da espécie que forma o empacotamento, oito sítios tetraédricos e quatro sítios octaédricos. Em um empacotamento compacto com N partículas, existem 2N sítios tetraédricos e N octaédricos.\n\nExistir um sítio não significa que ele esteja ocupado. Na blenda ZnS, quatro dos oito sítios tetraédricos da célula convencional são ocupados; no modelo de NaCl, os quatro octaédricos são ocupados. Coordenação conta vizinhos de uma partícula, e não o total de sítios ou de átomos na célula.","sourceIds":["packing"],"priority":30,"targeted":true,"patterns":[new RegExp("(?:sitios|buracos|intersticios) (?:tetraedricos|octaedricos).*cfc"),new RegExp("cfc.*(?:sitios|buracos) (?:tetraedricos|octaedricos)")]},
{"id":"cell-formula-reviewed","response":"**Fórmula pela contagem compartilhada**\n\nConte cada espécie separadamente. Um ocupante no vértice contribui com 1/8, pois é compartilhado por oito células cúbicas; no centro de aresta, com 1/4, por quatro células; no centro de face, com 1/2, por duas células; no interior, com 1. Esses fatores referem-se a posições ocupadas, não ao tamanho do desenho da esfera.\n\nCom A nos oito vértices e B nos centros das seis faces: A = 8×1/8 = 1 e B = 6×1/2 = 3; a fórmula é AB₃. Com A nos oito vértices e um B no centro do corpo: A = 1 e B = 1, dando AB. As ocupações devem estar especificadas; não se pode deduzir a fórmula apenas pelo contorno da célula.","sourceIds":["packing"],"priority":30,"targeted":true,"patterns":[new RegExp("formula.*(?:vertices|faces|arestas)"),new RegExp("celula.*atomos a.*atomo b"),new RegExp("aresta.*(?:conta|compartilhad)")]},
{"id":"crystal-order-reviewed","response":"**Cristalino, amorfo e defeitos**\n\nNos cristais periódicos apresentados no SiMoEns, há ordem estrutural de longo alcance descrita por uma rede e um motivo. Um sólido amorfo apresenta organização local, mas não essa periodicidade de longo alcance. Essa é a distinção estrutural; o formato externo, sozinho, não identifica a ordem interna.\n\nUm cristal real pode conter vacâncias, impurezas, discordâncias e contornos de grão e continuar cristalino. Ter defeitos não equivale a perder toda a ordem. A classificação mais ampla dos cristais também abrange casos não periódicos, como os quasicristais.","sourceIds":["solids", "crystal", "crystal-definition"],"priority":30,"targeted":true,"patterns":[new RegExp("solido amorfo"),new RegExp("continuar sendo cristalino")]},
{"id":"quantum-numbers-reviewed","response":"**Números quânticos e capacidade dos subníveis**\n\nNo modelo atômico usual, n = 1, 2, 3, … é o número quântico principal; l = 0, 1, …, n−1 identifica o subnível; mₗ = −l, …, +l distingue os orbitais; mₛ = +1/2 ou −1/2 descreve a projeção do spin do elétron. O spin não é uma rotação clássica de uma pequena esfera.\n\nPara n=3, l pode ser 0, 1 ou 2. Não existe orbital 2d nesse modelo: d exige l=2, mas para n=2 só são permitidos l=0 e l=1.\n\nUm subnível tem 2l+1 orbitais. Assim, s, p, d e f têm 1, 3, 5 e 7 orbitais, com capacidades máximas de 2, 6, 10 e 14 elétrons. Cada orbital pode conter no máximo dois elétrons com projeções de spin opostas.","sourceIds":["quantum","electron-configuration"],"priority":30,"targeted":true,"patterns":[new RegExp("numeros? quanticos?"),new RegExp("para n 3.*valores.*l"),new RegExp("orbital 2d"),new RegExp("quantos orbitais.*subnivel"),new RegExp("quantos eletrons.*(?:orbital|subnivel)")]},
{"id":"electronic-occupation-reviewed","response":"**Pauli, Hund e Aufbau**\n\nO princípio de exclusão de Pauli impede que dois elétrons de um mesmo átomo tenham os quatro números quânticos iguais. Em um orbital, cabem no máximo dois, com spins opostos.\n\nA regra de Hund orienta a ocupação de orbitais degenerados no estado fundamental: distribuem-se elétrons com spins paralelos antes de emparelhar, dentro dessa descrição.\n\nO princípio de Aufbau organiza o preenchimento por energias. O diagrama usual de diagonais é uma aproximação; há exceções e rearranjos, especialmente em metais de transição e íons. Não se deve tratar uma ordem fixa de subníveis como universal para todas as espécies.","sourceIds":["electron-configuration"],"priority":30,"targeted":true,"patterns":[new RegExp("pauli|hund|aufbau")]},
{"id":"orbital-phase-reviewed","response":"**Como interpretar cores e superfícies de orbitais**\n\nEm muitos visualizadores, as duas cores dos lobos representam sinais ou fases diferentes da função de onda ψ, não cargas positiva e negativa. A densidade de probabilidade |ψ|² é não negativa. Consulte a legenda: um mapa de potencial eletrostático usa outra grandeza.\n\nUma superfície escolhida para envolver 90% da probabilidade não é uma parede: ainda há probabilidade fora dela. Já uma isosuperfície de valor fixo de densidade não corresponde automaticamente a uma porcentagem de probabilidade.\n\nEm um estado estacionário, a densidade pode permanecer constante no tempo; isso não significa que um elétron esteja parado em um lobo nem que percorra uma trajetória desenhada.","sourceIds":["quantum","radial-probability"],"priority":30,"targeted":true,"patterns":[new RegExp("cores.*lobos"),new RegExp("lobos.*cargas"),new RegExp("isosuperficie"),new RegExp("eletron fica parado")]},
{"id":"orbital-1s-density-reviewed","response":"**Densidade em um ponto e distribuição radial no 1s**\n\nNo modelo hidrogenoide não relativístico, a densidade espacial |ψ₁ₛ|² é máxima no núcleo e diminui com a distância. A probabilidade em um único ponto de um espaço contínuo, porém, é zero; probabilidades finitas são obtidas integrando em um volume.\n\nA densidade radial inclui o tamanho das cascas esféricas: P(r)=r²|R(r)|². Ela é zero em r=0 e, para o 1s, tem máximo em r=a₀/Z. Para o hidrogênio, Z=1. Não confunda o máximo da densidade espacial com o da distribuição da distância ao núcleo.","sourceIds":["radial-probability","quantum"],"priority":30,"targeted":true,"patterns":[new RegExp("densidade.*1s.*maxima"),new RegExp("1s.*(?:densidade|maxim[ao])")]},
{"id":"hydrogen-scaling-reviewed","response":"**Energia e tamanho em sistemas hidrogenoides**\n\nPara um único elétron num campo coulombiano, no modelo não relativístico com núcleo fixo, Eₙ ≈ −13,6 Z²/n² eV. A energia depende de n e Z, mas não de l nesse modelo. Correções de massa nuclear, relatividade e outros efeitos refinam essa descrição.\n\nPara os mesmos números quânticos, a escala espacial do orbital diminui aproximadamente como 1/Z. Um sistema hidrogenoide tem apenas um elétron: H e He⁺ são exemplos; He neutro tem dois elétrons e não é hidrogenoide.\n\nEm átomos com vários elétrons, repulsão eletrônica e blindagem alteram as energias. O modelo simples de Bohr não descreve adequadamente esses efeitos nem substitui a mecânica quântica.","sourceIds":["quantum","radial-probability","electron-configuration"],"priority":30,"targeted":true,"patterns":[new RegExp("energia do hidrogenio.*depende"),new RegExp("carga nuclear.*tamanho.*orbital"),new RegExp("bohr.*varios eletrons")]},
{"id":"molecular-ions-reviewed","response":"**Geometria de NH₄⁺ e NO₃⁻**\n\nO íon amônio, NH₄⁺, tem geometria tetraédrica ideal, com quatro ligações N–H equivalentes e sem par não ligante no N. O nitrato, NO₃⁻, é trigonal plano; a ressonância descreve a deslocalização eletrônica e a equivalência das ligações N–O no íon ideal, não uma alternância temporal entre desenhos de Lewis.\n\nEssas espécies têm carga líquida. A classificação polar/apolar usada para moléculas neutras não deve ocultar essa carga: o momento dipolar de um sistema carregado depende da origem escolhida. A simetria em torno do centro não torna NH₄⁺ ou NO₃⁻ moléculas neutras apolares.","sourceIds":["vsepr", "resonance", "ion-dipole-origin"],"priority":30,"targeted":true,"patterns":[new RegExp("nh4"),new RegExp("no3.*(?:trigonal|ressonancia|geometria)")]},
{"id":"diatomic-polarity-reviewed","response":"**Diatômicas: forma linear não garante apolaridade**\n\nUma molécula diatômica é linear porque há apenas dois núcleos. HCl e HF apresentam momento dipolar permanente e são polares: existe uma ligação polar e não há outra ligação para cancelá-la.\n\nUma diatômica homonuclear isolada, como N₂ ou O₂, não tem dipolo elétrico permanente. Portanto, linearidade sozinha não decide a polaridade; a identidade dos átomos e a distribuição eletrônica também importam.","sourceIds":["vsepr"],"priority":30,"targeted":true,"patterns":[new RegExp("hcl.*(?:geometria|linear|polar)"),new RegExp("hf.*(?:geometria|linear|polar)")]},
{"id":"oxygen-magnetism-reviewed","response":"**Orbitais moleculares de O₂ e N₂**\n\nNo estado fundamental do O₂ isolado, o modelo de orbitais moleculares prevê dois elétrons desemparelhados em orbitais π* degenerados. Por isso, o O₂ é paramagnético. A ordem de ligação é (Nₗᵢg − Nₐₙₜᵢ)/2 = 2.\n\nNo N₂, a ordem de ligação é 3 e os elétrons estão emparelhados: ele é diamagnético no estado fundamental. A ligação N–N é mais forte e mais curta que a O–O nessas moléculas. Ordem de ligação é um indicador útil, mas não uma escala universal para comparar quaisquer ligações de elementos diferentes.","sourceIds":["mo"],"priority":30,"targeted":true,"patterns":[new RegExp("o2.*(?:paramagnetico|diamagnetico|ordem de ligacao)"),new RegExp("ordem de ligacao.*o2"),new RegExp("n2.*(?:ligacao mais forte|ordem).*o2"),new RegExp("o2.*orbitais moleculares")]},
{"id":"sigma-pi-reviewed","response":"**Ligações σ e π**\n\nNa descrição localizada usual, uma ligação σ tem sobreposição ao longo do eixo internuclear; uma ligação π envolve sobreposição lateral, com um plano nodal contendo esse eixo. São descrições da simetria orbital, não tipos diferentes de elétron.\n\nUma ligação simples usual tem uma ligação σ; uma dupla, uma σ e uma π; uma tripla, uma σ e duas π. A contagem pressupõe esse modelo de ligações localizadas e não deve ser transferida automaticamente para sistemas deslocalizados.","sourceIds":["valence-bond"],"priority":30,"targeted":true,"patterns":[new RegExp("ligac(?:ao|oes).*sigma"),new RegExp("ligac(?:ao|oes).*\\bpi\\b"),new RegExp("ligac(?:ao|oes).*σ"),new RegExp("ligac(?:ao|oes).*π")]},
{"id":"hybrid-model-reviewed","response":"**Hibridização como modelo de ligação**\n\nHibridização é uma combinação matemática de orbitais usada em um modelo de ligação localizada; não é um processo filmado em que orbitais físicos se misturam antes da formação da molécula. O modelo é avaliado por sua capacidade de representar estrutura e propriedades.\n\nNo modelo usual do CO₂ linear, o carbono é descrito como sp: dois orbitais híbridos orientam as ligações σ, e orbitais p não hibridizados participam das ligações π. Não se usa sp² para o carbono central dessa molécula linear. A atribuição não substitui uma descrição completa por orbitais moleculares.","sourceIds":["hybrid-orbitals","valence-bond"],"priority":30,"targeted":true,"patterns":[new RegExp("hibridizacao"),new RegExp("co2.*\\bsp2?\\b"),new RegExp("carbono.*\\bsp2?\\b")]},
{"id":"lone-pairs-polarity-reviewed","response":"**Pares não ligantes e polaridade**\n\nNão: a presença de um par não ligante não garante polaridade molecular. É necessário avaliar a geometria e a distribuição de carga da molécula inteira.\n\nXeF₂ tem pares não ligantes no átomo central e geometria linear; XeF₄ tem pares não ligantes opostos e geometria quadrada plana. Nas espécies ideais isoladas, as contribuições se cancelam e o dipolo permanente é zero. H₂O, por sua vez, é angular e polar.","sourceIds":["vsepr"],"priority":30,"targeted":true,"patterns":[new RegExp("par (?:isolado|nao ligante).*sempre.*polar")]},
{"id":"apolar-water-reviewed","response":"**Uma espécie apolar pode interagir com água?**\n\nSim. Ausência de dipolo permanente não significa ausência de interações. A água pode induzir dipolos em espécies polarizáveis, e forças de London também participam.\n\nA solubilidade depende do balanço termodinâmico entre interações e reorganização do sistema, não apenas da frase “semelhante dissolve semelhante”. Interagir com água não implica ser muito solúvel nem formar ligações de hidrogênio com ela.","sourceIds":["interactions","gibbs"],"priority":30,"targeted":true,"patterns":[new RegExp("apolar.*(?:interagir|interage|interacao).*agua")]},
{"id":"boiling-pressure-reviewed","response":"**Ebulição, pressão e vapor de água**\n\nA água não ferve sempre a 100 °C. A ebulição ocorre quando a pressão de vapor do líquido alcança a pressão externa; para água pura, 100 °C é aproximadamente o ponto de ebulição sob 1 atm. Em altitudes elevadas, a pressão costuma ser menor e a temperatura de ebulição também diminui.\n\nHá vapor de água abaixo de 100 °C: evaporação ocorre na superfície sem exigir ebulição. Ferver água não rompe, em geral, as ligações covalentes O–H para formar hidrogênio e oxigênio; as moléculas de H₂O passam para a fase gasosa, reorganizando suas interações intermoleculares.","sourceIds":["phase-transitions","phase-diagrams"],"priority":30,"targeted":true,"patterns":[new RegExp("agua.*(?:ferve|ferver|fervendo|vapor)"),new RegExp("ponto de ebulicao"),new RegExp("pressao.*ebulicao"),new RegExp("ebulicao.*pressao")]},
{"id":"ice-density-reviewed","response":"**Gelo comum e inclinação da curva de fusão**\n\nPerto da pressão atmosférica, o gelo comum, gelo Iₕ, é menos denso que a água líquida: sua rede de ligações de hidrogênio ocupa mais volume. Isso não é uma regra para todas as fases de gelo em qualquer pressão.\n\nNa fusão do gelo Iₕ nessas condições, ΔV é negativo e ΔH de fusão é positivo. Pela relação de Clapeyron, dP/dT = ΔH/(TΔV), a curva de equilíbrio sólido–líquido tem inclinação negativa nessa região.","sourceIds":["phase-diagrams","water"],"priority":30,"targeted":true,"patterns":[new RegExp("gelo.*(?:denso|densidade)"),new RegExp("fusao.*agua.*inclinacao"),new RegExp("linha de fusao.*negativa")]},
{"id":"phase-dissolution-reviewed","response":"**Fusão e dissolução**\n\nFusão é a transição de uma substância do estado sólido para o líquido. Dissolução é a formação de uma solução quando um soluto se dispersa em um solvente; não exige que o soluto passe pelo seu ponto de fusão.\n\nGelo fundindo e sal dissolvendo em água são processos diferentes. Na dissolução, é preciso considerar as interações entre soluto e solvente; o desaparecimento visual do sólido não prova que ele fundiu.","sourceIds":["phase-transitions","interactions"],"priority":30,"targeted":true,"patterns":[new RegExp("fusao e dissolucao"),new RegExp("dissolucao e fusao")]},
{"id":"sublimation-reviewed","response":"**Sublimação e ponto triplo**\n\nSublimação é a passagem direta de sólido para vapor. Abaixo da pressão do ponto triplo de uma substância pura, a fase líquida não é estável em equilíbrio e o aquecimento pode levar o sólido diretamente ao vapor.\n\nO diagrama de uma substância pura deve ser interpretado com cuidado quando há ar ou outros gases: a pressão parcial do vapor e a composição do ambiente também importam. O gelo pode sublimar em ar seco sem que a pressão total atmosférica esteja abaixo da pressão do ponto triplo da água.","sourceIds":["phase-diagrams","phase-transitions"],"priority":30,"targeted":true,"patterns":[new RegExp("sublimacao.*ponto triplo"),new RegExp("ponto triplo.*sublimacao")]},
{"id":"spontaneity-heat-reviewed","response":"**Endotérmico não significa não espontâneo**\n\nUma transformação endotérmica pode ser espontânea nas condições apropriadas. A pressão e temperatura constantes, o critério envolve ΔG = ΔH − TΔS para o processo nas condições consideradas.\n\nUm ΔH positivo pode ser compensado por uma contribuição TΔS positiva suficientemente grande. É preciso usar temperatura em kelvin, unidades compatíveis e dados referentes às mesmas condições. O sinal de ΔH, sozinho, não determina a espontaneidade nem a rapidez da transformação.","sourceIds":["gibbs","enthalpy","entropy"],"priority":30,"targeted":true,"patterns":[new RegExp("endotermic[ao].*(?:espontane|nao espontane)\\w*"),new RegExp("espontane\\w*.*endotermic[ao]")]},
{"id":"acid-strength-reviewed","response":"**Força do ácido, concentração, pH e pKa**\n\nForça ácida e concentração são propriedades distintas. A força envolve o equilíbrio de ionização em um solvente e temperatura definidos; concentração é a quantidade de soluto por volume ou outra unidade especificada. Um ácido forte pode estar diluído, e um ácido fraco pode estar concentrado.\n\nO pH descreve a atividade de H⁺ na solução. O pKa = −log₁₀ Ka caracteriza o equilíbrio ácido-base nas condições especificadas. Em comparações no mesmo solvente e temperatura, um pKa menor corresponde a um ácido mais forte. Não são valores intercambiáveis.","sourceIds":["acid-strength","ph"],"priority":30,"targeted":true,"patterns":[new RegExp("acido forte.*concentrad\\w*"),new RegExp("acido fraco.*concentrad\\w*"),new RegExp("\\bpka\\b")]},
{"id":"coordination-count-reviewed","response":"**NOX e número de coordenação**\n\nO NOX é uma atribuição formal baseada em uma aproximação iônica das ligações. O número de coordenação conta átomos doadores diretamente ligados ao centro metálico; não é a carga do metal nem o número de moléculas de ligante em todos os casos.\n\nEm [Co(NH₃)₆]Cl₃, os três Cl⁻ externos compensam a carga +3 do íon complexo. Como NH₃ é neutro, o Co tem NOX +3. Os seis átomos de N coordenados dão número de coordenação 6. Um ligante bidentado fornece dois doadores ao mesmo centro, mas outros ligantes também entram na contagem total.","sourceIds":["coordination","oxidation"],"priority":30,"targeted":true,"patterns":[new RegExp("(?:numero de oxidacao|nox).*numero de coordenacao"),new RegExp("numero de coordenacao.*(?:numero de oxidacao|nox)")]},
{"id":"ambidentate-reviewed","response":"**Ligante ambidentado e denticidade**\n\nUm ligante ambidentado pode se coordenar por átomos alternativos, produzindo modos de ligação diferentes. Isso não significa que ele se ligue obrigatoriamente por todos esses átomos ao mesmo tempo.\n\nDenticidade conta quantos átomos doadores do ligante se ligam simultaneamente ao mesmo centro. Um ligante bidentado pode formar um quelato; um ligante ambidentado que usa apenas um doador em uma dada ligação continua monodentado nesse modo de coordenação.","sourceIds":["coordination"],"priority":30,"targeted":true,"patterns":[new RegExp("ligante.*(?:doadores diferentes|atomos diferentes)"),new RegExp("ambidentad[oa]")]},
{"id":"spin-color-reviewed","response":"**Spin e origem da cor em complexos**\n\nEm complexos octaédricos d⁴ a d⁷, alto e baixo spin correspondem a diferentes ocupações dos orbitais d, conforme o desdobramento do campo e o custo de emparelhar elétrons. Alto spin tem mais elétrons desemparelhados; baixo spin, menos, para a mesma configuração comparada. A distinção não gera duas alternativas diferentes para toda contagem d.\n\nUm centro d⁰ não apresenta transições d–d, mas o composto pode ser colorido por outros mecanismos. No permanganato, MnO₄⁻, a cor intensa é associada principalmente à transferência de carga do ligante para o metal; Mn(VII) é formalmente d⁰. Cor, magnetismo e NOX são propriedades relacionadas, mas não equivalentes.","sourceIds":["cft", "coordination", "permanganate-spectrum"],"priority":30,"targeted":true,"patterns":[new RegExp("composto colorido.*d0"),new RegExp("d0.*(?:colorid\\w*|cor)"),new RegExp("permanganato.*colorid\\w*"),new RegExp("alto e baixo spin"),new RegExp("baixo e alto spin")]},
{"id":"gem-origin-reviewed","response":"**Gema natural, sintética e imitação**\n\nUma gema sintética é produzida pelo ser humano e tem essencialmente a composição química e a estrutura cristalina de sua correspondente natural. Uma imitação apenas se parece com outra gema e pode ser um material diferente; origem artificial e imitação não são sinônimos. Uma gema natural ou sintética também pode receber tratamentos.\n\nNem todo cristal transparente é classificado ou usado como gema. Aparência, resistência, possibilidade de uso e critérios gemológicos entram nessa classificação; também há materiais gemológicos que não são cristais transparentes.","sourceIds":["gem-synthesis","gem-identification"],"priority":30,"targeted":true,"patterns":[new RegExp("gemas? sintetic[ao]"),new RegExp("cristal transparente.*gema")]},
{"id":"gem-identification-reviewed","response":"**Limites da identificação de gemas por aparência**\n\nCor e fotografia, sozinhas, não identificam com certeza uma gema nem demonstram sua origem natural, sintética ou um tratamento. Materiais diferentes podem parecer semelhantes, e iluminação, câmera e tela modificam a aparência.\n\nA identificação pode exigir propriedades ópticas, inclusões e métodos instrumentais, como espectroscopia. Nem todo tratamento térmico é detectável por uma imagem; a conclusão precisa de evidências adequadas e do alcance declarado do exame.","sourceIds":["gem-identification","gem-treatment"],"priority":30,"targeted":true,"patterns":[new RegExp("identificar.*gema.*(?:cor|fotografia)"),new RegExp("tratamento.*gema.*fotografia"),new RegExp("gemas?.*(?:identific|detect).*fotografia")]},
{"id":"gem-host-reviewed","response":"**Por que cromo não torna rubi e esmeralda o mesmo mineral?**\n\nO rubi é uma variedade de coríndon, Al₂O₃; a esmeralda é uma variedade de berilo, Be₃Al₂Si₆O₁₈. A presença de Cr³⁺ como cromóforo em ambos não torna suas estruturas e composições iguais.\n\nO ambiente de coordenação e a estrutura eletrônica do hospedeiro afetam as energias das transições e a absorção de luz. Por isso, um mesmo elemento cromóforo pode participar de cores diferentes em minerais diferentes.","sourceIds":["ruby","emerald","gem-color"],"priority":30,"targeted":true,"patterns":[new RegExp("esmeralda e rubi"),new RegExp("rubi e esmeralda")]},
{"id":"light-color-reviewed","response":"**Absorção e interferência na cor**\n\nAbsorção seletiva remove determinadas faixas espectrais da luz transmitida ou refletida por transições eletrônicas. Interferência e difração envolvem a combinação de ondas espalhadas por estruturas, podendo produzir cor sem o mesmo mecanismo de absorção.\n\nNem toda cor de gema vem de transições d–d: centros de cor, transferência de carga e efeitos estruturais também importam. No jogo de cores da opala, a organização de esferas de sílica participa da difração e interferência da luz.","sourceIds":["gem-color","opal"],"priority":30,"targeted":true,"patterns":[new RegExp("cor.*interferencia.*absorcao"),new RegExp("toda cor.*gema.*transic\\w*")]},
{"id":"lab-oral-reviewed","response":"**Segurança de laboratório — boca e inalação**\n\nNunca pipete com a boca: use um dispositivo de pipetagem apropriado. Também não cheire um reagente diretamente nem prove substâncias de laboratório. A aparência e o odor não demonstram que uma substância é segura.\n\nA manipulação deve seguir a ficha com dados de segurança, o procedimento do laboratório e a supervisão responsável. Não improvise testes por inalação para identificar um reagente desconhecido.","sourceIds":["lab-practices"],"priority":30,"targeted":true,"patterns":[new RegExp("pipetar.*boca"),new RegExp("cheirar.*reagente.*diretamente"),new RegExp("cheirar.*diretamente.*reagente")]},
{"id":"lab-sealed-reviewed","response":"**Segurança de laboratório — aquecimento de vidrarias**\n\nNão aqueça vidraria comum fechada: a expansão e a formação de vapor podem elevar a pressão e provocar ruptura. Sistemas preparados para trabalhar sob pressão exigem equipamento próprio e procedimento específico; isso não autoriza improvisar com frascos de bancada.\n\nBalões volumétricos são destinados à preparação de um volume nominal na temperatura de calibração, e não ao aquecimento direto. Aquecer altera o volume, pode comprometer a aferição e cria riscos térmicos e mecânicos.","sourceIds":["lab-practices","lab"],"priority":30,"targeted":true,"patterns":[new RegExp("aquec.*vidraria fechada"),new RegExp("vidraria fechada.*aquec"),new RegExp("aquece.*vidraria fechada"),new RegExp("balao volumetrico.*aquec\\w*")]},
{"id":"lab-acid-reviewed","response":"**Segurança de laboratório — diluição de ácidos**\n\nNa diluição aquosa usual, adiciona-se o ácido à água, nunca água ao ácido concentrado, porque a liberação de calor pode causar aquecimento localizado e projeções. Isso é uma orientação de segurança, não um protocolo completo para qualquer reagente.\n\nA operação exige procedimento aprovado, avaliação de compatibilidade, controle térmico e equipamentos de proteção definidos pela ficha de segurança e pela supervisão do laboratório. Sem essas condições, não improvise uma diluição.","sourceIds":["lab-practices"],"priority":30,"targeted":true,"patterns":[new RegExp("diluir.*acido concentrado"),new RegExp("diluicao.*acido concentrado")]},
{"id":"lab-bleach-reviewed","response":"**Segurança de laboratório — água sanitária e ácidos**\n\nNão misture água sanitária, que contém hipoclorito, com ácidos: a mistura pode liberar cloro gasoso tóxico. Não use essa combinação para limpar a bancada nem combine produtos de limpeza sem verificar sua compatibilidade.\n\nSiga o rótulo e a ficha com dados de segurança. A explicação química dessa incompatibilidade não é uma orientação para produzir ou testar o gás.","sourceIds":["bleach-compatibility","lab-practices"],"priority":30,"targeted":true,"patterns":[new RegExp("agua sanitaria.*acido"),new RegExp("acido.*agua sanitaria"),new RegExp("hipoclorito.*acido")]},
{"id":"atom-ion-reviewed","response":"**Átomos, íons e isótopos**\n\nO número atômico Z é a quantidade de prótons. Perder ou ganhar elétrons não muda Z: um átomo de sódio que perde um elétron continua sendo do elemento sódio e forma Na⁺.\n\nCátion tem carga positiva por deficiência de elétrons em relação aos prótons; ânion tem carga negativa por excesso de elétrons. Para uma espécie monoatômica com carga algébrica q em unidades elementares, o número de elétrons é Z − q.\n\nIsótopos têm o mesmo Z e diferentes números de nêutrons. Trocar elétrons não transforma um elemento em outro nem cria, por si, outro isótopo.","sourceIds":["atomic-structure"],"priority":30,"targeted":true,"patterns":[new RegExp("atomo.*perde.*eletron.*numero atomico"),new RegExp("cation e anion"),new RegExp("anion e cation"),new RegExp("isotopos.*protons")]},
{"id":"balance-indices-reviewed","response":"**Coeficientes e índices no balanceamento**\n\nBalancear uma equação ajusta quantas unidades de cada espécie participam, preservando o número de átomos de cada elemento e a carga total. Mude os coeficientes, não os índices das fórmulas: trocar H₂O por H₂O₂ muda a substância.\n\nPara a formação de água a partir de H₂ e O₂, a equação é 2 H₂ + O₂ → 2 H₂O. Há quatro átomos de H e dois de O em cada lado. Coeficientes de uma equação global não são automaticamente os expoentes de uma lei de velocidade.","sourceIds":["balance","stoichiometry"],"priority":30,"targeted":true,"patterns":[new RegExp("coeficientes.*indices.*balance\\w*"),new RegExp("balance\\w*.*coeficientes.*indices")]},
{"id":"organic-functions-reviewed","response":"**Álcool, fenol, ácido carboxílico e éster**\n\nEm um álcool, a hidroxila está ligada a um carbono saturado; no fenol, está diretamente ligada a um anel aromático. Ter um grupo O–H não torna todas essas espécies a mesma função.\n\nO ácido carboxílico apresenta −C(=O)−OH; o éster carboxílico usual apresenta −C(=O)−O−R, com R orgânico. Eles compartilham uma parte estrutural, mas são funções diferentes e não possuem necessariamente as mesmas propriedades.","sourceIds":["functional"],"priority":30,"targeted":true,"patterns":[new RegExp("alcool e fenol"),new RegExp("fenol e alcool"),new RegExp("acido carboxilico e ester"),new RegExp("ester e acido carboxilico")]},
{"id":"reagent-ingestion-reviewed","response":"**Segurança de laboratório — metanol e etanol**\n\nMetanol e etanol são substâncias diferentes e não são intercambiáveis. O metanol é tóxico; etanol de laboratório também não deve ser consumido, pois pode conter desnaturantes ou contaminantes e não é um produto destinado à ingestão.\n\nNão prove reagentes para distinguir álcoois. Semelhança de nome, função orgânica ou aparência não demonstra segurança de consumo.","sourceIds":["lab-practices"],"priority":30,"targeted":true,"patterns":[new RegExp("metanol.*etanol.*(?:consumo|segur)"),new RegExp("etanol.*metanol.*(?:consumo|segur)")]}];

const REPLY_EDITIONS = {"titration-endpoint":{"simple":"**Titulação, em termos simples**\n\nO ponto de equivalência é o momento em que titulante e analito reagiram na proporção prevista pela equação química. O ponto final é o sinal que você observa para parar, por exemplo a mudança de cor do indicador.\n\nEsses momentos podem ser próximos, mas não são necessariamente iguais. Por isso, escolher bem o indicador ajuda a reduzir o erro da titulação. O pH na equivalência não é sempre 7.","academic":"**Ponto de equivalência e detecção do ponto final**\n\nO ponto de equivalência é definido pela relação estequiométrica entre as quantidades de titulante e analito na reação considerada. O ponto final corresponde ao critério experimental de detecção, que pode envolver uma mudança de cor ou um sinal instrumental.\n\nA discrepância entre a detecção e a equivalência contribui para o erro de titulação. A seleção do indicador ou do método instrumental deve considerar a reação e as condições experimentais; o pH de equivalência não é necessariamente 7.","summary":["O ponto de equivalência corresponde à proporção estequiométrica entre titulante e analito na reação.","O ponto final é o sinal experimental adotado para encerrar a titulação e pode ocorrer antes ou depois da equivalência.","A escolha do indicador ou do método de detecção deve reduzir essa diferença; o pH na equivalência não é necessariamente 7."]},"knowledge-27":{"simple":"**Célula, rede e estrutura, em termos simples**\n\nImagine um padrão de pontos que se repete: essa é a rede de Bravais. Ao colocar o mesmo conjunto de átomos, íons ou moléculas em cada ponto, obtemos a estrutura cristalina.\n\nA célula unitária é uma região que se repete por translações para formar essa estrutura periódica. Ela não precisa ser a menor possível: uma célula primitiva tem volume mínimo para a rede e contém um ponto de rede na contagem compartilhada.","summary":["A rede de Bravais é um conjunto periódico de pontos equivalentes, e a estrutura cristalina combina essa rede com um motivo de átomos, íons ou moléculas.","A célula unitária reproduz a periodicidade por translações e não é necessariamente a menor possível.","A célula primitiva tem volume mínimo para a rede e contém um ponto de rede na contagem compartilhada."]},"enthalpy-entropy":{"simple":"**Entalpia e entropia, em termos simples**\n\nEntalpia e entropia descrevem aspectos diferentes do estado de um sistema. A variação de entalpia corresponde ao calor trocado quando o sistema é fechado, a pressão é constante e só há trabalho de expansão ou compressão.\n\nA entropia se relaciona às possibilidades microscópicas compatíveis com o estado do sistema; chamá-la apenas de “desordem” é uma simplificação limitada. O sinal da variação de entalpia, sozinho, não diz se uma transformação é espontânea.","summary":["A entalpia é definida por H = U + pV, e ΔH = qₚ apenas em sistema fechado, sob pressão constante e com somente trabalho de expansão/compressão.","A entropia se relaciona às possibilidades microscópicas do sistema e não é definida simplesmente como “desordem”.","Entalpia e entropia são grandezas distintas, e o sinal de ΔH, sozinho, não determina a espontaneidade."]},"mass-number":{"simple":"**Número de massa e massa atômica, em termos simples**\n\nO número de massa conta quantos prótons e nêutrons há no núcleo: A = Z + N. Essa contagem é um número inteiro e não tem unidade de massa.\n\nA massa atômica é a massa de um átomo, geralmente expressa em u, e não precisa ser inteira nessa unidade. Em uma amostra com vários isótopos, a média depende das massas e das abundâncias de cada isótopo; ela não é o número de massa de um átomo.","summary":["O número de massa, A = Z + N, é a contagem inteira de prótons e nêutrons do núcleo, sem unidade de massa.","A massa atômica é a massa de um átomo, geralmente expressa em u, e não precisa ser inteira nessa unidade.","A média de uma amostra depende da composição isotópica, enquanto a massa atômica relativa é adimensional; esses valores não são o número de massa de um isótopo."]},"bond-polarity":{"simple":"**Ligações polares e moléculas polares**\n\nUma ligação polar não garante que a molécula seja polar. Também precisamos considerar a forma da molécula e se as contribuições das ligações se cancelam.\n\nNo CO₂ isolado, a forma linear permite esse cancelamento: ele é apolar. Na H₂O, a forma angular impede o cancelamento completo: ela é polar.","summary":["Ter ligações polares não garante que uma molécula seja polar, pois a geometria afeta a soma das contribuições dipolares.","O CO₂ isolado é linear e apolar porque as contribuições C=O se cancelam.","A H₂O é angular e polar porque as contribuições O–H não se cancelam."],"example":"**Exemplo — CO₂ e H₂O**\n\nAs duas espécies têm ligações polares. No CO₂ linear, as contribuições se cancelam; na H₂O angular, não. Por isso, a molécula isolada de CO₂ é apolar e a de H₂O é polar."},"electrostatic-map":{"simple":"**Mapa de potencial eletrostático, em termos simples**\n\nAs cores mostram o potencial eletrostático nas posições ao redor da molécula. Esse potencial corresponde à energia potencial por unidade de carga de prova positiva; não é a própria densidade eletrônica.\n\nÉ uma grandeza escalar, sem direção. Consulte a escala e a legenda para interpretar as cores, porque elas não têm significado universal.","summary":["O mapa representa o potencial eletrostático ao redor da molécula, que corresponde à energia potencial por unidade de carga de prova positiva.","O potencial é escalar e não é a própria densidade eletrônica, mesmo quando as cores são desenhadas em uma superfície dessa densidade.","A legenda e a escala definem o significado das cores; o mapa não substitui a análise da geometria e do dipolo molecular."]},"pipette-types":{"simple":"**As duas pipetas, em termos simples**\n\nA pipeta volumétrica usual transfere um volume nominal fixo, definido por uma marca. A graduada tem uma escala para transferir volumes diferentes dentro de sua faixa.\n\nEm condições comparáveis, a volumétrica geralmente tem tolerância menor, mas confira a classe e as especificações de cada peça. Menisco, temperatura, escoamento e técnica também afetam a medição; nenhuma pipeta fornece volume matematicamente exato.","summary":["A pipeta volumétrica usual transfere um volume nominal fixo, enquanto a graduada permite volumes diferentes por meio da escala.","Em condições comparáveis de capacidade e classe, a volumétrica geralmente apresenta tolerância menor, mas a comparação depende das especificações de cada peça.","Temperatura, menisco, escoamento e técnica de uso afetam a medição, e nenhuma das duas fornece volume matematicamente exato."]},"quantum-numbers-reviewed":{"simple":"**Números quânticos, em termos simples**\n\nEles ajudam a identificar o estado de um elétron no modelo atômico. n indica o nível principal; l identifica o subnível; mₗ distingue orbitais desse subnível; mₛ indica uma das duas projeções de spin.\n\nNão vale qualquer combinação: l vai de 0 a n−1. Por isso, 2d não é permitido. Cada orbital comporta no máximo dois elétrons com spins opostos.","example":"**Exemplo — subnível 3p**\n\nPara 3p, n=3 e l=1. Os valores mₗ = −1, 0 e +1 identificam três orbitais. Cada um pode conter no máximo dois elétrons com spins opostos; o subnível p comporta seis elétrons.\n\nA contagem vem dos valores permitidos dos números quânticos, não de três trajetórias circulares.","summary":["No modelo atômico usual, n, l e mₗ caracterizam os orbitais, enquanto mₛ indica a projeção de spin do elétron.","Os valores permitidos obedecem a l=0,1,…,n−1 e mₗ=−l,…,+l; por isso, o orbital 2d não é permitido.","Cada orbital comporta no máximo dois elétrons com spins opostos, e um subnível possui 2l+1 orbitais."]},"electronic-occupation-reviewed":{"simple":"**Pauli e Hund, em termos simples**\n\nPauli limita cada orbital a dois elétrons com spins opostos. Hund orienta a ocupação de orbitais de mesma energia no estado fundamental: eles recebem elétrons separados, com spins paralelos, antes do emparelhamento.\n\nA ordem de preenchimento por energia é uma aproximação útil. Íons e alguns elementos exigem atenção às exceções.","example":"**Exemplo — dois elétrons em um subnível p**\n\nNo estado fundamental e na aproximação de orbitais degenerados, dois elétrons ocupam orbitais p diferentes, com spins paralelos. Isso ilustra Hund.\n\nSe dois elétrons ocuparem o mesmo orbital, precisam ter spins opostos: essa restrição corresponde a Pauli. Não confunda ocupar orbitais diferentes com violar o limite de dois elétrons por orbital.","summary":["Pauli impede que dois elétrons de um átomo tenham os quatro números quânticos iguais e limita cada orbital a dois elétrons com spins opostos.","Hund orienta a ocupação separada, com spins paralelos, de orbitais degenerados antes do emparelhamento no estado fundamental.","Aufbau organiza a ocupação por energia, mas o diagrama usual de preenchimento tem exceções e não é universal para todos os átomos e íons."]},"knowledge-26":{"example":"**Exemplo — água e dióxido de carbono**\n\nCO₂ é linear: as contribuições equivalentes das ligações C=O se cancelam, e a molécula isolada é apolar. H₂O é angular: as contribuições O–H não se cancelam, e a molécula é polar.\n\nAssim, ter ligações polares não basta; a geometria afeta a soma das contribuições dipolares."},"cell-formula-reviewed":{"simple":"**Contando espécies na célula**\n\nConte A e B separadamente. Um ocupante no vértice conta 1/8; na aresta, 1/4; na face, 1/2; no interior, 1.\n\nSe A ocupa os oito vértices e B ocupa as seis faces, a célula soma um A e três B: AB₃. A esfera desenhada não é um átomo dividido fisicamente; a fração representa o compartilhamento da posição entre células.","example":"**Exemplo — AB₃**\n\nA nos oito vértices: 8×1/8 = 1. B nas seis faces: 6×1/2 = 3. A razão é A:B = 1:3, portanto AB₃.\n\nSe B estivesse somente no centro do corpo, sua contribuição seria 1 e a fórmula seria AB. A ocupação especificada muda a contagem.","summary":["A fórmula depende da contagem de cada espécie, considerando o compartilhamento das posições da célula.","No modelo cúbico, cada ocupante no vértice contribui com 1/8; na aresta, 1/4; na face, 1/2; no interior, 1.","A nos oito vértices e B nas seis faces dão AB₃, enquanto B apenas no centro do corpo leva a AB nessa ocupação."]},"interstitial-counts-reviewed":{"example":"**Exemplo — ocupação na blenda ZnS**\n\nUma célula CFC convencional da sub-rede de sulfeto contém quatro S e oferece oito sítios tetraédricos. Na blenda, quatro desses sítios são ocupados por Zn: quatro Zn para quatro S, dando ZnS.\n\nA existência de oito sítios não obriga a presença de oito Zn; ocupação e quantidade de sítios são informações diferentes.","summary":["Uma célula CFC convencional contém quatro átomos efetivos do empacotamento, oito sítios tetraédricos e quatro octaédricos.","Na blenda ZnS, metade dos sítios tetraédricos é ocupada; no modelo de NaCl, todos os sítios octaédricos são ocupados.","A existência de um sítio não implica ocupação, e número de sítios não é o mesmo que coordenação."]},"gem-origin-reviewed":{"simple":"**Sintética e imitação, em termos simples**\n\nUma gema sintética foi produzida pelo ser humano e corresponde essencialmente ao mesmo material da gema natural. Uma imitação procura parecer outra gema e pode ter composição e estrutura diferentes.\n\nAparência, origem e tratamento são perguntas diferentes; a cor sozinha não resolve todas elas.","example":"**Exemplo — diamante**\n\nUm diamante natural e um diamante sintético correspondem ao material diamante, embora tenham origens diferentes. Um objeto de vidro que apenas imita sua aparência é outro material.\n\nParecer igual em uma fotografia não demonstra composição, estrutura nem origem.","summary":["Uma gema sintética tem essencialmente a composição e a estrutura de sua correspondente natural, mas é produzida pelo ser humano.","Uma imitação apenas se parece com outra gema e pode ser um material diferente.","Origem, identificação e tratamento são questões distintas, e a cor sozinha não determina todas elas."]},"boiling-pressure-reviewed":{"simple":"**Por que a água não ferve sempre a 100 °C?**\n\nEla ferve quando a pressão de seu vapor alcança a pressão externa. Se a pressão externa diminui, a temperatura necessária para ferver também diminui. O valor próximo de 100 °C vale para água pura sob 1 atm.\n\nA água também evapora abaixo dessa temperatura. Suas moléculas continuam sendo H₂O; ferver não é separar hidrogênio e oxigênio.","example":"**Exemplo — nível do mar e montanha**\n\nCompare água pura em dois recipientes abertos, um perto do nível do mar e outro em uma montanha. Com pressão externa menor na montanha, a água entra em ebulição a uma temperatura menor.\n\nEsse exemplo mantém a substância e muda a pressão; por isso, não se pode usar 100 °C como regra independente das condições.","summary":["A água ferve quando sua pressão de vapor alcança a pressão externa; o valor próximo de 100 °C se refere à água pura sob 1 atm.","Diminuir a pressão externa reduz a temperatura de ebulição, e evaporação pode ocorrer abaixo dela.","A vaporização da água não consiste, em geral, em romper ligações O–H para formar hidrogênio e oxigênio."]},"equilibrium":{"simple":"**Equilíbrio químico, em termos simples**\n\nAs reações nos dois sentidos continuam. No equilíbrio, suas velocidades são iguais e as concentrações ficam constantes nas condições mantidas, mas não precisam ser iguais.\n\nQ descreve a composição atual. Comparado com K para a mesma reação e temperatura, Q menor que K indica tendência no sentido direto; Q maior que K, no inverso.","example":"**Exemplo — Q e K**\n\nSe Q < K para a reação escrita e na mesma temperatura de referência, o sistema tende a evoluir no sentido direto. Conforme a composição muda, Q se aproxima de K.\n\nQuando Q = K, as reações não param: as velocidades direta e inversa são iguais. Não é necessário que todas as concentrações tenham o mesmo valor."},"acid-strength-reviewed":{"simple":"**Força e concentração são diferentes**\n\nUm ácido forte pode estar muito diluído. Um ácido fraco pode estar concentrado. Força diz respeito ao equilíbrio de ionização; concentração diz quanto soluto há em uma quantidade de solução.\n\npH descreve a solução. pKa caracteriza um equilíbrio ácido-base nas condições indicadas; eles não são o mesmo número.","example":"**Exemplo — ácido forte diluído**\n\nDuas soluções do mesmo ácido forte podem ter concentrações diferentes. A classificação como forte não informa, sozinha, quanto ácido há por volume nem qual é o pH de cada solução.\n\nPara comparar pH, é necessário conhecer concentração, condições e aproximações adequadas. Isso ilustra por que força ácida não substitui o dado de concentração.","summary":["Força ácida envolve equilíbrio de ionização nas condições especificadas, enquanto concentração expressa quanto soluto há por uma unidade definida.","Um ácido forte pode estar diluído, e um ácido fraco pode estar concentrado.","O pH descreve a atividade de H⁺ na solução, enquanto pKa caracteriza o equilíbrio ácido-base e depende das condições da comparação."]},"orbital-phase-reviewed":{"summary":["As cores dos lobos de um orbital frequentemente indicam sinais ou fases de ψ, não cargas positiva e negativa.","Uma superfície que envolve uma fração escolhida da probabilidade não é uma parede, e uma isosuperfície de densidade não define automaticamente essa fração.","Densidade constante em um estado estacionário não significa elétron parado nem trajetória clássica."]},"oxygen-magnetism-reviewed":{"summary":["O O₂ no estado fundamental possui dois elétrons desemparelhados em orbitais π* e é paramagnético.","Sua ordem de ligação é 2, enquanto a do N₂ é 3; o N₂ no estado fundamental é diamagnético.","Ordem de ligação ajuda nessa comparação, mas não constitui uma escala universal para quaisquer ligações de elementos diferentes."]},"molecular-ions-reviewed":{"summary":["NH₄⁺ é tetraédrico ideal, e NO₃⁻ é trigonal plano, com deslocalização eletrônica representada por ressonância.","Ambos têm carga líquida, e o momento dipolar de um sistema carregado depende da origem escolhida.","A simetria não transforma esses íons em moléculas neutras apolares."]},"coordination-count-reviewed":{"summary":["NOX é uma atribuição formal e não é o número de coordenação.","Coordenação conta os átomos doadores diretamente ligados ao centro metálico, incluindo os fornecidos por ligantes multidentados.","Em [Co(NH₃)₆]Cl₃, o cobalto tem NOX +3 e coordenação 6, pois NH₃ é neutro e os três Cl⁻ externos compensam a carga do complexo."]}};

const MOLECULAR_PROFILES = {
  "h2o": [
    "H₂O — água",
    "O",
    "AX₂E₂",
    "tetraédrico",
    "angular",
    "polar",
    "O ângulo H–O–H da molécula isolada é próximo de 104,5°. No modelo VSEPR, as interações envolvendo os dois pares não ligantes ajudam a explicar um ângulo menor que o tetraédrico ideal de 109,5°. A contagem de domínios não calcula sozinha o valor observado, e pares não ligantes não são núcleos na geometria molecular."
  ],
  "co2": [
    "CO₂ — dióxido de carbono",
    "C",
    "AX₂",
    "linear",
    "linear",
    "apolar",
    "Cada ligação dupla conta como um domínio eletrônico. As contribuições equivalentes C=O se cancelam por simetria na molécula linear."
  ],
  "nh3": [
    "NH₃ — amônia",
    "N",
    "AX₃E",
    "tetraédrico",
    "trigonal piramidal",
    "polar",
    "O par não ligante ocupa uma região eletrônica. Os três dipolos N–H não se cancelam na geometria piramidal."
  ],
  "ch4": [
    "CH₄ — metano",
    "C",
    "AX₄",
    "tetraédrico",
    "tetraédrica",
    "apolar",
    "Os quatro ligantes H equivalentes estão distribuídos tetraedricamente. No modelo ideal, os ângulos são aproximadamente 109,5°."
  ],
  "bf3": [
    "BF₃ — trifluoreto de boro",
    "B",
    "AX₃",
    "trigonal plano",
    "trigonal plana",
    "apolar",
    "As três contribuições B–F equivalentes se cancelam no plano. Na estrutura simples de Lewis, o boro tem octeto incompleto."
  ],
  "so2": [
    "SO₂ — dióxido de enxofre",
    "S",
    "AX₂E",
    "trigonal plano",
    "angular",
    "polar",
    "Duas regiões ligantes e um par não ligante definem três domínios eletrônicos. A forma angular impede o cancelamento das contribuições de ligação."
  ],
  "so3": [
    "SO₃ — trióxido de enxofre",
    "S",
    "AX₃",
    "trigonal plano",
    "trigonal plana",
    "apolar",
    "Esta descrição refere-se à espécie molecular monomérica isolada. Fases condensadas podem apresentar outras organizações."
  ],
  "ccl4": [
    "CCl₄ — tetracloreto de carbono",
    "C",
    "AX₄",
    "tetraédrico",
    "tetraédrica",
    "apolar",
    "As ligações C–Cl são polares, mas suas contribuições equivalentes se cancelam por simetria tetraédrica."
  ],
  "pcl5": [
    "PCl₅ — pentacloreto de fósforo",
    "P",
    "AX₅",
    "bipiramidal trigonal",
    "bipiramidal trigonal",
    "apolar",
    "Esta é a descrição molecular na fase gasosa. No sólido, PCl₅ pode apresentar constituição iônica; não extrapole a geometria da molécula isolada para toda fase."
  ],
  "sf6": [
    "SF₆ — hexafluoreto de enxofre",
    "S",
    "AX₆",
    "octaédrico",
    "octaédrica",
    "apolar",
    "Os seis ligantes equivalentes dispõem-se em pares opostos. Os ângulos ideais são 90° e 180°."
  ],
  "sf4": [
    "SF₄ — tetrafluoreto de enxofre",
    "S",
    "AX₄E",
    "bipiramidal trigonal",
    "gangorra",
    "polar",
    "No VSEPR, o par não ligante ocupa uma posição equatorial, reduzindo o número de interações a 90° em comparação com a posição axial."
  ],
  "clf3": [
    "ClF₃ — trifluoreto de cloro",
    "Cl",
    "AX₃E₂",
    "bipiramidal trigonal",
    "em T",
    "polar",
    "Os dois pares não ligantes ocupam posições equatoriais no modelo qualitativo. Os três átomos de flúor formam um T."
  ],
  "xef2": [
    "XeF₂ — difluoreto de xenônio",
    "Xe",
    "AX₂E₃",
    "bipiramidal trigonal",
    "linear",
    "apolar",
    "Os três pares não ligantes ocupam posições equatoriais. Os dois ligantes equivalentes ficam em posições axiais opostas."
  ],
  "brf5": [
    "BrF₅ — pentafluoreto de bromo",
    "Br",
    "AX₅E",
    "octaédrico",
    "piramidal quadrada",
    "polar",
    "Um dos seis domínios é um par não ligante; os cinco ligantes formam uma pirâmide de base quadrada."
  ],
  "xef4": [
    "XeF₄ — tetrafluoreto de xenônio",
    "Xe",
    "AX₄E₂",
    "octaédrico",
    "quadrada plana",
    "apolar",
    "Os dois pares não ligantes ocupam posições opostas e os quatro ligantes equivalentes formam um quadrado. Este é um exemplo estabelecido; não o substitua por KrF₄."
  ],
  "h2s": [
    "H₂S — sulfeto de hidrogênio",
    "S",
    "AX₂E₂",
    "tetraédrico",
    "angular",
    "polar",
    "A molécula isolada é angular e possui momento dipolar permanente. A contagem de domínios do VSEPR não obriga o ângulo real a ser igual ao da água."
  ]
};

function resolveMolecularProfile(text){
 let normalized=normalize(text);
 const names={agua:'h2o',amonia:'nh3',metano:'ch4','dioxido de carbono':'co2'};
 for(const[name,key]of Object.entries(names))normalized=normalized.replace(new RegExp('\\b'+name+'\\b','g'),key);
 const tokens=normalized.split(' ');
 const keys=[...new Set(tokens.filter(key=>MOLECULAR_PROFILES[key]))];
 if(!keys.length||/\b(?:reacao|combustao|estequiometria|massa|molar|calcule|calcular|gramas|mol|titulacao|nox|oxidacao|carga formal|centro de cor|hibridizacao|sp|sp2|sigma|pi)\b/.test(normalized))return '';
 const allowed=tokens.every(t=>MOLECULAR_PROFILES[t]||/^(?:o|a|e|de|da|do|em|os|as|que|qual|sao|eh|geometria|molecular|eletronica|arranjo|polaridade|polar|apolar|explique|explica|me|fale|sobre|molecula|compare|comparar|diferenca|entre|por|favor|porque|por que)$/.test(t));
 const geometry=/\b(?:geometria|polaridade|polar|apolar|arranjo|angulo)\b/.test(normalized);
 if(!allowed&&!geometry&&keys.length===1&&!Object.values(names).includes(normalized))return '';
 if(keys.length>1&&!allowed&&!/\b(?:compare|diferenca|entre|polaridade|geometria|polar|apolar)\b/.test(normalized))return '';
 return keys.map(key=>{const[p,central,ax,electronic,shape,polarity,note]=MOLECULAR_PROFILES[key];return '**'+p+'**\n\n- **Átomo central:** '+central+'.\n- **Modelo VSEPR:** '+ax+'.\n- **Arranjo eletrônico:** '+electronic+'.\n- **Geometria molecular:** '+shape+'.\n- **Polaridade da molécula isolada:** '+polarity+'.\n\n'+note;}).join('\n\n---\n\n');
}

function questionSubject(text) {
 return normalize(text).replace(/\b(?:faca|faz|manda|mande|mandar|passa|passe|envia|envie|enviar|quero|queria|gostaria|preciso|gera|gere|gerar|cria|crie|criar|monte|monta|elabore|traga|solta|me de|me|uma?|duas?|dois|tres|quatro|cinco|seis|sete|oito|nove|dez|questao|questoes|exercicio|exercicios|pergunta|perguntas|quiz|simulados?|teste|guiadas?|guiados?|sobre|de|do|da|dos|das|com|resolucao|dicas?|por favor)\b/g,' ').replace(/\b\d+\b/g,' ').replace(/passo a passo/g,' ').replace(/\s+/g,' ').trim();
}
function rankedKnowledgeRules(text) {
 const t=normalize(text);if(!t)return [];
 return rules.map((rule,index)=>{
 let score=0,span='';
 for(const pattern of rule.patterns){
 const re=new RegExp('(?:^|\\b)(?:'+pattern.source+')(?:\\b|$)',pattern.flags.replace(/[gy]/g,''));
 const match=t.match(re);if(match){const value=match[0].trim();const weight=value.length+value.split(' ').length*2;if(weight>score){score=weight;span=value;}}
 }
 if(score>0)score+=rule.priority||0;
 return {rule,score,span,index};
 }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score||b.index-a.index);
}
function findBestKnowledgeRule(text){return rankedKnowledgeRules(text)[0]?.rule||null;}
function resolveComparisonIntent(text){
 const t=normalize(text);if(!/\b(?:compare|comparar|diferenca|diferencas|versus|vs)\b/.test(t))return '';
 if(/\bpipetas?\b/.test(t)&&/\bvolumetricas?\b/.test(t)&&/\bgraduadas?\b/.test(t))return rules.find(r=>r.id==='pipette-types').response;
 const ranked=rankedKnowledgeRules(t);if(ranked[0]?.rule.id==='nox-vs-formal')return ranked[0].rule.response;
 if(['enthalpy-entropy','cubic-centering','titration-endpoint','mass-number'].includes(ranked[0]?.rule.id))return ranked[0].rule.response;
 const chosen=[];
 for(const candidate of ranked){if(candidate.rule.id==='knowledge-09')continue;if(chosen.some(c=>c.span.includes(candidate.span)||candidate.span.includes(c.span)))continue;chosen.push(candidate);if(chosen.length===2)break;}
 return chosen.length===2?chosen.map(c=>c.rule.response).join('\n\n---\n\n'):'';
}
function getSourcesForReply(text){
 const value=String(text||'');const ids=new Set();
 if(value.includes('**Modelo VSEPR:**'))ids.add('vsepr');
 rules.forEach(rule=>{if(value.includes(rule.response))for(const id of rule.sourceIds||[])ids.add(id);});
 quizQuestions.forEach(q=>{if(value.includes(q.q))for(const id of q.sourceIds||[])ids.add(id);});
 if(Object.values(elements).some(reply=>value.includes(reply))){ids.add('atomic-weights');ids.add('periodic');if(/plutonio|americio|uranio|radio|polonio/.test(normalize(value)))ids.add('radioisotopes');}
 if(LABORATORY_ITEMS.some(item=>value.startsWith('**'+item.name+'**'))||/Proveta, pipetas, bureta e balão volumétrico|Vidrarias e equipamentos de laboratório/.test(value)){ids.add('lab');ids.add('lab-safety');}
 return [...ids];
}

function getReplyEdition(baseText, mode, sentenceCount = 3) {
 const base=String(baseText||'').trim();
 const original=rules.find(rule=>base.includes(rule.response)) || (base.includes('**Modelo VSEPR:**')?rules.find(rule=>rule.id==='knowledge-26'):null);
 const edition=REPLY_EDITIONS[original?.id];
 if(mode==='summary'){
   const sentences=edition?.summary || splitReplySentences(base);
   if(!sentences.length)return base;
   const count=Math.max(1,Math.min(8,sentenceCount));
   if(edition?.summary && count<sentences.length){
     const groups=Array.from({length:count},()=>[]);
     sentences.forEach((sentence,index)=>groups[Math.min(count-1,Math.floor(index*count/sentences.length))].push(sentence.replace(/[.!?]$/,'')));
     return groups.map(group=>group.join('; ')+'.').join(' ');
   }
   // Select whole sentences; do not cut conditions or append invented conclusions.
   const selected=sentences.length<=count?sentences:count===1?[sentences[0]]:Array.from({length:count},(_,i)=>sentences[Math.round(i*(sentences.length-1)/(count-1))]);
   return selected.join(' ');
 }
 if(mode==='simplify')return edition?.simple || base
   .replace(/refere-se/g,'diz respeito').replace(/denomina-se/g,'é chamado de')
   .replace(/satisfaz/g,'segue').replace(/constitui/g,'é');
 if(mode==='academic')return edition?.academic || base;
 if(mode==='verify')return '**Retomando a base para conferência**\n\n'+base+'\n\nSe a dúvida estiver em um trecho ou dado específico, indique qual para compararmos com as condições e as fontes.';
 if(mode==='example')return edition?.example || '**Exemplo adicional indisponível**\n\nAinda não tenho um exemplo adicional revisado para esse recorte. Posso retomar a explicação disponível ou analisar um enunciado específico com os dados e as condições informados.';
 if(mode==='deepen')return edition?.deepen || base;
 return base;
}
function splitReplySentences(text){
 const clean=String(text||'').replace(/^\s*(?:#{1,6}\s+.*|\*\*[^*\n]+\*\*)\s*$/gm,'').replace(/\*\*/g,'').replace(/\n+/g,' ').trim();
 return (clean.match(/[\s\S]+?(?:[.!?](?=\s|$)|$)/g)||[]).map(s=>s.trim()).filter(Boolean);
}

const TOPIC_MEMORY_KEY = "simoens:last-topic";
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

function rememberExplicitTopic(topic, target = '') {
    if (!topic) return;
    try {
        sessionStorage.setItem(TOPIC_MEMORY_KEY, JSON.stringify({ topic, target: target || topic, at: Date.now() }));
    } catch (error) {}
}
function hasQuestionIntent(text) {
    const t = normalize(text || '').replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!t) return false;
    if (/^(questao|questoes|exercicio|exercicios|pergunta|perguntas|quiz|simulado|simulados)$/.test(t)) return true;
    if (/^\d{1,2}\s+(questao|questoes|exercicio|exercicios|pergunta|perguntas|quiz|simulados?)\b/.test(t)) return true;
    if (/^(um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\s+(questao|questoes|exercicio|exercicios|pergunta|perguntas)\b/.test(t)) return true;
    if (/^(questao|questoes|exercicio|exercicios|pergunta|perguntas)\s+(?:sobre|de)\b/.test(t)) return true;
    if (/(questao guiada|questoes guiadas|exercicio guiado|exercicios guiados|pergunta guiada|perguntas guiadas|passo a passo)/.test(t)) return true;
    const action = /\b(faca|faz|manda|mande|mandar|passa|passe|passar|envia|envie|enviar|quero|queria|gostaria|preciso|gera|gere|gerar|cria|crie|criar|monte|monta|elabore|traga|solta|me de|me teste|testar)\b/.test(t);
    const object = /\b(questao|questoes|exercicio|exercicios|pergunta|perguntas|quiz|simulado|simulados|teste)\b/.test(t);
    return action && object;
}
function isGuidedQuestionIntent(text) {
    const t = normalize(text || '');
    return /\b(guiada|guiado|guiadas|guiados|passo a passo|dica|dicas|resolucao guiada|resolução guiada)\b/.test(t);
}
function extractRequestedQuestionCount(text) {
    const t = normalize(text || '').replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
    const words = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10 };
    const direct = t.match(/\b(\d{1,2}|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\s+(?:questao|questoes|exercicio|exercicios|pergunta|perguntas|quiz|simulados?)\b/);
    const indirect = t.match(/\b(?:questao|questoes|exercicio|exercicios|pergunta|perguntas|quiz|simulados?)\s+(?:com|de)?\s*(\d{1,2}|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\b/);
    const raw = (direct && direct[1]) || (indirect && indirect[1]) || '';
    if (!raw) return 1;
    const parsed = words[raw] || Number(raw);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.max(1, Math.min(10, parsed));
}
function getQuestionTopicFromInput(text) {
 const topic=classifyGeneralTopic(text);if(topic) return topic;
 const subject=questionSubject(text);
 return subject ? '' : recallTopicContext()?.topic || '';
}
function getQuestionsForTopic(topic, source = quizQuestions) {
    if (!topic) return source;
    if (topic === 'reacoes') return source.filter(q => q.topic === 'reacoes' || q.topic === 'estequiometria');
    return source.filter(q => q.topic === topic);
}
function isGeneratedPlaceholderQuestion(question) {
    return /Questão Avançada \(Desafio \d+/.test(question && question.q ? question.q : '');
}
function pickQuestions(questionPool,count) {
 const shuffled=(Array.isArray(questionPool)?questionPool:[]).filter(q=>q&&!isGeneratedPlaceholderQuestion(q));
 for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 return shuffled.slice(0,Math.max(1,Math.min(count,shuffled.length)));
}
function formatQuestionResponse(selectedQuestions, requestedCount, topic = '') {
    if (!selectedQuestions || selectedQuestions.length === 0) return '';
    if (selectedQuestions.length === 1 && requestedCount <= 1) return selectedQuestions[0].q;
    const topicLabel = topic ? ` sobre **${suggestionsMap[topic] ? suggestionsMap[topic][0] : topic}**` : '';
    const intro = selectedQuestions.length < requestedCount
        ? `Tenho ${selectedQuestions.length} exercício(s) pronto(s)${topicLabel} agora:`
        : `Aqui vão ${selectedQuestions.length} exercício(s)${topicLabel}:`;
    return `${intro}\n\n${selectedQuestions.map((item, index) => `**${index + 1}.** ${item.q}`).join('\n\n---\n\n')}`;
}
function extractExplanationTarget(text) {
    const trimmed = text.trim();
    const onlyExplain = /^(explicacao|explica|explique|me explica|me explique|quero uma explicacao|quero explicacao)$/.test(trimmed);
    if (onlyExplain) return "";
    const match = trimmed.match(/^(?:me\s+)?(?:explica|explique|explicacao)(?:r)?(?:\s+(?:sobre|de))?\s+(.+)$/);
    return match ? match[1].trim() : null;
}
function getGeneralTopicExplanation(topic) {
 const ids={cristalografia:'knowledge-27',vsepr:'knowledge-25',ligacoes:'knowledge-42',modelos:'knowledge-36',reacoes:'knowledge-46',organica:'knowledge-48',fisicoquimica:'knowledge-52',complexos:'knowledge-41',quantica:'knowledge-56',gemas:'knowledge-10',nomenclatura:'knowledge-47'};
 if(topic==='laboratorio') return '**Vidrarias e equipamentos de laboratório**\n\nCada instrumento deve ser escolhido conforme a técnica, a compatibilidade química e térmica e a incerteza de medição necessária. Béqueres e erlenmeyers servem principalmente para preparo e reação; pipetas, buretas e balões volumétricos são calibrados para finalidades específicas.\n\nNenhuma medição é absolutamente exata. A tolerância, a temperatura de calibração, o menisco e a técnica de uso influenciam o resultado. Posso explicar um dos 54 itens do catálogo ou comparar instrumentos.';
 return rules.find(r=>r.id===ids[topic])?.response || '';
}
function resolveGemologySpecificIntent(text = '') {
 if(hasQuestionIntent(text)) return '';
 const rule=findBestKnowledgeRule(text);
 return rule && /^knowledge-(?:1\d|20)$/.test(rule.id) ? rule.response : '';
}

function resolveExplanationIntent(text) {
 const extracted=extractExplanationTarget(text);
 if(extracted===null || hasQuestionIntent(text)) return null;
 const remembered=recallTopicContext();
 const target=cleanTopicTarget(extracted || remembered?.target || '');
 if(!target) return '';
 const element=resolveElementInformation(target);
 if(element) return element;
 const comparison=resolveComparisonIntent(target);if(comparison) return comparison;
 const laboratory=resolveLaboratoryIntent(target);if(laboratory) return laboratory;
 const rule=findBestKnowledgeRule(target);if(rule) return rule.response;
 return '';
}


function labItemUrl() {
    const entry = SIMOENS_SITE_MAP.find((e) => e.id === 'laboratorio_interativo');
    return entry ? entryUrl(entry) : 'https://quimicavisualufv.github.io/Quimica-Visual/Ensino/Animacao/catalogo-de-vidrarias-animado/';
}
function labItemSearchText(item) {
    return normalize([item.name, item.group, item.function, item.animations, ...(item.aliases || [])].join(' '));
}
function findLaboratoryItemInText(text = '') {
 const t=normalize(text);let best=null,bestScore=0;
 for(const item of LABORATORY_ITEMS){for(const name of [item.name,...(item.aliases||[])].map(normalize)){
 if(name.length<3)continue;
 const escaped=name.replace(/[.*+?^$(){}|[\]\\]/g,'\\$&');
 if(new RegExp('(?:^| )'+escaped+'(?: |$)').test(t)){
 const score=name.length+(normalize(item.name)===name?30:10);if(score>bestScore){best=item;bestScore=score;}
 }
 }}return best;
}
function formatLaboratoryItemReply(item) {
 if(!item)return '';
 return '**'+item.name+'**\n\n- **Grupo:** '+item.group+'.\n- **Função:** '+item.function.replace(/\.$/,'')+'.\n- **No modelo interativo:** '+item.animations+'.\n\n**Cuidados e limites:** '+(item.note||'Selecione o material conforme a técnica, as instruções do fabricante e as medidas de segurança do laboratório.');
}
function listLaboratoryItemsReply() {
    const groups = new Map();
    LABORATORY_ITEMS.forEach((item) => {
        const arr = groups.get(item.group) || [];
        arr.push(item.name);
        groups.set(item.group, arr);
    });
    const lines = [
        `O **Laboratório Interativo — Vidrarias e Equipamentos de Laboratório** está no escopo do chat e possui ${LABORATORY_ITEMS.length} itens mapeados. Link: ${labItemUrl()}.`,
        ''
    ];
    groups.forEach((items, group) => {
        lines.push(`**${group}:** ${items.join('; ')}.`);
    });
    return lines.join('\n');
}
function compareVolumetricGlasswareReply() {
 return '**Proveta, pipetas, bureta e balão volumétrico**\n\n- **Proveta:** mede volumes com menor exigência de precisão; a adequação depende da tolerância do instrumento.\n- **Pipeta graduada:** transfere volumes definidos por duas leituras na escala.\n- **Pipeta volumétrica:** transfere um volume nominal fixo nas condições de calibração.\n- **Bureta:** permite adicionar volumes variáveis e determinar o volume fornecido pela diferença de leituras; é típica de titulações.\n- **Balão volumétrico:** contém um volume nominal até a marca, na temperatura de calibração; é usado para preparar soluções.\n\nA classe, a capacidade e a tolerância determinam a adequação de cada peça. Nenhum instrumento fornece volume absolutamente exato. Observe o menisco, a temperatura e a indicação de calibração para conter ou escoar.';
}
function resolveLaboratoryIntent(text = '') {
    const t = normalize(text);
    if (hasQuestionIntent(t)) return null;
    const candidateItem = findLaboratoryItemInText(t);
    if (!candidateItem && !/(laboratorio|laboratório|vidraria|vidrarias|equipamento|bequer|béquer|erlenmeyer|kitasato|kitassato|bureta|pipeta|proveta|balao|balão|funil|condensador|dessecador|bunsen|mufla|estufa|rotaevaporador|phmetro|pisseta|cadinho|buchner|büchner|capela|balanca|balança|centrifuga|centrífuga|suporte universal|vidro de relogio|vidro de relógio|espátula|espatula|bomba|vacuo|vácuo|pinca|pinça|filtro|frasco|vial|cristalizador|vigreux|allihn|drechsel|nessler|cuba cromatografica|peixinho|tripe|tripé|manta|chapa|mufla)/.test(t)) return null;
    if (/(diferenca|diferença|comparar|compare|qual a diferenca)/.test(t) && /(proveta|pipeta|bureta|balao volumetrico|balão volumétrico)/.test(t)) {
        if (/volumetrica/.test(t) && /graduada/.test(t)) return rules.find(r=>r.id==='pipette-types').response;
        return compareVolumetricGlasswareReply();
    }
    if (/(link|abrir|acessar|onde fica|url|pagina|página)/.test(t) && /(laboratorio|laboratório|vidraria|vidrarias|equipamento)/.test(t)) {
        return `O link do **Laboratório Interativo — Vidrarias e Equipamentos de Laboratório** é: ${labItemUrl()}. Ele reúne modelos 3D, funções, aplicações e animações de líquidos, gases, aquecimento, rotação e operação de bancada.`;
    }
    if (/(quais|liste|lista|mostrar|mostre|todas|todos|catalogo|catálogo|tem no|existem)/.test(t) && /(vidraria|vidrarias|equipamento|equipamentos|laboratorio|laboratório)/.test(t)) {
        return listLaboratoryItemsReply();
    }
    const item = candidateItem || findLaboratoryItemInText(t);
    if (item) return formatLaboratoryItemReply(item);
    if (/(laboratorio interativo|laboratório interativo|vidrarias e equipamentos|catalogo de vidrarias|catálogo de vidrarias)/.test(t)) {
        return `O **Laboratório Interativo — Vidrarias e Equipamentos de Laboratório** é uma animação do SiMoEns voltada ao reconhecimento formal de instrumentos de bancada. Ele apresenta modelos 3D, descrições funcionais e animações associadas a líquidos, gases, aquecimento, rotação, abertura e operação de equipamentos. Link: ${labItemUrl()}.`;
    }
    if(findBestKnowledgeRule(t)?.id!=='knowledge-09')return null;
    return 'Você mencionou **laboratório, vidrarias ou equipamentos**. Posso explicar a função de cada item do Laboratório Interativo, comparar instrumentos parecidos, indicar o link da animação ou gerar questões sobre técnicas de bancada.';
}

function resolveElementInformation(userInput = '') {
 const text=normalize(userInput);if(!text)return '';
 const aliases={...nameToSymbol};Object.keys(elements).forEach(symbol=>{aliases[symbol]=symbol;});
 const exactNames=Object.keys(aliases).filter(alias=>normalize(alias)===text);
 const explicit=/\b(?:elemento|simbolo quimico|numero atomico|massa atomica|tabela periodica)\b/.test(text);
 const direct=/^(?:(?:me )?fale|(?:me )?explique|quem e|o que e|informacoes sobre|tudo sobre)(?: sobre)?(?: o elemento)?\s+/.test(text);
 if(!exactNames.length&&!explicit&&!direct)return '';
 const symbol=window.SiMoEnsSearchCore?.resolveAlias?.(text,aliases,{explicit:explicit||direct,allowFuzzy:explicit})||null;
 if(!symbol)return '';
 if(elements[symbol])return elements[symbol];
 return 'Reconheci o elemento solicitado, mas ainda não tenho uma ficha local revisada para ele. Consulte uma tabela periódica de referência ou peça outro elemento cadastrado.';
}

function getBotResponse(userInput) {
 const normalizedInput=normalize(userInput);
 if(!normalizedInput)return 'Informe o assunto de Química que você quer estudar.';
 if(/^(?:instrucoes|instrucao|ajuda|help|como usar|o que voce faz|o que voce pode fazer)$/.test(normalizedInput))return GENERIC_HELP_REPLY;
 if(/^(?:oi|ola|bom dia|boa tarde|boa noite|opa|e ai|saudacoes)$/.test(normalizedInput))return 'Olá! Sou o Assistente do SiMoEns. Posso explicar Química, acompanhar o assunto da conversa e encontrar recursos do catálogo. Em que posso ajudar?';
 if(/^(?:obrigado|obrigada|valeu|agradeco|perfeito|entendi|show)$/.test(normalizedInput))return 'Por nada! Posso aprofundar o assunto, dar um exemplo ou indicar um recurso do SiMoEns para estudar ou praticar.';
 if(/^(?:tudo bem|como vai|como voce esta|tudo certo)$/.test(normalizedInput))return 'Tudo bem por aqui e pronto para ajudar. Qual conceito ou recurso de Química você quer explorar?';
 if(hasQuestionIntent(normalizedInput)){
 const requestedCount=extractRequestedQuestionCount(normalizedInput),guided=isGuidedQuestionIntent(normalizedInput),subject=questionSubject(normalizedInput),topic=getQuestionTopicFromInput(normalizedInput);
 let pool=topic?getQuestionsForTopic(topic):quizQuestions;
 if(guided)pool=pool.filter(q=>/questao guiada/.test(normalize(q.q)));
 const broad=/^(?:quimica|cristalografia|geometria molecular|vsepr|ligacoes quimicas|modelos atomicos|quimica organica|organica|fisico quimica|quimica de coordenacao|complexos|gemas|gemologia|laboratorio|vidrarias|estequiometria|reacoes quimicas|nomenclatura inorganica|quantica|quimica quantica)$/.test(subject);
 if(subject&&!broad){
 const terms=window.SiMoEnsSearchCore?.tokenize?.(subject)||subject.split(' ');
 pool=pool.filter(q=>{const tokens=new Set(window.SiMoEnsSearchCore?.tokenize?.(q.q)||normalize(q.q).split(' '));return terms.length&&terms.filter(t=>tokens.has(t)).length/terms.length>=0.6;});
 }
 const selected=pickQuestions(pool,requestedCount);
 if(!selected.length)return 'Ainda não há '+(guided?'uma questão guiada':'uma questão revisada')+' na base local para esse recorte. Informe outro conceito ou peça exercícios de cristalografia, geometria molecular, gemas ou laboratório.';
 rememberExplicitTopic(topic||selected[0].topic,subject||topic);
 return formatQuestionResponse(selected,requestedCount,topic);
 }
 const specific=findBestKnowledgeRule(normalizedInput);if(specific?.targeted)return specific.response;
 const molecule=resolveMolecularProfile(userInput);if(molecule)return molecule;
 const element=resolveElementInformation(userInput);if(element)return element;
 const explanation=resolveExplanationIntent(normalizedInput);if(explanation)return explanation;
 const comparison=resolveComparisonIntent(normalizedInput);if(comparison)return comparison;
 const laboratory=resolveLaboratoryIntent(normalizedInput);if(laboratory)return laboratory;
 const rule=findBestKnowledgeRule(normalizedInput);if(rule){rememberTopicContext(normalizedInput);return rule.response;}
 const topic=classifyGeneralTopic(normalizedInput);
 if(topic&&new Set(['cristalografia','quimica organica','organica','fisico quimica','quantica','quimica quantica','laboratorio','ligacoes quimicas','modelos atomicos']).has(normalizedInput))return getGeneralTopicExplanation(topic);
 return 'Ainda não encontrei conteúdo suficiente na base local para responder com segurança. Informe o conceito principal e, quando houver, a fórmula, as condições ou as grandezas do problema.';
}
const INITIAL_MESSAGE = `Olá! Sou o Assistente do SiMoEns, focado em Química e nos conteúdos desta plataforma.

Posso **explicar**, **comparar**, **resumir**, **gerar questões**, reconhecer o contexto da página atual e encontrar **guias, exercícios, animações e jogos que realmente existem no SiMoEns**.

Experimente:
- "O que é uma célula unitária?"
- "Explique geometria molecular com um exemplo"
- "Qual exercício posso fazer sobre polaridade?"
- "O que estou vendo?"

Digite **Instruções** para conhecer os demais pedidos. O histórico fica salvo localmente neste navegador.`;
function getSafeBotResponse(userInput) {
    try {
        return getBotResponse(userInput);
    } catch (error) {
        console.error(error);
        return 'Ocorreu um erro ao processar a resposta. Tente enviar a pergunta novamente.';
    }
}
function resetTopicMemory() { try { sessionStorage.removeItem(TOPIC_MEMORY_KEY); } catch (_) {} }
return { getBotResponse: getSafeBotResponse, getSourcesForReply, INITIAL_MESSAGE, resetTopicMemory, rememberTopicContext, getReplyEdition };
})();


let SIMOENS_SITE_MAP = [
  {
    id: 'home',
    title: 'Home do SiMoEns',
    path: 'index.html',
    category: 'página',
    summary: 'Página inicial do site, com apresentação do grupo, novidades, produtos e acesso aos principais conteúdos.',
    related: ['Sobre o SiMoEns', 'Página Ensino', 'Chat inteligente'],
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
    related: ['Home do SiMoEns', 'Página Ensino', 'Chat inteligente'],
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
    summary: 'Catálogo das animações e recursos didáticos de química, cristalografia, geometria molecular, polaridade, polimorfismo, gemas e laboratório interativo.',
    related: ['Buracos e empacotamento', 'Células unitárias e parâmetros de rede', 'Redes cristalinas'],
    keywords: ['ensino','pagina ensino','página ensino','catalogo','catálogo','recursos didaticos','recursos didáticos']
  },
  {
    id: 'laboratorio_interativo',
    title: 'Laboratório Interativo — Vidrarias e Equipamentos de Laboratório',
    path: 'Ensino/Animacao/catalogo-de-vidrarias-animado/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Catálogo 3D de vidrarias, equipamentos, acessórios de bancada, funções laboratoriais, aplicações e animações de líquido, gás, aquecimento, rotação e operação.',
    related: ['Página Ensino', 'Xadrez Químico (Jogo)', 'Interações Intermoleculares'],
    keywords: ['laboratório interativo','laboratorio interativo','vidrarias','vidrarias e equipamentos','catálogo de vidrarias','catalogo de vidrarias','béquer','bequer','erlenmeyer','kitasato','kitassato','balão de fundo redondo','balao de fundo redondo','proveta','tubo de ensaio','balão volumétrico','balao volumetrico','funil de separação','funil de separacao','bureta','pipeta graduada','cristalizador','vial','balão de destilação','balao de destilacao','condensador liebig','dessecador','frasco âmbar','frasco ambar','pipeta pasteur','tubo de nessler','frasco de drechsel','coluna de vigreux','condensador allihn','pipeta volumétrica','pipeta volumetrica','cuba cromatográfica','cuba cromatografica','tubo de cultura','bico de bunsen','forno mufla','estufa de secagem','rotaevaporador','capela de exaustão','capela de exaustao','balança analítica','balanca analitica','condutivímetro','condutivimetro','phmetro','chapa de aquecimento','manta de aquecimento','peixinho magnético','peixinho magnetico','tripé','tripe','cadinho','funil de vidro','funil de büchner','funil de buchner','escova de limpeza','pisseta','suporte universal','pinça metálica','pinca metalica','pinça de madeira','pinca de madeira','filtro de papel','bomba a vácuo','bomba a vacuo','vidro de relógio','vidro de relogio','espátulas','espatulas','centrífuga','centrifuga','bancada de laboratório']
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
  path: 'Ensino/jogo/ca%C3%A7a-palavras/index.html',
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
    id: 'gemviewer',
    title: 'Gemas e mudança de cor',
    path: 'Ensino/Animacao/gemviewer/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Visualizador 3D para estudar gemas, cores, impurezas cromóforas, defeitos cristalinos, centros de cor, inclusões e mudanças ópticas em minerais.',
    related: ['Identificação de defeitos cristalinos (Exercício)', 'Redes cristalinas', 'Complexos e polimorfismo'],
    keywords: ['gemas','gema','gemologia','gemas e mudança de cor','gemas e mudanca de cor','gemviewer','cor em gemas','cores das gemas','impurezas','defeitos cristalinos','centros de cor','cromóforo','cromoforo','rubi','safira','esmeralda','diamante','opala','alexandrita','turmalina','topázio','fluorita','hackmanita']
  },
  {
    id: 'defeitos_cristalinos_3d',
    title: 'Visualizador 3D de defeitos cristalinos',
    path: 'Ensino/Animacao/defeitos-cristalinos/index.html',
    category: 'animação',
    catalogEntry: true,
    summary: 'Visualizador didático 3D de vacâncias, substituições, intersticiais, Frenkel e Schottky em redes SC, BCC, FCC e NaCl, com tendência energética qualitativa claramente sinalizada.',
    related: ['Identificação de defeitos cristalinos (Exercício)', 'Gemas e mudança de cor', 'Redes cristalinas'],
    keywords: ['visualizador de defeitos','defeitos cristalinos 3d','vacância 3d','vacancia 3d','frenkel','schottky','substitucional','intersticial']
  },
  {
    id: 'show_milhao_jogo',
    title: 'Show do Milhão Químico (Jogo)',
    path: 'Ensino/jogo/show-do-milhao-da-quimica/index.html',
    category: 'jogo',
    catalogEntry: true,
    summary: 'Jogo de perguntas e respostas para revisar conceitos de Química em rodadas progressivas.',
    related: ['Caça-palavras (Jogo)', 'Página Ensino', 'Xadrez Químico (Jogo)'],
    keywords: ['show do milhão','show do milhao','milhão químico','milhao quimico','quiz de química','quiz de quimica','jogo de perguntas']
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

function getCatalogEntries() {
  return SIMOENS_SITE_MAP.filter((entry) => entry.catalogEntry);
}

function getAnimationEntries() {
  return getCatalogEntries().filter((entry) => internalResourceCategory(entry) === 'animation');
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
  ['chatbot', 'apoio didático em Química para o conteúdo do site'],
  ['modelos_atomicos', 'modelos atômicos, evolução histórica do átomo e transição até a mecânica quântica'],
  ['visualizador_de_hidrogenoides', 'visualização 2D e 3D de orbitais e distribuições eletrônicas em sistemas hidrogenoides'],
  ['eq_de_ondas_hidrogenoides', 'equações de onda, função de onda, densidade de probabilidade e interpretação de orbitais hidrogenoides'],
  ['visualizador_orbitais', 'orbitais atômicos e moleculares, estruturas blobby/metaball, caráter ligante e antiligante e edição de lóbulos em 3D'],
  ['gemviewer', 'gemas, mudança de cor, impurezas cromóforas, centros de cor, defeitos cristalinos e minerais gemológicos'],
['Polaridade-e-Geometria-molecular', 'exercício de polaridade, geometria molecular, vetores e ângulos'],
['nome-da-celula', 'classificação dos sistemas cristalinos, eixos, ângulos e parâmetros de rede'],
['buracos-cristalinos', 'interstícios tetraédricos e octaédricos em estruturas cristalinas'],
['caca-ao-sitio-cristalino', 'identificação de sítios cristalinos, coordenação e ocupação'],
['Contagem-de-atomo', 'contagem de átomos, vértices, arestas, faces e fórmula unitária'],
['coordenacao-empacotamento', 'número de coordenação, empacotamento e organização espacial'],
['defeitos-cristalinos', 'defeitos cristalinos, vacâncias, Frenkel, Schottky e sítios defeituosos'],
['batalha-de-polaridade', 'comparação de polaridade molecular, vetores, ângulos e simetria'],
['caça-palavras', 'jogo de vocabulário químico e revisão de conceitos'],
['show-do-milhao-da-quimica', 'jogo de perguntas e respostas sobre Química'],
['animacao/defeitos-cristalinos', 'defeitos cristalinos em visualização 3D didática'],
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
  if (!entry || !entry.path) return SITE_URL;
  const rawPath = String(entry.path || '');
  const cleanedPath = rawPath
    .replace(/^index\.html(?=#|$)/i, '')
    .replace(/\/index\.html(?=#|$)/gi, '/')
    .replace(/([^/])#/, '$1#');
  return new URL(encodePathPreservingHash(cleanedPath), SITE_URL).href;
}


const SITE_URL_ALIAS_MAP = new Map([
  [`${SITE_URL}orbitais/index.html`, `${SITE_URL}visualizador_orbitais/index.html`],
  [`${SITE_URL}Ensino/Exercicio%20Guiado/sistema-cristalino/index.html`, `${SITE_URL}Ensino/Exercicio%20Guiado/nome-da-celula/index.html`],
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
  let clean = raw.replace(/https:\/\/quimicavisualufv\.github\.io\/Quimica-Visual\/[^\s)\]}>”']+/gi, (url) => canonicalizeKnownSiteUrl(url));
  clean = clean.replace(/\bOrbitais \(animação\)(?=$|\W)/g, 'Visualizador de Orbitais Atômicos e Moleculares');
  clean = clean.replace(/\bOrbitais \(anima\w*\)(?=$|\W)/g, 'Visualizador de Orbitais Atômicos e Moleculares');
  clean = clean.replace(/\bCoordenação \((?:animação|página)\)(?=$|\W)/g, 'Complexos e polimorfismo');
  return clean;
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
  if(window.SiMoEnsSearchCore?.normalizePath)return window.SiMoEnsSearchCore.normalizePath(pathname);
  const raw = String(pathname || '').trim();
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch (_) {}
  return decoded.toLowerCase()
    .replace(/^.*\/quimica-visual\/?/, '')
    .replace(/^.*\/simoens\/?/, '')
    .replace(/^\//, '');
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
    .normalize('NFKD')
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

function internalResourceCategory(entry) {
  if (entry?.registryCategory) return entry.registryCategory;
  const path = normalizePath(entry?.path || '');
  if (path.includes('/exercicio guiado/')) return 'exercise';
  if (path.includes('/jogo/')) return 'game';
  if (path.includes('/guia/')) return 'guide';
  return entry?.catalogEntry ? 'animation' : '';
}

function loadConversationContext() {
  try {
    const parsed = safeParse(sessionStorage.getItem(STORAGE_KEYS.conversationContext), {});
    if (!parsed || typeof parsed !== 'object') return {};
    return {
      subject: typeof parsed.subject === 'string' ? parsed.subject.slice(0, 320) : '',
      resourceId: typeof parsed.resourceId === 'string' ? parsed.resourceId.slice(0, 100) : '',
      documentSources: Array.isArray(parsed.documentSources) ? parsed.documentSources.filter((item) => typeof item === 'string').slice(0, 5) : [],
      recommendationIds: Array.isArray(parsed.recommendationIds) ? parsed.recommendationIds.filter((item) => typeof item === 'string').slice(0, 3) : [],
      lastIntent: typeof parsed.lastIntent === 'string' ? parsed.lastIntent.slice(0, 80) : '',
    };
  } catch (_) {
    return {};
  }
}

function saveConversationContext(context) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.conversationContext, JSON.stringify({
      subject: String(context?.subject || '').slice(0, 320),
      resourceId: String(context?.resourceId || '').slice(0, 100),
      documentSources: Array.isArray(context?.documentSources) ? context.documentSources.slice(0, 5) : [],
      recommendationIds: Array.isArray(context?.recommendationIds) ? context.recommendationIds.slice(0, 3) : [],
      lastIntent: String(context?.lastIntent || '').slice(0, 80),
    }));
  } catch (_) {}
}

function isCurrentExperienceQuestion(text = '') {
  const t = normalize(text);
  return /\bo que (?:eu )?estou vendo\b|\bo que (?:esta|essa) (?:pagina|página|tela|animacao|animação|atividade) (?:mostra|ensina|faz)\b|\bonde (?:eu )?estou\b/.test(t);
}

function buildCurrentExperienceReply(currentCtx) {
  const entry = findEntryByPath(currentCtx?.path || '') || (currentCtx?.entryId ? SIMOENS_SITE_MAP.find((item) => item.id === currentCtx.entryId) : null);
  if (!entry) return '';
  return `Você está em **${entry.title}**. ${entry.registryDescription || entry.summary}`;
}

function buildAccessibilityHelpReply(userText = '') {
  const text = normalize(userText);
  const opening = 'Abra o botão flutuante com o nome acessível **"Abrir menu de acessibilidade"**.';
  if (/contraste/.test(text)) return `${opening} Depois, ative **Alto contraste**. O ajuste fica salvo neste navegador até você restaurar as preferências.`;
  if (/aumentar fonte|diminuir fonte|tamanho da fonte/.test(text)) return `${opening} Use **Aumentar fonte** ou **Diminuir fonte**. Para voltar ao padrão, escolha **Restaurar ajustes**.`;
  if (/reduzir efeitos|reduzir movimento|movimento|animacao/.test(text)) return `${opening} Ative **Reduzir efeitos**. O controle reduz movimentos compatíveis sem alterar o conteúdo da página.`;
  if (/ouvir|voz|leitura em voz|speech|fala/.test(text)) return `${opening} Na área de leitura em voz alta, escolha **Ouvir**; também existem **Pausar**, **Parar**, seleção de voz, volume e velocidade.`;
  if (/guia de leitura/.test(text)) return `${opening} Ative **Guia de leitura** para acompanhar visualmente a linha de leitura.`;
  if (/daltonismo|cores|tons de cinza/.test(text)) return `${opening} Você pode ativar **Tons de cinza** ou um dos ajustes de daltonismo para vermelho/verde e azul/amarelo.`;
  if (/conteudo principal|pular|skip/.test(text)) return `${opening} Use **Ir para conteúdo principal** para mover o foco diretamente ao conteúdo da página.`;
  return `${opening} O menu oferece leitura em voz alta, tamanho da fonte, alto contraste, tons de cinza, ajustes de daltonismo, destaque de links, espaçamento de texto, redução de efeitos, guia de leitura, atalho para o conteúdo principal e restauração dos ajustes.`;
}

function generatedReplyUsesOnlyKnownResources(text = '') {
  const content = String(text || '');
  const absoluteUrls = content.match(/https:\/\/quimicavisualufv\.github\.io\/Quimica-Visual\/[^\s)\]}>'\"]*/gi) || [];
  const markdownTargets = Array.from(content.matchAll(/\]\(([^)]+)\)/g), (match) => match[1].trim())
    .filter((value) => /^(?:\/?Quimica-Visual\/)?(?:Ensino|Chat)\//i.test(value));
  return [...absoluteUrls, ...markdownTargets].every((value) => {
    try {
      const parsed = new URL(value, SITE_URL);
      if (parsed.origin !== new URL(SITE_URL).origin) return false;
      if (/\/Quimica-Visual\/?$/i.test(parsed.pathname)) return true;
      const route = `${parsed.pathname}${parsed.hash || ''}`;
      return Boolean(findEntryByPath(route));
    } catch (_) {
      return false;
    }
  });
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
    content: item.content.slice(0, 16000),
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
    'camada','camadas','estrutura','estruturas','buracos','intersticios','interstícios',
    'gema','gemas','gemologia','gemologico','gemológica','mineral gemologico','minerais gemologicos','corindo','rubi','safira','berilo','esmeralda','agua marinha','água-marinha','quartzo','ametista','citrino','diamante','opala','topazio','topázio','turmalina','granada','alexandrita','crisoberilo','centro de cor','centros de cor','cromoforo','cromóforo','impureza cromofora','impureza cromófora','pleocroismo','pleocroísmo','tenebrescencia','tenebrescência','gemviewer'
  ].concat(extra.map((item) => normalize(item)));
}

function getContextKeywords(ctx) {
  const raw = `${ctx?.title || ''} ${ctx?.heading || ''} ${ctx?.activeTab || ''} ${ctx?.topic || ''}`;
  return normalize(raw)
    .split(/[^a-z0-9]+/)
    .filter((item) => item && item.length > 3);
}


function siteKeywords() {
  const keys = ['simoens','site','animacao','animação','animacoes','animações','pagina','página','paginas','páginas','home','ensino','chat'];
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
  if (window.SiMoEnsSearchCore?.resolveResourceByPath) {
    return window.SiMoEnsSearchCore.resolveResourceByPath(SIMOENS_SITE_MAP, pathname);
  }
  const p = normalizePath(pathname);
  if (!p) return null;

  // Most public routes are named index.html. A basename-only comparison therefore
  // resolves almost every experience to the first map entry (the home page).
  // Prefer the complete canonical route and only use a basename when it is unique.
  const routeKey = (value) => normalizePath(value)
    .replace(/#.*$/, '')
    .replace(/\/index\.html$/, '')
    .replace(/^index\.html$/, '')
    .replace(/\/+$/, '');
  const exact = SIMOENS_SITE_MAP.find((entry) => normalizePath(entry.path) === p);
  if (exact) return exact;

  const key = routeKey(p);
  const canonical = SIMOENS_SITE_MAP.find((entry) => routeKey(entry.path) === key);
  if (canonical) return canonical;

  const basename = p.replace(/^.*\//, '');
  if (!basename || basename === 'index.html') return null;
  const basenameMatches = SIMOENS_SITE_MAP.filter((entry) => normalizePath(entry.path).replace(/^.*\//, '') === basename);
  return basenameMatches.length === 1 ? basenameMatches[0] : null;
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

const GENERIC_SITE_MATCH_TERMS = new Set([
  'site', 'simoens', 'pagina', 'paginas', 'pagina inicial', 'ensino', 'catalogo', 'recursos', 'recurso',
  'animacao', 'animacoes', 'visualizador', 'visualizadores', 'simulacao', 'simulacoes',
  'guia', 'guias', 'exercicio', 'exercicios', 'atividade', 'atividades', 'jogo', 'jogos',
]);

function scoreSiteEntryMatch(entry, text) {
  const t = normalize(text);
  if (!t) return 0;
  let score = 0;
  for (const term of entryTerms(entry)) {
    if (!term) continue;
    if (GENERIC_SITE_MATCH_TERMS.has(term)) continue;
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

function buildSiteOverviewReply(userText = '') {
  const catalog = getCatalogEntries();
  const counts = catalog.reduce((result, entry) => {
    const category = internalResourceCategory(entry);
    result[category] = (result[category] || 0) + 1;
    return result;
  }, {});
  const overview = `O SiMoEns é uma plataforma de objetos educacionais de Química. O registro atual reúne **${catalog.length} recursos**: ${counts.animation || 0} animações/visualizadores, ${counts.guide || 0} guias, ${counts.exercise || 0} exercícios e ${counts.game || 0} jogos. O catálogo fica em ${entryUrl(SIMOENS_SITE_MAP.find((entry) => entry.id === 'ensino'))}.`;
  const wantsCompleteMap = /mapa completo|todos os links|lista completa|liste tudo/.test(normalize(userText));
  if (!wantsCompleteMap) {
    return `${overview}\n\nDiga o tipo de recurso e o assunto que procura; por exemplo: **"quais exercícios existem sobre polaridade?"**`;
  }

  const lines = [overview, '', 'Mapa completo solicitado:'];
  for (const category of SITE_GROUP_ORDER) {
    const entries = SIMOENS_SITE_MAP.filter((entry) => entry.category === category);
    if (!entries.length) continue;
    lines.push(`**${SITE_GROUP_LABELS[category] || category}:**`);
    lines.push(...entries.map((entry) => `- ${entry.title}: ${entryUrl(entry)}`));
  }
  return lines.join('\n');
}

function buildEntryReply(entry, userText = '', currentCtx = null) {
  if (!entry) return '';
  return `**${entry.title}:** ${entry.registryDescription || entry.summary}`;
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
  if(isSiteLinkRequest(userText)){
    const normalized=window.SiMoEnsSearchCore?.normalize?.(userText)||t;
    const target=normalized.replace(/^(?:qual (?:e )?(?:o )?link|(?:me )?(?:mande|manda|passe|passa|envie) (?:o )?link|link)\s+(?:de|do|da|dos|das)\s+/,'').trim();
    const exact=SIMOENS_SITE_MAP.find(entry=>entry.catalogEntry && (window.SiMoEnsSearchCore?.normalize?.(entry.title)||normalize(entry.title))===target);
    if(exact)return buildEntryLinkReply(exact);
  }

  const asksTeam = /integrantes|membros do site|membros da equipe|equipe do site|equipe do simoens|quem faz o site|quem participa do site|quem sao os integrantes|quem são os integrantes/.test(t);
  if (asksTeam) {
    return 'Os integrantes destacados no site são: Angel Amado Recio Despaigne, Deyse Gomes da Costa, Fábio Junior Moreira Novaes, Lis Regiane Vizolli Favarin, Luana Ornellas Brito e Lucas Xavier Nardelli. Todos aparecem na seção de equipe da home do SiMoEns.';
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
    return `As páginas públicas principais do SiMoEns são: Home (${entryUrl(SIMOENS_SITE_MAP.find((e) => e.id === 'home'))}), Ensino (${entryUrl(SIMOENS_SITE_MAP.find((e) => e.id === 'ensino'))}) e Chat inteligente (${entryUrl(SIMOENS_SITE_MAP.find((e) => e.id === 'chat'))}). O catálogo de Ensino reúne animações, guias, exercícios e jogos.`;
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
    return `O SiMoEns tem ${animations.length} animações e visualizadores cadastrados:\n${animations.map((entry, index) => `${index + 1}. **${entry.title}** — ${entryUrl(entry)}`).join('\n')}`;
  }

  const asksAnimationCount = /quantas animacoes|quantas animações|numero de animacoes|número de animações|total de animacoes|total de animações/.test(t) && (t.includes('site') || t.includes('simoens') || t.includes('agora') || t.includes('tem'));
  if (asksAnimationCount) {
    const animations = getAnimationEntries();
    return `O registro atual do assistente contém **${animations.length} animações e visualizadores** do SiMoEns.`;
  }

  const asksLatestAnimations = /3 novas animacoes|3 novas animações|novas animacoes|novas animações|ultimas animacoes|últimas animações|ultimas animacoes do site|últimas animações do site|animacoes mais recentes|animações mais recentes/.test(t);
  if (asksLatestAnimations) {
    return 'O registro de conteúdo ainda não possui datas de publicação confiáveis, então não consigo afirmar quais animações são as mais recentes. Posso listar as animações atualmente cadastradas ou encontrar uma por assunto.';
  }

  const asksGemViewerByName = /gemas e mudanca de cor|gemas e mudança de cor|gemviewer|visualizador de gemas|animacao de gemas|animação de gemas|mudanca de cor em gemas|mudança de cor em gemas/.test(t);
  const asksGemViewerBySiteIntent = /(cor em gemas|cores das gemas)/.test(t) && (/link|links|url|urls|acessar|acessa|abrir|abre|onde fica|animacao|animação|visualizador/.test(t));
  const asksGemViewer = asksGemViewerByName || asksGemViewerBySiteIntent;
  if (asksGemViewer) {
    const gemEntry = SIMOENS_SITE_MAP.find((e) => e.id === 'gemviewer');
    if (gemEntry) {
      if (/link|links|url|urls|acessar|acessa|abrir|abre|onde fica/.test(t)) {
        return `O link de ${gemEntry.title} é: ${entryUrl(gemEntry)}`;
      }
      return `${gemEntry.title} é uma animação/visualizador 3D do SiMoEns para estudar gemas, mudança de cor, impurezas cromóforas, centros de cor, defeitos cristalinos, interstícios, inclusões e relações entre estrutura mineral e propriedades ópticas. Link: ${entryUrl(gemEntry)}.`;
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
  if (isSiteOverviewQuestion(userText)) return buildSiteOverviewReply(userText);

  const matches = filterEntriesByIntent(userText, currentCtx, matchSiteEntries(userText));
  const t = normalize(userText);

  if (!matches.length && /essa pagina|essa página|essa animacao|essa animação|esta pagina|esta página|esta animacao|esta animação/.test(t)) {
    const currentEntry = findEntryByPath(currentCtx?.path || '');
    if (currentEntry) return isSiteLinkRequest(userText) ? buildEntryLinkReply(currentEntry) : buildEntryReply(currentEntry, userText, currentCtx);
  }

  const exactTitle = matches.find((entry) => normalize(entry.title) === t);
  const exactKeywordMatches = matches.filter((entry) => (entry.keywords || []).some((keyword) => normalize(keyword) === t));
  const exactTitleOrKeyword = exactTitle || (exactKeywordMatches.length === 1 ? exactKeywordMatches[0] : null);

  const bestMatch = exactTitleOrKeyword || matches[0] || null;

  if (bestMatch && isSiteLinkRequest(userText)) return buildEntryLinkReply(bestMatch);
  if (exactTitleOrKeyword) return buildEntryReply(exactTitleOrKeyword, userText, currentCtx);

  const explicitResourceIntent = hasSiteIntent(userText)
    || /\b(?:recurso|guia|exercicio|atividade|jogo|visualizador|simulador|simulacao|modulo)\b/.test(t);
  const looksLikeSummaryRequest = explicitResourceIntent && (
    t.includes('do que fala') || t.includes('o que mostra') || t.includes('o que tem') ||
    t.includes('resuma') || t.includes('explique essa') || t.includes('fale dessa') ||
    t.includes('fale dessa pagina') || t.includes('fale dessa página') ||
    t.includes('fale dessa animacao') || t.includes('fale dessa animação') ||
    t.includes('me fale sobre') || t.includes('quero saber sobre') ||
    hasSiteIntent(userText));

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
  return /(quimica|química|simoens|site|anima|pagina|página|molecula|molécula|ion|íon|ligacao|ligação|estrutura|cristal|bravais|wigner|seitz|tetra|octa|interst|poliedr|coordena|complexo|vsepr|polaridade|molecular|metal|covalente|ácido|acido|base|sal|óxido|oxido|mol|estequi|concentr|soluç|soluc|ph|orbital|banda|condut|difra|drx|bragg|miller|polimorf|alotrop|átomo|atomo|el[eé]tron|proton|próton|defeit|vacan|frenkel|schottky|dopag|liga|solvat|hidrat|anion|cation|semicond|isolante|gema|gemas|gemolog|corindo|rubi|safira|berilo|esmeralda|diamante|opala|topazio|topázio|turmalina|granada|alexandrita|crisoberilo|cromofor|centro de cor|centros de cor|pleocro|tenebresc|inclus[aã]o|inclus[oõ]es)/.test(t);
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
  if (hasStudyIntent(text) && /(quimica|química|site|simoens|anima|pagina|página|molecula|molécula|ion|íon|ligacao|ligação|estrutura|cristal|defeit|vacan|frenkel|schottky|dopag|gema|gemas|gemolog|rubi|safira|esmeralda|diamante|opala|cromofor|centro de cor|centros de cor|impureza|inclus[aã]o|inclus[oõ]es|pleocro|tratamento gemolog)/.test(t)) return true;
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

function requestedSentenceCount(text) {
  const words={uma:1,um:1,duas:2,dois:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8};
  const match=(window.SiMoEnsSearchCore?.normalize?.(text)||String(text)).match(/\b(\d+|uma|um|duas|dois|tres|quatro|cinco|seis|sete|oito) frases?\b/);
  return match?Math.max(1,Math.min(8,words[match[1]]||Number(match[1]))):3;
}

function countReplySentences(text) {
  const clean=String(text||'').replace(/^\s*(?:#{1,6}\s+.*|\*\*[^*\n]+\*\*)\s*$/gm,'').replace(/\*\*/g,'').trim();
  return (clean.match(/[\s\S]+?(?:[.!?](?=\s|$)|$)/g)||[]).filter(s=>s.trim()).length;
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
  return canonicalizeAssistantReply(plainScientificNotation(clean));
}

function preservesScientificDetails(baseText, candidateText) {
  const differences = scientificDetailDifferences(baseText, candidateText);
  return !differences.addedNumbers.length && !differences.missingNumbers.length
    && !differences.addedFormulas.length && !differences.missingFormulas.length;
}

function scientificDetailDifferences(baseText, candidateText) {
  const elements = new Set(('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og').split(' '));
  const prepare = value => String(value || '').normalize('NFKD').replace(/−/g, '-');
  const baseContext = prepare(baseText).replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const conventionNames = { UV: /ultravioleta/, IV: /infravermelh[oa]/, SC: /cubica simples/, BCC: /corpo centrado/, CCC: /corpo centrado/, FCC: /faces? centradas?/, CFC: /faces? centradas?/, HCP: /hexagonal compact/ };
  const numbers = value => new Set((prepare(value).replace(/^\s{0,3}\d{1,2}[.)]\s+/gm, '').replace(/\bzero\b/gi, '0').match(/(?<![\p{L}\p{N}])[-+]?\d+(?:[,.]\d+)?(?:[eE][-+]?\d+)?(?![\p{L}\p{N}])/gu) || []).map(v => String(Number(v.replace(',', '.')))));
  const formulas = value => new Set((prepare(value).match(/\b(?:[A-Z][a-z]?\d*){1,8}(?:[+-](?!\w))?(?![A-Za-z0-9])/g) || []).filter(candidate => {
    if (conventionNames[candidate]?.test(baseContext)) return false;
    const symbols = candidate.match(/[A-Z][a-z]?/g) || [];
    // A sequence of capitals is a formula only if all symbols identify real elements.
    // MEP, VSEPR, TCC, TOM and similar abbreviations are not molecular formulae.
    if (!symbols.length || !symbols.every(symbol => elements.has(symbol))) return false;
    // Isolated prose initials and articles are not chemical evidence. Diatomics and ions are.
    return symbols.length >= 2 || /\d|[+-]$/.test(candidate);
  }));
  const beforeNumbers = numbers(baseText), afterNumbers = numbers(candidateText);
  const beforeFormulas = formulas(baseText), afterFormulas = formulas(candidateText);
  return {
    addedNumbers: [...afterNumbers].filter(value => !beforeNumbers.has(value)),
    missingNumbers: [...beforeNumbers].filter(value => !afterNumbers.has(value)),
    addedFormulas: [...afterFormulas].filter(value => !beforeFormulas.has(value)),
    missingFormulas: [...beforeFormulas].filter(value => !afterFormulas.has(value)),
  };
}

function scientificClaimIssues(baseText,candidateText) {
  const norm=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const base=norm(baseText),candidate=norm(candidateText),issues=[];
  // Narrow guards for errors reproduced in the exported tests; these are not a proof of correctness.
  if(/celula unitaria/.test(base)&&/primitiva/.test(base)
    && /celula unitaria (?:e|constitui|representa)(?: (?:definida|como|o|a|um|uma|bloco|volume|sempre|necessariamente)){0,6} (?:menor|minim[oa])/.test(candidate))issues.push('unsupported-cell-claim');
  if(/potencial eletrostatico/.test(base)&&/potencial(?: eletrostatico)? (?:e (?:um )?vetor|(?:tem|possui|apresenta|indica) (?:magnitude e )?direcao)/.test(candidate))issues.push('unsupported-potential-claim');
  if(/pipeta/.test(base)&&!/pressao/.test(base)&&/temperatura e pressao|pressao de calibracao/.test(candidate))issues.push('unsupported-calibration-claim');
  if(/efeito quelato/.test(base)&&candidate.split(/[.!?\n]+/).some(sentence=>
    /entropic[ao]s?[^.!?\n]{0,100}(?:reducao|diminuicao) (?:do |no )?(?:numero de |quantidade de )?(?:especies|particulas|moleculas) livres/.test(sentence)
    && !/\b(?:nao|nem|incorreto|equivocado)\b/.test(sentence)))issues.push('unsupported-chelate-claim');
  const affirmative=pattern=>candidate.split(/[.!?\n]+/).some(sentence=>pattern.test(sentence)&&!/\b(?:nao|nem|incorreto|equivocado)\b/.test(sentence));
  if(/o2/.test(base)&&/paramagnetic/.test(base)&&affirmative(/\b(?:o2|oxigenio molecular) (?:e|seria|torna se) (?:uma especie )?diamagnetic[oa]/))issues.push('unsupported-magnetism-claim');
  if(/2d/.test(base)&&/nao existe orbital 2d/.test(base)&&affirmative(/\b(?:o )?orbital 2d (?:e permitido|existe|pode existir)/))issues.push('unsupported-quantum-claim');
  if(/ebulicao/.test(base)&&/pressao/.test(base)&&affirmative(/\bagua(?: pura)? (?:sempre ferve|ferve sempre) a 100/))issues.push('unsupported-boiling-claim');
  return issues;
}

function plainScientificNotation(text) {
  let value=String(text||'');
  if(!value.includes('\\'))return value;
  const symbols={psi:'ψ',Psi:'Ψ',Delta:'Δ',delta:'δ',Omega:'Ω',omega:'ω',alpha:'α',beta:'β',gamma:'γ',mu:'μ',lambda:'λ',theta:'θ',pi:'π',approx:'≈',times:'×',cdot:'·',neq:'≠',leq:'≤',geq:'≥',ln:'ln',log:'log',int:'∫'};
  value=value.replace(/\\[([]|\\[)\]]/g,'').replace(/\\(?:left|right)\b/g,'').replace(/\\[,;!]/g,' ');
  for(let pass=0;pass<4;pass++)value=value.replace(/\\(?:mathrm|text|operatorname)\s*\{([^{}]*)\}/g,'$1').replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,'($1)/($2)');
  value=value.replace(/\\(?:mathrm|text)\s+/g,'').replace(/\\([A-Za-z]+)\b/g,(all,key)=>symbols[key]||all);
  const superscripts={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻'};
  value=value.replace(/\^\{([0-9+-]+)\}|\^([0-9+-])/g,(_,group,single)=>[...(group||single)].map(c=>superscripts[c]).join('')).replace(/k_\{?B\}?/g,'kᵦ').replace(/_\{([^{}]+)\}/g,'_$1');
  return value;
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
  const head = clean.slice(0, maxChars - 1);
  const sentences = head.match(/[\s\S]*[.!?](?=\s|$)/);
  if (sentences && sentences[0].length >= Math.min(100, maxChars / 3)) return sentences[0].trim();
  return `${head.slice(0, head.lastIndexOf(' ') > 0 ? head.lastIndexOf(' ') : head.length).trim()}…`;
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
    sourceIds: Array.isArray(raw.sourceIds) ? raw.sourceIds.filter(id => SCIENTIFIC_REFERENCES[id]) : [],
    page: raw.page ?? null,
    chunk_index: Number.isFinite(Number(raw.chunk_index)) ? Number(raw.chunk_index) : index,
  };
}

const GROQ_STATUS_STYLES = ".chat-smart-page .message-body .sw-generation-note,.sw-bubble .sw-generation-note {font-size:.82em;line-height:1.5;margin:1.1em 0 0;padding-top:.7em;border-top:1px solid rgba(116,142,176,.35);color:inherit;}";

const CHAT_READING_STYLES = ".chat-smart-page .message-card {border:1px solid #dce4ed;border-radius:18px;box-shadow:0 4px 18px rgba(24,42,67,.035);padding:20px 24px;max-width:100%;min-width:0;background:#fff;color:#203047;}\n.chat-smart-page .message-card.user {background:#eef5ff;border-color:#cbdcf5;color:#193657;}\n.chat-smart-page .message-role {font-size:.72rem;letter-spacing:.08em;font-weight:750;color:#526981;margin-bottom:12px;}\n.chat-smart-page .message-body,.sw-bubble {font-family:Inter,system-ui,-apple-system,\"Segoe UI\",sans-serif;font-size:1rem;font-weight:400;line-height:1.75;text-align:left;letter-spacing:normal;overflow-wrap:anywhere;word-break:normal;min-width:0;}\n.chat-smart-page .message-body {color:inherit;}\n.sw-bubble {color:#203047;font-size:calc(1rem * var(--simoens-a11y-font-scale,1));}\n.sw-msgrow.user .sw-bubble {color:#193657;}\n.chat-smart-page .message-body>*,.sw-bubble>* {max-width:70ch;}\n.chat-smart-page .message-body p,.sw-bubble p {font-size:inherit;line-height:inherit;margin:0 0 1em;}\n.chat-smart-page .message-body>:last-child,.sw-bubble>:last-child {margin-bottom:0;}\n.chat-smart-page .message-body h4,.sw-bubble h4 {font:700 1.06em/1.45 Inter,system-ui,sans-serif;margin:1.2em 0 .6em;}\n.chat-smart-page .message-body ul,.chat-smart-page .message-body ol,.sw-bubble ul,.sw-bubble ol {margin:.65em 0 1.1em;padding-left:1.55em;list-style-position:outside;}\n.chat-smart-page .message-body li,.sw-bubble li {margin:.35em 0;padding-left:.2em;line-height:1.65;font-size:inherit;}\n.chat-smart-page .message-body code,.sw-bubble code {font: .92em/1.6 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;border-radius:5px;padding:.1em .3em;background:rgba(110,139,177,.12);color:inherit;}\n.chat-smart-page .message-body a,.sw-bubble a {text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px;overflow-wrap:anywhere;word-break:normal;}\n.chat-smart-page .message-body a {color:#15549b;}\n.sw-bubble a {color:#15549b;}\n.sw-answer,.sw-references {margin:1.05em 0 0;border:1px solid rgba(116,142,176,.4);border-radius:12px;padding:0;overflow:hidden;background:rgba(125,149,185,.045);font-size:inherit;}\n.sw-answer summary,.sw-references summary {padding:12px 14px;cursor:pointer;font-weight:650;line-height:1.5;min-height:44px;box-sizing:border-box;}\n.sw-answer[open] summary,.sw-references[open] summary {border-bottom:1px solid rgba(116,142,176,.3);}\n.sw-answer-content {padding:14px;}\n.sw-references ol {padding:4px 18px 6px 34px!important;}\n.sw-references li {font-size:.88em;line-height:1.55;}\n.sw-reference-publisher {display:block;font-size:.9em;margin-top:3px;opacity:.85;}\n.chat-smart-page .message-body hr,.sw-bubble hr {border:0;border-top:1px solid rgba(116,142,176,.3);margin:1.5em 0;}\n.chat-smart-page .message-body :focus-visible,.sw-bubble :focus-visible {outline:3px solid #3d84d8;outline-offset:3px;border-radius:4px;}\n@media(max-width:600px){.chat-smart-page .message-card {padding:16px;border-radius:14px;}.chat-smart-page .message-body,.sw-bubble {font-size:1rem;line-height:1.7;}.sw-answer summary,.sw-references summary {padding:12px;}.sw-references ol {padding-left:30px!important;}}\n@media(prefers-contrast:more){.chat-smart-page .message-card {border-color:#53677e;}.sw-answer,.sw-references {border-color:currentColor;}.sw-reference-publisher {opacity:1;}}\n\n.sw-bubble h4 {color:inherit;}\n:host-context(html.simoens-a11y-spacing) .sw-bubble,:host-context(html.simoens-a11y-spacing) .sw-bubble * {letter-spacing:.04em;word-spacing:.12em;line-height:1.75;}\n:host-context(html.simoens-a11y-contrast) .sw-panel,:host-context(html.simoens-a11y-contrast) .sw-messages,:host-context(html.simoens-a11y-contrast) .sw-menu,:host-context(html.simoens-a11y-contrast) .sw-input,:host-context(html.simoens-a11y-contrast) .sw-bubble,:host-context(html.simoens-a11y-contrast) .sw-bubble * {background-color:#050505;color:#fff;border-color:#fff;}\n:host-context(html.simoens-a11y-contrast) .sw-bubble a {color:#ffff00;}\n\n.chat-smart-page .field {display:flex;flex-direction:column;gap:10px;}\n.chat-smart-page .field textarea {min-height:140px;padding:18px;box-sizing:border-box;}\n.chat-smart-page .field .send {position:static;align-self:flex-end;max-width:100%;min-height:44px;}\n\n.chat-smart-page .new-chat-btn,.chat-smart-page .action-pill,.chat-smart-page .sidebar-toggle {background:#fff;color:#234568;border:1px solid #ccd8e6;min-height:44px;}\n.chat-smart-page .send {background:#163f76;color:#fff;border:1px solid #163f76;}\nhtml.simoens-a11y-contrast .chat-smart-page button {background:#050505!important;background-image:none!important;color:#ffff00!important;border:1px solid #ffff00!important;}\n.sw-header .sw-iconbtn {min-width:44px;min-height:44px;}\n.sw-header .sw-title {min-width:0;white-space:normal;}\n:host-context(html.simoens-a11y-contrast) .sw-form,:host-context(html.simoens-a11y-contrast) .sw-menuitem {background:#050505;color:#fff;}\n:host-context(html.simoens-a11y-contrast) .sw-menuitem,:host-context(html.simoens-a11y-contrast) .sw-send {color:#ffff00;background:#050505;border:1px solid #ffff00;}\n:host-context(html.simoens-a11y-contrast) .sw-input::placeholder {color:#ddd;opacity:1;}\n";

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
    this.conversationRevision = 0;
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
    this.messageAutoScrollEnabled = true;
    this.messageUserScrollLocked = false;
    this.messageScrollBindingTarget = null;
    this.messageScrollProgrammatic = false;
    this.messageScrollFrame = 0;
    this.messageScrollRestoreFrame = 0;
    this.messageTouchStartY = null;
    this.messageLastScrollTop = 0;
    this.generationConfig = DEFAULT_GENERATION_CONFIG;
    this.aiMode = loadAIMode();
    this.aiModeRevision = 0;
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
    this.documentSearchIndex = null;
    this.resourceSearchIndex = null;
    this.searchFoundationPromise = null;
    this.registryLoaded = false;
    this.registryError = '';
    this.conversationContext = loadConversationContext();
    this.lastDocumentMatches = [];
    this.pendingRecommendations = [];
    this.ensureWelcomeMessage();
    // Warm the small local search foundation without blocking page rendering.
    this.ensureSearchFoundation();
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
    const saved = localStorage.getItem(STORAGE_KEYS.pageConversations);
    const raw = safeParse(saved, []);
    const conversations = Array.isArray(raw) ? raw.map((item) => this.sanitizeConversationRecord(item)).filter(Boolean) : [];
    const activeId = String(localStorage.getItem(STORAGE_KEYS.pageActiveConversation) || '').trim();
    return { conversations, activeId, initialized: saved !== null };
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

    if (!this.conversations.length && !stored.initialized) {
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
    if (active || stored.initialized) {
      this.messages = [...(active?.messages || [])];
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
    this.invalidateConversationGeneration();
    const stored = this.loadPageShellConversationStore();
    this.conversations = stored.conversations;
    this.activeConversationId = stored.activeId;
    const record = this.createConversationRecord('Nova conversa', []);
    this.conversations.unshift(record);
    this.activeConversationId = record.id;
    this.messages = [];
    this.resetConversationContext();
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
    let active = this.getActiveConversation();
    if (!active) {
      if (!this.messages.some((item) => item.role === 'user')) {
        saveMessages(this.messages);
        return;
      }
      active = this.createConversationRecord(this.deriveConversationTitleFromMessages(this.messages), this.messages);
      this.conversations.unshift(active);
      this.activeConversationId = active.id;
    }
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
      const count = active?.messages?.length ?? this.messages.length;
      const stamp = this.formatConversationTimestamp(active?.updatedAt || Date.now());
      this.refs.currentConversationMeta.textContent = `${count} ${count === 1 ? 'mensagem' : 'mensagens'} · atualizada em ${stamp}`;
    }
  }

  renderConversationList() {
    if (!this.legacyPageShell || !this.refs.conversationList) return;
    if (this.refs.deleteAllChatsBtn) this.refs.deleteAllChatsBtn.disabled = !this.conversations.length;
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
          <div class="history-row ${isActive ? 'active' : ''}">
            <button class="history-item ${isActive ? 'active' : ''}" type="button" data-conversation-id="${this.escapeHtml(item.id)}" aria-current="${isActive ? 'true' : 'false'}">
              <span class="history-title">${this.escapeHtml(item.title || 'Nova conversa')}</span>
              <span class="history-snippet">${preview}</span>
              <span class="history-meta"><span>${stamp}</span><span class="history-tag">Chat</span></span>
            </button>
            <button class="history-delete" type="button" data-delete-conversation="${this.escapeHtml(item.id)}" aria-label="Excluir conversa: ${this.escapeHtml(item.title || 'Nova conversa')}" title="Excluir conversa">
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6"/></svg>
            </button>
          </div>
        `;
      }).join('');
    this.refs.conversationList.innerHTML = html;
  }

  activateConversation(conversationId) {
    if (!this.legacyPageShell) return;
    const next = this.conversations.find((item) => item.id === conversationId);
    if (!next) return;
    this.invalidateConversationGeneration();
    this.activeConversationId = next.id;
    this.messages = [...(next.messages || [])];
    this.restoreConversationContextFromMessages();
    this.ensureWelcomeMessage();
    this.persistPageShellConversationStore();
    saveMessages(this.messages);
    this.renderConversationList();
    this.updateConversationHeader();
    this.renderMessages({ forceScroll: true });
    this.setStatus('Conversa carregada.', this.engine ? 100 : 0, false);
  }

  createNewPageConversation() {
    if (!this.legacyPageShell) return;
    this.invalidateConversationGeneration();
    const record = this.createConversationRecord('Nova conversa', []);
    this.conversations.unshift(record);
    this.activeConversationId = record.id;
    this.messages = [];
    this.resetConversationContext();
    this.ensureWelcomeMessage();
    this.syncActiveConversationState({ touch: false });
    this.renderMessages({ forceScroll: true });
    this.setStatus('Nova conversa iniciada.', this.engine ? 100 : 0, false);
    requestAnimationFrame(() => this.focusWithoutScrolling(this.refs.input));
  }

  clearActiveConversation() {
    if (!this.legacyPageShell) {
      this.clearMemory();
      return;
    }
    this.invalidateConversationGeneration();
    this.messages = [];
    this.resetConversationContext();
    this.ensureWelcomeMessage();
    this.syncActiveConversationState();
    this.renderMessages({ forceScroll: true });
    this.setStatus('Conversa limpa.', this.engine ? 100 : 0, false);
  }

  invalidateConversationGeneration() {
    this.conversationRevision++;
    this.requestStopGeneration();
  }

  requestConversationDeletion(conversationId = null) {
    if (!this.legacyPageShell || this.refs.deleteDialog?.open || this.pendingConversationDeletion) return;
    const all = conversationId === null;
    const record = this.conversations.find((item) => item.id === conversationId);
    if (all ? !this.conversations.length : !record) return;
    this.pendingConversationDeletion = { all, conversationId, returnFocus: document.activeElement };
    const dialog = this.refs.deleteDialog;
    if (!dialog || typeof dialog.showModal !== 'function') {
      const description = all ? 'Excluir todas as conversas deste navegador? Esta ação não pode ser desfeita.' : `Excluir a conversa “${record.title}”? Esta ação não pode ser desfeita.`;
      if (window.confirm(description)) all ? this.deleteAllConversations() : this.deleteConversation(conversationId);
      this.pendingConversationDeletion = null;
      return;
    }
    this.refs.deleteDialogTitle.textContent = all ? 'Excluir todas as conversas?' : 'Excluir conversa?';
    this.refs.deleteDialogDescription.textContent = all
      ? 'Todas as conversas serão excluídas do histórico deste navegador. Esta ação não pode ser desfeita.'
      : 'Esta conversa será excluída do histórico deste navegador. Esta ação não pode ser desfeita.';
    this.refs.deleteDialogTarget.textContent = all
      ? `${this.conversations.length} ${this.conversations.length === 1 ? 'conversa salva' : 'conversas salvas'}`
      : record.title;
    this.refs.deleteDialogConfirm.textContent = all ? 'Excluir todas' : 'Excluir conversa';
    dialog.returnValue = 'cancel';
    dialog.showModal();
    this.focusWithoutScrolling(dialog.querySelector('.chat-delete-cancel'));
  }

  finishConversationDeletion() {
    const pending = this.pendingConversationDeletion;
    this.pendingConversationDeletion = null;
    if (!pending) return;
    const confirmed = this.refs.deleteDialog.returnValue === 'delete';
    if (confirmed) pending.all ? this.deleteAllConversations() : this.deleteConversation(pending.conversationId);
    let focusTarget = pending.returnFocus;
    if (!focusTarget?.isConnected) {
      focusTarget = [...this.refs.conversationList.querySelectorAll('[data-delete-conversation]')]
        .find((button) => button.dataset.deleteConversation === pending.conversationId);
    }
    if (!focusTarget?.isConnected || focusTarget.disabled) {
      focusTarget = this.refs.conversationList.querySelector('.history-item.active') || this.refs.newChatBtn;
    }
    this.focusWithoutScrolling(focusTarget);
  }

  showConversationDeletionStatus(text) {
    if (this.refs.deletionStatus) this.refs.deletionStatus.textContent = text;
    this.setStatus(text, this.engine ? 100 : 0, false);
  }

  deleteConversation(conversationId) {
    if (!this.legacyPageShell || !this.conversations.some((item) => item.id === conversationId)) return;
    this.conversations = this.conversations.filter((item) => item.id !== conversationId);
    if (conversationId === this.activeConversationId) {
      this.invalidateConversationGeneration();
      const fallback = [...this.conversations].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
      this.activeConversationId = fallback?.id || '';
      this.messages = [...(fallback?.messages || [])];
      if (fallback) this.restoreConversationContextFromMessages();
      else this.resetConversationContext();
      this.ensureWelcomeMessage();
      saveMessages(this.messages);
    }
    this.persistPageShellConversationStore();
    this.renderConversationList();
    this.updateConversationHeader();
    this.renderMessages();
    this.showConversationDeletionStatus('Conversa excluída.');
  }

  deleteAllConversations() {
    if (!this.legacyPageShell) return;
    this.invalidateConversationGeneration();
    this.conversations = [];
    this.activeConversationId = '';
    this.messages = [];
    this.resetConversationContext();
    this.ensureWelcomeMessage();
    saveMessages(this.messages);
    this.persistPageShellConversationStore();
    this.renderConversationList();
    this.updateConversationHeader();
    this.renderMessages({ forceScroll: true });
    this.showConversationDeletionStatus('Todas as conversas foram excluídas.');
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
    this.refs.counter = document.getElementById('counter');
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
    this.refs.deleteAllChatsBtn = document.getElementById('deleteAllChatsBtn');
    this.refs.deletionStatus = document.getElementById('conversationDeletionStatus');
    this.refs.deleteDialog = document.getElementById('deleteConversationsDialog');
    this.refs.deleteDialogTitle = document.getElementById('deleteConversationsTitle');
    this.refs.deleteDialogDescription = document.getElementById('deleteConversationsDescription');
    this.refs.deleteDialogTarget = document.getElementById('deleteConversationsTarget');
    this.refs.deleteDialogConfirm = this.refs.deleteDialog?.querySelector('.chat-delete-confirm');
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
    this.refs.deleteAllChatsBtn?.addEventListener('click', () => this.requestConversationDeletion());
    this.refs.deleteDialog?.addEventListener('close', () => this.finishConversationDeletion());
    this.refs.clearBtn?.addEventListener('click', () => this.clearActiveConversation());
    this.refs.downloadBtn?.addEventListener('click', () => this.downloadTranscript());
    const syncLegacyComposerState = () => {
      if (!this.refs.input) return;
      this.refs.input.style.height = 'auto';
      this.refs.input.style.height = `${Math.min(this.refs.input.scrollHeight, 220)}px`;
      const maxLength = Number(this.refs.input.getAttribute('maxlength')) || 500;
      const length = this.refs.input.value.length;
      if (this.refs.counter) {
        this.refs.counter.textContent = `${length}/${maxLength} caracteres`;
        this.refs.counter.classList.toggle('limit', length >= maxLength);
      }
      if (this.refs.sendBtn && !this.sending) {
        this.refs.sendBtn.disabled = false;
        this.refs.sendBtn.removeAttribute('disabled');
      }
    };

    this.refs.sendBtn?.addEventListener('click', (event) => {
      if (!this.sending) return;
      event.preventDefault();
      event.stopPropagation();
      this.requestStopGeneration();
    });
    this.refs.form?.addEventListener('submit', (event) => this.handleSubmit(event));
    this.refs.input?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
      event.preventDefault();
      event.stopPropagation();
      if (this.sending) {
        this.requestStopGeneration();
        return;
      }
      if ((this.refs.input?.value || '').trim()) {
        if (typeof this.refs.form?.requestSubmit === 'function') this.refs.form.requestSubmit();
        else this.handleSubmit(event);
      }
    });
    this.refs.input?.addEventListener('input', syncLegacyComposerState);
    syncLegacyComposerState();
    this.refs.sampleQuestions?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-question]');
      if (!button || !this.refs.input) return;
      this.refs.input.value = button.getAttribute('data-question') || '';
      this.focusWithoutScrolling(this.refs.input);
      this.refs.input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    this.refs.conversationList?.addEventListener('click', (event) => {
      const deleteBtn = event.target.closest('[data-delete-conversation]');
      if (deleteBtn) {
        event.preventDefault();
        event.stopPropagation();
        this.requestConversationDeletion(deleteBtn.getAttribute('data-delete-conversation') || '');
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
    this.mountAIModeControl();
    this.updateContextText();
    this.updateHeaderModel();
    this.updateMenuLabels();
    this.updateConversationHeader();
    this.renderConversationList();
    this.renderMessages({ forceScroll: true });
    this.setStatus('Assistente do SiMoEns pronto para responder.', 100, false);
  }

  handleStorage(event) {
    if(event.key===STORAGE_KEYS.aiMode){this.setAIMode(event.newValue,{persist:false});return;}
    if ([STORAGE_KEYS.messages, STORAGE_KEYS.pageConversations, STORAGE_KEYS.pageActiveConversation].includes(event.key)) {
      const stored = this.loadPageShellConversationStore();
      const activeId = stored.conversations.some((item) => item.id === stored.activeId)
        ? stored.activeId : stored.conversations[0]?.id || '';
      const active = stored.conversations.find((item) => item.id === activeId);
      const messages = active ? [...active.messages] : stored.initialized ? [] : loadMessages();
      if (!messages.length) messages.push({ role: 'assistant', content: canonicalizeAssistantReply(WidgetKeywordBot.INITIAL_MESSAGE), timestamp: Date.now() });
      if (this.activeConversationId !== activeId || JSON.stringify(this.messages) !== JSON.stringify(messages)) this.invalidateConversationGeneration();
      this.conversations = stored.conversations;
      this.activeConversationId = activeId;
      this.messages = messages;
      if (active) this.restoreConversationContextFromMessages();
      else this.resetConversationContext();
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

  async ensureSearchFoundation() {
    if (this.searchFoundationPromise) return this.searchFoundationPromise;
    this.searchFoundationPromise = (async () => {
      try {
        if (!window.SiMoEnsSearchCore) await loadSharedScriptOnce(SEARCH_CORE_URL);
        const core = window.SiMoEnsSearchCore || null;
        if (!core) return null;

        if (!this.registryLoaded && !IS_LOCAL_FILE_RUNTIME) {
          try {
            const response = await fetch(CONTENT_REGISTRY_URL, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Falha ao carregar o registro (${response.status})`);
            const payload = await response.json();
            if (!payload || !Array.isArray(payload.resources)) throw new Error('Registro de conteúdo inválido.');

            const seenIds = new Set();
            payload.resources.forEach((metadata) => {
              if (!metadata || typeof metadata.id !== 'string' || seenIds.has(metadata.id)) return;
              seenIds.add(metadata.id);
              const entry = SIMOENS_SITE_MAP.find((item) => item.id === metadata.id);
              if (!entry || core.normalizePath(entry.path) !== core.normalizePath(metadata.url)) return;
              entry.registryCategory = metadata.category || '';
              entry.topics = Array.isArray(metadata.topics) ? metadata.topics.slice(0, 20) : [];
              entry.accessibilityDocument = metadata.accessibilityDocument || '';
              entry.relatedIds = Array.isArray(metadata.related) ? metadata.related.slice(0, 12) : [];
              entry.registryDescription = metadata.description || entry.summary;
            });
            this.registryLoaded = true;
            this.registryError = '';
          } catch (error) {
            this.registryError = error?.message || String(error);
          }
        }

        this.resourceSearchIndex = core.createIndex(SIMOENS_SITE_MAP.filter((entry) => entry.catalogEntry).map((entry) => ({
          ...entry,
          title: entry.title,
          category: internalResourceCategory(entry),
          topics: entry.topics || entry.keywords || [],
          source: entry.path,
          description: entry.registryDescription || entry.summary,
        })));
        return core;
      } catch (error) {
        this.registryError = error?.message || String(error);
        return null;
      }
    })();
    return this.searchFoundationPromise;
  }

  getIntent(userText) {
    const core = window.SiMoEnsSearchCore;
    if (core?.detectIntent) return core.detectIntent(userText);
    if (isCurrentExperienceQuestion(userText)) return { name: 'identify-current-experience', confidence: 0.9 };
    return { name: 'general-chemistry', confidence: 0.3 };
  }

  buildContextualQuery(userText, currentCtx) {
    const core = window.SiMoEnsSearchCore;
    const intent=core?.detectIntent?.(userText);
    const pageQuestion=['identify-current-experience','explain-interface'].includes(intent?.name)
      || /\b(?:nesta|nessa|desta|dessa|esta|essa) (?:pagina|tela|animacao|atividade|aba)\b/.test(core?.normalize(userText)||'');
    const subject=core?.extractSubject?.(userText)||'';
    if(pageQuestion)return [userText,currentCtx?.entryTitle||currentCtx?.title||'',currentCtx?.topic||''].filter(Boolean).join(' ');
    if(!subject&&core?.isContextualReference?.(userText))return this.conversationContext.subject||userText;
    // A new scientific question supplies its own subject. The open page is not evidence.
    return subject||userText;
  }

  answerResourceRecommendation(userText, currentCtx) {
    const core = window.SiMoEnsSearchCore;
    if (!core || !this.resourceSearchIndex) return '';
    const policy = core.recommendationPolicy?.(userText) || { shouldRecommend: false };
    if (!policy.shouldRecommend) return '';

    const wantedCategory = policy.category || '';
    const contextualReference = core.isContextualReference?.(userText);
    const extractedSubject = core.extractSubject?.(userText) || '';
    const rememberedSubject = contextualReference || (!extractedSubject && policy.mode === 'single')
      ? this.conversationContext.subject
      : '';
    const pageSubject = contextualReference || policy.mode === 'single' ? currentCtx?.topic || '' : '';
    const subjectQuery = extractedSubject || rememberedSubject || pageSubject;
    const contextualQuery = subjectQuery || wantedCategory || 'quimica';
    const currentEntry = findEntryByPath(currentCtx?.path || '');
    const rememberedEntry = SIMOENS_SITE_MAP.find((entry) => entry.id === this.conversationContext.resourceId);
    const relatedIds = Array.from(new Set([
      ...(currentEntry?.relatedIds || []),
      ...(rememberedEntry?.relatedIds || []),
    ]));
    const excludeIds = /\b(?:outro|outra|diferente|alternativa)\b/.test(core.normalize(userText)) && currentEntry ? [currentEntry.id] : [];
    let ranked = core.rankResources(this.resourceSearchIndex, contextualQuery, {
      limit: 32,
      minScore: 0.35,
      category: wantedCategory,
      relatedIds,
      excludeIds,
      currentPath: currentEntry?.path || '',
      contextText: this.conversationContext.subject || currentCtx?.topic || '',
      minCoverage: subjectQuery ? 0.34 : undefined,
    });

    const entries = ranked.slice(0, policy.maxResults || 1).map((result) => result.item);
    this.pendingRecommendations = entries;
    const labels = {
      exercise: ['exercício', 'exercícios'],
      guide: ['guia', 'guias'],
      animation: ['animação ou visualizador', 'animações ou visualizadores'],
      game: ['jogo', 'jogos'],
    };
    const [singularLabel, pluralLabel] = labels[wantedCategory] || ['recurso', 'recursos'];

    if (!entries.length) {
      const subjectText = subjectQuery ? ` sobre **${subjectQuery}**` : '';
      return `Não encontrei ${singularLabel} cadastrado no SiMoEns${subjectText}. Não vou inventar um recurso; posso procurar outro tipo de material ou ajudar com uma explicação do conceito.`;
    }

    if (entries.length === 1) {
      const entry = entries[0];
      if (policy.mode === 'list') {
        return `Encontrei apenas um ${singularLabel} com relação direta com o assunto: **${entry.title}**. ${entry.registryDescription || entry.summary}\n\n[Abrir ${singularLabel}](${entryUrl(entry)})`;
      }
      return `Para esse objetivo, eu indicaria **${entry.title}**. ${entry.registryDescription || entry.summary}\n\n[Abrir ${singularLabel}](${entryUrl(entry)})`;
    }

    return `Encontrei estas ${pluralLabel} no SiMoEns:\n\n${entries.map((entry, index) => `${index + 1}. **${entry.title}** — ${entry.registryDescription || entry.summary}\n   [Abrir recurso](${entryUrl(entry)})`).join('\n')}`;
  }

  answerRecommendationFollowup(userText) {
    const core = window.SiMoEnsSearchCore;
    const recommendationIds = Array.isArray(this.conversationContext.recommendationIds)
      ? this.conversationContext.recommendationIds
      : [];
    if (!core || !recommendationIds.length) return '';
    const text = core.normalize(userText);
    const ordinal = core.resolveSelectionOrdinal?.(text) ?? core.resolveOrdinal?.(text) ?? -1;
    const explicitPreviousReference = /\b(?:essa|esta|a) opcao\b|\b(?:o|esse|este) recurso\b|\b(?:manda|mande|passa|passe) (?:o )?link\b/.test(text);
    const singleRecommendationReference = recommendationIds.length === 1
      && /^(?:abra|abrir|acesse|acessar|link|qual o link|qual e o link|manda o link|mande o link)$/.test(text);
    const asksForPreviousOption = ordinal >= 0 || explicitPreviousReference || singleRecommendationReference;
    if (!asksForPreviousOption) return '';

    let index = ordinal;
    if (index < 0 && recommendationIds.length === 1) index = 0;
    if (index < 0) return 'Qual opção você quer abrir: a primeira, a segunda ou a terceira?';
    const selectedId = recommendationIds[index];
    const entry = SIMOENS_SITE_MAP.find((item) => item.id === selectedId);
    if (!entry) return 'Essa opção não está mais disponível no registro atual. Posso fazer uma nova busca.';

    this.pendingRecommendations = recommendationIds
      .map((id) => SIMOENS_SITE_MAP.find((item) => item.id === id))
      .filter(Boolean);
    return `A ${index + 1}ª opção é **${entry.title}**.\n\n[Abrir recurso](${entryUrl(entry)})`;
  }

  async answerClarificationFollowup(userText, currentCtx, intent) {
    if (!['clarify-previous','summarize'].includes(intent?.name)) return '';
    const core = window.SiMoEnsSearchCore;
    if(core?.extractSubject?.(userText)&&intent.mode!=='verify')return '';
    const previous=[...this.messages].reverse().find(message=>message.role==='assistant');
    const sourceIds=previous?.meta?.sourceIds||WidgetKeywordBot.getSourcesForReply(previous?.content||'');
    if(!previous||!sourceIds.length||previous.meta?.replyKind==='limitation'){
      this.replyKind='limitation';
      return previous && !looksLikeWelcomeAssistantMessage(previous.content)
        ? 'A resposta anterior não trouxe uma explicação científica suficiente para reformular. Envie o conceito ou o trecho que você quer explicar ou resumir.'
        : 'Qual assunto, resposta ou trecho você quer que eu reformule?';
    }
    const mode=intent.name==='summarize'?'summary':intent.mode&&intent.mode!=='none'?intent.mode:'deepen';
    const base=previous.meta?.canonicalBase||previous.meta?.reviewedText||previous.content;
    this.replySourceIds=sourceIds.slice();
    if(previous.meta?.replyKind==='calculation')this.replyKind='calculation';
    this.replyCanonicalBase=base;
    this.replyStyle={mode,sentenceCount:requestedSentenceCount(userText)};
    const revised=WidgetKeywordBot.getReplyEdition(base,mode,this.replyStyle.sentenceCount);
    if(revised.startsWith('**Exemplo adicional indisponível**'))this.replyKind='limitation';
    return revised;
  }

  async answerInterfaceQuestion(userText, currentCtx) {
    const entry = findEntryByPath(currentCtx?.path || '');
    const contextualQuery = [userText, 'instruções controles como usar', entry?.title || currentCtx?.title || ''].filter(Boolean).join(' ');
    const documentReply = await this.answerFromLocalDocuments(contextualQuery, currentCtx, { allowFallback: true });
    if (documentReply) return documentReply;
    if (entry) {
      return `Você está em **${entry.title}**, mas não encontrei uma instrução específica e confiável para esse controle. Diga o nome visível do botão, menu ou campo que deseja usar.`;
    }
    return 'Diga o nome visível do botão, menu ou controle e, se possível, a experiência do SiMoEns em que ele aparece.';
  }

  updateConversationContext(userText, currentCtx, matches = [], intent = null) {
    const core = window.SiMoEnsSearchCore;
    const contextual = core?.isContextualReference?.(userText);
    const inScope = core?.isLikelyInScope?.(userText) !== false;
    const detectedSubject = core?.extractSubject?.(userText) || '';
    const ignoredIntents = new Set(['greeting', 'acknowledgement', 'help', 'accessibility-help']);
    if(this.replyKind==='limitation')return;
    if (inScope && !contextual && detectedSubject.length >= 3 && !ignoredIntents.has(intent?.name)) {
      this.conversationContext.subject = detectedSubject.slice(0, 320);
    }

    const explicitResource = matchSiteEntries(userText)[0] || null;
    const currentResource = findEntryByPath(currentCtx?.path || '');
    if (explicitResource) this.conversationContext.resourceId = explicitResource.id;
    else if (currentResource?.catalogEntry) this.conversationContext.resourceId = currentResource.id;
    else if (inScope && !contextual && detectedSubject) this.conversationContext.resourceId = '';

    if (this.pendingRecommendations.length) {
      this.conversationContext.recommendationIds = this.pendingRecommendations.map((entry) => entry.id).slice(0, 3);
      this.conversationContext.resourceId = this.pendingRecommendations[0]?.id || this.conversationContext.resourceId;
    } else if (inScope && !contextual && !ignoredIntents.has(intent?.name) && intent?.name !== 'navigation-help') {
      this.conversationContext.recommendationIds = [];
    }
    this.conversationContext.lastIntent = intent?.name || '';

    const sources = Array.from(new Set((matches || []).map((item) => item.source).filter(Boolean))).slice(0, 5);
    if (sources.length) this.conversationContext.documentSources = sources;
    else if (inScope && !contextual && detectedSubject) this.conversationContext.documentSources = [];
    saveConversationContext(this.conversationContext);
  }

  async ensureWebLLM() {
    if (!WEBLLM_ENABLED) throw new Error('WebLLM não foi habilitado pelo host.');
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
    return this.buildContextualQuery(userText, currentCtx);
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
    if (!chunks.length) return { promptText: '', matches: [], confidence: 'none', coverage: 0, topScore: 0 };

    const core = await this.ensureSearchFoundation();
    const expandedQuery = this.buildDocumentQueryText(userText, currentCtx);
    const currentEntry = findEntryByPath(currentCtx?.path || '');
    let ranked = [];

    if (core?.createIndex && core?.search) {
      if (!this.documentSearchIndex) this.documentSearchIndex = core.createIndex(chunks);
      const intent=core.detectIntent(userText);
      const contextualRetrieval=['identify-current-experience','explain-interface'].includes(intent.name)
        || (!core.extractSubject(userText)&&core.isContextualReference(userText));
      const relatedSources = contextualRetrieval ? [
        currentEntry?.accessibilityDocument || '',
        ...(this.conversationContext.documentSources || []),
      ].filter(Boolean) : [];
      ranked = core.search(this.documentSearchIndex, expandedQuery, {
        limit: DOC_RAG_MAX_CHUNKS,
        minScore: 0.35,
        relatedSources,
        contextText: contextualRetrieval ? `${currentCtx?.topic || ''} ${this.conversationContext.subject || ''}` : '',
      }).map((result) => ({ ...result.item, score: result.score }));
    }

    if (!ranked.length && !core?.search) {
      const queryText = normalize(String(userText || '').trim());
      const queryTokens = collectMeaningfulTokens(expandedQuery).slice(0, 28);
      const exactNeedles = Array.from(new Set([
        queryText,
        normalize(currentCtx?.topic || ''),
        normalize(currentCtx?.title || ''),
        normalize(currentCtx?.heading || ''),
      ].filter((item) => item && item.length >= 4)));
      ranked = chunks
        .map((chunk) => ({
          ...chunk,
          score: this.scoreDocumentChunk(chunk, queryTokens, queryText, exactNeedles),
        }))
        .filter((chunk) => chunk.score >= DOC_RAG_MIN_SCORE)
        .sort((a, b) => b.score - a.score || a.chunk_index - b.chunk_index)
        .slice(0, DOC_RAG_MAX_CHUNKS);
    }

    if (!ranked.length) return { promptText: '', matches: [], confidence: 'none', coverage: 0, topScore: 0 };

    const confidenceInput = [
      core?.extractSubject?.(userText) || userText,
      core?.isContextualReference?.(userText) ? this.conversationContext.subject : '',
    ].filter(Boolean).join(' ');
    const confidenceResult = core?.evaluateRetrievalConfidence?.(confidenceInput, ranked) || {
      confidence: 'low',
      coverage: 0,
      topScore: Number(ranked[0]?.score || 0),
    };
    const { confidence, coverage, topScore } = confidenceResult;

    const promptText = ranked
      .map((chunk) => `[Arquivo: ${chunk.file_name}${chunk.page ? ` | Página: ${chunk.page}` : ''}] ${compactDocumentText(chunk.text, DOC_RAG_MAX_CHARS)}`)
      .join('\n\n');

    this.logTrace('doc-rag:matches', {
      query: userText,
      confidence,
      coverage: Number(coverage.toFixed(2)),
      matches: ranked.map((chunk) => ({ file_name: chunk.file_name, page: chunk.page, score: Number(chunk.score.toFixed(2)) })),
    });

    return { promptText, matches: ranked, confidence, coverage, topScore };
  }

  async answerFromLocalDocuments(userText, currentCtx, options = {}) {
    const { matches, confidence, coverage } = await this.retrieveDocumentContext(userText, currentCtx);
    if (!matches.length || confidence === 'low' || confidence === 'none') return '';
    const core=window.SiMoEnsSearchCore;
    const interfaceQuestion=['explain-interface','identify-current-experience'].includes(core?.detectIntent?.(userText)?.name);
    if(!interfaceQuestion && coverage<0.65)return '';

    const asksSummary = /\b(resuma|resumo|resumir|sintetize|síntese|sintese|em poucas palavras|pontos principais|sobre o que fala|o que esse conte[uú]do mostra)\b/i.test(userText);
    if (!asksSummary && !options.allowFallback) return '';

    const selected = [];
    const seen = new Set();
    for (const match of matches) {
      if(!interfaceQuestion && /narr[aã][cç][aã]o sugerida|o modo narrador deve|a tela .*tr[eê]s regi[oõ]es|texto acess[ií]vel sugerido|descri[cç][aã]o acess[ií]vel|observa[cç][oõ]es para implementa[cç][aã]o|orienta[cç][aã]o inclusiva|feedback (?:deve|acess[ií]vel)/i.test(match.text))continue;
      const key = `${match.file_name}:${match.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      selected.push(match);
      if (selected.length >= (asksSummary ? 3 : 2)) break;
    }
    if (!selected.length) return '';
    this.lastDocumentMatches=selected;

    const intro = asksSummary
      ? '**Resumo baseado nos materiais locais do SiMoEns:**'
      : '**Encontrei esta explicação nos materiais locais do SiMoEns:**';
    const body = selected.map((item) => `- ${compactDocumentText(item.text, 520)}`).join('\n');
    const sources = Array.from(new Set(selected.map((item) => item.file_name).filter(Boolean)));
    return `${intro}\n${body}\n\n**Fonte${sources.length > 1 ? 's' : ''}:** ${sources.join('; ')}.`;
  }

  async ensureEngine(options = {}) {
    if (!WEBLLM_ENABLED) return null;
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


  async loadGroqConfig() {
    if (IS_LOCAL_FILE_RUNTIME) { this.groqConfigState = 'local-file'; return null; }
    if (!this.groqConfigPromise) this.groqConfigPromise = (async () => {
      const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 8000);
      this.groqConfigState = 'loading';
      try {
        const response = await fetch(new URL('groq-config.json?v=20261025-groq-r5', WIDGET_SCRIPT_SRC), { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('configuration-unavailable');
        const config = await response.json();
        if (config.enabled !== true) { this.groqConfigState = 'disabled'; return null; }
        if (typeof config.endpoint !== 'string' || !config.endpoint) { this.groqConfigState = 'invalid-configuration'; return null; }
        const endpoint = new URL(config.endpoint);
        if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || endpoint.pathname !== '/refine') { this.groqConfigState = 'invalid-configuration'; return null; }
        this.groqConfigState = 'enabled';
        return { endpoint: endpoint.href };
      } catch {
        this.groqConfigState = 'configuration-error';
        return null;
      } finally { clearTimeout(timer); }
    })();
    const config = await this.groqConfigPromise;
    // A transient configuration fetch failure may be retried on the next message.
    if (this.groqConfigState === 'configuration-error') this.groqConfigPromise = null;
    return config;
  }

  async refineSharedReplyWithGroq(userText, baseText, currentCtx, style = {}) {
    this.groqLastAttempt = { state: 'loading-configuration', requestSent: false };
    if(this.aiMode==='off'){this.groqLastAttempt.state='user-disabled';return null;}
    const revision=this.aiModeRevision;
    const config = await this.loadGroqConfig();
    if (!config) { this.groqLastAttempt.state = this.groqConfigState || 'disabled'; this.logTrace('groq:skipped', this.groqLastAttempt); return null; }
    if(this.aiMode==='off'||revision!==this.aiModeRevision){this.groqLastAttempt.state=this.aiMode==='off'?'user-disabled':'mode-changed';return null;}
    if (this.stopRequested || baseText.length > 7000 || userText.length > 1200) {
      this.groqLastAttempt.state = this.stopRequested ? 'cancelled' : 'size-limit'; return null;
    }
    const controller = new AbortController();
    this.groqController = controller;
    const timer = setTimeout(() => controller.abort(), 35000);
    this.groqLastAttempt = { state: 'requesting', requestSent: true, startedAt: Date.now() };
    this.setStatus('Aprimorando a explicação com IA...', 70, true);
    this.logTrace('groq:requesting', { state: 'requesting' });
    try {
      const history = this.messages.filter(m => ['user', 'assistant'].includes(m.role))
        .slice(0, -1).slice(-4).map(m => ({ role: m.role, content: String(m.content || '').slice(0, 1000) }));
      const response = await fetch(config.endpoint, {
        method: 'POST', credentials: 'omit', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userText, base: baseText,
          context: String(getCurrentContextText(this.pageContext, this.frameContext) || currentCtx?.summary || '').slice(0, 2500), history,
          style: { mode: ['simplify','academic','summary','repeat','example','deepen'].includes(style.mode) ? style.mode : 'default', sentenceCount: style.mode==='summary'?Math.max(1,Math.min(8,style.sentenceCount||3)):0 } }),
      });
      this.groqLastAttempt.httpStatus = response.status;
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        this.groqLastAttempt.state = failure.error === 'provider_timeout' ? 'timeout' : 'http-error';
        this.logTrace('groq:fallback', { state: this.groqLastAttempt.state, status: response.status }); return null;
      }
      const result = await response.json();
      if(this.aiMode==='off'||revision!==this.aiModeRevision){this.groqLastAttempt.state=this.aiMode==='off'?'user-disabled':'mode-changed';return null;}
      if (this.stopRequested) { this.groqLastAttempt.state = 'cancelled'; return null; }
      if (typeof result.text !== 'string') { this.groqLastAttempt.state = 'invalid-response'; return null; }
      const text = sanitizeRefinedReply(result.text, baseText);
      const baseUrls = new Set(baseText.match(/https?:\/\/[^\s<>\)\]]+/g) || []);
      const urls = text.match(/https?:\/\/[^\s<>\)\]]+/g) || [];
      const validationIssues = [];
      if (!text) validationIssues.push('empty-response');
      if (looksCorrupted(text)) validationIssues.push('corrupted-response');
      if (text.length > Math.max(baseText.length * 2.1, baseText.length + 700)) validationIssues.push('length-limit');
      if (!sharesEnoughMeaning(baseText, text)) validationIssues.push('insufficient-overlap');
      const scientificDifferences = scientificDetailDifferences(baseText, text);
      if (scientificDifferences.addedNumbers.length || scientificDifferences.missingNumbers.length) validationIssues.push('changed-numbers');
      if (scientificDifferences.addedFormulas.length || scientificDifferences.missingFormulas.length) validationIssues.push('changed-formulas');
      validationIssues.push(...scientificClaimIssues(baseText,text));
      if(style.mode==='summary' && countReplySentences(text)!==(style.sentenceCount||3))validationIssues.push('sentence-count');
      if (!generatedReplyUsesOnlyKnownResources(text) || urls.some(url => !baseUrls.has(url))) validationIssues.push('unrecognized-link');
      if (looksLikeModelRefusal(text)) validationIssues.push('model-refusal');
      if (validationIssues.length) {
        this.groqLastAttempt.state = 'validation-rejected';
        this.groqLastAttempt.validationIssues = validationIssues;
        this.logTrace('groq:fallback', { state: 'validation-rejected', validationIssues }); return null;
      }
      this.groqLastAttempt.state = 'applied';
      this.logTrace('groq:refined', { state: 'applied', applied: true });
      return text;
    } catch {
      this.groqLastAttempt.state = this.aiMode==='off' ? 'user-disabled' : revision!==this.aiModeRevision ? 'mode-changed' : this.stopRequested ? 'cancelled' : controller.signal.aborted ? 'timeout' : 'network-error';
      this.logTrace('groq:fallback', { state: this.groqLastAttempt.state }); return null;
    } finally {
      clearTimeout(timer);
      this.groqLastAttempt.durationMs = Date.now() - this.groqLastAttempt.startedAt;
      if (this.groqController === controller) this.groqController = null;
    }
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
    if(this.aiMode==='off')return {usedLLM:false,text:baseText,reason:'user-disabled'};
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
    if (!this.embeddedMode) {
      host.style.position = 'fixed';
      host.style.right = '0';
      host.style.bottom = '0';
      host.style.width = '0';
      host.style.height = '0';
      host.style.overflow = 'visible';
      host.style.zIndex = '2147483000';
    }
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
          right: 0;
          bottom: 20px;
          width: 22px;
          height: 64px;
          z-index: 2147483000;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          line-height: 1.4;
          color: #101010;
          overflow: visible;
        }
        .sw-toggle {
          position: absolute;
          right: -50px;
          bottom: 0;
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
          transition: right .24s cubic-bezier(.2,.8,.2,1), transform .18s ease;
        }
        .sw-root:hover .sw-toggle,
        .sw-toggle:focus-visible,
        .sw-root.is-chat-open .sw-toggle {
          right: 20px;
        }
        .sw-toggle:hover { transform: translateY(-2px); }
        .sw-toggle:active { transform: scale(.98); }
        .sw-toggle svg { width: 64px; height: 64px; display: block; }

        .sw-panel {
          position: absolute;
          right: 20px;
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
        .sw-spoiler {
          display: inline-block;
          border: 0;
          border-radius: 8px;
          padding: 2px 8px;
          background: #d6d8de;
          color: transparent;
          cursor: pointer;
          user-select: none;
          transition: background-color .2s ease, color .2s ease;
          font: inherit;
        }
        .sw-spoiler.is-revealed {
          background: #eceef3;
          color: inherit;
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
          .sw-root { right: 0; bottom: 10px; width: 12px; height: 58px; }
          .sw-toggle { right: -46px; }
          .sw-root:hover .sw-toggle,
          .sw-toggle:focus-visible,
          .sw-root.is-chat-open .sw-toggle { right: 10px; }
          .sw-toggle, .sw-toggle svg { width: 58px; height: 58px; }
          .sw-panel {
            right: 10px;
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
        <div class="sw-panel" id="panel" role="${this.embeddedMode ? 'region' : 'dialog'}" aria-labelledby="sw-panel-title" aria-busy="false">
          <div class="sw-header">
            <h2 class="sw-title" id="sw-panel-title">${this.escapeHtml(panelTitle)}</h2>
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

          <div class="sw-messages" id="messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Mensagens da conversa"></div>

          <form class="sw-form" id="form">
            <div class="sw-inputwrap">
              <textarea class="sw-input" id="input" rows="1" aria-label="Pergunta para o Assistente do SiMoEns" placeholder="Digite sua pergunta de Química ou sobre o SiMoEns..."></textarea>
              <button class="sw-send" id="sendBtn" type="submit" aria-label="Enviar">↑</button>
            </div>            <div class="sw-footer">Memória persistente ativa neste navegador.</div>
          </form>
        </div>

        ${this.runtimeConfig.hideToggle ? '' : `<button class="sw-toggle" id="toggleBtn" type="button" aria-label="Abrir chat" aria-controls="panel" aria-expanded="false">${ICON_SVG}</button>`}
      </div>
    `;
    this.root = shadow;
    this.refs.floatingRoot = shadow.querySelector('.sw-root');
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
    this.mountAIModeControl();

    this.refs.toggleBtn?.addEventListener('click', () => this.setOpen(!this.isOpen(), true));
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
      if (event.target.closest('button,select,label,summary')) return;
      focusInput();
    });

    shadow.addEventListener('click', (event) => {
      const spoiler = event.target.closest?.('.sw-spoiler');
      if (spoiler) {
        spoiler.classList.add('is-revealed');
        spoiler.setAttribute('aria-pressed', 'true');
        spoiler.setAttribute('aria-label', 'Resposta revelada');
      }
      if (!this.isMenuOpen()) return;
      const path = event.composedPath();
      if (path.includes(this.refs.menuBtn) || path.includes(this.refs.menu)) return;
      this.closeMenu();
    });

    this.refs.panel.addEventListener('keydown', (event) => {
      if(event.target.closest?.('.sw-ai-settings'))return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (this.isMenuOpen()) {
          this.closeMenu();
          this.refs.menuBtn?.focus();
        } else if (!this.embeddedMode) {
          this.setOpen(false, true);
        }
        return;
      }
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

    this.refs.menu.addEventListener('keydown', (event) => {
      const items = Array.from(this.refs.menu.querySelectorAll('[role="menuitem"]:not([disabled])'));
      if (!items.length) return;
      const currentIndex = Math.max(0, items.indexOf(event.target));
      let nextIndex = currentIndex;
      if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length;
      else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = items.length - 1;
      else if (event.key === 'Escape') {
        event.preventDefault();
        this.closeMenu();
        this.refs.menuBtn.focus();
        return;
      } else return;
      event.preventDefault();
      items[nextIndex].focus();
    });

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
    this.renderMessages({ forceScroll: true });
    this.setStatus('Assistente do SiMoEns pronto para responder.', 100, false);
    this.setOpen(this.embeddedMode ? true : getStoredOpen(), false);
  }



  updateSendButtonState() {
    if (!this.refs.sendBtn) return;
    const isStopping = this.sending === true;
    this.refs.sendBtn.disabled = false;
    this.refs.sendBtn.removeAttribute('disabled');
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
    this.groqController?.abort();
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
    return this.aiMode==='on';
  }

  setAIMode(value,{persist=true}={}){
    const mode=normalizeAIMode(value),changed=mode!==this.aiMode;
    this.aiMode=mode;
    if(changed)this.aiModeRevision++;
    if(persist){try{localStorage.setItem(STORAGE_KEYS.aiMode,mode);}catch{}}
    if(changed&&mode==='off'){
      this.groqController?.abort();
      try{this.engine?.interruptGenerate?.();}catch{}
    }
    this.updateAIModeControl();
  }

  mountAIModeControl(){
    if(!this.refs.form||this.refs.aiMode)return;
    const box=document.createElement('div');box.className='sw-ai-settings';
    box.innerHTML='<div class="sw-ai-row"><label for="simoens-ai-mode">Aprimoramento da IA</label><select id="simoens-ai-mode" aria-describedby="simoens-ai-mode-help"><option value="auto">Automático</option><option value="on">Ligado</option><option value="off">Desligado</option></select></div><p id="simoens-ai-mode-help" class="sw-ai-help"></p>';
    this.refs.form.prepend(box);
    this.refs.aiMode=box.querySelector('select');this.refs.aiModeHelp=box.querySelector('.sw-ai-help');
    this.refs.aiMode.addEventListener('change',()=>this.setAIMode(this.refs.aiMode.value));
    this.refs.aiMode.addEventListener('keydown',event=>{if(['Enter',' ','ArrowDown','ArrowUp','Home','End'].includes(event.key))event.stopPropagation();});
    this.updateAIModeControl();
  }

  updateAIModeControl(){
    if(this.refs.aiMode)this.refs.aiMode.value=normalizeAIMode(this.aiMode);
    if(this.refs.aiModeHelp)this.refs.aiModeHelp.textContent={
      auto:'O chat decide quando aprimorar uma explicação.',
      on:'Solicita IA nas explicações com base suficiente; o texto passa pela validação.',
      off:'Usa apenas a base local, sem solicitar IA.'
    }[normalizeAIMode(this.aiMode)];
  }

  updateMenuLabels() {
  }

  logTrace(event = '', details = {}) {
    if (!String(event).startsWith('groq:')) return;
    // Diagnostics contain connection state only, never messages, keys or user content.
    const entry = { event, state: String(details.state || ''), status: Number(details.status) || null, at: Date.now() };
    if(AI_MODES.includes(details.mode))entry.mode=details.mode;
    if(['user-disabled','cancelled','fixed-practice','fixed-information','fixed-calculation','insufficient-base','size-limit','local-sufficient','requested-on','automatic-explanation'].includes(details.reason))entry.reason=details.reason;
    if (Array.isArray(details.validationIssues)) entry.validationIssues = details.validationIssues.filter(value => ['empty-response', 'corrupted-response', 'length-limit', 'insufficient-overlap', 'changed-numbers', 'changed-formulas', 'unrecognized-link', 'model-refusal','unsupported-cell-claim','unsupported-potential-claim','unsupported-calibration-claim','unsupported-chelate-claim','unsupported-magnetism-claim','unsupported-quantum-claim','unsupported-boiling-claim','sentence-count'].includes(value));
    window.SimoensGroqDiagnostics = window.SimoensGroqDiagnostics || { events: [] };
    const log = window.SimoensGroqDiagnostics;
    log.events.push(entry); if (log.events.length > 30) log.events.shift(); log.last = entry;
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

  isOpen() {
    return !!(this.refs.panel && this.refs.panel.classList.contains('is-open'));
  }

  syncFloatingWidgetState(shouldOpen) {
    if (this.embeddedMode) {
      document.documentElement.classList.remove('simoens-chat-widget-open');
      return;
    }
    document.documentElement.classList.toggle('simoens-chat-widget-open', !!shouldOpen);
    if (this.refs.floatingRoot) {
      this.refs.floatingRoot.classList.toggle('is-chat-open', !!shouldOpen);
    }
    if (this.refs.toggleBtn) {
      this.refs.toggleBtn.setAttribute('aria-label', shouldOpen ? 'Fechar chat' : 'Abrir chat');
      this.refs.toggleBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      this.refs.toggleBtn.title = shouldOpen ? 'Fechar chat' : 'Abrir chat';
    }
    var accessibilityWidget = document.getElementById('simoens-a11y-widget');
    if (accessibilityWidget) {
      if (shouldOpen) accessibilityWidget.setAttribute('aria-hidden', 'true');
      else accessibilityWidget.removeAttribute('aria-hidden');
    }
    document.dispatchEvent(new CustomEvent('simoens:chat-widget-state', { detail: { open: !!shouldOpen } }));
  }

  setOpen(isOpen, persist = true) {
    if (!this.refs.panel) return;
    const wasOpen = this.isOpen();
    const shouldOpen = this.embeddedMode ? true : Boolean(isOpen);
    this.refs.panel.classList.toggle('is-open', shouldOpen);
    this.refs.panel.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    this.refs.panel.inert = !shouldOpen;
    this.syncFloatingWidgetState(shouldOpen);
    if (persist) setStoredOpen(shouldOpen);
    if (!shouldOpen) {
      this.closeMenu();
      if (wasOpen && this.refs.toggleBtn) requestAnimationFrame(() => this.refs.toggleBtn.focus());
    }
    if (shouldOpen) {
      requestAnimationFrame(() => {
        this.refs.input?.focus();
        const len = this.refs.input?.value?.length ?? 0;
        this.refs.input?.setSelectionRange?.(len, len);
      });
      this.scrollMessages(true);
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
    if (shouldOpen) {
      requestAnimationFrame(() => this.refs.menu.querySelector('[role="menuitem"]:not([disabled])')?.focus());
    }
  }

  closeMenu() {
    this.toggleMenu(false);
  }

  resetConversationContext() {
    WidgetKeywordBot.resetTopicMemory();
    this.conversationContext = { subject: '', resourceId: '', documentSources: [], recommendationIds: [], lastIntent: '' };
    this.pendingRecommendations = [];
    saveConversationContext(this.conversationContext);
  }

  restoreConversationContextFromMessages() {
    this.resetConversationContext();
    const core = window.SiMoEnsSearchCore;
    const recentUserMessage = [...this.messages].reverse().find((item) => item?.role === 'user' && item.content && !core?.isContextualReference?.(item.content));
    const subject = core?.extractSubject?.(recentUserMessage?.content || '') || '';
    if (subject) this.conversationContext.subject = subject.slice(0, 320);
    if (recentUserMessage?.content) WidgetKeywordBot.rememberTopicContext(recentUserMessage.content);
    const resource = recentUserMessage ? matchSiteEntries(recentUserMessage.content)[0] : null;
    if (resource) this.conversationContext.resourceId = resource.id;
    const recentRecommendation = [...this.messages].reverse().find((item) => item?.role === 'assistant' && Array.isArray(item.meta?.recommendationIds));
    if (recentRecommendation) {
      this.conversationContext.recommendationIds = recentRecommendation.meta.recommendationIds
        .filter((id) => SIMOENS_SITE_MAP.some((entry) => entry.id === id))
        .slice(0, 3);
    }
    saveConversationContext(this.conversationContext);
  }

  startNewChat() {
    this.closeMenu();
    if (this.legacyPageShell) this.createNewPageConversation();
    else this.createNewSharedConversation();
    this.setOpen(true, true);
    this.setStatus('Nova conversa iniciada. Assistente local pronto.', 100, false);
    requestAnimationFrame(() => this.focusWithoutScrolling(this.refs.input));
  }

  refreshChatPanel() {
    this.closeMenu();
    this.pageContext = collectPageContext();
    localStorage.setItem(STORAGE_KEYS.page, JSON.stringify(this.pageContext));
    this.frameContext = safeParse(localStorage.getItem(STORAGE_KEYS.frame), this.frameContext);
    this.updateContextText();
    this.updateHeaderModel();
    this.renderMessages();
    this.setStatus('Painel atualizado. Assistente local pronto.', 100, false);
  }

  downloadTranscript() {
    this.closeMenu();
    const ctx = getCurrentContextText(this.pageContext, this.frameContext);
    const lines = [
      'Transcrição do chat SiMoEns',
      `URL do site: ${SITE_URL}`,
      `Contexto atual: ${ctx || 'indisponível'}`,
      'Revisão do assistente: R10',
      '',
    ];

    for (const item of this.messages) {
      const who = item.role === 'user' ? 'Você' : 'Assistente';
      lines.push(`${who}: ${item.content}`);
      if(item.role==='assistant' && item.meta?.groqStatus){
        const status=item.meta.groqStatus;
        lines.push(`Aprimoramento: ${status==='applied'?'Texto aprimorado com IA.':status==='not-needed'?'Resposta local; aprimoramento não solicitado.':status==='validation-rejected'?'Resposta da base revisada; reformulação da IA recusada na validação.':'Resposta local; IA não aplicada ('+status+').'}`);
        if(AI_MODES.includes(item.meta.aiMode))lines.push('Modo da IA nesta resposta: '+{auto:'Automático',on:'Ligado',off:'Desligado'}[item.meta.aiMode]);
      }
      for (const id of item.meta?.sourceIds || []) { const ref = SCIENTIFIC_REFERENCES[id]; if (ref) lines.push(`Referência: ${ref.title}. ${ref.publisher}. ${ref.url}`); }
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
    if (this.refs.panel) this.refs.panel.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (this.legacyPageShell) {
      if (this.refs.progressLabel) this.refs.progressLabel.textContent = text || 'Assistente do SiMoEns';
      if (this.refs.progressNote) {
        this.refs.progressNote.textContent = 'Explicações da base revisada, com aprimoramento por IA quando disponível. Seu histórico fica salvo neste navegador.';
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


  getMessagesScrollTarget() {
    return this.legacyPageShell ? (this.refs.messagesWrap || this.refs.messages) : this.refs.messages;
  }

  getMessagesBottomDistance(target = this.getMessagesScrollTarget()) {
    if (!target) return 0;
    return Math.max(0, target.scrollHeight - target.clientHeight - target.scrollTop);
  }

  isMessagesNearBottom(target = this.getMessagesScrollTarget(), tolerance = 12) {
    return this.getMessagesBottomDistance(target) <= tolerance;
  }

  lockMessageAutoScroll() {
    this.messageUserScrollLocked = true;
    this.messageAutoScrollEnabled = false;
  }

  unlockMessageAutoScroll() {
    this.messageUserScrollLocked = false;
    this.messageAutoScrollEnabled = true;
  }

  focusWithoutScrolling(element) {
    if (!element || typeof element.focus !== 'function') return;
    const target = this.getMessagesScrollTarget();
    const savedMessageScrollTop = target?.scrollTop ?? 0;
    const savedWindowX = window.scrollX;
    const savedWindowY = window.scrollY;

    try {
      element.focus({ preventScroll: true });
    } catch {
      element.focus();
      if (target) target.scrollTop = savedMessageScrollTop;
      window.scrollTo(savedWindowX, savedWindowY);
    }
  }

  bindMessageScrollTracking() {
    const target = this.getMessagesScrollTarget();
    if (!target || this.messageScrollBindingTarget === target) return;
    this.messageScrollBindingTarget = target;
    this.messageLastScrollTop = target.scrollTop;

    target.addEventListener('wheel', (event) => {
      event.stopPropagation();
      if (event.deltaY < 0) {
        this.lockMessageAutoScroll();
      } else if (event.deltaY > 0 && this.getMessagesBottomDistance(target) <= 2) {
        this.unlockMessageAutoScroll();
      }
    }, { passive: true });

    target.addEventListener('touchstart', (event) => {
      this.messageTouchStartY = event.touches?.[0]?.clientY ?? null;
      this.messageLastScrollTop = target.scrollTop;
    }, { passive: true });

    target.addEventListener('touchmove', (event) => {
      event.stopPropagation();
      const currentY = event.touches?.[0]?.clientY ?? null;
      if (currentY !== null && this.messageTouchStartY !== null) {
        if (currentY > this.messageTouchStartY + 2) {
          this.lockMessageAutoScroll();
        } else if (currentY < this.messageTouchStartY - 2 && this.getMessagesBottomDistance(target) <= 2) {
          this.unlockMessageAutoScroll();
        }
      }
      this.messageTouchStartY = currentY;
    }, { passive: true });

    target.addEventListener('touchend', () => {
      this.messageTouchStartY = null;
    }, { passive: true });

    target.addEventListener('scroll', () => {
      const currentScrollTop = target.scrollTop;
      if (this.messageScrollProgrammatic) {
        this.messageLastScrollTop = currentScrollTop;
        return;
      }

      if (currentScrollTop < this.messageLastScrollTop - 0.5) {
        this.lockMessageAutoScroll();
      } else if (currentScrollTop > this.messageLastScrollTop + 0.5 && this.getMessagesBottomDistance(target) <= 2) {
        this.unlockMessageAutoScroll();
      }

      this.messageLastScrollTop = currentScrollTop;
    }, { passive: true });
  }

  renderMessages(options = {}) {
    if (!this.refs.messages) return;
    const surface = this.refs.messages.getRootNode();
    if (!surface.querySelector('#simoens-chat-reading-style')) {
      const style = document.createElement('style'); style.id = 'simoens-chat-reading-style'; style.textContent = CHAT_READING_STYLES + GROQ_STATUS_STYLES + AI_MODE_STYLES + CONVERSATION_DELETE_STYLES;
      (surface === document ? document.head : surface).appendChild(style);
    }
    this.bindMessageScrollTracking();

    const target = this.getMessagesScrollTarget();
    const forceScroll = options.forceScroll === true;
    const previousScrollTop = target?.scrollTop ?? 0;
    const previousWindowX = window.scrollX;
    const previousWindowY = window.scrollY;
    const shouldAutoScroll = forceScroll || (
      !this.messageUserScrollLocked &&
      this.messageAutoScrollEnabled &&
      this.isMessagesNearBottom(target)
    );

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
    } else {
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
    }

    if (shouldAutoScroll) {
      this.scrollMessages(true);
      return;
    }

    this.lockMessageAutoScroll();
    if (target) {
      target.scrollTop = previousScrollTop;
      this.messageLastScrollTop = previousScrollTop;
    }
    window.scrollTo(previousWindowX, previousWindowY);

    cancelAnimationFrame(this.messageScrollRestoreFrame);
    this.messageScrollRestoreFrame = requestAnimationFrame(() => {
      if (target) {
        target.scrollTop = previousScrollTop;
        this.messageLastScrollTop = previousScrollTop;
      }
      window.scrollTo(previousWindowX, previousWindowY);
    });
  }

  scrollMessages(force = false) {
    const target = this.getMessagesScrollTarget();
    if (!target) return;
    this.bindMessageScrollTracking();
    if (!force && (this.messageUserScrollLocked || !this.messageAutoScrollEnabled || !this.isMessagesNearBottom(target))) return;

    cancelAnimationFrame(this.messageScrollFrame);
    this.messageScrollFrame = requestAnimationFrame(() => {
      this.messageScrollProgrammatic = true;
      const previousInlineBehavior = target.style.scrollBehavior;
      target.style.scrollBehavior = 'auto';
      target.scrollTop = Math.max(0, target.scrollHeight - target.clientHeight);
      this.messageLastScrollTop = target.scrollTop;
      this.unlockMessageAutoScroll();

      requestAnimationFrame(() => {
        target.style.scrollBehavior = previousInlineBehavior;
        this.messageScrollProgrammatic = false;
        this.messageLastScrollTop = target.scrollTop;
      });
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
    value = value.replace(/["<>].*$/g, '').trim();
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
    let content = this.renderMarkdown(String(text || ''));
    if (item.role !== 'user') {
      const status = item.meta?.groqStatus;
      const label = status === 'applied' ? 'Texto aprimorado com IA.'
        : status === 'user-disabled' && item.meta?.sourceIds?.length ? 'Resposta da base revisada. Aprimoramento da IA desligado.'
        : status === 'mode-changed' ? 'Preferência da IA alterada. Exibindo a base revisada.'
        : status === 'timeout' ? 'A IA demorou a responder. Exibindo a explicação da base revisada.'
        : ['network-error', 'http-error', 'configuration-error'].includes(status) ? 'A IA está indisponível nesta resposta. Exibindo a base revisada.'
        : ['validation-rejected', 'invalid-response'].includes(status) ? 'Resposta da base revisada; o aprimoramento da IA não foi aplicado.'
        : status === 'local-file' ? 'Resposta local. Abra o chat publicado para usar a IA.' : '';
      if (label) content += '<p class="sw-generation-note">' + this.escapeHtml(label) + '</p>';
    }
    if (item.role === 'user') return content;
    const sourceIds = item.meta?.sourceIds?.length ? item.meta.sourceIds : WidgetKeywordBot.getSourcesForReply(String(text || ''));
    const sources = [...new Set(sourceIds)].map(id => SCIENTIFIC_REFERENCES[id]).filter(Boolean);
    if (!sources.length) return content;
    return content + `<details class="sw-references"><summary>Referências para consulta (${sources.length})</summary><ol>${sources.map(ref => `<li>${this.buildLinkHtml(ref.url, ref.title)}<span class="sw-reference-publisher">${this.escapeHtml(ref.publisher)}${ref.year ? ' · ' + this.escapeHtml(String(ref.year)) : ''}</span></li>`).join('')}</ol></details>`;
  }

  renderMarkdown(text) {
    let source = this.normalizeAssistantLinks(plainScientificNotation(text)).replace(/\r\n?/g, '\n');
    const blocks = [];
    source = source.replace(/\|\|([\s\S]*?)\|\|/g, (_, answer) => {
      const token = `SWBLOCKTOKEN${blocks.length}END`;
      blocks.push(`<details class="sw-answer"><summary>Mostrar resposta ou dica</summary><div class="sw-answer-content">${this.renderMarkdown(answer.trim())}</div></details>`);
      return `\n\n${token}\n\n`;
    });
    const inline = raw => {
      const tokens = [];
      const stash = html => { const token = `SWINLINETOKEN${tokens.length}END`; tokens.push(html); return token; };
      let value = String(raw).replace(/`([^`\n]+)`/g, (_, code) => stash(`<code>${this.escapeHtml(code)}</code>`));
      value = value.replace(/\[([^\]\n]+)\]\(([^\s)]+)\)/g, (_, label, url) => stash(this.buildLinkHtml(url, label)));
      value = value.replace(/\bhttps?:\/\/[^\s<>"']+/g, rawUrl => {
        const { url, trailing } = this.splitTrailingUrlPunctuation(rawUrl);
        return stash(this.buildLinkHtml(url)) + trailing;
      });
      value = this.escapeHtml(value).replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
      return value.replace(/SWINLINETOKEN(\d+)END/g, (_, i) => tokens[Number(i)] || '');
    };
    const out = []; let paragraph = [], list = '';
    const closeParagraph = () => { if (paragraph.length) { out.push(`<p>${inline(paragraph.join(' '))}</p>`); paragraph = []; } };
    const closeList = () => { if (list) { out.push(list === 'ul' ? '</ul>' : '</ol>'); list = ''; } };
    for (const raw of source.split('\n')) {
      const line = raw.trim();
      if (!line) { closeParagraph(); closeList(); continue; }
      const block = line.match(/^SWBLOCKTOKEN(\d+)END$/);
      if (block) { closeParagraph(); closeList(); out.push(blocks[Number(block[1])]); continue; }
      if (/^(?:---+|\*\*\*+)$/.test(line)) { closeParagraph(); closeList(); out.push('<hr>'); continue; }
      const heading = line.match(/^#{1,6}\s+(.+)$/);
      if (heading) { closeParagraph(); closeList(); out.push(`<h4>${inline(heading[1])}</h4>`); continue; }
      const bullet = line.match(/^[-•]\s+(.+)$/), ordered = line.match(/^(\d+)[.)]\s+(.+)$/), alpha = line.match(/^([a-e])[)]\s+(.+)$/i);
      if (bullet || ordered || alpha) {
        closeParagraph(); const type = bullet ? 'ul' : alpha ? 'alpha' : 'ol';
        if (list !== type) { closeList(); list = type; out.push(type === 'ul' ? '<ul>' : type === 'alpha' ? `<ol type="a" start="${alpha[1].toLowerCase().charCodeAt(0)-96}">` : `<ol start="${Number(ordered[1])}">`); }
        out.push(`<li>${inline((bullet || alpha || ordered)[bullet ? 1 : 2])}</li>`); continue;
      }
      closeList(); paragraph.push(line);
    }
    closeParagraph(); closeList(); return out.join('');
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
    this.invalidateConversationGeneration();
    this.messages = [];
    this.resetConversationContext();
    localStorage.removeItem(STORAGE_KEYS.messages);
    localStorage.removeItem(STORAGE_KEYS.frame);
    this.frameContext = null;
    this.ensureWelcomeMessage();
    if (this.legacyPageShell) this.syncActiveConversationState();
    else this.syncSharedConversationMirror();
    this.updateContextText();
    this.renderMessages();
    this.setStatus('Memória limpa. Assistente local pronto.', 100, false);
  }

  async handleSubmit(event) {
    event.preventDefault();
    if (this.sending) return;
    const conversationRevision = this.conversationRevision;
    const isCurrentConversation = () => conversationRevision === this.conversationRevision;
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
      this.lastDocumentMatches = [];
      this.groqLastAttempt = null;
      this.pendingRecommendations = [];
      this.replySourceIds=[];
      this.replyCanonicalBase='';
      this.replyStyle=null;
      this.replyKind='';
      await this.ensureSearchFoundation();
      if (!isCurrentConversation()) return;
      let intent = this.getIntent(userText);
      const usage=reviewedChatUsageReply(userText);
      const clarification=reviewedClarificationReply(userText,this.conversationContext.subject);
      if(usage){response=usage;this.replyKind='fixed-information';intent={name:'help',confidence:1};}
      else if(clarification){response=clarification;this.replyKind='limitation';}
      else {
        const calculation=solveReviewedCalculation(userText);
        if(calculation){response=calculation.text;this.replySourceIds=calculation.sourceIds;this.replyKind=calculation.kind;}
      }

      if (!response && (intent.name === 'help' || isHelpQuestion(userText))) {
        response = GENERIC_HELP_REPLY;
      }

      if (!response && (intent.name === 'greeting' || intent.name === 'acknowledgement')) {
        response = WidgetKeywordBot.getBotResponse(userText);
      }

      if(!response && intent.name==='navigation-help' && /\b(?:nao existe|inexistente|inventad[oa])\b/.test(window.SiMoEnsSearchCore?.normalize(userText)||'')){
        response='Posso enviar links de recursos cadastrados no SiMoEns. Não há um link válido para um recurso inexistente; informe um tema ou peça a lista da categoria desejada.';
        this.replyKind='limitation';
      }

      if (!response && intent.name === 'summarize'
          && !window.SiMoEnsSearchCore?.extractSubject?.(userText)
          && !this.conversationContext.subject
          && !findEntryByPath(currentCtx?.path || '')?.catalogEntry) {
        response = 'Qual assunto, resposta ou recurso do SiMoEns você quer que eu resuma?';
      }

      if (!response && (intent.name === 'identify-current-experience' || isCurrentExperienceQuestion(userText))) {
        response = buildCurrentExperienceReply(currentCtx)
          || 'Não consegui associar esta página a um recurso do registro do SiMoEns.';
      }

      if (!response && intent.name === 'accessibility-help') {
        response = buildAccessibilityHelpReply(userText);
      }

      if (!response) {
        response = this.answerRecommendationFollowup(userText);
      }

      if (!response) {
        response = this.answerResourceRecommendation(userText, currentCtx);
      }

      if (!response && intent.name === 'explain-interface') {
        response = await this.answerInterfaceQuestion(userText, currentCtx);
      }

      if (!response && ['clarify-previous','summarize'].includes(intent.name)) {
        const previous=[...this.messages].reverse().find(message=>message.role==='assistant');
        const t=window.SiMoEnsSearchCore?.normalizeQuery(userText)||'';
        if(/\b(?:ele|ela)\b/.test(t)&&/\b(?:polar|apolar)\b/.test(t)&&!window.SiMoEnsSearchCore?.hasChemistryFormula(userText)){
          if((previous?.content?.match(/\*\*Modelo VSEPR:\*\*/g)||[]).length===1&&this.conversationContext.subject){
            response=WidgetKeywordBot.getBotResponse(this.conversationContext.subject+' '+userText);
          }else{
            response='De qual molécula ou espécie você está falando? Envie o nome ou a fórmula para eu analisar geometria e polaridade.';
            this.replyKind='limitation';
          }
        }
      }
      if (!response && ['clarify-previous','summarize'].includes(intent.name)) {
        response = await this.answerClarificationFollowup(userText, currentCtx, intent);
      }

      if (!response) {
        response = maybeAnswerInstantSiteQuestions(userText);
      }

      // Bare scientific concepts and instrument names receive their reviewed explanation.
      // Resource navigation still follows explicit requests for a page, category or link.
      if (!response && !hasSiteIntent(userText) && !isSiteLinkRequest(userText)
          && !window.SiMoEnsSearchCore?.requestedCategory?.(userText)
          && window.SiMoEnsSearchCore?.isLikelyInScope?.(userText) !== false) {
        const reviewed = WidgetKeywordBot.getBotResponse(userText);
        if (WidgetKeywordBot.getSourcesForReply(reviewed).length) response = reviewed;
      }

      if (!response) {
        response = maybeAnswerFromSiteMap(userText, currentCtx);
      }

      if (!response && intent.name === 'navigation-help' && window.SiMoEnsSearchCore?.requestedCategory?.(userText)) {
        const unresolvedSubject = window.SiMoEnsSearchCore.extractSubject?.(userText) || '';
        response = unresolvedSubject
          ? `Não encontrei um recurso do SiMoEns correspondente a **${unresolvedSubject}**. Não vou substituir por uma página apenas parecida; informe outro assunto ou peça a lista da categoria.`
          : 'Qual é o assunto ou o nome do recurso que você quer abrir?';
      }

      if (!response && window.SiMoEnsSearchCore?.isLikelyInScope?.(userText) === false) {
        response = OFF_TOPIC_REPLY;
      }


      if (!response) {
        const keywordResponse = WidgetKeywordBot.getBotResponse(userText);
        const isFallback = /ainda não encontrei uma resposta específica na base local/i.test(keywordResponse);
        const newFallback = /ainda não encontrei conteúdo suficiente na base local/i.test(keywordResponse);
        if (isFallback || newFallback) {
          response = (await this.answerFromLocalDocuments(userText, currentCtx, { allowFallback: true }))
            || (window.SiMoEnsSearchCore?.isLikelyInScope?.(userText) ? keywordResponse : OFF_TOPIC_REPLY);
        } else {
          response = keywordResponse;
        }
      }

      if (!isCurrentConversation()) return;
      let safeResponse = canonicalizeAssistantReply(String(response || '').trim() || 'Não consegui montar uma resposta agora. Tente reformular a pergunta com o nome do assunto de Química.');

      const sourceIds = this.replySourceIds.length?this.replySourceIds.slice():WidgetKeywordBot.getSourcesForReply(safeResponse);
      if (!sourceIds.length) this.lastDocumentMatches.forEach(match => (match.sourceIds || []).forEach(id => { if (!sourceIds.includes(id)) sourceIds.push(id); }));
      const canonicalBase=this.replyCanonicalBase||safeResponse;
      if(intent.name==='summarize'&&sourceIds.length&&!this.replyStyle){
        this.replyStyle={mode:'summary',sentenceCount:requestedSentenceCount(userText)};
        safeResponse=WidgetKeywordBot.getReplyEdition(safeResponse,'summary',this.replyStyle.sentenceCount);
      }
      const reviewedText=safeResponse;
      if(/^\*\*Segurança de laboratório/.test(safeResponse))this.replyKind='fixed-information';

      let cloudRefined = false;
      const fixedPractice = /\*\*(?:Questão|Gabarito|Dica)/i.test(safeResponse);
      const aiMode=normalizeAIMode(this.aiMode);
      const aiDecision=decideAIRefinement({mode:aiMode,text:safeResponse,intent:intent.name,sourceIds,replyKind:this.replyKind,stopped:this.stopRequested});
      const aiRevision=this.aiModeRevision;
      this.logTrace('groq:decision',{state:aiDecision.request?'eligible':'skipped',mode:aiMode,reason:aiDecision.reason});
      if (aiDecision.request) {
        const refined = await this.refineSharedReplyWithGroq(userText, safeResponse, currentCtx,this.replyStyle||{});
        if (!isCurrentConversation()) return;
        if (refined) { safeResponse = canonicalizeAssistantReply(refined); cloudRefined = true; }
      } else this.groqLastAttempt={state:aiDecision.reason==='user-disabled'?'user-disabled':'not-needed',requestSent:false};
      if (aiDecision.request && this.aiMode!=='off' && aiRevision===this.aiModeRevision && !cloudRefined && !this.stopRequested && WEBLLM_ENABLED) {
        const refinement = await this.refineSharedReplyWithLLM(userText, { markdown: safeResponse }, currentCtx, safeResponse);
        if (!isCurrentConversation()) return;
        if (this.aiMode!=='off' && aiRevision===this.aiModeRevision && refinement?.usedLLM && refinement.text && preservesScientificDetails(safeResponse, refinement.text) && generatedReplyUsesOnlyKnownResources(refinement.text)) {
          safeResponse = canonicalizeAssistantReply(refinement.text);
        }
      }

      if (!isCurrentConversation()) return;
      this.updateConversationContext(userText, currentCtx, this.lastDocumentMatches, intent);
      this.pushAssistantMessage(safeResponse, {
        chatIntent: intent.name,
        groqStatus: cloudRefined ? 'applied' : this.groqLastAttempt?.state || 'not-needed',
        aiMode,
        aiDecision:aiDecision.reason,
        sourceIds,
        reviewedText: sourceIds.length?reviewedText:undefined,
        canonicalBase: sourceIds.length?canonicalBase:undefined,
        replyKind: this.replyKind || (sourceIds.length?'science':'other'),
        validationIssues: this.groqLastAttempt?.validationIssues||[],
        recommendationIds: Array.isArray(this.conversationContext.recommendationIds)
          ? this.conversationContext.recommendationIds.slice(0, 3)
          : [],
      });
      this.setStatus('Assistente pronto.', 100, false);
    } catch (error) {
      if (!isCurrentConversation()) return;
      console.error(error);
      this.pushAssistantMessage('Ocorreu um erro ao processar a resposta. Tente enviar a pergunta novamente.');
      this.setStatus('Ocorreu um erro durante a resposta.', 100, false);
    } finally {
      this.currentStream = null;
      this.sending = false;
      this.stopRequested = false;
      this.stopRequestedByUser = false;
      if (this.refs.input) this.refs.input.disabled = false;
      if (this.refs.menuBtn) this.refs.menuBtn.disabled = false;
      if (this.refs.sendBtn) this.refs.sendBtn.removeAttribute('disabled');
      this.updateSendButtonState();
      this.focusWithoutScrolling(this.refs.input);
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

function hasMountedChatSurface() {
  const widgetHost = document.getElementById('simoens-chat-widget-host') || document.getElementById('simoens-chat-widget-embed-host');
  if (widgetHost) return true;
  if (CHAT_WIDGET_RUNTIME_CONFIG.layout !== 'legacy-page') return false;
  return Boolean(document.getElementById('chatWrap') && document.getElementById('chat'));
}

function initializeSimoensChatWidget() {
  if (window.__simoensChatWidgetInitialized && hasMountedChatSurface()) return;

  try {
    const currentPageContext = collectPageContext();
    try {
      localStorage.setItem(STORAGE_KEYS.page, JSON.stringify(currentPageContext));
    } catch (storageError) {
      console.warn('SiMoEns: não foi possível salvar o contexto local do chat.', storageError);
    }

    if (window.self !== window.top) {
      postContextToParent();
      window.__simoensChatWidgetInitialized = true;
      return;
    }

    if (!document.getElementById('simoens-chat-widget-host') && !document.getElementById('simoens-chat-widget-embed-host')) {
      const widget = new SimoensChatWidget();
      widget.build();
    }
    window.__simoensChatWidgetInitialized = true;
  } catch (error) {
    console.error('SiMoEns: falha ao iniciar o widget do chat.', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSimoensChatWidget, { once: true });
} else {
  initializeSimoensChatWidget();
}

// Algumas experiências interativas reconstroem partes extensas do DOM. Se isso
// remover o host flutuante, o widget é montado novamente sem duplicar instâncias.
if (
  window.self === window.top &&
  CHAT_WIDGET_RUNTIME_CONFIG.layout !== 'legacy-page' &&
  !window.__simoensChatWidgetHostWatchInstalled
) {
  window.__simoensChatWidgetHostWatchInstalled = true;
  let restoreTimer = 0;
  const restoreWidgetHost = () => {
    if (hasMountedChatSurface()) return;
    window.clearTimeout(restoreTimer);
    restoreTimer = window.setTimeout(() => {
      window.__simoensChatWidgetInitialized = false;
      initializeSimoensChatWidget();
    }, 60);
  };
  const installHostObserver = () => {
    if (!document.documentElement) return;
    const observer = new MutationObserver(restoreWidgetHost);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('pageshow', restoreWidgetHost);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installHostObserver, { once: true });
  else installHostObserver();
}

})();
