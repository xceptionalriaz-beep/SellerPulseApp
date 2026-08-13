// ── productNouns.ts ──────────────────────────────────────────────────────────
// Step 1 of the Title Engine Learning Path: Product Identity
// Version 2 — Complete with all categories, subcategories, ambiguous words,
// international spellings, pack patterns and missing products
// ─────────────────────────────────────────────────────────────────────────────

// ── Multi-word products — check FIRST before single words ────────────────────
export const MULTI_WORD_PRODUCTS: { phrase: string; category: string; subcategory: string }[] = [

    // Electronics — Phone accessories
    { phrase: 'phone case', category: 'electronics', subcategory: 'phone-accessories' },
    { phrase: 'phone cover', category: 'electronics', subcategory: 'phone-accessories' },
    { phrase: 'phone stand', category: 'electronics', subcategory: 'phone-accessories' },
    { phrase: 'phone holder', category: 'electronics', subcategory: 'phone-accessories' },
    { phrase: 'screen protector', category: 'electronics', subcategory: 'phone-accessories' },
    { phrase: 'power bank', category: 'electronics', subcategory: 'phone-accessories' },
    { phrase: 'car charger', category: 'electronics', subcategory: 'phone-accessories' },
    { phrase: 'wireless charger', category: 'electronics', subcategory: 'phone-accessories' },
    { phrase: 'charging cable', category: 'electronics', subcategory: 'phone-accessories' },
    { phrase: 'usb cable', category: 'electronics', subcategory: 'phone-accessories' },
    { phrase: 'usb hub', category: 'electronics', subcategory: 'computing' },
    { phrase: 'usb adapter', category: 'electronics', subcategory: 'phone-accessories' },
    { phrase: 'lightning cable', category: 'electronics', subcategory: 'phone-accessories' },
    { phrase: 'type c cable', category: 'electronics', subcategory: 'phone-accessories' },
    // Electronics — Computing
    { phrase: 'laptop stand', category: 'electronics', subcategory: 'computing' },
    { phrase: 'laptop bag', category: 'electronics', subcategory: 'computing' },
    { phrase: 'laptop case', category: 'electronics', subcategory: 'computing' },
    { phrase: 'laptop sleeve', category: 'electronics', subcategory: 'computing' },
    { phrase: 'mouse pad', category: 'electronics', subcategory: 'computing' },
    { phrase: 'mouse mat', category: 'electronics', subcategory: 'computing' },
    { phrase: 'graphics card', category: 'electronics', subcategory: 'computing' },
    { phrase: 'hard drive', category: 'electronics', subcategory: 'storage' },
    { phrase: 'solid state', category: 'electronics', subcategory: 'storage' },
    { phrase: 'memory card', category: 'electronics', subcategory: 'storage' },
    { phrase: 'sd card', category: 'electronics', subcategory: 'storage' },
    { phrase: 'cable tidy', category: 'electronics', subcategory: 'computing' },
    { phrase: 'cable management', category: 'electronics', subcategory: 'computing' },
    // Electronics — Photography
    { phrase: 'ring light', category: 'electronics', subcategory: 'photography' },
    { phrase: 'led light', category: 'electronics', subcategory: 'photography' },
    { phrase: 'camera bag', category: 'electronics', subcategory: 'photography' },
    { phrase: 'camera case', category: 'electronics', subcategory: 'photography' },
    { phrase: 'camera strap', category: 'electronics', subcategory: 'photography' },
    { phrase: 'lens cap', category: 'electronics', subcategory: 'photography' },
    { phrase: 'lens filter', category: 'electronics', subcategory: 'photography' },
    { phrase: 'camera tripod', category: 'electronics', subcategory: 'photography' },
    { phrase: 'photo printer', category: 'electronics', subcategory: 'photography' },
    // Electronics — Gaming
    { phrase: 'gaming chair', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'gaming headset', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'gaming keyboard', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'gaming mouse', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'gaming monitor', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'gaming desk', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'game controller', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'controller charger', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'rc car', category: 'toys', subcategory: 'remote-control' },
    { phrase: 'remote control car', category: 'toys', subcategory: 'remote-control' },
    // Electronics — Audio
    { phrase: 'bluetooth speaker', category: 'electronics', subcategory: 'audio' },
    { phrase: 'smart speaker', category: 'electronics', subcategory: 'audio' },
    { phrase: 'speaker stand', category: 'electronics', subcategory: 'audio' },
    // Electronics — Wearables / TV
    { phrase: 'smart watch', category: 'electronics', subcategory: 'wearables' },
    { phrase: 'watch strap', category: 'electronics', subcategory: 'wearables' },
    { phrase: 'watch band', category: 'electronics', subcategory: 'wearables' },
    { phrase: 'wall mount', category: 'electronics', subcategory: 'tv-accessories' },
    { phrase: 'tv bracket', category: 'electronics', subcategory: 'tv-accessories' },
    { phrase: 'tv stand', category: 'electronics', subcategory: 'tv-accessories' },
    { phrase: 'dash cam', category: 'electronics', subcategory: 'automotive' },
    // Pet
    { phrase: 'dog toy', category: 'pet', subcategory: 'dog-toys' },
    { phrase: 'cat toy', category: 'pet', subcategory: 'cat-toys' },
    { phrase: 'dog lead', category: 'pet', subcategory: 'dog-accessories' },
    { phrase: 'dog collar', category: 'pet', subcategory: 'dog-accessories' },
    { phrase: 'dog harness', category: 'pet', subcategory: 'dog-accessories' },
    { phrase: 'dog bed', category: 'pet', subcategory: 'dog-accessories' },
    { phrase: 'dog bowl', category: 'pet', subcategory: 'dog-accessories' },
    { phrase: 'dog crate', category: 'pet', subcategory: 'dog-accessories' },
    { phrase: 'dog coat', category: 'pet', subcategory: 'dog-accessories' },
    { phrase: 'dog food', category: 'pet', subcategory: 'dog-food' },
    { phrase: 'dog treat', category: 'pet', subcategory: 'dog-food' },
    { phrase: 'cat bed', category: 'pet', subcategory: 'cat-accessories' },
    { phrase: 'cat tree', category: 'pet', subcategory: 'cat-accessories' },
    { phrase: 'cat flap', category: 'pet', subcategory: 'cat-accessories' },
    { phrase: 'litter tray', category: 'pet', subcategory: 'cat-accessories' },
    { phrase: 'litter box', category: 'pet', subcategory: 'cat-accessories' },
    { phrase: 'cat food', category: 'pet', subcategory: 'cat-food' },
    { phrase: 'fish tank', category: 'pet', subcategory: 'fish' },
    { phrase: 'bird cage', category: 'pet', subcategory: 'birds' },
    { phrase: 'chew toy', category: 'pet', subcategory: 'dog-toys' },
    { phrase: 'rope toy', category: 'pet', subcategory: 'dog-toys' },
    { phrase: 'pet carrier', category: 'pet', subcategory: 'pet-travel' },
    // Home — Kitchen appliances
    { phrase: 'air fryer', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'coffee maker', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'coffee machine', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'coffee grinder', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'bread maker', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'slow cooker', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'pressure cooker', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'food processor', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'rice cooker', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'electric kettle', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'hand blender', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'stand mixer', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'juicer machine', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'sandwich maker', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'waffle maker', category: 'home', subcategory: 'kitchen-appliances' },
    // Home — Bedding
    { phrase: 'memory foam', category: 'home', subcategory: 'bedding' },
    { phrase: 'duvet cover', category: 'home', subcategory: 'bedding' },
    { phrase: 'bed sheets', category: 'home', subcategory: 'bedding' },
    { phrase: 'fitted sheet', category: 'home', subcategory: 'bedding' },
    { phrase: 'pillow case', category: 'home', subcategory: 'bedding' },
    { phrase: 'pillow cover', category: 'home', subcategory: 'bedding' },
    { phrase: 'mattress topper', category: 'home', subcategory: 'bedding' },
    { phrase: 'mattress protector', category: 'home', subcategory: 'bedding' },
    { phrase: 'electric blanket', category: 'home', subcategory: 'bedding' },
    // Home — Window treatments
    { phrase: 'blackout curtain', category: 'home', subcategory: 'window-treatments' },
    { phrase: 'black out curtain', category: 'home', subcategory: 'window-treatments' },
    { phrase: 'roller blind', category: 'home', subcategory: 'window-treatments' },
    { phrase: 'roman blind', category: 'home', subcategory: 'window-treatments' },
    { phrase: 'venetian blind', category: 'home', subcategory: 'window-treatments' },
    { phrase: 'shower curtain', category: 'home', subcategory: 'bathroom' },
    // Home — Lighting
    { phrase: 'desk lamp', category: 'home', subcategory: 'lighting' },
    { phrase: 'floor lamp', category: 'home', subcategory: 'lighting' },
    { phrase: 'table lamp', category: 'home', subcategory: 'lighting' },
    { phrase: 'fairy lights', category: 'home', subcategory: 'lighting' },
    { phrase: 'fairy light', category: 'home', subcategory: 'lighting' },
    { phrase: 'night light', category: 'home', subcategory: 'lighting' },
    { phrase: 'strip light', category: 'home', subcategory: 'lighting' },
    { phrase: 'led strip', category: 'home', subcategory: 'lighting' },
    { phrase: 'lamp shade', category: 'home', subcategory: 'lighting' },
    // Home — Storage
    { phrase: 'storage box', category: 'home', subcategory: 'storage' },
    { phrase: 'storage basket', category: 'home', subcategory: 'storage' },
    { phrase: 'storage rack', category: 'home', subcategory: 'storage' },
    { phrase: 'shoe rack', category: 'home', subcategory: 'storage' },
    { phrase: 'coat rack', category: 'home', subcategory: 'storage' },
    { phrase: 'spice rack', category: 'home', subcategory: 'storage' },
    { phrase: 'wine rack', category: 'home', subcategory: 'storage' },
    // Home — Bathroom
    { phrase: 'bath mat', category: 'home', subcategory: 'bathroom' },
    { phrase: 'toilet brush', category: 'home', subcategory: 'bathroom' },
    { phrase: 'toilet roll holder', category: 'home', subcategory: 'bathroom' },
    { phrase: 'soap dispenser', category: 'home', subcategory: 'bathroom' },
    // Home — Cleaning
    { phrase: 'steam mop', category: 'home', subcategory: 'cleaning' },
    { phrase: 'window cleaner', category: 'home', subcategory: 'cleaning' },
    // Clothing — Specific
    { phrase: 'rain jacket', category: 'clothing', subcategory: 'outerwear' },
    { phrase: 'winter coat', category: 'clothing', subcategory: 'outerwear' },
    { phrase: 'denim jacket', category: 'clothing', subcategory: 'outerwear' },
    { phrase: 'puffer jacket', category: 'clothing', subcategory: 'outerwear' },
    { phrase: 'leather jacket', category: 'clothing', subcategory: 'outerwear' },
    { phrase: 'bodycon dress', category: 'clothing', subcategory: 'womenswear' },
    { phrase: 'midi dress', category: 'clothing', subcategory: 'womenswear' },
    { phrase: 'maxi dress', category: 'clothing', subcategory: 'womenswear' },
    { phrase: 'mini skirt', category: 'clothing', subcategory: 'womenswear' },
    { phrase: 'swim suit', category: 'clothing', subcategory: 'swimwear' },
    { phrase: 'bikini top', category: 'clothing', subcategory: 'swimwear' },
    { phrase: 'school uniform', category: 'clothing', subcategory: 'kids' },
    // Bags — Context-specific
    { phrase: 'gym bag', category: 'sporting', subcategory: 'gym' },
    { phrase: 'sports bag', category: 'sporting', subcategory: 'gym' },
    { phrase: 'school bag', category: 'kids', subcategory: 'school' },
    { phrase: 'pencil case', category: 'kids', subcategory: 'school' },
    { phrase: 'lunch box', category: 'kids', subcategory: 'school' },
    { phrase: 'lunch bag', category: 'kids', subcategory: 'school' },
    { phrase: 'makeup bag', category: 'beauty', subcategory: 'tools' },
    { phrase: 'wash bag', category: 'beauty', subcategory: 'tools' },
    { phrase: 'nappy bag', category: 'baby', subcategory: 'baby-accessories' },
    { phrase: 'changing bag', category: 'baby', subcategory: 'baby-accessories' },
    { phrase: 'hand bag', category: 'clothing', subcategory: 'accessories' },
    { phrase: 'shoulder bag', category: 'clothing', subcategory: 'accessories' },
    { phrase: 'tote bag', category: 'clothing', subcategory: 'accessories' },
    { phrase: 'backpack', category: 'clothing', subcategory: 'accessories' },
    { phrase: 'rucksack', category: 'clothing', subcategory: 'accessories' },
    { phrase: 'bum bag', category: 'clothing', subcategory: 'accessories' },
    { phrase: 'tool bag', category: 'tools', subcategory: 'tool-storage' },
    { phrase: 'bike bag', category: 'sporting', subcategory: 'cycling' },
    { phrase: 'camera bag', category: 'electronics', subcategory: 'photography' },
    // Water bottles & drinks
    { phrase: 'water bottle', category: 'sporting', subcategory: 'gym' },
    { phrase: 'protein shaker', category: 'sporting', subcategory: 'gym' },
    { phrase: 'travel mug', category: 'home', subcategory: 'kitchen' },
    { phrase: 'coffee cup', category: 'home', subcategory: 'kitchen' },
    { phrase: 'reusable cup', category: 'home', subcategory: 'kitchen' },
    // Baby
    { phrase: 'baby monitor', category: 'baby', subcategory: 'baby-safety' },
    { phrase: 'baby carrier', category: 'baby', subcategory: 'baby-transport' },
    { phrase: 'baby bouncer', category: 'baby', subcategory: 'baby-furniture' },
    { phrase: 'baby swing', category: 'baby', subcategory: 'baby-furniture' },
    { phrase: 'moses basket', category: 'baby', subcategory: 'baby-sleeping' },
    { phrase: 'high chair', category: 'baby', subcategory: 'baby-furniture' },
    { phrase: 'stair gate', category: 'baby', subcategory: 'baby-safety' },
    { phrase: 'baby gate', category: 'baby', subcategory: 'baby-safety' },
    { phrase: 'play mat', category: 'baby', subcategory: 'baby-toys' },
    { phrase: 'changing mat', category: 'baby', subcategory: 'baby-accessories' },
    { phrase: 'bath toy', category: 'baby', subcategory: 'baby-toys' },
    // Toys & Games
    { phrase: 'board game', category: 'toys', subcategory: 'games' },
    { phrase: 'card game', category: 'toys', subcategory: 'games' },
    { phrase: 'jigsaw puzzle', category: 'toys', subcategory: 'puzzles' },
    { phrase: 'action figure', category: 'toys', subcategory: 'figures' },
    { phrase: 'soft toy', category: 'toys', subcategory: 'plush' },
    { phrase: 'stuffed animal', category: 'toys', subcategory: 'plush' },
    { phrase: 'cuddly toy', category: 'toys', subcategory: 'plush' },
    { phrase: 'train set', category: 'toys', subcategory: 'model-trains' },
    { phrase: 'lego set', category: 'toys', subcategory: 'building' },
    { phrase: 'building blocks', category: 'toys', subcategory: 'building' },
    { phrase: 'colouring book', category: 'toys', subcategory: 'arts-crafts' },
    { phrase: 'coloring book', category: 'toys', subcategory: 'arts-crafts' },
    // Sports
    { phrase: 'yoga mat', category: 'sporting', subcategory: 'yoga' },
    { phrase: 'resistance band', category: 'sporting', subcategory: 'gym' },
    { phrase: 'foam roller', category: 'sporting', subcategory: 'gym' },
    { phrase: 'jump rope', category: 'sporting', subcategory: 'gym' },
    { phrase: 'skipping rope', category: 'sporting', subcategory: 'gym' },
    { phrase: 'shin pad', category: 'sporting', subcategory: 'football' },
    { phrase: 'shin guard', category: 'sporting', subcategory: 'football' },
    { phrase: 'knee pad', category: 'sporting', subcategory: 'protection' },
    { phrase: 'elbow pad', category: 'sporting', subcategory: 'protection' },
    { phrase: 'bike lock', category: 'sporting', subcategory: 'cycling' },
    { phrase: 'bike pump', category: 'sporting', subcategory: 'cycling' },
    { phrase: 'cycling gloves', category: 'sporting', subcategory: 'cycling' },
    { phrase: 'running shoes', category: 'footwear', subcategory: 'sports-footwear' },
    { phrase: 'training shoes', category: 'footwear', subcategory: 'sports-footwear' },
    // Beauty — Hair
    { phrase: 'hair dryer', category: 'beauty', subcategory: 'hair' },
    { phrase: 'hair straightener', category: 'beauty', subcategory: 'hair' },
    { phrase: 'hair curler', category: 'beauty', subcategory: 'hair' },
    { phrase: 'curling wand', category: 'beauty', subcategory: 'hair' },
    { phrase: 'hair extension', category: 'beauty', subcategory: 'hair' },
    { phrase: 'hair clip', category: 'beauty', subcategory: 'hair' },
    { phrase: 'hair band', category: 'beauty', subcategory: 'hair' },
    { phrase: 'hair tie', category: 'beauty', subcategory: 'hair' },
    { phrase: 'hair mask', category: 'beauty', subcategory: 'hair' },
    // Beauty — Skin
    { phrase: 'face mask', category: 'beauty', subcategory: 'skincare' },
    { phrase: 'eye cream', category: 'beauty', subcategory: 'skincare' },
    { phrase: 'eye serum', category: 'beauty', subcategory: 'skincare' },
    { phrase: 'face wash', category: 'beauty', subcategory: 'skincare' },
    { phrase: 'lip gloss', category: 'beauty', subcategory: 'makeup' },
    { phrase: 'lip balm', category: 'beauty', subcategory: 'skincare' },
    { phrase: 'nail polish', category: 'beauty', subcategory: 'nails' },
    { phrase: 'nail art', category: 'beauty', subcategory: 'nails' },
    { phrase: 'electric toothbrush', category: 'beauty', subcategory: 'dental' },
    { phrase: 'teeth whitening', category: 'beauty', subcategory: 'dental' },
    // Tools
    { phrase: 'power drill', category: 'tools', subcategory: 'power-tools' },
    { phrase: 'electric drill', category: 'tools', subcategory: 'power-tools' },
    { phrase: 'circular saw', category: 'tools', subcategory: 'power-tools' },
    { phrase: 'angle grinder', category: 'tools', subcategory: 'power-tools' },
    { phrase: 'heat gun', category: 'tools', subcategory: 'power-tools' },
    { phrase: 'nail gun', category: 'tools', subcategory: 'power-tools' },
    { phrase: 'impact driver', category: 'tools', subcategory: 'power-tools' },
    { phrase: 'tape measure', category: 'tools', subcategory: 'hand-tools' },
    { phrase: 'spirit level', category: 'tools', subcategory: 'hand-tools' },
    { phrase: 'drill bit', category: 'tools', subcategory: 'accessories' },
    { phrase: 'saw blade', category: 'tools', subcategory: 'accessories' },
    { phrase: 'tool box', category: 'tools', subcategory: 'tool-storage' },
    // Garden
    { phrase: 'garden hose', category: 'garden', subcategory: 'watering' },
    { phrase: 'hose pipe', category: 'garden', subcategory: 'watering' },
    { phrase: 'plant pot', category: 'garden', subcategory: 'planting' },
    { phrase: 'grow bag', category: 'garden', subcategory: 'planting' },
    { phrase: 'seed tray', category: 'garden', subcategory: 'planting' },
    { phrase: 'raised bed', category: 'garden', subcategory: 'planting' },
    { phrase: 'compost bin', category: 'garden', subcategory: 'waste' },
    { phrase: 'lawn mower', category: 'garden', subcategory: 'lawn-care' },
    { phrase: 'hedge trimmer', category: 'garden', subcategory: 'lawn-care' },
    { phrase: 'garden fork', category: 'garden', subcategory: 'hand-tools' },
    { phrase: 'garden spade', category: 'garden', subcategory: 'hand-tools' },
    { phrase: 'watering can', category: 'garden', subcategory: 'watering' },
    { phrase: 'bird feeder', category: 'garden', subcategory: 'wildlife' },
    { phrase: 'bird bath', category: 'garden', subcategory: 'wildlife' },
    { phrase: 'garden chair', category: 'garden', subcategory: 'furniture' },
    { phrase: 'garden table', category: 'garden', subcategory: 'furniture' },
    // Arts & Crafts
    { phrase: 'paint brush', category: 'arts', subcategory: 'painting' },
    { phrase: 'art set', category: 'arts', subcategory: 'art-supplies' },
    { phrase: 'sketch pad', category: 'arts', subcategory: 'drawing' },
    { phrase: 'canvas board', category: 'arts', subcategory: 'painting' },
    // Office
    { phrase: 'office chair', category: 'office', subcategory: 'furniture' },
    { phrase: 'office desk', category: 'office', subcategory: 'furniture' },
    { phrase: 'standing desk', category: 'office', subcategory: 'furniture' },
    { phrase: 'desk organiser', category: 'office', subcategory: 'organisation' },
    { phrase: 'desk organizer', category: 'office', subcategory: 'organisation' },
    { phrase: 'file folder', category: 'office', subcategory: 'organisation' },
    { phrase: 'sticky notes', category: 'office', subcategory: 'stationery' },
    { phrase: 'paper shredder', category: 'office', subcategory: 'equipment' },
    // Travel
    { phrase: 'travel pillow', category: 'travel', subcategory: 'accessories' },
    { phrase: 'travel adapter', category: 'travel', subcategory: 'accessories' },
    { phrase: 'luggage tag', category: 'travel', subcategory: 'accessories' },
    { phrase: 'packing cube', category: 'travel', subcategory: 'accessories' },
    { phrase: 'passport holder', category: 'travel', subcategory: 'accessories' },
    { phrase: 'passport cover', category: 'travel', subcategory: 'accessories' },
    // Medical / Health
    { phrase: 'heating pad', category: 'health', subcategory: 'pain-relief' },
    { phrase: 'hot water bottle', category: 'health', subcategory: 'pain-relief' },
    { phrase: 'knee brace', category: 'health', subcategory: 'support' },
    { phrase: 'ankle support', category: 'health', subcategory: 'support' },
    { phrase: 'wrist support', category: 'health', subcategory: 'support' },
    { phrase: 'back support', category: 'health', subcategory: 'support' },
    { phrase: 'blood pressure monitor', category: 'health', subcategory: 'monitoring' },
    { phrase: 'pulse oximeter', category: 'health', subcategory: 'monitoring' },
    // Party
    { phrase: 'party banner', category: 'party', subcategory: 'decorations' },
    { phrase: 'birthday banner', category: 'party', subcategory: 'decorations' },
    { phrase: 'table cloth', category: 'party', subcategory: 'tableware' },
    { phrase: 'paper plates', category: 'party', subcategory: 'tableware' },
    // Food & Drink
    { phrase: 'protein powder', category: 'food', subcategory: 'supplements' },
    { phrase: 'vitamin supplement', category: 'food', subcategory: 'supplements' },
    { phrase: 'green tea', category: 'food', subcategory: 'tea-coffee' },
    { phrase: 'herbal tea', category: 'food', subcategory: 'tea-coffee' },
    // Automotive
    { phrase: 'car mat', category: 'automotive', subcategory: 'interior' },
    { phrase: 'seat cover', category: 'automotive', subcategory: 'interior' },
    { phrase: 'steering wheel cover', category: 'automotive', subcategory: 'interior' },
    { phrase: 'car organiser', category: 'automotive', subcategory: 'interior' },
    { phrase: 'car organizer', category: 'automotive', subcategory: 'interior' },
    { phrase: 'jump leads', category: 'automotive', subcategory: 'emergency' },
    { phrase: 'jump starter', category: 'automotive', subcategory: 'emergency' },
    { phrase: 'tyre inflator', category: 'automotive', subcategory: 'emergency' },
    { phrase: 'tire inflator', category: 'automotive', subcategory: 'emergency' },
    { phrase: 'roof rack', category: 'automotive', subcategory: 'exterior' },
    { phrase: 'tow bar', category: 'automotive', subcategory: 'exterior' },
    { phrase: 'brake pad', category: 'automotive', subcategory: 'mechanical' },
    { phrase: 'oil filter', category: 'automotive', subcategory: 'mechanical' },
    { phrase: 'air filter', category: 'automotive', subcategory: 'mechanical' },
    { phrase: 'wiper blade', category: 'automotive', subcategory: 'exterior' },

    // Seasonal
    { phrase: 'christmas tree', category: 'home', subcategory: 'seasonal' },
    { phrase: 'advent calendar', category: 'party', subcategory: 'seasonal' },
    { phrase: 'christmas stocking', category: 'party', subcategory: 'seasonal' },
    { phrase: 'wrapping paper', category: 'party', subcategory: 'seasonal' },
    { phrase: 'tree topper', category: 'home', subcategory: 'seasonal' },
    { phrase: 'fairy light', category: 'home', subcategory: 'lighting' },
    { phrase: 'halloween costume', category: 'party', subcategory: 'costumes' },
    { phrase: 'pumpkin carving', category: 'party', subcategory: 'seasonal' },
    // Digital products
    { phrase: 'gift card', category: 'digital', subcategory: 'gift' },
    { phrase: 'game code', category: 'digital', subcategory: 'gaming' },
    { phrase: 'game key', category: 'digital', subcategory: 'gaming' },
    { phrase: 'licence key', category: 'digital', subcategory: 'software' },
    { phrase: 'license key', category: 'digital', subcategory: 'software' },
    { phrase: 'download code', category: 'digital', subcategory: 'software' },
    // Model names
    { phrase: 'iphone 15', category: 'electronics', subcategory: 'phone' },
    { phrase: 'iphone 14', category: 'electronics', subcategory: 'phone' },
    { phrase: 'iphone 13', category: 'electronics', subcategory: 'phone' },
    { phrase: 'iphone 12', category: 'electronics', subcategory: 'phone' },
    { phrase: 'samsung s24', category: 'electronics', subcategory: 'phone' },
    { phrase: 'samsung s23', category: 'electronics', subcategory: 'phone' },
    { phrase: 'macbook pro', category: 'electronics', subcategory: 'computing' },
    { phrase: 'macbook air', category: 'electronics', subcategory: 'computing' },
    { phrase: 'nintendo switch', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'xbox series', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'playstation 5', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'air max', category: 'footwear', subcategory: 'sports-footwear' },
    // Common missing products
    { phrase: 'key ring', category: 'clothing', subcategory: 'accessories' },
    { phrase: 'chopping board', category: 'home', subcategory: 'kitchen-cookware' },
    { phrase: 'cutting board', category: 'home', subcategory: 'kitchen-cookware' },
    { phrase: 'serving board', category: 'home', subcategory: 'kitchen-cookware' },
    { phrase: 'welcome mat', category: 'home', subcategory: 'storage' },
    { phrase: 'door mat', category: 'home', subcategory: 'storage' },
    { phrase: 'hot water bottle', category: 'health', subcategory: 'pain-relief' },
    { phrase: 'teddy bear', category: 'toys', subcategory: 'plush' },
    { phrase: 'gift hamper', category: 'party', subcategory: 'gifts' },
    { phrase: 'starter kit', category: 'generic', subcategory: 'bundle' },
    { phrase: 'job lot', category: 'generic', subcategory: 'bulk' },

    // Apple model names
    { phrase: 'apple watch', category: 'electronics', subcategory: 'wearables' },
    { phrase: 'airpods pro', category: 'electronics', subcategory: 'audio' },
    { phrase: 'airpods max', category: 'electronics', subcategory: 'audio' },
    { phrase: 'ipad pro', category: 'electronics', subcategory: 'computing' },
    { phrase: 'ipad air', category: 'electronics', subcategory: 'computing' },
    { phrase: 'ipad mini', category: 'electronics', subcategory: 'computing' },
    { phrase: 'mac mini', category: 'electronics', subcategory: 'computing' },
    { phrase: 'ipod touch', category: 'electronics', subcategory: 'audio' },
    // Samsung model names
    { phrase: 'galaxy watch', category: 'electronics', subcategory: 'wearables' },
    { phrase: 'galaxy tab', category: 'electronics', subcategory: 'computing' },
    { phrase: 'galaxy buds', category: 'electronics', subcategory: 'audio' },
    // Sony gaming
    { phrase: 'playstation 4', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'playstation 3', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'ps vita', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'sony walkman', category: 'electronics', subcategory: 'audio' },
    // Microsoft gaming
    { phrase: 'xbox one', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'xbox 360', category: 'electronics', subcategory: 'gaming' },
    // Nintendo
    { phrase: 'nintendo ds', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'nintendo 3ds', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'nintendo 64', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'nintendo wii', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'game boy', category: 'electronics', subcategory: 'gaming' },
    { phrase: 'game cube', category: 'electronics', subcategory: 'gaming' },
    // Footwear models
    { phrase: 'air force 1', category: 'footwear', subcategory: 'sports-footwear' },
    { phrase: 'air force one', category: 'footwear', subcategory: 'sports-footwear' },
    { phrase: 'air jordan', category: 'footwear', subcategory: 'sports-footwear' },
    { phrase: 'yeezy boost', category: 'footwear', subcategory: 'sports-footwear' },
    { phrase: 'chuck taylor', category: 'footwear', subcategory: 'casual' },
    { phrase: 'old skool', category: 'footwear', subcategory: 'casual' },
    { phrase: 'ultra boost', category: 'footwear', subcategory: 'sports-footwear' },
    { phrase: 'timberland boot', category: 'footwear', subcategory: 'boots' },
    // Appliance compatibility
    { phrase: 'nespresso pod', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'nespresso capsule', category: 'home', subcategory: 'kitchen-appliances' },
    { phrase: 'dyson filter', category: 'home', subcategory: 'cleaning' },
    { phrase: 'dyson attachment', category: 'home', subcategory: 'cleaning' },
    { phrase: 'kitchenaid attachment', category: 'home', subcategory: 'kitchen-appliances' },
]

// ── International spelling variants ──────────────────────────────────────────
// Maps US spellings to UK equivalents so both are detected
export const SPELLING_VARIANTS: Record<string, string> = {
    'moisturizer': 'moisturiser',
    'color': 'colour',
    'organizer': 'organiser',
    'aluminum': 'aluminium',
    'tire': 'tyre',
    'gray': 'grey',
    'catalog': 'catalogue',
    'defense': 'defence',
    'harbor': 'harbour',
    'humor': 'humour',
    'fiber': 'fibre',
    'center': 'centre',
    'pajamas': 'pyjamas',
    'jewelry': 'jewellery',
    'diaper': 'nappy',
    'stroller': 'pushchair',
    'sneakers': 'trainers',
    'fanny pack': 'bum bag',
    'zip lock': 'ziplock',
    'vacuum cleaner': 'hoover',
}

// ── Pack / Set pattern detection ──────────────────────────────────────────────
// Handles "X Pack", "Set of X", "X Piece" patterns to find the real product
export function extractPackInfo(title: string): { quantity: number | null; unit: string | null } {
    const tl = title.toLowerCase()
    // "10 Pack", "3 Pack", "5 Pack"
    const packMatch = tl.match(/(\d+)\s*pack/i)
    if (packMatch) return { quantity: parseInt(packMatch[1]), unit: 'pack' }
    // "Set of 4", "Set of 6"
    const setMatch = tl.match(/set\s+of\s+(\d+)/i)
    if (setMatch) return { quantity: parseInt(setMatch[1]), unit: 'set' }
    // "4 Piece", "6 Piece"
    const pcMatch = tl.match(/(\d+)\s*(?:piece|pcs|pc)\b/i)
    if (pcMatch) return { quantity: parseInt(pcMatch[1]), unit: 'pcs' }
    // "2 Pair", "3 Pairs"
    const pairMatch = tl.match(/(\d+)\s*pair/i)
    if (pairMatch) return { quantity: parseInt(pairMatch[1]), unit: 'pair' }
    return { quantity: null, unit: null }
}

// ── Single product nouns per category ────────────────────────────────────────
export const PRODUCT_NOUNS: Record<string, { nouns: string[]; subcategories: Record<string, string[]> }> = {

    electronics: {
        nouns: [
            'charger', 'cable', 'case', 'cover', 'adapter', 'hub', 'dongle', 'splitter',
            'protector', 'stand', 'holder', 'mount', 'grip', 'wallet', 'pouch',
            'earbuds', 'headphones', 'headset', 'speaker', 'amplifier', 'microphone', 'mic',
            'earphones', 'soundbar', 'subwoofer', 'receiver',
            'laptop', 'keyboard', 'mouse', 'monitor', 'webcam', 'router', 'modem',
            'printer', 'scanner', 'projector', 'drive', 'ssd', 'ram', 'gpu',
            'camera', 'tripod', 'lens', 'flash', 'filter', 'gimbal', 'stabiliser', 'stabilizer',
            'smartwatch', 'watch', 'tracker',
            'console', 'controller', 'gamepad', 'joystick',
            'television', 'tv', 'remote', 'antenna', 'streamer',
            'charger', 'battery', 'powerstrip', 'extension', 'surge',
        ],
        subcategories: {
            'phone-accessories': ['charger', 'cable', 'case', 'cover', 'adapter', 'protector', 'stand', 'holder', 'mount', 'grip', 'wallet', 'pouch', 'dongle', 'hub', 'battery'],
            'audio': ['earbuds', 'headphones', 'headset', 'speaker', 'amplifier', 'microphone', 'mic', 'earphones', 'soundbar', 'subwoofer'],
            'computing': ['laptop', 'keyboard', 'mouse', 'monitor', 'webcam', 'router', 'modem', 'printer', 'scanner', 'projector', 'drive', 'ssd', 'hub'],
            'photography': ['camera', 'tripod', 'lens', 'flash', 'filter', 'gimbal', 'stabiliser', 'stabilizer'],
            'gaming': ['console', 'controller', 'gamepad', 'joystick', 'headset', 'monitor'],
            'wearables': ['smartwatch', 'watch', 'tracker'],
            'tv-accessories': ['television', 'tv', 'remote', 'antenna', 'streamer', 'mount', 'stand'],
        }
    },

    clothing: {
        nouns: [
            'shirt', 'tshirt', 'top', 'blouse', 'jumper', 'hoodie', 'sweatshirt',
            'cardigan', 'vest', 'polo', 'jersey', 'tunic', 'bodysuit', 'camisole',
            'jeans', 'trousers', 'shorts', 'leggings', 'joggers', 'chinos', 'skirt',
            'dress', 'gown', 'suit', 'blazer', 'jacket', 'coat', 'anorak', 'parka',
            'underwear', 'bra', 'briefs', 'boxers', 'thong', 'pyjamas', 'nightgown', 'robe',
            'scarf', 'hat', 'cap', 'beanie', 'gloves', 'mittens', 'belt', 'tie', 'socks', 'tights', 'wallet', 'purse', 'keyring', 'lanyard', 'umbrella',
            'swimsuit', 'bikini', 'trunks', 'shorts',
        ],
        subcategories: {
            'menswear': ['shirt', 'polo', 'chinos', 'suit', 'blazer', 'tie', 'boxers', 'briefs'],
            'womenswear': ['dress', 'blouse', 'skirt', 'bra', 'tights', 'gown', 'camisole', 'thong'],
            'sportswear': ['leggings', 'joggers', 'shorts', 'vest', 'jersey', 'tracksuit'],
            'outerwear': ['coat', 'jacket', 'anorak', 'parka', 'hoodie', 'puffer'],
            'swimwear': ['swimsuit', 'bikini', 'trunks'],
            'accessories': ['scarf', 'hat', 'cap', 'beanie', 'gloves', 'belt', 'socks'],
            'kids': ['uniform', 'babygrow', 'dungarees', 'pinafore'],
        }
    },

    footwear: {
        nouns: [
            'trainers', 'shoes', 'boots', 'sandals', 'slippers', 'heels', 'loafers',
            'sneakers', 'pumps', 'moccasins', 'espadrilles', 'brogues', 'derbies',
            'wellies', 'flip-flops', 'clogs', 'wedges', 'stilettos', 'platforms',
            'ankle boots', 'chelsea boots', 'knee boots', 'work boots', 'hiking boots',
        ],
        subcategories: {
            'sports-footwear': ['trainers', 'sneakers', 'cleats', 'spikes'],
            'formal': ['heels', 'pumps', 'brogues', 'derbies', 'loafers', 'stilettos'],
            'casual': ['slippers', 'sandals', 'flip-flops', 'espadrilles', 'moccasins', 'clogs'],
            'boots': ['boots', 'wellies', 'ankle boots', 'chelsea boots', 'knee boots', 'hiking boots', 'work boots'],
        }
    },

    pet: {
        nouns: [
            'lead', 'collar', 'harness', 'muzzle', 'tag', 'bed', 'crate', 'kennel',
            'bowl', 'feeder', 'toy', 'ball', 'rope', 'chew', 'treat', 'food', 'shampoo',
            'scratcher', 'flap', 'litter', 'carrier', 'wand', 'tunnel', 'perch',
            'cage', 'tank', 'aquarium', 'hutch', 'run', 'groomer', 'brush', 'comb',
        ],
        subcategories: {
            'dog-accessories': ['lead', 'collar', 'harness', 'muzzle', 'tag', 'bed', 'crate', 'kennel', 'bowl'],
            'dog-toys': ['toy', 'ball', 'rope', 'chew', 'tug', 'frisbee', 'squeaky'],
            'cat-accessories': ['scratcher', 'flap', 'litter', 'carrier', 'wand', 'tunnel', 'bed'],
            'fish': ['tank', 'aquarium', 'filter', 'heater', 'gravel', 'pump', 'net'],
            'birds': ['cage', 'perch', 'feeder', 'toy', 'bath', 'nest'],
            'small-animals': ['hutch', 'run', 'cage', 'bedding', 'wheel'],
        }
    },

    home: {
        nouns: [
            'pillow', 'cushion', 'duvet', 'blanket', 'throw', 'mattress', 'headboard',
            'kettle', 'toaster', 'blender', 'juicer', 'mixer', 'pan', 'pot', 'wok',
            'knife', 'board', 'mug', 'cup', 'plate', 'bowl', 'glass', 'cutlery',
            'lamp', 'candle', 'vase', 'mirror', 'clock', 'frame', 'shelf', 'rack',
            'towel', 'mat', 'dispenser', 'holder', 'basket', 'organiser', 'organizer', 'coaster', 'trivet', 'placemat', 'doormat',
            'mop', 'brush', 'vacuum', 'squeegee', 'cloth', 'sponge',
            'box', 'bin', 'drawer', 'hook', 'hanger', 'curtain', 'blind', 'voile', 'umbrella', 'flask', 'torch', 'lantern', 'wreath',
        ],
        subcategories: {
            'bedding': ['pillow', 'cushion', 'duvet', 'blanket', 'throw', 'mattress'],
            'kitchen-appliances': ['kettle', 'toaster', 'blender', 'juicer', 'mixer'],
            'kitchen-cookware': ['pan', 'pot', 'wok', 'knife', 'board'],
            'tableware': ['mug', 'cup', 'plate', 'bowl', 'glass', 'cutlery'],
            'lighting': ['lamp', 'candle', 'bulb', 'strip'],
            'storage': ['box', 'basket', 'bin', 'drawer', 'hook', 'hanger'],
            'window-treatments': ['curtain', 'blind', 'voile'],
            'bathroom': ['towel', 'mat', 'dispenser', 'holder'],
            'cleaning': ['mop', 'brush', 'vacuum', 'squeegee', 'cloth', 'sponge'],
        }
    },

    garden: {
        nouns: [
            'mower', 'trimmer', 'strimmer', 'blower', 'chainsaw',
            'hose', 'sprinkler', 'nozzle', 'connector',
            'pot', 'planter', 'trough', 'hanging basket', 'window box',
            'fork', 'spade', 'rake', 'trowel', 'hoe', 'shears', 'secateurs',
            'feeder', 'bath', 'house', 'netting', 'mesh', 'fleece',
            'chair', 'table', 'bench', 'hammock', 'parasol', 'umbrella',
            'shed', 'greenhouse', 'cold frame', 'cloche',
            'compost', 'mulch', 'fertiliser', 'fertilizer', 'pesticide',
        ],
        subcategories: {
            'lawn-care': ['mower', 'trimmer', 'strimmer', 'blower', 'edger'],
            'watering': ['hose', 'sprinkler', 'nozzle', 'can', 'connector'],
            'planting': ['pot', 'planter', 'trough', 'basket', 'box', 'bag', 'tray'],
            'hand-tools': ['fork', 'spade', 'rake', 'trowel', 'hoe', 'shears', 'secateurs'],
            'wildlife': ['feeder', 'bath', 'house', 'nesting'],
            'furniture': ['chair', 'table', 'bench', 'hammock', 'parasol'],
            'structures': ['shed', 'greenhouse', 'cold frame', 'cloche'],
        }
    },

    toys: {
        nouns: [
            'game', 'puzzle', 'figure', 'doll', 'toy', 'set', 'blocks', 'lego',
            'car', 'truck', 'train', 'plane', 'boat', 'vehicle',
            'ball', 'bat', 'frisbee', 'kite',
            'book', 'colouring', 'coloring', 'activity',
            'art', 'craft', 'paint', 'clay', 'slime', 'kinetic', 'teddy', 'bear', 'puppet', 'plush',
        ],
        subcategories: {
            'games': ['game', 'puzzle', 'cards', 'dice'],
            'figures': ['figure', 'doll', 'action figure', 'puppet'],
            'vehicles': ['car', 'truck', 'train', 'plane', 'boat', 'rc'],
            'outdoor': ['ball', 'bat', 'frisbee', 'kite', 'water pistol'],
            'arts-crafts': ['art', 'craft', 'paint', 'clay', 'slime', 'colouring'],
            'building': ['blocks', 'lego', 'magnetic', 'construction'],
            'plush': ['soft toy', 'stuffed animal', 'cuddly'],
        }
    },

    office: {
        nouns: [
            'chair', 'desk', 'drawer', 'cabinet', 'shelf', 'organiser', 'organizer',
            'pen', 'pencil', 'marker', 'highlighter', 'ruler', 'stapler', 'scissors',
            'folder', 'file', 'binder', 'notebook', 'pad', 'planner', 'diary',
            'tape', 'glue', 'eraser', 'sharpener', 'calculator',
            'printer', 'shredder', 'scanner', 'lamp', 'monitor',
            'sticky', 'note', 'postit', 'envelope', 'label',
        ],
        subcategories: {
            'furniture': ['chair', 'desk', 'drawer', 'cabinet', 'shelf'],
            'stationery': ['pen', 'pencil', 'marker', 'ruler', 'stapler', 'scissors', 'tape', 'glue'],
            'organisation': ['folder', 'file', 'binder', 'organiser', 'organizer'],
            'paper': ['notebook', 'pad', 'planner', 'diary', 'sticky', 'note', 'envelope'],
            'equipment': ['printer', 'shredder', 'scanner', 'lamp', 'calculator'],
        }
    },

    arts: {
        nouns: [
            'brush', 'canvas', 'paint', 'pencil', 'marker', 'charcoal', 'pastel',
            'easel', 'palette', 'sketchbook', 'pad', 'paper', 'card',
            'clay', 'sculpt', 'pottery', 'kiln', 'glaze',
            'yarn', 'wool', 'knitting', 'crochet', 'needle', 'thread', 'fabric', 'felt',
            'stamp', 'ink', 'die', 'cutting', 'emboss',
        ],
        subcategories: {
            'painting': ['brush', 'canvas', 'paint', 'easel', 'palette'],
            'drawing': ['pencil', 'marker', 'charcoal', 'pastel', 'sketchbook', 'pad'],
            'sculpture': ['clay', 'sculpt', 'pottery', 'kiln', 'glaze'],
            'textile': ['yarn', 'wool', 'knitting', 'crochet', 'needle', 'thread', 'fabric'],
            'paper-craft': ['stamp', 'ink', 'die', 'cutting', 'card', 'paper'],
        }
    },

    travel: {
        nouns: [
            'suitcase', 'luggage', 'bag', 'case', 'trunk',
            'pillow', 'adapter', 'converter', 'plug', 'transformer',
            'tag', 'lock', 'strap', 'cover', 'organiser', 'organizer',
            'cube', 'pouch', 'wallet', 'holder', 'passport',
            'towel', 'sheet', 'liner', 'hammock',
        ],
        subcategories: {
            'luggage': ['suitcase', 'luggage', 'bag', 'case', 'trunk'],
            'accessories': ['pillow', 'adapter', 'tag', 'lock', 'strap', 'cover', 'cube', 'pouch'],
            'documents': ['wallet', 'holder', 'passport', 'case'],
        }
    },

    health: {
        nouns: [
            'brace', 'support', 'wrap', 'bandage', 'tape', 'dressing', 'plaster',
            'pad', 'bottle', 'bag', 'compress', 'ice', 'heat',
            'monitor', 'meter', 'thermometer', 'scale', 'pulse',
            'massager', 'roller', 'ball', 'gun', 'foam',
            'supplement', 'vitamin', 'protein', 'omega', 'probiotic',
            'cream', 'gel', 'spray', 'lotion', 'ointment',
        ],
        subcategories: {
            'support': ['brace', 'support', 'wrap', 'bandage', 'tape'],
            'pain-relief': ['pad', 'bottle', 'bag', 'compress', 'ice', 'heat', 'massager', 'roller', 'gun'],
            'monitoring': ['monitor', 'meter', 'thermometer', 'scale', 'pulse'],
            'supplements': ['supplement', 'vitamin', 'protein', 'omega', 'probiotic'],
            'topical': ['cream', 'gel', 'spray', 'lotion', 'ointment'],
        }
    },

    party: {
        nouns: [
            'balloon', 'banner', 'bunting', 'garland', 'streamer',
            'plate', 'cup', 'napkin', 'tablecloth', 'cutlery',
            'candle', 'holder', 'lantern', 'light', 'confetti',
            'bag', 'box', 'ribbon', 'bow', 'wrap', 'tissue',
            'costume', 'mask', 'hat', 'wig', 'prop',
            'backdrop', 'sign', 'decoration', 'centrepiece', 'centerpiece',
        ],
        subcategories: {
            'decorations': ['balloon', 'banner', 'bunting', 'garland', 'streamer', 'confetti', 'backdrop'],
            'tableware': ['plate', 'cup', 'napkin', 'tablecloth', 'cutlery'],
            'lighting': ['candle', 'holder', 'lantern', 'light'],
            'gifts': ['bag', 'box', 'ribbon', 'bow', 'wrap', 'tissue'],
            'costumes': ['costume', 'mask', 'hat', 'wig', 'prop'],
        }
    },

    food: {
        nouns: [
            'powder', 'supplement', 'vitamin', 'capsule', 'tablet', 'gummy',
            'tea', 'coffee', 'chai', 'matcha', 'cocoa',
            'bar', 'snack', 'cereal', 'granola', 'porridge',
            'sauce', 'condiment', 'oil', 'vinegar', 'spice', 'seasoning',
            'mix', 'flour', 'sugar', 'chocolate', 'syrup',
        ],
        subcategories: {
            'supplements': ['powder', 'supplement', 'vitamin', 'capsule', 'tablet', 'gummy'],
            'tea-coffee': ['tea', 'coffee', 'chai', 'matcha', 'cocoa'],
            'snacks': ['bar', 'snack', 'cereal', 'granola', 'porridge'],
            'condiments': ['sauce', 'oil', 'vinegar', 'spice', 'seasoning'],
        }
    },

    beauty: {
        nouns: [
            'serum', 'moisturiser', 'moisturizer', 'cleanser', 'toner', 'scrub', 'peel', 'mask', 'spf', 'sunscreen', 'sunblock',
            'foundation', 'concealer', 'mascara', 'eyeliner', 'eyeshadow', 'blush', 'bronzer',
            'lipstick', 'lipgloss', 'lip liner', 'setting spray', 'primer', 'highlighter', 'contour',
            'shampoo', 'conditioner', 'oil', 'spray', 'wax', 'gel', 'pomade', 'mousse',
            'dryer', 'straightener', 'curler', 'brush', 'comb', 'clip', 'extension',
            'polish', 'gel', 'acrylic', 'file', 'buffer', 'cuticle', 'remover',
            'sponge', 'roller', 'tweezers', 'razor', 'trimmer', 'epilator',
            'perfume', 'cologne', 'deodorant', 'antiperspirant',
        ],
        subcategories: {
            'skincare': ['serum', 'moisturiser', 'moisturizer', 'cleanser', 'toner', 'scrub', 'peel', 'mask', 'spf', 'sunscreen'],
            'makeup': ['foundation', 'concealer', 'mascara', 'eyeliner', 'eyeshadow', 'lipstick', 'blush', 'bronzer', 'primer', 'highlighter'],
            'hair': ['shampoo', 'conditioner', 'dryer', 'straightener', 'curler', 'brush', 'oil', 'gel', 'wax'],
            'nails': ['polish', 'gel', 'acrylic', 'file', 'buffer', 'cuticle', 'remover'],
            'tools': ['sponge', 'roller', 'tweezers', 'razor', 'trimmer', 'epilator'],
            'fragrance': ['perfume', 'cologne', 'deodorant', 'antiperspirant'],
        }
    },

    tools: {
        nouns: [
            'drill', 'saw', 'grinder', 'sander', 'planer', 'router', 'jigsaw',
            'nail gun', 'heat gun', 'impact driver', 'wrench', 'ratchet',
            'hammer', 'screwdriver', 'spanner', 'chisel', 'level', 'square',
            'clamp', 'vice', 'pliers', 'cutters', 'snips',
            'toolbox', 'bag', 'organiser', 'organizer', 'cabinet', 'mount',
            'bit', 'blade', 'disc', 'attachment', 'chuck', 'socket',
        ],
        subcategories: {
            'power-tools': ['drill', 'saw', 'grinder', 'sander', 'planer', 'router', 'jigsaw', 'nail gun', 'heat gun', 'impact driver'],
            'hand-tools': ['hammer', 'screwdriver', 'spanner', 'chisel', 'level', 'clamp', 'vice', 'pliers', 'wrench', 'ratchet'],
            'tool-storage': ['toolbox', 'bag', 'organiser', 'organizer', 'cabinet'],
            'accessories': ['bit', 'blade', 'disc', 'attachment', 'chuck', 'socket'],
        }
    },

    sporting: {
        nouns: [
            'dumbbell', 'barbell', 'weight', 'kettlebell', 'bench', 'rack', 'plate',
            'mat', 'block', 'strap', 'ball', 'roller', 'ring', 'band',
            'bat', 'racket', 'glove', 'helmet', 'pad', 'net', 'goal', 'hoop',
            'helmet', 'lock', 'pump', 'light', 'bottle', 'cage', 'saddle',
            'goggle', 'cap', 'float', 'kickboard', 'fins',
            'shoe', 'sock', 'vest', 'shorts', 'top', 'leggings', 'gloves',
        ],
        subcategories: {
            'gym': ['dumbbell', 'barbell', 'weight', 'kettlebell', 'bench', 'rack', 'plate', 'band', 'roller'],
            'yoga': ['mat', 'block', 'strap', 'ball', 'ring'],
            'cycling': ['helmet', 'lock', 'pump', 'light', 'saddle', 'cage'],
            'swimming': ['goggle', 'cap', 'float', 'kickboard', 'fins'],
            'football': ['ball', 'boot', 'pad', 'glove', 'net', 'goal'],
            'tennis': ['racket', 'ball', 'grip', 'bag', 'string'],
            'cricket': ['bat', 'ball', 'pad', 'glove', 'helmet'],
        }
    },

    jewellery: {
        nouns: [
            'ring', 'necklace', 'bracelet', 'earring', 'pendant', 'chain',
            'brooch', 'anklet', 'cufflinks', 'bangle', 'charm', 'locket',
            'choker', 'stud', 'hoop', 'signet', 'watch',
        ],
        subcategories: {
            'rings': ['ring', 'signet', 'band'],
            'necklaces': ['necklace', 'pendant', 'chain', 'choker', 'locket'],
            'bracelets': ['bracelet', 'bangle', 'anklet', 'charm', 'cuff'],
            'earrings': ['earring', 'stud', 'hoop', 'drop'],
        }
    },

    collectibles: {
        nouns: [
            'figure', 'figurine', 'card', 'coin', 'stamp', 'poster', 'print',
            'memorabilia', 'autograph', 'programme', 'badge', 'pin',
            'vinyl', 'record', 'cassette', 'book', 'magazine', 'comic',
            'model', 'diecast', 'statue', 'bust', 'plaque',
        ],
        subcategories: {
            'figures': ['figure', 'figurine', 'statue', 'bust', 'model'],
            'cards': ['card', 'trading card'],
            'music': ['vinyl', 'record', 'cassette', 'cd'],
            'sports': ['memorabilia', 'autograph', 'programme', 'badge'],
            'coins': ['coin', 'note', 'bullion', 'medal'],
        }
    },

    music: {
        nouns: [
            'guitar', 'bass', 'ukulele', 'violin', 'cello', 'banjo', 'mandolin',
            'keyboard', 'piano', 'synthesiser', 'synthesizer', 'organ', 'accordion',
            'flute', 'saxophone', 'trumpet', 'clarinet', 'harmonica', 'recorder',
            'drum', 'cymbal', 'snare', 'hi-hat', 'drumstick', 'cajon', 'tambourine',
            'capo', 'pick', 'plectrum', 'strap', 'stand', 'cable', 'tuner', 'pedal', 'amplifier',
        ],
        subcategories: {
            'guitar': ['guitar', 'bass', 'ukulele', 'banjo', 'mandolin', 'capo', 'pick', 'plectrum', 'strap', 'pedal'],
            'piano': ['keyboard', 'piano', 'synthesiser', 'synthesizer', 'organ', 'accordion'],
            'drums': ['drum', 'cymbal', 'snare', 'hi-hat', 'drumstick', 'cajon'],
            'accessories': ['stand', 'cable', 'tuner', 'amplifier', 'case', 'bag'],
        }
    },

    books: {
        nouns: [
            'book', 'novel', 'textbook', 'guide', 'manual', 'biography', 'autobiography',
            'fiction', 'cookbook', 'journal', 'planner', 'diary',
            'dictionary', 'encyclopaedia', 'encyclopedia', 'atlas', 'comic', 'graphic novel', 'magazine',
        ],
        subcategories: {
            'fiction': ['novel', 'fiction', 'thriller', 'romance', 'horror', 'fantasy'],
            'non-fiction': ['biography', 'autobiography', 'guide', 'manual', 'textbook', 'cookbook'],
            'stationery': ['journal', 'planner', 'diary', 'notebook'],
        }
    },

    automotive: {
        nouns: [
            'wiper', 'mirror', 'bumper', 'spoiler', 'grille', 'light', 'headlight', 'taillight',
            'mat', 'cover', 'organiser', 'organizer',
            'filter', 'belt', 'pump', 'hose', 'sensor', 'pad', 'disc', 'caliper',
            'spring', 'absorber', 'exhaust', 'manifold',
            'cam', 'nav', 'stereo', 'speaker', 'remote', 'antenna',
            'bar', 'rack', 'net', 'leads', 'starter', 'inflator', 'jump',
        ],
        subcategories: {
            'exterior': ['wiper', 'mirror', 'bumper', 'spoiler', 'light', 'grille', 'rack', 'bar'],
            'interior': ['mat', 'cover', 'organiser', 'organizer'],
            'mechanical': ['filter', 'belt', 'pump', 'pad', 'disc', 'exhaust'],
            'electronics': ['cam', 'nav', 'stereo', 'speaker'],
            'emergency': ['leads', 'starter', 'inflator', 'jump'],
        }
    },


    digital: {
        nouns: [
            'ebook', 'software', 'app', 'game', 'code', 'key', 'licence', 'license',
            'download', 'voucher', 'gift card', 'subscription', 'account',
            'course', 'tutorial', 'template', 'plugin', 'theme', 'font',
        ],
        subcategories: {
            'gaming': ['game', 'code', 'key', 'dlc', 'season pass'],
            'software': ['software', 'app', 'licence', 'license', 'key', 'plugin', 'theme', 'font'],
            'books': ['ebook', 'audiobook', 'course', 'tutorial'],
            'gift': ['gift card', 'voucher', 'subscription'],
        }
    },

    baby: {
        nouns: [
            'pram', 'buggy', 'pushchair', 'stroller', 'sling', 'carrier',
            'cot', 'crib', 'basket', 'bumper', 'mattress',
            'bouncer', 'rocker', 'swing', 'playmat', 'gym',
            'bottle', 'steriliser', 'sterilizer', 'weaning', 'spoon', 'bib', 'cup',
            'nappy', 'diaper', 'wipe', 'cream', 'monitor', 'gate', 'lock',
            'toy', 'rattle', 'teether', 'mobile', 'nightlight', 'comforter',
        ],
        subcategories: {
            'baby-transport': ['pram', 'buggy', 'pushchair', 'stroller', 'sling', 'carrier'],
            'baby-sleeping': ['cot', 'crib', 'basket', 'bumper', 'mattress', 'nightlight', 'comforter'],
            'baby-feeding': ['bottle', 'steriliser', 'sterilizer', 'weaning', 'spoon', 'bib', 'cup'],
            'baby-safety': ['monitor', 'gate', 'lock'],
            'baby-toys': ['toy', 'rattle', 'teether', 'mobile', 'playmat', 'gym'],
            'baby-accessories': ['nappy', 'diaper', 'wipe', 'cream'],
        }
    },

}

// ── Ambiguous word resolution ─────────────────────────────────────────────────
// Some words could belong to multiple categories.
// Use surrounding context words to resolve.
export const AMBIGUOUS_WORDS: Record<string, { contextWords: string[]; category: string; subcategory: string }[]> = {
    'case': [
        { contextWords: ['phone', 'iphone', 'samsung', 'android', 'mobile'], category: 'electronics', subcategory: 'phone-accessories' },
        { contextWords: ['laptop', 'macbook', 'ipad', 'tablet'], category: 'electronics', subcategory: 'computing' },
        { contextWords: ['suitcase', 'luggage', 'travel', 'cabin'], category: 'travel', subcategory: 'luggage' },
        { contextWords: ['guitar', 'keyboard', 'instrument', 'music'], category: 'music', subcategory: 'accessories' },
        { contextWords: ['glasses', 'sunglasses', 'spectacles'], category: 'beauty', subcategory: 'accessories' },
        { contextWords: ['watch'], category: 'electronics', subcategory: 'wearables' },
    ],
    'stand': [
        { contextWords: ['phone', 'mobile', 'tablet', 'ipad'], category: 'electronics', subcategory: 'phone-accessories' },
        { contextWords: ['laptop', 'monitor', 'computer'], category: 'electronics', subcategory: 'computing' },
        { contextWords: ['music', 'guitar', 'keyboard', 'drum'], category: 'music', subcategory: 'accessories' },
        { contextWords: ['tv', 'television', 'screen'], category: 'electronics', subcategory: 'tv-accessories' },
        { contextWords: ['lamp', 'light', 'floor'], category: 'home', subcategory: 'lighting' },
        { contextWords: ['plant', 'flower', 'pot'], category: 'home', subcategory: 'storage' },
    ],
    'bag': [
        { contextWords: ['gym', 'sport', 'training', 'fitness'], category: 'sporting', subcategory: 'gym' },
        { contextWords: ['school', 'kids', 'children', 'backpack'], category: 'kids', subcategory: 'school' },
        { contextWords: ['makeup', 'cosmetic', 'beauty'], category: 'beauty', subcategory: 'tools' },
        { contextWords: ['nappy', 'baby', 'changing', 'diaper'], category: 'baby', subcategory: 'baby-accessories' },
        { contextWords: ['laptop', 'computer', 'macbook'], category: 'electronics', subcategory: 'computing' },
        { contextWords: ['tool', 'drill', 'electric'], category: 'tools', subcategory: 'tool-storage' },
        { contextWords: ['camera', 'photography', 'lens'], category: 'electronics', subcategory: 'photography' },
        { contextWords: ['bike', 'cycling', 'cycle'], category: 'sporting', subcategory: 'cycling' },
        { contextWords: ['hand', 'shoulder', 'tote', 'clutch', 'purse'], category: 'clothing', subcategory: 'accessories' },
        { contextWords: ['travel', 'luggage', 'cabin', 'flight'], category: 'travel', subcategory: 'luggage' },
    ],
    'mat': [
        { contextWords: ['yoga', 'pilates', 'exercise', 'stretch'], category: 'sporting', subcategory: 'yoga' },
        { contextWords: ['car', 'boot', 'vehicle', 'floor'], category: 'automotive', subcategory: 'interior' },
        { contextWords: ['bath', 'bathroom', 'shower', 'non-slip'], category: 'home', subcategory: 'bathroom' },
        { contextWords: ['door', 'entrance', 'welcome', 'outdoor'], category: 'home', subcategory: 'storage' },
        { contextWords: ['mouse', 'desk', 'gaming', 'computer'], category: 'electronics', subcategory: 'computing' },
        { contextWords: ['baby', 'play', 'crawling', 'infant'], category: 'baby', subcategory: 'baby-toys' },
        { contextWords: ['table', 'dining', 'place', 'heat'], category: 'home', subcategory: 'tableware' },
    ],
    'cover': [
        { contextWords: ['phone', 'iphone', 'samsung', 'mobile'], category: 'electronics', subcategory: 'phone-accessories' },
        { contextWords: ['duvet', 'bed', 'pillow', 'quilt'], category: 'home', subcategory: 'bedding' },
        { contextWords: ['seat', 'car', 'vehicle', 'sofa'], category: 'automotive', subcategory: 'interior' },
        { contextWords: ['book', 'passport', 'notebook'], category: 'travel', subcategory: 'accessories' },
    ],
    'light': [
        { contextWords: ['ring', 'selfie', 'photo', 'studio', 'tiktok', 'youtube'], category: 'electronics', subcategory: 'photography' },
        { contextWords: ['fairy', 'string', 'led', 'christmas', 'xmas'], category: 'home', subcategory: 'lighting' },
        { contextWords: ['night', 'baby', 'bedroom', 'sleep'], category: 'home', subcategory: 'lighting' },
        { contextWords: ['bike', 'cycling', 'front', 'rear', 'helmet'], category: 'sporting', subcategory: 'cycling' },
        { contextWords: ['strip', 'under', 'cabinet', 'kitchen'], category: 'home', subcategory: 'lighting' },
    ],
    'band': [
        { contextWords: ['resistance', 'exercise', 'fitness', 'stretch', 'gym'], category: 'sporting', subcategory: 'gym' },
        { contextWords: ['watch', 'smart', 'fitness', 'apple', 'samsung'], category: 'electronics', subcategory: 'wearables' },
        { contextWords: ['hair', 'elastic', 'ponytail'], category: 'beauty', subcategory: 'hair' },
        { contextWords: ['rubber', 'office', 'stationery'], category: 'office', subcategory: 'stationery' },
    ],
    'pad': [
        { contextWords: ['knee', 'elbow', 'shin', 'protective', 'sport'], category: 'sporting', subcategory: 'protection' },
        { contextWords: ['mouse', 'gaming', 'desk', 'computer'], category: 'electronics', subcategory: 'computing' },
        { contextWords: ['heating', 'electric', 'back', 'pain', 'heat'], category: 'health', subcategory: 'pain-relief' },
        { contextWords: ['writing', 'note', 'paper', 'office'], category: 'office', subcategory: 'paper' },
        { contextWords: ['brake', 'disc', 'caliper', 'car', 'vehicle'], category: 'automotive', subcategory: 'mechanical' },
        { contextWords: ['baby', 'changing', 'waterproof'], category: 'baby', subcategory: 'baby-accessories' },
    ],
    'brush': [
        { contextWords: ['makeup', 'foundation', 'blush', 'eyeshadow', 'beauty'], category: 'beauty', subcategory: 'tools' },
        { contextWords: ['paint', 'art', 'canvas', 'watercolour', 'oil'], category: 'arts', subcategory: 'painting' },
        { contextWords: ['hair', 'styling', 'detangling', 'boar'], category: 'beauty', subcategory: 'hair' },
        { contextWords: ['teeth', 'toothbrush', 'dental', 'oral'], category: 'beauty', subcategory: 'dental' },
        { contextWords: ['nail', 'gel', 'acrylic', 'polish'], category: 'beauty', subcategory: 'nails' },
        { contextWords: ['dog', 'pet', 'grooming', 'animal'], category: 'pet', subcategory: 'dog-accessories' },
        { contextWords: ['toilet', 'bathroom', 'cleaning'], category: 'home', subcategory: 'bathroom' },
    ],
}



// ── Size system detection ─────────────────────────────────────────────────────
// Detects clothing and shoe sizes so engine knows these are specs
export const SIZE_PATTERNS = {
    ukClothing: /\b(size\s*)?(4|6|8|10|12|14|16|18|20|22|24)\b/i,
    usClothing: /\b(size\s*)?(0|2|4|6|8|10|12|14|16)\b/i,
    euClothing: /\b(size\s*)?(32|34|36|38|40|42|44|46|48|50)\b/i,
    ukShoe: /\b(uk\s*)(3|4|5|6|7|8|9|10|11|12|13)\b/i,
    usShoe: /\b(us\s*)(4|5|6|7|8|9|10|11|12|13|14)\b/i,
    euShoe: /\b(eu\s*)(35|36|37|38|39|40|41|42|43|44|45|46|47)\b/i,
    kidsAge: /\b(\d+[-–]\d+\s*(month|months|year|years|m|y|yr)s?)\b/i,
    kidsAgeWord: /\b(newborn|infant|baby|toddler|teen|teenager)\b/i,
}

export function detectSizeSystem(title: string): string | null {
    for (const [system, pattern] of Object.entries(SIZE_PATTERNS)) {
        if (pattern.test(title)) return system
    }
    return null
}

// ── Age group detection ───────────────────────────────────────────────────────
// Tells engine which buyer age group the product targets
export const AGE_GROUPS: { pattern: RegExp; group: string; category: string }[] = [
    { pattern: /\b(newborn|0-3\s*m|0-3\s*month)\b/i, group: 'newborn', category: 'baby' },
    { pattern: /\b(baby|infant|0-12|3-6|6-12\s*month)\b/i, group: 'baby', category: 'baby' },
    { pattern: /\b(toddler|1-2|2-3|1-3\s*year)\b/i, group: 'toddler', category: 'baby' },
    { pattern: /\b(kids|children|boys|girls|3-12|4-5|5-6\s*year)\b/i, group: 'kids', category: 'kids' },
    { pattern: /\b(teen|teenager|junior|youth|13-17)\b/i, group: 'teen', category: 'clothing' },
    { pattern: /\b(adult|mens|womens|ladies|men|women|unisex)\b/i, group: 'adult', category: 'clothing' },
    { pattern: /\b(senior|elderly|elder|mature|over 60|over60)\b/i, group: 'senior', category: 'health' },
]

export function detectAgeGroup(title: string): { group: string; category: string } | null {
    for (const ag of AGE_GROUPS) {
        if (ag.pattern.test(title)) return { group: ag.group, category: ag.category }
    }
    return null
}

// ── Colour detection ──────────────────────────────────────────────────────────
// Complete colour list including patterns and finishes
export const COLOURS = new Set([
    // Basic
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple',
    'pink', 'brown', 'grey', 'gray', 'silver', 'gold', 'clear', 'transparent',
    // Extended
    'navy', 'teal', 'olive', 'khaki', 'burgundy', 'maroon', 'coral', 'peach',
    'mint', 'lavender', 'lilac', 'turquoise', 'cream', 'ivory', 'beige', 'tan',
    'charcoal', 'slate', 'copper', 'bronze', 'rose gold', 'champagne',
    // Patterns
    'multicolour', 'multicolor', 'tie dye', 'tie-dye', 'camo', 'camouflage',
    'floral', 'striped', 'stripe', 'check', 'checked', 'plaid', 'tartan',
    'leopard', 'zebra', 'animal print', 'polka dot', 'geometric', 'abstract',
    // Finishes
    'matte', 'gloss', 'glossy', 'metallic', 'holographic', 'iridescent',
    'neon', 'pastel', 'dark', 'light', 'bright', 'natural', 'nude',
])

export function detectColour(title: string): string | null {
    const tl = title.toLowerCase()
    for (const colour of COLOURS) {
        if (tl.includes(colour)) return colour
    }
    return null
}

// ── Compatibility detection ───────────────────────────────────────────────────
// Detects what device/brand the product is compatible with
export const COMPATIBILITY_BRANDS = [
    // Phones
    'iphone', 'samsung', 'google pixel', 'huawei', 'oneplus', 'xiaomi', 'oppo',
    // Tablets
    'ipad', 'android tablet', 'kindle', 'surface',
    // Computers
    'macbook', 'mac', 'imac', 'lenovo', 'dell', 'hp', 'asus', 'acer',
    // Gaming
    'playstation', 'ps4', 'ps5', 'xbox', 'nintendo switch', 'nintendo',
    // Appliances
    'dyson', 'hoover', 'shark', 'henry', 'miele', 'bosch', 'dewalt', 'makita',
    'nespresso', 'dolce gusto', 'tassimo', 'keurig', 'kitchenaid', 'kenwood',
    // Cars
    'volkswagen', 'vw', 'bmw', 'mercedes', 'ford', 'toyota', 'honda', 'audi',
    'vauxhall', 'nissan', 'hyundai', 'kia', 'seat', 'skoda', 'peugeot', 'renault',
    // Smart home
    'alexa', 'google home', 'ring', 'philips hue', 'nest',
]

export function detectCompatibility(title: string): string | null {
    const tl = title.toLowerCase()
    for (const brand of COMPATIBILITY_BRANDS) {
        if (tl.includes(brand)) return brand
    }
    return null
}


// ── Condition words — complete list ──────────────────────────────────────────
// All the ways sellers describe item condition on eBay
export const CONDITION_WORDS = {
    new: new Set([
        'new', 'brand new', 'brand-new', 'sealed', 'unopened', 'unused', 'unboxed',
        'boxed', 'mint', 'perfect', 'immaculate', 'pristine', 'bnib', 'bnwt', 'bnwob',
        'new with tags', 'new without tags', 'new in box', 'new in packaging',
    ]),
    used: new Set([
        'used', 'pre-owned', 'pre owned', 'second hand', 'secondhand', 'preloved',
        'pre-loved', 'good condition', 'very good', 'near mint', 'vgc', 'excellent',
        'fair condition', 'poor condition', 'heavily used', 'well used', 'worn',
        'vintage', 'antique', 'retro', 'classic',
    ]),
    faulty: new Set([
        'faulty', 'broken', 'damaged', 'spares', 'parts only', 'for parts', 'spares only',
        'untested', 'not working', 'dead', 'cracked', 'scratched', 'dented',
        'as is', 'as seen', 'sold as seen', 'read description',
    ]),
    refurbished: new Set([
        'refurbished', 'reconditioned', 'restored', 'renewed', 'remanufactured',
        'grade a', 'grade b', 'grade c', 'grade d', 'ex display', 'ex demo',
        'open box', 'tested', 'fully tested', 'tested working', 'fully working',
        'working order', 'good working order', 'graded',
    ]),
}

export function detectConditionFull(title: string): string {
    const tl = title.toLowerCase()
    for (const [cond, words] of Object.entries(CONDITION_WORDS)) {
        for (const word of words) {
            if (tl.includes(word)) return cond
        }
    }
    return 'unknown'
}

// ── Quantity patterns — complete list ─────────────────────────────────────────
// All the ways sellers describe quantities on eBay
export const QUANTITY_PATTERNS = [
    // Multiplier format: x2, x3, x4, 2x, 3x
    { pattern: /([2-9]|[1-9]\d+)\s*x|x\s*([2-9]|[1-9]\d+)/i, format: 'multiplier' },
    // Pack format: 10 pack, 5-pack
    { pattern: /(\d+)\s*[-–]?\s*pack/i, format: 'pack' },
    // Set of: set of 4, set of 6
    { pattern: /set\s+of\s+(\d+)/i, format: 'set' },
    // Piece: 10 piece, 3 pcs, 5pc
    { pattern: /(\d+)\s*(?:piece|pcs|pc)/i, format: 'piece' },
    // Pair: 2 pair, 3 pairs
    { pattern: /(\d+)\s*pairs?/i, format: 'pair' },
    // Bundle of
    { pattern: /bundle\s+of\s+(\d+)/i, format: 'bundle' },
    // Box of
    { pattern: /box\s+of\s+(\d+)/i, format: 'box' },
    // Bag of
    { pattern: /bag\s+of\s+(\d+)/i, format: 'bag' },
    // Roll of
    { pattern: /roll\s+of\s+(\d+)/i, format: 'roll' },
    // Sheet of
    { pattern: /sheet\s+of\s+(\d+)/i, format: 'sheet' },
    // Named quantities
    { pattern: /twin/i, format: 'twin' },
    { pattern: /triple/i, format: 'triple' },
    { pattern: /quad/i, format: 'quad' },
    { pattern: /duo/i, format: 'duo' },
    { pattern: /bulk/i, format: 'bulk' },
    { pattern: /multipack|multi.pack/i, format: 'multipack' },
    { pattern: /value\s+pack/i, format: 'value-pack' },
    { pattern: /job\s+lot/i, format: 'job-lot' },
]

export function detectQuantity(title: string): { quantity: number | null; format: string } | null {
    for (const qp of QUANTITY_PATTERNS) {
        const match = title.match(qp.pattern)
        if (match) {
            const num = parseInt(match[1] || match[2] || '1')
            return { quantity: isNaN(num) ? null : num, format: qp.format }
        }
    }
    return null
}

// ── Gender / Target audience ──────────────────────────────────────────────────
// Comprehensive gender and target detection
export const GENDER_TARGETS = {
    male: ['mens', 'men', 'boys', 'male', 'his', 'him', 'husband', 'dad', 'father', 'grandad', 'grandfather', 'groom', 'bachelor'],
    female: ['womens', 'women', 'ladies', 'girls', 'female', 'hers', 'her', 'wife', 'mum', 'mom', 'mother', 'grandmother', 'bride', 'bachelorette'],
    couples: ['couples', 'his and hers', 'his & hers', 'pair', 'partners', 'anniversary', 'wedding'],
    baby: ['baby', 'infant', 'newborn', 'nursery', 'maternity', 'nursing', 'nappy', 'diaper'],
    kids: ['kids', 'children', 'child', 'toddler', 'boys', 'girls', 'school', 'playground', 'junior'],
    teen: ['teen', 'teenager', 'youth', 'junior', 'young adult'],
    senior: ['senior', 'elderly', 'elder', 'mature', 'arthritis', 'dementia', 'care'],
    plusSize: ['plus size', 'plus-size', 'curve', 'curvy', 'extended', '1x', '2x', '3x', '4x', '5x'],
    petite: ['petite', 'short', 'small frame', 'xs', 'xxs'],
    tall: ['tall', 'long', 'extended length', 'long leg', 'long sleeve'],
    maternity: ['maternity', 'pregnancy', 'pregnant', 'nursing', 'breastfeeding', 'bump'],
    unisex: ['unisex', 'gender neutral', 'gender-neutral', 'all gender', 'nonbinary'],
}

export function detectGenderTarget(title: string): string | null {
    const tl = title.toLowerCase()
    for (const [gender, words] of Object.entries(GENDER_TARGETS)) {
        if (words.some(w => tl.includes(w))) return gender
    }
    return null
}

// ── Power / Voltage system ────────────────────────────────────────────────────
export const VOLTAGE_SYSTEMS = {
    uk: ['240v', 'uk plug', '13a', 'bs1363'],
    us: ['110v', '120v', 'us plug', 'nema'],
    eu: ['220v', '230v', 'eu plug', 'schuko'],
    multi: ['multi voltage', 'dual voltage', 'worldwide', 'international', '110-240'],
}

export function detectVoltageSystem(title: string): string | null {
    const tl = title.toLowerCase()
    for (const [system, patterns] of Object.entries(VOLTAGE_SYSTEMS)) {
        if (patterns.some(p => tl.includes(p))) return system
    }
    return null
}

// ── Digital product detection ─────────────────────────────────────────────────
// Digital products need completely different spin rules — no shipping words,
// no condition words, no physical descriptors
export const DIGITAL_SIGNALS = new Set([
    'download', 'ebook', 'digital', 'code', 'key', 'licence', 'license',
    'voucher', 'gift card', 'software', 'app', 'subscription', 'account',
    'pdf', 'instant', 'printable', 'online', 'virtual', 'streaming',
])

export function isDigitalProduct(title: string): boolean {
    const tl = title.toLowerCase()
    return [...DIGITAL_SIGNALS].some(signal => tl.includes(signal))
}

// ── Spare parts / accessories pattern ────────────────────────────────────────
// "Case for iPhone 15" → main product is BEFORE "for"
// "Compatible with Samsung" → main product is BEFORE "compatible"
export function extractCompatibilityTarget(title: string): string | null {
    const tl = title.toLowerCase()
    // "for iPhone/Samsung/MacBook" pattern
    const forMatch = tl.match(/(?:for|compatible with|fits?|works? with)\s+([a-z0-9\s]+?)(?:\s+and|\s+all|\s+plus|\s+pro|$)/i)
    if (forMatch) return forMatch[1].trim()
    return null
}

// ── Core function: Find product noun in a title ──────────────────────────────
export function findProductNoun(title: string): {
    noun: string
    category: string
    subcategory: string
    confidence: 'high' | 'medium' | 'low'
} {
    // Normalise international spellings first
    let normTitle = title.toLowerCase()
    for (const [us, uk] of Object.entries(SPELLING_VARIANTS)) {
        normTitle = normTitle.replace(new RegExp(`\\b${us}\\b`, 'gi'), uk)
    }

    const words = normTitle.split(/\s+/)

    // Step 1: Check multi-word products first (most specific, highest confidence)
    for (const mwp of MULTI_WORD_PRODUCTS) {
        if (normTitle.includes(mwp.phrase)) {
            return { noun: mwp.phrase, category: mwp.category, subcategory: mwp.subcategory, confidence: 'high' }
        }
    }

    // Step 2: Resolve ambiguous words using context
    for (const [ambigWord, resolutions] of Object.entries(AMBIGUOUS_WORDS)) {
        if (words.includes(ambigWord)) {
            for (const resolution of resolutions) {
                if (resolution.contextWords.some(cw => normTitle.includes(cw))) {
                    return { noun: ambigWord, category: resolution.category, subcategory: resolution.subcategory, confidence: 'high' }
                }
            }
        }
    }

    // Step 3: Check single product nouns per category
    for (const [category, data] of Object.entries(PRODUCT_NOUNS)) {
        for (const noun of data.nouns) {
            if (words.includes(noun) || normTitle.includes(` ${noun} `) || normTitle.endsWith(` ${noun}`) || normTitle.startsWith(`${noun} `)) {
                let subcategory = category
                for (const [sub, subNouns] of Object.entries(data.subcategories)) {
                    if ((subNouns as string[]).includes(noun)) { subcategory = sub; break }
                }
                return { noun, category, subcategory, confidence: 'high' }
            }
        }
    }

    // Step 4: Fallback — last meaningful non-descriptor word
    const stopWords = new Set(['for', 'with', 'and', 'the', 'in', 'on', 'a', 'to', 'of', 'by', 'at', 'new', 'used', 'black', 'white', 'red', 'blue', 'large', 'small'])
    const meaningful = words.filter(w => !stopWords.has(w) && w.length > 2 && !/^\d/.test(w))
    const fallback = meaningful[meaningful.length - 1] ?? words[0]

    return { noun: fallback, category: 'generic', subcategory: 'generic', confidence: 'low' }
}

// ── Helper: Get all product nouns as flat Set for fast lookup ─────────────────
export function getAllProductNouns(): Set<string> {
    const all = new Set<string>()
    for (const mwp of MULTI_WORD_PRODUCTS) all.add(mwp.phrase)
    for (const data of Object.values(PRODUCT_NOUNS)) {
        for (const noun of data.nouns) all.add(noun)
    }
    return all
}
