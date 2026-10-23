// app/share/template/[id]/page.tsx
// Public shared template preview page — no login required
// URL: riazify.com/share/template/[id]

import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { LinkIcon, ShieldCheck, Eye, Tag, Calendar, ArrowRight, LayoutTemplate } from 'lucide-react'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
    params: { id: string }
}

// -- Riazify Color Role Tokens (v2.0) --
const T = {
    primary: '#7530fb',
    primaryHover: '#6020e0',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    accentHover: '#a3e635',
    dark: '#1e1535',
    darkHover: '#2d1f4e',
    darkCard: '#271c42',
    border: '#ede9fe',
    bg: '#f8f7ff',
    surface: '#ffffff',
    text: '#1f1d2e',
    textDark: '#1e1535',
    muted: '#6b7280',
    textLight: '#a89cc8',
}

const CATEGORY_LABELS: Record<string, string> = {
    general: 'General',
    consumer_electronics: 'Consumer Electronics',
    clothing: 'Clothing & Fashion',
    home_garden: 'Home & Garden',
    motors_parts: 'Motors & Parts',
    collectibles: 'Collectibles',
    sporting_goods: 'Sporting Goods',
    books_movies: 'Books & Media',
    // Legacy slugs
    electronics: 'Consumer Electronics',
    fashion: 'Clothing & Fashion',
    home: 'Home & Garden',
    auto: 'Motors & Parts',
    sports: 'Sporting Goods',
    books: 'Books & Media',
}

function formatDate(iso: string | null) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default async function SharedTemplatePage({ params }: Props) {
    // Fetch template — try listing_templates first, then visual_templates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    let data: {
        id: string; name: string; description: string | null;
        category: string | null; description_html: string | null;
        use_count: number | null; created_at: string | null;
        is_system?: boolean | null;
    } | null = null

    // 1. listing_templates (HTML editor / system templates)
    const { data: lt } = await db
        .from('listing_templates')
        .select('id, name, description, category, description_html, use_count, created_at, is_system')
        .eq('id', params.id)
        .eq('is_shared', true)
        .single()

    if (lt) {
        data = lt
    } else {
        // 2. visual_templates (Visual Builder templates) — use pre-assembled share_html
        const { data: vt } = await db
            .from('visual_templates')
            .select('id, name, description, category, share_html, use_count, created_at')
            .eq('id', params.id)
            .eq('is_shared', true)
            .single()

        if (vt) {
            data = {
                id: vt.id,
                name: vt.name,
                description: vt.description ?? 'Visual Builder template',
                category: vt.category,
                description_html: vt.share_html ?? null,
                use_count: vt.use_count,
                created_at: vt.created_at,
                is_system: false,
            }
        }
    }

    // ── Not Found ────────────────────────────────────────────────────────────
    if (!data) {
        return (
            <div style={{
                fontFamily: "'DM Sans', sans-serif",
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
            }}>
                <div style={{
                    maxWidth: 440,
                    width: '100%',
                    textAlign: 'center',
                    padding: '48px 40px',
                }}>
                    <div style={{ margin: '0 auto 20px', display: 'inline-flex' }}>
                        <LinkIcon size={28} color={T.primary} />
                    </div>
                    <h1 style={{
                        fontSize: 22, fontWeight: 800, color: T.textDark,
                        marginBottom: 10, letterSpacing: '-0.02em',
                    }}>
                        Template Not Available
                    </h1>
                    <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 28 }}>
                        This template link is no longer active, or the owner has made it private.
                    </p>
                    <Link href="/" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: T.primary, color: '#fff',
                        padding: '12px 24px', borderRadius: 12,
                        fontWeight: 700, fontSize: 14, textDecoration: 'none',
                    }}>
                        Go to Riazify <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        )
    }

    const template = data
    const categoryLabel = CATEGORY_LABELS[template.category ?? 'general'] ?? 'General'
    const hasHtml = !!(template.description_html && template.description_html.trim().length > 0)

    // ── Main Page ────────────────────────────────────────────────────────────
    return (
        <div style={{
            fontFamily: "'DM Sans', sans-serif",
            minHeight: '100vh',
            background: T.bg,
        }}>
            {/* Top nav bar */}
            <header style={{
                background: T.surface,
                borderBottom: `1px solid ${T.border}`,
                padding: '0 24px',
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 50,
            }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: T.primary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <LayoutTemplate size={16} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 16, color: T.textDark, letterSpacing: '-0.02em' }}>
                        Riazify
                    </span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Link href="/login" style={{
                        fontSize: 13, fontWeight: 600, color: T.primary,
                        textDecoration: 'none', padding: '6px 14px',
                        border: `1.5px solid ${T.border}`, borderRadius: 8,
                    }}>
                        Sign in
                    </Link>
                    <Link href="/signup" style={{
                        fontSize: 13, fontWeight: 700, color: T.dark,
                        textDecoration: 'none', padding: '6px 16px',
                        background: T.accent, borderRadius: 8,
                    }}>
                        Get started free
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 64px' }}>

                {/* Template header */}
                <div style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 20,
                    padding: '28px 32px',
                    marginBottom: 24,
                    boxShadow: '0 2px 16px rgba(117,48,251,0.06)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Category badge */}
                            <div style={{ marginBottom: 10 }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                                    textTransform: 'uppercase', color: T.primary,
                                    background: T.primaryLight,
                                    padding: '4px 10px', borderRadius: 6,
                                    border: `1px solid ${T.border}`,
                                }}>
                                    {categoryLabel}
                                </span>
                            </div>

                            <h1 style={{
                                fontSize: 26, fontWeight: 800, color: T.textDark,
                                letterSpacing: '-0.025em', marginBottom: 8,
                                lineHeight: 1.2,
                            }}>
                                {template.name}
                            </h1>

                            {template.description && (
                                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 0 }}>
                                    {template.description}
                                </p>
                            )}
                        </div>

                        {/* CTA block */}
                        <div style={{ flexShrink: 0 }}>
                            <Link href="/signup" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: T.primary, color: '#fff',
                                padding: '13px 22px', borderRadius: 12,
                                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                                boxShadow: `0 4px 16px rgba(117,48,251,0.3)`,
                                whiteSpace: 'nowrap',
                            }}>
                                Use this template <ArrowRight size={15} />
                            </Link>
                            <p style={{ fontSize: 11, color: T.textLight, textAlign: 'center', marginTop: 6 }}>
                                Free account · No credit card
                            </p>
                        </div>
                    </div>

                    {/* Meta row */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 20,
                        marginTop: 20, paddingTop: 20,
                        borderTop: `1px solid ${T.border}`,
                        flexWrap: 'wrap',
                    }}>
                        {template.use_count != null && template.use_count > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.muted, fontSize: 13 }}>
                                <Eye size={14} color={T.textLight} />
                                <span><strong style={{ color: T.text }}>{template.use_count.toLocaleString()}</strong> uses</span>
                            </div>
                        )}
                        {template.created_at && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.muted, fontSize: 13 }}>
                                <Calendar size={14} color={T.textLight} />
                                <span>Created {formatDate(template.created_at)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.muted, fontSize: 13 }}>
                            <Tag size={14} color={T.textLight} />
                            <span>{categoryLabel}</span>
                        </div>
                        <div style={{
                            marginLeft: 'auto',
                            display: 'flex', alignItems: 'center', gap: 5,
                            fontSize: 12, color: T.textLight,
                        }}>
                            <ShieldCheck size={13} color={T.textLight} />
                            Shared via Riazify Design Studio
                        </div>
                    </div>
                </div>

                {/* HTML Preview */}
                {hasHtml ? (
                    <div style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 20,
                        overflow: 'hidden',
                        boxShadow: '0 2px 16px rgba(117,48,251,0.06)',
                    }}>
                        {/* Preview header bar */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 20px',
                            borderBottom: `1px solid ${T.border}`,
                            background: T.bg,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
                                </div>
                                <span style={{ fontSize: 12, color: T.textLight, marginLeft: 8, fontWeight: 500 }}>
                                    Template Preview
                                </span>
                            </div>
                            <span style={{ fontSize: 11, color: T.textLight }}>
                                eBay Listing Template
                            </span>
                        </div>

                        {/* iframe sandbox */}
                        <iframe
                            srcDoc={template.description_html ?? undefined}
                            sandbox="allow-same-origin"
                            style={{
                                width: '100%',
                                height: '700px',
                                border: 'none',
                                display: 'block',
                                background: '#fff',
                            }}
                            title={`Preview of ${template.name}`}
                        />
                    </div>
                ) : (
                    <div style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 20,
                        padding: '64px 32px',
                        textAlign: 'center',
                        color: T.muted,
                        fontSize: 14,
                    }}>
                        <LayoutTemplate size={40} color={T.border} style={{ margin: '0 auto 12px' }} />
                        <p style={{ margin: 0 }}>No preview available for this template.</p>
                    </div>
                )}

                {/* Bottom CTA banner */}
                <div style={{
                    marginTop: 32,
                    background: `linear-gradient(135deg, ${T.dark} 0%, #2d1f4e 100%)`,
                    borderRadius: 20,
                    padding: '36px 40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 24,
                    flexWrap: 'wrap',
                }}>
                    <div>
                        <h2 style={{
                            fontSize: 20, fontWeight: 800, color: '#fff',
                            letterSpacing: '-0.02em', marginBottom: 6,
                        }}>
                            Want to use this template?
                        </h2>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                            Join Riazify to access this and hundreds of eBay listing templates — free.
                        </p>
                    </div>
                    <Link href="/signup" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: T.accent, color: T.dark,
                        padding: '14px 28px', borderRadius: 12,
                        fontWeight: 800, fontSize: 14, textDecoration: 'none',
                        whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                        Create free account <ArrowRight size={16} />
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                borderTop: `1px solid ${T.border}`,
                padding: '20px 24px',
                textAlign: 'center',
                fontSize: 12,
                color: T.textLight,
                background: T.surface,
            }}>
                <span>Powered by </span>
                <Link href="/" style={{ color: T.primary, fontWeight: 700, textDecoration: 'none' }}>
                    Riazify
                </Link>
                <span> · eBay Listing Template Designer</span>
            </footer>
        </div>
    )
}
