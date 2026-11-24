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
