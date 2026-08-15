import { atomScaleLimits, clipOptions, latticeOptions, modeConfig } from './config.js';
import { canUseMode, getCounts, resetAppearance, resetLattice, setAtomScale, setBackgroundColor, setClipPlane, setLatticeType, setLightColor, setMode, subscribe } from './state.js';

export class UIController {
  constructor(container) {
    this.container = container;
    this.lastRenderKey = '';
    subscribe((snapshot) => this.render(snapshot));
  }

  getRenderKey(snapshot) {
    const atomSignature = snapshot.atoms.map((atom) => `${atom.id}:${atom.type}`).join('|');
    return [snapshot.mode, snapshot.latticeType, snapshot.clipPlane, atomSignature].join('::');
  }

  getScrollState() {
    return {
      sidebar: this.container.querySelector('.sidebar')?.scrollTop || 0,
      info: this.container.querySelector('.info-panel')?.scrollTop || 0
    };
  }

  restoreScrollState(scrollState) {
    const sidebar = this.container.querySelector('.sidebar');
    const info = this.container.querySelector('.info-panel');
    if (sidebar) sidebar.scrollTop = scrollState.sidebar;
    if (info) info.scrollTop = scrollState.info;
  }

  updateLiveControls(snapshot) {
    const scaleValue = this.container.querySelector('[data-scale-value]');
    if (scaleValue) scaleValue.textContent = `${Number(snapshot.atomScale).toFixed(1)}x`;
    const scale = this.container.querySelector('[data-scale]');
    if (scale && document.activeElement !== scale) scale.value = snapshot.atomScale;
    const backgroundValue = this.container.querySelector('[data-background-value]');
    if (backgroundValue) backgroundValue.textContent = snapshot.backgroundColor;
    const lightValue = this.container.querySelector('[data-light-value]');
    if (lightValue) lightValue.textContent = snapshot.lightColor;
    const backgroundColor = this.container.querySelector('[data-background-color]');
    if (backgroundColor && document.activeElement !== backgroundColor) backgroundColor.value = snapshot.backgroundColor;
    const lightColor = this.container.querySelector('[data-light-color]');
    if (lightColor && document.activeElement !== lightColor) lightColor.value = snapshot.lightColor;
  }

  render(snapshot) {
    const renderKey = this.getRenderKey(snapshot);
    if (renderKey === this.lastRenderKey) {
      this.updateLiveControls(snapshot);
      return;
    }

    const scrollState = this.getScrollState();
    const counts = getCounts(snapshot);
    const active = modeConfig[snapshot.mode];
    const availableModes = Object.keys(modeConfig).filter((mode) => canUseMode(mode, snapshot.latticeType));

    this.container.innerHTML = `
      <div class="stats-panel" aria-live="polite">
        <div class="stat"><span class="stat-title">Átomos/Íons Totais</span><span class="stat-value">${counts.atoms}</span></div>
        <div class="divider"></div>
        <div class="stat"><span class="stat-title">Lacunas</span><span class="stat-value red">${counts.vacancies}</span></div>
        <div class="divider"></div>
        <div class="stat"><span class="stat-title">Impurezas</span><span class="stat-value red">${counts.impurities}</span></div>
      </div>
      <aside class="sidebar">
        <h1 class="panel-title">Defeitos em Sólidos</h1>
        <p class="panel-copy">Modelos didáticos de falhas em estruturas cristalinas. Frenkel e Schottky aparecem apenas no exemplo iônico tipo NaCl desta aplicação.</p>
        <div class="control-group">
          <div class="control-title"><span>▦</span><span>Estrutura Cristalina</span></div>
          <div class="option-list">
            ${latticeOptions.map((option) => `<button type="button" class="control-btn ${snapshot.latticeType === option.value ? 'active' : ''}" data-lattice="${option.value}">${option.label}</button>`).join('')}
          </div>
        </div>
        <div class="control-group">
          <div class="control-title"><span>◫</span><span>Plano de Corte</span></div>
          <div class="option-list">
            ${clipOptions.map((option) => `<button type="button" class="control-btn ${snapshot.clipPlane === option.value ? 'active' : ''}" data-clip="${option.value}">${option.label}</button>`).join('')}
          </div>
        </div>
        <div class="control-group">
          <div class="range-row">
            <div class="control-title"><span>●</span><span>Tamanho do Átomo</span></div>
            <span class="scale-value" data-scale-value>${Number(snapshot.atomScale).toFixed(1)}x</span>
          </div>
          <input data-scale type="range" min="${atomScaleLimits.min}" max="${atomScaleLimits.max}" step="${atomScaleLimits.step}" value="${snapshot.atomScale}" aria-label="Tamanho do átomo">
        </div>
        <div class="control-group">
          <div class="control-title"><span>◐</span><span>Aparência da Cena</span></div>
          <div class="color-control-list">
            <label class="color-control">
              <span class="color-label">Cor do fundo</span>
              <span class="color-value" data-background-value>${snapshot.backgroundColor}</span>
              <input data-background-color type="color" value="${snapshot.backgroundColor}" aria-label="Cor do fundo">
            </label>
            <label class="color-control">
              <span class="color-label">Cor das luzes</span>
              <span class="color-value" data-light-value>${snapshot.lightColor}</span>
              <input data-light-color type="color" value="${snapshot.lightColor}" aria-label="Cor das luzes">
            </label>
            <button type="button" class="mini-reset-btn" data-reset-appearance>Restaurar cores padrão</button>
          </div>
        </div>
        <div class="control-group">
          <div class="control-title"><span>✦</span><span>Tipos de Defeitos (0D)</span></div>
          <div class="mode-list">
            ${availableModes.map((mode) => `<button type="button" class="mode-btn ${snapshot.mode === mode ? 'active' : ''}" data-mode="${mode}"><span class="mode-icon">${modeConfig[mode].icon}</span><span>${modeConfig[mode].title}</span></button>`).join('')}
          </div>
        </div>
        <div class="reset-wrap">
          <button type="button" class="reset-btn" data-reset><span>↺</span><span>Restaurar Cristal</span></button>
        </div>
      </aside>
      <aside class="info-panel">
        <header class="info-head">
          <span class="info-icon">${active.icon}</span>
          <h2 class="info-title">${active.title}</h2>
        </header>
        <section class="info-block">
          <span class="info-label">Descrição</span>
          <p class="info-text">${active.description}</p>
        </section>
        <section class="info-block callout">
          <span class="info-label">Implicações Físico-Químicas</span>
          <p class="info-text">${active.implications}</p>
        </section>
        ${active.instructions ? `<section class="info-block action-box"><span class="info-label">Ação Interativa</span><p class="info-text">${active.instructions}</p></section>` : ''}
        <section class="energy-box">
          <span class="info-label">Tendência energética qualitativa</span>
          <div class="energy-bar"><div class="energy-fill" style="width:${active.energyLevel}%"></div></div>
          <div class="energy-scale"><span>Menor</span><span>Maior</span></div>
          <p class="info-text">${active.energyText}</p>
          <p class="info-text"><strong>Representação didática:</strong> a barra compara tendências conceituais e não corresponde a valores em eV nem a uma escala universal.</p>
        </section>
      </aside>
      <div class="mobile-hint">No celular, arraste o fundo para girar a rede e role a tela para acessar todos os controles.</div>
    `;
    this.lastRenderKey = renderKey;
    this.bindEvents();
    this.updateLiveControls(snapshot);
    this.restoreScrollState(scrollState);
  }

  bindEvents() {
    this.container.querySelectorAll('[data-lattice]').forEach((button) => {
      button.addEventListener('click', () => setLatticeType(button.dataset.lattice));
    });
    this.container.querySelectorAll('[data-clip]').forEach((button) => {
      button.addEventListener('click', () => setClipPlane(button.dataset.clip));
    });
    this.container.querySelectorAll('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => setMode(button.dataset.mode));
    });
    const range = this.container.querySelector('[data-scale]');
    if (range) {
      range.addEventListener('input', (event) => setAtomScale(event.target.value));
      range.addEventListener('pointerdown', () => range.focus({ preventScroll: true }));
    }
    const backgroundColor = this.container.querySelector('[data-background-color]');
    if (backgroundColor) backgroundColor.addEventListener('input', (event) => setBackgroundColor(event.target.value));
    const lightColor = this.container.querySelector('[data-light-color]');
    if (lightColor) lightColor.addEventListener('input', (event) => setLightColor(event.target.value));
    const resetAppearanceButton = this.container.querySelector('[data-reset-appearance]');
    if (resetAppearanceButton) resetAppearanceButton.addEventListener('click', () => resetAppearance());
    const reset = this.container.querySelector('[data-reset]');
    if (reset) reset.addEventListener('click', () => resetLattice());
  }
}
