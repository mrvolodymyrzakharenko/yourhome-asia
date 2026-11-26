// CLEAN URLS (owner, 2026-11-24: "vedd át a seo és a linkelés, html linkek szabályait a study and worktól"; claude/seo-rules.md):
// every page has a real address without "#" (/rent, /listing/<id>-<slug>, /agents, /how-it-works …). The app code still
// thinks in "#/…" routes; this file translates between the two:
//   YH.h()        – the current route as "#/…" (what location.hash used to be)
//   YH.go(h)      – navigate (pushState + a synthetic hashchange so every old listener keeps working)
//   YH.toPath(h)  – "#/search?deal=rent" → "/rent"   ·   YH.toHash(path) – the reverse
// Old shared "#/…" links are turned into the clean path on load (replaceState) – they never break.
// Every <a href="#/…"> the app draws is rewritten to its clean path (crawlable), and clicks on internal links are handled
// here (same tab, no reload). Loaded first, before every other script (index.html).
(function () {
  var DEAL_PATH = { rent: '/rent', sale: '/buy', room: '/rooms', daily: '/daily' };
  var PATH_DEAL = { rent: 'rent', buy: 'sale', rooms: 'room', daily: 'daily' };
  var ALIAS = { experts: 'agents', how: 'how-it-works' };
  var ALIAS_BACK = { agents: 'experts', 'how-it-works': 'how' };
  // Landing pages (seo-rules.md): /rent/phnom-penh · /rent/phnom-penh/bkk1 · /buy/phnom-penh/condo – the district is the
  // search's q (district select), the type the search's type (studio = 0 bedrooms)
  var TYPE_SLUGS = ['apartment','condo','house','villa','twin-villa','link-house','flat-house','flat','penthouse','studio','shophouse','office','land','hotel','hostel','commercial'];
  var titleCase = function (s) { return s.split('-').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' '); };
  var ID_RE = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d+)/i;

  function slugify(s) {
    return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, '');
  }
  // Same slug as api/_seo.js listingSlug() – "2-bedroom-apartment-for-rent-bkk1"
  function listingSlug(l) {
    var type = l.deal_type === 'room' ? 'room' : String(l.property_type || 'property').replace(/_/g, ' ');
    var beds = l.bedrooms === 0 ? 'studio ' : l.bedrooms > 0 && type !== 'room' ? l.bedrooms + ' bedroom ' : '';
    var deal = l.deal_type === 'sale' ? 'for sale' : l.price_period === 'day' ? 'for daily rent' : 'for rent';
    var place = l.district || l.city || 'phnom penh';
    return slugify(beds + type + ' ' + deal + ' in ' + place);
  }
  function listingPath(l) { var s = listingSlug(l); return '/listing/' + encodeURIComponent(l.id) + (s ? '-' + s : ''); }

  function toPath(h) {
    h = String(h || '');
    if (h.charAt(0) === '/') return h;
    if (h.indexOf('#/') !== 0) return h;
    var s = h.slice(1), qi = s.indexOf('?');
    var path = qi < 0 ? s : s.slice(0, qi), q = new URLSearchParams(qi < 0 ? '' : s.slice(qi + 1));
    var parts = path.split('/').filter(Boolean);
    if (parts[0] === 'l' && parts[1]) path = '/listing/' + parts[1];
    else if (ALIAS[parts[0]]) path = '/' + ALIAS[parts[0]] + (parts.length > 1 ? '/' + parts.slice(1).join('/') : '');
    else if (parts[0] === 'search' && DEAL_PATH[q.get('deal')]) {
      path = DEAL_PATH[q.get('deal')]; q.delete('deal');
      var city = q.get('city'), dq = q.get('q'), ty = q.get('beds') === '0' && !q.get('type') ? 'studio' : q.get('type');
      if (city && slugify(city)) {
        path += '/' + slugify(city); q.delete('city');
        if (dq && slugify(dq) && !ty) { path += '/' + slugify(dq); q.delete('q'); }
        else if (ty && !dq && TYPE_SLUGS.indexOf(ty.replace(/_/g, '-')) >= 0) { path += '/' + ty.replace(/_/g, '-'); if (ty === 'studio') q.delete('beds'); else q.delete('type'); }
      }
    }
    else path = '/' + parts.join('/');
    var qs = q.toString();
    return path + (qs ? '?' + qs : '');
  }
  function toHash(pathname, search) {
    var parts = String(pathname || '/').split('/').filter(Boolean).map(function (p) { try { return decodeURIComponent(p); } catch (e) { return p; } });
    var q = new URLSearchParams(search || '');
    var path;
    if (parts[0] === 'listing' && parts[1]) { var m = parts[1].match(ID_RE); path = '/l/' + (m ? m[1] : parts[1]); }
    else if (PATH_DEAL[parts[0]] && parts.length <= 3) {
      var n = new URLSearchParams({ deal: PATH_DEAL[parts[0]] });
      if (parts[1]) n.set('city', titleCase(parts[1]));
      if (parts[2]) { if (parts[2] === 'studio') n.set('beds', '0'); else if (TYPE_SLUGS.indexOf(parts[2]) >= 0) n.set('type', parts[2].replace(/-/g, '_')); else n.set('q', parts[2].replace(/-/g, ' ')); }
      q.forEach(function (v, k) { if (k !== 'deal') n.set(k, v); }); q = n; path = '/search';
    }
    else if (ALIAS_BACK[parts[0]]) path = '/' + ALIAS_BACK[parts[0]] + (parts.length > 1 ? '/' + parts.slice(1).join('/') : '');
    else path = '/' + parts.join('/');
    var qs = q.toString();
    return '#' + path + (qs ? '?' + qs : '');
  }
  function h() { return toHash(location.pathname, location.search); }
  function fire() { try { window.dispatchEvent(new HashChangeEvent('hashchange')); } catch (e) { var ev = document.createEvent('Event'); ev.initEvent('hashchange', false, false); window.dispatchEvent(ev); } }
  function go(target, replace) {
    var p = toPath(target);
    if (p === location.pathname + location.search && !location.hash) return;
    history[replace ? 'replaceState' : 'pushState'](null, '', p);
    fire();
  }

  // an old "#/…" link → its clean path (shared links keep working)
  if (location.hash.indexOf('#/') === 0) history.replaceState(null, '', toPath(location.hash));

  // an old "#/…" link clicked or typed on an open page → clean path first (runs before the app's own hashchange listener)
  window.addEventListener('hashchange', function () { if (location.hash.indexOf('#/') === 0) history.replaceState(null, '', toPath(location.hash)); });

  // Back / Forward: the old code listened to hashchange – give it one (after popup.js has had its popstate turn)
  window.addEventListener('popstate', function () { setTimeout(fire, 0); });

  // internal links: same tab, no reload (runs last – after every other click handler, which may preventDefault)
  window.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (href.indexOf('#/') !== 0 && !(href.charAt(0) === '/' && href.charAt(1) !== '/')) return;
    if (/\.(xml|txt|svg|json|png|jpe?g|webp|pdf)(\?|$)/i.test(href) || href.indexOf('/api/') === 0) return;
    e.preventDefault();
    go(href);
  });

  // every "#/…" href drawn by the app becomes a real, crawlable address
  function fix(root) {
    if (root.nodeType !== 1) return;
    if (root.matches && root.matches('a[href^="#/"]')) root.setAttribute('href', toPath(root.getAttribute('href')));
    if (root.querySelectorAll) { var l = root.querySelectorAll('a[href^="#/"]'); for (var i = 0; i < l.length; i++) l[i].setAttribute('href', toPath(l[i].getAttribute('href'))); }
  }
  new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      if (m.type === 'attributes') fix(m.target);
      else for (var j = 0; j < m.addedNodes.length; j++) fix(m.addedNodes[j]);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  if (document.readyState !== 'loading') fix(document.body); else document.addEventListener('DOMContentLoaded', function () { fix(document.body); });

  window.YH = { h: h, go: go, toPath: toPath, toHash: toHash, slugify: slugify, listingSlug: listingSlug, listingPath: listingPath };
})();
