const PAGE = {"number": 4, "slug": "4-buracos-cristalinos", "dimension": "3d", "title": "Identificação de sítios intersticiais", "subtitle": "Classifique o sítio intersticial destacado a partir do número e da disposição espacial dos vizinhos mais próximos.", "legend": "", "questions": [{"promptTitle": "Item 1", "promptText": "A partir da vizinhança imediata observada na representação, determine a classificação do sítio intersticial destacado.", "options": ["Tetraédrico · 4 vizinhos", "Octaédrico · 6 vizinhos", "Cúbico · 8 vizinhos", "Trigonal · 3 vizinhos"], "answer": 0, "explain": "Quatro vizinhos mais próximos definem um sítio tetraédrico.", "hud": "<b>Procedimento:</b> examine a coordenação local do sítio destacado na representação.", "scene": {"layered": false, "site": [0, 0, 0], "atoms": [[0.62, 0.62, 0.62, 0.24], [-0.62, -0.62, 0.62, 0.24], [-0.62, 0.62, -0.62, 0.24], [0.62, -0.62, -0.62, 0.24]]}}, {"promptTitle": "Item 2", "promptText": "A partir da vizinhança imediata observada na representação, determine a classificação do sítio intersticial destacado.", "options": ["Tetraédrico · 4 vizinhos", "Octaédrico · 6 vizinhos", "Cúbico · 8 vizinhos", "Linear · 2 vizinhos"], "answer": 1, "explain": "Seis vizinhos mais próximos definem um sítio octaédrico.", "hud": "<b>Procedimento:</b> examine a coordenação local do sítio destacado na representação.", "scene": {"layered": false, "site": [0, 0, 0], "atoms": [[0.92, 0, 0, 0.23], [-0.92, 0, 0, 0.23], [0, 0.92, 0, 0.23], [0, -0.92, 0, 0.23], [0, 0, 0.92, 0.23], [0, 0, -0.92, 0.23]]}}, {"promptTitle": "Item 3", "promptText": "A partir da vizinhança imediata observada na representação, determine a classificação do sítio intersticial destacado.", "options": ["Tetraédrico · 4 vizinhos", "Octaédrico · 6 vizinhos", "Cúbico · 8 vizinhos", "Plano quadrado · 4 vizinhos"], "answer": 0, "explain": "A diferenciação entre camadas não altera a contagem de quatro vizinhos mais próximos, característica de um sítio tetraédrico.", "hud": "<b>Procedimento:</b> examine a coordenação local do sítio destacado na representação.", "scene": {"layered": true, "site": [0.02, 0.03, 0], "atoms": [[0.55, 0.52, 0.52, 0.24], [-0.6, -0.55, 0.48, 0.24], [-0.55, 0.6, -0.5, 0.24], [0.58, -0.52, -0.56, 0.24]]}}, {"promptTitle": "Item 4", "promptText": "A partir da vizinhança imediata observada na representação, determine a classificação do sítio intersticial destacado.", "options": ["Tetraédrico · 4 vizinhos", "Octaédrico · 6 vizinhos", "Trigonal · 3 vizinhos", "Cúbico · 8 vizinhos"], "answer": 1, "explain": "A presença de seis vizinhos dispostos em pares opostos caracteriza um sítio octaédrico.", "hud": "<b>Procedimento:</b> examine a coordenação local do sítio destacado na representação.", "scene": {"layered": true, "site": [0, 0, 0], "atoms": [[0.84, 0, 0, 0.22], [-0.84, 0, 0, 0.22], [0, 0.84, 0, 0.22], [0, -0.84, 0, 0.22], [0.02, 0, 0.9, 0.22], [-0.02, 0, -0.9, 0.22]]}}, {"promptTitle": "Item 5", "promptText": "A partir da vizinhança imediata observada na representação, determine a classificação do sítio intersticial destacado.", "options": ["Tetraédrico · 4 vizinhos", "Octaédrico · 6 vizinhos", "Cúbico · 8 vizinhos", "Linear · 2 vizinhos"], "answer": 0, "explain": "Mesmo em uma representação mais compacta, a presença de quatro vizinhos mais próximos caracteriza um sítio tetraédrico.", "hud": "<b>Procedimento:</b> examine a coordenação local do sítio destacado na representação.", "scene": {"layered": false, "site": [0, 0, 0], "atoms": [[0.66, 0.58, 0.56, 0.24], [-0.64, -0.62, 0.5, 0.24], [-0.56, 0.68, -0.54, 0.24], [0.58, -0.54, -0.66, 0.24]]}}]};
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const optionsEl = document.getElementById('options');
const promptTitleEl = document.getElementById('promptTitle');
const promptTextEl = document.getElementById('promptText');
const feedbackEl = document.getElementById('feedback');
const progressEl = document.getElementById('progress');
const scoreEl = document.getElementById('score');
const hudEl = document.getElementById('hud');
const legendEl = document.getElementById('legend');
const btnNext = document.getElementById('nextBtn');
const btnReveal = document.getElementById('revealBtn');
const autoSpinEl = document.getElementById('autoSpin');
const showGuidesEl = document.getElementById('showGuides');
document.getElementById('pageTitle').textContent = PAGE.title;
document.getElementById('pageSubtitle').textContent = PAGE.subtitle;
if(legendEl) legendEl.innerHTML = PAGE.legend;
if(PAGE.dimension === '2d'){ document.body.classList.add('flat'); if(autoSpinEl) autoSpinEl.checked = false; }

const state = {
  index: 0,
  score: 0,
  answered: false,
  revealUsed: false,
  rotX: PAGE.dimension === '2d' ? 0 : -0.62,
  rotY: PAGE.dimension === '2d' ? 0 : 0.78,
  rotZ: 0,
  zoom: 1,
  autoSpin: false,
  showGuides: true,
  pulse: 0,
  seen: 1,
  drag: false,
  lastX: 0,
  lastY: 0
};

if(autoSpinEl) autoSpinEl.addEventListener('change', () => state.autoSpin = autoSpinEl.checked);
showGuidesEl.addEventListener('change', () => state.showGuides = showGuidesEl.checked);

canvas.addEventListener('pointerdown', e => {
  if(PAGE.dimension === '2d') return;
  state.drag = true;
  state.lastX = e.clientX;
  state.lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if(!state.drag || PAGE.dimension === '2d') return;
  const dx = e.clientX - state.lastX;
  const dy = e.clientY - state.lastY;
  state.lastX = e.clientX;
  state.lastY = e.clientY;
  state.rotY += dx * 0.008;
  state.rotX += dy * 0.008;
});
canvas.addEventListener('pointerup', e => {
  state.drag = false;
});
canvas.addEventListener('pointercancel', e => {
  state.drag = false;
});
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  state.zoom = clamp(state.zoom - e.deltaY * 0.001, 0.55, 1.85);
}, { passive:false });

btnNext.addEventListener('click', () => {
  state.index = (state.index + 1) % PAGE.questions.length;
  state.answered = false;
  state.revealUsed = false;
  state.seen += 1;
  renderQuestion();
});
btnReveal.addEventListener('click', () => {
  if(state.answered) return;
  state.answered = true;
  state.revealUsed = true;
  showResult(false, true);
});

function resize(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize', resize);
resize();

function renderQuestion(){
  const q = PAGE.questions[state.index];
  progressEl.textContent = `Questão ${state.index + 1}/${PAGE.questions.length}`;
  scoreEl.textContent = `Acertos ${state.score}`;
  promptTitleEl.textContent = q.promptTitle;
  promptTextEl.textContent = q.promptText;
  feedbackEl.className = 'feedback';
  feedbackEl.innerHTML = q.initialFeedback || 'Selecione uma alternativa com base na análise estrutural da representação exibida.';
  hudEl.innerHTML = q.hud;
  optionsEl.innerHTML = '';
  q.options.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.type = 'button';
    btn.textContent = label;
    btn.addEventListener('click', () => chooseOption(i));
    optionsEl.appendChild(btn);
  });
}
function chooseOption(i){
  if(state.answered) return;
  state.answered = true;
  const q = PAGE.questions[state.index];
  const correct = i === q.answer;
  if(correct) state.score += 1;
  scoreEl.textContent = `Acertos ${state.score}`;
  showResult(correct, false, i);
}
function showResult(correct, revealed, selectedIndex = -1){
  const q = PAGE.questions[state.index];
  [...optionsEl.children].forEach((btn, i) => {
    btn.classList.toggle('correct', i === q.answer);
    btn.classList.toggle('wrong', i === selectedIndex && i !== q.answer);
    btn.classList.toggle('dim', i !== q.answer && i !== selectedIndex);
  });
  if(revealed){
    feedbackEl.className = 'feedback';
    feedbackEl.innerHTML = `<b>Resposta:</b> ${q.options[q.answer]}. ${q.explain}`;
    return;
  }
  feedbackEl.className = correct ? 'feedback good' : 'feedback bad';
  feedbackEl.innerHTML = correct ? `<b>Correto.</b> ${q.explain}` : `<b>Incorreto.</b> ${q.explain}`;
}

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function mix(a,b,t){ return a + (b-a) * t; }
function rgba(hex, alpha){
  const h = hex.replace('#','');
  const n = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
  const r = parseInt(n.slice(0,2),16);
  const g = parseInt(n.slice(2,4),16);
  const b = parseInt(n.slice(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}
function v(x,y,z){ return {x,y,z}; }
function add(a,b){ return v(a.x+b.x,a.y+b.y,a.z+b.z); }
function sub(a,b){ return v(a.x-b.x,a.y-b.y,a.z-b.z); }
function mul(a,s){ return v(a.x*s,a.y*s,a.z*s); }
function len(a){ return Math.hypot(a.x,a.y,a.z); }
function norm(a){ const l = len(a) || 1; return v(a.x/l,a.y/l,a.z/l); }
function rotatePoint(p, rx, ry, rz){
  let x = p.x, y = p.y, z = p.z;
  let cy = Math.cos(ry), sy = Math.sin(ry);
  let cx = Math.cos(rx), sx = Math.sin(rx);
  let cz = Math.cos(rz), sz = Math.sin(rz);
  let x1 = x*cy + z*sy;
  let z1 = -x*sy + z*cy;
  let y2 = y*cx - z1*sx;
  let z2 = y*sx + z1*cx;
  let x3 = x1*cz - y2*sz;
  let y3 = x1*sz + y2*cz;
  return v(x3,y3,z2);
}
function project(p, w, h, zoom){
  const perspective = 5.1;
  const scaleBase = Math.min(w,h) * 0.22 * zoom;
  const s = perspective / (perspective - p.z);
  return {
    x: w * 0.5 + p.x * scaleBase * s,
    y: h * 0.5 - p.y * scaleBase * s,
    s
  };
}
function makePainter(ctx, w, h, state){
  const items = [];
  return {
    sphere(p, r, color, glow = 0, line = null){
      const rp = rotatePoint(p, state.rotX, state.rotY, state.rotZ);
      const q = project(rp, w, h, state.zoom);
      items.push({t:'sphere', z:rp.z, x:q.x, y:q.y, r:r * Math.min(w,h) * 0.11 * q.s, color, glow, line});
    },
    line(a, b, color, width = 1.4, dash = false, alpha = 1){
      const ra = rotatePoint(a, state.rotX, state.rotY, state.rotZ);
      const rb = rotatePoint(b, state.rotX, state.rotY, state.rotZ);
      const pa = project(ra, w, h, state.zoom);
      const pb = project(rb, w, h, state.zoom);
      items.push({t:'line', z:(ra.z + rb.z) * 0.5, a:pa, b:pb, color, width:width * ((pa.s + pb.s) * 0.5), dash, alpha});
    },
    poly(points, fill, stroke, alpha = .18){
      const rp = points.map(p => rotatePoint(p, state.rotX, state.rotY, state.rotZ));
      const pp = rp.map(p => project(p, w, h, state.zoom));
      const z = rp.reduce((s,p) => s + p.z, 0) / rp.length;
      items.push({t:'poly', z, pts:pp, fill, stroke, alpha});
    },
    label(p, text, color = '#dbe8ff'){
      const rp = rotatePoint(p, state.rotX, state.rotY, state.rotZ);
      const q = project(rp, w, h, state.zoom);
      items.push({t:'label', z:rp.z, x:q.x, y:q.y, text, color});
    },
    flush(){
      items.sort((a,b) => a.z - b.z);
      for(const item of items){
        if(item.t === 'poly'){
          ctx.beginPath();
          item.pts.forEach((p, i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y));
          ctx.closePath();
          ctx.fillStyle = rgba(item.fill, item.alpha);
          ctx.fill();
          ctx.strokeStyle = rgba(item.stroke || item.fill, .55);
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
        if(item.t === 'line'){
          ctx.save();
          ctx.strokeStyle = rgba(item.color, item.alpha);
          ctx.lineWidth = Math.max(1, item.width * 1.4);
          if(item.dash) ctx.setLineDash([8,6]);
          ctx.beginPath();
          ctx.moveTo(item.a.x, item.a.y);
          ctx.lineTo(item.b.x, item.b.y);
          ctx.stroke();
          ctx.restore();
        }
        if(item.t === 'sphere'){
          const g = ctx.createRadialGradient(item.x - item.r*0.32, item.y - item.r*0.34, item.r*0.14, item.x, item.y, item.r);
          g.addColorStop(0, 'rgba(255,255,255,.96)');
          g.addColorStop(.18, rgba(item.color, .92));
          g.addColorStop(1, rgba(item.color, .80));
          if(item.glow){
            const glow = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, item.r * (1.8 + item.glow * .4));
            glow.addColorStop(0, rgba(item.color, .28));
            glow.addColorStop(1, rgba(item.color, 0));
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.r * (1.8 + item.glow * .4), 0, Math.PI*2);
            ctx.fill();
          }
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.r, 0, Math.PI*2);
          ctx.fill();
          if(item.line){
            ctx.strokeStyle = rgba(item.line, .7);
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }
        }
        if(item.t === 'label'){
          ctx.save();
          ctx.font = '700 12px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = item.color;
          ctx.strokeStyle = 'rgba(4,8,14,.9)';
          ctx.lineWidth = 4;
          ctx.strokeText(item.text, item.x, item.y);
          ctx.fillText(item.text, item.x, item.y);
          ctx.restore();
        }
      }
    }
  };
}
function drawBackground(w, h){
  const g = ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#040b16');
  g.addColorStop(1,'#02050c');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);
  for(let i=0;i<28;i++){
    const x = ((i * 97.31) % 1) * w;
    const y = ((i * 53.11 + 0.17) % 1) * h;
    const r = 0.8 + (i % 5) * 0.25;
    ctx.fillStyle = i % 4 ? 'rgba(255,255,255,.18)' : 'rgba(88,215,255,.22)';
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
  }
}
function drawGroundGrid(w,h,state){
  const p = makePainter(ctx,w,h,state);
  for(let i=-4;i<=4;i++){
    p.line(v(i,-1.7,-4), v(i,-1.7,4), '#29446a', .8, false, .35);
    p.line(v(-4,-1.7,i), v(4,-1.7,i), '#29446a', .8, false, .35);
  }
  p.flush();
}

function cellCorners(a,b,c){
  return [
    v(0,0,0), v(a,0,0), v(a,b,0), v(0,b,0),
    v(0,0,c), v(a,0,c), v(a,b,c), v(0,b,c)
  ];
}
function centerize(points){
  const cx = points.reduce((s,p)=>s+p.x,0)/points.length;
  const cy = points.reduce((s,p)=>s+p.y,0)/points.length;
  const cz = points.reduce((s,p)=>s+p.z,0)/points.length;
  return points.map(p => v(p.x-cx,p.y-cy,p.z-cz));
}
function latticeVectors(q){
  const d = Math.PI / 180;
  const a = q.a, b = q.b, c = q.c;
  const ca = Math.cos(q.alpha*d), cb = Math.cos(q.beta*d), cg = Math.cos(q.gamma*d), sg = Math.sin(q.gamma*d);
  const ax = v(a,0,0);
  const bx = v(b*cg,b*sg,0);
  const cx = v(c*cb, c*((ca - cb*cg) / (sg || 1e-6)), 0);
  const z2 = Math.max(0, c*c - cx.x*cx.x - cx.y*cx.y);
  cx.z = Math.sqrt(z2);
  return {a:ax,b:bx,c:cx};
}
function polygon2(points, tr, fill, stroke, alpha = .18){
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = tr.x + p.x * tr.sx + p.y * tr.tx;
    const y = tr.y - p.y * tr.sy - p.x * tr.ty;
    i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
  });
  ctx.closePath();
  ctx.fillStyle = rgba(fill, alpha);
  ctx.fill();
  ctx.strokeStyle = rgba(stroke || fill, .58);
  ctx.lineWidth = 1.5;
  ctx.stroke();
}
function point2(p, tr, color, r = 5){
  const x = tr.x + p.x * tr.sx + p.y * tr.tx;
  const y = tr.y - p.y * tr.sy - p.x * tr.ty;
  const g = ctx.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);
  g.addColorStop(0,'rgba(255,255,255,.9)');
  g.addColorStop(1,rgba(color,.9));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fill();
  return {x,y};
}
function line2(a,b,tr,color,width=1.2,dash=false,alpha=.48){
  const ax = tr.x + a.x * tr.sx + a.y * tr.tx;
  const ay = tr.y - a.y * tr.sy - a.x * tr.ty;
  const bx = tr.x + b.x * tr.sx + b.y * tr.tx;
  const by = tr.y - b.y * tr.sy - b.x * tr.ty;
  ctx.save();
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = width;
  if(dash) ctx.setLineDash([7,6]);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();
  ctx.restore();
  return {ax, ay, bx, by};
}
function text2(txt, x, y, color='#dce8ff'){
  ctx.save();
  ctx.font = '700 13px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(3,7,14,.88)';
  ctx.lineWidth = 5;
  ctx.strokeText(txt, x, y);
  ctx.fillStyle = color;
  ctx.fillText(txt, x, y);
  ctx.restore();
}

function renderUnitCell(q, w, h){
  drawGroundGrid(w,h,state);
  const p = makePainter(ctx,w,h,state);
  const scale = 2.6;
  const corners = [
    v(-1,-1,-1), v(1,-1,-1), v(1,1,-1), v(-1,1,-1),
    v(-1,-1,1), v(1,-1,1), v(1,1,1), v(-1,1,1)
  ].map(pt => mul(pt, scale * .55));
  const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  for(const e of edges) p.line(corners[e[0]], corners[e[1]], '#4971ab', 1.5, false, .64);
  const sitePositions = [];
  const cornerPts = [
    [-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1],
    [-1,-1,1], [1,-1,1], [1,1,1], [-1,1,1]
  ];
  const facePts = [
    [0,0,-1], [0,0,1], [0,-1,0], [0,1,0], [-1,0,0], [1,0,0]
  ];
  const edgePts = [];
  for(const x of [-1,1]) for(const y of [-1,1]) edgePts.push([x,y,0]);
  for(const x of [-1,1]) for(const z of [-1,1]) edgePts.push([x,0,z]);
  for(const y of [-1,1]) for(const z of [-1,1]) edgePts.push([0,y,z]);
  const groups = {
    corner: cornerPts,
    face: facePts,
    body: [[0,0,0]],
    edge: edgePts
  };
  const speciesColor = {A:'#f6fbff',B:'#79d9ff',O:'#ff9178',M:'#ffe28b',X:'#9caeff'};
  for(const site of q.scene.sites){
    const pts = groups[site.kind] || [];
    pts.forEach(raw => sitePositions.push({p:mul(v(raw[0],raw[1],raw[2]), scale * .55), c:speciesColor[site.species] || '#ffffff', label:site.species}));
  }
  if(state.showGuides){
    const plane = [v(-.8,-.8,1.1),v(.8,-.8,1.1),v(.8,.8,1.1),v(-.8,.8,1.1)].map(pt => mul(pt,scale*.55));
    p.poly(plane,'#18263f','#37527f',.08);
  }
  sitePositions.forEach((atom, idx) => p.sphere(atom.p, idx < 8 ? .18 : .17, atom.c, 0));
  if(state.showGuides){
    if(q.scene.shareLabels){
      q.scene.shareLabels.forEach(label => p.label(mul(v(label.pos[0],label.pos[1],label.pos[2]), scale * .55), label.text, '#dfeeff'));
    }
  }
  p.flush();
}

function renderLatticeSystem(q, w, h){
  drawGroundGrid(w,h,state);
  const p = makePainter(ctx,w,h,state);
  const vecs = latticeVectors(q.scene);
  const cornersRaw = [
    v(0,0,0),
    vecs.a,
    add(vecs.a, vecs.b),
    vecs.b,
    vecs.c,
    add(vecs.a, vecs.c),
    add(add(vecs.a, vecs.b), vecs.c),
    add(vecs.b, vecs.c)
  ];
  const cent = mul(add(add(vecs.a, vecs.b), vecs.c), .5);
  const corners = cornersRaw.map(pt => mul(sub(pt, cent), q.scene.scale));
  const faces = [[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
  const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  if(state.showGuides){
    p.poly([corners[0],corners[1],corners[2],corners[3]], '#19345d', '#4879b8', .18);
    p.poly([corners[0],corners[1],corners[5],corners[4]], '#10233f', '#3d5e90', .12);
  }
  edges.forEach(e => p.line(corners[e[0]], corners[e[1]], '#7cb5ff', 1.55, false, .72));
  corners.forEach((pt, i) => p.sphere(pt, .14, i ? '#9dd9ff' : '#fff4bd', 0));
  if(state.showGuides){
    p.line(corners[0], corners[1], '#ffe082', 2.1, true, .82);
    p.line(corners[0], corners[3], '#58d7ff', 2.1, true, .82);
    p.line(corners[0], corners[4], '#ff9d88', 2.1, true, .82);
    p.label(mul(add(corners[0],corners[1]), .5), 'a', '#ffe082');
    p.label(mul(add(corners[0],corners[3]), .5), 'b', '#58d7ff');
    p.label(mul(add(corners[0],corners[4]), .5), 'c', '#ff9d88');
  }
  p.flush();
}

function renderWignerSeitz(q, w, h){
  const tr = {x:w*.52,y:h*.54,sx:90,sy:90,tx:24,ty:14};
  ctx.fillStyle = 'rgba(88,215,255,.04)';
  ctx.fillRect(0,0,w,h);
  for(let i=-4;i<=4;i++){
    for(let j=-4;j<=4;j++){
      const p = {x:i*q.scene.b1[0] + j*q.scene.b2[0], y:i*q.scene.b1[1] + j*q.scene.b2[1]};
      point2(p, tr, i === 0 && j === 0 ? '#ffe082' : '#a5d8ff', i === 0 && j === 0 ? 7 : 4.5);
    }
  }
  q.scene.candidates.forEach((poly, i) => {
    const color = ['#7a7dff','#58d7ff','#ff9178','#99f0b8'][i % 4];
    polygon2(poly.points.map(p => ({x:p[0], y:p[1]})), tr, color, color, .18);
    const label = point2({x:poly.label[0], y:poly.label[1]}, tr, color, 0);
    text2(poly.name, label.x, label.y - 16, color);
  });
  if(state.showGuides){
    text2('ponto central', tr.x, tr.y + 18, '#ffe082');
  }
}

function renderInterstitial(q, w, h){
  drawGroundGrid(w,h,state);
  const p = makePainter(ctx,w,h,state);
  const colors = q.scene.layered ? ['#f5fbff','#9ce0ff','#ffae87'] : ['#f5fbff','#cfe8ff','#9bbaff'];
  q.scene.atoms.forEach((atom, i) => {
    p.sphere(v(atom[0],atom[1],atom[2]), atom[3] || .22, colors[i % colors.length], 0);
  });
  const site = v(q.scene.site[0], q.scene.site[1], q.scene.site[2]);
  p.sphere(site, .14 + Math.sin(state.pulse * 2.2) * .01, '#ffe082', 1.2, '#fff4bd');
  if(state.showGuides){
    q.scene.atoms.forEach(atom => p.line(site, v(atom[0],atom[1],atom[2]), '#ffe082', 1.3, true, .65));
    p.label(site, 'vazio', '#fff2b6');
  }
  p.flush();
}

function renderPacking(q, w, h){
  drawGroundGrid(w,h,state);
  const p = makePainter(ctx,w,h,state);
  const colors = {center:'#ffe082', plane:'#eef6ff', upper:'#7bd5ff', lower:'#ff9d88', shell:'#9caeff'};
  q.scene.atoms.forEach(atom => {
    const color = colors[atom.role] || '#dcecff';
    const glow = atom.role === 'center' ? 1 : 0;
    p.sphere(v(atom.x,atom.y,atom.z), atom.r || .22, color, glow, atom.role === 'center' ? '#fff6c8' : null);
  });
  if(state.showGuides){
    q.scene.links.forEach(link => p.line(v(link[0][0],link[0][1],link[0][2]), v(link[1][0],link[1][1],link[1][2]), '#58d7ff', 1.1, true, .52));
  }
  p.flush();
}

function renderClassification(q, w, h){
  const tr = {x:w*.5,y:h*.53,sx:80,sy:80,tx:26,ty:15};
  if(q.scene.type === 'periodic'){
    for(let i=-4;i<=4;i++){
      for(let j=-3;j<=3;j++){
        const x = i*q.scene.b1[0] + j*q.scene.b2[0];
        const y = i*q.scene.b1[1] + j*q.scene.b2[1];
        const p1 = point2({x,y}, tr, '#9fd8ff', 5);
        if(q.scene.motif){
          point2({x:x+q.scene.motif[0][0], y:y+q.scene.motif[0][1]}, tr, '#ff9d88', 3.8);
          line2({x,y},{x:x+q.scene.motif[0][0], y:y+q.scene.motif[0][1]}, tr, '#6f8ec8', 1, false, .35);
        }
      }
    }
    if(state.showGuides && q.scene.cell){
      polygon2(q.scene.cell.map(p=>({x:p[0],y:p[1]})), tr, '#58d7ff', '#58d7ff', .16);
      text2('célula repetitiva', tr.x + 42, tr.y - 118, '#58d7ff');
    }
  }
  if(q.scene.type === 'amorphous'){
    q.scene.bonds.forEach(b => line2({x:b[0][0],y:b[0][1]},{x:b[1][0],y:b[1][1]}, tr, '#6d86aa', 1.2, false, .45));
    q.scene.points.forEach((pnt, i) => point2({x:pnt[0],y:pnt[1]}, tr, i % 3 ? '#9fd8ff' : '#ff9d88', 5));
  }
  if(q.scene.type === 'molecule'){
    q.scene.bonds.forEach(b => line2({x:b[0][0],y:b[0][1]},{x:b[1][0],y:b[1][1]}, tr, '#6f88ba', 2.1, false, .6));
    q.scene.points.forEach((pnt, i) => point2({x:pnt[0],y:pnt[1]}, tr, i === 0 ? '#ffe082' : '#9fd8ff', i === 0 ? 7 : 5.4));
  }
}

function renderComplex(q, w, h){
  drawGroundGrid(w,h,state);
  const p = makePainter(ctx,w,h,state);
  const metal = v(0,0,0);
  p.sphere(metal, .28, '#ffe082', 1.1, '#fff5be');
  q.scene.ligands.forEach((l, idx) => {
    const pt = v(l[0],l[1],l[2]);
    p.line(metal, pt, '#7395cc', 1.8, false, .72);
    p.sphere(pt, .19, idx % 2 ? '#9bdcff' : '#ff9b88', 0);
  });
  if(state.showGuides){
    p.label(metal, 'M', '#fff6be');
    q.scene.ligands.forEach((l, idx) => p.label(v(l[0]*1.08,l[1]*1.08,l[2]*1.08), `L${idx+1}`, '#dcecff'));
  }
  p.flush();
}

function tick(){
  resize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  state.pulse += 0.016;
  if(state.autoSpin && PAGE.dimension !== '2d'){
    state.rotY += 0.0042;
  }
  drawBackground(w, h);
  const q = PAGE.questions[state.index];
  if(PAGE.slug === '1-formula-unitaria') renderUnitCell(q, w, h);
  if(PAGE.slug === '2-sistema-cristalino') renderLatticeSystem(q, w, h);
  if(PAGE.slug === '3-wigner-seitz') renderWignerSeitz(q, w, h);
  if(PAGE.slug === '4-buracos-cristalinos') renderInterstitial(q, w, h);
  if(PAGE.slug === '5-coordenacao-empacotamento') renderPacking(q, w, h);
  if(PAGE.slug === '6-rede-ou-nao') renderClassification(q, w, h);
  if(PAGE.slug === '7-complexos-geometria') renderComplex(q, w, h);
  requestAnimationFrame(tick);
}
renderQuestion();
tick();
