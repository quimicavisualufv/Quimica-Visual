/* Mobile-only teaching workspace. Loaded before the app to avoid layout flashes. */
(function () {
  'use strict';
  const nav = navigator;
  const mobile = /Android|iPhone|iPad|iPod|Mobile|Tablet|Silk/i.test(nav.userAgent)
    || (/MacIntel/.test(nav.platform) && nav.maxTouchPoints > 1)
    || nav.userAgentData?.mobile === true
    || (nav.maxTouchPoints > 0 && matchMedia('(pointer: coarse) and (hover: none)').matches);
  if (!mobile || window.SimoensMobile) return;

  const html = document.documentElement;
  if (!html.dataset.qvLayout && document.currentScript?.dataset.qvLayout) html.dataset.qvLayout = document.currentScript.dataset.qvLayout;
  const embedded = window !== window.top;
  html.dataset.qvMobile = 'true';
  if (embedded) html.dataset.qvEmbedded = 'true';
  const state = { portrait: false, embedded, busy: false };
  window.SimoensMobile = state;
  let guard, fullscreenButton, restoreFocus;
  let lastWidth = window.innerWidth, lastHeight = window.innerHeight;

  function updateViewport() {
      const viewport = window.visualViewport;
      const height = viewport && viewport.scale === 1 ? viewport.height : window.innerHeight;
      html.style.setProperty('--qv-vh', Math.round(height) + 'px');
      if (embedded) return;
      // A software keyboard must not masquerade as a physical rotation.
      const focused = document.activeElement;
      const typing = focused?.tagName === 'TEXTAREA' || (focused?.tagName === 'INPUT' && /^(text|search|email|url|tel|number|password)$/.test(focused.type));
      const keyboardOnly = typing && Math.abs(window.innerWidth - lastWidth) < 2 && height < lastHeight * .78;
      const portrait = keyboardOnly ? state.portrait : window.innerHeight > window.innerWidth;
      if (!keyboardOnly) { lastWidth = window.innerWidth; lastHeight = window.innerHeight; }
      if (portrait !== state.portrait) {
        state.portrait = portrait;
        html.toggleAttribute('data-qv-portrait', portrait);
        window.dispatchEvent(new CustomEvent('simoens:orientation', { detail: { portrait } }));
      }
      if (!guard) return;
      if (portrait && !guard.open) {
        restoreFocus = document.activeElement;
        if (typeof guard.showModal === 'function') guard.showModal();
        else { guard.setAttribute('open', ''); html.dataset.qvGuardFallback = 'true'; }
      } else if (!portrait && guard.open) {
        if (typeof guard.close === 'function') guard.close();
        else guard.removeAttribute('open');
        delete html.dataset.qvGuardFallback;
        if (restoreFocus?.isConnected) restoreFocus.focus({ preventScroll: true });
        // Canvas apps and nested activities recalculate after becoming visible.
        window.dispatchEvent(new Event('resize'));
        for (const frame of document.querySelectorAll('iframe')) {
          try { frame.contentWindow.dispatchEvent(new Event('resize')); } catch (_) { /* external frame */ }
        }
      }
  }

  async function lockLandscape() {
    try { if (screen.orientation?.lock) await screen.orientation.lock('landscape'); } catch (_) {
      // The rotation dialog stays available on browsers without orientation lock.
    }
  }

  async function fullscreen() {
    if (state.busy) return;
    state.busy = true;
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        await (document.exitFullscreen?.() || document.webkitExitFullscreen?.());
      } else {
        const request = html.requestFullscreen || html.webkitRequestFullscreen;
        if (request) await request.call(html);
        await lockLandscape();
      }
    } catch (_) { /* Manual rotation remains possible when fullscreen is unavailable. */ }
    finally { state.busy = false; updateViewport(); }
  }

  function keepWidgetsClear() {
    organizeMoleculePanels();
    organizeExercisePanels();
    // The quiz recreates its sound button when changing screens. Keep the current
    // button in the tools strip so it cannot cover the timer or question cards.
    const bar = document.getElementById('qv-mobile-bar');
    const sound = document.querySelector('#app > .sound-toggle');
    if (bar && sound) {
      bar.querySelector('.qv-sound')?.remove();
      sound.classList.add('qv-sound');
      bar.appendChild(sound);
    }
    // The chat uses Shadow DOM. Its own stylesheet cannot be overridden outside it.
    const shadow = document.getElementById('simoens-chat-widget-host')?.shadowRoot;
    if (shadow && !shadow.getElementById('qv-chat-mobile')) {
      const style = document.createElement('style');
      style.id = 'qv-chat-mobile';
      style.textContent = `
        .sw-root { top: max(4px, env(safe-area-inset-top)) !important; right: max(6px, env(safe-area-inset-right)) !important; bottom: auto !important; width: 44px !important; height: 44px !important; }
        .sw-root .sw-toggle { right: 0 !important; width: 44px !important; height: 44px !important; transform: none !important; }
        .sw-toggle svg { width: 44px !important; height: 44px !important; }
        .sw-root .sw-panel { position: fixed !important; top: calc(52px + env(safe-area-inset-top)) !important; right: max(6px, env(safe-area-inset-right)) !important; bottom: auto !important; width: min(400px, calc(100vw - 24px)) !important; height: calc(100dvh - 64px - env(safe-area-inset-top) - env(safe-area-inset-bottom)) !important; }
        .sw-header { padding: 8px 12px !important; }
        .sw-iconbtn { min-width: 44px; min-height: 44px; }
      `;
      shadow.appendChild(style);
    }
  }

  function init() {
    if (html.dataset.qvLayout === 'puzzle') setupPuzzleTouch();
    setupLatticeTools();
    organizeMoleculePanels();
    organizeExercisePanels();
    setupBravaisControls();
    if (embedded) { updateViewport(); return; }
    const bar = document.createElement('div');
    bar.id = 'qv-mobile-bar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Tela e ferramentas');
    fullscreenButton = document.createElement('button');
    fullscreenButton.type = 'button';
    fullscreenButton.textContent = '↔ Tela cheia';
    fullscreenButton.setAttribute('aria-label', 'Entrar em tela cheia');
    fullscreenButton.addEventListener('click', fullscreen);
    if (html.requestFullscreen || html.webkitRequestFullscreen) bar.appendChild(fullscreenButton);
    const label = document.createElement('span');
    label.textContent = 'SiMoEns';
    bar.appendChild(label);
    document.body.appendChild(bar);

    guard = document.createElement('dialog');
    guard.id = 'qv-rotate';
    guard.setAttribute('aria-labelledby', 'qv-rotate-title');
    guard.setAttribute('aria-describedby', 'qv-rotate-description');
    guard.innerHTML = '<div class="qv-phone" aria-hidden="true">↻</div><h2 id="qv-rotate-title">Gire o celular</h2><p id="qv-rotate-description">Use o celular ou tablet na horizontal para abrir esta atividade.</p><p class="qv-rotate-tip">Se a tela não girar, ative a rotação automática do dispositivo.</p>';
    if (html.requestFullscreen || html.webkitRequestFullscreen) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Abrir na horizontal';
      button.addEventListener('click', fullscreen);
      guard.appendChild(button);
    }
    guard.addEventListener('cancel', event => event.preventDefault());
    document.body.appendChild(guard);

    // Combine formerly floating orbital controls into a single scrollable column.
    if (html.dataset.qvLayout === 'orbitals') {
      const column = document.createElement('aside');
      column.className = 'qv-orbital-controls';
      column.setAttribute('aria-label', 'Controles dos orbitais');
      for (const panel of document.querySelectorAll('.ui, .structuresPanel')) column.appendChild(panel);
      document.body.appendChild(column);
    }

    keepWidgetsClear();
    // Observe additions only, never style mutations generated by render loops.
    new MutationObserver(keepWidgetsClear).observe(document.body, { childList: true, subtree: true });
    updateViewport();
    window.dispatchEvent(new Event('resize'));
  }

  function setupPuzzleTouch() {
    // Reuse each item's existing keyboard add action for one tap, also in frames.
      document.addEventListener('click', event => {
        const chip = event.target.closest('#library .chip, #atomsGrid .chip, #symbolsGrid .chip');
        if (!chip) return;
        chip.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      document.addEventListener('dblclick', event => {
        if (event.target.closest('#library .chip, #atomsGrid .chip, #symbolsGrid .chip')) event.stopImmediatePropagation();
      }, true);
  }

  function setupLatticeTools() {
    const viewer = document.getElementById('painel-visual');
    const controls = document.querySelector('#painel-controles .controls');
    if (!viewer || !controls) return;
    const gizmo = viewer.querySelector('.viewer-gizmo-toggle');
    if (gizmo) controls.appendChild(gizmo);
    const tools = document.createElement('div');
    tools.className = 'qv-lattice-tools';
    tools.setAttribute('role', 'group');
    tools.setAttribute('aria-label', 'Enquadramento da estrutura');
    for (const [label, text, factor] of [['Diminuir zoom', '−', .8], ['Ajustar estrutura à tela', 'Ajustar à tela', 0], ['Aumentar zoom', '+', 1.25]]) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = text; button.setAttribute('aria-label', label);
      button.addEventListener('click', () => window.dispatchEvent(new CustomEvent(factor ? 'simoens:lattice-zoom' : 'simoens:lattice-fit', { detail: { factor } })));
      tools.appendChild(button);
    }
    viewer.appendChild(tools);
  }

  function organizeMoleculePanels() {
    if (html.dataset.qvLayout !== 'molecule') return;
    const main = document.querySelector('.app > main');
    const aside = document.querySelector('.app > aside');
    if (!main || !aside) return;
    const panels = [...main.querySelectorAll('.angleLegendPanel, .tutorialAngleLegendPanel, .axesToggle, .viewerToggle, .polarCalcHud, .hud')];
    if (!panels.length) return;
    let inspector = aside.querySelector('.qv-molecule-inspector');
    if (!inspector) {
      inspector = document.createElement('section');
      inspector.className = 'qv-molecule-inspector';
      inspector.setAttribute('aria-label', 'Leitura e controles da visualização');
      aside.appendChild(inspector);
    }
    for (const panel of panels) if (!panels.some(other => other !== panel && other.contains(panel))) inspector.appendChild(panel);
  }

  function organizeExercisePanels() {
    if (html.dataset.qvLayout !== 'exercise') return;
    const main = document.querySelector('.app > main');
    const aside = document.querySelector('.app > aside');
    if (!main || !aside) return;
    const panels = [...main.querySelectorAll('.viewerTools, .hud')];
    if (!panels.length) return;
    let inspector = aside.querySelector('.qv-viewer-inspector');
    if (!inspector) {
      inspector = document.createElement('section');
      inspector.className = 'qv-viewer-inspector';
      inspector.setAttribute('aria-label', 'Ferramentas e leitura da estrutura');
      aside.appendChild(inspector);
    }
    for (const panel of panels) inspector.appendChild(panel);
  }

  function setupBravaisControls() {
    if (html.dataset.qvLayout !== 'bravais') return;
    const controls = document.getElementById('canvasControls');
    const text = document.getElementById('secBody');
    const panel = document.getElementById('textPanel');
    if (!controls || !text || !panel) return;
    const side = document.createElement('div');
    side.className = 'qv-bravais-side';
    panel.insertBefore(side, text);
    side.append(controls, text);
  }

  window.addEventListener('resize', updateViewport, { passive: true });
  window.addEventListener('orientationchange', updateViewport, { passive: true });
  window.visualViewport?.addEventListener('resize', updateViewport, { passive: true });
  document.addEventListener('fullscreenchange', () => {
    const active = !!document.fullscreenElement;
    if (fullscreenButton) {
      fullscreenButton.textContent = active ? '↔ Sair da tela cheia' : '↔ Tela cheia';
      fullscreenButton.setAttribute('aria-label', active ? 'Sair da tela cheia' : 'Entrar em tela cheia');
    }
    if (active) lockLandscape();
    updateViewport();
  });
  document.addEventListener('pointerup', () => { if (state.portrait) lockLandscape(); }, { passive: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
