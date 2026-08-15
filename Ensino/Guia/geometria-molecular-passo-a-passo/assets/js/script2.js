
(function(){
  function onReady(fn){
    if(window.__geomTutorialAPI) return fn(window.__geomTutorialAPI);
    window.addEventListener('geom-api-ready', function(){ fn(window.__geomTutorialAPI); }, {once:true});
    setTimeout(function(){ if(window.__geomTutorialAPI) fn(window.__geomTutorialAPI); }, 80);
  }

  function esc(s){ return String(s==null?'':s).replace(/[&<>\"]/g,function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]; }); }
  function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms||0); }); }

  var balloonDemoCount = 2;
  var balloonSelectedIndex = -1;
  var balloonGeomMap = {2:'linear', 3:'trigonal_planar', 4:'tetrahedral', 5:'trigonal_bipyramidal', 6:'octahedral'};
  var BALLOON_FIXED_SCALE = 1.56;
  var balloonScaleState = Array.from({length:6}, function(){ return {x:BALLOON_FIXED_SCALE, y:BALLOON_FIXED_SCALE, z:BALLOON_FIXED_SCALE}; });

  function isBalloonStep(s){ return !!(s && s.kind==='balloon_analogy'); }
  function clampBalloonCount(n){ n=(n|0); if(!isFinite(n)) n=2; return Math.max(2, Math.min(6, n)); }
  function balloonGeomLabel(n){ return ({2:'linear (180°)',3:'trigonal planar (120°)',4:'tetraédrica (109,5°)',5:'bipirâmide trigonal (90°/120°)',6:'octaédrica (90°)'}[n]||'—'); }
  function ensureBalloonScaleState(){
    for(var i=0;i<6;i++){
      balloonScaleState[i] = {
        x: BALLOON_FIXED_SCALE,
        y: BALLOON_FIXED_SCALE,
        z: BALLOON_FIXED_SCALE
      };
    }
    return balloonScaleState;
  }
  function getBalloonScale(idx){
    ensureBalloonScaleState();
    return balloonScaleState[idx] || {x:1, y:1, z:1};
  }
  function resetBalloonScaleState(){
    balloonScaleState = Array.from({length:6}, function(){ return {x:BALLOON_FIXED_SCALE, y:BALLOON_FIXED_SCALE, z:BALLOON_FIXED_SCALE}; });
    balloonSelectedIndex = -1;
  }
  function setBalloonScaleValue(idx, axis, nextValue){
    if(idx < 0 || idx >= 6) return;
    ensureBalloonScaleState();
    balloonScaleState[idx] = { x:BALLOON_FIXED_SCALE, y:BALLOON_FIXED_SCALE, z:BALLOON_FIXED_SCALE };
  }
  function nfmt(v){ return (Math.round(v * 100) / 100).toFixed(2); }
  function refreshBalloonDemoUI(){
    if(el && el.examples && isBalloonStep(steps[stepIdx])) el.examples.innerHTML = balloonDemoHTML();
  }
  function applyBalloonScaleStateToBoard(){
    if(apiRef && apiRef.setBalloonScales){
      apiRef.setBalloonScales(ensureBalloonScaleState().slice(0, balloonDemoCount));
    }
  }
  function downloadBlob(filename, blob){
    var a = document.createElement('a');
    var url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  }
  function exportBalloonConfigJSON(){
    var active = ensureBalloonScaleState().slice(0, balloonDemoCount).map(function(s, idx){
      return {
        index: idx,
        x: +nfmt(s.x),
        y: +nfmt(s.y),
        z: +nfmt(s.z)
      };
    });
    var payload = {
      type: 'balloon-analogy-config',
      count: balloonDemoCount,
      geometry: balloonGeomLabel(balloonDemoCount),
      selected_balloon: null,
      uniform_scale_xyz: +nfmt(BALLOON_FIXED_SCALE),
      scales: active
    };
    downloadBlob('baloes-config.json', new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'}));
  }
  function balloonSketchSVG(n){
    var cx = 120, cy = 60;
    var radius = ({2:50,3:42,4:40,5:42,6:44}[n] || 40);
    var startDeg = -90;
    var palette = ['#6fd7ff','#a0ffcf','#ffd57e','#ff9fc4','#d4b0ff','#fff39a'];
    var out = '<svg class="balloonSketch" viewBox="0 0 240 120" aria-label="Representação 2D da geometria com pontos">';
    out += '<circle cx="'+cx+'" cy="'+cy+'" r="4.8" fill="#f2f7ff" opacity=".95"></circle>';
    for(var i=0;i<n;i++){
      var ang = (startDeg + (360/n)*i) * Math.PI / 180;
      var bx = cx + Math.cos(ang) * radius;
      var by = cy + Math.sin(ang) * radius;
      var dotR = 9.4 * BALLOON_FIXED_SCALE * 0.42;
      out += '<g class="balloonNode" data-balloon-index="'+i+'" aria-hidden="true">';
      out += '<line x1="'+cx.toFixed(2)+'" y1="'+cy.toFixed(2)+'" x2="'+bx.toFixed(2)+'" y2="'+by.toFixed(2)+'" stroke="rgba(255,255,255,.24)" stroke-width="1.5" stroke-linecap="round"></line>';
      out += '<circle class="balloonShape" cx="'+bx.toFixed(2)+'" cy="'+by.toFixed(2)+'" r="'+dotR.toFixed(2)+'" fill="'+palette[i%palette.length]+'" stroke="rgba(255,255,255,.18)" stroke-width="1.1"></circle>';
      out += '<circle cx="'+(bx-dotR*0.26).toFixed(2)+'" cy="'+(by-dotR*0.28).toFixed(2)+'" r="'+Math.max(1.6, dotR*0.28).toFixed(2)+'" fill="rgba(255,255,255,.32)"></circle>';
      out += '</g>';
    }
    out += '</svg>';
    return out;
  }
  function balloonInspectorHTML(n){
    return '';
  }
  function balloonDemoHTML(){
    var n = clampBalloonCount(balloonDemoCount);
    if(balloonSelectedIndex >= n) balloonSelectedIndex = -1;
    var rows='';
    [2,3,4,5,6].forEach(function(k){
      rows += '<div class="row'+(k===n?' active':'')+'"><span>'+k+' balões</span><b>'+balloonGeomLabel(k)+'</b></div>';
    });
    return ''
      + '<div class="balloonDemo">'
      +   '<h4>Analogia com balões: ocupando espaço</h4>'
      +   '<div class="balloonToolbar">'
      +     '<span class="balloonCount">🎈 '+n+' balões → '+n+' regiões</span>'
      +     '<div class="balloonActions">'
      +       '<button type="button" class="miniBtn balloonRem" '+(n<=2?'disabled':'')+'>− Remover balão</button>'
      +       '<button type="button" class="miniBtn balloonAdd" '+(n>=6?'disabled':'')+'>+ Adicionar balão</button>'
      +       '<button type="button" class="miniBtn subtle balloonReset">↺ Resetar</button>'
      +     '</div>'
      +   '</div>'
      +   '<div class="balloonStage">'+balloonSketchSVG(n)+'</div>'
      +   balloonInspectorHTML(n)
      +   '<div class="balloonLegend"><b>Ideia:</b> aqui os balões aparecem como <b>pontos em projeção 2D</b>, distribuídos ao redor do mesmo centro para destacar a <b>geometria</b>. A escala dos pontos foi fixada em <b>'+nfmt(BALLOON_FIXED_SCALE)+'x</b> nos eixos x, y e z para manter a leitura visual estável.</div>'
      +   '<div class="balloonMap">'+rows+'</div>'
      + '</div>';
  }
  async function applyBalloonDemoToBoard(count, animate){
    count = clampBalloonCount(count);
    balloonDemoCount = count;
    if(balloonSelectedIndex >= count) balloonSelectedIndex = -1;
    var api = apiRef;
    if(!api || !api.ui) return;
    var u = api.ui;
    if(u.showAxes){ u.showAxes.checked = true; }
    if(u.geom){
      var g = balloonGeomMap[count] || 'tetrahedral';
      if(u.geom.querySelector('option[value="'+g+'"]')) u.geom.value = g;
    }
    if(u.bondType) u.bondType.value = '1';
    if(u.lpScale) u.lpScale.value = '1.55';
    if(u.coreColor) u.coreColor.value = '#f7c76b';
    if(u.ligandColor) u.ligandColor.value = '#57c7ff';
    if(u.lpColor) u.lpColor.value = '#1100ff';
    api.sync && api.sync();
    if(api.setBoardSplit) api.setBoardSplit(true);
    if(api.setBalloons) api.setBalloons(count);
    applyBalloonScaleStateToBoard();
    refreshBalloonDemoUI();
    if(api.pulse) api.pulse();
    if(animate!==false){
      var viewByN = {
        2:{camDist:7.6, rotX:0.38, rotY:-0.98, objRotXDeg:0, objRotYDeg:0},
        3:{camDist:5.35, rotX:0.16, rotY:-0.45, objRotXDeg:0, objRotYDeg:0},
        4:{camDist:5.8, rotX:0.40, rotY:-0.82, objRotXDeg:0, objRotYDeg:0},
        5:{camDist:6.25, rotX:0.34, rotY:-0.70, objRotXDeg:0, objRotYDeg:0},
        6:{camDist:6.35, rotX:0.30, rotY:-0.64, objRotXDeg:0, objRotYDeg:0}
      };
      if(api.animateTo) await api.animateTo(viewByN[count]||viewByN[4], 700);
    }
  }

  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function round(n,d){ var p=Math.pow(10,d||2); return Math.round(n*p)/p; }
  function v(x,y,z){ return [x,y,z]; }
  function vAdd(a,b){ return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]; }
  function vSub(a,b){ return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]; }
  function vMul(a,s){ return [a[0]*s,a[1]*s,a[2]*s]; }
  function vDot(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
  function vCross(a,b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function vLen(a){ return Math.hypot(a[0],a[1],a[2]); }
  function vNorm(a){ var L=vLen(a)||1; return [a[0]/L,a[1]/L,a[2]/L]; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function ease(t){ return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

  function geomPositions(type){
    
    
    
    var DEG = Math.PI/180;
    var SQ2=Math.sqrt(2), SQ3=Math.sqrt(3);

    function nrm(v){ var L=Math.hypot(v[0],v[1],v[2])||1; return [v[0]/L,v[1]/L,v[2]/L]; }

    
    var trig = [
      [0,0,1],
      [ SQ3/2, 0, -0.5 ],
      [-SQ3/2, 0, -0.5 ]
    ].map(nrm);

    
    var tetra = [
      [ 1,  1,  1],
      [-1, -1,  1],
      [ 1, -1, -1],
      [-1,  1, -1]
    ].map(nrm);

    
    
    
    var tbp = {
      eq: [
        [ 0, 0, 1 ],
        [ 0,  SQ3/2, -0.5 ],
        [ 0, -SQ3/2, -0.5 ]
      ].map(nrm),
      ax: [[1,0,0],[-1,0,0]]
    };

    
    var oct = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];

    
    var trigC3 = [
      [ 1, 0, 0 ],
      [ -0.5,  SQ3/2, 0 ],
      [ -0.5, -SQ3/2, 0 ]
    ].map(nrm);

    
    var r = 2*SQ2/3, z = -1/3;
    var tetraC3 = [
      [0,0,1],
      [ r, 0, z],
      [ r*Math.cos(2*Math.PI/3), r*Math.sin(2*Math.PI/3), z],
      [ r*Math.cos(4*Math.PI/3), r*Math.sin(4*Math.PI/3), z]
    ].map(nrm);

    switch(type){
      case 'linear': return {lig:[[0,0,1],[0,0,-1]], lp:[], angle:'180°', ideal:'180°', arr:'AX2', label:'Linear'};
      case 'trigonal_planar': return {lig:trig, lp:[], angle:'120°', ideal:'120°', arr:'AX3', label:'Trigonal planar'};
      case 'tetrahedral':
      case 'tetra': return {lig:[tetra[0],tetra[1],tetra[2],tetra[3]], lp:[], angle:'109,5° (3D)', ideal:'109,5°', arr:'AX4', label:'Tetraédrica'};
      case 'trigonal_bipyramidal':
      case 'tbp': return {lig:tbp.eq.concat(tbp.ax), lp:[], angle:'120° (eq-eq), 90° (ax-eq), 180° (ax-ax)', ideal:'120°/90°/180°', arr:'AX5', label:'Bipirâmide trigonal'};
      case 'octahedral':
      case 'oct': return {lig:oct, lp:[], angle:'90° (adj.), 180° (opostos)', ideal:'90°/180°', arr:'AX6', label:'Octaédrica'};

      case 'bent_tp': {
        
        var t=60*DEG;
        var lig=[ [ Math.sin(t),0,-Math.cos(t) ], [ -Math.sin(t),0,-Math.cos(t) ] ];
        var lp=[ [0,0,1] ];
        return {lig:lig, lp:lp, angle:'≈120° (1 par livre)', ideal:'≈120°', arr:'AX2E', label:'Angular (AX2E)'};
      }
      case 'trigonal_pyramidal': {
        
        var lig=[tetraC3[1],tetraC3[2],tetraC3[3]];
        var lp=[tetraC3[0]];
        return {lig:lig, lp:lp, angle:'≈107° (1 par livre)', ideal:'≈107°', arr:'AX3E', label:'Piramidal trigonal (AX3E)'};
      }
      case 'bent_tet': {
        var lig=[nrm([1,0,-0.78]), nrm([-1,0,-0.78])];
        var lp=[nrm([1,1,1]), nrm([-1,-1,1])];
        return {lig:lig, lp:lp, angle:'≈104,5° (2 pares livres)', ideal:'≈104,5°', arr:'AX2E2', label:'Angular (AX2E2)'};
      }
      case 'see_saw': {
        
        var lp=[[0,0,1]];
        var lig=[
          [0,  SQ3/2, -0.5],
          [0, -SQ3/2, -0.5],
          [1,0,0],
          [-1,0,0]
        ];
        return {lig:lig, lp:lp, angle:'≈120° (eq-eq), ≈90° (ax-eq), ≈180° (ax-ax)', ideal:'≈120°/≈90°/≈180°', arr:'AX4E', label:'Gangorra (AX4E)'};
      }
      case 't_shaped': {
        
        var lp=[
          [ 0.75, -SQ3/4, -0.5],
          [-0.75,  SQ3/4, -0.5]
        ];
        var lig=[
          [0,0,1],
          [ 0.5,  SQ3/2, 0],
          [-0.5, -SQ3/2, 0]
        ];
        return {lig:lig, lp:lp, angle:'≈90° (ax-eq), ≈180° (ax-ax)', ideal:'≈90°/≈180°', arr:'AX3E2', label:'Em T (AX3E2)'};
      }
      case 'linear_tbp': {
        var lig=[tbp.ax[0],tbp.ax[1]];
        var lp=tbp.eq.slice();
        return {lig:lig, lp:lp, angle:'≈180° (lig-lig); pares livres equatoriais a ≈120°', ideal:'≈180°', arr:'AX2E3', label:'Linear (AX2E3)'};
      }
      case 'square_pyramidal': {
        var lig=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,-1]];
        var lp=[[0,0,1]];
        return {lig:lig, lp:lp, angle:'≈90° (ax-basal), ≈90°/≈180° na base', ideal:'≈90°/≈90°/≈180°', arr:'AX5E', label:'Piramidal quadrada (AX5E)'};
      }
      case 'square_planar': {
        var lig=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]];
        var lp=[[0,0,1],[0,0,-1]];
        return {lig:lig, lp:lp, angle:'≈90°/≈180° (pares livres trans fora do plano)', ideal:'≈90°/≈180°', arr:'AX4E2', label:'Quadrada planar (AX4E2)'};
      }
      default: return {lig:[tetra[0],tetra[1],tetra[2],tetra[3]], lp:[], angle:'109,5° (3D)', ideal:'109,5°', arr:'AX4', label:'Tetraédrica'};
    }
  }

  var exampleCatalog = {
      'CO2':  { key:'CO2', label:'CO₂',  geom:'linear',               centerColor:'#3d4147', ligandColor:'#ff5858', lpColor:'#1100ff', bondType:2, view:{camDist:4.2, rotX:0.14, rotY:0.02, objRotYDeg:0}},
      'H2O':  { key:'H2O', label:'H₂O',  geom:'bent_tet',             centerColor:'#ff5858', ligandColor:'#eef6ff', lpColor:'#1100ff', bondType:1, lpScale:1.65, view:{camDist:4.7, rotX:0.44, rotY:-0.96, objRotYDeg:0}},
      'NH3':  { key:'NH3', label:'NH₃',  geom:'trigonal_pyramidal',   centerColor:'#5c76ff', ligandColor:'#f5fbff', lpColor:'#1100ff', bondType:1, lpScale:1.65, view:{camDist:4.95, rotX:0.42, rotY:-0.96, objRotYDeg:0}},
      'CH4':  { key:'CH4', label:'CH₄',  geom:'tetrahedral',          centerColor:'#3f434a', ligandColor:'#f5fbff', lpColor:'#1100ff', bondType:1, lpScale:1.45, view:{camDist:4.95, rotX:0.40, rotY:-0.82, objRotYDeg:0}},
      'C2H6': { key:'C2H6', label:'C₂H₆ (em torno de 1 C)', geom:'tetrahedral',   centerColor:'#3f434a', ligandColor:'#eaf4ff', lpColor:'#1100ff', bondType:1, lpScale:1.45, view:{camDist:5.0, rotX:0.40, rotY:-0.84, objRotYDeg:0}},
      'C2H4': { key:'C2H4', label:'C₂H₄ (em torno de 1 C)', geom:'trigonal_planar',centerColor:'#3f434a', ligandColor:'#eaf4ff', lpColor:'#1100ff', bondType:2, view:{camDist:4.6, rotX:0.08, rotY:-0.28, objRotXDeg:0, objRotYDeg:0}},
      'C2H2': { key:'C2H2', label:'C₂H₂ (em torno de 1 C)', geom:'linear',         centerColor:'#3f434a', ligandColor:'#eaf4ff', lpColor:'#1100ff', bondType:3, view:{camDist:4.25, rotX:0.14, rotY:0.02, objRotYDeg:0}},
      'BF3':  { key:'BF3', label:'BF₃',  geom:'trigonal_planar',      centerColor:'#ff9b7a', ligandColor:'#bff56a', lpColor:'#1100ff', bondType:1, view:{camDist:4.55, rotX:0.05, rotY:-0.22, objRotXDeg:0, objRotYDeg:0}},
      'SO2':  { key:'SO2', label:'SO₂',  geom:'bent_tp',              centerColor:'#ffd654', ligandColor:'#ff5858', lpColor:'#1100ff', bondType:2, lpScale:1.7, view:{camDist:4.35, rotX:0.24, rotY:-0.55, objRotYDeg:0}},
      'O3':   { key:'O3', label:'O₃',   geom:'bent_tp',              centerColor:'#ff7272', ligandColor:'#ff4f4f', lpColor:'#1100ff', bondType:1, lpScale:1.65, view:{camDist:4.4, rotX:0.24, rotY:-0.52, objRotYDeg:0}},
      'SO3':  { key:'SO3', label:'SO₃',  geom:'trigonal_planar',      centerColor:'#ffd654', ligandColor:'#ff5858', lpColor:'#1100ff', bondType:2, view:{camDist:4.6, rotX:0.08, rotY:-0.30, objRotXDeg:0, objRotYDeg:0}},
      'CCl4': { key:'CCl4', label:'CCl₄', geom:'tetrahedral',          centerColor:'#3f434a', ligandColor:'#39c66d', lpColor:'#1100ff', bondType:1, view:{camDist:5.05, rotX:0.42, rotY:-0.86, objRotYDeg:0}},
      'PCl3': { key:'PCl3', label:'PCl₃', geom:'trigonal_pyramidal',   centerColor:'#ff9f43', ligandColor:'#39c66d', lpColor:'#1100ff', bondType:1, lpScale:1.7, view:{camDist:4.95, rotX:0.42, rotY:-0.98, objRotYDeg:0}},
      'PCl5': { key:'PCl5', label:'PCl₅', geom:'trigonal_bipyramidal', centerColor:'#ff9f43', ligandColor:'#39c66d', lpColor:'#1100ff', bondType:1, view:{camDist:5.8, rotX:0.30, rotY:-0.84, objRotYDeg:0}},
      'SF4':  { key:'SF4', label:'SF₄',  geom:'see_saw',              centerColor:'#ffd654', ligandColor:'#bff56a', lpColor:'#1100ff', bondType:1, lpScale:1.75, view:{camDist:5.1, rotX:0.40, rotY:-0.98, objRotYDeg:0}},
      'ClF3': { key:'ClF3', label:'ClF₃', geom:'t_shaped',             centerColor:'#39c66d', ligandColor:'#bff56a', lpColor:'#1100ff', bondType:1, lpScale:1.7, view:{camDist:4.95, rotX:0.36, rotY:-0.92, objRotYDeg:0}},
      'XeF2': { key:'XeF2', label:'XeF₂', geom:'linear_tbp',           centerColor:'#9b85ff', ligandColor:'#bff56a', lpColor:'#1100ff', bondType:1, lpScale:1.75, view:{camDist:4.65, rotX:0.18, rotY:-0.32, objRotYDeg:0}},
      'SF6':  { key:'SF6', label:'SF₆',  geom:'octahedral',           centerColor:'#ffd654', ligandColor:'#bff56a', lpColor:'#1100ff', bondType:1, view:{camDist:5.65, rotX:0.38, rotY:-0.92, objRotYDeg:0}},
      'BrF5': { key:'BrF5', label:'BrF₅', geom:'square_pyramidal',     centerColor:'#c88446', ligandColor:'#bff56a', lpColor:'#1100ff', bondType:1, lpScale:1.7, view:{camDist:5.25, rotX:0.44, rotY:-0.96, objRotYDeg:0}},
      'XeF4': { key:'XeF4', label:'XeF₄', geom:'square_planar',        centerColor:'#9b85ff', ligandColor:'#bff56a', lpColor:'#1100ff', bondType:1, lpScale:1.75, view:{camDist:5.0, rotX:0.18, rotY:-0.42, objRotXDeg:0, objRotYDeg:0}},
      'OF2':  { key:'OF2', label:'OF₂',  geom:'bent_tet',             centerColor:'#ff5858', ligandColor:'#bff56a', lpColor:'#1100ff', bondType:1, lpScale:1.65, view:{camDist:4.65, rotX:0.42, rotY:-0.92, objRotYDeg:0}},
      'BeCl2':{ key:'BeCl2', label:'BeCl₂',geom:'linear',               centerColor:'#9bb4a4', ligandColor:'#39c66d', lpColor:'#1100ff', bondType:1, view:{camDist:4.2, rotX:0.14, rotY:0.02, objRotYDeg:0}}
    };

  var steps = [
      {
        title: 'Fundamento da geometria molecular',
        body: 'A geometria molecular resulta da distribuição espacial das <b>regiões de densidade eletrônica</b> ao redor do átomo central. Como elétrons e pares eletrônicos interagem por repulsão coulombiana, o sistema tende a adotar uma disposição tridimensional que maximize o afastamento relativo entre essas regiões, reduzindo a <b>energia potencial</b> e aumentando a <b>estabilidade</b>.',
        note: 'A forma molecular não é arbitrária: ela corresponde, em primeira aproximação, ao arranjo espacial mais estável para a distribuição eletrônica da espécie.',
        pills: ['densidade eletrônica', 'energia potencial', 'estabilidade'],
        examples: ['CH4','H2O','CO2'],
        run: async function(api){
          api.setAxes(true);
          api.setGeom('tetrahedral');
          api.setLPScale(1.8);
          await api.animateTo({camDist:5.2, rotX:0.36, rotY:-0.75, objRotYDeg:0}, 950);
        }
      },
      {
        title: 'Modelo didático: analogia com balões',
        kind: 'balloon_analogy',
        body: 'A analogia com balões é um modelo qualitativo para visualizar ocupação de espaço. Balões presos a um mesmo ponto afastam-se mutuamente e assumem arranjos espaciais definidos. De modo análogo, no modelo VSEPR, as <b>regiões eletrônicas</b> ao redor do átomo central distribuem-se de forma a minimizar repulsões.',
        note: 'A analogia é apenas representativa. Sua função é tornar visível a ideia de volume ocupado e de afastamento relativo entre regiões eletrônicas.',
        pills: ['modelo didático', 'ocupação de espaço', 'afastamento'],
        run: async function(api){
          balloonDemoCount = clampBalloonCount(balloonDemoCount || 4);
          await applyBalloonDemoToBoard(balloonDemoCount, true);
        }
      },
      {
        title: 'Princípio básico do VSEPR',
        body: 'A teoria VSEPR (<i>Valence Shell Electron Pair Repulsion</i>) estabelece que as <b>regiões eletrônicas</b> ao redor do átomo central se organizam de modo a ficarem o mais afastadas possível. Para aplicar o modelo corretamente, primeiro determina-se o <b>arranjo eletrônico</b> considerando todas as regiões; em seguida, obtém-se a <b>geometria molecular</b> considerando apenas a posição dos átomos ligados.',
        note: 'No VSEPR, ligação simples, dupla, tripla e par não ligante contam, cada um, como uma região eletrônica para a definição da geometria-base.',
        pills: ['VSEPR', 'arranjo eletrônico', 'geometria molecular'],
        examples: ['CO2','BF3','CH4','PCl5','SF6'],
        run: async function(api){
          api.setGeom('trigonal_pyramidal');
          api.setLPScale(2.0);
          await api.animateTo({camDist:4.95, rotX:0.42, rotY:-0.96, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Leitura tridimensional: eixos x, y e z',
        body: 'Os eixos <b>x</b>, <b>y</b> e <b>z</b> permitem interpretar a orientação espacial da molécula no sistema cartesiano. Essa referência é importante porque estruturas que parecem semelhantes em uma projeção bidimensional podem corresponder a orientações distintas no espaço tridimensional.',
        note: 'Representações em papel ou tela são projeções. A geometria molecular, porém, é intrinsecamente tridimensional.',
        pills: ['orientação espacial', 'projeção 2D', 'referencial 3D'],
        examples: ['CH4','PCl5','SF6'],
        run: async function(api){
          api.setAxes(true);
          api.setGeom('tetrahedral');
          await api.animateTo({camDist:5.5, rotX:0.20, rotY:-0.20, objRotXDeg:0, objRotYDeg:0}, 800);
          await api.animateTo({camDist:5.5, rotX:0.56, rotY:-1.08, objRotXDeg:0, objRotYDeg:0}, 950);
        }
      },
      {
        title: 'Definição de ângulo de ligação',
        body: 'Ângulo de ligação é a abertura formada entre <b>duas ligações</b> que partem do átomo central. Em linguagem vetorial, corresponde ao ângulo entre dois vetores dirigidos do átomo central para dois ligantes.',
        note: 'Os ângulos de ligação decorrem da distribuição espacial das regiões eletrônicas; não são parâmetros escolhidos de forma independente.',
        pills: ['ângulo de ligação', 'átomo central', 'interpretação vetorial'],
        examples: ['CO2','BF3','H2O'],
        run: async function(api){
          api.setGeom('bent_tet');
          api.setLPScale(2.0);
          await api.animateTo({camDist:4.25, rotX:0.20, rotY:-0.45, objRotYDeg:0}, 700);
          await api.animateTo({camDist:4.75, rotX:0.46, rotY:-0.98, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Ângulo ideal e ângulo observado',
        body: 'Cada arranjo eletrônico possui <b>ângulos ideais</b> associados ao modelo geométrico perfeito. Na molécula real, os <b>ângulos observados</b> podem diferir desses valores em razão da presença de pares não ligantes, de ligações múltiplas e de diferenças no volume ocupado pelos grupos ligados.',
        note: 'O procedimento correto é identificar primeiro a geometria ideal e, depois, avaliar os fatores que produzem deformações no valor experimental do ângulo.',
        pills: ['ângulo ideal', 'ângulo real', 'deformação geométrica'],
        examples: ['CH4','NH3','H2O'],
        run: async function(api){
          api.setGeom('tetrahedral');
          api.setLPScale(1.6);
          await api.animateTo({camDist:4.95, rotX:0.40, rotY:-0.82, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Energia potencial, repulsão e estabilidade',
        body: 'Quando as regiões eletrônicas ficam melhor distribuídas no espaço, as repulsões entre elas diminuem e a <b>energia potencial</b> do sistema tende a diminuir. Por isso, a forma mais estável, em geral, é aquela que evita aproximações desnecessárias entre regiões de densidade eletrônica.',
        note: 'No contexto do VSEPR, a geometria observada pode ser interpretada como o resultado de uma minimização de energia associada às repulsões eletrônicas.',
        pills: ['repulsão eletrônica', 'mínimo de energia', 'estabilidade estrutural'],
        examples: ['PCl5','SF4','SF6'],
        run: async function(api){
          api.setGeom('trigonal_bipyramidal');
          await api.animateTo({camDist:5.85, rotX:0.28, rotY:-0.82, objRotYDeg:0}, 900);
          await api.animateTo({camDist:5.35, rotX:0.36, rotY:-0.94, objRotYDeg:0}, 650);
        }
      },
      {
        title: 'Repulsão estérica e impedimento espacial',
        body: 'Além da repulsão eletrônica descrita pelo VSEPR, grupos mais volumosos podem introduzir <b>impedimento estérico</b>. Nessa situação, a proximidade espacial entre átomos ou grupos aumenta o custo energético do arranjo e favorece orientações que reduzam o contato entre volumes ocupados.',
        note: 'Em cadeias carbônicas, esse efeito contribui para a maior estabilidade relativa de conformações menos congestionadas, como a conformação anti em comparação com a gauche no butano.',
        pills: ['impedimento estérico', 'volume molecular', 'conformação'],
        examples: ['CH4','C2H6','C2H4','C2H2'],
        run: async function(api){
          api.setGeom('see_saw');
          api.setLPScale(2.1);
          await api.animateTo({camDist:5.2, rotX:0.34, rotY:-0.82, objRotYDeg:0}, 900);
          await api.animateTo({camDist:4.95, rotX:0.44, rotY:-1.05, objRotYDeg:0}, 700);
        }
      },
      {
        title: 'Arranjo eletrônico e geometria molecular',
        body: '<b>Arranjo eletrônico</b> considera todas as regiões eletrônicas ao redor do átomo central, incluindo ligações e pares não ligantes. <b>Geometria molecular</b> considera apenas a disposição espacial dos átomos ligados. Por isso, uma mesma molécula pode apresentar arranjo eletrônico tetraédrico e geometria molecular angular.',
        note: 'Essa distinção é fundamental para interpretar corretamente estruturas com pares não ligantes no átomo central.',
        pills: ['arranjo eletrônico', 'pares não ligantes', 'forma molecular'],
        examples: ['CH4','H2O','NH3'],
        run: async function(api){
          api.setGeom('bent_tet');
          api.setLPScale(2.05);
          await api.animateTo({camDist:4.55, rotX:0.42, rotY:-0.95, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Duas regiões eletrônicas: geometria linear',
        body: 'Com <b>2 regiões eletrônicas</b>, a separação máxima é obtida quando elas ficam em direções opostas, formando um ângulo de <b>180°</b>. Se ambas forem ligações, o arranjo eletrônico e a geometria molecular são lineares.',
        note: 'Exemplo clássico: CO₂. Mesmo com ligações duplas, cada ligação conta como uma única região eletrônica no modelo VSEPR.',
        pills: ['2 regiões', 'linear', '180°'],
        examples: ['CO2','BeCl2'],
        run: async function(api){
          api.setGeom('linear');
          await api.animateTo({camDist:4.25, rotX:0.14, rotY:0.02, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Três regiões eletrônicas: trigonal planar',
        body: 'Com <b>3 regiões eletrônicas</b>, a distribuição de menor repulsão corresponde à geometria <b>trigonal planar</b>, com ângulos ideais de <b>120°</b>. As três regiões ficam contidas em um mesmo plano ao redor do átomo central.',
        note: 'Exemplo: BF₃. Se uma das três regiões for um par não ligante, a geometria molecular deixa de ser trigonal planar e passa a ser angular.',
        pills: ['3 regiões', 'trigonal planar', '120°'],
        examples: ['BF3','SO3'],
        run: async function(api){
          api.setGeom('trigonal_planar');
          await api.animateTo({camDist:4.55, rotX:0.05, rotY:-0.22, objRotXDeg:0, objRotYDeg:0}, 950);
        }
      },
      {
        title: 'Três regiões com um par não ligante: angular (AX2E)',
        body: 'Quando uma das <b>3 regiões eletrônicas</b> é um <b>par não ligante</b>, o arranjo eletrônico permanece trigonal planar, mas a geometria molecular observada passa a ser <b>angular</b>. O par não ligante ocupa maior volume eletrônico efetivo e comprime o ângulo entre as ligações.',
        note: 'Esse caso evidencia que a presença de pares não ligantes altera a geometria molecular sem mudar a geometria-base do arranjo eletrônico.',
        pills: ['AX2E', 'par não ligante', 'geometria angular'],
        examples: ['SO2','O3'],
        run: async function(api){
          api.setGeom('bent_tp');
          api.setLPScale(2.0);
          await api.animateTo({camDist:4.35, rotX:0.24, rotY:-0.55, objRotYDeg:0}, 850);
        }
      },
      {
        title: 'Quatro regiões eletrônicas: tetraédrica',
        body: 'Com <b>4 regiões eletrônicas</b>, a disposição de menor repulsão corresponde à geometria <b>tetraédrica</b>, cujo ângulo ideal é <b>109,5°</b>. Essa geometria é central na descrição de inúmeras moléculas covalentes e em grande parte da química orgânica.',
        note: 'Exemplo: CH₄. Na ausência de pares não ligantes, os ângulos experimentais tendem a permanecer próximos do valor ideal.',
        pills: ['4 regiões', 'tetraédrica', '109,5°'],
        examples: ['CH4','CCl4'],
        run: async function(api){
          api.setGeom('tetrahedral');
          api.setLPScale(1.6);
          await api.animateTo({camDist:4.9, rotX:0.42, rotY:-0.80, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Geometria piramidal trigonal (AX3E): NH₃',
        body: 'Quando o átomo central apresenta <b>4 regiões eletrônicas</b>, sendo <b>3 ligações e 1 par não ligante</b>, o arranjo eletrônico é tetraédrico, mas a geometria molecular torna-se <b>piramidal trigonal</b>. Nesse caso, o ângulo de ligação fica reduzido em relação a 109,5°, situando-se em torno de <b>107°</b> no NH₃.',
        note: 'A redução angular decorre da maior repulsão exercida pelo par não ligante sobre os pares ligantes.',
        pills: ['AX3E', 'NH₃', '≈107°'],
        examples: ['NH3','PCl3'],
        run: async function(api){
          api.setGeom('trigonal_pyramidal');
          api.setLPScale(2.1);
          await api.animateTo({camDist:5.0, rotX:0.38, rotY:-0.95, objRotYDeg:0}, 850);
          await api.animateTo({camDist:4.6, rotX:0.42, rotY:-0.87, objRotYDeg:0}, 600);
        }
      },
      {
        title: 'Geometria angular (AX2E2): H₂O',
        body: 'Na molécula de água, o oxigênio apresenta <b>4 regiões eletrônicas</b>, correspondentes a <b>2 ligações</b> e <b>2 pares não ligantes</b>. O arranjo eletrônico é tetraédrico, mas a geometria molecular é <b>angular</b>, com ângulo de ligação próximo de <b>104,5°</b>.',
        note: 'Como há dois pares não ligantes no átomo central, a compressão angular é mais intensa do que no caso do NH₃.',
        pills: ['AX2E2', 'H₂O', '≈104,5°'],
        examples: ['H2O','OF2'],
        run: async function(api){
          api.setGeom('bent_tet');
          api.setLPScale(2.2);
          await api.animateTo({camDist:4.2, rotX:0.22, rotY:-0.42, objRotYDeg:0}, 700);
          await api.animateTo({camDist:4.75, rotX:0.50, rotY:-1.02, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Hierarquia das repulsões eletrônicas',
        body: 'As repulsões entre regiões eletrônicas não têm a mesma intensidade. Em geral, observa-se a ordem <b>par não ligante–par não ligante &gt; par não ligante–ligação &gt; ligação–ligação</b>. Essa hierarquia explica por que pares não ligantes produzem deformações angulares mais acentuadas.',
        note: 'Ligações múltiplas também podem intensificar repulsões locais e contribuir para desvios adicionais em relação aos ângulos ideais.',
        pills: ['PNL-PNL', 'PNL-ligação', 'ligação-ligação'],
        examples: ['NH3','H2O','SO2'],
        run: async function(api){
          api.setGeom('trigonal_pyramidal');
          api.setLPScale(2.25);
          await api.animateTo({camDist:4.7, rotX:0.42, rotY:-0.92, objRotYDeg:0}, 850);
        }
      },
      {
        title: 'Cinco regiões eletrônicas: bipirâmide trigonal',
        body: 'Com <b>5 regiões eletrônicas</b>, a geometria de menor repulsão é a <b>bipirâmide trigonal</b>. Nela, existem duas classes de posição: <b>equatoriais</b>, separadas por <b>120°</b>, e <b>axiais</b>, que fazem <b>90°</b> com o plano equatorial e <b>180°</b> entre si.',
        note: 'Nesse arranjo, as posições não são energeticamente equivalentes, o que se torna decisivo quando há pares não ligantes.',
        pills: ['5 regiões', 'equatorial', 'axial'],
        examples: ['PCl5'],
        run: async function(api){
          api.setGeom('trigonal_bipyramidal');
          await api.animateTo({camDist:5.8, rotX:0.24, rotY:-0.78, objRotYDeg:0}, 900);
          await api.animateTo({camDist:5.4, rotX:0.34, rotY:-0.98, objRotYDeg:0}, 700);
        }
      },
      {
        title: 'Pares não ligantes em TBP: preferência equatorial',
        body: 'Na bipirâmide trigonal, um <b>par não ligante</b> tende a ocupar posição <b>equatorial</b>, pois nessa posição sofre menos interações a 90° do que sofreria em posição axial. Essa escolha reduz a repulsão total e torna o arranjo mais estável.',
        note: 'A preferência equatorial decorre diretamente de uma comparação entre intensidades de repulsão e energia relativa das posições disponíveis.',
        pills: ['posição equatorial', 'repulsão a 90°', 'estabilidade relativa'],
        examples: ['SF4'],
        run: async function(api){
          api.setGeom('see_saw');
          api.setLPScale(2.15);
          await api.animateTo({camDist:5.1, rotX:0.34, rotY:-0.84, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Derivações da bipirâmide trigonal',
        body: 'A partir de uma base eletrônica <b>bipirâmide trigonal</b>, a presença de pares não ligantes pode gerar diferentes geometrias moleculares, como <b>gangorra (AX4E)</b>, <b>em T (AX3E2)</b> e <b>linear (AX2E3)</b>. Assim, um mesmo arranjo eletrônico pode originar formas moleculares distintas.',
        note: 'O procedimento analítico permanece o mesmo: determina-se primeiro o arranjo eletrônico e, depois, a geometria molecular resultante da exclusão visual dos pares não ligantes.',
        pills: ['AX4E', 'AX3E2', 'AX2E3'],
        examples: ['SF4','ClF3','XeF2'],
        run: async function(api){
          api.setGeom('t_shaped');
          api.setLPScale(2.15);
          await api.animateTo({camDist:4.9, rotX:0.28, rotY:-0.70, objRotYDeg:0}, 750);
          api.setGeom('linear_tbp');
          await api.animateTo({camDist:4.55, rotX:0.18, rotY:0.02, objRotYDeg:0}, 850);
        }
      },
      {
        title: 'Seis regiões eletrônicas: octaédrica',
        body: 'Com <b>6 regiões eletrônicas</b>, o arranjo de menor repulsão é o <b>octaédrico</b>, caracterizado por ângulos de <b>90°</b> entre posições adjacentes e <b>180°</b> entre posições opostas. Trata-se de uma distribuição altamente simétrica.',
        note: 'Exemplo clássico: SF₆. Quando todas as seis regiões são equivalentes, a simetria do arranjo é máxima.',
        pills: ['6 regiões', 'octaédrica', '90° e 180°'],
        examples: ['SF6'],
        run: async function(api){
          api.setGeom('octahedral');
          await api.animateTo({camDist:5.35, rotX:0.36, rotY:-0.66, objRotXDeg:0, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Derivações da octaédrica',
        body: 'Quando pares não ligantes são introduzidos em uma base <b>octaédrica</b>, podem surgir geometrias como <b>piramidal quadrada (AX5E)</b> e <b>quadrado planar (AX4E2)</b>. No caso quadrado planar, os dois pares não ligantes ocupam posições opostas, preservando a disposição coplanar dos quatro ligantes.',
        note: 'Exemplo introdutório importante: XeF₄, frequentemente utilizado para ilustrar a geometria quadrado planar no contexto do VSEPR.',
        pills: ['AX5E', 'AX4E2', 'quadrado planar'],
        examples: ['BrF5','XeF4'],
        run: async function(api){
          api.setGeom('square_pyramidal');
          api.setLPScale(2.1);
          await api.animateTo({camDist:5.05, rotX:0.34, rotY:-0.78, objRotYDeg:0}, 850);
          api.setGeom('square_planar');
          await api.animateTo({camDist:4.7, rotX:0.08, rotY:-0.20, objRotXDeg:0, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Ligações múltiplas: uma região eletrônica, repulsão mais intensa',
        body: 'No VSEPR, <b>ligações simples, duplas e triplas</b> contam, cada uma, como <b>uma única região eletrônica</b> para fins de classificação do arranjo. Entretanto, ligações múltiplas concentram maior densidade eletrônica ao longo do eixo de ligação e podem produzir <b>repulsões locais mais intensas</b>, alterando os ângulos observados.',
        note: 'Portanto, a contagem de regiões define a geometria-base, mas a previsão fina dos ângulos exige considerar a natureza das ligações presentes.',
        pills: ['ligações múltiplas', 'contagem de regiões', 'ângulo observado'],
        examples: ['CO2','SO2','C2H4','C2H2'],
        run: async function(api){
          api.setGeom('linear');
          await api.animateTo({camDist:4.8, rotX:0.24, rotY:-0.62, objRotYDeg:0}, 800);
          api.setGeom('bent_tp');
          api.setLPScale(1.95);
          await api.animateTo({camDist:4.7, rotX:0.42, rotY:-0.95, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Ângulos reais e minimização de energia',
        body: 'Pequenas variações nos ângulos de ligação podem alterar a energia da molécula, pois modificam a intensidade das repulsões entre regiões eletrônicas e entre grupos volumosos. A geometria efetivamente observada corresponde, em geral, ao melhor compromisso entre essas interações, isto é, ao arranjo de menor energia disponível para a espécie.',
        note: 'Assim, o ângulo experimental não precisa coincidir com o valor ideal do modelo geométrico, mas sim com o valor energeticamente mais favorável para aquela estrutura real.',
        pills: ['ângulo experimental', 'energia mínima', 'compromisso estrutural'],
        examples: ['NH3','H2O','SF4'],
        run: async function(api){
          api.setGeom('trigonal_pyramidal');
          api.setLPScale(2.0);
          await api.animateTo({camDist:4.95, rotX:0.33, rotY:-0.78, objRotYDeg:0}, 800);
          await api.animateTo({camDist:4.55, rotX:0.48, rotY:-1.00, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Roteiro lógico para identificar a geometria',
        body: 'Para analisar uma molécula pelo VSEPR, siga a sequência: <b>(1)</b> identificar o átomo central; <b>(2)</b> contar o número de regiões eletrônicas; <b>(3)</b> determinar o arranjo eletrônico; <b>(4)</b> verificar a quantidade de pares não ligantes; <b>(5)</b> concluir a geometria molecular e avaliar eventuais deformações angulares.',
        note: 'Esse roteiro evita confusões frequentes, como atribuir geometria tetraédrica à molécula de H₂O em vez de reconhecer que tetraédrico é apenas o seu arranjo eletrônico.',
        pills: ['sequência analítica', 'identificação correta', 'pares não ligantes'],
        examples: ['H2O','NH3','CH4'],
        run: async function(api){
          api.setGeom('tetrahedral');
          await api.animateTo({camDist:5.0, rotX:0.40, rotY:-0.85, objRotYDeg:0}, 700);
          api.setGeom('bent_tet');
          api.setLPScale(2.0);
          await api.animateTo({camDist:4.65, rotX:0.42, rotY:-0.95, objRotYDeg:0}, 950);
        }
      },
      {
        title: 'Procedimento sistemático para resolver exercícios',
        body: '<b>1)</b> construa ou analise a estrutura de Lewis; <b>2)</b> conte as regiões eletrônicas no átomo central; <b>3)</b> identifique o arranjo eletrônico; <b>4)</b> obtenha a geometria molecular desconsiderando visualmente os pares não ligantes; <b>5)</b> refine a análise levando em conta repulsões diferenciadas, ligações múltiplas e impedimento estérico.',
        note: 'Síntese das geometrias-base: 2 regiões, linear; 3, trigonal planar; 4, tetraédrica; 5, bipirâmide trigonal; 6, octaédrica.',
        pills: ['estrutura de Lewis', 'método VSEPR', 'refinamento angular'],
        examples: ['CO2','BF3','CH4','PCl5','SF6'],
        run: async function(api){
          api.setGeom('tetrahedral');
          api.setLPScale(1.8);
          await api.animateTo({camDist:5.15, rotX:0.36, rotY:-0.74, objRotXDeg:0, objRotYDeg:0}, 900);
        }
      },
      {
        title: 'Relação entre geometria e propriedades',
        body: 'A geometria molecular influencia diretamente a <b>polaridade</b>, a distribuição vetorial dos dipolos de ligação, a intensidade das <b>forças intermoleculares</b>, a <b>reatividade</b> e diversas propriedades físicas da substância. Portanto, a forma espacial da molécula é um elemento explicativo central do comportamento químico observado.',
        note: 'Em síntese, a geometria molecular conecta estrutura eletrônica, distribuição espacial e propriedades macroscópicas.',
        pills: ['polaridade', 'forças intermoleculares', 'reatividade'],
        examples: ['H2O','CO2','CH4','NH3'],
        run: async function(api){
          api.setGeom('tetrahedral');
          api.setAxes(true);
          await api.animateTo({camDist:5.35, rotX:0.42, rotY:-1.02, objRotYDeg:0}, 1000);
        }
      }
    ];

  
  
  steps = steps.filter(function(s){ return !/\bMEP\b|potencial eletrost[aá]tico/i.test((s&&s.title)||''); }); 

  var apiRef=null, el={}, overlay=null, octx=null, calcHud=null, stepIdx=0, applying=false, playing=false, token=0;
  var activeExampleKey='H2O';
  var exampleSelectionByStep = Object.create(null);
  var visualState={ bond:false, result:false, cloud:true, calc:false, deltas:false, angles:false, mapDensity:false, mapESP:false, pizza:false };
  var mapEls={density:null, esp:null, box:null};
  var glowPhase=0;

  function injectStyles(){
    var st=document.createElement('style');
    st.textContent = ''+
      '.polarOverlay{position:absolute; inset:0; pointer-events:none; z-index:19;}'+
      '.polarCalcHud{position:absolute; right:14px; bottom:52px; z-index:24; min-width:300px; max-width:min(420px,45vw); background:linear-gradient(180deg, rgba(10,16,30,.78), rgba(8,12,22,.70)); border:1px solid rgba(126,125,255,.22); border-radius:14px; padding:10px 12px; color:#e6f0ff; backdrop-filter:none; box-shadow:none; font-size:12px; line-height:1.4;}'+
      '.polarCalcHud.hide{display:none}'+
      '.polarCalcHud .row{display:flex; justify-content:space-between; gap:8px; margin:2px 0;}'+
      '.polarCalcHud .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'+
      '.polarCalcHud .k{color:#b8cdea} .polarCalcHud .v{color:#fff}'+
      '.polarCalcHud .badge{display:inline-block; margin-left:6px; padding:2px 7px; border-radius:999px; font-weight:700; font-size:11px; border:1px solid rgba(255,255,255,.12)}'+
      '.polarCalcHud .badge.polar{background:rgba(72,196,255,.16); color:#dff7ff; border-color:rgba(72,196,255,.25)}'+
      '.polarCalcHud .badge.apolar{background:rgba(180,200,220,.12); color:#f4f7ff; border-color:rgba(255,255,255,.12)}'+
      '.tutorialExamples .calcBox{margin-top:8px; padding:8px 9px; border-radius:9px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.02); text-align:justify; text-justify:inter-word; hyphens:auto}'+
      '.tutorialExamples .calcBox .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'+
      '.tutorialExamples .legendDots{display:flex; gap:8px; flex-wrap:wrap; margin-top:6px}'+
      '.tutorialExamples .dotItem{display:inline-flex; align-items:center; gap:6px; font-size:11px; color:#cfe0ff}'+
      '.tutorialExamples .dot{width:9px; height:9px; border-radius:50%}'+
      '.tutorialExamples, .tutorialBody, .tutorialNote{word-break:normal; overflow-wrap:break-word}'+
      '.mapOptionBox{margin-top:8px; padding:8px 9px; border-radius:10px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.02)}'+
      '.mapOptionBox .mapTitle{font-size:11px; color:#bfd4f2; margin:0 0 6px; font-weight:700; letter-spacing:.02em}'+
      '.mapOptionBox .mapHelp{font-size:11px; color:#b6c8e7; margin-top:6px; line-height:1.35; text-align:justify; text-justify:inter-word}'+
      '.mapChk{display:flex; align-items:flex-start; gap:8px; margin:6px 0; padding:6px 7px; border-radius:9px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.015)}'+
      '.mapChk input{margin-top:2px; accent-color:#6ea6ff}'+
      '.mapChk span{font-size:12px; color:#e6f0ff; line-height:1.25}'+
      '.mapChk small{display:block; color:#b6c8e7; font-size:10px; margin-top:2px}'+
      '.balloonInspector,.balloonInspectorHint{margin-top:10px; padding:10px 11px; border-radius:12px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03)}'+
      '.balloonInspectorHead{display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:8px}'+
      '.balloonInspectorHead span{font-size:11px; color:#b8caea}'+
      '.balloonScaleRow{display:flex; align-items:center; justify-content:space-between; gap:12px; margin:6px 0}'+
      '.balloonAxisLabel{font-size:12px; color:#e9f2ff}'+
      '.balloonScaleStepper{display:flex; align-items:center; gap:8px}'+
      '.balloonScaleStepper b{min-width:54px; text-align:center; color:#f7fbff}'+
      '.balloonInspectorActions{display:flex; justify-content:flex-end; margin-top:8px}'+
      '.balloonNode.selected .balloonShape{filter:drop-shadow(0 0 8px rgba(149,214,255,.22))}'+
      '.balloonInspectorHint b{color:#fff}'+
      '.balloonActions{display:flex; flex-wrap:wrap; gap:6px}'+
    document.head.appendChild(st);
  }

  function pills(arr){
    arr = arr||[];
    return arr.map(function(p){ return '<span class="pill">'+esc(p)+'</span>'; }).join('');
  }

  function buildExamplesHTML(step){
    if(isBalloonStep(step)) return balloonDemoHTML();
    var html='';
    if(step.examples && step.examples.length){
      var first = exampleCatalog[step.examples[0]];
      
      if(stepIdx >= 2 && first){
        html += '<button type="button" class="exInlineBtn" data-ex-key="'+esc(first.key)+'"><b>Exemplo(s):</b> clique para ver o primeiro exemplo na lousa ('+esc(first.label)+') e use os botões abaixo para comparar.</button>';
      } else {
        html += '<div class="small" style="margin:2px 0 8px; opacity:.92"><b>Exemplo(s):</b></div>';
      }
      html += '<div class="exBtns">'+ step.examples.map(function(k){
        var ex=exampleCatalog[k]; if(!ex) return '';
        var isSelected = exampleSelectionByStep[stepIdx] === k;
        return '<button type="button" class="exBtn'+(isSelected?' active':'')+'" data-ex-key="'+esc(k)+'">'+esc(ex.label||k)+'</button>';
      }).join('') +'</div>';
      html += '<div class="exHelp">Clique para alternar entre moléculas e comparar os exemplos desta etapa na lousa.</div>';
    }
        html += '<div class="legendDots">'+
      '<span class="dotItem"><span class="dot" style="background:#4ec7ff"></span>dipolos de ligação</span>'+
      '<span class="dotItem"><span class="dot" style="background:#ffd34d"></span>μ resultante</span>'+
      '<span class="dotItem"><span class="dot" style="background:#5f7dff"></span>nuvem eletrônica (mais densa)</span>'+
    '</div>';
    if(visualState.calc){
      html += '<div class="calcBox" id="miniCalcBox">carregando cálculo…</div>';
    }
    return html;
  }
  function getCoreBondLen(){
    var ui = apiRef && apiRef.ui;
    if(ui && ui.bondLen) return parseFloat(ui.bondLen.value)||0.625;
    return 1.55;
  }


  function inferExampleAtoms(ex){
    var key = (ex && (ex.key || ex.code || ex.id || ex.labelKey || ex.exampleKey)) || '';
    
    if(!key && ex && ex.label){
      var raw = String(ex.label).replace(/\s*\(.*?\)/g,'').replace(/[₀₁₂₃₄₅₆₇₈₉]/g,'');
      var byLabel = {
        'CO₂':'CO2','H₂O':'H2O','NH₃':'NH3','CH₄':'CH4','C₂H₆':'C2H6','C₂H₄':'C2H4','C₂H₂':'C2H2',
        'BF₃':'BF3','SO₂':'SO2','O₃':'O3','SO₃':'SO3','CCl₄':'CCl4','PCl₃':'PCl3','PCl₅':'PCl5',
        'SF₄':'SF4','ClF₃':'ClF3','XeF₂':'XeF2','SF₆':'SF6','BrF₅':'BrF5','XeF₄':'XeF4','OF₂':'OF2','BeCl₂':'BeCl2'
      };
      key = byLabel[raw] || '';
    }
    var map = {
      CO2:{center:'C', ligands:['O','O']},
      H2O:{center:'O', ligands:['H','H']},
      NH3:{center:'N', ligands:['H','H','H']},
      CH4:{center:'C', ligands:['H','H','H','H']},
      C2H6:{center:'C', ligands:['H','H','H','C']},
      C2H4:{center:'C', ligands:['H','H','C']},
      C2H2:{center:'C', ligands:['H','C']},
      BF3:{center:'B', ligands:['F','F','F']},
      SO2:{center:'S', ligands:['O','O']},
      O3:{center:'O', ligands:['O','O']},
      SO3:{center:'S', ligands:['O','O','O']},
      CCl4:{center:'C', ligands:['Cl','Cl','Cl','Cl']},
      PCl3:{center:'P', ligands:['Cl','Cl','Cl']},
      PCl5:{center:'P', ligands:['Cl','Cl','Cl','Cl','Cl']},
      SF4:{center:'S', ligands:['F','F','F','F']},
      ClF3:{center:'Cl', ligands:['F','F','F']},
      XeF2:{center:'Xe', ligands:['F','F']},
      SF6:{center:'S', ligands:['F','F','F','F','F','F']},
      BrF5:{center:'Br', ligands:['F','F','F','F','F']},
      XeF4:{center:'Xe', ligands:['F','F','F','F']},
      OF2:{center:'O', ligands:['F','F']},
      BeCl2:{center:'Be', ligands:['Cl','Cl']}
    };
    return map[key] || {center:(ex && ex.center) || 'A', ligands:(ex && ex.ligands) || []};
  }

  function __electronegativity(sym){
    var en = {
      H:2.20, Be:1.57, B:2.04, C:2.55, N:3.04, O:3.44, F:3.98,
      P:2.19, S:2.58, Cl:3.16, Br:2.96, I:2.66, Xe:2.60
    };
    return (en[sym] != null) ? en[sym] : 2.0;
  }

  function __currentLPAnimValue(){
    var lpAnim = (typeof __lpHold === 'number') ? __lpHold : 0.0;
    try{
      if(typeof __lpPulseStart === 'number' && __lpPulseStart >= 0 && typeof __lpPulseDur === 'number' && __lpPulseDur > 0){
        var tt = (performance.now() - __lpPulseStart) / __lpPulseDur;
        if(tt >= 1){
          lpAnim = 1.0;
        } else {
          var u = Math.max(0, Math.min(1, tt));
          lpAnim = 1.0 - Math.pow(1.0 - u, 3.0);
        }
      }
    }catch(_e){}
    return Math.max(0, Math.min(1, lpAnim || 0));
  }

  function __safeNorm(v, fallback){
    var L = Math.hypot(v[0]||0, v[1]||0, v[2]||0) || 0;
    if(L < 1e-6) return (fallback || [0,0,1]).slice();
    return [v[0]/L, v[1]/L, v[2]/L];
  }

  function __computeRenderedLigDirs(G){
    G = G || { lig:[], lp:[] };
    var lig = (G.lig || []).map(function(d){ return __safeNorm(d, [0,0,1]); });
    var lp = (G.lp || []).map(function(d){ return __safeNorm(d, [0,0,1]); });

    var push = [0,0,0];
    for(var i=0;i<lp.length;i++) push = vAdd(push, lp[i]);
    push = (vLen(push) < 1e-6) ? [0,0,1] : __safeNorm(push, [0,0,1]);

    var k = (lp.length && !(lp.length===2 && lig.length===4)) ? (0.36 * __currentLPAnimValue()) : 0.0;
    var down = vMul(push, -1);

    return lig.map(function(dir0){
      return __safeNorm(vAdd(dir0, vMul(down, k)), dir0);
    });
  }

  
  
  
  function getWorldDataForExample(ex){
    ex = ex || {};
    var G = geomPositions(ex.geom || 'tetra');
    var bl = getCoreBondLen();
    var atomInfo = inferExampleAtoms(ex);
    var center = [0,0,0];
    var centerSym = (ex.center || atomInfo.center || 'A');
    var ligLabels = Array.isArray(ex.ligands) && ex.ligands.length ? ex.ligands : (atomInfo.ligands || []);
    var renderDirs = __computeRenderedLigDirs(G);

    var atoms = [{label:centerSym, role:'center', pos:center}];
    for(var i=0;i<renderDirs.length;i++){
      atoms.push({
        label: ligLabels[i] || 'X',
        role:'lig',
        pos:vMul(renderDirs[i], bl),
        dir:renderDirs[i],
        baseDir:(G.lig||[])[i] || renderDirs[i]
      });
    }

    var lps = (G.lp||[]).map(function(d){
      var dir = __safeNorm(d, [0,0,1]);
      return {dir:dir, pos:vMul(dir, bl*0.22)};
    });

    var bondDipoles=[];
    var sum=[0,0,0];
    for(var j=0;j<renderDirs.length;j++){
      var dir = renderDirs[j];
      var mu = (ex.muBond || 1.0);
      var dvec = vMul(dir, mu * (ex.sign||1));
      var anchor = vMul(dir, bl*0.52);
      bondDipoles.push({anchor:anchor, vec:dvec, dir:dir, mu:mu, ligandIndex:j});
      sum = vAdd(sum, dvec);
    }

    var bondTypeNow = 1;
    try{
      bondTypeNow = parseInt((apiRef && apiRef.ui && apiRef.ui.bondType && apiRef.ui.bondType.value) || ex.bondType || 1, 10) || 1;
    }catch(_e){}

    return {
      ex:ex,
      geom:G,
      atoms:atoms,
      lps:lps,
      bondDipoles:bondDipoles,
      muR:sum,
      muMag:vLen(sum),
      bondLen:bl,
      bondType:bondTypeNow,
      renderedLigDirs:renderDirs
    };
  }

  function setExampleColors(ex){
    var ui = apiRef.ui;
    if(ui.coreColor) ui.coreColor.value = ex.centerColor || ex.coreColor || '#bca96a';
    if(ui.ligandColor) ui.ligandColor.value = ex.ligandColor || '#8fd6ff';
    if(ui.lpColor) ui.lpColor.value = ex.lpColor || '#1100ff';
    if(ui.showAxes) ui.showAxes.checked = true;
    if(ui.bondType && ex.bondType != null) ui.bondType.value = String(ex.bondType);
    if(ui.lpScale){
      var lpv = (ex.lpScale != null) ? ex.lpScale : ((ex.geom==='bent_tet'||ex.geom==='trigonal_pyramidal'||ex.geom==='bent_tp') ? 1.9 : 1.6);
      ui.lpScale.value = String(lpv);
    }
  }

  async function setExample(key, opts){
    var ex = exampleCatalog[key]; if(!ex || !apiRef) return;
    activeExampleKey = key;
    if(opts && opts.clicked){
      exampleSelectionByStep[stepIdx] = key;
    }
    playing = false;
    setExampleColors(ex);
    apiRef.setBoardSplit && apiRef.setBoardSplit(false);
    apiRef.clearBalloons && apiRef.clearBalloons();
    apiRef.setGeom(ex.geom);
    apiRef.sync();
    if(el.examples){ el.examples.innerHTML = buildExamplesHTML(steps[stepIdx]); }
    if(opts && opts.cam && ex.view){ try{ await apiRef.animateTo(ex.view, 800); }catch(_e){} }
    requestOverlayDraw();
  }


  function ensureMapOptionsUI(){
    visualState.mapDensity = false;
    visualState.mapESP = false;
    visualState.mapDensity = false;
    if(mapEls.box && mapEls.box.parentNode) mapEls.box.parentNode.removeChild(mapEls.box);
    mapEls.box = mapEls.density = mapEls.esp = null;
  }

  function syncMapOptionsUI(){
    visualState.mapDensity = false;
    visualState.mapESP = false;
    if(mapEls.box) mapEls.box.style.display = 'none';
    requestOverlayDraw();
  }

  function updateButtons(){
    if(el.prev) el.prev.disabled = applying || stepIdx===0;
    if(el.next) el.next.disabled = applying;
    if(el.restart) el.restart.disabled = applying;
    if(el.play){
      el.play.disabled = applying;
      el.play.textContent = playing ? '⏸ Auto' : '▶ Auto';
    }
    if(el.next) el.next.textContent = stepIdx === steps.length-1 ? 'Concluir ✓' : 'Próximo ▶';
  }

  function setFade(on){ if(el.card) el.card.classList.toggle('fadeStep', !!on); }

  function renderStep(){
    var s = steps[stepIdx];
    visualState = Object.assign({bond:false,result:false,cloud:true,calc:false,deltas:false,angles:true,mapDensity:false,mapESP:false,pizza:false}, s.viz||{});
    
    visualState.result = false;
    visualState.bond = false;
    
    visualState.angles = !s.onlyVectors;
    
    visualState.mapESP = false;
    if(s.onlyVectors){
      visualState.cloud = false;
      visualState.deltas = false;
      visualState.mapDensity = false;
      visualState.mapESP = false;
      visualState.pizza = false;
    }
    syncMapOptionsUI();
    el.tag.textContent = 'Passo ' + (stepIdx+1) + ' / ' + steps.length;
    el.title.innerHTML = s.title;
    el.body.innerHTML = s.body;
    el.note.innerHTML = s.note || '';
    el.mini.innerHTML = pills(s.pills);
    el.examples.innerHTML = buildExamplesHTML(s);
    el.examples.style.display = '';
    el.prog.style.width = (((stepIdx+1)/steps.length)*100).toFixed(2)+'%';
    updateButtons();
    requestOverlayDraw();
    }

  async function applyStep(i){
    stepIdx = clamp(i, 0, steps.length-1);
    var my = ++token;
    applying = true; updateButtons(); setFade(true); renderStep();
    if(apiRef && apiRef.setBoardSplit) apiRef.setBoardSplit(isBalloonStep(steps[stepIdx]));
    if(apiRef && apiRef.clearBalloons && !isBalloonStep(steps[stepIdx])) apiRef.clearBalloons();
    if(apiRef && apiRef.setBalloons && isBalloonStep(steps[stepIdx])) apiRef.setBalloons(balloonDemoCount);
    await sleep(80); setFade(false);
    try{ if(steps[stepIdx].run) await steps[stepIdx].run(apiRef); }catch(e){ console.error(e); }
    if(my !== token) return;
    applying = false; updateButtons();
    requestOverlayDraw();
    }
  async function next(){ if(applying) return; if(stepIdx>=steps.length-1){ playing=false; updateButtons(); return; } await applyStep(stepIdx+1); }
  async function prev(){ if(applying||stepIdx<=0) return; await applyStep(stepIdx-1); }
  async function restart(){ playing=false; token++; await applyStep(0); }
  async function autoplay(){
    if(playing){ playing=false; updateButtons(); return; }
    playing=true; updateButtons();
    while(playing && stepIdx < steps.length-1){ if(applying){ await sleep(120); continue; } await sleep(2700); if(!playing) break; await next(); }
    playing=false; updateButtons();
  }

  function getCanvasAndCtx(){
    var glCanvas = document.getElementById('gl');
    if(!glCanvas) return null;
    if(!overlay){
      overlay = document.createElement('canvas');
      overlay.className='polarOverlay';
      overlay.id='polarOverlay';
      glCanvas.parentElement.appendChild(overlay);
      octx = overlay.getContext('2d');
}
    var dpr = 1;
    var w = glCanvas.clientWidth||1, h = glCanvas.clientHeight||1;
    if(overlay.width !== Math.round(w*dpr) || overlay.height !== Math.round(h*dpr)){
      overlay.width = Math.round(w*dpr); overlay.height = Math.round(h*dpr);
    }
    overlay.style.width = w+'px'; overlay.style.height = h+'px';
    octx.setTransform(dpr,0,0,dpr,0,0);
    return {glCanvas:glCanvas, w:w, h:h, dpr:dpr};
  }

  
  function rotateXYZJS(p, view){
    
    
    var DEG_LOCAL = Math.PI/180;
    var rx=((view&&('objRotXDeg' in view))? (view.objRotXDeg||0):0)*DEG_LOCAL;
    var ry=((view&&('objRotYDeg' in view))? (view.objRotYDeg||0):0)*DEG_LOCAL;
    var rz=((view&&('objRotZDeg' in view))? (view.objRotZDeg||0):0)*DEG_LOCAL;
    if(!rx && !ry && !rz) return p;
    var x=p[0], y=p[1], z=p[2];
    var cx=Math.cos(rx), sx=Math.sin(rx);
    var y1=cx*y - sx*z, z1=sx*y + cx*z; y=y1; z=z1;
    var cy=Math.cos(ry), sy=Math.sin(ry);
    var x2=cy*x + sy*z, z2=-sy*x + cy*z; x=x2; z=z2;
    var cz=Math.cos(rz), sz=Math.sin(rz);
    var x3=cz*x - sz*y, y3=sz*x + cz*y; x=x3; y=y3;
    return [x,y,z];
  }

function projectPoint(world, view, size){
    world = rotateXYZJS(world, view);
    var eye=[view.camDist*Math.cos(view.rotX)*Math.sin(view.rotY), view.camDist*Math.sin(view.rotX), view.camDist*Math.cos(view.rotX)*Math.cos(view.rotY)];
    var target=[0,0,0], up=[0,1,0];
    var f=vNorm(vSub(target, eye));
    var useUp = Math.abs(vDot(f, up)) > 0.98 ? [0,0,1] : up;
    var r=vNorm(vCross(f, useUp));
    if(!isFinite(r[0])||!isFinite(r[1])||!isFinite(r[2])) r=[1,0,0];
    var u=vCross(r, f);
    var q=vSub(world, eye);
    var cx=vDot(q, r), cy=vDot(q, u), cz=vDot(q, f);
    if(cz <= -0.15) return null;
    if(cz < 0.05) cz = 0.05;
    var aspect = (size.w||1)/(size.h||1);
    var fov = 1.2;
    var t = Math.tan(fov*0.5);
    var ndcX = cx/(cz*t*aspect);
    var ndcY = cy/(cz*t);
    if(!isFinite(ndcX)||!isFinite(ndcY)) return null;
    return { x:(ndcX*0.5+0.5)*(size.w||1), y:(-ndcY*0.5+0.5)*(size.h||1), z:cz };
  }

  function projectPointOrtho(world, view, size){
    world = rotateXYZJS(world, view);
    var eye=[view.camDist*Math.cos(view.rotX)*Math.sin(view.rotY), view.camDist*Math.sin(view.rotX), view.camDist*Math.cos(view.rotX)*Math.cos(view.rotY)];
    var target=[0,0,0], up=[0,1,0];
    var f=vNorm(vSub(target, eye));
    var useUp = Math.abs(vDot(f, up)) > 0.98 ? [0,0,1] : up;
    var r=vNorm(vCross(f, useUp));
    if(!isFinite(r[0])||!isFinite(r[1])||!isFinite(r[2])) r=[1,0,0];
    var u=vCross(r, f);
    var q=vSub(world, eye);
    var cx=vDot(q, r), cy=vDot(q, u);
    var q0=vSub([0,0,0], eye);
    var cz0=vDot(q0, f);
    if(!isFinite(cz0) || Math.abs(cz0) < 0.05) cz0 = Math.max(0.05, view.camDist||5);
    var aspect = (size.w||1)/(size.h||1);
    var fov = 1.2;
    var t = Math.tan(fov*0.5);
    var ndcX = cx/(cz0*t*aspect);
    var ndcY = cy/(cz0*t);
    if(!isFinite(ndcX)||!isFinite(ndcY)) return null;
    return { x:(ndcX*0.5+0.5)*(size.w||1), y:(-ndcY*0.5+0.5)*(size.h||1), z:cz0 };
  }

  function projectVectorPoint(world, view, size){
    
    
    return projectPoint(world, view, size);
  }
  


  function drawArrow(ctx, a, b, color, width, glow){
    if(!a||!b) return;
    ctx.save();
    ctx.strokeStyle=color; ctx.lineWidth=width||2; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.shadowColor='transparent'; ctx.shadowBlur=0;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    var dx=b.x-a.x, dy=b.y-a.y; var L=Math.hypot(dx,dy)||1; dx/=L; dy/=L;
    var ah = 8 + (width||2)*1.3;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - dx*ah - dy*ah*0.55, b.y - dy*ah + dx*ah*0.55);
    ctx.lineTo(b.x - dx*ah + dy*ah*0.55, b.y - dy*ah - dx*ah*0.55);
    ctx.closePath();
    ctx.fillStyle=color; ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.fill();
    ctx.restore();
  }

  function __getOverlayBondParams(){
    var ui = apiRef && apiRef.ui;
    return {
      bondLen: (ui && ui.bondLen) ? (parseFloat(ui.bondLen.value)||0.625) : 0.625,
      coreR: (ui && ui.size) ? (parseFloat(ui.size.value)||0.64) : 0.64,
      ligR: (ui && ui.ligandRadius) ? (parseFloat(ui.ligandRadius.value)||0.44) : 0.44,
      bondR: (ui && ui.bondRadius) ? (parseFloat(ui.bondRadius.value)||0.085) : 0.085
    };
  }

  function __shaderBondPerp(dir){
    dir = __safeNorm(dir, [0,0,1]);
    return (Math.abs(dir[2]) < 0.99) ? __safeNorm(vCross(dir, [0,0,1]), [1,0,0]) : __safeNorm(vCross(dir, [0,1,0]), [1,0,0]);
  }

  function __bondRailCandidates(centerWorld, ligWorld, dir, bondType){
    var params = __getOverlayBondParams();
    var d = __safeNorm(dir || vSub(ligWorld, centerWorld), [0,0,1]);
    var L = vLen(vSub(ligWorld, centerWorld)) || params.bondLen || 0.625;
    var perp = __shaderBondPerp(d);
    var rails = [];

    function pushRail(offsetVec){
      offsetVec = offsetVec || [0,0,0];
      var offLen = vLen(offsetVec);
      var coreSpan = Math.sqrt(Math.max(0, params.coreR*params.coreR - offLen*offLen));
      var ligSpan = Math.sqrt(Math.max(0, params.ligR*params.ligR - offLen*offLen));
      var t0 = Math.min(L, Math.max(0, coreSpan));
      var t1 = Math.max(0, Math.min(L, L - ligSpan));
      if(t1 <= t0 + 1e-4){
        t0 = Math.max(0, Math.min(L, params.coreR * 0.92));
        t1 = Math.max(0, Math.min(L, L - params.ligR * 0.92));
      }
      var a = vAdd(centerWorld, vAdd(offsetVec, vMul(d, t0)));
      var b = vAdd(centerWorld, vAdd(offsetVec, vMul(d, t1)));
      rails.push({ a:a, b:b, offset:offsetVec, offLen:offLen });
    }

    if(bondType===2){
      var off2 = params.bondR * 0.6 * 1.8;
      pushRail(vMul(perp, -off2));
      pushRail(vMul(perp,  off2));
    }else if(bondType===3){
      var off3 = params.bondR * 0.5 * 1.8;
      pushRail([0,0,0]);
      pushRail(vMul(perp, -off3));
      pushRail(vMul(perp,  off3));
    }else{
      pushRail([0,0,0]);
    }
    return rails;
  }

  function __pickVisibleBondRail(centerWorld, ligWorld, dir, bondType, view, can){
    var rails = __bondRailCandidates(centerWorld, ligWorld, dir, bondType);
    if(!rails.length) return null;

    var best = null;
    for(var i=0;i<rails.length;i++) {
      var rail = rails[i];
      rail.pa = projectPoint(rail.a, view, can);
      rail.pb = projectPoint(rail.b, view, can);
      if(!rail.pa || !rail.pb) continue;
      rail.screenLen = Math.hypot(rail.pb.x - rail.pa.x, rail.pb.y - rail.pa.y) || 0;
      rail.depth = ((rail.pa.z||0) + (rail.pb.z||0)) * 0.5;
      if(!best || rail.depth < best.depth - 1e-4 || (Math.abs(rail.depth - best.depth) < 1e-4 && rail.screenLen > best.screenLen)){
        best = rail;
      }
    }
    return best || rails[0];
  }

  function drawCloudBlob(ctx, x, y, rx, ry, color, alpha, angle){
    ctx.save();
    ctx.translate(x,y); if(angle) ctx.rotate(angle);
    var g = ctx.createRadialGradient(0,0,Math.min(rx,ry)*0.1, 0,0,Math.max(rx,ry));
    g.addColorStop(0, 'rgba('+color[0]+','+color[1]+','+color[2]+','+(alpha||0.18)+')');
    g.addColorStop(0.55, 'rgba('+color[0]+','+color[1]+','+color[2]+','+((alpha||0.18)*0.55)+')');
    g.addColorStop(1, 'rgba('+color[0]+','+color[1]+','+color[2]+',0)');
    ctx.fillStyle=g;
    ctx.beginPath();
    if(ctx.ellipse) ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2); else { ctx.arc(0,0,Math.max(rx,ry),0,Math.PI*2); }
    ctx.fill();
    ctx.restore();
  }

  function drawTextLabel(ctx, p, text, color){
    if(!p) return;
    ctx.save();
    ctx.font='700 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var pad=4, w=ctx.measureText(text).width + pad*2;
    ctx.fillStyle='rgba(4,8,14,.70)';
    ctx.strokeStyle='rgba(255,255,255,.08)';
    ctx.lineWidth=1;
    var x=p.x-w/2, y=p.y-10;
    ctx.beginPath(); if(ctx.roundRect){ ctx.roundRect(x,y-10,w,20,10); } else { ctx.rect(x,y-10,w,20); }
    ctx.fill(); ctx.stroke();
    ctx.fillStyle=color||'#fff';
    ctx.textBaseline='middle'; ctx.fillText(text, x+pad, y);
    ctx.restore();
  }

  function drawAngleArc(ctx, c, p1, p2, label){
    if(!c||!p1||!p2) return;
    var a1=Math.atan2(p1.y-c.y,p1.x-c.x), a2=Math.atan2(p2.y-c.y,p2.x-c.x);
    var da = a2-a1; while(da>Math.PI) da-=2*Math.PI; while(da<-Math.PI) da+=2*Math.PI;
    var d1=Math.hypot(p1.x-c.x,p1.y-c.y), d2=Math.hypot(p2.x-c.x,p2.y-c.y);
    var baseR=Math.max(72, Math.min(170, Math.max(d1,d2)+28));
    var labTxt = String(label||'');
    var is180 = /^\s*180/.test(labTxt);

    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,.72)';
    ctx.lineWidth=1.4;
    if(ctx.setLineDash) ctx.setLineDash([8,6]);

    if(is180){
      
      ctx.beginPath();
      ctx.arc(c.x,c.y,baseR,Math.PI*1.02,Math.PI*1.98,false); 
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c.x,c.y,baseR,0.02*Math.PI,0.98*Math.PI,false); 
      ctx.stroke();
      if(ctx.setLineDash) ctx.setLineDash([]);
      drawTextLabel(ctx,{x:c.x, y:c.y-baseR-16}, labTxt, '#ffffff');
      drawTextLabel(ctx,{x:c.x, y:c.y+baseR+16}, labTxt, '#ffffff');
    }else{
      
      var start=a1, end=a1+da;
      ctx.beginPath();
      ctx.arc(c.x,c.y,baseR,start,end,da<0);
      ctx.stroke();
      
      if(ctx.setLineDash) ctx.setLineDash([4,5]);
      var u1={x:(p1.x-c.x)/(d1||1), y:(p1.y-c.y)/(d1||1)};
      var u2={x:(p2.x-c.x)/(d2||1), y:(p2.y-c.y)/(d2||1)};
      ctx.beginPath();
      ctx.moveTo(c.x+u1.x*(Math.min(d1,baseR-6)), c.y+u1.y*(Math.min(d1,baseR-6)));
      ctx.lineTo(c.x+u1.x*baseR, c.y+u1.y*baseR);
      ctx.moveTo(c.x+u2.x*(Math.min(d2,baseR-6)), c.y+u2.y*(Math.min(d2,baseR-6)));
      ctx.lineTo(c.x+u2.x*baseR, c.y+u2.y*baseR);
      ctx.stroke();
      if(ctx.setLineDash) ctx.setLineDash([]);
      var am = a1 + da/2;
      drawTextLabel(ctx,{x:c.x+Math.cos(am)*(baseR+16), y:c.y+Math.sin(am)*(baseR+16)}, labTxt, '#ffffff');
    }
    ctx.restore();
  }


function __anglePanelBase(ctx, x, y, w, h, title){
  ctx.save();
  ctx.fillStyle='rgba(7,11,18,.74)';
  ctx.strokeStyle='rgba(255,255,255,.12)';
  ctx.lineWidth=1;
  ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(x,y,w,h,14); else ctx.rect(x,y,w,h);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle='rgba(236,244,255,.95)';
  ctx.font='700 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText(title||'', x+12, y+18);
  ctx.restore();
}

function __angleDrawAtom(ctx, x, y, r, fill, stroke){
  ctx.save();
  var g=ctx.createRadialGradient(x-r*0.35,y-r*0.35,1, x,y,r*1.05);
  g.addColorStop(0,'rgba(255,255,255,.75)');
  g.addColorStop(0.25, fill);
  g.addColorStop(1,'rgba(0,0,0,.18)');
  ctx.fillStyle=g;
  ctx.strokeStyle=stroke||'rgba(255,255,255,.18)';
  ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function __angleDrawBond(ctx, a, b){
  ctx.save();
  ctx.strokeStyle='rgba(168,255,211,.95)';
  ctx.lineWidth=4;
  ctx.lineCap='round';
  ctx.shadowColor='transparent';
  ctx.shadowBlur=0;
  ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  ctx.restore();
}

function __angleClampLabelPos(ctx, x, y, txt){
  var b = ctx && ctx.__angleBounds;
  if(!b) return {x:x,y:y};
  var pad = 8;
  var mw = (ctx.measureText ? ctx.measureText(String(txt||'')).width : 28);
  return {
    x: Math.max(b.x+pad+mw*0.5, Math.min(b.x+b.w-pad-mw*0.5, x)),
    y: Math.max(b.y+16, Math.min(b.y+b.h-8, y))
  };
}

function __angleArcLabel(ctx, c, p1, p2, label, rOverride){
  if(!c||!p1||!p2) return;
  var a1=Math.atan2(p1.y-c.y,p1.x-c.x), a2=Math.atan2(p2.y-c.y,p2.x-c.x);
  var da = a2-a1; while(da>Math.PI) da-=2*Math.PI; while(da<-Math.PI) da+=2*Math.PI;
  var rr = rOverride || Math.max(26, Math.min(44, Math.min(Math.hypot(p1.x-c.x,p1.y-c.y), Math.hypot(p2.x-c.x,p2.y-c.y))*0.60));
  ctx.save();
  ctx.strokeStyle='rgba(255,88,88,.95)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(c.x,c.y,rr,a1,a1+da,da<0);
  ctx.stroke();
  var am=a1+da*0.5;
  ctx.fillStyle='rgba(255,255,255,.98)';
  ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  var tx=c.x+Math.cos(am)*(rr+15), ty=c.y+Math.sin(am)*(rr+4);
  var cl=__angleClampLabelPos(ctx, tx, ty, label);
  ctx.fillText(label, cl.x-ctx.measureText(label).width*0.5, cl.y);
  ctx.restore();
}

function __angleArc180(ctx, c, left, right, label){
  var rr = Math.max(34, Math.abs(right.x-left.x)*0.30);
  ctx.save();
  ctx.strokeStyle='rgba(255,88,88,.95)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(c.x,c.y,rr,Math.PI,0,false);
  ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.98)';
  ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  var pTop=__angleClampLabelPos(ctx, c.x, c.y-rr-6, label);
  ctx.fillText(label, pTop.x-ctx.measureText(label).width*0.5, pTop.y);
  ctx.restore();
}


function drawAngleSchematic(ctx, data, can){
  if(!ctx||!data||!can) return;
  var DEG = Math.PI/180;
  var w=Math.min(408, Math.max(292, can.w*0.36));
  var h=(can.h < 500)?170:206;
  var x=can.w - w - 16;
  var y=(can.h < 500)?10:16;
  ctx.__angleBounds = {x:x, y:y, w:w, h:h};
  __anglePanelBase(ctx, x, y, w, h, '');

  var cx=x+w*0.52, cy=y+h*0.55;
  var center={x:cx,y:cy}, centerR=12, ligR=9;
  var exGeom = (data.ex && data.ex.geom) ? String(data.ex.geom) : '';
  var arr=(data.geom && data.geom.arr) ? String(data.geom.arr) : '';
  var angleLbl = (data.geom && data.geom.angle) ? String(data.geom.angle) : 'θ';
  function P(dx,dy){ return {x:cx+dx, y:cy+dy}; }

  function footer(text1, text2){
    var lines = [];
    [text1,text2].forEach(function(t){ if(t) lines.push(String(t)); });
    if(!lines.length) return;
    ctx.save();
    ctx.fillStyle='rgba(223,234,255,.90)';
    ctx.font='600 10.5px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var maxW = w-22;
    var out=[];
    lines.forEach(function(line){
      var words=String(line).split(/\s+/), cur='';
      words.forEach(function(word){
        var test=cur ? (cur+' '+word) : word;
        if(ctx.measureText(test).width > maxW && cur){ out.push(cur); cur=word; }
        else cur=test;
      });
      if(cur) out.push(cur);
    });
    var lineH=12;
    var maxLines = Math.max(2, Math.floor((h-24)/lineH));
    if(out.length > maxLines){
      out = out.slice(0,maxLines);
      var last = out[out.length-1];
      while(ctx.measureText(last+'…').width > maxW && last.length>4) last = last.slice(0,-1);
      out[out.length-1] = last+'…';
    }
    var startY = y+h-8 - (out.length-1)*lineH;
    out.forEach(function(line, i){
      ctx.fillText(line, x+12, startY + i*lineH);
    });
    ctx.restore();
  }

  function __angleDrawLonePairCloud(px, py, dx, dy){
    var len = Math.hypot(dx, dy) || 1;
    var along = [dx/len, dy/len];
    var perp = [-along[1], along[0]];
    var major = 12.5;
    var minor = 7.2;
    function rand01(i){
      var s = Math.sin((px*0.17 + py*0.11 + i*12.9898) * 0.73) * 43758.5453;
      return s - Math.floor(s);
    }
    ctx.save();
    ctx.globalAlpha = 0.82;
    var g = ctx.createRadialGradient(px, py, 1, px, py, major*1.3);
    g.addColorStop(0, 'rgba(108,136,255,.16)');
    g.addColorStop(0.7, 'rgba(108,136,255,.08)');
    g.addColorStop(1, 'rgba(108,136,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, major*1.05, 0, Math.PI*2);
    ctx.fill();
    for(var i=0;i<34;i++){
      var a = rand01(i) * Math.PI * 2;
      var rr = Math.sqrt(rand01(i+91));
      var u = Math.cos(a) * major * rr;
      var v = Math.sin(a) * minor * rr;
      var x = px + perp[0]*u + along[0]*v;
      var y = py + perp[1]*u + along[1]*v;
      var r = 0.7 + rand01(i+181)*0.9;
      ctx.fillStyle = (i%6===0) ? 'rgba(202,216,255,.82)' : 'rgba(92,112,255,.58)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCommon(ligs, opts){
    opts=opts||{};
    ligs.forEach(function(p){ __angleDrawBond(ctx, center, p); });
    __angleDrawAtom(ctx, center.x, center.y, centerR, 'rgba(60,92,255,.95)');
    ligs.forEach(function(p){ __angleDrawAtom(ctx, p.x, p.y, ligR, 'rgba(255,90,164,.95)'); });
    if(opts.lp){
      opts.lp.forEach(function(p){
        var px = center.x + (p.x - center.x) * 0.42;
        var py = center.y + (p.y - center.y) * 0.42;
        __angleDrawLonePairCloud(px, py, p.x-center.x, p.y-center.y);
      });
    }
    return ligs;
  }

  if(exGeom==='bent_tet'){
    
    var Rb=70;
    var ha=52.25*DEG; 
    var dx=Math.sin(ha)*Rb, dy=Math.cos(ha)*Rb;
    var L=P(-dx,dy), R=P(dx,dy);
    var LP1=P(-24,-58), LP2=P(24,-58);
    drawCommon([L,R], {lp:[LP1,LP2]});
    __angleArcLabel(ctx, center, L, R, '≈104,5°', 34);
    footer('AX2E2 (angular): 2 pares livres comprimem o ângulo', 'Ângulo real ≈104,5° em relação ao tetraédrico ideal (109,5°)');
  } else if(exGeom==='bent_tp'){
    
    var Rb2=72;
    var ha2=60*DEG; 
    var dx2=Math.sin(ha2)*Rb2, dy2=Math.cos(ha2)*Rb2;
    var L2=P(-dx2,dy2), R2=P(dx2,dy2), LP=P(0,-62);
    drawCommon([L2,R2], {lp:[LP]});
    __angleArcLabel(ctx, center, L2, R2, '≈120°', 34);
    footer('AX2E (angular, base trigonal planar): 1 par livre comprime', 'Ângulo real ≈120°');
  } else if(exGeom==='trigonal_pyramidal'){
    
    var Rb3=70;
    var ha3=53.5*DEG; 
    var dx3=Math.sin(ha3)*Rb3, dy3=Math.cos(ha3)*Rb3;
    var BL=P(-dx3,dy3), BR=P(dx3,dy3), B=P(0, Rb3);
    drawCommon([BL,BR,B], {lp:[P(0,-66)]});
    __angleArcLabel(ctx, center, BL, BR, '≈107°', 33);
    footer('AX3E (piramidal trigonal): 1 par livre empurra as ligações', 'Ângulo real ≈107° por repulsão do par livre');
  } else if(exGeom==='see_saw'){
    var AXu=P(0,-60), AXd=P(0,60), EqL=P(-52,18), EqR=P(52,18);
    drawCommon([AXu,AXd,EqL,EqR], {lp:[P(-62,-16)]});
    __angleArcLabel(ctx, center, AXu, EqR, '≈90°', 22);
    __angleArcLabel(ctx, center, EqL, EqR, '≈120°', 30);
    footer('AX4E (gangorra): par livre equatorial aumenta repulsão', 'Ax-Eq ≈90°; Eq-Eq ≈120°; Ax-Ax ≈180°');
  } else if(exGeom==='t_shaped'){
    var AX1=P(0,-58), AX2=P(0,58), Eq=P(58,0);
    drawCommon([AX1,AX2,Eq], {lp:[P(-50,-30),P(-50,30)]});
    __angleArcLabel(ctx, center, AX1, Eq, '≈90°', 22);
    __angleArc180(ctx, center, AX1, AX2, '≈180°');
    footer('AX3E2 (em T): dois pares livres equatoriais comprimem', 'Ax-Eq ≈90° e Ax-Ax ≈180°');
  } else if(exGeom==='linear_tbp'){
    var A=P(0,-60), B=P(0,60);
    drawCommon([A,B], {lp:[P(54,0),P(-27,46),P(-27,-46)]});
    __angleArc180(ctx, center, A, B, '≈180°');
    footer('AX2E3 (linear, base TBP): pares livres ficam nas posições equatoriais', 'Ligações ficam opostas: 180°');
  } else if(exGeom==='square_pyramidal'){
    var Top=P(0,-64), U=P(0,-38), D=P(0,38), L=P(-44,0), R=P(44,0);
    drawCommon([Top,U,R,D,L], {lp:[P(0,68)]});
    __angleArcLabel(ctx, center, Top, R, '≈90°', 22);
    __angleArcLabel(ctx, center, U, R, '≈90°', 19);
    __angleArc180(ctx, center, L, R, '≈180°');
    footer('AX5E (piramidal quadrada): 1 par livre em geometria octaédrica', 'Ax-Basal ≈90°; na base: ≈90° e ≈180°');
  } else if(exGeom==='square_planar'){
    var U2=P(0,-44), D2=P(0,44), L3=P(-44,0), R3=P(44,0);
    drawCommon([U2,R3,D2,L3], {lp:[P(0,-66),P(0,66)]});
    __angleArcLabel(ctx, center, U2, R3, '≈90°', 20);
    __angleArc180(ctx, center, L3, R3, '≈180°');
    footer('AX4E2 (quadrada planar): pares livres trans fora do plano', 'Ângulos no plano permanecem ≈90° e ≈180°');
  } else if(arr==='AX2' || exGeom==='linear'){
    var L4=P(-62,0), R4=P(62,0);
    drawCommon([L4,R4]);
    __angleArc180(ctx, center, L4, R4, '180°');
    footer('AX2 (linear)', 'Duas direções opostas maximizam afastamento');
  } else if(arr==='AX3' || exGeom==='trigonal_planar'){
    var T2=P(0,-56), BL2=P(-52,30), BR2=P(52,30);
    drawCommon([T2,BL2,BR2]);
    __angleArcLabel(ctx, center, BL2, BR2, '120°', 28);
    footer('AX3 (trigonal planar)', 'Três direções no mesmo plano -> 120°');
  } else if(arr==='AX4' || exGeom==='tetrahedral' || exGeom==='tetra'){
    var T3=P(0,-58), L5=P(-54,12), R5=P(54,12), F=P(0,54);
    drawCommon([T3,L5,R5,F]);
    __angleArcLabel(ctx, center, T3, R5, '109,5°', 31);
    footer('AX4 (tetraédrica): ângulo ideal em 3D', 'No esquema 2D, a projeção é só didática');
  } else if(arr==='AX5' || exGeom==='trigonal_bipyramidal' || exGeom==='tbp'){
    
    var EqTop=P(0,-64), AxL=P(-62,0), AxR=P(62,0), EqBL=P(-46,34), EqBR=P(46,34);
    drawCommon([EqTop,AxL,AxR,EqBL,EqBR]);
    __angleArcLabel(ctx, center, EqTop, AxR, '90°', 22);
    __angleArcLabel(ctx, center, EqBL, EqBR, '120°', 28);
    __angleArc180(ctx, center, AxL, AxR, '180°');
    footer('AX5 (bipirâmide trigonal): Eq–Eq 120° | Ax–Eq 90° | Ax–Ax 180°', 'Esquema simplificado para destacar os 3 tipos de ângulo sem poluir o painel.');
  } else if(arr==='AX6' || exGeom==='octahedral' || exGeom==='oct'){
    var U3=P(0,-66), D3=P(0,66), L6=P(-62,0), R6=P(62,0), F6=P(-30,-24), B6=P(30,24);
    drawCommon([U3,D3,L6,R6,F6,B6]);
    __angleArcLabel(ctx, center, U3, R6, '90°', 22);
    __angleArc180(ctx, center, L6, R6, '180°');
    footer('AX6 (octaédrica)', 'Adjacentes 90°; opostos 180°');
  } else {
    var ligs = [];
    (data.atoms||[]).slice(1,7).forEach(function(a){
      var p=a.pos||[0,0,0];
      ligs.push({x:cx+p[0]*52, y:cy-p[1]*52});
    });
    if(!ligs.length) return;
    drawCommon(ligs);
    if(ligs.length>=2){
      if((angleLbl||'').indexOf('180')>=0) __angleArc180(ctx, center, ligs[0], ligs[1], angleLbl);
      else __angleArcLabel(ctx, center, ligs[0], ligs[1], angleLbl, 24);
    }
    footer((arr?arr+' ':'')+'(esquema automático)', angleLbl);
  }

  ctx.save();
  ctx.fillStyle='rgba(222,235,255,.90)';
  ctx.font='600 10.5px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  var txt = ((data.geom && data.geom.arr) ? data.geom.arr+' | ' : '') + ((data.geom && data.geom.angle) ? data.geom.angle : '');
  var maxW = w-24;
  if(ctx.measureText(txt).width > maxW){
    while(txt.length>8 && ctx.measureText(txt+'…').width > maxW) txt = txt.slice(0,-1);
    txt += '…';
  }
  ctx.fillText(txt, x+12, y+20);
  ctx.restore();
}

  function moleculeVisualData(){
    var ex = exampleCatalog[activeExampleKey] || exampleCatalog.H2O;
    
    
    var geomMap = {
      linear:'linear',
      trigonal_planar:'trigonal_planar',
      tetrahedral:'tetra',
      trigonal_bipyramidal:'tbp',
      octahedral:'oct',
      bent_tp:'bent_tp',
      trigonal_pyramidal:'trigonal_pyramidal',
      bent_tet:'bent_tet',
      see_saw:'see_saw',
      t_shaped:'t_shaped',
      linear_tbp:'linear_tbp',
      square_pyramidal:'square_pyramidal',
      square_planar:'square_planar'
    };
    try{
      var uiGeom = apiRef && apiRef.ui && apiRef.ui.geom ? apiRef.ui.geom.value : '';
      if(uiGeom && geomMap[uiGeom]){
        ex = Object.assign({}, ex, { geom: geomMap[uiGeom] });
      }
    }catch(_e){}
    return getWorldDataForExample(ex);
  }

  function refreshMiniCalc(){  }

  
  
  function __elementRadiusWorld(label, role){
    
    var rCenter = (typeof size!=='undefined' && size) ? (parseFloat(size.value)||1.0) : 1.0;
    var rLig = (typeof ligandRadius!=='undefined' && ligandRadius) ? (parseFloat(ligandRadius.value)||0.44) : 0.44;
    var sym = String(label||'').trim();

    if(role === 'center') return rCenter;
    if(/^H$/i.test(sym)) return rLig * 0.82;
    if(/^(F|O|Cl|Br|I|N|S|P)$/i.test(sym)) return rLig * 1.06;
    return rLig;
  }

function __collectEnvelopeItems(data, view, can){
    try{
      var p0 = projectPoint([0,0,0], view, can);
      var p1 = projectPoint([1,0,0], view, can);
      var pxU = (p0 && p1) ? Math.hypot(p1.x-p0.x, p1.y-p0.y) : (Math.min(can.w,can.h)*0.22);
      if(!isFinite(pxU) || pxU<1) pxU = Math.min(can.w,can.h)*0.22;

      var items = [];
      (data.atoms||[]).forEach(function(a, idx){
        var p = projectPoint(a.pos, view, can);
        if(!p) return;
        var rw = __elementRadiusWorld(a.label, idx===0 ? 'center' : 'lig');
        var rr = Math.max(14, rw*pxU*1.18);
        items.push({x:p.x, y:p.y, r:rr, kind:'atom', idx:idx, label:a.label});
      });

      
      if(!items.length && p0) items.push({x:p0.x, y:p0.y, r:Math.max(40, pxU*0.9), kind:'fallback'});
      return {items:items, pxU:pxU};
    }catch(e){
      return {items:[], pxU:(Math.min(can.w,can.h)*0.22)};
    }
  }

function __envelopePathPoints(items, pad){
    if(!items || !items.length) return null;
    var cx=0, cy=0, wsum=0;
    for(var i=0;i<items.length;i++){
      var it=items[i], w=Math.max(10, it.r);
      cx += it.x*w; cy += it.y*w; wsum += w;
    }
    cx/=wsum||1; cy/=wsum||1;
    var N = 56;
    var rs = new Array(N);
    for(var k=0;k<N;k++){
      var th = (k/N)*Math.PI*2, ux=Math.cos(th), uy=Math.sin(th);
      var best = 12;
      for(var j=0;j<items.length;j++){
        var it2=items[j];
        var dx=it2.x-cx, dy=it2.y-cy;
        var proj = dx*ux + dy*uy + it2.r;
        if(proj>best) best=proj;
      }
      rs[k] = best + (pad||10);
    }
    
    var rs2 = rs.slice();
    for(var t=0;t<2;t++){
      for(var n=0;n<N;n++){
        var a=rs[(n-1+N)%N], b=rs[n], c=rs[(n+1)%N];
        rs2[n] = a*0.22 + b*0.56 + c*0.22;
      }
      rs = rs2.slice();
    }
    var pts=[];
    for(var m=0;m<N;m++){
      var th2=(m/N)*Math.PI*2;
      pts.push({x:cx+Math.cos(th2)*rs[m], y:cy+Math.sin(th2)*rs[m]});
    }
    return {cx:cx, cy:cy, pts:pts, radii:rs};
  }

  function __expandEnvelopePath(env, extra){
    if(!env || !env.pts || !env.pts.length) return env;
    var e = Math.max(0, extra||0);
    if(!e) return env;
    var pts = env.pts.map(function(p){
      var dx=p.x-env.cx, dy=p.y-env.cy;
      var L=Math.hypot(dx,dy)||1;
      return {x:p.x + (dx/L)*e, y:p.y + (dy/L)*e};
    });
    return {cx:env.cx, cy:env.cy, pts:pts};
  }

  function __traceSmoothClosedPath(ctx, pts){
    if(!pts || pts.length<2) return;
    var n=pts.length;
    ctx.beginPath();
    for(var i=0;i<n;i++){
      var p0=pts[(i-1+n)%n], p1=pts[i], p2=pts[(i+1)%n];
      var mx=(p1.x+p2.x)*0.5, my=(p1.y+p2.y)*0.5;
      if(i===0){
        var mPrevX=(p0.x+p1.x)*0.5, mPrevY=(p0.y+p1.y)*0.5;
        ctx.moveTo(mPrevX,mPrevY);
      }
      ctx.quadraticCurveTo(p1.x,p1.y,mx,my);
    }
    ctx.closePath();
  }

  
function drawDensitySurfaceMap(ctx, data, view, can){
    var envBase = __collectEnvelopeItems(data, view, can);
    var env = __envelopePathPoints(envBase.items, Math.max(22, envBase.pxU*0.34));
    if(!env) return;
    
    env = __expandEnvelopePath(env, Math.max(18, envBase.pxU*0.18));
    var cx=env.cx, cy=env.cy;
    var isCO2 = !!(data.ex && data.ex.key==='CO2');
    var pC = projectPoint([0,0,0], view, can);
    var pLig = (data.atoms||[]).slice(1).map(function(a){ return projectPoint(a.pos, view, can); }).filter(Boolean);
    var isLightBG = !!(document.body && document.body.classList && document.body.classList.contains('lightBg'));

    ctx.save();
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.clip();

    var bbMinX=Infinity, bbMinY=Infinity, bbMaxX=-Infinity, bbMaxY=-Infinity;
    env.pts.forEach(function(p){ if(p.x<bbMinX) bbMinX=p.x; if(p.y<bbMinY) bbMinY=p.y; if(p.x>bbMaxX) bbMaxX=p.x; if(p.y>bbMaxY) bbMaxY=p.y; });
    var span = Math.max(bbMaxX-bbMinX, bbMaxY-bbMinY);

    
    var rg = ctx.createRadialGradient(cx, cy, 8, cx, cy, span*0.66);
    if(isLightBG){
      
      rg.addColorStop(0.00,'rgba(150,158,168,0.14)');
      rg.addColorStop(0.50,'rgba(156,164,174,0.10)');
      rg.addColorStop(1.00,'rgba(164,172,182,0.04)');
    }else{
      rg.addColorStop(0.00,'rgba(165,244,255,0.28)');
      rg.addColorStop(0.50,'rgba(108,206,255,0.17)');
      rg.addColorStop(1.00,'rgba(72,165,255,0.05)');
    }
    ctx.fillStyle = rg;
    ctx.fillRect(bbMinX-28, bbMinY-28, (bbMaxX-bbMinX)+56, (bbMaxY-bbMinY)+56);

    
    envBase.items.forEach(function(it, idx){
      var a = Math.min(0.11, 0.032 + (it.r/135));
      if(isCO2 && pC){
        var dC = Math.hypot(it.x-pC.x, it.y-pC.y);
        var dL = Infinity;
        for(var ii=0; ii<pLig.length; ii++) dL = Math.min(dL, Math.hypot(it.x-pLig[ii].x, it.y-pLig[ii].y));
        
        if(dC < dL) a *= 0.52;
        else a *= 1.08;
      }
      drawCloudBlob(ctx, it.x, it.y, it.r*1.22, it.r*0.95, isLightBG?[168,176,186]:[165,245,255], isLightBG?a*0.82:a*1.55, 0);
      if(!isLightBG && idx % 3 === 0) drawCloudBlob(ctx, it.x+1.4, it.y-1.5, it.r*0.60, it.r*0.48, [236,255,255], a*0.42, 0);
    });

    
    (data.atoms||[]).forEach(function(a, idx){
      var p = projectPoint(a.pos, view, can); if(!p) return;
      var rw = __elementRadiusWorld(a.label, idx===0 ? 'center' : 'lig');
      var rr = Math.max(18, rw*envBase.pxU*1.28);
      var boost = (idx===0 ? 0.9 : 1.0);

      
      if((data.ex && data.ex.sign||0) > 0){ boost *= (idx===0 ? 0.82 : 1.18); }   
      if((data.ex && data.ex.sign||0) < 0){ boost *= (idx===0 ? 1.18 : 0.88); }   
      if(/^H$/i.test(a.label||'')) boost *= 0.82;
      if(/^(O|F|Cl|Br|I|N)$/i.test(String(a.label||''))) boost *= 1.10;

      
      if(isCO2){
        boost = (idx===0 ? 0.56 : 1.48);
      }

      drawCloudBlob(ctx, p.x, p.y, rr*boost, rr*0.78*boost, isLightBG?[174,182,192]:[170,246,255], isLightBG?(0.060 + 0.010*boost):(0.070 + 0.014*boost), 0);
      if(!isLightBG) drawCloudBlob(ctx, p.x-rr*0.12, p.y-rr*0.16, rr*0.42*boost, rr*0.34*boost, [245,255,255], (0.040 + 0.008*boost), 0);
    });

    
    (data.bondDipoles||[]).forEach(function(d){
      var negDir = vNorm(d.vec||[1,0,0]); 
      var pos = vAdd(d.anchor||[0,0,0], vMul(negDir, (data.bondLen||0.625)*0.24));
      var p = projectPoint(pos, view, can); if(!p) return;
      var p2 = projectPoint(vAdd(pos, negDir), view, can) || {x:p.x+1,y:p.y};
      var ang = Math.atan2(p2.y-p.y, p2.x-p.x);
      var aBond = isCO2 ? 0.060 : 0.050;
      var rx = Math.max(22, envBase.pxU*(isCO2?0.60:0.52));
      var ry = Math.max(14, envBase.pxU*(isCO2?0.36:0.33));
      drawCloudBlob(ctx, p.x, p.y, rx, ry, isLightBG?[178,186,196]:[185,248,255], isLightBG?aBond*0.95:aBond*1.35, ang);
    });

    
    (data.lps||[]).forEach(function(lp){
      var p = projectPoint(lp.pos, view, can); if(!p) return;
      var rr = Math.max(24, envBase.pxU*0.58);
      drawCloudBlob(ctx, p.x, p.y, rr, rr*0.94, isLightBG?[182,190,200]:[120,205,255], isLightBG?0.08:0.105, 0);
    });

    
    if(isCO2){
      pLig.forEach(function(pL){
        if(!pL) return;
        var dx = pL.x - (pC?pC.x:cx), dy = pL.y - (pC?pC.y:cy);
        var ang = Math.atan2(dy, dx);
        var d = Math.hypot(dx,dy)||1;
        var px = pL.x + (dx/d) * (envBase.pxU*0.04);
        var py = pL.y + (dy/d) * (envBase.pxU*0.04);
        drawCloudBlob(ctx, px, py, Math.max(28, envBase.pxU*0.74), Math.max(18, envBase.pxU*0.48), isLightBG?[180,188,198]:[178,248,255], isLightBG?0.075:0.09, ang);
      });
    }

    ctx.restore();

    
    ctx.save();
    ctx.strokeStyle=(isLightBG?'rgba(158,168,178,.18)':'rgba(190,245,255,.34)'); ctx.lineWidth=1.25;
    if(ctx.setLineDash) ctx.setLineDash([6,4]);
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.stroke();
    if(ctx.setLineDash) ctx.setLineDash([]);
    ctx.restore();

    drawTextLabel(ctx, {x:cx, y:bbMaxY + 18}, 'Mapa de densidade eletrônica (qualitativo)', isLightBG ? '#101319' : '#e9f3ff');
  }

  
  function drawESPMap(ctx, data, view, can){
    var envBase = __collectEnvelopeItems(data, view, can);
    var env = __envelopePathPoints(envBase.items, Math.max(22, envBase.pxU*0.34));
    if(!env) return;
    env = __expandEnvelopePath(env, Math.max(14, envBase.pxU*0.14));
    var cx=env.cx, cy=env.cy;

    var bbMinX=Infinity, bbMinY=Infinity, bbMaxX=-Infinity, bbMaxY=-Infinity;
    env.pts.forEach(function(p){ if(p.x<bbMinX) bbMinX=p.x; if(p.y<bbMinY) bbMinY=p.y; if(p.x>bbMaxX) bbMaxX=p.x; if(p.y>bbMaxY) bbMaxY=p.y; });
    var span = Math.max(bbMaxX-bbMinX, bbMaxY-bbMinY);

    function chiOf(lbl){
      var s = String(lbl||'X').replace(/[^A-Za-z]/g,'');
      var t = {H:2.20, C:2.55, N:3.04, O:3.44, F:3.98, P:2.19, S:2.58, Cl:3.16, Br:2.96, I:2.66, B:2.04, Be:1.57, Xe:2.60};
      return (t[s] != null) ? t[s] : 2.50;
    }
    function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
    function scoreColor(score, alpha){
      
      var s = clamp(score, -1.4, 1.4);
      var a = (alpha==null?0.18:alpha);
      if(s > 0.10){
        var k = clamp(s/1.4, 0, 1);
        var r = Math.round(222 + 32*k), g = Math.round(52 + 62*(1-k)), b = Math.round(62 + 28*(1-k));
        return [r,g,b,a];
      } else if(s < -0.10){
        var k2 = clamp((-s)/1.4, 0, 1);
        var r2 = Math.round(42 + 28*(1-k2)), g2 = Math.round(106 + 62*(1-k2)), b2 = Math.round(242 + 12*k2);
        return [r2,g2,b2,a];
      } else {
        return [132,230,150,a*0.98];
      }
    }
    function drawBlobColor(x,y,rx,ry,col,ang){
      drawCloudBlob(ctx, x, y, rx, ry, [col[0],col[1],col[2]], col[3], ang||0);
    }

    var atoms = (data.atoms||[]);
    var centerLabel = atoms[0] ? atoms[0].label : 'X';
    var centerChi = chiOf(centerLabel);
    var ligAtoms = atoms.slice(1);
    var ligChis = ligAtoms.map(function(a){ return chiOf(a.label); });
    var meanLigChi = ligChis.length ? (ligChis.reduce(function(s,v){return s+v;},0)/ligChis.length) : centerChi;
    var allLigSame = ligAtoms.length>0 && ligAtoms.every(function(a){ return String(a.label||'') === String(ligAtoms[0].label||''); });
    var isCO2 = !!(data.ex && data.ex.key==='CO2');

    function atomScore(idx){
      if(!atoms[idx]) return 0;
      var lbl = atoms[idx].label;
      var chi = chiOf(lbl);
      var sc;
      if(idx===0){
        sc = (centerChi - meanLigChi) * 0.95;
        if((data.lps||[]).length && centerChi > meanLigChi) sc += 0.18 * Math.min(2, (data.lps||[]).length);
      } else {
        sc = (chi - centerChi) * 0.95;
      }
      if(allLigSame && idx>0){
        sc = ((ligChis[0]||centerChi) - centerChi) * 0.95;
      }
      if(isCO2){
        
        sc = (idx===0 ? -0.95 : 1.05);
      }
      return clamp(sc, -1.35, 1.35);
    }

    
    var comps = [];
    atoms.forEach(function(a, idx){
      var p = projectPoint(a.pos, view, can); if(!p) return;
      var rw = __elementRadiusWorld(a.label, idx===0 ? 'center' : 'lig');
      var rr = Math.max(18, rw*envBase.pxU*1.30);
      comps.push({x:p.x, y:p.y, r:rr*0.95, s:atomScore(idx), w:1.25});
    });
    ligAtoms.forEach(function(a, li){
      var cSc = atomScore(0), lSc = atomScore(li+1);
      var p0 = projectPoint([0,0,0], view, can);
      var p1 = projectPoint(a.pos, view, can);
      if(!p0 || !p1) return;
      var steps = 7;
      for(var k=1;k<steps;k++){
        var t = k/steps;
        comps.push({
          x:p0.x*(1-t)+p1.x*t,
          y:p0.y*(1-t)+p1.y*t,
          r:Math.max(10, envBase.pxU*0.18),
          s:cSc*(1-t)+lSc*t,
          w:0.72
        });
      }
    });
    (data.lps||[]).forEach(function(lp){
      var p = projectPoint(lp.pos, view, can); if(!p) return;
      comps.push({x:p.x, y:p.y, r:Math.max(18, envBase.pxU*0.34), s:Math.max(0.9, atomScore(0)+0.45), w:0.95});
    });
    function fieldAt(x,y){
      var num=0, den=0;
      for(var i=0;i<comps.length;i++){
        var c=comps[i];
        var dx=x-c.x, dy=y-c.y;
        var rr=Math.max(8,c.r);
        var q=(dx*dx+dy*dy)/(rr*rr);
        if(q>6.0) continue;
        var wt = c.w * Math.exp(-q*1.35);
        num += c.s * wt;
        den += wt;
      }
      if(den < 1e-6) return 0;
      var avg = num/den;
      var sat = clamp(0.65 + 0.35*Math.tanh(den*0.65), 0.65, 1.0);
      return clamp(avg*sat, -1.35, 1.35);
    }

    ctx.save();
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.clip();

    
    
    var rgBase = ctx.createRadialGradient(cx-span*0.10, cy-span*0.14, 8, cx, cy, span*0.78);
    rgBase.addColorStop(0.00,'rgba(255,255,255,0.10)');
    rgBase.addColorStop(0.38,'rgba(205,224,242,0.12)');
    rgBase.addColorStop(0.75,'rgba(155,184,212,0.10)');
    rgBase.addColorStop(1.00,'rgba(120,145,170,0.07)');
    ctx.fillStyle = rgBase;
    ctx.fillRect(bbMinX-28, bbMinY-28, (bbMaxX-bbMinX)+56, (bbMaxY-bbMinY)+56);

    
    
    var step = Math.max(7, Math.min(11, Math.round(envBase.pxU*0.10)));
    for(var gy=Math.floor(bbMinY)-step; gy<=Math.ceil(bbMaxY)+step; gy+=step){
      for(var gx=Math.floor(bbMinX)-step; gx<=Math.ceil(bbMaxX)+step; gx+=step){
        var scGrid = fieldAt(gx + step*0.5, gy + step*0.5);
        var cGrid = scoreColor(scGrid, 0.20);
        ctx.fillStyle = 'rgba('+cGrid[0]+','+cGrid[1]+','+cGrid[2]+','+cGrid[3]+')';
        ctx.fillRect(gx, gy, step+1, step+1);
      }
    }

    
    envBase.items.forEach(function(it, ii){
      if(ii % 2 !== 0) return;
      var scLocal = fieldAt(it.x, it.y);
      var cLocal = scoreColor(scLocal, 0.060);
      drawCloudBlob(ctx, it.x, it.y, Math.max(14,it.r*1.18), Math.max(10,it.r*0.96), [cLocal[0],cLocal[1],cLocal[2]], cLocal[3], 0);
    });

    
    ctx.fillStyle = 'rgba(245,250,255,0.045)';
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.fill();

    
    var hl = ctx.createRadialGradient(cx-span*0.18, cy-span*0.20, 2, cx-span*0.12, cy-span*0.14, span*0.58);
    hl.addColorStop(0.00,'rgba(255,255,255,0.22)');
    hl.addColorStop(0.18,'rgba(255,255,255,0.12)');
    hl.addColorStop(0.55,'rgba(255,255,255,0.035)');
    hl.addColorStop(1.00,'rgba(255,255,255,0.00)');
    ctx.fillStyle = hl;
    ctx.fillRect(bbMinX-30, bbMinY-30, (bbMaxX-bbMinX)+60, (bbMaxY-bbMinY)+60);

    
    atoms.forEach(function(a, idx){
      var p = projectPoint(a.pos, view, can); if(!p) return;
      var rw = __elementRadiusWorld(a.label, idx===0 ? 'center' : 'lig');
      var rr = Math.max(18, rw*envBase.pxU*1.32);
      var sc = clamp(atomScore(idx)*0.78 + fieldAt(p.x, p.y)*0.22, -1.35, 1.35);
      if(isCO2){ sc = atomScore(idx); }
      var col = scoreColor(sc, 0.135 + (idx===0?0.015:0.000));
      var ex = isCO2 && idx>0 ? 1.10 : 1.00;
      drawBlobColor(p.x, p.y, rr*1.08*ex, rr*0.88*ex, col, 0);
      drawCloudBlob(ctx, p.x-rr*0.10, p.y-rr*0.15, rr*0.42, rr*0.33, [250,255,255], 0.034, 0);
    });

    ligAtoms.forEach(function(a, li){
      var p0 = [0,0,0], p1 = a.pos;
      var pMidPrev = null;
      for(var ti=1; ti<=8; ti++){
        var t = ti/9;
        var pos = [p0[0]*(1-t)+p1[0]*t, p0[1]*(1-t)+p1[1]*t, p0[2]*(1-t)+p1[2]*t];
        var p = projectPoint(pos, view, can); if(!p) continue;
        var sc = fieldAt(p.x, p.y);
        if(isCO2 && t<0.20) sc = clamp(sc*0.65 + atomScore(0)*0.35, -1.35, 1.35);
        var col = scoreColor(sc, 0.105);
        var rr = Math.max(12, envBase.pxU*0.23) * (isCO2?1.05:1.00);
        if(pMidPrev){
          var ang = Math.atan2(p.y-pMidPrev.y, p.x-pMidPrev.x);
          drawBlobColor((p.x+pMidPrev.x)*0.5, (p.y+pMidPrev.y)*0.5, rr*0.92, rr*0.64, col, ang);
        } else {
          drawBlobColor(p.x, p.y, rr*0.68, rr*0.53, col, 0);
        }
        pMidPrev = p;
      }
    });

    (data.lps||[]).forEach(function(lp){
      var p = projectPoint(lp.pos, view, can); if(!p) return;
      var dc = { x:p.x - cx, y:p.y - cy };
      if(Math.hypot(dc.x, dc.y) < 0.001){
        var p2 = projectPoint(vAdd(lp.pos, lp.dir||[1,0,0]), view, can) || {x:p.x+1,y:p.y};
        dc = { x:p2.x - p.x, y:p2.y - p.y };
      }
      var ang = Math.atan2(dc.y, dc.x);
      var sc = Math.max(0.9, fieldAt(p.x,p.y));
      var col = scoreColor(sc, 0.145);
      drawBlobColor(p.x, p.y, Math.max(26, envBase.pxU*0.62), Math.max(16, envBase.pxU*0.39), col, ang);
    });

    if((data.muMag||0) < 0.12 && allLigSame){
      var rgNeutral = ctx.createRadialGradient(cx-span*0.10, cy-span*0.08, 6, cx, cy, span*0.70);
      rgNeutral.addColorStop(0,'rgba(255,255,255,0.035)');
      rgNeutral.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle = rgNeutral;
      ctx.fillRect(bbMinX-24, bbMinY-24, (bbMaxX-bbMinX)+48, (bbMaxY-bbMinY)+48);
    }

    ctx.restore();

    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,.17)'; ctx.lineWidth=1.0;
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.stroke();
    ctx.restore();

    drawTextLabel(ctx, {x:cx, y:bbMaxY + 18}, 'Mapa de potencial eletrostático (MEP): vermelho = mais eletrorrico; azul = mais eletropobre)', '#e9f3ff');
  }



  function drawPizzaProjection(ctx, data, view, can){
    if(!ctx||!data||!can) return;
    var pC = projectPoint([0,0,0], view, can); if(!pC) return;

    
    var envBase = __collectEnvelopeItems(data, view, can);
    var items = (envBase && envBase.items) ? envBase.items : [];
    var maxR = 0;
    items.forEach(function(it){
      var d = Math.hypot((it.x||0)-pC.x, (it.y||0)-pC.y) + (it.r||0);
      if(d > maxR) maxR = d;
    });
    if(!isFinite(maxR) || maxR < 30) maxR = Math.min(can.w,can.h)*0.25;
    var r = Math.max(76, Math.min(Math.min(can.w,can.h)*0.46, maxR + 22));
    var cx = pC.x, cy = pC.y;

    var exGeom = (data.ex && data.ex.geom) ? String(data.ex.geom) : '';
    var arr = (data.geom && data.geom.arr) ? String(data.geom.arr) : '';
    var regionCount = Math.max(1, ((data.atoms||[]).length-1) + ((data.lps||[]).length||0));

    function normA(a){ while(a<0) a+=Math.PI*2; while(a>=Math.PI*2) a-=Math.PI*2; return a; }
    function equalSectors(n, start){
      var out=[], a0=(start==null?-Math.PI/2:start), step=(Math.PI*2)/Math.max(1,n);
      for(var i=0;i<n;i++) out.push({a1:a0+i*step, a2:a0+(i+1)*step, kind:'eq'});
      return out;
    }
    function viewBasis(view){
      var eye=[view.camDist*Math.cos(view.rotX)*Math.sin(view.rotY), view.camDist*Math.sin(view.rotX), view.camDist*Math.cos(view.rotX)*Math.cos(view.rotY)];
      var target=[0,0,0], up=[0,1,0];
      var f=vNorm(vSub(target, eye));
      var useUp = Math.abs(vDot(f, up)) > 0.98 ? [0,0,1] : up;
      var rB=vNorm(vCross(f, useUp));
      if(!isFinite(rB[0])||!isFinite(rB[1])||!isFinite(rB[2])) rB=[1,0,0];
      var uB=vCross(rB, f);
      return {r:rB, u:uB, f:f};
    }
    function dirAngleNoPerspective(dir, basis){
      var dx=vDot(dir, basis.r), dy=vDot(dir, basis.u);
      if(!isFinite(dx)||!isFinite(dy)) return null;
      if(Math.hypot(dx,dy) < 0.03) return null; 
      return normA(Math.atan2(-dy, dx)); 
    }
    function uniqueSortedAngles(angles){
      var arrA = (angles||[]).filter(function(a){ return a!=null && isFinite(a); }).map(normA).sort(function(a,b){ return a-b; });
      if(!arrA.length) return [];
      var out=[arrA[0]], tol=0.14; 
      for(var i=1;i<arrA.length;i++){
        var a=arrA[i], prev=out[out.length-1];
        if(Math.abs(a-prev) > tol) out.push(a);
      }
      if(out.length>1){
        var wrapGap = (out[0]+Math.PI*2) - out[out.length-1];
        if(wrapGap < tol){
          
          var a1=out[0], aN=out[out.length-1]-Math.PI*2;
          var m=normA((a1+aN)/2);
          out[0]=m; out.pop(); out.sort(function(a,b){ return a-b; });
        }
      }
      return out;
    }
    function sectorsFromRayAngles(rayAngles){
      var rays = uniqueSortedAngles(rayAngles);
      if(rays.length < 2) return null;
      var out=[];
      for(var i=0;i<rays.length;i++){
        var a1=rays[i], a2=(i===rays.length-1)?(rays[0]+Math.PI*2):rays[i+1];
        out.push({a1:a1, a2:a2, kind:'ray'});
      }
      return out;
    }
    function rayAnglesFromDirs(dirs, basis){
      return (dirs||[]).map(function(d){ return dirAngleNoPerspective(d, basis); }).filter(function(a){ return a!=null; });
    }
    function filterByAbsZ(dirs, predicate){
      var out=[]; (dirs||[]).forEach(function(d){ var z=Math.abs((d&&d[2])||0); if(predicate(z,d)) out.push(d); }); return out;
    }

    
    var basis = viewBasis(view);
    var ligDirs = (data.geom && data.geom.lig) ? data.geom.lig.slice() : (data.atoms||[]).slice(1).map(function(a){ return vNorm(a.pos||[1,0,0]); });
    var lpDirs = (data.geom && data.geom.lp) ? data.geom.lp.slice() : (data.lps||[]).map(function(lp){ return vNorm(lp.dir||lp.pos||[1,0,0]); });
    var sectors = [];
    var auxLines = [];
    var note = '';
    var customRayAngles = null;

    if(arr==='AX5' || exGeom==='tbp' || exGeom==='trigonal_bipyramidal' || exGeom==='see_saw' || exGeom==='t_shaped' || exGeom==='linear_tbp'){
      
      var eqDirs = filterByAbsZ(ligDirs.concat(lpDirs), function(z){ return z < 0.35; });
      var axDirs = filterByAbsZ(ligDirs.concat(lpDirs), function(z){ return z >= 0.35; });
      customRayAngles = rayAnglesFromDirs(eqDirs, basis);
      sectors = sectorsFromRayAngles(customRayAngles) || equalSectors(3, -Math.PI/2);
      auxLines = rayAnglesFromDirs(axDirs, basis).map(function(a){ return {a:a, kind:'ax'}; });
      if(!auxLines.length) auxLines = [{a:-Math.PI/2, kind:'ax'},{a:Math.PI/2, kind:'ax'}];
      note = (arr==='AX5' || exGeom==='tbp' || exGeom==='trigonal_bipyramidal')
        ? 'TBP: a pizza mostra o plano equatorial (3 regiões de 120°). As posições axiais aparecem como linhas fora do plano (90° com as equatoriais).'
        : 'TBP derivada: pares livres costumam ocupar posições equatoriais e comprimem alguns ângulos (<90°, <120°).';
    } else if(arr==='AX6' || exGeom==='oct' || exGeom==='octahedral' || exGeom==='square_pyramidal' || exGeom==='square_planar'){
      
      var planeDirs = filterByAbsZ(ligDirs.concat(lpDirs), function(z){ return z < 0.35; });
      var axisDirs = filterByAbsZ(ligDirs.concat(lpDirs), function(z){ return z >= 0.35; });
      customRayAngles = rayAnglesFromDirs(planeDirs, basis);
      sectors = sectorsFromRayAngles(customRayAngles) || equalSectors(4, -Math.PI/4);
      auxLines = rayAnglesFromDirs(axisDirs, basis).map(function(a){ return {a:a, kind:'ax'}; });
      if(!auxLines.length) auxLines = [{a:-Math.PI/2, kind:'ax'},{a:Math.PI/2, kind:'ax'}];
      note = (arr==='AX6' || exGeom==='oct' || exGeom==='octahedral')
        ? 'Octaédrica: a pizza mostra 4 regiões coplanares (90°). As 2 posições axiais ficam fora do plano.'
        : 'Octaédrica derivada: pares livres em posições axiais mudam alguns ângulos (ex.: AX5E tem Ax-Basal <90°).';
    } else {
      
      customRayAngles = rayAnglesFromDirs(ligDirs, basis);
      sectors = sectorsFromRayAngles(customRayAngles);
      if(!sectors){
        if(regionCount===4){ sectors = equalSectors(4, -Math.PI/4); }
        else sectors = equalSectors(regionCount, -Math.PI/2);
      }
      if(regionCount===4){
        note = ((data.geom&&data.geom.arr)||'').indexOf('AX4')===0
          ? 'Tetraédrica/derivadas: a pizza é uma analogia de projeção. O ângulo tetraédrico real (3D) é 109,5°.'
          : 'Quatro regiões no entorno: projeção ajuda a contar regiões; o ângulo real depende da geometria 3D.';
      } else if(regionCount===2){ note='2 regiões opostas -> 180° (linear).'; }
      else if(regionCount===3){ note='3 regiões no plano -> 120° (trigonal planar / base trigonal).'; }
      else { note = regionCount+' regiões eletrônicas em projeção (analogia da pizza).'; }
    }

    ctx.save();
    
    var rg = ctx.createRadialGradient(cx-r*0.14, cy-r*0.18, r*0.05, cx, cy, r);
    rg.addColorStop(0,'rgba(168,224,255,.12)');
    rg.addColorStop(0.75,'rgba(92,160,255,.07)');
    rg.addColorStop(1,'rgba(92,160,255,.025)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(190,220,255,.35)';
    ctx.lineWidth=1.2;
    if(ctx.setLineDash) ctx.setLineDash([6,5]);
    ctx.stroke();
    if(ctx.setLineDash) ctx.setLineDash([]);

    
    sectors.forEach(function(s, i){
      var a1=s.a1, a2=s.a2;
      var col = (i%2===0) ? 'rgba(255,255,255,.055)' : 'rgba(120,200,255,.045)';
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,a1,a2,false);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(cx + Math.cos(a1)*r, cy + Math.sin(a1)*r);
      ctx.strokeStyle='rgba(255,255,255,.30)';
      ctx.lineWidth=1.1;
      ctx.stroke();
    });

    
    auxLines.forEach(function(aux){
      var a=aux.a;
      ctx.save();
      if(ctx.setLineDash) ctx.setLineDash([4,4]);
      ctx.strokeStyle='rgba(255,170,120,.55)';
      ctx.lineWidth=1.15;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a)*r*0.12, cy + Math.sin(a)*r*0.12);
      ctx.lineTo(cx + Math.cos(a)*r*0.95, cy + Math.sin(a)*r*0.95);
      ctx.stroke();
      if(ctx.setLineDash) ctx.setLineDash([]);
      ctx.restore();
    });

    
    ctx.beginPath();
    ctx.arc(cx,cy,8.5,0,Math.PI*2);
    ctx.fillStyle='rgba(70,110,255,.85)';
    ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.24)';
    ctx.stroke();

    
    ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillStyle='rgba(245,251,255,.96)';
    var ttl='Projeção angular (pizza) - esquema sem perspectiva';
    var tw=ctx.measureText(ttl).width;
    ctx.fillText(ttl, Math.max(12, Math.min(can.w-tw-12, cx-tw*0.5)), cy-r-10);

    
    var sliceTxt='';
    if(arr==='AX5' || exGeom==='tbp' || exGeom==='trigonal_bipyramidal') sliceTxt='TBP: 3 fatias equatoriais (120°) + 2 posições axiais (90° com as equatoriais).';
    else if(arr==='AX6' || exGeom==='oct' || exGeom==='octahedral') sliceTxt='Octaédrica: 4 fatias em um plano de referência (90°) + 2 posições axiais.';
    else if(regionCount===4) sliceTxt='4 regiões: a pizza é projeção. Em tetraédrica ideal, o ângulo real em 3D é 109,5°.';
    else if(regionCount===3) sliceTxt='3 regiões: pizza em 3 fatias iguais -> 120°.';
    else if(regionCount===2) sliceTxt='2 regiões: pizza dividida ao meio -> 180°.';
    else sliceTxt = note || (regionCount+' regiões eletrônicas em projeção.');
    if(note && sliceTxt.indexOf(note)===-1 && (arr.indexOf('E')>=0 || exGeom==='see_saw' || exGeom==='t_shaped' || exGeom==='square_pyramidal' || exGeom==='square_planar')){
      sliceTxt += ' ' + note;
    }

    ctx.font='700 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillStyle='rgba(220,234,255,.96)';
    var maxTxtW = Math.max(190, Math.min(can.w*0.78, r*2.05));
    var words = String(sliceTxt).split(/\s+/), lines=[], cur='';
    for(var wi=0; wi<words.length; wi++){
      var test = cur ? (cur+' '+words[wi]) : words[wi];
      if(ctx.measureText(test).width > maxTxtW && cur){ lines.push(cur); cur = words[wi]; }
      else cur = test;
    }
    if(cur) lines.push(cur);
    var lineH = 17;
    var startY = cy + r + 16;
    lines.slice(0,3).forEach(function(tLine, li){
      var tw2 = ctx.measureText(tLine).width;
      var tx = Math.max(12, Math.min(can.w - tw2 - 12, cx - tw2*0.5));
      ctx.fillText(tLine, tx, startY + li*lineH);
    });
    ctx.restore();
  }



  function __drawVectorGrid(ctx, x, y, w, h){
    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,.05)';
    ctx.lineWidth=1;
    for(var gx=x; gx<=x+w+0.1; gx+=24){ ctx.beginPath(); ctx.moveTo(gx,y); ctx.lineTo(gx,y+h); ctx.stroke(); }
    for(var gy=y; gy<=y+h+0.1; gy+=24){ ctx.beginPath(); ctx.moveTo(x,gy); ctx.lineTo(x+w,gy); ctx.stroke(); }
    ctx.restore();
  }

  function __vecLabel(ctx, p, txt, color){
    ctx.save();
    ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var w = ctx.measureText(txt).width + 10;
    ctx.fillStyle='rgba(6,10,16,.82)';
    ctx.strokeStyle='rgba(255,255,255,.10)';
    ctx.lineWidth=1;
    ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(p.x-w/2, p.y-12, w, 20, 10); else ctx.rect(p.x-w/2, p.y-12, w, 20); ctx.fill(); ctx.stroke();
    ctx.fillStyle=color||'#fff';
    ctx.textBaseline='middle';
    ctx.fillText(txt, p.x-w/2+5, p.y-2);
    ctx.restore();
  }

  function drawVectorRuleStage(ctx, can, step){
    var w=can.w, h=can.h;
    ctx.save();
    ctx.fillStyle='rgba(3,7,12,.94)';
    ctx.fillRect(0,0,w,h);
    var pad=18;
    var panel={x:pad,y:pad,w:w-pad*2,h:h-pad*2};
    ctx.fillStyle='rgba(8,12,20,.92)';
    ctx.strokeStyle='rgba(255,255,255,.12)';
    ctx.lineWidth=1;
    ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(panel.x,panel.y,panel.w,panel.h,16); else ctx.rect(panel.x,panel.y,panel.w,panel.h); ctx.fill(); ctx.stroke();
    __drawVectorGrid(ctx, panel.x+12, panel.y+42, panel.w-24, panel.h-54);

    var mode = (step && step.vectorMode) || (/Subtração/i.test(String(step&&step.title||'')) ? 'subtraction' : (/Paralelogramo/i.test(String(step&&step.title||'')) ? 'parallelogram' : 'addition'));
    ctx.fillStyle='rgba(236,244,255,.97)';
    ctx.font='700 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var title = mode==='parallelogram' ? 'Regra do paralelogramo (soma gráfica)' : (mode==='subtraction' ? 'Subtração / cancelamento vetorial' : 'Adição vetorial');
    ctx.fillText(title, panel.x+14, panel.y+22);

    var ox = panel.x + Math.max(170, panel.w*0.32);
    var oy = panel.y + panel.h*0.62;
    var scale = Math.min(panel.w, panel.h) * 0.22;
    var va, vb;
    if(mode==='subtraction'){
      va = {x: scale*1.10, y: -scale*0.05};
      vb = {x: -scale*0.85, y: -scale*0.48};
    }else if(mode==='parallelogram'){
      va = {x: scale*1.00, y: -scale*0.18};
      vb = {x: scale*0.58, y: -scale*0.86};
    }else{
      va = {x: scale*0.95, y: -scale*0.28};
      vb = {x: scale*0.72, y: -scale*0.74};
    }

    function P(v){ return {x:ox+v.x, y:oy+v.y}; }
    var O={x:ox,y:oy}, A=P(va), B=P(vb), R=P({x:va.x+vb.x, y:va.y+vb.y});

    
    ctx.strokeStyle='rgba(255,255,255,.14)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(panel.x+28, oy); ctx.lineTo(panel.x+panel.w-28, oy); ctx.moveTo(ox, panel.y+58); ctx.lineTo(ox, panel.y+panel.h-22); ctx.stroke();

    
    drawArrow(ctx, O, A, '#4ec7ff', 3.0, 10);
    drawArrow(ctx, O, B, '#9cf16c', 3.0, 10);
    __vecLabel(ctx, {x:(O.x+A.x)/2, y:(O.y+A.y)/2-14}, 'μ₁', '#9ed8ff');
    __vecLabel(ctx, {x:(O.x+B.x)/2, y:(O.y+B.y)/2-14}, 'μ₂', '#d3ffb0');

    if(mode==='parallelogram' || mode==='addition'){
      
      ctx.save();
      if(ctx.setLineDash) ctx.setLineDash([7,6]);
      ctx.strokeStyle='rgba(255,255,255,.30)';
      ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(R.x,R.y); ctx.moveTo(B.x,B.y); ctx.lineTo(R.x,R.y); ctx.stroke();
      ctx.restore();
      drawArrow(ctx, O, R, '#ffd34d', 3.8, 14);
      __vecLabel(ctx, {x:(O.x+R.x)/2, y:(O.y+R.y)/2+16}, 'μR = μ₁ + μ₂', '#ffe98f');
    } else {
      
      var negB = {x:ox-vb.x, y:oy-vb.y};
      drawArrow(ctx, O, negB, '#ff8ea0', 2.8, 10);
      __vecLabel(ctx, {x:(O.x+negB.x)/2, y:(O.y+negB.y)/2+16}, '-μ₂', '#ffc2cb');
      var Rsub = {x: ox + va.x - vb.x, y: oy + va.y - vb.y};
      drawArrow(ctx, O, Rsub, '#ffd34d', 3.8, 14);
      __vecLabel(ctx, {x:(O.x+Rsub.x)/2, y:(O.y+Rsub.y)/2+16}, 'μR = μ₁ - μ₂', '#ffe98f');
      ctx.save(); if(ctx.setLineDash) ctx.setLineDash([7,6]); ctx.strokeStyle='rgba(255,255,255,.24)'; ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(Rsub.x,Rsub.y); ctx.moveTo(negB.x,negB.y); ctx.lineTo(Rsub.x,Rsub.y); ctx.stroke(); ctx.restore();
    }

    
    var bx=panel.x+14, by=panel.y+44, bw=Math.min(390, panel.w*0.42), bh=86;
    ctx.fillStyle='rgba(7,11,18,.78)'; ctx.strokeStyle='rgba(255,255,255,.10)'; ctx.lineWidth=1;
    ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(bx,by,bw,bh,12); else ctx.rect(bx,by,bw,bh); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(236,244,255,.96)'; ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var head = mode==='parallelogram' ? 'Regra do paralelogramo' : (mode==='subtraction' ? 'Subtração vetorial (soma com sinal)' : 'Adição vetorial');
    ctx.fillText(head, bx+10, by+18);
    ctx.font='600 11px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'; ctx.fillStyle='rgba(204,220,245,.95)';
    var l1, l2, l3;
    if(mode==='parallelogram'){
      l1='1) Desenhe μ₁ e μ₂ a partir da mesma origem.';
      l2='2) Copie μ₁ na ponta de μ₂ e μ₂ na ponta de μ₁.';
      l3='3) A diagonal da origem é a resultante μR.';
    }else if(mode==='subtraction'){
      l1='1) Subtrair μ₂ = somar (−μ₂).';
      l2='2) Inverta o sentido de μ₂ e some pela regra da soma.';
      l3='3) Cancelamento total ocorre se forem iguais e opostos.';
    }else{
      l1='1) Some por componentes: Σμx, Σμy, Σμz.';
      l2='2) Componentes no mesmo sentido se reforçam.';
      l3='3) A seta amarela mostra μR (soma final).';
    }
    ctx.fillText(l1, bx+10, by+40); ctx.fillText(l2, bx+10, by+57); ctx.fillText(l3, bx+10, by+74);

    ctx.restore();
  }
  function drawPolarOverlay(){
    var can = getCanvasAndCtx(); if(!can || !octx || !apiRef) return;
    var ctx=octx, w=can.w, h=can.h;
    ctx.clearRect(0,0,w,h);
    var s=steps[stepIdx]; if(!s) return;
    var data = moleculeVisualData();
    var ex = data.ex; var view = apiRef.getView ? apiRef.getView() : {camDist:5, rotX:0.3, rotY:-0.8};
    var vectorOnly = false;
    glowPhase += 0.03;

    if(vectorOnly){
      drawVectorRuleStage(ctx, can, s);
      return;
    }

    
    var projAtoms = data.atoms.map(function(a){ return {a:a, p:projectPoint(a.pos, view, can)}; });
    var pCenter = projAtoms[0] && projAtoms[0].p;
    if(!pCenter) return;

    

        if(!vectorOnly && visualState.pizza && (typeof showAngles==='undefined' || !showAngles || showAngles.checked)){
      drawPizzaProjection(ctx, data, view, can);
    }


    
    
    
    if(visualState.bond){
      data.bondDipoles.forEach(function(d, idx){
        var centerWorld = data.atoms[0] && data.atoms[0].pos;
        var ligAtom = data.atoms[idx+1];
        var ligWorld = ligAtom && ligAtom.pos;
        if(!centerWorld || !ligWorld) return;

        var rail = __pickVisibleBondRail(centerWorld, ligWorld, d.dir || vSub(ligWorld, centerWorld), data.bondType || 1, view, can);
        if(!rail || !rail.pa || !rail.pb) return;

        var towardsLigand = vDot(vSub(ligWorld, centerWorld), d.vec||[0,0,0]) >= 0;
        var a = towardsLigand ? rail.pa : rail.pb;
        var b = towardsLigand ? rail.pb : rail.pa;

        var segLen = Math.hypot(b.x - a.x, b.y - a.y);
        if(!isFinite(segLen) || segLen < 6) return;

        drawArrow(ctx, a, b, '#4ec7ff', 2.5, 8);
      });
    }

    if(vectorOnly){
      ctx.save();
      var bx=16, by=18, bw=Math.min(360, can.w*0.34), bh=74;
      ctx.fillStyle='rgba(7,11,18,.78)';
      ctx.strokeStyle='rgba(255,255,255,.12)';
      ctx.lineWidth=1;
      ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(bx,by,bw,bh,12); else ctx.rect(bx,by,bw,bh); ctx.fill(); ctx.stroke();
      ctx.fillStyle='rgba(236,244,255,.96)';
      ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      var isAdd = /Adição de vetores/i.test(String(s.title||''));
      ctx.fillText(isAdd ? 'Regra de soma vetorial (adição)' : 'Regra de soma vetorial (subtração/cancelamento)', bx+12, by+18);
      ctx.font='600 11px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillStyle='rgba(203,220,246,.94)';
      var line1 = isAdd ? 'Somamos componentes no mesmo sentido: Σμx, Σμy, Σμz.' : 'Vetores opostos entram com sinal contrário: Σμx, Σμy, Σμz.';
      var line2 = isAdd ? 'Componentes alinhadas se reforçam -> |μR| aumenta.' : 'Módulos iguais e sentidos opostos podem cancelar (μR ~ 0).';
      ctx.fillText(line1, bx+12, by+40);
      ctx.fillText(line2, bx+12, by+58);
      ctx.restore();
    }

    
    if(visualState.result){
      if(data.muMag > 0.06){
        var a = projectVectorPoint([0,0,0], view, can) || pCenter;
        var scale = 0.70 + Math.min(0.7, data.muMag*0.18);
        var b = projectVectorPoint(vMul(vNorm(data.muR), data.bondLen*scale), view, can);
        if(b) drawArrow(ctx, a, b, '#ffd34d', 3.4, 12);
      } else {
        drawTextLabel(ctx, {x:pCenter.x, y:pCenter.y+74}, 'μR ~ 0 (cancelamento)', '#f7fbff');
      }
    }

    
    if(false && !vectorOnly && visualState.deltas){
      var centerEN = __electronegativity(data.atoms[0] && data.atoms[0].label);
      var centerNegCount = 0;
      var avgLigDir = {x:0, y:0, n:0};
      projAtoms.slice(1).forEach(function(it){
        if(!it.p) return;
        var ligEN = __electronegativity(it.a && it.a.label);
        var ligNeg = ligEN >= centerEN;
        if(!ligNeg) centerNegCount++;

        var dx = it.p.x - pCenter.x;
        var dy = it.p.y - pCenter.y;
        var dL = Math.hypot(dx, dy) || 1;
        var ux = dx / dL, uy = dy / dL;
        avgLigDir.x += ux; avgLigDir.y += uy; avgLigDir.n += 1;

        var ligOffset = 22;
        drawTextLabel(ctx, {x:it.p.x + ux*ligOffset, y:it.p.y + uy*ligOffset}, ligNeg ? 'δ−' : 'δ+', ligNeg ? '#98b8ff' : '#ff9fb2');
      });
      var centerNeg = centerNegCount > 0;
      var cdx = 0, cdy = -1;
      if(avgLigDir.n > 0){
        var ax = avgLigDir.x / avgLigDir.n;
        var ay = avgLigDir.y / avgLigDir.n;
        var aL = Math.hypot(ax, ay);
        if(aL > 0.08){
          cdx = -ax / aL;
          cdy = -ay / aL;
        }
      }
      var centerOffset = centerNeg ? 36 : 32;
      drawTextLabel(ctx, {x:pCenter.x + cdx*centerOffset, y:pCenter.y + cdy*centerOffset}, centerNeg ? 'δ−' : 'δ+', centerNeg ? '#98b8ff' : '#ff9fb2');
    }

    
    
    var hasLonePairs = !!(data && data.geom && data.geom.lp && data.geom.lp.length);
    if(!vectorOnly && !hasLonePairs && visualState.angles && (typeof showAngles==='undefined' || !showAngles || showAngles.checked)){
      drawAngleSchematic(ctx, data, can);
    }
  }

  var __overlayFramePending = false;
  function requestOverlayDraw(){
    if(__overlayFramePending) return;
    __overlayFramePending = true;
    requestAnimationFrame(function(){
      __overlayFramePending = false;
      drawPolarOverlay();
    });
  }

  onReady(function(api){
    apiRef = api; if(!apiRef) return;
    injectStyles();

    el = {
      card: document.getElementById('tutorialCard'),
      tag: document.getElementById('tutorialStepTag'),
      title: document.getElementById('tutorialTitle'),
      body: document.getElementById('tutorialBody'),
      note: document.getElementById('tutorialNote'),
      examples: document.getElementById('tutorialExamples'),
      mini: document.getElementById('tutorialMini'),
      prog: document.getElementById('tutorialProgressBar'),
      next: document.getElementById('tutorialNext'),
      prev: document.getElementById('tutorialPrev'),
      restart: document.getElementById('tutorialRestart'),
      play: document.getElementById('tutorialPlay'),
      hint: document.getElementById('focusHint')
    };

    
    if(apiRef.ui && apiRef.ui.showAxes) apiRef.ui.showAxes.checked = true;
    if(apiRef.ui && apiRef.ui.lpColor) apiRef.ui.lpColor.value = '#1100ff';
    if(apiRef.ui && apiRef.ui.bgStars) apiRef.ui.bgStars.value = apiRef.ui.bgStars.value || '0.6';
    apiRef.setBoardSplit && apiRef.setBoardSplit(false);
    apiRef.clearBalloons && apiRef.clearBalloons();
    apiRef.sync();

    
    if(el.card){
      var header = el.card.querySelector('.tutorialHeader .kicker');
      if(header) header.textContent = 'TUTORIAL GUIADO - POLARIDADE';
    }
    if(document.title) document.title = 'Geometria molecular 3D - Tutorial guiado';
    ensureMapOptionsUI();

    
    if(apiRef.ui && apiRef.ui.geom){
      var __refreshOnGeomChange = function(){
        if(el.examples){ el.examples.innerHTML = buildExamplesHTML(steps[stepIdx]); }
        requestOverlayDraw();
      };
      apiRef.ui.geom.addEventListener('input', __refreshOnGeomChange);
      apiRef.ui.geom.addEventListener('change', __refreshOnGeomChange);
    }

    el.next && el.next.addEventListener('click', next);
    el.prev && el.prev.addEventListener('click', prev);
    el.restart && el.restart.addEventListener('click', restart);
    el.play && el.play.addEventListener('click', autoplay);
    el.examples && el.examples.addEventListener('click', async function(ev){
      var target = ev.target && ev.target.closest ? ev.target.closest('.exBtn, .exInlineBtn, .balloonAdd, .balloonRem, .balloonReset') : null;
      if(!target) return; ev.preventDefault();

      if(target.classList.contains('balloonAdd')){
        await applyBalloonDemoToBoard(balloonDemoCount + 1, false);
        return;
      }
      if(target.classList.contains('balloonRem')){
        await applyBalloonDemoToBoard(balloonDemoCount - 1, false);
        return;
      }
      if(target.classList.contains('balloonReset')){
        resetBalloonScaleState();
        await applyBalloonDemoToBoard(2, false);
        return;
      }

      var k = target.getAttribute('data-ex-key');
      if(k) setExample(k, {cam:true, clicked:true});
    });
    el.examples && el.examples.addEventListener('dblclick', function(ev){
      var target = ev.target && ev.target.closest ? ev.target.closest('.balloonNode') : null;
      if(!target) return;
      ev.preventDefault();
    });
    window.addEventListener('keydown', function(e){ if(e.key==='ArrowRight') next(); else if(e.key==='ArrowLeft') prev(); });
    window.addEventListener('resize', requestOverlayDraw);
    window.__geomTutorialOnDraw = drawPolarOverlay;

    requestOverlayDraw();
    applyStep(0);
  });
})();

