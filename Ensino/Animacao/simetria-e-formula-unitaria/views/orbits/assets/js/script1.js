const sceneCanvas = document.getElementById('sceneCanvas');
const renderCtx = sceneCanvas.getContext('2d');

const ui = {
  cellType: document.getElementById('cellType'),
  zoom: document.getElementById('zoom'),gV: document.getElementById('gV'), eV: document.getElementById('eV'),
  gFx: document.getElementById('gFx'), eFx: document.getElementById('eFx'),
  gFy: document.getElementById('gFy'), eFy: document.getElementById('eFy'),
  gFz: document.getElementById('gFz'), eFz: document.getElementById('eFz'),
  gEx: document.getElementById('gEx'), eEx: document.getElementById('eEx'),
  gEy: document.getElementById('gEy'), eEy: document.getElementById('eEy'),
  gEz: document.getElementById('gEz'), eEz: document.getElementById('eEz'),
  gC: document.getElementById('gC'), eC: document.getElementById('eC'),
  readout: document.getElementById('readout'),
};


function readCssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
const ELEM_COLORS = { A:readCssVar('--A')||'#93c5fd', B:readCssVar('--B')||'#facc15', C:readCssVar('--C')||'#ef4444', D:readCssVar('--D')||'#5b21b6' };
const STROKE_WIRE = readCssVar('--wire')||'#cbd5e1';

function tintHex(hex, p){
  try{
    const h = hex.replace('#','');
    let r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
    const f = (v)=> Math.max(0, Math.min(255, Math.round(v + (p<0 ? v*p : (255-v)*p))));
    r=f(r); g=f(g); b=f(b);
    return `rgb(${r},${g},${b})`;
  }catch{ return hex; }
}


let cameraState = { angleX:-0.9, angleY:0.9, angleZ:-0.2, dragging:false, lx:0, ly:0 };


function addVec(a,b){ return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
function scaleVec(k,v){ return [k*v[0], k*v[1], k*v[2]]; }
function rotateX(v,a){ const [x,y,z]=v; const c=Math.cos(a), s=Math.sin(a); return [x, c*y - s*z, s*y + c*z]; }
function rotateY(v,a){ const [x,y,z]=v; const c=Math.cos(a), s=Math.sin(a); return [c*x + s*z, y, -s*x + c*z]; }
function rotateZ(v,a){ const [x,y,z]=v; const c=Math.cos(a), s=Math.sin(a); return [c*x - s*y, s*x + c*y, z]; }
function projectPoint(p3, L){
  let p = rotateY(p3, cameraState.angleY); p = rotateX(p, cameraState.angleX); p = rotateZ(p, cameraState.angleZ);
  return {x:p[0]*L, y:p[1]*L, z:p[2]};
}


function buildTriclinicMetric(a,b,c, alphaDeg, betaDeg, gammaDeg){
  const deg = Math.PI/180;
  const ca = Math.cos(alphaDeg*deg), cb = Math.cos(betaDeg*deg), cg = Math.cos(gammaDeg*deg);
  const sg = Math.sin(gammaDeg*deg) || 1e-9;
  const ax=[a,0,0];
  const bx=[b*cg, b*sg, 0];
  const cx = c*cb;
  const cy = c*(Math.cos(alphaDeg*deg) - cb*cg)/sg;
  const cz = Math.sqrt(Math.max(0, c*c - cx*cx - cy*cy));
  return [[ax[0], bx[0], cx],[ax[1], bx[1], cy],[ax[2], bx[2], cz]];
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
function applyMetricToVector(M,v){ return [M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2],
                                 M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2],
                                 M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2]]; }


const REP = {
  V:  [[0,0,0]],
  Fx: [[0,0.5,0.5]],
  Fy: [[0.5,0,0.5]],
  Fz: [[0.5,0.5,0]],
  Ex: [[0.5,0,0]],
  Ey: [[0,0.5,0]],
  Ez: [[0,0,0.5]],
  C:  [[0.5,0.5,0.5]],
};

const V8 = [[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]];
const E12 = [[0,1],[0,2],[1,3],[2,3],[4,5],[4,6],[5,7],[6,7],[0,4],[1,5],[2,6],[3,7]];

function redrawScene(){
  const rect = sceneCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  if(sceneCanvas.width !== rect.width*dpr || sceneCanvas.height !== rect.height*dpr){
    sceneCanvas.width = rect.width*dpr; sceneCanvas.height = rect.height*dpr;
    renderCtx.setTransform(dpr,0,0,dpr,0,0);
  }
  renderCtx.clearRect(0,0,sceneCanvas.width,sceneCanvas.height);
  renderCtx.save(); renderCtx.translate(sceneCanvas.width/2, sceneCanvas.height/2);

  const L = 120 * (+ui.zoom.value);
  const M = getMetricForCell(ui.cellType.value);
  const N = 3;
  const mid = Math.floor(N/2);
  const centerNeg = [-(mid+0.5), -(mid+0.5), -(mid+0.5)];

  
  renderCtx.strokeStyle = STROKE_WIRE;
  renderCtx.lineWidth = 4;
  for(let i=0;i<N;i++){
    for(let j=0;j<N;j++){
      for(let k=0;k<N;k++){
        const off = [i,j,k];
        const verts = V8.map(v=>applyMetricToVector(M, addVec(addVec(v,off), centerNeg))).map(p=>projectPoint(p,L));
        renderCtx.beginPath();
        for(const [a,b] of E12){ const A=verts[a], B=verts[b]; renderCtx.moveTo(A.x,A.y); renderCtx.lineTo(B.x,B.y); }
        renderCtx.stroke();
      }
    }
  }

  
  const off0 = [mid,mid,mid];
  const verts0 = V8.map(v=>applyMetricToVector(M, addVec(addVec(v,off0), centerNeg))).map(p=>projectPoint(p,L));
  renderCtx.lineWidth = 6; renderCtx.strokeStyle = '#22c55e';
  renderCtx.beginPath(); for(const [a,b] of E12){ const A=verts0[a], B=verts0[b]; renderCtx.moveTo(A.x,A.y); renderCtx.lineTo(B.x,B.y); } renderCtx.stroke();

  
  function drawAtomSphere(P, radius, fillHex, outlineCss){
    const p = projectPoint(P, L);
    const R = radius;
    const grad = renderCtx.createRadialGradient(p.x - R*0.4, p.y - R*0.4, R*0.1, p.x, p.y, R);
    grad.addColorStop(0, tintHex(fillHex, +0.55));
    grad.addColorStop(0.35, fillHex);
    grad.addColorStop(1, tintHex(fillHex, -0.45));
    renderCtx.fillStyle = grad; renderCtx.beginPath(); renderCtx.arc(p.x,p.y,R,0,Math.PI*2); renderCtx.fill();
    renderCtx.lineWidth = 4.8; renderCtx.strokeStyle = readCssVar(outlineCss); renderCtx.stroke();
  }

  const R = 10;
  
  function replicateOrbitGroup(list, fillHex, outlineCss){
    const EPS = 1e-6;
    for(const r of list){
      
      
      const iMax = (Math.abs(r[0])<EPS || Math.abs(r[0]-1)<EPS) ? N : (N-1);
      const jMax = (Math.abs(r[1])<EPS || Math.abs(r[1]-1)<EPS) ? N : (N-1);
      const kMax = (Math.abs(r[2])<EPS || Math.abs(r[2]-1)<EPS) ? N : (N-1);
      for(let i=0;i<=iMax;i++)for(let j=0;j<=jMax;j++)for(let k=0;k<=kMax;k++){
        const P = applyMetricToVector(M, addVec(addVec(r, [i,j,k]), centerNeg));
        drawAtomSphere(P, R, fillHex, outlineCss);
      }
    }
  }

  
  if(ui.gV.checked) replicateOrbitGroup(REP.V, ELEM_COLORS[ui.eV.value], '--vtx');
  
  if(ui.gFx.checked) replicateOrbitGroup(REP.Fx, ELEM_COLORS[ui.eFx.value], '--face');
  if(ui.gFy.checked) replicateOrbitGroup(REP.Fy, ELEM_COLORS[ui.eFy.value], '--face');
  if(ui.gFz.checked) replicateOrbitGroup(REP.Fz, ELEM_COLORS[ui.eFz.value], '--face');
  
  if(ui.gEx.checked) replicateOrbitGroup(REP.Ex, ELEM_COLORS[ui.eEx.value], '--edge');
  if(ui.gEy.checked) replicateOrbitGroup(REP.Ey, ELEM_COLORS[ui.eEy.value], '--edge');
  if(ui.gEz.checked) replicateOrbitGroup(REP.Ez, ELEM_COLORS[ui.eEz.value], '--edge');
  
  if(ui.gC.checked) replicateOrbitGroup(REP.C, ELEM_COLORS[ui.eC.value], '--center');

  renderCtx.restore();

  
  const tally = {};
  function sumOrbitContribution(el,n){ if(!tally[el]) tally[el]=0; tally[el]+=n; }
  let total = 0;
  if(ui.gV.checked){ total += 1; sumOrbitContribution(ui.eV.value, 1); }
  if(ui.gFx.checked){ total += 1; sumOrbitContribution(ui.eFx.value, 1); }
  if(ui.gFy.checked){ total += 1; sumOrbitContribution(ui.eFy.value, 1); }
  if(ui.gFz.checked){ total += 1; sumOrbitContribution(ui.eFz.value, 1); }
  if(ui.gEx.checked){ total += 1; sumOrbitContribution(ui.eEx.value, 1); }
  if(ui.gEy.checked){ total += 1; sumOrbitContribution(ui.eEy.value, 1); }
  if(ui.gEz.checked){ total += 1; sumOrbitContribution(ui.eEz.value, 1); }
  if(ui.gC.checked){ total += 1; sumOrbitContribution(ui.eC.value, 1); }

  
  const entries = Object.entries(tally);
  const nums = entries.map(([el,x]) => Math.round(x*8)); 
  const gcd = (a,b)=>b?gcd(b,a%b):a;
  const mdc = (nums.length?nums.reduce((a,b)=>gcd(a,b)):1) || 1;
  const red = entries.map(([el,x],i)=>[el, Math.round(x*8)/mdc]);
  const fmt = red.sort((a,b)=>a[0].localeCompare(b[0])).map(([el,x])=> el + (x!==1?`<sub>${x}</sub>`:'')).join('');

  ui.readout.innerHTML = `
    <div class="grid2">
      <div>
        <div>Vértices (1/8): ${ui.gV.checked?'<b>1</b>':'0'} &nbsp; | &nbsp; Faces (1/2): ${['gFx','gFy','gFz'].filter(k=>ui[k].checked).length}</div>
        <div>Arestas (1/4): ${['gEx','gEy','gEz'].filter(k=>ui[k].checked).length} &nbsp; | &nbsp; Centro (1): ${ui.gC.checked?'<b>1</b>':'0'}</div>
      </div>
      <div>
        <div>Total de átomos por célula: <b>${total}</b></div>
        <div>Fórmula (por conjuntos): <b class="mono">${fmt || '—'}</b></div>
      </div>
    </div>`;
}


Object.values(ui).forEach(el=>{
  if(!el || !el.addEventListener) return;
  el.addEventListener('change', redrawScene);
  el.addEventListener('input', redrawScene);
});

sceneCanvas.addEventListener('mousedown', e=>{ cameraState.dragging=true; cameraState.lx=e.clientX; cameraState.ly=e.clientY; });
window.addEventListener('mouseup', ()=> cameraState.dragging=false);
window.addEventListener('mousemove', e=>{
  if(!cameraState.dragging) return;
  const dx = e.clientX - cameraState.lx, dy = e.clientY - cameraState.ly;
  cameraState.lx = e.clientX; cameraState.ly = e.clientY;
  cameraState.angleY += dx*0.01; cameraState.angleX += dy*0.01;
  redrawScene();
});

sceneCanvas.addEventListener('touchstart', e=>{ const t=e.touches[0]; cameraState.dragging=true; cameraState.lx=t.clientX; cameraState.ly=t.clientY; });
sceneCanvas.addEventListener('touchmove', e=>{ if(!cameraState.dragging) return; const t=e.touches[0]; const dx=t.clientX-cameraState.lx, dy=t.clientY-cameraState.ly; cameraState.lx=t.clientX; cameraState.ly=t.clientY; cameraState.angleY += dx*0.01; cameraState.angleX += dy*0.01; redrawScene(); });
sceneCanvas.addEventListener('touchend', ()=> cameraState.dragging=false);
sceneCanvas.addEventListener('touchcancel', ()=> cameraState.dragging=false);
sceneCanvas.addEventListener('wheel', e=>{
  e.preventDefault();
  const z = Math.max(0.6, Math.min(2, (+ui.zoom.value - e.deltaY*0.0015)));
  ui.zoom.value = z.toFixed(2); redrawScene();
},{passive:false});
window.addEventListener('keydown', e=>{
  if(e.key==='d' || e.key==='D'){ cameraState.angleX=-0.9; cameraState.angleY=0.9; cameraState.angleZ=-0.2; ui.zoom.value=1.0; redrawScene(); }
});


(function fitViewOnce(){
  const rect = sceneCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  sceneCanvas.width = rect.width*dpr; sceneCanvas.height = (window.innerHeight-100)*dpr;
  renderCtx.setTransform(dpr,0,0,dpr,0,0);
})();
redrawScene();
