const canvas = document.getElementById('view')
const ctx = canvas.getContext('2d')
const tutorialPrev = document.getElementById('tutorialPrev')
const tutorialNext = document.getElementById('tutorialNext')
const guideKicker = document.getElementById('guideKicker')
const guideHeading = document.getElementById('guideHeading')
const guideText = document.getElementById('guideText')
const guideCallout = document.getElementById('guideCallout')
const tutorialStepTag = document.getElementById('tutorialStepTag')
const guideFloatStep = document.getElementById('guideFloatStep')
const guideFloatTitle = document.getElementById('guideFloatTitle')
const guideFloatText = document.getElementById('guideFloatText')
const overlay = document.getElementById('overlay')
const formulaCard = document.getElementById('formulaCard')
const hudStrip = document.getElementById('hudStrip')
const stepsGrid = document.getElementById('stepsGrid')
const equationBanner = document.getElementById('equationBanner')
const hydrogenVisualizerHost = document.getElementById('hydrogenVisualizerHost')
const hydrogenVisualizerFrame = document.getElementById('hydrogenVisualizerFrame')
const hydrogenVisualizerTemplate = document.getElementById('hydrogenVisualizerTemplate')
let hydrogenVisualizerLoaded = false
const hudScene = document.getElementById('hudScene')
const hudCount = document.getElementById('hudCount')
const hudEnergy = document.getElementById('hudEnergy')
const speciesTag = document.getElementById('speciesTag')
const radialGraph = document.getElementById('radialGraph')
const radialCtx = radialGraph.getContext('2d')
const statsGrid = document.getElementById('statsGrid')
const orbitalNote = document.getElementById('orbitalNote')
const zValue = document.getElementById('zValue')
const nValue = document.getElementById('nValue')
const lValue = document.getElementById('lValue')
const mValue = document.getElementById('mValue')
const sampleCount = document.getElementById('sampleCount')
const orbitalPresets = document.getElementById('orbitalPresets')
const orbitalAtlas = document.getElementById('orbitalAtlas')
const orbitalAtlasTag = document.getElementById('orbitalAtlasTag')
const orbitalViewSwitch = document.getElementById('orbitalViewSwitch')
const zoomControl = document.getElementById('zoom')
const autorotateControl = document.getElementById('autorotate')
const pitchControl = document.getElementById('pitch')
const glowControl = document.getElementById('glow')
const showAxesControl = document.getElementById('showAxes')
const showLabelsControl = document.getElementById('showLabels')
const showWaveControl = document.getElementById('showWave')
const showTrailsControl = document.getElementById('showTrails')
const resetView = document.getElementById('resetView')
const fitScene = document.getElementById('fitScene')
const hydrogenColorModeControl = document.getElementById('hydrogenColorMode')


function resizeMainCanvas() {
const ratio = window.devicePixelRatio || 1
const rect = canvas.getBoundingClientRect()
const width = Math.max(1, Math.round(rect.width * ratio))
const height = Math.max(1, Math.round(rect.height * ratio))
if(canvas.width !== width || canvas.height !== height){
canvas.width = width
canvas.height = height
}
ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
}


const speciesMap = {
1:'H',
2:'He⁺',
3:'Li²⁺',
4:'Be³⁺',
5:'B⁴⁺',
6:'C⁵⁺',
7:'N⁶⁺',
8:'O⁷⁺'
}

const steps = [
{
"kicker":"Sistema",
"title":"Equação de Schrödinger para um elétron ao redor do núcleo",
"scene":"schrodinger",
"chips":["potencial coulombiano", "um elétron", "núcleo +Ze"],
"formulaTitle":"Equação estacionária e solução hidrogenoide",
"formula":"[-ħ²/(2μ) ∇² - Ze²/(4πϵ₀ r)] ψ = E ψ",
"formulaHtml":"<div class=\"eq-stack\"><div class=\"formula-line\">[-ħ²/(2μ) ∇² - Ze²/(4πϵ₀ r)] ψ = E ψ</div><div class=\"formula-line\">ψ<sub>n,l,m</sub>(r,θ,φ) = R<sub>n,l</sub>(r) Y<sub>l</sub><sup>m</sup>(θ,φ)</div><div class=\"eq-caption\">A solução final já aparece separada em parte radial e parte angular.</div></div>",
"bannerHtml":"<span class=\"eq-main\">ψ<sub>n,l,m</sub>(r,θ,φ) = R<sub>n,l</sub>(r) Y<sub>l</sub><sup>m</sup>(θ,φ)</span><span class=\"eq-small\">função de onda total do átomo hidrogenoide</span>",
"formulaExplainHtml":"<div style=\"margin-top:10px\" class=\"eq-stack\"><div class=\"eq-caption\"><strong>O que esta equação é.</strong> Ela descreve estados estacionários de um elétron preso ao núcleo por atração eletrostática.</div><div class=\"eq-caption\"><strong>Partes principais.</strong> O termo com ∇² representa a energia cinética quântica; o termo com 1/r é o potencial coulombiano; ψ é a função de onda; E é a energia permitida do estado.</div><div class=\"eq-caption\"><strong>O que ela produz.</strong> Resolver a equação fornece valores quantizados de energia e a função ψ normalizada. Depois, |ψ|² vira densidade de probabilidade e alimenta os mapas 2D, a nuvem 3D e a leitura radial.</div></div>",
"text":["Um sistema hidrogenoide tem um único elétron ao redor de um núcleo de carga +Ze. Esse modelo é importante porque admite solução analítica e mostra com clareza energia quantizada, nós e formas orbitais.", "Na equação, o termo cinético descreve a variação espacial de ψ e o termo coulombiano descreve a atração entre núcleo e elétron. Resolver a equação significa obter ψ e os valores permitidos de E.", "O resultado não é uma órbita clássica. A solução fornece uma função de onda; o módulo ao quadrado dessa função gera a densidade de probabilidade mostrada no app."],
"callout":"A equação descreve estados permitidos, suas energias e a distribuição espacial do elétron."
},
{
"kicker":"Espécies hidrogenoides",
"title":"O que são espécies hidrogenoides e por que elas importam",
"scene":"schrodinger",
"chips":["um elétron", "Z variável", "H, He⁺, Li²⁺"],
"formulaTitle":"Família hidrogenoide",
"formula":"H, He⁺, Li²⁺, Be³⁺ ... → sistemas de um único elétron",
"formulaHtml":"<div class=\"eq-stack\"><div class=\"formula-line\">H, He<sup>+</sup>, Li<sup>2+</sup>, Be<sup>3+</sup> ...</div><div class=\"formula-line\">potencial = -Ze²/(4πϵ₀ r)</div><div class=\"eq-caption\">Todos esses sistemas têm só um elétron e, por isso, obedecem à mesma estrutura matemática básica.</div></div>",
"bannerHtml":"<span class=\"eq-main\">espécie hidrogenoide = núcleo +Ze com apenas um elétron</span><span class=\"eq-small\">mesma matemática, com compressão radial controlada por Z</span>",
"formulaExplainHtml":"<div style=\"margin-top:10px\" class=\"eq-stack\"><div class=\"eq-caption\"><strong>O que é uma espécie hidrogenoide.</strong> É qualquer átomo ou íon que tenha apenas um elétron. O hidrogênio é o caso mais famoso, mas He<sup>+</sup>, Li<sup>2+</sup> e Be<sup>3+</sup> também entram nessa família.</div><div class=\"eq-caption\"><strong>O que muda de uma espécie para outra.</strong> A forma geral da equação continua a mesma; o que muda é a carga nuclear Z. Quando Z aumenta, a atração núcleo-elétron fica mais forte, a energia fica mais negativa e a distribuição radial se contrai.</div><div class=\"eq-caption\"><strong>Por que isso é útil.</strong> Uma única matemática serve para comparar vários sistemas reais. É por isso que o seletor lateral de Z consegue manter a família orbital e, ao mesmo tempo, alterar a escala espacial e energética.</div></div>",
"text":["Espécie hidrogenoide é qualquer átomo ou íon com apenas um elétron, como H, He+ e Li2+. Todos esses sistemas têm o mesmo tipo de potencial coulombiano central.", "A diferença principal entre eles está em Z, a carga nuclear. Quando Z aumenta, a atração fica mais forte, a distribuição radial se contrai e os níveis de energia ficam mais negativos.", "Por isso o seletor de Z altera a escala radial e energética sem mudar a forma geral da solução."],
"callout":"Espécies hidrogenoides seguem a mesma forma geral de solução; o valor de Z altera a contração radial e a energia."
},
{
"kicker":"Coordenadas e separação",
"title":"Coordenadas esféricas e separação de variáveis",
"scene":"spherical",
"chips":["simetria radial", "r, θ, φ", "separação"],
"formulaTitle":"Forma explícita da função de onda do hidrogênio",
"formula":"ψ<sub>n,l,m</sub>(r,θ,φ) = N e<sup>-ρ/2</sup> ρ<sup>l</sup> L<sub>n-l-1</sub><sup>2l+1</sup>(ρ) Y<sub>l</sub><sup>m</sup>(θ,φ)",
"formulaHtml":"<div class=\"eq-stack\"><div class=\"formula-line\">ψ<sub>n,l,m</sub>(r,θ,φ) = N<sub>n,l</sub> e<sup>-ρ/2</sup> ρ<sup>l</sup> L<sub>n-l-1</sub><sup>2l+1</sup>(ρ) Y<sub>l</sub><sup>m</sup>(θ,φ)</div><div class=\"eq-caption\">com ρ = 2Zr/(n a<sub>0</sub>) e N<sub>n,l</sub> reunindo a normalização.</div></div>",
"bannerHtml":"<span class=\"eq-main\">ψ<sub>n,l,m</sub>(r,θ,φ) = N<sub>n,l</sub> e<sup>-ρ/2</sup> ρ<sup>l</sup> L<sub>n-l-1</sub><sup>2l+1</sup>(ρ) Y<sub>l</sub><sup>m</sup>(θ,φ)</span><span class=\"eq-small\">ρ = 2Zr/(n a<sub>0</sub>)</span>",
"formulaExplainHtml":"<div style=\"margin-top:10px\" class=\"eq-stack\"><div class=\"eq-caption\"><strong>Por que usar r, θ e φ.</strong> Como o potencial depende apenas da distância ao núcleo, a geometria do problema é esférica.</div><div class=\"eq-caption\"><strong>Como a conta é organizada.</strong> A variável ρ torna a parte radial adimensional; o fator exponencial controla o decaimento; o polinômio de Laguerre ajusta oscilações radiais; o harmônico esférico Y controla a distribuição angular.</div><div class=\"eq-caption\"><strong>O que sai daqui.</strong> Essa fatoração é a ponte entre a equação geral e as expressões específicas dos orbitais s, p e d.</div></div>",
"text":["Como o potencial coulombiano depende apenas da distância ao núcleo, coordenadas esféricas são a escolha natural para o problema.", "A separação de variáveis escreve a função total como produto entre uma parte radial e uma parte angular. Isso é possível por causa da simetria do potencial.", "Dessa separação surgem R(r) e Y(θ,φ), que depois aparecem nas fórmulas particulares, nos gráficos radiais, nos mapas 2D e nas nuvens 3D."],
"callout":"A parte radial descreve a distância ao núcleo; a parte angular descreve a direção e a simetria do orbital."
},
{
"kicker":"Parte angular",
"title":"Números quânticos e orientação do orbital",
"scene":"quantum",
"chips":["n, l, m", "harmônicos esféricos", "quantização angular"],
"formulaTitle":"Restrições dos números quânticos",
"formula":"n = 1,2,3,...   l = 0,...,n-1   m = -l,...,+l",
"formulaHtml":"<div class=\"eq-stack\"><div class=\"formula-line\">n = 1,2,3,... &nbsp;&nbsp; l = 0,...,n-1 &nbsp;&nbsp; m = -l,...,+l</div><div class=\"formula-line\">Y<sub>l</sub><sup>m</sup>(θ,φ)</div><div class=\"eq-caption\">Os harmônicos esféricos determinam simetria, orientação e nós angulares.</div></div>",
"formulaExplainHtml":"<div style=\"margin-top:10px\" class=\"eq-stack\"><div class=\"eq-caption\"><strong>O que n, l e m fazem.</strong> n define o nível principal; l define a família angular do estado; m seleciona a orientação ou a componente angular associada.</div><div class=\"eq-caption\"><strong>Parte angular.</strong> Os harmônicos esféricos Y<sub>l</sub><sup>m</sup> são as soluções angulares da equação e impõem onde a função muda de sinal e onde surgem nós angulares.</div><div class=\"eq-caption\"><strong>Leitura visual.</strong> Orbitais s são esféricos, p têm dois lóbulos e um nó angular, d exibem geometrias mais complexas com duas superfícies nodais angulares.</div></div>",
"text":["Os números quânticos surgem das condições matemáticas da solução e identificam o estado eletrônico.", "O número n define o nível principal. O número l define a família angular do orbital. O número m define a orientação associada à parte angular usada no desenho do orbital.", "Por isso mudar l ou m altera a forma e a orientação da nuvem eletrônica."],
"callout":"O número de nós angulares é l."
},
{
"kicker":"Parte radial",
"title":"Extensão, nós radiais e compressão por Z",
"scene":"radial",
"chips":["Laguerre", "P(r)", "nós radiais"],
"formulaTitle":"Parte radial e probabilidade radial",
"formula":"P(r) = r² · |R<sub>n,l</sub>(r)|²",
"formulaHtml":"<div class=\"eq-stack\"><div class=\"formula-line\">R<sub>n,l</sub>(r) = N<sub>n,l</sub> e<sup>-ρ/2</sup> ρ<sup>l</sup> L<sub>n-l-1</sub><sup>2l+1</sup>(ρ)</div><div class=\"formula-line\">P(r) = r² · |R<sub>n,l</sub>(r)|²</div><div class=\"eq-caption\">A distribuição radial combina a parte radial com o fator geométrico do volume esférico.</div></div>",
"formulaExplainHtml":"<div style=\"margin-top:10px\" class=\"eq-stack\"><div class=\"eq-caption\"><strong>O que R(r) faz.</strong> Ela controla como a função se distribui com a distância ao núcleo.</div><div class=\"eq-caption\"><strong>Por que aparece r².</strong> Quando a probabilidade é lida em cascas esféricas, o elemento de volume cresce com r². Por isso a probabilidade radial não é apenas |R|².</div><div class=\"eq-caption\"><strong>O que o gráfico entrega.</strong> Picos indicam distâncias mais prováveis; zeros indicam nós radiais; aumentar Z contrai a distribuição para mais perto do núcleo.</div></div>",
"text":["A parte radial controla a extensão do orbital e mostra como a densidade varia com a distância ao núcleo.", "Os nós radiais aparecem quando R(r) zera em certos valores de r. Em orbitais s com n maior, isso pode formar camadas concêntricas separadas por regiões sem densidade.", "O gráfico radial ajuda a ver em quais distâncias o estado se concentra e como isso muda com n e com Z."],
"callout":"O número de nós radiais é n - l - 1."
},
{
"kicker":"Mapa orbital",
"title":"Da função de onda para os mapas 2D e a nuvem 3D",
"scene":"orbital",
"chips":["corte analítico", "|ψ|²", "orbital selecionado"],
"formulaTitle":"Densidade espacial usada no app",
"formula":"densidade espacial ∝ |Rₙₗ(r)|² · |Yₗᵐ(θ,φ)|²",
"formulaExplainHtml":"<div style=\"margin-top:10px\" class=\"eq-stack\"><div class=\"eq-caption\"><strong>O que é desenhado.</strong> O app parte da função ψ do estado escolhido e calcula sua densidade |ψ|².</div><div class=\"eq-caption\"><strong>Como a forma nasce.</strong> A parte radial define em que distâncias a densidade aparece; a parte angular define em que direções ela aparece ou desaparece.</div><div class=\"eq-caption\"><strong>O que os modos mostram.</strong> O mapa 2D mostra um corte da solução; a nuvem 3D amostra a densidade no espaço; o modo de sinal mostra onde ψ muda de fase.</div></div>",
"text":["Aqui a matemática vira imagem. Depois de escolher n, l e m, o visualizador monta a função de onda correspondente e transforma essa solução em cortes 2D, leitura radial e nuvem 3D.", "É importante separar duas ideias: ψ pode assumir sinais opostos, mas a probabilidade observável vem de |ψ|². Por isso alguns modos de cor mostram sinal da função e outros mostram densidade ou camadas.", "Em resumo, o desenho do orbital não é um ícone pronto. Ele é produzido diretamente a partir da equação resolvida para o estado selecionado."],
"callout":"A forma do orbital vem da solução matemática. A cor só ajuda na leitura visual."
},
{
"kicker":"Casos exemplares",
"title":"Como comparar as famílias s, p e d",
"scene":"orbitalExamples",
"chips":["1s", "2s", "2p", "3d"],
"formulaTitle":"Orbitais como mapas de densidade",
"formula":"s → l=0   p → l=1   d → l=2",
"formulaHtml":"<div class=\"eq-stack\"><div class=\"formula-line\">|ψ<sub>n,l,m</sub>(r,θ,φ)|²</div><div class=\"formula-line\">s → l=0 &nbsp;&nbsp; p → l=1 &nbsp;&nbsp; d → l=2</div><div class=\"eq-caption\">Cada família vem de uma estrutura angular diferente da função de onda.</div></div>",
"formulaExplainHtml":"<div style=\"margin-top:10px\" class=\"eq-stack\"><div class=\"eq-caption\"><strong>Família s.</strong> A parte angular é constante e a forma global é esférica; as diferenças aparecem sobretudo na parte radial.</div><div class=\"eq-caption\"><strong>Família p.</strong> Surge um nó angular e dois lóbulos com sinais opostos da função.</div><div class=\"eq-caption\"><strong>Família d.</strong> A estrutura angular fica mais rica, com duas superfícies nodais e geometrias quadrilobadas ou do tipo z².</div></div>",
"text":["Comparar orbitais lado a lado é a melhor forma de perceber o papel dos números quânticos. O 1s mostra a simetria mais simples possível; o 2s preserva a esfericidade, mas introduz um nó radial; os p criam orientação espacial; os d tornam a parte angular bem mais sofisticada.", "Quando você passa de s para p ou d, não está apenas vendo uma forma bonita diferente. Está vendo uma mudança real na solução angular da equação. Quando aumenta n mantendo a família, a arquitetura angular se preserva, mas a parte radial cria novas camadas e nós.", "Essa comparação é onde o app mais ajuda: ele permite ler forma, nós e alcance espacial como consequências coordenadas da mesma equação."],
"callout":"Compare os orbitais pelo número de nós, pela orientação espacial e pelo alcance radial."
},
{
"kicker":"Energia e espectro",
"title":"Transições eletrônicas em sistemas hidrogenoides",
"scene":"transitions",
"chips":["ΔE = hν", "linhas espectrais", "níveis"],
"formulaTitle":"Bohr + Rydberg na leitura espectral",
"formula":"1/λ = R Z² (1/n<sub>f</sub>² - 1/n<sub>i</sub>²)",
"formulaHtml":"<div class=\"eq-stack\"><div class=\"formula-line\">E<sub>n</sub> = -13,605693 · Z² / n² eV</div><div class=\"formula-line\">1/λ = R Z² (1/n<sub>f</sub>² - 1/n<sub>i</sub>²)</div><div class=\"eq-caption\">Uma expressão organiza os níveis; a outra traduz a diferença de energia em luz emitida ou absorvida.</div></div>",
"bannerHtml":"<span class=\"eq-main\">1/λ = R Z² (1/n<sub>f</sub>² - 1/n<sub>i</sub>²)</span><span class=\"eq-small\">fórmula de Rydberg para transições hidrogenoides</span>",
"formulaExplainHtml":"<div style=\"margin-top:10px\" class=\"eq-stack\"><div class=\"eq-caption\"><strong>O que a fórmula de energia diz.</strong> Em sistemas hidrogenoides ideais, a energia depende de n e da carga nuclear Z.</div><div class=\"eq-caption\"><strong>O que a fórmula de Rydberg faz.</strong> Ela converte a diferença entre dois níveis em comprimento de onda da radiação observada.</div><div class=\"eq-caption\"><strong>Ligação com o restante do app.</strong> A mesma quantização que organiza as formas orbitais também organiza as linhas espectrais.</div></div>",
"text":["A linguagem moderna dos orbitais não apagou a leitura espectral. Pelo contrário: ela explica por que só certas energias aparecem e por que as linhas do espectro vêm em valores discretos.", "Quando o elétron muda de um nível para outro, a diferença de energia aparece como fóton emitido ou absorvido. É isso que a relação ΔE = hν resume, e a fórmula de Rydberg reescreve esse processo em termos de comprimento de onda.", "A equação de Schrödinger fornece os estados e suas energias. As transições entre esses estados geram o espectro observável."],
"callout":"Níveis quantizados explicam tanto a forma dos estados quanto as linhas discretas do espectro."
},
{
"kicker":"Síntese final",
"title":"Resumo geral: da equação até o orbital visível",
"scene":"summary",
"chips":["equação", "parte radial", "parte angular", "espectro"],
"formulaTitle":"Síntese conceitual",
"formula":"equação → ψ → |ψ|² → orbital, gráfico radial e leitura espectral",
"formulaExplainHtml":"<div style=\"margin-top:10px\" class=\"eq-stack\"><div class=\"eq-caption\"><strong>Começo da cadeia.</strong> A equação de Schrödinger estacionária descreve o elétron preso ao núcleo por um potencial coulombiano.</div><div class=\"eq-caption\"><strong>Meio da cadeia.</strong> Em coordenadas esféricas, a solução se separa em parte radial R(r) e parte angular Y(θ,φ). A parte radial controla alcance e nós radiais; a parte angular controla forma, orientação e nós angulares.</div><div class=\"eq-caption\"><strong>Fim da cadeia.</strong> O produto dessas partes gera ψ; o módulo ao quadrado gera a densidade |ψ|²; e dessa densidade saem os mapas 2D, a nuvem 3D, o gráfico radial e a interpretação energética do sistema.</div></div>",
"text":["Ao longo das etapas, a ideia central foi sempre a mesma: a equação de Schrödinger não prevê uma órbita clássica desenhada como a de um planeta. Ela prevê estados quânticos permitidos, cada um com energia própria e com uma distribuição espacial específica para o elétron.", "Também vimos que a solução pode ser separada em duas partes complementares. A parte radial responde por distância ao núcleo, extensão do orbital e nós radiais; a parte angular responde por simetria, orientação espacial e nós angulares. É dessa divisão que nascem as famílias s, p e d e suas diferenças visuais.", "Quando falamos de espécies hidrogenoides, vimos que a teoria continua a mesma para qualquer sistema com um único elétron; o que muda é Z. Aumentar Z comprime a distribuição radial e aprofunda a energia, mas não muda a lógica geral da solução. No fim, tudo se conecta: equação, números quânticos, orbital, densidade, gráfico radial e espectro são partes diferentes da mesma leitura física."],
"callout":"Resumo: cada orbital pode ser lido pela parte radial, pela parte angular, pelos nós e pelo valor de Z."
}
]



function orbitalMetaByQuantum(n, l, m){
return orbitalDetailCatalog.find((item) => item.n === n && item.l === l && item.m === m) || null
}

function orbitalMetaFromState(){
return orbitalMetaByQuantum(state.orbital.n, state.orbital.l, state.orbital.m)
}

function applyStepOrbitalPreset(step){
if(!step || !step.orbitalPreset) return
const preset = step.orbitalPreset
state.orbital.n = preset.n
state.orbital.l = preset.l
state.orbital.m = preset.m
nValue.value = String(preset.n)
updateQuantumOptions()
lValue.value = String(preset.l)
mValue.value = String(preset.m)
state.orbitalCacheKey = ''
}


function orbitalFamilyMeaning(item){
if(item.l === 0) return 'Como l = 0, a parte angular é constante. Isso deixa a forma global esférica, e quase toda a leitura visual passa a depender da parte radial.'
if(item.l === 1) return 'Como l = 1, a parte angular muda de sinal no espaço e cria um nó angular. Por isso a família p aparece com dois lóbulos orientados.'
if(item.l === 2) return 'Como l = 2, a parte angular cria duas superfícies nodais e uma geometria mais rica. Daí surgem os orbitais d quadrilobados ou do tipo z².'
return 'A família angular desse estado reorganiza a distribuição espacial da função.'
}

function orbitalOrientationMeaning(item){
const orientation = String(item.orientationText || '').replace(/\.$/, '')
return `Na visualização, isso se traduz em ${orientation}.`
}

function buildOrbitalText(item){
const rhoText = `ρ = 2r / (${item.n}a₀)`
return [
`Neste estado, n=${item.n}, l=${item.l} e m=${item.m}. O número quântico principal n fixa a escala energética do nível e participa da contagem de nós radiais; l define a família angular do estado; m seleciona a orientação espacial mostrada no app. Para esse conjunto, a solução prevê ${item.radialNodes} nó(s) radial(is) e ${item.angularNodes} nó(s) angular(es).`,
`O cálculo segue uma ordem bem clara. Primeiro escreve-se a variável reduzida ${rhoText} para simplificar a parte radial. Depois calcula-se R(r), que controla em que distâncias a densidade aparece, e Y(θ,φ), que controla direção, simetria e mudanças de sinal. O produto R·Y gera ψ; em seguida, |ψ|² gera a densidade usada no mapa 2D e na nuvem 3D.`,
`${orbitalFamilyMeaning(item)} ${orbitalOrientationMeaning(item)}`
]
}

function buildOrbitalCallout(item){
const radialLine = item.radialNodes === 0
? 'a parte radial não cria nós internos nesse estado'
: `a parte radial cria ${item.radialNodes} região(ões) nodal(is) em função da distância ao núcleo`
const angularLine = item.angularNodes === 0
? 'a parte angular mantém simetria sem nós angulares'
: `a parte angular cria ${item.angularNodes} superfície(s) nodal(is) e define a orientação espacial`
return `Leitura rápida: ${radialLine}; ${angularLine}. Alterar Z no painel lateral contrai ou expande a solução radial sem trocar a família angular do estado.`
}

function buildOrbitalFormulaExplain(item){
return `<div style="margin-top:10px" class="eq-stack">
<div class="eq-caption"><strong>Como ler esta solução particular.</strong> A primeira linha escreve a variável reduzida ρ, que simplifica a dependência radial. A segunda linha mostra R(r), responsável por alcance, camadas e nós radiais. A terceira linha mostra Y(θ,φ), responsável por orientação e nós angulares.</div>
<div class="eq-caption"><strong>O que o produto faz.</strong> Multiplicar R(r) por Y(θ,φ) produz a função de onda do estado ${item.label}. Depois, elevar o módulo ao quadrado produz a densidade de probabilidade usada no visual.</div>
<div class="eq-caption"><strong>Leitura física desse caso.</strong> ${orbitalFamilyMeaning(item)} ${orbitalOrientationMeaning(item)}</div>
</div>`
}

function buildOrbitalDetailStep(item){
return {
kicker:item.kicker,
title:item.title,
scene:'orbital',
chips:item.chips,
formulaTitle:item.formulaTitle,
formula:`ψ_${item.tuple}`,
formulaHtml:item.formulaHtml,
formulaExplainHtml:buildOrbitalFormulaExplain(item),
bannerHtml:item.bannerHtml,
text:buildOrbitalText(item),
callout:buildOrbitalCallout(item),
orbitalPreset:{n:item.n,l:item.l,m:item.m}
}
}


const state = {
step:0,
yaw:0.65,
pitch:0.32,
zoom:parseFloat(zoomControl.value),
autorotate:parseFloat(autorotateControl.value),
glow:parseFloat(glowControl.value),
dragging:false,
lastX:0,
lastY:0,
orbital:{
Z:parseInt(zValue.value,10),
n:2,
l:1,
m:0,
samples:parseInt(sampleCount.value,10)
},
orbitalView:'2d',
orbitalCacheKey:'',
orbitalCache:null,
lastTime:0,
frameCounter:0
}

const orbitalPresetList = [
{label:'1s',n:1,l:0,m:0},
{label:'2s',n:2,l:0,m:0},
{label:'2p_z',n:2,l:1,m:0},
{label:'2p_x',n:2,l:1,m:1},
{label:'2p_y',n:2,l:1,m:-1},
{label:'3d_z²',n:3,l:2,m:0},
{label:'3d_xz',n:3,l:2,m:1},
{label:'3d_yz',n:3,l:2,m:-1},
{label:'3d_x²−y²',n:3,l:2,m:2},
{label:'3d_xy',n:3,l:2,m:-2},
{label:'5p_z',n:5,l:1,m:0},
{label:'5d_z²',n:5,l:2,m:0}
]

const orbitalDetailCatalog = [
  {
    "label": "1s",
    "tuple": "(1,0,0)",
    "n": 1,
    "l": 0,
    "m": 0,
    "plane": "xz",
    "key": "s",
    "radialNodes": 0,
    "angularNodes": 0,
    "radialExpr": "2·e<sup>-ρ / 2</sup>",
    "angularExpr": "Y(θ,φ) = 1 / √(4π)",
    "orientationText": "simetria esférica, sem orientação preferencial.",
    "familyName": "orbital s",
    "formulaTitle": "Resolução do 1s (1,0,0)",
    "kicker": "Orbitais do hidrogênio",
    "title": "1s (1,0,0)",
    "chips": [
      "1s",
      "(1,0,0)",
      "nós radiais = 0",
      "nós angulares = 0"
    ],
    "text": [
      "Esta etapa fixa o estado 1s do hidrogênio. Como n=1, l=0 e m=0, a solução separada da equação de Schrödinger produz 0 nó(s) radial(is) e 0 nó(s) angular(es). Na visualização, isso aparece como simetria esférica, sem orientação preferencial.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (1a₀), a parte radial R<sub>1,0</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 1s, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (1a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>1,0</sub>(r) = 2·e<sup>-ρ / 2</sup></div><div class=\"formula-line\">Y(θ,φ) = 1 / √(4π)</div><div class=\"eq-caption\">Função de onda: ψ<sub>1,0,0</sub>(r,θ,φ) = R<sub>1,0</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>1,0,0</sub>(r,θ,φ) = R<sub>1,0</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">1s (1,0,0) • ρ = 2r / (1a<sub>0</sub>)</span>"
  },
  {
    "label": "2s",
    "tuple": "(2,0,0)",
    "n": 2,
    "l": 0,
    "m": 0,
    "plane": "xz",
    "key": "s",
    "radialNodes": 1,
    "angularNodes": 0,
    "radialExpr": "√(2)·(2 - ρ)·e<sup>-ρ / 2</sup> / 4",
    "angularExpr": "Y(θ,φ) = 1 / √(4π)",
    "orientationText": "simetria esférica, sem orientação preferencial.",
    "familyName": "orbital s",
    "formulaTitle": "Resolução do 2s (2,0,0)",
    "kicker": "Orbitais do hidrogênio",
    "title": "2s (2,0,0)",
    "chips": [
      "2s",
      "(2,0,0)",
      "nós radiais = 1",
      "nós angulares = 0"
    ],
    "text": [
      "Esta etapa fixa o estado 2s do hidrogênio. Como n=2, l=0 e m=0, a solução separada da equação de Schrödinger produz 1 nó(s) radial(is) e 0 nó(s) angular(es). Na visualização, isso aparece como simetria esférica, sem orientação preferencial.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (2a₀), a parte radial R<sub>2,0</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 2s, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (2a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>2,0</sub>(r) = √(2)·(2 - ρ)·e<sup>-ρ / 2</sup> / 4</div><div class=\"formula-line\">Y(θ,φ) = 1 / √(4π)</div><div class=\"eq-caption\">Função de onda: ψ<sub>2,0,0</sub>(r,θ,φ) = R<sub>2,0</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>2,0,0</sub>(r,θ,φ) = R<sub>2,0</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">2s (2,0,0) • ρ = 2r / (2a<sub>0</sub>)</span>"
  },
  {
    "label": "2p_z",
    "tuple": "(2,1,0)",
    "n": 2,
    "l": 1,
    "m": 0,
    "plane": "xz",
    "key": "p_z",
    "radialNodes": 0,
    "angularNodes": 1,
    "radialExpr": "√(6)·ρ·e<sup>-ρ / 2</sup> / 12",
    "angularExpr": "Y(θ,φ) = √(3 / 4π) · cosθ",
    "orientationText": "dois lóbulos alinhados ao eixo z, com plano nodal xy.",
    "familyName": "orbital p",
    "formulaTitle": "Resolução do 2p_z (2,1,0)",
    "kicker": "Orbitais do hidrogênio",
    "title": "2p_z (2,1,0)",
    "chips": [
      "2p_z",
      "(2,1,0)",
      "nós radiais = 0",
      "nós angulares = 1"
    ],
    "text": [
      "Esta etapa fixa o estado 2p_z do hidrogênio. Como n=2, l=1 e m=0, a solução separada da equação de Schrödinger produz 0 nó(s) radial(is) e 1 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos alinhados ao eixo z, com plano nodal xy.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (2a₀), a parte radial R<sub>2,1</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 2p_z, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (2a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>2,1</sub>(r) = √(6)·ρ·e<sup>-ρ / 2</sup> / 12</div><div class=\"formula-line\">Y(θ,φ) = √(3 / 4π) · cosθ</div><div class=\"eq-caption\">Função de onda: ψ<sub>2,1,0</sub>(r,θ,φ) = R<sub>2,1</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>2,1,0</sub>(r,θ,φ) = R<sub>2,1</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">2p_z (2,1,0) • ρ = 2r / (2a<sub>0</sub>)</span>"
  },
  {
    "label": "2p_x",
    "tuple": "(2,1,1)",
    "n": 2,
    "l": 1,
    "m": 1,
    "plane": "xy",
    "key": "p_x",
    "radialNodes": 0,
    "angularNodes": 1,
    "radialExpr": "√(6)·ρ·e<sup>-ρ / 2</sup> / 12",
    "angularExpr": "Y(θ,φ) = √(3 / 4π) · senθ · cosφ",
    "orientationText": "dois lóbulos alinhados ao eixo x, com plano nodal yz.",
    "familyName": "orbital p",
    "formulaTitle": "Resolução do 2p_x (2,1,1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "2p_x (2,1,1)",
    "chips": [
      "2p_x",
      "(2,1,1)",
      "nós radiais = 0",
      "nós angulares = 1"
    ],
    "text": [
      "Esta etapa fixa o estado 2p_x do hidrogênio. Como n=2, l=1 e m=1, a solução separada da equação de Schrödinger produz 0 nó(s) radial(is) e 1 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos alinhados ao eixo x, com plano nodal yz.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (2a₀), a parte radial R<sub>2,1</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 2p_x, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (2a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>2,1</sub>(r) = √(6)·ρ·e<sup>-ρ / 2</sup> / 12</div><div class=\"formula-line\">Y(θ,φ) = √(3 / 4π) · senθ · cosφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>2,1,1</sub>(r,θ,φ) = R<sub>2,1</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>2,1,1</sub>(r,θ,φ) = R<sub>2,1</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">2p_x (2,1,1) • ρ = 2r / (2a<sub>0</sub>)</span>"
  },
  {
    "label": "2p_y",
    "tuple": "(2,1,-1)",
    "n": 2,
    "l": 1,
    "m": -1,
    "plane": "yz",
    "key": "p_y",
    "radialNodes": 0,
    "angularNodes": 1,
    "radialExpr": "√(6)·ρ·e<sup>-ρ / 2</sup> / 12",
    "angularExpr": "Y(θ,φ) = √(3 / 4π) · senθ · senφ",
    "orientationText": "dois lóbulos alinhados ao eixo y, com plano nodal xz.",
    "familyName": "orbital p",
    "formulaTitle": "Resolução do 2p_y (2,1,-1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "2p_y (2,1,-1)",
    "chips": [
      "2p_y",
      "(2,1,-1)",
      "nós radiais = 0",
      "nós angulares = 1"
    ],
    "text": [
      "Esta etapa fixa o estado 2p_y do hidrogênio. Como n=2, l=1 e m=-1, a solução separada da equação de Schrödinger produz 0 nó(s) radial(is) e 1 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos alinhados ao eixo y, com plano nodal xz.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (2a₀), a parte radial R<sub>2,1</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 2p_y, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (2a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>2,1</sub>(r) = √(6)·ρ·e<sup>-ρ / 2</sup> / 12</div><div class=\"formula-line\">Y(θ,φ) = √(3 / 4π) · senθ · senφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>2,1,-1</sub>(r,θ,φ) = R<sub>2,1</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>2,1,-1</sub>(r,θ,φ) = R<sub>2,1</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">2p_y (2,1,-1) • ρ = 2r / (2a<sub>0</sub>)</span>"
  },
  {
    "label": "3s",
    "tuple": "(3,0,0)",
    "n": 3,
    "l": 0,
    "m": 0,
    "plane": "xz",
    "key": "s",
    "radialNodes": 2,
    "angularNodes": 0,
    "radialExpr": "√(3)·(ρ² - 6·ρ + 6)·e<sup>-ρ / 2</sup> / 27",
    "angularExpr": "Y(θ,φ) = 1 / √(4π)",
    "orientationText": "simetria esférica, sem orientação preferencial.",
    "familyName": "orbital s",
    "formulaTitle": "Resolução do 3s (3,0,0)",
    "kicker": "Orbitais do hidrogênio",
    "title": "3s (3,0,0)",
    "chips": [
      "3s",
      "(3,0,0)",
      "nós radiais = 2",
      "nós angulares = 0"
    ],
    "text": [
      "Esta etapa fixa o estado 3s do hidrogênio. Como n=3, l=0 e m=0, a solução separada da equação de Schrödinger produz 2 nó(s) radial(is) e 0 nó(s) angular(es). Na visualização, isso aparece como simetria esférica, sem orientação preferencial.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (3a₀), a parte radial R<sub>3,0</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 3s, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (3a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>3,0</sub>(r) = √(3)·(ρ² - 6·ρ + 6)·e<sup>-ρ / 2</sup> / 27</div><div class=\"formula-line\">Y(θ,φ) = 1 / √(4π)</div><div class=\"eq-caption\">Função de onda: ψ<sub>3,0,0</sub>(r,θ,φ) = R<sub>3,0</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>3,0,0</sub>(r,θ,φ) = R<sub>3,0</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">3s (3,0,0) • ρ = 2r / (3a<sub>0</sub>)</span>"
  },
  {
    "label": "3p_z",
    "tuple": "(3,1,0)",
    "n": 3,
    "l": 1,
    "m": 0,
    "plane": "xz",
    "key": "p_z",
    "radialNodes": 1,
    "angularNodes": 1,
    "radialExpr": "√(6)·ρ·(4 - ρ)·e<sup>-ρ / 2</sup> / 54",
    "angularExpr": "Y(θ,φ) = √(3 / 4π) · cosθ",
    "orientationText": "dois lóbulos alinhados ao eixo z, com plano nodal xy.",
    "familyName": "orbital p",
    "formulaTitle": "Resolução do 3p_z (3,1,0)",
    "kicker": "Orbitais do hidrogênio",
    "title": "3p_z (3,1,0)",
    "chips": [
      "3p_z",
      "(3,1,0)",
      "nós radiais = 1",
      "nós angulares = 1"
    ],
    "text": [
      "Esta etapa fixa o estado 3p_z do hidrogênio. Como n=3, l=1 e m=0, a solução separada da equação de Schrödinger produz 1 nó(s) radial(is) e 1 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos alinhados ao eixo z, com plano nodal xy.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (3a₀), a parte radial R<sub>3,1</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 3p_z, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (3a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>3,1</sub>(r) = √(6)·ρ·(4 - ρ)·e<sup>-ρ / 2</sup> / 54</div><div class=\"formula-line\">Y(θ,φ) = √(3 / 4π) · cosθ</div><div class=\"eq-caption\">Função de onda: ψ<sub>3,1,0</sub>(r,θ,φ) = R<sub>3,1</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>3,1,0</sub>(r,θ,φ) = R<sub>3,1</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">3p_z (3,1,0) • ρ = 2r / (3a<sub>0</sub>)</span>"
  },
  {
    "label": "3p_x",
    "tuple": "(3,1,1)",
    "n": 3,
    "l": 1,
    "m": 1,
    "plane": "xy",
    "key": "p_x",
    "radialNodes": 1,
    "angularNodes": 1,
    "radialExpr": "√(6)·ρ·(4 - ρ)·e<sup>-ρ / 2</sup> / 54",
    "angularExpr": "Y(θ,φ) = √(3 / 4π) · senθ · cosφ",
    "orientationText": "dois lóbulos alinhados ao eixo x, com plano nodal yz.",
    "familyName": "orbital p",
    "formulaTitle": "Resolução do 3p_x (3,1,1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "3p_x (3,1,1)",
    "chips": [
      "3p_x",
      "(3,1,1)",
      "nós radiais = 1",
      "nós angulares = 1"
    ],
    "text": [
      "Esta etapa fixa o estado 3p_x do hidrogênio. Como n=3, l=1 e m=1, a solução separada da equação de Schrödinger produz 1 nó(s) radial(is) e 1 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos alinhados ao eixo x, com plano nodal yz.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (3a₀), a parte radial R<sub>3,1</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 3p_x, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (3a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>3,1</sub>(r) = √(6)·ρ·(4 - ρ)·e<sup>-ρ / 2</sup> / 54</div><div class=\"formula-line\">Y(θ,φ) = √(3 / 4π) · senθ · cosφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>3,1,1</sub>(r,θ,φ) = R<sub>3,1</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>3,1,1</sub>(r,θ,φ) = R<sub>3,1</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">3p_x (3,1,1) • ρ = 2r / (3a<sub>0</sub>)</span>"
  },
  {
    "label": "3p_y",
    "tuple": "(3,1,-1)",
    "n": 3,
    "l": 1,
    "m": -1,
    "plane": "yz",
    "key": "p_y",
    "radialNodes": 1,
    "angularNodes": 1,
    "radialExpr": "√(6)·ρ·(4 - ρ)·e<sup>-ρ / 2</sup> / 54",
    "angularExpr": "Y(θ,φ) = √(3 / 4π) · senθ · senφ",
    "orientationText": "dois lóbulos alinhados ao eixo y, com plano nodal xz.",
    "familyName": "orbital p",
    "formulaTitle": "Resolução do 3p_y (3,1,-1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "3p_y (3,1,-1)",
    "chips": [
      "3p_y",
      "(3,1,-1)",
      "nós radiais = 1",
      "nós angulares = 1"
    ],
    "text": [
      "Esta etapa fixa o estado 3p_y do hidrogênio. Como n=3, l=1 e m=-1, a solução separada da equação de Schrödinger produz 1 nó(s) radial(is) e 1 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos alinhados ao eixo y, com plano nodal xz.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (3a₀), a parte radial R<sub>3,1</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 3p_y, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (3a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>3,1</sub>(r) = √(6)·ρ·(4 - ρ)·e<sup>-ρ / 2</sup> / 54</div><div class=\"formula-line\">Y(θ,φ) = √(3 / 4π) · senθ · senφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>3,1,-1</sub>(r,θ,φ) = R<sub>3,1</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>3,1,-1</sub>(r,θ,φ) = R<sub>3,1</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">3p_y (3,1,-1) • ρ = 2r / (3a<sub>0</sub>)</span>"
  },
  {
    "label": "3d_z²",
    "tuple": "(3,2,0)",
    "n": 3,
    "l": 2,
    "m": 0,
    "plane": "xz",
    "key": "d_z2",
    "radialNodes": 0,
    "angularNodes": 2,
    "radialExpr": "√(30)·ρ²·e<sup>-ρ / 2</sup> / 270",
    "angularExpr": "Y(θ,φ) = √(5 / 16π) · (3cos²θ − 1)",
    "orientationText": "dois lóbulos ao longo de z e cinturão central, com dois cones nodais.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 3d_z² (3,2,0)",
    "kicker": "Orbitais do hidrogênio",
    "title": "3d_z² (3,2,0)",
    "chips": [
      "3d_z²",
      "(3,2,0)",
      "nós radiais = 0",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 3d_z² do hidrogênio. Como n=3, l=2 e m=0, a solução separada da equação de Schrödinger produz 0 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos ao longo de z e cinturão central, com dois cones nodais.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (3a₀), a parte radial R<sub>3,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 3d_z², que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (3a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>3,2</sub>(r) = √(30)·ρ²·e<sup>-ρ / 2</sup> / 270</div><div class=\"formula-line\">Y(θ,φ) = √(5 / 16π) · (3cos²θ − 1)</div><div class=\"eq-caption\">Função de onda: ψ<sub>3,2,0</sub>(r,θ,φ) = R<sub>3,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>3,2,0</sub>(r,θ,φ) = R<sub>3,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">3d_z² (3,2,0) • ρ = 2r / (3a<sub>0</sub>)</span>"
  },
  {
    "label": "3d_xz",
    "tuple": "(3,2,1)",
    "n": 3,
    "l": 2,
    "m": 1,
    "plane": "xz",
    "key": "d_xz",
    "radialNodes": 0,
    "angularNodes": 2,
    "radialExpr": "√(30)·ρ²·e<sup>-ρ / 2</sup> / 270",
    "angularExpr": "Y(θ,φ) = √(15 / 4π) · senθ · cosθ · cosφ",
    "orientationText": "quatro regiões alternadas no plano xz, com dois planos nodais contendo o eixo y.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 3d_xz (3,2,1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "3d_xz (3,2,1)",
    "chips": [
      "3d_xz",
      "(3,2,1)",
      "nós radiais = 0",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 3d_xz do hidrogênio. Como n=3, l=2 e m=1, a solução separada da equação de Schrödinger produz 0 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como quatro regiões alternadas no plano xz, com dois planos nodais contendo o eixo y.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (3a₀), a parte radial R<sub>3,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 3d_xz, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (3a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>3,2</sub>(r) = √(30)·ρ²·e<sup>-ρ / 2</sup> / 270</div><div class=\"formula-line\">Y(θ,φ) = √(15 / 4π) · senθ · cosθ · cosφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>3,2,1</sub>(r,θ,φ) = R<sub>3,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>3,2,1</sub>(r,θ,φ) = R<sub>3,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">3d_xz (3,2,1) • ρ = 2r / (3a<sub>0</sub>)</span>"
  },
  {
    "label": "3d_yz",
    "tuple": "(3,2,-1)",
    "n": 3,
    "l": 2,
    "m": -1,
    "plane": "yz",
    "key": "d_yz",
    "radialNodes": 0,
    "angularNodes": 2,
    "radialExpr": "√(30)·ρ²·e<sup>-ρ / 2</sup> / 270",
    "angularExpr": "Y(θ,φ) = √(15 / 4π) · senθ · cosθ · senφ",
    "orientationText": "quatro regiões alternadas no plano yz, com dois planos nodais contendo o eixo x.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 3d_yz (3,2,-1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "3d_yz (3,2,-1)",
    "chips": [
      "3d_yz",
      "(3,2,-1)",
      "nós radiais = 0",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 3d_yz do hidrogênio. Como n=3, l=2 e m=-1, a solução separada da equação de Schrödinger produz 0 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como quatro regiões alternadas no plano yz, com dois planos nodais contendo o eixo x.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (3a₀), a parte radial R<sub>3,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 3d_yz, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (3a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>3,2</sub>(r) = √(30)·ρ²·e<sup>-ρ / 2</sup> / 270</div><div class=\"formula-line\">Y(θ,φ) = √(15 / 4π) · senθ · cosθ · senφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>3,2,-1</sub>(r,θ,φ) = R<sub>3,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>3,2,-1</sub>(r,θ,φ) = R<sub>3,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">3d_yz (3,2,-1) • ρ = 2r / (3a<sub>0</sub>)</span>"
  },
  {
    "label": "3d_x²−y²",
    "tuple": "(3,2,2)",
    "n": 3,
    "l": 2,
    "m": 2,
    "plane": "xy",
    "key": "d_x2_y2",
    "radialNodes": 0,
    "angularNodes": 2,
    "radialExpr": "√(30)·ρ²·e<sup>-ρ / 2</sup> / 270",
    "angularExpr": "Y(θ,φ) = √(15 / 16π) · sen²θ · cos(2φ)",
    "orientationText": "quatro lóbulos no plano xy alinhados aos eixos x e y, com planos nodais em x=±y.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 3d_x²−y² (3,2,2)",
    "kicker": "Orbitais do hidrogênio",
    "title": "3d_x²−y² (3,2,2)",
    "chips": [
      "3d_x²−y²",
      "(3,2,2)",
      "nós radiais = 0",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 3d_x²−y² do hidrogênio. Como n=3, l=2 e m=2, a solução separada da equação de Schrödinger produz 0 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como quatro lóbulos no plano xy alinhados aos eixos x e y, com planos nodais em x=±y.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (3a₀), a parte radial R<sub>3,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 3d_x²−y², que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (3a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>3,2</sub>(r) = √(30)·ρ²·e<sup>-ρ / 2</sup> / 270</div><div class=\"formula-line\">Y(θ,φ) = √(15 / 16π) · sen²θ · cos(2φ)</div><div class=\"eq-caption\">Função de onda: ψ<sub>3,2,2</sub>(r,θ,φ) = R<sub>3,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>3,2,2</sub>(r,θ,φ) = R<sub>3,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">3d_x²−y² (3,2,2) • ρ = 2r / (3a<sub>0</sub>)</span>"
  },
  {
    "label": "3d_xy",
    "tuple": "(3,2,-2)",
    "n": 3,
    "l": 2,
    "m": -2,
    "plane": "xy",
    "key": "d_xy",
    "radialNodes": 0,
    "angularNodes": 2,
    "radialExpr": "√(30)·ρ²·e<sup>-ρ / 2</sup> / 270",
    "angularExpr": "Y(θ,φ) = √(15 / 16π) · sen²θ · sen(2φ)",
    "orientationText": "quatro lóbulos no plano xy entre os eixos x e y, com planos nodais nos próprios eixos.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 3d_xy (3,2,-2)",
    "kicker": "Orbitais do hidrogênio",
    "title": "3d_xy (3,2,-2)",
    "chips": [
      "3d_xy",
      "(3,2,-2)",
      "nós radiais = 0",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 3d_xy do hidrogênio. Como n=3, l=2 e m=-2, a solução separada da equação de Schrödinger produz 0 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como quatro lóbulos no plano xy entre os eixos x e y, com planos nodais nos próprios eixos.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (3a₀), a parte radial R<sub>3,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 3d_xy, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (3a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>3,2</sub>(r) = √(30)·ρ²·e<sup>-ρ / 2</sup> / 270</div><div class=\"formula-line\">Y(θ,φ) = √(15 / 16π) · sen²θ · sen(2φ)</div><div class=\"eq-caption\">Função de onda: ψ<sub>3,2,-2</sub>(r,θ,φ) = R<sub>3,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>3,2,-2</sub>(r,θ,φ) = R<sub>3,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">3d_xy (3,2,-2) • ρ = 2r / (3a<sub>0</sub>)</span>"
  },
  {
    "label": "4s",
    "tuple": "(4,0,0)",
    "n": 4,
    "l": 0,
    "m": 0,
    "plane": "xz",
    "key": "s",
    "radialNodes": 3,
    "angularNodes": 0,
    "radialExpr": "(-ρ³ + 12·ρ² - 36·ρ + 24)·e<sup>-ρ / 2</sup> / 96",
    "angularExpr": "Y(θ,φ) = 1 / √(4π)",
    "orientationText": "simetria esférica, sem orientação preferencial.",
    "familyName": "orbital s",
    "formulaTitle": "Resolução do 4s (4,0,0)",
    "kicker": "Orbitais do hidrogênio",
    "title": "4s (4,0,0)",
    "chips": [
      "4s",
      "(4,0,0)",
      "nós radiais = 3",
      "nós angulares = 0"
    ],
    "text": [
      "Esta etapa fixa o estado 4s do hidrogênio. Como n=4, l=0 e m=0, a solução separada da equação de Schrödinger produz 3 nó(s) radial(is) e 0 nó(s) angular(es). Na visualização, isso aparece como simetria esférica, sem orientação preferencial.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (4a₀), a parte radial R<sub>4,0</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 4s, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (4a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>4,0</sub>(r) = (-ρ³ + 12·ρ² - 36·ρ + 24)·e<sup>-ρ / 2</sup> / 96</div><div class=\"formula-line\">Y(θ,φ) = 1 / √(4π)</div><div class=\"eq-caption\">Função de onda: ψ<sub>4,0,0</sub>(r,θ,φ) = R<sub>4,0</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>4,0,0</sub>(r,θ,φ) = R<sub>4,0</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">4s (4,0,0) • ρ = 2r / (4a<sub>0</sub>)</span>"
  },
  {
    "label": "4p_z",
    "tuple": "(4,1,0)",
    "n": 4,
    "l": 1,
    "m": 0,
    "plane": "xz",
    "key": "p_z",
    "radialNodes": 2,
    "angularNodes": 1,
    "radialExpr": "√(15)·ρ·(ρ² - 10·ρ + 20)·e<sup>-ρ / 2</sup> / 480",
    "angularExpr": "Y(θ,φ) = √(3 / 4π) · cosθ",
    "orientationText": "dois lóbulos alinhados ao eixo z, com plano nodal xy.",
    "familyName": "orbital p",
    "formulaTitle": "Resolução do 4p_z (4,1,0)",
    "kicker": "Orbitais do hidrogênio",
    "title": "4p_z (4,1,0)",
    "chips": [
      "4p_z",
      "(4,1,0)",
      "nós radiais = 2",
      "nós angulares = 1"
    ],
    "text": [
      "Esta etapa fixa o estado 4p_z do hidrogênio. Como n=4, l=1 e m=0, a solução separada da equação de Schrödinger produz 2 nó(s) radial(is) e 1 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos alinhados ao eixo z, com plano nodal xy.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (4a₀), a parte radial R<sub>4,1</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 4p_z, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (4a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>4,1</sub>(r) = √(15)·ρ·(ρ² - 10·ρ + 20)·e<sup>-ρ / 2</sup> / 480</div><div class=\"formula-line\">Y(θ,φ) = √(3 / 4π) · cosθ</div><div class=\"eq-caption\">Função de onda: ψ<sub>4,1,0</sub>(r,θ,φ) = R<sub>4,1</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>4,1,0</sub>(r,θ,φ) = R<sub>4,1</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">4p_z (4,1,0) • ρ = 2r / (4a<sub>0</sub>)</span>"
  },
  {
    "label": "4p_x",
    "tuple": "(4,1,1)",
    "n": 4,
    "l": 1,
    "m": 1,
    "plane": "xy",
    "key": "p_x",
    "radialNodes": 2,
    "angularNodes": 1,
    "radialExpr": "√(15)·ρ·(ρ² - 10·ρ + 20)·e<sup>-ρ / 2</sup> / 480",
    "angularExpr": "Y(θ,φ) = √(3 / 4π) · senθ · cosφ",
    "orientationText": "dois lóbulos alinhados ao eixo x, com plano nodal yz.",
    "familyName": "orbital p",
    "formulaTitle": "Resolução do 4p_x (4,1,1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "4p_x (4,1,1)",
    "chips": [
      "4p_x",
      "(4,1,1)",
      "nós radiais = 2",
      "nós angulares = 1"
    ],
    "text": [
      "Esta etapa fixa o estado 4p_x do hidrogênio. Como n=4, l=1 e m=1, a solução separada da equação de Schrödinger produz 2 nó(s) radial(is) e 1 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos alinhados ao eixo x, com plano nodal yz.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (4a₀), a parte radial R<sub>4,1</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 4p_x, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (4a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>4,1</sub>(r) = √(15)·ρ·(ρ² - 10·ρ + 20)·e<sup>-ρ / 2</sup> / 480</div><div class=\"formula-line\">Y(θ,φ) = √(3 / 4π) · senθ · cosφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>4,1,1</sub>(r,θ,φ) = R<sub>4,1</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>4,1,1</sub>(r,θ,φ) = R<sub>4,1</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">4p_x (4,1,1) • ρ = 2r / (4a<sub>0</sub>)</span>"
  },
  {
    "label": "4p_y",
    "tuple": "(4,1,-1)",
    "n": 4,
    "l": 1,
    "m": -1,
    "plane": "yz",
    "key": "p_y",
    "radialNodes": 2,
    "angularNodes": 1,
    "radialExpr": "√(15)·ρ·(ρ² - 10·ρ + 20)·e<sup>-ρ / 2</sup> / 480",
    "angularExpr": "Y(θ,φ) = √(3 / 4π) · senθ · senφ",
    "orientationText": "dois lóbulos alinhados ao eixo y, com plano nodal xz.",
    "familyName": "orbital p",
    "formulaTitle": "Resolução do 4p_y (4,1,-1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "4p_y (4,1,-1)",
    "chips": [
      "4p_y",
      "(4,1,-1)",
      "nós radiais = 2",
      "nós angulares = 1"
    ],
    "text": [
      "Esta etapa fixa o estado 4p_y do hidrogênio. Como n=4, l=1 e m=-1, a solução separada da equação de Schrödinger produz 2 nó(s) radial(is) e 1 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos alinhados ao eixo y, com plano nodal xz.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (4a₀), a parte radial R<sub>4,1</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 4p_y, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (4a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>4,1</sub>(r) = √(15)·ρ·(ρ² - 10·ρ + 20)·e<sup>-ρ / 2</sup> / 480</div><div class=\"formula-line\">Y(θ,φ) = √(3 / 4π) · senθ · senφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>4,1,-1</sub>(r,θ,φ) = R<sub>4,1</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>4,1,-1</sub>(r,θ,φ) = R<sub>4,1</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">4p_y (4,1,-1) • ρ = 2r / (4a<sub>0</sub>)</span>"
  },
  {
    "label": "4d_z²",
    "tuple": "(4,2,0)",
    "n": 4,
    "l": 2,
    "m": 0,
    "plane": "xz",
    "key": "d_z2",
    "radialNodes": 1,
    "angularNodes": 2,
    "radialExpr": "√(5)·ρ²·(6 - ρ)·e<sup>-ρ / 2</sup> / 480",
    "angularExpr": "Y(θ,φ) = √(5 / 16π) · (3cos²θ − 1)",
    "orientationText": "dois lóbulos ao longo de z e cinturão central, com dois cones nodais.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 4d_z² (4,2,0)",
    "kicker": "Orbitais do hidrogênio",
    "title": "4d_z² (4,2,0)",
    "chips": [
      "4d_z²",
      "(4,2,0)",
      "nós radiais = 1",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 4d_z² do hidrogênio. Como n=4, l=2 e m=0, a solução separada da equação de Schrödinger produz 1 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos ao longo de z e cinturão central, com dois cones nodais.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (4a₀), a parte radial R<sub>4,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 4d_z², que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (4a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>4,2</sub>(r) = √(5)·ρ²·(6 - ρ)·e<sup>-ρ / 2</sup> / 480</div><div class=\"formula-line\">Y(θ,φ) = √(5 / 16π) · (3cos²θ − 1)</div><div class=\"eq-caption\">Função de onda: ψ<sub>4,2,0</sub>(r,θ,φ) = R<sub>4,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>4,2,0</sub>(r,θ,φ) = R<sub>4,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">4d_z² (4,2,0) • ρ = 2r / (4a<sub>0</sub>)</span>"
  },
  {
    "label": "4d_xz",
    "tuple": "(4,2,1)",
    "n": 4,
    "l": 2,
    "m": 1,
    "plane": "xz",
    "key": "d_xz",
    "radialNodes": 1,
    "angularNodes": 2,
    "radialExpr": "√(5)·ρ²·(6 - ρ)·e<sup>-ρ / 2</sup> / 480",
    "angularExpr": "Y(θ,φ) = √(15 / 4π) · senθ · cosθ · cosφ",
    "orientationText": "quatro regiões alternadas no plano xz, com dois planos nodais contendo o eixo y.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 4d_xz (4,2,1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "4d_xz (4,2,1)",
    "chips": [
      "4d_xz",
      "(4,2,1)",
      "nós radiais = 1",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 4d_xz do hidrogênio. Como n=4, l=2 e m=1, a solução separada da equação de Schrödinger produz 1 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como quatro regiões alternadas no plano xz, com dois planos nodais contendo o eixo y.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (4a₀), a parte radial R<sub>4,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 4d_xz, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (4a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>4,2</sub>(r) = √(5)·ρ²·(6 - ρ)·e<sup>-ρ / 2</sup> / 480</div><div class=\"formula-line\">Y(θ,φ) = √(15 / 4π) · senθ · cosθ · cosφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>4,2,1</sub>(r,θ,φ) = R<sub>4,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>4,2,1</sub>(r,θ,φ) = R<sub>4,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">4d_xz (4,2,1) • ρ = 2r / (4a<sub>0</sub>)</span>"
  },
  {
    "label": "4d_yz",
    "tuple": "(4,2,-1)",
    "n": 4,
    "l": 2,
    "m": -1,
    "plane": "yz",
    "key": "d_yz",
    "radialNodes": 1,
    "angularNodes": 2,
    "radialExpr": "√(5)·ρ²·(6 - ρ)·e<sup>-ρ / 2</sup> / 480",
    "angularExpr": "Y(θ,φ) = √(15 / 4π) · senθ · cosθ · senφ",
    "orientationText": "quatro regiões alternadas no plano yz, com dois planos nodais contendo o eixo x.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 4d_yz (4,2,-1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "4d_yz (4,2,-1)",
    "chips": [
      "4d_yz",
      "(4,2,-1)",
      "nós radiais = 1",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 4d_yz do hidrogênio. Como n=4, l=2 e m=-1, a solução separada da equação de Schrödinger produz 1 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como quatro regiões alternadas no plano yz, com dois planos nodais contendo o eixo x.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (4a₀), a parte radial R<sub>4,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 4d_yz, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (4a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>4,2</sub>(r) = √(5)·ρ²·(6 - ρ)·e<sup>-ρ / 2</sup> / 480</div><div class=\"formula-line\">Y(θ,φ) = √(15 / 4π) · senθ · cosθ · senφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>4,2,-1</sub>(r,θ,φ) = R<sub>4,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>4,2,-1</sub>(r,θ,φ) = R<sub>4,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">4d_yz (4,2,-1) • ρ = 2r / (4a<sub>0</sub>)</span>"
  },
  {
    "label": "4d_x²−y²",
    "tuple": "(4,2,2)",
    "n": 4,
    "l": 2,
    "m": 2,
    "plane": "xy",
    "key": "d_x2_y2",
    "radialNodes": 1,
    "angularNodes": 2,
    "radialExpr": "√(5)·ρ²·(6 - ρ)·e<sup>-ρ / 2</sup> / 480",
    "angularExpr": "Y(θ,φ) = √(15 / 16π) · sen²θ · cos(2φ)",
    "orientationText": "quatro lóbulos no plano xy alinhados aos eixos x e y, com planos nodais em x=±y.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 4d_x²−y² (4,2,2)",
    "kicker": "Orbitais do hidrogênio",
    "title": "4d_x²−y² (4,2,2)",
    "chips": [
      "4d_x²−y²",
      "(4,2,2)",
      "nós radiais = 1",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 4d_x²−y² do hidrogênio. Como n=4, l=2 e m=2, a solução separada da equação de Schrödinger produz 1 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como quatro lóbulos no plano xy alinhados aos eixos x e y, com planos nodais em x=±y.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (4a₀), a parte radial R<sub>4,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 4d_x²−y², que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (4a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>4,2</sub>(r) = √(5)·ρ²·(6 - ρ)·e<sup>-ρ / 2</sup> / 480</div><div class=\"formula-line\">Y(θ,φ) = √(15 / 16π) · sen²θ · cos(2φ)</div><div class=\"eq-caption\">Função de onda: ψ<sub>4,2,2</sub>(r,θ,φ) = R<sub>4,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>4,2,2</sub>(r,θ,φ) = R<sub>4,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">4d_x²−y² (4,2,2) • ρ = 2r / (4a<sub>0</sub>)</span>"
  },
  {
    "label": "4d_xy",
    "tuple": "(4,2,-2)",
    "n": 4,
    "l": 2,
    "m": -2,
    "plane": "xy",
    "key": "d_xy",
    "radialNodes": 1,
    "angularNodes": 2,
    "radialExpr": "√(5)·ρ²·(6 - ρ)·e<sup>-ρ / 2</sup> / 480",
    "angularExpr": "Y(θ,φ) = √(15 / 16π) · sen²θ · sen(2φ)",
    "orientationText": "quatro lóbulos no plano xy entre os eixos x e y, com planos nodais nos próprios eixos.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 4d_xy (4,2,-2)",
    "kicker": "Orbitais do hidrogênio",
    "title": "4d_xy (4,2,-2)",
    "chips": [
      "4d_xy",
      "(4,2,-2)",
      "nós radiais = 1",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 4d_xy do hidrogênio. Como n=4, l=2 e m=-2, a solução separada da equação de Schrödinger produz 1 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como quatro lóbulos no plano xy entre os eixos x e y, com planos nodais nos próprios eixos.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (4a₀), a parte radial R<sub>4,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 4d_xy, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (4a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>4,2</sub>(r) = √(5)·ρ²·(6 - ρ)·e<sup>-ρ / 2</sup> / 480</div><div class=\"formula-line\">Y(θ,φ) = √(15 / 16π) · sen²θ · sen(2φ)</div><div class=\"eq-caption\">Função de onda: ψ<sub>4,2,-2</sub>(r,θ,φ) = R<sub>4,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>4,2,-2</sub>(r,θ,φ) = R<sub>4,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">4d_xy (4,2,-2) • ρ = 2r / (4a<sub>0</sub>)</span>"
  },
  {
    "label": "5s",
    "tuple": "(5,0,0)",
    "n": 5,
    "l": 0,
    "m": 0,
    "plane": "xz",
    "key": "s",
    "radialNodes": 4,
    "angularNodes": 0,
    "radialExpr": "√(5)·(ρ⁴ - 20·ρ³ + 120·ρ² - 240·ρ + 120)·e<sup>-ρ / 2</sup> / 1500",
    "angularExpr": "Y(θ,φ) = 1 / √(4π)",
    "orientationText": "simetria esférica, sem orientação preferencial.",
    "familyName": "orbital s",
    "formulaTitle": "Resolução do 5s (5,0,0)",
    "kicker": "Orbitais do hidrogênio",
    "title": "5s (5,0,0)",
    "chips": [
      "5s",
      "(5,0,0)",
      "nós radiais = 4",
      "nós angulares = 0"
    ],
    "text": [
      "Esta etapa fixa o estado 5s do hidrogênio. Como n=5, l=0 e m=0, a solução separada da equação de Schrödinger produz 4 nó(s) radial(is) e 0 nó(s) angular(es). Na visualização, isso aparece como simetria esférica, sem orientação preferencial.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (5a₀), a parte radial R<sub>5,0</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 5s, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (5a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>5,0</sub>(r) = √(5)·(ρ⁴ - 20·ρ³ + 120·ρ² - 240·ρ + 120)·e<sup>-ρ / 2</sup> / 1500</div><div class=\"formula-line\">Y(θ,φ) = 1 / √(4π)</div><div class=\"eq-caption\">Função de onda: ψ<sub>5,0,0</sub>(r,θ,φ) = R<sub>5,0</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>5,0,0</sub>(r,θ,φ) = R<sub>5,0</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">5s (5,0,0) • ρ = 2r / (5a<sub>0</sub>)</span>"
  },
  {
    "label": "5p_z",
    "tuple": "(5,1,0)",
    "n": 5,
    "l": 1,
    "m": 0,
    "plane": "xz",
    "key": "p_z",
    "radialNodes": 3,
    "angularNodes": 1,
    "radialExpr": "√(30)·ρ·(-ρ³ + 18·ρ² - 90·ρ + 120)·e<sup>-ρ / 2</sup> / 4500",
    "angularExpr": "Y(θ,φ) = √(3 / 4π) · cosθ",
    "orientationText": "dois lóbulos alinhados ao eixo z, com plano nodal xy.",
    "familyName": "orbital p",
    "formulaTitle": "Resolução do 5p_z (5,1,0)",
    "kicker": "Orbitais do hidrogênio",
    "title": "5p_z (5,1,0)",
    "chips": [
      "5p_z",
      "(5,1,0)",
      "nós radiais = 3",
      "nós angulares = 1"
    ],
    "text": [
      "Esta etapa fixa o estado 5p_z do hidrogênio. Como n=5, l=1 e m=0, a solução separada da equação de Schrödinger produz 3 nó(s) radial(is) e 1 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos alinhados ao eixo z, com plano nodal xy.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (5a₀), a parte radial R<sub>5,1</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 5p_z, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (5a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>5,1</sub>(r) = √(30)·ρ·(-ρ³ + 18·ρ² - 90·ρ + 120)·e<sup>-ρ / 2</sup> / 4500</div><div class=\"formula-line\">Y(θ,φ) = √(3 / 4π) · cosθ</div><div class=\"eq-caption\">Função de onda: ψ<sub>5,1,0</sub>(r,θ,φ) = R<sub>5,1</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>5,1,0</sub>(r,θ,φ) = R<sub>5,1</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">5p_z (5,1,0) • ρ = 2r / (5a<sub>0</sub>)</span>"
  },
  {
    "label": "5p_x",
    "tuple": "(5,1,1)",
    "n": 5,
    "l": 1,
    "m": 1,
    "plane": "xy",
    "key": "p_x",
    "radialNodes": 3,
    "angularNodes": 1,
    "radialExpr": "√(30)·ρ·(-ρ³ + 18·ρ² - 90·ρ + 120)·e<sup>-ρ / 2</sup> / 4500",
    "angularExpr": "Y(θ,φ) = √(3 / 4π) · senθ · cosφ",
    "orientationText": "dois lóbulos alinhados ao eixo x, com plano nodal yz.",
    "familyName": "orbital p",
    "formulaTitle": "Resolução do 5p_x (5,1,1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "5p_x (5,1,1)",
    "chips": [
      "5p_x",
      "(5,1,1)",
      "nós radiais = 3",
      "nós angulares = 1"
    ],
    "text": [
      "Esta etapa fixa o estado 5p_x do hidrogênio. Como n=5, l=1 e m=1, a solução separada da equação de Schrödinger produz 3 nó(s) radial(is) e 1 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos alinhados ao eixo x, com plano nodal yz.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (5a₀), a parte radial R<sub>5,1</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 5p_x, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (5a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>5,1</sub>(r) = √(30)·ρ·(-ρ³ + 18·ρ² - 90·ρ + 120)·e<sup>-ρ / 2</sup> / 4500</div><div class=\"formula-line\">Y(θ,φ) = √(3 / 4π) · senθ · cosφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>5,1,1</sub>(r,θ,φ) = R<sub>5,1</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>5,1,1</sub>(r,θ,φ) = R<sub>5,1</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">5p_x (5,1,1) • ρ = 2r / (5a<sub>0</sub>)</span>"
  },
  {
    "label": "5p_y",
    "tuple": "(5,1,-1)",
    "n": 5,
    "l": 1,
    "m": -1,
    "plane": "yz",
    "key": "p_y",
    "radialNodes": 3,
    "angularNodes": 1,
    "radialExpr": "√(30)·ρ·(-ρ³ + 18·ρ² - 90·ρ + 120)·e<sup>-ρ / 2</sup> / 4500",
    "angularExpr": "Y(θ,φ) = √(3 / 4π) · senθ · senφ",
    "orientationText": "dois lóbulos alinhados ao eixo y, com plano nodal xz.",
    "familyName": "orbital p",
    "formulaTitle": "Resolução do 5p_y (5,1,-1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "5p_y (5,1,-1)",
    "chips": [
      "5p_y",
      "(5,1,-1)",
      "nós radiais = 3",
      "nós angulares = 1"
    ],
    "text": [
      "Esta etapa fixa o estado 5p_y do hidrogênio. Como n=5, l=1 e m=-1, a solução separada da equação de Schrödinger produz 3 nó(s) radial(is) e 1 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos alinhados ao eixo y, com plano nodal xz.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (5a₀), a parte radial R<sub>5,1</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 5p_y, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (5a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>5,1</sub>(r) = √(30)·ρ·(-ρ³ + 18·ρ² - 90·ρ + 120)·e<sup>-ρ / 2</sup> / 4500</div><div class=\"formula-line\">Y(θ,φ) = √(3 / 4π) · senθ · senφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>5,1,-1</sub>(r,θ,φ) = R<sub>5,1</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>5,1,-1</sub>(r,θ,φ) = R<sub>5,1</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">5p_y (5,1,-1) • ρ = 2r / (5a<sub>0</sub>)</span>"
  },
  {
    "label": "5d_z²",
    "tuple": "(5,2,0)",
    "n": 5,
    "l": 2,
    "m": 0,
    "plane": "xz",
    "key": "d_z2",
    "radialNodes": 2,
    "angularNodes": 2,
    "radialExpr": "√(70)·ρ²·(ρ² - 14·ρ + 42)·e<sup>-ρ / 2</sup> / 10500",
    "angularExpr": "Y(θ,φ) = √(5 / 16π) · (3cos²θ − 1)",
    "orientationText": "dois lóbulos ao longo de z e cinturão central, com dois cones nodais.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 5d_z² (5,2,0)",
    "kicker": "Orbitais do hidrogênio",
    "title": "5d_z² (5,2,0)",
    "chips": [
      "5d_z²",
      "(5,2,0)",
      "nós radiais = 2",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 5d_z² do hidrogênio. Como n=5, l=2 e m=0, a solução separada da equação de Schrödinger produz 2 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como dois lóbulos ao longo de z e cinturão central, com dois cones nodais.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (5a₀), a parte radial R<sub>5,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 5d_z², que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (5a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>5,2</sub>(r) = √(70)·ρ²·(ρ² - 14·ρ + 42)·e<sup>-ρ / 2</sup> / 10500</div><div class=\"formula-line\">Y(θ,φ) = √(5 / 16π) · (3cos²θ − 1)</div><div class=\"eq-caption\">Função de onda: ψ<sub>5,2,0</sub>(r,θ,φ) = R<sub>5,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>5,2,0</sub>(r,θ,φ) = R<sub>5,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">5d_z² (5,2,0) • ρ = 2r / (5a<sub>0</sub>)</span>"
  },
  {
    "label": "5d_xz",
    "tuple": "(5,2,1)",
    "n": 5,
    "l": 2,
    "m": 1,
    "plane": "xz",
    "key": "d_xz",
    "radialNodes": 2,
    "angularNodes": 2,
    "radialExpr": "√(70)·ρ²·(ρ² - 14·ρ + 42)·e<sup>-ρ / 2</sup> / 10500",
    "angularExpr": "Y(θ,φ) = √(15 / 4π) · senθ · cosθ · cosφ",
    "orientationText": "quatro regiões alternadas no plano xz, com dois planos nodais contendo o eixo y.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 5d_xz (5,2,1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "5d_xz (5,2,1)",
    "chips": [
      "5d_xz",
      "(5,2,1)",
      "nós radiais = 2",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 5d_xz do hidrogênio. Como n=5, l=2 e m=1, a solução separada da equação de Schrödinger produz 2 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como quatro regiões alternadas no plano xz, com dois planos nodais contendo o eixo y.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (5a₀), a parte radial R<sub>5,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 5d_xz, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (5a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>5,2</sub>(r) = √(70)·ρ²·(ρ² - 14·ρ + 42)·e<sup>-ρ / 2</sup> / 10500</div><div class=\"formula-line\">Y(θ,φ) = √(15 / 4π) · senθ · cosθ · cosφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>5,2,1</sub>(r,θ,φ) = R<sub>5,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>5,2,1</sub>(r,θ,φ) = R<sub>5,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">5d_xz (5,2,1) • ρ = 2r / (5a<sub>0</sub>)</span>"
  },
  {
    "label": "5d_yz",
    "tuple": "(5,2,-1)",
    "n": 5,
    "l": 2,
    "m": -1,
    "plane": "yz",
    "key": "d_yz",
    "radialNodes": 2,
    "angularNodes": 2,
    "radialExpr": "√(70)·ρ²·(ρ² - 14·ρ + 42)·e<sup>-ρ / 2</sup> / 10500",
    "angularExpr": "Y(θ,φ) = √(15 / 4π) · senθ · cosθ · senφ",
    "orientationText": "quatro regiões alternadas no plano yz, com dois planos nodais contendo o eixo x.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 5d_yz (5,2,-1)",
    "kicker": "Orbitais do hidrogênio",
    "title": "5d_yz (5,2,-1)",
    "chips": [
      "5d_yz",
      "(5,2,-1)",
      "nós radiais = 2",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 5d_yz do hidrogênio. Como n=5, l=2 e m=-1, a solução separada da equação de Schrödinger produz 2 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como quatro regiões alternadas no plano yz, com dois planos nodais contendo o eixo x.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (5a₀), a parte radial R<sub>5,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 5d_yz, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (5a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>5,2</sub>(r) = √(70)·ρ²·(ρ² - 14·ρ + 42)·e<sup>-ρ / 2</sup> / 10500</div><div class=\"formula-line\">Y(θ,φ) = √(15 / 4π) · senθ · cosθ · senφ</div><div class=\"eq-caption\">Função de onda: ψ<sub>5,2,-1</sub>(r,θ,φ) = R<sub>5,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>5,2,-1</sub>(r,θ,φ) = R<sub>5,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">5d_yz (5,2,-1) • ρ = 2r / (5a<sub>0</sub>)</span>"
  },
  {
    "label": "5d_x²−y²",
    "tuple": "(5,2,2)",
    "n": 5,
    "l": 2,
    "m": 2,
    "plane": "xy",
    "key": "d_x2_y2",
    "radialNodes": 2,
    "angularNodes": 2,
    "radialExpr": "√(70)·ρ²·(ρ² - 14·ρ + 42)·e<sup>-ρ / 2</sup> / 10500",
    "angularExpr": "Y(θ,φ) = √(15 / 16π) · sen²θ · cos(2φ)",
    "orientationText": "quatro lóbulos no plano xy alinhados aos eixos x e y, com planos nodais em x=±y.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 5d_x²−y² (5,2,2)",
    "kicker": "Orbitais do hidrogênio",
    "title": "5d_x²−y² (5,2,2)",
    "chips": [
      "5d_x²−y²",
      "(5,2,2)",
      "nós radiais = 2",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 5d_x²−y² do hidrogênio. Como n=5, l=2 e m=2, a solução separada da equação de Schrödinger produz 2 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como quatro lóbulos no plano xy alinhados aos eixos x e y, com planos nodais em x=±y.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (5a₀), a parte radial R<sub>5,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 5d_x²−y², que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (5a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>5,2</sub>(r) = √(70)·ρ²·(ρ² - 14·ρ + 42)·e<sup>-ρ / 2</sup> / 10500</div><div class=\"formula-line\">Y(θ,φ) = √(15 / 16π) · sen²θ · cos(2φ)</div><div class=\"eq-caption\">Função de onda: ψ<sub>5,2,2</sub>(r,θ,φ) = R<sub>5,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>5,2,2</sub>(r,θ,φ) = R<sub>5,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">5d_x²−y² (5,2,2) • ρ = 2r / (5a<sub>0</sub>)</span>"
  },
  {
    "label": "5d_xy",
    "tuple": "(5,2,-2)",
    "n": 5,
    "l": 2,
    "m": -2,
    "plane": "xy",
    "key": "d_xy",
    "radialNodes": 2,
    "angularNodes": 2,
    "radialExpr": "√(70)·ρ²·(ρ² - 14·ρ + 42)·e<sup>-ρ / 2</sup> / 10500",
    "angularExpr": "Y(θ,φ) = √(15 / 16π) · sen²θ · sen(2φ)",
    "orientationText": "quatro lóbulos no plano xy entre os eixos x e y, com planos nodais nos próprios eixos.",
    "familyName": "orbital d",
    "formulaTitle": "Resolução do 5d_xy (5,2,-2)",
    "kicker": "Orbitais do hidrogênio",
    "title": "5d_xy (5,2,-2)",
    "chips": [
      "5d_xy",
      "(5,2,-2)",
      "nós radiais = 2",
      "nós angulares = 2"
    ],
    "text": [
      "Esta etapa fixa o estado 5d_xy do hidrogênio. Como n=5, l=2 e m=-2, a solução separada da equação de Schrödinger produz 2 nó(s) radial(is) e 2 nó(s) angular(es). Na visualização, isso aparece como quatro lóbulos no plano xy entre os eixos x e y, com planos nodais nos próprios eixos.",
      "A leitura matemática foi organizada em três camadas: a variável reduzida ρ = 2r / (5a₀), a parte radial R<sub>5,2</sub>(r) e a parte angular Y(θ,φ). O produto entre essas duas partes gera a função de onda do orbital 5d_xy, que é justamente a base do corte 2D e do modo 3D."
    ],
    "callout": "As fórmulas estão escritas para H (Z=1). O seletor de Z permite comparar a mesma família em outras espécies hidrogenoides.",
    "formulaHtml": "<div class=\"eq-stack\"><div class=\"formula-line\">ρ = 2r / (5a<sub>0</sub>)</div><div class=\"formula-line\">R<sub>5,2</sub>(r) = √(70)·ρ²·(ρ² - 14·ρ + 42)·e<sup>-ρ / 2</sup> / 10500</div><div class=\"formula-line\">Y(θ,φ) = √(15 / 16π) · sen²θ · sen(2φ)</div><div class=\"eq-caption\">Função de onda: ψ<sub>5,2,-2</sub>(r,θ,φ) = R<sub>5,2</sub>(r) · Y(θ,φ)</div></div>",
    "bannerHtml": "<span class=\"eq-main\">ψ<sub>5,2,-2</sub>(r,θ,φ) = R<sub>5,2</sub>(r) · Y(θ,φ)</span><span class=\"eq-small\">5d_xy (5,2,-2) • ρ = 2r / (5a<sub>0</sub>)</span>"
  }
]


const orbitalDetailSteps = orbitalDetailCatalog.filter((item) => item.n <= 3).map(buildOrbitalDetailStep)
const transitionIndex = steps.findIndex((step) => step.scene === 'transitions')
if(transitionIndex >= 0) steps.splice(transitionIndex, 0, ...orbitalDetailSteps)
else steps.push(...orbitalDetailSteps)

const orbitalAtlasList = orbitalDetailCatalog.map((item) => ({label:item.label, tuple:item.tuple, n:item.n, l:item.l, m:item.m, plane:item.plane, key:item.key}))

const orbitalImageCache = new Map()
const orbitalPrecomputedImages = {"n1__s__xy": "data:image/webp;base64,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", "n2__p_x__xy": "data:image/webp;base64,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", "n2__p_y__yz": "data:image/webp;base64,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", "n2__p_z__xz": "data:image/webp;base64,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", "n2__s__xy": "data:image/webp;base64,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", "n3__d_x2_y2__xy": "data:image/webp;base64,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", "n3__d_xy__xy": "data:image/webp;base64,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", "n3__d_xz__xz": "data:image/webp;base64,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", "n3__d_yz__yz": "data:image/webp;base64,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", "n3__d_z2__xz": "data:image/webp;base64,UklGRlwLAABXRUJQVlA4IFALAACwaACdASpAAUABPj0ejUSiJSgSO1x4gAPEs7d4wB7FsAOQNurH6DspZ9Zern4HI7mbiAeLH+rGP7/vvon5LZ+5GGDf/31E+yecPzZNqr58wHUA1MRdEuRfKKdW6xqZibhBE4Z7K5F8lyPEO+Us7pyaUMiL+ML/+DA30WqnjGP40rTyyjtf4FNe8XgPwf0yvg07KCExJjb6NFKdh/GkRrrB8q6LSxpM3YZ6VHr0ANs1f6SCaG0jhf40hhe7sNJMg+BrAcivIRO+nU52zXjfLBN9YcpKEW3aQtBpN8kho6g08qGsmWIjYGaCYKEfPtEkEvtJ/RV6Um9J4vwfoINny1zOtMMF4Gso/hDIKY9kqK2N2/kPlYDOhvb1TFjfP4kQIU4JB6ssKYyTabT2jVs9YUCwmzjh9D9owU9CKl4cQVtYMop2N5mIKvX7lNlnnovr5zdGSA1agFXEKzds1kmTB0RzG2kURvb5FtObbstbUAOiHRZFHW4Y2YNpLNzK15mzIzR1Ez9W3d1YCf65mO3TYFXVcq4G9XK/k3bWUJ4dOzawmQVEsbTsWZ8339VzNJ/unCUj6S6hOeQXLHDuVoCQxXklu8fURxVO8GsOfsWsJGEdMAVhrvD3AyYH95cYx7wE4fj7sQJfO4slgd4YQrtKG2aFlHZod3Ah2NjKfb5O+SN/fgoIYxZqmBb/Achbx+Y1BLM5dGmotoDWV4cW1laLuvsjfG0/Zcv3gRZutiInuFRewVq/9Ns0lJQdlMzgx6ct2n7k2MBUX0INUZIz555kOu9UF35Uzc7p18SM8jIE43ClH/b63h4V6TRn+oVknz7Ny9oCSOMccRPTkdJAPftwmZRF8yHD9z6JEFp6QWVsOiUDBaJoVFIQy0aVXWEJOUW7oRgDkyvPOs5pwAc4Ro9jFXFYmyZgBzNHe9F10iBRA7U5h2xfp0XDb7Ysu0etM/vqRxCiewflgHngli5bi4zFaEjmSaPDZEXyVuqE2EssNuMwqye+OGaG877VURE7/t+erFk1pbNCKWQ2GBHRFeBUXlWtFrC7TS0Ulxk6WrOwsJYQOEaO/KJwsRGuYdzu3zfTwnKY7OjXV/wqnH1fydFIORF8lyMzgtObhRd8QvZXIEAA/vbFr3kLCe0rTE1hMC1+JwG9k6tidChAAIezlqeBOdfPqyPW1CTpt1+fMnME5bUObgAqc4fac4yFxhdOpI1/+TMlYK+KljZ4NSo8CN8UOcGVX6C3N659gAAdvs4h5+bDjU3f06NQTc6HSh+qU6Vy9hhINLfdOJOwleClAdXMTaLSg2a9d1534p7Gnr8HCgPL15jrONnDCuktPu3Yut1YR6fp2oewk8jsM2qwkqEFViVv5UtBqrBnci9PRqgh3g8/7FKtwQf8K/vRhOYTFdi9i5qW/XcAa0eakVyBl6vcFQPG6TMUKem5aL9k+mX+WNWu+DKiHV15iDoLLHez+w0Mc7WFJ8GO/PoLVsSVJSkkzKs6U0jBX3n57AXoJ8BCVJNhS8hycZD3RXsKxogT1R2rd5guHichp0QCNq8aOPyM3SqcJBuhDFB2YFI2KYcqe0zIviY9xVwW7PccW9PTlrCDPhK3OA1YpNxrogrA2oEg2trcLbKCyC+dxBvpTiLue7327J/zzYw9fdDjpnzFL4KaVNLbfb7YIyQKcLIQwW6uvV3URI5pokexwDuc9Tj+MZp7xzESSH0g2c79Su4pY1vSIrjh5uvT7t2Wgf2cZ00xqM4UjjoYhX9PjyNm1eApW45B3L69lx8ZrMlfSAl4Px+o5rCfHWTM8eTI0DBD1oi60S6Dr51SH03poonqAok2K5C2lNH1BDsZNt3Gi2nvEeuhjcm8+/jw6pq9UsFUGXvVVFAZJeETUzOTBPp4gbfNqdJUYHp7Sgmms6kaZR8xvsAFVT7xfGkAyqQTxN6rxKP/lhfpHveJxRAaZtvRFZBcyTdt+S1dsITz1GJkbovG/RYvrn+hmRhhoaYuD5/n35v7y2Mj/NQrTmxNsS1UGNB/gAgF7231/mtf42Zm3wf/LbAUv0SR5ezRueJqdHKq2Pu9uGeFAqzMDoatx+2xqdiyeSuSaXtTt/GIm05fkwPZdS8Gd47HuwR3ue5Hi15thHxCG9iEJD6bTZ0bYbAugI88Hyu13TtYVwTRkMam1ArJ1CEv6Me01K5xQzu3v+JfNLg04ClkiA5CYR+QsnzjqT3lpOJJ3EyRMYpQFW+9xuIf6r9Col0Zf3IXynYox63Q5YMazkPZp+3XtXNrsFmY3HEqvZesadgBlXwp8iGi+q4EbRvPVoqrgzSaasHhC6+QPiglXjrevGp59lrYxv/9f+f6+Q3zSSze5nP7OB87y5o0hLzNKfnAqvpzLSgUYzs4/C8w8zTVF0G2w6d3Ts7DJqlFxNuf/ujqHDI4NNr1k931C7igrLYo9JmeME95J0Ue9puF9+CIzrIvJ65etSE5FuwSG9d98jKhUGw4FIMUjdWWczbe5j3QIskTtFsPxwCXdlYFgFxl+qdA5hdY5ij1t44LVReRBcEZ6OEbS7N6GXqPrbAqwkp1n2fZ0BL6z03cXv6EAt8Oza7n9sDrNbRQzTvdroRkdQJrC1XtTGWnpVOxYdDYjPkLNfPEvkFa/8H9VWajhvd/b64a7gfRIkL7OoxGuER0drf5A7TiIbUl2PrQWTLhH1M8ukxnOUgYqM+IDKhgqJZIWLUBub3SaixYqA7mq38jKBIpj5soQNs8mHfWXeZr9J8WHNlsY3vprWIWWL7niD2M1P5BfTspeP0Def6vcjgZEfw26muX1sF4W3CHWGXAiJxNBlnnm9ydbDAdLOlhKnStFV9jlJ5Fc7BHqJ+xKcQCNaR1Hz1ycFv3jwjg2aBmgH+s67vGK1+Ae2y7w86JA1VK8L/fzvBtdgPs6Tn44nElzRv3xFL1THWnBv4yNdXfb7QYwHU/HOkQzS6EPzgIkjcKw6em+NqTKlxz9QUppegEEfKdddpOZs6ZI3qn4jV1U+7PDDSxAqvrxuh6ty8baR7qyJ0V+5kjS5YBo6CEpH4Wf+YR2/RxRRtbAZqRFts0nBGRJQogqjvtYRFybysl7hx5RFp88OJMa36mnmFpqXjA7t6imLedOQr1YEpcmkvPicyZxd5u7HjXYh3l+7BbGVqBsKzsvkVltjRfSKw8pHVXygjXbgD4oGVx9NkBPG2KyjsYvXCKQFWhppmYAjQq2YVNy3OyFtmVjpvV9kBaLAPeRCmR7/62A0Io3Hg4IHucjyFhd19ERAfNgsHkKQzszpVl91qjWe+x5K0GY6BjRmxshjBeBri4ANZybEAzCiO0fANBt24Gi+TB5kL1LON/ny8X1zhiqp3iFaEPHzelCUszynwicAh05UfadZLp+Y87zh7MC2IGDu4DX+hkAmBFJmbxRMiC2K0JlXjcYn3VJaT9sBwxKTGkO4Chxe5uEZ1WERfvbVvdrFke0yHVmAoLuqgBWC0v+H2fgrplWzii9aCK59LmQrJDrXB0wt0ZeAuectkOPgBk0HDHsUkWT0Z8zhMdnNPzPjWYBvRa2VzqY5O5cIqdYHwzU2eb3rg0L1zEmyjsGdzFB4VDn3v/11SrZSOriBXKwcAQNnAAc7tCtro+ZPhx/4mkQgMnAqNWqkW/rxL85Zt8cyx3GH4sWlSwhsCVwtSJxk8URNuqsWy10HmrIjKHS7QCsMcMY01VRA+vWXdybOWoiYHBAuBSyyze9z/MDNFO599/2LdrcxpXXUyI5xbGVryNC+SbghQAxfkPCru7VRtCjXFxAHQNWg2/i4Ksq/hPl6gVOthqzRlDgFAAAOTXpq8SBfBf4pGC+QOQJF0iYt4ySb7xCC5T9nYAAAAA", "n3__p_x__xy": "data:image/webp;base64,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", "n3__p_y__yz": "data:image/webp;base64,UklGRjgJAABXRUJQVlA4ICwJAADQXACdASpAAUABPj0ejEUiIaSqofWZeVAHiWdu8YAYYqI7THHRESbFhL8OepH4le4b3Q79kOuo9EDy3PZ4/Y39Y8y+1PhXgwytmkkHAqHtZWzSSD5bGyDgVD2srZ+k92bHYR6NR+jtkHAqbw9qgDBREWEDDFqRu5rP+flhYB08vihw8KynG+TN/3A3VOMLrsQaJA+B6lSJEDbBv+u/7SASKtXg+mDeCoEOv0C6mII1mFB8d9D0+SlbdF2+l7/lOO4VyjemaQFqFn9/Z3Ydpwb8LX1RS4sgm6ynV8myMb7/NI48uj1paQrCRpQa9IzdnVtJUiyfKUYY9Y50lSttr8iK/ewcRh9qiZMyvgLECx+JviX7mWekSNXMBXEbLY0Dki43YF2lLMYrC+mfDxRurm+IuqyEO2LrUQ2QGYUJdgCttzSKFxLpdlq+52TY/4+a3bIyj/t2oOzDBfuGZ2ZP4DynG922WFzCYC75rhYQYouSpBSBCFps+elzdZC4SteQ1+J6i2g7YL+D9pEu0+kqtCzZvgD18j0fbDaX6D4lkFxt7QcAUb+2IHaSpy2WKX9rwZPW2OHdKttAOcLemv12Xzbntgh2nyPTIH3COzZhf5i29RhyQyF3HdGDOYuqviseIj+h+ENfWe7CMEN+TJR07OFA1DGY3XZuUl60cHYonbLqMgA6KGpQxu8KLtbX3Z1DxiYXTfJujIb1bbphOlx7yZCmG/+ywYqOivgD9F3MjZsvrSkO2mfsTaAOJRFvPt05kxQ9ydnwcz9eqyNL8oPnzZjKnnzWyB7WgP4WeAHhpaBGHiTHiZqlAsV5oW/yYaEVOZROmP2UWo6bXoqn8YNoqHbpjWxkRFrod9Q8jmyhTYzCpb7HiNr/uIOBXkbkUMm14O1oqQfBnAkvvEnwbZYUcWwueNIOgXAqlqUPTbLn+joBxoizyskjxU499b8E3rpA4FS0lTxOOFzOKkFRZW+f9VFS40jxmkkHAqHtZWzSR/AAAP794YTAAAAAAAAACyAArplgAAl720+AgDMf9sXYVm4rAivFYoAQ3Pw6Vlb0tIyddx264ZwBfLlPMpxaEQr/t6UG8gcWM/0PGfHq8XY5I25c8sGHat4mN7lJ+np9gChEyErzdYpOGqrTUysha7AVjoVbtOsPLo+KQ4WVxFUGMJQ7D+F9480UIk7NyY4nIuHCRKpVnkhQiKlrEGD8KnbZYQS9Lhdt25LxkfN5+iuBYtReeBvp3Ok3FkbYaEqnZfnWGVyKwSK4qVGI1HJusbuQJhA7HGRIfhfJ5cuHRt71PjZuawxbNQXTip2ZBb+zoyyQg/ArRI3ZWhGIbRS4Z+A5h92zp5FAheMq83Q01zZZ9FTgtH0cM56d4MMaPXqvT4Hww5Xdy/Mqz8ldbl9wga100NqAFSsuqpzM2n2TxEgfs4Im7CTy++VR+N0PNoP8aLxz28XUXHNoPGKKZaHR4Ow7prPNKwxc29Fg3TOHIfxzrmzVhEWPpUf9QWmxpxC6mmUK4C4Y7Hvbv+6bAwQFVYXyYpxw/fd8Bn7QZwvcmb3pinx6So5tPLguiqZeL0Yxb7OSh6IWpdnDjKgOqDZffRFfloObzVI5ElCXjMRlJSjZYS0m7ccvstRdd3i2wRZMH/zkoJqBoZ7b+LSBJyazOI7AMHyGHkhMI00fv/qx9fW8O3QC05KjETDzhiRVe7ccfcb147/586ClKmRggUAqXweSmjdg9t5p9lwKKLiYE7pnVT75UoPpPEVDKrn+fJuvB2tSoNvBppiO2p8JL2TbY5qEcRGZ2H1PjvfdlYqlGsGMnDBmpZfejSlEZzv8Nyk9Ce2FY2UtZVal0jEccb91QGrAhav74/tuv/+alCN6hRKdLlzKQivZt/vq7B/gSz6XJ9P9Ah9i/rsONNEyv33lYZxTHBwEx9HRslbAFBmaDNZRGFzDxvp35xUfy+HH/iQiPHWe0Ns+5WUapfDDlrGrkcax+VhcsMnVpXeVUbDbnwBqSFuXwUyZ0FP8rxUlDsYLfshonc0MG5/UgSjPLxrwu2LB2POLZGrCQkcsnll7arCFClYjrfeHKF6I0WzTPnP8eAZmjeTtvGWuWGcsylpQw8ZbWKDUwHuUdGX6kjh/ahoxPjgYyJe3us67IdNmx4m5+c052vnbHnLmExPCMDIV6dMlN4URPJa0CVo8rPWJ2fCfh8jDZt+mVCKn0mH1l0mCzy/lr+1nH0jJfILQwHqO/YKZEUHE3MXueLNR0Kh75/lJCqFdS634npCLNPw/u8r+Ltfp6fJLJES7jDM/yTBKNNrVBQQotlVnLVD2PF5v17Pj/BDyCgpAWo6LMG61zgcY981Q2azXFgWPbjpof4AX4hVLBeDtKWh9+KawYiUozxBK3bEhDwTNosAsa7r4pIOTbGKHBmGxX/Rfo4Wm8nedv6R1BkqzhuX2yVt7VZC7lMs9qBxyWBTiW2s7g/YKju2yMgqwepdQyP2HxnFd/+OVfwJLXMBGRh540v4tUrpf1EIb5AW+GBi0/0x4Ik620iTAJgoF3Cj09zZ7FBVsyGoV2rQxCr9sosPbByXHPKHhrYc430zOl2vbTEHfs9syZ9jJv/slKIsMeMdRjbb24XKpxdXPnIZ4Uk8Vz+6+zMKicaL8BPNHGoessJ/ER9nf1ErJn0dDKr2xYDB5qWLop06vNAlYhyHWHT18Hq92oCRcDPNpn4aPYKpAjY7hXO51q4Hf2XKCjUXy3lXPh0E+avoZ0lYEOwSVzKKYp3V/YGdpsxzpW6jQLG/VrNaEaRRklbwGLiq84YvU7k2CLpPZdXud9SbUFc5nrWqQy5FRlcBgtxtvL8seecibZOLI7x786moaufmF6Ro3N3a+RUzOIqf0C6SQY7vOJFA+ORZwTYzCUOLEHjrDP18OoopMBrimyho3OYUg3QoVF+34esru9GIqmcOqWd9LfqbpJgBPUPGP5w57LH4jyiyALpYprznOlDIdAIyzODK8irjr68h92UYMMs24WsddTDIAlLj9nZwqoXFc/GWIzXil4xk3Zq6Z/ZCZY31uZkYE0eEw4mu/pUKsGcNCjjxGVHk8/UjKKFAWSGfgXM7sxXRAAABN+hjuP7ctTK1haO6QAAAAAAAAAAAAAA==", "n3__p_z__xz": "data:image/webp;base64,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", "n3__s__xy": "data:image/webp;base64,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", "n4__d_x2_y2__xy": "data:image/webp;base64,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", "n4__d_xy__xy": "data:image/webp;base64,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", "n4__d_xz__xz": "data:image/webp;base64,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", "n4__d_yz__yz": "data:image/webp;base64,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", "n4__d_z2__xz": "data:image/webp;base64,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", "n4__p_x__xy": "data:image/webp;base64,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", "n4__p_y__yz": "data:image/webp;base64,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", "n4__p_z__xz": "data:image/webp;base64,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", "n4__s__xy": "data:image/webp;base64,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", "n5__d_x2_y2__xy": "data:image/webp;base64,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", "n5__d_xy__xy": "data:image/webp;base64,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", "n5__d_xz__xz": "data:image/webp;base64,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", "n5__d_yz__yz": "data:image/webp;base64,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", "n5__d_z2__xz": "data:image/webp;base64,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", "n5__p_x__xy": "data:image/webp;base64,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", "n5__p_y__yz": "data:image/webp;base64,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", "n5__p_z__xz": "data:image/webp;base64,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", "n5__s__xy": "data:image/webp;base64,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"};


const orbitalPreloadedImages = {};
Object.entries(orbitalPrecomputedImages).forEach(([k, src]) => {
const img = new Image();
img.onload = () => { orbitalImageCache.clear(); };
img.src = src;
orbitalPreloadedImages[k] = img;
});

function orbitalDatasetKeyFromItem(item){
if(!item) return ''
const label = String(item.label || '').trim()
const match = label.match(/^(\d+)(s|p_[xyz]|d_z²|d_xz|d_yz|d_xy|d_x²−y²)$/)
if(!match) return ''
const n = match[1]
let orbital = match[2]
orbital = orbital.replace('²','2').replace('−','-')
if(orbital === 'd_z2') orbital = 'd_z2'
if(orbital === 'd_x2-y2') orbital = 'd_x2_y2'
return `n${n}__${orbital}`
}
function orbitalPrecomputedImageKey(item){
const datasetKey = orbitalDatasetKeyFromItem(item)
if(!datasetKey) return ''
const plane = chooseOrbitalSlicePlane(item)
return `${datasetKey}__${plane}`
}


const stepButtons = []
const presetButtons = []

function factorial(n){
if(n <= 1) return 1
let result = 1
for(let i = 2; i <= n; i += 1) result *= i
return result
}

function assocLaguerre(n, alpha, x){
let sum = 0
for(let k = 0; k <= n; k += 1){
const sign = k % 2 === 0 ? 1 : -1
const top = factorial(n + alpha)
const denom = factorial(n - k) * factorial(alpha + k) * factorial(k)
sum += sign * (top / denom) * Math.pow(x, k)
}
return sum
}

function assocLegendrePositive(l, m, x){
let pmm = 1
if(m > 0){
const root = Math.sqrt(Math.max(0, 1 - x * x))
let fact = 1
for(let i = 1; i <= m; i += 1){
pmm *= -(fact) * root
fact += 2
}
}
if(l === m) return pmm
let pmmp1 = x * (2 * m + 1) * pmm
if(l === m + 1) return pmmp1
let pll = 0
for(let ll = m + 2; ll <= l; ll += 1){
pll = ((2 * ll - 1) * x * pmmp1 - (ll + m - 1) * pmm) / (ll - m)
pmm = pmmp1
pmmp1 = pll
}
return pmmp1
}

function assocLegendre(l, m, x){
if(m >= 0) return assocLegendrePositive(l, m, x)
const absM = Math.abs(m)
const pos = assocLegendrePositive(l, absM, x)
const factor = Math.pow(-1, absM) * factorial(l - absM) / factorial(l + absM)
return factor * pos
}

function realSphericalHarmonic(l, m, theta, phi){
const absM = Math.abs(m)
const x = Math.cos(theta)
const norm = Math.sqrt(((2 * l + 1) / (4 * Math.PI)) * (factorial(l - absM) / factorial(l + absM)))
const leg = assocLegendrePositive(l, absM, x)
if(m > 0) return Math.sqrt(2) * norm * leg * Math.cos(absM * phi)
if(m < 0) return Math.sqrt(2) * norm * leg * Math.sin(absM * phi)
return norm * leg
}

function radialHydrogenic(n, l, Z, r){
const rho = 2 * Z * r / n
const norm = Math.sqrt(Math.pow(2 * Z / n, 3) * factorial(n - l - 1) / (2 * n * factorial(n + l)))
return norm * Math.exp(-rho / 2) * Math.pow(rho, l) * assocLaguerre(n - l - 1, 2 * l + 1, rho)
}

function densityAtPoint(n, l, m, Z, x, y, z){
const r = Math.sqrt(x * x + y * y + z * z)
const theta = r === 0 ? 0 : Math.acos(z / r)
let phi = Math.atan2(y, x)
if(phi < 0) phi += Math.PI * 2
const radial = radialHydrogenic(n, l, Z, r)
const angular = realSphericalHarmonic(l, m, theta, phi)
const psi = radial * angular
return {
density: psi * psi,
sign: psi >= 0 ? 1 : -1,
radialSign: radial >= 0 ? 1 : -1,
angularSign: angular >= 0 ? 1 : -1,
radial,
angular,
r,
theta,
phi
}
}

function energyEV(Z, n){
return -13.605693 * Z * Z / (n * n)
}

function radialNodeCount(n, l){
return Math.max(0, n - l - 1)
}

function angularNodeCount(l){
return l
}

function estimateMaxDensity(n, l, m, Z, rMax){
let max = 0
for(let ri = 0; ri < 16; ri += 1){
const r = rMax * ri / 15
for(let ti = 0; ti < 11; ti += 1){
const theta = Math.PI * ti / 10
for(let pi = 0; pi < 18; pi += 1){
const phi = Math.PI * 2 * pi / 18
const x = r * Math.sin(theta) * Math.cos(phi)
const y = r * Math.sin(theta) * Math.sin(phi)
const z = r * Math.cos(theta)
const d = densityAtPoint(n, l, m, Z, x, y, z).density
if(d > max) max = d
}
}
}
return max || 1
}


const radialSamplerCache = new Map()
const angularSamplerCache = new Map()

function binarySearchCdf(cdf, value){
let low = 0
let high = cdf.length - 1
while(low < high){
const mid = (low + high) >> 1
if(cdf[mid] < value) low = mid + 1
else high = mid
}
return low
}

function buildRadialSampler(n, l, Z){
const key = `${n}_${l}_${Z}`
if(radialSamplerCache.has(key)) return radialSamplerCache.get(key)
const steps = Math.max(1600, 800 + n * 260)
const rMax = Math.max(7.5, (13.2 * n * n + 2.4 * (n - l - 1) * n + 1.2 * l) / Math.max(1, Z))
const rValues = new Float64Array(steps)
const pdfValues = new Float64Array(steps)
const cdf = new Float64Array(steps)
let cumulative = 0
let previousPdf = 0
for(let i = 0; i < steps; i += 1){
const r = rMax * i / (steps - 1)
const radial = radialHydrogenic(n, l, Z, r)
const pdf = r * r * radial * radial
rValues[i] = r
pdfValues[i] = pdf
if(i > 0){
const dr = rValues[i] - rValues[i - 1]
cumulative += 0.5 * (previousPdf + pdf) * dr
}
cdf[i] = cumulative
previousPdf = pdf
}
const total = cumulative || 1
for(let i = 0; i < steps; i += 1) cdf[i] /= total
const sampler = {rMax, rValues, pdfValues, cdf}
radialSamplerCache.set(key, sampler)
return sampler
}

function sampleRadiusFromSampler(sampler, u, jitter = 0.5){
const idx = Math.max(1, binarySearchCdf(sampler.cdf, Math.min(0.999999, Math.max(0, u))))
const c0 = sampler.cdf[idx - 1]
const c1 = sampler.cdf[idx]
const t = (u - c0) / Math.max(1e-12, c1 - c0)
const r0 = sampler.rValues[idx - 1]
const r1 = sampler.rValues[idx]
const dr = r1 - r0
return r0 + dr * Math.min(1, Math.max(0, t + (jitter - 0.5) * 0.12))
}

function buildAngularSampler(l, m){
const key = `${l}_${m}`
if(angularSamplerCache.has(key)) return angularSamplerCache.get(key)
const thetaBins = l === 0 ? 56 : 88
const phiBins = l === 0 ? 84 : 144
const cdf = new Float64Array(thetaBins * phiBins)
let total = 0
for(let ti = 0; ti < thetaBins; ti += 1){
const theta = (ti + 0.5) / thetaBins * Math.PI
const sinTheta = Math.sin(theta)
for(let pi = 0; pi < phiBins; pi += 1){
const phi = (pi + 0.5) / phiBins * Math.PI * 2
const y = realSphericalHarmonic(l, m, theta, phi)
const weight = Math.max(0, y * y * sinTheta)
const idx = ti * phiBins + pi
 total += weight
cdf[idx] = total
}
}
const norm = total || 1
for(let i = 0; i < cdf.length; i += 1) cdf[i] /= norm
const sampler = {thetaBins, phiBins, cdf}
angularSamplerCache.set(key, sampler)
return sampler
}

function sampleAnglesFromSampler(sampler, u, jitterTheta = 0.5, jitterPhi = 0.5){
const idx = binarySearchCdf(sampler.cdf, Math.min(0.999999, Math.max(0, u)))
const ti = Math.floor(idx / sampler.phiBins)
const pi = idx % sampler.phiBins
const theta = ((ti + jitterTheta) / sampler.thetaBins) * Math.PI
const phi = ((pi + jitterPhi) / sampler.phiBins) * Math.PI * 2
return {theta, phi}
}

function sampleOrbitalCloud(){
const {Z, n, l, m, samples} = state.orbital
const targetSamples = Math.max(2200, Math.min(7200, Math.round(samples * 2.2)))
const cacheKey = `${Z}_${n}_${l}_${m}_${targetSamples}_probDots_v1`
if(state.orbitalCacheKey === cacheKey && state.orbitalCache) return state.orbitalCache
const radialSampler = buildRadialSampler(n, l, Z)
const angularSampler = buildAngularSampler(l, m)
const points = []
const radii = []
for(let seq = 1; seq <= targetSamples; seq += 1){
const ur = halton(seq, 2)
const ua = halton(seq, 3)
const ujr = halton(seq, 5)
const ujt = halton(seq, 7)
const ujp = halton(seq, 11)
const r = sampleRadiusFromSampler(radialSampler, ur, ujr)
const ang = sampleAnglesFromSampler(angularSampler, ua, ujt, ujp)
const sinTheta = Math.sin(ang.theta)
const x = r * sinTheta * Math.cos(ang.phi)
const y = r * sinTheta * Math.sin(ang.phi)
const z = r * Math.cos(ang.theta)
const depthWeight = 1 - Math.min(1, r / radialSampler.rMax)
points.push({
x,
y,
z,
alpha:0.075 + 0.11 * (0.42 + depthWeight * 0.58),
renderScale:0.86 + depthWeight * 0.34,
glow:0.28 + depthWeight * 0.42,
radialFraction:r / radialSampler.rMax,
density:0.42 + depthWeight * 0.58
})
radii.push(r)
}
radii.sort((a,b) => a - b)
const idx = radii.length ? Math.min(radii.length - 1, Math.floor(radii.length * 0.995)) : 0
const displayExtent = radii.length ? Math.max(3.0, radii[idx] * 1.12) : radialSampler.rMax
const cache = {points, rMax:radialSampler.rMax, displayExtent}
state.orbitalCacheKey = cacheKey
state.orbitalCache = cache
return cache
}

function chooseOrbitalSlicePlane(item){
if(item && item.plane) return item.plane
if(item && item.l === 1 && item.m === 1) return 'xy'
if(item && item.l === 1 && item.m === -1) return 'yz'
if(item && item.l === 2 && (item.m === 2 || item.m === -2)) return 'xy'
if(item && item.l === 2 && item.m === -1) return 'yz'
return 'xz'
}

function pointFromSlice(u, v, plane){
if(plane === 'xy') return {x:u, y:v, z:0}
if(plane === 'yz') return {x:0, y:u, z:v}
return {x:u, y:0, z:v}
}

function orbitalViewRange(item, Z){
const meanRadius = (3 * item.n * item.n - item.l * (item.l + 1)) / (2 * Math.max(1, Z))
return Math.max(4.4, meanRadius * 1.08 + 2.4)
}

function mapOrbitalColor(t){
const stops = [
[0.00, [2,3,6]],
[0.18, [38,11,62]],
[0.36, [109,30,122]],
[0.60, [205,83,82]],
[0.82, [251,167,82]],
[1.00, [255,243,220]]
]
for(let i = 1; i < stops.length; i += 1){
if(t <= stops[i][0]){
const [t0, c0] = stops[i - 1]
const [t1, c1] = stops[i]
const k = (t - t0) / (t1 - t0 || 1)
return [
Math.round(c0[0] + (c1[0] - c0[0]) * k),
Math.round(c0[1] + (c1[1] - c0[1]) * k),
Math.round(c0[2] + (c1[2] - c0[2]) * k)
]
}
}
return stops[stops.length - 1][1]
}

function getOrbitalImage(item, size, selected = false){
const imageKey = orbitalPrecomputedImageKey(item)
const cacheKey = `${imageKey || 'fallback'}_${size}_${selected ? 1 : 0}`
if(orbitalImageCache.has(cacheKey)) return orbitalImageCache.get(cacheKey)
if(imageKey && orbitalPrecomputedImages[imageKey]){
const c = document.createElement('canvas')
c.width = size
c.height = size
const g = c.getContext('2d')
g.clearRect(0,0,size,size)
g.fillStyle = '#020305'
g.fillRect(0,0,size,size)
const img = orbitalPreloadedImages[imageKey]
if(img && img.complete) g.drawImage(img, 0, 0, size, size)
g.strokeStyle = selected ? 'rgba(255,194,92,.95)' : 'rgba(255,255,255,.18)'
g.lineWidth = selected ? 2.2 : 1.0
g.strokeRect(1,1,size - 2,size - 2)
orbitalImageCache.set(cacheKey, c)
return c
}
const Z = Math.max(1, state.orbital.Z)
const key = `${item.n}_${item.l}_${item.m}_${Z}_${size}_${selected ? 1 : 0}`
if(orbitalImageCache.has(key)) return orbitalImageCache.get(key)
const c = document.createElement('canvas')
c.width = size
c.height = size
const g = c.getContext('2d')
g.clearRect(0,0,size,size)
g.fillStyle = '#020305'
g.fillRect(0,0,size,size)
const pad = Math.max(6, Math.round(size * 0.06))
const inner = document.createElement('canvas')
inner.width = size - pad * 2
inner.height = size - pad * 2
const ig = inner.getContext('2d')
const plane = chooseOrbitalSlicePlane(item)
const range = orbitalViewRange(item, Z)
let maxDensity = 0
for(let yi = 0; yi < inner.height; yi += 2){
for(let xi = 0; xi < inner.width; xi += 2){
const u = ((xi + 0.5) / inner.width - 0.5) * 2 * range
const v = ((yi + 0.5) / inner.height - 0.5) * 2 * range
const pt = pointFromSlice(u, -v, plane)
const density = densityAtPoint(item.n, item.l, item.m, Z, pt.x, pt.y, pt.z).density
if(density > maxDensity) maxDensity = density
}
}
maxDensity = maxDensity || 1
const image = ig.createImageData(inner.width, inner.height)
for(let yi = 0; yi < inner.height; yi += 1){
for(let xi = 0; xi < inner.width; xi += 1){
const u = ((xi + 0.5) / inner.width - 0.5) * 2 * range
const v = ((yi + 0.5) / inner.height - 0.5) * 2 * range
const pt = pointFromSlice(u, -v, plane)
const density = densityAtPoint(item.n, item.l, item.m, Z, pt.x, pt.y, pt.z).density
const base = Math.min(1, density / maxDensity)
const glow = Math.pow(base, 0.24)
const core = Math.pow(base, 0.52)
const brightness = Math.min(1, 0.04 + glow * 0.96)
const color = mapOrbitalColor(brightness)
const alpha = base < 0.0014 ? 0 : Math.round(255 * Math.min(1, glow * 1.26 + core * 0.18))
const idx = (yi * inner.width + xi) * 4
image.data[idx] = color[0]
image.data[idx + 1] = color[1]
image.data[idx + 2] = color[2]
image.data[idx + 3] = alpha
}
}
ig.putImageData(image, 0, 0)
g.save()
g.globalCompositeOperation = 'screen'
g.filter = `blur(${Math.max(4, size * 0.04)}px) brightness(1.2) saturate(1.1)`
g.drawImage(inner, pad, pad, inner.width, inner.height)
g.filter = 'none'
g.drawImage(inner, pad, pad, inner.width, inner.height)
g.restore()
const vignette = g.createRadialGradient(size * 0.5, size * 0.5, size * 0.16, size * 0.5, size * 0.5, size * 0.72)
vignette.addColorStop(0, 'rgba(255,255,255,0)')
vignette.addColorStop(1, 'rgba(0,0,0,0.28)')
g.fillStyle = vignette
g.fillRect(0,0,size,size)
g.strokeStyle = selected ? 'rgba(255,194,92,.95)' : 'rgba(255,255,255,.18)'
g.lineWidth = selected ? 2.2 : 1.0
g.strokeRect(1,1,size - 2,size - 2)
orbitalImageCache.set(key, c)
return c
}

function renderOrbitalThumbnail(targetCanvas, item, selected = false){
const g = targetCanvas.getContext('2d')
g.clearRect(0,0,targetCanvas.width,targetCanvas.height)
g.drawImage(getOrbitalImage(item, targetCanvas.width, selected), 0, 0, targetCanvas.width, targetCanvas.height)
}

function buildOrbitalAtlas(){
orbitalAtlas.innerHTML = ''
orbitalAtlasList.forEach((item) => {
const button = document.createElement('button')
button.className = 'orbital-tile'
if(item.n === state.orbital.n && item.l === state.orbital.l && item.m === state.orbital.m) button.classList.add('active')
button.addEventListener('click', () => {
state.orbital.n = item.n
state.orbital.l = item.l
state.orbital.m = item.m
nValue.value = String(item.n)
updateQuantumOptions()
lValue.value = String(item.l)
mValue.value = String(item.m)
state.orbitalCacheKey = ''
updateOrbitalPanel()
updateHydrogenVisualizerVisibility()
})
const thumb = document.createElement('canvas')
thumb.width = 116
thumb.height = 116
thumb.className = 'orbital-thumb'
renderOrbitalThumbnail(thumb, item, item.n === state.orbital.n && item.l === state.orbital.l && item.m === state.orbital.m)
const caption = document.createElement('div')
caption.className = 'orbital-caption'
caption.innerHTML = `${item.label}<small>${item.tuple}</small>`
button.appendChild(thumb)
button.appendChild(caption)
orbitalAtlas.appendChild(button)
})
}

function updateQuantumOptions(){
const currentN = parseInt(nValue.value || state.orbital.n, 10)
nValue.innerHTML = ''
for(let n = 1; n <= 5; n += 1){
const option = document.createElement('option')
option.value = String(n)
option.textContent = String(n)
if(n === state.orbital.n) option.selected = true
nValue.appendChild(option)
}
lValue.innerHTML = ''
for(let l = 0; l < state.orbital.n; l += 1){
const option = document.createElement('option')
option.value = String(l)
option.textContent = String(l)
if(l === state.orbital.l) option.selected = true
lValue.appendChild(option)
}
state.orbital.l = Math.min(state.orbital.l, state.orbital.n - 1)
if(parseInt(lValue.value || state.orbital.l, 10) !== state.orbital.l) lValue.value = String(state.orbital.l)
mValue.innerHTML = ''
for(let m = -state.orbital.l; m <= state.orbital.l; m += 1){
const option = document.createElement('option')
option.value = String(m)
option.textContent = String(m)
if(m === state.orbital.m) option.selected = true
mValue.appendChild(option)
}
if(state.orbital.m < -state.orbital.l || state.orbital.m > state.orbital.l){
state.orbital.m = 0
mValue.value = '0'
}
state.orbitalCacheKey = ''
}

function buildStepButtons(){
if(!stepsGrid) return
stepsGrid.innerHTML = ''
steps.forEach((step, index) => {
const button = document.createElement('button')
button.className = 'step-badge'
button.textContent = String(index + 1)
button.addEventListener('click', () => {
state.step = index
updateStep()
})
stepsGrid.appendChild(button)
stepButtons.push(button)
})
}

function buildPresetButtons(){
orbitalPresets.innerHTML = ''
orbitalPresetList.forEach((preset) => {
const button = document.createElement('button')
button.className = 'ghost'
button.textContent = preset.label
button.addEventListener('click', () => {
state.orbital.n = preset.n
state.orbital.l = preset.l
state.orbital.m = preset.m
updateQuantumOptions()
nValue.value = String(state.orbital.n)
lValue.value = String(state.orbital.l)
mValue.value = String(state.orbital.m)
updateOrbitalPanel()
})
orbitalPresets.appendChild(button)
presetButtons.push(button)
})
}


function hydrogenSceneActive(step = steps[state.step]){
return ['schrodinger','spherical','quantum','radial','orbital','orbitalExamples','transitions','summary'].includes(step.scene)
}

function advancedOrbitalSceneActive(step = steps[state.step]){
return hydrogenSceneActive(step)
}

function syncOrbitalViewButtons(){
if(!orbitalViewSwitch) return
orbitalViewSwitch.querySelectorAll('button').forEach((button) => {
const nextView = button.dataset.view === '3d' ? '3d' : '2d'
button.classList.toggle('active', state.orbitalView === nextView)
})
}

function updateOverlay(chips){
overlay.innerHTML = ''
chips.forEach((item) => {
const chip = document.createElement('div')
chip.className = 'chip'
chip.textContent = item
overlay.appendChild(chip)
})
}

function buildFormulaNarrative(step){
if(step.formulaExplainHtml) return step.formulaExplainHtml
const advanced = hydrogenSceneActive(step)
if(advanced){
return '<div style="margin-top:10px" class="eq-stack"><div class="eq-caption"><strong>Leitura geral.</strong> A matemática desta etapa é usada para montar a função de onda do estado escolhido. A partir dela, o app calcula ψ, |ψ|² e as leituras gráficas correspondentes.</div></div>'
}
return '<div style="margin-top:10px" class="eq-stack"><div class="eq-caption"><strong>Leitura geral.</strong> Nesta etapa, a fórmula funciona como uma chave conceitual para interpretar o modelo ou o experimento em foco.</div></div>'
}

function updateFormula(step){
const advanced = hydrogenSceneActive(step)
const energy = energyEV(state.orbital.Z, state.orbital.n)
const formulaHtml = step.formulaHtml || `<div class="formula-line">${step.formula}</div>`
const bannerHtml = step.bannerHtml || `<span class="eq-main">${step.formula}</span>`
const explanationHtml = buildFormulaNarrative(step)
const stepModeText = advanced
? 'Nesta etapa, a equação já está sendo lida como objeto matemático operacional: ela gera o estado selecionado, sua densidade e seus gráficos correspondentes.'
: 'Nesta etapa, a fórmula funciona como uma chave de leitura histórica e conceitual para o modelo ou o experimento em foco.'
formulaCard.innerHTML = `<strong>${step.formulaTitle}</strong>${formulaHtml}${explanationHtml}<div style="margin-top:10px">${stepModeText}</div><div style="margin-top:8px;color:#9fb3d7">Estado em foco: ${speciesMap[state.orbital.Z]} • n=${state.orbital.n} • l=${state.orbital.l} • m=${state.orbital.m} • E=${energy.toFixed(3)} eV</div>`
equationBanner.innerHTML = bannerHtml
}

function updateStep(){
const step = steps[state.step]
applyStepOrbitalPreset(step)
guideKicker.textContent = step.kicker
guideHeading.textContent = step.title
guideText.innerHTML = step.text.map((paragraph) => `<p>${paragraph}</p>`).join('')
guideCallout.textContent = step.callout

tutorialStepTag.textContent = `Etapa ${state.step + 1} de ${steps.length}`
tutorialPrev.disabled = state.step === 0
tutorialNext.disabled = state.step === steps.length - 1
updateOverlay(step.chips)
updateFormula(step)
hudScene.textContent = step.kicker
hudCount.textContent = step.scene === 'orbital' || step.scene === 'orbitalExamples' || step.scene === 'quantum' || step.scene === 'radial' ? `${speciesMap[state.orbital.Z]} • ${orbitalLabel()}` : 'visão geral'
hudEnergy.textContent = `Eₙ = ${energyEV(state.orbital.Z, state.orbital.n).toFixed(3)} eV`
stepButtons.forEach((button, index) => button.classList.toggle('active', index === state.step))
updateOrbitalPanel()
}

function orbitalLabel(){
const meta = orbitalMetaFromState()
if(meta) return meta.label
const labels = ['s','p','d','f','g']
return `${state.orbital.n}${labels[state.orbital.l] || '?'} (m=${state.orbital.m})`
}

function updateOrbitalPanel(){
const energy = energyEV(state.orbital.Z, state.orbital.n)
const advancedVisible = hydrogenSceneActive()
const section = document.getElementById('hydrogenoidSection')
section.style.opacity = advancedVisible ? '1' : '.78'
section.style.filter = advancedVisible ? 'none' : 'saturate(.75)'
speciesTag.textContent = speciesMap[state.orbital.Z]
if(orbitalAtlasTag) orbitalAtlasTag.textContent = state.orbitalView === '3d' ? 'nuvem 3D' : 'mapa de densidade'
syncOrbitalViewButtons()
const radialNodes = radialNodeCount(state.orbital.n, state.orbital.l)
const angularNodes = angularNodeCount(state.orbital.l)
const bohrRadius = (state.orbital.n * state.orbital.n) / state.orbital.Z
statsGrid.innerHTML = `
<div class="stat-card"><div class="label">Estado</div><div class="value">${orbitalLabel()}</div></div>
<div class="stat-card"><div class="label">Energia</div><div class="value">${energy.toFixed(3)} eV</div></div>
<div class="stat-card"><div class="label">Nós radiais</div><div class="value">${radialNodes}</div></div>
<div class="stat-card"><div class="label">Nós angulares</div><div class="value">${angularNodes}</div></div>
<div class="stat-card"><div class="label">Escala radial típica</div><div class="value">${bohrRadius.toFixed(2)} a₀</div></div>
<div class="stat-card"><div class="label">Íon</div><div class="value">${speciesMap[state.orbital.Z]}</div></div>
`
if (orbitalNote) orbitalNote.innerHTML = ``
buildOrbitalAtlas()
drawRadialGraph()
syncHydrogenVisualizer()
updateHydrogenVisualizerVisibility()
}

function drawRadialGraph(){
const width = radialGraph.width
const height = radialGraph.height
radialCtx.clearRect(0,0,width,height)
const grd = radialCtx.createLinearGradient(0,0,0,height)
grd.addColorStop(0,'#0c1730')
grd.addColorStop(1,'#07101b')
radialCtx.fillStyle = grd
radialCtx.fillRect(0,0,width,height)
const padL = 24
const padR = 14
const padT = 20
const padB = 26
const plotW = width - padL - padR
const plotH = height - padT - padB
const gap = Math.max(14, plotH * 0.12)
const bandH = (plotH - gap) / 2
const bandTopR = padT
const bandBottomR = bandTopR + bandH
const bandTopP = bandBottomR + gap
const bandBottomP = bandTopP + bandH
const rMid = (bandTopR + bandBottomR) / 2
radialCtx.strokeStyle = 'rgba(150,190,255,.14)'
radialCtx.lineWidth = 1
for(let i = 0; i <= 5; i += 1){
const x = padL + plotW * i / 5
radialCtx.beginPath()
radialCtx.moveTo(x, bandTopR)
radialCtx.lineTo(x, bandBottomP)
radialCtx.stroke()
}
const rMax = Math.max(5, 8 * state.orbital.n * state.orbital.n / state.orbital.Z)
const points = []
let max = 0
for(let i = 0; i < 220; i += 1){
const r = rMax * i / 219
const radial = radialHydrogenic(state.orbital.n, state.orbital.l, state.orbital.Z, r)
const value = r * r * radial * radial
points.push({r, radial, value})
if(value > max) max = value
}
radialCtx.strokeStyle = 'rgba(255,255,255,.26)'
radialCtx.beginPath(); radialCtx.moveTo(padL, rMid); radialCtx.lineTo(padL + plotW, rMid); radialCtx.stroke()
radialCtx.beginPath(); radialCtx.moveTo(padL, bandBottomP); radialCtx.lineTo(padL + plotW, bandBottomP); radialCtx.stroke()
radialCtx.lineWidth = 2.2
radialCtx.strokeStyle = '#87e9ff'
radialCtx.beginPath()
points.forEach((point, index) => {
const x = padL + plotW * point.r / rMax
const y = rMid - point.radial * bandH * 0.40
if(index === 0) radialCtx.moveTo(x,y)
else radialCtx.lineTo(x,y)
})
radialCtx.stroke()
radialCtx.strokeStyle = '#ffd86f'
radialCtx.beginPath()
points.forEach((point, index) => {
const x = padL + plotW * point.r / rMax
const y = bandBottomP - bandH * 0.82 * (point.value / (max || 1))
if(index === 0) radialCtx.moveTo(x,y)
else radialCtx.lineTo(x,y)
})
radialCtx.stroke()
radialCtx.fillStyle = 'rgba(236,243,255,.88)'
radialCtx.font = '12px Inter, system-ui, sans-serif'
radialCtx.fillText('R(r)', padL + 4, bandTopR + 13)
radialCtx.fillText('P(r)', padL + 4, bandTopP + 13)
radialCtx.fillStyle = 'rgba(160,184,220,.88)'
radialCtx.fillText('r / a₀', padL + plotW * 0.5 - 14, height - 8)
}


function syncControlsFromState(){
zoomControl.value = String(state.zoom)
autorotateControl.value = String(state.autorotate)
pitchControl.value = String(state.pitch)
glowControl.value = String(state.glow)
zValue.value = String(state.orbital.Z)
sampleCount.value = String(state.orbital.samples)
nValue.value = String(state.orbital.n)
lValue.value = String(state.orbital.l)
mValue.value = String(state.orbital.m)
}

function onPointerDown(event){
state.dragging = true
state.lastX = event.clientX
state.lastY = event.clientY
}

function onPointerMove(event){
if(!state.dragging) return
const dx = event.clientX - state.lastX
const dy = event.clientY - state.lastY
state.lastX = event.clientX
state.lastY = event.clientY
state.yaw += dx * 0.008
state.pitch += dy * 0.008
state.pitch = Math.max(-1.3, Math.min(1.3, state.pitch))
pitchControl.value = String(state.pitch)
}

function onPointerUp(){
state.dragging = false
}


function mapStateToImportedOrbital(){
if(state.orbital.l === 0) return 's'
if(state.orbital.l === 1){
if(state.orbital.m === 0) return 'p_z'
if(state.orbital.m === 1) return 'p_x'
if(state.orbital.m === -1) return 'p_y'
}
if(state.orbital.l === 2){
if(state.orbital.m === 0) return 'd_z2'
if(state.orbital.m === 1) return 'd_xz'
if(state.orbital.m === -1) return 'd_yz'
if(state.orbital.m === 2) return 'd_x2_y2'
if(state.orbital.m === -2) return 'd_xy'
}
return 's'
}

function ensureHydrogenVisualizerLoaded(){
if(!hydrogenVisualizerFrame || hydrogenVisualizerFrame.srcdoc) return
const src = hydrogenVisualizerTemplate ? hydrogenVisualizerTemplate.innerHTML.trim() : ''
if(src) hydrogenVisualizerFrame.srcdoc = src
}

function getHydrogenVisualizerDoc(){
try{
return hydrogenVisualizerFrame?.contentDocument || hydrogenVisualizerFrame?.contentWindow?.document || null
}catch(error){
return null
}
}

function syncHydrogenVisualizer(){
ensureHydrogenVisualizerLoaded()
const doc = getHydrogenVisualizerDoc()
if(!doc) return
const nSelect = doc.getElementById('nSelect')
const orbitalSelect = doc.getElementById('orbitalSelect')
const qualityRange = doc.getElementById('qualityRange')
const zoomRange = doc.getElementById('zoomRange')
const colorMode = doc.getElementById('colorMode')
const axesMode = doc.getElementById('axesMode')
const nextOrbital = mapStateToImportedOrbital()
if(!nSelect || !orbitalSelect) return
if(String(nSelect.value) !== String(state.orbital.n)){
nSelect.value = String(state.orbital.n)
nSelect.dispatchEvent(new Event('change', {bubbles:true}))
}
if(String(orbitalSelect.value) !== nextOrbital){
orbitalSelect.value = nextOrbital
orbitalSelect.dispatchEvent(new Event('change', {bubbles:true}))
}
if(qualityRange){
const normalizedQuality = Math.max(0.2, Math.min(1, state.orbital.samples / 3200))
qualityRange.value = normalizedQuality.toFixed(2)
qualityRange.dispatchEvent(new Event('input', {bubbles:true}))
}
if(zoomRange){
const orbitalScale = 0.10
zoomRange.value = orbitalScale.toFixed(2)
zoomRange.dispatchEvent(new Event('input', {bubbles:true}))
}
if(colorMode){
const preferredColorMode = hydrogenColorModeControl ? hydrogenColorModeControl.value : (state.orbitalView === '3d' ? 'sign' : 'density')
colorMode.value = preferredColorMode
colorMode.dispatchEvent(new Event('change', {bubbles:true}))
}
const frameWindow = hydrogenVisualizerFrame?.contentWindow
if(frameWindow && typeof frameWindow.setHydrogenoidZ === 'function'){
frameWindow.setHydrogenoidZ(state.orbital.Z)
}
if(axesMode){
axesMode.value = showAxesControl && showAxesControl.checked ? 'show' : 'hide'
axesMode.dispatchEvent(new Event('change', {bubbles:true}))
}
}

function updateHydrogenVisualizerVisibility(){
ensureHydrogenVisualizerLoaded()
const active = advancedOrbitalSceneActive()
if(hydrogenVisualizerHost){
hydrogenVisualizerHost.classList.toggle('active', active)
}
canvas.style.opacity = active ? '0' : '1'
canvas.style.pointerEvents = active ? 'none' : 'auto'
overlay.style.opacity = active ? '0' : '1'
equationBanner.style.opacity = active ? '0' : '1'
hudStrip.style.opacity = active ? '0' : '1'
if(active) syncHydrogenVisualizer()
}

if(hydrogenVisualizerFrame){
hydrogenVisualizerFrame.addEventListener('load', () => {
hydrogenVisualizerLoaded = true
syncHydrogenVisualizer()
updateHydrogenVisualizerVisibility()
})
}

canvas.addEventListener('pointerdown', onPointerDown)
window.addEventListener('pointermove', onPointerMove)
window.addEventListener('pointerup', onPointerUp)
window.addEventListener('resize', resizeMainCanvas)

resetView.addEventListener('click', () => {
state.yaw = 0.65
state.pitch = 0.32
state.zoom = 1.7
state.autorotate = 0
state.glow = 0.9
syncControlsFromState()
})

fitScene.addEventListener('click', () => {
state.zoom = hydrogenSceneActive() ? 1.45 : 1.8
zoomControl.value = String(state.zoom)
})

tutorialPrev.addEventListener('click', () => {
if(state.step > 0){
state.step -= 1
updateStep()
}
})

tutorialNext.addEventListener('click', () => {
if(state.step < steps.length - 1){
state.step += 1
updateStep()
}
})

zoomControl.addEventListener('input', () => {
state.zoom = parseFloat(zoomControl.value)
})

autorotateControl.addEventListener('input', () => {
state.autorotate = parseFloat(autorotateControl.value)
})

pitchControl.addEventListener('input', () => {
state.pitch = parseFloat(pitchControl.value)
})

glowControl.addEventListener('input', () => {
state.glow = parseFloat(glowControl.value)
})

if(hydrogenColorModeControl){
hydrogenColorModeControl.addEventListener('change', () => {
syncHydrogenVisualizer()
})
}

zValue.addEventListener('input', () => {
state.orbital.Z = parseInt(zValue.value, 10)
state.orbitalCacheKey = ''
updateOrbitalPanel()
updateStep()
})

sampleCount.addEventListener('input', () => {
state.orbital.samples = parseInt(sampleCount.value, 10)
state.orbitalCacheKey = ''
updateOrbitalPanel()
})

nValue.addEventListener('change', () => {
state.orbital.n = parseInt(nValue.value, 10)
if(state.orbital.l > state.orbital.n - 1) state.orbital.l = state.orbital.n - 1
if(Math.abs(state.orbital.m) > state.orbital.l) state.orbital.m = 0
updateQuantumOptions()
updateOrbitalPanel()
updateStep()
})

lValue.addEventListener('change', () => {
state.orbital.l = parseInt(lValue.value, 10)
if(Math.abs(state.orbital.m) > state.orbital.l) state.orbital.m = 0
updateQuantumOptions()
updateOrbitalPanel()
updateStep()
})

mValue.addEventListener('change', () => {
state.orbital.m = parseInt(mValue.value, 10)
state.orbitalCacheKey = ''
updateOrbitalPanel()
updateStep()
})

if(orbitalViewSwitch){
orbitalViewSwitch.querySelectorAll('button').forEach((button) => {
button.addEventListener('click', () => {
const nextView = button.dataset.view === '3d' ? '3d' : '2d'
if(state.orbitalView === nextView) return
state.orbitalView = nextView
state.orbitalCacheKey = ''
syncOrbitalViewButtons()
updateOrbitalPanel()
updateStep()
})
})
}

window.addEventListener('keydown', (event) => {
if(event.key === 'ArrowRight') tutorialNext.click()
if(event.key === 'ArrowLeft') tutorialPrev.click()
})

function animate(timestamp){
if(!state.lastTime) state.lastTime = timestamp
const dt = Math.max(0, Math.min(0.05, (timestamp - state.lastTime) / 1000))
state.lastTime = timestamp
if(Math.abs(state.autorotate) > 0.0001 && !state.dragging){
state.yaw += state.autorotate * dt
pitchControl.value = String(state.pitch)
}
requestAnimationFrame(animate)
}

ensureHydrogenVisualizerLoaded()
buildStepButtons()
buildPresetButtons()
updateQuantumOptions()
syncControlsFromState()
resizeMainCanvas()
updateStep()
requestAnimationFrame(animate)
