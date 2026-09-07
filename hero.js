/* Infinite gallery: timed right-to-left slides, dragging and keyboard controls. */
(() => {
  const gallery = document.querySelector('[data-fc-gallery]');
  if (!gallery) return;
  const viewport = gallery.querySelector('.fc-window');
  const track = gallery.querySelector('.fc-track');
  const slides = [...track.children];
  const originals = slides.filter(slide => !slide.hasAttribute('data-clone'));
  const count = originals.length;
  if (count < 2) return;
  const counter = gallery.querySelector('[data-fc-index]');
  const caption = gallery.querySelector('[data-fc-caption]');
  const pauseButton = gallery.querySelector('[data-fc-pause]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let position = 2, step = 0, center = 0;
  let timer, settleTimer;
  let moving = false, dragging = null, inView = false;
  let hovered = false, focused = false, paused = false;
  const logicalIndex = () => ((position - 2) % count + count) % count;

  function paint(delta = 0) {
    track.style.transform = `translate3d(${center - position * step + delta}px, 0, 0)`;
  }
  function stopTimer() { clearTimeout(timer); }
  function schedule() {
    stopTimer();
    if (paused || reducedMotion.matches || !inView || document.hidden || hovered || focused || dragging || moving) return;
    timer = setTimeout(() => move(1, false), 2600);
  }
  function update(manual) {
    const index = logicalIndex();
    counter.textContent = String(index + 1).padStart(2, '0');
    caption.setAttribute('aria-live', manual ? 'polite' : 'off');
    caption.textContent = originals[index].dataset.label;
    originals.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== index)));
    [position - 1, position, position + 1].forEach(i => {
      const img = slides[i]?.querySelector('img');
      if (img) { img.loading = 'eager'; img.decode?.().catch(() => {}); }
    });
  }
  function settle() {
    clearTimeout(settleTimer);
    track.classList.remove('is-moving');
    moving = false;
    position = logicalIndex() + 2;
    paint();
    schedule();
  }
  function animate() {
    moving = true;
    track.classList.add('is-moving');
    paint();
    if (reducedMotion.matches) settle();
    else settleTimer = setTimeout(settle, 560);
  }
  function move(direction, manual = true) {
    if (moving || dragging) return;
    stopTimer();
    position += direction;
    update(manual);
    animate();
  }
  function measure() {
    if (dragging) {
      const id = dragging.id;
      dragging = null;
      if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id);
      viewport.classList.remove('is-dragging');
    }
    const width = slides[0].getBoundingClientRect().width;
    step = width + parseFloat(getComputedStyle(track).columnGap);
    center = (viewport.clientWidth - width) / 2;
    settle();
  }
  track.addEventListener('transitionend', event => {
    if (event.target === track && event.propertyName === 'transform') settle();
  });
  gallery.querySelector('[data-fc-prev]').addEventListener('click', () => move(-1));
  gallery.querySelector('[data-fc-next]').addEventListener('click', () => move(1));
  const labels = {
    play: pauseButton.dataset.labelPlay || 'Otomatik kaydırmayı başlat',
    pause: pauseButton.dataset.labelPause || 'Otomatik kaydırmayı durdur',
    off: pauseButton.dataset.labelOff || 'Azaltılmış hareket tercihi nedeniyle otomatik kaydırma kapalı'
  };
  function updatePause() {
    const stopped = paused || reducedMotion.matches;
    pauseButton.classList.toggle('is-paused', stopped);
    pauseButton.setAttribute('aria-label', stopped ? labels.play : labels.pause);
    pauseButton.setAttribute('aria-pressed', String(stopped));
    pauseButton.disabled = reducedMotion.matches;
    if (reducedMotion.matches) pauseButton.setAttribute('aria-label', labels.off);
    schedule();
  }
  pauseButton.addEventListener('click', () => { paused = !paused; updatePause(); });
  viewport.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });
  viewport.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || moving) return;
    stopTimer();
    dragging = { id: event.pointerId, x: event.clientX, delta: 0, start: performance.now() };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', event => {
    if (!dragging || dragging.id !== event.pointerId) return;
    dragging.delta = Math.max(-step, Math.min(step, event.clientX - dragging.x));
    paint(dragging.delta);
  });
  function endDrag(event, cancelled = false) {
    if (!dragging || dragging.id !== event.pointerId) return;
    const { id, delta, start } = dragging;
    dragging = null;
    viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id);
    const speed = Math.abs(delta) / Math.max(1, performance.now() - start);
    if (!cancelled && (Math.abs(delta) > step * .14 || (Math.abs(delta) > 25 && speed > .35))) {
      position += delta < 0 ? 1 : -1;
      update(true);
    }
    animate();
  }
  viewport.addEventListener('pointerup', event => endDrag(event));
  viewport.addEventListener('pointercancel', event => endDrag(event, true));
  viewport.addEventListener('lostpointercapture', event => endDrag(event, true));
  viewport.addEventListener('dragstart', event => event.preventDefault());
  let wheelDelta = 0, wheelTimer;
  viewport.addEventListener('wheel', event => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelDelta = 0; }, 200);
    if (moving || dragging) return;
    if (wheelDelta && Math.sign(event.deltaX) !== Math.sign(wheelDelta)) wheelDelta = 0;
    wheelDelta += event.deltaX;
    if (Math.abs(wheelDelta) < 40) return;
    move(wheelDelta > 0 ? 1 : -1);
    wheelDelta = 0;
  }, { passive: false });
  gallery.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; stopTimer(); } });
  gallery.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { hovered = false; schedule(); } });
  gallery.addEventListener('focusin', () => { focused = true; stopTimer(); });
  gallery.addEventListener('focusout', event => { if (!gallery.contains(event.relatedTarget)) { focused = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { settle(); updatePause(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); }, { threshold: .2 }).observe(viewport);
  } else { inView = true; }
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(viewport);
  else window.addEventListener('resize', measure);
  measure();
  update(false);
  updatePause();
})();
