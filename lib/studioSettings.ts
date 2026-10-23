// lib/studioSettings.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared utility — load Design Studio Settings from user_settings.design_studio
// ─────────────────────────────────────────────────────────────────────────────

export interface DesignStudioSettings {
    // Store Branding
    storeName: string
    storeLogoUrl: string
    primaryColour: string
    secondaryColour: string
    // eBay Defaults
    returnPeriod: string
    shippingText: string
    vatNumber: string
    ebayStoreUrl: string
    // Template Defaults
    defaultCategory: string
    canvasWidth: string
    defaultBgColour: string
    defaultFont: string
    // Editor Preferences
    autoSave: boolean
    defaultDevice: string
    showLineNumbers: boolean
    tabSize: string
    // Export
    includeComments: boolean
    minifyHtml: boolean
    addBranding: boolean
}

export const STUDIO_SETTINGS_DEFAULTS: DesignStudioSettings = {
    storeName: '',
    storeLogoUrl: '',
    primaryColour: '#7530fb',
    secondaryColour: '#b8fa33',
    returnPeriod: '30',
    shippingText: 'Free UK Shipping',
    vatNumber: '',
    ebayStoreUrl: '',
    defaultCategory: 'general',
    canvasWidth: '700',
    defaultBgColour: '#ffffff',
    defaultFont: 'Arial, Helvetica, sans-serif',
    autoSave: true,
    defaultDevice: 'desktop',
    showLineNumbers: true,
    tabSize: '2',
    includeComments: false,
    minifyHtml: false,
    addBranding: false,
}

/**
 * Load the user's Design Studio settings from Supabase.
 * Returns merged settings (DB values over defaults).
 * Never throws — returns defaults on any error.
 */
export async function fetchStudioSettings(): Promise<DesignStudioSettings> {
    try {
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return STUDIO_SETTINGS_DEFAULTS
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
            .from('user_settings')
            .select('design_studio')
            .eq('id', user.id)
            .single()
        if (data?.design_studio && Object.keys(data.design_studio).length > 0) {
            return { ...STUDIO_SETTINGS_DEFAULTS, ...(data.design_studio as Partial<DesignStudioSettings>) }
        }
    } catch {
        // Network/auth error — fall through to defaults
    }
    return STUDIO_SETTINGS_DEFAULTS
}

/**
 * Maps a StudioSettings defaultCategory value to the visual-editor / listing_templates
 * category values (which use longer slugs like 'consumer_electronics').
 */
export function mapStudioCategory(studioCategory: string): string {
    const MAP: Record<string, string> = {
        general: 'general',
        electronics: 'consumer_electronics',
        fashion: 'clothing',
        home: 'home_garden',
        auto: 'motors_parts',
        collectibles: 'collectibles',
        sports: 'sporting_goods',
        books: 'books_movies',
    }
    return MAP[studioCategory] ?? 'general'
}
