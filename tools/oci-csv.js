#!/usr/bin/env node
/**
 * Fleura Nails — Google Ads çevrimdışı dönüşüm (OCI) yükleme dosyası
 *   node tools/oci-csv.js                    → google-ads/oci/randevular.csv'deki tüm randevuları yazar
 *   node tools/oci-csv.js --since 2026-10-20 → yalnızca bu tarihten (dahil) sonraki randevular
 *   node tools/oci-csv.js --ad "Randevu Gerceklesen" → Ads'teki dönüşüm işleminin adı farklıysa
 *
 * Girdi: her WhatsApp görüşmesi bir satır (randevuya dönmese de — dönüşüm oranını bu ölçer).
 *   tarih,saat,kod,hizmet,tutar,durum,not
 *   2026-10-25,14:30,#rez-Cj0KCQjw...,protez-tirnak,1500,randevu,
 * Ad, telefon, adres YAZILMAZ. Ayraç virgül veya noktalı virgül olabilir (Excel TR).
 * Çıktı: google-ads/oci/yukleme-<bugün>.csv → Ads > Hedefler > Dönüşümler > Yüklemeler.
 * Fiyatlar fn-events.js'deki FIYAT tablosundan okunur; tek kaynak orası.
 */
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./lib');

const DIR = path.join(ROOT, 'google-ads', 'oci');
const INPUT = path.join(DIR, 'randevular.csv');
const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null; };
const CONVERSION_NAME = arg('--ad') || 'Randevu Gerceklesen';
const SINCE = arg('--since');
const MAX_AGE_DAYS = 90; // Google, tıklamadan 90 günden eski dönüşümleri almaz

const FIYAT = {};
const fnEvents = fs.readFileSync(path.join(ROOT, 'fn-events.js'), 'utf8');
const block = fnEvents.match(/var FIYAT = \{([\s\S]*?)\};/);
if (block) for (const m of block[1].matchAll(/'([a-z-]+)':\s*(\d+)/g)) FIYAT[m[1]] = Number(m[2]);

if (!fs.existsSync(INPUT)) {
  console.error(`✖ ${path.relative(ROOT, INPUT)} yok. Şablonu kopyalayın: cp google-ads/oci/randevular.ornek.csv google-ads/oci/randevular.csv`);
  process.exit(1);
}

function parseDate(s) {
  s = (s || '').trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}

// "#rez-Cj0K…" → { type: 'gclid', id }, "#rez-gb-…" → iOS kimliği, "#rez-342" → kimliksiz reklam
function parseCode(s) {
  const c = (s || '').trim();
  if (/^#rez\.\d+$/.test(c)) return { source: 'ai' };
  const m = c.match(/^#rez-(?:(gb|wb)-)?([\w-]+)$/);
  if (!m) return { source: 'diger' };
  if (/^\d{3}$/.test(m[2]) && !m[1]) return { source: 'ads' };
  return { source: 'ads', type: m[1] ? m[1] + 'raid' : 'gclid', id: m[2] };
}

const lines = fs.readFileSync(INPUT, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
const head = lines[0].split(sep).map(h => h.trim().toLowerCase());
const col = name => head.indexOf(name);
for (const need of ['tarih', 'saat', 'kod', 'hizmet', 'tutar', 'durum']) {
  if (col(need) === -1) { console.error(`✖ Başlık satırında "${need}" sütunu yok.`); process.exit(1); }
}

const today = new Date();
const stats = { toplam: 0, ads: 0, adsRandevu: 0, ai: 0, aiRandevu: 0, diger: 0, digerRandevu: 0 };
const rows = [], skipped = [], seen = new Set();
lines.slice(1).forEach((line, i) => {
  const f = line.split(sep).map(x => x.trim());
  const no = i + 2;
  const code = parseCode(f[col('kod')]);
  const isAppt = /^randevu$/i.test(f[col('durum')] || '');
  stats.toplam++;
  stats[code.source]++;
  if (isAppt) stats[code.source + 'Randevu']++;
  if (!isAppt || code.source !== 'ads') return;

  const date = parseDate(f[col('tarih')]);
  const time = (f[col('saat')] || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!date || !time) return skipped.push(`${no}. satır: tarih/saat okunamadı`);
  if (SINCE && date < SINCE) return;
  const age = (today - new Date(`${date}T00:00:00+03:00`)) / 864e5;
  if (age > MAX_AGE_DAYS) return skipped.push(`${no}. satır: ${MAX_AGE_DAYS} günden eski`);
  if (!code.id) return skipped.push(`${no}. satır: kodda tıklama kimliği yok (#rez-sayı)`);
  if (code.type !== 'gclid') return skipped.push(`${no}. satır: iOS kimliği (${code.type}) — dosya şablonu yalnızca gclid alır`);

  const service = (f[col('hizmet')] || '').toLowerCase();
  const amount = Number(String(f[col('tutar')] || '').replace(/[^\d]/g, '')) || FIYAT[service];
  if (!amount) return skipped.push(`${no}. satır: tutar yok ve hizmet "${service}" fiyat tablosunda değil`);
  if (seen.has(code.id + date)) skipped.push(`${no}. satır: aynı kimlik aynı gün ikinci kez (yine de yazıldı)`);
  seen.add(code.id + date);
  rows.push([code.id, CONVERSION_NAME, `${date} ${time[1].padStart(2, '0')}:${time[2]}:00`, amount, 'TRY']);
});

const pct = (a, b) => (b ? ` (%${Math.round((a / b) * 100)})` : '');
console.log(`Görüşme: ${stats.toplam} — Google Ads ${stats.ads}, AI ${stats.ai}, diğer ${stats.diger}`);
console.log(`Randevuya dönen: Google Ads ${stats.adsRandevu}/${stats.ads}${pct(stats.adsRandevu, stats.ads)}, ` +
  `AI ${stats.aiRandevu}/${stats.ai}${pct(stats.aiRandevu, stats.ai)}, diğer ${stats.digerRandevu}/${stats.diger}${pct(stats.digerRandevu, stats.diger)}`);
skipped.forEach(s => console.log(`  ⚠ ${s}`));

if (!rows.length) { console.log('Yüklenecek satır yok.'); process.exit(0); }
const stamp = today.toISOString().slice(0, 10);
const out = path.join(DIR, `yukleme-${stamp}.csv`);
const csv = ['Parameters:TimeZone=Europe/Istanbul',
  'Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency',
  ...rows.map(r => r.join(','))].join('\n') + '\n';
fs.writeFileSync(out, csv);
const total = rows.reduce((s, r) => s + r[3], 0);
console.log(`✔ ${path.relative(ROOT, out)} — ${rows.length} randevu, ${total.toLocaleString('tr-TR')} ₺ ("${CONVERSION_NAME}")`);
