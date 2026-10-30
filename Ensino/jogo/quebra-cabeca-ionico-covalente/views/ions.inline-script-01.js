const IONS = [
  
  
  {id:'Li+',  label:'Li',  name:'lítio',        charge:+1, type:'cat', family:'cat'},
  {id:'Na+',  label:'Na',  name:'sódio',        charge:+1, type:'cat', family:'cat'},
  {id:'K+',   label:'K',   name:'potássio',     charge:+1, type:'cat', family:'cat'},
  {id:'Rb+',  label:'Rb',  name:'rubídio',      charge:+1, type:'cat', family:'cat'},
  {id:'Cs+',  label:'Cs',  name:'césio',        charge:+1, type:'cat', family:'cat'},
  {id:'Ag+',  label:'Ag',  name:'prata(I)',     charge:+1, type:'cat', family:'cat'},
  {id:'H+',   label:'H',   name:'hidrogênio (próton)', charge:+1, type:'cat', family:'cat'},
  {id:'H3O+', label:'H\u2083O', name:'hidroxônio', charge:+1, type:'cat', poly:true, family:'cat'},
  {id:'NH4+', label:'NH\u2084', name:'amônio',   charge:+1, type:'cat', poly:true, family:'cat'},

  
  {id:'Mg2+', label:'Mg', name:'magnésio', charge:+2, type:'cat', family:'cat'},
  {id:'Ca2+', label:'Ca', name:'cálcio',   charge:+2, type:'cat', family:'cat'},
  {id:'Sr2+', label:'Sr', name:'estrôncio',charge:+2, type:'cat', family:'cat'},
  {id:'Ba2+', label:'Ba', name:'bário',    charge:+2, type:'cat', family:'cat'},
  {id:'Zn2+', label:'Zn', name:'zinco',    charge:+2, type:'cat', family:'cat'},
  {id:'Hg2+', label:'Hg', name:'mercúrio(II) (mercúrico)', charge:+2, type:'cat', family:'cat'},
  {id:'Hg2_2+', label:'Hg\u2082', name:'mercúrio(I) (dímero Hg\u2082\u00B2\u207A)', charge:+2, type:'cat', poly:true, family:'cat'},

  
  {id:'Al3+', label:'Al', name:'alumínio', charge:+3, type:'cat', family:'cat'},

  
  {id:'Cu+',  label:'Cu', name:'cobre(I)',   charge:+1, type:'cat', family:'cat'},
  {id:'Cu2+', label:'Cu', name:'cobre(II)',  charge:+2, type:'cat', family:'cat'},
  {id:'Au+',  label:'Au', name:'ouro(I)',    charge:+1, type:'cat', family:'cat'},
  {id:'Au3+', label:'Au', name:'ouro(III)',  charge:+3, type:'cat', family:'cat'},
  {id:'Fe2+', label:'Fe', name:'ferro(II) (ferroso)', charge:+2, type:'cat', family:'cat'},
  {id:'Fe3+', label:'Fe', name:'ferro(III) (férrico)', charge:+3, type:'cat', family:'cat'},
  {id:'Co2+', label:'Co', name:'cobalto(II)', charge:+2, type:'cat', family:'cat'},
  {id:'Co3+', label:'Co', name:'cobalto(III)',charge:+3, type:'cat', family:'cat'},
  {id:'Ni2+', label:'Ni', name:'níquel(II)',  charge:+2, type:'cat', family:'cat'},
  {id:'Ni3+', label:'Ni', name:'níquel(III)', charge:+3, type:'cat', family:'cat'},
  {id:'Cr2+', label:'Cr', name:'cromo(II)',   charge:+2, type:'cat', family:'cat'},
  {id:'Cr3+', label:'Cr', name:'cromo(III)',  charge:+3, type:'cat', family:'cat'},
  {id:'Pb2+', label:'Pb', name:'chumbo(II) (plumboso)', charge:+2, type:'cat', family:'cat'},
  {id:'Pb4+', label:'Pb', name:'chumbo(IV) (plúmbico)', charge:+4, type:'cat', family:'cat'},
  {id:'Sn2+', label:'Sn', name:'estanho(II) (estanoso)', charge:+2, type:'cat', family:'cat'},
  {id:'Sn4+', label:'Sn', name:'estanho(IV) (estânico)', charge:+4, type:'cat', family:'cat'},
  {id:'Pt2+', label:'Pt', name:'platina(II)', charge:+2, type:'cat', family:'cat'},
  {id:'Pt4+', label:'Pt', name:'platina(IV)', charge:+4, type:'cat', family:'cat'},

  
  
  {id:'NO2-', label:'NO\u2082', name:'nitrito', charge:-1, type:'an', poly:true, family:'nit'},
  {id:'NO3-', label:'NO\u2083', name:'nitrato', charge:-1, type:'an', poly:true, family:'nit'},
  {id:'N3_1-', label:'N\u2083', name:'azida',   charge:-1, type:'an', poly:true, family:'nit'},
  {id:'N3-',  label:'N',   name:'nitreto', charge:-3, type:'an', family:'nit'},

  
  {id:'PO3_1-', label:'PO\u2083', name:'metafosfato', charge:-1, type:'an', poly:true, family:'fos'},
  {id:'H2PO2-', label:'H\u2082PO\u2082', name:'hipofosfito', charge:-1, type:'an', poly:true, family:'fos'},
  {id:'HPO3_2-', label:'HPO\u2083', name:'hidrogenofosfito', charge:-2, type:'an', poly:true, family:'fos'},
  {id:'PO3_3-', label:'PO\u2083', name:'fosfito', charge:-3, type:'an', poly:true, family:'fos'},
  {id:'PO4_3-', label:'PO\u2084', name:'fosfato', charge:-3, type:'an', poly:true, family:'fos'},
  {id:'P3-',    label:'P', name:'fosfeto', charge:-3, type:'an', family:'fos'},
  {id:'P2O7_4-', label:'P\u2082O\u2087', name:'pirofosfato', charge:-4, type:'an', poly:true, family:'fos'},
  {id:'P2O6_4-', label:'P\u2082O\u2086', name:'hipofosfato', charge:-4, type:'an', poly:true, family:'fos'},

  
  {id:'S2-',   label:'S', name:'sulfeto', charge:-2, type:'an', family:'sul'},
  {id:'SO4_2-', label:'SO\u2084', name:'sulfato', charge:-2, type:'an', poly:true, family:'sul'},
  {id:'SO3_2-', label:'SO\u2083', name:'sulfito', charge:-2, type:'an', poly:true, family:'sul'},
  {id:'S2O3_2-', label:'S\u2082O\u2083', name:'tiossulfato', charge:-2, type:'an', poly:true, family:'sul'},
  {id:'HSO3-',  label:'HSO\u2083', name:'hidrogenossulfito', charge:-1, type:'an', poly:true, family:'sul'},
  {id:'S2O8_2-', label:'S\u2082O\u2088', name:'persulfato', charge:-2, type:'an', poly:true, family:'sul'},
  {id:'S4O6_2-', label:'S\u2084O\u2086', name:'tetrationato', charge:-2, type:'an', poly:true, family:'sul'},

  
  {id:'F-',  label:'F',  name:'fluoreto', charge:-1, type:'an', family:'hal'},
  {id:'Cl-', label:'Cl', name:'cloreto',  charge:-1, type:'an', family:'hal'},
  {id:'Br-', label:'Br', name:'brometo',  charge:-1, type:'an', family:'hal'},
  {id:'I-',  label:'I',  name:'iodeto',   charge:-1, type:'an', family:'hal'},
  {id:'ClO-',  label:'ClO',  name:'hipoclorito', charge:-1, type:'an', poly:true, family:'hal'},
  {id:'ClO2-', label:'ClO\u2082', name:'clorito', charge:-1, type:'an', poly:true, family:'hal'},
  {id:'ClO3-', label:'ClO\u2083', name:'clorato', charge:-1, type:'an', poly:true, family:'hal'},
  {id:'ClO4-', label:'ClO\u2084', name:'perclorato', charge:-1, type:'an', poly:true, family:'hal'},
  {id:'BrO-',  label:'BrO',  name:'hipobromito', charge:-1, type:'an', poly:true, family:'hal'},
  {id:'BrO3-', label:'BrO\u2083', name:'bromato', charge:-1, type:'an', poly:true, family:'hal'},
  {id:'IO-',   label:'IO',   name:'hipoiodito', charge:-1, type:'an', poly:true, family:'hal'},
  {id:'IO3-',  label:'IO\u2083', name:'iodato', charge:-1, type:'an', poly:true, family:'hal'},
  {id:'IO4-',  label:'IO\u2084', name:'periodato', charge:-1, type:'an', poly:true, family:'hal'},

  
  {id:'CN-',    label:'CN', name:'cianeto', charge:-1, type:'an', poly:true, family:'carb'},
  {id:'CNO-',   label:'CNO', name:'cianato', charge:-1, type:'an', poly:true, family:'carb'},
  {id:'CNS-',   label:'CNS', name:'tiocianato', charge:-1, type:'an', poly:true, family:'carb'},
  {id:'CH3COO-', label:'CH\u2083COO', name:'acetato', charge:-1, type:'an', poly:true, family:'carb'},
  {id:'CO3_2-',  label:'CO\u2083', name:'carbonato', charge:-2, type:'an', poly:true, family:'carb'},
  {id:'HCOO-',   label:'HCOO', name:'formiato', charge:-1, type:'an', poly:true, family:'carb'},
  {id:'C2O4_2-', label:'C\u2082O\u2084', name:'oxalato', charge:-2, type:'an', poly:true, family:'carb'},
  {id:'FeCN6_3-', label:'Fe(CN)\u2086', name:'ferricianeto', charge:-3, type:'an', poly:true, family:'carb'},
  {id:'FeCN6_4-', label:'Fe(CN)\u2086', name:'ferrocianeto', charge:-4, type:'an', poly:true, family:'carb'},
  {id:'C4-',    label:'C', name:'carbeto', charge:-4, type:'an', family:'carb'},
  {id:'C2_2-',  label:'C\u2082', name:'acetileto', charge:-2, type:'an', poly:true, family:'carb'},

  
  {id:'MnO4-',   label:'MnO\u2084', name:'permanganato', charge:-1, type:'an', poly:true, family:'out'},
  {id:'MnO4_2-', label:'MnO\u2084', name:'manganato', charge:-2, type:'an', poly:true, family:'out'},
  {id:'OH-',     label:'OH', name:'hidróxido', charge:-1, type:'an', poly:true, family:'out'},
  {id:'H_-',     label:'H',  name:'hidreto',   charge:-1, type:'an', family:'out'},
  {id:'O2-',     label:'O',  name:'óxido',     charge:-2, type:'an', family:'out'},
  {id:'SnO2_2-', label:'SnO\u2082', name:'estanito', charge:-2, type:'an', poly:true, family:'out'},
  {id:'SnO3_2-', label:'SnO\u2083', name:'estanato', charge:-2, type:'an', poly:true, family:'out'},
  {id:'SiO3_2-', label:'SiO\u2083', name:'metassilicato', charge:-2, type:'an', poly:true, family:'out'},
  {id:'SiO4_4-', label:'SiO\u2084', name:'ortossilicato', charge:-4, type:'an', poly:true, family:'out'},
  {id:'CrO4_2-', label:'CrO\u2084', name:'cromato', charge:-2, type:'an', poly:true, family:'out'},
  {id:'Cr2O7_2-', label:'Cr\u2082O\u2087', name:'dicromato', charge:-2, type:'an', poly:true, family:'out'},
  {id:'PbO2_2-', label:'PbO\u2082', name:'plumbito', charge:-2, type:'an', poly:true, family:'out'},
  {id:'B4O7_2-', label:'B\u2084O\u2087', name:'tetraborato', charge:-2, type:'an', poly:true, family:'out'},

  
  {id:'PLUS',  label:'+',  name:'mais',       charge:0, type:'op', family:'sym'},
  {id:'ARROW', label:'\u2192', name:'reação', charge:0, type:'op', family:'sym'},
  {id:'EQL',   label:'\u21CC', name:'equilíbrio', charge:0, type:'op', family:'sym'}
];





const selectOne = (selector, root=document)=> root.querySelector(selector);
const selectAll = (selector, root=document)=> [...root.querySelectorAll(selector)];
const randomIntBetween = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;

function chargeText(chargeValue){
  const s = Math.abs(chargeValue).toString() + (chargeValue>0?'+':'-');
  const sup = {'0':'\u2070','1':'\u00B9','2':'\u00B2','3':'\u00B3','4':'\u2074','5':'\u2075','6':'\u2076','7':'\u2077','8':'\u2078','9':'\u2079','+':'\u207A','-':'\u207B'};
  return [...s].map(ch=>sup[ch]||ch).join('');
}
const greatestCommonDivisor=(a,b)=>b?greatestCommonDivisor(b,a%b):a;
const leastCommonMultiple=(a,b)=>Math.abs(a*b)/greatestCommonDivisor(a,b);

function buildIonicFormula(items){
  
  if(!items.length) return '—';
  const cats={}, ans={};
  for(const t of items){
    const key = t.data.id;
    if(t.data.type==='cat') cats[key]=(cats[key]||0)+1;
    else if(t.data.type==='an') ans[key]=(ans[key]||0)+1;
  }
  const order = (a,b)=> (IONS.find(i=>i.id===a).type==='cat'? -1:1) - (IONS.find(i=>i.id===b).type==='cat'? -1:1);
  const fmt=(map)=>Object.entries(map)
    .sort((a,b)=>order(a[0],b[0]))
    .map(([id,n])=>{
      const ion = IONS.find(i=>i.id===id);
      const base = ion.label;
      const count = n*1;
      return (ion.type==='an' && ion.poly && (count>1) ? `(${base})` : base) + (count>1 ? toSubscript(count):'');
    }).join('');
  function toSubscript(n){return [...String(n)].map(d=>({'0':'\u2080','1':'\u2081','2':'\u2082','3':'\u2083','4':'\u2084','5':'\u2085','6':'\u2086','7':'\u2087','8':'\u2088','9':'\u2089'})[d]).join('')}
  const left = fmt(cats)+fmt(ans);
  return left || '—';
}



const ALKALI = new Set(['Li+','Na+','K+','Rb+','Cs+']);
const NH4 = 'NH4+';
const HALIDES = new Set(['Cl-','Br-','I-']);
const HEAVY_H_HALIDE_CATS = new Set(['Ag+','Pb2+','Hg2_2+']);
const SULFATE = 'SO4_2-';
const SULFATE_EXC = new Set(['Ba2+','Sr2+','Pb2+','Ca2+']);
const ALWAYS_SOL_ANIONS = new Set(['NO3-','ClO3-','ClO4-']);
const INSOLUBLE_ANIONS = new Set(['CO3_2-','PO4_3-','C2O4_2-','CrO4_2-','SiO3_2-','SiO4_4-','O2-']); 
const HYDROXIDE = 'OH-';

function getClusterCharge(g){
  return g.filter(t=>t.data.type==='cat'||t.data.type==='an').reduce((s,t)=>s+t.data.charge,0);
}

function predictStateBySolubility(cats, ans){
  if(ans.size===0 || cats.size===0) return null;
  if([...ans].some(a=>ALWAYS_SOL_ANIONS.has(a))) return 'aq';
  if([...cats].some(c=>ALKALI.has(c) || c===NH4)) return 'aq';

  if([...ans].some(a=>HALIDES.has(a)) && [...cats].some(c=>HEAVY_H_HALIDE_CATS.has(c))) return 's';

  if(ans.has(SULFATE) && [...cats].some(c=>SULFATE_EXC.has(c))) return 's';

  if(ans.has(HYDROXIDE)){
    if([...cats].some(c=>ALKALI.has(c) || ['Ba2+','Sr2+','Ca2+'].includes(c))) return 'aq';
    return 's';
  }

  if([...ans].some(a=>INSOLUBLE_ANIONS.has(a))) return 's';

  if(ans.has('S2-')){
    if([...cats].some(c=>ALKALI.has(c) || ['Mg2+','Ca2+','Sr2+','Ba2+'].includes(c) || c===NH4)) return 'aq';
    return 's';
  }

  return 'aq';
}


function cleanPortugueseName(n){ return (n||'').replace(/\s*\(.*?\)/,'').trim(); }

function buildSpeciesName(ions){
  
  const cats = ions.filter(t=>t.data.type==='cat').map(t=>t.data);
  const ans  = ions.filter(t=>t.data.type==='an').map(t=>t.data);
  if(!cats.length || !ans.length) return null;

  
  const uniqById = (arr)=>{
    const map = new Map();
    for(const a of arr){ map.set(a.id, a); }
    return [...map.values()];
  };
  const catUniq = uniqById(cats);
  const anUniq  = uniqById(ans);

  
  if(anUniq.length !== 1) return null;

  
  const clean = (x)=> cleanPortugueseName((x && (x.name||x.label)) || '');
  const anName = clean(anUniq[0]);
  if(!anName) return null;

  const catNames = catUniq.map(clean).filter(Boolean);
  if(!catNames.length) return null;

  
  catNames.sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const catsJoined = catNames.join(' e ');

  return anName + ' de ' + catsJoined;
}




let filterTerm = '';
function normalizeText(s){ return (s||'').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
const _searchBox = document.getElementById('searchBox');
if(_searchBox){
  _searchBox.addEventListener('input', ()=>{ filterTerm = normalizeText(_searchBox.value); refreshLibrary(); });
}


const libraryPanel = selectOne('#library');
const boardViewport = selectOne('#boardWrap');
const boardSurface = selectOne('#board');
const legendBox = selectOne('#legend');
const chargeOutput = selectOne('#charge');
const tileCountOutput = selectOne('#count');
const formulaOutput = selectOne('#formulaOut');

function refreshLibrary(){
  libraryPanel.innerHTML='';
  for(const ion of IONS){
    const q = normalizeText(ion.name||'') + ' ' + normalizeText(ion.label||'') + ' ' + normalizeText(ion.id||'');
    if(filterTerm && !q.includes(filterTerm)) continue;
    const div = document.createElement('div');
    const kind = ion.type==='cat' ? 'cat' : (ion.type==='an' ? 'an' : 'op');
    div.className = 'chip '+kind+' fam-'+(ion.family||'out');
    div.draggable=true; div.dataset.ion=ion.id;
    div.setAttribute('role', 'button');
    div.tabIndex = 0;
    div.setAttribute('aria-label', `${ion.name || ion.label}. Adicionar à mesa de montagem`);
    const charge = (ion.type==='cat'||ion.type==='an') ? `<sup class="sup">${chargeText(ion.charge)}</sup>` : '';
    div.innerHTML = `
      <span class=\"sym\">${ion.label}${charge}</span>
      <span class=\"name\">${ion.name||''}</span>
      <span class=\"val\">${ion.type==='cat'?'cátion': ion.type==='an'?'ânion':'símbolo'}</span>
    `;
    div.addEventListener('dragstart',e=>{ e.dataTransfer.setData('text/plain', ion.id); });
    div.addEventListener('dblclick',()=>placeIonTile(ion, randomIntBetween(40, 280), randomIntBetween(40, 220)));
    div.addEventListener('keydown', event=>{
      if(event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      placeIonTile(ion, randomIntBetween(40, 280), randomIntBetween(40, 220)).selectOne.focus();
    });
    libraryPanel.appendChild(div);
  }
  legendBox.innerHTML = `
    <div class="mini">Duplo-clique em qualquer item para enviar à mesa</div>
  `;
}


let tiles=[]; 
let selected=null;

function placeIonTile(ion, x=60, y=60){
  const t = document.createElement('div');
  const kind = ion.type==='cat' ? 'cat' : (ion.type==='an' ? 'an' : 'op');
  t.className='tile '+kind+' fam-'+(ion.family||'out');
  const charge = (ion.type==='cat'||ion.type==='an') ? `<sup class="sup">${chargeText(ion.charge)}</sup>` : '';
  t.innerHTML=`<div class=\"halo\"></div><div class=\"sym\">${ion.label}${charge}</div>${(ion.type==='cat'||ion.type==='an')?'<div class=\"tag\">'+(ion.name||'')+'</div>':''}`;
  t.style.left=x+'px'; t.style.top=y+'px';
  boardSurface.appendChild(t);
  const obj={selectOne:t, x, y, data:ion, links:new Set(), ports:[]}; t.title = (ion.name? ion.name+' — ' : '') + ion.label + ((ion.type==='cat'||ion.type==='an')? (ion.charge>0? '⁺':'⁻') : '');
  t.setAttribute('role', 'button');
  t.tabIndex = 0;
  t.setAttribute('aria-pressed', 'false');
  t.setAttribute('aria-label', `${ion.name || ion.label}. Peça na mesa; use as setas para mover e Delete para remover`);
  tiles.push(obj);

  
  if(ion.type==='cat' || ion.type==='an'){
    const n = Math.abs(ion.charge);
    const sideClass = ion.type; 
    for(let i=0;i<n;i++){
      const p = document.createElement('i');
      p.className = `port ${sideClass}`;
      
      const pct = ((i+1)/(n+1))*100;
      p.style.top = pct+'%';
      t.appendChild(p);
      obj.ports.push({selectOne:p, mate:null});
    }
  }

  enableTileDragging(obj);
  t.addEventListener('pointerdown',()=>focusTile(obj));
  t.addEventListener('keydown', event=>{
    const movement = { ArrowLeft:[-10,0], ArrowRight:[10,0], ArrowUp:[0,-10], ArrowDown:[0,10] }[event.key];
    if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); focusTile(obj); return; }
    if(event.key === 'Delete' || event.key === 'Backspace'){ event.preventDefault(); focusTile(obj); removeFocusedTile(); return; }
    if(!movement) return;
    event.preventDefault();
    focusTile(obj);
    const cluster = collectClusterTiles(obj);
    cluster.forEach(tile=>{
      tile.x += movement[0]; tile.y += movement[1];
      tile.selectOne.style.left = tile.x+'px'; tile.selectOne.style.top = tile.y+'px';
    });
    trySnapTile(obj);
    refreshReadout();
  });
  refreshReadout();
  return obj;
}

function focusTile(obj){
  tiles.forEach(o=>{ o.selectOne.classList.remove('ghost'); o.selectOne.setAttribute('aria-pressed', 'false'); });
  selected=obj; obj.selectOne.classList.add('ghost');
  obj.selectOne.setAttribute('aria-pressed', 'true');
}


function connectTiles(a,b){ if(!a.links) a.links=new Set(); if(!b.links) b.links=new Set(); if(!a.links.has(b)){ a.links.add(b); b.links.add(a); } }
function unlinkAllFromTile(a){
  if(a.links){ a.links.forEach(m=>{ m.links&&m.links.delete(a); }); a.links.clear&&a.links.clear(); }
  
  if(a.ports){ a.ports.forEach(pt=>{ if(pt.mate){ pt.mate.mate=null; pt.mate=null; } }); }
}
function collectClusterTiles(start){ const seen=new Set(); const out=[]; const stack=[start]; while(stack.length){ const n=stack.pop(); if(seen.has(n)) continue; seen.add(n); out.push(n); n.links&&n.links.forEach(m=>{ if(!seen.has(m)) stack.push(m); }); } return out; }
function collectAllClusters(){
  const seen=new Set(); const groups=[];
  for(const t of tiles){
    if(seen.has(t)) continue;
    const g = collectClusterTiles(t);
    g.forEach(x=>seen.add(x));
    groups.push(g);
  }
  return groups;
}

function enableTileDragging(obj){
  let dragging=false, startMouseX=0, startMouseY=0; let dragCluster=[];
  obj.selectOne.addEventListener('pointerdown',e=>{
    dragging=true; obj.selectOne.setPointerCapture(e.pointerId); obj.selectOne.classList.add('dragging');
    focusTile(obj); startMouseX=e.clientX; startMouseY=e.clientY; dragCluster = collectClusterTiles(obj);
    dragCluster.forEach(t=>{ t._startX=t.x; t._startY=t.y; });
  });
  obj.selectOne.addEventListener('pointermove',e=>{
    if(!dragging) return; const dx = e.clientX - startMouseX; const dy = e.clientY - startMouseY;
    dragCluster.forEach(t=>{ t.x = t._startX + dx; t.y = t._startY + dy; t.selectOne.style.left=t.x+'px'; t.selectOne.style.top=t.y+'px'; });
  });
  const end=e=>{ if(!dragging) return; dragging=false; obj.selectOne.classList.remove('dragging'); trySnapTile(obj); validateCurrentGroup(); };
  obj.selectOne.addEventListener('pointerup', end); obj.selectOne.addEventListener('pointercancel', end);
}

function getCurrentGroup(){ return tiles; }


function getPortCenterOnPage(tile, portEl){
  const r = portEl.getBoundingClientRect();
  return {x:r.left + r.width/2 + window.scrollX, y:r.top + r.height/2 + window.scrollY};
}

function validateCurrentGroup(){
  const ions = tiles.filter(t=>t.data.type==='cat'||t.data.type==='an');
  const q = ions.reduce((s,t)=>s+t.data.charge,0);
  chargeOutput.textContent = q>0 ? `+${q}` : `${q}`;
  tileCountOutput.textContent  = tiles.length;

  
  const clusters = collectAllClusters();
  const clustersWithX = clusters.map(g=>({g, x: Math.min(...g.map(t=>t.x))})).sort((a,b)=>a.x-b.x).map(o=>o.g);

  const parts = clustersWithX.map(g=>{
    const ionsOnly = g.filter(t=>t.data.type==='cat'||t.data.type==='an');
    if(ionsOnly.length){
      const f = buildIonicFormula(ionsOnly);
      const q = getClusterCharge(ionsOnly);
      const cats = new Set(ionsOnly.filter(t=>t.data.type==='cat').map(t=>t.data.id));
      const ans  = new Set(ionsOnly.filter(t=>t.data.type==='an').map(t=>t.data.id));
      const sol = predictStateBySolubility(cats, ans);
      const top = `<span class='exprSpecies'>${f} [${q>0 ? '+'+q : q}]${sol? ' ' + (sol==='s'?'(s)':'(aq)'):''}</span>`;
      const nm = buildSpeciesName(ionsOnly);
      const name = (q===0 ? `<span class='exprName'>${nm || 'não existe'}</span>` : '');
      return `<span class='exprItem'>${top}${name}</span>`;
    }
    
    return `<span class='exprOp'>${g.map(t=>t.data.label).join('')}</span>`;
  }).filter(Boolean);

  formulaOutput.innerHTML = parts.length ? parts.join(' ') : '—';

  const isZero = q===0 && ions.length>0;
  tiles.forEach(o=>o.selectOne.classList.toggle('valid', isZero));
}

function refreshReadout(){ validateCurrentGroup(); }


function trySnapTile(obj){
  if(!(obj.data.type==='cat' || obj.data.type==='an')) return; 
  const myFree = (obj.ports||[]).filter(p=>!p.mate);
  if(!myFree.length) return;

  const oppTiles = tiles.filter(o=>o!==obj && (o.data.type==='cat'||o.data.type==='an') && o.data.type!==obj.data.type);
  let best=null, bestDist=1e9, bestMyPort=null, bestOppPort=null, bestOppTile=null;

  for(const opp of oppTiles){
    const oppFree = (opp.ports||[]).filter(p=>!p.mate);
    if(!oppFree.length) continue;
    for(const p of myFree){
      const pc = getPortCenterOnPage(obj, p.selectOne);
      for(const q of oppFree){
        const qc = getPortCenterOnPage(opp, q.selectOne);
        const dx = pc.x - qc.x, dy = pc.y - qc.y;
        const d = Math.hypot(dx,dy);
        if(d < bestDist){ bestDist=d; best={dx,dy}; bestMyPort=p; bestOppPort=q; bestOppTile=opp; }
      }
    }
  }

  
  const THR = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--port'))/2; 
  if(best && bestDist < THR){
    
    const dx = best.dx, dy = best.dy;
    const cluster = collectClusterTiles(obj);
    cluster.forEach(t=>{
      t.x = Math.round(t.x - dx);
      t.y = Math.round(t.y - dy);
      t.selectOne.style.left = t.x+'px';
      t.selectOne.style.top  = t.y+'px';
    });
    
    bestMyPort.mate = bestOppPort;
    bestOppPort.mate = bestMyPort;
    connectTiles(obj, bestOppTile);
    showToast('Encaixe feito (1:1 por porta).', 'ok');
  }
  validateCurrentGroup();
}


function removeFocusedTile(){
  if(!selected){ showToast('Selecione uma peça para remover.', 'info'); return; }
  unlinkAllFromTile(selected);
  selected.selectOne.remove();
  tiles=tiles.filter(t=>t!==selected);
  selected=null; refreshReadout();
}

selectOne('#check').addEventListener('click', ()=>{
  const ions = tiles.filter(t=>t.data.type==='cat'||t.data.type==='an');
  if(!ions.length){ showToast('Nada na mesa ainda 🤏', 'err'); return; }
  const q = ions.reduce((s,t)=>s+t.data.charge,0);
  const expr = formulaOutput.textContent || '—';
  if(q===0){ showToast('Eletroneutro! Expressão: '+expr, 'ok'); }
  else if(q>0){ showToast('Ainda falta carga negativa (ânions).', 'err'); }
  else { showToast('Ainda falta carga positiva (cátions).', 'err'); }
});

selectOne('#deleteSel').addEventListener('click', removeFocusedTile);
selectOne('#clearBoard').addEventListener('click', ()=>{ tiles.forEach(t=>t.selectOne.remove()); tiles=[]; selected=null; refreshReadout(); });


function addOperatorSymbol(id){ const ion = IONS.find(i=>i.id===id); if(!ion) return; placeIonTile(ion, randomIntBetween(80, boardViewport.clientWidth-160), randomIntBetween(60, boardViewport.clientHeight-120)); }
selectOne('#addPlus').addEventListener('click', ()=>addOperatorSymbol('PLUS'));
selectOne('#addArrow').addEventListener('click', ()=>addOperatorSymbol('ARROW'));
selectOne('#addEq').addEventListener('click', ()=>addOperatorSymbol('EQL'));


let toastTimer=null;
function showToast(msg, kind='info'){
  clearTimeout(toastTimer);
  let t = selectOne('#__toast');
  if(!t){
    t=document.createElement('div'); t.id='__toast';
    t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
    Object.assign(t.style,{ position:'fixed', left:'50%', bottom:'18px', transform:'translateX(-50%)',
      padding:'10px 14px', borderRadius:'10px', border:'1px solid var(--grid)',
      background:'#fff', boxShadow:'0 10px 30px #00000018', zIndex:20, fontWeight:'700' });
    document.body.appendChild(t);
  }
  t.className=''; t.textContent=msg;
  if(kind==='ok'){ t.style.color = '#065f46'; t.style.background = '#ecfdf5'; }
  else if(kind==='err'){ t.style.color = '#7f1d1d'; t.style.background = '#fef2f2'; }
  else { t.style.color = '#1f2937'; t.style.background = '#eef2ff'; }
  t.style.opacity='1';
  toastTimer=setTimeout(()=>{ t.style.opacity='0'; }, 2200);
}


refreshLibrary();




;

document.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('toggleSide');
  function syncBoardLayout(){
    const off = document.body.classList.contains('right-off');
    if(btn) btn.textContent = off ? 'Mostrar Leitura & Dicas' : 'Esconder Leitura & Dicas';
  }
  if(btn){
    btn.addEventListener('click', ()=>{ document.body.classList.toggle('right-off'); syncBoardLayout(); });
    syncBoardLayout();
  }
});
