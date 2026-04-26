'use strict';
(function(){
  var canvas = document.getElementById('gl');
  var ctx = canvas.getContext('2d', { alpha:false, desynchronized:true });
  var angleCanvas = document.getElementById('angleOverlay');
  var angleCtx = angleCanvas ? angleCanvas.getContext('2d') : null;
  if(!ctx){ alert('Seu navegador não suporta canvas 2D.'); return; }

  var mainEl = canvas.parentElement;
  var geom = document.getElementById('geom');
  var bondLen = document.getElementById('bondLen');
  var size = document.getElementById('size');
  var ligandRadius = document.getElementById('ligandRadius');
  var bondRadius = document.getElementById('bondRadius');
  var lpScale = document.getElementById('lpScale');
  var ambient = document.getElementById('ambient');
  var sat = document.getElementById('sat');
  var specK = document.getElementById('specK');
  var refl = document.getElementById('refl');
  var ligandColor = document.getElementById('ligandColor');
  var lpColor = document.getElementById('lpColor');
  var coreColor = document.getElementById('coreColor');
  var bondType = document.getElementById('bondType');
  var showAxes = document.getElementById('showAxes');
  var showAngles = document.getElementById('showAngles');
  var angleLegendPanel = document.getElementById('angleLegendPanel');
  var lightBg = document.getElementById('lightBg');
  var lightBgQuick = document.getElementById('lightBgQuick');
  var save = document.getElementById('save');
  var infoName = document.getElementById('infoName');
  var infoArr = document.getElementById('infoArr');
  var infoIdeal = document.getElementById('infoIdeal');
  var rotXS = document.getElementById('rotXS');
  var rotYS = document.getElementById('rotYS');
  var rotZS = document.getElementById('rotZS');
  var bgStars = document.getElementById('bgStars');
  var bgBrightness = document.getElementById('bgBrightness');
  var rotReset = document.getElementById('rotReset');
  var boardSplitOverlay = document.getElementById('boardSplitOverlay');
  var tutorialLightBg = document.getElementById('tutorialLightBg');
  var tutorialRotZVal = document.getElementById('tutorialRotZVal');
  var DEG = Math.PI / 180;

  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function mix(a,b,t){ return a + (b-a) * t; }
  function smooth(t){ return t * t * (3 - 2 * t); }
  function hexToRgb(hex){
    var s = String(hex || '#ffffff').replace('#','');
    var full = s.length===3 ? s.split('').map(function(c){ return c+c; }).join('') : s.padEnd(6, '0');
    var n = parseInt(full,16) || 0;
    return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
  }
  function rgbToHex(r,g,b){
    var n = (clamp(r|0,0,255)<<16) | (clamp(g|0,0,255)<<8) | clamp(b|0,0,255);
    return '#' + n.toString(16).padStart(6,'0');
  }
  function shade(hex, amt){
    var c = hexToRgb(hex);
    var t = amt > 0 ? 255 : 0;
    var p = Math.abs(amt);
    return rgbToHex(
      Math.round(c.r + (t - c.r) * p),
      Math.round(c.g + (t - c.g) * p),
      Math.round(c.b + (t - c.b) * p)
    );
  }
  function rgba(hex, a){
    var c = hexToRgb(hex);
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  }
  function colorize(hex, satK){
    var c = hexToRgb(hex);
    var l = (c.r + c.g + c.b) / 3;
    var k = satK == null ? 1 : satK;
    return rgbToHex(
      Math.round(clamp(l + (c.r - l) * k, 0, 255)),
      Math.round(clamp(l + (c.g - l) * k, 0, 255)),
      Math.round(clamp(l + (c.b - l) * k, 0, 255))
    );
  }

  function vSub(a,b){ return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
  function vAdd(a,b){ return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
  function vMul(a,s){ return [a[0]*s, a[1]*s, a[2]*s]; }
  function vDot(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
  function vCross(a,b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function vLen(a){ return Math.hypot(a[0],a[1],a[2]) || 1; }
  function vNorm(a){ var L=vLen(a); return [a[0]/L,a[1]/L,a[2]/L]; }
  function rotXYZ(v, r){
    var x=v[0], y=v[1], z=v[2];
    var cx=Math.cos(r.x), sx=Math.sin(r.x);
    var cy=Math.cos(r.y), sy=Math.sin(r.y);
    var cz=Math.cos(r.z), sz=Math.sin(r.z);
    var y1=cx*y - sx*z, z1=sx*y + cx*z; y=y1; z=z1;
    var x2=cy*x + sy*z, z2=-sy*x + cy*z; x=x2; z=z2;
    var x3=cz*x - sz*y, y3=sz*x + cz*y; x=x3; y=y3;
    return [x,y,z];
  }

  var axisLabels = {
    x: document.getElementById('axisXLabel'),
    y: document.getElementById('axisYLabel'),
    z: document.getElementById('axisZLabel')
  };
  function setAxisLabelsVisible(v){
    axisLabels.x.style.display = v ? 'block' : 'none';
    axisLabels.y.style.display = v ? 'block' : 'none';
    axisLabels.z.style.display = v ? 'block' : 'none';
  }

  function resize(){
    var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    var w = Math.max(1, canvas.clientWidth || canvas.offsetWidth || 1);
    var h = Math.max(1, canvas.clientHeight || canvas.offsetHeight || 1);
    if(canvas.width !== Math.round(w*dpr) || canvas.height !== Math.round(h*dpr)){
      canvas.width = Math.round(w*dpr);
      canvas.height = Math.round(h*dpr);
    }
    if(angleCanvas){
      if(angleCanvas.width !== Math.round(w*dpr) || angleCanvas.height !== Math.round(h*dpr)){
        angleCanvas.width = Math.round(w*dpr);
        angleCanvas.height = Math.round(h*dpr);
      }
      angleCtx && angleCtx.setTransform(dpr,0,0,dpr,0,0);
    }
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  var ro = window.ResizeObserver ? new ResizeObserver(function(){ resize(); requestRender(); }) : null;
  if(ro){ ro.observe(canvas); } else { window.addEventListener('resize', function(){ resize(); requestRender(); }); }

  var ui = {
    geom:geom,bondLen:bondLen,size:size,ligandRadius:ligandRadius,bondRadius:bondRadius,lpScale:lpScale,
    ambient:ambient,sat:sat,specK:specK,refl:refl,ligandColor:ligandColor,lpColor:lpColor,coreColor:coreColor,
    bondType:bondType,showAxes:showAxes,showAngles:showAngles,lightBg:lightBg,lightBgQuick:lightBgQuick,save:save,infoName:infoName,infoArr:infoArr,infoIdeal:infoIdeal,
    rotXS:rotXS,rotYS:rotYS,rotZS:rotZS,bgStars:bgStars,bgBrightness:bgBrightness,rotReset:rotReset
  };

  function __applyPerformanceMode(){
    if(specK){ specK.value='0'; specK.disabled=true; }
    if(refl){ refl.value='0'; refl.disabled=true; }
    if(bgStars){ bgStars.value='0'; bgStars.disabled=true; }
    if(bgBrightness){ bgBrightness.value='0'; bgBrightness.disabled=true; }
  }
  __applyPerformanceMode();

  var __drawRequested = false;
  function requestRender(){
    if(__drawRequested) return;
    __drawRequested = true;
    requestAnimationFrame(draw);
  }

  var __whiteMode = false;
  function __setLightBG(v){
    v = !!v;
    __whiteMode = v;
    if(ui.lightBg) ui.lightBg.checked = v;
    if(ui.lightBgQuick) ui.lightBgQuick.checked = v;
    if(tutorialLightBg) tutorialLightBg.checked = v;
    document.body.classList.toggle('lightBg', v);
    requestRender();
  }

  Object.keys(ui).forEach(function(k){
    var el = ui[k];
    if(!el) return;
    if(k==='lightBg' || k==='lightBgQuick') return;
    if(el && (el.tagName==='INPUT' || el.tagName==='SELECT')){
      el.addEventListener('input', sync);
      el.addEventListener('change', sync);
    }
  });

  __setLightBG(!!((ui.lightBg && ui.lightBg.checked) || (ui.lightBgQuick && ui.lightBgQuick.checked) || (tutorialLightBg && tutorialLightBg.checked)));
  if(ui.lightBg){
    ui.lightBg.addEventListener('input', function(){ __setLightBG(ui.lightBg.checked); sync(); });
    ui.lightBg.addEventListener('change', function(){ __setLightBG(ui.lightBg.checked); sync(); });
  }
  if(ui.lightBgQuick){
    ui.lightBgQuick.addEventListener('input', function(){ __setLightBG(ui.lightBgQuick.checked); sync(); });
    ui.lightBgQuick.addEventListener('change', function(){ __setLightBG(ui.lightBgQuick.checked); sync(); });
  }
  if(tutorialLightBg){
    tutorialLightBg.addEventListener('input', function(){ __setLightBG(tutorialLightBg.checked); sync(); });
    tutorialLightBg.addEventListener('change', function(){ __setLightBG(tutorialLightBg.checked); sync(); });
  }

  var axesToggleChk = document.getElementById('axesToggleChk');
  if(axesToggleChk && ui.showAxes){
    axesToggleChk.checked = !!ui.showAxes.checked;
    function __syncAxesToggle(){ ui.showAxes.checked = !!axesToggleChk.checked; sync(); }
    axesToggleChk.addEventListener('input', __syncAxesToggle);
    axesToggleChk.addEventListener('change', __syncAxesToggle);
    function __mirrorAxesToggle(){ axesToggleChk.checked = !!ui.showAxes.checked; }
    ui.showAxes.addEventListener('input', __mirrorAxesToggle);
    ui.showAxes.addEventListener('change', __mirrorAxesToggle);
  }

  save.addEventListener('click', function(){
    requestAnimationFrame(function(){
      if(canvas.toBlob){
        canvas.toBlob(function(blob){
          if(!blob) return;
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.download = 'geometria_molecular_3d.png';
          a.href = url;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
        }, 'image/png');
        return;
      }
      var a = document.createElement('a');
      a.download = 'geometria_molecular_3d.png';
      a.href = canvas.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  });

  var rot = {x:0,y:0,z:0};
  ['x','y','z'].forEach(function(ax){
    var el = document.getElementById('rot' + ax.toUpperCase() + 'S');
    if(!el) return;
    el.addEventListener('input', function(e){
      var v = parseFloat(e.target.value) || 0;
      rot[ax] = v * DEG;
      if(ax==='z' && tutorialRotZVal) tutorialRotZVal.textContent = Math.round(v) + '°';
      requestRender();
    });
  });
  rotReset.addEventListener('click', function(){
    rot.x=rot.y=rot.z=0;
    if(rotXS) rotXS.value='0';
    if(rotYS) rotYS.value='0';
    if(rotZS) rotZS.value='0';
    if(tutorialRotZVal) tutorialRotZVal.textContent='0°';
    requestRender();
  });

  var camDist=4.9, rotX=0.35, rotY=-0.6, isDown=false, activePointerId=null, lastX=0, lastY=0;
  function __syncOrbitFromAngles(){}
  function __wrapAngle(v){
    if(!isFinite(v)) return 0;
    var two = Math.PI*2;
    v = (v + Math.PI) % two;
    if(v < 0) v += two;
    return v - Math.PI;
  }
  function __clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function __handleDrag(dx, dy){
    var orbitSpeed = 0.0088;
    rotY = __wrapAngle(rotY + dx * orbitSpeed);
    rotX = __clamp(rotX + dy * orbitSpeed, -Math.PI/2 + 0.05, Math.PI/2 - 0.05);
    __syncOrbitFromAngles();
    requestRender();
  }
  canvas.addEventListener('pointerdown', function(e){
    isDown=true; activePointerId=e.pointerId; lastX=e.clientX; lastY=e.clientY; try{ canvas.setPointerCapture(e.pointerId); }catch(_e){}
  });
  canvas.addEventListener('pointermove', function(e){
    if(!isDown || e.pointerId!==activePointerId) return;
    var dx = e.clientX-lastX, dy = e.clientY-lastY;
    lastX = e.clientX; lastY = e.clientY;
    __handleDrag(dx, dy);
  });
  function __endPointer(e){
    if(activePointerId!==null && e.pointerId===activePointerId){ try{ canvas.releasePointerCapture(e.pointerId); }catch(_e){} }
    if(e.pointerId===activePointerId){ activePointerId=null; isDown=false; }
  }
  canvas.addEventListener('pointerup', __endPointer);
  canvas.addEventListener('pointercancel', __endPointer);
  canvas.addEventListener('wheel', function(e){
    e.preventDefault();
    if(typeof e.stopPropagation==='function') e.stopPropagation();
    var delta = e.deltaY;
    if(e.deltaMode === 1) delta *= 16;
    else if(e.deltaMode === 2) delta *= window.innerHeight || 800;
    if(!isFinite(delta) || delta === 0) return;
    var amt = Math.min(0.85, Math.max(0.18, Math.abs(delta) * 0.0025));
    camDist = __clamp(camDist + (delta > 0 ? amt : -amt), 2.2, 14);
    showZoomNotice();
    requestRender();
  }, {passive:false});
  canvas.addEventListener('dblclick', function(){
    camDist = autoDist();
    rotX = 0.35; rotY = -0.6;
    rot.x=rot.y=rot.z=0;
    if(rotXS) rotXS.value='0';
    if(rotYS) rotYS.value='0';
    if(rotZS) rotZS.value='0';
    if(tutorialRotZVal) tutorialRotZVal.textContent='0°';
    requestRender();
  });

  function geomPositions(type){
    var SQ2=Math.sqrt(2), SQ3=Math.sqrt(3);
    var trig = [[1,0,0],[-0.5,SQ3/2,0],[-0.5,-SQ3/2,0]];
    var r = 2*SQ2/3, z = -1/3;
    var tetra = [[0,0,1],[r,0,z],[r*Math.cos(2*Math.PI/3),r*Math.sin(2*Math.PI/3),z],[r*Math.cos(4*Math.PI/3),r*Math.sin(4*Math.PI/3),z]].map(vNorm);
    var tbp = { eq:trig.map(vNorm), ax:[[0,0,1],[0,0,-1]] };
    var oct = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    switch(type){
      case 'linear': return {lig:[[0,0,1],[0,0,-1]], lp:[], angle:'180°', ideal:'180°', arr:'AX2', label:'Linear'};
      case 'trigonal_planar': return {lig:trig.map(vNorm), lp:[], angle:'120°', ideal:'120°', arr:'AX3', label:'Trigonal planar'};
      case 'tetrahedral':
      case 'tetra': return {lig:tetra.slice(), lp:[], angle:'109,5° (3D)', ideal:'109,5°', arr:'AX4', label:'Tetraédrica'};
      case 'trigonal_bipyramidal':
      case 'tbp': return {lig:tbp.eq.concat(tbp.ax), lp:[], angle:'120° (eq-eq), 90° (ax-eq), 180° (ax-ax)', ideal:'120°/90°/180°', arr:'AX5', label:'Bipirâmide trigonal'};
      case 'octahedral':
      case 'oct': return {lig:oct, lp:[], angle:'90° (adj.), 180° (opostos)', ideal:'90°/180°', arr:'AX6', label:'Octaédrica'};
      case 'bent_tp': {
        var t=60*DEG;
        return {lig:[[Math.sin(t),0,-Math.cos(t)],[-Math.sin(t),0,-Math.cos(t)]], lp:[[0,0,1]], angle:'≈120° (1 par livre)', ideal:'≈120°', arr:'AX2E', label:'Angular (AX2E)'};
      }
      case 'trigonal_pyramidal': return {lig:[tetra[1],tetra[2],tetra[3]], lp:[tetra[0]], angle:'≈107° (1 par livre)', ideal:'≈107°', arr:'AX3E', label:'Piramidal trigonal (AX3E)'};
      case 'bent_tet': {
        var lig=[vNorm([1,0,-0.78]), vNorm([-1,0,-0.78])];
        var lp=[vNorm([1,1,1]), vNorm([-1,-1,1])];
        return {lig:lig, lp:lp, angle:'≈104,5° (2 pares livres)', ideal:'≈104,5°', arr:'AX2E2', label:'Angular (AX2E2)'};
      }
      case 'see_saw': return {lig:[tbp.eq[1],tbp.eq[2],tbp.ax[0],tbp.ax[1]], lp:[tbp.eq[0]], angle:'≈120° (eq-eq), ≈90° (ax-eq), ≈180° (ax-ax)', ideal:'≈120°/≈90°/≈180°', arr:'AX4E', label:'Gangorra (AX4E)'};
      case 't_shaped': return {lig:[tbp.eq[2],tbp.ax[0],tbp.ax[1]], lp:[tbp.eq[0],tbp.eq[1]], angle:'≈90° (ax-eq), ≈180° (ax-ax)', ideal:'≈90°/≈180°', arr:'AX3E2', label:'Em T (AX3E2)'};
      case 'linear_tbp': return {lig:[tbp.ax[0],tbp.ax[1]], lp:tbp.eq.slice(), angle:'≈180° (lig-lig); pares livres equatoriais a ≈120°', ideal:'≈180°', arr:'AX2E3', label:'Linear (AX2E3)'};
      case 'square_pyramidal': return {lig:[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,-1]], lp:[[0,0,1]], angle:'≈90° (ax-basal), ≈90°/≈180° na base', ideal:'≈90°/≈90°/≈180°', arr:'AX5E', label:'Piramidal quadrada (AX5E)'};
      case 'square_planar': return {lig:[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]], lp:[[0,0,1],[0,0,-1]], angle:'≈90°/≈180° (pares livres trans fora do plano)', ideal:'≈90°/≈180°', arr:'AX4E2', label:'Quadrada planar (AX4E2)'};
      default: return {lig:tetra.slice(), lp:[], angle:'109,5° (3D)', ideal:'109,5°', arr:'AX4', label:'Tetraédrica'};
    }
  }

  var __balloons = { n:0, pos:new Float32Array(18), rad:new Float32Array(18), col:new Float32Array(18), dir:new Float32Array(18) };
  var __exampleAtomOverrides = { core:null, ligands:null, bonds:null };
  var __sceneSplit = false;
  var __sceneMolOffset = [0,0,0];
  var __sceneBalloonOffset = [0,0,0];
  var __balloonScaleCfg = Array.from({length:6}, function(){ return {x:1, y:1, z:1}; });
  function __readBalloonScale(i){
    var src = __balloonScaleCfg[i] || {};
    return {
      x: clamp(+src.x || 1, 0.35, 3),
      y: clamp(+src.y || 1, 0.35, 3),
      z: clamp(+src.z || 1, 0.35, 3)
    };
  }
  function __setBalloonScales(scales){
    scales = Array.isArray(scales) ? scales : [];
    for(var i=0;i<6;i++){
      var src = scales[i] || __balloonScaleCfg[i] || {};
      __balloonScaleCfg[i] = {
        x: clamp(+src.x || 1, 0.35, 3),
        y: clamp(+src.y || 1, 0.35, 3),
        z: clamp(+src.z || 1, 0.35, 3)
      };
    }
    requestRender();
  }
  function __setBoardSplit(active){
    __sceneSplit = !!active;
    __sceneMolOffset = __sceneSplit ? [1.95,0,0] : [0,0,0];
    __sceneBalloonOffset = __sceneSplit ? [-1.95,0,0] : [0,0,0];
    if(boardSplitOverlay) boardSplitOverlay.classList.toggle('show', __sceneSplit);
    requestRender();
  }
  function getAxesOriginWorld(){
    return [__sceneMolOffset[0], __sceneMolOffset[1], __sceneMolOffset[2]];
  }
  function getBalloonJoinWorld(){
    return [__sceneBalloonOffset[0], __sceneBalloonOffset[1], __sceneBalloonOffset[2]];
  }
  function __setBalloons3D(n, dirs){
    __balloons.n = n;
    for(var i=0;i<6;i++){
      var bi=i*3;
      if(i<n && dirs && dirs[i]){
        var d=vNorm(dirs[i]);
        var dist=1.22;
        __balloons.pos[bi+0]=d[0]*dist;
        __balloons.pos[bi+1]=d[1]*dist;
        __balloons.pos[bi+2]=d[2]*dist;
        __balloons.dir[bi+0]=d[0]; __balloons.dir[bi+1]=d[1]; __balloons.dir[bi+2]=d[2];
        var sc = __readBalloonScale(i);
        __balloons.rad[bi+0]=0.32*sc.x; __balloons.rad[bi+1]=0.32*sc.y; __balloons.rad[bi+2]=0.48*sc.z;
        var pal=[[111,215,255],[160,255,207],[255,213,126],[255,159,196],[212,176,255],[255,243,154]][i%6];
        __balloons.col[bi+0]=pal[0]/255; __balloons.col[bi+1]=pal[1]/255; __balloons.col[bi+2]=pal[2]/255;
      } else {
        __balloons.pos[bi+0]=__balloons.pos[bi+1]=__balloons.pos[bi+2]=0;
        __balloons.rad[bi+0]=__balloons.rad[bi+1]=__balloons.rad[bi+2]=0;
        __balloons.col[bi+0]=__balloons.col[bi+1]=__balloons.col[bi+2]=0;
        __balloons.dir[bi+0]=__balloons.dir[bi+1]=__balloons.dir[bi+2]=0;
      }
    }
    requestRender();
  }

  var state = { center:[0,0,0], fitScale:110, screenOffset:[0,0] };

  var zoomNoticeEl = null;
  var zoomNoticeTimer = 0;
  function getScreenZoomScale(){
    return clamp(Math.pow(getEffectiveZoomFactor(), 0.96), 0.62, 2.35);
  }
  function ensureZoomNotice(){
    if(zoomNoticeEl && zoomNoticeEl.parentNode) return zoomNoticeEl;
    var host = canvas && canvas.parentNode ? canvas.parentNode : document.body;
    var styleId = 'zoomNoticeStyle';
    if(!document.getElementById(styleId)){
      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = '.zoomNotice{position:absolute;left:50%;top:16px;transform:translate(-50%,-12px);max-width:min(980px,calc(100% - 32px));padding:11px 16px;border-radius:999px;border:1px solid rgba(136,168,255,.38);background:rgba(10,16,28,.82);color:#eef4ff;font:600 13px/1.35 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;text-align:center;box-shadow:0 14px 34px rgba(0,0,0,.24);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .22s ease,transform .22s ease;z-index:80}.zoomNotice.show{opacity:1;transform:translate(-50%,0)}body.lightBg .zoomNotice{background:rgba(255,255,255,.92);color:#17304d;border-color:rgba(36,58,96,.18);box-shadow:0 10px 24px rgba(20,34,56,.14)}';
      document.head.appendChild(style);
    }
    zoomNoticeEl = document.getElementById('zoomNotice');
    if(!zoomNoticeEl){
      zoomNoticeEl = document.createElement('div');
      zoomNoticeEl.id = 'zoomNotice';
      zoomNoticeEl.className = 'zoomNotice';
      zoomNoticeEl.setAttribute('aria-live', 'polite');
      zoomNoticeEl.textContent = 'As núvens eletrônicas estão sempre grudadas nos átomos e também interagem entre si, construtivamente e/ou destrutivamente.';
      host.appendChild(zoomNoticeEl);
    }
    return zoomNoticeEl;
  }
  function showZoomNotice(){
    var el = ensureZoomNotice();
    if(!el) return;
    el.classList.add('show');
    if(zoomNoticeTimer) clearTimeout(zoomNoticeTimer);
    zoomNoticeTimer = setTimeout(function(){
      if(zoomNoticeEl) zoomNoticeEl.classList.remove('show');
    }, 3600);
  }
  var currentGeomData = geomPositions(geom ? geom.value : 'linear');

  function getEffectiveZoomFactor(){
    return clamp(4.7 / camDist, 0.42, 1.9);
  }
  function rotateCamera(v){
    var x=v[0], y=v[1], z=v[2];
    var cy=Math.cos(rotY), sy=Math.sin(rotY);
    var x1=cy*x + sy*z;
    var z1=-sy*x + cy*z;
    var cx=Math.cos(rotX), sx=Math.sin(rotX);
    var y2=cx*y - sx*z1;
    var z2=sx*y + cx*z1;
    return [x1,y2,z2];
  }
  function project(v){
    var rv = rotateCamera(vSub(v, state.center));
    var scale = state.fitScale * getEffectiveZoomFactor();
    var screenOffset = state.screenOffset || [0,0];
    return {
      x: canvas.clientWidth * 0.5 + screenOffset[0] + rv[0] * scale,
      y: canvas.clientHeight * 0.5 + screenOffset[1] - rv[1] * scale,
      z: rv[2],
      scale: scale
    };
  }

  function moleculeWorld(){
    var G = currentGeomData;
    var bl = parseFloat(bondLen.value) || 0.625;
    var coreR = parseFloat(size.value) || 0.64;
    var ligR = parseFloat(ligandRadius.value) || 0.44;
    var lpR = ligR * clamp((parseFloat(lpScale.value) || 1) * 0.42, 0.22, 0.95);
    var baseCore = rotXYZ([0,0,0], rot);
    var centerPos = vAdd(baseCore, __sceneMolOffset);
    var centerColor = __exampleAtomOverrides.core || coreColor.value;
    var ligandColors = Array.isArray(__exampleAtomOverrides.ligands) ? __exampleAtomOverrides.ligands : null;
    var bondKinds = Array.isArray(__exampleAtomOverrides.bonds) ? __exampleAtomOverrides.bonds : null;
    var atoms = [{ pos:centerPos, atom:{ color:colorize(centerColor, parseFloat(sat.value)||1), scale:90 * clamp(coreR/0.42, 0.8, 2.6), label:'' }, kind:'center', dir:[0,0,0], radius:coreR }];
    var bonds = [];
    var lps = [];
    G.lig.forEach(function(dir, idx){
      var pos = vAdd(rotXYZ(vMul(dir, bl), rot), __sceneMolOffset);
      var ligandColorValue = (ligandColors && ligandColors[idx]) ? ligandColors[idx] : ligandColor.value;
      var bondKindValue = (bondKinds && bondKinds[idx]) ? parseInt(bondKinds[idx],10) : (parseInt(bondType.value,10) || 1);
      atoms.push({ pos:pos, atom:{ color:colorize(ligandColorValue, parseFloat(sat.value)||1), scale:86 * clamp(ligR/0.34, 0.8, 2.3), label:'' }, kind:'ligand', dir:rotXYZ(dir, rot), radius:ligR });
      bonds.push({ a:centerPos, b:pos, kind:bondKindValue || 1, color:rgba('#d5deee', 0.96), opacity:1 });
    });
    G.lp.forEach(function(dir, idx){
      var dRot = rotXYZ(dir, rot);
      var lpOffset = Math.max(0.08, coreR * 0.18);
      var pos = vAdd(vMul(dRot, lpOffset), __sceneMolOffset);
      var seedKey = (geom && geom.value ? geom.value : 'lp') + '|' + idx + '|' + G.lp.length;
      var seed = 2166136261 >>> 0;
      for(var si=0;si<seedKey.length;si++){
        seed ^= seedKey.charCodeAt(si);
        seed = Math.imul(seed, 16777619) >>> 0;
      }
      lps.push({ pos:pos, dir:dRot, radius:lpR, color:colorize(lpColor.value, parseFloat(sat.value)||1), index:idx, count:G.lp.length, seed:seed || 1 });
    });
    return { atoms:atoms, bonds:bonds, lps:lps };
  }

  function balloonWorld(){
    var items=[];
    for(var i=0;i<__balloons.n;i++){
      var bi=i*3;
      var pos = [__balloons.pos[bi], __balloons.pos[bi+1], __balloons.pos[bi+2]];
      pos = vAdd(rotXYZ(pos, rot), __sceneBalloonOffset);
      var dir = rotXYZ([__balloons.dir[bi], __balloons.dir[bi+1], __balloons.dir[bi+2]], rot);
      var col = rgbToHex(Math.round(__balloons.col[bi]*255), Math.round(__balloons.col[bi+1]*255), Math.round(__balloons.col[bi+2]*255));
      items.push({ pos:pos, dir:dir, color:col, radius:__balloons.rad[bi+2] || 0.48, radii:[__balloons.rad[bi] || 0.32, __balloons.rad[bi+1] || 0.32, __balloons.rad[bi+2] || 0.48], index:i });
    }
    return items;
  }

  function buildWorld(){
    var mol = moleculeWorld();
    var balloons = __sceneSplit ? balloonWorld() : [];
    return { atoms:mol.atoms, bonds:mol.bonds, lps:mol.lps, balloons:balloons };
  }

  function getFrameBounds(points, anchor){
    var maxAbsRX = 0, maxAbsRY = 0;
    (points||[]).forEach(function(p){
      var rv = rotateCamera(vSub(p, anchor));
      maxAbsRX = Math.max(maxAbsRX, Math.abs(rv[0]));
      maxAbsRY = Math.max(maxAbsRY, Math.abs(rv[1]));
    });
    return {
      spanX: Math.max(0.4, maxAbsRX * 2),
      spanY: Math.max(0.4, maxAbsRY * 2)
    };
  }

  function getReferenceFramePoints(anchor){
    var points = [anchor];
    var G = currentGeomData || geomPositions(geom && geom.value ? geom.value : 'linear');
    var refBond = 0.625;
    var coreR = parseFloat(size.value) || 0.64;
    G.lig.forEach(function(dir){
      points.push(vAdd(rotXYZ(vMul(dir, refBond), rot), __sceneMolOffset));
    });
    G.lp.forEach(function(dir){
      var dRot = rotXYZ(dir, rot);
      var lpOffset = Math.max(0.08, coreR * 0.18);
      points.push(vAdd(vMul(dRot, lpOffset), __sceneMolOffset));
    });
    return points;
  }

  function applyAutoFraming(world){
    var framePoints=[];
    (world.atoms||[]).forEach(function(entry){ framePoints.push(entry.pos); });
    (world.lps||[]).forEach(function(entry){ framePoints.push(entry.pos); });
    (world.balloons||[]).forEach(function(entry){ framePoints.push(entry.pos); });
    if(!framePoints.length){ state.center=[0,0,0]; state.fitScale=110; state.screenOffset=[0,0]; return; }

    var anchor = [0,0,0];
    if(world.atoms && world.atoms.length && world.atoms[0] && world.atoms[0].pos){
      anchor = world.atoms[0].pos.slice ? world.atoms[0].pos.slice() : [world.atoms[0].pos[0], world.atoms[0].pos[1], world.atoms[0].pos[2]];
    } else if(world.balloons && world.balloons.length){
      anchor = getBalloonJoinWorld();
    }

    var frameWidth = (canvas.clientWidth||1) * (__sceneSplit ? 0.82 : 0.62);
    var frameHeight = (canvas.clientHeight||1) * 0.62;
    var actualBounds = getFrameBounds(framePoints, anchor);
    var referenceBounds = getFrameBounds(getReferenceFramePoints(anchor), anchor);
    var baseScale = Math.min(frameWidth/referenceBounds.spanX, frameHeight/referenceBounds.spanY) * 0.84;
    var safetyScale = Math.min(frameWidth/actualBounds.spanX, frameHeight/actualBounds.spanY) * 0.84;

    state.center = anchor;
    state.fitScale = __sceneSplit ? Math.min(baseScale, safetyScale) : baseScale;
    state.screenOffset = [0,0];
  }

  function clearAngleOverlay(){
    if(!angleCtx || !angleCanvas) return;
    angleCtx.clearRect(0, 0, angleCanvas.clientWidth || 0, angleCanvas.clientHeight || 0);
  }

  function clearCanvas(){
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if(__whiteMode){
      var g1 = ctx.createLinearGradient(0,0,0,h);
      g1.addColorStop(0,'#f5f8fc');
      g1.addColorStop(1,'#e8eef7');
      ctx.fillStyle = g1;
      ctx.fillRect(0,0,w,h);
      var glow1 = ctx.createRadialGradient(w*0.22,h*0.12,0,w*0.22,h*0.12,h*0.78);
      glow1.addColorStop(0,'rgba(97,134,220,.10)');
      glow1.addColorStop(1,'rgba(97,134,220,0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0,0,w,h);
    } else {
      var g = ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'#07111d');
      g.addColorStop(1,'#04070f');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,w,h);
      var glow = ctx.createRadialGradient(w*0.22,h*0.12,0,w*0.22,h*0.12,h*0.75);
      glow.addColorStop(0,'rgba(97,134,220,.18)');
      glow.addColorStop(1,'rgba(97,134,220,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0,0,w,h);
    }
  }

  function drawAxisArrow2D(fromX, fromY, toX, toY, color, label, opts){
    opts = opts || {};
    var dx = toX - fromX, dy = toY - fromY;
    var len = Math.hypot(dx, dy);
    if(len < 6) return;
    var ux = dx/len, uy = dy/len;
    var arrow = opts.arrowSize || 9;
    var wing = opts.wingSize || 4.2;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = __whiteMode ? 'rgba(255,255,255,.0)' : 'rgba(0,0,0,.26)';
    ctx.shadowBlur = opts.shadowBlur || 8;
    ctx.strokeStyle = color;
    ctx.lineWidth = opts.lineWidth || 2.4;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - ux * arrow - uy * wing, toY - uy * arrow + ux * wing);
    ctx.lineTo(toX - ux * arrow + uy * wing, toY - uy * arrow - ux * wing);
    ctx.closePath();
    ctx.fill();
    if(label){
      ctx.shadowBlur = 0;
      ctx.fillStyle = __whiteMode ? '#16325f' : '#f8fbff';
      ctx.font = '700 ' + (opts.fontSize || 13) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, toX + ux * (opts.labelOffset || 12), toY + uy * (opts.labelOffset || 12));
    }
    ctx.restore();
  }

  function drawCoordinateAxes(){
    if(!(showAxes && showAxes.checked)) return;
    var axisLen = __sceneSplit ? 1.55 : 1.95;
    var origin = getAxesOriginWorld();
    var axes = [
      { vec:[1,0,0], color:'rgba(255,114,122,.88)', label:'X' },
      { vec:[0,1,0], color:'rgba(111,255,183,.88)', label:'Y' },
      { vec:[0,0,1], color:'rgba(108,177,255,.9)', label:'Z' }
    ];
    axes.forEach(function(axis){
      var neg = project([origin[0]-axis.vec[0]*axisLen*0.72, origin[1]-axis.vec[1]*axisLen*0.72, origin[2]-axis.vec[2]*axisLen*0.72]);
      var pos = project([origin[0]+axis.vec[0]*axisLen, origin[1]+axis.vec[1]*axisLen, origin[2]+axis.vec[2]*axisLen]);
      var op = project(origin);
      ctx.save();
      ctx.strokeStyle = axis.color.replace('.88','.34').replace('.9','.34');
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(neg.x, neg.y);
      ctx.lineTo(op.x, op.y);
      ctx.stroke();
      ctx.restore();
      drawAxisArrow2D(op.x, op.y, pos.x, pos.y, axis.color, '', { lineWidth:2.6, arrowSize:11, wingSize:4.6, labelOffset:12 });
    });
  }

  function updateAxisLabels(){
    if(!(showAxes && showAxes.checked)){ setAxisLabelsVisible(false); return; }
    var origin = getAxesOriginWorld();
    var pts = {
      x:[origin[0]+2.35, origin[1], origin[2]],
      y:[origin[0], origin[1]+2.35, origin[2]],
      z:[origin[0], origin[1], origin[2]+2.35]
    };
    setAxisLabelsVisible(true);
    [['x',axisLabels.x],['y',axisLabels.y],['z',axisLabels.z]].forEach(function(item){
      var p = project(pts[item[0]]);
      var el = item[1];
      if(!p || !isFinite(p.x) || !isFinite(p.y)){ el.style.display='none'; return; }
      el.style.display='block';
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
    });
  }


  function normalizeSignedAngle(a){
    while(a <= -Math.PI) a += Math.PI * 2;
    while(a > Math.PI) a -= Math.PI * 2;
    return a;
  }

  function angleBetweenDeg(a, b){
    var na = vNorm(a);
    var nb = vNorm(b);
    return Math.acos(clamp(vDot(na, nb), -1, 1)) / DEG;
  }

  function formatAngleText(v){
    var rounded10 = Math.round(v * 10) / 10;
    var rounded100 = Math.round(v * 100) / 100;
    if(Math.abs(rounded10 - Math.round(rounded10)) < 0.05) return String(Math.round(rounded10)) + '°';
    if(Math.abs(rounded100 - rounded10) < 0.02) return String(rounded10).replace('.', ',') + '°';
    return String(rounded100).replace('.', ',') + '°';
  }

  function shouldApproximateAngleLabels(){
    var G = currentGeomData || geomPositions(geom && geom.value ? geom.value : 'linear');
    return !!(G && G.lp && G.lp.length);
  }

  var __angleVisibility = {};
  var __currentAngleEntries = [];
  var __angleLegendSignature = '';

  function getAngleStoreKey(entry){
    return (geom && geom.value ? geom.value : 'geom') + '|' + entry.id;
  }

  function isAngleEntryVisible(entry){
    var key = getAngleStoreKey(entry);
    return __angleVisibility[key] !== false;
  }

  function setAngleEntryVisible(entry, visible){
    __angleVisibility[getAngleStoreKey(entry)] = !!visible;
  }

  function buildAngleEntries(world){
    var atoms = world && world.atoms ? world.atoms : [];
    if(!atoms.length) return [];
    var center = atoms[0].pos;
    var ligands = atoms.filter(function(entry){ return entry.kind === 'ligand'; });
    var pairs = getAnglePairs(ligands);
    if(!pairs.length) return [];
    var duplicates = {};
    return pairs.map(function(pair, idx){
      var a = ligands[pair[0]];
      var b = ligands[pair[1]];
      if(!a || !b) return null;
      var value = angleBetweenDeg(vSub(a.pos, center), vSub(b.pos, center));
      var label = (shouldApproximateAngleLabels() ? '≈' : '') + formatAngleText(value);
      duplicates[label] = (duplicates[label] || 0) + 1;
      return {
        id: 'p' + pair[0] + '-' + pair[1],
        pair: pair,
        idx: idx,
        a: a,
        b: b,
        value: value,
        label: label,
        color: getAnglePaletteColor(idx),
        duplicateIndex: duplicates[label]
      };
    }).filter(Boolean);
  }

  function getAngleLegendLabel(entry, entries){
    var repeated = 0;
    for(var i=0;i<entries.length;i++) if(entries[i].label === entry.label) repeated++;
    return repeated > 1 ? entry.label + ' · ' + entry.duplicateIndex : entry.label;
  }

  function updateAngleLegend(entries){
    if(!angleLegendPanel) return;
    entries = entries || [];
    angleLegendPanel.classList.toggle('is-master-off', !!(showAngles && !showAngles.checked));
    if(!entries.length){
      if(__angleLegendSignature !== 'empty'){
        angleLegendPanel.innerHTML = '<div class="angleLegendTitle">Ângulos</div><div class="angleLegendEmpty">Sem ângulos visíveis nessa geometria.</div>';
        __angleLegendSignature = 'empty';
      }
      return;
    }
    var sig = entries.map(function(entry){ return [entry.id, entry.label, isAngleEntryVisible(entry) ? 1 : 0, entry.color].join(':'); }).join('|') + '|m=' + ((showAngles && showAngles.checked) ? 1 : 0);
    if(sig === __angleLegendSignature) return;
    __angleLegendSignature = sig;
    angleLegendPanel.innerHTML = '';
    var title = document.createElement('div');
    title.className = 'angleLegendTitle';
    title.textContent = 'Ângulos';
    angleLegendPanel.appendChild(title);
    var list = document.createElement('div');
    list.className = 'angleLegendList';
    entries.forEach(function(entry){
      var row = document.createElement('label');
      row.className = 'angleLegendItem';
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isAngleEntryVisible(entry);
      checkbox.dataset.angleId = entry.id;
      checkbox.addEventListener('input', function(ev){
        var target = ev.currentTarget;
        var id = target && target.dataset ? target.dataset.angleId : '';
        for(var i=0;i<__currentAngleEntries.length;i++){
          if(__currentAngleEntries[i].id === id){
            setAngleEntryVisible(__currentAngleEntries[i], !!target.checked);
            __angleLegendSignature = '';
            requestRender();
            break;
          }
        }
      });
      var swatch = document.createElement('span');
      swatch.className = 'angleLegendSwatch';
      swatch.style.background = entry.color;
      var textWrap = document.createElement('span');
      textWrap.className = 'angleLegendText';
      var value = document.createElement('span');
      value.className = 'angleLegendValue';
      value.textContent = getAngleLegendLabel(entry, entries);
      var meta = document.createElement('span');
      meta.className = 'angleLegendMeta';
      meta.textContent = 'Ocultar este ângulo';
      textWrap.appendChild(value);
      textWrap.appendChild(meta);
      row.appendChild(checkbox);
      row.appendChild(swatch);
      row.appendChild(textWrap);
      list.appendChild(row);
    });
    angleLegendPanel.appendChild(list);
  }

  function getAnglePaletteColor(idx){
    var palette = ['#4cc9f0','#f72585','#ffd166','#06d6a0','#ef476f','#118ab2','#ff9f1c','#8338ec','#8ac926','#ff595e'];
    return palette[((idx % palette.length) + palette.length) % palette.length];
  }

  function hexToRgb(hex){
    var clean = String(hex || '').replace('#','').trim();
    if(clean.length === 3) clean = clean.split('').map(function(ch){ return ch + ch; }).join('');
    if(clean.length !== 6) return {r:255,g:255,b:255};
    var num = parseInt(clean, 16);
    if(!isFinite(num)) return {r:255,g:255,b:255};
    return {r:(num >> 16) & 255, g:(num >> 8) & 255, b:num & 255};
  }

  function rgbaFromHex(hex, alpha){
    var rgb = hexToRgb(hex);
    return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')';
  }

  function drawAngleChip(x, y, text, color){
    if(!angleCtx) return;
    var accent = color || '#4cc9f0';
    angleCtx.save();
    angleCtx.font = '700 12px Inter, sans-serif';
    angleCtx.textAlign = 'center';
    angleCtx.textBaseline = 'middle';
    var padX = 8;
    var padY = 5;
    var tw = angleCtx.measureText(text).width;
    var w = tw + padX * 2;
    var h = 22;
    var r = 11;
    angleCtx.beginPath();
    angleCtx.moveTo(x - w * 0.5 + r, y - h * 0.5);
    angleCtx.arcTo(x + w * 0.5, y - h * 0.5, x + w * 0.5, y + h * 0.5, r);
    angleCtx.arcTo(x + w * 0.5, y + h * 0.5, x - w * 0.5, y + h * 0.5, r);
    angleCtx.arcTo(x - w * 0.5, y + h * 0.5, x - w * 0.5, y - h * 0.5, r);
    angleCtx.arcTo(x - w * 0.5, y - h * 0.5, x + w * 0.5, y - h * 0.5, r);
    angleCtx.closePath();
    angleCtx.fillStyle = __whiteMode ? rgbaFromHex(accent, .13) : 'rgba(7,12,22,.82)';
    angleCtx.strokeStyle = __whiteMode ? rgbaFromHex(accent, .78) : rgbaFromHex(accent, .96);
    angleCtx.lineWidth = 1.4;
    angleCtx.fill();
    angleCtx.stroke();
    angleCtx.fillStyle = __whiteMode ? accent : '#f4f9ff';
    angleCtx.fillText(text, x, y + 0.5);
    angleCtx.restore();
  }

  function getAnglePairs(ligands){
    var n = ligands.length;
    if(n < 2) return [];
    var presets = {
      linear:[[0,1]],
      trigonal_planar:[[0,1],[1,2],[2,0]],
      tetrahedral:[[0,1],[0,2],[0,3]],
      trigonal_bipyramidal:[[0,1],[0,3],[3,4]],
      octahedral:[[0,2],[0,1],[0,4]],
      bent_tp:[[0,1]],
      trigonal_pyramidal:[[0,1],[1,2],[2,0]],
      bent_tet:[[0,1]],
      see_saw:[[0,1],[0,2],[2,3]],
      t_shaped:[[0,1],[0,2],[1,2]],
      linear_tbp:[[0,1]],
      square_pyramidal:[[0,2],[0,1],[0,4]],
      square_planar:[[0,2],[0,1]]
    };
    var chosen = presets[geom && geom.value ? geom.value : ''] || [];
    if(!chosen.length){
      if(n === 2) chosen = [[0,1]];
      else if(n === 3) chosen = [[0,1],[1,2],[2,0]];
      else chosen = [[0,1],[0,2],[0,n-1]];
    }
    var seen = {};
    return chosen.filter(function(pair){
      if(!pair || pair.length < 2) return false;
      var a = pair[0] | 0, b = pair[1] | 0;
      if(a === b || a < 0 || b < 0 || a >= n || b >= n) return false;
      var key = a < b ? a + ':' + b : b + ':' + a;
      if(seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function drawAnglesOverlay(world){
    clearAngleOverlay();
    __currentAngleEntries = buildAngleEntries(world);
    updateAngleLegend(__currentAngleEntries);
    if(!(showAngles && showAngles.checked) || !angleCtx || !world || !world.atoms || !world.atoms.length) return;
    var center = world.atoms[0].pos;
    if(!__currentAngleEntries.length) return;
    var centerP = project(center);
    if(!centerP || !isFinite(centerP.x) || !isFinite(centerP.y)) return;

    angleCtx.save();
    angleCtx.lineWidth = 2;
    angleCtx.lineCap = 'round';
    angleCtx.lineJoin = 'round';

    __currentAngleEntries.forEach(function(entry, idx){
      if(!isAngleEntryVisible(entry)) return;
      var accent = entry.color || getAnglePaletteColor(idx);
      angleCtx.strokeStyle = __whiteMode ? rgbaFromHex(accent, .88) : rgbaFromHex(accent, .96);
      var a = entry.a;
      var b = entry.b;
      if(!a || !b) return;
      var pa = project(a.pos);
      var pb = project(b.pos);
      if(!pa || !pb || !isFinite(pa.x) || !isFinite(pa.y) || !isFinite(pb.x) || !isFinite(pb.y)) return;
      var va = [pa.x - centerP.x, pa.y - centerP.y];
      var vb = [pb.x - centerP.x, pb.y - centerP.y];
      var la = Math.hypot(va[0], va[1]);
      var lb = Math.hypot(vb[0], vb[1]);
      if(la < 14 || lb < 14) return;

      var ang1 = Math.atan2(va[1], va[0]);
      var diff = normalizeSignedAngle(Math.atan2(vb[1], vb[0]) - ang1);
      if(Math.abs(diff) < 0.10) return;

      var available = Math.min(la, lb) - 16;
      var radius = clamp(Math.min(la, lb) * 0.34 + idx * 10, 18, Math.max(18, Math.min(available, 74)));
      var endAng = ang1 + diff;

      angleCtx.beginPath();
      angleCtx.arc(centerP.x, centerP.y, radius, ang1, endAng, diff < 0);
      angleCtx.stroke();

      var sx1 = centerP.x + Math.cos(ang1) * (radius - 6);
      var sy1 = centerP.y + Math.sin(ang1) * (radius - 6);
      var ex1 = centerP.x + Math.cos(ang1) * (radius + 6);
      var ey1 = centerP.y + Math.sin(ang1) * (radius + 6);
      var sx2 = centerP.x + Math.cos(endAng) * (radius - 6);
      var sy2 = centerP.y + Math.sin(endAng) * (radius - 6);
      var ex2 = centerP.x + Math.cos(endAng) * (radius + 6);
      var ey2 = centerP.y + Math.sin(endAng) * (radius + 6);
      angleCtx.beginPath();
      angleCtx.moveTo(sx1, sy1); angleCtx.lineTo(ex1, ey1);
      angleCtx.moveTo(sx2, sy2); angleCtx.lineTo(ex2, ey2);
      angleCtx.stroke();

      var mid = ang1 + diff * 0.5;
      var labelRadius = radius + 17 + (idx % 2) * 4;
      drawAngleChip(centerP.x + Math.cos(mid) * labelRadius, centerP.y + Math.sin(mid) * labelRadius, entry.label, accent);
    });

    angleCtx.restore();
  }


  var miniWrap = document.getElementById('miniAxesWrap');
  var miniCanvas = document.getElementById('miniAxes');
  var miniCtx = miniCanvas ? miniCanvas.getContext('2d') : null;
  function miniResize(){
    if(!miniCanvas || !miniCtx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = miniCanvas.clientWidth || 180;
    var h = miniCanvas.clientHeight || 180;
    if(miniCanvas.width !== Math.round(w*dpr) || miniCanvas.height !== Math.round(h*dpr)){
      miniCanvas.width = Math.round(w*dpr);
      miniCanvas.height = Math.round(h*dpr);
    }
    miniCtx.setTransform(dpr,0,0,dpr,0,0);
  }
  miniResize();
  try{ if(window.ResizeObserver && miniWrap){ new ResizeObserver(miniResize).observe(miniWrap); } }catch(_e){}

  function drawMiniAxes(){
    if(!miniCtx || !miniWrap){
      if(miniWrap) miniWrap.style.display = 'none';
      return;
    }
    miniWrap.style.display = 'block';
    miniResize();
    var w = miniCanvas.clientWidth || 180;
    var h = miniCanvas.clientHeight || 180;
    miniCtx.clearRect(0,0,w,h);
    var g = miniCtx.createRadialGradient(w*0.35,h*0.35,10,w*0.5,h*0.55,Math.max(w,h)*0.80);
    g.addColorStop(0,__whiteMode ? 'rgba(80,120,220,.08)' : 'rgba(255,255,255,.06)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    miniCtx.fillStyle = g;
    miniCtx.fillRect(0,0,w,h);
    var originX = w*0.5, originY = h*0.55;
    var axes = [
      { vec:[1,0,0], color:'rgba(255,114,122,.95)', label:'X' },
      { vec:[0,1,0], color:'rgba(111,255,183,.95)', label:'Y' },
      { vec:[0,0,1], color:'rgba(108,177,255,.98)', label:'Z' }
    ].map(function(axis){
      var rv = rotateCamera(axis.vec);
      var dir = [rv[0], -rv[1]];
      var len = Math.hypot(dir[0], dir[1]) || 1;
      return { vec:axis.vec, color:axis.color, label:axis.label, z:rv[2], dir:[dir[0]/len, dir[1]/len] };
    }).sort(function(a,b){ return a.z - b.z; });
    miniCtx.save();
    miniCtx.fillStyle = __whiteMode ? 'rgba(255,255,255,.80)' : 'rgba(5,11,24,.72)';
    miniCtx.strokeStyle = __whiteMode ? 'rgba(91,124,176,.20)' : 'rgba(132,176,255,.22)';
    miniCtx.lineWidth = 1;
    roundedRectMini(16,16,w-32,h-32,18);
    miniCtx.fill();
    miniCtx.stroke();
    axes.forEach(function(axis){
      var len = 34;
      var endX = originX + axis.dir[0] * len;
      var endY = originY + axis.dir[1] * len;
      drawAxisArrow2DMini(miniCtx, originX, originY, endX, endY, axis.color, axis.label, __whiteMode);
    });
    miniCtx.fillStyle = __whiteMode ? 'rgba(24,50,95,.95)' : 'rgba(233,244,255,.95)';
    miniCtx.beginPath(); miniCtx.arc(originX, originY, 3.5, 0, Math.PI*2); miniCtx.fill();
    miniCtx.restore();
  }
  function roundedRectMini(x,y,w,h,r){
    var radius = Math.max(0, Math.min(r, Math.min(w,h)*0.5));
    miniCtx.beginPath();
    miniCtx.moveTo(x+radius,y);
    miniCtx.arcTo(x+w,y,x+w,y+h,radius);
    miniCtx.arcTo(x+w,y+h,x,y+h,radius);
    miniCtx.arcTo(x,y+h,x,y,radius);
    miniCtx.arcTo(x,y,x+w,y,radius);
    miniCtx.closePath();
  }
  function drawAxisArrow2DMini(targetCtx, fromX, fromY, toX, toY, color, label, whiteMode){
    var dx=toX-fromX, dy=toY-fromY; var len=Math.hypot(dx,dy); if(len<6) return;
    var ux=dx/len, uy=dy/len, arrow=9, wing=4;
    targetCtx.save();
    targetCtx.lineCap='round';
    targetCtx.lineJoin='round';
    targetCtx.strokeStyle=color; targetCtx.lineWidth=2.4;
    targetCtx.beginPath(); targetCtx.moveTo(fromX,fromY); targetCtx.lineTo(toX,toY); targetCtx.stroke();
    targetCtx.fillStyle=color;
    targetCtx.beginPath();
    targetCtx.moveTo(toX,toY);
    targetCtx.lineTo(toX-ux*arrow-uy*wing,toY-uy*arrow+ux*wing);
    targetCtx.lineTo(toX-ux*arrow+uy*wing,toY-uy*arrow-ux*wing);
    targetCtx.closePath(); targetCtx.fill();
    targetCtx.fillStyle = whiteMode ? '#16325f' : '#f8fbff';
    targetCtx.font='700 12px Inter, sans-serif';
    targetCtx.textAlign='center'; targetCtx.textBaseline='middle';
    targetCtx.fillText(label, toX + ux*10, toY + uy*10);
    targetCtx.restore();
  }

  function drawBondWorld(bd){
    var p1 = project(bd.a), p2 = project(bd.b);
    var dx = p2.x-p1.x, dy = p2.y-p1.y;
    var len = Math.hypot(dx,dy) || 1;
    var nx = -dy/len, ny = dx/len;
    var count = clamp(parseInt(bd.kind,10)||1,1,3);
    var zoomScale = getScreenZoomScale();
    var spacing = Math.max(3.4, (parseFloat(bondRadius.value)||0.085) * 38 * zoomScale);
    var lw = Math.max(1.4, (parseFloat(bondRadius.value)||0.085) * 24 * 0.92 * zoomScale);
    var offsets = count===1 ? [0] : (count===2 ? [-spacing*0.5, spacing*0.5] : [-spacing,0,spacing]);
    ctx.save();
    ctx.globalAlpha = clamp(bd.opacity == null ? 1 : bd.opacity, 0, 1);
    ctx.strokeStyle = bd.color || 'rgba(255,255,255,.96)';
    ctx.lineCap='round';
    ctx.shadowBlur = __whiteMode ? 0 : 10;
    ctx.shadowColor = __whiteMode ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,.20)';
    offsets.forEach(function(off){
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(p1.x + nx*off, p1.y + ny*off);
      ctx.lineTo(p2.x + nx*off, p2.y + ny*off);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawGlossySphere(p, radiusPx, colorHex, opacity){
    var base = radiusPx;
    var g = ctx.createRadialGradient(p.x-base*0.36, p.y-base*0.4, base*0.12, p.x, p.y, base);
    g.addColorStop(0, shade(colorHex, 0.56));
    g.addColorStop(0.58, shade(colorHex, 0.08));
    g.addColorStop(1, shade(colorHex, -0.44));
    ctx.save();
    ctx.globalAlpha = clamp(opacity == null ? 1 : opacity, 0, 1);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, base, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = __whiteMode ? 'rgba(70,90,130,.42)' : 'rgba(6,9,16,.66)';
    ctx.lineWidth = Math.max(1, base * 0.08);
    ctx.stroke();
    ctx.restore();
  }

  function drawAtomWorld(entry){
    var p = project(entry.pos);
    var atom = entry.atom;
    var atomScale = clamp((Number(atom.scale) || 90) / 90, 0.35, 2.4);
    var base = 10.5 * atomScale * getScreenZoomScale();
    drawGlossySphere(p, base, atom.color || '#c4b5fd', atom.opacity == null ? 1 : atom.opacity);
  }

  function __lpSeed(entry){
    if(entry && isFinite(entry.seed)) return (entry.seed >>> 0) || 1;
    var idx = entry && isFinite(entry.index) ? entry.index : 0;
    var count = entry && isFinite(entry.count) ? entry.count : 1;
    var g = (geom && geom.value ? geom.value : 'lp') + '|' + idx + '|' + count;
    var n = 2166136261 >>> 0;
    for(var i=0;i<g.length;i++){
      n ^= g.charCodeAt(i);
      n = Math.imul(n, 16777619) >>> 0;
    }
    return n || 1;
  }

  function __seededRand(seed){
    var s = (seed >>> 0) || 1;
    return function(){
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function drawElectronPointCloud(center, dirWorld, base, colorHex, opacity, seed, axisOverride, flatCircle){
    var along;
    if(flatCircle){
      along = [0, -1];
    }else if(axisOverride && isFinite(axisOverride[0]) && isFinite(axisOverride[1])){
      along = [axisOverride[0], axisOverride[1]];
    }else{
      var dir2 = rotateCamera(dirWorld || [0,0,1]);
      along = [dir2[0] || 1, -(dir2[1] || 0)];
    }
    var alongLen = Math.hypot(along[0], along[1]) || 1;
    along = [along[0]/alongLen, along[1]/alongLen];
    var perp = [-along[1], along[0]];

    var major = base * (flatCircle ? 1.12 : 1.42);
    var minor = base * (flatCircle ? 1.12 : 0.86);
    var dotCount = Math.round(clamp(base * 7.2, 52, 118));
    var rand = __seededRand(seed || 1);
    var core = shade(colorHex, __whiteMode ? -0.18 : 0.08);
    var rim = shade(colorHex, __whiteMode ? 0.12 : 0.32);

    ctx.save();
    ctx.globalAlpha = clamp(opacity == null ? 1 : opacity, 0, 1);

    var haze = ctx.createRadialGradient(center.x, center.y, base * 0.12, center.x, center.y, major * 1.12);
    haze.addColorStop(0, rgba(colorHex, __whiteMode ? 0.16 : 0.20));
    haze.addColorStop(0.62, rgba(colorHex, __whiteMode ? 0.08 : 0.10));
    haze.addColorStop(1, rgba(colorHex, 0));
    ctx.fillStyle = haze;
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, major * 1.04, major * 1.04, 0, 0, Math.PI * 2);
    ctx.fill();

    for(var i=0;i<dotCount;i++){
      var t = rand() * Math.PI * 2;
      var rr = Math.sqrt(rand());
      var a = Math.cos(t) * major * rr;
      var b = Math.sin(t) * minor * rr;
      var x = center.x + perp[0] * a + along[0] * b;
      var y = center.y + perp[1] * a + along[1] * b;
      var w = 1 - rr;
      var r = 0.65 + rand() * 1.3 + w * 0.75;
      ctx.fillStyle = (i % 7 === 0) ? rgba(rim, 0.55 + w * 0.35) : rgba(core, 0.34 + w * 0.42);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function getFixedLPAxis2(entry){
    var count = Math.max(1, entry && entry.count ? entry.count : 1);
    var idx = Math.max(0, entry && isFinite(entry.index) ? entry.index : 0);
    var presets = {
      bent_tp: [[0,-1]],
      trigonal_pyramidal: [[0,-1]],
      square_pyramidal: [[0,-1]],
      bent_tet: [[-0.82,-0.58],[0.82,-0.58]],
      t_shaped: [[-0.92,-0.24],[0.92,-0.24]],
      square_planar: [[-0.78,-0.58],[0.78,-0.58]],
      see_saw: [[0.96,0]],
      linear_tbp: [[0,-1],[-0.86,-0.34],[0.86,-0.34]]
    };
    var layout = presets[geom && geom.value ? geom.value : ''] || null;
    if(!layout || layout.length !== count){
      if(count === 1) layout = [[0,-1]];
      else if(count === 2) layout = [[-0.82,-0.58],[0.82,-0.58]];
      else if(count === 3) layout = [[0,-1],[-0.86,-0.34],[0.86,-0.34]];
      else layout = [[0,-1]];
    }
    var axis2 = layout[Math.min(idx, layout.length-1)] || layout[0] || [0,-1];
    var axisLen = Math.hypot(axis2[0], axis2[1]) || 1;
    return [axis2[0] / axisLen, axis2[1] / axisLen];
  }

  function drawLonePair(entry){
    var base = 13.2 * clamp(entry.radius / 0.24, 0.82, 1.9) * getScreenZoomScale();
    var dirWorld = (entry && entry.dir) ? entry.dir : [0,0,1];
    var coreR = parseFloat(size.value) || 0.64;
    var attachWorld = Math.max(0.08, coreR * 0.18);
    var centerWorld = vAdd(__sceneMolOffset, vMul(vNorm(dirWorld), attachWorld));
    var p = project(centerWorld);
    if(!p || !isFinite(p.x) || !isFinite(p.y)) return;

    drawElectronPointCloud(
      p,
      dirWorld,
      base * 1.04,
      entry.color || '#5f7dff',
      geom.value==='square_planar' ? 0.58 : 0.94,
      __lpSeed(entry),
      null,
      true
    );
  }

  function drawBalloonWorld(entry){
    var p = project(entry.pos);
    if(!p || !isFinite(p.x) || !isFinite(p.y)) return;
    var radii = entry.radii || [0.32,0.32,0.48];
    var sx = clamp((radii[0] || 0.32) / 0.32, 0.45, 3);
    var sy = clamp((radii[1] || 0.32) / 0.32, 0.45, 3);
    var sz = clamp((radii[2] || 0.48) / 0.48, 0.45, 3);
    var base = 18 * clamp((sx + sy + sz) / 3, 0.72, 2.15) * getScreenZoomScale();
    var joinP = project(getBalloonJoinWorld());
    var tip = joinP ? { x:joinP.x, y:joinP.y } : { x:p.x, y:p.y + base*1.55 };
    var vx = tip.x - p.x, vy = tip.y - p.y;
    var dist = Math.hypot(vx, vy) || 1;
    var ang = Math.atan2(vy, vx) - Math.PI * 0.5;
    var rx = base * 0.88 * sx * (0.92 + (sz-1)*0.14);
    var ry = base * 1.04 * sy * (0.92 + (sz-1)*0.14);
    var neckY = Math.max(ry * 0.78, dist * Math.min(0.78, 0.56 + sz*0.08));
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(ang);
    ctx.globalAlpha = 0.92;
    var g = ctx.createRadialGradient(-rx*0.34, -ry*0.46, base*0.12, 0, 0, base*1.08);
    g.addColorStop(0, shade(entry.color, 0.52));
    g.addColorStop(0.58, shade(entry.color, 0.06));
    g.addColorStop(1, shade(entry.color, -0.32));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, dist);
    ctx.bezierCurveTo(-rx*0.16, dist*0.94, -rx*0.74, neckY*1.02, -rx*0.88, neckY*0.54);
    ctx.bezierCurveTo(-rx*1.02, ry*0.18, -rx*0.96, -ry*0.58, -rx*0.34, -ry*0.96);
    ctx.bezierCurveTo(-rx*0.12, -ry*1.08, rx*0.12, -ry*1.08, rx*0.34, -ry*0.96);
    ctx.bezierCurveTo(rx*0.96, -ry*0.58, rx*1.02, ry*0.18, rx*0.88, neckY*0.54);
    ctx.bezierCurveTo(rx*0.74, neckY*1.02, rx*0.16, dist*0.94, 0, dist);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    ctx.beginPath();
    ctx.ellipse(-rx*0.30, -ry*0.34, rx*0.20, ry*0.22, -0.12, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = __whiteMode ? 'rgba(126,140,178,.62)' : 'rgba(255,255,255,.58)';
    var knotInset = Math.min(base*0.32 * sz, dist*0.18);
    ctx.beginPath();
    ctx.moveTo(0, dist);
    ctx.lineTo(-rx*0.18, dist - knotInset);
    ctx.lineTo(rx*0.18, dist - knotInset);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawBalloonJoin(){
    return;
  }

  var __lpPulseStart = -1;
  var __lpPulseDur = 900;
  var __lpHold = 0;
  var __lastGeomKey = geom.value;
  function __startLPPulse(){ __lpPulseStart = performance.now(); __lpHold = 0; }

  function autoDist(){
    var refBond = 0.625;
    var R = Math.max(parseFloat(size.value)||0.64, parseFloat(ligandRadius.value)||0.44) + refBond + 0.9;
    return Math.min(10, Math.max(3.2, R*1.62));
  }

  function sync(){
    currentGeomData = geomPositions(geom.value);
    var __geomChanged = (geom.value !== __lastGeomKey);
    if(__geomChanged){
      __lastGeomKey = geom.value;
      if(currentGeomData.lp && currentGeomData.lp.length>0 && !(currentGeomData.lp.length===2 && currentGeomData.lig.length===4)) __startLPPulse();
      else { __lpPulseStart=-1; __lpHold=0; }
    }
    var __lb = (typeof __whiteMode!=='undefined') ? !!__whiteMode : !!((ui.lightBgQuick && ui.lightBgQuick.checked) || (ui.lightBg && ui.lightBg.checked) || (tutorialLightBg && tutorialLightBg.checked));
    if(ui.lightBg) ui.lightBg.checked = __lb;
    if(ui.lightBgQuick) ui.lightBgQuick.checked = __lb;
    if(tutorialLightBg) tutorialLightBg.checked = __lb;
    document.body.classList.toggle('lightBg', __lb);
    infoName.textContent = geom.options[geom.selectedIndex].textContent.split('(')[0].trim();
    infoArr.textContent = currentGeomData.arr;
    infoIdeal.textContent = currentGeomData.ideal;
    document.getElementById('hud').innerHTML = '<b>' + currentGeomData.label + '</b> · <span class="small">' + currentGeomData.arr + ' - ' + currentGeomData.ideal + '</span>';
    setAxisLabelsVisible(showAxes.checked);
    requestRender();
  }

  function draw(){
    __drawRequested = false;
    resize();
    clearCanvas();
    clearAngleOverlay();
    var world = buildWorld();
    applyAutoFraming(world);
    drawCoordinateAxes();
    var items=[];
    (world.balloons||[]).forEach(function(entry){ items.push({ type:'balloon', z:rotateCamera(vSub(entry.pos, state.center))[2], order:0, data:entry }); });
    (world.bonds||[]).forEach(function(bd){ items.push({ type:'bond', z:(rotateCamera(vSub(bd.a,state.center))[2]+rotateCamera(vSub(bd.b,state.center))[2])*0.5, order:1, data:bd }); });
    (world.lps||[]).forEach(function(entry, idx){
      var z = rotateCamera(vSub(entry.pos, state.center))[2];
      var pulse = __lpHold || 0;
      if(__lpPulseStart>=0){
        var now = performance.now();
        var tt = (now-__lpPulseStart) / __lpPulseDur;
        if(tt>=1){ __lpPulseStart=-1; __lpHold=1; pulse=1; }
        else { pulse = 1 - Math.pow(1-clamp(tt,0,1),3); __lpHold = pulse; requestRender(); }
      }
      entry.radius = entry.radius * (geom.value==='square_planar' ? 1 : (1 + (idx%2===0 ? 0.08 : 0.12) * pulse));
      items.push({ type:'lp', z:z, order:2, data:entry });
    });
    (world.atoms||[]).forEach(function(entry){ items.push({ type:'atom', z:rotateCamera(vSub(entry.pos, state.center))[2], order:3, data:entry }); });
    items.sort(function(a,b){ return (a.z - b.z) || ((a.order||0)-(b.order||0)); });
    items.forEach(function(item){
      if(item.type==='bond') drawBondWorld(item.data);
      else if(item.type==='atom') drawAtomWorld(item.data);
      else if(item.type==='lp') drawLonePair(item.data);
      else if(item.type==='balloon') drawBalloonWorld(item.data);
    });
    drawBalloonJoin();
    drawAnglesOverlay(world);
    drawMiniAxes();
    updateAxisLabels();
    if(typeof window.__geomTutorialOnDraw === 'function'){
      try{ window.__geomTutorialOnDraw(); }catch(_e){}
    }
  }

  var __tutorialTweenId = 0;
  function __lerp(a,b,t){ return a + (b-a)*t; }
  function __ease(t){ return t<.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function __setObjRotDeg(x,y,z){
    var zIn = (z==null?0:Number(z));
    var zx = (((zIn||0)%360)+360)%360;
    rot.x=(x||0)*DEG;
    rot.y=(y||0)*DEG;
    rot.z=zx*DEG;
    if(rotXS) rotXS.value=String(Math.round((x||0)));
    if(rotYS) rotYS.value=String(Math.round((y||0)));
    if(rotZS) rotZS.value=String(Math.round(zx));
    if(tutorialRotZVal) tutorialRotZVal.textContent = Math.round(zx)+'°';
  }
  function __animateView(opts,dur){
    opts = opts || {};
    dur = Math.max(0, dur||900);
    var id = ++__tutorialTweenId;
    var s = { camDist:camDist, rotX:rotX, rotY:rotY, ox:rot.x, oy:rot.y, oz:rot.z };
    var e = {
      camDist: ('camDist' in opts)? __clamp(opts.camDist, 2.2, 14) : s.camDist,
      rotX: ('rotX' in opts)? __clamp(opts.rotX, -Math.PI/2+.05, Math.PI/2-.05) : s.rotX,
      rotY: ('rotY' in opts)? opts.rotY : s.rotY,
      ox: ('objRotXDeg' in opts)? (opts.objRotXDeg||0)*DEG : s.ox,
      oy: ('objRotYDeg' in opts)? (opts.objRotYDeg||0)*DEG : s.oy,
      oz: ('objRotZDeg' in opts)? ((((opts.objRotZDeg||0)%360)+360)%360)*DEG : s.oz
    };
    if(dur===0){ camDist=e.camDist; rotX=e.rotX; rotY=e.rotY; rot.x=e.ox; rot.y=e.oy; rot.z=e.oz; requestRender(); return Promise.resolve(); }
    return new Promise(function(resolve){
      var t0 = performance.now();
      function step(now){
        if(id!==__tutorialTweenId){ resolve(false); return; }
        var t = (now-t0)/dur; if(t<0)t=0; if(t>1)t=1; t=__ease(t);
        camDist = __lerp(s.camDist, e.camDist, t);
        rotX = __lerp(s.rotX, e.rotX, t);
        rotY = __wrapAngle(__lerp(s.rotY, e.rotY, t));
        rot.x = __lerp(s.ox, e.ox, t);
        rot.y = __lerp(s.oy, e.oy, t);
        rot.z = __lerp(s.oz, e.oz, t);
        requestRender();
        if(t<1) requestAnimationFrame(step); else resolve(true);
      }
      requestAnimationFrame(step);
    });
  }

  sync();
  camDist = autoDist();
  requestRender();

  window.__geomTutorialAPI = {
    ui: ui,
    sync: sync,
    setGeom: function(v){ if(v && geom && geom.querySelector('option[value="'+v+'"]')){ geom.value=v; sync(); } },
    setAxes: function(v){ if(showAxes){ showAxes.checked=!!v; sync(); } },
    setLPScale: function(v){ if(lpScale && isFinite(v)){ lpScale.value=String(v); sync(); } },
    setBoardSplit: function(v){ __setBoardSplit(!!v); },
    setBalloons: function(n){
      var map={2:'linear',3:'trigonal_planar',4:'tetrahedral',5:'trigonal_bipyramidal',6:'octahedral'};
      var key=map[n|0]||'';
      if(!key){ __setBalloons3D(0,null); return; }
      var G=geomPositions(key);
      __setBalloons3D(n|0, G.lig);
    },
    setBalloonScales: function(scales){
      __setBalloonScales(scales);
      if(__balloons && __balloons.n>0){
        var map={2:'linear',3:'trigonal_planar',4:'tetrahedral',5:'trigonal_bipyramidal',6:'octahedral'};
        var key=map[__balloons.n|0]||'';
        if(key){
          var G=geomPositions(key);
          __setBalloons3D(__balloons.n|0, G.lig);
          return;
        }
      }
      requestRender();
    },
    getBalloonScales: function(){
      return __balloonScaleCfg.map(function(s){ return { x:s.x, y:s.y, z:s.z }; });
    },
    clearBalloons: function(){ __setBalloons3D(0,null); },
    setObjRotDeg: __setObjRotDeg,
    getView: function(){ return { camDist:camDist, rotX:rotX, rotY:rotY, objRotXDeg:rot.x/DEG, objRotYDeg:rot.y/DEG, objRotZDeg:rot.z/DEG }; },
    setView: function(o){ o=o||{}; if('camDist' in o) camDist=__clamp(o.camDist,2.2,14); if('rotX' in o) rotX=__clamp(o.rotX,-Math.PI/2+.05,Math.PI/2-.05); if('rotY' in o) rotY=__wrapAngle(o.rotY); if(('objRotXDeg' in o)||('objRotYDeg' in o)||('objRotZDeg' in o)) __setObjRotDeg(o.objRotXDeg||0,o.objRotYDeg||0,o.objRotZDeg||0); requestRender(); },
    animateTo: __animateView,
    requestRender: requestRender,
    setAtomOverrides: function(o){
      o = o || {};
      __exampleAtomOverrides.core = o.core || null;
      __exampleAtomOverrides.ligands = Array.isArray(o.ligands) ? o.ligands.slice() : null;
      __exampleAtomOverrides.bonds = Array.isArray(o.bonds) ? o.bonds.slice() : null;
      sync();
    },
    clearAtomOverrides: function(){
      __exampleAtomOverrides.core = null;
      __exampleAtomOverrides.ligands = null;
      __exampleAtomOverrides.bonds = null;
      sync();
    },
    pulse: function(){ var c=document.getElementById('tutorialCard'); if(!c) return; c.classList.remove('stepPulse'); void c.offsetWidth; c.classList.add('stepPulse'); setTimeout(function(){ c.classList.remove('stepPulse'); }, 700); }
  };
  try{ window.dispatchEvent(new CustomEvent('geom-api-ready')); }catch(_e){}
})();
