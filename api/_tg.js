// LOG IN WITH TELEGRAM (owner, 2026-11-25: "lépésről lépésre megoldjuk a telegramos bejelentkezés lehetőségét") – same
// method as the Study portal (lib/account/telegram.ts there): Telegram OpenID Connect, authorization code + PKCE.
//   /api/tg-start            → remembers state + PKCE verifier in a short HttpOnly cookie, sends the visitor to Telegram
//   /auth/telegram/callback  → (api/tg-callback.js) checks the state, swaps the code for Telegram's signed ID token,
//                              verifies it, finds or creates the Supabase account and hands the browser a one-time
//                              magic-link token (#tgauth=…) that app.js turns into a normal session (sb.auth.verifyOtp).
// Own YourHome bot (@BotFather → Bot Settings → Login Widget: Allowed URL https://yourhome.asia/auth/telegram/callback).
// Vercel env (project yourhome-asia, Production): TELEGRAM_CLIENT_ID, TELEGRAM_CLIENT_SECRET, SUPABASE_SERVICE_ROLE_KEY.
// Telegram accounts get the SAME internal, never-mailed address as on the Study portal (tg<id>@telegram.studyandworkabroad.net),
// so one Telegram person = one account across the Eleon portals – exactly like Google. It is never shown to anyone.
// signup_site 'yourhome' (new accounts only): the Study portal's "New account" Telegram alert skips them (owner, 2026-11-25:
// "a másik bot nem kellene működjön! csak a kambodzsai tg"; Supabase function alert_new_account).
const crypto = require('crypto');

const ISSUER = 'https://oauth.telegram.org';
const COOKIE = 'yh_tg_oauth';
const SB_URL = 'https://uuzevmbfcxtvjuguiygy.supabase.co';
const ORIGIN = 'https://yourhome.asia';
const REDIRECT = ORIGIN + '/auth/telegram/callback';
const EMAIL_DOMAIN = 'telegram.studyandworkabroad.net';

const clientId = () => String(process.env.TELEGRAM_CLIENT_ID || '').trim();
const clientSecret = () => String(process.env.TELEGRAM_CLIENT_SECRET || '').trim();
const serviceKey = () => String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const configured = () => /^\d{3,20}$/.test(clientId()) && clientSecret().length >= 8 && serviceKey().length > 20;
const b64url = b => Buffer.from(b).toString('base64url');

function readCookie(req, name) {
  const m = String(req.headers.cookie || '').split(/;\s*/).find(c => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}
const setCookie = (res, value, maxAge) => res.setHeader('Set-Cookie',
  `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`);
const redirect = (res, url) => { res.statusCode = 302; res.setHeader('Location', url); res.setHeader('Cache-Control', 'no-store'); res.end(); };

function startUrl(res) {
  const p = { s: b64url(crypto.randomBytes(24)), v: b64url(crypto.randomBytes(48)), n: b64url(crypto.randomBytes(24)), e: Date.now() + 600000 };
  setCookie(res, JSON.stringify(p), 600);
  const q = new URLSearchParams({
    client_id: clientId(), redirect_uri: REDIRECT, response_type: 'code',
    scope: 'openid profile telegram:bot_access',   // bot_access: our bot may later send this user their alerts / messages
    state: p.s, nonce: p.n, code_challenge: b64url(crypto.createHash('sha256').update(p.v).digest()), code_challenge_method: 'S256',
  });
  return ISSUER + '/auth?' + q.toString();
}

function takePending(req, res, state) {
  const raw = readCookie(req, COOKIE); setCookie(res, '', 0);
  try {
    const p = JSON.parse(raw || 'null');
    if (!p || !state || typeof p.s !== 'string' || Date.now() > p.e) return null;
    const a = Buffer.from(p.s), b = Buffer.from(String(state));
    return a.length === b.length && crypto.timingSafeEqual(a, b) ? p : null;
  } catch { return null; }
}

async function verifyIdToken(token, nonce) {
  const parts = String(token).split('.'); if (parts.length !== 3 || token.length > 8000) return null;
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  if (header.alg !== 'RS256' && header.alg !== 'ES256') return null;
  const r = await fetch(ISSUER + '/.well-known/jwks.json', { signal: AbortSignal.timeout(5000) });
  if (!r.ok) return null;
  const { keys } = await r.json();
  const jwk = (Array.isArray(keys) ? keys : []).find(k => !header.kid || k.kid === header.kid);
  if (!jwk) return null;
  const key = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const ok = crypto.verify('sha256', Buffer.from(parts[0] + '.' + parts[1]), header.alg === 'ES256' ? { key, dsaEncoding: 'ieee-p1363' } : key, Buffer.from(parts[2], 'base64url'));
  if (!ok) return null;
  const c = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  const aud = (Array.isArray(c.aud) ? c.aud : [c.aud]).map(String);
  if (c.iss !== ISSUER || !aud.includes(clientId()) || typeof c.exp !== 'number' || c.exp * 1000 < Date.now() - 30000) return null;
  if (c.nonce !== undefined && c.nonce !== nonce) return null;
  return c;
}

async function identity(code, p) {
  if (!/^[\w.~-]{4,512}$/.test(String(code || ''))) return null;
  const r = await fetch(ISSUER + '/token', {
    method: 'POST', signal: AbortSignal.timeout(8000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Basic ' + Buffer.from(clientId() + ':' + clientSecret()).toString('base64') },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT, client_id: clientId(), code_verifier: p.v }),
  });
  if (!r.ok) return null;
  const { id_token } = await r.json();
  const c = typeof id_token === 'string' ? await verifyIdToken(id_token, p.n) : null;
  if (!c) return null;
  const tid = /^\d{1,20}$/.test(String(c.id ?? '')) ? String(c.id) : c.sub ? 'u' + crypto.createHash('sha256').update(String(c.sub)).digest('hex').slice(0, 24) : '';
  if (!tid) return null;
  const name = (c.name || [c.given_name, c.family_name].filter(Boolean).join(' ') || c.preferred_username || 'Telegram user').trim().slice(0, 100);
  return { id: tid, name, username: String(c.preferred_username || '').slice(0, 64), picture: /^https:\/\//.test(c.picture || '') ? String(c.picture).slice(0, 500) : '' };
}

// Find or create the Supabase account, then a one-time magic-link token the browser exchanges for a session.
async function sessionToken(who) {
  const H = { apikey: serviceKey(), Authorization: 'Bearer ' + serviceKey(), 'Content-Type': 'application/json' };
  const email = 'tg' + who.id + '@' + EMAIL_DOMAIN;
  const meta = { signup_site: 'yourhome', full_name: who.name, telegram_id: who.id, telegram_username: who.username, telegram_photo: who.picture };
  const cr = await fetch(SB_URL + '/auth/v1/admin/users', { method: 'POST', headers: H, signal: AbortSignal.timeout(8000), body: JSON.stringify({ email, email_confirm: true, user_metadata: meta }) });
  if (!cr.ok) { const t = await cr.text(); if (!/already|exists|registered/i.test(t)) return null; }
  const gl = await fetch(SB_URL + '/auth/v1/admin/generate_link', { method: 'POST', headers: H, signal: AbortSignal.timeout(8000), body: JSON.stringify({ type: 'magiclink', email }) });
  if (!gl.ok) return null;
  const d = await gl.json();
  return d.hashed_token || (d.properties && d.properties.hashed_token) || null;
}

module.exports = { configured, startUrl, takePending, identity, sessionToken, redirect, ORIGIN };
