// Use the application's React instance and state; the desktop panels stay intact.
export function createGemMobileComponents(React, { gems, ListIcon, CloseIcon }) {
  const h = React.createElement;

  function Menu({ gem, impurity, viewMode, showInterstices, onGem, onImpurity, onMode, onInterstices, onFormulas }) {
    return h('aside', { className: 'qv-gem-controls', 'aria-label': 'Configurações das gemas', 'data-gem-id': gem.id },
      h('header', { className: 'qv-gem-menu-header' },
        h('h1', null, 'Gemas e cor'),
        h('button', { type: 'button', className: 'qv-gem-formulas-button', onClick: onFormulas,
          'aria-label': 'Ver Todas as Fórmulas', title: 'Ver Todas as Fórmulas' }, h(ListIcon, { size: 20 }))),
      h('div', { className: 'qv-gem-menu-body', tabIndex: 0, 'aria-label': 'Opções e explicações das gemas' },
        h('div', { className: 'qv-gem-field' },
          h('label', { htmlFor: 'qv-gem-structure' }, 'Estrutura'),
          h('select', { id: 'qv-gem-structure', value: gem.id, onChange: event => onGem(event.target.value) },
            Object.values(gems).map(item => h('option', { key: item.id, value: item.id }, item.name))),
          h('p', { className: 'qv-gem-structure-meta' }, gem.formula, ' · ', gem.system)),
        h('div', { className: 'qv-gem-field', role: 'group', 'aria-labelledby': 'qv-gem-mode-label' },
          h('p', { className: 'qv-gem-field-title', id: 'qv-gem-mode-label' }, 'Visão microscópica'),
          h('div', { className: 'qv-gem-mode-buttons' },
            h('button', { type: 'button', 'aria-pressed': viewMode === 'unit_cell', onClick: () => onMode('unit_cell') }, 'Célula'),
            h('button', { type: 'button', 'aria-pressed': viewMode === 'lattice', onClick: () => onMode('lattice') }, 'Rede'))),
        h('div', { className: 'qv-gem-field' },
          h('label', { htmlFor: 'qv-gem-impurity' },
            h('span', { className: 'qv-gem-swatch', style: { backgroundColor: impurity.macroColor }, 'aria-hidden': true }),
            'Cor / impureza'),
          h('select', { id: 'qv-gem-impurity', value: impurity.id, onChange: event => onImpurity(event.target.value) },
            gem.impurities.map(item => h('option', { key: item.id, value: item.id }, item.name)))),
        h('label', { className: 'qv-gem-polyhedra' },
          h('input', { type: 'checkbox', checked: showInterstices, onChange: event => onInterstices(event.target.checked) }),
          h('span', null, 'Mostrar poliedros')),
        h('section', { className: 'qv-gem-explanation', 'aria-labelledby': 'qv-gem-color-title' },
          h('h2', { id: 'qv-gem-color-title' }, impurity.name),
          h('p', null, impurity.elements !== 'Nenhum'
            ? `${impurity.defectType || 'Defeito'}: ${impurity.elements}` : 'Sem defeito ativo'),
          h('p', null, h('strong', null, 'Como afeta a cor: '), impurity.description),
          h('p', null, h('strong', null, 'Animação no modelo: '), impurity.animation || 'marcação estática')),
        h('details', { className: 'qv-gem-structure-description' },
          h('summary', null, 'Sobre esta estrutura'), h('p', null, gem.description))));
  }

  function Formulas({ onClose }) {
    const ref = React.useRef(null);
    React.useLayoutEffect(() => {
      const dialog = ref.current;
      const opener = document.activeElement;
      dialog.showModal();
      return () => {
        if (dialog.open) dialog.close();
        if (opener?.isConnected) opener.focus({ preventScroll: true });
      };
    }, []);
    return h('dialog', { ref, className: 'qv-gem-formulas', 'aria-labelledby': 'qv-gem-formulas-title',
      onCancel: event => { event.preventDefault(); onClose(); } },
      h('header', { className: 'qv-gem-formulas-header' },
        h('h2', { id: 'qv-gem-formulas-title' }, 'Fórmulas e estruturas'),
        h('button', { type: 'button', onClick: onClose, 'aria-label': 'Fechar fórmulas' }, h(CloseIcon, { size: 20 }))),
      h('div', { className: 'qv-gem-formulas-list', tabIndex: 0, 'aria-label': 'Lista de fórmulas' },
        Object.values(gems).map(gem => h('article', { key: gem.id, className: 'qv-gem-formula-card' },
          h('h3', null, gem.name), h('p', null, gem.system), h('code', null, gem.formula)))));
  }

  return { Menu, Formulas };
}
