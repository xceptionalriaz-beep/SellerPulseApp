// ── fillerWords.ts ────────────────────────────────────────────────────────────
// Step 3 of the Title Engine Learning Path: Filler Words (Always Remove)
//
// Purpose:
//   Teaches the engine which words add ZERO value to an eBay title.
//   These words waste precious character space and dilute keyword relevance.
//   Buyers never search for these words — removing them improves ranking.
//
// Rules:
//   1. If a buyer would NEVER type it in a search → it's filler
//   2. If it's a vague marketing adjective → it's filler
//   3. If it's a seller self-promotion word → it's filler
//   4. If it's a shipping/dispatch word → it's filler
//   5. If it's a grammatical filler → it's filler
//
// NOT filler (do NOT add here):
//   - Condition words (new, used) → specs
//   - Size words (large, small) → specs
//   - Colour words (black, red) → specs
//   - Material words (leather, steel) → specs
//   - Brand names → product identity
//   - Product nouns (toy, charger) → product identity
// ─────────────────────────────────────────────────────────────────────────────

// ── Marketing adjectives — buyers never search these ─────────────────────────
export const MARKETING_FILLER = new Set([
    // Generic praise words
    'premium', 'quality', 'best', 'top', 'great', 'nice', 'good', 'super',
    'amazing', 'excellent', 'perfect', 'fantastic', 'brilliant', 'special',
    'ultimate', 'outstanding', 'exceptional', 'incredible', 'wonderful', 'superb',
    'beautiful', 'gorgeous', 'lovely', 'stunning', 'breathtaking', 'sensational',
    'magnificent', 'spectacular', 'extraordinary', 'phenomenal', 'remarkable',
    'fabulous', 'terrific', 'tremendous', 'marvellous', 'marvelous',
    'delightful', 'charming', 'exquisite', 'splendid', 'glorious',
    'immaculate', 'impeccable', 'flawless', 'pristine', 'superb', 'unrivalled',
    'unparalleled', 'peerless', 'unmatched', 'incomparable', 'unsurpassed',

    // Intensity words used as filler
    'very', 'really', 'truly', 'extremely', 'highly', 'absolutely', 'totally',
    'completely', 'utterly', 'deeply', 'perfectly', 'purely', 'simply', 'just',
    'so', 'such', 'quite', 'rather', 'fairly', 'pretty', 'considerably',
    'incredibly', 'remarkably', 'exceptionally', 'extraordinarily', 'tremendously',
    'supremely', 'vastly', 'hugely', 'enormously', 'massively', 'intensely',

    // Vague style words
    'vibrant', 'vivid', 'bold', 'stylish', 'sleek', 'elegant', 'cute', 'adorable',
    'fancy', 'cool', 'modern', 'classic', 'trendy', 'chic', 'fashionable',
    'sophisticated', 'refined', 'timeless', 'iconic', 'innovative', 'revolutionary',
    'cutting-edge', 'state-of-the-art', 'next-generation', 'next-gen', 'futuristic',
    'contemporary', 'fresh', 'updated', 'improved', 'enhanced', 'upgraded', 'advanced',
    'superior', 'finest', 'optimum', 'optimal', 'maximum', 'maximal', 'supreme',

    // Unusual/eBay-banned descriptors
    'screaming', 'shrieking', 'crazy', 'wild', 'wacky', 'funky', 'zany', 'quirky',
    'awesome', 'epic', 'mega', 'ultra-premium', 'super-premium', 'top-quality',
    'high-quality', 'top-grade', 'top-rated', 'highly-rated', 'well-rated',
    'world-class', 'industry-leading', 'market-leading', 'category-leading',
    'bestselling', 'best-selling', 'best selling', 'popular', 'trending',
    'viral', 'famous', 'well-known', 'well known', 'renowned', 'prestigious',

    // Vague value claims
    'affordable', 'cheap', 'budget', 'value', 'economical', 'cost-effective',
    'money-saving', 'bargain', 'steal', 'unbeatable', 'competitive',
    'worth', 'worthy', 'worthwhile', 'deserving', 'reasonable', 'sensible',
    'inexpensive', 'low-cost', 'low cost', 'low-price', 'low price',

    // Vague quality claims
    'strong', 'sturdy', 'tough', 'robust', 'solid', 'stable', 'firm', 'secure',
    'safe', 'safe-for', 'child-safe', 'pet-safe', 'food-safe',
    'durable', 'long-lasting', 'long lasting', 'lasting', 'enduring',
    'reliable', 'dependable', 'consistent', 'efficient', 'effective',

    // Common misspellings used as filler (Chinese dropshippers)
    'shinning', 'hight', 'beatiful', 'beutiful', 'excelent', 'excellant',
    'wonderfull', 'magnifcent', 'magnificant', 'briliant', 'fantasic',
    'increadible', 'incredable', 'amasing', 'awsome', 'awesom',
    'usefull', 'powerfull', 'colourfull', 'colorfull', 'helpfull',

    // Slang filler
    'sick', 'rad', 'gnarly', 'lit', 'fire', 'slap', 'banging', 'cracking',
    'smashing', 'blinding', 'wicked', 'mint', 'sound', 'boss', 'ace',
    'class', 'lush', 'buff', 'peng', 'peak', 'dead', 'bare', 'proper',
    'well', 'mega', 'leng', 'nang', 'saucy', 'epic', 'legendary', 'goated',
    'bussin', 'slaps', 'hits', 'goes hard', 'goes off',

    // Fashion seller filler
    'on-trend', 'on trend', 'must-have', 'must have', 'statement', 'statement-piece',
    'investment', 'investment-piece', 'wardrobe-essential', 'wardrobe essential',
    'flattering', 'figure-flattering', 'slimming', 'elongating', 'lifting',
    'effortless', 'effortlessly', 'polished', 'put-together', 'coordinated',

    // Tech seller filler
    'game-changing', 'game changing', 'groundbreaking', 'ground-breaking',
    'disruptive', 'next-level', 'next level', 'mind-blowing', 'mind blowing',
    'cutting edge', 'leading-edge', 'bleeding-edge', 'ahead-of-its-time',
    'smartly-designed', 'thoughtfully-designed', 'intelligently-designed',
    'precision-engineered', 'precision engineered', 'meticulously', 'painstakingly',

    // Health/wellness seller filler
    'life-changing', 'life changing', 'transform', 'transformation', 'transformative',
    'revitalise', 'revitalize', 'rejuvenate', 'restore', 'repair', 'recover',
    'nourish', 'nurture', 'pamper', 'indulge', 'treat-yourself', 'treat yourself',
    'wellness', 'wellbeing', 'well-being', 'holistic', 'therapeutic', 'healing',
    'soothing', 'calming', 'relaxing', 'invigorating', 'energising', 'energizing',

    // Gift seller filler
    'thoughtful', 'heartfelt', 'meaningful', 'sentimental', 'memorable', 'cherished',
    'treasured', 'keepsake', 'heirloom', 'timeless-gift', 'perfect-gift',
    'ideal-gift', 'ideal-present', 'lovely-gift', 'wonderful-gift',
    'sure-to-please', 'they-will-love', 'he-will-love', 'she-will-love',

    // Food seller filler
    'mouth-watering', 'mouthwatering', 'delicious', 'scrumptious', 'luscious',
    'heavenly', 'divine', 'irresistible', 'tempting', 'appetising', 'appetizing',
    'flavoursome', 'flavorsome', 'tasty', 'yummy', 'nom', 'finger-licking',
    'fresh', 'freshly', 'artisan', 'artisanal', 'homemade', 'home-made',
    'hand-crafted', 'handcrafted', 'small-batch', 'small batch',

    // Sports/fitness filler
    'performance', 'high-performance', 'pro-performance', 'competition-ready',
    'competition ready', 'race-ready', 'race ready', 'podium', 'championship',
    'winning', 'victorious', 'champion', 'athletic', 'sporty', 'active',
    'intense', 'gruelling', 'grueling', 'punishing', 'demanding', 'rigorous',

    // Vague descriptive padding
    'nice', 'decent', 'solid', 'fine', 'okay', 'alright', 'alright', 'passable',
    'acceptable', 'satisfactory', 'adequate', 'sufficient', 'reasonable',
    'above-average', 'above average', 'better-than-average', 'better than average',
    'second-to-none', 'second to none', 'bar-none', 'bar none',

    // Environmental/ethical filler
    'eco', 'eco-friendly', 'eco friendly', 'green', 'sustainable', 'ethical',
    'conscious', 'responsible', 'mindful', 'planet-friendly', 'planet friendly',
    'earth-friendly', 'earth friendly', 'environmentally', 'environmentally-friendly',
    'cruelty-free', 'cruelty free', 'vegan-friendly', 'vegan friendly',
    'fair-trade', 'fairtrade', 'ethically-made', 'ethically made', 'guilt-free',

    // Overused superlatives
    'number-one', 'number one', 'number 1', '#1', 'no.1', 'no 1',
    'leading', 'foremost', 'premier', 'principal', 'chief', 'prime',
    'flagship', 'signature', 'prestige', 'prestigious', 'luxury', 'luxurious',
    'high-end', 'high end', 'upmarket', 'up-market', 'aspirational',
    'exclusive', 'elusive', 'sought-after', 'sought after', 'coveted',

    // Padding phrases
    'as-seen', 'as seen', 'as-pictured', 'as pictured', 'as-described',
    'as described', 'what-you-see', 'what you see', 'wysiwyg',
    'check-out', 'check out', 'take-a-look', 'take a look', 'have-a-look',
    'click-here', 'click here', 'see-pictures', 'see pictures',
    'please-read', 'please read', 'read-description', 'read description',

    // ── Quantity filler ───────────────────────────────────────────────────────
    'plenty', 'loads', 'heaps', 'masses', 'abundance', 'abundant', 'ample',
    'plentiful', 'bountiful', 'countless', 'numerous',
    'a great many', 'a wide variety', 'a vast array',

    // ── Description padding ───────────────────────────────────────────────────
    'please note', 'kindly note', 'please be aware', 'note that',
    'please check', 'check size', 'check measurements', 'check compatibility',
    'see description', 'full details', 'more details', 'further details',
    'as shown', 'as pictured', 'as photographed', 'as illustrated',
    'pictures for reference', 'photos for reference', 'images for reference',
    'please read', 'read all', 'read before buying', 'message us first',

    // ── Nationality/region filler ─────────────────────────────────────────────
    'british', 'american', 'european', 'asian', 'chinese', 'japanese',
    'korean', 'italian', 'french', 'german', 'spanish', 'australian',
    'imported', 'internationally', 'globally', 'worldwide',
    'made in uk', 'made in usa', 'made in china', 'made in germany',
    'made in italy', 'made in france', 'made in japan',

    // ── Time/availability filler ──────────────────────────────────────────────
    'new arrival', 'just arrived', 'newly listed', 'recently added',
    'just listed', 'new in', 'back in stock', 'restock', 'restocked',
    'pre-order', 'preorder', 'pre order', 'coming soon', 'available now',
    'in stock now', 'order today', 'buy today', 'get today',
    'latest', 'all-new', 'all new', 'newly released', 'just released',
    'newly launched', 'just launched', 'fresh stock',

    // ── Emotional appeal filler ───────────────────────────────────────────────
    'love', 'adore', 'enjoy', 'cherish', 'treasure', 'appreciate',
    'exciting', 'joyful', 'happy', 'smile', 'smiles', 'delight', 'pleasure',
    'you will love', 'youll love', 'they will love', 'theyll love',
    'sure to love', 'sure to impress', 'wow your',

    // ── Instructional filler ──────────────────────────────────────────────────
    'easy to use', 'easy-to-use', 'simple to use', 'easy to install',
    'simple to install', 'easy to clean', 'easy to assemble',
    'no tools required', 'no tools needed', 'no assembly required',
    'plug and play', 'out of the box', 'straight out of the box',
    'hassle free', 'hassle-free', 'no fuss', 'fuss free', 'fuss-free',
    'worry free', 'worry-free', 'stress free', 'stress-free',

    // ── Comparison filler ─────────────────────────────────────────────────────
    'better than', 'superior to', 'unlike others', 'unlike the rest',
    'compared to', 'unlike cheap', 'unlike other', 'unlike similar',
    'alternative to', 'replacement for', 'substitute for',
    'beats the competition', 'outperforms', 'surpasses', 'exceeds expectations',

    // ── Emphasis intensifiers ─────────────────────────────────────────────────
    'literally', 'honestly', 'seriously', 'genuinely',
    'definitely', 'certainly', 'undoubtedly', 'without doubt',
    'super duper', 'extra special', 'very very', 'really really',
    'oh so', 'ever so', 'awfully', 'terribly', 'frightfully',

    // ── Occasion phrases ──────────────────────────────────────────────────────
    'great for', 'ideal for', 'suitable for', 'perfect for',
    'designed for', 'meant for', 'intended for', 'tailored for',
    'built for', 'made for', 'crafted for', 'created for',
    'recommended for', 'ideal choice for', 'great choice', 'perfect choice',

    // ── Vague scope/range filler ──────────────────────────────────────────────
    'wide range', 'huge range', 'large range', 'extensive range', 'full range',
    'complete range', 'full selection', 'wide selection', 'vast selection',
    'broad range', 'comprehensive range', 'variety of', 'range of',
    'selection of', 'assortment of', 'collection of', 'array of', 'host of',

    // ── Social proof filler ───────────────────────────────────────────────────
    'as used by', 'as seen on', 'as featured in', 'as recommended by',
    'celebrity', 'influencer', 'tiktok famous', 'instagram famous',
    'tiktok viral', 'trending now', 'gone viral', 'internet famous',
    'millions sold', 'thousands sold', 'award winning', 'award-winning',
    'internationally recognised', 'internationally recognized',

    // ── Promise filler ────────────────────────────────────────────────────────
    'we promise', 'we guarantee', 'you wont be disappointed',
    'satisfaction guaranteed', 'or your money back',
    '100% satisfaction', 'complete satisfaction', 'proven product',

    // ── Redundant pair filler ─────────────────────────────────────────────────
    'genuine original', 'brand new and sealed', 'new and unused',
    'unique and rare', 'rare and vintage', 'old and antique',
    'brand new in box', 'fresh and new', 'clean and tidy',
    'nice and clean', 'nice and neat', 'neat and tidy',

    // ── Clothing verbal filler ────────────────────────────────────────────────
    'wearing', 'wear', 'wearable', 'outfit', 'dress-up', 'dress up',
    'look good', 'look great', 'feel good', 'feel great',
    'confidence', 'confident', 'cosy', 'cozy',

    // ── Tech verbal filler ────────────────────────────────────────────────────
    'seamlessly', 'seamless', 'intuitive', 'intuitively',
    'user-friendly', 'user friendly', 'plug-in', 'pairing', 'pairs easily',

    // ── Home verbal filler ────────────────────────────────────────────────────
    'transform your', 'update your', 'upgrade your', 'refresh your',
    'revamp your', 'makeover', 'make-over', 'spruce up', 'tidy up',
    'brighten up', 'liven up', 'jazz up', 'smarten up',

    // ── Beauty verbal filler ──────────────────────────────────────────────────
    'glow', 'glowing', 'radiant', 'radiance', 'luminous', 'luminosity',
    'youthful', 'ageless', 'skin goals', 'hair goals', 'beauty goals',
    'flawless skin', 'clear skin', 'healthy skin', 'healthy hair',

    // ── Automotive verbal filler ──────────────────────────────────────────────
    'show stopping', 'show-stopping', 'head turning', 'head-turning',
    'car pride', 'pride of ownership', 'pride and joy',
    'street presence', 'road presence', 'stance',

    // ── Sports/outdoor verbal filler ──────────────────────────────────────────
    'adventure', 'adventures', 'adventurous', 'explore', 'explorer',
    'conquer', 'achieve', 'achievement', 'personal best',
    'push yourself', 'challenge yourself', 'go further', 'go harder',

    // ── Craft/making filler ───────────────────────────────────────────────────
    'bespoke', 'handpicked', 'curated', 'specially', 'lovingly',
    'carefully', 'skillfully', 'expertly', 'beautifully', 'elegantly',
    'tastefully', 'professionally', 'painstakingly', 'meticulously',
    'handmade', 'hand made', 'hand-assembled', 'lovingly made',
    'thoughtfully made', 'carefully sourced', 'responsibly sourced',
    'locally sourced', 'ethically sourced', 'sustainably sourced',
    'expertly crafted', 'beautifully crafted', 'lovingly crafted',
    'professionally made', 'custom made', 'custom-made',
    'tailor made', 'tailor-made', 'made to order', 'made-to-order',
    'personalised', 'personalized', 'customised', 'customized',
    'carefully selected', 'hand selected', 'hand-selected',
    'specially selected', 'specially chosen', 'hand chosen',
    'carefully chosen', 'lovingly chosen', 'thoughtfully chosen',
    'curated by', 'selected by', 'chosen by',

    // ── Quality grade filler ──────────────────────────────────────────────────
    'premium-grade', 'commercial-grade', 'military-grade', 'pro-grade',
    'top-of-the-range', 'top of the range', 'cream of the crop',
    'heirloom quality', 'hotel quality', 'restaurant quality',
    'museum quality', 'gallery quality', 'showroom quality',
    'spa quality', 'salon quality', 'professional quality',
    'clinical strength', 'medical strength', 'pharmaceutical grade',
    'food grade', 'industrial grade', 'commercial grade',
    'consumer grade', 'entry level', 'mid range', 'high range',

    // ── Gift occasion filler ──────────────────────────────────────────────────
    'for him', 'for her', 'for them', 'for dad', 'for mum', 'for mom',
    'for nan', 'for gran', 'for grandad', 'for grandma', 'for grandpa',
    'for boyfriend', 'for girlfriend', 'for husband', 'for wife',
    'for brother', 'for sister', 'for son', 'for daughter', 'for friend',
    'for teacher', 'for boss', 'for colleague', 'for neighbour',
    'gifts for him', 'gifts for her', 'gifts for men', 'gifts for women',
    'gifts for boys', 'gifts for girls', 'gifts for kids', 'gifts for teens',
    'ideal present', 'perfect present', 'lovely present', 'great present',
    'birthday present', 'anniversary present', 'christmas present',
    'stocking filler', 'stocking-filler', 'secret santa', 'white elephant',
    'special occasion', 'any occasion', 'all occasions',
    'for any occasion', 'for every occasion', 'for all occasions',

    // ── Self-treat filler ─────────────────────────────────────────────────────
    'treating yourself', 'spoil yourself', 'indulge yourself',
    'pamper yourself', 'reward yourself', 'you deserve', 'you deserve it',
    'go on treat', 'treat yourself today', 'why not treat',
    'you owe it to yourself', 'because you are worth it',

    // ── Collector/limited filler ──────────────────────────────────────────────
    'collector', 'collectors item', 'collector item', 'collectors edition',
    'limited run', 'limited-run', 'limited availability',
    'extremely limited', 'very limited', 'exclusive release',
    'special release', 'limited release', 'one-off', 'one off',
    'proto', 'prototype', 'trial', 'demo', 'display model',
    'ex display', 'ex-display', 'ex demo', 'ex-demo',
    'showroom condition', 'showroom model', 'shop soiled',

    // ── Speed filler ──────────────────────────────────────────────────────────
    'super fast', 'ultra fast', 'lightning fast', 'blazing fast',
    'mega fast', 'insanely fast', 'crazy fast', 'ridiculously fast',
    'super quick', 'ultra quick', 'lightning quick', 'blazing quick',
    'warp speed', 'supersonic', 'hyper speed', 'turbo charged',

    // ── Ease of use filler ────────────────────────────────────────────────────
    'super easy', 'ultra easy', 'insanely easy', 'incredibly easy',
    'super simple', 'ultra simple', 'dead simple', 'stupidly simple',
    'so easy', 'really easy', 'very easy', 'extremely easy',
    'no experience needed', 'no experience required',
    'beginner friendly', 'beginner-friendly', 'newbie friendly',
    'anyone can use', 'suitable for all', 'suitable for everyone',
    'for all ages', 'for the whole family', 'whole family', 'all the family',
    'all skill levels', 'all experience levels', 'any skill level',

    // ── Stock/availability filler ─────────────────────────────────────────────
    'new arrival', 'just arrived', 'newly listed', 'recently added',
    'just listed', 'new in', 'back in stock', 'restock', 'restocked',
    'pre-order', 'preorder', 'pre order', 'coming soon', 'available now',
    'in stock now', 'order today', 'buy today', 'get today',
    'latest', 'all-new', 'all new', 'newly released', 'just released',
    'newly launched', 'just launched', 'fresh stock',
    'special buy', 'clearance line', 'clearance item',
    'end of line', 'end-of-line', 'end of range', 'discontinued',
    'last one', 'last few', 'last stock', 'final stock',
    'brand new other', 'open box item', 'nearly new',

    // ── Approval/testing filler ───────────────────────────────────────────────
    'approved by', 'tested by', 'reviewed by', 'inspected by',
    'certified by', 'endorsed by', 'recommended by', 'verified by',
    'quality checked', 'quality-checked', 'quality assured', 'qa tested',
    'factory tested', 'bench tested', 'fully tested', 'professionally tested',

    // ── Condition description filler ──────────────────────────────────────────
    'as new', 'like new condition', 'great condition', 'good used condition',
    'fair condition', 'poor condition', 'average condition',
    'immaculate condition', 'excellent used condition', 'well maintained',
    'carefully maintained', 'lovingly maintained', 'gently used',
    'lightly used', 'barely used', 'hardly used', 'rarely used',

    // ── International/origin filler ───────────────────────────────────────────
    'british', 'american', 'european', 'asian', 'chinese', 'japanese',
    'korean', 'italian', 'french', 'german', 'spanish', 'australian',
    'imported', 'internationally', 'globally', 'worldwide',
    'made in uk', 'made in usa', 'made in china', 'made in germany',
    'made in italy', 'made in france', 'made in japan',
    'uk brand', 'us brand', 'european brand', 'british brand',

    // ── Superlative intensifiers ──────────────────────────────────────────────
    'immaculate', 'impeccable', 'flawless', 'pristine',
    'unrivalled', 'unparalleled', 'peerless', 'unmatched', 'incomparable',
    'unsurpassed', 'unbeatable', 'unequalled', 'unequaled',
    'second to none', 'bar none', 'without equal', 'without peer',
    'head and shoulders', 'miles ahead', 'streets ahead', 'leagues ahead',
    'worlds apart', 'night and day', 'like no other', 'unlike any other',

    // ── Filler adverbs ────────────────────────────────────────────────────────
    'wonderfully', 'spectacularly', 'magnificently', 'extraordinarily',
    'phenomenally', 'splendidly', 'gloriously', 'brilliantly', 'fantastically',
    'outstandingly', 'exceptionally', 'incredibly', 'incredibly well',
    'tremendously', 'supremely', 'vastly', 'hugely', 'enormously', 'massively',
    'lovingly', 'carefully', 'skillfully', 'expertly', 'beautifully',
    'elegantly', 'tastefully', 'professionally', 'thoughtfully',
    'purposefully', 'deliberately', 'intentionally', 'specifically',

    // ── Platform/channel filler ───────────────────────────────────────────────
    'as seen on tv', 'as seen on television', 'tv product', 'tv advertised',
    'as seen on dragon den', 'dragons den', 'shark tank',
    'as seen on qvc', 'qvc product', 'home shopping',
    'instagram', 'facebook', 'tiktok', 'youtube', 'pinterest',
    'social media sensation', 'internet sensation', 'online sensation',
    'viral sensation', 'online exclusive', 'web exclusive', 'website exclusive',

    // ── Vague technical filler ────────────────────────────────────────────────
    'innovative technology', 'innovative design', 'innovative solution',
    'advanced technology', 'advanced design', 'advanced engineering',
    'smart technology', 'smart design', 'smart engineering',
    'intelligent design', 'clever design', 'clever engineering',
    'patented technology', 'patented design', 'proprietary technology',
    'cutting-edge technology', 'state of the art technology',
    'next generation technology', 'future technology',
    'breakthrough technology', 'revolutionary technology',

    // ── Lifestyle filler ─────────────────────────────────────────────────────
    'lifestyle', 'lifestyle product', 'lifestyle brand', 'lifestyle choice',
    'luxury lifestyle', 'premium lifestyle', 'aspirational lifestyle',
    'on the go', 'on-the-go', 'active lifestyle', 'busy lifestyle',
    'modern lifestyle', 'contemporary lifestyle', 'urban lifestyle',
    'rural lifestyle', 'outdoor lifestyle', 'indoor lifestyle',
])

// ── Seller promotion words — about the seller, not the product ───────────────
export const SELLER_FILLER = new Set([
    // Self-promotion
    'trusted', 'reliable', 'reputable', 'established', 'experienced', 'professional',
    'accredited', 'verified', 'approved', 'recommended', 'rated', 'reviewed',
    'top-seller', 'top seller', 'power seller', 'powerseller', 'star seller',
    'feedback', 'positive feedback', '100%', '99%', '98%', '97%', '96%', '95%',
    'satisfaction guaranteed', 'money back', 'money-back', 'guarantee', 'guaranteed',
    'warranty included', 'covered', 'protected',

    // Urgency/scarcity tactics
    'hurry', 'rush', 'urgent', 'limited', 'exclusive', 'scarce', 'rare-find',
    'last-chance', 'last chance', 'ending soon', 'ending today', 'time-limited',
    'only', 'remaining', 'left', 'available', 'stock',
    'act now', 'buy now', 'order now', 'shop now', 'get now',
    'today only', 'this week only', 'while stocks last', 'while stock lasts',
    'limited time', 'limited offer', 'special offer', 'flash sale',

    // Deal language
    'wow', 'look', 'hot', 'deal', 'sale', 'offer', 'bargain', 'clearance',
    'markdown', 'reduced', 'discounted', 'saving', 'savings', 'off',
    'free', 'bonus', 'gift', 'included', 'comes with', 'includes',
    'rrp', 'msrp', 'retail price', 'was', 'now', 'price drop', 'price cut',

    // Business promotion
    'direct', 'wholesale', 'trade', 'retail', 'commercial', 'industrial',
    'manufacturer', 'factory', 'supplier', 'importer', 'distributor',
    'brand new in box', 'brand-new-in-box', 'bnib', 'bnwt', 'bnwob',
    'brand new with tags', 'never worn', 'never used', 'unused',

    // Seller identity
    'seller', 'vendor', 'shop', 'store', 'company', 'business', 'trader',
    'uk seller', 'us seller', 'eu seller', 'au seller', 'cn seller',
    'small business', 'family business', 'independent seller',

    // Return policy filler
    'returns-accepted', 'returns accepted', 'hassle-free-returns',
    'hassle free returns', '30-day-returns', '30 day returns',
    'no-quibble', 'no quibble', 'easy-returns', 'easy returns',
    'full-refund', 'full refund', 'money-back-guarantee',

    // Condition padding
    'lightly-used', 'gently-used', 'gently used', 'well-loved', 'well loved',
    'played-with', 'played with', 'display-only', 'display only',
    'collection-only', 'collection only', 'local-pickup', 'local pickup',

    // Social proof filler
    'popular', 'trending', 'viral', 'bestseller', 'best-seller',
    'crowd-favourite', 'crowd favourite', 'fan-favourite', 'fan favourite',
    'customer-favourite', 'highly-recommended', 'highly recommended',
    'rave-reviews', '5-star', '5 star', 'five-star', 'five star',

    // Packing filler
    'well-packaged', 'well packaged', 'safely-packaged', 'safely packaged',
    'securely-packaged', 'securely packaged', 'gift-wrapped', 'gift wrapped',
    'professionally-packed', 'professionally packed', 'bubble-wrapped',
])

// ── Shipping/dispatch words — never in eBay titles ───────────────────────────
export const SHIPPING_FILLER = new Set([
    // Dispatch
    'dispatch', 'dispatched', 'dispatching', 'fast-dispatch', 'quick-dispatch',
    'same-day', 'same day', 'next-day', 'next day', '2-day', '3-day',
    'rapid', 'speedy', 'swift', 'prompt', 'immediate',
    'within 24 hours', 'within 48 hours', 'within 1 day', 'within 2 days',

    // Delivery
    'delivery', 'delivered', 'delivering', 'free-delivery', 'free delivery',
    'tracked', 'tracking', 'trackable', 'signed', 'signed-for',
    'recorded', 'insured', 'insured-shipping', 'guaranteed-delivery',
    'special delivery', 'standard delivery', 'economy delivery',
    'overnight', 'next working day', 'working day',

    // Postage
    'postage', 'posted', 'posting', 'post', 'mail', 'mailed', 'shipping',
    'shipped', 'ships', 'express', 'priority', 'first-class', 'second-class',
    'royal-mail', 'royal mail', 'hermes', 'evri', 'dpd', 'ups', 'fedex', 'dhl',
    'yodel', 'parcelforce', 'collect plus', 'collectplus', 'amazon logistics',
    'courier', 'parcel', 'package', 'packaged',

    // Stock location
    'uk-stock', 'uk stock', 'us-stock', 'us stock', 'local', 'local-stock',
    'in-stock', 'in stock', 'ready', 'ready-to-ship', 'ready to ship',
    'warehouse', 'depot', 'from-uk', 'from uk', 'from-us', 'based-in',
    'ships from uk', 'ships from us', 'ships from china', 'dispatches from',
    'fast shipping', 'free shipping', 'free postage', 'p&p included',
])

// ── Grammatical filler — zero search value ───────────────────────────────────
export const GRAMMAR_FILLER = new Set([
    // Articles
    'the', 'a', 'an',

    // Prepositions
    'of', 'for', 'in', 'on', 'at', 'by', 'to', 'from', 'with', 'without',
    'into', 'onto', 'upon', 'about', 'above', 'below', 'between', 'among',
    'through', 'throughout', 'during', 'within', 'beyond', 'beside', 'besides',
    'against', 'along', 'across', 'around', 'after', 'before', 'behind',
    'beneath', 'underneath', 'under', 'over', 'past', 'per', 'plus', 'via',
    'near', 'next', 'far', 'close', 'opposite', 'like', 'unlike', 'except',
    'despite', 'regarding', 'concerning', 'following', 'including', 'excluding',

    // Conjunctions
    'and', 'or', 'but', 'nor', 'yet', 'so', 'both', 'either', 'neither',
    'although', 'though', 'while', 'whereas', 'because', 'since', 'unless',
    'until', 'whether', 'that', 'which', 'who', 'whom', 'whose',
    'however', 'therefore', 'furthermore', 'moreover', 'nevertheless',
    'consequently', 'accordingly', 'meanwhile', 'otherwise', 'instead',

    // Pronouns
    'it', 'its', 'this', 'these', 'those', 'that', 'them', 'they', 'their',
    'our', 'your', 'my', 'his', 'her', 'we', 'us', 'you', 'i', 'me',
    'himself', 'herself', 'itself', 'themselves', 'yourself', 'ourselves',

    // Auxiliary verbs
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'can', 'could', 'shall', 'should',
    'may', 'might', 'must', 'ought', 'need', 'dare', 'used',
    'going', 'gonna', 'wanna', 'gotta',

    // Adverbs and misc
    'not', 'no', 'yes', 'as', 'if', 'also', 'too', 'only', 'even', 'still',
    'already', 'yet', 'now', 'then', 'here', 'there', 'where', 'when', 'how',
    'what', 'why', 'all', 'any', 'each', 'every', 'some', 'many', 'much',
    'more', 'most', 'less', 'least', 'few', 'little', 'other', 'another',
    'same', 'such', 'own', 'due', 're', 'etc', 'ie', 'eg',
    'please', 'kindly', 'note', 'notice', 'attention',
    'approximately', 'roughly', 'around', 'about', 'nearly', 'almost',
])

// ── eBay-specific banned words — violate listing policy ──────────────────────
export const EBAY_POLICY_FILLER = new Set([
    // Competitor platforms
    'ebay', 'ebay.com', 'ebay.co.uk', 'amazon', 'amazon.com', 'etsy', 'etsy.com',
    'alibaba', 'aliexpress', 'wish', 'shein', 'temu', 'wayfair',
    'argos', 'currys', 'john lewis', 'next', 'very', 'asos',

    // Payment methods (banned in titles)
    'paypal', 'credit card', 'bank transfer', 'stripe', 'klarna', 'clearpay',
    'afterpay', 'laybuy', 'cash', 'cheque', 'check',

    // Listing type (banned)
    'buy it now', 'bin', 'make offer', 'best offer', 'or best offer',
    'new listing', 'featured listing', 'sponsored', 'promoted',
    'auction', 'bid', 'reserve', 'no reserve', 'watchers',

    // Contact info (banned)
    'call us', 'contact us', 'email us', 'message us', 'dm us',
    'whatsapp', 'facebook', 'instagram', 'twitter', 'tiktok',
    'website', 'www', 'http', 'https',

    // Excessive punctuation markers
    'look!', 'wow!', 'sale!', 'hot!', 'buy!', '!!!', '***', '---', '===',
    '>>>', '<<<', '♥', '★', '☆', '✓', '✔', '♦', '●', '►',

    // ALL CAPS filler words
    'LOOK', 'WOW', 'HOT', 'BUY', 'NEW', 'SALE', 'DEAL', 'BEST', 'TOP',
    'FREE', 'FAST', 'RARE', 'NICE', 'GREAT', 'GOOD', 'COOL',
])

// ── Redundancy filler — states the obvious ───────────────────────────────────
export const REDUNDANCY_FILLER = new Set([
    // Things buyers already know from context
    'item', 'product', 'goods', 'merchandise', 'listing', 'lot', 'things', 'stuff',
    'piece', 'pieces', 'unit', 'units', 'each', 'one', 'single', 'individual',
    'object', 'article', 'entity', 'example', 'instance', 'sample',
    'accessory', 'accessories', 'component', 'components', 'part', 'parts',

    // Category redundancy (already clear from product noun)
    'electric', 'electrical', 'electronic', 'digital', 'automatic', 'automated',
    'manual', 'portable', 'handheld', 'hand-held', 'desktop', 'table-top',
    'indoor', 'outdoor', 'inside', 'outside', 'internal', 'external',
    'battery-powered', 'battery powered', 'mains-powered', 'mains powered',
    'cordless', 'corded', 'wired', 'wireless', 'bluetooth-enabled',

    // Vague material words that add no info
    'material', 'materials', 'construction', 'built', 'made', 'manufactured',
    'crafted', 'designed', 'created', 'produced', 'fabricated', 'finished',
    'coated', 'treated', 'processed', 'engineered', 'formed', 'shaped',

    // Generic compatibility filler
    'compatible', 'works', 'fits', 'suitable', 'appropriate', 'ideal',
    'perfect-for', 'great-for', 'good-for', 'designed-for', 'made-for',
    'works with', 'fits with', 'suitable for', 'appropriate for',
    'universal', 'universally', 'generic', 'standard', 'non-oem',

    // Vague usage words
    'use', 'used', 'using', 'useful', 'usable', 'usage', 'everyday', 'daily',
    'regular', 'normal', 'standard', 'typical', 'ordinary', 'common', 'basic',
    'home', 'household', 'domestic', 'personal', 'private', 'general',
    'multi-purpose', 'multipurpose', 'multi-use', 'multiuse', 'all-purpose',
    'all purpose', 'versatile', 'flexible', 'adaptable', 'adjustable',

    // Misc redundant
    'original', 'genuine', 'authentic', 'real', 'actual', 'true', 'official',
    'etc', 'miscellaneous', 'various', 'assorted', 'mixed', 'general',
    'something', 'anything', 'everything', 'nothing', 'somewhere',
    'new-in-box', 'nib', 'bnib', 'sealed', 'factory-sealed', 'shrink-wrapped',

    // Filler phrases disguised as descriptions
    'must have', 'must-have', 'essential', 'necessity', 'necessary',
    'important', 'key', 'core', 'main', 'primary', 'secondary', 'additional',
    'extra', 'added', 'bonus', 'complementary', 'supplementary',

    // ── Vague action verb filler ──────────────────────────────────────────────
    'discover', 'explore', 'experience', 'enjoy', 'embrace', 'celebrate',
    'unleash', 'unlock', 'reveal', 'uncover', 'harness', 'maximise', 'maximize',
    'elevate', 'amplify', 'boost', 'supercharge', 'turbocharge', 'skyrocket',
    'ignite', 'spark', 'inspire', 'motivate', 'empower', 'uplift',
    'reinvent', 'redefine', 'revolutionise', 'revolutionize',

    // ── Rhetorical question filler ────────────────────────────────────────────
    'why settle', 'why wait', 'why pay more', 'why look further',
    'why choose anything else', 'why go anywhere else',
    'looking for the best', 'searching for quality',
    'need the best', 'want the best', 'want quality', 'want value',

    // ── Vague promise words ───────────────────────────────────────────────────
    'promise', 'assure', 'assurance', 'pledge', 'commitment',
    'backed by', 'supported by', 'covered by', 'stand behind', 'stand by',
    'believe in', 'confident in', 'quality assured', 'satisfaction assured',

    // ── Design style descriptors that add no info ─────────────────────────────
    'sleek design', 'sleek finish', 'clean design', 'clean finish',
    'minimal design', 'minimal look', 'minimalist look', 'minimalist design',
    'bold design', 'bold look', 'striking design', 'striking look',
    'classic design', 'classic look', 'timeless design', 'timeless look',
    'modern design', 'modern look', 'contemporary design', 'contemporary look',
    'retro design', 'retro look', 'vintage design', 'vintage look',
    'rustic design', 'rustic look', 'industrial design', 'industrial look',
    'elegant design', 'elegant look', 'chic design', 'chic look',

    // ── Vague performance claims ──────────────────────────────────────────────
    'works great', 'works perfectly', 'works brilliantly', 'works amazingly',
    'functions perfectly', 'functions flawlessly', 'functions brilliantly',
    'performs great', 'performs perfectly', 'performs brilliantly',
    'delivers results', 'delivers performance', 'delivers value',
    'exceeds expectations', 'meets expectations', 'surpasses expectations',

    // ── Listing description bleed-through filler ──────────────────────────────
    'scroll down', 'scroll up', 'see below', 'see above', 'listed below',
    'detailed below', 'outlined below', 'described below', 'explained below',
    'full specifications below', 'specs below', 'details below',
    'more info below', 'further info below', 'information below',

    // ── Vague material quality filler ─────────────────────────────────────────
    'premium materials', 'quality materials', 'superior materials',
    'finest materials', 'best materials', 'top materials',
    'premium construction', 'quality construction', 'superior construction',
    'solid construction', 'sturdy construction', 'robust construction',
    'premium finish', 'quality finish', 'superior finish', 'flawless finish',
    'impeccable finish', 'perfect finish', 'beautiful finish',

    // ── Introduction filler ───────────────────────────────────────────────────
    'introducing', 'presenting', 'announcing', 'featuring', 'showcasing',
    'offering', 'providing', 'delivering', 'bringing', 'presenting you',
    'now available', 'newly available', 'now in stock', 'newly in stock',

    // ── Celebrity/media association filler ────────────────────────────────────
    'as worn by', 'celebrity favourite', 'celebrity choice', 'celebrity pick',
    'celebrity approved', 'influencer approved', 'influencer favourite',
    'influencer choice', 'influencer pick',
    'as seen in vogue', 'as seen in elle', 'press approved', 'press favourite',
    'editor approved', 'editor pick', 'editor favourite', 'editorial pick',

    // ── Ultra compound filler ─────────────────────────────────────────────────
    'ultra-soft', 'ultra soft', 'ultra-smooth', 'ultra smooth',
    'ultra-light', 'ultra light', 'ultra-thin', 'ultra thin',
    'ultra-slim', 'ultra slim', 'ultra-fine', 'ultra fine',
    'ultra-clear', 'ultra clear', 'ultra-bright', 'ultra bright',
    'ultra-sharp', 'ultra sharp', 'ultra-strong', 'ultra strong',
    'ultra-tough', 'ultra tough', 'ultra-durable', 'ultra durable',
    'ultra-flexible', 'ultra flexible', 'ultra-portable', 'ultra portable',
    'ultra-compact', 'ultra compact', 'ultra-clean', 'ultra clean',

    // ── Listing completion filler ─────────────────────────────────────────────
    'thats all', 'thats it', 'nothing else', 'nothing extra', 'no extras',
    'what you see is what you get', 'wsiwyg', 'what you get',
    'everything included', 'all included', 'fully included',
    'nothing excluded', 'everything listed', 'as listed',

    // ── Ergonomic/comfort filler ──────────────────────────────────────────────
    'ergonomic design', 'ergonomically designed', 'ergonomically shaped',
    'comfortable grip', 'comfortable hold', 'comfortable fit',
    'comfortable wear', 'comfortable to wear', 'comfortable to use',
    'comfortable to hold', 'comfortable to carry',
    'fits perfectly', 'fits like a glove', 'second skin', 'like a second skin',
    'feels natural', 'feels comfortable', 'feels great', 'feels amazing',

    // ── Innovation/patent filler ──────────────────────────────────────────────
    'patented', 'patent pending', 'patent-pending', 'proprietary',
    'exclusive formula', 'exclusive design', 'exclusive technology',
    'unique formula', 'unique design', 'unique technology', 'unique system',
    'innovative formula', 'innovative system', 'innovative approach',
    'revolutionary formula', 'revolutionary system', 'revolutionary approach',
    'breakthrough formula', 'breakthrough system', 'breakthrough approach',

    // ── Trend filler ─────────────────────────────────────────────────────────
    'on point', 'on-point', 'bang on trend', 'bang on', 'spot on', 'spot-on',
    'totally on trend', 'completely on trend', 'absolutely on trend',
    'so in right now', 'very trendy', 'so trendy', 'super trendy',
    'mega trendy', 'ultra trendy', 'extremely trendy',

    // ── Sales number filler ───────────────────────────────────────────────────
    'over 1000 sold', 'over 100 sold', 'over 500 sold', 'over 10000 sold',
    '1000+ sold', '100+ sold', '500+ sold', '5000+ sold', '10000+ sold',
    'sold worldwide', 'sold globally', 'sold internationally',
    'ships to 100 countries', 'available worldwide', 'available globally',

    // ── Newness emphasis filler ───────────────────────────────────────────────
    'brand spanking new', 'spanking new', 'factory fresh',
    'fresh out the box', 'fresh out of the box', 'just out of the box',
    'zero miles', 'zero usage', 'never opened', 'never touched',
    'never used once', 'still in packaging', 'still in original packaging',
    'original packaging', 'still sealed', 'factory sealed',
    'shrink wrapped', 'shrink-wrapped',

    // ── Listing confidence filler ─────────────────────────────────────────────
    'this listing', 'this item listing', 'this product listing',
    'this auction', 'this sale', 'this deal', 'this offer',
    'buy with confidence', 'shop with confidence', 'buy safely',
    'safe purchase', 'secure purchase', 'safe to buy', 'safe to order',

    // ── Environmental filler ──────────────────────────────────────────────────
    'zero waste', 'zero-waste', 'carbon neutral', 'carbon-neutral',
    'carbon offset', 'carbon-offset', 'carbon footprint',
    'net zero', 'net-zero', 'tree planted', 'trees planted', 'plant a tree',
    'save the planet', 'save our planet', 'help the planet',
    'good for the planet', 'kind to the planet', 'planet kind',
    'kind to earth', 'good for earth', 'earth conscious',

    // ── Self-expression filler ────────────────────────────────────────────────
    'make it yours', 'make it your own', 'add your touch',
    'add a personal touch', 'put your stamp on',
    'express yourself', 'express your style', 'show your style',
    'show your personality', 'be unique', 'be different', 'be you', 'just be you',

    // ── Health journey filler ─────────────────────────────────────────────────
    'take control', 'take charge', 'take action', 'take the first step',
    'start your journey', 'begin your journey', 'start today', 'begin today',
    'start now', 'begin now', 'the first step', 'your journey starts here',
    'the journey begins', 'new you', 'new beginning', 'fresh start',
    'new chapter', 'new leaf', 'turn over a new leaf', 'new dawn', 'new day',

    // ── Pet owner filler phrases ──────────────────────────────────────────────
    'spoil your pet', 'spoil your dog', 'spoil your cat',
    'pamper your pet', 'pamper your dog', 'pamper your cat',
    'treat your pet', 'treat your dog', 'treat your cat',
    'your pet deserves', 'your dog deserves', 'your cat deserves',
    'your pet will love', 'your dog will love', 'your cat will love',
    'keep your pet happy', 'keep your dog happy', 'keep your cat happy',

    // ── Pseudo-scientific filler ──────────────────────────────────────────────
    'scientifically proven', 'scientifically formulated', 'scientifically tested',
    'scientifically designed', 'backed by science', 'science backed',
    'clinically proven', 'clinically formulated', 'clinically tested',
    'dermatologically tested', 'dermatologically proven', 'dermatologically approved',
    'laboratory tested', 'lab tested', 'lab certified', 'lab approved',
    'independently tested', 'independently verified', 'independently certified',

    // ── Legal/formal grammar filler ───────────────────────────────────────────
    'thus', 'hence', 'thence', 'whence', 'insofar', 'inasmuch',
    'notwithstanding', 'heretofore', 'hereinafter', 'thereupon', 'thereto',
    'thereunder', 'thereover', 'thereon', 'thereof', 'therein', 'thereby',

    // ── Number words as filler ────────────────────────────────────────────────
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'twenty', 'thirty',
    'fifty', 'hundred', 'thousand', 'million', 'billion',
    'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth',
    'once', 'twice', 'thrice',

    // ── Seasonal occasion filler ──────────────────────────────────────────────
    'valentines day', 'valentines', 'valentine', 'mothers day', 'fathers day',
    'diwali', 'eid', 'hanukkah', 'kwanzaa', 'diwali gift', 'eid gift', 'ramadan',
    'chinese new year', 'new year', 'new years', 'new years eve', 'new years day',
    'bonfire night', 'guy fawkes', 'pancake day', 'shrove tuesday',
    'st patricks day', 'st davids day',

    // ── Lifestyle aesthetic filler ────────────────────────────────────────────
    'hygge', 'lagom', 'wabi sabi', 'wabi-sabi',
    'cottagecore', 'cottage core', 'dark academia', 'dark-academia',
    'goblincore', 'goblin core', 'fairycore', 'fairy core',
    'maximalist', 'maximalism', 'boho', 'bohemian', 'bohemian style',
    'boho style', 'boho chic', 'shabby chic', 'shabby-chic',
    'french country', 'french provincial', 'hampton style', 'hamptons',
    'scandi style', 'scandinavian style', 'nordic style', 'nordic',
    'japandi', 'japanese style',

    // ── DIY/upcycle filler ────────────────────────────────────────────────────
    'diy', 'do it yourself', 'do-it-yourself', 'upcycle', 'upcycling',
    'repurpose', 'repurposing', 'upcycled', 'repurposed',
    'up-cycle', 'up-cycling', 'make do and mend', 'make do',
    'diy project', 'craft project', 'art project',

    // ── Vague sensory filler ──────────────────────────────────────────────────
    'soft touch', 'soft-touch', 'velvety', 'velvety smooth', 'silky',
    'silky soft', 'silky smooth', 'smooth touch', 'smooth-touch',
    'buttery', 'creamy', 'fluffy', 'plush feel', 'plush-feel',
    'airy', 'featherlight', 'feather light', 'featherweight',
    'crisp', 'springy', 'bouncy', 'squishy', 'squidgy', 'spongy',
    'foamy', 'pillowy', 'pillow soft',

    // ── Over-description of colour ────────────────────────────────────────────
    'rich colour', 'rich color', 'deep colour', 'deep color',
    'vibrant colour', 'vibrant color', 'bold colour', 'bold color',
    'stunning colour', 'stunning color', 'beautiful colour', 'beautiful color',
    'gorgeous colour', 'gorgeous color', 'lovely colour', 'lovely color',
    'true colour', 'true color', 'colour accurate', 'color accurate',
    'fade resistant', 'fade-resistant', 'colour fast', 'colorfast', 'colourfast',

    // ── Vague scent filler ────────────────────────────────────────────────────
    'smells amazing', 'smells great', 'smells wonderful', 'smells gorgeous',
    'beautiful scent', 'lovely scent', 'wonderful scent', 'gorgeous scent',
    'amazing scent', 'great scent', 'fantastic scent', 'incredible scent',
    'subtle scent', 'delicate scent', 'long lasting scent', 'long-lasting scent',

    // ── Sound filler ──────────────────────────────────────────────────────────
    'sounds amazing', 'sounds great', 'sounds wonderful', 'sounds incredible',
    'amazing sound', 'great sound', 'fantastic sound', 'incredible sound',
    'crisp sound', 'clear sound', 'rich sound', 'full sound', 'warm sound',
    'immersive sound', 'powerful sound', 'quiet operation',
    'silent operation', 'whisper quiet', 'near silent', 'virtually silent',

    // ── Unboxing experience filler ────────────────────────────────────────────
    'unboxing experience', 'great unboxing', 'amazing unboxing',
    'luxury unboxing', 'premium unboxing', 'beautiful presentation',
    'impressive presentation', 'comes beautifully packaged',
    'arrives beautifully', 'beautifully presented',

    // ── Customer review language filler ───────────────────────────────────────
    'customers love', 'buyers love', 'people love', 'everyone loves',
    'customers rave', 'buyers rave', 'customers say', 'buyers say',
    'five star feedback', '5 star feedback',

    // ── Negative space filler ─────────────────────────────────────────────────
    'no smell', 'no odour', 'no odor', 'odour free', 'odor free', 'odour-free',
    'no residue', 'residue free', 'residue-free', 'no mess', 'mess free', 'mess-free',
    'no drips', 'drip free', 'drip-free', 'no bother',
    'no effort', 'effortless', 'zero effort', 'minimal effort', 'little effort',

    // ── Time-saving claims filler ─────────────────────────────────────────────
    'saves time', 'time saving', 'time-saving', 'saves hours', 'saves days',
    'quick results', 'fast results', 'instant results', 'immediate results',
    'overnight results', 'results in days', 'results in weeks',

    // ── Comparison shopping filler ────────────────────────────────────────────
    'compare our prices', 'compare prices', 'price match', 'price matched',
    'price matching', 'beat any price', 'lowest price',
    'cheapest price', 'best price online', 'lowest price online',
    'best deal online', 'best value online', 'best online price',

    // ── Heritage/tradition filler ─────────────────────────────────────────────
    'heritage brand', 'heritage quality', 'heritage craftsmanship',
    'traditional craftsmanship', 'traditional quality', 'traditional methods',
    'old fashioned quality', 'old-fashioned quality', 'old world quality',
    'artisan craftsmanship', 'master craftsmanship', 'master craftsman',
    'centuries old', 'hundreds of years', 'generations old', 'family recipe',

    // ── Charity/cause filler ──────────────────────────────────────────────────
    'charity donation', 'portion donated', 'percentage donated',
    'supports charity', 'charitable cause', 'gives back', 'giving back',
    'donate to charity', 'for a good cause', 'good cause', 'worthy cause',

    // ── Weather/climate filler ────────────────────────────────────────────────
    'all weather', 'all-weather', 'year round', 'year-round', 'all year',
    'every season', 'any season', 'any weather', 'any climate',
    'rain or shine', 'come rain or shine', 'summer and winter',
    'hot or cold', 'cold or hot',

    // ── Size/fit filler ───────────────────────────────────────────────────────
    'fits most', 'fits all', 'one size fits all', 'one size fits most',
    'one size', 'universal fit', 'true to size', 'runs true to size',
    'runs small', 'runs large', 'size up', 'size down',

    // ── Body positive filler ──────────────────────────────────────────────────
    'body positive', 'body-positive', 'inclusive sizing', 'size inclusive',
    'all body types', 'all shapes', 'all shapes and sizes',
    'curves welcome', 'curve friendly', 'curve-friendly',
    'plus size friendly', 'plus size inclusive', 'all sizes welcome',

    // ── Vague technology filler ───────────────────────────────────────────────
    'smart', 'intelligent', 'responsive', 'reactive', 'adaptive', 'dynamic',
    'intuitive interface', 'intuitive controls',
    'one touch', 'one-touch', 'single touch', 'touch sensitive', 'touch-sensitive',
    'voice activated', 'voice-activated', 'app controlled', 'app-controlled',
    'bluetooth enabled', 'wifi enabled', 'cloud connected', 'iot enabled',

    // ── Bundle/bulk filler ────────────────────────────────────────────────────
    'bundle deal available', 'bundle available', 'bundle option',
    'bulk discount available', 'bulk discount', 'buy more save more',
    'buy more pay less', 'quantity discount', 'volume discount',
    'multi-buy', 'multibuy', 'multi buy', 'buy 2 get 1', 'buy 3 get 1',

    // ── Vague origin story filler ─────────────────────────────────────────────
    'born from', 'born out of', 'born of', 'created from a passion',
    'created out of passion', 'passion project', 'passion-driven',
    'passion for', 'love of', 'love for', 'obsession with',
    'inspired by', 'driven by', 'motivated by', 'fuelled by', 'fueled by',

    // ── Relationship/couples filler ───────────────────────────────────────────
    'couples gift', 'couples present', 'his and hers', 'his and her',
    'his hers', 'mr and mrs', 'mr mrs', 'bride and groom', 'bride groom',
    'for couples', 'for a couple', 'for two',

    // ── Photography/social media filler ───────────────────────────────────────
    'instagram worthy', 'instagram-worthy', 'instagram ready', 'insta worthy',
    'insta-worthy', 'insta ready', 'photo ready', 'photo-ready',
    'camera ready', 'selfie ready', 'selfie-ready', 'tiktok ready',
    'youtube ready', 'content ready', 'content creator', 'content creation',

    // ── Package/wrapper filler ────────────────────────────────────────────────
    'in a bag', 'in a box', 'in a tin', 'in a jar', 'in a bottle',
    'in a tube', 'in a packet', 'in a sachet', 'in a pouch',
    'bag included', 'box included', 'tin included', 'jar included',

    // ── Superlative compound filler ───────────────────────────────────────────
    'best of the best', 'cream of the crop', 'pick of the bunch',
    'top of the line', 'top-of-the-line', 'flagship model',
    'hero product', 'hero item', 'crown jewel', 'jewel in the crown',
    'pride of the range',

    // ── Uniqueness hyperbole filler ───────────────────────────────────────────
    'first of its kind', 'one of a kind', 'unlike anything else',
    'nothing like it', 'nothing else like it', 'no other product like it',
    'truly unique', 'genuinely unique', 'actually unique', 'really unique',
    'completely unique', 'totally unique', 'entirely unique',

    // ── Food/fuel metaphor filler ─────────────────────────────────────────────
    'fuel your', 'fuel for', 'power your', 'power for', 'energy for',
    'nutrition for', 'nourishment for', 'sustain your',
    'support your', 'supports your', 'help your', 'helps your',
    'aid your', 'aids your', 'assist your', 'assists your',

    // ── Full package filler ───────────────────────────────────────────────────
    'cherry on top', 'icing on the cake', 'the full package',
    'the whole package', 'the complete package', 'the whole deal',
    'all in one', 'all-in-one', 'everything you need',
    'all you need', 'just what you need',

    // ── Simple vague adjective compounds ─────────────────────────────────────
    'very nice', 'so nice', 'quite nice', 'rather nice', 'pretty nice',
    'very good', 'so good', 'quite good', 'rather good', 'pretty good',
    'very pretty', 'so pretty', 'quite pretty', 'rather pretty',
    'very lovely', 'so lovely', 'quite lovely', 'rather lovely',
    'very cool', 'so cool', 'quite cool', 'rather cool', 'pretty cool',
    'very cute', 'so cute', 'quite cute', 'rather cute', 'pretty cute',
    'very smart', 'so smart', 'quite smart', 'rather smart', 'pretty smart',
    'very modern', 'so modern', 'quite modern', 'rather modern',
    'very clean', 'so clean', 'quite clean', 'rather clean',
    'very safe', 'so safe', 'quite safe', 'rather safe', 'pretty safe',

    // ── Filler from poor non-English listings ──────────────────────────────────
    'high quailty', 'hight quality', 'quailty', 'qualiy', 'quilty',
    'durabel', 'durble', 'convinient', 'convinent', 'convienent',
    'compatable', 'compatble', 'compatibel', 'effiecient', 'efficent',
    'professionel', 'profesional', 'profesionnal',
    'shinning', 'shiney', 'glorius', 'specail', 'speciel',
    'wonderfull', 'beautyful', 'colourfull', 'powerfull',
    'usefull', 'helpfull', 'carefull', 'succesfull',

    // ── Redundant obvious filler ──────────────────────────────────────────────
    'colour shown', 'colour as shown', 'as shown above', 'as described',
    'description above', 'title says it all', 'does what it says',
    'exactly as described', 'exactly as listed', 'exactly as pictured',
    'what is listed', 'what you see', 'what is shown',
    'no more no less', 'nothing added', 'nothing removed',
    'complete and as shown', 'complete as pictured', 'all as shown',

    // ── Colour adjective combos ───────────────────────────────────────────────
    'jet black', 'jet-black', 'snow white', 'snow-white', 'pearl white', 'pearl-white',
    'off white', 'off-white', 'pure white', 'bright white', 'brilliant white',
    'chalk white', 'bone white', 'antique white', 'warm white', 'cool white',
    'midnight black', 'ebony black', 'charcoal black', 'matte black', 'gloss black',
    'satin black', 'carbon black', 'piano black', 'gun metal', 'gunmetal',
    'sky blue', 'baby blue', 'duck egg', 'duck egg blue', 'powder blue',
    'cobalt blue', 'electric blue', 'ice blue', 'ocean blue', 'aqua blue',
    'forest green', 'olive green', 'sage green', 'lime green', 'hunter green',
    'bottle green', 'racing green', 'mint green', 'pistachio',
    'blush pink', 'hot pink', 'fuchsia pink', 'dusty pink', 'rose pink', 'baby pink',
    'candy pink', 'flamingo pink', 'shocking pink', 'powder pink', 'petal pink',
    'burnt orange', 'terracotta', 'rust orange', 'amber', 'mustard', 'ochre',
    'chocolate brown', 'tan brown', 'caramel', 'mocha', 'espresso', 'walnut brown',
    'wine red', 'claret', 'cherry red', 'pillar box red', 'fire engine red',
    'crimson red', 'scarlet red', 'vermillion', 'ruby red', 'blood red',
    'lavender purple', 'plum purple', 'mauve', 'lilac purple', 'grape purple',
    'heather', 'amethyst', 'aubergine', 'eggplant', 'indigo',

    // ── Finish/texture descriptors ────────────────────────────────────────────
    'brushed steel', 'brushed aluminium', 'brushed aluminum', 'brushed nickel',
    'polished steel', 'polished chrome', 'polished nickel', 'polished brass',
    'antique brass', 'antique bronze', 'antique silver', 'antique gold',
    'hammered effect', 'hammered finish', 'distressed finish', 'aged finish',
    'weathered finish', 'patina finish', 'raw finish', 'natural finish',
    'unfinished', 'bare', 'unpainted', 'uncoated',
    'high gloss', 'semi gloss', 'low sheen', 'flat finish',

    // ── Size descriptor combos ────────────────────────────────────────────────
    'extra large', 'extra small', 'extra wide', 'extra long', 'extra short',
    'extra slim', 'extra thin', 'extra thick', 'extra deep', 'extra narrow',
    'double extra large', 'triple extra large', 'super large', 'super small',
    'super slim', 'super thin', 'super light', 'super heavy', 'super wide',
    'travel size', 'trial size', 'sample size', 'pocket size',
    'standard size', 'regular size', 'average size', 'normal size',

    // ── Material combo descriptors ────────────────────────────────────────────
    'genuine leather', 'real leather', 'faux leather', 'vegan leather', 'pu leather',
    'full grain leather', 'top grain leather', 'bonded leather', 'suede leather',
    'microfibre leather', 'synthetic leather', 'leatherette', 'leather look',
    'solid wood', 'real wood', 'natural wood', 'reclaimed wood', 'pine wood',
    'oak wood', 'walnut wood', 'mahogany wood', 'beech wood', 'birch wood',
    'mdf wood', 'chipboard', 'particleboard', 'plywood', 'hardwood', 'softwood',
    'stainless steel', 'carbon steel', 'mild steel', 'galvanised steel',
    'powder coated steel', 'zinc coated', 'galvanised', 'galvanized',
    'solid brass', 'solid copper', 'solid bronze',

    // ── Condition combos ──────────────────────────────────────────────────────
    'brand new sealed', 'brand new boxed', 'brand new unboxed',
    'new other', 'new without tags', 'new without box', 'new no box',
    'new open box', 'professionally refurbished', 'fully refurbished',
    'tested working', 'fully working', 'tested and working', 'working order',
    'good working order', 'powers on', 'turns on', 'boots up',
    'charges ok', 'no issues', 'some issues', 'minor issues', 'major issues',
    'cosmetic damage', 'cosmetic wear', 'scratches', 'scuffs', 'dents', 'chips',
    'cracks', 'broken screen', 'broken glass', 'smashed screen',
    'not working', 'stopped working', 'dead', 'wont power on',
    'wont turn on', 'wont boot', 'wont charge', 'intermittent fault',

    // ── Platform specific filler ──────────────────────────────────────────────
    'ebay exclusive', 'ebay only', 'only on ebay', 'exclusive to ebay',
    'ebay deal', 'ebay offer', 'ebay sale', 'ebay bargain',

    // ── Return policy filler ──────────────────────────────────────────────────
    '30 day returns', '14 day returns', '7 day returns', '60 day returns',
    '90 day returns', 'no returns', 'returns not accepted', 'final sale',
    'as described no returns', 'sold as seen no returns',
    'free returns', 'easy returns', 'simple returns',
    'no questions asked', 'return for any reason',

    // ── Payment filler ────────────────────────────────────────────────────────
    'paypal accepted', 'paypal only', 'cards accepted', 'bank transfer accepted',
    'cash on collection', 'cash only', 'cash payment', 'exact change',
    'collection only', 'local collection', 'personal collection only',
    'no postage', 'postage not available', 'uk collection only',

    // ── Vague feature connector filler ───────────────────────────────────────
    'including', 'includes', 'features', 'comes with', 'equipped with',
    'fitted with', 'provided with', 'supplied with', 'packed with',
    'loaded with', 'filled with', 'stuffed with', 'bursting with',
    'complete with', 'together with', 'along with', 'as well as',

    // ── Repetitive opener filler ──────────────────────────────────────────────
    'look no further', 'search no more', 'look no more', 'stop searching',
    'your search ends here', 'your search is over', 'found it',
    'this is it', 'this is the one', 'this is what you need',
    'this is what you want',

    // ── Competitor comparison filler ──────────────────────────────────────────
    'better than amazon', 'cheaper than amazon', 'better than the shops',
    'cheaper than shops', 'cheaper than retail', 'half the price',
    'quarter the price', 'fraction of the price', 'fraction of the cost',
    'at a fraction', 'beat retail', 'below retail', 'below rrp', 'below msrp',
    'below market value', 'under market value',

    // ── Fake exclusivity filler ───────────────────────────────────────────────
    'not available in shops', 'not in shops', 'not sold in stores',
    'not available in stores', 'only available online', 'online exclusive',
    'internet exclusive', 'web exclusive', 'direct only', 'factory direct',
    'direct from manufacturer', 'direct from factory', 'direct from supplier',
    'cut out the middleman', 'no middleman', 'straight from source',

    // ── Vague improvement filler ──────────────────────────────────────────────
    'new and improved', 'brand new improved', 'newly improved',
    'better than ever', 'now better than ever', 'even better than before',
    'greatly improved', 'vastly improved', 'significantly improved',
    'massively improved', 'completely overhauled', 'total redesign',
    'completely redesigned', 'fully redesigned', 'from the ground up',
    'rebuilt from scratch', 'all new design',

    // ── Single word connector filler ──────────────────────────────────────────
    'super', 'mega', 'hyper', 'turbo', 'nitro', 'alpha', 'omega',
    'sigma', 'delta', 'gamma', 'beta', 'apex', 'pinnacle', 'zenith',
    'summit', 'prime', 'elite', 'select', 'supreme',

    // ── Vague completeness filler ─────────────────────────────────────────────
    'full set', 'complete set', 'entire set', 'whole set',
    'full kit', 'entire kit', 'whole kit', 'complete bundle', 'full bundle',
    'entire bundle', 'whole bundle', 'full collection', 'entire collection',
    'complete collection', 'whole collection', 'everything included',
    'all items included', 'all parts included', 'all accessories included',
    'nothing missing', 'all present', 'all accounted for',
    'complete and working',

    // ── Food language used in non-food listings ───────────────────────────────
    'finger licking', 'lip smacking', 'lip-smacking',
    'to die for', 'drool worthy', 'drool-worthy', 'makes your mouth water',

    // ── Hyphenated quality intensifiers ──────────────────────────────────────
    'top-notch', 'tip-top', 'a-ok', 'a-okay', 'grade-a', 'top-drawer',
    'first-rate', 'world-class', 'world-beating',
    'class-leading', 'class leading', 'segment-leading', 'segment leading',
    'best-in-class', 'best in class', 'best-of-breed', 'best of breed',
    'gold-standard', 'gold standard',

    // ── Baby/child safety filler ──────────────────────────────────────────────
    'baby safe', 'baby-safe', 'child safe', 'child-safe', 'kid safe', 'kid-safe',
    'choking hazard', 'not suitable for under',
    'suitable from birth', 'from birth', 'newborn safe', 'infant safe',
    'toddler safe', 'gentle on skin', 'gentle formula', 'mild formula',
    'tear free', 'tear-free', 'no tears',

    // ── Electronics setup filler ──────────────────────────────────────────────
    'zero configuration', 'no setup required', 'no configuration required',
    'no software needed', 'no driver needed', 'no driver required',
    'works immediately', 'works out of box', 'works straight away',
    'immediately functional', 'instant setup', 'quick setup',
    'easy setup', 'simple setup', 'fast setup',

    // ── Clothing care filler ──────────────────────────────────────────────────
    'easy care', 'easy-care', 'machine washable', 'hand wash only',
    'dry clean only', 'tumble dry safe', 'iron safe', 'no iron',
    'non iron', 'crease resistant', 'wrinkle resistant', 'wrinkle free',
    'wrinkle-free', 'crease free', 'crease-free', 'stays fresh',
    'odour control', 'odor control', 'moisture wicking', 'sweat wicking',
    'quick dry', 'quick-dry', 'fast dry', 'fast-dry', 'air dry', 'air-dry',

    // ── Packaging description filler ─────────────────────────────────────────
    'retail packaging', 'retail box', 'retail pack', 'comes in retail',
    'original box', 'original packaging', 'original retail box',
    'manufacturer packaging', 'manufacturers packaging', 'box may vary',
    'packaging may vary', 'packaging varies', 'label may vary', 'label varies',

    // ── Incomplete listing filler ─────────────────────────────────────────────
    'description coming soon', 'full description coming', 'more info coming',
    'listing in progress', 'details to follow', 'to be updated',
    'will be updated', 'update coming', 'information coming soon',
    'please check back', 'check back soon', 'check back later',
    'more pictures coming', 'more photos coming', 'more images coming',
    'additional photos coming', 'additional pictures to follow',

    // ── Greeting/salutation filler ────────────────────────────────────────────
    'hello', 'hi', 'hey', 'greetings', 'welcome', 'thanks', 'thank you', 'cheers',
    'regards', 'kind regards', 'best regards', 'warm regards',
    'yours sincerely', 'yours faithfully', 'with love', 'with care',
    'with best wishes',

    // ── Listing policy reminder filler ────────────────────────────────────────
    'please message', 'please contact', 'please ask', 'questions welcome',
    'happy to help', 'happy to answer', 'feel free to ask', 'ask away',
    'no silly offers', 'serious buyers only', 'time wasters will be blocked',
    'genuine buyers only', 'buyers only', 'no timewasters', 'no time wasters',

    // ── eBay auction jargon filler ────────────────────────────────────────────
    'winning bidder', 'highest bidder', 'bid now', 'place bid', 'start bid',
    'reserve met', 'no reserve met', 'reserve not met', 'below reserve',
    'watch this item', 'add to watchlist', 'save this item', 'save this listing',
    'combined postage', 'combine postage', 'combined shipping', 'combine shipping',
    'postage discount', 'shipping discount', 'multi buy discount',

    // ── Feedback begging filler ───────────────────────────────────────────────
    'please leave feedback', 'leave positive feedback', 'feedback appreciated',
    '5 star feedback please', 'please leave 5 stars', '5 stars appreciated',
    'positive feedback left', 'feedback left automatically',
    'we always leave feedback', 'feedback always left',

    // ── Weight/size vague filler ──────────────────────────────────────────────
    'lightweight', 'light weight', 'featherweight', 'super lightweight',
    'heavy', 'heavyweight', 'heavy weight', 'substantial weight',
    'bulky', 'large item', 'large parcel', 'oversized', 'oversize',

    // ── Memory/moment filler ──────────────────────────────────────────────────
    'make memories', 'making memories', 'create memories', 'creating memories',
    'memories last forever', 'memories that last', 'cherished memories',
    'precious memories', 'unforgettable memories', 'lasting memories',
    'moments to remember', 'remember this moment', 'capture the moment',

    // ── Scarcity/urgency filler ───────────────────────────────────────────────
    'almost gone', 'nearly gone', 'selling fast', 'going quickly', 'going fast',
    'limited stock', 'low stock', 'only a few left', 'only a few remaining',
    'just a few left', 'very few left', 'last chance to buy',
    'final clearance', 'clearance must go', 'must go', 'needs to go',
    'moving house must sell', 'house clearance', 'garage clearance',
    'moving sale', 'relocation sale', 'downsizing sale',

    // ── Recipient descriptor filler ───────────────────────────────────────────
    'for the man who has everything', 'for the woman who has everything',
    'for someone special', 'for that special someone', 'for a special person',
    'for the one you love', 'for your loved one', 'for your loved ones',
    'for the whole gang', 'for the team', 'for the office',
    'for colleagues', 'for coworkers', 'for work friends', 'for work mates',
    'office secret santa', 'work secret santa', 'office gift', 'work gift',

    // ── Durability hyperbole filler ───────────────────────────────────────────
    'will last forever', 'lasts forever', 'lasts a lifetime', 'lasts for life',
    'never needs replacing', 'never wear out', 'never breaks', 'unbreakable',
    'indestructible', 'virtually indestructible', 'nearly indestructible',
    'impossible to break', 'impossible to damage', 'impossible to scratch',

    // ── Warranty filler ───────────────────────────────────────────────────────
    'comes with warranty', 'includes warranty', 'warranty included',
    'manufacturer warranty', 'manufacturers warranty', 'full warranty',
    'limited warranty', 'extended warranty', '2 year warranty',
    '3 year warranty', '1 year warranty', '6 month warranty',
    '90 day warranty', '30 day warranty', 'warranty card included',
    'registration required', 'register online',

    // ── Space saving filler ───────────────────────────────────────────────────
    'saves space', 'space saving', 'space-saving', 'saves room', 'room saving',
    'compact storage', 'clever storage', 'smart storage', 'hidden storage',
    'maximises space', 'maximizes space', 'optimises space', 'optimizes space',
    'more space', 'extra space', 'additional space', 'creates space',

    // ── Battery/charging filler ───────────────────────────────────────────────
    'fully charged', 'charge lasts', 'long battery life', 'extended battery',
    'extended battery life', 'all day battery', 'all-day battery',
    'week long battery', 'week-long battery', 'charges quickly', 'charges fast',
    'fast charging included', 'charger included', 'cable included',
    'charging cable included', 'power cable included', 'usb cable included',
    'adapter included', 'plug included',

    // ── Universal use filler ──────────────────────────────────────────────────
    'works for everything', 'works for anything', 'works on everything',
    'works on anything', 'suitable for everything', 'suitable for anything',
    'good for everything', 'good for anything', 'great for everything',
    'perfect for everything', 'ideal for everything', 'ideal for anything',

    // ── Refund/guarantee filler ───────────────────────────────────────────────
    'satisfaction or your money back', 'if not satisfied',
    'if you are not happy', 'if not completely satisfied', 'if not delighted',
    'not happy money back', 'unhappy money back', 'refund if unhappy',
    'refund if not satisfied', 'full refund if', 'partial refund if',
    'refund available',

    // ── Photo reference filler ────────────────────────────────────────────────
    'as per photos', 'as per pictures', 'as per images', 'as per listing',
    'photos speak for themselves', 'pictures speak for themselves',
    'images speak for themselves', 'see photos for details',
    'see pictures for details', 'see images for details',
    'please view all photos', 'please view all pictures',
    'please view all images', 'photo shows item clearly',
    'picture shows item clearly',

    // ── Purchase confidence filler ────────────────────────────────────────────
    'buy with confidence', 'shop with confidence', 'purchase with confidence',
    'order with confidence', 'bid with confidence',
    'safe to buy', 'safe to order', 'safe purchase',
    'secure transaction', 'safe transaction', '100% secure',
    'fully secure', 'safe and secure', 'secure checkout',

    // ── Category redundancy filler ────────────────────────────────────────────
    'fashion accessory', 'fashion accessories', 'fashion item', 'fashion piece',
    'home accessory', 'home accessories', 'home item', 'home piece',
    'beauty accessory', 'beauty accessories', 'beauty item', 'beauty tool',
    'tech accessory', 'tech accessories', 'tech item', 'tech gadget', 'tech piece',
    'garden accessory', 'garden accessories', 'garden item', 'garden piece',

    // ── Jewellery presentation filler ─────────────────────────────────────────
    'comes in a jewellery box', 'comes in a jewellery pouch',
    'comes in a gift box', 'comes gift boxed', 'gift boxed',
    'beautifully gift wrapped', 'gift wrapped', 'wrapped and ready',
    'ready to gift', 'gift ready', 'gift-ready',
    'perfect gift presentation', 'gorgeous gift presentation',
    'beautiful gift presentation',

    // ── Art/print filler ──────────────────────────────────────────────────────
    'ready to hang', 'ready-to-hang', 'hang it up', 'hang anywhere',
    'looks great on any wall', 'looks great anywhere', 'great wall art',
    'statement piece', 'statement wall art', 'conversation piece',
    'eye catching art', 'striking artwork', 'beautiful artwork',
    'stunning print', 'gorgeous print', 'beautiful print', 'lovely print',

    // ── Health disclaimer filler ──────────────────────────────────────────────
    'as part of a healthy diet', 'as part of a balanced diet',
    'as part of a healthy lifestyle', 'alongside a healthy diet',
    'alongside regular exercise', 'combined with exercise',
    'results may vary', 'individual results may vary',
    'not intended to diagnose', 'not intended to treat',
    'not intended to cure', 'consult your doctor', 'consult a physician',
    'consult a healthcare professional', 'seek medical advice',

    // ── Tool/trade filler ─────────────────────────────────────────────────────
    'perfect for professionals', 'ideal for professionals',
    'great for professionals', 'suitable for professionals',
    'perfect for beginners', 'ideal for beginners', 'great for beginners',
    'perfect for diy', 'ideal for diy', 'great for diy',
    'perfect for trade', 'ideal for trade', 'great for trade',
    'professional results', 'professional finish', 'professional quality finish',
    'trade quality', 'trade grade', 'trade standard',

    // ── Pet owner filler ──────────────────────────────────────────────────────
    'tail wagging', 'tail-wagging', 'four paws up', 'paws up',
    'pet parent', 'pet parents', 'pet owner', 'pet owners',
    'fur parent', 'fur parents', 'cat parent', 'cat parents',
    'dog parent', 'dog parents', 'pet lover', 'pet lovers',
    'dog lover', 'dog lovers', 'cat lover', 'cat lovers',
    'animal lover', 'animal lovers', 'wildlife lover',

    // ── Impact claim filler ───────────────────────────────────────────────────
    'makes a difference', 'makes all the difference', 'game changer',
    'life changer', 'changes everything', 'changes the game',
    'you wont look back', 'never look back', 'wont regret it',
    'you wont regret', 'no regrets', 'zero regrets', 'zero buyer remorse',

    // ── Vintage find filler ───────────────────────────────────────────────────
    'found in attic', 'found in loft', 'found in garage',
    'house clearance find', 'estate sale find', 'car boot find',
    'charity shop find', 'boot sale find', 'jumble sale find',
    'thrift store find', 'thrift find', 'flea market find',
    'auction find', 'auction house', 'auction lot',
    'job lot find', 'clearance find', 'old stock find', 'deadstock find',
    'new old stock', 'nos', 'dead stock', 'deadstock', 'old store stock',
])

// ── Context-dependent filler — only filler in certain positions ───────────────
export const CONTEXT_FILLER = new Set([
    'brand', 'make', 'model', 'type', 'style', 'design', 'version', 'edition',
    'range', 'line', 'series', 'collection', 'family', 'group', 'category',
    'class', 'tier', 'level', 'grade', 'rating', 'rank',
    'size', 'shape', 'form', 'format', 'mode', 'method', 'system', 'technique',
    'option', 'variant', 'choice', 'selection', 'variety', 'alternative',
    'feature', 'features', 'function', 'functions', 'capability', 'capabilities',
    'specification', 'specifications', 'spec', 'specs', 'detail', 'details',
    'property', 'properties', 'attribute', 'attributes', 'characteristic',
])

// ── All filler combined — main export for engine use ─────────────────────────
export const ALL_FILLER: Set<string> = new Set([
    ...MARKETING_FILLER,
    ...SELLER_FILLER,
    ...SHIPPING_FILLER,
    ...GRAMMAR_FILLER,
    ...EBAY_POLICY_FILLER,
    ...REDUNDANCY_FILLER,
])

// ── Safe list — words that LOOK like filler but are actually valuable ─────────
export const FILLER_SAFE_LIST = new Set([
    // Condition words — buyers DO search these
    'new', 'used', 'refurbished', 'faulty', 'graded', 'pre-owned', 'preowned',
    'sealed', 'unopened', 'unboxed', 'open-box', 'open box',

    // Material words that matter
    'steel', 'stainless', 'leather', 'rubber', 'plastic', 'metal', 'glass', 'wood',
    'bamboo', 'cotton', 'wool', 'silk', 'linen', 'nylon', 'polyester', 'ceramic',
    'silicone', 'titanium', 'aluminium', 'aluminum', 'carbon', 'copper', 'brass',
    'velvet', 'satin', 'chiffon', 'cashmere', 'merino', 'suede', 'canvas',

    // Size words buyers search
    'large', 'small', 'medium', 'mini', 'micro', 'giant', 'xl', 'xxl', 'xs',
    'xxxl', '2xl', '3xl', '4xl', '5xl', '6xl', 'petite', 'tall', 'plus',
    'oversized', 'slim', 'fitted', 'regular', 'wide', 'narrow', 'long', 'short',

    // Important qualifying words buyers search
    'waterproof', 'windproof', 'fireproof', 'dustproof', 'shockproof',
    'wireless', 'rechargeable', 'foldable', 'collapsible', 'stackable',
    'reversible', 'washable', 'reusable', 'biodegradable', 'compostable',
    'breathable', 'insulated', 'padded', 'lined', 'unlined', 'stretchy',
    'non-slip', 'anti-slip', 'non-stick', 'anti-scratch', 'anti-fog',

    // Colours buyers search
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple',
    'silver', 'gold', 'grey', 'gray', 'brown', 'orange', 'navy', 'teal',
    'beige', 'cream', 'ivory', 'clear', 'transparent', 'multicolour', 'multicolor',
    'rose gold', 'copper', 'bronze', 'champagne', 'charcoal', 'slate',
    'olive', 'khaki', 'burgundy', 'maroon', 'coral', 'peach', 'mint', 'lavender',
    'lilac', 'turquoise', 'holographic', 'iridescent', 'neon', 'pastel',

    // Genuine product descriptors buyers search
    'heavy', 'duty', 'heavy-duty', 'thick', 'thin', 'flat', 'round', 'square',
    'oval', 'rectangular', 'triangular', 'cylindrical', 'curved', 'straight',
    'folding', 'adjustable', 'extendable', 'telescopic', 'retractable',
    'detachable', 'removable', 'replaceable', 'refillable', 'reloadable',
    'rechargeable', 'solar', 'battery', 'electric', 'manual', 'automatic',

    // Age/gender descriptors buyers search
    'mens', 'womens', 'ladies', 'girls', 'boys', 'kids', 'childrens', 'babies',
    'toddlers', 'teens', 'adults', 'seniors', 'unisex', 'maternity',

    // Seasonal words buyers search
    'christmas', 'xmas', 'halloween', 'easter', 'birthday', 'wedding',
    'summer', 'winter', 'spring', 'autumn', 'seasonal', 'festive', 'holiday',

    // Pack/quantity words buyers search
    'pack', 'set', 'bundle', 'kit', 'pair', 'twin', 'double', 'triple',
    'multipack', 'bulk', 'wholesale', 'job-lot',
])

// ── Main filler detection function ───────────────────────────────────────────
export function isFillerWord(word: string): boolean {
    const wl = word.toLowerCase().trim()

    // Never remove safe list words
    if (FILLER_SAFE_LIST.has(wl)) return false

    // Check all filler sets
    if (ALL_FILLER.has(wl)) return true

    // Check context filler (only standalone)
    if (CONTEXT_FILLER.has(wl)) return true

    // Single characters that aren't meaningful
    if (wl.length === 1 && !/^[a-z]$/.test(wl)) return true

    // Pure punctuation or emoji
    if (/^[^a-z0-9]+$/i.test(wl)) return true

    // Repeated characters (!!!!, ????, ****)
    if (/^(.)\1{2,}$/.test(wl)) return true

    // Percentage claims not attached to specs (100%, 99%, 98%)
    if (/^\d{2,3}%$/.test(wl) && parseInt(wl) > 90) return true

    return false
}

// ── Filler detection with context ────────────────────────────────────────────
export function isFillerWithContext(
    word: string,
    prevWord: string,
    nextWord: string
): boolean {
    const wl = word.toLowerCase().trim()
    const prev = prevWord.toLowerCase().trim()
    const next = nextWord.toLowerCase().trim()

    // Safe list always wins
    if (FILLER_SAFE_LIST.has(wl)) return false

    // Basic filler check
    if (isFillerWord(wl)) return true

    // "Free" is filler UNLESS part of a meaningful compound
    if (wl === 'free') {
        const validFreeCompounds = ['bpa', 'sugar', 'gluten', 'dairy', 'nut', 'grain',
            'latex', 'phthalate', 'alcohol', 'caffeine', 'fat', 'sodium', 'salt', 'gmo',
            'nicotine', 'paraben', 'fragrance', 'sulphate', 'sulfate', 'chlorine']
        if (validFreeCompounds.includes(prev)) return false
        return true
    }

    // "Ready" is filler UNLESS part of compound
    if (wl === 'ready') {
        if (next === 'to' || prev === 'oven' || prev === 'plug' || prev === 'race'
            || prev === 'battle' || prev === 'game' || prev === 'competition') return false
        return true
    }

    // "Standard" is filler UNLESS followed by meaningful word
    if (wl === 'standard') {
        const validNext = ['size', 'fit', 'edition', 'version', 'uk', 'us', 'eu', 'delivery',
            'a4', 'definition', 'gauge', 'wall', 'deviation']
        if (validNext.includes(next)) return false
        return true
    }

    // "Full" is filler UNLESS part of meaningful compound
    if (wl === 'full') {
        const validNext = ['hd', 'uhd', 'set', 'kit', 'face', 'body', 'grain', 'tang',
            'suspension', 'frame', 'coverage', 'spectrum', 'colour', 'color', 'zip',
            'length', 'size', 'sleeve', 'back', 'front', 'motion', 'range']
        if (validNext.includes(next)) return false
        return true
    }

    // "High" is filler UNLESS followed by meaningful spec
    if (wl === 'high') {
        const validNext = ['vis', 'visibility', 'output', 'power', 'voltage', 'current',
            'speed', 'capacity', 'density', 'yield', 'rise', 'top', 'waist', 'neck',
            'chair', 'seat', 'heels', 'leg', 'back']
        if (validNext.includes(next)) return false
        return true
    }

    // "Pro" is filler UNLESS it's part of a product name
    if (wl === 'pro') {
        const validPrev = ['macbook', 'ipad', 'iphone', 'dyson', 'gopro', 'airpods',
            'adobe', 'final', 'logic', 'studio', 'surface', 'galaxy', 'pixel',
            'ipad', 'imac', 'apple']
        const validNext = ['max', 'ultra', 'plus', 'se', 'air', 'mini', 'kit', 'grade']
        if (validPrev.includes(prev) || validNext.includes(next)) return false
        return true
    }

    // "Plus" is filler UNLESS product variant
    if (wl === 'plus') {
        const validPrev = ['iphone', 'samsung', 'galaxy', 'pixel', 'size', 'xl', 'xxl',
            'note', 'oneplus', 'moto', 'oppo']
        if (validPrev.includes(prev)) return false
        return true
    }

    // "Eco" alone is filler but "Eco-Friendly", "Eco Drive" etc are not
    if (wl === 'eco') {
        if (next === 'friendly' || next === 'drive' || next === 'mode') return false
        return true
    }

    // "Anti" alone is filler but "Anti-Slip", "Anti-Scratch" are specs
    if (wl === 'anti') {
        if (next.length > 0) return false  // anti-something is always meaningful
        return true
    }

    // "Super" alone is filler but "Super King", "Super Fast" specs
    if (wl === 'super') {
        const validNext = ['king', 'size', 'fast', 'charge', 'zoom', 'wide', 'amoled',
            'retina', 'duty', 'resolution']
        if (validNext.includes(next)) return false
        return true
    }

    // Number alone as seller code (Level 2, Screaming Level)
    if (/^\d+$/.test(wl) && parseInt(wl) < 10) {
        const tierWords = ['level', 'tier', 'grade', 'type', 'version', 'size', 'gen',
            'generation', 'stage', 'phase', 'step', 'rank', 'class']
        if (tierWords.includes(prev)) return true
    }

    return false
}

// ── Score a title's filler density ───────────────────────────────────────────
// Returns 0-100 where 100 = no filler, 0 = all filler
export function titleFillerScore(title: string): {
    score: number
    fillerWords: string[]
    totalWords: number
    fillerCount: number
} {
    const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    const fillerFound = words.filter((w, i) =>
        isFillerWithContext(w, words[i - 1] ?? '', words[i + 1] ?? '')
    )
    const fillerCount = fillerFound.length
    const totalWords = words.length
    const score = totalWords === 0
        ? 100
        : Math.round(((totalWords - fillerCount) / totalWords) * 100)

    return { score, fillerWords: fillerFound, totalWords, fillerCount }
}

// ── Clean a title of all filler words ────────────────────────────────────────
export function removeFiller(title: string): string {
    const words = title.split(/\s+/)
    const cleaned = words.filter((w, i) =>
        !isFillerWithContext(w, words[i - 1] ?? '', words[i + 1] ?? '')
    )
    return cleaned.join(' ').replace(/\s+/g, ' ').trim()
}
