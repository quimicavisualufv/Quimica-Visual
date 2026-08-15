(function(){
  function $(sel, root=document){ return root.querySelector(sel); }
  function $$(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function normalizeMode(value){ const v = String(value || '').toLowerCase(); return (v === 'crossword' || v === 'cw' || v === 'cruzadinha') ? 'crossword' : 'wordsearch'; }
  function normalizeDifficulty(value){ const v = String(value || '').toLowerCase(); return (v === 'easy' || v === 'facil') ? 'easy' : (v === 'hard' || v === 'dificil' || v === 'difícil') ? 'hard' : 'medium'; }
  function getParams(){ const params = new URLSearchParams(window.location.search); return { mode: normalizeMode(params.get('mode') || window.location.hash.replace('#','')), difficulty: normalizeDifficulty(params.get('difficulty') || 'medium') }; }
  function setBoardSize(board, cols, maxWidth){ const viewport = Math.min(window.innerWidth - 24, maxWidth || 900); const gap = 4; const size = Math.max(20, Math.min(42, Math.floor((viewport - (cols - 1) * gap) / cols))); board.style.setProperty('--cell-size', size + 'px'); board.style.gridTemplateColumns = `repeat(${cols}, ${size}px)`; }
  function initLauncher(){
    const launcher = document.getElementById('launcher');
    if(!launcher || !Array.isArray(window.PUZZLE_THEMES)) return;
    const modeWrap = document.getElementById('launch-mode');
    const diffWrap = document.getElementById('launch-difficulty');
    const themeWrap = document.getElementById('launch-theme');
    let selectedMode = null, selectedDifficulty = null;
    function ready(){ return !!selectedMode && !!selectedDifficulty; }
    window.PUZZLE_THEMES.forEach(theme => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-item disabled';
      button.innerHTML = `<div class="theme-main">${theme.title}</div>`;
      button.addEventListener('click', () => {
        if(!ready()) return;
        window.location.href = `${theme.file}?mode=${selectedMode}&difficulty=${selectedDifficulty}`;
      });
      themeWrap.appendChild(button);
    });
    function refreshThemeState(){ $$('.theme-item', themeWrap).forEach(btn => { btn.classList.toggle('disabled', !ready()); btn.setAttribute('aria-disabled', ready() ? 'false' : 'true'); }); }
    $$('.launch-chip', modeWrap).forEach(btn => btn.addEventListener('click', () => { selectedMode = btn.dataset.mode; $$('.launch-chip', modeWrap).forEach(chip => { chip.classList.toggle('active', chip === btn); chip.setAttribute('aria-pressed', chip === btn ? 'true' : 'false'); }); refreshThemeState(); }));
    $$('.launch-chip', diffWrap).forEach(btn => btn.addEventListener('click', () => { selectedDifficulty = btn.dataset.difficulty; $$('.launch-chip', diffWrap).forEach(chip => { chip.classList.toggle('active', chip === btn); chip.setAttribute('aria-pressed', chip === btn ? 'true' : 'false'); }); refreshThemeState(); }));
    $$('.launch-chip', launcher).forEach(btn => btn.setAttribute('aria-pressed', 'false'));
    refreshThemeState();
  }
  function applyPageMode(){ const sections = $$('.gameSection'); if(!sections.length) return; const mode = getParams().mode; sections.forEach(sec => sec.classList.toggle('active', sec.dataset.mode === mode)); }
  function initBackButton(){
    if(!document.body.classList.contains('game-body')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'backBtn';
    button.setAttribute('aria-label', 'Voltar');
    button.innerHTML = '←';
    button.addEventListener('click', () => {
      if(window.confirm('Tem certeza que deseja sair?')){
        window.location.href = '../';
      }
    });
    document.body.appendChild(button);
  }
  function initWordSearch(){
    const el = document.getElementById('wordsearch'); if(!el || !window.PUZZLE_DATA || !window.PUZZLE_DATA.wordsearch) return;
    const diff = getParams().difficulty; const data = window.PUZZLE_DATA.wordsearch[diff] || window.PUZZLE_DATA.wordsearch.medium || window.PUZZLE_DATA.wordsearch;
    const board = $('#ws-board', el); const wordsWrap = $('#ws-words', el); setBoardSize(board, data.grid[0].length, 900);
    const found = new Set(); let drag = null; let previewCoords = [];
    const status = document.createElement('div'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); Object.assign(status.style, {position:'absolute', width:'1px', height:'1px', overflow:'hidden', clip:'rect(0 0 0 0)'}); el.appendChild(status);
    board.setAttribute('role', 'grid'); board.setAttribute('aria-label', 'Caça-palavras'); board.setAttribute('aria-rowcount', String(data.grid.length)); board.setAttribute('aria-colcount', String(data.grid[0].length));
    function focusCell(x, y){ const cell = cellAt(x, y); if(!cell) return; $$('.ws-cell', board).forEach(item => item.tabIndex = -1); cell.tabIndex = 0; cell.focus(); }
    data.grid.forEach((row,y)=>row.forEach((ch,x)=>{ const cell = document.createElement('button'); cell.type = 'button'; cell.className = 'ws-cell'; cell.textContent = ch; cell.dataset.x = x; cell.dataset.y = y; cell.tabIndex = x === 0 && y === 0 ? 0 : -1; cell.setAttribute('role', 'gridcell'); cell.setAttribute('aria-label', `Letra ${ch}, linha ${y+1}, coluna ${x+1}`); cell.setAttribute('aria-selected', 'false'); cell.addEventListener('pointerdown', event => { event.preventDefault(); board.setPointerCapture?.(event.pointerId); drag = {start:{x,y}, current:{x,y}, keyboard:false}; renderPreview(pathFromDrag(drag.start, drag.current).coords); }); cell.addEventListener('keydown', event => { const movement = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key]; if(movement){ event.preventDefault(); const nx=Math.max(0,Math.min(data.grid[0].length-1,x+movement[0])), ny=Math.max(0,Math.min(data.grid.length-1,y+movement[1])); if(drag?.keyboard){ drag.current={x:nx,y:ny}; renderPreview(pathFromDrag(drag.start,drag.current).coords); } focusCell(nx,ny); return; } if(event.key === 'Escape' && drag?.keyboard){ event.preventDefault(); clearPreview(); drag=null; status.textContent='Seleção cancelada.'; return; } if(event.key !== 'Enter' && event.key !== ' ') return; event.preventDefault(); if(!drag?.keyboard){ drag={start:{x,y},current:{x,y},keyboard:true}; renderPreview([[x,y]]); status.textContent=`Início da seleção na letra ${ch}. Use as setas e pressione Enter ou Espaço para concluir.`; } else { drag.current={x,y}; finalizeDrag(); } }); board.appendChild(cell); }));
    data.words.forEach(item => { const chip = document.createElement('div'); chip.className = 'ws-word'; chip.dataset.word = item.word; chip.textContent = item.label; wordsWrap.appendChild(chip); });
    function cellAt(x,y){ return board.querySelector(`.ws-cell[data-x="${x}"][data-y="${y}"]`); }
    function clearPreview(){ previewCoords.forEach(([x,y]) => { const cell=cellAt(x,y); cell?.classList.remove('preview'); if(cell && !cell.classList.contains('found')) cell.setAttribute('aria-selected','false'); }); previewCoords = []; }
    function renderPreview(coords){ clearPreview(); previewCoords = coords; previewCoords.forEach(([x,y]) => { const cell = cellAt(x,y); if(cell && !cell.classList.contains('found')) cell.classList.add('preview'); if(cell) cell.setAttribute('aria-selected','true'); }); }
    function snapDirection(dx, dy){ if(dx === 0 && dy === 0) return {sx:0, sy:0, len:0}; const ax = Math.abs(dx), ay = Math.abs(dy); if(ax === 0) return {sx:0, sy:Math.sign(dy), len:ay}; if(ay === 0) return {sx:Math.sign(dx), sy:0, len:ax}; const ratio = ax / ay; if(ratio > 1.7) return {sx:Math.sign(dx), sy:0, len:ax}; if(ratio < 1/1.7) return {sx:0, sy:Math.sign(dy), len:ay}; return {sx:Math.sign(dx), sy:Math.sign(dy), len:Math.min(ax, ay)}; }
    function pathFromDrag(a, b){ const {sx, sy, len} = snapDirection(b.x - a.x, b.y - a.y); const coords = []; let text = ''; for(let i=0; i<=len; i++){ const x = a.x + sx * i, y = a.y + sy * i; if(!data.grid[y] || typeof data.grid[y][x] === 'undefined') break; coords.push([x,y]); text += data.grid[y][x]; } return {coords, text}; }
    function pointerCell(event){ const target = document.elementFromPoint(event.clientX, event.clientY); if(target && target.classList && target.classList.contains('ws-cell')) return {x:+target.dataset.x, y:+target.dataset.y}; return null; }
    function finalizeDrag(){ if(!drag) return; const result = pathFromDrag(drag.start, drag.current); clearPreview(); const direct = result.text; const reverse = result.text.split('').reverse().join(''); const match = data.words.find(item => !found.has(item.word) && (item.word === direct || item.word === reverse)); if(match){ found.add(match.word); result.coords.forEach(([x,y]) => { const cell=cellAt(x,y); cell?.classList.add('found'); cell?.setAttribute('aria-selected','true'); }); wordsWrap.querySelector(`[data-word="${match.word}"]`)?.classList.add('found'); status.textContent = found.size === data.words.length ? `Palavra ${match.label} encontrada. Todas as palavras foram encontradas.` : `Palavra ${match.label} encontrada. ${found.size} de ${data.words.length}.`; } else { status.textContent='A seleção não corresponde a uma palavra pendente.'; } drag = null; }
    board.addEventListener('pointermove', event => { if(!drag) return; const point = pointerCell(event); if(!point) return; drag.current = point; renderPreview(pathFromDrag(drag.start, drag.current).coords); });
    board.addEventListener('pointerup', finalizeDrag); board.addEventListener('pointercancel', finalizeDrag); document.addEventListener('pointerup', finalizeDrag); window.addEventListener('resize', () => setBoardSize(board, data.grid[0].length, 900));
  }
  function initCrossword(){
    const wrap = document.getElementById('crossword'); if(!wrap || !window.PUZZLE_DATA || !window.PUZZLE_DATA.crossword) return;
    const diff = getParams().difficulty; const data = window.PUZZLE_DATA.crossword[diff] || window.PUZZLE_DATA.crossword.medium || window.PUZZLE_DATA.crossword;
    const board = $('#cw-board', wrap); const hintBox = $('#cw-hint', wrap); setBoardSize(board, data.width, 760);
    const clueMap = {};
    (data.across || []).forEach(item => { if(!clueMap[item.numero]) clueMap[item.numero] = []; clueMap[item.numero].push({dir:'Horizontal', clue:item.clue}); });
    (data.down || []).forEach(item => { if(!clueMap[item.numero]) clueMap[item.numero] = []; clueMap[item.numero].push({dir:'Vertical', clue:item.clue}); });
    function clearHintHighlight(){ $$('.cw-cell.hint-active', board).forEach(cell => cell.classList.remove('hint-active')); }
    function showHint(number){ clearHintHighlight(); $$('.cw-cell[data-number="'+number+'"]', board).forEach(cell => cell.classList.add('hint-active')); const items = clueMap[number] || []; const lines = items.map(item => `<div><strong>${item.dir}:</strong> ${item.clue}</div>`).join(''); hintBox.innerHTML = `<button type="button" class="hint-close" aria-label="Fechar">×</button>${lines || '<div>Nenhuma dica.</div>'}`; hintBox.hidden = false; $('.hint-close', hintBox)?.addEventListener('click', () => { hintBox.hidden = true; clearHintHighlight(); }); }
    data.grid.forEach((row,y)=>row.forEach((ch,x)=>{ const cell = document.createElement('div'); const number = data.numbers[`${x},${y}`]; cell.className = ch ? 'cw-cell' : 'cw-cell black'; if(ch){ const input = document.createElement('input'); input.className = 'cw-input'; input.maxLength = 1; input.autocomplete = 'off'; input.spellcheck = false; input.dataset.answer = ch; input.addEventListener('input', () => { input.value = (input.value || '').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,1); cell.classList.remove('wrong','correct'); }); cell.appendChild(input); if(number){ cell.dataset.number = number; const marker = document.createElement('button'); marker.type = 'button'; marker.className = 'cw-number'; marker.textContent = number; marker.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); showHint(number); }); cell.appendChild(marker); } } board.appendChild(cell); }));
    $('#cw-check', wrap)?.addEventListener('click', () => { $$('.cw-input', board).forEach(inp => { const parent = inp.parentElement; if(inp.value === inp.dataset.answer){ parent.classList.add('correct'); parent.classList.remove('wrong'); } else { parent.classList.add('wrong'); parent.classList.remove('correct'); } }); });
    $('#cw-clear', wrap)?.addEventListener('click', () => { $$('.cw-input', board).forEach(inp => { inp.value = ''; inp.parentElement.classList.remove('wrong','correct'); }); hintBox.hidden = true; clearHintHighlight(); });
    $('#cw-reveal', wrap)?.addEventListener('click', () => { $$('.cw-input', board).forEach(inp => { inp.value = inp.dataset.answer; inp.parentElement.classList.add('correct'); inp.parentElement.classList.remove('wrong'); }); });
    window.addEventListener('resize', () => setBoardSize(board, data.width, 760));
  }
  document.addEventListener('DOMContentLoaded', () => { initLauncher(); applyPageMode(); initBackButton(); initWordSearch(); initCrossword(); });
})();
