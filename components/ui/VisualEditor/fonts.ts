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
// 100+ CURATED FONT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const FONT_REGISTRY: FontDefinition[] = [
    // ── Classic Web-Safe System Fonts (No download required) ──
    { name: 'Arial', category: 'system', fallback: 'Helvetica, sans-serif' },
    { name: 'Georgia', category: 'system', fallback: 'serif' },
    { name: 'Verdana', category: 'system', fallback: 'Geneva, sans-serif' },
    { name: 'Trebuchet MS', category: 'system', fallback: 'Helvetica, sans-serif' },
    { name: 'Times New Roman', category: 'system', fallback: 'Times, serif' },
    { name: 'Courier New', category: 'system', fallback: 'monospace' },
    { name: 'Tahoma', category: 'system', fallback: 'sans-serif' },
    { name: 'Impact', category: 'system', fallback: 'Charcoal, sans-serif' },

    // ── Modern Clean Sans-Serif ──
    { name: 'Inter', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Roboto', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Poppins', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Montserrat', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Open Sans', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Lato', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'DM Sans', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Plus Jakarta Sans', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Nunito', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Raleway', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Work Sans', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Ubuntu', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Rubik', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Manrope', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Syne', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Outfit', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Public Sans', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Barlow', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Quicksand', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Kanit', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Cabin', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Jost', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Heebo', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Karla', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Mukta', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'PT Sans', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Fira Sans', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Noto Sans', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Hanken Grotesk', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Red Hat Display', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Figtree', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Albert Sans', category: 'sans', fallback: 'sans-serif', google: true },
    { name: 'Lexend', category: 'sans', fallback: 'sans-serif', google: true },

    // ── Luxury & Editorial Serif ──
    { name: 'Playfair Display', category: 'serif', fallback: 'serif', google: true },
    { name: 'Merriweather', category: 'serif', fallback: 'serif', google: true },
    { name: 'Lora', category: 'serif', fallback: 'serif', google: true },
    { name: 'Cormorant Garamond', category: 'serif', fallback: 'serif', google: true },
    { name: 'Cinzel', category: 'serif', fallback: 'serif', google: true },
    { name: 'Bodoni Moda', category: 'serif', fallback: 'serif', google: true },
    { name: 'Libre Baskerville', category: 'serif', fallback: 'serif', google: true },
    { name: 'EB Garamond', category: 'serif', fallback: 'serif', google: true },
    { name: 'Prata', category: 'serif', fallback: 'serif', google: true },
    { name: 'Marcellus', category: 'serif', fallback: 'serif', google: true },
    { name: 'Castoro', category: 'serif', fallback: 'serif', google: true },
    { name: 'Fraunces', category: 'serif', fallback: 'serif', google: true },
    { name: 'DM Serif Display', category: 'serif', fallback: 'serif', google: true },
    { name: 'Cinel Decorative', category: 'serif', fallback: 'serif', google: true },
    { name: 'Cardo', category: 'serif', fallback: 'serif', google: true },
    { name: 'Vollkorn', category: 'serif', fallback: 'serif', google: true },
    { name: 'Newsreader', category: 'serif', fallback: 'serif', google: true },
    { name: 'Spectral', category: 'serif', fallback: 'serif', google: true },
    { name: 'Bitter', category: 'serif', fallback: 'serif', google: true },
    { name: 'Old Standard TT', category: 'serif', fallback: 'serif', google: true },
    { name: 'Faustina', category: 'serif', fallback: 'serif', google: true },
    { name: 'Frank Ruhl Libre', category: 'serif', fallback: 'serif', google: true },

    // ── High-Impact Retail & Headline Display ──
    { name: 'Oswald', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Bebas Neue', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Anton', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Archivo Black', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Teko', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Righteous', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Russo One', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Alfa Slab One', category: 'display', fallback: 'serif', google: true },
    { name: 'Changa One', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Staatliches', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Bungee', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Abril Fatface', category: 'display', fallback: 'serif', google: true },
    { name: 'Cinzel Decorative', category: 'display', fallback: 'serif', google: true },
    { name: 'Unbounded', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Audiowide', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Orbitron', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Cabinet Grotesk', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Clash Display', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Sora', category: 'display', fallback: 'sans-serif', google: true },
    { name: 'Kalam', category: 'display', fallback: 'cursive', google: true },
    { name: 'Caveat', category: 'display', fallback: 'cursive', google: true },
    { name: 'Permanent Marker', category: 'display', fallback: 'cursive', google: true },
    { name: 'Lobster', category: 'display', fallback: 'cursive', google: true },
    { name: 'Pacifico', category: 'display', fallback: 'cursive', google: true },
    { name: 'Satisfy', category: 'display', fallback: 'cursive', google: true },
    { name: 'Great Vibes', category: 'display', fallback: 'cursive', google: true },

    // ── Tech, Tools & Automotive Monospace ──
    { name: 'JetBrains Mono', category: 'mono', fallback: 'monospace', google: true },
    { name: 'Fira Code', category: 'mono', fallback: 'monospace', google: true },
    { name: 'Roboto Mono', category: 'mono', fallback: 'monospace', google: true },
    { name: 'Space Mono', category: 'mono', fallback: 'monospace', google: true },
    { name: 'Inconsolata', category: 'mono', fallback: 'monospace', google: true },
    { name: 'Source Code Pro', category: 'mono', fallback: 'monospace', google: true },
    { name: 'IBM Plex Mono', category: 'mono', fallback: 'monospace', google: true },
    { name: 'Ubuntu Mono', category: 'mono', fallback: 'monospace', google: true },
    { name: 'Courier Prime', category: 'mono', fallback: 'monospace', google: true },
    { name: 'Share Tech Mono', category: 'mono', fallback: 'monospace', google: true },
    { name: 'VT323', category: 'mono', fallback: 'monospace', google: true },
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
    if (loadedFonts.has(fontKey)) return

    try {
        const linkId = `google-font-${fontKey}`
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
