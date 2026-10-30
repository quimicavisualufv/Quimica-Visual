/* Orbital Lab 2.0 — comparação, elétrons, aulas e distorções.
   WebGL nativo compartilhado com o motor original; tudo funciona sem internet.
   Os níveis são modelos didáticos, nunca cálculos ab initio nem dados experimentais. */
(() => {
'use strict';
const E=window.OrbitalEngine, $=id=>document.getElementById(id);
if(!E){console.error('Motor orbital não encontrado');return;}
const {ORBITS,DATA,VECTORS,Renderer,COLOR,state,clamp,lerp,ease,vecScale}=E;
const ids=ORBITS.map(o=>o.id), orbitalLabel={dxy:'dxy',dxz:'dxz',dyz:'dyz',dx2y2:'dx²−y²',dz2:'dz²'};
const labels={oct:'Octaédrica',tet:'Tetraédrica',square:'Quadrado planar'};
const color={dxy:'#f7c594',dxz:'#f15b52',dyz:'#f15b52',dx2y2:'#edb94c',dz2:'#f2635a'};
const source='Referência de princípios: Chemistry LibreTexts, "Crystal Field Theory".';
const fmt=v=>v.toFixed(2).replace('.',',');
const GL={};
const comp={progress:1,playing:false,yaw:.57,pitch:-.32,dist:8.8,orbital:'dx2y2',d:6,field:1,pair:1.1,rotate:false};
const adv={axis:1,yaw:.64,pitch:-.36,dist:9,orbital:'dx2y2'};
let mode=state.mode,last=0,compNeeds=true,advancedNeeds=true;
function initRenderer(canvasId){try{return new Renderer($(canvasId));}catch(e){console.warn('Renderizador '+canvasId,e);return null;}}
function stageDrag(id, target){
  const canvas=$(id);let pointer=null,oldX=0,oldY=0;
  canvas.addEventListener('pointerdown',e=>{if(pointer!==null)return;pointer=e.pointerId;oldX=e.clientX;oldY=e.clientY;canvas.setPointerCapture(pointer);canvas.style.cursor='grabbing';});
  canvas.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;target.yaw+=(e.clientX-oldX)*.01;target.pitch=clamp(target.pitch+(e.clientY-oldY)*.01,-1.48,1.48);oldX=e.clientX;oldY=e.clientY;compNeeds=true;advancedNeeds=true;});
  ['pointerup','pointercancel','lostpointercapture'].forEach(event=>canvas.addEventListener(event,()=>{pointer=null;canvas.style.cursor='grab';}));
  canvas.addEventListener('wheel',e=>{e.preventDefault();target.dist=clamp(target.dist+e.deltaY*.007,5.4,12.8);if(target===comp)$('compareDistance').value=Math.round(comp.dist*100);compNeeds=true;advancedNeeds=true;},{passive:false});
  canvas.addEventListener('keydown',e=>{let changed=true;switch(e.key){case'ArrowLeft':target.yaw-=.12;break;case'ArrowRight':target.yaw+=.12;break;case'ArrowUp':target.pitch-=.12;break;case'ArrowDown':target.pitch+=.12;break;case'+':target.dist-=.4;break;case'-':target.dist+=.4;break;default:changed=false;}if(changed){e.preventDefault();target.pitch=clamp(target.pitch,-1.48,1.48);target.dist=clamp(target.dist,5.4,12.8);if(target===comp)$('compareDistance').value=Math.round(comp.dist*100);compNeeds=true;advancedNeeds=true;}});
}
function drawStage(renderer,geom,p,yaw,pitch,dist){
 if(!renderer||renderer.failed)return;renderer.start(yaw,pitch,dist);renderer.axes(2.8,.26);
 const vv=VECTORS[geom],distance=lerp(3.55,2.14,ease(p)),atoms=vv.map(v=>vecScale(v,distance));
 if($('compareShowOrbital').checked)renderer.orbital(comp.orbital,.46,1.12);
 for(let i=0;i<atoms.length;i++){
  if($('compareBonds').checked)renderer.segment([0,0,0],atoms[i],.03,COLOR.outline,.28+.5*ease(p));
  renderer.ball(atoms[i],.24,DATA[geom].accent,1);
  if($('comparePolyhedron').checked)for(let j=i+1;j<atoms.length;j++){const dot=vv[i].reduce((sum,x,k)=>sum+x*vv[j][k],0);if(dot>-.5&&dot<.5)renderer.segment(atoms[i],atoms[j],.014,COLOR.outline,.4);}
  if(p<.93){const a=vecScale(vv[i],distance+.32),b=vecScale(vv[i],distance+.78);renderer.segment(a,b,.018,DATA[geom].accent,(1-p)*.4);}
 }
 renderer.ball([0,0,0],.29,COLOR.metal,1);
 const host=$('compareLabels'+({oct:'Oct',tet:'Tet',square:'Square'})[geom]);host.hidden=!$('compareLabels').checked;
 if(!host.hidden){const labels=[{name:'M',pos:[0,0,0],kind:'metal'},...atoms.map((pos,i)=>({name:'L'+(i+1),pos,kind:'ligand'})),...[[2.8,0,0],[0,2.8,0],[0,0,2.8]].map((pos,i)=>({name:['x','y','z'][i],pos,kind:'axis'}))];host.innerHTML=E.placeSceneLabels(labels.map(l=>({...l,...renderer.projectPoint(l.pos)})),renderer.canvas.clientWidth,renderer.canvas.clientHeight).map(l=>`<span class="scene-tag ${l.kind}" style="left:${l.x}px;top:${l.y}px">${l.name}</span>`).join('');}
}
function chartSVG(geom,progress=1,levels=null,occupancy=null,compact=false){
 // Cinco linhas mantêm a identidade de cada orbital; a degenerescência resulta da coincidência de alturas.
 const values=levels||DATA[geom].level;
 const w=compact?340:440,h=compact?218:295,cy=compact?115:150,scale=compact?65:84;
 const tracks=compact?[71,121,171,221,271]:[95,169,243,317,391];
 const fitScale=Math.min(scale,(cy-66)/Math.max(.6,...Object.values(values)));const p=ease(progress),lines=ids.map((id,i)=>{
   const yy=cy-(values[id]*p)*fitScale,x=tracks[i],q=occupancy?occupancy[i]:0;
   const arrows=q===2?'↑↓':q===1?'↑':'';
   return `<g><line x1="${x-23}" x2="${x+23}" y1="${yy}" y2="${yy}" stroke="${color[id]}" stroke-width="4" stroke-linecap="round"/><text x="${x}" y="${compact?26:30}" text-anchor="middle" fill="#eebd56" font-size="${compact?10:12}">${orbitalLabel[id]}</text>${arrows?`<text x="${x}" y="${yy-9}" text-anchor="middle" fill="#f47971" font-size="23" font-weight="bold">${arrows}</text>`:''}</g>`;
 }).join('');
 return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Diagrama qualitativo dos cinco orbitais d" xmlns="http://www.w3.org/2000/svg"><line x1="35" y1="14" x2="35" y2="${h-15}" stroke="#a4978b" stroke-width="1.5"/><path d="M30 23 L35 12 L40 23" fill="none" stroke="#edb745"/><text x="13" y="11" fill="#edb94c" font-size="12">E</text><line x1="43" y1="${cy}" x2="${w-12}" y2="${cy}" stroke="#a99d92" stroke-dasharray="4 5" opacity=".45"/><text x="41" y="${cy-7}" font-size="9" fill="#baaea0">E₀</text>${lines}</svg>`;
}
function compareResult(g){const levels=ids.map(id=>DATA[g].level[id]*comp.field*ease(comp.progress)),solution=window.OrbitalScience.solveOccupancy(levels,comp.d,comp.pair,'auto');return {levels,solution,span:Math.max(...levels)-Math.min(...levels)};}
function compareDiagram(g,result){const limit=Math.max(1.6,...Object.values(DATA).flatMap(o=>Object.values(o.level).map(v=>Math.abs(v*comp.field)))),y=v=>137-v/limit*77;
 return `<svg viewBox="0 0 360 255" role="img" aria-label="Ocupação d${comp.d} no modelo ${labels[g]}, com ${result.solution.unpaired} desemparelhados"><line x1="27" x2="27" y1="25" y2="220" stroke="#dbac4d"/><text x="8" y="18" fill="#eebd55" font-size="11">E ↑</text><line x1="36" x2="350" y1="137" y2="137" stroke="#dbac4d" stroke-dasharray="4 5"/>${ids.map((id,i)=>{const x=63+i*62,e=result.levels[i],n=result.solution.occ[i];return `<text x="${x}" y="35" text-anchor="middle" fill="#efbf5b" font-size="11">${orbitalLabel[id]}</text><line x1="${x-22}" x2="${x+22}" y1="${y(e)}" y2="${y(e)}" stroke="${color[id]}" stroke-width="4"/><text x="${x}" y="${y(e)-10}" fill="#f1c871" text-anchor="middle" font-size="22">${n===2?'↑↓':n===1?'↑':''}</text><text x="${x}" y="232" text-anchor="middle" fill="#eebb50" font-size="10">${fmt(e)}</text>`;}).join('')}<text x="187" y="252" fill="#edb745" font-size="10" text-anchor="middle">Energia / Δref · escala comum</text></svg>`;
}
function updateCompare(){
 $('comparePct').textContent=Math.round(comp.progress*100)+'%';$('compareSlider').value=Math.round(comp.progress*100);$('compareElectronsLabel').textContent='d'+sup(comp.d);$('compareFieldLabel').textContent=fmt(comp.field);$('comparePlay').textContent=comp.playing?'Ⅱ Pausar':'▶ Animar comparação';
 const results={};for(const g of ['oct','tet','square']){const m=results[g]=compareResult(g),id={oct:'Oct',tet:'Tet',square:'Square'}[g];$('compareEnergy'+id).innerHTML=compareDiagram(g,m);$('compareStats'+id).innerHTML=[['Amplitude',fmt(m.span)+' Δref'],['Desemparelhados',m.solution.unpaired],['EECC',fmt(m.solution.cfse)+' Δref'],['μ spin-only',fmt(Math.sqrt(m.solution.unpaired*(m.solution.unpaired+2)))+' μB']].map(([name,v])=>`<div><span>${name}</span><strong>${v}</strong></div>`).join('');}
 $('compareReadout').textContent=`Com d${comp.d}, escala de campo ${fmt(comp.field)} e P = ${fmt(comp.pair)}, o modelo prevê ${results.oct.solution.unpaired} desemparelhado(s) no octaedro, ${results.tet.solution.unpaired} no tetraedro e ${results.square.solution.unpaired} no quadrado planar. Compare a orientação do orbital escolhido com as direções dos ligantes.`;
 compNeeds=true;
}
function drawCompare(){for(const g of ['oct','tet','square'])drawStage(GL[g],g,comp.progress,comp.yaw,comp.pitch,comp.dist);}
const ligands=[
 {symbol:'I⁻',name:'iodeto',factor:.43},
 {symbol:'Cl⁻',name:'cloreto',factor:.57},
 {symbol:'F⁻',name:'fluoreto',factor:.70},
 {symbol:'H₂O',name:'água',factor:1.0},
 {symbol:'NH₃',name:'amônia',factor:1.33},
 {symbol:'en',name:'etilenodiamina',factor:1.55},
 {symbol:'CN⁻',name:'cianeto',factor:2.12},
 {symbol:'CO',name:'monóxido de carbono',factor:2.45}
];
const electronic={d:6,geom:'oct',spin:'auto',ligand:3,delta:1,pair:1.10,occupation:[],selectedComplex:null};
const complexes=[
 {formula:'[Ti(H₂O)₆]³⁺',name:'Hexaaquotitânio(III)',d:1,geom:'oct',ligand:3,delta:1,pair:1.1,note:'Ti³⁺ é d¹; um elétron ocupa o conjunto t₂g.'},
 {formula:'[Fe(H₂O)₆]²⁺',name:'Hexaaquoferro(II)',d:6,geom:'oct',ligand:3,delta:.9,pair:1.35,note:'Exemplo usual de Fe²⁺ d⁶ de alto spin.'},
 {formula:'[Fe(CN)₆]⁴⁻',name:'Hexacianoferrato(II)',d:6,geom:'oct',ligand:6,delta:2.15,pair:1.1,note:'Fe²⁺ d⁶, exemplo clássico de baixo spin.'},
 {formula:'[NiCl₄]²⁻',name:'Tetracloroniquelato(II)',d:8,geom:'tet',ligand:1,delta:.63,pair:1.2,note:'Ni²⁺ d⁸ em campo tetraédrico; apresenta elétrons desemparelhados.'},
 {formula:'[Ni(CN)₄]²⁻',name:'Tetracianoniquelato(II)',d:8,geom:'square',ligand:6,delta:1.9,pair:1.05,note:'Ni²⁺ d⁸ quadrado planar, tipicamente diamagnético.'},
 {formula:'[Co(NH₃)₆]³⁺',name:'Hexaaminocobalto(III)',d:6,geom:'oct',ligand:4,delta:1.85,pair:1.0,note:'Co³⁺ d⁶; baixo spin típico, influenciado também pela oxidação +III.'}
];
function combinations(n){
 const result=[];
 for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)for(let d=0;d<3;d++)for(let e=0;e<3;e++)if(a+b+c+d+e===n)result.push([a,b,c,d,e]);
 return result;
}
function getLevels(){const levels=Object.assign({},DATA[electronic.geom].level);
 // Para comparação entre geometria oct/tet: mantemos a escala esquemática de Δt≈4/9 Δo.
 return levels;
}
function solveOccupancy(){return window.OrbitalScience.solveOccupancy(ids.map(id=>getLevels()[id]*electronic.delta),electronic.d,electronic.pair,electronic.spin);}
function electronRows(solution){
 // Cada orbital ocupa uma coluna própria, inclusive quando dois níveis são degenerados.
 // Setas ↑↓ em uma mesma caixa indicam spin oposto no mesmo orbital.
 const lev=getLevels(),maxAbs=Math.max(.75,...ids.map(id=>Math.abs(lev[id]*electronic.delta)));
 const tracks=[82,151,220,289,358];
 const lines=ids.map((id,i)=>{
  const v=lev[id]*electronic.delta;
  const y=168-(v/maxAbs)*96,x=tracks[i],q=solution.occ[i];
  return `<g><text x="${x}" y="27" text-anchor="middle" fill="#f15e55" font-size="12">${orbitalLabel[id]}</text><rect x="${x-27}" y="${y-11}" width="54" height="36" rx="5" fill="${color[id]}" fill-opacity=".07" stroke="${color[id]}" stroke-opacity=".28"/><line x1="${x-23}" y1="${y+24}" x2="${x+23}" y2="${y+24}" stroke="${color[id]}" stroke-width="4" stroke-linecap="round"/>${q?`<text x="${x}" y="${y+18}" text-anchor="middle" fill="#f1c975" font-size="28" font-weight="bold">${q===2?'↑↓':'↑'}</text>`:''}<text x="${x}" y="300" text-anchor="middle" fill="#baaea0" font-size="10">${fmt(v)} Δref</text></g>`;
 }).join('');
 return `<svg viewBox="0 0 425 330" role="img" aria-label="Diagrama energético d${electronic.d} com ${solution.unpaired} elétrons desemparelhados"><line x1="26" y1="14" x2="26" y2="310" stroke="#a79a8f"/><path d="M21 23 L26 11 L31 23" fill="none" stroke="#dbac4d"/><text x="8" y="11" fill="#edb94c" font-size="11">E</text><line x1="35" y1="168" x2="418" y2="168" stroke="#a89c90" stroke-dasharray="5 6" opacity=".38"/>${lines}</svg>`;
}
function renderElectron(){
 const solution=solveOccupancy();if(!solution)return;
 electronic.occupation=solution.occ;
 document.querySelectorAll('.complex-choice').forEach(b=>{const on=Number(b.dataset.example)===electronic.selectedComplex;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
 document.querySelectorAll('.spectro-step').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.ligand===electronic.ligand)));
 if($('electronRealData')&&!electronic.realRecord)$('electronRealData').remove();
 $('electronDiagram').innerHTML=electronRows(solution);
 $('electronCount').value=electronic.d;$('electronCountValue').textContent='d'+sup(electronic.d);
 $('electronGeometry').value=electronic.geom;$('spinMode').value=electronic.spin;
 $('ligandStrength').value=electronic.ligand;$('ligandStrengthText').textContent=ligands[electronic.ligand].symbol;
 $('deltaModel').value=Math.round(electronic.delta*100);$('pairEnergy').value=Math.round(electronic.pair*100);
 $('deltaModelLabel').textContent=fmt(electronic.delta);$('pairLabel').textContent=fmt(electronic.pair);
 document.querySelectorAll('.spectro-step').forEach(b=>b.classList.toggle('selected',+b.dataset.ligand===electronic.ligand));
 $('unpairedValue').textContent=solution.unpaired;
 $('magneticType').textContent=solution.unpaired?'Paramagnético':'Diamagnético';
 $('cfseValue').textContent=(solution.cfse>0?'+':'')+fmt(solution.cfse)+' Δref';
 $('momentValue').textContent=fmt(Math.sqrt(solution.unpaired*(solution.unpaired+2)))+' μB';
 $('diagramSpinLabel').textContent=electronic.spin==='auto'?'OCUPAÇÃO DE MENOR ENERGIA (MODELO)':electronic.spin==='high'?'ALTO SPIN FORÇADO':'BAIXO SPIN FORÇADO';
 const geomMessage=electronic.geom==='square'?'No quadrado planar, o espaçamento é somente ilustrativo e não universal.':electronic.geom==='tet'?'Para ligantes e metais comparáveis, Δt ≈ 4/9 Δo.':'No octaédrico ideal, t₂g = −0,4Δo e e_g = +0,6Δo.';
 $('electronResult').textContent=`d${electronic.d}: ${solution.occ.join(' · ')} elétrons na ordem dxy, dxz, dyz, dx²−y², dz². ${solution.pairs} par(es) e ${solution.unpaired} elétron(s) desemparelhado(s). ${geomMessage}`;
 $('electronExplanation').textContent='Parâmetros adimensionais hipotéticos: Δref representa uma escala arbitrária; P é a penalidade de pareamento. A ocupação automática minimiza EECC + P·pares; Hund resolve apenas empates entre configurações. O estado de spin real depende também de covalência, troca e ambiente químico.';
}
function sup(n){return String(n).replace(/[0123456789]/g,c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]);}
function setExample(index){const o=complexes[index];if(!o)return;Object.assign(electronic,{d:o.d,geom:o.geom,ligand:o.ligand,delta:o.delta,pair:o.pair,spin:'auto',realRecord:null,selectedComplex:index});document.querySelectorAll('.complex-choice').forEach(b=>b.classList.toggle('selected',Number(b.dataset.example)===index));renderElectron();$('electronsModule').scrollIntoView({behavior:'smooth',block:'start'});}
const lessons=window.OrbitalTeachingContent.lessons;
const quiz=[
 {q:'Em campo octaédrico ideal, quais orbitais pertencem a e_g?',a:['dx²−y² e dz²','dxy, dxz e dyz','dxz e dz²','Todos os cinco'],correct:0,hint:'Observe quais lobos apontam para ±x, ±y e ±z.',why:'No campo octaédrico, e_g contém dx²−y² e dz².'},
 {q:'Qual é a ordem energética do campo tetraédrico?',a:['e acima de t₂','t₂ acima de e','Todos degenerados','dz² isolado acima'],correct:1,hint:'Os quatro ligantes chegam entre os eixos, não sobre eles.',why:'No tetraedro, t₂ é o grupo superior e e o inferior.'},
 {q:'Para ligantes e metais comparáveis, qual é a relação aproximada?',a:['Δt = 2Δo','Δt ≈ 4/9 Δo','Δt = 0','Δt sempre > Δo'],correct:1,hint:'O desdobramento tetraédrico geralmente é menor.',why:'Na aproximação simples de campo cristalino, Δt≈4/9 Δo.'},
 {q:'Qual orbital fica mais alto na ordenação quadrado planar usual?',a:['dxy','dxz','dx²−y²','dyz'],correct:2,hint:'Quatro ligantes ocupam os eixos x/y no plano.',why:'O orbital dx²−y² aponta diretamente para os ligantes do plano.'},
 {q:'Um íon d⁶ octaédrico de alto spin tem quantos elétrons desemparelhados?',a:['0','2','4','6'],correct:2,hint:'O arranjo alto spin minimiza pareamentos antes de ocupar os níveis superiores.',why:'t₂g⁴e_g² tem quatro elétrons desemparelhados.'},
 {q:'Para d⁶ octaédrico de baixo spin, qual ocupação ideal?',a:['t₂g⁶e_g⁰','t₂g⁴e_g²','t₂g³e_g³','t₂g⁰e_g⁶'],correct:0,hint:'Quando Δ supera suficientemente o custo de parear, os níveis inferiores se preenchem.',why:'O conjunto t₂g recebe seis elétrons antes de e_g.'},
 {q:'Se todos os elétrons estão pareados, o complexo é considerado...',a:['Paramagnético','Diamagnético','Necessariamente tetraédrico','Sempre colorido'],correct:1,hint:'Pense no momento magnético devido apenas ao spin.',why:'Na aproximação spin-only, zero elétrons desemparelhados implica diamagnetismo.'},
 {q:'Uma cor verde/roxa na superfície orbital indica...',a:['Cargas elétricas + e −','Duas fases da função de onda','Dois prótons','A energia de ionização'],correct:1,hint:'A função de onda muda de sinal entre regiões, sem que a carga do elétron mude.',why:'As cores representam fase (sinal) da função de onda, não carga.'}
].concat(window.OrbitalTeachingContent.quiz);
const school={step:0,answered:{},idx:0,solved:new Set(),points:0,hints:new Set(),answers:{}};
let displayedLesson=-1;
function renderLesson(){
 const l=lessons[school.step];$('lessonSelect').value=String(school.step);if(displayedLesson!==school.step){window.OrbitalTeachingUI.showLesson(l.viewer);displayedLesson=school.step;}$('lessonCount').textContent=`PASSO ${String(school.step+1).padStart(2,'0')} / ${String(lessons.length).padStart(2,'0')}`;
 $('lessonMeter').innerHTML=lessons.map((_,i)=>`<span class="${i<=school.step?'done':''}"></span>`).join('');
 $('lessonIcon').textContent=l.icon;$('lessonTitle').textContent=l.title;$('lessonDescription').textContent=l.desc;
 $('lessonQuestion').innerHTML=`<small>CHECAGEM DE COMPREENSÃO</small><strong>${l.question}</strong>${l.options.map((a,i)=>`<button class="lesson-answer ${school.answered[school.step]===i?'chosen':''}" data-answer="${i}">${a}</button>`).join('')}<p class="answer-explanation" id="lessonFeedback">${school.answered[school.step]!==undefined?(school.answered[school.step]===l.correct?'✓ Correto. ':'↳ Ainda não. ')+l.why:'Escolha uma alternativa para receber o feedback.'}</p>`;
 $('lessonPrev').disabled=school.step===0;$('lessonNext').textContent=school.step===lessons.length-1?'Recomeçar trilha ↺':'Próximo passo →';
 document.querySelectorAll('.lesson-answer').forEach(b=>b.addEventListener('click',()=>{school.answered[school.step]=+b.dataset.answer;renderLesson();}));
}
function renderQuiz(){
 const item=quiz[school.idx];$('quizJump').innerHTML=quiz.map((q,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${q.topic||'Orbitais e campo'}${school.solved.has(i)?' · respondida':''}</option>`).join('');$('quizJump').value=String(school.idx);$('quizTopic').textContent=item.topic||'Orbitais, geometria e spin';$('quizPrev').disabled=school.idx===0;$('quizTag').textContent='DESAFIO '+(school.idx+1);$('quizFraction').textContent=String(school.idx+1).padStart(2,'0')+' / '+String(quiz.length).padStart(2,'0');
 $('quizQuestion').textContent=item.q;$('quizScore').textContent=school.points+' / '+quiz.length+' PONTOS';
 const solved=school.solved.has(school.idx);
 $('quizOptions').innerHTML=item.a.map((a,i)=>`<button class="quiz-choice ${solved&&i===item.correct?'right':''} ${solved&&school.answers[school.idx]===i&&i!==item.correct?'wrong':''}" aria-pressed="${solved&&school.answers[school.idx]===i}" data-choice="${i}" ${solved?'disabled':''}><span>${String.fromCharCode(65+i)}</span>${a}</button>`).join('');
 $('quizFeedback').textContent=solved?(school.answers[school.idx]===item.correct?'✓ Resposta correta. ':'✕ Resposta incorreta. ')+item.why+(school.hints.has(school.idx)?' Com pista: sem pontuação.':''):school.hints.has(school.idx)?'PISTA: '+item.hint:'Uma tentativa por questão. Acertar sem pista vale 1 ponto; usar pista zera o ponto desta questão.';
 $('quizHint').disabled=solved;$('quizNext').textContent=school.idx===quiz.length-1?'Voltar à primeira ↻':'Próxima questão →';
 document.querySelectorAll('.quiz-choice').forEach(b=>b.addEventListener('click',()=>{
  if(school.solved.has(school.idx))return;
  const correct=+b.dataset.choice===item.correct;
  school.answers[school.idx]=+b.dataset.choice;school.solved.add(school.idx);
  if(correct&&!school.hints.has(school.idx))school.points++;
  renderQuiz();$('quizFeedback').textContent=(correct?'✓ Resposta correta! ':'✕ Resposta incorreta. ')+item.why+(school.hints.has(school.idx)?' (Questão respondida com pista, sem pontuação.)':'');
 }));
}
function renderAdvanced(){
 const f=adv.axis,levels={};
 if(f<=1){for(const id of ids)levels[id]=lerp(DATA.square.level[id],DATA.oct.level[id],ease(f));}
 else{
  const d=f-1;for(const id of ids)levels[id]=DATA.oct.level[id];
  // Compressão axial: termos angulares centrados em zero do baricentro.
  const effects={dxy:0.08,dxz:0.18,dyz:0.18,dx2y2:-0.18,dz2:1};const meanEffect=Object.values(effects).reduce((a,b)=>a+b,0)/5; // campo axial aumenta energia dz² em comparação ao baricentro
  for(const id of ids)levels[id]+=(effects[id]-meanEffect)*d*.95;
 }
 $('axialDistanceLabel').textContent=f===0?'Ligantes removidos':(f<=1?fmt(1+(1-f)*5.1/2.14):fmt(1-(f-1)*.75/2.14))+'×';
 $('distortionDiagram').innerHTML=chartSVG('oct',1,levels,null,false);
 $('distortionTitle').textContent=f<.02?'Limite quadrado planar':f<.98?'Alongamento axial':f<=1.02?'Octaedro regular':'Compressão axial';
 $('distortionDescription').textContent=f<.02?'Dois ligantes axiais se afastaram a uma distância considerada infinita no modelo. Permanecem quatro ligantes no plano xy.':f<.98?'À medida que os ligantes ±z se afastam, orbitais com densidade eletrônica associada à direção z tendem a perder repulsão. A curva é uma interpolação conceitual, não um cálculo de estrutura eletrônica.':f<=1.02?'O arranjo ideal tem seis ligantes equidistantes: os níveis e_g e t₂g são degenerados internamente.':'Na compressão tetragonal, os ligantes axiais se aproximam. O componente axial aumenta de energia em um modelo de repulsão direcional, separando níveis antes degenerados.';
 advancedNeeds=true;
}
function drawAdvanced(){
 const r=GL.advanced;if(!r||r.failed)return;r.start(adv.yaw,adv.pitch,adv.dist);r.axes(2.8,.28);
 if($('advancedOrbital').checked)r.orbital(adv.orbital,.27,1.0);
 const f=adv.axis;const aa=VECTORS.oct.map((v,i)=>{
  const axial=i>=4,dis=axial?(f===0?7.2:f<=1?2.14+(1-f)*5.1:2.14-(f-1)*.75):2.14;
  return {pos:vecScale(v,dis),alpha:axial?clamp(f*3,0,1):1,axial};
 });
 for(const item of aa){
   if(item.alpha<.01)continue;
   r.segment([0,0,0],item.pos,.024,COLOR.outline,.55*item.alpha);
   r.ball(item.pos,.22,item.axial?COLOR.negative:COLOR.ligand,item.alpha);
 }
 for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){
 const dot=VECTORS.oct[i].reduce((sum,v,k)=>sum+v*VECTORS.oct[j][k],0);
 if(dot===0)r.segment(aa[i].pos,aa[j].pos,.012,COLOR.outline,.45);
 }
 r.ball([0,0,0],.28,COLOR.metal,1);
}
function openLessonDemo(){window.OrbitalTeachingUI.showLesson(lessons[school.step].viewer);}
function bind(){
 for(const [key,canvasId] of [['oct','compareOct'],['tet','compareTet'],['square','compareSquare']]){GL[key]=initRenderer(canvasId);stageDrag(canvasId,comp);}
 GL.advanced=initRenderer('distortionCanvas');stageDrag('distortionCanvas',adv);
 $('compareOrbital').addEventListener('change',e=>{comp.orbital=e.target.value;compNeeds=true;});
 $('compareElectrons').addEventListener('input',e=>{comp.d=Number(e.target.value);updateCompare();});
 $('compareField').addEventListener('input',e=>{comp.field=Number(e.target.value)/100;updateCompare();});
 $('comparePair').addEventListener('input',e=>{const n=e.target.valueAsNumber;if(!Number.isFinite(n)||n<.1||n>3){e.target.setAttribute('aria-invalid','true');$('comparePairError').textContent='Informe P entre 0,1 e 3.';return;}e.target.removeAttribute('aria-invalid');$('comparePairError').textContent='';comp.pair=n;updateCompare();});
 for(const id of ['compareShowOrbital','compareBonds','comparePolyhedron','compareLabels'])$(id).addEventListener('change',()=>compNeeds=true);
 $('compareRotate').addEventListener('click',()=>{comp.rotate=!comp.rotate;$('compareRotate').setAttribute('aria-pressed',String(comp.rotate));});
 $('compareCamera').addEventListener('click',()=>{Object.assign(comp,{yaw:.57,pitch:-.32,dist:8.8});$('compareDistance').value=880;compNeeds=true;});
 $('compareDistance').addEventListener('input',e=>{comp.dist=Number(e.target.value)/100;compNeeds=true;});
 $('compareSlider').addEventListener('input',e=>{comp.progress=+e.target.value/100;comp.playing=false;updateCompare();});
 $('comparePlay').addEventListener('click',()=>{if(comp.progress>=.999)comp.progress=0;comp.playing=!comp.playing;updateCompare();});
 $('compareReset').addEventListener('click',()=>{comp.progress=0;comp.playing=false;updateCompare();});
 $('spectroSeries').innerHTML=ligands.map((l,i)=>`<button class="spectro-step" data-ligand="${i}" title="${l.name}">${l.symbol}</button>`).join('');
 document.querySelectorAll('.spectro-step').forEach(b=>b.addEventListener('click',()=>setLigand(+b.dataset.ligand)));
 $('electronCount').addEventListener('input',e=>{electronic.d=+e.target.value;electronic.selectedComplex=null;electronic.realRecord=null;renderElectron();});
 $('electronGeometry').addEventListener('change',e=>{electronic.geom=e.target.value;electronic.selectedComplex=null;electronic.realRecord=null;renderElectron();});
 $('spinMode').addEventListener('change',e=>{electronic.spin=e.target.value;electronic.selectedComplex=null;electronic.realRecord=null;renderElectron();});
 $('ligandStrength').addEventListener('input',e=>setLigand(+e.target.value));
 $('deltaModel').addEventListener('input',e=>{electronic.delta=+e.target.value/100;electronic.selectedComplex=null;electronic.realRecord=null;renderElectron();});
 $('pairEnergy').addEventListener('input',e=>{electronic.pair=+e.target.value/100;electronic.selectedComplex=null;electronic.realRecord=null;renderElectron();});
 $('complexCards').innerHTML=complexes.map((o,i)=>`<button class="complex-choice" data-example="${i}"><strong>${o.formula}</strong><small>${o.name}</small><span>${labels[o.geom]} · d${sup(o.d)}</span><p>${o.note}</p></button>`).join('');
 document.querySelectorAll('.complex-choice').forEach(b=>b.addEventListener('click',()=>setExample(+b.dataset.example)));
 $('lessonSelect').innerHTML=lessons.map((l,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${l.title}</option>`).join('');$('lessonSelect').addEventListener('change',e=>{school.step=Number(e.target.value);renderLesson();});
 $('quizJump').addEventListener('change',e=>{school.idx=Number(e.target.value);renderQuiz();});$('quizPrev').addEventListener('click',()=>{school.idx=Math.max(0,school.idx-1);renderQuiz();});
 $('lessonPrev').addEventListener('click',()=>{school.step=clamp(school.step-1,0,lessons.length-1);renderLesson();});
 $('lessonNext').addEventListener('click',()=>{school.step=school.step===lessons.length-1?0:school.step+1;renderLesson();});
 $('lessonDemo').addEventListener('click',openLessonDemo);
 $('quizHint').addEventListener('click',()=>{school.hints.add(school.idx);renderQuiz();});
 $('quizNext').addEventListener('click',()=>{school.idx=(school.idx+1)%quiz.length;renderQuiz();});
 $('quizRestart').addEventListener('click',()=>{school.idx=0;school.solved.clear();school.hints.clear();school.points=0;school.answers={};renderQuiz();});
 $('axialDistance').addEventListener('input',e=>{adv.axis=+e.target.value/100;renderAdvanced();});
 $('advancedOrbital').addEventListener('change',()=>{advancedNeeds=true;});
 $('advancedFocus').addEventListener('change',e=>{adv.orbital=e.target.value;advancedNeeds=true;});
 updateCompare();renderElectron();renderLesson();renderQuiz();renderAdvanced();
 requestAnimationFrame(tick);
}
function setLigand(i){electronic.ligand=i;electronic.delta=ligands[i].factor;electronic.selectedComplex=null;electronic.realRecord=null;renderElectron();}
function tick(now){
 if(document.hidden){last=now;requestAnimationFrame(tick);return;}const dt=Math.min(80,now-last||17);last=now;
 if(mode==='compare'){
  if(comp.rotate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){comp.yaw+=dt*.00022;compNeeds=true;}
  if(comp.playing){comp.progress=clamp(comp.progress+dt/6500,0,1);if(comp.progress>=1)comp.playing=false;updateCompare();}
  if(compNeeds)drawCompare();compNeeds=false;
 }else if(mode==='advanced'){if(advancedNeeds)drawAdvanced();advancedNeeds=false;}
 requestAnimationFrame(tick);
}
window.addEventListener('resize',()=>{compNeeds=true;advancedNeeds=true;});
function loadRecord(rec){const g=rec.geometry==='tetrahedral'?'tet':rec.geometry==='square_planar'?'square':'oct',ligandIndex=Math.max(0,ligands.findIndex(l=>l.symbol.normalize('NFKC').replace(/−/g,'-')===rec.ligand.normalize('NFKC').replace(/−/g,'-')));Object.assign(electronic,{d:rec.d_electrons,geom:g,spin:g==='tet'?'high':(['fe-cyano-ii','co-ammine-iii'].includes(rec.id)?'low':'high'),ligand:ligandIndex,delta:ligands[ligandIndex].factor,pair:1.1,selectedComplex:null,realRecord:rec.id});renderElectron();}
window.OrbitalLab2={get comparison(){return {...comp}},compareResult,loadRecord,onMode:m=>{if(mode==='compare'&&m!=='compare'){comp.playing=false;updateCompare();}mode=m;if(m!=='compare'){comp.rotate=false;$('compareRotate').setAttribute('aria-pressed','false');}if(m==='compare')updateCompare();if(m==='electrons')renderElectron();if(m==='advanced')renderAdvanced();},setExample,source};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
