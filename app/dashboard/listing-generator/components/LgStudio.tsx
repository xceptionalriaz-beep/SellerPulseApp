'use client'
// app/dashboard/listing-generator/components/LgStudio.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Studio Wizard Shell
// 4-step listing wizard with:
//   ✓ Left step sidebar with progress
//   ✓ Auto-save draft every 30s
//   ✓ Step navigation (prev/next)
//   ✓ Health score live update
//   ✓ Back to dashboard
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { CheckCircle2 } from 'lucide-react'
import Step1Product from './steps/Step1Product'
import Step2Media from './steps/Step2Media'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    accentText: '#1e1535',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    warning: '#d97706',
    warningBg: '#fef3c7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
}

// ── Types ─────────────────────────────────────────────────────
export type WizardStep = 1 | 2 | 3 | 4

export interface DraftData {
    id?: string
    seller_type: string
    product_name: string
    title: string
    category: string
    condition: string
    sku: string
    item_specifics: Record<string, string>
    main_photo_url: string
    photo_urls: string[]
    video_url: string
    has_variations: boolean
    condition_description: string
    description_html: string
    sell_price: number | null
    buy_price: number | null
    shipping_type: string
    shipping_cost: number
    free_shipping: boolean
    dispatch_days: number
    returns_policy: string
    quantity: number
    health_score: number
    vero_status: string
    status: string
    current_step: number
}

const INITIAL_DRAFT: DraftData = {
    seller_type: '',
    product_name: '',
    title: '',
    category: '',
    condition: '',
    sku: '',
    item_specifics: {},
    main_photo_url: '',
    photo_urls: [],
    video_url: '',
    has_variations: false,
    condition_description: '',
    description_html: '',
    sell_price: null,
    buy_price: null,
    shipping_type: 'fixed',
    shipping_cost: 0,
    free_shipping: false,
    dispatch_days: 1,
    returns_policy: '30_day_buyer_pays',
    quantity: 1,
    health_score: 0,
    vero_status: 'unchecked',
    status: 'draft',
    current_step: 1,
}

// ── Step config ───────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Product & SEO' },
    { id: 2, label: 'Photos & Description' },
    { id: 3, label: 'Price & Shipping' },
    { id: 4, label: 'Audit & Publish' },
]

// ── Props ─────────────────────────────────────────────────────
interface Props {
    draftId: string | null
    onBack: () => void
}


// ── Main Wizard Component ─────────────────────────────────────
export default function LgStudio({ draftId, onBack }: Props) {
    const supabase = createClient()

    const [currentStep, setCurrentStep] = useState<WizardStep>(1)
    const [draft, setDraft] = useState<DraftData>(INITIAL_DRAFT)
    const [saving, setSaving] = useState(false)
    const [savedAt, setSavedAt] = useState<Date | null>(null)
    const [draftDbId, setDraftDbId] = useState<string | null>(draftId)

    // Fire step change to top bar
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('lg:stepChange', { detail: { step: currentStep } }))
        return () => {
            window.dispatchEvent(new CustomEvent('lg:backToDashboard'))
        }
    }, [currentStep])

    // ── Load existing draft ──────────────────────────────────
    useEffect(() => {
        if (!draftId) return
        async function loadDraft() {
            const { data } = await (supabase.from('listing_drafts') as any)
                .select('*')
                .eq('id', draftId)
                .single()
            if (data) {
                setDraft({
                    ...INITIAL_DRAFT,
                    ...data,
                })
                setCurrentStep((data.current_step || 1) as WizardStep)
            }
        }
        loadDraft()
    }, [draftId])

    // ── Calculate health score ───────────────────────────────
    useEffect(() => {
        let score = 0
        if (draft.seller_type) score += 5
        if (draft.title.length >= 40) score += 20
        else if (draft.title.length >= 20) score += 10
        if (draft.category) score += 10
        if (draft.condition) score += 10
        if (draft.sku) score += 5
        if (Object.keys(draft.item_specifics).length >= 3) score += 10
        if (draft.description_html) score += 15
        if (draft.sell_price && draft.sell_price > 0) score += 15
        if (draft.buy_price && draft.buy_price > 0) score += 5
        if (draft.shipping_type) score += 5
        setDraft(prev => ({ ...prev, health_score: Math.min(score, 100) }))
    }, [
        draft.seller_type, draft.title, draft.category, draft.condition,
        draft.sku, draft.item_specifics, draft.description_html,
        draft.sell_price, draft.buy_price, draft.shipping_type,
    ])

    // ── Auto-save every 30s ──────────────────────────────────
    useEffect(() => {
        const timer = setInterval(() => {
            saveDraft(false)
        }, 30000)
        return () => clearInterval(timer)
    }, [draft])

    // ── Save draft ───────────────────────────────────────────
    const saveDraft = useCallback(async (showSaving = true) => {
        if (showSaving) setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const payload = {
                user_id: user.id,
                seller_type: draft.seller_type || 'own_stock',
                product_name: draft.product_name,
                title: draft.title,
                category: draft.category,
                condition: draft.condition,
                sku: draft.sku,
                item_specifics: draft.item_specifics,
                description_html: draft.description_html,
                sell_price: draft.sell_price,
                buy_price: draft.buy_price,
                shipping_type: draft.shipping_type,
                shipping_cost: draft.shipping_cost,
                free_shipping: draft.free_shipping,
                dispatch_days: draft.dispatch_days,
                returns_policy: draft.returns_policy,
                quantity: draft.quantity,
                health_score: draft.health_score,
                vero_status: draft.vero_status,
                status: 'draft',
                current_step: currentStep,
                updated_at: new Date().toISOString(),
            }

            if (draftDbId) {
                await (supabase.from('listing_drafts') as any)
                    .update(payload)
                    .eq('id', draftDbId)
            } else {
                const { data } = await (supabase.from('listing_drafts') as any)
                    .insert({ ...payload, created_at: new Date().toISOString() })
                    .select('id')
                    .single()
                if (data?.id) setDraftDbId(data.id)
            }
            setSavedAt(new Date())
        } catch (e) {
            console.error('[LgStudio] Save error:', e)
        }
        if (showSaving) setSaving(false)
    }, [draft, currentStep, draftDbId])

    // ── Update draft field ───────────────────────────────────
    function updateDraft(updates: Partial<DraftData>) {
        setDraft(prev => ({ ...prev, ...updates }))
    }

    // ── Step navigation ──────────────────────────────────────
    async function goNext() {
        await saveDraft(true)
        if (currentStep < 4) setCurrentStep(prev => (prev + 1) as WizardStep)
    }

    async function goPrev() {
        if (currentStep > 1) setCurrentStep(prev => (prev - 1) as WizardStep)
    }

    // ── Step completion helpers ──────────────────────────────
    function isComplete(stepId: number): boolean {
        if (stepId === 1) return !!(draft.seller_type && draft.title && draft.category && draft.condition)
        if (stepId === 2) return !!(draft.description_html)
        if (stepId === 3) return !!(draft.sell_price && draft.sell_price > 0)
        return false
    }

    function isAccessible(stepId: number): boolean {
        if (stepId === 1) return true
        return isComplete(stepId - 1)
    }

    // ── Render ───────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>

            {/* Step content — full width. On mobile: scrollable page. On xl: fixed height columns */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto xl:overflow-hidden scrollbar-hide">
                {currentStep === 1 && (
                    <Step1Product
                        draft={draft}
                        onChange={updateDraft}
                        onNext={goNext}
                        onSave={saveDraft}
                    />
                )}
                {currentStep === 2 && (
                    <Step2Media
                        draft={draft}
                        onChange={updateDraft}
                        onNext={goNext}
                        onPrev={goPrev}
                        onSave={saveDraft}
                    />
                )}
                {currentStep === 3 && (
                    <ComingSoon step={3} label="Price & Shipping" onBack={goPrev} onNext={goNext} />
                )}
                {currentStep === 4 && (
                    <ComingSoon step={4} label="Audit & Publish" onBack={goPrev} />
                )}
            </div>

            {/* ── Bottom bar — sticky on mobile, fixed at bottom ── */}
            <div className="flex items-center justify-center shrink-0 px-2 md:px-4 sticky bottom-0 xl:relative"
                style={{
                    height: 'clamp(44px, 5vh, 56px)',
                    backgroundColor: C.surface,
                    borderTop: `1px solid ${C.border}`,
                    zIndex: 30,
                }}>

                <div className="flex items-center gap-1.5 md:gap-3">

                    {/* Back */}
                    <button
                        onClick={() => { window.dispatchEvent(new CustomEvent('lg:backToDashboard')); onBack() }}
                        className="text-[10px] md:text-[12px] font-semibold px-2 md:px-4 py-1 md:py-2 rounded-lg transition-all hover:opacity-70 shrink-0"
                        style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                        Back
                    </button>

                    {/* Divider */}
                    <div className="w-px h-4 shrink-0" style={{ backgroundColor: C.border }} />

                    {/* Steps */}
                    <div className="flex items-center gap-0">
                        {STEPS.map((step, idx) => {
                            const isActive = currentStep === step.id
                            const complete = isComplete(step.id)
                            const accessible = isAccessible(step.id)
                            return (
                                <div key={step.id} className="flex items-center">
                                    <button
                                        onClick={() => accessible && setCurrentStep(step.id as WizardStep)}
                                        disabled={!accessible}
                                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all"
                                        style={{ opacity: accessible ? 1 : 0.4, cursor: accessible ? 'pointer' : 'default' }}>
                                        <div className="flex items-center justify-center shrink-0"
                                            style={{
                                                width: 18, height: 18, borderRadius: '50%',
                                                backgroundColor: complete ? C.dark : isActive ? C.accent : 'transparent',
                                                border: complete || isActive ? 'none' : `1px solid ${C.border}`,
                                            }}>
                                            {complete
                                                ? <span style={{ fontSize: 11, fontWeight: 900, color: C.accent, lineHeight: 1 }}>✓</span>
                                                : <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? C.accentText : C.muted, fontFamily: 'DM Sans, sans-serif' }}>{step.id}</span>
                                            }
                                        </div>
                                        <span className="hidden md:inline text-[12px] font-semibold whitespace-nowrap"
                                            style={{ color: isActive || complete ? C.accentText : C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            {step.label}
                                        </span>
                                    </button>
                                    {idx < STEPS.length - 1 && (
                                        <div className="shrink-0" style={{ width: 20, height: 1, backgroundColor: C.border }} />
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-4 shrink-0" style={{ backgroundColor: C.border }} />

                    {/* Save + Next */}
                    <button
                        onClick={() => saveDraft(true)}
                        disabled={saving}
                        className="text-[10px] md:text-[12px] font-semibold px-2 md:px-4 py-1 md:py-2 rounded-lg transition-all hover:opacity-70 disabled:opacity-50"
                        style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    {currentStep < 4 && (() => {
                        const canGoNext = isComplete(currentStep)
                        return (
                            <button
                                onClick={canGoNext ? goNext : undefined}
                                disabled={!canGoNext}
                                className="text-[10px] md:text-[12px] font-semibold px-2 md:px-4 py-1 md:py-2 rounded-lg transition-all disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: canGoNext ? C.accent : C.border,
                                    color: canGoNext ? C.accentText : C.muted,
                                    fontFamily: 'DM Sans, sans-serif',
                                    opacity: canGoNext ? 1 : 0.5,
                                }}>
                                Next
                            </button>
                        )
                    })()}

                </div>
            </div>
        </div>
    )
}

// ── Coming Soon placeholder for steps 2-4 ────────────────────
function ComingSoon({ step, label, onBack, onNext }: {
    step: number
    label: string
    onBack: () => void
    onNext?: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: '#f3eeff' }}>
                <span className="text-[28px] font-bold" style={{ color: '#7530fb', fontFamily: 'Syne, sans-serif' }}>
                    {step}
                </span>
            </div>
            <div className="text-center">
                <p className="text-[18px] font-bold mb-1" style={{ color: '#1e1535', fontFamily: 'Syne, sans-serif' }}>
                    {label}
                </p>
                <p className="text-[13px]" style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}>
                    Coming next — being built step by step
                </p>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={onBack}
                    className="px-4 py-2 rounded-xl text-[13px] font-semibold"
                    style={{ backgroundColor: '#f3eeff', color: '#7530fb', border: '1px solid #ede9fe', fontFamily: 'DM Sans, sans-serif' }}>
                    ← Previous
                </button>
                {onNext && (
                    <button onClick={onNext}
                        className="px-4 py-2 rounded-xl text-[13px] font-semibold"
                        style={{ backgroundColor: '#b8fa33', color: '#1e1535', fontFamily: 'DM Sans, sans-serif' }}>
                        Next →
                    </button>
                )}
            </div>
        </div>
    )
}
