/* Fade-in for all new content (owner, 2026-11-24: "minden új tartalom fade in effekttel töltődjön – mobilon is, tabon is").
   Watches #app (every page / route change, cards, results, dashboard tabs) and the listing popup's details pane.
   Every element that gets added fades in; siblings added together come one after another (small stagger);
   photos fade in once they have loaded. Leaflet map internals are left alone. Off for "reduce motion". */
(() => {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const SKIP = /^(SCRIPT|STYLE|LINK|META|TEMPLATE|BR|OPTION)$/;
  const isMap = el => (el.className && typeof el.className === 'string' && el.className.indexOf('leaflet') > -1) ||
    (el.closest && el.closest('.leaflet-container'));

  function img(el) {
    if (el.complete && el.naturalWidth) return;
    el.classList.add('yh-img');
    const done = () => el.classList.add('ld');
    el.addEventListener('load', done, { once: true });
    el.addEventListener('error', done, { once: true });
    setTimeout(done, 4000); // never leave a photo invisible
  }

  function fade(list) {
    let i = 0;
    for (const el of list) {
      if (el.nodeType !== 1 || SKIP.test(el.tagName) || isMap(el)) continue;
      if (el.tagName === 'IMG') { img(el); continue; }
      el.style.setProperty('--yh-d', Math.min(i++, 8) * 40 + 'ms');
      el.classList.remove('yh-in'); void el.offsetWidth; el.classList.add('yh-in');
      el.addEventListener('animationend', () => el.classList.remove('yh-in'), { once: true });
      el.querySelectorAll('img').forEach(img);
      // cards inside a newly rendered page come in one after another
      el.querySelectorAll('.row4 > *, .grid > *, .row-scroll > *').forEach((c, k) => {
        c.style.setProperty('--yh-d', 120 + Math.min(k, 8) * 50 + 'ms');
        c.classList.add('yh-in');
        c.addEventListener('animationend', () => c.classList.remove('yh-in'), { once: true });
      });
    }
  }

  const watch = root => new MutationObserver(ms => {
    const added = [];
    for (const m of ms) for (const n of m.addedNodes) added.push(n);
    if (added.length) fade(added);
  }).observe(root, { childList: true, subtree: true });

  const start = () => {
    const app = document.getElementById('app');
    if (app) { watch(app); fade(app.children); }
    // popup details pane is created later by popup.js
    let popWatched = false;
    const findPop = () => {
      const p = !popWatched && document.querySelector('.apm-scroll');
      if (p) { popWatched = true; watch(p); bodyObs.disconnect(); }
    };
    const bodyObs = new MutationObserver(findPop);
    bodyObs.observe(document.body, { childList: true });
    findPop();
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
})();

/* Scroll reveal (owner, 2026-11-24: "az összes tartalom ahogy lefelé görgetek fade in"): content that starts below
   the screen stays hidden until it scrolls into view, then fades up; cards in one row come one after another.
   Content already on screen is left to the load fade above. Off for "reduce motion". */
(() => {
  if ((window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || !('IntersectionObserver' in window)) return;
  const st = document.createElement('style');
  st.textContent = '.yh-sr{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1);transition-delay:var(--yh-sd,0ms)}.yh-sr.yh-sv{opacity:1;transform:none}';
  document.head.appendChild(st);
  const SEL = '.bh,.row4>*,.grid>*,.row-scroll>*,.mp-grid>*,.panel,.cta,.exp,.mine,.page,.empty,.block-more,.ftr-in';
  const reveal = el => {
    if (el.classList.contains('yh-sv')) return;
    io.unobserve(el); el.classList.add('yh-sv');
    setTimeout(() => { el.classList.remove('yh-sr', 'yh-sv'); el.style.removeProperty('--yh-sd'); }, 1300);
  };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) reveal(e.target); }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  // backup for browsers where the observer is late: check on every scroll / resize
  const check = () => { const vh = innerHeight; document.querySelectorAll('.yh-sr:not(.yh-sv)').forEach(el => { if (el.getBoundingClientRect().top < vh * 0.95) reveal(el); }); };
  addEventListener('scroll', check, { passive: true }); addEventListener('resize', check);
  const seen = new WeakSet();
  const scan = () => {
    const vh = innerHeight, rows = new Map();
    document.querySelectorAll(SEL).forEach(el => {
      if (seen.has(el) || el.closest('.leaflet-container') || (el.parentElement && el.parentElement.closest('.yh-sr'))) return;
      const r = el.getBoundingClientRect();
      if (!r.height) return;
      seen.add(el);
      if (r.top < vh * 0.92) return;
      const p = el.parentElement, k = rows.get(p) || 0; rows.set(p, k + 1);
      el.style.setProperty('--yh-sd', Math.min(k, 6) * 80 + 'ms');
      el.classList.add('yh-sr'); io.observe(el);
    });
  };
  let q = 0;
  const later = () => { if (!q) q = requestAnimationFrame(() => { q = 0; scan(); }); };
  const start = () => { scan(); new MutationObserver(later).observe(document.body, { childList: true, subtree: true }); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
})();
