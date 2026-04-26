
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
const showGuidesEl = document.getElementById('showGuides');
const viewerToolsEl = document.getElementById('viewerTools');
document.getElementById('pageTitle').textContent = PAGE.title;
document.getElementById('pageSubtitle').textContent = PAGE.subtitle;
legendEl.innerHTML = PAGE.legend;
if(PAGE.dimension === '2d'){ document.body.classList.add('flat'); }

const SITE_COLORS = { corner:'#ffb347', edge:'#48d597', face:'#ff6b81', center:'#b987ff' };
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
  lastY: 0,
  mode: 'rotate',
  markedAtoms: new Set(),
  hiddenSpecies: new Set(),
  projectedAtoms: [],
  speciesList: []
};

showGuidesEl.addEventListener('change', () => state.showGuides = showGuidesEl.checked);
canvas.addEventListener('pointerdown', e => {
  const hit = pickAtom(e);
  if(hit && state.mode !== 'rotate'){
    if(state.mode === 'mark') state.markedAtoms.add(hit.atom.uid);
    if(state.mode === 'erase') state.markedAtoms.delete(hit.atom.uid);
    return;
  }
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
canvas.addEventListener('pointerup', () => state.drag = false);
canvas.addEventListener('pointercancel', () => state.drag = false);
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  state.zoom = clamp(state.zoom - e.deltaY * 0.001, 0.55, 1.85);
}, { passive:false });

btnNext.addEventListener('click', () => {
  state.index = (state.index + 1) % PAGE.questions.length;
  state.answered = false;
  state.revealUsed = false;
  state.seen += 1;
  state.markedAtoms.clear();
  state.hiddenSpecies.clear();
  buildViewerTools();
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

function prepareQuestionScene(q){
  q.scene.atoms.forEach((a,i) => {
    a.uid = `${state.index}-${i}`;
    a.species = a.color;
    a.site = classifySite(a.pos, q.scene.cellLines);
  });
}
function uniqueSpecies(q){
  const map = new Map();
  q.scene.atoms.forEach(a => {
    if(!map.has(a.species)) map.set(a.species, { color:a.color, count:0, key:a.species });
    map.get(a.species).count += 1;
  });
  return [...map.values()].sort((a,b) => b.count - a.count);
}
function buildViewerTools(){
  const q = PAGE.questions[state.index];
  prepareQuestionScene(q);
  state.speciesList = uniqueSpecies(q);
  viewerToolsEl.innerHTML = '';
  const toolPanel = document.createElement('div');
  toolPanel.className = 'toolPanel';
  toolPanel.innerHTML = '<div class="toolTitle">Ferramentas de contagem</div>';
  const row = document.createElement('div');
  row.className = 'toolRow';
  [
    { key:'rotate', label:'Girar' },
    { key:'mark', label:'Marcar', dot:true },
    { key:'erase', label:'Apagar', eraser:true }
  ].forEach(tool => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toolBtn' + (state.mode === tool.key ? ' active' : '');
    btn.innerHTML = `${tool.dot ? '<span class="toolDot"></span>' : ''}${tool.eraser ? '<span class="toolEraser">⌫</span>' : ''}<span>${tool.label}</span>`;
    btn.addEventListener('click', () => {
      state.mode = tool.key;
      buildViewerTools();
    });
    row.appendChild(btn);
  });
  toolPanel.appendChild(row);
  const hint = document.createElement('div');
  hint.className = 'filterMeta';
  hint.textContent = 'No modo Marcar, clique nos átomos para contornar em azul. No modo Apagar, clique no átomo marcado para remover o contorno.';
  hint.style.marginTop = '8px';
  toolPanel.appendChild(hint);
  viewerToolsEl.appendChild(toolPanel);

  const filterPanel = document.createElement('div');
  filterPanel.className = 'atomFilterPanel';
  filterPanel.innerHTML = '<div class="toolTitle">Espécies visíveis</div>';
  const filterRow = document.createElement('div');
  filterRow.className = 'filterRow';
  state.speciesList.forEach((sp, idx) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'filterChip' + (state.hiddenSpecies.has(sp.key) ? ' off' : '');
    chip.innerHTML = `<span class="filterSwatch" style="background:${sp.color}"></span><span>Átomo ${idx+1}</span><span class="filterMeta">${sp.count}</span>`;
    chip.addEventListener('click', () => {
      if(state.hiddenSpecies.has(sp.key)) state.hiddenSpecies.delete(sp.key); else state.hiddenSpecies.add(sp.key);
      buildViewerTools();
    });
    filterRow.appendChild(chip);
  });
  filterPanel.appendChild(filterRow);
  const siteMeta = document.createElement('div');
  siteMeta.className = 'filterMeta';
  siteMeta.style.marginTop = '8px';
  siteMeta.innerHTML = `Canto <span style="color:${SITE_COLORS.corner}">●</span> · Aresta <span style="color:${SITE_COLORS.edge}">●</span> · Face <span style="color:${SITE_COLORS.face}">●</span> · Centro <span style="color:${SITE_COLORS.center}">●</span>`;
  filterPanel.appendChild(siteMeta);
  viewerToolsEl.appendChild(filterPanel);
}

function renderQuestion(){
  const q = PAGE.questions[state.index];
  progressEl.textContent = `Questão ${state.index + 1}/${PAGE.questions.length}`;
  scoreEl.textContent = `Acertos ${state.score}`;
  promptTitleEl.textContent = q.promptTitle;
  promptTextEl.textContent = q.promptText;
  feedbackEl.className = 'feedback';
  feedbackEl.innerHTML = 'Use a célula unitária azul, os filtros de espécies e as marcações por clique para contar os átomos da estrutura.';
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
  feedbackEl.innerHTML = correct ? `<b>Boa.</b> ${q.explain}` : `<b>Quase.</b> ${q.explain}`;
}

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function rgba(hex, alpha){
  const h = hex.replace('#','');
  const n = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
  const r = parseInt(n.slice(0,2),16);
  const g = parseInt(n.slice(2,4),16);
  const b = parseInt(n.slice(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}
function v(x,y,z){ return {x,y,z}; }
function rotatePoint(p, rx, ry, rz){
  let x = p.x, y = p.y, z = p.z;
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cz = Math.cos(rz), sz = Math.sin(rz);
  const x1 = x*cy + z*sy;
  const z1 = -x*sy + z*cy;
  const y2 = y*cx - z1*sx;
  const z2 = y*sx + z1*cx;
  const x3 = x1*cz - y2*sz;
  const y3 = x1*sz + y2*cz;
  return v(x3,y3,z2);
}
function project(p, w, h, zoom){
  const perspective = 5.1;
  const scaleBase = Math.min(w,h) * 0.22 * zoom;
  const s = perspective / (perspective - p.z);
  return { x: w * 0.5 + p.x * scaleBase * s, y: h * 0.5 - p.y * scaleBase * s, s };
}
function makePainter(ctx, w, h, state){
  const items = [];
  return {
    sphere(atom, line = null){
      const p = v(atom.pos[0], atom.pos[1], atom.pos[2]);
      const rp = rotatePoint(p, state.rotX, state.rotY, state.rotZ);
      const q = project(rp, w, h, state.zoom);
      const item = {t:'sphere', z:rp.z, x:q.x, y:q.y, r:atom.r * Math.min(w,h) * 0.11 * q.s, color:atom.color, glow:.2, line, atom, s:q.s};
      items.push(item);
      state.projectedAtoms.push(item);
    },
    line(a, b, color, width = 1.4, dash = false, alpha = 1){
      const ra = rotatePoint(a, state.rotX, state.rotY, state.rotZ);
      const rb = rotatePoint(b, state.rotX, state.rotY, state.rotZ);
      const pa = project(ra, w, h, state.zoom);
      const pb = project(rb, w, h, state.zoom);
      items.push({t:'line', z:(ra.z + rb.z) * 0.5, a:pa, b:pb, color, width:width * ((pa.s + pb.s) * 0.5), dash, alpha});
    },
    flush(){
      items.sort((a,b) => a.z - b.z);
      for(const item of items){
        if(item.t === 'line'){
          ctx.save();
          ctx.strokeStyle = rgba(item.color, item.alpha);
          ctx.lineWidth = Math.max(1, item.width * 1.35);
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
          const glow = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, item.r * 1.9);
          glow.addColorStop(0, rgba(item.color, .24));
          glow.addColorStop(1, rgba(item.color, 0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.r * 1.9, 0, Math.PI*2);
          ctx.fill();
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.r, 0, Math.PI*2);
          ctx.fill();
          const siteColor = SITE_COLORS[item.atom.site] || '#ffffff';
          ctx.strokeStyle = rgba(siteColor, .92);
          ctx.lineWidth = Math.max(1.5, item.r * 0.08);
          ctx.stroke();
          if(state.markedAtoms.has(item.atom.uid)){
            ctx.strokeStyle = 'rgba(74,168,255,.98)';
            ctx.lineWidth = Math.max(2, item.r * 0.16);
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.r * 1.18, 0, Math.PI*2);
            ctx.stroke();
          }
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
    p.line(v(i,-1.9,-4), v(i,-1.9,4), '#29446a', .8, false, .35);
    p.line(v(-4,-1.9,i), v(4,-1.9,i), '#29446a', .8, false, .35);
  }
  p.flush();
}
function arrToV(a){ return v(a[0],a[1],a[2]); }
function classifySite(pos, cellLines){
  const pts = [];
  cellLines.forEach(l => { pts.push(l.a, l.b); });
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), zs = pts.map(p => p[2]);
  const bounds = [ [Math.min(...xs), Math.max(...xs)], [Math.min(...ys), Math.max(...ys)], [Math.min(...zs), Math.max(...zs)] ];
  const eps = bounds.map(([mn,mx]) => Math.max((mx-mn)*0.11, 0.06));
  let hits = 0;
  for(let i=0;i<3;i++){
    const val = pos[i], mn = bounds[i][0], mx = bounds[i][1];
    if(Math.abs(val-mn) <= eps[i] || Math.abs(val-mx) <= eps[i]) hits += 1;
  }
  if(hits >= 3) return 'corner';
  if(hits === 2) return 'edge';
  if(hits === 1) return 'face';
  return 'center';
}
function renderModel(q, w, h){
  state.projectedAtoms = [];
  drawGroundGrid(w,h,state);
  const p = makePainter(ctx,w,h,state);
  const sc = q.scene;
  sc.bonds.forEach(b => {
    p.line(arrToV(b.a), arrToV(b.b), b.color || '#9dc4ff', Math.max(1.1, (b.r || 0.04) * 12), false, .82);
  });
  if(state.showGuides){
    sc.cellLines.forEach(l => {
      p.line(arrToV(l.a), arrToV(l.b), '#4aa8ff', 1.55, false, .94);
    });
  }
  sc.atoms.forEach(a => {
    if(state.hiddenSpecies.has(a.species)) return;
    p.sphere(a, '#ffffff');
  });
  p.flush();
}
function pickAtom(evt){
  const rect = canvas.getBoundingClientRect();
  const x = evt.clientX - rect.left;
  const y = evt.clientY - rect.top;
  const hits = state.projectedAtoms.filter(item => !state.hiddenSpecies.has(item.atom.species)).filter(item => {
    const dx = x - item.x, dy = y - item.y;
    return dx*dx + dy*dy <= (item.r*1.2) * (item.r*1.2);
  }).sort((a,b) => b.z - a.z);
  return hits[0] || null;
}
function tick(){
  resize();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  state.pulse += 0.016;
  drawBackground(w, h);
  renderModel(PAGE.questions[state.index], w, h);
  requestAnimationFrame(tick);
}
buildViewerTools();
renderQuestion();
tick();
