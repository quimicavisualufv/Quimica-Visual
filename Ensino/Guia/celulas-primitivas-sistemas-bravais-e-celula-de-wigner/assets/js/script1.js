


const $ = (q, el=document) => el.querySelector(q);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a,b,t) => a+(b-a)*t;
const fmt = (n, d=2) => Number(n).toFixed(d);


let CAMERA_ZOOM = 4;

const APP_VER = 5;

function h(tag, attrs={}, children=[]){
  const el = document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){
    if(k === "class") el.className = v;
    else if(k === "html") el.innerHTML = v;
    else if(k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  for(const c of children){
    if(c == null) continue;
    if(typeof c === "string") el.appendChild(document.createTextNode(c));
    else el.appendChild(c);
  }
  return el;
}




const canvas = $("#viz");
const ctx = canvas.getContext("2d");

let APP_READY = false;
let __roRaf = 0;


function DPR(){
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const {width, height} = canvas.getBoundingClientRect();
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
new ResizeObserver(()=>{
  DPR();
  if(!APP_READY) return;
  if(__roRaf) cancelAnimationFrame(__roRaf);
  __roRaf = requestAnimationFrame(()=>{
    __roRaf = 0;
    try{ renderCanvasOnly(); }catch(_){  }
  });
}).observe(canvas);
DPR();

function size(){
  const r = canvas.getBoundingClientRect();
  return {w:r.width, h:r.height};
}

function clear(){
  const {w,h} = size();
  ctx.clearRect(0,0,w,h);
  
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "rgba(231,238,252,.22)";
  ctx.lineWidth = 1;
  const step = 28;
  for(let x=0;x<w;x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for(let y=0;y<h;y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
  ctx.restore();
}

function drawPoint(p, r=6, fill="rgba(125,211,252,.95)", stroke="rgba(231,238,252,.25)"){
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI*2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function drawLabel(text, x, y, color="rgba(231,238,252,.9)"){
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = "12px " + getComputedStyle(document.documentElement).getPropertyValue("--mono");
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawLine(a,b, stroke="rgba(231,238,252,.45)", w=2, dash=null){
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = w;
  if(dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(a.x,a.y);
  ctx.lineTo(b.x,b.y);
  ctx.stroke();
  ctx.restore();
}

function drawArrow(a,b, stroke="rgba(167,139,250,.95)", w=2){
  drawLine(a,b,stroke,w);
  const ang = Math.atan2(b.y-a.y, b.x-a.x);
  const head = 10;
  const left = {x: b.x - head*Math.cos(ang-0.5), y: b.y - head*Math.sin(ang-0.5)};
  const right= {x: b.x - head*Math.cos(ang+0.5), y: b.y - head*Math.sin(ang+0.5)};
  ctx.save();
  ctx.fillStyle = stroke;
  ctx.beginPath();
  ctx.moveTo(b.x,b.y);
  ctx.lineTo(left.x,left.y);
  ctx.lineTo(right.x,right.y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPoly(poly, fill="rgba(125,211,252,.12)", stroke="rgba(125,211,252,.65)", w=2){
  if(poly.length<3) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for(let i=1;i<poly.length;i++) ctx.lineTo(poly[i].x, poly[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = w;
  ctx.stroke();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r){
  r = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

function badge(text, x, y, color){
  const {w} = size();
  ctx.save();
  ctx.fillStyle = "rgba(15,23,36,.72)";
  ctx.strokeStyle = "rgba(231,238,252,.16)";
  ctx.lineWidth = 1;
  const pad = 10;
  ctx.font = "12px " + getComputedStyle(document.documentElement).getPropertyValue("--sans");
  const maxW = Math.min(w - 20, 740);
  const tw = Math.min(maxW, ctx.measureText(text).width + pad*2);
  const h = 34;
  roundRect(ctx, x, y, tw, h, 12);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillText(text, x+pad, y+22);
  ctx.restore();
}




function sub(a,b){ return {x:a.x-b.x, y:a.y-b.y}; }
function add(a,b){ return {x:a.x+b.x, y:a.y+b.y}; }
function dot(a,b){ return a.x*b.x + a.y*b.y; }
function scale(a,s){ return {x:a.x*s, y:a.y*s}; }

function intersectSegLine(p1,p2, linePoint, lineNormal){
  const d1 = dot(sub(p1,linePoint), lineNormal);
  const d2 = dot(sub(p2,linePoint), lineNormal);
  const t = d1 / (d1 - d2);
  return {x: lerp(p1.x,p2.x,t), y: lerp(p1.y,p2.y,t)};
}

function clipPolyHalfPlane(poly, linePoint, lineNormal, keepSide=-1){
  const out = [];
  for(let i=0;i<poly.length;i++){
    const a = poly[i];
    const b = poly[(i+1)%poly.length];
    const da = dot(sub(a,linePoint), lineNormal) * keepSide;
    const db = dot(sub(b,linePoint), lineNormal) * keepSide;
    const ina = da <= 1e-9;
    const inb = db <= 1e-9;
    if(ina && inb){
      out.push(b);
    }else if(ina && !inb){
      out.push(intersectSegLine(a,b,linePoint, scale(lineNormal, keepSide)));
    }else if(!ina && inb){
      out.push(intersectSegLine(a,b,linePoint, scale(lineNormal, keepSide)));
      out.push(b);
    }
  }
  return out;
}

function voronoiCell(center, neighbors, boundsPoly){
  let poly = boundsPoly.map(p=>({...p}));
  for(const nb of neighbors){
    const mid = scale(add(center, nb), 0.5);
    const n = sub(nb, center);
    poly = clipPolyHalfPlane(poly, mid, n, +1); 
    if(poly.length === 0) break;
  }
  return poly;
}




function mkSelect(label, options, value, onChange){
  const sel = h("select", {onchange:(e)=>onChange(e.target.value)});
  for(const [v, t] of options){
    const opt = h("option", {value:v}, [t]);
    if(String(v)===String(value)) opt.selected = true;
    sel.appendChild(opt);
  }
  
  return h("div", {class:"controlrow"}, [
    h("div", {class:"label"}, [label]),
    sel
  ]);
}


function mkToggle(label, checked, onChange){
  const id = "t_" + Math.random().toString(16).slice(2);
  const cb = h("input", {type:"checkbox", id});
  cb.checked = !!checked;

  const val = h("div", {class:"value"}, [cb.checked ? "Sim" : "Não"]);

  cb.addEventListener("change", ()=>{
    val.textContent = cb.checked ? "Sim" : "Não";
    onChange(cb.checked);
  });

  const sw = h("label", {class:"switch", for:id, title:label}, [
    cb,
    h("span", {class:"slider"}, [])
  ]);

  return h("div", {class:"controlrow"}, [
    h("div", {class:"label"}, [label]),
    sw,
    val
  ]);
}


function mkRange(label, min, max, step, value, onInput, fmtFn){
  const input = h("input", {type:"range", min, max, step, value});
  const val = h("div", {class:"value"}, [fmtFn ? fmtFn(value) : String(value)]);
  input.addEventListener("input", ()=>{
    const v = Number(input.value);
    val.textContent = fmtFn ? fmtFn(v) : String(v);
    onInput(v);
  });
  return h("div", {class:"controlrow"}, [
    h("div", {class:"label"}, [label]),
    input,
    val
  ]);
}

function mkRangeArrows(label, min, max, step, value, onInput, fmtFn){
  const input = h("input", {type:"range", min, max, step, value});
  const val = h("div", {class:"value"}, [fmtFn ? fmtFn(value) : String(value)]);

  function setValue(v){
    const vv = clamp(v, Number(min), Number(max));
    input.value = String(vv);
    val.textContent = fmtFn ? fmtFn(vv) : String(vv);
    onInput(vv);
  }

  input.addEventListener("input", ()=>{
    const v = Number(input.value);
    val.textContent = fmtFn ? fmtFn(v) : String(v);
    onInput(v);
  });

  const btnL = h("button", {class:"btn tiny", type:"button", onclick:()=>setValue(Number(input.value)-Number(step))}, ["◀"]);
  const btnR = h("button", {class:"btn tiny", type:"button", onclick:()=>setValue(Number(input.value)+Number(step))}, ["▶"]);

  return h("div", {class:"controlrow"}, [
    h("div", {class:"label"}, [label]),
    h("div", {class:"rangeWithArrows"}, [btnL, input, btnR]),
    val
  ]);
}




function centerOriginForParallelogram(v1, v2, center){
  
  return sub(center, scale(add(v1,v2), 0.5));
}




function lattice(kind){
  
  const {w,h} = size();
  const base = Math.max(110, Math.min(230, Math.min(w,h) * 0.07 * CAMERA_ZOOM));
  if(kind==="square") return {a1:{x:base,y:0}, a2:{x:0,y:base}};
  if(kind==="rect")   return {a1:{x:base*1.25,y:0}, a2:{x:0,y:base*0.85}};
  if(kind==="oblique")return {a1:{x:base*1.25,y:-base*0.12}, a2:{x:base*0.35,y:base*0.95}};
  if(kind==="hex")    return {a1:{x:base,y:0}, a2:{x:base/2,y:base*Math.sqrt(3)/2}};
  
  return {a1:{x:base*1.25,y:0}, a2:{x:0,y:base*0.90}};
}

function primitiveBasis(kind, a1, a2){
  if(kind==="centeredRect"){
    
    return {
      p1: scale(add(a1,a2), 0.5),
      p2: scale(sub(a1,a2), 0.5),
    };
  }
  return {p1:a1, p2:a2};
}

function latticePoints(kind, includeCentered=false){
  const {w,h} = size();
  const {a1,a2} = lattice(kind);
  const center = {x:w*0.5, y:h*0.5};

  const pts = [];
  const range = 4;
  for(let i=-range;i<=range;i++){
    for(let j=-range;j<=range;j++){
      const p = add(center, add(scale(a1,i), scale(a2,j)));
      pts.push(p);
      if(kind==="centeredRect" && includeCentered){
        pts.push(add(p, scale(add(a1,a2),0.5))); 
      }
    }
  }
  return {w,h, pts, a1, a2, center};
}




const sections = [
  {
    id:"intro",
    title:"1) O que é “célula unitária” (e por que ela muda de cara)?",
    meta:"Várias escolhas podem descrever o mesmo cristal — contanto que tessela.",
    tag:"Conceito",
    hint:"Use os controles acima do canvas. O desenho muda, mas o cristal continua sendo o mesmo padrão repetido.",
    bodyHTML: `
      <p>
        Um cristal (rede periódica) pode ser descrito por um <b>padrão que se repete</b>.
        A “célula unitária” é um recorte desse padrão que, ao ser <b>transladado</b> (copiado e deslocado),
        preenche o plano sem buracos e sem sobreposição.
      </p>
      <div class="note">
        <b>O ponto mais importante:</b> não existe “um único desenho” de célula unitária.
        Existem infinitas células válidas para a mesma rede — você só está escolhendo um recorte diferente.
      </div>
      <p>
        Na lousa você vê <b>duas células primitivas diferentes</b> (A e B) para a mesma rede.
        A B não é aleatória: ela usa uma combinação inteira dos vetores da rede (uma troca de base),
        então continua tessélando e continua sendo “primitiva”.
      </p>
    `,
    defaults: (state) => {
      state.intro = state.intro ?? {};
      if(state.intro.lattice == null) state.intro.lattice = "square";
      if(state.intro.showB == null) state.intro.showB = true;
      if(state.intro.shift == null) state.intro.shift = 0;
    },
    initControls: (ui, state) => {
      ui.append(
        mkSelect("Rede", [
          ["square","Quadrada (a=a, 90°)"],
          ["rect","Retangular (a≠b, 90°)"],
          ["oblique","Oblíqua (γ≠90°)"],
          ["hex","Hexagonal (triangular)"]
        ], state.intro.lattice, (v)=>{ state.intro.lattice=v; renderCanvasOnly(); }),
        mkRangeArrows("Translação", -6, 6, 0.05, state.intro.shift, (v)=>{ state.intro.shift=v; renderCanvasOnly(); }, (v)=>fmt(v,2)+"×a1"),
        mkToggle("Mostrar célula B", state.intro.showB, (v)=>{ state.intro.showB=v; renderCanvasOnly(); })
      );
    },
    renderCanvas: (state) => {
      clear();
      const {w,h, pts, a1, a2, center} = latticePoints(state.intro.lattice, false);

      
      for(const p of pts) drawPoint(p, 6, "rgba(125,211,252,.90)", "rgba(231,238,252,.18)");

      
      const v1A = a1, v2A = a2;
      const t = Number(state.intro.shift || 0);
      const shift = scale(a1, t);
      const oA = add(centerOriginForParallelogram(v1A, v2A, center), shift);
      const cellA = [oA, add(oA,v1A), add(add(oA,v1A),v2A), add(oA,v2A)];
      drawPoly(cellA, "rgba(125,211,252,.10)", "rgba(125,211,252,.75)", 2);
      drawLabel("célula A (a1, a2)", oA.x+8, oA.y-10, "rgba(125,211,252,.90)");
      drawArrow(oA, add(oA,v1A), "rgba(125,211,252,.90)", 2);
      drawArrow(oA, add(oA,v2A), "rgba(125,211,252,.90)", 2);

      
      if(state.intro.showB){
        const v1B = add(a1,a2);
        const v2B = a2;
        const oB = add(centerOriginForParallelogram(v1B, v2B, add(center, {x:0,y:0})), shift);
        const cellB = [oB, add(oB,v1B), add(add(oB,v1B),v2B), add(oB,v2B)];
        drawPoly(cellB, "rgba(167,139,250,.10)", "rgba(167,139,250,.78)", 2);
        drawLabel("célula B (a1+a2, a2)", oB.x+8, oB.y-10, "rgba(167,139,250,.95)");
      }

      badge("Use a Translação (slider) pra mover a célula: se ela encaixa em qualquer deslocamento, a rede é a mesma.", 56, 56, "rgba(167,139,250,.85)");
    }
  },

  {
    id:"1d",
    title:"2) Célula unitária em uma dimensão",
    meta:"Em uma dimensão a ideia fica cristalina: repetir por translação.",
    tag:"Translação",
    hint:"Arraste o slider e veja o retângulo (célula) mudando o tamanho em tempo real.",
    bodyHTML: `      <p>
        Em 1D, imagine uma fila infinita de pontos igualmente espaçados. A distância entre pontos é o
        <b>parâmetro de rede</b>. Uma célula unitária é um segmento que, ao repetir,
        reconstrói exatamente a fila.
      </p>
      <div class="note">
        O termo <b>tesselar</b> vem do latim <b>tessella</b> que significava um pequeno pedaço cúbico de argila, pedra ou vidro usado para fazer mosaicos.
      </div>
      <p class="muted">
        Dica: uma célula maior pode ser válida (ex.: 2× o espaçamento), mas a “queridinha” é a <b>primitiva</b> (a menor possível).
      </p>`,
    defaults: (state) => {
      state.oneD = state.oneD ?? {};
      if(state.oneD.offset == null) state.oneD.offset = 1.00;
      if(state.oneD.cell == null) state.oneD.cell = 0.5;
      if(state.oneD.showRep == null) state.oneD.showRep = true;
      if(state.oneD.stage == null) state.oneD.stage = 1;
      if(state.oneD.example == null) state.oneD.example = "A";
    },
    initControls: (ui, state) => {
      
      const stagePill = mkSelect("Etapa", [
        ["1","1 — rede"],
        ["2","2 — base (AB/ABC)"]
      ], String(state.oneD.stage ?? 1), (v)=>{
        state.oneD.stage = Number(v);
        updateVisibility();
        renderCanvasOnly();
      });

      const examplePill = mkSelect("Base", [
        ["A","A (um tipo)"],
        ["AB","AB (2 tipos)"],
        ["AB2","AB₂ (2 tipos)"],
        ["A2B","A₂B (2 tipos)"],
        ["ABC","ABC (3 tipos)"]
      ], String(state.oneD.example ?? "A"), (v)=>{
        state.oneD.example = String(v);
        renderCanvasOnly();
      });

      const offsetRow = mkRangeArrows("Translação", 0, 8, 0.05, state.oneD.offset, (v)=>{
        state.oneD.offset = v;
        renderCanvasOnly();
      }, (v)=>fmt(v,2));

      const lenPill = mkSelect("Comprimento", [
        ["0.5","0.50 (pequeno demais)"],
        ["1","1.00 (mínimo)"],
        ["2","2.00 (maior, ainda válido)"]
      ], String(state.oneD.cell), (v)=>{
        state.oneD.cell = Number(v);
        renderCanvasOnly();
      });

      const repToggle = mkToggle("Mostrar repetições", state.oneD.showRep, (v)=>{
        state.oneD.showRep = v;
        renderCanvasOnly();
      });

      ui.append(stagePill, examplePill, offsetRow, lenPill, repToggle);

      function updateVisibility(){
        const isStage2 = Number(state.oneD.stage ?? 1) === 2;
        examplePill.style.display = isStage2 ? "" : "none";
        lenPill.style.display = "";
      }
      updateVisibility();
    },
    renderCanvas: (state) => {
      clear();
      const {w,h} = size();
      const y = h*0.52;

      const base = clamp(Math.min(w/10, 130), 80, 130) * (CAMERA_ZOOM/4);
      const n = 11;
      const span = (n-1)*base;
      const startX = (w/2) - span/2;

      
      const linePad = 40;
      ctx.save();
      ctx.strokeStyle = "rgba(231,238,252,.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX-linePad, y);
      ctx.lineTo(startX+span+linePad, y);
      ctx.stroke();
      ctx.restore();

      
      const pts = [];
      for(let i=0;i<n;i++) pts.push({x:startX+i*base, y});

      const stage = Number(state.oneD.stage ?? 1);
      const ex = String(state.oneD.example ?? "A");

      if(stage === 1){
        for(const p of pts) drawPoint(p, 7, "rgba(125,211,252,.90)");
      }else{
        
        for(const p of pts) drawPoint(p, 4.2, "rgba(231,238,252,.38)", "rgba(231,238,252,.08)");

        const basis =
          (ex==="ABC") ? [
              {name:"A", t:0.0,  r:7.0, fill:"rgba(125,211,252,.92)"},
              {name:"B", t:1/3,  r:6.4, fill:"rgba(167,139,250,.92)"},
              {name:"C", t:2/3,  r:6.4, fill:"rgba(251,113,133,.88)"},
            ]
          : (ex==="AB") ? [
              {name:"A", t:0.0,  r:7.0, fill:"rgba(125,211,252,.92)"},
              {name:"B", t:0.5,  r:6.4, fill:"rgba(167,139,250,.92)"},
            ]
          : (ex==="AB2") ? [
              {name:"A", t:0.0,  r:7.0, fill:"rgba(125,211,252,.92)"},
              {name:"B", t:1/3,  r:6.4, fill:"rgba(167,139,250,.92)"},
              {name:"B", t:2/3,  r:6.4, fill:"rgba(167,139,250,.92)"},
            ]
          : (ex==="A2B") ? [
              {name:"A", t:0.0,  r:7.0, fill:"rgba(125,211,252,.92)"},
              {name:"A", t:1/3,  r:6.4, fill:"rgba(125,211,252,.92)"},
              {name:"B", t:2/3,  r:6.4, fill:"rgba(167,139,250,.92)"},
            ]
          : [
              {name:"A", t:0.0, r:7.0, fill:"rgba(125,211,252,.92)"},
            ];

        
        for(let i=0;i<pts.length-1;i++){
          const xL = pts[i].x;
          for(const b of basis){
            const px = xL + b.t*base;
            drawPoint({x:px, y}, b.r, b.fill, "rgba(231,238,252,.18)");
          }
        }

        
        const lastX = pts[pts.length-1].x;
        drawPoint({x:lastX, y}, 7, "rgba(125,211,252,.92)", "rgba(231,238,252,.18)");

        
        const lx = 32, ly = 32;
        drawPoint({x:lx, y:ly}, 6.2, "rgba(125,211,252,.92)", "rgba(231,238,252,.20)");
        drawLabel("A", lx+12, ly+4, "rgba(231,238,252,.85)");

        let cx = lx + 44;
        if(ex!=="A"){
          drawPoint({x:cx, y:ly}, 6.2, "rgba(167,139,250,.92)", "rgba(231,238,252,.20)");
          drawLabel("B", cx+12, ly+4, "rgba(231,238,252,.85)");
          cx += 44;
        }
        if(ex==="ABC"){
          drawPoint({x:cx, y:ly}, 6.2, "rgba(251,113,133,.88)", "rgba(231,238,252,.20)");
          drawLabel("C", cx+12, ly+4, "rgba(231,238,252,.85)");
        }
      }

      
      const cellRaw = Number(state.oneD.cell);
      const cell = Number.isFinite(cellRaw) ? cellRaw : 0.50;
      const offRaw = Number(state.oneD.offset);
      const off = Number.isFinite(offRaw) ? offRaw : 0;
      const cellW = cell * base;

      const top = y-70, bot = y+70;

      
      const x0 = startX + off*base;

      
      const isTooSmall = (cell < 1);
      const isValid = (!isTooSmall && Math.abs(cell - Math.round(cell)) < 1e-9);
      const color = isTooSmall ? "rgba(251,113,133,.85)" : (isValid ? "rgba(52,211,153,.85)" : "rgba(251,191,36,.85)");

      ctx.save();
      ctx.fillStyle = color.replace("0.85","0.12");
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(x0, top, cellW, bot-top);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      drawLabel("célula", x0+8, top+18, color);

      
      if(state.oneD.showRep){
        for(let k=-4;k<=4;k++){
          if(k===0) continue;
          const xx = x0 + k*cellW;
          ctx.save();
          ctx.strokeStyle = "rgba(231,238,252,.20)";
          ctx.setLineDash([8,8]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(xx, top, cellW, bot-top);
          ctx.stroke();
          ctx.restore();
        }
      }

      const msg = (isTooSmall
            ? "NÃO vale: pequena demais (não tessela ao repetir)."
            : (isValid
                ? (stage===2 ? "Vale: você repetiu uma célula (a) com uma base dentro (ex.: AB/ABC)." : "Vale: ao transladar, você reconstrói a rede.")
                : "Aqui vamos manter múltiplos inteiros (pra ficar didático)."));
      badge(msg, 56, 56, color);
    }

  },

  {
    id:"primitive",
    title:"3) Célula primitiva: o “menor tijolinho” que tessela",
    meta:"Primitiva = menor área (2D) que ainda reproduz a rede por translação.",
    tag:"Primitiva",
    hint:"Este passo foi revisado: o caso ‘retangular centrada’ agora mostra a primitiva como um losango.",
    bodyHTML: `
      <p>
        A <b>célula primitiva</b> é a célula unitária de <b>menor área</b> (em 2D) que ainda consegue
        reconstruir a rede ao transladar. Em geral, ela tem <b>exatamente 1 ponto de rede</b> por célula
        (contando frações de cantos/bordas).
      </p>
      <div class="note">
        <b>Atenção:</b> “menor” não significa “mais simétrica”. A primitiva pode ser um paralelogramo inclinado,
        enquanto a convencional pode ser maior só pra evidenciar simetrias.
      </div>
      <p>
        Na lousa: compare <b>convencional</b> vs <b>primitiva</b>. O exemplo mais didático é a <b>retangular centrada</b>.
      </p>
    `,
    defaults: (state) => {
      state.p = state.p ?? {};
      const P_ALLOWED = ["centeredRect","square","oblique","hex"];
      if(state.p.lattice == null || !P_ALLOWED.includes(state.p.lattice)) state.p.lattice = "centeredRect";
      if(state.p.showConv == null) state.p.showConv = true;
      if(state.p.showPrim == null) state.p.showPrim = true;
    },
    initControls: (ui, state) => {
      ui.append(
        mkSelect("Exemplo", [
          ["centeredRect","Retangular centrada (o clássico)"],
          ["square","Quadrada (conv = prim)"],
          ["oblique","Oblíqua (geral)"],
          ["hex","Hexagonal (triangular)"],
        ], state.p.lattice, (v)=>{ state.p.lattice=v; renderCanvasOnly(); }),
        mkToggle("Convencional", state.p.showConv, (v)=>{ state.p.showConv=v; renderCanvasOnly(); }),
        mkToggle("Primitiva", state.p.showPrim, (v)=>{ state.p.showPrim=v; renderCanvasOnly(); })
      );
    },
    renderCanvas: (state) => {
      clear();
      const kind = state.p.lattice;
      const includeCentered = (kind === "centeredRect");
      const {w,h, pts, a1, a2, center} = latticePoints(kind, includeCentered);

      for(const p of pts) drawPoint(p, 6, "rgba(125,211,252,.90)", "rgba(231,238,252,.18)");

      
      let convPoly = null;
      if(kind==="centeredRect"){
        
        const o = centerOriginForParallelogram(a1, a2, center);
        convPoly = [o, add(o,a1), add(add(o,a1),a2), add(o,a2)];
      }else{
        const o = centerOriginForParallelogram(a1, a2, center);
        convPoly = [o, add(o,a1), add(add(o,a1),a2), add(o,a2)];
      }

      
      const pb = primitiveBasis(kind, a1, a2);
      const oP = centerOriginForParallelogram(pb.p1, pb.p2, center);
      const primPoly = [oP, add(oP,pb.p1), add(add(oP,pb.p1),pb.p2), add(oP,pb.p2)];

      
      const sameConvPrim = !!(convPoly && primPoly && convPoly.length===primPoly.length && convPoly.every((p,i)=>Math.hypot(p.x-primPoly[i].x, p.y-primPoly[i].y) < 1e-6));

      if(state.p.showConv){
        drawPoly(convPoly, "rgba(125,211,252,.10)", "rgba(125,211,252,.70)", 2);
      }
      if(state.p.showPrim){
        drawPoly(primPoly, "rgba(167,139,250,.10)", "rgba(167,139,250,.78)", 3);
      }

      if(sameConvPrim && state.p.showConv && state.p.showPrim){
        drawLabel("primitiva = convencional", primPoly[0].x+8, primPoly[0].y-10, "rgba(167,139,250,.95)");
      }else{
        if(state.p.showConv){
          drawLabel("convencional", convPoly[0].x+8, convPoly[0].y-10, "rgba(125,211,252,.85)");
        }
        if(state.p.showPrim){
          drawLabel("primitiva", primPoly[0].x+8, primPoly[0].y-10, "rgba(167,139,250,.95)");
        }
      }

      
      drawArrow(oP, add(oP,pb.p1), "rgba(167,139,250,.95)", 2);
      drawArrow(oP, add(oP,pb.p2), "rgba(167,139,250,.95)", 2);
      drawLabel("a1", oP.x+pb.p1.x+6, oP.y+pb.p1.y, "rgba(167,139,250,.95)");
      drawLabel("a2", oP.x+pb.p2.x+6, oP.y+pb.p2.y, "rgba(167,139,250,.95)");

      const extra = (kind==="centeredRect")
        ? "Retangular centrada: a convencional é um retângulo com ponto no centro; a primitiva é um losango."
        : "Em muitas redes, a convencional já é primitiva (ou dá pra escolher uma primitiva equivalente).";
      badge(extra, 56, 56, "rgba(125,211,252,.85)");
    }
  },

  {
    id:"vectorsIntro",
    title:"4) Vetores da rede: como a translação é escrita",
    meta:"Todo ponto da rede pode ser alcançado por combinação inteira de a1 e a2.",
    tag:"Vetores",
    hint:"Mude i e j: o vetor resultante aponta para outro ponto da mesma rede.",
    bodyHTML: `
      <p>
        Em uma rede 2D, escolhemos dois vetores de base <b>a1</b> e <b>a2</b>. Com eles, qualquer ponto da rede pode ser escrito como
        <b>R = i·a1 + j·a2</b>, onde <b>i</b> e <b>j</b> são inteiros.
      </p>
      <div class="note">
        <b>Leitura física:</b> isso é exatamente uma <b>translação</b> do padrão. Você “anda” i vezes em a1 e j vezes em a2.
      </div>
      <p>
        Na lousa, a seta verde é o vetor resultante <b>R</b>. As setas tracejadas mostram a decomposição em passos pelos vetores da base.
      </p>
    `,
    defaults: (state) => {
      state.v1 = state.v1 ?? {};
      const allowed = ["square","rect","oblique","hex"];
      if(state.v1.lattice == null || !allowed.includes(state.v1.lattice)) state.v1.lattice = "oblique";
      if(state.v1.i == null) state.v1.i = 2;
      if(state.v1.j == null) state.v1.j = 1;
      if(state.v1.showCell == null) state.v1.showCell = true;
      if(state.v1.showSteps == null) state.v1.showSteps = true;
      state.v1.i = clamp(Math.round(+state.v1.i || 0), -3, 3);
      state.v1.j = clamp(Math.round(+state.v1.j || 0), -3, 3);
    },
    initControls: (ui, state) => {
      ui.append(
        mkSelect("Rede", [
          ["square","Quadrada"],
          ["rect","Retangular"],
          ["oblique","Oblíqua"],
          ["hex","Hexagonal (triangular)"]
        ], state.v1.lattice, (v)=>{ state.v1.lattice=v; renderCanvasOnly(); }),
        mkRangeArrows("Coeficiente i", -3, 3, 1, state.v1.i, (v)=>{ state.v1.i = Math.round(v); renderCanvasOnly(); }, (v)=>String(Math.round(v))),
        mkRangeArrows("Coeficiente j", -3, 3, 1, state.v1.j, (v)=>{ state.v1.j = Math.round(v); renderCanvasOnly(); }, (v)=>String(Math.round(v))),
        mkToggle("Mostrar célula-base", state.v1.showCell, (v)=>{ state.v1.showCell=v; renderCanvasOnly(); }),
        mkToggle("Mostrar decomposição", state.v1.showSteps, (v)=>{ state.v1.showSteps=v; renderCanvasOnly(); })
      );
    },
    renderCanvas: (state) => {
      clear();
      const {pts, a1, a2, center} = latticePoints(state.v1.lattice, false);
      for(const p of pts) drawPoint(p, 5.4, "rgba(125,211,252,.88)", "rgba(231,238,252,.15)");

      const i = Math.round(+state.v1.i || 0);
      const j = Math.round(+state.v1.j || 0);
      const origin = center;
      const pA = add(origin, a1);
      const pB = add(origin, a2);
      const step1 = add(origin, scale(a1, i));
      const R = add(origin, add(scale(a1, i), scale(a2, j)));

      if(state.v1.showCell){
        const o = centerOriginForParallelogram(a1, a2, center);
        const cell = [o, add(o,a1), add(add(o,a1),a2), add(o,a2)];
        drawPoly(cell, "rgba(125,211,252,.08)", "rgba(125,211,252,.42)", 2);
        drawLabel("célula-base", o.x+8, o.y-10, "rgba(125,211,252,.80)");
      }

      drawArrow(origin, pA, "rgba(167,139,250,.95)", 2);
      drawArrow(origin, pB, "rgba(251,191,36,.92)", 2);
      drawLabel("a1", pA.x+6, pA.y-4, "rgba(167,139,250,.95)");
      drawLabel("a2", pB.x+6, pB.y-4, "rgba(251,191,36,.92)");

      if(state.v1.showSteps){
        drawLine(origin, step1, "rgba(52,211,153,.45)", 2, [8,6]);
        drawLine(step1, R, "rgba(52,211,153,.45)", 2, [8,6]);
        if(i !== 0) drawLabel(`${i}·a1`, (origin.x+step1.x)/2 + 6, (origin.y+step1.y)/2 - 6, "rgba(52,211,153,.80)");
        if(j !== 0) drawLabel(`${j}·a2`, (step1.x+R.x)/2 + 6, (step1.y+R.y)/2 - 6, "rgba(52,211,153,.80)");
      }

      drawArrow(origin, R, "rgba(52,211,153,.95)", 3);
      drawPoint(origin, 7.2, "rgba(231,238,252,.95)", "rgba(231,238,252,.35)");
      drawPoint(R, 7.2, "rgba(52,211,153,.95)", "rgba(231,238,252,.35)");
      drawLabel("origem", origin.x+8, origin.y-8, "rgba(231,238,252,.92)");
      drawLabel("R", R.x+8, R.y-8, "rgba(52,211,153,.95)");

      badge(`R = ${i}·a1 + ${j}·a2  →  combinação inteira dos vetores da rede`, 56, 56, "rgba(52,211,153,.92)");
    }
  },

  {
    id:"vectorsBasis",
    title:"5) Troca de base: mudam os vetores, não a rede",
    meta:"Bases diferentes podem gerar exatamente os mesmos pontos de rede.",
    tag:"Vetores",
    hint:"Compare a base original (azul) com a nova base (roxa). A malha de pontos continua igual.",
    bodyHTML: `
      <p>
        Você pode descrever a mesma rede com outro par de vetores. Isso é uma <b>troca de base</b>.
        Se a nova base é formada por combinações inteiras da base antiga e continua sendo primitiva,
        os pontos da rede não mudam — muda só a “régua” que você escolheu.
      </p>
      <div class="note">
        <b>Intuição:</b> é como trocar os eixos de referência sem trocar o piso. O chão (a rede) continua ali.
      </div>
      <p>
        Na lousa, a célula azul usa <b>(a1,a2)</b> e a roxa usa <b>(b1,b2)</b>. Veja que ambas tessselam a mesma rede de pontos.
      </p>
    `,
    defaults: (state) => {
      state.v2 = state.v2 ?? {};
      const allowed = ["square","oblique","hex"];
      if(state.v2.lattice == null || !allowed.includes(state.v2.lattice)) state.v2.lattice = "oblique";
      if(state.v2.preset == null) state.v2.preset = "shear";
      if(state.v2.showA == null) state.v2.showA = true;
      if(state.v2.showB == null) state.v2.showB = true;
    },
    initControls: (ui, state) => {
      ui.append(
        mkSelect("Rede", [
          ["square","Quadrada"],
          ["oblique","Oblíqua"],
          ["hex","Hexagonal (triangular)"]
        ], state.v2.lattice, (v)=>{ state.v2.lattice=v; renderCanvasOnly(); }),
        mkSelect("Troca de base", [
          ["shear","b1=a1+a2, b2=a2"],
          ["swap","b1=a2, b2=a1"],
          ["combo","b1=2a1+a2, b2=a1+a2"]
        ], state.v2.preset, (v)=>{ state.v2.preset=v; renderCanvasOnly(); }),
        mkToggle("Mostrar base original", state.v2.showA, (v)=>{ state.v2.showA=v; renderCanvasOnly(); }),
        mkToggle("Mostrar nova base", state.v2.showB, (v)=>{ state.v2.showB=v; renderCanvasOnly(); })
      );
    },
    renderCanvas: (state) => {
      clear();
      const {pts, a1, a2, center} = latticePoints(state.v2.lattice, false);
      for(const p of pts) drawPoint(p, 5.2, "rgba(125,211,252,.85)", "rgba(231,238,252,.15)");

      let b1, b2, formulaText, detText;
      if(state.v2.preset === "swap"){
        b1 = a2;
        b2 = a1;
        formulaText = "b1 = a2, b2 = a1";
        detText = "det = -1 (mesma área, orientação invertida)";
      }else if(state.v2.preset === "combo"){
        b1 = add(scale(a1,2), a2);
        b2 = add(a1, a2);
        formulaText = "b1 = 2a1 + a2, b2 = a1 + a2";
        detText = "det = +1 (primitiva equivalente)";
      }else{
        b1 = add(a1, a2);
        b2 = a2;
        formulaText = "b1 = a1 + a2, b2 = a2";
        detText = "det = +1 (primitiva equivalente)";
      }

      const oA = centerOriginForParallelogram(a1, a2, center);
      const cellA = [oA, add(oA,a1), add(add(oA,a1),a2), add(oA,a2)];
      const oB = centerOriginForParallelogram(b1, b2, center);
      const cellB = [oB, add(oB,b1), add(add(oB,b1),b2), add(oB,b2)];

      if(state.v2.showA){
        drawPoly(cellA, "rgba(125,211,252,.08)", "rgba(125,211,252,.72)", 2);
        drawArrow(oA, add(oA,a1), "rgba(125,211,252,.95)", 2);
        drawArrow(oA, add(oA,a2), "rgba(125,211,252,.95)", 2);
        drawLabel("a1", oA.x+a1.x+6, oA.y+a1.y-4, "rgba(125,211,252,.95)");
        drawLabel("a2", oA.x+a2.x+6, oA.y+a2.y-4, "rgba(125,211,252,.95)");
        drawLabel("base A", oA.x+8, oA.y-10, "rgba(125,211,252,.90)");
      }

      if(state.v2.showB){
        drawPoly(cellB, "rgba(167,139,250,.08)", "rgba(167,139,250,.82)", 3);
        drawArrow(oB, add(oB,b1), "rgba(167,139,250,.95)", 2);
        drawArrow(oB, add(oB,b2), "rgba(167,139,250,.95)", 2);
        drawLabel("b1", oB.x+b1.x+6, oB.y+b1.y-4, "rgba(167,139,250,.95)");
        drawLabel("b2", oB.x+b2.x+6, oB.y+b2.y-4, "rgba(167,139,250,.95)");
        drawLabel("base B", oB.x+8, oB.y-10, "rgba(167,139,250,.95)");
      }

      drawLabel(formulaText, 56, 42, "rgba(167,139,250,.95)");
      drawLabel(detText, 56, 58, "rgba(231,238,252,.86)");
      badge("Mesma rede, nova base (muda a descrição; não muda o conjunto de pontos).", 56, 72, "rgba(167,139,250,.92)");
    }
  },


  {
    id:"centeredRect",
    title:"6) Rede retangular centrada: mesma estrutura, duas leituras",
    meta:"Convencional (retângulo + ponto central) vs primitiva (losango).",
    tag:"2D clássico",
    hint:"Agora tudo fica centralizado. Ajuste a e b e veja o losango se adaptar em tempo real.",
    bodyHTML: `
      <p>
        A <b>rede retangular centrada</b> é o exemplo didático perfeito: a célula convencional é um
        retângulo que mostra bem a simetria, mas a célula primitiva é um <b>losango</b> (rômbus) menor
        que ainda tessela o plano.
      </p>
      <div class="note">
        <b>Convencional:</b> retângulo com um ponto no centro.
        <br/>
        <b>Primitiva:</b> losango com vetores (a/2, b/2) e (a/2, −b/2).
      </div>
    `,
    defaults: (state) => {
      state.cr = state.cr ?? {};
      if(state.cr.showConv == null) state.cr.showConv = true;
      if(state.cr.showPrim == null) state.cr.showPrim = true;
      if(state.cr.a == null) state.cr.a = 1.0;
      if(state.cr.b == null) state.cr.b = 1.6;
      state.cr.a = clamp(+state.cr.a || 1.0, 0.5, 3.0);
      state.cr.b = clamp(+state.cr.b || 1.6, 0.5, 3.0);
    },
    initControls: (ui, state) => {
      ui.append(
        mkRange("a", 0.7, 1.6, 0.01, state.cr.a, (v)=>{ state.cr.a=v; renderCanvasOnly(); }, (v)=>fmt(v,2)),
        mkRange("b", 0.9, 2.2, 0.01, state.cr.b, (v)=>{ state.cr.b=v; renderCanvasOnly(); }, (v)=>fmt(v,2)),
        mkToggle("Convencional", state.cr.showConv, (v)=>{ state.cr.showConv=v; renderCanvasOnly(); }),
        mkToggle("Primitiva", state.cr.showPrim, (v)=>{ state.cr.showPrim=v; renderCanvasOnly(); })
      );
    },
    renderCanvas: (state) => {
      clear();
      const {w,h} = size();
      const scalePx = clamp(Math.min(w,h)*0.06*CAMERA_ZOOM, 95, 220);
      const a = state.cr.a*scalePx;
      const b = state.cr.b*scalePx;

      const center = {x:w*0.5, y:h*0.5};
      const origin = {x: center.x - a/2, y: center.y - b/2};

      
      const pts = [];
      for(let i=-3;i<=3;i++){
        for(let j=-3;j<=3;j++){
          const p = {x: origin.x + i*a, y: origin.y + j*b};
          pts.push(p);
          pts.push({x: p.x + a/2, y: p.y + b/2});
        }
      }
      for(const p of pts) drawPoint(p, 5, "rgba(125,211,252,.88)", "rgba(231,238,252,.18)");

      if(state.cr.showConv){
        const conv = [
          {x: origin.x, y: origin.y},
          {x: origin.x + a, y: origin.y},
          {x: origin.x + a, y: origin.y + b},
          {x: origin.x, y: origin.y + b},
        ];
        drawPoly(conv, "rgba(125,211,252,.10)", "rgba(125,211,252,.70)", 2);
        drawLabel("convencional", conv[0].x+8, conv[0].y-10, "rgba(125,211,252,.85)");
      }

      if(state.cr.showPrim){
        const p0 = {x: origin.x + a/2, y: origin.y + b/2};
        const a1 = {x: a/2, y: b/2};
        const a2 = {x: a/2, y: -b/2};
        const prim = [p0, add(p0,a1), add(add(p0,a1),a2), add(p0,a2)];
        drawPoly(prim, "rgba(167,139,250,.10)", "rgba(167,139,250,.78)", 3);
        drawLabel("primitiva", prim[0].x+8, prim[0].y-10, "rgba(167,139,250,.95)");
        drawArrow(p0, add(p0,a1), "rgba(167,139,250,.90)", 2);
        drawArrow(p0, add(p0,a2), "rgba(167,139,250,.90)", 2);
      }

      badge("Mesma rede. Células diferentes. A primitiva é menor, mas ambas tessélam o plano.", 56, 56, "rgba(167,139,250,.85)");
    }
  },

  {
    id:"bravais",
    title:"7) Mapa mental: quando conv = prim e quando não",
    meta:"O que procurar (sem virar refém de 3D).",
    tag:"Biblioteca",
    hint:"Aqui é referência rápida: a ideia é saber justificar a escolha da célula.",
    bodyHTML: `
      <p>
        Em muitos sistemas, a célula “convencional” é escolhida por <b>simetria</b> e por ser fácil de comparar.
        Mas a célula <b>primitiva</b> é a menor que descreve a rede.
      </p>
      <div class="note">
        <b>Regra prática:</b> se a célula “bonita” tem pontos extras (tipo ponto no centro), provavelmente existe
        uma primitiva inclinada menor.
      </div>
      <p class="muted">
        (No 3D isso aparece forte em FCC/BCC vs SC. Em 2D, o análogo perfeito é a retangular centrada.)
      </p>
    `,
    defaults: (state) => {
      state.bv = state.bv ?? {};
      const BV_ALLOWED = ["square","centeredRect","oblique","hex"];
      if(state.bv.which == null || !BV_ALLOWED.includes(state.bv.which)) state.bv.which = "square";
    },
    initControls: (ui, state) => {
      ui.append(
        mkSelect("Caso", [
          ["square","Quadrada (conv = prim)"],
          ["centeredRect","Retangular centrada (conv ≠ prim)"],
          ["oblique","Oblíqua (conv = prim)"],
          ["hex","Hexagonal (conv costuma ser primitiva)"],
        ], state.bv.which, (v)=>{ state.bv.which=v; renderCanvasOnly(); })
      );
    },
    renderCanvas: (state) => {
      clear();
      const kind = state.bv.which;
      const includeCentered = (kind==="centeredRect");
      const {w,h, pts, a1, a2, center} = latticePoints(kind, includeCentered);

      for(const p of pts) drawPoint(p, 6, "rgba(125,211,252,.88)", "rgba(231,238,252,.16)");

      const pb = primitiveBasis(kind, a1, a2);
      const oP = centerOriginForParallelogram(pb.p1, pb.p2, center);
      const prim = [oP, add(oP,pb.p1), add(add(oP,pb.p1),pb.p2), add(oP,pb.p2)];
      drawPoly(prim, "rgba(167,139,250,.10)", "rgba(167,139,250,.75)", 3);
      drawLabel("primitiva (referência)", prim[0].x+8, prim[0].y-10, "rgba(167,139,250,.95)");

      if(kind==="centeredRect"){
        const oC = centerOriginForParallelogram(a1, a2, center);
        const conv = [oC, add(oC,a1), add(add(oC,a1),a2), add(oC,a2)];
        drawPoly(conv, "rgba(125,211,252,.07)", "rgba(125,211,252,.45)", 2);
        drawLabel("convencional", conv[0].x+8, conv[0].y-10, "rgba(125,211,252,.85)");
      }

      badge("Pensa assim: convencional mostra simetria; primitiva minimiza área/volume.", 56, 56, "rgba(125,211,252,.85)");
    }
  },

  {
    id:"wigner",
    title:"8) Wigner–Seitz / Voronoi em 2D: construindo passo a passo",
    meta:"Centro → vizinhos → bissetores → polígono interno (a célula).",
    tag:"Wigner–Seitz",
    hint:"Clique nas esferas na lousa pra escolher o centro. Use Passo (1–6) ou as teclas 1…6.",
        bodyHTML: `
      <p>
        Aqui a gente constrói a célula de <b>Wigner–Seitz</b> em 2D do jeitinho mais visual possível.
        Ela é exatamente a célula de <b>Voronoi</b> do ponto de rede: a região do plano que está
        <b>mais perto do centro</b> do que de qualquer outro ponto.
      </p>

      <ol>
        <li><b>Escolha um átomo central</b> (clique na lousa).</li>
        <li><b>Desenhe linhas</b> do centro para os átomos <b>próximos</b> (os mais próximos já bastam).</li>
        <li><b>Marque os pontos médios</b> de cada linha.</li>
        <li><b>Trace as perpendiculares</b> (bissetores) passando pelos pontos médios.</li>
        <li><b>Encontre a forma mais interna</b>: o polígono fechado “lá no miolo”.</li>
        <li><b>Cheque a tesselação</b>: copie por translação e veja que <b>preenche o espaço</b> sem buracos.</li>
      </ol>

      <div class="note">
        <b>Resumo nerd:</b> isso é um algoritmo de Voronoi. A célula de Wigner–Seitz é a célula de Voronoi
        gerada a partir de uma rede cristalina. Em 3D, o equivalente são os <b>poliedros de Voronoi</b>.
      </div>
    `,
    defaults: (state) => {
      state.ws = state.ws ?? {};
      const WS_ALLOWED = ["square","rect","tri","oblique"];
      if(state.ws.lattice == null || !WS_ALLOWED.includes(state.ws.lattice)) state.ws.lattice = "tri";
      if(state.ws.step == null) state.ws.step = 1;
      state.ws.step = clamp(Math.round(state.ws.step), 1, 6);
      if(state.ws.showTile == null) state.ws.showTile = true;
      if(state.ws.centerIndex === undefined) state.ws.centerIndex = null;
    },
    initControls: (ui, state) => {
      ui.append(
        mkSelect("Rede", [
          ["square","Quadrada"],
          ["rect","Retangular"],
          ["tri","Triangular (hex)"],
          ["oblique","Oblíqua"]
        ], state.ws.lattice, (v)=>{ state.ws.lattice=v; state.ws.centerIndex=null; renderCanvasOnly(); }),
        mkRangeArrows("Passo", 1, 6, 1, state.ws.step, (v)=>{ state.ws.step=v; renderCanvasOnly(); }, (v)=>String(v)),
        mkToggle("Tesselação", state.ws.showTile, (v)=>{ state.ws.showTile=v; renderCanvasOnly(); }));
    },
    onCanvasClick: (state, pt) => {
      const {w,h} = size();
      const paper = {x: 0, y: 0, w, h};
      
      if(pt.x < paper.x || pt.x > paper.x+paper.w || pt.y < paper.y || pt.y > paper.y+paper.h) return;

      const grid = wsGrid(state.ws);
      let best = -1, bestD = Infinity;
      for(let i=0;i<grid.points.length;i++){
        const p = grid.points[i];
        if(p.x < paper.x || p.x > paper.x+paper.w || p.y < paper.y || p.y > paper.y+paper.h) continue;
        const d = (p.x-pt.x)**2 + (p.y-pt.y)**2;
        if(d<bestD){ bestD=d; best=i; }
      }
      if(best>=0){
        state.ws.centerIndex = best;
        renderCanvasOnly();
      }
    },
    onKey: (state, key) => {
      if(key>="1" && key<="6"){
        state.ws.step = Number(key);
        renderCanvasOnly();
        return true;
      }
      return false;
    },
    
    renderCanvas: (state) => {
      clear();
      const {w,h} = size();
      
      const paper = {x: 0, y: 0, w, h};


      const grid = wsGrid(state.ws);
      const points = grid.points;

      
      const paperCenter = {x: paper.x + paper.w/2, y: paper.y + paper.h/2};
      let centerIndex = state.ws.centerIndex;
      if(centerIndex==null){
        let best=-1, bestD=Infinity;
        for(let i=0;i<points.length;i++){
          const p = points[i];
          const d = (p.x-paperCenter.x)**2 + (p.y-paperCenter.y)**2;
          if(d<bestD){ bestD=d; best=i; }
        }
        centerIndex = best;
      }

      const C = points[centerIndex];

      
      for(const p of points){
        drawPoint(p, 7.5, "rgba(125,211,252,.92)", "rgba(231,238,252,.22)");
      }

      
      drawPoint(C, 9.5, "rgba(167,139,250,.95)", "rgba(231,238,252,.22)");

      
      const neighbors = nearest(points, centerIndex, 18);

      
      const bounds = [
        {x: paper.x, y: paper.y},
        {x: paper.x+paper.w, y: paper.y},
        {x: paper.x+paper.w, y: paper.y+paper.h},
        {x: paper.x, y: paper.y+paper.h}
      ];
      const cell = voronoiCell(C, neighbors.map(i=>points[i]), bounds);

      
      if(state.ws.step >= 2){
        for(const i of neighbors){
          drawLine(C, points[i], "rgba(251,113,133,.80)", 2);
        }
      }

      
      if(state.ws.step >= 3){
        for(const i of neighbors){
          const m = scale(add(C, points[i]), 0.5);
          drawPoint(m, 4.2, "rgba(52,211,153,.95)", "rgba(16,185,129,.22)");
        }
      }

      
      if(state.ws.step >= 4){
        
        for(const i of neighbors){
          const P = points[i];
          const mid = scale(add(C,P), 0.5); 
          const n = sub(P,C);
          const perp = {x: -n.y, y: n.x};
          const len = Math.hypot(perp.x, perp.y) || 1;
          const u = {x: perp.x/len, y: perp.y/len};
          const seg = (Math.hypot(n.x, n.y) || 1) * 0.55; 
          const L1 = add(mid, scale(u, seg));
          const L2 = add(mid, scale(u, -seg));
          drawLine(L1, L2, "rgba(125,211,252,.55)", 2);
        }

        
        for(const i of neighbors){
          const m = scale(add(C, points[i]), 0.5);
          drawPoint(m, 4.2, "rgba(52,211,153,.95)", "rgba(16,185,129,.22)");
        }
      }

      
      if(state.ws.step >= 5){
        drawPoly(cell, "rgba(167,139,250,.16)", "rgba(167,139,250,.92)", 3);
      }

      
      if(state.ws.step >= 6){
        if(state.ws.showTile){
          const vecs = grid.tileVecs;
          
          for(let i=-2;i<=2;i++){
            for(let j=-2;j<=2;j++){
              const s = add(scale(vecs.v1,i), scale(vecs.v2,j));
              const poly = cell.map(p=>add(p,s));
              const isCenter = (i===0 && j===0);
              drawPoly(poly,
                isCenter ? "rgba(167,139,250,.16)" : "rgba(167,139,250,.08)",
                isCenter ? "rgba(167,139,250,.70)" : "rgba(167,139,250,.22)",
                isCenter ? 3 : 2
              );
            }
          }
          
          drawLabel("Preenche completamente o espaço", paper.x+18, paper.y+28, "rgba(231,238,252,.85)");
        }else{
          
          drawPoly(cell, "rgba(34,197,94,.22)", "rgba(16,185,129,.85)", 3);
        }
      }

      ctx.restore(); 

      
      
      for(const p of points){
        drawPoint(p, 7.5, "rgba(125,211,252,.92)", "rgba(231,238,252,.22)");
      }
      drawPoint(C, 9.5, "rgba(167,139,250,.95)", "rgba(231,238,252,.22)");

      const stepMsg = [
        "1. Escolha um átomo central",
        "2. Linhas para átomos próximos",
        "3. Pontos médios das linhas",
        "4. Bissetores perpendiculares",
        "5. Forma mais interna = célula",
        "6. Tesselação: preenche o espaço"
      ][state.ws.step-1];
      badge(stepMsg, 56, 56, "rgba(167,139,250,.80)");
    }
  },
];




function wsGrid(ws){
  const {w,h} = size();
  const base = Math.max(110, Math.min(220, Math.min(w,h) * 0.065 * CAMERA_ZOOM));
  const origin = {x:w*0.5, y:h*0.5};
  let v1, v2;

  if(ws.lattice==="square"){
    v1 = {x:base, y:0}; v2 = {x:0, y:base};
  }else if(ws.lattice==="rect"){
    v1 = {x:base*1.35, y:0}; v2 = {x:0, y:base*0.85};
  }else if(ws.lattice==="tri"){
    v1 = {x:base, y:0}; v2 = {x:base/2, y:base*Math.sqrt(3)/2};
  }else{
    v1 = {x:base*1.3, y:-base*0.15}; v2 = {x:base*0.35, y:base*0.95};
  }

  const points = [];
  const range = 4;
  for(let i=-range;i<=range;i++){
    for(let j=-range;j<=range;j++){
      points.push(add(origin, add(scale(v1,i), scale(v2,j))));
    }
  }

  const target = origin;
  let best=0, bestD=Infinity;
  for(let i=0;i<points.length;i++){
    const p=points[i];
    const d=(p.x-target.x)**2+(p.y-target.y)**2;
    if(d<bestD){bestD=d; best=i;}
  }

  return { points, defaultCenterIndex: best, tileVecs: {v1,v2} };
}

function nearest(points, idx, k){
  
  
  
  const C = points[idx];
  const cand = [];
  for(let i=0;i<points.length;i++){
    if(i===idx) continue;
    const p = points[i];
    const dx = p.x - C.x, dy = p.y - C.y;
    const d2 = dx*dx + dy*dy;
    const ang = Math.atan2(dy, dx);
    cand.push({d2, i, ang});
  }
  cand.sort((a,b)=>a.d2-b.d2);

  const picked = [];
  
  const ANG_EPS = 0.12; 
  for(const c of cand){
    let blocked = false;
    for(const p of picked){
      
      const diff = Math.atan2(Math.sin(c.ang - p.ang), Math.cos(c.ang - p.ang));
      if(Math.abs(diff) < ANG_EPS){
        
        blocked = true;
        break;
      }
    }
    if(!blocked){
      picked.push(c);
      if(picked.length >= k) break;
    }
  }

  picked.sort((a,b)=>a.d2-b.d2);
  return picked.map(o=>o.i);
}





const btnPrev = $("#btnPrev");
const btnNext = $("#btnNext");
const btnReset = $("#btnReset");
const progFill = $("#progFill");
const progCount = $("#progCount");

let state = loadState() || {};

state.ui = state.ui || {};
if(typeof state.ui.zoom !== "number") state.ui.zoom = 4;
CAMERA_ZOOM = state.ui.zoom;

state.active = sections[0].id;


for(const s of sections){ if(s.defaults) s.defaults(state); }

function activeIndex(){
  const idx = sections.findIndex(s=>s.id===state.active);
  return idx >= 0 ? idx : 0;
}

function updateNavUI(){
  const idx = activeIndex();
  if(btnPrev) btnPrev.disabled = (idx === 0);
  if(btnNext) btnNext.disabled = (idx === sections.length - 1);
  if(progCount) progCount.textContent = `${idx+1}/${sections.length}`;
  if(progFill){
    const pct = (sections.length <= 1) ? 1 : (idx / (sections.length - 1));
    progFill.style.width = (pct * 100).toFixed(1) + "%";
  }
}


function pruneDidacticText(){
  const root = $("#secBody");
  if(!root) return;
  
  root.querySelectorAll(".muted").forEach(el=>el.remove());
  
  for(const n of Array.from(root.querySelectorAll(".note"))){
    if(!n.textContent || !n.textContent.trim()) n.remove();
  }
}

function renderSection(){
  const s = sections[activeIndex()];
  $("#secTitle").textContent = s.title;
  $("#secMeta").textContent = s.meta;
  $("#secTag").textContent = s.tag || "2D";
  $("#secHint").textContent = s.hint || "";
  $("#secBody").innerHTML = s.bodyHTML;
  pruneDidacticText();

  const ui = $("#canvasControls");
  ui.innerHTML = "";
  
  ui.append(
    mkRangeArrows("Zoom", 1, 12, 0.1, state.ui.zoom, (v)=>{
      state.ui.zoom = v;
      CAMERA_ZOOM = v;
      renderCanvasOnly();
    }, (v)=>fmt(v,2)+"×")
  );
  if(s.initControls) s.initControls(ui, state);

  $("#vizMeta").textContent = (s.tag ? (s.tag + " • ") : "") + "canvas 2D";
  $("#vizTag").textContent = s.id === "wigner" ? "Wigner–Seitz" : "Canvas";

  updateNavUI();
}

function renderCanvasOnly(){
  
  DPR();
  CAMERA_ZOOM = clamp(+state.ui.zoom || 4, 1, 12);
  const {w,h} = size();
  const s = sections[activeIndex()];
  if(w < 10 || h < 10){
    requestAnimationFrame(()=>{
      DPR();
      const s2 = sections[activeIndex()];
      if(s2.renderCanvas) s2.renderCanvas(state);
      saveState();
    });
    return;
  }
  if(s.renderCanvas) s.renderCanvas(state);
  saveState();
}

function render(){
  
  for(const s of sections){ if(s.defaults) s.defaults(state); }
  renderSection();
  
  requestAnimationFrame(()=>{
    DPR();
    renderCanvasOnly();
    requestAnimationFrame(()=>{
      DPR();
      renderCanvasOnly();
    });
  });
}

function goByDelta(d){
  const idx = activeIndex();
  const next = clamp(idx + d, 0, sections.length - 1);
  state.active = sections[next].id;
  render();
}

if(btnPrev) btnPrev.addEventListener("click", ()=>goByDelta(-1));
if(btnNext) btnNext.addEventListener("click", ()=>goByDelta(1));

if(btnReset) btnReset.addEventListener("click", ()=>{
  
  const s = sections[activeIndex()];
  const map = {
    intro: "intro",
    "1d": "oneD",
    primitive: "p",
    vectorsIntro: "v1",
    vectorsBasis: "v2",
    centeredRect: "cr",
    bravais: "bv",
    wigner: "ws"
  };
  const key = map[s.id];
  if(key) delete state[key];
  render();
});


window.addEventListener("keydown", (e)=>{
  if(e.key === "ArrowLeft") goByDelta(-1);
  if(e.key === "ArrowRight") goByDelta(1);
  const s = sections[activeIndex()];
  if(s.onKey){
    const used = s.onKey(state, e.key);
    if(used) e.preventDefault();
  }
});

canvas.addEventListener("pointerdown", (e)=>{
  const rect = canvas.getBoundingClientRect();
  const pt = {x: e.clientX - rect.left, y: e.clientY - rect.top};
  const s = sections[activeIndex()];
  if(s.onCanvasClick) s.onCanvasClick(state, pt);
});




function saveState(){
  try{
    const s = {...state};
  s.__ver = APP_VER;
  
  delete s.active;
    localStorage.setItem("puc2d_state", JSON.stringify(s));
  }catch(_){}
}
function loadState(){
  try{
    const raw = localStorage.getItem("puc2d_state");
    if(!raw) return null;
    const s = JSON.parse(raw);

    
    const ver = Number(s.__ver || 0);
    if(ver < APP_VER){
      s.oneD = s.oneD || {};
      
      if(typeof s.oneD.cell !== "number") s.oneD.cell = 0.25;
      else if(ver < 3) s.oneD.cell = 0.25;

      
      s.ws = s.ws || {};
      if(typeof s.ws.step !== "number" || ver < 4) s.ws.step = 1;
      if(typeof s.ws.lattice !== "string" || ver < 4) s.ws.lattice = "tri";
      if(typeof s.ws.showTile !== "boolean") s.ws.showTile = true;

      s.__ver = APP_VER;
    }
    return s;
  }catch(_){ return null; }
}


APP_READY = true;
render();


window.addEventListener("load", ()=>{
  DPR();
  renderCanvasOnly();
});
requestAnimationFrame(()=>{
  DPR();
  renderCanvasOnly();
});
setTimeout(()=>{
  DPR();
  renderCanvasOnly();
}, 80);
