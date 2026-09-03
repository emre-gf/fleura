/* Fleura Nails — çerez rıza bildirimi
   Zorunlu çerezler her zaman çalışır. Analitik çerezler (GA4 / Firebase Analytics)
   yalnızca kullanıcı kabul ettiğinde etkinleşir; Consent Mode v2 ile yönetilir. */
(function () {
  var KEY = 'fn-cookie-consent';
  var POLICY_URL = '/kvkk-aydinlatma-metni';

  // Sayfa diline göre metin (html lang özniteliğinden okunur)
  var LANG = (document.documentElement.getAttribute('lang') || 'tr').slice(0, 2);
  var T = {
    tr: {
      title: 'Çerez tercihiniz',
      body: 'Çerez kullanıyoruz. ',
      link: 'Detaylar',
      accept: 'Kabul et',
      decline: 'Reddet',
      aria: 'Çerez tercihi'
    },
    en: {
      title: 'Cookie preference',
      body: 'We use cookies. ',
      link: 'Details',
      accept: 'Accept',
      decline: 'Decline',
      aria: 'Cookie preference'
    },
    ru: {
      title: 'Использование cookie',
      body: 'Мы используем cookie. ',
      link: 'Подробнее',
      accept: 'Принять',
      decline: 'Отклонить',
      aria: 'Настройка cookie'
    }
  };
  var t = T[LANG] || T.tr;

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  function grantAnalytics() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    // Ana sayfada Firebase Analytics rızayı bekliyorsa şimdi başlat
    if (typeof window.fnStartFirebaseAnalytics === 'function') {
      window.fnStartFirebaseAnalytics();
    }
  }

  function denyAnalytics() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  }

  // Sayfa yüklenirken önceki karar zaten uygulanmış olur (head'deki gtag bloğu).
  // Burada yalnızca kabul edilmişse Firebase'i tetiklemek gerekir.
  var saved = read();
  if (saved === 'accepted') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', grantAnalytics, { once: true });
    } else {
      grantAnalytics();
    }
    return; // banner gösterilmez
  }
  if (saved === 'declined') return; // banner gösterilmez

  function build() {
    var el = document.createElement('aside');
    el.className = 'fn-cookie';
    el.id = 'fnCookie';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', t.aria);
    el.innerHTML =
      '<p class="fn-cookie__title">' +
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 2.6a9.4 9.4 0 1 0 9.4 9.4 3.3 3.3 0 0 1-4.6-3 3.6 3.6 0 0 1-3.6-3.6 3.2 3.2 0 0 1-1.2-2.8z"/>' +
        '<circle cx="9.2" cy="10" r="1"/><circle cx="13" cy="15" r="1"/><circle cx="8" cy="15.4" r="1"/>' +
        '</svg>' + t.title + '</p>' +
      '<p class="fn-cookie__text">' + t.body +
        '<a href="' + POLICY_URL + '">' + t.link + '</a>.</p>' +
      '<div class="fn-cookie__actions">' +
        '<button type="button" class="fn-cookie__btn fn-cookie__btn--decline" data-fn-cookie="declined">' + t.decline + '</button>' +
        '<button type="button" class="fn-cookie__btn fn-cookie__btn--accept" data-fn-cookie="accepted">' + t.accept + '</button>' +
      '</div>';
    return el;
  }

  function init() {
    if (document.getElementById('fnCookie')) return;
    var el = build();
    document.body.appendChild(el);
    document.body.classList.add('fn-cookie-open');

    // Yüzen butonların boşluğu banner'ın gerçek yüksekliğine göre ayarlanır
    function syncHeight() {
      var h = Math.round(el.getBoundingClientRect().height);
      if (h) document.documentElement.style.setProperty('--fn-cookie-h', h + 'px');
    }
    syncHeight();
    window.addEventListener('resize', syncHeight, { passive: true });
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(syncHeight).observe(el);
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('is-in'); });
    });

    function close(choice) {
      write(choice);
      if (choice === 'accepted') grantAnalytics(); else denyAnalytics();
      el.classList.remove('is-in');
      document.body.classList.remove('fn-cookie-open');
      window.removeEventListener('resize', syncHeight);
      document.documentElement.style.removeProperty('--fn-cookie-h');
      var done = false;
      function remove() {
        if (done) return;
        done = true;
        if (el.parentNode) el.parentNode.removeChild(el);
      }
      el.addEventListener('transitionend', remove, { once: true });
      setTimeout(remove, 700); // transition tetiklenmezse yedek
    }

    el.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-fn-cookie]');
      if (btn) close(btn.getAttribute('data-fn-cookie'));
    });
  }

  // Hero animasyonları oynasın, ardından bar sessizce girsin
  function start() { setTimeout(init, 2200); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
