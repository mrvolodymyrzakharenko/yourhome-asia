// ADMIN DASHBOARD (owner, 2026-11-25: "szuper dashboard… kártyákon tudok mozogni, olvasó menü, statisztika, visitors… a study
// portálnál még átláthatóbb, több funkció"). Route /admin (#/admin), only for emails in yh_admins (yh_is_admin()).
// Loaded on demand by app.js (import('./admin.js')) – visitors never download it. Styles: admin.css (same 13px rules).
// Sections are moved between with big CARDS (top of the page): Overview · Inbox (reader) · Visitors · Listings · Accounts ·
// Agents & verification · Partners & projects · Telegram. Data: admin RLS read policies + security-definer RPCs
// yh_admin_visitors / yh_admin_users / yh_admin_mark / yh_admin_listing / yh_admin_agent / yh_admin_project / yh_admin_verify.
let C = null;
export function init(ctx) { C = ctx; }
const S = { sec: 'overview', days: 30, data: null, loading: false, inbox: { f: 'all', q: '', open: null }, lst: { f: 'all', q: '' }, acc: { f: 'all', q: '' }, timer: null };
const $ = id => document.getElementById(id);
const esc = s => C.esc(s);
const SV = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  overview: SV('<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>'),
  inbox: SV('<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6H3v-6z"/>'),
  visitors: SV('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  listings: SV('<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>'),
  accounts: SV('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.7.8 2.7 2.5 3 5.2"/>'),
  agents: SV('<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>'),
  partners: SV('<path d="M4 21V5l6-2 10 4M10 3v18M4 9h16M17 9v4M15 13h4v3h-4zM2 21h12"/>'),
  telegram: SV('<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 8-6"/>'),
  star: SV('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
  phone: SV('<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2"/>'),
  mail: SV('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  wa: SV('<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2z"/>'),
  open: SV('<path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
  refresh: SV('<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>'),
  back: SV('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  trash: SV('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  top: SV('<path d="m12 4 3 6 6 .8-4.5 4.2 1 6L12 18l-5.5 3 1-6L3 10.8 9 10z"/>'),
  globe: SV('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 3.9 5.7 3.9 9s-1.3 6.3-3.9 9c-2.6-2.7-3.9-5.7-3.9-9S9.4 5.7 12 3z"/>'),
  clock: SV('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  msg: SV('<path d="M4 5h16v11H8l-4 4z"/>'),
  check: SV('<path d="m5 12 5 5 9-10"/>'),
  x: SV('<path d="M6 6l12 12M18 6 6 18"/>'),
};
const SECTIONS = [
  ['overview', 'Overview'], ['inbox', 'Inbox'], ['visitors', 'Visitors'], ['listings', 'Listings'],
  ['accounts', 'Accounts'], ['agents', 'Verification'], ['partners', 'Partners'], ['telegram', 'Telegram'],
];
const PERIODS = [[1, 'Today'], [7, '7 days'], [30, '30 days'], [90, '90 days']];
const KIND = { inquiry: 'Listing message', lead: 'Project question', partner: 'Partner request', verify: 'Verification' };
const KCOL = { inquiry: 'blue', lead: 'red', partner: 'blue', verify: 'red' };
const DEAL = l => l.deal_type === 'sale' ? 'Sale' : l.deal_type === 'room' ? 'Room' : l.price_period === 'day' ? 'Daily rent' : 'Rent';
const fmt = n => Number(n || 0).toLocaleString('en-US');
const pct = (a, b) => b ? Math.round(a * 100 / b) + '%' : '–';
const when = d => { const x = new Date(d), now = Date.now(), s = (now - x) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + ' h ago'; if (s < 7 * 86400) return Math.floor(s / 86400) + ' d ago'; return x.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: x.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined }); };
const dt = d => new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const flag = cc => cc && /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map(c => 127397 + c.charCodeAt(0))) : '🌐';
const COUNTRY = (() => { try { const dn = new Intl.DisplayNames(['en'], { type: 'region' }); return cc => { try { return dn.of(cc); } catch { return cc; } }; } catch { return cc => cc; } })();
const since = days => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (days - 1)); return d.toISOString(); };

function css() {
  if (document.getElementById('admcss')) return;
  const l = document.createElement('link'); l.id = 'admcss'; l.rel = 'stylesheet'; l.href = '/admin.css?v=1'; document.head.appendChild(l);
}

// ---------- contact helpers: one-tap answer buttons from whatever the visitor typed ----------
function contactLinks(c = {}) {
  const out = [], raw = [c.contact, c.phone, c.telegram, c.whatsapp, c.email].filter(Boolean).join(' ');
  const email = (raw.match(/[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}/i) || [])[0];
  const tg = C.tgHandle(c.telegram || '') || ((raw.match(/(?:^|\s)@([A-Za-z0-9_]{4,32})\b/) || [])[1]) || ((raw.match(/t\.me\/([A-Za-z0-9_]{4,32})/i) || [])[1]);
  const phone = C.digits(c.phone || c.whatsapp || (c.contact && !c.contact.includes('@') ? c.contact : ''));
  if (phone && phone.length >= 7) {
    const intl = phone.startsWith('0') ? '855' + phone.slice(1) : phone;
    out.push(`<a class="adb ad-call" href="tel:+${intl}">${I.phone}Call</a>`, `<a class="adb ad-wa" href="https://wa.me/${intl}" target="_blank" rel="noopener">${I.wa}WhatsApp</a>`);
    if (!tg) out.push(`<a class="adb ad-tg" href="https://t.me/+${intl}" target="_blank" rel="noopener">${I.telegram}Telegram</a>`);
  }
  if (tg) out.push(`<a class="adb ad-tg" href="https://t.me/${esc(tg)}" target="_blank" rel="noopener">${I.telegram}@${esc(tg)}</a>`);
  if (email) out.push(`<a class="adb ad-mail" href="mailto:${esc(email)}?subject=${encodeURIComponent('YourHome.asia')}">${I.mail}Email</a>`);
  return out.join('');
}

// ---------- data ----------
async function load() {
  S.loading = true;
  const sb = C.sb, from = since(S.days), f90 = since(90);
  const q = (p) => p.then(r => r.error ? (console.warn(r.error), []) : (r.data || []));
  const [listings, events, inq, leads, partners, verify, agents, alerts, projects, users, vis] = await Promise.all([
    q(sb.from('yh_listings').select('id,owner_id,title,deal_type,property_type,price,price_period,period_note,city,district,photos,status,is_featured,is_demo,created_at,updated_at,contact_name,contact_phone,contact_telegram,agent_id').order('created_at', { ascending: false }).limit(2000)),
    q(sb.from('yh_events').select('listing_id,kind,visitor,source,device,lang,created_at').gte('created_at', f90).order('created_at', { ascending: false }).limit(20000)),
    q(sb.from('yh_inquiries').select('*').order('created_at', { ascending: false }).limit(1000)),
    q(sb.from('yh_project_leads').select('*').order('created_at', { ascending: false }).limit(1000)),
    q(sb.from('yh_partner_requests').select('*').order('created_at', { ascending: false }).limit(1000)),
    q(sb.from('yh_verify_requests').select('*').order('created_at', { ascending: false }).limit(1000)),
    q(sb.from('yh_agents').select('id,owner_id,slug,name,kind,company,photo,phone,telegram,whatsapp,email,verified_at,created_at').order('created_at', { ascending: false }).limit(2000)),
    q(sb.from('yh_alerts').select('*').order('created_at', { ascending: false }).limit(2000)),
    q(sb.from('yh_projects').select('id,slug,name,developer,district,stage,price_from,photos,active,is_featured,is_demo,created_at').order('created_at', { ascending: false }).limit(500)),
    q(sb.rpc('yh_admin_users')),
    sb.rpc('yh_admin_visitors', { p_days: S.days, p_tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Phnom_Penh' }).then(r => r.data || null),
  ]);
  const L = Object.fromEntries(listings.map(l => [l.id, l])), P = Object.fromEntries(projects.map(p => [p.id, p]));
  const ev = events.filter(e => e.created_at >= from);
  const msgs = [
    ...inq.map(x => ({ kind: 'inquiry', id: x.id, at: x.created_at, name: x.name, contact: x.contact, text: x.message, ref: L[x.listing_id], refId: x.listing_id, read: !!x.admin_read_at, star: x.admin_star, note: x.admin_note, raw: x })),
    ...leads.map(x => ({ kind: 'lead', id: x.id, at: x.created_at, name: x.name, contact: [x.phone, x.email].filter(Boolean).join(' · '), phone: x.phone, email: x.email, text: x.message, proj: P[x.project_id], read: !!x.admin_read_at, star: x.admin_star, note: x.admin_note, raw: x })),
    ...partners.map(x => ({ kind: 'partner', id: x.id, at: x.created_at, name: x.name + (x.company ? ' · ' + x.company : ''), contact: [x.phone, x.telegram, x.email].filter(Boolean).join(' · '), phone: x.phone, telegram: x.telegram, email: x.email, text: x.message, status: x.status, read: !!x.admin_read_at, star: x.admin_star, note: x.admin_note, raw: x })),
    ...verify.map(x => ({ kind: 'verify', id: x.id, at: x.created_at, name: x.email || 'Advertiser', contact: x.contact, email: x.email, text: [x.method ? 'Method: ' + x.method : '', x.preferred_time ? 'Best time: ' + x.preferred_time : '', x.note || ''].filter(Boolean).join('\n'), status: x.status, read: !!x.admin_read_at, star: x.admin_star, note: x.admin_note, raw: x })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  S.data = { listings, L, events, ev, msgs, inq, leads, partners, verify, agents, alerts, projects, P, users, vis, from, at: new Date() };
  S.loading = false;
}

// ---------- small building blocks ----------
const tile = (n, label, sub, col = 'blue', go) => `<${go ? `button data-go="${go}"` : 'div'} class="akpi k-${col}"><b>${n}</b><span>${label}</span>${sub ? `<small>${sub}</small>` : ''}</${go ? 'button' : 'div'}>`;
const panel = (title, inner, extra = '') => `<section class="apanel"><div class="aph"><h3>${title}</h3>${extra}</div>${inner}</section>`;
const empty = s => `<div class="aempty">${s}</div>`;
function bars(list, key = 'n', label = 'k', max = 8, fmtK = x => esc(x)) {
  if (!list || !list.length) return empty('No data yet');
  const top = list.slice(0, max), m = Math.max(...top.map(x => x[key] || 0), 1), tot = list.reduce((s, x) => s + (x[key] || 0), 0);
  return `<div class="abars">${top.map(x => `<div class="abar"><div class="abl"><span>${fmtK(x[label])}</span><em>${fmt(x[key])}<i>${pct(x[key], tot)}</i></em></div><div class="abt"><span style="width:${Math.max(2, (x[key] || 0) * 100 / m)}%"></span></div></div>`).join('')}</div>`;
}
function chart(days, a = 'visitors', b = 'views') {
  if (!days || !days.length) return empty('No visits yet');
  const W = 720, H = 160, n = days.length, bw = W / n, m = Math.max(...days.map(d => d[b] || 0), 1);
  const y = v => H - (v / m) * (H - 8);
  const step = Math.max(1, Math.ceil(n / (innerWidth < 720 ? 5 : 9))), idx = [];
  for (let i = 0; i < n; i += step) idx.push(i);
  if (n > 1 && idx[idx.length - 1] !== n - 1) { if (n - 1 - idx[idx.length - 1] < step * .6) idx.pop(); idx.push(n - 1); }
  const lab = d => new Date(d.d + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `<div class="achart"><div class="aleg"><span class="lg-a">Visitors</span><span class="lg-b">Page views</span><em>max ${fmt(m)} / day</em></div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Visits per day">
    ${[0.25, .5, .75, 1].map(f => `<line x1="0" x2="${W}" y1="${y(m * f)}" y2="${y(m * f)}" class="gl" vector-effect="non-scaling-stroke"/>`).join('')}
    ${days.map((d, i) => `<g><title>${lab(d)}: ${d[a]} visitors · ${d[b]} page views</title><rect class="bb" x="${i * bw + bw * .12}" y="${y(d[b] || 0)}" width="${bw * .76}" height="${H - y(d[b] || 0)}"/><rect class="ba" x="${i * bw + bw * .27}" y="${y(d[a] || 0)}" width="${bw * .46}" height="${H - y(d[a] || 0)}"/></g>`).join('')}</svg>
    <div class="axl">${idx.map(i => `<span style="left:${(i + .5) * 100 / n}%">${lab(days[i])}</span>`).join('')}</div></div>`;
}
function hours(list) {
  const h = Array.from({ length: 24 }, (_, i) => (list || []).find(x => x.h === i)?.n || 0), m = Math.max(...h, 1);
  return `<div class="ahours">${h.map((v, i) => `<div title="${i}:00 – ${v} page views"><span style="height:${Math.max(3, v * 100 / m)}%"></span><em>${i % 3 === 0 ? i : ''}</em></div>`).join('')}</div>`;
}
const pill = (on, val, label, n, attr = 'data-f') => `<button class="apill${on ? ' on' : ''}" ${attr}="${val}">${label}${n != null ? ` <i>${n}</i>` : ''}</button>`;
const thumb = l => l?.photos?.[0] ? `<img src="${esc(C.imgSrc(l.photos[0], 400))}" alt="" loading="lazy">` : `<span class="anoimg">${I.listings}</span>`;

// ---------- page ----------
export async function view() {
  css();
  const user = C.user();
  if (!user) return C.viewLogin('admin');
  C.app.innerHTML = `<div class="wrap adm"><div class="aempty" style="margin-top:30px">Loading…</div></div>`;
  const { data: ok } = await C.sb.rpc('yh_is_admin');
  if (!ok) { C.app.innerHTML = `<div class="wrap adm"><section class="apanel" style="margin-top:30px;text-align:center"><h3>Admin only</h3><p class="amut">You are signed in as ${esc(user.email)}, which is not an admin account.</p><a class="btn blue sm" href="#/">Back to site</a></section></div>`; return; }
  try { localStorage.setItem('yh_noct', '1'); } catch {}       // the admin's own visits never count
  const qs = C.qs();
  if (qs.get('s') && SECTIONS.some(x => x[0] === qs.get('s'))) S.sec = qs.get('s');
  if (qs.get('open')) { S.sec = 'inbox'; S.inbox.open = qs.get('open'); }
  await load();
  draw();
  clearInterval(S.timer);
  S.timer = setInterval(async () => {
    if (!document.querySelector('.adm')) return clearInterval(S.timer);
    if (document.visibilityState !== 'visible' || document.querySelector('.adm textarea:focus, .adm input:focus')) return;
    await load(); draw(true);
  }, 60000);
}

function counts() {
  const d = S.data, m = d.msgs;
  return {
    unread: m.filter(x => !x.read).length,
    verifyWait: d.verify.filter(v => v.status === 'pending').length,
    partnerNew: d.partners.filter(p => p.status === 'new').length,
    live: d.listings.filter(l => l.status === 'active').length,
    newAcc: d.users.filter(u => u.created_at >= d.from).length,
  };
}

function draw(keepScroll) {
  const d = S.data, c = counts(), v = d.vis || {};
  const y = keepScroll ? scrollY : 0;
  const sub = {
    overview: `${fmt(v.visitors)} visitors`,
    inbox: c.unread ? `${c.unread} unread` : `${d.msgs.length} messages`,
    visitors: `${fmt(v.now || 0)} online now`,
    listings: `${c.live} live`,
    accounts: `${d.users.length} accounts`,
    agents: c.verifyWait ? `${c.verifyWait} waiting` : `${d.agents.length} profiles`,
    partners: c.partnerNew ? `${c.partnerNew} new` : `${d.projects.length} projects`,
    telegram: `${d.alerts.filter(a => a.active !== false).length} subscribers`,
  };
  const badge = { inbox: c.unread, agents: c.verifyWait, partners: c.partnerNew };
  C.app.innerHTML = `<div class="wrap adm">
    <div class="atop">
      <div class="atl"><span class="alogo">${I.agents}</span><div><b>YourHome Admin</b><small>Updated ${d.at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · <span class="alive"><i></i>${fmt(v.now || 0)} online now</span></small></div></div>
      <div class="atr"><div class="aper">${PERIODS.map(([n, l]) => `<button data-days="${n}" class="${S.days === n ? 'on' : ''}">${l}</button>`).join('')}</div>
        <button class="aico" id="aRef" title="Refresh" aria-label="Refresh">${I.refresh}</button>
        <a class="aico" href="#/" title="Back to site" aria-label="Back to site">${I.back}</a></div>
    </div>
    <nav class="acards" aria-label="Admin sections">${SECTIONS.map(([k, l]) => `<button data-sec="${k}" class="acard${S.sec === k ? ' on' : ''}"><span class="aci">${I[k]}</span><b>${l}</b><small>${sub[k]}</small>${badge[k] ? `<em class="abadge">${badge[k]}</em>` : ''}</button>`).join('')}</nav>
    <div id="asec" class="asec">${SEC[S.sec]()}</div></div>`;
  bind();
  if (keepScroll) scrollTo(0, y);
}

function bind() {
  const root = C.app.querySelector('.adm');
  root.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => { S.sec = b.dataset.sec; draw(); $('asec')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  root.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { const [s, f] = b.dataset.go.split(':'); S.sec = s; if (f) { if (s === 'inbox') S.inbox.f = f; if (s === 'listings') S.lst.f = f; if (s === 'accounts') S.acc.f = f; } draw(); $('asec')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  root.querySelectorAll('[data-days]').forEach(b => b.onclick = async () => { S.days = +b.dataset.days; b.parentNode.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); await load(); draw(true); });
  $('aRef').onclick = async () => { $('aRef').classList.add('spin'); await load(); draw(true); C.toast('Updated'); };
  (BIND[S.sec] || (() => {}))(root);
}

// ================= OVERVIEW =================
const SEC = {};
const BIND = {};
SEC.overview = () => {
  const d = S.data, v = d.vis || {}, c = counts();
  const views = d.ev.filter(e => e.kind === 'view'), contacts = d.ev.filter(e => ['phone', 'telegram', 'whatsapp'].includes(e.kind));
  const per = PERIODS.find(p => p[0] === S.days)[1].toLowerCase();
  const need = [
    c.unread && [`${c.unread} unread message${c.unread > 1 ? 's' : ''}`, 'Open the reader', 'inbox:unread', 'red', I.inbox],
    c.verifyWait && [`${c.verifyWait} verification request${c.verifyWait > 1 ? 's' : ''}`, 'Call or message, then mark verified', 'agents', 'blue', I.agents],
    c.partnerNew && [`${c.partnerNew} new partner request${c.partnerNew > 1 ? 's' : ''}`, 'Agencies, developers, services', 'inbox:partner', 'blue', I.partners],
    d.listings.filter(l => l.is_demo).length && [`${d.listings.filter(l => l.is_demo).length} demo listings still live`, 'Delete them when real listings come in', 'listings:demo', 'grey', I.listings],
  ].filter(Boolean);
  const topL = Object.entries(views.reduce((m, e) => (m[e.listing_id] = (m[e.listing_id] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return `
    ${panel('What needs you now', need.length ? `<div class="aneed">${need.map(([t, s, go, col, ic]) => `<button class="aneedi n-${col}" data-go="${go}"><span>${ic}</span><div><b>${t}</b><small>${s}</small></div><em>›</em></button>`).join('')}</div>` : `<div class="aok">${I.check} All done – nothing is waiting for you.</div>`)}
    <div class="akpis">
      ${tile(fmt(v.visitors), 'Visitors', `${per} · ${fmt(v.newv)} new`, 'blue', 'visitors')}
      ${tile(fmt(v.views), 'Page views', v.visitors ? (v.views / v.visitors).toFixed(1) + ' per visitor' : '', 'blue', 'visitors')}
      ${tile(fmt(views.length), 'Listing views', `${new Set(views.map(e => e.visitor)).size} people`, 'red', 'listings')}
      ${tile(fmt(contacts.length), 'Contact clicks', 'call · WhatsApp · Telegram', 'red', 'listings')}
      ${tile(fmt(d.msgs.filter(m => m.at >= d.from).length), 'Messages', c.unread ? c.unread + ' unread' : 'all read', 'blue', 'inbox')}
      ${tile(fmt(c.live), 'Live listings', `${d.listings.filter(l => l.created_at >= d.from).length} new ${per}`, 'blue', 'listings')}
      ${tile(fmt(d.users.length), 'Accounts', `${c.newAcc} new ${per}`, 'red', 'accounts')}
      ${tile(fmt(d.alerts.length), 'Alert subscribers', 'Telegram requests', 'red', 'telegram')}
    </div>
    ${panel(`Visits · ${per}`, chart(v.days), `<button class="alink" data-go="visitors">All visitor stats ›</button>`)}
    <div class="agrid2">
      ${panel('Most viewed listings', topL.length ? `<div class="alist">${topL.map(([id, n]) => { const l = d.L[id]; return `<a class="arow" href="${l ? C.listingHref(l) : '#/'}"><span class="ath">${thumb(l)}</span><div><b>${esc(l?.title || 'Removed listing')}</b><small>${l ? esc((l.district || l.city || '') + ' · ' + DEAL(l)) : ''}</small></div><em>${n} views</em></a>`; }).join('')}</div>` : empty('No listing views yet'))}
      ${panel('Where visitors come from', bars(v.sources, 'u', 'k', 6, k => esc(k === 'direct' ? 'Direct / typed' : k)))}
    </div>
    <div class="agrid2">
      ${panel('Newest messages', d.msgs.length ? `<div class="alist">${d.msgs.slice(0, 6).map(m => msgRow(m)).join('')}</div>` : empty('No messages yet'), `<button class="alink" data-go="inbox">Open inbox ›</button>`)}
      ${panel('Newest accounts', d.users.length ? `<div class="alist">${d.users.slice(0, 6).map(u => accRow(u)).join('')}</div>` : empty('No accounts yet'), `<button class="alink" data-go="accounts">All accounts ›</button>`)}
    </div>`;
};
BIND.overview = root => root.querySelectorAll('[data-msg]').forEach(b => b.onclick = () => { S.sec = 'inbox'; S.inbox.open = b.dataset.msg; draw(); });

// ================= INBOX (reader) =================
function msgRow(m, on) {
  const who = m.kind === 'inquiry' ? (m.ref?.title || 'Listing') : m.kind === 'lead' ? (m.proj?.name || 'Project') : m.kind === 'partner' ? (m.raw.partner_type || 'Partner') : 'Get verified';
  return `<button class="amsg${m.read ? '' : ' unread'}${on ? ' on' : ''}" data-msg="${m.kind}:${m.id}">
    <span class="adot"></span><div><div class="amh"><b>${esc(m.name || 'Visitor')}</b><time>${when(m.at)}</time></div>
    <div class="ams"><span class="atag t-${KCOL[m.kind]}">${KIND[m.kind]}</span>${esc(who)}</div>
    <div class="amp">${esc((m.text || m.contact || '').slice(0, 110))}</div></div>${m.star ? `<i class="astar on">${I.star}</i>` : ''}</button>`;
}
SEC.inbox = () => {
  const d = S.data, st = S.inbox, all = d.msgs;
  const f = st.f, q = st.q.trim().toLowerCase();
  const list = all.filter(m => f === 'all' || (f === 'unread' ? !m.read : f === 'starred' ? m.star : m.kind === f))
    .filter(m => !q || [m.name, m.contact, m.text, m.ref?.title, m.proj?.name].join(' ').toLowerCase().includes(q));
  const open = st.open && all.find(m => m.kind + ':' + m.id === st.open);
  const n = k => all.filter(m => m.kind === k).length;
  return `<div class="ainbox${open ? ' has-open' : ''}">
    <div class="ailist">
      <div class="aitools"><input id="aiq" type="search" placeholder="Search name, phone, text…" value="${esc(st.q)}">
      <div class="apills">${pill(f === 'all', 'all', 'All', all.length)}${pill(f === 'unread', 'unread', 'Unread', all.filter(m => !m.read).length)}${pill(f === 'starred', 'starred', '★ Starred', all.filter(m => m.star).length)}
        ${pill(f === 'inquiry', 'inquiry', 'Listings', n('inquiry'))}${pill(f === 'lead', 'lead', 'Projects', n('lead'))}${pill(f === 'partner', 'partner', 'Partners', n('partner'))}${pill(f === 'verify', 'verify', 'Verification', n('verify'))}</div></div>
      <div class="aimsgs">${list.length ? list.map(m => msgRow(m, open && open.id === m.id)).join('') : empty(all.length ? 'Nothing matches' : 'No messages yet – listing messages, project questions, partner requests and verification requests all arrive here.')}</div>
    </div>
    <div class="airead">${open ? reader(open) : `<div class="aipick">${I.inbox}<b>Pick a message</b><small>Everything visitors send on YourHome.asia lands here.</small></div>`}</div>
  </div>`;
};
function reader(m) {
  const extra = m.kind === 'inquiry' && m.ref ? `<a class="arow aref" href="${C.listingHref(m.ref)}"><span class="ath">${thumb(m.ref)}</span><div><b>${esc(m.ref.title)}</b><small>${C.money(m.ref.price)}${C.priceSuffix(m.ref)} · ${esc(m.ref.district || m.ref.city || '')}</small></div><em>${I.open}</em></a>`
    : m.kind === 'lead' && m.proj ? `<a class="arow aref" href="#/project/${esc(m.proj.slug)}"><span class="ath">${thumb(m.proj)}</span><div><b>${esc(m.proj.name)}</b><small>${esc(m.proj.developer || '')} · ${esc(m.proj.district || '')}</small></div><em>${I.open}</em></a>` : '';
  const facts = m.kind === 'partner' ? [['Type', m.raw.partner_type], ['Company', m.raw.company], ['Areas', m.raw.areas], ['Website', m.raw.website], ['Language', m.raw.lang]]
    : m.kind === 'verify' ? [['Method', m.raw.method], ['Contact', m.raw.contact], ['Best time', m.raw.preferred_time], ['Account', m.raw.email]] : [['Contact', m.contact]];
  const status = m.kind === 'partner' ? `<label class="asel">Status <select id="aiStatus">${['new', 'contacted', 'approved', 'rejected', 'closed'].map(s => `<option value="${s}" ${m.status === s ? 'selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`).join('')}</select></label>`
    : m.kind === 'verify' ? (m.status === 'pending' ? `<div class="abtns"><button class="btn red sm" id="aiVok">✓ Mark as verified</button><button class="btn ghost sm" id="aiVno">Reject</button></div>` : `<span class="atag t-${m.status === 'verified' ? 'blue' : 'grey'}">${m.status === 'verified' ? '✓ Verified' : 'Rejected'}</span>`) : '';
  return `<div class="ard">
    <button class="aiback" id="aiBack">${I.back} All messages</button>
    <div class="arbar${m.read ? '' : ' un'}"><span>${m.read ? 'Read' : 'Unread'}</span><button id="aiRead">${m.read ? 'Mark as unread' : 'Mark as read'}</button><button id="aiStar" class="${m.star ? 'on' : ''}">${I.star}${m.star ? 'Starred' : 'Star'}</button></div>
    <div class="arh"><span class="atag t-${KCOL[m.kind]}">${KIND[m.kind]}</span><h3>${esc(m.name || 'Visitor')}</h3><small>${dt(m.at)} · ${when(m.at)}</small></div>
    <div class="arc">${contactLinks(m)}</div>
    ${m.text ? `<div class="artext">${esc(m.text)}</div>` : `<div class="artext amut">No message text – only contact details.</div>`}
    <div class="arfacts">${facts.filter(f => f[1]).map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>
    ${extra}
    ${status}
    <label class="anote">Private note (only you see it)<textarea id="aiNote" rows="3" maxlength="2000" placeholder="e.g. called on Monday, sends photos tomorrow">${esc(m.note || '')}</textarea></label>
    <button class="btn blue sm" id="aiNoteS">Save note</button>
  </div>`;
}
BIND.inbox = root => {
  const st = S.inbox;
  const q = $('aiq'); if (q) q.oninput = () => { st.q = q.value; const pos = q.selectionStart; $('asec').innerHTML = SEC.inbox(); BIND.inbox(root); const n = $('aiq'); n.focus(); n.setSelectionRange(pos, pos); };
  root.querySelectorAll('.ailist [data-f]').forEach(b => b.onclick = () => { st.f = b.dataset.f; redraw(); });
  root.querySelectorAll('[data-msg]').forEach(b => b.onclick = () => { st.open = b.dataset.msg; redraw(); if (innerWidth < 900) $('asec').scrollIntoView({ block: 'start' }); });
  const m = st.open && S.data.msgs.find(x => x.kind + ':' + x.id === st.open); if (!m) return;
  const call = async (args, done) => { const { error } = await C.sb.rpc('yh_admin_mark', Object.assign({ p_kind: m.kind, p_id: m.id }, args)); if (error) return C.toast('Error: ' + error.message); done(); redraw(); };
  $('aiBack').onclick = () => { st.open = null; redraw(); };
  $('aiRead').onclick = () => call({ p_read: !m.read }, () => { m.read = !m.read; });
  $('aiStar').onclick = () => call({ p_star: !m.star }, () => { m.star = !m.star; });
  $('aiNoteS').onclick = () => call({ p_note: $('aiNote').value }, () => { m.note = $('aiNote').value; C.toast('Note saved'); });
  const s = $('aiStatus'); if (s) s.onchange = () => call({ p_status: s.value }, () => { m.status = s.value; m.raw.status = s.value; C.toast('Status saved'); });
  const vr = ok => async () => { const { error } = await C.sb.rpc('yh_admin_verify', { p_id: m.id, p_ok: ok }); if (error) return C.toast('Error: ' + error.message); await load(); C.toast(ok ? 'Verified ✓' : 'Rejected'); draw(true); };
  if ($('aiVok')) { $('aiVok').onclick = vr(true); $('aiVno').onclick = vr(false); }
};
function redraw() { const y = scrollY; draw(); scrollTo(0, y); }

// ================= VISITORS =================
SEC.visitors = () => {
  const v = S.data.vis;
  if (!v) return panel('Visitors', empty('Visitor statistics are not available right now.'));
  const per = PERIODS.find(p => p[0] === S.days)[1].toLowerCase();
  return `<div class="akpis">
      ${tile(fmt(v.now), 'Online now', 'last 5 minutes', 'red')}
      ${tile(fmt(v.today?.visitors), 'Visitors today', fmt(v.today?.views) + ' page views', 'blue')}
      ${tile(fmt(v.visitors), 'Visitors', per, 'blue')}
      ${tile(fmt(v.views), 'Page views', per, 'blue')}
      ${tile(fmt(v.newv), 'New visitors', 'first visit ' + per, 'red')}
      ${tile(v.visitors ? (v.views / v.visitors).toFixed(1) : '–', 'Pages per visitor', 'how deep they browse', 'blue')}
      ${tile(fmt((v.devices || []).find(x => x.k === 'mobile')?.u || 0), 'On phones', pct((v.devices || []).find(x => x.k === 'mobile')?.u || 0, v.visitors), 'red')}
      ${tile(fmt(v.bots), 'Bots filtered out', 'not counted anywhere', 'grey')}
    </div>
    ${panel(`Visitors and page views per day · ${per}`, chart(v.days))}
    <div class="agrid2">
      ${panel('Time of day (your time zone)', hours(v.hours))}
      ${panel('Traffic sources', bars(v.sources, 'u', 'k', 8, k => esc(k === 'direct' ? 'Direct / typed' : k)))}
    </div>
    <div class="agrid3">
      ${panel('Countries', bars(v.countries, 'u', 'k', 10, k => `${flag(k)} ${esc(k === '?' ? 'Unknown' : COUNTRY(k))}`))}
      ${panel('Cities', bars(v.cities, 'u', 'k', 10))}
      ${panel('Languages', bars(v.langs, 'u', 'k', 6, k => esc(({ en: 'English', km: 'Khmer', zh: 'Chinese', fr: 'French', th: 'Thai' })[k] || k)))}
      ${panel('Devices', bars(v.devices, 'u', 'k', 3, k => esc(k[0].toUpperCase() + k.slice(1))))}
      ${panel('Browsers & apps', bars(v.browsers, 'u', 'k', 8))}
      ${panel('Systems', bars(v.os, 'u', 'k', 6))}
    </div>
    <div class="agrid2">
      ${panel('Most visited pages', bars(v.pages, 'n', 'k', 12, k => `<a href="${esc(k)}" target="_blank" rel="noopener">${esc(k.length > 46 ? k.slice(0, 45) + '…' : k)}</a>`))}
      ${panel('Campaigns (utm)', bars(v.utm, 'u', 'k', 8))}
    </div>
    ${panel('Latest visits', (v.recent || []).length ? `<div class="atable"><table><tr><th>When</th><th>Page</th><th>From</th><th>Where</th><th>Device</th><th>Lang</th><th>Visitor</th></tr>${v.recent.map(r => `<tr><td>${when(r.created_at)}</td><td class="tp">${esc(r.path)}</td><td>${esc(r.ref === 'direct' ? 'Direct' : r.ref || '')}</td><td>${flag(r.country)} ${esc(r.city || COUNTRY(r.country || '') || '')}</td><td>${esc(r.device || '')} · ${esc(r.browser || '')}</td><td>${esc((r.lang || '').toUpperCase())}</td><td class="tv">#${esc(r.visitor || '')}</td></tr>`).join('')}</table></div>` : empty('No visits counted yet. Counting started on 25 Nov 2026; your own browser is never counted.'))}`;
};

// ================= LISTINGS =================
SEC.listings = () => {
  const d = S.data, st = S.lst, ls = d.listings, q = st.q.trim().toLowerCase();
  const ev = d.ev, cnt = (id, k) => ev.filter(e => e.listing_id === id && (k === 'c' ? ['phone', 'telegram', 'whatsapp'].includes(e.kind) : e.kind === k)).length;
  const inq = id => d.inq.filter(i => i.listing_id === id).length;
  const F = { all: () => true, active: l => l.status === 'active', hidden: l => l.status === 'hidden' || l.status === 'rejected', done: l => l.status === 'rented' || l.status === 'sold', top: l => l.is_featured, demo: l => l.is_demo, real: l => !l.is_demo };
  const list = ls.filter(F[st.f] || F.all).filter(l => !q || [l.title, l.district, l.city, l.contact_name, l.contact_phone, l.property_type].join(' ').toLowerCase().includes(q));
  const owner = id => d.users.find(u => u.id === id);
  return `<div class="akpis">
      ${tile(ls.filter(F.active).length, 'Live', 'visible on the site', 'blue', 'listings:active')}
      ${tile(ls.filter(F.real).length, 'Real listings', 'posted by advertisers', 'red', 'listings:real')}
      ${tile(ls.filter(F.top).length, 'TOP placement', 'paid / featured', 'red', 'listings:top')}
      ${tile(ls.filter(F.demo).length, 'Demo listings', 'delete at launch', 'grey', 'listings:demo')}
    </div>
    ${panel('All listings', `<div class="aitools"><input id="alq" type="search" placeholder="Search title, district, contact…" value="${esc(st.q)}">
      <div class="apills">${pill(st.f === 'all', 'all', 'All', ls.length)}${pill(st.f === 'active', 'active', 'Live', ls.filter(F.active).length)}${pill(st.f === 'hidden', 'hidden', 'Hidden', ls.filter(F.hidden).length)}${pill(st.f === 'done', 'done', 'Rented / sold', ls.filter(F.done).length)}${pill(st.f === 'top', 'top', 'TOP', ls.filter(F.top).length)}${pill(st.f === 'demo', 'demo', 'Demo', ls.filter(F.demo).length)}</div></div>
      ${st.f === 'demo' && list.length ? `<div class="awarn">Demo listings are samples. When real listings are live you can remove them all at once. <button class="btn ghost sm" id="alDemo">${I.trash} Delete all ${list.length} demo listings</button></div>` : ''}
      <div class="alcards">${list.length ? list.map(l => { const o = owner(l.owner_id); return `<div class="alc">
        <a class="alcp" href="${C.listingHref(l)}">${thumb(l)}${l.is_featured ? '<i class="atop1">TOP</i>' : ''}${l.is_demo ? '<i class="ademo">DEMO</i>' : ''}</a>
        <div class="alcb"><b>${esc(l.title)}</b><small>${esc(DEAL(l))} · ${esc(l.district || l.city || '')} · ${C.money(l.price)}${C.priceSuffix(l)}</small>
          <small class="amut">${esc(o?.email || l.contact_name || 'Owner')} · ${when(l.created_at)}</small>
          <div class="alcs"><span title="Views ${PERIODS.find(p => p[0] === S.days)[1]}">${I.visitors}${cnt(l.id, 'view')}</span><span title="Contact clicks">${I.phone}${cnt(l.id, 'c')}</span><span title="Messages">${I.msg}${inq(l.id)}</span><span title="Saved">${I.star}${cnt(l.id, 'save')}</span></div></div>
        <div class="alca"><select data-lst="${l.id}" aria-label="Status">${['active', 'hidden', 'rented', 'sold', 'rejected'].map(s => `<option value="${s}" ${l.status === s ? 'selected' : ''}>${({ active: 'Live', hidden: 'Hidden', rented: 'Rented', sold: 'Sold', rejected: 'Rejected' })[s]}</option>`).join('')}</select>
          <button class="aico${l.is_featured ? ' on' : ''}" data-top="${l.id}" title="${l.is_featured ? 'Remove TOP' : 'Make TOP'}">${I.top}</button>
          <button class="aico" data-ldel="${l.id}" title="Delete">${I.trash}</button></div></div>`; }).join('') : empty('No listings here')}</div>`)}`;
};
BIND.listings = root => {
  const st = S.lst;
  const q = $('alq'); if (q) q.oninput = () => { st.q = q.value; const pos = q.selectionStart; $('asec').innerHTML = SEC.listings(); BIND.listings(root); const n = $('alq'); n.focus(); n.setSelectionRange(pos, pos); };
  root.querySelectorAll('.apanel [data-f]').forEach(b => b.onclick = () => { st.f = b.dataset.f; redraw(); });
  const L = S.data.L, rpc = async (args, msg) => { const { error } = await C.sb.rpc('yh_admin_listing', args); if (error) { C.toast('Error: ' + error.message); return false; } if (msg) C.toast(msg); return true; };
  root.querySelectorAll('[data-lst]').forEach(s => s.onchange = async () => { if (await rpc({ p_id: s.dataset.lst, p_status: s.value }, 'Status saved')) L[s.dataset.lst].status = s.value; });
  root.querySelectorAll('[data-top]').forEach(b => b.onclick = async () => { const l = L[b.dataset.top]; if (await rpc({ p_id: l.id, p_featured: !l.is_featured }, l.is_featured ? 'TOP removed' : 'Now TOP')) { l.is_featured = !l.is_featured; redraw(); } });
  root.querySelectorAll('[data-ldel]').forEach(b => b.onclick = async () => { const l = L[b.dataset.ldel]; if (!confirm(`Delete "${l.title}" for good? This cannot be undone.`)) return; if (await rpc({ p_id: l.id, p_delete: true }, 'Deleted')) { await load(); redraw(); } });
  const dd = $('alDemo'); if (dd) dd.onclick = async () => { const demo = S.data.listings.filter(l => l.is_demo); if (!confirm(`Delete all ${demo.length} demo listings for good? This cannot be undone.`)) return; dd.disabled = true; for (const l of demo) await rpc({ p_id: l.id, p_delete: true }); await load(); C.toast('Demo listings deleted'); redraw(); };
};

// ================= ACCOUNTS =================
function accRow(u) {
  const role = u.role === 'advertiser' ? (u.adv_kind === 'agent' ? 'Agent' : u.adv_kind === 'agency' ? 'Agency' : 'Owner / landlord') : u.role === 'seeker' ? 'Tenant / buyer' : 'Not chosen yet';
  return `<div class="arow acc"><span class="aav">${esc((u.name || u.email || '?').trim()[0]?.toUpperCase() || '?')}</span><div><b>${esc(u.name || u.email)}${u.verified ? ' <i class="aver">✓ Verified</i>' : ''}</b><small>${esc(role)} · ${esc(u.provider)} · joined ${when(u.created_at)}${u.listings ? ' · ' + u.listings + ' listing' + (u.listings > 1 ? 's' : '') : ''}</small></div>
    <div class="aaca">${u.email && !/@telegram\./.test(u.email) ? `<a class="aico" href="mailto:${esc(u.email)}" title="Email">${I.mail}</a>` : ''}${u.tg ? `<a class="aico" href="https://t.me/${esc(String(u.tg).replace(/^@/, ''))}" target="_blank" rel="noopener" title="Telegram">${I.telegram}</a>` : ''}</div></div>`;
}
SEC.accounts = () => {
  const us = S.data.users, st = S.acc, q = st.q.trim().toLowerCase();
  const F = { all: () => true, adv: u => u.role === 'advertiser', seek: u => u.role === 'seeker', agent: u => ['agent', 'agency'].includes(u.adv_kind), owner: u => u.role === 'advertiser' && !['agent', 'agency'].includes(u.adv_kind), ver: u => u.verified, new: u => u.created_at >= S.data.from, google: u => u.provider === 'google', email: u => u.provider === 'email', telegram: u => u.provider === 'telegram' };
  const list = us.filter(F[st.f] || F.all).filter(u => !q || [u.name, u.email, u.tg].join(' ').toLowerCase().includes(q));
  const n = k => us.filter(F[k]).length;
  return `<div class="akpis">
      ${tile(us.length, 'All accounts', 'YourHome users', 'blue', 'accounts:all')}
      ${tile(n('adv'), 'Advertisers', `${n('owner')} owners · ${n('agent')} agents`, 'red', 'accounts:adv')}
      ${tile(n('seek'), 'Tenants & buyers', 'looking for a home', 'blue', 'accounts:seek')}
      ${tile(n('ver'), 'Verified', 'checked by you', 'red', 'accounts:ver')}
    </div>
    ${panel('Accounts', `<div class="aitools"><input id="aaq" type="search" placeholder="Search name, email, Telegram…" value="${esc(st.q)}">
      <div class="apills">${[['all', 'All'], ['new', 'New ' + PERIODS.find(p => p[0] === S.days)[1].toLowerCase()], ['adv', 'Advertisers'], ['owner', 'Owners'], ['agent', 'Agents & agencies'], ['seek', 'Tenants & buyers'], ['ver', 'Verified'], ['google', 'Google'], ['email', 'Email'], ['telegram', 'Telegram']].map(([k, l]) => pill(st.f === k, k, l, n(k))).join('')}</div></div>
      <div class="alist">${list.length ? list.map(accRow).join('') : empty('No accounts here')}</div>`)}`;
};
BIND.accounts = root => {
  const st = S.acc;
  const q = $('aaq'); if (q) q.oninput = () => { st.q = q.value; const pos = q.selectionStart; $('asec').innerHTML = SEC.accounts(); BIND.accounts(root); const n = $('aaq'); n.focus(); n.setSelectionRange(pos, pos); };
  root.querySelectorAll('.apanel [data-f]').forEach(b => b.onclick = () => { st.f = b.dataset.f; redraw(); });
};

// ================= AGENTS & VERIFICATION =================
SEC.agents = () => {
  const d = S.data, pend = d.verify.filter(v => v.status === 'pending'), done = d.verify.filter(v => v.status !== 'pending');
  const vrow = v => `<div class="arow"><span class="aav">${I.agents}</span><div><b>${esc(v.email || 'Advertiser')}</b><small>${esc(v.method || '')} · ${esc(v.contact || '')}${v.preferred_time ? ' · ' + esc(v.preferred_time) : ''} · ${when(v.created_at)}</small>${v.note ? `<small class="amut">${esc(v.note)}</small>` : ''}</div>
    <div class="aaca">${contactLinks({ contact: v.contact })}${v.status === 'pending' ? `<button class="btn red sm" data-vok="${v.id}">✓ Verified</button><button class="btn ghost sm" data-vno="${v.id}">Reject</button>` : `<span class="atag t-${v.status === 'verified' ? 'blue' : 'grey'}">${v.status === 'verified' ? '✓ Verified' : 'Rejected'}</span>`}</div></div>`;
  return `<div class="akpis">
      ${tile(pend.length, 'Waiting for you', 'verification requests', 'red')}
      ${tile(d.agents.length, 'Agent profiles', 'public pages', 'blue')}
      ${tile(d.agents.filter(a => a.verified_at).length, 'Verified profiles', '✓ badge on the site', 'red')}
      ${tile(d.agents.filter(a => a.kind === 'agency').length, 'Agencies', `${d.agents.filter(a => a.kind === 'agent').length} agents · ${d.agents.filter(a => a.kind === 'owner').length} owners`, 'blue')}
    </div>
    ${panel(`Verification requests – waiting (${pend.length})`, pend.length ? `<div class="alist">${pend.map(vrow).join('')}</div>` : `<div class="aok">${I.check} No request is waiting.</div>`)}
    ${panel('Agent & agency profiles', d.agents.length ? `<div class="alist">${d.agents.map(a => `<div class="arow"><span class="aav">${a.photo && /^https:/.test(a.photo) ? `<img src="${esc(a.photo)}" alt="">` : esc((a.name || '?')[0])}</span><div><b>${esc(a.name)}${a.verified_at ? ' <i class="aver">✓ Verified</i>' : ''}</b><small>${esc(a.kind || '')}${a.company ? ' · ' + esc(a.company) : ''} · ${d.listings.filter(l => l.agent_id === a.id).length} listings · ${when(a.created_at)}</small></div>
      <div class="aaca"><a class="aico" href="#/agent/${esc(a.slug)}" title="Open profile">${I.open}</a><button class="btn ${a.verified_at ? 'ghost' : 'blue'} sm" data-agv="${a.id}" data-on="${a.verified_at ? 1 : 0}">${a.verified_at ? 'Remove ✓' : '✓ Verify'}</button></div></div>`).join('')}</div>` : empty('No agent profiles yet'))}
    ${done.length ? panel('Decided requests', `<div class="alist">${done.slice(0, 30).map(vrow).join('')}</div>`) : ''}`;
};
BIND.agents = root => {
  const act = ok => async e => { const b = e.currentTarget; b.disabled = true; const { error } = await C.sb.rpc('yh_admin_verify', { p_id: b.dataset.vok || b.dataset.vno, p_ok: ok }); if (error) { b.disabled = false; return C.toast('Error: ' + error.message); } await load(); C.toast(ok ? 'Verified ✓' : 'Rejected'); redraw(); };
  root.querySelectorAll('[data-vok]').forEach(b => b.onclick = act(true));
  root.querySelectorAll('[data-vno]').forEach(b => b.onclick = act(false));
  root.querySelectorAll('[data-agv]').forEach(b => b.onclick = async () => { const on = b.dataset.on === '1'; const { error } = await C.sb.rpc('yh_admin_agent', { p_id: b.dataset.agv, p_verified: !on }); if (error) return C.toast('Error: ' + error.message); await load(); C.toast(on ? 'Badge removed' : 'Verified ✓'); redraw(); });
};

// ================= PARTNERS & PROJECTS =================
SEC.partners = () => {
  const d = S.data, pr = d.partners;
  const types = Object.entries(pr.reduce((m, p) => (m[p.partner_type] = (m[p.partner_type] || 0) + 1, m), {})).map(([k, n]) => ({ k, n })).sort((a, b) => b.n - a.n);
  return `<div class="akpis">
      ${tile(pr.filter(p => p.status === 'new').length, 'New partner requests', 'not answered yet', 'red', 'inbox:partner')}
      ${tile(pr.length, 'All partner requests', `${pr.filter(p => p.status === 'approved').length} approved`, 'blue', 'inbox:partner')}
      ${tile(d.projects.filter(p => p.active).length, 'Live projects', `${d.projects.filter(p => p.is_demo).length} demo`, 'blue')}
      ${tile(d.leads.length, 'Project questions', `${d.leads.filter(l => !l.admin_read_at).length} unread`, 'red', 'inbox:lead')}
    </div>
    <div class="agrid2">
      ${panel('Partner requests', pr.length ? `<div class="alist">${pr.slice(0, 12).map(p => msgRow(d.msgs.find(m => m.kind === 'partner' && m.id === p.id))).join('')}</div>` : empty('No partner requests yet – they come from the Become a partner page.'), `<button class="alink" data-go="inbox:partner">Open in reader ›</button>`)}
      ${panel('Requests by partner type', bars(types, 'n', 'k', 10))}
    </div>
    ${panel('New projects', d.projects.length ? `<div class="alcards">${d.projects.map(p => `<div class="alc"><a class="alcp" href="#/project/${esc(p.slug)}">${thumb(p)}${p.is_featured ? '<i class="atop1">TOP</i>' : ''}${p.is_demo ? '<i class="ademo">DEMO</i>' : ''}</a>
      <div class="alcb"><b>${esc(p.name)}</b><small>${esc(p.developer || '')} · ${esc(p.district || '')}${p.price_from ? ' · from ' + C.money(p.price_from) : ''}</small><small class="amut">${esc(p.stage || '')} · ${d.leads.filter(l => l.project_id === p.id).length} questions</small></div>
      <div class="alca"><button class="btn ${p.active ? 'ghost' : 'blue'} sm" data-pact="${p.id}" data-on="${p.active ? 1 : 0}">${p.active ? 'Hide' : 'Show'}</button><button class="aico${p.is_featured ? ' on' : ''}" data-ptop="${p.id}" data-on="${p.is_featured ? 1 : 0}" title="TOP">${I.top}</button></div></div>`).join('')}</div>` : empty('No projects yet'))}`;
};
BIND.partners = root => {
  root.querySelectorAll('[data-msg]').forEach(b => b.onclick = () => { S.sec = 'inbox'; S.inbox.open = b.dataset.msg; draw(); });
  const pj = (args, msg) => async () => { const { error } = await C.sb.rpc('yh_admin_project', args); if (error) return C.toast('Error: ' + error.message); await load(); C.toast(msg); redraw(); };
  root.querySelectorAll('[data-pact]').forEach(b => b.onclick = pj({ p_id: b.dataset.pact, p_active: b.dataset.on !== '1' }, 'Saved'));
  root.querySelectorAll('[data-ptop]').forEach(b => b.onclick = pj({ p_id: b.dataset.ptop, p_featured: b.dataset.on !== '1' }, 'Saved'));
};

// ================= TELEGRAM =================
SEC.telegram = () => {
  const d = S.data, al = d.alerts, ch = C.tgChannel();
  const kinds = Object.entries(al.reduce((m, a) => (m[a.kind] = (m[a.kind] || 0) + 1, m), {})).map(([k, n]) => ({ k: ({ my_messages: 'Advertisers: new messages', new_listings: 'Seekers: new listing alerts' })[k] || k, n }));
  const step = (done, t, s) => `<div class="astep${done ? ' ok' : ''}"><span>${done ? I.check : ''}</span><div><b>${t}</b><small>${s}</small></div></div>`;
  return `<div class="akpis">
      ${tile(ch ? '@' + esc(ch) : '–', 'Channel', ch ? 'live on the site' : 'not set yet', ch ? 'blue' : 'grey')}
      ${tile(al.length, 'Alert requests', `${al.filter(a => a.active !== false).length} active`, 'red')}
      ${tile(al.filter(a => a.kind === 'new_listings').length, 'Listing alerts', 'seekers waiting for homes', 'blue')}
      ${tile(al.filter(a => a.kind === 'my_messages').length, 'Message alerts', 'advertisers', 'blue')}
    </div>
    <div class="agrid2">
      ${panel('Telegram setup', `<div class="asteps">
        ${step(!!ch, 'Central channel', ch ? `t.me/${esc(ch)} – the bottom menu and footer button point here` : 'Create the channel, send me its @username – the site’s Telegram buttons switch on at once')}
        ${step(false, 'YourHome bot', 'Posts every new listing to the central channel and to the agent’s own channel, sends the alerts below and alerts you about new messages')}
        ${step(al.length > 0, 'Alert requests are being collected', 'Saved now – sent as soon as the bot is connected')}
        ${step(false, 'Admin alerts to your Telegram', 'New message, partner request, verification request, new listing → straight to your phone')}
      </div>`)}
      ${panel('Requests by type', bars(kinds, 'n', 'k', 6))}
    </div>
    ${panel('Alert subscribers', al.length ? `<div class="atable"><table><tr><th>When</th><th>Telegram</th><th>Type</th><th>Filters</th><th>Status</th></tr>${al.map(a => `<tr><td>${when(a.created_at)}</td><td>${a.telegram ? `<a href="https://t.me/${esc(String(a.telegram).replace(/^@/, ''))}" target="_blank" rel="noopener">${esc(a.telegram)}</a>` : '–'}</td><td>${esc(({ my_messages: 'New messages', new_listings: 'New listings' })[a.kind] || a.kind)}</td><td class="tp">${esc(a.filters ? Object.entries(a.filters).filter(([, v]) => v !== '' && v != null).map(([k, v]) => k + ': ' + v).join(' · ') : '')}</td><td>${a.active === false ? 'Paused' : 'Active'}</td></tr>`).join('')}</table></div>` : empty('No Telegram alert requests yet'))}`;
};
