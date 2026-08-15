(function () {
  function simoensFixDynamicA11y() {
    document.querySelectorAll('.dropdown-menu[aria-labelledby]').forEach(function (el) {
      el.removeAttribute('aria-labelledby');
    });
    document.querySelectorAll('a.dropdown-toggle[title]').forEach(function (el) {
      el.removeAttribute('title');
    });
    document.querySelectorAll('[vw]').forEach(function (el) {
      if (el.hasAttribute('aria-label')) {
        el.setAttribute('role', 'group');
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', simoensFixDynamicA11y);
  } else {
    simoensFixDynamicA11y();
  }
  new MutationObserver(simoensFixDynamicA11y).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['aria-labelledby', 'title', 'aria-label']
  });
})();
