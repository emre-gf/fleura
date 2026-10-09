/* Fleura Nails — dönüşüm olayları (GA4)
 * whatsapp_click · phone_click · booking_start · booking_request · social_click
 *
 * Gizlilik: gtag tanımlı değilse hiçbir şey yapmaz. Consent Mode v2 (head'deki
 * gtag bloğu) analitik depolamayı rıza alınana kadar reddeder; olaylar Google'ın
 * consent moduna tabidir ve kişisel veri (ad, telefon, mesaj) içermez.
 * Tüm sayfalara defer ile yüklenir; DOM'a bağımlılığı sadece delegasyondur.
 */
(function () {
  'use strict';

  function send(name, params) {
    if (typeof window.gtag !== 'function') return;
    try { window.gtag('event', name, params || {}); } catch (e) { /* sessiz */ }
  }

  /* Google Ads dönüşümleri — etiket kimlikleri Ads hesabından alındı */
  var AW = {
    whatsapp: 'AW-10868274290/FzsFCMvl8PccEPLosr4o',
    phone:    'AW-10868274290/_VwpCNHl8PccEPLosr4o',
    booking:  'AW-10868274290/XHvaCM7l8PccEPLosr4o'
  };
  function conv(key, callback) {
    if (typeof window.gtag !== 'function' || !AW[key]) {
      if (callback) callback();
      return;
    }
    try {
      window.gtag('event', 'conversion', {
        send_to: AW[key],
        // İletişim tıklaması gelir değildir; tahmini satış değeri göndermeyin.
        value: 0,
        currency: 'TRY',
        event_callback: callback,
        event_timeout: 800
      });
    } catch (e) { if (callback) callback(); }
  }


  /* ---------------------------------------------------------------
   * Trafik kaynağı ilişkilendirme (ilk dokunuş, oturum boyunca sabit)
   * LLM/arama/sosyal kaynakları sınıflandırır; kişisel veri saklamaz.
   * Yalnızca yönlendiren alan adı + UTM etiketleri kullanılır.
   * ------------------------------------------------------------- */
  var SRC_MAP = [
    [/(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$|(^|\.)openai\.com$/, 'chatgpt'],
    [/(^|\.)perplexity\.ai$/,                'perplexity'],
    [/(^|\.)claude\.ai$/,                    'claude'],
    [/(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/, 'gemini'],
    [/(^|\.)copilot\.microsoft\.com$/,       'copilot'],
    [/(^|\.)you\.com$|(^|\.)phind\.com$/,    'ai_other'],
    [/(^|\.)google\./,                       'google'],
    [/(^|\.)bing\.com$/,                     'bing'],
    [/(^|\.)yandex\./,                       'yandex'],
    [/(^|\.)duckduckgo\.com$/,               'duckduckgo'],
    [/(^|\.)instagram\.com$/,                'instagram'],
    [/(^|\.)facebook\.com$|(^|\.)fb\.com$/,  'facebook'],
    [/(^|\.)tiktok\.com$/,                   'tiktok'],
    [/(^|\.)youtube\.com$/,                  'youtube']
  ];
  var AI_SOURCES = { chatgpt: 1, perplexity: 1, claude: 1, gemini: 1, copilot: 1, ai_other: 1 };

  function classify(host) {
    if (!host) return '';
    host = host.toLowerCase();
    for (var i = 0; i < SRC_MAP.length; i++) {
      if (SRC_MAP[i][0].test(host)) return SRC_MAP[i][1];
    }
    return host.replace(/^www\./, '');
  }

  function store(key, val) { try { sessionStorage.setItem(key, val); } catch (e) {} }
  function read(key) { try { return sessionStorage.getItem(key) || ''; } catch (e) { return ''; } }

  function detectSource() {
    var existing = read('fn_src');
    if (existing) return existing;

    var q = new URLSearchParams(location.search);
    var utm = (q.get('utm_source') || '').toLowerCase();
    var src = '';

    if (q.get('gclid') || q.get('gbraid') || q.get('wbraid')) src = 'google_ads';
    else if (utm) src = classify(utm) || utm;               /* chatgpt.com utm_source ekliyor */
    else if (document.referrer) {
      var rh = '';
      try { rh = new URL(document.referrer).hostname; } catch (e) {}
      if (rh && rh !== location.hostname) src = classify(rh);
    }
    if (!src) src = 'direct';

    store('fn_src', src);
    store('fn_src_landing', location.pathname);
    store('fn_src_medium', q.get('utm_medium') || '');
    store('fn_src_campaign', q.get('utm_campaign') || '');
    return src;
  }

  var SOURCE = detectSource();
  var LANDING = read('fn_src_landing') || location.pathname;

  /* Oturumda bir kez: kaynağı GA4'e bildir + tüm olaylara iliştir */
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('set', {
        traffic_source: SOURCE,
        is_ai_source: AI_SOURCES[SOURCE] ? 'yes' : 'no',
        landing_page: LANDING
      });
    } catch (e) {}
  }
  if (!read('fn_src_sent')) {
    store('fn_src_sent', '1');
    send('traffic_source', {
      source: SOURCE,
      is_ai_source: AI_SOURCES[SOURCE] ? 'yes' : 'no',
      landing_page: LANDING,
      medium: read('fn_src_medium'),
      campaign: read('fn_src_campaign')
    });
  }

  /* WhatsApp mesajına kaynak notu ekle — Emre gelen mesajda nereden
     geldiğini doğrudan görsün diye. Kişisel veri içermez. */
  var SRC_LABEL = {
    chatgpt: 'ChatGPT', perplexity: 'Perplexity', claude: 'Claude',
    gemini: 'Gemini', copilot: 'Copilot', ai_other: 'AI asistan',
    google: 'Google', google_ads: 'Google Reklam', bing: 'Bing',
    yandex: 'Yandex', duckduckgo: 'DuckDuckGo', instagram: 'Instagram',
    facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube',
    direct: 'Doğrudan'
  };
  function tagWhatsApp(a) {
    if (a.dataset && a.dataset.fnSrcTagged) return;
    var href = a.getAttribute('href') || '';
    if (!/wa\.me|api\.whatsapp\.com/i.test(href)) return;
    var label = SRC_LABEL[SOURCE] || SOURCE;
    var note = '\n\n— ' + label + ' · ' + LANDING;
    try {
      var u = new URL(href, location.origin);
      var t = u.searchParams.get('text') || '';
      if (t.indexOf('\n\n— ') === -1) u.searchParams.set('text', t + note);
      a.setAttribute('href', u.toString().replace(/\+/g, '%20'));
      if (a.dataset) a.dataset.fnSrcTagged = '1';
    } catch (e) {}
  }

  function ctaLocation(el) {
    var box = el.closest('section[id], header, footer, nav, article, aside, .cta-section, .post-cta');
    if (!box) return 'page';
    return box.id || box.getAttribute('aria-label') || (box.className && String(box.className).split(' ')[0]) || box.tagName.toLowerCase();
  }

  function base(el) {
    return {
      page_path: location.pathname,
      page_language: document.documentElement.getAttribute('lang') || '',
      cta_location: ctaLocation(el),
      link_text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      traffic_source: SOURCE,
      is_ai_source: AI_SOURCES[SOURCE] ? 'yes' : 'no'
    };
  }

  // Yalnızca aynı sekmede çıkışta etikete kısa bir gönderim aralığı tanı.
  // Etiket engellense bile yedek zamanlayıcı bağlantıyı açar.
  function trackContact(key, a, ev) {
    if (ev.defaultPrevented || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey ||
        ev.button > 0 || (a.target && a.target !== '_self') || a.hasAttribute('download')) {
      conv(key);
      return;
    }
    ev.preventDefault();
    var href = a.href;
    var navigated = false;
    function go() {
      if (navigated) return;
      navigated = true;
      window.location.assign(href);
    }
    setTimeout(go, 900);
    conv(key, go);
  }

  // Form doğrulamasından SONRA çağrılır. WhatsApp'a hazırlanan talebi ölçer;
  // mesajın gönderildiğini veya randevunun kesinleştiğini iddia etmez.
  window.fnTrackBookingRequest = function (method, service) {
    var params = { method: method, page_path: location.pathname };
    var allowed = ['kalici-oje', 'manikur-pedikur', 'protez-tirnak', 'tirnak-bakimi', 'nail-art', 'diger'];
    if (allowed.indexOf(service) !== -1) params.service = service;
    send('booking_request', params);
    conv('booking');
  };

  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var p;

    if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(href)) {
      tagWhatsApp(a);
      if (a.hasAttribute('data-fn-booking-request')) return;
      href = a.getAttribute('href') || href;
      p = base(a); p.link_url = href.split('?')[0]; p.has_context = href.indexOf('text=') > -1;
      send('whatsapp_click', p);
      send('generate_lead', { method: 'whatsapp', cta_location: p.cta_location, page_path: p.page_path });
      trackContact('whatsapp', a, ev);
    } else if (/^tel:/i.test(href)) {
      p = base(a); p.link_url = href;
      send('phone_click', p);
      trackContact('phone', a, ev);
    } else if (href === '#randevu-al' || a.classList.contains('fc-book') || a.classList.contains('nav-cta') || a.classList.contains('mm-cta')) {
      send('booking_start', base(a));
    } else if (/instagram\.com/i.test(href)) {
      p = base(a); p.network = 'instagram';
      send('social_click', p);
    }
  }, true);

  /* Ana sayfa takvimli randevu bileşeni */
  var started = false;
  var calendar = document.getElementById('calendarDays');
  if (calendar) {
    calendar.addEventListener('click', function (ev) {
      if (started || !ev.target.closest('.calendar-day, button, [data-date]')) return;
      started = true;
      send('booking_start', { cta_location: 'appointment_calendar', page_path: location.pathname });
    }, true);
  }
  // Form/takvim ham click veya submit olayında sayılmaz: doğrulanmış
  // WhatsApp talebini script.js içindeki işlem kaydeder.
})();
