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
import { calcHealth } from '@/lib/health-engine'
import { CheckCircle2 } from 'lucide-react'
import Step1Product from './steps/Step1Product'
import Step2Media from './steps/Step2Media'
import Step3Pricing from './steps/Step3Pricing'
import Step4Publish from './steps/Step4Publish'

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
    subtitle: string
    category: string
    condition: string
    condition_description: string
    sku: string
    item_specifics: Record<string, string>
    upc: string
    ean: string
    mpn: string
    product_url: string
    main_photo_url: string
    photo_urls: string[]
    video_url: string
    has_variations: boolean
    description_html: string
    sell_price: number | null
    buy_price: number | null
    shipping_type: string
    shipping_cost: number
    free_shipping: boolean
    dispatch_days: number
    returns_policy: string
    quantity: number
    vat_registered: boolean
    best_offer_enabled: boolean
    best_offer_accept: number | null
    best_offer_decline: number | null
    out_of_stock_option: boolean
    item_zip: string
    item_country: string
    international_shipping: boolean
    immediate_payment: boolean
    shipping_carrier: string
    listing_format: string
    auction_duration: string
    package_weight_lbs: number | null
    package_weight_oz: number | null
    pkg_length: number | null
    pkg_width: number | null
    pkg_height: number | null
    irregular_package: boolean
    volume_pricing: boolean
    sell_as_lot: boolean
    private_listing: boolean
    scheduled_at: string
    promoted_general: boolean
    promoted_general_rate: number | null
    promoted_priority: boolean
    promoted_priority_budget: number | null
    item_disclosures: boolean
    health_score: number
    vero_status: string
    status: string
    current_step: number
    photo_count: number
}

const INITIAL_DRAFT: DraftData = {
    seller_type: '',
    product_name: '',
    title: '',
    subtitle: '',
    category: '',
    condition: '',
    condition_description: '',
    sku: '',
    item_specifics: {},
    upc: '',
    ean: '',
    mpn: '',
    product_url: '',
    main_photo_url: '',
    photo_urls: [],
    video_url: '',
    has_variations: false,
    description_html: '',
    sell_price: null,
    buy_price: null,
    shipping_type: 'fixed',
    shipping_cost: 0,
    free_shipping: false,
    dispatch_days: 1,
    returns_policy: '30_day_buyer_pays',
    quantity: 1,
    vat_registered: false,
    best_offer_enabled: false,
    best_offer_accept: null,
    best_offer_decline: null,
    out_of_stock_option: false,
    item_zip: '',
    item_country: 'US',
    international_shipping: false,
    immediate_payment: true,
    shipping_carrier: '',
    listing_format: 'buy_it_now',
    auction_duration: '7',
    package_weight_lbs: null,
    package_weight_oz: null,
    pkg_length: null,
    pkg_width: null,
    pkg_height: null,
    irregular_package: false,
    volume_pricing: false,
    sell_as_lot: false,
    private_listing: false,
    scheduled_at: '',
    promoted_general: false,
    promoted_general_rate: null,
    promoted_priority: false,
    promoted_priority_budget: null,
    item_disclosures: false,
    health_score: 0,
    photo_count: 0,
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

    // ── Calculate health score — uses shared health-engine ──────
    useEffect(() => {
        const { score } = calcHealth(draft as any)
        setDraft(prev => ({ ...prev, health_score: score }))
    }, [
        draft.title, draft.category, draft.condition, draft.sku,
        draft.item_specifics, draft.description_html, draft.sell_price,
        draft.buy_price, draft.shipping_type, draft.free_shipping,
        draft.photo_urls, draft.item_zip, draft.upc, draft.ean, draft.mpn,
        draft.subtitle, draft.returns_policy, draft.dispatch_days,
        draft.condition_description,
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
                subtitle: draft.subtitle,
                category: draft.category,
                condition: draft.condition,
                condition_description: draft.condition_description,
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
                // ── Photos ──────────────────────────────────────────
                main_photo_url: draft.main_photo_url || '',
                photo_urls: draft.photo_urls || [],
                photo_count: (draft.photo_urls || []).length,
                // ── Pricing extras ───────────────────────────────────
                vat_registered: draft.vat_registered,
                best_offer_enabled: draft.best_offer_enabled,
                best_offer_accept: draft.best_offer_accept,
                best_offer_decline: draft.best_offer_decline,
                out_of_stock_option: draft.out_of_stock_option,
                item_zip: draft.item_zip,
                item_country: draft.item_country,
                international_shipping: draft.international_shipping,
                immediate_payment: draft.immediate_payment,
                shipping_carrier: draft.shipping_carrier,
                listing_format: draft.listing_format,
                auction_duration: draft.auction_duration,
                package_weight_lbs: draft.package_weight_lbs,
                package_weight_oz: draft.package_weight_oz,
                pkg_length: draft.pkg_length,
                pkg_width: draft.pkg_width,
                pkg_height: draft.pkg_height,
                irregular_package: draft.irregular_package,
                volume_pricing: draft.volume_pricing,
                sell_as_lot: draft.sell_as_lot,
                private_listing: draft.private_listing,
                scheduled_at: draft.scheduled_at,
                promoted_general: draft.promoted_general,
                promoted_general_rate: draft.promoted_general_rate,
                promoted_priority: draft.promoted_priority,
                promoted_priority_budget: draft.promoted_priority_budget,
                item_disclosures: draft.item_disclosures,
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
                    <Step3Pricing
                        draft={draft}
                        onChange={updateDraft}
                        onNext={goNext}
                        onPrev={goPrev}
                        onSave={saveDraft}
                    />
                )}
                {currentStep === 4 && (
                    <Step4Publish
                        draft={draft}
                        onChange={updateDraft}
                        onSave={saveDraft}
                        onStepJump={(step) => setCurrentStep(step as WizardStep)}
                    />
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
