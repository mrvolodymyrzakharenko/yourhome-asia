// YOURHOME BOT – EXTRA JOBS (owner, 2026-11-25: "csináld meg mind sorrendben"). Called by api/tg-sync.js on every run
// (Vercel cron every 10 min + an instant ping from the database when something new happens – yh_tg_ping triggers):
//   0 channelCleanup  – a listing hidden / rented / sold / deleted → its channel posts are deleted (or marked "no longer available")
//   1 adminFeed       – everything new (listing, account, message, verification, partner, project question) → the owner's Telegram
//   2 agentChannels   – a listing with an agent profile that has tg_channel → posted to the agent's own channel too
//   3 reminders       – 30 days after the advertiser last confirmed → "Still available?" with Yes / Rented buttons (api/tg-bot.js)
//   6 priceDrops      – a live listing got cheaper → sent to alert subscribers whose search it matches
//   8 digest          – once a day (from 19:00 Cambodia time) "Today's new listings" in the channel, if there are 3 or more
// Bot texts in 5 languages: T / tr(). Only @yourhomeasiabot – never the Study and Work bot.
const crypto = require('crypto');
const S = require('./_seo');

const SB_URL = 'https://uuzevmbfcxtvjuguiygy.supabase.co';
const CHANNEL = '@yourhomeasia';
const token = () => { const v = String(process.env.TELEGRAM_BOT_TOKEN || ''); const m = v.match(/\d{6,12}:[A-Za-z0-9_-]{30,}/); return m ? m[0] : v.trim(); };
const key = () => String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const H = () => ({ apikey: key(), Authorization: 'Bearer ' + key(), 'Content-Type': 'application/json' });
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const iso = ms => new Date(ms).toISOString();

async function rest(path, opts = {}) {
  const r = await fetch(SB_URL + '/rest/v1/' + path, { ...opts, headers: { ...H(), ...(opts.headers || {}) }, signal: AbortSignal.timeout(8000) });
  const t = await r.text();
  if (!r.ok) throw new Error(path.split('?')[0] + ' ' + r.status + ' ' + t.slice(0, 200));
  return t ? JSON.parse(t) : null;
}
const rpc = (fn, args) => rest('rpc/' + fn, { method: 'POST', body: JSON.stringify(args || {}) });
async function tg(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
  return r.json().catch(() => ({ ok: false, description: 'bad answer' }));
}
// claim a one-off key (yh_channel_meta) – true only for the first caller
async function claimKey(k, v) {
  const got = await rest('yh_channel_meta?on_conflict=key', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ key: k, value: v || '' }) });
  return !!(got && got.length);
}
const uuidFrom = s => { const h = crypto.createHash('sha256').update(s).digest('hex'); return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`; };
const firstPhoto = l => (l.photos || []).find(p => /^https:\/\//.test(p));

// ---------- texts (bot + messages to advertisers) ----------
const T = {
  en: {
    welcome: '👋 <b>Welcome to www.yourhome.asia – Cambodia!</b>\n\nApartments, condos, houses and rooms for rent and sale all over Cambodia.\n\n🔎 Search here: just write what you need, e.g. <i>2 bedroom BKK1 600</i>, or tap a button.\n➕ Post your property for free – send me the photos and a description.\n🔔 Alerts you saved on the site arrive here.',
    rent: '🏠 Rent', daily: '📅 Daily', buy: '💰 Buy', rooms: '🛏 Rooms', post: '➕ Post a listing', alerts: '🔔 My alerts', channel: '📢 Channel', site: '🌐 Website',
    found: 'Found {n} – the newest:', none: 'Nothing found yet. Try fewer words, e.g. <i>rent BKK1</i> – or save an alert on the site and we tell you when one comes.',
    seeAll: '🔎 See all on the website', view: '👀 View listing',
    stop: '🔕 Alerts stopped. Send /start to turn them on again.',
    noUser: '⚠️ Your Telegram has no @username. Set one in Telegram → Settings, or sign in on yourhome.asia with Telegram, so your alerts can reach you.',
    postIntro: '➕ <b>Post your property – free</b>\n\n1️⃣ Send the photos (up to 15).\n2️⃣ Then send the description in one message: type, rent or sale, price, bedrooms, district and city.\n\nExample: <i>2 bedroom condo for rent in BKK1, Phnom Penh, $650/month, pool and gym</i>\n\nSend /cancel to stop.',
    gotPhotos: '📷 {n} photo(s) received. Send more, or now the description.',
    summary: '📝 <b>Your listing</b>\n\n{s}\n\nPublish it now? You can edit everything later on the website.',
    publish: '✅ Publish', edit: '✏️ Edit on the website', cancel: '✖ Cancel', cancelled: 'Cancelled – nothing was posted.',
    published: '🎉 <b>Your listing is live!</b>\nIt also appears in our channel ' + CHANNEL + ' within a few minutes.',
    needPrice: 'I could not find the price. Please send the description again with the price, e.g. <i>$500/month</i>.',
    still: '🏠 <b>Is your listing still available?</b>\n\n{s}\n\nPlease confirm so it stays at the top of the search.',
    yes: '✅ Yes, still available', gone: '🔴 Rented / sold', thanksYes: '✅ Thank you – your listing stays live for another 30 days.', thanksGone: '🔴 Done – the listing is hidden. Congratulations!',
    drop: '📉 <b>Price drop</b> on a listing that matches your alert: <s>{old}</s> → <b>{new}</b>',
  },
  km: {
    welcome: '👋 <b>សូមស្វាគមន៍មកកាន់ www.yourhome.asia – កម្ពុជា!</b>\n\nអាផាតមិន ខុនដូ ផ្ទះ និងបន្ទប់ សម្រាប់ជួល និងលក់ ទូទាំងប្រទេសកម្ពុជា។\n\n🔎 ស្វែងរកនៅទីនេះ៖ សរសេរអ្វីដែលអ្នកត្រូវការ ឧ. <i>2 bedroom BKK1 600</i> ឬចុចប៊ូតុង។\n➕ ប្រកាសអចលនទ្រព្យរបស់អ្នកដោយឥតគិតថ្លៃ – ផ្ញើរូបថត និងការពិពណ៌នាមកខ្ញុំ។\n🔔 ការជូនដំណឹងដែលអ្នករក្សាទុកនៅលើគេហទំព័រ នឹងមកដល់ទីនេះ។',
    rent: '🏠 ជួល', daily: '📅 ប្រចាំថ្ងៃ', buy: '💰 ទិញ', rooms: '🛏 បន្ទប់', post: '➕ ប្រកាស', alerts: '🔔 ការជូនដំណឹង', channel: '📢 ឆានែល', site: '🌐 គេហទំព័រ',
    found: 'រកឃើញ {n} – ថ្មីបំផុត៖', none: 'មិនទាន់រកឃើញទេ។ សាកល្បងពាក្យតិចជាងនេះ ឧ. <i>rent BKK1</i>។',
    seeAll: '🔎 មើលទាំងអស់នៅលើគេហទំព័រ', view: '👀 មើលការប្រកាស',
    stop: '🔕 បានបញ្ឈប់ការជូនដំណឹង។ ផ្ញើ /start ដើម្បីបើកវិញ។',
    noUser: '⚠️ Telegram របស់អ្នកមិនមាន @username ទេ។ កំណត់វានៅក្នុង Telegram → Settings ឬចូលគេហទំព័រដោយ Telegram។',
    postIntro: '➕ <b>ប្រកាសអចលនទ្រព្យ – ឥតគិតថ្លៃ</b>\n\n1️⃣ ផ្ញើរូបថត (រហូតដល់ 15)។\n2️⃣ បន្ទាប់មកផ្ញើការពិពណ៌នាក្នុងសារតែមួយ៖ ប្រភេទ ជួល ឬលក់ តម្លៃ បន្ទប់គេង ខណ្ឌ និងទីក្រុង។\n\nផ្ញើ /cancel ដើម្បីឈប់។',
    gotPhotos: '📷 បានទទួលរូបថត {n}។ ផ្ញើបន្ថែម ឬផ្ញើការពិពណ៌នាឥឡូវនេះ។',
    summary: '📝 <b>ការប្រកាសរបស់អ្នក</b>\n\n{s}\n\nបោះពុម្ពឥឡូវនេះ? អ្នកអាចកែប្រែនៅលើគេហទំព័រពេលក្រោយ។',
    publish: '✅ បោះពុម្ព', edit: '✏️ កែនៅលើគេហទំព័រ', cancel: '✖ បោះបង់', cancelled: 'បានបោះបង់ – គ្មានអ្វីត្រូវបានប្រកាសទេ។',
    published: '🎉 <b>ការប្រកាសរបស់អ្នកដំណើរការហើយ!</b>\nវានឹងបង្ហាញនៅក្នុងឆានែល ' + CHANNEL + ' ក្នុងរយៈពេលប៉ុន្មាននាទី។',
    needPrice: 'ខ្ញុំរកមិនឃើញតម្លៃទេ។ សូមផ្ញើការពិពណ៌នាម្តងទៀតជាមួយតម្លៃ ឧ. <i>$500/month</i>។',
    still: '🏠 <b>តើការប្រកាសរបស់អ្នកនៅទំនេរទេ?</b>\n\n{s}', yes: '✅ បាទ/ចាស នៅទំនេរ', gone: '🔴 បានជួល / លក់ហើយ',
    thanksYes: '✅ សូមអរគុណ – ការប្រកាសនៅតែបង្ហាញ 30 ថ្ងៃទៀត។', thanksGone: '🔴 រួចរាល់ – ការប្រកាសត្រូវបានលាក់។',
    drop: '📉 <b>តម្លៃធ្លាក់ចុះ</b>៖ <s>{old}</s> → <b>{new}</b>',
  },
  zh: {
    welcome: '👋 <b>欢迎来到 www.yourhome.asia – 柬埔寨！</b>\n\n柬埔寨各地的公寓、共管公寓、住宅和房间出租与出售。\n\n🔎 直接在这里搜索：输入您的需求，例如 <i>2 bedroom BKK1 600</i>，或点击按钮。\n➕ 免费发布房源——把照片和描述发给我。\n🔔 您在网站上保存的提醒会发送到这里。',
    rent: '🏠 租房', daily: '📅 日租', buy: '💰 买房', rooms: '🛏 房间', post: '➕ 发布房源', alerts: '🔔 我的提醒', channel: '📢 频道', site: '🌐 网站',
    found: '找到 {n} 条 – 最新：', none: '暂未找到。请尝试更少的关键词，例如 <i>rent BKK1</i>。',
    seeAll: '🔎 在网站上查看全部', view: '👀 查看房源',
    stop: '🔕 提醒已停止。发送 /start 重新开启。',
    noUser: '⚠️ 您的 Telegram 没有 @用户名。请在 Telegram → 设置 中设置，或在网站上用 Telegram 登录。',
    postIntro: '➕ <b>免费发布房源</b>\n\n1️⃣ 发送照片（最多 15 张）。\n2️⃣ 然后用一条消息发送描述：类型、出租或出售、价格、卧室、区域和城市。\n\n发送 /cancel 取消。',
    gotPhotos: '📷 已收到 {n} 张照片。继续发送，或现在发送描述。',
    summary: '📝 <b>您的房源</b>\n\n{s}\n\n现在发布吗？之后可以在网站上修改。',
    publish: '✅ 发布', edit: '✏️ 在网站上编辑', cancel: '✖ 取消', cancelled: '已取消——未发布任何内容。',
    published: '🎉 <b>您的房源已上线！</b>\n几分钟内也会出现在我们的频道 ' + CHANNEL + '。',
    needPrice: '没有找到价格。请重新发送带价格的描述，例如 <i>$500/month</i>。',
    still: '🏠 <b>您的房源还可用吗？</b>\n\n{s}', yes: '✅ 是的，仍可用', gone: '🔴 已出租 / 已售出',
    thanksYes: '✅ 谢谢——您的房源将继续展示 30 天。', thanksGone: '🔴 完成——房源已隐藏。恭喜！',
    drop: '📉 <b>降价</b>：<s>{old}</s> → <b>{new}</b>',
  },
  fr: {
    welcome: '👋 <b>Bienvenue sur www.yourhome.asia – Cambodge !</b>\n\nAppartements, condos, maisons et chambres à louer et à vendre partout au Cambodge.\n\n🔎 Cherchez ici : écrivez ce qu’il vous faut, ex. <i>2 bedroom BKK1 600</i>, ou touchez un bouton.\n➕ Publiez votre bien gratuitement – envoyez-moi les photos et une description.\n🔔 Les alertes enregistrées sur le site arrivent ici.',
    rent: '🏠 Louer', daily: '📅 À la journée', buy: '💰 Acheter', rooms: '🛏 Chambres', post: '➕ Publier', alerts: '🔔 Mes alertes', channel: '📢 Chaîne', site: '🌐 Site',
    found: '{n} trouvé(s) – les plus récents :', none: 'Rien trouvé pour l’instant. Essayez moins de mots, ex. <i>rent BKK1</i>.',
    seeAll: '🔎 Tout voir sur le site', view: '👀 Voir l’annonce',
    stop: '🔕 Alertes arrêtées. Envoyez /start pour les réactiver.',
    noUser: '⚠️ Votre Telegram n’a pas de @nom d’utilisateur. Définissez-en un dans Telegram → Paramètres, ou connectez-vous au site avec Telegram.',
    postIntro: '➕ <b>Publiez votre bien – gratuit</b>\n\n1️⃣ Envoyez les photos (jusqu’à 15).\n2️⃣ Puis la description en un seul message : type, location ou vente, prix, chambres, quartier et ville.\n\nEnvoyez /cancel pour arrêter.',
    gotPhotos: '📷 {n} photo(s) reçue(s). Envoyez-en d’autres, ou la description.',
    summary: '📝 <b>Votre annonce</b>\n\n{s}\n\nLa publier maintenant ? Vous pourrez tout modifier sur le site.',
    publish: '✅ Publier', edit: '✏️ Modifier sur le site', cancel: '✖ Annuler', cancelled: 'Annulé – rien n’a été publié.',
    published: '🎉 <b>Votre annonce est en ligne !</b>\nElle apparaît aussi dans notre chaîne ' + CHANNEL + ' d’ici quelques minutes.',
    needPrice: 'Je n’ai pas trouvé le prix. Renvoyez la description avec le prix, ex. <i>$500/month</i>.',
    still: '🏠 <b>Votre annonce est-elle toujours disponible ?</b>\n\n{s}', yes: '✅ Oui, toujours disponible', gone: '🔴 Louée / vendue',
    thanksYes: '✅ Merci – votre annonce reste en ligne 30 jours de plus.', thanksGone: '🔴 C’est fait – l’annonce est masquée. Félicitations !',
    drop: '📉 <b>Baisse de prix</b> : <s>{old}</s> → <b>{new}</b>',
  },
  th: {
    welcome: '👋 <b>ยินดีต้อนรับสู่ www.yourhome.asia – กัมพูชา!</b>\n\nอพาร์ตเมนต์ คอนโด บ้าน และห้อง ให้เช่าและขายทั่วกัมพูชา\n\n🔎 ค้นหาที่นี่: พิมพ์สิ่งที่ต้องการ เช่น <i>2 bedroom BKK1 600</i> หรือกดปุ่ม\n➕ ลงประกาศฟรี – ส่งรูปและคำอธิบายมาให้ฉัน\n🔔 การแจ้งเตือนที่คุณบันทึกบนเว็บไซต์จะมาที่นี่',
    rent: '🏠 เช่า', daily: '📅 รายวัน', buy: '💰 ซื้อ', rooms: '🛏 ห้อง', post: '➕ ลงประกาศ', alerts: '🔔 การแจ้งเตือน', channel: '📢 ช่อง', site: '🌐 เว็บไซต์',
    found: 'พบ {n} รายการ – ล่าสุด:', none: 'ยังไม่พบ ลองใช้คำน้อยลง เช่น <i>rent BKK1</i>',
    seeAll: '🔎 ดูทั้งหมดบนเว็บไซต์', view: '👀 ดูประกาศ',
    stop: '🔕 หยุดการแจ้งเตือนแล้ว ส่ง /start เพื่อเปิดอีกครั้ง',
    noUser: '⚠️ Telegram ของคุณไม่มี @username ตั้งค่าได้ที่ Telegram → Settings หรือเข้าสู่ระบบเว็บไซต์ด้วย Telegram',
    postIntro: '➕ <b>ลงประกาศฟรี</b>\n\n1️⃣ ส่งรูป (สูงสุด 15 รูป)\n2️⃣ แล้วส่งคำอธิบายในข้อความเดียว: ประเภท เช่าหรือขาย ราคา ห้องนอน เขต และเมือง\n\nส่ง /cancel เพื่อยกเลิก',
    gotPhotos: '📷 ได้รับ {n} รูปแล้ว ส่งเพิ่มหรือส่งคำอธิบายได้เลย',
    summary: '📝 <b>ประกาศของคุณ</b>\n\n{s}\n\nเผยแพร่ตอนนี้ไหม? แก้ไขได้ภายหลังบนเว็บไซต์',
    publish: '✅ เผยแพร่', edit: '✏️ แก้ไขบนเว็บไซต์', cancel: '✖ ยกเลิก', cancelled: 'ยกเลิกแล้ว – ไม่มีการลงประกาศ',
    published: '🎉 <b>ประกาศของคุณออนไลน์แล้ว!</b>\nจะปรากฏในช่อง ' + CHANNEL + ' ภายในไม่กี่นาที',
    needPrice: 'ไม่พบราคา กรุณาส่งคำอธิบายพร้อมราคาอีกครั้ง เช่น <i>$500/month</i>',
    still: '🏠 <b>ประกาศของคุณยังว่างอยู่ไหม?</b>\n\n{s}', yes: '✅ ยังว่าง', gone: '🔴 เช่า / ขายแล้ว',
    thanksYes: '✅ ขอบคุณ – ประกาศจะแสดงต่ออีก 30 วัน', thanksGone: '🔴 เรียบร้อย – ซ่อนประกาศแล้ว ยินดีด้วย!',
    drop: '📉 <b>ลดราคา</b>: <s>{old}</s> → <b>{new}</b>',
  },
};
const langOf = code => { const c = String(code || '').slice(0, 2).toLowerCase(); return T[c] ? c : 'en'; };
const tr = (lang, k, v) => String((T[lang] || T.en)[k] ?? T.en[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v && v[x] != null ? v[x] : '');

// ---------- shared listing caption ----------
function priceText(l) { return l.price > 0 ? (l.price_period === 'other' && l.period_note ? `${S.money(l.price)} ${l.period_note}` : S.money(l.price) + S.per(l)) : 'Price on request'; }
function caption(l, medium) {
  const url = S.ORIGIN + S.listingPath(l) + '?utm_source=telegram&utm_medium=' + (medium || 'channel');
  const facts = [l.bedrooms === 0 ? 'Studio' : l.bedrooms > 0 ? `🛏 ${l.bedrooms} bed` : '', l.bathrooms > 0 ? `🛁 ${l.bathrooms} bath` : '', l.area_m2 > 0 ? `📐 ${l.area_m2} m²` : ''].filter(Boolean).join(' · ');
  const lines = [`🏠 <b>${esc(S.listingName(l))}</b>`, `📍 ${esc(S.place(l))}`, `💰 <b>${esc(priceText(l))}</b>`, facts && esc(facts),
    l.title ? `\n${esc(String(l.title).slice(0, 140))}` : '',
    `\n👉 <a href="${esc(url)}">See photos &amp; contact the ${l.posted_by === 'agent' ? 'agent' : 'owner'}</a>`,
    `\n#${l.deal_type === 'sale' ? 'ForSale' : l.price_period === 'day' ? 'DailyRent' : 'ForRent'} #${String(l.city || 'Phnom Penh').replace(/[^A-Za-z]/g, '')} #Cambodia`].filter(Boolean);
  return { text: lines.join('\n').slice(0, 1000), url };
}
async function sendListing(chat, l, extraKb, medium, head) {
  const { text, url } = caption(l, medium);
  const body = (head ? head + '\n\n' : '') + text;
  const reply_markup = { inline_keyboard: [[{ text: '👀 View listing', url }], ...(extraKb || [])] };
  const photo = firstPhoto(l);
  let r = photo ? await tg('sendPhoto', { chat_id: chat, photo: S.img(photo, 1200), caption: body.slice(0, 1024), parse_mode: 'HTML', reply_markup }) : null;
  if (!r || !r.ok) r = await tg('sendMessage', { chat_id: chat, text: body, parse_mode: 'HTML', reply_markup, link_preview_options: { url, prefer_large_media: true } });
  return r;
}
const LCOLS = 'id,owner_id,agent_id,city,district,deal_type,property_type,title,price,price_period,period_note,bedrooms,bathrooms,area_m2,photos,posted_by,created_at,status,is_demo,confirmed_at,contact_telegram';

// ---------- 0) channel clean-up ----------
async function channelCleanup() {
  const rows = await rest('yh_channel_posts?select=listing_id,chat,message_id&deleted_at=is.null&message_id=not.is.null&order=posted_at.desc&limit=400') || [];
  if (!rows.length) return { checked: 0 };
  const ids = [...new Set(rows.map(r => r.listing_id))];
  const live = new Set();
  for (let i = 0; i < ids.length; i += 100) (await rest(`yh_listings?select=id&status=eq.active&id=in.(${ids.slice(i, i + 100).join(',')})`) || []).forEach(x => live.add(x.id));
  let removed = 0;
  for (const r of rows.filter(r => !live.has(r.listing_id)).slice(0, 30)) {
    let d = await tg('deleteMessage', { chat_id: r.chat, message_id: r.message_id });
    if (!d.ok) {   // older than 48 h or no delete right → turn it into a short "no longer available" note
      d = await tg('editMessageCaption', { chat_id: r.chat, message_id: r.message_id, caption: '🔴 No longer available – rented, sold or removed.\n\nMore homes: www.yourhome.asia' });
      if (!d.ok) d = await tg('editMessageText', { chat_id: r.chat, message_id: r.message_id, text: '🔴 No longer available – rented, sold or removed.\n\nMore homes: www.yourhome.asia' });
    }
    await rest(`yh_channel_posts?listing_id=eq.${r.listing_id}&chat=eq.${encodeURIComponent(r.chat)}`, { method: 'PATCH', body: JSON.stringify({ deleted_at: new Date().toISOString(), error: d.ok ? null : 'cleanup: ' + String(d.description || '').slice(0, 200) }) });
    removed++;
  }
  return { checked: rows.length, removed };
}

// ---------- 1) admin feed → owner's Telegram ----------
async function adminFeed() {
  const chats = (await rest('yh_tg_admin_chats?select=chat_id') || []).map(r => r.chat_id);
  if (!chats.length) return { chats: 0 };
  const cur = await rest('yh_channel_meta?select=value&key=eq.admin_cursor');
  if (!cur || !cur.length) { await claimKey('admin_cursor', new Date().toISOString()); return { started: true }; }
  const since = cur[0].value;
  const rows = await rpc('yh_admin_feed', { p_since: since }) || [];
  if (!rows.length) return { sent: 0 };
  const next = rows[rows.length - 1].at;
  // move the cursor first (only if nobody else did) – a second run at the same moment sends nothing twice
  const moved = await rest(`yh_channel_meta?key=eq.admin_cursor&value=eq.${encodeURIComponent(since)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ value: next, at: new Date().toISOString() }) });
  if (!moved || !moved.length) return { sent: 0, raced: true };
  let n = 0;
  for (const e of rows) for (const c of chats) {
    const r = await tg('sendMessage', { chat_id: c, text: `<b>${esc(e.title)}</b>\n${esc(e.body || '')}`.slice(0, 3800), parse_mode: 'HTML', link_preview_options: { is_disabled: true },
      reply_markup: { inline_keyboard: [[{ text: e.kind === 'listing' ? '👀 Open listing' : '🛡 Open admin', url: S.ORIGIN + (e.open || '/admin') }]] } });
    if (r.ok) n++;
  }
  return { sent: n };
}

// ---------- 2) agents' own channels ----------
async function agentChannels() {
  const list = await rest(`yh_listings?select=${LCOLS}&status=eq.active&is_demo=eq.false&agent_id=not.is.null&created_at=gte.${iso(Date.now() - 2 * 864e5)}&order=created_at.asc&limit=60`) || [];
  if (!list.length) return { posted: 0 };
  const aids = [...new Set(list.map(l => l.agent_id))];
  const agents = await rest(`yh_agents?select=id,tg_channel&tg_channel=not.is.null&id=in.(${aids.join(',')})`) || [];
  const chan = new Map(agents.map(a => [a.id, a.tg_channel]));
  let n = 0; const errs = [];
  for (const l of list) {
    const chat = chan.get(l.agent_id); if (!chat || n >= 10) continue;
    const claimed = await rest('yh_channel_posts?on_conflict=listing_id,chat', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ listing_id: l.id, chat }) });
    if (!claimed || !claimed.length) continue;
    const r = await sendListing(chat, l, [[{ text: '🏠 More homes on yourhome.asia', url: S.ORIGIN + '/?utm_source=telegram&utm_medium=agent_channel' }]], 'agent_channel');
    await rest(`yh_channel_posts?listing_id=eq.${l.id}&chat=eq.${encodeURIComponent(chat)}`, { method: 'PATCH', body: JSON.stringify(r.ok ? { message_id: r.result.message_id, error: null } : { error: String(r.description || 'failed').slice(0, 300) }) });
    if (r.ok) n++; else errs.push(chat + ': ' + r.description);
  }
  return { posted: n, errors: errs.slice(0, 3) };
}

// the Telegram chat of a listing's owner: their Telegram sign-in, else the @handle they typed, if that person pressed Start
async function ownerChats(listings) {
  const ids = [...new Set(listings.map(l => l.owner_id).filter(Boolean))];
  if (!ids.length) return new Map();
  const info = await rpc('yh_owner_tg', { p_ids: ids }) || [];
  const chats = await rest('yh_tg_chats?select=chat_id,username,blocked&limit=10000') || [];
  const byUser = new Map(chats.filter(c => c.username).map(c => [String(c.username).toLowerCase(), c]));
  const blocked = new Set(chats.filter(c => c.blocked).map(c => Number(c.chat_id)));
  const out = new Map();
  for (const l of listings) {
    const i = info.find(x => x.id === l.owner_id) || {};
    let chat = i.tg_id ? Number(i.tg_id) : null;
    if (!chat) for (const h of [l.contact_telegram, i.contact_telegram]) { const c = byUser.get(String(h || '').trim().replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, '').toLowerCase()); if (c) { chat = Number(c.chat_id); break; } }
    if (chat && !blocked.has(chat)) out.set(l.id, chat);
  }
  return out;
}

// ---------- 3) "still available?" ----------
async function reminders() {
  const list = await rest(`yh_listings?select=${LCOLS}&status=eq.active&is_demo=eq.false&confirmed_at=lt.${iso(Date.now() - 30 * 864e5)}&order=confirmed_at.asc&limit=40`) || [];
  if (!list.length) return { due: 0 };
  const chats = await ownerChats(list);
  const langs = new Map((await rest('yh_tg_chats?select=chat_id,language&language=not.is.null&limit=10000') || []).map(c => [Number(c.chat_id), c.language]));
  let n = 0;
  for (const l of list) {
    const chat = chats.get(l.id); if (!chat || n >= 15) continue;
    const round = Math.floor(Date.parse(l.confirmed_at) / 864e5);
    const claimed = await rest('yh_tg_reminders?on_conflict=listing_id,round', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ listing_id: l.id, round, chat_id: chat }) });
    if (!claimed || !claimed.length) continue;
    const lg = langOf(langs.get(chat));
    const s = `${esc(S.listingName(l))}\n📍 ${esc(S.place(l))} · 💰 ${esc(priceText(l))}`;
    const r = await tg('sendMessage', { chat_id: chat, text: tr(lg, 'still', { s }), parse_mode: 'HTML', link_preview_options: { is_disabled: true },
      reply_markup: { inline_keyboard: [[{ text: tr(lg, 'yes'), callback_data: 'ok:' + l.id }], [{ text: tr(lg, 'gone'), callback_data: 'gone:' + l.id }], [{ text: '👀 ' + S.listingName(l).slice(0, 40), url: S.ORIGIN + S.listingPath(l) }]] } });
    if (r.ok) n++;
  }
  return { due: list.length, asked: n };
}

// ---------- 6) price drops → alert subscribers ----------
async function priceDrops() {
  const drops = await rest(`yh_price_drops?select=id,listing_id,old_price,new_price,at&at=gte.${iso(Date.now() - 2 * 864e5)}&order=at.asc&limit=50`) || [];
  if (!drops.length) return { drops: 0 };
  const subs = await rest('yh_alerts?select=id,user_id,kind,telegram,filters,created_at&active=is.true&kind=eq.new_listings&limit=2000') || [];
  if (!subs.length) return { drops: drops.length, sent: 0 };
  const sync = require('./tg-sync');   // matches() + chatFor() live there (lazy: no require loop)
  const ids = [...new Set(drops.map(d => d.listing_id))];
  const ls = await rest(`yh_listings?select=${LCOLS},furnished,amenities,foreigner_ok,title_type,min_lease,address&status=eq.active&id=in.(${ids.join(',')})`) || [];
  const byId = new Map(ls.map(l => [l.id, l]));
  const chats = await rest('yh_tg_chats?select=chat_id,username,blocked&limit=10000') || [];
  const tgIds = new Map();
  let n = 0;
  for (const d of drops) {
    const l = byId.get(d.listing_id); if (!l) continue;
    for (const a of subs) {
      if (n >= 30 || !sync.matches(l, a.filters)) continue;
      const chat = await sync.chatFor(a, chats, tgIds); if (!chat) continue;
      const ref = uuidFrom('drop:' + d.id);
      const claimed = await rest('yh_alert_sends?on_conflict=alert_id,ref_id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ alert_id: a.id, ref_id: ref, chat_id: chat }) });
      if (!claimed || !claimed.length) continue;
      const head = tr('en', 'drop', { old: S.money(d.old_price), new: S.money(d.new_price) });
      const r = await sendListing(chat, l, [[{ text: '🔕 Manage alerts', url: S.ORIGIN + '/account' }]], 'price_drop', head);
      await rest(`yh_alert_sends?alert_id=eq.${a.id}&ref_id=eq.${ref}`, { method: 'PATCH', body: JSON.stringify({ ok: !!r.ok, error: r.ok ? null : String(r.description || '').slice(0, 300) }) });
      if (r.ok) n++;
    }
  }
  return { drops: drops.length, sent: n };
}

// ---------- 8) daily digest in the channel ----------
async function digest() {
  const now = new Date(), kh = new Date(now.getTime() + 7 * 3600e3);   // Cambodia = UTC+7
  if (kh.getUTCHours() < 19) return { waiting: true };
  const day = kh.toISOString().slice(0, 10);
  const list = await rest(`yh_listings?select=${LCOLS}&status=eq.active&is_demo=eq.false&created_at=gte.${iso(now.getTime() - 864e5)}&order=created_at.desc&limit=12`) || [];
  if (list.length < 3) return { today: list.length, skipped: 'fewer than 3' };
  if (!(await claimKey('digest:' + day, String(list.length)))) return { done: true };
  const lines = list.slice(0, 10).map((l, i) => `${i + 1}. <a href="${esc(S.ORIGIN + S.listingPath(l) + '?utm_source=telegram&utm_medium=digest')}">${esc(S.listingName(l))}</a> – ${esc(l.district || l.city || 'Phnom Penh')} · <b>${esc(priceText(l))}</b>`);
  const text = [`🗓 <b>Today's new homes on www.yourhome.asia</b> (${list.length >= 12 ? '12+' : list.length})`, '', ...lines, '', '#Cambodia #NewListings'].join('\n');
  const r = await tg('sendMessage', { chat_id: CHANNEL, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true },
    reply_markup: { inline_keyboard: [[{ text: '🔎 See all new homes', url: S.ORIGIN + '/search?sort=new&utm_source=telegram&utm_medium=digest' }], [{ text: '➕ Post your listing – free', url: S.ORIGIN + '/post?utm_source=telegram&utm_medium=digest' }]] } });
  return { posted: !!r.ok, n: list.length, err: r.ok ? undefined : r.description };
}

async function runAll() {
  const out = {};
  for (const [name, fn] of [['cleanup', channelCleanup], ['admin', adminFeed], ['agents', agentChannels], ['reminders', reminders], ['priceDrops', priceDrops], ['digest', digest]]) {
    try { out[name] = await fn(); } catch (e) { out[name] = { error: String(e.message || e).slice(0, 200) }; }
  }
  return out;
}

module.exports = { runAll, T, tr, langOf, caption, sendListing, priceText, rest, rpc, tg, esc, LCOLS, CHANNEL, SB_URL, key, token };
