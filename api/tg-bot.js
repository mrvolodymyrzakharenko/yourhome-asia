// TELEGRAM BOT WEBHOOK – @yourhomeasiabot (owner, 2026-11-25: "élesítsd" the Telegram alerts).
// Telegram can only message a person who pressed Start in the bot, and only by chat id – never by @username. So every
// /start (or any message) stores the chat id + Telegram username in yh_tg_chats; api/tg-sync.js then sends the alerts
// (yh_alerts) to the chat whose username matches the @handle the visitor typed on the site (or to the Telegram id of an
// account that signed in with Telegram). Blocking the bot sets blocked=true, Start again sets it back.
// The webhook is registered by api/tg-sync.js itself (setWebhook with a secret header) – nothing to do by hand.
// Env: TELEGRAM_BOT_TOKEN, SUPABASE_SERVICE_ROLE_KEY. Only the YourHome bot – never the Study and Work bot.
const crypto = require('crypto');

const SB_URL = 'https://uuzevmbfcxtvjuguiygy.supabase.co';
const ORIGIN = 'https://yourhome.asia';
const CHANNEL = '@yourhomeasia';
// the token is taken out of whatever was pasted ("bot123:ABC…", quotes, "TELEGRAM_BOT_TOKEN=…", spaces) – Telegram answers
// "Not Found" to anything that is not exactly <digits>:<secret>
const token = () => { const v = String(process.env.TELEGRAM_BOT_TOKEN || ''); const m = v.match(/\d{6,12}:[A-Za-z0-9_-]{30,}/); return m ? m[0] : v.trim(); };
const key = () => String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const secret = () => crypto.createHash('sha256').update('yh-webhook:' + token()).digest('hex').slice(0, 48);

async function tg(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) });
  return r.json().catch(() => ({ ok: false }));
}
async function saveChat(row) {
  await fetch(SB_URL + '/rest/v1/yh_tg_chats?on_conflict=chat_id', {
    method: 'POST', signal: AbortSignal.timeout(8000),
    headers: { apikey: key(), Authorization: 'Bearer ' + key(), 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }),
  });
}
function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise(ok => { let d = ''; req.on('data', c => { d += c; if (d.length > 1e5) req.destroy(); }); req.on('end', () => { try { ok(JSON.parse(d || '{}')); } catch { ok({}); } }); req.on('error', () => ok({})); });
}

const WELCOME = [
  '👋 <b>Welcome to www.yourhome.asia – Cambodia!</b>', '',
  '✅ Your Telegram is now connected. You will get here:',
  '🔔 new listings that match the alerts you saved on the site', '📩 messages from people interested in your listings', '',
  'Manage your alerts: yourhome.asia/account',
  'Every new listing also appears in our channel ' + CHANNEL + '.',
].join('\n');

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
    const m = u.message;
    if (m && m.chat && m.chat.type === 'private' && m.from && !m.from.is_bot) {
      await saveChat({ chat_id: m.chat.id, username: m.from.username || null, first_name: (m.from.first_name || '').slice(0, 80) || null, blocked: false });
      const text = String(m.text || '');
      const noUser = !m.from.username ? '\n\n⚠️ Your Telegram has no @username. Set one in Telegram → Settings, then type it in the alert form on yourhome.asia – or sign in on the site with Telegram.' : '';
      if (/^\/(start|help)\b/.test(text)) {
        await tg('sendMessage', { chat_id: m.chat.id, text: WELCOME + noUser, parse_mode: 'HTML', link_preview_options: { is_disabled: true },
          reply_markup: { inline_keyboard: [[{ text: '🔎 Browse listings', url: ORIGIN + '/?utm_source=telegram&utm_medium=bot' }], [{ text: '🔔 My alerts', url: ORIGIN + '/account' }, { text: '📢 Channel', url: 'https://t.me/' + CHANNEL.slice(1) }]] } });
      } else if (/^\/stop\b/.test(text)) {
        await saveChat({ chat_id: m.chat.id, username: m.from.username || null, blocked: true });
        await tg('sendMessage', { chat_id: m.chat.id, text: '🔕 Alerts stopped. Send /start to turn them on again.' });
      } else {
        await tg('sendMessage', { chat_id: m.chat.id, text: '✅ Connected. Alerts arrive here automatically.\nQuestions? Write to our team: https://t.me/+855963068590' + noUser, link_preview_options: { is_disabled: true } });
      }
    }
  } catch (e) { /* always answer 200 – otherwise Telegram keeps resending the same update */ }
  res.statusCode = 200; res.end('ok');
};
module.exports.secret = secret;
