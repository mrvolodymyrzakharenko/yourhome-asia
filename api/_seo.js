// Shared SEO helpers for api/page.js and api/sitemap.js (claude/seo-rules.md – the Study portal's SEO rules).
// Files starting with "_" in /api are not functions of their own.
const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://yourhome.asia';
const SITE = 'YourHome Cambodia';
const SB_URL = 'https://uuzevmbfcxtvjuguiygy.supabase.co';
const SB_KEY = 'sb_publishable__Q20CYCQEZ3YzjiEeqpxkQ_W4dW-i34';   // publishable key (same as app.js) – RLS decides what it may read
const PHONE = '+855 96 306 8590';
const EMAIL = 'info@yourhome.asia';
const OG_DEFAULT = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=630&fit=crop&q=70&fm=jpg';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// --- the same slug as router.js listingSlug() ---
const slugify = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, '');
function listingSlug(l) {
  const type = l.deal_type === 'room' ? 'room' : String(l.property_type || 'property').replace(/_/g, ' ');
  const beds = l.bedrooms === 0 ? 'studio ' : l.bedrooms > 0 && type !== 'room' ? l.bedrooms + ' bedroom ' : '';
  const deal = l.deal_type === 'sale' ? 'for sale' : l.price_period === 'day' ? 'for daily rent' : 'for rent';
  return slugify(beds + type + ' ' + deal + ' in ' + (l.district || l.city || 'phnom penh'));
}
const listingPath = l => '/listing/' + l.id + (listingSlug(l) ? '-' + listingSlug(l) : '');

// --- Supabase REST (public rows only, short timeout – a slow database never blocks the page) ---
async function sb(table, query, ms = 2500) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, Accept: 'application/json' },
    signal: AbortSignal.timeout(ms),
  });
  if (!r.ok) throw new Error(table + ' ' + r.status);
  return r.json();
}
const LCOLS = 'id,city,district,deal_type,property_type,title,price,price_period,bedrooms,bathrooms,area_m2,photos,status,is_featured,is_demo,created_at,updated_at,country';

// --- text helpers ---
const TYPE_NAME = { apartment: 'Apartment', condo: 'Condo', house: 'House', villa: 'Villa', twin_villa: 'Twin villa', link_house: 'Link house', flat_house: 'Flat house', flat: 'Flat', penthouse: 'Penthouse', shophouse: 'Shophouse', room: 'Room', office: 'Office', land: 'Land', studio: 'Studio' };
const typeName = l => l.deal_type === 'room' ? 'Room' : (TYPE_NAME[l.property_type] || 'Property');
const money = n => '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
const per = l => l.price_period === 'month' ? '/month' : l.price_period === 'day' ? '/day' : '';
function listingName(l) {
  const t = typeName(l);
  const beds = l.bedrooms === 0 && t !== 'Room' ? 'Studio ' + t.toLowerCase() : l.bedrooms > 0 && t !== 'Room' && t !== 'Land' && t !== 'Office' ? `${l.bedrooms}-bedroom ${t.toLowerCase()}` : t;
  const deal = l.deal_type === 'sale' ? 'for sale' : l.price_period === 'day' ? 'for daily rent' : 'for rent';
  return `${beds} ${deal}`;
}
const place = l => [l.district, l.city || 'Phnom Penh'].filter(Boolean).join(', ');
const photoAlt = (l, i) => `${typeName(l)} ${l.deal_type === 'sale' ? 'for sale' : 'for rent'} in ${place(l)}${i ? ' – photo ' + (i + 1) : ''}`;

// Title keyword-first, max 60: the " | YourHome Cambodia" ending is dropped when it does not fit
function title(base) {
  const full = `${base} | ${SITE}`;
  if (full.length <= 60) return full;
  if (base.length <= 60) return base;
  return base.slice(0, 59).replace(/\s+\S*$/, '') + '…';
}
// Description max 160, cut at a full sentence, else at a word + "…"
function desc(s) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  if (s.length <= 160) return s;
  const cut = s.slice(0, 160), dot = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (dot > 80) return cut.slice(0, dot + 1);
  return cut.slice(0, 158).replace(/\s+\S*$/, '') + '…';
}
// Photos in the needed size (Unsplash: w= param; Supabase storage: render endpoint)
function img(u, w) {
  u = String(u || '');
  if (/images\.unsplash\.com/.test(u)) return u.replace(/([?&])w=\d+/, '$1w=' + w).replace(/^([^?]+)$/, `$1?w=${w}&q=70&auto=format`);
  return u;
}

function org() {
  return { '@type': 'Organization', '@id': ORIGIN + '/#org', name: SITE, url: ORIGIN + '/', logo: ORIGIN + '/favicon.svg',
    telephone: PHONE, email: EMAIL, address: { '@type': 'PostalAddress', addressLocality: 'Phnom Penh', addressCountry: 'KH' } };
}
function crumbs(list) {   // [[name, path], …] – Home first
  return { '@type': 'BreadcrumbList', itemListElement: list.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: ORIGIN + p })) };
}

let SHELL = null;
function shell() {
  if (SHELL) return SHELL;
  for (const p of [path.join(process.cwd(), 'index.html'), path.join(__dirname, '..', 'index.html')]) {
    try { SHELL = fs.readFileSync(p, 'utf8'); return SHELL; } catch (_) {}
  }
  throw new Error('index.html not found');
}

// Build the page: own head block + own first content inside <main id="app"> (the app redraws it – same facts)
function render(page) {
  const canon = ORIGIN + (page.path === '/' ? '/' : page.path);
  const ld = { '@context': 'https://schema.org', '@graph': [org(), ...(page.ld || [])] };
  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.desc)}">`,
    page.noindex ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${esc(canon)}">`,
    `<meta property="og:site_name" content="${SITE}">`,
    `<meta property="og:type" content="${page.ogType || 'website'}">`,
    `<meta property="og:title" content="${esc(page.title)}">`,
    `<meta property="og:description" content="${esc(page.desc)}">`,
    page.noindex ? '' : `<meta property="og:url" content="${esc(canon)}">`,
    `<meta property="og:image" content="${esc(page.image || OG_DEFAULT)}">`,
    '<meta property="og:locale" content="en_US">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(page.title)}">`,
    `<meta name="twitter:description" content="${esc(page.desc)}">`,
    `<meta name="twitter:image" content="${esc(page.image || OG_DEFAULT)}">`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].filter(Boolean).join('\n');
  let html = shell();
  html = html.replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, `<!--seo-->\n${head}\n<!--/seo-->`);
  html = html.replace(/<main id="app">[\s\S]*?<\/main>/, `<main id="app">${page.body || ''}</main>`);
  return html;
}

// First cards of a list – plain links with photo, name, place, price (the app's cards replace them)
function cards(list, n = 12) {
  if (!list || !list.length) return '';
  return `<ul class="ssr-cards">${list.slice(0, n).map(l => `<li><a href="${esc(listingPath(l))}">${l.photos && l.photos[0] ? `<img src="${esc(img(l.photos[0], 480))}" alt="${esc(photoAlt(l, 0))}" width="480" height="360" loading="lazy">` : ''}<b>${esc(listingName(l))} in ${esc(place(l))}</b> <span>${esc(money(l.price) + per(l))}</span></a></li>`).join('')}</ul>`;
}
const body = (h1, lead, extra = '') => `<div class="ssr wrap"><h1>${h1}</h1>${lead ? `<p>${esc(lead)}</p>` : ''}${extra}</div>`;

module.exports = { ORIGIN, SITE, PHONE, EMAIL, esc, sb, LCOLS, listingPath, listingSlug, listingName, typeName, place, money, per, photoAlt, title, desc, img, crumbs, render, cards, body, shell };
