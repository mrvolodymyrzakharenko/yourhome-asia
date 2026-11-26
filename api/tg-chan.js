// AGENT'S TELEGRAM CHANNEL – CONNECTION CHECK (owner, 2026-11-26: "Agent Telegram channel connect to website").
// GET /api/tg-chan?c=@name → { ok, code, title } – asks Telegram whether @yourhomeasiabot can post in that channel.
// code: ok · bad_name · not_found (no public channel with that @name) · not_channel (a group / person, not a channel) ·
//       not_admin (the bot is not an admin there yet) · no_post (admin, but without "Post messages") · error.
// Read-only: sends nothing to the channel. The agent's profile form (agents.js) calls it on "Check connection" and after saving.
// Env: TELEGRAM_BOT_TOKEN. Only @yourhomeasiabot.
const token = () => { const v = String(process.env.TELEGRAM_BOT_TOKEN || ''); const m = v.match(/\d{6,12}:[A-Za-z0-9_-]{30,}/); return m ? m[0] : v.trim(); };
async function tg(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}), signal: AbortSignal.timeout(8000) });
  return r.json().catch(() => ({ ok: false, description: 'bad answer' }));
}
let BOT_ID = null;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json');
  const send = (o, st) => { res.statusCode = st || 200; res.end(JSON.stringify(o)); };
  const q = new URL(req.url, 'https://yourhome.asia').searchParams;
  const name = String(q.get('c') || '').trim().replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, '').replace(/\/.*$/, '');
  if (!/^[A-Za-z0-9_]{5,32}$/.test(name)) return send({ ok: false, code: 'bad_name' });
  if (!token()) return send({ ok: false, code: 'error' }, 503);
  try {
    if (!BOT_ID) { const me = await tg('getMe'); if (!me.ok) return send({ ok: false, code: 'error' }, 502); BOT_ID = me.result.id; }
    const chat = await tg('getChat', { chat_id: '@' + name });
    if (!chat.ok) return send({ ok: false, code: 'not_found' });
    const title = String(chat.result.title || '').slice(0, 120);
    if (chat.result.type !== 'channel') return send({ ok: false, code: 'not_channel', title });
    const m = await tg('getChatMember', { chat_id: '@' + name, user_id: BOT_ID });
    const st = m.ok ? m.result.status : 'left';
    if (st !== 'administrator' && st !== 'creator') return send({ ok: false, code: 'not_admin', title });
    if (m.result.can_post_messages === false) return send({ ok: false, code: 'no_post', title });
    return send({ ok: true, code: 'ok', title, channel: '@' + chat.result.username });
  } catch (e) { return send({ ok: false, code: 'error' }, 500); }
};
