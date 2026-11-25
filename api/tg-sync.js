// TELEGRAM CHANNEL AUTO-POST (owner, 2026-11-25: "élesítsd a channelt" – central channel where every listing also appears):
// Vercel cron (vercel.json "crons", every 10 min) calls this. It takes live, non-demo listings of the last 2 days that the
// channel has not had yet (table yh_channel_posts – the row is claimed first, so nothing is posted twice) and posts each one
// with @yourhomeasiabot: photo + caption (name, place, price, beds/baths/m²) + buttons "View listing" / "Post your listing".
// Env (yourhome-asia, Production): TELEGRAM_BOT_TOKEN, SUPABASE_SERVICE_ROLE_KEY. Channel = CHANNEL below (= TG_CHANNEL in app.js).
const S = require('./_seo');

const CHANNEL = '@yourhomeasia';
const SB_URL = 'https://uuzevmbfcxtvjuguiygy.supabase.co';
const MAX_PER_RUN = 5;
const token = () => String(process.env.TELEGRAM_BOT_TOKEN || '').trim();
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

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!token() || !key()) { res.statusCode = 503; return res.end('not configured'); }
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
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ channel: CHANNEL, posted: out }));
  } catch (e) {
    res.statusCode = 500; res.end(JSON.stringify({ error: String(e.message || e).slice(0, 300), posted: out }));
  }
};
