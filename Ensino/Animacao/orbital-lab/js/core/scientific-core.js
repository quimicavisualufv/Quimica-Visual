/* Orbital Lab 3.0 — scientific computational core, zero dependencies.
 * Provenance: see README.md. All AOM energies are one-electron
 * semi-empirical model values, NOT experimentally measured orbital energies.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitalScience=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const BASIS=['dxy','dyz','dz2','dxz','dx2y2'];
const check=(v,n)=>{if(!Number.isFinite(v))throw new RangeError(n+' precisa ser finito');return v;};
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=a=>Math.hypot(...a);
const unit=v=>{if(!Array.isArray(v)||v.length!==3||v.some(x=>!Number.isFinite(x)))throw new RangeError('Vetor inválido');const m=norm(v);if(m<1e-9)throw new RangeError('Direção nula');return v.map(x=>x/m);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const mat=n=>Array.from({length:n},()=>Array(n).fill(0));
const outer=(H,v,e)=>{for(let i=0;i<v.length;i++)for(let j=0;j<v.length;j++)H[i][j]+=e*v[i]*v[j];};
function frame(n){n=unit(n);let trial=Math.abs(n[2])<.85?[0,0,1]:[0,1,0];let t=unit(cross(trial,n)),u=unit(cross(n,t));return [n,t,u];}
// Orthonormal real spherical-harmonic l=2 basis ordered xy,yz,z2,xz,x2-y2.
// Sigma = Y_20 (rotated), pi vectors are normalized tangent derivatives.
function sigma(n){const [x,y,z]=unit(n);return [Math.sqrt(3)*x*y,Math.sqrt(3)*y*z,(3*z*z-1)/2,Math.sqrt(3)*x*z,Math.sqrt(3)/2*(x*x-y*y)];}
function pi(n,t){const [x,y,z]=unit(n),[a,b,c]=t;return [x*b+y*a,y*c+z*b,Math.sqrt(3)*z*c,x*c+z*a,x*a-y*b];}
function jacobi(H){if(!Array.isArray(H)||!H.length||H.length>20||H.some(r=>!Array.isArray(r)||r.length!==H.length||r.some(v=>!Number.isFinite(v))))throw new RangeError('Matriz quadrada finita esperada');for(let i=0;i<H.length;i++)for(let j=0;j<i;j++)if(Math.abs(H[i][j]-H[j][i])>1e-9)throw new RangeError('Matriz deve ser simétrica');const n=H.length,A=H.map(r=>r.slice()),U=mat(n);for(let i=0;i<n;i++)U[i][i]=1;
 for(let k=0;k<250;k++){
  let max=0,p=0,q=1;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(Math.abs(A[i][j])>max){max=Math.abs(A[i][j]);p=i;q=j;}
  if(max<1e-10)break;
  const angle=.5*Math.atan2(2*A[p][q],A[q][q]-A[p][p]);const c=Math.cos(angle),s=Math.sin(angle);
  const app=A[p][p],aqq=A[q][q],apq=A[p][q];A[p][p]=c*c*app-2*s*c*apq+s*s*aqq;A[q][q]=s*s*app+2*s*c*apq+c*c*aqq;A[p][q]=A[q][p]=0;
  for(let i=0;i<n;i++)if(i!==p&&i!==q){const aip=A[i][p],aiq=A[i][q];A[i][p]=A[p][i]=c*aip-s*aiq;A[i][q]=A[q][i]=s*aip+c*aiq;}
  for(let i=0;i<n;i++){const uip=U[i][p],uiq=U[i][q];U[i][p]=c*uip-s*uiq;U[i][q]=s*uip+c*uiq;}
 }
 return Array.from({length:n},(_,i)=>({value:A[i][i],vector:U.map(row=>row[i])})).sort((a,b)=>a.value-b.value);
}
function aom(ligands,eSigma,ePi,exponent=5,referenceDistance=2){
 check(eSigma,'eSigma');check(ePi,'ePi');check(exponent,'exponent');check(referenceDistance,'R0');if(exponent<=0||referenceDistance<=0)throw new RangeError('expoente/R0 inválidos');
 if(!Array.isArray(ligands)||ligands.length<1||ligands.length>100)throw new RangeError('1 a 100 ligantes');
 const H=mat(5);
 for(const ligand of ligands){const p=ligand.pos;if(!Array.isArray(p)||p.length!==3||p.some(x=>!Number.isFinite(x)))throw new RangeError('posição inválida');
  const r=norm(p);if(r<.05)throw new RangeError('distância metal–ligante inválida');const [n,t,u]=frame(p);
  const factor=check(ligand.factor??1,'fator do ligante');if(factor<0)throw new RangeError('Fator negativo');const weight=check(Math.pow(referenceDistance/r,exponent)*factor,'peso radial');
  outer(H,sigma(n),eSigma*weight);outer(H,pi(n,t),ePi*weight);outer(H,pi(n,u),ePi*weight);
 }
 if(H.some(row=>row.some(v=>!Number.isFinite(v))))throw new RangeError('Energia fora da faixa numérica');const solutions=jacobi(H),mean=solutions.reduce((a,x)=>a+x.value,0)/5;
 return {matrix:H,levels:solutions.map(s=>({...s,centered:s.value-mean,dominant:BASIS[s.vector.reduce((a,v,i)=>Math.abs(v)>Math.abs(s.vector[a])?i:a,0)],components:Object.fromEntries(BASIS.map((id,i)=>[id,s.vector[i]**2]))})),mean,span:solutions[4].value-solutions[0].value};
}
function octPositions(r=2){return [[r,0,0],[-r,0,0],[0,r,0],[0,-r,0],[0,0,r],[0,0,-r]].map(pos=>({pos}));}
function tetPositions(r=2){return [[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]].map(a=>({pos:unit(a).map(x=>x*r)}));}
function sqPositions(r=2){return octPositions(r).slice(0,4);}
const geometryPositions=(g,r=2)=>g==='tet'?tetPositions(r):g==='square'?sqPositions(r):octPositions(r);
// For ideal octahedron with six equivalent ligands: eg=3e_sigma, t2g=4e_pi.
function calibrateOctSigma(delta,ePi=0){check(delta,'Delta');check(ePi,'ePi');if(delta<=0)throw new RangeError('Delta deve ser positivo');return (delta+4*ePi)/3;}
function d8Transitions(delta,B){if(delta<0||B<=0||!Number.isFinite(delta)||!Number.isFinite(B))throw new RangeError('Delta>=0 e B>0');const disc=225*B*B+delta*delta-18*delta*B;const x=Math.sqrt(Math.max(0,disc));return {v1:delta,v2:7.5*B+1.5*delta-.5*x,v3:7.5*B+1.5*delta+.5*x};}
function tanabeNi(x){if(x<0||!Number.isFinite(x))throw new RangeError('Dq/B inválido');const v=d8Transitions(10*x,1);return {x,v1:v.v1,v2:v.v2,v3:v.v3};}
function fitNi(v2,v3){if(!Number.isFinite(v2)||!Number.isFinite(v3)||v2<=0||v3<=v2)throw new RangeError('Transições observadas inválidas');
 // search valid Dq/B range; ν3/ν2 is non-monotone at high field: fit both only locally.
 let best=null;for(let i=0;i<=12000;i++){const x=.3+i*2.7/12000,t=tanabeNi(x);const B=(v2*t.v2+v3*t.v3)/(t.v2*t.v2+t.v3*t.v3);const err=(v2-B*t.v2)**2+(v3-B*t.v3)**2;if(!best||err<best.error)best={x,B,delta:10*x*B,error:err,fit:d8Transitions(10*x*B,B)};}
 return best;
}
function gaussianSpectrum(bands,start=350,end=1250,step=2,width=24){
 if(!Array.isArray(bands)||[start,end,step,width].some(x=>!Number.isFinite(x))||step<=0||width<=0||end<start||(end-start)/step>100000)throw new RangeError('Faixa espectral inválida');
 for(const b of bands)if(!Number.isFinite(b.nm)||!Number.isFinite(b.intensity??1)||!Number.isFinite(b.width??width)||(b.width??width)<=0)throw new RangeError('Banda espectral inválida');
 const xs=[];for(let i=0;i<=Math.floor((end-start)/step);i++){const nm=start+i*step;let y=0;for(const b of bands){const w=b.width??width;y+=(b.intensity??1)*Math.exp(-.5*((nm-b.nm)/w)**2);}xs.push({nm,abs:y});}return xs;
}
// Minimum of EECC + P * pairs; Hund's rule resolves equal-energy states only.
function solveOccupancy(levels,count,pair=1,spin='auto'){
 if(!Array.isArray(levels)||levels.length!==5||levels.some(x=>!Number.isFinite(x))||!Number.isInteger(count)||count<0||count>10||!Number.isFinite(pair)||pair<0||!['auto','high','low'].includes(spin))throw new RangeError('Configuração eletrônica inválida');
 const minPairs=Math.max(0,count-5),maxPairs=Math.floor(count/2);let best=null;
 for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)for(let d=0;d<3;d++){const e=count-a-b-c-d;if(e<0||e>2)continue;const occ=[a,b,c,d,e],pairs=occ.filter(x=>x===2).length,unpaired=occ.filter(x=>x===1).length;
  if(spin==='high'&&pairs!==minPairs||spin==='low'&&pairs!==maxPairs)continue;
  const cfse=occ.reduce((sum,x,i)=>sum+x*levels[i],0),score=cfse+pairs*pair;
  if(!best||score<best.score-1e-9||Math.abs(score-best.score)<1e-9&&unpaired>best.unpaired)best={occ,cfse,pairs,unpaired,score};
 }return best;
}
// CSV reader shared by the interface and regression tests (quoted fields, decimal comma).
function parseSpectrumCSV(txt){
 if(typeof txt!=='string'||txt.length>3e6)throw new RangeError('CSV inválido ou maior que 3 MB');
 const lines=txt.replace(/^\uFEFF/,'').split(/\r\n|\n|\r/),points=[];let rejected=0,header=false;
 const split=(line,sep)=>{const fields=[];let field='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===sep&&!quoted){fields.push(field.trim());field='';}else field+=c;}if(quoted)throw new Error('Aspas não fechadas no CSV');fields.push(field.trim());return fields;};
 const sample=lines.find(l=>l.trim()&&!l.trim().startsWith('#'));if(!sample)throw new Error('CSV vazio');
 const sep=sample.includes(';')?';':sample.includes('\t')?'\t':',';
 for(const line of lines){if(!line.trim()||line.trim().startsWith('#'))continue;const p=split(line,sep);if(p.length!==2){rejected++;continue;}if(p.some(x=>!x.trim())){rejected++;continue;}
  const v=p.map(x=>Number(sep===','?x:x.replace(',','.')));
  if(v.some(x=>!Number.isFinite(x))){if(!header&&!points.length&&/wavelength|comprimento|absorb|lambda|onda/i.test(line)){header=true;continue;}rejected++;continue;}
  if(v[0]<=0||v[0]>1e6||Math.abs(v[1])>1e9){rejected++;continue;}points.push({nm:v[0],abs:v[1]});if(points.length>20000)throw new RangeError('CSV excede 20.000 pontos; reduza o arquivo');
 }
 points.sort((a,b)=>a.nm-b.nm);if(points.length<3||points[0].nm===points.at(-1).nm)throw new Error('CSV precisa de 3 pares numéricos e ao menos 2 comprimentos de onda distintos');
 return {points,rejected};
}
// Tokenize CIF1 whitespace, quotes, comments and semicolon text fields.
function cifTokens(text){
 text=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');const out=[];let i=0;
 while(i<text.length){if(/\s/.test(text[i])){i++;continue;}if(text[i]==='#'){while(i<text.length&&text[i]!=='\n')i++;continue;}
  if(text[i]===';'&&(i===0||text[i-1]==='\n')){const start=++i,end=text.indexOf('\n;',i);if(end<0)throw new Error('CIF: campo multilinha incompleto');out.push({v:text.slice(start,end),quoted:true});i=end+2;continue;}
  if(text[i]==="'"||text[i]==='"'){const quote=text[i++],start=i;while(i<text.length&&!(text[i]===quote&&(i+1===text.length||/\s/.test(text[i+1])))){if(text[i]==='\n')throw new Error('CIF: aspas incompletas');i++;}if(i===text.length)throw new Error('CIF: aspas incompletas');out.push({v:text.slice(start,i++),quoted:true});continue;}
  const start=i;while(i<text.length&&!/\s/.test(text[i])&&text[i]!=='#')i++;out.push({v:text.slice(start,i),quoted:false});
 }return out;
}
function getFieldFromCIF(text){
 if(typeof text!=='string'||text.length>5e6)throw new RangeError('CIF inválido ou grande demais');
 if(/^#\\#CIF_2/m.test(text))throw new Error('CIF 2.0 não suportado; exporte como CIF 1.1.');
 const tokens=cifTokens(text),fields={},loops=[];let blocks=0;
 const reserved=t=>t&&!t.quoted&&(/^_|^data_|^save_|^loop_$|^stop_$|^global_$/i.test(t.v));
 for(let i=0;i<tokens.length;){const tok=tokens[i],key=tok.v.toLowerCase();
  if(!tok.quoted&&key.startsWith('data_')){if(++blocks>1)throw new Error('CIF contém múltiplos blocos; exporte apenas a estrutura desejada.');i++;continue;}
  if(!tok.quoted&&key.startsWith('save_'))throw new Error('Save frames CIF não suportados neste leitor.');
  if(!tok.quoted&&key==='loop_'){i++;const cols=[];while(i<tokens.length&&!tokens[i].quoted&&tokens[i].v.startsWith('_'))cols.push(tokens[i++].v.toLowerCase());if(!cols.length)throw new Error('CIF: loop sem colunas');const data=[];while(i<tokens.length&&!reserved(tokens[i]))data.push(tokens[i++].v);if(data.length%cols.length)throw new Error('CIF: linha de loop incompleta');loops.push({cols,data});if(tokens[i]?.v.toLowerCase()==='stop_')i++;continue;}
  if(!tok.quoted&&key.startsWith('_')){if(!tokens[i+1]||reserved(tokens[i+1]))throw new Error('CIF: campo sem valor '+key);fields[key]=tokens[i+1].v;i+=2;continue;}i++;
 }
 const num=v=>{const clean=String(v??'').replace(/\(\d+\)/,'');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(clean)?Number(clean):NaN;};
 const a=num(fields._cell_length_a),b=num(fields._cell_length_b),c=num(fields._cell_length_c),alpha=num(fields._cell_angle_alpha),beta=num(fields._cell_angle_beta),gamma=num(fields._cell_angle_gamma);
 if([a,b,c].some(x=>!Number.isFinite(x)||x<=0)||[alpha,beta,gamma].some(x=>!Number.isFinite(x)||x<=0||x>=180))throw new Error('CIF sem parâmetros de célula válidos.');
 const deg=x=>x*Math.PI/180,al=deg(alpha),be=deg(beta),ga=deg(gamma),ca=[a,0,0],cb=[b*Math.cos(ga),b*Math.sin(ga),0],cx=c*Math.cos(be),cy=c*(Math.cos(al)-Math.cos(be)*Math.cos(ga))/Math.sin(ga),volume2=c*c-cx*cx-cy*cy;
 if(!Number.isFinite(volume2)||volume2<=c*c*1e-12)throw new Error('CIF: célula degenerada ou ângulos geometricamente incompatíveis.');
 const cc=[cx,cy,Math.sqrt(volume2)],basis=[ca,cb,cc],xyz=f=>ca.map((_,i)=>f.reduce((v,x,j)=>v+x*basis[j][i],0)),atoms=[];
 let skipped=0;
 for(const {cols,data} of loops){const ix=cols.indexOf('_atom_site_fract_x'),iy=cols.indexOf('_atom_site_fract_y'),iz=cols.indexOf('_atom_site_fract_z');if(ix<0||iy<0||iz<0)continue;const it=cols.indexOf('_atom_site_type_symbol'),il=cols.indexOf('_atom_site_label'),io=cols.indexOf('_atom_site_occupancy');
  for(let k=0;k<data.length;k+=cols.length){const row=data.slice(k,k+cols.length),raw=it>=0?row[it]:row[il],element=String(raw??'').match(/^[A-Z][a-z]?/i)?.[0]||'',el=element.charAt(0).toUpperCase()+element.slice(1).toLowerCase(),f=[row[ix],row[iy],row[iz]].map(num),occupancy=io>=0?num(row[io]):1;
   if(!el||!f.every(Number.isFinite)||occupancy===0){skipped++;continue;}
   if(atoms.length>=10000)throw new Error('CIF excede 10.000 sítios; use um recorte da estrutura.');atoms.push({label:il>=0?row[il]:el,element:el,fract:f,xyz:xyz(f),occupancy});
  }
 }
 if(!atoms.length)throw new Error('Não encontrei atom_site com coordenadas fracionárias válidas.');
 return {cell:{a,b,c,alpha,beta,gamma},atoms,basis,warning:'Somente sítios explícitos. NÃO foram aplicadas operações de simetria do CIF; a esfera de coordenação pode estar incompleta. Ocupações parciais e desordem não são expandidas.'+(skipped?' Sítios vazios/inválidos omitidos: '+skipped+'.':'')};
}
function ligandShell(cif,metalIndex,limit=6,maxDistance=3.1){
 if(!Number.isInteger(limit)||limit<1||limit>100||!Number.isFinite(maxDistance)||maxDistance<=1.2)throw new RangeError('Vizinhança inválida');const metal=cif.atoms[metalIndex];if(!metal)throw new Error('Centro metálico não encontrado.');
 const donors=new Set(['O','N','S','F','Cl','Br','I','P','C']),[a,b,c]=cif.basis,volume=dot(a,cross(b,c));if(!Number.isFinite(volume)||Math.abs(volume)<1e-9)throw new Error('Célula cristalográfica degenerada');
 const reciprocal=[cross(b,c),cross(c,a),cross(a,b)].map(v=>v.map(x=>x/volume)),bounds=reciprocal.map(v=>norm(v)*maxDistance),distances=[];let tested=0;
 for(let i=0;i<cif.atoms.length;i++)if(i!==metalIndex&&donors.has(cif.atoms[i].element)){
  const atom=cif.atoms[i],diff=atom.fract.map((x,k)=>x-metal.fract[k]),ranges=diff.map((x,k)=>[Math.ceil(-x-bounds[k]-1e-10),Math.floor(-x+bounds[k]+1e-10)]);
  for(let u=ranges[0][0];u<=ranges[0][1];u++)for(let v=ranges[1][0];v<=ranges[1][1];v++)for(let w=ranges[2][0];w<=ranges[2][1];w++){
   if(++tested>500000)throw new Error('Muitas imagens periódicas; importe uma célula menos oblíqua ou um recorte da estrutura.');
   const image=[u,v,w],d=diff.map((x,k)=>x+image[k]),pos=a.map((_,k)=>d[0]*a[k]+d[1]*b[k]+d[2]*c[k]),r=norm(pos);if(r>1.2&&r<=maxDistance)distances.push({label:atom.label,element:atom.element,pos,r,image});
  }
 }
 distances.sort((a,b)=>a.r-b.r);const unique=[];for(const d of distances)if(!unique.some(x=>norm(x.pos.map((v,i)=>v-d.pos[i]))<1e-5)){unique.push(d);if(unique.length===limit)break;}return unique;
}
return {solveOccupancy,parseSpectrumCSV,BASIS,sigma,pi,frame,aom,jacobi,octPositions,tetPositions,sqPositions,geometryPositions,calibrateOctSigma,d8Transitions,tanabeNi,fitNi,gaussianSpectrum,getFieldFromCIF,ligandShell};
});
