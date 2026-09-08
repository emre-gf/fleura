#!/usr/bin/env node
/** Yerel önizleme sunucusu — Vercel/Firebase "cleanUrls" davranışını taklit eder (/x → x.html | x/index.html).
 *  Kullanım: node tools/dev-server.js [port]  (varsayılan 8787) */
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2] || process.env.PORT || 8787);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4', '.woff2': 'font/woff2' };
function resolve(p) {
  p = decodeURIComponent(p.split('?')[0]);
  if (p === '/') return path.join(ROOT, 'index.html');
  const clean = p.replace(/\/$/, '');
  for (const c of [clean, clean + '.html', clean + '/index.html']) {
    const f = path.join(ROOT, c);
    if (f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  }
  return null;
}
http.createServer((req, res) => {
  const f = resolve(req.url);
  if (!f) { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); return fs.createReadStream(path.join(ROOT, '404.html')).pipe(res); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log(`▶ http://localhost:${PORT}`));
