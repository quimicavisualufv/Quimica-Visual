/* Orbital Lab 3.1 — tutorial de primeira visita.
 * Destaque de BORDA RGB animada, com centro vazado, inspirado no tutorial do VOICES.
 * Sem bibliotecas, analytics, rede ou alteração de resultados científicos.
 */
(() => {
 'use strict';
 const KEY = 'orbital-lab-tour-3.1-complete';
 const $ = s => document.querySelector(s);
 const steps = window.OrbitalGuideSteps;
 const chapters=[...new Set(steps.map(s=>s.chapter))];
 let running=false,index=0,el=null,highlightTarget=null,needsPosition=false,played=new Set(),scrollTimeout=null;
 let memoryComplete=false;
 const safeGet=()=>{try{return localStorage.getItem(KEY)==='yes'}catch{return memoryComplete}};
 const safeSet=()=>{memoryComplete=true;try{localStorage.setItem(KEY,'yes')}catch{}};
 function mount(){
  const root=document.createElement('div');root.id='orbitalTour';root.className='ot-root';root.hidden=true;
  root.innerHTML=`<div class="ot-shade ot-top"></div><div class="ot-shade ot-left"></div><div class="ot-shade ot-right"></div><div class="ot-shade ot-bottom"></div>
   <div class="ot-rgb-frame" aria-hidden="true"></div>
   <section class="ot-card" role="dialog" aria-modal="false" aria-label="Tutorial guiado do Orbital Lab" aria-describedby="otText" tabindex="-1">
     <div class="ot-head"><span class="ot-kicker">◈ ORBITAL LAB · GUIA INTERATIVO</span><button class="ot-close" id="otExit" aria-label="Encerrar tutorial" type="button">×</button></div>
     <div class="ot-meter"><span id="otChapter"></span><span id="otCount"></span></div>
     <div class="ot-track" aria-label="Progresso do tutorial"><span id="otFill"></span></div>
     <label class="ot-index-label" for="otIndex">Ir para um assunto<select id="otIndex" aria-label="Índice completo do tutorial"></select></label><h2 id="otTitle"></h2><p id="otText"></p><div class="ot-practice" id="otPractice"></div>
     <div class="ot-actions"><button id="otBack" class="ot-button ot-back" type="button">← Voltar</button><button id="otNext" class="ot-button ot-next" type="button">Próximo →</button></div>
     <div class="ot-footer"><button id="otSkipModule" class="ot-link" type="button">Pular módulo</button><button id="otSkip" class="ot-link" type="button">Pular tutorial</button></div>
   </section>`;
  document.body.append(root); el={root,card:root.querySelector('.ot-card'),frame:root.querySelector('.ot-rgb-frame'),top:root.querySelector('.ot-top'),left:root.querySelector('.ot-left'),right:root.querySelector('.ot-right'),bottom:root.querySelector('.ot-bottom')};
  $('#otIndex').innerHTML=chapters.map(ch=>`<optgroup label="${ch}">${steps.map((s,i)=>s.chapter===ch?`<option value="${i}">${i+1}. ${s.title}</option>`:'').join('')}</optgroup>`).join('');
  $('#otIndex').addEventListener('change',e=>go(Number(e.target.value)));
  $('#otExit').addEventListener('click',finish);
  $('#otSkip').addEventListener('click',finish);
  $('#otBack').addEventListener('click',()=>go(index-1));
  $('#otNext').addEventListener('click',()=>go(index+1));
  $('#otSkipModule').addEventListener('click',()=>{const ch=steps[index].chapter;const next=steps.findIndex((s,i)=>i>index&&s.chapter!==ch);go(next<0?steps.length:next)});
  $('#replayTourTop').addEventListener('click',()=>start());
  $('#helpStartTour').addEventListener('click',()=>{$('#helpDialog').close();start()});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('input',markAction,true);
  document.addEventListener('pointerdown',markAction,true);
  document.addEventListener('click',markAction,true);
  document.addEventListener('change',e=>{if(e.target.type==='file'&&e.target.files.length&&running&&highlightTarget?.contains(e.target)){played.add(index);$('#otPractice').textContent='✓ Arquivo selecionado. Confira o resultado da leitura no módulo.';}});
  document.addEventListener('toggle',schedule,true);
  document.addEventListener('keydown',e=>{
   if(!running)return;
   if(e.key==='Escape'){e.preventDefault();finish()}
   if(!el.card.contains(document.activeElement))return;
   if(e.key==='ArrowRight' && (e.target.tagName==='BUTTON'||e.target===el.card)){e.preventDefault();go(index+1)}
   if(e.key==='ArrowLeft' && (e.target.tagName==='BUTTON'||e.target===el.card)){e.preventDefault();go(index-1)}
  });
 }
 function markAction(e){
  if(!running||!highlightTarget||!highlightTarget.contains(e.target)||!steps[index].try)return;
  if(e.target.type==='file')return;
  if(e.type==='pointerdown' && e.target.tagName==='INPUT' && e.target.type==='range')return;
  if(e.type==='click' && e.target.tagName==='CANVAS')return; // aguarda o pointerdown para canvas
  if(played.has(index))return;
  played.add(index);const practice=$('#otPractice');practice.classList.add('ot-tried');
  practice.innerHTML='<span aria-hidden="true">✓</span> Interação registrada! Você pode continuar.';
 }
 function schedule(){if(!running||needsPosition)return;needsPosition=true;requestAnimationFrame(()=>{needsPosition=false;position()})}
 function rect(el){return el.getBoundingClientRect()}
 function regionStyle(node,left,top,width,height){Object.assign(node.style,{left:left+'px',top:top+'px',width:Math.max(0,width)+'px',height:Math.max(0,height)+'px'})}
 function position(){
  if(!running)return;
  const w=innerWidth,h=innerHeight,pad=5;
  let r=highlightTarget?rect(highlightTarget):null;
  if(!r||r.width<1||r.height<1){r={left:w/2-10,right:w/2+10,top:h/2-10,bottom:h/2+10,width:20,height:20}}
  const L=Math.max(0,Math.min(w,r.left-pad)),R=Math.max(0,Math.min(w,r.right+pad)),T=Math.max(0,Math.min(h,r.top-pad)),B=Math.max(0,Math.min(h,r.bottom+pad));
  regionStyle(el.top,0,0,w,T);regionStyle(el.bottom,0,B,w,h-B);regionStyle(el.left,0,T,L,B-T);regionStyle(el.right,R,T,w-R,B-T);
  Object.assign(el.frame.style,{left:L+'px',top:T+'px',width:(R-L)+'px',height:(B-T)+'px'});
  const c=rect(el.card),margin=14;
  if(w<760){
   const bottom=12;
   Object.assign(el.card.style,{left:'12px',right:'12px',top:'auto',bottom:bottom+'px'});
  }else{
   const cardW=c.width||350,cardH=c.height||285;
   let x,y;
   if(R+cardW+26<w){x=R+19;y=(T+B-cardH)/2}
   else if(L-cardW-26>0){x=L-cardW-19;y=(T+B-cardH)/2}
   else if(B+cardH+18<h){x=Math.max(margin,Math.min(w-cardW-margin,(L+R-cardW)/2));y=B+14}
   else {x=Math.max(margin,Math.min(w-cardW-margin,(L+R-cardW)/2));y=T-cardH-14}
   x=Math.max(margin,Math.min(w-cardW-margin,x));y=Math.max(margin,Math.min(h-cardH-margin,y));
   Object.assign(el.card.style,{left:x+'px',right:'auto',top:y+'px',bottom:'auto'});
  }
 }
 function focusVisible(target){
  if(!target)return;
  const r=rect(target),w=innerWidth,h=innerHeight;
  if(r.height===0||r.width===0)return;
  const isMobile=w<760;
  if(isMobile){
   const cardH=el.card.offsetHeight||300,navH=0,safeTop=58,safeBottom=h-cardH-navH-22;
   let dy=0;
   if(r.top<safeTop)dy=r.top-safeTop;
   else if(r.top>Math.max(safeTop+60,safeBottom-48))dy=r.top-Math.max(safeTop+50,safeBottom-95);
   if(Math.abs(dy)>8)window.scrollBy({top:dy,behavior:'instant'});
  }else{
   if(r.top<68||r.bottom>h-25)target.scrollIntoView({block:r.height>h*.8?'start':'center',inline:'nearest',behavior:'instant'});
  }
 }
 function go(next){
  if(!running)return;
  if(next>=steps.length){finish();return}
  index=Math.max(0,next);const s=steps[index];
  if(window.OrbitalEngine && window.OrbitalEngine.state.mode!==s.mode)window.OrbitalEngine.setMode(s.mode);
  const prep=s.prepare||{};
  if(prep.geom){const button=$(`[data-geom="${prep.geom}"]`);if(button)button.click();}
  if(Number.isInteger(prep.lesson)){const select=$('#lessonSelect');select.value=prep.lesson;select.dispatchEvent(new Event('change',{bubbles:true}));}
  if(prep.lab)window.OrbitalTeachingUI?.labViewer.load({kind:prep.lab,to:prep.lab==='substitution'?'ammonia':'cn'});
  highlightTarget=$(s.target);
  if(!highlightTarget){console.error('Alvo do tutorial ausente:',s.target);return;}
  if(highlightTarget.tagName==='DETAILS')highlightTarget.open=true;
  $('#otIndex').value=String(index);
  for(let ancestor=highlightTarget?.parentElement;ancestor;ancestor=ancestor.parentElement)if(ancestor.tagName==='DETAILS')ancestor.open=true;
  $('#otChapter').textContent=s.chapter;
  $('#otCount').textContent=String(index+1).padStart(2,'0')+' / '+steps.length;
  $('#otFill').style.width=((index+1)/steps.length*100)+'%';
  $('#otTitle').textContent=s.title;$('#otText').textContent=s.text;
  $('#otBack').disabled=index===0;
  $('#otNext').textContent=index===steps.length-1?'Concluir ✓':'Próximo →';
  $('#otSkipModule').hidden=index>=steps.length-1;
  const hint=$('#otPractice');
  hint.classList.toggle('ot-tried',played.has(index));
  hint.textContent=played.has(index)?'✓ Interação registrada! Você pode continuar.':(s.try||'◈ Observe o elemento destacado e avance quando quiser.');
  requestAnimationFrame(()=>{focusVisible(highlightTarget);position()});
  clearTimeout(scrollTimeout);
  scrollTimeout=setTimeout(()=>{focusVisible(highlightTarget);position()},100);
  $('#otNext').focus({preventScroll:true});
 }
 function start(){
  if(!el)mount();
  const dialog=$('#helpDialog');if(dialog&&dialog.open)dialog.close();
  running=true;index=0;played.clear();el.root.hidden=false;
  document.body.classList.add('ot-running');
  go(0);
 }
 function finish(){
  if(!running)return;running=false;el.root.hidden=true;document.body.classList.remove('ot-running');
  safeSet();highlightTarget=null;
  $('#replayTourTop').focus({preventScroll:true});
 }

 function coverage(){
  const nodes=[...document.querySelectorAll('button,input:not([type="hidden"]),select,summary,a[href],canvas[tabindex]')].filter(n=>!n.closest('#orbitalTour')&&!n.matches('#ligandStrength')&&!n.closest('#ligandLab [data-group=approach],#ligandLab [data-group=axis]'));
  const matched=new Set();
  steps.forEach((s,i)=>s.covers.forEach(selector=>document.querySelectorAll(selector).forEach(root=>{for(const n of nodes)if(root===n||root.contains(n)){matched.add(n);n.dataset.tutorialStep=String(i+1);}})));
  return {total:nodes.length,covered:matched.size,uncovered:nodes.filter(n=>!matched.has(n)).map(n=>({id:n.id,control:n.dataset.control,action:n.dataset.action,text:(n.getAttribute('aria-label')||n.textContent||'').trim().slice(0,85)}))};
 }
 function init(){if(!el)mount();coverage();if(!safeGet())setTimeout(()=>{if(!running)start()},500)}
 if(document.readyState==='complete')init();else window.addEventListener('load',init,{once:true});
 window.OrbitalTour={start,close:finish,get active(){return running},get step(){return index},get count(){return steps.length},go,steps,coverage};
})();
