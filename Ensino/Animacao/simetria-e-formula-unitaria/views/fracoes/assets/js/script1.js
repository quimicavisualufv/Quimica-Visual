const sceneCanvas = document.getElementById('sceneCanvas');
const renderCtx = sceneCanvas.getContext('2d');

const ui = {
  cellType: document.getElementById('cellType'),
  preset: document.getElementById('preset'),zoom: document.getElementById('zoom'),symV: document.getElementById('symV'),
  symE: document.getElementById('symE'),
  symF: document.getElementById('symF'),
  symC: document.getElementById('symC'),
  readout: document.getElementById('readout'),
};


const COLORS = { vtx:'var(--vtx)', edge:'var(--edge)', face:'var(--face)', center:'var(--center)' };
const STROKE = '#cbd5e1';



function readCssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }


const ELEM_COLORS = { A:'#93c5fd', B:'#facc15', C:'#ef4444', D:'#5b21b6' };


function tintHex(hex, p){
  try{
    const h = hex.replace('#','');
    let r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
    const f = (v)=> Math.max(0, Math.min(255, Math.round(v + (p<0 ? v*p : (255-v)*p))));
    r=f(r); g=f(g); b=f(b);
    return `rgb(${r},${g},${b})`;
  }catch{ return hex; }
}

let cameraState = {
  angleX: -0.9, angleY: 0.9, angleZ: -0.2,
  distance: 3.2, 
  dragging:false, lastX:0, lastY:0,
};


function addVec(a,b){ return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
function subtractVec(a,b){ return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function scaleVec(k,v){ return [k*v[0], k*v[1], k*v[2]]; }

function rotateX(v,a){ const [x,y,z]=v; const c=Math.cos(a), s=Math.sin(a); return [x, c*y - s*z, s*y + c*z]; }
function rotateY(v,a){ const [x,y,z]=v; const c=Math.cos(a), s=Math.sin(a); return [c*x + s*z, y, -s*x + c*z]; }
function rotateZ(v,a){ const [x,y,z]=v; const c=Math.cos(a), s=Math.sin(a); return [c*x - s*y, s*x + c*y, z]; }

function projectPoint(p3, L){
  let p = rotateY(p3, cameraState.angleY);
  p = rotateX(p, cameraState.angleX);
  p = rotateZ(p, cameraState.angleZ);
  
  return {x: p[0]*L, y: p[1]*L, z:p[2], s:1};
}



function buildTriclinicMetric(a,b,c, alphaDeg, betaDeg, gammaDeg){
  const deg = Math.PI/180;
  const ca = Math.cos(alphaDeg*deg), cb = Math.cos(betaDeg*deg), cg = Math.cos(gammaDeg*deg);
  const sg = Math.sin(gammaDeg*deg);
  
  const ax=[a,0,0];
  const bx=[b*cg, b*sg, 0];
  
  const cx = c*cb;
  const cy = c*(ca - cb*cg)/safeEpsilon(sg);
  const cz_sq = c*c - cx*cx - cy*cy;
  const cz = (cz_sq>0) ? Math.sqrt(cz_sq) : 0;
  return [[ax[0], bx[0], cx],
          [ax[1], bx[1], cy],
          [ax[2], bx[2], cz]];
}
function safeEpsilon(x){ return Math.abs(x)<1e-9 ? (x<0?-1e-9:1e-9) : x; }

function getMetricForCell(type){
  switch(type){
    case 'cubic':        return buildTriclinicMetric(1,1,1, 90,90,90);
    case 'tetragonal':   return buildTriclinicMetric(1,1,1.35, 90,90,90);
    case 'orthorhombic': return buildTriclinicMetric(1.2,0.9,1.35, 90,90,90);
    case 'hexagonal':    return buildTriclinicMetric(1,1,1.2, 90,90,120);
    case 'rhombohedral': return buildTriclinicMetric(1,1,1, 75,75,75); 
    case 'monoclinic':   return buildTriclinicMetric(1.2,1.0,1.35, 90,105,90); 
    case 'triclinic':    return buildTriclinicMetric(1.2,0.95,1.1, 78,75,82);  
    default:             return buildTriclinicMetric(1,1,1, 90,90,90);
  }
}


function applyMetricToVector(M, v){ return [ M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2],
                                   M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2],
                                   M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2] ]; }


const VERTS_FRAC = [
  [0,0,0],[1,0,0],[0,1,0],[1,1,0],
  [0,0,1],[1,0,1],[0,1,1],[1,1,1]
];


const EDGES_IDX = [
  [0,1],[0,2],[1,3],[2,3], 
  [4,5],[4,6],[5,7],[6,7], 
  [0,4],[1,5],[2,6],[3,7]  
];


const POS_FACE = [
  [0.5,0.5,0], [0.5,0.5,1],
  [0.5,0,0.5], [0.5,1,0.5],
  [0,0.5,0.5], [1,0.5,0.5]
];

const POS_BASE = [
  [0.5,0.5,0], [0.5,0.5,1]
];
const POS_EDGE = [
  [0.5,0,0], [0,0.5,0], [0.5,1,0], [1,0.5,0],
  [0.5,0,1], [0,0.5,1], [0.5,1,1], [1,0.5,1],
  [0,0,0.5], [1,0,0.5], [0,1,0.5], [1,1,0.5]
];
const POS_VTX = VERTS_FRAC.slice();
const POS_CENTER = [[0.5,0.5,0.5]];


const FRAC = { vtx:1/8, edge:1/4, face:1/2, center:1 };


const PRESETS_BY_SYSTEM = {
  triclinic: [
    {id:'p', label:'Primitiva (P)'}
  ],
  monoclinic: [
    {id:'p', label:'Primitiva (P)'},
    {id:'c', label:'Base centrada (C)'}
  ],
  orthorhombic: [
    {id:'p', label:'Primitiva (P)'},
    {id:'c', label:'Base centrada (C)'},
    {id:'i', label:'Corpo centrado (I)'},
    {id:'f', label:'Faces centradas (F)'}
  ],
  tetragonal: [
    {id:'p', label:'Primitiva (P)'},
    {id:'i', label:'Corpo centrado (I)'}
  ],
  hexagonal: [
    {id:'p', label:'Primitiva (P)'}
  ],
  rhombohedral: [
    {id:'p', label:'Primitiva (P)'}
  ],
  cubic: [
    {id:'p', label:'Primitiva (P)'},
    {id:'i', label:'Corpo centrado (I)'},
    {id:'f', label:'Faces centradas (F)'}
  ],
};

function refreshPresetOptions(){
  const sys = ui.cellType.value;
  const list = PRESETS_BY_SYSTEM[sys] || PRESETS_BY_SYSTEM.cubic;
  ui.preset.innerHTML = '';
  for(const it of list){
    const o = document.createElement('option');
    o.value = it.id;
    o.textContent = it.label;
    ui.preset.appendChild(o);
  }
  
  const allowed = list.map(x=>x.id);
  if(!allowed.includes(ui.preset.value)) ui.preset.value = list[0].id;
}

function getPresetAtoms(cellType, name){
  
  if(name==='p') return { vtx:true, edge:false, face:false, base:false, center:false };
  
  if(name==='c') return { vtx:true, edge:false, face:false, base:true, center:false };
  
  if(name==='i') return { vtx:true, edge:false, face:false, base:false, center:true };
  
  if(name==='f') return { vtx:true, edge:false, face:true, base:false, center:false };
  
  return { vtx:true, edge:false, face:false, base:false, center:false };
}


function redrawScene(){
  const rect = sceneCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  if(sceneCanvas.width !== rect.width*dpr || sceneCanvas.height !== rect.height*dpr){
    sceneCanvas.width = rect.width*dpr; sceneCanvas.height = rect.height*dpr;
    renderCtx.setTransform(dpr,0,0,dpr,0,0);
  }

  const w = sceneCanvas.clientWidth, h = sceneCanvas.clientHeight;
  const L = 240 * (+ui.zoom.value);
  renderCtx.clearRect(0,0,sceneCanvas.width, sceneCanvas.height);
  renderCtx.save(); renderCtx.translate(sceneCanvas.width/2, sceneCanvas.height/2);

  
  const M = getMetricForCell(ui.cellType.value);

  
  const verts = VERTS_FRAC.map(v=>applyMetricToVector(M,[v[0]-0.5,v[1]-0.5,v[2]-0.5])).map(p=>projectPoint(p, L));

  
  renderCtx.lineWidth = 4;
  renderCtx.strokeStyle = STROKE;
  renderCtx.beginPath();
  for(const [i,j] of EDGES_IDX){
    const a = verts[i], b = verts[j];
    renderCtx.moveTo(a.x, a.y); renderCtx.lineTo(b.x, b.y);
  }
  renderCtx.stroke();

  
  const preset = getPresetAtoms(ui.cellType.value, ui.preset.value);
  const R = 10; 

  const drawSiteGroup = (points, cssName, fillHex) => {
    renderCtx.save();
    const strokeCol = readCssVar(cssName) || '#ffffff';
    renderCtx.lineWidth = 4.8;
    for(const f of points){
      const p3 = applyMetricToVector(M, [f[0]-0.5,f[1]-0.5,f[2]-0.5]);
      const p = projectPoint(p3, L);
      
      const R0 = R;
      const grad = renderCtx.createRadialGradient(p.x - R0*0.4, p.y - R0*0.4, R0*0.1, p.x, p.y, R0);
      grad.addColorStop(0, tintHex(fillHex, +0.55));
      grad.addColorStop(0.35, fillHex);
      grad.addColorStop(1, tintHex(fillHex, -0.45));
      renderCtx.fillStyle = grad;
      renderCtx.beginPath(); renderCtx.arc(p.x, p.y, R0, 0, Math.PI*2);
      renderCtx.fill();
      
      renderCtx.strokeStyle = strokeCol;
      renderCtx.stroke();
    }
    renderCtx.restore();
  };

  if(preset.vtx)  drawSiteGroup(POS_VTX, '--vtx', ELEM_COLORS[ui.symV.value]);
  if(preset.edge) drawSiteGroup(POS_EDGE, '--edge', ELEM_COLORS[ui.symE.value]);
  if(preset.face) drawSiteGroup(POS_FACE, '--face', ELEM_COLORS[ui.symF.value]);
  if(preset.base) drawSiteGroup(POS_BASE, '--face', ELEM_COLORS[ui.symF.value]);
  if(preset.center) drawSiteGroup(POS_CENTER, '--center', ELEM_COLORS[ui.symC.value]);

  renderCtx.restore();

  
  function countEnabledSites(set){
    const nv = set.vtx ? POS_VTX.length : 0;
    const ne = set.edge ? POS_EDGE.length : 0;
    const nf = (set.face ? POS_FACE.length : 0) + (set.base ? POS_BASE.length : 0);
    const nc = set.center ? POS_CENTER.length : 0;
    const total = nv*FRAC.vtx + ne*FRAC.edge + nf*FRAC.face + nc*FRAC.center;
    return {nv,ne,nf,nc,total};
  }
  const c = countEnabledSites(preset);
  
  const sym = { v: ui.symV.value, e: ui.symE.value, f: ui.symF.value, c: ui.symC.value };
  
  const tally = {};
  function addVec(el, amount){ if(!tally[el]) tally[el]=0; tally[el]+=amount; }
  if(preset.vtx)  addVec(sym.v, POS_VTX.length * FRAC.vtx);
  if(preset.edge) addVec(sym.e, POS_EDGE.length * FRAC.edge);
  if(preset.face) addVec(sym.f, POS_FACE.length * FRAC.face);
  if(preset.base) addVec(sym.f, POS_BASE.length * FRAC.face);
  if(preset.center) addVec(sym.c, POS_CENTER.length * FRAC.center);

  
  const entries = Object.entries(tally);
  const mult = 8; 
  const nums = entries.map(([el,x]) => Math.round(x*mult));
  const g = (a,b)=>b?g(b,a%b):a;
  const mdc = nums.reduce((acc,v)=>g(acc,v), nums[0]||1) || 1;
  const red = entries.map(([el,x],i)=>[el, Math.round(x*mult)/mdc]);
  const fmt = red.map(([el,x])=> el + (x!==1 ? "<subtractVec>"+x+"</subtractVec>" : "") ).join("");

  ui.readout.innerHTML = `
    <div class="grid2">
      <div>
        <div><span class="thin">Vértices:</span> <b>${c.nv}</b> × ⅛ = <b>${(c.nv*FRAC.vtx).toFixed(3)}</b></div>
        <div><span class="thin">Arestas:</span> <b>${c.ne}</b> × ¼ = <b>${(c.ne*FRAC.edge).toFixed(3)}</b></div>
        <div><span class="thin">Faces (centradas):</span> <b>${c.nf}</b> × ½ = <b>${(c.nf*FRAC.face).toFixed(3)}</b></div>
        <div><span class="thin">Centro:</span> <b>${c.nc}</b> × 1 = <b>${(c.nc*FRAC.center).toFixed(3)}</b></div>
      </div>
      <div>
        <div><span class="thin">Total de átomos na célula:</span> <b>${c.total.toFixed(3)}</b></div>
        <div><span class="thin">Fórmula (elementos atribuídos):</span> <b class="mono">${fmt || '—'}</b></div>
      </div>
    </div>
  `;
}


ui.cellType.addEventListener('change',()=>{ refreshPresetOptions(); redrawScene(); });
ui.preset.addEventListener('change',()=>redrawScene());
ui.zoom.addEventListener('input',()=>redrawScene());
for(const k of ['symV','symE','symF','symC']) ui[k].addEventListener('change',redrawScene);


refreshPresetOptions();


sceneCanvas.addEventListener('mousedown', e=>{ cameraState.dragging=true; cameraState.lastX=e.clientX; cameraState.lastY=e.clientY; });
window.addEventListener('mouseup', ()=> cameraState.dragging=false);
window.addEventListener('mousemove', e=>{
  if(!cameraState.dragging) return;
  const dx = e.clientX - cameraState.lastX, dy = e.clientY - cameraState.lastY;
  cameraState.lastX = e.clientX; cameraState.lastY = e.clientY;
  cameraState.angleY += dx * 0.01;
  cameraState.angleX += dy * 0.01;
  redrawScene();
});

sceneCanvas.addEventListener('touchstart', e=>{
  const t=e.touches[0]; cameraState.dragging=true; cameraState.lastX=t.clientX; cameraState.lastY=t.clientY;
});
sceneCanvas.addEventListener('touchmove', e=>{
  if(!cameraState.dragging) return;
  const t=e.touches[0]; const dx=t.clientX-cameraState.lastX, dy=t.clientY-cameraState.lastY;
  cameraState.lastX=t.clientX; cameraState.lastY=t.clientY;
  cameraState.angleY += dx*0.01; cameraState.angleX += dy*0.01; redrawScene();
});
sceneCanvas.addEventListener('touchend', ()=> cameraState.dragging=false);


sceneCanvas.addEventListener('wheel', e=>{
  e.preventDefault();
  const z = Math.max(0.6, Math.min(2, (+ui.zoom.value - e.deltaY*0.0015)));
  ui.zoom.value = z.toFixed(2); redrawScene();
}, {passive:false});


window.addEventListener('keydown', e=>{
  if(e.key==='d' || e.key==='D'){
    cameraState.angleX=-0.9; cameraState.angleY=0.9; cameraState.angleZ=-0.2; ui.zoom.value=1.0; redrawScene();
  }
});


function fitSceneOnce(){
  const dpr = window.devicePixelRatio || 1;
  const rect = sceneCanvas.getBoundingClientRect();
  sceneCanvas.width = rect.width * dpr;
  sceneCanvas.height = (window.innerHeight - 100) * dpr;
  renderCtx.setTransform(dpr,0,0,dpr,0,0);
}
fitSceneOnce();
redrawScene();
