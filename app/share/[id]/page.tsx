// app/share/[id]/page.tsx
// Public shared profit report page — no login needed
// URL: riazify.com/share/kx9m2p

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
    params: { id: string }
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
function fmtPct(val: number) { return `${val.toFixed(1)}%` }

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
            <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f7f9f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2410', marginBottom: 8 }}>Link Expired</h1>
                    <p style={{ fontSize: 14, color: '#8a9e78', marginBottom: 24 }}>This profit report link has expired or doesn't exist.<br />Links are valid for 7 days.</p>
                    <a href="/" style={{ display: 'inline-block', background: '#1a2410', color: '#8fff00', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
                        Go to Riazify
                    </a>
                </div>
            </div>
        )
    }

    // Increment view count
    await supabase
        .from('shared_reports')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', params.id)

    const state = data.state
    const result = data.result
    const country = data.country
    const sym = SYM[country] ?? '$'
    const profitColor = result.netProfit >= 0 ? '#16a34a' : '#b91c1c'
    const ebaySite = country === 'UK' ? 'ebay.co.uk' : country === 'AU' ? 'ebay.com.au' : country === 'US' ? 'ebay.com' : `ebay.${country.toLowerCase()}`
    const expiresAt = new Date(data.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const createdAt = new Date(data.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

    const storeLabel = (() => {
        if (country === 'US' && state.usStoreTier !== 'none') return state.usStoreTier
        if (country === 'UK' && state.ukStoreTier !== 'none') return state.ukStoreTier
        if (country === 'CA' && state.caStoreTier !== 'none') return state.caStoreTier
        if (country === 'DE' && state.deShopTier !== 'none') return state.deShopTier
        return 'No store'
    })()

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#f7f9f5', minHeight: '100vh', padding: '32px 16px', color: '#1a2410' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>

                {/* Shared by banner */}
                <div style={{ background: '#1a2410', borderRadius: '12px 12px 0 0', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#8fff00' }}>RIAZIFY</span>
                        <span style={{ fontSize: 11, color: '#8a9e78' }}>Shared Profit Report</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#8a9e78' }}>
                        Shared {createdAt} · Expires {expiresAt}
                    </div>
                </div>

                {/* Main report card */}
                <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

                    {/* Header */}
                    <div style={{ background: '#1a2410', padding: '24px 32px', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#8fff00', letterSpacing: '-0.5px' }}>RIAZIFY</div>
                        <div style={{ fontSize: 12, color: '#8a9e78', marginTop: 2 }}>eBay Profit Report — {COUNTRY_LABEL[country] ?? country}</div>
                    </div>

                    {/* Hero stats */}
                    <div style={{ padding: '24px 32px', background: '#f7f9f5', borderBottom: '1px solid #e8ede2' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                            {[
                                { label: 'NET PROFIT', value: fmt(result.netProfit, sym), color: profitColor },
                                { label: 'MARGIN', value: fmtPct(result.profitMargin), color: '#1a2410' },
                                { label: 'ROI', value: fmtPct(result.roi), color: '#1a2410' },
                                { label: 'BREAK EVEN', value: fmtPlain(result.breakEvenPrice, sym), color: '#1a2410' },
                            ].map(({ label, value, color }) => (
                                <div key={label} style={{ background: '#fff', borderRadius: 10, padding: 14, textAlign: 'center', border: '1px solid #e8ede2' }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: '#8a9e78', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
                                    <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Body */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

                        {/* Left — seller setup + pricing */}
                        <div style={{ padding: '24px 32px', borderRight: '1px solid #e8ede2' }}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: '#8a9e78', letterSpacing: '0.6px', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #e8ede2' }}>SELLER SETUP</div>
                            {[
                                ['Country', COUNTRY_LABEL[country] ?? country],
                                ['Seller Level', state.isTopRatedPlus ? 'Top Rated Plus' : state.isBelowStandard ? 'Below Standard' : 'Above Standard'],
                                ['Store', storeLabel],
                            ].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0ec', fontSize: 11 }}>
                                    <span style={{ color: '#8a9e78' }}>{l}</span>
                                    <span style={{ fontWeight: 700 }}>{v}</span>
                                </div>
                            ))}

                            <div style={{ fontSize: 9, fontWeight: 800, color: '#8a9e78', letterSpacing: '0.6px', margin: '16px 0 10px', paddingBottom: 6, borderBottom: '1px solid #e8ede2' }}>PRICING</div>
                            {[
                                ['Selling Price', fmtPlain(state.sellingPrice, sym)],
                                ['Shipping Cost', fmtPlain(state.shippingCost || 0, sym)],
                                ['Buyer Paid Shipping', fmtPlain(state.buyerPaidShipping || 0, sym)],
                                ['Buyer Tax %', fmtPct(state.buyerTaxPercent || 0)],
                            ].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0ec', fontSize: 11 }}>
                                    <span style={{ color: '#8a9e78' }}>{l}</span>
                                    <span style={{ fontWeight: 700 }}>{v}</span>
                                </div>
                            ))}
                        </div>

                        {/* Right — ledger */}
                        <div style={{ padding: '24px 32px' }}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: '#8a9e78', letterSpacing: '0.6px', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #e8ede2' }}>TRANSACTION LEDGER</div>
                            {[
                                ['Revenue (price + ship)', fmt(result.totalRevenue, sym), '#16a34a'],
                                ['Item and shipping costs', fmt(-result.totalCosts, sym), '#b91c1c'],
                                ['eBay Final Value Fee', fmt(-result.finalValueFeeOnly, sym), '#b91c1c'],
                                ...(result.promotedAdFee > 0 ? [['Promoted Listings', fmt(-result.promotedAdFee, sym), '#b91c1c']] : []),
                                ...(result.regulatoryFee > 0 ? [['Regulatory Fee', fmt(-result.regulatoryFee, sym), '#b91c1c']] : []),
                                ...(result.advancedDeductions > 0 ? [['Advanced Costs', fmt(-result.advancedDeductions, sym), '#b91c1c']] : []),
                                ...(result.totalCashback > 0 ? [['Cashback', fmt(result.totalCashback, sym), '#16a34a']] : []),
                            ].map(([l, v, c]) => (
                                <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0ec', fontSize: 11 }}>
                                    <span style={{ color: '#8a9e78' }}>{l as string}</span>
                                    <span style={{ fontWeight: 700, color: c as string }}>{v as string}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #1a2410', marginTop: 4, fontSize: 13 }}>
                                <span style={{ fontWeight: 800 }}>NET PROFIT</span>
                                <span style={{ fontWeight: 900, color: profitColor }}>{fmt(result.netProfit, sym)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '16px 32px', background: '#f7f9f5', borderTop: '1px solid #e8ede2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 10, color: '#8a9e78' }}>
                            Generated by <strong style={{ color: '#1a2410' }}>Riazify</strong> · riazify.com<br />
                            eBay fees verified against official eBay fee pages
                        </div>
                        <div style={{ fontSize: 10, color: '#8a9e78', textAlign: 'right' }}>
                            {createdAt}<br />
                            {ebaySite} · All fees in {sym === '$' ? 'USD' : sym === '£' ? 'GBP' : sym === '€' ? 'EUR' : sym === 'C$' ? 'CAD' : sym}
                        </div>
                    </div>
                </div>

                {/* Views + expiry info */}
                <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#8a9e78' }}>
                    Viewed {(data.views || 0) + 1} time{(data.views || 0) + 1 !== 1 ? 's' : ''} · Link expires {expiresAt} · <a href="/" style={{ color: '#4a7c00' }}>Create your own report at Riazify</a>
                </div>
            </div>
        </div>
    )
}
