/* Orbital Lab: bridge into the shared SiMoEns mobile experience.
   The workspace is an independent scroll pane in landscape; keep it in sync
   with navigation and resize the WebGL renderers after orientation changes. */
(() => {
  'use strict';
  if (!window.SimoensMobile || document.documentElement.dataset.qvLayout !== 'orbital-lab') return;
  const $ = id => document.getElementById(id);
  const init = () => {
    const barLabel = document.querySelector('#qv-mobile-bar > span');
    if (barLabel) barLabel.textContent = 'ORBITAL LAB';
    const workspace = document.querySelector('.workspace');
    if (!workspace) return;
    let pending = 0;
    const refresh = () => {
      if (pending) cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        pending = 0;
        window.dispatchEvent(new Event('resize'));
      });
    };
    // The engine scrolls window on a mode change. Mobile scrolls .workspace instead.
    $('moduleSelect')?.addEventListener('change', () => {
      workspace.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      requestAnimationFrame(refresh);
    });
    document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
      workspace.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      requestAnimationFrame(refresh);
    }));
    // Canvas sizes and widget positions must follow device orientation changes.
    window.addEventListener('simoens:orientation', () => requestAnimationFrame(refresh));
    document.addEventListener('fullscreenchange', () => requestAnimationFrame(refresh));
    // The guided tour also scrolls to elements inside this viewport.
    // Its own scrollIntoView remains functional without moving the browser window.
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
