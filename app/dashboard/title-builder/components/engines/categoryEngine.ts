// ── categoryEngine.ts ─────────────────────────────────────────────────────────
// Step 4 of the Title Engine Learning Path: Category Detection
//
// Purpose:
//   Teaches the engine what category ANY eBay product belongs to.
//   Uses weighted scoring — every word in the title votes for a category.
//   The category with most votes wins.
//
// Categories: 25 (vs 11 in original)
// Words: 1500+ (vs ~120 in original)
// Subcategories: 80+ for precise targeting
//
// Usage:
//   import { detectCategoryV2 } from './categoryEngine'
//   const result = detectCategoryV2("Nike Air Max 90 Trainers Size 9")
//   // → { category: 'footwear', subcategory: 'trainers', confidence: 'high' }
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
    | 'electronics' | 'computing' | 'gaming' | 'photography' | 'audio'
    | 'automotive' | 'clothing' | 'footwear' | 'jewellery'
    | 'pets' | 'baby' | 'toys'
    | 'home' | 'garden' | 'tools' | 'kitchen'
    | 'sports' | 'cycling' | 'fishing' | 'equestrian'
    | 'health' | 'beauty'
    | 'collectibles' | 'music' | 'books'
    | 'arts' | 'office' | 'travel' | 'food' | 'party'
    | 'digital' | 'default'

export interface CategoryResult {
    category: Category
    subcategory: string
    confidence: 'high' | 'medium' | 'low' | 'none'
    score: number
}

// ── Weighted category dictionary ──────────────────────────────────────────────
// Weight 3 = definitive (only this category)
// Weight 2 = strong signal
// Weight 1 = normal signal
// Weight 0.5 = weak/shared signal
// A word can vote for multiple categories

const DICT: Record<string, Partial<Record<Category, number>>> = {

    // merged
    pencil: { arts: 2, office: 2 },

    // merged
    ebook: { books: 3, digital: 2 },

    // merged
    stamp: { collectibles: 3, arts: 2 },

    // merged
    comic: { collectibles: 3, books: 2 },

    // merged
    palette: { beauty: 3, arts: 2 },

    // merged
    protein: { health: 2, sports: 2, food: 1 },

    // merged
    supplement: { health: 3, sports: 1, food: 1 },

    // merged
    pedal: { cycling: 3, music: 2 },

    // merged
    saddle: { cycling: 3, equestrian: 3 },

    // merged
    thermometer: { health: 3, kitchen: 2 },

    // merged
    tape: { tools: 2, office: 2 },

    // merged
    nail: { tools: 2, beauty: 2 },

    // merged
    pot: { kitchen: 2, garden: 2 },

    // merged
    hook: { home: 2, fishing: 2 },

    // merged
    rug: { home: 3, equestrian: 1 },

    // merged
    pillow: { home: 3, travel: 1 },

    // merged
    chair: { home: 3, office: 2 },

    // merged
    pokemon: { toys: 2, collectibles: 2, gaming: 1 },

    // merged
    feeder: { pets: 2, garden: 1, fishing: 1 },

    // merged
    insole: { footwear: 3, health: 1 },

    // merged
    rugby: { sports: 2, clothing: 1 },

    // merged
    scooter: { automotive: 2, sports: 2, toys: 0.5 },

    // merged
    radiator: { automotive: 3, home: 2 },

    // merged
    tyre: { automotive: 3, cycling: 2 },

    // merged
    vinyl: { audio: 2, music: 2, collectibles: 1 },

    // merged
    turntable: { audio: 3, music: 3 },

    // merged
    lens: { photography: 3, health: 1 },

    // merged
    projector: { computing: 2, office: 2 },

    // merged
    storage: { computing: 2, home: 2 },

    // merged
    router: { computing: 3, tools: 1 },

    // merged
    keyboard: { computing: 2, music: 2 },

    // merged
    adapter: { electronics: 2, travel: 2 },

    // ══ ELECTRONICS ════════════════════════════════════════════════════════════
    iphone: { electronics: 3 },
    samsung: { electronics: 2, clothing: 0.5 },
    huawei: { electronics: 3 },
    oneplus: { electronics: 3 },
    xiaomi: { electronics: 3 },
    oppo: { electronics: 3 },
    pixel: { electronics: 2 },
    motorola: { electronics: 2 },
    nokia: { electronics: 2 },
    sony: { electronics: 2, audio: 1 },
    smartphone: { electronics: 3 },
    mobile: { electronics: 2 },
    phone: { electronics: 2 },
    tablet: { electronics: 2 },
    smartwatch: { electronics: 2 },
    wearable: { electronics: 2 },
    charger: { electronics: 2 },
    cable: { electronics: 2 },
    usb: { electronics: 2 },
    hdmi: { electronics: 3 },
    lightning: { electronics: 2 },
    magsafe: { electronics: 3 },
    powerbank: { electronics: 3 },
    screen: { electronics: 2 },
    display: { electronics: 2 },
    battery: { electronics: 2, automotive: 1 },
    case: { electronics: 1, home: 0.3 },
    cover: { electronics: 1, home: 0.3 },
    protector: { electronics: 2 },
    holder: { electronics: 1, home: 1 },
    stand: { electronics: 1, home: 1, music: 1 },
    mount: { electronics: 2, automotive: 1 },
    wireless: { electronics: 2 },

    // ══ COMPUTING ══════════════════════════════════════════════════════════════
    laptop: { computing: 3 },
    macbook: { computing: 3 },
    chromebook: { computing: 3 },
    lenovo: { computing: 2 },
    dell: { computing: 2 },
    asus: { computing: 2 },
    acer: { computing: 2 },
    hp: { computing: 2 },
    desktop: { computing: 2 },
    computer: { computing: 3 },
    mouse: { computing: 2 },
    monitor: { computing: 2, baby: 0.5 },
    webcam: { computing: 3 },
    printer: { computing: 3 },
    scanner: { computing: 3 },
    modem: { computing: 3 },
    ssd: { computing: 3 },
    nvme: { computing: 3 },
    ram: { computing: 3 },
    gpu: { computing: 3 },
    cpu: { computing: 3 },
    motherboard: { computing: 3 },
    hard: { computing: 1 },
    drive: { computing: 2 },
    hub: { computing: 2 },
    dock: { computing: 2 },
    server: { computing: 3 },
    networking: { computing: 2 },
    ethernet: { computing: 3 },
    wifi: { computing: 2 },

    // ══ GAMING ═════════════════════════════════════════════════════════════════
    playstation: { gaming: 3 },
    xbox: { gaming: 3 },
    nintendo: { gaming: 3 },
    ps5: { gaming: 3 },
    ps4: { gaming: 3 },
    ps3: { gaming: 3 },
    switch: { gaming: 2 },
    gameboy: { gaming: 3 },
    controller: { gaming: 2, automotive: 0.5 },
    console: { gaming: 3 },
    gaming: { gaming: 2, electronics: 1 },
    game: { gaming: 2, toys: 1 },
    steam: { gaming: 2 },
    rpg: { gaming: 3 },
    fps: { gaming: 3 },
    joystick: { gaming: 3 },
    gamepad: { gaming: 3 },
    headset: { gaming: 2, audio: 1 },
    dlc: { gaming: 3 },
    joycon: { gaming: 3 },

    // ══ PHOTOGRAPHY ════════════════════════════════════════════════════════════
    camera: { photography: 3 },
    canon: { photography: 2 },
    nikon: { photography: 2 },
    fujifilm: { photography: 2 },
    olympus: { photography: 2 },
    panasonic: { photography: 2 },
    dslr: { photography: 3 },
    mirrorless: { photography: 3 },
    tripod: { photography: 3 },
    filter: { photography: 2, garden: 0.5 },
    flash: { photography: 2, electronics: 0.5 },
    lightroom: { photography: 3 },
    gimbal: { photography: 3 },
    gopro: { photography: 3 },
    ringlight: { photography: 3 },
    backdrop: { photography: 3 },
    lightbox: { photography: 3 },
    stabiliser: { photography: 2 },
    studio: { photography: 2 },

    // ══ AUDIO ══════════════════════════════════════════════════════════════════
    earbuds: { audio: 3 },
    earphones: { audio: 3 },
    headphones: { audio: 3 },
    speaker: { audio: 3, electronics: 1 },
    amplifier: { audio: 3, music: 1 },
    subwoofer: { audio: 3 },
    soundbar: { audio: 3 },
    bluetooth: { audio: 2, electronics: 1 },
    airpods: { audio: 3 },
    record: { audio: 2, music: 2, collectibles: 1 },
    receiver: { audio: 3 },
    preamp: { audio: 3 },
    dac: { audio: 3 },
    hifi: { audio: 3 },

    // ══ AUTOMOTIVE ═════════════════════════════════════════════════════════════
    car: { automotive: 3 },
    truck: { automotive: 3 },
    van: { automotive: 3 },
    suv: { automotive: 3 },
    vehicle: { automotive: 3 },
    engine: { automotive: 3 },
    brake: { automotive: 3 },
    tire: { automotive: 3 },
    wheel: { automotive: 3, cycling: 1 },
    rim: { automotive: 3 },
    bumper: { automotive: 3 },
    exhaust: { automotive: 3 },
    alternator: { automotive: 3 },
    clutch: { automotive: 3 },
    suspension: { automotive: 3 },
    starter: { automotive: 2 },
    windscreen: { automotive: 3 },
    wiper: { automotive: 3 },
    dashcam: { automotive: 3 },
    obd: { automotive: 3 },
    sat: { automotive: 1 },
    satnav: { automotive: 3 },
    carmat: { automotive: 3 },
    seatcover: { automotive: 3 },
    gearbox: { automotive: 3 },
    turbo: { automotive: 3 },
    intercooler: { automotive: 3 },
    catalytic: { automotive: 3 },
    coolant: { automotive: 3 },
    motorbike: { automotive: 3 },
    motorcycle: { automotive: 3 },
    moped: { automotive: 3 },
    bmw: { automotive: 3 },
    mercedes: { automotive: 3 },
    ford: { automotive: 3 },
    toyota: { automotive: 3 },
    honda: { automotive: 3 },
    vauxhall: { automotive: 3 },
    volkswagen: { automotive: 3 },
    vw: { automotive: 3 },
    audi: { automotive: 3 },
    nissan: { automotive: 3 },
    hyundai: { automotive: 3 },
    kia: { automotive: 3 },
    peugeot: { automotive: 3 },
    renault: { automotive: 3 },
    seat: { automotive: 2, home: 0.5 },
    skoda: { automotive: 3 },
    mazda: { automotive: 3 },
    volvo: { automotive: 3 },
    jaguar: { automotive: 3 },
    landrover: { automotive: 3 },

    // ══ CLOTHING ═══════════════════════════════════════════════════════════════
    shirt: { clothing: 3 },
    tshirt: { clothing: 3 },
    top: { clothing: 2 },
    blouse: { clothing: 3 },
    jumper: { clothing: 3 },
    hoodie: { clothing: 3 },
    sweatshirt: { clothing: 3 },
    cardigan: { clothing: 3 },
    dress: { clothing: 3 },
    skirt: { clothing: 3 },
    jeans: { clothing: 3 },
    trousers: { clothing: 3 },
    pants: { clothing: 3 },
    shorts: { clothing: 3 },
    leggings: { clothing: 3 },
    joggers: { clothing: 3 },
    chinos: { clothing: 3 },
    suit: { clothing: 3 },
    blazer: { clothing: 3 },
    jacket: { clothing: 3 },
    coat: { clothing: 3 },
    puffer: { clothing: 3 },
    parka: { clothing: 3 },
    anorak: { clothing: 3 },
    underwear: { clothing: 3 },
    bra: { clothing: 3 },
    knickers: { clothing: 3 },
    boxers: { clothing: 3 },
    briefs: { clothing: 3 },
    socks: { clothing: 3 },
    tights: { clothing: 3 },
    scarf: { clothing: 2 },
    hat: { clothing: 2 },
    beanie: { clothing: 3 },
    gloves: { clothing: 2, sports: 0.5 },
    belt: { clothing: 2 },
    swimsuit: { clothing: 3 },
    bikini: { clothing: 3 },
    pyjamas: { clothing: 3 },
    robe: { clothing: 2 },
    nike: { clothing: 2, sports: 1, footwear: 1 },
    adidas: { clothing: 2, sports: 1, footwear: 1 },
    gucci: { clothing: 2 },
    zara: { clothing: 2 },
    hm: { clothing: 2 },
    primark: { clothing: 2 },
    ralph: { clothing: 2 },
    tommy: { clothing: 2 },
    levi: { clothing: 2 },
    wrangler: { clothing: 2 },
    fashion: { clothing: 1 },
    streetwear: { clothing: 2 },
    bodysuit: { clothing: 3 },
    vest: { clothing: 2, sports: 1 },
    polo: { clothing: 3 },

    // ══ FOOTWEAR ════════════════════════════════════════════════════════════════
    trainers: { footwear: 3 },
    sneakers: { footwear: 3 },
    shoes: { footwear: 3 },
    boots: { footwear: 3 },
    sandals: { footwear: 3 },
    heels: { footwear: 3 },
    loafers: { footwear: 3 },
    slippers: { footwear: 3 },
    moccasins: { footwear: 3 },
    brogues: { footwear: 3 },
    espadrilles: { footwear: 3 },
    wellies: { footwear: 3 },
    pumps: { footwear: 3 },
    wedges: { footwear: 3 },
    stilettos: { footwear: 3 },
    clogs: { footwear: 3 },
    flipflops: { footwear: 3 },
    airforce: { footwear: 3 },
    airjordan: { footwear: 3 },
    yeezy: { footwear: 3 },
    converse: { footwear: 3 },
    vans: { footwear: 2 },
    newbalance: { footwear: 3 },
    puma: { footwear: 3 },
    reebok: { footwear: 3 },
    asics: { footwear: 3 },
    skechers: { footwear: 3 },
    timberland: { footwear: 3 },
    ugg: { footwear: 3 },
    crocs: { footwear: 3 },
    birkenstock: { footwear: 3 },
    clarks: { footwear: 3 },
    shoelace: { footwear: 3 },

    // ══ JEWELLERY ══════════════════════════════════════════════════════════════
    ring: { jewellery: 2, photography: 0.5 },
    necklace: { jewellery: 3 },
    bracelet: { jewellery: 3 },
    earring: { jewellery: 3 },
    pendant: { jewellery: 3 },
    chain: { jewellery: 2, automotive: 0.5 },
    brooch: { jewellery: 3 },
    anklet: { jewellery: 3 },
    cufflinks: { jewellery: 3 },
    bangle: { jewellery: 3 },
    charm: { jewellery: 2 },
    locket: { jewellery: 3 },
    choker: { jewellery: 3 },
    stud: { jewellery: 2 },
    hoop: { jewellery: 2 },
    signet: { jewellery: 3 },
    diamond: { jewellery: 3 },
    sapphire: { jewellery: 2 },
    ruby: { jewellery: 3 },
    emerald: { jewellery: 3 },
    pearl: { jewellery: 3 },
    gold: { jewellery: 2 },
    silver: { jewellery: 2 },
    platinum: { jewellery: 3 },
    gemstone: { jewellery: 3 },
    moissanite: { jewellery: 3 },
    hallmark: { jewellery: 3 },
    ct: { jewellery: 1 },

    // ══ PETS ═══════════════════════════════════════════════════════════════════
    dog: { pets: 3 },
    cat: { pets: 3 },
    puppy: { pets: 3 },
    pet: { pets: 3 },
    rabbit: { pets: 3 },
    hamster: { pets: 3 },
    guinea: { pets: 3 },
    bird: { pets: 2, garden: 0.5 },
    parrot: { pets: 3 },
    fish: { pets: 2, food: 0.5, sports: 0.5 },
    aquarium: { pets: 3 },
    reptile: { pets: 3 },
    tortoise: { pets: 3 },
    snake: { pets: 3 },
    lead: { pets: 2 },
    collar: { pets: 2 },
    harness: { pets: 3 },
    kennel: { pets: 3 },
    crate: { pets: 2 },
    litter: { pets: 3 },
    flea: { pets: 3 },
    wormer: { pets: 3 },
    grooming: { pets: 3, beauty: 0.5 },
    kong: { pets: 3 },
    pedigree: { pets: 3 },
    whiskas: { pets: 3 },
    purina: { pets: 3 },
    scratching: { pets: 3 },
    catnip: { pets: 3 },
    aquatic: { pets: 2 },
    vivarium: { pets: 3 },
    hutch: { pets: 3 },

    // ══ BABY ═══════════════════════════════════════════════════════════════════
    baby: { baby: 3 },
    infant: { baby: 3 },
    newborn: { baby: 3 },
    nappy: { baby: 3 },
    diaper: { baby: 3 },
    pram: { baby: 3 },
    pushchair: { baby: 3 },
    stroller: { baby: 3 },
    buggy: { baby: 3 },
    cot: { baby: 3 },
    crib: { baby: 3 },
    moses: { baby: 3 },
    highchair: { baby: 3 },
    bouncer: { baby: 3 },
    dummy: { baby: 3 },
    pacifier: { baby: 3 },
    teether: { baby: 3 },
    rattle: { baby: 3 },
    babygrow: { baby: 3 },
    romper: { baby: 3 },
    steriliser: { baby: 3 },
    sterilizer: { baby: 3 },
    formula: { baby: 2, health: 0.5 },
    weaning: { baby: 3 },
    toddler: { baby: 2, toys: 1 },
    playmat: { baby: 3 },
    babygate: { baby: 3 },
    babymonitor: { baby: 3 },
    sling: { baby: 3 },
    carrier: { baby: 2, pets: 0.5 },

    // ══ TOYS ═══════════════════════════════════════════════════════════════════
    toy: { toys: 3 },
    lego: { toys: 3 },
    playset: { toys: 3 },
    doll: { toys: 3 },
    puzzle: { toys: 3 },
    boardgame: { toys: 3 },
    action: { toys: 1 },
    remote: { toys: 2, electronics: 1 },
    rc: { toys: 2 },
    nerf: { toys: 3 },
    barbie: { toys: 3 },
    playmobil: { toys: 3 },
    minecraft: { toys: 2, gaming: 1 },
    roblox: { toys: 2, gaming: 1 },
    slime: { toys: 3 },
    kinetic: { toys: 2 },
    magnetic: { toys: 2, electronics: 0.5 },
    kite: { toys: 3, sports: 0.5 },
    playdoh: { toys: 3 },
    colouring: { toys: 2, arts: 1 },

    // ══ HOME ═══════════════════════════════════════════════════════════════════
    sofa: { home: 3 },
    couch: { home: 3 },
    table: { home: 3 },
    shelf: { home: 3 },
    cabinet: { home: 3 },
    wardrobe: { home: 3 },
    bed: { home: 3 },
    mattress: { home: 3 },
    duvet: { home: 3 },
    blanket: { home: 3 },
    curtain: { home: 3 },
    blind: { home: 3 },
    carpet: { home: 3 },
    lamp: { home: 3 },
    mirror: { home: 3 },
    clock: { home: 3 },
    frame: { home: 2 },
    vase: { home: 3 },
    candle: { home: 3 },
    diffuser: { home: 3 },
    box: { home: 2, tools: 0.5 },
    basket: { home: 2 },
    towel: { home: 3 },
    bathmat: { home: 3 },
    shower: { home: 2 },
    toilet: { home: 3 },
    bin: { home: 3 },
    decor: { home: 3 },
    cushion: { home: 3 },
    throw: { home: 3 },
    vacuum: { home: 3 },
    mop: { home: 3 },
    cleaning: { home: 2 },
    ironing: { home: 3 },
    kettle: { home: 3, kitchen: 1 },
    toaster: { home: 3, kitchen: 1 },
    microwave: { home: 3, kitchen: 1 },
    fridge: { home: 3 },
    washer: { home: 3 },
    dryer: { home: 3 },
    heater: { home: 3 },
    fan: { home: 3 },
    aircon: { home: 3 },
    dehumidifier: { home: 3 },
    humidifier: { home: 3 },
    purifier: { home: 3 },

    // ══ GARDEN ═════════════════════════════════════════════════════════════════
    garden: { garden: 3 },
    mower: { garden: 3 },
    strimmer: { garden: 3 },
    hedge: { garden: 3 },
    spade: { garden: 3 },
    fork: { garden: 3, food: 0.5 },
    rake: { garden: 3 },
    trowel: { garden: 3 },
    hose: { garden: 3 },
    sprinkler: { garden: 3 },
    watering: { garden: 3 },
    planter: { garden: 3 },
    compost: { garden: 3 },
    fertiliser: { garden: 3 },
    fertilizer: { garden: 3 },
    weedkiller: { garden: 3 },
    pesticide: { garden: 3 },
    seed: { garden: 3 },
    bulb: { garden: 2, electronics: 0.5 },
    plant: { garden: 3 },
    tree: { garden: 3 },
    greenhouse: { garden: 3 },
    polytunnel: { garden: 3 },
    trellis: { garden: 3 },
    netting: { garden: 3 },
    decking: { garden: 3 },
    paving: { garden: 3 },
    gravel: { garden: 3 },
    bark: { garden: 3 },
    birdfeeder: { garden: 3 },
    birdbath: { garden: 3 },
    pergola: { garden: 3 },
    gazebo: { garden: 3 },
    outdoor: { garden: 2, sports: 0.5 },
    patio: { garden: 3 },
    lawn: { garden: 3 },
    grass: { garden: 3 },
    soil: { garden: 3 },
    mulch: { garden: 3 },

    // ══ TOOLS ══════════════════════════════════════════════════════════════════
    drill: { tools: 3 },
    saw: { tools: 3 },
    hammer: { tools: 3 },
    screwdriver: { tools: 3 },
    wrench: { tools: 3 },
    spanner: { tools: 3 },
    pliers: { tools: 3 },
    chisel: { tools: 3 },
    level: { tools: 3 },
    sander: { tools: 3 },
    grinder: { tools: 3 },
    jigsaw: { tools: 3 },
    screw: { tools: 2 },
    bolt: { tools: 2 },
    toolbox: { tools: 3 },
    workbench: { tools: 3 },
    clamp: { tools: 3 },
    dewalt: { tools: 3 },
    makita: { tools: 3 },
    bosch: { tools: 2 },
    stanley: { tools: 3 },
    milwaukee: { tools: 3 },
    ryobi: { tools: 3 },
    cordless: { tools: 3 },
    plumbing: { tools: 3 },
    pipe: { tools: 2, garden: 0.5 },
    fitting: { tools: 2 },
    welding: { tools: 3 },
    soldering: { tools: 3 },

    // ══ KITCHEN ════════════════════════════════════════════════════════════════
    knife: { kitchen: 3, tools: 0.5 },
    pan: { kitchen: 3 },
    wok: { kitchen: 3 },
    chopping: { kitchen: 3 },
    cutting: { kitchen: 3 },
    blender: { kitchen: 3 },
    mixer: { kitchen: 3 },
    airfryer: { kitchen: 3 },
    coffeemachine: { kitchen: 3 },
    cafetiere: { kitchen: 3 },
    mug: { kitchen: 3 },
    cup: { kitchen: 3 },
    glass: { kitchen: 3 },
    plate: { kitchen: 3 },
    bowl: { kitchen: 3 },
    cutlery: { kitchen: 3 },
    spatula: { kitchen: 3 },
    tongs: { kitchen: 3 },
    baking: { kitchen: 3 },
    cookware: { kitchen: 3 },
    casserole: { kitchen: 3 },
    colander: { kitchen: 3 },
    peeler: { kitchen: 3 },
    grater: { kitchen: 3 },
    whisk: { kitchen: 3 },
    scales: { kitchen: 3 },
    juicer: { kitchen: 3 },
    breadmaker: { kitchen: 3 },
    slowcooker: { kitchen: 3 },
    instantpot: { kitchen: 3 },
    nespresso: { kitchen: 3 },
    kitchenaid: { kitchen: 3 },
    flask: { kitchen: 2, sports: 1 },
    lunchbox: { kitchen: 3 },
    tupperware: { kitchen: 3 },

    // ══ SPORTS ═════════════════════════════════════════════════════════════════
    gym: { sports: 3 },
    fitness: { sports: 3 },
    workout: { sports: 3 },
    yoga: { sports: 3 },
    running: { sports: 3, clothing: 0.5 },
    swimming: { sports: 3 },
    football: { sports: 3 },
    soccer: { sports: 3 },
    basketball: { sports: 3 },
    tennis: { sports: 3 },
    golf: { sports: 3 },
    cricket: { sports: 3 },
    boxing: { sports: 3 },
    mma: { sports: 3 },
    weightlifting: { sports: 3 },
    dumbbell: { sports: 3 },
    barbell: { sports: 3 },
    kettlebell: { sports: 3 },
    bench: { sports: 2, home: 0.5 },
    treadmill: { sports: 3 },
    rowing: { sports: 3 },
    crosstrainer: { sports: 3 },
    resistance: { sports: 3 },
    climbing: { sports: 3 },
    hiking: { sports: 3 },
    skiing: { sports: 3 },
    snowboard: { sports: 3 },
    surfboard: { sports: 3 },
    skateboard: { sports: 3 },
    volleyball: { sports: 3 },
    badminton: { sports: 3 },
    squash: { sports: 3 },
    netball: { sports: 3 },
    hockey: { sports: 3 },
    karate: { sports: 3 },
    judo: { sports: 3 },
    martial: { sports: 3 },
    archery: { sports: 3 },

    // ══ CYCLING ════════════════════════════════════════════════════════════════
    bike: { cycling: 3 },
    bicycle: { cycling: 3 },
    ebike: { cycling: 3 },
    mtb: { cycling: 3 },
    roadbike: { cycling: 3 },
    fixie: { cycling: 3 },
    bmx: { cycling: 3 },
    cycling: { cycling: 3 },
    helmet: { cycling: 2, sports: 1, automotive: 0.5 },
    handlebar: { cycling: 3 },
    derailleur: { cycling: 3 },
    cassette: { cycling: 2, audio: 1 },
    chainring: { cycling: 3 },
    mudguard: { cycling: 3 },
    pannier: { cycling: 3 },
    bikelock: { cycling: 3 },
    bikelight: { cycling: 3 },
    bikepump: { cycling: 3 },

    // ══ FISHING ════════════════════════════════════════════════════════════════
    fishing: { fishing: 3 },
    rod: { fishing: 3 },
    reel: { fishing: 3 },
    tackle: { fishing: 3 },
    lure: { fishing: 3 },
    bait: { fishing: 3 },
    float: { fishing: 3 },
    line: { fishing: 3 },
    carp: { fishing: 3 },
    fly: { fishing: 2 },
    keepnet: { fishing: 3 },
    bivvy: { fishing: 3 },
    angling: { fishing: 3 },
    spod: { fishing: 3 },
    boilie: { fishing: 3 },

    // ══ EQUESTRIAN ═════════════════════════════════════════════════════════════
    horse: { equestrian: 3 },
    pony: { equestrian: 3 },
    bridle: { equestrian: 3 },
    girth: { equestrian: 3 },
    stirrup: { equestrian: 3 },
    bit: { equestrian: 2 },
    jodhpur: { equestrian: 3 },
    riding: { equestrian: 3 },
    equestrian: { equestrian: 3 },
    dressage: { equestrian: 3 },
    hoof: { equestrian: 3 },
    stable: { equestrian: 3 },
    headcollar: { equestrian: 3 },

    // ══ HEALTH ═════════════════════════════════════════════════════════════════
    vitamin: { health: 3 },
    collagen: { health: 3 },
    omega: { health: 3 },
    probiotic: { health: 3 },
    medical: { health: 3 },
    dental: { health: 3 },
    surgical: { health: 3 },
    brace: { health: 3 },
    support: { health: 3 },
    bandage: { health: 3 },
    plaster: { health: 3 },
    tens: { health: 3 },
    cpap: { health: 3 },
    nebuliser: { health: 3 },
    compression: { health: 3, sports: 1 },
    physiotherapy: { health: 3 },
    massager: { health: 3 },
    bloodpressure: { health: 3 },
    wheelchair: { health: 3 },
    crutch: { health: 3 },
    walking: { health: 2, sports: 1 },
    stick: { health: 2, sports: 0.5 },
    hearing: { health: 3 },
    glasses: { health: 2 },
    contact: { health: 2 },
    posture: { health: 3 },
    melatonin: { health: 3 },
    cbd: { health: 3 },

    // ══ BEAUTY ═════════════════════════════════════════════════════════════════
    skincare: { beauty: 3 },
    serum: { beauty: 3 },
    moisturiser: { beauty: 3 },
    moisturizer: { beauty: 3 },
    cleanser: { beauty: 3 },
    spf: { beauty: 3 },
    sunscreen: { beauty: 3 },
    retinol: { beauty: 3 },
    hyaluronic: { beauty: 3 },
    makeup: { beauty: 3 },
    foundation: { beauty: 3 },
    concealer: { beauty: 3 },
    mascara: { beauty: 3 },
    eyeliner: { beauty: 3 },
    eyeshadow: { beauty: 3 },
    lipstick: { beauty: 3 },
    lipgloss: { beauty: 3 },
    blush: { beauty: 3 },
    bronzer: { beauty: 3 },
    highlighter: { beauty: 3 },
    primer: { beauty: 3 },
    contour: { beauty: 3 },
    shampoo: { beauty: 3, pets: 0.5 },
    conditioner: { beauty: 3 },
    hairdryer: { beauty: 3 },
    straightener: { beauty: 3 },
    curler: { beauty: 3 },
    hairbrush: { beauty: 3 },
    perfume: { beauty: 3 },
    cologne: { beauty: 3 },
    deodorant: { beauty: 3 },
    razor: { beauty: 3 },
    trimmer: { beauty: 3, tools: 0.5 },
    epilator: { beauty: 3 },
    tweezers: { beauty: 3 },
    eyelash: { beauty: 3 },
    brush: { beauty: 2, arts: 2, tools: 0.5 },
    sponge: { beauty: 2, kitchen: 0.5 },

    // ══ COLLECTIBLES ═══════════════════════════════════════════════════════════
    vintage: { collectibles: 3, clothing: 0.5 },
    antique: { collectibles: 3 },
    rare: { collectibles: 2 },
    signed: { collectibles: 3 },
    coin: { collectibles: 3 },
    memorabilia: { collectibles: 3 },
    autograph: { collectibles: 3 },
    diecast: { collectibles: 3 },
    model: { collectibles: 2, computing: 0.5 },
    trading: { collectibles: 2 },
    postcard: { collectibles: 3 },
    banknote: { collectibles: 3 },
    medal: { collectibles: 3 },
    badge: { collectibles: 2 },
    yugioh: { collectibles: 3 },
    mtg: { collectibles: 3 },
    psa: { collectibles: 3 },
    bullion: { collectibles: 3 },
    sovereign: { collectibles: 3 },
    numismatic: { collectibles: 3 },

    // ══ MUSIC ══════════════════════════════════════════════════════════════════
    guitar: { music: 3 },
    bass: { music: 3 },
    ukulele: { music: 3 },
    piano: { music: 3 },
    drum: { music: 3 },
    violin: { music: 3 },
    cello: { music: 3 },
    trumpet: { music: 3 },
    saxophone: { music: 3 },
    flute: { music: 3 },
    harmonica: { music: 3 },
    capo: { music: 3 },
    pick: { music: 3 },
    plectrum: { music: 3 },
    strap: { music: 2 },
    tuner: { music: 3 },
    microphone: { music: 3, gaming: 1 },
    midi: { music: 3 },
    synthesiser: { music: 3 },
    synthesizer: { music: 3 },
    djing: { music: 3 },
    dj: { music: 3 },
    cajon: { music: 3 },
    snare: { music: 3 },
    cymbals: { music: 3 },
    banjo: { music: 3 },
    mandolin: { music: 3 },

    // ══ BOOKS ══════════════════════════════════════════════════════════════════
    book: { books: 3 },
    novel: { books: 3 },
    textbook: { books: 3 },
    fiction: { books: 3 },
    biography: { books: 3 },
    cookbook: { books: 3 },
    journal: { books: 3 },
    diary: { books: 3 },
    dictionary: { books: 3 },
    manga: { books: 3 },
    hardback: { books: 3 },
    paperback: { books: 3 },
    audiobook: { books: 3 },

    // ══ ARTS & CRAFTS ══════════════════════════════════════════════════════════
    paint: { arts: 3, tools: 0.5 },
    canvas: { arts: 3 },
    easel: { arts: 3 },
    acrylic: { arts: 3 },
    watercolour: { arts: 3 },
    watercolor: { arts: 3 },
    pastel: { arts: 3 },
    charcoal: { arts: 3 },
    graphite: { arts: 3 },
    marker: { arts: 2, office: 1 },
    sketchbook: { arts: 3 },
    yarn: { arts: 3 },
    wool: { arts: 2, clothing: 1 },
    knitting: { arts: 3 },
    crochet: { arts: 3 },
    embroidery: { arts: 3 },
    cross: { arts: 2 },
    sewing: { arts: 3 },
    fabric: { arts: 2, clothing: 1 },
    loom: { arts: 3 },
    resin: { arts: 3 },
    clay: { arts: 3 },
    pottery: { arts: 3 },
    kiln: { arts: 3 },
    die: { arts: 2 },
    cricut: { arts: 3 },
    silhouette: { arts: 3 },
    airbrush: { arts: 3 },
    sculpt: { arts: 3 },

    // ══ OFFICE ═════════════════════════════════════════════════════════════════
    desk: { office: 3, home: 1 },
    office: { office: 3 },
    stapler: { office: 3 },
    folder: { office: 3 },
    file: { office: 3 },
    binder: { office: 3 },
    pen: { office: 3 },
    ruler: { office: 3 },
    scissors: { office: 3 },
    glue: { office: 2, arts: 1, tools: 1 },
    calculator: { office: 3 },
    notebook: { office: 3, books: 1 },
    stationery: { office: 3 },
    ergonomic: { office: 3 },
    standing: { office: 2 },
    organiser: { office: 3, home: 1 },
    organizer: { office: 3, home: 1 },
    binding: { office: 3 },
    label: { office: 3 },

    // ══ TRAVEL ═════════════════════════════════════════════════════════════════
    suitcase: { travel: 3 },
    luggage: { travel: 3 },
    backpack: { travel: 3, sports: 0.5 },
    passport: { travel: 3 },
    travel: { travel: 3 },
    packing: { travel: 3 },
    currency: { travel: 3 },
    map: { travel: 3 },
    guidebook: { travel: 3 },
    earplugs: { travel: 3 },
    eyemask: { travel: 3 },
    toiletry: { travel: 3 },
    washbag: { travel: 3 },
    moneybelty: { travel: 3 },
    hammock: { travel: 3, garden: 1 },
    sleeping: { travel: 3 },
    tent: { travel: 2, sports: 1 },
    camping: { travel: 3, sports: 0.5 },

    // ══ FOOD & DRINK ═══════════════════════════════════════════════════════════
    coffee: { food: 3 },
    tea: { food: 3 },
    chocolate: { food: 3 },
    wine: { food: 3 },
    whisky: { food: 3 },
    gin: { food: 3 },
    rum: { food: 3 },
    vodka: { food: 3 },
    beer: { food: 3 },
    spirits: { food: 3 },
    sauce: { food: 3 },
    spice: { food: 3 },
    herb: { food: 3 },
    honey: { food: 3 },
    jam: { food: 3 },
    snack: { food: 3 },
    crisp: { food: 3 },
    sweet: { food: 3 },
    biscuit: { food: 3 },

    // ══ PARTY ══════════════════════════════════════════════════════════════════
    balloon: { party: 3 },
    banner: { party: 3 },
    decoration: { party: 3 },
    confetti: { party: 3 },
    streamers: { party: 3 },
    tablecloth: { party: 3 },
    party: { party: 3 },
    birthday: { party: 2 },
    celebration: { party: 3 },
    costume: { party: 3 },
    mask: { party: 2, health: 0.5 },
    wig: { party: 3 },
    halloween: { party: 3 },
    christmas: { party: 2, home: 1 },
    festive: { party: 2 },
    piata: { party: 3 },
    fireworks: { party: 3 },

    // ══ DIGITAL ════════════════════════════════════════════════════════════════
    download: { digital: 3 },
    software: { digital: 3 },
    licence: { digital: 3 },
    license: { digital: 3 },
    code: { digital: 3 },
    key: { digital: 2 },
    subscription: { digital: 3 },
    account: { digital: 3 },
    printable: { digital: 3 },
    template: { digital: 3 },
    digital: { digital: 3 },
    instant: { digital: 2 },
    pdf: { digital: 3 },
    font: { digital: 3 },
    plugin: { digital: 3 },
    preset: { digital: 3 },
    mockup: { digital: 3 },
    clipart: { digital: 3 },

    // ══ BRANDS & ADDITIONAL WORDS ══════════════════════════════════════════════

    // Electronics/Audio brands
    apple: { electronics: 3 },
    lg: { electronics: 2 },
    tcl: { electronics: 2 },
    hisense: { electronics: 2 },
    philips: { electronics: 2 },
    toshiba: { electronics: 2 },
    jbl: { audio: 3 },
    bose: { audio: 3 },
    beats: { audio: 3 },
    sennheiser: { audio: 3 },
    denon: { audio: 3 },
    pioneer: { audio: 3, music: 1 },
    onkyo: { audio: 3 },
    nad: { audio: 3 },
    marantz: { audio: 3 },
    rotel: { audio: 3 },
    arcam: { audio: 3 },
    focal: { audio: 3 },
    klipsch: { audio: 3 },
    wharfedale: { audio: 3 },
    dongle: { electronics: 3 },
    splitter: { electronics: 3 },
    extender: { electronics: 3 },
    converter: { electronics: 2 },
    booster: { electronics: 2 },
    repeater: { electronics: 3 },
    razer: { computing: 2, gaming: 1 },
    corsair: { computing: 2, gaming: 1 },
    logitech: { computing: 2 },
    surface: { computing: 3 },
    thinkpad: { computing: 3 },
    thunderbolt: { computing: 3 },
    displayport: { computing: 3 },
    ddr: { computing: 3 },
    pcie: { computing: 3 },

    // Gaming
    dreamcast: { gaming: 3 },
    gamecube: { gaming: 3 },
    atari: { gaming: 3 },
    sega: { gaming: 3 },
    megadrive: { gaming: 3 },
    oculus: { gaming: 3 },
    vr: { gaming: 3 },
    elgato: { gaming: 3 },
    gamepass: { gaming: 3 },
    psn: { gaming: 3 },
    fortnite: { gaming: 3 },

    // Automotive brands
    subaru: { automotive: 3 },
    mitsubishi: { automotive: 3 },
    lexus: { automotive: 3 },
    porsche: { automotive: 3 },
    ferrari: { automotive: 3 },
    lamborghini: { automotive: 3 },
    bentley: { automotive: 3 },
    tesla: { automotive: 3 },
    fiat: { automotive: 3 },
    alfa: { automotive: 3 },
    citroen: { automotive: 3 },
    chevrolet: { automotive: 3 },
    jeep: { automotive: 3 },
    dodge: { automotive: 3 },
    harley: { automotive: 3 },
    kawasaki: { automotive: 3 },
    ducati: { automotive: 3 },
    triumph: { automotive: 3 },
    enfield: { automotive: 3 },

    // Clothing brands
    prada: { clothing: 3 },
    versace: { clothing: 3 },
    armani: { clothing: 3 },
    burberry: { clothing: 3 },
    chanel: { clothing: 3 },
    balenciaga: { clothing: 3 },
    supreme: { clothing: 3 },
    moncler: { clothing: 3 },
    northface: { clothing: 2, sports: 1 },
    patagonia: { clothing: 2, sports: 1 },
    lululemon: { clothing: 2, sports: 2 },
    gymshark: { clothing: 2, sports: 2 },
    fila: { clothing: 2, sports: 1 },
    ellesse: { clothing: 3 },
    lacoste: { clothing: 3 },
    hugo: { clothing: 2 },
    hilfiger: { clothing: 2 },
    dungarees: { clothing: 3 },
    overalls: { clothing: 3 },
    jumpsuit: { clothing: 3 },
    playsuit: { clothing: 3 },
    coord: { clothing: 3 },
    kaftan: { clothing: 3 },
    kimono: { clothing: 3 },
    poncho: { clothing: 3 },
    waistcoat: { clothing: 3 },
    gilet: { clothing: 3 },
    cagoule: { clothing: 3 },
    tracksuit: { clothing: 3 },
    loungewear: { clothing: 3 },
    shapewear: { clothing: 3 },
    catsuit: { clothing: 3 },

    // Footwear brands
    hoka: { footwear: 3 },
    salomon: { footwear: 3, sports: 1 },
    merrell: { footwear: 3 },
    keen: { footwear: 3 },
    louboutin: { footwear: 3 },
    blahnik: { footwear: 3 },
    geox: { footwear: 3 },
    ecco: { footwear: 3 },
    fitflop: { footwear: 3 },

    // Jewellery brands/stones
    tiffany: { jewellery: 3 },
    cartier: { jewellery: 3 },
    pandora: { jewellery: 3 },
    swarovski: { jewellery: 3 },
    diamante: { jewellery: 3 },
    rhinestone: { jewellery: 3 },
    zirconia: { jewellery: 3 },
    opal: { jewellery: 3 },
    topaz: { jewellery: 3 },
    garnet: { jewellery: 3 },
    amethyst: { jewellery: 3 },
    aquamarine: { jewellery: 3 },
    peridot: { jewellery: 3 },
    turquoise: { jewellery: 3 },
    onyx: { jewellery: 3 },
    jade: { jewellery: 3 },
    cameo: { jewellery: 3 },
    filigree: { jewellery: 3 },
    carat: { jewellery: 3 },
    crystal: { jewellery: 2 },

    // Pet brands/products
    hills: { pets: 3 },
    canin: { pets: 3 },
    wellbeloved: { pets: 3 },
    felix: { pets: 3 },
    dreamies: { pets: 3 },
    iams: { pets: 3 },
    eukanuba: { pets: 3 },
    microchip: { pets: 3 },
    fountain: { pets: 3 },
    groomer: { pets: 3 },
    clicker: { pets: 3 },
    agility: { pets: 3 },

    // Baby brands
    graco: { baby: 3 },
    chicco: { baby: 3 },
    bugaboo: { baby: 3 },
    icandy: { baby: 3 },
    britax: { baby: 3 },
    joie: { baby: 3 },
    cosatto: { baby: 3 },
    tommee: { baby: 3 },
    tippee: { baby: 3 },
    avent: { baby: 3 },
    medela: { baby: 3 },
    lansinoh: { baby: 3 },
    muslins: { baby: 3 },
    swaddle: { baby: 3 },
    muslin: { baby: 3 },

    // Toys brands
    hasbro: { toys: 3 },
    mattel: { toys: 3 },
    vtech: { toys: 3 },
    leapfrog: { toys: 3 },
    scalextric: { toys: 3 },
    hornby: { toys: 3 },
    meccano: { toys: 3 },
    brio: { toys: 3 },
    schleich: { toys: 3 },
    sylvanian: { toys: 3 },
    peppa: { toys: 3 },
    bluey: { toys: 3 },
    cocomelon: { toys: 3 },
    spiderman: { toys: 3 },
    batman: { toys: 3 },
    avengers: { toys: 3 },
    disney: { toys: 2, clothing: 0.5 },
    frozen: { toys: 3 },
    funko: { toys: 2, collectibles: 2 },
    warhammer: { collectibles: 3 },
    citadel: { collectibles: 3 },

    // Home products
    chandelier: { home: 3 },
    downlight: { home: 3 },
    spotlight: { home: 3 },
    dimmer: { home: 3 },
    socket: { home: 2, tools: 1 },
    skirting: { home: 3 },
    coving: { home: 3 },
    wallpaper: { home: 3 },
    tile: { home: 3 },
    grout: { home: 3 },
    sealant: { home: 3 },
    caulk: { home: 3 },
    emulsion: { home: 3 },
    varnish: { home: 3 },
    guttering: { home: 3 },
    fascia: { home: 3 },
    ikea: { home: 3 },
    dunelm: { home: 3 },

    // Kitchen brands
    tefal: { kitchen: 3 },
    creuset: { kitchen: 3 },
    denby: { kitchen: 3 },
    pyrex: { kitchen: 3 },
    vitamix: { kitchen: 3 },
    magimix: { kitchen: 3 },
    kenwood: { kitchen: 3 },
    delonghi: { kitchen: 3 },
    smeg: { kitchen: 3 },
    tassimo: { kitchen: 3 },
    keurig: { kitchen: 3 },

    // Sports brands
    myprotein: { sports: 3, health: 1 },
    gatorade: { sports: 3 },
    lucozade: { sports: 3 },
    decathlon: { sports: 3 },
    speedo: { sports: 3 },
    mizuno: { sports: 3, footwear: 1 },
    wilson: { sports: 3 },
    babolat: { sports: 3 },
    yonex: { sports: 3 },
    slazenger: { sports: 3 },
    titleist: { sports: 3 },
    callaway: { sports: 3 },
    taylormade: { sports: 3 },
    everlast: { sports: 3 },
    venum: { sports: 3 },

    // Health brands
    solgar: { health: 3 },
    vitabiotics: { health: 3 },
    wellwoman: { health: 3 },
    wellman: { health: 3 },
    pregnacare: { health: 3 },
    floradix: { health: 3 },
    paracetamol: { health: 3 },
    ibuprofen: { health: 3 },
    strepsils: { health: 3 },
    lemsip: { health: 3 },
    gaviscon: { health: 3 },
    savlon: { health: 3 },

    // Beauty brands
    loreal: { beauty: 3 },
    maybelline: { beauty: 3 },
    rimmel: { beauty: 3 },
    revlon: { beauty: 3 },
    nars: { beauty: 3 },
    morphe: { beauty: 3 },
    cerave: { beauty: 3 },
    neutrogena: { beauty: 3 },
    olay: { beauty: 3 },
    nivea: { beauty: 3 },
    dove: { beauty: 3 },
    garnier: { beauty: 3 },
    bioderma: { beauty: 3 },
    eucerin: { beauty: 3 },
    dyson: { beauty: 2, tools: 1, home: 1 },
    ghd: { beauty: 3 },
    babyliss: { beauty: 3 },
    remington: { beauty: 3 },
    wella: { beauty: 3 },
    tresemme: { beauty: 3 },
    pantene: { beauty: 3 },
    aussie: { beauty: 3 },
    schwarzkopf: { beauty: 3 },

    // Collectibles
    lorcana: { collectibles: 3 },
    digimon: { collectibles: 3 },
    dragonball: { collectibles: 3 },
    gundam: { collectibles: 3 },
    nendoroid: { collectibles: 3 },
    figma: { collectibles: 3 },
    topps: { collectibles: 3 },
    panini: { collectibles: 3 },
    beckett: { collectibles: 3 },
    bgs: { collectibles: 3 },
    cgc: { collectibles: 3 },

    // Music brands
    gibson: { music: 3 },
    fender: { music: 3 },
    martin: { music: 3 },
    taylor: { music: 3 },
    gretsch: { music: 3 },
    epiphone: { music: 3 },
    ibanez: { music: 3 },
    schecter: { music: 3 },
    prs: { music: 3 },
    rickenbacker: { music: 3 },
    telecaster: { music: 3 },
    stratocaster: { music: 3 },
    steinway: { music: 3 },
    kawai: { music: 3 },
    roland: { music: 3 },
    korg: { music: 3 },
    tama: { music: 3 },
    mapex: { music: 3 },
    zildjian: { music: 3 },
    sabian: { music: 3 },
    meinl: { music: 3 },
    orange: { music: 3 },
    vox: { music: 3 },
    ehx: { music: 3 },
    daddario: { music: 3 },
    elixir: { music: 3 },
    rotosound: { music: 3 },
    strat: { music: 3 },
    tele: { music: 3 },
    hihat: { music: 3 },

    // Arts brands
    winsor: { arts: 3 },
    daler: { arts: 3 },
    rowney: { arts: 3 },
    schmincke: { arts: 3 },
    golden: { arts: 3 },
    liquitex: { arts: 3 },
    reeves: { arts: 3 },
    fabriano: { arts: 3 },
    canson: { arts: 3 },
    strathmore: { arts: 3 },
    moleskine: { arts: 3, office: 1 },
    leuchtturm: { arts: 3, office: 1 },
    stabilo: { arts: 3 },
    staedtler: { arts: 3, office: 1 },
    prismacolor: { arts: 3 },
    copic: { arts: 3 },
    promarker: { arts: 3 },
    posca: { arts: 3 },

    // Tools/Garden brands
    husqvarna: { garden: 3 },
    stihl: { garden: 3 },
    mountfield: { garden: 3 },
    flymo: { garden: 3 },
    worx: { tools: 3 },
    silverline: { tools: 3 },
    faithfull: { tools: 3 },
    irwin: { tools: 3 },
    bahco: { tools: 3 },
    knipex: { tools: 3 },
    wera: { tools: 3 },
    festool: { tools: 3 },
    metabo: { tools: 3 },
    hikoki: { tools: 3 },
    einhell: { tools: 3 },
    draper: { tools: 3 },

    // Travel brands
    samsonite: { travel: 3 },
    rimowa: { travel: 3 },
    antler: { travel: 3 },
    osprey: { travel: 3, sports: 1 },
    deuter: { travel: 3 },
    berghaus: { travel: 3 },
    arcteryx: { travel: 3, sports: 1 },
    rab: { travel: 3, sports: 1 },
    montane: { travel: 3 },

    // Fishing brands
    daiwa: { fishing: 3 },
    shimano: { fishing: 3, cycling: 1 },
    penn: { fishing: 3 },
    okuma: { fishing: 3 },
    greys: { fishing: 3 },
    korda: { fishing: 3 },
    trakker: { fishing: 3 },
    wychwood: { fishing: 3 },
    avid: { fishing: 3 },
    groundbait: { fishing: 3 },
    maggot: { fishing: 3 },
    pellet: { fishing: 3 },

    // Cycling brands
    specialized: { cycling: 3 },
    trek: { cycling: 3 },
    giant: { cycling: 3 },
    cannondale: { cycling: 3 },
    bianchi: { cycling: 3 },
    colnago: { cycling: 3 },
    cervelo: { cycling: 3 },
    orbea: { cycling: 3 },
    rapha: { cycling: 3 },
    castelli: { cycling: 3 },
    campagnolo: { cycling: 3 },
    sram: { cycling: 3 },
    mavic: { cycling: 3 },
    zipp: { cycling: 3 },
    bontrager: { cycling: 3 },
    fizik: { cycling: 3 },

    // Digital/Software
    antivirus: { digital: 3 },
    vpn: { digital: 3 },
    microsoft: { digital: 3, computing: 1 },
    windows: { digital: 3, computing: 1 },
    adobe: { digital: 3 },
    photoshop: { digital: 3 },
    norton: { digital: 3 },
    kaspersky: { digital: 3 },
    mcafee: { digital: 3 },
    bitdefender: { digital: 3 },

    // Party/seasonal
    advent: { party: 3 },
    wreath: { party: 2, home: 1 },
    tinsel: { party: 3 },
    bauble: { party: 3 },
    cracker: { party: 3 },

    imac: { computing: 3 },

    kitten: { pets: 3, footwear: 1 },

    figurine: { toys: 2, collectibles: 2 },

    oximeter: { health: 3 },

    toner: { office: 3, beauty: 1 },

    polish: { automotive: 2, beauty: 1 },

    ephemera: { collectibles: 3 },

    planner: { office: 3, books: 1 },

    shredder: { office: 3, garden: 1 },

    whiteboard: { office: 3 },

    laminator: { office: 3 },

    envelope: { office: 3 },

    // ══ FINAL COMPREHENSIVE ADDITIONS

    // ══ FOOD & DRINK (comprehensive) ══════════════════════════════════════════
    whiskey: { food: 3 },
    bourbon: { food: 3 },
    cognac: { food: 3 },
    brandy: { food: 3 },
    prosecco: { food: 3 },
    champagne: { food: 3 },
    lager: { food: 3 },
    ale: { food: 3 },
    stout: { food: 3 },
    cider: { food: 3 },
    mead: { food: 3 },
    sake: { food: 3 },
    tequila: { food: 3 },
    mezcal: { food: 3 },
    liqueur: { food: 3 },
    amaretto: { food: 3 },
    espresso: { food: 3, kitchen: 1 },
    latte: { food: 3 },
    cappuccino: { food: 3 },
    matcha: { food: 3 },
    chai: { food: 3 },
    camomile: { food: 3 },
    rooibos: { food: 3 },
    cocoa: { food: 3 },
    cacao: { food: 3 },
    truffle: { food: 3 },
    fudge: { food: 3 },
    toffee: { food: 3 },
    nougat: { food: 3 },
    shortbread: { food: 3 },
    cookie: { food: 3 },
    brownie: { food: 3 },
    muffin: { food: 3 },
    cupcake: { food: 3 },
    macaroon: { food: 3 },
    macaron: { food: 3 },
    eclair: { food: 3 },
    croissant: { food: 3 },
    brioche: { food: 3 },
    sourdough: { food: 3 },
    granola: { food: 3 },
    muesli: { food: 3 },
    porridge: { food: 3 },
    marmalade: { food: 3 },
    chutney: { food: 3 },
    pickle: { food: 3 },
    condiment: { food: 3 },
    ketchup: { food: 3 },
    mustard: { food: 3 },
    mayonnaise: { food: 3 },
    pesto: { food: 3 },
    hummus: { food: 3 },
    tahini: { food: 3 },
    marinade: { food: 3 },
    bouillon: { food: 3 },
    pasta: { food: 3 },
    noodle: { food: 3 },
    quinoa: { food: 3 },
    yeast: { food: 3 },
    popcorn: { food: 3 },
    pretzel: { food: 3 },
    almond: { food: 3 },
    cashew: { food: 3 },
    walnut: { food: 3 },
    hamper: { food: 3 },
    vegan: { food: 2, health: 1 },
    organic: { food: 2, garden: 1 },

    // ══ PARTY (comprehensive) ══════════════════════════════════════════════════
    napkin: { party: 3 },
    tableware: { party: 3 },
    poppers: { party: 3 },
    sparkler: { party: 3 },
    piñata: { party: 3 },
    pinata: { party: 3 },
    lootbag: { party: 3 },
    goodybag: { party: 3 },
    helium: { party: 3 },
    mylar: { party: 3 },
    photobooth: { party: 3 },
    invitation: { party: 3 },
    invitations: { party: 3 },
    bunting: { party: 3 },
    ribbon: { party: 2, arts: 1 },
    gifttag: { party: 3 },
    giftbag: { party: 3 },

    // ══ DIGITAL (comprehensive) ════════════════════════════════════════════════
    origin: { digital: 3 },
    ubisoft: { digital: 3 },
    spotify: { digital: 3 },
    netflix: { digital: 3 },
    audible: { digital: 3 },
    itunes: { digital: 3 },
    googleplay: { digital: 3 },
    psstore: { digital: 3 },
    xboxlive: { digital: 3 },
    canva: { digital: 3 },
    notion: { digital: 3 },
    dropbox: { digital: 3 },
    onedrive: { digital: 3 },
    icloud: { digital: 3 },
    webhosting: { digital: 3 },
    domain: { digital: 3 },
    wordpress: { digital: 3 },
    shopify: { digital: 3 },
    wix: { digital: 3 },
    mailchimp: { digital: 3 },

    // ══ TRAVEL (comprehensive) ═════════════════════════════════════════════════
    trolley: { travel: 3 },
    holdall: { travel: 3, fishing: 1 },
    duffel: { travel: 3 },
    weekender: { travel: 3 },
    tote: { travel: 2 },
    messenger: { travel: 3 },
    crossbody: { travel: 3 },
    bumbag: { travel: 3 },
    packable: { travel: 3 },
    daypack: { travel: 3 },
    rucksack: { travel: 3 },
    hydration: { travel: 3, sports: 1 },
    padlock: { travel: 3 },
    mosquito: { travel: 3 },
    repellent: { travel: 3 },
    headtorch: { travel: 3, sports: 1 },
    lantern: { travel: 3, garden: 1 },
    multitool: { travel: 3, tools: 1 },
    firestarter: { travel: 3 },
    compass: { travel: 3 },
    drybag: { travel: 3, sports: 1 },
    packingcube: { travel: 3 },

    // ══ ARTS & CRAFTS (comprehensive) ═════════════════════════════════════════
    glitter: { arts: 3 },
    sequin: { arts: 3 },
    twine: { arts: 3 },
    beads: { arts: 3 },
    bead: { arts: 3 },
    leathercraft: { arts: 3 },
    bookbinding: { arts: 3 },
    linocut: { arts: 3 },
    lino: { arts: 3 },
    woodcut: { arts: 3 },
    etching: { arts: 3 },
    printmaking: { arts: 3 },
    screenprint: { arts: 3 },
    batik: { arts: 3 },
    tiedye: { arts: 3 },
    shibori: { arts: 3 },
    felting: { arts: 3 },
    macrame: { arts: 3 },
    weaving: { arts: 3 },
    tapestry: { arts: 3 },
    origami: { arts: 3 },
    quilling: { arts: 3 },
    decoupage: { arts: 3 },
    papermache: { arts: 3 },
    candlemaking: { arts: 3 },
    soapmaking: { arts: 3 },
    bathbomb: { arts: 3 },
    pouring: { arts: 3 },
    airdry: { arts: 3 },
    fimo: { arts: 3 },
    sculpey: { arts: 3 },
    polymer: { arts: 3 },
    woodburning: { arts: 3 },
    pyrography: { arts: 3 },
    stencil: { arts: 3 },
    emboss: { arts: 3 },
    sublimation: { arts: 3 },
    heatpress: { arts: 3 },
    htv: { arts: 3 },
    plotter: { arts: 3 },

    // ══ BOOKS & MEDIA (comprehensive) ═════════════════════════════════════════
    dvd: { books: 3 },
    bluray: { books: 3 },
    cd: { books: 3, music: 1 },
    vhs: { books: 3 },
    magazine: { books: 3, collectibles: 1 },
    newspaper: { books: 3, collectibles: 1 },
    graphic: { books: 2, arts: 1 },
    softback: { books: 3 },
    revision: { books: 3 },
    recipe: { books: 3 },
    atlas: { books: 3 },
    encyclopedia: { books: 3 },
    encyclopaedia: { books: 3 },
    poetry: { books: 3 },
    anthology: { books: 3 },
    memoir: { books: 3 },
    thriller: { books: 3 },
    mystery: { books: 3 },
    horror: { books: 3 },
    romance: { books: 3 },
    fantasy: { books: 3 },
    scifi: { books: 3 },
    western: { books: 3 },
    crime: { books: 3 },
    detective: { books: 3 },
    childrens: { books: 3, toys: 1 },
    activity: { books: 2, toys: 1 },

    // ══ EQUESTRIAN (comprehensive) ════════════════════════════════════════════
    weatherbeeta: { equestrian: 3 },
    rambo: { equestrian: 3 },
    amigo: { equestrian: 3 },
    horseware: { equestrian: 3 },
    shires: { equestrian: 3 },
    lemieux: { equestrian: 3 },
    wintec: { equestrian: 3 },
    numnah: { equestrian: 3 },
    saddlepad: { equestrian: 3 },
    breastplate: { equestrian: 3 },
    martingale: { equestrian: 3 },
    browband: { equestrian: 3 },
    noseband: { equestrian: 3 },
    crownpiece: { equestrian: 3 },
    reins: { equestrian: 3 },
    leadrope: { equestrian: 3 },
    lunge: { equestrian: 3 },
    lungeing: { equestrian: 3 },
    hoofpick: { equestrian: 3 },
    tendon: { equestrian: 3 },
    overreach: { equestrian: 3 },
    haynet: { equestrian: 3 },

    // ══ FISHING (comprehensive) ════════════════════════════════════════════════
    bankstick: { fishing: 3 },
    buzzer: { fishing: 3 },
    swinger: { fishing: 3 },
    indicator: { fishing: 3 },
    hooklink: { fishing: 3 },
    forceps: { fishing: 3 },
    disgorger: { fishing: 3 },
    catapult: { fishing: 3 },
    baitboat: { fishing: 3 },
    fishfinder: { fishing: 3 },
    waders: { fishing: 3 },
    catfish: { fishing: 3 },
    pike: { fishing: 3 },
    trout: { fishing: 3 },
    salmon: { fishing: 3 },
    flytying: { fishing: 3 },
    dubbing: { fishing: 3 },

    // ══ CYCLING (comprehensive) ════════════════════════════════════════════════
    innertube: { cycling: 3 },
    bikepatch: { cycling: 3 },
    chainlube: { cycling: 3 },
    degreaser: { cycling: 3 },
    crankset: { cycling: 3 },
    bib: { cycling: 3 },
    overshoe: { cycling: 3 },
    garmin: { cycling: 3 },
    zwift: { cycling: 3 },
    wahoo: { cycling: 3 },
    tacx: { cycling: 3 },
    turbotrainer: { cycling: 3 },

    // ══ HEALTH (comprehensive) ════════════════════════════════════════════════
    kinesiology: { health: 3 },
    theragun: { health: 3 },
    hypervolt: { health: 3 },
    massagegun: { health: 3 },
    lumbar: { health: 3 },
    cervical: { health: 3 },
    orthotics: { health: 3 },
    bunion: { health: 3 },
    callus: { health: 3 },
    verruca: { health: 3 },
    niacinamide: { health: 3 },
    zinc: { health: 3 },
    magnesium: { health: 3 },
    calcium: { health: 3 },
    folate: { health: 3 },
    folic: { health: 3 },
    probiotics: { health: 3 },
    prebiotics: { health: 3 },
    turmeric: { health: 3 },
    ashwagandha: { health: 3 },
    spirulina: { health: 3 },
    chlorella: { health: 3 },
    glucosamine: { health: 3 },
    chondroitin: { health: 3 },
    krill: { health: 3 },
    defibrillator: { health: 3 },

    // Electronics products
    television: { electronics: 3 },
    tv: { electronics: 3 },
    firestick: { electronics: 3 },
    chromecast: { electronics: 3 },
    freeview: { electronics: 3 },
    freesat: { electronics: 3 },
    skybox: { electronics: 3 },
    intercom: { electronics: 3 },
    doorbell: { electronics: 3 },
    alarm: { electronics: 2 },
    thermostat: { electronics: 3 },
    smarthome: { electronics: 3 },
    alexa: { electronics: 3 },
    echo: { electronics: 2 },
    nest: { electronics: 3 },
    hive: { electronics: 3 },
    tado: { electronics: 3 },
    arlo: { electronics: 3 },
    blink: { electronics: 3 },
    solarpanel: { electronics: 3 },

    // Computing extras
    macmini: { computing: 3 },
    ipad: { computing: 3 },
    wacom: { computing: 3 },
    nas: { computing: 3 },
    synology: { computing: 3 },
    qnap: { computing: 3 },
    raspberry: { computing: 3 },
    arduino: { computing: 3 },
    microbit: { computing: 3 },

    // Gaming extras
    n64: { gaming: 3 },
    snes: { gaming: 3 },
    nes: { gaming: 3 },
    ps2: { gaming: 3 },
    ps1: { gaming: 3 },
    psp: { gaming: 3 },
    gba: { gaming: 3 },
    gbc: { gaming: 3 },
    wiiu: { gaming: 3 },
    steamdeck: { gaming: 3 },
    amiibo: { gaming: 3 },
    arcade: { gaming: 3 },
    retropie: { gaming: 3 },

    // Photography extras
    leica: { photography: 3 },
    hasselblad: { photography: 3 },
    pentax: { photography: 3 },
    sigma: { photography: 3 },
    tamron: { photography: 3 },
    tokina: { photography: 3 },
    godox: { photography: 3 },
    profoto: { photography: 3 },
    manfrotto: { photography: 3 },
    benro: { photography: 3 },
    joby: { photography: 3 },
    dji: { photography: 3 },
    drone: { photography: 3 },
    polaroid: { photography: 3 },
    instax: { photography: 3 },
    shutter: { photography: 2 },
    intervalometer: { photography: 3 },

    // Automotive products
    jumpstarter: { automotive: 3 },
    compressor: { automotive: 3 },
    inflator: { automotive: 3 },
    wax: { automotive: 2 },
    detailing: { automotive: 3 },
    chamois: { automotive: 3 },
    towbar: { automotive: 3 },
    towball: { automotive: 3 },
    trailer: { automotive: 3 },
    caravan: { automotive: 3 },
    motorhome: { automotive: 3 },
    sparkplug: { automotive: 3 },
    airfilter: { automotive: 3 },
    oilfilter: { automotive: 3 },
    cambelt: { automotive: 3 },
    absorber: { automotive: 3 },
    caliper: { automotive: 3 },
    headlight: { automotive: 3 },
    taillight: { automotive: 3 },
    foglamp: { automotive: 3 },

    // Clothing items
    pullover: { clothing: 3 },
    turtleneck: { clothing: 3 },
    crewneck: { clothing: 3 },
    vneck: { clothing: 3 },
    henley: { clothing: 3 },
    longline: { clothing: 3 },
    skort: { clothing: 3 },
    culottes: { clothing: 3 },
    palazzos: { clothing: 3 },
    harem: { clothing: 3 },
    capri: { clothing: 3 },
    cargo: { clothing: 3 },
    chino: { clothing: 3 },
    bootcut: { clothing: 3 },
    corduroy: { clothing: 3 },
    tweed: { clothing: 3 },
    chiffon: { clothing: 3 },
    crepe: { clothing: 3 },
    jersey: { clothing: 3 },
    windbreaker: { clothing: 3 },
    softshell: { clothing: 3 },
    hardshell: { clothing: 3 },
    negligee: { clothing: 3 },
    camisole: { clothing: 3 },
    stocking: { clothing: 3 },
    suspender: { clothing: 3 },
    corset: { clothing: 3 },
    bustier: { clothing: 3 },
    halterneck: { clothing: 3 },
    bandeau: { clothing: 3 },
    strapless: { clothing: 3 },

    // Footwear types
    derby: { footwear: 3 },
    oxford: { footwear: 3 },
    monk: { footwear: 3 },
    chelsea: { footwear: 3 },
    chukka: { footwear: 3 },
    desert: { footwear: 3 },
    platform: { footwear: 3 },
    stiletto: { footwear: 3 },
    peeptoe: { footwear: 3 },
    slingback: { footwear: 3 },
    mule: { footwear: 3 },
    rigger: { footwear: 3 },
    workboot: { footwear: 3 },
    toecap: { footwear: 3 },

    // Home items
    sideboard: { home: 3 },
    dresser: { home: 3 },
    bookcase: { home: 3 },
    bookshelf: { home: 3 },
    shelving: { home: 3 },
    ottoman: { home: 3 },
    pouffe: { home: 3 },
    footstool: { home: 3 },
    beanbag: { home: 3 },
    futon: { home: 3 },
    sofabed: { home: 3 },
    daybed: { home: 3 },
    headboard: { home: 3 },
    bedframe: { home: 3 },
    divan: { home: 3 },
    bunkbed: { home: 3 },
    highsleeper: { home: 3 },
    vanity: { home: 3 },
    basin: { home: 3 },
    bathtub: { home: 3 },
    enclosure: { home: 3 },
    towelrail: { home: 3 },
    stove: { home: 3 },
    fireplace: { home: 3 },
    mantelpiece: { home: 3 },
    fireguard: { home: 3 },
    artwork: { home: 2 },
    succulent: { home: 3 },
    cactus: { home: 3 },
    bonsai: { home: 3 },
    terrarium: { home: 3 },

    // Kitchen items
    ricecooker: { kitchen: 3 },
    steamer: { kitchen: 3 },
    deepfryer: { kitchen: 3 },
    nutribullet: { kitchen: 3 },
    spiralizer: { kitchen: 3 },
    mandoline: { kitchen: 3 },
    aeropress: { kitchen: 3 },
    chemex: { kitchen: 3 },
    portafilter: { kitchen: 3 },
    tamper: { kitchen: 3 },
    burr: { kitchen: 3 },
    decanter: { kitchen: 3 },
    carafe: { kitchen: 3 },
    pitcher: { kitchen: 3 },
    frenchpress: { kitchen: 3 },

    // Garden items
    secateurs: { garden: 3 },
    loppers: { garden: 3 },
    shears: { garden: 3 },
    pruner: { garden: 3 },
    cultivator: { garden: 3 },
    aerator: { garden: 3 },
    scarifier: { garden: 3 },
    dethatcher: { garden: 3 },
    edger: { garden: 3 },
    tiller: { garden: 3 },
    rotavator: { garden: 3 },
    chipper: { garden: 3 },
    composter: { garden: 3 },
    waterbutt: { garden: 3 },
    growbag: { garden: 3 },
    growhouse: { garden: 3 },
    cloche: { garden: 3 },
    chiminea: { garden: 3 },
    firepit: { garden: 3 },
    barbecue: { garden: 3 },
    bbq: { garden: 3 },
    smoker: { garden: 3 },
    parasol: { garden: 3 },
    awning: { garden: 3 },
    trampoline: { garden: 3, sports: 1 },
    sandpit: { garden: 3 },

    // Sports items
    stump: { sports: 3 },
    handball: { sports: 3 },
    lacrosse: { sports: 3 },
    hurling: { sports: 3 },
    rounders: { sports: 3 },
    softball: { sports: 3 },
    baseball: { sports: 3 },
    fencing: { sports: 3 },
    epee: { sports: 3 },
    foil: { sports: 3 },
    sabre: { sports: 3 },
    gymnastics: { sports: 3 },
    pommel: { sports: 3 },
    kayak: { sports: 3 },
    canoe: { sports: 3 },
    paddle: { sports: 3 },
    oar: { sports: 3 },
    windsurfing: { sports: 3 },
    kitesurfing: { sports: 3 },
    wakeboard: { sports: 3 },
    scuba: { sports: 3 },
    snorkel: { sports: 3 },
    wetsuit: { sports: 3 },
    flippers: { sports: 3 },
    dartboard: { sports: 3 },
    darts: { sports: 3 },
    snooker: { sports: 3 },
    billiards: { sports: 3 },
    cue: { sports: 3 },
    bowls: { sports: 3 },
    croquet: { sports: 3 },
    quadskate: { sports: 3 },
    rollerskate: { sports: 3 },

    // Health items
    rollator: { health: 3 },
    crutches: { health: 3 },
    zimmer: { health: 3 },
    grabber: { health: 3 },
    reacher: { health: 3 },
    stairlift: { health: 3 },
    incontinence: { health: 3 },
    fertility: { health: 3 },
    ovulation: { health: 3 },
    pregnancy: { health: 3 },
    acupuncture: { health: 3 },
    acupressure: { health: 3 },
    inhaler: { health: 3 },
    spacer: { health: 3 },
    colostomy: { health: 3 },
    stoma: { health: 3 },
    catheter: { health: 3 },
    cannula: { health: 3 },
    nebulizer: { health: 3 },

    // Beauty items
    micellar: { beauty: 3 },
    mist: { beauty: 3 },
    essence: { beauty: 3 },
    ampoule: { beauty: 3 },
    exfoliant: { beauty: 3 },
    scrub: { beauty: 3 },
    spoolie: { beauty: 3 },
    lashcurler: { beauty: 3 },
    eyebrow: { beauty: 3 },
    pomade: { beauty: 3 },
    lamination: { beauty: 3 },
    plumper: { beauty: 3 },
    translucent: { beauty: 3 },
    guasha: { beauty: 3 },
    dermaroller: { beauty: 3 },
    microneedle: { beauty: 3 },
    cavitation: { beauty: 3 },
    hifu: { beauty: 3 },
    ipl: { beauty: 3 },
    electrolysis: { beauty: 3 },
    shellac: { beauty: 3 },
    cuticle: { beauty: 3 },
    nipper: { beauty: 3 },
    buffer: { beauty: 3 },

    // Music items
    whammy: { music: 3 },
    tremolo: { music: 3 },
    pickguard: { music: 3 },
    pickup: { music: 3 },
    humbucker: { music: 3 },
    singlecoil: { music: 3 },
    fretboard: { music: 3 },
    fret: { music: 3 },
    trussrod: { music: 3 },
    pedalboard: { music: 3 },
    oboe: { music: 3 },
    clarinet: { music: 3 },
    bassoon: { music: 3 },
    trombone: { music: 3 },
    tuba: { music: 3 },
    euphonium: { music: 3 },
    flugelhorn: { music: 3 },
    cornet: { music: 3 },
    viola: { music: 3 },
    harp: { music: 3 },
    lute: { music: 3 },
    sitar: { music: 3 },
    accordion: { music: 3 },
    concertina: { music: 3 },
    melodica: { music: 3 },
    xylophone: { music: 3 },
    marimba: { music: 3 },
    vibraphone: { music: 3 },
    glockenspiel: { music: 3 },
    timpani: { music: 3 },
    bongo: { music: 3 },
    conga: { music: 3 },
    djembe: { music: 3 },
    tabla: { music: 3 },

    // Collectibles items
    cigarettecard: { collectibles: 3 },
    matchbox: { collectibles: 3 },
    dinky: { collectibles: 3 },
    corgi: { collectibles: 3 },
    britains: { collectibles: 3 },
    breweriana: { collectibles: 3 },
    railwayana: { collectibles: 3 },
    militaria: { collectibles: 3 },
    thimble: { collectibles: 3 },
    programme: { collectibles: 3 },

    // Office/stationery
    calendar: { office: 3 },
    ringbinder: { office: 3 },
    leverarch: { office: 3 },
    clipboard: { office: 3 },
    wristrest: { office: 3 },
    footrest: { office: 3 },
    deskpad: { office: 3 },
    deskmat: { office: 3 },
    cartridge: { office: 3 },
    jiffy: { office: 3 },
    sellotape: { office: 3 },
    bulldogclip: { office: 3 },
    drawingpin: { office: 3 },
    eraser: { office: 3 },
    correction: { office: 3 },
    flipchart: { office: 3 },
}

// ── Subcategory mapping ────────────────────────────────────────────────────────
// ── Subcategory mapping ────────────────────────────────────────────────────────
// Maps specific words → subcategory within their parent category
// This teaches the engine: ring light = photography (not just electronics)
// Format: { parentCategory: { triggerWord: 'subcategory-name' } }
// Subcategory names use kebab-case for consistency
const SUBCATEGORY_MAP: Partial<Record<Category, Record<string, string>>> = {

    // ── ELECTRONICS ────────────────────────────────────────────────────────────
    electronics: {
        // Phones
        iphone: 'smartphones', samsung: 'smartphones', huawei: 'smartphones',
        oneplus: 'smartphones', xiaomi: 'smartphones', pixel: 'smartphones',
        motorola: 'smartphones', nokia: 'smartphones', oppo: 'smartphones',
        smartphone: 'smartphones', mobile: 'smartphones', phone: 'smartphones',
        // Tablets
        ipad: 'tablets', tablet: 'tablets', surface: 'tablets',
        // TV & Display
        television: 'tv-display', tv: 'tv-display', smarttv: 'tv-display',
        oled: 'tv-display', qled: 'tv-display', monitor: 'tv-display',
        projector: 'tv-display', screen: 'tv-display',
        // Phone accessories
        charger: 'phone-accessories', cable: 'phone-accessories',
        case: 'phone-accessories', powerbank: 'phone-accessories',
        magsafe: 'phone-accessories', protector: 'phone-accessories',
        cover: 'phone-accessories', lightning: 'phone-accessories',
        // Smart home
        alexa: 'smart-home', echo: 'smart-home', nest: 'smart-home',
        hive: 'smart-home', tado: 'smart-home', smarthome: 'smart-home',
        thermostat: 'smart-home', doorbell: 'smart-home', arlo: 'smart-home',
        blink: 'smart-home', ring: 'smart-home',
        // Networking
        router: 'networking', modem: 'networking', ethernet: 'networking',
        wifi: 'networking', hub: 'networking', switch: 'networking',
        // Wearables
        smartwatch: 'wearables', watch: 'wearables', fitbit: 'wearables',
        garmin: 'wearables', apple: 'wearables',
    },

    // ── COMPUTING ──────────────────────────────────────────────────────────────
    computing: {
        // Laptops
        laptop: 'laptops', macbook: 'laptops', chromebook: 'laptops',
        notebook: 'laptops', thinkpad: 'laptops',
        // Desktops
        desktop: 'desktops', imac: 'desktops', macmini: 'desktops', tower: 'desktops',
        // Components
        gpu: 'components', cpu: 'components', ram: 'components',
        motherboard: 'components', nvme: 'components',
        pcie: 'components', ddr: 'components',
        // Storage
        drive: 'storage', hdd: 'storage', ssd: 'storage',
        // Peripherals
        keyboard: 'peripherals', mouse: 'peripherals', webcam: 'peripherals',
        headset: 'peripherals', monitor: 'peripherals',
        // Printing
        printer: 'printing', scanner: 'printing', ink: 'printing',
        cartridge: 'printing', toner: 'printing',
        // Networking
        nas: 'networking', synology: 'networking', raspberry: 'diy-computing',
        arduino: 'diy-computing', microbit: 'diy-computing',
    },

    // ── GAMING ─────────────────────────────────────────────────────────────────
    gaming: {
        // Consoles
        playstation: 'console', ps5: 'console', ps4: 'console', ps3: 'console',
        xbox: 'console', nintendo: 'console', switch: 'console', wii: 'console',
        dreamcast: 'retro-gaming', atari: 'retro-gaming', sega: 'retro-gaming',
        n64: 'retro-gaming', snes: 'retro-gaming', nes: 'retro-gaming',
        // Handheld
        psp: 'handheld', gba: 'handheld', gbc: 'handheld', gameboy: 'handheld',
        // PC gaming
        steam: 'pc-gaming', steamdeck: 'pc-gaming', gaming: 'pc-gaming',
        // Accessories
        controller: 'gaming-accessories', headset: 'gaming-accessories',
        joystick: 'gaming-accessories', gamepad: 'gaming-accessories',
        // VR
        vr: 'virtual-reality', oculus: 'virtual-reality', quest: 'virtual-reality',
        // Collectibles
        amiibo: 'gaming-collectibles', pokemon: 'gaming-collectibles',
        yugioh: 'gaming-collectibles', lorcana: 'gaming-collectibles',
    },

    // ── PHOTOGRAPHY ────────────────────────────────────────────────────────────
    photography: {
        // Cameras
        dslr: 'cameras', mirrorless: 'cameras', camera: 'cameras',
        canon: 'cameras', nikon: 'cameras', sony: 'cameras',
        fujifilm: 'cameras', leica: 'cameras', olympus: 'cameras',
        polaroid: 'instant-cameras', instax: 'instant-cameras',
        // Action & drone
        gopro: 'action-cameras', drone: 'drones', dji: 'drones', fpv: 'drones',
        // Lenses
        lens: 'lenses', sigma: 'lenses', tamron: 'lenses', tokina: 'lenses',
        // Lighting — key case: ring light → photography NOT electronics
        ringlight: 'studio-lighting', ring: 'studio-lighting',
        godox: 'studio-lighting', profoto: 'studio-lighting',
        flash: 'studio-lighting', strobe: 'studio-lighting',
        softbox: 'studio-lighting', lightbox: 'studio-lighting',
        backdrop: 'studio-lighting', studio: 'studio-lighting',
        led: 'studio-lighting', continuous: 'studio-lighting',
        panel: 'studio-lighting', octabox: 'studio-lighting',
        // Support
        tripod: 'camera-support', monopod: 'camera-support',
        gimbal: 'camera-support', stabiliser: 'camera-support',
        manfrotto: 'camera-support', benro: 'camera-support',
        // Instant/film
        film: 'film-photography', darkroom: 'film-photography',
    },

    // ── AUDIO ──────────────────────────────────────────────────────────────────
    audio: {
        // Headphones
        headphones: 'headphones', earbuds: 'headphones', earphones: 'headphones',
        airpods: 'headphones', beats: 'headphones', sennheiser: 'headphones',
        // Speakers
        speaker: 'speakers', soundbar: 'speakers', subwoofer: 'speakers',
        jbl: 'speakers', bose: 'speakers', sonos: 'speakers',
        // Hi-Fi
        amplifier: 'hifi', receiver: 'hifi', preamp: 'hifi',
        turntable: 'hifi', vinyl: 'hifi', hifi: 'hifi',
        nad: 'hifi', marantz: 'hifi', denon: 'hifi',
        // Recording
        microphone: 'recording', condenser: 'recording', dynamic: 'recording',
        interface: 'recording', audio: 'recording',
    },

    // ── AUTOMOTIVE ─────────────────────────────────────────────────────────────
    automotive: {
        // Parts
        engine: 'car-parts', gearbox: 'car-parts', clutch: 'car-parts',
        brake: 'car-parts', suspension: 'car-parts', alternator: 'car-parts',
        radiator: 'car-parts', exhaust: 'car-parts', turbo: 'car-parts',
        cambelt: 'car-parts', sparkplug: 'car-parts',
        // Tyres & wheels
        tyre: 'tyres-wheels', tire: 'tyres-wheels', wheel: 'tyres-wheels',
        rim: 'tyres-wheels', alloy: 'tyres-wheels',
        // Accessories
        dashcam: 'car-accessories', satnav: 'car-accessories',
        carmat: 'car-accessories', seatcover: 'car-accessories',
        // Detailing
        polish: 'car-care', wax: 'car-care', detailing: 'car-care',
        chamois: 'car-care', ceramic: 'car-care',
        // Motorcycles
        motorbike: 'motorcycles', motorcycle: 'motorcycles',
        moped: 'motorcycles', harley: 'motorcycles', kawasaki: 'motorcycles',
        ducati: 'motorcycles', triumph: 'motorcycles',
        // Caravans
        caravan: 'caravans', motorhome: 'caravans', campervan: 'caravans',
        // Lighting
        headlight: 'car-lighting', taillight: 'car-lighting', foglamp: 'car-lighting',
    },

    // ── CLOTHING ───────────────────────────────────────────────────────────────
    clothing: {
        // Tops
        shirt: 'tops', tshirt: 'tops', hoodie: 'tops', jumper: 'tops',
        sweatshirt: 'tops', blouse: 'tops', polo: 'tops', vest: 'tops',
        cardigan: 'tops', turtleneck: 'tops', crewneck: 'tops',
        // Bottoms
        jeans: 'bottoms', trousers: 'bottoms', shorts: 'bottoms',
        leggings: 'bottoms', joggers: 'bottoms', chinos: 'bottoms',
        skirt: 'bottoms', culottes: 'bottoms',
        // Dresses & jumpsuits
        dress: 'dresses', jumpsuit: 'dresses', playsuit: 'dresses',
        // Outerwear
        jacket: 'outerwear', coat: 'outerwear', puffer: 'outerwear',
        parka: 'outerwear', anorak: 'outerwear', mac: 'outerwear',
        windbreaker: 'outerwear', fleece: 'outerwear', gilet: 'outerwear',
        // Underwear & nightwear
        bra: 'underwear', underwear: 'underwear', boxers: 'underwear',
        briefs: 'underwear', knickers: 'underwear', thong: 'underwear',
        pyjamas: 'nightwear', robe: 'nightwear', nightdress: 'nightwear',
        // Swimwear
        swimsuit: 'swimwear', bikini: 'swimwear', trunks: 'swimwear',
        // Suits & formal
        suit: 'formal', blazer: 'formal', waistcoat: 'formal',
        // Sportswear
        nike: 'sportswear', adidas: 'sportswear', gymshark: 'sportswear',
        lululemon: 'sportswear', tracksuit: 'sportswear',
        // Accessories
        scarf: 'accessories', hat: 'accessories', beanie: 'accessories',
        gloves: 'accessories', belt: 'accessories',
        // Socks & tights
        socks: 'hosiery', tights: 'hosiery',
    },

    // ── FOOTWEAR ───────────────────────────────────────────────────────────────
    footwear: {
        // Trainers/sneakers
        trainers: 'trainers', sneakers: 'trainers', airforce: 'trainers',
        airjordan: 'trainers', yeezy: 'trainers', converse: 'trainers',
        nike: 'trainers', adidas: 'trainers', vans: 'trainers',
        // Boots
        boots: 'boots', chelsea: 'boots', desert: 'boots',
        chukka: 'boots', ankle: 'boots', knee: 'boots',
        ugg: 'boots', timberland: 'boots',
        // Formal shoes
        oxford: 'formal-shoes', derby: 'formal-shoes', brogues: 'formal-shoes',
        loafers: 'formal-shoes', monk: 'formal-shoes',
        // Heels
        heels: 'heels', stiletto: 'heels', wedges: 'heels',
        platform: 'heels', peeptoe: 'heels', kitten: 'heels',
        // Casual
        sandals: 'sandals', slippers: 'slippers', flipflops: 'sandals',
        mule: 'sandals', espadrilles: 'sandals',
        crocs: 'casual', moccasins: 'casual', clogs: 'casual',
        // Sports
        running: 'sports-shoes', hoka: 'sports-shoes', asics: 'sports-shoes',
        brooks: 'sports-shoes', mizuno: 'sports-shoes',
        // Safety
        safety: 'safety-footwear', steel: 'safety-footwear', rigger: 'safety-footwear',
        // Kids
        wellies: 'boots',
    },

    // ── JEWELLERY ──────────────────────────────────────────────────────────────
    jewellery: {
        // Types
        ring: 'rings', signet: 'rings', engagement: 'rings', wedding: 'rings',
        necklace: 'necklaces', chain: 'necklaces', pendant: 'necklaces',
        choker: 'necklaces', locket: 'necklaces',
        bracelet: 'bracelets', bangle: 'bracelets', anklet: 'bracelets',
        earring: 'earrings', stud: 'earrings', hoop: 'earrings',
        brooch: 'brooches', cufflinks: 'cufflinks',
        // Materials
        diamond: 'fine-jewellery', gold: 'fine-jewellery', platinum: 'fine-jewellery',
        silver: 'silver-jewellery', sterling: 'silver-jewellery',
        // Brands
        pandora: 'branded-jewellery', tiffany: 'branded-jewellery',
        swarovski: 'crystal-jewellery', crystal: 'crystal-jewellery',
        // Stones
        sapphire: 'gemstone', ruby: 'gemstone', emerald: 'gemstone',
        opal: 'gemstone', topaz: 'gemstone', amethyst: 'gemstone',
    },

    // ── PETS ───────────────────────────────────────────────────────────────────
    pets: {
        // Dogs
        dog: 'dogs', puppy: 'dogs', lead: 'dogs', collar: 'dogs',
        harness: 'dogs', kennel: 'dogs', muzzle: 'dogs',
        pedigree: 'dog-food', chappie: 'dog-food', butchers: 'dog-food',
        // Cats
        cat: 'cats', kitten: 'cats', catnip: 'cats', scratching: 'cats',
        whiskas: 'cat-food', felix: 'cat-food', dreamies: 'cat-treats',
        // Fish
        aquarium: 'fish', fish: 'fish', aquatic: 'fish', vivarium: 'reptiles',
        // Small animals
        rabbit: 'small-animals', hamster: 'small-animals',
        guinea: 'small-animals', hutch: 'small-animals',
        // Birds
        parrot: 'birds', bird: 'birds', cage: 'birds', perch: 'birds',
        // Reptiles
        reptile: 'reptiles', snake: 'reptiles', tortoise: 'reptiles',
        // Grooming
        grooming: 'grooming', shampoo: 'grooming', brush: 'grooming',
        // Health
        flea: 'pet-health', wormer: 'pet-health', microchip: 'pet-health',
    },

    // ── BABY ───────────────────────────────────────────────────────────────────
    baby: {
        // Travel
        pram: 'prams-pushchairs', pushchair: 'prams-pushchairs',
        stroller: 'prams-pushchairs', buggy: 'prams-pushchairs',
        bugaboo: 'prams-pushchairs', graco: 'prams-pushchairs',
        icandy: 'prams-pushchairs',
        // Sleeping
        cot: 'nursery', crib: 'nursery', moses: 'nursery',
        mattress: 'nursery', sleeping: 'nursery',
        // Feeding
        bottle: 'feeding', steriliser: 'feeding', sterilizer: 'feeding',
        weaning: 'feeding', formula: 'feeding', avent: 'feeding',
        medela: 'feeding', tommee: 'feeding',
        // Clothing
        babygrow: 'baby-clothing', romper: 'baby-clothing',
        muslins: 'baby-clothing', swaddle: 'baby-clothing',
        // Toys & development
        teether: 'baby-toys', rattle: 'baby-toys', playmat: 'baby-toys',
        bouncer: 'bouncers-rockers',
        // Safety
        babygate: 'baby-safety', monitor: 'baby-safety',
        carrier: 'carriers', sling: 'carriers',
        // Hygiene
        nappy: 'nappies', diaper: 'nappies', wipes: 'nappies',
    },

    // ── TOYS ───────────────────────────────────────────────────────────────────
    toys: {
        // Building
        lego: 'building-toys', meccano: 'building-toys', magnetic: 'building-toys',
        // Dolls & figures
        doll: 'dolls', barbie: 'dolls', action: 'action-figures',
        figurine: 'action-figures', funko: 'action-figures',
        // Games
        boardgame: 'board-games', puzzle: 'board-games', chess: 'board-games',
        // RC & vehicles
        remote: 'rc-toys', rc: 'rc-toys', drone: 'rc-toys',
        // Outdoor
        nerf: 'outdoor-toys', kite: 'outdoor-toys', frisbee: 'outdoor-toys',
        // Creative
        playdoh: 'creative-toys', slime: 'creative-toys', colouring: 'creative-toys',
        // Licensed
        pokemon: 'trading-cards', lorcana: 'trading-cards', digimon: 'trading-cards',
        peppa: 'character-toys', bluey: 'character-toys', disney: 'character-toys',
        // Ride-ons
        scooter: 'ride-ons', bicycle: 'ride-ons', balance: 'ride-ons',
        // Educational
        vtech: 'educational', leapfrog: 'educational',
    },

    // ── HOME ───────────────────────────────────────────────────────────────────
    home: {
        // Furniture
        sofa: 'furniture', couch: 'furniture', chair: 'furniture',
        table: 'furniture', desk: 'furniture', shelf: 'furniture',
        cabinet: 'furniture', wardrobe: 'furniture', sideboard: 'furniture',
        bookcase: 'furniture', ottoman: 'furniture',
        // Bedroom
        bed: 'bedroom', mattress: 'bedroom', pillow: 'bedding',
        duvet: 'bedding', blanket: 'bedding', headboard: 'bedroom',
        // Window
        curtain: 'window-treatments', blind: 'window-treatments',
        // Lighting
        lamp: 'lighting', chandelier: 'lighting', spotlight: 'lighting',
        downlight: 'lighting', bulb: 'lighting', dimmer: 'lighting',
        // Bathroom
        toilet: 'bathroom', basin: 'bathroom', shower: 'bathroom',
        bath: 'bathroom', towel: 'bathroom', towelrail: 'bathroom',
        // Rugs & flooring
        rug: 'rugs-flooring', carpet: 'rugs-flooring', tile: 'rugs-flooring',
        // Storage
        basket: 'storage', box: 'storage', organiser: 'storage',
        // Décor
        mirror: 'decor', clock: 'decor', vase: 'decor', candle: 'decor',
        frame: 'decor', artwork: 'decor',
        // Heating & cooling
        heater: 'heating-cooling', radiator: 'heating-cooling', fan: 'heating-cooling',
        aircon: 'heating-cooling', stove: 'heating-cooling',
        // Cleaning
        vacuum: 'cleaning', mop: 'cleaning', dyson: 'cleaning',
        // Appliances
        kettle: 'kitchen-appliances', toaster: 'kitchen-appliances',
        microwave: 'kitchen-appliances', fridge: 'large-appliances',
        washer: 'large-appliances', dryer: 'large-appliances',
    },

    // ── GARDEN ─────────────────────────────────────────────────────────────────
    garden: {
        // Lawn care
        mower: 'lawn-care', strimmer: 'lawn-care', scarifier: 'lawn-care',
        aerator: 'lawn-care', edger: 'lawn-care',
        // Hand tools
        spade: 'hand-tools', fork: 'hand-tools', rake: 'hand-tools',
        trowel: 'hand-tools', secateurs: 'hand-tools', loppers: 'hand-tools',
        shears: 'hand-tools', pruner: 'hand-tools',
        // Watering
        hose: 'watering', sprinkler: 'watering', watering: 'watering',
        waterbutt: 'watering',
        // Planting
        pot: 'planting', planter: 'planting', seed: 'planting',
        compost: 'planting', fertiliser: 'planting', growbag: 'planting',
        // Structure
        greenhouse: 'garden-structures', polytunnel: 'garden-structures',
        pergola: 'garden-structures', gazebo: 'garden-structures',
        trellis: 'garden-structures', fence: 'garden-structures',
        // Outdoor living
        barbecue: 'outdoor-living', bbq: 'outdoor-living', smoker: 'outdoor-living',
        chiminea: 'outdoor-living', firepit: 'outdoor-living',
        parasol: 'outdoor-living', furniture: 'outdoor-living',
        // Wildlife
        birdfeeder: 'wildlife', birdbath: 'wildlife', hedgehog: 'wildlife',
        // Decking & paving
        decking: 'hard-landscaping', paving: 'hard-landscaping',
        gravel: 'hard-landscaping', bark: 'hard-landscaping',
    },

    // ── TOOLS ──────────────────────────────────────────────────────────────────
    tools: {
        // Power tools
        drill: 'power-tools', saw: 'power-tools', sander: 'power-tools',
        grinder: 'power-tools', jigsaw: 'power-tools', router: 'power-tools',
        dewalt: 'power-tools', makita: 'power-tools', bosch: 'power-tools',
        milwaukee: 'power-tools', ryobi: 'power-tools', hikoki: 'power-tools',
        festool: 'power-tools', cordless: 'power-tools',
        // Hand tools
        hammer: 'hand-tools', screwdriver: 'hand-tools', wrench: 'hand-tools',
        spanner: 'hand-tools', pliers: 'hand-tools', chisel: 'hand-tools',
        // Measuring
        level: 'measuring', tape: 'measuring', laser: 'measuring',
        // Plumbing
        plumbing: 'plumbing', pipe: 'plumbing', fitting: 'plumbing',
        // Welding
        welding: 'welding', soldering: 'welding',
        // Storage
        toolbox: 'tool-storage', workbench: 'tool-storage',
        // Safety
        clamp: 'workholding',
    },

    // ── KITCHEN ────────────────────────────────────────────────────────────────
    kitchen: {
        // Cooking
        pan: 'cookware', wok: 'cookware', casserole: 'cookware',
        knife: 'knives', chopping: 'knives',
        // Baking
        baking: 'bakeware', tin: 'bakeware', mould: 'bakeware',
        // Small appliances
        blender: 'small-appliances', mixer: 'small-appliances',
        airfryer: 'small-appliances', slowcooker: 'small-appliances',
        instantpot: 'small-appliances', nutribullet: 'small-appliances',
        // Coffee
        nespresso: 'coffee', cafetiere: 'coffee', aeropress: 'coffee',
        chemex: 'coffee', delonghi: 'coffee', jura: 'coffee',
        // Drinkware
        mug: 'drinkware', cup: 'drinkware', glass: 'drinkware',
        flask: 'drinkware', bottle: 'drinkware',
        // Tableware
        plate: 'tableware', bowl: 'tableware', cutlery: 'tableware',
        // Storage
        tupperware: 'food-storage', lunchbox: 'food-storage',
        // Scales & measuring
        scales: 'measuring', thermometer: 'measuring',
    },

    // ── SPORTS ─────────────────────────────────────────────────────────────────
    sports: {
        // Gym
        dumbbell: 'gym-weights', barbell: 'gym-weights', kettlebell: 'gym-weights',
        bench: 'gym-equipment', treadmill: 'cardio', rowing: 'cardio',
        // Ball sports
        football: 'football', soccer: 'football', basketball: 'basketball',
        cricket: 'cricket', baseball: 'baseball', rugby: 'rugby',
        // Racket sports
        tennis: 'racket-sports', badminton: 'racket-sports',
        squash: 'racket-sports', pingpong: 'racket-sports',
        // Golf
        golf: 'golf', titleist: 'golf', callaway: 'golf',
        // Combat
        boxing: 'combat-sports', mma: 'combat-sports', karate: 'combat-sports',
        judo: 'combat-sports', wrestling: 'combat-sports',
        // Yoga & wellness
        yoga: 'yoga-pilates', pilates: 'yoga-pilates', meditation: 'yoga-pilates',
        // Water sports
        swimming: 'water-sports', surfboard: 'water-sports', kayak: 'water-sports',
        wetsuit: 'water-sports', scuba: 'water-sports',
        // Winter sports
        skiing: 'winter-sports', snowboard: 'winter-sports',
        // Running
        running: 'running', marathon: 'running',
        // Outdoor
        hiking: 'outdoor-sports', climbing: 'outdoor-sports',
        // Target sports
        archery: 'target-sports', darts: 'target-sports',
        // Snooker & billiards
        snooker: 'snooker-pool', billiards: 'snooker-pool', cue: 'snooker-pool',
    },

    // ── HEALTH ─────────────────────────────────────────────────────────────────
    health: {
        // Vitamins & supplements
        vitamin: 'vitamins-supplements', supplement: 'vitamins-supplements',
        omega: 'vitamins-supplements', probiotic: 'vitamins-supplements',
        collagen: 'vitamins-supplements', turmeric: 'vitamins-supplements',
        magnesium: 'vitamins-supplements', zinc: 'vitamins-supplements',
        // Medical devices
        cpap: 'medical-devices', nebuliser: 'medical-devices',
        oximeter: 'medical-devices', thermometer: 'medical-devices',
        bloodpressure: 'medical-devices', defibrillator: 'medical-devices',
        // Mobility
        wheelchair: 'mobility', crutches: 'mobility', rollator: 'mobility',
        zimmer: 'mobility', walking: 'mobility', stairlift: 'mobility',
        // Braces & supports
        brace: 'braces-supports', compression: 'braces-supports',
        support: 'braces-supports', insoles: 'braces-supports',
        // Dental
        dental: 'dental', toothbrush: 'dental', whitening: 'dental',
        // Eye care
        glasses: 'eye-care', contact: 'eye-care', lens: 'eye-care',
        // Massage & recovery
        massager: 'massage-recovery', theragun: 'massage-recovery',
        foam: 'massage-recovery', tens: 'massage-recovery',
        // Family health
        pregnancy: 'family-health', fertility: 'family-health',
        ovulation: 'family-health',
    },

    // ── BEAUTY ─────────────────────────────────────────────────────────────────
    beauty: {
        // Skincare
        moisturiser: 'skincare', serum: 'skincare', cleanser: 'skincare',
        toner: 'skincare', spf: 'skincare', retinol: 'skincare',
        hyaluronic: 'skincare', niacinamide: 'skincare', cerave: 'skincare',
        // Makeup
        foundation: 'makeup', concealer: 'makeup', mascara: 'makeup',
        eyeliner: 'makeup', eyeshadow: 'makeup', lipstick: 'makeup',
        primer: 'makeup', contour: 'makeup', blush: 'makeup',
        // Hair
        shampoo: 'haircare', conditioner: 'haircare', hairdryer: 'haircare',
        straightener: 'hair-styling', curler: 'hair-styling',
        ghd: 'hair-styling', babyliss: 'hair-styling',
        // Fragrance
        perfume: 'fragrance', cologne: 'fragrance', eau: 'fragrance',
        // Body
        deodorant: 'body-care', razor: 'shaving', trimmer: 'shaving',
        // Nails
        nail: 'nails', gel: 'nails', shellac: 'nails', acrylic: 'nails',
        // Tools & devices
        epilator: 'hair-removal', ipl: 'hair-removal', laser: 'hair-removal',
        guasha: 'beauty-tools', dermaroller: 'beauty-tools',
        // Brushes
        brush: 'brushes-applicators', sponge: 'brushes-applicators',
    },

    // ── COLLECTIBLES ───────────────────────────────────────────────────────────
    collectibles: {
        // Coins & stamps
        coin: 'coins', stamp: 'stamps', banknote: 'coins', bullion: 'coins',
        sovereign: 'coins', numismatic: 'coins',
        // Cards
        pokemon: 'trading-cards', yugioh: 'trading-cards', mtg: 'trading-cards',
        lorcana: 'trading-cards', topps: 'sports-cards', panini: 'sports-cards',
        // Toys & figures
        diecast: 'diecast', dinky: 'diecast', corgi: 'diecast', matchbox: 'diecast',
        funko: 'pop-figures', nendoroid: 'pop-figures', figma: 'pop-figures',
        warhammer: 'miniatures', citadel: 'miniatures',
        // Comics & media
        comic: 'comics-books', manga: 'comics-books',
        // Memorabilia
        signed: 'sports-memorabilia', autograph: 'memorabilia',
        memorabilia: 'memorabilia',
        // Vintage
        vintage: 'vintage-antique', antique: 'vintage-antique',
        ephemera: 'paper-ephemera', postcard: 'paper-ephemera',
        // Militaria
        militaria: 'militaria', medal: 'militaria', badge: 'militaria',
        // Breweriana
        breweriana: 'breweriana', railwayana: 'railwayana',
    },

    // ── MUSIC ──────────────────────────────────────────────────────────────────
    music: {
        // Guitars
        guitar: 'guitars', fender: 'guitars', gibson: 'guitars',
        stratocaster: 'guitars', telecaster: 'guitars', epiphone: 'guitars',
        bass: 'bass-guitars', ukulele: 'ukulele', banjo: 'banjo',
        // Keyboards & piano
        piano: 'keyboards-pianos', keyboard: 'keyboards-pianos',
        synthesiser: 'keyboards-pianos', korg: 'keyboards-pianos',
        // Drums
        drum: 'drums', snare: 'drums', cymbal: 'drums', hihat: 'drums',
        // Wind instruments
        trumpet: 'brass', saxophone: 'woodwind', flute: 'woodwind',
        clarinet: 'woodwind', oboe: 'woodwind',
        // String instruments
        violin: 'strings', cello: 'strings', viola: 'strings',
        // DJ & production
        dj: 'dj-equipment', turntable: 'dj-equipment', mixer: 'dj-equipment',
        midi: 'music-production', interface: 'music-production',
        // Amplifiers & effects
        amplifier: 'amplifiers', amp: 'amplifiers', cabinet: 'amplifiers',
        pedal: 'effects-pedals', pedalboard: 'effects-pedals',
        // Accessories
        capo: 'accessories', pick: 'accessories', plectrum: 'accessories',
        strings: 'accessories', strap: 'accessories',
    },

    // ── ARTS & CRAFTS ──────────────────────────────────────────────────────────
    arts: {
        // Painting
        paint: 'painting', canvas: 'painting', easel: 'painting',
        acrylic: 'painting', watercolour: 'painting', oil: 'painting',
        // Drawing
        pencil: 'drawing', charcoal: 'drawing', graphite: 'drawing',
        sketchbook: 'drawing',
        // Knitting & crochet
        yarn: 'knitting-crochet', wool: 'knitting-crochet',
        knitting: 'knitting-crochet', crochet: 'knitting-crochet',
        // Sewing & embroidery
        sewing: 'sewing', fabric: 'sewing', embroidery: 'needlecraft',
        cross: 'needlecraft',
        // Resin & sculpting
        resin: 'resin-craft', epoxy: 'resin-craft',
        clay: 'sculpting', pottery: 'sculpting', polymer: 'sculpting',
        // Cutting & vinyl
        cricut: 'die-cutting', silhouette: 'die-cutting', vinyl: 'die-cutting',
        stencil: 'stencilling',
        // Candle & soap
        candlemaking: 'candle-soap', soapmaking: 'candle-soap',
        // Pyrography
        pyrography: 'pyrography', woodburning: 'pyrography',
        // Jewellery making
        beads: 'jewellery-making', wire: 'jewellery-making',
        macrame: 'textile-crafts', weaving: 'textile-crafts', felting: 'textile-crafts',
    },

    // ── BOOKS ──────────────────────────────────────────────────────────────────
    books: {
        // Fiction genres
        thriller: 'fiction', mystery: 'fiction', horror: 'fiction',
        romance: 'fiction', fantasy: 'fiction', scifi: 'fiction',
        // Non-fiction
        biography: 'non-fiction', autobiography: 'non-fiction', memoir: 'non-fiction',
        cookbook: 'cookbooks',
        // Children's
        childrens: 'childrens-books', picture: 'childrens-books',
        board: 'childrens-books',
        // Educational
        textbook: 'textbooks', revision: 'textbooks',
        // Formats
        hardback: 'book-formats', paperback: 'book-formats',
        // Media
        dvd: 'dvd-bluray', bluray: 'dvd-bluray', cd: 'music-media',
        vinyl: 'music-media', vhs: 'dvd-bluray',
        // Magazines
        magazine: 'magazines', comic: 'comics',
    },

    // ── DIGITAL ────────────────────────────────────────────────────────────────
    digital: {
        // Software
        windows: 'software', microsoft: 'software', adobe: 'software',
        office: 'software', antivirus: 'software', norton: 'software',
        // Games
        steam: 'game-keys', gamepass: 'subscriptions', psn: 'subscriptions',
        // Subscriptions
        spotify: 'subscriptions', netflix: 'subscriptions',
        // Design
        canva: 'design-resources', font: 'design-resources',
        template: 'templates', mockup: 'templates',
        // Printables
        printable: 'printables', pdf: 'printables',
    },

    // ── TRAVEL ─────────────────────────────────────────────────────────────────
    travel: {
        // Luggage
        suitcase: 'luggage', samsonite: 'luggage', rimowa: 'luggage',
        // Bags
        backpack: 'travel-bags', rucksack: 'travel-bags', holdall: 'travel-bags',
        duffel: 'travel-bags', weekender: 'travel-bags',
        // Camping
        tent: 'camping', sleeping: 'camping', camping: 'camping',
        hammock: 'camping',
        // Travel accessories
        adapter: 'travel-accessories', padlock: 'travel-accessories',
        packingcube: 'travel-accessories', passport: 'travel-accessories',
        // Outdoor clothing
        arcteryx: 'outdoor-clothing', berghaus: 'outdoor-clothing',
        osprey: 'outdoor-clothing', rab: 'outdoor-clothing',
    },

    // ── FOOD & DRINK ───────────────────────────────────────────────────────────
    food: {
        // Hot drinks
        coffee: 'hot-drinks', tea: 'hot-drinks', matcha: 'hot-drinks',
        // Alcohol
        whisky: 'spirits', whiskey: 'spirits', gin: 'spirits',
        vodka: 'spirits', rum: 'spirits', bourbon: 'spirits',
        wine: 'wine', prosecco: 'wine', champagne: 'wine',
        beer: 'beer-cider', ale: 'beer-cider', stout: 'beer-cider',
        cider: 'beer-cider',
        // Chocolate & sweets
        chocolate: 'confectionery', fudge: 'confectionery',
        toffee: 'confectionery', truffle: 'confectionery',
        // Hampers
        hamper: 'hampers',
        // Health food
        vegan: 'health-food', organic: 'health-food',
        protein: 'sports-nutrition', shake: 'sports-nutrition',
    },

    // ── PARTY ──────────────────────────────────────────────────────────────────
    party: {
        // Balloons
        balloon: 'balloons', helium: 'balloons', foil: 'balloons',
        // Decorations
        banner: 'decorations', bunting: 'decorations',
        confetti: 'decorations', streamers: 'decorations',
        // Halloween
        halloween: 'halloween', costume: 'costumes', mask: 'costumes',
        // Christmas
        christmas: 'christmas', tinsel: 'christmas', bauble: 'christmas',
        advent: 'christmas', wreath: 'christmas',
        // Tableware
        tablecloth: 'tableware', napkin: 'tableware',
        // Giftwrap
        wrapping: 'gift-wrap', ribbon: 'gift-wrap', gifttag: 'gift-wrap',
    },

    // ── EQUESTRIAN ─────────────────────────────────────────────────────────────
    equestrian: {
        // Saddles & tack
        saddle: 'saddles', bridle: 'bridles', numnah: 'saddle-pads',
        saddlepad: 'saddle-pads', girth: 'girths',
        stirrup: 'stirrups', bit: 'bits',
        breastplate: 'schooling-equipment', martingale: 'schooling-equipment',
        lunge: 'schooling-equipment', whip: 'schooling-equipment',
        // Headgear
        browband: 'headcollars-headgear', noseband: 'headcollars-headgear',
        headcollar: 'headcollars-headgear', leadrope: 'headcollars-headgear',
        // Rugs
        rug: 'rugs', weatherbeeta: 'rugs', rambo: 'rugs', amigo: 'rugs',
        horseware: 'rugs',
        // Rider clothing
        jodhpur: 'rider-clothing', riding: 'rider-clothing',
        helmet: 'riding-hats',
        // Boots
        boot: 'boots', tendon: 'boots', overreach: 'boots',
        // Grooming
        grooming: 'grooming', hoofpick: 'grooming', mane: 'grooming',
        // Stable
        haynet: 'stable-supplies', bucket: 'stable-supplies',
        // Brands
        lemieux: 'saddle-pads', shires: 'equestrian-brands',
        wintec: 'saddles',
        // Health
        supplement: 'horse-supplements', electrolyte: 'horse-supplements',
        hoof: 'hoof-care',
    },


    // ── FISHING ────────────────────────────────────────────────────────────────
    fishing: {
        // Rods & reels
        rod: 'rods-reels', reel: 'rods-reels',
        daiwa: 'rods-reels', shimano: 'rods-reels', abu: 'rods-reels',
        penn: 'rods-reels', okuma: 'rods-reels',
        // Terminal tackle
        hook: 'terminal-tackle', swivel: 'terminal-tackle',
        lure: 'terminal-tackle', float: 'terminal-tackle',
        // Carp fishing
        carp: 'carp-fishing', bivvy: 'carp-fishing', boilie: 'carp-fishing',
        korda: 'carp-fishing', nash: 'carp-fishing', fox: 'carp-fishing',
        bankstick: 'carp-fishing', buzzer: 'carp-fishing',
        hooklink: 'carp-fishing', spod: 'carp-fishing',
        // Fly fishing
        fly: 'fly-fishing', flytying: 'fly-fishing',
        // Sea fishing
        pike: 'predator-fishing', catfish: 'predator-fishing',
        // Bait
        bait: 'bait', groundbait: 'bait', maggot: 'bait', pellet: 'bait',
        // Clothing & accessories
        waders: 'fishing-clothing', jacket: 'fishing-clothing',
        // Bite indication
        indicator: 'bite-indication', swinger: 'bite-indication',
        // Shelter
        trakker: 'fishing-shelter', wychwood: 'fishing-shelter',
        // Fish finder
        fishfinder: 'fish-finders', baitboat: 'fish-finders',
    },


    // ── CYCLING ────────────────────────────────────────────────────────────────
    cycling: {
        // Bike types
        bike: 'bikes', bicycle: 'bikes', ebike: 'bikes',
        mtb: 'mountain-bikes', roadbike: 'road-bikes', bmx: 'bmx',
        fixie: 'road-bikes', gravel: 'road-bikes',
        specialized: 'bikes', trek: 'bikes', giant: 'bikes',
        cannondale: 'bikes', bianchi: 'bikes',
        // Components
        derailleur: 'components', crankset: 'components',
        cassette: 'components', chainring: 'components',
        shimano: 'components', sram: 'components', campagnolo: 'components',
        // Wheels
        wheel: 'wheels', tyre: 'tyres', tube: 'tyres',
        mavic: 'wheels', zipp: 'wheels',
        // Saddle & bars
        saddle: 'saddle-bars', handlebar: 'saddle-bars',
        stem: 'saddle-bars', seatpost: 'saddle-bars',
        // Clothing
        jersey: 'cycling-clothing', bib: 'cycling-clothing',
        shorts: 'cycling-clothing', gilet: 'cycling-clothing',
        overshoe: 'cycling-clothing', rapha: 'cycling-clothing',
        castelli: 'cycling-clothing',
        // Accessories
        helmet: 'helmets', bikelight: 'lights', bikelock: 'security',
        bikepump: 'tools-maintenance', garmin: 'computers-gps',
        wahoo: 'computers-gps', zwift: 'turbo-trainers',
        turbotrainer: 'turbo-trainers', tacx: 'turbo-trainers',
        // Bags
        pannier: 'bike-bags', bikebag: 'bike-bags',
    },


    // ── OFFICE ─────────────────────────────────────────────────────────────────
    office: {
        // Furniture
        desk: 'office-furniture', chair: 'office-furniture',
        standing: 'office-furniture',
        // Stationery
        pen: 'stationery', pencil: 'stationery', ruler: 'stationery',
        stapler: 'stationery', scissors: 'stationery',
        // Filing
        folder: 'filing', binder: 'filing', ringbinder: 'filing',
        // Organisation
        planner: 'planners-diaries', diary: 'planners-diaries',
        calendar: 'planners-diaries',
        // Paper
        paper: 'paper', envelope: 'paper', jiffy: 'packaging',
        // Whiteboards
        whiteboard: 'presentation', flipchart: 'presentation',
        // Shredders
        shredder: 'office-machines', laminator: 'office-machines',
    },
}


// ── Main detection function ───────────────────────────────────────────────────
export function detectCategoryV2(title: string): CategoryResult {
    const words = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1)

    // Also check pairs of adjacent words (bigrams) for compound words
    const bigrams = words.slice(0, -1).map((w, i) => w + words[i + 1])
    const allTokens = [...words, ...bigrams]

    const scores: Partial<Record<Category, number>> = {}

    for (const token of allTokens) {
        const matches = DICT[token]
        if (!matches) continue
        for (const [cat, weight] of Object.entries(matches) as [Category, number][]) {
            scores[cat] = (scores[cat] ?? 0) + weight
        }
    }

    // Find winner
    let bestCat: Category = 'default'
    let bestScore = 0

    for (const [cat, score] of Object.entries(scores) as [Category, number][]) {
        if (score > bestScore) { bestScore = score; bestCat = cat }
    }

    // Find subcategory — check bigrams first (more specific), then single words
    // e.g. "ring light" → studio-lighting, "air fryer" → small-appliances
    let subcategory: string = bestCat
    const subMap = SUBCATEGORY_MAP[bestCat]
    if (subMap) {
        // Check bigrams first (2-word phrases are more specific)
        let found = false
        for (let i = 0; i < words.length - 1; i++) {
            const bigram = `${words[i]}${words[i + 1]}`   // joined bigram e.g. 'ringlight'
            const spaced = `${words[i]} ${words[i + 1]}`  // spaced bigram e.g. 'ring light'
            if (subMap[bigram]) { subcategory = subMap[bigram]; found = true; break }
            if (subMap[spaced]) { subcategory = subMap[spaced]; found = true; break }
        }
        // Fall back to single words
        if (!found) {
            for (const word of words) {
                if (subMap[word]) { subcategory = subMap[word]; break }
            }
        }
    }

    const confidence: CategoryResult['confidence'] =
        bestScore >= 4 ? 'high'
            : bestScore >= 2 ? 'medium'
                : bestScore >= 1 ? 'low'
                    : 'none'

    return { category: bestCat, subcategory, confidence, score: bestScore }
}

// ── Category display labels ────────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<Category, string> = {
    electronics: 'Electronics',
    computing: 'Computing',
    gaming: 'Gaming',
    photography: 'Photography',
    audio: 'Audio',
    automotive: 'Automotive',
    clothing: 'Clothing',
    footwear: 'Footwear',
    jewellery: 'Jewellery',
    pets: 'Pet Supplies',
    baby: 'Baby',
    toys: 'Toys & Games',
    home: 'Home',
    garden: 'Garden',
    tools: 'Tools',
    kitchen: 'Kitchen',
    sports: 'Sports',
    cycling: 'Cycling',
    fishing: 'Fishing',
    equestrian: 'Equestrian',
    health: 'Health',
    beauty: 'Beauty',
    collectibles: 'Collectibles',
    music: 'Music',
    books: 'Books',
    arts: 'Arts & Crafts',
    office: 'Office',
    travel: 'Travel',
    food: 'Food & Drink',
    party: 'Party',
    digital: 'Digital',
    default: 'General',
}

// ── Search multipliers per category ───────────────────────────────────────────
export const CATEGORY_SEARCH_MULTIPLIER: Record<Category, number> = {
    electronics: 2.8,
    computing: 2.5,
    gaming: 2.2,
    photography: 1.8,
    audio: 1.9,
    automotive: 2.2,
    clothing: 1.6,
    footwear: 1.7,
    jewellery: 1.4,
    pets: 1.5,
    baby: 1.3,
    toys: 1.6,
    home: 1.3,
    garden: 1.1,
    tools: 1.4,
    kitchen: 1.2,
    sports: 1.5,
    cycling: 1.4,
    fishing: 1.2,
    equestrian: 0.9,
    health: 1.6,
    beauty: 1.8,
    collectibles: 0.8,
    music: 1.3,
    books: 1.1,
    arts: 1.0,
    office: 1.2,
    travel: 1.2,
    food: 1.1,
    party: 1.0,
    digital: 1.5,
    default: 1.0,
}
