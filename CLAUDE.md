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
- Header: small white header like the Study portal – NO coloured top strip. Logo = house in Cambodian blue/red/blue inside a white rounded square + TWO lines centred vertically next to it: "www.yourhome.asia" (menu-name type 13px / 500, phones 12px / 600) and under it red "CAMBODIA" in spaced capitals 11px / 700 (phones 10px), CENTRED under line 1 (owner 20:37 / 20:39; .brand .b1 + em, end of fonts.css), header AND footer (owner, 2026-11-24; header.css + fonts.css .brand; phones: 12px text, 26px house – owner 21:12), language select
  (EN · ខ្មែរ · 中文 · FR · ไทย), round icons (contact, account), red "+ Post listing" button, "Menu" button with a dropdown (the word "Menu" shows on phones too – owner 21:29).
  PHONES (owner, 2026-11-25 11:09: "told az ikonokat balra, legyen a menügomb nagyobb… a csíkok helyére írd ki, hogy menü"): the header
  buttons start right after the logo and the Menu button fills the rest of the row, showing ONLY the word "Menu" (no three-line
  icon, never hidden by hfit2); the header Account icon is hidden on phones (end of header.css).
  Language pill: own small chevron close to the code with room after it (owner, 2026-11-24). "Become a partner" (white pill,
  → #/partners) sits right before Menu on screens over 980px; narrower screens have it in the Menu list (owner, 2026-11-24).
  "New projects" (white pill → #/projects) sits before it on screens over 1180px, and is the 2nd Menu item + a footer link.
- FOOTER = STUDY PORTAL FOOTER (owner, 2026-11-24: "profi lábléc… Terms and Conditions… Facebook, Telegram, WhatsApp, Viber…
  mint a Study portálon"): index.html footer.yft – brand column (logo, one line, phone +855 96 306 8590, info@yourhome.asia,
  Phnom Penh, reply line) · Find a home (incl. New projects) · For advertisers (Become a partner → #/partners) · "Chat with us" (brand-coloured pills Telegram t.me/+855963068590,
  WhatsApp wa.me/855963068590, Viber, Facebook + red Post listing) · bottom row © · Terms and Conditions · Privacy Policy ·
  Support + safety line. The same number is the owner's Telegram, WhatsApp and Viber. Facebook shows "coming soon" until
  its page link is filled in (href + remove data-soon). The Support page reuses the chat pills. Texts: FT block in i18n.js;
  styles "FOOTER" in styles.css, sizes at the end of fonts.css; phones: link columns two side by side.
  RICHER (owner, 2026-11-24 20:18: "about us… profi portáltervezők, profi ingatlanosok… study stílusra"): + "Follow us" round
  brand icons (Facebook, Telegram channel, Instagram, TikTok, YouTube – "coming soon" bubble until a link is filled in) and a
  Company column: About us (#/about), How it works (#/how), Safety tips (#/safety), FAQ (#/faq), Contact us, Terms, Privacy.
  Those pages are PAGES in app.js (English, no invented numbers), styles .ab-* (kicker, H1 with a red word, cards, blue CTA band).
- Bottom menu = the Study portal's bottom bar (owner, 2026-11-24: "legyen olyan mint a study portálon + gomb a posztoláshoz
  akármikor"), EVERY screen (phone, tablet, PC), every page: centred, max 400px, rounded top, pale-blue bar, labels 11px / 600,
  icons 21px; six equal columns Telegram · Home · Saved · Post (red plus, red label – always visible) · Map · Account
  (owner, 2026-11-24 17:37: "kellene egy telegram gomb – amivel fel tud iratkozni a yourhome.asia csatornára" – Telegram replaced
  Experts, which stays in the menu/footer). Telegram (and the footer Telegram icon, [data-tgch]) opens the small card "Join our
  Telegram channel" + "Join on Telegram" (app.js TG_CHANNEL = the channel's username; empty = "coming soon"; once set, the card
  also opens by itself once per visitor, 3 s after load, for 7 s – localStorage yh_tgch); texts TC in i18n.js, styles .tgch; While the map is open (#/search?view=map) the Map button
  turns into grid icon + "Listing" and leads back to the same search as a list (owner, 2026-11-25: "ha mapre kattint, váltson át
  listing ikonra – így egyértelmű"; route() in app.js); the round
  blue Search button floats above the middle with no label (→ #/search). ALWAYS VISIBLE (owner, 2026-11-24: "az alsó menü mindig
  látható legyen") – from the first second, never hidden at the top of a page or on scroll (unlike the Study portal's fade-in). index.html .bnav, styles.css "Bottom menu" block.
- Homepage category blocks are UNIFORM (owner, 2026-11-24: "minden kategória legyen egységes – nincs két nagy kép, sem egy"):
  every block shows at most 4 equal cards in one row on PC/tablet, never stretched or scrolling, then a
  "<category> · See all" button (.row4 / .block-more). Dashboard big cards are all the same white card (no red one).
- FONT SIZES = STUDY PORTAL – BASE RULE (owner, 2026-11-24: "betűk túl nagyok – legyenek olyanok, mint a study portálon"):
  no text larger than 13px anywhere; headings and bold text 13px / 600, letter-spacing -.025em; other text max 13px / 400;
  buttons 13px / 500 (phones 600). Only the homepage hero H1 and icon glyphs/emoji/initials keep their size. Card price =
  white pill on the photo (like the Study cards). fonts.css is loaded LAST and enforces it – new components add their
  classes there; no inline font-size above 13px or weight 700/800 in app.js/agents.js.
- SEARCH ROW (owner, 2026-11-24): Rent · Daily · Buy · Rooms · Projects | Apartment · Condo · Studio · Villa · House –
  10 items, phones 5 + 5 in equal centred columns (owner: "egymás alatt… egyenlő távolság"); Projects → #/projects;
  phones row 2 = House · Condo · Studio · Villa · Apartment (House under Rent, Apartment under Projects – CSS order)
  (French: Maison · Condo · Studio · Appartement · Villa – the long word gets the wider middle slot, owner 20:45)
  NO divider lines in these two rows on phones (owner, 2026-11-24 20:45: "akár ki is veheted itt a vonalakat").
  (DAILY RENT, owner 2026-11-24: "egyből látható legyen" – Daily = deal_type 'rent' with price_period 'day'; deal=daily in the
  URL; post form "Daily rent"; homepage block "Daily rentals & short stays" after Rooms; phones: 5 + 5) (CATS in
  app.js; Condo = 8th item, owner 2026-11-24). TEXT WITH DIVIDERS like the Study search-type tabs (owner, 2026-11-24 screenshot:
  "ne legyen begombozva"): no box, grey text, thin 1px dividers, the picked one a light pink patch with RED 600 text; phones
  4 per row (styles.css "CATEGORY ROW = TEXT WITH DIVIDERS"). On phones the row, the chips and the project tabs
  WRAP centred – never sideways scrolling (owner: "nem lehet sor elcsúszva jobbra"). Search card on phones/tablets: City | District
  side by side (District = a real list: Any + DISTRICTS; on phones/tablets every search-card select opens OUR small list in the middle
  of the screen – about 20% free top and bottom, 16% at the sides, with an X at the very top, never the phone's full-screen picker (picker.js, .ypk); every search-card select has a small FILLED triangle arrow, no outline chevron), Type | Budget under them, fields ~5% lower, every label and value centred, select arrows inside with room after them (styles.css last blocks);
  FILTERS = TWO ROWS (owner, 2026-11-24: "ne gombozd be… csak két sor"): under the card row 1 = quick filters as text with
  thin dividers, tight (phones: 1+ bed · 2+ beds · 3+ beds · Furnished on ONE line – the quick amenities and Owner only move
  into More filters, .q-x / .mp-q), row 2 = More filters | ▦ Listings | 🗺 Map (LIST / MAP SWITCH – owner: "nagyon fontos";
  viewSwitch() inside chipRow() in app.js). No boxes anywhere; the picked one = pink patch with red 600 text;
  a category opens the results at once (deal of the active tab; Studio = bedrooms 0). The results page (#/search) shows
  EXACTLY the homepage top – title, lead, the row, the search card and the chips – with the results under it (owner,
  2026-11-24: "pont ugyanolyan legyen és ha bármire kattintok ne tűnjön el"; hero() in app.js; active tab + category
  highlighted, a second click on a category clears it).
  Hero "Cambodia": bold (800), red, with EXACTLY the Georgia site underline (hero-x.mjs path M2 7 C 30 2, 70 2, 98 6,
  left -2%, width 104%) but RED #E00025 and thicker: stroke 5.5, bottom -.2em, height .3em (owner, 2026-11-24: "kék vonal fos – legyen piros és vastagabb"); title size = Georgia one-line hx-one
  clamp(26px,3.7vw,46px)
  (owner, 2026-11-24; fonts.css .hero h1 em::after). Under the card: filter chips
  1+ bed · 2+ beds · 3+ beds · … · More filters – no bed icon, no Studio chip.
- FILTERS PANEL (owner, 2026-11-24 20:22 Tbilisi: NO × any more – the "Filters" word itself turns red with the pink patch while
  the panel is open and closes it again; no empty row above the panel. AMENITIES (20:23): short panel labels (s_<key> in i18n.js via sl() in app.js: Pets OK,
  Owner, EDC power, Wi-Fi, Cleaning, Utilities, Air-con, Washer, Photos…), tight spacing – 3 lines on phones, so the open panel is
  4 rows in all (selects + 3). Earlier 17:27: no Reset / Close row; a wrapped amenity line
  never starts with a divider – markLineStarts() in app.js; its four selects – and the search-card selects and Newest – open OUR rounded list (picker.js) on EVERY screen, a 300px card on PC; owner: "legyen egységesen szép"). Earlier (20:11): no white box – full width; Bathrooms · Min. size · Rental term · Listed within in
  ONE row of four columns (grey label, borderless value + small chevron, thin dividers); amenities and Reset | Close as grey
  words with thin dividers like the quick filters (picked = pink patch). No buttons, no outlines – only the thin strips. A round × top-right closes it; Pool/Gym (row 1) are not repeated.
- PC SEARCH AREA (owner, 2026-11-24 evening): the search card is 972px wide and ~10% lower; the 10 categories above it and the
  filters under it are exactly as WIDE AS THE CARD, on PC the quick filters (owner 17:28: EQUAL GAPS between the words, space-between – not equal columns) and More filters |
  Listing | Map | Subscribe | Newest share ONE full-width line (styles.css "PC: the rows around the search card").
  The card is ~5% taller again (owner: "túl szűk"). The four fields are EQUAL, label + value centred, the small filled triangle right after the value (owner: "lélegezzen, de ne ennyire").
- PHONE SEARCH CARD (owner, 2026-11-24 20:08): City · District · Type · Budget in ONE row (City a little wider, short labels),
  then Post listing + Search in the row below.
- Posting a listing must always be visible straight away (header button – on phones a compact red "+ Post" before Menu,
  the header account icon then left to the bottom menu (owner, 2026-11-24 20:13) –, bottom menu, banner on the homepage, and a white
  "+ Post listing" button (red text) right before the red Search button in the search card – owner, 2026-11-24; .sbtns, phones two equal buttons in one row).
- Homepage: big title + search box (City · District · Type · Budget · Search, with Rent/Buy/Rooms tabs) →
  category blocks, with the "Want to rent out faster?" banner BETWEEN the first and second block (owner 17:26; phones: ONE compact
  row: NO "+" circle, ONE line of call to action + button pill, vertically centred – owner 2026-11-25; now the random strips below). Blocks: Recommended for you (TOP) · Newest · Cheapest rentals · Rooms · For sale.
- FADE-IN (owner, 2026-11-24: "minden új tartalom fade in effekttel töltődjön – mobilon is, tabon is"): fade.js (loaded before
  app.js) fades every new element in #app and the popup details, staggers cards, fades photos in once loaded; header and
  bottom menu never fade. CSS block "FADE-IN" at the end of styles.css. Keep it when adding new pages.
  The SEARCH AREA never fades (owner, 2026-11-24 20:49: title, category rows, search card, the two filter rows, filters panel –
  STILL in fade.js); after a category / filter click only the listings fade in.
- NOTHING STICKS OUT ON PHONES, EVERY LANGUAGE – BASE RULE (owner, 2026-11-24 20:26: "semmi sem lóghat ki, semmi!!!"): fitRows()
  in app.js (run with fitCards) – a row of words (quick filters, filter row, deal/category row, panel selects) whose items pass the
  screen first gets smaller letters (down to 11px), then wraps centred (.fitwrap, no divider at a line start); the header first
  tightens (body.hfit1), and only if still too wide drops the "Menu" word (hfit2). Check EN/KM/ZH/FR/TH at 360/390/412 after a change.
- HERO LINE under "Find your home in Cambodia" = ONE short line in every language (owner, 2026-11-24 20:29; heroSub in i18n.js,
  nowrap + shrink in fitRows). The filters panel has no "Amenities" heading (owner 20:27).
- DISTRICTS FOR EVERY CITY (owner, 2026-11-24 20:28): the District list (search card and post form) shows the picked city's own
  districts – Phnom Penh DISTRICTS, other cities CITY_DIST in app.js (sangkat names from Wikipedia "List of communes in Cambodia").
- PROPERTY TYPES (owner, 2026-11-24 20:34, realestate.com.kh "All types"): Apartment · Condo · House · Villa · Twin Villa ·
  Link House · Flat House · Flat · Penthouse · (Studio – search only, = 0 bedrooms) · Shophouse · Room · Office · Land
  (TYPES / SEARCH_TYPES in app.js, t_* in i18n.js, yh_listings_property_type_check in the database).
- SORTING (owner, 2026-11-24 20:51, tokki.house): Newest · Price: low to high · Price: high to low · Area: largest first ·
  Area: smallest first (#sortSel, SORTS in app.js, so_* in i18n.js; listings without an area come last).
- CURRENCY (owner, 2026-11-24 20:55, realestate.com.kh menu): USD · KHR · THB · CNY · JPY · EUR – always in the Menu list
  (2 columns, .dr-cur), in the header (#cur) only on screens ≥1320px. Prices stay USD in the database; money() converts with
  today's rate (open.er-api.com, cached 12 h in yh_rates); without a live rate it shows USD. Choice saved in yh_cur.
- MENU LIST (owner, 2026-11-24 20:59): on phones/tablets the open Menu is 70% of the screen wide (right side), scrolls if long;
  its first row is a red "✕ Close menu" button (#drClose, closeMenu in i18n.js).
  The menu links sit in TWO COLUMNS (owner 21:02: "menüpontok két sorban"); Close menu and Currency span both (end of header.css).
- CALL-TO-ACTION STRIPS BETWEEN LISTINGS (owner, 2026-11-25): no fixed banner any more – placeCtas() in app.js puts a RANDOM strip
  after every 4–6 listings on phones and every 8–12 on PC/tablet (PC: only after a full row / a whole homepage block), never the same
  kind twice in a row: post a listing · daily rental · sale · spare room · become a partner (#/partners) · post your project
  (#/partners?type=developers) · become a verified advertiser (#/account?tab=settings&v=1). Texts cv_/cvs_ (short phone line)/cvb_
  (button) in i18n.js, 5 languages. Homepage blocks and the results grid.
- MENU LIST: "Become a partner" spans both columns as the last link row (pale blue), the rest two columns; long names wrap
  onto a second line on phones – never "…" (owner, 2026-11-25).
- EVERY DROP-DOWN LIST = OUR SMALL LIST (owner, 2026-11-25 11:23, screenshot of the phone's full-screen list in the post form:
  "sose nézzen ki így a választási menü… legyen olyan, mint a fő oldalon, picibe. Nehogy ilyet meglássak még"): picker.js opens
  the small rounded .ypk list for EVERY <select> on the site, on every screen (post form, dashboard, partner form, agent
  profile, header language/currency…) – never the phone's own full-screen picker. New selects need nothing extra; only
  <select multiple>, size>1 or data-native keep the native one (don't use data-native without the owner's OK).
- ROUND × BUTTONS (owner, 2026-11-25): every close / remove × is a DRAWN X (svg .xic or the popup/picker icons) in the exact
  centre of its circle – never the text character "×" (it sits off-centre).
- Cambodia only for now; every listing has country/city so other countries (Vietnam, Indonesia…) can be added later.
- CITIES (owner, 2026-11-24 20:17 Tbilisi: "legyen az összes nagy város a listában, de a kezdő Phnom Penh"): the search card's
  City select and the post form list every province capital + Poipet and Bavet (CITIES in app.js, 26 cities); Phnom Penh
  is FIRST and the default. Phnom Penh = district list (DISTRICTS); other cities = typed district in the post form and
  "Any" in the search. ?city= filters the results; the post-form map centres on the picked city. yh_listings.city.

- PHONES = STUDY PORTAL MOBILE CARDS (owner, 2026-11-24: "vedd ki a mobilos nézetet a Study and Work portáról… nem lehet
  kettő egy sorba, tökre úgy nézzen ki"): under 720px every listing grid (.row4, .grid, .row-scroll) is ONE card per row, the
  Study .pcard look: light pills on the photo in CAMBODIAN COLOURS (owner, 2026-11-24; 10% taller since 20:41): price = faint red field + red text,
  bedrooms/stage = faint blue field + royal-blue text, type = white field + grey text, TOP solid red, DEMO dark, white round
  heart (a WIDE drawn heart icon, outline → solid RED when saved, the circle is as tall as the photo labels (29px), only the heart drawing is small (13×11px) – owner 20:43; HEART in app.js), camera count bottom-right, then THREE ROWS like vietrent (owner, 2026-11-24): bold "1 bedroom · Apartment · Rent"
  (bedrooms blue, type dark, deal red) as THREE EQUAL CENTRED COLUMNS with thin dividers and a hairline under them,
  red pin + "District, Phnom Penh" centred, red "View apartment →" centred; ~10% roomier padding (owner: "szépen elosztva") (no title / bathrooms line on
  phones). PHOTO SLIDER like vietrent (owner, 2026-11-24): every photo of the listing (max 15 since 2026-11-25), swipe sideways inside the card, dots in the middle at the bottom – the current one a white dash – a
  tapped dot moves there; the PRICE is written on the photo bottom-left in white ("$200 /month", 19px – the owner's exception to
  the 13px rule, like vietrent), no price pill at the top on phones. Sample listings: "Demo photo" pill only (renamed from "Sample", owner 2026-11-25) (the yellow note above the lists and the "N listings" count were removed – owner 21:58) (card() extra .yb*/.y* elements,
  shown only on phones – styles.css last block). Only one "Post listing" filler card per block on phones.

- CARDS LIKE VIETRENT (owner, 2026-11-24): every listing card 24px corners + soft deep shadow (styles.css "CARDS LIKE VIETRENT";
  vietrent's own CSS could not be read – value set by eye, change only that rule if the owner wants it closer).
  PHONE CARD = VIETRENT 3 ROWS (owner, 2026-11-24 20:00, replaces the 6-fact version; vietrent screenshot): NO date pill at the
  top of any card – on phones the date is written on the photo bottom-left, dots in the middle, price bottom-right (.ydate,
  no camera count; owner 20:01); 1) bold "Apartment for rent in BKK1" / "… for sale in …" (17px/700, nameRent/nameSale + inPlace), 2) pin + "Phnom Penh, <street
  address the advertiser typed>" (no address: "Phnom Penh, Cambodia"; owner 20:02); rows 1–2 CENTRED one under the other (owner 21:11; was left like vietrent) and each FILLS the card width from edge to edge – fitCards() in app.js
  sizes them – since 19:55 ONE size on every card: the size at which "Apartment for rent in BKK1" fills the card is used for every
  name (ONE line – a longer name ends with … in the name's own colour, owner 20:05–20:06) and the size at which "Phnom Penh, No. 24, Street 278" fills it for every address (longer end with …), address row: city light grey, street address mid-grey (lighter since 20:44), one line each with … at the end; the demo
  listings have sample street addresses,
  3) hairline + FOUR marks: bed · bath · two amenity icons (gym, wifi, pool, parking, air-con; AM_ICON; m² only if fewer
  than two) in equal columns with dividers. Name row ONE colour, 800 weight (owner 20:07: "nem lehet fele-fele"): odd cards
  name blue + icons red, even cards name red + icons blue; the icon-row NUMBERS take the icons' colour (owner 20:16); the name is
  2px under the full-width fit and the address 2px under its fit (owner 20:56) with slightly wider letter spacing. Phone corners 36px + soft deep shadow
  (measured from the screenshot); PC 24px.
- AGENT BAR ON EVERY CARD (owner, 2026-11-24 21:24, khmer24 screenshot): hairline, round photo (yh_agents.photo of the listing's
  agent_id, else initials), name (agent name, else contact_name), three round outline buttons Call (blue) · WhatsApp (green) ·
  Telegram (sky) from the listing's contact fields (agent's as fallback; a phone number works as t.me/+…). The card is a link,
  so they are .yab spans opening their own link (click counted in yh_events). agentBar() in app.js; fetchListings attaches
  l._agent. Photo order: agent photo → yh_listings.contact_photo (https only) → initials. Demo listings: invented Khmer names
  (Sokha Chan, Sreymom Ly, Dara Heng, Bopha Kim, Vannak Mao, Chanthy Sok) with free Unsplash portraits and the portal number.
- FILTERS = TWO ROWS ON THE RESULTS PAGE TOO – and the HOMEPAGE has the same Subscribe + Newest in row 2 (owner, 2026-11-24 22:21;
  resultTools() in app.js; on the homepage Newest opens #/search sorted) (owner, 2026-11-24: "Telegram alerts… csak egy Telegram logó, ha rámegy kiírja…
  ne legyen kiírva, hogy sort, csak newest… két sorba, nem háromba"): row 2 = More filters | grid icon + Listing | map icon + Map (icons on phones too; phones hide the Filters icon) | Telegram logo + "Subscribe" (owner, 2026-11-24 19:56) | Newest – the Telegram button
  (#notifyBtn, name in a bubble on hover) | "Newest ▾" select (no "Sort:" word); no separate tools row under the heading.
  Row 1 on EVERY screen and tab = 1+ bed · 2+ beds · 3+ beds · Furnished (Buy: Foreigners can buy) · Pool · Gym (owner, 2026-11-24: "nem a private bedroom kell, hanem gym és pool"; other amenities, EDC and Owner only in More filters; on phones the row spans the search card's full width, chips share it equally, .q-x1; owner, 2026-11-24), edge to edge, "More filters" reads "Filters"; both rows
  fit one line each from 360px.

- STUDY PORTAL = THE DESIGN REFERENCE (owner, 2026-11-24: "az összes betűtípust, az összes megjelenést vedd ki a Study
  portál szabályaiból"): fonts, sizes, weights, spacing, cards, banners and buttons follow the Study and Work portal's rules
  (its CLAUDE.md "Font sizes and weights"): Plus Jakarta Sans; max 13px (banner H1s excepted); headings/bold 13px / 600 /
  -.025em; body max 13px / 400; buttons 13px / 500 (phones 600) with -.025em. Check: render the page and make sure nothing
  except hero H1s, the logo and glyphs is over 13px or over 600.

## Become a partner page (owner, 2026-11-24: "vedd ki teljesen a became a partner oldalt… minden olyan szolgáltatást, ami
   az ingatlanos oldalhoz lehet… kategóriákat, kártyákat")
- #/partners = port of the Study For Partners page (partners.js viewPartners + partners.css): banner (photo fading in from
  white on the right) → Who Can Partner With Us? (6 photo cards: agents & agencies, owners & landlords, developers, hotels /
  guesthouses / short stays, property management, legal & notary) → Home Services Partners (12 icon cards: moving, cleaning,
  interior & furniture, renovation, air-con & electrical, pest control, valuation, mortgage & banking, insurance, photo/video/
  3D tours, internet & utilities, security & smart home) → How Partnership Works (5 steps) → 6 benefit tiles → Choose Your
  Partnership Type (listing, developer, service, advertising, country representative) → Partner Dashboard → Partner
  Application form → Country Representative band. Every card scrolls to the form with its type preset; #/partners?type=<key>
  opens it preset. Applications → yh_partner_requests (anon/auth INSERT only, status 'new'; our team reads them with the
  service key). Card counts stay EVEN (full rows of two on phones).

## New projects (owner, 2026-11-24: "legyen egy olyan fő menüpont, hogy projects… new projects")
- #/projects (tabs All · Pre-sale · Under construction · Ready) and #/project/<slug> (gallery, facts, amenities, price from,
  call / Telegram / WhatsApp, "Ask about this project" → yh_project_leads, insert only). Homepage block "New projects" after
  the category blocks. Table yh_projects (public read of active rows; only our team adds/edits with the service key;
  is_demo = sample, 4 demo projects – delete at launch). Developers apply via #/partners?type=developers.
- PROJECT PAGE LOOK (owner, 2026-11-25: "egy nagy kép mellette 8 pici kocka… vagy egy nagy kép és listáz jobbra-balra… mobilon
  adatlap, hogy milyen projekt, mikor indul"): gallery() in partners.js – PC/tablet one big photo (swipe + round arrows, "3 / 12"
  counter, "All N photos") with 8 small SQUARES beside it (2 × 4, the 8th "+N", the shown one red-framed); phones: the big photo
  swipes sideways, 4 small photos under it (4th "+N"). Every photo opens the full-screen viewer lightbox() (.pgl: swipe, arrows,
  arrow keys, thumbnails, drawn X, Escape/Back close). Under the title: phones a price bar ("Prices from" red 20px + "Ask about it"
  → the form), then "Project overview" fact sheet sheet() – stage timeline Pre-sale → Under construction → Ready to move in and
  rows Status · Sales start (yh_projects.sales_start) · Completion · Developer · Unit types · Apartments · Floors · Location ·
  Prices from (2 columns PC, 1 on phones). Project CARDS have the listing cards' photo slider (pslider(): .ygal/.ydots/.yarr;
  placeDots() centres the dots between the price pill and the photo count). Demo projects: 12 photos each. Styles: end of partners.css.

## Dashboard (owner, 2026-11-24)
- Very clear, big cards: Post listing · My listings · Messages · Statistics · Telegram alerts.
  LOOK (owner, 2026-11-24 19:48: "mi ez a kinézet? javítsd"): compact header, its three buttons spread over the full width in equal
  columns, 12px side margins on phones (owner 19:51); tabs as grey words with thin dividers (picked =
  pink patch, red text), no pill box; tiles .dtile = line icon in a soft round badge (blue / red alternating), title, one line;
  Post listing tile red; 2 per row on phones, 4 on PC (styles.css "DASHBOARD"). No emoji icons.
- Statistics: views per day, unique visitors, who viewed (anonymous: device, language, traffic source), when, which
  listing, contact clicks (phone / Telegram / WhatsApp), messages. Recent activity table.
- Telegram alerts are stored as requests (yh_alerts); sending needs the Telegram bot to be connected (not done yet).
- SETTINGS ALWAYS VISIBLE (owner, 2026-11-24: "my account – settings – ez legyen mindig látható, legyen ott verification kérés
  is"): "⚙️ Settings" is the last dashboard tab, a button in the dashboard header (Back to site · Settings · Sign out) and an
  overview card. It holds: name + sign-in email, contact details for listings (saved in user_metadata.contact, prefill the post
  form) and "Get verified" – method (phone / video / Telegram / WhatsApp), contact, best time, note → table yh_verify_requests
  (user inserts only; status pending → verified/rejected set by admin). Verified = an own yh_agents row with verified_at or a
  'verified' request. No ID upload.
  APPROVAL: #/account?tab=admin (button "🛡 Admin" in the dashboard header, only for emails in table yh_admins – seeded with
  mr.volodymyrzakharenko@gmail.com; add more with the service key). Lists waiting / decided requests (email, method, contact,
  time, note) with "Mark as verified" / "Reject" → RPC yh_admin_verify(): sets the request status and verified_at on all the
  user's yh_agents rows; a profile created later inherits it (trigger yh_agents_inherit_verify).
- "BECOME A VERIFIED ADVERTISER" CARD (owner, 2026-11-24): second big card on the dashboard overview (after Post listing) →
  #/account?tab=settings&v=1, which scrolls to the Get verified form; it shows "⏳ requested" while pending and "✓ You are a
  verified advertiser" once verified.

## Listing popup (owner, 2026-11-24: "ha ingatlanra kattintok ez jöjjön be" – the Study portal apartment popup)
- A click on ANY listing card opens the popup over the page (popup.js + popup.css, port of the Study apartments.js popup):
  photo gallery left (blurred backdrop, arrows, dots, date pill, swipe, arrow keys), details right that scroll (tags, title,
  district + "exact address after contact", Bedrooms/Bathrooms/Area circles, Description, Amenities, agent links #agLinks,
  Stay safe note, Contact section with #agBox, Telegram/WhatsApp/call and the message form → yh_inquiries), a fixed price bar
  with Contact owner (scrolls to the contact section), round close button and the share column (share, Telegram, Facebook,
  WhatsApp, copy link, save). #/l/<id> = the popup (pushState; Back/Escape/× close it and the page below stays as it was);
  a shared link opens it over the homepage.
  Colours: red for the pin, section headings, Contact hover and Save; BLUE used sparingly (owner, 2026-11-24: "legyen benne
  kék is ritkán"): type tag, underline under the city, the Bedrooms/Bathrooms/Area icons, share-column hover.
  CAMBODIAN DESIGN (owner, 2026-11-24, vietrent screenshots: "hasonló, de legyen szebb"): light tags like the cards, the three
  facts as soft cards, white price bar with a RED 20px price (owner's exception) and a red "Contact owner" pill (no black
  button); phones: 46% photo, rounded white sheet over it, full-width text (popup.css last block). The old full listing page (viewListing) is no longer routed.

- WHO ARE YOU? + TERMS (owner, 2026-11-25: "legyen ugyanúgy, mint a study portálon… hirdető vagy kereső"; "el kell fogadni a
  terms and conditions is"; "legyen fullos a dashboardjuk az agenteknek, agencyknek"): the first time a signed-in user opens the
  dashboard (and whenever user_metadata.terms_accepted_at is missing) it asks "How would you like to use YourHome?" – three
  Study-style tiles: Tenant or buyer · Owner or landlord · Agent or agency – with a REQUIRED tick accepting the Terms of service +
  Privacy policy (user_metadata.terms_version / terms_accepted_at; TERMS_V in app.js – raise it after a material change).
  Stored as user_metadata.role (seeker | advertiser) + adv_kind (owner | agent). The "🔍 Looking for a home · 🏠 Advertising"
  switch on top of every dashboard changes the role any time (#/account?as=seeker|advertiser). SEEKER dashboard (viewSeeker):
  Find a home · Saved · New listing alerts (yh_alerts new_listings – list, add, delete) · Map · Settings · I want to advertise.
  ADVERTISER dashboard = the full one; for an agent/agency without a profile the first (red) tile is "Create your agent or
  agency page" and choosing Agent opens the agent profile tab.
  POPUP (owner, 2026-11-25 11:03: "legyen az az ablak, amit már beillesztettem… bérel vagy kiad… a landlord mellé agency vagy
  agent"): the choice is a MODAL (rolePopup() in app.js, .rpop in styles.css) like the Study portal's Tenant / Landlord window:
  "Your account · How would you like to use YourHome?" – two tiles Tenant | Landlord · Agent · Agency (then I am: Owner · Agent ·
  Agency), required Terms tick, red Continue. It opens right after sign-in on any page, on page load for a signed-in user who
  has not chosen, and on the dashboard (closing it there goes home). No "Become a partner" in it (that has its own page).

## Rules for listings
- POST FORM CHOICES (owner, 2026-11-25: "kevés az opció… stúdió, one bedroom… daily, weekly, monthly, other… hourly"):
  Bedrooms = list Studio · 1 · 2 · 3 · 4 · 5+ (stored 0–5), Bathrooms = 1 · 2 · 3 · 4 · 5+. "Price per" = day · week · month ·
  other… (an "Other period" text field appears, yh_listings.period_note, max 40) · total price (sale only). Suffixes /hour /week
  (priceSuffix in app.js, per in api/_seo.js). NO hourly rent in Cambodia (owner, 2026-11-25: "nem erőltetjük" – short-time
  rentals would bring the wrong listings); the database still accepts 'hour' but the form never offers it.
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

## Clean URLs + server HTML (owner, 2026-11-25: "mehet" – SEO rules in the project doc claude/seo-rules.md)
- Real addresses, no "#": / · /rent · /buy · /rooms · /daily · /search · /listing/<id>-<slug> · /agents · /agent/<slug> ·
  /projects · /project/<slug> · /partners · /about · /how-it-works · /safety · /faq · /support · /terms · /privacy ·
  /account · /post · /edit/<id> · /saved. Old "#/…" links are turned into these on load (never break).
- router.js (loaded first, in <head>) translates: the app code still writes "#/…" routes – YH.h() = current route as "#/…",
  YH.go(h) = navigate (pushState + synthetic hashchange), every drawn <a href="#/…"> is rewritten to its clean path,
  internal clicks stay in the same tab without reload. Never read location.hash in new code – use YH.h(); links may be
  written as "#/…" or as clean paths. Listing links: YH.listingPath(l) (slug = api/_seo.js listingSlug – keep both equal).
- vercel.json sends every path without a dot to api/page.js, which answers with index.html + the page's OWN head
  (title ≤60, description ≤160, canonical, og/twitter, JSON-LD Organization + BreadcrumbList + RealEstateListing /
  RealEstateAgent / FAQPage …) and its first content inside <main id="app"> (div.ssr – invisible, the app redraws it).
  About/How/Safety/FAQ/Terms/Privacy text is read from app.js PAGES (same words). Unknown address = 404 + noindex
  ("This page is currently unavailable"), removed listing = 410, wrong listing slug = 301. index.html is the shell –
  its head sits between <!--seo--> and <!--/seo--> (replaced per page). /sitemap.xml = api/sitemap.js (generated), robots.txt static.
- LANDING PAGES: /<rent|buy|rooms|daily>/<city-slug>[/<district-slug | type-slug>] (e.g. /rent/phnom-penh/bkk1,
  /buy/phnom-penh/condo, /rent/phnom-penh/studio). In the app = #/search?deal=…&city=…&q=<district> or &type= (router.js;
  viewSearch maps slugs back to the exact names). Indexable + in the sitemap only when live listings exist (api/_seo.js
  landings()); empty combination = noindex. The city page links its districts/types; /rent links the cities.
- LOADING = SKELETON CARDS (owner, 2026-11-25: "betöltésnél ilyen megjelenés van, szerintem ez hiba"): never the big white
  "Loading…" box for listing lists – skelRow() / window.yhSkel in app.js (pale shimmering cards in the real cards' place, 4 on
  PC, 1 on phones; styles.css "LOADING = SKELETON CARDS").
- The hidden server HTML (div.ssr) is never faded in by fade.js and is visibility:hidden (owner, 2026-11-25: "még mindig valami
  szöveg bevillan") – the visitor sees nothing until the app draws the page.
- INSTANT FIRST PAGE (owner, 2026-11-25: "nem tudod egyből magát az oldalt betölteni?"): EVERY page incl. "/" is answered by
  api/page.js (vercel.json "routes": "/" and "/index.html" go to the function before the filesystem). On /, /rent, /buy,
  /rooms, /daily, /search, landing pages and /listing/… the server puts the live listings (app.js LISTING_COLS, read from
  app.js; up to 300 + their agents) into the page as window.__YH_PRE; fetchListings() → fromPre() draws the first page from
  them at once (deal / city / district / type / studio / budget / sort filtered locally; other filters ask the database).
  Only the FIRST route of a visit uses them; later navigations read fresh. Edge cache of these pages: 30 s (+120 s stale).
  Homepage: listing blocks are drawn at once, the New projects block joins under them when it arrives.
  modulepreload links in index.html start supabase-js and our modules early.
- The first load keeps the server's <title> (route() only sets document.title on later navigations).
- Photo alt text never empty: photoAlt() in app.js ("Apartment for rent in BKK1, Phnom Penh – photo 2").

## Photos (owner, 2026-11-25: "12-15 kép az ideális… a képeket automatikusan optimalizálja… ne legyen a vercelen, se a GitHub-on nagy forgalom… a kártyákon akár az összeset")
- A listing has up to 15 photos (MAX_PHOTOS in app.js); the post form says 12–15 is ideal (photosHint, "n of 15" counter).
- UPLOADS ARE OPTIMIZED IN THE BROWSER (Study portal SWImageOpt rule): shrinkPhoto() in app.js turns each photo upright,
  resizes and re-encodes it as WebP (JPEG fallback), EXIF/location dropped – a large copy "<id>-L.webp" (1600px, q .8, max 2 MB)
  and a small card copy "<id>-s.webp" (800px, q .72) in Supabase Storage yh-photos. Photos never go into the repo or through Vercel.
- imgSrc(url, width) picks the needed size: Unsplash via ?w=, our uploads "-L.webp" → "-s.webp" for cards/thumbnails; the popup uses the large copy.
- Photo dots sit HALFWAY between the date and the price (PC: price pill and the right edge) – placeDots() in app.js, run with fitCards (owner, 2026-11-25: "egyenlő távolságra… most az ár felé hajlik").
- EVERY photo is on the card (phones swipe, PC/tablet round arrows on hover + real dots; >8 photos = smaller dots). Only the
  first two load at once – the rest load when the visitor gets near them (yLoad()).
- Sample listings: long descriptions (apartment, building, price and terms, "This is a sample listing…") and 12 photos each.

## Files
- index.html – page shell, header, footer, bottom menu · styles.css + header.css – design · app.js – the whole app
  (hash routes: #/ · #/search · #/l/<id> · #/post · #/edit/<id> · #/account · #/saved · #/experts · #/agent/<slug> · #/terms · #/privacy · #/support)
- i18n.js – all UI text in 5 languages (missing keys fall back to English).
- Supabase tables: yh_listings, yh_inquiries, yh_events (statistics), yh_alerts, yh_agents, yh_verify_requests,
  yh_partner_requests, yh_projects, yh_project_leads; storage bucket yh-photos.
- partners.js + partners.css – Become a partner page and New projects (PT.* hooks in app.js).
- Scroll fade (owner, 2026-11-24: "az összes tartalom ahogy lefelé görgetek fade in"): everything below the screen fades up
  as it scrolls into view (fade.js, second block); cards in a row one after another; off for "reduce motion".
