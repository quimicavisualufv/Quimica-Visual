/* Funções físicas isoladas; sem dependências. Funcionam no navegador e em Node.js. */
(function(root){
  'use strict';
  const KJ_PER_MOL_PER_WAVENUMBER = 0.0119626565638697;
  function requireNonnegative(x,name){if(!Number.isFinite(x)||x<0)throw new RangeError(name+' deve ser finito e não negativo');}
  function nmFromWavenumber(cm1){requireNonnegative(cm1,'cm1');if(cm1===0)throw new RangeError('cm1 deve ser >0');return 1e7/cm1;}
  function energyKJmol(cm1){requireNonnegative(cm1,'cm1');return cm1*KJ_PER_MOL_PER_WAVENUMBER;}
  function octaCFSE(nT2g,nEg,delta){
    requireNonnegative(nT2g,'nT2g');requireNonnegative(nEg,'nEg');requireNonnegative(delta,'delta');
    if(nT2g>6||nEg>4||!Number.isInteger(nT2g)||!Number.isInteger(nEg))throw new RangeError('Ocupação octaédrica inválida');
    return (-0.4*nT2g+0.6*nEg)*delta; // cm^-1 se delta em cm^-1, sem energia de pareamento.
  }
  function tetraCFSE(nE,nT2,delta){
    requireNonnegative(nE,'nE');requireNonnegative(nT2,'nT2');requireNonnegative(delta,'delta');
    if(nE>4||nT2>6||!Number.isInteger(nE)||!Number.isInteger(nT2))throw new RangeError('Ocupação tetraédrica inválida');
    return (-0.6*nE+0.4*nT2)*delta;
  }
  function spinOnlyMoment(n){requireNonnegative(n,'n');if(!Number.isInteger(n)||n>5)throw new RangeError('Número inválido de elétrons desemparelhados');return Math.sqrt(n*(n+2));} // em μB, estimativa ideal
  function pointChargeDistanceDelta(delta0,r0,r,exponent=5){
    requireNonnegative(delta0,'delta0');requireNonnegative(r0,'r0');requireNonnegative(r,'r');
    if(!r0||!r||!Number.isFinite(exponent)||exponent<=0)throw new RangeError('Distâncias/ expoente inválidos');
    return delta0*Math.pow(r0/r,exponent); // SOMENTE modelo fenomenológico ancorado, não previsão experimental
  }
  const api={KJ_PER_MOL_PER_WAVENUMBER,nmFromWavenumber,energyKJmol,octaCFSE,tetraCFSE,spinOnlyMoment,pointChargeDistanceDelta};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.OrbitalLabScientificEquations=api;
})(typeof window!=='undefined'?window:globalThis);
