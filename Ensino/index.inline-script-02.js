(function () {
  const helpButton = document.getElementById('ensino-help-btn');
  const helpBubble = document.getElementById('ensino-help-bubble');

  if (!helpButton || !helpBubble) return;

  const setOpen = (open) => {
    helpButton.classList.toggle('is-open', open);
    helpBubble.classList.toggle('is-open', open);
    helpButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    helpBubble.setAttribute('aria-hidden', open ? 'false' : 'true');
  };

  helpButton.addEventListener('click', function (event) {
    event.stopPropagation();
    setOpen(!helpBubble.classList.contains('is-open'));
  });

  helpBubble.addEventListener('click', function (event) {
    event.stopPropagation();
  });

  document.addEventListener('click', function () {
    setOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setOpen(false);
  });
})();
