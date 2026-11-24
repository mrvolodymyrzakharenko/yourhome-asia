# Agent notes

- Static site: no framework, no build. Deploying = uploading these files to the Vercel project `yourhome-asia`
  (Production). Keep the files as they are; there is no package.json.
- Libraries load from CDNs: supabase-js (jsdelivr), Leaflet (unpkg), map tiles from OpenStreetMap.
- Only the Supabase publishable key is in app.js – never put a service-role key or other secret in this repo.
- Security lives in Supabase RLS + column grants on the yh_ tables. After any schema change run the Supabase advisors.
- Escape every user-supplied value with esc() before putting it into HTML.
- Read CLAUDE.md for the owner's rules before changing anything.
