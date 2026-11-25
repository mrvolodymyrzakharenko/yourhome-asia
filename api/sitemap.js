// /sitemap.xml – generated, never hand-written (claude/seo-rules.md): every live listing, agent, project, deal page and
// static page. lastmod = the day the page's visible content really changed (listing updated_at), never "today" for all.
const S = require('./_seo');

const STATIC = ['/', '/rent', '/buy', '/rooms', '/daily', '/projects', '/agents', '/partners', '/about', '/how-it-works', '/safety', '/faq', '/support', '/terms', '/privacy'];
const day = d => d ? new Date(d).toISOString().slice(0, 10) : null;
const url = (p, lm) => `<url><loc>${S.esc(S.ORIGIN + p)}</loc>${lm ? `<lastmod>${lm}</lastmod>` : ''}</url>`;

module.exports = async (req, res) => {
  const [ls, ags, prs] = await Promise.all([
    S.sb('yh_listings', 'select=id,city,district,deal_type,property_type,bedrooms,price_period,created_at,updated_at,agent_id&status=eq.active&country=eq.KH&order=updated_at.desc&limit=5000', 5000).catch(() => []),
    S.sb('yh_agents', 'select=id,slug,created_at,updated_at&country=eq.KH&limit=2000', 5000).catch(() => []),
    S.sb('yh_projects', 'select=slug,created_at&active=eq.true&limit=1000', 5000).catch(() => []),
  ]);
  const newest = (list, f) => list.reduce((m, x) => { const d = day(x[f] || x.created_at); return d && (!m || d > m) ? d : m; }, null);
  const lmAll = newest(ls, 'updated_at');
  const lmDeal = k => newest(ls.filter(l => k === 'daily' ? l.deal_type === 'rent' && l.price_period === 'day' : l.deal_type === k), 'updated_at');
  const lmFor = { '/': lmAll, '/rent': lmDeal('rent'), '/buy': lmDeal('sale'), '/rooms': lmDeal('room'), '/daily': lmDeal('daily'), '/projects': newest(prs, 'created_at'), '/agents': newest(ags, 'updated_at') };
  const withListings = new Set(ls.map(l => l.agent_id).filter(Boolean));
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + STATIC.map(p => url(p, lmFor[p] || null)).join('\n') + '\n'
    + ls.map(l => url(S.listingPath(l), day(l.updated_at || l.created_at))).join('\n') + '\n'
    + ags.filter(a => a.slug).map(a => url('/agent/' + encodeURIComponent(a.slug), day(a.updated_at || a.created_at))).join('\n') + '\n'
    + prs.filter(p => p.slug).map(p => url('/project/' + encodeURIComponent(p.slug), day(p.created_at))).join('\n')
    + '\n</urlset>\n';
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.end(xml.replace(/\n+/g, '\n'));
};
