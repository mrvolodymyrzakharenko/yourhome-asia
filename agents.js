// Agent / agency profiles + links to well-known sites (Booking, Agoda, Trip.com…)
// Public profile page: #/agent/<slug>. Profiles live in yh_agents; a listing points to one with agent_id
// and carries its own links in external_links ([{name,url}]). Wired into app.js through AG.init(ctx).

const TX = {
  en: {
    agentProfile: 'Agent profile', myAgent: 'My agent profile', agentSub: 'Your public page with all your listings',
    createAgent: 'Create your agent profile', addAgent: '+ Add another profile', editAgent: 'Edit profile', viewPage: 'View page',
    kind: 'I am', k_agent: 'Agent', k_agency: 'Agency', k_owner: 'Owner',
    fullName: 'Name shown on your page', company: 'Company / agency', photo: 'Photo or logo', bio: 'About you',
    bioPh: 'Experience, areas you know best, what you can help with…', languages: 'Languages you speak', areas: 'Areas you cover',
    email: 'Email', pageAddr: 'Page address', contacts: 'Contacts', otherSites: 'Your pages on other websites (optional)',
    otherSitesSub: 'Paste the full https:// link. Only the sites you fill in are shown.', other: 'Other website',
    saveProfile: 'Save profile', profileSaved: 'Profile saved.', delProfile: 'Delete profile', confirmDelProfile: 'Delete this profile? Your listings stay online.',
    listedBy: 'Listed by', seeProfile: 'See profile and all listings →', verified: 'Verified', alsoOn: 'Also on', verifiedOn: 'Verified on',
    alsoListed: 'Also listed on', linksNote: 'These links were added by the advertiser.', linksNoteV: 'Our team checked this advertiser.',
    attachAgent: 'Show my agent profile on this listing', none: '— none —', listingLinks: 'This property on other sites (optional)',
    listingLinksSub: 'Booking.com, Agoda, Trip.com, Airbnb… paste the link of this exact property.',
    activeListings: '{n} active listings', noListingsYet: 'No active listings yet.', share: 'Copy link', copied: 'Link copied.',
    agentsTitle: 'Agents & agencies', agentsSub: 'Local experts with a public profile on YourHome', otherAdvertisers: 'Other advertisers',
    needAgentFirst: 'Create your agent profile to show it on your listings.', slugTaken: 'This page address is taken – try another one.',
    call: 'Call', message: 'Message', notFound: 'Profile not found.', profilesN: '{n} profiles',
  },
  km: {
    agentProfile: 'ប្រវត្តិរូបភ្នាក់ងារ', myAgent: 'ប្រវត្តិរូបភ្នាក់ងាររបស់ខ្ញុំ', agentSub: 'ទំព័រសាធារណៈរបស់អ្នកជាមួយការប្រកាសទាំងអស់',
    createAgent: 'បង្កើតប្រវត្តិរូបភ្នាក់ងារ', addAgent: '+ បន្ថែមប្រវត្តិរូបមួយទៀត', editAgent: 'កែប្រវត្តិរូប', viewPage: 'មើលទំព័រ',
    kind: 'ខ្ញុំជា', k_agent: 'ភ្នាក់ងារ', k_agency: 'ក្រុមហ៊ុនភ្នាក់ងារ', k_owner: 'ម្ចាស់',
    fullName: 'ឈ្មោះបង្ហាញលើទំព័រ', company: 'ក្រុមហ៊ុន', photo: 'រូបថត ឬឡូហ្គោ', bio: 'អំពីអ្នក', languages: 'ភាសាដែលអ្នកនិយាយ', areas: 'តំបន់ដែលអ្នកគ្រប',
    email: 'អ៊ីមែល', pageAddr: 'អាសយដ្ឋានទំព័រ', contacts: 'ទំនាក់ទំនង', otherSites: 'ទំព័ររបស់អ្នកនៅគេហទំព័រផ្សេង (ស្រេចចិត្ត)', other: 'គេហទំព័រផ្សេង',
    saveProfile: 'រក្សាទុកប្រវត្តិរូប', profileSaved: 'បានរក្សាទុក។', delProfile: 'លុបប្រវត្តិរូប',
    listedBy: 'ប្រកាសដោយ', seeProfile: 'មើលប្រវត្តិរូប និងការប្រកាសទាំងអស់ →', verified: 'បានផ្ទៀងផ្ទាត់', alsoOn: 'មាននៅលើ', verifiedOn: 'បានផ្ទៀងផ្ទាត់នៅលើ',
    alsoListed: 'ក៏មាននៅលើ', attachAgent: 'បង្ហាញប្រវត្តិរូបភ្នាក់ងាររបស់ខ្ញុំលើការប្រកាសនេះ', none: '— គ្មាន —', listingLinks: 'ទ្រព្យនេះនៅគេហទំព័រផ្សេង (ស្រេចចិត្ត)',
    activeListings: 'ការប្រកាសសកម្ម {n}', share: 'ចម្លងតំណ', copied: 'បានចម្លង។', agentsTitle: 'ភ្នាក់ងារ និងក្រុមហ៊ុន', otherAdvertisers: 'អ្នកផ្សាយផ្សេងទៀត',
    call: 'ហៅ', message: 'សារ',
  },
  zh: {
    agentProfile: '经纪人主页', myAgent: '我的经纪人主页', agentSub: '展示您全部房源的公开主页',
    createAgent: '创建经纪人主页', addAgent: '+ 再添加一个主页', editAgent: '编辑主页', viewPage: '查看主页',
    kind: '我是', k_agent: '经纪人', k_agency: '中介公司', k_owner: '房东',
    fullName: '主页显示名称', company: '公司 / 中介', photo: '照片或标志', bio: '关于您', languages: '会说的语言', areas: '服务区域',
    email: '邮箱', pageAddr: '主页地址', contacts: '联系方式', otherSites: '您在其他网站的页面（可选）', other: '其他网站',
    saveProfile: '保存主页', profileSaved: '已保存。', delProfile: '删除主页',
    listedBy: '发布者', seeProfile: '查看主页及全部房源 →', verified: '已认证', alsoOn: '也在', verifiedOn: '已认证于',
    alsoListed: '也发布于', attachAgent: '在此房源上显示我的经纪人主页', none: '— 无 —', listingLinks: '此房源在其他网站的链接（可选）',
    activeListings: '{n} 套在售/在租房源', share: '复制链接', copied: '链接已复制。', agentsTitle: '经纪人与中介', otherAdvertisers: '其他发布者',
    call: '电话', message: '留言',
  },
  fr: {
    agentProfile: 'Profil d’agent', myAgent: 'Mon profil d’agent', agentSub: 'Votre page publique avec toutes vos annonces',
    createAgent: 'Créer votre profil d’agent', addAgent: '+ Ajouter un profil', editAgent: 'Modifier le profil', viewPage: 'Voir la page',
    kind: 'Je suis', k_agent: 'Agent', k_agency: 'Agence', k_owner: 'Propriétaire',
    fullName: 'Nom affiché', company: 'Société / agence', photo: 'Photo ou logo', bio: 'À propos', languages: 'Langues parlées', areas: 'Quartiers couverts',
    email: 'E-mail', pageAddr: 'Adresse de la page', contacts: 'Contacts', otherSites: 'Vos pages sur d’autres sites (facultatif)', other: 'Autre site',
    saveProfile: 'Enregistrer le profil', profileSaved: 'Profil enregistré.', delProfile: 'Supprimer le profil',
    listedBy: 'Annonce de', seeProfile: 'Voir le profil et toutes les annonces →', verified: 'Vérifié', alsoOn: 'Aussi sur', verifiedOn: 'Vérifié sur',
    alsoListed: 'Aussi publié sur', attachAgent: 'Afficher mon profil d’agent sur cette annonce', none: '— aucun —', listingLinks: 'Ce bien sur d’autres sites (facultatif)',
    activeListings: '{n} annonces actives', share: 'Copier le lien', copied: 'Lien copié.', agentsTitle: 'Agents et agences', otherAdvertisers: 'Autres annonceurs',
    call: 'Appeler', message: 'Message',
  },
  th: {
    agentProfile: 'โปรไฟล์เอเจนต์', myAgent: 'โปรไฟล์เอเจนต์ของฉัน', agentSub: 'หน้าสาธารณะพร้อมประกาศทั้งหมดของคุณ',
    createAgent: 'สร้างโปรไฟล์เอเจนต์', addAgent: '+ เพิ่มโปรไฟล์', editAgent: 'แก้ไขโปรไฟล์', viewPage: 'ดูหน้า',
    kind: 'ฉันคือ', k_agent: 'เอเจนต์', k_agency: 'บริษัทนายหน้า', k_owner: 'เจ้าของ',
    fullName: 'ชื่อที่แสดง', company: 'บริษัท / เอเจนซี', photo: 'รูปภาพหรือโลโก้', bio: 'เกี่ยวกับคุณ', languages: 'ภาษาที่พูดได้', areas: 'พื้นที่ที่ดูแล',
    email: 'อีเมล', pageAddr: 'ที่อยู่หน้า', contacts: 'ช่องทางติดต่อ', otherSites: 'หน้าของคุณบนเว็บไซต์อื่น (ไม่บังคับ)', other: 'เว็บไซต์อื่น',
    saveProfile: 'บันทึกโปรไฟล์', profileSaved: 'บันทึกแล้ว', delProfile: 'ลบโปรไฟล์',
    listedBy: 'ลงประกาศโดย', seeProfile: 'ดูโปรไฟล์และประกาศทั้งหมด →', verified: 'ยืนยันแล้ว', alsoOn: 'มีบน', verifiedOn: 'ยืนยันบน',
    alsoListed: 'ลงประกาศบน', attachAgent: 'แสดงโปรไฟล์เอเจนต์ของฉันในประกาศนี้', none: '— ไม่มี —', listingLinks: 'ทรัพย์นี้บนเว็บไซต์อื่น (ไม่บังคับ)',
    activeListings: 'ประกาศที่ใช้งาน {n} รายการ', share: 'คัดลอกลิงก์', copied: 'คัดลอกแล้ว', agentsTitle: 'เอเจนต์และเอเจนซี', otherAdvertisers: 'ผู้ลงประกาศอื่น ๆ',
    call: 'โทร', message: 'ข้อความ',
  },
};

// Well-known sites: recognised from the link's address, shown with their own colour.
export const SITES = [
  { k: 'booking', n: 'Booking.com', h: ['booking.com'], c: '#003580', a: 'B.' },
  { k: 'agoda', n: 'Agoda', h: ['agoda.com'], c: '#5542F6', a: 'a' },
  { k: 'trip', n: 'Trip.com', h: ['trip.com'], c: '#287DFA', a: 'T' },
  { k: 'airbnb', n: 'Airbnb', h: ['airbnb.'], c: '#FF385C', a: '◇' },
  { k: 'expedia', n: 'Expedia', h: ['expedia.'], c: '#1E243A', a: 'E' },
  { k: 'hotels', n: 'Hotels.com', h: ['hotels.com'], c: '#D32F2F', a: 'H' },
  { k: 'tripadvisor', n: 'Tripadvisor', h: ['tripadvisor.'], c: '#00AA6C', a: '◉' },
  { k: 'gmaps', n: 'Google Maps', h: ['maps.google.', 'google.com/maps', 'maps.app.goo.gl', 'goo.gl/maps', 'g.page'], c: '#34A853', a: '⌖' },
  { k: 'khmer24', n: 'Khmer24', h: ['khmer24.'], c: '#E31E24', a: 'K' },
  { k: 'realestate', n: 'Realestate.com.kh', h: ['realestate.com.kh'], c: '#1C4E9D', a: 'R' },
  { k: 'facebook', n: 'Facebook', h: ['facebook.com', 'fb.com', 'fb.me'], c: '#1877F2', a: 'f' },
  { k: 'instagram', n: 'Instagram', h: ['instagram.com'], c: '#E4405F', a: '◎' },
  { k: 'tiktok', n: 'TikTok', h: ['tiktok.com'], c: '#111111', a: '♪' },
  { k: 'youtube', n: 'YouTube', h: ['youtube.com', 'youtu.be'], c: '#FF0000', a: '▶' },
  { k: 'linkedin', n: 'LinkedIn', h: ['linkedin.com'], c: '#0A66C2', a: 'in' },
  { k: 'telegram', n: 'Telegram', h: ['t.me', 'telegram.me'], c: '#229ED9', a: '✈' },
];
const WEB = { k: 'web', n: 'Website', c: '#475569', a: '⌂' };
const PROFILE_FIELDS = ['booking', 'agoda', 'trip', 'airbnb', 'gmaps', 'facebook', 'instagram', 'tiktok', 'youtube', 'khmer24', 'realestate', 'web', 'other1'];
const LISTING_FIELDS = ['booking', 'agoda', 'trip', 'airbnb', 'expedia', 'gmaps', 'other1', 'other2'];
const PH = {
  booking: 'https://www.booking.com/hotel/kh/…', agoda: 'https://www.agoda.com/…', trip: 'https://www.trip.com/hotels/…',
  airbnb: 'https://www.airbnb.com/rooms/…', expedia: 'https://www.expedia.com/…', gmaps: 'https://maps.app.goo.gl/…',
  facebook: 'https://www.facebook.com/…', instagram: 'https://www.instagram.com/…', tiktok: 'https://www.tiktok.com/@…',
  youtube: 'https://www.youtube.com/@…', khmer24: 'https://www.khmer24.com/…', realestate: 'https://www.realestate.com.kh/…',
  web: 'https://…', other1: 'https://…', other2: 'https://…',
};
const LANG_OPTS = ['Khmer', 'English', 'Chinese', 'French', 'Thai', 'Vietnamese', 'Korean', 'Japanese', 'Russian'];

let C = null; // context from app.js
const tx = (k, v) => { let s = (TX[C.lang()] && TX[C.lang()][k]) ?? TX.en[k] ?? k; if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]); return s; };

export function siteOf(url) {
  let u; try { u = new URL(url); } catch { return WEB; }
  const s = (u.hostname.replace(/^www\./, '') + u.pathname).toLowerCase();
  return SITES.find(x => x.h.some(h => s.startsWith(h) || s.includes('.' + h) || (h.includes('/') && s.includes(h)))) || WEB;
}
const okUrl = v => /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$|\?|#)/i.test(v) && !/^https:\/\/([a-z0-9-]+\.)*yourhome\.asia/i.test(v);
const fieldSite = k => SITES.find(s => s.k === k) || (k === 'web' ? WEB : { k, n: tx('other'), c: WEB.c, a: '+' });
const slugify = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);

// Link pills. mode: 'also' (Also on X), 'verified' (Verified on X), 'plain' (X)
export function pills(links, mode = 'also') {
  const L = (links || []).filter(l => l && okUrl(l.url));
  if (!L.length) return '';
  return `<div class="xl-row">${L.map(l => { const s = siteOf(l.url); const name = s === WEB ? (l.name && l.name !== 'Website' ? l.name : new URL(l.url).hostname.replace(/^www\./, '')) : s.n;
    const pre = mode === 'verified' ? '✓ ' + tx('verifiedOn') + ' ' : mode === 'also' ? tx('alsoOn') + ' ' : '';
    return `<a class="xl" style="--c:${s.c}" href="${C.esc(l.url)}" target="_blank" rel="nofollow ugc noopener"><i>${C.esc(s.a)}</i>${C.esc(pre + name)}</a>`; }).join('')}</div>`;
}
function linkInputs(keys, links, prefix) {
  const used = new Set(); const val = {};
  // put saved links into the matching field, the rest into the free fields
  (links || []).forEach(l => { const s = siteOf(l.url); const k = keys.find(k => k === s.k && !used.has(k)); if (k) { used.add(k); val[k] = l.url; } });
  (links || []).forEach(l => { if (Object.values(val).includes(l.url)) return; const k = keys.find(k => /^(other|web)/.test(k) && !used.has(k)); if (k) { used.add(k); val[k] = l.url; } });
  return `<div class="xl-fields">${keys.map(k => { const s = fieldSite(k); return `<label class="xl-f"><span><i style="--c:${s.c}">${C.esc(s.a)}</i>${C.esc(s.n)}</span><input type="url" inputmode="url" name="${prefix}${k}" placeholder="${C.esc(PH[k] || 'https://…')}" value="${C.esc(val[k] || '')}" maxlength="500"></label>`; }).join('')}</div>`;
}
function readLinks(fd, keys, prefix) {
  const out = []; const seen = new Set();
  for (const k of keys) {
    const v = String(fd.get(prefix + k) || '').trim(); if (!v) continue;
    const url = /^https?:\/\//i.test(v) ? v.replace(/^http:/i, 'https:') : 'https://' + v;
    if (!okUrl(url) || seen.has(url)) { C.toast('✗ ' + v); return null; }
    seen.add(url); const s = siteOf(url); out.push({ name: s === WEB ? new URL(url).hostname.replace(/^www\./, '') : s.n, url });
  }
  return out;
}

const avatar = (a, cls = 'ag-av') => a.photo ? `<img class="${cls}" src="${C.esc(a.photo)}" alt="${C.esc(a.name)}" loading="lazy">` : `<span class="${cls} ag-ini">${C.esc((a.name || '?').trim()[0]?.toUpperCase() || '?')}</span>`;
const vBadge = a => a.verified_at ? `<span class="ag-v" title="${C.esc(tx('verified'))}">✓ ${C.esc(tx('verified'))}</span>` : '';
const kindLine = a => C.esc([tx('k_' + a.kind), a.company].filter(Boolean).join(' · '));

export function agentCard(a, n) {
  return `<a class="ag-card" href="#/agent/${C.esc(a.slug)}">${avatar(a)}<div class="ag-ct"><div class="ag-nm">${C.esc(a.name)} ${vBadge(a)}</div>
    <div class="ag-k">${kindLine(a)}</div>${n === null ? '' : `<div class="ag-k">${tx('activeListings', { n: n || 0 })}${a.languages?.length ? ' · ' + C.esc(a.languages.slice(0, 3).join(', ')) : ''}</div>`}</div></a>`;
}

export function init(ctx) { C = ctx; }

// ---------- Public profile page ----------
export async function viewAgent(slug) {
  const app = C.app;
  app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:24px">${C.t('loading')}</div></div>`;
  const { data: a } = await C.sb.from('yh_agents').select('*').eq('slug', String(slug).toLowerCase()).maybeSingle();
  if (!a) { app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:24px">${tx('notFound')}<br><br><a class="btn blue" href="#/experts">${tx('agentsTitle')}</a></div></div>`; return; }
  document.title = `${a.name} — YourHome.asia`;
  const { data: list = [] } = await C.sb.from('yh_listings').select(C.LISTING_COLS).eq('agent_id', a.id).eq('status', 'active')
    .order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(200);
  const tg = C.tgHandle(a.telegram), wa = C.digits(a.whatsapp), ph = C.digits(a.phone);
  app.innerHTML = `<div class="wrap"><a class="back" href="#/experts">← ${tx('agentsTitle')}</a>
    <section class="panel ag-hero">
      ${avatar(a, 'ag-big')}
      <div class="ag-main">
        <h1>${C.esc(a.name)} ${vBadge(a)}</h1>
        <div class="ag-k">${kindLine(a)} · ${tx('activeListings', { n: (list || []).length })}</div>
        ${a.languages?.length ? `<div class="ag-chips">${a.languages.map(x => `<span>${C.esc(x)}</span>`).join('')}</div>` : ''}
        ${a.areas?.length ? `<div class="ag-chips ag-areas">${a.areas.map(x => `<span>📍 ${C.esc(x)}</span>`).join('')}</div>` : ''}
        <div class="ag-contact">
          ${tg ? `<a class="btn tg" href="https://t.me/${tg}" target="_blank" rel="noopener">Telegram</a>` : ''}
          ${wa ? `<a class="btn wa" href="https://wa.me/${wa.replace('+', '')}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
          ${ph ? `<a class="btn blue" href="tel:${ph}">📞 ${tx('call')}</a>` : ''}
          ${a.email ? `<a class="btn ghost" href="mailto:${C.esc(a.email)}">✉ ${tx('message')}</a>` : ''}
          <button class="btn ghost" id="agShare">🔗 ${tx('share')}</button>
        </div>
        ${pills(a.links, 'plain')}
      </div>
    </section>
    ${a.bio ? `<section class="panel"><h3>${tx('bio')}</h3><div class="desc">${C.esc(a.bio)}</div></section>` : ''}
    <div class="bh"><h2>${tx('activeListings', { n: (list || []).length })}</h2></div>
    ${(list || []).length ? `<div class="grid">${list.map(C.card).join('')}</div>` : `<div class="empty">${tx('noListingsYet')}</div>`}
  </div>`;
  document.getElementById('agShare').onclick = async () => { const u = location.origin + '/#/agent/' + a.slug; try { await navigator.clipboard.writeText(u); C.toast(tx('copied')); } catch { prompt('', u); } };
}

// ---------- Agents & agencies list ----------
export async function viewExperts() {
  const app = C.app;
  app.innerHTML = `<div class="wrap"><div class="bh" style="margin-top:26px"><div><h2>⚡ ${tx('agentsTitle')}</h2><div style="color:var(--muted)">${tx('agentsSub')}</div></div>
    <a class="btn red" href="#/account?tab=agent">+ ${tx('createAgent')}</a></div><div id="res"><div class="empty">${C.t('loading')}</div></div></div>`;
  const [{ data: ags = [] }, { data: rows = [] }] = await Promise.all([
    C.sb.from('yh_agents').select('*').eq('country', 'KH').limit(1000),
    C.sb.from('yh_listings').select('owner_id,agent_id,contact_name,contact_telegram').eq('status', 'active').limit(3000),
  ]);
  const cnt = {}; (rows || []).forEach(r => { if (r.agent_id) cnt[r.agent_id] = (cnt[r.agent_id] || 0) + 1; });
  const list = (ags || []).sort((x, y) => (!!y.verified_at - !!x.verified_at) || ((cnt[y.id] || 0) - (cnt[x.id] || 0)));
  const withProfile = new Set((ags || []).map(a => a.owner_id));
  const g = {}; (rows || []).forEach(r => { if (!r.owner_id || withProfile.has(r.owner_id)) return; const x = g[r.owner_id] ||= { n: 0, name: r.contact_name, tg: r.contact_telegram }; x.n++; if (!x.name && r.contact_name) x.name = r.contact_name; });
  const others = Object.entries(g).sort((a, b) => b[1].n - a[1].n);
  const res = document.getElementById('res');
  res.innerHTML = (list.length ? `<div class="ag-grid">${list.map(a => agentCard(a, cnt[a.id])).join('')}</div>` : `<div class="empty">${tx('needAgentFirst')}<br><br><a class="btn red" href="#/account?tab=agent">+ ${tx('createAgent')}</a></div>`)
    + (others.length ? `<div class="bh" style="margin-top:30px"><h2>${tx('otherAdvertisers')}</h2></div><div class="grid">${others.map(([id, x]) => `<a class="exp" href="#/search?owner=${C.esc(id)}" style="text-decoration:none;color:inherit"><div class="av">${C.esc((x.name || '?').trim()[0]?.toUpperCase() || '?')}</div><div><div style="font-weight:800">${C.esc(x.name || 'YourHome')}</div><div style="color:var(--muted);font-size:13px">${C.t('listingsCount', { n: x.n })}${C.tgHandle(x.tg) ? ' · @' + C.esc(C.tgHandle(x.tg)) : ''}</div></div></a>`).join('')}</div>` : '');
}

// ---------- Listing page extras ----------
export async function listingExtras(l) {
  const box = document.getElementById('agBox'), lb = document.getElementById('agLinks');
  let a = null;
  if (l.agent_id) { const { data } = await C.sb.from('yh_agents').select('*').eq('id', l.agent_id).maybeSingle(); a = data; }
  if (box && a) box.innerHTML = `<div class="panel ag-on"><div class="ag-lab">${tx('listedBy')}</div>${agentCard(a, null)}
    <a class="ag-more" href="#/agent/${C.esc(a.slug)}">${tx('seeProfile')}</a></div>`;
  if (lb && (l.external_links || []).length) {
    const v = !!(a && a.verified_at);
    lb.innerHTML = `<div class="panel"><h3>${tx('alsoListed')}</h3>${pills(l.external_links, v ? 'verified' : 'also')}<p class="xl-note">${v ? tx('linksNoteV') : tx('linksNote')}</p></div>`;
  }
}

// ---------- Post / edit form block ----------
export async function postBlock(l, isNew) {
  const user = C.user(); if (!user) return '';
  const { data: mine = [] } = await C.sb.from('yh_agents').select('id,name,slug').eq('owner_id', user.id).order('created_at');
  const cur = l.agent_id || (isNew && mine.length === 1 ? mine[0].id : '');
  return `<fieldset class="ag-fs"><legend>${tx('agentProfile')}</legend>
    ${mine.length ? `<label>${tx('attachAgent')}<select name="agent_id"><option value="">${tx('none')}</option>${mine.map(a => `<option value="${a.id}" ${cur === a.id ? 'selected' : ''}>${C.esc(a.name)}</option>`).join('')}</select></label>`
      : `<p class="xl-note">${tx('needAgentFirst')} <a href="#/account?tab=agent">${tx('createAgent')} →</a></p>`}
    <div class="ag-sub">${tx('listingLinks')}</div><p class="xl-note" style="margin-top:0">${tx('listingLinksSub')}</p>
    ${linkInputs(LISTING_FIELDS, l.external_links, 'xl_')}
  </fieldset>`;
}
export function postValues(form) {
  const fd = new FormData(form);
  const links = readLinks(fd, LISTING_FIELDS, 'xl_'); if (links === null) return null;
  const out = { external_links: links };
  if (form.querySelector('[name="agent_id"]')) out.agent_id = fd.get('agent_id') || null;
  return out;
}

// ---------- Dashboard tab ----------
export async function accountTab(el) {
  const user = C.user();
  const edit = C.qs().get('agent');
  const { data: mine = [] } = await C.sb.from('yh_agents').select('*').eq('owner_id', user.id).order('created_at');
  const { data: rows = [] } = mine.length ? await C.sb.from('yh_listings').select('agent_id').in('agent_id', mine.map(a => a.id)).eq('status', 'active') : { data: [] };
  const cnt = {}; (rows || []).forEach(r => cnt[r.agent_id] = (cnt[r.agent_id] || 0) + 1);
  if (!mine.length || edit) {
    const a = mine.find(x => x.id === edit) || { kind: 'agent', languages: [], areas: [], links: [], name: user.user_metadata?.full_name || '' };
    return form(el, a, mine.length > 0);
  }
  el.innerHTML = `<div class="ag-grid">${mine.map(a => `<div class="panel ag-mine">${agentCard(a, cnt[a.id])}
      <div class="ag-btns"><a class="btn blue sm" href="#/agent/${C.esc(a.slug)}">${tx('viewPage')}</a><a class="btn ghost sm" href="#/account?tab=agent&agent=${a.id}">${tx('editAgent')}</a></div></div>`).join('')}</div>
    <a class="btn ghost" href="#/account?tab=agent&agent=new" style="margin-top:14px">${tx('addAgent')}</a>`;
}
function form(el, a, hasOthers) {
  const user = C.user();
  let photo = a.photo || '';
  const chk = (name, opts, cur) => `<div class="ag-pick">${opts.map(o => `<label><input type="checkbox" name="${name}" value="${C.esc(o)}" ${cur.includes(o) ? 'checked' : ''}><span>${C.esc(o)}</span></label>`).join('')}</div>`;
  el.innerHTML = `<form class="panel form ag-form" id="agForm" style="max-width:820px">
    <h3>${a.id ? tx('editAgent') : tx('createAgent')}</h3><p class="xl-note" style="margin-top:0">${tx('agentSub')}</p>
    <div class="ag-photo"><div id="agPh">${avatar({ ...a, photo }, 'ag-big')}</div><label class="btn ghost sm">${tx('photo')}<input type="file" id="agFile" accept="image/jpeg,image/png,image/webp" hidden></label></div>
    <div class="row"><label>${tx('fullName')} *<input name="name" required minlength="2" maxlength="80" value="${C.esc(a.name || '')}"></label>
      <label>${tx('kind')}<select name="kind">${['agent', 'agency', 'owner'].map(k => `<option value="${k}" ${a.kind === k ? 'selected' : ''}>${tx('k_' + k)}</option>`).join('')}</select></label></div>
    <div class="row"><label>${tx('company')}<input name="company" maxlength="100" value="${C.esc(a.company || '')}"></label>
      <label>${tx('pageAddr')}<div class="ag-slug"><span>yourhome.asia/#/agent/</span><input name="slug" maxlength="60" value="${C.esc(a.slug || '')}" placeholder="your-name"></div></label></div>
    <label>${tx('bio')}<textarea name="bio" maxlength="3000" placeholder="${C.esc(tx('bioPh'))}">${C.esc(a.bio || '')}</textarea></label>
    <label>${tx('languages')}${chk('languages', LANG_OPTS, a.languages || [])}</label>
    <label>${tx('areas')}${chk('areas', C.DISTRICTS, a.areas || [])}</label>
    <div class="ag-sub">${tx('contacts')}</div>
    <div class="row"><label>${C.t('phone')}<input name="phone" maxlength="30" value="${C.esc(a.phone || '')}" placeholder="+855 …"></label>
      <label>${C.t('telegram')}<input name="telegram" maxlength="40" value="${C.esc(a.telegram || '')}" placeholder="@username"></label></div>
    <div class="row"><label>${C.t('whatsapp')}<input name="whatsapp" maxlength="30" value="${C.esc(a.whatsapp || '')}" placeholder="+855 …"></label>
      <label>${tx('email')}<input name="email" type="email" maxlength="120" value="${C.esc(a.email || '')}"></label></div>
    <div class="ag-sub">${tx('otherSites')}</div><p class="xl-note" style="margin-top:0">${tx('otherSitesSub')}</p>
    ${linkInputs(PROFILE_FIELDS, a.links, 'al_')}
    <div class="ag-btns"><button class="btn red" id="agSave">${tx('saveProfile')}</button>
      ${hasOthers || a.id ? `<a class="btn ghost" href="#/account?tab=agent">${C.t('cancel')}</a>` : ''}
      ${a.id ? `<button type="button" class="btn ghost" id="agDel">${tx('delProfile')}</button>` : ''}</div>
  </form>`;
  const f = document.getElementById('agForm');
  f.name.addEventListener('input', () => { if (!a.slug && !f.slug.dataset.touched) f.slug.value = slugify(f.name.value); });
  f.slug.addEventListener('input', () => { f.slug.dataset.touched = 1; });
  if (!a.slug) f.slug.value = slugify(f.name.value);
  document.getElementById('agFile').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) return C.toast('> 5 MB');
    const ext = (file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const path = `${user.id}/agent-${Date.now()}.${ext}`;
    const { error } = await C.sb.storage.from('yh-photos').upload(path, file, { contentType: file.type, cacheControl: '31536000' });
    if (error) return C.toast(C.t('error') + error.message);
    photo = C.sb.storage.from('yh-photos').getPublicUrl(path).data.publicUrl;
    document.getElementById('agPh').innerHTML = avatar({ ...a, photo }, 'ag-big');
  };
  const del = document.getElementById('agDel');
  if (del) del.onclick = async () => { if (!confirm(tx('confirmDelProfile'))) return; const { error } = await C.sb.from('yh_agents').delete().eq('id', a.id); if (error) return C.toast(C.t('error') + error.message); C.go('#/account?tab=agent'); };
  f.onsubmit = async e => {
    e.preventDefault(); const fd = new FormData(f);
    const links = readLinks(fd, PROFILE_FIELDS, 'al_'); if (links === null) return;
    let slug = slugify(fd.get('slug') || fd.get('name')); if (slug.length < 3) slug = (slug + '-agent').replace(/^-/, '');
    const row = {
      name: fd.get('name').trim(), kind: fd.get('kind'), company: fd.get('company').trim() || null, slug, photo: photo || null,
      bio: fd.get('bio').trim() || null, languages: fd.getAll('languages'), areas: fd.getAll('areas'),
      phone: fd.get('phone').trim() || null, telegram: fd.get('telegram').trim() || null, whatsapp: fd.get('whatsapp').trim() || null,
      email: fd.get('email').trim() || null, links,
    };
    const btn = document.getElementById('agSave'); btn.disabled = true;
    let res = a.id ? await C.sb.from('yh_agents').update(row).eq('id', a.id).select('slug').single() : await C.sb.from('yh_agents').insert(row).select('slug').single();
    if (res.error && /duplicate|unique/i.test(res.error.message) && !f.slug.dataset.touched) {
      row.slug = (slug.slice(0, 52) + '-' + Math.random().toString(36).slice(2, 6));
      res = a.id ? await C.sb.from('yh_agents').update(row).eq('id', a.id).select('slug').single() : await C.sb.from('yh_agents').insert(row).select('slug').single();
    }
    btn.disabled = false;
    if (res.error) return C.toast(/duplicate|unique/i.test(res.error.message) ? tx('slugTaken') : C.t('error') + res.error.message, 5000);
    C.toast(tx('profileSaved')); C.go('#/agent/' + res.data.slug);
  };
}

export const label = k => tx(k);
