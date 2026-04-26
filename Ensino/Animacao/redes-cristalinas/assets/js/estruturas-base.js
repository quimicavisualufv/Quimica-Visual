
(function(){
  if (window.__introBuracosFCC_clean) return; window.__introBuracosFCC_clean = true;

  const TAU = Math.PI*2;
  const canvas = document.getElementById('canvas') || document.querySelector('canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  const introState = {
    angleX: Math.PI, angleY: 16*Math.PI/180, angleZ: 8*Math.PI/180,
    distance: 3.6, zoom: 0.95,
    dragging:false, lastX:0, lastY:0, sensitivity: 0.008
  };

  function rotX(p,a){const s=Math.sin(a),c=Math.cos(a);return [p[0],c*p[1]-s*p[2],s*p[1]+c*p[2]];}
  function rotY(p,a){const s=Math.sin(a),c=Math.cos(a);return [ c*p[0]+s*p[2], p[1], -s*p[0]+c*p[2] ];}
  function rotZ(p,a){const s=Math.sin(a),c=Math.cos(a);return [ c*p[0]-s*p[1], s*p[0]+c*p[1], p[2] ];}

  function introIsOrtho(){
    try {
      
      return !!(ui && ui.projecaoOrto && ui.projecaoOrto.checked);
    } catch(e){ return false; }
  }

  function projectIntro(p){
    let v=[p[0]-0.5,p[1]-0.5,p[2]-0.5];
    v=rotX(v,introState.angleX); v=rotY(v,introState.angleY); v=rotZ(v,introState.angleZ);
    const w=canvas.clientWidth, h=canvas.clientHeight;
    const sp = (ui.spacing && +ui.spacing.value) || 140;
    
    const t = Math.max(40, Math.min(300, sp));
    const scaleFromSpacing = 0.30 + (t - 40) * ( (2.20 - 0.30) / (300 - 40) );
    const s=Math.min(w,h)*0.9*introState.zoom*scaleFromSpacing; const d=introState.distance;
    const z = v[2] + d;
    const f = introIsOrtho() ? 1 : (d / z);
    return {x:w/2+v[0]*s*f, y:h/2-v[1]*s*f, z, f};
  }

  const HOST_FCC = [
    [0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1],
    [0.5,0.5,0],[0.5,0,0.5],[0,0.5,0.5],[0.5,0.5,1],[0.5,1,0.5],[1,0.5,0.5]
  ];
  const HOLES_TETRA = [
    [0.25,0.25,0.25],[0.25,0.75,0.75],[0.75,0.25,0.75],[0.75,0.75,0.25]
  ];
  const HOLES_OCTA = [
    [0.5,0.5,0.5],
    [0.5,0.5,0],[0.5,0.5,1],[0.5,0,0.5],[0.5,1,0.5],[0,0.5,0.5],[1,0.5,0.5],
    [0.5,0,0],[1,0.5,0],[0.5,1,0],[0,0.5,0],[0.5,0,1],[1,0.5,1],[0.5,1,1],[0,0.5,1]
  ];

  const uiIntro = {
    radius: document.getElementById('radius') || { value: 14 },
    holeMode: document.getElementById('holeMode') || { value: 'both' },
    holeLabels: document.getElementById('holeLabels') || { checked: true },
  };

  function drawEdgeCube(offset){
    offset = offset||{x:0,y:0};
    const C=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
    const E=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    ctx.strokeStyle='rgba(148,163,184,.65)'; ctx.lineWidth=1.2;
    for(const [i,j] of E){ const a=projectIntro(C[i]), b=projectIntro(C[j]);
      ctx.beginPath(); ctx.moveTo(a.x+offset.x,a.y+offset.y); ctx.lineTo(b.x+offset.x,b.y+offset.y); ctx.stroke();
    }
  }

  function glossyFillCircle(p, r, color){
    const R = r * (introIsOrtho() ? 1 : p.f);
    const g = ctx.createRadialGradient(p.x-R*0.35, p.y-R*0.35, R*0.2, p.x, p.y, R);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, TAU); ctx.fill();
    const hR = Math.max(2, R*0.28);
    const h = ctx.createRadialGradient(p.x-R*0.45, p.y-R*0.45, 1, p.x-R*0.45, p.y-R*0.45, hR);
    h.addColorStop(0, 'rgba(255,255,255,0.85)');
    h.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = h; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, TAU); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.1)'; ctx.lineWidth=1; ctx.stroke();
  }

  function glossyFillHex(p, size, base){
    const R = size * (introIsOrtho() ? 1 : p.f);
    const g = ctx.createRadialGradient(p.x-R*0.35, p.y-R*0.35, R*0.15, p.x, p.y, R);
    g.addColorStop(0, base);
    g.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g;
    ctx.beginPath();
    for(let i=0;i<6;i++){
      const a=(Math.PI/6)+i*TAU/6;
      const x=p.x+R*Math.cos(a), y=p.y+R*Math.sin(a);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.fill();
    const h = ctx.createRadialGradient(p.x-R*0.45, p.y-R*0.45, 1, p.x-R*0.45, p.y-R*0.45, R*0.35);
    h.addColorStop(0, 'rgba(255,255,255,0.7)'); h.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle=h; ctx.beginPath();
    for(let i=0;i<6;i++){
      const a=(Math.PI/6)+i*TAU/6;
      const x=p.x+R*Math.cos(a), y=p.y+R*Math.sin(a);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=1; ctx.stroke();
  }

  function drawHoleLabels(offset){
    const ox=(offset&&offset.x)||0, oy=(offset&&offset.y)||0;
    if(!uiIntro.holeLabels.checked) return;
    ctx.fillStyle='rgba(248,250,252,.9)';
    ctx.font='12px system-ui, ui-sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const mids=[[0.5,0,0],[1,0.5,0],[0.5,1,0],[0,0.5,0],[0.5,0,1],[1,0.5,1],[0.5,1,1],[0,0.5,1]];
    for(const m of mids){ const p=projectIntro(m); ctx.fillText('½', p.x+ox, p.y+oy); }
    const c=projectIntro([0.5,0.5,0.5]); ctx.fillText('½', c.x+ox, c.y+oy);
    const t=projectIntro([0.25,0.75,0.75]); ctx.fillText('(¼,¾)', t.x+16+ox, t.y-10+oy);
    const y=projectIntro([0,1,0]); ctx.fillText('(0,1)', y.x+18+ox, y.y-4+oy);
    const x=projectIntro([1,0,0]); ctx.fillText('(0,1)', x.x+12+ox, x.y+16+oy);
  }

  
  
  function drawPanelSquareFCC(x, y, size){
    
    const s = size;
    const left = x - s/2, top = y - s/2, right = x + s/2, bottom = y + s/2;
    
    ctx.strokeStyle='rgba(203,213,225,0.8)'; ctx.lineWidth=1.2;
    ctx.strokeRect(left, top, s, s);
    
    ctx.setLineDash([6,6]);
    ctx.beginPath();
    ctx.moveTo((left+right)/2, top); ctx.lineTo((left+right)/2, bottom);
    ctx.moveTo(left, (top+bottom)/2); ctx.lineTo(right, (top+bottom)/2);
    ctx.strokeStyle='rgba(248,113,113,0.85)'; ctx.stroke();
    ctx.setLineDash([]);
    
    const r = (+ui.radius.value||14)*0.45;
    function circle(px,py,fill){ 
      const g = ctx.createRadialGradient(px-r*0.35, py-r*0.35, r*0.25, px, py, r);
      g.addColorStop(0, fill); g.addColorStop(1,'rgba(0,0,0,0.35)'); 
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1; ctx.stroke();
    }
    const red='rgba(239,68,68,1)'; const gray='rgba(148,163,184,1)';
    
    circle(left+10, top+10, red); circle(right-10, top+10, red);
    circle(left+10, bottom-10, red); circle(right-10, bottom-10, red);
    
    circle((left+right)/2, top+10, red); circle((left+right)/2, bottom-10, red);
    circle(left+10, (top+bottom)/2, red); circle(right-10, (top+bottom)/2, red);
    
    if((uiIntro.holeMode && (uiIntro.holeMode.value==='octa' || uiIntro.holeMode.value==='both')) || !uiIntro.holeMode){
      circle((left+right)/2, (top+bottom)/2, 'rgba(96,165,250,1)');
    }
    
    if(!uiIntro.holeLabels || uiIntro.holeLabels.checked){
      ctx.fillStyle='rgba(248,250,252,.95)'; ctx.font='12px system-ui, ui-sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('½', (left+right)/2, top + 18);
      ctx.fillText('½', (left+right)/2, bottom - 18);
      ctx.fillText('½', left + 18, (top+bottom)/2);
      ctx.fillText('½', right - 18, (top+bottom)/2);
      ctx.fillText('(0,1)', right - 18, top + 16);
      ctx.fillText('(0,1)', left + 18, bottom - 16);
    }
  }

  function drawPanelTriFCC(x, y, size){
    
    const s=size;
    const left=x-s/2, top=y-s/2, right=x+s/2, bottom=y+s/2;
    
    ctx.strokeStyle='rgba(203,213,225,0.8)'; ctx.lineWidth=1.2;
    ctx.strokeRect(left, top, s, s);

    
    const r = (+ui.radius.value||14)*0.42;
    const a = s*0.26;
    const ox = x; const oy = y+4;
    const pts = [];
    for(let i=-1;i<=1;i++){
      for(let j=-1;j<=1;j++){
        const px = ox + (i+j*0.5)*a;
        const py = oy + (j*Math.sqrt(3)/2)*a;
        pts.push({x:px, y:py});
      }
    }
    
    ctx.setLineDash([6,6]); ctx.strokeStyle='rgba(248,113,113,0.85)'; ctx.lineWidth=1.2;
    for(const p of pts){
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    ctx.setLineDash([]);
    
    function circle(px,py,fill){ 
      const g = ctx.createRadialGradient(px-r*0.35, py-r*0.35, r*0.25, px, py, r);
      g.addColorStop(0, fill); g.addColorStop(1,'rgba(0,0,0,0.35)'); 
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1; ctx.stroke();
    }
    const red='rgba(239,68,68,1)'; 
    pts.forEach(p=>circle(p.x,p.y,red));
    
    if(!uiIntro.holeMode || uiIntro.holeMode.value!=='octa'){
      const g = ctx.createRadialGradient(ox-r*0.35, oy-r*0.35, r*0.25, ox, oy, r);
      g.addColorStop(0, 'rgba(156,163,175,1)'); g.addColorStop(1,'rgba(0,0,0,0.35)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(ox, oy, r*0.9, 0, Math.PI*2); ctx.fill();
    }
    
    if(!uiIntro.holeLabels || uiIntro.holeLabels.checked){
      ctx.fillStyle='rgba(248,250,252,.95)'; ctx.font='12px system-ui, ui-sans-serif'; ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      ctx.fillText('(¼,¾)', ox + r*1.6, oy - r*1.2);
    }
  }




function drawIntroBuracoFCC(){
    const Rbase = (+ui.radius.value || 14);
    
    const R = Rbase * 1.15;

    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0,0,w,h);

    
    const cube = [[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    const P = cube.map(projectIntro);

    
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    for(const p of P){ if(p.x<minX)minX=p.x; if(p.x>maxX)maxX=p.x; if(p.y<minY)minY=p.y; if(p.y>maxY)maxY=p.y; }
    const cX = (minX+maxX)/2, cY = (minY+maxY)/2;
    const off = {x: w/2 - cX, y: h/2 - cY};

    
    function glossy(px, py, r, fill){
      const g = ctx.createRadialGradient(px-r*0.35, py-r*0.35, r*0.2, px, py, r);
      g.addColorStop(0, fill);
      g.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1; ctx.stroke();
    }
    function glossyHex(px, py, r, fill){
      
      const g = ctx.createRadialGradient(px-r*0.35, py-r*0.35, r*0.2, px, py, r);
      g.addColorStop(0, fill);
      g.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = g;
      ctx.beginPath();
      for(let i=0;i<6;i++){
        const ang = Math.PI/6 + i*(Math.PI/3);
        const x = px + r*Math.cos(ang), y = py + r*Math.sin(ang);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(251,191,36,0.9)'; 
      ctx.lineWidth=1.6; ctx.stroke();
    }
    function drawDashed(a,b){
      ctx.setLineDash([5,5]); ctx.lineWidth=2;
      ctx.strokeStyle='rgba(248,113,113,0.95)';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.setLineDash([]);
    }

    
    ctx.save();
    ctx.translate(off.x, off.y);
    ctx.translate(cX, cY);
    const sp = (+ui.spacing?.value || 140);
    const scaleFromSpacing = Math.max(0.2, Math.min(1.2, sp/140));
    ctx.scale(0.45, 0.45);
    ctx.translate(-cX, -cY);

    
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(203,213,225,0.55)';
    for(const [i,j] of edges){
      const a=P[i], b=P[j];
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    
    const corners3 = [[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
    const faces3   = [[0.5,0.5,0],[0.5,0,0.5],[0,0.5,0.5],[0.5,0.5,1],[0.5,1,0.5],[1,0.5,0.5]];
    const reds  = corners3.map(p=>projectIntro(p)).map(p=>({p, color:'rgba(239,68,68,1)'}));
    const grays = faces3  .map(p=>projectIntro(p)).map(p=>({p, color:'rgba(148,163,184,1)'}));
    const all = reds.concat(grays).sort((a,b)=>a.p.z-b.p.z);
    for (const s of all) {
      const tZ = Math.min(1, Math.max(0, (s.p.z + 1) / 2));
      const alpha = introIsOrtho() ? 1 : (0.35 + 0.65 * (1 - tZ));
      const base = s.color.replace('1)', alpha.toFixed(2) + ')');
      glossy(s.p.x, s.p.y, R * 0.95, base);
    }
    
    const center = projectIntro([0.5,0.5,0.5]);
    glossyHex(center.x, center.y, R*0.95, 'rgba(217,119,6,1)');
    const neigh = faces3.map(projectIntro);
    for(const n of neigh){ drawDashed(center, n); }


    
    for(const [i,j] of edges){
      const a3 = cube[i], b3 = cube[j];
      const m3 = [(a3[0]+b3[0])/2, (a3[1]+b3[1])/2, (a3[2]+b3[2])/2];
      const pm = projectIntro(m3);
      glossyHex(pm.x, pm.y, Math.max(10, R*0.9), 'rgba(148,163,184,1)');
    }
    ctx.restore();
}


function drawIntroTetraedro(){
    const Rbase = (+ui.radius.value || 14);
    const R = Rbase * 1.12;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0,0,w,h);

    
    const cell = [[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

    function glossySphere(pp, r, fill){
      const tZ = Math.min(1, Math.max(0, (pp.z + 1) / 2));
      const alpha = introIsOrtho() ? 1 : (0.40 + 0.60 * (1 - tZ));
      const color = String(fill).includes('rgba(') ? fill.replace(/,\s*1\)/, ', '+alpha.toFixed(2)+')') : fill;
      const RR = r * (introIsOrtho() ? 1 : pp.f);
      const g = ctx.createRadialGradient(pp.x-RR*0.35, pp.y-RR*0.35, RR*0.2, pp.x, pp.y, RR);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0.38)');
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(pp.x,pp.y,RR,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.10)'; ctx.lineWidth=1; ctx.stroke();
    }
    function glossyTetra(pp, size, fill, upside){
      const RR = size * (introIsOrtho() ? 1 : pp.f);
      const tZ = Math.min(1, Math.max(0, (pp.z + 1) / 2));
      const alpha = introIsOrtho() ? 1 : (0.44 + 0.56 * (1 - tZ));
      const color = String(fill).includes('rgba(') ? fill.replace(/,\s*1\)/, ', '+alpha.toFixed(2)+')') : fill;

      const tip = upside ? [pp.x, pp.y-RR] : [pp.x, pp.y+RR];
      const baseY = upside ? pp.y+RR*0.78 : pp.y-RR*0.78;
      const left = [pp.x-RR*0.92, baseY], right=[pp.x+RR*0.92, baseY];
      const centroid = [(tip[0]+left[0]+right[0])/3, (tip[1]+left[1]+right[1])/3];

      const g = ctx.createRadialGradient(centroid[0]-RR*0.35, centroid[1]-RR*0.35, RR*0.12, centroid[0], centroid[1], RR*1.15);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0.32)');
      ctx.fillStyle=g;

      ctx.beginPath(); ctx.moveTo(...tip); ctx.lineTo(...left); ctx.lineTo(...right); ctx.closePath(); ctx.fill();

      
      ctx.globalAlpha = 0.30;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      if (upside) {
        ctx.moveTo(pp.x, pp.y-RR*0.88);
        ctx.lineTo(pp.x-RR*0.22, pp.y+RR*0.10);
        ctx.lineTo(pp.x+RR*0.14, pp.y+RR*0.22);
      } else {
        ctx.moveTo(pp.x, pp.y+RR*0.88);
        ctx.lineTo(pp.x-RR*0.22, pp.y-RR*0.10);
        ctx.lineTo(pp.x+RR*0.14, pp.y-RR*0.22);
      }
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle='rgba(20,20,20,0.48)'; ctx.lineWidth=1.15; ctx.stroke();
    }

    function line3(a3,b3, dashed){
      const a=projectIntro(a3), b=projectIntro(b3);
      ctx.beginPath();
      if(dashed) ctx.setLineDash([6,6]); else ctx.setLineDash([]);
      ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
      ctx.lineWidth = dashed ? 2.2 : 2.0;
      ctx.strokeStyle = dashed ? 'rgba(248,113,113,0.95)' : 'rgba(203,213,225,0.60)';
      ctx.stroke();
      ctx.setLineDash([]);
    }

    
    
    const redAtoms3 = [
      [0,0,0],[1,0,0],[1,1,0],[0,1,0],
      [0,0,1],[1,0,1],[1,1,1],[0,1,1],
      [0.33,0.33,0.50]
    ];

    
    const rods = [
      [[0,0,1],[0,0,0]],             
      [[1,1,1],[1,1,0]]              
      
    ];

    
    const tetraItems3 = [
      
      {p:[0,0,0.66],  up:true,  c:'rgba(207,212,220,1)'},
      {p:[0,0,0.34],  up:false, c:'rgba(207,212,220,1)'},

      
      {p:[0.33,0.33,0.84], up:false, c:'rgba(217,119,6,1)', hi:true},

      
      {p:[1,1,0.66],  up:true,  c:'rgba(207,212,220,1)'},
      {p:[1,1,0.34],  up:false, c:'rgba(207,212,220,1)'},
    ];

    
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = 'rgba(203,213,225,0.55)';
    for(const [i,j] of edges){
      const a=projectIntro(cell[i]), b=projectIntro(cell[j]);
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }

    
    for(const [a,b] of rods){ line3(a,b,false); }

    
    const hi = tetraItems3.find(t=>t.hi);
    if(hi){
      const topTargets = [[0,0,1],[0,1,1],[1,0,1]];
      for(const t of topTargets){ line3(hi.p, t, true); }
      line3(hi.p, [0.33,0.33,0.50], true); 
    }

    
    const items = [];
    for(const r3 of redAtoms3){
      const p = projectIntro(r3);
      items.push({kind:'sphere', z:p.z, p});
    }
    for(const t3 of tetraItems3){
      const p = projectIntro(t3.p);
      items.push({kind:'tetra', z:p.z, p, t3});
    }
    items.sort((a,b)=>a.z-b.z);
    for(const it of items){
      if(it.kind==='sphere') glossySphere(it.p, R*0.98, 'rgba(239,68,68,1)');
      else glossyTetra(it.p, (it.t3.hi?R*1.02:R*0.96), it.t3.c, !!it.t3.up);
    }
}

window.drawIntroTetraedro = drawIntroTetraedro;


window.drawIntroBuracoFCC = drawIntroBuracoFCC;



  const _draw = window.draw;
  window.draw = function(){
    if (window.state && (window.state.key === 'INTRO2' || window.state.key === 'INTRO_TETRA')) {
      try{ if(window.resize) resize(); }catch(e){}
      if (window.state.key === 'INTRO_TETRA') drawIntroTetraedro(); else drawIntroBuracoFCC();
      requestAnimationFrame(window.draw);
      return;
    }
    if (typeof _draw === 'function') return _draw();
  };

  const _rebuild = window.rebuild;
  window.rebuild = function(){
    try{ const c=document.getElementById('canvas'); if(c) c.style.cursor = (state && (state.key==='INTRO2' || state.key==='INTRO_TETRA')) ? 'grab' : ''; }catch(e){}

    if (typeof _rebuild === 'function') _rebuild();
    const row = document.getElementById('holesRow');
    if (row) row.style.display = (state && state.key==='INTRO2') ? '' : 'none';
  };

  function onPointerDown(e){ if(!(state && (state.key==='INTRO2' || state.key==='INTRO_TETRA' || state.key==='INTRO_CAMADAS'))) return;
    introState.dragging=true; introState.lastX=e.clientX; introState.lastY=e.clientY; canvas.setPointerCapture(e.pointerId); }
  function onPointerMove(e){ if(!(window.state && (state.key==='INTRO2' || state.key==='INTRO_TETRA' || state.key==='INTRO_CAMADAS') && introState.dragging)) return;
    const dx=e.clientX-introState.lastX, dy=e.clientY-introState.lastY;
    introState.lastX=e.clientX; introState.lastY=e.clientY;
    introState.angleY += dx*introState.sensitivity;
    introState.angleX += dy*introState.sensitivity;
  }
  function onPointerUp(e){ introState.dragging=false; }
  function onWheel(e){
    if(!(state && (state.key==='INTRO2' || state.key==='INTRO_TETRA' || state.key==='INTRO_CAMADAS'))) return;
    e.preventDefault();
    const factor = (e.deltaY<0)? 1.05 : 0.95;
    introState.zoom = Math.min(1.8, Math.max(0.35, introState.zoom*factor));
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive:false });
})(); 

(function(){
  try{
    const btn = document.getElementById('introAddLayerBtn');
    if(!btn) return;
    btn.addEventListener('click', ()=>{
      if (!window.state || state.key!=='INTRO_CAMADAS') return;
      if(!state.ic) state.ic = introCamadasInit(+ui.cells.value);
      btn.disabled = true;
      const allBPlaced = state.ic.Btargets.length === state.ic.Bplaced.length;
      const hasA3 = Array.isArray(state.ic.A3targets) && state.ic.A3targets.length>0;
      const allA3Placed = hasA3 && state.ic.A3placed && (state.ic.A3targets.length === state.ic.A3placed.length);
      const done = ()=>{ btn.disabled = false; btn.textContent = allBPlaced ? 'Camadas completas' : 'Adicionar 3ª camada'; };
      if(!allBPlaced){
        introCamadasStart(state.ic, ()=>{ btn.disabled=false; btn.textContent='Adicionar 3ª camada'; });
      } else if(hasA3 && !allA3Placed){
        introCamadasStartTopA(state.ic, ()=>{ btn.disabled=false; btn.textContent='Camadas completas'; });
      } else {
        btn.disabled=false;
      }
      
      try{ requestAnimationFrame(draw); }catch(_){}
    });
    const rowIC = document.getElementById('introCamadasRow');
    if (rowIC) rowIC.style.display = (document.getElementById('structure').value==='INTRO_CAMADAS') ? '' : 'none';
  }catch(e){ }
})();
