const sceneCanvas = document.getElementById('sceneCanvas');
const renderCtx = sceneCanvas.getContext('2d');

const ui = {
  cellType: document.getElementById('cellType'),
  preset: document.getElementById('preset'),
  zoom: document.getElementById('zoom'),
  tx: document.getElementById('tx'),
  ty: document.getElementById('ty'),
  tz: document.getElementById('tz'),
  symV: document.getElementById('symV'),
  symE: document.getElementById('symE'),
  symF: document.getElementById('symF'),
  symC: document.getElementById('symC'),
  readout: document.getElementById('readout'),
  showLattice: document.getElementById('showLattice'),
};

function readCssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
const ELEM_COLORS = { A: readCssVar('--A')||'#93c5fd', B: readCssVar('--B')||'#facc15', C: readCssVar('--C')||'#ef4444', D: readCssVar('--D')||'#5b21b6' };


let cameraState = {
  angleX: -0.9, angleY: 0.9, angleZ: -0.2, dragging:false, lastX:0, lastY:0,
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
  const sg = Math.sin(gammaDeg*deg) || 1e-9;
  const ax=[a,0,0];
  const bx=[b*cg, b*sg, 0];
  const cx = c*cb;
  const cy = c*(ca - cb*cg)/sg;
  const cz = Math.sqrt(Math.max(0, c*c - cx*cx - cy*cy));
  return [[ax[0], bx[0], cx],
          [ax[1], bx[1], cy],
          [ax[2], bx[2], cz]];
}
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
const FRAC = { vtx:1/8, edge:1/4, face:1/2, center:1 };

const CENTER = [0.5,0.5,0.5];


function getPositionsFromOrigin(tx,ty,tz){
  const vtx=[ [tx,ty,tz],[tx+1,ty,tz],[tx,ty+1,tz],[tx+1,ty+1,tz], [tx,ty,tz+1],[tx+1,ty,tz+1],[tx,ty+1,tz+1],[tx+1,ty+1,tz+1] ];
  const face=[ [tx+0.5,ty+0.5,tz],[tx+0.5,ty+0.5,tz+1],[tx+0.5,ty,tz+0.5],[tx+0.5,ty+1,tz+0.5],[tx,ty+0.5,tz+0.5],[tx+1,ty+0.5,tz+0.5] ];
  const edge=[ [tx+0.5,ty,tz],[tx,ty+0.5,tz],[tx+0.5,ty+1,tz],[tx+1,ty+0.5,tz],
               [tx+0.5,ty,tz+1],[tx,ty+0.5,tz+1],[tx+0.5,ty+1,tz+1],[tx+1,ty+0.5,tz+1],
               [tx,ty,tz+0.5],[tx+1,ty,tz+0.5],[tx,ty+1,tz+0.5],[tx+1,ty+1,tz+0.5] ];
  const center=[ [tx+0.5,ty+0.5,tz+0.5] ];
  return {vtx,face,edge,center};
}


function getPresetAtoms(name){
  if(name==='sc')  return { vtx:true, edge:false, face:false, center:false };
  if(name==='bcc') return { vtx:true, edge:false, face:false, center:true };
  if(name==='fcc') return { vtx:true, edge:false, face:true, center:false };
  return { vtx:true, edge:true, face:true, center:true }; 
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
  const tx = +ui.tx.value, ty = +ui.ty.value, tz = +ui.tz.value;
  const R = 12; 

  
  const showLattice = !!(ui.showLattice && ui.showLattice.checked);

  if(!showLattice){
    
    renderCtx.fillStyle = '#64748b';
    for(let i=-1;i<=2;i++) for(let j=-1;j<=2;j++) for(let k=-1;k<=2;k++){
      const p = projectPoint(applyMetricToVector(M,[i- CENTER[0], j- CENTER[1], k- CENTER[2]]), L);
      renderCtx.beginPath(); renderCtx.arc(p.x, p.y, 2, 0, Math.PI*2); renderCtx.fill();
    }
  }else{
    
    const presetL = getPresetAtoms(ui.preset.value);
    const RANGE = 1; 

    
    renderCtx.save();
    renderCtx.globalAlpha = 0.22;
    renderCtx.lineWidth = 2.2;
    renderCtx.strokeStyle = readCssVar('--outline') || '#334155';
    for(let ox=-RANGE; ox<=RANGE; ox++) for(let oy=-RANGE; oy<=RANGE; oy++) for(let oz=-RANGE; oz<=RANGE; oz++){
      const vv = VERTS_FRAC
        .map(v=>[v[0]+ox - CENTER[0], v[1]+oy - CENTER[1], v[2]+oz - CENTER[2]])
        .map(v=>applyMetricToVector(M,v))
        .map(p=>projectPoint(p,L));
      renderCtx.beginPath();
      for(const [i,j] of EDGES_IDX){ const a=vv[i], b=vv[j]; renderCtx.moveTo(a.x,a.y); renderCtx.lineTo(b.x,b.y); }
      renderCtx.stroke();
    }
    renderCtx.restore();

    
    function collectCategoryPoints(cat){
      const set = new Set();
      const out = [];
      for(let ox=-RANGE; ox<=RANGE; ox++) for(let oy=-RANGE; oy<=RANGE; oy++) for(let oz=-RANGE; oz<=RANGE; oz++){
        const arr = getPositionsFromOrigin(ox,oy,oz)[cat];
        for(const p of arr){
          const key = `${Math.round(p[0]*2)},${Math.round(p[1]*2)},${Math.round(p[2]*2)}`;
          if(set.has(key)) continue;
          set.add(key);
          out.push(p);
        }
      }
      return out;
    }

    renderCtx.save();
    renderCtx.globalAlpha = 0.25;
    if(presetL.vtx)   drawAtomGroup(collectCategoryPoints('vtx'),   '--wire', ui.symV.value);
    if(presetL.edge)  drawAtomGroup(collectCategoryPoints('edge'),  '--wire', ui.symE.value);
    if(presetL.face)  drawAtomGroup(collectCategoryPoints('face'),  '--wire', ui.symF.value);
    if(presetL.center)drawAtomGroup(collectCategoryPoints('center'),'--wire', ui.symC.value);
    renderCtx.restore();
  }


  const verts = VERTS_FRAC.map(v=>[v[0]+tx - CENTER[0], v[1]+ty - CENTER[1], v[2]+tz - CENTER[2]]).map(v=>applyMetricToVector(M,v)).map(p=>projectPoint(p,L));
  renderCtx.lineWidth = 4; renderCtx.strokeStyle = readCssVar('--wire')||'#cbd5e1';
  renderCtx.beginPath();
  for(const [i,j] of EDGES_IDX){ const a=verts[i], b=verts[j]; renderCtx.moveTo(a.x,a.y); renderCtx.lineTo(b.x,b.y); }
  renderCtx.stroke();

  
  const pos = getPositionsFromOrigin(tx,ty,tz);
  const preset = getPresetAtoms(ui.preset.value);

  
  function tintHex(hex, p){
    try{
      const h = hex.replace('#','');
      let r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
      const f = v=> Math.max(0, Math.min(255, Math.round(v + (p<0 ? v*p : (255-v)*p))));
      return `rgb(${f(r)},${f(g)},${f(b)})`;
    }catch{ return hex; }
  }
  function drawAtomGroup(list, strokeCssVar, elemSym){
    const fillHex = ELEM_COLORS[elemSym] || '#ffffff';
    const strokeCol = readCssVar(strokeCssVar) || '#ffffff';
    renderCtx.lineWidth = 4.8;
    for(const f of list){
      const p = projectPoint(applyMetricToVector(M, [f[0]-CENTER[0], f[1]-CENTER[1], f[2]-CENTER[2]]), L);
      const grad = renderCtx.createRadialGradient(p.x - R*0.4, p.y - R*0.4, R*0.1, p.x, p.y, R);
      grad.addColorStop(0, tintHex(fillHex, +0.55));
      grad.addColorStop(0.35, fillHex);
      grad.addColorStop(1, tintHex(fillHex, -0.45));
      renderCtx.fillStyle = grad;
      renderCtx.beginPath(); renderCtx.arc(p.x, p.y, R, 0, Math.PI*2); renderCtx.fill();
      renderCtx.strokeStyle = strokeCol; renderCtx.stroke();
    }
  }

  if(preset.vtx)   drawAtomGroup(pos.vtx,   '--vtx',   ui.symV.value);
  if(preset.edge)  drawAtomGroup(pos.edge,  '--edge',  ui.symE.value);
  if(preset.face)  drawAtomGroup(pos.face,  '--face',  ui.symF.value);
  if(preset.center)drawAtomGroup(pos.center,'--center',ui.symC.value);

  renderCtx.restore();

  
  const FR = { vtx:1/8, edge:1/4, face:1/2, center:1 };
  const counts = {
    vtx:   (preset.vtx   ? 8*FR.vtx   : 0),
    edge:  (preset.edge  ? 12*FR.edge : 0),
    face:  (preset.face  ? 6*FR.face  : 0),
    center:(preset.center? 1*FR.center: 0),
  };
  const total = counts.vtx + counts.edge + counts.face + counts.center;

  
  const tally = {};
  function appendVerticalNote(sym, amount){ if(!tally[sym]) tally[sym]=0; tally[sym]+=amount; }
  if(preset.vtx)   appendVerticalNote(ui.symV.value, 8*FR.vtx);
  if(preset.edge)  appendVerticalNote(ui.symE.value,12*FR.edge);
  if(preset.face)  appendVerticalNote(ui.symF.value, 6*FR.face);
  if(preset.center)appendVerticalNote(ui.symC.value, 1*FR.center);

  const entries = Object.entries(tally);
  const mult = 8; 
  const nums = entries.map(([el,x]) => Math.round(x*mult));
  const g = (a,b)=>b?g(b,a%b):a;
  const mdc = nums.length? nums.reduce((acc,v)=>g(acc,v)) : 1;
  const red = entries.map(([el,x])=>[el, Math.round(x*mult)/mdc]);
  const fmt = red.sort((a,b)=>a[0].localeCompare(b[0])).map(([el,x])=> el + (x!==1 ? String(x) : "") ).join("");

  ui.readout.innerHTML = `
    <div class="grid2">
      <div>
        <div><span class="thin">Translação:</span> (x=${tx.toFixed(2)}, y=${ty.toFixed(2)}, z=${tz.toFixed(2)})</div>
        <div><span class="thin">Vértices:</span> 8 × ⅛ = <b>${(preset.vtx?1:0).toFixed(3)}</b></div>
        <div><span class="thin">Arestas:</span> 12 × ¼ = <b>${(preset.edge?3:0).toFixed(3)}</b></div>
        <div><span class="thin">Faces:</span> 6 × ½ = <b>${(preset.face?3:0).toFixed(3)}</b></div>
        <div><span class="thin">Centro:</span> 1 × 1 = <b>${(preset.center?1:0).toFixed(3)}</b></div>
      </div>
      <div>
        <div><span class="thin">Total de átomos/célula:</span> <b>${total.toFixed(3)}</b></div>
        <div><span class="thin">Fórmula (elementos):</span> <b class="mono">${fmt || '—'}</b></div>
        <div class="thin" style="margin-top:6px;color:#9ca3af">Observação: a contagem é <b>invariante</b> por translação. Mover a célula não altera a fórmula.</div>
      </div>
    </div>
  `;
}


for(const id of ['cellType','preset','zoom','tx','ty','tz','symV','symE','symF','symC','showLattice'])
  ui[id].addEventListener('input', redrawScene);


sceneCanvas.addEventListener('mousedown', e=>{ cameraState.dragging=true; cameraState.lastX=e.clientX; cameraState.lastY=e.clientY; });
window.addEventListener('mouseup', ()=> cameraState.dragging=false);
window.addEventListener('mousemove', e=>{
  if(!cameraState.dragging) return; const dx=e.clientX-cameraState.lastX, dy=e.clientY-cameraState.lastY;
  cameraState.lastX=e.clientX; cameraState.lastY=e.clientY; cameraState.angleY += dx*0.01; cameraState.angleX += dy*0.01; redrawScene();
});
sceneCanvas.addEventListener('touchstart', e=>{ const t=e.touches[0]; cameraState.dragging=true; cameraState.lastX=t.clientX; cameraState.lastY=t.clientY; });
sceneCanvas.addEventListener('touchmove', e=>{ if(!cameraState.dragging) return; const t=e.touches[0]; const dx=t.clientX-cameraState.lastX, dy=t.clientY-cameraState.lastY; cameraState.lastX=t.clientX; cameraState.lastY=t.clientY; cameraState.angleY+=dx*0.01; cameraState.angleX+=dy*0.01; redrawScene(); });
sceneCanvas.addEventListener('touchend', ()=> cameraState.dragging=false);

window.addEventListener('keydown', e=>{ if(e.key==='d' || e.key==='D'){ cameraState.angleX=-0.9; cameraState.angleY=0.9; cameraState.angleZ=-0.2; redrawScene(); } });


function fitSceneOnce(){
  const dpr = window.devicePixelRatio || 1;
  const rect = sceneCanvas.getBoundingClientRect();
  sceneCanvas.width = rect.width * dpr;
  sceneCanvas.height = (window.innerHeight - 100) * dpr;
  renderCtx.setTransform(dpr,0,0,dpr,0,0);
}
fitSceneOnce(); redrawScene();
