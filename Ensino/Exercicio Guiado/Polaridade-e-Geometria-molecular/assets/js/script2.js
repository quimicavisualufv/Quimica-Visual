(function(){
  function onReady(fn){
    if(window.__geomTutorialAPI) return fn(window.__geomTutorialAPI);
    window.addEventListener('geom-api-ready', function(){ fn(window.__geomTutorialAPI); }, {once:true});
    setTimeout(function(){ if(window.__geomTutorialAPI) fn(window.__geomTutorialAPI); }, 80);
  }

  function esc(s){ return String(s==null?'':s).replace(/[&<>\"]/g,function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]; }); }
  function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms||0); }); }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function round(n,d){ var p=Math.pow(10,d||2); return Math.round(n*p)/p; }
  function v(x,y,z){ return [x,y,z]; }
  function vAdd(a,b){ return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]; }
  function vSub(a,b){ return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]; }
  function vMul(a,s){ return [a[0]*s,a[1]*s,a[2]*s]; }
  function vDot(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
  function vCross(a,b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function vLen(a){ return Math.hypot(a[0],a[1],a[2]); }
  function vNorm(a){ var L=vLen(a)||1; return [a[0]/L,a[1]/L,a[2]/L]; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function ease(t){ return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

  function geomPositions(type){
    
    var DEG = Math.PI/180;
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
        var a=16*DEG, b=52.25*DEG;
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

  var exampleCatalog = {
    H2O: { key:'H2O', label:'H₂O', geom:'bent_tet', center:'O', ligands:['H','H'], centerColor:'#d84040', ligandColor:'#f5f7ff', lpColor:'#1100ff', sign:-1, muBond:1.5, delta:'O é mais eletronegativo que H; cada ligação O-H tem dipolo apontando para O.', view:{camDist:4.65, rotX:0.43, rotY:-0.95, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Geometria angular + dipolos que não se cancelam ⇒ molécula polar.', densityBias:1.0 },
    NH3: { key:'NH3', label:'NH₃', geom:'trigonal_pyramidal', center:'N', ligands:['H','H','H'], centerColor:'#4d7cff', ligandColor:'#f5f7ff', lpColor:'#1100ff', sign:-1, muBond:1.25, delta:'N é mais eletronegativo que H; os dipolos N-H apontam para o N.', view:{camDist:4.9, rotX:0.36, rotY:-0.85, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'A pirâmide trigonal e o par livre ajudam a gerar resultante não nula.', densityBias:0.8 },
    CO2: { key:'CO2', label:'CO₂', geom:'linear', center:'C', ligands:['O','O'], centerColor:'#3c3f45', ligandColor:'#d84040', lpColor:'#1100ff', sign:+1, muBond:1.8, delta:'Cada C=O é polar (dipolo aponta para O), mas a geometria linear cancela os vetores.', view:{camDist:4.15, rotX:0.10, rotY:0.06, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Ligação polar não garante molécula polar: a simetria pode cancelar.', densityBias:0.0 },
    BF3: { key:'BF3', label:'BF₃', geom:'trigonal_planar', center:'B', ligands:['F','F','F'], centerColor:'#e39b3c', ligandColor:'#6fd68c', lpColor:'#1100ff', sign:+1, muBond:1.4, delta:'B-F é bem polar, mas os três vetores a 120° se cancelam no plano.', view:{camDist:4.65, rotX:0.07, rotY:0.05, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Exemplo clássico de molécula apolar com ligações polares.', densityBias:0.0 },
    SO2: { key:'SO2', label:'SO₂', geom:'bent_tp', center:'S', ligands:['O','O'], centerColor:'#f0bf4a', ligandColor:'#d84040', lpColor:'#1100ff', sign:+1, muBond:1.55, delta:'O é mais eletronegativo que S; como a geometria é angular, a soma não zera.', view:{camDist:4.65, rotX:0.22, rotY:-0.35, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Ótimo para comparar com CO₂: ambos têm 2 oxigênios, mas geometrias diferentes.', densityBias:0.9 },
    CH4: { key:'CH4', label:'CH₄', geom:'tetrahedral', center:'C', ligands:['H','H','H','H'], centerColor:'#2f343a', ligandColor:'#f5f7ff', lpColor:'#1100ff', sign:+1, muBond:0.35, delta:'C-H é fracamente polar; na tetraédrica os vetores se cancelam quase totalmente.', view:{camDist:5.2, rotX:0.36, rotY:-0.75, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Na prática, CH₄ é tratado como apolar.', densityBias:0.0 },
    CCl4: { key:'CCl4', label:'CCl₄', geom:'tetrahedral', center:'C', ligands:['Cl','Cl','Cl','Cl'], centerColor:'#2f343a', ligandColor:'#7bde64', lpColor:'#1100ff', sign:+1, muBond:1.5, delta:'Cada C-Cl é polar, mas a simetria tetraédrica cancela a resultante.', view:{camDist:5.2, rotX:0.36, rotY:-0.75, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Simetria perfeita = cancelamento vetorial.', densityBias:0.0 },
    BeCl2: { key:'BeCl2', label:'BeCl₂', geom:'linear', center:'Be', ligands:['Cl','Cl'], centerColor:'#b5b9c1', ligandColor:'#7bde64', lpColor:'#1100ff', sign:+1, muBond:1.55, delta:'Ligação polar + arranjo linear simétrico ⇒ resultante nula.', view:{camDist:4.2, rotX:0.12, rotY:0.02, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}, note:'Linear simétrica é campeã de cancelamento.', densityBias:0.0 }
  };

  var __familyLabels = {"linear":"Linear (AX2)","bent_tp":"Angular (AX2E)","bent_tet":"Angular (AX2E2)","trigonal_planar":"Trigonal planar (AX3)","tetrahedral":"Tetraédrica (AX4)","trigonal_pyramidal":"Piramidal trigonal (AX3E)","trigonal_bipyramidal":"Bipirâmide trigonal (AX5)","see_saw":"Gangorra (AX4E)","t_shaped":"Em T (AX3E2)","linear_tbp":"Linear (AX2E3)","square_pyramidal":"Piramidal quadrada (AX5E)","square_planar":"Quadrada planar (AX4E2)","octahedral":"Octaédrica (AX6)"};
  var __defaultViewsByGeom = {"linear":{"camDist":4.2,"rotX":0.12,"rotY":0.02,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0},"bent_tp":{"camDist":4.65,"rotX":0.22,"rotY":-0.35,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0},"bent_tet":{"camDist":4.65,"rotX":0.43,"rotY":-0.95,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0},"trigonal_planar":{"camDist":4.65,"rotX":0.07,"rotY":0.05,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0},"tetrahedral":{"camDist":5.2,"rotX":0.36,"rotY":-0.75,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0},"trigonal_pyramidal":{"camDist":4.9,"rotX":0.36,"rotY":-0.85,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0},"trigonal_bipyramidal":{"camDist":5.55,"rotX":0.32,"rotY":-0.64,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0},"see_saw":{"camDist":5.25,"rotX":0.28,"rotY":-0.62,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0},"t_shaped":{"camDist":4.95,"rotX":0.18,"rotY":-0.52,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0},"linear_tbp":{"camDist":4.3,"rotX":0.18,"rotY":-0.18,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0},"square_pyramidal":{"camDist":5.35,"rotX":0.34,"rotY":-0.68,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0},"square_planar":{"camDist":5.05,"rotX":0.12,"rotY":-0.34,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0},"octahedral":{"camDist":5.65,"rotX":0.28,"rotY":-0.62,"objRotXDeg":0,"objRotYDeg":0,"objRotZDeg":0}};
  var __elementPalette = {
    H:'#f5f7ff', C:'#3c3f45', N:'#4d7cff', O:'#d84040', F:'#6fd68c', Cl:'#7bde64', Br:'#c98f41', I:'#9c78d7',
    P:'#e39b3c', S:'#f0bf4a', Se:'#d8a85a', Te:'#b99972', B:'#e39b3c', Be:'#b5b9c1', Al:'#c0c6d4', Ga:'#7a90c4',
    Ge:'#8ca1bb', Sn:'#aeb8c8', Sb:'#b7a07a', Xe:'#6eb2ff', Kr:'#95b9ff', Hg:'#c8d0da', Ta:'#8da0bc', Pt:'#cfd6de',
    Pd:'#d8dde5', Au:'#f2cf63', Ni:'#86b2a1', Ti:'#95aacc', Zr:'#99b0d0', Mo:'#a8b2c7', W:'#aab3c3', U:'#79d07a', As:'#9ea9bf',
    Co:'#6b7fb6', Cr:'#8aa2c6', CN:'#8ce2df', NH3:'#d7c0ff'
  };
  function __colorForElement(sym){
    var key = String(sym||'').replace(/[^A-Za-z]/g,'');
    return __elementPalette[key] || '#8fd6ff';
  }
  function __defaultDeltaText(center, ligands, signs){
    var firstLig = (ligands && ligands[0]) ? ligands[0] : 'X';
    var dirs = (signs||[]).map(function(s){ return s < 0 ? -1 : 1; });
    var hasPos = dirs.some(function(s){ return s > 0; });
    var hasNeg = dirs.some(function(s){ return s < 0; });
    var uniqueLigands = {};
    (ligands||[]).forEach(function(l){ uniqueLigands[String(l)] = true; });
    var mixedLigands = Object.keys(uniqueLigands).length > 1;
    if(hasPos && hasNeg){
      return 'Há ligações cujos dipolos apontam para o átomo central ' + center + ' e outras que apontam para ligantes mais eletronegativos; a conclusão depende da soma vetorial na geometria 3D.';
    }
    if(mixedLigands){
      return hasPos
        ? ('Os vetores de ligação partem do átomo central ' + center + ' para ligantes diferentes; como os módulos dos dipolos não precisam ser iguais, a soma vetorial deve ser analisada no espaço.')
        : ('Os vetores de ligação partem de ligantes diferentes em direção ao átomo central ' + center + '; a conclusão depende da soma vetorial no arranjo 3D.');
    }
    var sign = dirs[0] || 1;
    return sign > 0
      ? ('Os vetores de ligação apontam do átomo central ' + center + ' para os ligantes ' + firstLig + '.')
      : ('Os vetores de ligação apontam dos ligantes ' + firstLig + ' para o átomo central ' + center + '.');
  }
  function __buildPracticeCatalog(rows){
    var out = {};
    (rows||[]).forEach(function(row, idx){
      var ligands = (row.ligands||[]).slice();
      var signs = row.ligandSigns ? row.ligandSigns.slice() : ligands.map(function(){ return row.sign != null ? (row.sign < 0 ? -1 : 1) : 1; });
      var muArr = row.ligandMu ? row.ligandMu.slice() : ligands.map(function(){ return row.muBond != null ? row.muBond : 1.35; });
      out[row.key] = {
        key: row.key,
        label: row.label,
        geom: row.geom,
        center: row.center,
        ligands: ligands,
        sign: row.sign != null ? (row.sign < 0 ? -1 : 1) : 1,
        ligandSigns: signs,
        ligandMu: muArr,
        muBond: row.muBond != null ? row.muBond : 1.35,
        centerColor: row.centerColor || __colorForElement(row.center),
        ligandColor: row.ligandColor || __colorForElement(ligands[0] || 'X'),
        lpColor: row.lpColor || '#1100ff',
        delta: row.delta || __defaultDeltaText(row.center, ligands, signs),
        note: row.note || 'Exercício 3D do banco de polaridade molecular.',
        view: row.view || __defaultViewsByGeom[row.geom] || __defaultViewsByGeom.tetrahedral,
        densityBias: row.densityBias != null ? row.densityBias : (signs[0] < 0 ? 0.72 : 0.28),
        bank: true,
        bankFamily: row.geom,
        bankIndex: idx
      };
    });
    return out;
  }
  Object.keys(exampleCatalog).forEach(function(k){
    var ex = exampleCatalog[k];
    if(!ex) return;
    ex.bank = true;
    ex.bankFamily = ex.bankFamily || ex.geom;
    ex.bankIndex = ex.bankIndex != null ? ex.bankIndex : 1000;
    ex.familyLabel = __familyLabels[ex.bankFamily] || ex.bankFamily;
    if(!ex.view) ex.view = __defaultViewsByGeom[ex.geom] || __defaultViewsByGeom.tetrahedral;
    if(!ex.ligandSigns) ex.ligandSigns = (ex.ligands||[]).map(function(){ return ex.sign != null ? (ex.sign < 0 ? -1 : 1) : 1; });
    if(!ex.ligandMu) ex.ligandMu = (ex.ligands||[]).map(function(){ return ex.muBond != null ? ex.muBond : 1.35; });
  });
  var __practiceRows = [{"key":"CO2","label":"CO₂","geom":"linear","center":"C","ligands":["O","O"],"sign":1},{"key":"OCS","label":"OCS","geom":"linear","center":"C","ligands":["O","S"],"ligandSigns":[1,1],"ligandMu":[1.8,0.95],"delta":"Em O=C=S, ambos os dipolos saem de C, mas C=O é mais intenso que C=S; por isso μR ≠ 0.","densityBias":0.75},{"key":"BeF2","label":"BeF₂","geom":"linear","center":"Be","ligands":["F","F"],"sign":1},{"key":"BeCl2","label":"BeCl₂","geom":"linear","center":"Be","ligands":["Cl","Cl"],"sign":1},{"key":"HCN","label":"HCN","geom":"linear","center":"C","ligands":["H","N"],"ligandSigns":[-1,1],"ligandMu":[0.35,1.55],"delta":"Em H-C≡N, o dipolo C-H aponta para C e o dipolo C≡N aponta para N. Como os módulos são diferentes, a molécula é polar.","densityBias":0.82},{"key":"FCN","label":"FCN","geom":"linear","center":"C","ligands":["F","N"],"ligandSigns":[1,1],"ligandMu":[1.7,1.55],"delta":"Em F-C≡N, os dois dipolos saem de C, mas não têm exatamente o mesmo módulo; a resultante é diferente de zero.","densityBias":0.86},{"key":"ClCN","label":"ClCN","geom":"linear","center":"C","ligands":["Cl","N"],"ligandSigns":[1,1],"ligandMu":[0.8,1.55],"delta":"Em Cl-C≡N, os dipolos apontam para Cl e para N. Como os ligantes são diferentes, a soma vetorial na linear não zera.","densityBias":0.82},{"key":"HgBr2","label":"HgBr₂","geom":"linear","center":"Hg","ligands":["Br","Br"],"sign":1},{"key":"H2O","label":"H₂O","geom":"bent_tet","center":"O","ligands":["H","H"],"sign":-1},{"key":"H2S","label":"H₂S","geom":"bent_tet","center":"S","ligands":["H","H"],"sign":-1},{"key":"HOF","label":"HOF","geom":"bent_tet","center":"O","ligands":["H","F"],"ligandSigns":[-1,1],"ligandMu":[1.4,1.2],"delta":"Na ligação O-H, o dipolo aponta para O; na ligação O-F, aponta para F. A geometria angular impede cancelamento.","densityBias":0.92},{"key":"OF2","label":"OF₂","geom":"bent_tet","center":"O","ligands":["F","F"],"sign":1},{"key":"HOCl","label":"HOCl","geom":"bent_tet","center":"O","ligands":["H","Cl"],"ligandSigns":[-1,-1],"ligandMu":[1.4,0.35],"delta":"Em H-O-Cl, os dois dipolos apontam para O, mas com módulos diferentes. Como a molécula é angular, μR ≠ 0.","densityBias":0.88},{"key":"SO2","label":"SO₂","geom":"bent_tp","center":"S","ligands":["O","O"],"sign":1},{"key":"NOCl","label":"NOCl","geom":"bent_tp","center":"N","ligands":["O","Cl"],"ligandSigns":[1,1],"ligandMu":[1.5,0.25],"delta":"Em NOCl, os dipolos N=O e N-Cl apontam para os ligantes e não se cancelam por causa da geometria angular.","densityBias":0.86},{"key":"NO2m","label":"NO₂⁻","geom":"bent_tp","center":"N","ligands":["O","O"],"sign":1},{"key":"BF3","label":"BF₃","geom":"trigonal_planar","center":"B","ligands":["F","F","F"],"sign":1},{"key":"CH2O","label":"CH₂O","geom":"trigonal_planar","center":"C","ligands":["O","H","H"],"ligandSigns":[1,-1,-1],"ligandMu":[1.8,0.35,0.35],"delta":"Em CH₂O, o dipolo C=O aponta para O e os dipolos C-H apontam para C. A soma no plano resulta em μR ≠ 0.","densityBias":0.78},{"key":"BBr3","label":"BBr₃","geom":"trigonal_planar","center":"B","ligands":["Br","Br","Br"],"sign":1},{"key":"COCl2","label":"COCl₂","geom":"trigonal_planar","center":"C","ligands":["O","Cl","Cl"],"ligandSigns":[1,1,1],"ligandMu":[1.8,0.75,0.75],"delta":"Em COCl₂, os três dipolos saem de C, mas C=O é mais intenso que C-Cl; por isso a resultante não zera.","densityBias":0.76},{"key":"SO3","label":"SO₃","geom":"trigonal_planar","center":"S","ligands":["O","O","O"],"sign":1},{"key":"COF2","label":"COF₂","geom":"trigonal_planar","center":"C","ligands":["O","F","F"],"ligandSigns":[1,1,1],"ligandMu":[1.8,1.3,1.3],"delta":"Em COF₂, os dipolos C-F e C=O não se cancelam completamente no plano trigonal, logo a molécula é polar.","densityBias":0.82},{"key":"AlBr3","label":"AlBr₃","geom":"trigonal_planar","center":"Al","ligands":["Br","Br","Br"],"sign":1},{"key":"GaCl3","label":"GaCl₃","geom":"trigonal_planar","center":"Ga","ligands":["Cl","Cl","Cl"],"sign":1},{"key":"NO3m","label":"NO₃⁻","geom":"trigonal_planar","center":"N","ligands":["O","O","O"],"sign":1},{"key":"CO3mm","label":"CO₃²⁻","geom":"trigonal_planar","center":"C","ligands":["O","O","O"],"sign":1},{"key":"CH4","label":"CH₄","geom":"tetrahedral","center":"C","ligands":["H","H","H","H"],"sign":-1},{"key":"CH3F","label":"CH₃F","geom":"tetrahedral","center":"C","ligands":["H","H","H","F"],"ligandSigns":[-1,-1,-1,1],"ligandMu":[0.35,0.35,0.35,1.7],"delta":"Em CH₃F, o dipolo C-F domina a soma vetorial tetraédrica; por isso μR ≠ 0.","densityBias":0.82},{"key":"CH3Cl","label":"CH₃Cl","geom":"tetrahedral","center":"C","ligands":["H","H","H","Cl"],"ligandSigns":[-1,-1,-1,1],"ligandMu":[0.35,0.35,0.35,0.75],"delta":"Em CH₃Cl, as três ligações C-H não compensam a ligação C-Cl. A resultante dipolar é não nula.","densityBias":0.8},{"key":"CH2F2","label":"CH₂F₂","geom":"tetrahedral","center":"C","ligands":["H","H","F","F"],"ligandSigns":[-1,-1,1,1],"ligandMu":[0.35,0.35,1.7,1.7],"delta":"Em CH₂F₂, a tetraédrica com dois H e dois F não é simétrica o bastante para anular todos os dipolos.","densityBias":0.84},{"key":"CH2Cl2","label":"CH₂Cl₂","geom":"tetrahedral","center":"C","ligands":["H","H","Cl","Cl"],"ligandSigns":[-1,-1,1,1],"ligandMu":[0.35,0.35,0.75,0.75],"delta":"Em CH₂Cl₂, a distribuição tetraédrica de H e Cl produz μR ≠ 0.","densityBias":0.8},{"key":"CHCl3","label":"CHCl₃","geom":"tetrahedral","center":"C","ligands":["H","Cl","Cl","Cl"],"ligandSigns":[-1,1,1,1],"ligandMu":[0.35,0.75,0.75,0.75],"delta":"Em CHCl₃, os três dipolos C-Cl não são cancelados pela única ligação C-H; a molécula é polar.","densityBias":0.83},{"key":"CHF3","label":"CHF₃","geom":"tetrahedral","center":"C","ligands":["H","F","F","F"],"ligandSigns":[-1,1,1,1],"ligandMu":[0.35,1.7,1.7,1.7],"delta":"Em CHF₃, as três ligações C-F geram uma resultante forte e a molécula é polar.","densityBias":0.88},{"key":"CH2Br2","label":"CH₂Br₂","geom":"tetrahedral","center":"C","ligands":["H","H","Br","Br"],"ligandSigns":[-1,-1,1,1],"ligandMu":[0.35,0.35,0.55,0.55],"delta":"Em CH₂Br₂, a combinação de dois H e dois Br na tetraédrica leva a μR ≠ 0.","densityBias":0.78},{"key":"NH4p","label":"NH₄⁺","geom":"tetrahedral","center":"N","ligands":["H","H","H","H"],"sign":-1},{"key":"CCl3Br","label":"CCl₃Br","geom":"tetrahedral","center":"C","ligands":["Cl","Cl","Cl","Br"],"ligandSigns":[1,1,1,1],"ligandMu":[0.75,0.75,0.75,0.55],"delta":"Em CCl₃Br, todos os dipolos saem de C, mas os ligantes não são equivalentes; a soma não zera.","densityBias":0.76},{"key":"CF2Cl2","label":"CF₂Cl₂","geom":"tetrahedral","center":"C","ligands":["F","F","Cl","Cl"],"ligandSigns":[1,1,1,1],"ligandMu":[1.7,1.7,0.75,0.75],"delta":"Em CF₂Cl₂, a tetraédrica com dois F e dois Cl mantém μR ≠ 0, pois os dipolos têm módulos distintos.","densityBias":0.84},{"key":"PO4mmm","label":"PO₄³⁻","geom":"tetrahedral","center":"P","ligands":["O","O","O","O"],"sign":1},{"key":"NH3","label":"NH₃","geom":"trigonal_pyramidal","center":"N","ligands":["H","H","H"],"sign":-1},{"key":"NF3","label":"NF₃","geom":"trigonal_pyramidal","center":"N","ligands":["F","F","F"],"sign":1},{"key":"NH2F","label":"NH₂F","geom":"trigonal_pyramidal","center":"N","ligands":["H","H","F"],"ligandSigns":[-1,-1,1],"ligandMu":[1.15,1.15,0.8],"delta":"Em NH₂F, os dipolos N-H apontam para N e N-F aponta para F. Com a piramidal trigonal, a soma vetorial é não nula.","densityBias":0.85},{"key":"PCl3","label":"PCl₃","geom":"trigonal_pyramidal","center":"P","ligands":["Cl","Cl","Cl"],"sign":1},{"key":"NH2Cl","label":"NH₂Cl","geom":"trigonal_pyramidal","center":"N","ligands":["H","H","Cl"],"ligandSigns":[-1,-1,1],"ligandMu":[1.15,1.15,0.2],"delta":"Em NH₂Cl, a presença de um ligante diferente e do par livre impede cancelamento total dos dipolos.","densityBias":0.82},{"key":"PI3","label":"PI₃","geom":"trigonal_pyramidal","center":"P","ligands":["I","I","I"],"sign":1},{"key":"NHCl2","label":"NHCl₂","geom":"trigonal_pyramidal","center":"N","ligands":["H","Cl","Cl"],"ligandSigns":[-1,1,1],"ligandMu":[1.15,0.2,0.2],"delta":"Em NHCl₂, o conjunto de dipolos em uma piramidal trigonal produz μR ≠ 0.","densityBias":0.8},{"key":"AsBr3","label":"AsBr₃","geom":"trigonal_pyramidal","center":"As","ligands":["Br","Br","Br"],"sign":1},{"key":"SbCl3","label":"SbCl₃","geom":"trigonal_pyramidal","center":"Sb","ligands":["Cl","Cl","Cl"],"sign":1},{"key":"H3Op","label":"H₃O⁺","geom":"trigonal_pyramidal","center":"O","ligands":["H","H","H"],"sign":-1},{"key":"PF5","label":"PF₅","geom":"trigonal_bipyramidal","center":"P","ligands":["F","F","F","F","F"],"sign":1},{"key":"PF4Cl","label":"PF₄Cl","geom":"trigonal_bipyramidal","center":"P","ligands":["F","F","Cl","F","F"],"ligandSigns":[1,1,1,1,1],"ligandMu":[1.3,1.3,0.75,1.3,1.3],"delta":"Em PF₄Cl, a bipirâmide trigonal deixa um ligante diferente sem compensação perfeita; a molécula é polar.","densityBias":0.8},{"key":"PCl3F2","label":"PCl₃F₂","geom":"trigonal_bipyramidal","center":"P","ligands":["Cl","Cl","Cl","F","F"],"ligandSigns":[1,1,1,1,1],"ligandMu":[0.75,0.75,0.75,1.3,1.3],"delta":"Em PCl₃F₂, os dois F podem ocupar posições axiais opostas e se cancelar; os três Cl equatoriais também se cancelam. Resultado: μR = 0.","densityBias":0.0},{"key":"AsF5","label":"AsF₅","geom":"trigonal_bipyramidal","center":"As","ligands":["F","F","F","F","F"],"sign":1},{"key":"PF3Cl2","label":"PF₃Cl₂","geom":"trigonal_bipyramidal","center":"P","ligands":["Cl","Cl","F","F","F"],"ligandSigns":[1,1,1,1,1],"ligandMu":[0.75,0.75,1.3,1.3,1.3],"delta":"Em PF₃Cl₂, a distribuição trigonal bipiramidal com ligantes diferentes leva a uma resultante não nula.","densityBias":0.78},{"key":"SbF5","label":"SbF₅","geom":"trigonal_bipyramidal","center":"Sb","ligands":["F","F","F","F","F"],"sign":1},{"key":"PBr3Cl2","label":"PBr₃Cl₂","geom":"trigonal_bipyramidal","center":"P","ligands":["Br","Br","Br","Cl","Cl"],"ligandSigns":[1,1,1,1,1],"ligandMu":[0.55,0.55,0.55,0.75,0.75],"delta":"Em PBr₃Cl₂, dois ligantes axiais Cl se cancelam e os três Br equatoriais também, de modo que μR = 0.","densityBias":0.0},{"key":"TaCl5","label":"TaCl₅","geom":"trigonal_bipyramidal","center":"Ta","ligands":["Cl","Cl","Cl","Cl","Cl"],"sign":1},{"key":"SF4","label":"SF₄","geom":"see_saw","center":"S","ligands":["F","F","F","F"],"sign":1},{"key":"SF2Cl2","label":"SF₂Cl₂","geom":"see_saw","center":"S","ligands":["F","Cl","F","Cl"],"ligandSigns":[1,1,1,1],"ligandMu":[1.3,0.75,1.3,0.75],"delta":"Em SF₂Cl₂, a gangorra com ligantes diferentes não permite cancelamento completo dos dipolos.","densityBias":0.82},{"key":"TeF4","label":"TeF₄","geom":"see_saw","center":"Te","ligands":["F","F","F","F"],"sign":1},{"key":"SeF2Cl2","label":"SeF₂Cl₂","geom":"see_saw","center":"Se","ligands":["F","Cl","F","Cl"],"ligandSigns":[1,1,1,1],"ligandMu":[1.2,0.7,1.2,0.7],"delta":"Em SeF₂Cl₂, a geometria gangorra e os ligantes diferentes levam a μR ≠ 0.","densityBias":0.8},{"key":"TeCl4","label":"TeCl₄","geom":"see_saw","center":"Te","ligands":["Cl","Cl","Cl","Cl"],"sign":1},{"key":"IF4p","label":"IF₄⁺","geom":"see_saw","center":"I","ligands":["F","F","F","F"],"sign":1},{"key":"BrF4p","label":"BrF₄⁺","geom":"see_saw","center":"Br","ligands":["F","F","F","F"],"sign":1},{"key":"ClF3","label":"ClF₃","geom":"t_shaped","center":"Cl","ligands":["F","F","F"],"sign":1},{"key":"BrF2Cl","label":"BrF₂Cl","geom":"t_shaped","center":"Br","ligands":["Cl","F","F"],"ligandSigns":[1,1,1],"ligandMu":[0.45,1.1,1.1],"delta":"Em BrF₂Cl, os dois dipolos axiais Br-F se compensam em parte, mas o ligante equatorial diferente mantém μR ≠ 0.","densityBias":0.82},{"key":"ICl3","label":"ICl₃","geom":"t_shaped","center":"I","ligands":["Cl","Cl","Cl"],"sign":1},{"key":"ICl2F","label":"ICl₂F","geom":"t_shaped","center":"I","ligands":["F","Cl","Cl"],"ligandSigns":[1,1,1],"ligandMu":[0.55,0.25,0.25],"delta":"Em ICl₂F, a molécula em T permanece polar porque o ligante equatorial não é equivalente aos axiais.","densityBias":0.78},{"key":"BrCl3","label":"BrCl₃","geom":"t_shaped","center":"Br","ligands":["Cl","Cl","Cl"],"sign":1},{"key":"XeF2","label":"XeF₂","geom":"linear_tbp","center":"Xe","ligands":["F","F"],"sign":1},{"key":"KrF2","label":"KrF₂","geom":"linear_tbp","center":"Kr","ligands":["F","F"],"sign":1},{"key":"BrF2m","label":"BrF₂⁻","geom":"linear_tbp","center":"Br","ligands":["F","F"],"sign":1},{"key":"ICl2m","label":"ICl₂⁻","geom":"linear_tbp","center":"I","ligands":["Cl","Cl"],"sign":1},{"key":"IBr2m","label":"IBr₂⁻","geom":"linear_tbp","center":"I","ligands":["Br","Br"],"sign":1},{"key":"BrF5","label":"BrF₅","geom":"square_pyramidal","center":"Br","ligands":["F","F","F","F","F"],"sign":1},{"key":"IF5","label":"IF₅","geom":"square_pyramidal","center":"I","ligands":["F","F","F","F","F"],"sign":1},{"key":"ClF5","label":"ClF₅","geom":"square_pyramidal","center":"Cl","ligands":["F","F","F","F","F"],"sign":1},{"key":"XeOF4","label":"XeOF₄","geom":"square_pyramidal","center":"Xe","ligands":["O","F","F","F","F"],"sign":1,"ligandMu":[1.55,1.25,1.25,1.25,1.25]},{"key":"SeF5m","label":"SeF₅⁻","geom":"square_pyramidal","center":"Se","ligands":["F","F","F","F","F"],"sign":1},{"key":"XeF4","label":"XeF₄","geom":"square_planar","center":"Xe","ligands":["F","F","F","F"],"sign":1},{"key":"XeF2Cl2","label":"XeF₂Cl₂","geom":"square_planar","center":"Xe","ligands":["F","F","Cl","Cl"],"ligandSigns":[1,1,1,1],"ligandMu":[1.2,1.2,0.55,0.55],"delta":"Em XeF₂Cl₂ quadrada planar, pares opostos iguais podem se cancelar, levando a μR = 0.","densityBias":0.0},{"key":"BrF4m","label":"BrF₄⁻","geom":"square_planar","center":"Br","ligands":["F","F","F","F"],"sign":1},{"key":"ClF4m","label":"ClF₄⁻","geom":"square_planar","center":"Cl","ligands":["F","F","F","F"],"sign":1},{"key":"PtCl2Br2_trans","label":"trans-[PtCl₂Br₂]²⁻","geom":"square_planar","center":"Pt","ligands":["Cl","Cl","Br","Br"],"ligandSigns":[1,1,1,1],"ligandMu":[0.7,0.7,0.55,0.55],"delta":"No isômero trans quadrado planar, cada par oposto se cancela ao longo do próprio eixo; assim, μR = 0.","densityBias":0.0},{"key":"PdCl4mm","label":"[PdCl₄]²⁻","geom":"square_planar","center":"Pd","ligands":["Cl","Cl","Cl","Cl"],"sign":1},{"key":"AuCl4m","label":"[AuCl₄]⁻","geom":"square_planar","center":"Au","ligands":["Cl","Cl","Cl","Cl"],"sign":1},{"key":"NiCN4mm","label":"[Ni(CN)₄]²⁻","geom":"square_planar","center":"Ni","ligands":["CN","CN","CN","CN"],"sign":1,"ligandMu":[1.45,1.45,1.45,1.45]},{"key":"SF6","label":"SF₆","geom":"octahedral","center":"S","ligands":["F","F","F","F","F","F"],"sign":1},{"key":"CoNH35Cl2p","label":"[Co(NH₃)₅Cl]²⁺","geom":"octahedral","center":"Co","ligands":["NH3","NH3","NH3","NH3","NH3","Cl"],"ligandSigns":[1,1,1,1,1,1],"ligandMu":[0.55,0.55,0.55,0.55,0.55,0.8],"delta":"No complexo [Co(NH₃)₅Cl]²⁺, um único ligante diferente em octaédrica impede cancelamento completo dos dipolos.","densityBias":0.76},{"key":"TeF6","label":"TeF₆","geom":"octahedral","center":"Te","ligands":["F","F","F","F","F","F"],"sign":1},{"key":"cisCoNH34Cl1p","label":"cis-[Co(NH₃)₄Cl₂]⁺","geom":"octahedral","center":"Co","ligands":["Cl","NH3","Cl","NH3","NH3","NH3"],"ligandSigns":[1,1,1,1,1,1],"ligandMu":[0.8,0.55,0.8,0.55,0.55,0.55],"delta":"No isômero cis de [Co(NH₃)₄Cl₂]⁺, os dois Cl não ficam opostos; por isso a soma vetorial não zera.","densityBias":0.78},{"key":"WF6","label":"WF₆","geom":"octahedral","center":"W","ligands":["F","F","F","F","F","F"],"sign":1},{"key":"CrNH35Cl2p","label":"[Cr(NH₃)₅Cl]²⁺","geom":"octahedral","center":"Cr","ligands":["NH3","NH3","NH3","NH3","NH3","Cl"],"ligandSigns":[1,1,1,1,1,1],"ligandMu":[0.55,0.55,0.55,0.55,0.55,0.8],"delta":"Em [Cr(NH₃)₅Cl]²⁺, a octaédrica com um único Cl e cinco NH₃ gera μR ≠ 0.","densityBias":0.76},{"key":"PF6m","label":"PF₆⁻","geom":"octahedral","center":"P","ligands":["F","F","F","F","F","F"],"sign":1},{"key":"AsF6m","label":"AsF₆⁻","geom":"octahedral","center":"As","ligands":["F","F","F","F","F","F"],"sign":1},{"key":"SbF6m","label":"SbF₆⁻","geom":"octahedral","center":"Sb","ligands":["F","F","F","F","F","F"],"sign":1},{"key":"IF6m","label":"IF₆⁻","geom":"octahedral","center":"I","ligands":["F","F","F","F","F","F"],"sign":1},{"key":"SiF6mm","label":"SiF₆²⁻","geom":"octahedral","center":"Si","ligands":["F","F","F","F","F","F"],"sign":1},{"key":"GeF6mm","label":"GeF₆²⁻","geom":"octahedral","center":"Ge","ligands":["F","F","F","F","F","F"],"sign":1},{"key":"TiF6mm","label":"TiF₆²⁻","geom":"octahedral","center":"Ti","ligands":["F","F","F","F","F","F"],"sign":1},{"key":"ZrF6mm","label":"ZrF₆²⁻","geom":"octahedral","center":"Zr","ligands":["F","F","F","F","F","F"],"sign":1}];
  var __practiceCatalog = __buildPracticeCatalog(__practiceRows);
  Object.keys(__practiceCatalog).forEach(function(k){
    exampleCatalog[k] = Object.assign({}, exampleCatalog[k] || {}, __practiceCatalog[k]);
    exampleCatalog[k].familyLabel = __familyLabels[exampleCatalog[k].bankFamily] || exampleCatalog[k].bankFamily;
  });
  var __practiceBank = Object.keys(exampleCatalog).map(function(k){ return exampleCatalog[k]; }).filter(function(ex){ return !!(ex && ex.bank); }).sort(function(a,b){
    var ai = a.bankIndex != null ? a.bankIndex : 9999, bi = b.bankIndex != null ? b.bankIndex : 9999;
    if(ai !== bi) return ai - bi;
    return String(a.label||a.key).localeCompare(String(b.label||b.key), 'pt-BR');
  });


  var steps = [
    {
      title:'Polaridade molecular: definição e origem',
      body:'A <b>polaridade molecular</b> decorre de uma <b>distribuição espacial não uniforme da densidade eletrônica</b>. Essa distribuição depende principalmente da <b>diferença de eletronegatividade</b> entre os átomos ligados e da <b>geometria molecular</b>. Quando há separação de cargas parciais, formam-se regiões com <b>δ−</b> e <b>δ+</b>, associadas a um <b>momento dipolar</b>.',
      note:'A polaridade é uma propriedade vetorial. Portanto, sua análise exige considerar simultaneamente <b>módulo</b>, <b>direção</b> e <b>sentido</b> dos dipolos de ligação na estrutura tridimensional.',
      pills:['densidade eletrônica','δ+ / δ−','polaridade'],
      examples:['H2O','CO2'],
      viz:{bond:true,result:true,cloud:true,calc:false,deltas:true,angles:false},
      run: async function(api){ await setExample('H2O', {cam:true}); }
    },
    {
      title:'Ângulos de ligação e projeção geométrica',
      body:'A análise dos <b>ângulos de ligação</b> pode ser facilitada por uma <b>projeção geométrica</b> do arranjo molecular. Em geometrias simétricas, a distribuição espacial das ligações ao redor do átomo central conduz a valores angulares característicos, como <b>180°</b> em moléculas lineares, <b>120°</b> em geometrias trigonais planares e aproximadamente <b>109,5°</b> em geometrias tetraédricas.',
      note:'A projeção bidimensional não substitui a estrutura tridimensional real, mas auxilia na visualização da distribuição angular e da orientação relativa dos vetores dipolares.',
      pills:['projeção','pizza','setores angulares'],
      examples:['BF3','CO2','CH4'],
      viz:{bond:true,result:true,cloud:true,calc:false,deltas:false,angles:true,pizza:true},
      run: async function(api){ await setExample('BF3', {cam:true}); }
    },
    {
      title:'Polaridade de ligação e polaridade molecular',
      body:'Uma <b>ligação polar</b> ocorre quando os elétrons compartilhados são deslocados em direção ao átomo mais eletronegativo. Entretanto, a existência de ligações polares <b>não implica, por si só, que a molécula seja polar</b>. A polaridade molecular depende da <b>soma vetorial</b> de todos os dipolos de ligação no arranjo geométrico da molécula.',
      note:'Assim, a classificação correta exige duas etapas: identificar a polaridade de cada ligação e verificar se a geometria molecular promove <b>cancelamento total</b> ou <b>resultante não nula</b>.',
      pills:['ligação polar','soma vetorial','geometria importa'],
      examples:['CO2','SO2','BF3'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:true,angles:true},
      run: async function(api){ await setExample('CO2', {cam:true}); }
    },
    {
      title:'Eletronegatividade e deslocamento da densidade eletrônica',
      body:'<b>Eletronegatividade</b> é a tendência relativa de um átomo em atrair para si a densidade eletrônica de uma ligação covalente. Em uma ligação entre átomos com eletronegatividades diferentes, o átomo mais eletronegativo concentra maior densidade eletrônica, adquirindo caráter <b>δ−</b>, enquanto o outro adquire caráter <b>δ+</b>.',
      note:'Esse deslocamento de densidade é a base da formação do <b>dipolo de ligação</b> e constitui a etapa inicial da análise de polaridade molecular.',
      examples:['H2O','NH3','BeCl2'],
      viz:{bond:true,result:false,cloud:true,calc:false,deltas:true,angles:false},
      run: async function(api){ await setExample('H2O', {cam:true}); }
    },
    {
      title:'Tendência periódica da eletronegatividade',
      body:'A eletronegatividade apresenta tendência geral de <b>aumentar ao longo do período, da esquerda para a direita</b>, e de <b>aumentar no grupo, de baixo para cima</b>. Elementos como <b>F</b>, <b>O</b> e <b>N</b> tendem a atrair fortemente a densidade eletrônica, enquanto elementos como <b>H</b>, <b>C</b> e <b>P</b> apresentam valores menores em comparação com esses não metais mais eletronegativos.',
      note:'Para a interpretação qualitativa da polaridade, muitas vezes basta comparar a ordem relativa entre os átomos envolvidos, sem necessidade de recorrer a valores numéricos exatos.',
      examples:['BeCl2','CCl4','BF3'],
      viz:{bond:true,result:false,cloud:true,calc:false,deltas:true,angles:false},
      run: async function(api){ await setExample('BeCl2', {cam:true}); }
    },
    {
      title:'Diferença de eletronegatividade (ΔEN)',
      body:'A <b>diferença de eletronegatividade</b> entre dois átomos, representada por <b>ΔEN</b>, fornece um critério qualitativo para estimar a polaridade de uma ligação. Quanto maior o valor de <b>ΔEN</b>, maior tende a ser a separação de cargas parciais. O átomo de maior eletronegatividade constitui a extremidade <b>δ−</b>, e o outro, a extremidade <b>δ+</b>.',
      note:'A identificação correta de <b>δ−</b> e <b>δ+</b> é essencial para estabelecer o sentido dos vetores dipolares de ligação.',
      examples:['NH3','H2O','SO2'],
      viz:{bond:true,result:false,cloud:true,calc:false,deltas:true,angles:false},
      run: async function(api){ await setExample('NH3', {cam:true}); }
    },
{
      title:'Momento dipolar de ligação (μ)',
      body:'Cada ligação polar pode ser representada por um <b>vetor de momento dipolar</b>, indicado por <b>μ</b>. O vetor é orientado em direção à região de maior densidade eletrônica. Em termos qualitativos, o módulo de <b>μ</b> aumenta com a intensificação da separação de cargas e com a distância efetiva entre os centros de carga.',
      note:'Em formulações simplificadas, o módulo do dipolo pode ser expresso como <b>μ = q·d</b>, em que <b>q</b> representa a carga efetiva separada e <b>d</b> a distância entre os centros de carga.',
      pills:['μ = q·d','sentido do vetor','ligação'],
      examples:['H2O','CO2','BF3'],
      viz:{bond:true,result:false,cloud:true,calc:true,deltas:true,angles:false},
      run: async function(api){ await setExample('H2O', {cam:false}); }
    },
    {
      title:'Regra do paralelogramo para soma vetorial',
      body:'Quando dois vetores partem da mesma origem, a soma gráfica pode ser obtida pela <b>regra do paralelogramo</b>. Constrói-se um paralelogramo com lados paralelos aos vetores originais, e a <b>diagonal traçada a partir da origem comum</b> representa o vetor resultante <b>μR</b>.',
      note:'Esse procedimento é equivalente à soma vetorial formal e permite visualizar, de modo geométrico, a direção e o módulo aproximado da resultante.',
      pills:['paralelogramo','soma gráfica','vetores'],
      examples:[],
      viz:{bond:true,result:true,cloud:false,calc:false,deltas:false,angles:false},
      onlyVectors:true,
      vectorMode:'parallelogram',
      run: async function(api){  }
    },
    {
      title:'Adição vetorial de dipolos',
      body:'Quando os dipolos de ligação possuem componentes orientadas em um <b>mesmo sentido</b>, ocorre <b>adição vetorial</b>. Nessa situação, as componentes ao longo de um eixo se somam, aumentando o módulo da resultante molecular.',
      note:'Em moléculas assimétricas, a coincidência parcial de componentes vetoriais é uma das causas mais frequentes da obtenção de <b>μR ≠ 0</b>.',
      pills:['adição vetorial','componentes','reforço de resultante'],
      examples:[],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:false,angles:true},
      onlyVectors:true,
      vectorMode:'addition',
      run: async function(api){ await setExample('H2O', {cam:true}); }
    },
    {
      title:'Subtração vetorial e cancelamento',
      body:'Quando dois vetores apresentam componentes em <b>sentidos opostos</b>, parte ou a totalidade da resultante pode ser anulada. Se os módulos forem iguais e os vetores forem colineares e opostos, ocorre <b>cancelamento total</b>. Em outros casos, o cancelamento pode ser apenas parcial, restando uma resultante diferente de zero.',
      note:'Esse princípio explica por que moléculas com ligações polares podem ser apolares quando a geometria distribui os vetores de modo simétrico.',
      pills:['subtração vetorial','cancelamento','simetria'],
      examples:[],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:false,angles:true},
      onlyVectors:true,
      vectorMode:'subtraction',
      run: async function(api){ await setExample('CO2', {cam:true}); }
    },

    {
      title:'Eixo de referência e leitura espacial',
      body:'Neste visualizador, o <b>eixo de simetria principal</b>, quando presente, é alinhado ao <b>eixo Z</b>. Essa escolha fornece um referencial geométrico estável para a observação da estrutura, da orientação dos vetores dipolares e da relação entre rotação do modelo e simetria molecular.',
      note:'O mini-eixo no canto da interface atua apenas como referência espacial da orientação global do sistema de coordenadas.',
      pills:['eixo Z','orientação','simetria'],
      examples:['CO2','BF3'],
      viz:{bond:true,result:true,cloud:true,calc:false,deltas:true,angles:true},
      run: async function(api){ await setExample('CO2', {cam:true}); }
    },
    {
      title:'Simetria molecular e cancelamento vetorial',
      body:'A <b>simetria molecular</b> corresponde à distribuição espacial regular dos ligantes em torno do átomo central. Em moléculas com ligantes equivalentes e geometria suficientemente simétrica, os vetores dipolares tendem a se distribuir de forma a produzir <b>cancelamento vetorial</b>, levando a <b>μR ≈ 0</b>.',
      note:'Por essa razão, a análise de polaridade não deve ser baseada apenas na polaridade individual das ligações, mas na <b>simetria do conjunto</b>.',
      pills:['simetria','cancelamento','μR'],
      examples:['CO2','SO2'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:true,angles:true},
      run: async function(api){ await setExample('SO2', {cam:true}); }
    },
    {
      title:'Influência dos ângulos de ligação na resultante',
      body:'Os <b>ângulos de ligação</b> determinam a orientação espacial dos dipolos. Assim, mesmo dipolos de mesmo módulo podem produzir resultados distintos conforme o ângulo entre eles: <b>180°</b> favorece cancelamento máximo, enquanto ângulos menores ou geometrias deformadas podem gerar resultantes não nulas.',
      note:'Consequentemente, a avaliação da polaridade exige considerar simultaneamente <b>módulo dos dipolos</b>, <b>ângulos</b> e <b>geometria molecular</b>.',
      pills:['ângulos','direção','cancelamento parcial'],
      examples:['CO2','SO2','H2O'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:false,angles:true},
      run: async function(api){ await setExample('SO2', {cam:true}); }
    },
    {
      title:'Momento dipolar resultante da molécula (μR)',
      body:'O <b>momento dipolar resultante</b> de uma molécula corresponde à <b>soma vetorial</b> de todos os dipolos de ligação e, em abordagens mais completas, também reflete a contribuição da distribuição associada a <b>pares de elétrons não ligantes</b>. Quando a soma vetorial é nula, a molécula é classificada como <b>apolar</b>; quando é diferente de zero, a molécula é <b>polar</b>.',
      note:'De forma compacta, pode-se representar essa ideia por <b>μR = Σμᵢ</b>, lembrando que se trata de soma vetorial em três dimensões.',
      pills:['Σμᵢ','vetor resultante','polar x apolar'],
      examples:['H2O','NH3','BF3','CCl4'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:true,angles:false},
      run: async function(api){ await setExample('NH3', {cam:false}); }
    },
    {
      title:'Geometrias simétricas e apolaridade',
      body:'Em moléculas com <b>geometrias simétricas</b> e ligantes equivalentes, os dipolos de ligação costumam se organizar de modo a produzir <b>cancelamento completo ou aproximadamente completo</b>. Nesses casos, mesmo ligações fortemente polares podem coexistir com uma <b>molécula apolar</b>.',
      note:'Exemplos clássicos incluem moléculas lineares, trigonais planares e tetraédricas perfeitamente simétricas com substituintes idênticos.',
      pills:['simetria','cancelamento','apolar'],
      examples:['CO2','BF3','CCl4','BeCl2'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:true,angles:false},
      run: async function(api){ await setExample('BF3', {cam:true}); }
    },
    {
      title:'Geometrias assimétricas e polaridade',
      body:'Quando a molécula apresenta <b>assimetria geométrica</b>, ligantes diferentes ou influência significativa de <b>pares de elétrons livres</b>, o cancelamento vetorial tende a ser incompleto. Nessa condição, permanece uma resultante dipolar diferente de zero, característica de moléculas <b>polares</b>.',
      note:'Em muitos casos, a presença de pares livres no átomo central altera os ângulos ideais e desloca a distribuição eletrônica, favorecendo a polaridade.',
      pills:['assimetria','pares livres','molécula polar'],
      examples:['H2O','NH3','SO2'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:true,angles:true},
      run: async function(api){ await setExample('H2O', {cam:false}); }
    },
    {
      title:'Nuvem de densidade eletrônica',
      body:'A <b>nuvem de densidade eletrônica</b> representa, de modo qualitativo, as regiões do espaço nas quais a presença de elétrons é mais provável. Em moléculas polares, essa distribuição tende a ser mais intensa em determinadas regiões da estrutura; em moléculas apolares, a distribuição global tende a apresentar maior equilíbrio espacial.',
      note:'Essa visualização é qualitativa: ela indica a <b>ocupação eletrônica relativa</b> no espaço molecular, sem substituir uma descrição quântica completa da densidade.',
      pills:['nuvem eletrônica','densidade','visualização'],
      examples:['H2O','CO2','NH3'],
      viz:{bond:false,result:true,cloud:true,calc:false,deltas:true,angles:false},
      run: async function(api){ await setExample('H2O', {cam:false}); }
    },
    {
      title:'Mapa de densidade eletrônica',
      body:'O <b>mapa de densidade eletrônica</b> representa uma superfície associada à ocupação espacial da nuvem eletrônica. Essa visualização destaca as regiões onde a densidade eletrônica é relevante e permite observar como a nuvem se distribui ao redor da molécula, incluindo a influência de ligações e de pares não ligantes.',
      note:'Esse mapa descreve principalmente <b>distribuição espacial de densidade</b>; ele não deve ser confundido, por si só, com a indicação direta do sinal do potencial eletrostático.',
      pills:['superfície de densidade','onde ficam os elétrons','ocupação espacial'],
      examples:['H2O','CO2','NH3'],
      viz:{bond:false,result:true,cloud:true,calc:false,deltas:true,angles:false,mapDensity:true,mapESP:false},
      run: async function(api){ await setExample('H2O', {cam:true}); }
    },
    {
      title:'Mapa de potencial eletrostático (MEP)',
      body:'O <b>mapa de potencial eletrostático</b> colore a superfície molecular de acordo com o potencial experimentado por uma <b>carga de teste positiva</b>. Nesta convenção, regiões de <b>maior densidade eletrônica</b> e potencial mais negativo aparecem em <b>vermelho</b>; regiões de <b>menor densidade eletrônica</b> e potencial mais positivo aparecem em <b>azul</b>; e regiões intermediárias são representadas por <b>verde</b> e <b>amarelo</b>.',
      note:'Esse tipo de mapa é útil para identificar áreas relativamente mais eletrorrica ou mais eletropobre da superfície molecular e para discutir possíveis regiões preferenciais de interação.',
      pills:['MEP','superfície colorida','vermelho ↔ azul'],
      examples:['H2O','CO2','CCl4'],
      viz:{bond:false,result:true,cloud:false,calc:false,deltas:true,angles:false,mapDensity:false,mapESP:true},
      run: async function(api){ await setExample('H2O', {cam:false}); }
    },
    {
      title:'Procedimento sistemático para determinar a polaridade',
      body:'Para determinar a polaridade molecular, recomenda-se a seguinte sequência: <b>(1)</b> identificar a <b>geometria molecular</b>; <b>(2)</b> verificar quais ligações são polares com base na <b>diferença de eletronegatividade</b>; <b>(3)</b> representar os <b>dipolos de ligação</b>; <b>(4)</b> realizar a <b>soma vetorial</b> por simetria ou por componentes; <b>(5)</b> concluir se <b>μR = 0</b> ou <b>μR ≠ 0</b>.',
      note:'Esse procedimento evita classificações baseadas apenas na aparência da fórmula e torna explícita a relação entre estrutura e polaridade.',
      pills:['passo a passo','componentes','simetria'],
      examples:['CO2','BF3','H2O'],
      viz:{bond:true,result:true,cloud:false,calc:true,deltas:true,angles:false},
      run: async function(api){ await setExample('CO2', {cam:false}); }
    },
    {
      title:'Soma por componentes cartesianas',
      body:'Quando necessário, cada dipolo de ligação pode ser decomposto em componentes cartesianas <b>(μx, μy, μz)</b>. A resultante é obtida pelas somas <b>Σμx</b>, <b>Σμy</b> e <b>Σμz</b>, e seu módulo pode ser calculado por <b>|μR| = √(Σμx² + Σμy² + Σμz²)</b>.',
      note:'Esse procedimento é especialmente útil em moléculas tridimensionais ou em situações nas quais a simetria não permite concluir a polaridade de forma imediata.',
      pills:['componentes','módulo','√(x²+y²+z²)'],
      examples:['H2O','NH3','CCl4'],
      viz:{bond:true,result:true,cloud:false,calc:true,deltas:false,angles:false},
      run: async function(api){ await setExample('H2O', {cam:false}); }
    },
    {
      title:'Consequências físico-químicas da polaridade',
      body:'A polaridade molecular influencia diretamente diversas propriedades físico-químicas, como <b>interações intermoleculares</b>, <b>solubilidade</b>, <b>pontos de fusão e ebulição</b> e resposta a <b>campos elétricos</b>. Em geral, moléculas polares interagem de forma mais intensa com espécies polares ou carregadas do que moléculas apolares de tamanho comparável.',
      note:'Assim, a polaridade não é apenas uma classificação estrutural; ela contribui para explicar comportamentos observáveis em sistemas reais.',
      pills:['interações','solubilidade','propriedades'],
      examples:['H2O','CH4'],
      viz:{bond:true,result:true,cloud:true,calc:false,deltas:true,angles:false},
      run: async function(api){ await setExample('H2O', {cam:false}); }
    },
    {
      title:'Síntese do critério de análise',
      body:'A determinação da polaridade molecular pode ser resumida em três perguntas centrais: <b>(1)</b> as ligações são polares? <b>(2)</b> qual é a <b>geometria molecular</b>? <b>(3)</b> os dipolos se <b>cancelam vetorialmente</b>? A resposta articulada a essas três questões permite classificar a maior parte das moléculas de forma consistente.',
      note:'A abordagem correta combina eletronegatividade, geometria e soma vetorial, sem depender de memorização isolada de exemplos.',
      pills:['checklist final','comparação','raciocínio visual'],
      examples:['CO2','SO2','BF3','NH3','CCl4','H2O'],
      viz:{bond:true,result:true,cloud:true,calc:true,deltas:true,angles:false},
      run: async function(api){ await setExample('CO2', {cam:true}); }
    }
  ];

  
  
  steps = steps.filter(function(s){ return !/\bMEP\b|potencial eletrost[aá]tico/i.test((s&&s.title)||''); }); 

  var apiRef=null, el={}, overlay=null, octx=null, calcHud=null, partialAtomUi=null, partialAtomCache={signature:''}, stepIdx=0, applying=false, playing=false, token=0;
  var activeExampleKey='H2O';
  var stepClickedExampleKey = null;
  var visualState={ bond:true, result:true, cloud:true, calc:false, deltas:true, angles:false, mapDensity:false, mapESP:false, pizza:false };
  var mapEls={density:null, esp:null, box:null};
  var angleEls={box:null, list:null};
  var angleVisibility={};
  var angleRenderCache={signature:'', items:[], enabled:false};

  var glowPhase=0;
  var practiceState = { enabled:true, currentKey:'H2O', revealed:false, feedback:'', guessSigns:[], checked:false, angleGuesses:[], partialGuesses:[], polarityGuess:'' };
  window.__practiceState = practiceState;
  var practiceEls = {};
  function getPracticeBondCount(){
    var ex = exampleCatalog[practiceState.currentKey || activeExampleKey];
    if(!ex || !ex.ligands) return 0;
    return ex.ligands.length || 0;
  }
  function resetPracticeState(key){
    var ex = exampleCatalog[key || practiceState.currentKey || activeExampleKey];
    practiceState.currentKey = ex ? ex.key : (key || practiceState.currentKey);
    practiceState.revealed = false;
    practiceState.feedback = '';
    practiceState.checked = false;
    practiceState.angleGuesses = new Array(__practiceAngleSlots(ex).length).fill('');
    practiceState.partialGuesses = new Array((ex && ex.ligands ? ex.ligands.length : 0) + 1).fill('');
    practiceState.polarityGuess = '';
    practiceState.guessSigns = new Array(ex && ex.ligands ? ex.ligands.length : 0).fill(0);
    angleRenderCache.signature = '';
    renderPracticeQuestionUI();
    renderPracticeGuessUI();
    renderPracticeAnswerBox();
  }
  function __practiceIsActive(){
    return !!(practiceState.enabled && practiceState.currentKey && exampleCatalog[practiceState.currentKey]);
  }
  window.__practiceIsActive = __practiceIsActive;
  function __formatBondDirection(sign, ligandLabel, centerLabel){
    if(sign > 0) return centerLabel + ' → ' + ligandLabel;
    if(sign < 0) return ligandLabel + ' → ' + centerLabel;
    return 'sem seta';
  }
  function __guessLabelClass(sign){
    if(sign > 0) return 'towardLig';
    if(sign < 0) return 'towardCenter';
    return 'unset';
  }
  function __practiceAngleTokens(ex, data){
    var resolved = data || getWorldDataForExample(ex || {});
    var source = Object.assign({}, resolved || {});
    source.ex = Object.assign({}, ex || {}, { geom:(ex && ex.geom) || ((resolved && resolved.ex && resolved.ex.geom) || '') });
    var descriptors = computeAngleDescriptors(source);
    if(descriptors && descriptors.length){
      return descriptors.map(function(item){ return item.valueLabel || formatAngleValue(item.deg); });
    }
    var geomKey = ex && ex.geom ? String(ex.geom) : '';
    switch(geomKey){
      case 'linear': return ['180°'];
      case 'trigonal_planar': return ['120°'];
      case 'tetrahedral':
      case 'tetra': return ['109,5°'];
      case 'trigonal_bipyramidal':
      case 'tbp': return ['120°','90°','180°'];
      case 'octahedral':
      case 'oct': return ['90°','180°'];
      case 'bent_tp': return ['<120°'];
      case 'trigonal_pyramidal': return ['~107°'];
      case 'bent_tet': return ['~104,5°'];
      case 'see_saw': return ['<120°','<90°','<180°'];
      case 't_shaped': return ['<90°','<180°'];
      case 'linear_tbp': return ['180°'];
      case 'square_pyramidal': return ['<90°','90°','180°'];
      case 'square_planar': return ['90°','180°'];
      default: {
        var G = geomPositions(ex && ex.geom);
        var txt = (G && (G.ideal || G.angle)) ? String(G.ideal || G.angle) : '-';
        return txt && txt !== '-' ? [txt] : [];
      }
    }
  }
  function angleVariableAt(i){
    var vars = ['x','y','z','w'];
    return vars[i] || ('x' + String((i||0) + 1));
  }
  function __formatAngleVariableList(count){
    var vars = [];
    for(var i=0;i<(count||0);i++) vars.push(angleVariableAt(i));
    if(!vars.length) return 'x';
    if(vars.length === 1) return vars[0];
    if(vars.length === 2) return vars[0] + ' e ' + vars[1];
    return vars.slice(0, -1).join(', ') + ' e ' + vars[vars.length - 1];
  }
  function __practiceAngleText(ex, data){
    var slots = __practiceAngleSlots(ex, data);
    if(slots && slots.length) return slots.map(function(slot){ return slot.varLabel + ' = ' + slot.token; }).join(' / ');
    return __practiceAngleTokens(ex, data).join(' / ') || '-';
  }
  function __parseAngleValue(raw){
    var txt = String(raw == null ? '' : raw).replace(/\s+/g,'').replace(/º/g,'°').replace(',', '.').toLowerCase();
    if(!txt) return { raw:'', sign:'', num:NaN };
    var sign = txt.charAt(0);
    if(sign !== '<' && sign !== '>' && sign !== '~' && sign !== '≈') sign = '';
    var match = txt.match(/-?\d+(?:\.\d+)?/);
    return { raw:txt, sign:sign, num:match ? parseFloat(match[0]) : NaN };
  }
  function __angleGuessMatches(expected, actual){
    var a = __parseAngleValue(actual);
    var e = __parseAngleValue(expected);
    if(!isFinite(a.num) || !isFinite(e.num)) return false;
    return Math.abs(a.num - e.num) <= 0.8;
  }
  function __practiceAngleVisibilityKey(id, ex){
    var exKey = ex && ex.key ? ex.key : (practiceState.currentKey || activeExampleKey || 'practice');
    return exKey + '|' + id;
  }
  function __practiceAngleVisible(id, ex){
    return angleVisibility[__practiceAngleVisibilityKey(id, ex)] !== false;
  }
  function __setPracticeAngleVisible(id, visible, ex){
    angleVisibility[__practiceAngleVisibilityKey(id, ex)] = !!visible;
  }
  function __practiceAngleSlots(ex, data){
    var resolved = data || getWorldDataForExample(ex || {});
    var source = Object.assign({}, resolved || {});
    source.ex = Object.assign({}, ex || {}, { geom:(ex && ex.geom) || ((resolved && resolved.ex && resolved.ex.geom) || '') });
    var descriptors = computeAngleDescriptors(source);
    if(!descriptors || !descriptors.length){
      var fallbackTokens = __practiceAngleTokens(ex, data);
      descriptors = fallbackTokens.map(function(token, idx){
        return { id:'a-fallback-' + idx, deg:__parseAngleValue(token).num, valueLabel:token, i:0, j:1, color:anglePaletteAt(idx) };
      });
    }
    return descriptors.map(function(desc, idx){
      var token = desc.valueLabel || formatAngleValue(desc.deg);
      var varName = angleVariableAt(idx);
      var angleId = desc.id || ('a-fallback-' + idx);
      return {
        id:angleId,
        token:token,
        placeholder:varName + '°',
        varName:varName,
        varLabel:varName + '°',
        prompt:'Ângulo ' + varName,
        guess:(practiceState.angleGuesses && practiceState.angleGuesses[idx]) ? practiceState.angleGuesses[idx] : '',
        visible: __practiceAngleVisible(angleId, ex || (resolved && resolved.ex) || null),
        color: desc.color || anglePaletteAt(idx),
        target: isFinite(desc.deg) ? desc.deg : __parseAngleValue(token).num,
        i: desc.i,
        j: desc.j,
        displayLabel: desc.displayLabel || token
      };
    });
  }

  function __practicePartialSlots(ex, data){
    var resolved = data || getWorldDataForExample(ex);
    var ligands = (ex && ex.ligands) || [];
    var dipoles = (resolved && resolved.bondDipoles) || [];
    var items = [];
    var firstBondSign = (dipoles[0] && dipoles[0].sign != null) ? dipoles[0].sign : ((ex && ex.sign != null) ? ex.sign : null);
    if(firstBondSign != null){
      items.push({
        id:'practice-partial-center',
        atomIndex:0,
        prompt:'Átomo central · ' + ((ex && ex.center) || 'X'),
        displayLabel:'δ',
        guess:(practiceState.partialGuesses && practiceState.partialGuesses[0]) ? practiceState.partialGuesses[0] : '',
        correct:firstBondSign < 0 ? '-' : '+'
      });
    }
    dipoles.forEach(function(d, idx){
      var ligand = ligands[idx] || ('Lig. ' + (idx + 1));
      var sign = d && d.sign != null ? (d.sign < 0 ? '+' : '-') : '';
      items.push({
        id:'practice-partial-' + idx,
        atomIndex:idx + 1,
        prompt:'Ligação ' + (idx + 1) + ' · ' + ligand,
        displayLabel:'δ',
        guess:(practiceState.partialGuesses && practiceState.partialGuesses[idx + 1]) ? practiceState.partialGuesses[idx + 1] : '',
        correct:sign
      });
    });
    return items;
  }
  function __sanitizePartialGuess(value){
    var s = String(value == null ? '' : value).trim();
    if(!s) return '';
    if(/[+＋]/.test(s)) return '+';
    if(/[-−–—]/.test(s)) return '-';
    return '';
  }
  function __practicePartialAnswerText(ex, data){
    return __practicePartialSlots(ex, data).map(function(slot){
      return slot.prompt + ': δ' + slot.correct;
    }).join(' · ');
  }
  function renderPracticeQuestionUI(){
    if(!practiceEls.questionMeta) return;
    var ex = exampleCatalog[practiceState.currentKey] || exampleCatalog[activeExampleKey];
    if(!ex) return;
    var family = __familyLabels[ex.bankFamily] || ex.bankFamily || ex.geom || '-';
    var angleSlots = __practiceAngleSlots(ex);
    var angleLead = angleSlots.length > 1
      ? ('Escreva os ângulos ' + __formatAngleVariableList(angleSlots.length) + ' no menu do visualizador')
      : ('Escreva o ângulo ' + ((angleSlots[0] && angleSlots[0].varName) || 'x') + ' no menu do visualizador');
    practiceEls.questionMeta.innerHTML = '<b>' + esc(ex.label) + '</b> · ' + esc(family) + '<br>' + esc(angleLead) + ', marque a polaridade parcial sobre os átomos e depois complete os vetores em todas as ligações.';
  }
  function __currentPracticeIndex(){
    for(var i=0;i<__practiceBank.length;i++) if(__practiceBank[i] && __practiceBank[i].key === practiceState.currentKey) return i;
    return 0;
  }
  function __practiceFamilyOptions(){
    var seen = {};
    var out = [];
    __practiceBank.forEach(function(ex){
      if(!ex || seen[ex.bankFamily]) return;
      seen[ex.bankFamily] = true;
      out.push({ value:ex.bankFamily, label:__familyLabels[ex.bankFamily] || ex.bankFamily });
    });
    return out;
  }
  function __practiceListForFamily(family){
    if(!family || family === 'all') return __practiceBank.slice();
    return __practiceBank.filter(function(ex){ return ex.bankFamily === family; });
  }
  function syncPracticeSelectors(forceFirst){
    if(!practiceEls.family || !practiceEls.example) return;
    var family = practiceEls.family.value || 'all';
    var list = __practiceListForFamily(family);
    practiceEls.example.innerHTML = list.map(function(ex){
      return '<option value="' + esc(ex.key) + '">' + esc(ex.label) + ' · ' + esc(__familyLabels[ex.bankFamily] || ex.bankFamily) + '</option>';
    }).join('');
    var exists = (!forceFirst) && list.some(function(ex){ return ex.key === practiceState.currentKey; });
    if(exists) practiceEls.example.value = practiceState.currentKey;
    else if(list[0]) practiceEls.example.value = list[0].key;
    else practiceEls.example.value = '';
    if(practiceEls.count) practiceEls.count.textContent = String(__practiceBank.length);
  }
  function syncPracticeStats(){
    if(!practiceEls.stats) return;
    var idx = __currentPracticeIndex();
    var ex = exampleCatalog[practiceState.currentKey] || exampleCatalog[activeExampleKey];
    var family = ex ? (__familyLabels[ex.bankFamily] || ex.bankFamily) : '-';
    practiceEls.stats.innerHTML = '<b>' + String(idx + 1) + ' / ' + String(__practiceBank.length) + '</b> · ' + esc(family);
  }
  function renderPracticeGuessUI(){
    if(!practiceEls.guess) return;
    var ex = exampleCatalog[practiceState.currentKey] || exampleCatalog[activeExampleKey];
    if(!ex){ practiceEls.guess.innerHTML = ''; return; }
    var center = ex.center || 'X';
    practiceEls.guess.innerHTML = (ex.ligands||[]).map(function(lig, idx){
      var sign = practiceState.guessSigns[idx] || 0;
      return '<button type="button" class="ppBondBtn ' + __guessLabelClass(sign) + '" data-bond-idx="' + idx + '"><span>Ligação ' + (idx+1) + '</span><b>' + esc(__formatBondDirection(sign, lig, center)) + '</b></button>';
    }).join('');
    syncPracticeStats();
  }
  function renderPracticeAnswerBox(){
    if(!practiceEls.answer) return;
    var ex = exampleCatalog[practiceState.currentKey] || exampleCatalog[activeExampleKey];
    if(!ex) return;
    var data = getWorldDataForExample(ex);
    var angleText = __practiceAngleText(ex, data);
    var polarity = data.muMag > 0.06 ? 'polar' : 'apolar';
    var muText = data.muMag > 0.06 ? 'μR ≠ 0' : 'μR = 0';
    var partialText = __practicePartialAnswerText(ex, data);
    if(practiceState.revealed){
      practiceEls.answer.innerHTML = '<div class="ppAnsHead">Resposta correta</div><div><b>' + esc(ex.label) + '</b> · ' + esc(__familyLabels[ex.bankFamily] || ex.bankFamily) + '</div><div><b>Ângulo(s):</b> ' + esc(angleText) + '</div><div><b>Polaridade parcial:</b> ' + esc(partialText) + '</div><div><b>Polaridade:</b> <b>' + polarity + '</b> · ' + muText + '</div><div class="ppMute">' + esc(ex.delta || '') + '</div>';
    } else if(practiceState.feedback){
      practiceEls.answer.innerHTML = '<div class="ppAnsHead">Correção</div><div>' + practiceState.feedback + '</div>';
    } else {
      practiceEls.answer.innerHTML = '<div class="ppAnsHead">Como usar</div><div>Escreva o(s) ângulo(s) no menu do visualizador, marque a polaridade parcial sobre os átomos e depois defina um vetor em cada ligação para o programa conferir se μR = 0 ou se μR ≠ 0.</div>';
    }
  }
  function cyclePracticeGuess(idx){
    if(!__practiceIsActive() || practiceState.revealed) return;
    if(!practiceState.guessSigns || idx < 0 || idx >= practiceState.guessSigns.length) return;
    var cur = practiceState.guessSigns[idx] || 0;
    practiceState.guessSigns[idx] = cur === 0 ? 1 : (cur === 1 ? -1 : 0);
    practiceState.feedback = '';
    practiceState.checked = false;
    renderPracticeGuessUI();
    renderPracticeAnswerBox();
  }
  function verifyPracticeGuess(){
    var ex = exampleCatalog[practiceState.currentKey] || exampleCatalog[activeExampleKey];
    if(!ex) return;
    var data = getWorldDataForExample(ex);
    var correct = (data.bondDipoles||[]).map(function(d){ return d.sign < 0 ? -1 : 1; });
    var guesses = (practiceState.guessSigns||[]).slice();
    var missing = guesses.filter(function(v){ return !v; }).length;
    if(missing){
      practiceState.feedback = 'Ainda faltam ' + String(missing) + ' ligação(ões) sem seta.';
      renderPracticeAnswerBox();
      return;
    }
    var angleSlots = __practiceAngleSlots(ex);
    var missingAngles = angleSlots.filter(function(slot){ return !String(slot.guess || '').trim(); }).length;
    var partialSlots = __practicePartialSlots(ex, data);
    var missingPartials = partialSlots.filter(function(slot){ return !String(slot.guess || '').trim(); }).length;
    if(missingAngles || missingPartials){
      var pend = [];
      if(missingAngles) pend.push('o(s) ângulo(s) no visualizador (' + String(missingAngles) + ' faltando)');
      if(missingPartials) pend.push('a polaridade parcial (' + String(missingPartials) + ' faltando)');
      practiceState.feedback = 'Responda também ' + pend.join(' e ') + ' antes de verificar.';
      renderPracticeAnswerBox();
      return;
    }
    var hits = 0;
    for(var i=0;i<correct.length;i++) if((guesses[i] < 0 ? -1 : 1) === correct[i]) hits++;
    var guessMu = [0,0,0];
    (data.bondDipoles||[]).forEach(function(d, idx){
      var sign = guesses[idx] < 0 ? -1 : 1;
      guessMu = vAdd(guessMu, vMul(d.dir, (d.mu||1) * sign));
    });
    var guessPolarFromVectors = vLen(guessMu) > 0.06;
    var correctPolar = data.muMag > 0.06;
    var guessMuText = guessPolarFromVectors ? 'μR ≠ 0' : 'μR = 0';
    var correctMuText = correctPolar ? 'μR ≠ 0' : 'μR = 0';
    var correctAngle = __practiceAngleText(ex, data);
    var angleHits = 0;
    angleSlots.forEach(function(slot){ if(__angleGuessMatches(slot.token, slot.guess)) angleHits++; });
    var angleOk = angleHits === angleSlots.length;
    var angleGuessText = angleSlots.map(function(slot){ return String(slot.guess || '').trim() || '—'; }).join(' / ');
    var partialHits = 0;
    var partialGuessText = partialSlots.map(function(slot){
      var g = __sanitizePartialGuess(slot.guess);
      if(g === slot.correct) partialHits++;
      return slot.prompt + ': δ' + (g || '□');
    }).join(' · ');
    var partialCorrectText = partialSlots.map(function(slot){
      return slot.prompt + ': δ' + slot.correct;
    }).join(' · ');
    var partialOk = partialHits === partialSlots.length;
    var vectorPolarityOk = guessPolarFromVectors === correctPolar;
    practiceState.checked = true;
    practiceState.feedback = '' +
      'Ligações corretas: <b>' + String(hits) + '/' + String(correct.length) + '</b><br>' +
      'Ângulo(s) marcado(s): <b>' + esc(angleGuessText) + '</b> · correto(s): <b>' + esc(correctAngle) + '</b> · ' + (angleOk ? 'acertou' : ('acertou ' + String(angleHits) + '/' + String(angleSlots.length))) + '.<br>' +
      'Polaridade parcial marcada: <b>' + esc(partialGuessText) + '</b><br>Correta: <b>' + esc(partialCorrectText) + '</b> · ' + (partialOk ? 'acertou' : ('acertou ' + String(partialHits) + '/' + String(partialSlots.length))) + '.<br>' +
      'Vetores montados: <b>' + guessMuText + '</b> · correta: <b>' + correctMuText + '</b> · polaridade total <b>' + (correctPolar ? 'polar' : 'apolar') + '</b> · ' + (vectorPolarityOk ? 'batem com a resposta' : 'não batem com a resposta') + '.';
    renderPracticeAnswerBox();
  }
  function revealPracticeAnswer(){
    practiceState.revealed = true;
    renderPracticeAnswerBox();
  }
  function loadPracticeExample(key, opts){
    var ex = exampleCatalog[key];
    if(!ex) return;
    practiceState.currentKey = ex.key;
    resetPracticeState(ex.key);
    if(practiceEls.family){
      var fam = ex.bankFamily || ex.geom;
      if(practiceEls.family.value !== fam){
        practiceEls.family.value = fam;
        syncPracticeSelectors();
      }
    }
    if(practiceEls.example) practiceEls.example.value = ex.key;
    setExample(ex.key, {cam: !(opts && opts.cam === false), userClick: !!(opts && opts.userClick)});
    syncPracticeStats();
  }
  function loadAdjacentPractice(delta){
    var idx = __currentPracticeIndex();
    var next = __practiceBank[(idx + delta + __practiceBank.length) % __practiceBank.length];
    if(next) loadPracticeExample(next.key, {cam:true});
  }
  function loadRandomPractice(){
    if(!__practiceBank.length) return;
    var idx = Math.floor(Math.random() * __practiceBank.length);
    var ex = __practiceBank[idx];
    if(ex) loadPracticeExample(ex.key, {cam:true});
  }
  function distanceToSegment(px, py, ax, ay, bx, by){
    var dx = bx - ax, dy = by - ay;
    var len2 = dx*dx + dy*dy;
    if(len2 < 1e-6) return Math.hypot(px - ax, py - ay);
    var t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    var qx = ax + dx * t, qy = ay + dy * t;
    return Math.hypot(px - qx, py - qy);
  }
  function findPracticeBondAt(clientX, clientY){
    if(!__practiceIsActive() || practiceState.revealed || !apiRef) return -1;
    var cv = document.getElementById('gl');
    if(!cv) return -1;
    var rect = cv.getBoundingClientRect();
    var x = clientX - rect.left, y = clientY - rect.top;
    var ex = exampleCatalog[practiceState.currentKey] || exampleCatalog[activeExampleKey];
    if(!ex) return -1;
    var data = getWorldDataForExample(ex);
    var view = apiRef.getView ? apiRef.getView() : {camDist:5, rotX:0.3, rotY:-0.8};
    var center = projectPoint([0,0,0], view, {w:rect.width, h:rect.height});
    if(!center) return -1;
    var best = -1, bestDist = 24;
    (data.atoms||[]).slice(1).forEach(function(atom, idx){
      var p = projectPoint(atom.pos, view, {w:rect.width, h:rect.height});
      if(!p) return;
      var d = distanceToSegment(x, y, center.x, center.y, p.x, p.y);
      if(d < bestDist){ bestDist = d; best = idx; }
    });
    return best;
  }
  function drawAtomSymbolLabels(ctx, projAtoms){
    if(!projAtoms || !projAtoms.length) return;
    projAtoms.forEach(function(it, idx){
      if(!it || !it.p || !it.a) return;
      var txt = it.a.label || (idx===0 ? 'X' : ('L' + idx));
      drawTextLabel(ctx, {x:it.p.x, y:it.p.y + (idx===0 ? 44 : 36)}, txt, idx===0 ? '#ffffff' : '#dff4ff');
    });
  }
  function __bondArrowPointsFromSign(dir, bondLen, sign, view, can){
    var towardLig = sign > 0;
    var t0 = towardLig ? 0.34 : 0.78;
    var t1 = towardLig ? 0.82 : 0.38;
    var aW = vMul(dir, bondLen * t0);
    var bW = vMul(dir, bondLen * t1);
    return { a:projectPoint(aW, view, can), b:projectPoint(bW, view, can) };
  }
  function __practiceGuessData(data){
    var sum = [0,0,0];
    var bonds = [];
    var filled = 0;
    (data.bondDipoles||[]).forEach(function(d, idx){
      var sign = practiceState.guessSigns[idx] || 0;
      if(sign){
        filled++;
        var vec = vMul(d.dir, (d.mu||1) * (sign < 0 ? -1 : 1));
        bonds.push({dir:d.dir, sign:(sign < 0 ? -1 : 1), mu:(d.mu||1), vec:vec});
        sum = vAdd(sum, vec);
      } else {
        bonds.push(null);
      }
    });
    return { bonds:bonds, muR:sum, muMag:vLen(sum), filled:filled };
  }
  function ensurePracticePanel(){
    if(practiceEls.box) return;
    var aside = document.querySelector('aside');
    if(!aside) return;
    var box = document.createElement('section');
    box.className = 'practicePanel';
    box.id = 'practicePanel';
    box.innerHTML = '' +
      '<div class="ppHead">Exercícios de fixação · Polaridade e Geometria</div>' +
      '<div class="ppSub">Exemplos até arranjos octaédricos. Responda o ângulo no menu do visualizador, marque a polaridade parcial sobre os átomos e depois monte os vetores nas ligações.</div>' +
      '<div class="ppRow">' +
        '<div><label for="ppFamily">Família</label><select id="ppFamily"></select></div>' +
        '<div><label for="ppExample">Molécula</label><select id="ppExample"></select></div>' +
      '</div>' +      '<div class="ppQuestion">' +
        '<div class="ppAnsHead">Pergunta</div>' +
        '<div class="ppQuestionMeta" id="ppQuestionMeta"></div>' +
      '</div>' +
      '<div class="ppBtns">' +
        '<button type="button" id="ppLoad">Carregar</button>' +
        '<button type="button" id="ppRandom">Aleatória</button>' +
        '<button type="button" id="ppNext">Próxima</button>' +
      '</div>' +
      '<div class="ppStats" id="ppStats"></div>' +
      '<div class="ppCount">Total no banco: <b id="ppCount">0</b></div>' +
      '<div class="ppGuess" id="ppGuess"></div>' +
      '<div class="ppBtns ppBtns2">' +
        '<button type="button" id="ppCheck">Verificar</button>' +
        '<button type="button" id="ppReset">Limpar</button>' +
        '<button type="button" id="ppReveal">Mostrar resposta</button>' +
      '</div>' +
      '<div class="ppAnswer" id="ppAnswer"></div>';
    var ref = aside.querySelector('fieldset');
    if(ref && ref.nextSibling) aside.insertBefore(box, ref.nextSibling);
    else aside.appendChild(box);
    practiceEls.box = box;
    practiceEls.family = box.querySelector('#ppFamily');
    practiceEls.example = box.querySelector('#ppExample');
    practiceEls.load = box.querySelector('#ppLoad');
    practiceEls.random = box.querySelector('#ppRandom');
    practiceEls.next = box.querySelector('#ppNext');
    practiceEls.mode = box.querySelector('#ppMode');
    practiceEls.questionMeta = box.querySelector('#ppQuestionMeta');
    practiceEls.stats = box.querySelector('#ppStats');
    practiceEls.count = box.querySelector('#ppCount');
    practiceEls.guess = box.querySelector('#ppGuess');
    practiceEls.answer = box.querySelector('#ppAnswer');
    practiceEls.check = box.querySelector('#ppCheck');
    practiceEls.reset = box.querySelector('#ppReset');
    practiceEls.reveal = box.querySelector('#ppReveal');
    if(practiceEls.family){
      practiceEls.family.innerHTML = '<option value="all">Todas</option>' + __practiceFamilyOptions().map(function(item){
        return '<option value="' + esc(item.value) + '">' + esc(item.label) + '</option>';
      }).join('');
      practiceEls.family.addEventListener('change', function(){
        syncPracticeSelectors(true);
        if(practiceEls.example && practiceEls.example.value) loadPracticeExample(practiceEls.example.value, {cam:true});
      });
    }
    if(practiceEls.example){
      practiceEls.example.addEventListener('change', function(){
        if(practiceEls.example.value) loadPracticeExample(practiceEls.example.value, {cam:true});
      });
    }
    if(practiceEls.load) practiceEls.load.addEventListener('click', function(){
      if(practiceEls.example && practiceEls.example.value) loadPracticeExample(practiceEls.example.value, {cam:true});
    });
    if(practiceEls.random) practiceEls.random.addEventListener('click', function(){ loadRandomPractice(); });
    if(practiceEls.next) practiceEls.next.addEventListener('click', function(){ loadAdjacentPractice(1); });
    if(practiceEls.mode) practiceEls.mode.addEventListener('change', function(){
      practiceState.enabled = !!practiceEls.mode.checked;
      practiceState.revealed = false;
      practiceState.feedback = '';
      renderPracticeAnswerBox();
      syncPracticeStats();
    });
    if(practiceEls.check) practiceEls.check.addEventListener('click', function(){ verifyPracticeGuess(); });
    if(practiceEls.reset) practiceEls.reset.addEventListener('click', function(){ resetPracticeState(practiceState.currentKey || activeExampleKey); });
    if(practiceEls.reveal) practiceEls.reveal.addEventListener('click', function(){ revealPracticeAnswer(); });
    if(practiceEls.guess) practiceEls.guess.addEventListener('click', function(ev){
      var btn = ev.target && ev.target.closest ? ev.target.closest('.ppBondBtn[data-bond-idx]') : null;
      if(!btn) return;
      cyclePracticeGuess(parseInt(btn.getAttribute('data-bond-idx'), 10) || 0);
    });
    syncPracticeSelectors();
    if(practiceEls.example && !practiceEls.example.value && __practiceBank[0]) practiceEls.example.value = __practiceBank[0].key;
    syncPracticeStats();
    renderPracticeQuestionUI();
    renderPracticeGuessUI();
    renderPracticeAnswerBox();
  }
  function initPracticeCanvasInteractions(){
    var cv = document.getElementById('gl');
    if(!cv || cv.__practiceBound) return;
    cv.__practiceBound = true;
    cv.addEventListener('click', function(ev){
      if(!__practiceIsActive() || practiceState.revealed) return;
      var idx = findPracticeBondAt(ev.clientX, ev.clientY);
      if(idx < 0) return;
      cyclePracticeGuess(idx);
    });
  }

  function injectStyles(){
    var st=document.createElement('style');
    st.textContent = ''+
      '.polarOverlay{position:absolute; inset:var(--viewer-pad); pointer-events:none; z-index:19;}'+
      '.polarCalcHud{position:absolute; right:14px; bottom:52px; z-index:24; min-width:300px; max-width:min(420px,45vw); background:linear-gradient(180deg, rgba(10,16,30,.78), rgba(8,12,22,.70)); border:1px solid rgba(126,125,255,.22); border-radius:14px; padding:10px 12px; color:#e6f0ff;  font-size:12px; line-height:1.4;}'+
      '.polarCalcHud.hide{display:none}'+
      '.polarCalcHud .row{display:flex; justify-content:space-between; gap:8px; margin:2px 0;}'+
      '.polarCalcHud .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'+
      '.polarCalcHud .k{color:#b8cdea} .polarCalcHud .v{color:#fff}'+
      '.polarCalcHud .badge{display:inline-block; margin-left:6px; padding:2px 7px; border-radius:999px; font-weight:700; font-size:11px; border:1px solid rgba(255,255,255,.12)}'+
      '.polarCalcHud .badge.polar{background:rgba(72,196,255,.16); color:#dff7ff; border-color:rgba(72,196,255,.25)}'+
      '.polarCalcHud .badge.apolar{background:rgba(180,200,220,.12); color:#f4f7ff; border-color:rgba(255,255,255,.12)}'+
      '.tutorialExamples .calcBox{margin-top:8px; padding:8px 9px; border-radius:9px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.02); text-align:justify; text-justify:inter-word; hyphens:auto}'+
      '.tutorialExamples .calcBox .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'+
      '.tutorialExamples .legendDots{display:flex; gap:8px; flex-wrap:wrap; margin-top:6px}'+
      '.tutorialExamples .dotItem{display:inline-flex; align-items:center; gap:6px; font-size:11px; color:#cfe0ff}'+
      '.tutorialExamples .dot{width:9px; height:9px; border-radius:50%}'+
      '.tutorialExamples, .tutorialBody, .tutorialNote{word-break:normal; overflow-wrap:break-word}'+
      '.mapOptionBox{margin-top:8px; padding:8px 9px; border-radius:10px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.02)}'+
      '.mapOptionBox .mapTitle{font-size:11px; color:#bfd4f2; margin:0 0 6px; font-weight:700; letter-spacing:.02em}'+
      '.mapOptionBox .mapHelp{font-size:11px; color:#b6c8e7; margin-top:6px; line-height:1.35; text-align:justify; text-justify:inter-word}'+
      '.mapChk{display:flex; align-items:flex-start; gap:8px; margin:6px 0; padding:6px 7px; border-radius:9px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.015)}'+
      '.mapChk input{margin-top:2px; accent-color:#6ea6ff}'+
      '.mapChk span{font-size:12px; color:#e6f0ff; line-height:1.25}'+
      '.mapChk small{display:block; color:#b6c8e7; font-size:10px; margin-top:2px}'+
      '.tutorialAngleLegendPanel{position:absolute; top:58px; left:14px; z-index:24; width:min(198px, calc(100% - 28px)); min-width:156px; max-width:198px; max-height:min(240px, calc(100% - 96px)); overflow:auto; padding:8px 8px 6px; border-radius:14px; background:rgba(8,12,20,.46); border:1px solid rgba(255,255,255,.08); backdrop-filter:none; color:#eef5ff; box-shadow:none; box-sizing:border-box}'+
      '.tutorialAngleLegendPanel.hide{display:none}'+
      '.tutorialAngleLegendPanel .angleLegendHead{display:flex; align-items:center; justify-content:space-between; gap:8px; margin:0 0 6px}'+
      '.tutorialAngleLegendPanel .angleLegendTitle{margin:0; font-size:10px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; color:#bcd1ef}'+
      '.tutorialAngleLegendPanel .angleLegendList{display:grid; gap:5px; overflow:visible}'+
      '.tutorialAngleLegendPanel .angleLegendItem{display:grid; grid-template-columns:14px 8px minmax(0,1fr) auto; align-items:center; gap:6px; width:100%; padding:5px 6px; border-radius:11px; border:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.03); font-size:11px; line-height:1.15; color:#eef5ff; user-select:none; box-sizing:border-box}'+
      '.tutorialAngleLegendPanel .angleLegendItem input[type="checkbox"]{width:auto; margin:0; flex:0 0 auto; accent-color:#c65cff}'+
      '.tutorialAngleLegendPanel .angleLegendSwatch{width:8px; height:8px; border-radius:999px; flex:0 0 auto; box-shadow:0 0 0 1px rgba(255,255,255,.14)}'+
      '.tutorialAngleLegendPanel .angleLegendText{display:flex; flex-direction:column; gap:1px; min-width:0; flex:1 1 auto}'+
      '.tutorialAngleLegendPanel .angleLegendValue{font-weight:800; color:#f5f9ff; white-space:nowrap; font-size:10px}'+
      '.tutorialAngleLegendPanel .angleLegendMeta{font-size:9px; color:#a9bdd8}'+
      '.tutorialAngleLegendPanel .angleLegendEmpty{font-size:11px; color:#a9bdd8}'+
      '.tutorialAngleLegendPanel .angleAnswerWrap{display:flex; align-items:center; gap:5px; min-width:0; flex:0 0 auto}'+
      '.tutorialAngleLegendPanel .angleEditBtn, .partialAtomEditBtn{appearance:none; border:none; cursor:pointer; width:22px; height:22px; border-radius:7px; background:rgba(255,255,255,.06); color:#eef5ff; border:1px solid rgba(255,255,255,.08); padding:0; display:grid; place-items:center}'+
      '.tutorialAngleLegendPanel .angleEditBtn svg, .partialAtomEditBtn svg{width:11px; height:11px; display:block}'+
      '.tutorialAngleLegendPanel .angleAnswerInput{width:52px; min-width:52px; padding:4px 4px; border-radius:8px; border:1px solid rgba(255,255,255,.10); background:rgba(4,9,16,.42); color:#eef5ff; font-weight:800; text-align:center; box-sizing:border-box; font-size:10px}'+
      '.tutorialAngleLegendPanel .angleAnswerInput::placeholder{color:#dbe7ff; opacity:.7}'+
      '.tutorialAngleLegendPanel.is-master-off{opacity:.74}'+
      '.partialAtomOverlay{position:absolute; inset:var(--viewer-pad); z-index:25; pointer-events:none}'+
      '.partialAtomOverlay.hide{display:none}'+
      '.partialAtomItem{position:absolute; transform:translate(-50%,-100%); display:flex; align-items:center; gap:3px; pointer-events:auto; padding:1px 3px; border-radius:8px; background:rgba(8,12,20,.34); border:1px solid rgba(255,255,255,.06); box-shadow:none; box-sizing:border-box; opacity:.88}'+
      '.partialAtomDelta{font-size:12px; font-weight:800; color:#eef5ff; line-height:1; opacity:.78}'+
      '.partialAtomInput{width:14px; height:18px; padding:0; border-radius:6px; border:1px solid rgba(255,255,255,.08); background:rgba(4,9,16,.20); color:#eef5ff; font-weight:800; font-size:12px; text-align:center; box-sizing:border-box}'+
      '.partialAtomInput::placeholder{color:#dbe7ff; opacity:.7}'+
      'body.lightBg .tutorialAngleLegendPanel{background:rgba(255,255,255,.82); border-color:rgba(0,0,0,.12); color:#13325f}'+
      'body.lightBg .tutorialAngleLegendPanel .angleLegendTitle{color:#476999}'+
      'body.lightBg .tutorialAngleLegendPanel .angleLegendItem{background:rgba(16,57,112,.04); border-color:rgba(16,57,112,.08); color:#14335f}'+
      'body.lightBg .tutorialAngleLegendPanel .angleLegendValue{color:#14335f}'+
      'body.lightBg .tutorialAngleLegendPanel .angleLegendMeta, body.lightBg .tutorialAngleLegendPanel .angleLegendEmpty{color:#5979a7}'+
      'body.lightBg .tutorialAngleLegendPanel .angleEditBtn, body.lightBg .partialAtomEditBtn{background:rgba(16,57,112,.08); color:#14335f; border-color:rgba(16,57,112,.12)}'+
      'body.lightBg .tutorialAngleLegendPanel .angleAnswerInput, body.lightBg .partialAtomInput{background:rgba(255,255,255,.9); color:#14335f; border-color:rgba(16,57,112,.18)}'+
      'body.lightBg .partialAtomItem{background:rgba(255,255,255,.88); border-color:rgba(16,57,112,.14)}'+
      'body.lightBg .partialAtomDelta{color:#14335f}'+
      '.practicePanel{margin-top:14px; padding:12px; border-radius:16px; border:1px solid rgba(126,125,255,.20); background:linear-gradient(180deg, rgba(12,19,35,.84), rgba(9,14,26,.78)); box-shadow:0 0 0 1px rgba(78,213,255,.06) inset}'+
      '.practicePanel .ppHead{font-size:13px; font-weight:800; letter-spacing:.02em; color:#eef5ff; margin:0 0 6px}'+
      '.practicePanel .ppSub{font-size:11px; line-height:1.42; color:#b8cdea; margin:0 0 10px}'+
      '.practicePanel .ppRow{display:grid; grid-template-columns:1fr 1fr; gap:8px}'+
      '.practicePanel .ppQuestion{margin-top:10px; padding:9px 10px; border-radius:12px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03)}'+
      '.practicePanel .ppQuestionMeta{font-size:11px; line-height:1.42; color:#dce9ff; margin:0 0 8px}'+
      '.practicePanel .ppQuestionRow{margin-top:0}'+
      '.practicePanel .ppQuestionRowSolo{grid-template-columns:1fr}'+
      '.practicePanel .ppBtns{display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:8px}'+
      '.practicePanel .ppBtns2{grid-template-columns:1fr 1fr 1fr}'+
      '.practicePanel .ppMode{display:flex; align-items:center; gap:8px; font-size:12px; color:#dce9ff; margin:10px 0 8px}'+
      '.practicePanel .ppMode input{width:auto; margin:0; accent-color:#6ea6ff}'+
      '.practicePanel .ppStats{font-size:12px; color:#eef6ff; margin:0 0 4px}'+
      '.practicePanel .ppCount{font-size:11px; color:#9fb3cc; margin:0 0 8px}'+
      '.practicePanel .ppGuess{display:grid; gap:6px; margin-top:8px}'+
      '.practicePanel .ppBondBtn{appearance:none; border:none; width:100%; text-align:left; cursor:pointer; padding:8px 10px; border-radius:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); color:#eef5ff; transition:transform .12s ease, background .18s ease, border-color .18s ease}'+
      '.practicePanel .ppBondBtn:hover{background:rgba(122,125,255,.12); border-color:rgba(122,125,255,.30)}'+
      '.practicePanel .ppBondBtn:active{transform:translateY(1px) scale(.995)}'+
      '.practicePanel .ppBondBtn span{display:block; font-size:10px; color:#a9bdd8; margin-bottom:2px}'+
      '.practicePanel .ppBondBtn b{display:block; font-size:12px; font-weight:800}'+
      '.practicePanel .ppBondBtn.unset b{color:#cdd9ea}'+
      '.practicePanel .ppBondBtn.towardLig b{color:#7fe4ff}'+
      '.practicePanel .ppBondBtn.towardCenter b{color:#ff93d8}'+
      '.practicePanel .ppAnswer{margin-top:8px; padding:9px 10px; border-radius:12px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); font-size:12px; line-height:1.45; color:#e8f1ff}'+
      '.practicePanel .ppAnsHead{font-size:11px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; color:#bcd1ef; margin:0 0 4px}'+
      '.practicePanel .ppMute{font-size:11px; color:#b6c8e7; margin-top:6px}'+
      '.practicePanel .ppWarn{color:#ffd38a; font-weight:700}'+
      '@media (min-width:901px){.app{grid-template-columns:340px 1fr}}'+

      '';
      st.textContent += '/* atlas visual override */'+
        '.practicePanel{margin-top:16px !important; padding:16px !important; background:#111 !important; border:1px solid #262626 !important; border-radius:24px !important; box-shadow:none !important}'+
        '.practicePanel .ppHead{font-size:28px !important; line-height:1.15 !important; font-weight:800 !important; letter-spacing:-.02em !important; color:#fff !important; margin:0 0 10px !important}'+
        '.practicePanel .ppSub{font-size:13px !important; line-height:1.55 !important; color:#d4d4d8 !important; margin:0 0 16px !important}'+
        '.practicePanel .ppRow{gap:10px !important}'+
        '.practicePanel .ppRow label, .practicePanel label{font-size:12px !important; font-weight:600 !important; color:#f3f4f6 !important; margin:0 0 8px !important}'+
        '.practicePanel .ppQuestion,.practicePanel .ppAnswer{margin-top:12px !important; padding:14px !important; border-radius:18px !important; border:1px solid #262626 !important; background:#171717 !important; color:#f5f5f5 !important}'+
        '.practicePanel .ppAnsHead{font-size:12px !important; font-weight:800 !important; letter-spacing:.08em !important; color:#a1a1aa !important; margin:0 0 8px !important}'+
        '.practicePanel .ppQuestionMeta,.practicePanel .ppStats{font-size:14px !important; line-height:1.55 !important; color:#f4f4f5 !important}'+
        '.practicePanel .ppCount,.practicePanel .ppMute{font-size:12px !important; color:#a1a1aa !important}'+
        '.practicePanel .ppBtns{gap:10px !important; margin-top:12px !important}'+
        '.practicePanel .ppBondBtn{padding:12px 14px !important; border-radius:16px !important; background:#18181b !important; border:1px solid #27272a !important; color:#fff !important; box-shadow:none !important}'+
        '.practicePanel .ppBondBtn:hover{background:#232326 !important; border-color:#3f3f46 !important}'+
        '.practicePanel .ppBondBtn span{font-size:11px !important; color:#a1a1aa !important; margin-bottom:4px !important}'+
        '.practicePanel .ppBondBtn b{font-size:14px !important; font-weight:700 !important}'+
        '.practicePanel .ppBondBtn.unset b{color:#f4f4f5 !important}'+
        '.practicePanel .ppBondBtn.towardLig b{color:#67e8f9 !important}'+
        '.practicePanel .ppBondBtn.towardCenter b{color:#f9a8d4 !important}'+
        '.tutorialAngleLegendPanel{top:88px !important; left:28px !important; width:212px !important; min-width:212px !important; max-width:212px !important; max-height:min(252px, calc(100% - 124px)) !important; overflow:auto !important; padding:10px !important; border-radius:18px !important; background:#171717 !important; border:1px solid #262626 !important; color:#fafafa !important; box-shadow:none !important}'+
        '.tutorialAngleLegendPanel .angleLegendHead{margin:0 0 6px !important}'+
        '.tutorialAngleLegendPanel .angleLegendTitle{font-size:10px !important; letter-spacing:.08em !important; color:#f5f5f5 !important}'+
        '.tutorialAngleLegendPanel .angleLegendList{gap:5px !important}'+
        '.tutorialAngleLegendPanel .angleLegendItem{grid-template-columns:14px 8px minmax(0,1fr) auto !important; gap:6px !important; padding:6px 6px !important; border-radius:12px !important; background:#111 !important; border:1px solid #262626 !important; color:#fff !important}'+
        '.tutorialAngleLegendPanel .angleLegendItem input[type="checkbox"]{accent-color:#c084fc !important}'+
        '.tutorialAngleLegendPanel .angleLegendValue{font-size:10px !important; line-height:1.05 !important; color:#fff !important}'+
        '.tutorialAngleLegendPanel .angleLegendMeta{font-size:9px !important; color:#a1a1aa !important}'+
        '.tutorialAngleLegendPanel .angleAnswerWrap{gap:5px !important}'+
        '.tutorialAngleLegendPanel .angleEditBtn{width:24px !important; height:24px !important; border-radius:8px !important; background:#27272a !important; border:1px solid #3f3f46 !important; color:#fafafa !important}.partialAtomEditBtn{width:18px !important; height:18px !important; border-radius:6px !important; background:rgba(39,39,42,.42) !important; border:1px solid rgba(63,63,70,.48) !important; color:#fafafa !important; opacity:.8 !important}'+
        '.tutorialAngleLegendPanel .angleAnswerInput{width:54px !important; min-width:54px !important; padding:5px 4px !important; border-radius:9px !important; border:1px solid #3f3f46 !important; background:#0b1220 !important; color:#fff !important; font-size:10px !important; line-height:1 !important; font-weight:800 !important; letter-spacing:0 !important; overflow:hidden !important}'+
        '.partialAtomItem{padding:1px 3px !important; gap:3px !important; border-radius:8px !important; background:rgba(23,23,23,.36) !important; border:1px solid rgba(38,38,38,.58) !important; color:#fff !important; opacity:.88 !important}'+
        '.partialAtomDelta{font-size:12px !important; color:#fff !important; opacity:.78 !important}'+
        '.partialAtomInput{width:14px !important; height:18px !important; border-radius:6px !important; border:1px solid rgba(63,63,70,.58) !important; background:rgba(11,18,32,.24) !important; color:#fff !important; font-size:12px !important; font-weight:800 !important}'+
        '.polarCalcHud{right:28px !important; bottom:216px !important; background:#171717 !important; border:1px solid #262626 !important; border-radius:18px !important; color:#f5f5f5 !important; box-shadow:none !important}'+
        '.polarCalcHud .k{color:#a1a1aa !important}'+
        '.polarCalcHud .badge.polar{background:rgba(37,99,235,.18) !important; color:#dbeafe !important; border-color:rgba(59,130,246,.35) !important}'+
        '.polarCalcHud .badge.apolar{background:rgba(63,63,70,.55) !important; color:#f5f5f5 !important; border-color:#52525b !important}'+
        '@media (min-width:901px){.app{grid-template-columns:450px 1fr !important}}'+
        '@media (max-width:900px){.tutorialAngleLegendPanel{left:18px !important; top:76px !important; width:min(212px, calc(100% - 36px)) !important; min-width:0 !important; max-width:min(212px, calc(100% - 36px)) !important; max-height:min(250px, calc(100% - 104px)) !important}.polarCalcHud{right:18px !important; bottom:176px !important}}'+
        '.practicePanel select,.practicePanel select option,aside select,aside select option{background:#0b0b0b !important;color:#fff !important;border-color:#27272a !important}'+
        '.axesToggle input,.tutorialAngleLegendPanel .angleLegendItem input[type="checkbox"]{accent-color:#a855f7 !important}'+
        '.axisLabel{transform:translate(calc(-50% + var(--viewer-pad)), calc(-50% + var(--viewer-pad))) !important}';
      document.head.appendChild(st);
  }

  function pills(arr){
    arr = arr||[];
    return arr.map(function(p){ return '<span class="pill">'+esc(p)+'</span>'; }).join('');
  }

  function editIconSVG(){
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20l4.2-.9 9.6-9.6-3.3-3.3-9.6 9.6L4 20z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12.8 5.3l3.3 3.3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  }

  function buildExamplesHTML(step){
    var html='';
    if(step.examples && step.examples.length){
      var first = exampleCatalog[step.examples[0]];
      
      if(stepIdx >= 2 && first){
        html += '<button type="button" class="exInlineBtn" data-ex-key="'+esc(first.key)+'"><b>Exemplo(s):</b> clique para jogar o primeiro exemplo na lousa ('+esc(first.label)+') e use os botões abaixo para comparar.</button>';
      } else {
        html += '<div class="small" style="margin:2px 0 8px; opacity:.92"><b>Exemplo(s):</b></div>';
      }
      html += '<div class="exBtns">'+ step.examples.map(function(k){
        var ex=exampleCatalog[k]; if(!ex) return '';
        return '<button type="button" class="exBtn'+(stepClickedExampleKey===k?' active':'')+'" data-ex-key="'+esc(k)+'">'+esc(ex.label||k)+'</button>';
      }).join('') +'</div>';
      html += '<div class="exHelp">Clique para alternar entre moléculas e comparar o cancelamento (ou reforço) dos vetores.</div>';
    }
        html += '<div class="legendDots">'+
      '<span class="dotItem"><span class="dot" style="background:#4ec7ff"></span>dipolos de ligação</span>'+
      '<span class="dotItem"><span class="dot" style="background:#ffd34d"></span>μ resultante</span>'+
      '<span class="dotItem"><span class="dot" style="background:#5f7dff"></span>nuvem eletrônica (mais densa)</span>'+
    '</div>';
    return html;
  }
  function getCoreBondLen(){
    var ui = apiRef && apiRef.ui;
    if(ui && ui.bondLen) return parseFloat(ui.bondLen.value)||1.55;
    return 1.55;
  }

  function formatAngleValue(deg){
    var n = Math.round((deg||0) * 10) / 10;
    if(Math.abs(n - Math.round(n)) < 0.05) return String(Math.round(n)).replace('.', ',') + '°';
    return n.toFixed(1).replace('.', ',') + '°';
  }

  function anglePaletteAt(i){
    var palette = ['#4cc9f0','#f72585','#ffd166','#06d6a0','#ef476f','#118ab2','#ff9f1c','#8338ec','#8ac926','#ff595e'];
    return palette[((i||0)%palette.length+palette.length)%palette.length];
  }

  function __representativeAnglePairsForGeom(geomKey, ligCount){
    var plans = {
      linear:[[0,1]],
      trigonal_planar:[[0,1],[1,2],[2,0]],
      tetrahedral:[[0,1],[0,2],[0,3]],
      tetra:[[0,1],[0,2],[0,3]],
      trigonal_bipyramidal:[[0,1],[0,3],[3,4]],
      tbp:[[0,1],[0,3],[3,4]],
      octahedral:[[0,2],[0,1],[0,4]],
      oct:[[0,2],[0,1],[0,4]],
      bent_tp:[[0,1]],
      trigonal_pyramidal:[[0,1],[1,2],[2,0]],
      bent_tet:[[0,1]],
      see_saw:[[0,1],[0,2],[2,3]],
      t_shaped:[[0,1],[0,2],[1,2]],
      linear_tbp:[[0,1]],
      square_pyramidal:[[0,2],[0,1],[0,4]],
      square_planar:[[0,2],[0,1]]
    };
    var plan = plans[geomKey] || [];
    var seen = {};
    return plan.filter(function(pair){
      if(!pair || pair.length !== 2) return false;
      var a = pair[0] | 0;
      var b = pair[1] | 0;
      if(a === b || a < 0 || b < 0 || a >= ligCount || b >= ligCount) return false;
      var key = a < b ? a + ':' + b : b + ':' + a;
      if(seen[key]) return false;
      seen[key] = true;
      return true;
    }).map(function(pair){
      return pair[0] < pair[1] ? [pair[0], pair[1]] : [pair[1], pair[0]];
    });
  }

  function computeAngleDescriptors(data){
    if(!data || !data.atoms || data.atoms.length < 3) return [];
    var ligs = data.atoms.slice(1).map(function(atom, idx){
      return { index:idx, pos:atom.pos, dir:vNorm(atom.pos||[0,0,1]), label:atom.label||('L'+(idx+1)) };
    });
    var geomKey = data && data.ex && data.ex.geom ? data.ex.geom : '';
    var plan = __representativeAnglePairsForGeom(geomKey, ligs.length);
    if(!plan.length){
      if(ligs.length === 2) plan = [[0,1]];
      else if(ligs.length === 3) plan = [[0,1],[1,2],[0,2]];
      else plan = [[0,1],[0,2],[0,ligs.length-1]];
    }
    var counts = {};
    var out = [];
    plan.forEach(function(pair, idx){
      var a = ligs[pair[0]];
      var b = ligs[pair[1]];
      if(!a || !b) return;
      var dot = clamp(vDot(a.dir, b.dir), -1, 1);
      var deg = Math.acos(dot) * 180 / Math.PI;
      var valueLabel = formatAngleValue(deg);
      counts[valueLabel] = (counts[valueLabel] || 0) + 1;
      out.push({
        id:'a'+pair[0]+'-'+pair[1],
        i:pair[0],
        j:pair[1],
        deg:deg,
        valueKey:valueLabel,
        valueLabel:valueLabel,
        color:anglePaletteAt(idx),
        duplicateIndex:counts[valueLabel],
        visible:angleVisibility['a'+pair[0]+'-'+pair[1]] !== false
      });
    });
    out.forEach(function(item){
      var repeated = 0;
      for(var i=0;i<out.length;i++) if(out[i].valueLabel === item.valueLabel) repeated++;
      item.displayLabel = repeated > 1 ? (item.valueLabel + ' · ' + item.duplicateIndex) : item.valueLabel;
    });
    return out;
  }


  function ensurePartialAtomUI(){
    if(partialAtomUi) return;
    var host = document.querySelector('main');
    if(!host) return;
    partialAtomUi = document.createElement('div');
    partialAtomUi.className = 'partialAtomOverlay hide';
    partialAtomUi.id = 'partialAtomOverlay';
    host.appendChild(partialAtomUi);
    partialAtomUi.addEventListener('change', function(ev){
      var partial = ev.target && ev.target.closest ? ev.target.closest('input[data-partial-slot]') : null;
      if(!partial) return;
      var pidx = parseInt(partial.getAttribute('data-partial-slot'), 10);
      if(isNaN(pidx)) return;
      if(!practiceState.partialGuesses) practiceState.partialGuesses = [];
      var clean = __sanitizePartialGuess(partial.value || '');
      practiceState.partialGuesses[pidx] = clean;
      partial.value = clean;
      practiceState.feedback = '';
      practiceState.checked = false;
      partialAtomCache.signature = '';
      renderPracticeAnswerBox();
    });
    partialAtomUi.addEventListener('input', function(ev){
      var partial = ev.target && ev.target.closest ? ev.target.closest('input[data-partial-slot]') : null;
      if(partial) partial.value = __sanitizePartialGuess(partial.value || '');
    });
    partialAtomUi.addEventListener('click', function(ev){
      var btn = ev.target && ev.target.closest ? ev.target.closest('.partialAtomEditBtn[data-partial-slot]') : null;
      if(!btn) return;
      var pidx = btn.getAttribute('data-partial-slot');
      var input = partialAtomUi.querySelector('input[data-partial-slot="' + pidx + '"]');
      if(input){ input.focus(); input.select(); }
    });
  }

  function ensureAngleOptionsUI(){
    if(angleEls.box) return;
    var host = document.querySelector('main');
    if(!host) return;
    var box = document.createElement('div');
    box.className = 'tutorialAngleLegendPanel hide';
    box.id = 'tutorialAngleLegendPanel';
    box.innerHTML = '<div class="angleLegendHead"><div class="angleLegendTitle">ÂNGULOS</div></div><div class="angleLegendList" id="angleRows"></div>';
    host.appendChild(box);
    angleEls.box = box;
    angleEls.list = box.querySelector('#angleRows');
    angleEls.partialList = null;
    angleEls.partialHead = null;
    box.addEventListener('change', function(ev){
      var toggle = ev.target && ev.target.closest ? ev.target.closest('input[data-angle-id]') : null;
      if(toggle){
        var angleId = toggle.getAttribute('data-angle-id');
        if(__practiceIsActive()) __setPracticeAngleVisible(angleId, !!toggle.checked, exampleCatalog[practiceState.currentKey] || null);
        else angleVisibility[angleId] = !!toggle.checked;
        angleRenderCache.signature = '';
        return;
      }
      var answer = ev.target && ev.target.closest ? ev.target.closest('input[data-angle-slot]') : null;
      if(answer){
        var idx = parseInt(answer.getAttribute('data-angle-slot'), 10);
        if(!isNaN(idx)){
          if(!practiceState.angleGuesses) practiceState.angleGuesses = [];
          practiceState.angleGuesses[idx] = answer.value || '';
          practiceState.feedback = '';
          practiceState.checked = false;
          angleRenderCache.signature = '';
          renderPracticeAnswerBox();
        }
      }
    });
    box.addEventListener('click', function(ev){
      var editBtn = ev.target && ev.target.closest ? ev.target.closest('.angleEditBtn[data-angle-slot]') : null;
      if(!editBtn) return;
      var idx = editBtn.getAttribute('data-angle-slot');
      var input = box.querySelector('input[data-angle-slot="' + idx + '"]');
      if(input){ input.focus(); input.select(); }
    });
    ensurePartialAtomUI();
  }

  function renderPartialAtomUI(projAtoms, data, can, practiceActive){
    ensurePartialAtomUI();
    if(!partialAtomUi) return;
    if(!practiceActive){
      partialAtomUi.classList.add('hide');
      partialAtomUi.innerHTML = '';
      partialAtomCache.signature = '';
      return;
    }
    var ex = data && data.ex ? data.ex : (exampleCatalog[practiceState.currentKey] || exampleCatalog[activeExampleKey]);
    var slots = __practicePartialSlots(ex, data);
    if(!slots.length){
      partialAtomUi.classList.add('hide');
      partialAtomUi.innerHTML = '';
      partialAtomCache.signature = '';
      return;
    }
    var signature = slots.map(function(item, idx){
      var shown = practiceState.revealed ? item.correct : (item.guess || '');
      return item.id + ':' + idx + ':' + shown;
    }).join('|') + '|revealed=' + (practiceState.revealed ? 1 : 0);
    if(signature !== partialAtomCache.signature){
      partialAtomUi.innerHTML = slots.map(function(item, idx){
        var shown = practiceState.revealed ? item.correct : (item.guess || '');
        return '<div class="partialAtomItem" data-partial-item="' + idx + '" aria-label="Polaridade parcial do átomo ' + esc(item.prompt) + '"><span class="partialAtomDelta">δ</span><input class="partialAtomInput" id="partialAtomInput_' + esc(item.id || ('slot_' + idx)) + '" name="partialAtomInput_' + esc(item.id || ('slot_' + idx)) + '" maxlength="1" data-partial-slot="' + idx + '" value="' + esc(shown) + '" placeholder="" inputmode="text" /><button type="button" class="partialAtomEditBtn" data-partial-slot="' + idx + '" aria-label="Editar polaridade parcial">' + editIconSVG() + '</button></div>';
      }).join('');
      partialAtomCache.signature = signature;
    }
    partialAtomUi.classList.remove('hide');
    var nodes = partialAtomUi.querySelectorAll('.partialAtomItem');
    Array.prototype.forEach.call(nodes, function(node, idx){
      var item = slots[idx] || null;
      var atomIndex = item && item.atomIndex != null ? item.atomIndex : (idx + 1);
      var it = projAtoms[atomIndex];
      if(!it || !it.p){ node.style.display = 'none'; return; }
      var edge = atomIndex === 0 ? 26 : 20;
      var topPad = atomIndex === 0 ? 30 : 24;
      var yOffset = atomIndex === 0 ? 34 : 24;
      var px = Math.max(edge, Math.min((can && can.w ? can.w : 9999) - edge, it.p.x));
      var py = Math.max(topPad, Math.min((can && can.h ? can.h : 9999) - 14, it.p.y - yOffset));
      node.style.display = 'flex';
      node.style.left = px + 'px';
      node.style.top = py + 'px';
    });
  }

  function __practiceAngleItemsFromData(data){
    var ex = data && data.ex ? data.ex : (exampleCatalog[practiceState.currentKey] || exampleCatalog[activeExampleKey]);
    var slots = __practiceAngleSlots(ex, data);
    return slots.map(function(slot, idx){
      return {
        id:slot.id,
        i:slot.i != null ? slot.i : 0,
        j:slot.j != null ? slot.j : 1,
        deg:isFinite(slot.target) ? slot.target : 0,
        color:slot.color,
        visible:slot.visible,
        expectedLabel:slot.token,
        displayLabel:practiceState.revealed ? slot.token : slot.varLabel,
        overlayLabel:practiceState.revealed ? slot.token : slot.varLabel,
        meta:practiceState.revealed ? ('Resposta correta · ' + slot.varName) : ('Responda ' + slot.varName),
        prompt:slot.prompt,
        guess:slot.guess || '',
        placeholder:slot.placeholder || 'x°'
      };
    });
  }

  function syncAngleOptionsUI(data, enabled){
    ensureAngleOptionsUI();
    if(!angleEls.box || !angleEls.list) return [];
    var practiceItems = __practiceIsActive() ? __practiceAngleItemsFromData(data) : null;
    var items = practiceItems || computeAngleDescriptors(data);
    var titleNode = angleEls.box.querySelector('.angleLegendTitle');
    if(titleNode) titleNode.textContent = practiceItems ? ('ÂNGULOS · ' + items.length) : 'ÂNGULOS';
    var signature = items.map(function(item){ return item.id + ':' + (item.displayLabel || item.valueLabel || '') + ':' + (item.visible ? 1 : 0) + ':' + item.color + ':' + (item.guess || ''); }).join('|') + '|revealed=' + (practiceState.revealed ? 1 : 0);
    if(signature !== angleRenderCache.signature){
      angleEls.list.innerHTML = items.map(function(item, idx){
        if(practiceItems){
          return '<div class="angleLegendItem angleLegendItemPractice">'
            + '<input type="checkbox" id="angleToggle_'+ esc(item.id) +'" name="angleToggle_'+ esc(item.id) +'" data-angle-id="'+ item.id +'"'+(item.visible ? ' checked' : '')+' />'
            + '<span class="angleLegendSwatch" style="background:'+ item.color +'"></span>'
            + '<span class="angleLegendText"><span class="angleLegendValue" style="color:'+ item.color +'">'+ esc(item.displayLabel) +'</span><span class="angleLegendMeta">'+ esc(item.prompt) +'</span></span>'
            + '<span class="angleAnswerWrap"><button type="button" class="angleEditBtn" data-angle-slot="'+ idx +'" aria-label="Editar ângulo">' + editIconSVG() + '</button><input class="angleAnswerInput" id="angleAnswer_'+ esc(item.id) +'" name="angleAnswer_'+ esc(item.id) +'" maxlength="6" data-angle-slot="'+ idx +'" value="'+ esc(item.guess || '') +'" placeholder="'+ esc(item.placeholder || item.displayLabel || 'x°') +'" inputmode="decimal" /></span>'
            + '</div>';
        }
        return '<label class="angleLegendItem"><input type="checkbox" id="angleToggle_'+ esc(item.id) +'" name="angleToggle_'+ esc(item.id) +'" data-angle-id="'+ item.id +'"'+(item.visible ? ' checked' : '')+' /><span class="angleLegendSwatch" style="background:'+ item.color +'"></span><span class="angleLegendText"><span class="angleLegendValue">'+ item.displayLabel +'</span><span class="angleLegendMeta">Ocultar este ângulo</span></span></label>';
      }).join('');
      angleRenderCache.signature = signature;
    }
    var shouldShowPanel = !!(items.length && (practiceItems ? true : enabled));
    angleEls.box.classList.toggle('hide', !shouldShowPanel);
    angleRenderCache.items = items;
    angleRenderCache.enabled = !!enabled;
    return items;
  }

  function __angleHexToRgb(hex){
    var safe = String(hex || '#4cc9f0').trim();
    if(safe.charAt(0) === '#') safe = safe.slice(1);
    if(safe.length === 3) safe = safe.replace(/(.)/g, '$1$1');
    var num = parseInt(safe, 16);
    if(!isFinite(num)) return {r:76,g:201,b:240};
    return { r:(num >> 16) & 255, g:(num >> 8) & 255, b:num & 255 };
  }

  function __angleRgba(hex, alpha){
    var rgb = __angleHexToRgb(hex);
    return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')';
  }

  function __normalizeSignedAngle(a){
    while(a > Math.PI) a -= Math.PI * 2;
    while(a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  function drawAngleChip(ctx, x, y, text, color){
    if(!ctx) return;
    var accent = color || '#4cc9f0';
    ctx.save();
    ctx.font = '700 10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var padX = 7;
    var padY = 4;
    var tw = ctx.measureText(text).width;
    var w = tw + padX * 2;
    var h = 18;
    var r = 9;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.5 + r, y - h * 0.5);
    ctx.arcTo(x + w * 0.5, y - h * 0.5, x + w * 0.5, y + h * 0.5, r);
    ctx.arcTo(x + w * 0.5, y + h * 0.5, x - w * 0.5, y + h * 0.5, r);
    ctx.arcTo(x - w * 0.5, y + h * 0.5, x - w * 0.5, y - h * 0.5, r);
    ctx.arcTo(x - w * 0.5, y - h * 0.5, x + w * 0.5, y - h * 0.5, r);
    ctx.closePath();
    ctx.fillStyle = 'rgba(7,12,22,.74)';
    ctx.strokeStyle = __angleRgba(accent, .94);
    ctx.lineWidth = 1.2;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f4f9ff';
    ctx.fillText(text, x, y + 0.5);
    ctx.restore();
  }

  function drawAngleOverlay(ctx, data, view, can){
    if(!ctx||!data||!view||!can) return;
    var practiceActive = __practiceIsActive();
    var masterAnglesOn = !!(showAngles && showAngles.checked) && (practiceActive || !!visualState.angles);
    var items = syncAngleOptionsUI(data, masterAnglesOn);
    if(!masterAnglesOn || !items.length || !data.atoms || !data.atoms.length) return;
    var center = projectPoint([0,0,0], view, can);
    if(!center || !isFinite(center.x) || !isFinite(center.y)) return;
    var ligPts = data.atoms.slice(1).map(function(atom){ return projectPoint(atom.pos, view, can); });
    var visibleItems = items.filter(function(item){ return item.visible !== false && ligPts[item.i] && ligPts[item.j]; });
    if(!visibleItems.length) return;

    ctx.save();
    ctx.lineWidth = 1.7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    visibleItems.forEach(function(item, idx){
      var accent = item.color || anglePaletteAt(idx);
      ctx.strokeStyle = __angleRgba(accent, .94);
      var pa = ligPts[item.i];
      var pb = ligPts[item.j];
      if(!pa || !pb || !isFinite(pa.x) || !isFinite(pa.y) || !isFinite(pb.x) || !isFinite(pb.y)) return;
      var va = [pa.x - center.x, pa.y - center.y];
      var vb = [pb.x - center.x, pb.y - center.y];
      var la = Math.hypot(va[0], va[1]);
      var lb = Math.hypot(vb[0], vb[1]);
      if(la < 14 || lb < 14) return;

      var ang1 = Math.atan2(va[1], va[0]);
      var diff = __normalizeSignedAngle(Math.atan2(vb[1], vb[0]) - ang1);
      if(Math.abs(diff) < 0.10) return;

      var available = Math.min(la, lb) - 16;
      var radius = clamp(Math.min(la, lb) * 0.34 + idx * 10, 18, Math.max(18, Math.min(available, 74)));
      var endAng = ang1 + diff;

      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, ang1, endAng, diff < 0);
      ctx.stroke();

      var sx1 = center.x + Math.cos(ang1) * (radius - 6);
      var sy1 = center.y + Math.sin(ang1) * (radius - 6);
      var ex1 = center.x + Math.cos(ang1) * (radius + 6);
      var ey1 = center.y + Math.sin(ang1) * (radius + 6);
      var sx2 = center.x + Math.cos(endAng) * (radius - 6);
      var sy2 = center.y + Math.sin(endAng) * (radius - 6);
      var ex2 = center.x + Math.cos(endAng) * (radius + 6);
      var ey2 = center.y + Math.sin(endAng) * (radius + 6);
      ctx.beginPath();
      ctx.moveTo(sx1, sy1); ctx.lineTo(ex1, ey1);
      ctx.moveTo(sx2, sy2); ctx.lineTo(ex2, ey2);
      ctx.stroke();

      var mid = ang1 + diff * 0.5;
      var labelRadius = radius + 15 + (idx % 2) * 4;
      drawAngleChip(ctx, center.x + Math.cos(mid) * labelRadius, center.y + Math.sin(mid) * labelRadius, item.overlayLabel || item.displayLabel || item.valueLabel || '?', accent);
    });

    ctx.restore();
  }

  function getWorldDataForExample(ex){
    var G = geomPositions(ex.geom);
    var bl = getCoreBondLen();
    var center = [0,0,0];
    var atoms = [{label:ex.center, role:'center', pos:center}];
    for(var i=0;i<G.lig.length;i++){
      atoms.push({label: ex.ligands[i] || 'X', role:'lig', pos:vMul(G.lig[i], bl), dir:G.lig[i]});
    }
    var rCenter = __elementRadiusWorld(ex.center, 'center');
    var lpHalf = rCenter * 0.50;
    var lpRadial = lpHalf * 0.68;
    var lpDist = rCenter + lpRadial * 0.98;
    var lps = (G.lp||[]).map(function(d){ return {dir:d, pos:vMul(d, lpDist), size:lpHalf, radial:lpRadial}; });
    var bondDipoles=[];
    var sum=[0,0,0];
    for(var j=0;j<G.lig.length;j++){
      var dir = G.lig[j];
      var mu = (ex.ligandMu && ex.ligandMu[j] != null) ? ex.ligandMu[j] : (ex.muBond || 1.0);
      var sign = (ex.ligandSigns && ex.ligandSigns[j] != null) ? (ex.ligandSigns[j] < 0 ? -1 : 1) : ((ex.sign||1) < 0 ? -1 : 1);
      var dvec = vMul(dir, mu * sign); 
      
      var anchor = vMul(dir, bl*0.52);
      bondDipoles.push({anchor:anchor, vec:dvec, dir:dir, mu:mu, sign:sign});
      sum = vAdd(sum, dvec);
    }
    return { ex:ex, geom:G, atoms:atoms, lps:lps, bondDipoles:bondDipoles, muR:sum, muMag:vLen(sum), bondLen:bl };
  }

  function setExampleColors(ex){
    var ui = apiRef.ui;
    if(ui.coreColor) ui.coreColor.value = ex.centerColor || '#bca96a';
    if(ui.ligandColor) ui.ligandColor.value = ex.ligandColor || '#8fd6ff';
    if(ui.lpColor) ui.lpColor.value = ex.lpColor || '#1100ff';
    if(ui.lpScale){ ui.lpScale.value = (ex.geom==='bent_tet'||ex.geom==='trigonal_pyramidal'||ex.geom==='bent_tp') ? '1.9' : '1.6'; }
  }

  async function setExample(key, opts){
    var ex = exampleCatalog[key]; if(!ex || !apiRef) return;
    activeExampleKey = key;
    if(opts && opts.userClick) stepClickedExampleKey = key;
    playing = false;
    window.__geomPracticeRenderData = {
      key: ex.key,
      geom: ex.geom,
      center: ex.center,
      centerColor: ex.centerColor || __colorForElement(ex.center),
      ligands: (ex.ligands||[]).slice(),
      ligandColors: (ex.ligands||[]).map(function(l){ return __colorForElement(l); })
    };
    setExampleColors(ex);
    apiRef.setBoardSplit && apiRef.setBoardSplit(false);
    apiRef.clearBalloons && apiRef.clearBalloons();
    apiRef.setGeom(ex.geom);
    apiRef.sync();
    if(el.examples){ el.examples.innerHTML = buildExamplesHTML(steps[stepIdx]); }
    if(opts && opts.cam && ex.view){ try{ await apiRef.animateTo(ex.view, 800); }catch(_e){} }
  }


  function ensureMapOptionsUI(){
    if(mapEls.box) return;
    var host = el.card || document.getElementById('tutorialCard');
    if(!host) return;
    var note = document.getElementById('tutorialNote');
    var examples = document.getElementById('tutorialExamples');
    var box = document.createElement('div');
    box.className = 'mapOptionBox';
    box.id = 'polarMapOptions';
    box.innerHTML = ''+
      '<div class="mapTitle">Mapas de visualização (overlay)</div>'+
      '<label class="mapChk"><input type="checkbox" id="chkMapDensity"><span><b>Mostrar mapa de densidade eletrônica</b><small>superfície/nuvem qualitativa (onde há maior probabilidade de encontrar elétrons)</small></span></label>'+
      '<label class="mapChk"><input type="checkbox" id="chkMapESP"><span><b>Mostrar mapa de potencial eletrostático</b><small>volume 3D colorido: vermelho = mais eletrorrico, azul = mais eletropobre, verde/amarelo = intermediário</small></span></label>'+
      '<div class="mapHelp" style="display:none"></div>';
    if(note && note.parentNode){ note.parentNode.insertBefore(box, examples || note.nextSibling); }
    else host.appendChild(box);
    mapEls.box = box;
    mapEls.density = box.querySelector('#chkMapDensity');
    mapEls.esp = box.querySelector('#chkMapESP');
    [mapEls.density, mapEls.esp].forEach(function(inp){ if(!inp) return; inp.addEventListener('change', function(){
      visualState.mapDensity = !!(mapEls.density && mapEls.density.checked);
      visualState.mapESP = !!(mapEls.esp && mapEls.esp.checked);
    });});
    syncMapOptionsUI();
    syncAngleOptionsUI(moleculeVisualData(), !!(visualState.angles && showAngles && showAngles.checked));
  }

  function syncMapOptionsUI(){
    if(!mapEls.box) return;
    if(mapEls.density) mapEls.density.checked = !!visualState.mapDensity;
    if(mapEls.esp) mapEls.esp.checked = !!visualState.mapESP;
  }

  function updateButtons(){
    if(!el.prev) return;
    el.prev.disabled = applying || stepIdx===0;
    if(el.next) el.next.disabled = applying;
    if(el.restart) el.restart.disabled = applying;
    if(el.play){
      el.play.disabled = applying;
      el.play.textContent = playing ? '⏸ Auto' : '▶ Auto';
    }
    if(el.next) el.next.textContent = stepIdx === steps.length-1 ? 'Concluir ✓' : 'Próximo ▶';
  }

  function setFade(on){ if(el.card) el.card.classList.toggle('fadeStep', !!on); }

  function renderStep(){
    stepClickedExampleKey = null;
    var s = steps[stepIdx];
    visualState = Object.assign({bond:true,result:true,cloud:true,calc:false,deltas:true,angles:true,mapDensity:false,mapESP:false,pizza:false}, s.viz||{});
    
    visualState.result = true;
    
    visualState.angles = !s.onlyVectors;
    
    visualState.mapESP = false;
    if(s.onlyVectors){
      visualState.cloud = false;
      visualState.deltas = false;
      visualState.mapDensity = false;
      visualState.mapESP = false;
      visualState.pizza = false;
    }
    syncMapOptionsUI();
    el.tag.textContent = 'Passo ' + (stepIdx+1) + ' / ' + steps.length;
    el.title.innerHTML = s.title;
    el.body.innerHTML = s.body;
    el.note.innerHTML = s.note || '';
    el.mini.innerHTML = pills(s.pills);
    el.examples.innerHTML = buildExamplesHTML(s);
    el.examples.style.display = '';
    el.prog.style.width = (((stepIdx+1)/steps.length)*100).toFixed(2)+'%';
    updateButtons();
    }

  async function applyStep(i){
    stepIdx = clamp(i, 0, steps.length-1);
    var my = ++token;
    applying = true; updateButtons(); setFade(true); renderStep();
    await sleep(80); setFade(false);
    try{ if(steps[stepIdx].run) await steps[stepIdx].run(apiRef); }catch(e){ console.error(e); }
    if(my !== token) return;
    applying = false; updateButtons();
    }
  async function next(){ if(applying) return; if(stepIdx>=steps.length-1){ playing=false; updateButtons(); return; } await applyStep(stepIdx+1); }
  async function prev(){ if(applying||stepIdx<=0) return; await applyStep(stepIdx-1); }
  async function restart(){ playing=false; token++; await applyStep(0); }
  async function autoplay(){
    if(playing){ playing=false; updateButtons(); return; }
    playing=true; updateButtons();
    while(playing && stepIdx < steps.length-1){ if(applying){ await sleep(120); continue; } await sleep(2700); if(!playing) break; await next(); }
    playing=false; updateButtons();
  }

  function getCanvasAndCtx(){
    var glCanvas = document.getElementById('gl');
    if(!glCanvas) return null;
    if(!overlay){
      overlay = document.createElement('canvas');
      overlay.className='polarOverlay';
      overlay.id='polarOverlay';
      glCanvas.parentElement.appendChild(overlay);
      octx = overlay.getContext('2d');
}
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio||1));
    var w = glCanvas.clientWidth||1, h = glCanvas.clientHeight||1;
    if(overlay.width !== Math.round(w*dpr) || overlay.height !== Math.round(h*dpr)){
      overlay.width = Math.round(w*dpr); overlay.height = Math.round(h*dpr);
    }
    overlay.style.width = w+'px'; overlay.style.height = h+'px';
    octx.setTransform(dpr,0,0,dpr,0,0);
    return {glCanvas:glCanvas, w:w, h:h, dpr:dpr};
  }

  
  function __projectViaViewer(world){
    if(apiRef && typeof apiRef.projectWorld === 'function'){
      try{
        var p = apiRef.projectWorld(world);
        if(p && isFinite(p.x) && isFinite(p.y)) return { x:p.x, y:p.y, z:isFinite(p.z) ? p.z : 0, scale:p.scale };
      }catch(_e){}
    }
    return null;
  }

  function rotateXYZJS(p, view){
    var DEG_LOCAL = Math.PI/180;
    var rx=((view&&('objRotXDeg' in view))? (view.objRotXDeg||0):0)*DEG_LOCAL;
    var ry=((view&&('objRotYDeg' in view))? (view.objRotYDeg||0):0)*DEG_LOCAL;
    var rz=((view&&('objRotZDeg' in view))? (view.objRotZDeg||0):0)*DEG_LOCAL;
    if(!rx && !ry && !rz) return p;
    var x=p[0], y=p[1], z=p[2];
    var cx=Math.cos(rx), sx=Math.sin(rx);
    var y1=cx*y - sx*z, z1=sx*y + cx*z; y=y1; z=z1;
    var cy=Math.cos(ry), sy=Math.sin(ry);
    var x2=cy*x + sy*z, z2=-sy*x + cy*z; x=x2; z=z2;
    var cz=Math.cos(rz), sz=Math.sin(rz);
    var x3=cz*x - sz*y, y3=sz*x + cz*y; x=x3; y=y3;
    return [x,y,z];
  }

  function getCameraBasisJS(view){
    var ex=view.camDist*Math.cos(view.rotX)*Math.sin(view.rotY);
    var ey=view.camDist*Math.sin(view.rotX);
    var ez=view.camDist*Math.cos(view.rotX)*Math.cos(view.rotY);
    var eye=[ex,ey,ez];
    var f=vNorm([-ex,-ey,-ez]);
    var r=vNorm([Math.cos(view.rotY),0,-Math.sin(view.rotY)]);
    if(!isFinite(r[0])||!isFinite(r[1])||!isFinite(r[2])||vLen(r)<1e-6) r=[1,0,0];
    var u=vCross(r,f);
    if(!isFinite(u[0])||!isFinite(u[1])||!isFinite(u[2])||vLen(u)<1e-6) u=[0,1,0];
    else u=vNorm(u);
    r=vCross(f,u);
    if(!isFinite(r[0])||!isFinite(r[1])||!isFinite(r[2])||vLen(r)<1e-6) r=[1,0,0];
    else r=vNorm(r);
    return {eye:eye,f:f,r:r,u:u};
  }

function projectPoint(world, view, size){
    var viewerP = __projectViaViewer(world);
    if(viewerP) return viewerP;
    world = rotateXYZJS(world, view);
    var basis=getCameraBasisJS(view);
    var eye=basis.eye, f=basis.f, r=basis.r, u=basis.u;
    var q=vSub(world, eye);
    var cx=vDot(q, r), cy=vDot(q, u), cz=vDot(q, f);
    if(cz <= -0.15) return null;
    if(cz < 0.05) cz = 0.05;
    var aspect = (size.w||1)/(size.h||1);
    var fov = 1.2;
    var t = Math.tan(fov*0.5);
    var ndcX = cx/(cz*t*aspect);
    var ndcY = cy/(cz*t);
    if(!isFinite(ndcX)||!isFinite(ndcY)) return null;
    return { x:(ndcX*0.5+0.5)*(size.w||1), y:(-ndcY*0.5+0.5)*(size.h||1), z:cz };
  }

  function projectPointOrtho(world, view, size){
    return projectPoint(world, view, size);
  }

  function projectVectorPoint(world, view, size){
    return projectPoint(world, view, size);
  }

  function drawArrow(ctx, a, b, color, width, glow){
    if(!a||!b) return;
    ctx.save();
    ctx.strokeStyle=color; ctx.lineWidth=width||2; ctx.lineCap='round'; ctx.lineJoin='round';
    if(glow){ ctx.shadowColor=color; ctx.shadowBlur=glow; }
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    var dx=b.x-a.x, dy=b.y-a.y; var L=Math.hypot(dx,dy)||1; dx/=L; dy/=L;
    var ah = 8 + (width||2)*1.3;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - dx*ah - dy*ah*0.55, b.y - dy*ah + dx*ah*0.55);
    ctx.lineTo(b.x - dx*ah + dy*ah*0.55, b.y - dy*ah - dx*ah*0.55);
    ctx.closePath();
    ctx.fillStyle=color; if(glow){ ctx.shadowColor=color; ctx.shadowBlur=glow; } ctx.fill();
    ctx.restore();
  }

  function drawCloudBlob(ctx, x, y, rx, ry, color, alpha, angle){
    ctx.save();
    ctx.translate(x,y); if(angle) ctx.rotate(angle);
    var g = ctx.createRadialGradient(0,0,Math.min(rx,ry)*0.1, 0,0,Math.max(rx,ry));
    g.addColorStop(0, 'rgba('+color[0]+','+color[1]+','+color[2]+','+(alpha||0.18)+')');
    g.addColorStop(0.55, 'rgba('+color[0]+','+color[1]+','+color[2]+','+((alpha||0.18)*0.55)+')');
    g.addColorStop(1, 'rgba('+color[0]+','+color[1]+','+color[2]+',0)');
    ctx.fillStyle=g;
    ctx.beginPath();
    if(ctx.ellipse) ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2); else { ctx.arc(0,0,Math.max(rx,ry),0,Math.PI*2); }
    ctx.fill();
    ctx.restore();
  }

  function drawTextLabel(ctx, p, text, color){
    if(!p) return;
    ctx.save();
    ctx.font='700 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var pad=4, w=ctx.measureText(text).width + pad*2;
    ctx.fillStyle='rgba(4,8,14,.70)';
    ctx.strokeStyle='rgba(255,255,255,.08)';
    ctx.lineWidth=1;
    var x=p.x-w/2, y=p.y-10;
    ctx.beginPath(); if(ctx.roundRect){ ctx.roundRect(x,y-10,w,20,10); } else { ctx.rect(x,y-10,w,20); }
    ctx.fill(); ctx.stroke();
    ctx.fillStyle=color||'#fff';
    ctx.textBaseline='middle'; ctx.fillText(text, x+pad, y);
    ctx.restore();
  }

  function drawAngleArc(ctx, c, p1, p2, label){
    if(!c||!p1||!p2) return;
    var a1=Math.atan2(p1.y-c.y,p1.x-c.x), a2=Math.atan2(p2.y-c.y,p2.x-c.x);
    var da = a2-a1; while(da>Math.PI) da-=2*Math.PI; while(da<-Math.PI) da+=2*Math.PI;
    var d1=Math.hypot(p1.x-c.x,p1.y-c.y), d2=Math.hypot(p2.x-c.x,p2.y-c.y);
    var baseR=Math.max(72, Math.min(170, Math.max(d1,d2)+28));
    var labTxt = String(label||'');
    var is180 = /^\s*180/.test(labTxt);

    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,.72)';
    ctx.lineWidth=1.4;
    if(ctx.setLineDash) ctx.setLineDash([8,6]);

    if(is180){
      
      ctx.beginPath();
      ctx.arc(c.x,c.y,baseR,Math.PI*1.02,Math.PI*1.98,false); 
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c.x,c.y,baseR,0.02*Math.PI,0.98*Math.PI,false); 
      ctx.stroke();
      if(ctx.setLineDash) ctx.setLineDash([]);
      drawTextLabel(ctx,{x:c.x, y:c.y-baseR-16}, labTxt, '#ffffff');
      drawTextLabel(ctx,{x:c.x, y:c.y+baseR+16}, labTxt, '#ffffff');
    }else{
      
      var start=a1, end=a1+da;
      ctx.beginPath();
      ctx.arc(c.x,c.y,baseR,start,end,da<0);
      ctx.stroke();
      
      if(ctx.setLineDash) ctx.setLineDash([4,5]);
      var u1={x:(p1.x-c.x)/(d1||1), y:(p1.y-c.y)/(d1||1)};
      var u2={x:(p2.x-c.x)/(d2||1), y:(p2.y-c.y)/(d2||1)};
      ctx.beginPath();
      ctx.moveTo(c.x+u1.x*(Math.min(d1,baseR-6)), c.y+u1.y*(Math.min(d1,baseR-6)));
      ctx.lineTo(c.x+u1.x*baseR, c.y+u1.y*baseR);
      ctx.moveTo(c.x+u2.x*(Math.min(d2,baseR-6)), c.y+u2.y*(Math.min(d2,baseR-6)));
      ctx.lineTo(c.x+u2.x*baseR, c.y+u2.y*baseR);
      ctx.stroke();
      if(ctx.setLineDash) ctx.setLineDash([]);
      var am = a1 + da/2;
      drawTextLabel(ctx,{x:c.x+Math.cos(am)*(baseR+16), y:c.y+Math.sin(am)*(baseR+16)}, labTxt, '#ffffff');
    }
    ctx.restore();
  }


function __anglePanelBase(ctx, x, y, w, h, title){
  ctx.save();
  ctx.fillStyle='rgba(7,11,18,.74)';
  ctx.strokeStyle='rgba(255,255,255,.12)';
  ctx.lineWidth=1;
  ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(x,y,w,h,14); else ctx.rect(x,y,w,h);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle='rgba(236,244,255,.95)';
  ctx.font='700 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText(title||'', x+12, y+18);
  ctx.restore();
}

function __angleDrawAtom(ctx, x, y, r, fill, stroke){
  ctx.save();
  var g=ctx.createRadialGradient(x-r*0.35,y-r*0.35,1, x,y,r*1.05);
  g.addColorStop(0,'rgba(255,255,255,.75)');
  g.addColorStop(0.25, fill);
  g.addColorStop(1,'rgba(0,0,0,.18)');
  ctx.fillStyle=g;
  ctx.strokeStyle=stroke||'rgba(255,255,255,.18)';
  ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function __angleDrawBond(ctx, a, b){
  ctx.save();
  ctx.strokeStyle='rgba(168,255,211,.95)';
  ctx.lineWidth=4;
  ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  ctx.restore();
}

function __angleClampLabelPos(ctx, x, y, txt){
  var b = ctx && ctx.__angleBounds;
  if(!b) return {x:x,y:y};
  var pad = 8;
  var mw = (ctx.measureText ? ctx.measureText(String(txt||'')).width : 28);
  return {
    x: Math.max(b.x+pad+mw*0.5, Math.min(b.x+b.w-pad-mw*0.5, x)),
    y: Math.max(b.y+16, Math.min(b.y+b.h-8, y))
  };
}

function __angleArcLabel(ctx, c, p1, p2, label, rOverride){
  if(!c||!p1||!p2) return;
  var a1=Math.atan2(p1.y-c.y,p1.x-c.x), a2=Math.atan2(p2.y-c.y,p2.x-c.x);
  var da = a2-a1; while(da>Math.PI) da-=2*Math.PI; while(da<-Math.PI) da+=2*Math.PI;
  var rr = rOverride || Math.max(26, Math.min(44, Math.min(Math.hypot(p1.x-c.x,p1.y-c.y), Math.hypot(p2.x-c.x,p2.y-c.y))*0.60));
  ctx.save();
  ctx.strokeStyle='rgba(255,88,88,.95)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(c.x,c.y,rr,a1,a1+da,da<0);
  ctx.stroke();
  var am=a1+da*0.5;
  ctx.fillStyle='rgba(255,255,255,.98)';
  ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  var tx=c.x+Math.cos(am)*(rr+15), ty=c.y+Math.sin(am)*(rr+4);
  var cl=__angleClampLabelPos(ctx, tx, ty, label);
  ctx.fillText(label, cl.x-ctx.measureText(label).width*0.5, cl.y);
  ctx.restore();
}

function __angleArc180(ctx, c, left, right, label){
  var rr = Math.max(34, Math.abs(right.x-left.x)*0.30);
  ctx.save();
  ctx.strokeStyle='rgba(255,88,88,.95)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(c.x,c.y,rr,Math.PI,0,false);
  ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.98)';
  ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  var pTop=__angleClampLabelPos(ctx, c.x, c.y-rr-6, label);
  ctx.fillText(label, pTop.x-ctx.measureText(label).width*0.5, pTop.y);
  ctx.restore();
}


function drawAngleSchematic(ctx, data, can){
  if(!ctx||!data||!can) return;
  var DEG = Math.PI/180;
  var w=Math.min(408, Math.max(292, can.w*0.36));
  var h=(can.h < 500)?170:206;
  var x=can.w - w - 16;
  var y=(can.h < 500)?10:16;
  ctx.__angleBounds = {x:x, y:y, w:w, h:h};
  __anglePanelBase(ctx, x, y, w, h, '');

  var cx=x+w*0.52, cy=y+h*0.55;
  var center={x:cx,y:cy}, centerR=12, ligR=9;
  var exGeom = (data.ex && data.ex.geom) ? String(data.ex.geom) : '';
  var arr=(data.geom && data.geom.arr) ? String(data.geom.arr) : '';
  var angleLbl = (data.geom && data.geom.angle) ? String(data.geom.angle) : 'θ';
  function P(dx,dy){ return {x:cx+dx, y:cy+dy}; }

  function footer(text1, text2){
    var lines = [];
    [text1,text2].forEach(function(t){ if(t) lines.push(String(t)); });
    if(!lines.length) return;
    ctx.save();
    ctx.fillStyle='rgba(223,234,255,.90)';
    ctx.font='600 10.5px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var maxW = w-22;
    var out=[];
    lines.forEach(function(line){
      var words=String(line).split(/\s+/), cur='';
      words.forEach(function(word){
        var test=cur ? (cur+' '+word) : word;
        if(ctx.measureText(test).width > maxW && cur){ out.push(cur); cur=word; }
        else cur=test;
      });
      if(cur) out.push(cur);
    });
    var lineH=12;
    var maxLines = Math.max(2, Math.floor((h-24)/lineH));
    if(out.length > maxLines){
      out = out.slice(0,maxLines);
      var last = out[out.length-1];
      while(ctx.measureText(last+'…').width > maxW && last.length>4) last = last.slice(0,-1);
      out[out.length-1] = last+'…';
    }
    var startY = y+h-8 - (out.length-1)*lineH;
    out.forEach(function(line, i){
      ctx.fillText(line, x+12, startY + i*lineH);
    });
    ctx.restore();
  }

  function drawCommon(ligs, opts){
    opts=opts||{};
    ligs.forEach(function(p){ __angleDrawBond(ctx, center, p); });
    __angleDrawAtom(ctx, center.x, center.y, centerR, 'rgba(60,92,255,.95)');
    ligs.forEach(function(p){ __angleDrawAtom(ctx, p.x, p.y, ligR, 'rgba(255,90,164,.95)'); });
    if(opts.lp){
      opts.lp.forEach(function(p){
        ctx.save(); ctx.globalAlpha = 0.70;
        __angleDrawAtom(ctx, p.x, p.y, 7.4, 'rgba(88,112,255,.90)');
        ctx.restore();
      });
    }
    return ligs;
  }

  if(exGeom==='bent_tet'){
    
    var Rb=70;
    var ha=52.25*DEG; 
    var dx=Math.sin(ha)*Rb, dy=Math.cos(ha)*Rb;
    var L=P(-dx,dy), R=P(dx,dy);
    var LP1=P(-16,-50), LP2=P(16,-50);
    drawCommon([L,R], {lp:[LP1,LP2]});
    __angleArcLabel(ctx, center, L, R, '104,5°', 34);
    footer('AX2E2 (angular): 2 pares livres comprimem o ângulo', 'Ângulo real ~104,5° < 109,5° (tetraédrico ideal)');
  } else if(exGeom==='bent_tp'){
    
    var Rb2=72;
    var ha2=60*DEG; 
    var dx2=Math.sin(ha2)*Rb2, dy2=Math.cos(ha2)*Rb2;
    var L2=P(-dx2,dy2), R2=P(dx2,dy2), LP=P(0,-54);
    drawCommon([L2,R2], {lp:[LP]});
    __angleArcLabel(ctx, center, L2, R2, '<120°', 34);
    footer('AX2E (angular, base trigonal planar): 1 par livre comprime', 'Ângulo real menor que 120°');
  } else if(exGeom==='trigonal_pyramidal'){
    
    var Rb3=70;
    var ha3=53.5*DEG; 
    var dx3=Math.sin(ha3)*Rb3, dy3=Math.cos(ha3)*Rb3;
    var BL=P(-dx3,dy3), BR=P(dx3,dy3), B=P(0, Rb3);
    drawCommon([BL,BR,B], {lp:[P(0,-56)]});
    __angleArcLabel(ctx, center, BL, BR, '107°', 33);
    footer('AX3E (piramidal trigonal): 1 par livre empurra as ligações', 'Ângulo real ~107° < 109,5° por repulsão do par livre');
  } else if(exGeom==='see_saw'){
    var AXu=P(0,-60), AXd=P(0,60), EqL=P(-52,18), EqR=P(52,18);
    drawCommon([AXu,AXd,EqL,EqR], {lp:[P(-52,-12)]});
    __angleArcLabel(ctx, center, AXu, EqR, '<90°', 22);
    __angleArcLabel(ctx, center, EqL, EqR, '<120°', 30);
    footer('AX4E (gangorra): par livre equatorial aumenta repulsão', 'Ax-Eq <90°; Eq-Eq <120°; Ax-Ax <180°');
  } else if(exGeom==='t_shaped'){
    var AX1=P(0,-58), AX2=P(0,58), Eq=P(58,0);
    drawCommon([AX1,AX2,Eq], {lp:[P(-42,-24),P(-42,24)]});
    __angleArcLabel(ctx, center, AX1, Eq, '<90°', 22);
    __angleArc180(ctx, center, AX1, AX2, '<180°');
    footer('AX3E2 (em T): dois pares livres equatoriais comprimem', 'Ax-Eq <90° e Ax-Ax <180°');
  } else if(exGeom==='linear_tbp'){
    var A=P(0,-60), B=P(0,60);
    drawCommon([A,B], {lp:[P(44,0),P(-22,38),P(-22,-38)]});
    __angleArc180(ctx, center, A, B, '180°');
    footer('AX2E3 (linear, base TBP): pares livres ficam nas posições equatoriais', 'Ligações ficam opostas: 180°');
  } else if(exGeom==='square_pyramidal'){
    var Top=P(0,-64), U=P(0,-38), D=P(0,38), L=P(-44,0), R=P(44,0);
    drawCommon([Top,U,R,D,L], {lp:[P(0,58)]});
    __angleArcLabel(ctx, center, Top, R, '<90°', 22);
    __angleArcLabel(ctx, center, U, R, '90°', 19);
    __angleArc180(ctx, center, L, R, '180°');
    footer('AX5E (piramidal quadrada): 1 par livre em geometria octaédrica', 'Ax-Basal <90°; na base: 90° e 180°');
  } else if(exGeom==='square_planar'){
    var U2=P(0,-44), D2=P(0,44), L3=P(-44,0), R3=P(44,0);
    drawCommon([U2,R3,D2,L3], {lp:[P(0,-56),P(0,56)]});
    __angleArcLabel(ctx, center, U2, R3, '90°', 20);
    __angleArc180(ctx, center, L3, R3, '180°');
    footer('AX4E2 (quadrada planar): pares livres trans fora do plano', 'Ângulos no plano permanecem ~90° e 180°');
  } else if(arr==='AX2' || exGeom==='linear'){
    var L4=P(-62,0), R4=P(62,0);
    drawCommon([L4,R4]);
    __angleArc180(ctx, center, L4, R4, '180°');
    footer('AX2 (linear)', 'Duas direções opostas maximizam afastamento');
  } else if(arr==='AX3' || exGeom==='trigonal_planar'){
    var T2=P(0,-56), BL2=P(-52,30), BR2=P(52,30);
    drawCommon([T2,BL2,BR2]);
    __angleArcLabel(ctx, center, BL2, BR2, '120°', 28);
    footer('AX3 (trigonal planar)', 'Três direções no mesmo plano -> 120°');
  } else if(arr==='AX4' || exGeom==='tetrahedral' || exGeom==='tetra'){
    var T3=P(0,-58), L5=P(-54,12), R5=P(54,12), F=P(0,54);
    drawCommon([T3,L5,R5,F]);
    __angleArcLabel(ctx, center, T3, R5, '109,5°', 31);
    footer('AX4 (tetraédrica): ângulo ideal em 3D', 'No esquema 2D, a projeção é só didática');
  } else if(arr==='AX5' || exGeom==='trigonal_bipyramidal' || exGeom==='tbp'){
    
    
    var AxU=P(0,-64), EqL=P(-66,0), EqR=P(66,0), EqBL=P(-38,36), EqBR=P(38,36);

    function drawBondC(a, b){
      ctx.save();
      ctx.strokeStyle='rgba(117,255,235,.96)';
      ctx.lineWidth=4;
      ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      ctx.restore();
    }

    [AxU,EqL,EqR,EqBL,EqBR].forEach(function(p){ drawBondC(center, p); });
    __angleDrawAtom(ctx, center.x, center.y, centerR, 'rgba(60,92,255,.95)');
    [AxU,EqL,EqR,EqBL,EqBR].forEach(function(p){ __angleDrawAtom(ctx, p.x, p.y, ligR, 'rgba(255,92,158,.96)'); });

    __angleArc180(ctx, center, EqL, EqR, '180°');
    __angleArcLabel(ctx, center, AxU, EqR, '90°', 22);
    __angleArcLabel(ctx, center, EqBL, EqBR, '120°', 29);

    footer('AX5 (bipirâmide trigonal): Eq-Eq 120° | Ax-Eq 90° | Ax-Ax 180°', 'Esquema simplificado para destacar os 3 tipos de ângulo sem poluir o painel.');
  } else if(arr==='AX6' || exGeom==='octahedral' || exGeom==='oct'){
    var U3=P(0,-66), D3=P(0,66), L6=P(-62,0), R6=P(62,0), F6=P(-30,-24), B6=P(30,24);
    drawCommon([U3,D3,L6,R6,F6,B6]);
    __angleArcLabel(ctx, center, U3, R6, '90°', 22);
    __angleArc180(ctx, center, L6, R6, '180°');
    footer('AX6 (octaédrica)', 'Adjacentes 90°; opostos 180°');
  } else {
    var ligs = [];
    (data.atoms||[]).slice(1,7).forEach(function(a){
      var p=a.pos||[0,0,0];
      ligs.push({x:cx+p[0]*52, y:cy-p[1]*52});
    });
    if(!ligs.length) return;
    drawCommon(ligs);
    if(ligs.length>=2){
      if((angleLbl||'').indexOf('180')>=0) __angleArc180(ctx, center, ligs[0], ligs[1], angleLbl);
      else __angleArcLabel(ctx, center, ligs[0], ligs[1], angleLbl, 24);
    }
    footer((arr?arr+' ':'')+'(esquema automático)', angleLbl);
  }

  ctx.save();
  ctx.fillStyle='rgba(222,235,255,.90)';
  ctx.font='600 10.5px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  var txt = ((data.geom && data.geom.arr) ? data.geom.arr+' | ' : '') + ((data.geom && data.geom.angle) ? data.geom.angle : '');
  var maxW = w-24;
  if(ctx.measureText(txt).width > maxW){
    while(txt.length>8 && ctx.measureText(txt+'…').width > maxW) txt = txt.slice(0,-1);
    txt += '…';
  }
  ctx.fillText(txt, x+12, y+20);
  ctx.restore();
}

  function moleculeVisualData(){
    var ex = exampleCatalog[activeExampleKey] || exampleCatalog.H2O;
    
    
    var geomMap = {
      linear:'linear',
      trigonal_planar:'trigonal_planar',
      tetrahedral:'tetra',
      trigonal_bipyramidal:'tbp',
      octahedral:'oct',
      bent_tp:'bent_tp',
      trigonal_pyramidal:'trigonal_pyramidal',
      bent_tet:'bent_tet',
      see_saw:'see_saw',
      t_shaped:'t_shaped',
      linear_tbp:'linear_tbp',
      square_pyramidal:'square_pyramidal',
      square_planar:'square_planar'
    };
    try{
      var uiGeom = apiRef && apiRef.ui && apiRef.ui.geom ? apiRef.ui.geom.value : '';
      if(uiGeom && geomMap[uiGeom]){
        ex = Object.assign({}, ex, { geom: geomMap[uiGeom] });
      }
    }catch(_e){}
    return getWorldDataForExample(ex);
  }

  function refreshMiniCalc(){  }

  
  
  function __elementRadiusWorld(label, role){
    
    var rCenter = (typeof size!=='undefined' && size) ? (parseFloat(size.value)||1.0) : 1.0;
    var rLig = (typeof ligandRadius!=='undefined' && ligandRadius) ? (parseFloat(ligandRadius.value)||0.44) : 0.44;
    var sym = String(label||'').trim();

    if(role === 'center') return rCenter;
    if(/^H$/i.test(sym)) return rLig * 0.82;
    if(/^(F|O|Cl|Br|I|N|S|P)$/i.test(sym)) return rLig * 1.06;
    return rLig;
  }

function __collectEnvelopeItems(data, view, can){
    try{
      var p0 = projectPoint([0,0,0], view, can);
      var p1 = projectPoint([1,0,0], view, can);
      var pxU = (p0 && p1) ? Math.hypot(p1.x-p0.x, p1.y-p0.y) : (Math.min(can.w,can.h)*0.22);
      if(!isFinite(pxU) || pxU<1) pxU = Math.min(can.w,can.h)*0.22;

      var items = [];
      (data.atoms||[]).forEach(function(a, idx){
        var p = projectPoint(a.pos, view, can);
        if(!p) return;
        var rw = __elementRadiusWorld(a.label, idx===0 ? 'center' : 'lig');
        var rr = Math.max(14, rw*pxU*1.18);
        items.push({x:p.x, y:p.y, r:rr, kind:'atom', idx:idx, label:a.label});
      });

      (data.lps||[]).forEach(function(lp, idx){
        var p = projectPoint(lp.pos, view, can);
        if(!p) return;
        var rr = Math.max(18, pxU*0.36);
        items.push({x:p.x, y:p.y, r:rr, kind:'lp', idx:idx, label:'LP'});
      });

      if(!items.length && p0) items.push({x:p0.x, y:p0.y, r:Math.max(40, pxU*0.9), kind:'fallback'});
      return {items:items, pxU:pxU};
    }catch(e){
      return {items:[], pxU:(Math.min(can.w,can.h)*0.22)};
    }
  }

function __envelopePathPoints(items, pad){
    if(!items || !items.length) return null;
    var cx=0, cy=0, wsum=0;
    for(var i=0;i<items.length;i++){
      var it=items[i], w=Math.max(10, it.r);
      cx += it.x*w; cy += it.y*w; wsum += w;
    }
    cx/=wsum||1; cy/=wsum||1;
    var N = 56;
    var rs = new Array(N);
    for(var k=0;k<N;k++){
      var th = (k/N)*Math.PI*2, ux=Math.cos(th), uy=Math.sin(th);
      var best = 12;
      for(var j=0;j<items.length;j++){
        var it2=items[j];
        var dx=it2.x-cx, dy=it2.y-cy;
        var proj = dx*ux + dy*uy + it2.r;
        if(proj>best) best=proj;
      }
      rs[k] = best + (pad||10);
    }
    
    var rs2 = rs.slice();
    for(var t=0;t<2;t++){
      for(var n=0;n<N;n++){
        var a=rs[(n-1+N)%N], b=rs[n], c=rs[(n+1)%N];
        rs2[n] = a*0.22 + b*0.56 + c*0.22;
      }
      rs = rs2.slice();
    }
    var pts=[];
    for(var m=0;m<N;m++){
      var th2=(m/N)*Math.PI*2;
      pts.push({x:cx+Math.cos(th2)*rs[m], y:cy+Math.sin(th2)*rs[m]});
    }
    return {cx:cx, cy:cy, pts:pts, radii:rs};
  }

  function __expandEnvelopePath(env, extra){
    if(!env || !env.pts || !env.pts.length) return env;
    var e = Math.max(0, extra||0);
    if(!e) return env;
    var pts = env.pts.map(function(p){
      var dx=p.x-env.cx, dy=p.y-env.cy;
      var L=Math.hypot(dx,dy)||1;
      return {x:p.x + (dx/L)*e, y:p.y + (dy/L)*e};
    });
    return {cx:env.cx, cy:env.cy, pts:pts};
  }

  

function __getViewBasis(view){
  var eye=[view.camDist*Math.cos(view.rotX)*Math.sin(view.rotY), view.camDist*Math.sin(view.rotX), view.camDist*Math.cos(view.rotX)*Math.cos(view.rotY)];
  var target=[0,0,0], up=[0,1,0];
  var f=vNorm(vSub(target, eye));
  var useUp = Math.abs(vDot(f, up)) > 0.98 ? [0,0,1] : up;
  var r=vNorm(vCross(f, useUp));
  if(!isFinite(r[0])||!isFinite(r[1])||!isFinite(r[2])) r=[1,0,0];
  var u=vCross(r, f);
  return {eye:eye, forward:f, right:r, up:u};
}

function __projectWorldRadius(world, radiusWorld, view, size, basis){
  var p = projectPoint(world, view, size);
  if(!p) return null;
  basis = basis || __getViewBasis(view);
  var offX = projectPoint(vAdd(world, vMul(basis.right, radiusWorld)), view, size);
  var offY = projectPoint(vAdd(world, vMul(basis.up, radiusWorld)), view, size);
  var rx = offX ? Math.hypot(offX.x-p.x, offX.y-p.y) : 0;
  var ry = offY ? Math.hypot(offY.x-p.x, offY.y-p.y) : 0;
  if(!isFinite(rx) || rx < 1) rx = 1;
  if(!isFinite(ry) || ry < 1) ry = rx;
  return {x:p.x, y:p.y, z:p.z, rx:rx, ry:ry};
}

function __buildVolumetricShell(data, view, can){
  var basis = __getViewBasis(view);
  var out = [];
  function pushBlob(world, radiusWorld, color, alpha, angle, meta){
    var pr = __projectWorldRadius(world, radiusWorld, view, can, basis);
    if(!pr) return;
    out.push({
      x:pr.x, y:pr.y, z:pr.z, rx:pr.rx, ry:pr.ry, angle:angle||0,
      color:color||[170,246,255], alpha:(alpha==null?0.08:alpha),
      meta:meta||null, world:world
    });
  }
  function pushEllipsoid(world, axisMajor, majorR, axisMinor, minorR, color, alpha, meta){
    var p = projectPoint(world, view, can);
    if(!p) return;
    var a = vNorm(axisMajor||basis.right);
    var b = vNorm(axisMinor||basis.up);
    var pA = projectPoint(vAdd(world, vMul(a, majorR)), view, can);
    var pB = projectPoint(vAdd(world, vMul(b, minorR)), view, can);
    var rx = pA ? Math.hypot(pA.x-p.x, pA.y-p.y) : 0;
    var ry = pB ? Math.hypot(pB.x-p.x, pB.y-p.y) : 0;
    if(!isFinite(rx) || rx < 1) rx = 1;
    if(!isFinite(ry) || ry < 1) ry = Math.max(1, rx*0.66);
    var ang = pA ? Math.atan2(pA.y-p.y, pA.x-p.x) : 0;
    out.push({
      x:p.x, y:p.y, z:p.z, rx:rx, ry:ry, angle:ang,
      color:color||[170,246,255], alpha:(alpha==null?0.08:alpha),
      meta:meta||null, world:world
    });
  }

  (data.atoms||[]).forEach(function(a, idx){
    var rw = __elementRadiusWorld(a.label, idx===0 ? 'center' : 'lig');
    var shellR = rw * (idx===0 ? 1.08 : 0.96);
    var color = idx===0 ? [170,246,255] : [185,248,255];
    pushBlob(a.pos, shellR, color, idx===0 ? 0.10 : 0.082, 0, {kind:'atomCore', idx:idx, label:a.label});

    var ringCount = idx===0 ? 6 : 4;
    var ringScale = idx===0 ? 0.82 : 0.78;
    for(var i=0;i<ringCount;i++){
      var ang = (Math.PI*2*i)/ringCount;
      var radial = vAdd(vMul(basis.right, Math.cos(ang)*shellR*ringScale), vMul(basis.up, Math.sin(ang)*shellR*0.72));
      pushBlob(vAdd(a.pos, radial), shellR*0.54, color, idx===0 ? 0.048 : 0.042, ang, {kind:'atomShell', idx:idx, label:a.label});
    }
    pushBlob(vAdd(a.pos, vMul(basis.forward, shellR*0.24)), shellR*0.54, color, idx===0 ? 0.040 : 0.034, 0, {kind:'capFront', idx:idx, label:a.label});
    pushBlob(vAdd(a.pos, vMul(basis.forward, -shellR*0.24)), shellR*0.58, color, idx===0 ? 0.030 : 0.026, 0, {kind:'capBack', idx:idx, label:a.label});
  });

  (data.bondDipoles||[]).forEach(function(d){
    var negDir = vNorm(d.vec||[1,0,0]);
    var bondLen = (data.bondLen||1.55);
    for(var t=0.18; t<=0.84; t+=0.18){
      var pos = vAdd(d.anchor||[0,0,0], vMul(negDir, bondLen*t));
      pushBlob(pos, bondLen*0.12, [185,248,255], 0.024, 0, {kind:'bond'});
    }
  });

  (data.lps||[]).forEach(function(lp, idx){
    var lpDir = vNorm(lp.dir||[1,0,0]);
    var side = vNorm(vCross(lpDir, basis.forward));
    if(!isFinite(side[0])||!isFinite(side[1])||!isFinite(side[2])||Math.hypot(side[0],side[1],side[2])<0.2){
      side = basis.right;
    }
    var up2 = vNorm(vCross(side, lpDir));
    if(!isFinite(up2[0])||!isFinite(up2[1])||!isFinite(up2[2])||Math.hypot(up2[0],up2[1],up2[2])<0.2){
      up2 = basis.up;
    }
    var centerLabel = (data.atoms&&data.atoms[0]&&data.atoms[0].label) ? data.atoms[0].label : 'X';
    var centerR = __elementRadiusWorld(centerLabel, 'center');
    var majorR = ((lp&&lp.size) || (centerR*0.50));
    var radialR = ((lp&&lp.radial) || (majorR*0.68));
    var lpDist = centerR + radialR * 0.98;
    var lpPos = vMul(lpDir, lpDist);
    pushEllipsoid(lpPos, side, majorR*0.88, lpDir, radialR*0.84, [120,205,255], 0.098, {kind:'lpCore', idx:idx});
    pushEllipsoid(vAdd(lpPos, vMul(lpDir, radialR*0.14)), side, majorR*0.74, lpDir, radialR*0.68, [120,205,255], 0.078, {kind:'lpHead', idx:idx});
    pushEllipsoid(vAdd(lpPos, vMul(up2, majorR*0.08)), side, majorR*0.60, lpDir, radialR*0.50, [120,205,255], 0.050, {kind:'lpWing', idx:idx});
  });

  out.sort(function(a,b){ return b.z - a.z; });
  return {basis:basis, blobs:out};
}

function __blobEnvelopeFromVolumetric(blobs){
  if(!blobs || !blobs.length) return null;
  var items=[];
  for(var i=0;i<blobs.length;i++){
    var b=blobs[i];
    items.push({x:b.x, y:b.y, r:Math.max(b.rx, b.ry)});
  }
  return __envelopePathPoints(items, 18);
}
function __traceSmoothClosedPath(ctx, pts){
    if(!pts || pts.length<2) return;
    var n=pts.length;
    ctx.beginPath();
    for(var i=0;i<n;i++){
      var p0=pts[(i-1+n)%n], p1=pts[i], p2=pts[(i+1)%n];
      var mx=(p1.x+p2.x)*0.5, my=(p1.y+p2.y)*0.5;
      if(i===0){
        var mPrevX=(p0.x+p1.x)*0.5, mPrevY=(p0.y+p1.y)*0.5;
        ctx.moveTo(mPrevX,mPrevY);
      }
      ctx.quadraticCurveTo(p1.x,p1.y,mx,my);
    }
    ctx.closePath();
  }

  

function __envBounds(env){
  var minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  (env && env.pts || []).forEach(function(p){
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  });
  if(!isFinite(minX)) return null;
  return {minX:minX, minY:minY, maxX:maxX, maxY:maxY};
}

function __moleculeMapEnvelope(data, view, can, extra){
  var base = __collectEnvelopeItems(data, view, can);
  var env = __envelopePathPoints((base && base.items) ? base.items : [], Math.max(10, (base && base.pxU ? base.pxU*0.05 : 12)));
  if(!env) return null;
  return __expandEnvelopePath(env, extra == null ? 8 : extra);
}

function __espPaletteRGBA(score, alphaMul, soft){
  var s = clamp(score, -1.18, 1.18);
  function mix(c1,c2,t){
    return [
      Math.round(c1[0] + (c2[0]-c1[0])*t),
      Math.round(c1[1] + (c2[1]-c1[1])*t),
      Math.round(c1[2] + (c2[2]-c1[2])*t)
    ];
  }
  var blue = [34, 89, 255], cyan = [59, 200, 255], green = [88, 222, 155], yellow = [247, 220, 79], orange = [248, 146, 63], red = [235, 74, 92];
  var rgb;
  if(s >= 0){
    var t = clamp(s/1.18, 0, 1);
    if(t < 0.30) rgb = mix(green, yellow, t/0.30);
    else if(t < 0.62) rgb = mix(yellow, orange, (t-0.30)/0.32);
    else rgb = mix(orange, red, (t-0.62)/0.38);
  } else {
    var t2 = clamp((-s)/1.18, 0, 1);
    if(t2 < 0.26) rgb = mix(green, cyan, t2/0.26);
    else rgb = mix(cyan, blue, (t2-0.26)/0.74);
  }
  if(soft){ rgb = mix(rgb, [230,236,246], 0.20); }
  return [rgb[0], rgb[1], rgb[2], clamp(alphaMul == null ? 1 : alphaMul, 0, 1)];
}

function drawDensitySurfaceMap(ctx, data, view, can){
    var shell = __buildVolumetricShell(data, view, can);
    if(!shell || !shell.blobs || !shell.blobs.length) return;
    var isLightBG = !!(document.body && document.body.classList && document.body.classList.contains('lightBg'));

    function chiOf(lbl){
      var s = String(lbl||'X').replace(/[^A-Za-z]/g,'');
      var t = {H:2.20, C:2.55, N:3.04, O:3.44, F:3.98, P:2.19, S:2.58, Cl:3.16, Br:2.96, I:2.66, B:2.04, Be:1.57, Xe:2.60};
      return (t[s] != null) ? t[s] : 2.50;
    }
    function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
    function positiveCompression(score){
      var s = clamp(score, -1.35, 1.35);
      if(s <= 0.08) return 1.0;
      return 1.0 - 0.26 * clamp((s-0.08)/1.27, 0, 1);
    }

    var atoms = (data.atoms||[]);
    var centerLabel = atoms[0] ? atoms[0].label : 'X';
    var centerChi = chiOf(centerLabel);
    var ligAtoms = atoms.slice(1);
    var ligChis = ligAtoms.map(function(a){ return chiOf(a.label); });
    var meanLigChi = ligChis.length ? (ligChis.reduce(function(s,v){return s+v;},0)/ligChis.length) : centerChi;
    var allLigSame = ligAtoms.length>0 && ligAtoms.every(function(a){ return String(a.label||'') === String(ligAtoms[0].label||''); });
    var isCO2 = !!(data.ex && data.ex.key==='CO2');

    function atomScore(idx){
      if(!atoms[idx]) return 0;
      var lbl = atoms[idx].label;
      var chi = chiOf(lbl);
      var sc;
      if(idx===0){
        sc = (centerChi - meanLigChi) * 0.95;
        if((data.lps||[]).length && centerChi > meanLigChi) sc += 0.18 * Math.min(2, (data.lps||[]).length);
      } else {
        sc = (chi - centerChi) * 0.95;
      }
      if(allLigSame && idx>0) sc = ((ligChis[0]||centerChi) - centerChi) * 0.95;
      if(isCO2) sc = (idx===0 ? -0.95 : 1.05);
      return clamp(sc, -1.35, 1.35);
    }

    var comps = [];
    atoms.forEach(function(a, idx){
      comps.push({pos:a.pos, r:(__elementRadiusWorld(a.label, idx===0 ? 'center' : 'lig') * (idx===0 ? 1.16 : 1.04)), s:atomScore(idx), w:1.25});
    });
    ligAtoms.forEach(function(a, li){
      var cSc = atomScore(0), lSc = atomScore(li+1);
      var p0 = [0,0,0], p1 = a.pos;
      for(var k=1;k<7;k++){
        var t = k/7;
        comps.push({
          pos:[p0[0]*(1-t)+p1[0]*t, p0[1]*(1-t)+p1[1]*t, p0[2]*(1-t)+p1[2]*t],
          r:Math.max(0.10, (data.bondLen||1.55)*0.12),
          s:cSc*(1-t)+lSc*t,
          w:0.72
        });
      }
    });
    (data.lps||[]).forEach(function(lp){
      comps.push({pos:lp.pos, r:0.28, s:Math.min(-0.95, atomScore(0)-0.50), w:1.10});
      comps.push({pos:vAdd(lp.pos, vMul(vNorm(lp.dir||[1,0,0]), 0.12)), r:0.22, s:Math.min(-1.05, atomScore(0)-0.62), w:0.88});
    });

    function fieldAtWorld(world){
      var num=0, den=0;
      for(var i=0;i<comps.length;i++){
        var c=comps[i];
        var dx=world[0]-c.pos[0], dy=world[1]-c.pos[1], dz=world[2]-c.pos[2];
        var rr=Math.max(0.08,c.r);
        var q=(dx*dx+dy*dy+dz*dz)/(rr*rr);
        if(q>7.5) continue;
        var wt = c.w * Math.exp(-q*1.22);
        num += c.s * wt;
        den += wt;
      }
      if(den < 1e-6) return 0;
      return clamp((num/den) * clamp(0.68 + 0.32*Math.tanh(den*0.70), 0.68, 1.0), -1.35, 1.35);
    }

    var envItems=[];
    var bbMinX=Infinity, bbMinY=Infinity, bbMaxX=-Infinity, bbMaxY=-Infinity;
    shell.blobs.forEach(function(b){
      var sc = fieldAtWorld(b.world);
      var shrink = positiveCompression(sc);
      var rx=b.rx*shrink, ry=b.ry*shrink;
      envItems.push({x:b.x, y:b.y, r:Math.max(rx, ry)});
      bbMinX=Math.min(bbMinX, b.x-rx*1.18); bbMinY=Math.min(bbMinY, b.y-ry*1.18);
      bbMaxX=Math.max(bbMaxX, b.x+rx*1.18); bbMaxY=Math.max(bbMaxY, b.y+ry*1.18);
    });
    var env = __moleculeMapEnvelope(data, view, can, 6) || __envelopePathPoints(envItems, 12);
    if(!env) return;
    var envBounds = __envBounds(env);
    if(!envBounds) return;
    var cx=env.cx, cy=env.cy;
    bbMinX = envBounds.minX; bbMinY = envBounds.minY; bbMaxX = envBounds.maxX; bbMaxY = envBounds.maxY;
    bbMinX = envBounds.minX; bbMinY = envBounds.minY; bbMaxX = envBounds.maxX; bbMaxY = envBounds.maxY;
    var span = Math.max(bbMaxX-bbMinX, bbMaxY-bbMinY);

    ctx.save();
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.clip();

    var rg = ctx.createRadialGradient(cx-span*0.08, cy-span*0.10, 8, cx, cy, span*0.72);
    if(isLightBG){
      rg.addColorStop(0.00,'rgba(150,158,168,0.15)');
      rg.addColorStop(0.55,'rgba(156,164,174,0.11)');
      rg.addColorStop(1.00,'rgba(164,172,182,0.05)');
    }else{
      rg.addColorStop(0.00,'rgba(165,244,255,0.22)');
      rg.addColorStop(0.48,'rgba(108,206,255,0.16)');
      rg.addColorStop(1.00,'rgba(72,165,255,0.06)');
    }
    ctx.fillStyle = rg;
    ctx.fillRect(bbMinX-32, bbMinY-32, (bbMaxX-bbMinX)+64, (bbMaxY-bbMinY)+64);

    shell.blobs.forEach(function(b, idx){
      var alpha = b.alpha;
      if(b.meta && b.meta.kind==='capBack') alpha *= 0.78;
      if(b.meta && b.meta.kind==='lpCore') alpha *= 1.08;
      var sc = fieldAtWorld(b.world);
      var shrink = positiveCompression(sc);
      var tint = __espPaletteRGBA(sc, isLightBG ? alpha*0.54 : alpha*0.92, true);
      drawCloudBlob(ctx, b.x, b.y, b.rx*0.96*shrink, b.ry*0.88*shrink, [tint[0], tint[1], tint[2]], tint[3], b.angle||0);
      if(idx % 4 === 0){
        drawCloudBlob(ctx, b.x-b.rx*0.10*shrink, b.y-b.ry*0.15*shrink, b.rx*0.28*shrink, b.ry*0.22*shrink, [246,255,255], alpha*0.18, b.angle||0);
      }
    });

    ctx.fillStyle = isLightBG ? 'rgba(255,255,255,0.06)' : 'rgba(245,250,255,0.04)';
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.fill();

    var hl = ctx.createRadialGradient(cx-span*0.20, cy-span*0.24, 2, cx-span*0.12, cy-span*0.14, span*0.62);
    hl.addColorStop(0.00,'rgba(255,255,255,0.20)');
    hl.addColorStop(0.22,'rgba(255,255,255,0.12)');
    hl.addColorStop(0.60,'rgba(255,255,255,0.028)');
    hl.addColorStop(1.00,'rgba(255,255,255,0.00)');
    ctx.fillStyle = hl;
    ctx.fillRect(bbMinX-36, bbMinY-36, (bbMaxX-bbMinX)+72, (bbMaxY-bbMinY)+72);

    ctx.restore();

    ctx.save();
    ctx.strokeStyle=(isLightBG?'rgba(158,168,178,.22)':'rgba(210,228,255,.28)'); ctx.lineWidth=1.1;
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.stroke();
    ctx.restore();

  }

  
  function drawESPMap(ctx, data, view, can){
    if(!ctx||!data||!view||!can) return;

    var env = __moleculeMapEnvelope(data, view, can, 3);
    if(!env) return;
    var envBounds = __envBounds(env);
    if(!envBounds) return;

    function chiOf(lbl){
      var s = String(lbl||'X').replace(/[^A-Za-z]/g,'');
      var t = {H:2.20, C:2.55, N:3.04, O:3.44, F:3.98, P:2.19, S:2.58, Cl:3.16, Br:2.96, I:2.66, B:2.04, Be:1.57, Xe:2.60};
      return (t[s] != null) ? t[s] : 2.50;
    }
    function clampJS(v,a,b){ return Math.max(a, Math.min(b, v)); }
    function rotLocal(dx, dy, ang){
      var c=Math.cos(ang||0), s=Math.sin(ang||0);
      return { x:dx*c + dy*s, y:-dx*s + dy*c };
    }
    function mixRGB(c1,c2,t){
      return [
        Math.round(c1[0] + (c2[0]-c1[0])*t),
        Math.round(c1[1] + (c2[1]-c1[1])*t),
        Math.round(c1[2] + (c2[2]-c1[2])*t)
      ];
    }
    function colorForScore(score, alphaMul){
      var s = clampJS(score, -1.0, 1.0);
      var rgb;
      if(s >= 0){
        if(s < 0.34) rgb = mixRGB([84,214,160], [239,219,86], s/0.34);
        else if(s < 0.70) rgb = mixRGB([239,219,86], [255,143,62], (s-0.34)/0.36);
        else rgb = mixRGB([255,143,62], [226,58,74], (s-0.70)/0.30);
      } else {
        var t = (-s);
        if(t < 0.32) rgb = mixRGB([84,214,160], [80,198,255], t/0.32);
        else rgb = mixRGB([80,198,255], [53,86,255], (t-0.32)/0.68);
      }
      return [rgb[0], rgb[1], rgb[2], clampJS(alphaMul == null ? 1 : alphaMul, 0, 1)];
    }

    var atoms = (data.atoms||[]);
    if(!atoms.length) return;
    var centerLabel = atoms[0] ? atoms[0].label : 'X';
    var centerChi = chiOf(centerLabel);
    var ligAtoms = atoms.slice(1);
    var ligChis = ligAtoms.map(function(a){ return chiOf(a.label); });
    var meanLigChi = ligChis.length ? (ligChis.reduce(function(s,v){ return s+v; }, 0)/ligChis.length) : centerChi;
    var allLigSame = ligAtoms.length>0 && ligAtoms.every(function(a){ return String(a.label||'') === String(ligAtoms[0].label||''); });
    var isCO2 = !!(data.ex && data.ex.key==='CO2');
    var densityBias = isFinite(data.densityBias) ? data.densityBias : (((data.ex && isFinite(data.ex.densityBias)) ? data.ex.densityBias : 0) || 0);

    function atomScore(idx){
      if(!atoms[idx]) return 0;
      var chi = chiOf(atoms[idx].label);
      var sc;
      if(idx===0){
        sc = (centerChi - meanLigChi) * 0.95;
        if((data.lps||[]).length && centerChi > meanLigChi) sc += 0.14 * Math.min(2, (data.lps||[]).length);
      } else {
        sc = (chi - centerChi) * 0.98;
      }
      if(allLigSame && idx>0) sc = ((ligChis[0]||centerChi) - centerChi) * 0.98;
      if(isCO2) sc = (idx===0 ? -0.98 : 1.02);
      sc += densityBias * (idx===0 ? -0.12 : 0.12);
      return clampJS(sc, -1.20, 1.20);
    }

    var comps = [];
    function pushComp(x,y,rx,ry,score,weight,angle){
      if(!isFinite(x)||!isFinite(y)||!isFinite(rx)||!isFinite(ry)) return;
      comps.push({
        x:x, y:y,
        rx:Math.max(6, rx), ry:Math.max(6, ry),
        score:clampJS(score, -1.22, 1.22),
        weight:weight == null ? 1 : weight,
        angle:angle || 0
      });
    }

    atoms.forEach(function(a, idx){
      var rw = __elementRadiusWorld(a.label, idx===0 ? 'center' : 'lig');
      var pr = __projectWorldRadius(a.pos, rw * (idx===0 ? 1.06 : 0.98), view, can);
      if(!pr) return;
      var sc = atomScore(idx);
      pushComp(pr.x, pr.y, pr.rx*(idx===0 ? 1.00 : 0.98), pr.ry*(idx===0 ? 0.98 : 0.96), sc, idx===0 ? 1.40 : 1.16, 0);
      pushComp(pr.x - pr.rx*0.12, pr.y - pr.ry*0.18, pr.rx*0.44, pr.ry*0.36, sc*0.62, idx===0 ? 0.62 : 0.50, 0);
    });

    ligAtoms.forEach(function(a, li){
      var cSc = atomScore(0), lSc = atomScore(li+1);
      var p0 = [0,0,0], p1 = a.pos;
      for(var k=1;k<=5;k++){
        var t = k/6;
        var pos = [p0[0]*(1-t)+p1[0]*t, p0[1]*(1-t)+p1[1]*t, p0[2]*(1-t)+p1[2]*t];
        var pr = __projectWorldRadius(pos, Math.max(0.09, (data.bondLen||1.55)*0.10), view, can);
        if(!pr) continue;
        var sc = cSc*(1-t) + lSc*t;
        pushComp(pr.x, pr.y, pr.rx*0.78, pr.ry*0.78, sc, 0.46, 0);
      }
    });

    (data.lps||[]).forEach(function(lp){
      var lpPos = lp.pos || [0,0,0];
      var dir = vNorm(lp.dir || lp.pos || [1,0,0]);
      var head = vAdd(lpPos, vMul(dir, 0.15));
      var p = projectPoint(lpPos, view, can);
      var pHead = projectPoint(head, view, can);
      var pr = __projectWorldRadius(lpPos, Math.max(0.20, ((lp && lp.size) || 0.28) * 0.82), view, can);
      if(!p || !pr) return;
      var ang = pHead ? Math.atan2(pHead.y-p.y, pHead.x-p.x) : 0;
      var rx = Math.max(12, pr.rx*1.28), ry = Math.max(10, pr.ry*0.92);
      var lpScore = clampJS(Math.max(0.96, atomScore(0)+0.26), -1.20, 1.20);
      pushComp(p.x, p.y, rx, ry, lpScore, 1.28, ang);
      pushComp(p.x + Math.cos(ang)*rx*0.18, p.y + Math.sin(ang)*rx*0.18, rx*0.70, ry*0.64, Math.min(1.20, lpScore+0.10), 0.92, ang);
    });

    if(!comps.length) return;

    var pad = 6;
    var x0 = Math.max(0, Math.floor(envBounds.minX - pad));
    var y0 = Math.max(0, Math.floor(envBounds.minY - pad));
    var x1 = Math.min(can.w, Math.ceil(envBounds.maxX + pad));
    var y1 = Math.min(can.h, Math.ceil(envBounds.maxY + pad));
    var w = Math.max(1, x1-x0), h = Math.max(1, y1-y0);
    var span = Math.max(1, Math.max(envBounds.maxX-envBounds.minX, envBounds.maxY-envBounds.minY));
    var cx = env.cx, cy = env.cy;

    function sampleField(px, py){
      var num = 0, den = 0, peak = 0;
      for(var i=0;i<comps.length;i++){
        var c = comps[i];
        var rr = rotLocal(px-c.x, py-c.y, c.angle||0);
        var q = (rr.x*rr.x)/(c.rx*c.rx) + (rr.y*rr.y)/(c.ry*c.ry);
        if(q > 5.8) continue;
        var wt = Math.exp(-q*1.10) * c.weight;
        num += c.score * wt;
        den += wt;
        if(wt > peak) peak = wt;
      }
      if(den < 1e-6) return {score:0, density:0};
      var score = clampJS((num/den) / 1.02, -1.0, 1.0);
      var radial = Math.hypot(px-cx, py-cy) / Math.max(1, span*0.56);
      var density = clampJS((1 - Math.pow(clampJS(radial, 0, 1), 1.55)) * 0.38 + clampJS(den/2.2, 0, 1)*0.92 + clampJS(peak/1.25, 0, 1)*0.30, 0, 1);
      return {score:score, density:density};
    }

    var sample = 2;
    var sw = Math.max(1, Math.ceil(w/sample));
    var sh = Math.max(1, Math.ceil(h/sample));
    var tmp = document.createElement('canvas');
    tmp.width = sw; tmp.height = sh;
    var tctx = tmp.getContext('2d');
    var img = tctx.createImageData(sw, sh);
    var d = img.data;

    for(var sy=0; sy<sh; sy++){
      for(var sx=0; sx<sw; sx++){
        var px = x0 + (sx+0.5)*sample;
        var py = y0 + (sy+0.5)*sample;
        var f = sampleField(px, py);
        var alpha = clampJS(0.18 + f.density*0.74, 0, 0.96);
        var col = colorForScore(f.score, alpha);
        var idx = (sy*sw + sx)*4;
        d[idx] = col[0];
        d[idx+1] = col[1];
        d[idx+2] = col[2];
        d[idx+3] = Math.round(col[3]*255);
      }
    }
    tctx.putImageData(img, 0, 0);

    ctx.save();
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tmp, 0, 0, sw, sh, x0, y0, w, h);

    var gloss = ctx.createRadialGradient(cx-span*0.22, cy-span*0.24, 4, cx-span*0.14, cy-span*0.12, span*0.72);
    gloss.addColorStop(0.00, 'rgba(255,255,255,0.18)');
    gloss.addColorStop(0.18, 'rgba(255,255,255,0.10)');
    gloss.addColorStop(0.52, 'rgba(255,255,255,0.035)');
    gloss.addColorStop(1.00, 'rgba(255,255,255,0.00)');
    ctx.fillStyle = gloss;
    ctx.fillRect(x0-12, y0-12, w+24, h+24);

    var lowerShade = ctx.createLinearGradient(cx, envBounds.minY, cx, envBounds.maxY);
    lowerShade.addColorStop(0.00, 'rgba(255,255,255,0.00)');
    lowerShade.addColorStop(0.60, 'rgba(15,24,38,0.04)');
    lowerShade.addColorStop(1.00, 'rgba(6,10,18,0.10)');
    ctx.fillStyle = lowerShade;
    ctx.fillRect(x0-8, y0-8, w+16, h+16);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.34)';
    ctx.lineWidth = 1.05;
    __traceSmoothClosedPath(ctx, env.pts);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2.4;
    __traceSmoothClosedPath(ctx, __expandEnvelopePath(env, -1.8).pts);
    ctx.stroke();
    ctx.restore();
  }




  function drawPizzaProjection(ctx, data, view, can){
    if(!ctx||!data||!can) return;
    var pC = projectPoint([0,0,0], view, can); if(!pC) return;

    
    var envBase = __collectEnvelopeItems(data, view, can);
    var items = (envBase && envBase.items) ? envBase.items : [];
    var maxR = 0;
    items.forEach(function(it){
      var d = Math.hypot((it.x||0)-pC.x, (it.y||0)-pC.y) + (it.r||0);
      if(d > maxR) maxR = d;
    });
    if(!isFinite(maxR) || maxR < 30) maxR = Math.min(can.w,can.h)*0.25;
    var r = Math.max(76, Math.min(Math.min(can.w,can.h)*0.46, maxR + 22));
    var cx = pC.x, cy = pC.y;

    var exGeom = (data.ex && data.ex.geom) ? String(data.ex.geom) : '';
    var arr = (data.geom && data.geom.arr) ? String(data.geom.arr) : '';
    var regionCount = Math.max(1, ((data.atoms||[]).length-1) + ((data.lps||[]).length||0));

    function normA(a){ while(a<0) a+=Math.PI*2; while(a>=Math.PI*2) a-=Math.PI*2; return a; }
    function equalSectors(n, start){
      var out=[], a0=(start==null?-Math.PI/2:start), step=(Math.PI*2)/Math.max(1,n);
      for(var i=0;i<n;i++) out.push({a1:a0+i*step, a2:a0+(i+1)*step, kind:'eq'});
      return out;
    }
    function viewBasis(view){
      var eye=[view.camDist*Math.cos(view.rotX)*Math.sin(view.rotY), view.camDist*Math.sin(view.rotX), view.camDist*Math.cos(view.rotX)*Math.cos(view.rotY)];
      var target=[0,0,0], up=[0,1,0];
      var f=vNorm(vSub(target, eye));
      var useUp = Math.abs(vDot(f, up)) > 0.98 ? [0,0,1] : up;
      var rB=vNorm(vCross(f, useUp));
      if(!isFinite(rB[0])||!isFinite(rB[1])||!isFinite(rB[2])) rB=[1,0,0];
      var uB=vCross(rB, f);
      return {r:rB, u:uB, f:f};
    }
    function dirAngleNoPerspective(dir, basis){
      var dx=vDot(dir, basis.r), dy=vDot(dir, basis.u);
      if(!isFinite(dx)||!isFinite(dy)) return null;
      if(Math.hypot(dx,dy) < 0.03) return null; 
      return normA(Math.atan2(-dy, dx)); 
    }
    function uniqueSortedAngles(angles){
      var arrA = (angles||[]).filter(function(a){ return a!=null && isFinite(a); }).map(normA).sort(function(a,b){ return a-b; });
      if(!arrA.length) return [];
      var out=[arrA[0]], tol=0.14; 
      for(var i=1;i<arrA.length;i++){
        var a=arrA[i], prev=out[out.length-1];
        if(Math.abs(a-prev) > tol) out.push(a);
      }
      if(out.length>1){
        var wrapGap = (out[0]+Math.PI*2) - out[out.length-1];
        if(wrapGap < tol){
          
          var a1=out[0], aN=out[out.length-1]-Math.PI*2;
          var m=normA((a1+aN)/2);
          out[0]=m; out.pop(); out.sort(function(a,b){ return a-b; });
        }
      }
      return out;
    }
    function sectorsFromRayAngles(rayAngles){
      var rays = uniqueSortedAngles(rayAngles);
      if(rays.length < 2) return null;
      var out=[];
      for(var i=0;i<rays.length;i++){
        var a1=rays[i], a2=(i===rays.length-1)?(rays[0]+Math.PI*2):rays[i+1];
        out.push({a1:a1, a2:a2, kind:'ray'});
      }
      return out;
    }
    function rayAnglesFromDirs(dirs, basis){
      return (dirs||[]).map(function(d){ return dirAngleNoPerspective(d, basis); }).filter(function(a){ return a!=null; });
    }
    function filterByAbsZ(dirs, predicate){
      var out=[]; (dirs||[]).forEach(function(d){ var z=Math.abs((d&&d[2])||0); if(predicate(z,d)) out.push(d); }); return out;
    }

    
    var basis = viewBasis(view);
    var ligDirs = (data.geom && data.geom.lig) ? data.geom.lig.slice() : (data.atoms||[]).slice(1).map(function(a){ return vNorm(a.pos||[1,0,0]); });
    var lpDirs = (data.geom && data.geom.lp) ? data.geom.lp.slice() : (data.lps||[]).map(function(lp){ return vNorm(lp.dir||lp.pos||[1,0,0]); });
    var sectors = [];
    var auxLines = [];
    var note = '';
    var customRayAngles = null;

    if(arr==='AX5' || exGeom==='tbp' || exGeom==='trigonal_bipyramidal' || exGeom==='see_saw' || exGeom==='t_shaped' || exGeom==='linear_tbp'){
      
      var eqDirs = filterByAbsZ(ligDirs.concat(lpDirs), function(z){ return z < 0.35; });
      var axDirs = filterByAbsZ(ligDirs.concat(lpDirs), function(z){ return z >= 0.35; });
      customRayAngles = rayAnglesFromDirs(eqDirs, basis);
      sectors = sectorsFromRayAngles(customRayAngles) || equalSectors(3, -Math.PI/2);
      auxLines = rayAnglesFromDirs(axDirs, basis).map(function(a){ return {a:a, kind:'ax'}; });
      if(!auxLines.length) auxLines = [{a:-Math.PI/2, kind:'ax'},{a:Math.PI/2, kind:'ax'}];
      note = (arr==='AX5' || exGeom==='tbp' || exGeom==='trigonal_bipyramidal')
        ? 'TBP: a pizza mostra o plano equatorial (3 regiões de 120°). As posições axiais aparecem como linhas fora do plano (90° com as equatoriais).'
        : 'TBP derivada: pares livres costumam ocupar posições equatoriais e comprimem alguns ângulos (<90°, <120°).';
    } else if(arr==='AX6' || exGeom==='oct' || exGeom==='octahedral' || exGeom==='square_pyramidal' || exGeom==='square_planar'){
      
      var planeDirs = filterByAbsZ(ligDirs.concat(lpDirs), function(z){ return z < 0.35; });
      var axisDirs = filterByAbsZ(ligDirs.concat(lpDirs), function(z){ return z >= 0.35; });
      customRayAngles = rayAnglesFromDirs(planeDirs, basis);
      sectors = sectorsFromRayAngles(customRayAngles) || equalSectors(4, -Math.PI/4);
      auxLines = rayAnglesFromDirs(axisDirs, basis).map(function(a){ return {a:a, kind:'ax'}; });
      if(!auxLines.length) auxLines = [{a:-Math.PI/2, kind:'ax'},{a:Math.PI/2, kind:'ax'}];
      note = (arr==='AX6' || exGeom==='oct' || exGeom==='octahedral')
        ? 'Octaédrica: a pizza mostra 4 regiões coplanares (90°). As 2 posições axiais ficam fora do plano.'
        : 'Octaédrica derivada: pares livres em posições axiais mudam alguns ângulos (ex.: AX5E tem Ax-Basal <90°).';
    } else {
      
      customRayAngles = rayAnglesFromDirs(ligDirs, basis);
      sectors = sectorsFromRayAngles(customRayAngles);
      if(!sectors){
        if(regionCount===4){ sectors = equalSectors(4, -Math.PI/4); }
        else sectors = equalSectors(regionCount, -Math.PI/2);
      }
      if(regionCount===4){
        note = ((data.geom&&data.geom.arr)||'').indexOf('AX4')===0
          ? 'Tetraédrica/derivadas: a pizza é uma analogia de projeção. O ângulo tetraédrico real (3D) é 109,5°.'
          : 'Quatro regiões no entorno: projeção ajuda a contar regiões; o ângulo real depende da geometria 3D.';
      } else if(regionCount===2){ note='2 regiões opostas -> 180° (linear).'; }
      else if(regionCount===3){ note='3 regiões no plano -> 120° (trigonal planar / base trigonal).'; }
      else { note = regionCount+' regiões eletrônicas em projeção (analogia da pizza).'; }
    }

    ctx.save();
    
    var rg = ctx.createRadialGradient(cx-r*0.14, cy-r*0.18, r*0.05, cx, cy, r);
    rg.addColorStop(0,'rgba(168,224,255,.12)');
    rg.addColorStop(0.75,'rgba(92,160,255,.07)');
    rg.addColorStop(1,'rgba(92,160,255,.025)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(190,220,255,.35)';
    ctx.lineWidth=1.2;
    if(ctx.setLineDash) ctx.setLineDash([6,5]);
    ctx.stroke();
    if(ctx.setLineDash) ctx.setLineDash([]);

    
    sectors.forEach(function(s, i){
      var a1=s.a1, a2=s.a2;
      var col = (i%2===0) ? 'rgba(255,255,255,.055)' : 'rgba(120,200,255,.045)';
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,a1,a2,false);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(cx + Math.cos(a1)*r, cy + Math.sin(a1)*r);
      ctx.strokeStyle='rgba(255,255,255,.30)';
      ctx.lineWidth=1.1;
      ctx.stroke();
    });

    
    auxLines.forEach(function(aux){
      var a=aux.a;
      ctx.save();
      if(ctx.setLineDash) ctx.setLineDash([4,4]);
      ctx.strokeStyle='rgba(255,170,120,.55)';
      ctx.lineWidth=1.15;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a)*r*0.12, cy + Math.sin(a)*r*0.12);
      ctx.lineTo(cx + Math.cos(a)*r*0.95, cy + Math.sin(a)*r*0.95);
      ctx.stroke();
      if(ctx.setLineDash) ctx.setLineDash([]);
      ctx.restore();
    });

    
    ctx.beginPath();
    ctx.arc(cx,cy,8.5,0,Math.PI*2);
    ctx.fillStyle='rgba(70,110,255,.85)';
    ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.24)';
    ctx.stroke();

    
    ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillStyle='rgba(245,251,255,.96)';
    var ttl='Projeção angular (pizza) - esquema sem perspectiva';
    var tw=ctx.measureText(ttl).width;
    ctx.fillText(ttl, Math.max(12, Math.min(can.w-tw-12, cx-tw*0.5)), cy-r-10);

    
    var sliceTxt='';
    if(arr==='AX5' || exGeom==='tbp' || exGeom==='trigonal_bipyramidal') sliceTxt='TBP: 3 fatias equatoriais (120°) + 2 posições axiais (90° com as equatoriais).';
    else if(arr==='AX6' || exGeom==='oct' || exGeom==='octahedral') sliceTxt='Octaédrica: 4 fatias em um plano de referência (90°) + 2 posições axiais.';
    else if(regionCount===4) sliceTxt='4 regiões: a pizza é projeção. Em tetraédrica ideal, o ângulo real em 3D é 109,5°.';
    else if(regionCount===3) sliceTxt='3 regiões: pizza em 3 fatias iguais -> 120°.';
    else if(regionCount===2) sliceTxt='2 regiões: pizza dividida ao meio -> 180°.';
    else sliceTxt = note || (regionCount+' regiões eletrônicas em projeção.');
    if(note && sliceTxt.indexOf(note)===-1 && (arr.indexOf('E')>=0 || exGeom==='see_saw' || exGeom==='t_shaped' || exGeom==='square_pyramidal' || exGeom==='square_planar')){
      sliceTxt += ' ' + note;
    }

    ctx.font='700 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillStyle='rgba(220,234,255,.96)';
    var maxTxtW = Math.max(190, Math.min(can.w*0.78, r*2.05));
    var words = String(sliceTxt).split(/\s+/), lines=[], cur='';
    for(var wi=0; wi<words.length; wi++){
      var test = cur ? (cur+' '+words[wi]) : words[wi];
      if(ctx.measureText(test).width > maxTxtW && cur){ lines.push(cur); cur = words[wi]; }
      else cur = test;
    }
    if(cur) lines.push(cur);
    var lineH = 17;
    var startY = cy + r + 16;
    lines.slice(0,3).forEach(function(tLine, li){
      var tw2 = ctx.measureText(tLine).width;
      var tx = Math.max(12, Math.min(can.w - tw2 - 12, cx - tw2*0.5));
      ctx.fillText(tLine, tx, startY + li*lineH);
    });
    ctx.restore();
  }



  function __drawVectorGrid(ctx, x, y, w, h){
    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,.05)';
    ctx.lineWidth=1;
    for(var gx=x; gx<=x+w+0.1; gx+=24){ ctx.beginPath(); ctx.moveTo(gx,y); ctx.lineTo(gx,y+h); ctx.stroke(); }
    for(var gy=y; gy<=y+h+0.1; gy+=24){ ctx.beginPath(); ctx.moveTo(x,gy); ctx.lineTo(x+w,gy); ctx.stroke(); }
    ctx.restore();
  }

  function __vecLabel(ctx, p, txt, color){
    ctx.save();
    ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var w = ctx.measureText(txt).width + 10;
    ctx.fillStyle='rgba(6,10,16,.82)';
    ctx.strokeStyle='rgba(255,255,255,.10)';
    ctx.lineWidth=1;
    ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(p.x-w/2, p.y-12, w, 20, 10); else ctx.rect(p.x-w/2, p.y-12, w, 20); ctx.fill(); ctx.stroke();
    ctx.fillStyle=color||'#fff';
    ctx.textBaseline='middle';
    ctx.fillText(txt, p.x-w/2+5, p.y-2);
    ctx.restore();
  }

  function drawVectorRuleStage(ctx, can, step){
    var w=can.w, h=can.h;
    ctx.save();
    ctx.fillStyle='rgba(3,7,12,.94)';
    ctx.fillRect(0,0,w,h);
    var pad=18;
    var panel={x:pad,y:pad,w:w-pad*2,h:h-pad*2};
    ctx.fillStyle='rgba(8,12,20,.92)';
    ctx.strokeStyle='rgba(255,255,255,.12)';
    ctx.lineWidth=1;
    ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(panel.x,panel.y,panel.w,panel.h,16); else ctx.rect(panel.x,panel.y,panel.w,panel.h); ctx.fill(); ctx.stroke();
    __drawVectorGrid(ctx, panel.x+12, panel.y+42, panel.w-24, panel.h-54);

    var mode = (step && step.vectorMode) || (/Subtração/i.test(String(step&&step.title||'')) ? 'subtraction' : (/Paralelogramo/i.test(String(step&&step.title||'')) ? 'parallelogram' : 'addition'));
    ctx.fillStyle='rgba(236,244,255,.97)';
    ctx.font='700 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var title = mode==='parallelogram' ? 'Regra do paralelogramo (soma gráfica)' : (mode==='subtraction' ? 'Subtração / cancelamento vetorial' : 'Adição vetorial');
    ctx.fillText(title, panel.x+14, panel.y+22);

    var ox = panel.x + Math.max(170, panel.w*0.32);
    var oy = panel.y + panel.h*0.62;
    var scale = Math.min(panel.w, panel.h) * 0.22;
    var va, vb;
    if(mode==='subtraction'){
      va = {x: scale*1.10, y: -scale*0.05};
      vb = {x: -scale*0.85, y: -scale*0.48};
    }else if(mode==='parallelogram'){
      va = {x: scale*1.00, y: -scale*0.18};
      vb = {x: scale*0.58, y: -scale*0.86};
    }else{
      va = {x: scale*0.95, y: -scale*0.28};
      vb = {x: scale*0.72, y: -scale*0.74};
    }

    function P(v){ return {x:ox+v.x, y:oy+v.y}; }
    var O={x:ox,y:oy}, A=P(va), B=P(vb), R=P({x:va.x+vb.x, y:va.y+vb.y});

    
    ctx.strokeStyle='rgba(255,255,255,.14)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(panel.x+28, oy); ctx.lineTo(panel.x+panel.w-28, oy); ctx.moveTo(ox, panel.y+58); ctx.lineTo(ox, panel.y+panel.h-22); ctx.stroke();

    
    drawArrow(ctx, O, A, '#4ec7ff', 3.0, 10);
    drawArrow(ctx, O, B, '#9cf16c', 3.0, 10);
    __vecLabel(ctx, {x:(O.x+A.x)/2, y:(O.y+A.y)/2-14}, 'μ₁', '#9ed8ff');
    __vecLabel(ctx, {x:(O.x+B.x)/2, y:(O.y+B.y)/2-14}, 'μ₂', '#d3ffb0');

    if(mode==='parallelogram' || mode==='addition'){
      
      ctx.save();
      if(ctx.setLineDash) ctx.setLineDash([7,6]);
      ctx.strokeStyle='rgba(255,255,255,.30)';
      ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(R.x,R.y); ctx.moveTo(B.x,B.y); ctx.lineTo(R.x,R.y); ctx.stroke();
      ctx.restore();
      drawArrow(ctx, O, R, '#ffd34d', 3.8, 14);
      __vecLabel(ctx, {x:(O.x+R.x)/2, y:(O.y+R.y)/2+16}, 'μR = μ₁ + μ₂', '#ffe98f');
    } else {
      
      var negB = {x:ox-vb.x, y:oy-vb.y};
      drawArrow(ctx, O, negB, '#ff8ea0', 2.8, 10);
      __vecLabel(ctx, {x:(O.x+negB.x)/2, y:(O.y+negB.y)/2+16}, '-μ₂', '#ffc2cb');
      var Rsub = {x: ox + va.x - vb.x, y: oy + va.y - vb.y};
      drawArrow(ctx, O, Rsub, '#ffd34d', 3.8, 14);
      __vecLabel(ctx, {x:(O.x+Rsub.x)/2, y:(O.y+Rsub.y)/2+16}, 'μR = μ₁ - μ₂', '#ffe98f');
      ctx.save(); if(ctx.setLineDash) ctx.setLineDash([7,6]); ctx.strokeStyle='rgba(255,255,255,.24)'; ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(Rsub.x,Rsub.y); ctx.moveTo(negB.x,negB.y); ctx.lineTo(Rsub.x,Rsub.y); ctx.stroke(); ctx.restore();
    }

    
    var bx=panel.x+14, by=panel.y+44, bw=Math.min(390, panel.w*0.42), bh=86;
    ctx.fillStyle='rgba(7,11,18,.78)'; ctx.strokeStyle='rgba(255,255,255,.10)'; ctx.lineWidth=1;
    ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(bx,by,bw,bh,12); else ctx.rect(bx,by,bw,bh); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(236,244,255,.96)'; ctx.font='700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    var head = mode==='parallelogram' ? 'Regra do paralelogramo' : (mode==='subtraction' ? 'Subtração vetorial (soma com sinal)' : 'Adição vetorial');
    ctx.fillText(head, bx+10, by+18);
    ctx.font='600 11px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'; ctx.fillStyle='rgba(204,220,245,.95)';
    var l1, l2, l3;
    if(mode==='parallelogram'){
      l1='1) Desenhe μ₁ e μ₂ a partir da mesma origem.';
      l2='2) Copie μ₁ na ponta de μ₂ e μ₂ na ponta de μ₁.';
      l3='3) A diagonal da origem é a resultante μR.';
    }else if(mode==='subtraction'){
      l1='1) Subtrair μ₂ = somar (−μ₂).';
      l2='2) Inverta o sentido de μ₂ e some pela regra da soma.';
      l3='3) Cancelamento total ocorre se forem iguais e opostos.';
    }else{
      l1='1) Some por componentes: Σμx, Σμy, Σμz.';
      l2='2) Componentes no mesmo sentido se reforçam.';
      l3='3) A seta amarela mostra μR (soma final).';
    }
    ctx.fillText(l1, bx+10, by+40); ctx.fillText(l2, bx+10, by+57); ctx.fillText(l3, bx+10, by+74);

    ctx.restore();
  }
  function drawPolarOverlay(){
    var can = getCanvasAndCtx(); if(!can || !octx || !apiRef) return;
    var ctx=octx, w=can.w, h=can.h;
    ctx.clearRect(0,0,w,h);
    var s=steps[stepIdx]; if(!s) return;
    var practiceActive = __practiceIsActive();
    var practiceEx = practiceActive ? (exampleCatalog[practiceState.currentKey] || exampleCatalog[activeExampleKey]) : null;
    var data = practiceEx ? getWorldDataForExample(practiceEx) : moleculeVisualData();
    var ex = data.ex;
    var view = apiRef.getView ? apiRef.getView() : {camDist:5, rotX:0.3, rotY:-0.8};
    var vectorOnly = practiceActive ? false : !!(s && s.onlyVectors);
    glowPhase += 0.03;

    if(vectorOnly){
      drawVectorRuleStage(ctx, can, s);
      return;
    }

    var projAtoms = data.atoms.map(function(a){ return {a:a, p:projectPoint(a.pos, view, can)}; });
    var pCenter = projAtoms[0] && projAtoms[0].p;
    if(!pCenter) return;

    var hasLonePairs = !!(data && data.geom && data.geom.lp && data.geom.lp.length);
    if(!practiceActive && !vectorOnly && visualState.pizza && !hasLonePairs && (typeof showAngles==='undefined' || !showAngles || showAngles.checked)){
      drawPizzaProjection(ctx, data, view, can);
    }
    if(!practiceActive && !vectorOnly && visualState.mapDensity) drawDensitySurfaceMap(ctx, data, view, can);
    if(!practiceActive && !vectorOnly && visualState.mapESP) drawESPMap(ctx, data, view, can);

    var displayData = data;
    if(practiceActive && !practiceState.revealed){
      var guessData = __practiceGuessData(data);
      displayData = Object.assign({}, data, { muR:guessData.muR, muMag:guessData.muMag });
      if(practiceState.enabled){
        (guessData.bonds||[]).forEach(function(d){
          if(!d || !d.dir) return;
          var pts = __bondArrowPointsFromSign(d.dir, (data.bondLen||1.55), d.sign, view, can);
          if(!pts.a || !pts.b) return;
          if(Math.hypot(pts.b.x-pts.a.x, pts.b.y-pts.a.y) < 10) return;
          drawArrow(ctx, pts.a, pts.b, d.sign > 0 ? '#7fe4ff' : '#ff93d8', 2.8, 9);
        });
      }
      if(guessData.filled === (data.bondDipoles||[]).length && guessData.filled > 0){
        if(displayData.muMag > 0.06){
          var ga = projectPoint([0,0,0], view, can) || pCenter;
          var gs = 0.74 + Math.min(0.78, displayData.muMag*0.18);
          var gb = projectPoint(vMul(vNorm(displayData.muR), (data.bondLen||1.55)*gs), view, can);
          if(gb) drawArrow(ctx, ga, gb, '#ffd34d', 3.2, 11);
          drawTextLabel(ctx, {x:pCenter.x, y:pCenter.y+74}, 'μR ≠ 0', '#f7fbff');
        } else {
          drawTextLabel(ctx, {x:pCenter.x, y:pCenter.y+74}, 'μR = 0', '#f7fbff');
        }
      } else {
        drawTextLabel(ctx, {x:pCenter.x, y:pCenter.y+74}, 'preencha os vetores de todas as ligações', '#f7fbff');
      }
    } else {
      if(visualState.bond || practiceActive){
        (data.bondDipoles||[]).forEach(function(d){
          if(!d || !d.dir) return;
          var pts = __bondArrowPointsFromSign(d.dir, (data.bondLen||1.55), d.sign || (ex.sign||1), view, can);
          if(!pts.a || !pts.b) return;
          if(Math.hypot(pts.b.x-pts.a.x, pts.b.y-pts.a.y) < 10) return;
          drawArrow(ctx, pts.a, pts.b, '#4ec7ff', 2.5, 8);
        });
      }
      if(displayData.muMag > 0.06){
        var a = projectPoint([0,0,0], view, can) || pCenter;
        var scale = 0.74 + Math.min(0.78, displayData.muMag*0.18);
        var b = projectPoint(vMul(vNorm(displayData.muR), (data.bondLen||1.55)*scale), view, can);
        if(b) drawArrow(ctx, a, b, '#ffd34d', 3.4, 12);
      } else {
        drawTextLabel(ctx, {x:pCenter.x, y:pCenter.y+74}, 'μR = 0', '#f7fbff');
      }
    }

    drawAtomSymbolLabels(ctx, projAtoms);
    renderPartialAtomUI(projAtoms, data, can, practiceActive);

    if(!practiceActive && !vectorOnly && visualState.deltas){
      var firstBondSign = (data.bondDipoles && data.bondDipoles[0] && data.bondDipoles[0].sign != null) ? data.bondDipoles[0].sign : (ex.sign||1);
      var centerNeg = firstBondSign < 0;
      drawTextLabel(ctx, {x:pCenter.x, y:pCenter.y- (centerNeg?58:48)}, centerNeg ? 'δ−' : 'δ+', centerNeg ? '#98b8ff' : '#ff9fb2');
      projAtoms.slice(1).forEach(function(it, idx){
        if(!it.p) return;
        var bondSign = (data.bondDipoles && data.bondDipoles[idx] && data.bondDipoles[idx].sign != null) ? data.bondDipoles[idx].sign : firstBondSign;
        var ligNeg = bondSign > 0;
        drawTextLabel(ctx, {x:it.p.x, y:it.p.y-42}, ligNeg ? 'δ−' : 'δ+', ligNeg ? '#98b8ff' : '#ff9fb2');
      });
    }

    if(((!practiceActive && !vectorOnly && visualState.angles) || practiceActive) && (typeof showAngles==='undefined' || !showAngles || showAngles.checked)){
      drawAngleOverlay(ctx, data, view, can);
    }


  }

  function raf(){
    drawPolarOverlay();
    requestAnimationFrame(raf);
  }

  onReady(function(api){
    apiRef = api; if(!apiRef) return;
    injectStyles();
    ensurePracticePanel();
    initPracticeCanvasInteractions();

    el = {
      hint: document.getElementById('focusHint')
    };

    var tutorialWrap = document.getElementById('tutorialWrap');
    if(tutorialWrap && tutorialWrap.parentNode) tutorialWrap.parentNode.removeChild(tutorialWrap);

    practiceState.enabled = true;

    if(apiRef.ui && apiRef.ui.lpColor) apiRef.ui.lpColor.value = '#1100ff';
    if(apiRef.ui && apiRef.ui.bgStars) apiRef.ui.bgStars.value = apiRef.ui.bgStars.value || '0.6';
    apiRef.setBoardSplit && apiRef.setBoardSplit(false);
    apiRef.clearBalloons && apiRef.clearBalloons();

    var bootExample = __practiceBank && __practiceBank[0] ? __practiceBank[0] : exampleCatalog.H2O;
    if(bootExample){
      activeExampleKey = bootExample.key;
      practiceState.currentKey = bootExample.key;
      setExampleColors(bootExample);
      apiRef.setGeom && apiRef.setGeom(bootExample.geom);
    }
    apiRef.sync();

    if(document.title) document.title = 'Exercícios de fixação · Polaridade e Geometria';
    ensureMapOptionsUI();
    ensureAngleOptionsUI();
    var legacyAnglePanel = document.getElementById('angleLegendPanel');
    if(legacyAnglePanel) legacyAnglePanel.style.display = 'none';

    raf();
    if(__practiceBank.length) loadPracticeExample(practiceState.currentKey || __practiceBank[0].key, {cam:false});
  });
})();
