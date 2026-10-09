// app/share/[id]/page.tsx
// Public shared profit report page — no login required
// URL: riazify.com/share/[id]

import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Activity, Clock, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
    params: { id: string }
}

// -- Riazify Color Role Tokens (v2.0) ---------------------------
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
    borderDark: '#2d1f4e',
    borderInput: '#e5e0f5',
    bg: '#f8f7ff',
    surface: '#ffffff',
    text: '#1f1d2e',
    textDark: '#1e1535',
    muted: '#6b7280',
    textLight: '#a89cc8',
}

const COUNTRY_LABEL: Record<string, string> = {
    US: 'United States', UK: 'United Kingdom', CA: 'Canada', AU: 'Australia',
    DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain', AT: 'Austria',
    IE: 'Ireland', BE: 'Belgium', NL: 'Netherlands', PL: 'Poland', CH: 'Switzerland',
}

const SYM: Record<string, string> = {
    US: '$', UK: '£', CA: 'C$', AU: 'A$', DE: '€', FR: '€', IT: '€',
    ES: '€', AT: '€', IE: '€', BE: '€', NL: '€', PL: 'zł', CH: 'CHF',
}

function fmt(val: number, sym: string) {
    return `${val >= 0 ? '+' : '-'}${sym}${Math.abs(val).toFixed(2)}`
}
function fmtPlain(val: number, sym: string) {
    return `${sym}${Math.abs(val).toFixed(2)}`
}
function fmtPct(val: number) {
    return `${val.toFixed(1)}%`
}

export default async function SharedReportPage({ params }: Props) {
    // Fetch report from Supabase
    const { data, error } = await supabase
        .from('shared_reports')
        .select('*')
        .eq('id', params.id)
        .gt('expires_at', new Date().toISOString())
        .single()

    if (error || !data) {
        return (
            <div
                style={{
                    fontFamily: "'DM Sans', sans-serif",
                    minHeight: '100vh',
                    background: T.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                }}
            >
                <div
                    className="max-w-md w-full text-center p-8 rounded-3xl border shadow-xl"
                    style={{ backgroundColor: T.surface, borderColor: T.border }}
                >
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border"
                        style={{ backgroundColor: T.primaryLight, borderColor: T.border }}
                    >
                        <Clock size={30} style={{ color: T.primary }} />
                    </div>
                    <h1 className="text-[24px] font-black font-syne mb-2 tracking-tight" style={{ color: T.textDark }}>
                        Link Expired or Invalid
                    </h1>
                    <p className="text-[14px] leading-relaxed mb-6" style={{ color: T.muted }}>
                        This eBay profit calculation link has expired or no longer exists.<br />
                        Shared reports remain active for 7 days.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-[13px] transition-all hover:scale-105 shadow-sm"
                        style={{ backgroundColor: T.accent, color: T.dark }}
                    >
                        <span>Create Your Report on Riazify</span>
                        <ArrowRight size={15} />
                    </Link>
                </div>
            </div>
        )
    }

    // Increment view count in background
    await supabase
        .from('shared_reports')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', params.id)

    const state = data.state
    const result = data.result
    const country = data.country
    const sym = SYM[country] ?? '$'
    const isProfitable = result.netProfit >= 0
    const profitColor = isProfitable ? '#16a34a' : '#dc2626'
    const ebaySite = country === 'UK' ? 'ebay.co.uk' : country === 'AU' ? 'ebay.com.au' : country === 'US' ? 'ebay.com' : `ebay.${country.toLowerCase()}`
    const expiresAt = new Date(data.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const createdAt = new Date(data.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

    const storeLabel = (() => {
        if (country === 'US' && state.usStoreTier !== 'none') return state.usStoreTier
        if (country === 'UK' && state.ukStoreTier !== 'none') return state.ukStoreTier
        if (country === 'CA' && state.caStoreTier !== 'none') return state.caStoreTier
        if (country === 'DE' && state.deShopTier !== 'none') return state.deShopTier
        return 'No store subscription'
    })()

    return (
        <div
            style={{
                fontFamily: "'DM Sans', sans-serif",
                background: T.bg,
                minHeight: '100vh',
                padding: '40px 16px',
                color: T.textDark,
            }}
        >
            <div style={{ maxWidth: 760, margin: '0 auto' }}>

                {/* Top Header Bar */}
                <div
                    style={{
                        background: T.dark,
                        borderRadius: '16px 16px 0 0',
                        padding: '12px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: `1px solid ${T.borderDark}`,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: 7,
                                background: T.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Activity size={13} style={{ color: T.accent }} />
                        </div>
                        <span className="font-syne font-black text-[13px] tracking-tight text-white">RIAZIFY</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.textLight }}>Shared Profit Report</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.textLight, fontWeight: 500 }}>
                        Created {createdAt} · Expires {expiresAt}
                    </div>
                </div>

                {/* Main Report Container */}
                <div
                    style={{
                        background: T.surface,
                        borderRadius: '0 0 16px 16px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(30,21,53,0.06)',
                        border: `1px solid ${T.border}`,
                        borderTop: 'none',
                    }}
                >
                    {/* Header Block */}
                    <div
                        style={{
                            background: T.dark,
                            padding: '28px 32px',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: -60,
                                right: -60,
                                width: 220,
                                height: 220,
                                borderRadius: '50%',
                                background: 'rgba(117,48,251,0.2)',
                                pointerEvents: 'none',
                            }}
                        />
                        <div className="relative z-10">
                            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border mb-2 inline-block font-syne"
                                style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: T.primary, color: T.accent }}>
                                VERIFIED FEE AUDIT
                            </span>
                            <h1 className="text-[26px] font-black font-syne text-white tracking-tight mt-1 mb-1">
                                eBay Profit & Margin Breakdown
                            </h1>
                            <p className="text-[13px] font-medium" style={{ color: T.textLight }}>
                                Target Marketplace: {COUNTRY_LABEL[country] ?? country} ({ebaySite})
                            </p>
                        </div>
                    </div>

                    {/* Hero Metrics Row */}
                    <div
                        style={{
                            padding: '24px 32px',
                            background: T.bg,
                            borderBottom: `1px solid ${T.border}`,
                        }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                            {[
                                { label: 'NET PROFIT', value: fmt(result.netProfit, sym), color: profitColor },
                                { label: 'MARGIN', value: fmtPct(result.profitMargin), color: isProfitable ? T.textDark : '#dc2626' },
                                { label: 'ROI', value: fmtPct(result.roi), color: isProfitable ? T.primary : '#dc2626' },
                                { label: 'BREAK EVEN', value: fmtPlain(result.breakEvenPrice, sym), color: T.textDark },
                            ].map(({ label, value, color }) => (
                                <div
                                    key={label}
                                    style={{
                                        background: T.surface,
                                        borderRadius: 14,
                                        padding: '16px 12px',
                                        textAlign: 'center',
                                        border: `1px solid ${T.border}`,
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                                    }}
                                >
                                    <div className="font-syne" style={{ fontSize: 10, fontWeight: 800, color: T.muted, letterSpacing: '0.6px', marginBottom: 4 }}>
                                        {label}
                                    </div>
                                    <div className="font-syne" style={{ fontSize: 20, fontWeight: 900, color }}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Ledger & Setup Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2">

                        {/* Left Column: Seller Setup & Pricing */}
                        <div style={{ padding: '28px 32px', borderRight: `1px solid ${T.border}` }}>
                            <div className="font-syne uppercase" style={{ fontSize: 11, fontWeight: 900, color: T.primary, letterSpacing: '0.6px', marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>
                                SELLER SPECIFICATIONS
                            </div>
                            {[
                                ['Marketplace', COUNTRY_LABEL[country] ?? country],
                                ['Seller Status', state.isTopRatedPlus ? 'Top Rated Plus (-10% FVF)' : state.isBelowStandard ? 'Below Standard (+5% penalty)' : 'Above Standard'],
                                ['Store Tier', storeLabel],
                            ].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f3eeff', fontSize: 12 }}>
                                    <span style={{ color: T.muted, fontWeight: 500 }}>{l}</span>
                                    <span style={{ fontWeight: 700, color: T.textDark }}>{v}</span>
                                </div>
                            ))}

                            <div className="font-syne uppercase" style={{ fontSize: 11, fontWeight: 900, color: T.primary, letterSpacing: '0.6px', margin: '22px 0 12px', paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>
                                PRICING & BUYER CHARGES
                            </div>
                            {[
                                ['Listing Price', fmtPlain(state.sellingPrice, sym)],
                                ['Actual Shipping Cost', fmtPlain(state.shippingCost || 0, sym)],
                                ['Buyer Paid Shipping', fmtPlain(state.buyerPaidShipping || 0, sym)],
                                ['Buyer Sales Tax / VAT', fmtPct(state.buyerTaxPercent || 0)],
                            ].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f3eeff', fontSize: 12 }}>
                                    <span style={{ color: T.muted, fontWeight: 500 }}>{l}</span>
                                    <span style={{ fontWeight: 700, color: T.textDark }}>{v}</span>
                                </div>
                            ))}
                        </div>

                        {/* Right Column: Transaction Ledger */}
                        <div style={{ padding: '28px 32px' }}>
                            <div className="font-syne uppercase" style={{ fontSize: 11, fontWeight: 900, color: T.primary, letterSpacing: '0.6px', marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>
                                TRANSACTION LEDGER
                            </div>
                            {[
                                ['Gross Revenue (Price + Ship)', fmt(result.totalRevenue, sym), '#16a34a'],
                                ['Item Cost & Outbound Shipping', fmt(-result.totalCosts, sym), '#dc2626'],
                                ['eBay Final Value Fee (FVF)', fmt(-result.finalValueFeeOnly, sym), '#dc2626'],
                                ...(result.promotedAdFee > 0 ? [['Promoted Ad Fee', fmt(-result.promotedAdFee, sym), '#dc2626']] : []),
                                ...(result.regulatoryFee > 0 ? [['Regulatory Operating Fee', fmt(-result.regulatoryFee, sym), '#dc2626']] : []),
                                ...(result.advancedDeductions > 0 ? [['Custom Item Deductions', fmt(-result.advancedDeductions, sym), '#dc2626']] : []),
                                ...(result.totalCashback > 0 ? [['Sourcing Cashback Offset', fmt(result.totalCashback, sym), '#16a34a']] : []),
                            ].map(([l, v, c]) => (
                                <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f3eeff', fontSize: 12 }}>
                                    <span style={{ color: T.muted, fontWeight: 500 }}>{l as string}</span>
                                    <span style={{ fontWeight: 800, color: c as string }}>{v as string}</span>
                                </div>
                            ))}

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '12px 0 6px',
                                    borderTop: `2px solid ${T.textDark}`,
                                    marginTop: 8,
                                    fontSize: 14,
                                }}
                            >
                                <span className="font-syne" style={{ fontWeight: 900, color: T.textDark }}>NET TAKE-HOME PROFIT</span>
                                <span className="font-syne" style={{ fontWeight: 900, color: profitColor }}>{fmt(result.netProfit, sym)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Metadata */}
                    <div
                        style={{
                            padding: '18px 32px',
                            background: T.bg,
                            borderTop: `1px solid ${T.border}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 12,
                        }}
                    >
                        <div style={{ fontSize: 11, color: T.muted }}>
                            Calculated via <strong style={{ color: T.textDark }}>Riazify</strong> (riazify.com)<br />
                            All eBay category fee tiers verified against official marketplace rate cards.
                        </div>
                        <div style={{ fontSize: 11, color: T.muted, textAlign: 'right' }}>
                            <span className="font-semibold text-[#1e1535]">{ebaySite}</span> · All values in {sym === '$' ? 'USD' : sym === '£' ? 'GBP' : sym === '€' ? 'EUR' : sym === 'C$' ? 'CAD' : sym}
                        </div>
                    </div>
                </div>

                {/* View Count & Footer CTA */}
                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: T.muted }}>
                    <span>Viewed {(data.views || 0) + 1} time{(data.views || 0) + 1 !== 1 ? 's' : ''} · Link active until {expiresAt} · </span>
                    <Link href="/" className="font-bold hover:underline" style={{ color: T.primary }}>
                        Calculate your own eBay margins on Riazify →
                    </Link>
                </div>

            </div>
        </div>
    )
}
