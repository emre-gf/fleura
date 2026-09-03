(function () {
  var toggle = document.querySelector('.seo-menu-toggle');
  var links = document.getElementById('seoNavLinks');
  if (!toggle || !links) return;

  function closeMenu(restoreFocus) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Menüyü aç');
    links.classList.remove('is-open');
    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    links.classList.toggle('is-open', open);
  });

  links.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && links.classList.contains('is-open')) closeMenu(true);
  });

  document.addEventListener('click', function (event) {
    if (links.classList.contains('is-open') && !event.target.closest('.seo-nav')) closeMenu(false);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 880) closeMenu(false);
  }, { passive: true });
})();
