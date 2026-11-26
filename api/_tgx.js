// YOURHOME BOT – EXTRA JOBS (owner, 2026-11-25: "csináld meg mind sorrendben"). Called by api/tg-sync.js on every run
// (Vercel cron every 10 min + an instant ping from the database when something new happens – yh_tg_ping triggers):
//   0 channelCleanup  – a listing hidden / rented / sold / deleted → its channel posts are deleted (or marked "no longer available")
//   1 adminFeed       – everything new (listing, account, message, verification, partner, project question) → the owner's Telegram
//   2 agentChannels   – a listing of an agent profile with tg_channel (or of its owner) → posted to the agent's own channel too (30 days back)
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
  ru: {
    welcome: '👋 <b>Добро пожаловать на www.yourhome.asia – Камбоджа!</b>\n\nКвартиры, кондо, дома и комнаты в аренду и на продажу по всей Камбодже.\n\n🔎 Ищите здесь: просто напишите, что нужно, напр. <i>2 bedroom BKK1 600</i>, или нажмите кнопку.\n➕ Разместите объект бесплатно – пришлите мне фото и описание.\n🔔 Уведомления, сохранённые на сайте, приходят сюда.',
    rent: '🏠 Аренда', daily: '📅 Посуточно', buy: '💰 Купить', rooms: '🛏 Комнаты', post: '➕ Разместить', alerts: '🔔 Мои уведомления', channel: '📢 Канал', site: '🌐 Сайт',
    found: 'Найдено {n} – самые новые:', none: 'Пока ничего не найдено. Попробуйте меньше слов, напр. <i>rent BKK1</i> – или сохраните уведомление на сайте, и мы сообщим о новом объявлении.',
    seeAll: '🔎 Смотреть все на сайте', view: '👀 Открыть объявление',
    stop: '🔕 Уведомления отключены. Отправьте /start, чтобы включить снова.',
    noUser: '⚠️ У вашего Telegram нет @имени. Задайте его в Telegram → Настройки или войдите на yourhome.asia через Telegram, чтобы уведомления до вас доходили.',
    postIntro: '➕ <b>Разместите объект – бесплатно</b>\n\n1️⃣ Пришлите фото (до 15).\n2️⃣ Затем одним сообщением описание: тип, аренда или продажа, цена, спальни, район и город.\n\nПример: <i>2 bedroom condo for rent in BKK1, Phnom Penh, $650/month, pool and gym</i>\n\nОтправьте /cancel, чтобы отменить.',
    gotPhotos: '📷 Получено фото: {n}. Пришлите ещё или теперь описание.',
    summary: '📝 <b>Ваше объявление</b>\n\n{s}\n\nОпубликовать сейчас? Всё можно изменить позже на сайте.',
    publish: '✅ Опубликовать', edit: '✏️ Изменить на сайте', cancel: '✖ Отмена', cancelled: 'Отменено – ничего не опубликовано.',
    published: '🎉 <b>Ваше объявление опубликовано!</b>\nЧерез несколько минут оно появится и в нашем канале ' + CHANNEL + '.',
    needPrice: 'Не удалось найти цену. Пришлите описание ещё раз с ценой, напр. <i>$500/month</i>.',
    still: '🏠 <b>Ваш объект ещё свободен?</b>\n\n{s}\n\nПодтвердите, чтобы объявление оставалось вверху поиска.',
    yes: '✅ Да, ещё свободен', gone: '🔴 Сдан / продан', thanksYes: '✅ Спасибо – объявление остаётся на сайте ещё 30 дней.', thanksGone: '🔴 Готово – объявление скрыто. Поздравляем!',
    drop: '📉 <b>Снижение цены</b> на объявление по вашему уведомлению: <s>{old}</s> → <b>{new}</b>',
  },
  de: {
    welcome: '👋 <b>Willkommen bei www.yourhome.asia – Kambodscha!</b>\n\nWohnungen, Condos, Häuser und Zimmer zur Miete und zum Kauf in ganz Kambodscha.\n\n🔎 Hier suchen: schreib einfach, was du brauchst, z. B. <i>2 bedroom BKK1 600</i>, oder tippe auf eine Taste.\n➕ Inseriere deine Immobilie kostenlos – schick mir die Fotos und eine Beschreibung.\n🔔 Auf der Website gespeicherte Benachrichtigungen kommen hier an.',
    rent: '🏠 Mieten', daily: '📅 Tageweise', buy: '💰 Kaufen', rooms: '🛏 Zimmer', post: '➕ Inserieren', alerts: '🔔 Meine Benachrichtigungen', channel: '📢 Kanal', site: '🌐 Website',
    found: '{n} gefunden – die neuesten:', none: 'Noch nichts gefunden. Versuch es mit weniger Wörtern, z. B. <i>rent BKK1</i> – oder speichere eine Benachrichtigung auf der Website, dann melden wir uns.',
    seeAll: '🔎 Alle auf der Website ansehen', view: '👀 Anzeige ansehen',
    stop: '🔕 Benachrichtigungen gestoppt. Sende /start, um sie wieder einzuschalten.',
    noUser: '⚠️ Dein Telegram hat keinen @Benutzernamen. Leg einen fest unter Telegram → Einstellungen oder melde dich auf yourhome.asia mit Telegram an, damit dich die Benachrichtigungen erreichen.',
    postIntro: '➕ <b>Inseriere deine Immobilie – kostenlos</b>\n\n1️⃣ Schick die Fotos (bis zu 15).\n2️⃣ Dann die Beschreibung in einer Nachricht: Typ, Miete oder Kauf, Preis, Schlafzimmer, Bezirk und Stadt.\n\nBeispiel: <i>2 bedroom condo for rent in BKK1, Phnom Penh, $650/month, pool and gym</i>\n\nSende /cancel zum Abbrechen.',
    gotPhotos: '📷 {n} Foto(s) erhalten. Schick weitere oder jetzt die Beschreibung.',
    summary: '📝 <b>Deine Anzeige</b>\n\n{s}\n\nJetzt veröffentlichen? Du kannst später alles auf der Website ändern.',
    publish: '✅ Veröffentlichen', edit: '✏️ Auf der Website bearbeiten', cancel: '✖ Abbrechen', cancelled: 'Abgebrochen – nichts wurde veröffentlicht.',
    published: '🎉 <b>Deine Anzeige ist online!</b>\nIn wenigen Minuten erscheint sie auch in unserem Kanal ' + CHANNEL + '.',
    needPrice: 'Ich konnte den Preis nicht finden. Bitte schick die Beschreibung noch einmal mit Preis, z. B. <i>$500/month</i>.',
    still: '🏠 <b>Ist deine Immobilie noch verfügbar?</b>\n\n{s}\n\nBitte bestätige, damit sie oben in der Suche bleibt.',
    yes: '✅ Ja, noch verfügbar', gone: '🔴 Vermietet / verkauft', thanksYes: '✅ Danke – deine Anzeige bleibt weitere 30 Tage online.', thanksGone: '🔴 Erledigt – die Anzeige ist ausgeblendet. Glückwunsch!',
    drop: '📉 <b>Preissenkung</b> bei einer Anzeige zu deiner Benachrichtigung: <s>{old}</s> → <b>{new}</b>',
  },
  cs: {
    welcome: '👋 <b>Vítejte na www.yourhome.asia – Kambodža!</b>\n\nByty, condo, domy a pokoje k pronájmu i na prodej po celé Kambodži.\n\n🔎 Hledejte zde: napište, co potřebujete, např. <i>2 bedroom BKK1 600</i>, nebo klepněte na tlačítko.\n➕ Inzerujte nemovitost zdarma – pošlete mi fotky a popis.\n🔔 Upozornění uložená na webu přicházejí sem.',
    rent: '🏠 Pronájem', daily: '📅 Na den', buy: '💰 Koupě', rooms: '🛏 Pokoje', post: '➕ Přidat inzerát', alerts: '🔔 Moje upozornění', channel: '📢 Kanál', site: '🌐 Web',
    found: 'Nalezeno {n} – nejnovější:', none: 'Zatím nic. Zkuste méně slov, např. <i>rent BKK1</i> – nebo si na webu uložte upozornění a dáme vám vědět.',
    seeAll: '🔎 Zobrazit vše na webu', view: '👀 Zobrazit inzerát',
    stop: '🔕 Upozornění vypnuta. Pošlete /start pro opětovné zapnutí.',
    noUser: '⚠️ Váš Telegram nemá @uživatelské jméno. Nastavte ho v Telegram → Nastavení nebo se na yourhome.asia přihlaste přes Telegram, aby k vám upozornění došla.',
    postIntro: '➕ <b>Inzerujte nemovitost – zdarma</b>\n\n1️⃣ Pošlete fotky (až 15).\n2️⃣ Pak popis v jedné zprávě: typ, pronájem nebo prodej, cena, ložnice, čtvrť a město.\n\nPříklad: <i>2 bedroom condo for rent in BKK1, Phnom Penh, $650/month, pool and gym</i>\n\nPro zrušení pošlete /cancel.',
    gotPhotos: '📷 Přijato fotek: {n}. Pošlete další, nebo teď popis.',
    summary: '📝 <b>Váš inzerát</b>\n\n{s}\n\nZveřejnit hned? Vše můžete později upravit na webu.',
    publish: '✅ Zveřejnit', edit: '✏️ Upravit na webu', cancel: '✖ Zrušit', cancelled: 'Zrušeno – nic nebylo zveřejněno.',
    published: '🎉 <b>Váš inzerát je zveřejněn!</b>\nZa pár minut se objeví i v našem kanálu ' + CHANNEL + '.',
    needPrice: 'Nenašel jsem cenu. Pošlete prosím popis znovu i s cenou, např. <i>$500/month</i>.',
    still: '🏠 <b>Je vaše nemovitost stále volná?</b>\n\n{s}\n\nPotvrďte prosím, aby zůstala nahoře ve vyhledávání.',
    yes: '✅ Ano, stále volná', gone: '🔴 Pronajato / prodáno', thanksYes: '✅ Děkujeme – inzerát zůstává online dalších 30 dní.', thanksGone: '🔴 Hotovo – inzerát je skrytý. Gratulujeme!',
    drop: '📉 <b>Sleva</b> u inzerátu podle vašeho upozornění: <s>{old}</s> → <b>{new}</b>',
  },
  pl: {
    welcome: '👋 <b>Witaj w www.yourhome.asia – Kambodża!</b>\n\nMieszkania, condo, domy i pokoje na wynajem i sprzedaż w całej Kambodży.\n\n🔎 Szukaj tutaj: napisz, czego potrzebujesz, np. <i>2 bedroom BKK1 600</i>, albo naciśnij przycisk.\n➕ Dodaj nieruchomość za darmo – wyślij mi zdjęcia i opis.\n🔔 Powiadomienia zapisane na stronie przychodzą tutaj.',
    rent: '🏠 Wynajem', daily: '📅 Na doby', buy: '💰 Kupno', rooms: '🛏 Pokoje', post: '➕ Dodaj ogłoszenie', alerts: '🔔 Moje powiadomienia', channel: '📢 Kanał', site: '🌐 Strona',
    found: 'Znaleziono {n} – najnowsze:', none: 'Na razie nic. Spróbuj mniej słów, np. <i>rent BKK1</i> – albo zapisz powiadomienie na stronie, a damy znać.',
    seeAll: '🔎 Zobacz wszystkie na stronie', view: '👀 Zobacz ogłoszenie',
    stop: '🔕 Powiadomienia wyłączone. Wyślij /start, aby je włączyć.',
    noUser: '⚠️ Twój Telegram nie ma @nazwy użytkownika. Ustaw ją w Telegram → Ustawienia albo zaloguj się na yourhome.asia przez Telegram, żeby powiadomienia do Ciebie docierały.',
    postIntro: '➕ <b>Dodaj nieruchomość – za darmo</b>\n\n1️⃣ Wyślij zdjęcia (do 15).\n2️⃣ Potem opis w jednej wiadomości: rodzaj, wynajem lub sprzedaż, cena, sypialnie, dzielnica i miasto.\n\nPrzykład: <i>2 bedroom condo for rent in BKK1, Phnom Penh, $650/month, pool and gym</i>\n\nWyślij /cancel, aby przerwać.',
    gotPhotos: '📷 Otrzymano zdjęć: {n}. Wyślij kolejne albo teraz opis.',
    summary: '📝 <b>Twoje ogłoszenie</b>\n\n{s}\n\nOpublikować teraz? Wszystko możesz później zmienić na stronie.',
    publish: '✅ Opublikuj', edit: '✏️ Edytuj na stronie', cancel: '✖ Anuluj', cancelled: 'Anulowano – nic nie opublikowano.',
    published: '🎉 <b>Twoje ogłoszenie jest online!</b>\nZa kilka minut pojawi się też na naszym kanale ' + CHANNEL + '.',
    needPrice: 'Nie znalazłem ceny. Wyślij opis ponownie z ceną, np. <i>$500/month</i>.',
    still: '🏠 <b>Czy Twoja nieruchomość jest nadal dostępna?</b>\n\n{s}\n\nPotwierdź, aby została na górze wyszukiwania.',
    yes: '✅ Tak, nadal dostępna', gone: '🔴 Wynajęta / sprzedana', thanksYes: '✅ Dziękujemy – ogłoszenie zostaje online na kolejne 30 dni.', thanksGone: '🔴 Gotowe – ogłoszenie ukryte. Gratulacje!',
    drop: '📉 <b>Obniżka ceny</b> w ogłoszeniu z Twojego powiadomienia: <s>{old}</s> → <b>{new}</b>',
  },
  hu: {
    welcome: '👋 <b>Üdvözöljük a www.yourhome.asia – Kambodzsa oldalon!</b>\n\nKiadó és eladó lakások, condók, házak és szobák egész Kambodzsában.\n\n🔎 Keressen itt: írja meg, mire van szüksége, pl. <i>2 bedroom BKK1 600</i>, vagy nyomjon meg egy gombot.\n➕ Hirdesse ingatlanát ingyen – küldje el a fotókat és egy leírást.\n🔔 Az oldalon mentett értesítések ide érkeznek.',
    rent: '🏠 Bérlés', daily: '📅 Napi', buy: '💰 Vásárlás', rooms: '🛏 Szobák', post: '➕ Hirdetés feladása', alerts: '🔔 Értesítéseim', channel: '📢 Csatorna', site: '🌐 Weboldal',
    found: '{n} találat – a legújabbak:', none: 'Még nincs találat. Próbálja kevesebb szóval, pl. <i>rent BKK1</i> – vagy mentsen értesítést az oldalon, és szólunk, ha jön egy.',
    seeAll: '🔎 Összes megtekintése az oldalon', view: '👀 Hirdetés megnyitása',
    stop: '🔕 Értesítések leállítva. Küldje a /start parancsot az újbóli bekapcsoláshoz.',
    noUser: '⚠️ A Telegramjának nincs @felhasználóneve. Állítson be egyet a Telegram → Beállítások menüben, vagy lépjen be a yourhome.asia-ra Telegrammal, hogy megkapja az értesítéseket.',
    postIntro: '➕ <b>Hirdesse ingatlanát – ingyen</b>\n\n1️⃣ Küldje el a fotókat (legfeljebb 15).\n2️⃣ Utána egy üzenetben a leírást: típus, kiadó vagy eladó, ár, hálószobák, kerület és város.\n\nPélda: <i>2 bedroom condo for rent in BKK1, Phnom Penh, $650/month, pool and gym</i>\n\nA /cancel paranccsal leállíthatja.',
    gotPhotos: '📷 {n} fotó megérkezett. Küldjön még, vagy most a leírást.',
    summary: '📝 <b>Az Ön hirdetése</b>\n\n{s}\n\nKözzéteszi most? Később mindent módosíthat az oldalon.',
    publish: '✅ Közzététel', edit: '✏️ Szerkesztés az oldalon', cancel: '✖ Mégse', cancelled: 'Megszakítva – semmi sem jelent meg.',
    published: '🎉 <b>A hirdetése megjelent!</b>\nPár percen belül a ' + CHANNEL + ' csatornánkon is megjelenik.',
    needPrice: 'Nem találtam az árat. Küldje el újra a leírást az árral, pl. <i>$500/month</i>.',
    still: '🏠 <b>Szabad még az ingatlana?</b>\n\n{s}\n\nKérjük, erősítse meg, hogy a keresés elején maradjon.',
    yes: '✅ Igen, még szabad', gone: '🔴 Kiadva / eladva', thanksYes: '✅ Köszönjük – a hirdetés további 30 napig aktív marad.', thanksGone: '🔴 Kész – a hirdetés rejtve. Gratulálunk!',
    drop: '📉 <b>Árcsökkenés</b> egy értesítésének megfelelő hirdetésen: <s>{old}</s> → <b>{new}</b>',
  },
  ko: {
    welcome: '👋 <b>www.yourhome.asia – 캄보디아에 오신 것을 환영합니다!</b>\n\n캄보디아 전역의 임대·매매 아파트, 콘도, 주택, 방.\n\n🔎 여기서 검색하세요: 원하는 조건을 입력하세요. 예: <i>2 bedroom BKK1 600</i> 또는 버튼을 누르세요.\n➕ 무료로 매물을 등록하세요 – 사진과 설명을 보내주세요.\n🔔 사이트에서 저장한 알림이 여기로 옵니다.',
    rent: '🏠 임대', daily: '📅 일일', buy: '💰 매매', rooms: '🛏 방', post: '➕ 매물 등록', alerts: '🔔 내 알림', channel: '📢 채널', site: '🌐 웹사이트',
    found: '{n}개 찾음 – 최신순:', none: '아직 결과가 없습니다. 단어를 줄여 보세요. 예: <i>rent BKK1</i> – 또는 사이트에서 알림을 저장하면 새 매물이 오면 알려드립니다.',
    seeAll: '🔎 웹사이트에서 전체 보기', view: '👀 매물 보기',
    stop: '🔕 알림이 중지되었습니다. 다시 켜려면 /start를 보내세요.',
    noUser: '⚠️ 텔레그램에 @사용자이름이 없습니다. 텔레그램 → 설정에서 설정하거나 yourhome.asia에 텔레그램으로 로그인해야 알림을 받을 수 있습니다.',
    postIntro: '➕ <b>무료로 매물 등록</b>\n\n1️⃣ 사진을 보내세요 (최대 15장).\n2️⃣ 그다음 한 메시지로 설명을 보내세요: 유형, 임대 또는 매매, 가격, 침실, 지역과 도시.\n\n예: <i>2 bedroom condo for rent in BKK1, Phnom Penh, $650/month, pool and gym</i>\n\n중단하려면 /cancel을 보내세요.',
    gotPhotos: '📷 사진 {n}장을 받았습니다. 더 보내거나 이제 설명을 보내세요.',
    summary: '📝 <b>내 매물</b>\n\n{s}\n\n지금 게시할까요? 나중에 웹사이트에서 모두 수정할 수 있습니다.',
    publish: '✅ 게시', edit: '✏️ 웹사이트에서 수정', cancel: '✖ 취소', cancelled: '취소되었습니다 – 게시된 내용이 없습니다.',
    published: '🎉 <b>매물이 게시되었습니다!</b>\n몇 분 안에 저희 채널 ' + CHANNEL + '에도 표시됩니다.',
    needPrice: '가격을 찾지 못했습니다. 가격을 포함해 설명을 다시 보내주세요. 예: <i>$500/month</i>.',
    still: '🏠 <b>매물이 아직 비어 있나요?</b>\n\n{s}\n\n검색 상단에 유지되도록 확인해 주세요.',
    yes: '✅ 네, 아직 가능해요', gone: '🔴 임대 / 매매 완료', thanksYes: '✅ 감사합니다 – 매물이 30일 더 게시됩니다.', thanksGone: '🔴 완료 – 매물이 숨겨졌습니다. 축하합니다!',
    drop: '📉 알림 조건에 맞는 매물의 <b>가격 인하</b>: <s>{old}</s> → <b>{new}</b>',
  },
  ja: {
    welcome: '👋 <b>www.yourhome.asia – カンボジアへようこそ！</b>\n\nカンボジア全土の賃貸・売買アパート、コンドミニアム、一戸建て、部屋。\n\n🔎 ここで検索：希望をそのまま書いてください。例：<i>2 bedroom BKK1 600</i>。またはボタンをタップ。\n➕ 物件を無料で掲載 – 写真と説明を送ってください。\n🔔 サイトで保存した通知はここに届きます。',
    rent: '🏠 賃貸', daily: '📅 日貸し', buy: '💰 購入', rooms: '🛏 部屋', post: '➕ 物件を掲載', alerts: '🔔 マイ通知', channel: '📢 チャンネル', site: '🌐 ウェブサイト',
    found: '{n}件見つかりました – 新着順：', none: 'まだ見つかりません。単語を減らしてみてください（例：<i>rent BKK1</i>）。サイトで通知を保存すれば、新着時にお知らせします。',
    seeAll: '🔎 ウェブサイトですべて見る', view: '👀 物件を見る',
    stop: '🔕 通知を停止しました。再開するには /start を送ってください。',
    noUser: '⚠️ Telegramに@ユーザー名がありません。Telegram → 設定で設定するか、yourhome.asiaにTelegramでログインすると通知が届くようになります。',
    postIntro: '➕ <b>物件を無料で掲載</b>\n\n1️⃣ 写真を送ってください（最大15枚）。\n2️⃣ 次に説明を1つのメッセージで：タイプ、賃貸か売買、価格、寝室数、エリアと都市。\n\n例：<i>2 bedroom condo for rent in BKK1, Phnom Penh, $650/month, pool and gym</i>\n\n中止するには /cancel を送ってください。',
    gotPhotos: '📷 写真を{n}枚受け取りました。さらに送るか、説明を送ってください。',
    summary: '📝 <b>あなたの物件</b>\n\n{s}\n\n今すぐ公開しますか？あとでウェブサイトですべて編集できます。',
    publish: '✅ 公開する', edit: '✏️ ウェブサイトで編集', cancel: '✖ キャンセル', cancelled: 'キャンセルしました – 何も投稿されていません。',
    published: '🎉 <b>物件が公開されました！</b>\n数分以内に当社チャンネル ' + CHANNEL + ' にも表示されます。',
    needPrice: '価格が見つかりませんでした。価格を入れて説明をもう一度送ってください（例：<i>$500/month</i>）。',
    still: '🏠 <b>物件はまだ空いていますか？</b>\n\n{s}\n\n検索の上位に残すために確認してください。',
    yes: '✅ はい、まだ空いています', gone: '🔴 賃貸済み / 売却済み', thanksYes: '✅ ありがとうございます – 物件はさらに30日間公開されます。', thanksGone: '🔴 完了 – 物件を非表示にしました。おめでとうございます！',
    drop: '📉 通知条件に合う物件が<b>値下げ</b>されました：<s>{old}</s> → <b>{new}</b>',
  },
  vi: {
    welcome: '👋 <b>Chào mừng đến với www.yourhome.asia – Campuchia!</b>\n\nCăn hộ, condo, nhà và phòng cho thuê và bán khắp Campuchia.\n\n🔎 Tìm ở đây: chỉ cần viết điều bạn cần, VD: <i>2 bedroom BKK1 600</i>, hoặc bấm một nút.\n➕ Đăng bất động sản miễn phí – gửi cho tôi ảnh và mô tả.\n🔔 Thông báo bạn đã lưu trên trang web sẽ đến đây.',
    rent: '🏠 Thuê', daily: '📅 Theo ngày', buy: '💰 Mua', rooms: '🛏 Phòng', post: '➕ Đăng tin', alerts: '🔔 Thông báo của tôi', channel: '📢 Kênh', site: '🌐 Trang web',
    found: 'Tìm thấy {n} – mới nhất:', none: 'Chưa tìm thấy. Hãy thử ít từ hơn, VD: <i>rent BKK1</i> – hoặc lưu thông báo trên trang web, chúng tôi sẽ báo khi có tin.',
    seeAll: '🔎 Xem tất cả trên trang web', view: '👀 Xem tin',
    stop: '🔕 Đã tắt thông báo. Gửi /start để bật lại.',
    noUser: '⚠️ Telegram của bạn chưa có @tên người dùng. Hãy đặt trong Telegram → Cài đặt, hoặc đăng nhập yourhome.asia bằng Telegram để nhận được thông báo.',
    postIntro: '➕ <b>Đăng bất động sản – miễn phí</b>\n\n1️⃣ Gửi ảnh (tối đa 15).\n2️⃣ Sau đó gửi mô tả trong một tin nhắn: loại, thuê hay bán, giá, số phòng ngủ, khu vực và thành phố.\n\nVí dụ: <i>2 bedroom condo for rent in BKK1, Phnom Penh, $650/month, pool and gym</i>\n\nGửi /cancel để dừng.',
    gotPhotos: '📷 Đã nhận {n} ảnh. Gửi thêm, hoặc gửi mô tả ngay.',
    summary: '📝 <b>Tin của bạn</b>\n\n{s}\n\nĐăng ngay? Bạn có thể sửa mọi thứ sau trên trang web.',
    publish: '✅ Đăng', edit: '✏️ Sửa trên trang web', cancel: '✖ Hủy', cancelled: 'Đã hủy – chưa đăng gì.',
    published: '🎉 <b>Tin của bạn đã được đăng!</b>\nVài phút nữa tin cũng sẽ xuất hiện trên kênh ' + CHANNEL + ' của chúng tôi.',
    needPrice: 'Tôi không tìm thấy giá. Vui lòng gửi lại mô tả kèm giá, VD: <i>$500/month</i>.',
    still: '🏠 <b>Bất động sản của bạn còn trống không?</b>\n\n{s}\n\nVui lòng xác nhận để tin tiếp tục ở đầu kết quả tìm kiếm.',
    yes: '✅ Còn trống', gone: '🔴 Đã cho thuê / đã bán', thanksYes: '✅ Cảm ơn – tin tiếp tục hiển thị thêm 30 ngày.', thanksGone: '🔴 Xong – tin đã được ẩn. Chúc mừng bạn!',
    drop: '📉 <b>Giảm giá</b> ở tin phù hợp thông báo của bạn: <s>{old}</s> → <b>{new}</b>',
  },
};
const langOf = code => { const c = String(code || '').slice(0, 2).toLowerCase(); return T[c] ? c : 'en'; };
// CHANNEL → WEBSITE (owner, 2026-11-26: "ha saját csatornába feladja, ott akkor a weblapon meg tud jelenni?" → "rád bízom"):
// the approval message the agent gets for a post found in their own channel (api/tg-bot.js channelPost). 8 Cambodia languages.
const TI = {
  en: { impAsk: '📥 <b>New post in your channel {c}</b>\nShall we publish it on www.yourhome.asia too?\n\n{s}', impPub: '✅ Publish on the website', impNo: '🙈 Don’t publish', impEdit: '✏️ Edit first', impDone: '🎉 <b>Published on yourhome.asia!</b>', impNoDone: 'OK – not published. It stays only in your channel.', impNoPrice: '📥 A post in your channel {c} has photos but no price, so we could not put it on the website. Write the price in the post (e.g. <i>$600/month</i>) or post it on yourhome.asia/post.' },
  km: { impAsk: '📥 <b>ការប្រកាសថ្មីនៅក្នុងឆានែលរបស់អ្នក {c}</b>\nតើយើងគួរផ្សាយវានៅលើ www.yourhome.asia ផងដែរឬទេ?\n\n{s}', impPub: '✅ ផ្សាយលើគេហទំព័រ', impNo: '🙈 កុំផ្សាយ', impEdit: '✏️ កែសម្រួលជាមុន', impDone: '🎉 <b>បានផ្សាយលើ yourhome.asia ហើយ!</b>', impNoDone: 'យល់ព្រម – មិនបានផ្សាយទេ។ វានៅតែក្នុងឆានែលរបស់អ្នកប៉ុណ្ណោះ។', impNoPrice: '📥 ការប្រកាសមួយនៅក្នុងឆានែល {c} មានរូបថត ប៉ុន្តែគ្មានតម្លៃ ដូច្នេះយើងមិនអាចដាក់វាលើគេហទំព័របានទេ។ សូមសរសេរតម្លៃក្នុងការប្រកាស (ឧ. <i>$600/month</i>) ឬប្រកាសនៅ yourhome.asia/post។' },
  zh: { impAsk: '📥 <b>您的频道 {c} 有新帖子</b>\n要同时发布到 www.yourhome.asia 吗？\n\n{s}', impPub: '✅ 发布到网站', impNo: '🙈 不发布', impEdit: '✏️ 先编辑', impDone: '🎉 <b>已发布到 yourhome.asia！</b>', impNoDone: '好的 – 未发布，仅保留在您的频道中。', impNoPrice: '📥 您频道 {c} 中的一条帖子有照片但没有价格，因此无法发布到网站。请在帖子中写明价格（例如 <i>$600/month</i>），或在 yourhome.asia/post 发布。' },
  fr: { impAsk: '📥 <b>Nouvelle publication dans votre chaîne {c}</b>\nLa publier aussi sur www.yourhome.asia ?\n\n{s}', impPub: '✅ Publier sur le site', impNo: '🙈 Ne pas publier', impEdit: '✏️ Modifier d’abord', impDone: '🎉 <b>Publiée sur yourhome.asia !</b>', impNoDone: 'D’accord – non publiée. Elle reste uniquement dans votre chaîne.', impNoPrice: '📥 Une publication de votre chaîne {c} a des photos mais pas de prix, nous n’avons donc pas pu la mettre sur le site. Indiquez le prix (ex. <i>$600/month</i>) ou publiez sur yourhome.asia/post.' },
  th: { impAsk: '📥 <b>โพสต์ใหม่ในช่องของคุณ {c}</b>\nต้องการเผยแพร่บน www.yourhome.asia ด้วยไหม?\n\n{s}', impPub: '✅ เผยแพร่บนเว็บไซต์', impNo: '🙈 ไม่เผยแพร่', impEdit: '✏️ แก้ไขก่อน', impDone: '🎉 <b>เผยแพร่บน yourhome.asia แล้ว!</b>', impNoDone: 'ตกลง – ไม่ได้เผยแพร่ โพสต์จะอยู่ในช่องของคุณเท่านั้น', impNoPrice: '📥 โพสต์ในช่อง {c} มีรูปแต่ไม่มีราคา จึงนำขึ้นเว็บไซต์ไม่ได้ ใส่ราคาในโพสต์ (เช่น <i>$600/month</i>) หรือโพสต์ที่ yourhome.asia/post' },
  ru: { impAsk: '📥 <b>Новый пост в вашем канале {c}</b>\nОпубликовать его и на www.yourhome.asia?\n\n{s}', impPub: '✅ Опубликовать на сайте', impNo: '🙈 Не публиковать', impEdit: '✏️ Сначала изменить', impDone: '🎉 <b>Опубликовано на yourhome.asia!</b>', impNoDone: 'Хорошо – не опубликовано. Пост остаётся только в вашем канале.', impNoPrice: '📥 В посте канала {c} есть фото, но нет цены, поэтому мы не смогли разместить его на сайте. Укажите цену (напр. <i>$600/month</i>) или разместите на yourhome.asia/post.' },
  vi: { impAsk: '📥 <b>Bài mới trong kênh của bạn {c}</b>\nĐăng bài này lên www.yourhome.asia luôn nhé?\n\n{s}', impPub: '✅ Đăng lên website', impNo: '🙈 Không đăng', impEdit: '✏️ Sửa trước', impDone: '🎉 <b>Đã đăng lên yourhome.asia!</b>', impNoDone: 'OK – không đăng. Bài chỉ nằm trong kênh của bạn.', impNoPrice: '📥 Một bài trong kênh {c} có ảnh nhưng không có giá nên chưa thể đưa lên website. Hãy ghi giá trong bài (VD: <i>$600/month</i>) hoặc đăng tại yourhome.asia/post.' },
  ko: { impAsk: '📥 <b>채널 {c}에 새 게시물</b>\nwww.yourhome.asia에도 게시할까요?\n\n{s}', impPub: '✅ 웹사이트에 게시', impNo: '🙈 게시 안 함', impEdit: '✏️ 먼저 수정', impDone: '🎉 <b>yourhome.asia에 게시되었습니다!</b>', impNoDone: '알겠습니다 – 게시하지 않았습니다. 채널에만 남습니다.', impNoPrice: '📥 채널 {c}의 게시물에 사진은 있지만 가격이 없어 웹사이트에 올릴 수 없었습니다. 게시물에 가격(예: <i>$600/month</i>)을 쓰거나 yourhome.asia/post에서 등록하세요.' },
};
for (const l in TI) T[l] = Object.assign(T[l] || {}, TI[l]);

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
// (owner, 2026-11-26 "Agent Telegram channel connect to website"): a listing goes to the channel of its agent profile; a listing
// WITHOUT a profile goes to the channel of its owner's profile when the owner has exactly one profile with a channel. Window 30 days,
// so an agent who connects a channel gets their recent listings posted there too (10 per run; yh_channel_posts = each only once).
async function agentChannels() {
  const agents = await rest('yh_agents?select=id,owner_id,tg_channel&tg_channel=not.is.null&limit=2000') || [];
  if (!agents.length) return { posted: 0 };
  const chan = new Map(agents.map(a => [a.id, a.tg_channel]));
  const perOwner = new Map(); for (const a of agents) perOwner.set(a.owner_id, (perOwner.get(a.owner_id) || []).concat(a.tg_channel));
  const list = await rest(`yh_listings?select=${LCOLS}&status=eq.active&is_demo=eq.false&created_at=gte.${iso(Date.now() - 30 * 864e5)}&owner_id=in.(${[...perOwner.keys()].join(',')})&order=created_at.asc&limit=300`) || [];
  if (!list.length) return { posted: 0 };
  const done = new Set((await rest(`yh_channel_posts?select=listing_id,chat&listing_id=in.(${list.map(l => l.id).join(',')})`) || []).map(r => r.listing_id + '|' + r.chat));
  let n = 0; const errs = []; const bad = new Set();
  for (const l of list) {
    if (n >= 10) break;
    const own = perOwner.get(l.owner_id) || [];
    const chat = l.agent_id ? chan.get(l.agent_id) : (new Set(own).size === 1 ? own[0] : null);
    if (!chat || bad.has(chat) || done.has(l.id + '|' + chat)) continue;
    const claimed = await rest('yh_channel_posts?on_conflict=listing_id,chat', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ listing_id: l.id, chat }) });
    if (!claimed || !claimed.length) continue;
    const r = await sendListing(chat, l, [[{ text: '🏠 More homes on yourhome.asia', url: S.ORIGIN + '/?utm_source=telegram&utm_medium=agent_channel' }]], 'agent_channel');
    if (r.ok) { await rest(`yh_channel_posts?listing_id=eq.${l.id}&chat=eq.${encodeURIComponent(chat)}`, { method: 'PATCH', body: JSON.stringify({ message_id: r.result.message_id, error: null }) }); n++; continue; }
    // not posted (bot not admin yet, channel renamed…): give the claim back so it is tried again once the agent fixes it; skip the
    // rest of this channel in this run (one Telegram call per broken channel every 10 min)
    await rest(`yh_channel_posts?listing_id=eq.${l.id}&chat=eq.${encodeURIComponent(chat)}`, { method: 'DELETE' });
    bad.add(chat); errs.push(chat + ': ' + r.description);
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
