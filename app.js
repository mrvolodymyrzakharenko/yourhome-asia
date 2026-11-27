import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { T } from './i18n.js';
import * as AG from './agents.js';
import * as POP from './popup.js';
import * as PT from './partners.js';
import * as BL from './blog.js';

const SB_URL = 'https://uuzevmbfcxtvjuguiygy.supabase.co';
const SB_KEY = 'sb_publishable__Q20CYCQEZ3YzjiEeqpxkQ_W4dW-i34';
const SUPPORT_EMAIL = 'info@yourhome.asia';
const PP = [11.5564, 104.9282];
// Cities (owner, 2026-11-24: "legyen az összes nagy város a listában, de a kezdő Phnom Penh") – every province capital
// plus the two big border towns; Phnom Penh is first and the default. [name, lat, lng]
const CITIES = [['Phnom Penh',11.5564,104.9282],['Siem Reap',13.3633,103.8564],['Sihanoukville',10.6253,103.5234],['Battambang',13.0957,103.2022],['Kampot',10.6104,104.1815],['Kep',10.4829,104.3167],['Kampong Cham',11.9934,105.4635],['Poipet',13.6589,102.5636],['Bavet',11.0662,106.1306],['Koh Kong',11.6153,102.9838],['Takeo',10.9908,104.7850],['Kampong Speu',11.4533,104.5209],['Kampong Chhnang',12.2505,104.6666],['Kampong Thom',12.7111,104.8887],['Pursat',12.5388,103.9192],['Prey Veng',11.4868,105.3253],['Svay Rieng',11.0878,105.7993],['Kratie',12.4881,106.0188],['Stung Treng',13.5259,105.9683],['Banlung',13.7394,106.9873],['Sen Monorom',12.4558,107.1881],['Preah Vihear',13.8077,104.9806],['Serei Saophoan',13.5859,102.9737],['Samraong',14.1817,103.5176],['Pailin',12.8489,102.6093],['Suong',11.9116,105.6587]];
const CITY_NAMES = CITIES.map(c => c[0]);
const cityCenter = c => { const x = CITIES.find(k => k[0] === c); return x ? [x[1], x[2]] : PP; };
const cityLabel = c => !c || c === 'Phnom Penh' ? t('cityPP') : c;
// Districts (sangkats) of every city (owner, 2026-11-24 20:28) – names from Wikipedia 'List of communes in Cambodia'; Phnom Penh keeps DISTRICTS
const CITY_DIST = {"Siem Reap": ["Sla Kram", "Svay Dankum", "Kok Chak", "Sala Kamreuk", "Nokor Thum", "Chreav", "Chong Khnies", "Sambuor", "Siem Reap", "Srangae", "Krabei Riel", "Tuek Vil"], "Sihanoukville": ["Sangkat 1", "Sangkat 2", "Sangkat 3", "Sangkat 4"], "Battambang": ["Tuol Ta Ek", "Prek Preah Sdach", "Rattanak", "Chamkar Samraong", "Sla Ket", "Kdol Doun Teav", "Ou Mal", "Wat Kor", "Ou Char", "Svay Por"], "Kampot": ["Kampong Kandal", "Krang Ampil", "Kampong Bay", "Andoung Khmer", "Traeuy Kaoh"], "Kep": ["Kep", "Prey Thum", "Ou Krasar"], "Kampong Cham": ["Boeng Kok", "Kampong Cham", "Sambuor Meas", "Veal Vong"], "Poipet": ["Nimitt", "Poipet", "Phsar Kandal", "Ou Chrov", "Ou Ruessei"], "Bavet": ["Bati", "Bavet", "Chrak Mtes", "Prasat", "Prey Angkunh"], "Koh Kong": ["Smach Mean Chey", "Dang Tong", "Stueng Veaeng"], "Takeo": ["Baray", "Roka Knong", "Roka Krau"], "Kampong Speu": ["Chbar Mon", "Kandaol Dom", "Rokar Thum", "Sopoar Tep", "Svay Kravan"], "Kampong Chhnang": ["Phsar Chhnang", "Kampong Chhnang", "B'er", "Khsam"], "Kampong Thom": ["Damrei Choan Khla", "Kampong Thum", "Kampong Roteh", "Ou Kanthor", "Kampong Krabau", "Prey Ta Hu", "Achar Leak", "Srayov"], "Pursat": ["Chamraeun Phal", "Lolok Sa", "Phteah Prey", "Prey Nhi", "Roleab", "Svay At", "Banteay Dei"], "Prey Veng": ["Baray", "Cheung Tuek", "Kampong Leav", "Ta Kao"], "Svay Rieng": ["Svay Rieng", "Prey Chhlak", "Koy Trabaek", "Pou Ta Hao", "Chek", "Svay Toea", "Sangkhoar"], "Kratie": ["Kaoh Trong", "Krakor", "Kratie", "Ou Ruessei", "Roka Kandal"], "Stung Treng": ["Stung Treng", "Srah Ruessei", "Preah Bat", "Sameakki"], "Banlung": ["Kachanh", "Labansiek", "Yeak Laom", "Boeng Kansaeng"], "Sen Monorom": ["Monourom", "Sokh Dom", "Spean Mean Chey", "Romonea"], "Preah Vihear": ["Kampong Pranak", "Pal Hal"], "Serei Saophoan": ["Kampong Svay", "Kaoh Pong Satv", "Mkak", "Ou Ambel", "Phniet", "Preah Ponlea", "Tuek Thla"], "Samraong": ["Bansay Reak", "Bos Sbov", "Koun Kriel", "Samraong", "Ou Smach"], "Pailin": ["Pailin", "Ou Ta Vau", "Tuol Lvea", "Bar Yakha"], "Suong": ["Suong", "Vihear Luong"]};
const distList = city => city === 'Phnom Penh' || !city ? DISTRICTS : (CITY_DIST[city] || []);
const districtOpts = (city, cur) => `<option value="">${distList(city).length || cur ? t('any') : ''}</option>` +   // no districts for that city → the field stays empty (owner, 2026-11-24 20:36)
  (cur && !distList(city).includes(cur) ? [cur, ...distList(city)] : distList(city)).map(d => `<option value="${esc(d)}"${d === cur ? ' selected' : ''}>${esc(d)}</option>`).join('');
const DISTRICTS = ['BKK1','BKK2','BKK3','Chamkar Mon','Daun Penh','Riverside','Toul Kork','Toul Tom Poung','Tonle Bassac','Sen Sok','Chroy Changvar','7 Makara','Russey Keo','Mean Chey','Chbar Ampov','Por Senchey','Dangkao','Olympic'];
// property types like realestate.com.kh "All types" (owner, 2026-11-24 20:34); Studio is search-only (= 0 bedrooms)
const TYPES = ['apartment','condo','house','villa','twin_villa','link_house','flat_house','flat','penthouse','shophouse','room','office','land','hotel','hostel',
  'borey','serviced','guesthouse','resort','farmland','plantation','comm_land','shop','warehouse','factory','showroom','restaurant','building'];
// PROPERTY TYPES IN GROUPS (owner, 2026-11-26 07:43: "land, shop, territory, wood… elválasztva, alsó csíkkal, szépen, kategória név fent
// középen, alatta az alkategóriák"): every Property type list (search card, post form) = <optgroup>s; picker.js draws the group name
// centred with a thin line under it, its types below. 'studio' and 'commercial' (= every business type) are search-only.
const TYPE_GROUPS = [['g_homes', ['apartment','condo','studio','house','borey','villa','twin_villa','link_house','flat_house','flat','penthouse','serviced']],
  ['g_stays', ['room','hotel','hostel','guesthouse','resort']], ['g_land', ['land','farmland','plantation','comm_land']],
  ['g_biz', ['commercial','shophouse','shop','office','warehouse','factory','showroom','restaurant','building']]];
const typeLab = x => t(x === 'studio' ? 'studio' : x === 'commercial' ? 'g_allBiz' : 't_' + x);
const typeOpts = (cur, search) => TYPE_GROUPS.map(([g, ks]) => `<optgroup label="${esc(t(g))}">${ks.filter(x => search || TYPES.includes(x)).map(x => `<option value="${x}"${cur === x ? ' selected' : ''}>${esc(typeLab(x))}</option>`).join('')}</optgroup>`).join('');
// SEARCH TYPE LIST (owner, 2026-11-26: "a type-nál az összes ingatlan típus… commercial a végére, előre a lakossági"):
// homes first, then rooms / short stays / land, business types LAST (after a thin divider in the list – data-sep)
const SEARCH_TYPES = ['apartment','condo','studio','house','villa','twin_villa','link_house','flat_house','flat','penthouse','room','hotel','hostel','land','office','shophouse','commercial'];
// COMMERCIAL (owner, 2026-11-26: "külön portál a commercialra?" → no, a category here): 'commercial' is a search-only type =
// every business property (COMMERCIAL below: office + shophouse); Office is its own category too. Both open as Rent (Buy stays Buy).
const BIZ_CATS = ['office', 'commercial', 'shophouse'];
const AMEN = ['edc','pool','gym','parking','balcony','elevator','security','generator','wifi','cleaning','utilities','pets','aircon','kitchen','washer','private_bath','female_only'];
const QUICK = { rent: ['pool','gym','pets','parking'], daily: ['pool','gym','wifi','aircon'], room: ['pool','gym','private_bath','wifi','aircon','female_only'], sale: ['pool','gym','parking','security'], '': ['pool','gym','pets','parking'] };  // row 1 always shows Pool + Gym; EDC only in Filters (owner, 2026-11-24)
// Hotel · Hostel at the front of the category row (owner, 2026-11-26: "az elejére a kereső részbe… a hotelt és hostelt is");
// they open as short stays (deal daily) unless Buy is picked – STAY_CATS
const STAY_CATS = ['hotel', 'hostel'];
// "Commercial" (footer + /rent|buy/<city>/commercial landing, owner 2026-11-26) = offices + shophouses
const COMMERCIAL = ['office', 'shophouse', 'shop', 'warehouse', 'factory', 'showroom', 'restaurant', 'building'];   // = every business type (TYPE_GROUPS g_biz)
const CATS = [['hotel', 't_hotel'], ['hostel', 't_hostel'], ['office', 't_office_s'], ['shophouse', 't_shop_s'], ['apartment', 't_apartment'], ['condo', 't_condo'], ['studio', 'studio'], ['villa', 't_villa'], ['house', 't_house']];
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
// Cambodia offers 8 languages (owner, 2026-11-26 13:30 / 13:34 Japanese off) – a stored de/cs/pl/hu/ja choice falls back to English
let lang = store.get('yh_lang', null) || (['km','zh','fr','th','ru','vi','ko'].find(l => (navigator.language || '').startsWith(l)) || 'en');
if (!['en','km','zh','fr','th','ru','vi','ko'].includes(lang)) lang = 'en';
// Short labels for the filters panel (owner, 2026-11-24 20:23: amenities in 3 rows) – s_<key>, else the full text
const sl = k => (T[lang] && T[lang]['s_' + k]) ?? (lang === 'en' ? T.en['s_' + k] : null) ?? t(k);
const t = (k, vars) => { let s = (T[lang] && T[lang][k]) ?? T.en[k] ?? k; if (vars) for (const v in vars) s = s.replace('{' + v + '}', vars[v]); return s; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
// CURRENCY like realestate.com.kh (owner, 2026-11-24 20:55): prices are stored in USD and shown in the picked currency with
// today's rate (open.er-api.com, cached 12 h). No live rate yet → USD is shown, never a guessed rate.
const CURS = [['USD', 'US Dollar', '$'], ['KHR', 'Cambodian Riel', '៛'], ['THB', 'Thai Baht', '฿'], ['CNY', 'Chinese Yuan', 'CN¥'], ['JPY', 'Japanese Yen', '¥'], ['EUR', 'Euro', '€']];
let cur = (() => { try { const c = JSON.parse(localStorage.getItem('yh_cur')); return CURS.some(k => k[0] === c) ? c : 'USD'; } catch { return 'USD'; } })();
let rates = (() => { try { const c = JSON.parse(localStorage.getItem('yh_rates')); return c && c.r ? c.r : null; } catch { return null; } })();
const money = n => {
  const k = rates && rates[cur] ? cur : 'USD', c = CURS.find(x => x[0] === k), v = Number(n) * (k === 'USD' ? 1 : rates[k]);
  const s = v.toLocaleString('en-US', { maximumFractionDigits: v < 100 && k !== 'KHR' && k !== 'JPY' ? 2 : 0 });
  return k === 'KHR' ? s + ' ៛' : c[2] + s;
};
window.yhMoney = money;
window.yhPerM2 = l => perM2(l);
// ADDRESS PARTS (owner, 2026-11-25: "sangkat, utca, házszám… kerület vagy falu… ha akarja kitölti"): all optional, kept in the one
// address column as "No. 24, Street 278, Phum 3, Sangkat Boeung Keng Kang 1, Khan Chamkarmon" (the usual Cambodian order)
const ADDR = [['house', 'No. '], ['street', 'Street '], ['village', 'Phum '], ['sangkat', 'Sangkat '], ['khan', 'Khan ']];
const composeAddr = p => ADDR.map(([k, pre]) => p[k] ? pre + p[k] : '').filter(Boolean).join(', ');
function parseAddr(a) {
  const p = {}, rest = [];
  String(a || '').split(/\s*,\s*/).filter(Boolean).forEach(x => { const m = ADDR.find(([k, pre]) => !p[k] && x.toLowerCase().startsWith(pre.toLowerCase())); if (m) p[m[0]] = x.slice(m[1].length).trim(); else rest.push(x); });
  if (rest.length) p.street = [p.street, ...rest].filter(Boolean).join(', ');
  return p;
}
const addrRows = l => { const p = parseAddr(l.address); const rows = ADDR.filter(([k]) => p[k]).map(([k]) => `<div class="apm-addr-r"><small>${esc(t('ad_' + k))}</small><b>${esc(p[k])}</b></div>`);
  return rows.length ? `<h3 class="apm-h">${esc(t('address'))}</h3><div class="apm-addr">${rows.join('')}</div>` : ''; };
// which rent kind a saved listing shows in the post form
const postDeal = l => l.deal_type !== 'rent' ? l.deal_type : l.price_period === 'day' ? 'daily' : l.price_period === 'week' ? 'weekly'
  : l.price_period === 'other' ? 'rentother' : ['6m', '1y'].includes(l.min_lease) ? 'longterm' : 'rent';
const priceSuffix = l => ({ month: t('perMonth'), day: t('perDay'), week: t('perWeek'), hour: t('perHour') })[l.price_period] || (l.price_period === 'other' && l.period_note ? ' / ' + l.period_note : '');
const shortDate = d => { const x = new Date(d); return `${x.getFullYear()}. ${x.getMonth()+1}. ${x.getDate()}.`; };
const dateTime = d => new Date(d).toLocaleString(lang === 'km' ? 'km-KH' : lang, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
const toast = (msg, ms = 3200) => { const el = document.getElementById('toast'); el.textContent = msg; el.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => el.hidden = true, ms); };
const qs = () => new URLSearchParams((YH.h().split('?')[1]) || '');
const go = h => YH.go(h);   // clean URLs – router.js
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
// PAGE VIEWS for the admin Visitors section (api/track.js → yh_pageviews): one beacon per shown page, only after a real
// touch / click / key / scroll or 8 s visible (preview bots never do that), never from the admin's own browser (yh_noct).
const PV = { armed: false, queue: [], last: '' };
function pvSend(path) {
  try { if (localStorage.getItem('yh_noct') || /[?&]nocount=1/.test(location.search)) { localStorage.setItem('yh_noct', '1'); return; } } catch {}
  if (/[?&]nocount=0/.test(location.search)) try { localStorage.removeItem('yh_noct'); } catch {}
  if (path === PV.last) return; PV.last = path;
  const src = trafficSource(), p = new URLSearchParams(location.search);
  const utm = [p.get('utm_source'), p.get('utm_medium'), p.get('utm_campaign')].filter(Boolean).join(' / ') || null;
  const body = JSON.stringify({ path, v: visitorId(), ref: src, utm, lang, device: device(), wd: !!navigator.webdriver });
  try { if (!navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))) throw 0; }
  catch { fetch('/api/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {}); }
}
function pageView() {
  if (!/(^|\.)yourhome\.asia$/.test(location.hostname)) return;
  const path = location.pathname + (location.search.replace(/[?&](nocount|utm_[a-z]+|fbclid|gclid)=[^&]*/g, '').replace(/^&/, '?') || '');
  if (path.startsWith('/admin')) return;
  if (PV.armed) pvSend(path); else PV.queue = [path];
}
(() => {
  const arm = () => { if (PV.armed) return; PV.armed = true; ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(e => removeEventListener(e, arm)); PV.queue.forEach(pvSend); PV.queue = []; };
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(e => addEventListener(e, arm, { passive: true }));
  setTimeout(() => { if (document.visibilityState === 'visible') arm(); }, 8000);
})();
function track(l, kind) {
  if (!l || l.status !== 'active' || (user && l.owner_id === user.id)) return;
  try { if (localStorage.getItem('yh_noct')) return; } catch {}   // the owner's own devices never count
  if (kind === 'view') { const k = 'yh_v_' + l.id; try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch {} }
  sb.from('yh_events').insert({ listing_id: l.id, kind, visitor: visitorId(), source: trafficSource(), device: device(), lang }).then(() => {});
}
// Telegram accounts carry an internal, never-mailed address (api/_tg.js) – show "Telegram @name" instead of it.
const shownEmail = u => /@telegram\./.test(u?.email || '') ? 'Telegram' + (u.user_metadata?.telegram_username ? ' @' + u.user_metadata.telegram_username : '') : (u?.email || '');
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
const LISTING_COLS = 'source,id,owner_id,district,deal_type,property_type,title,price,price_period,bedrooms,bathrooms,area_m2,lat,lng,photos,status,is_featured,is_demo,created_at,contact_name,amenities,posted_by,address,city,contact_phone,contact_whatsapp,contact_telegram,agent_id,contact_photo,period_note';

function applyStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  // footer "Popular searches" (api/page.js footerLinks): template ps_* + plural type ftp_* + place name
  document.querySelectorAll('[data-ps]').forEach(el => { el.textContent = t(el.dataset.ps, { x: el.dataset.psx ? t('ftp_' + el.dataset.psx) : '', p: el.dataset.psp || '' }); });
  document.getElementById('lang').value = lang;
  langBtnDraw();
  // currency names in the Menu in the visitor's language (owner screenshot 13:24 – they were English); the code stays
  try { const dn = new Intl.DisplayNames([lang === 'km' ? 'km-KH' : lang], { type: 'currency' }); document.querySelectorAll('.dr-curs [data-cur]').forEach(b => { const n = dn.of(b.dataset.cur); if (n && b.lastChild && b.lastChild.nodeType === 3) b.lastChild.textContent = n.charAt(0).toLocaleUpperCase(lang) + n.slice(1); }); } catch {}
  document.getElementById('year').textContent = new Date().getFullYear();
}
async function loadRates() {
  try { const c = JSON.parse(localStorage.getItem('yh_rates')); if (c && c.r && Date.now() - c.t < 12 * 36e5) return; } catch {}
  try {
    const j = await fetch('https://open.er-api.com/v6/latest/USD').then(r => r.json());
    const r = {}; CURS.forEach(([k]) => { r[k] = j && j.rates ? Number(j.rates[k]) : NaN; });
    if (!Object.values(r).every(x => Number.isFinite(x) && x > 0)) return;
    rates = r; try { localStorage.setItem('yh_rates', JSON.stringify({ t: Date.now(), r })); } catch {}
    if (cur !== 'USD') route();
  } catch {}
}
function setCur(k) {
  if (!CURS.some(c => c[0] === k)) return;
  cur = k; try { localStorage.setItem('yh_cur', JSON.stringify(k)); } catch {}
  const s = document.getElementById('cur'); if (s) s.value = k;
  document.querySelectorAll('[data-cur]').forEach(b => b.classList.toggle('on', b.dataset.cur === k));
  route();
}
(() => {
  const s = document.getElementById('cur'); if (s) { s.value = cur; s.addEventListener('change', e => setCur(e.target.value)); }
  document.querySelectorAll('[data-cur]').forEach(b => { b.classList.toggle('on', b.dataset.cur === cur); b.addEventListener('click', () => setCur(b.dataset.cur)); });
  loadRates();
})();
document.getElementById('lang').addEventListener('change', e => { lang = e.target.value; store.set('yh_lang', lang); applyStatic(); route(); });
// LANGUAGE PICKER (owner, 2026-11-26: "orosz, német… cseh, lengyel, magyar… koreai, japán… legyen zászló… egymás alá, 1 egy sorban…
// legyen akkora a box hogy ne kelljen görgetni"): header button = flag + code; it opens a panel with ONE card per row (flag ·
// language in its own name · ›, the current one ✓), all 12 without scrolling – PC 3 per row; phones/tablets 2 per row, smaller,
// 25% of the screen free left, right and below (owner 08:02 – base rule for boxes on phones; styles.css "LANGUAGE PICKER").
// The header button shows ONLY the active language as text, no flag (owner 08:02). Flags are drawn SVG, never emoji. Languages without their own texts yet show English (t() falls back).
const LANG_LIST = [['en', 'English'], ['km', 'ខ្មែរ'], ['zh', '中文'], ['fr', 'Français'], ['th', 'ไทย'], ['ru', 'Русский'], ['vi', 'Tiếng Việt'], ['ko', '한국어']];
const LANG_SHORT = { en: 'EN', km: 'ខ្មែរ', zh: '中文', fr: 'FR', th: 'ไทย', ru: 'RU', vi: 'VI', ko: '한국어', ja: '日本語' };
const LANG_TITLE = { vi: 'Ngôn ngữ', en: 'Language', km: 'ភាសា', zh: '语言', fr: 'Langue', th: 'ภาษา', ru: 'Язык', de: 'Sprache', cs: 'Jazyk', pl: 'Język', hu: 'Nyelv', ko: '언어', ja: '言語' };
function flagSvg(c) {
  const star = (x, y, r, rot = -90) => { let p = ''; for (let i = 0; i < 10; i++) { const a = (rot + i * 36) * Math.PI / 180, q = i % 2 ? r * .382 : r; p += (i ? 'L' : 'M') + (x + q * Math.cos(a)).toFixed(2) + ' ' + (y + q * Math.sin(a)).toFixed(2); } return '<path fill="#FFDE00" d="' + p + 'Z"/>'; };
  const h3 = (a, b, d) => '<rect width="30" height="20" fill="' + a + '"/><rect y="6.67" width="30" height="6.67" fill="' + b + '"/><rect y="13.33" width="30" height="6.67" fill="' + d + '"/>';
  const v3 = (a, b, d) => '<rect width="10" height="20" fill="' + a + '"/><rect x="10" width="10" height="20" fill="' + b + '"/><rect x="20" width="10" height="20" fill="' + d + '"/>';
  const tri = (x, y, rot) => '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')" fill="#000"><rect x="-2" y="-1.6" width="4" height=".7"/><rect x="-2" y="-.35" width="4" height=".7"/><rect x="-2" y=".9" width="4" height=".7"/></g>';
  const b = {
    en: '<svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice"><clipPath id="fgbt"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath><rect width="60" height="30" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30m0-30L0 30" clip-path="url(#fgbt)" stroke="#C8102E" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></svg>',
    km: '<rect width="30" height="20" fill="#032EA1"/><rect y="5" width="30" height="10" fill="#E00025"/><path fill="#fff" d="M8.5 13.6h13v1h-13zM10 11.6h10v2H10zM11.2 11.6l1-3 1 3zM14 11.6l1-4.8 1 4.8zM16.8 11.6l1-3 1 3z"/>',
    zh: '<rect width="30" height="20" fill="#EE1C25"/>' + star(5, 5, 3) + star(10, 2, 1, -50) + star(12, 4, 1, -25) + star(12, 7, 1, 0) + star(10, 9, 1, 20),
    fr: v3('#0055A4', '#fff', '#EF4135'),
    th: '<rect width="30" height="20" fill="#A51931"/><rect y="3.33" width="30" height="13.34" fill="#F4F5F8"/><rect y="6.67" width="30" height="6.66" fill="#2D2A4A"/>',
    ru: h3('#fff', '#0039A6', '#D52B1E'),
    de: h3('#000', '#DD0000', '#FFCE00'),
    cs: '<rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#D7141A"/><path d="M0 0l15 10L0 20z" fill="#11457E"/>',
    pl: '<rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#DC143C"/>',
    hu: h3('#CD2A3E', '#fff', '#436F4D'),
    ko: '<rect width="30" height="20" fill="#fff"/><g transform="rotate(33.7 15 10)"><path d="M10 10a5 5 0 0 1 10 0z" fill="#CD2E3A"/><path d="M10 10a5 5 0 0 0 10 0z" fill="#0047A0"/><circle cx="12.5" cy="10" r="2.5" fill="#CD2E3A"/><circle cx="17.5" cy="10" r="2.5" fill="#0047A0"/></g>' + tri(6.4, 4.3, -56.3) + tri(23.6, 15.7, -56.3) + tri(23.6, 4.3, 56.3) + tri(6.4, 15.7, 56.3),
    ja: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#BC002D"/>',
    vi: '<rect width="30" height="20" fill="#DA251D"/>' + star(15, 10.4, 5.4).replace('#FFDE00', '#FFFF00'),
  }[c] || '';
  return b.startsWith('<svg') ? b : '<svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice">' + b + '</svg>';
}
function langBtnDraw() {
  const bt = document.getElementById('langBtn'); if (!bt) return;
  bt.querySelector('.lcd').textContent = LANG_SHORT[lang] || lang.toUpperCase();
  bt.setAttribute('aria-label', (LANG_TITLE[lang] || 'Language') + ': ' + ((LANG_LIST.find(x => x[0] === lang) || [])[1] || ''));
}
function closeLangs() { const p = document.querySelector('.lpk'); if (!p) return; p.classList.remove('in'); setTimeout(() => p.remove(), 180); document.removeEventListener('keydown', langKey); }
function langKey(e) { if (e.key === 'Escape') closeLangs(); }
function openLangs() {
  closeLangs();
  const p = document.createElement('div'); p.className = 'lpk';
  p.innerHTML = '<div class="lpk-bg"></div><div class="lpk-w" role="dialog" aria-modal="true" aria-label="' + esc(LANG_TITLE[lang] || 'Language') + '">'
    + '<div class="lpk-h"><span>' + esc(LANG_TITLE[lang] || 'Language') + '</span><button type="button" class="lpk-x" aria-label="' + esc(t('close')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'
    + '<div class="lpk-l">' + LANG_LIST.map(([c, n]) => '<button type="button" class="lpk-c' + (c === lang ? ' on' : '') + '" data-l="' + c + '" lang="' + c + '"' + (c === lang ? ' aria-current="true"' : '') + '><span class="lpk-f" aria-hidden="true">' + flagSvg(c) + '</span><span class="lpk-n">' + esc(n) + '</span>'
      + (c === lang ? '<svg class="lpk-i" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>' : '<svg class="lpk-i" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>') + '</button>').join('') + '</div></div>';
  document.body.appendChild(p);
  requestAnimationFrame(() => p.classList.add('in'));
  p.querySelector('.lpk-bg').onclick = closeLangs; p.querySelector('.lpk-x').onclick = closeLangs;
  p.querySelectorAll('.lpk-c').forEach(b => b.onclick = () => {
    const s = document.getElementById('lang'); closeLangs();
    if (b.dataset.l !== lang) { s.value = b.dataset.l; s.dispatchEvent(new Event('change')); }
  });
  document.addEventListener('keydown', langKey);
  const on = p.querySelector('.lpk-c.on'); if (on) on.focus({ preventScroll: true });
}
document.getElementById('langBtn')?.addEventListener('click', openLangs);
// TELEGRAM CHANNEL (owner, 2026-11-24: "kellene egy telegram gomb – amivel fel tud iratkozni a yourhome.asia csatornára"):
// the bottom menu's first button and the footer Telegram icon ([data-tgch]) open a small card "Join our Telegram channel"
// + "Join on Telegram". TG_CHANNEL = the channel's public username without @ – until it is filled in, the card says
// "coming soon" and its button is hidden. Once set, the card also opens by itself once per visitor (3 s after load, 7 s).
const TG_BOT = 'yourhomeasiabot';   // the YourHome bot – sends the personal alerts (api/tg-sync.js, api/tg-bot.js)
const TG_CHANNEL = 'yourhomeasia';   // t.me/yourhomeasia – "www.yourhome.asia – Cambodia" (owner, 2026-11-25)
function tgCard() {
  let c = document.getElementById('tgch');
  if (c) return c;
  c = document.createElement('div'); c.id = 'tgch'; c.className = 'tgch'; c.setAttribute('role', 'dialog'); c.hidden = true;
  document.body.appendChild(c);
  return c;
}
function tgCardFill(c) {
  const url = TG_CHANNEL ? 'https://t.me/' + TG_CHANNEL : '';
  const ic = d => `<span class="tgch-oi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg></span>`;
  const opt = (href, d, k) => `<a class="tgch-o" href="${href}" target="_blank" rel="noopener">${ic(d)}<span><b>${esc(t(k))}</b><small>${esc(t(k + 's'))}</small></span></a>`;
  // THREE CHOICES (owner, 2026-11-27: "csatornára feliratkozhat, amikor oda kattint a Telegramra, és hirdetést adhat fel")
  c.innerHTML = `<button type="button" class="tgch-x" aria-label="${esc(t('close'))}"><svg class="xic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    <div class="tgch-h"><span class="tgch-ic"><svg viewBox="0 0 24 24"><path d="M21.5 4.2 2.9 11.4c-1 .4-1 1.4 0 1.7l4.7 1.5 1.8 5.6c.2.6.9.8 1.4.4l2.6-2.1 5 3.7c.7.5 1.6.1 1.8-.7l3.1-14.9c.2-1-.8-1.8-1.8-1.4z"/></svg></span><b>${url ? t('tgoTitle') : t('tgchTitle')}</b></div>
    ${url ? `${opt(url, '<path d="M4 10v4h3l5 4V6L7 10z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>', 'tgo1')}
      ${opt('https://t.me/' + TG_BOT + '?start=post', '<path d="M12 5v14M5 12h14"/>', 'tgo2')}
      ${opt('https://t.me/' + TG_BOT + '?start=search', '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>', 'tgo3')}`
      : `<p>${t('tgchLine')}</p><span class="tgch-n">${t('tgchSoon')}</span>`}`;
  c.setAttribute('aria-label', url ? t('tgoTitle') : t('tgchTitle'));
  c.classList.toggle('tgch-opts', !!url);   // compact, as wide as its content (owner, 2026-11-27 04:34: "mennyi fehér hely")
}
function tgCardOpen(auto, top) {
  const c = tgCard(); tgCardFill(c); c.hidden = false;
  c.classList.toggle('at-top', !!top);   // opened from the header icon → the card drops down under the header
  requestAnimationFrame(() => c.classList.add('on'));
  clearTimeout(c._t); if (auto) c._t = setTimeout(tgCardClose, 7000);
}
function tgCardClose() { const c = document.getElementById('tgch'); if (!c || c.hidden) return; c.classList.remove('on'); setTimeout(() => { c.hidden = true; }, 250); }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tgch]');
  // (owner, 2026-11-27: the button opens the small card with three choices – channel · post in the bot · search in the bot –
  // instead of going straight to the channel; a choice opens Telegram and closes the card)
  if (e.target.closest('.tgch-o')) { setTimeout(tgCardClose, 50); return; }
  if (b) { e.preventDefault(); const c = document.getElementById('tgch'); c && !c.hidden ? tgCardClose() : tgCardOpen(false, !!b.closest('.hdr')); return; }
  const c = document.getElementById('tgch');
  if (c && !c.hidden && (e.target.closest('.tgch-x') || !c.contains(e.target))) tgCardClose();
});
if (TG_CHANNEL) {
  document.querySelectorAll('.yft-s-tg').forEach(a => { a.setAttribute('aria-label', 'Telegram channel'); a.querySelector('.yft-tip')?.remove(); });
  try { if (!localStorage.getItem('yh_tgch')) { localStorage.setItem('yh_tgch', '1'); setTimeout(() => tgCardOpen(true), 3000); } } catch (_) {}
}

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
// Agent bar at the bottom of every card (owner, 2026-11-24 21:24, khmer24-style screenshot): photo (agent profile photo or
// initials), name, and round Call · WhatsApp · Telegram buttons. The card is a link, so the buttons are spans that open
// their link themselves (no nested <a>). Clicks are counted like in the popup.
function agentBar(l) {
  const ag = l._agent || null;
  const name = (ag && ag.name) || l.contact_name || '';
  const ph = digits(l.contact_phone || (ag && ag.phone)), wa = digits(l.contact_whatsapp || (ag && ag.whatsapp)), tgRaw = l.contact_telegram || (ag && ag.telegram), tg = tgHandle(tgRaw) || (/^\+?\d{8,15}$/.test(String(tgRaw || '').replace(/[\s-]/g, '')) ? '+' + digits(tgRaw).replace('+', '') : null);
  if (!name && !ph && !wa && !tg) return '';
  const ini = (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const pic = (ag && ag.photo) || l.contact_photo, av = pic ? `<img src="${esc(pic)}" alt="${esc((name || t('by_owner')) + ' – ' + ((ag && ag.kind) || 'agent') + ', ' + (l.city || 'Phnom Penh'))}" loading="lazy">` : `<i>${esc(ini)}</i>`;
  const b = (href, ev, cls, svg, lab) => `<span class="yab ${cls}" role="link" tabindex="0" data-href="${esc(href)}" data-ev="${ev}" data-id="${l.id}" aria-label="${esc(lab)}">${svg}</span>`;
  return `<div class="yagent"><span class="yav">${av}</span><span class="yan">${esc(name || t('by_owner'))}</span><span class="yabs">${
    ph ? b('tel:' + ph, 'phone', 'yab-ph', '<svg viewBox="0 0 24 24"><path d="M5 3h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 7.1 7.1l1.4-2.3L21 15.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>', t('call')) : ''}${
    wa ? b('https://wa.me/' + wa.replace('+', ''), 'whatsapp', 'yab-wa', '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1-1 1.5.7-.3 1.3c-3 .4-6.9-3.5-6.5-6.5l1.3-.3.7 1.5z"/></svg>', 'WhatsApp') : ''}${
    tg ? b('https://t.me/' + tg, 'telegram', 'yab-tg', '<svg viewBox="0 0 24 24"><path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 7-5"/></svg>', 'Telegram') : ''}</span></div>`;
}
window.yhAgentBar = agentBar;
document.addEventListener('click', e => {
  const b = e.target.closest('.yab'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  if (b.dataset.id) try { track({ id: b.dataset.id, status: 'active' }, b.dataset.ev); } catch (_) {}
  const h = b.dataset.href; if (h.startsWith('tel:')) location.href = h; else window.open(h, '_blank', 'noopener');
}, true);
// Photo alt text is never empty (seo-rules.md): "<type> for <rent/sale> in <district>, <city>" (+ photo number)
const photoAlt = (l, i) => `${t('t_' + (l.deal_type === 'room' ? 'room' : l.property_type))} ${l.deal_type === 'sale' ? 'for sale' : 'for rent'} in ${[l.district, l.city || 'Phnom Penh'].filter(Boolean).join(', ')}${i ? ' – photo ' + (i + 1) : ''}`;
// PHOTOS (owner, 2026-11-25: "12-15 kép az ideális… a kártyákon akár az összeset"): up to MAX_PHOTOS per listing, every one
// swipeable on the card. imgSrc() asks for the size that is needed: Unsplash via ?w=, our own uploads via the small copy
// made in the browser at upload ("…-s.webp" next to "….webp"); old uploads without a small copy are used as they are.
const MAX_PHOTOS = 15;
function imgSrc(u, w) {
  if (!u) return u;
  if (/^https:\/\/images\.unsplash\.com\//.test(u)) { try { const x = new URL(u); x.searchParams.set('w', w); x.searchParams.set('q', w > 1000 ? '75' : '70'); x.searchParams.set('auto', 'format'); x.searchParams.set('fit', 'crop'); return x.toString(); } catch { return u; } }
  if (w <= 800 && /\/yh-photos\/.+-L\.webp$/.test(u)) return u.replace(/-L\.webp$/, '-s.webp');
  return u;
}
window.yhImg = imgSrc;
// Card photos: browser picks 400 or 800px (Unsplash only – our uploads have one small copy). lazy = data-srcset, yLoad() sets it.
const CARD_SIZES = '(max-width:719px) 100vw, (max-width:1100px) 34vw, 300px';
function cardSrc(u, lazy) {
  const a = imgSrc(u, 800), p = lazy ? 'data-' : '';
  if (!/^https:\/\/images\.unsplash\.com\//.test(u)) return `${p}src="${esc(a)}"`;
  return `${p}src="${esc(a)}" ${p}srcset="${esc(imgSrc(u, 400))} 400w, ${esc(a)} 800w" sizes="${CARD_SIZES}"`;
}
async function shrinkPhoto(file, edge, q) {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const k = Math.min(1, edge / Math.max(bmp.width, bmp.height)), w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(bmp, 0, 0, w, h); if (bmp.close) bmp.close();
    const enc = type => new Promise(ok => c.toBlob(ok, type, q));
    let b = await enc('image/webp'); if (!b || b.type !== 'image/webp') b = await enc('image/jpeg');
    return b;
  } catch { return file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp' ? (file.size <= 2 * 1024 * 1024 ? file : null) : null; }
}
// PRICE PER m² ON SALE LISTINGS (owner, 2026-11-26, myhome.ge "26 ₾/m²"): sale + area only, in the price's small text
const perM2 = l => l.deal_type === 'sale' && l.price && l.area_m2 > 0 ? money(Math.round(l.price / l.area_m2)) + '/m²' : '';
function card(l) {
  const pm = perM2(l);
  const ph = l.photos && l.photos[0] ? `<img ${cardSrc(l.photos[0])} alt="${esc(photoAlt(l, 0))}" loading="lazy">` : `<span class="noimg">🏠</span>`;
  const dots = l.photos && l.photos.length > 1 ? `<div class="dots">${l.photos.slice(0, 5).map(() => '<i></i>').join('')}</div>` : '';
  const beds = l.bedrooms === 0 ? t('studio') : (l.bedrooms ?? '–');
  return `<a class="card" href="${YH.listingPath(l)}">
    <div class="ph">${ph}
      <span class="date">${shortDate(l.created_at)}</span>
      <span class="tags">${l.is_featured ? `<span class="tag top">${t('top')}</span>` : ''}${l.is_demo ? `<span class="tag demo">${t('demo')}</span>` : ''}${l.status !== 'active' ? `<span class="tag st">${esc(t('s_' + l.status))}</span>` : ''}</span>
      <button class="heart ${isSaved(l.id) ? 'on' : ''}" data-save="${l.id}" aria-label="${esc(t('saved'))}">${HEART}</button>
      <div class="pov">${money(l.price)}<small>${priceSuffix(l)}${pm ? ' · ' + esc(pm) : ''}</small></div>${dots}
      <span class="ybadges">${l.is_featured ? `<span class="yb yb-top">${t('top')}</span>` : ''}<span class="yb yb-price">${money(l.price)}${priceSuffix(l) ? ' ' + priceSuffix(l) : ''}</span><span class="yb yb-beds">${esc(l.bedrooms === 0 ? t('studio') : (l.bedrooms ?? '–') + ' ' + t(l.bedrooms === 1 ? 'bedroomOne' : 'bedrooms').toLowerCase())}</span>${l.bedrooms === 0 && l.property_type === 'studio' ? '' : `<span class="yb yb-type">${esc(t('t_' + l.property_type))}</span>`}${l.is_demo ? `<span class="yb yb-demo">${t('demo')}</span>` : ''}</span>
      ${l.photos && l.photos.length ? `<div class="ygal">${l.photos.slice(0, MAX_PHOTOS).map((u, i) => `<img ${cardSrc(u, i >= 2)} alt="${esc(photoAlt(l, i))}" ${i ? 'loading="lazy" ' : ''}decoding="async">`).join('')}</div>${l.photos.length > 1 ? `<div class="ydots${l.photos.length > 8 ? ' many' : ''}">${l.photos.slice(0, MAX_PHOTOS).map((u, i) => `<button type="button" data-yd="${i}" class="${i ? '' : 'on'}" aria-label="Photo ${i + 1}"></button>`).join('')}</div><button type="button" class="yarr yprev" data-yarr="-1" aria-label="${esc(t('ph_prev'))}"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><button type="button" class="yarr ynext" data-yarr="1" aria-label="${esc(t('ph_next'))}"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>` : ''}` : ''}
      <span class="ydate">${shortDate(l.created_at)}</span>
      <div class="yprice">${money(l.price)}${priceSuffix(l) || pm ? `<small>${esc(priceSuffix(l) + (pm ? ' · ' + pm : ''))}</small>` : ''}</div>
      ${l.photos && l.photos.length > 1 ? `<span class="ycount"><svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>${l.photos.length}</span>` : ''}
    </div>
    <div class="cb">
      <h3 class="ct">${esc(l.title)}</h3>
      <div class="loc"><b>●</b> ${esc(t('t_' + l.property_type))} · ${esc(l.district || cityLabel(l.city))}</div>
      <div class="specs-row"><span>${ICON.bed}${esc(beds)}</span><span>${ICON.bath}${l.bathrooms ?? '–'}</span><span class="${AM_ICON_ORDER.filter(a => (l.amenities || []).includes(a)).length >= 2 ? 'sp-a2' : ''}">${ICON.area}${l.area_m2 ? Math.round(l.area_m2) + 'm²' : '–'}</span>${AM_ICON_ORDER.filter(a => (l.amenities || []).includes(a)).slice(0, 2).map(a => `<span class="sp-am" title="${esc(t('am_' + a))}" aria-label="${esc(t('am_' + a))}">${AM_ICON[a]}</span>`).join('')}</div>
      <p class="yname"><span class="yn1">${esc(t(l.deal_type === 'sale' ? 'nameSale' : 'nameRent', { x: t('t_' + (l.deal_type === 'room' ? 'room' : l.property_type)) }))}</span>${l.district ? ` <span class="yn2">${esc(t('inPlace', { d: l.district }))}</span>` : ''}</p>
      <p class="yl1"><b>${esc(l.bedrooms === 0 ? t('studio') : (l.bedrooms ?? '–') + ' ' + t(l.bedrooms === 1 ? 'bedroomOne' : 'bedrooms').toLowerCase())}</b><span class="yty">${esc(t('t_' + l.property_type))}</span><em>${esc(t(l.deal_type === 'sale' ? 'forSaleShort' : l.deal_type === 'room' ? 't_room' : l.price_period === 'day' ? 'daily' : 'rent'))}</em><b>${l.bathrooms ?? '–'} ${esc(t('bathrooms').toLowerCase())}</b><b>${l.area_m2 ? Math.round(l.area_m2) + ' m²' : '– m²'}</b><b>${esc(l.posted_by ? t('by_' + l.posted_by) : shortDate(l.created_at))}</b></p>
      <div class="yfoot"><p class="ymeta"><svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg><span class="yaddr"><span class="ya1">${esc(!l.city || l.city === 'Phnom Penh' ? t('cityPP') : l.city)},</span> <span class="ya2">${esc(l.address || t('cambodia'))}</span></span></p>
      <span class="ylink">${esc(t('clickView', { x: t(l.deal_type === 'room' || l.property_type === 'room' ? 't_room' : ['house', 'villa'].includes(l.property_type) ? 't_' + l.property_type : 't_apartment').toLowerCase() }))} <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div>
      ${agentBar(l)}
    </div></a>`;
}
// 10 categories, 5 + 5 (owner, 2026-11-24): the 5th top item "Projects" opens New projects
document.addEventListener('click', e => { const b = e.target.closest('#dealTabs [data-go]'); if (!b) return; e.preventDefault(); e.stopPropagation(); go(b.dataset.go); }, true);
// Phone card photo slider like vietrent (owner, 2026-11-24: "pöttyök… ha rákattint a pöttyre, a képek mozognak a kártyán belül"):
// swipe the photos sideways or tap a dot; the dots follow. A tap on the photo itself still opens the listing.
document.addEventListener('click', e => {
  const d = e.target.closest('.ydots button'); if (!d) return;
  e.preventDefault(); e.stopPropagation();
  const g = d.closest('.ph').querySelector('.ygal'); yLoad(g, Number(d.dataset.yd)); g.scrollTo({ left: g.clientWidth * Number(d.dataset.yd), behavior: 'smooth' });
}, true);
// photos after the first two load only when the visitor gets near them (no traffic for photos nobody looks at)
function yLoad(g, i) { [i - 1, i, i + 1, i + 2].forEach(k => { const im = g.children[k]; if (im && im.dataset.src) { if (im.dataset.srcset) { im.srcset = im.dataset.srcset; im.removeAttribute('data-srcset'); } im.src = im.dataset.src; im.removeAttribute('data-src'); } }); }
// PC: round arrows on the photo (shown on hover) – same slider as the phone swipe
document.addEventListener('click', e => {
  const a = e.target.closest('.yarr'); if (!a) return;
  e.preventDefault(); e.stopPropagation();
  const g = a.closest('.ph').querySelector('.ygal'), n = g.children.length, w = Math.max(1, g.clientWidth);
  const i = (Math.round(g.scrollLeft / w) + Number(a.dataset.yarr) + n) % n; yLoad(g, i);
  g.scrollTo({ left: w * i, behavior: Math.abs(i - g.scrollLeft / w) > 1.5 ? 'auto' : 'smooth' });
}, true);
document.addEventListener('scroll', e => {
  const g = e.target; if (!g.classList || !g.classList.contains('ygal')) return;
  const i = Math.round(g.scrollLeft / Math.max(1, g.clientWidth)); yLoad(g, i);
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
    L.marker([l.lat, l.lng], { icon }).addTo(m).bindPopup(`<div class="pop">${l.photos?.[0] ? `<img src="${esc(imgSrc(l.photos[0], 800))}" alt="${esc(photoAlt(l, 0))}">` : ''}<b>${money(l.price)}${priceSuffix(l)}</b><br><a href="${YH.listingPath(l)}">${esc(l.title)}</a></div>`);
    pts.push([l.lat, l.lng]);
  });
  if (pts.length > 1) m.fitBounds(pts, { padding: [40, 40], maxZoom: 15 });
  setTimeout(() => m.invalidateSize(), 50);
}

// INSTANT FIRST PAGE (owner, 2026-11-25: "nem tudod egyből magát az oldalt betölteni?"): the server puts the live listings
// into the page (window.__YH_PRE, api/page.js), so the first page draws its cards at once – no database wait. Simple searches
// (deal, city, district, type, studio, budget, sort) are filtered here on the same rows; anything else asks the database.
// Used only for the first route after a page load (later navigations always read fresh data).
let PRE = window.__YH_PRE && Array.isArray(window.__YH_PRE.listings) ? window.__YH_PRE : null;
const PRE_KEYS = ['deal', 'city', 'type', 'q', 'beds', 'max', 'sort', 'limit', 'view'];
function fromPre(f) {
  if (!PRE) return null;
  const keys = Object.keys(f).filter(k => f[k] !== '' && f[k] != null);
  if (keys.some(k => !PRE_KEYS.includes(k))) return null;
  if (!PRE.complete && keys.some(k => k !== 'limit')) return null;
  let l = PRE.listings.slice();
  if (f.deal === 'daily') l = l.filter(x => x.deal_type === 'rent' && x.price_period === 'day'); else if (f.deal) l = l.filter(x => x.deal_type === f.deal);
  if (f.city && CITY_NAMES.includes(f.city)) l = l.filter(x => x.city === f.city);
  if (f.type === 'studio') l = l.filter(x => x.bedrooms === 0); else if (f.type === 'commercial') l = l.filter(x => COMMERCIAL.includes(x.property_type)); else if (f.type) l = l.filter(x => x.property_type === f.type);
  if (f.max) l = l.filter(x => Number(x.price) <= Number(f.max));
  if (f.beds) l = f.beds === '0' ? l.filter(x => x.bedrooms === 0) : l.filter(x => x.bedrooms >= Number(f.beds));
  if (f.q) { const s = f.q.replace(/[,()%*\\]/g, ' ').trim().slice(0, 60).toLowerCase(); if (s) l = l.filter(x => [x.district, x.title, x.address].some(v => String(v || '').toLowerCase().includes(s))); }
  const n = (v, d) => v == null ? d : Number(v), sort = f.sort || 'new';
  if (sort === 'cheap') l.sort((a, b) => n(a.price) - n(b.price)); else if (sort === 'exp') l.sort((a, b) => n(b.price) - n(a.price));
  else if (sort === 'big') l.sort((a, b) => n(b.area_m2, -1) - n(a.area_m2, -1)); else if (sort === 'small') l.sort((a, b) => n(a.area_m2, 1e12) - n(b.area_m2, 1e12));
  const ag = PRE.agents || {};
  return l.slice(0, f.limit || 300).map(x => Object.assign({}, x, { _agent: x.agent_id ? ag[x.agent_id] || null : null }));
}
async function fetchListings(f = {}) {
  const pre = fromPre(f); if (pre) return pre;
  let q = sb.from('yh_listings').select(LISTING_COLS).eq('status', 'active').eq('country', 'KH');
  if (f.deal === 'daily') q = q.eq('deal_type', 'rent').eq('price_period', 'day');   // Daily rent tab (owner, 2026-11-24)
  else if (f.deal) q = q.eq('deal_type', f.deal);
  if (f.city && CITY_NAMES.includes(f.city)) q = q.eq('city', f.city);
  if (f.type === 'studio') q = q.eq('bedrooms', 0); else if (f.type === 'commercial') q = q.in('property_type', COMMERCIAL); else if (f.type) q = q.eq('property_type', f.type);
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
  q = sort === 'cheap' ? q.order('price', { ascending: true }) : sort === 'exp' ? q.order('price', { ascending: false })
    : sort === 'big' ? q.order('area_m2', { ascending: false, nullsFirst: false }) : sort === 'small' ? q.order('area_m2', { ascending: true, nullsFirst: false })
    : q.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  const { data, error } = await q.limit(f.limit || 300);
  if (error) { toast(t('error') + error.message); return []; }
  const aids = [...new Set(data.map(l => l.agent_id).filter(Boolean))];   // agent photo + name for the card's agent bar
  if (aids.length) { const { data: ags } = await sb.from('yh_agents').select('id,name,kind,photo,phone,whatsapp,telegram').in('id', aids); const m = Object.fromEntries((ags || []).map(a => [a.id, a])); data.forEach(l => { l._agent = m[l.agent_id] || null; }); }
  return data;
}

// TOP ROW = Rent · Sell · Buy · Rooms · Projects (owner, 2026-11-26 07:11: "Sell-t nem kéne a felülre rakni? és a daily-t kivenni…
// daily… a rent termnél lesz"): Sell opens the post form for a sale listing; Daily is no tab any more – it is the "Daily" rental term
// (lease=day) of Rent, and deal=daily (URLs, landing pages, Hotel / Hostel) shows Rent as the picked tab.
const dealRow = (deal, cat, id) => `<div class="deal-tabs" id="${id}">${['rent','sell','sale','room'].map(d => d === 'sell' ? `<button type="button" class="dt-deal dt-sell" data-go="#/post?deal=sale">${t('sell')}</button>` : `<button type="button" data-deal="${d}" class="dt-deal ${d === deal || (d === 'rent' && deal === 'daily') ? 'on' : ''}">${t(d === 'sale' ? 'buy' : d)}</button>`).join('')}<button type="button" class="dt-deal dt-prj" data-go="#/projects">${t('projectsShort')}</button><span class="dt-sep" aria-hidden="true"></span>${CATS.map(([k, lab]) => `<button type="button" class="dt-cat ${k === cat ? 'on' : ''}" data-cat="${k}">${t(lab)}</button>`).join('')}</div>`;
function searchBox(p = {}, deal = p.deal || 'rent', cat = '') {
  return `${dealRow(deal, cat, 'dealTabs')}
  <form class="sbox" id="sbox">
    <div class="f f-want"><label><span class="mf-l">${t('wantTo')}</span><span class="mf-s">${t('wantShort')}</span></label><select name="want" id="wantSel" aria-label="${esc(t('wantTo'))}">${[['rent', t('rent')], ['sell', t('sell')], ['buy', t('buy')]].map(([v, lab]) => `<option value="${v}"${v === (deal === 'sale' ? 'buy' : 'rent') ? ' selected' : ''}>${esc(lab)}</option>`).join('')}</select></div>
    <div class="f"><label>${t('city')}</label><select name="city" id="citySel" aria-label="${esc(t('city'))}">${CITY_NAMES.map(c => `<option value="${esc(c)}"${c === (p.city || 'Phnom Penh') ? ' selected' : ''}>${esc(cityLabel(c))}</option>`).join('')}</select></div>
    <div class="f addr"><label><span class="mf-l">📍 </span>${t('district')}</label><select name="q" id="distSel" aria-label="${esc(t('district'))}">${districtOpts(p.city || 'Phnom Penh', p.q)}</select></div>
    <div class="f"><label><span class="mf-l">${t('type')}</span><span class="mf-s">${t('typeShort')}</span></label><select name="type" data-all><option value="">${t('any')}</option>${typeOpts(p.type, true)}</select></div>
    <div class="f"><label>${t('budget')}</label><select name="max" id="maxSel">${budgetOpts(deal || 'rent', p.max)}</select></div>
    <div class="sbtns"><a href="#/post" class="btn red sb-post">+ ${t('post')}</a><button class="btn blue">${t('search')} →</button></div>
  </form>
  <div class="chipbox home" id="chipBox">${chipRow(p, deal)}</div>`;
}
const budgetOpts = (deal, cur) => `<option value="">${t('any')}</option>` + BUDGET[deal].map(v => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>≤ ${money(v)}</option>`).join('');
// Sell in the search card → post form for a sale listing, with the picked type and city
const goSell = form => { const f = new FormData(form), p = new URLSearchParams({ deal: 'sale' }); if (TYPES.includes(f.get('type'))) p.set('type', f.get('type')); go('#/post?' + p); };
function wireSearchBox(onSubmit) {
  let deal = document.querySelector('#dealTabs .on').dataset.deal;
  document.getElementById('dealTabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.cat) { const p = new URLSearchParams({ deal: STAY_CATS.includes(b.dataset.cat) ? (deal === 'sale' ? 'sale' : 'daily') : deal === 'room' || (BIZ_CATS.includes(b.dataset.cat) && deal === 'daily') ? 'rent' : deal }); b.dataset.cat === 'studio' ? p.set('beds', '0') : p.set('type', b.dataset.cat); return go('#/search?' + p); } deal = b.dataset.deal; document.querySelectorAll('#dealTabs button').forEach(x => x.classList.toggle('on', x === b)); document.getElementById('maxSel').innerHTML = budgetOpts(deal); onSubmit && onSubmit(deal, true); };
  // Rent · Sell · Buy field in the search card (owner, 2026-11-26 07:08: "plusz mező, rent - sell - buy, alapból a renten"):
  // Buy = sale search, Rent = the rent tab picked (Daily / Rooms stay), Sell = the post form preset to a sale listing
  const want = document.getElementById('wantSel');
  want.onchange = () => { const v = want.value; if (v === 'sell') return; const d = v === 'buy' ? 'sale' : (deal === 'sale' ? 'rent' : deal); if (d === deal) return; deal = d; document.querySelectorAll('#dealTabs [data-deal]').forEach(x => x.classList.toggle('on', x.dataset.deal === d)); document.getElementById('maxSel').innerHTML = budgetOpts(deal); onSubmit && onSubmit(deal, true); };
  document.getElementById('dealTabs').addEventListener('click', e => { const b = e.target.closest('[data-deal]'); if (b) want.value = b.dataset.deal === 'sale' ? 'buy' : 'rent'; });
  document.getElementById('sbox').onsubmit = e => { e.preventDefault(); if (want.value === 'sell') return goSell(e.target); onSubmit(deal); };
  const cs = document.getElementById('citySel'), ds = document.getElementById('distSel');
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
  <div class="more-panel" ${panelOpen ? '' : 'hidden'}>
    <div class="mp-grid">
      ${sel('baths', [1, 2, 3].map(n => [n, n + '+']), t('bathrooms'))}
      ${sel('area', [30, 50, 80, 120, 200].map(n => [n, n + '+ m²']), t('minArea'))}
      ${deal === 'sale' ? sel('title', ['hard', 'soft', 'strata'].map(x => [x, t('tt_' + x)]), t('titleType')) : sel('lease', LEASE.map(x => [x, t('l_' + x)]), t('lease'))}
      ${sel('days', [1, 7, 30].map(n => [n, t('d_' + n)]), t('listedWithin'))}
    </div>
    <div class="chips mp-am">${quick.slice(2).map(a => chip('amen', a, sl('am_' + a)).replace('class="chip', 'class="chip mp-q')).join('')}${chip('by', 'owner', sl('f_owner')).replace('class="chip', 'class="chip mp-q')}${AMEN.filter(a => !quick.includes(a) && (deal === 'room' || !['private_bath', 'female_only'].includes(a))).map(a => chip('amen', a, sl('am_' + a))).join('')}${chip('photos', '1', sl('withPhotos'))}${deal === 'sale' ? '' : chip('by', 'agent', t('by_agent'))}</div>

  </div>`;
}
function wireChips(root, st, onChange) {
  root.onclick = e => {
    if (e.target.closest('[data-more]')) { panelOpen = !panelOpen; const pn = root.querySelector('.more-panel'); pn.hidden = !panelOpen; requestAnimationFrame(markLineStarts); root.querySelector('.chip.more').setAttribute('aria-expanded', panelOpen); return; }
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
// LOADING = SKELETON CARDS (owner, 2026-11-25: "betöltésnél ilyen megjelenés van, szerintem ez hiba" – no big white "Loading…" box):
// pale shimmering cards in the exact place and size of the real ones (4 in a row on PC, 1 on phones), so nothing jumps
const SKC = '<div class="card sk-card" aria-hidden="true"><div class="ph sk"></div><div class="cb"><span class="sk sk-l"></span><span class="sk sk-s"></span><span class="sk sk-s2"></span></div></div>';
const skelRow = (head = true) => `<section class="block skel-block" aria-busy="true">${head ? '<div class="bh"><span class="sk sk-h"></span></div>' : ''}<div class="row4">${SKC.repeat(4)}</div></section>`;
window.yhSkel = skelRow;
// CALL-TO-ACTION STRIPS BETWEEN THE LISTINGS (owner, 2026-11-25): a random strip (post a listing / daily rental / sale / room /
// become a partner / post a project / get verified) after every 4–6 listings on phones and every 8–12 on PC/tablet –
// never two of the same kind in a row. Texts CTA_V in i18n.js (cv_<key>, cvs_<key> = short phone line, cvb_<key> = button).
const CTA_KINDS = [['tg', 'https://t.me/' + TG_BOT + '?start=post'], ['rent', '#/post'], ['daily', '#/post'], ['sale', '#/post'], ['room', '#/post'], ['partner', '#/partners'], ['project', '#/partners?type=developers'], ['verify', '#/account?tab=settings&v=1']];
let ctaLast = '';
function ctaStrip() {
  let k; do { k = CTA_KINDS[Math.floor(Math.random() * CTA_KINDS.length)]; } while (k[0] === ctaLast); ctaLast = k[0];
  const d = document.createElement('div'); d.className = 'cta cta-x cta-' + k[0];
  // 'tg' = post through the Telegram bot (owner, 2026-11-27) – opens @yourhomeasiabot in Telegram, with the Telegram plane as icon
  const ext = /^https:/.test(k[1]);
  const ic = k[0] === 'tg' ? '<span class="ic ic-tg"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M20.7 4.1 3.1 10.9c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.3c.2.6.1.8.7.8.5 0 .7-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14.3c.3-1.2-.5-1.8-1.4-1.5z"/></svg></span>' : '<span class="ic">+</span>';
  d.innerHTML = `<div>${ic}<span class="cta-l">${esc(t('cv_' + k[0]))}</span><span class="cta-s">${esc(t('cvs_' + k[0]))}</span></div><a href="${k[1]}" class="btn"${ext ? ' target="_blank" rel="noopener"' : ''}>${esc(t('cvb_' + k[0]))} →</a>`;
  return d;
}
function placeCtas(root) {
  if (!root) return;
  root.querySelectorAll('.cta-x').forEach(x => x.remove());
  const phone = innerWidth <= 720, gap = () => phone ? 4 + Math.floor(Math.random() * 3) : 8 + Math.floor(Math.random() * 5);
  const cards = [...root.querySelectorAll('.row4 > .card, .grid > .card, .row-scroll > .card')].filter(c => c.offsetParent !== null);
  let n = 0, next = gap();
  cards.forEach((c, i) => {
    if (++n < next || i === cards.length - 1) return;
    const box = c.parentElement, blk = c.closest('section.block');
    if (phone) c.after(ctaStrip());
    else if (blk && box.classList.contains('row4')) { if ([...box.querySelectorAll(':scope > .card')].pop() !== c) return; blk.after(ctaStrip()); }
    else { const nx = c.nextElementSibling; if (nx && nx.offsetTop === c.offsetTop) return; c.after(ctaStrip()); }
    n = 0; next = gap();
  });
}
let ctaW = innerWidth <= 720;
addEventListener('resize', () => { const p = innerWidth <= 720; if (p !== ctaW) { ctaW = p; document.querySelectorAll('#blocks, #res').forEach(placeCtas); } });

// SERVICES + ACCOUNTS STRIP (owner, 2026-11-26: tokki.house "Services · Cabinets & Support" screenshot – "ezt át kéne venni… csak
// módosítani"): two groups of small white cards with a mini picture on top – YourHome services (Recommended · Verified advertisers ·
// Telegram alerts · Help) and Accounts & dashboards (Agent or agency · Owner). Sits right after the first homepage block.
function svcSection(all) {
  const l = all.find(x => x.is_featured && x.photos && x.photos[0]) || all.find(x => x.photos && x.photos[0]);
  const ok = '<svg class="svc-ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const arr = ' <span class="svc-ar">→</span>';
  const card = (cls, pic, k, href, attr = '') => `<a class="svc-c ${cls}" href="${href}"${attr}><div class="svc-p">${pic}</div><div class="svc-b"><b>${t(k + 't')}</b><span>${t(k + 's')}</span><em>${t(k + 'l')}${arr}</em></div></a>`;
  const feed = l ? `<img src="${esc(imgSrc(l.photos[0], 400))}" alt="${esc(photoAlt(l, 0))}" loading="lazy"><i class="svc-sh"></i><span class="svc-heart">${HEART}</span><span class="svc-fn"><span>${esc(t('t_' + l.property_type) || '')}${l.district ? ' · ' + esc(l.district) : ''}</span><small>${money(l.price)}${esc(priceSuffix(l))}</small></span>` : '<i class="svc-sh"></i>';
  const ver = `<div class="svc-rows"><span><i class="svc-dot b"></i>${t('svc2a')}${ok}</span><span><i class="svc-dot r"></i>${t('svc2b')}${ok}</span><span><i class="svc-dot b"></i>${t('svc2c')}${ok}</span></div><span class="svc-shield"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5.5c0 4.3-3 7.7-7 9-4-1.3-7-4.7-7-9V6z" fill="none" stroke="#fff" stroke-width="2"/></svg></span>`;
  const tg = `<div class="svc-tg"><span class="svc-tgi"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M20.7 4.1 3.1 10.9c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.3c.2.6.1.8.7.8.5 0 .7-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14.3c.3-1.2-.5-1.8-1.4-1.5z"/></svg></span><span class="svc-msg"><b>${t('svc3m')}</b>BKK1 · ${money(450)}${t('perMonth')}</span></div>`;
  const help = `<div class="svc-chat"><span class="q">${t('svc4q')}</span><span class="a"><b>${t('svc4n')}</b> ${t('svc4a')}</span></div>`;
  const bars = [30, 55, 35, 70, 45, 90, 60];
  const stats = `<div class="svc-wk"><span>${t('svc5w')}</span><div class="svc-bars">${bars.map((h, i) => `<i style="height:${h}%"${i === 5 ? ' class="r"' : ''}></i>`).join('')}</div></div>`;
  const own = `<div class="svc-own"><span class="svc-l1"><i class="svc-dot g"></i>${t('t_condo')} · BKK1</span><span class="svc-l2"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><span><b>${t('svc6m')}</b><small>Sokha · 15:00</small></span></span><span class="svc-l3">${t('svc6f')}<b>${t('svc6g')}</b></span></div>`;
  return `<section class="svc" aria-label="${esc(t('svcTitle'))}"><div class="svc-g svc-g1"><div class="bh"><h2>${t('svcTitle')}</h2></div><div class="svc-row">
    ${card('c-feed', feed, 'svc1', '#/search?sort=new')}${card('c-ver', ver, 'svc2', '#/experts')}${card('c-tg', tg, 'svc3', '#/search', ' data-svc-alert="1"')}${card('c-help', help, 'svc4', '#/faq')}
    </div></div><div class="svc-g svc-g2"><div class="bh"><h2>${t('svcAcc')}</h2></div><div class="svc-row">
    ${card('c-stat', stats, 'svc5', '#/account?as=advertiser')}${card('c-own', own, 'svc6', '#/post')}
    </div></div></section>`;
}
// TELEGRAM BOT POSTING – 4 STEPS (owner, 2026-11-27: "a fő oldalon… a Telegram boton keresztül… ilyen 4 kártyára kiírva… mehet"):
// homepage block after the third listing block – four white step cards (open the bot · send photos · one message · Publish), a blue
// "Post on Telegram" button (→ @yourhomeasiabot?start=post) and "Or post on the website", plus the line that a wrong listing can be
// fixed any time in the dashboard ("Telegram listings"). Texts tb* in i18n.js (TB, 8 languages), styles "TELEGRAM BOT POSTING".
function tgBotSection() {
  const bot = 'https://t.me/' + TG_BOT + '?start=post';
  const SVt = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const plane = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.7 4.1 3.1 10.9c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.3c.2.6.1.8.7.8.5 0 .7-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14.3c.3-1.2-.5-1.8-1.4-1.5z"/></svg>';
  const icons = [plane, SVt('<rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>'), SVt('<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>'), SVt('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>')];
  return `<section class="tgb" aria-label="${esc(t('tbTitle'))}"><div class="bh"><h2>${t('tbTitle')}</h2></div>
    <div class="tgb-row">${[1, 2, 3, 4].map(i => `<a class="tgb-c" href="${bot}" target="_blank" rel="noopener"><span class="tgb-n">${i}</span><span class="tgb-ic">${icons[i - 1]}</span><b>${t('tb' + i + 't')}</b><span class="tgb-s">${esc(t('tb' + i + 's'))}</span></a>`).join('')}</div>
    <div class="tgb-btns"><a class="btn tgb-go" href="${bot}" target="_blank" rel="noopener">${plane}${t('tbGo')}</a><a class="btn ghost" href="#/post">${t('tbWeb')}</a></div>
    <p class="tgb-fix">${t('tbFix')} <a href="#/account?tab=tglist">${t('dx_tgl')} →</a></p></section>`;
}
// MORE CITIES block (owner, 2026-11-26: "More cities blokk – ez is jó ötlet", vietrent screenshot): photo cards with a dark
// fade, the city name and "N properties"; the four main cities always show (one row of 4), any other city with live
// listings joins after them (most listings first). A city with no listings yet leads to the post form with that city.
// Photos: Unsplash / Pexels (free licences); a city without its own photo uses its newest listing photo, else a blue fade.
const PX = id => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;
const CITY_PH = {
  'Phnom Penh': 'https://images.unsplash.com/photo-1593510649240-9e85e0eb75ee',
  'Siem Reap': 'https://images.pexels.com/photos/18094112/pexels-photo-18094112/free-photo-of-siem-reap-angkor-wat.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Sihanoukville': PX(12001672),
  'Kampot': 'https://images.unsplash.com/photo-1584004251221-306eb7bb62af',
  'Battambang': 'https://images.unsplash.com/photo-1653714802676-6a50c7ead70e',
  'Koh Kong': 'https://images.pexels.com/photos/31957027/pexels-photo-31957027/free-photo-of-frodig-gron-dal-i-koh-kong-provinsen-kambodja.jpeg?auto=compress&cs=tinysrgb&w=800'
};
const MAIN_CITIES = Object.keys(CITY_PH);
async function cityCounts() {
  try {
    const { data } = await sb.from('yh_listings').select('city').eq('status', 'active').eq('country', 'KH').limit(10000);
    const n = {}; (data || []).forEach(r => { const c = r.city || 'Phnom Penh'; n[c] = (n[c] || 0) + 1; }); return n;
  } catch { return {}; }
}
function citiesBlock(counts, all) {
  const extra = Object.keys(counts).filter(c => !MAIN_CITIES.includes(c) && CITY_NAMES.includes(c)).sort((a, b) => counts[b] - counts[a]);
  // SIX cards in one row on PC, like the services strip (owner, 2026-11-26 08:04: "lehet 6 kártya mint a servicenál"): main
  // cities with listings first, then other cities with listings, then the remaining main cities – always 6
  const has = MAIN_CITIES.filter(c => counts[c]), empty = MAIN_CITIES.filter(c => !counts[c]);
  const list = has.concat(extra, empty).slice(0, 6);
  const cardC = c => {
    const n = counts[c] || 0;
    const lp = all.find(l => l.city === c && l.photos && l.photos[0]);
    const ph = CITY_PH[c] || (lp && lp.photos[0]);
    const href = n ? '#/search?' + new URLSearchParams({ city: c }) : '#/post?' + new URLSearchParams({ city: c });
    return `<a class="ccard" href="${href}">${ph ? `<img src="${esc(imgSrc(ph, 600))}" alt="${esc(c)}, Cambodia" loading="lazy" onerror="this.remove()">` : ''}<span class="cc-t"><b>${esc(cityLabel(c))}</b><small>${n ? t('cityProps').replace('{n}', n.toLocaleString('en-US')) : t('cityFirst')}</small></span></a>`;
  };
  return `<section class="block cities"><div class="bh"><h2>${t('moreCities')}</h2></div><div class="crow">${list.map(cardC).join('')}</div></section>`;
}

async function viewHome() {
  app.innerHTML = `<div class="wrap">${hero()}
    <div id="blocks">${skelRow()}${skelRow()}</div></div>`;
  let st = {};
  const box = document.getElementById('chipBox');
  const homeTools = () => {   // same tools as the results page: Subscribe opens the Telegram alert form, Newest opens the sorted results
    const fr = box.querySelector('.frow'); if (!fr || fr.querySelector('#notifyBtn')) return;
    fr.insertAdjacentHTML('beforeend', resultTools({}));
    fr.querySelector('#notifyBtn').onclick = () => alertModal({ deal: getDeal() });
    fr.querySelector('#sortSel').onchange = e => go('#/search?' + new URLSearchParams({ deal: getDeal(), ...(e.target.value === 'new' ? {} : { sort: e.target.value }) }));
  };
  const drawChips = () => { box.innerHTML = chipRow(st, getDeal()); homeTools(); };
  wireChips(box, st, drawChips);
  const getDeal = wireSearchBox((deal, tabOnly) => {
    if (tabOnly) { FKEYS.forEach(k => delete st[k]); return drawChips(); }
    const f = new FormData(document.getElementById('sbox')); const p = new URLSearchParams({ deal: deal === 'rent' && st.lease === 'day' ? 'daily' : deal });
    for (const k of ['city', 'q', 'type', 'max']) if (f.get(k)) p.set(k, f.get(k));
    for (const k of FKEYS) if (st[k] && !(k === 'lease' && st[k] === 'day')) p.set(k, st[k]);
    go('#/search?' + p);
  });
  homeTools();
  const [all, counts] = await Promise.all([fetchListings({ limit: 300 }), cityCounts()]);
  const rent = all.filter(l => l.deal_type === 'rent');
  const blocks = [block(t('recommended'), all.filter(l => l.is_featured).concat(all.filter(l => !l.is_featured)), '#/search?sort=new')
    , block(t('newest'), [...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), '#/search?sort=new')
    , block(t('cheapest'), rent.filter(l => l.price_period !== 'day').sort((a, b) => a.price - b.price), '#/search?deal=rent&sort=cheap')
    , block(t('rooms'), all.filter(l => l.deal_type === 'room'), '#/search?deal=room')
    , block(t('dailyBlock'), rent.filter(l => l.price_period === 'day'), '#/search?deal=daily')
    , block(t('forSale'), all.filter(l => l.deal_type === 'sale'), '#/search?deal=sale')].filter(Boolean);
  // More cities ONE PLACE HIGHER (owner, 2026-11-26 10:11: "More cities lehetne feljebb eggyel"): before the LAST listing block
  if (all.length) blocks.splice(Math.max(blocks.length - 1, 1), 0, citiesBlock(counts, all));
  const html = blocks.join('');
  // the listing blocks are drawn AT ONCE; the New projects block (owner, 2026-11-24) joins under them when it arrives
  // (owner, 2026-11-25: "nem tudod egyből magát az oldalt betölteni?")
  const b0 = document.getElementById('blocks'); if (!b0) return;
  b0.innerHTML = html;
  // "Want to rent out faster?" banner sits BETWEEN the first two category blocks, not under the search (owner, 2026-11-24 17:26)
  placeCtas(b0);
  const b1 = b0.querySelector('section.block');
  if (b1) { b1.insertAdjacentHTML('afterend', svcSection(all));
    const al = b0.querySelector('[data-svc-alert]'); if (al) al.onclick = e => { e.preventDefault(); alertModal({ deal: getDeal() }); }; }
  { const bl = b0.querySelectorAll(':scope > section.block:not(.cities)'); const at = bl[2] || bl[bl.length - 1]; if (at) at.insertAdjacentHTML('afterend', tgBotSection()); }
  const [prj, blog] = await Promise.all([PT.homeBlock(), BL.homeBlock()]);
  if (!b0.isConnected) return;
  if (prj) b0.insertAdjacentHTML('beforeend', prj);
  if (blog && html) b0.insertAdjacentHTML('beforeend', blog);   // Blog block last (owner, 2026-11-26, myhome.ge)
  else if (!html) b0.innerHTML = `<div class="empty">${t('noResults')}</div>`;
}

// Subscribe (Telegram) + Newest in the filters' second row – on the homepage too (owner, 2026-11-24 22:21: "hova tűnt?")
// sorting like tokki.house (owner, 2026-11-24 20:51): Newest · Price low→high · Price high→low · Area largest · Area smallest
const SORTS = ['cheap', 'exp', 'big', 'small'];
const resultTools = p => `<button type="button" class="ftg" id="notifyBtn" aria-label="${esc(t('notify'))}" data-tip="${esc(t('notify'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 4.1 3.1 10.9c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.3c.2.6.1.8.7.8.5 0 .7-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14.3c.3-1.2-.5-1.8-1.4-1.5zM8.9 13.6l8.6-5.4c.4-.3.8-.1.5.2l-7.4 6.7-.3 3.1-1.4-4.6z"/></svg><span>${t('subscribe')}</span></button><label class="fsort"><select id="sortSel" aria-label="${esc(t('sort'))}"><option value="new">${t('sortNew')}</option>${SORTS.map(k => `<option value="${k}" ${p.sort === k ? 'selected' : ''}>${t('so_' + k)}</option>`).join('')}</select></label>`;
async function viewSearch() {
  const p = Object.fromEntries(qs());
  // a landing address (/rent/phnom-penh/bkk1) carries slugs – use the list's exact names ("BKK1", "Siem Reap")
  if (p.city) { const c = CITY_NAMES.find(x => YH.slugify(x) === YH.slugify(p.city)); if (c) p.city = c; }
  if (p.q) { const d = distList(p.city).find(x => YH.slugify(x) === YH.slugify(p.q)); if (d) p.q = d; }
  const view = p.view === 'map' ? 'map' : 'grid';
  const deal = p.deal || '';
  const cat = p.beds === '0' ? 'studio' : (CATS.some(([k]) => k === p.type) ? p.type : '');
  app.innerHTML = `<div class="wrap">${hero(p, deal, cat)}
    <div id="res">${p.view === 'map' ? '' : skelRow(false)}</div></div>`;
  // Results tools in the filters' second row (owner, 2026-11-24: "a Telegram alerts oda nem kell kiírni, hanem egy Telegram
  // logó… ha rámegy, kiírja… ne legyen kiírva, hogy sort, csak newest… lenyílik… két sorba, nem háromba"):
  // More filters | Listings | Map | Telegram logo (bubble on hover) | Newest ▾
  document.querySelector('#chipBox .frow').insertAdjacentHTML('beforeend', resultTools(p));

  const upd = ch => { const n = new URLSearchParams(qs()); for (const k in ch) ch[k] ? n.set(k, ch[k]) : n.delete(k); go('#/search?' + n); };
  const st = {}; FKEYS.forEach(k => { if (p[k]) st[k] = p[k]; });
  if (deal === 'daily') st.lease = 'day';   // Daily = Rent with the rental term "Daily" (owner, 2026-11-26 07:11)
  wireChips(document.getElementById('chipBox'), st, s => { const ch = Object.fromEntries(FKEYS.map(k => [k, s[k] || '']));
    if (s.lease === 'day' && deal !== 'daily') Object.assign(ch, { deal: 'daily', lease: '', max: '' });
    else if (deal === 'daily' && s.lease !== 'day') Object.assign(ch, { deal: 'rent', max: '' });
    else if (deal === 'daily') ch.lease = '';
    upd(ch); });
  document.getElementById('dealTabs').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.deal) return upd({ deal: b.dataset.deal, max: '' });
    const k = b.dataset.cat;
    if (k === 'studio') return upd({ beds: p.beds === '0' ? '' : '0' });
    upd({ type: p.type === k ? '' : k, beds: p.beds === '0' ? '' : p.beds, ...(STAY_CATS.includes(k) && p.type !== k && deal !== 'sale' ? { deal: 'daily', max: '' } : {}), ...(BIZ_CATS.includes(k) && p.type !== k && (deal === 'daily' || deal === 'room') ? { deal: 'rent', max: '' } : {}) });
  };
  document.getElementById('sbox').onsubmit = e => { e.preventDefault(); const f = new FormData(e.target), w = f.get('want'); if (w === 'sell') return goSell(e.target);
    const nd = w === 'buy' ? 'sale' : (deal === 'sale' || !deal ? 'rent' : deal); upd({ deal: nd, city: f.get('city'), q: f.get('q'), type: f.get('type'), max: nd === deal ? f.get('max') : '' }); };
  document.getElementById('sortSel').onchange = e => upd({ sort: e.target.value === 'new' ? '' : e.target.value });
  document.getElementById('chipBox').addEventListener('click', e => { const b = e.target.closest('.vsw a'); if (!b) return; e.preventDefault(); e.stopPropagation(); upd({ view: b.dataset.v === 'map' ? 'map' : '' }); }, true);
  document.getElementById('notifyBtn').onclick = () => alertModal(p);
  const list = await fetchListings(p);
  const res = document.getElementById('res');
  if (!list.length) { res.innerHTML = `<div class="empty">${t('noResults')}<br><br><a class="btn red" href="#/post">+ ${t('post')}</a></div>`; return; }
  if (view === 'map') { res.innerHTML = '<div id="map"></div>'; listingsMap(document.getElementById('map'), list); }
  else res.innerHTML = `<div class="grid">${list.map(card).join('')}</div>`;
  placeCtas(res);
}
function alertModal(filters) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:2500;display:grid;place-items:center;padding:16px';
  wrap.innerHTML = `<form class="panel form alm" style="max-width:420px;width:100%"><h3>🔔 ${t('newListingsAlert')}</h3><p style="margin:0;color:var(--muted)">${t('newListingsSub')}</p>
    <label>${t('tgUser')}<input name="tg" placeholder="@username" required></label>
    <div class="alm-b" style="display:flex;gap:8px"><button class="btn blue">${t('tgSave')}</button><button type="button" class="btn ghost" data-x>${t('cancel')}</button></div></form>`;
  document.body.appendChild(wrap);
  wrap.querySelector('[data-x]').onclick = () => wrap.remove();
  wrap.onclick = e => { if (e.target === wrap) wrap.remove(); };
  wrap.querySelector('form').onsubmit = async e => {
    e.preventDefault(); const h = tgHandle(new FormData(e.target).get('tg')); if (!h) return toast(t('required'));
    const f = {}; for (const k of ['deal','city','type','max','q', ...FKEYS]) if (filters[k]) f[k] = filters[k];
    const { error } = await sb.from('yh_alerts').insert({ kind: 'new_listings', telegram: '@' + h, filters: f });
    if (error) return toast(t('error') + error.message);
    // alerts are live (2026-11-25): Telegram can only write to people who pressed Start in the bot → show that last step
    wrap.querySelector('form').innerHTML = `<h3>✅ ${t('tgSaved')}</h3><div style="display:flex;gap:8px"><a class="btn blue" href="https://t.me/${TG_BOT}?start=alerts" target="_blank" rel="noopener">${t('tgOpenBot')}</a><button type="button" class="btn ghost" data-x>OK</button></div>`;
    wrap.querySelector('[data-x]').onclick = () => wrap.remove();
  };
}

async function viewListing(id) {
  app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:24px">${t('loading')}</div></div>`;
  const { data: l, error } = await sb.from('yh_listings').select('*').eq('id', id).maybeSingle();
  if (error || !l) { app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:24px">404</div></div>`; return; }
  track(l, 'view');
  document.title = `${l.title} | YourHome Cambodia`;
  const photos = l.photos || [];
  const wa = digits(l.contact_whatsapp), ph = digits(l.contact_phone);
  const tgName = tgHandle(l.contact_telegram), tgNum = (wa || ph || '').replace('+', '');
  const tg = tgName || (tgNum ? '+' + tgNum : null);
  const beds = l.bedrooms === 0 ? t('studio') : (l.bedrooms ?? '–');
  app.innerHTML = `<div class="wrap"><a class="back" href="javascript:history.back()">${t('back')}</a>
  <div class="detail"><div>
    <div class="gal"><div class="main" id="gmain">${photos[0] ? `<img src="${esc(photos[0])}" alt="">` : '🏠'}</div>
      ${photos.length > 1 ? `<div class="thumbs">${photos.map((p, i) => `<img src="${esc(p)}" data-i="${i}" class="${i ? '' : 'on'}" alt="">`).join('')}</div>` : ''}</div>
    <div class="panel" style="margin-top:18px">
      <div class="tags" style="position:static;display:flex;gap:6px">${l.is_featured ? `<span class="tag top">${t('top')}</span>` : ''}${l.is_demo ? `<span class="tag demo">${t('demo')}</span>` : ''}<span class="tag" style="background:var(--blue-l);color:var(--blue)">${esc(t(l.deal_type === 'sale' ? 'buy' : l.deal_type))} · ${esc(t('t_' + l.property_type))}</span></div>
      <h1>${esc(l.title)}</h1>
      <div class="loc" style="font-size:13px"><b>●</b> ${esc([l.address, l.district, cityLabel(l.city)].filter(Boolean).join(', '))}</div>
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
        ${tg ? `<a class="btn tg wide" data-ev="telegram" href="https://t.me/${tg}" target="_blank" rel="noopener">Telegram${tgName ? ' @' + esc(tgName) : ''}</a>` : ''}
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
    <button class="btn ghost wide" id="tgbtn"><svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#29A9EB"/><path fill="#fff" d="M5.4 11.8 16.9 7.4c.5-.2 1 .1.8.9l-2 9.3c-.1.6-.5.8-1 .5l-3-2.2-1.5 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5.1c.2-.2 0-.3-.4-.1L8.2 13.7l-3-.9c-.6-.2-.6-.6.2-1z"/></svg> ${t('tgLogin')}</button>
    <div class="sep">${t('or')}</div>
    <form id="mform" class="form"><input type="email" name="email" placeholder="${esc(t('email'))}" required><button class="btn blue wide">${t('sendLink')}</button></form></div></div>`;
  store.set('yh_next', next || 'account');
  const redirectTo = location.origin + '/';
  document.getElementById('tgbtn').onclick = () => { location.href = '/api/tg-start'; };
  document.getElementById('gbtn').onclick = async () => { const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } }); if (error) toast(t('error') + error.message); };
  document.getElementById('mform').onsubmit = async e => {
    e.preventDefault(); const btn = e.target.querySelector('button'); btn.disabled = true;
    const { error } = await sb.auth.signInWithOtp({ email: new FormData(e.target).get('email').trim(), options: { emailRedirectTo: redirectTo, data: { signup_site: 'yourhome' } } });
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
    const pq = Object.fromEntries(qs());   // "Sell" in the search card → #/post?deal=sale&type=<type>
    if (pq.deal === 'sale') { l.deal_type = 'sale'; l.price_period = 'total'; }
    if (TYPES.includes(pq.type)) l.property_type = pq.type;
    if (CITY_NAMES.includes(pq.city)) l.city = pq.city;   // More cities card of a city with no listings yet → #/post?city=<city>
  }
  let photos = [...(l.photos || [])];
  const agBlock = await AG.postBlock(l, !editId);
  const sel = (name, opts, cur) => `<select name="${name}">${opts.map(([v, lab]) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`).join('')}</select>`;
  app.innerHTML = `<div class="wrap"><form class="narrow panel form" id="pform">
    <h1 style="margin:0">${editId ? t('editTitle') : t('postTitle')}</h1>
    <div class="row"><label>${t('dealType')} *${sel('deal_type', [['daily', t('dailyRent')], ['weekly', t('d_weekly')], ['rent', t('d_monthly')], ['longterm', t('d_longterm')], ['rentother', t('d_other')], ['sale', t('buy')], ['room', t('room')]], postDeal(l))}</label>
      <label>${t('propType')} *<select name="property_type">${typeOpts(l.property_type, false)}</select></label></div>
    <label>${t('title')} *<input name="title" required minlength="5" maxlength="140" placeholder="${esc(t('titlePh'))}" value="${esc(l.title || '')}"></label>
    <div class="row"><label>${t('price')} *<input name="price" type="number" min="0" step="1" required value="${l.price ?? ''}"></label>
      <label id="pPerL">${t('period')}${sel('price_period', [['day', t('p_day')], ['week', t('p_week')], ['month', t('p_month')], ['other', t('p_other')], ['total', t('p_total')]], l.price_period)}</label></div>
    <label id="pNoteL"${l.price_period === 'other' ? '' : ' hidden'}>${t('p_otherNote')} *<input name="period_note" maxlength="40" placeholder="${esc(t('p_otherPh'))}" value="${esc(l.period_note || '')}"></label>
    <div class="row3"><label>${t('bedrooms')}${sel('bedrooms', [['', t('notSet')], ['0', t('studio')], ['1', '1 ' + t('bedroomOne')], ['2', '2 ' + t('bedrooms').toLowerCase()], ['3', '3 ' + t('bedrooms').toLowerCase()], ['4', '4 ' + t('bedrooms').toLowerCase()], ['5', '5+ ' + t('bedrooms').toLowerCase()], ...(l.bedrooms > 5 ? [[String(l.bedrooms), l.bedrooms + ' ' + t('bedrooms').toLowerCase()]] : [])], l.bedrooms ?? '')}</label>
      <label>${t('bathrooms')}${sel('bathrooms', [['', t('notSet')], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5+'], ...(l.bathrooms > 5 || l.bathrooms === 0 ? [[String(l.bathrooms), String(l.bathrooms)]] : [])], l.bathrooms ?? '')}</label>
      <label>${t('area')}<input name="area_m2" type="number" min="0" step="0.1" value="${l.area_m2 ?? ''}"></label></div>
    <label class="chk"><input type="checkbox" name="furnished" ${l.furnished ? 'checked' : ''}> ${t('furnished')}</label>
    <div class="row"><label>${t('postedBy')}${sel('posted_by', [['', t('notSet')], ['owner', t('by_owner')], ['agent', t('by_agent')]], l.posted_by ?? '')}</label>
      <label>${t('minLease')}${sel('min_lease', [['', t('notSet')], ...LEASE.map(x => [x, t('l_' + x)])], l.min_lease ?? '')}</label></div>
    <div class="row"><label>${t('titleType')} (${t('saleOnly')})${sel('title_type', [['', t('notSet')], ...['hard', 'soft', 'strata'].map(x => [x, t('tt_' + x)])], l.title_type ?? '')}</label>
      <label class="chk" style="align-self:end;padding-bottom:10px"><input type="checkbox" name="foreigner_ok" ${l.foreigner_ok ? 'checked' : ''}> ${t('foreignerOk')} (${t('saleOnly')})</label></div>
    <div><div class="mp-lab" style="margin-top:0">${t('amenities')}</div><div class="amen-pick">${AMEN.map(a => `<label class="chk"><input type="checkbox" name="amen" value="${a}" ${(l.amenities || []).includes(a) ? 'checked' : ''}> ${t('am_' + a)}</label>`).join('')}</div></div>
    <label>${t('description')}<textarea name="description" maxlength="5000">${esc(l.description || '')}</textarea></label>
    <div class="row"><label>${t('city')} *<select name="city" id="pCity" required>${CITY_NAMES.map(c => `<option value="${esc(c)}"${c === (l.city || 'Phnom Penh') ? ' selected' : ''}>${esc(cityLabel(c))}</option>`).join('')}</select></label>
      <label>${t('district')} *<select name="district" id="pDist" required><option value="">—</option>${(l.district && !distList(l.city || 'Phnom Penh').includes(l.district) ? [l.district, ...distList(l.city || 'Phnom Penh')] : distList(l.city || 'Phnom Penh')).map(d => `<option ${l.district === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></label></div>
    ${(() => { const ap = parseAddr(l.address), inp = (k, ph) => `<label>${t('ad_' + k)}<input name="a_${k}" maxlength="${k === 'street' ? 80 : 50}" placeholder="${esc(ph)}" value="${esc(ap[k] || '')}"></label>`;
      return `<div><div class="mp-lab" style="margin-top:0">${t('address')} <span style="color:var(--muted);font-weight:400">(${t('optional')})</span></div>
      <div class="row">${inp('house', '24')}${inp('street', '278')}</div>
      <div class="row">${inp('village', '3')}${inp('sangkat', 'Boeung Keng Kang 1')}</div>
      <div class="row">${inp('khan', 'Chamkarmon')}<span></span></div></div>`; })()}
    <label>${t('pickMap')}<div class="pick-map" id="pmap"></div></label>
    <label>${t('photos')}<input type="file" id="files" accept="image/jpeg,image/png,image/webp" multiple></label>
    <p class="phint">${esc(t('photosHint'))} <b id="pcount"></b></p>
    <div class="prev" id="prev"></div>
    <div class="row"><label>${t('contactName')}<input name="contact_name" maxlength="80" value="${esc(l.contact_name || '')}"></label>
      <label>${t('phone')}<input name="contact_phone" maxlength="30" value="${esc(l.contact_phone || '')}" placeholder="+855 …"></label></div>
    <div class="row"><label>${t('telegram')}<input name="contact_telegram" maxlength="40" value="${esc(l.contact_telegram || '')}" placeholder="@username"></label>
      <label>${t('whatsapp')}<input name="contact_whatsapp" maxlength="30" value="${esc(l.contact_whatsapp || '')}" placeholder="+855 …"></label></div>
    ${agBlock}
    <button class="btn red wide" id="pbtn">${editId ? t('saveChanges') : t('publish')}</button></form></div>`;
  { const pf = document.getElementById('pform'), per = pf.price_period, dl = pf.deal_type, noteL = document.getElementById('pNoteL');
    // RENT KINDS (owner, 2026-11-25: "daily rent, weekly rent, monthly rent, long term rent… other request"): the rent kind sets
    // the price period itself; only Rooms keep the "Price per" choice
    const KP = { daily: 'day', weekly: 'week', rent: 'month', longterm: 'month', rentother: 'other', sale: 'total' };
    const sync = e => { if (KP[dl.value]) per.value = KP[dl.value]; else if (per.value === 'total') per.value = 'month';
      if (e?.target === dl && dl.value === 'longterm' && !['6m', '1y'].includes(pf.min_lease.value)) pf.min_lease.value = '1y';
      document.getElementById('pPerL').hidden = !!KP[dl.value];
      noteL.hidden = per.value !== 'other'; noteL.querySelector('input').required = per.value === 'other'; };
    per.addEventListener('change', sync); dl.addEventListener('change', sync); sync(); }
  let pos = l.lat && l.lng ? [l.lat, l.lng] : null;
  const m = L.map('pmap').setView(pos || cityCenter(l.city || 'Phnom Penh'), pos ? 16 : 13); tiles(m); maps.push(m);
  document.getElementById('pCity').addEventListener('change', e => {   // every city has its own district list (owner, 2026-11-24 20:28)
    document.getElementById('pDist').innerHTML = '<option value="">—</option>' + distList(e.target.value).map(d => `<option>${esc(d)}</option>`).join('');
    if (!pos) m.setView(cityCenter(e.target.value), 13);
  });
  let mk = pos ? L.marker(pos).addTo(m) : null;
  m.on('click', e => { pos = [e.latlng.lat, e.latlng.lng]; mk ? mk.setLatLng(pos) : (mk = L.marker(pos).addTo(m)); });
  setTimeout(() => m.invalidateSize(), 60);
  const drawPrev = () => { document.getElementById('prev').innerHTML = photos.map((p, i) => `<div class="pi"><img src="${esc(imgSrc(p, 800))}" alt=""><button type="button" data-rm="${i}" aria-label="${esc(t('del'))}"><svg class="xic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>`).join(''); const c = document.getElementById('pcount'); if (c) c.textContent = t('photosCount', { n: photos.length }); const fi = document.getElementById('files'); if (fi) fi.disabled = photos.length >= MAX_PHOTOS; };
  drawPrev();
  document.getElementById('prev').onclick = e => { const b = e.target.closest('[data-rm]'); if (b) { photos.splice(+b.dataset.rm, 1); drawPrev(); } };
  // UPLOADED PHOTOS ARE OPTIMIZED IN THE BROWSER (owner, 2026-11-25 – the Study portal's SWImageOpt rule: "ne legyen nagy
  // vercel, github forgalom"): each photo is turned upright, resized and re-encoded as WebP (JPEG where WebP cannot be made),
  // camera EXIF/location dropped, BEFORE it leaves the phone: a large copy (long edge 1600px, quality .8 → "…-L.webp") for the
  // popup and a small copy (800px, .72 → "…-s.webp") for the cards. Only Supabase Storage holds photos – never the repo.
  document.getElementById('files').onchange = async e => {
    const files = [...e.target.files].slice(0, MAX_PHOTOS - photos.length);
    if (e.target.files.length > files.length) toast(t('photosCount', { n: MAX_PHOTOS }));
    const hint = document.getElementById('pcount'); if (hint && files.length) hint.textContent = t('photosWait');
    for (const f of files) {
      if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(f.type) || f.size > 30 * 1024 * 1024) { toast(t('error') + f.name); continue; }
      const big = await shrinkPhoto(f, 1600, .8), small = await shrinkPhoto(f, 800, .72);
      if (!big || big.size > 2 * 1024 * 1024) { toast(t('error') + f.name); continue; }
      const webp = big.type === 'image/webp', base = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const path = webp ? base + '-L.webp' : base + '.jpg';
      const { error } = await sb.storage.from('yh-photos').upload(path, big, { contentType: big.type, cacheControl: '31536000' });
      if (error) { toast(t('error') + error.message); continue; }
      if (webp && small && small.type === 'image/webp') await sb.storage.from('yh-photos').upload(base + '-s.webp', small, { contentType: 'image/webp', cacheControl: '31536000' });
      photos.push(sb.storage.from('yh-photos').getPublicUrl(path).data.publicUrl); drawPrev();
    }
    drawPrev(); e.target.value = '';
  };
  document.getElementById('pform').onsubmit = async e => {
    e.preventDefault(); const btn = document.getElementById('pbtn'); btn.disabled = true;
    const fd = new FormData(e.target); const f = Object.fromEntries(fd);
    const num = v => v === '' || v == null ? null : Number(v);
    const row = {
      deal_type: ['daily', 'weekly', 'longterm', 'rentother'].includes(f.deal_type) ? 'rent' : f.deal_type, property_type: f.property_type, title: f.title.trim(), description: f.description.trim() || null,
      price: Number(f.price), price_period: ({ sale: 'total', daily: 'day', weekly: 'week', rent: 'month', longterm: 'month', rentother: 'other' })[f.deal_type] || f.price_period,
      period_note: (f.deal_type === 'rentother' || (f.deal_type === 'room' && f.price_period === 'other')) ? (String(f.period_note || '').trim().slice(0, 40) || null) : null,
      bedrooms: num(f.bedrooms), bathrooms: num(f.bathrooms), area_m2: num(f.area_m2), furnished: !!f.furnished,
      amenities: fd.getAll('amen').filter(a => AMEN.includes(a)), posted_by: f.posted_by || null,
      min_lease: f.deal_type === 'sale' ? null : f.deal_type === 'longterm' && !['6m', '1y'].includes(f.min_lease) ? '1y' : (f.min_lease || null),
      title_type: f.deal_type === 'sale' ? (f.title_type || null) : null, foreigner_ok: f.deal_type === 'sale' ? !!f.foreigner_ok : null,
      city: CITY_NAMES.includes(f.city) ? f.city : 'Phnom Penh', district: f.district, address: composeAddr(Object.fromEntries(ADDR.map(([k, pre]) => { let v = String(f['a_' + k] || '').trim().replace(/,/g, ' '); if (v.toLowerCase().startsWith(pre.toLowerCase())) v = v.slice(pre.length).trim(); return [k, v]; }))).slice(0, 200) || null, lat: pos ? pos[0] : null, lng: pos ? pos[1] : null, photos,
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

// WHO ARE YOU? (owner, 2026-11-25: "legyen ugyanúgy, mint a study portálon, választási lehetősége, hogy ő hirdető, vagy ő
// kereső"): the account asks once – "I'm looking for a home" (seeker) or "I want to advertise" (advertiser) – kept in
// user_metadata.role; the Looking · Advertising switch on top of the dashboard changes it any time.
const ROLE_I = { seeker: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>', advertiser: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/><path d="M12 11v5M9.5 13.5h5"/>', agent: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>' };
ROLE_I.owner = ROLE_I.advertiser;
const roleSwitch = role => `<div class="deal-tabs role-sw">${['seeker', 'advertiser'].map(r => `<button type="button" data-as="${r}" class="${r === role ? 'on' : ''}"><svg class="rsi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ROLE_I[r]}</svg>${t('r_' + r + 'Short').replace(/^[^\p{L}]+/u, '')}</button>`).join('')}</div>`;   // drawn icon, never the emoji (2026-11-25)
function bindRoleSwitch() { app.querySelectorAll('[data-as]').forEach(b => b.onclick = () => go('#/account?as=' + b.dataset.as)); }
// Terms must be accepted once (owner, 2026-11-25: "el kell fogadni a terms and conditions is") – stored with its version
const TERMS_V = '2026-11-25';
async function setRole(role, terms, kind) {
  const md = user.user_metadata || {};
  if (md.role === role && !terms && !kind) return;
  const d = { role }; if (kind) d.adv_kind = kind; if (terms) { d.terms_version = TERMS_V; d.terms_accepted_at = new Date().toISOString(); }
  const { data, error } = await sb.auth.updateUser({ data: d });
  if (error) toast(t('error') + error.message); else if (data?.user) user = data.user;
}
// ACCOUNT TYPE POPUP (owner, 2026-11-25: "legyen az az ablak, amit már beillesztettem" – the Study portal's Tenant / Landlord
// window): signed in without a role or without accepted Terms → a modal over the page: Tenant | Landlord · Agent · Agency
// (then Owner / Agent / Agency), REQUIRED Terms tick, Continue. Opens on sign-in on any page and on the dashboard.
const needsRole = () => { const m = user?.user_metadata || {}; return !!user && (!['seeker', 'advertiser'].includes(m.role) || !m.terms_accepted_at); };
function rolePopup(onDash) {
  if (!needsRole() || document.querySelector('.rpop') || /^\/admin/.test(location.pathname)) return;   // never over the admin page (owner, 2026-11-25)
  const m = user.user_metadata || {};
  let pick = m.role === 'seeker' ? 'seeker' : m.role === 'advertiser' ? 'advertiser' : '', kind = ['owner', 'agent', 'agency'].includes(m.adv_kind) ? m.adv_kind : 'owner';
  const w = document.createElement('div'); w.className = 'rpop'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
  const draw = () => {
    w.innerHTML = `<div class="rpop-c"><button type="button" class="rpop-x" aria-label="${esc(t('cancel'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <b class="rpop-t">${t('r_title')}</b><p class="rpop-q">${t('r_who')}</p>
      <div class="rpop-tiles">
        <button type="button" data-r="seeker" class="${pick === 'seeker' ? 'on' : ''}"><span class="rpi"><svg viewBox="0 0 24 24" aria-hidden="true">${ROLE_I.seeker}</svg></span><b>${t('r_tenant')}</b><small>${t('r_tenantSub')}</small></button>
        <button type="button" data-r="advertiser" class="${pick === 'advertiser' ? 'on' : ''}"><span class="rpi"><svg viewBox="0 0 24 24" aria-hidden="true">${ROLE_I.owner}</svg></span><b>${t('r_landlord')}</b><small>${t('r_landlordSub')}</small></button>
      </div>
      ${pick === 'advertiser' ? `<div class="rpop-kind"><span>${t('r_iam')}</span>${['owner', 'agent', 'agency'].map(k => `<button type="button" data-k="${k}" class="${k === kind ? 'on' : ''}">${t('k_' + k)}</button>`).join('')}</div>` : ''}
      <label class="rpop-terms"><input type="checkbox" id="rpTerms"${w.dataset.ok ? ' checked' : ''}><span>${t('r_terms').replace('{terms}', `<a href="/terms" target="_blank" rel="noopener">${t('terms')}</a>`).replace('{privacy}', `<a href="/privacy" target="_blank" rel="noopener">${t('privacy')}</a>`)}</span></label>
      <button type="button" class="btn red rpop-go"${pick ? '' : ' disabled'}>${t('r_continue')}</button>
      <p class="rpop-note">${t('r_later')}</p></div>`;
    w.querySelector('.rpop-x').onclick = () => { w.remove(); document.body.classList.remove('rpop-open'); if (onDash) go('#/'); };
    w.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { pick = b.dataset.r; draw(); });
    w.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { kind = b.dataset.k; draw(); });
    const cb = w.querySelector('#rpTerms'); cb.onchange = () => { if (cb.checked) w.dataset.ok = '1'; else delete w.dataset.ok; };
    w.querySelector('.rpop-go').onclick = async e => {
      if (!pick) return;
      if (!cb.checked) { toast(t('r_termsNeeded'), 4000); cb.closest('label').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 }); return; }
      e.currentTarget.disabled = true;
      await setRole(pick, true, pick === 'advertiser' ? kind : null);
      if (needsRole()) { e.currentTarget.disabled = false; return; }
      w.remove(); document.body.classList.remove('rpop-open');
      if (pick === 'advertiser' && kind !== 'owner') return go('#/account?tab=agent');
      if (onDash) route();
    };
  };
  draw(); document.body.appendChild(w); document.body.classList.add('rpop-open');
}
// ADMIN: yh_admins / yh_is_admin(); the dashboard itself is admin.js (route /admin)
let isAdmin = null;
const adminCheck = async () => { if (isAdmin === null && user) { const { data } = await sb.rpc('yh_is_admin'); isAdmin = !!data; } return isAdmin; };
async function viewAccount() {
  if (!user) return viewLogin('account');
  if (qs().get('tab') === 'admin') return go('#/admin');
  const asQ = qs().get('as');
  if (asQ === 'seeker' || asQ === 'advertiser') { await setRole(asQ); return go('#/account'); }
  const md0 = user.user_metadata || {};
  let role = md0.role;
  if ((role !== 'seeker' && role !== 'advertiser') || !md0.terms_accepted_at) {
    app.innerHTML = `<div class="wrap" style="margin-top:26px">${skelRow(false)}</div>`;
    return rolePopup(true);
  }
  if (role === 'seeker') return viewSeeker();
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
  // ADVERTISER DASHBOARD = THE ADMIN PANEL'S LOOK (owner, 2026-11-25: "hasonló legyen az agentek, advertiserek dashboardja mint
  // az enyém"): admin.css (loaded here too), top bar, big SECTION CARDS to move between parts, "What needs you now", number tiles,
  // views-per-day chart, a message READER (list + open message with one-tap answer buttons), statistics and a listings manager –
  // with the advertiser's OWN data only. Read / unread of messages is kept in this browser (localStorage yh_inq_read).
  if (!document.getElementById('admcss')) { const lk = document.createElement('link'); lk.id = 'admcss'; lk.rel = 'stylesheet'; lk.href = '/admin.css?v=2'; document.head.appendChild(lk); }
  const SV = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const DI = { overview: SV('<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>'),
    messages: SV('<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6H3v-6z"/>'), stats: SV('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    listings: SV('<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>'), tglist: SV('<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 8-6"/>'), post: SV('<path d="M12 5v14M5 12h14"/>'), agent: SV('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.4-4 4.4-6 8-6s6.6 2 8 6"/>'),
    telegram: SV('<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 8-6"/>'), settings: SV('<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>'),
    back: SV('<path d="M19 12H5M11 6l-6 6 6 6"/>'), out: SV('<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>'), check: SV('<path d="m5 12 5 5 9-10"/>'), open: SV('<path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
    phone: SV('<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2"/>'), wa: SV('<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/>'), mail: SV('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'), shield: SV('<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6z"/>') };
  const readSet = new Set(store.get('yh_inq_read', []));
  const unread = inq.filter(i => !readSet.has(i.id));
  const live = mine.filter(l => l.status === 'active');
  const isAgent = ['agent', 'agency'].includes((user.user_metadata || {}).adv_kind), noProfile = !(myAgents || []).length;
  // TELEGRAM LISTINGS (owner, 2026-11-27: "legyen egy olyan külön kocka, külön menü… a telegramos hirdetéseim"): listings posted through
  // @yourhomeasiabot (source 'bot') or taken from the agent's own channel (source 'channel'), with Edit / status / delete, and the channel
  // posts still waiting for approval (hidden) with a Publish button – a wrong listing is fixed here.
  const tgl = mine.filter(l => l.source === 'bot' || l.source === 'channel'), tgWait = tgl.filter(l => l.source === 'channel' && l.status === 'hidden');
  const SECS = ['overview', 'messages', 'stats', 'listings', 'tglist', 'post', 'agent', 'telegram', 'settings'];
  const secName = { overview: t('overview'), messages: t('inquiries'), stats: t('stats'), listings: t('my'), tglist: t('dx_tgl'), post: t('post'), agent: AG.label('myAgent'), telegram: t('tgAlerts'), settings: t('settings') };
  const secSub = { overview: `${views.length} ${t('views').toLowerCase()}`, messages: unread.length ? `${unread.length} ${t('dx_unread')}` : `${inq.length}`, stats: `${uniq} ${t('dx_people')}`,
    listings: `${live.length} ${t('dx_live')}`, tglist: tgWait.length ? t('dx_tglWaitN').replace('{n}', tgWait.length) : t('dx_tglSub').replace('{n}', tgl.length), post: t('dx_free'), agent: noProfile ? t('dx_create') : `${myAgents.length}`, telegram: alerts.length ? t('dx_on') : t('dx_off'),
    settings: vState === 'done' ? '✓ ' + t('ad_verified') : vState === 'pending' ? '⏳' : t('v_title') };
  const panel = (title, inner, extra = '') => `<section class="apanel"><div class="aph"><h3>${title}</h3>${extra}</div>${inner}</section>`;
  const emptyB = x => `<div class="aempty">${x}</div>`;
  const kpi = (n, label, sub, col, go) => `<${go ? `a href="${go}"` : 'div'} class="akpi k-${col}"><b>${n}</b><span>${label}</span>${sub ? `<small>${sub}</small>` : ''}</${go ? 'a' : 'div'}>`;
  const thumb = l => l?.photos?.[0] ? `<img src="${esc(imgSrc(l.photos[0], 400))}" alt="" loading="lazy">` : `<span class="anoimg">${DI.listings}</span>`;
  const daysArr = []; for (let i = 29; i >= 0; i--) daysArr.push(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10));
  const perDay = daysArr.map(d => { const v = views.filter(e => e.created_at.slice(0, 10) === d); return { d, views: v.length, people: new Set(v.map(e => e.visitor)).size }; });
  const chart = () => { if (!views.length) return emptyB(t('noStats'));
    const W = 720, H = 160, n = perDay.length, bw = W / n, m = Math.max(...perDay.map(d => d.views), 1), y = v => H - (v / m) * (H - 8);
    const lab = d => new Date(d + 'T00:00').toLocaleDateString(lang === 'km' ? 'km-KH' : lang, { day: 'numeric', month: 'short' }); const idx = [0, 7, 14, 21, 29];
    return `<div class="achart"><div class="aleg"><span class="lg-a">${t('visitors')}</span><span class="lg-b">${t('views')}</span><em>max ${m}</em></div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(t('views'))}">
      ${[.25, .5, .75, 1].map(f => `<line x1="0" x2="${W}" y1="${y(m * f)}" y2="${y(m * f)}" class="gl" vector-effect="non-scaling-stroke"/>`).join('')}
      ${perDay.map((d, i) => `<g><title>${lab(d.d)}: ${d.people} · ${d.views}</title><rect class="bb" x="${i * bw + bw * .12}" y="${y(d.views)}" width="${bw * .76}" height="${H - y(d.views)}"/><rect class="ba" x="${i * bw + bw * .27}" y="${y(d.people)}" width="${bw * .46}" height="${H - y(d.people)}"/></g>`).join('')}</svg>
      <div class="axl">${idx.map(i => `<span style="left:${(i + .5) * 100 / n}%">${lab(perDay[i].d)}</span>`).join('')}</div></div>`; };
  const bars = (list, keyFn) => { const mm = {}; list.forEach(e => { const k = keyFn(e); mm[k] = (mm[k] || 0) + 1; }); const rows = Object.entries(mm).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (!rows.length) return emptyB(t('noStats')); const top = rows[0][1], tot = list.length || 1;
    return `<div class="abars">${rows.map(([k, v]) => `<div class="abar"><div class="abl"><span>${esc(k)}</span><em>${v}<i>${Math.round(v * 100 / tot)}%</i></em></div><div class="abt"><span style="width:${Math.max(2, v * 100 / top)}%"></span></div></div>`).join('')}</div>`; };
  const ago = d => { const x = (Date.now() - new Date(d)) / 1000; return x < 3600 ? Math.max(1, Math.floor(x / 60)) + ' min' : x < 86400 ? Math.floor(x / 3600) + ' h' : shortDate(d); };
  const msgRow = (i, on) => `<button class="amsg${readSet.has(i.id) ? '' : ' unread'}${on ? ' on' : ''}" data-msg="${i.id}"><span class="adot"></span><div><div class="amh"><b>${esc(i.name || '—')}</b><time>${ago(i.created_at)}</time></div>
    <div class="ams"><span class="atag t-blue">${esc(t('dx_msg'))}</span>${esc(byId[i.listing_id]?.title || '')}</div><div class="amp">${esc((i.message || i.contact || '').slice(0, 110))}</div></div></button>`;
  const answerBtns = c => { const raw = String(c || ''), out = [], em = (raw.match(/[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}/i) || [])[0], tg = tgHandle(raw.trim().startsWith('@') || /t\.me\//i.test(raw) ? raw : ''), ph = digits(raw.includes('@') ? '' : raw);
    if (ph && ph.length >= 7) { const intl = ph.startsWith('0') ? '855' + ph.slice(1) : ph; out.push(`<a class="adb ad-call" href="tel:+${intl}">${DI.phone}${esc(t('call'))}</a>`, `<a class="adb ad-wa" href="https://wa.me/${intl}" target="_blank" rel="noopener">${DI.wa}WhatsApp</a>`, `<a class="adb ad-tg" href="https://t.me/+${intl}" target="_blank" rel="noopener">${DI.telegram}Telegram</a>`); }
    if (tg) out.push(`<a class="adb ad-tg" href="https://t.me/${esc(tg)}" target="_blank" rel="noopener">${DI.telegram}@${esc(tg)}</a>`);
    if (em) out.push(`<a class="adb ad-mail" href="mailto:${esc(em)}?subject=${encodeURIComponent('YourHome.asia')}">${DI.mail}Email</a>`);
    return out.join(''); };
  let body = '';
  if (tab === 'overview') {
    const need = [
      unread.length && [`${unread.length} ${t('dx_unreadMsgs')}`, t('dx_openReader'), '#/account?tab=messages', 'red', DI.messages],
      isAgent && noProfile && [t('r_agentStart'), t('r_agentStartSub'), '#/account?tab=agent', 'red', DI.agent],
      !mine.length && [t('dx_noListing'), t('postSub'), '#/post', 'red', DI.post],
      vState !== 'done' && vState !== 'pending' && [t('v_cardTitle'), t('v_cardSub'), '#/account?tab=settings&v=1', 'blue', DI.shield],
      tgWait.length && [t('dx_tglWaitN').replace('{n}', tgWait.length), t('dx_tglWaitSub'), '#/account?tab=tglist', 'red', DI.tglist],
      mine.some(l => l.status === 'hidden') && [`${mine.filter(l => l.status === 'hidden').length} ${t('dx_hidden')}`, t('dx_hiddenSub'), '#/account?tab=listings', 'blue', DI.listings],
    ].filter(Boolean);
    const topL = Object.entries(views.reduce((mm, e) => (mm[e.listing_id] = (mm[e.listing_id] || 0) + 1, mm), {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
    body = `${panel(t('dx_need'), need.length ? `<div class="aneed">${need.map(([tt, ss, go, col, ic]) => `<a class="aneedi n-${col}" href="${go}"><span>${ic}</span><div><b>${esc(tt)}</b><small>${esc(ss)}</small></div><em>›</em></a>`).join('')}</div>` : `<div class="aok">${DI.check}<b>${t('dx_allGood')}</b></div>`)}
      <div class="akpis k6">
        ${kpi(views.length, t('views'), t('last30'), 'blue', '#/account?tab=stats')}
        ${kpi(uniq, t('visitors'), t('dx_peopleSub'), 'blue', '#/account?tab=stats')}
        ${kpi(contacts.length, t('contacts'), t('dx_contactsSub'), 'red', '#/account?tab=stats')}
        ${kpi(inq.length, t('inquiries'), unread.length ? `${unread.length} ${t('dx_unread')}` : t('dx_allRead'), 'red', '#/account?tab=messages')}
        ${kpi(live.length, t('dx_liveListings'), `${mine.length} ${t('dx_total')}`, 'blue', '#/account?tab=listings')}
        ${kpi(vState === 'done' ? '✓' : vState === 'pending' ? '⏳' : '–', t('v_title'), vState === 'done' ? t('ad_verified') : vState === 'pending' ? t('v_pending') : t('dx_notYet'), 'red', '#/account?tab=settings&v=1')}
      </div>
      ${panel(`${t('views')} · ${t('last30')}`, chart(), `<a class="alink" href="#/account?tab=stats">${t('stats')} ›</a>`)}
      <div class="agrid2">
        ${panel(t('dx_mostViewed'), topL.length ? `<div class="alist">${topL.map(([id, n]) => { const l = byId[id]; return `<a class="arow" href="#/l/${id}"><span class="ath">${thumb(l)}</span><div><b>${esc(l?.title || '')}</b><small>${l ? money(l.price) + priceSuffix(l) : ''}</small></div><em>${n}</em></a>`; }).join('')}</div>` : emptyB(t('noStats')))}
        ${panel(t('dx_newMsgs'), inq.length ? `<div class="alist">${inq.slice(0, 6).map(i => msgRow(i)).join('')}</div>` : emptyB(t('noInquiries')), `<a class="alink" href="#/account?tab=messages">${t('dx_openReader')} ›</a>`)}
      </div>`;
  } else if (tab === 'messages') {
    const open = inq.find(i => i.id === qs().get('m'));
    if (open && !readSet.has(open.id)) { readSet.add(open.id); store.set('yh_inq_read', [...readSet].slice(-2000)); }
    const L1 = open && byId[open.listing_id];
    body = `<div class="ainbox${open ? ' has-open' : ''}"><div class="ailist"><div class="aimsgs">${inq.length ? inq.map(i => msgRow(i, open && open.id === i.id)).join('') : emptyB(t('noInquiries'))}</div></div>
      <div class="airead">${open ? `<div class="ard"><a class="aiback" href="#/account?tab=messages">${DI.back} ${t('dx_allMsgs')}</a>
        <div class="arbar"><span>${t('dx_read')}</span><button type="button" id="dxUnread">${t('dx_markUnread')}</button></div>
        <div class="arh"><span class="atag t-blue">${esc(t('dx_msg'))}</span><h3>${esc(open.name || '—')}</h3><small>${dateTime(open.created_at)}</small></div>
        <div class="arc">${answerBtns(open.contact)}</div>
        ${open.message ? `<div class="artext">${esc(open.message)}</div>` : ''}
        <div class="arfacts"><div><span>${t('dx_contact')}</span><b>${esc(open.contact || '')}</b></div></div>
        ${L1 ? `<a class="arow aref" href="#/l/${L1.id}"><span class="ath">${thumb(L1)}</span><div><b>${esc(L1.title)}</b><small>${money(L1.price)}${priceSuffix(L1)} · ${esc(L1.district || '')}</small></div><em>${DI.open}</em></a>` : ''}</div>`
        : `<div class="aipick">${DI.messages}<b>${t('dx_pick')}</b><small>${t('dx_pickSub')}</small></div>`}</div></div>`;
  } else if (tab === 'stats') {
    body = `<div class="akpis">${kpi(views.length, t('views'), t('last30'), 'blue')}${kpi(uniq, t('visitors'), t('dx_peopleSub'), 'blue')}${kpi(contacts.length, t('contacts'), t('dx_contactsSub'), 'red')}${kpi(inq.length, t('inquiries'), t('last30'), 'red')}
        ${kpi(contacts.filter(e => e.kind === 'phone').length, t('call'), '', 'blue')}${kpi(contacts.filter(e => e.kind === 'whatsapp').length, 'WhatsApp', '', 'blue')}${kpi(contacts.filter(e => e.kind === 'telegram').length, 'Telegram', '', 'red')}${kpi(views.length && uniq ? (views.length / uniq).toFixed(1) : '–', t('dx_perPerson'), '', 'red')}</div>
      ${panel(`${t('views')} · ${t('last30')}`, chart())}
      <div class="agrid2">${panel(t('sources'), bars(views, e => e.source === 'direct' ? t('direct') : e.source || '?'))}${panel(t('devices'), bars(views, e => t(e.device || 'desktop')))}</div>
      <div class="agrid2">${panel(t('languages'), bars(views, e => (e.lang || '?').toUpperCase()))}
        ${panel(t('perListing'), mine.length ? `<div class="alist">${mine.map(l => { const v = views.filter(e => e.listing_id === l.id); return `<a class="arow" href="#/l/${l.id}"><span class="ath">${thumb(l)}</span><div><b>${esc(l.title)}</b><small>${new Set(v.map(e => e.visitor)).size} ${t('dx_people')} · ${contacts.filter(e => e.listing_id === l.id).length} ${t('contacts').toLowerCase()} · ${inq.filter(i => i.listing_id === l.id).length} ✉</small></div><em>${v.length}</em></a>`; }).join('')}</div>` : emptyB(t('noMine')))}</div>
      ${panel(t('activity'), ev.length ? `<div class="alist">${ev.slice(0, 60).map(e => `<div class="arow"><div><b>${t('a_' + e.kind)} · ${esc(byId[e.listing_id]?.title || '')}</b><small>${dateTime(e.created_at)} · ${esc(e.source === 'direct' ? t('direct') : e.source || '')} · ${esc(t(e.device || 'desktop'))} · ${esc((e.lang || '').toUpperCase())}</small></div></div>`).join('')}</div>` : emptyB(t('noStats')))}`;
  } else if (tab === 'listings') {
    body = panel(`${t('my')} · ${mine.length}`, mine.length ? `<div class="alist">${mine.map(l => `<div class="arow dx-lrow"><a class="ath" href="#/l/${l.id}">${thumb(l)}</a><div style="min-width:0"><b>${esc(l.title)}</b>
        <small>${money(l.price)}${priceSuffix(l)} · ${esc(l.district || '')} · ${shortDate(l.created_at)}</small>
        <small>${views.filter(e => e.listing_id === l.id).length} ${t('views').toLowerCase()} · ${contacts.filter(e => e.listing_id === l.id).length} ${t('contacts').toLowerCase()} · ${inq.filter(i => i.listing_id === l.id).length} ✉</small></div>
        <div class="dx-lact"><select data-status="${l.id}" ${l.status === 'rejected' ? 'disabled' : ''}>${['active', 'hidden', l.deal_type === 'sale' ? 'sold' : 'rented', ...(l.status === 'rejected' ? ['rejected'] : [])].map(x => `<option value="${x}" ${l.status === x ? 'selected' : ''}>${t('s_' + x)}</option>`).join('')}</select>
        <a class="btn ghost sm" href="#/edit/${l.id}">${t('edit')}</a><button class="btn ghost sm" data-del="${l.id}">${t('del')}</button></div></div>`).join('')}</div>`
      : `${emptyB(t('noMine'))}<div style="text-align:center;margin-top:10px"><a class="btn red" href="#/post">+ ${t('post')}</a></div>`, `<a class="alink" href="#/post">+ ${t('post')}</a>`);
  } else if (tab === 'tglist') {
    const bot = 'https://t.me/' + TG_BOT + '?start=post';
    const row = l => `<div class="arow dx-lrow"><a class="ath" href="#/l/${l.id}">${thumb(l)}</a><div style="min-width:0"><b>${esc(l.title)}</b>
        <small><span class="atag t-${l.source === 'bot' ? 'blue' : 'red'}">${t(l.source === 'bot' ? 'dx_tglBot' : 'dx_tglCh')}</span> ${money(l.price)}${priceSuffix(l)} · ${esc(l.district || l.city || '')} · ${shortDate(l.created_at)}</small>
        ${l.source === 'channel' && l.status === 'hidden' ? `<small style="color:var(--red);font-weight:600">${t('dx_tglWait')}</small>` : `<small>${views.filter(e => e.listing_id === l.id).length} ${t('views').toLowerCase()} · ${contacts.filter(e => e.listing_id === l.id).length} ${t('contacts').toLowerCase()} · ${inq.filter(i => i.listing_id === l.id).length} ✉</small>`}</div>
        <div class="dx-lact">${l.source === 'channel' && l.status === 'hidden' ? `<button class="btn red sm" data-tgpub="${l.id}">${t('dx_tglPub')}</button>` : `<select data-status="${l.id}" ${l.status === 'rejected' ? 'disabled' : ''}>${['active', 'hidden', l.deal_type === 'sale' ? 'sold' : 'rented', ...(l.status === 'rejected' ? ['rejected'] : [])].map(x => `<option value="${x}" ${l.status === x ? 'selected' : ''}>${t('s_' + x)}</option>`).join('')}</select>`}
        <a class="btn ghost sm" href="#/edit/${l.id}">${t('edit')}</a><button class="btn ghost sm" data-del="${l.id}">${t('del')}</button></div></div>`;
    body = `${panel(t('dx_tgl'), `<p class="dx-tgi">${t('dx_tglIntro')}</p>
        <div class="dx-tgb"><a class="btn tgb-go" href="${bot}" target="_blank" rel="noopener">${DI.tglist}${t('tbGo')}</a><a class="btn ghost" href="#/account?tab=agent">${t('dx_tglChan')}</a></div>`)}
      ${tgWait.length ? panel(t('dx_tglWaitN').replace('{n}', tgWait.length), `<div class="alist">${tgWait.map(row).join('')}</div>`) : ''}
      ${panel(`${t('dx_tgl')} · ${tgl.length}`, tgl.length ? `<div class="alist">${tgl.filter(l => !tgWait.includes(l)).map(row).join('')}</div>` : emptyB(t('dx_tglEmpty')))}`;
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
        <label>${t('s_email')}<input value="${esc(shownEmail(user))}" disabled></label>
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
      ${alerts.length ? `<p style="margin:0;font-weight:600">✓ ${t('tgActive')} ${esc(alerts[0].telegram)}</p><p style="margin:0"><a class="btn blue" href="https://t.me/${TG_BOT}?start=messages" target="_blank" rel="noopener">${t('tgOpenBot')}</a></p>` : ''}
      <label>${t('tgUser')}<input name="tg" placeholder="@username" value="${esc(alerts[0]?.telegram || '')}" required></label>
      <button class="btn blue">${t('tgSave')}</button></form>`;
  }
  app.innerHTML = `<div class="wrap adm dx">
    <div class="atop"><div class="atl"><span class="alogo">${DI.listings}</span><div><b>${t('hello')}, ${esc(user.user_metadata?.full_name || shownEmail(user))}</b><small>${t('dash')} · ${isAgent ? t('k_' + ((user.user_metadata || {}).adv_kind || 'agent')) : t('k_owner')}${vState === 'done' ? ' · ✓ ' + t('ad_verified') : ''}</small></div></div>
      <div class="atr dx-btns">${await adminCheck() ? `<a class="dxb" href="#/admin">${DI.shield}<span>Admin</span></a>` : ''}<a class="dxb" href="#/">${DI.back}<span>${esc(t('backSite').replace(/^←\s*/, ''))}</span></a><button class="dxb dxb-out" id="logout">${DI.out}<span>${esc(t('logout'))}</span></button></div></div>
    ${roleSwitch('advertiser')}
    <nav class="acards" aria-label="${esc(t('dash'))}">${SECS.map(k => `<a href="${k === 'post' ? '#/post' : '#/account' + (k === 'overview' ? '' : '?tab=' + k)}" class="acard${tab === k ? ' on' : ''}${k === 'post' ? ' dx-post' : ''}"><span class="aci">${DI[k]}</span><b>${secName[k]}</b><small>${esc(secSub[k])}</small>${k === 'messages' && unread.length ? `<em class="abadge">${unread.length}</em>` : ''}${k === 'tglist' && tgWait.length ? `<em class="abadge">${tgWait.length}</em>` : ''}</a>`).join('')}</nav>
    <div id="asec" class="asec">${body}</div></div>`;
  { const un = document.getElementById('dxUnread'); if (un) un.onclick = () => { readSet.delete(qs().get('m')); store.set('yh_inq_read', [...readSet]); go('#/account?tab=messages'); }; }
  app.querySelectorAll('[data-msg]').forEach(b => b.onclick = () => go('#/account?tab=messages&m=' + b.dataset.msg));
  if (tab === 'agent') AG.accountTab(document.getElementById('agTab'));
  app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => go('#/account' + (b.dataset.tab === 'overview' ? '' : '?tab=' + b.dataset.tab)));
  document.getElementById('logout').onclick = async () => { await sb.auth.signOut(); go('#/'); };
  bindRoleSwitch();
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
  app.querySelectorAll('[data-tgpub]').forEach(b => b.onclick = async () => { b.disabled = true; const { error } = await sb.from('yh_listings').update({ status: 'active' }).eq('id', b.dataset.tgpub); if (error) { b.disabled = false; return toast(t('error') + error.message); } toast(t('dx_tglDone')); viewAccount(); });
  app.querySelectorAll('[data-status]').forEach(s => s.onchange = async () => { const { error } = await sb.from('yh_listings').update({ status: s.value }).eq('id', s.dataset.status); toast(error ? t('error') + error.message : t('savedOk')); });
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { if (!confirm(t('confirmDel'))) return; const { error } = await sb.from('yh_listings').delete().eq('id', b.dataset.del); if (error) return toast(t('error') + error.message); route(); });
  const tf = document.getElementById('tgform');
  if (tf) tf.onsubmit = async e => {
    e.preventDefault(); const h = tgHandle(new FormData(tf).get('tg')); if (!h) return toast(t('required'));
    const res = alerts.length ? await sb.from('yh_alerts').update({ telegram: '@' + h, active: true }).eq('id', alerts[0].id)
                              : await sb.from('yh_alerts').insert({ kind: 'my_messages', telegram: '@' + h });
    if (res.error) return toast(t('error') + res.error.message);
    toast(t('tgSaved'), 8000); route();
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

// SEEKER DASHBOARD: search, saved homes, new-listing alerts (yh_alerts kind new_listings), my details, become an advertiser
// SEEKER DASHBOARD = THE ADVERTISER / ADMIN LOOK (owner, 2026-11-25: screenshot of the old tile page + "javítsd"): admin.css,
// top bar (hello + "Looking for a home", Back to site · Sign out), the Looking / Advertising switch, big SECTION CARDS
// (Overview · Find a home · Saved · New listing alerts · Map · Settings · I want to advertise) and the section under them.
// Overview = "What needs you now" + number tiles + newest listings. Data: saved homes (this browser), yh_alerts new_listings.
async function viewSeeker() {
  const tab = qs().get('tab') || 'overview', md = user.user_metadata || {};
  app.innerHTML = `<div class="wrap">${window.yhSkel ? window.yhSkel() : ''}</div>`;
  if (!document.getElementById('admcss')) { const lk = document.createElement('link'); lk.id = 'admcss'; lk.rel = 'stylesheet'; lk.href = '/admin.css?v=2'; document.head.appendChild(lk); }
  const since7 = new Date(Date.now() - 7 * 864e5).toISOString();
  const [{ data: subs0 }, { count: newWeek }] = await Promise.all([
    sb.from('yh_alerts').select('*').eq('user_id', user.id).eq('kind', 'new_listings').order('created_at', { ascending: false }),
    sb.from('yh_listings').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('country', 'KH').gte('created_at', since7),
  ]);
  const subs = subs0 || [], sv = saved();
  const SV = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const DI = { overview: SV('<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>'),
    find: SV(ROLE_I.seeker), saved: SV('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'), alerts: SV('<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>'),
    map: SV('<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>'), settings: SV('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.4-4 4.4-6 8-6s6.6 2 8 6"/>'),
    adv: SV(ROLE_I.advertiser), telegram: SV('<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 8-6"/>'), check: SV('<path d="m5 12 5 5 9-10"/>'),
    back: SV('<path d="M19 12H5M11 6l-6 6 6 6"/>'), out: SV('<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>'), shield: SV('<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6z"/>'), home: SV('<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>') };
  const SECS = ['overview', 'find', 'saved', 'alerts', 'map', 'settings', 'adv'];
  const href = { overview: '#/account', find: '#/search', saved: '#/account?tab=saved', alerts: '#/account?tab=alerts', map: '#/search?view=map', settings: '#/account?tab=settings', adv: '#/account?as=advertiser' };
  const secName = { overview: t('overview'), find: t('sk_find'), saved: t('saved'), alerts: t('sk_alerts'), map: t('mapNav'), settings: t('settings'), adv: t('sk_becomeAdv') };
  const secSub = { overview: `${newWeek || 0} ${t('sk_newShort')}`, find: t('sk_findSub'), saved: String(sv.length), alerts: subs.length ? `${subs.length} · ${t('dx_on')}` : t('dx_off'), map: t('sk_mapSub'), settings: t('sk_setSub'), adv: t('sk_becomeAdvSub') };
  const panel = (title, inner, extra = '') => `<section class="apanel"><div class="aph"><h3>${title}</h3>${extra}</div>${inner}</section>`;
  const emptyB = x => `<div class="aempty">${x}</div>`;
  const kpi = (n, label, sub, col, go) => `<a href="${go}" class="akpi k-${col}"><b>${n}</b><span>${label}</span>${sub ? `<small>${sub}</small>` : ''}</a>`;
  const alertWhat = a => { const f = a.filters || {}; return [f.deal ? t(f.deal === 'sale' ? 'buy' : f.deal) : '', f.city && f.city !== 'Phnom Penh' ? f.city : '', f.type ? t('t_' + f.type) : '', f.q || '', f.max ? '≤ ' + money(f.max) : ''].filter(Boolean).join(' · ') || t('all'); };
  const botBtn = `<a class="adb ad-tg" href="https://t.me/${TG_BOT}?start=alerts" target="_blank" rel="noopener">${DI.telegram}${esc(t('tgOpenBot'))}</a>`;
  let body = '';
  if (tab === 'overview') {
    const need = [
      !subs.length && [t('newListingsAlert'), t('sk_alertsSub'), '#/account?tab=alerts', 'red', DI.alerts],
      subs.length && [t('sk_tgConnect'), t('sk_tgConnectSub'), 'https://t.me/' + TG_BOT + '?start=alerts', 'blue', DI.telegram],
      !sv.length && [t('sk_noSavedT'), t('sk_noSavedS'), '#/search', 'blue', DI.saved],
    ].filter(Boolean);
    body = `${panel(t('dx_need'), need.length ? `<div class="aneed">${need.map(([tt, ss, go, col, ic]) => `<a class="aneedi n-${col}" href="${go}"${/^https:/.test(go) ? ' target="_blank" rel="noopener"' : ''}><span>${ic}</span><div><b>${esc(tt)}</b><small>${esc(ss)}</small></div><em>›</em></a>`).join('')}</div>` : `<div class="aok">${DI.check}<b>${t('dx_allGood')}</b></div>`)}
      <div class="akpis">
        ${kpi(newWeek || 0, t('sk_newWeek'), t('last7'), 'blue', '#/search')}
        ${kpi(sv.length, t('saved'), t('sk_savedSub'), 'red', '#/account?tab=saved')}
        ${kpi(subs.length, t('sk_alerts'), subs.length ? t('dx_on') : t('dx_off'), 'blue', '#/account?tab=alerts')}
        ${kpi('+', t('sk_becomeAdv'), t('sk_becomeAdvSub'), 'red', '#/account?as=advertiser')}
      </div>
      ${panel(t('sk_newest'), '<div id="skNew"></div>', `<a class="alink" href="#/search">${t('sk_find')} ›</a>`)}`;
  } else if (tab === 'saved') {
    body = panel(t('saved'), '<div id="skSaved"></div>', `<a class="alink" href="#/search">${t('sk_find')} ›</a>`);
  } else if (tab === 'alerts') {
    body = panel(t('sk_alerts'), `<p class="asub">${t('sk_alertsSub')}</p>
      ${subs.length ? `<div class="alist">${subs.map(a => `<div class="arow"><span class="ath"><span class="anoimg">${DI.alerts}</span></span><div><b>${esc(alertWhat(a))}</b><small>${esc(a.telegram || '')} · ${shortDate(a.created_at)}</small></div><button class="atb" data-delalert="${a.id}">${esc(t('del'))}</button></div>`).join('')}</div>` : emptyB(t('sk_noAlerts'))}
      <div class="adbs" style="margin-top:12px"><button class="adb ad-call" id="skNewAlert">${DI.alerts}${esc(t('newListingsAlert'))}</button>${botBtn}</div>
      <p class="asub" style="margin-top:10px">${t('sk_tgConnectSub')}</p>`);
  } else if (tab === 'settings') {
    body = panel(t('s_account'), `<form class="form" id="sksetform" style="max-width:560px">
      <label>${t('s_name')}<input name="name" maxlength="80" value="${esc(md.full_name || '')}"></label>
      <label>${t('s_email')}<input value="${esc(shownEmail(user))}" disabled></label>
      <button class="btn blue">${t('s_save')}</button></form>`);
  }
  app.innerHTML = `<div class="wrap adm dx">
    <div class="atop"><div class="atl"><span class="alogo">${DI.home}</span><div><b>${t('hello')}, ${esc(md.full_name || shownEmail(user))}</b><small>${t('dash')} · ${esc(t('sk_role'))}</small></div></div>
      <div class="atr dx-btns">${await adminCheck() ? `<a class="dxb" href="#/admin">${DI.shield}<span>Admin</span></a>` : ''}<a class="dxb" href="#/">${DI.back}<span>${esc(t('backSite').replace(/^←\s*/, ''))}</span></a><button class="dxb dxb-out" id="logout">${DI.out}<span>${esc(t('logout'))}</span></button></div></div>
    ${roleSwitch('seeker')}
    <nav class="acards" aria-label="${esc(t('dash'))}">${SECS.map(k => `<a href="${href[k]}" class="acard${tab === k ? ' on' : ''}${k === 'adv' ? ' dx-post' : ''}"><span class="aci">${DI[k]}</span><b>${secName[k]}</b><small>${esc(secSub[k])}</small>${k === 'saved' && sv.length ? `<em class="abadge">${sv.length}</em>` : ''}</a>`).join('')}</nav>
    <div id="asec" class="asec">${body}</div></div>`;
  bindRoleSwitch();
  document.getElementById('logout').onclick = async () => { await sb.auth.signOut(); go('#/'); };
  const box = document.getElementById('skSaved');
  if (box) {
    if (!sv.length) box.innerHTML = emptyB(t('savedEmpty'));
    else { const list = await fetchListings({ ids: sv.slice(0, 100) }); box.innerHTML = list.length ? `<div class="grid">${list.map(card).join('')}</div>` : emptyB(t('savedEmpty')); }
  }
  const nb = document.getElementById('skNew');
  if (nb) { const list = (await fetchListings({})).slice(0, 4); nb.innerHTML = list.length ? `<div class="row4">${list.map(card).join('')}</div>` : emptyB(t('noResults') || '—'); }
  if (typeof fitCards === 'function') try { fitCards(); } catch {}
  const na = document.getElementById('skNewAlert'); if (na) na.onclick = () => alertModal({});
  app.querySelectorAll('[data-delalert]').forEach(b => b.onclick = async () => { const { error } = await sb.from('yh_alerts').delete().eq('id', b.dataset.delalert); if (error) return toast(t('error') + error.message); route(); });
  const sf = document.getElementById('sksetform');
  if (sf) sf.onsubmit = async e => { e.preventDefault(); const name = String(new FormData(sf).get('name') || '').trim();
    const { data, error } = await sb.auth.updateUser({ data: { full_name: name } }); if (error) return toast(t('error') + error.message);
    if (data?.user) user = data.user; toast(t('savedOk')); route(); };
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
      <div class="ab-c"><b>Made for Cambodia</b><p>Phnom Penh first, then the rest of the country. Eight languages – English, Khmer, Chinese, French, Thai, Russian, Vietnamese and Korean – prices in US dollars, districts people actually search for.</p></div>
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

let skipNext = false, firstRoute = true;
// Unknown address (seo-rules.md): friendly "currently unavailable" page + Contact our team (the server answers it with 404 + noindex)
const viewMissing = () => { app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:24px"><b>${esc(t('miss_t'))}</b><br>${esc(t('miss_s'))}<br><br><a class="btn red" href="#/support">${esc(t('miss_c'))}</a> <a class="btn ghost" href="#/">${esc(t('miss_h'))}</a></div></div>`; };
// About / How / Safety / FAQ / Terms / Privacy in the visitor's language (owner, 2026-11-26 14:01): English = PAGES above (also read by
// api/page.js for Google); other languages = tr-pages.js PG, loaded only when needed. Support is built from i18n keys.
let TRP = null;
async function pageHtml(k) {
  if (lang !== 'en' && k !== 'support') {
    try { TRP = TRP || await import('./tr-pages.js?v=1'); } catch (e) { console.error(e); }
    const h = TRP && TRP.PG[lang] && TRP.PG[lang][k];
    if (h) return h.replace(/\{\{terms\}\}/g, esc(t('terms'))).replace(/\{\{privacy\}\}/g, esc(t('privacy'))).replace(/\{\{email\}\}/g, SUPPORT_EMAIL);
  }
  return PAGES[k]();
}
let routes = 0;
async function route() {
  if (routes++) PRE = null;   // the server's listings serve only the first page of a visit
  const p0 = (YH.h().slice(1).split('?')[0] || '/').split('/').filter(Boolean);
  if (p0[0] === 'l' && p0[1]) {           // a listing = the popup over the page (owner, 2026-11-24)
    if (!app.querySelector('.wrap:not(.ssr)')) await viewHome();
    return POP.open(decodeURIComponent(p0[1]), false);
  }
  if (POP.isOpen()) POP.hide();
  clearMaps();
  if (!firstRoute) document.title = t('heroTitle').replace(/<[^>]+>/g, '') + ' | YourHome Cambodia';   // first load keeps the server's SEO title
  firstRoute = false;
  const path = (YH.h().slice(1).split('?')[0] || '/').replace(/\/+$/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  const nav = parts[0] === 'search' ? (qs().get('view') === 'map' ? 'map' : 'search') : ({ '': 'home', post: 'post', saved: 'saved', experts: 'experts', agent: 'experts', account: 'account' }[parts[0] || ''] || '');
  document.querySelectorAll('.bnav a').forEach(a => a.classList.toggle('on', a.dataset.nav === nav));
  // Map button swaps to "Listing" while the map is open (owner, 2026-11-25: "ha mapre kattint, váltson át listing ikonra"):
  // same place in the bottom menu, grid icon + "Listing", leads back to the same search as a list.
  const mb = document.querySelector('.bnav a[data-nav="map"]');
  if (mb) {
    const onMap = nav === 'map';
    if (onMap) { const p = qs(); p.delete('view'); const s = p.toString(); mb.href = '#/search' + (s ? '?' + s : ''); }
    else mb.href = '#/search?view=map';
    if (mb.dataset.mode !== (onMap ? 'list' : 'map')) {
      mb.dataset.mode = onMap ? 'list' : 'map';
      mb.innerHTML = onMap ? `${ICON.grid}<span>${t('listing1')}</span>` : `${ICON.map}<span>${t('mapNav')}</span>`;
    } else if (mb.lastElementChild) mb.lastElementChild.textContent = onMap ? t('listing1') : t('mapNav');
    mb.classList.remove('on');
    mb.setAttribute('aria-label', onMap ? t('listing1') : t('mapNav'));
  }
  document.body.classList.toggle('adm-mode', parts[0] === 'admin');   // the admin has its own panel – no site header / footer / bottom menu
  window.scrollTo(0, 0);
  pageView();
  try {
    if (parts[0] === 'admin') { const ADM = await adminMod(); return ADM.view(); }
    if (!parts.length) await viewHome();
    else if (parts[0] === 'search') await viewSearch();

    else if (parts[0] === 'post') await viewPost();
    else if (parts[0] === 'edit' && parts[1]) await viewPost(parts[1]);
    else if (parts[0] === 'account' || parts[0] === 'my') await viewAccount();
    else if (parts[0] === 'saved') await viewSaved();
    else if (parts[0] === 'experts') await viewExperts();
    else if (parts[0] === 'agent' && parts[1]) await AG.viewAgent(decodeURIComponent(parts[1]));
    else if (parts[0] === 'partners') await PT.viewPartners();
    else if (parts[0] === 'projects') await PT.viewProjects();
    else if (parts[0] === 'project' && parts[1]) await PT.viewProject(decodeURIComponent(parts[1]));
    else if (parts[0] === 'blog' && parts[1]) await BL.viewArticle(decodeURIComponent(parts[1]));
    else if (parts[0] === 'blog') await BL.viewBlog();
    else if (PAGES[parts[0]]) app.innerHTML = `<div class="wrap"><div class="page${parts[0] === 'support' ? ' page-sup' : ''}">${await pageHtml(parts[0])}</div></div>`;
    else viewMissing();
  } catch (err) { console.error(err); toast(t('error') + err.message); }
}
AG.init({ sb, app, t, esc, card, go, toast, qs, tgHandle, digits, DISTRICTS, LISTING_COLS, user: () => user, lang: () => lang });
PT.init({ sb, app, t, esc, toast, digits, lang: () => lang });
BL.init({ app, esc, t, lang: () => lang });
// ADMIN DASHBOARD (owner, 2026-11-25) – admin.js loads only when /admin is opened
let ADMP = null;
const adminMod = () => ADMP || (ADMP = import('./admin.js?v=6').then(m => { m.init({ sb, app, esc, toast, qs, tgHandle, digits, imgSrc, money, priceSuffix, viewLogin, user: () => user, listingHref: l => '#/l/' + l.id, tgChannel: () => TG_CHANNEL, signOut: async () => { await sb.auth.signOut(); store.set('yh_next', 'admin'); viewLogin('admin'); } }); return m; }));
const toggleSave = id => { let s = saved(); const on = !s.includes(id); s = on ? [id, ...s] : s.filter(x => x !== id); if (on) track({ id, status: 'active' }, 'save'); store.set('yh_saved', s.slice(0, 200)); document.querySelectorAll(`[data-save="${id}"]`).forEach(b => { b.classList.toggle('on', on);  }); return on; };
POP.init({ sb, t, esc, money, priceSuffix, addrRows, tgHandle, digits, track, toast, facts: detailFacts, listingExtras: l => AG.listingExtras(l), isSaved, toggleSave, skipRoute: () => { skipNext = true; setTimeout(() => { skipNext = false; }, 400); }, route: () => route() });
window.addEventListener('hashchange', () => { if (skipNext) { skipNext = false; return; } route(); });

applyStatic();
// LOG IN WITH TELEGRAM (owner, 2026-11-25; api/_tg.js): /auth/telegram/callback sends the visitor to /#tgauth=<one-time
// token> – turned into a normal session here, then the usual yh_next / account-type popup flow below runs.
{
  const hm = /^#tg(auth|err)=([\w.~%-]{1,600})$/.exec(location.hash);
  if (hm) {
    history.replaceState(null, '', location.pathname + location.search);
    if (hm[1] === 'auth') { const { error } = await sb.auth.verifyOtp({ type: 'magiclink', token_hash: decodeURIComponent(hm[2]) }); if (error) toast(t('tgErr'), 6000); }
    else setTimeout(() => toast(hm[2] === 'cancel' ? t('tgCancel') : hm[2] === 'off' ? t('tgOff') : t('tgErr'), 6000), 300);
  }
}
const { data: { session } } = await sb.auth.getSession();
user = session?.user || null;
sb.auth.onAuthStateChange((ev, s) => {
  const was = user?.id; user = s?.user || null; if (user?.id !== was) isAdmin = null;
  if (ev === 'SIGNED_IN' && !was) {
    const next = store.get('yh_next', null); store.set('yh_next', null);
    if (location.search.includes('code=')) history.replaceState(null, '', location.pathname);
    if (next) go('#/' + next); else route();
    setTimeout(() => rolePopup(false), 400);
  }
});
// The owner's own accounts (yh_admin_hidden) never count in any statistics: signing in with one marks this device (yh_noct)
// STALE SESSION GUARD (2026-11-25): a browser can still hold the sign-in of an account that no longer exists (deleted test
// account → every save answers "User from sub claim in JWT does not exist", the person cannot get in). Checked once per load
// in the background; such a session is dropped on this device only and the page is drawn signed out, so a fresh sign-in works.
if (user) sb.auth.getUser().then(async ({ error }) => {
  if (!error || !(error.status === 401 || error.status === 403 || /not exist|user_not_found|missing sub/i.test(error.message || ''))) return;
  await sb.auth.signOut({ scope: 'local' }).catch(() => {});
  try { Object.keys(localStorage).filter(k => /^sb-.*-auth-token/.test(k)).forEach(k => localStorage.removeItem(k)); } catch {}
  user = null; isAdmin = null; document.querySelector('.rpop')?.remove(); document.body.classList.remove('rpop-open');
  toast(t('error') + 'your sign-in expired – please sign in again.', 5000); route();
});
const markOwnDevice = () => user && sb.rpc('yh_me_hidden').then(({ data }) => { if (data) try { localStorage.setItem('yh_noct', '1'); } catch {} });
markOwnDevice();
sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_IN') setTimeout(markOwnDevice, 0); });
// GOOGLE SIGN-UPS = YOURHOME ACCOUNTS (owner, 2026-11-25 "old meg"): Google cannot carry signup_site at sign-up, so a brand-new
// account (created < 15 min ago) without it gets user_metadata.signup_site 'yourhome' on its first load here. The Study portal's
// "New account" alert already skips it in the database (alert_new_account reads the Google sign-in's yourhome.asia referrer).
const tagSignup = () => { const u = user; if (!u || (u.user_metadata || {}).signup_site || Date.now() - new Date(u.created_at).getTime() > 9e5) return;
  sb.auth.updateUser({ data: { signup_site: 'yourhome' } }).catch(() => {}); };
tagSignup();
sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_IN') setTimeout(tagSignup, 0); });
// MENU: project counts by stage (owner, 2026-11-26, myhome.ge) – read once, the first time the menu opens
document.getElementById('menuBtn')?.addEventListener('click', () => {
  if (window.__yhPc) return; window.__yhPc = 1;
  sb.from('yh_projects').select('stage').eq('active', true).then(({ data }) => {
    const n = {}; (data || []).forEach(p => { n[p.stage] = (n[p.stage] || 0) + 1; });
    document.querySelectorAll('[data-pc]').forEach(b => { const k = n[b.dataset.pc] || 0; b.textContent = k + (k === 1 ? ' project' : ' projects'); });
  });
});
if (location.search.includes('code=')) history.replaceState(null, '', location.pathname);
const next0 = user && store.get('yh_next', null);
if (next0 && location.pathname === '/') { store.set('yh_next', null); go('#/' + next0); } else route();
if (user) setTimeout(() => rolePopup(/^\/account|^\/my/.test(location.pathname)), 600);

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
// Wrapped rows of words with thin dividers: the first word of every line gets no divider (owner, 2026-11-24 17:27)
function markLineStarts() {
  document.querySelectorAll('.more-panel .chips, .dtabs').forEach(row => { let top = null; [...row.children].forEach(c => { const tp = c.offsetTop; c.classList.toggle('ln1', top === null || Math.abs(tp - top) > 4); top = tp; }); });
}
// PHOTO DOTS IN THE MIDDLE OF THE FREE SPACE (owner, 2026-11-25: "a csíkok legyenek a két kiírás között egyenlő távolságra,
// most az ár felé hajlik"): the dots sit halfway between the text on the left of the photo (phones: date · PC: price pill)
// and the text on the right (phones: price · PC: nothing → the same margin as on the left), not in the centre of the photo.
function placeDots() {
  document.querySelectorAll('.card .ph .ydots').forEach(d => {
    const ph = d.parentElement, r = ph.getBoundingClientRect(); if (!r.width) return;
    const vis = el => el && el.offsetParent !== null && getComputedStyle(el).display !== 'none' ? el.getBoundingClientRect() : null;
    const L = vis(ph.querySelector('.ydate')) || vis(ph.querySelector('.pov')) || vis(ph.querySelector('.prj-price'));
    const R = vis(ph.querySelector('.yprice')) || vis(ph.querySelector('.prj-count'));
    const left = L ? L.right - r.left : 0;
    const right = R ? R.left - r.left : (L ? r.width - (L.left - r.left) : r.width);
    d.style.left = Math.round((left + right) / 2) + 'px';
  });
}
function fitCards() {
  placeDots();
  markLineStarts(); fitRows();
  if (innerWidth > 720) { document.querySelectorAll('.yname,.ymeta .yaddr').forEach(e => e.style.removeProperty('font-size')); return; }
  // ONE size on every card (owner, 2026-11-24 19:55: "egyfajta méretűek legyenek, minden kiírás mint a BKK1 nagyságú"): the size
  // that makes "Apartment for rent in BKK1" fill the card is used for every name (a longer name stays on ONE line and ends with …), and the
  // size that makes "Phnom Penh, No. 24, Street 278" fill it for every address (longer ones end with …). Both 2px under the fit.
  const refSize = (sel, text, min, max, useParent) => {
    const e = document.querySelector(sel); if (!e) return 0;
    const w = useParent ? e.parentNode.clientWidth - 26 : e.clientWidth; if (!w || w < 0) return 0;   // the address row is centred, so its free width = the row minus the pin
    const c = e.cloneNode(false); c.textContent = text; c.style.cssText += ';position:absolute;visibility:hidden;white-space:nowrap;display:block;width:' + w + 'px';
    e.parentNode.appendChild(c); fitLine(c, min, max); const v = parseFloat(c.style.fontSize); c.remove(); return v;
  };
  const nSize = refSize('.card .yname', t('nameRent', { x: t('t_apartment') }) + ' ' + t('inPlace', { d: 'BKK1' }), 15, 26);
  const aSize = refSize('.card .ymeta .yaddr', t('cityPP') + ', No. 24, Street 278', 11, 17, true);
  if (nSize) document.querySelectorAll('.card .yname').forEach(e => { e.style.setProperty('font-size', (nSize - 2) + 'px', 'important'); e.style.setProperty('white-space', 'nowrap', 'important'); e.style.setProperty('overflow', 'hidden', 'important'); e.style.setProperty('text-overflow', 'ellipsis', 'important'); });   // ONE line, … if it does not fit (owner 20:05)
  if (aSize) document.querySelectorAll('.card .ymeta .yaddr').forEach(e => e.style.setProperty('font-size', (aSize - 2) + 'px', 'important'));
}
// NOTHING MAY STICK OUT on phones, in any language (owner, 2026-11-24 20:26): a row whose items run past the screen first gets
// smaller letters (down to 11px), then wraps centred; the header first tightens, then drops the "Menu" word.
function fitRows() {
  // the category row (14 items since Office · Commercial, 2026-11-26) must also stay inside its OWN box, not only the screen
  const W = innerWidth, out = el => { const b = el.classList.contains('deal-tabs') ? el.getBoundingClientRect() : null, L = b ? Math.max(0, b.left) : 0, R = b ? Math.min(W, b.right) : W;
    return [...el.children].some(c => { if (!c.offsetWidth) return false; const r = c.getBoundingClientRect(); return r.left < L - 0.5 || r.right > R + 0.5; }); };
  const rows = document.querySelectorAll('#chipBox .qrow, #chipBox .frow, .deal-tabs, .more-panel .mp-grid');
  rows.forEach(row => {
    const kids = [...row.querySelectorAll(':scope > *, :scope > .vsw > *')];
    row.classList.remove('fitwrap'); kids.forEach(k => k.style.removeProperty('font-size'));
    if (W > 720 || !out(row)) return;
    let fs = parseFloat(getComputedStyle(kids.find(k => k.offsetWidth) || row).fontSize) || 13;
    while (fs > 11 && out(row)) { fs -= 0.5; kids.forEach(k => k.style.setProperty('font-size', fs + 'px', 'important')); }
    if (out(row)) row.classList.add('fitwrap');
  });
  // PHONE SEARCH CARD (owner screenshot 2026-11-26 13:23, Hungarian: "SZERET…", "Bérl…", "Bár…"): on phones every field label and the
  // picked value shrink (down to 9px / 10px) until they fit their field instead of ending in "…" – needed for the long languages.
  if (innerWidth <= 720) document.querySelectorAll('#sbox .f').forEach(f => {
    const lab = f.querySelector('label'), parts = lab ? [lab, ...lab.querySelectorAll('span')] : [];
    const over = () => parts.some(x => x.offsetParent && x.scrollWidth > x.clientWidth + 0.5);
    if (lab) { parts.forEach(x => x.style.removeProperty('font-size')); let fs = parseFloat(getComputedStyle(lab).fontSize) || 11, i = 0; while (fs > 8.5 && i++ < 20 && over()) { fs -= 0.5; parts.forEach(x => x.style.setProperty('font-size', fs + 'px', 'important')); } }
    const sel = f.querySelector('select'); if (!sel || !sel.options.length) return;
    sel.style.removeProperty('font-size'); const cs = getComputedStyle(sel), avail = sel.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 1;
    const cv = fitRows.cv || (fitRows.cv = document.createElement('canvas').getContext('2d')), txt = (sel.options[sel.selectedIndex] || sel.options[0]).text;
    let fs = parseFloat(cs.fontSize) || 13, i = 0; const w = s => { cv.font = `${cs.fontWeight} ${s}px ${cs.fontFamily}`; return cv.measureText(txt).width + (parseFloat(cs.letterSpacing) || 0) * txt.length; };
    while (fs > 9 && i++ < 12 && w(fs) > avail) { fs -= 0.5; sel.style.setProperty('font-size', fs + 'px', 'important'); }
  });
  // BOTTOM MENU labels shrink (min 8.5px) instead of "Размести…" in the long languages (owner screenshot 13:24)
  document.querySelectorAll('.bnav a > span:not(.bs)').forEach(sp => { sp.style.removeProperty('font-size'); let fs = parseFloat(getComputedStyle(sp).fontSize) || 11, i = 0; while (fs > 8.5 && i++ < 10 && sp.scrollWidth > sp.clientWidth + 0.5) { fs -= 0.5; sp.style.setProperty('font-size', fs + 'px', 'important'); } });
  // HERO TITLE fits ONE line in every language (owner, 2026-11-26 13:22: "kilóg… kicsinyítsd a betűt, hogyha kell"): from the CSS size,
  // the letters shrink until the text (measured without the underline) fits the title's own width; never below 16px.
  document.querySelectorAll('.hero > h1').forEach(h => { h.style.removeProperty('font-size'); h.style.setProperty('font-size', 'clamp(26px,3.7vw,46px)'); if (innerWidth < 380) h.style.setProperty('font-size', '6.4vw', 'important'); const r = document.createRange(); r.selectNodeContents(h); let fs = parseFloat(getComputedStyle(h).fontSize) || 26, i = 0; while (fs > 16 && i++ < 80 && r.getBoundingClientRect().width > h.clientWidth - 2) { fs -= 0.5; h.style.setProperty('font-size', fs + 'px', 'important'); } });
  document.querySelectorAll('.hero > p').forEach(p => { p.style.removeProperty('font-size'); let fs = parseFloat(getComputedStyle(p).fontSize) || 13; while (fs > 10 && p.scrollWidth > p.clientWidth + 0.5) { fs -= 0.5; p.style.setProperty('font-size', fs + 'px', 'important'); } });   // hero line: ONE line (owner 20:29)
  const b = document.body, hdr = document.querySelector('.hdr-in');
  if (hdr) { b.classList.remove('hfit1', 'hfit2'); const ho = () => hdr.scrollWidth > hdr.clientWidth + 0.5 || [...hdr.querySelectorAll('.hdr-r > *')].some(c => c.offsetWidth && c.getBoundingClientRect().right > W + 0.5);
    if (W <= 720 && ho()) { b.classList.add('hfit1'); if (ho()) b.classList.add('hfit2'); } }
  document.querySelectorAll('.fitwrap').forEach(row => { let top = null; [...row.children].forEach(c => { const tp = c.offsetTop; c.classList.toggle('ln1', top === null || Math.abs(tp - top) > 4); top = tp; }); });
}
// City → its own districts, on EVERY page with the search card (home and results; owner, 2026-11-24 20:35)
document.addEventListener('change', e => { if (e.target.closest && e.target.closest('#sbox')) queueFit(); });
document.addEventListener('change', e => { if (e.target.id !== 'citySel') return; const ds = document.getElementById('distSel'); if (ds) ds.innerHTML = districtOpts(e.target.value); });
const queueFit = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitCards); };
new MutationObserver(queueFit).observe(document.getElementById('app'), { childList: true, subtree: true });
addEventListener('resize', queueFit);
document.fonts && document.fonts.ready.then(queueFit);
