// Every address (except files and "/") answers with its OWN HTML (claude/seo-rules.md "What Google receives"):
// title, description, canonical, og/twitter, structured data, H1, lead and the first cards – then the app takes over.
// vercel.json rewrites /<anything without a dot> here as /api/page?p=/<path>. Any error → the plain app shell (never a blank page).
const fs = require('fs');
const path = require('path');
const S = require('./_seo');
const { esc, sb, LCOLS, title, desc, render, cards, body, crumbs, ORIGIN } = S;

const DEALS = {
  rent: { deal: 'rent', h1: 'Homes for rent in Cambodia', t: 'Apartments & houses for rent in Phnom Penh', d: 'Apartments, condos, houses and villas for rent in Phnom Penh and across Cambodia – real photos, monthly prices in USD and direct contact with owners and agents.', crumb: 'Rent' },
  buy: { deal: 'sale', h1: 'Property for sale in Cambodia', t: 'Property for sale in Phnom Penh – condos, houses', d: 'Condos, apartments, houses, villas and land for sale in Phnom Penh and Cambodia. Prices in USD, foreigner-friendly condos marked, contact the seller directly.', crumb: 'Buy' },
  rooms: { deal: 'room', h1: 'Rooms for rent in Phnom Penh', t: 'Rooms for rent in Phnom Penh – shared & private', d: 'Private and shared rooms for rent in Phnom Penh – cheap monthly rooms with photos, amenities and the owner’s phone, Telegram or WhatsApp.', crumb: 'Rooms' },
  daily: { deal: 'daily', h1: 'Daily rentals & short stays in Cambodia', t: 'Daily rentals & short stays in Phnom Penh', d: 'Apartments and rooms for daily and short-term rent in Phnom Penh – price per night, photos and direct booking contact with the owner or agent.', crumb: 'Daily rent' },
};
const STATIC = {
  about: ['About us – who builds YourHome.asia', 'YourHome.asia is built by experienced portal designers and real-estate professionals to bring every home in Cambodia into one clean, safe search.', 'About us'],
  'how-it-works': ['How it works – search, contact, move in', 'How to find a home on YourHome.asia in three steps, and how owners and agents post for free, get verified and follow their statistics.', 'How it works', 'how'],
  safety: ['Safety tips for renting & buying in Cambodia', 'Never pay before a viewing, meet in person and check the documents – our safety tips for renting and buying property in Cambodia.', 'Safety tips'],
  faq: ['FAQ – questions and answers', 'Answers to common questions: free posting, contacting owners, the Verified badge, Telegram alerts, covered cities and reporting a listing.', 'FAQ'],
  support: ['Contact us – support for renters & advertisers', 'Questions, feedback or a problem with a listing? Write to the YourHome.asia team on Telegram, WhatsApp, Viber or email – we reply quickly.', 'Contact us'],
  terms: ['Terms and Conditions', 'The rules for using YourHome.asia: who publishes listings, free posting, TOP placements, removed listings and what advertisers must follow.', 'Terms and Conditions'],
  privacy: ['Privacy Policy', 'What YourHome.asia stores – account email, listings, messages and anonymous visit statistics – where it is kept and how to delete it.', 'Privacy Policy'],
  partners: ['Become a partner – agents, developers, services', 'Partner with YourHome.asia: agents and agencies, owners, developers, short-stay hosts and home-service companies across Cambodia. Apply online.', 'Become a partner'],
  search: ['Search homes for rent and sale in Cambodia', 'Search every apartment, condo, house, villa and room for rent or sale in Phnom Penh by district, type, budget and amenities – list or map view.', 'Search'],
};
const PRIVATE = new Set(['account', 'my', 'post', 'edit', 'saved', 'admin', 'api', 'auth', 'callback', 'l']);

// The visible page texts (About, How, Safety, FAQ, Terms, Privacy) come straight from app.js PAGES – the same words
let APPJS = null;
function pageText(key) {
  try {
    if (!APPJS) for (const f of [path.join(process.cwd(), 'app.js'), path.join(__dirname, '..', 'app.js')]) { try { APPJS = fs.readFileSync(f, 'utf8'); break; } catch (_) {} }
    if (!APPJS) return '';
    const m = APPJS.match(new RegExp('\\n  ' + key + ': \\(\\) => `([\\s\\S]*?)`,?\\n(?:  [a-z]+: \\(\\)|};)'));
    if (!m) return '';
    return m[1]
      .replace(/\$\{t\('terms'\)\}/g, 'Terms and Conditions').replace(/\$\{t\('privacy'\)\}/g, 'Privacy Policy')
      .replace(/\$\{SUPPORT_EMAIL\}/g, S.EMAIL).replace(/\$\{[^}]*\}/g, '')
      .replace(/href="#\//g, 'href="/').replace(/href="\/how"/g, 'href="/how-it-works"');
  } catch (_) { return ''; }
}
// Listing columns = app.js LISTING_COLS (read from the file, so both always match)
function listingCols() {
  pageText('terms');   // loads APPJS
  const m = APPJS && APPJS.match(/const LISTING_COLS = '([^']+)'/);
  return m ? m[1] : null;
}
async function preData() {
  const cols = listingCols(); if (!cols) return null;
  const listings = await sb('yh_listings', `select=${cols}&status=eq.active&country=eq.KH&order=is_featured.desc,created_at.desc&limit=301`, 2500);
  const ids = [...new Set(listings.map(l => l.agent_id).filter(Boolean))];
  let agents = {};
  if (ids.length) { try { (await sb('yh_agents', `select=id,name,kind,photo,phone,whatsapp,telegram&id=in.(${ids.join(',')})`, 2000)).forEach(a => { agents[a.id] = a; }); } catch (_) {} }
  return { complete: listings.length <= 300, listings: listings.slice(0, 300), agents };
}
// Blog articles (blog.json – our own text, read once per instance)
let BLOG = null;
function blogPosts() {
  if (BLOG) return BLOG;
  for (const f of [path.join(process.cwd(), 'blog.json'), path.join(__dirname, '..', 'blog.json')]) { try { BLOG = JSON.parse(fs.readFileSync(f, 'utf8')).sort((x, y) => y.date.localeCompare(x.date)); return BLOG; } catch (_) {} }
  return [];
}
const PRE_PAGES = new Set(['', 'rent', 'buy', 'rooms', 'daily', 'search', 'listing']);
const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function build(p, q) {
  const parts = p.split('/').filter(Boolean).map(x => { try { return decodeURIComponent(x); } catch (_) { return x; } });
  const p0 = parts[0] || '';

  if (!p0) {   // homepage (normally served straight from index.html)
    const list = await sb('yh_listings', `select=${LCOLS}&status=eq.active&country=eq.KH&order=is_featured.desc,created_at.desc&limit=12`).catch(() => []);
    return { path: '/', title: 'Homes for rent and sale in Cambodia | YourHome Cambodia', desc: 'Apartments, houses, condos and rooms for rent and sale in Phnom Penh, Cambodia. Free listings for owners and agents.',
      ld: [{ '@type': 'WebSite', '@id': ORIGIN + '/#web', name: 'YourHome.asia', url: ORIGIN + '/', publisher: { '@id': ORIGIN + '/#org' }, potentialAction: { '@type': 'SearchAction', target: ORIGIN + '/search?q={search_term_string}', 'query-input': 'required name=search_term_string' } }],
      body: body('Find your home in Cambodia', 'Rent, buy and sell property in Cambodia.', S.cards(list)) };
  }

  if (DEALS[p0] && parts.length === 1) {
    const D = DEALS[p0];
    const dq = D.deal === 'daily' ? 'deal_type=eq.rent&price_period=eq.day' : `deal_type=eq.${D.deal}`;
    const list = await sb('yh_listings', `select=${LCOLS}&status=eq.active&country=eq.KH&${dq}&order=is_featured.desc,created_at.desc&limit=24`).catch(() => []);
    return { path: '/' + p0, title: title(D.t), desc: desc(D.d), image: list[0] && list[0].photos && list[0].photos[0],
      ld: [crumbs([['Home', '/'], [D.crumb, '/' + p0]]), { '@type': 'CollectionPage', name: D.h1, url: ORIGIN + '/' + p0 }],
      body: body(esc(D.h1), D.d, (() => { const ks = Object.keys(S.landings(list)).filter(k => k.startsWith('/' + p0 + '/') && k.split('/').length === 3); return ks.length ? `<p>${ks.map(k => `<a href="${k}">${esc(D.crumb)} in ${esc((S.landings(list)[k][0].city) || 'Phnom Penh')}</a>`).join(' · ')}</p>` : ''; })() + (cards(list, 24) || '<p>No listings yet – <a href="/post">post the first one for free</a>.</p>')) };
  }

  if (DEALS[p0] && parts.length >= 2 && parts.length <= 4) {   // + /rent/phnom-penh/bkk1/apartment (district + type)   // /rent/phnom-penh · /rent/phnom-penh/bkk1 · /buy/phnom-penh/condo
    const D = DEALS[p0];
    const dq = D.deal === 'daily' ? 'deal_type=eq.rent&price_period=eq.day' : D.deal === 'rent' ? 'deal_type=eq.rent' : `deal_type=eq.${D.deal}`;
    const all = await sb('yh_listings', `select=${LCOLS},address&status=eq.active&country=eq.KH&${dq}&order=is_featured.desc,created_at.desc&limit=1000`).catch(() => []);
    const lp = '/' + parts.map(x => S.slugify(x)).join('/');
    if (lp !== '/' + parts.join('/')) return { redirect: lp + (q ? '?' + q : '') };
    const list = S.landings(all)[lp] || [];
    const inCity = all.filter(l => S.slugify(l.city || 'Phnom Penh') === parts[1]);
    const cityName = (inCity[0] && (inCity[0].city || 'Phnom Penh')) || parts[1].split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
    const seg = parts[2] || '', seg3 = parts[3] || '';
    if (seg3 && (!S.TYPE_PLURAL[seg3] || S.TYPE_PLURAL[seg])) return null;   // 4th part must be a type, 3rd a district
    const tSeg = seg3 || seg, isType = !!S.TYPE_PLURAL[tSeg];
    const distSeg = seg3 ? seg : (seg && !isType ? seg : '');
    const distName = distSeg ? ((list[0] && list[0].district) || distSeg.replace(/-/g, ' ').toUpperCase()) : '';
    const what = isType ? S.TYPE_PLURAL[tSeg] : D.deal === 'room' ? 'Rooms' : D.deal === 'sale' ? 'Property' : D.deal === 'daily' ? 'Daily rentals' : 'Homes';
    const verb = D.deal === 'sale' ? 'for sale' : D.deal === 'daily' ? (isType ? 'for daily rent' : '') : 'for rent';
    const where = distName ? `${distName}, ${cityName}` : cityName;
    const h1 = `${what} ${verb} in ${where}`.replace(/\s+/g, ' ');
    const prices = list.map(l => Number(l.price)).filter(Boolean);
    const d0 = list.length
      ? `${list.length} ${list.length === 1 ? 'listing' : 'listings'}: ${h1.charAt(0).toLowerCase() + h1.slice(1)}${prices.length ? `, from ${S.money(Math.min(...prices))}${D.deal === 'sale' ? '' : D.deal === 'daily' ? '/day' : '/month'}` : ''}. Real photos, prices in USD and direct contact with owners and agents on YourHome.asia.`
      : `${h1} on YourHome.asia – new listings from owners and agents appear here as soon as they are posted.`;
    const cr = [['Home', '/'], [D.crumb, '/' + p0], [cityName, `/${p0}/${parts[1]}`]];
    if (seg3) { cr.push([distName, `/${p0}/${parts[1]}/${seg}`]); cr.push([S.TYPE_PLURAL[seg3], lp]); }
    else if (seg) cr.push([isType ? S.TYPE_PLURAL[seg] : distName, lp]);
    // the city page links its districts and types (crawlable way to the deeper pages)
    const depth = lp.split('/').length + 1;   // only the next level (city → districts/types, district → its types)
    const subs = (!seg || (distSeg && !seg3)) ? Object.keys(S.landings(all)).filter(k => k.startsWith(lp + '/') && k.split('/').length === depth) : [];
    const subLinks = subs.length ? `<p>${subs.map(k => { const s2 = k.split('/').pop(); const ll = S.landings(all)[k]; return `<a href="${k}">${esc(S.TYPE_PLURAL[s2] || ll[0].district || s2)}</a>`; }).join(' · ')}</p>` : '';
    return { path: lp, noindex: !list.length, title: title(h1), desc: desc(d0), image: list[0] && list[0].photos && list[0].photos[0],
      ld: [crumbs(cr), { '@type': 'CollectionPage', name: h1, url: ORIGIN + lp }],
      body: body(esc(h1), d0, subLinks + (cards(list, 24) || `<p><a href="/${p0}">All ${esc(D.crumb.toLowerCase())} listings</a> · <a href="/post">Post a listing for free</a></p>`)) };
  }

  if (p0 === 'listing' && parts[1]) {
    const m = parts[1].match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    const rows = m ? await sb('yh_listings', `select=${LCOLS},description&id=eq.${m[1]}&limit=1`) : [];
    const l = rows[0];
    if (!l || l.status !== 'active') return { status: 410, noindex: true, path: p, title: title('This listing is no longer available'), desc: 'This listing was removed or has expired. See similar homes for rent and sale in Phnom Penh on YourHome.asia.', body: body('This listing is no longer available', 'It was removed or has expired.', '<p><a href="/rent">Homes for rent</a> · <a href="/buy">Homes for sale</a> · <a href="/rooms">Rooms</a></p>') };
    const canonPath = S.listingPath(l);
    if (decodeURIComponent(p) !== canonPath) return { redirect: canonPath + (q ? '?' + q : '') };
    const name = S.listingName(l), plc = S.place(l), price = S.money(l.price) + S.per(l);
    let tl = `${name} in ${plc} – ${price}`;
    if (tl.length > 60) tl = `${name} in ${l.district || l.city || 'Phnom Penh'} – ${price}`;
    if (tl.length > 60) tl = `${name} in ${l.district || l.city || 'Phnom Penh'}`;
    const d0 = `${name.charAt(0).toUpperCase() + name.slice(1)} in ${plc} for ${price}.` + (l.description ? ' ' + l.description : '');
    const dealCrumb = l.deal_type === 'sale' ? ['Buy', '/buy'] : l.deal_type === 'room' ? ['Rooms', '/rooms'] : l.price_period === 'day' ? ['Daily rent', '/daily'] : ['Rent', '/rent'];
    const photos = (l.photos || []).slice(0, 12);
    return { path: canonPath, title: title(tl), desc: desc(d0), image: photos[0], ogType: 'article',
      ld: [crumbs([['Home', '/'], dealCrumb, [l.title || name, canonPath]]), {
        '@type': 'RealEstateListing', name: l.title || name, url: ORIGIN + canonPath, datePosted: l.created_at, ...(l.description ? { description: desc(l.description) } : {}),
        ...(photos.length ? { image: photos } : {}),
        offers: { '@type': 'Offer', price: Number(l.price), priceCurrency: 'USD', ...(l.price_period === 'month' || l.price_period === 'day' ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: Number(l.price), priceCurrency: 'USD', unitCode: l.price_period === 'month' ? 'MON' : 'DAY' } } : {}), availability: 'https://schema.org/InStock' },
        contentLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', ...(l.district ? { addressRegion: l.district } : {}), addressLocality: l.city || 'Phnom Penh', addressCountry: 'KH' } },
      }],
      body: body(esc(l.title || name), `${name} in ${plc} – ${price}`,
        `${photos.map((u, i) => `<img src="${esc(S.img(u, 960))}" alt="${esc(S.photoAlt(l, i))}"${i ? ' loading="lazy"' : ''}>`).join('')}<ul><li>Type: ${esc(S.typeName(l))}</li>${l.bedrooms != null ? `<li>Bedrooms: ${l.bedrooms === 0 ? 'Studio' : l.bedrooms}</li>` : ''}${l.bathrooms != null ? `<li>Bathrooms: ${l.bathrooms}</li>` : ''}${l.area_m2 ? `<li>Area: ${Math.round(l.area_m2)} m²</li>` : ''}<li>Location: ${esc(plc)}</li></ul>${l.description ? `<p>${esc(l.description)}</p>` : ''}<p><a href="${dealCrumb[1]}">More homes: ${esc(dealCrumb[0])}</a></p>`) };
  }

  if (p0 === 'agents' && parts.length === 1) {
    const ag = await sb('yh_agents', 'select=slug,name,kind,company&country=eq.KH&order=verified_at.desc.nullslast,created_at.desc&limit=60').catch(() => []);
    return { path: '/agents', title: title('Real estate agents & agencies in Phnom Penh'), desc: 'Find real estate agents, agencies and owners in Phnom Penh and Cambodia – profiles, languages, areas they cover and all their listings on YourHome.asia.',
      ld: [crumbs([['Home', '/'], ['Agents & agencies', '/agents']])],
      body: body('Agents & agencies', 'Real estate agents, agencies and owners in Cambodia.', ag.length ? `<ul>${ag.map(a => `<li><a href="/agent/${esc(a.slug)}">${esc(a.name)}</a>${a.company ? ' – ' + esc(a.company) : ''}</li>`).join('')}</ul>` : '') };
  }
  if (p0 === 'agent' && parts[1]) {
    const a = (await sb('yh_agents', `select=id,slug,name,kind,company,photo,bio,languages,areas,updated_at&slug=eq.${encodeURIComponent(parts[1].toLowerCase())}&limit=1`))[0];
    if (!a) return null;
    const list = await sb('yh_listings', `select=${LCOLS}&status=eq.active&agent_id=eq.${a.id}&order=created_at.desc&limit=24`).catch(() => []);
    const kind = a.kind === 'agency' ? 'Real estate agency' : a.kind === 'owner' ? 'Property owner' : 'Real estate agent';
    const pth = '/agent/' + a.slug;
    return { path: pth, title: title(`${a.name} – ${kind} in Phnom Penh`), desc: desc(a.bio ? `${a.name}, ${kind.toLowerCase()} in Phnom Penh. ${a.bio}` : `${a.name} – ${kind.toLowerCase()} in Phnom Penh, Cambodia. See the profile, areas covered and all listings on YourHome.asia.`), image: a.photo,
      ld: [crumbs([['Home', '/'], ['Agents & agencies', '/agents'], [a.name, pth]]), { '@type': 'RealEstateAgent', name: a.name, url: ORIGIN + pth, ...(a.photo ? { image: a.photo } : {}), ...(a.bio ? { description: desc(a.bio) } : {}), address: { '@type': 'PostalAddress', addressLocality: 'Phnom Penh', addressCountry: 'KH' } }],
      body: body(esc(a.name), `${kind}${a.company ? ' – ' + a.company : ''}, Phnom Penh`, `${a.photo ? `<img src="${esc(a.photo)}" alt="${esc(a.name + ' – ' + kind.toLowerCase() + ', Phnom Penh')}">` : ''}${a.bio ? `<p>${esc(a.bio)}</p>` : ''}${cards(list, 24)}`) };
  }

  if (p0 === 'projects' && parts.length === 1) {
    const pr = await sb('yh_projects', 'select=slug,name,district,city,stage,price_from,photos&active=eq.true&order=is_featured.desc,created_at.desc&limit=40').catch(() => []);
    return { path: '/projects', title: title('New projects in Phnom Penh – condos & developments'), desc: 'New condo and housing projects in Phnom Penh: pre-sale, under construction and ready developments with prices from, photos and direct developer contact.', image: pr[0] && pr[0].photos && pr[0].photos[0],
      ld: [crumbs([['Home', '/'], ['New projects', '/projects']])],
      body: body('New projects', 'New developments in Cambodia – pre-sale, under construction and ready.', pr.length ? `<ul>${pr.map(x => `<li><a href="/project/${esc(x.slug)}">${x.photos && x.photos[0] ? `<img src="${esc(S.img(x.photos[0], 480))}" alt="${esc(`${x.name} – ${[x.district, x.city || 'Phnom Penh'].filter(Boolean).join(', ')}`)}" loading="lazy">` : ''}${esc(x.name)}</a>${x.price_from ? ' – from ' + S.money(x.price_from) : ''}</li>`).join('')}</ul>` : '') };
  }
  if (p0 === 'project' && parts[1]) {
    const x = (await sb('yh_projects', `select=*&slug=eq.${encodeURIComponent(parts[1])}&active=eq.true&limit=1`))[0];
    if (!x) return null;
    const pth = '/project/' + x.slug, plc = [x.district, x.city || 'Phnom Penh'].filter(Boolean).join(', ');
    const photos = (x.photos || []).slice(0, 12);
    return { path: pth, title: title(`${x.name} – new project in ${x.district || x.city || 'Phnom Penh'}`), desc: desc(`${x.name}${x.developer ? ' by ' + x.developer : ''} in ${plc}${x.price_from ? ', prices from ' + S.money(x.price_from) : ''}.` + (x.description ? ' ' + x.description : '')), image: photos[0],
      ld: [crumbs([['Home', '/'], ['New projects', '/projects'], [x.name, pth]]), { '@type': 'Residence', name: x.name, url: ORIGIN + pth, ...(photos.length ? { image: photos } : {}), ...(x.description ? { description: desc(x.description) } : {}), address: { '@type': 'PostalAddress', ...(x.district ? { addressRegion: x.district } : {}), addressLocality: x.city || 'Phnom Penh', addressCountry: 'KH' } }],
      body: body(esc(x.name), `New project in ${plc}${x.price_from ? ' – from ' + S.money(x.price_from) : ''}`, `${photos.map((u, i) => `<img src="${esc(S.img(u, 960))}" alt="${esc(`${x.name} – ${plc}`)}"${i ? ' loading="lazy"' : ''}>`).join('')}${x.description ? `<p>${esc(x.description)}</p>` : ''}`) };
  }

  if (p0 === 'blog') {   // BLOG (owner, 2026-11-26) – words from blog.json, the same file the app shows
    const posts = blogPosts();
    if (parts.length === 1) return { path: '/blog', title: title('Blog – renting & buying property in Cambodia'), desc: 'Practical guides for tenants, buyers, owners and agents in Cambodia: Phnom Penh areas, contracts, deposits, safety and the rules for foreigners.',
      ld: [crumbs([['Home', '/'], ['Blog', '/blog']]), { '@type': 'Blog', name: 'YourHome.asia Blog', url: ORIGIN + '/blog' }],
      body: body('Guides for renting and buying in Cambodia', 'Practical guides for tenants, buyers, owners and agents.', `<ul>${posts.map(a => `<li><a href="/blog/${esc(a.slug)}">${esc(a.title)}</a> – ${esc(a.desc)}</li>`).join('')}</ul>`) };
    const a = parts.length === 2 && posts.find(x => x.slug === parts[1]);
    if (!a) return null;
    const pth = '/blog/' + a.slug;
    const img = a.img ? a.img + '?auto=format&fit=crop&w=1200&h=630&q=70' : null;   // og:image = the article's own photo
    const src = (a.sources || []).map(x => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a> – ${esc(x.name)}${x.date ? ', ' + esc(x.date) : ''}</li>`).join('');
    return { path: pth, title: title(a.title), desc: desc(a.desc), ogType: 'article', ...(img ? { image: img } : {}),
      ld: [crumbs([['Home', '/'], ['Blog', '/blog'], [a.title, pth]]), { '@type': 'NewsArticle', headline: a.title, description: a.desc, datePublished: a.date, dateModified: a.updated || a.date, url: ORIGIN + pth, mainEntityOfPage: ORIGIN + pth, ...(img ? { image: [img] } : {}), author: { '@id': ORIGIN + '/#org' }, publisher: { '@id': ORIGIN + '/#org' }, ...((a.sources || []).length ? { citation: a.sources.map(x => x.url) } : {}) }],
      body: `<div class="ssr wrap"><div class="page">${img ? `<img src="${esc(img)}" alt="${esc(a.imgAlt || a.title)}">` : ''}<h1>${esc(a.title)}</h1><p>${esc(a.desc)}</p>${a.body}${src ? `<h2>Sources</h2><ul>${src}</ul>` : ''}</div></div>` };
  }

  if (STATIC[p0] && parts.length === 1) {
    const [t0, d0, crumb, key] = STATIC[p0];
    const txt = pageText(key || p0);
    const ld = [crumbs([['Home', '/'], [crumb, '/' + p0]])];
    if (p0 === 'faq' && txt) {
      const qa = [...txt.matchAll(/<summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p>/g)].map(m => ({ '@type': 'Question', name: strip(m[1]), acceptedAnswer: { '@type': 'Answer', text: strip(m[2]) } }));
      if (qa.length) ld.push({ '@type': 'FAQPage', mainEntity: qa });
    }
    return { path: '/' + p0, title: title(t0), desc: desc(d0), ld,
      body: txt ? `<div class="ssr wrap"><div class="page">${txt}</div></div>` : body(esc(crumb), d0) };
  }

  if (PRIVATE.has(p0)) return { noindex: true, path: p, title: 'YourHome.asia', desc: 'YourHome.asia – homes for rent and sale in Cambodia.', body: '' };
  return null;
}

// FOOTER LINKS LIKE MVP VIETNAM (owner, 2026-11-26: "mehet"): the "For rent" / "For sale" type links and the "Popular areas"
// district pills are filled in on the server from the live listings – only landing pages that really have listings
// (seo-rules.md), so the footer never links an empty page. Labels carry data-i18n (ftp_<type>) – the app translates them.
// Every column is the same length (owner, 2026-11-26: "egészítsd ki… legyen egységes – mehet a commercial is"): a FIXED list of
// types – each links its landing page when it has live listings, else the deal page filtered by type (?type= – canonical to
// the deal page, never an empty indexable page).
const FT_RENT = ['apartment', 'condo', 'house', 'villa', 'commercial'];
const FT_SALE = ['condo', 'apartment', 'house', 'villa', 'land', 'commercial'];
let FTC = null, FTT = 0;
const FULL_AT = 100;   // real listings needed before every Phnom Penh district shows in the footer grid
const FT_CITIES = ['Phnom Penh', 'Siem Reap', 'Sihanoukville', 'Kampot', 'Battambang'];
// Phnom Penh districts = app.js DISTRICTS (read from the file, so both always match)
function ptDistricts() { pageText('terms'); const m = APPJS && APPJS.match(/const DISTRICTS = \[([^\]]+)\]/); return m ? m[1].split(',').map(x => x.trim().replace(/^'|'$/g, '')) : []; }
async function footerLinks() {
  if (FTC && Date.now() - FTT < 120000) return FTC;
  const list = await sb('yh_listings', 'select=city,district,deal_type,property_type,price_period,bedrooms,is_demo&status=eq.active&country=eq.KH&limit=3000', 1500);
  const L = S.landings(list), c = 'phnom-penh';
  const li = (href, key, txt) => `<li><a href="${href}"${key ? ` data-i18n="${key}"` : ''}>${esc(txt)}</a></li>`;
  const typeLinks = (deal, order) => order.map(ty => li(L[`/${deal}/${c}/${ty}`] ? `/${deal}/${c}/${ty}` : `/${deal}?type=${ty}`, 'ftp_' + ty, S.TYPE_PLURAL[ty])).join('');
  const rent = typeLinks('rent', FT_RENT) + li('/rooms', 'ft_rooms', 'Rooms for rent') + li('/daily', 'ft_dailyR', 'Daily rentals') + li('/rent', 'ft_allRent', 'All rentals');
  const sale = typeLinks('buy', FT_SALE) + li('/projects', 'newProjects', 'New projects') + li('/buy', 'ft_allSale', 'All properties for sale');
  // districts of Phnom Penh, most listings first; each pill opens the first deal that has listings there
  const dist = {};
  for (const k of Object.keys(L)) {
    const m = k.match(/^\/(rent|buy|rooms|daily)\/phnom-penh\/([^/]+)$/);
    if (!m || S.TYPE_PLURAL[m[2]]) continue;
    const name = L[k][0].district; if (!name) continue;
    const pri = ['rent', 'buy', 'rooms', 'daily'].indexOf(m[1]);
    const d = dist[m[2]] || (dist[m[2]] = { name, n: 0, path: k, pri });
    d.n += L[k].length; if (pri < d.pri) { d.pri = pri; d.path = k; }
  }
  const pills = Object.values(dist).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)).slice(0, 12)
    .map(d => `<a class="yft-pill" href="${d.path}">${esc(d.name)}</a>`).join('');
  const areas = pills ? `<div class="yft-areas"><span class="yft-soc-t" data-i18n="ft_areas">Popular areas</span><div class="yft-pills">${pills}</div></div>` : '';
  // FOR SALE | FOR RENT GRID (owner, 2026-11-26: realestate.com.kh footer – "így jó? … mehet"): two deal tabs, a row of type tabs,
  // and under them a grid of keyword links ("Apartments for sale in BKK1"). Pure-CSS tabs (radio inputs) – EVERY link is in the
  // HTML, so Google sees all of them. Cities always; districts only where live listings exist – until there are FULL_AT (100) real
  // (non-demo) listings, then every Phnom Penh district shows (owner 07:47: "változzon meg amikor lesz 100+ hirdetésünk").
  // A link opens its landing page when it has listings, else the deal page filtered (query = canonical to the deal page).
  const real = list.filter(l => !l.is_demo).length, full = real >= FULL_AT;
  const SX = [['s', 'buy', 'ps_saleT', 'ps_sale', ['', 'apartment', 'condo', 'house', 'villa', 'commercial', 'land']],
              ['r', 'rent', 'ps_rentT', 'ps_rent', ['', 'apartment', 'condo', 'house', 'villa', 'commercial', 'studio']]];
  const cities = [...FT_CITIES];
  for (const l of list) if (l.city && !cities.includes(l.city)) cities.push(l.city);
  const enc = encodeURIComponent;
  const EN = { ps_saleT: '{x} for sale in {p}', ps_sale: 'Property for sale in {p}', ps_rentT: '{x} for rent in {p}', ps_rent: 'Homes for rent in {p}' };
  const lnk = (deal, tpl, ty, place, href) => `<a href="${href}" data-ps="${tpl}"${ty ? ` data-psx="${ty}"` : ''} data-psp="${esc(place)}">${esc(EN[tpl].replace('{x}', S.TYPE_PLURAL[ty] || '').replace('{p}', place))}</a>`;
  const qType = ty => ty === 'studio' ? '&beds=0' : ty ? '&type=' + ty : '';
  let tabs = '', types = '', panels = '';
  for (const [k, deal, tplT, tpl, tys] of SX) {
    types += `<div class="sx-types sx-types-${k}">` + tys.map((ty, i) => `<label for="sxt-${i}"${ty ? ` data-i18n="ftp_${ty}"` : ' data-i18n="sx_all"'}>${ty ? esc(S.TYPE_PLURAL[ty]) : 'All'}</label>`).join('') + '</div>';
    tys.forEach((ty, i) => {
      const tail = ty ? '/' + ty : '', T = ty ? tplT : tpl, out = [];
      for (const city of cities) {
        const cs = S.slugify(city), lp = `/${deal}/${cs}${tail}`;
        if (city !== 'Phnom Penh' && !FT_CITIES.includes(city) && !L[lp]) continue;
        out.push([0, L[lp] ? L[lp].length : 0, lnk(deal, T, ty, city, L[lp] ? lp : `/${deal}?city=${enc(city)}${qType(ty)}`)]);
      }
      const seen = new Set();
      for (const key of Object.keys(L)) {
        const m = key.match(new RegExp(`^/${deal}/([^/]+)/([^/]+)${ty ? '/' + ty : ''}$`));
        if (!m || S.TYPE_PLURAL[m[2]]) continue;
        const d0 = L[key][0]; seen.add(m[1] + '/' + m[2]);
        out.push([1, L[key].length, lnk(deal, T, ty, d0.district || m[2], key)]);
      }
      if (full) for (const dn of ptDistricts()) {
        if (seen.has('phnom-penh/' + S.slugify(dn))) continue;
        out.push([2, 0, lnk(deal, T, ty, dn, `/${deal}?city=Phnom%20Penh&q=${enc(dn)}${qType(ty)}`)]);
      }
      out.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
      panels += `<div class="sx-p sx-p-${k}${i}">${out.slice(0, 24).map(x => x[2]).join('')}</div>`;
    });
  }
  const psRow = `<div class="yft-sx">`
    + `<input type="radio" name="sxd" id="sxd-s" class="sxr" checked aria-label="For sale"><input type="radio" name="sxd" id="sxd-r" class="sxr" aria-label="For rent">`
    + [0, 1, 2, 3, 4, 5, 6].map(i => `<input type="radio" name="sxt" id="sxt-${i}" class="sxr"${i ? '' : ' checked'} aria-label="Type ${i}">`).join('')
    + `<div class="sx-tabs"><label for="sxd-s" data-i18n="sx_sale">Real estate for sale</label><label for="sxd-r" data-i18n="sx_rent">Real estate for rent</label></div>`
    + types + panels + `</div>`;
  FTC = { rent, sale, areas, ps: psRow }; FTT = Date.now();
  return FTC;
}
function fillFooter(html, f) {
  if (!f) return html;
  for (const k of ['rent', 'sale', 'areas', 'ps']) html = html.replace(new RegExp(`<!--ft:${k}-->[\\s\\S]*?<!--/ft:${k}-->`), `<!--ft:${k}-->${f[k]}<!--/ft:${k}-->`);
  return html;
}

module.exports = async (req, res) => {
  const url = new URL(req.url, 'https://yourhome.asia');
  let p = url.searchParams.get('p') || '/';
  p = ('/' + p.replace(/^\/+/, '')).replace(/\/+$/, '') || '/';
  url.searchParams.delete('p');
  const q = url.searchParams.toString();
  // addresses people type by hand that are not our real ones → 301 to the real page (never a 404)
  const ALIASES = { '/listings': '/search', '/listing': '/search', '/homes': '/search', '/map': '/search?view=map', '/experts': '/agents', '/how': '/how-it-works', '/login': '/account', '/signin': '/account', '/dashboard': '/account', '/contact': '/support', '/partner': '/partners', '/project': '/projects', '/agent': '/agents' };
  if (ALIASES[p]) { const to = ALIASES[p]; res.statusCode = 301; res.setHeader('Location', to + (q ? (to.includes('?') ? '&' : '?') + q : '')); res.setHeader('Cache-Control', 'public, max-age=3600'); return res.end(); }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  try {
    const p0 = p.split('/').filter(Boolean)[0] || '';
    const [page0, pre, ft] = await Promise.all([build(p, q), PRE_PAGES.has(p0) ? preData().catch(() => null) : null, footerLinks().catch(() => null)]);
    let page = page0;
    if (page && pre && !page.status) page.pre = pre;
    if (page && page.redirect) { res.statusCode = 301; res.setHeader('Location', page.redirect); return res.end(); }
    if (!page) page = { status: 404, noindex: true, path: p, title: 'This page is currently unavailable | YourHome Cambodia', desc: 'The page you are looking for is not available. Search homes for rent and sale in Cambodia or contact our team.', body: body('This page is currently unavailable', 'The address may have changed, or the page was removed.', '<p><a href="/support">Contact our team</a> · <a href="/">Back to home</a></p>') };
    res.statusCode = page.status || 200;
    if (page.noindex) res.setHeader('X-Robots-Tag', 'noindex, follow');
    // PHONES ALWAYS GET THE NEWEST PAGE (owner, 2026-11-27: "miért nem frissül telefonon? chrome-ban nem frissül"): stale-while-revalidate in
    // Cache-Control let Chrome show an OLD copy of the page and fetch the new one only in the background. Now the browser must ask every
    // time (max-age=0, must-revalidate); only Vercel's edge keeps its short cache (Vercel-CDN-Cache-Control – emptied on every deploy).
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('Vercel-CDN-Cache-Control', page.status ? 'max-age=60' : page.pre ? 'max-age=30, stale-while-revalidate=120' : 'max-age=300, stale-while-revalidate=86400');
    return res.end(fillFooter(render(page), ft));
  } catch (err) {
    console.error('page', p, err && err.message);
    res.statusCode = 200; res.setHeader('Cache-Control', 'no-store');
    try { return res.end(S.shell()); } catch (_) { res.statusCode = 500; return res.end('Temporary error'); }
  }
};
