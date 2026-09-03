'use client'

// app/dashboard/profit-calculator/page.tsx (or app/profit-calculator/page.tsx)
// Riazify Precision Margin & Profit Engine — v2.0

import React, { useState, useId } from 'react'
import {
    Calculator,
    ArrowLeftRight,
    Tag,
    ShieldCheck,
    Sparkles,
    Check,
    Copy,
    AlertTriangle,
    RefreshCw,
    TrendingUp,
    Info,
    DollarSign
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

// ── Riazify Color Role Tokens (v2.0) ──────────────────────────
const C = {
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

export type CalculatorTab = 'calculator' | 'reverse' | 'best_offer' | 'map_guard'

const EBAY_CATEGORIES = [
    { name: 'Most Categories (General)', standardFee: 0.1325, basicStoreFee: 0.1235 },
    { name: 'Computers & Tablets / Electronics', standardFee: 0.0935, basicStoreFee: 0.0735 },
    { name: 'Guitars & Musical Instruments', standardFee: 0.0635, basicStoreFee: 0.0535 },
    { name: 'Men’s & Women’s Athletic Shoes ($150+)', standardFee: 0.0800, basicStoreFee: 0.0800 },
    { name: 'Collectibles & Trading Cards', standardFee: 0.1325, basicStoreFee: 0.1235 },
    { name: 'Clothing, Shoes & Accessories', standardFee: 0.1325, basicStoreFee: 0.1235 },
    { name: 'Jewelry & Watches (< $1,000)', standardFee: 0.1500, basicStoreFee: 0.1250 },
    { name: 'Heavy Equipment & Business/Industrial', standardFee: 0.0300, basicStoreFee: 0.0250 },
]

export default function ProfitCalculatorPage() {
    const [activeTab, setActiveTab] = useState<CalculatorTab>('calculator')
    const [copied, setCopied] = useState(false)

    // ── Standard Calculator States ──
    const [soldPrice, setSoldPrice] = useState<number>(49.99)
    const [itemCost, setItemCost] = useState<number>(18.00)
    const [shippingCharged, setShippingCharged] = useState<number>(5.50)
    const [actualShipping, setActualShipping] = useState<number>(4.85)
    const [categoryIndex, setCategoryIndex] = useState<number>(0)
    const [hasEbayStore, setHasEbayStore] = useState<boolean>(true)
    const [promotedRate, setPromotedRate] = useState<number>(3.0)
    const [isInternational, setIsInternational] = useState<boolean>(false)
    const returnBufferPercent = 1.5

    // ── Reverse Engine States ──
    const [targetNetProfit, setTargetNetProfit] = useState<number>(20.00)
    const [reverseCost, setReverseCost] = useState<number>(15.00)
    const [reverseShippingCost, setReverseShippingCost] = useState<number>(5.00)

    // ── Best Offer States ──
    const [originalPrice, setOriginalPrice] = useState<number>(59.99)
    const [buyerOffer, setBuyerOffer] = useState<number>(45.00)
    const [offerCost, setOfferCost] = useState<number>(18.00)

    // ── MAP Guard States ──
    const [vendorMap, setVendorMap] = useState<number>(49.99)
    const [testedPrice, setTestedPrice] = useState<number>(44.99)

    const standardCategorySelectId = useId()

    // ── Computations ──
    const selectedCat = EBAY_CATEGORIES[categoryIndex] || EBAY_CATEGORIES[0]
    const feeRate = hasEbayStore ? selectedCat.basicStoreFee : selectedCat.standardFee

    const estimatedSalesTax = (soldPrice + shippingCharged) * 0.07
    const grossTransaction = soldPrice + shippingCharged + estimatedSalesTax
    const finalValueFee = grossTransaction * feeRate + 0.30
    const adFee = soldPrice * (promotedRate / 100)
    const internationalFee = isInternational ? grossTransaction * 0.0165 : 0
    const returnBuffer = soldPrice * (returnBufferPercent / 100)
    const totalFees = finalValueFee + adFee + internationalFee
    const netProfit = (soldPrice + shippingCharged) - (itemCost + actualShipping + totalFees + returnBuffer)
    const totalRevenue = soldPrice + shippingCharged
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    const costBase = itemCost + actualShipping
    const roiPercent = costBase > 0 ? (netProfit / costBase) * 100 : 0

    let roiGrade = 'A+'
    let roiGradeColor = 'bg-[#b8fa33] text-[#1e1535]'
    if (roiPercent >= 100) {
        roiGrade = 'A+'
        roiGradeColor = 'bg-[#b8fa33] text-[#1e1535]'
    } else if (roiPercent >= 60) {
        roiGrade = 'A'
        roiGradeColor = 'bg-[#b8fa33] text-[#1e1535]'
    } else if (roiPercent >= 35) {
        roiGrade = 'B+'
        roiGradeColor = 'bg-[#7530fb] text-white'
    } else if (roiPercent >= 20) {
        roiGrade = 'B'
        roiGradeColor = 'bg-[#7530fb] text-white'
    } else if (roiPercent >= 10) {
        roiGrade = 'C'
        roiGradeColor = 'bg-amber-500 text-white'
    } else {
        roiGrade = 'D'
        roiGradeColor = 'bg-red-500 text-white'
    }

    const divisor = 1 - (feeRate * 1.07) - (promotedRate / 100) - (isInternational ? 0.0165 * 1.07 : 0) - (returnBufferPercent / 100)
    const breakEvenPrice = divisor > 0
        ? Math.max(0, (itemCost + actualShipping - shippingCharged + 0.30) / divisor)
        : 0

    const safeFloorPrice = (divisor - 0.20) > 0
        ? Math.max(0, (itemCost + actualShipping - shippingCharged + 0.30) / (divisor - 0.20))
        : breakEvenPrice * 1.3

    const sweetSpotPrice = safeFloorPrice * 1.22

    const reverseDivisor = 1 - (feeRate * 1.07) - 0.03
    const calculatedReversePrice = reverseDivisor > 0
        ? (targetNetProfit + reverseCost + reverseShippingCost + 0.30) / reverseDivisor
        : 0

    const offerTotalRev = buyerOffer + shippingCharged
    const offerGrossTx = offerTotalRev * 1.07
    const offerFvf = offerGrossTx * feeRate + 0.30
    const offerNetProfit = offerTotalRev - (offerCost + actualShipping + offerFvf + (buyerOffer * (promotedRate / 100)))
    const offerMargin = offerTotalRev > 0 ? (offerNetProfit / offerTotalRev) * 100 : 0
    const discountPercent = originalPrice > 0 ? ((originalPrice - buyerOffer) / originalPrice) * 100 : 0
    const recommendedCounter = Math.round((originalPrice + buyerOffer) / 2 * 100) / 100

    const handleCopyBreakdown = () => {
        const summary = `eBay Profit Breakdown (Riazify):\n• Sold Price: $${soldPrice.toFixed(2)}\n• Item Cost: $${itemCost.toFixed(2)}\n• Net Profit: $${netProfit.toFixed(2)}\n• Margin: ${profitMargin.toFixed(1)}%\n• ROI: ${roiPercent.toFixed(1)}% (Grade: ${roiGrade})\n• Break-Even: $${breakEvenPrice.toFixed(2)}\n• Safe Floor: $${safeFloorPrice.toFixed(2)}`
        navigator.clipboard.writeText(summary)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const loadPreset = (preset: string) => {
        if (preset === 'sneakers') {
            setSoldPrice(145.00)
            setItemCost(65.00)
            setShippingCharged(0)
            setActualShipping(12.50)
            setCategoryIndex(3)
            setPromotedRate(4.0)
        } else if (preset === 'electronics') {
            setSoldPrice(289.00)
            setItemCost(150.00)
            setShippingCharged(14.99)
            setActualShipping(13.20)
            setCategoryIndex(1)
            setPromotedRate(2.5)
        } else if (preset === 'cards') {
            setSoldPrice(42.50)
            setItemCost(12.00)
            setShippingCharged(4.50)
            setActualShipping(3.80)
            setCategoryIndex(4)
            setPromotedRate(5.0)
        } else {
            setSoldPrice(49.99)
            setItemCost(18.00)
            setShippingCharged(5.50)
            setActualShipping(4.85)
            setCategoryIndex(0)
            setPromotedRate(3.0)
        }
    }

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg }} className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* ── Header Bar ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-xs"
                    style={{ borderColor: C.border }}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center border"
                                style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
                                <Calculator size={18} style={{ color: C.primary }} />
                            </div>
                            <h1 className="text-[22px] sm:text-[24px] font-black font-syne tracking-tight" style={{ color: C.textDark }}>
                                eBay Profit &amp; Margin Engine
                            </h1>
                        </div>
                        <p className="text-[13px]" style={{ color: C.muted }}>
                            Live scenario modeling, FVF commission breakdowns, Promoted Ads tracking &amp; MAP compliance.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => loadPreset('default')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] font-bold font-syne transition-colors hover:bg-[#f8f7ff] cursor-pointer"
                            style={{ borderColor: C.border, color: C.textDark }}
                        >
                            <RefreshCw size={13} style={{ color: C.muted }} />
                            <span>Reset Values</span>
                        </button>
                        <button
                            onClick={handleCopyBreakdown}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold font-syne transition-transform hover:scale-105 cursor-pointer shadow-xs"
                            style={{ backgroundColor: C.accent, color: C.dark }}
                        >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                            <span>{copied ? 'Copied Summary!' : 'Copy Summary'}</span>
                        </button>
                    </div>
                </div>

                {/* ── Sub-Navigation Tabs ── */}
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border overflow-x-auto shadow-xs"
                    style={{ borderColor: C.border }}>
                    {[
                        { id: 'calculator', label: 'Profit Calculator', icon: Calculator },
                        { id: 'reverse', label: 'Reverse Price Engine', icon: ArrowLeftRight },
                        { id: 'best_offer', label: 'Best Offer Tester', icon: Tag },
                        { id: 'map_guard', label: 'MAP Safety Guard', icon: ShieldCheck },
                    ].map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as CalculatorTab)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold font-syne transition-all cursor-pointer whitespace-nowrap ${isActive ? 'shadow-xs' : 'hover:bg-[#f8f7ff]'
                                    }`}
                                style={{
                                    backgroundColor: isActive ? C.primary : 'transparent',
                                    color: isActive ? '#ffffff' : C.muted,
                                }}
                            >
                                <Icon size={15} />
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* ── TAB 1: PROFIT CALCULATOR ── */}
                {activeTab === 'calculator' && (
                    <div className="space-y-6">

                        {/* Quick Presets Bar */}
                        <div className="flex items-center justify-between gap-2 flex-wrap bg-white p-3.5 rounded-xl border" style={{ borderColor: C.border }}>
                            <span className="text-[11px] font-bold uppercase font-syne tracking-wider" style={{ color: C.muted }}>
                                Category Presets:
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => loadPreset('sneakers')}
                                    className="px-3 py-1 rounded-lg border text-[11.5px] font-bold font-syne hover:bg-[#f8f7ff] cursor-pointer"
                                    style={{ borderColor: C.border, color: C.textDark }}
                                >
                                    👟 Athletic Shoes ($145)
                                </button>
                                <button
                                    onClick={() => loadPreset('electronics')}
                                    className="px-3 py-1 rounded-lg border text-[11.5px] font-bold font-syne hover:bg-[#f8f7ff] cursor-pointer"
                                    style={{ borderColor: C.border, color: C.textDark }}
                                >
                                    💻 Electronics ($289)
                                </button>
                                <button
                                    onClick={() => loadPreset('cards')}
                                    className="px-3 py-1 rounded-lg border text-[11.5px] font-bold font-syne hover:bg-[#f8f7ff] cursor-pointer"
                                    style={{ borderColor: C.border, color: C.textDark }}
                                >
                                    🃏 Trading Cards ($42.50)
                                </button>
                            </div>
                        </div>

                        {/* Inputs & Live Breakdown Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                            {/* Left Column: Form Controls (7 Cols) */}
                            <div className="lg:col-span-7 flex flex-col gap-4">

                                {/* Pricing Fields */}
                                <div className="bg-white rounded-2xl border p-5 shadow-xs space-y-4" style={{ borderColor: C.border }}>
                                    <h2 className="text-[14px] font-bold font-syne" style={{ color: C.textDark }}>
                                        1. Price &amp; Fulfillment Costs
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.muted }}>
                                                SOLD PRICE ($)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={soldPrice}
                                                onChange={e => setSoldPrice(parseFloat(e.target.value) || 0)}
                                                className="w-full h-10 px-3 rounded-xl border text-[13.5px] font-mono font-bold outline-none"
                                                style={{ color: C.textDark, borderColor: C.borderInput }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.muted }}>
                                                ITEM COST / COGS ($)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={itemCost}
                                                onChange={e => setItemCost(parseFloat(e.target.value) || 0)}
                                                className="w-full h-10 px-3 rounded-xl border text-[13.5px] font-mono font-bold outline-none"
                                                style={{ color: C.textDark, borderColor: C.borderInput }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.muted }}>
                                                SHIPPING CHARGED TO BUYER ($)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={shippingCharged}
                                                onChange={e => setShippingCharged(parseFloat(e.target.value) || 0)}
                                                className="w-full h-10 px-3 rounded-xl border text-[13.5px] font-mono font-bold outline-none"
                                                style={{ color: C.textDark, borderColor: C.borderInput }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.muted }}>
                                                ACTUAL POSTAGE COST ($)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={actualShipping}
                                                onChange={e => setActualShipping(parseFloat(e.target.value) || 0)}
                                                className="w-full h-10 px-3 rounded-xl border text-[13.5px] font-mono font-bold outline-none"
                                                style={{ color: C.textDark, borderColor: C.borderInput }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Category & Fee Modifiers */}
                                <div className="bg-white rounded-2xl border p-5 shadow-xs space-y-4" style={{ borderColor: C.border }}>
                                    <h2 className="text-[14px] font-bold font-syne" style={{ color: C.textDark }}>
                                        2. Marketplace Category &amp; Fees
                                    </h2>
                                    <div>
                                        <label htmlFor={standardCategorySelectId} className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.muted }}>
                                            EBAY CATEGORY (FVF RATE: {(feeRate * 100).toFixed(2)}%)
                                        </label>
                                        <select
                                            id={standardCategorySelectId}
                                            value={categoryIndex}
                                            onChange={e => setCategoryIndex(parseInt(e.target.value))}
                                            className="w-full h-10 px-3 rounded-xl border text-[13px] font-medium outline-none bg-white cursor-pointer"
                                            style={{ color: C.textDark, borderColor: C.borderInput }}
                                        >
                                            {EBAY_CATEGORIES.map((cat, idx) => (
                                                <option key={idx} value={idx}>
                                                    {cat.name} ({(hasEbayStore ? cat.basicStoreFee : cat.standardFee) * 100}%)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Promoted Listings Slider */}
                                    <div className="pt-2 border-t" style={{ borderColor: C.border }}>
                                        <div className="flex items-center justify-between text-[12px] font-bold font-syne mb-2">
                                            <span style={{ color: C.textDark }}>PROMOTED LISTINGS AD RATE:</span>
                                            <span className="font-mono text-[13px]" style={{ color: C.primary }}>{promotedRate}% (${adFee.toFixed(2)})</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="15"
                                            step="0.5"
                                            value={promotedRate}
                                            onChange={e => setPromotedRate(parseFloat(e.target.value))}
                                            className="w-full accent-[#7530fb] cursor-pointer"
                                        />
                                    </div>

                                    {/* Toggles */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t text-[12.5px]" style={{ borderColor: C.border }}>
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={hasEbayStore}
                                                onChange={e => setHasEbayStore(e.target.checked)}
                                                className="rounded accent-[#7530fb] w-4 h-4 cursor-pointer"
                                            />
                                            <span style={{ color: C.textDark }}>eBay Store Subscriber (Lower FVF)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={isInternational}
                                                onChange={e => setIsInternational(e.target.checked)}
                                                className="rounded accent-[#7530fb] w-4 h-4 cursor-pointer"
                                            />
                                            <span style={{ color: C.textDark }}>International Buyer (+1.65%)</span>
                                        </label>
                                    </div>
                                </div>

                            </div>

                            {/* Right Column: Live Net Profit Dashboard (5 Cols) */}
                            <div className="lg:col-span-5 flex flex-col gap-4">

                                {/* Hero Profit Display */}
                                <div className="rounded-3xl p-6 md:p-7 border shadow-lg text-white"
                                    style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>

                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-black uppercase font-syne tracking-wider" style={{ color: C.accent }}>
                                            ESTIMATED NET PROFIT
                                        </span>
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${roiGradeColor}`}>
                                            ROI {roiGrade} ({roiPercent.toFixed(0)}%)
                                        </span>
                                    </div>

                                    <div className="text-[36px] md:text-[40px] font-black font-syne tracking-tight mb-4"
                                        style={{ color: netProfit >= 0 ? '#ffffff' : '#f87171' }}>
                                        ${netProfit.toFixed(2)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5 mb-5">
                                        <div className="p-3 rounded-xl border" style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}>
                                            <span className="text-[11px] block" style={{ color: C.textLight }}>Profit Margin</span>
                                            <span className="text-[16px] font-black font-syne" style={{ color: C.accent }}>
                                                {profitMargin.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="p-3 rounded-xl border" style={{ backgroundColor: C.darkCard, borderColor: C.borderDark }}>
                                            <span className="text-[11px] block" style={{ color: C.textLight }}>Total Cost (COGS)</span>
                                            <span className="text-[16px] font-black font-syne text-white">
                                                ${costBase.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Itemized Deductions */}
                                    <div className="space-y-2 text-[12px] border-t pt-3" style={{ borderColor: C.borderDark }}>
                                        <div className="flex justify-between">
                                            <span style={{ color: C.textLight }}>eBay Final Value Fee ({(feeRate * 100).toFixed(2)}%)</span>
                                            <span className="font-mono text-red-400">-${finalValueFee.toFixed(2)}</span>
                                        </div>
                                        {promotedRate > 0 && (
                                            <div className="flex justify-between">
                                                <span style={{ color: C.textLight }}>Promoted Listings ({promotedRate}%)</span>
                                                <span className="font-mono text-red-400">-${adFee.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {isInternational && (
                                            <div className="flex justify-between">
                                                <span style={{ color: C.textLight }}>International Processing (1.65%)</span>
                                                <span className="font-mono text-red-400">-${internationalFee.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span style={{ color: C.textLight }}>Estimated Returns Buffer (1.5%)</span>
                                            <span className="font-mono text-red-400">-${returnBuffer.toFixed(2)}</span>
                                        </div>
                                    </div>

                                </div>

                                {/* Pricing Zones Logic */}
                                <div className="bg-white rounded-2xl border p-5 shadow-xs space-y-2.5" style={{ borderColor: C.border }}>
                                    <h3 className="text-[12px] font-bold uppercase font-syne tracking-wider" style={{ color: C.muted }}>
                                        Target Pricing Zones
                                    </h3>

                                    <div className="bg-[#f8f7ff] rounded-xl p-3 flex justify-between items-center border-l-4 border-red-500">
                                        <div>
                                            <span className="text-[13px] font-bold block" style={{ color: C.textDark }}>Break-Even Price</span>
                                            <span className="text-[11px]" style={{ color: C.muted }}>Covers product, postage &amp; fees</span>
                                        </div>
                                        <span className="font-mono font-bold text-[14px]" style={{ color: C.textDark }}>
                                            ${breakEvenPrice.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="bg-[#f8f7ff] rounded-xl p-3 flex justify-between items-center border-l-4 border-[#7530fb]">
                                        <div>
                                            <span className="text-[13px] font-bold block" style={{ color: C.textDark }}>Safe Floor Price</span>
                                            <span className="text-[11px]" style={{ color: C.muted }}>Minimum 20% Net Margin</span>
                                        </div>
                                        <span className="font-mono font-bold text-[14px]" style={{ color: C.textDark }}>
                                            ${safeFloorPrice.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="bg-[#f8f7ff] rounded-xl p-3 flex justify-between items-center border-l-4 border-[#b8fa33]">
                                        <div>
                                            <span className="text-[13px] font-bold block" style={{ color: C.textDark }}>Conversion Sweet Spot</span>
                                            <span className="text-[11px]" style={{ color: C.muted }}>Optimized for high-velocity Cassini rank</span>
                                        </div>
                                        <span className="font-mono font-black text-[15px]" style={{ color: C.primary }}>
                                            ${sweetSpotPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                )}

                {/* ── TAB 2: REVERSE PRICE ENGINE ── */}
                {activeTab === 'reverse' && (
                    <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-xs space-y-6" style={{ borderColor: C.border }}>
                        <div>
                            <h2 className="text-[20px] font-bold font-syne mb-1" style={{ color: C.textDark }}>
                                Reverse Price Engine
                            </h2>
                            <p className="text-[13px]" style={{ color: C.muted }}>
                                Input your desired net profit in pocket, and we calculate the exact listing price required on eBay.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#f8f7ff] p-4 rounded-xl border" style={{ borderColor: C.border }}>
                                <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                                    DESIRED NET PROFIT ($)
                                </label>
                                <input
                                    type="number"
                                    value={targetNetProfit}
                                    onChange={e => setTargetNetProfit(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border rounded-lg py-2 px-3 font-mono font-bold text-[14px]"
                                    style={{ color: C.primary, borderColor: C.borderInput }}
                                />
                            </div>

                            <div className="bg-[#f8f7ff] p-4 rounded-xl border" style={{ borderColor: C.border }}>
                                <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                                    ITEM ACQUISITION COST ($)
                                </label>
                                <input
                                    type="number"
                                    value={reverseCost}
                                    onChange={e => setReverseCost(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border rounded-lg py-2 px-3 font-mono font-bold text-[14px]"
                                    style={{ color: C.textDark, borderColor: C.borderInput }}
                                />
                            </div>

                            <div className="bg-[#f8f7ff] p-4 rounded-xl border" style={{ borderColor: C.border }}>
                                <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                                    OUTBOUND POSTAGE ($)
                                </label>
                                <input
                                    type="number"
                                    value={reverseShippingCost}
                                    onChange={e => setReverseShippingCost(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border rounded-lg py-2 px-3 font-mono font-bold text-[14px]"
                                    style={{ color: C.textDark, borderColor: C.borderInput }}
                                />
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white"
                            style={{ backgroundColor: C.dark }}>
                            <div>
                                <span className="text-[11px] font-bold uppercase font-syne tracking-wider" style={{ color: C.textLight }}>
                                    REQUIRED LISTING PRICE:
                                </span>
                                <div className="text-[34px] font-black font-syne mt-1" style={{ color: C.accent }}>
                                    ${calculatedReversePrice.toFixed(2)}
                                </div>
                                <p className="text-[12px]" style={{ color: C.textLight }}>
                                    Guarantees ${targetNetProfit.toFixed(2)} net profit after all eBay final value fees and 3% ad promotion buffer.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setSoldPrice(Math.round(calculatedReversePrice * 100) / 100)
                                    setItemCost(reverseCost)
                                    setActualShipping(reverseShippingCost)
                                    setActiveTab('calculator')
                                }}
                                className="px-6 py-3 rounded-xl font-bold font-syne text-[13px] transition-transform hover:scale-105 shrink-0 cursor-pointer"
                                style={{ backgroundColor: C.primary, color: '#ffffff' }}
                            >
                                Apply to Standard Calculator →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── TAB 3: BEST OFFER TESTER ── */}
                {activeTab === 'best_offer' && (
                    <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-xs space-y-6" style={{ borderColor: C.border }}>
                        <div>
                            <h2 className="text-[20px] font-bold font-syne mb-1" style={{ color: C.textDark }}>
                                Best Offer Threshold Tester
                            </h2>
                            <p className="text-[13px]" style={{ color: C.muted }}>
                                Evaluate buyer negotiations in real-time to decide whether to accept, decline, or counter.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#f8f7ff] p-4 rounded-xl border" style={{ borderColor: C.border }}>
                                <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                                    ORIGINAL LISTING PRICE ($)
                                </label>
                                <input
                                    type="number"
                                    value={originalPrice}
                                    onChange={e => setOriginalPrice(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border rounded-lg py-2 px-3 font-mono font-bold text-[14px]"
                                    style={{ color: C.textDark, borderColor: C.borderInput }}
                                />
                            </div>

                            <div className="bg-[#f8f7ff] p-4 rounded-xl border" style={{ borderColor: C.border }}>
                                <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                                    BUYER OFFER AMOUNT ($)
                                </label>
                                <input
                                    type="number"
                                    value={buyerOffer}
                                    onChange={e => setBuyerOffer(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border rounded-lg py-2 px-3 font-mono font-bold text-[14px]"
                                    style={{ color: C.primary, borderColor: C.borderInput }}
                                />
                            </div>

                            <div className="bg-[#f8f7ff] p-4 rounded-xl border" style={{ borderColor: C.border }}>
                                <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                                    ITEM COST ($)
                                </label>
                                <input
                                    type="number"
                                    value={offerCost}
                                    onChange={e => setOfferCost(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border rounded-lg py-2 px-3 font-mono font-bold text-[14px]"
                                    style={{ color: C.textDark, borderColor: C.borderInput }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl border bg-[#f8f7ff]" style={{ borderColor: C.border }}>
                                <span className="text-[11px] font-bold font-syne block" style={{ color: C.muted }}>DISCOUNT PERCENT</span>
                                <div className="font-mono text-[20px] font-black mt-1" style={{ color: C.textDark }}>
                                    {discountPercent.toFixed(1)}% OFF
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border bg-[#f8f7ff]" style={{ borderColor: C.border }}>
                                <span className="text-[11px] font-bold font-syne block" style={{ color: C.muted }}>PROFIT IF ACCEPTED</span>
                                <div className={`font-mono text-[20px] font-black mt-1 ${offerNetProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    ${offerNetProfit.toFixed(2)} ({offerMargin.toFixed(1)}%)
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border" style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
                                <span className="text-[11px] font-bold font-syne block" style={{ color: C.primary }}>RECOMMENDED COUNTER</span>
                                <div className="font-mono text-[20px] font-black mt-1" style={{ color: C.primary }}>
                                    ${recommendedCounter.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 4: MAP GUARD ── */}
                {activeTab === 'map_guard' && (
                    <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-xs space-y-6" style={{ borderColor: C.border }}>
                        <div>
                            <h2 className="text-[20px] font-bold font-syne mb-1" style={{ color: C.textDark }}>
                                Minimum Advertised Price (MAP) Safety Guard
                            </h2>
                            <p className="text-[13px]" style={{ color: C.muted }}>
                                Audit prices against distributor agreements to prevent dealer suspensions and wholesale account bans.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#f8f7ff] p-4 rounded-xl border" style={{ borderColor: C.border }}>
                                <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                                    VENDOR MANDATED MAP ($)
                                </label>
                                <input
                                    type="number"
                                    value={vendorMap}
                                    onChange={e => setVendorMap(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border rounded-lg py-2 px-3 font-mono font-bold text-[14px]"
                                    style={{ color: C.textDark, borderColor: C.borderInput }}
                                />
                            </div>

                            <div className="bg-[#f8f7ff] p-4 rounded-xl border" style={{ borderColor: C.border }}>
                                <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                                    PROPOSED LISTING PRICE ($)
                                </label>
                                <input
                                    type="number"
                                    value={testedPrice}
                                    onChange={e => setTestedPrice(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border rounded-lg py-2 px-3 font-mono font-bold text-[14px]"
                                    style={{ color: C.textDark, borderColor: C.borderInput }}
                                />
                            </div>
                        </div>

                        {testedPrice < vendorMap ? (
                            <div className="bg-red-50 border border-red-200 text-red-900 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle size={22} className="text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-syne font-bold text-[15px] text-red-900">
                                            MAP Violation Detected (${(vendorMap - testedPrice).toFixed(2)} Under Threshold)
                                        </h3>
                                        <p className="text-[12.5px] text-red-700 mt-0.5">
                                            Publishing at ${testedPrice.toFixed(2)} breaches your distributor policy and risks dealer account termination.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setTestedPrice(vendorMap)}
                                    className="px-5 py-2.5 rounded-xl text-[12.5px] font-bold font-syne bg-red-600 text-white hover:bg-red-700 transition-colors shrink-0 cursor-pointer shadow-xs"
                                >
                                    Adjust to Floor (${vendorMap.toFixed(2)})
                                </button>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-5 rounded-2xl flex items-center gap-3">
                                <ShieldCheck size={24} className="text-emerald-600 shrink-0" />
                                <div>
                                    <h3 className="font-syne font-bold text-[15px] text-emerald-900">
                                        Compliant with MAP Floor
                                    </h3>
                                    <p className="text-[12.5px] text-emerald-700 mt-0.5">
                                        Your proposed price is ${(testedPrice - vendorMap).toFixed(2)} above the vendor floor. Safe to list.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}
