/* Fleura Nails — tarayıcı diline göre dil yönlendirmesi.
 *
 * Tasarım kararları (SEO ve performans güvenliği):
 *  1) Yönlendirme YALNIZCA gerçek kullanıcıda çalışır. Botlar (Googlebot, Bingbot,
 *     YandexBot, AhrefsBot vb.) hiçbir zaman yönlendirilmez — Türkçe sayfaların
 *     taranması ve mevcut sıralaması etkilenmez.
 *  2) Sadece sayfaya İLK kez, dışarıdan (veya doğrudan) girişte çalışır. Kullanıcı
 *     dil seçiciyi kullandıysa veya site içinde geziniyorsa asla müdahale etmez.
 *  3) Karar bir kez verilir ve sessionStorage'a yazılır → redirect döngüsü imkânsız.
 *  4) location.replace() kullanılır → geri tuşu kapana kısılmaz.
 *  5) Senkron ve ~1KB; head'de çalıştığı için içerik boyanmadan karar verilir,
 *     böylece kullanıcı Türkçe içeriği görüp sonra sıçrama (flash) yaşamaz.
 *  6) Türkçe tarayıcı → hiçbir şey yapılmaz (mevcut Türkçe site zaten hedef).
 *     Rusça → /ru, diğer tüm diller → /en (talimat: "Türk değilse İngilizce").
 */
(function () {
  try {
    // --- 1) Botları tamamen dışarıda bırak ---
    var ua = navigator.userAgent || '';
    if (/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|vkShare|W3C_Validator|Chrome-Lighthouse|PageSpeed|GTmetrix|HeadlessChrome/i.test(ua)) return;

    // --- 2) Bu oturumda karar verildiyse tekrar karışma ---
    var KEY = 'fn-lang-redirected';
    if (sessionStorage.getItem(KEY)) return;

    // --- 3) Kullanıcı daha önce dil seçtiyse ona saygı duy (kalıcı) ---
    var chosen = null;
    try { chosen = localStorage.getItem('fn-lang-choice'); } catch (e) {}
    if (chosen) { sessionStorage.setItem(KEY, '1'); return; }

    // --- 4) Site içi gezinme ise müdahale etme ---
    // Aynı origin'den geldiyse kullanıcı zaten sitede; kararı o vermiş sayılır.
    if (document.referrer) {
      try {
        if (new URL(document.referrer).origin === location.origin) {
          sessionStorage.setItem(KEY, '1');
          return;
        }
      } catch (e) {}
    }

    // --- 5) Yalnızca Türkçe sayfalarda çalış ---
    // /en/ veya /ru/ altındaysa kullanıcı bilinçli olarak o dilde; dokunma.
    var path = location.pathname;
    if (/^\/(en|ru)(\/|$)/.test(path)) { sessionStorage.setItem(KEY, '1'); return; }

    // --- 6) Tarayıcı dilini oku ---
    var langs = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ''];
    var primary = String(langs[0] || '').toLowerCase();

    // Türkçe kullanıcı: zaten doğru yerde, hiçbir şey yapma.
    if (primary.indexOf('tr') === 0) { sessionStorage.setItem(KEY, '1'); return; }

    // Hedef dili belirle: Rusça → ru, diğer her şey → en
    var target = primary.indexOf('ru') === 0 ? 'ru' : 'en';

    // --- 7) Sayfa karşılığını bul (yoksa o dilin ana sayfası) ---
    // Not: Bu harita i18n-map.json ile aynı; yeni sayfa eklerken ikisini de güncelle.
    var MAP = {
      '/': { en: '/en', ru: '/ru' },
      '/izmir-protez-tirnak': { en: '/en/gel-nail-extensions-izmir', ru: '/ru/narashchivanie-nogtey-izmir' },
      '/izmir-kalici-oje': { en: '/en/gel-polish-izmir', ru: '/ru/gel-lak-izmir' },
      '/izmir-nail-art': { en: '/en/nail-art-izmir', ru: '/ru/dizayn-nogtey-izmir' },
      '/izmir-manikur-pedikur': { en: '/en/manicure-pedicure-izmir', ru: '/ru/manikyur-pedikyur-izmir' },
      '/izmir-protez-tirnak-fiyatlari': { en: '/en/nail-prices-izmir', ru: '/ru/tseny-izmir' },
      '/izmir-gelin-tirnagi': { en: '/en/bridal-nails-izmir', ru: '/ru/svadebnyy-manikyur-izmir' }
    };

    // /index.html ve sondaki / normalize edilir
    var key = path.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (key.length > 1) key = key.replace(/\/$/, '');
    if (key === '') key = '/';

    var entry = MAP[key];
    var dest = entry ? entry[target] : '/' + target;

    if (dest && dest !== path) {
      sessionStorage.setItem(KEY, '1');
      location.replace(dest + location.search + location.hash);
    } else {
      sessionStorage.setItem(KEY, '1');
    }
  } catch (e) {
    /* Herhangi bir hata durumunda sessizce Türkçe sayfada kal. */
  }
})();

/* Dil seçiciye basıldığında tercihi kalıcı olarak kaydet.
   Böylece otomatik algılama kullanıcının seçimini bir daha ezmez. */
(function () {
  function remember(ev) {
    var a = ev.target.closest('.seo-lang a, .nav-lang a, .mm-lang a');
    if (!a) return;
    var l = (a.getAttribute('hreflang') || '').slice(0, 2);
    if (!l) return;
    try {
      localStorage.setItem('fn-lang-choice', l);
      sessionStorage.setItem('fn-lang-redirected', '1');
    } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.addEventListener('click', remember, true);
    }, { once: true });
  } else {
    document.addEventListener('click', remember, true);
  }
})();
