// app/dashboard/title-builder/components/engines/titleSpinnerEngine.ts

import { findProductNoun, isDigitalProduct, detectAgeGroup, detectColour, detectCompatibility, detectSizeSystem, detectConditionFull, detectQuantity, detectGenderTarget } from './productNouns'
import { isSpecWord, getSpecWordIndices, classifyTitleWords } from './specWords'
import { isFillerWithContext, SHIPPING_FILLER, titleFillerScore } from './fillerWords'

// Multi-word shipping phrases — remove WHOLE phrase not just one word
// Fix 1: 'fast dispatch' → removes 'fast' AND 'dispatch' together
const SHIPPING_PHRASES = [
  'fast dispatch', 'fast shipping', 'fast post', 'fast delivery',
  'fast ship', 'fast despatch', 'quick dispatch', 'quick delivery',
  'free post', 'free postage', 'free shipping', 'free delivery',
  'same day dispatch', 'same day delivery',
  'next day delivery', 'next day dispatch',
  'royal mail', 'royal post',
  'uk seller', 'us seller', 'au seller', 'ca seller',
  'uk stock', 'us stock', 'au stock',
  'original seller',  // catches loose 'seller' after 'original'
]

// Individual words that are ALWAYS policy violations in titles
const POLICY_VIOLATION_WORDS = new Set([
  'seller', 'ebay', 'feedback', 'shop', 'store', 'visit', 'follow',
])

function removeShippingPhrases(title: string): string {
  let result = title
  for (const phrase of SHIPPING_PHRASES) {
    const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp('\\b' + esc + '\\b', 'gi')
    result = result.replace(regex, '').replace(/\s+/g, ' ').trim()
  }
  return result
}
import { detectCategoryV2, CATEGORY_LABELS } from './categoryEngine'
import { analyseBuyerSearch, getLiveSegmentKeywords, buildBuyerOptimisedTitle, type RawKeyword } from './buyerSearchEngine'
import { analyseCompetingTitles, buildCombinedInjectionQueue, type CompetingListing } from './competingTitleEngine'
import { filterByCondition, isConditionProtected, isConditionBanned, getConditionKeywords, repositionConditionWord, detectConditionWithWord, getSeasonalConditionKeywords, type Condition } from './conditionEngine'
import { getBrandProtection } from './brandEngine'
import { reorderForMobile, shouldBeInMobileWindow, getMobileGapKeywords, MOBILE_CHAR_LIMIT } from './mobileEngine'
import { applyLocale, filterByLocale, translateQueue, getLocaleKeywords, type Locale } from './locationEngine'
import { detectProductType, filterForDigital, getDigitalKeywords, buildOptimalDigitalTitle, type DigitalSubType } from './digitalEngine'
import { shouldInject, filterInjectionQueue, type InjectContext } from './injectionEngine'
export type SpinMode = 'DUPLICATE_SAFE' | 'AB_TEST' | 'FILL_TO_80' | 'CLEAN_TIGHTEN'

export interface SpinResult {
  title: string
  diff: DiffToken[]
  metadata?: {
    stepsApplied: string[]    // which steps ran (e.g. ['Step5','Step6','Step9'])
    keywordsAdded: string[]    // new keywords injected
    keywordsRemoved: string[]    // filler/wrong words removed
    locale: string      // locale applied
    isDigital: boolean     // was digital path taken
    mobileScore?: number      // mobile window score after spin
  }
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
// brandLockedWords is set per spin() call — accessible via closure
let _brandLockedWords: Set<string> = new Set()

// Model number context — words that precede numbers in title
// populated at spin time from the clean title
let _modelContextWords: Set<string> = new Set()

function buildModelContext(title: string): void {
  _modelContextWords = new Set()
  const words = title.split(/\s+/)

  // Strategy: find ALL number-containing words, then lock ALL words
  // within a 3-word window around them (the whole model phrase)
  // e.g. "Air Max 90" — 90 is number, lock Air + Max + 90
  for (let i = 0; i < words.length; i++) {
    if (/\d/.test(words[i])) {
      // Lock the number word itself
      _modelContextWords.add(words[i].toLowerCase())
      // Lock up to 2 words BEFORE the number
      if (i >= 1) _modelContextWords.add(words[i - 1].toLowerCase())
      if (i >= 2) _modelContextWords.add(words[i - 2].toLowerCase())
      // Lock 1 word AFTER the number (e.g. "Pro" in "i7 Pro")
      if (i < words.length - 1 && /^[A-Z]/.test(words[i + 1])) {
        _modelContextWords.add(words[i + 1].toLowerCase())
      }
    }
  }

  // Also lock any sequence of 2+ capitalised words (brand/model phrases)
  // e.g. "Air Max", "Galaxy Ultra", "Pro Max"
  for (let i = 0; i < words.length - 1; i++) {
    if (/^[A-Z]/.test(words[i]) && /^[A-Z]/.test(words[i + 1])) {
      _modelContextWords.add(words[i].toLowerCase())
      _modelContextWords.add(words[i + 1].toLowerCase())
    }
  }

  // Fix 8: Lock 'Size' + number as a unit — e.g. 'Size 12', 'Size 10'
  for (let i = 0; i < words.length - 1; i++) {
    if (/^size$/i.test(words[i]) && /^\d/.test(words[i + 1])) {
      _modelContextWords.add(words[i].toLowerCase())    // 'size'
      _modelContextWords.add(words[i + 1].toLowerCase())  // '12'
    }
    // Lock storage sizes — prevent '128gb' injected when '256gb' in title
    if (/^\d+gb$/i.test(words[i])) {
      _modelContextWords.add(words[i].toLowerCase())
    }
  }
}

function isLockedWord(word: string, titleIsAllCaps: boolean = false): boolean {
  if (/\d/.test(word)) return true
  // Only lock all-caps words if the whole title isn't all-caps
  // (if title is 'NIKE AIR MAX 90', every word is caps — don't lock all of them)
  if (!titleIsAllCaps && /^[A-Z]{2,}$/.test(word)) return true
  const wl = word.toLowerCase()
  // Step 8: condition words locked
  const allCondWords = [
    'new', 'brand new', 'sealed', 'used', 'pre-owned', 'refurbished',
    'faulty', 'broken', 'spares', 'grade a', 'grade b', 'tested', 'mint',
    'bnib', 'bnwt', 'vgc', 'pristine', 'immaculate', 'graded',
  ]
  if (allCondWords.some(cw => wl === cw || wl.includes(cw))) return true
  // Step 9: brand words locked
  if (_brandLockedWords.has(wl)) return true
  // Fix 3: model context words locked (words adjacent to model numbers)
  if (_modelContextWords.has(wl)) return true
  return false
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
  pet: { us: ['Non-Toxic', 'Safe for Dogs', 'Tested', 'Durable'], uk: ['Non-Toxic', 'Safe for Dogs', 'Tested', 'Durable'] },
  electronics: { us: ['Compatible', 'Genuine', 'Tested', 'Works With'], uk: ['Compatible', 'Genuine', 'Tested', 'Works With'] },
  footwear: { us: ['US Size', 'Wide Fit', 'All Day Comfort', 'Free Returns'], uk: ['UK Size', 'Wide Fit', 'All Day Comfort', 'Free Returns'] },
  clothing: { us: ['US Size', 'Unisex', 'Gift Idea', 'Free Returns'], uk: ['UK Size', 'Unisex', 'Gift Idea', 'Free Returns'] },
  auto: { us: ['OEM Quality', 'Fits Multiple', 'US Stock', 'Easy Install'], uk: ['OEM Quality', 'Fits Multiple', 'UK Stock', 'Easy Install'] },
  collectibles: { us: ["Excellent Condition", "Rare Find", "Collector's", "Genuine"], uk: ["Excellent Condition", "Rare Find", "Collector's", "Genuine"] },
  home: { us: ['Modern Design', 'Easy Clean', 'Quality', 'Genuine'], uk: ['Modern Design', 'Easy Clean', 'Quality', 'Genuine'] },
  sporting: { us: ['Lightweight', 'Adjustable', 'Professional', 'Competition Grade'], uk: ['Lightweight', 'Adjustable', 'Professional', 'Competition Grade'] },
  generic: { us: ['Fast Ship', 'Top Quality', 'Genuine', 'Great Value'], uk: ['Fast Dispatch', 'Top Quality', 'Genuine', 'Great Value'] },
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
  // Strip emoji (eBay doesn't index them and they waste chars)
  title = title.replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{27FF}\u{FE00}-\u{FEFF}]/gu, '').trim()
  // Remove prices (£50, $29.99, €20) — eBay policy violation
  title = title.replace(/[£$€]\s*\d+(\.\d+)?/g, '').trim()
  title = title.replace(/\d+(\.\d+)?\s*[£$€]/g, '').trim()
  // Clean up double spaces left by removals
  title = title.replace(/\s+/g, ' ').trim()
  let safe = title
  for (const b of BANNED_WORDS) {
    safe = safe.replace(new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '')
  }
  return safe.replace(/L@@K/gi, '').trim().replace(/\s+/g, ' ')
}

function detectCondition(title: string): 'new' | 'used' | 'refurb' | 'unknown' {
  // Step 8: Use the full condition engine for precise detection
  const { condition } = detectConditionWithWord(title)
  if (condition === 'refurbished') return 'refurb'
  if (condition === 'faulty') return 'used'   // faulty treated like used for keyword filtering
  return condition as 'new' | 'used' | 'unknown'
}

function applyThesaurus(words: string[], lockCount: number, swapChance: number, condition: string, locale: string = 'US', allCaps: boolean = false): string[] {
  // UK/US locale words — never swap TO wrong locale word
  const UK_ONLY = new Set([
    'trainers', 'jumper', 'trousers', 'nappy', 'nappies', 'pushchair', 'pram',
    'bonnet', 'boot', 'torch', 'tap', 'plaster', 'dummy', 'cot', 'buggy',
    'garden', 'hob', 'cooker', 'worktop', 'postage', 'dispatch', 'autumn',
    'colour', 'favourite', 'organise', 'aluminium', 'grey', 'tyre', 'jewellery',
    'hoover', 'sellotape', 'wellies', 'wellington', 'plimsolls', 'waistcoat',
    'biscuit', 'crisps', 'courgette', 'aubergine', 'beetroot', 'rocket',
    'spanner', 'aerial', 'mobile', 'paracetamol', 'chemist', 'solicitor',
    'lift', 'flat', 'estate agent', 'fortnight', 'whilst', 'amongst',
  ])
  const US_ONLY = new Set([
    'sneakers', 'sweater', 'pants', 'diaper', 'diapers', 'stroller', 'trunk',
    'hood', 'flashlight', 'faucet', 'band-aid', 'pacifier', 'crib', 'buggy',
    'yard', 'stovetop', 'countertop', 'trash can', 'garbage', 'fall',
    'color', 'favorite', 'organize', 'aluminum', 'gray', 'tire', 'jewelry',
    'vacuum', 'scotch tape', 'rain boots', 'flats', 'vest', 'undershirt',
    'cookie', 'chips', 'zucchini', 'eggplant', 'beet', 'arugula',
    'wrench', 'antenna', 'cell phone', 'acetaminophen', 'drugstore', 'attorney',
    'elevator', 'apartment', 'realtor', 'biweekly', 'while', 'among',
  ])

  return words.map((word, i) => {
    if (i < lockCount || isLockedWord(word, allCaps)) return word
    const lower = word.toLowerCase()
    const synonyms = THESAURUS[lower]
    if (!synonyms || !randBool(swapChance)) return word
    const safe = synonyms.filter(s => {
      const synLower = s.toLowerCase()
      // Fix 2: never swap to wrong locale word
      if (locale === 'UK' && US_ONLY.has(synLower)) return false
      if (locale === 'US' && UK_ONLY.has(synLower)) return false
      if (condition === 'used') return ![...CONDITION_NEW].some(w => synLower.includes(w))
      if (condition === 'new') return ![...CONDITION_USED].some(w => synLower.includes(w))
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

// Check if a word is a duplicate/variant of words already in title
function isDuplicateWord(newWord: string, titleWords: string[]): boolean {
  const nl = newWord.toLowerCase().replace(/s$/, '').replace(/ing$/, '').replace(/ed$/, '')
  // Fix 9: also strip hyphens for comparison — WH1000XM5 === wh-1000xm5
  const nlClean = nl.replace(/-/g, '')
  for (const tw of titleWords) {
    const tl = tw.toLowerCase().replace(/s$/, '').replace(/ing$/, '').replace(/ed$/, '')
    const tlClean = tl.replace(/-/g, '')
    if (nl === tl) return true
    if (nlClean === tlClean) return true  // hyphen-stripped match
    if ((nl.includes(tl) || tl.includes(nl)) && Math.abs(nl.length - tl.length) <= 2) return true
  }
  return false
}

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
    activeLocation: string = 'US',
    genericKeywords: RawKeyword[] = [],
    longTailKeywords: RawKeyword[] = [],
    competingListings: CompetingListing[] = [],
  ): SpinResult {

    const clean = applyPolicyGuard(originalTitle)
    if (!clean) return { title: '', diff: [] }

    const condition = detectCondition(clean)
    const conditionFull = detectConditionFull(clean) as Condition
    const words = clean.split(' ')

    // Step 11: Locale setup
    const locale = (activeLocation as Locale) ?? 'US'
    // Detect all-caps title — affects isLockedWord behaviour
    const titleIsAllCaps = words.length > 1 && words.every(w => /^[A-Z]+$/.test(w))

    // Fix 3: Build model context (protects 'Air' in 'Air Max 90')
    buildModelContext(clean)

    // Fix 6: Build original case map — preserve exact capitalisation
    const originalCaseMap = new Map<string, string>()
    for (const w of clean.split(/\s+/)) {
      originalCaseMap.set(w.toLowerCase(), w)
    }

    // ── Injection Context — built after cat is resolved (line ~629) ────────
    // Uses a getter pattern so category is always current
    const makeInjectCtx = (currentTitle: string): InjectContext => ({
      category: cat,      // 'cat' resolved by the time any spin mode runs
      condition: conditionFull,
      locale: locale,
      originalWords: clean.split(/\s+/),
      currentTitle,
      maxLength: 80,
    })
    // Note: isDigital check above returns early — all code below is physical-only

    // Fix 2: Detect original colours — never inject NEW colours
    const originalColour = detectColour(clean)
    const originalColourWords = originalColour
      ? new Set(originalColour.toLowerCase().split(/\s+/))
      : new Set<string>()

    // Step 9: Brand protection — detect brand and lock its words globally
    // Step 6 + 9: Compute competing analysis ONCE — reused for injection queue AND brand detection
    const competingAnalysis = competingListings.length >= 3
      ? analyseCompetingTitles(competingListings, clean)
      : null
    const competingPos1 = competingAnalysis?.position1Words ?? []

    // Step 9: Brand protection
    const { brandResult, lockedWords: brandLockedWords, guardFn } = getBrandProtection(clean, competingPos1)
    _brandLockedWords = brandLockedWords  // set for isLockedWord closure

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
    // Step 12 handles digital detection via detectProductType() above
    // Use new comprehensive V2 category engine
    const catV2 = detectCategoryV2(clean)

    // Step 12: Digital product detection — digital products need completely different rules
    const productTypeResult = detectProductType(clean)
    const isDigitalItem = productTypeResult.isDigital

    if (isDigitalItem) {
      // Smart digital optimisation — don't just return unchanged
      const digitalProduct = productTypeResult
      const optimised = buildOptimalDigitalTitle(clean, digitalProduct)

      // Inject buyer search keywords that are safe for digital
      let result = optimised
      if (genericKeywords.length > 0 || longTailKeywords.length > 0) {
        const buyerData = analyseBuyerSearch(genericKeywords, longTailKeywords, result)
        const digitalSafe = filterForDigital(buyerData.injectionQueue, digitalProduct.subType)
        for (const kw of digitalSafe.slice(0, 3)) {
          if (result.toLowerCase().includes(kw.toLowerCase())) continue
          if (result.length + 1 + kw.length <= 80) result += ` ${kw}`
          if (result.length >= 75) break
        }
      }

      // Inject digital-specific keywords
      const digitalKws = getDigitalKeywords(digitalProduct, result, 3)
      for (const kw of digitalKws) {
        if (result.length + 1 + kw.length <= 80) result += ` ${kw}`
        if (result.length >= 75) break
      }

      result = result.slice(0, 80).trim()
      return { title: result, diff: buildDiff(clean, result) }
    }

    // Best category: V2 wins if high/medium confidence, productInfo refines,
    // age group overrides for baby/kids
    // Step 7: subcategory gives more precise targeting (e.g. 'studio-lighting' not just 'photography')
    let cat = catRaw
    if (catV2.confidence !== 'none') cat = catV2.category as string
    if (productInfo.confidence === 'high') cat = productInfo.category
    if (ageGroup?.category === 'baby') cat = 'baby'
    if (ageGroup?.group === 'kids') cat = 'kids'

    // Use subcategory for even more precise POWER_KEYWORDS and BUYER_SEGMENTS selection
    const subCat = catV2.subcategory ?? cat

    const compatWordsList = compatible ? compatible.split(' ') : []

    let result = ''

    // ── DUPLICATE SAFE ───────────────────────────────────────────────────────
    if (mode === 'DUPLICATE_SAFE') {
      const specIndices = getSpecWordIndices(clean)
      const swapped = applyThesaurus(words, effectiveLock, 0.75, condition, locale, titleIsAllCaps)
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

      // Step 5+6: Even DUPLICATE_SAFE benefits from top buyer keyword injection
      if (result.length < 75 && (genericKeywords.length > 0 || longTailKeywords.length > 0)) {
        const buyerData = analyseBuyerSearch(genericKeywords, longTailKeywords, result)
        const dupCtx: InjectContext = makeInjectCtx(result)
        const dupQueue = filterInjectionQueue(buyerData.injectionQueue.slice(0, 5), dupCtx)
        for (const kw of dupQueue.slice(0, 2)) {
          if (result.length + 1 + kw.length <= 80) result += ` ${kw}`
          if (result.length >= 75) break
        }
      }
    }

    // ── AB_TEST: INTELLIGENT MARKET CHALLENGE ENGINE ────────────────────────
    else if (mode === 'AB_TEST') {
      const titleLower = clean.toLowerCase()
      const titleWordSet = new Set(titleLower.split(' '))

      // Detect all product attributes (reuse top-level values where possible)
      const quantity = detectQuantity(clean)
      const genderTarget = detectGenderTarget(clean)

      // If product has compatibility info, protect those words
      const compatWords = compatible ? new Set(compatible.toLowerCase().split(' ')) : new Set<string>()

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

      // ── STEP 5 + 6: Use LIVE buyer + competing title data ────────────────
      let liveSegmentKws: string[] = []
      if (genericKeywords.length > 0 || longTailKeywords.length > 0) {
        const buyerData = analyseBuyerSearch(genericKeywords, longTailKeywords, clean)
        const competingData = competingListings.length >= 3
          ? analyseCompetingTitles(competingListings, clean)
          : null

        if (competingData) {
          // Step 6 wins for must-have words — industry standard
          const combined = buildCombinedInjectionQueue(
            buyerData.injectionQueue,
            competingData.injectionQueue,
            clean,
          )
          // Step 8: filter out wrong-condition keywords
          const conditionFiltered = filterByCondition(combined, conditionFull)
          liveSegmentKws = conditionFiltered.slice(0, 3)
        } else {
          // Only Step 5 available
          const raw = getLiveSegmentKeywords(buyerData, clean, 5)
          const rawFiltered = filterByCondition(raw, conditionFull)
          liveSegmentKws = filterByLocale(rawFiltered, locale).slice(0, 3)
        }
      } else if (competingListings.length >= 3) {
        // Only Step 6 available (no keyword data)
        const competingData = analyseCompetingTitles(competingListings, clean)
        const compFiltered = filterByCondition(competingAnalysis?.injectionQueue ?? [], conditionFull)
        liveSegmentKws = filterByLocale(compFiltered, locale).slice(0, 3)
      }

      // Step 8: Add condition-preferred keywords if space allows
      const condKws = getConditionKeywords(conditionFull, clean, 2)
      if (condKws.length > 0) liveSegmentKws = [...liveSegmentKws, ...condKws].slice(0, 4)

      const segments = BUYER_SEGMENTS[effectiveCat] ?? BUYER_SEGMENTS[cat] ?? BUYER_SEGMENTS.generic

      // Filter segments based on condition — used items can't use "new" segments
      const conditionSafe = segments.filter(seg => {
        if (conditionFull === 'used' || conditionFull === 'faulty') {
          return !seg.keywords.some(kw => /\bnew\b|\bsealed\b|\bbrand new\b/i.test(kw))
        }
        if (conditionFull === 'refurbished') {
          // Refurb can't use "new" OR "used" focused segments
          return !seg.keywords.some(kw => /\bsealed\b|\bbrand new\b|\buntested\b|\bfaulty\b/i.test(kw))
        }
        return true
      })
      const uncovered = conditionSafe.filter(seg =>
        !seg.keywords.some(kw => titleLower.includes(kw.toLowerCase()))
      )
      const pool = uncovered.length > 0 ? shuffle(uncovered) : shuffle([...conditionSafe])
      const chosen = pool[0]

      // ── Step 4: Filter segment keywords strictly ─────────────────────────
      // PRIORITY: Use live buyer data if available, fall back to hardcoded segments
      let segKeywords: string[] = []

      if (liveSegmentKws.length > 0) {
        // Use shouldInject() — clean is the best available title at this point
        // (swapped is built later — we use clean as the base context)
        segKeywords = filterInjectionQueue(liveSegmentKws, makeInjectCtx(clean)).slice(0, 3)
      } else {
        // Fall back to hardcoded segments
        segKeywords = filterInjectionQueue(
          shuffle([...chosen.keywords]), makeInjectCtx(clean)
        ).slice(0, 2)
      }

      // ── Step 5: Process remaining product words ───────────────────────────
      const remainingProduct = productWords
        .slice(effectiveLock)
        .filter(w => !segKeywords.some(kw => kw.toLowerCase().includes(w.toLowerCase())))
      const swappedRemaining = applyThesaurus(remainingProduct, 0, 0.4, condition, locale, titleIsAllCaps)

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

      // Only protect high/medium-from-competing brands — not pattern-guessed misspellings
      // 'Niike' = pattern detection medium → not trusted. 'Nike' = high → trusted
      const trustBrand = brandResult.confidence === 'high' ||
        (brandResult.confidence === 'medium' && brandResult.source === 'competing')

      // ── Phase 1: Preserve original title EXACTLY ──────────────────────────
      // FILL_TO_80 rule: NEVER remove words, NEVER reorder, ONLY ADD
      // Start with clean title — remove only shipping phrases (policy violations)
      let current = removeShippingPhrases(clean)

      // Restore original capitalisation word by word
      current = current.split(/\s+/).map(w => {
        const orig = originalCaseMap.get(w.toLowerCase())
        return orig ?? w
      }).join(' ')

      // Ensure brand is at position 1 (and stays there)
      if (brandResult.brand && brandResult.brandPosition === 0) {
        const cWords = current.split(/\s+/)
        const bIdx = cWords.findIndex(w => w.toLowerCase() === brandResult.brandLower!)
        if (bIdx > 0) {
          cWords.splice(bIdx, 1)
          cWords.unshift(brandResult.brand)
          current = cWords.join(' ')
        }
      }

      // Compute buyer data for use in phases 1b and 2
      const fillBuyerData = (genericKeywords.length > 0 || longTailKeywords.length > 0)
        ? analyseBuyerSearch(genericKeywords, longTailKeywords, current)
        : null

      // ── Phase 1b: If no product noun detected, inject one from buyer data ────
      const hasProductNoun = productInfo.noun && productInfo.noun.length > 1
      if (!hasProductNoun && fillBuyerData && fillBuyerData.topSearchTerms.length > 0) {
        // Use the most common word from buyer searches as product anchor
        const topTerm = fillBuyerData.topSearchTerms[0]
        if (topTerm && !current.toLowerCase().includes(topTerm.toLowerCase())) {
          if (current.length + 1 + topTerm.length <= 80) {
            current = (current + ' ' + topTerm).trim()
          }
        }
      }

      // ── Phase 2: Build injection queue from all data sources ──────────────
      if (current.length < 75) {

        // Collect all candidate keywords
        const buyerQueue = fillBuyerData?.injectionQueue ?? []
        const competingQueue = competingAnalysis?.injectionQueue ?? []
        const conditionQueue = getConditionKeywords(conditionFull, current, 3)
        const seasonalQueue = getSeasonalConditionKeywords(conditionFull, 2)
        const isUK = activeLocation === 'UK'
        const catFillers = FILLER_BY_CATEGORY[cat]?.[isUK ? 'uk' : 'us'] ?? []
        const genFillers = FILLER_BY_CATEGORY.generic[isUK ? 'uk' : 'us']
        const powerQueue = POWER_KEYWORDS[cat] ?? POWER_KEYWORDS.generic ?? []

        // Priority order: buyer data → competing → condition → seasonal → category → power → filler
        const fullQueue = [
          ...buyerQueue,
          ...competingQueue,
          ...conditionQueue,
          ...seasonalQueue,
          ...catFillers,
          ...powerQueue,
          ...genFillers,
        ]

        // ── Phase 3: Smart injection through shouldInject gatekeeper ──────────
        for (const kw of fullQueue) {
          if (current.length >= 75) break
          if (!kw || kw.trim().length < 2) continue

          const decision = shouldInject(kw.trim(), makeInjectCtx(current))
          if (!decision.allow) continue

          current = (current + ' ' + kw.trim()).trim()
        }
      }

      // ── Phase 4: Final quality checks ─────────────────────────────────────
      // Ensure brand still at position 1
      if (trustBrand && brandResult.brand && brandResult.brandPosition === 0) {
        const finalWords = current.split(/\s+/)
        const bIdx = finalWords.findIndex(w => w.toLowerCase() === brandResult.brandLower!)
        if (bIdx > 1) {
          finalWords.splice(bIdx, 1)
          finalWords.unshift(brandResult.brand)
          current = finalWords.join(' ')
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
      const quantityInfo = detectQuantity(clean)
      const quantityWords = quantityInfo ? String(quantityInfo.quantity ?? '').split(' ') : []

      const weakMask = words.map((w, i) => {
        if (specIndicesCT.has(i)) return false
        const wl = w.toLowerCase()
        if (productNounCT.includes(wl) || wl.includes(productNounCT)) return false
        if (colourWordsCT.includes(wl)) return false
        if (compatible && compatible.toLowerCase().includes(wl)) return false
        if (quantityWords.includes(wl)) return false  // protect '2', '10', 'pack', 'pcs'
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
      const swapped = applyThesaurus(pass1, effectiveLock, 0.7, condition, locale, titleIsAllCaps)
      const unique = deduplicate(swapped)

      // ── Pass 3: Fill ALL remaining space ──────────────────────────────────
      // PRIORITY ORDER: live buyer keywords → power keywords → category fillers
      const powerPool = shuffle([...(POWER_KEYWORDS[cat] ?? POWER_KEYWORDS.generic)])
      let upgraded = removeShippingPhrases(unique.join(' '))

      // ── STEP 5 + 6: Use combined buyer + competing data ────────────────────
      {
        const buyerQueue = (genericKeywords.length > 0 || longTailKeywords.length > 0)
          ? analyseBuyerSearch(genericKeywords, longTailKeywords, upgraded).injectionQueue
          : []
        const competingQueue = competingAnalysis?.injectionQueue ?? []
        const combined = buildCombinedInjectionQueue(buyerQueue, competingQueue, upgraded)

        // Use shouldInject() for intelligent injection in CLEAN_TIGHTEN
        const cleanCtx: InjectContext = makeInjectCtx(upgraded)
        const cleanCombined = filterByCondition(combined, conditionFull)
        const cleanQueue = filterInjectionQueue(cleanCombined, cleanCtx)
        for (const kw of cleanQueue) {
          if (upgraded.length + 1 + kw.length <= 80) upgraded += ` ${kw}`
          if (upgraded.length >= 75) break
        }
        // Step 8: also inject condition-preferred keywords
        for (const kw of getConditionKeywords(conditionFull, upgraded, 2)) {
          if (upgraded.length + 1 + kw.length <= 80) upgraded += ` ${kw}`
          if (upgraded.length >= 75) break
        }
      }

      // Fall back to hardcoded power keywords
      if (upgraded.length < 75) {
        for (const kw of powerPool) {
          if (upgraded.toLowerCase().includes(kw.toLowerCase())) continue
          const kl = kw.toLowerCase()
          if (condition === 'used' && [...CONDITION_NEW].some(w => kl.includes(w))) continue
          if (condition === 'new' && [...CONDITION_USED].some(w => kl.includes(w))) continue
          if (upgraded.length + 1 + kw.length <= 80) upgraded += ` ${kw}`
          if (upgraded.length >= 75) break
        }
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

    // Step 9: Final brand guard — reinsert brand + ensure it's at position 1
    result = guardFn(result)
    // If brand detected and not at position 1, move it there
    if (brandResult.brand && brandResult.brandPosition === 0) {
      const resWords = result.split(/\s+/)
      const brandLow = brandResult.brandLower!
      const brandIdx = resWords.findIndex(w => w.toLowerCase() === brandLow)
      if (brandIdx > 0) {
        resWords.splice(brandIdx, 1)
        resWords.unshift(brandResult.brand)
        result = resWords.join(' ').slice(0, 80)
      }
    }

    // Safety: result should never be shorter than original (would be a downgrade)
    // Run AFTER guardFn so brand reinsertion is included in length check
    if (result.length < clean.length * 0.8) result = clean

    // Step 11: Apply locale translation FIRST
    // Only translate words that are WRONG for the locale — don't translate correct ones
    // e.g. UK locale: 'garden' is CORRECT — don't translate it to 'yard'
    if (locale !== 'UK') {
      result = applyLocale(result, locale)
    }
    // For UK locale — only translate US words found in result to UK equivalents
    // (applyLocale with UK already does UK→UK = no-op, just catches US words)
    if (locale === 'UK') {
      result = applyLocale(result, 'UK')
    }

    // Step 10: Mobile optimisation AFTER locale (so mobile calc uses final word lengths)
    if (mode !== 'DUPLICATE_SAFE') {
      const buyerDataForMobile = (genericKeywords.length > 0 || longTailKeywords.length > 0)
        ? analyseBuyerSearch(genericKeywords, longTailKeywords, result)
        : undefined
      const mobileResult = reorderForMobile(result, conditionFull, buyerDataForMobile, competingAnalysis ?? undefined)
      if (mobileResult.improved && mobileResult.scoreAfter >= 70) {
        result = mobileResult.title
      }
    }

    // Quality guard — if spin produced worse result, revert to clean
    // Simple heuristic: result should be at least as long as clean
    // (unless CLEAN_TIGHTEN which intentionally shortens)
    if (mode !== 'CLEAN_TIGHTEN' && result.length < clean.length * 0.7) {
      result = clean
    }

    const diff = buildDiff(clean, result)
    return { title: result, diff }
  }
}
