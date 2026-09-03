'use client'
// components/ui/AiTemplateGenerator.tsx

import { useState, useRef } from 'react'
import {
    X, Zap, RefreshCw, Save, Check,
    Loader2, ChevronLeft,
    Monitor, Tablet, Smartphone,
    FileCode2, Layers,
    Cpu, Shirt, Trophy, Home, Wrench,
    Dumbbell, BookOpen, PawPrint, Gamepad2, Package,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AIButton } from '@/components/ui/Buttons'

const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    accent: '#b8fa33',
    success: '#16a34a',
    successBg: '#dcfce7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
}

const CATEGORIES = [
    { id: 'electronics', label: 'Electronics', icon: Cpu },
    { id: 'fashion', label: 'Fashion', icon: Shirt },
    { id: 'collectibles', label: 'Collectibles', icon: Trophy },
    { id: 'home', label: 'Home & Garden', icon: Home },
    { id: 'auto', label: 'Auto Parts', icon: Wrench },
    { id: 'sports', label: 'Sports', icon: Dumbbell },
    { id: 'books', label: 'Books & Media', icon: BookOpen },
    { id: 'pets', label: 'Pet Supplies', icon: PawPrint },
    { id: 'toys', label: 'Toys & Games', icon: Gamepad2 },
    { id: 'general', label: 'General', icon: Package },
]

const STYLES = [
    { id: 'professional', label: 'Professional', desc: 'Clean, corporate, trustworthy' },
    { id: 'friendly', label: 'Friendly', desc: 'Warm, approachable, casual' },
    { id: 'luxury', label: 'Luxury', desc: 'Premium, dark, elegant' },
    { id: 'minimal', label: 'Minimal', desc: 'Simple, clean, whitespace' },
    { id: 'bold', label: 'Bold & Sales', desc: 'High-energy, conversion-focused' },
    { id: 'vintage', label: 'Vintage', desc: 'Classic, retro, collectors style' },
]

const SECTIONS = [
    { id: 'product_image', label: 'Product Image', default: true },
    { id: 'product_title', label: 'Product Title', default: true },
    { id: 'price_block', label: 'Price Block', default: true },
    { id: 'key_features', label: 'Key Features', default: true },
    { id: 'product_desc', label: 'Product Description', default: true },
    { id: 'specs_table', label: 'Specs Table', default: true },
    { id: 'key_specs', label: 'Key Specs Summary', default: false },
    { id: 'trust_badges', label: 'Trust Badges', default: true },
    { id: 'why_buy', label: 'Why Buy From Us', default: true },
    { id: 'money_back', label: 'Money Back Guarantee', default: false },
    { id: 'shipping_info', label: 'Shipping Info', default: true },
    { id: 'dispatch_info', label: 'Dispatch Info', default: false },
    { id: 'returns_policy', label: 'Returns Policy', default: true },
    { id: 'seller_info', label: 'Seller Info', default: false },
    { id: 'cta_banner', label: 'CTA Banner', default: true },
    { id: 'store_header', label: 'Store Header', default: false },
    { id: 'compatibility', label: 'Compatibility', default: false },
    { id: 'bundle_deal', label: 'Bundle Deal', default: false },
    { id: 'video_placeholder', label: 'Video Placeholder', default: false },
    { id: 'payment_methods', label: 'Payment Methods', default: false },
    { id: 'whats_in_box', label: "What's In The Box", default: false },
    { id: 'condition_notes', label: 'Condition Details', default: false },
    { id: 'authenticity', label: 'Authenticity Badge', default: false },
]

const DEVICES = [
    { id: 'desktop', icon: Monitor, label: 'Desktop', width: '700px' },
    { id: 'tablet', icon: Tablet, label: 'Tablet', width: '480px' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '375px' },
] as const
type DeviceId = typeof DEVICES[number]['id']

interface Props {
    open: boolean
    onClose: () => void
    onImport: (html: string, name: string, category: string) => void
}

function wrapForPreview(html: string): string {
    if (html.trim().toLowerCase().startsWith('<!doctype')) return html
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1f1d2e;background:#fff;}img{max-width:100%;height:auto;display:block;}table{border-collapse:collapse;}</style></head><body>${html}</body></html>`
}

export default function AiTemplateGenerator({ open, onClose, onImport }: Props) {
    const router = useRouter()
    const supabase = createClient()

    const [step, setStep] = useState<'input' | 'generating' | 'review'>('input')
    const [category, setCategory] = useState('electronics')
    const [style, setStyle] = useState('professional')
    const [sections, setSections] = useState<Set<string>>(
        new Set(SECTIONS.filter(s => s.default).map(s => s.id))
    )
    const [notes, setNotes] = useState('')
    const [html, setHtml] = useState('')
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState('')
    const [device, setDevice] = useState<DeviceId>('desktop')
    const [templateName, setTemplateName] = useState('')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const abortRef = useRef<AbortController | null>(null)

    if (!open) return null

    function toggleSection(id: string) {
        setSections(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    function buildPrompt(): string {
        const cat = CATEGORIES.find(c => c.id === category)?.label ?? category
        const sty = STYLES.find(s => s.id === style)?.label ?? style
        const secs = SECTIONS.filter(s => sections.has(s.id)).map(s => s.label).join(', ')
        const note = notes.trim() ? `\n\nSpecial instructions: ${notes.trim()}` : ''

        return `You are an expert eBay listing HTML template designer for Riazify.

Generate a complete, professional, eBay-safe HTML listing template with these specifications:

CATEGORY: ${cat}
STYLE: ${sty}
SECTIONS TO INCLUDE: ${secs}
BRAND COLOURS: Primary #7530fb (purple), Accent #b8fa33 (lime green), Dark #1e1535${note}

STRICT RULES — follow every single one:
1. Return ONLY raw HTML — no explanation, no markdown, no code blocks, no backticks
2. Start with <!DOCTYPE html> and include full <html><head><body> structure
3. Table-based layout ONLY — use <table><tr><td> for all layout, never div/flexbox/grid
4. All CSS must be INLINE on each element — no <style> tags, no classes
5. No JavaScript of any kind
6. No external fonts, images or resources
7. Max width 700px, centered with align="center"
8. Use these EXACT placeholders (double curly braces): {{PRODUCT_TITLE}}, {{ITEM_PRICE}}, {{ITEM_DESCRIPTION}}, {{MAIN_IMAGE_URL}}, {{ITEM_CONDITION}}, {{BRAND}}, {{SELLER_NAME}}, {{SHIPPING_INFO}}, {{RETURNS_PERIOD}}
9. Font: Arial, Helvetica, sans-serif everywhere
10. Make it visually impressive — use brand colours, spacing, borders strategically
11. eBay policy compliant — no active content, no scripts, no iframes`
    }

    async function generate() {
        setStep('generating')
        setHtml('')
        setError('')
        setProgress(10)

        const cat = CATEGORIES.find(c => c.id === category)?.label ?? category
        const sty = STYLES.find(s => s.id === style)?.label ?? style
        setTemplateName(`${cat} — ${sty} Template`)

        abortRef.current = new AbortController()

        // Fake progress while waiting for Gemini (no streaming)
        const progressInterval = setInterval(() => {
            setProgress(p => p < 85 ? p + 5 : p)
        }, 800)

        try {
            const res = await fetch('/api/ai/design-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: buildPrompt() }),
                signal: abortRef.current.signal,
            })

            clearInterval(progressInterval)

            if (!res.ok) {
                throw new Error('Template generation is temporarily unavailable. Please try again in a moment.')
            }

            const data = await res.json()
            const generated = data.html ?? data.template ?? data.content ?? ''
            if (!generated) throw new Error('Something went wrong. Please try again.')

            // Strip any markdown backticks if AI adds them
            const clean = generated
                .replace(/^```html?\n?/i, '')
                .replace(/\n?```$/i, '')
                .trim()

            setHtml(clean)
            setProgress(100)
            setStep('review')
        } catch (err) {
            clearInterval(progressInterval)
            if ((err as Error).name === 'AbortError') return
            setError('Template generation is temporarily unavailable. Please try again in a moment.')
            setStep('input')
        }
    }

    async function saveTemplate() {
        if (!templateName.trim() || !html) return
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('listing_templates') as any).insert({
                user_id: user.id,
                name: templateName,
                category,
                description_html: html,
                is_system: false,
                is_shared: false,
                use_count: 0,
                created_at: new Date().toISOString(),
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (e) {
            console.error('Save failed:', e)
        } finally {
            setSaving(false)
        }
    }

    function reset() {
        setStep('input')
        setHtml('')
        setError('')
        setProgress(0)
        setSaved(false)
    }

    const previewWidth = DEVICES.find(d => d.id === device)?.width ?? '700px'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => step !== 'generating' && onClose()}>
            <div className="w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl"
                style={{ maxWidth: step === 'review' ? 1100 : 680, maxHeight: '92vh', backgroundColor: C.surface, animation: 'modalIn 0.2s ease' }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7530fb 0%, #1e1535 100%)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(184,250,51,0.2)' }}>
                            <Zap size={16} style={{ color: C.accent }} />
                        </div>
                        <div>
                            <p className="text-[15px] font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                                AI Template Generator
                            </p>
                            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'DM Sans, sans-serif' }}>
                                {step === 'input' && 'Configure your template'}
                                {step === 'generating' && 'Generating your template...'}
                                {step === 'review' && 'Review and save your template'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => step !== 'generating' && onClose()}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70 transition-all"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}>
                        <X size={14} style={{ color: '#fff' }} />
                    </button>
                </div>

                {/* Step 1: Input */}
                {step === 'input' && (
                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

                        {/* Category */}
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-wider mb-3"
                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                What are you selling?
                            </p>
                            <div className="grid grid-cols-5 gap-2">
                                {CATEGORIES.map(cat => {
                                    const Icon = cat.icon
                                    const active = category === cat.id
                                    return (
                                        <button key={cat.id} onClick={() => setCategory(cat.id)}
                                            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all hover:opacity-90"
                                            style={{
                                                backgroundColor: active ? C.primary : C.bg,
                                                border: `2px solid ${active ? C.primary : C.border}`,
                                                cursor: 'pointer',
                                            }}>
                                            <Icon size={18} style={{ color: active ? '#fff' : C.primary }} />
                                            <span className="text-[10px] font-semibold text-center leading-tight"
                                                style={{ color: active ? '#fff' : C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                                {cat.label}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Style */}
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-wider mb-3"
                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Style &amp; Tone
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {STYLES.map(s => (
                                    <button key={s.id} onClick={() => setStyle(s.id)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:opacity-90"
                                        style={{
                                            backgroundColor: style === s.id ? C.primaryLight : C.bg,
                                            border: `2px solid ${style === s.id ? C.primary : C.border}`,
                                            cursor: 'pointer',
                                        }}>
                                        <div className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: style === s.id ? C.primary : C.border }} />
                                        <div>
                                            <p className="text-[13px] font-semibold"
                                                style={{ color: style === s.id ? C.primary : C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                                {s.label}
                                            </p>
                                            <p className="text-[11px]"
                                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                {s.desc}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sections */}
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-wider mb-3"
                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Sections to include
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {SECTIONS.map(s => {
                                    const on = sections.has(s.id)
                                    return (
                                        <button key={s.id} onClick={() => toggleSection(s.id)}
                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all hover:opacity-90"
                                            style={{
                                                backgroundColor: on ? C.primaryLight : C.bg,
                                                border: `1.5px solid ${on ? C.primary : C.border}`,
                                                cursor: 'pointer',
                                            }}>
                                            <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: on ? C.primary : C.surface, border: `1.5px solid ${on ? C.primary : C.border}` }}>
                                                {on && <Check size={10} style={{ color: '#fff' }} />}
                                            </div>
                                            <span className="text-[11px] font-semibold"
                                                style={{ color: on ? C.primary : C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                                {s.label}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-wider mb-2"
                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Anything specific?{' '}
                                <span style={{ color: C.border, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                                    optional
                                </span>
                            </p>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="e.g. Include a grading scale for condition, add provenance section, use dark background for header..."
                                rows={3}
                                className="w-full text-[13px] px-3 py-2.5 rounded-xl outline-none resize-none transition-all"
                                style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                                onFocus={e => e.currentTarget.style.borderColor = C.primary}
                                onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl"
                                style={{ backgroundColor: C.dangerBg, border: `1px solid ${C.danger}30` }}>
                                <X size={13} style={{ color: C.danger, flexShrink: 0 }} />
                                <p className="text-[12px]" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>{error}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Generating */}
                {step === 'generating' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 gap-6">
                        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #7530fb20, #7530fb10)', animation: 'pulse 2s ease infinite' }}>
                            <Zap size={36} style={{ color: C.primary }} />
                        </div>
                        <div className="text-center">
                            <p className="text-[18px] font-bold mb-1"
                                style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                Generating your template...
                            </p>
                            <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                AI is crafting a {STYLES.find(s => s.id === style)?.label.toLowerCase()} {CATEGORIES.find(c => c.id === category)?.label} template
                            </p>
                        </div>
                        <div className="w-full max-w-xs">
                            <div className="w-full rounded-full overflow-hidden" style={{ height: 6, backgroundColor: C.border }}>
                                <div className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${Math.min(progress, 100)}%`,
                                        background: 'linear-gradient(90deg, #7530fb, #b8fa33)',
                                        transition: 'width 0.8s ease',
                                    }} />
                            </div>
                            <p className="text-[11px] text-center mt-2"
                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                {progress < 30 ? 'Crafting layout structure...'
                                    : progress < 60 ? 'Adding styles and sections...'
                                        : progress < 85 ? 'Finalising placeholders...'
                                            : 'Almost done...'}
                            </p>
                        </div>
                        <button onClick={() => { abortRef.current?.abort(); setStep('input') }}
                            className="text-[12px] hover:opacity-70 transition-all"
                            style={{ color: C.muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            Cancel generation
                        </button>
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 'review' && (
                    <div className="flex flex-1 min-h-0">

                        {/* Left: preview */}
                        <div className="flex flex-col flex-1 min-w-0" style={{ backgroundColor: '#e8e8e8' }}>
                            <div className="flex items-center gap-2 px-4 py-2 shrink-0"
                                style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
                                {DEVICES.map(d => (
                                    <button key={d.id} onClick={() => setDevice(d.id)}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                                        style={{
                                            backgroundColor: device === d.id ? C.primaryLight : 'transparent',
                                            color: device === d.id ? C.primary : C.muted,
                                            border: `1px solid ${device === d.id ? C.primary : 'transparent'}`,
                                            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                        <d.icon size={13} /> {d.label}
                                    </button>
                                ))}
                                <div style={{ flex: 1 }} />
                                <button onClick={reset}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
                                    style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                    <RefreshCw size={11} /> Regenerate
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto flex items-start justify-center p-4">
                                <div style={{
                                    width: previewWidth, maxWidth: '100%',
                                    backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                                    transition: 'width 0.25s ease',
                                }}>
                                    <div className="flex items-center gap-1.5 px-3 py-2"
                                        style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#28c840' }} />
                                        <div className="flex-1 mx-3 px-3 py-0.5 rounded text-center"
                                            style={{ backgroundColor: '#fff', border: '1px solid #ddd', fontSize: 10, color: '#888', fontFamily: 'DM Sans, sans-serif' }}>
                                            preview.riazify.com/template
                                        </div>
                                    </div>
                                    <iframe
                                        key={device}
                                        srcDoc={wrapForPreview(html)}
                                        sandbox="allow-same-origin"
                                        style={{ width: '100%', minHeight: 500, border: 'none', display: 'block' }}
                                        title="Generated Template"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right: actions */}
                        <div className="flex flex-col shrink-0 overflow-y-auto"
                            style={{ width: 280, borderLeft: `1px solid ${C.border}`, backgroundColor: C.bg }}>

                            <div className="p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                                <div className="flex items-center gap-2 p-3 rounded-xl mb-3"
                                    style={{ backgroundColor: C.successBg, border: `1px solid ${C.success}30` }}>
                                    <Check size={14} style={{ color: C.success }} />
                                    <p className="text-[12px] font-semibold" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                        Template generated!
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                        {CATEGORIES.find(c => c.id === category)?.label}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                        style={{ backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                        {STYLES.find(s => s.id === style)?.label}
                                    </span>
                                </div>
                                <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    {html.length.toLocaleString()} characters · {sections.size} sections
                                </p>
                            </div>

                            <div className="p-4 flex flex-col gap-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                                <p className="text-[11px] font-bold uppercase tracking-wide"
                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    Save Template
                                </p>
                                <input
                                    value={templateName}
                                    onChange={e => setTemplateName(e.target.value)}
                                    placeholder="Template name..."
                                    className="text-[12px] px-3 py-2 rounded-lg outline-none w-full transition-all"
                                    style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.surface, color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                                    onFocus={e => e.currentTarget.style.borderColor = C.primary}
                                    onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                                />
                                <button onClick={saveTemplate}
                                    disabled={saving || !templateName.trim()}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{
                                        backgroundColor: saved ? C.success : C.surface,
                                        color: saved ? '#fff' : C.primary,
                                        border: `1px solid ${saved ? C.success : C.border}`,
                                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                    }}>
                                    {saving
                                        ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                                        : saved
                                            ? <><Check size={13} /> Saved!</>
                                            : <><Save size={13} /> Save to My Templates</>
                                    }
                                </button>
                            </div>

                            <div className="p-4 flex flex-col gap-2">
                                <p className="text-[11px] font-bold uppercase tracking-wide mb-1"
                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    Open In
                                </p>
                                <button
                                    onClick={() => { onImport(html, templateName || 'AI Template', category); onClose() }}
                                    className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl text-[12px] font-bold transition-all hover:opacity-90"
                                    style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                    <FileCode2 size={14} /> Edit in HTML Editor
                                </button>
                                <button
                                    onClick={() => {
                                        onImport(html, templateName || 'AI Template', category)
                                        onClose()
                                        router.push(`/dashboard/design/visual-editor?name=${encodeURIComponent(templateName || 'AI Template')}`)
                                    }}
                                    className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
                                    style={{ backgroundColor: C.surface, color: C.secondary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                    <Layers size={14} /> Edit in Visual Builder
                                </button>
                                <button onClick={reset}
                                    className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
                                    style={{ backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                    <RefreshCw size={13} /> Start Over
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {step === 'input' && (
                    <div className="flex items-center justify-between px-5 py-4 shrink-0"
                        style={{ borderTop: `1px solid ${C.border}` }}>
                        <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            {sections.size} sections · {STYLES.find(s => s.id === style)?.label} style
                        </p>
                        <AIButton onClick={generate} chevron>
                            Generate Template
                        </AIButton>
                    </div>
                )}

                {step === 'review' && (
                    <div className="flex items-center justify-between px-5 py-3 shrink-0"
                        style={{ borderTop: `1px solid ${C.border}` }}>
                        <button onClick={reset}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold hover:opacity-80 transition-all"
                            style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            <ChevronLeft size={13} /> Back
                        </button>
                        <button onClick={onClose}
                            className="px-4 py-1.5 rounded-lg text-[12px] font-semibold hover:opacity-80 transition-all"
                            style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            Close
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
                @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
            `}</style>
        </div>
    )
}
