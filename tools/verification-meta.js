#!/usr/bin/env node
/**
 * Fleura Nails — arama motoru doğrulama meta etiketleri
 *
 * Google (google-site-verification) ve Bing (msvalidate.01) doğrulama etiketlerini
 * .env dosyasındaki değerlerden okuyup TÜM indekslenebilir HTML sayfalarının <head>
 * bölümüne yazar. Değer değişirse mevcut etiket güncellenir, çoğaltılmaz.
 *
 * Neden her sayfaya? Doğrulama teknik olarak yalnızca ana sayfada gerekir, ancak her
 * sayfada bulunması alan adı sahipliğinin, ana sayfa geçici olarak erişilemez olduğunda
 * bile doğrulanabilmesini sağlar; maliyeti bir satırdır.
 *
 * Kullanım:
 *   node tools/verification-meta.js          # .env'deki değerleri uygula
 *   node tools/verification-meta.js --check  # yalnızca durum raporu, dosya yazma
 */
const fs = require('fs');
const path = require('path');
const { ROOT, listHtml } = require('./lib');

function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const GOOGLE = process.env.GOOGLE_SITE_VERIFICATION || 'pCyczzQFiQl4oXr1X1qkzBT-nM8sS0an9gPdZPX7sS0';
const BING = process.env.BING_SITE_VERIFICATION || '';
const checkOnly = process.argv.includes('--check');

const TAGS = [
  { name: 'google-site-verification', value: GOOGLE },
  { name: 'msvalidate.01', value: BING }
].filter(t => t.value);

if (!TAGS.length) {
  console.error('✖ Doğrulama değeri yok. .env içine BING_SITE_VERIFICATION (ve gerekiyorsa GOOGLE_SITE_VERIFICATION) yazın.');
  process.exit(1);
}

let added = 0, updated = 0, ok = 0, files = 0;

for (const file of listHtml()) {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, 'utf8');
  const before = html;

  for (const tag of TAGS) {
    const re = new RegExp(`<meta\\s+name=["']${tag.name.replace('.', '\\.')}["']\\s+content=["']([^"']*)["']\\s*/?>`, 'i');
    const m = html.match(re);
    if (m) {
      if (m[1] === tag.value) { ok++; continue; }
      html = html.replace(re, `<meta name="${tag.name}" content="${tag.value}" />`);
      updated++;
    } else {
      // <head> hemen sonrasına, charset varsa onun ardına ekle
      const charset = html.match(/<meta\s+charset=[^>]*>/i);
      const anchor = charset || html.match(/<head[^>]*>/i);
      if (!anchor) { console.warn('⚠ <head> yok, atlandı:', file); continue; }
      const idx = html.indexOf(anchor[0]) + anchor[0].length;
      const indentM = html.slice(idx).match(/^\n([ \t]*)/);
      const indent = indentM ? indentM[1] : '  ';
      html = html.slice(0, idx) + `\n${indent}<meta name="${tag.name}" content="${tag.value}" />` + html.slice(idx);
      added++;
    }
  }

  if (html !== before) { files++; if (!checkOnly) fs.writeFileSync(full, html); }
}

console.log(`${checkOnly ? '· (kontrol modu, yazma yok) ' : '✔ '}${TAGS.map(t => t.name).join(' + ')}: ${added} eklendi, ${updated} güncellendi, ${ok} zaten doğru — ${files} dosya${checkOnly ? ' değişecekti' : ' yazıldı'}`);
