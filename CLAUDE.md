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
- Phones: bottom menu with 6 buttons – Home · Map · Experts · (+ Post, red, raised, in the middle) · Saved · Account.
- Posting a listing must always be visible straight away (header button, bottom menu, banner on the homepage).
- Homepage: big title + search box (City · District · Type · Budget · Search, with Rent/Buy/Rooms tabs) →
  "Want to rent out faster?" banner → category blocks: Recommended for you (TOP) · Newest · Cheapest rentals · Rooms · For sale.
- Cambodia only for now; every listing has country/city so other countries (Vietnam, Indonesia…) can be added later.

## Dashboard (owner, 2026-11-24)
- Very clear, big cards: Post listing · My listings · Messages · Statistics · Telegram alerts.
- Statistics: views per day, unique visitors, who viewed (anonymous: device, language, traffic source), when, which
  listing, contact clicks (phone / Telegram / WhatsApp), messages. Recent activity table.
- Telegram alerts are stored as requests (yh_alerts); sending needs the Telegram bot to be connected (not done yet).

## Rules for listings
- Posting is free; listings go live immediately (owner/admin can hide). Paid TOP placement is set only by admin
  (is_featured – advertisers cannot set it). Demo listings have is_demo=true and show a DEMO badge; delete them at launch.
- Login: email magic link + Google (Supabase Auth). Redirect URL https://yourhome.asia/** must be allowed in Supabase.

## Files
- index.html – page shell, header, footer, bottom menu · styles.css + header.css – design · app.js – the whole app
  (hash routes: #/ · #/search · #/l/<id> · #/post · #/edit/<id> · #/account · #/saved · #/experts · #/terms · #/privacy · #/support)
- i18n.js – all UI text in 5 languages (missing keys fall back to English).
- Supabase tables: yh_listings, yh_inquiries, yh_events (statistics), yh_alerts; storage bucket yh-photos.
