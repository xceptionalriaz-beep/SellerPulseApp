// components/ui/VisualEditor/fonts.ts
// ─────────────────────────────────────────────────────────────────────────────
// 100+ Curated Google & Retail Fonts Engine
// Zero-lag on-demand loader • 100% eBay & Mobile Safe
// ─────────────────────────────────────────────────────────────────────────────

export type FontCategory = 'sans' | 'serif' | 'display' | 'mono' | 'system'

export interface FontDefinition {
    name: string
    category: FontCategory
    fallback: string
    google?: boolean
    weights?: number[]
}

// ─────────────────────────────────────────────────────────────────────────────
// CURATED FONT REGISTRY — eBay Listing & E-Commerce Optimised
//
// Every font here has a distinct visual purpose for product listings.
// Fonts are grouped by the kind of eBay listing they suit best.
//
// Removed: near-duplicate generics, dev-only coding fonts, fonts that
//          don't exist on Google Fonts (Cabinet Grotesk, Clash Display),
//          a typo entry (Cinel Decorative), and anything that clashes
//          with a professional listing context.
// ─────────────────────────────────────────────────────────────────────────────
export const FONT_REGISTRY: FontDefinition[] = [

    // ── System fonts — zero download, always work in eBay HTML ──────────────
<<<<<<< HEAD
    { name: 'Arial', category: 'system', fallback: 'Helvetica, sans-serif' },
    { name: 'Georgia', category: 'system', fallback: 'serif' },
    { name: 'Verdana', category: 'system', fallback: 'Geneva, sans-serif' },
    { name: 'Trebuchet MS', category: 'system', fallback: 'Helvetica, sans-serif' },
    { name: 'Times New Roman', category: 'system', fallback: 'Times, serif' },
    { name: 'Tahoma', category: 'system', fallback: 'sans-serif' },
    { name: 'Impact', category: 'system', fallback: 'Charcoal, sans-serif' },

    // ── Clean modern sans — body copy, bullet lists, spec tables ────────────
    // Best for: all categories. Readable at small sizes on mobile.
    { name: 'Inter', category: 'sans', fallback: 'sans-serif', google: true },  // free
    { name: 'Roboto', category: 'sans', fallback: 'sans-serif', google: true },  // free
    { name: 'Open Sans', category: 'sans', fallback: 'sans-serif', google: true },  // most-used web font, excellent descriptions
    { name: 'Lato', category: 'sans', fallback: 'sans-serif', google: true },  // professional, warm — apparel, home goods
    { name: 'Poppins', category: 'sans', fallback: 'sans-serif', google: true },  // rounded, modern — fashion, beauty, toys
    { name: 'Montserrat', category: 'sans', fallback: 'sans-serif', google: true },  // strong geometric — all premium products
    { name: 'Raleway', category: 'sans', fallback: 'sans-serif', google: true },  // elegant thin caps — fashion, jewellery headers
    { name: 'DM Sans', category: 'sans', fallback: 'sans-serif', google: true },  // crisp modern — electronics, software
    { name: 'Plus Jakarta Sans', category: 'sans', fallback: 'sans-serif', google: true },  // contemporary — lifestyle, home decor
    { name: 'Nunito', category: 'sans', fallback: 'sans-serif', google: true },  // rounded friendly — kids, toys, gifts
    { name: 'Manrope', category: 'sans', fallback: 'sans-serif', google: true },  // geometric modern — tech accessories
    { name: 'Work Sans', category: 'sans', fallback: 'sans-serif', google: true },  // editorial clean — tools, automotive parts
    { name: 'Josefin Sans', category: 'sans', fallback: 'sans-serif', google: true },  // geometric elegant — fashion, vintage
    { name: 'Barlow', category: 'sans', fallback: 'sans-serif', google: true },  // condensed-friendly — industrial, outdoor
    { name: 'Rubik', category: 'sans', fallback: 'sans-serif', google: true },  // slightly rounded — consumer electronics
    { name: 'Quicksand', category: 'sans', fallback: 'sans-serif', google: true },  // soft round — handmade, beauty, wellness
    { name: 'Space Grotesk', category: 'sans', fallback: 'sans-serif', google: true },  // techy-modern — gadgets, gaming
    { name: 'IBM Plex Sans', category: 'sans', fallback: 'sans-serif', google: true },  // crisp & technical — tools, parts, specs
    { name: 'Outfit', category: 'sans', fallback: 'sans-serif', google: true },  // friendly modern — everyday products
    { name: 'Figtree', category: 'sans', fallback: 'sans-serif', google: true },  // clean proportions — home & garden
    { name: 'Urbanist', category: 'sans', fallback: 'sans-serif', google: true },  // minimal luxury — premium/brand listings
    { name: 'Mulish', category: 'sans', fallback: 'sans-serif', google: true },  // lightweight clean — beauty, wellness
    { name: 'Lexend', category: 'sans', fallback: 'sans-serif', google: true },  // readability-optimised — long descriptions

    // ── Elegant serifs — premium, luxury & editorial listings ────────────────
    // Best for: jewellery, watches, antiques, fashion, collectibles.
    { name: 'Playfair Display', category: 'serif', fallback: 'serif', google: true },  // luxury editorial — jewellery, watches
    { name: 'Cormorant Garamond', category: 'serif', fallback: 'serif', google: true },  // ultra-luxury — fine art, couture, antiques
    { name: 'Cinzel', category: 'serif', fallback: 'serif', google: true },  // Roman elegance — premium, collectibles
    { name: 'Bodoni Moda', category: 'serif', fallback: 'serif', google: true },  // high-fashion editorial — clothing, bags
    { name: 'Lora', category: 'serif', fallback: 'serif', google: true },  // warm readable — home goods, books, decor
    { name: 'Merriweather', category: 'serif', fallback: 'serif', google: true },  // trustworthy — books, business items
    { name: 'Libre Baskerville', category: 'serif', fallback: 'serif', google: true },  // classic professional — all categories
    { name: 'DM Serif Display', category: 'serif', fallback: 'serif', google: true },  // bold editorial — sale headers, banners
    { name: 'Fraunces', category: 'serif', fallback: 'serif', google: true },  // quirky premium — craft, artisan, vintage
    { name: 'Spectral', category: 'serif', fallback: 'serif', google: true },  // refined narrow — compact listing layouts
    { name: 'Bitter', category: 'serif', fallback: 'serif', google: true },  // slab-serif readable — tools, books
    { name: 'Italiana', category: 'serif', fallback: 'serif', google: true },  // Italian fashion-forward — luxury apparel
    { name: 'Marcellus', category: 'serif', fallback: 'serif', google: true },  // elegant small caps — jewellery, perfume

    // ── High-impact display — product headlines, sale banners, promo text ────
    // Best for: sale banners, product titles, section headers, promo blocks.
    { name: 'Oswald', category: 'display', fallback: 'sans-serif', google: true },  // condensed strong — SALE, DEAL headers
    { name: 'Bebas Neue', category: 'display', fallback: 'sans-serif', google: true },  // all-caps punch — discount banners
    { name: 'Anton', category: 'display', fallback: 'sans-serif', google: true },  // bold impact — clearance, sports
    { name: 'Archivo Black', category: 'display', fallback: 'sans-serif', google: true },  // heavy modern — electronics, gaming
    { name: 'Russo One', category: 'display', fallback: 'sans-serif', google: true },  // solid bold — automotive, tools
    { name: 'Barlow Condensed', category: 'display', fallback: 'sans-serif', google: true },  // compact retail — tight price-tag layouts
    { name: 'Big Shoulders Display', category: 'display', fallback: 'sans-serif', google: true }, // industrial bold — tools, machinery
    { name: 'Rajdhani', category: 'display', fallback: 'sans-serif', google: true },  // tech-forward — electronics, gaming PC
    { name: 'Exo 2', category: 'display', fallback: 'sans-serif', google: true },  // sci-fi modern — drones, gadgets
    { name: 'Orbitron', category: 'display', fallback: 'sans-serif', google: true },  // futuristic — gaming, tech, automotive
    { name: 'Unbounded', category: 'display', fallback: 'sans-serif', google: true },  // chunky geometric — streetwear, sneakers
    { name: 'Sora', category: 'display', fallback: 'sans-serif', google: true },  // modern rounded display — lifestyle
    { name: 'Abril Fatface', category: 'display', fallback: 'serif', google: true },       // editorial bold serif — magazines, luxury
    { name: 'Cinzel Decorative', category: 'display', fallback: 'serif', google: true },       // ornate Roman — awards, premium gifts
    { name: 'Righteous', category: 'display', fallback: 'sans-serif', google: true },  // retro-modern — vintage, lifestyle
    { name: 'Racing Sans One', category: 'display', fallback: 'sans-serif', google: true },  // speed/racing — automotive, sports gear
    { name: 'Pacifico', category: 'display', fallback: 'cursive', google: true },     // casual script — handmade, food, surf
    { name: 'Satisfy', category: 'display', fallback: 'cursive', google: true },     // elegant script — gifts, cards, wedding
    { name: 'Great Vibes', category: 'display', fallback: 'cursive', google: true },     // luxury script — jewellery, flowers, spa
=======
    { name: 'Arial',           category: 'system', fallback: 'Helvetica, sans-serif' },
    { name: 'Georgia',         category: 'system', fallback: 'serif' },
    { name: 'Verdana',         category: 'system', fallback: 'Geneva, sans-serif' },
    { name: 'Trebuchet MS',    category: 'system', fallback: 'Helvetica, sans-serif' },
    { name: 'Times New Roman', category: 'system', fallback: 'Times, serif' },
    { name: 'Tahoma',          category: 'system', fallback: 'sans-serif' },
    { name: 'Impact',          category: 'system', fallback: 'Charcoal, sans-serif' },

    // ── Clean modern sans — body copy, bullet lists, spec tables ────────────
    // Best for: all categories. Readable at small sizes on mobile.
    { name: 'Inter',             category: 'sans', fallback: 'sans-serif', google: true },  // free
    { name: 'Roboto',            category: 'sans', fallback: 'sans-serif', google: true },  // free
    { name: 'Open Sans',         category: 'sans', fallback: 'sans-serif', google: true },  // most-used web font, excellent descriptions
    { name: 'Lato',              category: 'sans', fallback: 'sans-serif', google: true },  // professional, warm — apparel, home goods
    { name: 'Poppins',           category: 'sans', fallback: 'sans-serif', google: true },  // rounded, modern — fashion, beauty, toys
    { name: 'Montserrat',        category: 'sans', fallback: 'sans-serif', google: true },  // strong geometric — all premium products
    { name: 'Raleway',           category: 'sans', fallback: 'sans-serif', google: true },  // elegant thin caps — fashion, jewellery headers
    { name: 'DM Sans',           category: 'sans', fallback: 'sans-serif', google: true },  // crisp modern — electronics, software
    { name: 'Plus Jakarta Sans', category: 'sans', fallback: 'sans-serif', google: true },  // contemporary — lifestyle, home decor
    { name: 'Nunito',            category: 'sans', fallback: 'sans-serif', google: true },  // rounded friendly — kids, toys, gifts
    { name: 'Manrope',           category: 'sans', fallback: 'sans-serif', google: true },  // geometric modern — tech accessories
    { name: 'Work Sans',         category: 'sans', fallback: 'sans-serif', google: true },  // editorial clean — tools, automotive parts
    { name: 'Josefin Sans',      category: 'sans', fallback: 'sans-serif', google: true },  // geometric elegant — fashion, vintage
    { name: 'Barlow',            category: 'sans', fallback: 'sans-serif', google: true },  // condensed-friendly — industrial, outdoor
    { name: 'Rubik',             category: 'sans', fallback: 'sans-serif', google: true },  // slightly rounded — consumer electronics
    { name: 'Quicksand',         category: 'sans', fallback: 'sans-serif', google: true },  // soft round — handmade, beauty, wellness
    { name: 'Space Grotesk',     category: 'sans', fallback: 'sans-serif', google: true },  // techy-modern — gadgets, gaming
    { name: 'IBM Plex Sans',     category: 'sans', fallback: 'sans-serif', google: true },  // crisp & technical — tools, parts, specs
    { name: 'Outfit',            category: 'sans', fallback: 'sans-serif', google: true },  // friendly modern — everyday products
    { name: 'Figtree',           category: 'sans', fallback: 'sans-serif', google: true },  // clean proportions — home & garden
    { name: 'Urbanist',          category: 'sans', fallback: 'sans-serif', google: true },  // minimal luxury — premium/brand listings
    { name: 'Mulish',            category: 'sans', fallback: 'sans-serif', google: true },  // lightweight clean — beauty, wellness
    { name: 'Lexend',            category: 'sans', fallback: 'sans-serif', google: true },  // readability-optimised — long descriptions

    // ── Elegant serifs — premium, luxury & editorial listings ────────────────
    // Best for: jewellery, watches, antiques, fashion, collectibles.
    { name: 'Playfair Display',   category: 'serif', fallback: 'serif', google: true },  // luxury editorial — jewellery, watches
    { name: 'Cormorant Garamond', category: 'serif', fallback: 'serif', google: true },  // ultra-luxury — fine art, couture, antiques
    { name: 'Cinzel',             category: 'serif', fallback: 'serif', google: true },  // Roman elegance — premium, collectibles
    { name: 'Bodoni Moda',        category: 'serif', fallback: 'serif', google: true },  // high-fashion editorial — clothing, bags
    { name: 'Lora',               category: 'serif', fallback: 'serif', google: true },  // warm readable — home goods, books, decor
    { name: 'Merriweather',       category: 'serif', fallback: 'serif', google: true },  // trustworthy — books, business items
    { name: 'Libre Baskerville',  category: 'serif', fallback: 'serif', google: true },  // classic professional — all categories
    { name: 'DM Serif Display',   category: 'serif', fallback: 'serif', google: true },  // bold editorial — sale headers, banners
    { name: 'Fraunces',           category: 'serif', fallback: 'serif', google: true },  // quirky premium — craft, artisan, vintage
    { name: 'Spectral',           category: 'serif', fallback: 'serif', google: true },  // refined narrow — compact listing layouts
    { name: 'Bitter',             category: 'serif', fallback: 'serif', google: true },  // slab-serif readable — tools, books
    { name: 'Italiana',           category: 'serif', fallback: 'serif', google: true },  // Italian fashion-forward — luxury apparel
    { name: 'Marcellus',          category: 'serif', fallback: 'serif', google: true },  // elegant small caps — jewellery, perfume

    // ── High-impact display — product headlines, sale banners, promo text ────
    // Best for: sale banners, product titles, section headers, promo blocks.
    { name: 'Oswald',            category: 'display', fallback: 'sans-serif', google: true },  // condensed strong — SALE, DEAL headers
    { name: 'Bebas Neue',        category: 'display', fallback: 'sans-serif', google: true },  // all-caps punch — discount banners
    { name: 'Anton',             category: 'display', fallback: 'sans-serif', google: true },  // bold impact — clearance, sports
    { name: 'Archivo Black',     category: 'display', fallback: 'sans-serif', google: true },  // heavy modern — electronics, gaming
    { name: 'Russo One',         category: 'display', fallback: 'sans-serif', google: true },  // solid bold — automotive, tools
    { name: 'Barlow Condensed',  category: 'display', fallback: 'sans-serif', google: true },  // compact retail — tight price-tag layouts
    { name: 'Big Shoulders Display', category: 'display', fallback: 'sans-serif', google: true }, // industrial bold — tools, machinery
    { name: 'Rajdhani',          category: 'display', fallback: 'sans-serif', google: true },  // tech-forward — electronics, gaming PC
    { name: 'Exo 2',             category: 'display', fallback: 'sans-serif', google: true },  // sci-fi modern — drones, gadgets
    { name: 'Orbitron',          category: 'display', fallback: 'sans-serif', google: true },  // futuristic — gaming, tech, automotive
    { name: 'Unbounded',         category: 'display', fallback: 'sans-serif', google: true },  // chunky geometric — streetwear, sneakers
    { name: 'Sora',              category: 'display', fallback: 'sans-serif', google: true },  // modern rounded display — lifestyle
    { name: 'Abril Fatface',     category: 'display', fallback: 'serif', google: true },       // editorial bold serif — magazines, luxury
    { name: 'Cinzel Decorative', category: 'display', fallback: 'serif', google: true },       // ornate Roman — awards, premium gifts
    { name: 'Righteous',         category: 'display', fallback: 'sans-serif', google: true },  // retro-modern — vintage, lifestyle
    { name: 'Racing Sans One',   category: 'display', fallback: 'sans-serif', google: true },  // speed/racing — automotive, sports gear
    { name: 'Pacifico',          category: 'display', fallback: 'cursive', google: true },     // casual script — handmade, food, surf
    { name: 'Satisfy',           category: 'display', fallback: 'cursive', google: true },     // elegant script — gifts, cards, wedding
    { name: 'Great Vibes',       category: 'display', fallback: 'cursive', google: true },     // luxury script — jewellery, flowers, spa
>>>>>>> f214a5499163156367e0cbba700f62394ddaf1d6

    // ── Elegant scripts — handmade, gifts, jewellery, wedding, luxury ───────
    // Best for: handmade goods, gift items, wedding accessories, jewellery, flowers.
    { name: 'Dancing Script', category: 'display', fallback: 'cursive', google: true },  // warm friendly script — #1 most-used script font
<<<<<<< HEAD
    { name: 'Allura', category: 'display', fallback: 'cursive', google: true },  // formal elegant — jewellery, stationery
    { name: 'Sacramento', category: 'display', fallback: 'cursive', google: true },  // thin elegant — luxury, wedding, spa
    { name: 'Alex Brush', category: 'display', fallback: 'cursive', google: true },  // refined — wedding gifts, luxury packaging
    { name: 'Tangerine', category: 'display', fallback: 'cursive', google: true },  // very thin — ultra-luxury, fine jewellery

    // ── Slab serifs & vintage display ────────────────────────────────────────
    // Best for: tools, books, vintage collectibles, rustic/craft items.
    { name: 'Alfa Slab One', category: 'display', fallback: 'serif', google: true },    // heavy slab — SALE banners, bold headers
    { name: 'Domine', category: 'serif', fallback: 'serif', google: true },    // readable slab — books, tools, products with manuals
    { name: 'Teko', category: 'display', fallback: 'sans-serif', google: true }, // condensed sport — fitness, activewear
    { name: 'Passion One', category: 'display', fallback: 'sans-serif', google: true }, // bold sport — outdoor, fitness, gym
    { name: 'Yeseva One', category: 'display', fallback: 'serif', google: true },    // vintage editorial — antiques, retro collectibles
    { name: 'Rye', category: 'display', fallback: 'serif', google: true },    // western vintage — cowboy, antique, rustic
    { name: 'Fredoka', category: 'display', fallback: 'sans-serif', google: true }, // rounded fun — kids, toys, baby products
    { name: 'Lobster', category: 'display', fallback: 'cursive', google: true },  // retro casual — food, drinks, casual goods
    { name: 'Poiret One', category: 'display', fallback: 'sans-serif', google: true }, // Art Deco — perfume, luxury vintage
    { name: 'Grandstander', category: 'display', fallback: 'cursive', google: true },  // playful bold — games, events, kids

    // ── More refined serifs ───────────────────────────────────────────────────
    // Best for: body text in premium/editorial listings, antiques, books.
    { name: 'Source Serif 4', category: 'serif', fallback: 'serif', google: true },  // beautiful readable — any description-heavy listing
    { name: 'Quattrocento', category: 'serif', fallback: 'serif', google: true },  // classic Roman — antiques, collectibles, art
=======
    { name: 'Allura',         category: 'display', fallback: 'cursive', google: true },  // formal elegant — jewellery, stationery
    { name: 'Sacramento',     category: 'display', fallback: 'cursive', google: true },  // thin elegant — luxury, wedding, spa
    { name: 'Alex Brush',     category: 'display', fallback: 'cursive', google: true },  // refined — wedding gifts, luxury packaging
    { name: 'Tangerine',      category: 'display', fallback: 'cursive', google: true },  // very thin — ultra-luxury, fine jewellery

    // ── Slab serifs & vintage display ────────────────────────────────────────
    // Best for: tools, books, vintage collectibles, rustic/craft items.
    { name: 'Alfa Slab One',  category: 'display', fallback: 'serif', google: true },    // heavy slab — SALE banners, bold headers
    { name: 'Domine',         category: 'serif',   fallback: 'serif', google: true },    // readable slab — books, tools, products with manuals
    { name: 'Teko',           category: 'display', fallback: 'sans-serif', google: true }, // condensed sport — fitness, activewear
    { name: 'Passion One',    category: 'display', fallback: 'sans-serif', google: true }, // bold sport — outdoor, fitness, gym
    { name: 'Yeseva One',     category: 'display', fallback: 'serif', google: true },    // vintage editorial — antiques, retro collectibles
    { name: 'Rye',            category: 'display', fallback: 'serif', google: true },    // western vintage — cowboy, antique, rustic
    { name: 'Fredoka',        category: 'display', fallback: 'sans-serif', google: true }, // rounded fun — kids, toys, baby products
    { name: 'Lobster',        category: 'display', fallback: 'cursive', google: true },  // retro casual — food, drinks, casual goods
    { name: 'Poiret One',     category: 'display', fallback: 'sans-serif', google: true }, // Art Deco — perfume, luxury vintage
    { name: 'Grandstander',   category: 'display', fallback: 'cursive', google: true },  // playful bold — games, events, kids

    // ── More refined serifs ───────────────────────────────────────────────────
    // Best for: body text in premium/editorial listings, antiques, books.
    { name: 'Source Serif 4',  category: 'serif', fallback: 'serif', google: true },  // beautiful readable — any description-heavy listing
    { name: 'Quattrocento',    category: 'serif', fallback: 'serif', google: true },  // classic Roman — antiques, collectibles, art
>>>>>>> f214a5499163156367e0cbba700f62394ddaf1d6
    { name: 'IM Fell English', category: 'serif', fallback: 'serif', google: true },  // old-print character — vintage, historical items

    // ── More clean sans-serifs ────────────────────────────────────────────────
    // Best for: sellers who want a clean look beyond Inter/Roboto.
<<<<<<< HEAD
    { name: 'Nunito Sans', category: 'sans', fallback: 'sans-serif', google: true },  // professional sibling of Nunito
    { name: 'Chivo', category: 'sans', fallback: 'sans-serif', google: true },  // editorial versatile — books, stationery, office
    { name: 'Be Vietnam Pro', category: 'sans', fallback: 'sans-serif', google: true },  // modern clean — lifestyle, home goods
    { name: 'Instrument Sans', category: 'sans', fallback: 'sans-serif', google: true },  // crisp professional — premium brand listings
    { name: 'Saira Condensed', category: 'sans', fallback: 'sans-serif', google: true },  // compact industrial — auto parts, machinery

    // ── Monospace — specs, measurements, part numbers, code/model IDs ────────
    // Best for: electronics, auto parts, tools — anywhere you list SKUs or specs.
    { name: 'IBM Plex Mono', category: 'mono', fallback: 'monospace', google: true },  // cleanest mono for spec tables
    { name: 'Roboto Mono', category: 'mono', fallback: 'monospace', google: true },  // familiar, legible part numbers
    { name: 'Inconsolata', category: 'mono', fallback: 'monospace', google: true },  // compact, great for dense specs
    { name: 'Courier Prime', category: 'mono', fallback: 'monospace', google: true },  // typewriter warmth — vintage listings
=======
    { name: 'Nunito Sans',    category: 'sans', fallback: 'sans-serif', google: true },  // professional sibling of Nunito
    { name: 'Chivo',          category: 'sans', fallback: 'sans-serif', google: true },  // editorial versatile — books, stationery, office
    { name: 'Be Vietnam Pro', category: 'sans', fallback: 'sans-serif', google: true },  // modern clean — lifestyle, home goods
    { name: 'Instrument Sans',category: 'sans', fallback: 'sans-serif', google: true },  // crisp professional — premium brand listings
    { name: 'Saira Condensed',category: 'sans', fallback: 'sans-serif', google: true },  // compact industrial — auto parts, machinery

    // ── Monospace — specs, measurements, part numbers, code/model IDs ────────
    // Best for: electronics, auto parts, tools — anywhere you list SKUs or specs.
    { name: 'IBM Plex Mono',  category: 'mono', fallback: 'monospace', google: true },  // cleanest mono for spec tables
    { name: 'Roboto Mono',    category: 'mono', fallback: 'monospace', google: true },  // familiar, legible part numbers
    { name: 'Inconsolata',    category: 'mono', fallback: 'monospace', google: true },  // compact, great for dense specs
    { name: 'Courier Prime',  category: 'mono', fallback: 'monospace', google: true },  // typewriter warmth — vintage listings
>>>>>>> f214a5499163156367e0cbba700f62394ddaf1d6
]

// ─────────────────────────────────────────────────────────────────────────────
// ON-DEMAND FONT LOADER (No Page Lag)
// ─────────────────────────────────────────────────────────────────────────────
const loadedFonts = new Set<string>()

export function loadFont(fontName: string, targetDoc: Document = document) {
    if (!fontName) return
    const font = FONT_REGISTRY.find(f => f.name.toLowerCase() === fontName.toLowerCase())
    if (!font || !font.google) return

    const fontKey = font.name.replace(/\s+/g, '+')

    try {
        const linkId = `google-font-${fontKey}`
        // Always check the TARGET document — iframes are separate documents and
        // the global loadedFonts guard was causing fonts to never load into
        // remounted iframes (they start fresh each time).
        if (!targetDoc.getElementById(linkId)) {
            const link = targetDoc.createElement('link')
            link.id = linkId
            link.rel = 'stylesheet'
            link.href = `https://fonts.googleapis.com/css2?family=${fontKey}:wght@400;600;700;800;900&display=swap`
            targetDoc.head.appendChild(link)
        }
        loadedFonts.add(fontKey)
    } catch (e) {
        // Guard for iframe contexts
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS STACK RESOLVER (With Safe eBay Fallback)
// ─────────────────────────────────────────────────────────────────────────────
export function getFontStack(fontName: string): string {
    if (!fontName) return 'Arial, Helvetica, sans-serif'
    const font = FONT_REGISTRY.find(f => f.name.toLowerCase() === fontName.toLowerCase())
    if (!font) return `"${fontName}", Arial, sans-serif`
    return `"${font.name}", ${font.fallback}`
}

// ─────────────────────────────────────────────────────────────────────────────
// IFRAME HTML FONT LINK BUILDER
// Returns a <link> tag string to embed directly inside an iframe's <head>
// so the font is available immediately when the iframe mounts — no JS injection.
// ─────────────────────────────────────────────────────────────────────────────
export function getGoogleFontLinkHtml(fontStack: string): string {
    if (!fontStack) return ''
    // Extract font name from stack like '"Poppins", sans-serif' or 'Arial, Helvetica'
    const match = fontStack.match(/^["']?([^"',]+)["']?/)
    if (!match) return ''
    const fontName = match[1].trim()
    const font = FONT_REGISTRY.find(f => f.name.toLowerCase() === fontName.toLowerCase())
    if (!font?.google) return '' // system fonts need no link
    const fontKey = font.name.replace(/\s+/g, '+')
    return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${fontKey}:wght@400;600;700;800;900&display=swap">`
}
