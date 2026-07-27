// components/profit/CategoryDetector.ts
// Auto-detects eBay category key from API categoryName for each marketplace
// Add one country at a time — CA first, others will follow

import type { CACategoryKey } from '@/lib/profit-engine'

// ─── Canada ───────────────────────────────────────────────────────────────────
// Based on https://www.ebay.ca/sch/allcategories/all-categories
export function detectCACategory(catName: string): CACategoryKey {
    const n = catName.toLowerCase()
    // Computers
    if (n.includes('laptops & netbooks') || n.includes('pc notebooks') || n.includes('desktops & all-in-ones') || n.includes('monitors, projectors')) return 'computers_specific'
    if (n.includes('computer') || n.includes('tablet') || n.includes('networking') || n.includes('drives, storage') || n.includes('laptop & desktop accessories') || n.includes('computer components') || n.includes('printers, scanners')) return 'computers'
    // Cell Phones
    if (n.includes('cell phones & smartphones') || n.includes('cell phone & smartphone parts') || n.includes('smart watches') || n.includes('cell phone accessories')) return 'cell_phones'
    // Cameras
    if (n.includes('cameras & photo') || n.includes('digital cameras') || n.includes('camcorders') || n.includes('lenses & filters') || n.includes('camera drones') || n.includes('replacement parts & tools')) return 'cameras'
    // Consumer Electronics
    if (n.includes('consumer electronics') || n.includes('portable audio') || n.includes('tv, video') || n.includes('home audio') || n.includes('vehicle electronics') || n.includes('surveillance') || n.includes('virtual reality') || n.includes('smart glasses')) return 'consumer_electronics'
    // Video Games
    if (n.includes('video game consoles')) return 'video_game_consoles'
    if (n.includes('video games') || n.includes('video game accessories') || n.includes('video game merchandise')) return 'video_games'
    // Musical Instruments
    if (n.includes('guitars & basses') || n.includes('guitar')) return 'guitars'
    if (n.includes('dj equipment') || n.includes('pro audio')) return 'dj_pro_audio'
    if (n.includes('musical instruments')) return 'musical_instruments'
    // Coins & Bullion
    if (n.includes('bullion')) return 'coins_bullion'
    if (n.includes('coins') || n.includes('paper money') || n.includes('coins & paper money')) return 'coins'
    // Stamps
    if (n.includes('stamps')) return 'stamps'
    // Collectibles & Trading Cards
    if (n.includes('sports trading cards') || n.includes('collectible card games') || n.includes('sports mem') || n.includes('non-sport trading cards') || n.includes('sports stickers')) return 'collectibles_cards'
    if (n.includes('collectibles') || n.includes('entertainment memorabilia') || n.includes('autographs') || n.includes('animation art') || n.includes('historical memorabilia')) return 'collectibles_cards'
    // Books, Movies, Music
    if (n.includes('books & magazines') || n.includes('movies & tv') || n.includes('dvds & blu-ray') || n.includes('vinyl records') || n.includes('cds') || n.includes('audiobooks')) return 'books_movies_music'
    if (n.includes('music') && !n.includes('musical instrument') && !n.includes('music memorabilia')) return 'books_movies_music'
    // Athletic Shoes
    if (n.includes('athletic shoe') || n.includes('sneaker') || n.includes('trainer')) return 'athletic_shoes'
    // Automotive / Motors
    if (n.includes('tires') || n.includes('tyres') || n.includes('wheels')) return 'motors_tires'
    if (n.includes('vehicle electronics') || n.includes('gps') || n.includes('dash cam')) return 'motors_gps'
    if (n.includes('parts & accessories') || n.includes('automotive tools') || n.includes('powersports') || n.includes('auto part') || n.includes('vehicle part') || n.includes('car part') || n.includes('motorcycle part')) return 'motors_parts'
    // Heavy Equipment
    if (n.includes('heavy equipment') || n.includes('industrial automation') || n.includes('cnc, metalworking')) return 'heavy_equipment'
    // NFTs
    if (n.includes('nft')) return 'nfts'
    return 'default'
}

// ─── United Kingdom ───────────────────────────────────────────────────────────
// Based on https://www.ebay.co.uk/sch/allcategories/all-categories
// UKCategoryKey matches lib/profit-engine.ts

function detectUKCategory(catName: string): string {
    const n = catName.toLowerCase()

    // Computers & Networking
    if (n.includes('laptops & netbooks') || n.includes('pc laptops') ||
        n.includes('desktops & all-in-one') || n.includes('computer monitors') ||
        n.includes('computer drives') || n.includes('computer components'))
        return 'computers_specific'
    if (n.includes('computers/tablets') || n.includes('tablets & ereaders') ||
        n.includes('networking') || n.includes('laptop & desktop accessories') ||
        n.includes('enterprise networking') || n.includes('computer cables') ||
        n.includes('3d printers'))
        return 'computers_general'

    // Mobile Phones
    if (n.includes('mobile phones & smartphones') || n.includes('mobile phone parts') ||
        n.includes('smartwatches') || n.includes('mobile phone accessories') ||
        n.includes('mobile phones & communication') || n.includes('phone cards & sim'))
        return 'mobiles_phones'
    if (n.includes('mobile') || n.includes('phone'))
        return 'mobiles_general'

    // Cameras & Photography
    if (n.includes('cameras & photography') || n.includes('digital cameras') ||
        n.includes('camera lenses') || n.includes('camcorders') ||
        n.includes('film photography') || n.includes('camera, drone') ||
        n.includes('telescopes & binoculars'))
        return 'cameras_specific'
    if (n.includes('photo'))
        return 'cameras_general'

    // Sound & Vision
    if (n.includes('sound & vision') || n.includes('home audio') ||
        n.includes('portable audio') || n.includes('dvd, blu-ray') ||
        n.includes('tvs') || n.includes('tv & home audio') ||
        n.includes('vintage sound'))
        return 'sound_vision_specific'

    // Video Games
    if (n.includes('video game consoles'))
        return 'video_game_consoles'
    if (n.includes('video games & consoles') || n.includes('video games') ||
        n.includes('video game accessories') || n.includes('video game merchandise') ||
        n.includes('coin-operated gaming'))
        return 'video_games'

    // Musical Instruments
    if (n.includes('guitars & basses') || n.includes('guitar') ||
        n.includes('musical instruments & dj') || n.includes('dj equipment') ||
        n.includes('pro audio equipment') || n.includes('percussion instruments') ||
        n.includes('keyboards & pianos') || n.includes('string instruments'))
        return 'musical_instruments'

    // Watches
    if (n.includes('watches, parts') || n.includes('wristwatches') ||
        n.includes('watch accessories') || n.includes('watch parts'))
        return 'watches'

    // Jewellery
    if (n.includes('fine jewellery') || n.includes('costume jewellery') ||
        n.includes('jewellery & watches') || n.includes('vintage & antique jewellery') ||
        n.includes('handcrafted & artisan jewellery') || n.includes('engagement & wedding') ||
        n.includes('loose diamonds') || n.includes("men's jewellery") ||
        n.includes('body jewellery') || n.includes('jewellery mixed lots') ||
        n.includes('jewellery care') || n.includes('necklace') ||
        n.includes('bracelet') || n.includes('earring'))
        return 'jewellery'

    // Trainers / Athletic Shoes
    if (n.includes('trainer') || n.includes('athletic shoe') || n.includes('sneaker'))
        return 'trainers'

    // Handbags
    if (n.includes("women's bags & handbags") || n.includes('handbag') || n.includes('purse'))
        return 'handbags'

    // Clothing
    if (n.includes("women's clothing") || n.includes("men's clothing") ||
        n.includes("girls' clothes") || n.includes("boy's clothes") ||
        n.includes('clothing, shoes & accessories') || n.includes('vintage clothing') ||
        n.includes('fancy dress') || n.includes('wedding & formal') ||
        n.includes('dancewear') || n.includes('world & traditional clothing') ||
        n.includes('baby & toddler clothing') || n.includes("unisex kids' clothes"))
        return 'clothes_general'

    // Hair & Wigs
    if (n.includes('hair extension') || n.includes('wigs') || n.includes('hair care'))
        return 'hair_wigs'

    // Health & Beauty
    if (n.includes('health & beauty') || n.includes('skin care') || n.includes('make-up') ||
        n.includes('fragrances') || n.includes('vitamins & lifestyle') ||
        n.includes('bath & body') || n.includes('shaving & hair removal') ||
        n.includes('oral care') || n.includes('nail care') || n.includes('massage') ||
        n.includes('salon & spa') || n.includes('medical & mobility') ||
        n.includes('health care') || n.includes('natural & alternative') ||
        n.includes('tattoos & body art') || n.includes('sun care') ||
        n.includes('vision care'))
        return 'health_beauty'

    // Home Appliances
    if (n.includes('home appliances') || n.includes('major appliances'))
        return 'home_appliances'

    // Power Strips
    if (n.includes('power strip') || n.includes('surge protector') ||
        n.includes('power protection'))
        return 'home_power_strips'

    // Home Furniture
    if (n.includes('furniture') || n.includes('sofas') || n.includes('beds') ||
        n.includes('cabinets') || n.includes('tables') || n.includes('chairs') ||
        n.includes('bath') || n.includes('bedding') || n.includes('nursery decoration'))
        return 'home_furniture'

    // Garden & Patio
    if (n.includes('garden & patio') || n.includes('patio & garden') ||
        n.includes('lawn mowers') || n.includes('garden power tools') ||
        n.includes('plants, seeds') || n.includes('garden structures'))
        return 'garden_patio'

    // Home General
    if (n.includes('home & garden') || n.includes('household accessories') ||
        n.includes('home cookware') || n.includes('home décor') ||
        n.includes('home lighting') || n.includes('diy materials') ||
        n.includes('diy tools') || n.includes('celebrations & occasions') ||
        n.includes('baby') || n.includes('kitchen'))
        return 'home_general'

    // Sporting Goods
    if (n.includes('sporting goods') || n.includes('cycling') || n.includes('golf') ||
        n.includes('fishing') || n.includes('fitness, running') ||
        n.includes('camping & hiking') || n.includes('equestrian'))
        return 'sporting_goods'

    // Sports Memorabilia
    if (n.includes('sports memorabilia') || n.includes('sports trading cards') ||
        n.includes('football memorabilia') || n.includes('sports mem'))
        return 'sports_memorabilia'

    // Toys & Games
    if (n.includes('toys & games') || n.includes('action figures') ||
        n.includes('diecast') || n.includes('construction & building toys') ||
        n.includes('wargames') || n.includes('rc model') ||
        n.includes('dolls & bears') || n.includes('games'))
        return 'toys_games'

    // Books, Comics & Magazines
    if (n.includes('books, comics') || n.includes('fiction') ||
        n.includes('comic books') || n.includes('magazines') ||
        n.includes('textbooks') || n.includes('audio books'))
        return 'books_comics'

    // Films & TV
    if (n.includes('films & tv') || n.includes('dvds & blu-rays') ||
        n.includes('vhs films') || n.includes('film memorabilia') ||
        n.includes('tv memorabilia'))
        return 'films_tv'

    // Music
    if (n.includes('vinyl records') || n.includes('music cds') ||
        n.includes('music cassettes') || n.includes('music memorabilia') ||
        n.includes('audio media') || (n.includes('music') && !n.includes('musical')))
        return 'music'

    // Coins
    if (n.includes('coins') || n.includes('banknotes') || n.includes('bullion & bars') ||
        n.includes('token coins') || n.includes('historical medals'))
        return 'coins'

    // Stamps
    if (n.includes('stamps'))
        return 'stamps'

    // Collectables
    if (n.includes('collectables') || n.includes('antiques') ||
        n.includes('collectable card games') || n.includes('model trains') ||
        n.includes('militaria') || n.includes('pottery, ceramics') ||
        n.includes('art prints') || n.includes('art paintings'))
        return 'collectables'

    // Pet Supplies
    if (n.includes('pet supplies') || n.includes('dog supplies') ||
        n.includes('cat supplies') || n.includes('fish & aquarium') ||
        n.includes('bird supplies') || n.includes('small animal'))
        return 'pet_supplies'

    // Crafts
    if (n.includes('crafts') || n.includes('yarn, sewing') || n.includes('fabric') ||
        n.includes('sewing tools') || n.includes('painting, drawing') ||
        n.includes('cardmaking') || n.includes('beads & jewellery making'))
        return 'crafts'

    // Vehicle Parts Specific (tyres/GPS)
    if (n.includes('in-car technology') || n.includes('gps') ||
        n.includes('tyre') || n.includes('tire') || n.includes('wheel'))
        return 'vehicle_parts_specific'

    // Vehicle Parts General
    if (n.includes('car parts') || n.includes('motorcycle & scooter parts') ||
        n.includes('vehicle parts & accessories') || n.includes('garage equipment') ||
        n.includes('car tuning'))
        return 'vehicle_parts_general'

    // Holidays & Travel
    if (n.includes('holidays & travel') || n.includes('holiday & travel') ||
        n.includes('flight tickets') || n.includes('package holidays'))
        return 'holidays_travel'

    // Events Tickets
    if (n.includes('events tickets') || n.includes('concert tickets') ||
        n.includes('theme park tickets') || n.includes('cinema tickets') ||
        n.includes('festival tickets') || n.includes('gift vouchers'))
        return 'event_tickets'

    // Business & Industrial
    if (n.includes('business, office') || n.includes('industrial tools') ||
        n.includes('office equipment') || n.includes('cnc, metalworking') ||
        n.includes('material handling') || n.includes('electrical equipment') ||
        n.includes('agriculture') || n.includes('restaurant & food service') ||
        n.includes('retail & shop') || n.includes('healthcare, lab') ||
        n.includes('facility maintenance') || n.includes('cleaning & janitorial') ||
        n.includes('building materials'))
        return 'business_industrial'

    // Memorials
    if (n.includes('memorials & funerals') || n.includes('cremation urns') ||
        n.includes('headstones') || n.includes('coffins') || n.includes('grave'))
        return 'memorials'

    // Wholesale
    if (n.includes('wholesale & job lots') || n.includes('wholesale lots'))
        return 'wholesale'

    // NFTs
    if (n.includes('nft'))
        return 'nfts'

    return 'default'
}

// ─── Germany ─────────────────────────────────────────────────────────────────
// Complete category list from https://www.ebay.de/sch/allcategories/all-categories
// DECategoryKey matches lib/profit-engine.ts

function detectDECategory(catName: string): string {
    const n = catName.toLowerCase()

    // ── Watches (wristwatches, not parts) ──
    if ((n.includes('armbanduhren') || n.includes('taschenuhren') ||
        n.includes('sammleruhren') || n.includes('weitere uhren') ||
        n.includes('gemischte uhren')) &&
        !n.includes('ersatzteile') && !n.includes('werkzeuge') && !n.includes('zubehör'))
        return 'wristwatches'

    // ── Watch parts / accessories ──
    if ((n.includes('ersatzteile') && n.includes('uhren')) ||
        (n.includes('werkzeuge') && n.includes('uhren')) ||
        n.includes('uhrenzubehör'))
        return 'watch_parts'

    // ── Jewellery ──
    if (n.includes('echtschmuck') || n.includes('modeschmuck') ||
        n.includes('herrenschmuck') || n.includes('kinderschmuck') ||
        n.includes('folkloreschmuck') || n.includes('unikate & goldschmied') ||
        n.includes('juwelierbedarf') || n.includes('hochzeitsschmuck') ||
        n.includes('lose diamanten') || n.includes('lose edelsteine') ||
        n.includes('piercing') || n.includes('taufschmuck') ||
        n.includes('schmuck') || n.includes('halsketten') ||
        n.includes('armbänder') || n.includes('ohrschmuck') ||
        n.includes('manschettenknöpfe') || n.includes('krawattennadeln') ||
        n.includes('zirkonia') || n.includes('trauringe') ||
        n.includes('verlobungsringe') || n.includes('lose künstliche perlen'))
        return 'watches_jewelry'

    // ── Tech — computers, phones, cameras, audio, gaming, appliances ──
    if (n.includes('laptops & notebooks') || n.includes('laptops-notebooks') ||
        n.includes('desktops & all-in-one') || n.includes('computer-komponenten') ||
        n.includes('tablets & ebook-reader') || n.includes('computer, tablets') ||
        n.includes('heimnetzwerk') || n.includes('handys & smartphones') ||
        n.includes('handy-zubehör') || n.includes('smartwatches') ||
        n.includes('digitalkameras') || n.includes('kamera-objektive') ||
        n.includes('foto & camcorder') || n.includes('teleskope') ||
        n.includes('fernseher') || n.includes('heim-audio') || n.includes('hifi') ||
        n.includes('tragbare audiogerate') || n.includes('kopfhörer') ||
        n.includes('spielekonsolen') || n.includes('pc-games') ||
        n.includes('videospiel') || n.includes('gaming') ||
        n.includes('haushaltsgeräte') || n.includes('küchen-kleingeräte') ||
        n.includes('staubsauger') || n.includes('kaffee-') ||
        n.includes('gefriergeräte') || n.includes('backöfen') ||
        n.includes('solarenergie') || n.includes('elektronik, gps') ||
        n.includes('bürotechnik') || n.includes('beschriftungsgeräte') ||
        n.includes('babyfone'))
        return 'tech_new'

    // ── Sneakers ──
    if (n.includes('sneaker') || n.includes('turnschuhe') ||
        (n.includes('schuhe') && (n.includes('sport') || n.includes('fitness'))))
        return 'sneakers_over100'

    // ── Clothing & Fashion ──
    if (n.includes('damenmode') || n.includes('herrenmode') ||
        n.includes('kindermode') || n.includes('babymode') ||
        n.includes('kleidung & accessoires') || n.includes('damenschuhe') ||
        n.includes('herrenschuhe') || n.includes('kostüme') ||
        n.includes('vintage-mode') || n.includes('hochzeit & besondere') ||
        n.includes('damentaschen') || n.includes('spezielle anlässe') ||
        n.includes('mode, schuhe') || n.includes('kleidung') ||
        n.includes('reisekoffer') || n.includes('reisetaschen') ||
        n.includes('reiseaccessoires') || n.includes('sporttaschen') ||
        n.includes('sportrucksäcke') || n.includes('reitbekleidung') ||
        n.includes('bootsport-bekleidung') || n.includes('ski- & snowboard-bekleidung') ||
        n.includes('outdoor-bekleidung') || n.includes('fitness & laufbekleidung') ||
        n.includes('fahrradbekleidung') || n.includes('golfbekleidung') ||
        n.includes('angelsport-bekleidung') || n.includes('fußballbekleidung') ||
        n.includes('damen-sport-hosen') || n.includes('aktenkoffer') ||
        n.includes('businesstaschen') || n.includes('schulranzen'))
        return 'clothing'

    // ── Auto parts ──
    if (n.includes('autoteile') || n.includes('auto & motorrad: teile') ||
        n.includes('motorrad- & rollerteile') || n.includes('auto-tuning') ||
        n.includes('kraftfahrzeug-öle') || n.includes('automobile') ||
        n.includes('motorräder') || n.includes('nutzfahrzeuge') ||
        n.includes('wohnwagen') || n.includes('pkw-anhänger'))
        return 'auto_parts'

    // ── Auto electronics / GPS ──
    if (n.includes('elektronik, gps & sicherheitstechnik fürs auto'))
        return 'auto_electronics'

    // ── Auto tires / wheels ──
    if (n.includes('felgen') ||
        (n.includes('reifen') && n.includes('auto')))
        return 'auto_tires'

    // ── Auto clothing / riding gear ──
    if (n.includes('kleidung, schutzausrüstung') && n.includes('motorrad'))
        return 'auto_clothing'

    // ── Garden & Patio ──
    if (n.includes('garten & terrasse') || n.includes('gartenmöbel') ||
        n.includes('gartenmaschinen') || n.includes('gartenbauten') ||
        n.includes('pflanzen, sämereien') || n.includes('grills') ||
        n.includes('garten'))
        return 'garden_patio'

    // ── Home improvement / DIY ──
    if (n.includes('heimwerker') || n.includes('werkzeuge') ||
        n.includes('heizen, klima') || n.includes('heimwerker-produkte') ||
        n.includes('fenster, türen') || n.includes('baustoffe') ||
        n.includes('baugewerbe') || n.includes('holzbearbeitung') ||
        n.includes('möbel & wohnen') || n.includes('möbel') ||
        n.includes('beleuchtung') || n.includes('dekoration') ||
        n.includes('bettwäsche') || n.includes('küchenbedarf') ||
        n.includes('immobilien'))
        return 'home_improvement'

    // ── Musical instruments ──
    if (n.includes('gitarren & bässe') || n.includes('musikinstrumente') ||
        n.includes('tasteninstrumente') || n.includes('audio-equipment') ||
        n.includes('drums & percussion') || n.includes('holzblasinstrumente') ||
        n.includes('noten & songbooks'))
        return 'musical_instruments'

    // ── Media — books, films, music, video games, tickets ──
    if (n.includes('schallplatten') || n.includes('musik cds') ||
        n.includes('musikkassetten') || n.includes('filme & serien') ||
        n.includes('bücher & zeitschriften') || n.includes('bücher') ||
        n.includes('zeitschriften') || n.includes('hörbücher') ||
        n.includes('filme auf dvd') || n.includes('filme auf vhs') ||
        n.includes('pc-games & videospiele') || n.includes('musik-fanartikel') ||
        n.includes('festival-tickets') || n.includes('sport-event-tickets') ||
        n.includes('musical- & show-tickets') || n.includes('comedy-') ||
        n.includes('tickets') || n.includes('baby-bücher'))
        return 'media'

    // ── Coins / Bullion / Stamps ──
    if (n.includes('edelmetalle') || n.includes('bullion') ||
        n.includes('münzen') || n.includes('briefmarken') ||
        n.includes('medaillen') || n.includes('philatelie'))
        return 'coins'

    // ── Collectibles / Models / Travel ──
    if (n.includes('sammelkartenspiele') || n.includes('trading card') ||
        n.includes('trading cards') || n.includes('modellbau') ||
        n.includes('modelleisenbahnen') || n.includes('rc-modellbau') ||
        n.includes('modellbausätze') || n.includes('antiquitäten') ||
        n.includes('sammeln & seltenes') || n.includes('militaria') ||
        n.includes('ddr-') || n.includes('reisen') || n.includes('kurzreisen') ||
        n.includes('übernachtung') || n.includes('fahrkarten'))
        return 'standard_11'

    // ── Business & Industrial ──
    if (n.includes('business & industrie') || n.includes('metallbearbeitung') ||
        n.includes('elektronik & messtechnik') || n.includes('automation') ||
        n.includes('transport & logistik') || n.includes('hydraulik') ||
        n.includes('werkzeuge & werkstattbedarf') || n.includes('gastronomiebedarf') ||
        n.includes('gastro') || n.includes('agrar') || n.includes('medizin & labor') ||
        n.includes('ladenausstattung') || n.includes('sicherheit & gebäude') ||
        n.includes('großhandel') || n.includes('kunststoffindustrie') ||
        n.includes('hlkk') || n.includes('produktions-') || n.includes('büro & schreib') ||
        n.includes('bürobedarf') || n.includes('schulbedarf') || n.includes('büromöbel') ||
        n.includes('präsentationsbedarf') || n.includes('technischer zeichenbedarf') ||
        n.includes('geschenk- & werbeartikel') || n.includes('werbeartikel'))
        return 'business_industrial'

    // ── Sports & Outdoors ──
    if (n.includes('sportartikel') || n.includes('radsport') || n.includes('fahrräder') ||
        n.includes('e-bikes') || n.includes('fußball') || n.includes('fitness') ||
        n.includes('camping & outdoor') || n.includes('angelsport') ||
        n.includes('reit- & fahrsport') || n.includes('bootsport') ||
        n.includes('wintersport') || n.includes('funsport') || n.includes('golf') ||
        n.includes('weitere ballsportarten') || n.includes('wassersport') ||
        n.includes('hockey') || n.includes('tauchen') || n.includes('inlineskating') ||
        n.includes('weitere wintersportarten') || n.includes('sportpreise') ||
        n.includes('bastel- & künstlerbedarf') || n.includes('handarbeit') ||
        n.includes('musikinstrumente') || n.includes('jagdausrüstung') ||
        n.includes('bogenschieß') || n.includes('billard') || n.includes('boxsport') ||
        n.includes('kartsport') || n.includes('turn-') || n.includes('elektro-scooter') ||
        n.includes('skateboarding') || n.includes('cityroller') || n.includes('dirt bikes') ||
        n.includes('airsoft') || n.includes('pocket bikes'))
        return 'default'

    // ── Beauty & Health ──
    if (n.includes('beauty & gesundheit') || n.includes('parfums') ||
        n.includes('hautpflege') || n.includes('haarpflege') ||
        n.includes('körperpflege') || n.includes('make-up') ||
        n.includes('maniküre') || n.includes('pediküre') ||
        n.includes('massage') || n.includes('zahnpflege') ||
        n.includes('augenoptik') || n.includes('enthaarung') ||
        n.includes('rasur') || n.includes('tattoo') ||
        n.includes('sonnenschutz') || n.includes('solarium') ||
        n.includes('medikamente') || n.includes('hilfsmittel') ||
        n.includes('vitamine') || n.includes('nahrungsergänzung') ||
        n.includes('natur- & alternativheilmittel') || n.includes('spa,') ||
        n.includes('friseursalon') || n.includes('kosmetik'))
        return 'default'

    // ── Baby & Kids ──
    if (n.includes('babyartikel') || n.includes('kinderwagen') ||
        n.includes('babymöbel') || n.includes('babyspielzeug') ||
        n.includes('baby-') || n.includes('kinder-') ||
        n.includes('autokindersitz') || n.includes('windeln') ||
        n.includes('schnuller') || n.includes('taufe') || n.includes('zwillinge'))
        return 'default'

    // ── Pets ──
    if (n.includes('haustierbedarf') || n.includes('hundebedarf') ||
        n.includes('katzenbedarf') || n.includes('aquarien') ||
        n.includes('vogelbedarf') || n.includes('reptilien') ||
        n.includes('nagetiere') || n.includes('geflügel') ||
        n.includes('tierurnen') || n.includes('tiermedikamente'))
        return 'default'

    // ── Food & Drink / Feinschmecker ──
    if (n.includes('feinschmecker') || n.includes('bier, wein') ||
        n.includes('spirituosen') || n.includes('lebensmittel') ||
        n.includes('kaffee, tee') || n.includes('alkoholfreie getränke') ||
        n.includes('zigarren') || n.includes('tabakwaren') ||
        n.includes('e-zigaretten') || n.includes('shisha') ||
        n.includes('käse') || n.includes('brot'))
        return 'default'

    // ── Toys ──
    if (n.includes('spielzeug') || n.includes('lego') || n.includes('playmobil') ||
        n.includes('puppen') || n.includes('stofftiere') || n.includes('puzzles') ||
        n.includes('gesellschaftsspiele') || n.includes('kinderfahrzeuge') ||
        n.includes('lernspielzeug') || n.includes('holzspielzeug') ||
        n.includes('elektrisches spielzeug') || n.includes('teddybären'))
        return 'default'

    // ── NFTs ──
    if (n.includes('nft'))
        return 'nfts'

    return 'default'
}

// ─── France ──────────────────────────────────────────────────────────────────
// Complete category list from https://www.ebay.fr/sch/allcategories/all-categories
// FRCategoryKey matches lib/profit-engine.ts

function detectFRCategory(catName: string): string {
    const n = catName.toLowerCase()

    // ── Electronics — devices (5%) ──
    if (n.includes('informatique') || n.includes('téléphonie') ||
        n.includes('jeux vidéo') || n.includes('consoles') ||
        n.includes('image, son') || n.includes('photo, caméscopes') ||
        n.includes('appareils photo') || n.includes('caméscopes') ||
        n.includes('objectifs') || n.includes('télescopes') ||
        n.includes('drones') || n.includes('portables, netbooks') ||
        n.includes('tablettes, liseuses') || n.includes('pc de bureau') ||
        n.includes('ordinateur') || n.includes('écrans') ||
        n.includes('télévisions') || n.includes('hi-fi') ||
        n.includes('matériel audio') || n.includes('enceintes portables') ||
        n.includes('high-tech') || n.includes('haute technologie') ||
        n.includes('réalité virtuelle') || n.includes('maison intelligente'))
        return 'electronics_devices'

    // ── Electronics — accessories (7.5%) ──
    if (n.includes('accessoires ordinateur') || n.includes('câbles, connecteurs') ||
        n.includes('claviers, souris') || n.includes('logiciels') ||
        n.includes('supports vierges') || n.includes('imprimantes, scanners') ||
        n.includes('composants') || n.includes('pièces de rechange') ||
        n.includes('accessoires image') || n.includes('accessoires: photo') ||
        n.includes('composants: tv') || n.includes('piles, alimentation') ||
        n.includes('tablettes, liseuses: accessoires') || n.includes('tablettes: pièces') ||
        n.includes('réseau') || n.includes('bureautique'))
        return 'electronics_accessories'

    // ── Tires & Wheels (5% → 2%) ──
    if (n.includes('pneus') || n.includes('chambres à air'))
        return 'tires_wheels'

    // ── Auto parts (9%) ──
    if (n.includes('pièces et accessoires pour auto') ||
        n.includes('automobile : pièces') || n.includes('tuning, styling') ||
        n.includes('moto : pièces') || n.includes('autoradios, hi-fi, vidéo, gps') ||
        n.includes('moto de collection') || n.includes('équipements, outils de garage') ||
        n.includes('huiles, lubrifiants') || n.includes('automobilia') ||
        n.includes('scooter : pièces') || n.includes('moto: accessoires') ||
        n.includes('quad, trike') || n.includes('auto : entretien') ||
        n.includes('trial, cross') || n.includes('moto : tuning') ||
        n.includes('revues, manuels automobile') || n.includes('voiturettes de golf') ||
        n.includes('auto, moto - pièces') || n.includes('casques, vêtements') && n.includes('moto'))
        return 'auto_parts'

    // ── Watches & Handbags (12% → 2%) ──
    if ((n.includes('montres') || n.includes('montre')) &&
        !n.includes('joaillerie') && !n.includes('bijoux'))
        return 'watches_handbags'
    if (n.includes('bijoux et montres') && !n.includes('joaillerie'))
        return 'watches_handbags'

    // ── Jewellery (12% → 4%) ──
    if (n.includes('joaillerie') || n.includes('bijoux fantaisie') ||
        n.includes('bijoux pour hommes') || n.includes('pierres précieuses') ||
        n.includes('bijoux de corps') || n.includes('perles au détail') ||
        n.includes('boîtes à bijoux') || n.includes('bijoux'))
        return 'jewelry'

    // ── Fashion (12%) ──
    if (n.includes('vêtements et accessoires') ||
        n.includes('femme : vêtements') || n.includes('homme : vêtements') ||
        n.includes('déguisements, occasions') || n.includes('enfant : vêtements') ||
        n.includes('bébé : vêtements') || n.includes('vêtements, accessoires') ||
        n.includes('casques, vêtements') || n.includes('chaussures') ||
        n.includes('mode'))
        return 'fashion'

    // ── Collectibles (9% → 2%) ──
    if (n.includes('articles de collection') || n.includes('jeux de cartes à collectionner') ||
        n.includes('militaria') || n.includes('objets publicitaires') ||
        n.includes('cartes de collection') || n.includes('cartes postales') ||
        n.includes('briquets') || n.includes('bistrot') || n.includes('pins') ||
        n.includes('fèves') || n.includes('coquillages, minéraux') ||
        n.includes('religion, ésotérisme') || n.includes('sciences, médecine') ||
        n.includes('photographies') || n.includes("costumes, vêtements d'époque") ||
        n.includes('lettres, vieux papiers') || n.includes('radios, tsf') ||
        n.includes('art et antiquités') || n.includes('meubles, décoration du') ||
        n.includes('objets du xix') || n.includes('art du xix') ||
        n.includes('art du xx') || n.includes('reproductions, copies') ||
        n.includes('timbres') || n.includes('philatélie') ||
        n.includes('monnaies') || n.includes('pièces euro') ||
        n.includes('pièces france') || n.includes('médailles, jetons') ||
        n.includes('lingots') || n.includes('billets du monde') ||
        n.includes('céramiques') || n.includes('verre, cristal') ||
        n.includes('barbotines') || n.includes('objets de collection'))
        return 'collectibles'

    // ── Home & Garden (9%) ──
    if (n.includes('articles pour la maison') || n.includes('cuisine, arts de la table') ||
        n.includes('meubles') || n.includes("décoration d'intérieur") ||
        n.includes('éclairage intérieur') || n.includes('literie, linge de lit') ||
        n.includes('horloges') || n.includes('salle de bain') ||
        n.includes('cheminées et poêles') || n.includes('rideaux') ||
        n.includes('tapis et moquettes') || n.includes('solutions de rangement') ||
        n.includes('articles pour jardin') || n.includes('tondeuses') ||
        n.includes('meubles de jardin') || n.includes('piscines') ||
        n.includes('plantes, graines et bulbes') || n.includes('décoration de jardin') ||
        n.includes('barbecues') || n.includes('jardin et terrasse') ||
        n.includes('matériel de bricolage') || n.includes('électricité') ||
        n.includes('plomberie') || n.includes('peintures, vernis') ||
        n.includes('portes et quincaillerie') || n.includes('fenêtres') ||
        n.includes('bricolage') || n.includes('électroménager') ||
        n.includes('machines à café') || n.includes('réfrigérateurs') ||
        n.includes('lave-linges') || n.includes('immobilier') ||
        n.includes('maison') || n.includes('jardin'))
        return 'home_garden'

    // ── Default (9%) — sports, beauty, baby, pets, books, music,
    //    instruments, crafts, business/PME, food, tickets ──
    return 'default'
}

// Call this with the country code and categoryName from the API
// Returns the correct category key string for that country
// ─── Italy ────────────────────────────────────────────────────────────────────
// Complete category list from https://www.ebay.it/sch/allcategories/all-categories
// ITCategoryKey matches lib/profit-engine.ts

function detectITCategory(catName: string): string {
    const n = catName.toLowerCase()

    // Tech devices (6.5%)
    if (n.includes('informatica') || n.includes('notebook') ||
        n.includes('laptop') || n.includes('portatili') ||
        n.includes('desktop') || n.includes('tablet') ||
        n.includes('ebook reader') || n.includes('telefonia') ||
        n.includes('televisori') || n.includes('tv, audio e video') ||
        n.includes('videogiochi e console') || n.includes('fotocamere digitali') ||
        n.includes('fotografia e video') || n.includes('videocamere') ||
        n.includes('droni per riprese') || n.includes('elettronica') ||
        n.includes('monitor, proiettori') || n.includes('smart home'))
        return 'tech_devices'

    // Tech accessories (8.5%)
    if (n.includes('componenti e parti') || n.includes('cavi e connettori') ||
        n.includes('accessori laptop') || n.includes('accessori tablet') ||
        n.includes('tastiere, mouse') || n.includes('networking') ||
        n.includes('software') || n.includes('dispositivi archiviazione') ||
        n.includes('stampanti, scanner') || n.includes('alimentazione') ||
        n.includes('stampa 3d') || n.includes('accessori tv') ||
        n.includes('ricambi tv') || n.includes('batterie e alimentatori') ||
        n.includes('decoder') || n.includes('accessori foto') ||
        n.includes('obiettivi e filtri') || n.includes('flash e accessori') ||
        n.includes('treppiedi') || n.includes('ricambi e riparazione'))
        return 'tech_accessories'

    // Other electronics (9.5%)
    if (n.includes('home audio') || n.includes('hi-fi') ||
        n.includes('dispositivi audio portatili') || n.includes('cuffie') ||
        n.includes('apparecchiature professionali e dj') ||
        n.includes('dvd, blu-ray e home cinema') ||
        n.includes('vintage tv, audio'))
        return 'other_electronics'

    // Beauty electric (6.5%) — electric grooming + appliances
    if (n.includes('elettrodomestici') ||
        n.includes('cura e acconciatura dei capelli') ||
        n.includes('depilazione e rasatura') ||
        n.includes('igiene orale'))
        return 'beauty_electric'

    // Moto parts (12%)
    if (n.includes('moto: ricambi') || n.includes('moto d') && n.includes('ricambi') ||
        n.includes('moto: accessori') || n.includes('moto: manuali') ||
        n.includes('scooter: ricambi') || n.includes('motocross e trial') ||
        n.includes('quad e atv'))
        return 'moto_parts'

    // Tires & Wheels (6.5% -> 2%)
    if (n.includes('pneumatici') || n.includes('cerchi'))
        return 'tires_wheels'

    // Auto parts (12.5%)
    if (n.includes('auto: ricambi') || n.includes('auto: tuning') ||
        n.includes('gps, audio ed elettronica auto') ||
        n.includes('garage: utensili') || n.includes('auto: manuali') ||
        n.includes('auto: cura') || n.includes('auto: sicurezza') ||
        n.includes('antifurto e protezione auto') ||
        n.includes('abbigliamento, caschi e protezioni'))
        return 'auto_parts'

    // Watches (11% -> 5% -> 2%)
    if (n.includes('orologi, accessori e ricambi') ||
        n.includes('lotti e stock orologi') ||
        (n.includes('orologi') && !n.includes('gioielli') &&
            !n.includes('bigiotteria') && !n.includes('perline')))
        return 'watches'

    // Jewellery (11% -> 4%)
    if (n.includes('gioielli di lusso') || n.includes('bigiotteria') ||
        n.includes('gioielli antichi') || n.includes('gioielli uomo') ||
        n.includes('diamanti e gemme') || n.includes('ricambi e accessori gioielli') ||
        n.includes('gioielli per il corpo') || n.includes('etnici e tribali') ||
        n.includes('perline sfuse') || n.includes('lotti e stock gioielli') ||
        n.includes('orologi e gioielli'))
        return 'jewelry'

    // Shoes (11% -> 5%)
    if (n.includes('scarpe') || n.includes('calzature'))
        return 'shoes'

    // Bags & Handbags (11% -> 2%)
    if (n.includes('borse') || n.includes('zaini') || n.includes('valigie'))
        return 'bags_handbags'

    // Trading cards (6.5% -> 2%)
    if (n.includes('carte gioco collezionabili') ||
        n.includes('carte collezionabili sportive') ||
        n.includes('carte collezionabili non sportive') ||
        n.includes('warhammer e war games'))
        return 'trading_cards'

    // Comics (6.5%)
    if (n.includes('fumetti') || n.includes('manga') ||
        n.includes('artbooks') || n.includes('tavole originali'))
        return 'comics'

    // Art & Collectibles (11% -> 2%)
    if (n.includes('articoli di arte e antiquariato') ||
        n.includes('articoli da collezione') || n.includes('militaria') ||
        n.includes('oggetti per fumatori') || n.includes('collezioni diverse') ||
        n.includes('collezionismo') || n.includes('cartoline') ||
        n.includes('personaggi da collezione') || n.includes('autografi') ||
        n.includes('arredamento d') && n.includes('antiquariato') ||
        n.includes('porcellana e ceramica') || n.includes('modernariato') ||
        n.includes('quadri') || n.includes('sculture') ||
        n.includes('monete') || n.includes('banconote') ||
        n.includes('lingotti') || n.includes('medaglie') ||
        n.includes('minerali, fossili') || n.includes('pubblicitario'))
        return 'art_collectibles'

    // Garden furniture (12% -> 10%)
    if (n.includes('arredamento da giardino') || n.includes('arredamento da esterno'))
        return 'garden_furniture'

    // Garden & outdoor (12%)
    if (n.includes('articoli per il giardino') ||
        n.includes('elettroutensili e macchine da giardino') ||
        n.includes('tosaerba') || n.includes('piante, semi e bulbi') ||
        n.includes('piscine, saune') || n.includes('strutture e ombrari') ||
        n.includes('riscaldamento, barbecue') ||
        n.includes('laghetti e giochi') || n.includes('recinzioni') ||
        n.includes('idroponica') || n.includes('fitosanitari') ||
        n.includes('giardino') || n.includes('arredamento di esterni'))
        return 'garden_outdoor'

    // Home spare parts (9.5%)
    if (n.includes('bricolage e fai da te: attrezzatura') ||
        n.includes('bricolage e fai da te: materiali') ||
        n.includes('idraulica e impiantistica') ||
        n.includes('sicurezza e antifurti') ||
        n.includes('utensili manuali e attrezzature'))
        return 'home_spare_parts'

    // Home / FMCG (11%)
    if (n.includes('arredamento e bricolage per la casa') ||
        n.includes('articoli per cucina') || n.includes('illuminazione da interno') ||
        n.includes('decorazione della casa') || n.includes('feste e occasioni') ||
        n.includes('bagno') || n.includes('tessile da letto') ||
        n.includes('caminetti e stufe') || n.includes('soluzioni salvaspazio') ||
        n.includes('tende, tendaggi') || n.includes('tappeti, corsie') ||
        n.includes('bambini: casa') || n.includes('articoli per la scuola') ||
        n.includes('articoli per animali') || n.includes('articoli per hobby creativi') ||
        n.includes('cucito') || n.includes('ricamo e filati') ||
        n.includes('tessuti e stoffe') || n.includes('perle e gioielli fai da te') ||
        n.includes('scrapbooking') || n.includes('candele e saponi') ||
        n.includes('lavorazione del legno') || n.includes('mosaici'))
        return 'home_fmcg'

    // Default (11%) — clothing, beauty, sports, music, books, games,
    // business/industrial, baby, travel, stamps, tickets, food
    return 'default'
}

// ─── Spain ────────────────────────────────────────────────────────────────────
// Complete category list from https://www.ebay.es/sch/allcategories/all-categories
// ESCategoryKey matches lib/profit-engine.ts

function detectESCategory(catName: string): string {
    const n = catName.toLowerCase()

    // Tech devices (5% -> 2%) — computers, phones, cameras, consoles, TV, appliances
    if (n.includes('informática y tablets') || n.includes('portátiles y netbooks') ||
        n.includes('ordenadores de sobremesa') || n.includes('tablets e ebooks') ||
        n.includes('ordenadores y tablets') || n.includes('móviles y telefonía') ||
        n.includes('consolas y videojuegos') || n.includes('imagen y sonido') ||
        n.includes('televisores') || n.includes('cámaras y fotografía') ||
        n.includes('cámaras digitales') || n.includes('fotografía analógica') ||
        n.includes('cámaras de vídeo') || n.includes('drones con cámara') ||
        n.includes('electrónica') || n.includes('electrodomésticos') ||
        n.includes('cafeteras y teteras') || n.includes('frigoríficos') ||
        n.includes('lavadoras') || n.includes('lavavajillas') ||
        n.includes('planchado y aspirado') || n.includes('placas, hornos'))
        return 'tech_devices'

    // Beauty electric (5% -> 2%)
    if (n.includes('afeitado y depilación') ||
        n.includes('estilo y cuidado del cabello'))
        return 'beauty_electric'

    // Tech accessories (7.5% -> 2%)
    if (n.includes('componentes/piezas ordenador') || n.includes('cables y conectores') ||
        n.includes('teclados, ratones') || n.includes('impresoras y escáneres') ||
        n.includes('software') || n.includes('unidades de almacenamiento') ||
        n.includes('accesorios para ordenadores') || n.includes('accesorios, tablets') ||
        n.includes('monitores/proyectores') || n.includes('conexión de redes') ||
        n.includes('impresión 3d') || n.includes('calculadoras') ||
        n.includes('recambios para tv') || n.includes('accesorios tv') ||
        n.includes('sonido portátil y auriculares') ||
        n.includes('accesorios cámaras') || n.includes('objetivos y filtros') ||
        n.includes('trípodes y soportes') || n.includes('flashes y accesorios'))
        return 'tech_accessories'

    // Auto electronics (9% -> 2%)
    if (n.includes('coche: hi-fi, gps') || n.includes('hi-fi, gps y tecnología'))
        return 'auto_electronics'

    // Tires & Wheels (5% -> 2%)
    if (n.includes('motos: ruedas y neumáticos') || n.includes('neumáticos') ||
        n.includes('ruedas'))
        return 'tires_wheels'

    // Watches & Jewellery combined (9% -> 2%)
    if (n.includes('relojes y joyas') || n.includes('relojes, recambios') ||
        n.includes('joyería') || n.includes('bisutería') ||
        n.includes('joyería para hombre') || n.includes('diamantes y gemas') ||
        n.includes('joyas para el cuerpo') || n.includes('joyeros y material') ||
        n.includes('vintage y joyería antigua') || n.includes('joyería artesanal') ||
        n.includes('cuentas sueltas') || n.includes('relojes'))
        return 'watches_jewelry'

    // Musical instruments (9% -> 2%)
    if (n.includes('instrumentos musicales') || n.includes('guitarras y bajos') ||
        n.includes('teclados y pianos') || n.includes('percusión y baterías') ||
        n.includes('instrumentos de viento') || n.includes('sonido profesional') ||
        n.includes('instrumentos de cuerda') || n.includes('partituras') ||
        n.includes('instrumentos vintage'))
        return 'musical_instruments'

    // Home & Garden (9% -> 2%)
    if (n.includes('terraza y jardín') || n.includes('artículos para casa') ||
        n.includes('cocina, comedor y bar') || n.includes('herramientas de bricolaje') ||
        n.includes('muebles') || n.includes('decoración para el hogar') ||
        n.includes('materiales de bricolaje') || n.includes('iluminación de interiores') ||
        n.includes('artículos para animales') || n.includes('ropa de cama') ||
        n.includes('seguridad del hogar') || n.includes('alfombras y moquetas') ||
        n.includes('cortinas') || n.includes('chimeneas y estufas') ||
        n.includes('fontanería') || n.includes('suministros hogar') ||
        n.includes('jardín'))
        return 'home_garden'

    // Default (9% -> 2%)
    return 'default'
}

// ─── Austria ──────────────────────────────────────────────────────────────────
// Complete category list from https://www.ebay.at/sch/allcategories/all-categories
// ATCategoryKey matches lib/profit-engine.ts

function detectATCategory(catName: string): string {
    const n = catName.toLowerCase()

    // Tech devices (6.5%) — computers, phones, TV, consoles, appliances
    if (n.includes('computer, tablets & netzwerk') ||
        n.includes('notebooks & netbooks') || n.includes('desktops & all-in-one') ||
        n.includes('tablets & ebook-reader') || n.includes('handys & smartphones') ||
        n.includes('smartwatches') || n.includes('pc- & videospiele') ||
        n.includes('haushaltsgeräte') || n.includes('kleingeräte küche') ||
        n.includes('kaffee-, tee-') || n.includes('waschmaschinen') ||
        n.includes('gefriergeräte') || n.includes('geschirrspülmaschinen') ||
        n.includes('backöfen & herde') || n.includes('klimaanlagen') ||
        n.includes('foto & camcorder') || n.includes('digitalkameras') ||
        n.includes('camcorder') || n.includes('tv, video & audio') ||
        n.includes('fernseher') || n.includes('heim-audio') ||
        n.includes('virtual reality') || n.includes('smart speakers') ||
        n.includes('konsolen') || n.includes('spielekonsolen'))
        return 'tech_devices'

    // Tech accessories (11%)
    if (n.includes('laufwerke & speichermedien') || n.includes('tastaturen, mäuse') ||
        n.includes('heimnetzwerke') || n.includes('software') ||
        n.includes('notebook- & desktop-zubehör') || n.includes('monitore, projektoren') ||
        n.includes('drucker, scanner') || n.includes('computer-komponenten') ||
        n.includes('tablet & ebook-zubehör') || n.includes('kabel & steckverbinder') ||
        n.includes('3d-drucker') || n.includes('tv- & heim-audio-zubehör') ||
        n.includes('tv- & heim-audio-teile') || n.includes('haushaltsbatterien') ||
        n.includes('kamera, drohnen & fotozubehör') || n.includes('stative & zubehör') ||
        n.includes('blitzgeräte') || n.includes('objektive & filter') ||
        n.includes('ersatzteile & werkzeuge') && n.includes('foto') ||
        n.includes('handy-zubehör') || n.includes('handy-komponenten') ||
        n.includes('smartwatch-zubehör') || n.includes('pda-zubehör'))
        return 'tech_accessories'

    // Auto electronics (6.5%)
    if (n.includes('autoelektronik, gps') ||
        n.includes('auto & motorrad: teile') && n.includes('gps'))
        return 'auto_electronics'

    // Auto tires (6.5%)
    if (n.includes('reifen') || n.includes('felgen') ||
        (n.includes('rad') && n.includes('auto')))
        return 'auto_tires'

    // Auto clothing (11%)
    if (n.includes('kleidung, schutzausrüstung & merchandise'))
        return 'auto_clothing'

    // Auto parts (12%)
    if (n.includes('auto & motorrad: teile') || n.includes('autoteile') ||
        n.includes('motorrad- & rollerteile') || n.includes('autoelektronik') ||
        n.includes('quad-, ssv- & utv-teile') || n.includes('auto-tuning') ||
        n.includes('motorrad-tuning') || n.includes('öl, pflege- & schmiermittel') ||
        n.includes('auto & motorrad: fahrzeuge') || n.includes('automobile') ||
        n.includes('motorräder') || n.includes('nutzfahrzeuge') ||
        n.includes('wohnwagen & wohnmobile'))
        return 'auto_parts'

    // Wristwatches (11%)
    if ((n.includes('uhren, -teile') || n.includes('armbanduhren') ||
        n.includes('uhren & schmuck') && !n.includes('schmuck')) &&
        !n.includes('echtschmuck') && !n.includes('modeschmuck') &&
        !n.includes('juwelierbedarf'))
        return 'wristwatches'

    // Watches & Jewellery (14%)
    if (n.includes('uhren & schmuck') || n.includes('echtschmuck') ||
        n.includes('modeschmuck') || n.includes('herrenschmuck') ||
        n.includes('kinderschmuck') || n.includes('juwelierbedarf') ||
        n.includes('hochzeitsschmuck') || n.includes('lose diamanten') ||
        n.includes('piercing') || n.includes('folkloreschmuck') ||
        n.includes('antik- & vintage-schmuck') || n.includes('schmuck'))
        return 'watches_jewelry'

    // Clothing (12%)
    if (n.includes('kleidung & accessoires') || n.includes('damen') ||
        n.includes('herren') && n.includes('kleid') ||
        n.includes('spezielle anlässe') || n.includes('kinder') && n.includes('kleid') ||
        n.includes('babys') && n.includes('kleid'))
        return 'clothing'

    // Media (9%)
    if (n.includes('bücher & zeitschriften') || n.includes('bücher') ||
        n.includes('zeitschriften') || n.includes('hörbücher') ||
        n.includes('filme & serien') || n.includes('dvds & blu-rays') ||
        n.includes('vhs-kassetten') || n.includes('musik') ||
        n.includes('schallplatten') || n.includes('musikkassetten') ||
        n.includes('briefmarken') || n.includes('tickets') ||
        n.includes('festivals & konzerte') || n.includes('musicals'))
        return 'media'

    // Musical instruments (11%)
    if (n.includes('musikinstrumente') || n.includes('gitarren & bässe') ||
        n.includes('tasteninstrumente') || n.includes('drums & percussion') ||
        n.includes('holzblasinstrumente') || n.includes('blechblasinstrumente') ||
        n.includes('noten & songbooks') || n.includes('streich-') ||
        n.includes('pro-audio equipment'))
        return 'musical_instruments'

    // Garden & DIY (12%)
    if (n.includes('garten & terrasse') || n.includes('heimwerker') ||
        n.includes('werkzeuge') || n.includes('bad & küche') ||
        n.includes('baustoffe & holz') || n.includes('heizen, klima & sanitär') ||
        n.includes('farben, tapeten') || n.includes('fenster, türen') ||
        n.includes('bodenbeläge') || n.includes('elektromaterial') ||
        n.includes('möbel & wohnen') || n.includes('dekoration') ||
        n.includes('bettwaren') || n.includes('teppiche') ||
        n.includes('küche') || n.includes('badezimmer') ||
        n.includes('haushalt') || n.includes('kochen & genießen') ||
        n.includes('kerzen & düfte'))
        return 'garden_diy'

    // Business & Industrial (11%)
    if (n.includes('business & industrie') || n.includes('metallbearbeitung') ||
        n.includes('elektronik & messtechnik') || n.includes('automation') ||
        n.includes('transport & logistik') || n.includes('hydraulik') ||
        n.includes('werkzeuge & werkstattbedarf') || n.includes('gastro') ||
        n.includes('agrar') || n.includes('medizin & labor') ||
        n.includes('ladenausstattung') || n.includes('sicherheit & gebäude') ||
        n.includes('großhandel') || n.includes('kunststoffindustrie') ||
        n.includes('hlkk') || n.includes('büro & schreibwaren') ||
        n.includes('büromöbel') || n.includes('präsentationsbedarf'))
        return 'business_industrial'

    // NFTs (5%)
    if (n.includes('nft') || n.includes('aufkommende nfts') ||
        n.includes('film nfts') || n.includes('musik nfts'))
        return 'nfts'

    // Default (11%) — sports, beauty, baby, pets, food, collectibles,
    // art/antiques, toys, crafts, travel, coins, gaming accessories
    return 'default'
}

// ─── Ireland ──────────────────────────────────────────────────────────────────
// Complete category list from https://www.ebay.ie/sch/allcategories/all-categories
// IECategoryKey matches lib/profit-engine.ts

function detectIECategory(catName: string): string {
    const n = catName.toLowerCase()

    // Tech core (6.5%) — computers, phones, cameras, consoles, sound & vision
    if (n.includes('computers/tablets & networking') ||
        n.includes('laptops & netbooks') || n.includes('desktops & all-in-ones') ||
        n.includes('tablets & ebook readers') || n.includes('mobile phones & communication') ||
        n.includes('mobile & smart phones') || n.includes('smart watches') ||
        n.includes('video games & consoles') || n.includes('video game consoles') ||
        n.includes('sound & vision') || n.includes('home audio & hifi') ||
        n.includes('televisions') || n.includes('cameras & photography') ||
        n.includes('digital cameras') || n.includes('camcorders') ||
        n.includes('camera drones') || n.includes('virtual reality') ||
        n.includes('smart glasses') || n.includes('portable audio & headphones'))
        return 'tech_core'

    // Tech appliances (11%) — appliances, electric personal care
    if (n.includes('appliances') || n.includes('heating, cooling & air') ||
        n.includes('shaving & hair removal') || n.includes('hair care & styling') ||
        n.includes('oral care') || n.includes('fireplaces & stoves'))
        return 'tech_appliances'

    // Tech accessories (6.5%) — cables, peripherals, phone/camera/laptop accessories
    if (n.includes('drives, storage & blank media') ||
        n.includes('keyboards, mice & pointers') ||
        n.includes('home networking & connectivity') || n.includes('software') ||
        n.includes('laptop & desktop accessories') ||
        n.includes('monitors, projectors') || n.includes('printers, scanners') ||
        n.includes('computer components & parts') ||
        n.includes('tablet & ebook reader accs') ||
        n.includes('computer cables & connectors') || n.includes('3d printers') ||
        n.includes('tv & home audio accessories') || n.includes('tv & home audio parts') ||
        n.includes('multipurpose batteries') || n.includes('dvd, blu-ray & home cinema') ||
        n.includes('camera, drone & photo accessories') ||
        n.includes('lenses & filters') || n.includes('flashes & accessories') ||
        n.includes('tripods & supports') || n.includes('replacement parts & tools') &&
        n.includes('camera') ||
        n.includes('mobile phone accessories') || n.includes('mobile phone parts') ||
        n.includes('smart watch accessories') || n.includes('phone cards & sim'))
        return 'tech_accessories'

    // Auto electronics (11%)
    if (n.includes('in-car technology, gps & security'))
        return 'auto_electronics'

    // Auto tires / parts (6.5%)
    if (n.includes('vehicle parts & accessories') ||
        n.includes('car parts & accessories') ||
        n.includes('motorcycle & scooter parts') ||
        n.includes('garage equipment & tools') ||
        n.includes('oils, fluids & lubricants') ||
        n.includes('motorcycle tuning') || n.includes('car tuning') ||
        n.includes('trials & motocross') || n.includes('boats parts') ||
        n.includes('caravan') && n.includes('parts') ||
        n.includes('tyres') || n.includes('wheels') && n.includes('car'))
        return 'auto_tires'

    // Jewellery & Watches combined (11%)
    if (n.includes('jewellery & watches') || n.includes('fine jewellery') ||
        n.includes("men's jewellery") || n.includes('costume jewellery') ||
        n.includes("children's jewellery") || n.includes('engagement & wedding') ||
        n.includes('handcrafted & artisan jewellery') ||
        n.includes('jewellery care') || n.includes('watches, parts & accessories') ||
        n.includes('body jewellery') || n.includes('loose beads') ||
        n.includes('loose diamonds & gemstones') ||
        n.includes('vintage & antique jewellery') ||
        n.includes('ethnic, regional & tribal') ||
        n.includes('jewellery') || n.includes('watches'))
        return 'jewellery_watches'

    // Musical instruments (11%)
    if (n.includes('musical instruments & dj equipment') ||
        n.includes('guitars & basses') || n.includes('wind & woodwind') ||
        n.includes('brass') || n.includes('dj equipment') ||
        n.includes('pianos, keyboards & organs') || n.includes('percussion') ||
        n.includes('pro audio equipment') || n.includes('sheet music') ||
        n.includes('string') && n.includes('instrument') ||
        n.includes('vintage musical instruments'))
        return 'musical_instruments'

    // Home & Garden (11%)
    if (n.includes('home, furniture & diy') || n.includes('garden & patio') ||
        n.includes('diy tools & workshop equipment') || n.includes('diy materials') ||
        n.includes('furniture') || n.includes('home décor') ||
        n.includes('bedding') || n.includes('rugs & carpets') ||
        n.includes('plumbing & fixtures') || n.includes('cookware, dining & bar') ||
        n.includes('lighting') || n.includes('bath') ||
        n.includes('home security') || n.includes('storage solutions') ||
        n.includes('curtains, blinds') || n.includes('kitchen') ||
        n.includes('candles & home fragrance') || n.includes('clocks') &&
        !n.includes('collectab') ||
        n.includes('garden & patio furniture') || n.includes('lawn mowers') ||
        n.includes('swimming pools') || n.includes('plants, seeds & bulbs') ||
        n.includes('garden power tools') || n.includes('outdoor heating'))
        return 'home_garden'

    // NFTs (5%)
    if (n.includes('nft') || n.includes('emerging nfts') ||
        n.includes('art nfts') || n.includes('film nfts') ||
        n.includes('music nfts'))
        return 'nfts'

    // Default (11%) — clothing, sports, beauty, baby, pets, books, music,
    // films, stamps, coins, collectibles, antiques, art, crafts, travel,
    // business/industrial, wholesale
    return 'default'
}

// ─── Poland ───────────────────────────────────────────────────────────────────
// Complete category list from https://www.ebay.pl/sch/allcategories/all-categories
// PLCategoryKey matches lib/profit-engine.ts

function detectPLCategory(catName: string): string {
    const n = catName.toLowerCase()

    // Tech core (6.5%) — TV, computers, cameras, phones, consoles
    if (n.includes('komputery i tablety') || n.includes('laptopy i netbooki') ||
        n.includes('komputery stacjonarne') || n.includes('tablety i czytniki') ||
        n.includes('telefony i akcesoria') || n.includes('telefony komórkowe i smartfony') ||
        n.includes('smartwatche') || n.includes('gry i konsole') || n.includes('konsole') ||
        n.includes('tv, audio i video') || n.includes('telewizory') ||
        n.includes('fotografia i kamery') || n.includes('aparaty cyfrowe') ||
        n.includes('kamery') || n.includes('drony z kamerami') ||
        n.includes('elektronika') || n.includes('rzeczywistość wirtualna') ||
        n.includes('okulary smart glasses') || n.includes('monitory, projektory'))
        return 'tech_core'

    // Tech appliances (11%) — AGD, electric grooming
    if (n.includes('sprzęt agd') || n.includes('drobne agd') ||
        n.includes('pralki i suszarki') || n.includes('lodówki i zamrażarki') ||
        n.includes('piekarniki i kuchenki') || n.includes('zmywarki') ||
        n.includes('klimatyzacja i ogrzewanie') || n.includes('odkurzacze') ||
        n.includes('urządzenia do kawy') || n.includes('depilacja i golenie') ||
        n.includes('pielęgnacja i stylizacja włosów'))
        return 'tech_appliances'

    // Tech accessories (6.5%)
    if (n.includes('dyski i napędy') || n.includes('klawiatury, myszy') ||
        n.includes('sieci domowe') || n.includes('oprogramowanie') ||
        n.includes('akcesoria do laptopów') || n.includes('akcesoria do tabletów') ||
        n.includes('drukarki, skanery') || n.includes('części i podzespoły') ||
        n.includes('przewody i złącza') || n.includes('drukarki 3d') ||
        n.includes('akcesoria do sprzętu audio') || n.includes('akcesoria do aparatów') ||
        n.includes('obiektywy i filtry') || n.includes('statywy i akcesoria') ||
        n.includes('lampy błyskowe') || n.includes('akcesoria do telefonów komórkowych') ||
        n.includes('części do telefonów') || n.includes('akcesoria do smartwatchy') ||
        n.includes('sieci firmowe i serwery') || n.includes('zasilanie awaryjne'))
        return 'tech_accessories'

    // Auto electronics (11%)
    if (n.includes('elektronika samochodowa, gps') ||
        n.includes('elektronika samochodowa'))
        return 'auto_electronics'

    // Auto tires (6.5%)
    if (n.includes('opony') || n.includes('felgi') ||
        (n.includes('koła') && n.includes('samochodow')))
        return 'auto_tires'

    // Jewellery & Watches (11%)
    if (n.includes('biżuteria i zegarki') || n.includes('szlachetna biżuteria') ||
        n.includes('biżuteria dla mężczyzn') || n.includes('sztuczna biżuteria') ||
        n.includes('biżuteria dla dzieci') || n.includes('biżuteria ślubna') ||
        n.includes('wyroby jubilerskie') || n.includes('wyposażenie dla jubilerów') ||
        n.includes('zegarki, części i akcesoria') || n.includes('ozdoby do ciała') ||
        n.includes('sztuczne perły') || n.includes('biżuteria etniczna') ||
        n.includes('diamenty i kamienie') || n.includes('biżuteria antyczna') ||
        n.includes('biżuteria'))
        return 'jewellery_watches'

    // Musical instruments (11%)
    if (n.includes('instrumenty muzyczne') || n.includes('gitary i basy') ||
        n.includes('instrumenty klawiszowe') || n.includes('instrumenty perkusyjne') ||
        n.includes('instrumenty dęte') || n.includes('sprzęt pro-audio') ||
        n.includes('nuty i śpiewniki') || n.includes('instrumenty smyczkowe') ||
        n.includes('instrumenty muzyczne vintage'))
        return 'musical_instruments'

    // Home & Garden (11%)
    if (n.includes('ogród i taras') || n.includes('dom i meble') ||
        n.includes('meble') || n.includes('dekoracje') ||
        n.includes('pościele i materace') || n.includes('dywany') ||
        n.includes('gotowanie i jedzenie') || n.includes('łazienki') ||
        n.includes('wyposażenie domu') || n.includes('rolety, firany') ||
        n.includes('kuchnia') || n.includes('świece i zapachy') ||
        n.includes('majsterkowanie') || n.includes('narzędzia') ||
        n.includes('materiały budowlane') || n.includes('ogrzewanie, klimatyzacja') ||
        n.includes('farby, tapety') || n.includes('okna, drzwi') ||
        n.includes('posadzki i płytki') || n.includes('artykuły elektryczne') ||
        n.includes('kosiarki') || n.includes('nawadnianie') ||
        n.includes('rośliny, nasiona') || n.includes('grille') ||
        n.includes('ogrodzenia') || n.includes('hydroponika'))
        return 'home_garden'

    // Default (11%) — clothing, sports, beauty, baby, pets, books, music,
    // films, stamps, coins, collectibles, art, toys, crafts, business, food, travel
    return 'default'
}

// ─── Belgium ──────────────────────────────────────────────────────────────────
// Complete category list from https://www.befr.ebay.be (French) + benl.ebay.be (Dutch)
// BE reuses IECategoryKey — identical fee structure to IE (21% Belgian VAT applied separately)

function detectBECategory(catName: string): string {
    const n = catName.toLowerCase()

    // Tech core (6.5%) — computers, phones, cameras, consoles, TV, sound
    if (n.includes('informatique, réseaux') || n.includes('informatique') ||
        n.includes('portables, netbooks') || n.includes('tablettes, liseuses') ||
        n.includes('pc de bureau') || n.includes('téléphonie, mobilité') ||
        n.includes('téléphones mobiles') || n.includes('montres connectées') ||
        n.includes('jeux vidéo, consoles') || n.includes('consoles') ||
        n.includes('image, son') || n.includes('télévisions') ||
        n.includes('hi-fi, son') || n.includes('enceintes portables') ||
        n.includes('photo, caméscopes') || n.includes('appareils photo numériques') ||
        n.includes('caméscopes') || n.includes('drones, fpv') ||
        n.includes('réalité virtuelle') || n.includes('maison intelligente') ||
        n.includes('lunettes connectées'))
        return 'tech_core'

    // Tech appliances (11%) — electric grooming + appliances
    if (n.includes('électroménager') || n.includes('machines à café') ||
        n.includes('réfrigérateurs') || n.includes('lave-linges') ||
        n.includes('lave-vaisselles') || n.includes('chauffage, clim') ||
        n.includes('nettoyage, repassage') || n.includes('appareils de cuisson') ||
        n.includes('épilation et rasage') || n.includes('soins cheveux et coiffure'))
        return 'tech_appliances'

    // Tech accessories (6.5%) — cables, peripherals, camera/phone accessories
    if (n.includes('supports vierges, disques durs') || n.includes('claviers, souris') ||
        n.includes('réseau, connectivité') || n.includes('logiciels') ||
        n.includes('accessoires ordinateur') || n.includes('bureautique') ||
        n.includes('ecrans, projecteurs') || n.includes('imprimantes, scanners') ||
        n.includes('ordinateur: composants') || n.includes('câbles, connecteurs') ||
        n.includes('tablettes, liseuses: accessoires') || n.includes('impression 3d') ||
        n.includes('accessoires image, son') || n.includes('composants: tv, son') ||
        n.includes('piles, alimentation') || n.includes('accessoires: photo') ||
        n.includes('objectifs, filtres') || n.includes('flashes, accessoires') &&
        n.includes('photo') ||
        n.includes('trépieds, supports') || n.includes('pièces, outils') &&
        n.includes('photo') ||
        n.includes('tél. mobiles: accessoires') || n.includes('montres connectées: access'))
        return 'tech_accessories'

    // Auto electronics (11%)
    if (n.includes('autoradios, hi-fi, vidéo, gps') ||
        n.includes('electronique, gps, télécoms') && n.includes('bateau'))
        return 'auto_electronics'

    // Auto tires / parts (6.5%)
    if (n.includes('auto, moto - pièces, accessoires') ||
        n.includes('automobile : pièces') || n.includes('moto : pièces') ||
        n.includes('équipements, outils de garage') ||
        n.includes('huiles, lubrifiants, liquides') ||
        n.includes('moto: accessoires') || n.includes('tuning, styling') ||
        n.includes('moto : tuning') || n.includes('scooter : pièces') ||
        n.includes('quad, trike : pièces') || n.includes('casques, vêtements') &&
        n.includes('moto') ||
        n.includes('pneus, chambres à air') ||
        n.includes('auto, moto - véhicules') || n.includes('bateaux, voile'))
        return 'auto_tires'

    // Jewellery & Watches combined (11%)
    if (n.includes('bijoux, montres') || n.includes('joaillerie') ||
        n.includes('bijoux fantaisie') || n.includes('bijoux pour hommes') ||
        n.includes('pierres précieuses') || n.includes('bijoux de corps') ||
        n.includes('perles au détail') || n.includes('montres, pièces et accessoires') ||
        n.includes('boîtes à bijoux') || n.includes('bijoux') ||
        n.includes('montres'))
        return 'jewellery_watches'

    // Musical instruments (11%)
    if (n.includes('instruments de musique') || n.includes('guitares, basses') ||
        n.includes('instruments à vent') || n.includes('pianos, claviers') ||
        n.includes('batteries, percussions') || n.includes('equipement audio professionnel') ||
        n.includes('partitions') || n.includes('instruments à cordes') ||
        n.includes('instruments de musique vintage'))
        return 'musical_instruments'

    // Home & Garden (11%)
    if (n.includes('maison') || n.includes('bricolage') ||
        n.includes('jardin, terrasse') || n.includes('meubles') ||
        n.includes("décoration d'intérieur") || n.includes('literie') ||
        n.includes('tapis et moquettes') || n.includes('cuisine, arts de la table') ||
        n.includes('éclairage intérieur') || n.includes('salle de bain') ||
        n.includes('cheminées et poêles') || n.includes('solutions de rangement') ||
        n.includes('rideaux') || n.includes('horloges') ||
        n.includes('plomberie') || n.includes('électricité') && n.includes('bric') ||
        n.includes('peintures, vernis') || n.includes('bois d') ||
        n.includes('jardin') || n.includes('meubles de jardin') ||
        n.includes('piscines') || n.includes('tondeuses') ||
        n.includes('plantes, graines') || n.includes('barbecues'))
        return 'home_garden'

    // NFTs (5%)
    if (n.includes('nft') || n.includes('collection numériques, crypto') ||
        n.includes('monnaie virtuelle'))
        return 'nfts'

    // Default (11%) — clothing, sports, beauty, baby, pets, books, music,
    // films, stamps, coins, collectibles, antiques, art, crafts, food, B2B
    return 'default'
}

// ─── Netherlands ─────────────────────────────────────────────────────────────
// Complete category list from https://www.ebay.nl/sch/allcategories/all-categories
// NL reuses IECategoryKey — identical fee structure to IE/BE (21% Dutch VAT applied separately)

function detectNLCategory(catName: string): string {
    const n = catName.toLowerCase()

    // Tech core (6.5%) — computers, phones, cameras, consoles, TV, sound
    if (n.includes('informatica en netwerken') || n.includes('laptops, netbooks') ||
        n.includes('desktops, alles-in-een') || n.includes('tablets en e-readers') ||
        n.includes('telefonie en communicatie') || n.includes('mobiele telefoons') ||
        n.includes('smartwatches') || n.includes('videospellen, consoles') ||
        n.includes('consoles') || n.includes('beeld en geluid') ||
        n.includes('televisies') || n.includes('hifi, geluid') ||
        n.includes('draagbare luidsprekers') || n.includes('foto en camera') ||
        n.includes("digitale camera's") || n.includes('camcorders') ||
        n.includes('drones, fpv') || n.includes('virtual reality') ||
        n.includes('smart home') || n.includes('internetbrillen'))
        return 'tech_core'

    // Tech appliances (11%) — appliances, electric grooming
    if (n.includes('huishoudapparaten') || n.includes('koffie-, espresso-') ||
        n.includes('wasmachines en droogkasten') || n.includes('kooktoestellen') ||
        n.includes('koelkasten en diepvriezers') || n.includes('vaatwassers') ||
        n.includes('verwarming, airco') || n.includes('reiniging, strijken') ||
        n.includes('epilleren en scheren') || n.includes('haarverzorging en kapsels'))
        return 'tech_appliances'

    // Tech accessories (6.5%) — cables, peripherals, camera/phone accessories
    if (n.includes('lege media, harde schijven') || n.includes('toetsenborden en muizen') ||
        n.includes('netwerk, thuisverbinding') || n.includes('software') ||
        n.includes('computeraccessoires') || n.includes('schermen en projectoren') ||
        n.includes('printers, scanners') || n.includes('computer: onderdelen') ||
        n.includes('tablets, e-readers: accessoires') || n.includes('kabels, connectors') ||
        n.includes('3d-digitizers') || n.includes('beeld- en geluidaccessoires') ||
        n.includes('beeld- en geluidonderdelen') || n.includes('batterijen en voeding') ||
        n.includes('dvd, blu-ray, thuisbioscoop') ||
        n.includes('accessoires: foto, camcorder') || n.includes('lenzen, filters') ||
        n.includes('flitsers, accessoires') && n.includes('foto') ||
        n.includes('driepoten, standaarden') ||
        n.includes('onderdelen, gereedschap') && n.includes('foto') ||
        n.includes('mobiele telefoons: accessoires') ||
        n.includes('smartwatches: accessoires'))
        return 'tech_accessories'

    // Auto electronics (11%)
    if (n.includes("autoradio's, hifi, video, gps") ||
        n.includes('navigatie en communicatie') && n.includes('boot'))
        return 'auto_electronics'

    // Auto tires / parts (6.5%)
    if (n.includes("auto's en motoren: onderdelen") ||
        n.includes('auto: onderdelen en accessoires') ||
        n.includes('motor: reserveonderdelen') ||
        n.includes('garagegereedschap') ||
        n.includes('olie en smeermiddelen') ||
        n.includes('motor: tuning') || n.includes('tuning en styling') ||
        n.includes('scooters: onderdelen') ||
        n.includes('helmen en kleding') && n.includes('motor') ||
        n.includes('banden en binnenbanden') ||
        n.includes("auto's, motoren en voertuigen") ||
        n.includes('boten en watersport'))
        return 'auto_tires'

    // Jewellery & Watches combined (11%)
    if (n.includes('sieraden en horloges') || n.includes('juwelen') ||
        n.includes('modesieraden') || n.includes('herensieraden') ||
        n.includes('edelstenen') || n.includes('lichaamssieraden') ||
        n.includes('losse kralen') || n.includes('horloges, onderdelen') ||
        n.includes('sieradenkistjes') || n.includes('sieraden') ||
        n.includes('horloges'))
        return 'jewellery_watches'

    // Musical instruments (11%)
    if (n.includes('muziekinstrumenten') || n.includes('gitaren, bassen') ||
        n.includes('blaasinstrumenten') || n.includes("piano's en keyboards") ||
        n.includes('drums en percussie') || n.includes('professionele audioapparatuur') ||
        n.includes('partituren en liedboeken') || n.includes('snaarinstrumenten') ||
        n.includes('vintage muziekinstrumenten'))
        return 'musical_instruments'

    // Home & Garden (11%)
    if (n.includes('huis') || n.includes('doe-het-zelf') ||
        n.includes('tuin en terras') || n.includes('meubels') ||
        n.includes('interieurinrichting') || n.includes('beddengoed, bedlinnen') ||
        n.includes('tapijten en vloerkleden') || n.includes('koken en tafelen') ||
        n.includes('badkamer') || n.includes('open haarden en kachels') ||
        n.includes('opbergsystemen') || n.includes('gordijnen') ||
        n.includes('klokken') && !n.includes('verzamel') ||
        n.includes('sanitair') || n.includes('elektriciteit') && n.includes('doe-het') ||
        n.includes('verf, lak') || n.includes('timmerhout') ||
        n.includes('tuin- en terrasmeubels') || n.includes('zwembaden') ||
        n.includes('grasmaaiers') || n.includes('planten, zaden') ||
        n.includes('barbecues en buitenverwarming'))
        return 'home_garden'

    // NFTs (5%)
    if (n.includes('nft') || n.includes('numerieke verzamelingen, crypto') ||
        n.includes('virtueel geld'))
        return 'nfts'

    // Default (11%) — clothing, sports, beauty, baby, pets, books, music,
    // films, stamps, coins, collectibles, antiques, art, crafts, food, B2B
    return 'default'
}

// ─── Switzerland ─────────────────────────────────────────────────────────────
// Complete category list from https://www.ebay.ch/sch/allcategories/all-categories
// CHCategoryKey matches lib/profit-engine.ts (CHF thresholds, unique structure)

function detectCHCategory(catName: string): string {
    const n = catName.toLowerCase()

    // Tech core (6.5% up to CHF 300 → 2%) — computers, phones, cameras, consoles, TV
    if (n.includes('computer, tablets & netzwerk') ||
        n.includes('notebooks & netbooks') || n.includes('desktops & all-in-one') ||
        n.includes('tablets & ebook-reader') || n.includes('handys & smartphones') ||
        n.includes('handys & kommunikation') || n.includes('smartwatches') &&
        !n.includes('zubehör') ||
        n.includes('pc- & videospiele') || n.includes('konsolen') ||
        n.includes('tv, video & audio') || n.includes('fernseher') ||
        n.includes('heim-audio & hifi') || n.includes('tragbare geräte & kopfhörer') ||
        n.includes('foto & camcorder') || n.includes('digitalkameras') ||
        n.includes('camcorder') || n.includes('kamera-drohnen') ||
        n.includes('virtual reality') || n.includes('smart speakers') ||
        n.includes('smart glasses'))
        return 'tech_core'

    // Tech appliances (11% up to CHF 300 → 2%) — appliances, electric grooming
    if (n.includes('haushaltsgeräte') || n.includes('kleingeräte küche') ||
        n.includes('kaffee-, tee- & espressomaschinen') ||
        n.includes('waschmaschinen & trockner') || n.includes('backöfen & herde') ||
        n.includes('klimaanlagen & heizgeräte') ||
        n.includes('gefriergeräte & kühlschränke') ||
        n.includes('geschirrspülmaschinen') || n.includes('staubsauger') ||
        n.includes('enthaarung & rasur') ||
        n.includes('haarpflege & haarstyling'))
        return 'tech_appliances'

    // Tech accessories (6.5% up to CHF 200 → 2%) — cables, peripherals, accessories
    if (n.includes('laufwerke & speichermedien') ||
        n.includes('tastaturen, mäuse & pointing') ||
        n.includes('heimnetzwerke & zubehör') || n.includes('software') ||
        n.includes('notebook- & desktop-zubehör') ||
        n.includes('monitore, projektoren & zubehör') ||
        n.includes('drucker, scanner & zubehör') ||
        n.includes('computer-komponenten & -teile') ||
        n.includes('tablet & ebook-zubehör') ||
        n.includes('kabel & steckverbinder') || n.includes('3d-drucker') ||
        n.includes('tv- & heim-audio-zubehör') || n.includes('tv- & heim-audio-teile') ||
        n.includes('haushaltsbatterien & strom') ||
        n.includes('kamera, drohnen & fotozubehör') ||
        n.includes('stative & zubehör') || n.includes('blitzgeräte & zubehör') ||
        n.includes('objektive & filter') || n.includes('ersatzteile & werkzeuge') &&
        n.includes('foto') ||
        n.includes('handy-zubehör') || n.includes('handy-komponenten') ||
        n.includes('smartwatch-zubehör') || n.includes('pda-zubehör'))
        return 'tech_accessories'

    // Auto electronics (11% up to CHF 300 → 2%)
    if (n.includes('autoelektronik, gps & sicherheitstechnik'))
        return 'auto_electronics'

    // Auto tires / parts (6.5% up to CHF 990 → 2%)
    if (n.includes('auto & motorrad: teile') || n.includes('autoteile & zubehör') ||
        n.includes('motorrad- & rollerteile') ||
        n.includes('kleidung, schutzausrüstung & merchandise') ||
        n.includes('öl, pflege- & schmiermittel') ||
        n.includes('auto-tuning & -styling') || n.includes('motorrad-tuning') ||
        n.includes('quad-, ssv- & utv-teile') ||
        n.includes('auto & motorrad: fahrzeuge') || n.includes('automobile') ||
        n.includes('motorräder') || n.includes('wohnwagen & wohnmobile') ||
        n.includes('nutzfahrzeuge'))
        return 'auto_tires'

    // Watches & Jewellery (11% up to CHF 400 → 2%)
    if (n.includes('uhren & schmuck') || n.includes('uhren, -teile & -zubehör') ||
        n.includes('echtschmuck') || n.includes('modeschmuck') ||
        n.includes('herrenschmuck') || n.includes('kinderschmuck') ||
        n.includes('juwelierbedarf') || n.includes('hochzeitsschmuck') ||
        n.includes('lose diamanten') || n.includes('piercing') ||
        n.includes('folkloreschmuck') || n.includes('antik- & vintage-schmuck') ||
        n.includes('schmuck'))
        return 'watches_jewelry'

    // Musical instruments (11% up to CHF 300 → 2%)
    if (n.includes('musikinstrumente') || n.includes('gitarren & bässe') ||
        n.includes('holzblasinstrumente') || n.includes('blechblasinstrumente') ||
        n.includes('tasteninstrumente') || n.includes('drums & percussion') ||
        n.includes('pro-audio equipment') || n.includes('noten & songbooks') ||
        n.includes('streich- & zupfinstrumente') ||
        n.includes('vintage musikinstrumente'))
        return 'musical_instruments'

    // Home & Garden (11% up to CHF 200 → 2%)
    if (n.includes('möbel & wohnen') || n.includes('heimwerker') ||
        n.includes('garten & terrasse') || n.includes('dekoration') ||
        n.includes('bettwaren, -wäsche') || n.includes('teppiche') ||
        n.includes('kochen & genießen') || n.includes('badezimmer') ||
        n.includes('küche') || n.includes('kerzen & düfte') ||
        n.includes('rollos, gardinen') || n.includes('haushalt') ||
        n.includes('werkzeuge') && n.includes('heim') ||
        n.includes('bad & küche') || n.includes('baustoffe & holz') ||
        n.includes('heizen, klima & sanitär') ||
        n.includes('farben, tapeten') || n.includes('fenster, türen') ||
        n.includes('bodenbeläge') || n.includes('elektromaterial') ||
        n.includes('rasenmäher') || n.includes('pflanzen, sämereien') ||
        n.includes('grills, heizstrahler'))
        return 'home_garden'

    // NFTs (5% flat)
    if (n.includes('nft') || n.includes('aufkommende nfts') ||
        n.includes('film nfts') || n.includes('musik nfts') ||
        n.includes('virtuelle währungen'))
        return 'nfts'

    // Default (11% up to CHF 990 → 2%) — clothing, sports, beauty, baby, pets,
    // books, music, films, stamps, coins, collectibles, antiques, crafts, food, B2B
    return 'default'
}

// ─── Australia ────────────────────────────────────────────────────────────────
// Complete category list from https://www.ebay.com.au/sch/allcategories/all-categories
// AUCategoryTier 1-4 matches lib/profit-engine.ts AU_FVF_TABLE

function detectAUCategory(catName: string): string {
    const n = catName.toLowerCase()

    // Tier 1 — Home Appliances & Technology Devices
    // Phones, computers, tablets, cameras, consoles, TV, smart home, appliances
    if (n.includes('phones & accessories') || n.includes('mobile phones') ||
        n.includes('smart watches') || n.includes('computers/tablets') ||
        n.includes('laptops & netbooks') || n.includes('desktop') ||
        n.includes('tablets & ereaders') || n.includes('home entertainment') ||
        n.includes('video games & consoles') || n.includes('video game consoles') ||
        n.includes('cameras') || n.includes('digital cameras') ||
        n.includes('home audio systems') || n.includes('tvs') ||
        n.includes('smart home & surveillance') || n.includes('home appliances') ||
        n.includes('small kitchen appliances') || n.includes('refrigerators') ||
        n.includes('coffee, tea & espresso') || n.includes('home heating, cooling') ||
        n.includes('ranges & cooking appliances') || n.includes('portable audio') ||
        n.includes('electronics'))
        return '1'

    // Tier 3 — Vehicle Parts & Accessories
    if (n.includes('vehicle parts & accessories') ||
        n.includes('car & truck parts') || n.includes('motorcycle & scooter parts') ||
        n.includes('vehicle electronics & gps') || n.includes('auto performance parts') ||
        n.includes('automotive tools & supplies') || n.includes('boat parts') ||
        n.includes('cars, bikes, boats') || n.includes('cars') && n.includes('motor') ||
        n.includes('motorcycles') || n.includes('caravans & motorhomes') ||
        n.includes('car, bike & boat trailers'))
        return '3'

    // Tier 4 — Business & Industrial, Collectables, Fashion, Media,
    //           Sporting Goods, Tech Accessories
    if (n.includes('business & industrial') || n.includes('industrial') ||
        n.includes('restaurant & food service') || n.includes('office equipment') ||
        n.includes('collectables & art') || n.includes('collectables') ||
        n.includes('antiques') || n.includes('coins') || n.includes('stamps') ||
        n.includes('art') || n.includes('vintage & antique jewellery') ||
        n.includes('collectable card games') || n.includes('non-sport trading cards') ||
        n.includes('clothing, shoes & accessories') || n.includes("women's clothing") ||
        n.includes("men's clothing") || n.includes('costumes') ||
        n.includes('wristwatches') || n.includes('luggage') ||
        n.includes('sporting goods') || n.includes('cycling') ||
        n.includes('sports trading cards') || n.includes('golf') ||
        n.includes('fishing') || n.includes('fitness, running') ||
        n.includes('camping & hiking') || n.includes('cricket') ||
        n.includes('snow sports') || n.includes('hunting') ||
        n.includes('afl, rugby') || n.includes('soccer') ||
        n.includes('boating, water sports') || n.includes('boxing, martial arts') ||
        n.includes('skateboarding') || n.includes('scooters') || n.includes('tennis') ||
        n.includes('surfing') || n.includes('archery') || n.includes('horse riding') ||
        n.includes('books, music & movies') || n.includes('books, comics') ||
        n.includes('movies & tv') || n.includes('musical instruments') ||
        n.includes('music') || n.includes('vinyl records') ||
        n.includes('computer drives, storage') || n.includes('tablet & ereader accessories') ||
        n.includes('computer components & parts') || n.includes('video game accessories') ||
        n.includes('camera, drone & photo accessories') || n.includes('camera lenses') ||
        n.includes('television accessories') || n.includes('batteries & chargers') ||
        n.includes('dvd, blu-ray & home cinema equipment') ||
        n.includes('mobile phone accessories') || n.includes('mobile phone parts') ||
        n.includes('smart watch accessories'))
        return '4'

    // NFTs (5.5% flat — Tier 5)
    if (n.includes('nft') || n.includes('non-fungible'))
        return '5'

    // Tier 2 — All other categories (default)
    // Home & Garden, Health & Beauty, Baby, Toys, Jewellery & Watches,
    // Pets, Food, Travel, Real Estate, Services
    return '2'
}

// ─── United States ────────────────────────────────────────────────────────────
// Complete category list from https://www.ebay.com/sch/allcategories/all-categories
// USCategoryKey matches lib/profit-engine.ts US_TIERED_FEES

function detectUSCategoryFull(catName: string): string {
    const n = catName.toLowerCase()

    // NFTs (0%)
    if (n.includes('nft') || n.includes('music nfts') || n.includes('film nfts') ||
        n.includes('art nfts') || n.includes('virtual currency'))
        return 'nfts'

    // Coins & Bullion (specific rates)
    if (n.includes('bullion'))
        return 'coins_bullion'
    if (n.includes('coins & paper money') || n.includes('world coins') ||
        n.includes('us coins') || n.includes('us paper money') ||
        n.includes('world paper money') || n.includes('ancient coins') ||
        n.includes('exonumia') || n.includes('coin &'))
        return 'coins'

    // Watches (specific rates)
    if (n.includes('watches, parts & accessories') || n.includes('watches') &&
        !n.includes('jewelry') && !n.includes('smart watch') &&
        !n.includes('smartwatch') && !n.includes('ring'))
        return 'watches'

    // Handbags (specific rates)
    if (n.includes("women's bags & handbags") || n.includes('handbags') ||
        (n.includes('bags') && n.includes('women')))
        return 'handbags'

    // Jewelry (specific rates)
    if (n.includes('fine jewelry') || n.includes('fashion jewelry') ||
        n.includes("men's jewelry") || n.includes("children's jewelry") ||
        n.includes('loose diamonds & gemstones') || n.includes('engagement & wedding') ||
        n.includes('handcrafted & artisan jewelry') || n.includes('body jewelry') ||
        n.includes('loose beads') || n.includes('jewelry mixed lots') ||
        n.includes('jewelry care') || n.includes('ethnic, regional & tribal') &&
        n.includes('jewelry') ||
        n.includes('jewelry & watches') || n.includes('vintage & antique jewelry'))
        return 'jewelry'

    // Guitars (specific rates)
    if (n.includes('guitars & basses') || n.includes('guitars'))
        return 'guitars'

    // Athletic Shoes (specific rates)
    if ((n.includes('athletic') || n.includes('sneaker') || n.includes('running')) &&
        n.includes('shoe'))
        return 'athletic_shoes'

    // Heavy Equipment (specific rates)
    if (n.includes('heavy equipment, parts & attachments') ||
        n.includes('heavy equipment') || n.includes('industrial mini excavators') ||
        n.includes('modular & prefabricated buildings'))
        return 'heavy_equipment'

    // Books, Movies & Music (specific rates)
    if (n.includes('books & magazines') || n.includes('books, movies & music') ||
        n.includes('vinyl records') || n.includes('music cds') ||
        n.includes('music cassettes') || n.includes('dvds & blu-ray') ||
        n.includes('movies & tv') || n.includes('vhs tapes') ||
        n.includes('dvds') || n.includes('blu-ray discs') ||
        n.includes('music') && !n.includes('musical instrument') &&
        !n.includes('music memorabilia') && !n.includes('music nft'))
        return 'books_movies_music'

    // Collectibles & Trading Cards (specific rates)
    if (n.includes('sports mem, cards & fan shop') ||
        n.includes('sports trading cards') || n.includes('collectible card games') ||
        n.includes('non-sport trading cards') || n.includes('collectibles') ||
        n.includes('entertainment memorabilia') || n.includes('stamps') ||
        n.includes('sports fan apparel & souvenirs') ||
        n.includes('original sport autographed') || n.includes('vintage sports') ||
        n.includes('game used sports') || n.includes('sports memorabilia'))
        return 'collectibles_trading_cards'

    // Sports Memorabilia (specific rates)
    if (n.includes('sports memorabilia') || n.includes('sport autographed') ||
        n.includes('game used'))
        return 'sports_memorabilia'

    // Musical Instruments (specific rates — not guitars, handled above)
    if (n.includes('musical instruments & gear') ||
        n.includes('pro audio equipment') || n.includes('pianos, keyboards') ||
        n.includes('percussion instruments') || n.includes('wind & woodwind') ||
        n.includes('brass instruments'))
        return 'musical_instruments'

    // Computers — specific product (specific rates)
    if (n.includes('laptops & netbooks') || n.includes('desktops & all-in-one') ||
        n.includes('tablets & ereaders') || n.includes('apple macbook') ||
        n.includes('macbook'))
        return 'computers_specific'

    // Computers — general (specific rates)
    if (n.includes('computers/tablets & networking') ||
        n.includes('computer components & parts') ||
        n.includes('computer drives, storage') ||
        n.includes('computer monitors, projectors') ||
        n.includes('surveillance & smart home electronics') ||
        n.includes('virtual reality') || n.includes('vehicle electronics & gps') ||
        n.includes('home surveillance'))
        return 'computers_general'

    // Mobile Phones — specific (specific rates)
    if (n.includes('cell phones & smartphones') ||
        n.includes('apple cell phones'))
        return 'mobiles_phones'

    // Mobile — general (specific rates)
    if (n.includes('cell phones & accessories') ||
        n.includes('cell phone accessories') || n.includes('smart watches') ||
        n.includes('cell phone & smartphone parts') ||
        n.includes('portable audio & headphones') || n.includes('headphones'))
        return 'mobiles_general'

    // Cameras — specific (specific rates)
    if (n.includes('digital cameras') || n.includes('film photography equipment') ||
        n.includes('camcorders'))
        return 'cameras_specific'

    // Cameras — general (specific rates)
    if (n.includes('cameras & photo') || n.includes('camera, drone & photo accessories') ||
        n.includes('camera lenses & filters') || n.includes('tv, video & home audio') ||
        n.includes('home audio equipment') || n.includes('major appliances') ||
        n.includes('tv & video equipment'))
        return 'cameras_general'

    // Vehicle Parts — specific (specific rates)
    if (n.includes('car & truck parts & accessories') ||
        n.includes('motorcycle & scooter parts'))
        return 'vehicle_parts_specific'

    // Vehicle Parts — general (specific rates)
    if (n.includes('vehicle parts & accessories') ||
        n.includes('ebay motors') || n.includes('parts & accessories') &&
        n.includes('motor') ||
        n.includes('performance & racing parts') ||
        n.includes('in-car technology, gps') ||
        n.includes('automotive tools & supplies') ||
        n.includes('boat parts') || n.includes('powersports') ||
        n.includes('motorcycles') || n.includes('cars & trucks') ||
        n.includes('cars, bikes, boats') || n.includes('atv') ||
        n.includes('boats'))
        return 'vehicle_parts_general'

    // Clothing — general (specific rates)
    if (n.includes('clothing, shoes & accessories') ||
        n.includes("women's clothing") || n.includes("men's clothing") ||
        n.includes("women's shoes") || n.includes("men's shoes") ||
        n.includes("women's accessories") || n.includes("men's accessories") ||
        n.includes("kids'") || n.includes("boy's clothing") ||
        n.includes("girls' clothing") || n.includes('baby & toddler clothing') ||
        n.includes('costumes') || n.includes('vintage clothing') ||
        n.includes('wedding & formal') || n.includes('luggage'))
        return 'clothes_general'

    // Health & Beauty (specific rates)
    if (n.includes('health & beauty') || n.includes('fragrances') ||
        n.includes('hair care & styling') || n.includes('makeup') ||
        n.includes('skin care') || n.includes('vitamins & lifestyle') ||
        n.includes('health care') || n.includes('vision care') ||
        n.includes('shaving & hair removal') || n.includes('massage') &&
        !n.includes('chair') ||
        n.includes('natural & alternative remedies') ||
        n.includes('nail care, manicure') || n.includes('oral care') ||
        n.includes('sun protection') || n.includes('salon & spa') ||
        n.includes('tattoos & body art') || n.includes('bath & body') ||
        n.includes('medical & mobility'))
        return 'health_beauty'

    // Home Appliances (specific rates)
    if (n.includes('major appliances') || n.includes('refrigerators, freezers') ||
        n.includes('washers, dryers') || n.includes('dishwashers') ||
        n.includes('ranges & cooking appliances') && n.includes('major'))
        return 'home_appliances'

    // Home Furniture (specific rates)
    if (n.includes('furniture') && !n.includes('office') &&
        !n.includes('kids') && !n.includes('nursery'))
        return 'home_furniture'

    // Home Power Strips (specific rates)
    if (n.includes('power strip') || n.includes('surge protector') ||
        n.includes('extension cord'))
        return 'home_power_strips'

    // Home — general (specific rates)
    if (n.includes('home & garden') || n.includes('yard, garden & outdoor') ||
        n.includes('kitchen, dining & bar') || n.includes('tools & workshop') ||
        n.includes('home improvement') || n.includes('bedding') ||
        n.includes('lamps, lighting') || n.includes('household supplies') ||
        n.includes('bath') && !n.includes('bath & body') ||
        n.includes('greeting cards & party') || n.includes('rugs & carpets') ||
        n.includes('food & beverages') || n.includes('candles & home') ||
        n.includes('holiday & seasonal') || n.includes('window treatments') ||
        n.includes('home décor') || n.includes('kids & teens at home') ||
        n.includes('crafts') || n.includes('pottery & glass') ||
        n.includes('antiques') || n.includes('art'))
        return 'home_general'

    // Sporting Goods (specific rates)
    if (n.includes('sporting goods') || n.includes('hunting') ||
        n.includes('cycling') || n.includes('golf') && !n.includes('golf cart') ||
        n.includes('outdoor sports') || n.includes('fishing') ||
        n.includes('team sports') || n.includes('fitness, running') ||
        n.includes('camping & hiking') || n.includes('winter sports') ||
        n.includes('water sports') || n.includes('boxing, martial arts') ||
        n.includes('indoor games') || n.includes('tennis & racquet') ||
        n.includes('tactical & duty gear') || n.includes('wholesale sporting'))
        return 'sporting_goods'

    // Toys & Games (specific rates)
    if (n.includes('toys & hobbies') || n.includes('collectible card games') ||
        n.includes('action figures') || n.includes('diecast & toy vehicles') ||
        n.includes('building toys') || n.includes('games') &&
        !n.includes('video game') ||
        n.includes('model railroads') || n.includes('radio control') ||
        n.includes('stuffed animals') || n.includes('preschool toys') ||
        n.includes('vintage & antique toys') || n.includes('models & kits') ||
        n.includes('outdoor toys') || n.includes('beanbag plush') ||
        n.includes('slot cars') || n.includes('puzzles') ||
        n.includes('robots, monsters') || n.includes('toys for baby') ||
        n.includes('fast food & cereal premiums'))
        return 'toys_games'

    // Default (13.25% base with store tiers)
    return 'default'
}

export function detectCategory(catName: string, country: string): string {
    switch (country) {
        case 'CA': return detectCACategory(catName)
        case 'UK': return detectUKCategory(catName)
        case 'DE': return detectDECategory(catName)
        case 'FR': return detectFRCategory(catName)
        case 'IT': return detectITCategory(catName)
        case 'ES': return detectESCategory(catName)
        case 'AT': return detectATCategory(catName)
        case 'IE': return detectIECategory(catName)
        case 'BE': return detectBECategory(catName)
        case 'NL': return detectNLCategory(catName)
        case 'PL': return detectPLCategory(catName)
        case 'CH': return detectCHCategory(catName)
        case 'AU': return detectAUCategory(catName)
        case 'US': return detectUSCategoryFull(catName)
        // More countries will be added here one by one
        default: return 'default'
    }
}
