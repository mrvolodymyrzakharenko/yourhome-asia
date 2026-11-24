@AGENTS.md

# Project rules (set by the owner – follow them on every task)

YourHome.asia – property portal for Cambodia (Phnom Penh first): rent, buy and rooms. Live at https://yourhome.asia
(www redirects to it). Vercel project `yourhome-asia` (team eleon / study-and-work), plain static site, no build step.
Data lives in the shared Supabase project "eleon" (same as the Study and Work portal) in `yh_`-prefixed tables only –
never touch the Study tables. When a new standing rule is agreed with the owner, add it here.

## Working style
- The owner writes in Hungarian; answer in Hungarian. Site content is in English plus Khmer, Chinese, French and Thai (i18n.js).
- The owner tests live: finished work goes straight to production on yourhome.asia – no temporary preview links.
- Design is approved: never change layout, classes or styles unless asked. Copy changes keep the design.
- Everything must work over HTTPS (SSL is automatic on Vercel).

## Design (owner, 2026-11-24)
- Structure copies vietrent.net (portal look), but in Cambodian flag colours: royal blue #032EA1 (main), red #E00025
  (accents: TOP badge, prices, Post buttons), white background.
- Header: small white header like the Study portal – NO coloured top strip. Logo "YourHome / Cambodia", language select
  (EN · ខ្មែរ · 中文 · FR · ไทย), round icons (contact, account), red "+ Post listing" button, "Menu" button with a dropdown.
- Footer like vietrent: logo + © line, links Listings · Experts · Terms · Privacy · Support.
- Bottom menu = the Study portal's bottom bar (owner, 2026-11-24: "legyen olyan mint a study portálon + gomb a posztoláshoz
  akármikor"), EVERY screen (phone, tablet, PC), every page: centred, max 400px, rounded top, pale-blue bar, labels 11px / 600,
  icons 21px; six equal columns Home · Map · Saved · Post (red plus, red label – always visible) · Experts · Account; the round
  blue Search button floats above the middle with no label (→ #/search). ALWAYS VISIBLE (owner, 2026-11-24: "az alsó menü mindig
  látható legyen") – from the first second, never hidden at the top of a page or on scroll (unlike the Study portal's fade-in). index.html .bnav, styles.css "Bottom menu" block.
- Homepage category blocks are UNIFORM (owner, 2026-11-24: "minden kategória legyen egységes – nincs két nagy kép, sem egy"):
  every block shows at most 4 equal cards in one row (2 per row on phones), never stretched or scrolling, then a
  "<category> · See all" button (.row4 / .block-more). Dashboard big cards are all the same white card (no red one).
- FONT SIZES = STUDY PORTAL – BASE RULE (owner, 2026-11-24: "betűk túl nagyok – legyenek olyanok, mint a study portálon"):
  no text larger than 13px anywhere; headings and bold text 13px / 600, letter-spacing -.025em; other text max 13px / 400;
  buttons 13px / 500 (phones 600). Only the homepage hero H1 and icon glyphs/emoji/initials keep their size. Card price =
  white pill on the photo (like the Study cards). fonts.css is loaded LAST and enforces it – new components add their
  classes there; no inline font-size above 13px or weight 700/800 in app.js/agents.js.
- Posting a listing must always be visible straight away (header button, bottom menu, banner on the homepage).
- Homepage: big title + search box (City · District · Type · Budget · Search, with Rent/Buy/Rooms tabs) →
  "Want to rent out faster?" banner → category blocks: Recommended for you (TOP) · Newest · Cheapest rentals · Rooms · For sale.
- Cambodia only for now; every listing has country/city so other countries (Vietnam, Indonesia…) can be added later.

## Dashboard (owner, 2026-11-24)
- Very clear, big cards: Post listing · My listings · Messages · Statistics · Telegram alerts.
- Statistics: views per day, unique visitors, who viewed (anonymous: device, language, traffic source), when, which
  listing, contact clicks (phone / Telegram / WhatsApp), messages. Recent activity table.
- Telegram alerts are stored as requests (yh_alerts); sending needs the Telegram bot to be connected (not done yet).
- SETTINGS ALWAYS VISIBLE (owner, 2026-11-24: "my account – settings – ez legyen mindig látható, legyen ott verification kérés
  is"): "⚙️ Settings" is the last dashboard tab, a button in the dashboard header (Back to site · Settings · Sign out) and an
  overview card. It holds: name + sign-in email, contact details for listings (saved in user_metadata.contact, prefill the post
  form) and "Get verified" – method (phone / video / Telegram / WhatsApp), contact, best time, note → table yh_verify_requests
  (user inserts only; status pending → verified/rejected set by admin). Verified = an own yh_agents row with verified_at or a
  'verified' request. No ID upload.
- "BECOME A VERIFIED ADVERTISER" CARD (owner, 2026-11-24): second big card on the dashboard overview (after Post listing) →
  #/account?tab=settings&v=1, which scrolls to the Get verified form; it shows "⏳ requested" while pending and "✓ You are a
  verified advertiser" once verified.

## Rules for listings
- Posting is free; listings go live immediately (owner/admin can hide). Paid TOP placement is set only by admin
  (is_featured – advertisers cannot set it). Demo listings have is_demo=true and show a DEMO badge; delete them at launch.
- Login: email magic link + Google (Supabase Auth). Redirect URL https://yourhome.asia/** must be allowed in Supabase.

## Agent profiles + links to other sites (owner, 2026-11-24: "Agent külön oldalak… belinkelheti… Booking, trip.com, agoda…")
- Every advertiser can create one or more public profiles (table yh_agents: name, agent/agency/owner, company, photo, bio,
  languages, areas, phone/Telegram/WhatsApp/email, links) in the dashboard tab "My agent profile" (#/account?tab=agent).
  Public page #/agent/<slug> = profile + all active listings that carry it. Experts page (#/experts) = "Agents & agencies"
  (profile cards, verified first) + "Other advertisers" without a profile.
- The post form has an "Agent profile" block: pick one of your own profiles (agent_id – the database refuses someone else's)
  and optional links of THIS property on Booking.com, Agoda, Trip.com, Airbnb, Expedia, Google Maps + 2 free fields
  (yh_listings.external_links [{name,url}]). Profiles take Booking, Agoda, Trip.com, Airbnb, Google Maps, Facebook,
  Instagram, TikTok, YouTube, Khmer24, Realestate.com.kh, website + 1 free field.
- The site name and colour come from the link's address (SITES in agents.js), never from what the user typed. Links: https
  only, max 12, never yourhome.asia (yh_clean_links() in the database), opened in a new tab with rel="nofollow ugc noopener".
- Wording: "Also on Booking.com". "✓ Verified on …" and the "Verified" badge only when OUR team set yh_agents.verified_at
  (admin / service key only; changing name, kind or company removes it). NEVER "Verified by Booking" – that would say the
  other company checked it.
- PULL BEFORE EDITING app.js: other sessions also work here – `git pull` first, never push an older copy of app.js (that drops the AG.* hooks).
- Code: agents.js (all agent UI + its own 5-language texts TX), agents.css; app.js only calls AG.* (listing page #agBox /
  #agLinks, post form block, dashboard tab, #/agent route, experts page).

## Files
- index.html – page shell, header, footer, bottom menu · styles.css + header.css – design · app.js – the whole app
  (hash routes: #/ · #/search · #/l/<id> · #/post · #/edit/<id> · #/account · #/saved · #/experts · #/agent/<slug> · #/terms · #/privacy · #/support)
- i18n.js – all UI text in 5 languages (missing keys fall back to English).
- Supabase tables: yh_listings, yh_inquiries, yh_events (statistics), yh_alerts, yh_agents; storage bucket yh-photos.
