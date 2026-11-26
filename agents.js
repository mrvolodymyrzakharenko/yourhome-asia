// Agent / agency profiles + links to well-known sites (Booking, Agoda, Trip.com…)
// Public profile page: #/agent/<slug>. Profiles live in yh_agents; a listing points to one with agent_id
// and carries its own links in external_links ([{name,url}]). Wired into app.js through AG.init(ctx).

const TX = {
  en: {
    tgChan: 'Your Telegram channel (optional)', tgChanHelp: 'Your listings are posted there automatically too. Make your channel public, add @yourhomeasiabot as an admin with “Post messages”, then type its @name here.', tgChanBad: 'Telegram channel: type its public @name, e.g. @myhomes_pp',
    agentProfile: 'Agent profile', myAgent: 'My agent profile', agentSub: 'Your public page with all your listings',
    createAgent: 'Create your agent profile', addAgent: '+ Add another profile', editAgent: 'Edit profile', viewPage: 'View page',
    kind: 'I am', k_agent: 'Agent', k_agency: 'Agency', k_owner: 'Owner',
    fullName: 'Name shown on your page', company: 'Company / agency', photo: 'Photo or logo', bio: 'About you',
    bioPh: 'Experience, areas you know best, what you can help with…', languages: 'Languages you speak', areas: 'Areas you cover',
    email: 'Email', pageAddr: 'Page address', contacts: 'Contacts', otherSites: 'Your pages on other websites (optional)',
    otherSitesSub: 'Paste the full https:// link. Only the sites you fill in are shown.', other: 'Other website',
    saveProfile: 'Save profile', profileSaved: 'Profile saved.', delProfile: 'Delete profile', confirmDelProfile: 'Delete this profile? Your listings stay online.',
    listedBy: 'Listed by', seeProfile: 'See profile and all listings →', verified: 'Verified', alsoOn: 'Also on', verifiedOn: 'Verified on',
    alsoListed: 'Also listed on', linksNote: 'These links were added by the advertiser.', linksNoteV: 'Our team checked this advertiser.',
    attachAgent: 'Show my agent profile on this listing', none: '— none —', listingLinks: 'This property on other sites (optional)',
    listingLinksSub: 'Booking.com, Agoda, Trip.com, Airbnb… paste the link of this exact property.',
    activeListings: '{n} active listings', noListingsYet: 'No active listings yet.', share: 'Copy link', copied: 'Link copied.',
    agentsTitle: 'Agents & agencies', agentsSub: 'Local experts with a public profile on YourHome', otherAdvertisers: 'Other advertisers',
    needAgentFirst: 'Create your agent profile to show it on your listings.', slugTaken: 'This page address is taken – try another one.',
    call: 'Call', message: 'Message', notFound: 'Profile not found.', profilesN: '{n} profiles',
  },
  km: {
    tgChan: 'ឆានែល Telegram របស់អ្នក (ស្រេចចិត្ត)', tgChanHelp: 'ការប្រកាសរបស់អ្នកនឹងត្រូវបានផ្សាយនៅទីនោះដោយស្វ័យប្រវត្តិ។ ធ្វើឱ្យឆានែលជាសាធារណៈ បន្ថែម @yourhomeasiabot ជាអ្នកគ្រប់គ្រង ដែលអាច “Post messages” រួចសរសេរ @ឈ្មោះ របស់វានៅទីនេះ។', tgChanBad: 'ឆានែល Telegram៖ សរសេរ @ឈ្មោះសាធារណៈ ឧ. @myhomes_pp',
    agentProfile: 'ប្រវត្តិរូបភ្នាក់ងារ', myAgent: 'ប្រវត្តិរូបភ្នាក់ងាររបស់ខ្ញុំ', agentSub: 'ទំព័រសាធារណៈរបស់អ្នកជាមួយការប្រកាសទាំងអស់',
    createAgent: 'បង្កើតប្រវត្តិរូបភ្នាក់ងារ', addAgent: '+ បន្ថែមប្រវត្តិរូបមួយទៀត', editAgent: 'កែប្រវត្តិរូប', viewPage: 'មើលទំព័រ',
    kind: 'ខ្ញុំជា', k_agent: 'ភ្នាក់ងារ', k_agency: 'ក្រុមហ៊ុនភ្នាក់ងារ', k_owner: 'ម្ចាស់',
    fullName: 'ឈ្មោះបង្ហាញលើទំព័រ', company: 'ក្រុមហ៊ុន', photo: 'រូបថត ឬឡូហ្គោ', bio: 'អំពីអ្នក', languages: 'ភាសាដែលអ្នកនិយាយ', areas: 'តំបន់ដែលអ្នកគ្រប',
    email: 'អ៊ីមែល', pageAddr: 'អាសយដ្ឋានទំព័រ', contacts: 'ទំនាក់ទំនង', otherSites: 'ទំព័ររបស់អ្នកនៅគេហទំព័រផ្សេង (ស្រេចចិត្ត)', other: 'គេហទំព័រផ្សេង',
    saveProfile: 'រក្សាទុកប្រវត្តិរូប', profileSaved: 'បានរក្សាទុក។', delProfile: 'លុបប្រវត្តិរូប',
    listedBy: 'ប្រកាសដោយ', seeProfile: 'មើលប្រវត្តិរូប និងការប្រកាសទាំងអស់ →', verified: 'បានផ្ទៀងផ្ទាត់', alsoOn: 'មាននៅលើ', verifiedOn: 'បានផ្ទៀងផ្ទាត់នៅលើ',
    alsoListed: 'ក៏មាននៅលើ', attachAgent: 'បង្ហាញប្រវត្តិរូបភ្នាក់ងាររបស់ខ្ញុំលើការប្រកាសនេះ', none: '— គ្មាន —', listingLinks: 'ទ្រព្យនេះនៅគេហទំព័រផ្សេង (ស្រេចចិត្ត)',
    activeListings: 'ការប្រកាសសកម្ម {n}', share: 'ចម្លងតំណ', copied: 'បានចម្លង។', agentsTitle: 'ភ្នាក់ងារ និងក្រុមហ៊ុន', otherAdvertisers: 'អ្នកផ្សាយផ្សេងទៀត',
    call: 'ហៅ', message: 'សារ',
  },
  zh: {
    tgChan: '您的 Telegram 频道（可选）', tgChanHelp: '您的房源也会自动发布到该频道。请将频道设为公开，把 @yourhomeasiabot 添加为管理员并开启“发布消息”，然后在此填写频道的 @名称。', tgChanBad: 'Telegram 频道：请填写公开的 @名称，例如 @myhomes_pp',
    agentProfile: '经纪人主页', myAgent: '我的经纪人主页', agentSub: '展示您全部房源的公开主页',
    createAgent: '创建经纪人主页', addAgent: '+ 再添加一个主页', editAgent: '编辑主页', viewPage: '查看主页',
    kind: '我是', k_agent: '经纪人', k_agency: '中介公司', k_owner: '房东',
    fullName: '主页显示名称', company: '公司 / 中介', photo: '照片或标志', bio: '关于您', languages: '会说的语言', areas: '服务区域',
    email: '邮箱', pageAddr: '主页地址', contacts: '联系方式', otherSites: '您在其他网站的页面（可选）', other: '其他网站',
    saveProfile: '保存主页', profileSaved: '已保存。', delProfile: '删除主页',
    listedBy: '发布者', seeProfile: '查看主页及全部房源 →', verified: '已认证', alsoOn: '也在', verifiedOn: '已认证于',
    alsoListed: '也发布于', attachAgent: '在此房源上显示我的经纪人主页', none: '— 无 —', listingLinks: '此房源在其他网站的链接（可选）',
    activeListings: '{n} 套在售/在租房源', share: '复制链接', copied: '链接已复制。', agentsTitle: '经纪人与中介', otherAdvertisers: '其他发布者',
    call: '电话', message: '留言',
  },
  fr: {
    tgChan: 'Votre chaîne Telegram (facultatif)', tgChanHelp: 'Vos annonces y sont aussi publiées automatiquement. Rendez la chaîne publique, ajoutez @yourhomeasiabot comme administrateur avec « Publier des messages », puis indiquez son @nom ici.', tgChanBad: 'Chaîne Telegram : indiquez son @nom public, ex. @myhomes_pp',
    agentProfile: 'Profil d’agent', myAgent: 'Mon profil d’agent', agentSub: 'Votre page publique avec toutes vos annonces',
    createAgent: 'Créer votre profil d’agent', addAgent: '+ Ajouter un profil', editAgent: 'Modifier le profil', viewPage: 'Voir la page',
    kind: 'Je suis', k_agent: 'Agent', k_agency: 'Agence', k_owner: 'Propriétaire',
    fullName: 'Nom affiché', company: 'Société / agence', photo: 'Photo ou logo', bio: 'À propos', languages: 'Langues parlées', areas: 'Quartiers couverts',
    email: 'E-mail', pageAddr: 'Adresse de la page', contacts: 'Contacts', otherSites: 'Vos pages sur d’autres sites (facultatif)', other: 'Autre site',
    saveProfile: 'Enregistrer le profil', profileSaved: 'Profil enregistré.', delProfile: 'Supprimer le profil',
    listedBy: 'Annonce de', seeProfile: 'Voir le profil et toutes les annonces →', verified: 'Vérifié', alsoOn: 'Aussi sur', verifiedOn: 'Vérifié sur',
    alsoListed: 'Aussi publié sur', attachAgent: 'Afficher mon profil d’agent sur cette annonce', none: '— aucun —', listingLinks: 'Ce bien sur d’autres sites (facultatif)',
    activeListings: '{n} annonces actives', share: 'Copier le lien', copied: 'Lien copié.', agentsTitle: 'Agents et agences', otherAdvertisers: 'Autres annonceurs',
    call: 'Appeler', message: 'Message',
  },
  th: {
    tgChan: 'ช่อง Telegram ของคุณ (ไม่บังคับ)', tgChanHelp: 'ประกาศของคุณจะถูกโพสต์ที่นั่นโดยอัตโนมัติด้วย ตั้งช่องเป็นสาธารณะ เพิ่ม @yourhomeasiabot เป็นผู้ดูแลพร้อมสิทธิ์ “Post messages” แล้วใส่ @ชื่อช่องที่นี่', tgChanBad: 'ช่อง Telegram: ใส่ @ชื่อสาธารณะ เช่น @myhomes_pp',
    agentProfile: 'โปรไฟล์เอเจนต์', myAgent: 'โปรไฟล์เอเจนต์ของฉัน', agentSub: 'หน้าสาธารณะพร้อมประกาศทั้งหมดของคุณ',
    createAgent: 'สร้างโปรไฟล์เอเจนต์', addAgent: '+ เพิ่มโปรไฟล์', editAgent: 'แก้ไขโปรไฟล์', viewPage: 'ดูหน้า',
    kind: 'ฉันคือ', k_agent: 'เอเจนต์', k_agency: 'บริษัทนายหน้า', k_owner: 'เจ้าของ',
    fullName: 'ชื่อที่แสดง', company: 'บริษัท / เอเจนซี', photo: 'รูปภาพหรือโลโก้', bio: 'เกี่ยวกับคุณ', languages: 'ภาษาที่พูดได้', areas: 'พื้นที่ที่ดูแล',
    email: 'อีเมล', pageAddr: 'ที่อยู่หน้า', contacts: 'ช่องทางติดต่อ', otherSites: 'หน้าของคุณบนเว็บไซต์อื่น (ไม่บังคับ)', other: 'เว็บไซต์อื่น',
    saveProfile: 'บันทึกโปรไฟล์', profileSaved: 'บันทึกแล้ว', delProfile: 'ลบโปรไฟล์',
    listedBy: 'ลงประกาศโดย', seeProfile: 'ดูโปรไฟล์และประกาศทั้งหมด →', verified: 'ยืนยันแล้ว', alsoOn: 'มีบน', verifiedOn: 'ยืนยันบน',
    alsoListed: 'ลงประกาศบน', attachAgent: 'แสดงโปรไฟล์เอเจนต์ของฉันในประกาศนี้', none: '— ไม่มี —', listingLinks: 'ทรัพย์นี้บนเว็บไซต์อื่น (ไม่บังคับ)',
    activeListings: 'ประกาศที่ใช้งาน {n} รายการ', share: 'คัดลอกลิงก์', copied: 'คัดลอกแล้ว', agentsTitle: 'เอเจนต์และเอเจนซี', otherAdvertisers: 'ผู้ลงประกาศอื่น ๆ',
    call: 'โทร', message: 'ข้อความ',
  },
  ru: {"tgChan":"Ваш Telegram-канал (необязательно)","tgChanHelp":"Ваши объявления будут автоматически публиковаться и там. Сделайте канал публичным, добавьте @yourhomeasiabot администратором с правом «Публикация сообщений» и впишите здесь его @имя.","tgChanBad":"Telegram-канал: укажите его публичное @имя, напр. @myhomes_pp","agentProfile":"Профиль агента","myAgent":"Мой профиль агента","agentSub":"Ваша публичная страница со всеми объявлениями","createAgent":"Создать профиль агента","addAgent":"+ Добавить ещё профиль","editAgent":"Редактировать профиль","viewPage":"Открыть страницу","kind":"Я","k_agent":"Агент","k_agency":"Агентство","k_owner":"Владелец","fullName":"Имя на вашей странице","company":"Компания / агентство","photo":"Фото или логотип","bio":"О вас","bioPh":"Опыт, районы, которые вы лучше всего знаете, чем можете помочь…","languages":"Языки, на которых вы говорите","areas":"Районы, с которыми вы работаете","email":"Email","pageAddr":"Адрес страницы","contacts":"Контакты","otherSites":"Ваши страницы на других сайтах (необязательно)","otherSitesSub":"Вставьте полную ссылку https://. Показываются только заполненные сайты.","other":"Другой сайт","saveProfile":"Сохранить профиль","profileSaved":"Профиль сохранён.","delProfile":"Удалить профиль","confirmDelProfile":"Удалить этот профиль? Ваши объявления останутся на сайте.","listedBy":"Разместил","seeProfile":"Профиль и все объявления →","verified":"Проверен","alsoOn":"Также на","verifiedOn":"Проверено на","alsoListed":"Также размещено на","linksNote":"Эти ссылки добавил рекламодатель.","linksNoteV":"Наша команда проверила этого рекламодателя.","attachAgent":"Показывать мой профиль агента в этом объявлении","none":"— нет —","listingLinks":"Этот объект на других сайтах (необязательно)","listingLinksSub":"Booking.com, Agoda, Trip.com, Airbnb… вставьте ссылку именно на этот объект.","activeListings":"{n} активных объявлений","noListingsYet":"Активных объявлений пока нет.","share":"Копировать ссылку","copied":"Ссылка скопирована.","agentsTitle":"Агенты и агентства","agentsSub":"Местные эксперты с публичным профилем на YourHome","otherAdvertisers":"Другие рекламодатели","needAgentFirst":"Создайте профиль агента, чтобы показывать его в объявлениях.","slugTaken":"Этот адрес страницы занят – попробуйте другой.","call":"Позвонить","message":"Написать","notFound":"Профиль не найден.","profilesN":"{n} профилей"},
  de: {"tgChan":"Dein Telegram-Kanal (optional)","tgChanHelp":"Deine Anzeigen werden dort auch automatisch gepostet. Mach deinen Kanal öffentlich, füge @yourhomeasiabot als Admin mit „Nachrichten posten“ hinzu und trage hier seinen @Namen ein.","tgChanBad":"Telegram-Kanal: gib seinen öffentlichen @Namen ein, z. B. @myhomes_pp","agentProfile":"Maklerprofil","myAgent":"Mein Maklerprofil","agentSub":"Deine öffentliche Seite mit all deinen Anzeigen","createAgent":"Maklerprofil erstellen","addAgent":"+ Weiteres Profil hinzufügen","editAgent":"Profil bearbeiten","viewPage":"Seite ansehen","kind":"Ich bin","k_agent":"Makler","k_agency":"Agentur","k_owner":"Eigentümer","fullName":"Name auf deiner Seite","company":"Firma / Agentur","photo":"Foto oder Logo","bio":"Über dich","bioPh":"Erfahrung, Gegenden, die du am besten kennst, wobei du helfen kannst…","languages":"Sprachen, die du sprichst","areas":"Gegenden, die du betreust","email":"E-Mail","pageAddr":"Seitenadresse","contacts":"Kontakte","otherSites":"Deine Seiten auf anderen Websites (optional)","otherSitesSub":"Füge den vollständigen https://-Link ein. Nur ausgefüllte Seiten werden angezeigt.","other":"Andere Website","saveProfile":"Profil speichern","profileSaved":"Profil gespeichert.","delProfile":"Profil löschen","confirmDelProfile":"Dieses Profil löschen? Deine Anzeigen bleiben online.","listedBy":"Inseriert von","seeProfile":"Profil und alle Anzeigen →","verified":"Verifiziert","alsoOn":"Auch auf","verifiedOn":"Verifiziert auf","alsoListed":"Auch inseriert auf","linksNote":"Diese Links hat der Anbieter hinzugefügt.","linksNoteV":"Unser Team hat diesen Anbieter geprüft.","attachAgent":"Mein Maklerprofil bei dieser Anzeige zeigen","none":"— keins —","listingLinks":"Diese Immobilie auf anderen Websites (optional)","listingLinksSub":"Booking.com, Agoda, Trip.com, Airbnb… füge den Link genau dieser Immobilie ein.","activeListings":"{n} aktive Anzeigen","noListingsYet":"Noch keine aktiven Anzeigen.","share":"Link kopieren","copied":"Link kopiert.","agentsTitle":"Makler & Agenturen","agentsSub":"Lokale Experten mit öffentlichem Profil auf YourHome","otherAdvertisers":"Weitere Anbieter","needAgentFirst":"Erstelle dein Maklerprofil, um es bei deinen Anzeigen zu zeigen.","slugTaken":"Diese Seitenadresse ist vergeben – versuche eine andere.","call":"Anrufen","message":"Nachricht","notFound":"Profil nicht gefunden.","profilesN":"{n} Profile"},
  cs: {"tgChan":"Váš kanál na Telegramu (nepovinné)","tgChanHelp":"Vaše inzeráty se tam budou automaticky zveřejňovat také. Nastavte kanál jako veřejný, přidejte @yourhomeasiabot jako správce s právem „Zveřejňovat zprávy“ a sem napište jeho @jméno.","tgChanBad":"Kanál na Telegramu: zadejte jeho veřejné @jméno, např. @myhomes_pp","agentProfile":"Profil makléře","myAgent":"Můj profil makléře","agentSub":"Vaše veřejná stránka se všemi inzeráty","createAgent":"Vytvořit profil makléře","addAgent":"+ Přidat další profil","editAgent":"Upravit profil","viewPage":"Zobrazit stránku","kind":"Jsem","k_agent":"Makléř","k_agency":"Realitka","k_owner":"Majitel","fullName":"Jméno na vaší stránce","company":"Firma / realitka","photo":"Fotka nebo logo","bio":"O vás","bioPh":"Zkušenosti, oblasti, které znáte nejlépe, s čím můžete pomoci…","languages":"Jazyky, kterými mluvíte","areas":"Oblasti, kde působíte","email":"E-mail","pageAddr":"Adresa stránky","contacts":"Kontakty","otherSites":"Vaše stránky na jiných webech (nepovinné)","otherSitesSub":"Vložte celý odkaz https://. Zobrazí se jen vyplněné weby.","other":"Jiný web","saveProfile":"Uložit profil","profileSaved":"Profil uložen.","delProfile":"Smazat profil","confirmDelProfile":"Smazat tento profil? Vaše inzeráty zůstanou online.","listedBy":"Inzeruje","seeProfile":"Profil a všechny inzeráty →","verified":"Ověřeno","alsoOn":"Také na","verifiedOn":"Ověřeno na","alsoListed":"Také inzerováno na","linksNote":"Tyto odkazy přidal inzerent.","linksNoteV":"Náš tým tohoto inzerenta ověřil.","attachAgent":"Zobrazit můj profil makléře u tohoto inzerátu","none":"— žádný —","listingLinks":"Tato nemovitost na jiných webech (nepovinné)","listingLinksSub":"Booking.com, Agoda, Trip.com, Airbnb… vložte odkaz přesně na tuto nemovitost.","activeListings":"{n} aktivních inzerátů","noListingsYet":"Zatím žádné aktivní inzeráty.","share":"Kopírovat odkaz","copied":"Odkaz zkopírován.","agentsTitle":"Makléři a realitky","agentsSub":"Místní odborníci s veřejným profilem na YourHome","otherAdvertisers":"Další inzerenti","needAgentFirst":"Vytvořte si profil makléře, aby se zobrazoval u vašich inzerátů.","slugTaken":"Tato adresa stránky je obsazená – zkuste jinou.","call":"Zavolat","message":"Zpráva","notFound":"Profil nenalezen.","profilesN":"{n} profilů"},
  pl: {"tgChan":"Twój kanał na Telegramie (opcjonalnie)","tgChanHelp":"Twoje ogłoszenia będą tam też publikowane automatycznie. Ustaw kanał jako publiczny, dodaj @yourhomeasiabot jako administratora z prawem „Publikowanie wiadomości” i wpisz tutaj jego @nazwę.","tgChanBad":"Kanał na Telegramie: wpisz jego publiczną @nazwę, np. @myhomes_pp","agentProfile":"Profil agenta","myAgent":"Mój profil agenta","agentSub":"Twoja publiczna strona ze wszystkimi ogłoszeniami","createAgent":"Utwórz profil agenta","addAgent":"+ Dodaj kolejny profil","editAgent":"Edytuj profil","viewPage":"Zobacz stronę","kind":"Jestem","k_agent":"Agent","k_agency":"Biuro","k_owner":"Właściciel","fullName":"Nazwa na Twojej stronie","company":"Firma / biuro","photo":"Zdjęcie lub logo","bio":"O Tobie","bioPh":"Doświadczenie, okolice, które znasz najlepiej, w czym możesz pomóc…","languages":"Języki, którymi mówisz","areas":"Obsługiwane okolice","email":"E-mail","pageAddr":"Adres strony","contacts":"Kontakty","otherSites":"Twoje strony w innych serwisach (opcjonalnie)","otherSitesSub":"Wklej pełny link https://. Pokazujemy tylko uzupełnione serwisy.","other":"Inna strona","saveProfile":"Zapisz profil","profileSaved":"Profil zapisany.","delProfile":"Usuń profil","confirmDelProfile":"Usunąć ten profil? Twoje ogłoszenia pozostaną online.","listedBy":"Dodane przez","seeProfile":"Profil i wszystkie ogłoszenia →","verified":"Zweryfikowany","alsoOn":"Również na","verifiedOn":"Zweryfikowano na","alsoListed":"Również dostępne na","linksNote":"Te linki dodał ogłoszeniodawca.","linksNoteV":"Nasz zespół sprawdził tego ogłoszeniodawcę.","attachAgent":"Pokaż mój profil agenta przy tym ogłoszeniu","none":"— brak —","listingLinks":"Ta nieruchomość w innych serwisach (opcjonalnie)","listingLinksSub":"Booking.com, Agoda, Trip.com, Airbnb… wklej link do dokładnie tej nieruchomości.","activeListings":"{n} aktywnych ogłoszeń","noListingsYet":"Brak aktywnych ogłoszeń.","share":"Kopiuj link","copied":"Link skopiowany.","agentsTitle":"Agenci i biura","agentsSub":"Lokalni eksperci z publicznym profilem na YourHome","otherAdvertisers":"Inni ogłoszeniodawcy","needAgentFirst":"Utwórz profil agenta, aby pokazywać go przy ogłoszeniach.","slugTaken":"Ten adres strony jest zajęty – spróbuj innego.","call":"Zadzwoń","message":"Wiadomość","notFound":"Nie znaleziono profilu.","profilesN":"{n} profili"},
  hu: {"tgChan":"Az Ön Telegram-csatornája (nem kötelező)","tgChanHelp":"A hirdetései oda is automatikusan kikerülnek. Tegye nyilvánossá a csatornát, adja hozzá a @yourhomeasiabot-ot adminként „Üzenetek közzététele” joggal, majd írja be ide a csatorna @nevét.","tgChanBad":"Telegram-csatorna: írja be a nyilvános @nevét, pl. @myhomes_pp","agentProfile":"Ügynöki profil","myAgent":"Ügynöki profilom","agentSub":"Nyilvános oldala az összes hirdetésével","createAgent":"Ügynöki profil létrehozása","addAgent":"+ Újabb profil hozzáadása","editAgent":"Profil szerkesztése","viewPage":"Oldal megtekintése","kind":"Én","k_agent":"Ügynök","k_agency":"Iroda","k_owner":"Tulajdonos","fullName":"Az oldalán megjelenő név","company":"Cég / iroda","photo":"Fotó vagy logó","bio":"Önről","bioPh":"Tapasztalat, a legjobban ismert környékek, miben tud segíteni…","languages":"Beszélt nyelvek","areas":"Lefedett környékek","email":"E-mail","pageAddr":"Oldal címe","contacts":"Elérhetőségek","otherSites":"Oldalai más weboldalakon (nem kötelező)","otherSitesSub":"Illessze be a teljes https:// linket. Csak a kitöltött oldalak jelennek meg.","other":"Egyéb weboldal","saveProfile":"Profil mentése","profileSaved":"Profil mentve.","delProfile":"Profil törlése","confirmDelProfile":"Törli ezt a profilt? A hirdetései online maradnak.","listedBy":"Hirdető","seeProfile":"Profil és az összes hirdetés →","verified":"Ellenőrzött","alsoOn":"Megtalálható itt is:","verifiedOn":"Ellenőrizve itt:","alsoListed":"Hirdetve itt is:","linksNote":"Ezeket a linkeket a hirdető adta meg.","linksNoteV":"Csapatunk ellenőrizte ezt a hirdetőt.","attachAgent":"Ügynöki profilom megjelenítése ennél a hirdetésnél","none":"— nincs —","listingLinks":"Ez az ingatlan más oldalakon (nem kötelező)","listingLinksSub":"Booking.com, Agoda, Trip.com, Airbnb… illessze be pontosan ennek az ingatlannak a linkjét.","activeListings":"{n} aktív hirdetés","noListingsYet":"Még nincs aktív hirdetés.","share":"Link másolása","copied":"Link másolva.","agentsTitle":"Ügynökök és irodák","agentsSub":"Helyi szakértők nyilvános profillal a YourHome-on","otherAdvertisers":"További hirdetők","needAgentFirst":"Hozza létre ügynöki profilját, hogy megjelenjen a hirdetésein.","slugTaken":"Ez az oldalcím foglalt – próbáljon másikat.","call":"Hívás","message":"Üzenet","notFound":"A profil nem található.","profilesN":"{n} profil"},
  ko: {"tgChan":"내 텔레그램 채널 (선택)","tgChanHelp":"내 매물이 그곳에도 자동으로 게시됩니다. 채널을 공개로 설정하고 @yourhomeasiabot을 '메시지 게시' 권한이 있는 관리자로 추가한 뒤 여기에 채널 @이름을 입력하세요.","tgChanBad":"텔레그램 채널: 공개 @이름을 입력하세요 (예: @myhomes_pp)","agentProfile":"중개인 프로필","myAgent":"내 중개인 프로필","agentSub":"모든 매물이 담긴 나의 공개 페이지","createAgent":"중개인 프로필 만들기","addAgent":"+ 프로필 추가","editAgent":"프로필 수정","viewPage":"페이지 보기","kind":"저는","k_agent":"중개인","k_agency":"중개업체","k_owner":"집주인","fullName":"페이지에 표시될 이름","company":"회사 / 중개업체","photo":"사진 또는 로고","bio":"소개","bioPh":"경력, 잘 아는 지역, 도와드릴 수 있는 일…","languages":"사용 언어","areas":"담당 지역","email":"이메일","pageAddr":"페이지 주소","contacts":"연락처","otherSites":"다른 웹사이트의 내 페이지 (선택)","otherSitesSub":"https://로 시작하는 전체 링크를 붙여넣으세요. 입력한 사이트만 표시됩니다.","other":"기타 웹사이트","saveProfile":"프로필 저장","profileSaved":"프로필이 저장되었습니다.","delProfile":"프로필 삭제","confirmDelProfile":"이 프로필을 삭제할까요? 매물은 그대로 게시됩니다.","listedBy":"등록자","seeProfile":"프로필 및 전체 매물 보기 →","verified":"인증됨","alsoOn":"다른 사이트:","verifiedOn":"인증된 사이트:","alsoListed":"다른 곳에도 등록됨:","linksNote":"이 링크는 광고주가 추가했습니다.","linksNoteV":"저희 팀이 이 광고주를 확인했습니다.","attachAgent":"이 매물에 내 중개인 프로필 표시","none":"— 없음 —","listingLinks":"다른 사이트의 이 매물 (선택)","listingLinksSub":"Booking.com, Agoda, Trip.com, Airbnb… 바로 이 매물의 링크를 붙여넣으세요.","activeListings":"게시 중인 매물 {n}개","noListingsYet":"아직 게시 중인 매물이 없습니다.","share":"링크 복사","copied":"링크가 복사되었습니다.","agentsTitle":"중개인 및 중개업체","agentsSub":"YourHome에 공개 프로필이 있는 현지 전문가","otherAdvertisers":"기타 광고주","needAgentFirst":"매물에 표시하려면 중개인 프로필을 만드세요.","slugTaken":"이미 사용 중인 페이지 주소입니다 – 다른 주소를 입력하세요.","call":"전화","message":"메시지","notFound":"프로필을 찾을 수 없습니다.","profilesN":"프로필 {n}개"},
  ja: {"tgChan":"あなたのTelegramチャンネル（任意）","tgChanHelp":"あなたの物件はそこにも自動で投稿されます。チャンネルを公開にし、@yourhomeasiabotを「メッセージを投稿」権限付きの管理者に追加して、ここにチャンネルの@名を入力してください。","tgChanBad":"Telegramチャンネル：公開@名を入力してください（例：@myhomes_pp）","agentProfile":"業者プロフィール","myAgent":"マイ業者プロフィール","agentSub":"すべての物件が載るあなたの公開ページ","createAgent":"業者プロフィールを作成","addAgent":"+ プロフィールを追加","editAgent":"プロフィールを編集","viewPage":"ページを見る","kind":"私は","k_agent":"不動産業者","k_agency":"仲介会社","k_owner":"オーナー","fullName":"ページに表示する名前","company":"会社 / 仲介会社","photo":"写真またはロゴ","bio":"自己紹介","bioPh":"経験、詳しいエリア、お手伝いできること…","languages":"話せる言語","areas":"対応エリア","email":"メール","pageAddr":"ページアドレス","contacts":"連絡先","otherSites":"他サイトのあなたのページ（任意）","otherSitesSub":"https:// から始まるリンクを貼り付けてください。入力したサイトのみ表示されます。","other":"その他のサイト","saveProfile":"プロフィールを保存","profileSaved":"プロフィールを保存しました。","delProfile":"プロフィールを削除","confirmDelProfile":"このプロフィールを削除しますか？物件は公開されたままです。","listedBy":"掲載者","seeProfile":"プロフィールとすべての物件 →","verified":"認証済み","alsoOn":"他の掲載先：","verifiedOn":"認証済み：","alsoListed":"他にも掲載：","linksNote":"これらのリンクは掲載者が追加したものです。","linksNoteV":"当社チームがこの掲載者を確認済みです。","attachAgent":"この物件に業者プロフィールを表示","none":"— なし —","listingLinks":"他サイトでのこの物件（任意）","listingLinksSub":"Booking.com、Agoda、Trip.com、Airbnb… この物件そのもののリンクを貼り付けてください。","activeListings":"公開中の物件 {n}件","noListingsYet":"公開中の物件はまだありません。","share":"リンクをコピー","copied":"リンクをコピーしました。","agentsTitle":"不動産業者・仲介会社","agentsSub":"YourHomeで公開プロフィールを持つ地元のエキスパート","otherAdvertisers":"その他の掲載者","needAgentFirst":"物件に表示するには業者プロフィールを作成してください。","slugTaken":"このページアドレスは使用中です – 別のものをお試しください。","call":"電話","message":"メッセージ","notFound":"プロフィールが見つかりません。","profilesN":"{n}件のプロフィール"},
  vi: {"tgChan":"Kênh Telegram của bạn (không bắt buộc)","tgChanHelp":"Tin của bạn cũng sẽ tự động đăng ở đó. Hãy để kênh ở chế độ công khai, thêm @yourhomeasiabot làm quản trị viên với quyền “Đăng tin nhắn”, rồi nhập @tên kênh vào đây.","tgChanBad":"Kênh Telegram: nhập @tên công khai, VD: @myhomes_pp","agentProfile":"Hồ sơ môi giới","myAgent":"Hồ sơ môi giới của tôi","agentSub":"Trang công khai với tất cả tin của bạn","createAgent":"Tạo hồ sơ môi giới","addAgent":"+ Thêm hồ sơ khác","editAgent":"Sửa hồ sơ","viewPage":"Xem trang","kind":"Tôi là","k_agent":"Môi giới","k_agency":"Công ty môi giới","k_owner":"Chủ nhà","fullName":"Tên hiển thị trên trang","company":"Công ty / văn phòng","photo":"Ảnh hoặc logo","bio":"Giới thiệu","bioPh":"Kinh nghiệm, khu vực bạn rành nhất, bạn có thể giúp gì…","languages":"Ngôn ngữ bạn nói","areas":"Khu vực phụ trách","email":"Email","pageAddr":"Địa chỉ trang","contacts":"Liên hệ","otherSites":"Trang của bạn trên website khác (không bắt buộc)","otherSitesSub":"Dán đường dẫn đầy đủ https://. Chỉ hiển thị các trang bạn điền.","other":"Website khác","saveProfile":"Lưu hồ sơ","profileSaved":"Đã lưu hồ sơ.","delProfile":"Xóa hồ sơ","confirmDelProfile":"Xóa hồ sơ này? Tin của bạn vẫn hiển thị.","listedBy":"Người đăng","seeProfile":"Xem hồ sơ và tất cả tin →","verified":"Đã xác minh","alsoOn":"Cũng có trên","verifiedOn":"Đã xác minh trên","alsoListed":"Cũng được đăng trên","linksNote":"Các liên kết này do người đăng thêm.","linksNoteV":"Đội ngũ của chúng tôi đã kiểm tra người đăng này.","attachAgent":"Hiển thị hồ sơ môi giới của tôi trên tin này","none":"— không có —","listingLinks":"Bất động sản này trên trang khác (không bắt buộc)","listingLinksSub":"Booking.com, Agoda, Trip.com, Airbnb… dán đường dẫn của đúng bất động sản này.","activeListings":"{n} tin đang hiển thị","noListingsYet":"Chưa có tin đang hiển thị.","share":"Sao chép liên kết","copied":"Đã sao chép liên kết.","agentsTitle":"Môi giới & công ty","agentsSub":"Chuyên gia địa phương có hồ sơ công khai trên YourHome","otherAdvertisers":"Người đăng khác","needAgentFirst":"Tạo hồ sơ môi giới để hiển thị trên tin của bạn.","slugTaken":"Địa chỉ trang này đã được dùng – hãy thử địa chỉ khác.","call":"Gọi","message":"Nhắn tin","notFound":"Không tìm thấy hồ sơ.","profilesN":"{n} hồ sơ"}
};

// AGENT'S TELEGRAM CHANNEL – CONNECT (owner, 2026-11-26: "Agent Telegram channel connect to website"): one-tap "add the bot to my
// channel" link + "Check connection" (api/tg-chan.js) in the profile form; 8 Cambodia languages, others fall back to English.
const TXC = {
  en: { tgImp: "Show my channel posts on the website too", tgImpHelp: "When you post a home with photos and a price in your channel, @yourhomeasiabot sends it to you on Telegram and asks “Publish on the website?” – nothing goes live without your tap. Open the bot once and press Start (or sign in to YourHome with Telegram) so it can reach you.", tgOpenBot: "Open @yourhomeasiabot", tgAdd: 'Add @yourhomeasiabot to my channel', tgCheck: 'Check connection', tgChecking: 'Checking…', tgOk: '✓ Connected to {t} – your listings are posted there automatically.', tgNotFound: 'No public channel with this @name. Make the channel public and copy its @name.', tgNotChannel: 'This @name is a group or a person, not a channel.', tgNotAdmin: '@yourhomeasiabot is not an admin of this channel yet – tap “Add @yourhomeasiabot to my channel”.', tgNoPost: '@yourhomeasiabot is an admin but cannot post – switch on “Post messages” for it.', tgErr: 'Could not check right now – try again in a minute.', tgSteps: '1) Make your channel public. 2) Tap “Add @yourhomeasiabot to my channel” and pick your channel (it gets “Post messages”). 3) Type the channel’s @name here, Check connection, then Save. Your listings of the last 30 days and every new one appear there automatically.' },
  km: { tgImp: "បង្ហាញការប្រកាសក្នុងឆានែលរបស់ខ្ញុំនៅលើគេហទំព័រផងដែរ", tgImpHelp: "ពេលអ្នកប្រកាសផ្ទះដែលមានរូបថត និងតម្លៃក្នុងឆានែល @yourhomeasiabot នឹងផ្ញើវាមកអ្នកតាម Telegram ហើយសួរថា “ផ្សាយលើគេហទំព័រ?” – គ្មានអ្វីបង្ហាញទេ ប្រសិនបើអ្នកមិនចុច។ សូមបើកបូតម្តង ហើយចុច Start (ឬចូល YourHome ដោយ Telegram) ដើម្បីឱ្យវាអាចទាក់ទងអ្នកបាន។", tgOpenBot: "បើក @yourhomeasiabot", tgAdd: 'បន្ថែម @yourhomeasiabot ទៅឆានែលរបស់ខ្ញុំ', tgCheck: 'ពិនិត្យការភ្ជាប់', tgChecking: 'កំពុងពិនិត្យ…', tgOk: '✓ បានភ្ជាប់ជាមួយ {t} – ការប្រកាសរបស់អ្នកនឹងត្រូវផ្សាយនៅទីនោះដោយស្វ័យប្រវត្តិ។', tgNotFound: 'រកមិនឃើញឆានែលសាធារណៈដែលមាន @ឈ្មោះនេះទេ។ សូមធ្វើឱ្យឆានែលជាសាធារណៈ ហើយចម្លង @ឈ្មោះរបស់វា។', tgNotChannel: '@ឈ្មោះនេះជាក្រុម ឬជាមនុស្ស មិនមែនជាឆានែលទេ។', tgNotAdmin: '@yourhomeasiabot មិនទាន់ជាអ្នកគ្រប់គ្រងឆានែលនេះនៅឡើយទេ – ចុច “បន្ថែម @yourhomeasiabot ទៅឆានែលរបស់ខ្ញុំ”។', tgNoPost: '@yourhomeasiabot ជាអ្នកគ្រប់គ្រង ប៉ុន្តែមិនអាចផ្សាយបានទេ – សូមបើក “Post messages” ឱ្យវា។', tgErr: 'មិនអាចពិនិត្យបានឥឡូវនេះទេ – សូមព្យាយាមម្តងទៀតក្នុងមួយនាទី។', tgSteps: '1) ធ្វើឱ្យឆានែលរបស់អ្នកជាសាធារណៈ។ 2) ចុច “បន្ថែម @yourhomeasiabot ទៅឆានែលរបស់ខ្ញុំ” ហើយជ្រើសឆានែលរបស់អ្នក (វាទទួលបាន “Post messages”)។ 3) សរសេរ @ឈ្មោះឆានែលនៅទីនេះ ចុចពិនិត្យការភ្ជាប់ រួចរក្សាទុក។ ការប្រកាស 30 ថ្ងៃចុងក្រោយ និងការប្រកាសថ្មីៗនឹងបង្ហាញនៅទីនោះដោយស្វ័យប្រវត្តិ។' },
  zh: { tgImp: "在网站上也显示我的频道帖子", tgImpHelp: "当您在频道中发布带照片和价格的房源时，@yourhomeasiabot 会通过 Telegram 发给您并询问“发布到网站？”——未经您点击不会上线。请先打开机器人并点击 Start（或用 Telegram 登录 YourHome），以便它能联系到您。", tgOpenBot: "打开 @yourhomeasiabot", tgAdd: '将 @yourhomeasiabot 添加到我的频道', tgCheck: '检查连接', tgChecking: '正在检查…', tgOk: '✓ 已连接到 {t} – 您的房源会自动发布到该频道。', tgNotFound: '找不到使用此 @名称的公开频道。请将频道设为公开并复制其 @名称。', tgNotChannel: '此 @名称是群组或个人，不是频道。', tgNotAdmin: '@yourhomeasiabot 还不是该频道的管理员 – 请点击“将 @yourhomeasiabot 添加到我的频道”。', tgNoPost: '@yourhomeasiabot 是管理员但无法发布 – 请为其开启“发布消息”。', tgErr: '暂时无法检查 – 请一分钟后再试。', tgSteps: '1) 将频道设为公开。2) 点击“将 @yourhomeasiabot 添加到我的频道”并选择您的频道（它将获得“发布消息”权限）。3) 在此填写频道的 @名称，点击检查连接，然后保存。您最近 30 天的房源和每条新房源都会自动出现在那里。' },
  fr: { tgImp: "Afficher aussi les publications de ma chaîne sur le site", tgImpHelp: "Quand vous publiez un bien avec photos et prix dans votre chaîne, @yourhomeasiabot vous l’envoie sur Telegram et demande « Publier sur le site ? » – rien n’est mis en ligne sans votre accord. Ouvrez le bot une fois et appuyez sur Start (ou connectez-vous à YourHome avec Telegram) pour qu’il puisse vous joindre.", tgOpenBot: "Ouvrir @yourhomeasiabot", tgAdd: 'Ajouter @yourhomeasiabot à ma chaîne', tgCheck: 'Vérifier la connexion', tgChecking: 'Vérification…', tgOk: '✓ Connecté à {t} – vos annonces y sont publiées automatiquement.', tgNotFound: 'Aucune chaîne publique avec ce @nom. Rendez la chaîne publique et copiez son @nom.', tgNotChannel: 'Ce @nom est un groupe ou une personne, pas une chaîne.', tgNotAdmin: '@yourhomeasiabot n’est pas encore administrateur de cette chaîne – appuyez sur « Ajouter @yourhomeasiabot à ma chaîne ».', tgNoPost: '@yourhomeasiabot est administrateur mais ne peut pas publier – activez « Publier des messages ».', tgErr: 'Vérification impossible pour le moment – réessayez dans une minute.', tgSteps: '1) Rendez votre chaîne publique. 2) Appuyez sur « Ajouter @yourhomeasiabot à ma chaîne » et choisissez votre chaîne (il reçoit « Publier des messages »). 3) Indiquez ici le @nom de la chaîne, Vérifiez la connexion, puis Enregistrez. Vos annonces des 30 derniers jours et chaque nouvelle y apparaissent automatiquement.' },
  th: { tgImp: "แสดงโพสต์ในช่องของฉันบนเว็บไซต์ด้วย", tgImpHelp: "เมื่อคุณโพสต์ที่พักพร้อมรูปและราคาในช่อง @yourhomeasiabot จะส่งให้คุณทาง Telegram และถามว่า “เผยแพร่บนเว็บไซต์?” – จะไม่มีอะไรขึ้นเว็บถ้าคุณไม่แตะยืนยัน เปิดบอทหนึ่งครั้งแล้วกด Start (หรือเข้าสู่ระบบ YourHome ด้วย Telegram) เพื่อให้บอทติดต่อคุณได้", tgOpenBot: "เปิด @yourhomeasiabot", tgAdd: 'เพิ่ม @yourhomeasiabot ในช่องของฉัน', tgCheck: 'ตรวจสอบการเชื่อมต่อ', tgChecking: 'กำลังตรวจสอบ…', tgOk: '✓ เชื่อมต่อกับ {t} แล้ว – ประกาศของคุณจะถูกโพสต์ที่นั่นโดยอัตโนมัติ', tgNotFound: 'ไม่พบช่องสาธารณะที่ใช้ @ชื่อนี้ ตั้งช่องเป็นสาธารณะแล้วคัดลอก @ชื่อของช่อง', tgNotChannel: '@ชื่อนี้เป็นกลุ่มหรือบุคคล ไม่ใช่ช่อง', tgNotAdmin: '@yourhomeasiabot ยังไม่ใช่ผู้ดูแลช่องนี้ – แตะ “เพิ่ม @yourhomeasiabot ในช่องของฉัน”', tgNoPost: '@yourhomeasiabot เป็นผู้ดูแลแต่โพสต์ไม่ได้ – เปิดสิทธิ์ “Post messages” ให้', tgErr: 'ตรวจสอบไม่ได้ในขณะนี้ – ลองใหม่ในอีกหนึ่งนาที', tgSteps: '1) ตั้งช่องของคุณเป็นสาธารณะ 2) แตะ “เพิ่ม @yourhomeasiabot ในช่องของฉัน” แล้วเลือกช่องของคุณ (บอทจะได้สิทธิ์ “Post messages”) 3) ใส่ @ชื่อช่องที่นี่ ตรวจสอบการเชื่อมต่อ แล้วบันทึก ประกาศ 30 วันล่าสุดและประกาศใหม่ทุกรายการจะแสดงที่นั่นโดยอัตโนมัติ' },
  ru: { tgImp: "Показывать посты моего канала и на сайте", tgImpHelp: "Когда вы публикуете объект с фото и ценой в своём канале, @yourhomeasiabot присылает его вам в Telegram и спрашивает «Опубликовать на сайте?» – без вашего нажатия ничего не публикуется. Откройте бота один раз и нажмите Start (или войдите в YourHome через Telegram), чтобы он мог вам писать.", tgOpenBot: "Открыть @yourhomeasiabot", tgAdd: 'Добавить @yourhomeasiabot в мой канал', tgCheck: 'Проверить подключение', tgChecking: 'Проверяем…', tgOk: '✓ Подключено к {t} – ваши объявления публикуются там автоматически.', tgNotFound: 'Публичного канала с таким @именем нет. Сделайте канал публичным и скопируйте его @имя.', tgNotChannel: 'Это @имя группы или человека, а не канала.', tgNotAdmin: '@yourhomeasiabot ещё не администратор этого канала – нажмите «Добавить @yourhomeasiabot в мой канал».', tgNoPost: '@yourhomeasiabot – администратор, но не может публиковать – включите ему «Публикация сообщений».', tgErr: 'Сейчас не удалось проверить – попробуйте через минуту.', tgSteps: '1) Сделайте канал публичным. 2) Нажмите «Добавить @yourhomeasiabot в мой канал» и выберите свой канал (бот получит «Публикация сообщений»). 3) Впишите здесь @имя канала, проверьте подключение и сохраните. Ваши объявления за последние 30 дней и все новые появятся там автоматически.' },
  vi: { tgImp: "Hiển thị bài đăng trong kênh của tôi trên website", tgImpHelp: "Khi bạn đăng nhà có ảnh và giá trong kênh, @yourhomeasiabot sẽ gửi cho bạn qua Telegram và hỏi “Đăng lên website?” – không có gì được đăng nếu bạn chưa nhấn. Hãy mở bot một lần và nhấn Start (hoặc đăng nhập YourHome bằng Telegram) để bot liên lạc được với bạn.", tgOpenBot: "Mở @yourhomeasiabot", tgAdd: 'Thêm @yourhomeasiabot vào kênh của tôi', tgCheck: 'Kiểm tra kết nối', tgChecking: 'Đang kiểm tra…', tgOk: '✓ Đã kết nối với {t} – tin của bạn được tự động đăng ở đó.', tgNotFound: 'Không có kênh công khai với @tên này. Hãy để kênh công khai và sao chép @tên của kênh.', tgNotChannel: '@tên này là nhóm hoặc người dùng, không phải kênh.', tgNotAdmin: '@yourhomeasiabot chưa là quản trị viên của kênh này – nhấn “Thêm @yourhomeasiabot vào kênh của tôi”.', tgNoPost: '@yourhomeasiabot là quản trị viên nhưng không thể đăng – hãy bật quyền “Đăng tin nhắn”.', tgErr: 'Hiện không kiểm tra được – vui lòng thử lại sau một phút.', tgSteps: '1) Để kênh ở chế độ công khai. 2) Nhấn “Thêm @yourhomeasiabot vào kênh của tôi” và chọn kênh (bot nhận quyền “Đăng tin nhắn”). 3) Nhập @tên kênh vào đây, Kiểm tra kết nối rồi Lưu. Tin 30 ngày gần nhất và mọi tin mới sẽ tự động xuất hiện ở đó.' },
  ko: { tgImp: "내 채널 게시물을 웹사이트에도 표시", tgImpHelp: "채널에 사진과 가격이 있는 매물을 올리면 @yourhomeasiabot이 텔레그램으로 보내 \"웹사이트에 게시할까요?\"라고 묻습니다 – 직접 누르기 전에는 아무것도 게시되지 않습니다. 봇이 연락할 수 있도록 봇을 한 번 열어 Start를 누르세요 (또는 텔레그램으로 YourHome에 로그인).", tgOpenBot: "@yourhomeasiabot 열기", tgAdd: '내 채널에 @yourhomeasiabot 추가', tgCheck: '연결 확인', tgChecking: '확인 중…', tgOk: '✓ {t}에 연결됨 – 매물이 그곳에 자동으로 게시됩니다.', tgNotFound: '이 @이름의 공개 채널이 없습니다. 채널을 공개로 설정하고 @이름을 복사하세요.', tgNotChannel: '이 @이름은 채널이 아니라 그룹 또는 개인입니다.', tgNotAdmin: '@yourhomeasiabot이 아직 이 채널의 관리자가 아닙니다 – "내 채널에 @yourhomeasiabot 추가"를 누르세요.', tgNoPost: '@yourhomeasiabot이 관리자이지만 게시할 수 없습니다 – "메시지 게시" 권한을 켜 주세요.', tgErr: '지금은 확인할 수 없습니다 – 1분 후 다시 시도하세요.', tgSteps: '1) 채널을 공개로 설정하세요. 2) "내 채널에 @yourhomeasiabot 추가"를 누르고 채널을 선택하세요 ("메시지 게시" 권한이 부여됩니다). 3) 여기에 채널 @이름을 입력하고 연결 확인 후 저장하세요. 최근 30일 매물과 모든 새 매물이 자동으로 게시됩니다.' },
};
for (const l in TXC) TX[l] = Object.assign(TX[l] || {}, TXC[l]);

// Well-known sites: recognised from the link's address, shown with their own colour.
export const SITES = [
  { k: 'booking', n: 'Booking.com', h: ['booking.com'], c: '#003580', a: 'B.' },
  { k: 'agoda', n: 'Agoda', h: ['agoda.com'], c: '#5542F6', a: 'a' },
  { k: 'trip', n: 'Trip.com', h: ['trip.com'], c: '#287DFA', a: 'T' },
  { k: 'airbnb', n: 'Airbnb', h: ['airbnb.'], c: '#FF385C', a: '◇' },
  { k: 'expedia', n: 'Expedia', h: ['expedia.'], c: '#1E243A', a: 'E' },
  { k: 'hotels', n: 'Hotels.com', h: ['hotels.com'], c: '#D32F2F', a: 'H' },
  { k: 'tripadvisor', n: 'Tripadvisor', h: ['tripadvisor.'], c: '#00AA6C', a: '◉' },
  { k: 'gmaps', n: 'Google Maps', h: ['maps.google.', 'google.com/maps', 'maps.app.goo.gl', 'goo.gl/maps', 'g.page'], c: '#34A853', a: '⌖' },
  { k: 'khmer24', n: 'Khmer24', h: ['khmer24.'], c: '#E31E24', a: 'K' },
  { k: 'realestate', n: 'Realestate.com.kh', h: ['realestate.com.kh'], c: '#1C4E9D', a: 'R' },
  { k: 'facebook', n: 'Facebook', h: ['facebook.com', 'fb.com', 'fb.me'], c: '#1877F2', a: 'f' },
  { k: 'instagram', n: 'Instagram', h: ['instagram.com'], c: '#E4405F', a: '◎' },
  { k: 'tiktok', n: 'TikTok', h: ['tiktok.com'], c: '#111111', a: '♪' },
  { k: 'youtube', n: 'YouTube', h: ['youtube.com', 'youtu.be'], c: '#FF0000', a: '▶' },
  { k: 'linkedin', n: 'LinkedIn', h: ['linkedin.com'], c: '#0A66C2', a: 'in' },
  { k: 'telegram', n: 'Telegram', h: ['t.me', 'telegram.me'], c: '#229ED9', a: '✈' },
];
const WEB = { k: 'web', n: 'Website', c: '#475569', a: '⌂' };
const PROFILE_FIELDS = ['booking', 'agoda', 'trip', 'airbnb', 'gmaps', 'facebook', 'instagram', 'tiktok', 'youtube', 'khmer24', 'realestate', 'web', 'other1'];
const LISTING_FIELDS = ['booking', 'agoda', 'trip', 'airbnb', 'expedia', 'gmaps', 'other1', 'other2'];
const PH = {
  booking: 'https://www.booking.com/hotel/kh/…', agoda: 'https://www.agoda.com/…', trip: 'https://www.trip.com/hotels/…',
  airbnb: 'https://www.airbnb.com/rooms/…', expedia: 'https://www.expedia.com/…', gmaps: 'https://maps.app.goo.gl/…',
  facebook: 'https://www.facebook.com/…', instagram: 'https://www.instagram.com/…', tiktok: 'https://www.tiktok.com/@…',
  youtube: 'https://www.youtube.com/@…', khmer24: 'https://www.khmer24.com/…', realestate: 'https://www.realestate.com.kh/…',
  web: 'https://…', other1: 'https://…', other2: 'https://…',
};
const LANG_OPTS = ['Khmer', 'English', 'Chinese', 'French', 'Thai', 'Vietnamese', 'Korean', 'Japanese', 'Russian'];

// "Add @yourhomeasiabot to my channel": Telegram opens the channel picker and proposes the bot as admin with these rights
const TG_ADD = 'https://t.me/yourhomeasiabot?startchannel&admin=post_messages+edit_messages+delete_messages';
// asks api/tg-chan.js whether the bot can post in the channel; shows the answer under the field (inline) or as a toast (after Save)
async function checkChannel(v, inline) {
  const st = document.getElementById('tgcSt');
  const name = String(v || '').trim().replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, '');
  if (!/^[A-Za-z0-9_]{5,32}$/.test(name)) { if (inline && st) { st.hidden = false; st.textContent = tx('tgChanBad'); } return false; }
  if (inline && st) { st.hidden = false; st.style.color = ''; st.textContent = tx('tgChecking'); }
  let j = { code: 'error' };
  try { j = await (await fetch('/api/tg-chan?c=' + encodeURIComponent(name), { cache: 'no-store' })).json(); } catch (_) {}
  const MSG = { ok: 'tgOk', bad_name: 'tgChanBad', not_found: 'tgNotFound', not_channel: 'tgNotChannel', not_admin: 'tgNotAdmin', no_post: 'tgNoPost' };
  const msg = tx(MSG[j.code] || 'tgErr', { t: j.title ? '“' + j.title + '”' : '@' + name });
  if (inline && st) { st.textContent = msg; st.style.color = j.ok ? '#16803C' : '#E00025'; }
  else C.toast((j.ok ? '' : tx('profileSaved') + ' ') + msg, j.ok ? 4000 : 8000);
  return !!j.ok;
}

let C = null; // context from app.js
const tx = (k, v) => { let s = (TX[C.lang()] && TX[C.lang()][k]) ?? TX.en[k] ?? k; if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]); return s; };

export function siteOf(url) {
  let u; try { u = new URL(url); } catch { return WEB; }
  const s = (u.hostname.replace(/^www\./, '') + u.pathname).toLowerCase();
  return SITES.find(x => x.h.some(h => s.startsWith(h) || s.includes('.' + h) || (h.includes('/') && s.includes(h)))) || WEB;
}
const okUrl = v => /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$|\?|#)/i.test(v) && !/^https:\/\/([a-z0-9-]+\.)*yourhome\.asia/i.test(v);
const fieldSite = k => SITES.find(s => s.k === k) || (k === 'web' ? WEB : { k, n: tx('other'), c: WEB.c, a: '+' });
const slugify = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);

// Link pills. mode: 'also' (Also on X), 'verified' (Verified on X), 'plain' (X)
export function pills(links, mode = 'also') {
  const L = (links || []).filter(l => l && okUrl(l.url));
  if (!L.length) return '';
  return `<div class="xl-row">${L.map(l => { const s = siteOf(l.url); const name = s === WEB ? (l.name && l.name !== 'Website' ? l.name : new URL(l.url).hostname.replace(/^www\./, '')) : s.n;
    const pre = mode === 'verified' ? '✓ ' + tx('verifiedOn') + ' ' : mode === 'also' ? tx('alsoOn') + ' ' : '';
    return `<a class="xl" style="--c:${s.c}" href="${C.esc(l.url)}" target="_blank" rel="nofollow ugc noopener"><i>${C.esc(s.a)}</i>${C.esc(pre + name)}</a>`; }).join('')}</div>`;
}
function linkInputs(keys, links, prefix) {
  const used = new Set(); const val = {};
  // put saved links into the matching field, the rest into the free fields
  (links || []).forEach(l => { const s = siteOf(l.url); const k = keys.find(k => k === s.k && !used.has(k)); if (k) { used.add(k); val[k] = l.url; } });
  (links || []).forEach(l => { if (Object.values(val).includes(l.url)) return; const k = keys.find(k => /^(other|web)/.test(k) && !used.has(k)); if (k) { used.add(k); val[k] = l.url; } });
  return `<div class="xl-fields">${keys.map(k => { const s = fieldSite(k); return `<label class="xl-f"><span><i style="--c:${s.c}">${C.esc(s.a)}</i>${C.esc(s.n)}</span><input type="url" inputmode="url" name="${prefix}${k}" placeholder="${C.esc(PH[k] || 'https://…')}" value="${C.esc(val[k] || '')}" maxlength="500"></label>`; }).join('')}</div>`;
}
function readLinks(fd, keys, prefix) {
  const out = []; const seen = new Set();
  for (const k of keys) {
    const v = String(fd.get(prefix + k) || '').trim(); if (!v) continue;
    const url = /^https?:\/\//i.test(v) ? v.replace(/^http:/i, 'https:') : 'https://' + v;
    if (!okUrl(url) || seen.has(url)) { C.toast('✗ ' + v); return null; }
    seen.add(url); const s = siteOf(url); out.push({ name: s === WEB ? new URL(url).hostname.replace(/^www\./, '') : s.n, url });
  }
  return out;
}

const avatar = (a, cls = 'ag-av') => a.photo ? `<img class="${cls}" src="${C.esc(a.photo)}" alt="${C.esc(a.name)}" loading="lazy">` : `<span class="${cls} ag-ini">${C.esc((a.name || '?').trim()[0]?.toUpperCase() || '?')}</span>`;
const vBadge = a => a.verified_at ? `<span class="ag-v" title="${C.esc(tx('verified'))}">✓ ${C.esc(tx('verified'))}</span>` : '';
const kindLine = a => C.esc([tx('k_' + a.kind), a.company].filter(Boolean).join(' · '));

export function agentCard(a, n) {
  return `<a class="ag-card" href="#/agent/${C.esc(a.slug)}">${avatar(a)}<div class="ag-ct"><div class="ag-nm">${C.esc(a.name)} ${vBadge(a)}</div>
    <div class="ag-k">${kindLine(a)}</div>${n === null ? '' : `<div class="ag-k">${tx('activeListings', { n: n || 0 })}${a.languages?.length ? ' · ' + C.esc(a.languages.slice(0, 3).join(', ')) : ''}</div>`}</div></a>`;
}

export function init(ctx) { C = ctx; }

// ---------- Public profile page ----------
export async function viewAgent(slug) {
  const app = C.app;
  app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:24px">${C.t('loading')}</div></div>`;
  const { data: a } = await C.sb.from('yh_agents').select('*').eq('slug', String(slug).toLowerCase()).maybeSingle();
  if (!a) { app.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:24px">${tx('notFound')}<br><br><a class="btn blue" href="#/experts">${tx('agentsTitle')}</a></div></div>`; return; }
  document.title = `${a.name} — YourHome.asia`;
  const { data: list = [] } = await C.sb.from('yh_listings').select(C.LISTING_COLS).eq('agent_id', a.id).eq('status', 'active')
    .order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(200);
  const tg = C.tgHandle(a.telegram), wa = C.digits(a.whatsapp), ph = C.digits(a.phone);
  app.innerHTML = `<div class="wrap"><a class="back" href="#/experts">← ${tx('agentsTitle')}</a>
    <section class="panel ag-hero">
      ${avatar(a, 'ag-big')}
      <div class="ag-main">
        <h1>${C.esc(a.name)} ${vBadge(a)}</h1>
        <div class="ag-k">${kindLine(a)} · ${tx('activeListings', { n: (list || []).length })}</div>
        ${a.languages?.length ? `<div class="ag-chips">${a.languages.map(x => `<span>${C.esc(x)}</span>`).join('')}</div>` : ''}
        ${a.areas?.length ? `<div class="ag-chips ag-areas">${a.areas.map(x => `<span>📍 ${C.esc(x)}</span>`).join('')}</div>` : ''}
        <div class="ag-contact">
          ${tg ? `<a class="btn tg" href="https://t.me/${tg}" target="_blank" rel="noopener">Telegram</a>` : ''}
          ${wa ? `<a class="btn wa" href="https://wa.me/${wa.replace('+', '')}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
          ${ph ? `<a class="btn blue" href="tel:${ph}">📞 ${tx('call')}</a>` : ''}
          ${a.email ? `<a class="btn ghost" href="mailto:${C.esc(a.email)}">✉ ${tx('message')}</a>` : ''}
          <button class="btn ghost" id="agShare">🔗 ${tx('share')}</button>
        </div>
        ${pills(a.links, 'plain')}
      </div>
    </section>
    ${a.bio ? `<section class="panel"><h3>${tx('bio')}</h3><div class="desc">${C.esc(a.bio)}</div></section>` : ''}
    <div class="bh"><h2>${tx('activeListings', { n: (list || []).length })}</h2></div>
    ${(list || []).length ? `<div class="grid">${list.map(C.card).join('')}</div>` : `<div class="empty">${tx('noListingsYet')}</div>`}
  </div>`;
  document.getElementById('agShare').onclick = async () => { const u = location.origin + '/#/agent/' + a.slug; try { await navigator.clipboard.writeText(u); C.toast(tx('copied')); } catch { prompt('', u); } };
}

// ---------- Agents & agencies list ----------
export async function viewExperts() {
  const app = C.app;
  app.innerHTML = `<div class="wrap"><div class="bh" style="margin-top:26px"><div><h2>⚡ ${tx('agentsTitle')}</h2><div style="color:var(--muted)">${tx('agentsSub')}</div></div>
    <a class="btn red" href="#/account?tab=agent">+ ${tx('createAgent')}</a></div><div id="res">${window.yhSkel ? window.yhSkel(false) : ''}</div></div>`;
  const [{ data: ags = [] }, { data: rows = [] }] = await Promise.all([
    C.sb.from('yh_agents').select('*').eq('country', 'KH').limit(1000),
    C.sb.from('yh_listings').select('owner_id,agent_id,contact_name,contact_telegram').eq('status', 'active').limit(3000),
  ]);
  const cnt = {}; (rows || []).forEach(r => { if (r.agent_id) cnt[r.agent_id] = (cnt[r.agent_id] || 0) + 1; });
  const list = (ags || []).sort((x, y) => (!!y.verified_at - !!x.verified_at) || ((cnt[y.id] || 0) - (cnt[x.id] || 0)));
  const withProfile = new Set((ags || []).map(a => a.owner_id));
  const g = {}; (rows || []).forEach(r => { if (!r.owner_id || withProfile.has(r.owner_id)) return; const x = g[r.owner_id] ||= { n: 0, name: r.contact_name, tg: r.contact_telegram }; x.n++; if (!x.name && r.contact_name) x.name = r.contact_name; });
  const others = Object.entries(g).sort((a, b) => b[1].n - a[1].n);
  const res = document.getElementById('res');
  res.innerHTML = (list.length ? `<div class="ag-grid">${list.map(a => agentCard(a, cnt[a.id])).join('')}</div>` : `<div class="empty">${tx('needAgentFirst')}<br><br><a class="btn red" href="#/account?tab=agent">+ ${tx('createAgent')}</a></div>`)
    + (others.length ? `<div class="bh" style="margin-top:30px"><h2>${tx('otherAdvertisers')}</h2></div><div class="grid">${others.map(([id, x]) => `<a class="exp" href="#/search?owner=${C.esc(id)}" style="text-decoration:none;color:inherit"><div class="av">${C.esc((x.name || '?').trim()[0]?.toUpperCase() || '?')}</div><div><div style="font-weight:600">${C.esc(x.name || 'YourHome')}</div><div style="color:var(--muted);font-size:13px">${C.t('listingsCount', { n: x.n })}${C.tgHandle(x.tg) ? ' · @' + C.esc(C.tgHandle(x.tg)) : ''}</div></div></a>`).join('')}</div>` : '');
}

// ---------- Listing page extras ----------
export async function listingExtras(l) {
  const box = document.getElementById('agBox'), lb = document.getElementById('agLinks');
  let a = null;
  if (l.agent_id) { const { data } = await C.sb.from('yh_agents').select('*').eq('id', l.agent_id).maybeSingle(); a = data; }
  if (box && a) box.innerHTML = `<div class="panel ag-on"><div class="ag-lab">${tx('listedBy')}</div>${agentCard(a, null)}
    <a class="ag-more" href="#/agent/${C.esc(a.slug)}">${tx('seeProfile')}</a></div>`;
  if (lb && (l.external_links || []).length) {
    const v = !!(a && a.verified_at);
    lb.innerHTML = `<div class="panel"><h3>${tx('alsoListed')}</h3>${pills(l.external_links, v ? 'verified' : 'also')}<p class="xl-note">${v ? tx('linksNoteV') : tx('linksNote')}</p></div>`;
  }
}

// ---------- Post / edit form block ----------
export async function postBlock(l, isNew) {
  const user = C.user(); if (!user) return '';
  const { data: mine = [] } = await C.sb.from('yh_agents').select('id,name,slug').eq('owner_id', user.id).order('created_at');
  const cur = l.agent_id || (isNew && mine.length === 1 ? mine[0].id : '');
  return `<fieldset class="ag-fs"><legend>${tx('agentProfile')}</legend>
    ${mine.length ? `<label>${tx('attachAgent')}<select name="agent_id"><option value="">${tx('none')}</option>${mine.map(a => `<option value="${a.id}" ${cur === a.id ? 'selected' : ''}>${C.esc(a.name)}</option>`).join('')}</select></label>`
      : `<p class="xl-note">${tx('needAgentFirst')} <a href="#/account?tab=agent">${tx('createAgent')} →</a></p>`}
    <div class="ag-sub">${tx('listingLinks')}</div><p class="xl-note" style="margin-top:0">${tx('listingLinksSub')}</p>
    ${linkInputs(LISTING_FIELDS, l.external_links, 'xl_')}
  </fieldset>`;
}
export function postValues(form) {
  const fd = new FormData(form);
  const links = readLinks(fd, LISTING_FIELDS, 'xl_'); if (links === null) return null;
  const out = { external_links: links };
  if (form.querySelector('[name="agent_id"]')) out.agent_id = fd.get('agent_id') || null;
  return out;
}

// ---------- Dashboard tab ----------
export async function accountTab(el) {
  const user = C.user();
  const edit = C.qs().get('agent');
  const { data: mine = [] } = await C.sb.from('yh_agents').select('*').eq('owner_id', user.id).order('created_at');
  const { data: rows = [] } = mine.length ? await C.sb.from('yh_listings').select('agent_id').in('agent_id', mine.map(a => a.id)).eq('status', 'active') : { data: [] };
  const cnt = {}; (rows || []).forEach(r => cnt[r.agent_id] = (cnt[r.agent_id] || 0) + 1);
  if (!mine.length || edit) {
    const a = mine.find(x => x.id === edit) || { kind: 'agent', languages: [], areas: [], links: [], name: user.user_metadata?.full_name || '' };
    return form(el, a, mine.length > 0);
  }
  el.innerHTML = `<div class="ag-grid">${mine.map(a => `<div class="panel ag-mine">${agentCard(a, cnt[a.id])}
      <div class="ag-btns"><a class="btn blue sm" href="#/agent/${C.esc(a.slug)}">${tx('viewPage')}</a><a class="btn ghost sm" href="#/account?tab=agent&agent=${a.id}">${tx('editAgent')}</a></div></div>`).join('')}</div>
    <a class="btn ghost" href="#/account?tab=agent&agent=new" style="margin-top:14px">${tx('addAgent')}</a>`;
}
function form(el, a, hasOthers) {
  const user = C.user();
  let photo = a.photo || '';
  const chk = (name, opts, cur) => `<div class="ag-pick">${opts.map(o => `<label><input type="checkbox" name="${name}" value="${C.esc(o)}" ${cur.includes(o) ? 'checked' : ''}><span>${C.esc(o)}</span></label>`).join('')}</div>`;
  el.innerHTML = `<form class="panel form ag-form" id="agForm" style="max-width:820px">
    <h3>${a.id ? tx('editAgent') : tx('createAgent')}</h3><p class="xl-note" style="margin-top:0">${tx('agentSub')}</p>
    <div class="ag-photo"><div id="agPh">${avatar({ ...a, photo }, 'ag-big')}</div><label class="btn ghost sm">${tx('photo')}<input type="file" id="agFile" accept="image/jpeg,image/png,image/webp" hidden></label></div>
    <div class="row"><label>${tx('fullName')} *<input name="name" required minlength="2" maxlength="80" value="${C.esc(a.name || '')}"></label>
      <label>${tx('kind')}<select name="kind">${['agent', 'agency', 'owner'].map(k => `<option value="${k}" ${a.kind === k ? 'selected' : ''}>${tx('k_' + k)}</option>`).join('')}</select></label></div>
    <div class="row"><label>${tx('company')}<input name="company" maxlength="100" value="${C.esc(a.company || '')}"></label>
      <label>${tx('pageAddr')}<div class="ag-slug"><span>yourhome.asia/#/agent/</span><input name="slug" maxlength="60" value="${C.esc(a.slug || '')}" placeholder="your-name"></div></label></div>
    <label>${tx('bio')}<textarea name="bio" maxlength="3000" placeholder="${C.esc(tx('bioPh'))}">${C.esc(a.bio || '')}</textarea></label>
    <label>${tx('languages')}${chk('languages', LANG_OPTS, a.languages || [])}</label>
    <label>${tx('areas')}${chk('areas', C.DISTRICTS, a.areas || [])}</label>
    <div class="ag-sub">${tx('contacts')}</div>
    <div class="row"><label>${C.t('phone')}<input name="phone" maxlength="30" value="${C.esc(a.phone || '')}" placeholder="+855 …"></label>
      <label>${C.t('telegram')}<input name="telegram" maxlength="40" value="${C.esc(a.telegram || '')}" placeholder="@username"></label></div>
    <div class="row"><label>${C.t('whatsapp')}<input name="whatsapp" maxlength="30" value="${C.esc(a.whatsapp || '')}" placeholder="+855 …"></label>
      <label>${tx('email')}<input name="email" type="email" maxlength="120" value="${C.esc(a.email || '')}"></label></div>
    <label>${tx('tgChan')}<input name="tg_channel" maxlength="40" value="${C.esc(a.tg_channel || '')}" placeholder="@mychannel"></label>
    <div class="ag-btns ag-tgc"><a class="btn ghost sm" href="${TG_ADD}" target="_blank" rel="noopener">${tx('tgAdd')}</a><button type="button" class="btn ghost sm" id="tgcBtn">${tx('tgCheck')}</button></div>
    <p class="xl-note" id="tgcSt" style="margin-top:6px" hidden></p>
    <p class="xl-note" style="margin-top:6px">${tx('tgSteps')}</p>
    <div class="ag-pick ag-tgi"><label><input type="checkbox" name="tg_import" ${a.tg_import ? 'checked' : ''}><span>${tx('tgImp')}</span></label></div>
    <p class="xl-note" style="margin-top:4px">${tx('tgImpHelp')} <a href="https://t.me/yourhomeasiabot?start=channel" target="_blank" rel="noopener">${tx('tgOpenBot')}</a></p>
    <div class="ag-sub">${tx('otherSites')}</div><p class="xl-note" style="margin-top:0">${tx('otherSitesSub')}</p>
    ${linkInputs(PROFILE_FIELDS, a.links, 'al_')}
    <div class="ag-btns"><button class="btn red" id="agSave">${tx('saveProfile')}</button>
      ${hasOthers || a.id ? `<a class="btn ghost" href="#/account?tab=agent">${C.t('cancel')}</a>` : ''}
      ${a.id ? `<button type="button" class="btn ghost" id="agDel">${tx('delProfile')}</button>` : ''}</div>
  </form>`;
  const f = document.getElementById('agForm');
  f.name.addEventListener('input', () => { if (!a.slug && !f.slug.dataset.touched) f.slug.value = slugify(f.name.value); });
  f.slug.addEventListener('input', () => { f.slug.dataset.touched = 1; });
  if (!a.slug) f.slug.value = slugify(f.name.value);
  document.getElementById('agFile').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) return C.toast('> 5 MB');
    const ext = (file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const path = `${user.id}/agent-${Date.now()}.${ext}`;
    const { error } = await C.sb.storage.from('yh-photos').upload(path, file, { contentType: file.type, cacheControl: '31536000' });
    if (error) return C.toast(C.t('error') + error.message);
    photo = C.sb.storage.from('yh-photos').getPublicUrl(path).data.publicUrl;
    document.getElementById('agPh').innerHTML = avatar({ ...a, photo }, 'ag-big');
  };
  const tgcBtn = document.getElementById('tgcBtn');
  tgcBtn.onclick = () => checkChannel(f.tg_channel.value, true);
  const del = document.getElementById('agDel');
  if (del) del.onclick = async () => { if (!confirm(tx('confirmDelProfile'))) return; const { error } = await C.sb.from('yh_agents').delete().eq('id', a.id); if (error) return C.toast(C.t('error') + error.message); C.go('#/account?tab=agent'); };
  f.onsubmit = async e => {
    e.preventDefault(); const fd = new FormData(f);
    const links = readLinks(fd, PROFILE_FIELDS, 'al_'); if (links === null) return;
    let slug = slugify(fd.get('slug') || fd.get('name')); if (slug.length < 3) slug = (slug + '-agent').replace(/^-/, '');
    const row = {
      name: fd.get('name').trim(), kind: fd.get('kind'), company: fd.get('company').trim() || null, slug, photo: photo || null,
      bio: fd.get('bio').trim() || null, languages: fd.getAll('languages'), areas: fd.getAll('areas'),
      phone: fd.get('phone').trim() || null, telegram: fd.get('telegram').trim() || null, whatsapp: fd.get('whatsapp').trim() || null,
      email: fd.get('email').trim() || null, links,
      // AGENT'S OWN TELEGRAM CHANNEL (owner, 2026-11-25): api/_tgx.js agentChannels() posts the profile's listings there too
      // CHANNEL → WEBSITE (owner, 2026-11-26): the channel's photo posts come to the agent on Telegram with "Publish on the website?"
      tg_import: !!fd.get('tg_import'),
      tg_channel: (() => { const v = String(fd.get('tg_channel') || '').trim().replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, ''); return v ? '@' + v : null; })(),
    };
    if (row.tg_channel && !/^@[A-Za-z0-9_]{5,32}$/.test(row.tg_channel)) return C.toast(tx('tgChanBad'));
    const btn = document.getElementById('agSave'); btn.disabled = true;
    let res = a.id ? await C.sb.from('yh_agents').update(row).eq('id', a.id).select('slug').single() : await C.sb.from('yh_agents').insert(row).select('slug').single();
    if (res.error && /duplicate|unique/i.test(res.error.message) && !f.slug.dataset.touched) {
      row.slug = (slug.slice(0, 52) + '-' + Math.random().toString(36).slice(2, 6));
      res = a.id ? await C.sb.from('yh_agents').update(row).eq('id', a.id).select('slug').single() : await C.sb.from('yh_agents').insert(row).select('slug').single();
    }
    btn.disabled = false;
    if (res.error) return C.toast(/duplicate|unique/i.test(res.error.message) ? tx('slugTaken') : C.t('error') + res.error.message, 5000);
    // a channel was given: say at once whether the bot can post there; if it can, start posting now (not only at the next cron run)
    if (row.tg_channel) { const ok = await checkChannel(row.tg_channel, false); if (ok) fetch('/api/tg-sync?quick=1', { keepalive: true }).catch(() => {}); }
    else C.toast(tx('profileSaved'));
    C.go('#/agent/' + res.data.slug);
  };
}

export const label = k => tx(k);
