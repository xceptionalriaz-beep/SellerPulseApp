// app/dashboard/title-builder/components/engines/titleSpinnerEngine.ts

import { findProductNoun, isDigitalProduct, detectAgeGroup, detectColour, detectCompatibility, detectSizeSystem, detectConditionFull, detectQuantity, detectGenderTarget, detectVoltageSystem } from './productNouns'
import { isSpecWord, getSpecWordIndices, classifyTitleWords } from './specWords'
import { isFillerWithContext, SHIPPING_FILLER, titleFillerScore } from './fillerWords'
import { detectCategoryV2, CATEGORY_LABELS } from './categoryEngine'
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
  'premium': ['Pro', 'Professional', 'High-Grade', 'Top-Grade'],
  'quality': ['High-Grade', 'Professional', 'Grade A', 'Top-Grade'],
  'pro': ['Professional', 'Expert', 'Advanced', 'Grade A'],
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
    { name: 'Gift Buyer', keywords: ['Dog Gift', 'Pet Present', 'Puppy Gift', 'Gift for Dog Lover'] },
    { name: 'Size Specific', keywords: ['Small Dog', 'Large Dog', 'Puppy', 'Medium Breed', 'Large Breed'] },
    { name: 'Use Case', keywords: ['Interactive', 'Fetch', 'Tug', 'Puzzle', 'Enrichment', 'Training'] },
    { name: 'Durability', keywords: ['Indestructible', 'Heavy Duty', 'Tough', 'Durable Chew', 'Power Chewer'] },
  ],
  // Electronics / phone accessories
  electronics: [
    { name: 'Compatibility', keywords: ['Compatible', 'Universal', 'Multi-Device', 'Works With', 'All Models'] },
    { name: 'Speed / Spec', keywords: ['Fast Charge', 'PD Charging', 'Quick Charge', 'Super Fast Charging'] },
    { name: 'Gift Buyer', keywords: ['Tech Gift', 'Stocking Filler', 'Birthday Gift', 'Present'] },
    { name: 'Protection', keywords: ['Shockproof', 'Drop Proof', 'Heavy Duty', 'Rugged', 'Military Grade'] },
  ],
  // Clothing / fashion
  clothing: [
    { name: 'Occasion', keywords: ['Casual', 'Smart Casual', 'Work Wear', 'Evening Wear', 'Weekend'] },
    { name: 'Gift Buyer', keywords: ['Birthday Gift', 'Christmas Gift', 'Fashion Gift', 'Present'] },
    { name: 'Style Specific', keywords: ['Relaxed Fit', 'Cropped', 'Vintage Style', 'Streetwear', 'Classic'] },
    { name: 'Season', keywords: ['Summer', 'Winter', 'Autumn', 'Spring', 'All Season'] },
  ],
  // Footwear — separate from clothing
  footwear: [
    { name: 'Occasion', keywords: ['Everyday', 'Casual', 'Sports', 'Running', 'Training', 'Gym', 'Walking'] },
    { name: 'Comfort', keywords: ['Cushioned', 'Memory Foam', 'Arch Support', 'Non-Slip', 'Breathable'] },
    { name: 'Gift Buyer', keywords: ['Birthday Gift', 'Christmas Gift', 'Sports Gift', 'Present'] },
    { name: 'Style', keywords: ['Classic', 'Retro', 'Vintage', 'Street Style', 'Iconic'] },
  ],
  // Auto parts
  auto: [
    { name: 'Fitment', keywords: ['Direct Fit', 'OEM Spec', 'Drop-In', 'Bolt-On', 'No Modification'] },
    { name: 'Value / Bundle', keywords: ['Full Set', 'Front and Rear', 'Left and Right', 'Complete Kit', 'Pair'] },
    { name: 'Brand Agnostic', keywords: ['Compatible', 'Universal Fit', 'Multiple Fitment', 'Fits Multiple Models'] },
    { name: 'DIY Buyer', keywords: ['Easy Install', 'No Tools', 'Plug and Play', 'DIY'] },
  ],
  // Collectibles / vintage
  collectibles: [
    { name: 'Condition Focus', keywords: ['Near Mint', 'VGC', 'Excellent Condition', 'Unplayed', 'Pristine'] },
    { name: 'Era / Decade', keywords: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', 'Mid Century', 'Retro'] },
    { name: 'Gift Collector', keywords: ['Collector Gift', 'Display Piece', 'Show Piece', 'Perfect Gift'] },
    { name: 'Rarity Signal', keywords: ['Hard to Find', 'Scarce', 'One of a Kind', 'Rare Find'] },
  ],
  // Home & garden
  home: [
    { name: 'Style', keywords: ['Modern', 'Minimalist', 'Scandi', 'Industrial', 'Farmhouse', 'Art Deco'] },
    { name: 'Gift Buyer', keywords: ['Housewarming Gift', 'Birthday Gift', 'Wedding Gift'] },
    { name: 'Room Specific', keywords: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Garden', 'Office'] },
    { name: 'Functional', keywords: ['Easy Clean', 'Space Saving', 'Stackable', 'Heavy Duty', 'Energy Saving'] },
  ],
  // Sporting goods
  sporting: [
    { name: 'Skill Level', keywords: ['Beginner', 'Intermediate', 'Advanced', 'Professional', 'Competition'] },
    { name: 'Use Case', keywords: ['Training', 'Race Day', 'Gym', 'Outdoor', 'Indoor', 'Cross Training', 'HIIT'] },
    { name: 'Gift Buyer', keywords: ['Sports Gift', 'Fitness Gift', 'Birthday Gift', 'Christmas Gift'] },
    { name: 'Performance', keywords: ['High Performance', 'Lightweight', 'Aerodynamic', 'Breathable', 'Non-Slip'] },
  ],
  // Generic fallback
  generic: [
    { name: 'Gift Buyer', keywords: ['Gift Idea', 'Birthday Gift', 'Christmas Gift', 'Stocking Filler'] },
    { name: 'Bundle Value', keywords: ['Value Pack', 'Bundle Deal', 'Multi-Pack', 'Money Saving'] },
    { name: 'Occasion', keywords: ['Anniversary Gift', 'Wedding Gift', 'Graduation Gift', 'Thank You Gift'] },
    { name: 'Eco Buyer', keywords: ['Eco Friendly', 'Sustainable', 'Recyclable', 'Non-Toxic', 'BPA Free'] },
  ],
}

// ── CLEAN_TIGHTEN: Category power keywords — high-search-volume terms ─────────
// These are the words real buyers type into eBay search in each category.
// Clean & Tighten uses these to REPLACE weak terms in an already-clean title,
// turning "Level 2" or "Screaming" into "Interactive" or "Durable".
const POWER_KEYWORDS: Record<string, string[]> = {
  pet: ['Interactive', 'Durable', 'Chew Toy', 'Rope Toy', 'Plush', 'Squeaky Toy', 'Puppy', 'Training', 'Fetch', 'Tug', 'Non-Toxic', 'Washable'],
  electronics: ['Fast Charge', 'USB-C', 'Braided', 'Nylon', 'Compatible', 'Quick Charge', 'Waterproof', 'LED', 'Wireless', 'Bluetooth', 'HD', '4K'],
  footwear: ['Cushioned', 'Breathable', 'Lightweight', 'Non-Slip', 'Arch Support', 'Memory Foam', 'Wide Fit', 'Grip Sole', 'Comfortable'],
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
  if (/iphone|ipad|samsung|pixel|android|smartphone|phone case|phone cover|tablet|laptop|computer|electronic|camera|usb|charger|cable|screen|battery|gaming|console|headphone|speaker|airpod|earbud|smartwatch/.test(combined)) return 'electronics'
  // Footwear — check before clothing so trainers/shoes don't go to clothing
  if (/trainer|sneaker|boot|shoe|footwear|heel|sandal|slipper|loafer|moccasin|stiletto|pump|wedge|espadrille/.test(combined)) return 'footwear'
  if (/shirt|dress|jean|jacket|trouser|coat|blouse|skirt|fashion|cloth|apparel|wear|hoodie|sweatshirt|jumper|cardigan/.test(combined)) return 'clothing'
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
  footwear: { us: ['US Size', 'Wide Fit', 'All Day Comfort', 'Free Returns'], uk: ['UK Size', 'Wide Fit', 'All Day Comfort', 'Free Returns'] },
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

// High-value eBay keywords that should NEVER be removed even if they share a stem
const PROTECTED_KEYWORDS = new Set([
  'chewer', 'chewers', 'interactive', 'training', 'squeaky', 'durable', 'indestructible',
  'aggressive', 'compatible', 'wireless', 'rechargeable', 'waterproof', 'adjustable',
  'breathable', 'lightweight', 'portable', 'multipurpose', 'professional', 'commercial',
  'heavy-duty', 'fast-charging', 'quick-release', 'non-slip', 'eco-friendly',
])

function deduplicate(words: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of words) {
    const wl = w.toLowerCase()
    // Always keep protected keywords even if stem already seen
    if (PROTECTED_KEYWORDS.has(wl)) { out.push(w); continue }
    if (!seen.has(wl)) { seen.add(wl); out.push(w) }
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

    // Fix: adjust lockCount for short titles so engine always has room to work
    const effectiveLock = Math.min(lockCount, Math.max(1, Math.floor(words.length / 2)))
    if (words.length <= 2) return { title: clean, diff: [{ text: clean, type: 'unchanged' }] }

    // ── Full product intelligence ─────────────────────────────────────────────
    const catRaw = detectCategory(clean, categoryName)
    const productInfo = findProductNoun(clean)
    const ageGroup = detectAgeGroup(clean)
    const colour = detectColour(clean)
    const compatible = detectCompatibility(clean)
    const sizeSystem = detectSizeSystem(clean)
    const isDigital = isDigitalProduct(clean)

    // Use new comprehensive V2 category engine
    const catV2 = detectCategoryV2(clean)

    // Digital products — return unchanged
    if (isDigital) return { title: clean, diff: [{ text: clean, type: 'unchanged' }] }

    // Best category: V2 wins if high/medium confidence, productInfo refines,
    // age group overrides for baby/kids
    let cat = catRaw
    if (catV2.confidence !== 'none') cat = catV2.category as string
    if (productInfo.confidence === 'high') cat = productInfo.category
    if (ageGroup?.category === 'baby') cat = 'baby'
    if (ageGroup?.group === 'kids') cat = 'kids'

    const compatWordsList = compatible ? compatible.split(' ') : []

    let result = ''

    // ── DUPLICATE SAFE ───────────────────────────────────────────────────────
    if (mode === 'DUPLICATE_SAFE') {
      const specIndices = getSpecWordIndices(clean)
      const swapped = applyThesaurus(words, effectiveLock, 0.75, condition)
      // Never swap spec words
      const safeSwapped = swapped.map((w, i) => specIndices.has(i) ? words[i] : w)
      const unique = deduplicate(safeSwapped)
      const core = unique.slice(0, effectiveLock)
      const rest = unique.slice(effectiveLock)
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

    // ── AB_TEST: INTELLIGENT MARKET CHALLENGE ENGINE ────────────────────────
    else if (mode === 'AB_TEST') {
      const titleLower = clean.toLowerCase()
      const titleWordSet = new Set(titleLower.split(' '))

      // ── Full product intelligence ─────────────────────────────────────────
      // Digital products cannot be meaningfully spun
      if (isDigitalProduct(clean)) {
        result = clean
        return { title: result, diff: buildDiff(clean, result) }
      }

      // Detect all product attributes for smarter decisions
      const ageGroup = detectAgeGroup(clean)
      const colour = detectColour(clean)
      const compatibility = detectCompatibility(clean)
      const sizeSystem = detectSizeSystem(clean)
      const conditionFull = detectConditionFull(clean)
      const quantity = detectQuantity(clean)
      const genderTarget = detectGenderTarget(clean)
      const voltageSystem = detectVoltageSystem(clean)

      // If product has compatibility info, protect those words
      const compatWords = compatibility ? new Set(compatibility.toLowerCase().split(' ')) : new Set<string>()

      // ── Step 1: Classify every word using specWords + fillerWords engine ────
      const STOP_SET = new Set(['for', 'with', 'and', 'the', 'in', 'on', 'a', 'to', 'of', 'by', 'at', 'is', 'or'])
      const productNoun = productInfo.noun.toLowerCase()

      // Use full spec classification from specWords.ts
      const classified2 = classifyTitleWords(clean)

      type WC = 'spec' | 'product' | 'filler' | 'stop'
      interface CW { word: string; cls: WC }
      const classified: CW[] = classified2.map(({ word, isSpec }) => {
        const wl = word.toLowerCase()
        if (isSpec) return { word, cls: 'spec' as WC }
        if (STOP_SET.has(wl)) return { word, cls: 'stop' as WC }
        // Use comprehensive filler detection from fillerWords.ts
        if (isFillerWithContext(word, '', '')) return { word, cls: 'filler' as WC }
        if (productNoun.includes(wl) || wl.includes(productNoun)) return { word, cls: 'spec' as WC }
        if (compatWords.has(wl)) return { word, cls: 'spec' as WC }
        if (colour && wl === colour) return { word, cls: 'spec' as WC }
        return { word, cls: 'product' as WC }
      })

      // ── Step 2: Extract locked parts ─────────────────────────────────────
      const specWords = classified.filter(c => c.cls === 'spec').map(c => c.word)
      const productWords = classified.filter(c => c.cls === 'product').map(c => c.word)
      const lockedCore = productWords.slice(0, Math.max(3, effectiveLock))
      const lockedSet = new Set([...lockedCore, ...specWords].map(w => w.toLowerCase()))

      // ── Step 3: Pick best uncovered segment ──────────────────────────────
      // Use age group and gender to refine category
      const effectiveCat = ageGroup?.category === 'baby' ? 'baby'
        : ageGroup?.category === 'kids' ? 'toys'
          : genderTarget === 'male' && cat === 'clothing' ? 'clothing'
            : genderTarget === 'female' && cat === 'clothing' ? 'clothing'
              : cat
      const segments = BUYER_SEGMENTS[effectiveCat] ?? BUYER_SEGMENTS[cat] ?? BUYER_SEGMENTS.generic

      // Filter segments based on condition — used items can't use "new" segments
      const conditionSafe = segments.filter(seg => {
        if (conditionFull === 'used' || conditionFull === 'faulty') {
          // Don't pick segments with "new", "sealed", "brand new" keywords
          return !seg.keywords.some(kw => /\bnew\b|\bsealed\b|\bbrand new\b/i.test(kw))
        }
        return true
      })
      const uncovered = conditionSafe.filter(seg =>
        !seg.keywords.some(kw => titleLower.includes(kw.toLowerCase()))
      )
      const pool = uncovered.length > 0 ? shuffle(uncovered) : shuffle([...conditionSafe])
      const chosen = pool[0]

      // ── Step 4: Filter segment keywords strictly ─────────────────────────
      const segKeywords = shuffle([...chosen.keywords])
        .filter(kw => {
          const kwl = kw.toLowerCase()
          const kwWords = kwl.split(' ')
          // Already in title
          if (titleLower.includes(kwl)) return false
          // Shipping/delivery words
          if (kwWords.some(w => SHIPPING_FILLER.has(w))) return false
          // Contains fake spec numbers (e.g. 65W not in original)
          if (/\d+[WwVvAa]/.test(kw) && !specWords.some(s => s.toLowerCase().includes(kw.toLowerCase()))) return false
          // All words already in title
          if (kwWords.every(w => titleWordSet.has(w))) return false
          // Overlaps too much with locked core
          const overlap = kwWords.filter(w => lockedSet.has(w)).length
          if (overlap >= kwWords.length) return false
          return true
        })
        .slice(0, 2)

      // ── Step 5: Process remaining product words ───────────────────────────
      const remainingProduct = productWords
        .slice(effectiveLock)
        .filter(w => !segKeywords.some(kw => kw.toLowerCase().includes(w.toLowerCase())))
      const swappedRemaining = applyThesaurus(remainingProduct, 0, 0.4, condition)

      // ── Step 6: Build final title ─────────────────────────────────────────
      // Order: segment keywords first (mobile visibility) → locked core → remaining → specs
      const allParts = deduplicate([
        ...segKeywords,
        ...lockedCore,
        ...swappedRemaining,
        ...specWords,
      ])
      let built = guardLength(allParts.join(' '))

      // ── Step 7: Fill remaining space with power keywords ──────────────────
      if (built.length < 70) {
        const power = shuffle([...(POWER_KEYWORDS[cat] ?? POWER_KEYWORDS.generic)])
        for (const kw of power) {
          const kwl = kw.toLowerCase()
          if (built.toLowerCase().includes(kwl)) continue
          if (kwl.split(' ').some(w => SHIPPING_FILLER.has(w))) continue
          if (/\d+[WwVvAa]/.test(kw)) continue
          if (built.length + 1 + kw.length <= 80) built += ` ${kw}`
          if (built.length >= 75) break
        }
      }

      result = guardLength(built)

      // ── Step 8: Guarantee different result ───────────────────────────────
      if (result.toLowerCase() === clean.toLowerCase() && pool.length > 1) {
        const alt = pool[1]
        const altKws = alt.keywords.filter(kw => !titleLower.includes(kw.toLowerCase())).slice(0, 2)
        const altParts = deduplicate([...altKws, ...lockedCore, ...swappedRemaining, ...specWords])
        result = guardLength(altParts.join(' '))
      }
    }

    // ── FILL TO 80 ──────────────────────────────────────────────────────────
    else if (mode === 'FILL_TO_80') {
      const swapped = applyThesaurus(words, effectiveLock, 0.3, condition)
      const unique = deduplicate(swapped)
      let current = unique.join(' ')

      if (current.length < 75) {
        const isUK = activeLocation === 'UK'
        // Expand filler pool with both category-specific AND generic fillers
        const catFillers = FILLER_BY_CATEGORY[cat]?.[isUK ? 'uk' : 'us'] ?? []
        const genFillers = FILLER_BY_CATEGORY.generic[isUK ? 'uk' : 'us']
        const pool = shuffle([...new Set([...catFillers, ...genFillers])])
        for (const filler of pool) {
          if (current.toLowerCase().includes(filler.toLowerCase())) continue
          const fl = filler.toLowerCase()
          if (condition === 'used' && [...CONDITION_NEW].some(w => fl.includes(w))) continue
          if (condition === 'new' && [...CONDITION_USED].some(w => fl.includes(w))) continue
          if (current.length + 1 + filler.length <= 80) current += ` ${filler}`
          if (current.length >= 75) break
        }
        // If still under 75, try power keywords as extra filler
        if (current.length < 75) {
          const power = shuffle([...(POWER_KEYWORDS[cat] ?? POWER_KEYWORDS.generic)])
          for (const kw of power) {
            if (current.toLowerCase().includes(kw.toLowerCase())) continue
            if (current.length + 1 + kw.length <= 80) current += ` ${kw}`
            if (current.length >= 75) break
          }
        }
      }
      result = guardLength(current)
    }

    // ── CLEAN & TIGHTEN: KEYWORD STRENGTH UPGRADER ───────────────────────────
    // 3-pass system:
    // Pass 1 — Remove ALL weak words (vague adjectives, seller codes, filler)
    // Pass 2 — Replace with power keywords from category
    // Pass 3 — Fill remaining space with more searched keywords
    else {
      // ── Pass 1: Aggressive removal of weak words ─────────────────────────
      // Use fillerWords.ts instead of hardcoded list — comprehensive filler detection
      const specIndicesCT = getSpecWordIndices(clean)
      const productNounCT = productInfo.noun.toLowerCase()
      const colourWordsCT = colour ? colour.toLowerCase().split(' ') : []

      const weakMask = words.map((w, i) => {
        if (specIndicesCT.has(i)) return false
        const wl = w.toLowerCase()
        if (productNounCT.includes(wl) || wl.includes(productNounCT)) return false
        if (colourWordsCT.includes(wl)) return false
        if (compatible && compatible.toLowerCase().includes(wl)) return false
        // Use comprehensive filler detection from fillerWords.ts
        if (isFillerWithContext(w, words[i - 1] ?? '', words[i + 1] ?? '')) return true
        if (isWeakWord(w, words[i - 1] ?? '', words[i + 1] ?? '')) return true
        return false
      })

      const KNOWN_PRODUCT_WORDS = new Set([
        'dog', 'cat', 'toy', 'pet', 'new', 'used', 'set', 'kit', 'bag', 'box',
        'led', 'usb', 'pro', 'max', 'mini', 'plus', 'air', 'car', 'fit', 'run',
      ])

      const pass1 = words.filter((w, i) => {
        if (weakMask[i]) return false
        // Remove orphaned short words left after their partner was removed
        if (i > 0 && weakMask[i - 1] && w.length <= 5 && !isLockedWord(w) && !BIND_WORDS.has(w.toLowerCase())) {
          const hasValue = THESAURUS[w.toLowerCase()] || KNOWN_PRODUCT_WORDS.has(w.toLowerCase())
          if (!hasValue) return false
        }
        // Remove standalone numbers left after seller codes removed (e.g. "Level 2" → remove "2")
        if (/^\d+$/.test(w) && i > 0 && weakMask[i - 1]) return false
        // Remove very short words (1-2 chars) that are not meaningful
        if (w.length <= 2 && !/^\d/.test(w) && !['xl', 'xs', '3d', '4k', '2d', 'uk', 'us'].includes(w.toLowerCase())) return false
        return true
      })

      // ── Pass 2: Swap weak words with power keywords ──────────────────────
      // More aggressive thesaurus — swap more words for high-value alternatives
      const swapped = applyThesaurus(pass1, effectiveLock, 0.7, condition)
      const unique = deduplicate(swapped)

      // ── Pass 3: Fill ALL remaining space with power keywords ─────────────
      // This is the key — after cleaning, title is shorter, so we aggressively
      // fill the freed space with the highest-value keywords for this category
      const powerPool = shuffle([...(POWER_KEYWORDS[cat] ?? POWER_KEYWORDS.generic)])
      let upgraded = unique.join(' ')
      const usedLower = upgraded.toLowerCase()

      // First pass — add power keywords
      for (const kw of powerPool) {
        if (upgraded.toLowerCase().includes(kw.toLowerCase())) continue
        const kl = kw.toLowerCase()
        if (condition === 'used' && [...CONDITION_NEW].some(w => kl.includes(w))) continue
        if (condition === 'new' && [...CONDITION_USED].some(w => kl.includes(w))) continue
        if (upgraded.length + 1 + kw.length <= 80) upgraded += ` ${kw}`
        if (upgraded.length >= 75) break
      }

      // Second pass — fill any remaining space with fillers
      if (upgraded.length < 70) {
        const isUK = activeLocation === 'UK'
        const fillers = shuffle([
          ...(FILLER_BY_CATEGORY[cat]?.[isUK ? 'uk' : 'us'] ?? []),
          ...FILLER_BY_CATEGORY.generic[isUK ? 'uk' : 'us'],
        ])
        for (const filler of fillers) {
          if (upgraded.toLowerCase().includes(filler.toLowerCase())) continue
          const fl = filler.toLowerCase()
          if (condition === 'used' && [...CONDITION_NEW].some(w => fl.includes(w))) continue
          if (condition === 'new' && [...CONDITION_USED].some(w => fl.includes(w))) continue
          if (upgraded.length + 1 + filler.length <= 80) upgraded += ` ${filler}`
          if (upgraded.length >= 75) break
        }
      }

      result = guardLength(upgraded, 80)

      // Guarantee change — if result same as original, force inject top power keyword
      if (result.toLowerCase() === clean.toLowerCase()) {
        const forced = powerPool.find(kw =>
          !clean.toLowerCase().includes(kw.toLowerCase()) &&
          clean.length + 1 + kw.length <= 80
        )
        if (forced) result = guardLength(`${clean} ${forced}`, 80)
      }
    }

    // Safety: result should never be shorter than original (would be a downgrade)
    if (result.length < clean.length * 0.8) result = clean

    const diff = buildDiff(clean, result)
    return { title: result, diff }
  }
}
