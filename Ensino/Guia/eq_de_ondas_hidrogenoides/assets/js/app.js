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


const { speciesMap, steps, orbitalDetailCatalog } = window.SIMOENS_GUIDE_CONTENT;





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




const orbitalDetailSteps = orbitalDetailCatalog.filter((item) => item.n <= 3).map(buildOrbitalDetailStep)
const transitionIndex = steps.findIndex((step) => step.scene === 'transitions')
if(transitionIndex >= 0) steps.splice(transitionIndex, 0, ...orbitalDetailSteps)
else steps.push(...orbitalDetailSteps)

const orbitalAtlasList = orbitalDetailCatalog.map((item) => ({label:item.label, tuple:item.tuple, n:item.n, l:item.l, m:item.m, plane:item.plane, key:item.key}))

const orbitalImageCache = new Map()
const orbitalPrecomputedImages = {"n1__s__xy":"assets/images/orbitals/n1__s__xy.webp","n2__p_x__xy":"assets/images/orbitals/n2__p_x__xy.webp","n2__p_y__yz":"assets/images/orbitals/n2__p_y__yz.webp","n2__p_z__xz":"assets/images/orbitals/n2__p_z__xz.webp","n2__s__xy":"assets/images/orbitals/n2__s__xy.webp","n3__d_x2_y2__xy":"assets/images/orbitals/n3__d_x2_y2__xy.webp","n3__d_xy__xy":"assets/images/orbitals/n3__d_xy__xy.webp","n3__d_xz__xz":"assets/images/orbitals/n3__d_xz__xz.webp","n3__d_yz__yz":"assets/images/orbitals/n3__d_yz__yz.webp","n3__d_z2__xz":"assets/images/orbitals/n3__d_z2__xz.webp","n3__p_x__xy":"assets/images/orbitals/n3__p_x__xy.webp","n3__p_y__yz":"assets/images/orbitals/n3__p_y__yz.webp","n3__p_z__xz":"assets/images/orbitals/n3__p_z__xz.webp","n3__s__xy":"assets/images/orbitals/n3__s__xy.webp","n4__d_x2_y2__xy":"assets/images/orbitals/n4__d_x2_y2__xy.webp","n4__d_xy__xy":"assets/images/orbitals/n4__d_xy__xy.webp","n4__d_xz__xz":"assets/images/orbitals/n4__d_xz__xz.webp","n4__d_yz__yz":"assets/images/orbitals/n4__d_yz__yz.webp","n4__d_z2__xz":"assets/images/orbitals/n4__d_z2__xz.webp","n4__p_x__xy":"assets/images/orbitals/n4__p_x__xy.webp","n4__p_y__yz":"assets/images/orbitals/n4__p_y__yz.webp","n4__p_z__xz":"assets/images/orbitals/n4__p_z__xz.webp","n4__s__xy":"assets/images/orbitals/n4__s__xy.webp","n5__d_x2_y2__xy":"assets/images/orbitals/n5__d_x2_y2__xy.webp","n5__d_xy__xy":"assets/images/orbitals/n5__d_xy__xy.webp","n5__d_xz__xz":"assets/images/orbitals/n5__d_xz__xz.webp","n5__d_yz__yz":"assets/images/orbitals/n5__d_yz__yz.webp","n5__d_z2__xz":"assets/images/orbitals/n5__d_z2__xz.webp","n5__p_x__xy":"assets/images/orbitals/n5__p_x__xy.webp","n5__p_y__yz":"assets/images/orbitals/n5__p_y__yz.webp","n5__p_z__xz":"assets/images/orbitals/n5__p_z__xz.webp","n5__s__xy":"assets/images/orbitals/n5__s__xy.webp"};


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
