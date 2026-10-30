(function(){
  function fixInjectedAccessibilityWidgets(){
    var vlibras = document.querySelector('[vw][data-simoens-vlibras="true"], [vw].enabled');
    if (vlibras) {
      vlibras.setAttribute('role', 'complementary');
      vlibras.setAttribute('aria-label', 'Ferramenta VLibras para tradução do conteúdo da página para Libras');
    }
    document.querySelectorAll('.sw-meta, .sw-footer').forEach(function(el){
      el.style.color = '#1f2937';
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixInjectedAccessibilityWidgets);
  } else {
    fixInjectedAccessibilityWidgets();
  }
  window.addEventListener('load', fixInjectedAccessibilityWidgets);
  setTimeout(fixInjectedAccessibilityWidgets, 1200);
})();
