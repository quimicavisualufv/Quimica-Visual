(function () {
  const cards = Array.from(document.querySelectorAll('#gallery03-j .item.features-image'));
  const searchInput = document.getElementById('ensino-search');
  const filterButtons = Array.from(document.querySelectorAll('.ensino-filter-btn'));
  const noResults = document.getElementById('ensino-no-results');
  const resultsCount = document.getElementById('ensino-results-count');

  if (!cards.length || !searchInput || !filterButtons.length || !noResults || !resultsCount) return;

  const normalizeText = (value) => (value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

  const getTitle = (card) => {
    const titleEl = card.querySelector('.item-title');
    return titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
  };

  const getCategory = (title) => {
    const normalizedTitle = normalizeText(title);
    const isExercise = normalizedTitle.includes('(exercicio)') || normalizedTitle.includes('(exercicio de fixacao)') || normalizedTitle.includes('(exercicio de fizacao)');
    const isGuide = normalizedTitle.includes('(guia)');
    const isGame = normalizedTitle.includes('(jogo)');
    if (isExercise) return 'exercicio';
    if (isGuide) return 'guiado';
    if (isGame) return 'jogo';
    return 'visualizacao';
  };

  cards.forEach((card) => {
    const title = getTitle(card);
    card.dataset.title = normalizeText(title);
    card.dataset.category = getCategory(title);
  });

  let currentFilter = 'todos';

  const applyFilters = () => {
    const searchTerm = normalizeText(searchInput.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const matchesFilter = currentFilter === 'todos' || card.dataset.category === currentFilter;
      const matchesSearch = !searchTerm || card.dataset.title.includes(searchTerm);
      const shouldShow = matchesFilter && matchesSearch;

      card.style.display = shouldShow ? '' : 'none';

      if (shouldShow) visibleCount += 1;
    });

    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    resultsCount.textContent = visibleCount === 1 ? '1 recurso encontrado' : `${visibleCount} recursos encontrados`;
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', function () {
      currentFilter = this.dataset.filter || 'todos';
      filterButtons.forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      });
      this.classList.add('is-active');
      this.setAttribute('aria-pressed', 'true');
      applyFilters();
    });
  });

  searchInput.addEventListener('input', applyFilters);

  applyFilters();
})();
