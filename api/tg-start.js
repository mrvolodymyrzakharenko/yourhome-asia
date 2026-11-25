// "Continue with Telegram" button → Telegram's sign-in page (see api/_tg.js).
const T = require('./_tg');
module.exports = (req, res) => {
  if (!T.configured()) return T.redirect(res, '/#tgerr=off');
  T.redirect(res, T.startUrl(res));
};
