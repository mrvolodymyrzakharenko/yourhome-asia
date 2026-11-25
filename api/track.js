// VISITOR STATISTICS (owner, 2026-11-25: admin dashboard "statisztika, visitors"): app.js sends one beacon per page shown
// (only after a real touch/scroll/key or 8 s visible, never from the admin's own browser – localStorage yh_noct).
// Here we add country/city from Vercel's headers and the browser/OS from the user agent, mark bots, and store ONE row in
// public.yh_pageviews with the publishable key (insert-only RLS). NO cookie, NO IP address is stored.
const SB_URL = 'https://uuzevmbfcxtvjuguiygy.supabase.co';
const SB_KEY = 'sb_publishable__Q20CYCQEZ3YzjiEeqpxkQ_W4dW-i34';
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|axios|node-fetch|go-http|facebookexternalhit|whatsapp|telegrambot|vercel/i;
const cut = (s, n) => (s == null ? null : String(s).slice(0, n) || null);

function browserOf(ua) {
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'Facebook app';
  if (/Instagram/i.test(ua)) return 'Instagram app';
  if (/Telegram/i.test(ua)) return 'Telegram app';
  if (/Line\//i.test(ua)) return 'LINE app';
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\/|Opera/i.test(ua)) return 'Opera';
  if (/SamsungBrowser/i.test(ua)) return 'Samsung';
  if (/UCBrowser/i.test(ua)) return 'UC Browser';
  if (/Firefox|FxiOS/i.test(ua)) return 'Firefox';
  if (/Chrome|CriOS/i.test(ua)) return 'Chrome';
  if (/Safari/i.test(ua)) return 'Safari';
  return 'Other';
}
function osOf(ua) {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other';
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  try {
    let b = req.body;
    if (!b || typeof b === 'string') { try { b = JSON.parse(b || '{}'); } catch { b = {}; } }
    if (!b.path && !req.body) {
      const chunks = []; for await (const c of req) chunks.push(c);
      try { b = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { b = {}; }
    }
    const ua = String(req.headers['user-agent'] || '');
    const h = k => { const v = req.headers[k]; try { return v ? decodeURIComponent(String(v)) : null; } catch { return String(v); } };
    const row = {
      path: cut(String(b.path || '/').split('#')[0], 300) || '/',
      visitor: cut(b.v, 64), ref: cut(b.ref, 120), utm: cut(b.utm, 120), lang: cut(b.lang, 8),
      device: cut(b.device, 16), browser: browserOf(ua), os: osOf(ua),
      country: cut(h('x-vercel-ip-country'), 4), city: cut(h('x-vercel-ip-city'), 60),
      is_bot: !ua || BOT.test(ua) || !!b.wd,
    };
    const r = await fetch(SB_URL + '/rest/v1/yh_pageviews', {
      method: 'POST', headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    });
    res.statusCode = r.ok ? 204 : 202; res.end();
  } catch (e) { res.statusCode = 202; res.end(); }
};
