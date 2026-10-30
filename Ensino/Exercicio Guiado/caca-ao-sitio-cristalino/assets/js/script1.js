const PAGE = {
  title:'Identificação de sítios cristalinos',
  subtitle:'Identifique, na célula unitária exibida, os sítios cristalográficos ou intersticiais solicitados em cada item.',
  legend:`
    <div class="mini"><strong>SC</strong>: usa apenas cantos na rede base e destaca sítios octaédricos possíveis.</div>
    <div class="mini"><strong>BCC</strong>: adiciona o átomo no centro do corpo e mistura sítios tetraédricos e octaédricos.</div>
    <div class="mini"><strong>FCC</strong>: traz cantos, centros de face e uma família rica de sítios intersticiais.</div>
    <div class="mini"><strong>Pontos dourados</strong>: indicam os sítios corretos quando a resposta é exibida.</div>`
};
const rounds = [
  {structure:'SC', prompt:'Selecione um átomo de vértice.', valid:['corner']},
  {structure:'BCC', prompt:'Selecione o átomo localizado no centro do corpo.', valid:['body']},
  {structure:'FCC', prompt:'Selecione um átomo localizado em um centro de face.', valid:['face']},
  {structure:'FCC', prompt:'Selecione um sítio tetraédrico.', valid:['tetra']},
  {structure:'FCC', prompt:'Selecione um sítio octaédrico.', valid:['octa']},
  {structure:'BCC', prompt:'Selecione um sítio octaédrico.', valid:['octa']},
  {structure:'BCC', prompt:'Selecione um sítio tetraédrico.', valid:['tetra']},
  {structure:'SC', prompt:'Selecione um sítio octaédrico.', valid:['octa']},
  {structure:'FCC', prompt:'Selecione todos os átomos de vértice e de centro de face.', valid:['corner','face'], selectAll:true},
  {structure:'BCC', prompt:'Selecione todos os átomos de vértice e o átomo do centro do corpo.', valid:['corner','body'], selectAll:true},
  {structure:'EDGE', prompt:'Selecione todos os átomos localizados nas arestas.', valid:['edge'], selectAll:true}
];

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const progressEl = document.getElementById('progress');
const scoreEl = document.getElementById('score');
const promptTitleEl = document.getElementById('promptTitle');
const promptTextEl = document.getElementById('promptText');
const feedbackEl = document.getElementById('feedback');
const hudEl = document.getElementById('hud');
document.getElementById('pageTitle').textContent = PAGE.title;
document.getElementById('pageSubtitle').textContent = PAGE.subtitle;
const state = {
  index:0,
  score:0,
  hits:0,
  tries:0,
  streak:0,
  answered:false,
  revealUsed:false,
  rotX:-0.62,
  rotY:0.78,
  rotZ:0,
  zoom:1,
  autoSpin:false,
  showGuides:true,
  pulse:0,
  drag:false,
  moved:false,
  lastX:0,
  lastY:0,
  pickTargets:[]
};
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
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
function projectAt(p, w, h, zoom, cx, cy, scaleMul=1){
  const perspective = 5.1;
  const scaleBase = Math.min(w,h) * 0.22 * zoom * scaleMul;
  const s = perspective / (perspective - p.z);
  return {x:cx + p.x * scaleBase * s, y:cy - p.y * scaleBase * s, s};
}
function makePainter(ctx, w, h, state, viewport={cx:w*0.5, cy:h*0.5, scaleMul:1}){
  const items = [];
  return {
    sphere(p, r, color, glow=0, line=null, alpha=1){
      const rp = rotatePoint(p, state.rotX, state.rotY, state.rotZ);
      const q = projectAt(rp, w, h, state.zoom, viewport.cx, viewport.cy, viewport.scaleMul);
      items.push({t:'sphere', z:rp.z, x:q.x, y:q.y, r:r * Math.min(w,h) * 0.11 * q.s * viewport.scaleMul, color, glow, line, alpha});
      return {screenX:q.x, screenY:q.y, radius:r * Math.min(w,h) * 0.11 * q.s * viewport.scaleMul, depth:rp.z};
    },
    line(a, b, color, width=1.4, dash=false, alpha=1){
      const ra = rotatePoint(a, state.rotX, state.rotY, state.rotZ);
      const rb = rotatePoint(b, state.rotX, state.rotY, state.rotZ);
      const pa = projectAt(ra, w, h, state.zoom, viewport.cx, viewport.cy, viewport.scaleMul);
      const pb = projectAt(rb, w, h, state.zoom, viewport.cx, viewport.cy, viewport.scaleMul);
      items.push({t:'line', z:(ra.z + rb.z) * 0.5, a:pa, b:pb, color, width:width * ((pa.s + pb.s) * 0.5) * viewport.scaleMul, dash, alpha});
    },
    poly(points, fill, stroke, alpha=.18){
      const rp = points.map(p => rotatePoint(p, state.rotX, state.rotY, state.rotZ));
      const pp = rp.map(p => projectAt(p, w, h, state.zoom, viewport.cx, viewport.cy, viewport.scaleMul));
      const z = rp.reduce((s,p) => s + p.z, 0) / rp.length;
      items.push({t:'poly', z, pts:pp, fill, stroke, alpha});
    },
    label(p, text, color='#dbe8ff', size=12){
      const rp = rotatePoint(p, state.rotX, state.rotY, state.rotZ);
      const q = projectAt(rp, w, h, state.zoom, viewport.cx, viewport.cy, viewport.scaleMul);
      items.push({t:'label', z:rp.z, x:q.x, y:q.y, text, color, size:size * q.s});
    },
    arrow(a, b, color='#ffd166', width=1.8, alpha=.92){
      const ra = rotatePoint(a, state.rotX, state.rotY, state.rotZ);
      const rb = rotatePoint(b, state.rotX, state.rotY, state.rotZ);
      const pa = projectAt(ra, w, h, state.zoom, viewport.cx, viewport.cy, viewport.scaleMul);
      const pb = projectAt(rb, w, h, state.zoom, viewport.cx, viewport.cy, viewport.scaleMul);
      items.push({t:'arrow', z:(ra.z+rb.z)*0.5, a:pa, b:pb, color, width:width * ((pa.s + pb.s) * 0.5) * viewport.scaleMul, alpha});
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
        if(item.t === 'arrow'){
          ctx.save();
          ctx.strokeStyle = rgba(item.color, item.alpha);
          ctx.fillStyle = rgba(item.color, Math.min(1,item.alpha + .04));
          ctx.lineWidth = Math.max(1.5, item.width * 1.55);
          ctx.beginPath();
          ctx.moveTo(item.a.x, item.a.y);
          ctx.lineTo(item.b.x, item.b.y);
          ctx.stroke();
          const ang = Math.atan2(item.b.y - item.a.y, item.b.x - item.a.x);
          const head = 9 + item.width * 3.2;
          const side = 4 + item.width * 1.2;
          const tip1x = item.b.x - Math.cos(ang) * head - Math.sin(ang) * side;
          const tip1y = item.b.y - Math.sin(ang) * head + Math.cos(ang) * side;
          const tip2x = item.b.x - Math.cos(ang) * head + Math.sin(ang) * side;
          const tip2y = item.b.y - Math.sin(ang) * head - Math.cos(ang) * side;
          ctx.beginPath();
          ctx.moveTo(item.b.x, item.b.y);
          ctx.lineTo(tip1x, tip1y);
          ctx.lineTo(tip2x, tip2y);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        if(item.t === 'sphere'){
          const g = ctx.createRadialGradient(item.x - item.r*0.32, item.y - item.r*0.34, item.r*0.14, item.x, item.y, item.r);
          g.addColorStop(0, 'rgba(255,255,255,.96)');
          g.addColorStop(.18, rgba(item.color, Math.min(1,item.alpha * .98)));
          g.addColorStop(1, rgba(item.color, Math.min(1,item.alpha * .84)));
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
            ctx.strokeStyle = rgba(item.line, .78);
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }
        }
        if(item.t === 'label'){
          ctx.save();
          ctx.font = `700 ${Math.max(11, item.size)}px Inter, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = item.color;
          ctx.strokeStyle = 'rgba(4,8,14,.92)';
          ctx.lineWidth = 5;
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
function resize(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize', resize);
resize();
canvas.addEventListener('pointerdown', e => {
  state.drag = true;
  state.moved = false;
  state.lastX = e.clientX;
  state.lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if(!state.drag) return;
  const dx = e.clientX - state.lastX;
  const dy = e.clientY - state.lastY;
  if(Math.abs(dx) + Math.abs(dy) > 3) state.moved = true;
  state.lastX = e.clientX;
  state.lastY = e.clientY;
  state.rotY += dx * 0.008;
  state.rotX += dy * 0.008;
});
canvas.addEventListener('pointerup', e => {
  if(!state.moved) handleCanvasTap(e.clientX, e.clientY);
  state.drag = false;
});
canvas.addEventListener('pointercancel', () => state.drag = false);
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  state.zoom = clamp(state.zoom - e.deltaY * 0.001, 0.55, 1.85);
}, { passive:false });
function handleCanvasTap(clientX, clientY){
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  let best = null;
  for(const target of state.pickTargets){
    const d = Math.hypot(x - target.x, y - target.y);
    if(d <= target.r && (!best || d < best.d || (Math.abs(d - best.d) < 0.1 && target.depth > best.depth))){
      best = {target, d, depth:target.depth};
    }
  }
  if(best) onPick(best.target.data);
}

const btnPrev = document.getElementById('prevBtn');
const btnNext = document.getElementById('nextBtn');
const btnReveal = document.getElementById('revealBtn');
const bestKey = 'simoens_best_caca_3d';
state.best = Number(localStorage.getItem(bestKey) || 0);
state.choiceKeys = new Set();
state.correctKeys = new Set();
function labelType(type){
  return {corner:'um canto', face:'um centro de face', body:'um centro do corpo', edge:'uma aresta', tetra:'um sítio tetraédrico', octa:'um sítio octaédrico'}[type] || type;
}
function labelTypeList(types){
  const labels = types.map(labelType);
  if(labels.length === 1) return labels[0];
  if(labels.length === 2) return `${labels[0]} e ${labels[1]}`;
  return `${labels.slice(0,-1).join(', ')} e ${labels[labels.length-1]}`;
}
function structureLabel(structure){
  return {SC:'SC', BCC:'BCC', FCC:'FCC', EDGE:'Arestas'}[structure] || structure;
}
function keyFor(coord, type){
  return `${type}:${coord[0]}:${coord[1]}:${coord[2]}`;
}
function targetPoints(q){
  return basePoints(q.structure).filter(p => q.valid.includes(p.type));
}
function targetKeys(q){
  return new Set(targetPoints(q).map(p => keyFor(p.coord, p.type)));
}
function updateHud(q, selectedCount=0){
  const total = q.selectAll ? targetPoints(q).length : 1;
  const progress = q.selectAll ? ` · <b>Selecionados:</b> ${selectedCount}/${total}` : '';
  hudEl.innerHTML = `<b>Estrutura:</b> ${structureLabel(q.structure)} · <b>Acertos:</b> ${state.hits} / ${state.tries} · <b>Sequência correta:</b> ${state.streak}${progress}`;
}
function basePoints(structure){
  const corners = [
    [0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]
  ].map(v => ({coord:v, type:'corner'}));
  const faces = [
    [0.5,0.5,0],[0.5,0.5,1],[0.5,0,0.5],[0.5,1,0.5],[0,0.5,0.5],[1,0.5,0.5]
  ].map(v => ({coord:v, type:'face'}));
  const body = [{coord:[0.5,0.5,0.5], type:'body'}];
  const edges = [
    [0.5,0,0],[1,0.5,0],[0.5,1,0],[0,0.5,0],
    [0.5,0,1],[1,0.5,1],[0.5,1,1],[0,0.5,1],
    [0,0,0.5],[1,0,0.5],[1,1,0.5],[0,1,0.5]
  ].map(v => ({coord:v, type:'edge'}));
  const tetraFCC = [
    [0.25,0.25,0.25],[0.75,0.25,0.25],[0.25,0.75,0.25],[0.25,0.25,0.75],
    [0.75,0.75,0.25],[0.75,0.25,0.75],[0.25,0.75,0.75],[0.75,0.75,0.75]
  ].map(v => ({coord:v, type:'tetra'}));
  const octaFCC = [
    [0.5,0.5,0.5],[0.5,0.5,0],[0.5,0.5,1],[0.5,0,0.5],[0.5,1,0.5],[0,0.5,0.5],[1,0.5,0.5]
  ].map(v => ({coord:v, type:'octa'}));
  const tetraBCC = [
    [0.5,0.25,0],[0.5,0.75,0],[0.5,0.25,1],[0.5,0.75,1],[0.25,0,0.5],[0.75,0,0.5],[0.25,1,0.5],[0.75,1,0.5],
    [0,0.25,0.5],[0,0.75,0.5],[1,0.25,0.5],[1,0.75,0.5]
  ].map(v => ({coord:v, type:'tetra'}));
  const octaBCC = [
    [0.5,0.5,0],[0.5,0.5,1],[0.5,0,0.5],[0.5,1,0.5],[0,0.5,0.5],[1,0.5,0.5]
  ].map(v => ({coord:v, type:'octa'}));
  const octaSC = [
    [0.5,0.5,0],[0.5,0.5,1],[0.5,0,0.5],[0.5,1,0.5],[0,0.5,0.5],[1,0.5,0.5],[0.5,0.5,0.5]
  ].map(v => ({coord:v, type:'octa'}));
  if(structure === 'SC') return [...corners, ...octaSC];
  if(structure === 'BCC') return [...corners, ...body, ...tetraBCC, ...octaBCC];
  if(structure === 'EDGE') return [...corners, ...edges];
  return [...corners, ...faces, ...tetraFCC, ...octaFCC];
}
function atomSites(structure){
  return basePoints(structure).filter(p => ['corner','face','body','edge'].includes(p.type));
}
function toWorld(coord){
  return v((coord[0]-0.5)*2.35, (coord[1]-0.5)*2.35, (coord[2]-0.5)*2.35);
}
function updateQuestion(){
  const q = rounds[state.index];
  progressEl.textContent = `Item ${state.index + 1}/${rounds.length}`;
  scoreEl.textContent = `Pontuação ${state.score} · Máximo ${state.best}`;
  promptTitleEl.textContent = `Estrutura ${structureLabel(q.structure)}`;
  promptTextEl.textContent = q.prompt;
  feedbackEl.className = 'feedback';
  feedbackEl.innerHTML = q.selectAll ? 'Selecione todos os sítios solicitados para concluir o item.' : 'Analise a célula unitária e selecione diretamente o sítio solicitado.';
  state.answered = false;
  state.revealUsed = false;
  state.choiceKeys = new Set();
  state.correctKeys = new Set();
  updateHud(q, 0);
}

function choosePoint(point){
  if(state.answered) return;
  const q = rounds[state.index];
  const clickedKey = keyFor(point.coord, point.type);
  const targets = targetPoints(q);
  const targetKeySet = targetKeys(q);
  if(q.selectAll){
    if(targetKeySet.has(clickedKey)){
      state.choiceKeys.add(clickedKey);
      updateHud(q, state.choiceKeys.size);
      if(state.choiceKeys.size === targetKeySet.size){
        state.tries += 1;
        state.hits += 1;
        state.streak += 1;
        state.score += 120 + state.streak * 12;
        if(state.score > state.best){
          state.best = state.score;
          localStorage.setItem(bestKey, String(state.best));
        }
        state.answered = true;
        state.correctKeys = new Set(targetKeySet);
        feedbackEl.className = 'feedback good';
        feedbackEl.innerHTML = `<b>Correto.</b> Todos os sítios solicitados foram identificados na estrutura ${structureLabel(q.structure)}.`;
      } else {
        feedbackEl.className = 'feedback';
        feedbackEl.innerHTML = `<b>Parcialmente concluído.</b> Foram identificados ${state.choiceKeys.size} de ${targetKeySet.size} sítios requeridos.`;
      }
    } else {
      state.tries += 1;
      state.answered = true;
      state.streak = 0;
      state.choiceKeys = new Set([clickedKey]);
      state.correctKeys = new Set(targetKeySet);
      feedbackEl.className = 'feedback bad';
      feedbackEl.innerHTML = `<b>Incorreto.</b> O ponto selecionado não corresponde ao sítio solicitado para este item.`;
    }
  } else {
    state.tries += 1;
    state.answered = true;
    state.choiceKeys = new Set([clickedKey]);
    const valid = q.valid.includes(point.type);
    state.correctKeys = new Set(targetKeySet);
    if(valid){
      state.hits += 1;
      state.streak += 1;
      state.score += 90 + state.streak * 10;
      if(state.score > state.best){
        state.best = state.score;
        localStorage.setItem(bestKey, String(state.best));
      }
      feedbackEl.className = 'feedback good';
      feedbackEl.innerHTML = `<b>Correto.</b> O ponto selecionado corresponde a ${labelType(point.type)} na estrutura ${structureLabel(q.structure)}.`;
    } else {
      state.streak = 0;
      feedbackEl.className = 'feedback bad';
      feedbackEl.innerHTML = `<b>Incorreto.</b> O ponto selecionado não corresponde ao sítio solicitado para este item.`;
    }
  }
  progressEl.textContent = `Item ${state.index + 1}/${rounds.length}`;
  scoreEl.textContent = `Pontuação ${state.score} · Máximo ${state.best}`;
  updateHud(q, state.choiceKeys.size);
}
function revealAnswer(){
  if(state.answered) return;
  state.answered = true;
  state.revealUsed = true;
  const q = rounds[state.index];
  state.correctKeys = targetKeys(q);
  feedbackEl.className = 'feedback';
  feedbackEl.innerHTML = `<b>Resposta:</b> ${q.selectAll ? `todos os pontos de ${labelTypeList(q.valid)}` : `todos os pontos equivalentes de ${labelTypeList(q.valid)}`} foram destacados na célula unitária.`;
}

btnReveal.addEventListener('click', revealAnswer);
btnPrev.addEventListener('click', () => {
  state.index = (state.index - 1 + rounds.length) % rounds.length;
  updateQuestion();
});
btnNext.addEventListener('click', () => {
  state.index = (state.index + 1) % rounds.length;
  updateQuestion();
});
function onPick(point){
  choosePoint(point);
}
function renderScene(w, h){
  drawBackground(w,h);
  drawGroundGrid(w,h,state);
  const q = rounds[state.index];
  const p = makePainter(ctx,w,h,state, {cx:w*0.5, cy:h*0.56, scaleMul:1.08});
  const corners = [
    [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
  ].map(pt => mul(v(pt[0],pt[1],pt[2]), 1.18));
  const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  if(state.showGuides){
    p.poly([corners[0],corners[1],corners[2],corners[3]], '#16325a', '#4879b8', .16);
    p.poly([corners[0],corners[1],corners[5],corners[4]], '#0f223f', '#34537d', .1);
  }
  edges.forEach(e => p.line(corners[e[0]], corners[e[1]], '#7cb5ff', 1.5, false, .7));
  state.pickTargets = [];
  const atoms = atomSites(q.structure);
  const palette = {corner:'#eef6ff', face:'#79d9ff', body:'#ffe082', edge:'#67e8a5'};
  atoms.forEach(site => {
    p.sphere(toWorld(site.coord), site.type === 'corner' ? .15 : .14, palette[site.type] || '#dcecff', 0, site.type === 'body' ? '#fff3bb' : null);
  });
  basePoints(q.structure).forEach(site => {
    const world = toWorld(site.coord);
    const key = keyFor(site.coord, site.type);
    const isCorrect = state.correctKeys.has(key);
    const isChoice = state.choiceKeys.has(key);
    const isBaseAtom = ['corner','face','body','edge'].includes(site.type);
    let color = '#9caeff';
    if(site.type === 'tetra') color = '#ff9d88';
    if(site.type === 'octa') color = '#b8a8ff';
    if(site.type === 'face') color = '#58d7ff';
    if(site.type === 'body') color = '#ffe082';
    if(site.type === 'edge') color = '#67e8a5';
    if(isChoice && !state.answered) color = '#7ef3ff';
    if(isCorrect) color = '#ffe082';
    if(isChoice && state.answered && !isCorrect) color = '#ff7d96';

    if(isCorrect){
      p.sphere(world, isBaseAtom ? .125 : .14, '#ffe082', 1.95, '#fff6c8', .42);
      p.sphere(world, isBaseAtom ? .095 : .108, '#fff5a6', .65, '#fff6de', .26);
    } else if(isChoice){
      const choiceColor = state.answered ? '#ff7d96' : '#7ef3ff';
      p.sphere(world, isBaseAtom ? .118 : .132, choiceColor, 1.75, '#ffffff', .40);
      p.sphere(world, isBaseAtom ? .088 : .102, choiceColor, .55, '#ffffff', .24);
    }

    const glow = isCorrect
      ? 1.45
      : (isChoice ? 1.15 : (!state.answered && !isBaseAtom ? .35 + Math.sin(state.pulse*2.5)*.06 : 0));
    const shell = p.sphere(world, isBaseAtom ? .07 : .082, color, glow, isCorrect ? '#fff3bb' : (isChoice ? '#ffffff' : null), state.showGuides || isCorrect || isChoice ? 1 : 0.9);
    state.pickTargets.push({x:shell.screenX, y:shell.screenY, r:Math.max(16, shell.radius * (isCorrect || isChoice ? 1.45 : 1.12)), depth:shell.depth, data:site});
  });
  if(state.showGuides){
    p.label(v(0,1.72,-1.35), q.structure, '#dff4ff', 15);
  }
  p.flush();
}
function tick(){
  resize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  state.pulse += 0.016;
  renderScene(w,h);
  requestAnimationFrame(tick);
}
updateQuestion();
tick();
