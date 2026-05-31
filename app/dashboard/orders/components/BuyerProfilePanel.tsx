'use client'
// app/dashboard/orders/components/BuyerProfilePanel.tsx
// ═══════════════════════════════════════════════════════════════
// Converted from: lib/pages/orders/buyer_profile_panel.dart
//
// Sections (same as Dart):
//   ✅ Header — copy, report on eBay, flag, close
//   ✅ Profile hero — avatar, risk badge, risk score circle
//   ✅ Riazify Protection Directive — risk-aware message
//   ✅ Risk score card — progress bar, score zones
//   ✅ Key stats — return rate, disputes, orders, value
//   ✅ Account history metrics — age, feedback, purchases
//   ✅ Delivery address metrics — address, intl warning
//   ✅ Risk patterns — with tooltips
//   ✅ AI analysis card
//   ✅ Order history with you
//   ✅ Similar risk buyers
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import {
  X, Copy, Ban, Flag, Search, BarChart2, ShoppingBag,
  Star, MapPin, History, Users, Info, AlertTriangle,
  CheckCircle, Sparkles, Package, Truck, Store,
  Calendar, ShoppingCart, ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/AppToast'
import { cn } from '@/lib/utils'
import { PageSpinner } from '@/components/ui/Spinner'

// ── Design tokens ──────────────────────────────────────────────
const C = {
  bg: '#F7F9F5', surface: '#FFFFFF', border: '#E8EDE2',
  accent: '#8FFF00', accentDark: '#0A0D08', accentDim: '#F4FFE6',
  textPrimary: '#1A2410', textSecondary: '#4A5E38', textHint: '#8A9E78',
  riskHigh: '#FF0000', riskHighBg: '#FFEEEE', riskMedium: '#92400E',
  riskMediumBg: '#FFFBEA', riskLow: '#2D6A00', riskLowBg: '#F4FFE6',
  blue: '#1976D2',
}

function riskColor(l: string) { return l === 'HIGH' ? C.riskHigh : l === 'MEDIUM' ? C.riskMedium : C.riskLow }
function riskBg(l: string)    { return l === 'HIGH' ? C.riskHighBg : l === 'MEDIUM' ? C.riskMediumBg : C.riskLowBg }

function fmtDate(iso: string) {
  const d = new Date(iso), diff = Date.now() - d.getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 24) return `${h}h ago`
  const dy = Math.floor(h / 24); if (dy < 7) return `${dy}d ago`
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
}

// ── Small helpers ──────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('w-full p-4 rounded-xl border bg-white', className)} style={{ borderColor: C.border }}>
      {children}
    </div>
  )
}

function SectionTitle({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.accent }}>
        <Icon size={13} style={{ color: C.accentDark }} />
      </div>
      <span className="text-[11px] font-bold tracking-[0.5px]" style={{ color: C.textHint }}>{text}</span>
    </div>
  )
}

function StatItem({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: React.ElementType }) {
  return (
    <div className="flex-1 p-3 rounded-xl border" style={{ backgroundColor: color + '0F', borderColor: color + '26' }}>
      <Icon size={15} style={{ color }} />
      <p className="text-[18px] font-bold mt-2 mb-0.5" style={{ color, fontFamily: 'var(--font-space-grotesk)' }}>{value}</p>
      <p className="text-[10px] font-medium" style={{ color: C.textSecondary }}>{label}</p>
    </div>
  )
}

// Risk pattern data (matches Dart patternData)
const PATTERN_DATA: Record<string, { label: string; short: string; tooltip: string }> = {
  serial_returner:        { label: '📦 Serial Returner',              short: 'Returns items frequently after use',           tooltip: 'This buyer has a pattern of returning items after using them. Keep all packaging photos.' },
  inad_claimer:           { label: '⚠️ INAD Claimer',                 short: 'Often claims Item Not As Described',           tooltip: 'Frequently files Item Not As Described disputes. A packing video is the strongest defence.' },
  high_dispute_rate:      { label: '⚖️ High Dispute Rate',            short: 'Files disputes regularly',                    tooltip: 'This buyer has opened disputes against multiple sellers — strong signal of bad faith.' },
  fast_returner:          { label: '⚡ Fast Returner',                 short: 'Returns within days of receiving',             tooltip: 'Returns unusually quickly — can indicate wardrobing or item switching fraud.' },
  late_claimer:           { label: '🕐 Late Claimer',                  short: 'Files claims just before eBay deadline',       tooltip: 'Waits until day 29 of the 30-day window before filing. Monitor orders for the full 30 days.' },
  electronics_risk:       { label: '📱 Electronics Risk',             short: 'High return rate on electronics',              tooltip: 'High return rate on electronics. Always photograph serial numbers before dispatch.' },
  freight_forwarder:      { label: '🏭 Freight Forwarder',            short: 'Ship-to address is a commercial warehouse',    tooltip: 'Address belongs to a freight forwarder. High association with chargeback and INR fraud.' },
  suspicious_velocity:    { label: '⚡ Suspicious Message Velocity',  short: 'Unusual number of messages sent rapidly',      tooltip: 'Sent unusually high messages in a short time — possible social engineering attempt.' },
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
interface BuyerProfilePanelProps {
  buyerUsername:    string
  initialRiskLevel?: string
  onClose:          () => void
}

export default function BuyerProfilePanel({ buyerUsername, initialRiskLevel = 'LOW', onClose }: BuyerProfilePanelProps) {
  const supabase = createClient()
  const toast    = useToast()

  const [loading,        setLoading]        = useState(true)
  const [profile,        setProfile]        = useState<any>(null)
  const [buyerOrders,    setBuyerOrders]    = useState<any[]>([])
  const [similarBuyers,  setSimilarBuyers]  = useState<any[]>([])
  const [currencySymbol, setCurrencySymbol] = useState('$')
  const [orderRiskLevel, setOrderRiskLevel] = useState(initialRiskLevel)
  const [flagged,        setFlagged]        = useState(false)
  const [marketplace,    setMarketplace]    = useState('ebay.com')
  const [visible,        setVisible]        = useState(false)

  const platformName = marketplace.includes('ebay') ? 'eBay'
    : marketplace.includes('amazon') ? 'Amazon'
    : marketplace.includes('shopify') ? 'Shopify'
    : marketplace.includes('etsy') ? 'Etsy'
    : marketplace.includes('walmart') ? 'Walmart'
    : 'Marketplace'

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Currency + marketplace
      const { data: prof } = await (supabase.from('profiles') as any)
        .select('currency_symbol, ebay_marketplace').eq('id', user.id).maybeSingle()
      if (prof?.currency_symbol) setCurrencySymbol(prof.currency_symbol)
      if (prof?.ebay_marketplace) setMarketplace(prof.ebay_marketplace)

      // Buyer profile
      const { data: bp } = await (supabase.from('buyer_profiles') as any)
        .select('*').eq('buyer_username', buyerUsername).maybeSingle()
      setProfile(bp)

      // Orders from this buyer
      const { data: orders } = await (supabase.from('protected_orders') as any)
        .select('*').eq('user_id', user.id).eq('buyer_username', buyerUsername)
        .order('created_at', { ascending: false })
      const orderList = orders || []
      setBuyerOrders(orderList)

      // Determine highest risk
      let highestRisk = 'LOW'
      for (const o of orderList) {
        const lvl = (o.risk_level || 'LOW').toUpperCase()
        if (lvl === 'HIGH') { highestRisk = 'HIGH'; break }
        if (lvl === 'MEDIUM') highestRisk = 'MEDIUM'
      }
      setOrderRiskLevel(highestRisk)

      // Similar buyers
      const { data: similar } = await (supabase.from('protected_orders') as any)
        .select('buyer_username, risk_level, risk_score')
        .eq('user_id', user.id).eq('risk_level', highestRisk)
        .neq('buyer_username', buyerUsername)
        .order('risk_score', { ascending: false }).limit(5)
      const seen = new Set<string>(); const unique: any[] = []
      for (const row of similar || []) {
        if (!seen.has(row.buyer_username)) { seen.add(row.buyer_username); unique.push(row) }
      }
      setSimilarBuyers(unique)
    } catch (e) { console.error('Buyer profile error:', e) }
    finally { setLoading(false) }
  }, [buyerUsername])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 320)
  }

  const rc  = riskColor(orderRiskLevel)
  const rbg = riskBg(orderRiskLevel)
  const riskScore = profile?.risk_score || 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300"
           style={{ opacity: visible ? 1 : 0 }}
           onClick={handleClose} />
      <div className="relative flex flex-col z-10 transition-transform duration-300 ease-out"
           style={{ width: '46%', minWidth: 500, maxWidth: 700, height: '100%', backgroundColor: C.bg, transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* ── HEADER ── */}
        <div className="flex items-center gap-3 px-5 py-4 bg-white border-b shrink-0" style={{ borderColor: C.border }}>
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: C.accent }}>
            <Search size={18} style={{ color: C.accentDark }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold" style={{ color: C.textPrimary, fontFamily: 'var(--font-space-grotesk)' }}>Buyer Profile</p>
            <p className="text-[12px] truncate" style={{ color: C.textHint }}>{buyerUsername}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { navigator.clipboard.writeText(buyerUsername); toast.copied() }}
              className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ borderColor: C.border }}>
              <Copy size={14} style={{ color: C.textSecondary }} />
            </button>
            <button onClick={() => window.open(`https://www.ebay.com/mye/myebay/purchase?filter=SOLD&buyer=${encodeURIComponent(buyerUsername)}`, '_blank')}
              className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ borderColor: C.border }}>
              <Ban size={14} style={{ color: C.riskHigh }} />
            </button>
            <button onClick={() => { setFlagged(!flagged); toast.show(flagged ? 'Flag removed' : `Flagged: ${buyerUsername}`) }}
              className="w-8 h-8 rounded-lg border flex items-center justify-center"
              style={{ borderColor: flagged ? C.riskHigh + '66' : C.border, backgroundColor: flagged ? C.riskHighBg : 'transparent' }}>
              <Flag size={14} style={{ color: flagged ? C.riskHigh : C.textSecondary }} />
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all"
              style={{ borderColor: C.border }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.riskHighBg
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.riskHigh
                ;(e.currentTarget.firstElementChild as HTMLElement).style.color = C.riskHigh
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.border
                ;(e.currentTarget.firstElementChild as HTMLElement).style.color = C.textSecondary
              }}>
              <X size={14} style={{ color: C.textSecondary }} />
            </button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 animate-pulse">
            {/* Hero skeleton */}
            <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.accentDim, borderColor: C.border }}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full" style={{ backgroundColor: C.border }} />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-5 w-36 rounded-lg" style={{ backgroundColor: C.border }} />
                  <div className="h-6 w-24 rounded-full" style={{ backgroundColor: C.border }} />
                  <div className="h-4 w-32 rounded-full" style={{ backgroundColor: C.border }} />
                </div>
                <div className="w-16 h-16 rounded-full" style={{ backgroundColor: C.border }} />
              </div>
            </div>
            {/* Directive skeleton */}
            <div className="p-4 rounded-xl border h-20" style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg shrink-0" style={{ backgroundColor: C.border }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 rounded-full" style={{ backgroundColor: C.border }} />
                  <div className="h-3 w-full rounded-full" style={{ backgroundColor: C.border }} />
                  <div className="h-3 w-3/4 rounded-full" style={{ backgroundColor: C.border }} />
                </div>
              </div>
            </div>
            {/* Risk score skeleton */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="h-4 w-32 rounded mb-3" style={{ backgroundColor: C.border }} />
              <div className="h-3 rounded-full mb-3" style={{ backgroundColor: C.border }} />
              <div className="flex gap-3">
                {[...Array(3)].map((_,i) => <div key={i} className="flex-1 h-8 rounded-lg" style={{ backgroundColor: C.border }} />)}
              </div>
            </div>
            {/* Stats skeleton */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="h-4 w-24 rounded mb-3" style={{ backgroundColor: C.border }} />
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_,i) => <div key={i} className="h-16 rounded-xl" style={{ backgroundColor: C.border }} />)}
              </div>
            </div>
            {/* Account history skeleton */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="h-4 w-36 rounded mb-3" style={{ backgroundColor: C.border }} />
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_,i) => <div key={i} className="h-16 rounded-xl" style={{ backgroundColor: C.border }} />)}
              </div>
            </div>
            {/* Order history skeleton */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="h-4 w-36 rounded mb-3" style={{ backgroundColor: C.border }} />
              {[...Array(3)].map((_,i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b" style={{ borderColor: C.border }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.border }} />
                  <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: C.border }} />
                  <div className="w-14 h-3 rounded-full" style={{ backgroundColor: C.border }} />
                  <div className="w-12 h-5 rounded-full" style={{ backgroundColor: C.border }} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* ── Profile Hero ── */}
            <div className="p-5 rounded-2xl border" style={{
              background: `linear-gradient(135deg, ${rbg} 0%, #fff 100%)`,
              borderColor: rc + '4D', borderWidth: '1.5px'
            }}>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center shrink-0"
                     style={{ backgroundColor: rc + '26', borderColor: rc + '66' }}>
                  <span className="text-[28px] font-extrabold" style={{ color: rc, fontFamily: 'var(--font-space-grotesk)' }}>
                    {buyerUsername[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[18px] font-bold mb-1.5" style={{ color: C.textPrimary, fontFamily: 'var(--font-space-grotesk)' }}>{buyerUsername}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: rc }}>
                      {orderRiskLevel} RISK
                    </span>
                    <span className="text-[12px]" style={{ color: C.textSecondary }}>{platformName} Buyer</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <ShoppingBag size={13} style={{ color: C.textHint }} />
                      <span className="text-[12px]" style={{ color: C.textSecondary }}>
                        {buyerOrders.length} order{buyerOrders.length !== 1 ? 's' : ''} with you
                      </span>
                    </div>
                    {profile?.feedback_score && (
                      <div className="flex items-center gap-1">
                        <Star size={13} style={{ color: C.riskMedium }} />
                        <span className="text-[12px]" style={{ color: C.textSecondary }}>{profile.feedback_score} feedback</span>
                      </div>
                    )}
                  </div>
                  {!profile && (
                    <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg border bg-white w-fit"
                         style={{ borderColor: C.border }}>
                      <Info size={12} style={{ color: C.textHint }} />
                      <span className="text-[11px]" style={{ color: C.textSecondary }}>No risk profile — first interaction</span>
                    </div>
                  )}
                </div>
                {/* Risk score circle */}
                <div className="w-[70px] h-[70px] rounded-full border-[3px] flex flex-col items-center justify-center shrink-0 bg-white"
                     style={{ borderColor: rc, boxShadow: `0 4px 12px ${rc}33` }}>
                  <span className="text-[22px] font-extrabold" style={{ color: rc, fontFamily: 'var(--font-space-grotesk)' }}>{riskScore}</span>
                  <span className="text-[9px]" style={{ color: C.textHint }}>/ 100</span>
                </div>
              </div>
            </div>

            {/* ── Riazify Protection Directive ── */}
            <div className="p-3.5 rounded-xl border" style={{
              backgroundColor: rbg,
              borderColor: rc + '80', borderWidth: '1.5px'
            }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[18px]"
                     style={{ backgroundColor: rc + '26' }}>
                  {orderRiskLevel === 'LOW' ? '✅' : '⚠️'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-[1.5px]"
                          style={{ backgroundColor: C.accent, color: C.accentDark }}>RIAZIFY</span>
                    <span className="text-[11px] font-bold" style={{ color: rc }}>Protection Directive</span>
                  </div>
                  <p className="text-[12px] leading-relaxed" style={{ color: C.textPrimary }}>
                    {orderRiskLevel === 'HIGH'
                      ? 'Due to severe address validation anomalies, a 100% video-backed vault recording and signature-required delivery service are mandatory to preserve your payout.'
                      : orderRiskLevel === 'MEDIUM'
                        ? 'Elevated risk detected due to account age. Pre-dispatch photos of the shipping label and serial numbers are highly recommended before handoff.'
                        : `Account meets all safe merchant baselines. Standard tracking updates will suffice for complete coverage. Ensure shipping cost is documented in ${currencySymbol} for any future dispute evidence.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* ── Risk Score Card ── */}
            <Card>
              <SectionTitle icon={BarChart2} text="eBay RISK SCORE BREAKDOWN" />
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px]" style={{ color: C.textHint }}>0</span>
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${riskScore}%`, backgroundColor: rc }} />
                </div>
                <span className="text-[10px]" style={{ color: C.textHint }}>100</span>
              </div>
              <div className="flex gap-2 mb-4">
                {[['0-30', 'LOW', C.riskLow, riskScore <= 30],
                  ['31-60', 'MEDIUM', C.riskMedium, riskScore > 30 && riskScore <= 60],
                  ['61-100', 'HIGH', C.riskHigh, riskScore > 60]].map(([range, label, color, active]: any) => (
                  <div key={label} className="flex-1 px-3 py-2 rounded-lg text-center border transition-all"
                       style={{ backgroundColor: active ? (color as string) + '1A' : 'transparent', borderColor: active ? color as string : 'transparent' }}>
                    <p className="text-[10px] font-semibold" style={{ color: active ? color as string : C.textHint }}>{range}</p>
                    <p className="text-[11px] font-bold" style={{ color: active ? color as string : C.textHint }}>{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg border" style={{ backgroundColor: rc + '0F', borderColor: rc + '33' }}>
                <Info size={14} style={{ color: rc, marginTop: 1 }} />
                <p className="text-[12px] leading-relaxed" style={{ color: C.textPrimary }}>
                  {orderRiskLevel === 'HIGH'
                    ? `Score ${riskScore}/100 — This buyer has a high probability of filing disputes. Extra protection steps are strongly recommended.`
                    : orderRiskLevel === 'MEDIUM'
                      ? `Score ${riskScore}/100 — This buyer has shown some risk indicators. Complete the checklist and consider signature-required shipping.`
                      : `Score ${riskScore}/100 — This buyer appears low risk. Standard shipping practices should be sufficient.`
                  }
                </p>
              </div>
            </Card>

            {/* ── Key Stats ── */}
            <Card>
              <SectionTitle icon={BarChart2} text="📈 KEY STATISTICS" />
              <div className="grid grid-cols-3 gap-3 mb-3">
                <StatItem label="Return Rate"    value={`${Number(profile?.return_rate || 0).toFixed(0)}%`} color={Number(profile?.return_rate || 0) > 30 ? C.riskHigh : C.riskLow} icon={Package} />
                <StatItem label="Disputes"       value={`${profile?.dispute_count || 0}`}                  color={(profile?.dispute_count || 0) > 2 ? C.riskHigh : C.textSecondary} icon={AlertTriangle} />
                <StatItem label="Orders With You" value={`${buyerOrders.length}`}                          color={C.blue} icon={ShoppingBag} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <StatItem label="Shipped" value={`${buyerOrders.filter((o: any) => ['shipped','delivered'].includes(o.order_status)).length}/${buyerOrders.length}`} color={C.riskLow} icon={Truck} />
                <StatItem label="Total Value" value={`${currencySymbol}${buyerOrders.reduce((s: number, o: any) => s + Number(o.item_price || 0), 0).toFixed(0)}`} color={C.blue} icon={ShoppingCart} />
                <StatItem label="Platform" value="eBay" color={C.textSecondary} icon={Store} />
              </div>
            </Card>

            {/* ── Account History Metrics ── */}
            <Card>
              <SectionTitle icon={Calendar} text="ACCOUNT HISTORY METRICS" />
              {(() => {
                const ageMonths = profile?.account_age_months || 0
                const years = Math.floor(ageMonths / 12), months = ageMonths % 12
                const ageText = years > 0 ? `${years}y ${months}mo` : `${months}mo`
                const ageColor = ageMonths < 6 ? C.riskHigh : ageMonths < 24 ? C.riskMedium : C.riskLow
                const fbPct = Number(profile?.feedback_percent || 0)
                const fbColor = fbPct >= 98 ? C.riskLow : fbPct >= 90 ? C.riskMedium : C.riskHigh
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <StatItem label="Account Age"     value={ageText}                                  color={ageColor}  icon={Calendar}     />
                      <StatItem label="Feedback Score"  value={profile?.feedback_score || '—'}           color={fbColor}   icon={Star}         />
                      <StatItem label="Feedback %"      value={`${fbPct.toFixed(1)}%`}                   color={fbColor}   icon={CheckCircle}  />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <StatItem label="Total Purchases"  value={`${profile?.total_purchases || 0}`}      color={C.textPrimary} icon={ShoppingCart} />
                      <StatItem label="Non-Acceptance"   value={`${profile?.non_acceptance_count || 0}`} color={(profile?.non_acceptance_count || 0) > 2 ? C.riskHigh : C.textSecondary} icon={Ban} />
                      <StatItem label="Platform"         value="eBay"                                    color={C.textSecondary} icon={Store}   />
                    </div>
                    {ageMonths < 6 && (
                      <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg border" style={{ backgroundColor: C.riskHighBg, borderColor: C.riskHigh + '4D' }}>
                        <AlertTriangle size={13} style={{ color: C.riskHigh }} />
                        <p className="text-[11px]" style={{ color: C.riskHigh }}>New account — less than 6 months old. Higher risk of fraud.</p>
                      </div>
                    )}
                  </>
                )
              })()}
            </Card>

            {/* ── Delivery Address Metrics ── */}
            {buyerOrders.length > 0 && (() => {
              const o = buyerOrders[0]
              const city = o.shipping_city || '—', state = o.shipping_state || '—'
              const zip = o.shipping_zip || '—', country = o.shipping_country || '—'
              const isIntl = country && !['us','united states','gb','united kingdom'].includes(country.toLowerCase())
              const addrColor = isIntl ? C.riskHigh : orderRiskLevel === 'HIGH' ? C.riskMedium : C.riskLow
              return (
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <SectionTitle icon={MapPin} text="DELIVERY ADDRESS METRICS" />
                    <button onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(`${city} ${state} ${zip} ${country}`)}`, '_blank')}
                      className="w-7 h-7 rounded-lg border flex items-center justify-center"
                      style={{ backgroundColor: C.accentDim, borderColor: C.accent + '80' }}>
                      <ExternalLink size={13} style={{ color: C.accentDark }} />
                    </button>
                  </div>
                  <div className="p-3 rounded-xl border mb-3" style={{ backgroundColor: addrColor + '0F', borderColor: addrColor + '33' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin size={12} style={{ color: addrColor }} />
                      <span className="text-[10px] font-bold tracking-[0.5px]" style={{ color: C.textHint }}>SHIPPING ADDRESS</span>
                    </div>
                    <p className="text-[12px] font-semibold mb-1" style={{ color: C.textPrimary }}>{city}, {state} {zip}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px]" style={{ color: C.textSecondary }}>{country}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border"
                            style={{ backgroundColor: addrColor + '1A', borderColor: addrColor + '4D', color: addrColor }}>
                        {isIntl ? '🌍 International' : '🏠 Domestic'}
                      </span>
                    </div>
                  </div>
                  {isIntl && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg border" style={{ backgroundColor: C.riskHighBg, borderColor: C.riskHigh + '4D' }}>
                      <AlertTriangle size={13} style={{ color: C.riskHigh, marginTop: 1 }} />
                      <p className="text-[11px] leading-relaxed" style={{ color: C.riskHigh }}>
                        International shipping address detected. Higher association with freight forwarder fraud and Item Not Received claims.
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Info size={12} style={{ color: C.textHint }} />
                    <p className="text-[11px]" style={{ color: C.textSecondary }}>
                      {buyerOrders.length > 1 ? `Used across ${buyerOrders.length} orders with you` : 'First order — no address history to compare'}
                    </p>
                  </div>
                </Card>
              )
            })()}

            {/* ── Risk Patterns ── */}
            {(profile?.risk_patterns as string[] || []).length > 0 && (
              <Card>
                <SectionTitle icon={Flag} text="🚩 DETECTED RISK PATTERNS" />
                <div className="space-y-2">
                  {(profile.risk_patterns as string[]).map((p, i) => {
                    const data = PATTERN_DATA[p] || { label: `⚠️ ${p.replace(/_/g,' ')}`, short: '', tooltip: 'Risk pattern detected.' }
                    return (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg border"
                           style={{ backgroundColor: C.riskHighBg, borderColor: C.riskHigh + '33' }}>
                        <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: C.riskHigh }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold" style={{ color: C.riskHigh }}>{data.label}</p>
                          {data.short && <p className="text-[11px] mt-0.5" style={{ color: C.textSecondary }}>{data.short}</p>}
                        </div>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" title={data.tooltip}
                             style={{ backgroundColor: C.textHint + '26' }}>
                          <Info size={11} style={{ color: C.textHint }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}

            {/* ── AI Analysis ── */}
            {profile?.ai_analysis && (
              <Card>
                <SectionTitle icon={Sparkles} text="🤖 AI RISK ANALYSIS" />
                <div className="flex items-start gap-3 p-3.5 rounded-xl border" style={{ backgroundColor: C.accentDim, borderColor: C.accent + '4D' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: C.accent }}>
                    <Sparkles size={14} style={{ color: C.accentDark }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.5px] mb-1.5" style={{ color: C.accentDark }}>AI ASSESSMENT</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.textPrimary }}>{profile.ai_analysis}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* ── Order History ── */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <SectionTitle icon={History} text="🛍️ ORDER HISTORY WITH YOU" />
                <span className="text-[11px]" style={{ color: C.textSecondary }}>{buyerOrders.length} total</span>
              </div>
              {buyerOrders.length === 0 ? (
                <p className="text-center py-5 text-[13px]" style={{ color: C.textHint }}>No orders from this buyer yet</p>
              ) : (
                <div className="space-y-2">
                  {buyerOrders.map((order: any, i: number) => {
                    const status = order.order_status || 'pending'
                    const price  = Number(order.item_price || 0)
                    const rc2    = riskColor(order.risk_level || 'LOW')
                    const isShipped = ['shipped','delivered'].includes(status)
                    return (
                      <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: rc2 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold truncate" style={{ color: C.textPrimary }}>{order.item_title || 'Unknown'}</p>
                          <p className="text-[10px]" style={{ color: C.textHint }}>
                            {order.created_at ? fmtDate(order.created_at) : '-'}
                          </p>
                        </div>
                        <span className="text-[13px] font-bold shrink-0" style={{ color: C.textPrimary, fontFamily: 'var(--font-space-grotesk)' }}>
                          {currencySymbol}{price.toFixed(2)}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold"
                              style={{ backgroundColor: isShipped ? C.riskLow + '1A' : C.textHint + '1A', color: isShipped ? C.riskLow : C.textHint }}>
                          {status.toUpperCase()}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* ── Similar Buyers ── */}
            <Card>
              <SectionTitle icon={Users} text="👥 SIMILAR RISK BUYERS" />
              <p className="text-[11px] mb-3" style={{ color: C.textSecondary }}>Buyers with similar return/dispute patterns</p>
              {similarBuyers.length === 0 ? (
                <p className="text-center py-4 text-[13px]" style={{ color: C.textHint }}>No similar buyers found in your orders</p>
              ) : (
                <div className="space-y-2">
                  {similarBuyers.map((buyer: any, i: number) => {
                    const rc3 = riskColor(buyer.risk_level || 'LOW')
                    const rbg3 = riskBg(buyer.risk_level || 'LOW')
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border"
                           style={{ backgroundColor: rbg3 + '80', borderColor: rc3 + '33' }}>
                        <div className="w-9 h-9 rounded-full border flex items-center justify-center shrink-0"
                             style={{ backgroundColor: rc3 + '26', borderColor: rc3 + '4D' }}>
                          <span className="text-[14px] font-bold" style={{ color: rc3, fontFamily: 'var(--font-space-grotesk)' }}>
                            {(buyer.buyer_username || '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold truncate" style={{ color: C.textPrimary }}>{buyer.buyer_username}</p>
                          <p className="text-[11px]" style={{ color: C.textSecondary }}>Return rate: {Number(buyer.buyer_profiles?.return_rate ?? 0).toFixed(0)}%</p>
                        </div>
                        <div className="text-right">
                          <span className="block px-2 py-0.5 rounded text-[9px] font-bold text-white mb-1" style={{ backgroundColor: rc3 }}>
                            {buyer.risk_level}
                          </span>
                          <span className="text-[10px]" style={{ color: C.textSecondary }}>Score: {buyer.risk_score}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <div className="h-8" />
          </div>
        )}
      </div>
    </div>
  )
}