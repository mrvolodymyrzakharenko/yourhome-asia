// Listing popup = the Study portal's apartment popup (owner, 2026-11-24: "ha ingatlanra kattintok ez jöjjön be"):
// gallery left (blurred backdrop, arrows, dots, date), details right (scroll) with a fixed price bar, close button and
// share column. Opened by a click on any listing card; #/l/<id> links open it over the homepage.
let C = null, dlg = null, cur = null, photo = 0, pushed = false, lastFocus = null;
const I = {
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1"/></svg>',
  tg: '<svg viewBox="0 0 24 24"><path d="M21 3.5L2.8 10.6l6.4 2.3L19 6.4l-7.6 8 .2 5.8 3.3-3.6 4 3z" stroke-linejoin="round"/></svg>',
  fb: '<svg viewBox="0 0 24 24" class="fill"><path d="M13.5 21v-7.6H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H8v3h2.5V21z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" class="fill"><path d="M12 3.5c-4.7 0-8.5 3.4-8.5 7.7 0 2.2 1 4.2 2.7 5.6l-.7 3.7 3.8-2c.9.3 1.8.4 2.7.4 4.7 0 8.5-3.4 8.5-7.7S16.7 3.5 12 3.5z"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" stroke-linejoin="round"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
  bed: '<svg viewBox="0 0 24 24"><path d="M3 7v12M21 19v-6a2 2 0 0 0-2-2H3M3 16h18M7 11V9h5v2"/></svg>',
  bath: '<svg viewBox="0 0 24 24"><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM6 12V6a2 2 0 0 1 3.6-1.2M7 19l-1 2M17 19l1 2"/></svg>',
  area: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/></svg>',
};
const day = d => { const x = new Date(d); return isNaN(x) ? '' : x.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
const link = l => location.origin + YH.listingPath(l);   // clean URL (router.js)

export function init(ctx) {
  C = ctx;
  // any listing card opens the popup instead of leaving the page
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.target.closest('[data-save]')) return;
    const a = e.target.closest('a[href^="#/l/"],a[href^="/listing/"]'); if (!a || (dlg && dlg.contains(a))) return;
    e.preventDefault(); open(YH.toHash(a.getAttribute('href').replace(/^#/, '').split('?')[0]).slice(4), true);
  });
  window.addEventListener('popstate', () => { if (dlg && !dlg.hidden && !/^#\/l\//.test(YH.h())) { C.skipRoute(); shut(); pushed = false; } });
}
export const isOpen = () => !!(dlg && !dlg.hidden);
export const hide = () => shut();

function build() {
  const t = C.t;
  dlg = document.createElement('div');
  dlg.className = 'apm'; dlg.hidden = true;
  dlg.innerHTML = `<div class="apm-back" data-apm="close"></div>
  <div class="apm-box" role="dialog" aria-modal="true" aria-labelledby="apm-title">
    <div class="apm-gal"><div class="apm-blur"></div><img class="apm-img" alt=""><span class="apm-date"></span>
      <button type="button" class="apm-nav apm-prev" data-apm="prev" aria-label="Previous photo">${I.prev}</button>
      <button type="button" class="apm-nav apm-next" data-apm="next" aria-label="Next photo">${I.next}</button>
      <div class="apm-dots"></div></div>
    <div class="apm-side">
      <div class="apm-scroll"></div>
      <div class="apm-bar"><div><small class="apm-pl"></small><b class="apm-price"></b></div><div class="apm-acts"><a class="apm-tgo" hidden target="_blank" rel="noopener noreferrer">${I.tg}<span>Telegram</span></a><button type="button" class="apm-contact" data-apm="contact"></button></div></div>
      <button type="button" class="apm-close" data-apm="close" aria-label="Close">${I.close}</button>
      <div class="apm-tools" role="group" aria-label="Share">
        <button type="button" data-apm="share" aria-label="Share" title="Share">${I.share}</button>
        <button type="button" data-apm="tg" aria-label="Telegram" title="Telegram">${I.tg}</button>
        <button type="button" data-apm="fb" aria-label="Facebook" title="Facebook">${I.fb}</button>
        <button type="button" data-apm="wa" aria-label="WhatsApp" title="WhatsApp">${I.chat}</button>
        <button type="button" data-apm="copy" aria-label="Copy link" title="Copy link">${I.copy}</button>
        <button type="button" data-apm="save" aria-pressed="false" aria-label="Save" title="Save">${I.heart}</button>
      </div>
      <p class="apm-toast" role="status" aria-live="polite"></p>
    </div>
  </div>`;
  document.body.appendChild(dlg);
  dlg.addEventListener('click', onClick);
  const g = dlg.querySelector('.apm-gal'); let x0 = null;
  g.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  g.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); });
  document.addEventListener('keydown', e => {
    if (!dlg || dlg.hidden) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1);
  });
}

function showPhoto() {
  const l = cur, ph = l.photos || [], n = ph.length, src = n ? ph[photo] : '';
  const img = dlg.querySelector('.apm-img'), bl = dlg.querySelector('.apm-blur');
  img.classList.remove('in'); bl.classList.remove('in'); void img.offsetWidth;
  if (src) {
    img.hidden = false; img.alt = l.title + ' – ' + (photo + 1) + '/' + n;
    const shown = () => { if (img.getAttribute('src') === src) { img.classList.add('in'); bl.classList.add('in'); } };
    img.onload = shown; img.onerror = shown; img.src = src; if (img.complete && img.naturalWidth) requestAnimationFrame(shown);
  } else { img.hidden = true; img.removeAttribute('src'); }
  bl.style.backgroundImage = src ? 'url("' + src.replace(/"/g, '%22') + '")' : 'none';
  dlg.querySelector('.apm-gal').classList.toggle('apm-empty', !n);
  dlg.querySelector('.apm-gal').dataset.empty = C.t('photosSoon');
  dlg.querySelectorAll('.apm-nav').forEach(b => { b.hidden = n < 2; });
  dlg.querySelector('.apm-dots').innerHTML = n > 1 ? ph.map((_, i) => `<button type="button" data-apm="dot" data-i="${i}" aria-label="${i + 1}"${i === photo ? ' aria-current="true"' : ''}></button>`).join('') : '';
  if (n > 1) { const nx = new Image(); nx.src = ph[(photo + 1) % n]; }
}
function go(d) { const n = (cur?.photos || []).length; if (n < 2) return; photo = (photo + d + n) % n; showPhoto(); }

export async function open(id, push) {
  if (!dlg) build();
  const { t, esc } = C;
  const { data: l, error } = await C.sb.from('yh_listings').select('*').eq('id', id).maybeSingle();
  if (error || !l) { C.toast('404'); return; }
  cur = l; photo = 0; lastFocus = document.activeElement;
  C.track(l, 'view');
  const wa = C.digits(l.contact_whatsapp), ph = C.digits(l.contact_phone);
  // Telegram: the advertiser's @username, else their number (t.me/+855… opens the chat by phone number)
  const tgName = C.tgHandle(l.contact_telegram), tgNum = (wa || ph || '').replace('+', '');
  const tg = tgName || (tgNum ? '+' + tgNum : null);
  dlg.querySelector('.apm-date').textContent = day(l.created_at);
  dlg.querySelector('.apm-scroll').innerHTML = `
    <div class="apm-tags">${l.is_featured ? `<span class="tag top">${t('top')}</span>` : ''}${l.is_demo ? `<span class="tag demo">${t('demo')}</span>` : ''}<span class="tag apm-kind">${esc(t(l.deal_type === 'sale' ? 'buy' : l.deal_type))} · ${esc(t('t_' + l.property_type))}</span></div>
    <h2 id="apm-title" class="apm-title">${esc(l.title)}</h2>
    <p class="apm-loc">${I.pin}<span><b>${esc([l.district, !l.city || l.city === 'Phnom Penh' ? t('cityPP') : l.city].filter(Boolean).join(', '))}</b><small>${esc(l.address || t('exactAddr'))}</small></span></p>
    <div class="apm-stats">
      <div><span>${I.bed}</span><small>${esc(t('bedrooms'))}</small><b>${l.bedrooms === 0 ? esc(t('studio')) : (l.bedrooms ?? '–')}</b></div>
      <div><span>${I.bath}</span><small>${esc(t('bathrooms'))}</small><b>${l.bathrooms ?? '–'}</b></div>
      <div><span>${I.area}</span><small>${esc(t('area').replace(/ m²$/, ''))}</small><b>${l.area_m2 ? Math.round(l.area_m2) + ' m²' : '–'}</b></div>
    </div>
    <h3 class="apm-h">${esc(t('description'))}</h3><div class="apm-desc">${esc(l.description || t('noDesc'))}</div>
    <div class="apm-am">${C.facts(l)}</div>
    ${C.addrRows ? C.addrRows(l) : ''}
    <div id="agLinks" class="apm-ag"></div>
    <div class="apm-safe"><b>${esc(t('staySafe'))}</b><span>${esc(t('staySafeTxt'))}</span></div>
    <div class="apm-con" id="apmContact">
      <h3 class="apm-h">${esc(t('contactOwner'))}</h3>
      <div id="agBox" class="apm-ag"></div>
      ${l.contact_name ? `<p class="apm-cname">${esc(l.contact_name)}</p>` : ''}
      <div class="apm-cbtn">
        ${tg ? `<a class="btn tg" data-ev="telegram" href="https://t.me/${tg}" target="_blank" rel="noopener">Telegram</a>` : ''}
        ${wa ? `<a class="btn wa" data-ev="whatsapp" href="https://wa.me/${wa.replace('+', '')}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
        ${ph ? `<a class="btn blue" data-ev="phone" href="tel:${ph}" title="${esc(l.contact_phone)}">📞 ${esc(t('call'))}</a>` : ''}
      </div>
      <form class="form apm-inq" id="apmInq"><b>${esc(t('sendMsg'))}</b>
        <input name="name" placeholder="${esc(t('yourName'))}" required maxlength="100">
        <input name="contact" placeholder="${esc(t('yourContact'))}" required maxlength="150">
        <textarea name="message" placeholder="${esc(t('message'))}" maxlength="2000"></textarea>
        <button class="btn red">${esc(t('send'))}</button></form>
    </div>
    <small class="apm-id">${esc(t('listingNo'))} ${esc(String(l.id).slice(0, 8).toUpperCase())}</small>`;
  dlg.querySelector('.apm-pl').textContent = t('priceL');
  dlg.querySelector('.apm-price').textContent = C.money(l.price) + C.priceSuffix(l);
  dlg.querySelector('.apm-contact').textContent = t('contactBtn');
  const tgo = dlg.querySelector('.apm-tgo'); tgo.hidden = !tg; if (tg) tgo.href = 'https://t.me/' + tg;
  dlg.querySelector('[data-apm=save]').setAttribute('aria-pressed', C.isSaved(l.id));
  dlg.querySelectorAll('[data-ev]').forEach(a => a.addEventListener('click', () => C.track(l, a.dataset.ev)));
  tgo.onclick = () => C.track(l, 'telegram');
  dlg.querySelector('#apmInq').onsubmit = async e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); const btn = e.target.querySelector('button'); btn.disabled = true;
    const { error: er } = await C.sb.from('yh_inquiries').insert({ listing_id: l.id, name: f.name.trim(), contact: f.contact.trim(), message: f.message.trim() || null });
    btn.disabled = false;
    if (er) return toast(t('error') + er.message);
    e.target.reset(); toast(t('sent'));
  };
  C.listingExtras(l);
  dlg.querySelector('.apm-scroll').scrollTop = 0;
  showPhoto();
  if (push) document.title = `${l.title} — YourHome.asia`;   // a direct visit keeps the server's SEO title
  if (push) { history.pushState({ yhPop: 1 }, '', YH.listingPath(l)); pushed = true; } else pushed = false;
  dlg.hidden = false; document.documentElement.classList.add('apm-on');
  requestAnimationFrame(() => { dlg.classList.add('open'); dlg.querySelector('.apm-close').focus({ preventScroll: true }); });
}
function shut() {
  if (!dlg || dlg.hidden) return;
  dlg.classList.remove('open'); document.documentElement.classList.remove('apm-on');
  setTimeout(() => { if (!dlg.classList.contains('open')) dlg.hidden = true; }, 520);
  cur = null; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}
export function close() {
  if (!dlg || dlg.hidden) return;
  if (pushed) { history.back(); return; }            // popstate closes it
  shut(); C.skipRoute(); history.replaceState(null, '', '/'); if (!document.querySelector('.hero')) C.route();
}
function toast(s) { const el = dlg.querySelector('.apm-toast'); el.textContent = s; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2200); }
function copy(u) {
  const done = () => toast(C.t('linkCopied'));
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done, () => prompt('', u)); else prompt('', u);
}
const pop = u => window.open(u, '_blank', 'noopener,noreferrer,width=640,height=640');
function onClick(e) {
  const b = e.target.closest('[data-apm]'); if (!b || !cur) return;
  const act = b.dataset.apm, u = link(cur), text = cur.title + ' – ' + C.money(cur.price) + C.priceSuffix(cur);
  if (act === 'close') close();
  else if (act === 'prev') go(-1);
  else if (act === 'next') go(1);
  else if (act === 'dot') { photo = +b.dataset.i; showPhoto(); }
  else if (act === 'share') { if (navigator.share) navigator.share({ title: cur.title, text, url: u }).catch(() => {}); else copy(u); }
  else if (act === 'tg') pop('https://t.me/share/url?url=' + encodeURIComponent(u) + '&text=' + encodeURIComponent(text));
  else if (act === 'fb') pop('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(u));
  else if (act === 'wa') pop('https://wa.me/?text=' + encodeURIComponent(text + ' ' + u));
  else if (act === 'copy') copy(u);
  else if (act === 'save') { const on = C.toggleSave(cur.id); b.setAttribute('aria-pressed', on); toast(on ? C.t('saved') + ' ♥' : C.t('unsaved')); }
  else if (act === 'contact') { const s = dlg.querySelector('.apm-scroll'), c = dlg.querySelector('#apmContact'); s.scrollTo({ top: c.offsetTop - 20, behavior: 'smooth' }); }
}
