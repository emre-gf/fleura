#!/usr/bin/env node
/**
 * Fleura Nails — teknik SEO / AEO denetimi
 * Kontroller: html lang, title & description uzunluğu, canonical doğruluğu, tek H1, JSON-LD geçerliliği,
 * sahte rating alanları, hreflang karşılıklılığı ve x-default, kırık iç bağlantılar, alt/width/height eksik görseller,
 * sitemap kapsamı. Hatalarda çıkış kodu 1 döner (CI/pre-deploy için).
 * Kullanım: node tools/seo-check.js [--quiet]
 */
const fs = require('fs');
const path = require('path');
const { ROOT, SITE, listHtml, readPage, urlToFile, fileToUrl } = require('./lib');

const errors = [], warns = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warns.push(`${f}: ${m}`);

const files = listHtml().filter(f => path.basename(f) !== '404.html');
const pages = new Map(files.map(f => [f, readPage(f)]));
const canonicalSet = new Set();

for (const [file, p] of pages) {
  if (!p.lang) err(file, '<html lang> eksik');
  if (!p.title) err(file, '<title> eksik');
  else if (p.title.length > 75) warn(file, `title uzun (${p.title.length})`);
  else if (p.title.length < 20) warn(file, `title kısa (${p.title.length})`);
  if (!p.description) err(file, 'meta description eksik');
  else if (p.description.length > 175) warn(file, `description uzun (${p.description.length})`);
  else if (p.description.length < 60) warn(file, `description kısa (${p.description.length})`);
  if (!p.canonical) err(file, 'canonical eksik');
  else {
    const expected = fileToUrl(file);
    if (p.canonical !== expected) {
      // canonical başka bir sayfaya işaret ediyor olabilir (kasıtlı duplicate); dosya var mı?
      if (!urlToFile(p.canonical)) err(file, `canonical hedefi yok: ${p.canonical}`);
      else warn(file, `canonical beklenenden farklı: ${p.canonical} (beklenen ${expected})`);
    }
    if (canonicalSet.has(p.canonical)) err(file, `canonical başka sayfada da kullanılıyor: ${p.canonical}`);
    canonicalSet.add(p.canonical);
  }
  if (p.h1.length === 0) err(file, 'H1 yok');
  else if (p.h1.length > 1) err(file, `birden fazla H1 (${p.h1.length})`);
  if (!p.ogTitle) warn(file, 'og:title eksik');
  if (!p.ogImage) warn(file, 'og:image eksik');

  // JSON-LD
  p.jsonld.forEach((block, i) => {
    try {
      const data = JSON.parse(block);
      const s = JSON.stringify(data);
      if (/"aggregateRating"|"ratingValue"|"reviewCount"/.test(s)) err(file, `JSON-LD #${i + 1} rating alanı içeriyor (sahte puan riski)`);
      if (/"@type":"Review"/.test(s)) warn(file, `JSON-LD #${i + 1} Review içeriyor — gerçek yorumla eşleştiğini doğrulayın`);
    } catch (e) { err(file, `JSON-LD #${i + 1} geçersiz: ${e.message}`); }
  });

  // hreflang
  if (p.alternates.length) {
    const xd = p.alternates.find(a => a.hreflang === 'x-default');
    if (!xd) warn(file, 'hreflang var ama x-default yok');
    const self = p.alternates.find(a => a.href === p.canonical && a.hreflang !== 'x-default');
    if (!self) err(file, 'hreflang kümesi sayfanın kendisini içermiyor');
    for (const a of p.alternates) {
      if (!a.href || !a.hreflang) { err(file, 'hreflang/href boş alternate'); continue; }
      const tf = urlToFile(a.href);
      if (!tf) { err(file, `hreflang hedefi yok: ${a.href}`); continue; }
      if (tf === file) continue;
      const tp = pages.get(tf) || readPage(tf);
      if (!tp.alternates.some(b => b.href === p.canonical)) err(file, `hreflang karşılıksız: ${a.href} bu sayfaya geri dönmüyor`);
    }
  }

  // iç bağlantılar
  const base = path.dirname(file);
  for (const m of p.html.matchAll(/\shref\s*=\s*"([^"#?]+)[^"]*"/g)) {
    const h = m[1];
    if (/^(https?:|mailto:|tel:|javascript:|data:|\/\/)/i.test(h)) {
      if (h.startsWith(SITE + '/') || h === SITE) { if (!urlToFile(h) && !fs.existsSync(path.join(ROOT, new URL(h).pathname))) err(file, `kırık mutlak iç bağlantı: ${h}`); }
      continue;
    }
    let target = h.startsWith('/') ? h : path.posix.normalize(path.posix.join(base === '.' ? '' : base, h));
    target = '/' + target.replace(/^\/+/, '');
    if (urlToFile(SITE + target)) continue;
    if (fs.existsSync(path.join(ROOT, decodeURIComponent(target)))) continue;
    err(file, `kırık bağlantı: ${h}`);
  }
  // kaynaklar (src)
  for (const m of p.html.matchAll(/\ssrc\s*=\s*"([^"]+)"/g)) {
    const h = m[1];
    if (/^(https?:|data:|\/\/)/i.test(h)) continue;
    const target = h.startsWith('/') ? h.slice(1) : path.posix.normalize(path.posix.join(base === '.' ? '' : base, h));
    if (!fs.existsSync(path.join(ROOT, target))) err(file, `kaynak bulunamadı: ${h}`);
  }
  // görseller
  let noAlt = 0, noDim = 0;
  for (const tag of p.html.match(/<img\b[^>]*>/gi) || []) {
    if (!/\salt\s*=/.test(tag)) noAlt++;
    if (!/\swidth\s*=/.test(tag) || !/\sheight\s*=/.test(tag)) noDim++;
  }
  if (noAlt) err(file, `${noAlt} görselde alt yok`);
  if (noDim) warn(file, `${noDim} görselde width/height yok (CLS riski)`);
}

// sitemap kapsamı
const sm = fs.existsSync(path.join(ROOT, 'sitemap.xml')) ? fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8') : '';
const smUrls = new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(/&amp;/g, '&')));
for (const [file, p] of pages) {
  if (p.noindex || !p.canonical) continue;
  const canonFile = urlToFile(p.canonical);
  if (canonFile && canonFile !== file) continue;
  if (!smUrls.has(p.canonical)) err('sitemap.xml', `eksik URL: ${p.canonical} (${file})`);
}
for (const u of smUrls) if (!urlToFile(u)) err('sitemap.xml', `dosyası olmayan URL: ${u}`);
// robots
const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
if (!/User-agent:\s*OAI-SearchBot\s*\n\s*Allow:\s*\//i.test(robots)) err('robots.txt', 'OAI-SearchBot için Allow: / yok');
if (/User-agent:\s*(Googlebot|Bingbot)\s*\n\s*Disallow:\s*\/\s*$/im.test(robots)) err('robots.txt', 'Googlebot/Bingbot engelli');
if (!/Sitemap:\s*https?:\/\//.test(robots)) err('robots.txt', 'Sitemap satırı yok');

const quiet = process.argv.includes('--quiet');
if (!quiet) { for (const w of warns) console.log('⚠', w); }
for (const e of errors) console.log('✖', e);
console.log(`\n${files.length} sayfa denetlendi — ${errors.length} hata, ${warns.length} uyarı`);
process.exit(errors.length ? 1 : 0);
