// TELEGRAM BOT WEBHOOK – @yourhomeasiabot (owner, 2026-11-25: alerts "élesítsd"; then "csináld meg mind sorrendben").
// Telegram can only message a person who pressed Start in the bot, and only by chat id – never by @username. So every
// /start (or any message) stores the chat id + Telegram username + language in yh_tg_chats; api/tg-sync.js then sends the
// alerts (yh_alerts) to the chat whose username matches the @handle typed on the site (or to the Telegram id of an account
// that signed in with Telegram). Blocking the bot sets blocked=true, Start again sets it back.
// What the bot does in the chat (texts in 5 languages – api/_tgx.js T):
//   • /start · /help – welcome + menu (Rent · Daily · Buy · Rooms search, Post a listing, alerts, channel, website)
//   • SEARCH – any text such as "2 bedroom BKK1 600" (or a menu button) → the 5 newest matching live listings + "see all"
//   • POST A LISTING – /post or the button: photos, then one description message → parsed summary → Publish creates the
//     listing for the person's YourHome account (made for their Telegram if they have none), photos to Storage yh-photos
//   • "Still available?" buttons (sent by api/_tgx.js reminders) → Yes = confirmed_at now · Rented/sold = status rented/sold
//   • /stop – alerts off
// The webhook is registered by api/tg-sync.js itself (setWebhook with a secret header) – nothing to do by hand.
// Env: TELEGRAM_BOT_TOKEN, SUPABASE_SERVICE_ROLE_KEY. Only the YourHome bot – never the Study and Work bot.
const crypto = require('crypto');
const S = require('./_seo');
const X = require('./_tgx');

const ORIGIN = 'https://yourhome.asia';
const CHANNEL = X.CHANNEL;
const SB_URL = X.SB_URL;
const token = X.token, key = X.key, tg = X.tg, rest = X.rest, rpc = X.rpc, esc = X.esc, tr = X.tr;
const secret = () => crypto.createHash('sha256').update('yh-webhook:' + token()).digest('hex').slice(0, 48);

async function saveChat(row) {
  await fetch(SB_URL + '/rest/v1/yh_tg_chats?on_conflict=chat_id', {
    method: 'POST', signal: AbortSignal.timeout(8000),
    headers: { apikey: key(), Authorization: 'Bearer ' + key(), 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }),
  });
}
async function getChat(id) { const r = await rest(`yh_tg_chats?select=chat_id,language,state&chat_id=eq.${id}`).catch(() => null); return (r && r[0]) || null; }
const setState = (id, state) => rest(`yh_tg_chats?chat_id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ state, updated_at: new Date().toISOString() }) }).catch(() => {});
function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise(ok => { let d = ''; req.on('data', c => { d += c; if (d.length > 1e5) req.destroy(); }); req.on('end', () => { try { ok(JSON.parse(d || '{}')); } catch { ok({}); } }); req.on('error', () => ok({})); });
}
const send = (chat, text, extra) => tg('sendMessage', { chat_id: chat, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true }, ...(extra || {}) });

function menu(lg) {
  return { inline_keyboard: [
    [{ text: tr(lg, 'rent'), callback_data: 's:rent' }, { text: tr(lg, 'daily'), callback_data: 's:daily' }, { text: tr(lg, 'buy'), callback_data: 's:sale' }, { text: tr(lg, 'rooms'), callback_data: 's:room' }],
    [{ text: tr(lg, 'post'), callback_data: 'post' }],
    [{ text: tr(lg, 'alerts'), url: ORIGIN + '/account' }, { text: tr(lg, 'channel'), url: 'https://t.me/' + CHANNEL.slice(1) }, { text: tr(lg, 'site'), url: ORIGIN + '/?utm_source=telegram&utm_medium=bot' }],
  ] };
}

// ---------- understanding a short text (search words or a listing description) ----------
const DISTRICTS = ['BKK1', 'BKK2', 'BKK3', 'Chamkar Mon', 'Daun Penh', 'Riverside', 'Toul Kork', 'Toul Tom Poung', 'Tonle Bassac', 'Sen Sok', 'Chroy Changvar', '7 Makara', 'Russey Keo', 'Mean Chey', 'Chbar Ampov', 'Por Senchey', 'Dangkao', 'Olympic'];
const CITIES = ['Phnom Penh', 'Siem Reap', 'Sihanoukville', 'Battambang', 'Kampot', 'Kep', 'Kampong Cham', 'Poipet', 'Bavet', 'Koh Kong', 'Takeo', 'Kampong Speu', 'Kampong Chhnang', 'Kampong Thom', 'Pursat', 'Prey Veng', 'Svay Rieng', 'Kratie', 'Stung Treng', 'Ratanakiri', 'Mondulkiri', 'Preah Vihear', 'Oddar Meanchey', 'Banteay Meanchey', 'Pailin', 'Tbong Khmum'];
const TYPES = [['hostel', /hostel|dorm/], ['hotel', /hotel|guest\s*house/], ['penthouse', /penthouse/], ['twin_villa', /twin\s*villa/], ['villa', /villa/], ['link_house', /link\s*house|borey/], ['flat_house', /flat\s*house/], ['shophouse', /shop\s*house/], ['condo', /condo/], ['office', /office/], ['land', /\bland\b|plot/], ['house', /\bhouse\b|home\b/], ['flat', /\bflat\b/], ['apartment', /apartment|apt\b|serviced/], ['room', /\broom\b/]];
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ');
function parse(text) {
  const t = norm(text), o = {};
  if (/\b(buy|sale|sell|selling|for sale)\b|លក់|出售|买|vente|à vendre|ขาย/.test(t)) o.deal = 'sale';
  else if (/daily|per day|\/day|a day|night|ប្រចាំថ្ងៃ|日租|journée|รายวัน/.test(t)) o.deal = 'daily';
  else if (/\brooms?\b|room for rent|បន្ទប់ជួល|房间|chambre|ห้องเช่า/.test(t) && !/bed ?rooms?|\d\s*rooms/.test(t)) o.deal = 'room';
  else if (/\brent|lease|ជួល|出租|租|louer|location|เช่า/.test(t)) o.deal = 'rent';
  if (/studio/.test(t)) o.beds = 0;
  const b = t.match(/(\d{1,2})\s*(?:-|\s)?(?:br|bed|beds|bedroom|bedrooms|bd|bdr|rooms?\b|បន្ទប់គេង|卧|室|chambres?|ห้องนอน)/);
  if (b) o.beds = Number(b[1]);
  const ba = t.match(/(\d)\s*(?:ba|bath|baths|bathroom|bathrooms|wc)/); if (ba) o.baths = Number(ba[1]);
  const ar = t.match(/(\d{2,5})\s*(?:m2|m²|sqm|sq m)/); if (ar) o.area = Number(ar[1]);
  // price: "$650", "650$", "650 usd", "1,200/month", "650k" – else the largest plain number ≥ 50 that is not beds/area
  const pm = t.replace(/,(?=\d{3})/g, '').match(/\$\s*(\d+(?:\.\d+)?)\s*(k)?|(\d+(?:\.\d+)?)\s*(k)?\s*(?:\$|usd|dollars?)/);
  if (pm) o.price = Math.round(Number(pm[1] || pm[3]) * ((pm[2] || pm[4]) ? 1000 : 1));
  else if (/\b(\d+(?:\.\d+)?)\s*k\b/.test(t)) o.price = Math.round(Number(t.match(/\b(\d+(?:\.\d+)?)\s*k\b/)[1]) * 1000);
  else { const nums = (t.replace(/,(?=\d{3})/g, '').match(/\b\d{2,7}\b/g) || []).map(Number).filter(n => n >= 50 && n !== o.area); if (nums.length) o.price = Math.max(...nums); }
  if (/\/\s*day|per day|daily|a night|\/night/.test(t)) o.period = 'day'; else if (/\/\s*week|per week|weekly/.test(t)) o.period = 'week';
  for (const [k, re] of TYPES) if (re.test(t)) { o.type = k; break; }
  const d = DISTRICTS.find(x => t.includes(x.toLowerCase())) || (/\bbkk\s*1\b|boeung keng kang 1/.test(t) ? 'BKK1' : /toul kok/.test(t) ? 'Toul Kork' : /tuol tom poung|ttp|russian market/.test(t) ? 'Toul Tom Poung' : null);
  if (d) o.district = d;
  const c = CITIES.find(x => t.includes(x.toLowerCase())) || (/siemreap/.test(t) ? 'Siem Reap' : /\bpp\b|phnompenh/.test(t) ? 'Phnom Penh' : /kampong som|ksom/.test(t) ? 'Sihanoukville' : null);
  if (c) o.city = c; else if (d) o.city = 'Phnom Penh';
  if (/furnished/.test(t) && !/unfurnished/.test(t)) o.furnished = true;
  const AM = { pool: /pool/, gym: /gym|fitness/, parking: /parking|car park/, balcony: /balcony/, elevator: /elevator|lift/, security: /security|guard/, wifi: /wifi|wi-fi|internet/, aircon: /air ?con|a\/c|aircon/, washer: /washer|washing/, kitchen: /kitchen/, cleaning: /cleaning|housekeeping/, pets: /pets? (ok|allowed|friendly)/ };
  o.amenities = Object.keys(AM).filter(k => AM[k].test(t));
  return o;
}

// ---------- search ----------
async function search(chat, lg, q) {
  const cols = 'id,city,district,deal_type,property_type,title,price,price_period,period_note,bedrooms,bathrooms,area_m2,photos,posted_by,created_at,is_demo,furnished,amenities';
  const all = await rest(`yh_listings?select=${cols}&status=eq.active&order=created_at.desc&limit=300`) || [];
  const hit = all.filter(l => {
    if (q.deal === 'daily' ? !(l.deal_type === 'rent' && l.price_period === 'day') : q.deal && l.deal_type !== q.deal) return false;
    if (q.city && (l.city || 'Phnom Penh') !== q.city) return false;
    if (q.district && l.district !== q.district) return false;
    if (q.beds === 0 ? l.bedrooms !== 0 : q.beds && !(l.bedrooms >= q.beds)) return false;
    if (q.type && q.type !== 'room' && l.property_type !== q.type) return false;
    if (q.price && !(Number(l.price) <= q.price * 1.1)) return false;
    if (q.furnished && !l.furnished) return false;
    if (q.amenities && q.amenities.length && !q.amenities.every(a => (l.amenities || []).includes(a))) return false;
    return true;
  }).sort((a, b) => (a.is_demo - b.is_demo) || (Date.parse(b.created_at) - Date.parse(a.created_at)));
  const p = new URLSearchParams();
  if (q.deal) p.set('deal', q.deal); if (q.city) p.set('city', q.city); if (q.district) p.set('q', q.district);
  if (q.beds != null) p.set('beds', String(q.beds)); if (q.type && q.type !== 'room') p.set('type', q.type); if (q.price) p.set('max', String(q.price));
  p.set('utm_source', 'telegram'); p.set('utm_medium', 'bot');
  const more = { inline_keyboard: [[{ text: tr(lg, 'seeAll'), url: ORIGIN + '/search?' + p.toString() }], [{ text: tr(lg, 'post'), callback_data: 'post' }]] };
  if (!hit.length) return send(chat, tr(lg, 'none'), { reply_markup: more });
  await send(chat, tr(lg, 'found', { n: hit.length }));
  for (const l of hit.slice(0, 5)) await X.sendListing(chat, l, [], 'bot', l.is_demo ? '🧪 <i>Sample listing</i>' : '');
  return send(chat, '👆', { reply_markup: more });
}

// ---------- post a listing from the chat ----------
async function accountFor(from) {
  let id = await rpc('yh_user_by_tg', { p_tg: from.id }).catch(() => null);
  if (id) return id;
  const H = { apikey: key(), Authorization: 'Bearer ' + key(), 'Content-Type': 'application/json' };
  const name = [from.first_name, from.last_name].filter(Boolean).join(' ').slice(0, 100) || 'Telegram user';
  const r = await fetch(SB_URL + '/auth/v1/admin/users', { method: 'POST', headers: H, signal: AbortSignal.timeout(8000), body: JSON.stringify({
    email: 'tg' + from.id + '@telegram.studyandworkabroad.net', email_confirm: true,
    user_metadata: { signup_site: 'yourhome', full_name: name, telegram_id: String(from.id), telegram_username: from.username || '', role: 'advertiser', adv_kind: 'owner', via: 'telegram_bot' } }) });
  if (r.ok) { const u = await r.json(); return u.id || (u.user && u.user.id); }
  return await rpc('yh_user_by_tg', { p_tg: from.id }).catch(() => null);
}
async function savePhoto(uid, fileId) {
  const f = await tg('getFile', { file_id: fileId });
  if (!f.ok || !f.result.file_path) return null;
  const img = await fetch(`https://api.telegram.org/file/bot${token()}/${f.result.file_path}`, { signal: AbortSignal.timeout(15000) });
  if (!img.ok) return null;
  const buf = Buffer.from(await img.arrayBuffer());
  if (buf.length > 2 * 1024 * 1024) return null;
  const path = `${uid}/${Date.now()}-${crypto.randomBytes(3).toString('hex')}.jpg`;
  const up = await fetch(`${SB_URL}/storage/v1/object/yh-photos/${path}`, { method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { apikey: key(), Authorization: 'Bearer ' + key(), 'Content-Type': 'image/jpeg', 'cache-control': 'max-age=31536000' }, body: buf });
  return up.ok ? `${SB_URL}/storage/v1/object/public/yh-photos/${path}` : null;
}
function draftSummary(d, n) {
  const deal = d.deal === 'sale' ? 'For sale' : d.deal === 'room' ? 'Room for rent' : d.deal === 'daily' ? 'Daily rent' : 'For rent';
  const per = d.deal === 'sale' ? '' : d.period === 'day' || d.deal === 'daily' ? '/day' : d.period === 'week' ? '/week' : '/month';
  return [`🏷 ${deal} · ${String(d.type || 'apartment').replace(/_/g, ' ')}`, `📍 ${[d.district, d.city || 'Phnom Penh'].filter(Boolean).join(', ')}`,
    `💰 ${d.price ? '$' + Number(d.price).toLocaleString('en-US') + per : '—'}`, d.beds != null ? `🛏 ${d.beds === 0 ? 'Studio' : d.beds + ' bedroom(s)'}` : '',
    d.baths ? `🛁 ${d.baths}` : '', d.area ? `📐 ${d.area} m²` : '', `📷 ${n} photo(s)`, '', `“${esc(d.title)}”`, '', '<i>By publishing you accept our Terms: yourhome.asia/terms</i>'].filter(x => x !== '').join('\n');
}
async function publish(chat, from, st, lg) {
  const d = st.draft; if (!d) return send(chat, tr(lg, 'cancelled'));
  await send(chat, '⏳ …');
  const uid = await accountFor(from);
  if (!uid) return send(chat, '⚠️ Could not create your account – please post on ' + ORIGIN + '/post');
  const photos = [];
  for (const fid of (st.photos || []).slice(0, 15)) { const u = await savePhoto(uid, fid).catch(() => null); if (u) photos.push(u); }
  const deal = d.deal === 'sale' ? 'sale' : d.deal === 'room' ? 'room' : 'rent';
  const row = {
    owner_id: uid, deal_type: deal, property_type: deal === 'room' ? 'room' : (d.type && d.type !== 'room' ? d.type : 'apartment'),
    price_period: deal === 'sale' ? 'total' : d.deal === 'daily' || d.period === 'day' ? 'day' : d.period === 'week' ? 'week' : 'month',
    price: Number(d.price) || 0, bedrooms: d.beds != null ? Math.min(d.beds, 50) : null, bathrooms: d.baths || null, area_m2: d.area || null,
    city: d.city || 'Phnom Penh', district: d.district || null, title: d.title, description: String(d.text || '').slice(0, 5000),
    photos, amenities: d.amenities || [], furnished: !!d.furnished, contact_name: [from.first_name, from.last_name].filter(Boolean).join(' ').slice(0, 80) || null,
    contact_telegram: from.username ? '@' + from.username : null, status: 'active',
  };
  let l;
  try { l = (await rest('yh_listings', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row) }))[0]; }
  catch (e) { return send(chat, '⚠️ ' + esc(String(e.message || e).slice(0, 200)) + '\n' + ORIGIN + '/post'); }
  await setState(chat, null);
  return send(chat, tr(lg, 'published'), { reply_markup: { inline_keyboard: [[{ text: tr(lg, 'view'), url: ORIGIN + S.listingPath(l) }], [{ text: tr(lg, 'edit'), url: ORIGIN + '/edit/' + l.id }]] } });
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('POST only'); }
  if (!token() || !key()) { res.statusCode = 503; return res.end('not configured'); }
  const got = String(req.headers['x-telegram-bot-api-secret-token'] || '');
  const want = secret();
  if (got.length !== want.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want))) { res.statusCode = 401; return res.end('no'); }
  const u = await readBody(req);
  try {
    // blocked / unblocked the bot
    const mc = u.my_chat_member;
    if (mc && mc.chat && mc.chat.type === 'private') {
      const st = mc.new_chat_member && mc.new_chat_member.status;
      await saveChat({ chat_id: mc.chat.id, username: mc.from.username || null, first_name: (mc.from.first_name || '').slice(0, 80) || null, blocked: st === 'kicked' || st === 'left' });
    }

    // buttons
    const cq = u.callback_query;
    if (cq && cq.message && cq.message.chat && cq.message.chat.type === 'private') {
      const chat = cq.message.chat.id, data = String(cq.data || ''), lg = X.langOf(cq.from.language_code);
      await tg('answerCallbackQuery', { callback_query_id: cq.id });
      const m = data.match(/^(ok|gone):([0-9a-f-]{36})$/);
      if (m) {   // "still available?" – only the chat the question was sent to may answer
        const rem = await rest(`yh_tg_reminders?select=listing_id,round&listing_id=eq.${m[2]}&chat_id=eq.${chat}&order=round.desc&limit=1`);
        if (rem && rem.length) {
          const l = (await rest(`yh_listings?select=id,deal_type&id=eq.${m[2]}`) || [])[0];
          if (l) {
            await rest(`yh_listings?id=eq.${l.id}`, { method: 'PATCH', body: JSON.stringify(m[1] === 'ok' ? { confirmed_at: new Date().toISOString() } : { status: l.deal_type === 'sale' ? 'sold' : 'rented' }) });
            await rest(`yh_tg_reminders?listing_id=eq.${l.id}&round=eq.${rem[0].round}`, { method: 'PATCH', body: JSON.stringify({ answer: m[1] }) });
            await tg('editMessageText', { chat_id: chat, message_id: cq.message.message_id, text: tr(lg, m[1] === 'ok' ? 'thanksYes' : 'thanksGone') });
          }
        }
      } else if (/^s:(rent|daily|sale|room)$/.test(data)) {
        await search(chat, lg, { deal: data.slice(2) });
      } else if (data === 'post') {
        await setState(chat, { mode: 'post', photos: [], at: Date.now() });
        await send(chat, tr(lg, 'postIntro'));
      } else if (data === 'pub') {
        const c = await getChat(chat);
        if (c && c.state && c.state.mode === 'post' && c.state.draft) { await setState(chat, { ...c.state, draft: null }); await publish(chat, cq.from, c.state, lg); }
      } else if (data === 'cx') {
        await setState(chat, null); await send(chat, tr(lg, 'cancelled'), { reply_markup: menu(lg) });
      }
    }

    const m = u.message;
    if (m && m.chat && m.chat.type === 'private' && m.from && !m.from.is_bot) {
      const chat = m.chat.id, lg = X.langOf(m.from.language_code);
      await saveChat({ chat_id: chat, username: m.from.username || null, first_name: (m.from.first_name || '').slice(0, 80) || null, blocked: false, language: lg });
      const text = String(m.text || m.caption || '').trim();
      const noUser = !m.from.username ? '\n\n' + tr(lg, 'noUser') : '';
      const c = await getChat(chat);
      let st = c && c.state && c.state.mode === 'post' && Date.now() - (c.state.at || 0) < 6 * 3600e3 ? c.state : null;
      // a photo sent without starting /post = the person wants to post a listing
      if (!st && m.photo && !/^\//.test(text)) { st = { mode: 'post', photos: [], at: Date.now() }; await setState(chat, st); }

      if (/^\/(start|help|menu)\b/.test(text)) {
        if (st) await setState(chat, null);
        await send(chat, tr(lg, 'welcome') + noUser, { reply_markup: menu(lg) });
      } else if (/^\/stop\b/.test(text)) {
        await saveChat({ chat_id: chat, username: m.from.username || null, blocked: true });
        await send(chat, tr(lg, 'stop'));
      } else if (/^\/cancel\b/.test(text)) {
        await setState(chat, null); await send(chat, tr(lg, 'cancelled'), { reply_markup: menu(lg) });
      } else if (/^\/post\b/.test(text)) {
        await setState(chat, { mode: 'post', photos: [], at: Date.now() }); await send(chat, tr(lg, 'postIntro'));
      } else if (st) {
        // posting: collect photos, then the description
        if (m.photo && m.photo.length) {
          const big = m.photo[m.photo.length - 1];
          const photos = [...(st.photos || []), big.file_id].slice(0, 15);
          const fresh = await getChat(chat);   // albums arrive as several updates at once – merge with what is stored now
          const merged = [...new Set([...(((fresh || {}).state || {}).photos || []), ...photos])].slice(0, 15);
          const first = !m.media_group_id || m.media_group_id !== st.group;
          await setState(chat, { ...st, ...((fresh || {}).state || {}), photos: merged, group: m.media_group_id || null, at: Date.now() });
          if (first && !m.caption) await send(chat, tr(lg, 'gotPhotos', { n: merged.length }));
        }
        if (text && !text.startsWith('/')) {
          const p = parse(text);
          if (!p.price) { await send(chat, tr(lg, 'needPrice')); }
          else {
            const first = text.split('\n').map(s => s.trim()).find(s => s.length >= 5) || '';
            const title = (first.length > 140 ? first.slice(0, 137) + '…' : first) || 'Property for rent in Cambodia';
            const fresh = await getChat(chat);
            const cur = (fresh && fresh.state && fresh.state.mode === 'post') ? fresh.state : st;
            const draft = { ...p, title: title.length >= 5 ? title : title + ' – Cambodia', text };
            await setState(chat, { ...cur, draft, at: Date.now() });
            await send(chat, tr(lg, 'summary', { s: draftSummary(draft, (cur.photos || []).length) }), { reply_markup: { inline_keyboard: [[{ text: tr(lg, 'publish'), callback_data: 'pub' }], [{ text: tr(lg, 'cancel'), callback_data: 'cx' }]] } });
          }
        }
      } else if (text && !text.startsWith('/')) {
        await search(chat, lg, parse(text));
      } else {
        await send(chat, tr(lg, 'welcome') + noUser, { reply_markup: menu(lg) });
      }
    }
  } catch (e) { /* always answer 200 – otherwise Telegram keeps resending the same update */ }
  res.statusCode = 200; res.end('ok');
};
module.exports.secret = secret;
module.exports.parse = parse;
