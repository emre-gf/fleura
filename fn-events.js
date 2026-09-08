/* Fleura Nails — dönüşüm olayları (GA4)
 * whatsapp_click · phone_click · booking_start · booking_complete · social_click
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
      link_text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80)
    };
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var p;

    if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(href)) {
      p = base(a); p.link_url = href.split('?')[0]; p.has_context = href.indexOf('text=') > -1;
      send('whatsapp_click', p);
      send('generate_lead', { method: 'whatsapp', cta_location: p.cta_location, page_path: p.page_path });
    } else if (/^tel:/i.test(href)) {
      p = base(a); p.link_url = href;
      send('phone_click', p);
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
  var confirmBtn = document.getElementById('confirmAppointmentBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      send('booking_complete', { method: 'whatsapp', cta_location: 'appointment_widget', page_path: location.pathname });
    }, true);
  }

  /* İletişim formu (mailto tabanlı) */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function () {
      var svc = form.querySelector('select[name="service"]');
      send('booking_complete', { method: 'email_form', service: svc ? svc.value : '', page_path: location.pathname });
    }, true);
  }
})();
