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
// Share picture (owner, 2026-11-26: "kambodzsai kép… valami igazi"): real Phnom Penh houses, Unsplash photo by Vanna Phon
const OG_DEFAULT = 'https://images.unsplash.com/photo-1593510649240-9e85e0eb75ee?w=1200&h=630&fit=crop&q=75&fm=jpg';

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
const TYPE_NAME = { apartment: 'Apartment', condo: 'Condo', house: 'House', villa: 'Villa', twin_villa: 'Twin villa', link_house: 'Link house', flat_house: 'Flat house', flat: 'Flat', penthouse: 'Penthouse', shophouse: 'Shophouse', room: 'Room', office: 'Office', land: 'Land', studio: 'Studio', hotel: 'Hotel', hostel: 'Hostel', borey: 'Borey house', serviced: 'Serviced apartment', guesthouse: 'Guesthouse', resort: 'Resort', farmland: 'Farmland', plantation: 'Plantation', comm_land: 'Commercial land', shop: 'Retail shop', warehouse: 'Warehouse', factory: 'Factory', showroom: 'Showroom', restaurant: 'Restaurant / café', building: 'Whole building' };
const typeName = l => l.deal_type === 'room' ? 'Room' : (TYPE_NAME[l.property_type] || 'Property');
const money = n => '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
const per = l => ({ month: '/month', day: '/day', week: '/week', hour: '/hour' })[l.price_period] || '';
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
  return { '@type': 'Organization', '@id': ORIGIN + '/#org', name: SITE, url: ORIGIN + '/', logo: ORIGIN + '/logo.png',
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
    ...(page.image ? [] : ['<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">', '<meta property="og:image:alt" content="Houses in Phnom Penh, Cambodia">']),
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
  // the live listings for the first page – the app draws its cards at once (app.js fromPre)
  if (page.pre) html = html.replace('<script src="/router.js', `<script>window.__YH_PRE=${JSON.stringify(page.pre).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '')}</script>\n<script src="/router.js`);
  return html;
}

// First cards of a list – plain links with photo, name, place, price (the app's cards replace them)
function cards(list, n = 12) {
  if (!list || !list.length) return '';
  return `<ul class="ssr-cards">${list.slice(0, n).map(l => `<li><a href="${esc(listingPath(l))}">${l.photos && l.photos[0] ? `<img src="${esc(img(l.photos[0], 480))}" alt="${esc(photoAlt(l, 0))}" width="480" height="360" loading="lazy">` : ''}<b>${esc(listingName(l))} in ${esc(place(l))}</b> <span>${esc(money(l.price) + per(l))}</span></a></li>`).join('')}</ul>`;
}
const body = (h1, lead, extra = '') => `<div class="ssr wrap"><h1>${h1}</h1>${lead ? `<p>${esc(lead)}</p>` : ''}${extra}</div>`;

// Landing pages /<deal>/<city>[/<district or type>] (seo-rules.md) – only combinations with live listings are indexable
const DEAL_SEG = { rent: 'rent', buy: 'sale', rooms: 'room', daily: 'daily' };
const TYPE_PLURAL = { hotel: 'Hotels', hostel: 'Hostels', apartment: 'Apartments', condo: 'Condos', house: 'Houses', villa: 'Villas', 'twin-villa': 'Twin villas', 'link-house': 'Link houses', 'flat-house': 'Flat houses', flat: 'Flats', penthouse: 'Penthouses', studio: 'Studios', shophouse: 'Shophouses', office: 'Offices', land: 'Land', commercial: 'Commercial property', borey: 'Borey houses', serviced: 'Serviced apartments', guesthouse: 'Guesthouses', resort: 'Resorts', farmland: 'Farmland', plantation: 'Plantations', 'comm-land': 'Commercial land', shop: 'Retail shops', warehouse: 'Warehouses', factory: 'Factories', showroom: 'Showrooms', restaurant: 'Restaurants & cafés', building: 'Whole buildings' };
const COMMERCIAL = ['office', 'shophouse', 'shop', 'warehouse', 'factory', 'showroom', 'restaurant', 'building'];   // = app.js COMMERCIAL
const dealOf = (l) => l.deal_type === 'rent' && l.price_period === 'day' ? 'daily' : l.deal_type;
const typeSeg = l => l.bedrooms === 0 && l.property_type !== 'room' ? 'studio' : String(l.property_type || '').replace(/_/g, '-');
// every landing path that has at least one live listing: { path: [listings] }
function landings(list) {
  const out = {};
  const add = (k, l) => { (out[k] = out[k] || []).push(l); };
  for (const l of list) {
    const segs = Object.keys(DEAL_SEG).filter(k => DEAL_SEG[k] === dealOf(l) || (k === 'rent' && l.deal_type === 'rent'));
    const c = slugify(l.city || 'Phnom Penh');
    for (const d of segs) {
      add(`/${d}/${c}`, l);
      const ds = l.district && slugify(l.district);
      if (ds) add(`/${d}/${c}/${ds}`, l);
      // district + type landing /<deal>/<city>/<district>/<type> (owner, 2026-11-26: footer "for sale | for rent" grid)
      if (ds && d !== 'rooms' && TYPE_PLURAL[typeSeg(l)]) add(`/${d}/${c}/${ds}/${typeSeg(l)}`, l);
      if (ds && d !== 'rooms' && COMMERCIAL.includes(l.property_type)) add(`/${d}/${c}/${ds}/commercial`, l);
      if (d !== 'rooms' && TYPE_PLURAL[typeSeg(l)]) add(`/${d}/${c}/${typeSeg(l)}`, l);
      if (d !== 'rooms' && COMMERCIAL.includes(l.property_type)) add(`/${d}/${c}/commercial`, l);   // COMMERCIAL = office + shophouse (owner, 2026-11-26)
    }
  }
  return out;
}

module.exports = { slugify, DEAL_SEG, TYPE_PLURAL, landings, typeSeg, ORIGIN, SITE, PHONE, EMAIL, esc, sb, LCOLS, listingPath, listingSlug, listingName, typeName, place, money, per, photoAlt, title, desc, img, crumbs, render, cards, body, shell };
