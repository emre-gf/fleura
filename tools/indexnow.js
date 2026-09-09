#!/usr/bin/env node
/**
 * Fleura Nails — IndexNow (Bing, Yandex, Naver, Seznam, Yep)
 *   node tools/indexnow.js keyfile           → köke <KEY>.txt anahtar dosyasını yazar (yayına çıkmalı)
 *   node tools/indexnow.js submit [url ...]  → verilen URL'leri, yoksa sitemap.xml'deki tüm URL'leri bildirir
 * Anahtar .env dosyasından (INDEXNOW_KEY) veya ortam değişkeninden okunur; depoya yazılmaz.
 * Not: Google IndexNow'u desteklemez; Google için Search Console + sitemap yeterlidir.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { ROOT, SITE } = require('./lib');

function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();
const KEY = process.env.INDEXNOW_KEY;
if (!KEY || !/^[A-Za-z0-9-]{8,128}$/.test(KEY)) {
  console.error('✖ INDEXNOW_KEY tanımlı değil veya geçersiz. .env.example dosyasına bakın (openssl rand -hex 16 ile üretebilirsiniz).');
  process.exit(1);
}
const KEY_LOCATION = process.env.INDEXNOW_KEY_LOCATION || `${SITE}/${KEY}.txt`;
const cmd = process.argv[2];

if (cmd === 'keyfile') {
  const file = path.join(ROOT, `${KEY}.txt`);
  fs.writeFileSync(file, KEY);
  console.log(`✔ ${path.basename(file)} yazıldı → yayında ${KEY_LOCATION} adresinden erişilebilir olmalı.`);
  process.exit(0);
}

if (cmd === 'submit') {
  let urls = process.argv.slice(3);
  if (!urls.length) {
    const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
    urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(/&amp;/g, '&'));
  }
  urls = urls.filter(u => u.startsWith(SITE)).slice(0, 10000);
  const body = JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: KEY_LOCATION, urlList: urls });
  const req = https.request({ host: 'api.indexnow.org', path: '/indexnow', method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) } }, res => {
    let data = ''; res.on('data', c => data += c);
    res.on('end', () => {
      const ok = res.statusCode === 200 || res.statusCode === 202;
      console.log(`${ok ? '✔' : '✖'} IndexNow ${res.statusCode} — ${urls.length} URL gönderildi${data ? ' · ' + data.trim() : ''}`);
      if (res.statusCode === 422 || res.statusCode === 403) console.log('   → Anahtar dosyası yayında mı? ' + KEY_LOCATION);
      process.exit(ok ? 0 : 1);
    });
  });
  req.on('error', e => { console.error('✖ istek hatası:', e.message); process.exit(1); });
  req.write(body); req.end();
} else {
  console.log('Kullanım: node tools/indexnow.js keyfile | submit [url ...]');
  process.exit(1);
}
