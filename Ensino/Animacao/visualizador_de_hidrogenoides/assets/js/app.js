import { loadPackedData } from './orbital-loader.js';
import { initHydrogenVisualizer } from './renderer.js';

loadPackedData().then(initHydrogenVisualizer).catch((error) => {
  console.error('[SiMoEns] Falha ao iniciar visualizador hidrogenoide:', error);
  const badge = document.getElementById('entryCountBadge');
  if (badge) badge.textContent = 'Não foi possível carregar os dados dos orbitais';
});
