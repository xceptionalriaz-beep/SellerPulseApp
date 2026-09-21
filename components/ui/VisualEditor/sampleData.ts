// components/ui/VisualEditor/sampleData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Canvas-only sample data for the Visual Editor.
//
// Templates carry {{TOKEN}} placeholders (e.g. {{PRODUCT_TITLE}}) that get
// substituted by eBay at listing time. On canvas, we want the preview to look
// like a real, finished listing — so we replace each token with a high-quality
// default value, swap {{MAIN_IMAGE_URL}} for a real product photo, and turn
// icon-name strings (e.g. 'shield-check') into inline SVGs.
//
// CRITICAL: This is rendering-layer only. The block's `props` are unchanged.
// `toHtml()` is still called with the original props, so the saved HTML still
// contains the {{TOKENS}} that eBay will substitute at listing time.
//
// CATEGORY-AWARE: Each template category (pet, electronics, fashion, …)
// has its own SAMPLE_TOKENS map, hero image, thumbnails, and cross-sell
// products, so the canvas previews a finished listing that matches the
// template's theme rather than a generic pet-brush placeholder.
// ─────────────────────────────────────────────────────────────────────────────

import { Block } from './blocks'
import { getBannerVariant } from './variants/banner.variants'

// ── Category identifier ──────────────────────────────────────────────────────
export type CategoryId =
    | 'pet'
    | 'electronics'
    | 'fashion'
    | 'home'
    | 'sports'
    | 'auto'
    | 'general'

// Default category when none is supplied (kept pet-themed for backwards-compat
// with the original demo).
export const DEFAULT_CATEGORY: CategoryId = 'pet'

// ── Real sample product images per category (Unsplash, public CDN) ───────────
// Each is 700×500, cropped to a uniform product-photo size.
const U = (id: string, w = 700, h = 500) =>
    `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`

const UT = (id: string) => U(id, 200, 200)

// ─────────────────────────────────────────────────────────────────────────────
// PER-CATEGORY SAMPLE DATA
// Each category gets its own { tokens, mainImage, thumbnails, related } so the
// canvas preview is category-matched.  Templates inserted from
// `templates/pet.ts` get pet data; `templates/electronics.ts` get electronics
// data; etc.
// ─────────────────────────────────────────────────────────────────────────────
interface CategorySampleData {
    tokens: Record<string, string>
    mainImage: string
    thumbnails: string[]
    // Extra gallery images used by templates that go beyond the hero+thumbs
    // pair — e.g. the pet template's "See It In Action" 3-up gallery and the
    // large lifestyle banner. Keys are the {{TOKEN}} names the template
    // embeds in img src attrs (e.g. LIFESTYLE_IMAGE_URL, GALLERY_IMAGE_1..3).
    // Any token not present here falls back to the category's main image.
    galleryImages: Record<string, string>
    related: {
        tokens: Record<string, string>
        images: Record<string, string>
    }
}

const PET_SAMPLE: CategorySampleData = {
    tokens: {
        PRODUCT_TITLE:        'Premium Ergonomic Pet Grooming Brush – Stainless Steel',
        SELLER_NAME:          'FurShield Direct',
        ITEM_SKU:             'FS-DBT-78210',
        BRAND:                'FurShield',
        MODEL:                'FS-DBT-2024 Pro',
        MPN:                  'FS-DBT-7821',
        EAN:                  '5012345678900',
        STORE_URL:            '#',

        ITEM_PRICE:           '$29.99',
        ORIGINAL_PRICE:       '$49.99',

        ITEM_CONDITION:       'Brand New',
        QUANTITY:             '12',
        WATCHERS:             '24',
        FEEDBACK_SCORE:       '12,450',
        FEEDBACK_PERCENT:     '99.4',

        ITEM_DESCRIPTION:     'Professional-grade tool built for daily use. Premium materials, precision engineered, and rigorously tested to deliver reliable performance. Includes a 1-year manufacturer warranty and full after-sales support.',
        SHIPPING_TIME:        '1–2 Business Days',
        RETURN_POLICY:        '30-day free returns. No questions asked.',
        VAT_NUMBER:           'GB 123 4567 89',

        COLOUR:               'Midnight Black',
        SIZE:                 'Medium',
        MATERIAL:             'Stainless Steel',
        STYLE:                'Modern',
        GENDER:               'Unisex',
        AGE_GROUP:            'Adult',
        DEPARTMENT:           'Pet Supplies',
        DIMENSIONS:           '24 × 18 × 6 cm',
        WEIGHT:               '180 g',
        PLACEMENT:            'Front',
        COMPATIBLE_MODELS:    'Universal — see description for full list',
        NETWORK:              'Wi-Fi 6 / Bluetooth 5.2',
        CONNECTIVITY:         'USB-C, Wireless',
        STORAGE:              '128 GB',
        ROOM_TYPE:            'Living Room',
        SPORT:                'Outdoor & Indoor',

        TYPE:                 'Deshedding Tool',
        FEATURES:             'Self-Cleaning, Ergonomic, Anti-Slip',
        SUITABLE_FOR:         'Dogs & Cats — All Breeds',
        WARRANTY:             '12-Month Manufacturer Warranty',
    },
    mainImage: U('photo-1583337130417-3346a1be7dee'),
    thumbnails: [
        UT('photo-1583337130417-3346a1be7dee'),
        UT('photo-1518791841217-8f162f1e1131'),
        UT('photo-1450778869180-41d0601e046e'),
        UT('photo-1548199973-03cce0bbc87b'),
    ],
    // 4 distinct pet-grooming / dog photos so the lifestyle banner and the
    // 3-up "See It In Action" gallery don't all fall back to the same hero
    // image. Each key is the {{TOKEN}} name embedded in the template's img
    // src attrs (see pet.ts block 6 and block 10).
    galleryImages: {
        LIFESTYLE_IMAGE_URL: U('photo-1548199973-03cce0bbc87b'),   // long-haired dog being brushed
        GALLERY_IMAGE_1:     U('photo-1450778869180-41d0601e046e'), // dog with loose fur
        GALLERY_IMAGE_2:     U('photo-1518791841217-8f162f1e1131'), // dog bath time
        GALLERY_IMAGE_3:     U('photo-1543466835-00a7907e9de1'),   // golden retriever portrait
    },
    related: {
        tokens: {
            RELATED_TITLE_1: 'Ergonomic Pet Nail Clipper',
            RELATED_PRICE_1: '$14.99',
            RELATED_TITLE_2: 'Premium Pet Shampoo (250ml)',
            RELATED_PRICE_2: '$9.99',
            RELATED_TITLE_3: 'Soft-Bristle Pet Brush',
            RELATED_PRICE_3: '$12.49',
            RELATED_TITLE_4: 'Pet Detangling Spray',
            RELATED_PRICE_4: '$7.99',
        },
        images: {
            RELATED_IMAGE_1: UT('photo-1517849845537-4d257902454a'),
            RELATED_IMAGE_2: UT('photo-1535930891776-0c2dfb7fda1a'),
            RELATED_IMAGE_3: UT('photo-1591946614720-90a587da4a36'),
            RELATED_IMAGE_4: UT('photo-1601758228041-f3b2795255f1'),
        },
    },
}

const ELECTRONICS_SAMPLE: CategorySampleData = {
    tokens: {
        PRODUCT_TITLE:        'Wireless Bluetooth Headphones – Active Noise Cancelling',
        SELLER_NAME:          'TechVault Audio',
        ITEM_SKU:             'TV-WH-2024-001',
        BRAND:                'TechVault',
        MODEL:                'AirPro X1',
        MPN:                  'TV-APX1-2024',
        EAN:                  '5060123456789',
        STORE_URL:            '#',

        ITEM_PRICE:           '$89.99',
        ORIGINAL_PRICE:       '$149.99',

        ITEM_CONDITION:       'Brand New',
        QUANTITY:             '24',
        WATCHERS:             '58',
        FEEDBACK_SCORE:       '24,810',
        FEEDBACK_PERCENT:     '99.6',

        ITEM_DESCRIPTION:     'Premium over-ear wireless headphones with adaptive active noise cancellation, 40-hour battery life and hi-res audio drivers. Bluetooth 5.3 with multipoint pairing. Memory-foam earcups for all-day comfort. Includes hard-shell travel case and USB-C fast-charging cable.',
        SHIPPING_TIME:        '1–2 Business Days',
        RETURN_POLICY:        '30-day free returns. No questions asked.',
        VAT_NUMBER:           'GB 987 6543 21',

        COLOUR:               'Midnight Black',
        SIZE:                 'One Size',
        MATERIAL:             'Aluminium & Memory Foam',
        STYLE:                'Over-Ear',
        GENDER:               'Unisex',
        AGE_GROUP:            'Adult',
        DEPARTMENT:           'Electronics',
        DIMENSIONS:           '19 × 17 × 8 cm',
        WEIGHT:               '265 g',
        PLACEMENT:            'On-Ear',
        COMPATIBLE_MODELS:    'iOS, Android, Windows, macOS',
        NETWORK:              'Bluetooth 5.3',
        CONNECTIVITY:         'Bluetooth 5.3, USB-C, 3.5mm',
        STORAGE:              '—',
        ROOM_TYPE:            '—',
        SPORT:                '—',

        TYPE:                 'Over-Ear Headphones',
        FEATURES:             'Active Noise Cancellation, 40h Battery, Multipoint Pairing',
        SUITABLE_FOR:         'Music, Travel, Office, Home',
        WARRANTY:             '24-Month Manufacturer Warranty',
    },
    mainImage: U('photo-1505740420928-5e560c06d30e'),
    thumbnails: [
        UT('photo-1505740420928-5e560c06d30e'),
        UT('photo-1583394838336-acd977736f90'),
        UT('photo-1546435770-a3e426bf472b'),
        UT('photo-1572569511254-d8f925fe2cbb'),
    ],
    galleryImages: {},
    related: {
        tokens: {
            RELATED_TITLE_1: 'Portable Bluetooth Speaker',
            RELATED_PRICE_1: '$39.99',
            RELATED_TITLE_2: 'USB-C Fast Charger 65W',
            RELATED_PRICE_2: '$24.99',
            RELATED_TITLE_3: 'Wireless Earbuds Pro',
            RELATED_PRICE_3: '$59.99',
            RELATED_TITLE_4: 'Premium Aux Cable 2m',
            RELATED_PRICE_4: '$8.99',
        },
        images: {
            RELATED_IMAGE_1: UT('photo-1608043152269-423dbba4e7e1'),
            RELATED_IMAGE_2: UT('photo-1583863788434-e58a36330cf0'),
            RELATED_IMAGE_3: UT('photo-1572569511254-d8f925fe2cbb'),
            RELATED_IMAGE_4: UT('photo-1583394838336-acd977736f90'),
        },
    },
}

const FASHION_SAMPLE: CategorySampleData = {
    tokens: {
        PRODUCT_TITLE:        'Premium UrbanFit Runner Sneakers – Lightweight Mesh',
        SELLER_NAME:          'Style Studio',
        ITEM_SKU:             'SS-RUN-9921',
        BRAND:                'UrbanFit',
        MODEL:                'Runner Pro 3',
        MPN:                  'UF-RUN3-9921',
        EAN:                  '5098765432101',
        STORE_URL:            '#',

        ITEM_PRICE:           '$64.99',
        ORIGINAL_PRICE:       '$99.99',

        ITEM_CONDITION:       'Brand New',
        QUANTITY:             '8',
        WATCHERS:             '47',
        FEEDBACK_SCORE:       '18,720',
        FEEDBACK_PERCENT:     '99.2',

        ITEM_DESCRIPTION:     'Lightweight breathable mesh runners with responsive EVA midsole, removable cushioned insole and durable rubber outsole. Designed for daily training, walking and casual wear. Lace-up closure with padded collar for ankle support.',
        SHIPPING_TIME:        '1–2 Business Days',
        RETURN_POLICY:        '30-day free returns. No questions asked.',
        VAT_NUMBER:           'GB 456 7890 12',

        COLOUR:               'Charcoal / White',
        SIZE:                 'UK 9',
        MATERIAL:             'Mesh & Synthetic',
        STYLE:                'Athletic / Casual',
        GENDER:               'Unisex',
        AGE_GROUP:            'Adult',
        DEPARTMENT:           'Footwear',
        DIMENSIONS:           '32 × 12 × 11 cm',
        WEIGHT:               '320 g',
        PLACEMENT:            '—',
        COMPATIBLE_MODELS:    '—',
        NETWORK:              '—',
        CONNECTIVITY:         '—',
        STORAGE:              '—',
        ROOM_TYPE:            '—',
        SPORT:                'Running, Gym, Casual',

        TYPE:                 'Running Sneakers',
        FEATURES:             'Breathable Mesh, EVA Midsole, Removable Insole',
        SUITABLE_FOR:         'Men & Women — Casual and Active Wear',
        WARRANTY:             '12-Month Manufacturer Warranty',
    },
    mainImage: U('photo-1542291026-7eec264c27ff'),
    thumbnails: [
        UT('photo-1542291026-7eec264c27ff'),
        UT('photo-1606107557195-0e29a4b5b4aa'),
        UT('photo-1595950653106-6c9ebd614d3a'),
        UT('photo-1551107696-a4b0c5a0d9a2'),
    ],
    galleryImages: {},
    related: {
        tokens: {
            RELATED_TITLE_1: 'Classic Cotton Hoodie',
            RELATED_PRICE_1: '$44.99',
            RELATED_TITLE_2: 'Performance Training T-Shirt',
            RELATED_PRICE_2: '$19.99',
            RELATED_TITLE_3: 'Slim Fit Chino Trousers',
            RELATED_PRICE_3: '$39.99',
            RELATED_TITLE_4: 'Canvas Backpack',
            RELATED_PRICE_4: '$29.99',
        },
        images: {
            RELATED_IMAGE_1: UT('photo-1556821840-3a63f95609a7'),
            RELATED_IMAGE_2: UT('photo-1521572163474-6864f9cf17ab'),
            RELATED_IMAGE_3: UT('photo-1473966968600-fa801b869a1a'),
            RELATED_IMAGE_4: UT('photo-1553062407-98eeb64c6a62'),
        },
    },
}

const HOME_SAMPLE: CategorySampleData = {
    tokens: {
        PRODUCT_TITLE:        'Modern Ceramic Plant Pot Set of 3 with Drainage Saucers',
        SELLER_NAME:          'Living Space Co.',
        ITEM_SKU:             'LS-PP-3SET-04',
        BRAND:                'Living Space',
        MODEL:                'Terracotta Trio',
        MPN:                  'LS-PP3-04',
        EAN:                  '5023456789012',
        STORE_URL:            '#',

        ITEM_PRICE:           '$34.99',
        ORIGINAL_PRICE:       '$54.99',

        ITEM_CONDITION:       'Brand New',
        QUANTITY:             '15',
        WATCHERS:             '21',
        FEEDBACK_SCORE:       '9,640',
        FEEDBACK_PERCENT:     '99.1',

        ITEM_DESCRIPTION:     'Hand-finished ceramic planter set in three sizes, perfect for indoor plants, succulents and herbs. Each pot includes a matching drainage saucer to protect surfaces. Neutral matte finish suits modern and traditional interiors.',
        SHIPPING_TIME:        '2–3 Business Days',
        RETURN_POLICY:        '30-day free returns. No questions asked.',
        VAT_NUMBER:           'GB 321 4567 89',

        COLOUR:               'Warm Terracotta',
        SIZE:                 'Small / Medium / Large',
        MATERIAL:             'Glazed Ceramic',
        STYLE:                'Modern Minimalist',
        GENDER:               '—',
        AGE_GROUP:            '—',
        DEPARTMENT:           'Home & Garden',
        DIMENSIONS:           'S: 12cm · M: 16cm · L: 20cm',
        WEIGHT:               '2.4 kg (set)',
        PLACEMENT:            'Indoor / Outdoor',
        COMPATIBLE_MODELS:    '—',
        NETWORK:              '—',
        CONNECTIVITY:         '—',
        STORAGE:              '—',
        ROOM_TYPE:            'Living Room, Kitchen, Patio',
        SPORT:                '—',

        TYPE:                 'Plant Pot Set',
        FEATURES:             'Drainage Hole, Matching Saucers, Frost-Resistant',
        SUITABLE_FOR:         'Indoor & Outdoor Plants — Succulents, Herbs, Houseplants',
        WARRANTY:             '12-Month Manufacturer Warranty',
    },
    mainImage: U('photo-1556909114-f6e7ad7d3136'),
    thumbnails: [
        UT('photo-1556909114-f6e7ad7d3136'),
        UT('photo-1485955900006-10f4d324d411'),
        UT('photo-1416879595882-3373a0480b5b'),
        UT('photo-1459411552884-841db9b3cc2a'),
    ],
    galleryImages: {},
    related: {
        tokens: {
            RELATED_TITLE_1: 'Indoor Plant Mister 500ml',
            RELATED_PRICE_1: '$12.99',
            RELATED_TITLE_2: 'Cedar Plant Stand',
            RELATED_PRICE_2: '$29.99',
            RELATED_TITLE_3: 'Premium Potting Soil 10L',
            RELATED_PRICE_3: '$14.99',
            RELATED_TITLE_4: 'LED Grow Light Bulb',
            RELATED_PRICE_4: '$19.99',
        },
        images: {
            RELATED_IMAGE_1: UT('photo-1485955900006-10f4d324d411'),
            RELATED_IMAGE_2: UT('photo-1416879595882-3373a0480b5b'),
            RELATED_IMAGE_3: UT('photo-1459411552884-841db9b3cc2a'),
            RELATED_IMAGE_4: UT('photo-1518562180175-34a163b1a9a6'),
        },
    },
}

const SPORTS_SAMPLE: CategorySampleData = {
    tokens: {
        PRODUCT_TITLE:        'Pro Adjustable Dumbbell Set – 24kg (Pair)',
        SELLER_NAME:          'SportZone UK',
        ITEM_SKU:             'SZ-DB-24KG-2',
        BRAND:                'SportZone',
        MODEL:                'PowerGrip 24',
        MPN:                  'SZ-PG24-2024',
        EAN:                  '5045678901234',
        STORE_URL:            '#',

        ITEM_PRICE:           '$179.99',
        ORIGINAL_PRICE:       '$249.99',

        ITEM_CONDITION:       'Brand New',
        QUANTITY:             '6',
        WATCHERS:             '38',
        FEEDBACK_SCORE:       '15,300',
        FEEDBACK_PERCENT:     '99.5',

        ITEM_DESCRIPTION:     'Pair of quick-change adjustable dumbbells (2 × 24kg). Selectorised weight system lets you switch from 4kg to 24kg in seconds. Knurled chrome handle, contoured grip, and durable rubber-encased plates to protect floors. Includes storage tray.',
        SHIPPING_TIME:        '2–3 Business Days',
        RETURN_POLICY:        '30-day free returns. No questions asked.',
        VAT_NUMBER:           'GB 654 3210 98',

        COLOUR:               'Black / Chrome',
        SIZE:                 'Adjustable 4–24 kg (per dumbbell)',
        MATERIAL:             'Steel & Rubber',
        STYLE:                'Selectorised',
        GENDER:               'Unisex',
        AGE_GROUP:            'Adult',
        DEPARTMENT:           'Sports & Fitness',
        DIMENSIONS:           '42 × 22 × 22 cm (each)',
        WEIGHT:               '48 kg (pair)',
        PLACEMENT:            'Home / Gym',
        COMPATIBLE_MODELS:    '—',
        NETWORK:              '—',
        CONNECTIVITY:         '—',
        STORAGE:              '—',
        ROOM_TYPE:            'Home Gym',
        SPORT:                'Strength Training, Bodybuilding, CrossFit',

        TYPE:                 'Adjustable Dumbbell',
        FEATURES:             'Quick-Select Dial, Rubber-Coated Plates, Knurled Handle',
        SUITABLE_FOR:         'Home & Commercial Gyms — Beginner to Advanced',
        WARRANTY:             '24-Month Manufacturer Warranty',
    },
    mainImage: U('photo-1517466787929-bc90951d0974'),
    thumbnails: [
        UT('photo-1517466787929-bc90951d0974'),
        UT('photo-1571019613454-1cb2f99b2d8b'),
        UT('photo-1534438327276-14e5300c3a48'),
        UT('photo-1540497077202-7c8a3999166f'),
    ],
    galleryImages: {},
    related: {
        tokens: {
            RELATED_TITLE_1: 'Yoga Mat 6mm',
            RELATED_PRICE_1: '$24.99',
            RELATED_TITLE_2: 'Resistance Bands Set (5)',
            RELATED_PRICE_2: '$19.99',
            RELATED_TITLE_3: 'Adjustable Weight Bench',
            RELATED_PRICE_3: '$149.99',
            RELATED_TITLE_4: 'Foam Roller High-Density',
            RELATED_PRICE_4: '$16.99',
        },
        images: {
            RELATED_IMAGE_1: UT('photo-1540497077202-7c8a3999166f'),
            RELATED_IMAGE_2: UT('photo-1598289431512-b97b0917affc'),
            RELATED_IMAGE_3: UT('photo-1534438327276-14e5300c3a48'),
            RELATED_IMAGE_4: UT('photo-1571019613454-1cb2f99b2d8b'),
        },
    },
}

const AUTO_SAMPLE: CategorySampleData = {
    tokens: {
        PRODUCT_TITLE:        'OEM Quality Front Brake Disc Pair – Vented 300mm',
        SELLER_NAME:          'AutoParts Direct',
        ITEM_SKU:             'AP-BD-300-2',
        BRAND:                'AutoParts Pro',
        MODEL:                'BrakeMaster 300',
        MPN:                  'AP-BM300-V2',
        EAN:                  '5076543210987',
        STORE_URL:            '#',

        ITEM_PRICE:           '$74.99',
        ORIGINAL_PRICE:       '$109.99',

        ITEM_CONDITION:       'Brand New',
        QUANTITY:             '9',
        WATCHERS:             '17',
        FEEDBACK_SCORE:       '21,490',
        FEEDBACK_PERCENT:     '99.3',

        ITEM_DESCRIPTION:     'Pair of OE-quality vented front brake discs, precision-machined from high-carbon cast iron with anti-corrosion coating. Direct fit replacement for the original equipment. Supplied as a pair — ready to fit. Please verify vehicle compatibility before purchase.',
        SHIPPING_TIME:        '2–3 Business Days',
        RETURN_POLICY:        '30-day returns on unused parts. No questions asked.',
        VAT_NUMBER:           'GB 789 0123 45',

        COLOUR:               'Silver / Black',
        SIZE:                 '300 mm diameter',
        MATERIAL:             'High-Carbon Cast Iron',
        STYLE:                'Vented',
        GENDER:               '—',
        AGE_GROUP:            '—',
        DEPARTMENT:           'Automotive',
        DIMENSIONS:           '300 × 26 × 50 mm',
        WEIGHT:               '8.4 kg (pair)',
        PLACEMENT:            'Front Axle',
        COMPATIBLE_MODELS:    'See full fitment list in description',
        NETWORK:              '—',
        CONNECTIVITY:         '—',
        STORAGE:              '—',
        ROOM_TYPE:            '—',
        SPORT:                '—',

        TYPE:                 'Brake Disc Pair',
        FEATURES:             'Vented, Anti-Corrosion Coated, OE-Quality',
        SUITABLE_FOR:         'Passenger Cars & Light Commercial — Verify Fitment',
        WARRANTY:             '24-Month Manufacturer Warranty',
    },
    mainImage: U('photo-1486006920555-c77dcf18193c'),
    thumbnails: [
        UT('photo-1486006920555-c77dcf18193c'),
        UT('photo-1492144534655-ae79c964c9d7'),
        UT('photo-1503376780353-7e6692767b70'),
        UT('photo-1542362567-b07e54358753'),
    ],
    galleryImages: {},
    related: {
        tokens: {
            RELATED_TITLE_1: 'Brake Pad Set (Front)',
            RELATED_PRICE_1: '$34.99',
            RELATED_TITLE_2: 'Brake Caliper (Front Right)',
            RELATED_PRICE_2: '$89.99',
            RELATED_TITLE_3: 'Brake Disc Rear Pair 280mm',
            RELATED_PRICE_3: '$64.99',
            RELATED_TITLE_4: 'Brake Fluid DOT-4 1L',
            RELATED_PRICE_4: '$9.99',
        },
        images: {
            RELATED_IMAGE_1: UT('photo-1492144534655-ae79c964c9d7'),
            RELATED_IMAGE_2: UT('photo-1503376780353-7e6692767b70'),
            RELATED_IMAGE_3: UT('photo-1542362567-b07e54358753'),
            RELATED_IMAGE_4: UT('photo-1486006920555-c77dcf18193c'),
        },
    },
}

const GENERAL_SAMPLE: CategorySampleData = {
    tokens: {
        PRODUCT_TITLE:        'Premium Product Sample Listing',
        SELLER_NAME:          'Trusted Seller',
        ITEM_SKU:             'GEN-001',
        BRAND:                'Generic',
        MODEL:                'Standard',
        MPN:                  'GEN-MPN-001',
        EAN:                  '5000000000000',
        STORE_URL:            '#',

        ITEM_PRICE:           '$19.99',
        ORIGINAL_PRICE:       '$29.99',

        ITEM_CONDITION:       'Brand New',
        QUANTITY:             '10',
        WATCHERS:             '5',
        FEEDBACK_SCORE:       '1,000',
        FEEDBACK_PERCENT:     '99.0',

        ITEM_DESCRIPTION:     'A high-quality product sample. Replace this text with the actual item description.',
        SHIPPING_TIME:        '2–3 Business Days',
        RETURN_POLICY:        '30-day free returns.',
        VAT_NUMBER:           'GB 000 0000 00',

        COLOUR:               'Black',
        SIZE:                 'Standard',
        MATERIAL:             'Mixed',
        STYLE:                'Standard',
        GENDER:               'Unisex',
        AGE_GROUP:            'Adult',
        DEPARTMENT:           'General',
        DIMENSIONS:           '—',
        WEIGHT:               '—',
        PLACEMENT:            '—',
        COMPATIBLE_MODELS:    '—',
        NETWORK:              '—',
        CONNECTIVITY:         '—',
        STORAGE:              '—',
        ROOM_TYPE:            '—',
        SPORT:                '—',

        TYPE:                 'Generic',
        FEATURES:             'Standard features',
        SUITABLE_FOR:         'All customers',
        WARRANTY:             '12-Month Standard Warranty',
    },
    mainImage: U('photo-1505740420928-5e560c06d30e'),
    thumbnails: [
        UT('photo-1505740420928-5e560c06d30e'),
        UT('photo-1505740420928-5e560c06d30e'),
        UT('photo-1505740420928-5e560c06d30e'),
        UT('photo-1505740420928-5e560c06d30e'),
    ],
    galleryImages: {},
    related: {
        tokens: {
            RELATED_TITLE_1: 'Related Item 1',
            RELATED_PRICE_1: '$14.99',
            RELATED_TITLE_2: 'Related Item 2',
            RELATED_PRICE_2: '$9.99',
            RELATED_TITLE_3: 'Related Item 3',
            RELATED_PRICE_3: '$12.49',
            RELATED_TITLE_4: 'Related Item 4',
            RELATED_PRICE_4: '$7.99',
        },
        images: {
            RELATED_IMAGE_1: UT('photo-1505740420928-5e560c06d30e'),
            RELATED_IMAGE_2: UT('photo-1505740420928-5e560c06d30e'),
            RELATED_IMAGE_3: UT('photo-1505740420928-5e560c06d30e'),
            RELATED_IMAGE_4: UT('photo-1505740420928-5e560c06d30e'),
        },
    },
}

// ── Public per-category registry ─────────────────────────────────────────────
export const CATEGORY_DATA: Record<CategoryId, CategorySampleData> = {
    pet:         PET_SAMPLE,
    electronics: ELECTRONICS_SAMPLE,
    fashion:     FASHION_SAMPLE,
    home:        HOME_SAMPLE,
    sports:      SPORTS_SAMPLE,
    auto:        AUTO_SAMPLE,
    general:     GENERAL_SAMPLE,
}

// ── Back-compat exports (still used by code that hasn't been updated yet) ───
// These point to the default (pet) category, matching the original behaviour.
export const SAMPLE_TOKENS: Record<string, string> = PET_SAMPLE.tokens
export const CATEGORY_SAMPLE_IMAGES: Record<string, string> = {
    electronics: ELECTRONICS_SAMPLE.mainImage,
    fashion:     FASHION_SAMPLE.mainImage,
    home:        HOME_SAMPLE.mainImage,
    sports:      SPORTS_SAMPLE.mainImage,
    auto:        AUTO_SAMPLE.mainImage,
    pet:         PET_SAMPLE.mainImage,
    general:     GENERAL_SAMPLE.mainImage,
}
export const PET_THUMBNAILS: string[] = PET_SAMPLE.thumbnails
export const RELATED_TOKENS: Record<string, string> = PET_SAMPLE.related.tokens
export const RELATED_IMAGES: Record<string, string> = PET_SAMPLE.related.images

// ── Inline Lucide-style SVGs for icon-name strings ────────────────────────────
// These are inlined into the iframe HTML so they render as proper graphics
// instead of the literal text "shield-check" / "truck" / "star" etc.
const STROKE = `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`

const svg = (inner: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" ${STROKE}>${inner}</svg>`

export const ICON_SVG: Record<string, string> = {
    check: svg(
        `<path d="M20 6 9 17l-5-5"/>`
    ),
    package: svg(
        `<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>`
    ),
    star: svg(
        `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`
    ),
    shield: svg(
        `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>`
    ),
    'shield-check': svg(
        `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`
    ),
    truck: svg(
        `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>`
    ),
    'rotate-ccw': svg(
        `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>`
    ),
    'refresh-ccw': svg(
        `<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>`
    ),
    'heart-pulse': svg(
        // Lucide heart-pulse: outlined heart with an EKG trace across it
        `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>`
    ),
    'paw-print': svg(
        // Lucide paw-print: 4 toe pads (top-left, top-right, side, side) + main pad
        `<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>`
    ),
}

// ── Helper: extract all {{TOKEN}} names from an HTML string ──────────────────
export function extractTokens(html: string): string[] {
    if (!html) return []
    const seen = new Set<string>()
    const re = /\{\{([A-Z_][A-Z0-9_]*)\}\}/g
    let m: RegExpExecArray | null
    while ((m = re.exec(html)) !== null) seen.add(m[1])
    return Array.from(seen)
}

// ── Resolve a CategoryId from a template id (e.g. 'full-electronics' → 'electronics')
// Falls back to DEFAULT_CATEGORY if the id doesn't encode a known category.
export function categoryFromTemplateId(templateId: string | null | undefined): CategoryId {
    if (!templateId) return DEFAULT_CATEGORY
    const id = templateId.toLowerCase()
    // Match longest key first to avoid 'auto' shadowing 'auto-something' wrong.
    const order: CategoryId[] = ['electronics', 'home', 'fashion', 'sports', 'auto', 'pet']
    for (const cat of order) {
        if (id.includes(cat)) return cat
    }
    // 'minimal' / 'conversion' / 'product' / 'policy' / 'branding' templates
    // stay on the default pet theme.
    return DEFAULT_CATEGORY
}

// ── Main renderer: swap tokens + images + icon names in canvas HTML ──────────
/**
 * Transform the eBay-rendered HTML for canvas display.
 *  - {{TOKEN}} → sample data string (category-matched when `category` is supplied)
 *  - <img src="...{{TOKEN}}..."> → real sample image URL (category-matched)
 *  - For trust_badges blocks: replace icon-name strings with inline SVGs
 *  - For cross_sell blocks: replace {{RELATED_*}} tokens and images
 *
 * This is a pure function. It does NOT mutate the block's props.
 */
export function renderForCanvas(
    rawHtml: string,
    blockType: string,
    category: CategoryId = DEFAULT_CATEGORY
): string {
    if (!rawHtml) return ''

    let out = rawHtml
    const data = CATEGORY_DATA[category] ?? CATEGORY_DATA[DEFAULT_CATEGORY]

    // 1) Replace each {{TOKEN}} with its sample value (or leave it visible if unknown).
    //    Cross-sell has its own token map (RELATED_*); merged in for a single pass.
    const baseTokens = data.tokens
    const tokenMap = blockType === 'cross_sell'
        ? { ...baseTokens, ...data.related.tokens }
        : baseTokens
    out = out.replace(/\{\{([A-Z_][A-Z0-9_]*)\}\}/g, (full, name) => {
        return tokenMap[name] ?? full
    })

    // 2) Replace any <img src="...{{TOKEN}}..."> with a real sample image.
    if (blockType === 'cross_sell') {
        let relatedIdx = 1
        out = out.replace(
            /<img\b([^>]*?)src="[^"]*\{\{RELATED_IMAGE_(\d+)\}\}[^"]*"([^>]*)>/gi,
            (_match, before, n, after) => {
                const key = `RELATED_IMAGE_${n}`
                return `<img ${before}src="${data.related.images[key] ?? pickSampleImage(blockType, category)}"${after}>`
            }
        )
        out = out.replace(
            /<img\b([^>]*?)src="[^"]*\{\{(?:RELATED_IMAGE|IMAGE)_[^}]*\}\}[^"]*"([^>]*)>/gi,
            (_match, before, after) => {
                const fallback = data.related.images[`RELATED_IMAGE_${((relatedIdx++) % 4) + 1}`]
                return `<img ${before}src="${fallback ?? pickSampleImage(blockType, category)}"${after}>`
            }
        )
    } else {
        // For hero_product, the {{IMAGE_2_URL}}..{{IMAGE_5_URL}} tokens map
        // to the category's 4 thumbnails, so the gallery looks like a real
        // product with 4 different angles. {{MAIN_IMAGE_URL}} → main image.
        // Thumbnail counter resets per call (one block at a time).
        let thumbIdx = 0
        out = out.replace(
            /<img\b([^>]*?)src="[^"]*\{\{MAIN_IMAGE_URL\}\}[^"]*"([^>]*)>/gi,
            (_m, before, after) => `<img ${before}src="${data.mainImage}"${after}>`
        )
        out = out.replace(
            /<img\b([^>]*?)src="[^"]*\{\{IMAGE_(\d+)_URL\}\}[^"]*"([^>]*)>/gi,
            (_m, before, _n, after) => {
                const t = data.thumbnails[thumbIdx % data.thumbnails.length]
                thumbIdx++
                return `<img ${before}src="${t ?? data.mainImage}"${after}>`
            }
        )
        // Extra gallery tokens used by templates that go beyond the hero+thumbs
        // pair — e.g. pet.ts block 6 (LIFESTYLE_IMAGE_URL) and block 10
        // (GALLERY_IMAGE_1..3 for the "See It In Action" 3-up). Each token is
        // mapped to a distinct category-specific image from data.galleryImages
        // so the lifestyle banner and the 3-up don't all collapse onto the
        // same hero photo. Tokens absent from the map fall through to the
        // catch-all below.
        out = out.replace(
            /<img\b([^>]*?)src="[^"]*\{\{(LIFESTYLE_IMAGE_URL|GALLERY_IMAGE_\d+)\}\}[^"]*"([^>]*)>/gi,
            (_m, before, token, after) => {
                const url = data.galleryImages[token] ?? data.mainImage
                return `<img ${before}src="${url}"${after}>`
            }
        )
        // Any remaining {{TOKEN}} in src (e.g. {{IMAGE_URL}} without _N) → main image
        out = out.replace(
            /<img\b([^>]*?)src="[^"]*\{\{[^}]*\}\}[^"]*"([^>]*)>/gi,
            (_match, before, after) => {
                const sample = pickSampleImage(blockType, category)
                return `<img ${before}src="${sample}"${after}>`
            }
        )
    }

    // 3) For trust_badges, swap icon-name strings with inline SVGs.
    if (blockType === 'trust_badges') {
        const iconNames = Object.keys(ICON_SVG)
        const re = new RegExp(
            `>([\\s]*)(${iconNames.join('|')})([\\s]*)<`,
            'g'
        )
        out = out.replace(re, (_m, lead, name, trail) => {
            return `>${lead}<span style="display:inline-block;width:1em;height:1em;vertical-align:-0.15em;">${ICON_SVG[name]}</span>${trail}<`
        })
    }

    return out
}

// ── Helper for banner variant preview ──────────────────────────────────────────
export function renderBannerForCanvas(
    block: Block,
    category: CategoryId = DEFAULT_CATEGORY
): string {
    const data = CATEGORY_DATA[category] ?? CATEGORY_DATA[DEFAULT_CATEGORY]
    const bannerProps = block.props as any

    // Create props merged with tokens
    const props = {
        ...bannerProps,
        headingText: bannerProps.headingText ?? data.tokens.PRODUCT_TITLE,
        subText:     bannerProps.subText     ?? data.tokens.ITEM_DESCRIPTION,
        imageUrl:    bannerProps.imageUrl    ?? data.mainImage,
    }

    const variant = getBannerVariant(props.variant ?? 'simple')
    return variant.toHtml(props, block.id)
}

// ── Pick a sample image based on block type AND category ─────────────────────
// hero_product uses the category's main image; type-specific blocks still get
// their semantic default but with the category's image where it makes sense.
export function pickSampleImage(blockType: string, category: CategoryId = DEFAULT_CATEGORY): string {
    const data = CATEGORY_DATA[category] ?? CATEGORY_DATA[DEFAULT_CATEGORY]
    // Type-specific overrides: these only apply for non-default categories
    // when the block has a strong category semantic (e.g. pet_image, auto_image).
    const typeMap: Record<string, (c: CategoryId) => string> = {
        product_image:   () => data.mainImage,
        product_gallery: () => data.mainImage,
        hero_header:     () => data.mainImage,
        hero_banner:     () => data.mainImage,
        hero_product:    () => data.mainImage,
        image_text_row:  () => data.mainImage,
        image_grid:      () => data.mainImage,
        pet_image:       () => CATEGORY_DATA.pet.mainImage,
        auto_image:      () => CATEGORY_DATA.auto.mainImage,
        fashion_image:   () => CATEGORY_DATA.fashion.mainImage,
        home_image:      () => CATEGORY_DATA.home.mainImage,
        sports_image:    () => CATEGORY_DATA.sports.mainImage,
    }
    const picker = typeMap[blockType]
    return picker ? picker(category) : data.mainImage
}
