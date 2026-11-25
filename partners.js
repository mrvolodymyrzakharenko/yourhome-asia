// Partner programme (#/partners) + New projects (#/projects, #/project/<slug>) – owner, 2026-11-24.
// Port of the Study and Work portal's For Partners page (partner-program.html + partners.css) for a property portal.
// Applications -> yh_partner_requests, project questions -> yh_project_leads (insert only, RLS). Projects: yh_projects
// (added by our team; is_demo = sample). Wired from app.js with PT.init(ctx).
let C = null;
export function init(ctx) { C = ctx; }
const U = (id, w = 480, h = 360) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=75`;
const IMG = (id, alt, w = 480, h = 360) => `<img src="${U(id, w, h)}" srcset="${U(id, w, h)} ${w}w, ${U(id, w * 2, h * 2)} ${w * 2}w" sizes="(max-width:600px) 92vw, 260px" alt="${alt}" loading="lazy" decoding="async" width="${w}" height="${h}">`;
const S = p => `<svg class="pi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  arrow: S('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  agent: S('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.7.8 2.7 2.5 3 5.2"/>'),
  home: S('<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>'),
  crane: S('<path d="M4 21V5l6-2 10 4M10 3v18M4 9h16M17 9v4M15 13h4v3h-4zM2 21h12"/>'),
  hotel: S('<path d="M3 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M15 9h4a2 2 0 0 1 2 2v10M7 7h2M7 11h2M7 15h2M11 7h0M11 11h0M2 21h20"/>'),
  key: S('<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/>'),
  scale: S('<path d="M12 3v18M6 21h12M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0zM12 3l-2 2h4z"/>'),
  truck: S('<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>'),
  broom: S('<path d="M19 3 11 11M8 11h6l-1 4H7zM7 15l-3 6M10 15l-1 6M13 15l1 6"/>'),
  sofa: S('<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 11a2 2 0 0 1 2 2v2h14v-2a2 2 0 1 1 3 1.7V18H2v-3.3A2 2 0 0 1 3 11zM5 18v2M19 18v2"/>'),
  tools: S('<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8M3 21l6-6M7.5 4.5 4.5 7.5l3 3 3-3z"/>'),
  snow: S('<path d="M12 2v20M4.9 6l14.2 12M4.9 18 19.1 6M9 3l3 3 3-3M9 21l3-3 3 3"/>'),
  bug: S('<path d="M8 8a4 4 0 0 1 8 0M7 9h10v5a5 5 0 0 1-10 0zM12 9v10M3 13h4M17 13h4M4 7l3 2M20 7l-3 2M4 19l3-2M20 19l-3-2"/>'),
  search: S('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6M8 11h6M11 8v6"/>'),
  bank: S('<path d="M3 9.5 12 4l9 5.5zM5 10.5v7M9.7 10.5v7M14.3 10.5v7M19 10.5v7M3 20h18"/>'),
  shield: S('<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6z"/>'),
  camera: S('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
  wifi: S('<path d="M3 9.5a13 13 0 0 1 18 0M6 13a8.5 8.5 0 0 1 12 0M9 16.4a4 4 0 0 1 6 0M12 20h0"/>'),
  lock: S('<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>'),
  globe: S('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 3.9 5.7 3.9 9s-1.3 6.3-3.9 9c-2.6-2.7-3.9-5.7-3.9-9S9.4 5.7 12 3z"/>'),
  doc: S('<path d="M7 3h7l4.5 4.5V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM14 3v5h5M9 13h6M9 17h4"/>'),
  check: S('<circle cx="12" cy="12" r="8.5"/><path d="m8.3 12.2 2.5 2.5 5-5"/>'),
  user: S('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.4-4 4.4-6 8-6s6.6 2 8 6"/>'),
  hshake: S('<path d="m11 17 2 2a1.5 1.5 0 0 0 2-2M14 14l2.5 2.5a1.5 1.5 0 0 0 2-2l-3.9-3.9a2 2 0 0 0-2.8 0l-.9.9a1.5 1.5 0 0 1-2-2L11.6 7a3.5 3.5 0 0 1 4.3-.5l.6.4a2 2 0 0 0 1.5.3L21 6.5M21 3v9h-2M3 3v9h2l5 5a1.5 1.5 0 0 0 2-2"/>'),
  star: S('<path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z"/>'),
  growth: S('<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>'),
  pin: S('<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.6"/>'),
  phone: S('<path d="M5 3h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 7.1 7.1l1.4-2.3L21 15.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>'),
  tg: S('<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/>'),
  build: S('<path d="M4 21V4h10v17M14 9h6v12M7 8h4M7 12h4M7 16h4M17 13h0M17 17h0M2 21h20"/>'),
  cal: S('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>'),
  layers: S('<path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5"/>'),
};
// Who can partner – the main partner kinds (photo cards, like the Study portal's six)
const WHO = [
  ['agents', 'Real Estate Agents & Agencies', '1714974528703-e5ad41abc259', 'Agent and client talking at a table with a laptop', I.agent],
  ['owners', 'Property Owners & Landlords', '1746517757473-7c88850e539b', 'Bright, modern apartment living room', I.home],
  ['developers', 'Developers & New Projects', '1741156386380-0236c72eb6f9', 'A modern apartment building', I.crane],
  ['stays', 'Hotels, Guesthouses & Short Stays', '1685127855461-bb81749e9dd9', 'A bright furnished apartment', I.hotel],
  ['management', 'Property Management', '1758519288948-e3c87d2d78d8', 'Manager and client going through documents', I.key],
  ['legal', 'Legal, Notary & Title Services', '1450101499163-c8848c66ca85', 'A contract and a pen', I.scale],
];
// Every service a property portal can carry (icon cards, always an even number so phones show full rows)
const SERVICES = [
  ['moving', 'Moving & Relocation', 'Packing, moving trucks and relocation help for newcomers.', I.truck],
  ['cleaning', 'Cleaning Services', 'Move-in / move-out, deep and regular cleaning.', I.broom],
  ['interior', 'Interior Design & Furniture', 'Furnishing packages, interior design and furniture rental.', I.sofa],
  ['renovation', 'Renovation & Repairs', 'Builders, handymen, plumbers and painters.', I.tools],
  ['aircon', 'Air-con & Electrical', 'Air-con service, electricians and generators.', I.snow],
  ['pest', 'Pest Control', 'Termite, mosquito and pest treatment.', I.bug],
  ['valuation', 'Valuation & Inspection', 'Property valuation, surveys and pre-purchase checks.', I.search],
  ['finance', 'Mortgage & Banking', 'Home loans, bank accounts and money transfers.', I.bank],
  ['insurance', 'Home & Rental Insurance', 'Property, contents and landlord insurance.', I.shield],
  ['media', 'Photos, Video & 3D Tours', 'Listing photography, drone video and virtual tours.', I.camera],
  ['utilities', 'Internet & Utilities Setup', 'Internet, TV, water and electricity connection.', I.wifi],
  ['security', 'Security & Smart Home', 'Guards, CCTV, smart locks and alarms.', I.lock],
];
const TYPES = [
  ['listing', 'Listing Partner', 'Agents, agencies and owners publish rentals, sales and rooms for free and get leads.', '1600880292203-757bb62b4baf', I.home],
  ['developer', 'Developer Partner', 'Show new projects with a project page, unit types, prices and direct buyer leads.', '1681505531034-8d67054e07f6', I.crane],
  ['service', 'Service Partner', 'Offer moving, cleaning, interior, legal, finance or any other home service.', '1531973576160-7125cd663d86', I.tools],
  ['advertising', 'Advertising Partner', 'TOP placement, homepage banners and featured agent profiles.', '1542744173-8e7e53415bb0', I.star],
  ['representative', 'Country Representative', 'Open YourHome in Vietnam, Indonesia, Thailand or another country.', '1516546453174-5e1098a4b4af', I.globe],
];
const FEATS = [
  ['1681505531034-8d67054e07f6', 'Partners shaking hands over a deal', 'New Clients'],
  ['1516546453174-5e1098a4b4af', 'World map with glasses and travel plans', 'Expats & Locals'],
  ['1498050108023-c5249f4df085', 'Laptop on a desk showing a dashboard', 'Partner Dashboard'],
  ['1542744173-8e7e53415bb0', 'Team reviewing growth figures', 'Business Growth'],
  ['1600880292203-757bb62b4baf', 'Two colleagues working together', 'Long-Term Cooperation'],
  ['1709721821603-8f0f11ce3e0d', 'Laptop on a clean white desk', 'Free Listings'],
];
const STEPS = [['Apply', 'Send your company and contact details.', I.doc], ['Verification', 'Our team checks your business and services.', I.search],
  ['Agreement', 'Choose the cooperation model that suits you.', I.hshake], ['Partner Account', 'Get your dashboard, profile and listings.', I.user],
  ['Start Working', 'Receive leads, publish listings, projects or services.', I.growth]];
const KIND_LABEL = Object.fromEntries([...WHO.map(w => [w[0], w[1]]), ...SERVICES.map(s => [s[0], s[1]]), ...TYPES.map(x => [x[0], x[1]])]);
const LAP = `<svg class="pp-lap" viewBox="0 0 520 330" role="img" aria-label="Partner Dashboard on a laptop">
  <rect x="62" y="8" width="396" height="262" rx="16" fill="#1B1F2A"/>
  <rect x="74" y="20" width="372" height="238" rx="6" fill="#fff"/>
  <rect class="a" x="74" y="20" width="76" height="238" rx="6"/><rect class="a" x="140" y="20" width="10" height="238"/>
  <rect x="84" y="34" width="44" height="6" rx="3" fill="#fff" opacity=".85"/>
  <rect x="82" y="50" width="60" height="14" rx="4" fill="#fff"/>
  <g fill="#fff" opacity=".7"><circle cx="90" cy="82" r="4"/><circle cx="90" cy="102" r="4"/><circle cx="90" cy="122" r="4"/><circle cx="90" cy="142" r="4"/><circle cx="90" cy="162" r="4"/><circle cx="90" cy="182" r="4"/><circle cx="90" cy="202" r="4"/></g>
  <g fill="#fff" opacity=".45"><rect x="100" y="80" width="36" height="4" rx="2"/><rect x="100" y="100" width="30" height="4" rx="2"/><rect x="100" y="120" width="38" height="4" rx="2"/><rect x="100" y="140" width="28" height="4" rx="2"/><rect x="100" y="160" width="34" height="4" rx="2"/><rect x="100" y="180" width="30" height="4" rx="2"/><rect x="100" y="200" width="36" height="4" rx="2"/></g>
  <rect x="162" y="32" width="64" height="7" rx="3.5" fill="#D9DEE8"/><circle cx="420" cy="36" r="6" fill="#E6EAF1"/><circle cx="434" cy="36" r="6" fill="#E6EAF1"/>
  <g font-family="Plus Jakarta Sans,Arial,sans-serif" font-size="9" font-weight="700" fill="#14182A">
    <rect x="162" y="50" width="80" height="34" rx="6" fill="#fff" stroke="#E6EAF1"/><rect class="a" x="170" y="59" width="16" height="16" rx="4"/><text x="192" y="65">Leads</text><rect x="192" y="70" width="34" height="5" rx="2.5" fill="#D9DEE8"/>
    <rect x="250" y="50" width="88" height="34" rx="6" fill="#fff" stroke="#E6EAF1"/><rect x="258" y="59" width="16" height="16" rx="4" fill="#22A06B"/><text x="280" y="65">Applicants</text><rect x="280" y="70" width="34" height="5" rx="2.5" fill="#D9DEE8"/>
    <rect x="346" y="50" width="90" height="34" rx="6" fill="#fff" stroke="#E6EAF1"/><rect class="a" x="354" y="59" width="16" height="16" rx="4"/><text x="376" y="65">Applications</text><rect x="376" y="70" width="34" height="5" rx="2.5" fill="#D9DEE8"/>
  </g>
  <rect x="162" y="94" width="176" height="150" rx="6" fill="#fff" stroke="#E6EAF1"/>
  <g stroke="#EEF1F6"><path d="M172 124h156M172 150h156M172 176h156M172 202h156"/></g>
  <path class="as" d="M174 198 194 182 212 188 232 166 252 172 272 146 292 154 314 120 328 112V228H174Z" opacity=".7"/>
  <path class="al" d="M174 198 194 182 212 188 232 166 252 172 272 146 292 154 314 120 328 112" fill="none" stroke-width="2.4" stroke-linejoin="round"/>
  <g class="a"><rect x="178" y="218" width="5" height="10" rx="1"/><rect x="190" y="212" width="5" height="16" rx="1"/><rect x="202" y="220" width="5" height="8" rx="1"/><rect x="214" y="210" width="5" height="18" rx="1"/><rect x="226" y="216" width="5" height="12" rx="1"/><rect x="238" y="206" width="5" height="22" rx="1"/><rect x="250" y="214" width="5" height="14" rx="1"/><rect x="262" y="208" width="5" height="20" rx="1"/><rect x="274" y="218" width="5" height="10" rx="1"/><rect x="286" y="204" width="5" height="24" rx="1"/><rect x="298" y="212" width="5" height="16" rx="1"/><rect x="310" y="206" width="5" height="22" rx="1"/></g>
  <rect x="346" y="94" width="90" height="150" rx="6" fill="#fff" stroke="#E6EAF1"/>
  <g><circle class="a" cx="358" cy="114" r="5"/><rect x="368" y="111" width="56" height="6" rx="3" fill="#D9DEE8"/><circle class="a" cx="358" cy="140" r="5"/><rect x="368" y="137" width="48" height="6" rx="3" fill="#D9DEE8"/><circle class="a" cx="358" cy="166" r="5"/><rect x="368" y="163" width="56" height="6" rx="3" fill="#D9DEE8"/><circle class="a" cx="358" cy="192" r="5"/><rect x="368" y="189" width="44" height="6" rx="3" fill="#D9DEE8"/><circle class="a" cx="358" cy="218" r="5"/><rect x="368" y="215" width="52" height="6" rx="3" fill="#D9DEE8"/></g>
  <path d="M20 282h480l-26 22H46z" fill="#C9CED8"/><path d="M20 282h480v6H20z" fill="#B5BBC7"/><rect x="226" y="284" width="68" height="5" rx="2.5" fill="#9EA5B3"/>
</svg>`;

export function viewPartners() {
  const { app, esc } = C;
  document.title = 'Become a partner — YourHome Cambodia';
  const pre = new URLSearchParams(YH.h().split('?')[1] || '').get('type') || '';
  const opt = (list) => list.map(x => `<option value="${x[0]}"${x[0] === pre ? ' selected' : ''}>${esc(x[1])}</option>`).join('');
  app.innerHTML = `
<section class="pp-hero">
  ${IMG('1681505531034-8d67054e07f6', 'Business partners shaking hands over a deal', 1200, 700)}
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><span>Become a partner</span></nav>
    <p class="pp-k">For Partners</p>
    <h1>Partner With YourHome <em>Cambodia</em></h1>
    <p>Grow your property business with Cambodia's new home portal – rentals, sales, rooms, new projects and every service a home needs.</p>
    <div class="pp-btns">
      <a class="pp-btn pp-btn-p" href="#/partners" data-pp-go="">Become a Partner ${I.arrow}</a>
      <a class="pp-btn pp-btn-o" href="#/projects">See new projects</a>
    </div>
  </div>
</section>
<div class="wrap pp">
  <section class="pp-sec">
    <h2>Who Can <em>Partner</em> With Us?</h2>
    <div class="pp-who">${WHO.map(([k, n, img, alt, ic]) => `<a class="pp-wc" href="#/partners" data-pp-go="${k}"><figure>${IMG(img, alt)}<span class="pp-ic">${ic}</span></figure><h3>${n}</h3><span class="pp-wc-b">Join as partner ${I.arrow}</span></a>`).join('')}</div>
  </section>

  <section class="pp-sec">
    <h2>Home <em>Services</em> Partners</h2>
    <p class="pp-lead">Every service a tenant, buyer or owner needs – choose your category and get customers from YourHome.</p>
    <div class="pp-svc">${SERVICES.map(([k, n, d, ic]) => `<a class="pp-sc" href="#/partners" data-pp-go="${k}"><span class="pp-sci">${ic}</span><span class="pp-sct"><b>${n}</b><small>${d}</small></span><span class="pp-scb">Join ${I.arrow}</span></a>`).join('')}</div>
    <div class="pp-who-more"><a class="pp-btn pp-btn-p" href="#/partners" data-pp-go="">Become a Partner ${I.arrow}</a></div>
  </section>

  <section class="pp-sec pp-how">
    <h2>How <em>Partnership</em> Works</h2>
    <ol class="pp-steps">${STEPS.map(([h, p, ic], i) => `<li><div class="pp-sh"><span class="pp-sn">${i + 1}</span>${ic}</div><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol>
  </section>

  <ul class="pp-feats" aria-label="Partner benefits">${FEATS.map(([img, alt, n]) => `<li>${IMG(img, alt)}<span>${n}</span></li>`).join('')}</ul>

  <section class="pp-sec">
    <h2>Choose Your <em>Partnership Type</em></h2>
    <div class="pp-types">${TYPES.map(([k, n, d, img, ic]) => `<a class="pp-tc" href="#/partners" data-pp-go="${k}"><figure>${IMG(img, n)}<span class="pp-ic">${ic}</span></figure><div><h3>${n}</h3><p>${d}</p></div></a>`).join('')}</div>
  </section>

  <section class="pp-sec pp-dash">
    ${LAP}
    <div>
      <h2>Partner <em>Dashboard</em></h2>
      <p>Manage your listings, projects, services and customers in one place.</p>
      <ul class="pp-check">${['Listings, projects & services', 'Leads, messages & Telegram alerts', 'Agent profile with your links (Booking, Agoda…)', 'Statistics: views, visitors, contact clicks', 'Verified partner badge after our check'].map(x => `<li>${I.check}${x}</li>`).join('')}</ul>
      <a class="pp-btn pp-btn-p" href="#/account">Explore the Dashboard ${I.arrow}</a>
    </div>
  </section>

  <section class="pp-sec pp-apply" id="ppApply">
    <h2>Partner <em>Application</em></h2>
    <p class="pp-lead">Free to apply. Our team answers within 1–2 working days on Telegram, WhatsApp or email.</p>
    <form class="pp-form" id="ppForm">
      <label class="pp-full">Partner type
        <select name="partner_type" required><option value="">Choose…</option>
          <optgroup label="Who can partner">${opt(WHO)}</optgroup>
          <optgroup label="Home services">${opt(SERVICES)}</optgroup>
          <optgroup label="Partnership type">${opt(TYPES)}</optgroup>
          <option value="other"${pre === 'other' ? ' selected' : ''}>Other</option>
        </select></label>
      <label>Your name<input name="name" required minlength="2" maxlength="120" autocomplete="name"></label>
      <label>Company<input name="company" maxlength="160" autocomplete="organization"></label>
      <label>Phone / WhatsApp<input name="phone" maxlength="40" inputmode="tel" autocomplete="tel"></label>
      <label>Telegram<input name="telegram" maxlength="60" placeholder="@username"></label>
      <label>Email<input name="email" type="email" maxlength="160" autocomplete="email"></label>
      <label>Website or Facebook page<input name="website" maxlength="300" placeholder="https://"></label>
      <label class="pp-full">Areas you cover<input name="areas" maxlength="300" placeholder="e.g. BKK1, Toul Kork, all Phnom Penh"></label>
      <label class="pp-full">About your business<textarea name="message" rows="4" maxlength="3000" placeholder="What you offer, how many listings or projects, languages…"></textarea></label>
      <p class="pp-note pp-full">Give at least one contact: phone, Telegram or email.</p>
      <button class="pp-btn pp-btn-p pp-full" type="submit">Send application ${I.arrow}</button>
      <div class="pp-ok pp-full" id="ppOk" hidden>${I.check}<span><b>Thank you – your application is in.</b> Our team will contact you soon. Agents and owners can already <a href="#/post">post listings</a> and <a href="#/account?tab=agent">create an agent profile</a>.</span></div>
    </form>
  </section>

  <section class="pp-rep">
    ${I.globe}
    <h2>Become an Official<br>Country Representative</h2>
    <p>Represent YourHome in Vietnam, Indonesia, Thailand or your country – grow the portal, sign agents and developers within an agreed territory.</p>
    <a class="pp-btn" href="#/partners" data-pp-go="representative">Apply for Representation ${I.arrow}</a>
  </section>
</div>`;
  const form = document.getElementById('ppForm');
  app.querySelectorAll('[data-pp-go]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    if (a.dataset.ppGo) form.partner_type.value = a.dataset.ppGo;
    document.getElementById('ppApply').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  if (pre) setTimeout(() => document.getElementById('ppApply').scrollIntoView({ block: 'start' }), 60);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form)); for (const k in f) f[k] = String(f[k]).trim() || null;
    if (!f.phone && !f.telegram && !f.email) return C.toast('Please add a phone, Telegram or email.');
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    const { error } = await C.sb.from('yh_partner_requests').insert({ ...f, lang: C.lang() });
    btn.disabled = false;
    if (error) return C.toast(C.t('error') + error.message);
    form.querySelectorAll('label,.pp-note,button[type=submit]').forEach(el => el.hidden = true);
    document.getElementById('ppOk').hidden = false;
  });
}

// ---------- New projects ----------
const STAGE = { presale: 'Pre-sale', construction: 'Under construction', ready: 'Ready to move in' };
const STAGE_C = { presale: 'yb-price', construction: 'yb-beds', ready: 'yb-type' };
const fmt = n => n ? (window.yhMoney ? window.yhMoney(n) : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })) : '';
// Unsplash photos come in the size we need (?w=); our own uploads have a small "-s.webp" copy for cards/thumbnails
const pimg = (u, w) => /images\.unsplash\.com/.test(u) ? (/[?&]w=\d+/.test(u) ? u.replace(/([?&])w=\d+/, '$1w=' + w) : u + (u.includes('?') ? '&' : '?') + 'w=' + w) : (w <= 800 ? String(u).replace(/-L\.webp$/, '-s.webp') : u);
const ARR = d => `<svg viewBox="0 0 24 24"><path d="${d < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`;
// Project cards get the same photo slider as the listing cards (app.js handles .ygal / .ydots / .yarr)
function pslider(p) {
  const ph = (p.photos || []).slice(0, 15); if (ph.length < 2) return '';
  const { esc } = C;
  return `<div class="ygal">${ph.map((u, i) => `<img ${i < 2 ? 'src' : 'data-src'}="${esc(pimg(u, 800))}" alt="${esc(p.name)} – photo ${i + 1}" decoding="async">`).join('')}</div><div class="ydots${ph.length > 8 ? ' many' : ''}">${ph.map((u, i) => `<button type="button" data-yd="${i}" class="${i ? '' : 'on'}" aria-label="Photo ${i + 1}"></button>`).join('')}</div><button type="button" class="yarr yprev" data-yarr="-1" aria-label="Previous photo">${ARR(-1)}</button><button type="button" class="yarr ynext" data-yarr="1" aria-label="Next photo">${ARR(1)}</button>`;
}
function pcard(p) {
  const { esc } = C; const img = p.photos && p.photos[0];
  const href = '#/project/' + encodeURIComponent(p.slug);
  return `<a class="card prj-card" href="${href}">
    <div class="ph">${img ? `<img src="${esc(pimg(img, 800))}" alt="${esc(p.name)}" loading="lazy">` : '<span class="noimg">🏗</span>'}${pslider(p)}
      <span class="prj-badges">${p.is_featured ? '<span class="yb yb-top">TOP</span>' : ''}<span class="yb ${STAGE_C[p.stage] || 'yb-beds'}">${esc(STAGE[p.stage] || p.stage)}</span>${p.is_demo ? '<span class="yb yb-demo">SAMPLE</span>' : ''}</span>
      ${p.price_from ? `<span class="prj-price">from ${fmt(p.price_from)}</span>` : ''}
      ${p.photos && p.photos.length > 1 ? `<span class="prj-count">${I.camera}${p.photos.length}</span>` : ''}
    </div>
    <div class="cb prj-cb">
      <h3 class="ct">${esc(p.name)}</h3>
      <p class="prj-dev">${esc(p.developer || '')}</p>
      <p class="prj-facts">${esc([p.units, p.completion].filter(Boolean).join(' · '))}</p>
      <p class="prj-loc">${I.pin}${esc([p.district, p.city].filter(Boolean).join(', '))}</p>
      <span class="prj-link">View project ${I.arrow}</span>
    </div></a>`;
}
const COLS = 'id,slug,name,developer,district,city,stage,completion,price_from,units,unit_count,floors,photos,is_featured,is_demo,created_at';
export async function fetchProjects(limit = 60) {
  const { data, error } = await C.sb.from('yh_projects').select(COLS).eq('active', true).order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(limit);
  if (error) { console.error(error); return []; }
  return data || [];
}
export async function homeBlock() {
  const list = await fetchProjects(4);
  if (!list.length) return '';
  return `<section class="block"><div class="bh"><h2>New projects</h2><a class="more" href="#/projects">See all →</a></div><div class="row4">${list.map(pcard).join('')}</div><div class="block-more"><a class="btn ghost" href="#/projects">New projects · See all →</a></div></section>`;
}
export async function viewProjects() {
  const { app } = C;
  document.title = 'New projects in Cambodia — YourHome';
  const st = new URLSearchParams(YH.h().split('?')[1] || '').get('stage') || '';
  app.innerHTML = `<div class="wrap prj-page">
    <div class="prj-head"><nav class="crumbs"><a href="#/">Home</a><span>/</span><span>New projects</span></nav>
      <h1>New <em>projects</em> in Cambodia</h1>
      <p>Condos, apartments and homes from developers – pre-sale, under construction and ready to move in.</p>
      <div class="deal-tabs prj-tabs">${[['', 'All'], ['presale', 'Pre-sale'], ['construction', 'Under construction'], ['ready', 'Ready']].map(([k, n]) => `<a class="${k === st ? 'on' : ''}" href="#/projects${k ? '?stage=' + k : ''}">${n}</a>`).join('')}</div>
    </div>
    <div id="prjList">${window.yhSkel ? window.yhSkel(false) : ''}</div>
    <div class="prj-cta">${I.crane}<div><b>Are you a developer?</b><span>Show your project to buyers and tenants on YourHome.</span></div><a class="btn red" href="#/partners?type=developers">List your project</a></div>
  </div>`;
  let list = await fetchProjects(200);
  if (st) list = list.filter(p => p.stage === st);
  document.getElementById('prjList').innerHTML = list.length ? `<div class="grid prj-grid">${list.map(pcard).join('')}</div>` : `<div class="empty">No projects here yet.</div>`;
}
export async function viewProject(slug) {
  const { app, esc, sb } = C;
  const { data: p } = await sb.from('yh_projects').select('*').eq('slug', slug).eq('active', true).maybeSingle();
  if (!p) { app.innerHTML = `<div class="wrap"><div class="empty">Project not found. <a href="#/projects">All projects →</a></div></div>`; return; }
  document.title = p.name + ' — New project — YourHome';
  const ph = p.photos || [];
  const tg = p.telegram ? String(p.telegram).replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '') : '';
  app.innerHTML = `<div class="wrap prj-one">
    <nav class="crumbs"><a href="#/">Home</a><span>/</span><a href="#/projects">New projects</a><span>/</span><span>${esc(p.name)}</span></nav>
    ${gallery(p, ph)}
    <div class="prj-main">
      <div>
        <div class="prj-tags"><span class="yb ${STAGE_C[p.stage] || 'yb-beds'}">${esc(STAGE[p.stage] || p.stage)}</span>${p.is_featured ? '<span class="yb yb-top">TOP</span>' : ''}${p.is_demo ? '<span class="yb yb-demo">SAMPLE</span>' : ''}</div>
        <h1>${esc(p.name)}</h1>
        <p class="prj-loc">${I.pin}${esc([p.district, p.city].filter(Boolean).join(', '))}${p.developer ? ' · by ' + esc(p.developer) : ''}</p>
        <div class="prj-mbar"><div>${p.price_from ? `<span>Prices from</span><b>${fmt(p.price_from)}</b>` : '<b>Price on request</b>'}</div><a class="btn red" href="#prjForm" data-prj-ask>Ask about it</a></div>
        ${sheet(p)}
        ${p.description ? `<h3>About the project</h3><p class="prj-desc">${esc(p.description)}</p>` : ''}
        ${(p.amenities || []).length ? `<h3>Amenities</h3><div class="chips static">${p.amenities.map(a => `<span class="chip">${esc(C.t('am_' + a) === 'am_' + a ? a : C.t('am_' + a))}</span>`).join('')}</div>` : ''}
      </div>
      <aside class="prj-side">
        <div class="prj-pbox">${p.price_from ? `<span>Prices from</span><b>${fmt(p.price_from)}</b>` : '<b>Price on request</b>'}</div>
        <div class="prj-ct">${p.phone ? `<a class="btn ghost" href="tel:${esc(C.digits(p.phone))}">${I.phone} Call</a>` : ''}${tg ? `<a class="btn ghost" href="https://t.me/${esc(tg)}" target="_blank" rel="noopener">${I.tg} Telegram</a>` : ''}${p.whatsapp ? `<a class="btn ghost" href="https://wa.me/${esc(C.digits(p.whatsapp).replace('+', ''))}" target="_blank" rel="noopener">WhatsApp</a>` : ''}</div>
        <form class="prj-form" id="prjForm"><b>Ask about this project</b>
          <input name="name" required minlength="2" maxlength="120" placeholder="Your name">
          <input name="phone" maxlength="40" placeholder="Phone / WhatsApp / Telegram">
          <input name="email" type="email" maxlength="160" placeholder="Email">
          <textarea name="message" rows="3" maxlength="2000" placeholder="Unit type, budget, questions…"></textarea>
          <button class="btn red" type="submit">Send</button>
          <p class="prj-sent" hidden>✓ Sent – the sales team will contact you.</p>
        </form>
      </aside>
    </div>
  </div>`;
  galInit(ph, p.name);
  app.querySelectorAll('[data-prj-ask]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const f = document.getElementById('prjForm'); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => f.querySelector('input')?.focus({ preventScroll: true }), 450); }));
  document.getElementById('prjForm').addEventListener('submit', async e => {
    e.preventDefault(); const form = e.target;
    const f = Object.fromEntries(new FormData(form)); for (const k in f) f[k] = String(f[k]).trim() || null;
    if (!f.phone && !f.email) return C.toast('Please add a phone or email.');
    const { error } = await sb.from('yh_project_leads').insert({ project_id: p.id, ...f });
    if (error) return C.toast(C.t('error') + error.message);
    form.querySelectorAll('input,textarea,button').forEach(el => el.hidden = true);
    form.querySelector('.prj-sent').hidden = false;
  });
}

// ---------- Project page gallery + fact sheet (owner, 2026-11-25: "egy nagy kép mellette 8 pici kocka… vagy egy nagy kép és
// listáz jobbra-balra… mobilon valami adatlap, hogy milyen projekt, mikor indul") ----------
// PC/tablet: one big photo (swipe / arrows) + 8 small squares beside it, the 8th shows "+N"; phones: the big photo swipes
// sideways with a "3 / 12" counter and 4 small squares under it. Any click on a photo opens the full-screen viewer (lightbox).
function gallery(p, ph) {
  const { esc } = C;
  if (!ph.length) return '<div class="pg pg-empty"><div class="prj-noimg">🏗</div></div>';
  const n = ph.length, th = ph.slice(1, 9);
  return `<div class="pg${th.length ? '' : ' pg-one'}" id="pg">
    <div class="pg-main">
      <div class="pg-track" id="pgTrack">${ph.map((u, i) => `<img ${i < 2 ? 'src' : 'data-src'}="${esc(pimg(u, 1400))}" alt="${esc(p.name)} – photo ${i + 1}" data-pg="${i}" decoding="async">`).join('')}</div>
      ${n > 1 ? `<button type="button" class="pg-arr pg-prev" data-pgarr="-1" aria-label="Previous photo">${ARR(-1)}</button><button type="button" class="pg-arr pg-next" data-pgarr="1" aria-label="Next photo">${ARR(1)}</button>` : ''}
      <span class="pg-count" id="pgCount">1 / ${n}</span>
      <button type="button" class="pg-all" data-pgopen="0">${I.camera}All ${n} photos</button>
    </div>
    ${th.length ? `<div class="pg-thumbs">${th.map((u, k) => {
      const i = k + 1, morePc = k === 7 && n > 9 ? n - 9 : 0, morePh = k === 3 && n > 5 ? n - 5 : 0;
      return `<button type="button" class="pg-th${k > 3 ? ' pg-th-pc' : ''}" data-pgth="${i}" aria-label="Photo ${i + 1}"><img src="${esc(pimg(u, 400))}" alt="" loading="lazy" decoding="async">${morePc ? `<span class="pg-plus pc">+${morePc}</span>` : ''}${morePh ? `<span class="pg-plus ph">+${morePh}</span>` : ''}</button>`;
    }).join('')}</div>` : ''}
  </div>`;
}
const SI = {
  stage: S('<path d="M3 20h18M5 20V9l7-5 7 5v11"/><path d="M9 20v-6h6v6"/>'),
  start: S('<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l5.5-3.5z"/>'),
  done: S('<path d="M4 21V4h11l-1.5 3.5L15 11H4"/>'),
  dev: S('<path d="M3 21h18M6 21V5h8v16M14 9h4v12M9 8h2M9 12h2M9 16h2"/>'),
  types: S('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  units: S('<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>'),
  floors: S('<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>'),
  loc: S('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  price: S('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>')
};
function sheet(p) {
  const { esc } = C;
  const steps = [['presale', 'Pre-sale'], ['construction', 'Under construction'], ['ready', 'Ready to move in']];
  const cur = Math.max(0, steps.findIndex(x => x[0] === p.stage));
  const rows = [
    [SI.stage, 'Status', STAGE[p.stage] || p.stage],
    [SI.start, 'Sales start', p.sales_start],
    [SI.done, 'Completion', p.completion],
    [SI.dev, 'Developer', p.developer],
    [SI.types, 'Unit types', p.units],
    [SI.units, 'Apartments', p.unit_count ? Number(p.unit_count).toLocaleString('en-US') + ' units' : ''],
    [SI.floors, 'Floors', p.floors],
    [SI.loc, 'Location', [p.district, p.city].filter(Boolean).join(', ')],
    [SI.price, 'Prices from', p.price_from ? fmt(p.price_from) : 'On request']
  ].filter(r => r[2] !== null && r[2] !== undefined && r[2] !== '');
  return `<section class="prj-sheet"><h3>Project overview</h3>
    <ol class="prj-steps">${steps.map(([k, n], i) => `<li class="${i < cur ? 'done' : i === cur ? 'on' : ''}"><i></i><span>${n}</span></li>`).join('')}</ol>
    <dl class="prj-dl">${rows.map(([ic, k, v]) => `<div>${ic}<dt>${k}</dt><dd>${esc(String(v))}</dd></div>`).join('')}</dl>
  </section>`;
}
function galInit(ph, name) {
  const tr = document.getElementById('pgTrack'); if (!tr) return;
  const n = ph.length, cnt = document.getElementById('pgCount');
  const load = (box, i) => [i - 1, i, i + 1, i + 2].forEach(k => { const im = box.children[(k + n) % n]; if (im && im.dataset.src) { im.src = im.dataset.src; im.removeAttribute('data-src'); } });
  const idx = () => Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth));
  const show = (i, smooth = true) => { i = (i + n) % n; load(tr, i); tr.scrollTo({ left: tr.clientWidth * i, behavior: smooth && Math.abs(i - idx()) < 2 ? 'smooth' : 'auto' }); };
  const mark = () => { const i = idx(); load(tr, i); cnt.textContent = `${i + 1} / ${n}`; document.querySelectorAll('.pg-th').forEach(b => b.classList.toggle('on', Number(b.dataset.pgth) === i)); };
  tr.addEventListener('scroll', () => requestAnimationFrame(mark), { passive: true });
  document.getElementById('pg').addEventListener('click', e => {
    const a = e.target.closest('[data-pgarr]'), th = e.target.closest('[data-pgth]'), op = e.target.closest('[data-pgopen]'), im = e.target.closest('.pg-track img');
    if (a) return show(idx() + Number(a.dataset.pgarr));
    if (th) { const i = Number(th.dataset.pgth); return th.querySelector('.pg-plus') && getComputedStyle(th.querySelector('.pg-plus')).display !== 'none' ? lightbox(ph, name, i) : innerWidth <= 720 ? lightbox(ph, name, i) : show(i); }
    if (op) return lightbox(ph, name, idx());
    if (im) return lightbox(ph, name, Number(im.dataset.pg));
  });
}
// Full-screen photo viewer: swipe / arrows / arrow keys, counter, thumbnails, drawn X; Escape or the X closes it
function lightbox(ph, name, start) {
  const { esc } = C; const n = ph.length;
  document.querySelector('.pgl')?.remove();
  const box = document.createElement('div'); box.className = 'pgl'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', name + ' photos');
  box.innerHTML = `<div class="pgl-top"><span class="pgl-name">${esc(name)}</span><span class="pgl-n" id="pglN"></span><button type="button" class="pgl-x" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
    <div class="pgl-track" id="pglTrack">${ph.map((u, i) => `<div class="pgl-s"><img data-src="${esc(pimg(u, 1800))}" alt="${esc(name)} – photo ${i + 1}"></div>`).join('')}</div>
    ${n > 1 ? `<button type="button" class="pgl-arr pgl-prev" data-l="-1" aria-label="Previous photo">${ARR(-1)}</button><button type="button" class="pgl-arr pgl-next" data-l="1" aria-label="Next photo">${ARR(1)}</button>
    <div class="pgl-th">${ph.map((u, i) => `<button type="button" data-lt="${i}"><img src="${esc(pimg(u, 240))}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}`;
  document.body.appendChild(box); document.documentElement.classList.add('pgl-open');
  const tr = box.querySelector('#pglTrack'), num = box.querySelector('#pglN');
  const load = i => [i - 1, i, i + 1].forEach(k => { const im = tr.children[(k + n) % n]?.firstElementChild; if (im && im.dataset.src) { im.src = im.dataset.src; im.removeAttribute('data-src'); } });
  const idx = () => Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth));
  const go = (i, smooth = true) => { i = (i + n) % n; load(i); tr.scrollTo({ left: tr.clientWidth * i, behavior: smooth && Math.abs(i - idx()) < 2 ? 'smooth' : 'auto' }); };
  const mark = () => { const i = idx(); load(i); num.textContent = `${i + 1} / ${n}`; box.querySelectorAll('[data-lt]').forEach(b => { const on = Number(b.dataset.lt) === i; b.classList.toggle('on', on); if (on) b.scrollIntoView({ block: 'nearest', inline: 'center' }); }); };
  tr.addEventListener('scroll', () => requestAnimationFrame(mark), { passive: true });
  const close = () => { box.remove(); document.documentElement.classList.remove('pgl-open'); removeEventListener('keydown', key); removeEventListener('popstate', close); };
  const key = e => { if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') go(idx() - 1); else if (e.key === 'ArrowRight') go(idx() + 1); };
  addEventListener('keydown', key); addEventListener('popstate', close);
  box.addEventListener('click', e => {
    if (e.target.closest('.pgl-x')) return close();
    const a = e.target.closest('[data-l]'); if (a) return go(idx() + Number(a.dataset.l));
    const t = e.target.closest('[data-lt]'); if (t) return go(Number(t.dataset.lt));
  });
  requestAnimationFrame(() => { go(start, false); mark(); });
}
