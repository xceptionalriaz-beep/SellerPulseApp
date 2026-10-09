// src/utils/categoryDetector.ts
// ─────────────────────────────────────────────────────────────────────────────
// Category Detection Engine for SellerPulse Title Builder
// Detects eBay category from seed keyword using weighted dictionary scoring.
// Zero API calls — runs in <1ms using string matching only.
// ─────────────────────────────────────────────────────────────────────────────

export type EbayCategory =
    | 'electronics'
    | 'automotive'
    | 'pets'
    | 'clothing'
    | 'toys'
    | 'homeGarden'
    | 'sports'
    | 'baby'
    | 'collectibles'
    | 'health'
    | 'default'

export interface CategoryResult {
    category: EbayCategory
    confidence: 'high' | 'medium' | 'low' | 'none'
    score: number
}

// ── Category Dictionary ───────────────────────────────────────────────────────
// Each word maps to { category: weight }
// Weight > 1 = strong signal for that category
// Weight = 1 = normal signal
// A word can belong to multiple categories with different weights

const CATEGORY_DICT: Record<string, Partial<Record<EbayCategory, number>>> = {

    // ── Electronics ──────────────────────────────────────────────
    iphone: { electronics: 2 },
    samsung: { electronics: 2 },
    galaxy: { electronics: 2 },
    pixel: { electronics: 2 },
    oneplus: { electronics: 2 },
    xiaomi: { electronics: 2 },
    huawei: { electronics: 2 },
    smartphone: { electronics: 2 },
    mobile: { electronics: 1 },
    phone: { electronics: 1 },
    magsafe: { electronics: 2 },
    airpods: { electronics: 2 },
    earbuds: { electronics: 2 },
    headphones: { electronics: 2 },
    speaker: { electronics: 1 },
    laptop: { electronics: 2 },
    macbook: { electronics: 2 },
    ipad: { electronics: 2 },
    tablet: { electronics: 2 },
    keyboard: { electronics: 1 },
    processor: { electronics: 2 },
    gpu: { electronics: 2 },
    nvme: { electronics: 2 },
    ssd: { electronics: 2 },
    hdmi: { electronics: 2 },
    usb: { electronics: 1 },
    charger: { electronics: 1 },
    cable: { electronics: 1 },
    playstation: { electronics: 2 },
    xbox: { electronics: 2 },
    nintendo: { electronics: 2 },
    ps5: { electronics: 2 },
    ps4: { electronics: 2 },
    controller: { electronics: 1 },
    gaming: { electronics: 1 },
    smartwatch: { electronics: 2 },
    fitbit: { electronics: 2 },
    drone: { electronics: 2 },
    gopro: { electronics: 2 },
    case: { electronics: 1, homeGarden: 0.3 },
    cover: { electronics: 1, homeGarden: 0.3 },
    screen: { electronics: 1 },
    protector: { electronics: 1 },
    lens: { electronics: 1 },
    camera: { electronics: 1 },

    // ── Automotive ───────────────────────────────────────────────
    car: { automotive: 2 },
    truck: { automotive: 2 },
    van: { automotive: 2 },
    suv: { automotive: 2 },
    vehicle: { automotive: 2 },
    auto: { automotive: 1 },
    motor: { automotive: 1 },
    engine: { automotive: 2 },
    brake: { automotive: 2 },
    tyre: { automotive: 2 },
    tire: { automotive: 2 },
    wheel: { automotive: 2 },
    rim: { automotive: 2 },
    bumper: { automotive: 2 },
    fender: { automotive: 2 },
    exhaust: { automotive: 2 },
    radiator: { automotive: 2 },
    alternator: { automotive: 2 },
    headlight: { automotive: 2 },
    taillight: { automotive: 2 },
    wiper: { automotive: 2 },
    windshield: { automotive: 2 },
    toyota: { automotive: 2 },
    honda: { automotive: 2 },
    ford: { automotive: 2 },
    bmw: { automotive: 2 },
    mercedes: { automotive: 2 },
    audi: { automotive: 2 },
    nissan: { automotive: 2 },
    chevrolet: { automotive: 2 },
    dodge: { automotive: 2 },
    jeep: { automotive: 2 },
    motorcycle: { automotive: 2 },
    scooter: { automotive: 2 },
    atv: { automotive: 2 },
    obd: { automotive: 2 },
    spark: { automotive: 1 },
    muffler: { automotive: 2 },
    turbo: { automotive: 2 },

    // ── Pets ─────────────────────────────────────────────────────
    dog: { pets: 2 },
    cat: { pets: 2 },
    puppy: { pets: 2 },
    kitten: { pets: 2 },
    pet: { pets: 2 },
    animal: { pets: 1 },
    collar: { pets: 1 },
    leash: { pets: 2 },
    harness: { pets: 1 },
    crate: { pets: 1 },
    kennel: { pets: 2 },
    treat: { pets: 1 },
    chew: { pets: 1 },
    feeder: { pets: 1 },
    aquarium: { pets: 2 },
    fish: { pets: 1 },
    bird: { pets: 1 },
    rabbit: { pets: 2 },
    hamster: { pets: 2 },
    litter: { pets: 2 },
    scratching: { pets: 2 },
    grooming: { pets: 1, health: 0.5 },
    toy: { toys: 1, pets: 0.5 },

    // ── Clothing & Fashion ───────────────────────────────────────
    shirt: { clothing: 2 },
    tshirt: { clothing: 2 },
    hoodie: { clothing: 2 },
    jacket: { clothing: 2 },
    coat: { clothing: 2 },
    dress: { clothing: 2 },
    skirt: { clothing: 2 },
    jeans: { clothing: 2 },
    pants: { clothing: 2 },
    trousers: { clothing: 2 },
    shorts: { clothing: 2 },
    leggings: { clothing: 2 },
    shoes: { clothing: 2 },
    boots: { clothing: 2 },
    sneakers: { clothing: 2 },
    trainers: { clothing: 2 },
    sandals: { clothing: 2 },
    heels: { clothing: 2 },
    hat: { clothing: 1 },
    cap: { clothing: 1 },
    beanie: { clothing: 2 },
    scarf: { clothing: 2 },
    suit: { clothing: 2 },
    blazer: { clothing: 2 },
    sweater: { clothing: 2 },
    swimwear: { clothing: 2 },
    underwear: { clothing: 2 },
    bra: { clothing: 2 },
    nike: { clothing: 2, sports: 1 },
    adidas: { clothing: 2, sports: 1 },
    gucci: { clothing: 2 },
    fashion: { clothing: 1 },
    streetwear: { clothing: 2 },
    leather: { clothing: 1, automotive: 0.5 },

    // ── Toys & Games ─────────────────────────────────────────────
    game: { toys: 2 },
    puzzle: { toys: 2 },
    lego: { toys: 2 },
    playset: { toys: 2 },
    doll: { toys: 2 },
    figurine: { toys: 1, collectibles: 1 },
    educational: { toys: 1, baby: 0.5 },
    toddler: { baby: 1, toys: 0.5 },
    minecraft: { toys: 2, electronics: 1 },
    pokemon: { toys: 1, collectibles: 1 },

    // ── Home & Garden ────────────────────────────────────────────
    sofa: { homeGarden: 2 },
    couch: { homeGarden: 2 },
    chair: { homeGarden: 2 },
    table: { homeGarden: 2 },
    desk: { homeGarden: 1 },
    shelf: { homeGarden: 2 },
    cabinet: { homeGarden: 2 },
    mattress: { homeGarden: 2 },
    pillow: { homeGarden: 2 },
    duvet: { homeGarden: 2 },
    blanket: { homeGarden: 2 },
    curtain: { homeGarden: 2 },
    lamp: { homeGarden: 2 },
    bulb: { homeGarden: 1 },
    vacuum: { homeGarden: 2 },
    cookware: { homeGarden: 2 },
    knife: { homeGarden: 1 },
    garden: { homeGarden: 2 },
    plant: { homeGarden: 1 },
    hose: { homeGarden: 2 },
    mower: { homeGarden: 2 },
    rug: { homeGarden: 2 },
    carpet: { homeGarden: 2 },
    decor: { homeGarden: 1 },

    // ── Sports & Fitness ─────────────────────────────────────────
    gym: { sports: 2 },
    fitness: { sports: 2 },
    workout: { sports: 2 },
    exercise: { sports: 2 },
    yoga: { sports: 2 },
    running: { sports: 2 },
    cycling: { sports: 2 },
    swimming: { sports: 2 },
    football: { sports: 2 },
    soccer: { sports: 2 },
    basketball: { sports: 2 },
    tennis: { sports: 2 },
    golf: { sports: 2 },
    cricket: { sports: 2 },
    boxing: { sports: 2 },
    weights: { sports: 2 },
    dumbbell: { sports: 2 },
    barbell: { sports: 2 },
    protein: { sports: 1, health: 1 },
    supplement: { sports: 1, health: 1 },
    jersey: { sports: 2, clothing: 1 },
    helmet: { sports: 1, automotive: 1 },

    // ── Baby ─────────────────────────────────────────────────────
    baby: { baby: 2 },
    infant: { baby: 2 },
    newborn: { baby: 2 },
    nappy: { baby: 2 },
    diaper: { baby: 2 },
    pram: { baby: 2 },
    stroller: { baby: 2 },
    buggy: { baby: 2 },
    cot: { baby: 2 },
    crib: { baby: 2 },
    pacifier: { baby: 2 },
    dummy: { baby: 2 },
    teething: { baby: 2 },
    rattle: { baby: 2 },
    monitor: { baby: 1, electronics: 1 },

    // ── Collectibles ─────────────────────────────────────────────
    vintage: { collectibles: 2, clothing: 0.5 },
    antique: { collectibles: 2 },
    rare: { collectibles: 1 },
    signed: { collectibles: 2 },
    comic: { collectibles: 2 },
    stamp: { collectibles: 2 },
    coin: { collectibles: 2 },
    trading: { collectibles: 1 },
    memorabilia: { collectibles: 2 },
    autograph: { collectibles: 2 },
    statue: { collectibles: 1 },

    // ── Health & Beauty ──────────────────────────────────────────
    vitamin: { health: 2 },
    collagen: { health: 2 },
    omega: { health: 2 },
    medical: { health: 2 },
    dental: { health: 2 },
    surgical: { health: 2 },
    skincare: { health: 2 },
    moisturiser: { health: 2 },
    moisturizer: { health: 2 },
    serum: { health: 2 },
    retinol: { health: 2 },
    makeup: { health: 2 },
    foundation: { health: 2 },
    lipstick: { health: 2 },
    mascara: { health: 2 },
    shampoo: { health: 1, pets: 0.5 },
    conditioner: { health: 1 },
    straightener: { health: 1 },
}

// ── Category Profiles ──────────────────────────────────────────────────────
// searchMultiplier: how much more/less searched vs default
// conversionRate:   what % of own-total listings convert to sales
export const CATEGORY_PROFILES: Record<EbayCategory, {
    searchMultiplier: number
    conversionRate: number
    label: string
}> = {
    electronics: { searchMultiplier: 2.8, conversionRate: 0.0080, label: 'Electronics' },
    automotive: { searchMultiplier: 2.2, conversionRate: 0.0120, label: 'Automotive' },
    pets: { searchMultiplier: 1.2, conversionRate: 0.0180, label: 'Pet Supplies' },
    clothing: { searchMultiplier: 1.6, conversionRate: 0.0065, label: 'Clothing' },
    toys: { searchMultiplier: 1.4, conversionRate: 0.0160, label: 'Toys & Games' },
    homeGarden: { searchMultiplier: 1.1, conversionRate: 0.0100, label: 'Home & Garden' },
    sports: { searchMultiplier: 1.5, conversionRate: 0.0110, label: 'Sports' },
    baby: { searchMultiplier: 1.0, conversionRate: 0.0220, label: 'Baby' },
    collectibles: { searchMultiplier: 0.6, conversionRate: 0.0250, label: 'Collectibles' },
    health: { searchMultiplier: 1.3, conversionRate: 0.0140, label: 'Health & Beauty' },
    default: { searchMultiplier: 1.0, conversionRate: 0.0120, label: 'General' },
}

// ── Main detector function ────────────────────────────────────────────────────
export function detectCategory(seedKeyword: string): CategoryResult {
    const words = seedKeyword
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 1)

    // Score each category
    const scores: Partial<Record<EbayCategory, number>> = {}

    for (const word of words) {
        const matches = CATEGORY_DICT[word]
        if (!matches) continue
        for (const [cat, weight] of Object.entries(matches) as [EbayCategory, number][]) {
            scores[cat] = (scores[cat] ?? 0) + weight
        }
    }

    // Find winner
    let bestCategory: EbayCategory = 'default'
    let bestScore = 0

    for (const [cat, score] of Object.entries(scores) as [EbayCategory, number][]) {
        if (score > bestScore) {
            bestScore = score
            bestCategory = cat
        }
    }

    // Confidence based on score
    const confidence = bestScore >= 3 ? 'high'
        : bestScore >= 2 ? 'medium'
            : bestScore >= 1 ? 'low'
                : 'none'

    return { category: bestCategory, confidence, score: bestScore }
}
