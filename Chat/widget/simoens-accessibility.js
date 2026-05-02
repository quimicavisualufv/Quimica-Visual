(function () {
  var STORAGE_KEY = 'simoens.accessibility.preferences.v2';
  var ROOT_CLASS = 'simoens-a11y-active';
  var panelId = 'simoens-a11y-panel';
  var liveId = 'simoens-a11y-live';
  var state = {
    font: 0,
    contrast: false,
    links: false,
    motion: false,
    spacing: false,
    guide: false,
    grayscale: false,
    colorblind: false,
    colorblindType: 'redgreen',
    speechVolume: 1,
    speechRate: 0.95,
    speechVoiceGender: 'female'
  };

  function getScriptBase() {
    var current = document.currentScript;
    if (current && current.src) return current.src.replace(/[^/]*$/, '');
    var scripts = Array.prototype.slice.call(document.querySelectorAll('script[src]')).reverse();
    for (var i = 0; i < scripts.length; i += 1) {
      var src = scripts[i].getAttribute('src') || '';
      if (src.indexOf('simoens-accessibility.js') !== -1) return src.replace(/[^/]*$/, '');
    }
    return '';
  }

  var scriptBase = getScriptBase();

  function isXadrezQuimicoPage() {
    return /\/Ensino\/jogo\/xadrez-quimico\/?(?:index\.html)?/i.test(decodeURIComponent(String(location.pathname || '')).replace(/\\/g, '/'));
  }

  function updateXadrezVoiceButton(active) {
    var button = document.querySelector('[data-a11y-action="chess-voice"]');
    if (!button) return;
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    button.textContent = active ? 'Modo voz xadrez ligado' : 'Modo voz xadrez';
  }

  function loadXadrezVoiceExtension(callback) {
    if (!isXadrezQuimicoPage()) {
      if (callback) callback();
      return;
    }
    if (window.SiMoEnsChessVoice) {
      updateXadrezVoiceButton(!!window.SiMoEnsChessVoice.isActive());
      if (callback) callback();
      return;
    }
    var existing = document.querySelector('script[data-simoens-xadrez-voice]');
    if (existing) {
      existing.addEventListener('load', function () {
        updateXadrezVoiceButton(!!(window.SiMoEnsChessVoice && window.SiMoEnsChessVoice.isActive()));
        if (callback) callback();
      }, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = scriptBase + 'simoens-xadrez-voice.js?v=xadrez-voice-final-20260501g';
    script.defer = true;
    script.setAttribute('data-simoens-xadrez-voice', 'true');
    script.addEventListener('load', function () {
      updateXadrezVoiceButton(!!(window.SiMoEnsChessVoice && window.SiMoEnsChessVoice.isActive()));
      if (callback) callback();
    });
    document.head.appendChild(script);
  }

  window.addEventListener('simoens-xadrez-voice-state', function (event) {
    updateXadrezVoiceButton(!!(event.detail && event.detail.active));
  });

  var lastReadableSelection = '';
  var lastReadableSelectionAt = 0;
  var selectionCapturedForWidget = false;
  var selectionMemoryInstalled = false;

  function nodeInsideWidget(node) {
    var element = node && (node.nodeType === 1 ? node : node.parentElement);
    return !!(element && element.closest && element.closest('.simoens-a11y-widget, .simoens-a11y-modal, [vw], [vw-access-button], [vw-plugin-wrapper]'));
  }

  function currentSelectionText() {
    if (!window.getSelection) return '';
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '';
    return text(selection.toString()).slice(0, 6500);
  }

  function rememberReadableSelection() {
    var value = currentSelectionText();
    if (value) {
      lastReadableSelection = value;
      lastReadableSelectionAt = Date.now();
      return lastReadableSelection;
    }
    return '';
  }

  function clearReadableSelection(removeBrowserSelection) {
    lastReadableSelection = '';
    lastReadableSelectionAt = 0;
    selectionCapturedForWidget = false;
    if (removeBrowserSelection === false) return;
    try {
      if (window.getSelection) window.getSelection().removeAllRanges();
    } catch (error) {}
  }

  function selectedTextForSpeech() {
    var liveSelection = currentSelectionText();
    if (liveSelection) {
      lastReadableSelection = liveSelection;
      lastReadableSelectionAt = Date.now();
      selectionCapturedForWidget = false;
      return liveSelection;
    }
    var saved = '';
    if (lastReadableSelection && selectionCapturedForWidget && Date.now() - lastReadableSelectionAt < 5000) {
      saved = lastReadableSelection;
    }
    clearReadableSelection(false);
    return saved;
  }

  function installSelectionMemory() {
    if (selectionMemoryInstalled) return;
    selectionMemoryInstalled = true;
    var timer = 0;
    function scheduleRemember() {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        var value = currentSelectionText();
        if (value) {
          lastReadableSelection = value;
          lastReadableSelectionAt = Date.now();
        } else if (!selectionCapturedForWidget) {
          lastReadableSelection = '';
          lastReadableSelectionAt = 0;
        }
      }, 35);
    }
    document.addEventListener('selectionchange', scheduleRemember, true);
    document.addEventListener('mouseup', scheduleRemember, true);
    document.addEventListener('keyup', scheduleRemember, true);
    document.addEventListener('touchend', scheduleRemember, true);
  }

  function text(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function safeCssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/["\\#.;?+*~':!^$[\]()=>|/@]/g, '\\$&');
  }

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      Object.keys(state).forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(saved, key)) state[key] = saved[key];
      });
    } catch (error) {}
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {}
  }

  function announce(message) {
    var live = document.getElementById(liveId);
    if (live) live.textContent = message;
  }

  function setPressed(button, pressed) {
    if (!button) return;
    button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  }

  function protectAssistiveWidgets() {
    var selectors = [
      '.simoens-a11y-widget',
      '.simoens-a11y-skip',
      '.simoens-a11y-grayscale-layer',
      '.simoens-a11y-colorblind-layer',
      '[vw]',
      '[vw-access-button]',
      '[vw-plugin-wrapper]',
      '#chat-widget',
      '.chat-widget',
      '#visit-widget',
      '.visit-widget',
      '#scrollToTop',
      '.scrollToTop'
    ];

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (element) {
        element.classList.add('simoens-a11y-safe');
        element.style.setProperty('filter', 'none', 'important');
        element.style.setProperty('isolation', 'isolate', 'important');
        if (!element.classList.contains('simoens-a11y-guide-line')) {
          element.style.setProperty('z-index', '2147483400', 'important');
        }
      });
    });
  }

  function isInsideAssistiveWidget(element) {
    if (!element || !element.closest) return false;
    return !!element.closest('.simoens-a11y-widget, .simoens-a11y-skip, [vw], [vw-access-button], [vw-plugin-wrapper], #chat-widget, .chat-widget, #visit-widget, .visit-widget, #scrollToTop, .scrollToTop');
  }

  function hasDirectReadableText(element) {
    if (!element || !element.childNodes) return false;
    var interactive = /^(A|BUTTON|INPUT|SELECT|TEXTAREA|LABEL|SUMMARY|OPTION)$/i.test(element.tagName || '');
    if (interactive) return true;
    for (var i = 0; i < element.childNodes.length; i += 1) {
      var node = element.childNodes[i];
      if (node.nodeType === 3 && text(node.nodeValue).length > 0) return true;
    }
    return false;
  }
  function updateFontScaling() {
    var scaleMap = [1, 1.125, 1.25, 1.375];
    var scale = scaleMap[state.font] || 1;
    var selector = 'body *:not(script):not(style):not(noscript):not(svg):not(path):not(canvas):not(iframe)';

    document.querySelectorAll(selector).forEach(function (element) {
      if (isInsideAssistiveWidget(element)) return;
      if (!hasDirectReadableText(element)) return;

      if (scale === 1) {
        if (element.hasAttribute('data-simoens-a11y-font-original-inline')) {
          var original = element.getAttribute('data-simoens-a11y-font-original-inline');
          if (original) element.style.fontSize = original;
          else element.style.removeProperty('font-size');
        }
        element.removeAttribute('data-simoens-a11y-font-base');
        element.removeAttribute('data-simoens-a11y-font-original-inline');
        return;
      }

      if (!element.hasAttribute('data-simoens-a11y-font-base')) {
        element.setAttribute('data-simoens-a11y-font-original-inline', element.style.fontSize || '');
        var computed = window.getComputedStyle(element).fontSize;
        var base = parseFloat(computed);
        if (!base || !isFinite(base)) return;
        element.setAttribute('data-simoens-a11y-font-base', String(base));
      }

      var storedBase = parseFloat(element.getAttribute('data-simoens-a11y-font-base'));
      if (!storedBase || !isFinite(storedBase)) return;
      element.style.setProperty('font-size', (storedBase * scale).toFixed(2) + 'px', 'important');
    });
  }

  function injectStyle() {
    if (document.getElementById('simoens-a11y-style')) return;
    var style = document.createElement('style');
    style.id = 'simoens-a11y-style';
    style.textContent = `
      :root {
        --simoens-a11y-bottom: 96px;
        --simoens-a11y-right: 20px;
        --simoens-a11y-scale: 1;
      }

      html.simoens-a11y-font-1 { --simoens-a11y-font-scale: 1.125; }
      html.simoens-a11y-font-2 { --simoens-a11y-font-scale: 1.25; }
      html.simoens-a11y-font-3 { --simoens-a11y-font-scale: 1.375; }

      html.simoens-a11y-spacing body,
      html.simoens-a11y-spacing body * {
        letter-spacing: 0.04em !important;
        word-spacing: 0.12em !important;
        line-height: 1.75 !important;
      }

      html.simoens-a11y-contrast body {
        background: #050505 !important;
        color: #ffffff !important;
      }

      html.simoens-a11y-contrast body *:not(img):not(video):not(canvas):not(svg):not(path):not([vw]):not([vw] *):not(.simoens-a11y-safe):not(.simoens-a11y-safe *):not(.simoens-a11y-widget):not(.simoens-a11y-widget *):not(.simoens-a11y-guide-line):not(.simoens-a11y-skip) {
        background-color: #050505 !important;
        color: #ffffff !important;
        border-color: #ffffff !important;
        box-shadow: none !important;
      }

      html.simoens-a11y-contrast a,
      html.simoens-a11y-contrast button,
      html.simoens-a11y-contrast input,
      html.simoens-a11y-contrast select,
      html.simoens-a11y-contrast textarea {
        color: #ffff00 !important;
        border-color: #ffff00 !important;
        outline-color: #ffff00 !important;
      }

      html.simoens-a11y-links a,
      html.simoens-a11y-links [role="link"] {
        outline: 3px solid currentColor !important;
        outline-offset: 3px !important;
        text-decoration: underline !important;
        text-decoration-thickness: 0.18em !important;
      }

      html.simoens-a11y-motion *,
      html.simoens-a11y-motion *::before,
      html.simoens-a11y-motion *::after {
        scroll-behavior: auto !important;
        animation: none !important;
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        animation-iteration-count: 1 !important;
        transition: none !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
        transform-style: flat !important;
      }

      html.simoens-a11y-motion body *:not(.simoens-a11y-safe):not(.simoens-a11y-safe *):not(.simoens-a11y-grayscale-layer):not(.simoens-a11y-colorblind-layer):not(.simoens-a11y-widget):not(.simoens-a11y-widget *):not([vw]):not([vw] *):not([vw-access-button]):not([vw-plugin-wrapper]) {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        filter: none !important;
        text-shadow: none !important;
      }

      html.simoens-a11y-motion video,
      html.simoens-a11y-motion canvas,
      html.simoens-a11y-motion model-viewer {
        animation-play-state: paused !important;
      }

      html.simoens-a11y-motion .animate,
      html.simoens-a11y-motion .animated,
      html.simoens-a11y-motion .fade,
      html.simoens-a11y-motion .fadeIn,
      html.simoens-a11y-motion .fade-in,
      html.simoens-a11y-motion .parallax,
      html.simoens-a11y-motion [data-aos],
      html.simoens-a11y-motion [class*="parallax"],
      html.simoens-a11y-motion [class*="animate"],
      html.simoens-a11y-motion [class*="motion"],
      html.simoens-a11y-motion [class*="transition"] {
        animation: none !important;
        transition: none !important;
        transform: none !important;
      }

      html.simoens-a11y-motion {
        scroll-behavior: auto !important;
      }

      html.simoens-a11y-motion body *:not(.simoens-a11y-safe):not(.simoens-a11y-safe *):not(.simoens-a11y-grayscale-layer):not(.simoens-a11y-colorblind-layer):not(.simoens-a11y-widget):not(.simoens-a11y-widget *):not([vw]):not([vw] *):not([vw-access-button]):not([vw-plugin-wrapper]):not(#chat-widget):not(#chat-widget *):not(.chat-widget):not(.chat-widget *),
      html.simoens-a11y-motion body *:not(.simoens-a11y-safe):not(.simoens-a11y-safe *):not(.simoens-a11y-grayscale-layer):not(.simoens-a11y-colorblind-layer):not(.simoens-a11y-widget):not(.simoens-a11y-widget *):not([vw]):not([vw] *):not([vw-access-button]):not([vw-plugin-wrapper]):not(#chat-widget):not(#chat-widget *):not(.chat-widget):not(.chat-widget *)::before,
      html.simoens-a11y-motion body *:not(.simoens-a11y-safe):not(.simoens-a11y-safe *):not(.simoens-a11y-grayscale-layer):not(.simoens-a11y-colorblind-layer):not(.simoens-a11y-widget):not(.simoens-a11y-widget *):not([vw]):not([vw] *):not([vw-access-button]):not([vw-plugin-wrapper]):not(#chat-widget):not(#chat-widget *):not(.chat-widget):not(.chat-widget *)::after {
        scroll-behavior: auto !important;
        animation-name: none !important;
        animation-duration: 0.001ms !important;
        animation-delay: 0ms !important;
        animation-iteration-count: 1 !important;
        transition-property: none !important;
        transition-duration: 0.001ms !important;
        transition-delay: 0ms !important;
        transform: none !important;
        filter: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        box-shadow: none !important;
      }

      html.simoens-a11y-motion video,
      html.simoens-a11y-motion canvas {
        animation: none !important;
        transition: none !important;
      }

      html.simoens-a11y-motion .carousel,
      html.simoens-a11y-motion .carousel *,
      html.simoens-a11y-motion [data-bs-ride],
      html.simoens-a11y-motion [data-bs-ride] * {
        transition: none !important;
        animation: none !important;
      }

      .simoens-a11y-grayscale-layer {
        position: fixed;
        inset: 0;
        z-index: 2147482500;
        pointer-events: none;
        display: none;
        -webkit-backdrop-filter: grayscale(1);
        backdrop-filter: grayscale(1);
      }

      html.simoens-a11y-grayscale .simoens-a11y-grayscale-layer {
        display: block;
      }

      html.simoens-a11y-motion.simoens-a11y-grayscale .simoens-a11y-grayscale-layer,
      html.simoens-a11y-grayscale.simoens-a11y-motion .simoens-a11y-grayscale-layer {
        display: block !important;
        -webkit-backdrop-filter: grayscale(1) !important;
        backdrop-filter: grayscale(1) !important;
        filter: none !important;
      }

      html.simoens-a11y-grayscale .simoens-a11y-safe,
      html.simoens-a11y-grayscale .simoens-a11y-widget,
      html.simoens-a11y-grayscale .simoens-a11y-skip,
      html.simoens-a11y-grayscale .simoens-a11y-grayscale-layer,
      html.simoens-a11y-grayscale .simoens-a11y-guide-line,
      html.simoens-a11y-grayscale [vw],
      html.simoens-a11y-grayscale [vw-access-button],
      html.simoens-a11y-grayscale [vw-plugin-wrapper],
      html.simoens-a11y-grayscale #chat-widget,
      html.simoens-a11y-grayscale .chat-widget,
      html.simoens-a11y-grayscale #visit-widget,
      html.simoens-a11y-grayscale .visit-widget,
      html.simoens-a11y-grayscale #scrollToTop,
      html.simoens-a11y-grayscale .scrollToTop {
        filter: none !important;
      }

      html.simoens-a11y-motion .simoens-a11y-widget,
      html.simoens-a11y-motion .simoens-a11y-widget *,
      html.simoens-a11y-motion .simoens-a11y-skip,
      html.simoens-a11y-motion .simoens-a11y-guide-line,
      html.simoens-a11y-motion [vw],
      html.simoens-a11y-motion [vw] *,
      html.simoens-a11y-motion [vw-access-button],
      html.simoens-a11y-motion [vw-plugin-wrapper],
      html.simoens-a11y-motion #chat-widget,
      html.simoens-a11y-motion #chat-widget *,
      html.simoens-a11y-motion .chat-widget,
      html.simoens-a11y-motion .chat-widget * {
        filter: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      html.simoens-a11y-grayscale .simoens-a11y-widget {
        z-index: 2147483600 !important;
      }

      html.simoens-a11y-grayscale .simoens-a11y-skip,
      html.simoens-a11y-grayscale [vw],
      html.simoens-a11y-grayscale [vw-access-button],
      html.simoens-a11y-grayscale [vw-plugin-wrapper],
      html.simoens-a11y-grayscale #chat-widget,
      html.simoens-a11y-grayscale .chat-widget,
      html.simoens-a11y-grayscale #visit-widget,
      html.simoens-a11y-grayscale .visit-widget,
      html.simoens-a11y-grayscale #scrollToTop,
      html.simoens-a11y-grayscale .scrollToTop {
        z-index: 2147483400 !important;
      }

      .simoens-a11y-colorblind-layer {
        position: fixed;
        inset: 0;
        z-index: 2147482490;
        pointer-events: none;
        display: none;
        mix-blend-mode: normal;
      }

      html.simoens-a11y-colorblind .simoens-a11y-colorblind-layer {
        display: block;
      }

      html.simoens-a11y-colorblind-redgreen .simoens-a11y-colorblind-layer {
        -webkit-backdrop-filter: saturate(1.38) contrast(1.18) brightness(1.03) hue-rotate(-8deg) !important;
        backdrop-filter: saturate(1.38) contrast(1.18) brightness(1.03) hue-rotate(-8deg) !important;
        filter: none !important;
      }

      html.simoens-a11y-colorblind-blueyellow .simoens-a11y-colorblind-layer {
        -webkit-backdrop-filter: saturate(1.32) contrast(1.2) brightness(1.04) hue-rotate(14deg) !important;
        backdrop-filter: saturate(1.32) contrast(1.2) brightness(1.04) hue-rotate(14deg) !important;
        filter: none !important;
      }

      html.simoens-a11y-motion.simoens-a11y-colorblind-redgreen .simoens-a11y-colorblind-layer,
      html.simoens-a11y-colorblind-redgreen.simoens-a11y-motion .simoens-a11y-colorblind-layer {
        display: block !important;
        -webkit-backdrop-filter: saturate(1.38) contrast(1.18) brightness(1.03) hue-rotate(-8deg) !important;
        backdrop-filter: saturate(1.38) contrast(1.18) brightness(1.03) hue-rotate(-8deg) !important;
        filter: none !important;
      }

      html.simoens-a11y-motion.simoens-a11y-colorblind-blueyellow .simoens-a11y-colorblind-layer,
      html.simoens-a11y-colorblind-blueyellow.simoens-a11y-motion .simoens-a11y-colorblind-layer {
        display: block !important;
        -webkit-backdrop-filter: saturate(1.32) contrast(1.2) brightness(1.04) hue-rotate(14deg) !important;
        backdrop-filter: saturate(1.32) contrast(1.2) brightness(1.04) hue-rotate(14deg) !important;
        filter: none !important;
      }

      html.simoens-a11y-colorblind .simoens-a11y-safe,
      html.simoens-a11y-colorblind .simoens-a11y-widget,
      html.simoens-a11y-colorblind .simoens-a11y-skip,
      html.simoens-a11y-colorblind .simoens-a11y-colorblind-layer,
      html.simoens-a11y-colorblind .simoens-a11y-guide-line,
      html.simoens-a11y-colorblind [vw],
      html.simoens-a11y-colorblind [vw-access-button],
      html.simoens-a11y-colorblind [vw-plugin-wrapper],
      html.simoens-a11y-colorblind #chat-widget,
      html.simoens-a11y-colorblind .chat-widget,
      html.simoens-a11y-colorblind #visit-widget,
      html.simoens-a11y-colorblind .visit-widget,
      html.simoens-a11y-colorblind #scrollToTop,
      html.simoens-a11y-colorblind .scrollToTop {
        filter: none !important;
      }

      html.simoens-a11y-colorblind .simoens-a11y-widget {
        z-index: 2147483600 !important;
      }
html.simoens-a11y-focus :focus,
      html.simoens-a11y-focus :focus-visible,
      .simoens-a11y-widget button:focus-visible,
      .simoens-a11y-skip:focus {
        outline: 4px solid #ffd400 !important;
        outline-offset: 4px !important;
        box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.72) !important;
      }

      .simoens-a11y-skip {
        position: fixed;
        top: 12px;
        left: 12px;
        transform: translateY(-160%);
        z-index: 2147483300;
        padding: 12px 16px;
        border-radius: 12px;
        background: #111827;
        color: #ffffff;
        font: 700 15px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        text-decoration: none;
        border: 2px solid #ffffff;
      }

      .simoens-a11y-skip:focus {
        transform: translateY(0);
      }

      .simoens-a11y-widget {
        position: fixed;
        right: var(--simoens-a11y-right);
        bottom: var(--simoens-a11y-bottom);
        z-index: 2147483100;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #111827;
      }
      .simoens-a11y-trigger {
        width: 58px;
        height: 58px;
        border-radius: 999px;
        border: 2px solid rgba(17, 24, 39, 0.14);
        background: #ffffff !important;
        background-color: #ffffff !important;
        background-image: none !important;
        color: #111827;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 14px 34px rgba(0,0,0,0.22);
        font-size: 25px;
        line-height: 1;
        overflow: hidden;
        position: relative;
        isolation: isolate;
      }

      .simoens-a11y-trigger::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: #ffffff !important;
        z-index: 0;
      }
      .simoens-a11y-trigger-icon {
        width: 42px;
        height: 42px;
        display: block;
        object-fit: contain;
        pointer-events: none;
        position: relative;
        z-index: 1;
        background: #ffffff;
        border-radius: 999px;
      }

.simoens-a11y-trigger:hover {
        transform: translateY(-1px);
      }

      .simoens-a11y-panel {
        position: absolute;
        right: 0;
        bottom: 72px;
        width: min(342px, calc(100vw - 32px));
        max-height: min(76vh, 680px);
        overflow: auto;
        border-radius: 22px;
        border: 1px solid rgba(17,24,39,0.14);
        background: rgba(255, 255, 255, 0.98);
        color: #111827;
        box-shadow: 0 26px 70px rgba(0,0,0,0.34);
        padding: 16px;
        display: none;
      }

      .simoens-a11y-panel.is-open {
        display: block;
      }

      .simoens-a11y-head {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        justify-content: space-between;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(17,24,39,0.12);
      }

      .simoens-a11y-title {
        margin: 0;
        font-size: 18px;
        line-height: 1.15;
        font-weight: 800;
      }

      .simoens-a11y-subtitle {
        margin: 5px 0 0;
        font-size: 13px;
        color: #4b5563;
        line-height: 1.35;
      }

      .simoens-a11y-close {
        flex: 0 0 auto;
        border: 0;
        border-radius: 999px;
        background: #f3f4f6;
        color: #111827;
        width: 34px;
        height: 34px;
        cursor: pointer;
        font-size: 20px;
      }

      .simoens-a11y-section {
        padding-top: 12px;
      }

      .simoens-a11y-section-title {
        margin: 0 0 8px;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #6b7280;
        font-weight: 800;
      }

      .simoens-a11y-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .simoens-a11y-action {
        min-height: 46px;
        border: 1px solid rgba(17,24,39,0.16);
        border-radius: 14px;
        background: #f9fafb;
        color: #111827;
        cursor: pointer;
        font-size: 13px;
        font-weight: 750;
        line-height: 1.2;
        padding: 10px 9px;
        text-align: center;
      }

      .simoens-a11y-action:hover {
        background: #eef2ff;
      }

      .simoens-a11y-action[aria-pressed="true"] {
        background: #111827;
        color: #ffffff;
        border-color: #111827;
      }

      .simoens-a11y-action.is-wide {
        grid-column: 1 / -1;
      }

      .simoens-a11y-note {
        margin: 10px 0 0;
        color: #4b5563;
        font-size: 12.5px;
        line-height: 1.35;
      }

      .simoens-a11y-reader {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
      }

      .simoens-a11y-reader .simoens-a11y-action {
        min-height: 42px;
      }

      .simoens-a11y-voice-settings {
        display: grid;
        gap: 9px;
        margin-top: 10px;
        padding: 10px;
        border: 1px solid rgba(17,24,39,0.12);
        border-radius: 16px;
        background: rgba(249,250,251,0.86);
      }

      .simoens-a11y-voice-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        align-items: center;
        font-size: 12.5px;
        color: #374151;
        font-weight: 750;
      }

      .simoens-a11y-voice-row input[type=range] {
        grid-column: 1 / -1;
        width: 100%;
        accent-color: #111827;
      }

      .simoens-a11y-voice-row select {
        grid-column: 1 / -1;
        width: 100%;
        min-height: 38px;
        border: 1px solid rgba(17,24,39,0.16);
        border-radius: 12px;
        background: #ffffff;
        color: #111827;
        padding: 8px 10px;
        font-size: 13px;
        font-weight: 750;
      }

      .simoens-a11y-voice-value {
        color: #111827;
        font-weight: 850;
      }

      .simoens-a11y-guide-line {
        position: fixed;
        left: 0;
        width: 100vw;
        height: 72px;
        transform: translateY(-50%);
        pointer-events: none;
        z-index: 2147483550;
        display: none;
        background: linear-gradient(to bottom, transparent 0, rgba(255, 212, 0, 0.18) 38%, rgba(255, 212, 0, 0.36) 50%, rgba(255, 212, 0, 0.18) 62%, transparent 100%);
        border-top: 2px solid rgba(255, 212, 0, 0.92);
        border-bottom: 2px solid rgba(255, 212, 0, 0.92);
      }

      html.simoens-a11y-guide .simoens-a11y-guide-line {
        display: block;
      }

      html.simoens-a11y-contrast .simoens-a11y-guide-line {
        background: linear-gradient(to bottom, transparent 0, rgba(255, 255, 0, 0.28) 35%, rgba(255, 255, 0, 0.58) 50%, rgba(255, 255, 0, 0.28) 65%, transparent 100%) !important;
        border-top: 3px solid #ffff00 !important;
        border-bottom: 3px solid #ffff00 !important;
        box-shadow: 0 -2px 0 #000000 inset, 0 2px 0 #000000 inset, 0 0 0 9999px rgba(0,0,0,0.12) !important;
        filter: none !important;
      }

      html.simoens-a11y-contrast .simoens-a11y-panel {
        background: #000000 !important;
        color: #ffffff !important;
        border: 2px solid #ffff00 !important;
        box-shadow: 0 0 0 4px #000000, 0 24px 70px rgba(0,0,0,0.72) !important;
      }

      html.simoens-a11y-contrast .simoens-a11y-trigger {
        background: #ffffff !important;
        background-color: #ffffff !important;
        background-image: none !important;
        color: #111827 !important;
        border-color: #ffff00 !important;
      }

      html.simoens-a11y-contrast .simoens-a11y-title,
      html.simoens-a11y-contrast .simoens-a11y-subtitle,
      html.simoens-a11y-contrast .simoens-a11y-section-title,
      html.simoens-a11y-contrast .simoens-a11y-note {
        color: #ffffff !important;
      }

      html.simoens-a11y-contrast .simoens-a11y-action,
      html.simoens-a11y-contrast .simoens-a11y-close {
        background: #000000 !important;
        color: #ffff00 !important;
        border: 2px solid #ffff00 !important;
      }

      html.simoens-a11y-contrast .simoens-a11y-action:hover,
      html.simoens-a11y-contrast .simoens-a11y-action[aria-pressed="true"] {
        background: #ffff00 !important;
        color: #000000 !important;
        border-color: #ffffff !important;
      }

      html.simoens-a11y-contrast .simoens-a11y-head {
        border-bottom-color: #ffff00 !important;
      }

      .simoens-a11y-live {
        position: fixed;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }

      @media (max-width: 640px) {
        :root {
          --simoens-a11y-right: 14px;
          --simoens-a11y-bottom: 88px;
        }

        .simoens-a11y-trigger {
          width: 54px;
          height: 54px;
        }

        .simoens-a11y-panel {
          bottom: 66px;
          max-height: 72vh;
        }
      }

      @media print {
        .simoens-a11y-widget,
        .simoens-a11y-skip,
        .simoens-a11y-guide-line,
        .simoens-a11y-grayscale-layer,
        .simoens-a11y-colorblind-layer,
        .simoens-a11y-live {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function cardTitle(element) {
    var current = element;
    for (var i = 0; i < 8 && current; i += 1) {
      current = current.parentElement;
      if (!current) break;
      var heading = current.querySelector('h1,h2,h3,h4,h5,strong,.card-title,.item-title,.mbr-section-title');
      if (heading && text(heading.textContent)) return text(heading.textContent);
      var content = text(current.textContent);
      if (content.length > 8) {
        content = content.replace(/\b\d{2}\/\d{2}\/\d{4}\b.*$/, '').replace(/\s+Veja\s*$/, '').replace(/\s+Previous\s+Next\s*$/, '');
        if (content.length > 90) content = content.slice(0, 87).trim() + '...';
        return content;
      }
    }
    return text(document.title || 'SiMoEns');
  }

  function labelFromControl(control) {
    if (control.id) {
      var explicit = document.querySelector('label[for="' + safeCssEscape(control.id) + '"]');
      if (explicit && text(explicit.textContent)) return text(explicit.textContent);
    }
    var parentLabel = control.closest('label');
    if (parentLabel && text(parentLabel.textContent)) return text(parentLabel.textContent);
    if (control.placeholder && text(control.placeholder)) return text(control.placeholder);
    if (control.getAttribute('value') && text(control.getAttribute('value'))) return text(control.getAttribute('value'));
    var parent = control.parentElement;
    if (parent && text(parent.textContent)) return text(parent.textContent).slice(0, 120);
    return 'Controle interativo da página';
  }

  var labelsById = {
    rx: 'Controlar rotação no eixo X',
    ry: 'Controlar rotação no eixo Y',
    rz: 'Controlar rotação no eixo Z',
    showAxes: 'Mostrar ou ocultar eixos XYZ',
    zoomRange: 'Controlar aproximação da visualização',
    pointRange: 'Controlar tamanho dos pontos',
    qualityRange: 'Controlar qualidade da visualização',
    unitSelect: 'Selecionar unidade de pressão',
    pressureInput: 'Digitar valor de pressão',
    sampleSelect: 'Selecionar amostra ou ponto de referência',
    pressureSlider: 'Ajustar pressão',
    tempSlider: 'Ajustar temperatura',
    historySearch: 'Buscar conversas no histórico',
    input: 'Digite sua pergunta para o assistente do SiMoEns',
    searchInput: 'Pesquisar conteúdo na página de ensino'
  };

  var canvasLabels = {
    cv: 'Visualização interativa principal do conteúdo científico.',
    viewport: 'Visualização 3D interativa de geometria cristalográfica.',
    gl: 'Visualização 3D interativa da geometria molecular.',
    angleOverlay: 'Camada visual dos ângulos moleculares.',
    miniAxes: 'Miniatura dos eixos de orientação 3D.',
    sceneCanvas: 'Visualização interativa de célula unitária e contagem por simetria.',
    scene3d: 'Visualização tridimensional de orbitais hidrogenoides.',
    waveCanvas: 'Gráfico da função de onda.',
    densityCanvas: 'Gráfico de densidade eletrônica.',
    radialCanvas: 'Gráfico radial do orbital.',
    scene: 'Visualização interativa da cena científica.',
    phaseChart: 'Diagrama de fases da água.',
    viz: 'Visualização interativa de célula unitária e rede cristalina.'
  };

  function ensureSkipLink() {
    if (document.getElementById('simoens-skip-main')) return;
    var target = document.querySelector('main, [role="main"], #main, #conteudo, #content, .content, .page-content');
    if (!target) {
      target = document.querySelector('section, article, .container');
      if (target && !target.id) target.id = 'conteudo-principal';
    }
    if (!target) return;
    if (!target.id) target.id = 'conteudo-principal';
    if (!target.getAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    var skip = document.createElement('a');
    skip.id = 'simoens-skip-main';
    skip.className = 'simoens-a11y-skip';
    skip.href = '#' + target.id;
    skip.textContent = 'Pular para o conteúdo principal';
    skip.addEventListener('click', function () {
      setTimeout(function () { target.focus({ preventScroll: true }); }, 0);
    });
    document.body.insertBefore(skip, document.body.firstChild);
  }

  function ensureAlt() {
    document.querySelectorAll('img').forEach(function (img) {
      if (text(img.getAttribute('alt'))) return;
      var src = String(img.getAttribute('src') || '').toLowerCase();
      var file = src.split('/').pop().split('?')[0].replace(/\.[a-z0-9]+$/, '').replace(/[-_]+/g, ' ');
      if (src.indexOf('simoens-1-214x194') !== -1 || src.indexOf('logo') !== -1) img.setAttribute('alt', 'Logotipo do SiMoEns.');
      else if (src.indexOf('placeholder') !== -1 || src.indexOf('homem-cinzento') !== -1) img.setAttribute('alt', 'Imagem temporária de instituição parceira.');
      else if (file && file.length > 2) img.setAttribute('alt', 'Imagem relacionada a ' + file + '.');
      else img.setAttribute('alt', 'Imagem relacionada a ' + cardTitle(img) + '.');
    });
  }

  function ensureLinks() {
    document.querySelectorAll('a').forEach(function (link) {
      var label = text(link.textContent).toLowerCase();
      if (!link.getAttribute('aria-label') && ['veja', 'ver', 'saiba mais', 'acesse', 'clique aqui', 'aqui'].indexOf(label) !== -1) {
        link.setAttribute('aria-label', 'Acessar ' + cardTitle(link));
      }
      if (!link.getAttribute('aria-label') && link.getAttribute('href') === '#' && !text(link.textContent)) {
        link.setAttribute('aria-label', 'Abrir controle de navegação');
      }
      if (!link.getAttribute('title') && link.getAttribute('aria-label')) {
        link.setAttribute('title', link.getAttribute('aria-label'));
      }
    });
  }

  function ensureControls() {
    document.querySelectorAll('input, select, textarea, button, [role="button"]').forEach(function (control) {
      var type = String(control.getAttribute('type') || '').toLowerCase();
      if (type === 'hidden') return;
      if (control.closest('.simoens-a11y-widget')) return;
      if (control.getAttribute('aria-label') || control.getAttribute('aria-labelledby')) return;
      if ((control.tagName || '').toLowerCase() === 'button' && text(control.textContent)) return;
      var id = control.id || '';
      var label = labelsById[id] || labelFromControl(control);
      control.setAttribute('aria-label', label);
      if (!control.getAttribute('title')) control.setAttribute('title', label);
    });
  }

  function ensureCanvas() {
    document.querySelectorAll('canvas').forEach(function (canvas) {
      if (!canvas.getAttribute('role')) canvas.setAttribute('role', 'img');
      if (!canvas.getAttribute('aria-label') && !canvas.getAttribute('aria-labelledby')) {
        canvas.setAttribute('aria-label', canvasLabels[canvas.id] || 'Visualização interativa da página ' + text(document.title || 'SiMoEns') + '.');
      }
    });
  }

  function ensureVLibras() {
    document.querySelectorAll('[vw], [vw-access-button], [vw-plugin-wrapper]').forEach(function (element) {
      if (element.hasAttribute('vw')) {
        element.setAttribute('aria-label', 'Ferramenta VLibras para tradução do conteúdo da página para Libras');
      }
      if (element.hasAttribute('vw-access-button')) {
        element.setAttribute('role', 'button');
        element.setAttribute('tabindex', '0');
        element.setAttribute('aria-label', 'Abrir VLibras');
        element.setAttribute('title', 'Abrir VLibras');
      }
      if (element.hasAttribute('vw-plugin-wrapper')) {
        element.setAttribute('aria-label', 'Painel do VLibras');
      }
    });
  }

  function ensureChat() {
    var toggle = document.getElementById('toggleBtn') || document.querySelector('.sw-toggle');
    if (toggle && !toggle.getAttribute('aria-label')) toggle.setAttribute('aria-label', 'Abrir chat do SiMoEns');
    var input = document.querySelector('.sw-input, textarea#input');
    if (input && !input.getAttribute('aria-label')) input.setAttribute('aria-label', 'Digite sua pergunta para o assistente do SiMoEns');
  }

  function applyPreferences() {
    var root = document.documentElement;
    root.classList.add(ROOT_CLASS, 'simoens-a11y-focus');
    root.classList.remove('simoens-a11y-font-1', 'simoens-a11y-font-2', 'simoens-a11y-font-3');
    if (state.font > 0) root.classList.add('simoens-a11y-font-' + state.font);
    root.classList.toggle('simoens-a11y-contrast', !!state.contrast);
    root.classList.toggle('simoens-a11y-links', !!state.links);
    root.classList.toggle('simoens-a11y-motion', !!state.motion);
    root.classList.toggle('simoens-a11y-spacing', !!state.spacing);
    root.classList.toggle('simoens-a11y-guide', !!state.guide);
    root.classList.toggle('simoens-a11y-grayscale', !!state.grayscale);
    root.classList.toggle('simoens-a11y-colorblind', !!state.colorblind);
    root.classList.remove('simoens-a11y-colorblind-redgreen', 'simoens-a11y-colorblind-blueyellow');
    if (state.colorblind) root.classList.add(state.colorblindType === 'blueyellow' ? 'simoens-a11y-colorblind-blueyellow' : 'simoens-a11y-colorblind-redgreen');
    document.querySelectorAll('[data-a11y-toggle]').forEach(function (button) {
      var key = button.getAttribute('data-a11y-toggle');
      setPressed(button, !!state[key]);
    });
    document.querySelectorAll('[data-a11y-colorblind]').forEach(function (button) {
      var type = button.getAttribute('data-a11y-colorblind');
      setPressed(button, !!state.colorblind && state.colorblindType === type);
    });
    updateFontScaling();
  }

  function clampNumber(value, min, max, fallback) {
    var number = parseFloat(value);
    if (!Number.isFinite(number)) number = fallback;
    return Math.min(max, Math.max(min, number));
  }

  function speechSettings() {
    var settings = {
      volume: clampNumber(state.speechVolume, 0, 2, 1),
      rate: clampNumber(state.speechRate, 0.5, 3, 0.95),
      gender: state.speechVoiceGender === 'male' ? 'male' : 'female'
    };
    try {
      window.__simoensA11yVoiceSettings = { volume: settings.volume, rate: settings.rate, gender: settings.gender, updatedAt: Date.now() };
    } catch (error) {}
    return settings;
  }

  function readSpeechSettingsNow() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      var volume = Object.prototype.hasOwnProperty.call(saved, 'speechVolume') ? saved.speechVolume : state.speechVolume;
      var rate = Object.prototype.hasOwnProperty.call(saved, 'speechRate') ? saved.speechRate : state.speechRate;
      var gender = Object.prototype.hasOwnProperty.call(saved, 'speechVoiceGender') ? saved.speechVoiceGender : state.speechVoiceGender;
      return {
        volume: clampNumber(volume, 0, 2, 1),
        rate: clampNumber(rate, 0.5, 3, 0.95),
        gender: gender === 'male' ? 'male' : 'female'
      };
    } catch (error) {
      return speechSettings();
    }
  }

  function voiceMatchesGender(voice, gender) {
    var name = String((voice && voice.name) || '').toLowerCase();
    var uri = String((voice && voice.voiceURI) || '').toLowerCase();
    var source = name + ' ' + uri;
    var femaleHints = ['female', 'feminina', 'mulher', 'woman', 'maria', 'luciana', 'francisca', 'helena', 'yara', 'camila', 'vitória', 'vitoria', 'beatriz', 'isabela', 'leticia', 'letícia', 'eloquence brazilian portuguese female', 'português do brasil female', 'portuguese brazil female'];
    var maleHints = ['male', 'masculina', 'masculino', 'homem', 'man', 'daniel', 'felipe', 'ricardo', 'joaquim', 'antonio', 'antônio', 'carlos', 'paulo', 'thiago', 'rafael', 'brasil male', 'brazilian portuguese male', 'português do brasil male', 'portuguese brazil male'];
    var hints = gender === 'male' ? maleHints : femaleHints;
    return hints.some(function (hint) { return source.indexOf(hint) !== -1; });
  }

  function preferredVoices() {
    if (!('speechSynthesis' in window) || typeof window.speechSynthesis.getVoices !== 'function') return [];
    var voices = window.speechSynthesis.getVoices() || [];
    var ptBr = voices.filter(function (voice) { return /^pt[-_]br$/i.test(String(voice.lang || '')); });
    var pt = voices.filter(function (voice) { return /^pt/i.test(String(voice.lang || '')); });
    return ptBr.length ? ptBr : pt;
  }

  function pickSpeechVoice(gender) {
    var voices = preferredVoices();
    if (!voices.length) return null;
    var matched = voices.find(function (voice) { return voiceMatchesGender(voice, gender); });
    return matched || voices[0] || null;
  }

  function applySpeechSettingsToUtterance(utterance) {
    if (!utterance) return utterance;
    var settings = readSpeechSettingsNow();
    utterance.lang = 'pt-BR';
    utterance.volume = Math.max(0, Math.min(1, settings.volume));
    utterance.rate = clampNumber(settings.rate, 0.5, 3, 0.95);
    utterance.pitch = settings.gender === 'male' ? 0.55 : 1.45;
    var voice = pickSpeechVoice(settings.gender);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'pt-BR';
    }
    utterance.__simoensVoiceApplied = true;
    return utterance;
  }

  function installSpeechSynthesisInterceptor() {
    if (!('speechSynthesis' in window) || !window.speechSynthesis || window.speechSynthesis.__simoensA11yPatched) return;
    try {
      var nativeSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
      window.speechSynthesis.speak = function (utterance) {
        try {
          if (utterance && window.SpeechSynthesisUtterance && utterance instanceof SpeechSynthesisUtterance) {
            applySpeechSettingsToUtterance(utterance);
          }
        } catch (error) {}
        return nativeSpeak(utterance);
      };
      window.speechSynthesis.__simoensA11yPatched = true;
    } catch (error) {}
  }

  function refreshVoiceControls() {
    var settings = speechSettings();
    document.querySelectorAll('[data-a11y-voice-control]').forEach(function (control) {
      var key = control.getAttribute('data-a11y-voice-control');
      if (key === 'volume') control.value = String(Math.round(settings.volume * 100));
      if (key === 'rate') control.value = String(settings.rate);
      if (key === 'gender') control.value = settings.gender;
    });
    document.querySelectorAll('[data-a11y-voice-value]').forEach(function (node) {
      var key = node.getAttribute('data-a11y-voice-value');
      if (key === 'volume') node.textContent = Math.round(settings.volume * 100) + '%';
      if (key === 'rate') node.textContent = settings.rate.toFixed(2).replace('.', ',') + '×';
      if (key === 'gender') node.textContent = settings.gender === 'male' ? 'masculina' : 'feminina';
    });
  }

  function setVoiceSetting(key, value) {
    if (key === 'volume') state.speechVolume = clampNumber(value / 100, 0, 2, 1);
    if (key === 'rate') state.speechRate = clampNumber(value, 0.5, 3, 0.95);
    if (key === 'gender') state.speechVoiceGender = value === 'male' ? 'male' : 'female';
    saveState();
    var settings = speechSettings();
    refreshVoiceControls();
    window.dispatchEvent(new CustomEvent('simoens-a11y-voice-settings-change', { detail: settings }));
  }

  window.SiMoEnsA11yVoice = {
    getSettings: speechSettings,
    applyToUtterance: applySpeechSettingsToUtterance,
    stop: stopSpeechEngines
  };

  function currentChessSelectionTextForSpeech() {
    if (!isXadrezQuimicoPage()) return '';
    try {
      if (window.SiMoEnsChessVoice && typeof window.SiMoEnsChessVoice.getCurrentSelectionText === 'function') {
        return text(window.SiMoEnsChessVoice.getCurrentSelectionText());
      }
      if (window.__simoensChessVoiceCurrentSelectionText) return text(window.__simoensChessVoiceCurrentSelectionText);
    } catch (error) {}
    return '';
  }

  function pageTextForSpeech() {
    var root = document.querySelector('main, [role="main"], article, .content, .page-content') || document.body;
    var clone = root.cloneNode(true);
    clone.querySelectorAll('script, style, noscript, svg, canvas, nav, footer, header, .simoens-a11y-widget, .simoens-a11y-modal, [vw], [vw-plugin-wrapper], iframe').forEach(function (node) {
      node.remove();
    });
    var parts = [];
    clone.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,figcaption,button,a,label,th,td').forEach(function (node) {
      var value = text(node.textContent);
      if (value.length > 2 && parts.indexOf(value) === -1) parts.push(value);
    });
    return parts.join('. ').slice(0, 6500);
  }

  function speechState() {
    window.__simoensA11ySpeech = window.__simoensA11ySpeech || { token: 0, stopped: true };
    return window.__simoensA11ySpeech;
  }

  function hardCancelSpeech(cancelToken) {
    if (!('speechSynthesis' in window)) return;
    function shouldKeepCancelling() {
      var shared = speechState();
      return shared.stopped && shared.token === cancelToken;
    }
    function cancelNow() {
      try { window.speechSynthesis.cancel(); } catch (error) {}
    }
    try {
      cancelNow();
      if (window.speechSynthesis.paused) {
        try { window.speechSynthesis.resume(); } catch (error) {}
        cancelNow();
      }
      [25, 75, 150, 300, 600].forEach(function (delay) {
        window.setTimeout(function () {
          if (shouldKeepCancelling()) cancelNow();
        }, delay);
      });
    } catch (error) {}
  }

  function stopSpeechEngines() {
    var shared = speechState();
    shared.token += 1;
    shared.stopped = true;
    var cancelToken = shared.token;
    if (window.simoensStopAccessibleSpeech && window.simoensStopAccessibleSpeech !== stopSpeechEngines) {
      try { window.simoensStopAccessibleSpeech(true); } catch (error) {}
    }
    hardCancelSpeech(cancelToken);
  }

  function speakContent(content, message) {
    if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
      announce('Seu navegador não oferece leitura em voz nesta página.');
      return;
    }
    stopSpeechEngines();
    if (!content) {
      announce('Não encontrei texto suficiente para leitura.');
      return;
    }
    var shared = speechState();
    shared.token += 1;
    shared.stopped = false;
    var token = shared.token;
    var utterance = new SpeechSynthesisUtterance(content);
    applySpeechSettingsToUtterance(utterance);
    utterance.onend = function () { if (speechState().token === token) speechState().stopped = true; };
    utterance.onerror = function () { if (speechState().token === token) speechState().stopped = true; };
    window.speechSynthesis.speak(utterance);
    announce(message || 'Leitura em voz iniciada.');
  }

  function speakPage() {
    var selected = selectedTextForSpeech();
    if (selected) {
      speakContent(selected, 'Leitura do texto selecionado iniciada.');
      clearReadableSelection();
      return;
    }
    clearReadableSelection();
    var chessSelection = currentChessSelectionTextForSpeech();
    if (chessSelection) {
      speakContent(chessSelection, 'Leitura da seleção do xadrez iniciada.');
      return;
    }
    if (window.simoensReadAccessibleDescription && window.simoensReadAccessibleDescription()) {
      announce('Leitura do texto acessível iniciada.');
      return;
    }
    speakContent(pageTextForSpeech(), 'Leitura em voz iniciada.');
  }

  function pauseSpeech() {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      announce('Leitura pausada.');
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      announce('Leitura retomada.');
    }
  }

  function stopSpeech() {
    stopSpeechEngines();
    announce('Leitura em voz interrompida.');
  }

  function focusMain() {
    var skip = document.getElementById('simoens-skip-main');
    if (skip) {
      var target = document.querySelector(skip.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: state.motion ? 'auto' : 'smooth', block: 'start' });
        setTimeout(function () { target.focus({ preventScroll: true }); }, 180);
        announce('Conteúdo principal selecionado.');
      }
    }
  }

  function buildWidget() {
    if (document.getElementById('simoens-a11y-widget')) return;
    var live = document.createElement('div');
    live.id = liveId;
    live.className = 'simoens-a11y-live';
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    document.body.appendChild(live);

    var guide = document.createElement('div');
    guide.className = 'simoens-a11y-guide-line';
    guide.setAttribute('aria-hidden', 'true');
    document.body.appendChild(guide);

    var grayscaleLayer = document.createElement('div');
    grayscaleLayer.className = 'simoens-a11y-grayscale-layer simoens-a11y-safe';
    grayscaleLayer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(grayscaleLayer);

    var colorblindLayer = document.createElement('div');
    colorblindLayer.className = 'simoens-a11y-colorblind-layer simoens-a11y-safe';
    colorblindLayer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(colorblindLayer);

    var widget = document.createElement('div');
    widget.id = 'simoens-a11y-widget';
    widget.className = 'simoens-a11y-widget';
    widget.innerHTML = `
      <button class="simoens-a11y-trigger" type="button" aria-expanded="false" aria-controls="${panelId}" aria-label="Abrir menu de acessibilidade" title="Acessibilidade">
        <img class="simoens-a11y-trigger-icon" src="data:image/png;base64,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" alt="" aria-hidden="true" draggable="false">
      </button>
      <section class="simoens-a11y-panel" id="${panelId}" role="dialog" aria-modal="false" aria-labelledby="simoens-a11y-title">
        <div class="simoens-a11y-head">
          <div>
            <h2 class="simoens-a11y-title" id="simoens-a11y-title">Acessibilidade</h2>
            <p class="simoens-a11y-subtitle">Ajustes visuais, leitura em voz e navegação assistiva.</p>
          </div>
          <button class="simoens-a11y-close" type="button" aria-label="Fechar menu de acessibilidade">×</button>
        </div>
        <div class="simoens-a11y-section">
          <p class="simoens-a11y-section-title">Leitura</p>
          <div class="simoens-a11y-reader">
            <button class="simoens-a11y-action" type="button" data-a11y-action="speak" title="Lê em voz alta o texto selecionado. Sem seleção ativa, lê o texto acessível da página ou o conteúdo principal.">Ouvir</button>
            <button class="simoens-a11y-action" type="button" data-a11y-action="pause" title="Pausa a leitura em voz. Se já estiver pausada, retoma a leitura.">Pausar</button>
            <button class="simoens-a11y-action" type="button" data-a11y-action="stop" title="Interrompe a leitura em voz e encerra a fala atual.">Parar</button>
          </div>
          <div class="simoens-a11y-voice-settings" aria-label="Configurações da voz de leitura">
            <label class="simoens-a11y-voice-row">
              <span>Volume</span><span class="simoens-a11y-voice-value" data-a11y-voice-value="volume">100%</span>
              <input type="range" min="0" max="200" step="5" value="100" data-a11y-voice-control="volume" aria-label="Volume da voz">
            </label>
            <label class="simoens-a11y-voice-row">
              <span>Velocidade</span><span class="simoens-a11y-voice-value" data-a11y-voice-value="rate">0,95×</span>
              <input type="range" min="0.5" max="3" step="0.05" value="0.95" data-a11y-voice-control="rate" aria-label="Velocidade da voz">
            </label>
            <label class="simoens-a11y-voice-row">
              <span>Voz</span><span class="simoens-a11y-voice-value" data-a11y-voice-value="gender">feminina</span>
              <select data-a11y-voice-control="gender" aria-label="Tipo de voz">
                <option value="female">Feminina</option>
                <option value="male">Masculina</option>
              </select>
            </label>
          </div>
          <p class="simoens-a11y-note">Se houver texto selecionado na página, o botão Ouvir lê apenas a seleção e depois limpa essa seleção para não repetir na próxima leitura.</p>
        </div>
        <div class="simoens-a11y-section">
          <p class="simoens-a11y-section-title">Visual</p>
          <div class="simoens-a11y-grid">
            <button class="simoens-a11y-action" type="button" data-a11y-action="font-up" title="Aumenta o tamanho dos textos da página para facilitar a leitura.">Aumentar fonte</button>
            <button class="simoens-a11y-action" type="button" data-a11y-action="font-down" title="Reduz o tamanho dos textos da página, voltando em direção ao tamanho original.">Diminuir fonte</button>
            <button class="simoens-a11y-action" type="button" data-a11y-toggle="contrast" aria-pressed="false" title="Escurece o fundo e clareia os textos e contornos para aumentar a legibilidade.">Alto contraste</button>
            <button class="simoens-a11y-action" type="button" data-a11y-toggle="grayscale" aria-pressed="false" title="Aplica tons de cinza ao conteúdo principal da página, sem afetar os widgets flutuantes.">Tons de cinza</button>
            <button class="simoens-a11y-action" type="button" data-a11y-action="colorblind-redgreen" data-a11y-colorblind="redgreen" aria-pressed="false" title="Aplica filtro visual para daltonismo vermelho/verde, comum em protanopia e deuteranopia.">Daltônico: vermelho/verde</button>
            <button class="simoens-a11y-action" type="button" data-a11y-action="colorblind-blueyellow" data-a11y-colorblind="blueyellow" aria-pressed="false" title="Aplica filtro visual para daltonismo azul/amarelo, relacionado à tritanopia.">Daltônico: azul/amarelo</button>
            <button class="simoens-a11y-action" type="button" data-a11y-toggle="links" aria-pressed="false" title="Realça os links com sublinhado e contorno para facilitar sua identificação.">Destacar links</button>
            <button class="simoens-a11y-action" type="button" data-a11y-toggle="spacing" aria-pressed="false" title="Aumenta espaçamento entre letras, palavras e linhas para melhorar a leitura.">Espaçar texto</button>
            <button class="simoens-a11y-action" type="button" data-a11y-toggle="motion" aria-pressed="false" title="Reduz animações, transições, parallax, sombras fortes, filtros e outros efeitos visuais que podem causar desconforto.">Reduzir efeitos</button>
            <button class="simoens-a11y-action" type="button" data-a11y-toggle="guide" aria-pressed="false" title="Mostra uma faixa horizontal que acompanha o mouse e ajuda a manter a linha de leitura.">Guia de leitura</button>
          </div>
        </div>
        <div class="simoens-a11y-section">
          <p class="simoens-a11y-section-title">Navegação</p>
          <div class="simoens-a11y-grid">
            <button class="simoens-a11y-action is-wide" type="button" data-a11y-action="skip" title="Move o foco para o conteúdo principal da página, pulando elementos repetitivos de navegação.">Ir para conteúdo principal</button>
            <button class="simoens-a11y-action is-wide" type="button" data-a11y-action="reset" title="Desativa todos os ajustes do menu e restaura a configuração padrão.">Restaurar ajustes</button>
          </div>
        </div>
      </section>
    `;
    document.body.appendChild(widget);
    refreshVoiceControls();
    if ('speechSynthesis' in window && typeof window.speechSynthesis.getVoices === 'function') {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = refreshVoiceControls;
    }
    if (isXadrezQuimicoPage()) {
      var navigationSection = widget.querySelector('.simoens-a11y-section:nth-of-type(3)');
      var chessSection = document.createElement('div');
      chessSection.className = 'simoens-a11y-section';
      chessSection.innerHTML = '<p class="simoens-a11y-section-title">Xadrez Químico</p><div class="simoens-a11y-grid"><button class="simoens-a11y-action is-wide" type="button" data-a11y-action="chess-voice" aria-pressed="false" title="Ativa a narração dinâmica das peças, vidrarias, casas, movimentos, capturas, xeque e xeque-mate no Xadrez Químico.">Modo voz xadrez</button></div><p class="simoens-a11y-note">Com o modo voz ativo, o jogo aguarda a narração terminar antes de executar a jogada. O sistema narra peça, vidraria, casa, opções de movimento, capturas, movimentos da máquina, xeque e xeque-mate usando o volume, a velocidade e a voz escolhidos acima.</p>';
      if (navigationSection && navigationSection.parentNode) navigationSection.parentNode.insertBefore(chessSection, navigationSection);
      else widget.querySelector('.simoens-a11y-panel').appendChild(chessSection);
      loadXadrezVoiceExtension();
    }
    widget.classList.add('simoens-a11y-safe');
    live.classList.add('simoens-a11y-safe');
    guide.classList.add('simoens-a11y-safe');
    grayscaleLayer.classList.add('simoens-a11y-safe');

    var trigger = widget.querySelector('.simoens-a11y-trigger');
    var panel = widget.querySelector('.simoens-a11y-panel');
    var close = widget.querySelector('.simoens-a11y-close');

    function captureSelectionBeforeSpeakAction() {
      var value = currentSelectionText();
      if (value) {
        lastReadableSelection = value;
        lastReadableSelectionAt = Date.now();
        selectionCapturedForWidget = true;
      } else {
        clearReadableSelection(false);
      }
    }

    panel.addEventListener('pointerdown', function (event) {
      var button = event.target && event.target.closest ? event.target.closest('button') : null;
      if (!button || button.getAttribute('data-a11y-action') !== 'speak') return;
      captureSelectionBeforeSpeakAction();
    }, true);

    panel.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      var button = event.target && event.target.closest ? event.target.closest('button') : null;
      if (!button || button.getAttribute('data-a11y-action') !== 'speak') return;
      captureSelectionBeforeSpeakAction();
    }, true);

    function setOpen(open) {
      panel.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) setTimeout(function () {
        var first = panel.querySelector('button');
        if (first) first.focus();
      }, 0);
    }

    trigger.addEventListener('click', function () {
      setOpen(!panel.classList.contains('is-open'));
    });

    close.addEventListener('click', function () {
      setOpen(false);
      trigger.focus();
    });

    panel.addEventListener('input', function (event) {
      var control = event.target && event.target.closest ? event.target.closest('[data-a11y-voice-control]') : null;
      if (!control) return;
      setVoiceSetting(control.getAttribute('data-a11y-voice-control'), control.value);
    });

    panel.addEventListener('change', function (event) {
      var control = event.target && event.target.closest ? event.target.closest('[data-a11y-voice-control]') : null;
      if (!control) return;
      setVoiceSetting(control.getAttribute('data-a11y-voice-control'), control.value);
      if (control.tagName && control.tagName.toLowerCase() === 'select') announce('Voz ' + (control.value === 'male' ? 'masculina' : 'feminina') + ' selecionada.');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        setOpen(false);
        trigger.focus();
      }
    });

    panel.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) return;
      var action = button.getAttribute('data-a11y-action');
      var toggle = button.getAttribute('data-a11y-toggle');
      if (toggle) {
        state[toggle] = !state[toggle];
        saveState();
        applyPreferences();
        announce((button.textContent || 'Ajuste') + (state[toggle] ? ' ativado.' : ' desativado.'));
      }
      if (action === 'colorblind-redgreen' || action === 'colorblind-blueyellow') {
        var selectedType = action === 'colorblind-blueyellow' ? 'blueyellow' : 'redgreen';
        if (state.colorblind && state.colorblindType === selectedType) {
          state.colorblind = false;
        } else {
          state.colorblind = true;
          state.colorblindType = selectedType;
        }
        saveState();
        applyPreferences();
        announce(state.colorblind ? (selectedType === 'blueyellow' ? 'Filtro daltônico azul/amarelo ativado.' : 'Filtro daltônico vermelho/verde ativado.') : 'Filtro daltônico desativado.');
      }

      if (action === 'font-up') {
        state.font = Math.min(3, state.font + 1);
        saveState();
        applyPreferences();
        announce('Fonte aumentada.');
      }
      if (action === 'font-down') {
        state.font = Math.max(0, state.font - 1);
        saveState();
        applyPreferences();
        announce('Fonte diminuída.');
      }
      if (action === 'speak') speakPage();
      if (action === 'pause') pauseSpeech();
      if (action === 'stop') {
        stopSpeech();
        if (window.SiMoEnsChessVoice && typeof window.SiMoEnsChessVoice.stop === 'function') window.SiMoEnsChessVoice.stop();
      }
      if (action === 'chess-voice') {
        loadXadrezVoiceExtension(function () {
          if (window.SiMoEnsChessVoice && typeof window.SiMoEnsChessVoice.toggle === 'function') {
            updateXadrezVoiceButton(window.SiMoEnsChessVoice.toggle());
          } else {
            announce('Modo voz do Xadrez Químico não foi carregado nesta página.');
          }
        });
      }
      if (action === 'skip') focusMain();
      if (action === 'reset') {
        Object.keys(state).forEach(function (key) {
          if (key === 'font') state[key] = 0;
          else if (key === 'colorblindType') state[key] = 'redgreen';
          else if (key === 'speechVolume') state[key] = 1;
          else if (key === 'speechRate') state[key] = 0.95;
          else if (key === 'speechVoiceGender') state[key] = 'female';
          else state[key] = false;
        });
        saveState();
        stopSpeech();
        applyPreferences();
        refreshVoiceControls();
        window.dispatchEvent(new CustomEvent('simoens-a11y-voice-settings-change', { detail: speechSettings() }));
        announce('Ajustes de acessibilidade restaurados.');
      }
    });

    document.addEventListener('mousemove', function (event) {
      if (!state.guide) return;
      guide.style.top = event.clientY + 'px';
    }, { passive: true });
  }

  function applyFixes() {
    if (!document.documentElement.getAttribute('lang')) document.documentElement.setAttribute('lang', 'pt-BR');
    ensureSkipLink();
    ensureAlt();
    ensureLinks();
    ensureControls();
    ensureCanvas();
    ensureVLibras();
    ensureChat();
    protectAssistiveWidgets();
  }

  function loadAnimationAccessibilityExtension() {
    if (document.querySelector('script[data-simoens-animation-accessibility]')) return;
    var script = document.createElement('script');
    script.src = scriptBase + 'simoens-animation-accessibility.js?v=a11y-md-20260501c';
    script.defer = true;
    script.setAttribute('data-simoens-animation-accessibility', 'true');
    document.head.appendChild(script);
  }

  function start() {
    injectStyle();
    loadState();
    installSelectionMemory();
    installSpeechSynthesisInterceptor();
    speechSettings();
    buildWidget();
    loadAnimationAccessibilityExtension();
    loadXadrezVoiceExtension();
    applyPreferences();
    applyFixes();
    var observer = new MutationObserver(function () {
      window.clearTimeout(window.__simoensA11yTimer);
      window.__simoensA11yTimer = window.setTimeout(function () {
        applyFixes();
        applyPreferences();
      }, 120);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
