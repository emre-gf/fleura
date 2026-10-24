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
  /* Dönüşüm değeri = hizmetin sitedeki fiyatı (izmir-protez-tirnak-fiyatlari ile aynı tut;
   * tools/oci-csv.js de bu tabloyu kullanır). Sabit 250 ₺ protezi manikürle eşit gösteriyordu.
   * Ads'te dönüşüm işlemi "her dönüşüm için farklı değer" olmalı, yoksa bu değer yok sayılır. */
  var FIYAT = {
    'protez-tirnak': 1500,   /* manikür + protez + kalıcı oje paketi */
    'gelin-tirnagi': 1500,   /* sayfada ayrı fiyat yok: protez paketi varsayıldı */
    'kalici-oje': 1150,      /* manikür + kalıcı oje */
    'nail-art': 1150,        /* tasarım kalıcı oje üstüne eklenir: taban fiyat */
    'manikur-pedikur': 650,  /* manikür 650, pedikür 850: düşük olan */
    'rus-manikuru': 650,     /* sayfada ayrı fiyat yok: manikür varsayıldı */
    'tirnak-bakimi': 650,
    'diger': 650
  };
  var VARSAYILAN_DEGER = 650;  /* hizmet bilinmiyorsa en düşük hizmet fiyatı */
  var YOL_HIZMET = [
    [/protez-tirnak(?!-fiyat)|gel-nail-extensions|narashchivanie/, 'protez-tirnak'],
    [/gelin-tirnagi|bridal-nails|svadebnyy/, 'gelin-tirnagi'],
    [/kalici-oje|gel-polish|gel-lak/, 'kalici-oje'],
    [/nail-art|dizayn-nogtey/, 'nail-art'],
    [/rus-manikuru/, 'rus-manikuru'],
    [/manikur-pedikur|manicure-pedicure|manikyur-pedikyur/, 'manikur-pedikur']
  ];

  function conv(key, callback, service) {
    if (typeof window.gtag !== 'function' || !AW[key]) {
      if (callback) callback();
      return;
    }
    try {
      window.gtag('event', 'conversion', {
        send_to: AW[key],
        value: FIYAT[service || hizmet()] || VARSAYILAN_DEGER,
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

  /* Hizmet: reklam grubunun "Nihai URL son eki"ndeki ?hizmet= (anasayfaya inen reklamlar
     için tek bilgi kaynağı) oturum boyunca korunur; yoksa sayfa yolundan çıkarılır.
     Blog yazıları bilgi amaçlı okunduğu için hizmete bağlanmaz. */
  (function () {
    var h = new URLSearchParams(location.search).get('hizmet');
    if (h && FIYAT[h]) store('fn_hizmet', h);
  })();
  function hizmet() {
    var h = read('fn_hizmet');
    if (FIYAT[h]) return h;
    var p = location.pathname;
    if (/^\/blog\//.test(p)) return '';
    for (var i = 0; i < YOL_HIZMET.length; i++) {
      if (YOL_HIZMET[i][0].test(p)) return YOL_HIZMET[i][1];
    }
    return '';
  }

  /* Google Ads tıklama kimliği (çevrimdışı dönüşüm içe aktarma için).
     Önce sayfa URL'si, sonra Google'ın kendi _gcl_aw/_gcl_gb çerezleri — bunlar yalnızca
     reklam çerezlerine rıza verildiyse vardır. Kimliği kendi depolamamıza yazmıyoruz. */
  function gclCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    if (!m) return '';
    var p = decodeURIComponent(m[1]).split('.');   /* GCL.<zaman>.<kimlik> */
    return p.length > 2 ? p.slice(2).join('.') : '';
  }
  function clickId() {
    var q = new URLSearchParams(location.search);
    var id = q.get('gclid') || gclCookie('_gcl_aw');
    if (id) return /^[\w-]+$/.test(id) ? id : '';
    id = q.get('gbraid') || gclCookie('_gcl_gb');
    if (id) return /^[\w-]+$/.test(id) ? 'gb-' + id : '';
    id = q.get('wbraid');
    return id && /^[\w-]+$/.test(id) ? 'wb-' + id : '';
  }

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

  /* WhatsApp mesajına SESSİZ kaynak kodu ekle.
     Eski hali "— Doğrudan · /izmir-protez-tirnak-fiyatlari" yazıyordu; müşteriye
     teknik ve rahatsız edici görünüyordu. Artık yalnızca kısa bir kod:

         #rez.233        NOKTA  -> ChatGPT / AI asistanı (GEO çalışmasının getirisi)
         #rez-Cj0KCQ...  TİRE   -> Google Ads, tıklama kimliğiyle (gclid; gb-/wb- önekli
                                   olanlar iOS kimliği). Randevuya dönerse kodun tamamı
                                   google-ads/oci/randevular.csv'ye yazılır (dosya 08).
         #rez-342        TİRE   -> Google Ads, ama tıklama kimliği alınamadı
         (kod yok)              -> siteden, organik aramadan, sosyal medyadan gelen

     Ayraç bilerek seçildi: nokta ile tire tek bakışta ayrılır, müşteriye hiçbir
     şey ifade etmez. Sayı 101-999 arası rastgele; anlam taşımaz, yalnızca iki
     mesajı ayırmaya yarar. Ad, telefon gibi kişisel veri içermez. */
  function rezKodu() {
    var id = clickId();
    if (id) return '#rez-' + id;
    var ayrac = '';
    if (AI_SOURCES[SOURCE]) ayrac = '.';            /* ChatGPT ve diğer AI asistanları */
    else if (SOURCE === 'google_ads') ayrac = '-';  /* Google Ads */
    if (!ayrac) return '';                          /* diğer her şey: kod yazma */
    return '#rez' + ayrac + (101 + Math.floor(Math.random() * 899));
  }
  function tagWhatsApp(a) {
    if (a.dataset && a.dataset.fnSrcTagged) return;
    var href = a.getAttribute('href') || '';
    if (!/wa\.me|api\.whatsapp\.com/i.test(href)) return;
    var kod = rezKodu();
    if (!kod) { if (a.dataset) a.dataset.fnSrcTagged = '1'; return; }
    try {
      var u = new URL(href, location.origin);
      var t = u.searchParams.get('text') || '';
      if (t.indexOf('#rez') === -1) u.searchParams.set('text', t + '\n\n' + kod);
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
      service: hizmet() || 'bilinmiyor',
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
    conv('booking', null, params.service);
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
