'use client'
// app/dashboard/listing-generator/components/steps/Step3Pricing.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Listing Studio — Step 3: Pricing & Shipping
//
//   ✓ Sell price + Buy price
//   ✓ Quantity + Out of stock option
//   ✓ Best Offer toggle + thresholds
//   ✓ Profit Calculator UI (connect to profit-engine later)
//   ✓ Shipping — Free / Flat / Calculated
//   ✓ Dispatch days
//   ✓ Returns policy
//   ✓ VAT toggle
// ─────────────────────────────────────────────────────────────────────────────

import { JSX } from 'react'
import {
    DollarSign, Package, Truck, RotateCcw,
    Tag, Percent, Info, MapPin, Globe, CreditCard,
    Calendar, Megaphone, Weight, Ruler, Lock, Users, Box,
    AlertCircle, CheckCircle2, Zap,
} from 'lucide-react'
import ProDropdown from '@/components/ui/ProDropdown'
import type { DraftData } from '../LgStudio'

// ── Design tokens ────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
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

interface Props {
    draft: DraftData
    onChange: (updates: Partial<DraftData>) => void
    onNext: () => void
    onPrev: () => void
    onSave?: () => void
}

// ── Helpers ──────────────────────────────────────────────────
function Label({ text, required }: { text: string; required?: boolean }) {
    return (
        <label className="text-[12px] font-semibold flex items-center gap-1"
            style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
            {text}
            {required && <span style={{ color: C.danger }}>*</span>}
        </label>
    )
}

function Input({
    value, onChange, placeholder, prefix, type = 'number', min, max, step, disabled,
}: {
    value: string | number
    onChange: (v: string) => void
    placeholder?: string
    prefix?: string
    type?: string
    min?: number
    max?: number
    step?: number
    disabled?: boolean
}) {
    return (
        <div className="flex items-center rounded-xl overflow-hidden"
            style={{ border: `1px solid ${C.borderInput}`, backgroundColor: disabled ? C.bg : C.surface }}>
            {prefix && (
                <span className="px-3 text-[13px] font-semibold shrink-0"
                    style={{ color: C.muted, borderRight: `1px solid ${C.borderInput}`, fontFamily: 'DM Sans, sans-serif' }}>
                    {prefix}
                </span>
            )}
            <input
                type={type}
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                style={{
                    flex: 1,
                    padding: '9px 12px',
                    fontSize: 13,
                    color: C.body,
                    fontFamily: 'DM Sans, sans-serif',
                    outline: 'none',
                    background: 'transparent',
                    border: 'none',
                }}
                onFocus={e => (e.target.parentElement!.style.borderColor = C.primary)}
                onBlur={e => (e.target.parentElement!.style.borderColor = C.borderInput)}
            />
        </div>
    )
}



function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
                onClick={() => onChange(!checked)}
                className="relative shrink-0 transition-all"
                style={{
                    width: 36, height: 20,
                    borderRadius: 999,
                    backgroundColor: checked ? C.primary : '#d1d5db',
                }}>
                <div style={{
                    position: 'absolute',
                    top: 2, left: checked ? 18 : 2,
                    width: 16, height: 16,
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
            </div>
            {label && <span className="text-[12px]" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>{label}</span>}
        </label>
    )
}

function SectionHeader({ icon, title, subtitle }: { icon: JSX.Element; title: string; subtitle?: string }) {
    return (
        <div className="flex items-center gap-2.5 pb-3"
            style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: C.primaryLight }}>
                {icon}
            </div>
            <div>
                <h2 className="text-[14px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                    {title}
                </h2>
                {subtitle && <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{subtitle}</p>}
            </div>
        </div>
    )
}

// ── Profit row ───────────────────────────────────────────────
function ProfitRow({ label, value, highlight, muted, danger }: {
    label: string; value: string; highlight?: boolean; muted?: boolean; danger?: boolean
}) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className="text-[12px]" style={{
                color: muted ? C.muted : C.secondary,
                fontFamily: 'DM Sans, sans-serif',
            }}>{label}</span>
            <span className="text-[13px] font-semibold" style={{
                color: danger ? C.danger : highlight ? C.success : C.body,
                fontFamily: 'DM Sans, sans-serif',
            }}>{value}</span>
        </div>
    )
}

// ── Currency map — derived from country ───────────────────────
const CURRENCY_MAP: Record<string, { code: string; symbol: string }> = {
    US: { code: 'USD', symbol: '$' },
    GB: { code: 'GBP', symbol: '£' },
    CA: { code: 'CAD', symbol: 'CA$' },
    AU: { code: 'AUD', symbol: 'AU$' },
    DE: { code: 'EUR', symbol: '€' },
    FR: { code: 'EUR', symbol: '€' },
}
function getCurrency(country: string) {
    return CURRENCY_MAP[country] ?? { code: 'USD', symbol: '$' }
}

// ── Simple profit estimate ────────────────────────────────────
function calcProfit(sell: number, buy: number, shipping: number, freeShipping: boolean) {
    const ebayFee = sell * 0.1285 + 0.30   // ~12.85% + $0.30 typical
    const shippingOut = freeShipping ? shipping : 0
    const gross = sell - ebayFee - shippingOut - buy
    const margin = sell > 0 ? (gross / sell) * 100 : 0
    const roi = buy > 0 ? (gross / buy) * 100 : 0
    return { ebayFee, gross, margin, roi }
}

function fmt(n: number) {
    return n >= 0 ? `$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`
}

// ── Main component ────────────────────────────────────────────
export default function Step3Pricing({ draft, onChange }: Props): JSX.Element {
    const sell = Number(draft.sell_price) || 0
    const buy = Number(draft.buy_price) || 0
    const shipping = Number(draft.shipping_cost) || 0
    const profit = calcProfit(sell, buy, shipping, draft.free_shipping)
    const currency = getCurrency((draft as any).item_country ?? 'US')

    const showBestOfferThresholds = (draft as any).best_offer_enabled

    return (
        <div className="flex flex-col xl:h-full">
            <div className="flex flex-col xl:flex-1 xl:min-h-0 xl:overflow-hidden xl:px-[5%]">
                <div className="flex flex-col xl:flex-1 xl:flex-row xl:min-h-0 xl:overflow-hidden">

                    {/* ── LEFT: Pricing + Quantity + Best Offer ──── */}
                    <div className="xl:w-[480px] xl:shrink-0 xl:overflow-y-auto p-3 md:p-4 xl:p-5 flex flex-col gap-5 xl:border-r xl:border-[#ede9fe] scrollbar-hide"
                        style={{ scrollbarWidth: 'none' }}>

                        {/* ── Pricing ─────────────────────────── */}
                        <div className="flex flex-col gap-4">
                            <SectionHeader
                                icon={<DollarSign size={14} style={{ color: C.primary }} />}
                                title="Pricing"
                                subtitle="Set your sell price and buy cost for profit tracking"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label text="Sell Price" required />
                                    <Input
                                        value={draft.sell_price ?? ''}
                                        onChange={v => onChange({ sell_price: v === '' ? null : Number(v) })}
                                        prefix={currency.symbol}
                                        placeholder="0.00"
                                        min={0}
                                        step={0.01}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label text="Buy / Cost Price" />
                                    <Input
                                        value={draft.buy_price ?? ''}
                                        onChange={v => onChange({ buy_price: v === '' ? null : Number(v) })}
                                        prefix={currency.symbol}
                                        placeholder="0.00"
                                        min={0}
                                        step={0.01}
                                    />
                                </div>
                            </div>

                            {/* Currency indicator */}
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}>
                                <CreditCard size={11} style={{ color: C.primary }} />
                                <p className="text-[11px]" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                    Currency: <strong>{currency.code}</strong> — set by Item Location country
                                </p>
                            </div>

                            {/* Sell price warning */}
                            {sell > 0 && sell < 0.99 && (
                                <div className="flex items-center gap-2 p-2.5 rounded-xl"
                                    style={{ backgroundColor: C.warningBg, border: `1px solid #fcd34d` }}>
                                    <AlertCircle size={12} style={{ color: C.warning, flexShrink: 0 }} />
                                    <p className="text-[11px]" style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                                        eBay minimum listing price is {currency.symbol}0.99
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── Quantity ─────────────────────────── */}
                        <div className="flex flex-col gap-4">
                            <SectionHeader
                                icon={<Package size={14} style={{ color: C.primary }} />}
                                title="Quantity & Stock"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label text="Quantity" required />
                                    <Input
                                        value={draft.quantity}
                                        onChange={v => onChange({ quantity: Math.max(1, Number(v)) })}
                                        placeholder="1"
                                        min={1}
                                        step={1}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label text="Out of Stock Option" />
                                    <div className="flex items-center h-[38px] px-3 rounded-xl"
                                        style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.surface }}>
                                        <Toggle
                                            checked={(draft as any).out_of_stock_option ?? false}
                                            onChange={v => onChange({ out_of_stock_option: v } as any)}
                                            label="Keep listing live at 0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Best Offer ───────────────────────── */}
                        <div className="flex flex-col gap-4">
                            <SectionHeader
                                icon={<Tag size={14} style={{ color: C.primary }} />}
                                title="Best Offer"
                                subtitle="Let buyers negotiate with you"
                            />
                            <div className="p-3 rounded-xl flex items-center justify-between"
                                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                                <div>
                                    <p className="text-[13px] font-semibold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                        Accept Best Offers
                                    </p>
                                    <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        Buyers can make you an offer
                                    </p>
                                </div>
                                <Toggle
                                    checked={(draft as any).best_offer_enabled ?? false}
                                    onChange={v => onChange({ best_offer_enabled: v } as any)}
                                />
                            </div>

                            {showBestOfferThresholds && (
                                <div className="grid grid-cols-2 gap-3 pl-1">
                                    <div className="flex flex-col gap-1.5">
                                        <Label text="Auto-Accept above" />
                                        <Input
                                            value={(draft as any).best_offer_accept ?? ''}
                                            onChange={v => onChange({ best_offer_accept: v === '' ? null : Number(v) } as any)}
                                            prefix="$"
                                            placeholder="e.g. 45.00"
                                            min={0}
                                            step={0.01}
                                        />
                                        <p className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            Auto-accept any offer at or above this
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label text="Auto-Decline below" />
                                        <Input
                                            value={(draft as any).best_offer_decline ?? ''}
                                            onChange={v => onChange({ best_offer_decline: v === '' ? null : Number(v) } as any)}
                                            prefix="$"
                                            placeholder="e.g. 30.00"
                                            min={0}
                                            step={0.01}
                                        />
                                        <p className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            Auto-decline any offer below this
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── VAT ─────────────────────────────── */}
                        <div className="p-3 rounded-xl flex items-center justify-between"
                            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="flex items-center gap-2">
                                <Percent size={14} style={{ color: C.primary }} />
                                <div>
                                    <p className="text-[13px] font-semibold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                        VAT Registered
                                    </p>
                                    <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        Affects profit calculation
                                    </p>
                                </div>
                            </div>
                            <Toggle
                                checked={draft.vat_registered ?? false}
                                onChange={v => onChange({ vat_registered: v })}
                            />
                        </div>

                        {/* ── Immediate Payment ────────────────── */}
                        <div className="p-3 rounded-xl flex items-center justify-between"
                            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="flex items-center gap-2">
                                <CreditCard size={14} style={{ color: C.primary }} />
                                <div>
                                    <p className="text-[13px] font-semibold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                        Require Immediate Payment
                                    </p>
                                    <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        Prevents buyers clicking Buy Now without paying
                                    </p>
                                </div>
                            </div>
                            <Toggle
                                checked={(draft as any).immediate_payment ?? true}
                                onChange={v => onChange({ immediate_payment: v } as any)}
                            />
                        </div>

                    </div>

                    {/* ── RIGHT: Profit Calculator + Shipping ─── */}
                    <div className="flex-1 xl:overflow-y-auto p-3 md:p-4 xl:p-5 flex flex-col gap-5 scrollbar-hide"
                        style={{ scrollbarWidth: 'none' }}>

                        {/* ── Profit Calculator UI ─────────────── */}
                        <div className="flex flex-col gap-4">
                            <SectionHeader
                                icon={<Zap size={14} style={{ color: C.primary }} />}
                                title="Profit Calculator"
                                subtitle="Live estimate — connect full calculator in settings"
                            />

                            <div className="rounded-2xl overflow-hidden"
                                style={{ border: `1px solid ${C.border}` }}>

                                {/* Calculator header */}
                                <div className="px-4 py-3 flex items-center justify-between"
                                    style={{ backgroundColor: C.dark }}>
                                    <div>
                                        <p className="text-[13px] font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                                            Quick Estimate
                                        </p>
                                        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif' }}>
                                            Based on ~12.85% eBay fee
                                        </p>
                                    </div>
                                    {/* Connect button — placeholder for future */}
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                                        style={{ backgroundColor: 'rgba(184,250,51,0.15)', border: '1px solid rgba(184,250,51,0.3)' }}>
                                        <Zap size={11} style={{ color: C.accent }} />
                                        <span className="text-[11px] font-semibold" style={{ color: C.accent, fontFamily: 'DM Sans, sans-serif' }}>
                                            Pro Calculator
                                        </span>
                                    </div>
                                </div>

                                {sell > 0 ? (
                                    <div className="px-4 py-3" style={{ backgroundColor: C.surface }}>
                                        <ProfitRow label="Sell Price" value={fmt(sell)} />
                                        <div style={{ borderTop: `1px dashed ${C.border}`, margin: '4px 0' }} />
                                        <ProfitRow label="eBay Fee (~12.85% + $0.30)" value={`-${fmt(profit.ebayFee)}`} muted />
                                        {buy > 0 && <ProfitRow label="Cost Price" value={`-${fmt(buy)}`} muted />}
                                        {draft.free_shipping && shipping > 0 && (
                                            <ProfitRow label="Shipping (your cost)" value={`-${fmt(shipping)}`} muted />
                                        )}
                                        <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0' }} />
                                        <ProfitRow
                                            label="Est. Profit"
                                            value={fmt(profit.gross)}
                                            highlight={profit.gross > 0}
                                            danger={profit.gross < 0}
                                        />
                                        <div className="grid grid-cols-2 gap-2 mt-3">
                                            <div className="p-2.5 rounded-xl text-center"
                                                style={{
                                                    backgroundColor: profit.margin >= 20 ? C.successBg : profit.margin >= 0 ? C.warningBg : C.dangerBg,
                                                    border: `1px solid ${profit.margin >= 20 ? '#86efac' : profit.margin >= 0 ? '#fcd34d' : '#fca5a5'}`,
                                                }}>
                                                <p className="text-[10px] font-medium" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Margin</p>
                                                <p className="text-[16px] font-bold" style={{
                                                    color: profit.margin >= 20 ? C.success : profit.margin >= 0 ? C.warning : C.danger,
                                                    fontFamily: 'Syne, sans-serif',
                                                }}>
                                                    {profit.margin.toFixed(1)}%
                                                </p>
                                            </div>
                                            <div className="p-2.5 rounded-xl text-center"
                                                style={{
                                                    backgroundColor: profit.roi >= 30 ? C.successBg : profit.roi >= 0 ? C.warningBg : C.dangerBg,
                                                    border: `1px solid ${profit.roi >= 30 ? '#86efac' : profit.roi >= 0 ? '#fcd34d' : '#fca5a5'}`,
                                                }}>
                                                <p className="text-[10px] font-medium" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>ROI</p>
                                                <p className="text-[16px] font-bold" style={{
                                                    color: profit.roi >= 30 ? C.success : profit.roi >= 0 ? C.warning : C.danger,
                                                    fontFamily: 'Syne, sans-serif',
                                                }}>
                                                    {buy > 0 ? `${profit.roi.toFixed(1)}%` : '—'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Loss warning */}
                                        {profit.gross < 0 && sell > 0 && (
                                            <div className="flex items-center gap-2 p-2.5 rounded-xl mt-3"
                                                style={{ backgroundColor: C.dangerBg, border: `1px solid #fca5a5` }}>
                                                <AlertCircle size={12} style={{ color: C.danger, flexShrink: 0 }} />
                                                <p className="text-[11px]" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                                    You&apos;re selling at a loss. Raise price or lower cost.
                                                </p>
                                            </div>
                                        )}

                                        {/* Good margin badge */}
                                        {profit.gross > 0 && profit.margin >= 20 && (
                                            <div className="flex items-center gap-2 p-2.5 rounded-xl mt-3"
                                                style={{ backgroundColor: C.successBg, border: `1px solid #86efac` }}>
                                                <CheckCircle2 size={12} style={{ color: C.success, flexShrink: 0 }} />
                                                <p className="text-[11px]" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                                    Good margin! Connect Pro Calculator for full breakdown.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 gap-2"
                                        style={{ backgroundColor: C.surface }}>
                                        <DollarSign size={28} style={{ color: C.border }} />
                                        <p className="text-[12px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            Enter a sell price to see profit estimate
                                        </p>
                                    </div>
                                )}

                                {/* Connect full calculator CTA */}
                                <div className="px-4 py-3 flex items-center gap-2"
                                    style={{ backgroundColor: C.primaryLight, borderTop: `1px solid ${C.border}` }}>
                                    <Info size={11} style={{ color: C.primary, flexShrink: 0 }} />
                                    <p className="text-[11px]" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                        Connect the Pro Calculator for eBay category fees, promoted listings, VAT, FX rates and more.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── Item Location ───────────────────────── */}
                        <div className="flex flex-col gap-4">
                            <SectionHeader
                                icon={<MapPin size={14} style={{ color: C.primary }} />}
                                title="Item Location"
                                subtitle="Required by eBay to calculate delivery estimates"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label text="Postal / Zip Code" required />
                                    <Input
                                        value={(draft as any).item_zip ?? ''}
                                        onChange={v => onChange({ item_zip: v } as any)}
                                        placeholder="e.g. 33166"
                                        type="text"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label text="Country" required />
                                    <ProDropdown
                                        prefix=""
                                        currentValue={(draft as any).item_country ?? 'US'}
                                        onChanged={v => onChange({ item_country: v } as any)}
                                        width="full"
                                        options={[
                                            { val: 'US', label: 'United States', enabled: true, flagCode: 'us' },
                                            { val: 'GB', label: 'United Kingdom', enabled: true, flagCode: 'gb' },
                                            { val: 'CA', label: 'Canada', enabled: true, flagCode: 'ca' },
                                            { val: 'AU', label: 'Australia', enabled: true, flagCode: 'au' },
                                            { val: 'DE', label: 'Germany', enabled: true, flagCode: 'de' },
                                            { val: 'FR', label: 'France', enabled: true, flagCode: 'fr' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Shipping ─────────────────────────── */}
                        <div className="flex flex-col gap-4">
                            <SectionHeader
                                icon={<Truck size={14} style={{ color: C.primary }} />}
                                title="Shipping"
                            />

                            {/* Free Shipping + International — one row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl flex items-center justify-between"
                                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                                    <div>
                                        <p className="text-[12px] font-semibold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                            Free Shipping
                                        </p>
                                        <p className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            Boosts eBay visibility
                                        </p>
                                    </div>
                                    <Toggle
                                        checked={draft.free_shipping}
                                        onChange={v => onChange({ free_shipping: v, shipping_type: v ? 'free' : 'fixed' })}
                                    />
                                </div>
                                <div className="p-3 rounded-xl flex items-center justify-between"
                                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                                    <div className="flex items-center gap-1.5">
                                        <Globe size={12} style={{ color: C.primary, flexShrink: 0 }} />
                                        <div>
                                            <p className="text-[12px] font-semibold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                                Intl. Shipping
                                            </p>
                                            <p className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                eBay handles customs
                                            </p>
                                        </div>
                                    </div>
                                    <Toggle
                                        checked={(draft as any).international_shipping ?? false}
                                        onChange={v => onChange({ international_shipping: v } as any)}
                                    />
                                </div>
                            </div>

                            {!draft.free_shipping && (
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <Label text="Shipping Type" />
                                            <ProDropdown
                                                prefix=""
                                                currentValue={draft.shipping_type}
                                                onChanged={v => onChange({ shipping_type: v })}
                                                width="full"
                                                options={[
                                                    { val: 'fixed', label: 'Flat Rate', enabled: true },
                                                    { val: 'calculated', label: 'Calculated', enabled: true },
                                                    { val: 'freight', label: 'Freight', enabled: true },
                                                ]}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label text="Shipping Cost" />
                                            <Input
                                                value={draft.shipping_cost}
                                                onChange={v => onChange({ shipping_cost: Number(v) })}
                                                prefix="$"
                                                placeholder="0.00"
                                                min={0}
                                                step={0.01}
                                                disabled={draft.shipping_type === 'calculated'}
                                            />
                                        </div>
                                    </div>
                                    {/* Carrier service — required when Flat Rate */}
                                    {draft.shipping_type === 'fixed' && (
                                        <div className="flex flex-col gap-1.5">
                                            <Label text="Carrier Service" required />
                                            <ProDropdown
                                                prefix=""
                                                currentValue={(draft as any).shipping_carrier ?? ''}
                                                onChanged={v => onChange({ shipping_carrier: v } as any)}
                                                width="full"
                                                maxItems={8}
                                                options={[
                                                    { val: 'USPSGroundAdvantage', label: 'USPS Ground Advantage', enabled: true },
                                                    { val: 'USPSPriority', label: 'USPS Priority Mail', enabled: true },
                                                    { val: 'USPSFirstClass', label: 'USPS First Class', enabled: true },
                                                    { val: 'FedExGround', label: 'FedEx Ground', enabled: true },
                                                    { val: 'FedExHomeDelivery', label: 'FedEx Home Delivery', enabled: true },
                                                    { val: 'UPSGround', label: 'UPS Ground', enabled: true },
                                                    { val: 'UPSNextDayAir', label: 'UPS Next Day Air', enabled: true },
                                                    { val: 'DHLExpressWorldwide', label: 'DHL Express Worldwide', enabled: true },
                                                    { val: 'OtherDomestic', label: 'Other / See Description', enabled: true },
                                                ]}
                                            />
                                        </div>
                                    )}
                                    {draft.shipping_type === 'calculated' && (
                                        <div className="flex items-center gap-2 p-2.5 rounded-xl"
                                            style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}>
                                            <Info size={12} style={{ color: C.primary, flexShrink: 0 }} />
                                            <p className="text-[11px]" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                                Calculated shipping uses buyer&apos;s location + package weight. Set package details after publishing.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Dispatch + Returns — one row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label text="Dispatch Time" />
                                    <ProDropdown
                                        prefix=""
                                        currentValue={String(draft.dispatch_days)}
                                        onChanged={v => onChange({ dispatch_days: Number(v) })}
                                        width="full"
                                        options={[
                                            { val: '1', label: 'Same day / 1 day', enabled: true },
                                            { val: '2', label: '2 business days', enabled: true },
                                            { val: '3', label: '3 business days', enabled: true },
                                            { val: '5', label: '5 business days', enabled: true },
                                            { val: '10', label: '10 business days', enabled: true },
                                        ]}
                                    />
                                    {draft.dispatch_days === 1 && (
                                        <p className="text-[10px] flex items-center gap-1"
                                            style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                            <CheckCircle2 size={10} /> Fast dispatch eligible
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label text="Returns Policy" />
                                    <ProDropdown
                                        prefix=""
                                        currentValue={draft.returns_policy}
                                        onChanged={v => onChange({ returns_policy: v })}
                                        width="full"
                                        options={[
                                            { val: 'no_returns', label: 'No Returns', enabled: true },
                                            { val: '30_day_buyer_pays', label: '30 Days — Buyer Pays', enabled: true },
                                            { val: '30_day_free_returns', label: '30 Days — Free', enabled: true },
                                            { val: '60_day_buyer_pays', label: '60 Days — Buyer Pays', enabled: true },
                                            { val: '60_day_free_returns', label: '60 Days — Free', enabled: true },
                                        ]}
                                    />
                                    {draft.returns_policy === 'no_returns' && (
                                        <p className="text-[10px] flex items-center gap-1"
                                            style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                                            <AlertCircle size={10} /> May reduce buyer confidence
                                        </p>
                                    )}
                                    {draft.returns_policy.includes('free_returns') && (
                                        <p className="text-[10px] flex items-center gap-1"
                                            style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                            <CheckCircle2 size={10} /> Free returns badge eligible
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Package Details ───────────────────── */}
                        {draft.shipping_type === 'calculated' && (
                            <div className="flex flex-col gap-4">
                                <SectionHeader
                                    icon={<Box size={14} style={{ color: C.primary }} />}
                                    title="Package Details"
                                    subtitle="Required for calculated shipping rates"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <Label text="Weight (lbs)" />
                                        <Input
                                            value={(draft as any).package_weight_lbs ?? ''}
                                            onChange={v => onChange({ package_weight_lbs: v === '' ? null : Number(v) } as any)}
                                            placeholder="0"
                                            min={0}
                                            step={1}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label text="Weight (oz)" />
                                        <Input
                                            value={(draft as any).package_weight_oz ?? ''}
                                            onChange={v => onChange({ package_weight_oz: v === '' ? null : Number(v) } as any)}
                                            placeholder="0"
                                            min={0}
                                            max={15}
                                            step={1}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label text="Dimensions (L × W × H inches)" />
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={(draft as any).pkg_length ?? ''}
                                            onChange={v => onChange({ pkg_length: v === '' ? null : Number(v) } as any)}
                                            placeholder="L"
                                            min={0}
                                            step={0.1}
                                        />
                                        <span style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>×</span>
                                        <Input
                                            value={(draft as any).pkg_width ?? ''}
                                            onChange={v => onChange({ pkg_width: v === '' ? null : Number(v) } as any)}
                                            placeholder="W"
                                            min={0}
                                            step={0.1}
                                        />
                                        <span style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>×</span>
                                        <Input
                                            value={(draft as any).pkg_height ?? ''}
                                            onChange={v => onChange({ pkg_height: v === '' ? null : Number(v) } as any)}
                                            placeholder="H"
                                            min={0}
                                            step={0.1}
                                        />
                                    </div>
                                </div>
                                {/* Irregular package */}
                                <div className="flex items-center gap-2 p-2.5 rounded-xl"
                                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                                    <input
                                        type="checkbox"
                                        id="irregular"
                                        checked={(draft as any).irregular_package ?? false}
                                        onChange={e => onChange({ irregular_package: e.target.checked } as any)}
                                        style={{ accentColor: C.primary, width: 14, height: 14 }}
                                    />
                                    <label htmlFor="irregular" className="text-[12px]"
                                        style={{ color: C.body, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>
                                        Irregular package — carriers may charge extra
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* ── Volume Pricing ────────────────────── */}
                        <div className="p-3 rounded-xl flex items-center justify-between"
                            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="flex items-center gap-2">
                                <Users size={14} style={{ color: C.primary }} />
                                <div>
                                    <p className="text-[13px] font-semibold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                        Volume Pricing
                                    </p>
                                    <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        Offer discount when buyer purchases multiple units
                                    </p>
                                </div>
                            </div>
                            <Toggle
                                checked={(draft as any).volume_pricing ?? false}
                                onChange={v => onChange({ volume_pricing: v } as any)}
                            />
                        </div>

                        {/* ── Listing Options ───────────────────── */}
                        <div className="flex flex-col gap-3">
                            <SectionHeader
                                icon={<Lock size={14} style={{ color: C.primary }} />}
                                title="Listing Options"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl flex items-center justify-between"
                                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                                    <div>
                                        <p className="text-[12px] font-semibold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>Sell as Lot</p>
                                        <p className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Group items for one buyer</p>
                                    </div>
                                    <Toggle
                                        checked={(draft as any).sell_as_lot ?? false}
                                        onChange={v => onChange({ sell_as_lot: v } as any)}
                                    />
                                </div>
                                <div className="p-3 rounded-xl flex items-center justify-between"
                                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                                    <div>
                                        <p className="text-[12px] font-semibold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>Private Listing</p>
                                        <p className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Buyers stay anonymous</p>
                                    </div>
                                    <Toggle
                                        checked={(draft as any).private_listing ?? false}
                                        onChange={v => onChange({ private_listing: v } as any)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Schedule Listing ──────────────────── */}
                        <div className="flex flex-col gap-3">
                            <SectionHeader
                                icon={<Calendar size={14} style={{ color: C.primary }} />}
                                title="Schedule Listing"
                                subtitle="Leave blank to go live immediately"
                            />
                            <div className="flex flex-col gap-1.5">
                                <Label text="Go Live At (optional)" />
                                <input
                                    type="datetime-local"
                                    value={(draft as any).scheduled_at ?? ''}
                                    onChange={e => onChange({ scheduled_at: e.target.value } as any)}
                                    style={{
                                        width: '100%',
                                        padding: '9px 12px',
                                        fontSize: 13,
                                        color: C.body,
                                        fontFamily: 'DM Sans, sans-serif',
                                        border: `1px solid ${C.borderInput}`,
                                        borderRadius: 12,
                                        backgroundColor: C.surface,
                                        outline: 'none',
                                    }}
                                    onFocus={e => e.target.style.borderColor = C.primary}
                                    onBlur={e => e.target.style.borderColor = C.borderInput}
                                />
                                {(draft as any).scheduled_at && (
                                    <p className="text-[10px] flex items-center gap-1"
                                        style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                        <Calendar size={10} /> Listing will go live at scheduled time
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ── Promoted Listings ─────────────────── */}
                        <div className="flex flex-col gap-4">
                            <SectionHeader
                                icon={<Megaphone size={14} style={{ color: C.primary }} />}
                                title="Promote Your Listing"
                                subtitle="Boost visibility in eBay search"
                            />
                            <div className="rounded-2xl overflow-hidden"
                                style={{ border: `1px solid ${C.border}` }}>
                                {/* General / Standard */}
                                <div className="p-4 flex items-center justify-between"
                                    style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[13px] font-bold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>General (Sponsored)</p>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                                style={{ backgroundColor: C.successBg, color: C.success }}>Pay on sale</span>
                                        </div>
                                        <p className="text-[11px] mt-0.5" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            ~90% more visibility on average
                                        </p>
                                    </div>
                                    <Toggle
                                        checked={(draft as any).promoted_general ?? false}
                                        onChange={v => onChange({ promoted_general: v } as any)}
                                    />
                                </div>
                                {(draft as any).promoted_general && (
                                    <div className="px-4 py-3 flex items-center gap-3"
                                        style={{ backgroundColor: C.primaryLight, borderBottom: `1px solid ${C.border}` }}>
                                        <div className="flex flex-col gap-1.5 flex-1">
                                            <Label text="Ad Rate %" />
                                            <Input
                                                value={(draft as any).promoted_general_rate ?? ''}
                                                onChange={v => onChange({ promoted_general_rate: v === '' ? null : Number(v) } as any)}
                                                placeholder="e.g. 14.0"
                                                min={1}
                                                max={100}
                                                step={0.1}
                                            />
                                        </div>
                                        <p className="text-[11px] mt-4" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                            Suggested: 14.0%
                                        </p>
                                    </div>
                                )}
                                {/* Priority */}
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[13px] font-bold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>Priority</p>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                                style={{ backgroundColor: C.primaryLight, color: C.primary }}>Pay per click</span>
                                        </div>
                                        <p className="text-[11px] mt-0.5" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            ~170% more visibility, top of search placement
                                        </p>
                                    </div>
                                    <Toggle
                                        checked={(draft as any).promoted_priority ?? false}
                                        onChange={v => onChange({ promoted_priority: v } as any)}
                                    />
                                </div>
                                {(draft as any).promoted_priority && (
                                    <div className="px-4 py-3 flex items-center gap-3"
                                        style={{ backgroundColor: C.primaryLight }}>
                                        <div className="flex flex-col gap-1.5 flex-1">
                                            <Label text="Daily Budget" />
                                            <Input
                                                value={(draft as any).promoted_priority_budget ?? ''}
                                                onChange={v => onChange({ promoted_priority_budget: v === '' ? null : Number(v) } as any)}
                                                prefix="$"
                                                placeholder="3.00"
                                                min={3}
                                                step={0.50}
                                            />
                                        </div>
                                        <p className="text-[11px] mt-4" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                            Min $3.00/day
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Item Disclosures ──────────────────── */}
                        <div className="p-3 rounded-xl flex items-center justify-between"
                            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                            <div>
                                <p className="text-[13px] font-semibold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                    Item Disclosures
                                </p>
                                <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    Regulatory requirements e.g. California Prop 65
                                </p>
                            </div>
                            <Toggle
                                checked={(draft as any).item_disclosures ?? false}
                                onChange={v => onChange({ item_disclosures: v } as any)}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
