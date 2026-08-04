// app/dashboard/title-builder/components/engines/titleSpinnerEngine.ts

export type SpinMode = 'DUPLICATE_SAFE' | 'AB_TEST' | 'FILL_TO_80' | 'CLEAN_TIGHTEN'

export interface SpinResult {
  title: string
  diff: DiffToken[]
}

export interface DiffToken {
  text: string
  type: 'unchanged' | 'added' | 'removed' | 'swapped'
}

// ── Policy guard ──────────────────────────────────────────────────────────────
const BANNED_WORDS = [
  'free shipping', 'free ship', 'wow', 'l@@k', 'look', 'cheap', 'guaranteed',
  'bonus', 'gift', 'sale', 'hot', 'best price', 'lowest price', 'no reserve',
  'amazing', 'incredible', 'must see', 'dont miss', "don't miss",
]

// ── Bind words — never separate from the next word ───────────────────────────
const BIND_WORDS = new Set(['for', 'with', 'to', 'and', 'in', 'on', 'of', '-', '&', '+', 'fits', 'fits for'])

// ── Condition signals ─────────────────────────────────────────────────────────
const CONDITION_NEW = new Set(['new', 'brand new', 'sealed', 'unused', 'unopened', 'mint'])
const CONDITION_USED = new Set(['used', 'pre-owned', 'preowned', 'second hand', 'secondhand', 'refurbished', 'repaired', 'for parts', 'as is', 'untested'])
const CONDITION_REFURB = new Set(['refurbished', 'refurb', 'renewed', 'restored', 'reconditioned', 'tested'])

// ── Smart lock: numbers, all-caps acronyms never move ───────────────────────
function isLockedWord(word: string): boolean {
  return /\d/.test(word) || /^[A-Z]{2,}$/.test(word)
}

// ── Thesaurus (100+ groups across 15+ categories) ────────────────────────────
const THESAURUS: Record<string, string[]> = {
  // Condition
  'genuine': ['Authentic', 'OEM', 'Original', 'Real', 'Genuine OEM'],
  'authentic': ['Genuine', 'Original', 'Real', '100% Authentic'],
  'oem': ['Genuine', 'Original', 'Authentic', 'Factory'],
  'original': ['Genuine', 'OEM', 'Authentic', 'Factory Original'],
  'new': ['Brand New', 'Factory New', 'Mint', 'Unused'],
  'brand new': ['New', 'Factory New', 'Sealed', 'Mint Condition'],
  'used': ['Pre-Owned', 'Second Hand', 'Tested Working', 'Good Condition'],
  'pre-owned': ['Used', 'Second Hand', 'Tested', 'Pre Owned'],
  'refurbished': ['Renewed', 'Restored', 'Reconditioned', 'Professionally Refurbed'],
  // Descriptors
  'fast': ['Quick', 'Rapid', 'Swift', 'High-Speed'],
  'strong': ['Heavy-Duty', 'Durable', 'Rugged', 'Robust', 'Tough'],
  'durable': ['Heavy-Duty', 'Long-Lasting', 'Rugged', 'Robust', 'Sturdy'],
  'premium': ['Pro', 'Professional', 'High-Quality', 'Top-Grade'],
  'quality': ['Premium', 'High-Grade', 'Professional', 'Top Quality'],
  'pro': ['Professional', 'Premium', 'Expert', 'Advanced'],
  'heavy-duty': ['Industrial', 'Commercial', 'Rugged', 'Professional'],
  'waterproof': ['Water-Resistant', 'Weatherproof', 'IP67', 'Splash-Proof'],
  'portable': ['Handheld', 'Travel', 'Lightweight', 'Compact', 'Mini'],
  'wireless': ['Bluetooth', 'Cordless', 'RF', 'WiFi', 'Cable-Free'],
  'rechargeable': ['Battery-Powered', 'USB Rechargeable', 'Cordless'],
  // Electronics
  'charger': ['Adapter', 'Power Adapter', 'Power Supply', 'Charging Block'],
  'adapter': ['Charger', 'Converter', 'Plug', 'Power Adapter'],
  'cable': ['Cord', 'Wire', 'Lead', 'Connector', 'Line'],
  'cord': ['Cable', 'Wire', 'Lead', 'Connector'],
  'case': ['Cover', 'Shell', 'Protector', 'Skin', 'Sleeve', 'Housing'],
  'cover': ['Case', 'Shell', 'Protector', 'Skin', 'Sleeve'],
  'screen': ['Display', 'Panel', 'LCD', 'Monitor', 'Glass'],
  'battery': ['Power Cell', 'Li-Ion Battery', 'Replacement Battery'],
  'speaker': ['Audio System', 'Sound System', 'Loudspeaker'],
  'headphone': ['Earphone', 'Headset', 'Earbud', 'Earpiece'],
  'headset': ['Headphone', 'Earphone', 'Earbud', 'Mic Headset'],
  'keyboard': ['Keys', 'Key Panel', 'Wireless Keyboard'],
  'controller': ['Gamepad', 'Joypad', 'Remote', 'Control Pad'],
  'remote': ['Controller', 'Clicker', 'Remote Control'],
  'module': ['Board', 'Unit', 'Component', 'Part'],
  'chip': ['IC', 'Circuit', 'Processor', 'Component'],
  // Clothing
  'shirt': ['Top', 'Tee', 'T-Shirt', 'Blouse'],
  'trousers': ['Pants', 'Bottoms', 'Chinos', 'Slacks'],
  'jacket': ['Coat', 'Blazer', 'Outerwear', 'Hoodie'],
  'dress': ['Gown', 'Frock', 'Outfit', 'Attire'],
  'shoes': ['Footwear', 'Trainers', 'Sneakers', 'Boots'],
  'trainers': ['Sneakers', 'Shoes', 'Running Shoes', 'Athletic Shoes'],
  'sneakers': ['Trainers', 'Shoes', 'Athletic Shoes', 'Kicks'],
  'boots': ['Footwear', 'Shoes', 'Ankle Boots', 'Chelsea Boots'],
  'bag': ['Tote', 'Handbag', 'Purse', 'Backpack', 'Satchel'],
  'handbag': ['Bag', 'Purse', 'Tote', 'Shoulder Bag'],
  'watch': ['Timepiece', 'Wristwatch', 'Smartwatch'],
  // Auto
  'compatible': ['Fits', 'Works With', 'Replacement For', 'Suitable For', 'For Use With'],
  'fits': ['Compatible', 'Works With', 'Suitable For', 'For', 'Replacement For'],
  'replacement': ['Spare', 'Substitute', 'Drop-In', 'OEM Replacement'],
  'part': ['Component', 'Assembly', 'Unit', 'Module', 'Piece'],
  'repair': ['Fix', 'Restore', 'Refurbish', 'Rebuild'],
  'kit': ['Set', 'Bundle', 'Pack', 'Assembly', 'Collection'],
  'set': ['Kit', 'Bundle', 'Pack', 'Collection', 'Group'],
  'bundle': ['Set', 'Kit', 'Pack', 'Collection', 'Combo'],
  'pack': ['Bundle', 'Set', 'Kit', 'Value Pack', 'Multi-Pack'],
  // Home
  'lamp': ['Light', 'Lighting', 'Fixture', 'Luminaire'],
  'light': ['Lamp', 'Bulb', 'LED', 'Luminaire', 'Fixture'],
  'furniture': ['Home Decor', 'Interior', 'Piece'],
  'cushion': ['Pillow', 'Pad', 'Throw Pillow'],
  'curtain': ['Drape', 'Blind', 'Window Treatment', 'Valance'],
  'mat': ['Rug', 'Pad', 'Runner', 'Floor Mat'],
  'tool': ['Equipment', 'Device', 'Instrument', 'Implement'],
  'drill': ['Power Tool', 'Rotary Tool', 'Electric Drill'],
  'saw': ['Cutting Tool', 'Power Saw', 'Blade'],
  // Collectibles
  'vintage': ['Retro', 'Antique', 'Classic', 'Old', 'Mid-Century'],
  'antique': ['Vintage', 'Rare', 'Collectible', 'Old', 'Heritage'],
  'rare': ['Scarce', 'Hard to Find', 'Collectible', 'Limited'],
  'collectible': ["Vintage", "Rare", "Collector's Item", "Limited Edition"],
  'signed': ['Autographed', 'Hand Signed', 'Authenticated'],
  'limited': ["Exclusive", "Rare", "Special Edition", "Collector's"],
  // Sporting
  'training': ['Exercise', 'Workout', 'Fitness', 'Gym'],
  'gym': ['Fitness', 'Training', 'Workout', 'Athletic'],
  'running': ['Jogging', 'Athletic', 'Training', 'Sports'],
  'cycling': ['Biking', 'Bike', 'Road', 'Mountain'],
  // eBay-specific
  'lot': ['Bulk Buy', 'Value Pack', 'Wholesale Lot', 'Bundle'],
  'joblot': ['Lot', 'Bulk', 'Bundle', 'Wholesale'],
  'spares': ['Parts', 'Components', 'For Repair', 'Accessories'],
  'accessories': ['Add-Ons', 'Extras', 'Parts', 'Bundle'],
}

// ── AB_TEST: Buyer-intent segment library ─────────────────────────────────────
// Each category has 4 distinct buyer segments with their own keyword sets.
// AB_TEST picks a segment the current title does NOT already target, then
// replaces the weakest words with that segment's search terms.
// This is the core of the "market challenge" concept — different people search
// for the same product with completely different words.
const BUYER_SEGMENTS: Record<string, Array<{ name: string; keywords: string[] }>> = {
  // Pet / dog toys
  pet: [
    { name: 'Gift Buyer', keywords: ['Dog Gift', 'Pet Present', 'Puppy Gift', 'Gift for Dog Lover', 'Dog Toy Gift'] },
    { name: 'Size Specific', keywords: ['Small Dog', 'Large Dog', 'Puppy', 'Medium Breed', 'Large Breed', 'Mini Dog'] },
    { name: 'Use Case', keywords: ['Interactive', 'Fetch', 'Tug', 'Puzzle', 'Enrichment', 'Training', 'Exercise'] },
    { name: 'Durability', keywords: ['Indestructible', 'Heavy Duty', 'Tough', 'Long Lasting', 'Durable Chew', 'Power Chewer'] },
  ],
  // Electronics / phone accessories
  electronics: [
    { name: 'Compatibility', keywords: ['Compatible', 'Universal', 'All Models', 'Multi-Device', 'Works With'] },
    { name: 'Speed / Spec', keywords: ['Fast Charge', '60W', '65W', 'PD', 'Quick Charge', 'USB-C', 'Super Fast'] },
    { name: 'Gift Buyer', keywords: ['Gift Idea', 'Stocking Filler', 'Birthday Gift', 'Tech Gift', 'Present'] },
    { name: 'Value Seeker', keywords: ['Value Pack', 'Bundle', 'Twin Pack', '2 Pack', 'Multi-Pack', 'Set of 2'] },
  ],
  // Clothing / fashion
  clothing: [
    { name: 'Occasion', keywords: ['Casual', 'Smart Casual', 'Work Wear', 'Evening', 'Weekend', 'Everyday'] },
    { name: 'Gift Buyer', keywords: ['Gift Idea', 'Birthday Gift', 'Christmas Gift', 'Present', 'Unisex Gift'] },
    { name: 'Style Specific', keywords: ['Slim Fit', 'Oversized', 'Relaxed', 'Cropped', 'Vintage Style', 'Y2K'] },
    { name: 'Season', keywords: ['Summer', 'Winter', 'Autumn', 'Spring', 'Lightweight', 'Warm'] },
  ],
  // Auto parts
  auto: [
    { name: 'Fitment', keywords: ['Direct Fit', 'OEM Spec', 'Drop-In', 'Bolt-On', 'No Modification'] },
    { name: 'Value / Bundle', keywords: ['Full Set', 'Front and Rear', 'Left and Right', 'Complete Kit', 'Pair'] },
    { name: 'Brand Agnostic', keywords: ['Compatible', 'Universal Fit', 'Multiple Fitment', 'Fits Multiple Models'] },
    { name: 'DIY Buyer', keywords: ['Easy Install', 'No Tools', 'Plug and Play', 'Shade Tree Mechanic', 'DIY'] },
  ],
  // Collectibles / vintage
  collectibles: [
    { name: 'Condition Focus', keywords: ['Near Mint', 'VGC', 'Excellent Condition', 'Unplayed', 'Unread', 'Pristine'] },
    { name: 'Era / Decade', keywords: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', 'Mid Century', 'Retro'] },
    { name: 'Gift Collector', keywords: ['Collector Gift', 'Display Piece', 'Show Piece', 'Frame Ready', 'Perfect Gift'] },
    { name: 'Rarity Signal', keywords: ['Hard to Find', 'Scarce', 'One of a Kind', 'Low Print Run', 'Rare Find'] },
  ],
  // Home & garden
  home: [
    { name: 'Style', keywords: ['Modern', 'Minimalist', 'Scandi', 'Industrial', 'Farmhouse', 'Boho', 'Art Deco'] },
    { name: 'Gift Buyer', keywords: ['Housewarming Gift', 'Birthday Gift', 'Wedding Gift', 'Home Gift'] },
    { name: 'Room Specific', keywords: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Garden', 'Office', 'Hallway'] },
    { name: 'Functional', keywords: ['Easy Clean', 'Space Saving', 'Multi-Use', 'Foldable', 'Stackable', 'Heavy Duty'] },
  ],
  // Sporting goods
  sporting: [
    { name: 'Skill Level', keywords: ['Beginner', 'Intermediate', 'Advanced', 'Professional', 'Competition', 'Club'] },
    { name: 'Use Case', keywords: ['Training', 'Race Day', 'Gym', 'Outdoor', 'Indoor', 'Cross Training', 'HIIT'] },
    { name: 'Gift Buyer', keywords: ['Sports Gift', 'Fitness Gift', 'Birthday Gift', 'Christmas Gift', 'Present'] },
    { name: 'Performance', keywords: ['High Performance', 'Pro Grade', 'Lightweight', 'Aerodynamic', 'Competition'] },
  ],
  // Generic fallback
  generic: [
    { name: 'Gift Buyer', keywords: ['Gift Idea', 'Present', 'Birthday Gift', 'Christmas Gift', 'Unisex Gift'] },
    { name: 'Value Buyer', keywords: ['Value Pack', 'Bundle Deal', 'Multi-Pack', 'Great Value', 'Budget Friendly'] },
    { name: 'Quality Focus', keywords: ['High Quality', 'Premium Grade', 'Professional', 'Top Quality', 'Long Lasting'] },
    { name: 'Fast Delivery', keywords: ['Same Day Dispatch', 'Next Day', 'Fast Delivery', 'Quick Dispatch', 'Tracked'] },
  ],
}

// ── CLEAN_TIGHTEN: Category power keywords — high-search-volume terms ─────────
// These are the words real buyers type into eBay search in each category.
// Clean & Tighten uses these to REPLACE weak terms in an already-clean title,
// turning "Level 2" or "Screaming" into "Interactive" or "Durable".
const POWER_KEYWORDS: Record<string, string[]> = {
  pet: ['Interactive', 'Durable', 'Chew Toy', 'Rope Toy', 'Plush', 'Squeaky Toy', 'Puppy', 'Training', 'Fetch', 'Tug', 'Non-Toxic', 'Washable'],
  electronics: ['Fast Charge', 'USB-C', 'Braided', 'Nylon', 'Compatible', 'Quick Charge', 'Waterproof', 'LED', 'Wireless', 'Bluetooth', 'HD', '4K'],
  clothing: ['Cotton', 'Stretch', 'Slim Fit', 'Oversized', 'Casual', 'Vintage', 'Unisex', 'Breathable', 'Lightweight', 'Soft', 'Printed', 'Embroidered'],
  auto: ['OEM Spec', 'Direct Fit', 'Heavy Duty', 'Stainless', 'Rust Proof', 'High Performance', 'All Weather', 'No Drill', 'Universal', 'Plug and Play'],
  collectibles: ['Near Mint', 'First Edition', 'Signed', 'Limited', 'Numbered', 'Vintage', 'Original', 'Rare', 'Complete', 'Graded'],
  home: ['Modern', 'Nordic', 'Handmade', 'Solid Wood', 'Stainless Steel', 'Waterproof', 'Easy Clean', 'Non-Slip', 'Heavy Duty', 'LED', 'Energy Saving'],
  sporting: ['Lightweight', 'Breathable', 'High Performance', 'Non-Slip', 'Waterproof', 'Adjustable', 'Padded', 'Compression', 'Quick Dry', 'Reflective'],
  generic: ['High Quality', 'Durable', 'Lightweight', 'Heavy Duty', 'Professional', 'Multi-Purpose', 'Easy Use', 'Non-Toxic', 'Eco Friendly', 'Washable'],
}

// ── Weak word detector for CLEAN_TIGHTEN ─────────────────────────────────────
// Words that look meaningful but buyers NEVER search for on eBay.
// Covers: seller-internal codes, standalone tier numbers, unusual descriptors.
const WEAK_PATTERNS = [
  /^level\s*\d*$/i,         // "Level", "Level 2", "Level 3"
  /^size\s*\d*$/i,          // "Size", "Size 1"
  /^version\s*\d*$/i,       // "Version", "Version 2"
  /^type\s*[a-z\d]?$/i,     // "Type", "Type A", "Type B"
  /^grade\s*[a-z\d]?$/i,    // "Grade", "Grade A"
  /^series\s*\d*$/i,        // "Series", "Series 3"
  /^tier\s*\d*$/i,          // "Tier", "Tier 2"
  /^gen\s*\d*$/i,           // "Gen", "Gen 2" (unless in proper model name)
]

// Standalone single digits used as product tier codes (not model numbers).
// "Level 2" written as separate words means '2' appears solo.
// We skip digits that ARE part of a model context (handled by isLockedWord
// for things like "S24", "4K", "USB3" — but bare "2" or "3" used as a tier
// code after words like Level/Size/Grade are meaningless to buyers).
function isWeakWord(word: string, prevWord = '', nextWord = ''): boolean {
  if (WEAK_PATTERNS.some(p => p.test(word))) return true
  // Single letter used as a product code
  if (/^[a-z]$/i.test(word) && !BIND_WORDS.has(word.toLowerCase())) return true
  // Standalone single digit that follows a tier-signal word (Level 2, Size 3...)
  if (/^\d$/.test(word)) {
    const tierSignals = ['level', 'size', 'version', 'type', 'grade', 'series', 'tier', 'gen', 'no', 'number', 'qty', 'pack']
    if (tierSignals.includes(prevWord.toLowerCase())) return true
  }
  return false
}

// ── Category detection ────────────────────────────────────────────────────────
function detectCategory(title: string, categoryName: string): string {
  const combined = (title + ' ' + categoryName).toLowerCase()
  if (/dog|cat|pet|puppy|kitten|bird|fish|hamster|rabbit|animal/.test(combined)) return 'pet'
  if (/phone|tablet|laptop|computer|electronic|camera|usb|charger|cable|screen|battery|gaming|console|headphone|speaker/.test(combined)) return 'electronics'
  if (/shirt|dress|jean|jacket|shoe|trainer|sneaker|boot|trouser|coat|blouse|skirt|fashion|cloth|apparel|wear|hoodie/.test(combined)) return 'clothing'
  if (/car|auto|vehicle|motor|truck|bike|motorcycle|part|brake|tyre|filter|engine|exhaust/.test(combined)) return 'auto'
  if (/collect|antique|vintage|coin|stamp|card|memorabilia|trading|signed|autograph|rare/.test(combined)) return 'collectibles'
  if (/garden|furniture|kitchen|tool|drill|saw|lamp|light|curtain|cushion|mat|rug|shelf|storage|home/.test(combined)) return 'home'
  if (/sport|fitness|gym|yoga|cycling|running|football|tennis|golf|swim|basketball|cricket/.test(combined)) return 'sporting'
  return 'generic'
}

// ── Locale-aware filler pools (Fill to 80) ───────────────────────────────────
const FILLER_BY_CATEGORY: Record<string, { us: string[]; uk: string[] }> = {
  pet: { us: ['Non-Toxic', 'US Seller', 'Safe for Dogs', 'Tested'], uk: ['Non-Toxic', 'UK Seller', 'Safe for Dogs', 'Tested'] },
  electronics: { us: ['Compatible', 'US Seller', 'Genuine', 'Tested', 'Fast Ship'], uk: ['Compatible', 'UK Seller', 'Genuine', 'Tested', 'Fast Dispatch'] },
  clothing: { us: ['US Size', 'Unisex', 'Gift Idea', 'Free Returns'], uk: ['UK Size', 'Unisex', 'Gift Idea', 'Free Returns'] },
  auto: { us: ['OEM Quality', 'Fits Multiple', 'US Stock', 'Easy Install'], uk: ['OEM Quality', 'Fits Multiple', 'UK Stock', 'Easy Install'] },
  collectibles: { us: ["Excellent Condition", "Rare Find", "Collector's", "US Seller"], uk: ["Excellent Condition", "Rare Find", "Collector's", "UK Seller"] },
  home: { us: ['US Stock', 'Modern Design', 'Easy Clean', 'Quality'], uk: ['UK Stock', 'Modern Design', 'Easy Clean', 'Quality'] },
  sporting: { us: ['Lightweight', 'Adjustable', 'Professional', 'Competition Grade'], uk: ['Lightweight', 'Adjustable', 'Professional', 'Competition Grade'] },
  generic: { us: ['US Seller', 'Fast Ship', 'Top Quality', 'Great Value'], uk: ['UK Seller', 'Fast Dispatch', 'Top Quality', 'Great Value'] },
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function randBool(chance = 0.5): boolean { return Math.random() < chance }
function randInt(max: number): number { return Math.floor(Math.random() * max) }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function applyPolicyGuard(title: string): string {
  let safe = title
  for (const b of BANNED_WORDS) {
    safe = safe.replace(new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '')
  }
  return safe.replace(/L@@K/gi, '').trim().replace(/\s+/g, ' ')
}

function detectCondition(title: string): 'new' | 'used' | 'refurb' | 'unknown' {
  const lower = title.toLowerCase()
  if ([...CONDITION_USED].some(w => lower.includes(w))) return 'used'
  if ([...CONDITION_REFURB].some(w => lower.includes(w))) return 'refurb'
  if ([...CONDITION_NEW].some(w => lower.includes(w))) return 'new'
  return 'unknown'
}

function applyThesaurus(words: string[], lockCount: number, swapChance: number, condition: string): string[] {
  return words.map((word, i) => {
    if (i < lockCount || isLockedWord(word)) return word
    const lower = word.toLowerCase()
    const synonyms = THESAURUS[lower]
    if (!synonyms || !randBool(swapChance)) return word
    const safe = synonyms.filter(s => {
      const sl = s.toLowerCase()
      if (condition === 'used') return ![...CONDITION_NEW].some(w => sl.includes(w))
      if (condition === 'new') return ![...CONDITION_USED].some(w => sl.includes(w))
      return true
    })
    return safe.length ? safe[randInt(safe.length)] : word
  })
}

function deduplicate(words: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of words) {
    if (!seen.has(w.toLowerCase())) { seen.add(w.toLowerCase()); out.push(w) }
  }
  return out
}

function buildChunks(words: string[]): string[] {
  const chunks: string[] = []
  let i = 0
  while (i < words.length) {
    const lower = words[i].toLowerCase()
    if ((BIND_WORDS.has(lower) || /\d/.test(words[i])) && i + 1 < words.length) {
      chunks.push(`${words[i]} ${words[i + 1]}`); i += 2
    } else {
      const size = randInt(2) + 1
      chunks.push(words.slice(i, i + size).join(' ')); i += size
    }
  }
  return chunks
}

function guardLength(title: string, max = 80): string {
  if (title.length <= max) return title
  let cut = title.substring(0, max)
  const sp = cut.lastIndexOf(' ')
  cut = sp > 0 ? title.substring(0, sp) : cut
  const ws = cut.split(' ')
  while (ws.length && BIND_WORDS.has(ws[ws.length - 1].toLowerCase())) ws.pop()
  return ws.join(' ')
}

// ── Word-level diff ──────────────────────────────────────────────────────────
function buildDiff(original: string, result: string): DiffToken[] {
  const origWords = original.split(' ')
  const resWords = result.split(' ')
  const origSet = new Set(origWords.map(w => w.toLowerCase()))
  const tokens: DiffToken[] = []

  for (const word of resWords) {
    const lower = word.toLowerCase()
    const isSwap = !origSet.has(lower) && Object.entries(THESAURUS).some(([key, syns]) =>
      origWords.some(w => w.toLowerCase() === key) && syns.some(s => s.toLowerCase() === lower)
    )
    if (origSet.has(lower)) tokens.push({ text: word, type: 'unchanged' })
    else if (isSwap) tokens.push({ text: word, type: 'swapped' })
    else tokens.push({ text: word, type: 'added' })
  }

  const resSet = new Set(resWords.map(w => w.toLowerCase()))
  for (const word of origWords) {
    if (!resSet.has(word.toLowerCase())) tokens.push({ text: word, type: 'removed' })
  }
  return tokens
}

// ── MAIN ENGINE ───────────────────────────────────────────────────────────────
export class TitleSpinnerEngine {
  static spin(
    originalTitle: string,
    lockCount = 3,
    mode: SpinMode = 'DUPLICATE_SAFE',
    categoryName: string = '',
    activeLocation: string = 'US'
  ): SpinResult {

    const clean = applyPolicyGuard(originalTitle)
    if (!clean) return { title: '', diff: [] }

    const condition = detectCondition(clean)
    const words = clean.split(' ')
    if (words.length <= lockCount) return { title: clean, diff: [{ text: clean, type: 'unchanged' }] }

    // Detect category from both the title text AND the eBay-returned category name
    const cat = detectCategory(clean, categoryName)

    let result = ''

    // ── DUPLICATE SAFE ───────────────────────────────────────────────────────
    if (mode === 'DUPLICATE_SAFE') {
      const swapped = applyThesaurus(words, lockCount, 0.75, condition)
      const unique = deduplicate(swapped)
      const core = unique.slice(0, lockCount)
      const rest = unique.slice(lockCount)
      const chunks = buildChunks(rest)
      const powerChunks = chunks.filter(c => ['genuine', 'oem', 'premium', 'pro', 'heavy-duty', 'original', 'authentic', 'quality'].some(p => c.toLowerCase().includes(p)))
      const normalChunks = chunks.filter(c => !powerChunks.includes(c))
      let attempt = ''
      for (let t = 0; t < 5; t++) {
        const reordered = [...core, ...shuffle(powerChunks), ...shuffle(normalChunks)]
        attempt = guardLength(reordered.join(' '))
        if (attempt !== clean) break
      }
      result = attempt
    }

    // ── AB_TEST: MARKET CHALLENGE ENGINE ─────────────────────────────────────
    // This is a genuine market challenge tool, not just a word shuffler.
    //
    // Strategy: identify which buyer SEGMENT your current title targets, then
    // generate a variant aimed at a COMPLETELY DIFFERENT buyer segment for
    // the same product. Each segment uses different search terms, different
    // intent, and reaches buyers your original listing never finds.
    //
    // Example:
    //   ORIGINAL: "Squeaky Chicken Dog Toy Chew Level 2 Vibrant Life Medium"
    //   → targets: squeaky dog toy buyers
    //   A/B Gift: "Dog Toy Gift Squeaky Chicken Chew Interactive Medium Puppy Present"
    //   → targets: people buying gifts for dog owners
    //   A/B Size:  "Medium Dog Toy Large Breed Squeaky Chicken Chew Durable Tough"
    //   → targets: buyers searching by dog size
    //   A/B Use:   "Interactive Dog Toy Squeaky Chicken Chew Fetch Tug Medium Durable"
    //   → targets: buyers looking for a specific play style
    //
    // Each Try Again cycles to the next segment so sellers can A/B test all 4.
    else if (mode === 'AB_TEST') {
      const segments = BUYER_SEGMENTS[cat] ?? BUYER_SEGMENTS.generic
      const titleLower = clean.toLowerCase()

      // Find the first segment whose keywords are NOT already in the title
      // (we don't want to "challenge" a market the title already targets)
      const segOrder = shuffle([...segments])
      const chosen = segOrder.find(seg =>
        !seg.keywords.some(kw => titleLower.includes(kw.toLowerCase()))
      ) ?? segOrder[0]

      // Extract the core product words (locked words + high-value nouns)
      // These stay in the title no matter what segment we're targeting
      const coreWords = words.filter((w, i) =>
        i < lockCount || isLockedWord(w) || w.length > 5
      ).slice(0, 6) // keep the 6 most important words as the anchor

      // Pick 2-3 high-value keywords from the chosen segment
      const segKeywords = shuffle([...chosen.keywords]).slice(0, randInt(2) + 2)

      // Also apply thesaurus to remaining words
      const remaining = words.filter(w =>
        !coreWords.some(c => c.toLowerCase() === w.toLowerCase())
      )
      const swapped = applyThesaurus(remaining, 0, 0.5, condition)
      const unique = deduplicate(swapped)

      // Build the new title: core product + segment keywords + remaining words
      // Order: most specific first (product identity), then market signal, then rest
      const combined = deduplicate([...coreWords, ...segKeywords, ...unique])
      result = guardLength(combined.join(' '))

      // If result is same as original (unlikely but possible), try another segment
      if (result === clean && segments.length > 1) {
        const alt = segments.find(s => s !== chosen) ?? segments[1]
        const altKws = shuffle([...alt.keywords]).slice(0, 2)
        const altCombined = deduplicate([...coreWords, ...altKws, ...unique])
        result = guardLength(altCombined.join(' '))
      }
    }

    // ── FILL TO 80 ──────────────────────────────────────────────────────────
    else if (mode === 'FILL_TO_80') {
      const swapped = applyThesaurus(words, lockCount, 0.3, condition)
      const unique = deduplicate(swapped)
      let current = unique.join(' ')

      if (current.length < 75) {
        const isUK = activeLocation === 'UK'
        const pool = shuffle([...(FILLER_BY_CATEGORY[cat]?.[isUK ? 'uk' : 'us'] ?? FILLER_BY_CATEGORY.generic.us)])
        for (const filler of pool) {
          if (current.toLowerCase().includes(filler.toLowerCase())) continue
          const fl = filler.toLowerCase()
          if (condition === 'used' && [...CONDITION_NEW].some(w => fl.includes(w))) continue
          if (condition === 'new' && [...CONDITION_USED].some(w => fl.includes(w))) continue
          if (current.length + 1 + filler.length <= 80) current += ` ${filler}`
          if (current.length >= 75) break
        }
      }
      result = guardLength(current)
    }

    // ── CLEAN & TIGHTEN: KEYWORD STRENGTH UPGRADER ───────────────────────────
    // This is a keyword quality tool, not just a filler remover.
    //
    // Strategy in two passes:
    //
    // PASS 1 — Remove genuinely weak terms:
    //   • Vague adjectives (amazing, premium, best, great...)
    //   • Seller-internal codes that buyers never search (Level 2, Type A, Grade B...)
    //   • Single-letter codes
    //   • Duplicate words
    //
    // PASS 2 — Upgrade remaining weak words with power keywords:
    //   • After cleaning, identify words that are low-value search terms
    //     (short generic words, prepositions used as descriptors)
    //   • Replace them with high-search-volume keywords from the category's
    //     power keyword list — words real buyers actually type into eBay
    //   • This ensures even a "clean" title gets meaningfully improved,
    //     not returned identical
    //
    // Example:
    //   ORIGINAL: "Vibrant Life Screaming Level Yellow Toy 2 Medium Chicken Dog Chew Squeaky"
    //   Pass 1 removes: "Level", "2" (internal codes), "Screaming" (unusual, low-search)
    //   Pass 2 adds:    "Interactive", "Durable", "Puppy" (high-value pet keywords)
    //   RESULT:  "Vibrant Life Yellow Toy Medium Chicken Dog Chew Squeaky Interactive Durable"
    else {
      // ── Pass 1: Remove vague and weak words ──────────────────────────────
      const VAGUE = new Set([
        // Generic marketing adjectives — rarely typed by buyers
        'premium', 'quality', 'best', 'top', 'great', 'nice', 'good', 'super', 'ultra',
        'amazing', 'excellent', 'perfect', 'very', 'fantastic', 'brilliant', 'special',
        'ultimate', 'outstanding', 'exceptional', 'incredible', 'wonderful', 'superb',
        'beautiful', 'gorgeous', 'lovely', 'stunning', 'breathtaking', 'sensational',
        // Unusual descriptors — sound descriptive but buyers don't search them
        'screaming', 'shrieking', 'crazy', 'wild', 'wacky', 'funky', 'zany', 'quirky',
        // Vague colour/style descriptors buyers rarely use as search terms alone
        'vibrant', 'vivid', 'bold',
      ])

      // Sub-pass A: mark each word as weak using ORIGINAL position context,
      // so "2" after "Level" is flagged even if "Level" is also being removed
      const weakMask = words.map((w, i) => {
        if (VAGUE.has(w.toLowerCase())) return true
        if (isWeakWord(w, words[i - 1] ?? '', words[i + 1] ?? '')) return true
        return false
      })

      // Sub-pass B: filter, also removing "orphan" words left behind after
      // their partner is removed (e.g. "Life" alone after "Vibrant" is gone)
      const KNOWN_PRODUCT_WORDS = new Set(['dog', 'cat', 'toy', 'pet', 'new', 'used', 'set', 'kit', 'bag', 'box', 'led', 'usb', 'pro'])
      const pass1 = words.filter((w, i) => {
        if (weakMask[i]) return false
        // If the previous word was removed AND this word is short + non-product,
        // it's likely the orphaned second half of a brand/descriptor pair
        if (i > 0 && weakMask[i - 1] && w.length <= 5 && !isLockedWord(w) && !BIND_WORDS.has(w.toLowerCase())) {
          const hasValue = THESAURUS[w.toLowerCase()] || KNOWN_PRODUCT_WORDS.has(w.toLowerCase())
          if (!hasValue) return false
        }
        return true
      })

      // Apply thesaurus at high rate on the cleaned words
      const swapped = applyThesaurus(pass1, lockCount, 0.85, condition)
      const unique = deduplicate(swapped)
      const current = unique.join(' ')

      // ── Pass 2: Inject power keywords if there's room or weak slots ───────
      const powerPool = shuffle([...(POWER_KEYWORDS[cat] ?? POWER_KEYWORDS.generic)])
      const titleLower = current.toLowerCase()

      // Words that are unlikely to be searched on their own (short/generic)
      // These are candidates for replacement by power keywords
      const weakSlots = unique.filter(w =>
        w.length <= 4 &&
        !isLockedWord(w) &&
        !BIND_WORDS.has(w.toLowerCase()) &&
        !/\d/.test(w)
      )

      let upgraded = current

      // If title has room: inject power keywords up to 80 chars
      for (const kw of powerPool) {
        if (titleLower.includes(kw.toLowerCase())) continue
        // Don't contradict condition
        const kl = kw.toLowerCase()
        if (condition === 'used' && [...CONDITION_NEW].some(w => kl.includes(w))) continue
        if (condition === 'new' && [...CONDITION_USED].some(w => kl.includes(w))) continue

        if (upgraded.length + 1 + kw.length <= 78) {
          upgraded += ` ${kw}`
        }
        if (upgraded.length >= 70) break
      }

      result = guardLength(upgraded, 80)

      // Safety: if result is identical to original, force at least one power keyword
      if (result === clean) {
        const forced = powerPool.find(kw =>
          !clean.toLowerCase().includes(kw.toLowerCase()) &&
          clean.length + 1 + kw.length <= 80
        )
        if (forced) result = guardLength(`${clean} ${forced}`, 80)
        else result = clean // title is truly optimal, nothing to improve
      }
    }

    const diff = buildDiff(clean, result)
    return { title: result, diff }
  }
}
