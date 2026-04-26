'use strict';
(function(){
  var canvas = document.getElementById('gl');
  var gl = canvas.getContext('webgl', {antialias:false, alpha:false, preserveDrawingBuffer:true, powerPreference:'low-power', desynchronized:true});
  if(!gl){ alert('Seu navegador não suporta WebGL.'); return; }

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
  var __perfFrameMs = 1000/30;
  var __perfLastTs = 0;
  function __applyPerformanceMode(){
    if(specK){ specK.value='0'; specK.disabled=true; }
    if(refl){ refl.value='0'; refl.disabled=true; }
    if(bgStars){ bgStars.value='0'; bgStars.disabled=true; }
    if(bgBrightness){ bgBrightness.value='0'; bgBrightness.disabled=true; }
  }
  __applyPerformanceMode();
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
  function vSub(a,b){ return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
  function vDot(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
  function vCross(a,b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function vLen(a){ return Math.hypot(a[0],a[1],a[2]) || 1; }
  function vNorm(a){ var L=vLen(a); return [a[0]/L,a[1]/L,a[2]/L]; }
  function projectToCanvas(world, eyePos){
    var target=[0,0,0], up=[0,1,0];
    var f=vNorm(vSub(target, eyePos));
    var useUp = Math.abs(vDot(f, up)) > 0.98 ? [0,0,1] : up;
    var r=vNorm(vCross(f, useUp));
    if(!isFinite(r[0])||!isFinite(r[1])||!isFinite(r[2])) r=[1,0,0];
    var u=vCross(r, f);
    var q=vSub(world, eyePos);
    var cx=vDot(q, r), cy=vDot(q, u), cz=vDot(q, f);
    if(cz <= -0.15) return null;
    if(cz < 0.05) cz = 0.05;
    var aspect = (canvas.clientWidth||1)/(canvas.clientHeight||1);
    var fov = 1.2;
    var t = Math.tan(fov*0.5);
    var ndcX = cx/(cz*t*aspect);
    var ndcY = cy/(cz*t);
    if(!isFinite(ndcX) || !isFinite(ndcY)) return null;
    var sx = (ndcX*0.5 + 0.5) * canvas.clientWidth;
    var sy = (1.0 - (ndcY*0.5 + 0.5)) * canvas.clientHeight;
    var visible = ndcX>-1.25 && ndcX<1.25 && ndcY>-1.25 && ndcY<1.25;
    return {x:sx, y:sy, visible:visible};
  }
  function updateAxisLabels(eyePos){
    if(!(window.showAxes && showAxes.checked)){ setAxisLabelsVisible(false); return; }
    var pts = {
      x:[3.18,0,0],
      y:[0,3.18,0],
      z:[0,0,3.18]
    };
    setAxisLabelsVisible(true);
    [['x',axisLabels.x],['y',axisLabels.y],['z',axisLabels.z]].forEach(function(item){
      var key=item[0], el=item[1];
      var pw = (typeof rotXYZ==='function') ? rotXYZ(pts[key], rot) : pts[key];
      var p = projectToCanvas(pw, eyePos);
      if(!p || !p.visible){ el.style.display='none'; return; }
      el.style.display='block';
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
    });
  }

  function resize(){
    var renderDpr = 0.85;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    var rw = Math.max(1, Math.round(w*renderDpr));
    var rh = Math.max(1, Math.round(h*renderDpr));
    if(canvas.width!==rw||canvas.height!==rh){ canvas.width=rw; canvas.height=rh; gl.viewport(0,0,canvas.width,canvas.height); }
  }
  resize();
  var ro = window.ResizeObserver ? new ResizeObserver(function(){ resize(); requestRender(); }) : null; if(ro){ ro.observe(canvas);} else { window.addEventListener('resize', function(){ resize(); requestRender(); }); }

  
  var ui = {
    geom:geom,bondLen:bondLen,size:size,ligandRadius:ligandRadius,bondRadius:bondRadius,lpScale:lpScale,
    ambient:ambient,sat:sat,specK:specK,refl:refl,ligandColor:ligandColor,lpColor:lpColor,coreColor:coreColor,
    bondType:bondType,showAxes:showAxes,showAngles:showAngles,lightBg:lightBg,lightBgQuick:lightBgQuick,save:save,infoName:infoName,infoArr:infoArr,infoIdeal:infoIdeal,
    rotXS:rotXS,rotYS:rotYS,rotZS:rotZS,bgStars:bgStars,bgBrightness:bgBrightness, rotReset:rotReset
  };

  var __drawRequested = false;
  function requestRender(){
    if(__drawRequested) return;
    __drawRequested = true;
    requestAnimationFrame(draw);
  }

  Object.keys(ui).forEach(function(k){ var el=ui[k]; if(!el) return; if(k==='lightBg' || k==='lightBgQuick') return; if(el && (el.tagName==='INPUT'||el.tagName==='SELECT')){ el.addEventListener('input', sync); el.addEventListener('change', sync); } });
  
    var __whiteMode = false;
  function __setLightBG(v){
    v = !!v;
    __whiteMode = v;

    
    if(ui.lightBg) ui.lightBg.checked = v;
    if(ui.lightBgQuick) ui.lightBgQuick.checked = v;
    if(typeof tutorialLightBg!=='undefined' && tutorialLightBg) tutorialLightBg.checked = v;

    
    document.body.classList.toggle('lightBg', v);

    
    if(typeof prog!=='undefined' && prog && typeof U!=='undefined' && U){
      gl.useProgram(prog);
      if(U.uLightBG) gl.uniform1f(U.uLightBG, v ? 1.0 : 0.0);

      
      if(U.uBGStars){
        gl.uniform1f(U.uBGStars, 0.0);
      }
      if(U.uBGBright){
        gl.uniform1f(U.uBGBright, v ? 1.0 : 0.35);
      }
    }
  }

  
  __setLightBG(!!((ui.lightBg && ui.lightBg.checked) || (ui.lightBgQuick && ui.lightBgQuick.checked) || (typeof tutorialLightBg!=='undefined' && tutorialLightBg && tutorialLightBg.checked)));
  if(ui.lightBg){
    ui.lightBg.addEventListener('input', function(){ __setLightBG(ui.lightBg.checked); sync(); });
    ui.lightBg.addEventListener('change', function(){ __setLightBG(ui.lightBg.checked); sync(); });
  }
  if(ui.lightBgQuick){
    ui.lightBgQuick.addEventListener('input', function(){ __setLightBG(ui.lightBgQuick.checked); sync(); });
    ui.lightBgQuick.addEventListener('change', function(){ __setLightBG(ui.lightBgQuick.checked); sync(); });
  }

  
  var axesToggleChk = document.getElementById('axesToggleChk');
  if(axesToggleChk && ui.showAxes){
    axesToggleChk.checked = !!ui.showAxes.checked;

    function __syncAxesToggle(){
      ui.showAxes.checked = !!axesToggleChk.checked;
      sync();
    }
    axesToggleChk.addEventListener('input', __syncAxesToggle);
    axesToggleChk.addEventListener('change', __syncAxesToggle);

    function __mirrorAxesToggle(){
      axesToggleChk.checked = !!ui.showAxes.checked;
    }
    ui.showAxes.addEventListener('input', __mirrorAxesToggle);
    ui.showAxes.addEventListener('change', __mirrorAxesToggle);
  }

save.addEventListener('click', function(){ requestAnimationFrame(function(){ var a=document.createElement('a'); a.download='geometria_molecular_3d.png'; a.href=canvas.toDataURL('image/png'); a.click(); }); });

  
  var DEG=Math.PI/180; var rot={x:0,y:0,z:0};
  var tutorialRotZVal = document.getElementById('tutorialRotZVal');
  var tutorialLightBg = document.getElementById('tutorialLightBg');
  if(tutorialLightBg){
    tutorialLightBg.addEventListener('input', function(){ __setLightBG(tutorialLightBg.checked); sync(); });
    tutorialLightBg.addEventListener('change', function(){ __setLightBG(tutorialLightBg.checked); sync(); });
  }
  ['x','y','z'].forEach(function(ax){
    var el = document.getElementById('rot'+ax.toUpperCase()+'S');
    if(!el) return;
    el.addEventListener('input', function(e){
      var v = parseFloat(e.target.value)||0;
      rot[ax]=v*DEG;
      if(ax==='z' && tutorialRotZVal) tutorialRotZVal.textContent=Math.round(v)+'°';
      requestRender();
    });
  });
  rotReset.addEventListener('click', function(){
    rot.x=rot.y=rot.z=0;
    rotXS.value=rotYS.value='0';
    if(rotZS) rotZS.value='0';
    if(tutorialRotZVal) tutorialRotZVal.textContent='0°';
    requestRender();
  });

  
  var rot180Btn = document.getElementById('rot180Btn');
  if(rot180Btn){
    rot180Btn.style.display = 'none';
  }

  
  var camDist=4.6, rotX=0.35, rotY=-0.6, isDown=false, activePointerId=null, lastX=0,lastY=0;
  function __vLen(a){ return Math.hypot(a[0],a[1],a[2])||1; }
  function __vNorm(a){ var L=__vLen(a); return [a[0]/L,a[1]/L,a[2]/L]; }
  function __vCross(a,b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function __vDot(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
  function __rotateAroundAxis(v, axis, ang){
    var k=__vNorm(axis), c=Math.cos(ang), s=Math.sin(ang), d=__vDot(k,v);
    return [
      v[0]*c + (k[1]*v[2]-k[2]*v[1])*s + k[0]*d*(1-c),
      v[1]*c + (k[2]*v[0]-k[0]*v[2])*s + k[1]*d*(1-c),
      v[2]*c + (k[0]*v[1]-k[1]*v[0])*s + k[2]*d*(1-c)
    ];
  }
  function __syncOrbitFromAngles(){
    __eyeVec = [camDist*Math.cos(rotX)*Math.sin(rotY), camDist*Math.sin(rotX), camDist*Math.cos(rotX)*Math.cos(rotY)];
  }
  function __getCameraBasis(ex,ey,ez){
    var eyePos=[ex,ey,ez];
    var fwd=__vNorm([-ex,-ey,-ez]);
    var right=[Math.cos(rotY),0,-Math.sin(rotY)];
    right=__vNorm(right);
    if(__vLen(right)<1e-6) right=[1,0,0];
    var up=__vCross(right,fwd);
    if(__vLen(up)<1e-6) up=[0,1,0];
    else up=__vNorm(up);
    right=__vCross(fwd,up);
    if(__vLen(right)<1e-6) right=[1,0,0];
    else right=__vNorm(right);
    return {eye:eyePos,fwd:fwd,right:right,up:up};
  }
  function __syncAnglesFromEye(){
    camDist = Math.max(2.2, Math.min(14, __vLen(__eyeVec)));
    var ny = Math.max(-1, Math.min(1, __eyeVec[1]/camDist));
    rotX = __clamp(Math.asin(ny), -Math.PI/2+.05, Math.PI/2-.05);
    rotY = __wrapAngle(Math.atan2(__eyeVec[0], __eyeVec[2]));
  }
  var __eyeVec = [camDist*Math.cos(rotX)*Math.sin(rotY), camDist*Math.sin(rotX), camDist*Math.cos(rotX)*Math.cos(rotY)];
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', function(e){
    isDown=true; activePointerId=e.pointerId; lastX=e.clientX; lastY=e.clientY;
    try{ canvas.setPointerCapture(e.pointerId); }catch(_e){}
  });
  canvas.addEventListener('pointerup', function(e){
    if(activePointerId!==null && e.pointerId!==activePointerId) return;
    isDown=false; activePointerId=null;
    try{ canvas.releasePointerCapture(e.pointerId); }catch(_e){}
  });
  canvas.addEventListener('pointercancel', function(e){
    if(activePointerId!==null && e.pointerId!==activePointerId) return;
    isDown=false; activePointerId=null;
  });
  canvas.addEventListener('pointermove', function(e){
    if(!isDown) return;
    if(activePointerId!==null && e.pointerId!==activePointerId) return;
    var dx=(e.clientX-lastX)/Math.max(1,canvas.clientWidth), dy=(e.clientY-lastY)/Math.max(1,canvas.clientHeight);
    lastX=e.clientX; lastY=e.clientY;
    var orbitSpeed = Math.PI * 1.15;
    rotY = __wrapAngle(rotY + dx * orbitSpeed);
    rotX = __clamp(rotX + dy * orbitSpeed, -Math.PI/2 + 0.05, Math.PI/2 - 0.05);
    __syncOrbitFromAngles();
    requestRender();
  });
  canvas.addEventListener('wheel', function(e){ e.preventDefault(); camDist*=(1+Math.sign(e.deltaY)*0.08); camDist=Math.max(2.2, Math.min(14, camDist)); __syncOrbitFromAngles(); requestRender(); }, {passive:false});
  canvas.addEventListener('dblclick', function(){ camDist=autoDist(); rotX=0.35; rotY=-0.6; __syncOrbitFromAngles(); rot.x=rot.y=rot.z=0; rotXS.value=rotYS.value='0'; if(rotZS) rotZS.value='0'; if(tutorialRotZVal) tutorialRotZVal.textContent='0°'; requestRender(); });

  
  var VERT=`
    attribute vec2 aPos; varying vec2 vUV;
    void main(){ vUV=aPos*0.5+0.5; gl_Position=vec4(aPos,0.0,1.0); }
  `;
  var FRAG=`
    precision highp float;
    varying vec2 vUV;
    uniform vec2 uRes;
    uniform vec3 uEye, uTarget, uUp;
    uniform int uLigCount; uniform vec3 uLigDirs[8];
    uniform int uLPCount;  uniform vec3 uLPDirs[8];
    uniform float uBondLen, uCentralR, uLigR, uBondR, uLPScale, uAmbient, uSat, uSpecK, uRefl;
    uniform vec3 uLigColor, uLPColor, uCoreColor;
    uniform float uTime;
    uniform float uLPAnim;

    
    uniform int uBalloonN;
    uniform vec3 uBalloonPos[6];
    uniform vec3 uBalloonRad[6];
    uniform vec3 uBalloonCol[6];
    uniform vec3 uBalloonDir[6];
    uniform vec3 uMolOffset;
    uniform vec3 uBalloonOffset;

    uniform bool uShowAxes;
    uniform int uBondType; 
    uniform vec3 uRot;
    
    uniform float uBGStars, uBGBright, uLightBG;

    mat3 look(vec3 f, vec3 up){ vec3 w=normalize(f); vec3 up2 = (abs(dot(w, normalize(up)))>0.98) ? vec3(0.0,0.0,1.0) : up; vec3 u=normalize(cross(w,up2)); vec3 v=cross(u,w); return mat3(u,v,w); }
    float sdSphere(vec3 p, float r){ return length(p)-r; }
    float sdCapsule(vec3 p, vec3 a, vec3 b, float r){ vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0); return length(pa-ba*h)-r; }
    float sdEllipsoid(vec3 p, vec3 r){ float k0=length(p/r); return (k0-1.0)*min(min(r.x,r.y),r.z); }
    struct Hit{ float d; vec3 col; float lp; };

    mat3 basisFromDir(vec3 d){ vec3 w=normalize(d); vec3 a=(abs(w.z)<0.999)?vec3(0.0,0.0,1.0):vec3(0.0,1.0,0.0); vec3 u=normalize(cross(a,w)); vec3 v=cross(w,u); return mat3(u,v,w); }
    vec3 mulByTranspose(mat3 B, vec3 x){ return vec3(dot(B[0],x), dot(B[1],x), dot(B[2],x)); }
    vec3 rotateXYZ(vec3 p, vec3 r){ float cx=cos(r.x), sx=sin(r.x); float cy=cos(r.y), sy=sin(r.y); float cz=cos(r.z), sz=sin(r.z); p=vec3(p.x, cx*p.y-sx*p.z, sx*p.y+cx*p.z); p=vec3(cy*p.x+sy*p.z, p.y, -sy*p.x+cy*p.z); p=vec3(cz*p.x-sz*p.y, sz*p.x+cz*p.y, p.z); return p; }

    float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
    vec2  hash22(vec2 p){ return fract(sin(vec2(dot(p,vec2(269.5,183.3)), dot(p,vec2(113.5,271.9))))*43758.5453); }
    const float PI=3.14159265359;
    vec2 dirToUV(vec3 dir){ dir=normalize(dir); float lon=atan(dir.x, dir.z); float lat=asin(clamp(dir.y,-1.0,1.0)); return vec2(lon/(2.0*PI)+0.5, lat/PI+0.5); }

    float starLayer(vec2 uv, float cells, float baseRadius, float boost){
      return 0.0;
    }

    vec3 envMap(vec3 dir){
      float lb = clamp(uLightBG,0.0,1.0);
      vec3 base = mix(vec3(0.0), vec3(0.945, 0.955, 0.97), lb);
      return clamp(base, 0.0, 1.0);
    }

    vec3 lpPushAxis(){
      vec3 sum=vec3(0.0);
      for(int j=0;j<8;j++) if(j<uLPCount){ sum += normalize(uLPDirs[j]); }
      float L=length(sum);
      if(L<0.001) return vec3(0.0,0.0,1.0);
      return sum/L;
    }

    Hit map(vec3 p){
      Hit res; res.d=1e9; res.col=vec3(0.0); res.lp=0.0;

      
      vec3 pr=rotateXYZ(p,uRot);
      vec3 pm=pr-uMolOffset;

      
      if(uShowAxes){
        float ax = sdCapsule(pm, vec3(-3.0,0.0,0.0), vec3(3.0,0.0,0.0), 0.02);
        float ay = sdCapsule(pm, vec3(0.0,-3.0,0.0), vec3(0.0,3.0,0.0), 0.02);
        float az = sdCapsule(pm, vec3(0.0,0.0,-3.0), vec3(0.0,0.0,3.0), 0.02);
        float d=ax;
        vec3 axisCol=vec3(1.0,0.28,0.28);   
        if(ay<d){ d=ay; axisCol=vec3(0.28,1.0,0.38); } 
        if(az<d){ d=az; axisCol=vec3(0.35,0.62,1.0); } 
        if(d<res.d){ res.d=d; res.col=axisCol; res.lp=0.0; }
      }

      float dc=sdSphere(pm,uCentralR);
      if(dc<res.d){ res.d=dc; res.col=uCoreColor; res.lp=0.0; }

      
      vec3 pushAxis = lpPushAxis();
      float k = (uLPCount>0 && !(uLPCount==2 && uLigCount==4)) ? (0.36 * clamp(uLPAnim, 0.0, 1.0)) : 0.0;
      vec3 down = -pushAxis;

      for(int i=0;i<8;i++) if(i<uLigCount){
        vec3 dir0=normalize(uLigDirs[i]);
        vec3 dir = normalize(dir0 + down*k);

        vec3 b=dir*uBondLen;

        if(uBondType==1){
          float db=sdCapsule(pm, vec3(0.0), b, uBondR);
          if(db<res.d){ res.d=db; res.col=vec3(0.82,0.9,1.0); res.lp=0.0;}
        } else if(uBondType==2){
          vec3 perp=(abs(dir.z)<0.99)?normalize(cross(dir,vec3(0.0,0.0,1.0))):normalize(cross(dir,vec3(0.0,1.0,0.0)));
          float r2=uBondR*0.6; float off=r2*1.8;
          float d1=sdCapsule(pm,-perp*off,b-perp*off,r2); if(d1<res.d){ res.d=d1; res.col=vec3(0.82,0.9,1.0); res.lp=0.0;}
          float d2=sdCapsule(pm, perp*off,b+perp*off,r2); if(d2<res.d){ res.d=d2; res.col=vec3(0.82,0.9,1.0); res.lp=0.0;}
        } else {
          vec3 perp=(abs(dir.z)<0.99)?normalize(cross(dir,vec3(0.0,0.0,1.0))):normalize(cross(dir,vec3(0.0,1.0,0.0)));
          float r3=uBondR*0.5; float off=r3*1.8;
          float d0=sdCapsule(pm, vec3(0.0), b, r3); if(d0<res.d){ res.d=d0; res.col=vec3(0.82,0.9,1.0); res.lp=0.0;}
          float d1=sdCapsule(pm,-perp*off,b-perp*off,r3); if(d1<res.d){ res.d=d1; res.col=vec3(0.82,0.9,1.0); res.lp=0.0;}
          float d2=sdCapsule(pm, perp*off,b+perp*off,r3); if(d2<res.d){ res.d=d2; res.col=vec3(0.82,0.9,1.0); res.lp=0.0;}
        }

        float dl=sdSphere(pm-b, uLigR);
        if(dl<res.d){ res.d=dl; res.col=uLigColor; res.lp=0.0; }
      }

      


      
      for(int i=0;i<6;i++) if(i<uBalloonN){
        vec3 bdir = normalize(uBalloonDir[i]);
        mat3 BB = basisFromDir(bdir);
        vec3 qB = mulByTranspose(BB, (pr - (uBalloonPos[i] + uBalloonOffset)));
        vec3 rB = uBalloonRad[i];
        float body = sdEllipsoid(qB - vec3(0.0,0.0,0.10), vec3(rB.x*0.95, rB.y*0.95, rB.z*1.06));
        float neck = sdEllipsoid(qB - vec3(0.0,0.0,-0.34), vec3(rB.x*0.36, rB.y*0.36, rB.z*0.16));
        float knot = sdSphere(qB - vec3(0.0,0.0,-0.48), 0.075);
        float db = min(min(body, neck), knot);
        if(db<res.d){ res.d=db; res.col=uBalloonCol[i]; res.lp=2.0; }
      }

      return res;
    }

    vec3 calcNormal(vec3 p){
      float e=0.0015; vec2 h=vec2(1.0,-1.0)*0.5773;
      return normalize( h.xyy*map(p+h.xyy*e).d + h.yyx*map(p+h.yyx*e).d + h.yxy*map(p+h.yxy*e).d + h.xxx*map(p+h.xxx*e).d );
    }
    float softShadow(vec3 ro, vec3 rd){
      float res=1.0; float t=0.02;
      for(int i=0;i<18;i++){ vec3 p=ro+rd*t; float h=map(p).d; res=min(res,8.0*h/t); t+=clamp(h,0.02,0.25); if(res<0.001||t>10.0) break; }
      return clamp(res,0.0,1.0);
    }
    vec3 saturateColor(vec3 c, float s){ float l=dot(c, vec3(0.299,0.587,0.114)); return mix(vec3(l), c, s); }

    float raySphereThickness(vec3 ro, vec3 rd, vec3 c, float r){
      vec3 oc = ro - c;
      float b = dot(oc, rd);
      float h = b*b - dot(oc,oc) + r*r;
      if(h<0.0) return 0.0;
      h = sqrt(h);
      float t0 = -b - h;
      float t1 = -b + h;
      float a0 = max(t0, 0.0);
      float a1 = max(t1, 0.0);
      return max(0.0, a1-a0);
    }



vec2 raySphereInterval(vec3 ro, vec3 rd, vec3 c, float r){
  vec3 oc = ro - c;
  float b = dot(oc, rd);
  float h = b*b - dot(oc,oc) + r*r;
  if(h < 0.0) return vec2(1e9, -1e9);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

vec2 rayEllipsoidInterval(vec3 ro, vec3 rd, vec3 c, mat3 B, vec3 radii){
  vec3 roL = mulByTranspose(B, ro - c) / radii;
  vec3 rdL = mulByTranspose(B, rd) / radii;
  float a = dot(rdL, rdL);
  float b = dot(roL, rdL);
  float cc = dot(roL, roL) - 1.0;
  float h = b*b - a*cc;
  if(h < 0.0) return vec2(1e9, -1e9);
  h = sqrt(h);
  return vec2((-b - h)/a, (-b + h)/a);
}


float probDots(vec3 p, float seed){
  float grid = 10.0; 
  vec3 q = p*grid + seed*vec3(7.13, 13.71, 5.17);
  vec3 cell = floor(q);
  vec3 f = fract(q);

  vec3 rnd = fract(sin(vec3(
    dot(cell, vec3(127.1,311.7,74.7)),
    dot(cell, vec3(269.5,183.3,246.1)),
    dot(cell, vec3(113.5,271.9,124.6))
  ))*43758.5453);

  float d = length(f - rnd);
  float rDot = mix(0.18, 0.30, clamp(uLightBG,0.0,1.0));
  float m = 1.0 - smoothstep(rDot*0.65, rDot, d);

  
  float radial = length(p);
  m *= smoothstep(1.0, 0.25, radial);

  
  
  m *= 1.0;

  return m;
}

    void main(){
      vec3 fwd=normalize(uTarget-uEye); mat3 cam=look(fwd, uUp);
      vec2 uv=vUV*2.0-1.0; uv.x*=uRes.x/uRes.y;
      vec3 rd=normalize(cam*normalize(vec3(uv,1.25))); vec3 ro=uEye;

      float t=0.0; vec3 col=vec3(0.0); float fog=0.0; float hitFlag=0.0;
      Hit h; vec3 p=vec3(0.0);
      for(int i=0;i<88;i++){
        p=ro+rd*t; h=map(p);
        if(h.d<0.0015){
          vec3 n=calcNormal(p);
          vec3 ldir=normalize(-uEye);
          float diff=max(dot(n,ldir),0.0);
          float amb=clamp(uAmbient,0.0,1.0);
          float diff2=max(dot(n, normalize(vec3(0.6,0.5,0.2))), 0.0)*0.22;

          vec3 lit=h.col*(amb+(1.0-amb)*(diff*0.78+diff2));
          lit=saturateColor(lit,uSat);
          float rim=pow(1.0-max(dot(n,-rd),0.0),3.0);
          col=clamp(lit+vec3(rim)*0.03,0.0,1.0);

          if(h.lp>1.5){
            vec3 latex = h.col*(0.58 + 0.58*diff + 0.14*diff2) + vec3(rim)*0.03;
            latex = saturateColor(latex, 1.08);
            col = clamp(latex, 0.0, 1.0);
          }


          fog=1.0-exp(-0.05*t); hitFlag=1.0; break;
        }
        t+=clamp(h.d, 0.003, 0.55); if(t>30.0) break;
      }

      vec3 bg=envMap(rd);
      vec3 colFog=mix(bg,col,1.0-fog);
      col=mix(bg,colFog,hitFlag);

      
      float lpDots = 0.0;
      if(uLPCount>0){
        
        vec3 roM = rotateXYZ(ro, uRot) - uMolOffset;
        vec3 rdM = normalize(rotateXYZ(rd, uRot));

        vec3 lpAxis = lpPushAxis();
        float axisBlend = (uLPCount>=2) ? 0.18 : 0.10;
        float rCloudMajor = uCentralR*1.20;
        float rCloudMinor = uCentralR*0.76;
        vec3 cloudR = vec3(rCloudMajor, rCloudMajor*0.82, rCloudMinor);

        float tMax = (hitFlag>0.5) ? t : 30.0; 
        const int SAMPLES = 8;

        for(int j=0;j<8;j++) if(j<uLPCount){
          vec3 dir=normalize(mix(normalize(uLPDirs[j]), lpAxis, axisBlend));
          mat3 BB = basisFromDir(dir);
          float centerDist=uCentralR + cloudR.z - uCentralR*0.14;
          vec3 c = dir*centerDist;

          vec2 iv = rayEllipsoidInterval(roM, rdM, c, BB, cloudR);
          float t0 = iv.x, t1 = iv.y;
          if(t1 < 0.0) continue;

          float a0 = max(t0, 0.0);
          float a1 = min(t1, tMax);
          float seg = max(0.0, a1-a0);
          if(seg <= 0.0) continue;

          float acc = 0.0;
          for(int s=0;s<SAMPLES;s++){
            float u = (float(s)+0.5)/float(SAMPLES);
            float tt = mix(a0, a1, u);
            vec3 p = roM + rdM*tt;
            vec3 pl = mulByTranspose(BB, (p - c)) / cloudR;
            acc = max(acc, probDots(pl, float(j)));
          }
          lpDots = max(lpDots, acc);
        }
      }
      float lightBG = clamp(uLightBG,0.0,1.0);
      lpDots = clamp(lpDots * mix(1.0, 3.8, lightBG), 0.0, 1.0);
      vec3 lpInkDark = saturateColor(uLPColor, 1.18);
      vec3 lpInkLight = vec3(0.015,0.015,0.015);

      
      col += lpInkDark * 1.05 * lpDots * (1.0-lightBG);
      col = mix(col, lpInkLight, lpDots * 0.92 * lightBG);

      col=pow(col, vec3(1.0/2.2));
      gl_FragColor=vec4(col,1.0);
    }
  `;

  function compile(type,src){
    var s=gl.createShader(type);
    gl.shaderSource(s,src);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){
      var info=gl.getShaderInfoLog(s)||'erro ao compilar shader';
      console.error(info);
      alert(info);
      throw new Error(info);
    }
    return s;
  }
  function program(vs,fs){
    var p=gl.createProgram();
    gl.attachShader(p,vs); gl.attachShader(p,fs);
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)){
      var info=gl.getProgramInfoLog(p)||'erro link';
      console.error(info); alert(info); throw new Error(info);
    }
    return p;
  }

  var prog=program(compile(gl.VERTEX_SHADER, VERT), compile(gl.FRAGMENT_SHADER, FRAG));
  gl.useProgram(prog);

  var quad=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  var aPos=gl.getAttribLocation(prog,'aPos'); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

  var U={
    uRes:gl.getUniformLocation(prog,'uRes'), uEye:gl.getUniformLocation(prog,'uEye'), uTarget:gl.getUniformLocation(prog,'uTarget'), uUp:gl.getUniformLocation(prog,'uUp'),
    uLigCount:gl.getUniformLocation(prog,'uLigCount'), uLigDirs:gl.getUniformLocation(prog,'uLigDirs[0]'),
    uLPCount:gl.getUniformLocation(prog,'uLPCount'), uLPDirs:gl.getUniformLocation(prog,'uLPDirs[0]'),
    uBondLen:gl.getUniformLocation(prog,'uBondLen'), uCentralR:gl.getUniformLocation(prog,'uCentralR'), uLigR:gl.getUniformLocation(prog,'uLigR'), uBondR:gl.getUniformLocation(prog,'uBondR'),
    uLPScale:gl.getUniformLocation(prog,'uLPScale'), uAmbient:gl.getUniformLocation(prog,'uAmbient'), uSat:gl.getUniformLocation(prog,'uSat'), uSpecK:gl.getUniformLocation(prog,'uSpecK'),
    uRefl:gl.getUniformLocation(prog,'uRefl'), uLigColor:gl.getUniformLocation(prog,'uLigColor'), uLPColor:gl.getUniformLocation(prog,'uLPColor'), uCoreColor:gl.getUniformLocation(prog,'uCoreColor'), uTime:gl.getUniformLocation(prog,'uTime'), uLPAnim:gl.getUniformLocation(prog,'uLPAnim'),
    uBalloonN:gl.getUniformLocation(prog,'uBalloonN'), uBalloonPos:gl.getUniformLocation(prog,'uBalloonPos[0]'), uBalloonRad:gl.getUniformLocation(prog,'uBalloonRad[0]'), uBalloonCol:gl.getUniformLocation(prog,'uBalloonCol[0]'), uBalloonDir:gl.getUniformLocation(prog,'uBalloonDir[0]'), uMolOffset:gl.getUniformLocation(prog,'uMolOffset'), uBalloonOffset:gl.getUniformLocation(prog,'uBalloonOffset'),
    uShowAxes:gl.getUniformLocation(prog,'uShowAxes'), uBondType:gl.getUniformLocation(prog,'uBondType'), uRot:gl.getUniformLocation(prog,'uRot'),
    uBGStars:gl.getUniformLocation(prog,'uBGStars'), uBGBright:gl.getUniformLocation(prog,'uBGBright'), uLightBG:gl.getUniformLocation(prog,'uLightBG')
  };

  function hexToRgb(hex){ var h=hex.replace('#',''); var v=parseInt(h,16); return [(v>>16&255)/255,(v>>8&255)/255,(v&255)/255]; }
  function padVecArray(arr,t){ var out=[]; for(var i=0;i<arr.length;i++){ out.push(arr[i][0],arr[i][1],arr[i][2]); } while(out.length<t*3) out.push(0,0,0); return new Float32Array(out.slice(0,t*3)); }

  
  var __balloons = { n:0, pos:new Float32Array(18), rad:new Float32Array(18), col:new Float32Array(18), dir:new Float32Array(18) };
  var __sceneSplit = false;
  var __sceneMolOffset = new Float32Array([0,0,0]);
  var __sceneBalloonOffset = new Float32Array([0,0,0]);
  function __pushSceneUniforms(){
    gl.useProgram(prog);
    if(U.uMolOffset) gl.uniform3fv(U.uMolOffset, __sceneMolOffset);
    if(U.uBalloonOffset) gl.uniform3fv(U.uBalloonOffset, __sceneBalloonOffset);
  }
  function __setBoardSplit(active){
    __sceneSplit = !!active;
    __sceneMolOffset[0] = __sceneSplit ? 1.95 : 0.0;
    __sceneMolOffset[1] = 0.0; __sceneMolOffset[2] = 0.0;
    __sceneBalloonOffset[0] = __sceneSplit ? -1.95 : 0.0;
    __sceneBalloonOffset[1] = 0.0; __sceneBalloonOffset[2] = 0.0;
    if(boardSplitOverlay) boardSplitOverlay.classList.toggle('show', __sceneSplit);
    __pushSceneUniforms();
    requestRender();
  }
  function __setBalloons3D(n, dirs){
    n = Math.max(0, Math.min(6, (n|0)));
    __balloons.n = n;
    
    var cx = 0.0, cy = 0.0, cz = 0.0;
    var dist = 0.48;
    
    for(var i=0;i<6;i++){
      var bi=i*3;
      if(i<n && dirs && dirs[i]){
        var d=dirs[i]; var L=Math.hypot(d[0],d[1],d[2])||1; d=[d[0]/L,d[1]/L,d[2]/L];
        
        __balloons.pos[bi+0]=cx + d[0]*dist;
        __balloons.pos[bi+1]=cy + d[1]*dist;
        __balloons.pos[bi+2]=cz + d[2]*dist;
        __balloons.dir[bi+0]=d[0]; __balloons.dir[bi+1]=d[1]; __balloons.dir[bi+2]=d[2];
        
        __balloons.rad[bi+0]=0.30;
        __balloons.rad[bi+1]=0.30;
        __balloons.rad[bi+2]=0.46;
        
        
        var palette=[[0.99,0.74,0.46],[0.99,0.90,0.40],[0.50,0.78,1.00],[0.99,0.56,0.78],[0.46,0.90,0.68],[0.78,0.62,1.00]];
        var c=palette[i%palette.length];
        __balloons.col[bi+0]=c[0]; __balloons.col[bi+1]=c[1]; __balloons.col[bi+2]=c[2];
      } else {
        __balloons.pos[bi+0]=__balloons.pos[bi+1]=__balloons.pos[bi+2]=0;
        __balloons.rad[bi+0]=__balloons.rad[bi+1]=__balloons.rad[bi+2]=0;
        __balloons.col[bi+0]=__balloons.col[bi+1]=__balloons.col[bi+2]=0;
        __balloons.dir[bi+0]=__balloons.dir[bi+1]=__balloons.dir[bi+2]=0;
      }
    }
    
    gl.useProgram(prog);
    gl.uniform1i(U.uBalloonN, __balloons.n);
    gl.uniform3fv(U.uBalloonPos, __balloons.pos);
    gl.uniform3fv(U.uBalloonRad, __balloons.rad);
    gl.uniform3fv(U.uBalloonCol, __balloons.col);
    if(U.uBalloonDir) gl.uniform3fv(U.uBalloonDir, __balloons.dir);
    requestRender();
  }

  function autoDist(){ var bl=parseFloat(bondLen.value); var R=Math.max(parseFloat(size.value), parseFloat(ligandRadius.value))+bl+0.5; return Math.min(10, Math.max(3.2, R*1.55)); }
  function eye(){ return [__eyeVec[0], __eyeVec[1], __eyeVec[2]]; }

  function geomPositions(type){
    
    
    var SQ2=Math.sqrt(2), SQ3=Math.sqrt(3);
    var trig = [
      [ 1, 0, 0 ],
      [ -0.5,  SQ3/2, 0 ],
      [ -0.5, -SQ3/2, 0 ]
    ];
    
    var r = 2*SQ2/3, z = -1/3;
    var tetra = [
      [0,0,1],
      [ r, 0, z],
      [ r*Math.cos(2*Math.PI/3), r*Math.sin(2*Math.PI/3), z],
      [ r*Math.cos(4*Math.PI/3), r*Math.sin(4*Math.PI/3), z]
    ];
    
    var tbp = { eq: trig, ax: [[0,0,1],[0,0,-1]] };
    
    var oct = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];

    function nrm(v){ var L=Math.hypot(v[0],v[1],v[2])||1; return [v[0]/L,v[1]/L,v[2]/L]; }
    tetra = tetra.map(nrm);

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
        return {lig:lig, lp:lp, angle:'<120° (1 par livre)', ideal:'<120°', arr:'AX2E', label:'Angular (AX2E)'};
      }
      case 'trigonal_pyramidal': {
        
        var lig=[tetra[1],tetra[2],tetra[3]];
        var lp=[tetra[0]];
        return {lig:lig, lp:lp, angle:'~107° (<109,5°; 1 par livre)', ideal:'~107°', arr:'AX3E', label:'Piramidal trigonal (AX3E)'};
      }
      case 'bent_tet': {
        
        var a=30*DEG, b=52.25*DEG;
        var lp=[ [ Math.sin(a),0, Math.cos(a) ], [ -Math.sin(a),0, Math.cos(a) ] ];
        var lig=[ [ Math.sin(b),0,-Math.cos(b) ], [ -Math.sin(b),0,-Math.cos(b) ] ];
        return {lig:lig, lp:lp, angle:'~104,5° (<109,5°; 2 pares livres)', ideal:'~104,5°', arr:'AX2E2', label:'Angular (AX2E2)'};
      }
      case 'see_saw': {
        
        var lp=[tbp.eq[0]];
        var lig=[tbp.eq[1],tbp.eq[2],tbp.ax[0],tbp.ax[1]];
        return {lig:lig, lp:lp, angle:'<120° (eq-eq), <90° (ax-eq), <180° (ax-ax)', ideal:'<120°/<90°/<180°', arr:'AX4E', label:'Gangorra (AX4E)'};
      }
      case 't_shaped': {
        var lp=[tbp.eq[0],tbp.eq[1]];
        var lig=[tbp.eq[2],tbp.ax[0],tbp.ax[1]];
        return {lig:lig, lp:lp, angle:'<90° (ax-eq), <180° (ax-ax)', ideal:'<90°/<180°', arr:'AX3E2', label:'Em T (AX3E2)'};
      }
      case 'linear_tbp': {
        var lig=[tbp.ax[0],tbp.ax[1]];
        var lp=tbp.eq.slice();
        return {lig:lig, lp:lp, angle:'180° (lig-lig); pares livres equatoriais a 120°', ideal:'180°', arr:'AX2E3', label:'Linear (AX2E3)'};
      }
      case 'square_pyramidal': {
        var lig=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,-1]];
        var lp=[[0,0,1]];
        return {lig:lig, lp:lp, angle:'<90° (ax-basal), 90°/180° na base', ideal:'<90°/90°/180°', arr:'AX5E', label:'Piramidal quadrada (AX5E)'};
      }
      case 'square_planar': {
        var lig=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]];
        var lp=[[0,0,1],[0,0,-1]];
        return {lig:lig, lp:lp, angle:'90°/180° (pares livres trans fora do plano)', ideal:'90°/180°', arr:'AX4E2', label:'Quadrada planar (AX4E2)'};
      }
      default: return {lig:[tetra[0],tetra[1],tetra[2],tetra[3]], lp:[], angle:'109,5° (3D)', ideal:'109,5°', arr:'AX4', label:'Tetraédrica'};
    }
  }

  function sync(){
    var G=geomPositions(geom.value);
    var __geomChanged = (geom.value !== __lastGeomKey);
    if(__geomChanged){
      __lastGeomKey = geom.value;
      if(G.lp && G.lp.length>0 && !(G.lp.length===2 && G.lig.length===4)){ __startLPPulse(); }
      else { __lpPulseStart = -1; __lpHold = 0.0; }
    }
    gl.useProgram(prog);
    gl.uniform1i(U.uLigCount, G.lig.length);
    gl.uniform3fv(U.uLigDirs, padVecArray(G.lig,8));
    gl.uniform1i(U.uLPCount, G.lp.length);
    gl.uniform3fv(U.uLPDirs, padVecArray(G.lp,8));
    gl.uniform1f(U.uBondLen, parseFloat(bondLen.value));
    gl.uniform1f(U.uCentralR, parseFloat(size.value));
    gl.uniform1f(U.uLigR, parseFloat(ligandRadius.value));
    gl.uniform1f(U.uBondR, parseFloat(bondRadius.value));
    gl.uniform1f(U.uLPScale, parseFloat(lpScale.value));
    gl.uniform1f(U.uAmbient, parseFloat(ambient.value));
    gl.uniform1f(U.uSat, parseFloat(sat.value));
    gl.uniform1f(U.uSpecK, 0.0);
    gl.uniform1f(U.uRefl, 0.0);
    gl.uniform3fv(U.uLigColor, new Float32Array(hexToRgb(ligandColor.value)));
    gl.uniform3fv(U.uLPColor, new Float32Array(hexToRgb(lpColor.value)));
    gl.uniform3fv(U.uCoreColor, new Float32Array(hexToRgb(coreColor.value)));
    gl.uniform1i(U.uShowAxes, showAxes.checked?1:0);
    setAxisLabelsVisible(showAxes.checked);
    gl.uniform1i(U.uBondType, parseInt(bondType.value,10));
    gl.uniform1f(U.uBGStars, 0.0);
    gl.uniform1f(U.uBGBright, 0.35);

    var __lb = (typeof __whiteMode!=='undefined') ? !!__whiteMode : !!((ui.lightBgQuick && ui.lightBgQuick.checked) || (ui.lightBg && ui.lightBg.checked) || (typeof tutorialLightBg!=='undefined' && tutorialLightBg && tutorialLightBg.checked));
    if(ui.lightBg) ui.lightBg.checked = __lb;
    if(ui.lightBgQuick) ui.lightBgQuick.checked = __lb;
    if(typeof tutorialLightBg!=='undefined' && tutorialLightBg) tutorialLightBg.checked = __lb;
    if(U.uLightBG) gl.uniform1f(U.uLightBG, __lb ? 1.0 : 0.0);
    document.body.classList.toggle('lightBg', __lb);

    gl.uniform1i(U.uBalloonN, __balloons.n||0);
    gl.uniform3fv(U.uBalloonPos, __balloons.pos||new Float32Array(18));
    gl.uniform3fv(U.uBalloonRad, __balloons.rad||new Float32Array(18));
    gl.uniform3fv(U.uBalloonCol, __balloons.col||new Float32Array(18));
    if(U.uBalloonDir) gl.uniform3fv(U.uBalloonDir, __balloons.dir||new Float32Array(18));
    __pushSceneUniforms();
    infoName.textContent = geom.options[geom.selectedIndex].textContent.split('(')[0].trim();
    var G2=geomPositions(geom.value);
    infoArr.textContent = G2.arr; infoIdeal.textContent = G2.ideal;
    document.getElementById('hud').innerHTML='<b>'+G2.label+'</b> · <span class="small">'+G2.arr+' - '+G2.ideal+'</span>';
    requestRender();
  }

    
  var miniWrap = document.getElementById('miniAxesWrap');
  var miniCanvas = document.getElementById('miniAxes');
  var miniCtx = miniCanvas ? miniCanvas.getContext('2d') : null;
  var miniDist = 3.1;

  function miniResize(){
    if(!miniCanvas || !miniCtx) return;
    var dpr = 1;
    var w = miniCanvas.clientWidth || 180;
    var h = miniCanvas.clientHeight || 180;
    if(miniCanvas.width !== w*dpr || miniCanvas.height !== h*dpr){
      miniCanvas.width = w*dpr;
      miniCanvas.height = h*dpr;
      miniCtx.setTransform(dpr,0,0,dpr,0,0); 
    }
  }
  miniResize();
  try{ if(window.ResizeObserver && miniWrap){ new ResizeObserver(miniResize).observe(miniWrap); } }catch(_e){}

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

  function projectMini(world, eyePos){
    var target=[0,0,0], up=[0,1,0];
    var f=vNorm(vSub(target, eyePos));
    var useUp = Math.abs(vDot(f, up)) > 0.98 ? [0,0,1] : up;
    var r=vNorm(vCross(f, useUp));
    if(!isFinite(r[0])||!isFinite(r[1])||!isFinite(r[2])) r=[1,0,0];
    var u=vCross(r, f);
    var q=vSub(world, eyePos);
    var cx=vDot(q, r), cy=vDot(q, u), cz=vDot(q, f);
    if(cz < 0.08) cz = 0.08;
    var w = miniCanvas.clientWidth || 180;
    var h = miniCanvas.clientHeight || 180;
    var aspect = w/h;
    var fov = 1.10;
    var t = Math.tan(fov*0.5);
    var ndcX = cx/(cz*t*aspect);
    var ndcY = cy/(cz*t);
    return {x:(ndcX*0.5+0.5)*w, y:(1.0-(ndcY*0.5+0.5))*h, z:cz};
  }

  function drawMiniAxes(){
    if(!miniCtx || !miniWrap) return;
    miniWrap.style.display = 'block';
    miniResize();
    var w = miniCanvas.clientWidth || 180;
    var h = miniCanvas.clientHeight || 180;
    miniCtx.clearRect(0,0,w,h);

    
    var g = miniCtx.createRadialGradient(w*0.35,h*0.35, 10, w*0.5,h*0.55, Math.max(w,h)*0.80);
    g.addColorStop(0,'rgba(255,255,255,.06)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    miniCtx.fillStyle = g;
    miniCtx.fillRect(0,0,w,h);

    
    var ex = miniDist*Math.cos(rotX)*Math.sin(rotY);
    var ey = miniDist*Math.sin(rotX);
    var ez = miniDist*Math.cos(rotX)*Math.cos(rotY);
    var eyePos=[ex,ey,ez];

    var L=0.92; 
    var axes=[
      {name:'X', col:'rgba(255,122,122,.95)', end:[L,0,0]},
      {name:'Y', col:'rgba(109,255,176,.95)', end:[0,L,0]},
      {name:'Z', col:'rgba(126,200,255,.95)', end:[0,0,L]}
    ];

    var o = projectMini([0,0,0], eyePos);
    axes.forEach(function(a){
      a.endR = rotXYZ(a.end, rot);
      a.p = projectMini(a.endR, eyePos);
    });
    axes.sort(function(a,b){ return b.p.z - a.p.z; });

    axes.forEach(function(a){
      var p=a.p;
      miniCtx.strokeStyle=a.col;
      miniCtx.lineWidth=2;
      miniCtx.lineCap='round';
      miniCtx.beginPath();
      miniCtx.moveTo(o.x,o.y);
      miniCtx.lineTo(p.x,p.y);
      miniCtx.stroke();

      
      var dx=p.x-o.x, dy=p.y-o.y;
      var len=Math.hypot(dx,dy)||1;
      var ux=dx/len, uy=dy/len;
      var ah=7, aw=4;
      var bx=p.x-ux*ah, by=p.y-uy*ah;
      miniCtx.fillStyle=a.col;
      miniCtx.beginPath();
      miniCtx.moveTo(p.x,p.y);
      miniCtx.lineTo(bx - uy*aw, by + ux*aw);
      miniCtx.lineTo(bx + uy*aw, by - ux*aw);
      miniCtx.closePath();
      miniCtx.fill();

      miniCtx.font='700 12px system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif';
      miniCtx.fillStyle='rgba(255,255,255,.92)';
      miniCtx.fillText(a.name, p.x+6, p.y+4);
    });
  }

  
  sync();
  camDist = autoDist();

  
  var __lpPulseStart = -1;
  var __lpPulseDur = 900; 
  var __lpHold = 0.0; 
  var __lastGeomKey = geom.value;
  function __startLPPulse(){ __lpPulseStart = performance.now(); __lpHold = 0.0; }

  function draw(ts){
    __drawRequested = false;
    if(ts && __perfLastTs && (ts-__perfLastTs) < __perfFrameMs){
      if(__lpPulseStart >= 0) requestRender();
      return;
    }
    if(ts) __perfLastTs = ts;
    resize();
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    var ex=camDist*Math.cos(rotX)*Math.sin(rotY), ey=camDist*Math.sin(rotX), ez=camDist*Math.cos(rotX)*Math.cos(rotY);
    var __camBasis = __getCameraBasis(ex,ey,ez);
    gl.uniform3f(U.uEye, ex,ey,ez);
    gl.uniform3f(U.uTarget, 0,0,0);
    gl.uniform3f(U.uUp, __camBasis.up[0], __camBasis.up[1], __camBasis.up[2]);
    var __now = performance.now();
    gl.uniform1f(U.uTime, (__now*0.001));

    var __keepRendering = false;
    if(U.uLPAnim){
      var lpAnim = (__lpHold||0.0);
      if(__lpPulseStart>=0){
        var tt=(__now-__lpPulseStart)/__lpPulseDur;
        if(tt>=1){ __lpPulseStart=-1; __lpHold=1.0; lpAnim=1.0; }
        else {
          var u=Math.max(0, Math.min(1, tt));
          lpAnim = 1.0 - Math.pow(1.0-u, 3.0);
          __lpHold = lpAnim;
          __keepRendering = true;
        }
      }
      if(geom && geom.value==='square_planar') lpAnim = 0.0;
      gl.uniform1f(U.uLPAnim, lpAnim);
    }
    gl.uniform3f(U.uRot, rot.x, rot.y, rot.z);
    __pushSceneUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    updateAxisLabels([ex,ey,ez]);
    drawMiniAxes();
    if(typeof window.__geomTutorialOnDraw === 'function'){
      try{ window.__geomTutorialOnDraw(); }catch(_e){}
    }
    if(__keepRendering) requestRender();
  }
  requestRender();

  function hexToRgb(hex){ var h=hex.replace('#',''); var v=parseInt(h,16); return [(v>>16&255)/255,(v>>8&255)/255,(v&255)/255]; }
  function padVecArray(arr,t){ var out=[]; for(var i=0;i<arr.length;i++){ out.push(arr[i][0],arr[i][1],arr[i][2]); } while(out.length<t*3) out.push(0,0,0); return new Float32Array(out.slice(0,t*3)); }
  function autoDist(){ var bl=parseFloat(bondLen.value); var R=Math.max(parseFloat(size.value), parseFloat(ligandRadius.value))+bl+0.5; return Math.min(10, Math.max(3.2, R*1.55)); }


  
  var __tutorialTweenId = 0;
  function __clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function __wrapAngle(v){
    if(!isFinite(v)) return 0;
    var two = Math.PI*2;
    v = (v + Math.PI) % two;
    if(v < 0) v += two;
    return v - Math.PI;
  }
  function __lerp(a,b,t){ return a + (b-a)*t; }
  function __ease(t){ return t<.5 ? 4.0*t*t*t : 1.0 - Math.pow(-2.0*t+2.0,3.0)/2.0; }
  function __setObjRotDeg(x,y,z){
    var zIn = (z==null?0:Number(z));
    var zx = (((zIn||0)%360)+360)%360;
    rot.x=(x||0)*DEG;
    rot.y=(y||0)*DEG;
    rot.z=zx*DEG;
    if(rotXS) rotXS.value=String(Math.round((x||0)));
    if(rotYS) rotYS.value=String(Math.round((y||0)));
    if(rotZS) rotZS.value=String(Math.round(zx));
    if(typeof tutorialRotZVal!=='undefined' && tutorialRotZVal){ tutorialRotZVal.textContent = Math.round(zx)+'°'; }
  }
  function __animateView(opts,dur){
    dur = Math.max(0, dur||900);
    var id = ++__tutorialTweenId;
    var s = { camDist:camDist, rotX:rotX, rotY:rotY, ox:rot.x, oy:rot.y, oz:rot.z };
    var e = {
      camDist: ('camDist' in opts)? __clamp(opts.camDist, 2.2, 14) : s.camDist,
      rotX: ('rotX' in opts)? __clamp(opts.rotX, -Math.PI/2+.05, Math.PI/2-.05) : s.rotX,
      rotY: ('rotY' in opts)? opts.rotY : s.rotY,
      ox: ('objRotXDeg' in opts)? (opts.objRotXDeg||0)*DEG : s.ox,
      oy: ('objRotYDeg' in opts)? (opts.objRotYDeg||0)*DEG : s.oy,
      oz: ('objRotZDeg' in opts)? (((opts.objRotZDeg||0)%360)+360)%360*DEG : s.oz
    };
    if(dur===0){ camDist=e.camDist; rotX=e.rotX; rotY=e.rotY; __syncOrbitFromAngles(); rot.x=e.ox; rot.y=e.oy; rot.z=e.oz; return Promise.resolve(); }
    return new Promise(function(resolve){
      var t0=performance.now();
      function step(now){
        if(id!==__tutorialTweenId){ resolve(false); return; }
        var t=(now-t0)/dur; if(t<0)t=0; if(t>1)t=1; t=__ease(t);
        camDist=__lerp(s.camDist,e.camDist,t);
        rotX=__lerp(s.rotX,e.rotX,t);
        rotY=__wrapAngle(__lerp(s.rotY,e.rotY,t));
        __syncOrbitFromAngles();
        rot.x=__lerp(s.ox,e.ox,t);
        rot.y=__lerp(s.oy,e.oy,t);
        rot.z=__lerp(s.oz,e.oz,t);
        requestRender();
        if(t<1) requestAnimationFrame(step); else resolve(true);
      }
      requestAnimationFrame(step);
    });
  }
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
    clearBalloons: function(){ __setBalloons3D(0,null); },
    setObjRotDeg: __setObjRotDeg,
    getView: function(){ return {camDist:camDist, rotX:rotX, rotY:rotY, objRotXDeg:rot.x/DEG, objRotYDeg:rot.y/DEG, objRotZDeg:rot.z/DEG}; },
    setView: function(o){ o=o||{}; if('camDist' in o) camDist=__clamp(o.camDist,2.2,14); if('rotX' in o) rotX=__clamp(o.rotX,-Math.PI/2+.05,Math.PI/2-.05); if('rotY' in o) rotY=__wrapAngle(o.rotY); __syncOrbitFromAngles(); if(('objRotXDeg' in o)||('objRotYDeg' in o)||('objRotZDeg' in o)) __setObjRotDeg(o.objRotXDeg||0,o.objRotYDeg||0,o.objRotZDeg||0); requestRender(); },
    animateTo: __animateView,
    requestRender: requestRender,
    pulse: function(){ var c=document.getElementById('tutorialCard'); if(!c) return; c.classList.remove('stepPulse'); void c.offsetWidth; c.classList.add('stepPulse'); setTimeout(function(){ c.classList.remove('stepPulse'); }, 700); }
  };
  try{ window.dispatchEvent(new CustomEvent('geom-api-ready')); }catch(_e){}

})();
