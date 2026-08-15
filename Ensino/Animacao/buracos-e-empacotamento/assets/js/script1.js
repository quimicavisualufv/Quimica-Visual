(function(){
  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');
  const modeSel = document.getElementById('mode');
  const rSlider = document.getElementById('radius');
  const aSlider = document.getElementById('alpha');
  const gapSlider = document.getElementById('gap');
  const gapNum = document.getElementById('gapNum');
  const solidCb = document.getElementById('solid');
  const layerSize = document.getElementById('layerSize');
  const edgesCb = document.getElementById('edges');
  const edgesComboCb = document.getElementById('edgesCombo');
  const comboFilterWrap = document.getElementById('comboFilterWrap');
  const singlePolyFilterWrap = document.getElementById('singlePolyFilterWrap');
  const showOctAtomsCb = document.getElementById('showOctAtoms');
  const showTetAtomsCb = document.getElementById('showTetAtoms');
  const showTetFigureCb = document.getElementById('showTetFigure');
  const showOctFigureCb = document.getElementById('showOctFigure');
  const hideInactiveComboCb = document.getElementById('hideInactiveCombo');
  const showPolyFigureSingleCb = document.getElementById('showPolyFigureSingle');
  const showPolyAtomsSingleCb = document.getElementById('showPolyAtomsSingle');
  const hideInactiveSingleCb = document.getElementById('hideInactiveSingle');
  const btnAdd = document.getElementById('btnAdd');
  const btnReset = document.getElementById('btnReset');
  const layerSizeWrap = document.getElementById('layerSizeWrap');
  const atomSizeWrap = document.getElementById('atomSizeWrap');
  const stackActionsWrap = document.getElementById('stackActionsWrap');
  function isStackingMode(m){ return m==='aaa_tri'||m==='aba_tri'||m==='abc_tri'||m==='aaa_cub'||m==='aba_cub'||m==='abc_cub'; }
  function isLayerWidthMode(m){ return isStackingMode(m); }
  function isFirstFourMode(m){ return m==='oct'||m==='tetra'||m==='tetra_octa'||m==='hex2d'; }
  function getEdgesChecked(){ return edgesCb ? edgesCb.checked : true; }
  function syncEdges(source){
    [edgesCb, edgesComboCb].forEach(cb=>{ if(cb && cb!==source) cb.checked = source.checked; });
  }
  function isLockedZoomMode(m){ return isFirstFourMode(m); }
  function getAtomSizeValue(){ return +gapSlider.value; }
  function getLockedAtomRadius(){ return 8 + getAtomSizeValue()*0.12; }
  function getLockedStructureSpacing(){ return 92; }
  function getCurrentSpacing(mode=modeSel.value){
    if(isLockedZoomMode(mode)) return getLockedStructureSpacing();
    const baseR = +rSlider.value;
    const gap = isStackingMode(mode) ? 0 : 0;
    return 2*baseR + gap;
  }
  function updateControlsVisibility(){
    const m = modeSel.value;
    document.body.dataset.mode = m;
    const showStack = isStackingMode(m);
    const showSingleHole = m==='tetra' || m==='oct';
    const showComboFilters = m==='tetra_octa';
    const lockZoom = isLockedZoomMode(m);

    const showN = isLayerWidthMode(m);
    const disableAtomSize = showStack;

    if(rSlider) rSlider.disabled = lockZoom;
    if(atomSizeWrap){
      atomSizeWrap.classList.toggle('is-disabled', disableAtomSize);
      atomSizeWrap.querySelectorAll('input').forEach(inp=>inp.disabled = disableAtomSize);
    }
    if(layerSizeWrap){
      layerSizeWrap.classList.toggle('hidden', !showN);
      const inp = layerSizeWrap.querySelector('#layerSize');
      if(inp) inp.disabled = !showN;
    }
    if(stackActionsWrap){
      stackActionsWrap.classList.toggle('hidden', !showStack);
    }
    if(btnAdd) btnAdd.disabled = !showStack;
    if(btnReset) btnReset.disabled = !showStack;
    if(singlePolyFilterWrap){
      singlePolyFilterWrap.classList.toggle('hidden', !showSingleHole);
      singlePolyFilterWrap.querySelectorAll('input').forEach(inp=>inp.disabled = !showSingleHole);
    }
    if(comboFilterWrap){
      comboFilterWrap.classList.toggle('hidden', !showComboFilters);
      comboFilterWrap.querySelectorAll('input').forEach(inp=>inp.disabled = !showComboFilters);
    }
  }

  const legend = document.getElementById('legend');
  const testResults = document.getElementById('testResults');

  let canvasHotspots=[];
  const comboViewOptions = {
    showOctaAtoms:true,
    showTetraAtoms:true,
    showTetraFigure:true,
    showOctaFigure:true
  };

  let W=0,H=0, DPR=Math.min(2,(window.devicePixelRatio||1));
  let rotX=-0.6, rotY=0.6; let dragging=false, lx=0, ly=0;

  
  function proj([x0,y0,z0]){
    const cy=Math.cos(rotX), sy=Math.sin(rotX);
    const y1=y0*cy - z0*sy, z1=y0*sy + z0*cy;
    const cx=Math.cos(rotY), sx=Math.sin(rotY);
    const x2=x0*cx + z1*sx, z2=-x0*sx + z1*cx;
    return {x:W/2+x2, y:H/2+y1, z:z2};
  }
  function sphere(x,y,R,alpha,tint, solid){
    const g = ctx.createRadialGradient(x - R*0.35, y - R*0.35, R*0.1, x, y, R);
    const c0 = tint || [200,200,200];
    const c1 = tint || [220,220,220];
    const a0 = solid ? 1 : alpha;
    const a1 = solid ? 1 : alpha*0.9;
    const a2 = solid ? 1 : alpha*0.55;
    g.addColorStop(0, `rgba(${c0[0]},${c0[1]},${c0[2]},${a0})`);
    g.addColorStop(0.6, `rgba(${c1[0]},${c1[1]},${c1[2]},${a1})`);
    g.addColorStop(1, `rgba(${c1[0]},${c1[1]},${c1[2]},${a2})`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x,y,R,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = solid ? 'rgba(255,255,255,1)' : `rgba(255,255,255,${alpha*0.09})`;
    ctx.lineWidth = 1.2; ctx.stroke();
  }
  function edge(a,b,w=1.4,alp=0.75){
    ctx.lineCap='round'; ctx.strokeStyle=`rgba(210,225,255,${alp})`; ctx.lineWidth=w;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  }
  function roundedRectPath(x,y,w,h,r=18){
    const rr=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr,y);
    ctx.arcTo(x+w,y,x+w,y+h,rr);
    ctx.arcTo(x+w,y+h,x,y+h,rr);
    ctx.arcTo(x,y+h,x,y,rr);
    ctx.arcTo(x,y,x+w,y,rr);
    ctx.closePath();
  }
  function projToView([x0,y0,z0], cx, cy, scale, rx=rotX, ry=rotY){
    const cy1=Math.cos(rx), sy1=Math.sin(rx);
    const y1=y0*cy1 - z0*sy1, z1=y0*sy1 + z0*cy1;
    const cx1=Math.cos(ry), sx1=Math.sin(ry);
    const x2=x0*cx1 + z1*sx1, z2=-x0*sx1 + z1*cx1;
    return {x:cx+x2*scale, y:cy+y1*scale, z:z2};
  }
  function fillPoly(points, fill, stroke='rgba(230,240,255,0.28)', line=1.1){
    if(!points || !points.length) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i=1;i<points.length;i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    if(fill){ ctx.fillStyle=fill; ctx.fill(); }
    if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=line; ctx.stroke(); }
  }
  function drawFaces(points, faces, fill, stroke, line=1.1){
    const ordered = faces.map(face=>({ face, z:face.reduce((acc,i)=>acc+points[i].z,0)/face.length }))
      .sort((a,b)=>a.z-b.z);
    for(const item of ordered){ fillPoly(item.face.map(i=>points[i]), fill, stroke, line); }
  }
  function drawCanvasToggle(x,y,w,h,label,active,key,accent='rgba(122,162,255,0.22)'){
    const radius = Math.min(12, h/2);
    ctx.save();
    roundedRectPath(x,y,w,h,radius);
    ctx.fillStyle = active ? accent : 'rgba(10,16,24,0.75)';
    ctx.fill();
    ctx.strokeStyle = active ? 'rgba(215,232,255,0.55)' : 'rgba(144,170,210,0.22)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    const mark = h*0.42;
    const mx = x + 10;
    const my = y + (h-mark)/2;
    roundedRectPath(mx,my,mark,mark,4);
    ctx.fillStyle = active ? 'rgba(234,245,255,0.96)' : 'rgba(18,28,40,0.95)';
    ctx.fill();
    ctx.strokeStyle = active ? 'rgba(255,255,255,0.9)' : 'rgba(175,198,232,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = active ? 'rgba(238,246,255,0.98)' : 'rgba(210,224,246,0.88)';
    ctx.font = '600 12px ui-sans-serif,system-ui,"Segoe UI",Inter,Roboto,Arial';
    ctx.textBaseline='middle';
    ctx.fillText(label, mx + mark + 8, y + h/2 + 0.5);
    ctx.restore();

    canvasHotspots.push({x,y,w,h,key});
  }
  function pointInRect(px,py,rect){
    return px>=rect.x && px<=rect.x+rect.w && py>=rect.y && py<=rect.y+rect.h;
  }
  function getCanvasPoint(evt){
    const rect=cv.getBoundingClientRect();
    return {
      x:(evt.clientX-rect.left)*(W/rect.width),
      y:(evt.clientY-rect.top)*(H/rect.height)
    };
  }
  function dedupeProjectedItems(items, tol=1.25){
    const kept=[];
    for(const item of items){
      let merged=false;
      for(let i=0;i<kept.length;i++){
        const other=kept[i];
        if(Math.abs(item.p.x-other.p.x)<=tol && Math.abs(item.p.y-other.p.y)<=tol){
          if(item.z > other.z) kept[i]=item;
          merged=true;
          break;
        }
      }
      if(!merged) kept.push(item);
    }
    return kept;
  }
  function normToCube([u,v,w], a){ return [(u-0.5)*a, (v-0.5)*a, (w-0.5)*a]; }

  function drawPackingSequence(R, alpha, d){
    const outerPad = 18;
    const gap = 14;
    const cols = 3;
    const rows = 2;
    const panelW = (W - outerPad*2 - gap*(cols-1)) / cols;
    const panelH = (H - outerPad*2 - gap*(rows-1)) / rows;
    const solid = solidCb.checked;
    const titleH = 28;
    const colA = [255,146,88];
    const colB = [126,220,200];
    const colC = [255,210,92];
    const frameCol = [152,176,255];
    const frameCol2 = [255,164,128];

    function panelBox(c,r,title){
      const x = outerPad + c*(panelW+gap);
      const y = outerPad + r*(panelH+gap);
      ctx.save();
      roundedRectPath(x,y,panelW,panelH,18);
      ctx.fillStyle='rgba(9,14,20,0.34)';
      ctx.fill();
      ctx.strokeStyle='rgba(123,166,255,0.18)';
      ctx.lineWidth=1.2;
      ctx.stroke();
      ctx.fillStyle='rgba(223,235,255,0.96)';
      ctx.font='600 14px ui-sans-serif,system-ui,"Segoe UI",Inter,Roboto,Arial';
      ctx.fillText(title, x+14, y+20);
      ctx.restore();
      return {x:x+8, y:y+titleH, w:panelW-16, h:panelH-titleH-10};
    }

    function clipRect(x,y,w,h){
      ctx.save();
      roundedRectPath(x,y,w,h,14);
      ctx.clip();
    }

    function sphere2D(x,y,r,tint,a=alpha){ sphere(x,y,r,a,tint,solid); }

    function layerPoints(cx, y, spacing, count, offset=0){
      const arr=[];
      const start = cx - ((count-1)*spacing)/2 + offset;
      for(let i=0;i<count;i++) arr.push([start + i*spacing, y]);
      return arr;
    }

    function drawLayerRow(points, r, tint, backTint=null){
      const arr = points.map(p=>({x:p[0], y:p[1]}));
      for(const p of arr){ sphere2D(p.x,p.y,r, backTint || tint); }
    }

    function drawLabel(x,y,t, color='rgba(230,240,255,0.92)', align='left'){
      ctx.fillStyle=color;
      ctx.font='700 18px ui-sans-serif,system-ui,"Segoe UI",Inter,Roboto,Arial';
      ctx.textAlign=align;
      ctx.textBaseline='middle';
      ctx.fillText(t,x,y);
      ctx.textAlign='left';
      ctx.textBaseline='alphabetic';
    }

    function rgba(c,a){ return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
    function mix(c, t){ return c.map(v=>Math.round(v + (255-v)*t)); }
    function shade(c, t){ return c.map(v=>Math.round(v*(1-t))); }

    function drawCutSphere(cx, cy, r, tint){
      const line = shade(tint, 0.42);
      const top = mix(tint, 0.82);
      const bot = mix(tint, 0.38);
      ctx.save();
      ctx.fillStyle='rgba(0,0,0,0.11)';
      ctx.beginPath();
      ctx.ellipse(cx, cy+r*0.88, r*0.72, r*0.22, 0, 0, Math.PI*2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.fillStyle='rgba(252,253,255,0.98)';
      ctx.fill();
      ctx.clip();

      ctx.fillStyle=rgba(top,0.95);
      ctx.fillRect(cx-r-2, cy-r-2, r*2+4, r+2);
      ctx.fillStyle=rgba(bot,0.82);
      ctx.fillRect(cx-r-2, cy, r*2+4, r+2);

      const g = ctx.createRadialGradient(cx-r*0.35, cy-r*0.35, r*0.08, cx, cy, r*1.05);
      g.addColorStop(0, 'rgba(255,255,255,0.8)');
      g.addColorStop(0.65, 'rgba(255,255,255,0.0)');
      g.addColorStop(1, 'rgba(255,255,255,0.0)');
      ctx.fillStyle=g;
      ctx.fillRect(cx-r-2, cy-r-2, r*2+4, r*2+4);
      ctx.restore();

      ctx.strokeStyle=rgba(line,0.98);
      ctx.lineWidth=1.35;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.stroke();

      ctx.strokeStyle=rgba(line,0.78);
      ctx.lineWidth=1.15;
      ctx.beginPath();
      ctx.moveTo(cx-r*0.86, cy);
      ctx.lineTo(cx+r*0.86, cy);
      ctx.stroke();

      ctx.strokeStyle='rgba(255,255,255,0.52)';
      ctx.lineWidth=0.95;
      ctx.beginPath();
      ctx.ellipse(cx, cy-r*0.05, r*0.52, r*0.18, 0, Math.PI*1.06, Math.PI*1.94);
      ctx.stroke();

      ctx.fillStyle='rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(cx-r*0.28, cy-r*0.3, r*0.12, 0, Math.PI*2);
      ctx.fill();
    }

    function regularPoly(cx, cy, r, sides, rot=0){
      const pts=[];
      for(let i=0;i<sides;i++){
        const a = rot + i*Math.PI*2/sides;
        pts.push({x:cx + Math.cos(a)*r, y:cy + Math.sin(a)*r});
      }
      return pts;
    }

    function drawCenterPolygon(points, fill, stroke){
      fillPoly(points, fill, stroke, 1.25);
      const cx = points.reduce((s,p)=>s+p.x,0)/points.length;
      const cy = points.reduce((s,p)=>s+p.y,0)/points.length;
      ctx.fillStyle='rgba(255,255,255,0.26)';
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(2, Math.hypot(points[0].x-cx, points[0].y-cy)*0.24), 0, Math.PI*2);
      ctx.fill();
    }

    function drawTriangleCluster(cx, cy, r, tint, orientation='down'){
      const polyR = r*0.95;
      const fill = rgba(mix(tint,0.2), 0.38);
      const stroke = rgba(shade(tint,0.28), 0.9);
      const rot = orientation==='down' ? Math.PI/2 : -Math.PI/2;
      drawCenterPolygon(regularPoly(cx, cy, polyR, 3, rot), fill, stroke);
      const pts = orientation==='down'
        ? [[0,-1.02],[-0.92,0.56],[0.92,0.56]]
        : [[0,1.02],[-0.92,-0.56],[0.92,-0.56]];
      for(const [px,py] of pts){ drawCutSphere(cx+px*r*1.02, cy+py*r*1.02, r, tint); }
    }

    function drawHexCluster(cx, cy, r, tint){
      const polyR = r*0.92;
      const fill = rgba(mix(tint,0.12), 0.34);
      const stroke = rgba(shade(tint,0.32), 0.9);
      drawCenterPolygon(regularPoly(cx, cy, polyR, 6, Math.PI/6), fill, stroke);
      const dist = r*1.5;
      for(let i=0;i<6;i++){
        const a = -Math.PI/2 + i*Math.PI/3;
        drawCutSphere(cx + Math.cos(a)*dist, cy + Math.sin(a)*dist, r, tint);
      }
    }

    function drawPackingCaption(x,y,w,text){
      ctx.fillStyle='rgba(205,220,255,0.9)';
      ctx.font='600 13px ui-sans-serif,system-ui,"Segoe UI",Inter,Roboto,Arial';
      ctx.textAlign='center';
      ctx.fillText(text, x+w/2, y);
      ctx.textAlign='left';
    }

    function drawHexPackingStack(x,y,w,h){
      const tintA = [86, 214, 198];
      const tintB = [244, 179, 88];
      const cx = x+w*0.54;
      const r = Math.min(w,h)*0.056;
      const rows = [
        {letter:'B', tint:tintB, type:'tri', orient:'down', yy:y+h*0.16},
        {letter:'A', tint:tintA, type:'hex', yy:y+h*0.39},
        {letter:'B', tint:tintB, type:'tri', orient:'down', yy:y+h*0.62},
        {letter:'A', tint:tintA, type:'hex', yy:y+h*0.84},
      ];
      for(const row of rows){
        drawLabel(x+w*0.1, row.yy, row.letter, rgba(shade(row.tint,0.2),0.98), 'center');
        if(row.type==='hex') drawHexCluster(cx, row.yy, r, row.tint);
        else drawTriangleCluster(cx, row.yy, r, row.tint, row.orient);
      }
      drawPackingCaption(x, y+h-8, w, 'empilhamento ABAB');
    }

    function drawCubicPackingStack(x,y,w,h){
      const tintA = [86, 214, 198];
      const tintB = [244, 179, 88];
      const tintC = [129, 157, 255];
      const cx = x+w*0.46;
      const r = Math.min(w,h)*0.056;
      const rows = [
        {letter:'A', tint:tintA, type:'hex', yy:y+h*0.16},
        {letter:'C', tint:tintC, type:'tri', orient:'up', yy:y+h*0.39},
        {letter:'B', tint:tintB, type:'tri', orient:'down', yy:y+h*0.62},
        {letter:'A', tint:tintA, type:'hex', yy:y+h*0.84},
      ];
      for(const row of rows){
        drawLabel(x+w*0.9, row.yy, row.letter, rgba(shade(row.tint,0.2),0.98), 'center');
        if(row.type==='hex') drawHexCluster(cx, row.yy, r, row.tint);
        else drawTriangleCluster(cx, row.yy, r, row.tint, row.orient);
      }
      drawPackingCaption(x, y+h-8, w, 'empilhamento ABCA');
    }

    function drawSideLayers(x,y,w,h,isCubic){
      const cx = x+w*0.5;
      const yy = isCubic ? [y+h*0.18,y+h*0.40,y+h*0.62,y+h*0.84] : [y+h*0.16,y+h*0.39,y+h*0.61,y+h*0.84];
      const r = Math.min(w,h)*0.085;
      const spacing = r*1.68;
      const layers = isCubic ? [
        {letter:'A', tint:colA, pts:layerPoints(cx, yy[0], spacing, 4, 0)},
        {letter:'C', tint:colC, pts:layerPoints(cx, yy[1], spacing, 2, 0)},
        {letter:'B', tint:colB, pts:layerPoints(cx, yy[2], spacing, 1, 0)},
        {letter:'A', tint:colA, pts:layerPoints(cx, yy[3], spacing, 4, 0)},
      ] : [
        {letter:'A', tint:colA, pts:layerPoints(cx, yy[0], spacing, 4, 0)},
        {letter:'B', tint:colB, pts:layerPoints(cx, yy[1], spacing, 2, 0)},
        {letter:'A', tint:colA, pts:layerPoints(cx, yy[2], spacing, 4, 0)},
        {letter:'B', tint:colB, pts:layerPoints(cx, yy[3], spacing, 2, 0)},
      ];
      for(const layer of layers){
        for(const p of layer.pts){ sphere2D(p[0],p[1],r,layer.tint); }
        drawLabel(x+w*0.88, layer.pts[0][1]+6, layer.letter, 'rgba(230,240,255,.86)');
      }
    }

    function drawWirePrism(x,y,w,h){
      const scale = Math.min(w,h)/2.8;
      const cx = x + w/2;
      const cy = y + h/2 + 8;
      const a = d*1.3;
      const top = [
        [-1,0,0],[ -0.5,-0.86,0],[0.5,-0.86,0],[1,0,0],[0.5,0.86,0],[-0.5,0.86,0]
      ].map(v=>[v[0]*a*0.52,v[1]*a*0.52,-a*0.46]);
      const bot = top.map(v=>[v[0],v[1],a*0.46]);
      const verts = [...top, ...bot];
      const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[6,7],[7,8],[8,9],[9,10],[10,11],[11,6],[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
      const P = verts.map(v=>projToView(v,cx,cy,scale, -0.42, 0.72));
      const pairs = edges.map(([i,j])=>({a:P[i],b:P[j],z:(P[i].z+P[j].z)/2})).sort((u,v)=>u.z-v.z);
      for(const e of pairs){ edge(e.a,e.b,1.4,0.55); }
      const nodes = P.map((p,idx)=>({p,z:p.z,tint: idx<6 ? frameCol2 : frameCol})).sort((a,b)=>a.z-b.z);
      const rr = Math.max(4, R*scale*0.18);
      for(const node of nodes){ sphere(node.p.x,node.p.y,rr,Math.min(alpha*0.9,0.85),node.tint,solid); }
    }

    function drawWireCube(x,y,w,h){
      const scale = Math.min(w,h)/2.95;
      const cx = x + w/2;
      const cy = y + h/2 + 8;
      const a = d*1.42;
      const cubeVerts = [
        [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
        [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
      ].map(v=>[v[0]*a*0.42,v[1]*a*0.42,v[2]*a*0.42]);
      const faceCenters = [[0,0,-1],[0,0,1],[0,-1,0],[0,1,0],[-1,0,0],[1,0,0]].map(v=>[v[0]*a*0.42,v[1]*a*0.42,v[2]*a*0.42]);
      const all = [...cubeVerts, ...faceCenters];
      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      const P = all.map(v=>projToView(v,cx,cy,scale, -0.5, 0.68));
      const cubeP = P.slice(0,8);
      const pairs = edges.map(([i,j])=>({a:cubeP[i],b:cubeP[j],z:(cubeP[i].z+cubeP[j].z)/2})).sort((u,v)=>u.z-v.z);
      for(const e of pairs){ edge(e.a,e.b,1.35,0.55); }
      const rr = Math.max(4, R*scale*0.17);
      const items = P.map((p,idx)=>({p,z:p.z,tint: idx<8 ? frameCol : frameCol2})).sort((a,b)=>a.z-b.z);
      for(const item of items){ sphere(item.p.x,item.p.y,rr,Math.min(alpha*0.9,0.85),item.tint,solid); }
    }

    const p1 = panelBox(0,0,'Hexagonal packing');
    clipRect(p1.x,p1.y,p1.w,p1.h); drawHexPackingStack(p1.x,p1.y,p1.w,p1.h); ctx.restore();

    const p2 = panelBox(1,0,'Cubic close packing');
    clipRect(p2.x,p2.y,p2.w,p2.h); drawCubicPackingStack(p2.x,p2.y,p2.w,p2.h); ctx.restore();

    const p3 = panelBox(2,0,'Vista lateral • HCP');
    clipRect(p3.x,p3.y,p3.w,p3.h); drawSideLayers(p3.x,p3.y,p3.w,p3.h,false); ctx.restore();

    const p4 = panelBox(0,1,'Vista lateral • CCP/FCC');
    clipRect(p4.x,p4.y,p4.w,p4.h); drawSideLayers(p4.x,p4.y,p4.w,p4.h,true); ctx.restore();

    const p5 = panelBox(1,1,'HCP');
    clipRect(p5.x,p5.y,p5.w,p5.h); drawWirePrism(p5.x,p5.y,p5.w,p5.h); ctx.restore();

    const p6 = panelBox(2,1,'FCC');
    clipRect(p6.x,p6.y,p6.w,p6.h); drawWireCube(p6.x,p6.y,p6.w,p6.h); ctx.restore();
  }
  function drawHoleMultiView(mode, R, alpha, d, fitD=d){
    const outerPad = 18;
    const gap = 18;
    const panelW = (W - outerPad*2 - gap)/2;
    const panelH = H - outerPad*2;
    const titleH = 30;
    const leftX = outerPad;
    const rightX = leftX + panelW + gap;
    const topY = outerPad;
    const solid = solidCb.checked;

    function drawPanelShell(x,y,w,h,title){
      ctx.save();
      roundedRectPath(x,y,w,h,18);
      ctx.fillStyle='rgba(9,14,20,0.34)';
      ctx.fill();
      ctx.strokeStyle='rgba(123,166,255,0.18)';
      ctx.lineWidth=1.2;
      ctx.stroke();
      ctx.fillStyle='rgba(223,235,255,0.96)';
      ctx.font='600 15px ui-sans-serif,system-ui,"Segoe UI",Inter,Roboto,Arial';
      ctx.fillText(title, x+16, y+22);
      ctx.restore();
    }

    function clipContent(x,y,w,h){
      ctx.save();
      roundedRectPath(x,y,w,h,16);
      ctx.clip();
    }

    function drawSingleModel(kind, cx, cy, scale){
      let verts=[], edgesLocal=[], tint;
      if(kind==='tetra'){
        const s=d/(2*Math.SQRT2);
        verts=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(v=>v.map(c=>c*s));
        edgesLocal=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
        tint=[165,140,255];
      } else {
        const s=d/Math.SQRT2;
        verts=[[s,0,0],[-s,0,0],[0,s,0],[0,-s,0],[0,0,s],[0,0,-s]];
        edgesLocal=[[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]];
        tint=[122,162,255];
      }
      const P=verts.map(v=>projToView(v,cx,cy,scale));
      if(getEdgesChecked()){
        const pairs=edgesLocal.map(([i,j])=>({a:P[i],b:P[j],z:(P[i].z+P[j].z)/2})).sort((u,v)=>u.z-v.z);
        for(const e of pairs) edge(e.a,e.b,1.4,0.82);
      }
      const items=verts.map((v,i)=>({p:P[i], z:P[i].z})).sort((a,b)=>a.z-b.z);
      const RR=Math.max(7, R*scale);
      for(const it of items){ sphere(it.p.x,it.p.y,RR,alpha,tint,solid); }
    }

    function drawCurrentModel(x,y,w,h){
      ctx.fillStyle='rgba(220,234,255,0.78)';
      ctx.font='600 13px ui-sans-serif,system-ui,"Segoe UI",Inter,Roboto,Arial';
      if(mode==='tetra_octa'){
        const splitGap = Math.min(34, w*0.08);
        const subW = (w - splitGap) / 2;
        const cx1 = x + subW/2;
        const cx2 = x + subW + splitGap + subW/2;
        const cy = y + h/2 + 4;
        const scaleT = Math.min(subW, h) / (fitD*2.45);
        const scaleO = Math.min(subW, h) / (fitD*3.0);
        drawSingleModel('tetra', cx1, cy, scaleT);
        drawSingleModel('oct', cx2, cy, scaleO);
        ctx.textAlign='center';
        ctx.fillText('Tetra', cx1, y+h-16);
        ctx.fillText('Octa', cx2, y+h-16);
        ctx.textAlign='left';
      } else {
        const kind = mode==='tetra' ? 'tetra' : 'oct';
        const scale = Math.min(w,h) / (kind==='tetra' ? fitD*2.25 : fitD*2.75);
        drawSingleModel(kind, x + w/2, y + h/2 + 4, scale);
      }
    }

    function drawCubeRepresentation(x,y,w,h){
      const a = d*Math.SQRT2;
      const cubeVerts = [
        [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
        [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
      ].map(v=>[v[0]*a/2,v[1]*a/2,v[2]*a/2]);
      const cubeFaces = [[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
      const cubeEdges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      const corners = [
        [0,0,0],[1,0,0],[1,1,0],[0,1,0],
        [0,0,1],[1,0,1],[1,1,1],[0,1,1]
      ].map(p=>normToCube(p,a));
      const faceCenters = [
        [0.5,0.5,0],[0.5,0.5,1],[0.5,0,0.5],[0.5,1,0.5],[0,0.5,0.5],[1,0.5,0.5]
      ].map(p=>normToCube(p,a));
      const fcc = [...corners, ...faceCenters];
      const tetraVerts = [
        [0,0,0],[0.5,0.5,0],[0.5,0,0.5],[0,0.5,0.5]
      ].map(p=>normToCube(p,a));
      const tetraFaces = [[0,1,2],[0,1,3],[0,2,3],[1,2,3]];
      const octVerts = [...faceCenters];
      const octFaces = [[0,2,4],[0,4,3],[0,3,5],[0,5,2],[1,2,4],[1,4,3],[1,3,5],[1,5,2]];
      const scale = Math.min(w,h) / (fitD*2.55);
      const cx = x + w/2, cy = y + h/2 + 6;
      const cubeP = cubeVerts.map(v=>projToView(v,cx,cy,scale));
      const fccP = fcc.map(v=>projToView(v,cx,cy,scale));
      const tetraP = tetraVerts.map(v=>projToView(v,cx,cy,scale));
      const octP = octVerts.map(v=>projToView(v,cx,cy,scale));
      const tetraAtomIdx = new Set([0,8,10,12]);
      const octAtomIdx = new Set([8,9,10,11,12,13]);
      const showSingleFigure = !showPolyFigureSingleCb || showPolyFigureSingleCb.checked;
      const showSingleAtoms = !showPolyAtomsSingleCb || showPolyAtomsSingleCb.checked;
      const hideInactiveSingle = !!hideInactiveSingleCb && hideInactiveSingleCb.checked;
      const showTetAtoms = !showTetAtomsCb || showTetAtomsCb.checked;
      const showOctAtoms = !showOctAtomsCb || showOctAtomsCb.checked;
      const showTetFigure = !showTetFigureCb || showTetFigureCb.checked;
      const showOctFigure = !showOctFigureCb || showOctFigureCb.checked;
      const hideInactiveCombo = !!hideInactiveComboCb && hideInactiveComboCb.checked;

      drawFaces(cubeP, cubeFaces, 'rgba(116,169,255,0.16)', 'rgba(185,220,255,0.12)', 1);
      const cubePairs = cubeEdges.map(([i,j])=>({a:cubeP[i], b:cubeP[j], z:(cubeP[i].z+cubeP[j].z)/2})).sort((u,v)=>u.z-v.z);
      for(const e of cubePairs) edge(e.a,e.b,1.2,0.26);

      if(mode==='tetra' && showSingleFigure){
        drawFaces(tetraP, tetraFaces, 'rgba(190,150,255,0.48)', 'rgba(225,208,255,0.46)', 1.15);
      }
      if(mode==='oct' && showSingleFigure){
        drawFaces(octP, octFaces, 'rgba(110,188,255,0.34)', 'rgba(202,232,255,0.40)', 1.15);
      }
      if(mode==='tetra_octa' && showTetFigure){
        drawFaces(tetraP, tetraFaces, 'rgba(190,150,255,0.48)', 'rgba(225,208,255,0.46)', 1.15);
      }
      if(mode==='tetra_octa' && showOctFigure){
        drawFaces(octP, octFaces, 'rgba(110,188,255,0.34)', 'rgba(202,232,255,0.40)', 1.15);
      }

      const RR = Math.max(6, R*scale*0.58);
      let atomItems=[];
      if(mode==='tetra_octa'){
        atomItems = fccP.map((p,i)=>{
          const inTet = tetraAtomIdx.has(i);
          const inOct = octAtomIdx.has(i);
          const activeTet = showTetAtoms && inTet;
          const activeOct = showOctAtoms && inOct;
          if(hideInactiveCombo && !activeTet && !activeOct) return null;
          let tint = i<8 ? [90,118,255] : [132,182,255];
          if(activeTet && activeOct) tint = [145,150,255];
          else if(activeTet) tint = [168,118,255];
          else if(activeOct) tint = [92,176,255];
          return {p, z:p.z, tint};
        }).filter(Boolean);
      } else if(mode==='tetra' || mode==='oct'){
        const activeSet = mode==='tetra' ? tetraAtomIdx : octAtomIdx;
        const activeTint = mode==='tetra' ? [168,118,255] : [92,176,255];
        atomItems = fccP.map((p,i)=>{
          const active = showSingleAtoms && activeSet.has(i);
          if(hideInactiveSingle && !active) return null;
          let tint = i<8 ? [90,118,255] : [132,182,255];
          if(active) tint = activeTint;
          return {p, z:p.z, tint};
        }).filter(Boolean);
      } else {
        atomItems = fccP.map((p,i)=>({p,z:p.z,tint:i<8?[90,118,255]:[132,182,255]}));
      }
      atomItems = dedupeProjectedItems(atomItems);
      atomItems.sort((a,b)=>a.z-b.z);
      for(const it of atomItems){ sphere(it.p.x,it.p.y,RR,Math.min(alpha*0.95,0.82),it.tint,solid); }

      if(mode==='tetra_octa'){
        ctx.fillStyle='rgba(220,234,255,0.82)';
        ctx.font='600 12px ui-sans-serif,system-ui,"Segoe UI",Inter,Roboto,Arial';
        ctx.fillText('Roxo: tetra • Azul: octa', x+2, y+h-4);
      }
    }

    const leftTitle = mode==='tetra_octa' ? 'Animação atual — tetra e octa' : 'Animação atual';
    const rightTitle = mode==='tetra'
      ? 'Representação 3D do buraco tetraédrico'
      : mode==='oct'
        ? 'Representação 3D do buraco octaédrico'
        : 'Representação 3D do buraco tetra + octa';
    drawPanelShell(leftX, topY, panelW, panelH, leftTitle);
    drawPanelShell(rightX, topY, panelW, panelH, rightTitle);

    const contentY = topY + titleH;
    const contentH = panelH - titleH - 12;
    const contentW = panelW - 12;

    clipContent(leftX+6, contentY, contentW, contentH);
    drawCurrentModel(leftX+6, contentY, contentW, contentH);
    ctx.restore();

    clipContent(rightX+6, contentY, contentW, contentH);
    drawCubeRepresentation(rightX+6, contentY, contentW, contentH);
    ctx.restore();
  }

  
  function buildHexEdges(d){
    const pts=[[0,0,0]]; for(let k=0;k<6;k++){const a=Math.PI/3*k; pts.push([d*Math.cos(a), d*Math.sin(a), 0]);}
    const E=[]; for(let i=1;i<=6;i++){E.push([0,i]);} for(let i=1;i<=6;i++){const j=(i%6)+1; E.push([i,j]);}
    return {pts,E};
  }

  
  const e1 = d => [d,0,0];
  const e2 = d => [d/2, Math.sqrt(3)*d/2, 0];
  const triB = d => [d/2, Math.sqrt(3)*d/6, 0];         
  const triC = d => [d,   Math.sqrt(3)*d/3,  0];         
  const triHeight = d => d*Math.sqrt(2/3);

  function triMakeSets(d, side=4){
    
    const A=[]; for(let a=0;a<=side-1;a++){ for(let b=0;b<=side-1-a;b++){ const p=vecAdd(vecScale(e1(d),a), vecScale(e2(d),b)); A.push(p); } }
    
    const B=[]; if(side>=2){ for(let a=0;a<=side-2;a++){ for(let b=0;b<=side-2-a;b++){ const base=vecAdd(vecScale(e1(d),a), vecScale(e2(d),b)); B.push(vecAdd(base, triB(d))); }}}
    
    const C=[]; if(side>=3){ for(let a=0;a<=side-3;a++){ for(let b=0;b<=side-3-a;b++){ const base=vecAdd(vecScale(e1(d),a), vecScale(e2(d),b)); C.push(vecAdd(base, triC(d))); } } }
    
    const allA = A.map(p=>[p[0],p[1],0]); const cx=(Math.min(...allA.map(p=>p[0]))+Math.max(...allA.map(p=>p[0])))/2; const cy=(Math.min(...allA.map(p=>p[1]))+Math.max(...allA.map(p=>p[1])))/2;
    const shift=[-cx,-cy,0];
    return { A: A.map(p=>vecAdd(p,shift)), B: B.map(p=>vecAdd(p,shift)), C: C.map(p=>vecAdd(p,shift)) };
  }

  
  const cubeHeight = d => d/Math.SQRT2;
  function sqMakeSets(d, n=4){
    const A=[], B=[], C=[];
    for(let i=0;i<n;i++){ const y=(i-(n-1)/2)*d; for(let j=0;j<n;j++){ const x=(j-(n-1)/2)*d; A.push([x,y,0]); } }
    if(n>=2){ for(let i=0;i<n-1;i++){ const y=(i-(n-2)/2)*d; for(let j=0;j<n-1;j++){ const x=(j-(n-2)/2)*d; B.push([x,y,0]); } } }
    if(n>=3){ for(let i=0;i<n-2;i++){ const y=(i-(n-3)/2)*d; for(let j=0;j<n-2;j++){ const x=(j-(n-3)/2)*d; C.push([x,y,0]); } } }
    return {A,B,C};
  }

  
  function vecAdd(a,b){ return [a[0]+b[0], a[1]+b[1], (a[2]||0)+(b[2]||0)]; }
  function vecScale(a,k){ return [a[0]*k, a[1]*k, (a[2]||0)*k]; }

  
  const tintFor = L => (L==='A')?[255,60,60] : (L==='B')?[255, 235, 190] : [60,140,255];

  
  function nextLetterABC(idx){ return ['B','C','A'][(idx-1)%3]; } 
  function nextLetterABA(idx){ return (idx%2===1)?'B':'A'; }      
  function nextLetterAAA(idx){ return 'A'; }

  
  let triAAA={d:0, side:4, sets:null, placed:[], levels:0};
  let triABC={d:0, side:4, sets:null, placed:[], levels:0};
  let triABA={d:0, side:4, sets:null, placed:[], levels:0};
  let cubAAA={d:0, n:4, sets:null, placed:[], levels:0};
  let cubABA={d:0, n:4, sets:null, placed:[], levels:0};
  let cubABC={d:0, n:4, sets:null, placed:[], levels:0};

  function resetStates(d){
    
    triAAA.d=d; triAAA.sets=triMakeSets(d, +layerSize.value); triAAA.placed=[...triAAA.sets.A.map(p=>({pos:p, letter:'A'}))]; triAAA.levels=1;
    triABC.d=d; triABC.sets=triMakeSets(d, +layerSize.value); triABC.placed=[...triABC.sets.A.map(p=>({pos:p, letter:'A'}))]; triABC.levels=1;
    triABA.d=d; triABA.sets=triMakeSets(d, +layerSize.value); triABA.placed=[...triABA.sets.A.map(p=>({pos:p, letter:'A'}))]; triABA.levels=1;
    
    cubAAA.d=d; cubAAA.sets=sqMakeSets(d, +layerSize.value);  cubAAA.placed=[...cubAAA.sets.A.map(p=>({pos:p, letter:'A'}))]; cubAAA.levels=1;
    cubABA.d=d; cubABA.sets=sqMakeSets(d, +layerSize.value);  cubABA.placed=[...cubABA.sets.A.map(p=>({pos:p, letter:'A'}))]; cubABA.levels=1;
    cubABC.d=d; cubABC.sets=sqMakeSets(d, +layerSize.value);  cubABC.placed=[...cubABC.sets.A.map(p=>({pos:p, letter:'A'}))]; cubABC.levels=1;
  }

  function rebuildStates(d, keepLevels=true){
    const side = +layerSize.value;

    const triLevAAA = Math.max(1, keepLevels ? (triAAA.levels||1) : 1);
    const triLevABC = Math.max(1, keepLevels ? (triABC.levels||1) : 1);
    const triLevABA = Math.max(1, keepLevels ? (triABA.levels||1) : 1);
    const cubLevAAA = Math.max(1, keepLevels ? (cubAAA.levels||1) : 1);
    const cubLevABA = Math.max(1, keepLevels ? (cubABA.levels||1) : 1);
    const cubLevABC = Math.max(1, keepLevels ? (cubABC.levels||1) : 1);

    
    triAAA.d=d; triAAA.side=side; triAAA.sets=triMakeSets(d, side); triAAA.placed=[]; triAAA.levels=triLevAAA;
    triABC.d=d; triABC.side=side; triABC.sets=triMakeSets(d, side); triABC.placed=[]; triABC.levels=triLevABC;
    triABA.d=d; triABA.side=side; triABA.sets=triMakeSets(d, side); triABA.placed=[]; triABA.levels=triLevABA;

    for(let L=0; L<triAAA.levels; L++){
      const letter = (L===0)?'A': nextLetterAAA(L);
      const set = (letter==='A')? triAAA.sets.A : (letter==='B'? triAAA.sets.B : triAAA.sets.C);
      const z = L*d;
      for(const p of set){ triAAA.placed.push({pos:[p[0],p[1],z], letter}); }
    }
    for(let L=0; L<triABC.levels; L++){
      const letter = (L===0)?'A': nextLetterABC(L);
      const set = (letter==='A')? triABC.sets.A : (letter==='B'? triABC.sets.B : triABC.sets.C);
      const z = L*triHeight(d);
      for(const p of set){ triABC.placed.push({pos:[p[0],p[1],z], letter}); }
    }
    for(let L=0; L<triABA.levels; L++){
      const letter = (L===0)?'A': nextLetterABA(L);
      const set = (letter==='A')? triABA.sets.A : (letter==='B'? triABA.sets.B : triABA.sets.C);
      const z = L*triHeight(d);
      for(const p of set){ triABA.placed.push({pos:[p[0],p[1],z], letter}); }
    }

    
    cubAAA.d=d; cubAAA.n=side; cubAAA.sets=sqMakeSets(d, side); cubAAA.placed=[]; cubAAA.levels=cubLevAAA;
    cubABA.d=d; cubABA.n=side; cubABA.sets=sqMakeSets(d, side); cubABA.placed=[]; cubABA.levels=cubLevABA;
    cubABC.d=d; cubABC.n=side; cubABC.sets=sqMakeSets(d, side); cubABC.placed=[]; cubABC.levels=cubLevABC;

    for(let L=0; L<cubAAA.levels; L++){
      const letter = (L===0)?'A': nextLetterAAA(L);
      const set = (letter==='A')? cubAAA.sets.A : (letter==='B'? cubAAA.sets.B : cubAAA.sets.C);
      const z = L*d;
      for(const p of set){ cubAAA.placed.push({pos:[p[0],p[1],z], letter}); }
    }
    for(let L=0; L<cubABA.levels; L++){
      const letter = (L===0)?'A': nextLetterABA(L);
      const set = (letter==='A')? cubABA.sets.A : (letter==='B'? cubABA.sets.B : cubABA.sets.C);
      const z = L*cubeHeight(d);
      for(const p of set){ cubABA.placed.push({pos:[p[0],p[1],z], letter}); }
    }
    for(let L=0; L<cubABC.levels; L++){
      const letter = (L===0)?'A': nextLetterABC(L);
      const set = (letter==='A')? cubABC.sets.A : (letter==='B'? cubABC.sets.B : cubABC.sets.C);
      const z = L*cubeHeight(d);
      for(const p of set){ cubABC.placed.push({pos:[p[0],p[1],z], letter}); }
    }
  }


  function addLayer(mode){
    const d=getCurrentSpacing(mode);
    if(Math.abs(d - triABC.d)>1e-6){ rebuildStates(d, true); }

    if(mode==='aaa_tri' || mode==='abc_tri' || mode==='aba_tri'){
      const st = (mode==='aaa_tri')? triAAA : (mode==='abc_tri')? triABC : triABA;
      const idx = st.levels;
      const letter = (mode==='aaa_tri')? nextLetterAAA(idx) : (mode==='abc_tri')? nextLetterABC(idx) : nextLetterABA(idx);
      const set = (letter==='A')? st.sets.A : (letter==='B'? st.sets.B : st.sets.C);
      const z = idx*((mode==='aaa_tri') ? st.d : triHeight(st.d));
      for(const p of set){ st.placed.push({pos:[p[0],p[1],z], letter}); }
      st.levels++;
    } else if(mode==='aaa_cub' || mode==='aba_cub' || mode==='abc_cub'){
      const st = (mode==='aaa_cub')? cubAAA : (mode==='aba_cub')? cubABA : cubABC;
      const idx = st.levels;
      const letter = (mode==='aaa_cub')? nextLetterAAA(idx) : (mode==='aba_cub')? nextLetterABA(idx) : nextLetterABC(idx);
      const set = (letter==='A')? st.sets.A : (letter==='B'? st.sets.B : st.sets.C);
      const z = idx*((mode==='aaa_cub') ? st.d : cubeHeight(st.d));
      for(const p of set){ st.placed.push({pos:[p[0],p[1],z], letter}); }
      st.levels++;
    }
    draw();
  }

  function resize(){ const rect=cv.getBoundingClientRect(); W=Math.max(600,rect.width); H=Math.max(520,rect.height); cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); draw(); }
  new ResizeObserver(resize).observe(cv);

  function draw(){
    ctx.clearRect(0,0,W,H);
    canvasHotspots=[];
    updateControlsVisibility();
    const mode=modeSel.value;
    const alpha=(+aSlider.value)/100;
    const lockedZoom = isLockedZoomMode(mode);
    const R = lockedZoom ? getLockedAtomRadius() : +rSlider.value;
    const GAP = isStackingMode(mode) ? 0 : +gapSlider.value;
    const d = lockedZoom ? getLockedStructureSpacing() : (2*R + GAP);
    const fitD = lockedZoom ? 112 : d;

    let spheres=[], edgesList=[], label='';

    if(mode==='tetra' || mode==='oct' || mode==='tetra_octa'){
      drawHoleMultiView(mode, R, alpha, d, fitD);
      return;
    }
    if(mode==='hex2d'){
      const {pts,E}=buildHexEdges(d);
      spheres=pts.map(p=>({x:p[0],y:p[1],z:0,r:R,tint:[146,154,255]})); edgesList=E;
      label='Camada Hexagonal — distância entre vizinhos = d.';
    } else if(mode==='tetra'){
      const s=d/(2*Math.SQRT2); const verts=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(v=>v.map(c=>c*s));
      spheres=verts.map(v=>({x:v[0],y:v[1],z:v[2],r:R,tint:[165,140,255]})); edgesList=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
      label='Buraco tetraédrico.';
    } else if(mode==='oct'){
      const s=d/Math.SQRT2; const verts=[[s,0,0],[-s,0,0],[0,s,0],[0,-s,0],[0,0,s],[0,0,-s]];
      spheres=verts.map(v=>({x:v[0],y:v[1],z:v[2],r:R,tint:[122,162,255]})); edgesList=[[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]];
      label='Buraco octaédrico.';
    } else {
      
      const ensure = ()=>{ if(triABC.d===0 || Math.abs(triABC.d - d)>1e-6) rebuildStates(d, true); };
      ensure();
      let placed=[];
      if(mode==='aaa_tri'){ placed=triAAA.placed; label='AAA Triangular — todas as camadas A (repetição)'; }
      if(mode==='abc_tri'){ placed=triABC.placed; label='ABC Triangular — A repete; B=Cts(A); C=Cts(B)'; }
      if(mode==='aba_tri'){ placed=triABA.placed; label='ABA Triangular — A repete; B=Cts(A)'; }
      if(mode==='aaa_cub'){ placed=cubAAA.placed; label='AAA Cúbica — todas as camadas A (repetição)'; }
      if(mode==='aba_cub'){ placed=cubABA.placed; label='ABA Cúbica — A repete; B=Cts(A)'; }
      if(mode==='abc_cub'){ placed=cubABC.placed; label='ABC Cúbica — A repete; B=Cts(A); C=Cts(B)'; }

      const items=[];
      for(const s of placed){
        const p=proj(s.pos);
        const tint = tintFor(s.letter); 
        items.push({x:p.x,y:p.y,z:p.z,R:R,tint});
      }
      items.sort((A,B)=>A.z-B.z);
      for(const it of items){ sphere(it.x,it.y,it.R,alpha,it.tint,solidCb.checked); }
    }

    
    if(mode==='hex2d'||mode==='tetra'||mode==='oct'){
      const P=spheres.map(s=>proj([s.x,s.y,s.z]));
      if(getEdgesChecked() && edgesList.length){
        const pairs=edgesList.map(([i,j])=>({a:P[i],b:P[j],z:(P[i].z+P[j].z)/2})).sort((u,v)=>u.z-v.z);
        for(const e of pairs) edge(e.a,e.b,1.4,0.8);
      }
      const items=[]; for(const s of spheres){ const p=proj([s.x,s.y,s.z]); items.push({x:p.x,y:p.y,z:p.z,R:s.r,tint:s.tint}); }
      items.sort((A,B)=>A.z-B.z); for(const it of items){ sphere(it.x,it.y,it.R,alpha,it.tint,solidCb.checked); }
    }
}

  
  let pointerState=null;
  cv.addEventListener('pointerdown',e=>{
    const pt = getCanvasPoint(e);
    const hit = canvasHotspots.find(rect=>pointInRect(pt.x, pt.y, rect));
    if(hit && modeSel.value==='tetra_octa'){
      pointerState={type:'hotspot', key:hit.key, pointerId:e.pointerId};
      cv.setPointerCapture(e.pointerId);
      return;
    }
    dragging=true; lx=e.clientX; ly=e.clientY; pointerState={type:'drag', pointerId:e.pointerId}; cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove',e=>{ if(!dragging) return; const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY; rotY+=dx*0.006; rotX+=dy*0.006; draw(); });
  cv.addEventListener('pointerup',e=>{
    if(pointerState && pointerState.type==='hotspot'){
      const pt = getCanvasPoint(e);
      const hit = canvasHotspots.find(rect=>rect.key===pointerState.key && pointInRect(pt.x, pt.y, rect));
      if(hit && Object.prototype.hasOwnProperty.call(comboViewOptions, hit.key)){
        comboViewOptions[hit.key] = !comboViewOptions[hit.key];
        draw();
      }
      pointerState=null;
      return;
    }
    dragging=false;
    pointerState=null;
  });
  cv.addEventListener('dblclick',()=>{
    rotX=-0.6; rotY=0.6;
    const d=getCurrentSpacing(modeSel.value); rebuildStates(d, true); draw();
  });

  [modeSel,rSlider,aSlider,gapSlider,gapNum,solidCb,showOctAtomsCb,showTetAtomsCb,showTetFigureCb,showOctFigureCb,hideInactiveComboCb,showPolyFigureSingleCb,showPolyAtomsSingleCb,hideInactiveSingleCb].forEach(el=>{ if(el) el.addEventListener('input', draw); });
  [edgesCb, edgesComboCb].forEach(el=>{ if(el) el.addEventListener('input', ()=>{ syncEdges(el); draw(); }); });
  modeSel.addEventListener('input', updateControlsVisibility);
  modeSel.addEventListener('change', updateControlsVisibility);
  modeSel.addEventListener('change', draw);

  layerSize.addEventListener('input', ()=>{ const d=getCurrentSpacing(modeSel.value); rebuildStates(d, true); draw(); });

  btnAdd.addEventListener('click',()=>{
    const m=modeSel.value;
    if(m==='aaa_tri' || m==='abc_tri' || m==='aba_tri' || m==='aaa_cub' || m==='aba_cub' || m==='abc_cub'){ addLayer(m); }
    else { rotX=-0.6; rotY=0.6; draw(); }
  });
  btnReset.addEventListener('click',()=>{
    const d=getCurrentSpacing(modeSel.value); resetStates(d); draw();
  });

  
  function approxEq(a,b,eps=1e-6){return Math.abs(a-b)<=eps}
  function runSelfTests(){
    let ok=true; const d0=100;
    
    const tri=triMakeSets(d0,4); ok = ok && (tri.A.length===10 && tri.B.length===6 && tri.C.length===3);
    
    ok = ok && approxEq(triC(d0)[0], 2*triB(d0)[0]) && approxEq(triC(d0)[1], 2*triB(d0)[1]);
    
    triAAA.sets=tri; triAAA.placed=[...tri.A.map(p=>({pos:p,letter:'A'}))]; triAAA.levels=1;
    let z=d0; for(const p of tri.A){ if(!ok) break; const q=[p[0],p[1],z];  ok = ok && approxEq(q[0]-p[0],0) && approxEq(q[1]-p[1],0); }
    
    const sq=sqMakeSets(d0,4); ok = ok && (sq.A.length===16 && sq.B.length===9 && sq.C.length===4);
    
    const h=d0; for(const p of sq.A){ if(!ok) break; const q=[p[0],p[1],h]; ok = ok && approxEq(q[0]-p[0],0) && approxEq(q[1]-p[1],0); }
    testResults.textContent = '';
  }

  
  function syncGapNumber(){ gapNum.value=gapSlider.value; }
  function initStates(){ const d=getCurrentSpacing(modeSel.value); resetStates(d); }
  function resizeInit(){ const rect=cv.getBoundingClientRect(); W=Math.max(600,rect.width); H=Math.max(520,rect.height); cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); }
  resizeInit(); runSelfTests(); initStates(); syncGapNumber(); updateControlsVisibility(); draw();
  gapSlider.addEventListener('input', syncGapNumber);
  gapNum.addEventListener('input',()=>{
    const min=+gapSlider.min,max=+gapSlider.max;
    let v=parseFloat(gapNum.value); if(Number.isNaN(v)) v=0;
    v=Math.max(min,Math.min(max,v)); gapSlider.value=v; gapNum.value=v; const d=getCurrentSpacing(modeSel.value); draw();
  });
})();
