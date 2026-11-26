// BLOG (owner, 2026-11-26, myhome.ge "Blog" block): guides for renters, buyers and advertisers.
// Articles live in blog.json (the same file api/page.js reads for the server HTML + sitemap – one source of words).
// Routes: #/blog (list) · #/blog/<slug> (article). Homepage block "Blog" after New projects (4 cards).
let C = null, DATA = null;
export function init(ctx) { C = ctx; }
const load = () => DATA || (DATA = fetch('/blog.json?v=2').then(r => r.json()).then(l => l.sort((x, y) => y.date.localeCompare(x.date))).catch(() => []));
const S = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICONS = {
  key: S('<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>'),
  doc: S('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'),
  map: S('<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>'),
  shield: S('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>')
};
// Photos (owner, 2026-11-26: "rendes képpel, forrást add meg"): a.img = Unsplash base URL (free Unsplash licence), a.credit =
// photographer + photo page (credited under the photo), a.sources = [{name,title,url,date}] listed at the end of the article.
const pic = (u, w) => `${u}?auto=format&fit=crop&w=${w}&q=70`;
const picSet = u => [480, 800, 1200].map(w => `${pic(u, w)} ${w}w`).join(', ');
const out = (u, t) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
const day = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
function bcard(a, i) {
  const { esc } = C;
  return `<a class="card bcard" href="#/blog/${encodeURIComponent(a.slug)}">
    ${a.img ? `<div class="bcov bph"><img src="${pic(a.img, 640)}" srcset="${picSet(a.img)}" sizes="(max-width:720px) 100vw, 320px" alt="${esc(a.imgAlt || a.title)}" loading="lazy" decoding="async"><span>${esc(a.kicker || 'Guide')}</span></div>`
      : `<div class="bcov bc${i % 4}">${ICONS[a.icon] || ICONS.doc}<span>${esc(a.kicker || 'Guide')}</span></div>`}
    <div class="cb"><small class="bdate">${esc(day(a.date))}</small><h3 class="ct">${esc(a.title)}</h3><p class="bdesc">${esc(a.desc)}</p><span class="prj-link">Read more <svg viewBox="0 0 24 24" class="pi" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div></a>`;
}
export async function homeBlock() {
  const list = (await load()).slice(0, 4);
  if (!list.length) return '';
  return `<section class="block"><div class="bh"><h2>Blog</h2><a class="more" href="#/blog">See all →</a></div><div class="row4">${list.map(bcard).join('')}</div><div class="block-more"><a class="btn ghost" href="#/blog">Blog · See all →</a></div></section>`;
}
export async function viewBlog() {
  const { app } = C;
  document.title = 'Blog – renting & buying in Cambodia — YourHome';
  const list = await load();
  app.innerHTML = `<div class="wrap">
    <nav class="crumbs"><a href="#/">Home</a><span>/</span><span>Blog</span></nav>
    <div class="ab"><p class="ab-k">Blog</p><h1>Guides for renting and buying in Cambodia</h1><p class="ab-lead">Practical guides for tenants, buyers, owners and agents – areas, contracts, safety and the rules for foreigners.</p></div>
    <div class="row4 blist">${list.map(bcard).join('') || '<div class="empty">No articles yet.</div>'}</div>
  </div>`;
}
export async function viewArticle(slug) {
  const { app, esc } = C;
  const list = await load();
  const i = list.findIndex(a => a.slug === slug), a = list[i];
  if (!a) { app.innerHTML = `<div class="wrap"><div class="empty">This article is not available. <a href="#/blog">All articles →</a></div></div>`; return; }
  document.title = a.title + ' — YourHome Blog';
  const more = list.filter(x => x.slug !== slug).slice(0, 3);
  // body = our own text from blog.json (not user content); internal links "/…" are handled by router.js
  app.innerHTML = `<div class="wrap">
    <nav class="crumbs"><a href="#/">Home</a><span>/</span><a href="#/blog">Blog</a><span>/</span><span>${esc(a.title)}</span></nav>
    <article class="page bart">
      ${a.img ? `<figure class="bfig"><img src="${pic(a.img, 1200)}" srcset="${picSet(a.img)}" sizes="(max-width:820px) 100vw, 780px" alt="${esc(a.imgAlt || a.title)}" decoding="async"><figcaption>Photo: ${a.credit ? out(esc(a.credit.page), esc(a.credit.name)) + ' / ' + out('https://unsplash.com/?utm_source=yourhome_asia&utm_medium=referral', 'Unsplash') : 'Unsplash'}</figcaption></figure>`
        : `<div class="bcov bc${i % 4} bhero">${ICONS[a.icon] || ICONS.doc}<span>${esc(a.kicker || 'Guide')}</span></div>`}
      <p class="ab-k">${esc(a.kicker || 'Guide')} · ${esc(day(a.date))}</p>
      <h1>${esc(a.title)}</h1>
      <p class="ab-lead">${esc(a.desc)}</p>
      <div class="bbody">${a.body}</div>
      ${(a.sources || []).length ? `<div class="bsrc"><h2>Sources</h2><ul>${a.sources.map(x => `<li>${out(esc(x.url), esc(x.title))} – ${esc(x.name)}${x.date ? ', ' + esc(day(x.date)) : ''}</li>`).join('')}</ul><p>Our own summary of the sources above. Figures are as reported by them; check the original before you make a decision.</p></div>` : ''}
      <div class="ab-cta"><div><b>Find your home in Cambodia</b><span>Free listings from owners and agents – search by area, type and budget.</span></div><div class="ab-btns"><a class="btn red" href="#/search?deal=rent">Homes for rent</a><a class="btn ghost" href="#/post">+ Post listing</a></div></div>
    </article>
    ${more.length ? `<section class="block"><div class="bh"><h2>More from the blog</h2><a class="more" href="#/blog">See all →</a></div><div class="row4">${more.map(x => bcard(x, list.indexOf(x))).join('')}</div></section>` : ''}
  </div>`;
}
