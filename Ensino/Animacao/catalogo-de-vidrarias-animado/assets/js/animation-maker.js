(()=>{
  const currentKey="catalogoAnimationMakerCurrentStructure";
  const framesKey="catalogoAnimationMakerFrames";
  const projectKey="catalogoAnimationMakerProject";
  const scenesKey="catalogoAnimationMakerScenes";
  const activeSceneKey="catalogoAnimationMakerActiveScene";
  const layoutKey="catalogoAnimationMakerLayout";
  const channelName="catalog-animation-maker";
  const animationsFallback=[
    ["liquid","Líquido"],["mix","Agitação"],["heat","Aquecimento"],["open","Abrir/Fechar"],
    ["flame","Chama"],["spin","Rotação"],["gas","Gás"],["drop","Gotejamento"]
  ];
  const creationItem={id:"t8-criacao",themeId:8,pieceKey:"criacao",name:"Criação",desc:"Cena em branco para montar estruturas e animações do zero.",history:"Espaço livre criado para organizar cenas personalizadas no Animation Maker.",application:"Montagem de cenas, importação de objetos e criação de animações por frames."};
  const defaultProject={fps:24,totalFrames:120,currentFrame:0,frames:[]};
  let channel=null;
  try{channel=new BroadcastChannel(channelName)}catch{}
  let structure=readJson(currentKey,{});
  let project={...defaultProject,...readJson(framesKey,readJson(projectKey,{}))};
  if(!Array.isArray(project.frames))project.frames=[];
  let selectedInstance=structure.requestedInstanceId||structure.selectedObject||"glassware";
  let activeSceneId=localStorage.getItem(activeSceneKey)||"";
  let layout={panelHeight:readJson(layoutKey,{panelHeight:320,sidebarWidth:380}).panelHeight||320,sidebarWidth:readJson(layoutKey,{panelHeight:320,sidebarWidth:380}).sidebarWidth||380};
  let panelOpen=false;
  let sceneLoaderOpen=false;
  let mediaExportOpen=false;
  let playing=false;
  let playbackEnded=false;
  let lastMediaDownload=null;
  let addStructureSearchObserver=null;
  let timers=[];
  let tick=null;

  function readJson(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
  function escapeText(value){return String(value??"").replace(/[&<>'"]/g,match=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[match]))}
  function clone(value){try{return JSON.parse(JSON.stringify(value||{}))}catch{return {}}}
  function uid(prefix="scene"){return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`}
  function clamp(value,min,max){return Math.max(min,Math.min(max,Number(value)||min))}
  function saveLayout(){layout.panelHeight=clamp(layout.panelHeight,220,Math.round(window.innerHeight*.72));layout.sidebarWidth=clamp(layout.sidebarWidth,320,Math.round(window.innerWidth*.48));writeJson(layoutKey,layout);applyLayout()}
  function enableDevMode(){try{localStorage.setItem("catalogoAnimationMakerDevMode","true")}catch{}window.dispatchEvent(new CustomEvent("catalog-animation-maker-enable-dev",{detail:{enabled:true}}));if(channel)channel.postMessage({type:"enable-dev",payload:{enabled:true}})}
  function isDevModeEnabled(){try{return localStorage.getItem("catalogoAnimationMakerDevMode")==="true"}catch{return false}}
  function applyLayout(){document.documentElement.style.setProperty("--am-panel-height",`${layout.panelHeight}px`);document.documentElement.style.setProperty("--am-sidebar-width",`${layout.sidebarWidth}px`)}
  function normalizeTransformInstance(id){return !id||id==="main"?"glassware":id}
  function normalizeAnimationInstance(id){return !id||id==="glassware"?"main":id}
  function formatDate(value){try{return new Date(value).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"})}catch{return ""}}
  function getScenes(){const scenes=readJson(scenesKey,[]);return Array.isArray(scenes)?scenes:[]}
  function setScenes(scenes){writeJson(scenesKey,Array.isArray(scenes)?scenes:[])}
  function getActiveScene(){return getScenes().find(item=>item.id===activeSceneId)||null}
  function sceneName(){const scene=getActiveScene();return scene&&scene.name?scene.name:"Cena sem nome"}
  function getObjectLabels(){const labels=structure.objectLabels||project.objectLabels||{};return labels&&typeof labels==="object"?labels:{}}
  function objectLabel(id){id=normalizeTransformInstance(id);const labels=getObjectLabels();return labels[id]||defaultObjectLabel(id)}
  function defaultObjectLabel(id){id=normalizeTransformInstance(id);if(id==="glassware")return getStructureName();if(id==="garra_indep"||String(id).endsWith("_garra"))return "Garra";const custom=((structure.customObjects||{})[structure.appItemId]||[]).find(item=>item&&item.instanceId===id);if(custom){const model=(structure.availableObjects||[]).find(item=>item.id===custom.modelId);return model?.name||custom.modelName||custom.modelId||id}return id}
  function setObjectLabel(id,value){id=normalizeTransformInstance(id);const clean=String(value||"").trim();structure.objectLabels={...getObjectLabels(),[id]:clean||defaultObjectLabel(id)};project.objectLabels={...(project.objectLabels||{}),[id]:structure.objectLabels[id]};autoSaveScene();renderPanel()}
  function hasScene(){return !!getActiveScene()}
  function saveState(){writeJson(currentKey,structure);writeJson(framesKey,project);writeJson(projectKey,project)}
  function getStructureName(){return (structure.currentAppItem&&structure.currentAppItem.name)||"Estrutura capturada"}
  function setSceneName(value){const clean=String(value||"").trim()||sceneName();const scenes=getScenes();const index=scenes.findIndex(item=>item.id===activeSceneId);if(index>=0){scenes[index]={...scenes[index],name:clean,updatedAt:new Date().toISOString()};setScenes(scenes)}autoSaveScene();renderPanel()}
  function makeCreationStructure(){return {appItemId:creationItem.id,currentAppItem:clone(creationItem),activeAnimations:{},liquidProps:{color:"#3b82f6",targetColor:"",changeTime:5},animationSettings:{},customAnimations:{},customObjects:{[creationItem.id]:[]},transforms:{},objectLabels:{glassware:"Criação"},availableAnimations:[],requestedInstanceId:"glassware",selectedObject:"glassware",exportedAt:new Date().toISOString(),isCreationScene:true}}
  function resetToCreationStructure(){structure=makeCreationStructure();selectedInstance="glassware";saveState();return structure}
  function getStructureId(){return structure.appItemId||"sem estrutura"}
  function isSupportModelId(value){return String(value||"").includes("suporte")}
  function getInstances(){
    const keys=new Set(["glassware",normalizeTransformInstance(selectedInstance)]);
    Object.keys(structure.transforms||{}).forEach(k=>keys.add(normalizeTransformInstance(k)));
    Object.keys(structure.activeAnimations||{}).forEach(k=>{const raw=(k.split("_")[0]||"main");keys.add(normalizeTransformInstance(raw))});
    const customByItem=(structure.customObjects||{})[structure.appItemId]||[];
    customByItem.forEach(item=>{
      if(item&&item.instanceId){
        keys.add(item.instanceId);
        if(isSupportModelId(item.modelId))keys.add(`${item.instanceId}_garra`);
      }
    });
    if(getStructureId()==="t7-suporte")keys.add("garra_indep");
    return [...keys].filter(Boolean);
  }
  function getAnimations(){
    const list=[];
    (structure.availableAnimations||[]).forEach(a=>list.push(a));
    const custom=((structure.customAnimations||{})[structure.appItemId]||[]);
    custom.forEach(a=>list.push(a));
    if(!list.length)animationsFallback.forEach(([id,name])=>list.push({id,name}));
    const seen=new Set;
    return list.filter(a=>{if(!a||!a.id||seen.has(a.id))return false;seen.add(a.id);return true});
  }
  function animName(id){return (getAnimations().find(a=>a.id===id)||animationsFallback.map(([id,name])=>({id,name})).find(a=>a.id===id)||{name:id}).name}
  function animKey(instanceId,animId){return `${normalizeAnimationInstance(instanceId)}_${animId}`}
  function getTransform(id){
    id=normalizeTransformInstance(id);
    const t=(structure.transforms||{})[id]||{};
    const position=Array.isArray(t.position)?t.position:[0,0,0];
    const scale=Array.isArray(t.scale)?t.scale:[1,1,1];
    const rotation=Array.isArray(t.rotation)?t.rotation:[0,0,0];
    return {position:[position[0]??0,position[1]??0,position[2]??0],scale:[scale[0]??1,scale[1]??1,scale[2]??1],rotation:[rotation[0]??0,rotation[1]??0,rotation[2]??0]};
  }
  function summarizeScene(){
    const custom=(structure.customObjects||{})[structure.appItemId]||[];
    const used=new Set([getStructureId(),...custom.map(item=>item.modelId).filter(Boolean),...getInstances()]);
    return {selectedInstance,appItemId:getStructureId(),structureName:getStructureName(),instances:getInstances(),objectLabels:getObjectLabels(),structuresUsed:[...used],customObjects:custom.length,animations:getAnimations().map(a=>a.id),frames:project.frames.length,fps:project.fps,totalFrames:project.totalFrames};
  }
  function makeScene(name,id=activeSceneId||uid()){
    const now=new Date().toISOString();
    const previous=getScenes().find(item=>item.id===id);
    return {id,name:name||previous?.name||sceneName(),version:3,createdAt:previous?.createdAt||now,updatedAt:now,structure:clone(structure),project:clone(project),metadata:summarizeScene()};
  }
  function saveScene(silent=false){
    if(!activeSceneId)activeSceneId=uid();
    localStorage.setItem(activeSceneKey,activeSceneId);
    const scenes=getScenes();
    const current=makeScene(sceneName(),activeSceneId);
    const index=scenes.findIndex(item=>item.id===activeSceneId);
    if(index>=0)scenes[index]=current;else scenes.unshift(current);
    setScenes(scenes);
    if(!silent)setStatus("Cena salva com estrutura, objetos, configurações, animações, tempo, posição, escala, rotação e keyframes.");
  }
  function createSceneFromCurrent(name){
    resetToCreationStructure();
    activeSceneId=uid();
    project={...defaultProject,frames:[],objectLabels:{glassware:"Criação"}};
    selectedInstance=structure.requestedInstanceId||structure.selectedObject||selectedInstance||"glassware";
    structure.requestedInstanceId=selectedInstance;
    saveState();
    const scene=makeScene(name||`Cena ${getScenes().length+1}`,activeSceneId);
    const scenes=getScenes();
    scenes.unshift(scene);
    setScenes(scenes);
    localStorage.setItem(activeSceneKey,activeSceneId);
    applyToMain(false);
    panelOpen=true;
    sceneLoaderOpen=false;
    mediaExportOpen=false;
    renderPanel();
    setStatus(`Cena “${scene.name}” criada em Criação e aberta no visualizador.`);
  }
  function createScene(){
    createSceneFromCurrent(`Cena ${getScenes().length+1}`);
  }
  function loadScene(id){
    const scene=getScenes().find(item=>item.id===id);
    if(!scene)return;
    activeSceneId=scene.id;
    localStorage.setItem(activeSceneKey,activeSceneId);
    structure=clone(scene.structure||{});
    project={...defaultProject,...clone(scene.project||{})};
    if(!Array.isArray(project.frames))project.frames=[];
    selectedInstance=structure.requestedInstanceId||structure.selectedObject||scene.metadata?.selectedInstance||"glassware";
    turnOffAllAnimations(false);
    saveState();
    applyToMain(false);
    sceneLoaderOpen=false;
    mediaExportOpen=false;
    panelOpen=true;
    renderPanel();
    setStatus(`Cena “${scene.name}” carregada no visualizador.`);
  }
  function deleteScene(id){
    const scenes=getScenes().filter(item=>item.id!==id);
    setScenes(scenes);
    if(activeSceneId===id){activeSceneId=scenes[0]?.id||"";localStorage.setItem(activeSceneKey,activeSceneId)}
    renderPanel();
  }
  function exportScene(){
    if(!hasScene()){setStatus("Crie uma cena antes de exportar.");return}
    saveScene(true);
    const scene=getActiveScene()||makeScene(sceneName());
    const safe=(scene.name||"cena").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/gi,"-").replace(/^-+|-+$/g,"").toLowerCase()||"cena";
    const blob=new Blob([JSON.stringify(scene,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`${safe}.cena`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    setStatus("Cena exportada.");
  }
  function wait(ms){return new Promise(resolve=>setTimeout(resolve,Math.max(0,ms||0)))}
  function nextPaint(){return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))}
  function getViewerCanvas(){const canvases=[...document.querySelectorAll("canvas")].filter(canvas=>canvas.width>0&&canvas.height>0);canvases.sort((a,b)=>b.width*b.height-a.width*a.height);return canvases[0]||null}
  function fileBase(){const active=getActiveScene();return ((active&&active.name)||sceneName()||"cena").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/gi,"-").replace(/^-+|-+$/g,"").toLowerCase()||"cena"}
  function frameCount(value,fallback=0){const num=Number(value);return Number.isFinite(num)?Math.max(0,Math.round(num)):fallback}
  function animatedEndFrame(){
    const frames=[...(project.frames||[])].filter(Boolean).sort((a,b)=>(frameCount(a.frame)-frameCount(b.frame))||(frameCount(a.waitAfter)-frameCount(b.waitAfter)));
    if(!frames.length)return 0;
    let chain=0,maxEnd=0;
    frames.forEach(frame=>{
      const duration=Math.max(1,frameCount(frame.duration,1));
      const wait=frameCount(frame.waitAfter,0);
      const at=frame.mode==="after"?chain+wait:frameCount(frame.frame,0)+wait;
      const end=at+duration;
      chain=end;
      maxEnd=Math.max(maxEnd,end);
    });
    return Math.max(1,maxEnd);
  }
  function timelineEndFrame(){return animatedEndFrame()||Math.max(1,frameCount(project.totalFrames,120))}
  function timelineSeconds(){const fps=Math.max(1,Number(project.fps)||24);return Math.max(1/fps,timelineEndFrame()/fps)}
  function mediaTickCount(fpsOverride){const fps=Math.max(1,Number(fpsOverride)||24);return Math.max(1,Math.ceil(timelineSeconds()*fps))}
  function formatSeconds(value){const seconds=Math.max(0,Number(value)||0);return `${seconds.toFixed(seconds>=10?1:2)}s`}
  function downloadBlob(blob,filename){
    if(!blob||!blob.size){setStatus("A mídia foi gerada vazia. Tente PNGs em ZIP ou reduza a duração da cena.");return}
    if(lastMediaDownload&&lastMediaDownload.url){try{URL.revokeObjectURL(lastMediaDownload.url)}catch{}}
    const url=URL.createObjectURL(blob);
    lastMediaDownload={url,filename,size:blob.size,createdAt:new Date().toISOString()};
    const a=document.createElement("a");
    a.href=url;
    a.download=filename;
    a.rel="noopener";
    a.style.display="none";
    document.body.appendChild(a);
    setTimeout(()=>{try{a.click()}catch{}a.remove();showDownloadToast()},0);
  }
  function showDownloadToast(){
    if(!lastMediaDownload)return;
    document.querySelectorAll(".am-download-toast").forEach(el=>el.remove());
    const toast=document.createElement("div");
    toast.className="am-download-toast";
    toast.innerHTML=`<strong>Mídia pronta</strong><span>${escapeText(lastMediaDownload.filename)}</span><div><a href="${escapeText(lastMediaDownload.url)}" download="${escapeText(lastMediaDownload.filename)}">Baixar arquivo</a><button type="button" data-close-download-toast>Fechar</button></div>`;
    document.body.appendChild(toast);
    const close=toast.querySelector("[data-close-download-toast]");
    if(close)close.onclick=()=>toast.remove();
    setStatus(`Mídia pronta: ${lastMediaDownload.filename}. Se o download automático não abrir, clique em “Baixar arquivo”.`);
  }
  function setExportProgress(title,detail,percent){
    let box=document.querySelector(".am-export-progress");
    if(!box){box=document.createElement("div");box.className="am-export-progress";box.innerHTML='<strong></strong><span></span><div class="am-export-bar"><i></i></div>';document.body.appendChild(box)}
    const pct=Math.max(0,Math.min(100,Number(percent)||0));
    const strong=box.querySelector("strong"),span=box.querySelector("span"),bar=box.querySelector("i");
    if(strong)strong.textContent=title||"Exportando mídia";
    if(span)span.textContent=detail||"Preparando arquivo...";
    if(bar)bar.style.width=pct+"%";
  }
  function clearExportProgress(delay=700){setTimeout(()=>document.querySelectorAll(".am-export-progress").forEach(el=>el.remove()),delay)}
  function canvasBlob(canvas,type="image/png",quality=.92){return new Promise((resolve,reject)=>{try{canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("canvas vazio")),type,quality)}catch(err){reject(err)}})}
  function crcTable(){if(crcTable.cache)return crcTable.cache;const table=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;table[i]=c>>>0}crcTable.cache=table;return table}
  function crc32(data){let c=0xffffffff,table=crcTable();for(let i=0;i<data.length;i++)c=table[(c^data[i])&255]^(c>>>8);return(c^0xffffffff)>>>0}
  function u16(view,offset,value){view.setUint16(offset,value,true)}
  function u32(view,offset,value){view.setUint32(offset,value,true)}
  async function zipStored(files){const enc=new TextEncoder;const locals=[],centrals=[];let offset=0;for(const file of files){const name=enc.encode(file.name);const data=new Uint8Array(await file.blob.arrayBuffer());const crc=crc32(data);const local=new Uint8Array(30+name.length);const lv=new DataView(local.buffer);u32(lv,0,0x04034b50);u16(lv,4,20);u16(lv,6,0);u16(lv,8,0);u16(lv,10,0);u16(lv,12,0);u32(lv,14,crc);u32(lv,18,data.length);u32(lv,22,data.length);u16(lv,26,name.length);u16(lv,28,0);local.set(name,30);locals.push(local,data);const central=new Uint8Array(46+name.length);const cv=new DataView(central.buffer);u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,0);u16(cv,10,0);u16(cv,12,0);u16(cv,14,0);u32(cv,16,crc);u32(cv,20,data.length);u32(cv,24,data.length);u16(cv,28,name.length);u16(cv,30,0);u16(cv,32,0);u16(cv,34,0);u16(cv,36,0);u32(cv,38,0);u32(cv,42,offset);central.set(name,46);centrals.push(central);offset+=local.length+data.length}const centralSize=centrals.reduce((sum,item)=>sum+item.length,0);const end=new Uint8Array(22);const ev=new DataView(end.buffer);u32(ev,0,0x06054b50);u16(ev,4,0);u16(ev,6,0);u16(ev,8,files.length);u16(ev,10,files.length);u32(ev,12,centralSize);u32(ev,16,offset);u16(ev,20,0);return new Blob([...locals,...centrals,end],{type:"application/zip"})}
  function gifPalette(){const p=[];for(let i=0;i<256;i++){const r=((i>>5)&7)*255/7,g=((i>>2)&7)*255/7,b=(i&3)*255/3;p.push(Math.round(r),Math.round(g),Math.round(b))}return p}
  function gifIndexes(data){const out=new Uint8Array(data.length/4);for(let i=0,j=0;i<data.length;i+=4,j++){const alpha=data[i+3]/255;const r=Math.round(data[i]*alpha+5*(1-alpha));const g=Math.round(data[i+1]*alpha+5*(1-alpha));const b=Math.round(data[i+2]*alpha+5*(1-alpha));out[j]=((r>>5)<<5)|((g>>5)<<2)|(b>>6)}return out}
  function lzwEncode(indexes,minSize=8){const clear=1<<minSize,end=clear+1;const bytes=[];let cur=0,bits=0,codeSize=minSize+1,written=0;const write=code=>{cur|=code<<bits;bits+=codeSize;while(bits>=8){bytes.push(cur&255);cur>>=8;bits-=8}};write(clear);for(let i=0;i<indexes.length;i++){write(indexes[i]);written++;if(written>=240&&i<indexes.length-1){write(clear);written=0;codeSize=minSize+1}}write(end);if(bits>0)bytes.push(cur&255);return bytes}
  function gifBlob(frames,width,height,fps){const out=[];const push=(...items)=>items.forEach(item=>Array.isArray(item)?out.push(...item):out.push(item));const word=v=>[v&255,(v>>8)&255];push(...[71,73,70,56,57,97],...word(width),...word(height),247,0,0,...gifPalette(),33,255,11,...[78,69,84,83,67,65,80,69,50,46,48],3,1,0,0,0);const delay=Math.max(2,Math.round(100/Math.max(1,fps)));frames.forEach(indices=>{push(33,249,4,0,...word(delay),0,0,44,0,0,0,0,...word(width),...word(height),0,8);const data=lzwEncode(indices,8);for(let i=0;i<data.length;i+=255){const chunk=data.slice(i,i+255);push(chunk.length,...chunk)}push(0)});push(59);return new Blob([new Uint8Array(out)],{type:"image/gif"})}
  function exportScaleSize(canvas,maxWidth){const limit=Math.max(120,Number(maxWidth)||640);const ratio=Math.min(1,limit/canvas.width);return{width:Math.max(1,Math.round(canvas.width*ratio)),height:Math.max(1,Math.round(canvas.height*ratio))}}
  function createMediaCanvas(source,maxWidth=1280){const size=exportScaleSize(source,maxWidth);const canvas=document.createElement("canvas");canvas.width=size.width;canvas.height=size.height;const ctx=canvas.getContext("2d",{alpha:false,willReadFrequently:true});return{canvas,ctx,width:size.width,height:size.height}}
  function drawMediaFrame(source,target){target.ctx.save();target.ctx.fillStyle="#050505";target.ctx.fillRect(0,0,target.width,target.height);target.ctx.drawImage(source,0,0,target.width,target.height);target.ctx.restore()}
  async function exportPngSequence(step){
    const canvas=getViewerCanvas();
    if(!canvas){setStatus("Não encontrei o canvas do visualizador para exportar.");return}
    if(!(project.frames||[]).length){setStatus("Adicione pelo menos um keyframe antes de exportar mídia.");return}
    saveScene(true);mediaExportOpen=false;renderPanel();
    const fps=Math.max(1,Number(project.fps)||24);
    const total=animatedEndFrame();
    const every=Math.max(1,frameCount(step,1));
    const files=[];
    stop(false);setCurrentFrame(0);await nextPaint();play();
    const start=performance.now();
    for(let frame=0;frame<=total;frame+=every){
      await wait(start+(frame/fps)*1000-performance.now());
      await nextPaint();
      const blob=await canvasBlob(canvas,"image/png");
      files.push({name:`${fileBase()}_frame_${String(frame).padStart(5,"0")}.png`,blob});
      const pct=total?Math.round(frame/total*92):92;
      setExportProgress("Exportando PNGs",`${files.length} imagem(ns) capturadas · cena até o frame ${total} (${formatSeconds(total/fps)})`,pct);
      setStatus(`Capturando PNG ${files.length} até o frame ${total}...`);
    }
    stop(false);
    setExportProgress("Montando ZIP","Compactando PNGs da cena...",96);
    const zip=await zipStored(files);
    downloadBlob(zip,`${fileBase()}_png_frames.zip`);
    setExportProgress("PNGs prontos",`${files.length} PNGs exportados.`,100);
    clearExportProgress();renderPanel();
    setStatus(`${files.length} PNGs exportados até o frame ${total}. O link também fica disponível em “Baixar mídia”.`);
  }
  async function exportVideo(videoFps,videoMaxWidth){
    const source=getViewerCanvas();
    if(!source||typeof MediaRecorder==="undefined"){setStatus("Este navegador não liberou exportação de vídeo para esse canvas.");return}
    if(!(project.frames||[]).length){setStatus("Adicione pelo menos um keyframe antes de exportar mídia.");return}
    saveScene(true);mediaExportOpen=false;renderPanel();
    const fps=Math.max(1,Math.min(60,Number(videoFps)||24));
    const endFrame=animatedEndFrame();
    const totalTicks=mediaTickCount(fps);
    const seconds=timelineSeconds();
    setExportProgress("Gravando vídeo",`0% · ${endFrame} frames da cena · ${formatSeconds(seconds)} · ${fps} FPS`,0);
    setStatus(`Gravando vídeo até o frame ${endFrame} (${formatSeconds(seconds)}).`);
    const capture=createMediaCanvas(source,videoMaxWidth||960);
    if(!capture.canvas.captureStream){setStatus("Este navegador não liberou captura de vídeo do canvas.");clearExportProgress();return}
    const mime=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(type=>MediaRecorder.isTypeSupported(type))||"video/webm";
    let stream;
    try{
      stream=capture.canvas.captureStream(0);
      const probe=stream.getVideoTracks&&stream.getVideoTracks()[0];
      if(!probe||!probe.requestFrame){try{stream.getTracks().forEach(track=>track.stop())}catch{}stream=capture.canvas.captureStream(fps)}
    }catch{stream=capture.canvas.captureStream(fps)}
    const track=stream.getVideoTracks&&stream.getVideoTracks()[0];
    const options={mimeType:mime,videoBitsPerSecond:1800000};
    let recorder;
    try{recorder=new MediaRecorder(stream,options)}catch{recorder=new MediaRecorder(stream,{mimeType:mime})}
    const chunks=[];
    recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
    const done=new Promise(resolve=>recorder.onstop=resolve);
    stop(false);setCurrentFrame(0);await nextPaint();drawMediaFrame(source,capture);
    recorder.start();
    if(track&&track.requestFrame)try{track.requestFrame()}catch{}
    play();
    const started=performance.now();
    for(let i=0;i<=totalTicks;i++){
      await wait(started+(i/fps)*1000-performance.now());
      await nextPaint();
      drawMediaFrame(source,capture);
      if(track&&track.requestFrame)try{track.requestFrame()}catch{}
      const pct=totalTicks?Math.min(99,Math.round(i/totalTicks*100)):99;
      setExportProgress("Gravando vídeo",`${pct}% · ${endFrame} frames da cena · ${formatSeconds(seconds)} · ${fps} FPS`,pct);
      setStatus(`Gravando vídeo ${pct}%...`);
      if(i&&i%Math.max(1,Math.round(fps*2))===0)try{recorder.requestData()}catch{}
    }
    stop(false);
    try{recorder.requestData()}catch{}
    await wait(120);
    recorder.stop();
    await done;
    stream.getTracks().forEach(track=>track.stop());
    const blob=new Blob(chunks,{type:mime});
    if(!blob.size){clearExportProgress(0);setStatus("O navegador não devolveu dados do vídeo. Tente PNGs em ZIP ou reduza a largura máxima do vídeo.");renderPanel();return}
    downloadBlob(blob,`${fileBase()}_video_${fps}fps.webm`);
    setExportProgress("Vídeo pronto",`${endFrame} frames da cena · ${formatSeconds(seconds)} · arquivo gerado.`,100);
    clearExportProgress();renderPanel();
    setStatus(`Vídeo exportado até o frame ${endFrame}, com ${fps} FPS. O link também fica disponível em “Baixar mídia”.`);
  }
  async function exportGif(maxWidth,gifFps){
    const source=getViewerCanvas();
    if(!source){setStatus("Não encontrei o canvas do visualizador para exportar.");return}
    if(!(project.frames||[]).length){setStatus("Adicione pelo menos um keyframe antes de exportar mídia.");return}
    saveScene(true);mediaExportOpen=false;renderPanel();
    const fps=Math.max(1,Math.min(10,Number(gifFps)||8));
    const endFrame=animatedEndFrame();
    const seconds=timelineSeconds();
    const count=mediaTickCount(fps);
    const capture=createMediaCanvas(source,maxWidth||360);
    const frames=[];
    stop(false);setCurrentFrame(0);await nextPaint();play();
    const start=performance.now();
    for(let i=0;i<=count;i++){
      await wait(start+(i/fps)*1000-performance.now());
      await nextPaint();
      drawMediaFrame(source,capture);
      frames.push(gifIndexes(capture.ctx.getImageData(0,0,capture.width,capture.height).data));
      const pct=count?Math.min(92,Math.round(i/count*92)):92;
      setExportProgress("Renderizando GIF",`${i+1}/${count+1} frames · cena até o frame ${endFrame} (${formatSeconds(seconds)})`,pct);
      setStatus(`Renderizando GIF ${i+1}/${count+1}...`);
    }
    stop(false);
    setExportProgress("Montando GIF","Gerando arquivo animado...",96);
    await nextPaint();
    const blob=gifBlob(frames,capture.width,capture.height,fps);
    downloadBlob(blob,`${fileBase()}_animacao.gif`);
    setExportProgress("GIF pronto",`${frames.length} frames renderizados.`,100);
    clearExportProgress();renderPanel();
    setStatus(`GIF exportado até o frame ${endFrame}. O link também fica disponível em “Baixar mídia”.`);
  }
  async function runMediaExport(format,step,maxWidth,gifFps,videoFps,videoMaxWidth){try{if(format==="png")await exportPngSequence(step);else if(format==="video")await exportVideo(videoFps,videoMaxWidth);else await exportGif(maxWidth,gifFps)}catch(err){console.error(err);stop(false);clearExportProgress(0);renderPanel();setStatus("Não consegui exportar essa mídia. O processo foi interrompido; tente vídeo com largura menor ou PNGs em ZIP.")}}
  function importScene(file){
    if(!file)return;
    const reader=new FileReader;
    reader.onload=()=>{
      try{
        const data=JSON.parse(reader.result);
        const scene=data.structure&&data.project?data:{id:uid(),name:data.name||file.name.replace(/\.(cena|json)$/i,""),version:3,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),structure:data.currentStructure||data.structure||structure,project:data.project||data,metadata:data.metadata||{}};
        scene.id=scene.id||uid();
        scene.name=scene.name||file.name.replace(/\.(cena|json)$/i,"")||"Cena importada";
        scene.updatedAt=new Date().toISOString();
        scene.metadata=scene.metadata||{};
        const scenes=getScenes().filter(item=>item.id!==scene.id);
        scenes.unshift(scene);
        setScenes(scenes);
        loadScene(scene.id);
      }catch{alert("Não consegui carregar essa cena.")}
    };
    reader.readAsText(file);
  }
  function requestSnapshot(instanceId){
    let state=null;
    let transforms=null;
    let selectedObject=null;
    const stateHandler=e=>{state=e.detail||null};
    const transformHandler=e=>{transforms=(e.detail||{}).transforms||null;selectedObject=(e.detail||{}).selectedObject||null};
    window.addEventListener("catalog-animation-maker-state",stateHandler,{once:true});
    window.addEventListener("catalog-animation-maker-transforms",transformHandler,{once:true});
    window.dispatchEvent(new CustomEvent("catalog-animation-maker-request-transforms",{detail:{instanceId}}));
    window.dispatchEvent(new CustomEvent("catalog-animation-maker-request-state",{detail:{instanceId}}));
    window.removeEventListener("catalog-animation-maker-state",stateHandler);
    window.removeEventListener("catalog-animation-maker-transforms",transformHandler);
    const saved=state||readJson(currentKey,{});
    const target=normalizeTransformInstance(instanceId||selectedObject||saved.requestedInstanceId||"glassware");
    structure={...saved,requestedInstanceId:target,transforms:transforms||saved.transforms||structure.transforms||{},selectedObject:normalizeTransformInstance(selectedObject||target||saved.selectedObject||"glassware"),capturedAt:new Date().toISOString()};
    selectedInstance=normalizeTransformInstance(structure.requestedInstanceId||structure.selectedObject||selectedInstance||"glassware");
    saveState();
    return structure;
  }
  function applyToMain(announce=true){
    const payload=clone(structure);
    if(!playing)payload.activeAnimations=forceInactiveAnimations(payload.activeAnimations||{});
    payload.requestedInstanceId=normalizeTransformInstance(selectedInstance);
    payload.selectedObject=normalizeTransformInstance(selectedInstance);
    window.dispatchEvent(new CustomEvent("catalog-animation-maker-apply-state",{detail:payload}));
    window.dispatchEvent(new CustomEvent("catalog-animation-maker-apply-transforms",{detail:{appItemId:payload.appItemId,transforms:payload.transforms||{}}}));
    if(channel)channel.postMessage({type:"apply-state",payload});
    if(announce)setStatus("Aplicado no visualizador.");
  }
  function sendToggle(instanceId,animId,enabled){
    const payload={instanceId:normalizeAnimationInstance(instanceId),animId,enabled:!!enabled};
    window.dispatchEvent(new CustomEvent("catalog-animation-toggle",{detail:payload}));
    if(channel)channel.postMessage({type:"toggle",payload});
  }
  function forceInactiveAnimations(map={}){
    const next={};
    Object.keys(map||{}).forEach(key=>next[key]=false);
    return next;
  }
  function collectAnimationKeys(){
    const keys=new Set(Object.keys(structure.activeAnimations||{}));
    (project.frames||[]).forEach(frame=>{if(frame&&frame.animId)keys.add(animKey(frame.instanceId,frame.animId))});
    getInstances().forEach(instanceId=>getAnimations().forEach(anim=>keys.add(animKey(instanceId,anim.id))));
    return [...keys].filter(Boolean);
  }
  function turnOffAllAnimations(save=false){
    const keys=collectAnimationKeys();
    structure.activeAnimations={...(structure.activeAnimations||{})};
    keys.forEach(key=>{
      structure.activeAnimations[key]=false;
      const index=key.lastIndexOf("_");
      if(index>0)sendToggle(normalizeTransformInstance(key.slice(0,index)),key.slice(index+1),false);
    });
    if(save)autoSaveScene();
  }
  function setStatus(text){const el=document.querySelector("[data-am-status]");if(el)el.textContent=text||""}
  function sortFrames(){project.frames.sort((a,b)=>(Number(a.frame)||0)-(Number(b.frame)||0)||(Number(a.waitAfter)||0)-(Number(b.waitAfter)||0))}
  function autoSaveScene(){saveState();if(hasScene())saveScene(true)}
  function setCurrentFrame(value){
    project.currentFrame=Math.max(0,Math.min(Math.max(Number(project.totalFrames)||120,timelineEndFrame()),Number(value)||0));
    autoSaveScene();
    const label=document.querySelector("[data-current-frame]");
    const range=document.querySelector("[data-frame-range]");
    const formFrame=document.querySelector("[name=frame]");
    if(label)label.textContent=project.currentFrame;
    if(range)range.value=project.currentFrame;
    if(formFrame)formFrame.value=project.currentFrame;
  }
  function setTransformValue(id,type,index,value){
    id=normalizeTransformInstance(id);
    const base=getTransform(id);
    base[type]=base[type]||[0,0,0];
    if(type==="scale"&&!base[type].length)base[type]=[1,1,1];
    base[type][index]=Number(value)||0;
    structure.transforms={...(structure.transforms||{}),[id]:base};
    autoSaveScene();
    applyToMain(false);
  }
  function setTransformUniform(id,type,value){
    id=normalizeTransformInstance(id);
    const numeric=Number(value);
    if(!Number.isFinite(numeric))return;
    const base=getTransform(id);
    base[type]=[numeric,numeric,numeric];
    structure.transforms={...(structure.transforms||{}),[id]:base};
    autoSaveScene();
    applyToMain(false);
    renderPanel();
  }
  function updateAnimation(instanceId,animId,patch,rerender=false){
    const cleanPatch={...patch};
    if("enabled" in cleanPatch){cleanPatch.armed=!!cleanPatch.enabled;delete cleanPatch.enabled}
    structure.animationSettings={...(structure.animationSettings||{})};
    structure.animationSettings[animId]={...(structure.animationSettings[animId]||{duration:5,loop:false,scale:1,armed:true}),...cleanPatch};
    const key=animKey(instanceId,animId);
    structure.activeAnimations={...(structure.activeAnimations||{}),[key]:false};
    if(animId==="liquid"&&"duration" in patch)structure.liquidProps={...(structure.liquidProps||{}),changeTime:Number(patch.duration)||0};
    autoSaveScene();
    if(rerender)renderPanel();
  }
  function addFrameFromForm(){
    const form=document.querySelector("[data-frame-form]");
    if(!form||!hasScene()){setStatus("Crie uma cena antes de adicionar keyframes.");return}
    const animId=form.querySelector("[name=anim]").value;
    const instanceId=normalizeTransformInstance(form.querySelector("[name=instance]").value||selectedInstance);
    const duration=Number(form.querySelector("[name=duration]").value)||0;
    const frameNumber=Number(form.querySelector("[name=frame]").value)||0;
    const frameName=form.querySelector("[name=frameName]")?.value?.trim()||`Frame ${frameNumber} · ${animName(animId)}`;
    const frame={id:uid("frame"),name:frameName,frame:frameNumber,instanceId,animId,enabled:form.querySelector("[name=action]").value==="on",duration,mode:form.querySelector("[name=mode]").value,waitAfter:Number(form.querySelector("[name=wait]").value)||0,transform:getTransform(instanceId)};
    project.frames.push(frame);
    sortFrames();
    autoSaveScene();
    renderPanel();
  }
  function updateFrame(id,patch){project.frames=project.frames.map(f=>String(f.id)===String(id)?{...f,...patch}:f);sortFrames();autoSaveScene();renderPanel()}
  function setFrameAnimationState(frame){const key=animKey(frame.instanceId,frame.animId);structure.activeAnimations={...(structure.activeAnimations||{}),[key]:frame.enabled!==false};if(frame.animId==="liquid"&&frame.enabled!==false){structure.liquidProps={...(structure.liquidProps||{}),visible:true,enabled:true}}return key}
  function removeFrame(id){project.frames=project.frames.filter(f=>String(f.id)!==String(id));autoSaveScene();renderPanel()}
  function clearRuntimeTimers(){timers.forEach(clearTimeout);timers=[];if(tick)clearInterval(tick);tick=null}
  function pause(renderAgain=true){
    playbackEnded=false;
    playing=false;
    clearRuntimeTimers();
    turnOffAllAnimations(true);
    if(renderAgain){renderPanel();setStatus("Pausado. As animações foram interrompidas no visualizador.")}
  }
  function stop(renderAgain=true){
    pause(false);
    playbackEnded=false;
    setCurrentFrame(0);
    if(renderAgain){renderPanel();setStatus("Animação parada e timeline voltou ao frame 0.")}
  }
  function play(){
    if(!hasScene()){setStatus("Crie ou carregue uma cena antes de dar play.");return}
    sortFrames();
    const fps=Math.max(1,Number(project.fps)||24);
    const totalFrames=Math.max(1,animatedEndFrame()||frameCount(project.totalFrames,120));
    if(playbackEnded||Number(project.currentFrame)>=totalFrames){setCurrentFrame(0)}
    playbackEnded=false;
    pause(false);
    const startFrame=Math.max(0,Math.min(totalFrames,frameCount(project.currentFrame,0)));
    const startTime=startFrame/fps;
    let chainFrame=0;
    let maxEndFrame=startFrame;
    const scheduled=[];
    project.frames.forEach(frame=>{
      const durationFrames=Math.max(1,frameCount(frame.duration,1));
      const waitFrames=frameCount(frame.waitAfter,0);
      const atFrame=frame.mode==="after"?chainFrame+waitFrames:frameCount(frame.frame,0)+waitFrames;
      const endFrame=atFrame+durationFrames;
      chainFrame=endFrame;
      maxEndFrame=Math.max(maxEndFrame,endFrame);
      if(endFrame>=startFrame)scheduled.push({frame,atFrame,durationFrames});
    });
    if(!scheduled.length){setStatus("A cena não tem keyframes para tocar.");renderPanel();return}
    playing=true;
    renderPanel();
    const started=performance.now()-startTime*1000;
    const finish=()=>{
      if(!playing)return;
      playbackEnded=true;
      playing=false;
      clearRuntimeTimers();
      turnOffAllAnimations(true);
      renderPanel();
      setStatus("Animação finalizada. Ao apertar Play de novo, ela recomeça do frame 0.");
    };
    scheduled.forEach(({frame,atFrame,durationFrames})=>{
      const delay=Math.max(0,(atFrame-startFrame)/fps);
      timers.push(setTimeout(()=>{
        if(!playing)return;
        const transformId=normalizeTransformInstance(frame.instanceId);
        setFrameAnimationState(frame);
        if(frame.transform)structure.transforms={...(structure.transforms||{}),[transformId]:clone(frame.transform)};
        autoSaveScene();
        applyToMain(false);
        sendToggle(frame.instanceId,frame.animId,frame.enabled!==false);
        timers.push(setTimeout(()=>{
          if(!playing)return;
          structure.activeAnimations={...(structure.activeAnimations||{}),[animKey(frame.instanceId,frame.animId)]:false};
          autoSaveScene();
          sendToggle(frame.instanceId,frame.animId,false);
        },(durationFrames/fps)*1000));
      },delay*1000));
    });
    tick=setInterval(()=>{
      const elapsed=(performance.now()-started)/1000;
      const nextFrame=Math.min(totalFrames,Math.floor(elapsed*fps));
      setCurrentFrame(nextFrame);
      if(nextFrame>=totalFrames)finish();
    },80);
    timers.push(setTimeout(finish,Math.max(0,(maxEndFrame-startFrame)/fps)*1000+160));
  }
  function applyCurrentFrame(){
    if(!hasScene()){setStatus("Crie ou carregue uma cena antes de aplicar frame.");return}
    const frame=project.frames.find(f=>Number(f.frame)===Number(project.currentFrame));
    if(frame){
      const transformId=normalizeTransformInstance(frame.instanceId);
      if(frame.transform)structure.transforms={...(structure.transforms||{}),[transformId]:clone(frame.transform)};
      autoSaveScene();
      applyToMain(false);
      setStatus("Frame aplicado como pose. Animação só roda ao apertar Play.");
    }else setStatus("Não existe keyframe nesse frame ainda.")
  }
  function requestFresh(){requestSnapshot(selectedInstance||"glassware");autoSaveScene();renderPanel();setStatus("Cena recapturada do visualizador.")}

  function injectStyle(){
    if(document.getElementById("am-style"))return;
    const style=document.createElement("style");
    style.id="am-style";
    style.textContent=`
      .am-main-tab{position:fixed;left:18px;bottom:18px;z-index:9999;border:1px solid rgba(99,102,241,.22);background:rgba(255,255,255,.92);color:#312e81;border-radius:999px;padding:11px 16px;font-weight:950;font-size:12px;letter-spacing:-.01em;box-shadow:0 18px 42px rgba(15,23,42,.12);display:flex;align-items:center;gap:8px;pointer-events:auto;backdrop-filter:blur(16px)}
      .dark .am-main-tab{background:rgba(10,10,10,.9);color:#e0e7ff;border-color:#2f2f46}.am-main-tab:before{content:"";width:8px;height:8px;border-radius:999px;background:#6366f1;box-shadow:0 0 14px rgba(99,102,241,.62)}
      .am-send-pop{position:fixed;z-index:10001;min-width:270px;max-width:360px;background:rgba(255,255,255,.96);color:#0f172a;border:1px solid rgba(148,163,184,.28);border-radius:20px;padding:14px;box-shadow:0 22px 70px rgba(15,23,42,.18);backdrop-filter:blur(16px);font-family:ui-sans-serif,system-ui,sans-serif}.dark .am-send-pop{background:rgba(10,10,10,.96);color:#f8fafc;border-color:#262626}.am-send-pop strong{display:block;font-size:14px;margin-bottom:4px;letter-spacing:-.02em}.am-send-pop p{margin:0 0 12px;color:#64748b;font-size:12px;line-height:1.35;font-weight:650}.dark .am-send-pop p{color:#a3a3a3}.am-send-pop .row{display:flex;gap:8px}.am-send-pop button{flex:1;border:0;border-radius:14px;padding:9px 10px;font-size:12px;font-weight:900;cursor:pointer}.am-send-pop button:first-child{background:#4f46e5;color:#fff}.am-send-pop button:last-child{background:#f1f5f9;color:#475569}.dark .am-send-pop button:last-child{background:#262626;color:#d4d4d4}
      .am-overlay{position:fixed;inset:0;z-index:10000;pointer-events:none;font-family:ui-sans-serif,system-ui,sans-serif;color:#0f172a}.dark .am-overlay{color:#f8fafc}.am-drawer{position:absolute;left:12px;right:12px;bottom:12px;height:var(--am-panel-height,320px);min-height:220px;max-height:72vh;pointer-events:auto;background:rgba(255,255,255,.95);border:1px solid rgba(148,163,184,.25);border-radius:24px;box-shadow:0 -18px 70px rgba(15,23,42,.16);backdrop-filter:blur(22px);display:flex;flex-direction:column;overflow:hidden}.dark .am-drawer{background:rgba(10,10,10,.94);border-color:#262626;box-shadow:0 -18px 70px rgba(0,0,0,.42)}
      .am-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;border-bottom:1px solid rgba(148,163,184,.18);min-height:58px}.dark .am-header{border-color:#262626}.am-brand{display:flex;align-items:center;gap:10px;min-width:0}.am-logo{width:32px;height:32px;border-radius:13px;background:#4f46e5;color:#fff;display:grid;place-items:center;font-weight:1000;font-size:12px;letter-spacing:-.08em;box-shadow:0 14px 28px rgba(79,70,229,.22)}.am-brand h2{margin:0;font-size:15px;line-height:1;letter-spacing:-.04em}.am-brand p{margin:4px 0 0;color:#64748b;font-size:10px;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:52vw}.dark .am-brand p{color:#a3a3a3}.am-header-actions{display:flex;gap:7px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
      .am-btn,.am-file{border:1px solid rgba(148,163,184,.28);background:rgba(248,250,252,.86);color:#334155;border-radius:12px;padding:7px 10px;font-weight:900;font-size:11px;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;cursor:pointer;white-space:nowrap}.dark .am-btn,.dark .am-file{background:rgba(23,23,23,.88);color:#e5e5e5;border-color:#333}.am-btn.primary{background:#4f46e5;color:#fff;border-color:#4f46e5}.am-btn.ghost{background:transparent}.am-btn.danger{background:#fee2e2;color:#be123c;border-color:#fecdd3}.dark .am-btn.danger{background:#3f121d;color:#fda4af;border-color:#4c1d2a}.am-file input{display:none}.am-download-ready{background:#ecfdf5!important;color:#047857!important;border-color:#a7f3d0!important}.dark .am-download-ready{background:#052e24!important;color:#6ee7b7!important;border-color:#065f46!important}
      .am-download-toast{position:fixed;right:18px;bottom:calc(var(--am-panel-height,320px) + 28px);z-index:10005;max-width:360px;background:rgba(255,255,255,.96);color:#0f172a;border:1px solid rgba(148,163,184,.28);border-radius:18px;padding:12px 14px;box-shadow:0 20px 60px rgba(15,23,42,.18);backdrop-filter:blur(16px);font-family:ui-sans-serif,system-ui,sans-serif}.dark .am-download-toast{background:rgba(10,10,10,.96);color:#f8fafc;border-color:#262626}.am-download-toast strong{display:block;font-size:12px;margin-bottom:2px}.am-download-toast span{display:block;font-size:10px;color:#64748b;font-weight:800;margin-bottom:9px;word-break:break-word}.dark .am-download-toast span{color:#a3a3a3}.am-download-toast div{display:flex;gap:8px}.am-download-toast a,.am-download-toast button{border:0;border-radius:12px;padding:8px 10px;font-size:11px;font-weight:950;cursor:pointer;text-decoration:none}.am-download-toast a{background:#4f46e5;color:#fff}.am-download-toast button{background:#f1f5f9;color:#475569}.dark .am-download-toast button{background:#262626;color:#d4d4d4}
      .am-export-progress{position:fixed;right:18px;bottom:calc(var(--am-panel-height,320px) + 28px);z-index:10006;width:min(360px,calc(100vw - 36px));background:rgba(255,255,255,.97);color:#0f172a;border:1px solid rgba(148,163,184,.28);border-radius:18px;padding:12px 14px;box-shadow:0 20px 60px rgba(15,23,42,.18);backdrop-filter:blur(16px);font-family:ui-sans-serif,system-ui,sans-serif}.dark .am-export-progress{background:rgba(10,10,10,.97);color:#f8fafc;border-color:#262626}.am-export-progress strong{display:block;font-size:12px;margin-bottom:3px}.am-export-progress span{display:block;font-size:10px;color:#64748b;font-weight:850;margin-bottom:9px;line-height:1.35}.dark .am-export-progress span{color:#a3a3a3}.am-export-bar{height:7px;background:rgba(148,163,184,.18);border-radius:999px;overflow:hidden}.am-export-bar i{display:block;height:100%;width:0%;background:#4f46e5;border-radius:999px;transition:width .18s ease}
      .am-structure-search-wrap{margin:0 0 12px 0;padding:10px;border:1px solid rgba(148,163,184,.22);background:rgba(248,250,252,.75);border-radius:16px}.dark .am-structure-search-wrap{background:rgba(23,23,23,.65);border-color:#333}.am-structure-search-wrap label{display:block;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin-bottom:6px}.dark .am-structure-search-wrap label{color:#a3a3a3}.am-structure-search-wrap input{width:100%;box-sizing:border-box;border:1px solid rgba(148,163,184,.3);background:#fff;color:#0f172a;border-radius:12px;padding:10px 12px;font-size:13px;font-weight:800;outline:none}.dark .am-structure-search-wrap input{background:#171717;color:#f5f5f5;border-color:#333}.am-structure-search-empty{grid-column:1/-1;padding:16px;border:1px dashed rgba(148,163,184,.4);border-radius:14px;text-align:center;color:#64748b;font-size:12px;font-weight:850}.dark .am-structure-search-empty{color:#a3a3a3}
      .am-content{flex:1;overflow:hidden;padding:10px 12px;display:grid;grid-template-columns:var(--am-sidebar-width,380px) 8px 1fr;gap:8px;background:linear-gradient(180deg,rgba(248,250,252,.68),rgba(255,255,255,.08))}.dark .am-content{background:linear-gradient(180deg,rgba(23,23,23,.72),rgba(10,10,10,.12))}.am-panel-resizer{position:absolute;left:0;right:0;top:0;height:10px;cursor:ns-resize;z-index:5}.am-panel-resizer:before{content:"";position:absolute;left:50%;top:3px;transform:translateX(-50%);width:68px;height:4px;border-radius:999px;background:rgba(148,163,184,.45)}.am-side-resizer{cursor:ew-resize;border-radius:999px;background:rgba(148,163,184,.18);position:relative}.am-side-resizer:after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:3px;height:56px;border-radius:999px;background:rgba(99,102,241,.52)}.am-side-resizer:hover{background:rgba(99,102,241,.16)}.am-card{background:rgba(255,255,255,.78);border:1px solid rgba(148,163,184,.18);border-radius:18px;padding:10px;box-shadow:0 10px 28px rgba(15,23,42,.045);overflow:auto}.dark .am-card{background:rgba(10,10,10,.58);border-color:#262626}.am-card h3{font-size:10px;margin:12px 0 7px;color:#64748b;text-transform:uppercase;letter-spacing:.12em}.am-card h3:first-child{margin-top:0}.dark .am-card h3{color:#a3a3a3}.am-pill{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid rgba(99,102,241,.16);background:rgba(99,102,241,.07);border-radius:15px;padding:9px;margin-bottom:9px}.am-pill strong{display:block;font-size:12px;letter-spacing:-.02em}.am-pill span{display:block;font-size:9px;color:#64748b;font-weight:850}.dark .am-pill span{color:#a3a3a3}
      .am-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.am-grid.two{grid-template-columns:repeat(2,1fr)}.am-grid.four{grid-template-columns:repeat(4,1fr)}.am-field{display:flex;flex-direction:column;gap:4px}.am-field span{font-size:9px;color:#64748b;font-weight:900}.dark .am-field span{color:#a3a3a3}.am-field input,.am-field select{width:100%;box-sizing:border-box;border:1px solid rgba(148,163,184,.28);background:rgba(248,250,252,.88);color:#0f172a;border-radius:11px;padding:7px 8px;font-size:11px;font-weight:800;outline:none}.dark .am-field input,.dark .am-field select{background:#171717;color:#f5f5f5;border-color:#333}.am-field input:focus,.am-field select:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.14)}.am-field input[type=range]{padding:0}.am-section-title{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:10px 0 7px}.am-section-title h3{margin:0}.am-mini{font-size:9px;color:#64748b;font-weight:850}.dark .am-mini{color:#a3a3a3}
      .am-anim-row,.am-frame-row,.am-scene-row{border:1px solid rgba(148,163,184,.18);background:rgba(248,250,252,.62);border-radius:14px;padding:8px;margin-bottom:7px}.dark .am-anim-row,.dark .am-frame-row,.dark .am-scene-row{background:rgba(23,23,23,.62);border-color:#333}.am-anim-head,.am-frame-head,.am-scene-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px}.am-anim-head strong,.am-frame-head strong,.am-scene-head strong{font-size:11px}.am-anim-head label{display:flex;align-items:center;gap:6px;font-size:10px;font-weight:900;color:#475569}.dark .am-anim-head label{color:#d4d4d4}.am-anim-list{max-height:210px;overflow:auto;padding-right:2px}.am-timeline-shell{display:flex;flex-direction:column;gap:8px;overflow:hidden}.am-toolbar{display:grid;grid-template-columns:70px 98px 1fr auto auto auto auto;gap:7px;align-items:end}.am-formline{display:grid;grid-template-columns:160px 70px 1fr 1fr 76px 76px 76px 145px auto;gap:7px;align-items:end}.am-timeline{overflow:auto;padding-right:3px;min-height:100px}.am-empty{border:1px dashed rgba(148,163,184,.42);border-radius:16px;padding:18px;text-align:center;color:#64748b;font-weight:850;font-size:12px}.dark .am-empty{color:#a3a3a3}.am-frame-meta{display:grid;grid-template-columns:1.2fr repeat(6,1fr);gap:6px}.am-frame-meta .am-field input,.am-frame-meta .am-field select{padding:6px;border-radius:9px}.am-status{font-size:10px;color:#64748b;font-weight:850;min-height:14px;margin-top:7px}.dark .am-status{color:#a3a3a3}
      .am-start{display:grid;place-items:center;height:100%;text-align:center;padding:18px}.am-start-box{max-width:560px;border:1px dashed rgba(99,102,241,.32);background:rgba(99,102,241,.06);border-radius:22px;padding:22px}.am-start h3{margin:0 0 8px;font-size:18px;letter-spacing:-.04em}.am-start p{margin:0 auto 14px;color:#64748b;font-size:12px;font-weight:750;line-height:1.45}.dark .am-start p{color:#a3a3a3}.am-start-actions{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap}
      .am-modal{position:absolute;left:12px;right:12px;bottom:12px;top:64px;display:flex;align-items:flex-end;justify-content:center;background:rgba(15,23,42,.05);backdrop-filter:blur(3px);pointer-events:auto}.am-modal-card{width:min(680px,calc(100vw - 36px));max-height:100%;overflow:auto;background:rgba(255,255,255,.98);border:1px solid rgba(148,163,184,.25);border-radius:20px;box-shadow:0 -10px 50px rgba(15,23,42,.18);padding:14px}.dark .am-modal-card{background:rgba(10,10,10,.98);border-color:#262626}.am-modal-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.am-modal-top h3{font-size:16px;margin:0;letter-spacing:-.04em}.am-scene-row p{margin:3px 0 0;color:#64748b;font-size:10px;font-weight:750}.dark .am-scene-row p{color:#a3a3a3}.am-scene-actions{display:flex;gap:7px;flex-wrap:wrap}.am-export-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.am-export-form .am-btn{grid-column:1/-1}.am-export-note{grid-column:1/-1;margin:0;color:#64748b;font-size:11px;font-weight:750;line-height:1.45}.dark .am-export-note{color:#a3a3a3}
      @media(max-width:980px){.am-drawer{height:min(520px,62vh)}.am-content{grid-template-columns:1fr}.am-side-resizer{display:none}.am-toolbar,.am-formline{grid-template-columns:repeat(2,1fr)}.am-header{align-items:flex-start}.am-header-actions{max-width:58vw}.am-main-tab{bottom:12px;left:12px}}
    `;
    document.head.appendChild(style);
  }
  function renderTransformInputs(){
    const t=getTransform(selectedInstance);
    const labels={position:"Posição",scale:"Escala",rotation:"Rotação"};
    return Object.entries(labels).map(([type,label])=>{
      const values=t[type]||[];
      const uniformValue=type==="scale"?`<label class="am-field"><span>XYZ</span><input data-transform-all="scale" type="number" step="0.05" value="${escapeText(Number((((values[0]??1)+(values[1]??1)+(values[2]??1))/3).toFixed(2)))}"></label>`:"";
      const axisFields=["X","Y","Z"].map((axis,index)=>`<label class="am-field"><span>${axis}</span><input data-transform="${type}" data-axis="${index}" type="number" step="0.05" value="${escapeText(Number((values||[])[index]??(type==='scale'?1:0)).toFixed(2))}"></label>`).join("");
      return `<h3>${label}</h3><div class="am-grid ${type==='scale'?'four':''}">${uniformValue}${axisFields}</div>`;
    }).join("");
  }
  function renderAnimations(){
    const anims=getAnimations();
    if(!anims.length)return `<div class="am-empty">Essa estrutura ainda não tem animações cadastradas.</div>`;
    return anims.map(anim=>{
      const key=animKey(selectedInstance,anim.id);
      const settings=(structure.animationSettings||{})[anim.id]||{};
      const enabled=settings.armed!==false;
      return `<div class="am-anim-row"><div class="am-anim-head"><strong>${escapeText(anim.name||anim.id)}</strong><label><input data-anim-enabled="${escapeText(anim.id)}" type="checkbox" ${enabled?"checked":""}> usar</label></div><div class="am-grid four"><label class="am-field"><span>Duração/s</span><input data-anim-duration="${escapeText(anim.id)}" type="number" min="0" step="0.1" value="${escapeText(settings.duration??(anim.id==='liquid'?(structure.liquidProps?.changeTime??5):5))}"></label><label class="am-field"><span>Escala</span><input data-anim-scale="${escapeText(anim.id)}" type="number" min="0" step="0.05" value="${escapeText(settings.scale??1)}"></label><label class="am-field"><span>Loop</span><select data-anim-loop="${escapeText(anim.id)}"><option value="true" ${(settings.loop===true)?"selected":""}>Sim</option><option value="false" ${(settings.loop!==true)?"selected":""}>Não</option></select></label><button class="am-btn" data-add-anim-frame="${escapeText(anim.id)}">Keyframe</button></div></div>`;
    }).join("");
  }
  function renderFrames(){
    if(!project.frames.length)return `<div class="am-empty">Timeline vazia. Ajuste objeto/animação e clique em “Adicionar”.</div>`;
    return project.frames.map(frame=>`<div class="am-frame-row"><div class="am-frame-head"><strong>${escapeText(frame.name||`Frame ${frame.frame} · ${animName(frame.animId)}`)}</strong><button class="am-btn danger" data-remove-frame="${escapeText(frame.id)}">Remover</button></div><div class="am-frame-meta"><label class="am-field"><span>Nome do frame</span><input data-frame-edit="name" data-id="${escapeText(frame.id)}" type="text" value="${escapeText(frame.name||"")}" placeholder="Ex: Líquido entra"></label><label class="am-field"><span>Frame</span><input data-frame-edit="frame" data-id="${escapeText(frame.id)}" type="number" value="${escapeText(frame.frame)}"></label><label class="am-field"><span>Objeto</span><select data-frame-edit="instanceId" data-id="${escapeText(frame.id)}">${getInstances().map(i=>`<option value="${escapeText(i)}" ${i===frame.instanceId?"selected":""}>${escapeText(objectLabel(i))}</option>`).join("")}</select></label><label class="am-field"><span>Animação</span><select data-frame-edit="animId" data-id="${escapeText(frame.id)}">${getAnimations().map(a=>`<option value="${escapeText(a.id)}" ${a.id===frame.animId?"selected":""}>${escapeText(a.name||a.id)}</option>`).join("")}</select></label><label class="am-field"><span>Ação</span><select data-frame-edit="enabled" data-id="${escapeText(frame.id)}"><option value="true" ${frame.enabled!==false?"selected":""}>Ligar</option><option value="false" ${frame.enabled===false?"selected":""}>Desligar</option></select></label><label class="am-field"><span>Duração (frames)</span><input data-frame-edit="duration" data-id="${escapeText(frame.id)}" type="number" min="1" step="1" value="${escapeText(frame.duration||1)}"></label><label class="am-field"><span>Espera (frames)</span><input data-frame-edit="waitAfter" data-id="${escapeText(frame.id)}" type="number" min="0" step="1" value="${escapeText(frame.waitAfter||0)}"></label></div></div>`).join("");
  }
  function renderSceneLoader(){
    if(!sceneLoaderOpen)return "";
    const scenes=getScenes();
    return `<div class="am-modal" data-modal-close><div class="am-modal-card" data-modal-card><div class="am-modal-top"><h3>Carregar cena</h3><button class="am-btn ghost" data-close-loader>Fechar</button></div>${scenes.length?scenes.map(scene=>`<div class="am-scene-row"><div class="am-scene-head"><div><strong>${escapeText(scene.name)}</strong><p>${escapeText(scene.metadata?.structureName||"Estrutura")} · ${escapeText(scene.metadata?.customObjects??0)} objetos importados · ${escapeText(scene.metadata?.frames??0)} keyframes · ${formatDate(scene.updatedAt)}</p></div>${scene.id===activeSceneId?`<span class="am-mini">ativa</span>`:""}</div><div class="am-scene-actions"><button class="am-btn primary" data-load-scene="${escapeText(scene.id)}">Carregar no visualizador</button><button class="am-btn danger" data-delete-scene="${escapeText(scene.id)}">Excluir</button></div></div>`).join(""):`<div class="am-empty">Ainda não tem cena salva. O primeiro passo é criar uma cena.</div>`}</div></div>`;
  }
  function renderMediaExporter(){
    if(!mediaExportOpen)return "";
    return `<div class="am-modal" data-media-modal-close><div class="am-modal-card am-export-card" data-media-modal-card><div class="am-modal-top"><h3>Exportar mídia da cena</h3><button class="am-btn ghost" data-close-media>Fechar</button></div><form class="am-export-form" data-media-export-form><label class="am-field"><span>Formato</span><select name="format"><option value="video">Vídeo WEBM</option><option value="gif">GIF animado</option><option value="png">PNGs em ZIP</option></select></label><label class="am-field"><span>Vídeo: FPS</span><input name="videoFps" type="number" min="1" max="60" step="1" value="24"></label><label class="am-field"><span>Vídeo: largura máxima</span><input name="videoMaxWidth" type="number" min="360" max="1920" step="10" value="1280"></label><label class="am-field"><span>PNG: salvar a cada X frames</span><input name="step" type="number" min="1" step="1" value="1"></label><label class="am-field"><span>GIF: largura máxima</span><input name="maxWidth" type="number" min="120" max="1200" step="10" value="480"></label><label class="am-field"><span>GIF: FPS</span><input name="gifFps" type="number" min="1" max="12" step="1" value="8"></label><p class="am-export-note">O vídeo sai em WEBM com 24 FPS por padrão, bitrate reduzido e duração automática até o último frame da animação mais longa. O GIF usa uma captura recomposta para evitar frames pretos, transparentes ou corrompidos. Os PNGs são exportados como várias imagens dentro de um ZIP, também até o último frame animado.</p><button class="am-btn primary" type="submit">Exportar mídia</button></form></div></div>`;
  }
  function renderStart(){
    return `<div class="am-start"><div class="am-start-box"><h3>Primeiro passo: criar uma cena</h3><p>A cena salva tudo que está no visualizador agora: estrutura escolhida, objetos importados, posições, escala, rotação, líquido, animações e timeline.</p><div class="am-start-actions"><button class="am-btn primary" data-new-scene>Criar cena</button><button class="am-btn" data-open-loader>Carregar cena</button><label class="am-file">Importar cena<input type="file" accept=".cena,.json,application/json" data-import-scene></label></div><div class="am-status" data-am-status></div></div></div>`;
  }
  function renderEditor(){
    const name=getStructureName();
    const id=getStructureId();
    const instances=getInstances();
    const anims=getAnimations();
    return `<div class="am-content"><aside class="am-card am-side"><h3>Cena</h3><div class="am-pill"><div><strong>${escapeText(sceneName())}</strong><span>${escapeText(name)} · ${escapeText(id)}</span></div></div><label class="am-field"><span>Nome da cena</span><input data-scene-name type="text" value="${escapeText(sceneName())}"></label><label class="am-field"><span>Objeto/instância editada</span><select data-selected-instance>${instances.map(i=>`<option value="${escapeText(i)}" ${i===selectedInstance?"selected":""}>${escapeText(objectLabel(i))}</option>`).join("")}</select></label><label class="am-field"><span>Nome do objeto selecionado</span><input data-object-name type="text" value="${escapeText(objectLabel(selectedInstance))}"></label>${renderTransformInputs()}<div class="am-section-title"><h3>Animações</h3><span class="am-mini">só no Play</span></div><div class="am-anim-list">${renderAnimations()}</div><div class="am-status" data-am-status></div></aside><div class="am-side-resizer" data-resize-side title="Arraste para aumentar ou diminuir o menu esquerdo"></div><section class="am-card am-timeline-shell"><div class="am-toolbar"><label class="am-field"><span>FPS</span><input data-fps type="number" min="1" max="120" step="1" value="${escapeText(project.fps)}"></label><label class="am-field"><span>Total frames</span><input data-total type="number" min="1" max="5000" step="1" value="${escapeText(project.totalFrames)}"></label><label class="am-field"><span>Frame atual: <b data-current-frame>${escapeText(project.currentFrame)}</b></span><input data-frame-range type="range" min="0" max="${escapeText(Math.max(Number(project.totalFrames)||120,timelineEndFrame()))}" step="1" value="${escapeText(project.currentFrame)}"></label><button class="am-btn primary" data-play>${playing?"Rodando":"Play"}</button><button class="am-btn" data-pause>Pause</button><button class="am-btn" data-stop>Stop</button><button class="am-btn" data-apply-frame>Aplicar frame</button></div><form class="am-formline" data-frame-form><label class="am-field"><span>Nome do frame</span><input name="frameName" type="text" placeholder="Ex: Líquido entra"></label><label class="am-field"><span>Frame</span><input name="frame" type="number" min="0" step="1" value="${escapeText(project.currentFrame)}"></label><label class="am-field"><span>Objeto</span><select name="instance">${instances.map(i=>`<option value="${escapeText(i)}" ${i===selectedInstance?"selected":""}>${escapeText(objectLabel(i))}</option>`).join("")}</select></label><label class="am-field"><span>Animação</span><select name="anim">${anims.map(a=>`<option value="${escapeText(a.id)}">${escapeText(a.name||a.id)}</option>`).join("")}</select></label><label class="am-field"><span>Ação</span><select name="action"><option value="on">Ligar</option><option value="off">Desligar</option></select></label><label class="am-field"><span>Duração (frames)</span><input name="duration" type="number" min="1" step="1" value="48"></label><label class="am-field"><span>Espera (frames)</span><input name="wait" type="number" min="0" step="1" value="0"></label><label class="am-field"><span>Condição</span><select name="mode"><option value="frame">No frame escolhido</option><option value="after">Depois do keyframe anterior</option></select></label><button class="am-btn primary" type="submit">Adicionar</button></form><div class="am-timeline">${renderFrames()}</div></section></div>`;
  }
  function renderPanel(){
    let root=document.getElementById("am-integrated-root");
    if(!root){root=document.createElement("div");root.id="am-integrated-root";document.body.appendChild(root)}
    if(!panelOpen){root.innerHTML="";return}
    const subtitle=hasScene()?`${escapeText(sceneName())} · ${escapeText(getStructureName())} · visualizador integrado`:"Crie uma cena para começar";
    applyLayout();
    root.innerHTML=`<div class="am-overlay"><section class="am-drawer"><div class="am-panel-resizer" data-resize-panel title="Arraste para aumentar ou diminuir a timeline"></div><header class="am-header"><div class="am-brand"><div class="am-logo">AM</div><div><h2>Animation Maker</h2><p>${subtitle}</p></div></div><div class="am-header-actions"><button class="am-btn primary" data-new-scene>Criar cena</button><button class="am-btn" data-open-loader>Carregar cena</button>${hasScene()?`<button class="am-btn" data-save-scene>Salvar cena</button><button class="am-btn" data-refresh>Recapturar</button><button class="am-btn" data-export-scene>Exportar cena</button><button class="am-btn" data-open-media-export>Exportar mídia</button>`:""}${lastMediaDownload?`<a class="am-btn am-download-ready" href="${escapeText(lastMediaDownload.url)}" download="${escapeText(lastMediaDownload.filename)}">Baixar mídia</a>`:""}<label class="am-file">Importar cena<input type="file" accept=".cena,.json,application/json" data-import-scene></label><button class="am-btn ghost" data-close-panel>Fechar</button></div></header>${hasScene()?renderEditor():renderStart()}${renderSceneLoader()}${renderMediaExporter()}</section></div>`;
    bindPanel(root);
  }
  function startResize(event,type){
    event.preventDefault();
    const startY=event.clientY,startX=event.clientX,startHeight=layout.panelHeight,startWidth=layout.sidebarWidth;
    const move=e=>{
      if(type==="panel")layout.panelHeight=clamp(startHeight+(startY-e.clientY),220,Math.round(window.innerHeight*.72));
      if(type==="side")layout.sidebarWidth=clamp(startWidth+(e.clientX-startX),320,Math.round(window.innerWidth*.48));
      saveLayout();
    };
    const up=()=>{document.removeEventListener("pointermove",move);document.removeEventListener("pointerup",up)};
    document.addEventListener("pointermove",move);document.addEventListener("pointerup",up);
  }
  function bindPanel(root){
    const close=root.querySelector("[data-close-panel]");if(close)close.onclick=()=>{panelOpen=false;sceneLoaderOpen=false;renderPanel()};
    root.querySelectorAll("[data-new-scene]").forEach(btn=>btn.onclick=createScene);
    root.querySelectorAll("[data-open-loader]").forEach(btn=>btn.onclick=()=>{sceneLoaderOpen=true;renderPanel()});
    const save=root.querySelector("[data-save-scene]");if(save)save.onclick=()=>saveScene(false);
    const refresh=root.querySelector("[data-refresh]");if(refresh)refresh.onclick=requestFresh;
    const exportBtn=root.querySelector("[data-export-scene]");if(exportBtn)exportBtn.onclick=exportScene;
    root.querySelectorAll("[data-open-media-export]").forEach(btn=>btn.onclick=()=>{mediaExportOpen=true;sceneLoaderOpen=false;renderPanel()});
    root.querySelectorAll("[data-import-scene]").forEach(input=>input.onchange=e=>importScene(e.target.files[0]));
    const selected=root.querySelector("[data-selected-instance]");if(selected)selected.onchange=e=>{selectedInstance=normalizeTransformInstance(e.target.value);structure.requestedInstanceId=selectedInstance;autoSaveScene();renderPanel()};
    const sceneNameInput=root.querySelector("[data-scene-name]");if(sceneNameInput)sceneNameInput.onchange=e=>setSceneName(e.target.value);
    const objectNameInput=root.querySelector("[data-object-name]");if(objectNameInput)objectNameInput.onchange=e=>setObjectLabel(selectedInstance,e.target.value);
    root.querySelectorAll("[data-transform]").forEach(input=>input.oninput=e=>setTransformValue(selectedInstance,e.target.dataset.transform,Number(e.target.dataset.axis),e.target.value));
    root.querySelectorAll("[data-transform-all]").forEach(input=>input.onchange=e=>setTransformUniform(selectedInstance,e.target.dataset.transformAll,e.target.value));
    root.querySelectorAll("[data-anim-enabled]").forEach(input=>input.onchange=e=>updateAnimation(selectedInstance,e.target.dataset.animEnabled,{enabled:e.target.checked}));
    root.querySelectorAll("[data-anim-duration]").forEach(input=>input.oninput=e=>updateAnimation(selectedInstance,e.target.dataset.animDuration,{duration:Number(e.target.value)||0}));
    root.querySelectorAll("[data-anim-scale]").forEach(input=>input.oninput=e=>updateAnimation(selectedInstance,e.target.dataset.animScale,{scale:Number(e.target.value)||0}));
    root.querySelectorAll("[data-anim-loop]").forEach(input=>input.onchange=e=>updateAnimation(selectedInstance,e.target.dataset.animLoop,{loop:e.target.value==="true"}));
    root.querySelectorAll("[data-add-anim-frame]").forEach(btn=>btn.onclick=()=>{const form=root.querySelector("[data-frame-form]");if(form){form.querySelector("[name=anim]").value=btn.dataset.addAnimFrame;form.querySelector("[name=instance]").value=selectedInstance;addFrameFromForm()}});
    const fps=root.querySelector("[data-fps]");if(fps)fps.oninput=e=>{project.fps=Math.max(1,Number(e.target.value)||24);autoSaveScene()};
    const total=root.querySelector("[data-total]");if(total)total.oninput=e=>{project.totalFrames=Math.max(1,Number(e.target.value)||120);if(project.currentFrame>project.totalFrames)project.currentFrame=project.totalFrames;autoSaveScene();renderPanel()};
    const range=root.querySelector("[data-frame-range]");if(range)range.oninput=e=>setCurrentFrame(e.target.value);
    const playBtn=root.querySelector("[data-play]");if(playBtn)playBtn.onclick=play;
    const pauseBtn=root.querySelector("[data-pause]");if(pauseBtn)pauseBtn.onclick=()=>pause();
    const stopBtn=root.querySelector("[data-stop]");if(stopBtn)stopBtn.onclick=()=>stop();
    const applyFrame=root.querySelector("[data-apply-frame]");if(applyFrame)applyFrame.onclick=applyCurrentFrame;
    const frameForm=root.querySelector("[data-frame-form]");if(frameForm)frameForm.onsubmit=e=>{e.preventDefault();addFrameFromForm()};
    root.querySelectorAll("[data-remove-frame]").forEach(btn=>btn.onclick=()=>removeFrame(btn.dataset.removeFrame));
    root.querySelectorAll("[data-frame-edit]").forEach(input=>input.onchange=e=>{const type=e.target.dataset.frameEdit;let value=e.target.value;if(["frame","duration","waitAfter"].includes(type))value=Number(value)||0;if(type==="enabled")value=value==="true";updateFrame(e.target.dataset.id,{[type]:value})});
    const closeLoader=root.querySelector("[data-close-loader]");if(closeLoader)closeLoader.onclick=()=>{sceneLoaderOpen=false;renderPanel()};
    const closeMedia=root.querySelector("[data-close-media]");if(closeMedia)closeMedia.onclick=()=>{mediaExportOpen=false;renderPanel()};
    const mediaModal=root.querySelector("[data-media-modal-close]");const mediaCard=root.querySelector("[data-media-modal-card]");if(mediaModal&&mediaCard){mediaModal.onclick=()=>{mediaExportOpen=false;renderPanel()};mediaCard.onclick=e=>e.stopPropagation()}
    const mediaForm=root.querySelector("[data-media-export-form]");if(mediaForm)mediaForm.onsubmit=e=>{e.preventDefault();const data=new FormData(mediaForm);runMediaExport(data.get("format"),Number(data.get("step"))||1,Number(data.get("maxWidth"))||480,Number(data.get("gifFps"))||8,Number(data.get("videoFps"))||24,Number(data.get("videoMaxWidth"))||1280)};
    root.querySelectorAll("[data-load-scene]").forEach(btn=>btn.onclick=()=>loadScene(btn.dataset.loadScene));
    root.querySelectorAll("[data-delete-scene]").forEach(btn=>btn.onclick=()=>deleteScene(btn.dataset.deleteScene));
    const panelResize=root.querySelector("[data-resize-panel]");if(panelResize)panelResize.onpointerdown=e=>startResize(e,"panel");
    const sideResize=root.querySelector("[data-resize-side]");if(sideResize)sideResize.onpointerdown=e=>startResize(e,"side");
    const modal=root.querySelector("[data-modal-close]");const card=root.querySelector("[data-modal-card]");
    if(modal&&card){modal.onclick=()=>{sceneLoaderOpen=false;renderPanel()};card.onclick=e=>e.stopPropagation()}
  }
  function normalizeStructureSearch(value){return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim()}
  function enhanceAddStructureSearch(){
    const headings=[...document.querySelectorAll("h3")].filter(h=>/Adicionar Ferramenta ou Vidraria/i.test(h.textContent||""));
    headings.forEach(heading=>{
      const modal=heading.closest(".fixed")||heading.parentElement?.parentElement;
      if(!modal||modal.querySelector("[data-add-structure-search]"))return;
      const grid=[...modal.querySelectorAll("div")].find(el=>{
        const cls=String(el.className||"");
        return cls.includes("grid")&&cls.includes("gap-3")&&el.querySelectorAll("button").length>2;
      });
      if(!grid)return;
      const wrap=document.createElement("div");
      wrap.className="am-structure-search-wrap";
      wrap.innerHTML='<label>Pesquisar estrutura</label><input data-add-structure-search type="search" placeholder="Digite o nome da vidraria, suporte ou equipamento...">';
      grid.parentElement.insertBefore(wrap,grid);
      const empty=document.createElement("div");
      empty.className="am-structure-search-empty";
      empty.textContent="Nenhuma estrutura encontrada.";
      empty.style.display="none";
      grid.appendChild(empty);
      const input=wrap.querySelector("input");
      const filter=()=>{
        const term=normalizeStructureSearch(input.value);
        let visible=0;
        [...grid.querySelectorAll("button")].forEach(btn=>{
          const hit=!term||normalizeStructureSearch(btn.textContent).includes(term);
          btn.style.display=hit?"":"none";
          if(hit)visible++;
        });
        empty.style.display=visible?"none":"block";
      };
      input.addEventListener("input",filter);
      setTimeout(()=>input.focus(),30);
    });
  }
  function observeAddStructureSearch(){
    if(addStructureSearchObserver)return;
    addStructureSearchObserver=new MutationObserver(()=>enhanceAddStructureSearch());
    addStructureSearchObserver.observe(document.body,{childList:true,subtree:true});
    enhanceAddStructureSearch();
  }
  function showSendPopup(detail){
    if(!isDevModeEnabled())return;
    document.querySelectorAll(".am-send-pop").forEach(el=>el.remove());
    const pop=document.createElement("div");
    pop.className="am-send-pop";
    const x=Math.min((detail.clientX||detail.x||window.innerWidth/2),window.innerWidth-370);
    const y=Math.min((detail.clientY||detail.y||window.innerHeight/2),window.innerHeight-160);
    pop.style.left=Math.max(12,x)+"px";
    pop.style.top=Math.max(12,y)+"px";
    pop.innerHTML=`<strong>Animation Maker</strong><p>${hasScene()?"Enviar essa estrutura para a cena atual com posição, escala, rotação, objetos e animações.":"Crie uma cena com essa estrutura para começar a animar no painel inferior."}</p><div class="row"><button data-send-am>${hasScene()?"Enviar para cena":"Criar cena"}</button><button data-close-am>Cancelar</button></div>`;
    document.body.appendChild(pop);
    pop.querySelector("[data-close-am]").onclick=()=>pop.remove();
    pop.querySelector("[data-send-am]").onclick=()=>{
      requestSnapshot(detail.instanceId||selectedInstance||"glassware");
      panelOpen=true;
      if(!hasScene())createSceneFromCurrent(`Cena ${getScenes().length+1}`);else{selectedInstance=detail.instanceId||structure.requestedInstanceId||selectedInstance;structure.requestedInstanceId=selectedInstance;saveScene(true);renderPanel();setStatus("Estrutura enviada para a cena atual.")}
      pop.remove();
    };
    setTimeout(()=>{const close=e=>{if(!pop.contains(e.target)){pop.remove();document.removeEventListener("mousedown",close)}};document.addEventListener("mousedown",close)},0);
  }
  function openPanel(){
    enableDevMode();
    requestSnapshot(selectedInstance||"glassware");
    panelOpen=true;
    sceneLoaderOpen=false;
    renderPanel();
  }
  function initBridge(){
    applyLayout();
    injectStyle();
    observeAddStructureSearch();
    if(!document.querySelector(".am-main-tab")){
      const btn=document.createElement("button");
      btn.className="am-main-tab";
      btn.type="button";
      btn.textContent="Animation Maker";
      btn.onclick=()=>openPanel();
      document.body.appendChild(btn);
    }
    window.addEventListener("catalog-structure-doubleclick",e=>showSendPopup(e.detail||{}));
    if(channel){
      channel.onmessage=e=>{
        const msg=e.data||{};
        if(msg.type==="toggle")window.dispatchEvent(new CustomEvent("catalog-animation-toggle",{detail:msg.payload||{}}));
        if(msg.type==="enable-dev"){try{localStorage.setItem("catalogoAnimationMakerDevMode","true")}catch{}window.dispatchEvent(new CustomEvent("catalog-animation-maker-enable-dev",{detail:{enabled:true}}))}
        if(msg.type==="apply-state"){
          window.dispatchEvent(new CustomEvent("catalog-animation-maker-apply-state",{detail:msg.payload||{}}));
          if(msg.payload&&msg.payload.transforms)window.dispatchEvent(new CustomEvent("catalog-animation-maker-apply-transforms",{detail:{appItemId:msg.payload.appItemId,transforms:msg.payload.transforms}}));
        }
      }
    }
    if(/animation-maker\.html(?:$|[?#])/i.test(location.href)){
      document.body.innerHTML="";
      panelOpen=true;
      renderPanel();
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initBridge);else initBridge();
})();
