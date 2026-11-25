// /auth/telegram/callback – Telegram sends the visitor back here (see api/_tg.js). On success the browser gets a one-time
// token in the URL fragment (never sent to a server, removed by app.js at once); on failure #tgerr=<reason>.
const T = require('./_tg');
module.exports = async (req, res) => {
  try {
    if (!T.configured()) return T.redirect(res, '/#tgerr=off');
    const u = new URL(req.url, T.ORIGIN);
    if (u.searchParams.get('error')) return T.redirect(res, '/#tgerr=cancel');
    const p = T.takePending(req, res, u.searchParams.get('state'));
    if (!p) return T.redirect(res, '/#tgerr=expired');
    const who = await T.identity(u.searchParams.get('code'), p);
    if (!who) return T.redirect(res, '/#tgerr=verify');
    const tok = await T.sessionToken(who);
    if (!tok) return T.redirect(res, '/#tgerr=account');
    T.redirect(res, '/#tgauth=' + encodeURIComponent(tok));
  } catch (e) {
    T.redirect(res, '/#tgerr=failed');
  }
};
