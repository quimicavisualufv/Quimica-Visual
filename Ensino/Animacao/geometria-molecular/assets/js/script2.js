(function(){
  function onReady(fn){
    if(window.__geomTutorialAPI) return fn(window.__geomTutorialAPI);
    window.addEventListener('geom-api-ready', function(){ fn(window.__geomTutorialAPI); }, {once:true});
    setTimeout(function(){ if(window.__geomTutorialAPI) fn(window.__geomTutorialAPI); }, 80);
  }

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>\"]/g, function(m){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m];
    });
  }

  var apiRef = null;
  var el = {};
  var activeGeomKey = '';
  var activeExampleKey = '';

  var geometryViews = {
    linear:{camDist:4.2, rotX:0.14, rotY:0.05, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0},
    trigonal_planar:{camDist:4.85, rotX:0.16, rotY:-0.52, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0},
    tetrahedral:{camDist:5.2, rotX:0.38, rotY:-0.82, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0},
    trigonal_bipyramidal:{camDist:5.65, rotX:0.36, rotY:-0.58, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0},
    octahedral:{camDist:5.6, rotX:0.4, rotY:-0.64, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0},
    bent_tp:{camDist:4.8, rotX:0.3, rotY:-0.45, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0},
    trigonal_pyramidal:{camDist:5.0, rotX:0.34, rotY:-0.86, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0},
    bent_tet:{camDist:4.9, rotX:0.32, rotY:-0.72, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0},
    see_saw:{camDist:5.35, rotX:0.34, rotY:-0.58, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0},
    t_shaped:{camDist:5.05, rotX:0.26, rotY:-0.36, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0},
    linear_tbp:{camDist:4.25, rotX:0.15, rotY:0.04, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0},
    square_pyramidal:{camDist:5.45, rotX:0.42, rotY:-0.56, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0},
    square_planar:{camDist:5.0, rotX:0.18, rotY:-0.48, objRotXDeg:0, objRotYDeg:0, objRotZDeg:0}
  };

  var geometryTheme = {
    linear:{core:'#f4f7ff', ligand:'#6fd68c', lp:'#1100ff'},
    trigonal_planar:{core:'#f4f7ff', ligand:'#4ed5ff', lp:'#1100ff'},
    tetrahedral:{core:'#ffffff', ligand:'#7aa8ff', lp:'#1100ff'},
    trigonal_bipyramidal:{core:'#fff3cf', ligand:'#ff9b6b', lp:'#1100ff'},
    octahedral:{core:'#fff3cf', ligand:'#9b8cff', lp:'#1100ff'},
    bent_tp:{core:'#ffe7b1', ligand:'#ff7f7f', lp:'#1100ff'},
    trigonal_pyramidal:{core:'#e7efff', ligand:'#8bd7ff', lp:'#1100ff'},
    bent_tet:{core:'#fff0d8', ligand:'#9ee28f', lp:'#1100ff'},
    see_saw:{core:'#fff2d3', ligand:'#ffb15c', lp:'#1100ff'},
    t_shaped:{core:'#e7f1ff', ligand:'#82c1ff', lp:'#1100ff'},
    linear_tbp:{core:'#f6f8ff', ligand:'#b999ff', lp:'#1100ff'},
    square_pyramidal:{core:'#fff0cb', ligand:'#ff8d74', lp:'#1100ff'},
    square_planar:{core:'#edf4ff', ligand:'#67d8c4', lp:'#1100ff'}
  };

  var atomColors = {
    H:'#f2f4f8', C:'#3a3a3a', N:'#4f7cff', O:'#e14b4b', F:'#9be65b',
    Cl:'#35b44a', Br:'#a85c3a', I:'#7b5cd6', S:'#f1cf42', P:'#ff9f1c',
    B:'#f4b26b', Be:'#bfc9d9', Si:'#d0b084', Xe:'#6f7cf6', Kr:'#7f9dff',
    Hg:'#c3ccd8', Sn:'#9fb2c9', Se:'#e0a85a', Te:'#c88f62', As:'#8cb7d9',
    Al:'#b8c4d6', Sb:'#9ba8b8'
  };

  var geometryLigandCount = {
    linear:2, trigonal_planar:3, tetrahedral:4, trigonal_bipyramidal:5, octahedral:6,
    bent_tp:2, trigonal_pyramidal:3, bent_tet:2, see_saw:4, t_shaped:3,
    linear_tbp:2, square_pyramidal:5, square_planar:4
  };

  var structures = [
    { key:'linear', title:'Linear (AX2)', examples:[
      { key:'CO2', label:'CO₂', center:'C', ligand:'O', bondType:'2' },
      { key:'BeCl2', label:'BeCl₂', center:'Be', ligand:'Cl', bondType:'1' },
      { key:'CS2', label:'CS₂', center:'C', ligand:'S', bondType:'2' },
      { key:'HgCl2', label:'HgCl₂', center:'Hg', ligand:'Cl', bondType:'1' },
      { key:'HCN', label:'HCN', center:'C', ligands:['H','N'], bonds:['1','3'] }
    ]},
    { key:'trigonal_planar', title:'Trigonal planar (AX3)', examples:[
      { key:'BF3', label:'BF₃', center:'B', ligand:'F', bondType:'1' },
      { key:'BCl3', label:'BCl₃', center:'B', ligand:'Cl', bondType:'1' },
      { key:'SO3', label:'SO₃', center:'S', ligand:'O', bondType:'2' },
      { key:'NO3-', label:'NO₃⁻', center:'N', ligand:'O', bondType:'2' },
      { key:'CO3^2-', label:'CO₃²⁻', center:'C', ligand:'O', bondType:'2' }
    ]},
    { key:'tetrahedral', title:'Tetraédrica (AX4)', examples:[
      { key:'CH4', label:'CH₄', center:'C', ligand:'H', bondType:'1' },
      { key:'CCl4', label:'CCl₄', center:'C', ligand:'Cl', bondType:'1' },
      { key:'CF4', label:'CF₄', center:'C', ligand:'F', bondType:'1' },
      { key:'SiCl4', label:'SiCl₄', center:'Si', ligand:'Cl', bondType:'1' },
      { key:'NH4+', label:'NH₄⁺', center:'N', ligand:'H', bondType:'1' }
    ]},
    { key:'trigonal_bipyramidal', title:'Bipirâmide trigonal (AX5)', examples:[
      { key:'PCl5', label:'PCl₅', center:'P', ligand:'Cl', bondType:'1' },
      { key:'PF5', label:'PF₅', center:'P', ligand:'F', bondType:'1' },
      { key:'PBr5', label:'PBr₅', center:'P', ligand:'Br', bondType:'1' },
      { key:'AsF5', label:'AsF₅', center:'As', ligand:'F', bondType:'1' },
      { key:'SbCl5', label:'SbCl₅', center:'Sb', ligand:'Cl', bondType:'1' }
    ]},
    { key:'octahedral', title:'Octaédrica (AX6)', examples:[
      { key:'SF6', label:'SF₆', center:'S', ligand:'F', bondType:'1' },
      { key:'SeF6', label:'SeF₆', center:'Se', ligand:'F', bondType:'1' },
      { key:'PF6-', label:'PF₆⁻', center:'P', ligand:'F', bondType:'1' },
      { key:'SiF6^2-', label:'SiF₆²⁻', center:'Si', ligand:'F', bondType:'1' },
      { key:'AlF6^3-', label:'AlF₆³⁻', center:'Al', ligand:'F', bondType:'1' }
    ]},
    { key:'bent_tp', title:'Angular (AX2E)', examples:[
      { key:'SO2', label:'SO₂', center:'S', ligand:'O', bondType:'2' },
      { key:'O3', label:'O₃', center:'O', ligand:'O', bondType:'2' },
      { key:'NO2-', label:'NO₂⁻', center:'N', ligand:'O', bondType:'2' },
      { key:'SnCl2', label:'SnCl₂', center:'Sn', ligand:'Cl', bondType:'1' },
      { key:'SeO2', label:'SeO₂', center:'Se', ligand:'O', bondType:'2' }
    ]},
    { key:'trigonal_pyramidal', title:'Piramidal trigonal (AX3E)', examples:[
      { key:'NH3', label:'NH₃', center:'N', ligand:'H', bondType:'1' },
      { key:'NF3', label:'NF₃', center:'N', ligand:'F', bondType:'1' },
      { key:'PCl3', label:'PCl₃', center:'P', ligand:'Cl', bondType:'1' },
      { key:'PH3', label:'PH₃', center:'P', ligand:'H', bondType:'1' },
      { key:'H3O+', label:'H₃O⁺', center:'O', ligand:'H', bondType:'1' }
    ]},
    { key:'bent_tet', title:'Angular (AX2E2)', examples:[
      { key:'H2O', label:'H₂O', center:'O', ligand:'H', bondType:'1' },
      { key:'OF2', label:'OF₂', center:'O', ligand:'F', bondType:'1' },
      { key:'SCl2', label:'SCl₂', center:'S', ligand:'Cl', bondType:'1' },
      { key:'SeCl2', label:'SeCl₂', center:'Se', ligand:'Cl', bondType:'1' },
      { key:'H2S', label:'H₂S', center:'S', ligand:'H', bondType:'1' }
    ]},
    { key:'see_saw', title:'Gangorra / Seesaw (AX4E)', examples:[
      { key:'SF4', label:'SF₄', center:'S', ligand:'F', bondType:'1' },
      { key:'SeF4', label:'SeF₄', center:'Se', ligand:'F', bondType:'1' },
      { key:'TeF4', label:'TeF₄', center:'Te', ligand:'F', bondType:'1' },
      { key:'SeCl4', label:'SeCl₄', center:'Se', ligand:'Cl', bondType:'1' },
      { key:'TeCl4', label:'TeCl₄', center:'Te', ligand:'Cl', bondType:'1' }
    ]},
    { key:'t_shaped', title:'Em T (AX3E2)', examples:[
      { key:'ClF3', label:'ClF₃', center:'Cl', ligand:'F', bondType:'1' },
      { key:'BrF3', label:'BrF₃', center:'Br', ligand:'F', bondType:'1' },
      { key:'IF3', label:'IF₃', center:'I', ligand:'F', bondType:'1' },
      { key:'ICl3', label:'ICl₃', center:'I', ligand:'Cl', bondType:'1' },
      { key:'XeOF2', label:'XeOF₂', center:'Xe', ligands:['O','F','F'], bonds:['2','1','1'] }
    ]},
    { key:'linear_tbp', title:'Linear (AX2E3)', examples:[
      { key:'XeF2', label:'XeF₂', center:'Xe', ligand:'F', bondType:'1' },
      { key:'I3-', label:'I₃⁻', center:'I', ligand:'I', bondType:'1' },
      { key:'ICl2-', label:'ICl₂⁻', center:'I', ligand:'Cl', bondType:'1' },
      { key:'BrF2-', label:'BrF₂⁻', center:'Br', ligand:'F', bondType:'1' },
      { key:'KrF2', label:'KrF₂', center:'Kr', ligand:'F', bondType:'1' }
    ]},
    { key:'square_pyramidal', title:'Piramidal quadrada (AX5E)', examples:[
      { key:'BrF5', label:'BrF₅', center:'Br', ligand:'F', bondType:'1' },
      { key:'IF5', label:'IF₅', center:'I', ligand:'F', bondType:'1' },
      { key:'ClF5', label:'ClF₅', center:'Cl', ligand:'F', bondType:'1' },
      { key:'XeOF4', label:'XeOF₄', center:'Xe', ligand:'F', bondType:'1' },
      { key:'SeF5-', label:'SeF₅⁻', center:'Se', ligand:'F', bondType:'1' }
    ]},
    { key:'square_planar', title:'Quadrada planar (AX4E2)', examples:[
      { key:'XeF4', label:'XeF₄', center:'Xe', ligand:'F', bondType:'1' },
      { key:'ICl4-', label:'ICl₄⁻', center:'I', ligand:'Cl', bondType:'1' },
      { key:'BrF4-', label:'BrF₄⁻', center:'Br', ligand:'F', bondType:'1' },
      { key:'IF4-', label:'IF₄⁻', center:'I', ligand:'F', bondType:'1' },
      { key:'ClF4-', label:'ClF₄⁻', center:'Cl', ligand:'F', bondType:'1' }
    ]}
  ];

  function getStructure(key){
    for(var i=0;i<structures.length;i++) if(structures[i].key === key) return structures[i];
    return structures[0];
  }

  function getExampleByKey(key){
    for(var i=0;i<structures.length;i++){
      var arr = structures[i].examples || [];
      for(var j=0;j<arr.length;j++) if(arr[j].key === key) return arr[j];
    }
    return null;
  }

  function getExampleLigands(example, structure){
    var count = geometryLigandCount[(structure && structure.key) || (example && example.geom) || activeGeomKey] || 0;
    if(example && Array.isArray(example.ligands) && example.ligands.length){
      var ligands = example.ligands.slice(0, count || example.ligands.length);
      while(count && ligands.length < count) ligands.push(ligands[ligands.length - 1] || example.ligand || 'X');
      return ligands;
    }
    var single = (example && example.ligand) || 'X';
    return Array.from({length:count || 0}, function(){ return single; });
  }

  function getExampleBonds(example, structure){
    var count = geometryLigandCount[(structure && structure.key) || (example && example.geom) || activeGeomKey] || 0;
    if(example && Array.isArray(example.bonds) && example.bonds.length){
      var bonds = example.bonds.slice(0, count || example.bonds.length);
      while(count && bonds.length < count) bonds.push(bonds[bonds.length - 1] || example.bondType || '1');
      return bonds;
    }
    var single = String((example && example.bondType) || '1');
    return Array.from({length:count || 0}, function(){ return single; });
  }

  function getExampleLegend(example, structure){
    var legend = [];
    var seen = {};
    function add(symbol, role){
      if(!symbol || seen[symbol]) return;
      seen[symbol] = true;
      legend.push({ symbol:symbol, color:atomColors[symbol] || '#7aa8ff', role:role || '' });
    }
    add(example.center, 'central');
    getExampleLigands(example, structure).forEach(function(symbol){ add(symbol, 'ligante'); });
    return legend;
  }

  function pulseCard(){
    if(!el.card) return;
    el.card.classList.remove('stepPulse');
    void el.card.offsetWidth;
    el.card.classList.add('stepPulse');
    setTimeout(function(){ if(el.card) el.card.classList.remove('stepPulse'); }, 700);
  }

  function setGeometryTheme(structure){
    if(!apiRef || !apiRef.ui) return;
    var theme = geometryTheme[structure.key] || {core:'#ffffff', ligand:'#7aa8ff', lp:'#1100ff'};
    if(apiRef.ui.coreColor) apiRef.ui.coreColor.value = theme.core;
    if(apiRef.ui.ligandColor) apiRef.ui.ligandColor.value = theme.ligand;
    if(apiRef.ui.lpColor) apiRef.ui.lpColor.value = theme.lp;
    if(apiRef.ui.showAngles) apiRef.ui.showAngles.checked = true;
    if(apiRef.ui.showAxes) apiRef.ui.showAxes.checked = true;
    if(apiRef.ui.lpScale){
      var lpBoost = /E2|E3/.test(structure.title) ? 1.3 : (/E\)/.test(structure.title) ? 1.15 : 1.0);
      apiRef.ui.lpScale.value = String(lpBoost);
    }
  }

  function setExampleVisuals(example, structure){
    if(!apiRef || !apiRef.ui) return;
    var theme = geometryTheme[structure.key] || {};
    var ligandElements = getExampleLigands(example, structure);
    var bondKinds = getExampleBonds(example, structure);
    var core = atomColors[example.center] || theme.core || '#ffffff';
    var ligand = atomColors[ligandElements[0]] || theme.ligand || '#7aa8ff';
    if(apiRef.ui.coreColor) apiRef.ui.coreColor.value = core;
    if(apiRef.ui.ligandColor) apiRef.ui.ligandColor.value = ligand;
    if(apiRef.ui.lpColor) apiRef.ui.lpColor.value = theme.lp || '#1100ff';
    if(apiRef.ui.bondType) apiRef.ui.bondType.value = String(bondKinds[0] || example.bondType || '1');
    if(apiRef.setAtomOverrides){
      apiRef.setAtomOverrides({
        core: core,
        ligands: ligandElements.map(function(symbol){ return atomColors[symbol] || theme.ligand || '#7aa8ff'; }),
        bonds: bondKinds
      });
    }
  }

  function renderExamples(){
    if(!el.examples) return;
    var structure = getStructure(activeGeomKey);
    var list = structure.examples || [];
    if(!list.length){
      el.examples.innerHTML = '';
      return;
    }
    var current = getExampleByKey(activeExampleKey) || list[0];
    var html = '';
    html += '<div class="small" style="margin:2px 0 8px; opacity:.92"><b>Exemplo(s):</b></div>';
    html += '<div class="exBtns">' + list.map(function(item){
      return '<button type="button" class="exBtn' + (item.key === current.key ? ' active' : '') + '" data-ex-key="' + esc(item.key) + '">' + esc(item.label) + '</button>';
    }).join('') + '</div>';
    var legend = getExampleLegend(current, structure);
    html += '<div class="exHelp">Clique para alternar entre moléculas da estrutura selecionada.</div>';
    html += '<div class="legendDots">' +
      legend.map(function(item){
        return '<span class="dotItem"><span class="dot" style="background:' + esc(item.color) + '"></span>' + esc(item.symbol) + '</span>';
      }).join('') +
      '<span class="dotItem"><span class="dot" style="background:#5f7dff"></span>nuvem eletrônica</span>' +
    '</div>';
    el.examples.innerHTML = html;
  }

  function bindExampleEvents(){
    if(!el.examples) return;
    var buttons = el.examples.querySelectorAll('[data-ex-key]');
    buttons.forEach(function(btn){
      btn.addEventListener('click', function(){
        var key = btn.getAttribute('data-ex-key') || '';
        if(!key) return;
        applyExample(key, {animate:true, pulse:true, syncSelect:true});
      });
    });
  }

  function updateInfo(example, structure){
    if(!apiRef || !apiRef.ui) return;
    if(apiRef.ui.infoName) apiRef.ui.infoName.textContent = example.label;
    if(apiRef.ui.infoArr) apiRef.ui.infoArr.textContent = structure.title;
    if(apiRef.ui.infoIdeal) apiRef.ui.infoIdeal.textContent = 'Estrutura: ' + structure.title;
    var hud = document.getElementById('hud');
    if(hud) hud.innerHTML = '<b>' + esc(example.label) + '</b> · <span class="small">' + esc(structure.title) + '</span>';
  }

  function applyGeometry(key, opts){
    var structure = getStructure(key);
    activeGeomKey = structure.key;
    setGeometryTheme(structure);
    if(apiRef){
      apiRef.setGeom(structure.key);
      apiRef.sync();
      if(opts && opts.animate !== false && apiRef.animateTo){
        var view = geometryViews[structure.key] || geometryViews.tetrahedral;
        try{ apiRef.animateTo(view, 650); }catch(_e){}
      }
    }
    if(opts && opts.syncSelect && apiRef && apiRef.ui && apiRef.ui.geom && apiRef.ui.geom.value !== structure.key){
      apiRef.ui.geom.value = structure.key;
    }
    var first = (structure.examples && structure.examples[0]) ? structure.examples[0].key : '';
    if(first) applyExample(first, {animate:false, pulse:!(opts && opts.silent), syncSelect:false});
    else {
      renderExamples();
      bindExampleEvents();
      if(!opts || opts.pulse !== false) pulseCard();
    }
  }

  function applyExample(key, opts){
    var example = getExampleByKey(key);
    if(!example || !apiRef) return;
    var structure = getStructure(example.geom || activeGeomKey || (apiRef.ui && apiRef.ui.geom ? apiRef.ui.geom.value : 'linear'));
    activeGeomKey = structure.key;
    activeExampleKey = example.key;

    if(apiRef.ui && apiRef.ui.geom && apiRef.ui.geom.value !== structure.key){
      apiRef.ui.geom.value = structure.key;
    }
    setGeometryTheme(structure);
    setExampleVisuals(example, structure);
    apiRef.setGeom(structure.key);
    apiRef.sync();
    renderExamples();
    bindExampleEvents();
    updateInfo(example, structure);

    if(opts && opts.animate !== false && apiRef.animateTo){
      var view = geometryViews[structure.key] || geometryViews.tetrahedral;
      try{ apiRef.animateTo(view, 650); }catch(_e){}
    }
    if(!opts || opts.pulse !== false) pulseCard();
  }

  function init(api){
    apiRef = api;
    el = {
      card: document.getElementById('tutorialCard'),
      examples: document.getElementById('tutorialExamples')
    };

    var initialKey = (apiRef && apiRef.ui && apiRef.ui.geom && apiRef.ui.geom.value) ? apiRef.ui.geom.value : 'linear';
    applyGeometry(initialKey, {animate:false, pulse:false, syncSelect:false, silent:true});

    if(apiRef && apiRef.ui && apiRef.ui.geom){
      apiRef.ui.geom.addEventListener('change', function(){
        applyGeometry(apiRef.ui.geom.value || 'linear', {animate:true, pulse:false, syncSelect:false});
      });
      apiRef.ui.geom.addEventListener('input', function(){
        applyGeometry(apiRef.ui.geom.value || 'linear', {animate:false, pulse:false, syncSelect:false});
      });
    }
  }

  onReady(init);
})();
