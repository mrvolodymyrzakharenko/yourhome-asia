import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { T } from './i18n.js';
import * as AG from './agents.js';
import * as POP from './popup.js';
import * as PT from './partners.js';

const SB_URL = 'https://uuzevmbfcxtvjuguiygy.supabase.co';
const SB_KEY = 'sb_publishable__Q20CYCQEZ3YzjiEeqpxkQ_W4dW-i34';
const SUPPORT_EMAIL = 'info@yourhome.asia';
const PP = [11.5564, 104.9282];
const DISTRICTS = ['BKK1','BKK2','BKK3','Chamkar Mon','Daun Penh','Riverside','Toul Kork','Toul Tom Poung','Tonle Bassac','Sen Sok','Chroy Changvar','7 Makara','Russey Keo','Mean Chey','Chbar Ampov','Por Senchey','Dangkao','Olympic'];
const TYPES = ['apartment','condo','house','villa','room','shophouse','office','land'];
const AMEN = ['edc','pool','gym','parking','balcony','elevator','security','generator','wifi','cleaning','utilities','pets','aircon','kitchen','washer','private_bath','female_only'];
const QUICK = { rent: ['pool','gym','pets','parking'], daily: ['pool','gym','wifi','aircon'], room: ['pool','gym','private_bath','wifi','aircon','female_only'], sale: ['pool','gym','parking','security'], '': ['pool','gym','pets','parking'] };  // row 1 always shows Pool + Gym; EDC only in Filters (owner, 2026-11-24)
const CATS = [['apartment', 't_apartment'], ['condo', 't_condo'], ['studio', 'studio'], ['villa', 't_villa'], ['house', 't_house']];
const FKEYS = ['beds','furn','amen','by','foreign','baths','area','lease','days','photos','title'];
const MORE_KEYS = ['baths','area','lease','days','photos','title'];
const LEASE = ['day','month','6m','1y'];
const BUDGET = { rent: [200,400,700,1000,2000,5000], daily: [20,40,60,100,200], room: [100,200,300,500], sale: [50000,100000,200000,500000,1000000] };

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
// Wide heart (owner, 2026-11-24: "ne ilyen magas, hanem szélesebb… legyen piros, ha megnyomják")
const HEART = '<svg viewBox="0 0 26 22" aria-hidden="true"><path d="M13 20.5S2 14.2 2 7.3A5.3 5.3 0 0 1 13 4.6a5.3 5.3 0 0 1 11 2.7C24 14.2 13 20.5 13 20.5z"/></svg>';
const ICON = {
  bed: '<svg viewBox="0 0 24 24"><path d="M3 18V7m0 7h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-.01"/></svg>',
  bath: '<svg viewBox="0 0 24 24"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V5a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/></svg>',
  area: '<svg viewBox="0 0 24 24"><path d="M4 20 20 4M4 14v6h6M20 10V4h-6"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/></svg>',
  sliders: '<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
};
const LISTING_COLS = 'id,owner_id,district,deal_type,property_type,title,price,price_period,bedrooms,bathrooms,area_m2,lat,lng,photos,status,is_featured,is_demo,created_at,contact_name,amenities,posted_by,address,city';

function applyStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  document.getElementById('lang').value = lang;
  document.getElementById('year').textContent = new Date().getFullYear();
}
document.getElementById('lang').addEventListener('change', e => { lang = e.target.value; store.set('yh_lang', lang); applyStatic(); route(); });
// Footer / Support chat buttons: a channel without an address yet (Facebook) shows a "coming soon" bubble instead of opening
document.addEventListener('click', e => {
  const a = e.target.closest('.yft-ch[data-soon],.yft-s[data-soon]'); if (!a) return;
  e.preventDefault(); a.classList.add('tip-on'); clearTimeout(a._t); a._t = setTimeout(() => a.classList.remove('tip-on'), 2200);
});

// Amenity icons in the phone card's icon row (owner, 2026-11-24: "ne csak három ikon… wifi, gym, pool… 4 vagy 5")
const AM_ICON_ORDER = ['gym', 'wifi', 'pool', 'parking', 'aircon'];  // 4 icons on phones: beds · baths · two of these (owner, 2026-11-24 20:07)
const AM_ICON = {
  wifi: '<svg viewBox="0 0 24 24"><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.6 16a5 5 0 0 1 6.8 0"/><circle cx="12" cy="19.3" r="1.1"/></svg>',
  pool: '<svg viewBox="0 0 24 24"><path d="M2 17c2 0 2-1.4 4-1.4S8 17 10 17s2-1.4 4-1.4S16 17 18 17s2-1.4 4-1.4M2 21c2 0 2-1.4 4-1.4S8 21 10 21s2-1.4 4-1.4S16 21 18 21s2-1.4 4-1.4M8 14V5.5a2 2 0 0 1 4 0M16 14V5.5a2 2 0 0 0-4 0M8 9h8"/></svg>',
  gym: '<svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>',
  aircon: '<svg viewBox="0 0 24 24"><path d="M12 2v20M4 6l16 12M20 6 4 18M9 3.5 12 6l3-2.5M9 20.5 12 18l3 2.5"/></svg>',
  parking: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><path d="M9.5 17V7.5h3.2a3 3 0 0 1 0 6H9.5"/></svg>',
};
function card(l) {
  const ph = l.photos && l.photos[0] ? `<img src="${esc(l.photos[0])}" alt="" loading="lazy">` : `<span class="noimg">🏠</span>`;
  const dots = l.photos && l.photos.length > 1 ? `<div class="dots">${l.photos.slice(0, 5).map(() => '<i></i>').join('')}</div>` : '';
  const beds = l.bedrooms === 0 ? t('studio') : (l.bedrooms ?? '–');
  return `<a class="card" href="#/l/${l.id}">
    <div class="ph">${ph}
      <span class="date">${shortDate(l.created_at)}</span>
      <span class="tags">${l.is_featured ? `<span class="tag top">${t('top')}</span>` : ''}${l.is_demo ? `<span class="tag demo">${t('demo')}</span>` : ''}${l.status !== 'active' ? `<span class="tag st">${esc(t('s_' + l.status))}</span>` : ''}</span>
      <button class="heart ${isSaved(l.id) ? 'on' : ''}" data-save="${l.id}" aria-label="${esc(t('saved'))}">${HEART}</button>
      <div class="pov">${money(l.price)}<small>${priceSuffix(l)}</small></div>${dots}
      <span class="ybadges">${l.is_featured ? `<span class="yb yb-top">${t('top')}</span>` : ''}<span class="yb yb-price">${money(l.price)}${priceSuffix(l) ? ' ' + priceSuffix(l) : ''}</span><span class="yb yb-beds">${esc(l.bedrooms === 0 ? t('studio') : (l.bedrooms ?? '–') + ' ' + t(l.bedrooms === 1 ? 'bedroomOne' : 'bedrooms').toLowerCase())}</span>${l.bedrooms === 0 && l.property_type === 'studio' ? '' : `<span class="yb yb-type">${esc(t('t_' + l.property_type))}</span>`}${l.is_demo ? `<span class="yb yb-demo">${t('demo')}</span>` : ''}</span>
      ${l.photos && l.photos.length ? `<div class="ygal">${l.photos.slice(0, 12).map((u, i) => `<img src="${esc(u)}" alt="" loading="${i ? 'lazy' : 'eager'}" decoding="async">`).join('')}</div>${l.photos.length > 1 ? `<div class="ydots">${l.photos.slice(0, 12).map((u, i) => `<button type="button" data-yd="${i}" class="${i ? '' : 'on'}" aria-label="Photo ${i + 1}"></button>`).join('')}</div>` : ''}` : ''}
      <span class="ydate">${shortDate(l.created_at)}</span>
      <div class="yprice">${money(l.price)}${priceSuffix(l) ? `<small>${esc(priceSuffix(l))}</small>` : ''}</div>
      ${l.photos && l.photos.length > 1 ? `<span class="ycount"><svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>${l.photos.length}</span>` : ''}
    </div>
    <div class="cb">
      <h3 class="ct">${esc(l.title)}</h3>
      <div class="loc"><b>●</b> ${esc(t('t_' + l.property_type))} · ${esc(l.district || t('cityPP'))}</div>
      <div class="specs-row"><span>${ICON.bed}${esc(beds)}</span><span>${ICON.bath}${l.bathrooms ?? '–'}</span><span class="${AM_ICON_ORDER.filter(a => (l.amenities || []).includes(a)).length >= 2 ? 'sp-a2' : ''}">${ICON.area}${l.area_m2 ? Math.round(l.area_m2) + 'm²' : '–'}</span>${AM_ICON_ORDER.filter(a => (l.amenities || []).includes(a)).slice(0, 2).map(a => `<span class="sp-am" title="${esc(t('am_' + a))}" aria-label="${esc(t('am_' + a))}">${AM_ICON[a]}</span>`).join('')}</div>
      <p class="yname"><span class="yn1">${esc(t(l.deal_type === 'sale' ? 'nameSale' : 'nameRent', { x: t('t_' + (l.deal_type === 'room' ? 'room' : l.property_type)) }))}</span>${l.district ? ` <span class="yn2">${esc(t('inPlace', { d: l.district }))}</span>` : ''}</p>
      <p class="yl1"><b>${esc(l.bedrooms === 0 ? t('studio') : (l.bedrooms ?? '–') + ' ' + t(l.bedrooms === 1 ? 'bedroomOne' : 'bedrooms').toLowerCase())}</b><span class="yty">${esc(t('t_' + l.property_type))}</span><em>${esc(t(l.deal_type === 'sale' ? 'forSaleShort' : l.deal_type === 'room' ? 't_room' : l.price_period === 'day' ? 'daily' : 'rent'))}</em><b>${l.bathrooms ?? '–'} ${esc(t('bathrooms').toLowerCase())}</b><b>${l.area_m2 ? Math.round(l.area_m2) + ' m²' : '– m²'}</b><b>${esc(l.posted_by ? t('by_' + l.posted_by) : shortDate(l.created_at))}</b></p>
      <div class="yfoot"><p class="ymeta"><svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg><span class="yaddr"><span class="ya1">${esc(!l.city || l.city === 'Phnom Penh' ? t('cityPP') : l.city)},</span> <span class="ya2">${esc(l.address || t('cambodia'))}</span></span></p>
      <span class="ylink">${esc(t('clickView', { x: t(l.deal_type === 'room' || l.property_type === 'room' ? 't_room' : ['house', 'villa'].includes(l.property_type) ? 't_' + l.property_type : 't_apartment').toLowerCase() }))} <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div>
    </div></a>`;
}
// 10 categories, 5 + 5 (owner, 2026-11-24): the 5th top item "Projects" opens New projects
document.addEventListener('click', e => { const b = e.target.closest('#dealTabs [data-go]'); if (!b) return; e.preventDefault(); e.stopPropagation(); location.hash = b.dataset.go; }, true);
// Phone card photo slider like vietrent (owner, 2026-11-24: "pöttyök… ha rákattint a pöttyre, a képek mozognak a kártyán belül"):
// swipe the photos sideways or tap a dot; the dots follow. A tap on the photo itself still opens the listing.
document.addEventListener('click', e => {
  const d = e.target.closest('.ydots button'); if (!d) return;
  e.preventDefault(); e.stopPropagation();
  const g = d.closest('.ph').querySelector('.ygal'); g.scrollTo({ left: g.clientWidth * Number(d.dataset.yd), behavior: 'smooth' });
}, true);
document.addEventListener('scroll', e => {
  const g = e.target; if (!g.classList || !g.classList.contains('ygal')) return;
  const i = Math.round(g.scrollLeft / Math.max(1, g.clientWidth));
  g.parentElement.querySelectorAll('.ydots button').forEach((b, k) => b.classList.toggle('on', k === i));
}, true);
document.addEventListener('click', e => {
  const b = e.target.closest('[data-save]'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  const id = b.dataset.save; let s = saved();
  if (s.includes(id)) s = s.filter(x => x !== id); else { s.unshift(id); track({ id, status: 'active' }, 'save'); }
  store.set('yh_saved', s.slice(0, 200));
  b.classList.toggle('on', s.includes(id));
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
  if (f.deal === 'daily') q = q.eq('deal_type', 'rent').eq('price_period', 'day');   // Daily rent tab (owner, 2026-11-24)
  else if (f.deal) q = q.eq('deal_type', f.deal);
  if (f.type) q = q.eq('property_type', f.type);
  if (f.max) q = q.lte('price', Number(f.max));
  if (f.beds) q = f.beds === '0' ? q.eq('bedrooms', 0) : q.gte('bedrooms', Number(f.beds));
  if (f.furn) q = q.eq('furnished', true);
  const amen = String(f.amen || '').split(',').filter(a => AMEN.includes(a));
  if (amen.length) q = q.contains('amenities', amen);
  if (f.by === 'owner' || f.by === 'agent') q = q.eq('posted_by', f.by);
  if (f.foreign) q = q.eq('foreigner_ok', true);
  if (f.baths) q = q.gte('bathrooms', Number(f.baths));
  if (f.area) q = q.gte('area_m2', Number(f.area));
  if (f.days) q = q.gte('created_at', new Date(Date.now() - Number(f.days) * 864e5).toISOString());
  if (f.photos) q = q.neq('photos', '{}');
  if (['hard','soft','strata'].includes(f.title)) q = q.eq('title_type', f.title);
  const ors = [];
  if (LEASE.includes(f.lease)) ors.push(`min_lease.is.null,min_lease.in.(${LEASE.slice(0, LEASE.indexOf(f.lease) + 1).join(',')})`);
  if (f.owner) q = q.eq('owner_id', f.owner);
  if (f.q) { const s = f.q.replace(/[,()%*\\]/g, ' ').trim().slice(0, 60); if (s) ors.push(`district.ilike.%${s}%,title.ilike.%${s}%,address.ilike.%${s}%`); }
  if (ors.length === 1) q = q.or(ors[0]); else if (ors.length) q = q.or(`and(${ors.map(o => `or(${o})`).join(',')})`);
  if (f.ids) q = q.in('id', f.ids);
  const sort = f.sort || 'new';
  q = sort === 'cheap' ? q.order('price', { ascending: true }) : sort === 'exp' ? q.order('price', { ascending: false }) : q.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  const { data, error } = await q.limit(f.limit || 300);
  if (error) { toast(t('error') + error.message); return []; }
  return data;
}

const dealRow = (deal, cat, id) => `<div class="deal-tabs" id="${id}">${['rent','daily','sale','room'].map(d => `<button type="button" data-deal="${d}" class="dt-deal ${d === deal ? 'on' : ''}">${t(d === 'sale' ? 'buy' : d)}</button>`).join('')}<button type="button" class="dt-deal dt-prj" data-go="#/projects">${t('projectsShort')}</button><span class="dt-sep" aria-hidden="true"></span>${CATS.map(([k, lab]) => `<button type="button" class="dt-cat ${k === cat ? 'on' : ''}" data-cat="${k}">${t(lab)}</button>`).join('')}</div>`;
function searchBox(p = {}, deal = p.deal || 'rent', cat = '') {
  return `${dealRow(deal, cat, 'dealTabs')}
  <form class="sbox" id="sbox">
    <div class="f"><label>${t('city')}</label><select disabled><option>${t('cityPP')}</option></select></div>
    <div class="f addr"><label><span class="mf-l">📍 </span>${t('district')}</label><select name="q" aria-label="${esc(t('district'))}"><option value="">${t('any')}</option>${(p.q && !DISTRICTS.includes(p.q) ? [p.q, ...DISTRICTS] : DISTRICTS).map(d => `<option value="${esc(d)}"${d === p.q ? ' selected' : ''}>${esc(d)}</option>`).join('')}</select></div>
    <div class="f"><label><span class="mf-l">${t('type')}</span><span class="mf-s">${t('typeShort')}</span></label><select name="type"><option value="">${t('any')}</option>${TYPES.map(x => `<option value="${x}" ${p.type === x ? 'selected' : ''}>${t('t_' + x)}</option>`).join('')}</select></div>
    <div class="f"><label>${t('budget')}</label><select name="max" id="maxSel">${budgetOpts(deal || 'rent', p.max)}</select></div>
    <div class="sbtns"><a href="#/post" class="btn red sb-post">+ ${t('post')}</a><button class="btn blue">${t('search')} →</button></div>
  </form>
  <div class="chipbox home" id="chipBox">${chipRow(p, deal)}</div>`;
}
const budgetOpts = (deal, cur) => `<option value="">${t('any')}</option>` + BUDGET[deal].map(v => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>≤ ${money(v)}</option>`).join('');
function wireSearchBox(onSubmit) {
  let deal = document.querySelector('#dealTabs .on').dataset.deal;
  document.getElementById('dealTabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.cat) { const p = new URLSearchParams({ deal: deal === 'room' ? 'rent' : deal }); b.dataset.cat === 'studio' ? p.set('beds', '0') : p.set('type', b.dataset.cat); return go('#/search?' + p); } deal = b.dataset.deal; document.querySelectorAll('#dealTabs button').forEach(x => x.classList.toggle('on', x === b)); document.getElementById('maxSel').innerHTML = budgetOpts(deal); onSubmit && onSubmit(deal, true); };
  document.getElementById('sbox').onsubmit = e => { e.preventDefault(); onSubmit(deal); };
  return () => deal;
}
let panelOpen = false;
function chipRow(st, deal) {
  const amen = String(st.amen || '').split(',').filter(Boolean);
  const quick = QUICK[deal || ''];
  const on = (k, v) => k === 'amen' ? amen.includes(v) : String(st[k] ?? '') === v;
  const chip = (k, v, label) => `<button type="button" class="chip ${on(k, v) ? 'on' : ''}" data-k="${k}" data-v="${v}">${label}</button>`;
  const nMore = MORE_KEYS.filter(k => st[k]).length + amen.filter(a => !quick.includes(a)).length;
  const sel = (k, opts, lab) => `<label>${lab}<select data-k="${k}"><option value="">${t('any')}</option>${opts.map(([v, l]) => `<option value="${v}" ${String(st[k] ?? '') === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
  // two rows only (owner, 2026-11-24): 1) quick filters as text with dividers – on phones beds + furnished, the rest move
  // into More filters (.q-x / .mp-q); 2) More filters | Listings | Map
  return `<div class="chips qrow">
    ${chip('beds', '1', t('bed1'))}${['2', '3'].map(n => chip('beds', n, t('bedN', { n }))).join('')}
    ${deal === 'sale' ? chip('foreign', '1', t('f_foreign')) : chip('furn', '1', t('furnished'))}
    ${quick.map((a, i) => chip('amen', a, a === 'edc' ? `<span class="mf-l">${t('am_edc')}</span><span class="mf-s">EDC</span>` : t('am_' + a)).replace('class="chip', 'class="chip q-x' + (i < 2 ? ' q-x1' : ''))).join('')}
    ${chip('by', 'owner', t('f_owner')).replace('class="chip', 'class="chip q-x')}
  </div>
  <div class="frow"><button type="button" class="chip more ${nMore ? 'on' : ''}" data-more aria-expanded="${panelOpen}">${ICON.sliders}<span class="mf-l">${t('moreFilters')}</span><span class="mf-s">${t('filters')}</span>${nMore ? ` (${nMore})` : ''}</button>${viewSwitch(st)}</div>
  <div class="more-panel" ${panelOpen ? '' : 'hidden'}><button type="button" class="mp-x" data-more aria-label="${esc(t('close'))}" title="${esc(t('close'))}">×</button>
    <div class="mp-grid">
      ${sel('baths', [1, 2, 3].map(n => [n, n + '+']), t('bathrooms'))}
      ${sel('area', [30, 50, 80, 120, 200].map(n => [n, n + '+ m²']), t('minArea'))}
      ${deal === 'sale' ? sel('title', ['hard', 'soft', 'strata'].map(x => [x, t('tt_' + x)]), t('titleType')) : sel('lease', LEASE.map(x => [x, t('l_' + x)]), t('lease'))}
      ${sel('days', [1, 7, 30].map(n => [n, t('d_' + n)]), t('listedWithin'))}
    </div>
    <div class="mp-lab">${t('amenities')}</div>
    <div class="chips">${quick.slice(2).map(a => chip('amen', a, t('am_' + a)).replace('class="chip', 'class="chip mp-q')).join('')}${chip('by', 'owner', t('f_owner')).replace('class="chip', 'class="chip mp-q')}${AMEN.filter(a => !quick.includes(a) && (deal === 'room' || !['private_bath', 'female_only'].includes(a))).map(a => chip('amen', a, t('am_' + a))).join('')}${chip('photos', '1', '📷 ' + t('withPhotos'))}${deal === 'sale' ? '' : chip('by', 'agent', t('by_agent'))}</div>
    <div class="mp-act"><button type="button" class="btn ghost sm" data-reset>${t('resetFilters')}</button><button type="button" class="btn blue sm" data-more>${t('close')}</button></div>
  </div>`;
}
function wireChips(root, st, onChange) {
  root.onclick = e => {
    if (e.target.closest('[data-more]')) { panelOpen = !panelOpen; const pn = root.querySelector('.more-panel'); pn.hidden = !panelOpen; root.querySelector('.chip.more').setAttribute('aria-expanded', panelOpen); return; }
    if (e.target.closest('[data-reset]')) { FKEYS.forEach(k => delete st[k]); return onChange(st); }
    const c = e.target.closest('.chip[data-k]'); if (!c) return;
    const { k, v } = c.dataset;
    if (k === 'amen') { let a = String(st.amen || '').split(',').filter(Boolean); a = a.includes(v) ? a.filter(x => x !== v) : [...a, v]; a.length ? st.amen = a.join(',') : delete st.amen; }
    else if (String(st[k] ?? '') === v) delete st[k]; else st[k] = v;
    onChange(st);
  };
  root.onchange = e => { const s = e.target.closest('select[data-k]'); if (!s) return; s.value ? st[s.dataset.k] = s.value : delete st[s.dataset.k]; onChange(st); };
}
const postCard = () => `<a class="card" href="#/post" style="border:2px dashed #c7d2fe;box-shadow:none;background:#fbfcff"><div class="ph" style="background:#e8edfb"><span style="position:relative;z-index:2;width:64px;height:64px;border-radius:50%;background:#E00025;color:#fff;font-size:38px;display:grid;place-items:center;box-shadow:0 8px 20px rgba(224,0,37,.3);line-height:1">+</span></div><div class="cb"><h3 class="ct" style="color:#E00025">${t('post')}</h3><div class="loc">${t('postSub')}</div></div></a>`;
const fill4 = list => { const items = list.slice(0, 4).map(card); while (items.length < 4) items.push(postCard()); return items.join(''); };
function block(title, list, more) {
  if (!list.length) return '';
  return `<section class="block"><div class="bh"><h2>${title}</h2><a class="more" href="${more}">${t('seeAll')}</a></div><div class="row4">${fill4(list)}</div><div class="block-more"><a class="btn ghost" href="${more}">${title} · ${t('seeAll')}</a></div></section>`;
}
const hero = (p = {}, deal, cat) => `<section class="hero"><h1 style="white-space:nowrap;font-size:clamp(26px,3.7vw,46px)">${t('heroTitle')}</h1><p>${t('heroSub')}</p>${searchBox(p, deal, cat)}</section>`;
// List / Map switch under the search card on the homepage and the results page (owner, 2026-11-24: "hiányzik a térképes
// nézetgomb és a listing… legyen kiírva map… nagyon fontos")
const viewSwitch = (p = {}) => { const m = p.view === 'map'; return `<div class="vsw" role="group" aria-label="View"><a href="#/search" data-v="grid" class="${m ? '' : 'on'}">${ICON.grid}<span>${t('listing1')}</span></a><a href="#/search?view=map" data-v="map" class="${m ? 'on' : ''}">${ICON.map}<span>${t('mapNav')}</span></a></div>`; };
async function viewHome() {
  app.innerHTML = `<div class="wrap">${hero()}
    <div class="cta"><div><span class="ic">+</span>${t('ctaText')}</div><a href="#/post" class="btn">${t('ctaBtn')} →</a></div>
    <div id="blocks"><div class="empty">${t('loading')}</div></div></div>`;
  let st = {};
  const box = document.getElementById('chipBox');
  const drawChips = () => { box.innerHTML = chipRow(st, getDeal()); };
  wireChips(box, st, drawChips);
  const getDeal = wireSearchBox((deal, tabOnly) => {
    if (tabOnly) { FKEYS.forEach(k => delete st[k]); return drawChips(); }
    const f = new FormData(document.getElementById('sbox')); const p = new URLSearchParams({ deal });
    for (const k of ['q', 'type', 'max']) if (f.get(k)) p.set(k, f.get(k));
    for (const k of FKEYS) if (st[k]) p.set(k, st[k]);
    go('#/search?' + p);
  });
  const all = await fetchListings({ limit: 300 });
  const rent = all.filter(l => l.deal_type === 'rent');
  const html = block(t('recommended'), all.filter(l => l.is_featured).concat(all.filter(l => !l.is_featured)), '#/search?sort=new')
    + block(t('newest'), [...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), '#/search?sort=new')
    + block(t('cheapest'), rent.filter(l => l.price_period !== 'day').sort((a, b) => a.price - b.price), '#/search?deal=rent&sort=cheap')
    + block(t('rooms'), all.filter(l => l.deal_type === 'room'), '#/search?deal=room')
    + block(t('dailyBlock'), rent.filter(l => l.price_period === 'day'), '#/search?deal=daily')
    + block(t('forSale'), all.filter(l => l.deal_type === 'sale'), '#/search?deal=sale');
  const prj = await PT.homeBlock();   // New projects block (owner, 2026-11-24)
  const b0 = document.getElementById('blocks'); if (!b0) return;
  b0.innerHTML = (all.some(l => l.is_demo) ? `<p class="ysample">${t('sampleNote')}</p>` : '') + ((html + prj) || `<div class="empty">${t('noResults')}</div>`);
}

async function viewSearch() {
  const p = Object.fromEntries(qs());
  const view = p.view === 'map' ? 'map' : 'grid';
  const deal = p.deal || '';
  const cat = p.beds === '0' ? 'studio' : (CATS.some(([k]) => k === p.type) ? p.type : '');
  app.innerHTML = `<div class="wrap">${hero(p, deal, cat)}
    <div class="bh"><h2 id="rc">${t('loading')}</h2></div>
    <div id="res"></div></div>`;
  // Results tools in the filters' second row (owner, 2026-11-24: "a Telegram alerts oda nem kell kiírni, hanem egy Telegram
  // logó… ha rámegy, kiírja… ne legyen kiírva, hogy sort, csak newest… lenyílik… két sorba, nem háromba"):
  // More filters | Listings | Map | Telegram logo (bubble on hover) | Newest ▾
  document.querySelector('#chipBox .frow').insertAdjacentHTML('beforeend', `<button type="button" class="ftg" id="notifyBtn" aria-label="${esc(t('notify'))}" data-tip="${esc(t('notify'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 4.1 3.1 10.9c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.3c.2.6.1.8.7.8.5 0 .7-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14.3c.3-1.2-.5-1.8-1.4-1.5zM8.9 13.6l8.6-5.4c.4-.3.8-.1.5.2l-7.4 6.7-.3 3.1-1.4-4.6z"/></svg><span>${t('subscribe')}</span></button><label class="fsort"><select id="sortSel" aria-label="${esc(t('sort'))}"><option value="new">${t('sortNew')}</option><option value="cheap" ${p.sort === 'cheap' ? 'selected' : ''}>${t('sortCheap')}</option><option value="exp" ${p.sort === 'exp' ? 'selected' : ''}>${t('sortExp')}</option></select></label>`);
  const upd = ch => { const n = new URLSearchParams(qs()); for (const k in ch) ch[k] ? n.set(k, ch[k]) : n.delete(k); go('#/search?' + n); };
  const st = {}; FKEYS.forEach(k => { if (p[k]) st[k] = p[k]; });
  wireChips(document.getElementById('chipBox'), st, s => upd(Object.fromEntries(FKEYS.map(k => [k, s[k] || '']))));
  document.getElementById('dealTabs').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.deal) return upd({ deal: b.dataset.deal, max: '' });
    const k = b.dataset.cat;
    if (k === 'studio') return upd({ beds: p.beds === '0' ? '' : '0' });
    upd({ type: p.type === k ? '' : k, beds: p.beds === '0' ? '' : p.beds });
  };
  document.getElementById('sbox').onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); upd({ q: f.get('q'), type: f.get('type'), max: f.get('max') }); };
  document.getElementById('sortSel').onchange = e => upd({ sort: e.target.value === 'new' ? '' : e.target.value });
  document.getElementById('chipBox').addEventListener('click', e => { const b = e.target.closest('.vsw a'); if (!b) return; e.preventDefault(); e.stopPropagation(); upd({ view: b.dataset.v === 'map' ? 'map' : '' }); }, true);
  document.getElementById('notifyBtn').onclick = () => alertModal(p);
  const list = await fetchListings(p);
  document.getElementById('rc').textContent = t('results', { n: list.length });
  const res = document.getElementById('res');
  if (!list.length) { res.innerHTML = `<div class="empty">${t('noResults')}<br><br><a class="btn red" href="#/post">+ ${t('post')}</a></div>`; return; }
  if (view === 'map') { res.innerHTML = '<div id="map"></div>'; listingsMap(document.getElementById('map'), list); }
  else res.innerHTML = (list.some(l => l.is_demo) ? `<p class="ysample">${t('sampleNote')}</p>` : '') + `<div class="grid">${list.map(card).join('')}</div>`;
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
    const f = {}; for (const k of ['deal','type','max','q', ...FKEYS]) if (filters[k]) f[k] = filters[k];
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
      <div class="loc" style="font-size:13px"><b>●</b> ${esc([l.address, l.district, t('cityPP')].filter(Boolean).join(', '))}</div>
      <div class="bigprice">${money(l.price)} <small>${priceSuffix(l)}</small></div>
      <div class="specs"><div class="spec"><b>${esc(beds)}</b><span>${t('bedrooms')}</span></div><div class="spec"><b>${l.bathrooms ?? '–'}</b><span>${t('bathrooms')}</span></div><div class="spec"><b>${l.area_m2 ? Math.round(l.area_m2) : '–'}</b><span>${t('area')}</span></div><div class="spec"><b>${l.furnished ? '✓' : '–'}</b><span>${t('furnished')}</span></div></div>
      ${detailFacts(l)}
      ${l.description ? `<h3>${t('description')}</h3><div class="desc">${esc(l.description)}</div>` : ''}
    </div><div id="agLinks"></div>
    ${l.lat && l.lng ? `<div class="panel"><h3>${t('location')}</h3><div class="mini-map" id="mmap"></div></div>` : ''}
  </div>
  <aside><div class="sticky"><div id="agBox"></div>
    <div class="panel"><h3>${t('contactOwner')}</h3>${l.contact_name ? `<p style="margin:0 0 12px;font-weight:600">${esc(l.contact_name)}</p>` : ''}
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
  AG.listingExtras(l);
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

function detailFacts(l) {
  const facts = [l.posted_by && `${t('postedBy')}: ${t('by_' + l.posted_by)}`, l.min_lease && `${t('minLease')}: ${t('l_' + l.min_lease)}`,
    l.title_type && t('tt_' + l.title_type), l.foreigner_ok && t('foreignerOk')].filter(Boolean);
  const am = (l.amenities || []).filter(a => AMEN.includes(a));
  if (!facts.length && !am.length) return '';
  return `${am.length ? `<h3>${t('amenities')}</h3>` : ''}<div class="chips static">${[...facts.map(f => `<span class="chip on">${esc(f)}</span>`), ...am.map(a => `<span class="chip">✓ ${esc(t('am_' + a))}</span>`)].join('')}</div>`;
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
    const last = store.get('yh_contact', null) || user?.user_metadata?.contact || {}; Object.assign(l, last);
  }
  let photos = [...(l.photos || [])];
  const agBlock = await AG.postBlock(l, !editId);
  const sel = (name, opts, cur) => `<select name="${name}">${opts.map(([v, lab]) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`).join('')}</select>`;
  app.innerHTML = `<div class="wrap"><form class="narrow panel form" id="pform">
    <h1 style="margin:0">${editId ? t('editTitle') : t('postTitle')}</h1>
    <div class="row"><label>${t('dealType')} *${sel('deal_type', [['rent', t('rent')], ['daily', t('dailyRent')], ['sale', t('buy')], ['room', t('room')]], l.deal_type === 'rent' && l.price_period === 'day' ? 'daily' : l.deal_type)}</label>
      <label>${t('propType')} *${sel('property_type', TYPES.map(x => [x, t('t_' + x)]), l.property_type)}</label></div>
    <label>${t('title')} *<input name="title" required minlength="5" maxlength="140" placeholder="${esc(t('titlePh'))}" value="${esc(l.title || '')}"></label>
    <div class="row"><label>${t('price')} *<input name="price" type="number" min="0" step="1" required value="${l.price ?? ''}"></label>
      <label>${t('period')}${sel('price_period', [['month', t('p_month')], ['day', t('p_day')], ['total', t('p_total')]], l.price_period)}</label></div>
    <div class="row3"><label>${t('bedrooms')}<input name="bedrooms" type="number" min="0" max="50" value="${l.bedrooms ?? ''}" placeholder="0 = ${esc(t('studio'))}"></label>
      <label>${t('bathrooms')}<input name="bathrooms" type="number" min="0" max="50" value="${l.bathrooms ?? ''}"></label>
      <label>${t('area')}<input name="area_m2" type="number" min="0" step="0.1" value="${l.area_m2 ?? ''}"></label></div>
    <label class="chk"><input type="checkbox" name="furnished" ${l.furnished ? 'checked' : ''}> ${t('furnished')}</label>
    <div class="row"><label>${t('postedBy')}${sel('posted_by', [['', t('notSet')], ['owner', t('by_owner')], ['agent', t('by_agent')]], l.posted_by ?? '')}</label>
      <label>${t('minLease')}${sel('min_lease', [['', t('notSet')], ...LEASE.map(x => [x, t('l_' + x)])], l.min_lease ?? '')}</label></div>
    <div class="row"><label>${t('titleType')} (${t('saleOnly')})${sel('title_type', [['', t('notSet')], ...['hard', 'soft', 'strata'].map(x => [x, t('tt_' + x)])], l.title_type ?? '')}</label>
      <label class="chk" style="align-self:end;padding-bottom:10px"><input type="checkbox" name="foreigner_ok" ${l.foreigner_ok ? 'checked' : ''}> ${t('foreignerOk')} (${t('saleOnly')})</label></div>
    <div><div class="mp-lab" style="margin-top:0">${t('amenities')}</div><div class="amen-pick">${AMEN.map(a => `<label class="chk"><input type="checkbox" name="amen" value="${a}" ${(l.amenities || []).includes(a) ? 'checked' : ''}> ${t('am_' + a)}</label>`).join('')}</div></div>
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
    ${agBlock}
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
    const files = [...e.target.files].slice(0, 12 - photos.length);   // up to 12 photos (owner, 2026-11-24)
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
    const fd = new FormData(e.target); const f = Object.fromEntries(fd);
    const num = v => v === '' || v == null ? null : Number(v);
    const row = {
      deal_type: f.deal_type === 'daily' ? 'rent' : f.deal_type, property_type: f.property_type, title: f.title.trim(), description: f.description.trim() || null,
      price: Number(f.price), price_period: f.deal_type === 'sale' ? 'total' : f.deal_type === 'daily' ? 'day' : f.price_period,
      bedrooms: num(f.bedrooms), bathrooms: num(f.bathrooms), area_m2: num(f.area_m2), furnished: !!f.furnished,
      amenities: fd.getAll('amen').filter(a => AMEN.includes(a)), posted_by: f.posted_by || null,
      min_lease: f.deal_type === 'sale' ? null : (f.min_lease || null),
      title_type: f.deal_type === 'sale' ? (f.title_type || null) : null, foreigner_ok: f.deal_type === 'sale' ? !!f.foreigner_ok : null,
      district: f.district, address: f.address.trim() || null, lat: pos ? pos[0] : null, lng: pos ? pos[1] : null, photos,
      contact_name: f.contact_name.trim() || null, contact_phone: f.contact_phone.trim() || null,
      contact_telegram: f.contact_telegram.trim() || null, contact_whatsapp: f.contact_whatsapp.trim() || null,
    };
    const ag = AG.postValues(e.target); if (!ag) { btn.disabled = false; return; }
    Object.assign(row, ag);
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
  const [{ data: vreqs = [] }, { data: myAgents = [] }] = await Promise.all([
    sb.from('yh_verify_requests').select('status,method,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
    sb.from('yh_agents').select('verified_at').eq('owner_id', user.id),
  ]);
  const vState = (myAgents || []).some(a => a.verified_at) || vreqs?.[0]?.status === 'verified' ? 'done' : vreqs?.[0]?.status === 'pending' ? 'pending' : vreqs?.[0]?.status === 'rejected' ? 'rejected' : '';
  const ids = (mine || []).map(l => l.id);
  const [{ data: ev = [] }, { data: inq = [] }] = ids.length ? await Promise.all([
    sb.from('yh_events').select('listing_id,kind,visitor,source,device,lang,created_at').in('listing_id', ids).gte('created_at', since).order('created_at', { ascending: false }).limit(5000),
    sb.from('yh_inquiries').select('*').in('listing_id', ids).order('created_at', { ascending: false }).limit(500),
  ]) : [{ data: [] }, { data: [] }];
  const byId = Object.fromEntries((mine || []).map(l => [l.id, l]));
  const views = ev.filter(e => e.kind === 'view');
  const contacts = ev.filter(e => ['phone', 'telegram', 'whatsapp'].includes(e.kind));
  const uniq = new Set(views.map(e => e.visitor)).size;
  const bigCard = (href, icon, title, sub, red) => `<a href="${href}" class="panel" style="text-decoration:none;color:inherit;display:block;margin:0;${red ? 'background:var(--red);color:#fff' : ''}"><div style="font-size:30px">${icon}</div><div style="font-weight:600;font-size:13px;letter-spacing:-.025em;margin-top:6px">${title}</div><div style="opacity:.75;font-size:13px">${sub}</div></a>`;
  const tabs = ['overview', 'agent', 'listings', 'messages', 'stats', 'telegram', 'settings'];
  const tabLabel = { overview: t('overview'), agent: AG.label('myAgent'), listings: t('my'), messages: t('inquiries'), stats: t('stats'), telegram: t('tgAlerts'), settings: '⚙️ ' + t('settings') };
  let body = '';
  if (tab === 'overview') {
    body = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
      ${bigCard('#/post', '＋', t('post'), t('postSub'))}
      ${bigCard('#/account?tab=settings&v=1', vState === 'done' ? '✅' : '🛡️', vState === 'done' ? t('v_done') : t('v_cardTitle'), vState === 'pending' ? '⏳ ' + t('v_pending') : vState === 'done' ? t('v_cardDone') : t('v_cardSub'))}
      ${bigCard('#/account?tab=agent', '👤', AG.label('myAgent'), AG.label('agentSub'))}
      ${bigCard('#/account?tab=listings', '🏠', t('my'), String(mine.length))}
      ${bigCard('#/account?tab=messages', '✉️', t('inquiries'), String(inq.length))}
      ${bigCard('#/account?tab=stats', '📊', t('stats'), `${views.length} ${t('views').toLowerCase()} · ${t('last30').toLowerCase()}`)}
      ${bigCard('#/account?tab=telegram', '🔔', t('tgAlerts'), alerts.length ? `${t('tgActive')} ${esc(alerts[0].telegram)}` : t('tgAlertsSub'))}
      ${bigCard('#/account?tab=settings', '⚙️', t('settings'), vState === 'done' ? t('v_done') : vState === 'pending' ? t('v_pending') : t('settingsSub'))}
    </div>${statTiles()}`;
  } else if (tab === 'listings') {
    body = mine.length ? mine.map(l => `<div class="mine"><a href="#/l/${l.id}" class="ph">${l.photos?.[0] ? `<img src="${esc(l.photos[0])}" alt="">` : '<span class="noimg">🏠</span>'}</a>
      <div style="min-width:0"><div class="ct">${esc(l.title)}</div><div style="color:var(--red);font-weight:600">${money(l.price)}${priceSuffix(l)}</div>
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
      <div class="panel"><h3>${t('perListing')}</h3><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr style="text-align:left;color:var(--muted)"><th style="padding:6px">${t('what')}</th><th>👁 ${t('views')}</th><th>${t('visitors')}</th><th>📞 ${t('contacts')}</th><th>✉️</th></tr>
        ${mine.map(l => { const v = views.filter(e => e.listing_id === l.id); return `<tr style="border-top:1px solid var(--line)"><td style="padding:8px 6px"><a href="#/l/${l.id}">${esc(l.title)}</a></td><td>${v.length}</td><td>${new Set(v.map(e => e.visitor)).size}</td><td>${contacts.filter(e => e.listing_id === l.id).length}</td><td>${inq.filter(i => i.listing_id === l.id).length}</td></tr>`; }).join('')}
      </table></div></div>
      <div class="panel"><h3>${t('activity')}</h3><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr style="text-align:left;color:var(--muted)"><th style="padding:6px">${t('when')}</th><th>${t('what')}</th><th>${t('action')}</th><th>${t('from')}</th><th>${t('device')}</th><th>🌐</th></tr>
        ${ev.slice(0, 100).map(e => `<tr style="border-top:1px solid var(--line)"><td style="padding:7px 6px;white-space:nowrap">${dateTime(e.created_at)}</td><td>${esc(byId[e.listing_id]?.title || '')}</td><td>${t('a_' + e.kind)}</td><td>${esc(e.source === 'direct' ? t('direct') : e.source || '')}</td><td>${t(e.device || 'desktop')}</td><td>${esc((e.lang || '').toUpperCase())}</td></tr>`).join('')}
      </table></div></div>` : `<div class="empty">${t('noStats')}</div>`);
  } else if (tab === 'agent') {
    body = '<div id="agTab"></div>';
  } else if (tab === 'settings') {
    const md = user.user_metadata || {}, c = Object.assign({}, md.contact || {}, store.get('yh_contact', {}));
    const vBox = vState === 'done' ? `<p style="margin:0;font-weight:600;color:var(--red)">${t('v_done')}</p>`
      : vState === 'pending' ? `<p style="margin:0;font-weight:600">⏳ ${t('v_pending')}</p>`
      : `${vState === 'rejected' ? `<p style="margin:0;color:var(--muted)">${t('v_rejected')}</p>` : ''}
        <label>${t('v_method')}<select name="method">${['phone', 'video', 'telegram', 'whatsapp'].map(m => `<option value="${m}">${t('m_' + m)}</option>`).join('')}</select></label>
        <label>${t('v_contact')}<input name="contact" required minlength="3" maxlength="80" value="${esc(c.contact_phone || c.contact_telegram || '')}"></label>
        <label>${t('v_time')}<input name="time" maxlength="120" placeholder="${esc(t('v_timePh'))}"></label>
        <label>${t('v_note')}<textarea name="note" maxlength="1000" rows="3"></textarea></label>
        <button class="btn red">${t('v_send')}</button>`;
    body = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;align-items:start">
      <form class="panel form" id="setform" style="margin:0"><h3>👤 ${t('s_account')}</h3>
        <label>${t('s_name')}<input name="name" maxlength="80" value="${esc(md.full_name || '')}"></label>
        <label>${t('s_email')}<input value="${esc(user.email || '')}" disabled></label>
        <h3 style="margin-top:10px">📇 ${t('s_contacts')}</h3><p style="margin:0;color:var(--muted)">${t('s_contactsSub')}</p>
        <label>${t('s_phone')}<input name="contact_phone" maxlength="40" value="${esc(c.contact_phone || '')}"></label>
        <label>Telegram<input name="contact_telegram" maxlength="64" placeholder="@username" value="${esc(c.contact_telegram || '')}"></label>
        <label>WhatsApp<input name="contact_whatsapp" maxlength="40" value="${esc(c.contact_whatsapp || '')}"></label>
        <button class="btn blue">${t('s_save')}</button>
        <button type="button" class="btn ghost sm" id="logout2" style="justify-self:start">${t('s_signout')}</button></form>
      <form class="panel form" id="verform" style="margin:0"><h3>✓ ${t('v_title')}</h3><p style="margin:0;color:var(--muted)">${t('v_sub')}</p>${vBox}</form>
    </div>`;
  } else if (tab === 'telegram') {
    body = `<form class="panel form" id="tgform" style="max-width:560px"><h3>🔔 ${t('tgAlerts')}</h3><p style="margin:0;color:var(--muted)">${t('tgAlertsSub')}</p>
      ${alerts.length ? `<p style="margin:0;font-weight:600">✓ ${t('tgActive')} ${esc(alerts[0].telegram)}</p>` : ''}
      <label>${t('tgUser')}<input name="tg" placeholder="@username" value="${esc(alerts[0]?.telegram || '')}" required></label>
      <button class="btn blue">${t('tgSave')}</button></form>`;
  }
  function statTiles() {
    const tile = (n, lab) => `<div class="panel" style="margin:0;text-align:center"><div style="font-size:13px;font-weight:600;letter-spacing:-.025em;color:var(--blue)">${n}</div><div style="color:var(--muted);font-size:13px;font-weight:600">${lab}</div></div>`;
    return `<h3 style="margin:28px 0 12px">${t('stats')} · ${t('last30')}</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:18px">${tile(views.length, t('views'))}${tile(uniq, t('visitors'))}${tile(contacts.length, t('contacts'))}${tile(inq.filter(i => i.created_at >= since).length, t('messagesN'))}</div>`;
  }
  app.innerHTML = `<div class="wrap" style="margin-top:26px">
    <div class="bh"><div><div style="color:var(--muted);font-weight:600">${t('dash')}</div><h2>${t('hello')}, ${esc(user.user_metadata?.full_name || user.email)}</h2></div><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn blue sm" href="#/">${t('backSite')}</a><a class="btn ghost sm" href="#/account?tab=settings">⚙️ ${t('settings')}</a><button class="btn ghost sm" id="logout">${t('logout')}</button></div></div>
    <div class="deal-tabs" style="overflow-x:auto;max-width:100%">${tabs.map(x => `<button data-tab="${x}" class="${x === tab ? 'on' : ''}">${tabLabel[x]}</button>`).join('')}</div>
    <div>${body}</div></div>`;
  if (tab === 'agent') AG.accountTab(document.getElementById('agTab'));
  app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => go('#/account' + (b.dataset.tab === 'overview' ? '' : '?tab=' + b.dataset.tab)));
  document.getElementById('logout').onclick = async () => { await sb.auth.signOut(); go('#/'); };
  const lo2 = document.getElementById('logout2'); if (lo2) lo2.onclick = async () => { await sb.auth.signOut(); go('#/'); };
  const sf = document.getElementById('setform');
  if (sf) sf.onsubmit = async e => {
    e.preventDefault(); const f = new FormData(sf), name = String(f.get('name') || '').trim();
    const contact = { contact_name: name, contact_phone: String(f.get('contact_phone') || '').trim(), contact_telegram: String(f.get('contact_telegram') || '').trim(), contact_whatsapp: String(f.get('contact_whatsapp') || '').trim() };
    const { error } = await sb.auth.updateUser({ data: { full_name: name, contact } });
    if (error) return toast(t('error') + error.message);
    store.set('yh_contact', contact); toast(t('savedOk')); route();
  };
  const vf = document.getElementById('verform');
  if (vf && qs().get('v')) setTimeout(() => vf.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  if (vf && vf.querySelector('[name=contact]')) vf.onsubmit = async e => {
    e.preventDefault(); const f = new FormData(vf), contact = String(f.get('contact') || '').trim(); if (contact.length < 3) return toast(t('required'));
    const { error } = await sb.from('yh_verify_requests').insert({ method: f.get('method'), contact, preferred_time: String(f.get('time') || '').trim() || null, note: String(f.get('note') || '').trim() || null });
    if (error) return toast(t('error') + error.message);
    toast(t('v_sent'), 5000); route();
  };
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
  return `<div class="panel"><h3>${title}</h3>${rows.length ? rows.map(([k, v]) => `<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600"><span>${esc(k)}</span><span>${v}</span></div><div style="height:6px;background:var(--bg);border-radius:99px"><div style="height:6px;width:${(v / tot) * 100}%;background:var(--blue);border-radius:99px"></div></div></div>`).join('') : '–'}</div>`;
}

async function viewSaved() {
  const ids = saved();
  app.innerHTML = `<div class="wrap"><div class="bh" style="margin-top:26px"><h2>♥ ${t('saved')}</h2></div><div id="res"></div></div>`;
  const res = document.getElementById('res');
  if (!ids.length) { res.innerHTML = `<div class="empty">${t('savedEmpty')}</div>`; return; }
  const list = await fetchListings({ ids: ids.slice(0, 100) });
  res.innerHTML = list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty">${t('savedEmpty')}</div>`;
}
// Agents & agencies page lives in agents.js (profiles + other advertisers)
const viewExperts = () => AG.viewExperts();
const PAGES = {
  terms: () => `<h1>${t('terms')}</h1><p>YourHome.asia is a listing platform that connects people looking for housing in Cambodia with owners and agents. Listings are published by their advertisers, who are responsible for their accuracy and legality. YourHome.asia is not a party to any rental or sale agreement.</p><p>Posting a standard listing is free. Advertisers must only post real properties they are entitled to offer, with honest prices and photos. We may hide or remove listings that are misleading, duplicated, spam or illegal, and may suspend accounts that break these rules.</p><p>Paid placements (TOP listings) are shown with a TOP label. Users should check every property in person and never send deposits before viewing it.</p><p>Questions: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>`,
  privacy: () => `<h1>${t('privacy')}</h1><p>We store the information you give us: your account email, your listings and the contact details you choose to publish, and messages sent through listing contact forms (delivered to the advertiser).</p><p>To show advertisers how their listings perform, we record anonymous visit statistics: the listing viewed, time, traffic source, device type and site language, linked to a random browser ID — not your name. Saved listings are kept only in your browser.</p><p>Data is stored with Supabase and the site is hosted on Vercel. We do not sell personal data. To delete your account or data, write to <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>`,
  support: () => `<h1>${t('support')}</h1><p>${t('supportBody')}</p><h3>${t('ft_chatT')}</h3><p>${t('ft_chatS')}</p><div class="yft-chs sup-chs">${document.querySelector('footer .yft-chs')?.innerHTML || ''}</div><p><a class="btn blue" href="tel:+855963068590">📞 +855 96 306 8590</a> <a class="btn ghost" href="mailto:${SUPPORT_EMAIL}">✉ ${SUPPORT_EMAIL}</a></p>`,
  // ABOUT US / HOW IT WORKS / SAFETY / FAQ (owner, 2026-11-24: "about us… profi portáltervezők, profi ingatlanosok…
  // a study stílusra") – English text; no invented years, numbers or awards.
  about: () => `<div class="ab">
    <p class="ab-k">About us</p>
    <h1>Every home in Cambodia, <em>one search away</em></h1>
    <p class="ab-lead">YourHome.asia is built by a team of experienced portal designers and real-estate professionals. We have built and run online portals for students, workers and property owners abroad, and we know the Cambodian rental market from the inside – so we made the portal we always wanted to use.</p>
    <div class="ab-grid">
      <div class="ab-c"><b>Portal builders</b><p>Our designers and developers have launched multilingual portals with listings, maps, dashboards and Telegram alerts. Fast pages, clear filters and a phone-first design are our standard.</p></div>
      <div class="ab-c"><b>Real-estate professionals</b><p>Our property people work with landlords, agents and developers every day. They know what renters ask first – price, location, the real photos – and what owners need to rent out quickly.</p></div>
      <div class="ab-c"><b>Made for Cambodia</b><p>Phnom Penh first, then the rest of the country. English, Khmer, Chinese, French and Thai, prices in US dollars, districts people actually search for.</p></div>
      <div class="ab-c"><b>Free to post</b><p>Owners and agents list for free and go live at once. Paid TOP placement is optional and always marked, so the results stay honest.</p></div>
    </div>
    <h2>Our mission</h2>
    <p>Finding a home should be simple and safe. We bring every rental, room and property for sale into one clean search, with real photos, a map view and direct contact with the owner or agent – no middlemen who hide the details.</p>
    <h2>What we do</h2>
    <ul class="ab-list"><li><b>For renters and buyers:</b> search by city, district, type, budget and amenities, save favourites and get new listings on Telegram.</li><li><b>For owners and agents:</b> post in two minutes, manage listings in a clear dashboard and see who viewed what and when.</li><li><b>For developers and partners:</b> present new projects, reach foreign and local buyers and work with us as a partner.</li></ul>
    <h2>Trust and safety</h2>
    <p>Advertisers can ask to be verified by our team with a short call – verified accounts get a ✓ badge. Visitors can report a listing at any time, and we hide listings that look misleading until we check them.</p>
    <div class="ab-cta"><div><b>Have a question or want to work with us?</b><span>Write to us on Telegram, WhatsApp or Viber: +855 96 306 8590</span></div><div class="ab-btns"><a class="btn red" href="#/post">+ Post listing</a><a class="btn ghost" href="#/support">Contact us</a></div></div>
  </div>`,
  how: () => `<div class="ab"><p class="ab-k">How it works</p><h1>Find, contact, move in – <em>in three steps</em></h1>
    <ol class="ab-steps"><li><b>Search</b><p>Choose Rent, Buy or Rooms, then the district, type and budget. Switch between the list and the map.</p></li><li><b>Contact</b><p>Open a listing and call, write on Telegram or WhatsApp, or send a message from the page – straight to the owner or agent.</p></li><li><b>Visit and decide</b><p>See the property in person, meet the owner and agree on the terms directly with them.</p></li></ol>
    <h2>For owners and agents</h2><ol class="ab-steps"><li><b>Post for free</b><p>Add photos, price and location – your listing goes live at once.</p></li><li><b>Get verified</b><p>Ask for the ✓ badge in your account; our team calls you briefly – no ID upload.</p></li><li><b>Track results</b><p>Your dashboard shows views, contact clicks and messages for every listing.</p></li></ol>
    <div class="ab-cta"><div><b>Ready to start?</b><span>Posting is free.</span></div><div class="ab-btns"><a class="btn red" href="#/post">+ Post listing</a><a class="btn ghost" href="#/search">Search homes</a></div></div></div>`,
  safety: () => `<div class="ab"><p class="ab-k">Safety tips</p><h1>Rent and buy <em>safely</em></h1>
    <ul class="ab-list"><li><b>Never pay before a viewing.</b> Do not send a deposit or rent before you have seen the property and met the owner or agent.</li><li><b>Meet in person.</b> Visit the address, check that keys, rooms and photos match the listing.</li><li><b>Get it in writing.</b> Ask for a written rental agreement with the price, deposit, utilities and the rental term.</li><li><b>Check who you deal with.</b> Prefer advertisers with the ✓ Verified badge and ask for the owner's or agent's ID or company details.</li><li><b>Report anything strange.</b> If a listing looks fake or the price is far too low, tell us – we check it and take it down if needed.</li></ul>
    <div class="ab-cta"><div><b>Something wrong with a listing?</b><span>Write to us: +855 96 306 8590 (Telegram, WhatsApp, Viber)</span></div><div class="ab-btns"><a class="btn red" href="#/support">Contact us</a></div></div></div>`,
  faq: () => `<div class="ab"><p class="ab-k">FAQ</p><h1>Questions <em>and answers</em></h1>
    <details class="ab-q" open><summary>Is posting a listing free?</summary><p>Yes. Owners and agents post for free and the listing goes live at once. Paid TOP placement is optional and always marked TOP.</p></details>
    <details class="ab-q"><summary>How do I contact an owner or agent?</summary><p>Open the listing: you can call, write on Telegram or WhatsApp, or send a message from the page.</p></details>
    <details class="ab-q"><summary>What does the ✓ Verified badge mean?</summary><p>Our team talked to the advertiser in a short phone or video call. You can ask for it in your account – no ID upload is needed.</p></details>
    <details class="ab-q"><summary>Can I get new listings on Telegram?</summary><p>Yes. On the results page tap Subscribe (the Telegram logo) and we send you new listings that match your search.</p></details>
    <details class="ab-q"><summary>Which cities do you cover?</summary><p>Phnom Penh first; other Cambodian cities follow, and every listing already carries its city.</p></details>
    <details class="ab-q"><summary>How do I report a listing?</summary><p>Write to us on Telegram, WhatsApp or Viber (+855 96 306 8590) or use the Support page – we check it quickly.</p></details>
    <div class="ab-cta"><div><b>Still have a question?</b><span>We usually reply within an hour.</span></div><div class="ab-btns"><a class="btn red" href="#/support">Contact us</a></div></div></div>`
};

let skipNext = false;
async function route() {
  const p0 = (location.hash.slice(1).split('?')[0] || '/').split('/').filter(Boolean);
  if (p0[0] === 'l' && p0[1]) {           // a listing = the popup over the page (owner, 2026-11-24)
    if (!app.querySelector('.wrap')) await viewHome();
    return POP.open(decodeURIComponent(p0[1]), false);
  }
  if (POP.isOpen()) POP.hide();
  clearMaps();
  document.title = 'YourHome.asia — ' + t('heroTitle').replace(/<[^>]+>/g, '');
  const path = (location.hash.slice(1).split('?')[0] || '/').replace(/\/+$/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  const nav = parts[0] === 'search' ? (qs().get('view') === 'map' ? 'map' : 'search') : ({ '': 'home', post: 'post', saved: 'saved', experts: 'experts', agent: 'experts', account: 'account' }[parts[0] || ''] || '');
  document.querySelectorAll('.bnav a').forEach(a => a.classList.toggle('on', a.dataset.nav === nav));
  window.scrollTo(0, 0);
  try {
    if (!parts.length) await viewHome();
    else if (parts[0] === 'search') await viewSearch();

    else if (parts[0] === 'post') await viewPost();
    else if (parts[0] === 'edit' && parts[1]) await viewPost(parts[1]);
    else if (parts[0] === 'account' || parts[0] === 'my') await viewAccount();
    else if (parts[0] === 'saved') await viewSaved();
    else if (parts[0] === 'experts') await viewExperts();
    else if (parts[0] === 'agent' && parts[1]) await AG.viewAgent(decodeURIComponent(parts[1]));
    else if (parts[0] === 'partners') PT.viewPartners();
    else if (parts[0] === 'projects') await PT.viewProjects();
    else if (parts[0] === 'project' && parts[1]) await PT.viewProject(decodeURIComponent(parts[1]));
    else if (PAGES[parts[0]]) app.innerHTML = `<div class="wrap"><div class="page">${PAGES[parts[0]]()}</div></div>`;
    else await viewHome();
  } catch (err) { console.error(err); toast(t('error') + err.message); }
}
AG.init({ sb, app, t, esc, card, go, toast, qs, tgHandle, digits, DISTRICTS, LISTING_COLS, user: () => user, lang: () => lang });
PT.init({ sb, app, t, esc, toast, digits, lang: () => lang });
const toggleSave = id => { let s = saved(); const on = !s.includes(id); s = on ? [id, ...s] : s.filter(x => x !== id); if (on) track({ id, status: 'active' }, 'save'); store.set('yh_saved', s.slice(0, 200)); document.querySelectorAll(`[data-save="${id}"]`).forEach(b => { b.classList.toggle('on', on);  }); return on; };
POP.init({ sb, t, esc, money, priceSuffix, tgHandle, digits, track, toast, facts: detailFacts, listingExtras: l => AG.listingExtras(l), isSaved, toggleSave, skipRoute: () => { skipNext = true; setTimeout(() => { skipNext = false; }, 400); }, route: () => route() });
window.addEventListener('hashchange', () => { if (skipNext) { skipNext = false; return; } route(); });

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

// PHONE CARD NAME + ADDRESS FILL THE ROW (owner, 2026-11-24 20:12: "elejétől a végéig legyen, és a cím vele azonos szélességű"):
// on phones "Apartment for rent in BKK1" and "Phnom Penh, <address>" are sized so each runs from the left edge to the right
// edge of the card (name 15–26px, address 11–17px; a longer text shrinks, a shorter one grows).
function fitLine(el, min, max) {
  if (!el.clientWidth) return;
  let lo = min, hi = max;
  for (let i = 0; i < 9; i++) { const m = (lo + hi) / 2; el.style.setProperty('font-size', m + 'px', 'important'); if (el.scrollWidth > el.clientWidth + 0.5) hi = m; else lo = m; }
  el.style.setProperty('font-size', lo + 'px', 'important');
}
let fitRaf = 0;
function fitCards() {
  if (innerWidth > 720) { document.querySelectorAll('.yname,.ymeta .yaddr').forEach(e => e.style.removeProperty('font-size')); return; }
  document.querySelectorAll('.card .yname').forEach(e => { fitLine(e, 15, 26); e.style.setProperty('font-size', (parseFloat(e.style.fontSize) - 1) + 'px', 'important'); });  // 1px under the full fit (owner, 20:16)
  document.querySelectorAll('.card .ymeta .yaddr').forEach(e => fitLine(e, 11, 17));
}
const queueFit = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitCards); };
new MutationObserver(queueFit).observe(document.getElementById('app'), { childList: true, subtree: true });
addEventListener('resize', queueFit);
document.fonts && document.fonts.ready.then(queueFit);
