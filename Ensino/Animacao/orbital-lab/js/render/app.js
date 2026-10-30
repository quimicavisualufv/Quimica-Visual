/* Orbital Lab — simulador 3D independente: WebGL nativo, sem bibliotecas externas.
 * As superfícies são ilustrações das componentes angulares dos orbitais d.
 * Os desdobramentos de energia representam o modelo QUALITATIVO de campo cristalino.
 */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const ORBITS = [
    {id:'dxy', label:'d<sub>xy</sub>', tiny:'dxy', name:'dxy', orient:'Entre os eixos x e y, no plano xy.', formula:'ψ ∝ xy', desc:'Seus quatro lobos ocupam o plano xy e apontam entre os eixos x e y. Em um complexo octaédrico, evitam o alinhamento direto com os ligantes axiais.'},
    {id:'dxz', label:'d<sub>xz</sub>', tiny:'dxz', name:'dxz', orient:'Entre os eixos x e z, no plano xz.', formula:'ψ ∝ xz', desc:'Quatro lobos distribuídos no plano xz, voltados para as regiões intermediárias entre os dois eixos. Participa do conjunto t₂g no campo octaédrico.'},
    {id:'dyz', label:'d<sub>yz</sub>', tiny:'dyz', name:'dyz', orient:'Entre os eixos y e z, no plano yz.', formula:'ψ ∝ yz', desc:'Quatro lobos no plano yz, entre os eixos y e z. Sua disposição espacial é equivalente à dos orbitais dxy e dxz, apenas com outra orientação.'},
    {id:'dx2y2', label:'d<sub>x²−y²</sub>', tiny:'dx²−y²', name:'dx2-y2', orient:'Diretamente ao longo dos eixos +x, −x, +y e −y.', formula:'ψ ∝ x² − y²', desc:'Quatro lobos alinhados com os eixos x e y. Como aponta diretamente para os ligantes do plano, é o orbital de maior energia em um complexo quadrado planar.'},
    {id:'dz2', label:'d<sub>z²</sub>', tiny:'dz²', name:'dz2', orient:'Dois lobos no eixo z e um anel no plano xy.', formula:'ψ ∝ 3z² − r²', desc:'Possui dois lobos alongados no eixo z e um anel (região toroidal) no plano xy, de fase oposta. Sua energia responde fortemente a ligantes axiais.'}
  ];
  const DATA = {
    oct:{label:'Octaédrica',symbol:'Oₕ',heading:'OCTÁEDRICO',ligands:6,dir:'nos eixos x, y e z',delta:'Δ<sub>o</sub>', groups:['e<sub>g</sub> ↑','t<sub>2g</sub> ↓'], kind:'CAMPO OCTAÉDRICO', accent:[1.0,0.70,0.35], level:{dxy:-.4,dxz:-.4,dyz:-.4,dx2y2:.6,dz2:.6}, explanation:'Seis ligantes se aproximam pelos eixos ±x, ±y e ±z. Os orbitais d(x²−y²) e d(z²) apontam mais diretamente para eles, sofrem maior repulsão e formam o conjunto e<sub>g</sub>, de energia mais alta. Os três orbitais restantes compõem o t<sub>2g</sub>, de energia menor.'},
    tet:{label:'Tetraédrica',symbol:'Td',heading:'TETRAÉDRICO',ligands:4,dir:'em direções diagonais',delta:'Δ<sub>t</sub>',groups:['t<sub>2</sub> ↑','e ↓'],kind:'CAMPO TETRAÉDRICO',accent:[0.97,0.28,0.25],level:{dxy:.4*4/9,dxz:.4*4/9,dyz:.4*4/9,dx2y2:-.6*4/9,dz2:-.6*4/9},explanation:'Quatro ligantes se aproximam pelos vértices de um tetraedro, em direções entre os eixos cartesianos. Agora dxy, dxz e dyz interagem mais e formam o t<sub>2</sub> acima de e. É a inversão em relação ao octaédrico; em condições comparáveis, Δ<sub>t</sub> ≈ 4/9 Δ<sub>o</sub>.'},
    square:{label:'Quadrado planar',symbol:'D₄ₕ',heading:'QUADRADO PLANAR',ligands:4,dir:'nos eixos x e y, no plano xy',delta:'Δ<sub>1</sub> / Δ<sub>2</sub> / Δ<sub>3</sub>',groups:['d<sub>x²−y²</sub> ↑','d<sub>xz</sub>, d<sub>yz</sub> ↓'],kind:'CAMPO QUADRADO PLANAR',accent:[1.0,0.79,0.45],level:{dxy:.42,dxz:-.825,dyz:-.825,dx2y2:1.5,dz2:-.27},explanation:'Os quatro ligantes ficam sobre os eixos ±x e ±y, no mesmo plano. O d(x²−y²) enfrenta os ligantes diretamente e alcança a maior energia; abaixo aparecem dxy, dz² e o par degenerado dxz/dyz. Esta é a ordenação usual do esquema idealizado de campo cristalino.'}
  };
  const VECTORS = {
    oct:[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],
    tet:[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]],
    square:[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]]
  };
  const coords = (a) => { const l=Math.hypot(...a)||1; return a.map(v=>v/l); };
  Object.keys(VECTORS).forEach(k => VECTORS[k]=VECTORS[k].map(coords));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=(t)=>t*t*(3-2*t);
  const zoomToDist=(v)=>12.6-(Number(v)-45)/70*8.7;
  const distToZoom=(d)=>Math.round(45+(12.6-d)/8.7*70);
  const hexToRgb=(s)=>s.match(/.{2}/g).map(x=>parseInt(x,16)/255);
  const COLOR={positive:hexToRgb('f6c365'),negative:hexToRgb('f44741'),metal:hexToRgb('d9c6a8'),ligand:hexToRgb('eebc75'),outline:hexToRgb('ba8a57'),x:hexToRgb('ff4b46'),y:hexToRgb('e5b65f'),z:hexToRgb('d5bd95')};

  function sphereMesh(rings=30, segments=44) {
    const p=[],n=[],phase=[],indices=[];
    for(let i=0;i<=rings;i++){
      const t=i/rings*Math.PI;
      for(let j=0;j<=segments;j++){
        const a=j/segments*2*Math.PI;
        const x=Math.sin(t)*Math.cos(a), y=Math.cos(t), z=Math.sin(t)*Math.sin(a);
        p.push(x,y,z);n.push(x,y,z);phase.push(1);
      }
    }
    for(let i=0;i<rings;i++)for(let j=0;j<segments;j++){
      const a=i*(segments+1)+j,b=a+segments+1;
      indices.push(a,b,a+1,a+1,b,b+1);
    }
    return {p,n,phase,indices};
  }
  function angular(id,x,y,z){
    switch(id){case 'dxy':return 2*x*y;case 'dxz':return 2*x*z;case 'dyz':return 2*y*z;case 'dx2y2':return x*x-y*y;case 'dz2':return (3*z*z-1)/2;default:return 0;}
  }
  function orbitalMesh(id,rings=54,segments=90){
    const p=[], n=[], phase=[],indices=[];
    for(let i=0;i<=rings;i++){
      const theta=Math.PI*i/rings;
      for(let j=0;j<=segments;j++){
        const phi=2*Math.PI*j/segments;
        const x=Math.sin(theta)*Math.cos(phi), y=Math.sin(theta)*Math.sin(phi), z=Math.cos(theta);
        const val=angular(id,x,y,z);
        const rad=1.72*Math.pow(Math.abs(val),0.80);
        p.push(x*rad,y*rad,z*rad);phase.push(val<0?-1:1);n.push(0,0,0);
      }
    }
    for(let i=0;i<rings;i++)for(let j=0;j<segments;j++){
      const a=i*(segments+1)+j,b=a+segments+1;
      indices.push(a,a+1,b,a+1,b+1,b);
    }
    // Normais suaves a partir das faces, com orientação corrigida para fora.
    for(let i=0;i<indices.length;i+=3){
      const a=indices[i],b=indices[i+1],c=indices[i+2];
      const ax=p[a*3],ay=p[a*3+1],az=p[a*3+2];
      const ux=p[b*3]-ax,uy=p[b*3+1]-ay,uz=p[b*3+2]-az;
      const vx=p[c*3]-ax,vy=p[c*3+1]-ay,vz=p[c*3+2]-az;
      let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
      for(const k of [a,b,c]){n[k*3]+=nx;n[k*3+1]+=ny;n[k*3+2]+=nz;}
    }
    for(let i=0;i<p.length/3;i++){
      const k=i*3,rx=p[k],ry=p[k+1],rz=p[k+2],rad=Math.hypot(rx,ry,rz);
      let nx=n[k],ny=n[k+1],nz=n[k+2];
      if(nx*rx+ny*ry+nz*rz<0){nx=-nx;ny=-ny;nz=-nz;}
      nx=nx*.8+(rx/(rad||1))*.2;ny=ny*.8+(ry/(rad||1))*.2;nz=nz*.8+(rz/(rad||1))*.2;
      const len=Math.hypot(nx,ny,nz)||1;n[k]=nx/len;n[k+1]=ny/len;n[k+2]=nz/len;
    }
    return {p,n,phase,indices};
  }
  function rodMesh(segments=16){
    const p=[],n=[],phase=[];
    const push=(x,y,z)=>{p.push(x,y,z);n.push(x,0,z);phase.push(1);};
    for(let i=0;i<segments;i++){
      const a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments;
      const c1=Math.cos(a),s1=Math.sin(a),c2=Math.cos(b),s2=Math.sin(b);
      push(c1,0,s1);push(c2,0,s2);push(c1,1,s1);
      push(c1,1,s1);push(c2,0,s2);push(c2,1,s2);
    }
    return {p,n,phase,indices:null};
  }
  const GEOMETRY={sphere:sphereMesh(),rod:rodMesh(),orbital:{}};
  ORBITS.forEach(o=>GEOMETRY.orbital[o.id]=orbitalMesh(o.id));

  const VERTEX=`
    attribute vec3 aPosition; attribute vec3 aNormal; attribute float aPhase;
    uniform vec3 uTranslate; uniform float uScale,uYaw,uPitch,uDistance,uAspect,uFov;
    uniform float uIsRod, uRodRadius;uniform vec3 uRodA,uRodB;
    varying vec3 vNormal;varying vec3 vPos;varying float vPhase;
    void main(){
      vec3 pos,norm;
      if(uIsRod>.5){
        vec3 dir=normalize(uRodB-uRodA);
        vec3 seed=abs(dir.z)<.85 ? vec3(0.,0.,1.) : vec3(0.,1.,0.);
        vec3 right=normalize(cross(seed,dir));vec3 up=cross(dir,right);
        pos=mix(uRodA,uRodB,aPosition.y)+uRodRadius*(right*aPosition.x+up*aPosition.z);
        norm=normalize(right*aNormal.x+up*aNormal.z);
      }else{pos=aPosition*uScale+uTranslate;norm=aNormal;}
      float cy=cos(uYaw),sy=sin(uYaw),cx=cos(uPitch),sx=sin(uPitch);
      vec3 r=vec3(cy*pos.x+sy*pos.z,pos.y,-sy*pos.x+cy*pos.z);
      vec3 rn=vec3(cy*norm.x+sy*norm.z,norm.y,-sy*norm.x+cy*norm.z);
      r=vec3(r.x,cx*r.y-sx*r.z,sx*r.y+cx*r.z);
      rn=vec3(rn.x,cx*rn.y-sx*rn.z,sx*rn.y+cx*rn.z);
      vPos=r;vNormal=rn;vPhase=aPhase;
      vec3 view=r-vec3(0.,0.,uDistance);
      float zNear=.1,zFar=80.;
      gl_Position=vec4(view.x*uFov/uAspect,view.y*uFov,((zFar+zNear)/(zNear-zFar))*view.z+(2.*zFar*zNear)/(zNear-zFar),-view.z);
    }`;
  const FRAGMENT=`
    precision mediump float;
    varying vec3 vNormal,vPos;varying float vPhase;
    uniform vec3 uColorA,uColorB;uniform float uOpacity,uGloss;
    void main(){
      vec3 normal=normalize(vNormal);
      vec3 light=normalize(vec3(-.47,.8,1.15));
      float lambert=max(dot(normal,light),0.);
      float back=max(dot(normal,-light),0.);
      vec3 base=vPhase<0. ? uColorB:uColorA;
      float front=abs(dot(normal,normalize(vec3(0.,0.,8.)-vPos)));
      float rim=pow(1.-front,2.7);
      float spec=pow(max(dot(reflect(-light,normal),normalize(vec3(0.,0.,8.)-vPos)),0.),20.)*uGloss;
      vec3 col=base*(.38+.52*lambert+.12*back)+vec3(.46,.94,1.)*rim*.26+vec3(1.)*spec*.35;
      gl_FragColor=vec4(col,uOpacity);
    }`;

  class Renderer {
    constructor(canvas){
      this.canvas=canvas;this.gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,premultipliedAlpha:false}) || canvas.getContext('experimental-webgl');
      if(!this.gl){
        // Fallback de projeção 3D para navegadores/dispositivos sem suporte a WebGL.
        // Mantém as mesmas interações e permite uso em ambientes com GPU bloqueada.
        this.fallback=true;this.ctx=canvas.getContext('2d');this.meshCache=new Map();
        this.sphere={id:'sphere'};this.rod={id:'rod'};return;
      }
      const gl=this.gl;
      const makeShader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Erro no shader: '+gl.getShaderInfoLog(s));return s;};
      const prog=gl.createProgram();gl.attachShader(prog,makeShader(gl.VERTEX_SHADER,VERTEX));gl.attachShader(prog,makeShader(gl.FRAGMENT_SHADER,FRAGMENT));gl.linkProgram(prog);
      if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error('Falha ao criar programa WebGL: '+gl.getProgramInfoLog(prog));
      this.prog=prog;gl.useProgram(prog);
      this.attrs={};for(const name of ['aPosition','aNormal','aPhase'])this.attrs[name]=gl.getAttribLocation(prog,name);
      this.uni={};for(const name of ['uTranslate','uScale','uYaw','uPitch','uDistance','uAspect','uFov','uIsRod','uRodRadius','uRodA','uRodB','uColorA','uColorB','uOpacity','uGloss'])this.uni[name]=gl.getUniformLocation(prog,name);
      gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.CULL_FACE);
      this.meshCache=new Map();this.orbit=null;
      this.sphere=this.prepare('sphere',GEOMETRY.sphere);this.rod=this.prepare('rod',GEOMETRY.rod);
    }
    prepare(id,raw){
      if(this.fallback)return {id,raw};
      if(this.meshCache.has(id))return this.meshCache.get(id);
      const gl=this.gl;
      const buffer=(items,target)=>{const b=gl.createBuffer();gl.bindBuffer(target,b);gl.bufferData(target,items,gl.STATIC_DRAW);return b;};
      const data={raw,id,pos:buffer(new Float32Array(raw.p),gl.ARRAY_BUFFER),normal:buffer(new Float32Array(raw.n),gl.ARRAY_BUFFER),phase:buffer(new Float32Array(raw.phase),gl.ARRAY_BUFFER),size:raw.indices?raw.indices.length:raw.phase.length,index:null};
      if(raw.indices)data.index=buffer(new Uint16Array(raw.indices),gl.ELEMENT_ARRAY_BUFFER);
      this.meshCache.set(id,data);return data;
    }
    start(yaw,pitch,distance){
      this.view={yaw,pitch,distance,w:Math.max(1,this.canvas.clientWidth*Math.min(window.devicePixelRatio||1,2)),h:Math.max(1,this.canvas.clientHeight*Math.min(window.devicePixelRatio||1,2))};this.fallbackView=this.view;this.scene=[];const version=this.frameVersion=(this.frameVersion||0)+1;queueMicrotask(()=>{if(this.frameVersion===version)this.end();});
      if(this.fallback){
        const dpr=Math.min(window.devicePixelRatio||1,2),w=Math.max(1,Math.round(this.canvas.clientWidth*dpr)),h=Math.max(1,Math.round(this.canvas.clientHeight*dpr));
        if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
        this.ctx.clearRect(0,0,w,h);this.fallbackView={w,h,yaw,pitch,distance};return;
      }
      const gl=this.gl;
      if(this.failed)return;
      const dpr=Math.min(window.devicePixelRatio||1,2),width=Math.max(1,Math.round(this.canvas.clientWidth*dpr)),height=Math.max(1,Math.round(this.canvas.clientHeight*dpr));
      if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
      gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(this.prog);
      gl.uniform1f(this.uni.uYaw,yaw);gl.uniform1f(this.uni.uPitch,pitch);gl.uniform1f(this.uni.uDistance,distance);
      gl.uniform1f(this.uni.uFov,2.41421);gl.uniform1f(this.uni.uAspect,width/height);
    }
    _drawImmediate(mesh,colorA,colorB=colorA,opacity=1,scale=1,translate=[0,0,0],gloss=.65,rod=null){
      if(this.fallback){
        if(rod)this.softwareRod(rod.a,rod.b,rod.radius,colorA,opacity);
        else if(mesh.id==='sphere')this.softwareBall(translate,scale,colorA,opacity);
        else if(mesh.id.startsWith('o'))this.softwareOrbital(mesh.id.substring(1),opacity,scale);
        return;
      }
      const gl=this.gl;if(this.failed)return;
      gl.uniform3fv(this.uni.uColorA,colorA);gl.uniform3fv(this.uni.uColorB,colorB);gl.uniform1f(this.uni.uOpacity,opacity);gl.uniform1f(this.uni.uGloss,gloss);
      gl.uniform3fv(this.uni.uTranslate,translate);gl.uniform1f(this.uni.uScale,scale);
      gl.uniform1f(this.uni.uIsRod,rod?1:0);
      if(rod){gl.uniform1f(this.uni.uRodRadius,rod.radius);gl.uniform3fv(this.uni.uRodA,rod.a);gl.uniform3fv(this.uni.uRodB,rod.b);}
      for(const [key,buffer,size] of [['aPosition',mesh.pos,3],['aNormal',mesh.normal,3],['aPhase',mesh.phase,1]]){
        const loc=this.attrs[key];if(loc<0)continue;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(loc);
      }
      gl.depthMask(opacity>=.99);
      if(mesh.index){this.sortTransparentMesh(mesh,opacity,scale,translate);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.index);gl.drawElements(gl.TRIANGLES,mesh.size,gl.UNSIGNED_SHORT,0);}
      else gl.drawArrays(gl.TRIANGLES,0,mesh.size);
      gl.depthMask(true);
    }
    draw(mesh,colorA,colorB=colorA,opacity=1,scale=1,translate=[0,0,0],gloss=.65,rod=null){
      if(opacity<=0||this.failed)return;if(!this.scene){this._drawImmediate(mesh,colorA,colorB,opacity,scale,translate,gloss,rod);return;}
      const args=[mesh,colorA,colorB,opacity,scale,translate,gloss,rod],axis=!!this.axisDrawing;
      if(this.fallback){
        if(rod){const count=Math.max(2,Math.ceil(Math.hypot(...rod.a.map((x,i)=>x-rod.b[i]))/.22));for(let i=0;i<count;i++){const a=rod.a.map((x,k)=>x+(rod.b[k]-x)*i/count),b=rod.a.map((x,k)=>x+(rod.b[k]-x)*(i+1)/count),mid=a.map((x,k)=>(x+b[k])/2);this.scene.push({axis,depth:this.transform(mid)[2],paint:()=>this.softwareRod(a,b,rod.radius,colorA,opacity)});}return;}
        if(mesh.id==='sphere'){this.scene.push({axis,depth:this.transform(translate)[2]+scale*.45,paint:()=>this.softwareBall(translate,scale,colorA,opacity)});return;}
        if(mesh.id.startsWith('o')){this.softwareOrbital(mesh.id.substring(1),opacity,scale,true);return;}
      }
      const center=rod?rod.a.map((x,i)=>(x+rod.b[i])/2):translate;
      this.scene.push({axis,depth:this.transform(center)[2],opaque:opacity>=.99,args});
    }
    end(){
      if(!this.scene)return;const scene=this.scene;this.scene=null;
      const background=scene.filter(s=>s.axis),objects=scene.filter(s=>!s.axis);
      if(this.fallback){for(const s of [...background.sort((a,b)=>a.depth-b.depth),...objects.sort((a,b)=>a.depth-b.depth)])s.paint();}
      else{for(const s of background)this._drawImmediate(...s.args);for(const s of objects.filter(s=>s.opaque))this._drawImmediate(...s.args);for(const s of objects.filter(s=>!s.opaque).sort((a,b)=>a.depth-b.depth))this._drawImmediate(...s.args);this.gl.depthMask(true);}
    }
    sortTransparentMesh(mesh,opacity,scale,translate){
      if(opacity>=.99||!mesh.raw?.indices)return;
      const {yaw,pitch}=this.view,key=Math.round(yaw*40)+':'+Math.round(pitch*40);if(mesh.sortKey===key)return;
      const p=mesh.raw.p,idx=mesh.raw.indices,cy=Math.cos(yaw),sy=Math.sin(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch),triangles=[];
      for(let i=0;i<idx.length;i+=3){const a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3,x=(p[a]+p[b]+p[c])/3,y=(p[a+1]+p[b+1]+p[c+1])/3,z=(p[a+2]+p[b+2]+p[c+2])/3;triangles.push({i,z:sp*y+cp*(-sy*x+cy*z)});}
      triangles.sort((a,b)=>a.z-b.z);const sorted=new Uint16Array(idx.length);for(let i=0;i<triangles.length;i++){const j=triangles[i].i;sorted.set([idx[j],idx[j+1],idx[j+2]],i*3);}
      const gl=this.gl;gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.index);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,sorted,gl.DYNAMIC_DRAW);mesh.sortKey=key;
    }
    projectPoint(pos){const p=this.project(pos),ratio=Math.min(window.devicePixelRatio||1,2);return {...p,x:p.x/ratio,y:p.y/ratio};}
    rgb(a){return 'rgb('+a.map(v=>Math.round(v*255)).join(',')+')';}
    rgba(a,alpha){return 'rgba('+a.map(v=>Math.round(v*255)).join(',')+','+alpha+')';}
    transform(a){
      const {yaw,pitch}=this.fallbackView,cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
      const x=cy*a[0]+sy*a[2],z=-sy*a[0]+cy*a[2];
      return [x,cx*a[1]-sx*z,sx*a[1]+cx*z];
    }
    project(a){
      const [x,y,z]=this.transform(a),{w,h,distance}=this.fallbackView,focal=h*1.207;
      const factor=focal/Math.max(1,distance-z);
      return {x:w/2+x*factor,y:h/2-y*factor,fac:factor,z};
    }
    softwareRod(a,b,r,color,opacity){
      const A=this.project(a),B=this.project(b),ctx=this.ctx,{h}=this.fallbackView;
      ctx.save();ctx.globalAlpha=opacity;ctx.lineCap='round';ctx.lineWidth=Math.max(1.1,r*2*(A.fac+B.fac)*.5);
      ctx.strokeStyle=this.rgb(color);ctx.shadowColor=this.rgba(color,.45);ctx.shadowBlur=ctx.lineWidth*3;
      ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();ctx.restore();
    }
    softwareBall(pos,r,color,opacity){
      const c=this.project(pos),rad=Math.max(2,r*c.fac),ctx=this.ctx;
      ctx.save();ctx.globalAlpha=opacity;
      const g=ctx.createRadialGradient(c.x-rad*.35,c.y-rad*.36,rad*.06,c.x,c.y,rad);
      g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.16,this.rgb(color));g.addColorStop(.62,this.rgb(color));g.addColorStop(1,'rgba(22,18,17,.92)');
      ctx.shadowColor=this.rgba(color,.4);ctx.shadowBlur=rad*.75;
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x,c.y,rad,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    softwareOrbital(id,opacity,scale,enqueue=false){
      const dirs=[],ctx=this.ctx,add=(depth,paint)=>enqueue?this.scene.push({depth,axis:false,paint}):paint();
      if(id==='dz2'){
        for(let i=0;i<72;i++){const a=i/72*Math.PI*2,b=(i+1)/72*Math.PI*2,mid=[.94*scale*Math.cos((a+b)/2),.94*scale*Math.sin((a+b)/2),0],A=[.94*scale*Math.cos(a),.94*scale*Math.sin(a),0],B=[.94*scale*Math.cos(b),.94*scale*Math.sin(b),0];add(this.transform(mid)[2],()=>this.softwareRod(A,B,.16*scale,COLOR.negative,opacity*.18));}
        dirs.push({v:[0,0,1],phase:1},{v:[0,0,-1],phase:1});
      }else if(id==='dx2y2')dirs.push({v:[1,0,0],phase:1},{v:[-1,0,0],phase:1},{v:[0,1,0],phase:-1},{v:[0,-1,0],phase:-1});
      else{const pair=id==='dxy'?[0,1]:id==='dxz'?[0,2]:[1,2];for(const u of [-1,1])for(const v of [-1,1]){const xyz=[0,0,0];xyz[pair[0]]=u;xyz[pair[1]]=v;dirs.push({v:coords(xyz),phase:u*v});}}
      for(const data of dirs){const center=data.v.map(v=>v*.92*scale);add(this.transform(center)[2],()=>this.softwareLobe(data,opacity,scale));}
    }
    softwareLobe(data,opacity,scale){
      const ctx=this.ctx,col=data.phase>0?COLOR.positive:COLOR.negative,base=this.project([0,0,0]),end=this.project(data.v.map(n=>n*1.72*scale));
      const dx=end.x-base.x,dy=end.y-base.y,d=Math.hypot(dx,dy),along=d>2?Math.atan2(dy,dx):-.75;
      const major=Math.max(16*scale,d*.57),minor=Math.max(11*scale,Math.min(major*.69,1.72*scale*base.fac*.32)),x=base.x+dx*.54,y=base.y+dy*.54;
      const g=ctx.createRadialGradient(x-major*.2,y-minor*.24,2,x,y,major*1.15);g.addColorStop(0,'rgba(241,202,118,.97)');g.addColorStop(.15,this.rgba(col,1));g.addColorStop(.58,this.rgba(col,.88));g.addColorStop(1,this.rgba(col,.16));
      ctx.save();ctx.translate(x,y);ctx.rotate(along);ctx.globalAlpha=opacity;ctx.shadowBlur=12;ctx.shadowColor=this.rgba(col,.35);ctx.fillStyle=g;ctx.strokeStyle=this.rgba(col,.43);ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(0,0,major,minor,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
    }
    orbital(id,opacity=0.88,scale=1){
      const mesh=this.prepare('o'+id,GEOMETRY.orbital[id]);
      this.draw(mesh,COLOR.positive,COLOR.negative,opacity,scale,[0,0,0],.85);
    }
    ball(pos,rad,color,opacity=1){this.draw(this.sphere,color,color,opacity,rad,pos,1.2);}
    segment(a,b,r,color,opacity=1){this.draw(this.rod,color,color,opacity,1,[0,0,0],.55,{a,b,radius:r});}
    axes(length=2.4,opacity=.32){this.axisDrawing=true;
      this.segment([-length,0,0],[length,0,0],.011,COLOR.x,opacity);
      this.segment([0,-length,0],[0,length,0],.011,COLOR.y,opacity);
      this.segment([0,0,-length],[0,0,length],.011,COLOR.z,opacity);
      this.ball([length,0,0],.053,COLOR.x,.8);this.ball([0,length,0],.053,COLOR.y,.8);this.ball([0,0,length],.053,COLOR.z,.8);this.axisDrawing=false;
    }
  }

  let orbRenderer,geomRenderer;
  const state={needsRender:true,ligandOffsets:{oct:{},tet:{},square:{}},dragLigand:null,mode:'orbitals',orbital:'dxy',geometry:'oct',highlight:'dx2y2',orbYaw:.58,orbPitch:-.32,geomYaw:.64,geomPitch:-.39,orbDistance:7.3,geomDistance:8.65,autoRotate:true,playing:false,progress:0,axial:false,lastFrame:0};
  const orbIndex=(id)=>ORBITS.findIndex(o=>o.id===id);
  function selectOrbital(id){
    const data=ORBITS.find(o=>o.id===id);if(!data)return;
    state.needsRender=true;state.orbital=id;$('orbInfoTitle').innerHTML=data.label;$('stageOrbitalName').innerHTML=data.label;
    $('orbDescription').textContent=data.desc;$('orbOrientation').textContent=data.orient;$('orbFormula').textContent=data.formula;
    $('orbFigureNumber').textContent=String(orbIndex(id)+1).padStart(2,'0');
    document.querySelectorAll('.orbital-card').forEach(b=>{const selected=b.dataset.orbital===id;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected?'true':'false');});
  }
  function selectFocus(id){
    state.needsRender=true;state.highlight=id;document.querySelectorAll('.focus-orbital').forEach(b=>{const selected=b.dataset.focus===id;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected?'true':'false');});
    updateEnergy();
  }
  function setMode(mode){
    if(!document.getElementById(mode+'Module'))return;state.needsRender=true;state.mode=mode;document.querySelectorAll('[data-mode]').forEach(button=>{
      const on=button.dataset.mode===mode;button.classList.toggle('active',on);
      if(button.hasAttribute('role'))button.setAttribute('aria-selected',String(on));
      if(button.classList.contains('side-link')){if(on)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');}
    });
    $('orbitalsModule').classList.toggle('visible',mode==='orbitals');
    $('geometriesModule').classList.toggle('visible',mode==='geometries');
    for(const key of ['compare','electrons','classroom','challenges','ligands','advanced','database','spectra','aom'])$(key+'Module').classList.toggle('visible',mode===key);
    $('breadcrumbCurrent').textContent=({orbitals:'ORBITAIS d',geometries:'CAMPO CRISTALINO',compare:'COMPARAÇÃO',electrons:'ELÉTRONS & SPIN',classroom:'ROTEIRO GUIADO',challenges:'DESAFIOS',ligands:'LIGANTES & TROCAS',advanced:'EXPERIMENTOS',database:'DADOS REAIS',spectra:'ESPECTROSCOPIA',aom:'MODELO AOM'})[mode];
    $('heroTitle').innerHTML=({orbitals:'A geometria dos <em>orbitais d.</em>',geometries:'Como os ligantes <em>mudam a energia.</em>',compare:'Três campos. <em>Três assinaturas.</em>',electrons:'Os elétrons <em>ocupam o campo.</em>',classroom:'Explore cada ideia. <em>Na mesma tela.</em>',challenges:'Teste ideias. <em>Descubra relações.</em>',ligands:'Troque ligantes. <em>Observe o campo.</em>',advanced:'Deforme o campo. <em>Veja as diferenças.</em>',database:'Conhecimento com <em>rastreabilidade.</em>',spectra:'Espectros e <em>termos eletrônicos.</em>',aom:'Do ângulo à <em>energia orbital.</em>'})[mode];
    $('heroSubtitle').textContent=({orbitals:'Explore as superfícies angulares dos cinco orbitais d, as fases e os eixos.',geometries:'Arraste cada esfera dourada para alterar sua distância; o diagrama responde à sua manipulação.',compare:'Observe os três arranjos 3D e seus desdobramentos com o mesmo progresso.',electrons:'Distribua até dez elétrons d, compare spin alto e baixo e estime propriedades magnéticas.',classroom:'Doze etapas com modelo interativo e gráficos integrados ao roteiro.',challenges:'Vinte questões comentadas sobre orbitais, campo, spin e substituição.',ligands:'Compare ligantes, acompanhe a substituição e separe campo, cinética e equilíbrio.',advanced:'Alongue, comprima ou remova os ligantes axiais e acompanhe a evolução esquemática dos níveis.',database:'Compare Δ publicado, energia e magnetismo estimado, com fonte e incerteza declaradas.',spectra:'Calcule curvas d⁸ com parâmetros de Racah e compare a posições de absorção publicadas.',aom:'Explore uma matriz angular 5×5 e importe estruturas CIF para testar a geometria do campo.'})[mode];
    $('moduleSelect').value=mode;document.title='Orbital Lab · '+$('moduleSelect').selectedOptions[0].textContent;
    state.playing=false;updatePlayButton();
    if(mode==='geometries')updateEnergy();if(mode==='orbitals')renderMiniatures();
    if(window.OrbitalLab2 && window.OrbitalLab2.onMode) window.OrbitalLab2.onMode(mode);
    if(window.OrbitalScienceUI && window.OrbitalScienceUI.onMode) window.OrbitalScienceUI.onMode(mode);
    if(window.OrbitalTeachingUI)window.OrbitalTeachingUI.onMode(mode);
    window.scrollTo({top:0,behavior:'instant'});
  }
  function renderMiniatures(){
    document.querySelectorAll('.mini-canvas').forEach(canvas=>{
      try{
        const renderer=canvas._renderer || (canvas._renderer=new Renderer(canvas));if(renderer.failed)return;
        renderer.start(.65,-.32,5.4);renderer.orbital(canvas.dataset.preview,.94,.86);renderer.ball([0,0,0],.13,COLOR.metal,1);
      }catch(err){console.warn('Miniatura WebGL:',err);}
    });
  }
  function buildCards(){
    $('orbitalList').innerHTML=ORBITS.map(o=>`<button class="orbital-card" data-orbital="${o.id}" aria-pressed="false"><canvas class="mini-canvas" data-preview="${o.id}" aria-hidden="true"></canvas><div class="orbital-card-title"><span>${o.label}</span><span class="selected-indicator">✓</span></div><div class="orbital-card-subtitle">VISUALIZAR EM 3D</div></button>`).join('');
    document.querySelectorAll('.orbital-card').forEach(button=>button.addEventListener('click',()=>{state.autoRotate=false;updateRotateButton();selectOrbital(button.dataset.orbital);}));
    $('focusOrbitalList').innerHTML=ORBITS.map(o=>`<button class="focus-orbital" data-focus="${o.id}" aria-pressed="false" title="Destacar orbital ${o.name}">${o.label}</button>`).join('');
    document.querySelectorAll('.focus-orbital').forEach(button=>button.addEventListener('click',()=>selectFocus(button.dataset.focus)));
    renderMiniatures();
  }
  function setGeometry(geom){
    if(!DATA[geom])return;state.needsRender=true;state.geometry=geom;state.progress=0;state.playing=false;state.axial=false;state.dragLigand=null;
    document.querySelectorAll('.geometry-choice').forEach(button=>{button.classList.toggle('active',button.dataset.geom===geom);button.setAttribute('aria-pressed',String(button.dataset.geom===geom));});
    $('geomHeader').textContent=DATA[geom].heading;$('geomCount').textContent=String(DATA[geom].ligands).padStart(2,'0')+' LIGANTES';
    $('geometryDisplayName').textContent=DATA[geom].label+' ('+DATA[geom].symbol+')';
    $('energyGeom').textContent=DATA[geom].kind;$('deltaSymbol').innerHTML=DATA[geom].delta;
    $('energyGroupTop').innerHTML=DATA[geom].groups[0];$('energyGroupBottom').innerHTML=DATA[geom].groups[1];
    $('explainTitle').textContent=geom==='oct'?'Os ligantes chegam pelos eixos.':geom==='tet'?'Os ligantes vêm pelas diagonais.':'Os quatro ligantes ocupam o plano xy.';
    $('explainText').innerHTML=DATA[geom].explanation;
    $('explainerTag').textContent='POR QUE ISSO ACONTECE?';
    $('squareExtra').classList.toggle('visible',geom==='square');$('axialModeButton').classList.remove('active');
    $('axialModeButton').textContent='⇅   Mostrar remoção dos ligantes axiais (±z)';
    $('simulationTitle').textContent='Aproximação dos ligantes';
    $('ligandRadial').disabled=false;$('ligandSelect').disabled=false;$('resetLigands').disabled=false;$('progressSlider').value='0';updatePlayButton();updateEnergy();updateLigandEditor();
  }
  function updatePlayButton(){
    $('playIcon').textContent=state.playing?'Ⅱ':'▶';
    $('playText').textContent=state.playing?'Pausar animação':state.progress>=1?'Reproduzir de novo':'Iniciar animação';
  }
  function updateRotateButton(){
    $('autoRotate').classList.toggle('active-toggle',state.autoRotate);
    $('autoRotate').setAttribute('aria-pressed',String(state.autoRotate));
  }
  function setProgress(p,stop=true){
    state.needsRender=true;state.progress=clamp(p,0,1);$('progressSlider').value=String(Math.round(state.progress*100));
    if(stop)state.playing=false;
    updatePlayButton();updateEnergy();updateLigandEditor();
  }
  function interactionMagnitude(id,v){
    const [x,y,z]=v;
    const a={dxy:Math.sqrt(3)*x*y,dxz:Math.sqrt(3)*x*z,dyz:Math.sqrt(3)*y*z,dx2y2:Math.sqrt(3)/2*(x*x-y*y),dz2:(3*z*z-1)/2}[id];
    return a*a;
  }
  function ligandDistance(i){
    const point=VECTORS[state.geometry][i];
    return clamp((3.55-1.41*ease(state.progress))+(state.ligandOffsets[state.geometry][i]||0),1.55,4.60);
  }
  function displacementEnergy(id){
    // Perturbação fenomenológica, com termos angulares de harmônicos esféricos reais.
    // Desvio é zero na geometria regular. Não constitui um cálculo quântico.
    const vecs=VECTORS[state.geometry];
    const sums={};for(const o of ORBITS)sums[o.id]=0;
    for(let i=0;i<vecs.length;i++){
      const r=ligandDistance(i),regular=Math.max(1.55,3.55-1.41*ease(state.progress));
      const deviation=Math.pow(2.14/r,3)-Math.pow(2.14/regular,3);
      for(const o of ORBITS)sums[o.id]+=interactionMagnitude(o.id,vecs[i])*deviation;
    }
    const barycenter=Object.values(sums).reduce((a,b)=>a+b,0)/5;
    return (sums[id]-barycenter)*.24;
  }
  function energyFor(id){
    const v=DATA[state.geometry].level[id];
    if(state.axial&&state.geometry==='square')return lerp(DATA.oct.level[id],v,ease(state.progress));
    return v*ease(state.progress)+displacementEnergy(id);
  }
  const trackColors={dxy:'#f8ce98',dxz:'#f15a50',dyz:'#f15a50',dx2y2:'#eebb4f',dz2:'#f26359'};
  const trackColumns=[93,168,243,318,393];
  function setupEnergy(){
    let html='';
    for(let i=0;i<ORBITS.length;i++){
      const o=ORBITS[i],x=trackColumns[i];
      html+=`<g id="g-${o.id}"><text x="${x}" y="36" text-anchor="middle" fill="#f1584f" font-family="sans-serif" font-weight="600" font-size="12">${o.tiny}</text><line id="guide-${o.id}" x1="${x}" y1="158" x2="${x}" y2="158" stroke="${trackColors[o.id]}" stroke-dasharray="3 5" stroke-width="1.2" opacity=".4"/><line id="energy-${o.id}" x1="${x-24}" y1="158" x2="${x+24}" y2="158" stroke="${trackColors[o.id]}" stroke-width="5" stroke-linecap="round"/><circle id="dot-${o.id}" cx="${x+24}" cy="158" r="3.8" fill="${trackColors[o.id]}"/><text id="energyvalue-${o.id}" x="${x}" y="280" text-anchor="middle" font-size="10" fill="#b0a59b" font-family="sans-serif">E₀</text></g>`;
    }
    $('energyDynamic').innerHTML=html;
  }
  function updateEnergy(){
    if(!DATA[state.geometry])return;
    state.needsRender=true;const p=state.progress;
    const levels=ORBITS.map(o=>energyFor(o.id)),scale=80/Math.max(1,...levels.map(v=>Math.abs(v)/1.4));
    $('progressText').textContent=Math.round(p*100)+'%';
    $('sceneProgressName').textContent=p<.07?(state.axial?'OCTAEDRO INICIAL':'AGUARDANDO LIGANTES'):(p>.94?'GEOMETRIA FORMADA':state.axial?'AFASTANDO LIGANTES ±Z':'LIGANTES SE APROXIMANDO');
    for(const o of ORBITS){
      const level=energyFor(o.id);const y=158-level*scale;
      const l=$('energy-'+o.id),g=$('guide-'+o.id),d=$('dot-'+o.id),text=$('energyvalue-'+o.id);
      if(!l)continue;
      l.setAttribute('y1',String(y));l.setAttribute('y2',String(y));
      g.setAttribute('y2',String(y));d.setAttribute('cy',String(y));
      l.setAttribute('stroke-width',state.highlight===o.id?'8':'4.5');
      l.setAttribute('opacity',state.highlight===o.id?'1':'.75');
      d.setAttribute('r',state.highlight===o.id?'5':'3.2');
      text.textContent=Math.abs(level)<.009?'E₀':level>0?'↑ Energia':'↓ Energia';
      text.setAttribute('fill',state.highlight===o.id?'#f0c569':'#aca095');
    }
    if(state.axial&&state.geometry==='square'){
      $('energyGroupTop').innerHTML='d<sub>x²−y²</sub> ↑';
      $('energyGroupBottom').innerHTML='dxz / dyz ↓';
    }
  }
  function toggleAxial(){
    state.axial=!state.axial;setProgress(0);$('ligandRadial').disabled=state.axial;$('ligandSelect').disabled=state.axial;$('resetLigands').disabled=state.axial;
    $('ligandEditorStatus').textContent=state.axial?'Neste experimento, use o progresso para afastar os ligantes axiais.':'Arraste um ligante dourado ou ajuste a distância abaixo.';
    const b=$('axialModeButton');b.classList.toggle('active',state.axial);
    b.textContent=state.axial?'↩   Voltar à aproximação padrão':'⇅   Mostrar remoção dos ligantes axiais (±z)';
    $('simulationTitle').textContent=state.axial?'Remoção gradual dos ligantes ±z':'Aproximação dos ligantes';
    $('explainTitle').textContent=state.axial?'Do octaedro ao quadrado planar.':'Os quatro ligantes ocupam o plano xy.';
    $('explainText').innerHTML=state.axial?'Partimos de um complexo octaédrico com seis ligantes. Ao afastar os dois ligantes axiais (±z), a repulsão sobre d(z²), dxz e dyz diminui, enquanto os orbitais do plano passam a dominar o desdobramento. O diagrama mostra uma transição <b>esquemática</b> entre os limites octaédrico e quadrado planar.':DATA.square.explanation;
    $('explainerTag').textContent=state.axial?'EXPERIMENTO EXTRA · REMOÇÃO AXIAL':'POR QUE ISSO ACONTECE?';
  }
  let selectedLigand=0;
  function updateLigandEditor(selected){
    if(Number.isInteger(selected))selectedLigand=selected;
    const select=$('ligandSelect');if(!select)return;
    const vect=VECTORS[state.geometry];
    const desired=String(selectedLigand=Math.min(selectedLigand,vect.length-1));
    {select.innerHTML=vect.map((v,i)=>`<option value="${i}">L${i+1} · ${v.map(x=>x.toFixed(2)).join(', ')}</option>`).join('');}
    select.value=desired;
    const r=ligandDistance(selectedLigand);
    $('ligandRadial').value=Math.round(r*100);
    $('ligandRadialValue').textContent=(r/2.14).toFixed(2).replace('.',',')+'×';
  }
  function vecScale(a,s){return a.map(v=>v*s);}
  function drawOrbitStage(){
    if(!orbRenderer||orbRenderer.failed)return;
    orbRenderer.start(state.orbYaw,state.orbPitch,state.orbDistance);
    orbRenderer.axes(2.36,.24);
    orbRenderer.orbital(state.orbital,.85,1.17);
    orbRenderer.ball([0,0,0],.16,COLOR.metal);
  }
  function drawGeometryStage(){
    if(!geomRenderer||geomRenderer.failed)return;
    const p=ease(state.progress),geom=state.geometry,axial=state.axial&&geom==='square';
    geomRenderer.start(state.geomYaw,state.geomPitch,state.geomDistance);
    geomRenderer.axes(2.7,.29);
    const points=[];
    if(axial){
      for(let i=0;i<6;i++){
        const v=VECTORS.oct[i],distance=i<4?2.12:lerp(2.12,4.62,p);
        points.push({pos:vecScale(v,distance),opacity:i<4?1:Math.max(.02,1-p*.96),active:i<4});
      }
    }else{
      for(let i=0;i<VECTORS[geom].length;i++){const v=VECTORS[geom][i];points.push({pos:vecScale(v,ligandDistance(i)),opacity:1,active:true});}
    }
    // A poliedro surge com os ligantes e delimita sua disposição no espaço.
    if(p>.28){
      const o=clamp((p-.28)/.4,0,.4);
      for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
        const a=points[i],b=points[j];if(!a.active||!b.active)continue;
        const dot=a.pos.reduce((sum,v,k)=>sum+v*b.pos[k],0)/(Math.hypot(...a.pos)*Math.hypot(...b.pos));
        if(dot>-.5&&dot<.52)geomRenderer.segment(a.pos,b.pos,.013,COLOR.outline,o);
      }
    }
    if($('showOrbital').checked){
      // Superfície semitransparente de UM orbital selecionado para evitar sobreposição excessiva.
      geomRenderer.orbital(state.highlight,.30,1.04);
    }
    for(let i=0;i<points.length;i++){
      const point=points[i],pos=point.pos,opacity=point.opacity;
      if((axial&&i<4)||(!axial&&p>.15)){
        const bondOpacity=axial?.65:clamp((p-.14)*1.2,0,.83);
        geomRenderer.segment([0,0,0],pos,.035,COLOR.outline,bondOpacity*opacity);
      }
      if(!axial&&p<.84){
        const v=VECTORS[geom][i],end=vecScale(v,Math.max(2.43,3.3-p*.68)),start=vecScale(v,Math.max(2.69,3.6-p*.68));
        geomRenderer.segment(start,end,.026,COLOR.ligand,(1-p)*.76);
      }
      geomRenderer.ball(pos,.23,DATA[geom].accent,opacity);
    }
    geomRenderer.ball([0,0,0],.285,COLOR.metal,1);
  }
  function pickLigandOnCanvas(e){
    if(!geomRenderer||!geomRenderer.canvas||state.axial)return -1;
    const canvas=geomRenderer.canvas,rect=canvas.getBoundingClientRect();
    const x=(e.clientX-rect.left)*(canvas.width/rect.width),y=(e.clientY-rect.top)*(canvas.height/rect.height);
    const yaw=state.geomYaw,pitch=state.geomPitch,dist=state.geomDistance,w=canvas.width,h=canvas.height;
    let best=-1,min=48*(canvas.width/rect.width);
    VECTORS[state.geometry].forEach((v,i)=>{
      const r=ligandDistance(i),pos=v.map(n=>n*r),cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
      const X=cy*pos[0]+sy*pos[2],Z=-sy*pos[0]+cy*pos[2],Y=cp*pos[1]-sp*Z,Z2=sp*pos[1]+cp*Z;
      const fac=h*1.207/Math.max(.5,dist-Z2),sx=w/2+X*fac,sy2=h/2-Y*fac;
      const d=Math.hypot(x-sx,y-sy2);if(d<min){min=d;best=i;}
    });return best;
  }
  function dragCanvas(canvas,type){
    let pointer=null,x=0,y=0;
    const get=(key)=>type==='orb'?'orb'+key:'geom'+key;
    canvas.addEventListener('pointerdown',e=>{
      if(pointer!==null)return;pointer=e.pointerId;x=e.clientX;y=e.clientY;
      if(type==='geom'&&!state.axial){
        const pick=pickLigandOnCanvas(e);
        if(pick>=0){state.dragLigand=pick;state.playing=false;updatePlayButton();canvas.style.cursor='grabbing';$('ligandEditorStatus').textContent='LIGANTE '+(pick+1)+' SELECIONADO · arraste para cima/baixo ou para dentro/fora';}
      }
      canvas.setPointerCapture(pointer);
      if(type==='orb'){state.autoRotate=false;updateRotateButton();}
    });
    canvas.addEventListener('pointermove',e=>{
      if(e.pointerId!==pointer)return;
      const dx=e.clientX-x,dy=e.clientY-y;x=e.clientX;y=e.clientY;
      if(type==='geom'&&state.dragLigand!==null){
        const i=state.dragLigand,old=state.ligandOffsets[state.geometry][i]||0;
        const base=3.55-1.41*ease(state.progress);state.ligandOffsets[state.geometry][i]=clamp(old+(dx-dy)*.011,1.55-base,4.60-base);
        const r=ligandDistance(i);$('ligandEditorStatus').textContent='LIGANTE '+(i+1)+' · distância relativa '+(r/2.14).toFixed(2)+'× · energia atualizada';
        updateEnergy();updateLigandEditor(i);return;
      }
      const yaw=get('Yaw'),pitch=get('Pitch');state[yaw]+=dx*.009;state[pitch]=clamp(state[pitch]+dy*.009,-1.55,1.55);
    });
    for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,()=>{pointer=null;state.dragLigand=null;canvas.style.cursor='grab';});
    canvas.addEventListener('wheel',e=>{
      e.preventDefault();const k=get('Distance');state[k]=clamp(state[k]+e.deltaY*.006,3.9,12.6);
      if(type==='orb')$('orbZoom').value=String(distToZoom(state.orbDistance));
    },{passive:false});
    canvas.addEventListener('keydown',e=>{
      const yaw=get('Yaw'),pitch=get('Pitch'),dist=get('Distance');let done=true;
      switch(e.key){case'ArrowLeft':state[yaw]-=.15;break;case'ArrowRight':state[yaw]+=.15;break;case'ArrowUp':state[pitch]=clamp(state[pitch]-.15,-1.55,1.55);break;case'ArrowDown':state[pitch]=clamp(state[pitch]+.15,-1.55,1.55);break;case'+':case'=':state[dist]=clamp(state[dist]-.4,3.9,12.6);break;case'-':state[dist]=clamp(state[dist]+.4,3.9,12.6);break;default:done=false;}
      if(done){e.preventDefault();if(type==='orb'){$('orbZoom').value=distToZoom(state.orbDistance);state.autoRotate=false;updateRotateButton();}}
    });
  }
  function loop(now){
    if(document.hidden){state.lastFrame=now;requestAnimationFrame(loop);return;}
    const dt=Math.min((now-state.lastFrame)||16.667,70);state.lastFrame=now;
    if(state.mode==='orbitals'){
      if(state.autoRotate&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)state.orbYaw+=dt*.0002;
      if(state.needsRender||state.autoRotate&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)drawOrbitStage();
    }else if(state.mode==='geometries'){
      if(state.playing){
        state.progress=Math.min(1,state.progress+dt/7000);
        if(state.progress>=1)state.playing=false;
        $('progressSlider').value=Math.round(state.progress*100);
        updateEnergy();updatePlayButton();
      }
      if(state.needsRender)drawGeometryStage();
    }
    state.needsRender=false;requestAnimationFrame(loop);
  }
  function init(){
    document.addEventListener('input',()=>state.needsRender=true);document.addEventListener('change',()=>state.needsRender=true);
    for(const ev of ['pointermove','wheel','keydown','click'])document.addEventListener(ev,()=>state.needsRender=true,{passive:true});
    document.addEventListener('visibilitychange',()=>{state.lastFrame=0;state.needsRender=true;});
    $('moduleSelect').addEventListener('change',e=>setMode(e.target.value));
    document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();setMode('orbitals');});
    buildCards();setupEnergy();selectOrbital('dxy');selectFocus('dx2y2');
    try{orbRenderer=new Renderer($('orbitalCanvas'));geomRenderer=new Renderer($('geometryCanvas'));}
    catch(err){console.error('Falha ao iniciar renderização 3D:',err);}
    dragCanvas($('orbitalCanvas'),'orb');dragCanvas($('geometryCanvas'),'geom');
    document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
    document.querySelectorAll('[data-geom]').forEach(b=>b.addEventListener('click',()=>setGeometry(b.dataset.geom)));
    $('goToGeometry').addEventListener('click',()=>setMode('geometries'));
    $('progressSlider').addEventListener('input',e=>setProgress(Number(e.target.value)/100));
    $('playSim').addEventListener('click',()=>{if(state.progress>=1)setProgress(0);state.playing=!state.playing;updatePlayButton();});
    $('resetSim').addEventListener('click',()=>setProgress(0));
    $('axialModeButton').addEventListener('click',toggleAxial);
    $('resetLigands').addEventListener('click',()=>{state.ligandOffsets[state.geometry]={};$('ligandEditorStatus').textContent='Posições originais restauradas.';updateEnergy();updateLigandEditor();});
    $('ligandSelect').addEventListener('change',e=>updateLigandEditor(Number(e.target.value)));
    $('ligandRadial').addEventListener('input',e=>{
      const base=3.55-1.41*ease(state.progress),r=Number(e.target.value)/100;
      state.ligandOffsets[state.geometry][selectedLigand]=clamp(r-base,-2.2,3.0);
      $('ligandEditorStatus').textContent='LIGANTE '+(selectedLigand+1)+' · distância ajustada · níveis atualizados';
      updateEnergy();updateLigandEditor();
    });
    $('showOrbital').addEventListener('change',()=>{});
    $('autoRotate').addEventListener('click',()=>{state.autoRotate=!state.autoRotate;updateRotateButton();});
    $('resetOrbitalView').addEventListener('click',()=>{state.orbYaw=.58;state.orbPitch=-.32;state.orbDistance=7.3;$('orbZoom').value=distToZoom(7.3);state.needsRender=true;});
    $('orbZoom').addEventListener('input',e=>state.orbDistance=clamp(zoomToDist(e.target.value),3.9,12.6));
    $('helpButton').addEventListener('click',()=>$('helpDialog').showModal());
    $('closeHelp').addEventListener('click',()=>$('helpDialog').close());
    $('helpDialog').addEventListener('click',e=>{if(e.target===$('helpDialog'))$('helpDialog').close();});
    window.addEventListener('resize',()=>{state.needsRender=true;if(state.mode==='orbitals')renderMiniatures();});
    $('orbZoom').value=distToZoom(state.orbDistance);setGeometry('oct');
    requestAnimationFrame(loop);
  }
  // Place projected labels near their anchors while preserving room for the scene hints.
  function placeSceneLabels(items,width,height){
    const placed=[],overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)+3)*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)+3);
    return items.map(item=>{const w=Math.min(width-12,Math.max(22,10+item.name.length*5.7)),h=18,candidates=[];
      for(const dy of [-22,8,-46,32,-70,56])for(const dx of [8,-w-8,24,-w-24])candidates.push({x:clamp(item.x+dx,6,width-w-6),y:clamp(item.y+dy,8,height-h-38),w,h});
      let best=candidates[0],score=Infinity;for(const c of candidates){const n=placed.reduce((sum,p)=>sum+overlap(c,p),0);if(n<score){best=c;score=n;}if(n===0)break;}placed.push(best);return {...item,...best};
    });
  }
  window.OrbitalEngine={ORBITS,DATA,VECTORS,COLOR,Renderer,placeSceneLabels,state,setMode,setGeometry,setProgress,drawGeometryStage,energyFor,angular,interactionMagnitude,coords,clamp,ease,lerp,vecScale,updateEnergy};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
