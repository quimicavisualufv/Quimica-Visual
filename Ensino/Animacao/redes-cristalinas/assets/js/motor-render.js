
let REMOVED_EMBED_BONDS = JSON.parse(localStorage.getItem('REMOVED_EMBED_BONDS')||'[]');
let REMOVED_EMBED_COORDS = JSON.parse(localStorage.getItem('REMOVED_EMBED_COORDS')||'[]');
function saveRemovedEmbeds(){
  localStorage.setItem('REMOVED_EMBED_BONDS', JSON.stringify(REMOVED_EMBED_BONDS));
  localStorage.setItem('REMOVED_EMBED_COORDS', JSON.stringify(REMOVED_EMBED_COORDS));
}
function removedEmbedBondHas(key,cells,id){
  return REMOVED_EMBED_BONDS.some(e=>e.key===key && e.cells===cells && e.id===id);
}
function markRemovedEmbedBond(key,cells,id){
  if(!removedEmbedBondHas(key,cells,id)){
    REMOVED_EMBED_BONDS.push({key,cells,id}); saveRemovedEmbeds();
  }
}
function clearRemovedEmbedsFor(key,cells){
  REMOVED_EMBED_BONDS = REMOVED_EMBED_BONDS.filter(e=>!(e.key===key && e.cells===cells));
  REMOVED_EMBED_COORDS = REMOVED_EMBED_COORDS.filter(e=>!(e.key===key && e.cells===cells));
  saveRemovedEmbeds();
}


let EMBEDDED_BONDS =   [{"key": "HEX_ABC", "a": {"type": "X", "uc": [0.5000000000000001, 0.28867513459481287, 0.816496580927726]}, "b": {"type": "X", "uc": [-0.5000000000000001, 0.28867513459481287, 0.816496580927726]}}, {"key": "HEX_ABC", "a": {"type": "X", "uc": [-0.5000000000000001, 0.28867513459481287, 0.816496580927726]}, "b": {"type": "X", "uc": [-1.0605752387249069e-16, -0.5773502691896258, 0.816496580927726]}}, {"key": "HEX_ABC", "a": {"type": "X", "uc": [-1.0605752387249069e-16, -0.5773502691896258, 0.816496580927726]}, "b": {"type": "X", "uc": [0.5000000000000001, 0.28867513459481287, 0.816496580927726]}}, {"key": "HEX_ABC", "a": {"type": "X", "uc": [1.0, 0.0, 0.0]}, "b": {"type": "X", "uc": [0.5000000000000001, 0.8660254037844386, 0.0]}}, {"key": "HEX_ABC", "a": {"type": "X", "uc": [0.5000000000000001, 0.8660254037844386, 0.0]}, "b": {"type": "X", "uc": [-0.4999999999999998, 0.8660254037844387, 0.0]}}, {"key": "HEX_ABC", "a": {"type": "X", "uc": [-0.4999999999999998, 0.8660254037844387, 0.0]}, "b": {"type": "X", "uc": [-1.0, 1.2246467991473532e-16, 0.0]}}, {"key": "HEX_ABC", "a": {"type": "X", "uc": [-1.0, 1.2246467991473532e-16, 0.0]}, "b": {"type": "X", "uc": [-0.5000000000000004, -0.8660254037844384, 0.0]}}, {"key": "HEX_ABC", "a": {"type": "X", "uc": [-0.5000000000000004, -0.8660254037844384, 0.0]}, "b": {"type": "X", "uc": [0.5000000000000001, -0.8660254037844386, 0.0]}}, {"key": "HEX_ABC", "a": {"type": "X", "uc": [0.5000000000000001, -0.8660254037844386, 0.0]}, "b": {"type": "X", "uc": [1.0, 0.0, 0.0]}}, {"key": "HEX_ABC", "a": {"type": "X", "uc": [3.53525079574969e-17, 0.5773502691896258, -0.816496580927726]}, "b": {"type": "X", "uc": [-0.5, -0.288675134594813, -0.816496580927726]}}, {"key": "HEX_ABC", "a": {"type": "X", "uc": [-0.5, -0.288675134594813, -0.816496580927726]}, "b": {"type": "X", "uc": [0.4999999999999999, -0.2886751345948132, -0.816496580927726]}}, {"key": "HEX_ABC", "a": {"type": "X", "uc": [0.4999999999999999, -0.2886751345948132, -0.816496580927726]}, "b": {"type": "X", "uc": [3.53525079574969e-17, 0.5773502691896258, -0.816496580927726]}}];







function setIntroFixedView(controls, camera){
  try{
    if (controls) {
      if ('enableRotate' in controls) controls.enableRotate = false;
      if ('enabled' in controls) controls.enabled = true; 
    }
    if (camera && camera.position){
      
      camera.position.set(6, 7, 8);
      if (camera.lookAt) camera.lookAt(0,0,0);
    }
  }catch(e){}
}

const TAU=Math.PI*2, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const deg2rad=d=>d*Math.PI/180, rad2deg=r=>r*180/Math.PI;
function rotX(p,a){const s=Math.sin(a),c=Math.cos(a);return [p[0],c*p[1]-s*p[2],s*p[1]+c*p[2]];}
function rotY(p,a){const s=Math.sin(a),c=Math.cos(a);return [c*p[0]+s*p[2],p[1],-s*p[0]+c*p[2]];}
function rotZ(p,a){const s=Math.sin(a),c=Math.cos(a);return [c*p[0]-s*p[1],s*p[0]+c*p[1],p[2]];}



function matMulVec(M, v){
  return [
    M[0][0]*v[0] + M[0][1]*v[1] + M[0][2]*v[2],
    M[1][0]*v[0] + M[1][1]*v[1] + M[1][2]*v[2],
    M[2][0]*v[0] + M[2][1]*v[1] + M[2][2]*v[2],
  ];
}
function diag3(a,b,c){ return [[a,0,0],[0,b,0],[0,0,c]]; }


function cellMatrix(a,b,c, alphaDeg, betaDeg, gammaDeg){
  const A = alphaDeg*Math.PI/180, B = betaDeg*Math.PI/180, G = gammaDeg*Math.PI/180;
  const ca=Math.cos(A), cb=Math.cos(B), cg=Math.cos(G), sg=Math.sin(G);
  
  const vx = [a, b*cg, c*cb];
  const vy = [0, b*sg, c*(ca - cb*cg)/sg];
  const V = (1 - ca*ca - cb*cb - cg*cg + 2*ca*cb*cg) ** 0.5;
  const vz = [0, 0, c*V/sg];
  return [vx, vy, vz];
}
const canvas=document.getElementById('canvas'), ctx=canvas.getContext('2d');
function resize(){const dpr=window.devicePixelRatio||1;canvas.width=canvas.clientWidth*dpr;canvas.height=canvas.clientHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
window.addEventListener('resize',resize); resize();

const ui={
  projecaoOrto:document.getElementById('projecaoOrto'),

  structure:document.getElementById('structure'),
  cells:document.getElementById('cells'),
  radius:document.getElementById('radius'),
  spacing:document.getElementById('spacing'),
  light:document.getElementById('light'),
  mostrarArestas:document.getElementById('mostrarArestas'),
  somenteCelula:document.getElementById('somenteCelula'),
  apenasUmaFace:document.getElementById('apenasUmaFace'),
  seletorFace:document.getElementById('seletorFace'),
  bonds:document.getElementById('bonds'),
  coordpoly:document.getElementById('coordpoly'),
  schottky:document.getElementById('schottky'),
  frenkel:document.getElementById('frenkel'),
  angleX:document.getElementById('angleX'),
  angleY:document.getElementById('angleY'),
  angleZ:document.getElementById('angleZ'),
  angleXValue:document.getElementById('angleXValue'),
  angleYValue:document.getElementById('angleYValue'),
  angleZValue:document.getElementById('angleZValue'),
  introBox:document.getElementById('introBox'),
  introSeq:document.getElementById('introSeq'),
  introLayers:document.getElementById('introLayers'),
  introLayersValue:document.getElementById('introLayersValue'),
  addLayer:document.getElementById('addLayer'),
  removeLayer:document.getElementById('removeLayer'),
  editBonds:document.getElementById('editBonds'),
  exportarLigacoes:document.getElementById('exportarLigacoes'),
  showBonds:document.getElementById('showBonds'),
  clearBonds:document.getElementById('clearBonds'),
  delBonds:document.getElementById('delBonds'),
  exportArea:document.getElementById('exportArea'),
  editCoord:document.getElementById('editCoord'),
  exportCoord:document.getElementById('exportCoord'),
  exportAllTxt:document.getElementById('exportAllTxt'),
  clearCoord:document.getElementById('clearCoord'),
  delCoord:document.getElementById('delCoord'),
  delAtom:document.getElementById('delAtom'),
  addAtom:document.getElementById('addAtom'),
  addAtomType:document.getElementById('addAtomType'),
};

function createDetachedControl(tagName='input', inputType='text'){
  const node = document.createElement(tagName);
  if (tagName === 'input') node.type = inputType;
  node.style.display = 'none';
  return node;
}

function ensureUiControl(name, tagName='input', inputType='checkbox'){
  if (ui[name]) return ui[name];
  ui[name] = createDetachedControl(tagName, inputType);
  return ui[name];
}

ensureUiControl('bonds', 'input', 'checkbox');
ensureUiControl('coordpoly', 'input', 'checkbox');
ensureUiControl('schottky', 'input', 'checkbox');
ensureUiControl('frenkel', 'input', 'checkbox');
ensureUiControl('editCoord', 'input', 'checkbox');
ensureUiControl('delCoord', 'input', 'checkbox');
ensureUiControl('introBox', 'div');
ensureUiControl('introSeq', 'select');
ensureUiControl('introLayers', 'input', 'range');
ensureUiControl('introLayersValue', 'span');
ensureUiControl('addLayer', 'button');
ensureUiControl('removeLayer', 'button');
ensureUiControl('exportCoord', 'button');
ensureUiControl('clearCoord', 'button');

try {
  if (!ui.angleYValue) { ui.angleYValue = createDetachedControl('span'); }
} catch(e) {}

try {
  
  if (typeof EMBEDDED_COORDS === 'undefined') { window.EMBEDDED_COORDS = []; }
  if (typeof ALL_COORDS === 'undefined') { window.ALL_COORDS = []; }
  
  window.coordsForCurrent = function(){ return []; };
  window.toggleCoord = function(){  };
  window.clearCoordsCurrent = function(){  };
  window.saveLocalCoord = function(){  };
  window.syncPolyToCoord = function(){  };
} catch(e) {}



try {
  if (!ui.clearCoord) ui.clearCoord = { addEventListener: ()=>{} };
  if (!ui.exportCoord) ui.exportCoord = { addEventListener: ()=>{} };
  if (!ui.exportArea) ui.exportArea = { style: { display: 'none' }, value: '', select: ()=>{} };
} catch(e) {}





if(!ui.bonds){ ui.bonds = {checked:false, disabled:true, addEventListener:()=>{}}; }




const STRUCTURES={
  SC:{species:[{type:"M",pos:[0,0,0]}]},
  BCC:{species:[{type:"M",pos:[0,0,0]},{type:"M",pos:[0.5,0.5,0.5]}]},
  FCC:{species:[{type:"M",pos:[0,0,0]},{type:"M",pos:[0,0.5,0.5]},{type:"M",pos:[0.5,0,0.5]},{type:"M",pos:[0.5,0.5,0]}]},
  NaCl:{species:[{type:"A",pos:[0,0,0]},{type:"A",pos:[0,0.5,0.5]},{type:"A",pos:[0.5,0,0.5]},{type:"A",pos:[0.5,0.5,0]},{type:"C",pos:[0.5,0,0]},{type:"C",pos:[0,0.5,0]},{type:"C",pos:[0,0,0.5]},{type:"C",pos:[0.5,0.5,0.5]}]},
  CsCl:{species:[{type:"A",pos:[0,0,0]},{type:"C",pos:[0.5,0.5,0.5]}]},
  ZnS:{species:[{type:"A",pos:[0,0,0]},{type:"A",pos:[0,0.5,0.5]},{type:"A",pos:[0.5,0,0.5]},{type:"A",pos:[0.5,0.5,0]},{type:"C",pos:[0.25,0.25,0.25]},{type:"C",pos:[0.75,0.75,0.25]},{type:"C",pos:[0.75,0.25,0.75]},{type:"C",pos:[0.25,0.75,0.75]}]},
  RUTILIO:(()=>{
    const u=0.305; 
    const metric=[1,1,0.644]; 
    const species=[
      {type:"T",pos:[0.0,0.0,0.0]},           
      {type:"T",pos:[0.5,0.5,0.5]},           
      {type:"O",pos:[ u,  u,  0.0]},          
      {type:"O",pos:[-u, -u,  0.0]},
      {type:"O",pos:[0.5+u, 0.5-u, 0.5]},
      {type:"O",pos:[0.5-u, 0.5+u, 0.5]},
    ];
    return {species, metric};
  })()
  ,
  

  
  TETRA_P:{ species:[{type:"M",pos:[0,0,0]}], metricM: diag3(1,1,1.6) },
  TETRA_I:{ species:[{type:"M",pos:[0,0,0]},{type:"M",pos:[0.5,0.5,0.5]}], metricM: diag3(1,1,1.6) },

  
  ORTHO_P:{ species:[{type:"M",pos:[0,0,0]}], metricM: diag3(1.0,1.25,1.6) },
  ORTHO_I:{ species:[{type:"M",pos:[0,0,0]},{type:"M",pos:[0.5,0.5,0.5]}], metricM: diag3(1.0,1.25,1.6) },
  ORTHO_F:{ species:[{type:"M",pos:[0,0,0]},{type:"M",pos:[0,0.5,0.5]},{type:"M",pos:[0.5,0,0.5]},{type:"M",pos:[0.5,0.5,0]}], metricM: diag3(1.0,1.25,1.6) },
  ORTHO_C:{ species:[{type:"M",pos:[0,0,0]},{type:"M",pos:[0,0.5,0.5]}], metricM: diag3(1.0,1.25,1.6) },

  
  MONO_P:(()=>{ const a=1.0,b=1.2,c=1.6,beta=110;
    return { species:[{type:"M",pos:[0,0,0]}], metricM: cellMatrix(a,b,c, 90,beta,90) };
  })(),
  MONO_C:(()=>{ const a=1.0,b=1.2,c=1.6,beta=110;
    return { species:[{type:"M",pos:[0,0,0]},{type:"M",pos:[0,0.5,0.5]}], metricM: cellMatrix(a,b,c, 90,beta,90) };
  })(),

  
  TRICLINIC_P:(()=>{ const a=1.0,b=1.15,c=1.35,alpha=80,beta=110,gamma=95;
    return { species:[{type:"M",pos:[0,0,0]}], metricM: cellMatrix(a,b,c, alpha,beta,gamma) };
  })(),
  
  HEX_P:(()=>{
    
    const verts = [
      [ 0.5,   0.0,  -0.5], [ 0.5,  0.5,  -0.5], [ 0.0,  0.5,  -0.5],
      [-0.5,   0.0,  -0.5], [-0.5, -0.5,  -0.5], [ 0.0, -0.5,  -0.5],
      [ 0.5,   0.0,   0.5], [ 0.5,  0.5,   0.5], [ 0.0,  0.5,   0.5],
      [-0.5,   0.0,   0.5], [-0.5, -0.5,   0.5], [ 0.0, -0.5,   0.5]
    ];
    const species = verts.map(v=>({type:"M", pos:v}));
    const a=1.0, c=1.6;
    return { species, metricM: cellMatrix(a,a,c, 90,90,120) };
  })(),


  
  TRIGONAL_R:(()=>{ const a=1.0,alpha=70; 
    return { species:[{type:"M",pos:[0,0,0]}], metricM: cellMatrix(a,a,a, alpha,alpha,alpha) };
  })()

};




function refreshAddAtomTypes(){
  if(!ui.addAtomType) return;
  const options = [
    {v:'A', label:'A (Grande, vermelho)'},
    {v:'B', label:'B (Normal, cinza)'},
    {v:'C', label:'C (Pequeno, verde)'}
  ];
  ui.addAtomType.innerHTML = options.map(o=>`<option value="${o.v}">${o.label}</option>`).join('');
}

function addAtomStyleFor(t){
  switch(String(t||'').toUpperCase()){
    case 'A': return { color:'#ef4444', rScale:1.30 }; 
    case 'B': return { color:'#9ca3af', rScale:1.00 }; 
    case 'C': return { color:'#10b981', rScale:0.75 }; 
    default:  return { color:'#9ca3af', rScale:1.00 };
  }
}

const COLORS={
  M:"#9aa3b2", C:"#60a5fa", A:"#ff6b6b", B:"#cfd4dc", V:"#fbbf24",
  T:"#d0d6e1", 
  O:"#ef4444"  
};
function isIonic(k){return (k==="NaCl"||k==="CsCl"||k==="ZnS");}


function buildLattice(k,n){
  if(k==="INTRO" || k==="INTRO2" || k==="INTRO_TETRA"){ return []; }
  const def=STRUCTURES[k]||{};
  const basis=def.species||[], metric=def.metric||[1,1,1];
  const M = def.metricM ? def.metricM : diag3(metric[0],metric[1],metric[2]);
  const atoms=[];
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) for(let l=0;l<n;l++){
    for(const b of basis){
      atoms.push({type:b.type, color:b.color, rScale:(b.rScale??b.rscale), fpos:[(b.pos[0]||0)+i,(b.pos[1]||0)+j,(b.pos[2]||0)+l]});
    }
  }
  
  const center = (n/2) - ((n % 2 === 0) ? 0.5 : 0);
  for(const a of atoms){
    const uc=[a.fpos[0]-center,a.fpos[1]-center,a.fpos[2]-center];
    a.uc = uc;
    a.pos = matMulVec(M, uc);
  }
  return atoms;
}


function buildIntroBase(side){
  const e1=[1,0,0], e2=[0.5, Math.sqrt(3)/2, 0];
  const pts=[];
  for(let r=0;r<side;r++){
    for(let c=0;c<side-r;c++){
      const x = c*e1[0] + r*e2[0];
      const y = c*e1[1] + r*e2[1];
      pts.push([x,y,0]);
    }
  }
  return {pts,e1,e2};
}
function layerShift(frac, e1, e2){ return [(e1[0]+e2[0])*frac, (e1[1]+e2[1])*frac, 0]; }
function layerShiftABC(idx, e1, e2){
  
  const frac = idx===0 ? 0 : (idx===1 ? 1/3 : 2/3);
  return [ (e1[0]+e2[0])*frac, (e1[1]+e2[1])*frac, 0 ];
}

function buildIntroLayers(side, layers, seq){
  const {pts, e1, e2} =buildIntroBase(side);
  const h = Math.sqrt(2/3);
  const gap = 0.02; 
  const atoms=[];
  for(let k=0;k<layers;k++){
    let frac=0, type='A';
    if(seq==="ABC"){
      const m=k%3;
      frac = m/3;
      type = m===0?'A':(m===1?'B':'C');
    }else{
      const m=k%2;
      frac = m===0?0:1/3;
      type = m===0?'A':'B';
    }
    const sh = layerShift(frac, e1, e2);
    for(const p of pts){
      const pos=[p[0]+sh[0], p[1]+sh[1], k*h];
      atoms.push({type, pos, uc:[pos[0],pos[1],pos[2]]});
    }
  }
  let cx=0,cy=0,cz=0;
  for(const a of atoms){cx+=a.pos[0]; cy+=a.pos[1]; cz+=a.pos[2];}
  const n=atoms.length||1; cx/=n; cy/=n; cz/=n;
  for(const a of atoms){ a.pos[0]-=cx; a.pos[1]-=cy; a.pos[2]-=cz; a.uc=[a.pos[0],a.pos[1],a.pos[2]]; }
  return atoms;
}


function buildIntroBaseTriangle(side){
  const e1=[1,0,0], e2=[0.5, Math.sqrt(3)/2, 0];
  const pts=[];
  for(let r=0;r<side;r++){
    for(let c=0;c<side-r;c++){
      const x = c*e1[0] + r*e2[0];
      const y = c*e1[1] + r*e2[1];
      pts.push([x,y,0]);
    }
  }
  return {pts,e1,e2};
}
function introCamadasInit(side){
  const {pts,e1,e2} = buildIntroBaseTriangle(side);
  const cx = (Math.max(...pts.map(p=>p[0])) + Math.min(...pts.map(p=>p[0])))/2;
  const cy = (Math.max(...pts.map(p=>p[1])) + Math.min(...pts.map(p=>p[1])))/2;
  const A = pts.map(p=>({type:'A', pos:[p[0]-cx, p[1]-cy, 0], uc:[p[0]-cx,p[1]-cy,0]}));
  const h = Math.sqrt(2/3);
  const gap = 0.02; 
  const shift=[(e1[0]+e2[0])/3, (e1[1]+e2[1])/3, 0];
  
  
  const key = (x,y)=> (x.toFixed(6)+','+y.toFixed(6));
  const set = new Set(pts.map(p=>key(p[0],p[1])));
  const Btargets = [];
  for (const p of pts){
    const q1x = p[0]+e1[0], q1y = p[1]+e1[1];
    const q2x = p[0]+e2[0], q2y = p[1]+e2[1];
    if (set.has(key(q1x,q1y)) && set.has(key(q2x,q2y))){
      const x = p[0] + (e1[0]+e2[0])/3 - cx;
      const y = p[1] + (e1[1]+e2[1])/3 - cy;
      Btargets.push({type:'B', pos:[x,y,h+gap], uc:[x,y,h+gap]});
    }
  }
  
  const setB = new Set(Btargets.map(t=>key(t.pos[0], t.pos[1])));
  const A3targets = [];
  for (const t of Btargets){
    const qx = t.pos[0], qy = t.pos[1];
    
    if (setB.has(key(qx - e1[0], qy - e1[1])) && setB.has(key(qx - e2[0], qy - e2[1]))){
      const x = qx - (e1[0]+e2[0])/3;
      const y = qy - (e1[1]+e2[1])/3;
      A3targets.push({type:'A', pos:[x,y,2*h+2*gap], uc:[x,y,2*h+2*gap]});
    }
  }
  return {A, Btargets, Bplaced:[], Bfalling:[], A3targets, A3placed:[], A3falling:[], running:false, h, side};
}
function introCamadasComposeAtoms(ic){
  return [
    ...ic.A.map(a=>({type:'A', uc:a.uc.slice(), pos:a.pos.slice()})),
    ...ic.Bplaced.map(b=>({type:'B', uc:b.uc.slice(), pos:b.pos.slice()})),
    ...ic.Bfalling.map(b=>({type:'B', uc:b.uc.slice(), pos:b.pos.slice()})),
    ...(ic.A3placed||[]).map(a=>({type:'A', uc:a.uc.slice(), pos:a.pos.slice()})),
    ...(ic.A3falling||[]).map(a=>({type:'A', uc:a.uc.slice(), pos:a.pos.slice()})),
  ];
}
function introCamadasStart(ic, onDone){
  if(ic.running) return;
  ic.running=true;
  const queue = ic.Btargets.filter(t => !ic.Bplaced.some(p=>p.uc.join(',')===t.uc.join(',')));
  let i=0;
  function dropNext(){
    if(i>=queue.length){ ic.running=false; if(onDone) onDone(); return; }
    const t = queue[i++];
    const startZ = t.pos[2] + 2.0;
    const f = {type:'B', uc:[t.uc[0], t.uc[1], startZ], pos:[t.pos[0], t.pos[1], startZ], target:t, vz:-0.10};
    ic.Bfalling.push(f);
    setTimeout(dropNext, 350);
  }
  dropNext();
}
function introCamadasStartTopA(ic, onDone){
  if(ic.running) return;
  ic.running=true;
  if(!ic.A3targets) { if(onDone){ onDone(); } ic.running=false; return; }
  const queue = ic.A3targets.filter(t => !(ic.A3placed||[]).some(p=>p.uc.join(',')===t.uc.join(',')));
  let i=0;
  function dropNext(){
    if(i>=queue.length){ ic.running=false; if(onDone) onDone(); return; }
    const t = queue[i++];
    const startZ = t.pos[2] + 2.0;
    const f = {type:'A', uc:[t.uc[0], t.uc[1], startZ], pos:[t.pos[0], t.pos[1], startZ], target:t, vz:-0.10};
    ic.A3falling = ic.A3falling || [];
    ic.A3placed  = ic.A3placed  || [];
    ic.A3falling.push(f);
    setTimeout(dropNext, 350);
  }
  dropNext();
}
function introCamadasTick(ic){
  let moving=false;
  
  for(let k=(ic.Bfalling||[]).length-1; k>=0; k--){
    const f=ic.Bfalling[k];
    f.pos[2] += f.vz;
    f.uc[2] = f.pos[2];
    if(f.pos[2] <= f.target.pos[2]){
      f.pos[2] = f.target.pos[2];
      f.uc[2]  = f.target.uc[2];
      ic.Bplaced.push({type:'B', pos:f.pos.slice(), uc:f.uc.slice()});
      ic.Bfalling.splice(k,1);
    } else {
      moving=true;
    }
  }
  
  if(ic.A3falling){
    for(let k=ic.A3falling.length-1; k>=0; k--){
      const f=ic.A3falling[k];
      f.pos[2] += f.vz;
      f.uc[2] = f.pos[2];
      if(f.pos[2] <= f.target.pos[2]){
        f.pos[2] = f.target.pos[2];
        f.uc[2]  = f.target.uc[2];
        ic.A3placed.push({type:'A', pos:f.pos.slice(), uc:f.uc.slice()});
        ic.A3falling.splice(k,1);
      } else {
        moving=true;
      }
    }
  }
  return moving;
}

const state={key:"FCC",n:+ui.cells.value,atoms:[],angleX:0.9,angleY:-0.6,angleZ:0,distance:7,zoom:1,drag:false,last:{x:0,y:0}};

try{ if(state && false ) state.key='HEX_ABC'; }catch(e){}

window.state = state; 
if (state.key==='INTRO') { state.key='FCC'; try{ if(ui && ui.structure) ui.structure.value='FCC'; }catch(e){} }
if(state.key==='INTRO2' || state.key==='INTRO_TETRA') { state.key='FCC'; try{ if(ui && ui.structure) ui.structure.value='FCC'; }catch(e){} }

function rebuild(){
  
  (function(){
    const x = document.getElementById('angleX'); const y = document.getElementById('angleY'); const z = document.getElementById('angleZ');
    const xl = x ? (x.closest('label')||x.parentElement) : null;
    const yl = y ? (y.closest('label')||y.parentElement) : null;
    const zl = z ? (z.closest('label')||z.parentElement) : null;
    if(xl) xl.style.display='';
    if(yl) yl.style.display='';
    if(zl) zl.style.display='';
    const rotGroup = document.querySelector('.row3'); if(rotGroup) rotGroup.style.display='';
  })();

  
  state._introCamadasLocked = false;

  
  if (state.key==='INTRO_CAMADAS') {
    

    state._introCamadasLocked = false;
    
    const rotGroup = document.querySelector('.row3'); if(rotGroup) rotGroup.style.display = '';
    const xInput = document.getElementById('angleX'); const yInput = document.getElementById('angleY'); const zInput = document.getElementById('angleZ');
    const xLabel = xInput ? (xInput.closest('label') || xInput.parentElement) : null;
    const yLabel = yInput ? (yInput.closest('label') || yInput.parentElement) : null;
    const zLabel = zInput ? (zInput.closest('label') || zInput.parentElement) : null;
    if (xLabel) xLabel.style.display = '';
    if (zLabel) zLabel.style.display = '';
    if (yLabel) yLabel.style.display = '';
    

    state.angleX = Math.PI;
    state.angleY = (-180*Math.PI)/180;
    state.angleZ = (-117*Math.PI)/180;
    state.zoom   = 0.55;
    state.distance = 6.6;
    
    
    if (ui.radius) { ui.radius.value = ui.radius.max || 40; }
if (ui.somenteCelula) { ui.somenteCelula.checked = false; ui.somenteCelula.disabled = true; }
    const rotRow = document.getElementById('angleX')?.closest('.row3');
    if (rotRow) rotRow.style.display = '';
    const legend = document.querySelector('.legend');
    if (legend) legend.style.display = 'none';
    const side = +ui.cells.value;
    if (!state.ic || state.ic.side!==side) {
      state.ic = introCamadasInit(side);
    }
    state.atoms = introCamadasComposeAtoms(state.ic);
  }

  try{ ensureRemovedAtomsOutsideUC_Current(); }catch(e){}
 
  
  const isIntro = (state.key==='INTRO2' || state.key==='INTRO_TETRA' || state.key==='INTRO_TESTE' || state.key==='HEX_ABC');
  state.atoms = isIntro ? [] : buildLattice(state.key, +ui.cells.value);

  
  ui.schottky.disabled = !isIonic(state.key);
  ui.frenkel.disabled  = !isIonic(state.key);
  if(!isIonic(state.key)){ ui.schottky.checked=false; ui.frenkel.checked=false; }

  const intro = (state.key==='INTRO2' || state.key==='INTRO_TETRA' || state.key==='INTRO_TESTE');
  const introFixed = (state.key==='INTRO2' || state.key==='INTRO_TETRA'); 

  
  ui.mostrarArestas.disabled = intro;
  ui.apenasUmaFace.disabled = intro;
  ui.seletorFace.disabled = intro || !ui.apenasUmaFace.checked;
  const faceRow = document.getElementById('faceRow');
  if (faceRow) faceRow.style.display = intro ? 'none' : 'flex';

  
  if (ui.introBox) ui.introBox.style.display = intro ? 'block' : 'none';
  
  if (intro && ui.introBox){
    const seq = ui.introSeq ? (ui.introSeq.closest('label') || ui.introSeq.parentElement) : null;
    if (seq) seq.style.display = 'none';
    const lay = ui.introLayers ? (ui.introLayers.closest('label') || ui.introLayers.parentElement) : null;
    if (lay) lay.style.display = 'none';
    const btnRow = document.querySelector('#introBox .btnRow');
    if (btnRow) btnRow.style.display = 'none';
    const wrow = document.getElementById('waterRow');
    if (wrow) wrow.style.display = (state.key==='INTRO_TESTE') ? '' : 'none';
    const erow = document.getElementById('edgesRow');
    if (erow) erow.style.display = (state.key==='INTRO_TESTE') ? '' : 'none';
  }


  if (introFixed) {
    
    state.angleX = Math.PI;                
    state.angleY = (90*Math.PI)/180;       
    state.angleZ = (8*Math.PI)/180;        
    state.zoom   = 0.5;                    
    state.distance = 6.6;                  

    
    if (ui.somenteCelula) { ui.somenteCelula.checked = false; ui.somenteCelula.disabled = true; }

    
    const rotRow = document.getElementById('angleX')?.closest('.row3');
    if (rotRow) rotRow.style.display = '';
    const legend = document.querySelector('.legend');
    if (legend) legend.style.display = 'none';
  } else {
    
    if (ui.somenteCelula) { ui.somenteCelula.disabled = false; ui.somenteCelula.checked = true; }

    
    const rotRow = document.getElementById('angleX')?.closest('.row3');
    if (rotRow) rotRow.style.display = '';
    const legend = document.querySelector('.legend');
    if (legend) legend.style.display = '';
  }

  if (typeof syncAngleSlidersFromState === 'function') syncAngleSlidersFromState();
}
ui.structure.addEventListener('change',()=>{state.key=ui.structure.value;  try{
    if(typeof introState!=='undefined'){
      if(state.key==='INTRO_TETRA'){
        introState.angleX = 0.95; introState.angleY = -0.75; introState.angleZ = 0;
        introState.distance = 3.6; introState.zoom = 0.95;
      } else if(state.key==='INTRO2'){
        introState.angleX = Math.PI; introState.angleY = 16*Math.PI/180; introState.angleZ = 8*Math.PI/180;
        introState.distance = 3.6; introState.zoom = 0.95;
      }
    }
  }catch(e){}
  const erow = document.getElementById('edgesRow');
  if (erow) erow.style.display = (ui.structure.value==='INTRO_TESTE') ? '' : 'none';


const wrow = document.getElementById('waterRow');
if (wrow) wrow.style.display = (ui.structure.value==='INTRO_TESTE') ? '' : 'none';



const addBtn = document.getElementById('addWater');
const clearBtn = document.getElementById('clearWater');
if (!state.water) state.water = [];
if (addBtn) addBtn.onclick = ()=>{
  const n = 120;
  const w=canvas.clientWidth, h=canvas.clientHeight;
  const centerX = w*0.5;
  for(let i=0;i<n;i++){
    state.water.push({ x: centerX + (Math.random()*2 - 1)*120, y: h*0.1 + Math.random()*10, vx: 0, vy: 0.2 + Math.random()*0.2, life: 0 });
}
};
if (clearBtn) clearBtn.onclick = ()=>{ state.water = []; };
 const rowIC = document.getElementById('introCamadasRow'); if(rowIC) rowIC.style.display = (ui.structure.value==='INTRO_CAMADAS') ? '' : 'none'; rebuild();});
ui.apenasUmaFace.addEventListener('change',()=>{ ui.seletorFace.disabled = !ui.apenasUmaFace.checked || ui.apenasUmaFace.disabled; });
ui.seletorFace.addEventListener('change',()=>{});

ui.spacing.addEventListener('input', ()=>{ if(state.key==='INTRO2' || state.key==='INTRO_TETRA') {  } });
ui.cells.addEventListener('input',rebuild);
['radius','spacing','light','mostrarArestas','somenteCelula','bonds','coordpoly','schottky','frenkel','apenasUmaFace','seletorFace'].forEach(id=>{ const control = ui[id]; if (control && typeof control.addEventListener === 'function') control.addEventListener('input',()=>{}); });

ui.schottky.addEventListener('change', ()=>{ draw(); });
ui.frenkel.addEventListener('change', ()=>{ draw(); });


ui.editBonds.addEventListener('change', ()=>{ if(ui.editBonds.checked){ ui.delBonds.checked=false; } state.pickA=null; });
ui.delBonds.addEventListener('change', ()=>{ if(ui.delBonds.checked){ ui.editBonds.checked=false; } state.pickA=null; });
ui.editCoord.addEventListener('change', ()=>{ if(ui.editCoord.checked){ ui.delCoord.checked=false; } state.coordCenterRef=null; });
ui.delCoord.addEventListener('change', ()=>{ if(ui.delCoord.checked){ ui.editCoord.checked=false; } state.coordCenterRef=null; });


function deactivateOtherEditors(except){
  const ids=['editBonds','delBonds','editCoord','delCoord','delAtom','addAtom'];
  for(const id of ids){
    if(ui[id] && id!==except){ ui[id].checked=false; }
  }
  state.pickA=null; state.coordCenterRef=null;
}
if(ui.editBonds) ui.editBonds.addEventListener('change', ()=>{ if(ui.editBonds.checked) deactivateOtherEditors('editBonds'); });
if(ui.delBonds)  ui.delBonds.addEventListener('change',  ()=>{ if(ui.delBonds.checked)  deactivateOtherEditors('delBonds');  });
if(ui.editCoord) ui.editCoord.addEventListener('change', ()=>{ if(ui.editCoord.checked) deactivateOtherEditors('editCoord'); });
if(ui.delCoord)  ui.delCoord.addEventListener('change',  ()=>{ if(ui.delCoord.checked)  deactivateOtherEditors('delCoord');  });
if(ui.delAtom)   ui.delAtom.addEventListener('change',   ()=>{ if(ui.delAtom.checked)   deactivateOtherEditors('delAtom');   });
if(ui.addAtom)  ui.addAtom.addEventListener('change', ()=>{ if(ui.addAtom.checked)  deactivateOtherEditors('addAtom');  });



ui.exportAllTxt.addEventListener('click', ()=>{
  function addedForKey(k){
    try{
      const adds = JSON.parse(localStorage.getItem('custom_atoms_added_v1')||'[]');
      return adds.filter(r=>r.key===k && r.cells===cells);
    }catch(e){ return []; }
  }

  const cells = +ui.cells.value;
  
  const keys = Object.keys(STRUCTURES).filter(k=>!k.startsWith('INTRO'));
  
  const lsBonds  = JSON.parse(localStorage.getItem('custom_bonds_v1') || '[]');
  const lsCoords = JSON.parse(localStorage.getItem('custom_coords_v1') || '[]');
  const embedsB  = Array.isArray(window.EMBEDDED_BONDS)  ? window.EMBEDDED_BONDS  : [];
  const embedsC  = Array.isArray(window.EMBEDDED_COORDS) ? window.EMBEDDED_COORDS : [];
  const removedEmb = JSON.parse(localStorage.getItem('REMOVED_EMBED_BONDS')||'[]');
  const removedIds = new Set(removedEmb.filter(r=>r.cells===cells).map(r=> (r.id || (r.key+'|'+r.cells+'|'+(r.a?.type+'@'+(r.a?.uc||[]).join(','))+'|'+(r.b?.type+'@'+(r.b?.uc||[]).join(',')))) ));

  function bondId(rec){
    const A=`${rec.a.type}@${rec.a.uc.map(v=>(+v).toFixed(5)).join(',')}`;
    const B=`${rec.b.type}@${rec.b.uc.map(v=>(+v).toFixed(5)).join(',')}`;
    return [A,B].sort().join(' | ');
  }
  function bondsForKey(k){
    
    const imb = embedsB.filter(e=>(e.key===k && (+e.cells||cells)===cells));
    const loc = lsBonds.filter(e=>(e.key===k && e.cells===cells));
    const all = [...imb, ...loc];
    return all.filter(b=>!removedIds.has(bondId(b)));
  }
  function coordsForKey(k){
    const imb = embedsC.filter(e=>(e.key===k && (+e.cells||cells)===cells));
    const loc = lsCoords.filter(e=>(e.key===k && e.cells===cells));
    return [...imb, ...loc];
  }

  let out = [];
  for(const k of keys){
    const atomsAll = (typeof buildLattice === 'function' && buildLattice.length>=3)
      ? buildLattice(state, k, cells)    
      : buildLattice(k, cells);

let atoms = atomsAll.slice();
try {
  const _raw = localStorage.getItem(STORAGE_KEY_RM_ATOMS) || localStorage.getItem('custom_atoms_removed_v1') || '[]';
  const _list = JSON.parse(_raw).filter(e => e && e.key === k && e.cells === cells);
  const _rmset = new Set(_list.map(e => atomKeyId(e)));
  const _refOf = (a) => ({ key: k, cells, type: a.type, uc: [ +a.uc[0], +a.uc[1], +a.uc[2] ] });
  atoms = atoms.filter(a => !_rmset.has(atomKeyId(_refOf(a))));
} catch (_e) {
  
}
const atomsUC = atoms.filter(a => inUnitCell(a));
          
    
    out.push(`# ${k}`);
    out.push(`ADDED_ATOMS count=${addedForKey(k).length}`);
    try{
      const def = STRUCTURES[k]||{};
      const metric = def.metric || [1,1,1];
      const M = def.metricM ? def.metricM : diag3(metric[0],metric[1],metric[2]);
      for(const r of addedForKey(k)){
        const pos = matMulVec(M, r.uc);
        out.push(`ADDED_ATOM TYPE=${r.type}  UC(${r.uc.map(v=>(+v).toFixed(6)).join(' ')})  POS(${pos.map(v=>v.toFixed(6)).join(' ')})`);
      }
    }catch(e){ out.push('ADDED_ATOMS_ERROR ' + (e.message||e)); }
    out.push('');

    
    try{
      const removedList = ensureRemovedOutsideForKey(k, cells, 0.02);
      out.push(`REMOVED_ATOMS (fora da UC) count=${removedList.length}`);
      for(const it of removedList){
        out.push(`REMOVED ${it.type}  UC(${it.uc.map(v=>(+v).toFixed(6)).join(' ')})  UC_OUT(${it.uc_out.map(v=>(+v).toFixed(6)).join(' ')})  POS(${it.pos_out.map(v=>v.toFixed(6)).join(' ')})`);
      }

    } catch(e){ out.push('REMOVED_ATOMS_ERROR ' + (e.message||e)); }

    out.push(`ATOMS (unit cell, cells=${cells})  count=${atomsUC.length}`);
    for(const a of atomsUC){
      const p=a.pos||[0,0,0], u=a.uc||[0,0,0];
      out.push(`ATOM ${a.type}  UC(${u.map(v=>(+v).toFixed(6)).join(' ')})  POS(${p[0].toFixed(6)} ${p[1].toFixed(6)} ${p[2].toFixed(6)})`);
    }
    const bonds = bondsForKey(k);
    out.push(`BONDS count=${bonds.length}`);
    for(const b of bonds){
      const A=b.a, C=b.b;
      out.push(`BOND ${A.type} ${A.uc.map(v=>+v).join(',')}  --  ${C.type} ${C.uc.map(v=>+v).join(',')}`);
    }
    const coords = coordsForKey(k);
    out.push(`COORDINATIONS count=${coords.length}`);
    for(const c of coords){
      const C=c.center, N=c.neighbor;
      out.push(`COORD ${C.type} ${C.uc.map(v=>+v).join(',')}  ->  ${N.type} ${N.uc.map(v=>+v).join(',')}`);
    }
    out.push(''); 
  }

  const blob = new Blob([out.join('\\n')], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `estruturas_todas_cells${cells}.txt`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 500);
});


if (ui.introSeq && ui.introSeq.addEventListener) ui.introSeq.addEventListener('change', rebuild);
if (ui.introLayers && ui.introLayers.addEventListener) {
  ui.introLayers.addEventListener('input', ()=>{
    if (ui.introLayersValue) ui.introLayersValue.textContent = ui.introLayers.value;
    rebuild();
  });
}
if (ui.addLayer && ui.addLayer.addEventListener) {
  ui.addLayer.addEventListener('click', ()=>{
    if (!ui.introLayers) return;
    const maxV = Number(ui.introLayers.max || 6);
    const v = Math.min(maxV, (Number(ui.introLayers.value)||0) + 1);
    ui.introLayers.value = v;
    if (ui.introLayersValue) ui.introLayersValue.textContent = v;
    rebuild();
  });
}
if (ui.removeLayer && ui.removeLayer.addEventListener) {
  ui.removeLayer.addEventListener('click', ()=>{
    if (!ui.introLayers) return;
    const minV = Number(ui.introLayers.min || 1);
    const v = Math.max(minV, (Number(ui.introLayers.value)||0) - 1);
    ui.introLayers.value = v;
    if (ui.introLayersValue) ui.introLayersValue.textContent = v;
    rebuild();
  });
}



function deg(v){return Math.round(v)+'°';}
function syncAngleSlidersFromState(){
  ui.angleX.value = Math.round(rad2deg(state.angleX));
  ui.angleY.value = Math.round(rad2deg(state.angleY));
  ui.angleZ.value = Math.round(rad2deg(state.angleZ));
  ui.angleXValue.textContent = deg(ui.angleX.value);
  ui.angleYValue.textContent = deg(ui.angleY.value);
  ui.angleZValue.textContent = deg(ui.angleZ.value);
}
ui.angleX.addEventListener('input', ()=>{ state.angleX = deg2rad(+ui.angleX.value); ui.angleXValue.textContent = deg(ui.angleX.value); });
ui.angleY.addEventListener('input', ()=>{ state.angleY = deg2rad(+ui.angleY.value); ui.angleYValue.textContent = deg(ui.angleY.value); });
ui.angleZ.addEventListener('input', ()=>{ state.angleZ = deg2rad(+ui.angleZ.value); ui.angleZValue.textContent = deg(ui.angleZ.value); });
syncAngleSlidersFromState();

const STORAGE_KEY = 'custom_bonds_v1';


(function(){
  if (!Array.isArray(EMBEDDED_BONDS)) { window.EMBEDDED_BONDS = []; }
  EMBEDDED_BONDS = EMBEDDED_BONDS.concat([

  ]);
})();
 
let ALL_BONDS = [];
try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  ALL_BONDS = [...EMBEDDED_BONDS, ...stored];
} catch(e){ ALL_BONDS = []; }

function saveLocal(){ 
  
  const onlyLocal = ALL_BONDS.filter(x=>!EMBEDDED_BONDS.some(y=>bondId(y)===bondId(x)));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(onlyLocal)); 
}
function bondsForCurrent(){ return ALL_BONDS.filter(x=>x.key===state.key && x.cells===+ui.cells.value); }
function atomRef(a){ return {type:a.type, uc:[+a.uc[0], +a.uc[1], +a.uc[2]], key:state.key, cells:+ui.cells.value}; }
function eqRef(r1,r2){ 
  return r1.type===r2.type && Math.abs(r1.uc[0]-r2.uc[0])<1e-6 && Math.abs(r1.uc[1]-r2.uc[1])<1e-6 && Math.abs(r1.uc[2]-r2.uc[2])<1e-6; 
}
function bondId(rec){ 
  const A=`${rec.a.type}@${rec.a.uc.map(v=>v.toFixed(5)).join(',')}`;
  const B=`${rec.b.type}@${rec.b.uc.map(v=>v.toFixed(5)).join(',')}`;
  return [A,B].sort().join(' | '); 
}




function removeBond(aRef,bRef){
  const rec={key:state.key,cells:+ui.cells.value,a:aRef,b:bRef};
  const id=bondId(rec);
  const before=ALL_BONDS.length;
  ALL_BONDS = ALL_BONDS.filter(x=>!(x.key===state.key && x.cells===+ui.cells.value && bondId(x)===id));
  if(ALL_BONDS.length!==before){ saveLocal(); return; }
  
  markRemovedEmbedBond(state.key, +ui.cells.value, id);
}


function removeCoord(centerRef, neighRef){
  
  const id1 = coordId({center:centerRef, neighbor:neighRef});
  const id2 = coordId({center:neighRef, neighbor:centerRef});
  const before = ALL_COORDS.length;
  ALL_COORDS = ALL_COORDS.filter(x=>!(
    x.key===state.key && x.cells===+ui.cells.value && (coordId(x)===id1 || coordId(x)===id2)
  ));
  if(ALL_COORDS.length!==before){ saveLocalCoord(); }
}
function addBond(aRef,bRef){ 
  const rec={key:state.key,cells:+ui.cells.value,a:aRef,b:bRef}; 
  const id=bondId(rec);
  const exists = bondsForCurrent().some(x=>bondId(x)===id);
  if(!exists){ ALL_BONDS.push(rec); saveLocal(); }
}
function clearBondsCurrent(){ 
  ALL_BONDS = ALL_BONDS.filter(x=>!(x.key===state.key && x.cells===+ui.cells.value)); 
  saveLocal();
  clearRemovedEmbedsFor(state.key, +ui.cells.value); 
}
function findAtomByRef(ref, atomsArr){ 
  let best=null, bestd=1e9;
  for(const a of atomsArr){ 
    if(a.type!==ref.type) continue; 
    const d=Math.hypot(a.uc[0]-ref.uc[0], a.uc[1]-ref.uc[1], a.uc[2]-ref.uc[2]); 
    if(d<bestd){ best=a; bestd=d; } 
  }
  if(bestd<1e-5) return best; 
  return null;
}

state.pickA = null;



if(!window.__CANVAS_CLICK_BOUND__){ window.__CANVAS_CLICK_BOUND__=true;
canvas.addEventListener('click', (e)=>{ if(e && e.stopImmediatePropagation) e.stopImmediatePropagation();
  const rect=canvas.getBoundingClientRect();
  const mx=e.clientX-rect.left, my=e.clientY-rect.top;
  const w=canvas.clientWidth, h=canvas.clientHeight;
  const arr=state.projectedVisible||[];
  let best=null, bestD=Infinity;
  for(const item of arr){
    const dx=item.p.x + w/2 - mx;
    const dy=item.p.y + h/2 - my;
    const d=Math.hypot(dx,dy);
    const r=+ui.radius.value;
    const clickR = Math.max(14, r+6);
    if(d<bestD && d<=clickR){ best=item; bestD=d; }
  }
  

  if(ui.addAtom && ui.addAtom.checked){
    let ucGuess = (best ? atomRef(best).uc.slice() : [0,0,0]);
    try {
      const last = JSON.parse(localStorage.getItem('last_add_uc')||'null');
      if(last && Array.isArray(last) && last.length===3) ucGuess = last;
    } catch(e){}
    const s = prompt('Coordenadas fracionárias UC (x y z):', ucGuess.map(v=>(+v).toFixed(3)).join(' '));
    if(s){
      const parts = s.trim().split(/[,\s]+/).map(Number);
      if(parts.length===3 && parts.every(n=>Number.isFinite(n))){
        localStorage.setItem('last_add_uc', JSON.stringify(parts));
        const typ = (ui.addAtomType && ui.addAtomType.value) || ((STRUCTURES[state.key]?.species?.[0]?.type) || 'X');
        ADD_ATOMS.push({ key:state.key, cells:+ui.cells.value, type:typ, uc:parts });
        saveAddedAtoms();
      }
    }
    return;
  }
  if(!best) return;

  if(ui.addAtom && ui.addAtom.checked){
    
    let ucGuess = best ? atomRef(best).uc.slice() : [0,0,0];
    let s = prompt('Coordenadas fracionárias UC (x y z):', ucGuess.map(v=>v.toFixed(3)).join(' '));
    if(s){
      const parts = s.trim().split(/[,\s]+/).map(Number);
      if(parts.length===3 && parts.every(n=>Number.isFinite(n))){
        const typ = (ui.addAtomType && ui.addAtomType.value) || ((STRUCTURES[state.key]?.species?.[0]?.type) || 'X');
        ADD_ATOMS.push({ key:state.key, cells:+ui.cells.value, type:typ, uc:parts });
        saveAddedAtoms();
      }
    }
    return;
  }

  if(ui.delAtom && ui.delAtom.checked){
    const ref = atomRef(best);
    toggleRemoveAtom(ref); 
    return;
  }

  
if(ui.delBonds && ui.delBonds.checked){
  if(state.pickA===null){
    state.pickA = atomRef(best);
  } else {
    const aRef=state.pickA, bRef=atomRef(best);
    if(!eqRef(aRef,bRef)){ removeBond(aRef,bRef); }
    state.pickA=null;
  }
  return;
}

if(ui.editBonds && ui.editBonds.checked){
  if(state.pickA===null){
    state.pickA = atomRef(best);
  } else {
    const aRef=state.pickA, bRef=atomRef(best);
    if(!eqRef(aRef,bRef)){ addBond(aRef,bRef); }
    state.pickA=null;
  }
  return;
}

if(ui.delCoord && ui.delCoord.checked){
  if(state.coordCenterRef===null){
    state.coordCenterRef = atomRef(best);
  } else {
    const cRef = state.coordCenterRef, nRef = atomRef(best);
    if(!eqRef(cRef,nRef)){ removeCoord(cRef, nRef); }
    
  }
  return;
}
if(ui.editBonds && ui.editBonds.checked){
    if(state.pickA===null){
      state.pickA = atomRef(best);
    } else {
      const aRef=state.pickA, bRef=atomRef(best);
      if(!eqRef(aRef,bRef)){ addBond(aRef,bRef); }
      state.pickA=null;
    }
    return;
  }

  if(ui.editCoord && ui.editCoord.checked){
    if(state.coordCenterRef===null){
      state.coordCenterRef = atomRef(best); 
    } else {
      const cRef = state.coordCenterRef, nRef = atomRef(best);
      if(!eqRef(cRef,nRef)){ toggleCoord(cRef, nRef); }
      
    }
    return;
  }
});
}


ui.clearBonds.addEventListener('click', ()=>{
  clearBondsCurrent();
});
ui.exportarLigacoes.addEventListener('click', ()=>{
  const list=bondsForCurrent();
  const snippet = `// Cole esta linha no topo do <script> deste arquivo.\n`+
                  `// Ela embute as ligações no código (além do localStorage).\n`+
                  `let EMBEDDED_BONDS = ${JSON.stringify(list, null, 2)};`;
  ui.exportArea.style.display='block';
  ui.exportArea.value=snippet;
  ui.exportArea.select();
  document.execCommand('copy');
  setTimeout(()=>{ ui.exportArea.style.display='none'; }, 1200);
});


canvas.addEventListener('mousedown', e=>{ if(state.key==='INTRO2' || state.key==='INTRO_TETRA'){ return; } state.drag=true; state.last.x=e.clientX; state.last.y=e.clientY; });

const STORAGE_KEY_COORD = 'custom_coords_v1';
let EMBEDDED_COORDS = [];
let ALL_COORDS = [];



const STORAGE_KEY_ADD_ATOMS = 'custom_atoms_added_v1';
let ADD_ATOMS = [];
try { ADD_ATOMS = JSON.parse(localStorage.getItem(STORAGE_KEY_ADD_ATOMS) || '[]'); } catch(e){ ADD_ATOMS = []; }
function saveAddedAtoms(){ localStorage.setItem(STORAGE_KEY_ADD_ATOMS, JSON.stringify(ADD_ATOMS)); }
function addedForCurrent(){
  const cells = +ui.cells.value;
  return ADD_ATOMS.filter(r=>r.key===state.key && r.cells===cells);
}
const STORAGE_KEY_RM_ATOMS = 'custom_atoms_removed_v1';
let REMOVED_ATOMS = [];
try { REMOVED_ATOMS = JSON.parse(localStorage.getItem(STORAGE_KEY_RM_ATOMS) || '[]'); } catch(e){ REMOVED_ATOMS=[]; }
function saveRemovedAtoms(){ localStorage.setItem(STORAGE_KEY_RM_ATOMS, JSON.stringify(REMOVED_ATOMS)); }
function atomKeyId(ref){ return `${ref.key}|${ref.cells}|${ref.type}@${ref.uc.map(v=>v.toFixed(5)).join(',')}`; }
function removedSetForCurrent(){
  const set = new Set();
  for(const r of REMOVED_ATOMS){
    if(r.key===state.key && r.cells===+ui.cells.value) set.add(atomKeyId(r));
  }
  return set;
}

function toggleRemoveAtom(ref){
  const id = atomKeyId(ref);
  
  try{
    if(Array.isArray(ADD_ATOMS)){
      const idxAdd = ADD_ATOMS.findIndex(r => 
        r.key===ref.key && r.cells===ref.cells && r.type===ref.type &&
        Array.isArray(r.uc) && Array.isArray(ref.uc) &&
        r.uc.length===3 && ref.uc.length===3 &&
        Math.abs(r.uc[0]-ref.uc[0])<1e-6 && Math.abs(r.uc[1]-ref.uc[1])<1e-6 && Math.abs(r.uc[2]-ref.uc[2])<1e-6
      );
      if(idxAdd>=0){
        ADD_ATOMS.splice(idxAdd,1);
        if(typeof saveAddedAtoms==='function') saveAddedAtoms();
        return; 
      }
    }
  }catch(e){}
  
  const idx = REMOVED_ATOMS.findIndex(r=>atomKeyId(r)===id);
  if(idx>=0){ REMOVED_ATOMS.splice(idx,1); } else { REMOVED_ATOMS.push(ref); }
  saveRemovedAtoms();
}

try {
  const storedC = JSON.parse(localStorage.getItem(STORAGE_KEY_COORD) || '[]');
  ALL_COORDS = [...EMBEDDED_COORDS, ...storedC];
} catch(e){ ALL_COORDS = []; }

function saveLocalCoord(){
  const onlyLocal = ALL_COORDS.filter(x=>!EMBEDDED_COORDS.some(y=>coordId(y)===coordId(x)));
  localStorage.setItem(STORAGE_KEY_COORD, JSON.stringify(onlyLocal));
}
function coordsForCurrent(){ return ALL_COORDS.filter(x=>x.key===state.key && x.cells===+ui.cells.value); }
function coordId(rec){
  const C=`${rec.center.type}@${rec.center.uc.map(v=>v.toFixed(5)).join(',')}`;
  const N=`${rec.neighbor.type}@${rec.neighbor.uc.map(v=>v.toFixed(5)).join(',')}`;
  return C + ' -> ' + N;
}
function toggleCoord(centerRef, neighRef){
  const rec={key:state.key, cells:+ui.cells.value, center:centerRef, neighbor:neighRef};
  const id=coordId(rec);
  const list=coordsForCurrent();
  const idx=list.findIndex(x=>coordId(x)===id);
  if(idx===-1){ ALL_COORDS.push(rec); } else {
    
    const globalIdx = ALL_COORDS.findIndex(x=>coordId(x)===id && x.key===state.key && x.cells===+ui.cells.value);
    if(globalIdx>=0) ALL_COORDS.splice(globalIdx,1);
  }
  saveLocalCoord();
}
function clearCoordsCurrent(){
  ALL_COORDS = ALL_COORDS.filter(x=>!(x.key===state.key && x.cells===+ui.cells.value));
  saveLocalCoord();
}

function syncPolyToCoord(){
  try{
    const hasCoords = coordsForCurrent().length > 0;
    
    ui.coordpoly.checked=false;
  }catch(e){  }
}


ui.editCoord.addEventListener('change', ()=>{ 
});
ui.delCoord.addEventListener('change',  ()=>{ 
});


const _toggleCoord_orig = toggleCoord;
toggleCoord = function(centerRef, neighRef){
  _toggleCoord_orig(centerRef, neighRef);
  
};
const _clearCoordsCurrent_orig = clearCoordsCurrent;
clearCoordsCurrent = function(){
  _clearCoordsCurrent_orig();
  
};



state.coordCenterRef = null;


ui.editBonds.addEventListener('change', ()=>{ if(ui.editBonds.checked){ ui.editCoord.checked=false; state.coordCenterRef=null; } });
ui.editCoord.addEventListener('change', ()=>{ if(ui.editCoord.checked){ ui.editBonds.checked=false; state.pickA=null; } });

ui.clearCoord.addEventListener('click', ()=>{ clearCoordsCurrent(); });
ui.exportCoord.addEventListener('click', ()=>{
  const list=coordsForCurrent();
  const snippet = `// Cole esta linha no topo do <script> deste arquivo.\\n`+
                  `// Ela embute a coordenação no código (além do localStorage).\\n`+
                  `let EMBEDDED_COORDS = ${JSON.stringify(list, null, 2)};`;
  ui.exportArea.style.display='block';
  ui.exportArea.value=snippet;
  ui.exportArea.select();
  document.execCommand('copy');
  setTimeout(()=>{ ui.exportArea.style.display='none'; }, 1200);
});

window.addEventListener('mouseup',()=>state.drag=false);
window.addEventListener('mousemove', e=>{
  if(state.key==='INTRO2' || state.key==='INTRO_TETRA') return;
  if(!state.drag) return;
  const dx=e.clientX-state.last.x, dy=e.clientY-state.last.y;
  state.last.x=e.clientX; state.last.y=e.clientY;
  state.angleY+=dx*0.01;
  state.angleX+=dy*0.01;
  syncAngleSlidersFromState();

const STORAGE_KEY = 'custom_bonds_v1';


(function(){
  if (!Array.isArray(EMBEDDED_BONDS)) { window.EMBEDDED_BONDS = []; }
  EMBEDDED_BONDS = EMBEDDED_BONDS.concat([

  ]);
})();
 
let ALL_BONDS = [];
try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  ALL_BONDS = [...EMBEDDED_BONDS, ...stored];
} catch(e){ ALL_BONDS = []; }

function saveLocal(){ 
  
  const onlyLocal = ALL_BONDS.filter(x=>!EMBEDDED_BONDS.some(y=>bondId(y)===bondId(x)));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(onlyLocal)); 
}
function bondsForCurrent(){ return ALL_BONDS.filter(x=>x.key===state.key && x.cells===+ui.cells.value); }
function atomRef(a){ return {type:a.type, uc:[+a.uc[0], +a.uc[1], +a.uc[2]], key:state.key, cells:+ui.cells.value}; }
function eqRef(r1,r2){ 
  return r1.type===r2.type && Math.abs(r1.uc[0]-r2.uc[0])<1e-6 && Math.abs(r1.uc[1]-r2.uc[1])<1e-6 && Math.abs(r1.uc[2]-r2.uc[2])<1e-6; 
}
function bondId(rec){ 
  const A=`${rec.a.type}@${rec.a.uc.map(v=>v.toFixed(5)).join(',')}`;
  const B=`${rec.b.type}@${rec.b.uc.map(v=>v.toFixed(5)).join(',')}`;
  return [A,B].sort().join(' | '); 
}
function addBond(aRef,bRef){ 
  const rec={key:state.key,cells:+ui.cells.value,a:aRef,b:bRef}; 
  const id=bondId(rec);
  const exists = bondsForCurrent().some(x=>bondId(x)===id);
  if(!exists){ ALL_BONDS.push(rec); saveLocal(); }
}
function clearBondsCurrent(){ 
  ALL_BONDS = ALL_BONDS.filter(x=>!(x.key===state.key && x.cells===+ui.cells.value)); 
  saveLocal(); 
}
function findAtomByRef(ref, atomsArr){ 
  let best=null, bestd=1e9;
  for(const a of atomsArr){ 
    if(a.type!==ref.type) continue; 
    const d=Math.hypot(a.uc[0]-ref.uc[0], a.uc[1]-ref.uc[1], a.uc[2]-ref.uc[2]); 
    if(d<bestd){ best=a; bestd=d; } 
  }
  if(bestd<1e-5) return best; 
  return null;
}

state.pickA = null;



canvas.addEventListener('click', (e)=>{ if(e && e.stopImmediatePropagation) e.stopImmediatePropagation();
  const rect=canvas.getBoundingClientRect();
  const mx=e.clientX-rect.left, my=e.clientY-rect.top;
  const w=canvas.clientWidth, h=canvas.clientHeight;
  const arr=state.projectedVisible||[];
  let best=null, bestD=Infinity;
  for(const item of arr){
    const dx=item.p.x + w/2 - mx;
    const dy=item.p.y + h/2 - my;
    const d=Math.hypot(dx,dy);
    const r=+ui.radius.value;
    const clickR = Math.max(14, r+6);
    if(d<bestD && d<=clickR){ best=item; bestD=d; }
  }
  if(!best) return;

  if(ui.editBonds && ui.editBonds.checked){
    if(state.pickA===null){
      state.pickA = atomRef(best);
    } else {
      const aRef=state.pickA, bRef=atomRef(best);
      if(!eqRef(aRef,bRef)){ addBond(aRef,bRef); }
      state.pickA=null;
    }
    return;
  }

  if(ui.editCoord && ui.editCoord.checked){
    if(state.coordCenterRef===null){
      state.coordCenterRef = atomRef(best); 
    } else {
      const cRef = state.coordCenterRef, nRef = atomRef(best);
      if(!eqRef(cRef,nRef)){ toggleCoord(cRef, nRef); }
      
    }
    return;
  }
});


ui.clearBonds.addEventListener('click', ()=>{
  clearBondsCurrent();
});
ui.exportarLigacoes.addEventListener('click', ()=>{
  const list=bondsForCurrent();
  const snippet = `// Cole esta linha no topo do <script> deste arquivo.\n`+
                  `// Ela embute as ligações no código (além do localStorage).\n`+
                  `let EMBEDDED_BONDS = ${JSON.stringify(list, null, 2)};`;
  ui.exportArea.style.display='block';
  ui.exportArea.value=snippet;
  ui.exportArea.select();
  document.execCommand('copy');
  setTimeout(()=>{ ui.exportArea.style.display='none'; }, 1200);
});

});
window.addEventListener('wheel', e=>{ if(state.key==='INTRO2' || state.key==='INTRO_TETRA'){ e.preventDefault(); return; } e.preventDefault(); state.zoom = clamp(state.zoom*(e.deltaY<0?1.12:0.9),0.5,8.0);},{passive:false});
window.addEventListener('keydown',e=>{
  if(e.key.toLowerCase()==='d'){
    state.angleX=0.9; state.angleY=-0.6; state.angleZ=0; state.zoom=1;
    syncAngleSlidersFromState();

const STORAGE_KEY = 'custom_bonds_v1';


(function(){
  if (!Array.isArray(EMBEDDED_BONDS)) { window.EMBEDDED_BONDS = []; }
  EMBEDDED_BONDS = EMBEDDED_BONDS.concat([

  ]);
})();
 
let ALL_BONDS = [];
try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  ALL_BONDS = [...EMBEDDED_BONDS, ...stored];
} catch(e){ ALL_BONDS = []; }

function saveLocal(){ 
  
  const onlyLocal = ALL_BONDS.filter(x=>!EMBEDDED_BONDS.some(y=>bondId(y)===bondId(x)));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(onlyLocal)); 
}
function bondsForCurrent(){ return ALL_BONDS.filter(x=>x.key===state.key && x.cells===+ui.cells.value); }
function atomRef(a){ return {type:a.type, uc:[+a.uc[0], +a.uc[1], +a.uc[2]], key:state.key, cells:+ui.cells.value}; }
function eqRef(r1,r2){ 
  return r1.type===r2.type && Math.abs(r1.uc[0]-r2.uc[0])<1e-6 && Math.abs(r1.uc[1]-r2.uc[1])<1e-6 && Math.abs(r1.uc[2]-r2.uc[2])<1e-6; 
}
function bondId(rec){ 
  const A=`${rec.a.type}@${rec.a.uc.map(v=>v.toFixed(5)).join(',')}`;
  const B=`${rec.b.type}@${rec.b.uc.map(v=>v.toFixed(5)).join(',')}`;
  return [A,B].sort().join(' | '); 
}
function addBond(aRef,bRef){ 
  const rec={key:state.key,cells:+ui.cells.value,a:aRef,b:bRef}; 
  const id=bondId(rec);
  const exists = bondsForCurrent().some(x=>bondId(x)===id);
  if(!exists){ ALL_BONDS.push(rec); saveLocal(); }
}
function clearBondsCurrent(){ 
  ALL_BONDS = ALL_BONDS.filter(x=>!(x.key===state.key && x.cells===+ui.cells.value)); 
  saveLocal(); 
}
function findAtomByRef(ref, atomsArr){ 
  let best=null, bestd=1e9;
  for(const a of atomsArr){ 
    if(a.type!==ref.type) continue; 
    const d=Math.hypot(a.uc[0]-ref.uc[0], a.uc[1]-ref.uc[1], a.uc[2]-ref.uc[2]); 
    if(d<bestd){ best=a; bestd=d; } 
  }
  if(bestd<1e-5) return best; 
  return null;
}

state.pickA = null;



canvas.addEventListener('click', (e)=>{ if(e && e.stopImmediatePropagation) e.stopImmediatePropagation();
  const rect=canvas.getBoundingClientRect();
  const mx=e.clientX-rect.left, my=e.clientY-rect.top;
  const w=canvas.clientWidth, h=canvas.clientHeight;
  const arr=state.projectedVisible||[];
  let best=null, bestD=Infinity;
  for(const item of arr){
    const dx=item.p.x + w/2 - mx;
    const dy=item.p.y + h/2 - my;
    const d=Math.hypot(dx,dy);
    const r=+ui.radius.value;
    const clickR = Math.max(14, r+6);
    if(d<bestD && d<=clickR){ best=item; bestD=d; }
  }
  if(!best) return;

  if(ui.editBonds && ui.editBonds.checked){
    if(state.pickA===null){
      state.pickA = atomRef(best);
    } else {
      const aRef=state.pickA, bRef=atomRef(best);
      if(!eqRef(aRef,bRef)){ addBond(aRef,bRef); }
      state.pickA=null;
    }
    return;
  }

  if(ui.editCoord && ui.editCoord.checked){
    if(state.coordCenterRef===null){
      state.coordCenterRef = atomRef(best); 
    } else {
      const cRef = state.coordCenterRef, nRef = atomRef(best);
      if(!eqRef(cRef,nRef)){ toggleCoord(cRef, nRef); }
      
    }
    return;
  }
});


ui.clearBonds.addEventListener('click', ()=>{
  clearBondsCurrent();
});
ui.exportarLigacoes.addEventListener('click', ()=>{
  const list=bondsForCurrent();
  const snippet = `// Cole esta linha no topo do <script> deste arquivo.\n`+
                  `// Ela embute as ligações no código (além do localStorage).\n`+
                  `let EMBEDDED_BONDS = ${JSON.stringify(list, null, 2)};`;
  ui.exportArea.style.display='block';
  ui.exportArea.value=snippet;
  ui.exportArea.select();
  document.execCommand('copy');
  setTimeout(()=>{ ui.exportArea.style.display='none'; }, 1200);
});

  }
});


function shellsByDistance(target, atoms, maxShells=3){
  
  const arr=[];
  for(const a of atoms){
    if(a===target) continue;
    const dx=a.pos[0]-target.pos[0], dy=a.pos[1]-target.pos[1], dz=a.pos[2]-target.pos[2];
    const d=Math.hypot(dx,dy,dz);
    if(d>1e-6) arr.push({a, d});
  }
  arr.sort((p,q)=>p.d-q.d);
  const shells=[]; let current=[]; let base=null;
  const tol=0.10; 
  for(const item of arr){
    if(base===null){ base=item.d; current=[item]; }
    else if(Math.abs(item.d-base)/base <= tol){ current.push(item); }
    else{
      shells.push(current.map(e=>e.a));
      if(shells.length>=maxShells) break;
      base=item.d; current=[item];
    }
  }
  if(current.length && shells.length<maxShells) shells.push(current.map(e=>e.a));
  return shells;
}


function project(p3, L){
  let p = rotY(p3, state.angleY);
  p = rotX(p, state.angleX);
  p = rotZ(p, state.angleZ);
  const z = p[2] + state.distance;
  if (ui.projecaoOrto && ui.projecaoOrto.checked) {
    
    return { x: p[0]*L*state.zoom, y: p[1]*L*state.zoom, z, s: 1 };
  } else {
    const fov = 3.5, s = fov/(fov+z);
    return { x: p[0]*L*state.zoom*s, y: p[1]*L*state.zoom*s, z, s };
  }



function checkStericOverlap(circles){
  if(!Array.isArray(circles) || circles.length<2) return false;
  for(let i=0;i<circles.length;i++){
    const a = circles[i];
    for(let j=i+1;j<circles.length;j++){
      const b = circles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx*dx + dy*dy;
      const R = a.r + b.r - 0.5; 
      if(d2 < R*R) return true;
    }



state.steric = false;
function updateStericAlert(flag){
  state.steric = !!flag;
  try{
    const el = document.getElementById('alertaEsterico');
    if(el) el.style.display = state.steric ? 'block' : 'none';
  }catch(e){}
}
function drawStericOverlay(){
  if(!state.steric) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const msg = 'Alerta! Estrutura improvável com alta repulsão estérica.';
  ctx.save();
  ctx.translate(0,0);
  ctx.font = '600 14px system-ui, -apple-system, Segoe UI, Roboto';
  const m = ctx.measureText(msg);
  const padX = 16, padY = 8;
  const bx = (w - m.width)/2 - padX, by = h - 40 - padY;
  ctx.fillStyle = 'rgba(239,68,68,0.85)';
  ctx.fillRect(bx, by, m.width + padX*2, 26 + padY*2);
  ctx.strokeStyle = 'rgba(248,113,113,0.9)';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, m.width + padX*2, 26 + padY*2);
  ctx.fillStyle = '#fff';
  ctx.fillText(msg, (w - m.width)/2, by + 26);
  ctx.restore();
}

  }
  return false;
}

}



function __hexP_inUnitCell_fromFrac(x, y, z, eps){
  const inHex = Math.abs(x) <= 0.5 + eps && Math.abs(y) <= 0.5 + eps && Math.abs(x + y) <= 0.5 + eps;
  return inHex && z >= -0.5 - eps && z <= 0.5 + eps;
}
function inUnitCell(a){
  const eps = 1e-6;
  
  const x = (a.uc && a.uc[0]!==undefined) ? a.uc[0] : (a.x_uc ?? a.x ?? 0);
  const y = (a.uc && a.uc[1]!==undefined) ? a.uc[1] : (a.y_uc ?? a.y ?? 0);
  const z = (a.uc && a.uc[2]!==undefined) ? a.uc[2] : (a.z_uc ?? a.z ?? 0);
  const isHex = (window.state && (state.key==='DIY' && window.stateDIY && stateDIY.format==='hexagonal'));
  if (isHex) return __hexP_inUnitCell_fromFrac(x,y,z,eps);
  return (x>=-0.5-eps && x<=0.5+eps && y>=-0.5-eps && y<=0.5+eps && z>=-0.5-eps && z<=0.5+eps);
}
function inUnitCellUC(uc){
  const eps = 1e-6;
  const x=uc[0], y=uc[1], z=uc[2];
  const isHex = (window.state && (state.key==='DIY' && window.stateDIY && stateDIY.format==='hexagonal'));
  if (isHex) return __hexP_inUnitCell_fromFrac(x,y,z,eps);
  return (x>=-0.5-eps && x<=0.5+eps && y>=-0.5-eps && y<=0.5+eps && z>=-0.5-eps && z<=0.5+eps);
}


function inFace(a, which){
  const eps=1e-6;
  const x=a.uc[0], y=a.uc[1], z=a.uc[2];
  switch(which){
    case "+X": return Math.abs(x-0.5)<=eps;
    case "-X": return Math.abs(x+0.5)<=eps;
    case "+Y": return Math.abs(y-0.5)<=eps;
    case "-Y": return Math.abs(y+0.5)<=eps;
    case "+Z": return Math.abs(z-0.5)<=eps;
    case "-Z": return Math.abs(z+0.5)<=eps;
    default: return true;
  }
}



function metricOf(key){ const def=STRUCTURES[key]||{}; if(def.metricM) return def.metricM; const v=(def.metric||[1,1,1]); return diag3(v[0],v[1],v[2]); }


function inFaceUC(uc, which){
  const eps=1e-6;
  const x=uc[0], y=uc[1], z=uc[2];
  switch(which){
    case "+X": return Math.abs(x-0.5)<=eps;
    case "-X": return Math.abs(x+0.5)<=eps;
    case "+Y": return Math.abs(y-0.5)<=eps;
    case "-Y": return Math.abs(y+0.5)<=eps;
    case "+Z": return Math.abs(z-0.5)<=eps;
    case "-Z": return Math.abs(z+0.5)<=eps;
    default: return true;
  }
}


function firstShellNeighborsPBC(target, atomsAll, metricM, opts){
  const tol=0.10; 
  const candidates=[];
  const ux = target.uc[0], uy = target.uc[1], uz = target.uc[2];
  for(const b of atomsAll){
    if(b===target) continue;
    let best=null;
    for(let dx=-1; dx<=1; dx++){
      for(let dy=-1; dy<=1; dy++){
        for(let dz=-1; dz<=1; dz++){
          const ucw=[b.uc[0]+dx, b.uc[1]+dy, b.uc[2]+dz];
          if(opts.somenteCelula && !inUnitCellUC(ucw)) continue;
          if(opts.apenasUmaFace && !inFaceUC(ucw, opts.faceSel)) continue;
          const delta=[ucw[0]-ux, ucw[1]-uy, ucw[2]-uz];
          const dd = matMulVec(metricM, delta);
          const d=Math.hypot(dd[0],dd[1],dd[2]);
          if(d<=1e-6) continue;
          if(!best || d<best.d) best={d, ucw};
        }
      }
    }
    if(best){
      const real = matMulVec(metricM, best.ucw);
      candidates.push({ b, d:best.d, ucw:best.ucw, pos:real });
    }
  }
  
  candidates.sort((p,q)=>p.d-q.d);
  const first=[];
  if(candidates.length){
    const base=candidates[0].d;
    for(const c of candidates){
      if(Math.abs(c.d-base)/base <= tol) first.push(c);
      else break;
    }
  }
  return first; 
}
function rutileNeighbors(target, atomsAll, metricM, opts){
  const ux = target.uc[0], uy = target.uc[1], uz = target.uc[2];
  const wantType = (target.type==="O") ? "T" : "O";
  const need = (target.type==="O") ? 3 : 6;
  const candidates=[];
  for(const b of atomsAll){
    if(b===target) continue;
    if(b.type!==wantType) continue;
    let best=null;
    for(let dx=-1; dx<=1; dx++){
      for(let dy=-1; dy<=1; dy++){
        for(let dz=-1; dz<=1; dz++){
          const ucw=[b.uc[0]+dx, b.uc[1]+dy, b.uc[2]+dz];
          if(opts.somenteCelula && !inUnitCellUC(ucw)) continue;
          if(opts.apenasUmaFace && !inFaceUC(ucw, opts.faceSel)) continue;
          const delta=[ucw[0]-ux, ucw[1]-uy, ucw[2]-uz];
          const dd = matMulVec(metricM, delta);
          const d=Math.hypot(dd[0],dd[1],dd[2]);
          if(d<=1e-6) continue;
          if(!best || d<best.d) best={d, ucw};
        }
      }
    }
    if(best){
      const real = matMulVec(metricM, best.ucw);
      candidates.push({ b, d:best.d, ucw:best.ucw, pos:real });
    }
  }
  candidates.sort((p,q)=>p.d-q.d);
  return candidates.slice(0, need);
}

function drawAxes(L){
  const axes = [
    {to:[1.2,0,0], color:"#ef4444", label:"X"},
    {to:[0,1.2,0], color:"#22c55e", label:"Y"},
    {to:[0,0,1.2], color:"#3b82f6", label:"Z"},
  ];
  const originProj = project([0,0,0], L);
  for(const ax of axes){
    const p2 = project(ax.to, L);
    ctx.lineWidth=2;
    ctx.strokeStyle=ax.color;
    ctx.beginPath();
    ctx.moveTo(originProj.x+canvas.clientWidth/2, originProj.y+canvas.clientHeight/2);
    ctx.lineTo(p2.x+canvas.clientWidth/2, p2.y+canvas.clientHeight/2);
    ctx.stroke();
    const dir=[p2.x-originProj.x, p2.y-originProj.y];
    const len=Math.hypot(dir[0],dir[1])||1;
    const ux=dir[0]/len, uy=dir[1]/len;
    const ax1=[p2.x-ux*10 - uy*6, p2.y-uy*10 + ux*6];
    const ax2=[p2.x-ux*10 + uy*6, p2.y-uy*10 - ux*6];
    ctx.beginPath();
    ctx.moveTo(p2.x+canvas.clientWidth/2, p2.y+canvas.clientHeight/2);
    ctx.lineTo(ax1[0]+canvas.clientWidth/2, ax1[1]+canvas.clientHeight/2);
    ctx.lineTo(ax2[0]+canvas.clientWidth/2, ax2[1]+canvas.clientHeight/2);
    ctx.closePath();
    ctx.fillStyle=ax.color;
    ctx.fill();
    ctx.fillStyle=ax.color;
    ctx.font="12px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText(ax.label, p2.x+canvas.clientWidth/2 + 6, p2.y+canvas.clientHeight/2 + 4);
  }
}





function drawIntroStoryboard(){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  ctx.clearRect(0,0,w,h);

  const spacing=+ui.spacing.value; let radius = (ui.radius && +ui.radius.value) || (window._radiusDefault || 12);

  
  const side = +ui.cells.value;
  const {pts, e1, e2} = buildIntroBase(side);
  const hZ = Math.sqrt(2/3);

  function makeLayer(type, fracShift, k){
    const sh = layerShift(fracShift, e1, e2);
    const z = k*hZ;
    return pts.map(p => {
      const pos=[p[0]+sh[0], p[1]+sh[1], z];
      return {type, pos, uc:[...pos]};
    });
  }

  
  const A = makeLayer('A', 0, 0);
  const B = makeLayer('B', 1/3, 1);
  const C = makeLayer('C', 2/3, 2);
  const A2 = makeLayer('A', 0, 2); 

  function centerAtoms(arr){
    let cx=0,cy=0,cz=0;
    for(const a of arr){ cx+=a.pos[0]; cy+=a.pos[1]; cz+=a.pos[2]; }
    if(!arr.length){ return; }
    cx/=arr.length; cy/=arr.length; cz/=arr.length;
    for(const a of arr){ a.pos[0]-=cx; a.pos[1]-=cy; a.pos[2]-=cz; a.uc=[...a.pos]; }
  }

  const groupA   = [...A];                centerAtoms(groupA);
  const groupAB  = [...A, ...B];          centerAtoms(groupAB);
  const groupABC = [...A, ...B, ...C];    centerAtoms(groupABC);
  const groupABA = [...A, ...B, ...A2];   centerAtoms(groupABA);

  function drawGroup(atoms, cx, cy, labelLines){
    const L = spacing * 0.95;
    const projected = atoms.map(a=>{
      const p=project(a.pos, L);
      return {...a, p:{x:p.x+cx, y:p.y+cy, z:p.z}};
    }).sort((A,B)=>A.p.z-B.p.z);

    for(const a of projected){
      let r = (typeof a.r==='number' && !Number.isNaN(a.r) && a.r>0) ? a.r : (radius * (a.rScale ? (+a.rScale) : 1));
      ctx.beginPath(); ctx.arc(a.p.x, a.p.y, r+2, 0, TAU); ctx.fillStyle="rgba(0,0,0,0.45)"; ctx.fill();
      ctx.beginPath(); ctx.arc(a.p.x, a.p.y, r, 0, TAU); ctx.fillStyle=(a.color || COLORS[a.type] || "#fff"); ctx.fill();
      const r2=Math.max(2, r*0.45);
      ctx.beginPath(); ctx.arc(a.p.x - r*0.35, a.p.y - r*0.35, r2, 0, TAU); ctx.fillStyle="rgba(255,255,255,0.35)"; ctx.fill();
    }

    
    ctx.fillStyle="#cbd5e1";
    ctx.font="12px system-ui, -apple-system, Segoe UI, Roboto";
    let y = cy + radius*4.2 + 12;
    for(const line of labelLines){
      const metrics = ctx.measureText(line);
      ctx.fillText(line, cx - metrics.width/2, y);
      y += 14;
    }
  }

  function arrow(fromX, fromY, toX, toY){
    ctx.strokeStyle="rgba(229,231,235,0.8)";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    const dx=toX-fromX, dy=toY-fromY;
    const len=Math.hypot(dx,dy)||1;
    const ux=dx/len, uy=dy/len;
    const ax=toX-ux*10, ay=toY-uy*10;
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(ax - uy*6, ay + ux*6);
    ctx.lineTo(ax + uy*6, ay - ux*6);
    ctx.closePath();
    ctx.fillStyle="rgba(229,231,235,0.8)";
    ctx.fill();
  }

  
  function drawBuracos(A, B, cx, cy){
    const spacing = +ui.spacing.value;
    let radius = (ui.radius && +ui.radius.value) || (window._radiusDefault || 12);
    const L = spacing * 0.95;
    
    const PA = A.map(a=>{ const p=project(a.pos, L); return {...a, p:{x:p.x+cx, y:p.y+cy, z:p.z}}; });
    const PB = B.map(a=>{ const p=project(a.pos, L); return {...a, p:{x:p.x+cx, y:p.y+cy, z:p.z}}; });

    
    const rSmall = radius*0.72;
    for(const a of PA){ drawSphere(a.p.x, a.p.y, rSmall, '#ef4444'); }
    for(const b of PB){ drawSphere(b.p.x, b.p.y, rSmall, '#cfd4dc'); }

    
    function drawNeighborLines(P){
      for(let i=0;i<P.length;i++){
        for(let j=i+1;j<P.length;j++){
          const d = Math.hypot(P[i].pos[0]-P[j].pos[0], P[i].pos[1]-P[j].pos[1], P[i].pos[2]-P[j].pos[2]);
          if(d < 1.05){ 
            ctx.strokeStyle = 'rgba(229,231,235,0.65)';
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(P[i].p.x, P[i].p.y);
            ctx.lineTo(P[j].p.x, P[j].p.y);
            ctx.stroke();
          }
        }
      }
    }
    drawNeighborLines(PA);
    drawNeighborLines(PB);

    
    for(const a of PA){
      
      let best=null, bestD=1e9;
      for(const b of PB){
        const d = Math.hypot(a.pos[0]-b.pos[0], a.pos[1]-b.pos[1], a.pos[2]-b.pos[2]);
        if(d<bestD){ best=b; bestD=d; }
      }
      if(best && bestD<1.0){
        ctx.strokeStyle = 'rgba(229,231,235,0.75)';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(a.p.x, a.p.y);
        ctx.lineTo(best.p.x, best.p.y);
        ctx.stroke();
      }
    }

    
    function centroid(pts){ 
      const n=pts.length||1; 
      return pts.reduce((acc,p)=>[acc[0]+p.pos[0],acc[1]+p.pos[1],acc[2]+p.pos[2]],[0,0,0]).map(v=>v/n);
    }
    function nearestN(P, n){
      
      const sorted = P.slice().sort((u,v)=> (u.pos[0]**2+u.pos[1]**2+u.pos[2]**2) - (v.pos[0]**2+v.pos[1]**2+v.pos[2]**2));
      return sorted.slice(0,n);
    }
    const triA = nearestN(PA,3);
    const triB = nearestN(PB,3);
    const cA = centroid(triA);
    const cB = centroid(triB);
    const centerTetra = [(cA[0]*3 + cB[0])/4, (cA[1]*3 + cB[1])/4, (cA[2]*3 + cB[2])/4]; 
    const centerOct  = [(cA[0]+cB[0])/2, (cA[1]+cB[1])/2, (cA[2]+cB[2])/2];

    function proj(pt){ const p=project(pt, L); return {x:p.x+cx, y:p.y+cy}; }
    const pT = proj(centerTetra);
    const pO = proj(centerOct);

    
    function drawMarker(p){
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI*2);
      ctx.fillStyle = 'rgb(229,231,235)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(229,231,235,0.9)';
      ctx.stroke();
    }
    drawMarker(pT);
    drawMarker(pO);

    
}


  
  const Apos   = {x: w*0.22, y: h*0.62};
  const ABpos  = {x: w*0.50, y: h*0.62};
  const ABCpos = {x: w*0.78, y: h*0.32};
  const ABApos = {x: w*0.78, y: h*0.78};

  drawGroup(groupA,   Apos.x,   Apos.y,   ["Camada A (esferas vermelhas)"]);
  drawGroup(groupAB,  ABpos.x,  ABpos.y,  ["Camada A (esferas vermelhas)", "Camada B (esferas cinza)"]);
  drawGroup(groupABC, ABCpos.x, ABCpos.y, ["Camada A (vermelhas)","Camada B (cinza)","Camada C (azuis)"]);
  drawGroup(groupABA, ABApos.x, ABApos.y, ["Camada A (vermelhas)","Camada B (cinza)","Camada A (vermelhas)"]);

  
  arrow(Apos.x + spacing*0.9, Apos.y - spacing*0.1, ABpos.x - spacing*0.9, ABpos.y - spacing*0.1);
  arrow(ABpos.x + spacing*0.9, ABpos.y - spacing*0.35, ABCpos.x - spacing*0.8, ABCpos.y + spacing*0.3);
  arrow(ABpos.x + spacing*0.9, ABpos.y + spacing*0.35, ABApos.x - spacing*0.8, ABApos.y - spacing*0.3);

  
  ctx.fillStyle="#9ca3af";
  ctx.font="12px system-ui, -apple-system, Segoe UI, Roboto";
  const txt = "";
  const m = ctx.measureText(txt);
  ctx.fillText(txt, (Apos.x+ABpos.x)/2 - m.width/2, Apos.y - spacing*0.9);
}






function drawIntroCamadas(){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  ctx.clearRect(0,0,w,h);

  
  const spacing = +ui.spacing.value;
  const baseR = (ui.radius && +ui.radius.value) || (window._radiusDefault || 12);
  const Acolor = 'rgb(239,68,68)';      
  const Bcolor = 'rgb(243,244,246)';    
  const outline = 'rgba(255,255,255,0.10)';

  
  function glossy(p, r, color){
    const R = r * (p.s ? p.s : 1);
    
    function parseRGB(col){
      const m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(col);
      if(!m) return [255,255,255];
      return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
    }
    function toRGB(arr){ return 'rgb(' + arr.map(v=>Math.max(0,Math.min(255,Math.round(v)))).join(',') + ')'; }
    function darken([r,g,b], k){ return [r*(1-k), g*(1-k), b*(1-k)]; }

    const base = parseRGB(color);
    const rim  = toRGB(darken(base, 0.35)); 

    const g = ctx.createRadialGradient(p.x-R*0.35, p.y-R*0.35, R*0.2, p.x, p.y, R);
    g.addColorStop(0, color);
    g.addColorStop(1, rim);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, TAU); ctx.fill();
    const hR = Math.max(2, R*0.28);
    const hgl = ctx.createRadialGradient(p.x-R*0.45, p.y-R*0.45, 1, p.x-R*0.45, p.y-R*0.45, hR);
    hgl.addColorStop(0,'rgba(255,255,255,0.85)');
    hgl.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = hgl; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, TAU); ctx.fill();
    ctx.strokeStyle = outline; ctx.lineWidth=1; ctx.stroke();
  }

  
  if(!state.ic){ state.ic = introCamadasInit(+ui.cells.value||4); }
  const atoms = introCamadasComposeAtoms(state.ic);

  
  const proj = atoms.map(a=>{ const pp = project(a.pos, spacing); return {type:a.type, p:pp}; })
                    .sort((A,B)=>A.p.z - B.p.z);

  
  const offX = w*0.5, offY = h*0.6;

  
  for(const it of proj){
    const p = {x: it.p.x+offX, y: it.p.y+offY, s: (ui.projecaoOrto && ui.projecaoOrto.checked) ? 1 : it.p.s};
    const r = (it.type==='B'? baseR*0.92 : baseR);
    glossy(p, r, it.type==='B'? Bcolor : Acolor);
  }
}
function drawIntroTeste(){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const hideEdges = (document.getElementById('introHideEdges')?.checked === true);
  const spacing=+ui.spacing.value; let radius = (ui.radius && +ui.radius.value) || (window._radiusDefault || 12);

  const center = {x: w*0.5, y: h*0.62};

  
  const L = spacing*1.15;
  const r = radius*0.9;
  const layers = 5;

  
  const grid = [];
  for(let k=0;k<layers;k++){
    for(let i=-1;i<=1;i++){
      for(let j=-1;j<=1;j++){
        grid.push({pos:[i, j, k*0.9], layer:k});
      }
    }
  }

  function projectAt(p3, L, off){
    const p=project(p3, L);
    return {x:p.x+off.x, y:p.y+off.y, z:p.z, s:p.s};
  }
  function rotate2D(p, cx, cy, ang){
    const s=Math.sin(ang), c=Math.cos(ang);
    const x=p.x-cx, y=p.y-cy;
    return {x:x*c-y*s+cx, y:x*s+y*c+cy, z:p.z, s:p.s};
  }

  const theta = -Math.PI/6;
  const P = grid.map(a=>({pos:a.pos, p: projectAt(a.pos, L, center)}));
  for(const a of P){ a.p = rotate2D(a.p, center.x, center.y, theta); }



function paint(p, rr, col){
    const scale = (ui.projecaoOrto && ui.projecaoOrto.checked) ? (state.zoom||1) : (p.s||1);
    const R = rr * scale;
    ctx.beginPath(); ctx.arc(p.x, p.y, R+2, 0, Math.PI*2); ctx.fillStyle="rgba(0,0,0,0.45)"; ctx.fill();
    ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI*2); ctx.fillStyle=col; ctx.fill();
    const r2=Math.max(2, R*0.45);
    ctx.beginPath(); ctx.arc(p.x - R*0.35, p.y - R*0.35, r2, 0, Math.PI*2);
    ctx.fillStyle="rgba(255,255,255,0.45)"; ctx.fill();
  }

const drawSpheresLater = true;

  
  function neighbors(i,j,k){
    const list=[];
    const cand=[[i+1,j,k],[i-1,j,k],[i,j+1,k],[i,j-1,k]];
    for(const [u,v,wz] of cand){
      if(Math.abs(u)<=1 && Math.abs(v)<=1 && wz===k) list.push([u,v,wz]);
    }
    return list;
  }
  if(!hideEdges){
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = 'rgba(229,231,235,0.65)';
    for(let k=0;k<layers;k++){
    for(let i=-1;i<=1;i++){
      for(let j=-1;j<=1;j++){
        const a = P.find(q=> q.pos[0]===i && q.pos[1]===j && q.pos[2]===k*0.9);
        for(const [u,v,wz] of neighbors(i,j,k)){
          const b = P.find(q=> q.pos[0]===u && q.pos[1]===v && q.pos[2]===wz*0.9);
          ctx.beginPath();
          ctx.moveTo(a.p.x, a.p.y);
          ctx.lineTo(b.p.x, b.p.y);
          ctx.stroke();
        }
      }
    }
  }


  }


  const holes=[];
  for(let i=-1;i<1;i++){
    for(let j=-1;j<1;j++){
      const cx = i+0.5, cy = j+0.5, cz = 0.45;
      let P2 = projectAt([cx,cy,cz], L, center);
      P2 = rotate2D(P2, center.x, center.y, theta);
      holes.push(P2);
    }
  }

  

if (!state.water) state.water = [];
const dr = Math.max(2, r*0.22); 
for(const g of state.water){
  
  g.vy += 0.35;
  g.y  += g.vy;
  g.x  += (g.vx||0);

  
  let best=null, bestd=1e9;
  for(const h2 of holes){
    const d = Math.abs(g.x - h2.x);
    if(d<bestd){bestd=d; best=h2;}
  }
  if(best){
    const ax = (best.x - g.x)*0.02;
    g.vx = (g.vx||0) + ax;
  }

  
  for(const a of P){
    const dx = g.x - a.p.x, dy = g.y - a.p.y;
    const rr = r + dr;
    const d2 = dx*dx + dy*dy;
    if (d2 < rr*rr){
      const d = Math.sqrt(Math.max(d2, 1e-6));
      const nx = dx/d, ny = dy/d;
      
      const overlap = rr - d + 0.5;
      g.x += nx * overlap;
      g.y += ny * overlap;
      
      const vx = g.vx||0, vy = g.vy;
      const vdotn = vx*nx + vy*ny;
      g.vx = vx - (1.7*vdotn)*nx;
      g.vy = vy - (1.7*vdotn)*ny;
      
      g.vx *= 0.75;
      g.vy *= 0.75;
    }
  }
  g.life += 1;
}
state.water = state.water.filter(g => g.y < h*0.95 && g.life < 2000);



  ctx.fillStyle = 'rgb(59,130,246)';
  for(const g of state.water){
    ctx.beginPath();
    ctx.arc(g.x, g.y, Math.max(2, r*0.22), 0, Math.PI*2);
    
  ctx.fill();
}


for(const a of P){ paint(a.p, r, '#ef4444'); }


if(!hideEdges){
ctx.lineWidth = 1.1;
ctx.strokeStyle = 'rgba(229,231,235,0.65)';
for(let k=0;k<layers;k++){
  for(let i=-1;i<=1;i++){
    for(let j=-1;j<=1;j++){
      const a = P.find(q=> q.pos[0]===i && q.pos[1]===j && q.pos[2]===k*0.9);
      for(const [u,v,wz] of neighbors(i,j,k)){
        const b = P.find(q=> q.pos[0]===u && q.pos[1]===v && q.pos[2]===wz*0.9);
        ctx.beginPath();
        ctx.moveTo(a.p.x, a.p.y);
        ctx.lineTo(b.p.x, b.p.y);
        ctx.stroke();
      }
}
    }
  }
}


  ctx.fillStyle='#334155';
  ctx.font='600 14px system-ui, -apple-system, Segoe UI, Roboto';
  const tb = `(teste) Água atravessando os "buracos" de uma malha cúbica`;
  const mb = ctx.measureText(tb);
  ctx.fillText(tb, center.x - mb.width/2, center.y + spacing*2.2);
}



function drawHexCommon(seqLabel){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const spacing=+ui.spacing.value; let radius=+ui.radius.value;
  
  if(state.key==='DIY'){
    if(typeof window._radiusDefault==='undefined') window._radiusDefault = radius;
    radius = window._radiusDefault;
    if(ui.radius){ ui.radius.disabled = true; ui.radius.parentElement && (ui.radius.parentElement.style.opacity='0.5'); }
  } else {
    if(ui.radius){ ui.radius.disabled = false; ui.radius.parentElement && (ui.radius.parentElement.style.opacity=''); }
  }

  
  const side = 4; 
  const layers = 3; 
  const atomsAll = buildIntroLayers(side, layers, (seqLabel==='ABA'?'ABA':'ABC'));

  
  let cIdx = 0, best = 1e9;
  for(let i=0;i<atomsAll.length;i++){
    const p = atomsAll[i].pos;
    const d = Math.hypot(p[0], p[1], p[2]);
    if(d < best){ best = d; cIdx = i; }
  }
  const centerAtom = atomsAll[cIdx];

  
  const neigh = [];
  for(let i=0;i<atomsAll.length;i++){
    if(i===cIdx) continue;
    const p = atomsAll[i].pos;
    const d = Math.hypot(p[0]-centerAtom.pos[0], p[1]-centerAtom.pos[1], p[2]-centerAtom.pos[2]);
    neigh.push({i, pos: atomsAll[i].pos.slice(), d});
  }
  neigh.sort((a,b)=>a.d-b.d);
  const first12 = neigh.slice(0,12).map(o=>o.pos);

  
  const C2 = {x:w*0.5, y:h*0.62};
  const L = spacing*1.15;
  const theta = -Math.PI/6;
  function projectAt(p3, L, off){
    const p=project(p3, L);
    return {x:p.x+off.x, y:p.y+off.y, z:p.z, s:p.s};
  }
  function rotate2D(p, cx, cy, ang){
    const s=Math.sin(ang), c=Math.cos(ang);
    const x=p.x-cx, y=p.y-cy;
    return {x:x*c-y*s+cx, y:x*s+y*c+cy, z:p.z, s:p.s};
  }

  const Pc = rotate2D(projectAt(centerAtom.pos, L, C2), C2.x, C2.y, theta);
  const Pn = first12.map(v => rotate2D(projectAt(v, L, C2), C2.x, C2.y, theta));


const atomsEdit = [{type:'X', uc:centerAtom.pos, pos:centerAtom.pos}, ...first12.map(v=>({type:'X', uc:v, pos:v}))];
state.projectedVisible = [
    {type:'X', uc:centerAtom.pos, p:{x:Pc.x - w/2, y:Pc.y - h/2, z:Pc.z}},
    ...Pn.map((p,i)=>({type:'X', uc:first12[i], p:{x:p.x - w/2, y:p.y - h/2, z:p.z}}))
  ];


if(state.pickA){
  const arr = state.projectedVisible || [];
  const ref = state.pickA;
  let chosen = null, bestd=1e9;
  for(const it of arr){
    if(it.type!==ref.type) continue;
    const d=Math.hypot(it.uc[0]-ref.uc[0], it.uc[1]-ref.uc[1], it.uc[2]-ref.uc[2]);
    if(d<bestd){ bestd=d; chosen=it; }
  }
  if(chosen){
    const R = ((ui.radius && +ui.radius.value) || (window._radiusDefault || 12)) + 6;
    ctx.lineWidth=2;
    ctx.strokeStyle="rgba(251,191,36,0.95)";
    ctx.beginPath(); ctx.arc(chosen.p.x + w/2, chosen.p.y + h/2, R, 0, Math.PI*2); ctx.stroke();
  }
  drawStericOverlay();

}


{
  const arr = state.projectedVisible || [];
  const embeds = (Array.isArray(EMBEDDED_BONDS)?EMBEDDED_BONDS:[]).filter(e=>e.key==='HEX_ABC' && (!e.cells || e.cells==+ui.cells.value));
    const list = [...embeds, ...bondsForCurrent()];
  
  const __drawBonds = (ui.showBonds && ui.showBonds.checked);
const findByRef = (ref)=>{
    let best=null, bestd=1e9;
    for(const it of arr){
      if(it.type!==ref.type) continue;
      const d=Math.hypot(it.uc[0]-ref.uc[0], it.uc[1]-ref.uc[1], it.uc[2]-ref.uc[2]);
      if(d<bestd){best=it; bestd=d;}
    }
    return best;
  };
  if(__drawBonds){
    for(const rec of list){
    const A = findByRef(rec.a), B=findByRef(rec.b);
    if(!A || !B) continue;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgba(96,165,250,0.95)";
    ctx.beginPath(); ctx.moveTo(A.p.x + w/2, A.p.y + h/2); ctx.lineTo(B.p.x + w/2, B.p.y + h/2); ctx.stroke();
  }
}
if(typeof bondsCoordForCurrent==='function'){
  const arr = state.projectedVisible || [];
  const findByRef = (ref)=>{
    let best=null, bestd=1e9;
    for(const it of arr){
      if(it.type!==ref.type) continue;
      const d=Math.hypot(it.uc[0]-ref.uc[0], it.uc[1]-ref.uc[1], it.uc[2]-ref.uc[2]);
      if(d<bestd){best=it; bestd=d;}
    }
    return best;
  };
  const list2 = bondsCoordForCurrent();
  for(const rec of list2){
    const C = findByRef(rec.center), N=findByRef(rec.neighbor);
    if(!C || !N) continue;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgba(30,58,138,0.95)";
    ctx.beginPath(); ctx.moveTo(C.p.x + w/2, C.p.y + h/2); ctx.lineTo(N.p.x + w/2, N.p.y + h/2); ctx.stroke();
  }
}


  
  const zs = Pn.map(p=>p.z);
  const zSorted = zs.slice().sort((a,b)=>a-b);
  const zLow  = (zSorted[0] + zSorted[2]) / 2;
  const zHigh = (zSorted[9] + zSorted[11]) / 2;
  const eps = 1e-6;
  const top = [], mid=[], bot=[];
  for(const p of Pn){
    if(p.z >= zHigh - eps) top.push(p);
    else if(p.z <= zLow + eps) bot.push(p);
    else mid.push(p);
  }
  function angle(p){ return Math.atan2(p.y - Pc.y, p.x - Pc.x); }
  top.sort((a,b)=>angle(a)-angle(b));
  bot.sort((a,b)=>angle(a)-angle(b));
  mid.sort((a,b)=>angle(a)-angle(b));

  
  const hideEdges = (document.getElementById('introHideEdges')?.checked === true);
  if(!hideEdges){
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(229,231,235,0.75)';
    for(const p of Pn){
      ctx.beginPath(); ctx.moveTo(Pc.x,Pc.y); ctx.lineTo(p.x,p.y); ctx.stroke();
    }
    if(top.length===3){
      ctx.beginPath(); ctx.moveTo(top[0].x, top[0].y);
      ctx.lineTo(top[1].x, top[1].y); ctx.lineTo(top[2].x, top[2].y);
      ctx.closePath(); ctx.stroke();
    }
    if(bot.length===3){
      ctx.beginPath(); ctx.moveTo(bot[0].x, bot[0].y);
      ctx.lineTo(bot[1].x, bot[1].y); ctx.lineTo(bot[2].x, bot[2].y);
      ctx.closePath(); ctx.stroke();
    }
    if(mid.length===6){
      ctx.beginPath(); ctx.moveTo(mid[0].x, mid[0].y);
      for(let i=1;i<6;i++){ ctx.lineTo(mid[i].x, mid[i].y); }
      ctx.closePath(); ctx.stroke();
    }
    let topC = top.reduce((a,b)=> a.z>b.z?a:b, top[0]||Pc);
    let botC = bot.reduce((a,b)=> a.z<b.z?a:b, bot[0]||Pc);
    ctx.beginPath(); ctx.moveTo(topC.x, topC.y); ctx.lineTo(botC.x, botC.y); ctx.stroke();
  }

  
  function paint(p, rr, col){
    const scale = (ui.projecaoOrto && ui.projecaoOrto.checked) ? (state.zoom||1) : (p.s||1);
    const R = rr * scale;
    ctx.beginPath(); ctx.arc(p.x, p.y, R+2, 0, Math.PI*2); ctx.fillStyle="rgba(0,0,0,0.45)"; ctx.fill();
    ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI*2); ctx.fillStyle=col; ctx.fill();
    const r2=Math.max(2, R*0.45);
    ctx.beginPath(); ctx.arc(p.x - R*0.35, p.y - R*0.35, r2, 0, Math.PI*2);
    ctx.fillStyle="rgba(255,255,255,0.45)"; ctx.fill();
  }
  const nodes = [
  ...Pn.map((p,i)=>({p, rr: radius*0.9, col:'#93c5fd', uc:first12[i]})),
  {p: Pc, rr: radius*0.95, col:'#ef4444', uc:centerAtom.pos}
];

nodes.sort((a,b)=>a.p.z-b.p.z);
for(const n of nodes){ paint(n.p, n.rr, n.col); }


try{
  
  const denom3D = Math.max(1e-6, (typeof L !== 'undefined' ? L : 1) * ((state && state.zoom) ? state.zoom : 1));

  
  const items3D = nodes.map(n => ({
    pos: Array.isArray(n.uc) && n.uc.length===3 ? n.uc : [n.p && n.p.x ? n.p.x/denom3D : 0, n.p && n.p.y ? n.p.y/denom3D : 0, 0],
    r:  (n.rr || 0) / denom3D
  }));

  updateStericAlert(checkStericOverlap3D(items3D));
}catch(e){}}
}
function drawHexABC(){ drawHexCommon('ABC'); }



const WS_BCC_VERTS = [[0, -2, -1], [0, 2, -1], [0, -2, 1], [0, 2, 1], [-1, -2, 0], [-1, 2, 0], [1, -2, 0], [1, 2, 0], [-2, -1, 0], [2, -1, 0], [-2, 1, 0], [2, 1, 0], [-2, 0, -1], [2, 0, -1], [-2, 0, 1], [2, 0, 1], [0, -1, -2], [0, -1, 2], [0, 1, -2], [0, 1, 2], [-1, 0, -2], [-1, 0, 2], [1, 0, -2], [1, 0, 2]];        
const WS_BCC_TRIS  = [[2, 9, 23], [11, 19, 23], [2, 8, 21], [10, 19, 21], [19, 21, 23], [1, 10, 20], [8, 16, 20], [9, 16, 22], [1, 11, 22], [16, 20, 22], [0, 8, 16], [0, 9, 16], [3, 10, 19], [3, 11, 19], [9, 11, 15], [11, 15, 23], [9, 15, 23], [8, 10, 14], [8, 14, 21], [10, 14, 21], [2, 17, 23], [17, 21, 23], [2, 17, 21], [8, 10, 12], [10, 12, 20], [8, 12, 20], [9, 11, 13], [9, 13, 22], [11, 13, 22], [1, 18, 20], [1, 18, 22], [18, 20, 22], [2, 4, 8], [0, 4, 8], [0, 2, 4], [2, 6, 9], [0, 2, 6], [0, 6, 9], [1, 5, 10], [3, 5, 10], [1, 3, 5], [1, 7, 11], [1, 3, 7], [3, 7, 11]];        

const WS_FCC_VERTS = [[2, 0, 0], [-2, 0, 0], [0, 2, 0], [0, -2, 0], [0, 0, 2], [0, 0, -2], [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1]];        
const WS_FCC_TRIS  = [[1, 4, 9], [2, 4, 9], [1, 2, 9], [0, 2, 13], [2, 4, 13], [0, 4, 13], [1, 2, 8], [2, 5, 8], [1, 5, 8], [0, 2, 12], [0, 5, 12], [2, 5, 12], [0, 4, 11], [3, 4, 11], [0, 3, 11], [1, 4, 7], [1, 3, 7], [3, 4, 7], [1, 5, 6], [3, 5, 6], [1, 3, 6], [0, 5, 10], [0, 3, 10], [3, 5, 10]];        

function __drawUnitCubeEdgesGeneric(L){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  const corners=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]]
    .map(v=>[v[0]-0.5, v[1]-0.5, v[2]-0.5]);
  const E=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  const P=corners.map(v=>project(v, L));
  ctx.lineWidth=1.4; ctx.strokeStyle='rgba(229,231,235,0.75)';
  for(const [i,j] of E){
    ctx.beginPath();
    ctx.moveTo(P[i].x+w/2, P[i].y+h/2);
    ctx.lineTo(P[j].x+w/2, P[j].y+h/2);
    ctx.stroke();
  }
}
function __drawDotsLattice(kind, L){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  let pts = [];
  const cc=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]].map(v=>[v[0]-0.5, v[1]-0.5, v[2]-0.5]);
  pts = pts.concat(cc);
  if(kind==='BCC'){ pts.push([0,0,0]); }
  else if(kind==='FCC'){
    const fcs = [[0.5,0.0,0.5],[0.5,1.0,0.5],[0.0,0.5,0.5],[1.0,0.5,0.5],[0.5,0.5,0.0],[0.5,0.5,1.0]]
      .map(v=>[v[0]-0.5,v[1]-0.5,v[2]-0.5]);
    pts = pts.concat(fcs);
  }
  const P=pts.map(v=>project(v, L)).sort((a,b)=>a.z-b.z);
  for(const p of P){
    ctx.beginPath(); ctx.arc(p.x+w/2, p.y+h/2, 5, 0, Math.PI*2);
    ctx.fillStyle = '#111827'; ctx.fill();
  }
}
function __edgesFromTris(tris){
  const set=new Set(); const edges=[];
  for(const [a,b,c] of tris){
    const es=[[a,b],[b,c],[c,a]];
    for(let [i,j] of es){
      const key = i<j ? i+'-'+j : j+'-'+i;
      if(!set.has(key)){ set.add(key); edges.push([i,j]); }
    }
  }
  return edges;
}
function __drawSolid(verts, tris, L, fillRGBA, strokeRGBA){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  const PV = verts.map(v=>project(v, L));
  const TS = tris.map(t=>({t, z:(PV[t[0]].z+PV[t[1]].z+PV[t[2]].z)/3})).sort((a,b)=>a.z-b.z);
  ctx.globalAlpha=1.0;
  for(const {t} of TS){
    const a=PV[t[0]], b=PV[t[1]], c=PV[t[2]];
    ctx.beginPath();
    ctx.moveTo(a.x+w/2, a.y+h/2);
    ctx.lineTo(b.x+w/2, b.y+h/2);
    ctx.lineTo(c.x+w/2, c.y+h/2);
    ctx.closePath();
    ctx.fillStyle = fillRGBA; ctx.fill();
  }
  const edges = __edgesFromTris(tris);
  ctx.lineWidth=2; ctx.strokeStyle=strokeRGBA;
  for(const [i,j] of edges){
    const a=PV[i], b=PV[j];
    ctx.beginPath();
    ctx.moveTo(a.x+w/2, a.y+h/2);
    ctx.lineTo(b.x+w/2, b.y+h/2);
    ctx.stroke();
  }
}
function drawWS(kind){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const L=+ui.spacing.value;
  drawAxes(L);
  __drawUnitCubeEdgesGeneric(L);
  let fill='rgb(100,100,100)'; let stroke='rgba(31,41,55,0.95)';
  if(kind==='BCC'){
    const s=0.18;
    const V = WS_BCC_VERTS.map(v=>[v[0]*s, v[1]*s, v[2]*s]);
    __drawSolid(V, WS_BCC_TRIS, L, fill, stroke);
    __drawDotsLattice('BCC', L);
  }else{
    const s=0.23;
    const V = WS_FCC_VERTS.map(v=>[v[0]*s, v[1]*s, v[2]*s]);
    __drawSolid(V, WS_FCC_TRIS, L, fill, stroke);
    __drawDotsLattice('FCC', L);
  }
}
function drawWS_BCC(){ drawWS('BCC'); }
function drawWS_FCC(){ drawWS('FCC'); }



if (typeof updateStericAlert === 'undefined') {
  function updateStericAlert(flag){
    state.steric = !!flag;
    try{
      const el = document.getElementById('alertaEsterico');
      if(el) el.style.display = state.steric ? 'block' : 'none';
    }catch(e){}
  }
}
if (typeof drawStericOverlay === 'undefined') {
  function drawStericOverlay(){
    if(!state.steric) return;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const msg = 'Alerta! Estrutura improvável com alta repulsão estérica.';
    ctx.save();
    ctx.font = '600 14px system-ui, -apple-system, Segoe UI, Roboto';
    const m = ctx.measureText(msg);
    const padX = 16, padY = 8;
    const bx = (w - m.width)/2 - padX, by = h - 40 - padY;
    ctx.fillStyle = 'rgba(239,68,68,0.85)';
    ctx.fillRect(bx, by, m.width + padX*2, 26 + padY*2);
    ctx.strokeStyle = 'rgba(248,113,113,0.9)'; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, m.width + padX*2, 26 + padY*2);
    ctx.fillStyle = '#fff';
    ctx.fillText(msg, (w - m.width)/2, by + 26);
    ctx.restore();
  }
}


if (typeof checkStericOverlap === 'undefined') {
  function checkStericOverlap(circles){
    if(!Array.isArray(circles) || circles.length<2) return false;
    for(let i=0;i<circles.length;i++){
      const a = circles[i];
      for(let j=i+1;j<circles.length;j++){
        const b = circles[j];
        const dx = (a.x||0) - (b.x||0), dy = (a.y||0) - (b.y||0);
        const ra = Math.max(0, a.r||0), rb = Math.max(0, b.r||0);
        const R = ra + rb - 0.5; 
        if(R > 0 && (dx*dx + dy*dy) < R*R) return true;
      }
    }
    return false;
  }
}


if (typeof checkStericOverlap3D === 'undefined') {
  function checkStericOverlap3D(items){
    
    if(!Array.isArray(items) || items.length < 2) return false;
    const n = items.length;
    const eps = 1e-6;
    for(let i=0;i<n;i++){
      const ai = items[i];
      const xi = ai.pos[0], yi = ai.pos[1], zi = ai.pos[2], ri = Math.max(0, ai.r||0);
      for(let j=i+1;j<n;j++){
        const aj = items[j];
        const dx = xi - aj.pos[0], dy = yi - aj.pos[1], dz = zi - aj.pos[2];
        const d2 = dx*dx + dy*dy + dz*dz;
        const R = ri + Math.max(0, aj.r||0) - 0.02; 
        if(R > 0 && d2 + eps < R*R) return true;
      }
    }
    


if (typeof checkStericOverlap3D !== 'undefined') {
  
  (function(){
    const _old = checkStericOverlap3D;
    checkStericOverlap3D = function(items){
      try{
        if(!Array.isArray(items) || items.length < 2) return false;

        
        const M = (typeof metricOf === 'function') ? metricOf(state.key) : [[1,0,0],[0,1,0],[0,0,1]];
        const aVec = Array.isArray(M[0]) ? [M[0][0], M[1][0], M[2][0]] : [1,0,0];
        const bVec = Array.isArray(M[0]) ? [M[0][1], M[1][1], M[2][1]] : [0,1,0];
        const cVec = Array.isArray(M[0]) ? [M[0][2], M[1][2], M[2][2]] : [0,0,1];

        function norm(v){ return Math.hypot(v[0], v[1], v[2]); }
        function add(a,b){ return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
        function sub(a,b){ return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
        function mul(k,v){ return [k*v[0], k*v[1], k*v[2]]; }

        
        function dnn_hex(){
          const ab = sub(aVec, bVec);
          return Math.min(norm(aVec), norm(bVec), norm(ab));
        }

        const isHex = (state && (state.key==='HEX_ABC' || (state.key==='DIY' && window.stateDIY && stateDIY.format==='hexagonal')));

        
        const dnn = isHex ? dnn_hex() : null;

        
        function minImageDist(pi, pj){
          const base = sub(pi, pj);
          let best = Infinity;
          for(let I=-1; I<=1; I++){
            for(let J=-1; J<=1; J++){
              for(let K=-1; K<=1; K++){
                const shift = add(add(mul(I, aVec), mul(J, bVec)), mul(K, cVec));
                const v = add(base, shift);
                const d = norm(v);
                if(d < best) best = d;
              }
            }
          }
          return best;
        }

        
        let maxRsum = 0;
        for(const it of items){ maxRsum = Math.max(maxRsum, Math.max(0, it.r||0)); }
        
        if(isHex && dnn && (2*maxRsum) <= 0.95*dnn){
          return false; 
        }

        
        const n = items.length;
        const TOL_REL = isHex ? 0.10 : 0.02;   
        const TOL_ABS = isHex ? 0.02 : 0.005; 
        let viol = 0;
        for(let i=0;i<n;i++){
          const ai = items[i];
          const ri = Math.max(0, ai.r||0);
          for(let j=i+1;j<n;j++){
            const aj = items[j];
            const rj = Math.max(0, aj.r||0);
            const d = minImageDist(ai.pos, aj.pos);
            const Rsum = ri + rj;
            const overlap = Rsum - d;
            if(overlap > TOL_ABS && (overlap / Math.max(1e-9, Rsum)) > TOL_REL){
              viol++;
              if(viol >= (isHex ? 3 : 1)) return true; 
            }
          }
        }
        return false;
      }catch(e){
        
        try{ return _old(items); }catch(_){ return false; }
      }
    }
  })();
}

return false;
  }
}


function pushUCOutside(uc, eps=0.02){
  
  const out = [uc[0], uc[1], uc[2]];
  let bestAxis = 0, bestMargin = Infinity;
  for(let i=0;i<3;i++){
    const margin = 0.5 - Math.abs(out[i]);
    if(margin < bestMargin){ bestMargin = margin; bestAxis = i; }
  }
  const s = out[bestAxis] >= 0 ? 1 : -1;
  out[bestAxis] = s * (0.5 + Math.max(1e-3, eps));
  return out;
}


function ensureRemovedOutsideForKey(key, cells, eps=0.02){
  try{
    const M = metricOf(key);
    const removed = Array.isArray(REMOVED_ATOMS) ? REMOVED_ATOMS.filter(r=>r.key===key && r.cells===cells) : [];
    
    return removed.map(r=>{
      const uc_out = inUnitCellUC(r.uc) ? pushUCOutside(r.uc, eps) : r.uc.slice();
      const pos_out = matMulVec(M, uc_out);
      return { type:r.type, uc: r.uc.slice(), uc_out, pos_out };
    });
  }catch(e){ return []; }
}
      

function ensureRemovedAtomsOutsideUC_Current(){  }
    


function draw(){
  
  

  
  if (state.key==='INTRO_CAMADAS' && state.ic){
    const moving = introCamadasTick(state.ic);
    state.atoms = introCamadasComposeAtoms(state.ic);
  }

  if(state.key==='INTRO_CAMADAS'){ drawIntroCamadas(); requestAnimationFrame(draw); return; }
  if(state.key==='WS_BCC'){ drawWS_BCC(); requestAnimationFrame(draw); return; }
  if(state.key==='WS_FCC'){ drawWS_FCC(); requestAnimationFrame(draw); return; }
  if(false){ drawIntroStoryboard(); requestAnimationFrame(draw); return; }
  if(state.key==='INTRO2'){ drawIntroBuracoFCC(); requestAnimationFrame(draw); return; }
  if(state.key==='INTRO_TETRA'){ drawIntroTetraedro(); requestAnimationFrame(draw); return; }
  if(state.key==='INTRO_TESTE'){ drawIntroTeste(); requestAnimationFrame(draw); return; }
  if(state.key==='HEX_ABC'){ drawHexABC(); requestAnimationFrame(draw); return; }
  const w=canvas.clientWidth, h=canvas.clientHeight;
  ctx.clearRect(0,0,w,h);

  const spacing=+ui.spacing.value; let radius = (ui.radius && +ui.radius.value) || (window._radiusDefault || 12);
  const atomsAll = buildLattice(state.key,+ui.cells.value);
  let atoms = atomsAll.slice();

  
  try {
    const rmset = removedSetForCurrent();
    atoms = atoms.filter(a => !rmset.has(atomKeyId(atomRef(a))));
  } catch(e){}
  
  try {
    const rmset = removedSetForCurrent();
    if(false  && ui.somenteCelula && ui.somenteCelula.checked){
      const M = metricOf(state.key);
      for(const a of atoms){
        const id = atomKeyId(atomRef(a));
        if(rmset.has(id)){
          const ucOut = pushUCOutside(a.uc, 0.02);
          a.uc = ucOut;
          a.pos = matMulVec(M, ucOut);
        }
      }
      
    } else {
      atoms = atoms.filter(a => !rmset.has(atomKeyId(atomRef(a))));
    }
  } catch(e){}
  if(ui.somenteCelula.checked){ atoms = atoms.filter(inUnitCell); }
  if(ui.apenasUmaFace && ui.apenasUmaFace.checked){ atoms = atoms.filter(inUnitCell).filter(a=>inFace(a, ui.seletorFace.value)); }

  
  try {
    const def = STRUCTURES[state.key] || {};
    const metric = def.metric || [1,1,1];
    const M = def.metricM ? def.metricM : diag3(metric[0],metric[1],metric[2]);
    const adds = addedForCurrent();
    for(const r of adds){
      const pos = matMulVec(M, r.uc);
      const st=addAtomStyleFor(r.type);
      atoms.push({ type:r.type, color:st.color, rScale:st.rScale, uc:r.uc.slice(), pos:pos });
    }
  } catch(e){}

  


if(isIonic(state.key)){
  const pkey = p=>p.map(v=>v.toFixed(3)).join(',');
  const rm = new Set();
  const adds = [];
  const nearestOfType=(t)=>{
    let best=null, bestd=Infinity;
    for(const a of atoms){
      if(a.type!==t) continue;
      const d=Math.hypot(a.pos[0],a.pos[1],a.pos[2]);
      if(d<bestd){ bestd=d; best=a; }
    }
    return best;
  };
  if(ui.schottky.checked){
    const aA = nearestOfType('A');
    const aC = nearestOfType('C');
    if(aA) rm.add(pkey(aA.pos));
    if(aC) rm.add(pkey(aC.pos));
  }
  if(ui.frenkel.checked){
    const cat = nearestOfType('C');
    if(cat){
      rm.add(pkey(cat.pos));
      const ip = [cat.pos[0]+0.25, cat.pos[1]+0.25, cat.pos[2]];
      adds.push({type:cat.type, pos:ip, interstitial:true});
    }
  }
  if(rm.size || adds.length){
    atoms = atoms.filter(a=>!rm.has(pkey(a.pos))).concat(adds);
  }
}

  drawAxes(spacing);

  
  if(ui.mostrarArestas.checked && state.key!=="INTRO"){
    const L=spacing;
    const M=metricOf(state.key);

    function add(a,b){ return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
    function mul(k,v){ return [k*v[0], k*v[1], k*v[2]]; }
    const aVec = matMulVec(M, [1,0,0]);
    const bVec = matMulVec(M, [0,1,0]);
    const cVec = matMulVec(M, [0,0,1]);

    let edges = [];
    let cornersProj = [];

    if(false  || (state.key==="DIY" && window.stateDIY && window.stateDIY.format==="hexagonal")){
      
      const base = [
        mul(0.5, aVec),
        mul(0.5, add(aVec,bVec)),
        mul(0.5, bVec),
        mul(-0.5, aVec),
        mul(-0.5, add(aVec,bVec)),
        mul(-0.5, bVec),
      ];
      const zDown = mul(-0.5, cVec);
      const zUp   = mul( 0.5, cVec);
      const verts = [];
      for(const v of base){ verts.push(add(v, zDown)); } 
      for(const v of base){ verts.push(add(v, zUp));   } 

      const E=[];
      for(let i=0;i<6;i++){ E.push([i,(i+1)%6]); }          
      for(let i=0;i<6;i++){ E.push([6+i,6+((i+1)%6)]); }    
      for(let i=0;i<6;i++){ E.push([i,6+i]); }              

      cornersProj = verts.map(v=>project(v,L));
      edges = E;
    }else{
      
      const corners=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]]
        .map(v=>[v[0]-0.5, v[1]-0.5, v[2]-0.5])
        .map(v=>matMulVec(M, v));
      const E=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      cornersProj = corners.map(v=>project(v,L));
      edges = E;
    }

    
    
    try {
      if (state.key==="DIY" && window.stateDIY && (stateDIY.format==="tetragonal" || stateDIY.format==="orthorhombic")) {
        const P = cornersProj;
        function facePath(ids){
          ctx.beginPath();
          ctx.moveTo(P[ids[0]].x+w/2, P[ids[0]].y+h/2);
          for(let k=1;k<ids.length;k++){
            const p=P[ids[k]];
            ctx.lineTo(p.x+w/2, p.y+h/2);
          }
          ctx.closePath();
        }
        
        ctx.fillStyle = "rgba(0,0,0,0)"; 
        facePath([0,1,5,4]); ctx.fill();
        
        ctx.fillStyle = "rgba(0,0,0,0)";
        facePath([1,2,6,5]); ctx.fill();
        
        ctx.fillStyle = "rgba(0,0,0,0)";
        facePath([4,5,6,7]); ctx.fill();
      }
    } catch(e) {  }
    
    ctx.strokeStyle="rgba(125,211,252,0.9)"; ctx.lineWidth=2;
    for(const [a,b] of edges){
      ctx.beginPath();
      const pa = cornersProj[a], pb = cornersProj[b];
      ctx.moveTo(pa.x+w/2, pa.y+h/2);
      ctx.lineTo(pb.x+w/2, pb.y+h/2);
      ctx.stroke();
    }
  }

  



  if(ui.showBonds && ui.showBonds.checked){
    let list = bondsForCurrent();
    if(state.key==='HEX_ABC' && Array.isArray(EMBEDDED_BONDS)){
      const embeds = EMBEDDED_BONDS.filter(e=>(!e.cells || e.cells==+ui.cells.value));
      const toAdd = embeds.filter(e=>!removedEmbedBondHas(state.key, +ui.cells.value, bondId(e)));
      list = toAdd.concat(list);
    }
    for(const rec of list){
      const A = findAtomByRef(rec.a, atomsAll);
      const B = findAtomByRef(rec.b, atomsAll);
      if(!A || !B) continue;

      
      if(ui.somenteCelula.checked && (!inUnitCell(A) || !inUnitCell(B))) continue;
      if(ui.apenasUmaFace && ui.apenasUmaFace.checked){
        if(!inFace(A, ui.seletorFace.value) || !inFace(B, ui.seletorFace.value)) continue;
      }
      const pa=project(A.pos, spacing), pb=project(B.pos, spacing);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(96,165,250,0.95)"; 
      ctx.beginPath(); ctx.moveTo(pa.x+w/2, pa.y+h/2); ctx.lineTo(pb.x+w/2, pb.y+h/2); ctx.stroke();
    }
  }


  if(ui.coordpoly.checked || ui.editCoord.checked || ui.delCoord.checked){  {
    const list = coordsForCurrent();
    for(const rec of list){
      const C = findAtomByRef(rec.center, atomsAll);
      const N = findAtomByRef(rec.neighbor, atomsAll);
      if(!C || !N) continue;
      if(ui.somenteCelula.checked && (!inUnitCell(C) || !inUnitCell(N))) continue;
      if(ui.apenasUmaFace && ui.apenasUmaFace.checked){
        if(!inFace(C, ui.seletorFace.value) || !inFace(N, ui.seletorFace.value)) continue;
      }
      const pc=project(C.pos, spacing), pn=project(N.pos, spacing);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(30,58,138,0.95)"; 
      ctx.beginPath(); ctx.moveTo(pc.x+w/2, pc.y+h/2); ctx.lineTo(pn.x+w/2, pn.y+h/2); ctx.stroke();
    }
  }

  }

  

  
  if(ui.coordpoly.checked || ui.editCoord.checked || ui.delCoord.checked || coordsForCurrent().length>0){
    let center=null,best=Infinity;

    
    if(state.coordCenterRef){
      const chosen = findAtomByRef(state.coordCenterRef, atomsAll);
      if(chosen) center = chosen;
    }
    for(const a of atoms){
      const d=Math.hypot(a.pos[0],a.pos[1],a.pos[2]);
      if(d<best){ best=d; center=a; }
    }
    if(center){
      const metric = metricOf(state.key);
      const neigh1 = (state.key==="RUTILIO")
        ? rutileNeighbors(center, atomsAll, metric, {
            somenteCelula: ui.somenteCelula.checked,
            apenasUmaFace: (ui.apenasUmaFace && ui.apenasUmaFace.checked),
            faceSel: ui.seletorFace.value
          })
        : firstShellNeighborsPBC(center, atomsAll, metric, {
            somenteCelula: ui.somenteCelula.checked,
            apenasUmaFace: (ui.apenasUmaFace && ui.apenasUmaFace.checked),
            faceSel: ui.seletorFace.value
          });
      ctx.lineWidth=2; ctx.strokeStyle="rgba(125,211,252,0.95)";
      for(const nb of neigh1){
        const pc=project(center.pos,spacing), pn=project(nb.pos,spacing);
        ctx.beginPath(); ctx.moveTo(pc.x+w/2, pc.y+h/2); ctx.lineTo(pn.x+w/2, pn.y+h/2); ctx.stroke();
      }
    }
  }

  
  let __hexClipActive = false;
  if (ui.somenteCelula && ui.somenteCelula.checked && (state.key==='DIY' && window.stateDIY && stateDIY.format==='hexagonal')) {
    
    const M = metricOf(state.key);
    function add(a,b){ return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
    function mul(k,v){ return [k*v[0], k*v[1], k*v[2]]; }
    const aVec = matMulVec(M, [1,0,0]);
    const bVec = matMulVec(M, [0,1,0]);
    const cVec = matMulVec(M, [0,0,1]);
    const base = [
      mul(0.5, aVec),
      mul(0.5, add(aVec,bVec)),
      mul(0.5, bVec),
      mul(-0.5, aVec),
      mul(-0.5, add(aVec,bVec)),
      mul(-0.5, bVec),
    ];
    const zDown = mul(-0.5, cVec);
    const zUp   = mul( 0.5, cVec);
    const verts = [];
    for (const v of base){ verts.push(add(v, zDown)); }
    for (const v of base){ verts.push(add(v, zUp)); }
    
    const pts = verts.map(v => {
      const p = project(v, spacing);
      return {x:p.x + w/2, y:p.y + h/2};
    });
    
    function cross(o,a,b){ return (a.x-o.x)*(b.y-o.y) - (a.y-o.y)*(b.x-o.x); }
    function hull2D(arr){
      const P = arr.slice().sort((a,b)=> a.x===b.x ? a.y-b.y : a.x-b.x);
      const lower=[]; for(const p of P){ while(lower.length>=2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0) lower.pop(); lower.push(p); }
      const upper=[]; for(const p of P.slice().reverse()){ while(upper.length>=2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0) upper.pop(); upper.push(p); }
      upper.pop(); lower.pop();
      return lower.concat(upper);
    }
    const H = hull2D(pts);
    if (H.length >= 3){
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(H[0].x, H[0].y);
      for (let i=1;i<H.length;i++){ ctx.lineTo(H[i].x, H[i].y); }
      ctx.closePath();
      ctx.clip();
      __hexClipActive = true;
    }
  }

  const projected=atoms.map(a=>{ const p=project(a.pos,spacing); return {...a,p}; }).sort((A,B)=>A.p.z-B.p.z);
  state.projectedVisible = projected;

  
  const denomBase = Math.max(1e-6, spacing * (state.zoom||1));
  const items3D = [];

  for(const a of projected){
    let r = (typeof a.r==='number' && a.r>0) ? a.r : (radius * (a.rScale ? (+a.rScale) : 1));
    if(state.key!=="DIY"){
      if(state.key==="NaCl"){
        r = (a.type === "C") ? radius * 1.35 : (a.type === "A" ? radius * 0.75 : radius);
      } else if(state.key==="RUTILIO"){
        r = (a.type === "T") ? radius * 0.85 : radius * 1.05;
      }
    }
    
    const denom = denomBase * ((ui.projecaoOrto && ui.projecaoOrto.checked) ? 1 : (a.p && a.p.s ? a.p.s : 1));
    const r3 = r / denom;
    items3D.push({pos:a.pos, r:r3});

    
    ctx.beginPath(); ctx.arc(a.p.x+w/2, a.p.y+h/2, r+2,0,TAU); ctx.fillStyle="rgba(0,0,0,0.45)"; ctx.fill();
    ctx.beginPath(); ctx.arc(a.p.x+w/2, a.p.y+h/2, r,0,TAU); ctx.fillStyle=(COLORS[a.type]||"#fff"); ctx.fill();
    const r2=Math.max(2, r*0.45);
    ctx.beginPath(); ctx.arc(a.p.x+w/2 - r*0.35, a.p.y+h/2 - r*0.35, r2,0,TAU); ctx.fillStyle="rgba(255,255,255,0.35)"; ctx.fill();
  }
  
  if (__hexClipActive) { ctx.restore(); __hexClipActive = false; }

  updateStericAlert(checkStericOverlap3D(items3D));

  if(state.pickA){
    const A = findAtomByRef(state.pickA, atomsAll);
    if(A){
      const p = project(A.pos, spacing);
      const R = ((ui.radius && +ui.radius.value) || (window._radiusDefault || 12)) + 6;
      ctx.lineWidth=2;
      ctx.strokeStyle="rgba(251,191,36,0.95)";
      ctx.beginPath(); ctx.arc(p.x+w/2, p.y+h/2, R, 0, TAU); ctx.stroke();
    }
  }

  
  if(state.coordCenterRef){
    const C = findAtomByRef(state.coordCenterRef, atomsAll);
    if(C){
      const p = project(C.pos, spacing);
      const R = ((ui.radius && +ui.radius.value) || (window._radiusDefault || 12)) + 8;
      ctx.lineWidth=2.5;
      ctx.strokeStyle="rgba(30,58,138,0.95)";
      ctx.beginPath(); ctx.arc(p.x+w/2, p.y+h/2, R, 0, TAU); ctx.stroke();
    }
  }

  requestAnimationFrame(draw);
}

draw();


function drawIntroBuracosStoryboard(){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const spacing=+ui.spacing.value; let radius = (ui.radius && +ui.radius.value) || (window._radiusDefault || 12);

  
  const side = +ui.cells.value;
  const {pts, e1, e2} = buildIntroBase(side);
  const hZ = Math.sqrt(2/3); 

  function makeLayer(fracShift, z){
    
    const idx = (fracShift===0)?0:1; 
    const sh = layerShiftABC(idx, e1, e2);
    return pts.map(p => {
      const pos=[p[0]+sh[0], p[1]+sh[1], z];
      return {type:(idx===0?'A':'B'), pos, uc:[...pos]};
    });
  }
  const A = makeLayer(0, 0);
  const B = makeLayer(1/3, hZ);

  
  function rotate2D(p, cx, cy, ang){
    const s=Math.sin(ang), c=Math.cos(ang);
    const x=p.x-cx, y=p.y-cy;
    return {x: x*c - y*s + cx, y: x*s + y*c + cy, z:p.z};
  }
  function projectAt(p3, L, off){ const p=project(p3, L); return {x:p.x+off.x, y:p.y+off.y, z:p.z}; }
  function drawPoly(vertices, faces, colorFill, colorStroke){
    ctx.lineJoin='round'; ctx.lineCap='round';
    
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = colorStroke || 'rgba(16,185,129,0.95)';
    ctx.fillStyle   = colorFill  || 'rgba(16,185,129,0.18)';
    for(const f of faces){
      ctx.beginPath();
      ctx.moveTo(vertices[f[0]].x, vertices[f[0]].y);
      for(let k=1;k<f.length;k++) ctx.lineTo(vertices[f[k]].x, vertices[f[k]].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
;
}

}


(function(){
  try{
    var e=document.getElementById('editCoord'); if(e){ (e.closest('label')||e.parentElement).style.display='none'; }
    var d=document.getElementById('delCoord'); if(d){ (d.closest('label')||d.parentElement).style.display='none'; }
  }catch(_){}
})();

