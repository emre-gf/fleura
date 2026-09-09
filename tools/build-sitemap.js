#!/usr/bin/env node
/**
 * Fleura Nails — sitemap.xml üretici
 * Kaynak: dosya sistemindeki HTML sayfaları. Her sayfanın <link rel="canonical"> etiketi
 * URL kaynağı olarak kullanılır; hreflang alternatifleri sayfadaki <link rel="alternate"> etiketlerinden,
 * lastmod ise git geçmişinden (değişiklik varsa bugünün tarihi) türetilir.
 * Kullanım: node tools/build-sitemap.js [--dry]
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ROOT, listHtml, readPage, urlToFile } = require('./lib');

const SITE = process.env.SITE_URL || 'https://www.fleura.com.tr';
const today = new Date().toISOString().slice(0, 10);

function gitDate(file) {
  try {
    const dirty = execSync(`git status --porcelain -- "${file}"`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (dirty) return today;
    const d = execSync(`git log -1 --format=%cs -- "${file}"`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    return d || today;
  } catch (e) { return today; }
}

function rules(url) {
  const p = new URL(url).pathname;
  if (p === '/') return { priority: '1.0', changefreq: 'weekly' };
  if (p === '/izmir-evde-tirnak-hizmeti' || p === '/hakkimizda') return { priority: '0.9', changefreq: 'monthly' };
  if (/^\/izmir-/.test(p)) return { priority: '0.9', changefreq: 'monthly' };
  if (p === '/hizmetler') return { priority: '0.8', changefreq: 'monthly' };
  if (p === '/blog') return { priority: '0.7', changefreq: 'weekly' };
  if (/^\/blog\//.test(p)) return { priority: '0.6', changefreq: 'monthly' };
  if (/^\/(en|ru)(\/|$)/.test(p)) return { priority: p.split('/').length > 2 ? '0.7' : '0.8', changefreq: 'monthly' };
  if (p === '/kvkk-aydinlatma-metni') return { priority: '0.3', changefreq: 'yearly' };
  if (p === '/iletisim') return { priority: '0.6', changefreq: 'monthly' };
  return { priority: '0.8', changefreq: 'monthly' }; // ilçe sayfaları
}

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

const entries = [];
for (const file of listHtml()) {
  if (path.basename(file) === '404.html') continue;
  const page = readPage(file);
  if (page.noindex) continue;
  if (!page.canonical) { console.warn('⚠ canonical yok, atlandı:', file); continue; }
  if (!page.canonical.startsWith(SITE)) { console.warn('⚠ canonical farklı host, atlandı:', file, page.canonical); continue; }
  // canonical başka sayfaya işaret ediyorsa (duplicate) sitemap'e girmez
  const canonFile = urlToFile(page.canonical);
  if (canonFile && path.resolve(ROOT, canonFile) !== path.resolve(ROOT, file)) continue;
  const alts = page.alternates.filter((a, i, arr) => arr.findIndex(b => b.hreflang === a.hreflang) === i);
  const needAlts = alts.some(a => a.hreflang !== 'x-default' && a.href !== page.canonical);
  entries.push({
    loc: page.canonical,
    lastmod: gitDate(file),
    ...rules(page.canonical),
    alts: needAlts ? alts : [],
    image: page.ogImage && page.ogImage.includes('/assets/gallery/') ? page.ogImage : null
  });
}

const order = (e) => (e.loc === SITE + '/' ? 0 : 1);
entries.sort((a, b) => order(a) - order(b) || parseFloat(b.priority) - parseFloat(a.priority) || a.loc.localeCompare(b.loc));

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
for (const e of entries) {
  xml += '  <url>\n';
  xml += `    <loc>${esc(e.loc)}</loc>\n`;
  xml += `    <lastmod>${e.lastmod}</lastmod>\n`;
  xml += `    <changefreq>${e.changefreq}</changefreq>\n`;
  xml += `    <priority>${e.priority}</priority>\n`;
  for (const a of e.alts) xml += `    <xhtml:link rel="alternate" hreflang="${esc(a.hreflang)}" href="${esc(a.href)}"/>\n`;
  if (e.image) xml += `    <image:image>\n      <image:loc>${esc(e.image)}</image:loc>\n    </image:image>\n`;
  xml += '  </url>\n';
}
xml += '</urlset>\n';

if (process.argv.includes('--dry')) { process.stdout.write(xml); }
else { fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml); }
console.log(`✔ sitemap.xml: ${entries.length} URL (${entries.filter(e => e.alts.length).length} hreflang kümesi, ${entries.filter(e => e.image).length} görsel)`);
