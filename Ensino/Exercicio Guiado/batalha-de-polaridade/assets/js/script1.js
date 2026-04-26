const PAGE = {
  title:'Comparação de polaridade molecular',
  subtitle:'Compare pares de moléculas e determine qual apresenta maior polaridade molecular resultante a partir da geometria e da simetria.',
  legend:''
};
const duels = [
  {left:{name:'CO₂',geom:'Linear',shape:'linear',note:'Os momentos de dipolo possuem mesmo módulo e se cancelam vetorialmente.',polarity:0},right:{name:'H₂O',geom:'Angular',shape:'bentTwoLP',note:'A geometria angular impede o cancelamento completo dos dipolos de ligação.',polarity:1},answer:'right'},
  {left:{name:'BF₃',geom:'Trigonal planar',shape:'trigonal',note:'A distribuição trigonal planar com ligantes equivalentes é simétrica.',polarity:0},right:{name:'NH₃',geom:'Piramidal trigonal',shape:'pyramidal',note:'A presença de par não ligante reduz a simetria molecular.',polarity:1},answer:'right'},
  {left:{name:'CH₄',geom:'Tetraédrica',shape:'tetra',note:'A distribuição tetraédrica com ligantes equivalentes é simétrica.',polarity:0},right:{name:'CCl₄',geom:'Tetraédrica',shape:'tetra',note:'A distribuição tetraédrica com ligantes equivalentes promove cancelamento vetorial.',polarity:0},answer:'tie'},
  {left:{name:'SO₂',geom:'Angular',shape:'bentOneLP',note:'A geometria angular produz momento dipolar resultante.',polarity:1},right:{name:'CO₂',geom:'Linear',shape:'linear',note:'Os dipolos de ligação se cancelam vetorialmente.',polarity:0},answer:'left'},
  {left:{name:'XeF₄',geom:'Quadrada planar',shape:'square',note:'A disposição quadrado-planar com pares não ligantes opostos mantém a simetria global.',polarity:0},right:{name:'SF₄',geom:'Gangorra',shape:'seesaw',note:'A geometria assimétrica produz momento dipolar resultante.',polarity:1},answer:'right'},
  {left:{name:'HCl',geom:'Linear',shape:'diatomic',note:'A diferença de eletronegatividade produz dipolo de ligação resultante.',polarity:1},right:{name:'HF',geom:'Linear',shape:'diatomic',note:'A diferença de eletronegatividade é mais acentuada, elevando a polaridade da ligação.',polarity:2},answer:'right'},
  {left:{name:'BeCl₂',geom:'Linear',shape:'linear',note:'A geometria linear com ligantes equivalentes é simétrica.',polarity:0},right:{name:'CH₃Cl',geom:'Tetraédrica',shape:'tetraOne',note:'A substituição de um ligante impede o cancelamento vetorial completo.',polarity:1},answer:'right'},
  {left:{name:'SO₃',geom:'Trigonal planar',shape:'trigonal',note:'A distribuição trigonal planar com três ligações equivalentes é simétrica.',polarity:0},right:{name:'H₂S',geom:'Angular',shape:'bentTwoLP',note:'Apresenta momento dipolar resultante, embora inferior ao da água.',polarity:1},answer:'right'},
  {left:{name:'CS₂',geom:'Linear',shape:'linear',note:'A disposição linear promove cancelamento vetorial dos dipolos.',polarity:0},right:{name:'NH₃',geom:'Piramidal trigonal',shape:'pyramidal',note:'O par não ligante induz momento dipolar resultante orientado para sua região eletrônica.',polarity:1},answer:'right'},
  {left:{name:'PCl₅',geom:'Bipirâmide trigonal',shape:'tbp',note:'A elevada simetria com ligantes equivalentes favorece o cancelamento vetorial.',polarity:0},right:{name:'SF₆',geom:'Octaédrica',shape:'octa',note:'A distribuição octaédrica com ligantes equivalentes é completamente simétrica.',polarity:0},answer:'tie'}
];
const shapeModels = {
  linear:{
    atoms:[
      {x:-1.5,y:0,z:0,kind:'ligand'},
      {x:0,y:0,z:0,kind:'center'},
      {x:1.5,y:0,z:0,kind:'ligand'}
    ],
    bonds:[[0,1],[1,2]],
    dipoles:[{from:[-1.78,0,0],to:[-2.2,0,0]},{from:[1.78,0,0],to:[2.2,0,0]}]
  },
  diatomic:{
    atoms:[
      {x:-1.16,y:0,z:0,kind:'center'},
      {x:1.16,y:0,z:0,kind:'ligand'}
    ],
    bonds:[[0,1]],
    dipoles:[{from:[1.44,0,0],to:[1.92,0,0]}]
  },
  bentOneLP:{
    atoms:[
      {x:-1.12,y:-0.58,z:0,kind:'ligand'},
      {x:0,y:0,z:0,kind:'center'},
      {x:1.12,y:-0.58,z:0,kind:'ligand'}
    ],
    bonds:[[0,1],[1,2]],
    lonePairs:[{x:0,y:1.12,z:0}],
    dipoles:[{from:[-1.36,-0.7,0],to:[-1.78,-0.98,0]},{from:[1.36,-0.7,0],to:[1.78,-0.98,0]}]
  },
  bentTwoLP:{
    atoms:[
      {x:-1.02,y:-0.38,z:0.92,kind:'ligand'},
      {x:0,y:0,z:0,kind:'center'},
      {x:1.02,y:-0.38,z:0.92,kind:'ligand'}
    ],
    bonds:[[0,1],[1,2]],
    lonePairs:[{x:-0.9,y:0.92,z:-0.64},{x:0.9,y:0.92,z:-0.64}],
    dipoles:[{from:[-1.24,-0.44,1.08],to:[-1.6,-0.56,1.42]},{from:[1.24,-0.44,1.08],to:[1.6,-0.56,1.42]}]
  },
  trigonal:{
    atoms:[
      {x:0,y:1.32,z:0,kind:'ligand'},
      {x:0,y:0,z:0,kind:'center'},
      {x:-1.14,y:-0.66,z:0,kind:'ligand'},
      {x:1.14,y:-0.66,z:0,kind:'ligand'}
    ],
    bonds:[[0,1],[1,2],[1,3]]
  },
  pyramidal:{
    atoms:[
      {x:0,y:-1.08,z:0.78,kind:'ligand'},
      {x:0,y:0,z:0,kind:'center'},
      {x:-1.08,y:0.54,z:0.78,kind:'ligand'},
      {x:1.08,y:0.54,z:0.78,kind:'ligand'}
    ],
    bonds:[[0,1],[1,2],[1,3]],
    lonePairs:[{x:0,y:0,z:-1.15}],
    dipoles:[{from:[0,0,-1.2],to:[0,0,-1.7]}]
  },
  tetra:{
    atoms:[
      {x:0.94,y:0.94,z:0.94,kind:'ligand'},
      {x:0,y:0,z:0,kind:'center'},
      {x:-0.94,y:-0.94,z:0.94,kind:'ligand'},
      {x:-0.94,y:0.94,z:-0.94,kind:'ligand'},
      {x:0.94,y:-0.94,z:-0.94,kind:'ligand'}
    ],
    bonds:[[0,1],[1,2],[1,3],[1,4]]
  },
  tetraOne:{
    atoms:[
      {x:0.94,y:0.94,z:0.94,kind:'alt'},
      {x:0,y:0,z:0,kind:'center'},
      {x:-0.94,y:-0.94,z:0.94,kind:'ligand'},
      {x:-0.94,y:0.94,z:-0.94,kind:'ligand'},
      {x:0.94,y:-0.94,z:-0.94,kind:'ligand'}
    ],
    bonds:[[0,1],[1,2],[1,3],[1,4]],
    dipoles:[{from:[1.12,1.12,1.12],to:[1.54,1.54,1.54]}]
  },
  seesaw:{
    atoms:[
      {x:0,y:1.58,z:0,kind:'ligand'},
      {x:0,y:0,z:0,kind:'center'},
      {x:0,y:-1.58,z:0,kind:'ligand'},
      {x:1.34,y:0,z:0,kind:'ligand'},
      {x:-0.67,y:0,z:1.16,kind:'ligand'}
    ],
    bonds:[[0,1],[1,2],[1,3],[1,4]],
    lonePairs:[{x:-0.67,y:0,z:-1.16}],
    dipoles:[{from:[-0.76,0,-1.32],to:[-1.02,0,-1.8]}]
  },
  square:{
    atoms:[
      {x:0,y:-1.24,z:0,kind:'ligand'},
      {x:0,y:0,z:0,kind:'center'},
      {x:-1.24,y:0,z:0,kind:'ligand'},
      {x:1.24,y:0,z:0,kind:'ligand'},
      {x:0,y:1.24,z:0,kind:'ligand'}
    ],
    bonds:[[0,1],[1,2],[1,3],[1,4]],
    lonePairs:[{x:0,y:0,z:-1.56},{x:0,y:0,z:1.56}],
    localRot:{x:0.62,y:-0.78,z:0}
  },
  tbp:{
    atoms:[
      {x:0,y:1.6,z:0,kind:'ligand'},
      {x:0,y:0,z:0,kind:'center'},
      {x:0,y:-1.6,z:0,kind:'ligand'},
      {x:1.36,y:0,z:0,kind:'ligand'},
      {x:-0.68,y:0,z:1.18,kind:'ligand'},
      {x:-0.68,y:0,z:-1.18,kind:'ligand'}
    ],
    bonds:[[0,1],[1,2],[1,3],[1,4],[1,5]]
  },
  octa:{
    atoms:[
      {x:0,y:1.48,z:0,kind:'ligand'},
      {x:0,y:0,z:0,kind:'center'},
      {x:0,y:-1.48,z:0,kind:'ligand'},
      {x:1.48,y:0,z:0,kind:'ligand'},
      {x:-1.48,y:0,z:0,kind:'ligand'},
      {x:0,y:0,z:1.48,kind:'ligand'},
      {x:0,y:0,z:-1.48,kind:'ligand'}
    ],
    bonds:[[0,1],[1,2],[1,3],[1,4],[1,5],[1,6]]
  }
};

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
  zoom:0.55,
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

const optionsEl = document.getElementById('options');
const btnPrev = document.getElementById('prevBtn');
const btnNext = document.getElementById('nextBtn');
const btnReveal = document.getElementById('revealBtn');
const bestKey = 'simoens_best_polaridade_3d';
state.best = Number(localStorage.getItem(bestKey) || 0);
function onPick(){}
function renderOptions(){
  const duel = duels[state.index];
  optionsEl.innerHTML = '';
  const choices = [
    {key:'left', label:`Molécula A · ${duel.left.name}`},
    {key:'tie', label:'Polaridade equivalente'},
    {key:'right', label:`Molécula B · ${duel.right.name}`}
  ];
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.type = 'button';
    btn.textContent = choice.label;
    btn.addEventListener('click', () => choose(choice.key));
    optionsEl.appendChild(btn);
  });
}
function updateQuestion(){
  const duel = duels[state.index];
  progressEl.textContent = `Item ${state.index + 1}/${duels.length}`;
  scoreEl.textContent = `Pontuação ${state.score} · Máximo ${state.best}`;
  promptTitleEl.textContent = 'Comparação de polaridade molecular';
  promptTextEl.textContent = `Compare ${duel.left.name} com ${duel.right.name} e indique qual espécie apresenta maior momento dipolar resultante. Caso sejam equivalentes, selecione a opção de equivalência.`;
  feedbackEl.className = 'feedback';
  feedbackEl.innerHTML = 'Analise a geometria molecular, a simetria e o cancelamento vetorial dos dipolos antes de responder.';
  hudEl.innerHTML = `<b>Molécula A:</b> ${duel.left.name} · <b>Molécula B:</b> ${duel.right.name} · <b>Sequência correta:</b> ${state.streak} · <b>Acertos:</b> ${state.hits} / ${state.tries}`;
  state.answered = false;
  state.revealUsed = false;
  renderOptions();
}
function choose(choice){
  if(state.answered) return;
  state.answered = true;
  state.tries += 1;
  const duel = duels[state.index];
  const correct = choice === duel.answer;
  if(correct){
    state.hits += 1;
    state.streak += 1;
    state.score += 90 + state.streak * 10;
    if(state.score > state.best){
      state.best = state.score;
      localStorage.setItem(bestKey, String(state.best));
    }
  } else {
    state.streak = 0;
  }
  [...optionsEl.children].forEach((btn, i) => {
    const key = ['left','tie','right'][i];
    btn.classList.toggle('correct', key === duel.answer);
    btn.classList.toggle('wrong', key === choice && key !== duel.answer);
    btn.classList.toggle('dim', key !== duel.answer && key !== choice);
  });
  feedbackEl.className = correct ? 'feedback good' : 'feedback bad';
  if(correct){
    const winner = duel.answer === 'tie' ? 'As duas espécies apresentam polaridade molecular equivalente.' : duel.answer === 'left' ? `${duel.left.name} apresenta maior polaridade molecular.` : `${duel.right.name} apresenta maior polaridade molecular.`;
    feedbackEl.innerHTML = `<b>Correto.</b> ${winner} ${duel.left.note} ${duel.right.note}`;
  } else {
    const winner = duel.answer === 'tie' ? 'a equivalência entre as polaridades' : duel.answer === 'left' ? duel.left.name : duel.right.name;
    feedbackEl.innerHTML = `<b>Incorreto.</b> A classificação correta é ${winner}. ${duel.left.note} ${duel.right.note}`;
  }
  progressEl.textContent = `Item ${state.index + 1}/${duels.length}`;
  scoreEl.textContent = `Pontuação ${state.score} · Máximo ${state.best}`;
  hudEl.innerHTML = `<b>Molécula A:</b> ${duel.left.name} · <b>Molécula B:</b> ${duel.right.name} · <b>Sequência correta:</b> ${state.streak} · <b>Acertos:</b> ${state.hits} / ${state.tries}`;
}
function revealAnswer(){
  if(state.answered) return;
  state.answered = true;
  const duel = duels[state.index];
  [...optionsEl.children].forEach((btn, i) => btn.classList.toggle('correct', ['left','tie','right'][i] === duel.answer));
  feedbackEl.className = 'feedback';
  feedbackEl.innerHTML = `<b>Resposta:</b> ${duel.answer === 'tie' ? 'polaridade molecular equivalente' : duel.answer === 'left' ? duel.left.name : duel.right.name}.`;
}
btnReveal.addEventListener('click', revealAnswer);
btnPrev.addEventListener('click', () => {
  state.index = (state.index - 1 + duels.length) % duels.length;
  updateQuestion();
});
btnNext.addEventListener('click', () => {
  state.index = (state.index + 1) % duels.length;
  updateQuestion();
});
function atomColor(kind){
  if(kind === 'center') return '#ffe082';
  if(kind === 'alt') return '#ff9d88';
  if(kind === 'lone') return '#ffd166';
  return '#79d9ff';
}
function atomLine(kind){
  if(kind === 'center') return '#fff4bd';
  if(kind === 'alt') return '#ffd9cf';
  if(kind === 'lone') return '#fff4bc';
  return null;
}
function drawMolecule(p, mol){
  const model = shapeModels[mol.shape] || shapeModels.linear;
  const localRot = model.localRot || null;
  const mapPoint = (pt) => {
    let out = v(pt.x, pt.y, pt.z);
    if(localRot) out = rotatePoint(out, localRot.x || 0, localRot.y || 0, localRot.z || 0);
    return out;
  };
  const atoms = model.atoms.map(atom => ({pos:mapPoint(atom), kind:atom.kind}));
  const lonePairs = (model.lonePairs || []).map(lp => ({pos:mapPoint(lp), kind:'lone'}));
  const cloud = atoms.concat(lonePairs);
  model.bonds.forEach(pair => {
    p.line(atoms[pair[0]].pos, atoms[pair[1]].pos, '#7395cc', 1.65, false, .76);
  });
  cloud.forEach(item => {
    const glow = item.kind === 'center' ? .9 : item.kind === 'lone' ? .2 : 0;
    const radius = item.kind === 'center' ? .22 : item.kind === 'lone' ? .11 : .165;
    p.sphere(item.pos, radius, atomColor(item.kind), glow, atomLine(item.kind));
  });
  p.label(v(0,2.25,-1.05), mol.name, '#dff4ff', 15);
  if(state.showGuides){
    p.label(v(0,-2.12,-1.05), mol.geom, '#b8cae8', 11.5);
  }
}
function renderScene(w, h){
  drawBackground(w,h);
  const glow = ctx.createRadialGradient(w*0.28,h*0.4,0,w*0.28,h*0.4,180);
  glow.addColorStop(0,'rgba(88,215,255,.08)');
  glow.addColorStop(1,'rgba(88,215,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0,0,w,h);
  const glow2 = ctx.createRadialGradient(w*0.72,h*0.4,0,w*0.72,h*0.4,180);
  glow2.addColorStop(0,'rgba(122,125,255,.08)');
  glow2.addColorStop(1,'rgba(122,125,255,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0,0,w,h);
  const duel = duels[state.index];
  const leftPainter = makePainter(ctx,w,h,state, {cx:w*0.31, cy:h*0.56, scaleMul:.82});
  const rightPainter = makePainter(ctx,w,h,state, {cx:w*0.69, cy:h*0.56, scaleMul:.82});
  if(state.showGuides){
    leftPainter.poly([v(-2.1,-1.95,-1.55),v(2.1,-1.95,-1.55),v(2.1,-1.95,1.55),v(-2.1,-1.95,1.55)], '#10233f', '#2d4f80', .08);
    rightPainter.poly([v(-2.1,-1.95,-1.55),v(2.1,-1.95,-1.55),v(2.1,-1.95,1.55),v(-2.1,-1.95,1.55)], '#10233f', '#2d4f80', .08);
  }
  drawMolecule(leftPainter, duel.left);
  drawMolecule(rightPainter, duel.right);
  leftPainter.flush();
  rightPainter.flush();
  ctx.save();
  ctx.strokeStyle = 'rgba(124,181,255,.12)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(w*0.5, h*0.18);
  ctx.lineTo(w*0.5, h*0.82);
  ctx.stroke();
  ctx.restore();
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
