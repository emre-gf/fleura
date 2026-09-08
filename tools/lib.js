/** Ortak yardımcılar — sitemap, SEO denetimi ve IndexNow tarafından kullanılır. */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = process.env.SITE_URL || 'https://www.fleura.com.tr';
const SKIP_DIRS = new Set(['node_modules', '.git', '.firebase', 'tools', 'assets', '.claude', '.playwright-mcp']);

function listHtml(dir = ROOT, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) { if (!SKIP_DIRS.has(name)) listHtml(full, out); }
    else if (name.endsWith('.html')) out.push(path.relative(ROOT, full));
  }
  return out.sort();
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i')) || tag.match(new RegExp(`\\s${name}\\s*=\\s*'([^']*)'`, 'i'));
  return m ? m[1] : null;
}

function readPage(file) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const links = html.match(/<link\b[^>]*>/gi) || [];
  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  const canonicalTag = links.find(l => /rel\s*=\s*"canonical"/i.test(l));
  const alternates = links.filter(l => /rel\s*=\s*"alternate"/i.test(l) && /hreflang=/i.test(l))
    .map(l => ({ hreflang: attr(l, 'hreflang'), href: attr(l, 'href') }));
  const meta = (n, key = 'name') => { const t = metas.find(m => new RegExp(`${key}\\s*=\\s*"${n}"`, 'i').test(m)); return t ? attr(t, 'content') : null; };
  const robots = meta('robots') || '';
  const titleM = html.match(/<title>([\s\S]*?)<\/title>/i);
  const jsonld = [];
  for (const m of html.matchAll(/<script[^>]*type\s*=\s*"application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) jsonld.push(m[1]);
  return {
    file, html,
    lang: (html.match(/<html[^>]*\slang\s*=\s*"([^"]+)"/i) || [])[1] || null,
    title: titleM ? titleM[1].replace(/\s+/g, ' ').trim() : null,
    description: meta('description'),
    canonical: canonicalTag ? attr(canonicalTag, 'href') : null,
    alternates,
    noindex: /noindex/i.test(robots),
    ogImage: meta('og:image', 'property'),
    ogTitle: meta('og:title', 'property'),
    h1: (html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) || []).map(h => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()),
    jsonld
  };
}

/** URL -> dosya yolu (cleanUrls, trailingSlash yok) */
function urlToFile(url) {
  let p;
  try { p = new URL(url, SITE).pathname; } catch (e) { return null; }
  p = decodeURIComponent(p);
  if (p === '/' || p === '/index.html') return 'index.html';
  p = p.replace(/\/$/, '').replace(/^\//, '');
  const cands = p.endsWith('.html') ? [p] : [`${p}.html`, `${p}/index.html`];
  for (const c of cands) if (fs.existsSync(path.join(ROOT, c))) return c;
  return null;
}

/** dosya yolu -> beklenen canonical URL */
function fileToUrl(file) {
  let p = file.replace(/\\/g, '/');
  if (p === 'index.html') return SITE + '/';
  if (p.endsWith('/index.html')) p = p.slice(0, -'/index.html'.length);
  else if (p.endsWith('.html')) p = p.slice(0, -5);
  return `${SITE}/${p}`;
}

module.exports = { ROOT, SITE, listHtml, readPage, urlToFile, fileToUrl, attr };
