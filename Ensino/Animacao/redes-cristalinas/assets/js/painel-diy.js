

(function(){
  try{
    function ensureDIY(){
      if (!window.STRUCTURES) window.STRUCTURES = {};
      if (!STRUCTURES.DIY || !Object.getOwnPropertyDescriptor(STRUCTURES.DIY, 'species') || !Object.getOwnPropertyDescriptor(STRUCTURES.DIY, 'metricM')){
        STRUCTURES.DIY = STRUCTURES.DIY || {};
        Object.defineProperty(STRUCTURES.DIY, 'species', { configurable:true, get(){
          return (window.stateDIY.atoms||[]).map((a,i)=>( { type:'D'+i, pos:[+a.x||0, +a.y||0, +a.z||0], color:a.color, rScale:+a.rScale||1} ));
        }});
        Object.defineProperty(STRUCTURES.DIY, 'metricM', { configurable:true, get(){
          const c=window.stateDIY.cell||{a:1,b:1,c:1,alpha:90,beta:90,gamma:90};
          return cellMatrix(+c.a||1, +c.b||1, +c.c||1, +c.alpha||90, +c.beta||90, +c.gamma||90);
        }});
      }
    }

    const sel = document.getElementById('structure');
    if(sel && !Array.from(sel.options).some(o=>o.value==='DIY')){
      const opt = document.createElement('option');
      opt.value='DIY'; opt.textContent='Faça você mesmo (DIY)';
      sel.appendChild(opt);
    }
    const controls = sel ? (sel.closest('.controls') || document.querySelector('.controls')) : document.querySelector('.controls');
    const diy = document.createElement('div'); diy.id='diyBox'; diy.style.display='none';
    diy.style.gridColumn='1 / -1'; diy.style.width='100%'; diy.style.boxSizing='border-box';
    diy.style.borderTop='1px solid #334155'; diy.style.marginTop='10px'; diy.style.padding='10px 8px 8px 8px'; diy.style.borderRadius='10px';
    diy.innerHTML = `
      <div style="position:sticky; top:0; background:#0b1220; z-index:1; font-weight:700; padding:4px 2px; border-bottom:1px solid #1f2a44; margin:-10px -8px 6px -8px;">Faça você mesmo</div>
      <div style="margin-top:8px; display:grid; grid-template-columns: 1fr 1fr; gap:6px; align-items:end;">
        <label style="grid-column:1 / -1;">Formato da célula
          <select id="diy_format">
            <option value="cubic">Cúbica (α=β=γ=90°; a=b=c)</option>
            <option value="tetragonal">Tetragonal (α=β=γ=90°; a=b≠c)</option>
            <option value="orthorhombic">Ortorrômbica (α=β=γ=90°; a≠b≠c)</option>
            <option value="hexagonal">Hexagonal (α=β=90°, γ=120°; a=b≠c)</option>
            <option value="rhombohedral">Romboédrica/Trigonal (α=β=γ≠90°; a=b=c)</option>
            <option value="monoclinic">Monoclínica (α=γ=90°, β≠90°)</option>
            <option value="triclinic">Triclínica (α≠β≠γ; a≠b≠c)</option>
          </select>
        </label>
      </div>

      <div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:6px; font-size:12px; align-items:end;">
        <label>a <input id="diy_a" type="number" step="0.01" min="0.1" value="1"></label>
        <label>b <input id="diy_b" type="number" step="0.01" min="0.1" value="1"></label>
        <label>c <input id="diy_c" type="number" step="0.01" min="0.1" value="1"></label>
        <label>α <input id="diy_alpha" type="number" step="0.1" min="10" max="170" value="90"></label>
        <label>β <input id="diy_beta" type="number" step="0.1" min="10" max="170" value="90"></label>
        <label>γ <input id="diy_gamma" type="number" step="0.1" min="10" max="170" value="90"></label>
      </div>
      <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
        <button id="diy_add" type="button">Adicionar átomo</button>
        <button id="diy_clear" type="button">Limpar átomos</button>
        <button id="diy_export" type="button">Exportar JSON</button>
        <label style="display:inline-flex; align-items:center; gap:6px;">Importar JSON <input id="diy_import" type="file" accept="application/json" style="font-size:11px;"></label>
      </div>
      <div id="diy_atoms" style="margin-top:8px; display:flex; flex-direction:column; gap:6px;"></div>
      <div style="font-size:11px; opacity:.8; margin-top:6px;">Dica: posicione em coordenadas fracionárias (0→1). O tamanho escala o raio global.</div>
    `;
    if(controls){
      const footer = controls.querySelector('.footer');
      controls.insertBefore(diy, footer || null);
    }

    const LS='DIY_CONFIG_V1';
    const def = { format:'cubic', cell:{a:1,b:1,c:1, alpha:90,beta:90,gamma:90}, atoms:[{x:0,y:0,z:0, rScale:1, color:'#60a5fa', label:'A'}] };
    window.stateDIY = (function(){ try{ return JSON.parse(localStorage.getItem(LS)||'null') || def; }catch(e){ return def; } })();

    function saveDIY(){ try{ localStorage.setItem(LS, JSON.stringify(window.stateDIY)); }catch(e){} }

    
    const aI = diy.querySelector('#diy_a'), bI=diy.querySelector('#diy_b'), cI=diy.querySelector('#diy_c');
    const alI = diy.querySelector('#diy_alpha'), beI=diy.querySelector('#diy_beta'), gaI=diy.querySelector('#diy_gamma');
    function syncCellToUI(){
      const _fmtSel = diy.querySelector('#diy_format'); if(_fmtSel && stateDIY.format) _fmtSel.value = stateDIY.format;
      aI.value=stateDIY.cell.a; bI.value=stateDIY.cell.b; cI.value=stateDIY.cell.c;
      alI.value=stateDIY.cell.alpha; beI.value=stateDIY.cell.beta; gaI.value=stateDIY.cell.gamma;
    }
    function readCellFromUI(){
      stateDIY.cell.a=+aI.value||1; stateDIY.cell.b=+bI.value||1; stateDIY.cell.c=+cI.value||1;
      stateDIY.cell.alpha=+alI.value||90; stateDIY.cell.beta=+beI.value||90; stateDIY.cell.gamma=+gaI.value||90;
      saveDIY(); rebuild();
    }
    [aI,bI,cI,alI,beI,gaI].forEach(inp => inp.addEventListener('input', readCellFromUI));

    const atomsBox = diy.querySelector('#diy_atoms');
    function renderDIYAtoms(){
      atomsBox.innerHTML='';
      (stateDIY.atoms||[]).forEach((atom, idx)=>{
        const row = document.createElement('div');
        row.style.display='flex';
        row.style.flexWrap='wrap';
        row.style.gap='6px';
        row.style.alignItems='flex-end';
        row.style.fontSize='12px';
        row.style.padding='6px';
        row.style.border='1px dashed #334155';
        row.style.borderRadius='8px';
        row.innerHTML = `
          <div style="opacity:.8;">#${idx+1}</div>
          <label>x <input type="number" step="0.01" min="0" max="1" value="${atom.x??0}"></label>
          <label>y <input type="number" step="0.01" min="0" max="1" value="${atom.y??0}"></label>
          <label>z <input type="number" step="0.01" min="0" max="1" value="${atom.z??0}"></label>
          <label>escala (%) <input class="diy_scale" type="number" step="1" min="20" max="400" value="${Math.round((atom.rScale||1)*100)}"></label>
          <label>cor <input type="color" value="${atom.color || '#60a5fa'}"></label>
          <label>rótulo <input type="text" maxlength="2" value="${atom.label || 'A'}"></label>
          <button type="button" aria-label="remover">×</button>
        `;
        const [idCol, xI, yI, zI, sI, cI, tI, rmBtn] = row.children
        
        idCol.style.minWidth='32px';
        idCol.style.padding='4px 0';
        rmBtn.style.width='32px';
        rmBtn.style.height='32px';
        rmBtn.style.alignSelf='flex-start';
        row.querySelectorAll('label').forEach(l=>{
          l.style.flex='1 1 calc(33% - 6px)';
          l.style.minWidth='110px';
        });
        xI.querySelector('input').addEventListener('input', e=>{ atom.x=+e.target.value; saveDIY(); rebuild(); });
        yI.querySelector('input').addEventListener('input', e=>{ atom.y=+e.target.value; saveDIY(); rebuild(); });
        zI.querySelector('input').addEventListener('input', e=>{ atom.z=+e.target.value; saveDIY(); rebuild(); });
        sI.querySelector('input').addEventListener('input', e=>{ atom.rScale=(+e.target.value)/100; if(!(atom.r>0)){} saveDIY(); rebuild(); });
        cI.querySelector('input').addEventListener('input', e=>{ atom.color=e.target.value; saveDIY(); rebuild(); });
        tI.querySelector('input').addEventListener('input', e=>{ atom.label=e.target.value; saveDIY(); rebuild(); });
        rmBtn.addEventListener('click', ()=>{ stateDIY.atoms.splice(idx,1); saveDIY(); renderDIYAtoms(); rebuild(); });
        atomsBox.appendChild(row);
      });
    }

    diy.querySelector('#diy_add').addEventListener('click', ()=>{
      stateDIY.atoms.push({x:0.25, y:0.25, z:0.25, rScale:1, color:'#93c5fd', label:'A'});
      saveDIY(); renderDIYAtoms(); rebuild();
    });
    diy.querySelector('#diy_clear').addEventListener('click', ()=>{
      stateDIY.atoms.length=0; saveDIY(); renderDIYAtoms(); rebuild();
    });
    diy.querySelector('#diy_export').addEventListener('click', ()=>{
      
      const cellsVal = (typeof ui!=='undefined' && ui && ui.cells) ? (+ui.cells.value||1) : 1;
      let bonds = [];
      try{
        bonds = (typeof bondsForCurrent==='function') ? bondsForCurrent() : [];
        bonds = bonds.filter(x => (x.key||state.key)==='DIY' && (+x.cells||cellsVal)===cellsVal)
                     .map(x => ({a:x.a, b:x.b}));
      }catch(e){ bonds = []; }
      let coords = [];
      try{
        coords = (typeof coordsForCurrent==='function') ? coordsForCurrent() : [];
        coords = coords.filter(x => (x.key||state.key)==='DIY' && (+x.cells||cellsVal)===cellsVal)
                       .map(x => ({center:x.center, neighbor:x.neighbor}));
      }catch(e){ coords = []; }
      const payload = Object.assign({}, window.stateDIY || {}, { key:'DIY', cells: cellsVal, bonds, coords });
      const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
      const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='DIY_estrutura.json'; a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href), 500);
    });
    diy.querySelector('#diy_import').addEventListener('change', (ev)=>{
      const f=ev.target.files && ev.target.files[0]; if(!f) return;
      const rd = new FileReader();
      rd.onload = ()=>{
        try{
          const data = JSON.parse(rd.result);
          if(data && data.cell && Array.isArray(data.atoms)){
            
            window.stateDIY = { format: data.format || (window.stateDIY && window.stateDIY.format) || 'cubic',
                                 cell: data.cell, atoms: data.atoms };
            saveDIY(); syncCellToUI(); renderDIYAtoms();
            
            const cellsVal = +data.cells || (ui && ui.cells ? +ui.cells.value||1 : 1);
            if(Array.isArray(data.bonds)){
              data.bonds.forEach(rec=>{
                try{
                  const norm = { key:'DIY', cells: cellsVal, a:rec.a, b:rec.b };
                  const id = bondId(norm);
                  if(!ALL_BONDS.some(x=>x.key==='DIY' && +x.cells===cellsVal && bondId(x)===id)){
                    ALL_BONDS.push(norm);
                  }
                }catch(e){}
              });
              saveLocal();
            }
            
            if(Array.isArray(data.coords)){
              data.coords.forEach(rec=>{
                try{
                  const norm = { key:'DIY', cells: cellsVal, center:rec.center, neighbor:rec.neighbor };
                  const id = coordId(norm);
                  if(!ALL_COORDS.some(x=>x.key==='DIY' && +x.cells===cellsVal && coordId(x)===id)){
                    ALL_COORDS.push(norm);
                  }
                }catch(e){}
              });
              saveLocalCoord();
            }
            rebuild();
          }else{ alert('JSON inválido.'); }
        }catch(e){ alert('Falha ao ler JSON.'); }
      };
      rd.readAsText(f);
    });

    
    if(typeof window.STRUCTURES==='object'){
      if(!STRUCTURES.DIY) STRUCTURES.DIY = {};
      Object.defineProperty(STRUCTURES.DIY, 'species', { configurable:true, get(){
        return (window.stateDIY.atoms||[]).map((a,i)=>( { type:'D'+i, pos:[+a.x||0, +a.y||0, +a.z||0], color:a.color, rScale:+a.rScale||1} ));
      }});
      Object.defineProperty(STRUCTURES.DIY, 'metricM', { configurable:true, get(){
        const c=window.stateDIY.cell||{a:1,b:1,c:1,alpha:90,beta:90,gamma:90};
        return cellMatrix(+c.a||1, +c.b||1, +c.c||1, +c.alpha||90, +c.beta||90, +c.gamma||90);
      }});
    }

    function refreshDIYColors(){
      try{
        (window.stateDIY.atoms||[]).forEach((a,i)=>{ COLORS['D'+i] = a.color || '#60a5fa'; });
      }catch(e){}
    }

    
    if(!window._buildLatticeOrig){ window._buildLatticeOrig = window.buildLattice; }
    window.buildLattice = function(a,b,c){ ensureDIY();
      const useDIY = ((typeof a==='string' && a==='DIY') || (a && typeof a==='object' && a.key==='DIY'));
      if(useDIY){
        const cellsVal = (typeof ui!=='undefined' && ui && ui.cells) ? (+ui.cells.value||1) : 1;
        const n = (typeof a==='object') ? (c||b||cellsVal) : (b||cellsVal);
        const def = STRUCTURES.DIY;
        const basis = def.species;
        const M = def.metricM;
        const atoms=[];
        for(let i=0;i<n;i++) for(let j=0;j<n;j++) for(let l=0;l<n;l++){
          for(const bb of basis){
            const f0=(bb.pos[0]||0)+i, f1=(bb.pos[1]||0)+j, f2=(bb.pos[2]||0)+l;
            const uc=[f0 - n/2, f1 - n/2, f2 - n/2];
            const pos=matMulVec(M, uc);
            atoms.push({ type:bb.type, fpos:[f0,f1,f2], uc:uc, pos:pos, color:bb.color, rScale:bb.rScale, r:bb.radius });
          }
        }
        refreshDIYColors();
        return atoms;
      }
      return window._buildLatticeOrig.apply(this, arguments);
    };

    function syncDiyVisibility(){ diy.style.display = (ui.structure.value==='DIY') ? '' : 'none'; }
    if(sel) sel.addEventListener('change', syncDiyVisibility);
    syncDiyVisibility();
    
    
    function toggleRadiusVisibility(){
      if(ui && ui.structure && ui.structure.value==='DIY' && ui.radius){ const wrap = ui.radius.closest('label')||ui.radius.parentElement; wrap && (wrap.style.display='none'); }
      const isDIY = (ui.structure && ui.structure.value==='DIY');
      const radiusEl = ui.radius && ui.radius.closest ? ui.radius.closest('label') || ui.radius.parentElement : null;
      if(radiusEl){
        if(isDIY){ radiusEl.style.display='none'; }
        else{ radiusEl.style.display=''; }
      }
    }
    if(ui && ui.structure){ ui.structure.addEventListener('change', toggleRadiusVisibility); }
    toggleRadiusVisibility();

    
    if(!ui.radius){
      const hidden = document.createElement('input');
      hidden.type='range'; hidden.min='1'; hidden.max='80'; hidden.value= window._radiusDefault || 12;
      hidden.style.display='none'; hidden.id='radius_hidden_diy';
      ui.radius = hidden;
      controls && controls.appendChild(hidden);
    }


    syncCellToUI(); renderDIYAtoms(); refreshDIYColors(); ensureDIY();
    
    const fmtSel = diy.querySelector('#diy_format');
    function applyFormatPreset(val){ stateDIY.format = val;
      const c = stateDIY.cell;
      if(val==='cubic'){ c.alpha=90; c.beta=90; c.gamma=90; c.b=c.a; c.c=c.a; } else if(val==='tetragonal'){ c.alpha=90; c.beta=90; c.gamma=90; c.b=c.a; if(!c.c||Math.abs(c.c-c.a)<1e-6){ c.c = +(c.a*1.5).toFixed(3); } } else if(val==='orthorhombic'){ c.alpha=90; c.beta=90; c.gamma=90; if(!c.b||Math.abs(c.b-c.a)<1e-6){ c.b = +(c.a*1.25).toFixed(3); } if(!c.c||Math.abs(c.c-c.a)<1e-6){ c.c = +(c.a*1.6).toFixed(3); } }
      else if(val==='hexagonal'){ c.alpha=90; c.beta=90; c.gamma=120; c.b=c.a; }
      else if(val==='rhombohedral'){ c.alpha=70; c.beta=70; c.gamma=70; c.b=c.a; c.c=c.a; } 
      else if(val==='monoclinic'){ c.alpha=90; c.beta=110; c.gamma=90; }
      else if(val==='triclinic'){ c.alpha=95; c.beta=105; c.gamma=100; }
      saveDIY(); syncCellToUI(); rebuild();
    }
    if(fmtSel){ fmtSel.addEventListener('change', e=>applyFormatPreset(e.target.value)); if(!stateDIY.format){ stateDIY.format = fmtSel.value; saveDIY(); } }

  }catch(e){ console.warn('DIY init error', e); }
})();


document.addEventListener('DOMContentLoaded', ()=>{
  try{ refreshAddAtomTypes(); }catch(e){}
  try{ if(ui && ui.struct){ ui.struct.addEventListener('change', ()=>{ try{ refreshAddAtomTypes(); }catch(e){} }); } }catch(e){}
});


    
    function __hexP_inUnitCell_fromFrac(x, y, z, eps){
      
      const inHex = Math.abs(x) <= 0.5 + eps && Math.abs(y) <= 0.5 + eps && Math.abs(x + y) <= 0.5 + eps;
      return inHex && z >= -0.5 - eps && z <= 0.5 + eps;
    }
    function inUnitCell(a){
      const eps = 1e-6;
      const x = (a.uc && a.uc[0]!==undefined) ? a.uc[0] : (a.x_uc ?? a.x ?? 0);
      const y = (a.uc && a.uc[1]!==undefined) ? a.uc[1] : (a.y_uc ?? a.y ?? 0);
      const z = (a.uc && a.uc[2]!==undefined) ? a.uc[2] : (a.z_uc ?? a.z ?? 0);
      const isHex = (window.state && (state.key==='DIY' && window.stateDIY && stateDIY.format==='hexagonal'));
      if (isHex) return __hexP_inUnitCell_fromFrac(x,y,z,eps);
      return (x>=-0.5-eps && x<=0.5+eps && y>=-0.5-eps && y<=0.5+eps && z>=-0.5-eps && z<=0.5+eps);
    }
    function inUnitCellUC(uc){
      const eps = 1e-6;
      const x=uc[0], y=uc[1], z=uc[2];
      const isHex = (window.state && (state.key==='DIY' && window.stateDIY && stateDIY.format==='hexagonal'));
      if (isHex) return __hexP_inUnitCell_fromFrac(x,y,z,eps);
      return (x>=-0.5-eps && x<=0.5+eps && y>=-0.5-eps && y<=0.5+eps && z>=-0.5-eps && z<=0.5+eps);
    }
    
    
