// TELEGRAM CHANNEL AUTO-POST (owner, 2026-11-25: "élesítsd a channelt" – central channel where every listing also appears):
// Vercel cron (vercel.json "crons", every 10 min) calls this. It takes live, non-demo listings of the last 2 days that the
// channel has not had yet (table yh_channel_posts – the row is claimed first, so nothing is posted twice) and posts each one
// with @yourhomeasiabot (?welcome=1 = the one-time welcome post): photo + caption (name, place, price, beds/baths/m²) + buttons "View listing" / "Post your listing".
// Env (yourhome-asia, Production): TELEGRAM_BOT_TOKEN, SUPABASE_SERVICE_ROLE_KEY. Channel = CHANNEL below (= TG_CHANNEL in app.js).
const S = require('./_seo');

const CHANNEL = '@yourhomeasia';
const SB_URL = 'https://uuzevmbfcxtvjuguiygy.supabase.co';
const MAX_PER_RUN = 5;
// the token is taken out of whatever was pasted ("bot123:ABC…", quotes, "TELEGRAM_BOT_TOKEN=…", spaces) – Telegram answers
// "Not Found" to anything that is not exactly <digits>:<secret>
const token = () => { const v = String(process.env.TELEGRAM_BOT_TOKEN || ''); const m = v.match(/\d{6,12}:[A-Za-z0-9_-]{30,}/); return m ? m[0] : v.trim(); };
const key = () => String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const H = () => ({ apikey: key(), Authorization: 'Bearer ' + key(), 'Content-Type': 'application/json' });
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function rest(path, opts = {}) {
  const r = await fetch(SB_URL + '/rest/v1/' + path, { ...opts, headers: { ...H(), ...(opts.headers || {}) }, signal: AbortSignal.timeout(8000) });
  const t = await r.text();
  if (!r.ok) throw new Error(path.split('?')[0] + ' ' + r.status + ' ' + t.slice(0, 200));
  return t ? JSON.parse(t) : null;
}
async function tg(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
  return r.json();
}

function caption(l) {
  const url = S.ORIGIN + S.listingPath(l) + '?utm_source=telegram&utm_medium=channel';
  const facts = [l.bedrooms === 0 ? 'Studio' : l.bedrooms > 0 ? `🛏 ${l.bedrooms} bed` : '', l.bathrooms > 0 ? `🛁 ${l.bathrooms} bath` : '', l.area_m2 > 0 ? `📐 ${l.area_m2} m²` : ''].filter(Boolean).join(' · ');
  const price = l.price > 0 ? (l.price_period === 'other' && l.period_note ? `${S.money(l.price)} ${l.period_note}` : S.money(l.price) + S.per(l)) : 'Price on request';
  const lines = [
    `🏠 <b>${esc(S.listingName(l))}</b>`,
    `📍 ${esc(S.place(l))}`,
    `💰 <b>${esc(price)}</b>`,
    facts && esc(facts),
    l.title ? `\n${esc(String(l.title).slice(0, 140))}` : '',
    `\n👉 <a href="${esc(url)}">See photos &amp; contact the ${l.posted_by === 'agent' ? 'agent' : 'owner'}</a>`,
    `\n#${l.deal_type === 'sale' ? 'ForSale' : l.price_period === 'day' ? 'DailyRent' : 'ForRent'} #${String(l.city || 'Phnom Penh').replace(/[^A-Za-z]/g, '')} #Cambodia`,
  ].filter(Boolean);
  return { text: lines.join('\n').slice(0, 1000), url };
}

// ---------- PERSONAL TELEGRAM ALERTS (yh_alerts) ----------
// new_listings: every new live non-demo listing (last 2 days, posted after the alert was saved) that matches the alert's
// saved search is sent once (yh_alert_sends) to the person's chat. my_messages: every new message (yh_inquiries) about a
// listing of the alert's owner. The chat = yh_tg_chats row whose username equals the typed @handle (they pressed Start in
// @yourhomeasiabot), else the Telegram id of an account that signed in with Telegram. No chat yet = waits (nothing is lost
// for 2 days). Max MAX_ALERTS messages per run.
const MAX_ALERTS = 60;
const LEASE = ['day', 'month', '6m', '1y'];
function matches(l, f) {
  f = f || {};
  if (f.deal === 'daily') { if (!(l.deal_type === 'rent' && l.price_period === 'day')) return false; }
  else if (f.deal && l.deal_type !== f.deal) return false;
  if (f.city && l.city !== f.city) return false;
  if (f.type === 'studio') { if (l.bedrooms !== 0) return false; } else if (f.type === 'commercial') { if (!['office', 'shophouse', 'shop', 'salon', 'barber', 'restaurant', 'warehouse'].includes(l.property_type)) return false; } else if (f.type && l.property_type !== f.type) return false;
  if (f.max && !(Number(l.price) <= Number(f.max))) return false;
  if (f.beds) { if (f.beds === '0' ? l.bedrooms !== 0 : !(l.bedrooms >= Number(f.beds))) return false; }
  if (f.furn && !l.furnished) return false;
  const amen = String(f.amen || '').split(',').filter(Boolean);
  if (amen.length && !amen.every(a => (l.amenities || []).includes(a))) return false;
  if ((f.by === 'owner' || f.by === 'agent') && l.posted_by !== f.by) return false;
  if (f.foreign && !l.foreigner_ok) return false;
  if (f.baths && !(l.bathrooms >= Number(f.baths))) return false;
  if (f.area && !(Number(l.area_m2) >= Number(f.area))) return false;
  if (f.photos && !(l.photos || []).length) return false;
  if (['hard', 'soft', 'strata'].includes(f.title) && l.title_type !== f.title) return false;
  if (LEASE.includes(f.lease) && l.min_lease && !LEASE.slice(0, LEASE.indexOf(f.lease) + 1).includes(l.min_lease)) return false;
  if (f.q) { const s = String(f.q).trim().toLowerCase(); if (s && ![l.district, l.title, l.address].some(v => String(v || '').toLowerCase().includes(s))) return false; }
  return true;
}
const handle = s => String(s || '').trim().replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, '').toLowerCase();
async function chatFor(a, chats, tgIds) {
  const h = handle(a.telegram);
  const c = h && chats.find(x => String(x.username || '').toLowerCase() === h);
  if (c) return c.blocked ? null : c.chat_id;
  if (a.user_id) {
    if (!tgIds.has(a.user_id)) {
      let id = null;
      try {
        const r = await fetch(SB_URL + '/auth/v1/admin/users/' + a.user_id, { headers: H(), signal: AbortSignal.timeout(6000) });
        const u = r.ok ? await r.json() : null;
        const t = u && u.user_metadata && u.user_metadata.telegram_id;
        if (/^\d{3,20}$/.test(String(t || ''))) id = Number(t);
      } catch {}
      tgIds.set(a.user_id, id);
    }
    const id = tgIds.get(a.user_id);
    const c2 = id && chats.find(x => Number(x.chat_id) === id);
    if (c2 && c2.blocked) return null;
    return id;   // signed in with Telegram + "allow the bot to message me" – works even without pressing Start
  }
  return null;
}
async function sendAlerts() {
  const subs = await rest('yh_alerts?select=id,user_id,kind,telegram,filters,created_at&active=is.true&limit=2000');
  if (!subs || !subs.length) return { subscribers: 0, sent: 0 };
  const chats = await rest('yh_tg_chats?select=chat_id,username,blocked&limit=10000');
  const tgIds = new Map();
  const since = new Date(Date.now() - 2 * 864e5).toISOString();
  const sentRows = await rest(`yh_alert_sends?select=alert_id,ref_id&sent_at=gte.${new Date(Date.now() - 4 * 864e5).toISOString()}&limit=20000`);
  const sent = new Set((sentRows || []).map(r => r.alert_id + ':' + r.ref_id));
  let n = 0, waiting = 0; const errs = [];
  const send = async (a, refId, chat, payload) => {
    const claimed = await rest('yh_alert_sends?on_conflict=alert_id,ref_id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ alert_id: a.id, ref_id: refId, chat_id: chat }) });
    if (!claimed || !claimed.length) return;
    let r = payload.photo ? await tg('sendPhoto', { chat_id: chat, photo: payload.photo, caption: payload.text, parse_mode: 'HTML', reply_markup: payload.kb }) : null;
    if (!r || !r.ok) r = await tg('sendMessage', { chat_id: chat, text: payload.text, parse_mode: 'HTML', reply_markup: payload.kb, link_preview_options: { is_disabled: true } });
    await rest(`yh_alert_sends?alert_id=eq.${a.id}&ref_id=eq.${refId}`, { method: 'PATCH', body: JSON.stringify({ ok: !!r.ok, error: r.ok ? null : String(r.description || 'failed').slice(0, 300) }) });
    if (!r.ok && r.error_code === 403) await rest(`yh_tg_chats?chat_id=eq.${chat}`, { method: 'PATCH', body: JSON.stringify({ blocked: true }) }).catch(() => {});
    if (r.ok) n++; else errs.push(String(r.description || 'failed').slice(0, 80));
  };

  // 1) new listings that match a saved search
  const nl = subs.filter(a => a.kind === 'new_listings');
  if (nl.length) {
    const cols = 'id,city,district,deal_type,property_type,title,price,price_period,period_note,bedrooms,bathrooms,area_m2,photos,posted_by,created_at,furnished,amenities,foreigner_ok,title_type,min_lease,address';
    const list = await rest(`yh_listings?select=${cols}&status=eq.active&is_demo=eq.false&created_at=gte.${since}&order=created_at.asc&limit=200`) || [];
    for (const a of nl) {
      const todo = list.filter(l => new Date(l.created_at) >= new Date(a.created_at) && !sent.has(a.id + ':' + l.id) && matches(l, a.filters));
      if (!todo.length) continue;
      const chat = await chatFor(a, chats, tgIds);
      if (!chat) { waiting++; continue; }
      for (const l of todo) {
        if (n >= MAX_ALERTS) break;
        const c = caption(l);
        const url = c.url.replace('utm_medium=channel', 'utm_medium=alert');
        await send(a, l.id, chat, {
          text: ('🔔 <b>New listing for your alert</b>\n\n' + c.text.replace(/utm_medium=channel/g, 'utm_medium=alert')).slice(0, 1000),
          photo: ((l.photos || []).find(p => /^https:\/\//.test(p)) && S.img((l.photos || []).find(p => /^https:\/\//.test(p)), 1200)) || null,
          kb: { inline_keyboard: [[{ text: '👀 View listing', url }], [{ text: '🔕 Manage alerts', url: S.ORIGIN + '/account' }]] },
        });
      }
    }
  }

  // 2) new messages to the advertiser
  const mm = subs.filter(a => a.kind === 'my_messages' && a.user_id);
  if (mm.length && n < MAX_ALERTS) {
    const inq = await rest(`yh_inquiries?select=id,listing_id,name,contact,message,created_at&created_at=gte.${since}&order=created_at.asc&limit=300`) || [];
    if (inq.length) {
      const ids = [...new Set(inq.map(i => i.listing_id).filter(Boolean))];
      const ls = ids.length ? await rest(`yh_listings?select=id,owner_id,city,district,deal_type,property_type,bedrooms,price_period&id=in.(${ids.join(',')})`) || [] : [];
      const byId = new Map(ls.map(l => [l.id, l]));
      for (const a of mm) {
        const todo = inq.filter(i => { const l = byId.get(i.listing_id); return l && l.owner_id === a.user_id && new Date(i.created_at) >= new Date(a.created_at) && !sent.has(a.id + ':' + i.id); });
        if (!todo.length) continue;
        const chat = await chatFor(a, chats, tgIds);
        if (!chat) { waiting++; continue; }
        for (const i of todo) {
          if (n >= MAX_ALERTS) break;
          const l = byId.get(i.listing_id);
          const text = ['📩 <b>New message about your listing</b>', `🏠 ${esc(S.listingName(l))} – ${esc(S.place(l))}`, '',
            `👤 ${esc(String(i.name || 'Visitor').slice(0, 80))}`, i.contact ? `☎️ ${esc(String(i.contact).slice(0, 80))}` : '',
            i.message ? `\n💬 ${esc(String(i.message).slice(0, 500))}` : ''].filter(Boolean).join('\n');
          await send(a, i.id, chat, { text, kb: { inline_keyboard: [[{ text: '📬 Open in my dashboard', url: S.ORIGIN + '/account?tab=messages&m=' + i.id }]] } });
        }
      }
    }
  }
  return { subscribers: subs.length, sent: n, waiting_for_start: waiting, errors: errs.slice(0, 5) };
}

// The bot's webhook (api/tg-bot.js) – set once, checked every run (cheap getWebhookInfo).
async function ensureWebhook(req) {
  const want = S.ORIGIN + '/api/tg-bot';
  const me = await tg('getMe', {});
  if (!me.ok) { const v = String(process.env.TELEGRAM_BOT_TOKEN || '');   // never shows the token – only what is wrong with it
    return `bot token refused by Telegram (${me.description || 'error'}) – TELEGRAM_BOT_TOKEN has ${v.length} characters, ${/\d{6,12}:[A-Za-z0-9_-]{30,}/.test(v) ? 'looks like a bot token: it is revoked or belongs to no bot – copy it again from @BotFather → /mybots → API Token' : 'does NOT look like a bot token (123456789:AA…) – copy it from @BotFather → /mybots → API Token'}`; }
  if (me.result.username && me.result.username.toLowerCase() !== 'yourhomeasiabot') return 'wrong bot: the token belongs to @' + me.result.username + ' – use the @yourhomeasiabot token';
  const info = await tg('getWebhookInfo', {});
  const UPD = ['message', 'my_chat_member', 'callback_query'];   // callback_query: the "Still available?" / Publish / search buttons
  if (info.ok && info.result && info.result.url === want && UPD.every(u => (info.result.allowed_updates || ['message']).includes(u))) return 'ok';
  const secret = require('crypto').createHash('sha256').update('yh-webhook:' + token()).digest('hex').slice(0, 48);   // = api/tg-bot.js secret()
  const r = await tg('setWebhook', { url: want, secret_token: secret, allowed_updates: UPD, drop_pending_updates: false });
  return r.ok ? 'set' : 'failed: ' + (r.description || '');
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!token() || !key()) { res.statusCode = 503; return res.end('not configured'); }
  // ?welcome=1 – the channel's first post (once only: yh_channel_meta 'welcome'); also tells whether the bot can post there
  if (/[?&]welcome=1\b/.test(req.url || '')) {
    try {
      const got = await rest('yh_channel_meta?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ key: 'welcome', value: CHANNEL }) });
      if (!got || !got.length) { res.setHeader('Content-Type', 'text/plain; charset=utf-8'); return res.end('Already posted – the welcome message is in the channel.'); }
      const text = ['👋 <b>Welcome to www.yourhome.asia – Cambodia!</b>', '',
        '🏠 Apartments, condos, houses, villas and rooms for rent and sale all over Cambodia – Phnom Penh, Siem Reap, Sihanoukville, Battambang and more.', '',
        '🆕 Every new listing on www.yourhome.asia appears here automatically – with photos, price and a direct link to the owner or agent.', '',
        '➕ Owners and agents: post your property for free.', '', '#Cambodia #PhnomPenh #ForRent #ForSale'].join('\n');
      const reply_markup = { inline_keyboard: [[{ text: '🔎 Browse listings', url: S.ORIGIN + '/?utm_source=telegram&utm_medium=channel' }], [{ text: '➕ Post your listing – free', url: S.ORIGIN + '/post?utm_source=telegram&utm_medium=channel' }]] };
      const r = await tg('sendMessage', { chat_id: CHANNEL, text, parse_mode: 'HTML', reply_markup, link_preview_options: { is_disabled: true } });
      if (!r.ok) { await rest('yh_channel_meta?key=eq.welcome', { method: 'DELETE' }); res.statusCode = 502; res.setHeader('Content-Type', 'text/plain; charset=utf-8'); return res.end('Telegram said: ' + (r.description || 'error') + '\n' + (r.error_code === 404 || r.error_code === 401 ? 'The bot token is wrong or was revoked: copy the CURRENT token from @BotFather → /mybots → @yourhomeasiabot → API Token into Vercel TELEGRAM_BOT_TOKEN, then Redeploy.' : '(Is @yourhomeasiabot an admin of ' + CHANNEL + ' with "Post messages"?)')); }
      const pin = await tg('pinChatMessage', { chat_id: CHANNEL, message_id: r.result.message_id, disable_notification: true });
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('✅ Posted to ' + CHANNEL + (pin.ok ? ' and pinned.' : ' (not pinned – the bot has no "Pin messages" right, that is fine).'));
    } catch (e) { res.statusCode = 500; return res.end(String(e.message || e)); }
  }
  const out = [];
  try {
    const since = new Date(Date.now() - 2 * 864e5).toISOString();
    const cols = 'id,city,district,deal_type,property_type,title,price,price_period,period_note,bedrooms,bathrooms,area_m2,photos,posted_by,created_at';
    const list = await rest(`yh_listings?select=${cols}&status=eq.active&is_demo=eq.false&created_at=gte.${since}&order=created_at.asc&limit=40`);
    const done = new Set((await rest(`yh_channel_posts?select=listing_id&chat=eq.${encodeURIComponent(CHANNEL)}&posted_at=gte.${new Date(Date.now() - 4 * 864e5).toISOString()}`)).map(r => r.listing_id));
    for (const l of (list || []).filter(x => !done.has(x.id)).slice(0, MAX_PER_RUN)) {
      // claim first – a second run at the same time gets nothing back and skips it
      const claimed = await rest('yh_channel_posts?on_conflict=listing_id,chat', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ listing_id: l.id, chat: CHANNEL }) });
      if (!claimed || !claimed.length) continue;
      const { text, url } = caption(l);
      const reply_markup = { inline_keyboard: [[{ text: '👀 View listing', url }], [{ text: '➕ Post your listing – free', url: S.ORIGIN + '/post?utm_source=telegram&utm_medium=channel' }]] };
      const photo = (l.photos || []).find(p => /^https:\/\//.test(p));
      let r = photo ? await tg('sendPhoto', { chat_id: CHANNEL, photo: S.img(photo, 1200), caption: text, parse_mode: 'HTML', reply_markup }) : null;
      if (!r || !r.ok) r = await tg('sendMessage', { chat_id: CHANNEL, text, parse_mode: 'HTML', reply_markup, link_preview_options: { url, prefer_large_media: true } });
      await rest(`yh_channel_posts?listing_id=eq.${l.id}&chat=eq.${encodeURIComponent(CHANNEL)}`, { method: 'PATCH', body: JSON.stringify(r.ok ? { message_id: r.result.message_id, error: null } : { error: String(r.description || 'failed').slice(0, 300) }) });
      out.push({ id: l.id, ok: !!r.ok, err: r.ok ? undefined : r.description });
    }
    // personal alerts (owner, 2026-11-25 "élesítsd"): new matching listings + new messages to advertisers, then the bot webhook
    const alerts = await sendAlerts().catch(e => ({ error: String(e.message || e).slice(0, 200) }));
    const hook = await ensureWebhook(req).catch(e => String(e.message || e).slice(0, 120));
    // channel clean-up, admin alerts, agents' channels, "still available?", price drops, daily digest (api/_tgx.js)
    const extra = await require('./_tgx').runAll().catch(e => ({ error: String(e.message || e).slice(0, 200) }));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ channel: CHANNEL, posted: out, alerts, webhook: hook, extra }));
  } catch (e) {
    res.statusCode = 500; res.end(JSON.stringify({ error: String(e.message || e).slice(0, 300), posted: out }));
  }
};
module.exports.matches = matches;
module.exports.chatFor = chatFor;
