'use client'
// app/dashboard/profit-calculator/page.tsx
// ---------------------------------------------------------------
// Converted from: lib/pages/profit_calculator.dart
//
// What the Dart version had:
//   ? Header — analytics icon, title, eBay search bar, country tabs
//   ? Country tabs (US/UK/AU/CA/DE/FR/IT/ES) — dark active state
//   ? Command Center panel (left) — all inputs
//   ? Pro Dashboard panel (right) — results
//   ? Item cost, shipping cost, sale price, buyer shipping inputs
//   ? Category dropdown (20 categories with fee %)
//   ? Store tier, seller level, payment processor dropdowns
//   ? Ad rate + tax rate sliders
//   ? International toggle
//   ? eBay fee calculation (MathEngine)
//   ? VeRO risk detection (keyword scanning)
//   ? Product preview bar — thumbnail, VeRO highlighted title, sold count
//   ? Responsive (desktop side-by-side / mobile stacked)
// ---------------------------------------------------------------

import { useState, useCallback, useEffect, useRef } from 'react'
import { BarChart2, AlertTriangle, Flame, ImageIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import CommandCenter   from '@/components/profit/CommandCenter'
import EbaySearchBar  from '@/components/profit/EbaySearchBar'
import ProDashboard  from '@/components/profit/ProDashboard'
import { MathEngine } from '@/lib/math-engine'
import KillSwitchGate from '@/components/KillSwitchGate'

// -- Design tokens ----------------------------------------------
const C = {
  dark:    '#1a2410',
  lime:    '#8FFF00',
  border:  '#E2E8F0',
  bg:      '#F8FAFC',
  text:    '#0F172A',
  muted:   '#64748B',
  hint:    '#94A3B8',
}

// -- Category fees (mirrors Dart _categoryFees exactly) ---------
const CATEGORY_FEES: Record<string, number> = {
  'Other Categories (Default) - 13.25%':         13.25,
  'Books, Magazines, Movies, Music - 14.95%':    14.95,
  'Music > Records - 13.25%':                    13.25,
  'Cameras & Photos - 9.00%':                     9.00,
  'Cell Phones & Smartphones - 9.00%':            9.00,
  'Computers/Tablets & Networking - 9.00%':       9.00,
  'Consumer Electronics - 9.00%':                 9.00,
  'Video Games > Consoles - 9.00%':               9.00,
  'Video Games > Games - 13.25%':                13.25,
  'Clothing, Shoes & Accessories - 13.25%':      13.25,
  'Women\'s Bags (Over $2k) - 9.00%':            9.00,
  'Athletic Shoes (Over $150) - 8.00%':          8.00,
  'Jewelry & Watches - 13.25%':                  13.25,
  'Watches (Under $1k) - 15.00%':               15.00,
  'Watches (Over $1k) - 6.50%':                  6.50,
  'Guitars & Basses - 6.35%':                    6.35,
  'Heavy Equipment, Food Trucks - 3.00%':         3.00,
  'eBay Motors > Parts & Accessories - 13.25%': 13.25,
  'Automotive Tools & Supplies - 10.00%':        10.00,
  'eBay Motors > Tires - 9.50%':                 9.50,
}

const STORE_TIERS    = ['No Store', 'Basic Store (-1.25% Fee)', 'Premium Store (-1.25% Fee)']
const SELLER_LEVELS  = ['Standard', 'Top Rated Plus (-10% Final Fee)', 'Below Standard (+6% Penalty)']
const PROCESSORS     = ['Managed', 'PayPal']
const COUNTRIES      = ['US', 'UK', 'AU', 'CA', 'DE', 'FR', 'IT', 'ES']

// -- VeRO keywords (mirrors Dart exactly) ----------------------
const VERO_KEYWORDS = [
  'apple','nike','velcro','rolex','gucci','adidas','bluetooth','onesie',
  'yeti','popsocket','canon','sony','bose','fitbit','gopro','ugg','zippo',
  'louis vuitton','chanel','prada','hermes','burberry','ray-ban','oakley',
]

// -- Currency helper --------------------------------------------
function getCurrency(country: string): string {
  if (country === 'UK') return '£'
  if (['DE','FR','IT','ES'].includes(country)) return '€'
  if (country === 'AU') return 'A$'
  if (country === 'CA') return 'C$'
  return '$'
}

// -- MathEngine (converted from lib/widgets/math_engine.dart) ---
interface CalcResult {
  ebayFee: number
  paymentFee: number
  adFee: number
  tax: number
  totalFees: number
  netProfit: number
  margin: number
  roi: number
  breakEven: number
}

function calculate(params: {
  itemCost: number; shippingCost: number; salePrice: number; buyerShipping: number
  taxRate: number; adRate: number; category: string; storeTier: string
  sellerLevel: string; country: string; paymentProcessor: string; isInternational: boolean
}): CalcResult {
  const { itemCost, shippingCost, salePrice, buyerShipping, taxRate, adRate,
          category, storeTier, sellerLevel, paymentProcessor, isInternational } = params

  const totalSale = salePrice + buyerShipping
  if (totalSale <= 0) return { ebayFee: 0, paymentFee: 0, adFee: 0, tax: 0, totalFees: 0, netProfit: 0, margin: 0, roi: 0, breakEven: 0 }

  // Category fee
  let catFee = CATEGORY_FEES[category] ?? 13.25

  // Store discount
  if (storeTier.includes('-1.25%')) catFee -= 1.25

  // Seller level adjustment
  let sellerMod = 1.0
  if (sellerLevel.includes('Top Rated'))    sellerMod = 0.90
  if (sellerLevel.includes('Below Standard')) sellerMod = 1.06

  const ebayFee = totalSale * (catFee / 100) * sellerMod + 0.30

  // Payment fee
  const paymentFee = paymentProcessor === 'PayPal'
    ? totalSale * 0.0349 + 0.49
    : totalSale * 0.0299 + 0.49

  // Ad fee
  const adFee = adRate > 0 ? totalSale * (adRate / 100) : 0

  // International fee
  const intlFee = isInternational ? totalSale * 0.015 : 0

  // Tax
  const tax = itemCost > 0 ? itemCost * (taxRate / 100) : 0

  const totalFees = ebayFee + paymentFee + adFee + intlFee
  const totalCost = itemCost + shippingCost + totalFees + tax
  const netProfit = salePrice - totalCost
  const margin    = salePrice > 0 ? (netProfit / salePrice) * 100 : 0
  const roi       = totalCost > 0 ? (netProfit / totalCost) * 100 : 0
  const breakEven = totalCost

  return { ebayFee, paymentFee, adFee, tax, totalFees, netProfit, margin, roi, breakEven }
}

// -- VeRO check -------------------------------------------------
function checkVero(title: string): boolean {
  const lower = ` ${title.toLowerCase()} `
  return VERO_KEYWORDS.some(kw => lower.includes(` ${kw} `))
}

// -- VeRO highlighted title -------------------------------------
function VeroTitle({ title, keywords }: { title: string; keywords: string[] }) {
  const words = title.split(' ')
  return (
    <span className="text-sm font-semibold leading-snug line-clamp-1">
      {words.map((word, i) => {
        const clean = word.replace(/[^\w\s]+/g, '').toLowerCase()
        const isVero = keywords.includes(clean)
        return (
          <span key={i}
            className={cn(isVero ? 'text-red-500 font-black' : 'text-[#0F172A]')}
            style={isVero ? { backgroundColor: '#FFE4E6' } : undefined}>
            {word}{' '}
          </span>
        )
      })}
    </span>
  )
}

// -- Input field ------------------------------------------------
function InputField({ label, value, onChange, prefix, placeholder }: {
  label: string; value: number | string; onChange: (v: number) => void
  prefix?: string; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-[#475569]">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#64748B]">{prefix}</span>
        )}
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder || '0.00'}
          className="w-full h-[42px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] text-[#0F172A] outline-none transition-all"
          style={{ paddingLeft: prefix ? '28px' : '12px', paddingRight: '12px' }}
        />
      </div>
    </div>
  )
}

// -- Select field -----------------------------------------------
function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-[#475569]">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-[42px] pl-3 pr-8 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] text-[#0F172A] outline-none appearance-none transition-all"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
      </div>
    </div>
  )
}

// -- Slider field -----------------------------------------------
function SliderField({ label, value, min, max, step, onChange, suffix }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; suffix?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between">
        <label className="text-[12px] font-semibold text-[#475569]">{label}</label>
        <span className="text-[12px] font-bold text-[#0F172A]">{value.toFixed(1)}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#8FFF00]" />
    </div>
  )
}

// -- Result row -------------------------------------------------
function ResultRow({ label, value, color, bold }: {
  label: string; value: string; color?: string; bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#E8EDE2] last:border-0">
      <span className="text-[12px] text-[#64748B]">{label}</span>
      <span className={cn('text-[13px]', bold ? 'font-extrabold' : 'font-semibold')}
            style={{ color: color || '#0F172A', fontFamily: bold ? 'var(--font-space-grotesk)' : undefined }}>
        {value}
      </span>
    </div>
  )
}

// -- Big metric card --------------------------------------------
function MetricCard({ label, value, sub, color, bg }: {
  label: string; value: string; sub?: string; color: string; bg: string
}) {
  return (
    <div className="p-4 rounded-xl border border-[#E2E8F0]" style={{ backgroundColor: bg }}>
      <p className="text-[11px] font-semibold text-[#64748B] mb-1">{label}</p>
      <p className="text-[22px] font-extrabold leading-tight" style={{ color, fontFamily: 'var(--font-space-grotesk)' }}>{value}</p>
      {sub && <p className="text-[10px] text-[#94A3B8] mt-0.5">{sub}</p>}
    </div>
  )
}

// --------------------------------------------------------------
// MAIN PAGE
// --------------------------------------------------------------
export default function ProfitCalculatorPage() {
  const [country,    setCountry]    = useState('US')
  const [itemCost,   setItemCost]   = useState(0)
  const [shipCost,   setShipCost]   = useState(0)
  const [salePrice,  setSalePrice]  = useState(0)
  const [buyerShip,  setBuyerShip]  = useState(0)
  const [category,   setCategory]   = useState('Other Categories (Default) - 13.25%')
  const [storeTier,  setStoreTier]  = useState('No Store')
  const [sellerLevel,setSellerLevel]= useState('Standard')
  const [processor,  setProcessor]  = useState('Managed')
  const [adRate,     setAdRate]     = useState(0)
  const [taxRate,    setTaxRate]    = useState(8)
  const [isIntl,     setIsIntl]     = useState(false)

  // Product preview (from eBay search)
  const [hasFetched,   setHasFetched]   = useState(false)
  const [fetchedTitle, setFetchedTitle] = useState('')
  const [fetchedImage, setFetchedImage] = useState('')
  const [fetchedSold,  setFetchedSold]  = useState('')
  const [hasVero,      setHasVero]      = useState(false)

  // ? THE SMART CATEGORY MAPPER — matches Dart _ebayCategoryMap
  const EBAY_CATEGORY_MAP: Record<string, string> = {
    '179697': 'Consumer Electronics - 9.00%',
    '15032':  'Cell Phones & Smartphones - 9.00%',
    '11450':  'Clothing, Shoes & Accessories - 13.25%',
    '260324': 'Athletic Shoes (Over $150) - 8.00%',
  }

  // ? UPGRADED FETCH HANDLER — matches Dart _handleProductFetched
  function handleProductFetched(price: number, shipping: number, categoryId: string, title: string, imageUrl: string, soldCount: string) {
    setSalePrice(price)
    setBuyerShip(shipping)
    // ? MAGIC MAPPING — auto-selects category from eBay category ID
    setCategory(EBAY_CATEGORY_MAP[categoryId] ?? 'Other Categories (Default) - 13.25%')
    setFetchedTitle(title)
    setFetchedImage(imageUrl)
    setFetchedSold(soldCount)
    setHasFetched(true)
    setHasVero(checkIfTitleHasVero(title))
  }

  // ? VERO ENGINE — matches Dart _checkIfTitleHasVero
  function checkIfTitleHasVero(title: string): boolean {
    const lowerTitle = ` ${title.toLowerCase()} ` // Pad with spaces to match whole words
    return VERO_KEYWORDS.some(brand => lowerTitle.includes(` ${brand} `))
  }

  // -- Award XP when profit is calculated --------------------
  const calcTrackedRef = useRef(false)
  useEffect(() => {
    if (salePrice <= 0 || itemCost <= 0) return
    if (calcTrackedRef.current) return
    calcTrackedRef.current = true

    const timer = setTimeout(async () => {
      try {
        const supabase = (await import('@/lib/supabase')).createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('titles_count, total_xp')
          .eq('id', user.id)
          .single()
        await (supabase.from('profiles') as any)
          .update({
            titles_count: ((profile as any)?.titles_count ?? 0) + 1,
            total_xp:     ((profile as any)?.total_xp     ?? 0) + 2,
          } as any)
          .eq('id', user.id)
      } catch { /* non-critical */ }
    }, 3000)

    return () => clearTimeout(timer)
  }, [salePrice, itemCost])

  const currency = getCurrency(country)

  const result = MathEngine.calculate({
    itemCost, shippingCost: shipCost, salePrice, buyerShipping: buyerShip,
    taxRate, adRate, category, storeTier, sellerLevel,
    country, paymentProcessor: processor, isInternational: isIntl,
    categoryFees: CATEGORY_FEES,
  })

  const fmt = (n: number) => `${currency}${Math.abs(n).toFixed(2)}`





  return (
    <KillSwitchGate switchTitle="Profit Calculator">
    <div className="min-h-full overflow-auto bg-[#F7F9F5]">
      <div className="w-full px-4 md:px-6 lg:px-8 pt-8 pb-10">

        {/* -- HEADER: subtitle | search bar | country tabs — single row -- */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <p className="text-[13px] shrink-0" style={{ color: C.muted }}>Advanced margin &amp; forecasting for {country}</p>
          <div className="flex-1 min-w-[200px]">
            <EbaySearchBar onFetch={handleProductFetched} />
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {COUNTRIES.map(c => (
              <button key={c} onClick={() => {
                setCountry(c)
                setTaxRate(c === 'US' ? 8 : c === 'UK' ? 20 : 10)
              }}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-all"
                style={{
                  backgroundColor: country === c ? C.dark : '#fff',
                  borderColor: country === c ? C.dark : C.border,
                  color: country === c ? '#fff' : C.muted,
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* -- MAIN LAYOUT -- */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT: Command Center */}
          <div className="lg:w-[340px] shrink-0">
            <CommandCenter
              currency={currency}
              categoryFees={Object.keys(CATEGORY_FEES)}
              storeTiers={STORE_TIERS}
              sellerLevels={SELLER_LEVELS}
              processors={PROCESSORS}
              isInternational={isIntl}
              selectedCategory={category}
              selectedStoreTier={storeTier}
              selectedSellerLevel={sellerLevel}
              selectedProcessor={processor}
              salePriceValue={salePrice}
              buyerShipValue={buyerShip}
              onItemCostChanged={setItemCost}
              onShippingCostChanged={setShipCost}
              onSalePriceChanged={setSalePrice}
              onBuyerShippingChanged={setBuyerShip}
              onAdRateChanged={setAdRate}
              onTaxRateChanged={setTaxRate}
              onCategoryChanged={setCategory}
              onStoreTierChanged={setStoreTier}
              onSellerLevelChanged={setSellerLevel}
              onProcessorChanged={setProcessor}
              onInternationalChanged={setIsIntl}
            />
          </div>

          {/* RIGHT: Pro Dashboard */}
          <div className="flex-1 min-w-0">
            <ProDashboard
              currency={currency}
              currentPrice={salePrice}
              result={result}
            />
          </div>
        </div>

        {/* -- PRODUCT PREVIEW BAR (after eBay search) -- */}
        {hasFetched && (
          <div className="mt-6 p-4 rounded-xl border-2 flex items-center gap-4"
               style={{
                 backgroundColor: hasVero ? '#FEF2F2' : '#fff',
                 borderColor: hasVero ? '#FCA5A5' : C.border,
               }}>
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] overflow-hidden shrink-0 flex items-center justify-center">
              {fetchedImage ? (
                <img src={`https://wsrv.nl/?url=${encodeURIComponent(fetchedImage)}`}
                     alt="product" className="w-full h-full object-cover"
                     onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              ) : (
                <ImageIcon size={20} className="text-[#94A3B8]" />
              )}
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              {hasVero && (
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle size={12} className="text-red-500" />
                  <span className="text-[10px] font-bold text-red-500">VeRO Risk Detected</span>
                </div>
              )}
              <VeroTitle title={fetchedTitle} keywords={VERO_KEYWORDS} />
            </div>

            {/* Sold count */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-[12px] font-bold shrink-0"
                 style={{ backgroundColor: C.dark }}>
              <Flame size={14} className="text-orange-400" />
              {fetchedSold} Sold
            </div>
          </div>
        )}

        {/* Placeholder when no search yet */}
        {!hasFetched && (
          <div className="mt-6 p-4 rounded-xl border border-dashed border-[#E2E8F0] text-center">
            <p className="text-[12px] text-[#94A3B8]">
              eBay product search coming soon — paste an eBay URL to auto-fill the calculator
            </p>
          </div>
        )}

      </div>
    </div>
    </KillSwitchGate>
  )
}
