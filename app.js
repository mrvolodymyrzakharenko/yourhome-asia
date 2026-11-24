import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { T } from './i18n.js';

const SB_URL = 'https://uuzevmbfcxtvjuguiygy.supabase.co';
const SB_KEY = 'sb_publishable__Q20CYCQEZ3YzjiEeqpxkQ_W4dW-i34';
const SUPPORT_EMAIL = 'info@yourhome.asia';
const PP = [11.5564, 104.9282];
const DISTRICTS = ['BKK1','BKK2','BKK3','Chamkar Mon','Daun Penh','Riverside','Toul Kork','Toul Tom Poung','Tonle Bassac','Sen Sok','Chroy Changvar','7 Makara','Russey Keo','Mean Chey','Chbar Ampov','Por Senchey','Dangkao','Olympic'];
const TYPES = ['apartment','condo','house','villa','room','shophouse','office','land'];
const BUDGET = { rent: [200,400,700,1000,2000,5000], room: [100,200,300,500], sale: [50000,100000,200000,500000,1000000] };

const sb = createClient(SB_URL, SB_KEY, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } });
const app = document.getElementById('app');
let user = null;
let maps = [];

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let lang = store.get('yh_lang', null) || (['km','zh','fr','th'].find(l => (navigator.language || '').startsWith(l)) || 'en');
const t = (k, vars) => { let s = (T[lang] && T[lang][k]) ?? T.en[k] ?? k; if (vars) for (const v in vars) s = s.replace('{' + v + '}', vars[v]); return s; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const money = n => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const priceSuffix = l => l.price_period === 'month' ? t('perMonth') : l.price_period === 'day' ? t('perDay') : '';
const shortDate = d => { const x = new Date(d); return `${x.getFullYear()}. ${x.getMonth()+1}. ${x.getDate()}.`; };
const dateTime = d => new Date(d).toLocaleString(lang === 'km' ? 'km-KH' : lang, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
const toast = (msg, ms = 3200) => { const el = document.getElementById('toast'); el.textContent = msg; el.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => el.hidden = true, ms); };
const qs = () => new URLSearchParams((location.hash.split('?')[1]) || '');
const go = h => { location.hash = h; };
const saved = () => store.get('yh_saved', []);
const isSaved = id => saved().includes(id);
const visitorId = () => { let v = store.get('yh_vid', null); if (!v) { v = Math.random().toString(36).slice(2, 12); store.set('yh_vid', v); } return v; };
const device = () => { const w = Math.min(screen.width, innerWidth); return w < 700 ? 'mobile' : w < 1050 ? 'tablet' : 'desktop'; };
function trafficSource() {
  let s = null; try { s = sessionStorage.getItem('yh_src'); } catch {}
  if (s) return s;
  const p = new URLSearchParams(location.search);
  const ref = (document.referrer || '').toLowerCase();
  s = p.get('utm_source') || (ref.includes('facebook') || ref.includes('fb.') ? 'facebook' : ref.includes('t.me') || ref.includes('telegram') ? 'telegram'
    : ref.includes('google') ? 'google' : ref.includes('instagram') ? 'instagram' : ref.includes('tiktok') ? 'tiktok'
    : ref && !ref.includes(location.host) ? new URL(document.referrer).hostname.replace('www.', '') : 'direct');
  s = s.slice(0, 60);
  try { sessionStorage.setItem('yh_src', s); } catch {}
  return s;
}
trafficSource();
function track(l, kind) {
  if (!l || l.status !== 'active' || (user && l.owner_id === user.id)) return;
  if (kind === 'view') { const k = 'yh_v_' + l.id; try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch {} }
  sb.from('yh_events').insert({ listing_id: l.id, kind, visitor: visitorId(), source: trafficSource(), device: device(), lang }).then(() => {});
}
const tgHandle = s => { const m = String(s || '').trim().replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, ''); return /^[A-Za-z0-9_]{3,32}$/.test(m) ? m : null; };
const digits = s => String(s || '').replace(/[^\d+]/g, '');
const ICON = {
  bed: '<svg viewBox="0 0 24 24"><path d="M3 18V7m0 7h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-.01"/></svg>',
  bath: '<svg viewBox="0 0 24 24"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V5a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/></svg>',
  area: '<svg viewBox="0 0 24 24"><path d="M4 20 20 4M4 14v6h6M20 10V4h-6"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/></svg>',
};
const LISTING_COLS = 'id,owner_id,district,deal_type,property_type,title,price,price_period,bedrooms,bathrooms,area_m2,lat,lng,photos,status,is_featured,is_demo,created_at,contact_name';

function applyStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  document.getElementById('lang').value = lang;
  document.getElementById('year').textContent = new Date().getFullYear();
}
document.getElementById('lang').addEventListener('change', e => { lang = e.target.value; store.set('yh_lang', lang); applyStatic(); route(); });

function card(l) {
  const ph = l.photos && l.photos[0] ? `<img src="${esc(l.photos[0])}" alt="" loading="lazy">` : `<span class="noimg">🏠</span>`;
  const dots = l.photos && l.photos.length > 1 ? `<div class="dots">${l.photos.slice(0, 5).map(() => '<i></i>').join('')}</div>` : '';
  const beds = l.bedrooms === 0 ? t('studio') : (l.bedrooms ?? '–');
  return `<a class="card" href="#/l/${l.id}">
    <div class="ph">${ph}
      <span class="date">${shortDate(l.created_at)}</span>
      <span class="tags">${l.is_featured ? `<span class="tag top">${t('top')}</span>` : ''}${l.is_demo ? `<span class="tag demo">${t('demo')}</span>` : ''}${l.status !== 'active' ? `<span class="tag st">${esc(t('s_' + l.status))}</span>` : ''}</span>
      <button class="heart ${isSaved(l.id) ? 'on' : ''}" data-save="${l.id}" aria-label="${esc(t('saved'))}">${isSaved(l.id) ? '♥' : '♡'}</button>
      <div class="pov">${money(l.price)}<small>${priceSuffix(l)}</small></div>${dots}
    </div>
    <div class="cb">
      <h3 class="ct">${esc(l.title)}</h3>
      <div class="loc"><b>●</b> ${esc(t('t_' + l.property_type))} · ${esc(l.district || t('cityPP'))}</div>
      <div class="specs-row"><span>${ICON.bed}${esc(beds)}</span><span>${ICON.bath}${l.bathrooms ?? '–'}</span><span>${ICON.area}${l.area_m2 ? Math.round(l.area_m2) + 'm²' : '–'}</span></div>
    </div></a>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-save]'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  const id = b.dataset.save; let s = saved();
  if (s.includes(id)) s = s.filter(x => x !== id); else { s.unshift(id); track({ id, status: 'active' }, 'save'); }
  store.set('yh_saved', s.slice(0, 200));
  b.classList.toggle('on', s.includes(id)); b.textContent = s.includes(id) ? '♥' : '♡';
});

function clearMaps() { maps.forEach(m => m.remove()); maps = []; }
function tiles(m) { L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m); }
function listingsMap(el, list) {
  const m = L.map(el, { scrollWheelZoom: true }).setView(PP, 13); tiles(m); maps.push(m);
  const pts = [];
  list.filter(l => l.lat && l.lng).forEach(l => {
    const icon = L.divIcon({ className: '', html: `<span class="pin ${l.is_featured ? 'top' : ''}">${money(l.price)}</span>`, iconSize: [0, 0] });
    L.marker([l.lat, l.lng], { icon }).addTo(m).bindPopup(`<div class="pop">${l.photos?.[0] ? `<img src="${esc(l.photos[0])}" alt="">` : ''}<b>${money(l.price)}${priceSuffix(l)}</b><br><a href="#/l/${l.id}">${esc(l.title)}</a></div>`);
    pts.push([l.lat, l.lng]);
  });
  if (pts.length > 1) m.fitBounds(pts, { padding: [40, 40], maxZoom: 15 });
  setTimeout(() => m.invalidateSize(), 50);
}

async function fetchListings(f = {}) {
  let q = sb.from('yh_listings').select(LISTING_COLS).eq('status', 'active').eq('country', 'KH');
  if (f.deal) q = q.eq('deal_type', f.deal);
  if (f.type) q = q.eq('property_type', f.type);
  if (f.max) q = q.lte('price', Number(f.max));
  if (f.beds) q = q.gte('bedrooms', Number(f.beds));
  if (f.owner) q = q.eq('owner_id', f.owner);
  if (f.q) { const s = f.q.replace(/[,()%*\\]/g, ' ').trim().slice(0, 60); if (s) q = q.or(`district.ilike.%${s}%,title.ilike.%${s}%,address.ilike.%${s}%`); }
  if (f.ids) q = q.in('id', f.ids);
  const sort = f.sort || 'new';
  q = sort === 'cheap' ? q.order('price', { ascending: true }) : sort === 'exp' ? q.order('price', { ascending: false }) : q.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  const { data, error } = await q.limit(f.limit || 300);
  if (error) { toast(t('error') + error.message); return []; }
  return data;
}

function searchBox(p = {}) {
  const deal = p.deal || 'rent';
  return `<div class="deal-tabs" id="dealTabs">${['rent','sale','room'].map(d => `<button data-deal="${d}" class="${d === deal ? 'on' : ''}">${t(d === 'sale' ? 'buy' : d)}</button>`).join('')}</div>
  <form class="sbox" id="sbox">
    <div class="f"><label>${t('city')}</label><select disabled><option>${t('cityPP')}</option></select></div>
    <div class="f addr"><label>📍 ${t('district')}</label><input name="q" list="dl" placeholder="${esc(t('addrPh'))}" value="${esc(p.q || '')}"><datalist id="dl">${DISTRICTS.map(d => `<option value="${d}">`).join('')}</datalist></div>
    <div class="f"><label>${t('type')}</label><select name="type"><option value="">${t('any')}</option>${TYPES.map(x => `<option value="${x}" ${p.type === x ? 'selected' : ''}>${t('t_' + x)}</option>`).join('')}</select></div>
    <div class="f"><label>${t('budget')}</label><select name="max" id="maxSel">${budgetOpts(deal, p.max)}</select></div>
    <button class="btn blue">${t('search')} →</button>
  </form>`;
}
const budgetOpts = (deal, cur) => `<option value="">${t('any')}</option>` + BUDGET[deal].map(v => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>≤ ${money(v)}</option>`).join('');
function wireSearchBox(onSubmit) {
  let deal = document.querySelector('#dealTabs .on').dataset.deal;
  document.getElementById('dealTabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; deal = b.dataset.deal; document.querySelectorAll('#dealTabs button').forEach(x => x.classList.toggle('on', x === b)); document.getElementById('maxSel').innerHTML = budgetOpts(deal); onSubmit && onSubmit(deal, true); };
  document.getElementById('sbox').onsubmit = e => { e.preventDefault(); onSubmit(deal); };
  return () => deal;
}
function block(title, list, more) {
  if (!list.length) return '';
  return `<section class="block"><div class="bh"><h2>${title}</h2><a class="more" href="${more}">${t('seeAll')}</a></div><div class="row-scroll">${list.slice(0, 8).map(card).join('')}</div></section>`;
}
async function viewHome() {
  app.innerHTML = `<div class="wrap"><section class="hero"><h1>${t('heroTitle')}</h1><p>${t('heroSub')}</p>${searchBox()}</section>
    <div class="cta"><div><span class="ic">+</span>${t('ctaText')}</div><a href="#/post" class="btn">${t('ctaBtn')} →</a></div>
    <div id="blocks"><div class="empty">${t('loading')}</div></div></div>`;
  wireSearchBox((deal, tabOnly) => {
    if (tabOnly) return;
    const f = new FormData(document.getElementById('sbox')); const p = new URLSearchParams({ deal });
    for (const k of ['q', 'type', 'max']) if (f.get(k)) p.set(k, f.get(k));
    go('#/search?' + p);
  });
  const all = await fetchListings({ limit: 300 });
  const rent = all.filter(l => l.deal_type === 'rent');
  const html = block(t('recommended'), all.filter(l => l.is_featured), '#/search?sort=new')
    + block(t('newest'), [...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), '#/search?sort=new')
    + block(t('cheapest'), [...rent].sort((a, b) => a.price - b.price), '#/search?deal=rent&sort=cheap')
    + block(t('rooms'), all.filter(l => l.deal_type === 'room'), '#/search?deal=room')
    + block(t('forSale'), all.filter(l => l.deal_type === 'sale'), '#/search?deal=sale');
  document.getElementById('blocks').innerHTML = html || `<div class="empty">${t('noResults')}</div>`;
}

async function viewSearch() {
  const p = Object.fromEntries(qs());
  const view = p.view === 'map' ? 'map' : 'grid';
  const deal = p.deal || '';
  app.innerHTML = `<div class="wrap">
    <form class="fbar" id="fbar">
      <select name="deal"><option value="">${t('all')}</option>${['rent','sale','room'].map(d => `<option value="${d}" ${deal === d ? 'selected' : ''}>${t(d === 'sale' ? 'buy' : d)}</option>`).join('')}</select>
      <input name="q" list="dl2" placeholder="${esc(t('addrPh'))}" value="${esc(p.q || '')}"><datalist id="dl2">${DISTRICTS.map(d => `<option value="${d}">`).join('')}</datalist>
      <select name="type"><option value="">${t('type')}: ${t('any')}</option>${TYPES.map(x => `<option value="${x}" ${p.type === x ? 'selected' : ''}>${t('t_' + x)}</option>`).join('')}</select>
      <select name="max"><option value="">${t('budget')}: ${t('any')}</option>${BUDGET[deal || 'sale'].concat(deal ? [] : BUDGET.rent).sort((a, b) => a - b).map(v => `<option value="${v}" ${String(p.max) === String(v) ? 'selected' : ''}>≤ ${money(v)}</option>`).join('')}</select>
      <select name="beds"><option value="">${t('bedrooms')}: ${t('any')}</option>${[1,2,3,4].map(n => `<option value="${n}" ${String(p.beds) === String(n) ? 'selected' : ''}>${n}+</option>`).join('')}</select>
    </form>
    <div class="bh"><h2 id="rc">${t('loading')}</h2>
      <div class="tools">
        <button class="notify" id="notifyBtn">🔔 ${t('notify')}</button>
        <div class="seg"><button data-v="grid" class="${view === 'grid' ? 'on' : ''}" aria-label="Grid">${ICON.grid}</button><button data-v="map" class="${view === 'map' ? 'on' : ''}" aria-label="Map">${ICON.map}</button></div>
        <select id="sortSel"><option value="new">${t('sort')}: ${t('sortNew')}</option><option value="cheap" ${p.sort === 'cheap' ? 'selected' : ''}>${t('sortCheap')}</option><option value="exp" ${p.sort === 'exp' ? 'selected' : ''}>${t('sortExp')}</option></select>
      </div></div>
    <div id="res"></div></div>`;
  const upd = ch => { const n = new URLSearchParams(qs()); for (const k in ch) ch[k] ? n.set(k, ch[k]) : n.delete(k); go('#/search?' + n); };
  document.getElementById('fbar').onchange = () => { const f = new FormData(document.getElementById('fbar')); upd(Object.fromEntries(f)); };
  document.getElementById('fbar').onsubmit = e => { e.preventDefault(); document.getElementById('fbar').onchange(); };
  document.getElementById('sortSel').onchange = e => upd({ sort: e.target.value === 'new' ? '' : e.target.value });
  document.querySelectorAll('.seg button').forEach(b => b.onclick = () => upd({ view: b.dataset.v === 'map' ? 'map' : '' }));
  document.getElementById('notifyBtn').onclick = () => alertModal(p);
  const list = await fetchListings(p);
  document.getElementById('rc').textContent = t('results', { n: list.length });
  const res = document.getElementById('res');
  if (!list.length) { res.innerHTML = `<div class="empty">${t('noResults')}<br><br><a class="btn red" href="#/post">+ ${t('post')}</a></div>`; return; }
  if (view === 'map') { res.innerHTML = '<div id="map"></div>'; listingsMap(document.getElementById('map'), list); }
  else res.innerHTML = `<div class="grid">${list.map(card).join('')}</div>`;
}
function alertModal(filters) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:2500;display:grid;place-items:center;padding:16px';
  wrap.innerHTML = `<form class="panel form" style="max-width:420px;width:100%"><h3>🔔 ${t('newListingsAlert')}</h3><p style="margin:0;color:var(--muted)">${t('newListingsSub')}</p>
    <label>${t('tgUser')}<input name="tg" placeholder="@username" required></label>
    <div style="display:flex;gap:8px"><button class="btn blue">${t('tgSave')}</button><button type="button" class="btn ghost" data-x>${t('cancel')}</button></div></form>`;
  document.body.appendChild(wrap);
  wrap.querySelector('[data-x]').onclick = () => wrap.remove();
  wrap.onclick = e => { if (e.target === wrap) wrap.remove(); };
  wrap.querySelector('form').onsubmit = async e => {
    e.preventDefault(); const h = tgHandle(new FormData(e.target).get('tg')); if (!h) return toast(t('required'));
    const f = {}; for (const k of ['deal','type','max','beds','q']) if (filters[k]) f[k] = filters[k];
    const { error } = await sb.from('yh_alerts').insert({ kind: 'new_listings', telegram: '@' + h, filters: f });
    if (error) return toast(t('error') + error.message);
    wrap.remove(); toast(t('tgSaved'), 5000);
  };
}

async function viewListing(id) {
  app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:24px">${t('loading')}</div></div>`;
  const { data: l, error } = await sb.from('yh_listings').select('*').eq('id', id).maybeSingle();
  if (error || !l) { app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:24px">404</div></div>`; return; }
  track(l, 'view');
  document.title = `${l.title} — YourHome.asia`;
  const photos = l.photos || [];
  const tg = tgHandle(l.contact_telegram), wa = digits(l.contact_whatsapp), ph = digits(l.contact_phone);
  const beds = l.bedrooms === 0 ? t('studio') : (l.bedrooms ?? '–');
  app.innerHTML = `<div class="wrap"><a class="back" href="javascript:history.back()">${t('back')}</a>
  <div class="detail"><div>
    <div class="gal"><div class="main" id="gmain">${photos[0] ? `<img src="${esc(photos[0])}" alt="">` : '🏠'}</div>
      ${photos.length > 1 ? `<div class="thumbs">${photos.map((p, i) => `<img src="${esc(p)}" data-i="${i}" class="${i ? '' : 'on'}" alt="">`).join('')}</div>` : ''}</div>
    <div class="panel" style="margin-top:18px">
      <div class="tags" style="position:static;display:flex;gap:6px">${l.is_featured ? `<span class="tag top">${t('top')}</span>` : ''}${l.is_demo ? `<span class="tag demo">${t('demo')}</span>` : ''}<span class="tag" style="background:var(--blue-l);color:var(--blue)">${esc(t(l.deal_type === 'sale' ? 'buy' : l.deal_type))} · ${esc(t('t_' + l.property_type))}</span></div>
      <h1>${esc(l.title)}</h1>
      <div class="loc" style="font-size:14px"><b>●</b> ${esc([l.address, l.district, t('cityPP')].filter(Boolean).join(', '))}</div>
      <div class="bigprice">${money(l.price)} <small>${priceSuffix(l)}</small></div>
      <div class="specs"><div class="spec"><b>${esc(beds)}</b><span>${t('bedrooms')}</span></div><div class="spec"><b>${l.bathrooms ?? '–'}</b><span>${t('bathrooms')}</span></div><div class="spec"><b>${l.area_m2 ? Math.round(l.area_m2) : '–'}</b><span>${t('area')}</span></div><div class="spec"><b>${l.furnished ? '✓' : '–'}</b><span>${t('furnished')}</span></div></div>
      ${l.description ? `<h3>${t('description')}</h3><div class="desc">${esc(l.description)}</div>` : ''}
    </div>
    ${l.lat && l.lng ? `<div class="panel"><h3>${t('location')}</h3><div class="mini-map" id="mmap"></div></div>` : ''}
  </div>
  <aside><div class="sticky">
    <div class="panel"><h3>${t('contactOwner')}</h3>${l.contact_name ? `<p style="margin:0 0 12px;font-weight:700">${esc(l.contact_name)}</p>` : ''}
      <div class="contact">
        ${tg ? `<a class="btn tg wide" data-ev="telegram" href="https://t.me/${tg}" target="_blank" rel="noopener">Telegram @${esc(tg)}</a>` : ''}
        ${wa ? `<a class="btn wa wide" data-ev="whatsapp" href="https://wa.me/${wa.replace('+', '')}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
        ${ph ? `<a class="btn blue wide" data-ev="phone" href="tel:${ph}">📞 ${t('call')} ${esc(l.contact_phone)}</a>` : ''}
      </div></div>
    <form class="panel form" id="inq"><h3>${t('sendMsg')}</h3>
      <input name="name" placeholder="${esc(t('yourName'))}" required maxlength="100">
      <input name="contact" placeholder="${esc(t('yourContact'))}" required maxlength="150">
      <textarea name="message" placeholder="${esc(t('message'))}" maxlength="2000" style="min-height:90px"></textarea>
      <button class="btn red wide">${t('send')}</button></form>
  </div></aside></div></div>`;
  app.querySelectorAll('[data-ev]').forEach(a => a.addEventListener('click', () => track(l, a.dataset.ev)));
  app.querySelectorAll('.thumbs img').forEach(img => img.onclick = () => { document.getElementById('gmain').innerHTML = `<img src="${esc(photos[img.dataset.i])}" alt="">`; app.querySelectorAll('.thumbs img').forEach(x => x.classList.toggle('on', x === img)); });
  if (l.lat && l.lng) { const m = L.map('mmap').setView([l.lat, l.lng], 15); tiles(m); L.marker([l.lat, l.lng]).addTo(m); maps.push(m); }
  document.getElementById('inq').onsubmit = async e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); const btn = e.target.querySelector('button'); btn.disabled = true;
    const { error } = await sb.from('yh_inquiries').insert({ listing_id: l.id, name: f.name.trim(), contact: f.contact.trim(), message: f.message.trim() || null });
    btn.disabled = false;
    if (error) return toast(t('error') + error.message);
    e.target.reset(); toast(t('sent'), 4500);
  };
}

function viewLogin(next) {
  app.innerHTML = `<div class="wrap"><div class="auth panel form"><h2 style="margin:0">${t('login')}</h2><p style="margin:0;color:var(--muted)">${t('loginNeeded')}</p>
    <button class="btn ghost wide" id="gbtn"><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg> ${t('google')}</button>
    <div class="sep">${t('or')}</div>
    <form id="mform" class="form"><input type="email" name="email" placeholder="${esc(t('email'))}" required><button class="btn blue wide">${t('sendLink')}</button></form></div></div>`;
  store.set('yh_next', next || 'account');
  const redirectTo = location.origin + '/';
  document.getElementById('gbtn').onclick = async () => { const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } }); if (error) toast(t('error') + error.message); };
  document.getElementById('mform').onsubmit = async e => {
    e.preventDefault(); const btn = e.target.querySelector('button'); btn.disabled = true;
    const { error } = await sb.auth.signInWithOtp({ email: new FormData(e.target).get('email').trim(), options: { emailRedirectTo: redirectTo } });
    btn.disabled = false; if (error) return toast(t('error') + error.message);
    toast(t('linkSent'), 6000);
  };
}

async function viewPost(editId) {
  if (!user) return viewLogin(editId ? 'edit/' + editId : 'post');
  let l = { deal_type: 'rent', property_type: 'apartment', price_period: 'month', photos: [], furnished: false };
  if (editId) {
    const { data } = await sb.from('yh_listings').select('*').eq('id', editId).eq('owner_id', user.id).maybeSingle();
    if (!data) { app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:24px">404</div></div>`; return; }
    l = data;
  } else {
    const last = store.get('yh_contact', {}); Object.assign(l, last);
  }
  let photos = [...(l.photos || [])];
  const sel = (name, opts, cur) => `<select name="${name}">${opts.map(([v, lab]) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`).join('')}</select>`;
  app.innerHTML = `<div class="wrap"><form class="narrow panel form" id="pform">
    <h1 style="margin:0">${editId ? t('editTitle') : t('postTitle')}</h1>
    <div class="row"><label>${t('dealType')} *${sel('deal_type', [['rent', t('rent')], ['sale', t('buy')], ['room', t('room')]], l.deal_type)}</label>
      <label>${t('propType')} *${sel('property_type', TYPES.map(x => [x, t('t_' + x)]), l.property_type)}</label></div>
    <label>${t('title')} *<input name="title" required minlength="5" maxlength="140" placeholder="${esc(t('titlePh'))}" value="${esc(l.title || '')}"></label>
    <div class="row"><label>${t('price')} *<input name="price" type="number" min="0" step="1" required value="${l.price ?? ''}"></label>
      <label>${t('period')}${sel('price_period', [['month', t('p_month')], ['day', t('p_day')], ['total', t('p_total')]], l.price_period)}</label></div>
    <div class="row3"><label>${t('bedrooms')}<input name="bedrooms" type="number" min="0" max="50" value="${l.bedrooms ?? ''}" placeholder="0 = ${esc(t('studio'))}"></label>
      <label>${t('bathrooms')}<input name="bathrooms" type="number" min="0" max="50" value="${l.bathrooms ?? ''}"></label>
      <label>${t('area')}<input name="area_m2" type="number" min="0" step="0.1" value="${l.area_m2 ?? ''}"></label></div>
    <label class="chk"><input type="checkbox" name="furnished" ${l.furnished ? 'checked' : ''}> ${t('furnished')}</label>
    <label>${t('description')}<textarea name="description" maxlength="5000">${esc(l.description || '')}</textarea></label>
    <div class="row"><label>${t('district')} *<select name="district" required><option value="">—</option>${DISTRICTS.map(d => `<option ${l.district === d ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
      <label>${t('address')}<input name="address" maxlength="200" value="${esc(l.address || '')}"></label></div>
    <label>${t('pickMap')}<div class="pick-map" id="pmap"></div></label>
    <label>${t('photos')}<input type="file" id="files" accept="image/jpeg,image/png,image/webp" multiple></label>
    <div class="prev" id="prev"></div>
    <div class="row"><label>${t('contactName')}<input name="contact_name" maxlength="80" value="${esc(l.contact_name || '')}"></label>
      <label>${t('phone')}<input name="contact_phone" maxlength="30" value="${esc(l.contact_phone || '')}" placeholder="+855 …"></label></div>
    <div class="row"><label>${t('telegram')}<input name="contact_telegram" maxlength="40" value="${esc(l.contact_telegram || '')}" placeholder="@username"></label>
      <label>${t('whatsapp')}<input name="contact_whatsapp" maxlength="30" value="${esc(l.contact_whatsapp || '')}" placeholder="+855 …"></label></div>
    <button class="btn red wide" id="pbtn">${editId ? t('saveChanges') : t('publish')}</button></form></div>`;
  let pos = l.lat && l.lng ? [l.lat, l.lng] : null;
  const m = L.map('pmap').setView(pos || PP, pos ? 16 : 13); tiles(m); maps.push(m);
  let mk = pos ? L.marker(pos).addTo(m) : null;
  m.on('click', e => { pos = [e.latlng.lat, e.latlng.lng]; mk ? mk.setLatLng(pos) : (mk = L.marker(pos).addTo(m)); });
  setTimeout(() => m.invalidateSize(), 60);
  const drawPrev = () => { document.getElementById('prev').innerHTML = photos.map((p, i) => `<div class="pi"><img src="${esc(p)}" alt=""><button type="button" data-rm="${i}">×</button></div>`).join(''); };
  drawPrev();
  document.getElementById('prev').onclick = e => { const b = e.target.closest('[data-rm]'); if (b) { photos.splice(+b.dataset.rm, 1); drawPrev(); } };
  document.getElementById('files').onchange = async e => {
    const files = [...e.target.files].slice(0, 10 - photos.length);
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) { toast('> 5 MB: ' + f.name); continue; }
      const ext = (f.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error } = await sb.storage.from('yh-photos').upload(path, f, { contentType: f.type, cacheControl: '31536000' });
      if (error) { toast(t('error') + error.message); continue; }
      photos.push(sb.storage.from('yh-photos').getPublicUrl(path).data.publicUrl); drawPrev();
    }
    e.target.value = '';
  };
  document.getElementById('pform').onsubmit = async e => {
    e.preventDefault(); const btn = document.getElementById('pbtn'); btn.disabled = true;
    const f = Object.fromEntries(new FormData(e.target));
    const num = v => v === '' || v == null ? null : Number(v);
    const row = {
      deal_type: f.deal_type, property_type: f.property_type, title: f.title.trim(), description: f.description.trim() || null,
      price: Number(f.price), price_period: f.deal_type === 'sale' ? 'total' : f.price_period,
      bedrooms: num(f.bedrooms), bathrooms: num(f.bathrooms), area_m2: num(f.area_m2), furnished: !!f.furnished,
      district: f.district, address: f.address.trim() || null, lat: pos ? pos[0] : null, lng: pos ? pos[1] : null, photos,
      contact_name: f.contact_name.trim() || null, contact_phone: f.contact_phone.trim() || null,
      contact_telegram: f.contact_telegram.trim() || null, contact_whatsapp: f.contact_whatsapp.trim() || null,
    };
    store.set('yh_contact', { contact_name: row.contact_name, contact_phone: row.contact_phone, contact_telegram: row.contact_telegram, contact_whatsapp: row.contact_whatsapp });
    const res = editId ? await sb.from('yh_listings').update(row).eq('id', editId).select('id').single()
                       : await sb.from('yh_listings').insert(row).select('id').single();
    btn.disabled = false;
    if (res.error) return toast(t('error') + res.error.message);
    toast(editId ? t('savedOk') : t('published'), 4000); go('#/l/' + res.data.id);
  };
}

async function viewAccount() {
  if (!user) return viewLogin('account');
  const tab = qs().get('tab') || 'overview';
  app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:24px">${t('loading')}</div></div>`;
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [{ data: mine = [] }, { data: alerts = [] }] = await Promise.all([
    sb.from('yh_listings').select(LISTING_COLS).eq('owner_id', user.id).order('created_at', { ascending: false }),
    sb.from('yh_alerts').select('*').eq('user_id', user.id).eq('kind', 'my_messages'),
  ]);
  const ids = (mine || []).map(l => l.id);
  const [{ data: ev = [] }, { data: inq = [] }] = ids.length ? await Promise.all([
    sb.from('yh_events').select('listing_id,kind,visitor,source,device,lang,created_at').in('listing_id', ids).gte('created_at', since).order('created_at', { ascending: false }).limit(5000),
    sb.from('yh_inquiries').select('*').in('listing_id', ids).order('created_at', { ascending: false }).limit(500),
  ]) : [{ data: [] }, { data: [] }];
  const byId = Object.fromEntries((mine || []).map(l => [l.id, l]));
  const views = ev.filter(e => e.kind === 'view');
  const contacts = ev.filter(e => ['phone', 'telegram', 'whatsapp'].includes(e.kind));
  const uniq = new Set(views.map(e => e.visitor)).size;
  const bigCard = (href, icon, title, sub, red) => `<a href="${href}" class="panel" style="text-decoration:none;color:inherit;display:block;margin:0;${red ? 'background:var(--red);color:#fff' : ''}"><div style="font-size:30px">${icon}</div><div style="font-weight:800;font-size:19px;margin-top:6px">${title}</div><div style="opacity:.75;font-size:14px">${sub}</div></a>`;
  const tabs = ['overview', 'listings', 'messages', 'stats', 'telegram'];
  const tabLabel = { overview: t('overview'), listings: t('my'), messages: t('inquiries'), stats: t('stats'), telegram: t('tgAlerts') };
  let body = '';
  if (tab === 'overview') {
    body = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
      ${bigCard('#/post', '＋', t('post'), t('postSub'), true)}
      ${bigCard('#/account?tab=listings', '🏠', t('my'), String(mine.length))}
      ${bigCard('#/account?tab=messages', '✉️', t('inquiries'), String(inq.length))}
      ${bigCard('#/account?tab=stats', '📊', t('stats'), `${views.length} ${t('views').toLowerCase()} · ${t('last30').toLowerCase()}`)}
      ${bigCard('#/account?tab=telegram', '🔔', t('tgAlerts'), alerts.length ? `${t('tgActive')} ${esc(alerts[0].telegram)}` : t('tgAlertsSub'))}
    </div>${statTiles()}`;
  } else if (tab === 'listings') {
    body = mine.length ? mine.map(l => `<div class="mine"><a href="#/l/${l.id}" class="ph">${l.photos?.[0] ? `<img src="${esc(l.photos[0])}" alt="">` : '<span class="noimg">🏠</span>'}</a>
      <div style="min-width:0"><div class="ct">${esc(l.title)}</div><div style="color:var(--red);font-weight:800">${money(l.price)}${priceSuffix(l)}</div>
      <div class="loc" style="margin:2px 0 0">👁 ${views.filter(e => e.listing_id === l.id).length} · 📞 ${contacts.filter(e => e.listing_id === l.id).length} · ✉️ ${inq.filter(i => i.listing_id === l.id).length} · ${shortDate(l.created_at)}</div></div>
      <div class="mine-act"><select data-status="${l.id}" ${l.status === 'rejected' ? 'disabled' : ''}>${['active', 'hidden', l.deal_type === 'sale' ? 'sold' : 'rented', ...(l.status === 'rejected' ? ['rejected'] : [])].map(s => `<option value="${s}" ${l.status === s ? 'selected' : ''}>${t('s_' + s)}</option>`).join('')}</select>
      <a class="btn ghost sm" href="#/edit/${l.id}">${t('edit')}</a><button class="btn ghost sm" data-del="${l.id}">${t('del')}</button></div></div>`).join('')
      : `<div class="empty">${t('noMine')}<br><br><a class="btn red" href="#/post">+ ${t('post')}</a></div>`;
  } else if (tab === 'messages') {
    body = inq.length ? `<div class="panel">${inq.map(i => `<div class="inq"><b>${esc(i.name)}</b> · <a href="${contactHref(i.contact)}" target="_blank" rel="noopener">${esc(i.contact)}</a> <span style="color:var(--muted);font-size:12px">· ${dateTime(i.created_at)} · <a href="#/l/${i.listing_id}">${esc(byId[i.listing_id]?.title || '')}</a></span>${i.message ? `<div style="white-space:pre-wrap;margin-top:4px">${esc(i.message)}</div>` : ''}</div>`).join('')}</div>`
      : `<div class="empty">${t('noInquiries')}</div>`;
  } else if (tab === 'stats') {
    body = statTiles() + (ev.length ? `<div class="panel"><h3>${t('views')} · ${t('last30')}</h3>${dayChart(views)}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">
        ${breakdown(t('sources'), views, e => e.source === 'direct' ? t('direct') : e.source)}
        ${breakdown(t('devices'), views, e => t(e.device || 'desktop'))}
        ${breakdown(t('languages'), views, e => (e.lang || '?').toUpperCase())}
      </div>
      <div class="panel"><h3>${t('perListing')}</h3><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr style="text-align:left;color:var(--muted)"><th style="padding:6px">${t('what')}</th><th>👁 ${t('views')}</th><th>${t('visitors')}</th><th>📞 ${t('contacts')}</th><th>✉️</th></tr>
        ${mine.map(l => { const v = views.filter(e => e.listing_id === l.id); return `<tr style="border-top:1px solid var(--line)"><td style="padding:8px 6px"><a href="#/l/${l.id}">${esc(l.title)}</a></td><td>${v.length}</td><td>${new Set(v.map(e => e.visitor)).size}</td><td>${contacts.filter(e => e.listing_id === l.id).length}</td><td>${inq.filter(i => i.listing_id === l.id).length}</td></tr>`; }).join('')}
      </table></div></div>
      <div class="panel"><h3>${t('activity')}</h3><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr style="text-align:left;color:var(--muted)"><th style="padding:6px">${t('when')}</th><th>${t('what')}</th><th>${t('action')}</th><th>${t('from')}</th><th>${t('device')}</th><th>🌐</th></tr>
        ${ev.slice(0, 100).map(e => `<tr style="border-top:1px solid var(--line)"><td style="padding:7px 6px;white-space:nowrap">${dateTime(e.created_at)}</td><td>${esc(byId[e.listing_id]?.title || '')}</td><td>${t('a_' + e.kind)}</td><td>${esc(e.source === 'direct' ? t('direct') : e.source || '')}</td><td>${t(e.device || 'desktop')}</td><td>${esc((e.lang || '').toUpperCase())}</td></tr>`).join('')}
      </table></div></div>` : `<div class="empty">${t('noStats')}</div>`);
  } else if (tab === 'telegram') {
    body = `<form class="panel form" id="tgform" style="max-width:560px"><h3>🔔 ${t('tgAlerts')}</h3><p style="margin:0;color:var(--muted)">${t('tgAlertsSub')}</p>
      ${alerts.length ? `<p style="margin:0;font-weight:700">✓ ${t('tgActive')} ${esc(alerts[0].telegram)}</p>` : ''}
      <label>${t('tgUser')}<input name="tg" placeholder="@username" value="${esc(alerts[0]?.telegram || '')}" required></label>
      <button class="btn blue">${t('tgSave')}</button></form>`;
  }
  function statTiles() {
    const tile = (n, lab) => `<div class="panel" style="margin:0;text-align:center"><div style="font-size:30px;font-weight:800;color:var(--blue)">${n}</div><div style="color:var(--muted);font-size:13px;font-weight:700">${lab}</div></div>`;
    return `<h3 style="margin:28px 0 12px">${t('stats')} · ${t('last30')}</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:18px">${tile(views.length, t('views'))}${tile(uniq, t('visitors'))}${tile(contacts.length, t('contacts'))}${tile(inq.filter(i => i.created_at >= since).length, t('messagesN'))}</div>`;
  }
  app.innerHTML = `<div class="wrap" style="margin-top:26px">
    <div class="bh"><div><div style="color:var(--muted);font-weight:700">${t('dash')}</div><h2>${t('hello')}, ${esc(user.user_metadata?.full_name || user.email)}</h2></div><button class="btn ghost sm" id="logout">${t('logout')}</button></div>
    <div class="deal-tabs" style="overflow-x:auto;max-width:100%">${tabs.map(x => `<button data-tab="${x}" class="${x === tab ? 'on' : ''}">${tabLabel[x]}</button>`).join('')}</div>
    <div>${body}</div></div>`;
  app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => go('#/account' + (b.dataset.tab === 'overview' ? '' : '?tab=' + b.dataset.tab)));
  document.getElementById('logout').onclick = async () => { await sb.auth.signOut(); go('#/'); };
  app.querySelectorAll('[data-status]').forEach(s => s.onchange = async () => { const { error } = await sb.from('yh_listings').update({ status: s.value }).eq('id', s.dataset.status); toast(error ? t('error') + error.message : t('savedOk')); });
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { if (!confirm(t('confirmDel'))) return; const { error } = await sb.from('yh_listings').delete().eq('id', b.dataset.del); if (error) return toast(t('error') + error.message); route(); });
  const tf = document.getElementById('tgform');
  if (tf) tf.onsubmit = async e => {
    e.preventDefault(); const h = tgHandle(new FormData(tf).get('tg')); if (!h) return toast(t('required'));
    const res = alerts.length ? await sb.from('yh_alerts').update({ telegram: '@' + h, active: true }).eq('id', alerts[0].id)
                              : await sb.from('yh_alerts').insert({ kind: 'my_messages', telegram: '@' + h });
    if (res.error) return toast(t('error') + res.error.message);
    toast(t('tgSaved'), 5000); route();
  };
}
function contactHref(c) {
  const h = tgHandle(c); if (c.trim().startsWith('@') && h) return 'https://t.me/' + h;
  if (c.includes('@')) return 'mailto:' + c.trim();
  const d = digits(c); return d.length >= 6 ? 'tel:' + d : '#';
}
function dayChart(views) {
  const days = []; for (let i = 29; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5); days.push(d.toISOString().slice(0, 10)); }
  const counts = days.map(d => views.filter(e => e.created_at.slice(0, 10) === d).length);
  const max = Math.max(1, ...counts); const w = 100 / days.length;
  return `<svg viewBox="0 0 100 40" preserveAspectRatio="none" style="width:100%;height:160px;display:block">${counts.map((c, i) => `<rect x="${i * w + w * .15}" y="${38 - (c / max) * 36}" width="${w * .7}" height="${Math.max(.4, (c / max) * 36)}" rx=".6" fill="${i === counts.length - 1 ? '#E00025' : '#032EA1'}"><title>${days[i]}: ${c}</title></rect>`).join('')}</svg>
  <div style="display:flex;justify-content:space-between;color:var(--muted);font-size:11px;margin-top:4px"><span>${days[0].slice(5)}</span><span>${t('today')}</span></div>`;
}
function breakdown(title, list, keyFn) {
  const m = {}; list.forEach(e => { const k = keyFn(e); m[k] = (m[k] || 0) + 1; });
  const rows = Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8); const tot = list.length || 1;
  return `<div class="panel"><h3>${title}</h3>${rows.length ? rows.map(([k, v]) => `<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700"><span>${esc(k)}</span><span>${v}</span></div><div style="height:6px;background:var(--bg);border-radius:99px"><div style="height:6px;width:${(v / tot) * 100}%;background:var(--blue);border-radius:99px"></div></div></div>`).join('') : '–'}</div>`;
}

async function viewSaved() {
  const ids = saved();
  app.innerHTML = `<div class="wrap"><div class="bh" style="margin-top:26px"><h2>♥ ${t('saved')}</h2></div><div id="res"></div></div>`;
  const res = document.getElementById('res');
  if (!ids.length) { res.innerHTML = `<div class="empty">${t('savedEmpty')}</div>`; return; }
  const list = await fetchListings({ ids: ids.slice(0, 100) });
  res.innerHTML = list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty">${t('savedEmpty')}</div>`;
}
async function viewExperts() {
  app.innerHTML = `<div class="wrap"><div class="bh" style="margin-top:26px"><div><h2>⚡ ${t('expertsTitle')}</h2><div style="color:var(--muted)">${t('expertsSub')}</div></div><a class="btn red" href="#/post">+ ${t('post')}</a></div><div id="res"><div class="empty">${t('loading')}</div></div></div>`;
  const { data = [] } = await sb.from('yh_listings').select('owner_id,contact_name,contact_telegram,created_at').eq('status', 'active').not('owner_id', 'is', null).limit(2000);
  const g = {}; (data || []).forEach(r => { const x = g[r.owner_id] ||= { n: 0, name: r.contact_name, tg: r.contact_telegram }; x.n++; if (!x.name && r.contact_name) x.name = r.contact_name; });
  const list = Object.entries(g).sort((a, b) => b[1].n - a[1].n);
  document.getElementById('res').innerHTML = list.length ? `<div class="grid">${list.map(([id, x]) => `<a class="exp" href="#/search?owner=${id}" style="text-decoration:none;color:inherit"><div class="av">${esc((x.name || '?').trim()[0]?.toUpperCase() || '?')}</div><div><div style="font-weight:800">${esc(x.name || 'YourHome')}</div><div style="color:var(--muted);font-size:13px">${t('listingsCount', { n: x.n })}${tgHandle(x.tg) ? ' · @' + esc(tgHandle(x.tg)) : ''}</div></div></a>`).join('')}</div>`
    : `<div class="empty">${t('noResults')}<br><br><a class="btn red" href="#/post">+ ${t('post')}</a></div>`;
}
const PAGES = {
  terms: () => `<h1>${t('terms')}</h1><p>YourHome.asia is a listing platform that connects people looking for housing in Cambodia with owners and agents. Listings are published by their advertisers, who are responsible for their accuracy and legality. YourHome.asia is not a party to any rental or sale agreement.</p><p>Posting a standard listing is free. Advertisers must only post real properties they are entitled to offer, with honest prices and photos. We may hide or remove listings that are misleading, duplicated, spam or illegal, and may suspend accounts that break these rules.</p><p>Paid placements (TOP listings) are shown with a TOP label. Users should check every property in person and never send deposits before viewing it.</p><p>Questions: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>`,
  privacy: () => `<h1>${t('privacy')}</h1><p>We store the information you give us: your account email, your listings and the contact details you choose to publish, and messages sent through listing contact forms (delivered to the advertiser).</p><p>To show advertisers how their listings perform, we record anonymous visit statistics: the listing viewed, time, traffic source, device type and site language, linked to a random browser ID — not your name. Saved listings are kept only in your browser.</p><p>Data is stored with Supabase and the site is hosted on Vercel. We do not sell personal data. To delete your account or data, write to <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>`,
  support: () => `<h1>${t('support')}</h1><p>${t('supportBody')}</p><p><a class="btn blue" href="mailto:${SUPPORT_EMAIL}">✉ ${SUPPORT_EMAIL}</a></p>`,
};

async function route() {
  clearMaps();
  document.title = 'YourHome.asia — ' + t('heroTitle').replace(/<[^>]+>/g, '');
  const path = (location.hash.slice(1).split('?')[0] || '/').replace(/\/+$/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  const nav = parts[0] === 'search' && qs().get('view') === 'map' ? 'map' : ({ '': 'home', post: 'post', saved: 'saved', experts: 'experts', account: 'account' }[parts[0] || ''] || '');
  document.querySelectorAll('.bnav a').forEach(a => a.classList.toggle('on', a.dataset.nav === nav));
  window.scrollTo(0, 0);
  try {
    if (!parts.length) await viewHome();
    else if (parts[0] === 'search') await viewSearch();
    else if (parts[0] === 'l' && parts[1]) await viewListing(parts[1]);
    else if (parts[0] === 'post') await viewPost();
    else if (parts[0] === 'edit' && parts[1]) await viewPost(parts[1]);
    else if (parts[0] === 'account' || parts[0] === 'my') await viewAccount();
    else if (parts[0] === 'saved') await viewSaved();
    else if (parts[0] === 'experts') await viewExperts();
    else if (PAGES[parts[0]]) app.innerHTML = `<div class="wrap"><div class="page">${PAGES[parts[0]]()}</div></div>`;
    else await viewHome();
  } catch (err) { console.error(err); toast(t('error') + err.message); }
}
window.addEventListener('hashchange', route);

applyStatic();
const { data: { session } } = await sb.auth.getSession();
user = session?.user || null;
sb.auth.onAuthStateChange((ev, s) => {
  const was = user?.id; user = s?.user || null;
  if (ev === 'SIGNED_IN' && !was) {
    const next = store.get('yh_next', null); store.set('yh_next', null);
    if (location.search.includes('code=')) history.replaceState(null, '', '/' + location.hash);
    if (next) go('#/' + next); else route();
  }
});
if (location.search.includes('code=')) history.replaceState(null, '', '/' + location.hash);
const next0 = user && store.get('yh_next', null);
if (next0 && !location.hash) { store.set('yh_next', null); go('#/' + next0); } else route();
