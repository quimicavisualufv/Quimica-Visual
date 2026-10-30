/* Orbital Lab 3.3 — independent teaching models; dimensionless parameters, not measurements. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./scientific-core.js'):root.OrbitalScience);if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitalTeachingCore=api;})(typeof window!=='undefined'?window:globalThis,function(S){
'use strict';
const LIGANDS=[
 {id:'i',symbol:'I⁻',name:'iodeto',factor:.43,field:'mais fraco',color:[.91,.68,.49],charge:-1},
 {id:'br',symbol:'Br⁻',name:'brometo',factor:.50,field:'mais fraco',color:[.89,.70,.53],charge:-1},
 {id:'cl',symbol:'Cl⁻',name:'cloreto',factor:.57,field:'mais fraco',color:[.98,.73,.42],charge:-1},
 {id:'f',symbol:'F⁻',name:'fluoreto',factor:.70,field:'mais fraco',color:[.92,.79,.53],charge:-1},
 {id:'water',symbol:'H₂O',name:'água',factor:1,field:'intermediário / fraco',color:[.46,.70,1],charge:0},
 {id:'ammonia',symbol:'NH₃',name:'amônia',factor:1.33,field:'mais forte que H₂O',color:[.55,.89,.72],charge:0},
 {id:'en',symbol:'en',name:'etilenodiamina',factor:1.55,field:'mais forte',color:[.59,.89,.82],charge:0,denticity:2},
 {id:'cn',symbol:'CN⁻',name:'cianeto (ligação via C)',factor:2.12,field:'forte',color:[.73,.59,1],charge:-1},
 {id:'co',symbol:'CO',name:'monóxido de carbono',factor:2.45,field:'forte',color:[.91,.59,.86],charge:0}
];
const ligand=id=>{const l=LIGANDS.find(x=>x.id===id);if(!l)throw new RangeError('Ligante desconhecido');return l;};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function number(v,name,min,max){if(!Number.isFinite(v)||v<min||v>max)throw new RangeError(name+' inválido');return v;}
function mixedField({from='water',to='cn',count=0,d=6,pair=1.1,geometry='oct',progress=1}={}){
 const a=ligand(from),b=ligand(to),positions=S.geometryPositions(geometry,2),size=positions.length;
 number(count,'Número de trocas',0,size);if(!Number.isInteger(count))throw new RangeError('Número inteiro de trocas esperado');number(progress,'Progresso',0,1);number(pair,'Pareamento',.01,10);
 const nodes=positions.map((l,i)=>({...l,ligand:i<count?b:a,factor:(i<count?b.factor:a.factor)*progress}));
 const model=S.aom(nodes,1/3,0,5,2),levels=model.levels.map(l=>l.centered),occupation=S.solveOccupancy(levels,d,pair,'auto');
 return {nodes,model,occupation,levels,count,size,delta:model.span,unpaired:occupation.unpaired,moment:Math.sqrt(occupation.unpaired*(occupation.unpaired+2)),homoleptic:count===0||count===size||from===to};
}
function fieldPath(options){return Array.from({length:7},(_,count)=>{const r=mixedField({...options,count});return {count,span:r.delta,levels:r.levels,unpaired:r.unpaired};});}
// Association/dissociation are cartoons. Progress is a reaction coordinate, not time.
function substitution({mechanism='D',progress=0,from='water',to='ammonia'}={}){
 number(progress,'Progresso',0,1);if(!['D','A','I'].includes(mechanism))throw new RangeError('Mecanismo inválido');const a=ligand(from),b=ligand(to);if(a.denticity===2||b.denticity===2)throw new RangeError('Use ligantes monodentados nesta animação de um sítio');
 const smooth=t=>{const x=clamp(t,0,1);return x*x*(3-2*x)};const p=progress,leaving=mechanism==='D'?smooth(p/.35):mechanism==='A'?smooth((p-.65)/.35):smooth(p),entering=mechanism==='D'?smooth((p-.65)/.35):mechanism==='A'?smooth(p/.35):smooth(p);
 const nodes=S.octPositions().slice(1).map(l=>({...l,ligand:a,bond:1}));
 const old={pos:[2+2.5*leaving,0,0],ligand:a,bond:1-leaving,leaving:true};
 // Incoming donor approaches between axes in A, allowing an illustrative seven-coordinate intermediate.
 const blend=smooth((p-.65)/.35);const incoming=mechanism==='A'?(p<.65?[0,2+1.8*(1-entering),1.2]:[2*blend,2*(1-blend),1.2*(1-blend)]):[2+1.8*(1-entering),-2.4*(1-entering),1.4*(1-entering)];
 const fresh={pos:incoming,ligand:b,bond:entering,incoming:true};nodes.push(old,fresh);
 const stage=p===0?'Complexo inicial':p===1?'Produto da substituição':p<.35?(mechanism==='D'?'Saída do ligante X':mechanism==='A'?'Entrada do ligante Y':'Troca com ligações parciais'):p<=.65?(mechanism==='D'?'Intermediário de coordenação 5':mechanism==='A'?'Intermediário de coordenação 7':'Troca sem intermediário isolável'):(mechanism==='D'?'Entrada do ligante Y':mechanism==='A'?'Saída do ligante X':'Troca com ligações parciais');
 const coordination=p===0||p===1?'6':mechanism==='I'?'6 → 6':p>=.35&&p<=.65?(mechanism==='D'?'5':'7'):'em mudança';
 return {nodes,stage,coordination,leaving,entering,mechanism};
}
function kinetics({law='D',concentration=.5,rate=.5,time=10}={}){
 if(!['D','A','I'].includes(law))throw new RangeError('Lei inválida');number(concentration,'Concentração',0,10);number(rate,'Constante',.001,10);number(time,'Tempo',0,1000);
 const k=law==='A'?rate*concentration:rate,reactant=Math.exp(-k*time),product=1-reactant;
 return {k,reactant,product,halfLife:k===0?Infinity:Math.LN2/k,points:Array.from({length:101},(_,i)=>{const t=i*.1,r=Math.exp(-k*t);return {time:t,reactant:r,product:1-r};})};
}
return {LIGANDS,ligand,mixedField,fieldPath,substitution,kinetics};
});
