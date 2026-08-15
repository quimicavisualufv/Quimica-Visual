import { decodeBase64ToUint8Array, decodeFloat32, decodeInt16, decodeUint16 } from './orbital-loader.js';
import { entryNeedsPlaneFallback, preferredFallbackPlane, planeAxesForName, orbitalToL, radialHydrogen, angularRealCartesian, planeCoords } from './orbital-math.js';
import { bindVisualizerControls } from './controls.js';

export function initHydrogenVisualizer(PACKED_DATA) {
const orbitOrder = ['s','p_x','p_y','p_z','d_xy','d_yz','d_xz','d_x2_y2','d_z2'];
const orbitalRank = Object.fromEntries(orbitOrder.map((o,i)=>[o,i]));
const entries = PACKED_DATA.entries.slice().sort((a,b)=> a.n===b.n ? ((orbitalRank[a.orbital]??999)-(orbitalRank[b.orbital]??999) || a.orbital.localeCompare(b.orbital)) : a.n-b.n);
const cache = new Map();
const heatmapCache = new Map();

document.getElementById('entryCountBadge').textContent = `${entries.length} estruturas com 2D + 3D`;

function decodeEntry(entry) {
  if (cache.has(entry.id)) return cache.get(entry.id);
  const decoded = {
    positionsDensity: decodeFloat32(entry.positionsDensity),
    sign: decodeBase64ToUint8Array(entry.sign),
    shell: decodeBase64ToUint8Array(entry.shell),
    wave2d: decodeInt16(entry.wave2d),
    density2d: decodeUint16(entry.density2d),
    radial_r: decodeFloat32(entry.radial_r),
    radial_R: decodeFloat32(entry.radial_R),
    radial_P: decodeFloat32(entry.radial_P),
  };
  let maxDensity = 0;
  for (let i = 3; i < decoded.positionsDensity.length; i += 4) if (decoded.positionsDensity[i] > maxDensity) maxDensity = decoded.positionsDensity[i];
  decoded.maxDensity = maxDensity || 1;
  decoded.maxShell = decoded.shell.length ? Math.max(...decoded.shell) : 0;
  cache.set(entry.id, decoded);
  return decoded;
}

function displayOrbital(orbital) {
  const map = { s:'s', p_x:'pₓ', p_y:'pᵧ', p_z:'p_z', d_xy:'d_xy', d_yz:'d_yz', d_xz:'d_xz', d_x2_y2:'d_x²−y²', d_z2:'d_z²' };
  return map[orbital] || orbital;
}

function currentEntry() { return entries[state.entryIndex]; }
function uniqueNs() { return [...new Set(entries.map(e => e.n))]; }
function orbitalsForN(n) { return entries.filter(e => e.n === Number(n)).map(e => e.orbital); }
function findEntryIndex(n, orbital) { return entries.findIndex(e => e.n===Number(n) && e.orbital===orbital); }

const state = {
  entryIndex: 0,
  rotX: 0.78,
  rotY: -0.62,
  zoom: 0.70,
  pointSize: 2.80,
  quality: 0.50,
  colorMode: 'sign',
  axesMode: 'show',
  dragging: false,
  lastX: 0,
  lastY: 0,
};

const nSelect = document.getElementById('nSelect');
const orbitalSelect = document.getElementById('orbitalSelect');
const sceneCanvas = document.getElementById('scene3d');
const waveCanvas = document.getElementById('waveCanvas');
const densityCanvas = document.getElementById('densityCanvas');
const radialCanvas = document.getElementById('radialCanvas');
const sceneCtx = sceneCanvas.getContext('2d');
const waveCtx = waveCanvas.getContext('2d');
const densityCtx = densityCanvas.getContext('2d');
const radialCtx = radialCanvas.getContext('2d');

function buildSelectors() {
  nSelect.innerHTML = uniqueNs().map(n => `<option value="${n}">${n}</option>`).join('');
  nSelect.value = currentEntry().n;
  refreshOrbitalSelect();
}
function refreshOrbitalSelect() {
  const n = Number(nSelect.value);
  orbitalSelect.innerHTML = orbitalsForN(n).map(o => `<option value="${o}">${displayOrbital(o)}</option>`).join('');
  const entry = currentEntry();
  orbitalSelect.value = entry.n === n ? entry.orbital : orbitalsForN(n)[0];
}
function updateRangeLabels() {
  document.getElementById('zoomValue').textContent = state.zoom.toFixed(2) + 'x';
  document.getElementById('pointValue').textContent = state.pointSize.toFixed(2) + 'x';
  document.getElementById('qualityValue').textContent = Math.round(state.quality * 100) + '%';
}


function setTextIfPresent(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
function setHtmlIfPresent(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = value;
}

function setEntry(index) {
  state.entryIndex = (index + entries.length) % entries.length;
  const entry = currentEntry();
  nSelect.value = entry.n;
  refreshOrbitalSelect();
  orbitalSelect.value = entry.orbital;
  updateUI();
  drawAll();
}

function updateUI() {
  const entry = currentEntry();
  const decoded = decodeEntry(entry);
  const useFallback = entryNeedsPlaneFallback(entry);
  const fallbackPlane = useFallback ? preferredFallbackPlane(entry) : null;
  setTextIfPresent('headlineTitle', `${entry.n}${displayOrbital(entry.orbital)}`);
  setTextIfPresent('headlineMeta', useFallback
    ? `Plano 2D ${fallbackPlane.toUpperCase()} • ${entry.pointCount.toLocaleString('pt-BR')} pontos 3D • recalculo analítico ${entry.waveShape[0]}×${entry.waveShape[1]}`
    : `Plano 2D ${entry.wavePlane.toUpperCase()} • ${entry.pointCount.toLocaleString('pt-BR')} pontos 3D • corte ${entry.waveShape[0]}×${entry.waveShape[1]}`);
  document.getElementById('metricPoints').textContent = entry.pointCount.toLocaleString('pt-BR');
  document.getElementById('metricExtent').textContent = `±${Number(entry.extent).toFixed(3)} a₀`;
  document.getElementById('metricNodes').textContent = entry.radialNodes.length ? entry.radialNodes.length : '0';
  document.getElementById('metricShells').textContent = String((decoded.maxShell || 0) + 1);
  setHtmlIfPresent('entryNotes', useFallback
    ? `<strong>plano alternativo 2D:</strong> o plano XZ cai no nó desse orbital, então o viewer recalcula analiticamente em <strong>${fallbackPlane.toUpperCase()}</strong>.`
    : '');
  document.getElementById('waveMeta').textContent = `${(useFallback ? fallbackPlane : entry.wavePlane).toUpperCase()} • ${entry.waveShape[0]}×${entry.waveShape[1]}${useFallback ? ' • analítico' : ''}`;
  document.getElementById('densityMeta').textContent = `${(useFallback ? fallbackPlane : entry.densityPlane).toUpperCase()} • ${entry.densityShape[0]}×${entry.densityShape[1]}${useFallback ? ' • analítico' : ''}`;
  document.getElementById('radialMeta').textContent = `0 → ${entry.radialRMax} a₀ • ${entry.radialPoints} amostras`;
  renderLegend();
  document.title = `Orbitais do Hidrogênio — ${entry.n}${displayOrbital(entry.orbital)} Offline`;
}

function renderLegend() {
  const host = document.getElementById('legend');
  const mode = state.colorMode;
  let chips = [];
  if (mode === 'sign') {
    chips = [
      ['Positivo','#59a8ff'],
      ['Negativo','#ff5d7a']
    ];
  } else if (mode === 'density') {
    chips = [
      ['Baixa densidade','#12304d'],
      ['Alta densidade','#72f7ff']
    ];
  } else {
    const entry = currentEntry();
    const count = entry.shellOuterRadii.length || 1;
    chips = Array.from({length: count}, (_, i) => [`Camada ${i+1}`, shellColor(i, Math.max(1, count-1))]);
  }
  host.innerHTML = chips.map(([label,color]) => `<span class="chip"><span class="sw" style="background:${color}"></span>${label}</span>`).join('');
}

function shellColor(index, maxIndex) {
  const t = maxIndex <= 0 ? 0 : index / maxIndex;
  const hue = 210 + 110 * t;
  return `hsl(${hue} 85% 67%)`;
}

function resizeCanvas(canvas, ctx) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function applyRotation(x, y, z) {
  const cy = Math.cos(state.rotY), sy = Math.sin(state.rotY);
  let x1 = x * cy - z * sy;
  let z1 = x * sy + z * cy;
  const cx = Math.cos(state.rotX), sx = Math.sin(state.rotX);
  let y2 = y * cx - z1 * sx;
  let z2 = y * sx + z1 * cx;
  return [x1, y2, z2];
}

function project(x, y, z, width, height, extent) {
  const [xr, yr, zr] = applyRotation(x, y, z);
  const perspective = 1 / (1 + (zr / (extent * 4.2)));
  const scale = Math.min(width, height) * 0.18 * state.zoom;
  return {
    x: width * 0.5 + xr * scale * perspective,
    y: height * 0.5 - yr * scale * perspective,
    depth: zr,
    perspective,
  };
}

function densityColor(norm) {
  const t = Math.max(0, Math.min(1, Math.pow(norm, 0.55)));
  const r = Math.round(10 + 90 * t + 110 * t * t);
  const g = Math.round(24 + 120 * t + 100 * t * t);
  const b = Math.round(35 + 180 * t + 60 * t * t);
  return `rgb(${r},${g},${b})`;
}
function signColor(sign) { return sign > 0 ? '#59a8ff' : '#ff5d7a'; }

function render3D() {
  resizeCanvas(sceneCanvas, sceneCtx);
  const rect = sceneCanvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  sceneCtx.clearRect(0,0,w,h);
  sceneCtx.fillStyle = '#06101b';
  sceneCtx.fillRect(0,0,w,h);
  const entry = currentEntry();
  const decoded = decodeEntry(entry);
  if (state.axesMode === 'show') drawAxes(w,h,entry.extent);
  const points = [];
  const floats = decoded.positionsDensity;
  const total = floats.length / 4;
  const stride = Math.max(1, Math.round(1 / Math.max(0.15, state.quality)));
  for (let i = 0; i < total; i += stride) {
    const base = i * 4;
    const p = project(floats[base], floats[base+1], floats[base+2], w, h, entry.extent);
    let fill = '#ffffff';
    if (state.colorMode === 'sign') fill = signColor(decoded.sign[i] ? 1 : -1);
    else if (state.colorMode === 'shell') fill = shellColor(decoded.shell[i], decoded.maxShell || 1);
    else fill = densityColor(floats[base+3] / decoded.maxDensity);
    points.push({...p, fill, density: floats[base+3], shell: decoded.shell[i], sign: decoded.sign[i] ? 1 : -1});
  }
  points.sort((a,b)=>a.depth-b.depth);
  for (const p of points) {
    const radius = Math.max(0.7, state.pointSize * (0.5 + p.perspective));
    sceneCtx.globalAlpha = Math.max(0.12, Math.min(0.96, 0.22 + p.perspective * 0.92));
    sceneCtx.fillStyle = p.fill;
    sceneCtx.beginPath();
    sceneCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    sceneCtx.fill();
  }
  sceneCtx.globalAlpha = 1;
}

function drawAxes(w,h,extent) {
  const axes = [
    {from:[-extent*0.9,0,0], to:[extent*0.9,0,0], color:'#ff7b96', label:'X'},
    {from:[0,-extent*0.9,0], to:[0,extent*0.9,0], color:'#75ffbe', label:'Y'},
    {from:[0,0,-extent*0.9], to:[0,0,extent*0.9], color:'#7db8ff', label:'Z'},
  ];
  sceneCtx.lineWidth = 1.5;
  sceneCtx.font = '12px Inter, system-ui, sans-serif';
  for (const axis of axes) {
    const a = project(...axis.from, w, h, extent);
    const b = project(...axis.to, w, h, extent);
    sceneCtx.globalAlpha = .75;
    sceneCtx.strokeStyle = axis.color;
    sceneCtx.beginPath();
    sceneCtx.moveTo(a.x,a.y);
    sceneCtx.lineTo(b.x,b.y);
    sceneCtx.stroke();
    sceneCtx.fillStyle = axis.color;
    sceneCtx.fillText(axis.label, b.x + 6, b.y - 4);
  }
  sceneCtx.globalAlpha = 1;
}

function displayPlaneForHeatmap(entry, type) {
  if (entryNeedsPlaneFallback(entry)) return preferredFallbackPlane(entry);
  return (type === 'wave' ? entry.wavePlane : entry.densityPlane) || entry.wavePlane || entry.densityPlane || 'xz';
}

function buildAnalyticHeatmapImage(entry, type) {
  const plane = displayPlaneForHeatmap(entry, type);
  const key = entry.id + ':analytic:' + type + ':' + plane;
  if (heatmapCache.has(key)) return heatmapCache.get(key);

  const shape = type === 'wave' ? entry.waveShape : entry.densityShape;
  const rows = shape[0], cols = shape[1];
  const extent = Number.isFinite(entry.extent) ? entry.extent : Math.max(
    Math.abs(entry.waveUMax || 0),
    Math.abs(entry.waveVMax || 0),
    Math.abs(entry.densityUMax || 0),
    Math.abs(entry.densityVMax || 0),
    1
  );
  const l = orbitalToL(entry.orbital);
  const values = new Float32Array(rows * cols);
  let maxAbs = 0;
  let maxDensity = 0;

  for (let row = 0; row < rows; row++) {
    const v = extent - (row / Math.max(1, rows - 1)) * (2 * extent);
    for (let col = 0; col < cols; col++) {
      const u = -extent + (col / Math.max(1, cols - 1)) * (2 * extent);
      const [x, y, z] = planeCoords(plane, u, v);
      const r = Math.hypot(x, y, z);
      const psi = radialHydrogen(entry.n, l, r) * angularRealCartesian(entry.orbital, x, y, z, r);
      const value = type === 'wave' ? psi : psi * psi;
      const idx = row * cols + col;
      values[idx] = value;
      if (type === 'wave') {
        const absValue = Math.abs(value);
        if (absValue > maxAbs) maxAbs = absValue;
      } else if (value > maxDensity) {
        maxDensity = value;
      }
    }
  }

  maxAbs = maxAbs || 1;
  maxDensity = maxDensity || 1;

  const off = document.createElement('canvas');
  off.width = cols;
  off.height = rows;
  const ictx = off.getContext('2d');
  const img = ictx.createImageData(cols, rows);

  for (let i = 0; i < values.length; i++) {
    const p = i * 4;
    if (type === 'wave') {
      const v = Math.max(-1, Math.min(1, values[i] / maxAbs));
      const t = Math.abs(v);
      let r = 10, g = 14, b = 18;
      if (v >= 0) {
        r = Math.round(40 + 215 * t);
        g = Math.round(18 + 55 * t);
        b = Math.round(22 + 60 * t);
      } else {
        r = Math.round(20 + 70 * t);
        g = Math.round(24 + 150 * t);
        b = Math.round(30 + 225 * t);
      }
      img.data[p] = r;
      img.data[p + 1] = g;
      img.data[p + 2] = b;
      img.data[p + 3] = 255;
    } else {
      const t = Math.pow(Math.max(0, values[i]) / maxDensity, 0.6);
      const r = Math.round(8 + 45 * t + 120 * t * t);
      const g = Math.round(18 + 120 * t + 110 * t * t);
      const b = Math.round(26 + 160 * t + 85 * t * t);
      img.data[p] = r;
      img.data[p + 1] = g;
      img.data[p + 2] = b;
      img.data[p + 3] = 255;
    }
  }

  ictx.putImageData(img, 0, 0);
  heatmapCache.set(key, off);
  return off;
}

function buildHeatmapImage(entry, type) {
  return buildAnalyticHeatmapImage(entry, type);
}

function drawHeatmap(targetCanvas, targetCtx, type) {
  resizeCanvas(targetCanvas, targetCtx);
  const rect = targetCanvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  targetCtx.clearRect(0,0,w,h);
  targetCtx.fillStyle = '#07111c';
  targetCtx.fillRect(0,0,w,h);
  const pad = 46;
  const plotX = pad, plotY = 18, plotW = w - pad - 18, plotH = h - pad - 18;
  const entry = currentEntry();
  const img = buildHeatmapImage(entry, type);
  targetCtx.imageSmoothingEnabled = false;
  targetCtx.drawImage(img, plotX, plotY, plotW, plotH);
  targetCtx.strokeStyle = 'rgba(255,255,255,.24)';
  targetCtx.lineWidth = 1;
  targetCtx.strokeRect(plotX + 0.5, plotY + 0.5, plotW - 1, plotH - 1);
  targetCtx.font = '12px Inter, system-ui, sans-serif';
  targetCtx.fillStyle = '#bcd0f0';
  const useFallback = entryNeedsPlaneFallback(entry) && (type === 'wave' || type === 'density');
  const activePlane = displayPlaneForHeatmap(entry, type);
  const activeAxes = planeAxesForName(activePlane)[3];
  const xLabel = activeAxes[0];
  const yLabel = activeAxes[1];
  targetCtx.fillText(xLabel, plotX + plotW * 0.5 - targetCtx.measureText(xLabel).width / 2, h - 10);
  targetCtx.save();
  targetCtx.translate(14, plotY + plotH * 0.5 + targetCtx.measureText(yLabel).width / 2);
  targetCtx.rotate(-Math.PI / 2);
  targetCtx.fillText(yLabel, 0, 0);
  targetCtx.restore();
  targetCtx.fillStyle = '#7f99bc';
  const titleText = useFallback
    ? (type === 'wave' ? 'recalculo analítico da função ψ em plano alternativo' : 'recalculo analítico da densidade em plano alternativo')
    : (type === 'wave' ? 'corte analítico da função ψ' : 'corte analítico da densidade |ψ|²');
  targetCtx.fillText(titleText, plotX, 14);
}

function drawRadial() {
  resizeCanvas(radialCanvas, radialCtx);
  const rect = radialCanvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  radialCtx.clearRect(0,0,w,h);
  radialCtx.fillStyle = '#07111c';
  radialCtx.fillRect(0,0,w,h);
  const entry = currentEntry();
  const d = decodeEntry(entry);
  const r = d.radial_r, R = d.radial_R, P = d.radial_P;
  const padL = 52, padR = 18, padT = 20, padB = 42;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const zeroY = padT + plotH * 0.46;
  const probBaseY = padT + plotH * 0.92;
  const maxAbsR = Math.max(...Array.from(R, v => Math.abs(v))) || 1;
  const maxP = Math.max(...P) || 1;

  radialCtx.strokeStyle = 'rgba(255,255,255,.12)';
  radialCtx.lineWidth = 1;
  for (let i=0;i<=5;i++) {
    const y = padT + plotH * (i/5);
    radialCtx.beginPath(); radialCtx.moveTo(padL,y); radialCtx.lineTo(padL+plotW,y); radialCtx.stroke();
  }
  for (let i=0;i<=5;i++) {
    const x = padL + plotW * (i/5);
    radialCtx.beginPath(); radialCtx.moveTo(x,padT); radialCtx.lineTo(x,padT+plotH); radialCtx.stroke();
  }

  radialCtx.strokeStyle = 'rgba(255,255,255,.35)';
  radialCtx.beginPath(); radialCtx.moveTo(padL, zeroY); radialCtx.lineTo(padL + plotW, zeroY); radialCtx.stroke();
  radialCtx.beginPath(); radialCtx.moveTo(padL, probBaseY); radialCtx.lineTo(padL + plotW, probBaseY); radialCtx.stroke();

  radialCtx.lineWidth = 2.2;
  radialCtx.strokeStyle = '#65b4ff';
  radialCtx.beginPath();
  for (let i=0;i<r.length;i++) {
    const x = padL + (r[i] / entry.radialRMax) * plotW;
    const y = zeroY - (R[i] / maxAbsR) * plotH * 0.36;
    if (i===0) radialCtx.moveTo(x,y); else radialCtx.lineTo(x,y);
  }
  radialCtx.stroke();

  radialCtx.strokeStyle = '#ffd86f';
  radialCtx.beginPath();
  for (let i=0;i<r.length;i++) {
    const x = padL + (r[i] / entry.radialRMax) * plotW;
    const y = probBaseY - (P[i] / maxP) * plotH * 0.78;
    if (i===0) radialCtx.moveTo(x,y); else radialCtx.lineTo(x,y);
  }
  radialCtx.stroke();

  radialCtx.fillStyle = '#bcd0f0';
  radialCtx.font = '12px Inter, system-ui, sans-serif';
  radialCtx.fillText('r / a₀', padL + plotW * 0.5 - 12, h - 12);
  radialCtx.save();
  radialCtx.translate(14, padT + plotH * 0.5);
  radialCtx.rotate(-Math.PI / 2);
  radialCtx.fillText('escala normalizada', 0, 0);
  radialCtx.restore();
  radialCtx.fillStyle = '#7f99bc';
  radialCtx.fillText('R(r)', padL + 6, zeroY - plotH * 0.38 - 6);
  radialCtx.fillText('P(r)', padL + 6, probBaseY - plotH * 0.78 - 6);

  const legendY = 14;
  radialCtx.fillStyle = '#65b4ff'; radialCtx.fillRect(padL, legendY, 20, 3);
  radialCtx.fillStyle = '#bcd0f0'; radialCtx.fillText('R(r)', padL + 28, legendY + 5);
  radialCtx.fillStyle = '#ffd86f'; radialCtx.fillRect(padL + 76, legendY, 20, 3);
  radialCtx.fillStyle = '#bcd0f0'; radialCtx.fillText('probabilidade radial', padL + 104, legendY + 5);
}

function drawAll() {
  render3D();
  drawHeatmap(waveCanvas, waveCtx, 'wave');
  drawHeatmap(densityCanvas, densityCtx, 'density');
  drawRadial();
}

function syncControls() {
  document.getElementById('zoomRange').value = state.zoom.toFixed(2);
  document.getElementById('pointRange').value = state.pointSize.toFixed(2);
  document.getElementById('qualityRange').value = state.quality.toFixed(2);
  document.getElementById('colorMode').value = state.colorMode;
  document.getElementById('axesMode').value = state.axesMode;
  updateRangeLabels();
  renderLegend();
  updateUI();
}

bindVisualizerControls({
  nSelect, orbitalSelect, sceneCanvas, state, refreshOrbitalSelect, findEntryIndex, setEntry,
  currentEntry, syncControls, updateRangeLabels, renderLegend, drawAll,
});

buildSelectors();
syncControls();
setEntry(0);
}
