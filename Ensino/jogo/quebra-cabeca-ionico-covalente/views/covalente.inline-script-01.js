const NAMES = new Map(Object.entries({
  H:'hidrogênio', He:'hélio', Li:'lítio', Be:'berílio', B:'boro', C:'carbono', N:'nitrogênio', O:'oxigênio', F:'flúor', Ne:'neônio',
  Na:'sódio', Mg:'magnésio', Al:'alumínio', Si:'silício', P:'fósforo', S:'enxofre', Cl:'cloro', Ar:'argônio', K:'potássio', Ca:'cálcio',
  Sc:'escândio', Ti:'titânio', V:'vanádio', Cr:'cromo', Mn:'manganês', Fe:'ferro', Co:'cobalto', Ni:'níquel', Cu:'cobre', Zn:'zinco',
  Ga:'gálio', Ge:'germânio', As:'arsênio', Se:'selênio', Br:'bromo', Kr:'criptônio', Rb:'rubídio', Sr:'estrôncio', Y:'ítrio', Zr:'zircônio',
  Nb:'nióbio', Mo:'molibdênio', Tc:'tecnécio', Ru:'rutênio', Rh:'ródio', Pd:'paládio', Ag:'prata', Cd:'cádmio', In:'índio', Sn:'estanho',
  Sb:'antimônio', Te:'telúrio', I:'iodo', Xe:'xenônio', Cs:'césio', Ba:'bário', La:'lantânio', Ce:'cério', Pr:'praseodímio', Nd:'neodímio',
  Pm:'promécio', Sm:'samário', Eu:'európio', Gd:'gadolínio', Tb:'térbio', Dy:'disprósio', Ho:'hólmio', Er:'érbio', Tm:'túlio', Yb:'itérbio',
  Lu:'lutécio', Hf:'háfnio', Ta:'tântalo', W:'tungstênio', Re:'rênio', Os:'ósmio', Ir:'irídio', Pt:'platina', Au:'ouro', Hg:'mercúrio',
  Tl:'tálio', Pb:'chumbo', Bi:'bismuto', Po:'polônio', At:'astato', Rn:'radônio', Fr:'frâncio', Ra:'rádio', Ac:'actínio', Th:'tório'
}));

const FIRST_90 = ['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr','Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe','Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn','Fr','Ra','Ac','Th'];

const NOBLES = new Set(['He','Ne','Ar','Kr','Xe','Rn']);
const ELEMENTS = FIRST_90.filter(sym => !NOBLES.has(sym)); 


const G1  = new Set(['H','Li','Na','K','Rb','Cs','Fr']);
const G2  = new Set(['Be','Mg','Ca','Sr','Ba','Ra']);
const G13 = new Set(['B','Al','Ga','In','Tl']);
const G14 = new Set(['C','Si','Ge','Sn','Pb']);
const G15 = new Set(['N','P','As','Sb','Bi']);
const G16 = new Set(['O','S','Se','Te','Po']);
const G17 = new Set(['F','Cl','Br','I','At']);
const D4  = new Set(['V','Cr','Mo','Tc','Ru','Os','Re','W']);

function valenceElectrons(sym){
  if(sym==='He') return 2; 
  if(G1.has(sym)) return 1;
  if(G2.has(sym)) return 2;
  if(G13.has(sym)) return 3;
  if(G14.has(sym)) return 4;
  if(sym==='P') return 5; 
  if(G15.has(sym)) return 5;
  if(sym==='S') return 6;
  if(G16.has(sym)) return 6;
  if(G17.has(sym)) return 7;
  if(NOBLES.has(sym)) return 8;
  return -1;
}
function capacity(sym){
  if(sym==='H') return 1;
  if(NOBLES.has(sym)) return 0;
  if(G1.has(sym)) return 1;
  if(G2.has(sym)) return 2;
  if(G13.has(sym)) return 3;
  if(G14.has(sym)) return 4;
  if(sym==='P') return 5;      
  if(G15.has(sym)) return 3;
  if(sym==='S') return 6;      
  if(G16.has(sym)) return 2;
  if(G17.has(sym)) return 1;
  if(D4.has(sym)) return 4;
  if(sym==='La'||sym==='Ce'||sym==='Pr'||sym==='Nd'||sym==='Pm'||sym==='Sm'||sym==='Eu'||sym==='Gd'||sym==='Tb'||sym==='Dy'||sym==='Ho'||sym==='Er'||sym==='Tm'||sym==='Yb'||sym==='Lu') return 3;
  if(sym==='Ac') return 3;
  if(sym==='Th') return 4;
  return 2;
}


const SYMBOLS = [
  {id:'sym_plus', label:'+','name':'adição'},
  {id:'sym_arrow', label:'\u2192','name':'reação'},
  {id:'sym_eq', label:'\u21CC','name':'equilíbrio'},
];


const selectOne = (selector, root=document)=> root.querySelector(selector);
const atomsGrid = selectOne('#atomsGrid');
const symbolsGrid = selectOne('#symbolsGrid');
const boardWrapElement = selectOne('#boardWrap');
const boardSurface = selectOne('#board');
const bondCountOutput = selectOne('#bondCount');
const tileCountOutput = selectOne('#count');
const formulaOutput = selectOne('#formulaOut');
const toggleSidebarButton = selectOne('#toggleSide');

function getSymbolLabel(id){ const s = SYMBOLS.find(x=>x.id===id); return s? s.label : id; }

function toSubscript(n){return [...String(n)].map(d=>({'0':'\u2080','1':'\u2081','2':'\u2082','3':'\u2083','4':'\u2084','5':'\u2085','6':'\u2086','7':'\u2087','8':'\u2088','9':'\u2089'})[d]).join('')}
const normalizeText = s => (s||'').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');


let libraryFilter = '';
const _searchBox = document.getElementById('searchBox');
if(_searchBox){
  _searchBox.addEventListener('input', ()=>{ libraryFilter = normalizeText(_searchBox.value); refreshLibrary(); });
}
function refreshLibrary(){
  atomsGrid.innerHTML='';
  for(const sym of ELEMENTS){
    const name = NAMES.get(sym) || sym;
    const cap = capacity(sym);
    const ve = valenceElectrons(sym);
    const showE = (ve<0? cap : ve);
    const div = document.createElement('div');
    div.className = 'chip';
    div.draggable=true;
    div.dataset.atom = sym;
    div.setAttribute('role', 'button');
    div.tabIndex = 0;
    div.setAttribute('aria-label', `${name}. Adicionar à mesa de montagem`);
    const query = normalizeText(sym+' '+name);
    if(libraryFilter && !query.includes(libraryFilter)) continue;
    div.innerHTML = `
      <span class="sym">${sym}</span>
      <span class="name">${name}</span>
      <span class="val">valência: ${showE}</span>
    `;
    div.addEventListener('dragstart',e=>{ e.dataTransfer.setData('text/plain', JSON.stringify({type:'atom', id:sym})); });
    div.addEventListener('dblclick',()=>placeAtomTile(sym, name, cap, showE, 50+Math.random()*240, 60+Math.random()*220));
    div.addEventListener('keydown', event=>{
      if(event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      placeAtomTile(sym, name, cap, showE, 50+Math.random()*240, 60+Math.random()*220).element.focus();
    });
    atomsGrid.appendChild(div);
  }
  
  symbolsGrid.innerHTML = '';
  for(const s of SYMBOLS){
    const div = document.createElement('div'); div.className='chip symb'; div.draggable=true;
    div.dataset.symbol = s.id;
    div.setAttribute('role', 'button'); div.tabIndex = 0;
    div.setAttribute('aria-label', `${s.name}. Adicionar à mesa de montagem`);
    div.innerHTML = `<span class="sym">${s.label}</span><span class="name">${s.name}</span>`;
    div.addEventListener('dragstart',e=>{ e.dataTransfer.setData('text/plain', JSON.stringify({type:'symbol', id:s.id})); });
    div.addEventListener('dblclick',()=>placeSymbolTile(s, 120+Math.random()*220, 140+Math.random()*220));
    div.addEventListener('keydown', event=>{
      if(event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      placeSymbolTile(s, 120+Math.random()*220, 140+Math.random()*220).element.focus();
    });
    symbolsGrid.appendChild(div);
  }
}
refreshLibrary();


toggleSidebarButton.addEventListener('click', ()=>{
  const on = !document.body.classList.contains('hideSide');
  document.body.classList.toggle('hideSide', on);
  toggleSidebarButton.textContent = on ? 'Mostrar Leitura & Dicas' : 'Esconder Leitura & Dicas';
});



let tiles=[]; 
let bonds=[]; 
let selected=null;

boardSurface.addEventListener('dragover',e=>{ e.preventDefault(); });
boardSurface.addEventListener('drop',e=>{
  e.preventDefault();
  const raw = (e.dataTransfer.getData('text/plain')||'').trim();
  let payload=null; try{ payload = JSON.parse(raw); }catch(_){}
  const rect = boardSurface.getBoundingClientRect();
  const x = e.clientX-rect.left-50, y = e.clientY-rect.top-20;
  if(payload && payload.type==='atom'){
    const sym = payload.id; const name = NAMES.get(sym) || sym;
    if(NOBLES.has(sym)) { showToast('Gás nobre removido.', 'bad'); return; }
    const cap = capacity(sym); const ve = valenceElectrons(sym); const showE = (ve<0? cap : ve);
    placeAtomTile(sym, name, cap, showE, x, y);
  } else if(payload && payload.type==='symbol'){
    const s = SYMBOLS.find(x=>x.id===payload.id); if(s) placeSymbolTile(s, x, y);
  }
});

function placeSymbolTile(sym, x=60, y=60){
  const t = document.createElement('div');
  t.className = 'tile symb';
  t.innerHTML = `<div class="halo"></div><div class="bigSym">${sym.label}</div><div class="tag">${sym.name}</div>`;
  t.style.left=x+'px'; t.style.top=y+'px';
  boardSurface.appendChild(t);
  const obj = {type:'symbol', isSymbol:true, element:t, x,y, sym:sym.id, name:sym.name, cap:0, freeE:0, electronsEls:[]};
  prepareKeyboardTile(obj, `${sym.name}. Símbolo na mesa`);
  tiles.push(obj);
  enableTileDragging(obj);
  t.addEventListener('pointerdown',()=>focusTile(obj));
  refreshReadout();
  return obj;
}

function placeAtomTile(sym, name, cap, electrons, x=60, y=60){
  const t = document.createElement('div');
  t.className = 'tile';
  t.innerHTML = `<div class="halo"></div><div class="sym">${sym}</div><div class="tag">${name}</div>`;
  t.style.left=x+'px'; t.style.top=y+'px';
  boardSurface.appendChild(t);
  const obj={type:'atom', isSymbol:false, element:t, x, y, sym, name, cap, freeE:electrons, bonds:new Set(), electronsEls:[]};
  prepareKeyboardTile(obj, `${name}. Átomo na mesa; use as setas para mover e B para criar uma ligação`);
  tiles.push(obj);
  redrawElectrons(obj);
  enableTileDragging(obj);
  t.addEventListener('pointerdown',()=>focusTile(obj));
  refreshReadout();
  return obj;
}

function focusTile(obj){
  tiles.forEach(o=>{ o.element.classList.remove('ghost'); o.element.setAttribute('aria-pressed', 'false'); });
  selected=obj; obj.element.classList.add('ghost');
  obj.element.setAttribute('aria-pressed', 'true');
}

let keyboardBondSource = null;
function prepareKeyboardTile(obj, label){
  const element = obj.element;
  element.setAttribute('role', 'button');
  element.tabIndex = 0;
  element.setAttribute('aria-pressed', 'false');
  element.setAttribute('aria-label', label);
  if(!obj.isSymbol) element.setAttribute('aria-keyshortcuts', 'B');
  element.addEventListener('keydown', event=>{
    const movement = { ArrowLeft:[-10,0], ArrowRight:[10,0], ArrowUp:[0,-10], ArrowDown:[0,10] }[event.key];
    if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); focusTile(obj); return; }
    if((event.key === 'b' || event.key === 'B') && !obj.isSymbol){
      event.preventDefault();
      focusTile(obj);
      if(!keyboardBondSource){ keyboardBondSource = obj; showToast('Primeiro átomo selecionado. Foque outro átomo e pressione B.', 'info'); return; }
      if(keyboardBondSource === obj){ keyboardBondSource = null; showToast('Seleção de ligação cancelada.', 'info'); return; }
      if(canCreateBondBetween(keyboardBondSource, obj)) createBondLink(keyboardBondSource, obj);
      else showToast('Não é possível criar outra ligação entre essas peças.', 'bad');
      keyboardBondSource = null;
      return;
    }
    if(!movement) return;
    event.preventDefault();
    focusTile(obj);
    moveClusterByOffset(collectClusterTiles(obj), movement[0], movement[1]);
    redrawAllBonds();
    refreshReadout();
  });
}

function enableTileDragging(obj){
  let dragging=false, startMouseX=0, startMouseY=0; let dragCluster=[];
  obj.element.addEventListener('pointerdown',e=>{
    if(obj.type==='atom' && e.target && e.target.classList && e.target.classList.contains('e')) return;
    dragging=true; obj.element.setPointerCapture(e.pointerId); obj.element.classList.add('dragging');
    focusTile(obj); startMouseX=e.clientX; startMouseY=e.clientY; dragCluster = collectClusterTiles(obj);
    dragCluster.forEach(t=>{ t._startX=t.x; t._startY=t.y; });
  });
  obj.element.addEventListener('pointermove',e=>{
    if(!dragging) return;
    const dx = e.clientX - startMouseX; const dy = e.clientY - startMouseY;
    dragCluster.forEach(t=>{ t.x = t._startX + dx; t.y = t._startY + dy; t.element.style.left=t.x+'px'; t.element.style.top=t.y+'px'; });
    redrawAllBonds();
  });
  const end=()=>{ if(!dragging) return; dragging=false; obj.element.classList.remove('dragging'); refreshReadout(); };
  obj.element.addEventListener('pointerup', end); obj.element.addEventListener('pointercancel', end);
}

function getTileCenter(t){
  const r = t.element.getBoundingClientRect();
  return {x:r.left + r.width/2 + window.scrollX, y:r.top + r.height/2 + window.scrollY};
}

function collectClusterTiles(start){
  if(start.isSymbol) return [start];
  const seen=new Set(); const out=[]; const stack=[start];
  while(stack.length){ const n=stack.pop(); if(seen.has(n)) continue; seen.add(n); out.push(n);
    
    bonds.forEach(b=>{ if(b.a===n) outPush(b.b); if(b.b===n) outPush(b.a); });
  }
  function outPush(o){ if(!seen.has(o)) stack.push(o); }
  return out;
}

function getBondsForTile(t){ return bonds.filter(b=>b.a===t || b.b===t); }
function getBondsBetweenTiles(a,b){ return bonds.filter(x=> (x.a===a && x.b===b) || (x.a===b && x.b===a)); }


function atomCanBond(t){
  if(t.type!=='atom') return false;
  return t.freeE>0 && getBondsForTile(t).length < t.cap;
}
function canCreateBondBetween(a,b){
  if(a===b) return false;
  return atomCanBond(a) && atomCanBond(b); 
}



let bondDragState = null; 
const guideOverlay = selectOne('#guide');
const guideCanvas = guideOverlay.querySelector('canvas');
const guideCtx = guideCanvas.getContext('2d');
const DRAG_SNAP_RADIUS = 26; 
function bindElectronHandleEvents(tile, eEl){
  eEl.addEventListener('pointerdown', ev=>{ ev.stopPropagation(); }, {passive:true});
  eEl.addEventListener('dblclick', (ev)=>{
    beginBondDrag(tile, eEl, ev.clientX, ev.clientY);
  });
}

function beginBondDrag(tile, eEl, clientX, clientY){
  if(!atomCanBond(tile)){ pulseElectron(eEl); return; }
  bondDragState = { tile, eEl, ghost:createGhostElectron(), targetEl:null, targetTile:null };
  eEl.classList.add('arm');
  toggleGuideOverlay(true);
  document.addEventListener('pointermove', handleBondDragMove);
  document.addEventListener('pointerup', finishBondDrag, {once:true});
  bondDragState.ghost.style.left = (clientX - 6) + 'px'; bondDragState.ghost.style.top = (clientY - 6) + 'px';
}

function createGhostElectron(){
  const d = document.createElement('div');
  d.className='e arm'; d.style.position='fixed'; d.style.left='-100px'; d.style.top='-100px'; d.style.pointerEvents='none'; d.style.zIndex=21;
  document.body.appendChild(d); return d;
}

function handleBondDragMove(e){
  if(!bondDragState) return;
  const px = e.clientX, py = e.clientY;
  bondDragState.ghost.style.left = (px - 6) + 'px'; bondDragState.ghost.style.top = (py - 6) + 'px';
  const hit = findNearestElectronOnOtherTile(px, py, bondDragState.tile);
  highlightBondTarget(hit);
  redrawGuideOverlay(px, py, hit?.center);
}

function finishBondDrag(e){
  if(!bondDragState) return;
  const px=e.clientX, py=e.clientY;
  const hit = findNearestElectronOnOtherTile(px, py, bondDragState.tile);
  if(hit && canCreateBondBetween(bondDragState.tile, hit.tile)){
    createBondLink(bondDragState.tile, hit.tile);
  }else{
    showToast('Solte sobre um elétron de outro átomo.','info');
  }
  clearBondDragState();
}

function clearBondDragState(){
  if(!bondDragState) return;
  bondDragState.eEl.classList.remove('arm');
  bondDragState.ghost.remove(); bondDragState=null;
  clearBondTargetHighlights(); toggleGuideOverlay(false);
  document.removeEventListener('pointermove', handleBondDragMove);
}

function findNearestElectronOnOtherTile(px, py, tile){
  let best=null, bestD=1e9;
  for(const t of tiles){
    if(t===tile || t.isSymbol) continue;
    if(!atomCanBond(t)) continue;
    for(const eEl of t.electronsEls){
      const r = eEl.getBoundingClientRect();
      const cx = r.left + r.width/2; const cy = r.top + r.height/2;
      const d = Math.hypot(px - cx, py - cy);
      if(d < bestD){ bestD=d; best={tile:t, element:eEl, center:{x:cx, y:cy}}; }
    }
  }
  return (best && bestD <= DRAG_SNAP_RADIUS)? best : null;
}

function highlightBondTarget(hit){
  clearBondTargetHighlights();
  if(hit && hit.element) hit.element.classList.add('target');
  if(bondDragState){ bondDragState.targetEl = hit? hit.element:null; bondDragState.targetTile = hit? hit.tile:null; }
}
function clearBondTargetHighlights(){ document.querySelectorAll('.e.target').forEach(x=>x.classList.remove('target')); }

function toggleGuideOverlay(on){
  if(on){
    guideOverlay.style.display='block';
    guideCanvas.width = window.innerWidth; guideCanvas.height = window.innerHeight;
  } else {
    guideOverlay.style.display='none'; guideCtx.clearRect(0,0,guideCanvas.width,guideCanvas.height);
  }
}
function redrawGuideOverlay(px, py, target){
  guideCtx.clearRect(0,0,guideCanvas.width,guideCanvas.height);
  if(!target) return;
  guideCtx.lineWidth=2; guideCtx.strokeStyle='rgba(37,99,235,.35)';
  guideCtx.beginPath(); guideCtx.moveTo(px, py); guideCtx.lineTo(target.x, target.y); guideCtx.stroke();
}
function pulseElectron(node){ node.classList.add('target'); setTimeout(()=>node.classList.remove('target'), 280); }


function getBondLengthPx(a,b){
  const css = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bond-len'));
  let D = (css && isFinite(css)) ? css : 150;
  const aw = (a && a.element ? a.element.offsetWidth : 100);
  const bw = (b && b.element ? b.element.offsetWidth : 100);
  const minD = (aw + bw)/2 + 26; 
  if(D < minD) D = minD;
  return D;
}

function moveClusterByOffset(cluster, dx, dy){
  if(!cluster || !cluster.length) return;
  cluster.forEach(t=>{
    t.x += dx; t.y += dy;
    t.element.style.left = t.x + 'px';
    t.element.style.top  = t.y + 'px';
  });
}

function snapDistanceAfterBondCreate(a, b, preA, preB){
  if(!preA || !preB) return;
  
  if(preA.includes(b) || preB.includes(a)) return;

  const A = getTileCenter(a), B = getTileCenter(b);
  const dx = (B.x - A.x), dy = (B.y - A.y);
  const len = Math.hypot(dx, dy);
  if(len < 0.5) return;

  const D = getBondLengthPx(a,b);
  const ux = dx / len, uy = dy / len;
  const delta = (len - D);

  
  const moveA = (preA.length <= preB.length);
  const sx = ux * delta, sy = uy * delta;

  if(moveA) moveClusterByOffset(preA,  sx,  sy);
  else      moveClusterByOffset(preB, -sx, -sy);
}
function createBondLink(a,b){
  if(!canCreateBondBetween(a,b)) return;

  
  const preA = collectClusterTiles(a);
  const preB = collectClusterTiles(b);

  a.freeE -= 1; b.freeE -= 1;
  redrawElectrons(a); redrawElectrons(b);
  const el1 = document.createElement('i'); el1.className='pairDot';
  const el2 = document.createElement('i'); el2.className='pairDot';
  boardSurface.appendChild(el1); boardSurface.appendChild(el2);
  const unit = {a,b,el1,el2};
  bonds.push(unit);
  el1.addEventListener('click', ()=> maybeRemoveDetachedTile(unit));
  el2.addEventListener('click', ()=> maybeRemoveDetachedTile(unit));

  
  snapDistanceAfterBondCreate(a, b, preA, preB);

  redrawAllBonds();
  showToast('Ligação criada.', 'ok');
  refreshReadout();
}

function maybeRemoveDetachedTile(unit){
  if(!removeMode) return;
  removeBondLink(unit);
  setRemoveMode(false);
}

function removeBondLink(unit){
  unit.a.freeE += 1; unit.b.freeE += 1;
  unit.el1.remove(); unit.el2.remove();
  bonds = bonds.filter(x=>x!==unit);
  redrawElectrons(unit.a); redrawElectrons(unit.b);
  redrawAllBonds(); refreshReadout();
  showToast('Ligação removida.', 'info');
}

function redrawAllBonds(){
  const groups = new Map();
  for(const b of bonds){
    const k = bondPairKey(b.a, b.b);
    if(!groups.has(k)) groups.set(k, []);
    groups.get(k).push(b);
  }
  for(const [k, arr] of groups){
    const a = arr[0].a, b = arr[0].b;
    const A=getTileCenter(a), B=getTileCenter(b);
    const ux = (B.x-A.x), uy=(B.y-A.y);
    const len = Math.hypot(ux,uy) || 1;
    const vx = ux/len, vy = uy/len;
    const nx = -vy, ny = vx;
    const mid = {x:(A.x+B.x)/2, y:(A.y+B.y)/2};
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pair-gap')) || 7;
    const distAxis = gap/2 + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--e'))/2);
    const multi = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--multi-gap')) || 10;
    const n = arr.length; const offsets = Array.from({length:n}, (_,i)=> (i - (n-1)/2) * multi);
    arr.forEach((unit, i)=>{
      const off = offsets[i];
      const cx = mid.x + nx*off, cy = mid.y + ny*off;
      const p1 = {x: cx - vx*distAxis, y: cy - vy*distAxis};
      const p2 = {x: cx + vx*distAxis, y: cy + vy*distAxis};
      positionElectronDot(unit.el1, p1); positionElectronDot(unit.el2, p2);
    });
  }
}

function positionElectronDot(elm, p){
  const br = boardSurface.getBoundingClientRect();
  const size = (elm.offsetWidth||8)/2;
  elm.style.left = (p.x - br.left - window.scrollX - size) + 'px';
  elm.style.top  = (p.y - br.top  - window.scrollY - size) + 'px';
}

function bondPairKey(a,b){
  const ai = tiles.indexOf(a), bi = tiles.indexOf(b);
  return ai<bi ? ai+'|'+bi : bi+'|'+ai;
}


function redrawElectrons(t){
  for(const e of t.electronsEls) e.remove();
  t.electronsEls.length=0;
  if(t.isSymbol) return;
  const pad=6; const w = t.element.offsetWidth; const h=t.element.offsetHeight;
  const pos = {
    'T1': {x:w/2, y:pad},              'T2': {x:w/2+12, y:pad},
    'R1': {x:w-6, y:h/2},              'R2': {x:w-6, y:h/2+12},
    'B1': {x:w/2, y:h-6},              'B2': {x:w/2-12, y:h-6},
    'L1': {x:6, y:h/2},                'L2': {x:6, y:h/2-12},
  };
  const fillOrder = ['T1','R1','B1','L1','T2','R2','B2','L2'];
  const n = Math.max(0, Math.min(8, t.freeE));
  for(let i=0;i<n && i<fillOrder.length;i++){
    const p = pos[fillOrder[i]]; if(!p) continue;
    const d = document.createElement('i'); d.className='e';
    d.style.left = (p.x - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--e'))/2)) + 'px';
    d.style.top  = (p.y - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--e')||8)/2)) + 'px';
    t.element.appendChild(d); t.electronsEls.push(d);
    bindElectronHandleEvents(t, d);
  }
}


function collectCurrentClusters(){
  const atoms = tiles.filter(t=>!t.isSymbol);
  const seen=new Set(); const groups=[];
  for(const t of atoms){
    if(seen.has(t)) continue;
    const g = collectClusterTiles(t);
    g.forEach(x=>seen.add(x)); groups.push(g);
  }
  return groups;
}
function buildClusterFormula(group){
  const map = new Map();
  for(const t of group){ const id = t.sym; map.set(id, (map.get(id)||0)+1); }
  const order = (a,b)=>{
    if(a==='C' && b!=='C') return -1;
    if(b==='C' && a!=='C') return 1;
    if(a==='H' && b!=='H' && b!=='C') return -1;
    if(b==='H' && a!=='H' && a!=='C') return 1;
    return a.localeCompare(b,'pt-BR');
  };
  const parts = [...map.entries()].sort((x,y)=>order(x[0],y[0])).map(([sym,n])=> sym + (n>1? toSubscript(n):''));
  return parts.join('') || '—';
}

function refreshReadout(){
  bondCountOutput.textContent = bonds.length;
  tileCountOutput.textContent = tiles.length;

  
  const clusters = collectCurrentClusters().map(g=>({type:'species', text: buildClusterFormula(g), x: Math.min(...g.map(t=>t.x))}));

  
  const syms = tiles.filter(t=>t.type==='symbol').map(t=>({type:'symbol', text: getSymbolLabel(t.sym), x: t.x}));

  
  const tokens = clusters.concat(syms).sort((a,b)=> a.x - b.x);

  
  if(tokens.length){
    const parts = tokens.map(tok => tok.type==='symbol'
      ? `<span class='exprItem' style="padding:0 6px; font-weight:800">${tok.text}</span>`
      : `<span class='exprItem'><span class='exprSpecies'>${tok.text}</span></span>`);
    formulaOutput.innerHTML = parts.join(' ');
  } else {
    formulaOutput.innerHTML = '—';
  }

  tiles.forEach(o=>o.element.classList.toggle('valid', true));
}


let removeMode = false;
const btnRm = document.getElementById('rmBond');
btnRm.addEventListener('click', ()=> setRemoveMode(!removeMode));
function setRemoveMode(on){
  removeMode = on;
  document.body.classList.toggle('removing', on);
  btnRm.classList.toggle('active', on);
  if(on) showToast('Clique em uma ligação para remover.', 'bad');
}


let toastTimer=null;
function showToast(msg, kind='info'){
  clearTimeout(toastTimer);
  let t = document.getElementById('__toast');
  if(!t){
    t=document.createElement('div'); t.id='__toast';
    t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
    Object.assign(t.style,{ position:'fixed', left:'50%', bottom:'18px', transform:'translateX(-50%)',
      padding:'10px 14px', borderRadius:'10px', border:'1px solid var(--grid)',
      background:'#fff', boxShadow:'0 10px 30px #00000018', zIndex:30, fontWeight:'700' });
    document.body.appendChild(t);
  }
  if(kind==='ok'){ t.style.color = '#065f46'; t.style.background = '#ecfdf5'; }
  else if(kind==='bad'){ t.style.color = '#7f1d1d'; t.style.background = '#fef2f2'; }
  else { t.style.color = '#1f2937'; t.style.background = '#eef2ff'; }
  t.textContent=msg; t.style.opacity='1';
  toastTimer=setTimeout(()=>{ t.style.opacity='0'; }, 2200);
}
