'use client'
// app/dashboard/listing-generator/page.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — eBay Listing Generator
// Entry point for the Listing Generator tool.
//
// What this page does:
//   ✓ Kill switch gate (shows maintenance screen if tool is OFF)
//   ✓ Loads user profile + plan limits + existing draft count
//   ✓ Decides what to render:
//       → view === 'dashboard'  : ListingsDashboard (existing drafts)
//       → view === 'wizard'     : ListingWizard (creating/editing)
//       → view === 'empty'      : EmptyState (no drafts yet)
//   ✓ "+ List New Item" always available via header button
//   ✓ Passes draftId to wizard when editing an existing draft
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import KillSwitchGate from '@/components/KillSwitchGate'
import { ListChecks, Sparkles, Loader2, Tag, Calculator, ShieldCheck } from 'lucide-react'
import LgDashboard from './components/LgDashboard'
import LgStudio from './components/LgStudio'

// ── View types ────────────────────────────────────────────────
type View = 'loading' | 'empty' | 'dashboard' | 'wizard'

// ── Placeholder components (replaced in Day 3+) ───────────────
// These will be replaced with real components as we build them

function LoadingScreen() {
    return (
        <div
            className="flex flex-col items-center justify-center h-full gap-3"
            style={{ backgroundColor: '#f8f7ff' }}
        >
            <Loader2
                size={28}
                className="animate-spin"
                style={{ color: '#7530fb' }}
            />
            <p
                className="text-[13px] font-medium"
                style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}
            >
                Loading Listing Generator...
            </p>
        </div>
    )
}

function EmptyState({ onStart }: { onStart: () => void }) {
    return (
        <div
            className="flex flex-col items-center justify-center h-full px-6"
            style={{ backgroundColor: '#f8f7ff' }}
        >
            <div
                className="w-full max-w-lg flex flex-col items-center gap-6 p-10 rounded-3xl"
                style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #ede9fe',
                    boxShadow: '0 2px 12px rgba(117,48,251,0.06)',
                }}
            >
                {/* Icon */}
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#f3eeff' }}
                >
                    <ListChecks size={36} style={{ color: '#7530fb' }} />
                </div>

                {/* Heading */}
                <div className="text-center">
                    <h1
                        className="text-[24px] font-bold mb-2"
                        style={{
                            color: '#1e1535',
                            fontFamily: 'Syne, sans-serif',
                        }}
                    >
                        No listings created yet
                    </h1>
                    <p
                        className="text-[15px] leading-relaxed max-w-sm"
                        style={{
                            color: '#6b7280',
                            fontFamily: 'DM Sans, sans-serif',
                        }}
                    >
                        Use Riazify AI to build Cassini-optimized, profit-aware
                        eBay listings in under 3 minutes.
                    </p>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {[
                        { icon: Tag, label: 'AI Title Builder', color: '#7530fb', bg: '#f3eeff' },
                        { icon: Calculator, label: 'Profit Calculator', color: '#7530fb', bg: '#f3eeff' },
                        { icon: ShieldCheck, label: 'VeRO Protection', color: '#16a34a', bg: '#dcfce7' },
                    ].map((pill) => (
                        <span
                            key={pill.label}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                            style={{
                                backgroundColor: pill.bg,
                                color: pill.color,
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                        >
                            <pill.icon size={12} />
                            {pill.label}
                        </span>
                    ))}
                </div>

                {/* CTA Button */}
                <button
                    onClick={onStart}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[15px] transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                        backgroundColor: '#b8fa33',
                        color: '#1e1535',
                        fontFamily: 'Syne, sans-serif',
                        boxShadow: '0 4px 12px rgba(184,250,51,0.35)',
                    }}
                >
                    <Sparkles size={16} />
                    Create Your First Listing
                </button>

                {/* Speed metrics */}
                <p
                    className="text-[12px] text-center"
                    style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}
                >
                    Avg 2m 34s per listing &nbsp;·&nbsp; 100% VeRO checked &nbsp;·&nbsp; Profit-first pricing
                </p>
            </div>
        </div>
    )
}

function WizardPlaceholder({
    draftId,
    onBack,
}: {
    draftId: string | null
    onBack: () => void
}) {
    return (
        <div
            className="flex flex-col items-center justify-center h-full gap-4"
            style={{ backgroundColor: '#f8f7ff' }}
        >
            <div
                className="px-6 py-4 rounded-2xl text-center"
                style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #ede9fe',
                }}
            >
                <p
                    className="text-[16px] font-bold mb-1"
                    style={{ color: '#1e1535', fontFamily: 'Syne, sans-serif' }}
                >
                    {draftId ? `Editing Draft` : 'New Listing Wizard'}
                </p>
                <p
                    className="text-[13px]"
                    style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}
                >
                    4-step wizard coming in Day 5
                </p>
                <button
                    onClick={onBack}
                    className="mt-3 px-4 py-1.5 rounded-xl text-[13px] font-semibold"
                    style={{
                        backgroundColor: '#f3eeff',
                        color: '#7530fb',
                        border: '1px solid #ede9fe',
                    }}
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    )
}

function DashboardPlaceholder({
    draftCount,
    onNewListing,
    onEditDraft,
}: {
    draftCount: number
    onNewListing: () => void
    onEditDraft: (id: string) => void
}) {
    return (
        <div
            className="flex flex-col items-center justify-center h-full gap-4"
            style={{ backgroundColor: '#f8f7ff' }}
        >
            <div
                className="px-6 py-4 rounded-2xl text-center"
                style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #ede9fe',
                }}
            >
                <p
                    className="text-[16px] font-bold mb-1"
                    style={{ color: '#1e1535', fontFamily: 'Syne, sans-serif' }}
                >
                    Listings Dashboard
                </p>
                <p
                    className="text-[13px] mb-3"
                    style={{ color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }}
                >
                    {draftCount} listing{draftCount !== 1 ? 's' : ''} found
                </p>
                <button
                    onClick={onNewListing}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[13px] font-semibold"
                    style={{
                        backgroundColor: '#b8fa33',
                        color: '#1e1535',
                        fontFamily: 'DM Sans, sans-serif',
                    }}
                >
                    <Sparkles size={13} />
                    List New Item
                </button>
                <p
                    className="text-[12px] mt-3"
                    style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}
                >
                    Full dashboard UI coming in Day 3
                </p>
            </div>
        </div>
    )
}

// ── Page Header ───────────────────────────────────────────────
function PageHeader({
    onNewListing,
    showNewButton,
}: {
    onNewListing: () => void
    showNewButton: boolean
}) {
    return (
        <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #ede9fe',
            }}
        >
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#f3eeff' }}
                >
                    <ListChecks size={20} style={{ color: '#7530fb' }} />
                </div>
                <div>
                    <h1
                        className="text-[18px] font-bold leading-tight"
                        style={{
                            color: '#1e1535',
                            fontFamily: 'Syne, sans-serif',
                        }}
                    >
                        eBay Listing Generator
                    </h1>
                    <p
                        className="text-[12px]"
                        style={{
                            color: '#9ca3af',
                            fontFamily: 'DM Sans, sans-serif',
                        }}
                    >
                        Create optimised eBay listings in minutes
                    </p>
                </div>
            </div>

            {/* Right: New Listing Button */}
            {showNewButton && (
                <button
                    onClick={onNewListing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-[13px] transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                        backgroundColor: '#b8fa33',
                        color: '#1e1535',
                        fontFamily: 'DM Sans, sans-serif',
                        boxShadow: '0 4px 12px rgba(184,250,51,0.3)',
                    }}
                >
                    <Sparkles size={15} />
                    List New Item
                </button>
            )}
        </div>
    )
}

// ── Main Page Component ───────────────────────────────────────
export default function ListingGeneratorPage() {
    const supabase = createClient()

    // ── State ─────────────────────────────────────────────────
    const [view, setView] = useState<View>('loading')
    const [draftCount, setDraftCount] = useState(0)
    const [activeDraftId, setActiveDraftId] = useState<string | null>(null)
    const [planLimits, setPlanLimits] = useState<any>(null)
    const [userId, setUserId] = useState<string | null>(null)

    // ── Load on mount ────────────────────────────────────────
    useEffect(() => {
        async function loadPage() {
            try {
                // 1. Get current user
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                setUserId(user.id)

                // 2. Get user plan tier
                const { data: profile } = await (supabase.from('profiles') as any)
                    .select('subscription_tier')
                    .eq('id', user.id)
                    .single()
                const tier = (profile as any)?.subscription_tier ?? 'free'

                // 3. Get plan limits for listing generator
                const { data: limits } = await (supabase.from('plan_limits') as any)
                    .select('has_listing_generator, max_listing_generations, has_bulk_listing, has_dropship_import')
                    .eq('tier', tier)
                    .single()
                if (limits) setPlanLimits(limits)

                // 4. Count existing drafts
                const { count } = await (supabase.from('listing_drafts') as any)
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)

                const total = count ?? 0
                setDraftCount(total)

                // 5. Decide which view to show
                if (total === 0) {
                    setView('empty')
                } else {
                    setView('dashboard')
                }
            } catch (e) {
                console.error('[listing-generator] Load error:', e)
                setView('empty')
            }
        }
        loadPage()
    }, [])

    // ── Handlers ─────────────────────────────────────────────
    function handleNewListing() {
        setActiveDraftId(null)
        setView('wizard')
    }

    function handleEditDraft(draftId: string) {
        setActiveDraftId(draftId)
        setView('wizard')
    }

    function handleBackFromWizard() {
        setActiveDraftId(null)
        if (draftCount === 0) {
            setView('empty')
        } else {
            setView('dashboard')
        }
    }

    // ── Render ───────────────────────────────────────────────
    return (
        <KillSwitchGate switchTitle="Listing Generator">
            <style>{`
                @keyframes fadeScaleIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to   { opacity: 1; transform: scale(1); }
                }
                .anim-fade-scale {
                    animation: fadeScaleIn 0.25s cubic-bezier(0.4,0,0.2,1) forwards;
                }
            `}</style>

            <div className="flex flex-col h-full" style={{ backgroundColor: '#f8f7ff' }}>
                <div className="flex-1 overflow-hidden min-h-0 relative">

                    {view === 'loading' && <LoadingScreen />}

                    {(view === 'dashboard' || view === 'empty') && (
                        <div key="dashboard" className="absolute inset-0 anim-fade-scale">
                            {view === 'empty' && <EmptyState onStart={handleNewListing} />}
                            {view === 'dashboard' && (
                                <LgDashboard
                                    onNewListing={handleNewListing}
                                    onEditDraft={handleEditDraft}
                                    onBulkUpload={() => { }}
                                />
                            )}
                        </div>
                    )}

                    {view === 'wizard' && (
                        <div key="wizard" className="absolute inset-0 anim-fade-scale">
                            <LgStudio
                                draftId={activeDraftId}
                                onBack={handleBackFromWizard}
                            />
                        </div>
                    )}

                </div>
            </div>
        </KillSwitchGate>
    )
}
