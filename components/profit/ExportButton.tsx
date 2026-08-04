'use client'
// components/profit/ExportButton.tsx
// Export profit calculations to CSV or PDF
// Connect to page.tsx with:
//   import { ExportButton } from '@/components/profit/ExportButton'
//   <ExportButton state={state} result={result} country={country} meta={meta} sym={sym} />

import React, { useState } from 'react'
import { Download, FileText, FileSpreadsheet, X, Link2, Check } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
    lime: '#8fff00',
    limeDeep: '#4a7c00',
    dark: '#1a2410',
    border: '#e8ede2',
    muted: '#8a9e78',
    surface: '#ffffff',
    bg: '#f7f9f5',
    text: '#1a2410',
    red: '#b91c1c',
    amber: '#d97706',
    green: '#16a34a',
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ExportProps {
    state: any
    result: any | undefined
    country: string
    meta: any
    sym: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(val: number, sym: string, decimals = 2): string {
    const abs = Math.abs(val)
    const formatted = abs >= 1000000000000 ? `${(abs / 1000000000000).toFixed(2)}T` :
        abs >= 1000000000 ? `${(abs / 1000000000).toFixed(2)}B` :
            abs >= 1000000 ? `${(abs / 1000000).toFixed(2)}M` :
                abs.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    return `${val < 0 ? '-' : '+'}${sym}${formatted}`
}
function fmtPlain(val: number, sym: string, decimals = 2): string {
    const abs = Math.abs(val)
    const formatted = abs >= 1000000000000 ? `${(abs / 1000000000000).toFixed(2)}T` :
        abs >= 1000000000 ? `${(abs / 1000000000).toFixed(2)}B` :
            abs >= 1000000 ? `${(abs / 1000000).toFixed(2)}M` :
                abs.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    return `${sym}${formatted}`
}
function fmtPct(val: number): string {
    return `${val.toFixed(1)}%`
}
function today(): string {
    return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function nowTime(): string {
    return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const COUNTRY_LABEL: Record<string, string> = {
    US: 'United States', UK: 'United Kingdom', CA: 'Canada', AU: 'Australia',
    DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain', AT: 'Austria',
    IE: 'Ireland', BE: 'Belgium', NL: 'Netherlands', PL: 'Poland', CH: 'Switzerland',
}

const VAT_THRESHOLD: Record<string, { amount: number; label: string }> = {
    UK: { amount: 90000, label: '£90,000' },
    CA: { amount: 30000, label: 'C$30,000' },
    DE: { amount: 22000, label: '€22,000' },
    FR: { amount: 85800, label: '€85,800' },
    IT: { amount: 85000, label: '€85,000' },
    ES: { amount: 85000, label: '€85,000' },
    AT: { amount: 42000, label: '€42,000' },
    IE: { amount: 80000, label: '€80,000' },
    BE: { amount: 25000, label: '€25,000' },
    NL: { amount: 20000, label: '€20,000' },
    PL: { amount: 200000, label: '200,000 zł' },
    CH: { amount: 100000, label: 'CHF 100,000' },
    AU: { amount: 75000, label: 'A$75,000' },
}

// ── CSV Builder ───────────────────────────────────────────────────────────────
function buildCSV(state: any, result: any, country: string, meta: any, sym: string): string {
    if (!result) return ''

    const vat = VAT_THRESHOLD[country]
    const annualRev = state.annualRevenue || 0
    const vatHeadroom = vat ? Math.max(vat.amount - annualRev, 0) : 0
    const lotSizeN = Math.max(1, state.lotSize || 1)
    const sellQtyN = Math.max(1, state.sellQuantity || 1)
    const isMultiLot = lotSizeN > 1
    const isMultiQty = sellQtyN > 1

    const rows: [string, string][] = [
        ['RIAZIFY PROFIT CALCULATOR REPORT', ''],
        ['Generated', today()],
        ['', ''],

        ['MARKETPLACE', ''],
        ['Country', COUNTRY_LABEL[country] ?? country],
        ['eBay Site', country === 'UK' ? 'ebay.co.uk' : country === 'AU' ? 'ebay.com.au' : country === 'US' ? 'ebay.com' : `ebay.${country.toLowerCase()}`],
        ['', ''],

        ['SELLER SETUP', ''],
        ['Seller Level', state.isTopRatedPlus ? 'Top Rated Plus' : state.isBelowStandard ? 'Below Standard' : 'Above Standard'],
        ['Store Tier', (() => {
            if (country === 'US' && state.usStoreTier !== 'none') return state.usStoreTier
            if (country === 'UK' && state.ukStoreTier !== 'none') return state.ukStoreTier
            if (country === 'CA' && state.caStoreTier !== 'none') return state.caStoreTier
            if (country === 'DE' && state.deShopTier !== 'none') return state.deShopTier
            return 'No store'
        })()],
        ['', ''],

        ['PRICING', ''],
        ['Selling Price', fmtPlain(state.sellingPrice, sym)],
        ['Buy Price', fmtPlain(state.buyPrice, sym)],
        ['Shipping Cost', fmtPlain(state.shippingCost || 0, sym)],
        ['Buyer Paid Shipping', fmtPlain(state.buyerPaidShipping || 0, sym)],
        ['Buyer Tax %', fmtPct(state.buyerTaxPercent || 0)],
        ['', ''],

        ['EBAY FEES', ''],
        ['Category Fee %', fmtPct(result.effectiveCatFeePercent ?? state.categoryFeePercent)],
        ['Final Value Fee', fmt(-(result.finalValueFeeOnly || 0), sym)],
        ['Promoted Ad Fee (PLS)', fmt(-(result.promotedAdFee || 0), sym)],
        ['CPC Ad Fee (PLA)', fmt(-(result.cpcAdFee || 0), sym)],
        ['Regulatory Fee', fmt(-(result.regulatoryFee || 0), sym)],
        ['Cross-border Fee', fmt(-(result.crossBorderFee || 0), sym)],
        ['VAT on Fees', fmt(-(result.vatOnFees || 0), sym)],
        ['Total eBay Fees', fmt(-(result.totalEbayFees || 0), sym)],
        ['', ''],

        ['ADVANCED COSTS', ''],
        ['Sourcing Tax %', fmtPct(state.sourcingTaxPercent || 0)],
        ['Payout Fee %', fmtPct(state.payoutFeePercent || 0)],
        ['Cashback %', fmtPct(state.cashbackPercent || 0)],
        ['Cashback Amount', fmt(result.totalCashback || 0, sym)],
        ['Advanced Deductions', fmt(-(result.advancedDeductions || 0), sym)],
        ...(state.fxEnabled ? [
            ['FX Buy Currency', state.buyCurrency] as [string, string],
            ['FX Rate', `1 ${state.buyCurrency} = ${state.fxRate} ${sym}`] as [string, string],
            ['Bank FX Fee %', fmtPct(state.fxFeePercent || 0)] as [string, string],
        ] : []),
        ['', ''],

        ['RESULTS', ''],
        ['Total Revenue', fmt(result.totalRevenue, sym)],
        ['Total Costs', fmt(-result.totalCosts, sym)],
        ['Total eBay Fees', fmt(-result.totalEbayFees, sym)],
        ['Output VAT Owed', fmt(-(result.outputVATOwed || 0), sym)],
        ['NET PROFIT', fmt(result.netProfit, sym)],
        ['MARGIN', fmtPct(result.profitMargin)],
        ['ROI', fmtPct(result.roi)],
        ['BREAK EVEN PRICE', fmtPlain(result.breakEvenPrice, sym)],
        ['Max Safe Ad Rate', fmtPct(result.maxSafeAdRatePercent)],
        ['', ''],

        ...(isMultiLot || isMultiQty ? [
            ['LOT SIZE / MULTI-QUANTITY', ''] as [string, string],
            ['Lot Size', String(lotSizeN)] as [string, string],
            ['Sell Quantity', String(sellQtyN)] as [string, string],
            ['Cost Per Unit', fmtPlain(result.costPerUnit || 0, sym)] as [string, string],
            ['Profit Per Unit', fmt(result.netProfit, sym)] as [string, string],
            ['Total Profit', fmt(result.totalProfit || 0, sym)] as [string, string],
            ['Total Revenue (all)', fmt(result.totalRevenue_qty || 0, sym)] as [string, string],
            ['Total Fees (all)', fmt(-(result.totalFees_qty || 0), sym)] as [string, string],
            ['', ''] as [string, string],
        ] : []),

        ...(vat && annualRev > 0 ? [
            ['VAT / TAX THRESHOLD', ''] as [string, string],
            ['Annual eBay Revenue', fmtPlain(annualRev, sym)] as [string, string],
            ['Threshold', vat.label + '/yr'] as [string, string],
            ['Headroom', vatHeadroom > 0 ? fmtPlain(vatHeadroom, sym) : 'EXCEEDED'] as [string, string],
            ['Status', annualRev >= vat.amount ? 'EXCEEDED - Must register' : annualRev >= vat.amount * 0.85 ? 'APPROACHING threshold' : 'SAFE'] as [string, string],
            ['', ''] as [string, string],
        ] : []),

        ['REPORT INFO', ''],
        ['Generated by', 'Riazify Profit Calculator'],
        ['Website', 'riazify.com'],
        ['Fees verified', 'Official eBay fee pages'],
        ['Report date', today()],
    ]

    return rows.map(([label, value]) => {
        const safeLabel = label.includes(',') ? `"${label}"` : label
        const safeValue = String(value).includes(',') ? `"${value}"` : value
        return `${safeLabel},${safeValue}`
    }).join('\n')
}

// ── PDF HTML Builder ──────────────────────────────────────────────────────────
function buildPrintHTML(state: any, result: any, country: string, meta: any, sym: string): string {
    if (!result) return ''

    const profitColor = result.netProfit >= 0 ? '#16a34a' : '#b91c1c'
    const lotSizeN = Math.max(1, state.lotSize || 1)
    const sellQtyN = Math.max(1, state.sellQuantity || 1)
    const isMultiLot = lotSizeN > 1
    const isMultiQty = sellQtyN > 1
    const vat = VAT_THRESHOLD[country]
    const annualRev = state.annualRevenue || 0
    const storeLabel = (() => {
        if (country === 'US' && state.usStoreTier !== 'none') return state.usStoreTier
        if (country === 'UK' && state.ukStoreTier !== 'none') return state.ukStoreTier
        if (country === 'CA' && state.caStoreTier !== 'none') return state.caStoreTier
        if (country === 'DE' && state.deShopTier !== 'none') return state.deShopTier
        return 'No store'
    })()

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Riazify Profit Report — ${COUNTRY_LABEL[country]} — ${today()}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: #f7f9f5; color: #1a2410; padding: 32px; }
  .page { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: #1a2410; padding: 24px 32px; text-align: center; }

  /* Header */
  .header-brand { font-size: 22px; font-weight: 900; color: #8fff00; letter-spacing: -0.5px; }
  .header-sub { font-size: 12px; color: #8a9e78; margin-top: 2px; }
  .header-date { font-size: 11px; color: #8a9e78; text-align: right; }

  /* Hero stats */
  .hero { padding: 24px 32px; background: #fff; border-bottom: 1px solid #e8ede2; }
  .hero-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .hero-card { background: #fff; border-radius: 10px; padding: 14px; text-align: center; border: 1px solid #e8ede2; }
  .hero-label { font-size: 9px; font-weight: 700; color: #8a9e78; letter-spacing: 0.5px; margin-bottom: 6px; }
  .hero-value { font-size: 20px; font-weight: 900; }
  .hero-value.profit { color: ${profitColor}; }
  .hero-value.neutral { color: #1a2410; }

  /* Two column layout */
  .body { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .col { padding: 24px 32px; }
  .col:first-child { border-right: 1px solid #e8ede2; }

  /* Section */
  .section-title { font-size: 9px; font-weight: 800; color: #8a9e78; letter-spacing: 0.6px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e8ede2; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #f0f0ec; }
  .row:last-child { border-bottom: none; }
  .row-label { font-size: 11px; color: #8a9e78; }
  .row-value { font-size: 11px; font-weight: 700; color: #1a2410; }
  .row-value.positive { color: #16a34a; }
  .row-value.negative { color: #b91c1c; }
  .row-value.highlight { font-size: 13px; color: #1a2410; }

  /* Ledger total row */
  .row.total { border-top: 2px solid #1a2410; margin-top: 4px; padding-top: 8px; }
  .row.total .row-label { font-weight: 800; font-size: 12px; color: #1a2410; }
  .row.total .row-value { font-size: 14px; font-weight: 900; }

  /* Multi section */
  .multi-box { background: #f0fdf4; border: 1px solid #8fff00; border-radius: 8px; padding: 12px; margin-top: 12px; }
  .multi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 8px; }
  .multi-card { background: #fff; border-radius: 6px; padding: 8px; text-align: center; }
  .multi-label { font-size: 8px; font-weight: 700; color: #8a9e78; letter-spacing: 0.4px; }
  .multi-value { font-size: 13px; font-weight: 800; color: #1a2410; margin-top: 2px; }

  /* Footer */
  .footer { padding: 16px 32px; background: #fff; border-top: 1px solid #e8ede2; display: flex; justify-content: space-between; align-items: center; }
  .footer-left { font-size: 10px; color: #8a9e78; }
  .footer-right { font-size: 10px; color: #8a9e78; text-align: right; }

  @media print {
    body { background: #fff; padding: 0; margin: 0; }
    .page { box-shadow: none; border-radius: 0; max-width: 100% !important; margin: 0 !important; }
    .header { border-radius: 0 !important; }
    @page { size: A4; margin: 0; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header" style="text-align: center;">
    <div class="header-brand">RIAZIFY</div>
    <div class="header-sub">eBay Profit Report — ${COUNTRY_LABEL[country] ?? country}</div>
  </div>

  <!-- Hero Stats -->
  <div class="hero">
    <div class="hero-grid">
      <div class="hero-card">
        <div class="hero-label">NET PROFIT</div>
        <div class="hero-value profit">${fmt(result.netProfit, sym)}</div>
      </div>
      <div class="hero-card">
        <div class="hero-label">MARGIN</div>
        <div class="hero-value neutral">${fmtPct(result.profitMargin)}</div>
      </div>
      <div class="hero-card">
        <div class="hero-label">ROI</div>
        <div class="hero-value neutral">${fmtPct(result.roi)}</div>
      </div>
      <div class="hero-card">
        <div class="hero-label">BREAK EVEN</div>
        <div class="hero-value neutral">${fmtPlain(result.breakEvenPrice, sym)}</div>
      </div>
    </div>
  </div>

  <!-- Body -->
  <div class="body">

    <!-- Left column: Seller setup + Pricing -->
    <div class="col">
      <div class="section-title">SELLER SETUP</div>
      ${[
            ['Country', COUNTRY_LABEL[country] ?? country],
            ['Seller Level', state.isTopRatedPlus ? 'Top Rated Plus' : state.isBelowStandard ? 'Below Standard' : 'Above Standard'],
            ['Store', storeLabel],
        ].map(([l, v]) => `<div class="row"><span class="row-label">${l}</span><span class="row-value">${v}</span></div>`).join('')}

      <div class="section-title" style="margin-top:16px;">PRICING</div>
      ${[
            ['Selling Price', fmtPlain(state.sellingPrice, sym)],
            ['Buy Price', fmtPlain(state.buyPrice, sym)],
            ['Shipping Cost', fmtPlain(state.shippingCost || 0, sym)],
            ['Buyer Paid Shipping', fmtPlain(state.buyerPaidShipping || 0, sym)],
            ['Buyer Tax %', fmtPct(state.buyerTaxPercent || 0)],
        ].map(([l, v]) => `<div class="row"><span class="row-label">${l}</span><span class="row-value">${v}</span></div>`).join('')}

      ${state.fxEnabled ? `
      <div class="section-title" style="margin-top:16px;">FX CONVERSION</div>
      ${[
                ['Buy Currency', state.buyCurrency],
                ['FX Rate', `1 ${state.buyCurrency} = ${state.fxRate} ${sym}`],
                ['Bank FX Fee', fmtPct(state.fxFeePercent || 0)],
            ].map(([l, v]) => `<div class="row"><span class="row-label">${l}</span><span class="row-value">${v}</span></div>`).join('')}` : ''}

      ${(isMultiLot || isMultiQty) ? `
      <div class="multi-box">
        <div style="font-size:10px;font-weight:800;color:#4a7c00;">LOT SIZE / MULTI-QUANTITY</div>
        <div class="multi-grid">
          ${isMultiLot ? `<div class="multi-card"><div class="multi-label">COST/UNIT</div><div class="multi-value">${fmtPlain(result.costPerUnit || 0, sym)}</div></div>` : ''}
          <div class="multi-card"><div class="multi-label">PROFIT/UNIT</div><div class="multi-value">${fmt(result.netProfit, sym)}</div></div>
          ${isMultiQty ? `<div class="multi-card"><div class="multi-label">TOTAL PROFIT</div><div class="multi-value">${fmt(result.totalProfit || 0, sym)}</div></div>` : ''}
        </div>
        ${isMultiQty ? `<div style="font-size:9px;color:#4a7c00;margin-top:8px;">Lot of ${lotSizeN} × ${sellQtyN} sales = ${sym}${(result.totalRevenue_qty || 0).toFixed(2)} total revenue</div>` : ''}
      </div>` : ''}
    </div>

    <!-- Right column: Transaction Ledger -->
    <div class="col">
      <div class="section-title">TRANSACTION LEDGER</div>

      ${[
            ['Revenue (price + ship)', fmt(result.totalRevenue, sym), 'positive'],
            ['Item and shipping costs', fmt(-result.totalCosts, sym), 'negative'],
            ['eBay Final Value Fee', fmt(-result.finalValueFeeOnly, sym), 'negative'],
            ...(result.promotedAdFee > 0 ? [['Promoted Listings (PLS)', fmt(-result.promotedAdFee, sym), 'negative']] : []),
            ...(result.cpcAdFee > 0 ? [['PLA CPC Ad Fee', fmt(-result.cpcAdFee, sym), 'negative']] : []),
            ...(result.regulatoryFee > 0 ? [['Regulatory Fee', fmt(-result.regulatoryFee, sym), 'negative']] : []),
            ...(result.crossBorderFee > 0 ? [['Cross-border Fee', fmt(-result.crossBorderFee, sym), 'negative']] : []),
            ...(result.vatOnFees > 0 ? [['VAT on Fees', fmt(-result.vatOnFees, sym), 'negative']] : []),
            ...(result.advancedDeductions > 0 ? [['Advanced Deductions', fmt(-result.advancedDeductions, sym), 'negative']] : []),
            ...(result.totalCashback > 0 ? [['Cashback', fmt(result.totalCashback, sym), 'positive']] : []),
            ...(result.outputVATOwed > 0 ? [['Output VAT Owed', fmt(-result.outputVATOwed, sym), 'negative']] : []),
        ].map(([l, v, cls]) => `<div class="row"><span class="row-label">${l}</span><span class="row-value ${cls}">${v}</span></div>`).join('')}

      <div class="row total">
        <span class="row-label">NET PROFIT</span>
        <span class="row-value" style="color:${profitColor}">${fmt(result.netProfit, sym)}</span>
      </div>

      <div class="section-title" style="margin-top:16px;">ADVANCED</div>
      ${[
            ['Sourcing Tax %', fmtPct(state.sourcingTaxPercent || 0)],
            ['Payout Fee %', fmtPct(state.payoutFeePercent || 0)],
            ['Cashback %', fmtPct(state.cashbackPercent || 0)],
            ['Ad Rate (PLS) %', fmtPct(state.adRatePercent || 0)],
            ['Max Safe Ad Rate', fmtPct(result.maxSafeAdRatePercent)],
        ].map(([l, v]) => `<div class="row"><span class="row-label">${l}</span><span class="row-value">${v}</span></div>`).join('')}

      ${vat && annualRev > 0 ? `
      <div class="section-title" style="margin-top:16px;">VAT THRESHOLD</div>
      ${[
                ['Annual Revenue', fmtPlain(annualRev, sym)],
                ['Threshold', vat.label + '/yr'],
                ['Status', annualRev >= vat.amount ? 'EXCEEDED' : annualRev >= vat.amount * 0.85 ? 'APPROACHING' : 'SAFE'],
                ['Headroom', Math.max(vat.amount - annualRev, 0) > 0 ? fmtPlain(Math.max(vat.amount - annualRev, 0), sym) : 'N/A'],
            ].map(([l, v]) => `<div class="row"><span class="row-label">${l}</span><span class="row-value ${v === 'EXCEEDED' ? 'negative' : v === 'APPROACHING' ? '' : 'positive'}">${v}</span></div>`).join('')}` : ''}
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">
      Generated by <strong>Riazify</strong> · riazify.com<br>
      eBay fees verified against official eBay fee pages
    </div>
    <div class="footer-right">
      ${today()} · ${nowTime()}<br>
      ${country === 'UK' ? 'ebay.co.uk' : country === 'AU' ? 'ebay.com.au' : country === 'US' ? 'ebay.com' : `ebay.${country.toLowerCase()}`} · All fees in ${sym === '$' ? 'USD' : sym === '£' ? 'GBP' : sym === '€' ? 'EUR' : sym}
    </div>
  </div>

</div>
</body>
</html>`
}

// ═══════════════════════════════════════════════════════════════════════════ //
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════ //
export function ExportButton({ state, result, country, meta, sym }: ExportProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState<'csv' | 'pdf' | 'share' | null>(null)
    const [toast, setToast] = useState<string | null>(null)
    const [shareModal, setShareModal] = useState<{ url: string; copied: boolean } | null>(null)

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    const disabled = (state.sellingPrice ?? 0) <= 0 || (state.buyPrice ?? 0) <= 0

    // ── CSV Export ──────────────────────────────────────────────────────────
    const exportCSV = () => {
        setLoading('csv')
        try {
            const csv = buildCSV(state, result, country, meta, sym)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `riazify-profit-${country.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            setIsOpen(false)
        } finally {
            setLoading(null)
        }
    }

    // ── Share Link ──────────────────────────────────────────────────────────
    const shareLink = async () => {
        setLoading('share')
        try {
            // Create a fingerprint of the key calculation fields
            const fingerprint = JSON.stringify({
                country,
                sellingPrice: state.sellingPrice,
                buyPrice: state.buyPrice,
                shippingCost: state.shippingCost,
                categoryFeePercent: state.categoryFeePercent,
                sourcingTaxPercent: state.sourcingTaxPercent,
                payoutFeePercent: state.payoutFeePercent,
                cashbackPercent: state.cashbackPercent,
                adRatePercent: state.adRatePercent,
                isTopRatedPlus: state.isTopRatedPlus,
                isBelowStandard: state.isBelowStandard,
                fxEnabled: state.fxEnabled,
                fxRate: state.fxRate,
                lotSize: state.lotSize,
                sellQuantity: state.sellQuantity,
            })

            // Check if identical calculation already has an active link
            const { data: existing } = await supabase
                .from('shared_reports')
                .select('id, expires_at')
                .eq('fingerprint', fingerprint)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            let id: string

            if (existing) {
                // Reuse existing link
                id = existing.id
            } else {
                // Create new link
                id = Math.random().toString(36).slice(2, 8)
                const { error } = await supabase
                    .from('shared_reports')
                    .insert({
                        id,
                        country,
                        state,
                        result: result ?? {},
                        fingerprint,
                        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    })
                if (error) throw error
            }

            const url = `${window.location.origin}/share/${id}`
            await navigator.clipboard.writeText(url)
            setLoading(null)
            setIsOpen(false)
            setShareModal({ url, copied: true })
        } catch {
            setLoading(null)
            showToast('Failed to generate link. Please try again.')
        }
    }
    const exportPDF = () => {
        setLoading('pdf')
        try {
            const ebaySite = country === 'UK' ? 'ebay.co.uk' : country === 'AU' ? 'ebay.com.au' : country === 'US' ? 'ebay.com' : `ebay.${country.toLowerCase()}`
            const reportHTML = buildPrintHTML(state, result, country, meta, sym)

            const previewHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Riazify Profit Report — ${COUNTRY_LABEL[country]} — ${today()}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, sans-serif; background: #fff; margin: 0; }
  .topbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
    background: #1a2410; padding: 12px 24px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }
  .topbar-left { display: flex; flex-direction: column; gap: 2px; }
  .topbar-title { font-size: 13px; font-weight: 700; color: #8fff00; }
  .topbar-sub { font-size: 11px; color: #8a9e78; }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
  .btn-print {
    display: flex; align-items: center; gap: 8px;
    background: #8fff00; color: #1a2410;
    border: none; border-radius: 8px;
    padding: 10px 20px; font-size: 13px; font-weight: 800;
    cursor: pointer;
  }
  .btn-close {
    background: rgba(255,255,255,0.1); color: #ccc;
    border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
    padding: 10px 16px; font-size: 12px; font-weight: 700;
    cursor: pointer;
  }
  .preview-wrap {
    padding: 56px 0 0;
    display: flex; justify-content: center;
    align-items: flex-start;
  }
  iframe {
    width: 100%;
    border: none;
    border-radius: 0;
    box-shadow: none;
    background: #fff;
    display: block;
  }
  @media print {
    .topbar { display: none !important; }
    .preview-wrap { padding: 0; display: block; }
    body { background: #fff; }
    .page { max-width: 100% !important; border-radius: 0 !important; box-shadow: none !important; }
    .header { width: 100% !important; }
    iframe { width: 100%; box-shadow: none; border-radius: 0; height: 100vh; }
    @page { size: A4; margin: 0; }
  }
</style>
</head>
<body>
  <div class="topbar">
    <div class="topbar-left">
      <span class="topbar-title">Riazify Profit Report</span>
      <span class="topbar-sub">${COUNTRY_LABEL[country] ?? country} · ${ebaySite} · ${today()}</span>
    </div>
    <div class="topbar-right">
      <button class="btn-close" onclick="window.close()">✕ Close</button>
      <button class="btn-print" onclick="document.getElementById('report').contentWindow.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
        Save as PDF
      </button>
    </div>
  </div>
  <div class="preview-wrap">
    <iframe id="report" frameborder="0"></iframe>
  </div>
  <script>
    var iframe = document.getElementById('report');
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(${JSON.stringify(reportHTML)});
    doc.close();
    setTimeout(function() {
      iframe.style.height = (doc.body.scrollHeight + 40) + 'px';
    }, 200);
  </script>
</body>
</html>`

            const win = window.open('', '_blank')
            if (!win) { setLoading(null); showToast('Please allow popups to export PDF'); return }
            win.document.write(previewHTML)
            win.document.close()
            win.focus()
            setLoading(null)
            setIsOpen(false)
        } catch {
            setLoading(null)
        }
    }

    return (
        <div style={{ position: 'relative' }}>
            {/* Trigger button */}
            <button
                onClick={() => !disabled && setIsOpen((o: boolean) => !o)}
                disabled={disabled}
                title={disabled ? 'Enter selling price and buy price first' : 'Export profit report'} style={{
                    height: 36, padding: '0 14px', borderRadius: 8, flexShrink: 0,
                    border: `1px solid ${C.border}`, background: C.surface, color: C.text,
                    fontWeight: 700, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: disabled ? 0.5 : 1,
                    transition: 'all 0.15s',
                }}
            >
                <Download size={13} color={C.muted} />
                Export
            </button>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                    background: C.dark, color: C.lime, fontSize: 12, fontWeight: 700,
                    padding: '10px 18px', borderRadius: 999, zIndex: 9999,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                }}>
                    <Check size={13} color={C.lime} /> {toast}
                </div>
            )}

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 8999 }} />

                    {/* Menu */}
                    <div style={{
                        position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 12, padding: 8, zIndex: 9000,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        minWidth: 200, display: 'flex', flexDirection: 'column', gap: 4,
                    }}>
                        <p style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: '0.4px', padding: '4px 8px 0', margin: 0 }}>EXPORT PROFIT REPORT</p>

                        {/* Share button */}
                        <button
                            onClick={shareLink}
                            disabled={loading !== null}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: 8, border: 'none',
                                background: C.surface, cursor: 'pointer', textAlign: 'left', width: '100%',
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = C.bg)}
                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = C.surface)}
                        >
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Link2 size={15} color="#3b82f6" />
                            </div>
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>
                                    {loading === 'share' ? 'Generating link...' : 'Share via link'}
                                </p>
                                <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>Copy shareable link · expires in 7 days</p>
                            </div>
                        </button>

                        <div style={{ height: 1, background: C.border, margin: '4px 0' }} />

                        {/* PDF button */}
                        <button
                            onClick={exportPDF}
                            disabled={loading !== null}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: 8, border: 'none',
                                background: loading === 'pdf' ? C.bg : C.surface,
                                cursor: 'pointer', textAlign: 'left', width: '100%',
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = C.bg)}
                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = C.surface)}
                        >
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FileText size={15} color={C.red} />
                            </div>
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>
                                    {loading === 'pdf' ? 'Opening...' : 'Export as PDF'}
                                </p>
                                <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>Professional report, share with suppliers</p>
                            </div>
                        </button>

                        {/* CSV button */}
                        <button
                            onClick={exportCSV}
                            disabled={loading !== null}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: 8, border: 'none',
                                background: loading === 'csv' ? C.bg : C.surface,
                                cursor: 'pointer', textAlign: 'left', width: '100%',
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = C.bg)}
                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = C.surface)}
                        >
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FileSpreadsheet size={15} color={C.green} />
                            </div>
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>
                                    {loading === 'csv' ? 'Downloading...' : 'Export as CSV'}
                                </p>
                                <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>Full breakdown, open in Excel or Sheets</p>
                            </div>
                        </button>

                        {/* What's included note */}
                        <div style={{ margin: '4px 8px 4px', padding: 8, background: C.bg, borderRadius: 8 }}>
                            <p style={{ fontSize: 9, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                                Includes: all fees, profit, margin, ROI, break-even, seller setup, VAT status{(state.lotSize > 1 || state.sellQuantity > 1) ? ', lot size totals' : ''}{state.fxEnabled ? ', FX conversion' : ''}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* ── Share Modal ─────────────────────────────────────────────── */}
            {shareModal && (
                <div
                    onClick={e => { if (e.target === e.currentTarget) setShareModal(null) }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                >
                    <div style={{ background: C.surface, borderRadius: 16, width: '100%', maxWidth: 420, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0 }}>Share Profit Report</p>
                                <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>Anyone with this link can view your report</p>
                            </div>
                            <button onClick={() => setShareModal(null)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <X size={13} color={C.muted} />
                            </button>
                        </div>

                        {/* Link box */}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div style={{ flex: 1, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', fontSize: 12, fontWeight: 600, color: C.text, wordBreak: 'break-all' }}>
                                {shareModal.url}
                            </div>
                            <button
                                onClick={async () => {
                                    await navigator.clipboard.writeText(shareModal.url)
                                    setShareModal({ ...shareModal, copied: true })
                                }}
                                style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 8, border: `1.5px solid ${shareModal.copied ? C.lime : C.border}`, background: shareModal.copied ? '#f0fdf4' : C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Copy link"
                            >
                                {shareModal.copied
                                    ? <Check size={15} color={C.limeDeep} />
                                    : <Link2 size={15} color={C.muted} />
                                }
                            </button>
                        </div>

                        {/* Copied status */}
                        {shareModal.copied && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: `1px solid ${C.lime}`, borderRadius: 8, padding: '8px 12px' }}>
                                <Check size={13} color={C.limeDeep} />
                                <p style={{ fontSize: 11, fontWeight: 700, color: C.limeDeep, margin: 0 }}>Link copied to clipboard!</p>
                            </div>
                        )}

                        {/* Expiry info */}
                        <p style={{ fontSize: 10, color: C.muted, margin: 0, textAlign: 'center' }}>
                            This link expires in <strong>7 days</strong> and is then permanently deleted
                        </p>

                        {/* Done button */}
                        <button
                            onClick={() => setShareModal(null)}
                            style={{ width: '100%', height: 38, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: C.text }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
