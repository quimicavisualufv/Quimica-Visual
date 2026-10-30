/* Orbital Lab 3 — interface científica ligada ao app 2.0.
 * Sem bibliotecas externas, sem chamadas de rede, 100% client-side.
 */
(()=>{'use strict';
const S=window.OrbitalScience,D=window.OrbitalLabScientificData,Q=window.OrbitalLabScientificEquations,E=window.OrbitalEngine;
if(!S||!D||!Q||!E){console.error('Dependências científicas ausentes');return;}
const $=id=>document.getElementById(id),fmt=(x,dec=0)=>(Math.abs(Number(x))<.5*Math.pow(10,-dec)?0:Number(x)).toLocaleString('pt-BR',{minimumFractionDigits:dec,maximumFractionDigits:dec});
const safe=str=>String(str??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const sourceUrl='https://www.scielo.br/j/qn/a/KsNnFcDYn5C7rVQbSGdX9bw/?lang=pt',spectraPaper='https://www.scielo.br/j/rmat/a/BwNP4gnzVLKZ9TWJLwcDRXm/?format=html&lang=pt';
const ids=S.BASIS,labels=['dxy','dyz','dz²','dxz','dx²−y²'];
const geomKey=g=>g==='tetrahedral'?'tet':g==='square_planar'?'square':'oct';
const source=D.sources.shriver_atkins_langford1994_via_libretexts;
let selected=D.entries.find(x=>x.id==='ni-aquo-ii')||D.entries[0],active='orbitals';
const records=D.entries;
function tag(label,value,sub=''){return `<div class="sci-stat"><span>${label}</span><strong>${value}</strong>${sub?`<small>${sub}</small>`:''}</div>`;}
function saveCSV(name,text){const blob=new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function csvRows(rows){return rows.map(r=>r.map(v=>'"'+String(typeof v==='string'&&/^[=+@\-\t\r]/.test(v)?"'"+v:(v??'')).replace(/"/g,'""')+'"').join(';')).join('\r\n');}
function renderDb(){
 if(!selected)return;const rec=selected,delta=rec.delta_cm1,geometry=geomKey(rec.geometry);$('databaseFormula').innerHTML=safe(rec.display_formula)+`<small>${safe(rec.metal)}(${rec.metal_oxidation_state >=0?'+':''}${rec.metal_oxidation_state}) · configuração d${rec.d_electrons} · ${geometry==='tet'?'tetraédrico':'octaédrico'} · ligante ${safe(rec.ligand)}</small>`;
 const nm=Q.nmFromWavenumber(delta),kj=Q.energyKJmol(delta);
 $('databaseStats').innerHTML=tag('Δ tabulado',fmt(delta)+' cm⁻¹','compilação bibliográfica')+tag('Energia equivalente',fmt(kj,2)+' kJ/mol','E = Nₐhcν̃')+tag('λ de energia equivalente',fmt(nm,1)+' nm','NÃO é necessariamente λ máximo')+tag('Configuração do metal','d'+rec.d_electrons,rec.geometry==='tetrahedral'?'campo tetraédrico':'campo octaédrico');
 $('databaseSource').innerHTML=`<strong>FONTE · ${source.year}</strong><br>${safe(source.author)}. <em>${safe(source.title)}</em>, ${safe(source.edition)}ª ed. Valor reproduzido em Chemistry LibreTexts. <a href="${source.url}" target="_blank" rel="noopener noreferrer">Consultar tabela original ↗</a><br><span class="sci-footnote">Incerteza: não informada; isso NÃO significa ±0 cm⁻¹.</span>`;
 const values=geometry==='tet'?[-.6,-.6,.4,.4,.4]:[-.4,-.4,-.4,.6,.6];const points=geometry==='tet'?[['e',-.6,2],['t₂',.4,3]]:[['t₂g',-.4,3],['eg',.6,2]];
 $('databaseEnergy').innerHTML=`<svg viewBox="0 0 530 250" role="img" aria-label="Níveis do campo ${geometry==='tet'?'tetraédrico':'octaédrico'} em cm⁻¹"><line x1="50" y1="20" x2="50" y2="224" stroke="#a99c91"/><text x="14" y="24" fill="#edba4d" font-size="13">E ↑</text><line x1="55" x2="510" y1="130" y2="130" stroke="#da382f" stroke-dasharray="5 6"/><text x="65" y="120" fill="#b0a59b" font-size="11">Baricentro</text>${points.map(([name,v,count])=>{const y=130-v*125;return `<g><line x1="200" x2="370" y1="${y}" y2="${y}" stroke="${v>0?'#f8cd9d':'#edb849'}" stroke-width="5" stroke-linecap="round"/><text x="380" y="${y+5}" fill="#f1c76f" font-size="15">${name} (${count})</text><text x="95" y="${y+5}" fill="#eebc54" font-size="12">${fmt(v*delta)} cm⁻¹</text></g>`}).join('')}</svg>`;
 let occ,cfse=0,unpaired=null,spin;
 if(geometry==='tet'){// tetra d7 (e4t2^3), other tetra occupations used only for familiar high-spin configurations
  const d=rec.d_electrons;const up=Math.min(d,5),down=Math.max(0,d-5);const bins=[0,0,0,0,0];for(let i=0;i<up;i++)bins[i]++;for(let i=0;i<down;i++)bins[i]++;const e=bins[0]+bins[1],t=bins[2]+bins[3]+bins[4];cfse=Q.tetraCFSE(e,t,delta);occ=`e${e} t₂${t}`;unpaired=bins.filter(v=>v===1).length;spin='hipótese alto spin';
 }else{
  const d=rec.d_electrons;let lower,upper;
  if(d===6&&(['fe-cyano-ii','co-ammine-iii'].includes(rec.id))){lower=6;upper=0;spin='baixo spin atribuído';unpaired=0;}
  else if(d===6){lower=4;upper=2;spin='alto spin atribuído';unpaired=4;}
  else if(d===1){lower=1;upper=0;spin='d¹';unpaired=1;}
  else if(d===3){lower=3;upper=0;spin='d³';unpaired=3;}
  else if(d===8){lower=6;upper=2;spin='d⁸ octaédrico';unpaired=2;}
  else {lower=Math.min(d,6);upper=d-lower;spin='ocupação simplificada';unpaired=null;}
  occ=`t₂g${lower} eg${upper}`;cfse=Q.octaCFSE(lower,upper,delta);
 }
 $('databaseCFSE').innerHTML=`<strong>EECC calculada (sem energia de pareamento): ${fmt(cfse)} cm⁻¹ = ${fmt(Q.energyKJmol(Math.abs(cfse))*(cfse<0?-1:1),1)} kJ/mol.</strong><br>Ocupação de referência: ${occ} (${spin}); ${unpaired===null?'momento não atribuído':`μ spin-only = ${fmt(Q.spinOnlyMoment(unpaired),2)} μB (${unpaired} desemparelhados)`}.`;
 $('databaseNote').textContent=rec.notes+' A EECC é calculada a partir de uma ocupação atribuída/simplificada, não extraída da medição espectroscópica. Não representa energia livre nem energia total do complexo.';
}
function fillSelect(id,items,keep){$(id).innerHTML=items.map(o=>`<option value="${safe(o.id)}">${safe(o.display_formula)} · Δ ${fmt(o.delta_cm1)} cm⁻¹</option>`).join('');if(keep)$(id).value=keep;}
function selectRecord(id){const o=records.find(x=>x.id===id);if(!o)return;selected=o;$('databaseStats').hidden=false;$('sourceDetails').hidden=false;$('databaseEnergy').hidden=false;$('databaseCFSE').hidden=false;$('databaseNote').hidden=false;$('sendDataElectron').disabled=false;$('sendDataAOM').disabled=false;renderDb();$('databaseSelect').value=o.id;}
const normalize=q=>q.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/−/g,'-').toLowerCase();
function filterRecords(){const q=normalize($('complexSearch').value.trim()),f=records.filter(o=>normalize(o.display_formula+' '+o.metal+' '+o.ligand+' '+o.formula).includes(q));fillSelect('databaseSelect',f);$('databaseCount').textContent=f.length+' / '+records.length+' REGISTROS';$('databaseSelect').disabled=!f.length;
 if(f.length)selectRecord(f.some(x=>x.id===selected?.id)?selected.id:f[0].id);
 else{selected=null;$('databaseFormula').textContent='Nenhum complexo encontrado. Tente outro metal ou ligante.';for(const id of ['databaseStats','sourceDetails','databaseEnergy','databaseCFSE','databaseNote'])$(id).hidden=true;$('sendDataElectron').disabled=true;$('sendDataAOM').disabled=true;}
}
function sendElectron(){const r=selected;if(!r)return;E.setMode('electrons');window.OrbitalLab2.loadRecord(r);
 let existing=$('electronRealData');if(!existing){existing=document.createElement('div');existing.id='electronRealData';existing.className='science-note';$('electronsModule').prepend(existing);}
 existing.innerHTML=`<strong>REFERÊNCIA — ${safe(r.display_formula)}:</strong> Δ publicado = ${fmt(r.delta_cm1)} cm⁻¹. Configuração, ligante e spin de referência carregados. Os controles abaixo usam uma escala didática adimensional; o Δ publicado não foi convertido em Δref. <button class="control-btn" id="returnData">Ver ficha bibliográfica ↗</button>`;$('returnData').onclick=()=>E.setMode('database');
}

// ---------- NI(II) SPECTROSCOPY ----------
const pubBands=[{nm:394,intensity:.82,assign:'³T₁g(P)'},{nm:735,intensity:1,assign:'³T₁g(F)'}];
let spectrumCSV=null,ts={delta:8500,B:900,width:28};
const plot=(pts,rect,scaleX,scaleY)=>pts.map((p,i)=>(i?'L':'M')+scaleX(p).toFixed(2)+' '+scaleY(p).toFixed(2)).join(' ');
function renderTS(){const v=S.d8Transitions(ts.delta,ts.B),dqB=ts.delta/(10*ts.B);$('tsDeltaValue').textContent=fmt(ts.delta,1)+' cm⁻¹';$('tsBValue').textContent=fmt(ts.B,1)+' cm⁻¹';$('tsDelta').value=ts.delta;$('tsB').value=ts.B;
 $('tsParams').innerHTML=tag('Dq/B',fmt(dqB,3),'força relativa do campo')+tag('ν₁ · ³T₂g',fmt(v.v1)+' cm⁻¹',fmt(1e7/v.v1,0)+' nm equiv.')+tag('ν₂ · ³T₁g(F)',fmt(v.v2)+' cm⁻¹',fmt(1e7/v.v2,0)+' nm')+tag('ν₃ · ³T₁g(P)',fmt(v.v3)+' cm⁻¹',fmt(1e7/v.v3,0)+' nm');
 const x0=72,y0=18,w=544,h=304,xmax=Math.max(3,Math.ceil(dqB*2)/2),ymax=Math.ceil(S.tanabeNi(Math.max(3,Math.ceil(dqB*2)/2)).v3/15)*15,scx=x=>x0+x/xmax*w,scy=y=>y0+h-y/ymax*h;
 const curves=[{key:'v1',color:'#edb848',label:'ν₁ · ³T₂g'},{key:'v2',color:'#f2635a',label:'ν₂ · ³T₁g(F)'},{key:'v3',color:'#f6c993',label:'ν₃ · ³T₁g(P)'}];
 const grid=Array.from({length:7},(_,i)=>i*xmax/6).map(x=>`<g><line x1="${scx(x)}" x2="${scx(x)}" y1="${y0}" y2="${y0+h}" stroke="#3f302c" stroke-dasharray="3 6"/><text x="${scx(x)}" y="${y0+h+19}" text-anchor="middle" fill="#baaea0" font-size="11">${fmt(x,1)}</text></g>`).join('')+Array.from({length:6},(_,i)=>i*ymax/5).map(y=>`<g><line x1="${x0}" x2="${x0+w}" y1="${scy(y)}" y2="${scy(y)}" stroke="#3f302c" opacity=".55"/><text x="${x0-11}" y="${scy(y)+4}" text-anchor="end" fill="#baaea0" font-size="11">${fmt(y)}</text></g>`).join('');
 const xv=dqB,yv=S.tanabeNi(xv);
 $('tanabeChart').innerHTML=`${grid}<text x="30" y="14" fill="#edb94c" font-size="13">E/B</text><text x="340" y="368" fill="#eebd55" font-size="13" text-anchor="middle">Dq/B</text>${curves.map(c=>`<path d="${plot(Array.from({length:121},(_,i)=>S.tanabeNi(i*xmax/120)),null,p=>scx(p.x),p=>scy(p[c.key]))}" fill="none" stroke="${c.color}" stroke-width="3" stroke-linecap="round"/>`).join('')}<line x1="${scx(xv)}" x2="${scx(xv)}" y1="${y0}" y2="${y0+h}" stroke="#ffffff" stroke-dasharray="5 5" opacity=".7"/>${curves.map(c=>`<circle cx="${scx(xv)}" cy="${scy(yv[c.key])}" r="5.5" fill="${c.color}" stroke="#100d0c" stroke-width="2"/>`).join('')}`;
 $('tsLegend').innerHTML=curves.map(c=>`<span style="color:${c.color}">● ${c.label}</span>`).join('')+'<span>⋮ parâmetro atual</span>';renderSpectrum();
}
function renderSpectrum(){const x0=65,y0=26,w=554,h=247,reference=S.gaussianSpectrum(pubBands,350,1250,3,ts.width),a=spectrumCSV||reference;
 const min=spectrumCSV?a[0].nm:350,max=spectrumCSV?a.at(-1).nm:1250,maxY=Math.max(.01,...a.map(p=>p.abs)),minY=Math.min(0,...a.map(p=>p.abs)),spanY=maxY-minY,low=minY-spanY*.05,high=maxY+spanY*.22;
 const mx=x=>x0+(x-min)/(max-min)*w,my=y=>y0+h-(y-low)/(high-low)*h;
 const ticks=Array.from({length:7},(_,i)=>min+i*(max-min)/6).map(n=>`<g><line x1="${mx(n)}" x2="${mx(n)}" y1="${y0}" y2="${y0+h}" stroke="#41322e" stroke-dasharray="2 7"/><text x="${mx(n)}" y="${y0+h+21}" font-size="10" text-anchor="middle" fill="#edba4c">${fmt(n)}</text></g>`).join('');
 const yticks=Array.from({length:5},(_,i)=>minY+i*(maxY-minY)/4).map(n=>`<text x="${x0-9}" y="${my(n)+4}" text-anchor="end" fill="#edba4c" font-size="9">${fmt(n,2)}</text>`).join('');
 $('spectrumChart').innerHTML=`${ticks}${yticks}<line x1="${x0}" y1="${my(0)}" x2="${x0+w}" y2="${my(0)}" stroke="#aea298"/><text x="12" y="15" fill="#edba4d" font-size="12">${spectrumCSV?'Abs.':'u.a.'}</text><text x="340" y="319" fill="#edba4d" text-anchor="middle" font-size="13">Comprimento de onda (nm)</text><path d="${plot(a,null,p=>mx(p.nm),p=>my(p.abs))}" fill="none" stroke="${spectrumCSV?'#f2635a':'#edb84a'}" stroke-width="3"/>${!spectrumCSV?pubBands.map(p=>`<g><line x1="${mx(p.nm)}" x2="${mx(p.nm)}" y1="${my(p.intensity)}" y2="${my(0)}" stroke="#f3c78e" stroke-dasharray="5 5" opacity=".6"/><text x="${mx(p.nm)+7}" y="${my(p.intensity)-10}" fill="#f9cfa4" font-size="11">${p.nm} nm</text></g>`).join(''):''}`;
 $('spectrumChart').setAttribute('aria-label',spectrumCSV?`Espectro do usuário: ${a.length} pontos, ${fmt(min)} a ${fmt(max)} nm`:'Reconstrução ilustrativa de bandas publicadas em 394 e 735 nm');
 $('spectrumKind').textContent=spectrumCSV?'CSV DO USUÁRIO':'RECONSTRUÇÃO GAUSSIANA';$('spectraWidthValue').textContent=ts.width+' nm';$('spectraWidth').disabled=!!spectrumCSV;$('spectraClear').disabled=!spectrumCSV;
 const legend=$('spectrumChart').nextElementSibling;legend.innerHTML=spectrumCSV?'<span>● Curva azul: dados do arquivo importado</span>':'<span>● 394 nm — ³T₁g(P) (publicado)</span><span>● 735 nm — ³T₁g(F) (publicado)</span>';
 $('spectraExplanation').textContent=spectrumCSV?'Linha azul: valores importados do arquivo local. A faixa do gráfico acompanha o arquivo, incluindo valores negativos de linha de base. Δ e B afetam o cálculo Tanabe–Sugano.':'Linha verde: reconstrução gaussiana ilustrativa das bandas de 394 e 735 nm publicadas para Ni(II) aquoso. Largura e intensidades em unidades arbitrárias foram escolhidas para visualização.';
 $('spectraSource').innerHTML=`<strong>FONTES</strong><br>Andrade et al., <em>Matéria</em> (2018): máximos UV-Vis em 394 e 735 nm no texto (740 nm na tabela para a segunda banda). <a href="${spectraPaper}" target="_blank" rel="noopener noreferrer">Ver artigo ↗</a><br>Gushikem, <em>Química Nova</em> 28 (2005): equações das transições d⁸. <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Ver artigo ↗</a>`;
}
// ----------- AOM WITH REAL POSITIONS / LITERATURE CALIBRATION -----------
const aom={geom:'oct',ligands:S.octPositions(),select:0,sigma:8500/3,pi:0,R0:2,n:5,yaw:.72,pitch:-.37,dist:9.7,focus:'',cif:null,cifName:'',results:null,reference:records.find(x=>x.id==='ni-aquo-ii')};
let render3d=null,loadedCIFName='',csvRequest=0,cifRequest=0;
function aomCurrent(){return aom.ligands[aom.select]||aom.ligands[0];}
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
function thetaPhi(p){const r=Math.hypot(...p);return {theta:Math.acos(clamp(p[2]/r,-1,1))*180/Math.PI,phi:Math.atan2(p[1],p[0])*180/Math.PI};}
function makeP(r,t,p){return [r*Math.sin(rad(t))*Math.cos(rad(p)),r*Math.sin(rad(t))*Math.sin(rad(p)),r*Math.cos(rad(t))];}
function updateAomLigandControls(){const l=aomCurrent();if(!l)return;$('aomLigand').innerHTML=aom.ligands.map((v,i)=>`<option value="${i}">${safe(v.label||'L'+(i+1))} · ${fmt(Math.hypot(...v.pos),2)} Å</option>`).join('');$('aomLigand').value=aom.select;const p=thetaPhi(l.pos),r=Math.hypot(...l.pos);$('aomR').value=String(Math.round(clamp(r,1.2,4.25)*100));$('aomRLabel').textContent=fmt(r,2)+' Å';$('aomTheta').value=Number(p.theta.toFixed(3));$('aomPhi').value=Number(p.phi.toFixed(3));}
function selectAom(i){aom.select=clamp(i,0,aom.ligands.length-1);updateAomLigandControls();drawAom();}
function resetAom(geom){aom.geom=geom==='custom'?'oct':geom;aom.ligands=S.geometryPositions(aom.geom,aom.R0);aom.select=0;aom.cif=null;aom.cifName='';$('aomGeom').value=aom.geom;$('aomGeomName').textContent=({oct:'OCTÁEDRICO',tet:'TETRAÉDRICO',square:'QUADRADO PLANAR'})[aom.geom];$('aomCanvasInfo').textContent='Selecione um ligante · arraste para ajustar r · use θ e φ para orientar';$('aomSendGeom').disabled=false;refreshAom();}
function updateAom(){try{aom.results=S.aom(aom.ligands,aom.sigma,aom.pi,aom.n,aom.R0);}catch(err){aom.results=null;$('aomStatus').textContent=err.message;$('aomReadout').textContent='';$('aomDiagram').textContent='';$('aomMatrix').textContent='';$('aomExport').disabled=true;return;}$('aomExport').disabled=false;
 const m=aom.results,dlt=m.span;
 $('aomSigmaValue').textContent=fmt(aom.sigma)+' cm⁻¹';$('aomPiValue').textContent=fmt(aom.pi)+' cm⁻¹';$('aomExponentValue').textContent=fmt(aom.n,1);$('aomR0Value').textContent=fmt(aom.R0,2)+' Å';
 $('aomReadout').innerHTML=tag('Amplitude total dos níveis',fmt(dlt)+' cm⁻¹','max(E) − min(E) no AOM')+tag('Baricentro (antes da centralização)',fmt(m.mean)+' cm⁻¹','traço(H)/5')+tag('Ligantes considerados',aom.ligands.length,aom.cif?'posições de CIF importado':'geometria idealizada')+tag('Soma dos níveis relativos',fmt(m.levels.reduce((s,v)=>s+v.centered,0),4)+' cm⁻¹','≈ 0 por construção');
 const min=m.levels[0].centered,max=m.levels.at(-1).centered,margin=Math.max(800,(max-min)*.12),low=Math.min(min-margin,-1000),high=Math.max(max+margin,1000),cy=y=>292-(y-low)/(high-low)*250;
 const colors=['#edb747','#f15b52','#f15f55','#eec29a','#f7de9c'];
 $('aomDiagram').innerHTML=`<svg viewBox="0 0 530 320" aria-label="Autovalores do Hamiltoniano 5×5" role="img"><line x1="52" y1="19" x2="52" y2="293" stroke="#aa9e93"/><line x1="56" y1="${cy(0)}" x2="506" y2="${cy(0)}" stroke="#b1a69b" stroke-dasharray="4 6" opacity=".5"/><text x="8" y="20" fill="#f15f55" font-size="11">E ↑</text>${m.levels.map((l,i)=>`<g><line x1="${100+i*77}" x2="${154+i*77}" y1="${cy(l.centered)}" y2="${cy(l.centered)}" stroke="${colors[i]}" stroke-width="4" stroke-linecap="round"/><text x="${127+i*77}" y="${cy(l.centered)-11}" fill="#f3726a" font-size="12" text-anchor="middle">${fmt(l.centered)}</text><text x="${127+i*77}" y="307" fill="#eeba4e" font-size="11" text-anchor="middle">${safe(l.dominant)}</text></g>`).join('')}</svg><p class="sci-footnote">Orbital dominante indica o maior peso |cᵢ|² do autovetor (pode haver mistura significativa). E são autovalores individuais relativos ao baricentro, não energia de transição multieletrônica.</p>`;
 $('aomMatrix').innerHTML='<p>H (cm⁻¹) · base: dxy, dyz, dz², dxz, dx²−y²</p><table><thead><tr><th></th>'+labels.map(x=>`<th>${x}</th>`).join('')+'</tr></thead><tbody>'+m.matrix.map((r,i)=>'<tr><th>'+labels[i]+'</th>'+r.map(v=>`<td>${fmt(v)}</td>`).join('')+'</tr>').join('')+'</tbody></table>';
}
function drawAom(){if(!render3d)return;const r=render3d;try{r.start(aom.yaw,aom.pitch,aom.dist);r.axes(3.5,.3);
 if(aom.focus)r.orbital(aom.focus,.33,1.2);aom.ligands.forEach((l,i)=>{let p=l.pos;if(i===aom.select)r.segment([0,0,0],p,.035,[.98,.72,.36],.85);else r.segment([0,0,0],p,.019,[.48,.73,.8],.5);r.ball(p,i===aom.select?.26:.18,i===aom.select?[1,.74,.36]:[.72,.7,.96],1);});r.ball([0,0,0],.29,E.COLOR.metal,1);
 }catch(err){console.warn('AOM WebGL:',err);}}
function refreshAom(){if($('aomStatus'))$('aomStatus').textContent='Geometria atualizada. Parâmetros eσ/eπ independentes das posições.';updateAomLigandControls();updateAom();drawAom();}
function projection(p){const cy=Math.cos(aom.yaw),sy=Math.sin(aom.yaw),cx=Math.cos(aom.pitch),sx=Math.sin(aom.pitch),x=cy*p[0]+sy*p[2],z=-sy*p[0]+cy*p[2],y=cx*p[1]-sx*z,zz=sx*p[1]+cx*z,canvas=$('aomCanvas'),h=canvas.clientHeight,w=canvas.clientWidth;const scale=h*1.207/Math.max(1,aom.dist-zz);return {x:w/2+x*scale,y:h/2-y*scale};}
function bindAomPointer(){const canvas=$('aomCanvas');let last=null,picked=false,dragging=false;
 canvas.addEventListener('pointerdown',ev=>{const rect=canvas.getBoundingClientRect(),px=ev.clientX-rect.left,py=ev.clientY-rect.top;let best=-1,dd=32*32;
 aom.ligands.forEach((l,i)=>{const p=projection(l.pos),d=(p.x-px)**2+(p.y-py)**2;if(d<dd){dd=d;best=i;}});
 if(dragging)return;picked=best>=0;dragging=true;last={x:ev.clientX,y:ev.clientY};if(picked)selectAom(best);canvas.setPointerCapture(ev.pointerId);canvas.style.cursor='grabbing';});
 canvas.addEventListener('pointermove',ev=>{if(!dragging||!last)return;const dx=ev.clientX-last.x,dy=ev.clientY-last.y;last={x:ev.clientX,y:ev.clientY};if(picked){const l=aomCurrent(),p=thetaPhi(l.pos),old=Math.hypot(...l.pos),dist=clamp(old+dy*.008,1.2,4.25);l.pos=makeP(dist,p.theta,p.phi);refreshAom();}else{aom.yaw+=dx*.008;aom.pitch=clamp(aom.pitch+dy*.008,-1.45,1.45);drawAom();}});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,()=>{dragging=false;last=null;canvas.style.cursor='grab';});
 canvas.addEventListener('wheel',ev=>{ev.preventDefault();aom.dist=clamp(aom.dist+ev.deltaY*.012,6,16);drawAom();},{passive:false});
 canvas.addEventListener('keydown',ev=>{if(ev.key==='ArrowLeft')aom.yaw-=.13;else if(ev.key==='ArrowRight')aom.yaw+=.13;else if(ev.key==='ArrowUp')aom.pitch=clamp(aom.pitch-.12,-1.45,1.45);else if(ev.key==='ArrowDown')aom.pitch=clamp(aom.pitch+.12,-1.45,1.45);else return;ev.preventDefault();drawAom();});
}
function updateCalibrationControl(){const rec=records.find(x=>x.id===$('aomComplex').value);$('aomCalibrate').textContent=geomKey(rec?.geometry)==='tet'?'Calibrar eσ via Δ tabulado (T_d)':'Calibrar eσ via Δ tabulado (Oₕ)';$('aomReferenceTag').textContent='◈ REFERÊNCIA SELECIONADA';}
function aomCalibrate(){const rec=records.find(x=>x.id===$('aomComplex').value);if(!rec)return;const refGeom=geomKey(rec.geometry),tet=refGeom==='tet',sigma=tet?3*rec.delta_cm1/4+4*aom.pi/3:S.calibrateOctSigma(rec.delta_cm1,aom.pi);
 if(sigma<0||sigma>17000){$('aomStatus').textContent='Não foi possível calibrar: o eσ exigido fica fora de 0–17.000 cm⁻¹. Ajuste eπ e tente novamente.';return;}
 aom.reference=rec;aom.sigma=sigma;$('aomSigma').value=String(sigma);$('aomReferenceTag').textContent='◈ eσ AJUSTADO À REFERÊNCIA';$('aomReferenceTag').title='Parâmetro AOM calculado, não medido independentemente.';
 const regular=S.geometryPositions(refGeom,aom.R0),same=aom.geom===refGeom&&aom.ligands.length===regular.length&&aom.ligands.every((l,i)=>Math.hypot(...l.pos.map((v,k)=>v-regular[i].pos[k]))<1e-6);
 $('aomStatus').textContent=`eσ ajustado a ${rec.display_formula}; ${tet?'Δt = 4eσ/3 − 16eπ/9':'Δo = 3eσ − 4eπ'}, sob geometria ideal a R₀.`+(same?' O modelo atual reproduz o Δ de referência.':' A geometria atual é diferente e pode produzir outro desdobramento.');
 updateAom();drawAom();
}
function sendAOM(){const rec=selected;if(!rec)return;E.setMode('aom');$('aomComplex').value=rec.id;aom.pi=0;$('aomPi').value=0;resetAom(geomKey(rec.geometry));updateCalibrationControl();aomCalibrate();}
function resetCIFStatus(){$('cifInfo').textContent='Nenhuma estrutura importada. O modelo usa coordenadas geométricas idealizadas (R₀ hipotético).';$('cifAtoms').innerHTML='';$('cifMetal').innerHTML='<option>Importe um CIF</option>';$('cifMetal').disabled=true;$('cifApply').disabled=true;}
let loadedCIF=null;
function showCIF(){if(!loadedCIF)return;const cif=loadedCIF;const metals=new Set(['Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Mo','Ru','Rh','Pd','Ag','Cd','W','Ir','Pt','Au']);const opts=cif.atoms.map((a,i)=>({...a,i})).filter(a=>metals.has(a.element));$('cifMetal').innerHTML=opts.map(a=>`<option value="${a.i}">${safe(a.label)} · ${a.element} · sítio ${a.i+1}</option>`).join('');$('cifMetal').disabled=!opts.length;$('cifApply').disabled=!opts.length;
 $('cifInfo').textContent=`${loadedCIFName} · célula a=${fmt(cif.cell.a,3)}, b=${fmt(cif.cell.b,3)}, c=${fmt(cif.cell.c,3)} Å; α=${fmt(cif.cell.alpha,2)}°, β=${fmt(cif.cell.beta,2)}°, γ=${fmt(cif.cell.gamma,2)}° · ${cif.atoms.length} sítios explícitos. ${cif.warning}${!opts.length?' Nenhum centro metálico reconhecido; não é possível aplicar esta estrutura.':''}`;$('cifAtoms').innerHTML=opts.slice(0,12).map(a=>`<span class="cif-tag">${safe(a.label)} (${safe(a.element)})</span>`).join('');}
function applyCIF(){if(!loadedCIF)return;const idx=Number($('cifMetal').value),shell=S.ligandShell(loadedCIF,idx,6,3.1);if(shell.length<2){$('cifInfo').textContent='Não encontrei vizinhos suficientes (até 3,1 Å). Verifique simetria, elementos, sítios e qualidade do CIF.';return;}
 aom.geom='custom';aom.cif=loadedCIF;aom.cifName=loadedCIFName;$('aomSendGeom').disabled=true;$('aomCanvasInfo').textContent='CIF aplicado · coordenadas explícitas · sem expansão de simetria';aom.ligands=shell.map(x=>({pos:x.pos,label:x.label+' '+x.element}));aom.select=0;
 if(!$('aomGeom').querySelector('option[value="custom"]'))$('aomGeom').insertAdjacentHTML('beforeend','<option value="custom">Estrutura CIF importada</option>');$('aomGeom').value='custom';$('aomGeomName').textContent='CIF · '+aom.ligands.length+' VIZINHOS';
 const distances=shell.map(x=>x.r);const average=distances.reduce((a,b)=>a+b,0)/distances.length;
 $('cifAtoms').innerHTML=shell.map(x=>`<span class="cif-tag">${safe(x.label)} · ${fmt(x.r,3)} Å</span>`).join('');$('cifInfo').textContent=`Campo aplicado: ${shell.length} vizinhos explícitos em torno de ${loadedCIF.atoms[idx].label}, distâncias ${fmt(Math.min(...distances),3)}–${fmt(Math.max(...distances),3)} Å (média ${fmt(average,3)} Å). ${loadedCIF.warning} AOM eσ/eπ permanecem parâmetros independentes, não medidos pelo CIF.`;
 refreshAom();
}
function init(){
 fillSelect('databaseSelect',records,selected.id);renderDb();fillSelect('aomComplex',records,aom.reference.id);
 $('complexSearch').addEventListener('input',filterRecords);$('databaseSelect').addEventListener('change',e=>selectRecord(e.target.value));
 $('exportDatabase').addEventListener('click',()=>saveCSV('orbital_lab_valores_literatura.csv',csvRows([['id','formula','geometria','d','delta_cm1','tipo','fonte_url'],...records.map(r=>[r.id,r.display_formula,r.geometry,r.d_electrons,r.delta_cm1,r.data_kind,D.sources[r.source_id].url])])));
 $('sendDataElectron').addEventListener('click',sendElectron);$('sendDataAOM').addEventListener('click',sendAOM);
 $('tsDelta').addEventListener('input',e=>{ts.delta=+e.target.value;$('tsFitStatus').textContent='';renderTS();});$('tsB').addEventListener('input',e=>{ts.B=+e.target.value;$('tsFitStatus').textContent='';renderTS();});
 $('tsB720').addEventListener('click',()=>{ts.B=720;$('tsFitStatus').textContent='';renderTS();});$('tsB804').addEventListener('click',()=>{ts.B=804;$('tsFitStatus').textContent='';renderTS();});
 $('tsFitPublished').addEventListener('click',()=>{const fit=S.fitNi(1e7/735,1e7/394);ts.delta=fit.delta;ts.B=fit.B;renderTS();$('tsFitStatus').textContent=`Ajuste numérico aos dois máximos: B ≈ ${fmt(fit.B,1)} cm⁻¹; Δ ≈ ${fmt(fit.delta)} cm⁻¹. ν₁ prevista ≈ ${fmt(fit.fit.v1)} cm⁻¹ (energia equivalente ~${fmt(1e7/fit.fit.v1)} nm). Ajuste do modelo, NÃO medida independente de ν₁.`;});
 $('spectraWidth').addEventListener('input',e=>{ts.width=+e.target.value;renderSpectrum();});
 $('spectraCSV').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;const request=++csvRequest;try{if(f.size>3e6)throw new Error('Arquivo CSV maior que 3 MB');const parsed=S.parseSpectrumCSV(await f.text());if(request!==csvRequest)return;spectrumCSV=parsed.points;$('spectraCSVStatus').textContent=`${f.name}: ${spectrumCSV.length} pares importados.`+(parsed.rejected?` ${parsed.rejected} linha(s) inválida(s) descartada(s).`:'')+' Origem: usuário.';renderSpectrum();}catch(err){if(request!==csvRequest)return;$('spectraCSVStatus').textContent='Falha ao ler CSV: '+err.message+(spectrumCSV?' O gráfico mantém o último CSV válido.':'');}finally{if(request===csvRequest)$('spectraCSV').value='';}});
 function clearSpectrum(){csvRequest++;spectrumCSV=null;$('spectraCSV').value='';$('spectraCSVStatus').textContent='Exibindo reconstrução das bandas publicadas; nenhum CSV ativo.';renderSpectrum();}
 $('spectraClear').addEventListener('click',clearSpectrum);$('spectraExample').addEventListener('click',clearSpectrum);
 $('aomGeom').addEventListener('change',e=>{if(e.target.value!=='custom')resetAom(e.target.value);});
 $('aomReset').addEventListener('click',()=>{resetAom(aom.geom==='custom'?'oct':aom.geom);});
 $('aomLigand').addEventListener('change',e=>selectAom(+e.target.value));$('aomFocus').addEventListener('change',e=>{aom.focus=e.target.value;drawAom();});
 $('aomR').addEventListener('input',e=>{const l=aomCurrent(),p=thetaPhi(l.pos),r=+e.target.value/100;l.pos=makeP(r,p.theta,p.phi);refreshAom();});
 function angles(){const th=$('aomTheta').valueAsNumber,ph=$('aomPhi').valueAsNumber;const valid=Number.isFinite(th)&&Number.isFinite(ph)&&th>=0&&th<=180&&ph>=-180&&ph<=360;
 if(!valid){$('aomStatus').textContent='Informe θ entre 0 e 180° e φ entre −180 e 360°. O modelo mantém a última posição válida.';return;}const l=aomCurrent(),r=Math.hypot(...l.pos);l.pos=makeP(r,th,ph);$('aomStatus').textContent='Orientação ajustada; a calibração, se existente, refere-se à geometria ideal.';updateAom();drawAom();}
 $('aomTheta').addEventListener('input',angles);$('aomPhi').addEventListener('input',angles);
 $('aomSigma').addEventListener('input',e=>{aom.sigma=+e.target.value;$('aomReferenceTag').textContent='◈ PARÂMETROS AJUSTADOS';$('aomStatus').textContent='Parâmetros alterados manualmente; use Calibrar para refazer o ajuste à referência.';updateAom();});
 $('aomPi').addEventListener('input',e=>{aom.pi=+e.target.value;$('aomReferenceTag').textContent='◈ PARÂMETROS AJUSTADOS';$('aomStatus').textContent='Parâmetros alterados manualmente; use Calibrar para refazer o ajuste à referência.';updateAom();});
 $('aomExponent').addEventListener('input',e=>{aom.n=+e.target.value;$('aomStatus').textContent='Expoente radial alterado; a calibração usa a referência ideal a R₀.';updateAom();});$('aomR0').addEventListener('input',e=>{aom.R0=+e.target.value/100;$('aomStatus').textContent='R₀ alterado; as coordenadas dos ligantes foram mantidas. Restaure a geometria para posicioná-los em R₀.';updateAom();});
 $('aomCalibrate').addEventListener('click',aomCalibrate);
 $('aomComplex').addEventListener('change',()=>{updateCalibrationControl();$('aomStatus').textContent='Referência alterada. Clique em Calibrar para aplicá-la aos parâmetros.';});
 $('aomExport').addEventListener('click',()=>{if(!aom.results)return;const rows=[['natureza','modelo_AOM_semiempirico'],['e_sigma_cm-1',aom.sigma],['e_pi_cm-1',aom.pi],['r0_angstrom',aom.R0],['expoente',aom.n],['geom',aom.geom],['cif_arquivo_usuario',aom.cifName||'nenhum'],[],['indice','orbital_dominante','energia_relativa_cm-1','energia_absoluta_modelo_cm-1'],...aom.results.levels.map((e,i)=>[i+1,e.dominant,e.centered,e.value]),[],['matriz_H_cm-1',...ids],...aom.results.matrix.map((row,i)=>[ids[i],...row]),[],['ligante','x_angstrom','y_angstrom','z_angstrom','r_angstrom'],...aom.ligands.map((l,i)=>[l.label||('L'+(i+1)),...l.pos,Math.hypot(...l.pos)])];saveCSV('orbital_lab_AOM_resultados.csv',csvRows(rows));});
 $('aomSendGeom').addEventListener('click',()=>{E.setGeometry(aom.geom==='custom'?'oct':aom.geom);E.setProgress(1);E.setMode('geometries');});
 $('cifFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;const request=++cifRequest;try{if(f.size>5e6)throw new Error('CIF maior que 5 MB.');const cif=S.getFieldFromCIF(await f.text());if(request!==cifRequest)return;loadedCIF=cif;loadedCIFName=f.name;showCIF();}catch(err){if(request!==cifRequest)return;loadedCIF=null;loadedCIFName='';resetCIFStatus();$('cifInfo').textContent='Erro ao importar CIF: '+err.message+' O AOM atual foi mantido.';}finally{if(request===cifRequest)$('cifFile').value='';}});
 $('cifApply').addEventListener('click',()=>{try{applyCIF();}catch(err){$('cifInfo').textContent=err.message;}});$('cifClear').addEventListener('click',()=>{cifRequest++;loadedCIF=null;loadedCIFName='';$('cifFile').value='';resetCIFStatus();resetAom('oct');$('aomStatus').textContent='Estrutura removida; geometria octaédrica restaurada.';});
 try{render3d=new E.Renderer($('aomCanvas'));bindAomPointer();}catch(err){console.warn('AOM 3D fallback indisponível',err);}
 resetAom('oct');updateCalibrationControl();renderTS();resetCIFStatus();
 window.addEventListener('resize',()=>{if(active==='aom')drawAom();});
}
window.OrbitalScienceUI={onMode(mode){active=mode;if(mode==='aom')drawAom();if(mode==='spectra')renderTS();if(mode==='database')renderDb();},selectRecord};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
