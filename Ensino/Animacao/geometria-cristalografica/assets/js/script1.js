



const canvas = document.getElementById('viewport');
const ctx = canvas.getContext('2d');

let W = 0, H = 0, DPR = Math.max(1, Math.min(2, window.devicePixelRatio||1));
function resize(){
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = Math.floor(W*DPR); canvas.height = Math.floor(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  draw();
}
window.addEventListener('resize', resize);

function toRad(deg){ return deg*Math.PI/180; }
function toDeg(rad){ return Math.round(rad*180/Math.PI); }

let rotX = 0, rotY = 0, rotZ = 0, zoom = 0.6, offset = {x:0, y:0}; 
let model = { vertices: [], edges: [], faces: [] };
let edgeFaceMap = null;
let autoFitOnLoad = true;

const camera = { dist: 6.0, fov: 1.2 };
function project([x,y,z]){
  const zc = z + camera.dist;
  const f = 1 / (camera.fov * (zc === 0 ? 1e-6 : zc));
  return [ x * f * H, -y * f * H ];
}

function rotatePoint(p, ax, ay, az){
  let [x,y,z] = p;
  
  let cosy = Math.cos(ay), siny = Math.sin(ay);
  let x1 = x * cosy + z * siny;
  let z1 = -x * siny + z * cosy;
  
  let cosx = Math.cos(ax), sinx = Math.sin(ax);
  let y2 = y * cosx - z1 * sinx;
  let z2 = y * sinx + z1 * cosx;
  
  let cosz = Math.cos(az), sinz = Math.sin(az);
  let x3 = x1 * cosz - y2 * sinz;
  let y3 = x1 * sinz + y2 * cosz;
  return [x3, y3, z2];
}

function modelBounds(verts){
  let min=[Infinity,Infinity,Infinity], max=[-Infinity,-Infinity,-Infinity];
  for(const v of verts){
    for(let i=0;i<3;i++){
      if(v[i]<min[i]) min[i]=v[i];
      if(v[i]>max[i]) max[i]=v[i];
    }
  }
  const center = [(min[0]+max[0])/2, (min[1]+max[1])/2, (min[2]+max[2])/2];
  const radius = Math.max(max[0]-min[0], max[1]-min[1], max[2]-min[2]) / 2;
  return {min,max,center,radius};
}

let dragging=false, last={x:0,y:0}, draggingFromMouse=false;
canvas.addEventListener('mousedown', e=>{ dragging=true; last.x=e.clientX; last.y=e.clientY; draggingFromMouse=true; });
window.addEventListener('mouseup', ()=> dragging=false);
window.addEventListener('mousemove', e=>{
  if(!dragging) return;
  const dx = (e.clientX - last.x)/H;
  const dy = (e.clientY - last.y)/H;
  rotY += dx * 4.0;
  rotX += dy * 4.0;
  last.x = e.clientX; last.y = e.clientY;
  updateSliderLabels(true);
  draw();
});

canvas.addEventListener('wheel', e=>{
  e.preventDefault();
  const s = Math.exp(-e.deltaY * 0.001);
  zoom = Math.max(0.3, Math.min(5, zoom * s));
  draw();
},{passive:false});

window.addEventListener('keydown', e=>{ if(e.key==='r' || e.key==='R'){ resetView(); } });

document.getElementById('resetBtn').addEventListener('click', resetView);
document.getElementById('fitBtn').addEventListener('click', ()=>{ autoFitOnLoad = true; fitView(); draw(); });


const edgeColorInput = document.getElementById('edgeColor');
const fillEnableInput = document.getElementById('fillEnable');
const faceColorInput = document.getElementById('faceColor');
edgeColorInput.addEventListener('input', draw);
fillEnableInput.addEventListener('change', draw);
faceColorInput.addEventListener('input', draw);


const rx = document.getElementById('rx'), ry = document.getElementById('ry'), rz = document.getElementById('rz');
const rxv = document.getElementById('rxv'), ryv = document.getElementById('ryv'), rzv = document.getElementById('rzv');
let sliderChanging = false;
function updateSliderLabels(fromMouse=false){
  if(fromMouse){
    sliderChanging = true;
    rx.value = ((toDeg(rotX)+540)%360)-180;
    ry.value = ((toDeg(rotY)+540)%360)-180;
    rz.value = ((toDeg(rotZ)+540)%360)-180;
    sliderChanging = false;
  }
  rxv.textContent = `${rx.value}°`;
  ryv.textContent = `${ry.value}°`;
  rzv.textContent = `${rz.value}°`;
}
[rx,ry,rz].forEach((s,i)=>{
  s.addEventListener('input', ()=>{
    if(sliderChanging) return;
    if(i===0) rotX = toRad(Number(s.value));
    if(i===1) rotY = toRad(Number(s.value));
    if(i===2) rotZ = toRad(Number(s.value));
    updateSliderLabels();
    draw();
  });
});

function resetView(){
  
  rotX = 0; rotY = 0; rotZ = 0; zoom = 0.9; offset={x:0,y:0}; autoFitOnLoad=true;
  rx.value="0"; ry.value="0"; rz.value="0"; updateSliderLabels();
  fitView(); draw();
}

function fitView(){
  if(!model.vertices.length) return;
  const b = modelBounds(model.vertices);
  camera.dist = Math.max(4.0, 3.5 + b.radius * 0.6);
  
  zoom = Math.min(1.6, Math.max(0.3, (H * 0.069) / b.radius));
}

function normalizeEdge(i,j){ return i<j ? i+'-'+j : j+'-'+i; }

function buildEdgeFaceMap(faces){
  const map = new Map();
  for(let f=0; f<faces.length; f++){
    const cyc = faces[f];
    for(let k=0;k<cyc.length;k++){
      const i = cyc[k], j = cyc[(k+1)%cyc.length];
      const key = normalizeEdge(i,j);
      if(!map.has(key)) map.set(key, {i:Math.min(i,j), j:Math.max(i,j), faces:[]});
      map.get(key).faces.push(f);
    }
  }
  return map;
}

function draw(){
  ctx.clearRect(0,0,W,H);
  if(!model.vertices.length) return;

  const edgeColor = edgeColorInput.value || '#1B2140';
  const fillEnabled = fillEnableInput.checked;
  const faceColor = faceColorInput.value || '#7AA2FF';

  const b = modelBounds(model.vertices);
  const transformed = model.vertices.map(v => rotatePoint([v[0]-b.center[0], v[1]-b.center[1], v[2]-b.center[2]], rotX, rotY, rotZ));
  const proj = transformed.map(v => project([v[0]*zoom, v[1]*zoom, v[2]*zoom]));

  if(!edgeFaceMap) edgeFaceMap = buildEdgeFaceMap(model.faces || []);

  
  const faceInfo = (model.faces||[]).map((face, idx)=>{
    let cx=0, cy=0, cz=0;
    for(const i of face){ cx+=transformed[i][0]; cy+=transformed[i][1]; cz+=transformed[i][2]; }
    cx/=face.length; cy/=face.length; cz/=face.length;
    const p0 = transformed[face[0]], p1 = transformed[face[1]], p2 = transformed[face[2]];
    const u = [p1[0]-p0[0], p1[1]-p0[1], p1[2]-p0[2]];
    const v = [p2[0]-p0[0], p2[1]-p0[1], p2[2]-p0[2]];
    let n = [ u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0] ];
    const dotCenter = n[0]*cx + n[1]*cy + n[2]*cz;
    if(dotCenter < 0){ n = [-n[0], -n[1], -n[2]]; }
    const camPos = [0,0,-camera.dist];
    const viewVec = [camPos[0]-cx, camPos[1]-cy, camPos[2]-cz];
    const visible = (n[0]*viewVec[0] + n[1]*viewVec[1] + n[2]*viewVec[2]) > 0;
    let zsum=0; for(const i of face) zsum += transformed[i][2];
    return {face, idx, z: zsum/face.length, visible};
  }).sort((a,b)=> a.z - b.z);

  
  if(fillEnabled){
    ctx.lineWidth = 1;
    for(const f of faceInfo){
      if(!f.visible) continue;
      const arr = f.face;
      ctx.beginPath();
      for(let k=0;k<arr.length;k++){
        const [x,y] = proj[arr[k]];
        if(k===0) ctx.moveTo(W/2 + x + offset.x, H/2 + y + offset.y);
        else ctx.lineTo(W/2 + x + offset.x, H/2 + y + offset.y);
      }
      ctx.closePath();
      ctx.fillStyle = faceColor;
      ctx.fill();
    }
  }

  
  const visibleFaceSet = new Set(faceInfo.filter(f=>f.visible).map(f=>f.idx));
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = edgeColor;

  const edgesToDraw = [];
  edgeFaceMap.forEach((val, key)=>{
    const faces = val.faces || [];
    let drawEdge = false;
    for(const f of faces){ if(visibleFaceSet.has(f)){ drawEdge = true; break; } }
    if(drawEdge){ edgesToDraw.push([val.i, val.j]); }
  });

  const edgesZ = edgesToDraw.map(([i,j])=>{
    const z = (transformed[i][2] + transformed[j][2]) * 0.5;
    return {i,j,z};
  }).sort((a,b)=> a.z - b.z);

  for(const e of edgesZ){
    const [x1,y1] = proj[e.i]; const [x2,y2] = proj[e.j];
    ctx.beginPath(); ctx.moveTo(W/2 + x1 + offset.x, H/2 + y1 + offset.y);
    ctx.lineTo(W/2 + x2 + offset.x, H/2 + y2 + offset.y); ctx.stroke();
  }
}





function regularPolygon(n, r=1, phase=0, rx=1, ry=1){
  const pts=[];
  for(let k=0;k<n;k++){
    const th = phase + 2*Math.PI*k/n;
    pts.push([r*rx*Math.cos(th), r*ry*Math.sin(th)]);
  }
  return pts;
}

function makePrism(n=6, r=1, h=1.6, phase=0, rx=1, ry=1){
  const top = regularPolygon(n, r, phase, rx, ry).map(([x,y])=>[x,y,+h/2]);
  const bot = regularPolygon(n, r, phase, rx, ry).map(([x,y])=>[x,y,-h/2]);
  const vertices = [...top, ...bot];
  const edges = [];
  const faces = [];
  for(let i=0;i<n;i++){
    const ni = (i+1)%n;
    edges.push([i,ni]);
    edges.push([n+i, n+ni]);
    edges.push([i, n+i]);
  }
  faces.push([...Array(n).keys()].map(i=>i));               
  faces.push([...Array(n).keys()].map(i=>2*n-1-i));         
  for(let i=0;i<n;i++){
    const ni = (i+1)%n;
    faces.push([i, ni, n+ni, n+i]);
  }
  return {vertices, edges, faces};
}

function makePyramid(n=4, r=1, h=1.6, phase=0, rx=1, ry=1){
  const base = regularPolygon(n, r, phase, rx, ry).map(([x,y])=>[x,y,-h/2]);
  const apex = [0,0,+h/2];
  const vertices = [...base, apex];
  const edges = [];
  const faces = [];
  for(let i=0;i<n;i++){
    const ni = (i+1)%n;
    edges.push([i,ni]);
    edges.push([i, n]);
    faces.push([i, ni, n]);
  }
  faces.push([...Array(n).keys()].reverse());
  return {vertices, edges, faces};
}

function makeBiPyramid(n=4, r=1, h=1.8, phase=0, rx=1, ry=1){
  const ring = regularPolygon(n, r, phase, rx, ry).map(([x,y])=>[x,y,0]);
  const top = [0,0,+h/2], bot = [0,0,-h/2];
  const vertices = [...ring, top, bot];
  const edges = [];
  const faces = [];
  for(let i=0;i<n;i++){
    const ni = (i+1)%n;
    edges.push([i,ni]); edges.push([i, n]); edges.push([i, n+1]);
    faces.push([i, ni, n]);
    faces.push([i, n+1, ni]);
  }
  return {vertices, edges, faces};
}

function makeRectPrism(ax=1.8, ay=1.2, az=1.0){
  const x=ax/2, y=ay/2, z=az/2;
  const vertices=[];
  for(const X of [-x,x]) for(const Y of [-y,y]) for(const Z of [-z,z]) vertices.push([X,Y,Z]);
  const edges=[[0,1],[0,2],[0,4],[3,1],[3,2],[3,7],[5,1],[5,4],[5,7],[6,2],[6,4],[6,7]];
  const faces=[
    [0,1,3,2],
    [4,5,7,6],
    [0,1,5,4],
    [2,3,7,6],
    [0,2,6,4],
    [1,3,7,5],
  ];
  return {vertices, edges, faces};
}

function makeMonoclinicPrism(ax=1.8, ay=1.2, az=1.0, shear=0.5){
  const base = makeRectPrism(ax, ay, az);
  const v = base.vertices.map(([x,y,z])=>[x + shear * (z>0?1:-1)*0.5, y, z]);
  return {vertices:v, edges:base.edges, faces:base.faces};
}

function makeTetrahedron(s=1.8){
  const a=s/2;
  const vertices=[[a,a,a],[-a,-a,a],[-a,a,-a],[a,-a,-a]];
  const edges=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
  const faces=[[0,1,2],[0,1,3],[0,2,3],[1,2,3]];
  return {vertices, edges, faces};
}

function makeOctahedron(s=1.8){
  const a=s/2;
  const vertices=[[a,0,0],[-a,0,0],[0,a,0],[0,-a,0],[0,0,a],[0,0,-a]];
  const edges=[[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]];
  const faces=[[0,2,4],[0,4,3],[0,3,5],[0,5,2],[1,2,5],[1,5,3],[1,3,4],[1,4,2]];
  return {vertices, edges, faces};
}

function makeCube(s=1.6){ return makeRectPrism(s, s, s); }

function makeRhombohedron(s=1.6, skew=0.4){
  const a=s/2;
  const base = [[-a,-a,0],[a,-a,0],[a,a,0],[-a,a,0]];
  const top  = base.map(([x,y,z])=>[x+skew, y+skew, z+s*0.9]);
  const vertices=[...base, ...top];
  const edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  const faces=[ [0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7] ];
  return {vertices, edges, faces};
}




function makeDodecahedron(s=1.8){
  const phi = (1 + Math.sqrt(5)) / 2;

  
  let icoV = [
    [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
    [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
    [phi, 0, 1], [phi, 0, -1], [-phi, 0, 1], [-phi, 0, -1],
  ];

  function norm(v){ return Math.hypot(v[0], v[1], v[2]); }
  function normalize(v){
    const n = norm(v) || 1e-9;
    return [v[0]/n, v[1]/n, v[2]/n];
  }
  function add(a,b){ return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
  function sub(a,b){ return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
  function scale(v,k){ return [v[0]*k, v[1]*k, v[2]*k]; }
  function dot(a,b){ return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
  function cross(a,b){
    return [ a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0] ];
  }

  
  icoV = icoV.map(normalize);

  
  const icoFaces = [];
  const fset = new Set();
  const eps = 1e-6;

  for(let i=0;i<icoV.length;i++){
    for(let j=i+1;j<icoV.length;j++){
      for(let k=j+1;k<icoV.length;k++){
        const a = icoV[i], b = icoV[j], c = icoV[k];
        const n = cross(sub(b,a), sub(c,a));
        const nn = norm(n);
        if(nn < 1e-7) continue;

        let pos = 0, neg = 0;
        for(let t=0;t<icoV.length;t++){
          if(t===i || t===j || t===k) continue;
          const d = dot(n, sub(icoV[t], a));
          if(d > eps) pos++;
          else if(d < -eps) neg++;
          if(pos && neg) break;
        }
        if(pos && neg) continue; 

        
        const cent = scale(add(add(a,b), c), 1/3);
        let face = [i,j,k];
        if(dot(n, cent) < 0) face = [i,k,j];

        const key = [...face].sort((p,q)=>p-q).join(',');
        if(fset.has(key)) continue;
        fset.add(key);
        icoFaces.push(face);
      }
    }
  }

  
  const dV = icoFaces.map(f=>{
    const a = icoV[f[0]], b = icoV[f[1]], c = icoV[f[2]];
    const cent = scale(add(add(a,b), c), 1/3);
    return normalize(cent);
  });

  
  const incident = Array.from({length: icoV.length}, ()=>[]);
  icoFaces.forEach((f, fi)=>{ for(const vi of f) incident[vi].push(fi); });

  const dFaces = [];
  for(let vi=0; vi<icoV.length; vi++){
    const list = incident[vi];
    if(list.length !== 5) continue;

    const axis = normalize(icoV[vi]);

    
    let u = null;
    for(let t=0;t<list.length;t++){
      const p = dV[list[t]];
      const proj = sub(p, scale(axis, dot(p, axis)));
      const ln = norm(proj);
      if(ln > 1e-6){ u = scale(proj, 1/ln); break; }
    }
    if(!u) continue;

    const ordered = list.map(fi=>{
      const p = dV[fi];
      const proj = sub(p, scale(axis, dot(p, axis)));
      const ln = norm(proj) || 1e-9;
      const v = scale(proj, 1/ln);
      const ang = Math.atan2( dot(axis, cross(u, v)), dot(u, v) );
      return {fi, ang};
    }).sort((a,b)=>a.ang - b.ang);

    let face = ordered.map(o=>o.fi);

    
    const fc = normalize(face.reduce((acc, idx)=> add(acc, dV[idx]), [0,0,0]));
    const p0 = dV[face[0]], p1 = dV[face[1]], p2 = dV[face[2]];
    const nn = cross(sub(p1,p0), sub(p2,p0));
    if(dot(nn, fc) < 0) face = face.slice().reverse();

    dFaces.push(face);
  }

  
  const vertices = dV.map(v=>scale(v, s));

  
  const edgeSet = new Set();
  for(const f of dFaces){
    for(let k=0;k<f.length;k++){
      const i = f[k], j = f[(k+1)%f.length];
      const key = i<j ? `${i}-${j}` : `${j}-${i}`;
      edgeSet.add(key);
    }
  }
  const edges = Array.from(edgeSet).map(s=>s.split('-').map(Number));
  return {vertices, edges, faces: dFaces};
}


function makeRhombicDodecahedronFixed(scale=1.0){
  const a = 1, A = 2;
  const verts = [];
  const idx = new Map();
  function addv(x,y,z){ const i=verts.length; verts.push([x*scale, y*scale, z*scale]); idx.set(`${x},${y},${z}`, i); return i; }
  const axp = addv(+A,0,0), axn = addv(-A,0,0), ayp = addv(0,+A,0), ayn = addv(0,-A,0), azp = addv(0,0,+A), azn = addv(0,0,-A);
  for(const sx of [-1,1]) for(const sy of [-1,1]) for(const sz of [-1,1]) addv(sx*a, sy*a, sz*a);
  function vi(sx,sy,sz){ return idx.get(`${sx},${sy},${sz}`); }
  const faces=[];
  function addFace(axLabel, ayLabel){
    const sig = {X:0,Y:0,Z:0};
    if(axLabel[1]==='X') sig.X = axLabel[0]==='+'? +1 : -1;
    if(axLabel[1]==='Y') sig.Y = axLabel[0]==='+'? +1 : -1;
    if(axLabel[1]==='Z') sig.Z = axLabel[0]==='+'? +1 : -1;
    if(ayLabel[1]==='X') sig.X = ayLabel[0]==='+'? +1 : -1;
    if(ayLabel[1]==='Y') sig.Y = ayLabel[0]==='+'? +1 : -1;
    if(ayLabel[1]==='Z') sig.Z = ayLabel[0]==='+'? +1 : -1;
    const axisIndex = {'+X':axp,'-X':axn,'+Y':ayp,'-Y':ayn,'+Z':azp,'-Z':azn};
    const iA = axisIndex[axLabel], iB = axisIndex[ayLabel];
    const tCorners = [];
    if(sig.X===0){ tCorners.push(vi(+1, sig.Y, sig.Z)); tCorners.push(vi(-1, sig.Y, sig.Z)); }
    else if(sig.Y===0){ tCorners.push(vi(sig.X, +1, sig.Z)); tCorners.push(vi(sig.X, -1, sig.Z)); }
    else { tCorners.push(vi(sig.X, sig.Y, +1)); tCorners.push(vi(sig.X, sig.Y, -1)); }
    faces.push([iA, tCorners[0], iB, tCorners[1]]);
  }
  const pairs = [['+X','+Y'], ['+X','-Y'], ['+X','+Z'], ['+X','-Z'], ['-X','+Y'], ['-X','-Y'], ['-X','+Z'], ['-X','-Z'], ['+Y','+Z'], ['+Y','-Z'], ['-Y','+Z'], ['-Y','-Z']];
  for(const [p,q] of pairs) addFace(p,q);
  const edgeSet=new Set();
  for(const f of faces){ for(let k=0;k<f.length;k++){ const i=f[k], j=f[(k+1)%f.length]; const key=i<j?`${i}-${j}`:`${j}-${i}`; edgeSet.add(key);} }
  const edges = Array.from(edgeSet).map(s=>s.split('-').map(Number));
  return {vertices: verts, edges, faces};
}





const CATALOG = [
  {
    system: "Sistema cúbico (regular ou isométrico)",
    items: [
      { id:"cubo", label:"Hexaedro (Cubo)", gen:()=>makeCube(2.0), desc:"6 faces quadradas, 12 arestas e 8 vértices. Eixo quádruplo." },
      { id:"octa", label:"Octaedro", gen:()=>makeOctahedron(2.2), desc:"Dual do cubo: 8 faces triangulares, 12 arestas e 6 vértices." },
      { id:"rhdo", label:"Rombododecaedro", gen:()=>makeRhombicDodecahedronFixed(0.9), desc:"12 faces losangulares construídas corretamente." },
      { id:"pyrito", label:"Piritoedro (Pentagonododecaedro)", gen:()=>makeDodecahedron(1.25), desc:"Aproximação visual com dodecaedro regular." },
      { id:"tetra", label:"Tetraedro", gen:()=>makeTetrahedron(2.2), desc:"4 faces triangulares, 6 arestas e 4 vértices." }
    ]
  },
  {
    system: "Sistema tetragonal",
    items: [
      { id:"tet_prism", label:"Prisma tetragonal", gen:()=>makePrism(4,1.0,2.0, Math.PI/4, 1.0, 1.0), desc:"Prisma de base quadrada (a=a≠c)." },
      { id:"ditet_prism", label:"Prisma ditetragonal", gen:()=>makePrism(8,1.0,2.0, 0, 1.0, 1.0), desc:"Prisma com 8 lados." },
      { id:"tet_pyr", label:"Pirâmide tetragonal", gen:()=>makePyramid(4,1.0,2.0, Math.PI/4, 1.0, 1.0), desc:"Pirâmide de base quadrada." },
      { id:"ditet_pyr", label:"Pirâmide ditetragonal", gen:()=>makePyramid(8,1.0,2.0, 0, 1.0, 1.0), desc:"Pirâmide com base de 8 lados." },
      { id:"tet_bip", label:"Bipirâmide tetragonal", gen:()=>makeBiPyramid(4,1.0,2.2, Math.PI/4, 1.0, 1.0), desc:"Duas pirâmides unidas base-a-base." },
      { id:"ditet_bip", label:"Bipirâmide ditetragonal", gen:()=>makeBiPyramid(8,1.0,2.2, 0, 1.0, 1.0), desc:"Bipirâmide com 8 lados na cintura." }
    ]
  },
  {
    system: "Sistema hexagonal",
    items: [
      { id:"hex_prism", label:"Prisma hexagonal", gen:()=>makePrism(6,1.0,2.0, Math.PI/6, 1.0, 1.0), desc:"Prisma de base hexagonal (a=a=a≠c)." },
      { id:"dihex_prism", label:"Prisma dihexagonal", gen:()=>makePrism(12,1.0,2.0, 0, 1.0, 1.0), desc:"Prisma com 12 lados." },
      { id:"hex_pyr", label:"Pirâmide hexagonal", gen:()=>makePyramid(6,1.0,2.0, Math.PI/6, 1.0, 1.0), desc:"Pirâmide de base hexagonal." },
      { id:"dihex_pyr", label:"Pirâmide dihexagonal", gen:()=>makePyramid(12,1.0,2.0, 0, 1.0, 1.0), desc:"Pirâmide de base 12." },
      { id:"hex_bip", label:"Bipirâmide hexagonal", gen:()=>makeBiPyramid(6,1.0,2.4, Math.PI/6, 1.0, 1.0), desc:"Bipirâmide de cintura hexagonal." },
      { id:"dihex_bip", label:"Bipirâmide dihexagonal", gen:()=>makeBiPyramid(12,1.0,2.4, 0, 1.0, 1.0), desc:"Bipirâmide com 12 lados na cintura." }
    ]
  },
  {
    system: "Sistema trigonal (romboédrico)",
    items: [
      { id:"tri_prism", label:"Prisma trigonal", gen:()=>makePrism(3,1.0,2.0, Math.PI/6, 1.0, 1.0), desc:"Prisma de base triangular." },
      { id:"ditri_prism", label:"Prisma ditrigonal", gen:()=>makePrism(6,1.0,2.0, 0, 1.0, 1.0), desc:"Prisma com 6 lados." },
      { id:"tri_pyr", label:"Pirâmide trigonal", gen:()=>makePyramid(3,1.0,2.0, Math.PI/6, 1.0, 1.0), desc:"Pirâmide triangular." },
      { id:"tri_bip", label:"Bipirâmide trigonal", gen:()=>makeBiPyramid(3,1.0,2.2, Math.PI/6, 1.0, 1.0), desc:"Bipirâmide triangular." },
      { id:"rhombo", label:"Romboedro", gen:()=>makeRhombohedron(1.8, 0.5), desc:"Paralelepípedo com faces losangulares (ângulos ≠90°). Ilustrativo." }
    ]
  },
  {
    system: "Sistema rómbico (ortorrômbico)",
    items: [
      { id:"romb_prism", label:"Prisma rómbico", gen:()=>makeRectPrism(2.1,1.5,1.0), desc:"Paralelepípedo a≠b≠c; ângulos de 90°." },
      { id:"romb_pyr", label:"Pirâmide rómbica", gen:()=>makePyramid(4,1.0,2.0, Math.PI/4, 1.3, 0.8), desc:"Pirâmide com base losangular." },
      { id:"romb_bip", label:"Bipirâmide rómbica", gen:()=>makeBiPyramid(4,1.0,2.2, Math.PI/4, 1.3, 0.8), desc:"Bipirâmide com cintura losangular." }
    ]
  },
  {
    system: "Sistema monoclínico",
    items: [
      { id:"mono_prism", label:"Prisma monoclínico", gen:()=>makeMonoclinicPrism(2.1,1.4,1.2, 0.7), desc:"Paralelepípedo com a≠b≠c e um ângulo ≠90°." }
    ]
  }
];

const sidebar = document.getElementById('sidebar');
function buildSidebar(){
  for(const group of CATALOG){
    const details = document.createElement('details');
    details.className='group';
    details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = group.system;
    const items = document.createElement('div'); items.className='items';
    for(const it of group.items){
      const btn=document.createElement('button');
      btn.className='item'; btn.textContent = it.label;
      btn.addEventListener('click', ()=> selectShape(it));
      items.appendChild(btn);
    }
    details.appendChild(summary); details.appendChild(items);
    sidebar.appendChild(details);
  }
}

const titleEl = document.getElementById('shapeTitle');
const descEl = document.getElementById('shapeDesc');
function selectShape(item){
  model = item.gen();
  edgeFaceMap = buildEdgeFaceMap(model.faces || []);
  
  rotX = 0; rotY = 0; rotZ = 0; rx.value="0"; ry.value="0"; rz.value="0"; updateSliderLabels();
  titleEl.textContent = item.label + " — " + (CATALOG.find(g=>g.items.includes(item))?.system || "");
  descEl.textContent = item.desc;
  if(autoFitOnLoad) fitView(); 
  draw();
}

buildSidebar();
resize();
resetView();
