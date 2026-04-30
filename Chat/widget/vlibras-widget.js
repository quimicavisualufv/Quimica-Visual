(function () {
  const defaultConfig = {
    rootPath: 'https://vlibras.gov.br/app',
    scriptSrc: 'https://vlibras.gov.br/app/vlibras-plugin.js',
    position: 'L',
    avatar: 'icaro',
    opacity: 1,
    zIndex: 2147482900
  };

  const cfg = Object.assign({}, defaultConfig, window.SimoensVLibrasConfig || window.SIMOENS_VLIBRAS_CONFIG || {});

  if (window.__simoensVLibrasLoading || window.__simoensVLibrasReady) return;
  window.__simoensVLibrasLoading = true;

  function normalizeRootPath(value) {
    return String(value || defaultConfig.rootPath).replace(/\/$/, '');
  }

  function ensureStructure() {
    let root = document.querySelector('[vw][data-simoens-vlibras="true"], [vw].enabled');

    if (!root) {
      root = document.createElement('div');
      root.setAttribute('vw', '');
      root.className = 'enabled';
      root.dataset.simoensVlibras = 'true';
      root.innerHTML = '<div vw-access-button class="active" role="button" tabindex="0" aria-label="Abrir VLibras" title="Abrir VLibras"></div><div vw-plugin-wrapper aria-label="Painel do VLibras"><div class="vw-plugin-top-wrapper"></div></div>';
      root.setAttribute('aria-label', 'Ferramenta VLibras para tradução do conteúdo da página para Libras');
      document.body.appendChild(root);
    }

    return root;
  }

  function applyLayerFix() {
    if (document.getElementById('simoens-vlibras-layer-fix')) return;

    const style = document.createElement('style');
    style.id = 'simoens-vlibras-layer-fix';
    style.textContent = '[vw], [vw] [vw-access-button], [vw] [vw-plugin-wrapper]{z-index:' + String(cfg.zIndex) + '!important;}';
    document.head.appendChild(style);
  }

  function initWidget() {
    if (!window.VLibras || !window.VLibras.Widget) return;
    if (window.__simoensVLibrasReady) return;

    ensureStructure();
    applyLayerFix();

    try {
      window.__simoensVLibrasInstance = new window.VLibras.Widget({
        rootPath: normalizeRootPath(cfg.rootPath),
        opacity: cfg.opacity,
        position: cfg.position,
        avatar: cfg.avatar
      });
    } catch (error) {
      window.__simoensVLibrasInstance = new window.VLibras.Widget(normalizeRootPath(cfg.rootPath));
    }

    window.__simoensVLibrasReady = true;
    window.__simoensVLibrasLoading = false;
  }

  function loadScript() {
    const existing = document.querySelector('script[src*="vlibras-plugin.js"]');

    if (existing) {
      if (window.VLibras && window.VLibras.Widget) {
        initWidget();
      } else {
        existing.addEventListener('load', initWidget, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = cfg.scriptSrc;
    script.async = true;
    script.onload = initWidget;
    script.onerror = function () {
      window.__simoensVLibrasLoading = false;
    };
    document.body.appendChild(script);
  }

  function start() {
    ensureStructure();
    loadScript();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
