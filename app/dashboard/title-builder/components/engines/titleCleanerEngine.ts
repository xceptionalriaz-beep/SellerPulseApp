// app/dashboard/title-builder/components/engines/titleCleanerEngine.ts

export interface CleanResult {
  title: string
  changed: boolean
  log: CleanLogEntry[]
}

export interface CleanLogEntry {
  type: 'removed' | 'fixed' | 'deduped' | 'trimmed'
  label: string
  detail: string
}

// ── Gap 2/9: Policy phrases — removed before any other processing ─────────────
// Gap 9 fix: added 'free postage', 'free p&p', 'free p and p'
// Gap 10 fix: 'clearance sale', 'garage sale', 'car boot sale' excluded — those
// are legitimate product descriptions. Only bare 'sale' in a promotional context
// is removed. We target it with a tighter pattern (see Step 2 below).
// 'not working', 'not tested' etc. are handled separately in Step 2c (contextual)
// because 'not' alone is legitimate — only the combination triggers suppression.
const POLICY_PHRASES = [
  // ── Shipping promises (eBay policy violation) ───────────────────────────────
  'free shipping', 'free ship', 'free post', 'free postage', 'free delivery',
  'free p&p', 'free p and p',

  // ── Hype / attention words ───────────────────────────────────────────────────
  'wow', 'l@@k', 'look!!!',

  // ── Guarantees / promises ────────────────────────────────────────────────────
  'guaranteed', 'guarantee',

  // ── Promotional pricing language ─────────────────────────────────────────────
  // These signal discounting rather than product description and hurt Cassini rank
  'best price', 'lowest price', 'hot deal', 'special offer', 'limited offer',
  'bargain', 'cheap', 'discount', 'reduced',
  'today only', 'while stocks last', 'limited time',

  // ── Call-to-action phrases ───────────────────────────────────────────────────
  'buy now', 'dont miss', "don't miss", 'act now', 'click here',

  // ── Redirect phrases (send buyers away from the title) ───────────────────────
  // eBay Cassini suppresses titles that redirect buyers to pics/description
  'see description', 'read description',
  'see pics', 'see photos', 'see pictures', 'see listing',
  'as pictured', 'as shown', 'as described',

  // ── Bonus / gift language ─────────────────────────────────────────────────────
  'bonus', 'no reserve', 'must see', 'must-see',

  // ── Buyer behaviour manipulation ──────────────────────────────────────────────
  'no offers', 'no returns', 'no refunds',

  // ── 'save' — promotional pricing signal ──────────────────────────────────────
  // Note: 'save' is matched word-boundary so 'Lifesaver', 'Save the Bees'
  // product names won't fire (those are multi-word, not standalone 'save')
  'save',

  // ── 'amazing', 'incredible' — confirmed Cassini suppression triggers ─────────
  'amazing', 'incredible',
]

// ── 'sale' context — removed only when NOT a legitimate product description ───
const SALE_SAFE_CONTEXTS = /(?:garage|car\s*boot|clearance|jumble|yard|boot)\s+sale/i

// ── 'not X' phrases — removed contextually (not word triggers alone) ─────────
// 'not' alone is fine. Only these specific combinations trigger Cassini's
// keyword-spam or counterfeit filter.
const NOT_PHRASES = [
  'not working', 'not tested', 'not genuine', 'not original',
  'not authentic', 'not real', 'not functional', 'not oem',
]

// ── Grammar words — lowercase unless first word ───────────────────────────────
const LOWER_CASE_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to',
  'from', 'by', 'with', 'in', 'of',
])

// ── Dedup: stopwords that can repeat legitimately ────────────────────────────
const DEDUP_STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to',
  'from', 'by', 'with', 'in', 'of', 'new', 'used',
])

// ── Gap 12: Tech acronyms — expanded list ────────────────────────────────────
const FORCE_UPPER = new Set([
  // USB / connectivity
  'USB', 'USB-C', 'USB-A', 'USB-B', 'USBC',
  'HDMI', 'VGA', 'DVI', 'SCART', 'RCA', 'AUX', 'DisplayPort',
  'SATA', 'PCIe', 'M.2', 'NVMe', 'NVME',
  // Memory / storage
  'SSD', 'HDD', 'RAM', 'ROM', 'EMMC', 'MICROSD', 'MICROSDXC',
  'DDR4', 'DDR5', 'DDR3', 'ECC',
  // Processing
  'CPU', 'GPU', 'PCB', 'IC',
  // Display
  'LCD', 'LED', 'OLED', 'AMOLED', 'HD', 'FHD', 'QHD', 'UHD', '4K', '8K', '2K', 'HDR', 'SDR',
  // Network / wireless
  '5G', '4G', '3G', 'LTE', 'NFC', 'GPS', 'WIFI', 'BLUETOOTH', 'BT', 'TWS', 'ANR',
  // Power
  'AC', 'DC', 'PD', 'GaN',
  // AV / broadcast
  'TV', 'DVR', 'DVB', 'DAB', 'DAC', 'AMP', 'FM', 'AM',
  // Computer brands / acronyms
  'PC', 'MAC', 'HP', 'LG', 'JBL',
  // Waterproof ratings
  'IP67', 'IP68', 'IP65', 'IP66', 'IP54', 'IP44', 'IPX4', 'IPX5', 'IPX7',
  'MFi',
  // Regions
  'UK', 'US', 'EU', 'AUS', 'UAE',
  // Gaming systems
  'NES', 'SNES', 'GBA', 'GBC', 'N64',
  // Gap 2+3 fix: clothing/size abbreviations — always uppercase so S/M/L/XL → S/M/L/XL
  'XS', 'XL', 'XXL', 'XXXL',
  // Other common eBay specs
  'OEM', 'BNIB', 'BNWT',
])

// ── Gap 6: Roman numerals — preserve uppercase ────────────────────────────────
// Matches standalone I II III IV V VI VII VIII IX X XI XII and common combos
const ROMAN_NUMERAL = /^(I{1,3}|IV|VI{0,3}|IX|XI{0,2}|XII)$/i

// ── Gap 5: Expanded brand list ────────────────────────────────────────────────
const BRAND_CASES: Record<string, string> = {
  // Apple
  'iphone': 'iPhone', 'ipad': 'iPad', 'macbook': 'MacBook', 'imac': 'iMac',
  'ipod': 'iPod', 'airpods': 'AirPods', 'airtag': 'AirTag', 'appletv': 'AppleTV',
  'ios': 'iOS', 'macos': 'macOS', 'watchos': 'watchOS', 'tvos': 'tvOS',
  // Samsung / Google
  'samsung': 'Samsung', 'galaxy': 'Galaxy',
  'google': 'Google', 'chromecast': 'Chromecast', 'chromebook': 'Chromebook', 'youtube': 'YouTube',
  // Gaming
  'playstation': 'PlayStation', 'xbox': 'Xbox', 'nintendo': 'Nintendo',
  'gameboy': 'GameBoy', 'gamecube': 'GameCube', 'wii': 'Wii', 'amiibo': 'Amiibo',
  'gamewatch': 'Game Watch',
  // Power tools
  'dewalt': 'DeWalt', 'makita': 'Makita', 'bosch': 'Bosch', 'milwaukee': 'Milwaukee',
  'ryobi': 'Ryobi', 'dremel': 'Dremel', 'stanley': 'Stanley', 'craftsman': 'Craftsman',
  'worx': 'Worx', 'hikoki': 'HiKOKI', 'metabo': 'Metabo',
  // Home / kitchen
  'dyson': 'Dyson', 'hoover': 'Hoover', 'delonghi': 'DeLonghi', 'kenwood': 'Kenwood',
  'kitchenaid': 'KitchenAid', 'nespresso': 'Nespresso', 'nescafe': 'Nescafe',
  'breville': 'Breville', 'smeg': 'Smeg', 'sage': 'Sage', 'nutribullet': 'Nutribullet',
  'airfryer': 'Air Fryer',
  // Audio / AV
  'sony': 'Sony', 'bose': 'Bose', 'sennheiser': 'Sennheiser', 'skullcandy': 'Skullcandy',
  'anker': 'Anker', 'jabra': 'Jabra', 'beats': 'Beats', 'marshall': 'Marshall',
  'harman': 'Harman', 'shure': 'Shure', 'audio-technica': 'Audio-Technica',
  // Computers
  'thinkpad': 'ThinkPad', 'lenovo': 'Lenovo', 'asus': 'ASUS', 'acer': 'Acer',
  'dell': 'Dell', 'razer': 'Razer', 'corsair': 'Corsair', 'logitech': 'Logitech',
  'kingston': 'Kingston', 'sandisk': 'SanDisk', 'seagate': 'Seagate', 'western': 'Western',
  // Sports / Fashion
  'nike': 'Nike', 'adidas': 'Adidas', 'puma': 'Puma', 'reebok': 'Reebok',
  'converse': 'Converse', 'vans': 'Vans', 'timberland': 'Timberland', 'lacoste': 'Lacoste',
  'levis': "Levi's", "levi's": "Levi's", 'fila': 'Fila', 'umbro': 'Umbro',
  'under armour': 'Under Armour', 'columbia': 'Columbia', 'the north face': 'The North Face',
  // Cameras
  'gopro': 'GoPro', 'canon': 'Canon', 'nikon': 'Nikon', 'fujifilm': 'Fujifilm',
  'olympus': 'Olympus', 'panasonic': 'Panasonic', 'leica': 'Leica', 'sigma': 'Sigma',
  // eBay platform
  'ebay': 'eBay', 'paypal': 'PayPal',
  // Pet
  'purina': 'Purina', 'pedigree': 'Pedigree', 'whiskas': 'Whiskas', 'kong': 'KONG',
  // Toys / collectibles
  'lego': 'LEGO', 'barbie': 'Barbie', 'hotwheels': 'Hot Wheels', 'hotwheel': 'Hot Wheel',
  'funko': 'Funko', 'hasbro': 'Hasbro', 'mattel': 'Mattel', 'bandai': 'Bandai',
  // Other
  'zippo': 'Zippo', 'leatherman': 'Leatherman', 'victorinox': 'Victorinox',
  'fitbit': 'Fitbit', 'garmin': 'Garmin', 'tomtom': 'TomTom',
  'philips': 'Philips', 'braun': 'Braun', 'oral-b': 'Oral-B', 'colgate': 'Colgate',
  'gillette': 'Gillette', 'remington': 'Remington',
}

// ── Gap 4b: Smart number+unit casing rules ────────────────────────────────────
const UNIT_RULES: Array<{ pattern: RegExp; format: (m: RegExpMatchArray) => string }> = [
  { pattern: /^(\d+(?:\.\d+)?)(w)$/i, format: m => `${m[1]}W` },
  { pattern: /^(\d+(?:\.\d+)?)(v)$/i, format: m => `${m[1]}V` },
  { pattern: /^(\d+(?:\.\d+)?)(ma|a)$/i, format: m => `${m[1]}${m[2].toUpperCase()}` },
  { pattern: /^(\d+(?:\.\d+)?)(hz|khz|mhz|ghz)$/i, format: m => `${m[1]}${m[2][0].toUpperCase()}${m[2].slice(1).toLowerCase()}` },
  { pattern: /^(\d+(?:\.\d+)?)(m)$/i, format: m => `${m[1]}m` },
  { pattern: /^(\d+(?:\.\d+)?)(cm|mm)$/i, format: m => `${m[1]}${m[2].toLowerCase()}` },
  { pattern: /^(\d+(?:\.\d+)?)(ft|in)$/i, format: m => `${m[1]}${m[2].toLowerCase()}` },
  // Gap 7 fix: digit×digit stays lowercase x e.g. 32x32, 10x8, A4 size
  { pattern: /^(\d+)(x)(\d+)$/i, format: m => `${m[1]}x${m[3]}` },
  { pattern: /^(\d+)(x)$/i, format: m => `${m[1]}x` },
  { pattern: /^(\d+)(pk|pc|pcs|pack)$/i, format: m => `${m[1]}${m[2].toLowerCase()}` },
  { pattern: /^(\d+)(k)$/i, format: m => `${m[1]}K` },
  { pattern: /^(\d+(?:\.\d+)?)(gb|tb|mb|kb)$/i, format: m => `${m[1]}${m[2].toUpperCase()}` },
  { pattern: /^(\d+)(mah)$/i, format: m => `${m[1]}mAh` },
  { pattern: /^(\d+(?:\.\d+)?)(wh)$/i, format: m => `${m[1]}Wh` },
]

// ── Shorthand normalisation ───────────────────────────────────────────────────
// Sorted longest-first so longer codes always match before shorter overlapping
// ones (e.g. 'bnwt' before 'bn', 'vguc' before 'vgc', 'nwot' before 'nwt').
// The sort happens at runtime in Step 4, but ordering here is kept for clarity.
const SHORTHAND: Record<string, string> = {

  // ── Condition — new / unused ───────────────────────────────────────────────
  'bnwt': 'Brand New With Tags',    // must stay before 'bn'
  'bnib': 'Brand New In Box',       // must stay before 'bn'
  'nrfb': 'Never Removed From Box',
  'nwot': 'New Without Tags',       // must stay before 'nwt'
  'nwob': 'New Without Box',        // must stay before 'nib'
  'nwt': 'New With Tags',
  'nib': 'New In Box',
  'nos': 'New Old Stock',
  'nbw': 'Never Been Worn',
  'mib': 'Mint In Box',
  'b/n': 'Brand New',
  'bn': 'Brand New',              // last in the new group

  // ── Condition — used / graded ─────────────────────────────────────────────
  'vguc': 'Very Good Used Condition', // must stay before 'vgc'
  'vhtf': 'Very Hard To Find',        // must stay before 'htf'
  'vgc': 'Very Good Condition',
  'euc': 'Excellent Used Condition',
  'exc': 'Excellent Condition',
  'guc': 'Good Used Condition',
  'gc': 'Good Condition',
  'fc': 'Fine Condition',
  'vf': 'Very Fine Condition',
  'nm': 'Near Mint',
  'ln': 'Like New',
  'gu': 'Gently Used',
  'htf': 'Hard To Find',
  'sais': 'Sold As Is',
  'doa': 'Dead On Arrival',

  // ── Condition — specific to collectibles / toys ───────────────────────────
  'ooak': 'One Of A Kind',
  'oop': 'Out Of Print',
  'ret': 'Retired',
  'le': 'Limited Edition',
  'ltd': 'Limited Edition',
  'coa': 'Certificate Of Authenticity',
  'moc': 'Mint On Card',
  'momc': 'Mint On Mint Card',

  // ── Authenticity / origin ─────────────────────────────────────────────────
  'orig': 'Original',
  'auth': 'Authentic',
  'repro': 'Reproduction',
  'sig': 'Signed',
  // 'auto' intentionally excluded — too ambiguous (auto parts vs autographed)
  'mij': 'Made In Japan',
  'miu': 'Made In USA',

  // ── Books ─────────────────────────────────────────────────────────────────
  // 'hb'/'pb' excluded — risk of matching inside hub/pub/herb
  // 'ed' excluded — too short, matches inside many words
  'dlx': 'Deluxe',

  // ── Clothing / fashion ────────────────────────────────────────────────────
  'vtg': 'Vintage',
  'vntg': 'Vintage',
  'mcm': 'Mid Century Modern',
  'sz': 'Size',
  // 'pr' excluded — too ambiguous (pair vs Puerto Rico vs price vs per)

  // ── General eBay ─────────────────────────────────────────────────────────
  'w/o': 'Without',                // must stay before 'w/'
  'w/': 'With',
  'approx': 'Approx',
  'incl': 'Including',
  'excl': 'Excluding',
  'qty': 'Quantity',
  'pcs': 'Pieces',
  'ref': 'Reference',
  'lpuo': 'Local Pick Up Only',
  'b&w': 'Black And White',
  // 'ss' excluded — too ambiguous (Stainless Steel vs Short Sleeve vs Still Sealed)
}

const TRAILING_JUNK = /[\s\-,.|+&]+$/

function applyUnitRule(word: string): string | null {
  for (const rule of UNIT_RULES) {
    const m = word.match(rule.pattern)
    if (m) return rule.format(m)
  }
  return null
}

// ── Gap 2+3 fix: fixCompound handles ALL parts of slash/hyphen words ─────────
// Old: only capitalised the first part (white/black → White/black)
// New: capitalises every part (white/black → White/Black, s/m/l/xl → S/M/L/XL,
//      red/blue/green → Red/Blue/Green)
function processToken(token: string, isFirst: boolean, prevProcessed = ''): string {
  if (!token) return token
  const lower = token.toLowerCase()
  // Brand check
  if (BRAND_CASES[lower]) return BRAND_CASES[lower]
  // Acronym check
  if (FORCE_UPPER.has(token.toUpperCase())) return token.toUpperCase()
  // Roman numeral — keep uppercase
  if (ROMAN_NUMERAL.test(token)) return token.toUpperCase()
  // Unit rule
  const unit = applyUnitRule(token)
  if (unit) return unit
  // Number-only — return as-is
  if (/^\d+$/.test(token)) return token
  // Grammar word — lowercase unless isFirst
  if (LOWER_CASE_WORDS.has(lower) && !isFirst) {
    // Spec letter after Type/Size/Model/Grade stays uppercase
    const specSignals = ['type', 'size', 'model', 'grade', 'series', 'version', 'gen', 'tier']
    if (token.length === 1 && specSignals.includes(prevProcessed.toLowerCase())) {
      return token.toUpperCase()
    }
    return lower
  }
  // Title case
  return token.length > 1
    ? token[0].toUpperCase() + lower.slice(1)
    : token.toUpperCase()
}

function fixCompound(word: string, sep: '/' | '-', isFirst: boolean, prevProcessed = ''): string {
  const parts = word.split(sep)
  return parts.map((part, pi) =>
    processToken(part, isFirst && pi === 0, pi === 0 ? prevProcessed : parts[pi - 1])
  ).join(sep)
}

// ── Gap 5: Split CamelCase words (e.g. SamsungGalaxyS24Case) ─────────────────
// Only triggers when the entire input had NO spaces and the word is long.
// Strategy: insert space before each uppercase letter that starts a new word,
// using multiple passes to handle mixed cases like 'GALAXYS24CaseName'
function splitCamelCase(word: string): string[] {
  if (word.length < 10) return [word]
  // Pass 1: insert space between a lowercase letter followed by uppercase
  //   'SamsungGalaxy' → 'Samsung Galaxy'
  let split = word.replace(/([a-z])([A-Z])/g, '$1 $2')
  // Pass 2: insert space between a sequence of capitals and the start of the next word
  //   'GalaxyS24Case' → 'Galaxy S24 Case' (the digit breaks the all-caps run)
  split = split.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  // Pass 3: insert space between letters and digits (S24 → S 24 only if long run)
  //   'GALAXYS24' → 'GALAXY S24'
  split = split.replace(/([A-Za-z]{3,})(\d)/g, '$1 $2')
  split = split.replace(/(\d)([A-Za-z]{3,})/g, '$1 $2')
  const parts = split.split(/\s+/).filter(Boolean)
  return parts.length > 1 ? parts : [word]
}

// ── Gap 8: Detect and remove price strings ───────────────────────────────────
// e.g. '£9.99', '$29.99', '€14.50' — prices in titles are bad practice
// and get stripped along with the currency symbol before char stripping.
function removePrices(title: string): { result: string; found: boolean } {
  const priceRegex = /[£$€]\s*\d+(?:\.\d{1,2})?/gi
  const found = priceRegex.test(title)
  return { result: title.replace(priceRegex, ' '), found }
}

// ── Gap 4: Remove leading filler stopwords ────────────────────────────────────
// 'for the for a with the for iPhone' → 'iPhone'
// Only fires when the title starts with stopwords and there are real words after
function removeLeadingStopwords(words: string[]): { words: string[]; removed: number } {
  let i = 0
  while (i < words.length - 1 && LOWER_CASE_WORDS.has(words[i].toLowerCase())) i++
  return { words: words.slice(i), removed: i }
}

// ─────────────────────────────────────────────────────────────────────────────
export class TitleCleanerEngine {
  static clean(messyTitle: string): CleanResult {
    if (!messyTitle.trim()) return { title: '', changed: false, log: [] }

    const log: CleanLogEntry[] = []
    let title = messyTitle

    // ── Step 1: L@@K and similar tricks ──────────────────────────────────────
    if (/l@@k/i.test(title)) {
      title = title.replace(/l@@k/gi, '')
      log.push({ type: 'removed', label: 'Removed eBay trick', detail: "'L@@K' removed" })
    }

    // ── Step 2a: Remove policy phrases ───────────────────────────────────────
    const removedPolicies: string[] = []
    for (const phrase of POLICY_PHRASES) {
      const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      if (regex.test(title)) {
        removedPolicies.push(`'${phrase}'`)
        title = title.replace(regex, ' ')
      }
    }

    // ── Step 2b: Remove standalone 'sale' (contextual) ───────────────────────
    if (!SALE_SAFE_CONTEXTS.test(title) && /\bsale\b/i.test(title)) {
      removedPolicies.push("'sale'")
      title = title.replace(/\bsale\b/gi, ' ')
    }

    // ── Step 2c: Remove 'not X' counterfeit/spam phrases ─────────────────────
    // 'not' alone is a legitimate word. Only remove the specific combinations
    // that eBay's Cassini flags as keyword manipulation or counterfeit signals.
    for (const phrase of NOT_PHRASES) {
      const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      if (regex.test(title)) {
        removedPolicies.push(`'${phrase}'`)
        title = title.replace(regex, ' ')
      }
    }

    if (removedPolicies.length) {
      log.push({
        type: 'removed',
        label: `Removed ${removedPolicies.length} policy word${removedPolicies.length > 1 ? 's' : ''}`,
        detail: removedPolicies.slice(0, 3).join(', ') + (removedPolicies.length > 3 ? ` +${removedPolicies.length - 3} more` : ''),
      })
    }

    // ── Step 2c: Remove prices (Gap 8 fix) ───────────────────────────────────
    const { result: noPrices, found: hadPrices } = removePrices(title)
    if (hadPrices) {
      title = noPrices
      log.push({ type: 'removed', label: 'Removed price', detail: 'Price values removed (bad eBay practice)' })
    }

    // ── Step 3: Strip non-standard characters ─────────────────────────────────
    title = title.replace(/[^a-zA-Z0-9\s\-\/&.']/g, ' ')

    // ── Step 4: Normalise shorthands ─────────────────────────────────────────
    // Gap 11 fix: sort by key length desc so 'bnwt' always matches before 'bn'.
    // Use tight lookbehind/lookahead to avoid firing inside words like 'cabin'.
    // Track words from shorthand expansions — they are already Title Cased and
    // must NOT be lowercased by the grammar-word rule (e.g. 'With' in
    // 'Brand New With Tags' must stay 'With', not become 'with').
    const replacedShorthands: string[] = []
    const shorthandWords = new Set<string>() // words protected from grammar lowercasing
    const sortedShorthands = Object.entries(SHORTHAND).sort((a, b) => b[0].length - a[0].length)
    for (const [abbr, full] of sortedShorthands) {
      const escaped = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\//g, '\\/')
      const regex = new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, 'gi')
      if (regex.test(title)) {
        replacedShorthands.push(`${abbr} → ${full}`)
        title = title.replace(regex, ` ${full} `)
        full.split(' ').forEach(w => shorthandWords.add(w.toLowerCase()))
      }
    }
    if (replacedShorthands.length) {
      log.push({
        type: 'fixed',
        label: 'Expanded shorthands',
        detail: replacedShorthands.slice(0, 3).join(', '),
      })
    }

    // ── Step 5: Collapse spaces ───────────────────────────────────────────────
    title = title.replace(/\s+/g, ' ').trim()
    if (!title) return { title: '', changed: false, log: [] }

    // ── Step 5b: Gap 4 — remove leading stopwords ─────────────────────────────
    const words0 = title.split(' ').filter(Boolean)
    const { words: trimmedWords, removed: leadingRemoved } = removeLeadingStopwords(words0)
    if (leadingRemoved > 0) {
      title = trimmedWords.join(' ')
      log.push({ type: 'removed', label: 'Removed leading filler words', detail: `${leadingRemoved} leading stopword${leadingRemoved > 1 ? 's' : ''} removed` })
    }

    // ── Step 5c: Gap 5 — CamelCase split (only when input had no spaces) ──────
    // We detect "no spaces" by checking the original messyTitle
    const hadNoSpaces = !messyTitle.trim().includes(' ') && messyTitle.trim().length > 10
    if (hadNoSpaces) {
      const camelWords = splitCamelCase(title)
      if (camelWords.length > 1) {
        title = camelWords.join(' ')
        log.push({ type: 'fixed', label: 'Split CamelCase', detail: `'${messyTitle.trim()}' → separated words` })
      }
    }

    // ── Step 6: Word-level processing ────────────────────────────────────────
    const words = title.split(' ').filter(Boolean)
    const processed: string[] = []
    const casingFixed: string[] = []

    for (let i = 0; i < words.length; i++) {
      let word = words[i].trim()
      if (!word) continue

      const lower = word.toLowerCase()
      const isFirst = processed.length === 0
      const prevOut = processed[processed.length - 1] ?? ''

      // ── 6a. Brand check ───────────────────────────────────────────────────
      if (BRAND_CASES[lower]) {
        const fixed = BRAND_CASES[lower]
        if (fixed !== word) casingFixed.push(`${word}→${fixed}`)
        processed.push(fixed)
        continue
      }

      // ── 6b. Acronym check ─────────────────────────────────────────────────
      if (FORCE_UPPER.has(word.toUpperCase()) && !/[-\/]/.test(word)) {
        const fixed = word.toUpperCase()
        if (fixed !== word) casingFixed.push(`${word}→${fixed}`)
        processed.push(fixed)
        continue
      }

      // ── 6c. Roman numeral ─────────────────────────────────────────────────
      // Gap 6 fix: III → III, IV → IV, NES/SNES handled by FORCE_UPPER above
      if (ROMAN_NUMERAL.test(word)) {
        const fixed = word.toUpperCase()
        if (fixed !== word) casingFixed.push(`${word}→${fixed}`)
        processed.push(fixed)
        continue
      }

      // ── 6d. Compound slash: white/black → White/Black ─────────────────────
      // Gap 2+3 fix: fixCompound now processes ALL parts, not just the first
      if (word.includes('/') && !word.startsWith('/') && !word.endsWith('/')) {
        const fixed = fixCompound(word, '/', isFirst, prevOut)
        if (fixed !== word) casingFixed.push(`${word}→${fixed}`)
        processed.push(fixed)
        continue
      }

      // ── 6e. Compound hyphen ───────────────────────────────────────────────
      if (word.includes('-') && word !== '-' && !word.startsWith('-') && !word.endsWith('-')) {
        // All-caps spec like XS-M, A-Z — keep as-is
        if (/^[A-Z0-9]+-[A-Z0-9]+$/.test(word)) {
          processed.push(word)
          continue
        }
        // Known full acronym like USB-C
        if (FORCE_UPPER.has(word.toUpperCase())) {
          const fixed = word.toUpperCase()
          if (fixed !== word) casingFixed.push(`${word}→${fixed}`)
          processed.push(fixed)
          continue
        }
        const fixed = fixCompound(word, '-', isFirst, prevOut)
        if (fixed !== word) casingFixed.push(`${word}→${fixed}`)
        processed.push(fixed)
        continue
      }

      // ── 6f. Trailing hyphen strip ─────────────────────────────────────────
      if (word.endsWith('-')) {
        word = word.slice(0, -1)
        if (!word) continue
      }

      // ── 6g. Unit / number rules ───────────────────────────────────────────
      if (/\d/.test(word)) {
        const unitResult = applyUnitRule(word)
        if (unitResult) {
          if (unitResult !== word) casingFixed.push(`${word}→${unitResult}`)
          processed.push(unitResult)
          continue
        }
        // Has digits + letters but no unit rule → uppercase (S24, S23Ultra, etc.)
        const fixed = word.toUpperCase()
        if (fixed !== word) casingFixed.push(`${word}→${fixed}`)
        processed.push(fixed)
        continue
      }

      // ── 6h. Grammar word ──────────────────────────────────────────────────
      if (LOWER_CASE_WORDS.has(lower) && !isFirst) {
        // Gap 11 fix: words from shorthand expansions are already Title Cased —
        // don't lowercase them (e.g. 'With' in 'Brand New With Tags')
        if (shorthandWords.has(lower)) {
          const fixed = word[0].toUpperCase() + lower.slice(1)
          processed.push(fixed)
          continue
        }
        // Spec letter after Type/Size/Model stays uppercase
        const specSignals = ['type', 'size', 'model', 'grade', 'series', 'version', 'gen', 'tier']
        if (word.length === 1 && specSignals.includes(prevOut.toLowerCase())) {
          processed.push(word.toUpperCase())
        } else {
          processed.push(lower)
        }
        continue
      }

      // ── 6i. Standalone unit word after a number ────────────────────────────
      // Gap 7 fix: '32x32 cm' → 'cm' stays lowercase, not title-cased to 'Cm'
      // Also handles: '10 kg', '5 ft', '200 ml', '1.5 m' etc.
      const STANDALONE_UNITS = new Set(['cm', 'mm', 'ft', 'in', 'm', 'km', 'kg', 'g', 'lb', 'oz', 'ml', 'cl', 'l'])
      if (STANDALONE_UNITS.has(lower)) {
        const prevWasNum = /^\d+(?:\.\d+)?$/.test(prevOut) || /^\d+[xX]\d+$/.test(prevOut)
        if (prevWasNum) {
          processed.push(lower)
          continue
        }
      }

      // ── 6j. Standard title case ───────────────────────────────────────────
      const fixed = word.length > 1
        ? word[0].toUpperCase() + lower.slice(1)
        : word.toUpperCase()
      if (fixed !== word) casingFixed.push(`${word}→${fixed}`)
      processed.push(fixed)
    }

    if (casingFixed.length) {
      log.push({
        type: 'fixed',
        label: `Fixed ${casingFixed.length} casing issue${casingFixed.length > 1 ? 's' : ''}`,
        detail: casingFixed.slice(0, 3).join(', ') + (casingFixed.length > 3 ? ` +${casingFixed.length - 3} more` : ''),
      })
    }

    // ── Step 7: Remove duplicate words ───────────────────────────────────────
    const seen = new Set<string>()
    const deduped: string[] = []
    const dupeWords: string[] = []

    for (const word of processed) {
      const key = word.toLowerCase()
      if (!DEDUP_STOPWORDS.has(key) && seen.has(key)) {
        dupeWords.push(word)
        continue
      }
      seen.add(key)
      deduped.push(word)
    }

    if (dupeWords.length) {
      log.push({
        type: 'deduped',
        label: `Removed ${dupeWords.length} duplicate word${dupeWords.length > 1 ? 's' : ''}`,
        detail: dupeWords.map(w => `'${w}'`).join(', '),
      })
    }

    // ── Step 8: Strip trailing junk ──────────────────────────────────────────
    let result = deduped.join(' ').replace(TRAILING_JUNK, '').trim()

    // ── Step 9: 80-char limit ─────────────────────────────────────────────────
    if (result.length > 80) {
      const before = result
      let cut = result.substring(0, 80)
      const lastSp = cut.lastIndexOf(' ')
      result = lastSp > 0 ? result.substring(0, lastSp) : cut
      const trimWords = result.split(' ')
      while (trimWords.length && LOWER_CASE_WORDS.has(trimWords[trimWords.length - 1].toLowerCase())) {
        trimWords.pop()
      }
      result = trimWords.join(' ')
      log.push({
        type: 'trimmed',
        label: 'Trimmed to eBay 80-char limit',
        detail: `Was ${before.length} chars, now ${result.length} chars`,
      })
    }

    const changed = result !== messyTitle.trim()
    return { title: result, changed, log }
  }
}
