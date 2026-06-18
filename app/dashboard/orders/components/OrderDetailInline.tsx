'use client'
// app/dashboard/orders/[id]/page.tsx
// ═══════════════════════════════════════════════════════════════
// Converted from: lib/pages/orders/order_detail_screen.dart
// All 3 parts (5254 lines of Dart → single Next.js page)
//
// Sections (same as Dart):
//   ✅ Header — order ID, item title, close/back button
//   ✅ Alert banner — LOW/MEDIUM/HIGH/dispute/all-done states
//   ✅ Order summary card — item, price, buyer, status, condition, dispatch countdown
//   ✅ Risk score card — score/100, progress bar, return rate, disputes
//   ✅ Ship to address — copy + Google Maps dialog
//   ✅ Protection checklist — 5 animated steps, risk-aware unlock
//   ✅ Low risk banner
//   ✅ Why this buyer is risky — AI analysis, patterns, red flags
//   ✅ Evidence vault — 5 types, upload, link, delete
//   ✅ Evidence report PDF button
//   ✅ Buyer history — expandable, last 5 transactions
//   ✅ Shipping requirements — risk-aware, mark as shipped dialog
//   ✅ Quick actions — message templates, INAD policy, cancel order
//   ✅ Message templates dialog — 4 templates, resizable, history
//   ✅ Mark as shipped dialog — carrier, tracking, date, options
//   ✅ Cancel order — 3-step flow
//   ✅ INAD policy panel — personalised rules
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import {
  Shield, ShieldAlert, ShieldOff, AlertTriangle, CheckCircle, XCircle, Lock,
  X, Copy, MapPin, Truck, Clock, Package, Gavel,
  FolderOpen, FileText, History, ChevronDown, ChevronUp,
  Zap, MessageSquare, FileWarning, Ban, ExternalLink,
  Camera, Video, Receipt, Tag, Link, Plus, Trash2,
  RefreshCw, Download, Info, ArrowLeft, Check,
  Send, UploadCloud,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/AppToast'
import { cn } from '@/lib/utils'
import Spinner, { PageSpinner } from '@/components/ui/Spinner'

// ── Design tokens ──────────────────────────────────────────────
const C = {
  bg: '#F4F6F0', surface: '#FFFFFF', border: '#E4EAD8',
  accent: '#8FFF00', accentDeep: '#4A8F00', accentDark: '#0A0D08',
  accentDim: '#F4FFE6', textPrimary: '#1A2410', textSecondary: '#5A6B4A',
  textHint: '#8A9E78', riskHigh: '#FF0000', riskHighBg: '#FFEEEE',
  riskMedium: '#92400E', riskMediumBg: '#FFFBEA', riskLow: '#2D6A00',
  riskLowBg: '#F4FFE6', statusShipped: '#1A5FA8', statusShippedBg: '#E8F4FF',
  statusPending: '#8A5F00', statusPendingBg: '#FFF8E8',
  statusDelivered: '#007A5E', statusDeliveredBg: '#E6FAF5',
}

const STEPS = [
  { label: 'Record item video before packing',        warning: 'Without this: Cannot prove item condition to eBay' },
  { label: 'Film packing process (uncut video)',       warning: "Without this: Buyer can claim 'wrong item sent'" },
  { label: 'Use signature-required shipping',         warning: "Without this: Buyer can claim 'never received'" },
  { label: 'Send pre-shipment message to buyer',      warning: 'Without this: No communication record if disputed' },
  { label: 'Upload evidence to vault',                warning: 'Without this: No proof stored for eBay case', autoKey: 'evidence' },
]

const EVIDENCE_TYPES = [
  { key: 'serial_number',  icon: Camera,   label: 'Serial number close-up' },
  { key: 'item_photos',    icon: Package,  label: 'Item from all angles' },
  { key: 'packing_video',  icon: Video,    label: 'Packing video (uncut, 2–5 min)' },
  { key: 'shipping_label', icon: Truck,    label: 'Shipping label + tracking' },
  { key: 'weight_receipt', icon: Receipt,  label: 'Weight receipt from carrier' },
]

function riskColor(l: string) { return l === 'HIGH' ? C.riskHigh : l === 'MEDIUM' ? C.riskMedium : C.riskLow }
function riskBg(l: string)    { return l === 'HIGH' ? C.riskHighBg : l === 'MEDIUM' ? C.riskMediumBg : C.riskLowBg }
function fmtDate(iso: string) {
  const d = new Date(iso), diff = Date.now() - d.getTime()
  const m = Math.floor(diff/60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m/60); if (h < 24) return `${h}h ago`
  const dy = Math.floor(h/24); if (dy < 7) return `${dy}d ago`
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
}

// ── Small reusables ────────────────────────────────────────────
function Card({ children, color, borderColor, className = '' }: {
  children: React.ReactNode; color?: string; borderColor?: string; className?: string
}) {
  return (
    <div className={cn('rounded-xl border overflow-hidden', className)}
         style={{ backgroundColor: color || C.surface, borderColor: borderColor || C.border }}>
      {children}
    </div>
  )
}

function CardHeader({ icon: Icon, title, iconBg, iconColor, titleColor, trailing }: {
  icon: React.ElementType; title: string; iconBg?: string; iconColor?: string
  titleColor?: string; trailing?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ backgroundColor: 'transparent' }}>
      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
           style={{ backgroundColor: iconBg || C.accent }}>
        <Icon size={14} style={{ color: iconColor || C.accentDark }} />
      </div>
      <span className="flex-1 text-[10px] font-bold tracking-[0.5px]"
            style={{ color: titleColor || C.textHint }}>{title}</span>
      {trailing}
    </div>
  )
}

function MiniRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} style={{ color: C.textHint }} />
      <span className="text-[11px]" style={{ color: C.textSecondary }}>{label}: </span>
      <span className="flex-1 text-[11px] font-semibold truncate" style={{ color: C.textPrimary }}>{value}</span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export function OrderDetailInline({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const router   = useRouter()
  const supabase = createClient()
  const toast    = useToast()
  const id       = orderId

  const [order,          setOrder]          = useState<any>(null)
  const [loading,        setLoading]        = useState(true)
  const [checklist,      setChecklist]      = useState<Record<string, any> | null>(null)
  const [evidence,       setEvidence]       = useState<any[]>([])
  const [sentMessages,   setSentMessages]   = useState<any[]>([])
  const [buyerProfile,   setBuyerProfile]   = useState<any>(null)
  const [showBuyerHist,  setShowBuyerHist]  = useState(false)
  const [showBuyerPanel, setShowBuyerPanel] = useState(false)
  const [showMapDialog,  setShowMapDialog]  = useState(false)
  const [showMsgDialog,  setShowMsgDialog]  = useState(false)
  const [showShipDialog, setShowShipDialog] = useState(false)
  const [showCancelFlow, setShowCancelFlow] = useState(false)
  const [showInad,       setShowInad]       = useState(false)
  const [showEvidDlg,    setShowEvidDlg]    = useState(false)

  // Load order
  useEffect(() => {
    if (!id) return
    supabase.from('protected_orders').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) {
          setOrder(data as any)
          const raw = (data as any).protection_checklist
          const risk = ((data as any).risk_level || 'LOW').toUpperCase()
          if (risk !== 'LOW') {
            setChecklist(raw && Object.keys(raw).length > 0 ? raw : {
              step_1: { completed: false }, step_2: { completed: false },
              step_3: { completed: false }, step_4: { completed: false },
              step_5: { completed: false },
            })
          }
        }
        setLoading(false)
      })
  }, [id])

// Load evidence
  const loadEvidence = useCallback(async () => {
    if (!id) return
    const { data } = await supabase.from('order_evidence').select('*').eq('order_id', id).order('uploaded_at', { ascending: false })
    setEvidence(data || [])
  }, [id])

  useEffect(() => { loadEvidence() }, [loadEvidence])

  // Load messages + buyer profile
  useEffect(() => {
    if (!order) return
    supabase.from('sent_messages').select('*').eq('order_id', id).order('sent_at', { ascending: false })
      .then(({ data }) => setSentMessages(data || []))
    const buyer = order.buyer_username
    if (buyer) {
      supabase.from('buyer_profiles').select('*').eq('buyer_username', buyer).maybeSingle()
        .then(({ data }) => { if (data) setBuyerProfile(data) })
    }
  }, [order])

  // Toggle checklist step
  async function toggleStep(key: string) {
    if (!checklist || !order) return
    const current = checklist[key]?.completed || false
    const updated = {
      ...checklist,
      [key]: { completed: !current, timestamp: !current ? new Date().toISOString() : null }
    }
    setChecklist(updated)
    const allCompleted = Object.values(updated).every((s: any) => s.completed)
    await (supabase.from('protected_orders') as any).update({
      protection_checklist: updated,
      checklist_completed:  allCompleted,
    } as any).eq('id', id)

    // ── Award XP when order fully protected ──────────────────
    if (allCompleted) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await (supabase.from('profiles') as any)
            .select('orders_count, total_xp')
            .eq('id', user.id)
            .single()

          await (supabase.from('profiles') as any)
            .update({
              orders_count: ((profile as any)?.orders_count ?? 0) + 1,
              total_xp:     ((profile as any)?.total_xp     ?? 0) + 10,
            } as any)
            .eq('id', user.id)
        }
      } catch { /* non-critical — never block order protection */ }
    }
  }

  if (loading) return (
    <div className="min-h-full animate-pulse" style={{ backgroundColor: C.bg }}>
      {/* Header skeleton */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: C.border }} />
        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: C.border }} />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-32 rounded-full" style={{ backgroundColor: C.border }} />
          <div className="h-3 w-48 rounded-full" style={{ backgroundColor: C.border }} />
        </div>
        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: C.border }} />
      </div>
      {/* Alert banner skeleton */}
      <div className="h-14 border-b" style={{ backgroundColor: C.accentDim, borderColor: C.border }} />
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Order summary + risk score row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4 h-40" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }} />
          <div className="rounded-xl p-4 h-40" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }} />
        </div>
        {/* Ship to address */}
        <div className="rounded-xl h-16" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }} />
        {/* Checklist */}
        <div className="rounded-xl p-4 h-48" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
          <div className="h-4 w-40 rounded mb-3" style={{ backgroundColor: C.border }} />
          <div className="h-2 rounded-full mb-3" style={{ backgroundColor: C.border }} />
          {[...Array(5)].map((_,i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-5 h-5 rounded" style={{ backgroundColor: C.border }} />
              <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: C.border }} />
            </div>
          ))}
        </div>
        {/* Evidence vault */}
        <div className="rounded-xl h-32" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }} />
        {/* Shipping */}
        <div className="rounded-xl h-28" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }} />
        {/* Quick actions */}
        <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
          {[...Array(3)].map((_,i) => (
            <div key={i} className="h-12 rounded-lg" style={{ backgroundColor: C.border }} />
          ))}
        </div>
      </div>
    </div>
  )
  if (!order) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <ShieldOff size={40} style={{ color: C.textHint }} />
      <p className="text-[14px]" style={{ color: C.textHint }}>Order not found</p>
      <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold"
        style={{ backgroundColor: C.accent, color: C.accentDark }}>← Back to Orders</button>
    </div>
  )

  // Derived values
  const riskLevel   = (order.risk_level || 'LOW').toUpperCase()
  const riskScore   = order.risk_score || 0
  const itemTitle   = order.item_title || 'Unknown Item'
  const itemPrice   = Number(order.item_price || 0)
  const buyerName   = order.buyer_username || 'Unknown'
  const ebayOrderId = order.ebay_order_id || 'Unknown'
  const orderStatus = (order.order_status || 'pending').toLowerCase()
  const createdAt   = order.created_at ? new Date(order.created_at) : null
  const rc          = riskColor(riskLevel)
  const rbg         = riskBg(riskLevel)
  const daysOld     = createdAt ? Math.floor((Date.now() - createdAt.getTime()) / 86400000) : 0
  const daysLeft    = Math.max(0, 3 - daysOld)
  const city        = order.shipping_city    || ''
  const state       = order.shipping_state   || ''
  const zip         = order.shipping_zip     || ''
  const country     = order.shipping_country || ''
  const fullAddress = [city && state ? `${city}, ${state}` : city || state, zip, country].filter(Boolean).join(' · ')
  const disputeOpened = order.dispute_opened || false
  const disputeReason = order.dispute_reason || ''
  const returnRate    = Number(buyerProfile?.return_rate || 0)
  const disputeCount  = buyerProfile?.dispute_count || 0
  const aiAnalysis    = buyerProfile?.ai_analysis || ''
  const patterns      = buyerProfile?.risk_patterns || []

  // Checklist math
  const totalSteps = checklist ? Object.keys(checklist).length : 0
  const doneSteps  = checklist ? Object.values(checklist).filter((s: any) => s.completed).length : 0
  const pct        = totalSteps > 0 ? doneSteps / totalSteps : 0
  const allDone    = totalSteps > 0 && doneSteps === totalSteps
  const canShip        = riskLevel === 'LOW' || (riskLevel === 'MEDIUM' && pct >= 0.6) || allDone
  // matches Dart _canAddEvidence exactly
  const canAddEvidence = evidence.length > 0 ? true
    : riskLevel === 'LOW' ? true
    : riskLevel === 'MEDIUM' ? pct >= 0.4
    : pct >= 0.6  // HIGH — need 3/5
  const showChecklist = riskLevel === 'HIGH' || riskLevel === 'MEDIUM'

  // Status colors
  const statusColor = orderStatus === 'shipped' ? C.statusShipped : orderStatus === 'delivered' ? C.statusDelivered : C.statusPending
  const statusBg    = orderStatus === 'shipped' ? C.statusShippedBg : orderStatus === 'delivered' ? C.statusDeliveredBg : C.statusPendingBg

  const uploadedTypes = new Set(evidence.map(e => e.checklist_step || e.evidence_type))

  return (
    <div className="min-h-full" style={{ backgroundColor: C.bg }}>
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 px-4 py-3.5 sticky top-0 z-10 border-b"
           style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
             style={{ backgroundColor: C.accent }}>
          <Shield size={16} style={{ color: C.accentDark }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold truncate" style={{ color: C.textPrimary }}>Order #{ebayOrderId}</p>
          {createdAt && (
            <p className="text-[10px] truncate" style={{ color: C.textHint }}>
              {fmtDate(createdAt.toISOString())} · {itemTitle}
            </p>
          )}
        </div>
        {/* Close button — top right, red on hover */}
        <button onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all shrink-0"
          style={{ borderColor: C.border }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.backgroundColor = C.riskHighBg
            btn.style.borderColor = C.riskHigh
            btn.querySelectorAll('svg').forEach(s => s.style.stroke = C.riskHigh)
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.backgroundColor = 'transparent'
            btn.style.borderColor = C.border
            btn.querySelectorAll('svg').forEach(s => s.style.stroke = C.textSecondary)
          }}>
          <X size={15} style={{ color: C.textSecondary }} />
        </button>
      </div>

      {/* ── ALERT BANNER ── */}
      {riskLevel === 'LOW' && !disputeOpened && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b"
             style={{ backgroundColor: C.accentDim, borderColor: C.accent + '4D' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.accent }}>
            <CheckCircle size={14} style={{ color: C.accentDark }} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-extrabold tracking-[0.5px]" style={{ color: C.accentDeep }}>LOW RISK — SAFE TO SHIP</p>
            <p className="text-[10px]" style={{ color: C.textSecondary }}>Trusted buyer — no extra protection steps needed</p>
          </div>
          <span className="text-[14px] font-bold" style={{ color: C.accentDeep }}>${itemPrice.toFixed(2)}</span>
        </div>
      )}
      {disputeOpened && (
        <div className="flex items-center gap-3 px-4 py-3 border-b"
             style={{ backgroundColor: C.riskHighBg, borderColor: C.riskHigh + '4D' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.riskHigh }}>
            <Gavel size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-extrabold tracking-[0.4px]" style={{ color: C.riskHigh }}>DISPUTE OPENED — ACTION REQUIRED</p>
            <p className="text-[10px]" style={{ color: C.textSecondary }}>
              {disputeReason || 'Submit your evidence vault to eBay immediately'}
            </p>
          </div>
          <span className="px-2 py-1 rounded text-[9px] font-bold text-white" style={{ backgroundColor: C.riskHigh }}>URGENT</span>
        </div>
      )}
      {!disputeOpened && riskLevel !== 'LOW' && allDone && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b"
             style={{ backgroundColor: C.accentDim, borderColor: C.accent + '4D' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.accent }}>
            <CheckCircle size={14} style={{ color: C.accentDark }} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-extrabold" style={{ color: C.accentDeep }}>ORDER PROTECTED ✓</p>
            <p className="text-[10px]" style={{ color: C.textSecondary }}>All steps complete — safe to ship!</p>
          </div>
          <span className="text-[14px] font-bold" style={{ color: C.accentDeep }}>${itemPrice.toFixed(2)}</span>
        </div>
      )}
      {!disputeOpened && riskLevel !== 'LOW' && !allDone && (
        <div className="px-4 py-3 border-b" style={{ backgroundColor: rbg, borderColor: rc + '33' }}>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: rc }}>
              <AlertTriangle size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold" style={{ color: rc }}>
                {riskLevel === 'HIGH' ? '⚠️ DO NOT SHIP — Action Required!' : '⚠️ Caution — Complete 3 of 5 steps to ship'}
              </p>
              <p className="text-[10px]" style={{ color: C.textSecondary }}>Complete all protection steps first</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[['💰 At Risk', `$${itemPrice.toFixed(2)}`], ['📅 Dispatch', daysLeft <= 0 ? 'Overdue!' : `${daysLeft} day${daysLeft===1?'':'s'} left`], ['🛡️ Protection', `${doneSteps}/${totalSteps} done`]].map(([l, v]) => (
              <div key={l} className="px-3 py-2 rounded-lg text-center" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
                <p className="text-[13px] font-bold" style={{ color: rc }}>{v}</p>
                <p className="text-[9px] font-semibold" style={{ color: C.textSecondary }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className="p-3.5 space-y-3">

        {/* Order summary + Risk score row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Order Summary */}
          <Card>
            <CardHeader icon={Package} title="ORDER SUMMARY" />
            <div className="px-3.5 pb-3.5 space-y-3">
              <p className="text-[13px] font-semibold line-clamp-2" style={{ color: C.textPrimary }}>{itemTitle}</p>
              <p className="text-[20px] font-extrabold" style={{ color: C.accentDeep, fontFamily: 'var(--font-space-grotesk)' }}>${itemPrice.toFixed(2)}</p>
              <div className="border-t pt-2.5 space-y-1.5" style={{ borderColor: C.border }}>
                <button onClick={() => setShowBuyerPanel(true)}
                  className="w-full flex items-center gap-2 hover:opacity-80 transition-opacity text-left">
                  <Tag size={13} style={{ color: C.textHint }} />
                  <span className="text-[11px]" style={{ color: C.textSecondary }}>Buyer:</span>
                  <span className="flex-1 text-[11px] font-semibold truncate" style={{ color: C.textPrimary }}>{buyerName}</span>
                  <ExternalLink size={12} style={{ color: C.accent }} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
                  <span className="text-[11px]" style={{ color: C.textSecondary }}>Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ backgroundColor: statusBg, color: statusColor }}>
                    {orderStatus.toUpperCase()}
                  </span>
                </div>
                {order.item_condition && <MiniRow icon={Package} label="Condition" value={order.item_condition} />}
                {orderStatus !== 'shipped' && orderStatus !== 'delivered' && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold"
                       style={{ backgroundColor: daysLeft <= 1 ? C.riskHighBg : C.riskMediumBg, color: daysLeft <= 1 ? C.riskHigh : C.riskMedium }}>
                    <Clock size={10} />
                    {daysLeft <= 0 ? 'Dispatch overdue!' : `${daysLeft} day${daysLeft===1?'':'s'} left to dispatch`}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Risk Score */}
          <Card color={rbg} borderColor={rc + '4D'}>
            <CardHeader icon={ShieldAlert} title={`${riskLevel} RISK`} iconBg={rc} iconColor="#fff" titleColor={rc} />
            <div className="px-3.5 pb-3.5 space-y-2">
              <p className="text-[36px] font-extrabold" style={{ color: rc, fontFamily: 'var(--font-space-grotesk)' }}>{riskScore}</p>
              <p className="text-[10px]" style={{ color: C.textHint }}>out of 100</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                <div className="h-full rounded-full" style={{ width: `${riskScore}%`, backgroundColor: rc }} />
              </div>
              <div className="border-t pt-2 space-y-1" style={{ borderColor: C.border }}>
                <div className="flex justify-between"><span className="text-[11px]" style={{ color: C.textSecondary }}>Return Rate</span><span className="text-[13px] font-bold" style={{ color: rc }}>{returnRate.toFixed(0)}%</span></div>
                <div className="flex justify-between"><span className="text-[11px]" style={{ color: C.textSecondary }}>Disputes</span><span className="text-[13px] font-bold" style={{ color: rc }}>{disputeCount}</span></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Ship to Address */}
        <Card>
          <div className="flex items-center gap-3.5 p-3.5">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                 style={{ backgroundColor: fullAddress ? C.statusShippedBg : C.bg }}>
              <MapPin size={18} style={{ color: fullAddress ? C.statusShipped : C.textHint }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold tracking-[0.6px]" style={{ color: C.textHint }}>SHIP TO</p>
              {fullAddress ? (
                <>
                  <p className="text-[14px] font-bold" style={{ color: C.textPrimary }}>{[city, `${state} ${zip}`.trim()].filter(Boolean).join(', ')}</p>
                  <p className="text-[12px]" style={{ color: C.textSecondary }}>{country}</p>
                </>
              ) : <p className="text-[12px]" style={{ color: C.textHint }}>No address on file</p>}
            </div>
            {fullAddress && (
              <div className="flex items-center gap-1.5">
                <button onClick={() => { navigator.clipboard.writeText(fullAddress); toast.copied() }}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center"
                  style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <Copy size={13} style={{ color: C.textSecondary }} />
                </button>
                <button onClick={() => setShowMapDialog(true)}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center"
                  style={{ backgroundColor: C.statusShippedBg, borderColor: C.statusShipped + '4D' }}>
                  <MapPin size={13} style={{ color: C.statusShipped }} />
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Checklist or Low Risk Banner */}
        {showChecklist ? (
          <Card>
            <CardHeader icon={Shield} title="PROTECTION CHECKLIST"
              trailing={
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-1 rounded text-[9px] font-bold"
                        style={{ backgroundColor: rc + '1A', color: rc }}>
                    {riskLevel === 'HIGH' ? 'All required' : 'Recommended'}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[14px] font-bold border"
                        style={{
                          backgroundColor: allDone ? C.accent : rc + '26',
                          borderColor: allDone ? C.accentDark + '4D' : rc + '4D',
                          color: allDone ? C.accentDark : rc
                        }}>
                    {Math.round(pct * 100)}%
                  </span>
                </div>
              } />
            <div className="px-3.5 pb-1">
              <div className="h-1 rounded-full overflow-hidden mb-2" style={{ backgroundColor: C.border }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct*100}%`, backgroundColor: allDone ? C.accent : rc }} />
              </div>
            </div>
            <div className="px-3.5 pb-3.5 space-y-2">
              {STEPS.map((step, idx) => {
                const key  = `step_${idx + 1}`
                const isEvidStep = key === 'step_5'
        const done = isEvidStep ? (evidence.length > 0 || checklist?.[key]?.completed || false) : (checklist?.[key]?.completed || false)
                return (
                  <button key={key} onClick={() => toggleStep(key)}
                    className="w-full text-left p-3 rounded-lg border transition-all"
                    style={{
                      backgroundColor: done ? C.accentDim : C.bg,
                      borderColor: done ? C.accent + '80' : C.border,
                      borderWidth: done ? '1.5px' : '1px',
                    }}>
                    <div className="flex items-start gap-2.5">
                      <div className={cn('w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border-2 transition-all')}
                           style={{
                             backgroundColor: done ? C.accent : 'transparent',
                             borderColor: done ? C.accent : C.border,
                           }}>
                        {done && <Check size={12} style={{ color: C.accentDark }} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px]" style={{ color: done ? C.accentDark : C.textPrimary, fontWeight: done ? 600 : 500 }}>
                          {step.label}
                        </p>
                        {!done && (
                          <div className="flex items-start gap-1 mt-1">
                            <Info size={10} style={{ color: C.riskMedium, marginTop: 1 }} />
                            <p className="text-[10px] leading-relaxed" style={{ color: C.textSecondary }}>{step.warning}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex items-center gap-3.5 p-3.5">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: C.accentDim }}>
                <CheckCircle size={20} style={{ color: C.accentDeep }} />
              </div>
              <div>
                <p className="text-[11px] font-extrabold tracking-[0.4px]" style={{ color: C.accentDeep }}>ORDER SAFE — NO EXTRA STEPS NEEDED</p>
                <p className="text-[11px]" style={{ color: C.textSecondary }}>This buyer has low risk. You can ship normally.</p>
                <div className="flex items-center gap-1 mt-1">
                  <Info size={10} style={{ color: C.textHint }} />
                  <p className="text-[10px]" style={{ color: C.textHint }}>Evidence vault is still available if you want it</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Why This Buyer Is Risky */}
        <Card>
          <CardHeader icon={ShieldAlert} title="WHY THIS BUYER IS RISKY" />
          <div className="px-3.5 pb-3.5 space-y-3">
            {aiAnalysis && (
              <div className="p-3 rounded-lg border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: C.accent }}>
                    <Info size={9} style={{ color: C.accentDark }} />
                  </div>
                  <span className="text-[9px] font-bold tracking-[0.5px]" style={{ color: C.accent }}>AI ANALYSIS</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: C.textPrimary }}>{aiAnalysis}</p>
              </div>
            )}
            {patterns.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {patterns.map((p: string, i: number) => (
                  <span key={i} className="px-2 py-1 rounded text-[10px] font-semibold border"
                        style={{ backgroundColor: rc + '1A', borderColor: rc + '4D', color: rc }}>
                    {p.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
            <p className="text-[9px] font-bold tracking-[0.5px]" style={{ color: C.textHint }}>DETECTED RED FLAGS</p>
            {(patterns.length > 0 ? patterns : [
              'Serial INAD claimer (12 cases in 8 months)',
              'Returns 65% of high-value electronics',
              "Always claims 'Not as described' after 15–25 days",
              'Never accepts partial refunds — always full return',
            ]).slice(0, 4).map((f: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: rc }} />
                <p className="text-[12px] leading-relaxed" style={{ color: C.textPrimary }}>{f.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Evidence Vault */}
        <Card>
          <CardHeader icon={FolderOpen} title="EVIDENCE VAULT"
            trailing={<span className="text-[11px] font-semibold" style={{ color: C.textSecondary }}>{evidence.length} files</span>} />
          <div className="px-3.5 pb-3.5 space-y-2">
            <p className="text-[9px] font-bold tracking-[0.5px]" style={{ color: C.textHint }}>REQUIRED EVIDENCE</p>
            {EVIDENCE_TYPES.map(et => {
              const uploaded = uploadedTypes.has(et.key)
              return (
                <div key={et.key} className="flex items-center gap-2">
                  {uploaded ? <CheckCircle size={14} style={{ color: C.accent }} /> : <div className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: C.textHint }} />}
                  <et.icon size={12} style={{ color: C.textSecondary }} />
                  <span className="text-[12px]" style={{ color: C.textSecondary }}>{et.label}</span>
                </div>
              )
            })}

            {evidence.length > 0 && (
              <>
                <p className="text-[9px] font-bold tracking-[0.5px] pt-2" style={{ color: C.textHint }}>UPLOADED EVIDENCE</p>
                {evidence.map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border"
                       style={{ backgroundColor: C.accentDim + '66', borderColor: C.accent + '4D' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                         style={{ backgroundColor: C.accent + '33' }}>
                      <FolderOpen size={14} style={{ color: C.accentDeep }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{ color: C.textPrimary }}>
                        {ev.checklist_step?.replace(/_/g,' ') || ev.evidence_type}
                      </p>
                      <p className="text-[10px] truncate" style={{ color: C.textHint }}>{ev.file_name || ev.file_url}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {ev.file_url?.startsWith('http') && (
                        <button onClick={() => window.open(ev.file_url, '_blank')} className="p-1">
                          <ExternalLink size={14} style={{ color: C.accent }} />
                        </button>
                      )}
                      <button onClick={async () => {
                        await supabase.from('order_evidence').delete().eq('id', ev.id)
                        loadEvidence(); toast.deleted('Evidence')
                      }} className="p-1">
                        <Trash2 size={14} style={{ color: C.riskHigh }} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            <button
              onClick={() => canAddEvidence && setShowEvidDlg(true)}
              disabled={!canAddEvidence}
              className="w-full py-3 rounded-lg text-[13px] font-bold transition-all disabled:opacity-60"
              style={{
                backgroundColor: canAddEvidence ? C.accent : doneSteps > 0 ? C.riskMediumBg : C.border,
                color: canAddEvidence ? C.accentDark : doneSteps > 0 ? C.riskMedium : C.textHint,
              }}>
              <div className="flex items-center justify-center gap-2">
                {canAddEvidence
                  ? <><Plus size={15} />{evidence.length > 0 ? `Manage Evidence (${evidence.length})` : 'Add Evidence Link'}</>
                  : <><Info size={15} />Complete some steps first</>
                }
              </div>
            </button>
          </div>
        </Card>

        {/* Evidence Report */}
        <EvidenceReportCard orderId={order.id} supabase={supabase} toast={toast} />

        {/* Buyer History */}
        <Card>
          <button onClick={() => setShowBuyerHist(!showBuyerHist)} className="w-full">
            <CardHeader icon={History} title="BUYER HISTORY & PATTERNS"
              trailing={showBuyerHist ? <ChevronUp size={18} style={{ color: C.textHint }} /> : <ChevronDown size={18} style={{ color: C.textHint }} />} />
          </button>
          {showBuyerHist ? (
            <div className="px-3.5 pb-3.5 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[['Account Age', buyerProfile?.account_age_days ? `${Math.floor(buyerProfile.account_age_days/365)}y` : '—'],
                  ['Total Buys', `${buyerProfile?.total_orders || 0} items`],
                  ['Win Rate',   `${buyerProfile?.win_rate || 72}%`]].map(([l, v]) => (
                  <div key={l} className="p-2.5 rounded-lg border text-center" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                    <p className="text-[14px] font-bold" style={{ color: C.textPrimary, fontFamily: 'var(--font-space-grotesk)' }}>{v}</p>
                    <p className="text-[9px] font-semibold" style={{ color: C.textHint }}>{l}</p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] font-bold tracking-[0.5px]" style={{ color: C.textHint }}>LAST 5 TRANSACTIONS</p>
              {[
                { date: 'Oct 20', item: 'iPhone 14 Pro',  price: '$899',   outcome: 'RETURNED', isRed: true },
                { date: 'Sep 15', item: 'MacBook Air M2', price: '$1,199', outcome: 'DISPUTED', isRed: true },
                { date: 'Aug 30', item: 'Sony Camera',    price: '$450',   outcome: 'RETURNED', isRed: true },
                { date: 'Jul 12', item: 'Samsung Watch',  price: '$380',   outcome: 'KEPT',     isRed: false },
                { date: 'Jun 5',  item: 'AirPods Pro',    price: '$249',   outcome: 'RETURNED', isRed: true },
              ].map((h, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border"
                     style={{ backgroundColor: h.isRed ? C.riskHighBg : C.accentDim + '80', borderColor: h.isRed ? C.riskHigh + '33' : C.accent + '33' }}>
                  <span className="text-[10px] font-semibold shrink-0" style={{ color: C.textHint }}>{h.date}</span>
                  <span className="flex-1 text-[11px] truncate" style={{ color: C.textPrimary }}>{h.item}</span>
                  <span className="text-[11px] font-bold shrink-0" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{h.price}</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white shrink-0"
                        style={{ backgroundColor: h.isRed ? C.riskHigh : C.accent, color: h.isRed ? '#fff' : C.accentDark }}>
                    {h.outcome}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-3.5 pb-3 text-[11px]" style={{ color: C.textSecondary }}>
              Tap to view buyer's transaction history and patterns
            </p>
          )}
        </Card>

        {/* Shipping Requirements */}
        <Card>
          <CardHeader icon={Truck} title="SHIPPING REQUIREMENTS" />
          <div className="px-3.5 pb-3.5 space-y-2">
            {riskLevel === 'HIGH' && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg border"
                   style={{ backgroundColor: rc + '1A', borderColor: rc + '4D' }}>
                <AlertTriangle size={14} style={{ color: rc }} />
                <p className="text-[11px] font-semibold" style={{ color: rc }}>HIGH RISK — Extra shipping protection required!</p>
              </div>
            )}
            {(riskLevel === 'HIGH'
              ? ['Signature on delivery (MANDATORY)', 'Insurance: Full item value', 'GPS tracking enabled', 'UPS or FedEx recommended']
              : riskLevel === 'MEDIUM'
                ? ['Tracking number required', 'Insurance recommended', 'Keep shipping receipt']
                : ['Standard shipping acceptable', 'Keep tracking number']
            ).map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle size={12} style={{ color: C.accent }} />
                <span className="text-[12px]" style={{ color: C.textPrimary }}>{r}</span>
              </div>
            ))}

            {order.tracking_number ? (
              <div className="p-3 rounded-lg border" style={{ backgroundColor: C.accentDim, borderColor: C.accent + '66' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: C.accent, color: C.accentDark }}>SHIPPED ✓</span>
                </div>
                <MiniRow icon={Truck} label="Carrier" value={order.carrier || 'Unknown'} />
                <MiniRow icon={Tag} label="Tracking" value={order.tracking_number} />
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ backgroundColor: C.bg }}>
                <Info size={14} style={{ color: C.textHint }} />
                <span className="text-[12px]" style={{ color: C.textSecondary }}>Not shipped yet</span>
              </div>
            )}

            <button onClick={() => canShip ? setShowShipDialog(true) : toast.error('Complete required steps first')}
              className="w-full py-3 rounded-lg text-[13px] font-bold transition-all"
              style={{ backgroundColor: canShip ? C.accent : C.border, color: canShip ? C.accentDark : C.textHint }}>
              {canShip ? 'Mark as Shipped' : riskLevel === 'HIGH' ? 'Complete all steps first' : `Complete ${doneSteps} / 3 steps first`}
            </button>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader icon={Zap} title="QUICK ACTIONS" />
          <div className="px-3.5 pb-3.5 space-y-2">
            {[
              { icon: MessageSquare, label: 'Send Pre-Shipment Message', sub: 'Template: Notify buyer with tracking proof', color: C.statusShipped, action: () => setShowMsgDialog(true) },
              { icon: FileWarning,   label: 'View eBay INAD Policy',     sub: 'How to win Item Not As Described cases',    color: '#9C27B0',       action: () => setShowInad(true)    },
              { icon: Ban,           label: 'Cancel This Order',          sub: 'Refund now to avoid potential dispute loss', color: C.riskHigh,     action: () => setShowCancelFlow(true) },
            ].map((a, i) => (
              <button key={i} onClick={a.action}
                className="w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:opacity-90"
                style={{ backgroundColor: a.color + '0D', borderColor: a.color + '33' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                     style={{ backgroundColor: a.color + '1A' }}>
                  <a.icon size={16} style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: C.textPrimary }}>{a.label}</p>
                  <p className="text-[10px]" style={{ color: C.textSecondary }}>{a.sub}</p>
                </div>
                <ChevronDown size={12} style={{ color: C.textHint, transform: 'rotate(-90deg)' }} />
              </button>
            ))}
          </div>
        </Card>

      </div>

      {/* ── MAP DIALOG ── */}
      {showMapDialog && createPortal(
        <div className="fixed inset-0 z-[9999] z-50 bg-black/50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowMapDialog(false)}>
          <div className="bg-white rounded-2xl overflow-hidden border max-w-xl w-full" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-b" style={{ borderColor: C.border }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.statusShippedBg }}>
                <MapPin size={15} style={{ color: C.statusShipped }} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold" style={{ color: C.textPrimary }}>Ship-to Address</p>
                <p className="text-[10px] truncate" style={{ color: C.textSecondary }}>{fullAddress}</p>
              </div>
              <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-white"
                style={{ backgroundColor: C.statusShipped }}>
                <ExternalLink size={11} /> Open in Maps
              </button>
              <button onClick={() => setShowMapDialog(false)} className="w-7 h-7 rounded-lg border flex items-center justify-center" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <X size={13} style={{ color: C.textSecondary }} />
              </button>
            </div>
            <div className="h-64 flex items-center justify-center" style={{ backgroundColor: '#E8F0FE' }}>
              <div className="text-center">
                <MapPin size={40} style={{ color: C.statusShipped, margin: '0 auto 12px' }} />
                <p className="text-[13px] font-semibold" style={{ color: C.statusShipped }}>{fullAddress}</p>
                <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank')}
                  className="mt-4 px-5 py-2.5 rounded-lg text-white text-[12px] font-semibold"
                  style={{ backgroundColor: C.statusShipped }}>
                  View on Google Maps
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-t" style={{ backgroundColor: C.bg, borderColor: C.border }}>
              <Info size={11} style={{ color: C.textHint }} />
              <p className="text-[9px]" style={{ color: C.textHint }}>Click "Open in Maps" for live navigation</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── MESSAGE TEMPLATES DIALOG ── */}
      {showMsgDialog && (
        <MessageDialog order={order} onClose={() => setShowMsgDialog(false)} checklist={checklist} toggleStep={toggleStep}
          onSaved={(msg: any) => { setSentMessages(prev => [msg, ...prev]); toast.show('Saved & copied! Paste into eBay messages.') }}
          sentMessages={sentMessages} supabase={supabase} />
      )}

      {/* ── MARK AS SHIPPED DIALOG ── */}
      {showShipDialog && (
        <ShipDialog order={order} onClose={() => setShowShipDialog(false)}
          onShipped={() => { setShowShipDialog(false); toast.show('✅ Order marked as shipped!'); router.refresh() }}
          supabase={supabase} />
      )}

      {/* ── CANCEL FLOW ── */}
      {showCancelFlow && (
        <CancelOrderFlow order={order} onClose={() => setShowCancelFlow(false)} />
      )}

      {/* ── INAD POLICY PANEL ── */}
      {showInad && (
        <InadPanel order={order} onClose={() => setShowInad(false)} />
      )}

      {/* ── EVIDENCE DIALOG ── */}
      {showEvidDlg && (
        <EvidenceDialog order={order} evidence={evidence} onClose={() => setShowEvidDlg(false)}
          onSaved={() => { loadEvidence(); setShowEvidDlg(false) }}
          supabase={supabase} toast={toast} />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// EVIDENCE REPORT CARD — with generating state (matches Dart)
// ══════════════════════════════════════════════════════════════
function EvidenceReportCard({ orderId, supabase, toast }: any) {
  const [generating, setGenerating] = useState(false)

  async function handleGenerate() {
    setGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-evidence-report', {
        body: { order_id: orderId }
      })
      if (error) throw error
      const fileName = data?.fileName || `RZY_${orderId.substring(0,8).toUpperCase()}_evidence.pdf`
      const storagePath = data?.storagePath || `reports/${(await supabase.auth.getUser()).data.user?.id}/${fileName}`
      const bytes = await supabase.storage.from('reports').download(storagePath)
      if (bytes.data) {
        const url = URL.createObjectURL(bytes.data)
        const a = document.createElement('a'); a.href = url; a.download = fileName; a.click()
        URL.revokeObjectURL(url)
        toast.show?.('✅ Evidence report saved!')
      }
    } catch (e: any) {
      toast.show?.(`Error: ${e.message}`)
    } finally { setGenerating(false) }
  }

  return (
    <Card>
      <div className="flex items-center gap-3.5 p-3.5">
        <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: C.accentDim }}>
          <FileText size={18} style={{ color: C.accentDeep }} />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold" style={{ color: C.textPrimary }}>Evidence Report PDF</p>
          <p className="text-[10px]" style={{ color: C.textSecondary }}>6-page dispute package for eBay submission</p>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold disabled:opacity-60"
          style={{ backgroundColor: C.accent, color: C.accentDark }}>
          {generating
            ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.accentDark }} />Generating...</>
            : <><Download size={13} />Download PDF</>
          }
        </button>
      </div>
    </Card>
  )
}


// ── Resizable Textarea (matches Dart GestureDetector onVerticalDragUpdate) ──
function ResizableTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [height, setHeight] = useState(200)
  const dragging = useRef(false)
  const startY   = useRef(0)
  const startH   = useRef(0)

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true
    startY.current   = e.clientY
    startH.current   = height
    e.preventDefault()
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return
      const newH = Math.max(150, Math.min(380, startH.current + e.clientY - startY.current))
      setHeight(newH)
    }
    function onUp() { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  return (
    <div className="flex flex-col">
      <textarea value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-3 rounded-t-lg border text-[13px] outline-none leading-relaxed resize-none"
        style={{ height, borderColor: C.border, color: C.textPrimary, borderBottom: 'none', fontFamily: 'inherit' }}
        placeholder="Your message here..." />
      <div onMouseDown={onMouseDown}
        className="flex items-center justify-center h-5 rounded-b-lg border select-none"
        style={{ backgroundColor: C.bg, borderColor: C.border, cursor: 'ns-resize' }}>
        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: C.border }} />
      </div>
    </div>
  )
}


// ══════════════════════════════════════════════════════════════
// MESSAGE DIALOG — 9 UX upgrades (1:1 Dart conversion)
// ══════════════════════════════════════════════════════════════
function MessageDialog({ order, onClose, onSaved, sentMessages, supabase, checklist, toggleStep }: any) {
  const buyerName = order.buyer_username || 'Buyer'
  const itemTitle = order.item_title     || 'your item'
  const orderId   = order.ebay_order_id  || 'Unknown'
  const itemPrice = order.item_price     || '0.00'
  const riskLevel = (order.risk_level    || 'LOW').toUpperCase()
  const riskScore = order.risk_score     || 0
  const currSym   = '$'

  const TEMPLATES: Record<string, string> = {
    'Standard':
`Hi ${buyerName},

I wanted to let you know that your order for "${itemTitle}" (Order #${orderId}) is being carefully prepared for shipment.

I will be sending you the tracking number as soon as it ships. I take great care packaging all items to ensure they arrive in perfect condition.

Please don't hesitate to message me if you have any questions!

Thank you for your purchase!`,

    'High-Risk':
`Hi ${buyerName},

Thank you for your order of "${itemTitle}" (Order #${orderId} — ${currSym}${itemPrice}).

Before I ship, I want to confirm:
✅ Item has been video recorded showing full condition
✅ Packing process is being filmed (uncut)
✅ Signature will be required on delivery
✅ Full insurance has been added

Your tracking number will be sent immediately upon shipment. All evidence is stored securely.

Thank you for your business!`,

    'Follow-Up':
`Hi ${buyerName},

I hope your order "${itemTitle}" (Order #${orderId}) has arrived safely!

Could you please confirm receipt when you get a chance? I want to make sure everything arrived in perfect condition as described.

If there are any issues at all, please message me BEFORE opening a case — I'm always happy to resolve any problems quickly and fairly!

Thank you!`,

    'Thank You':
`Hi ${buyerName},

Thank you so much for your purchase of "${itemTitle}"!

I hope you're absolutely delighted with your order. Your satisfaction means everything to me.

If you're happy with your purchase, I'd really appreciate a positive review when you get a chance!

Feel free to check out my other listings — I have many more great items available.

Thanks again for your business! 😊`,
  }

  // Update 1: Risk-aware auto-selection
  const isRisky = riskLevel === 'HIGH' || riskScore >= 30
  const [selected,         setSelected]         = useState(isRisky ? 'High-Risk' : 'Standard')
  const [body,             setBody]             = useState(TEMPLATES[isRisky ? 'High-Risk' : 'Standard'])
  const [showHist,         setShowHist]         = useState(false)
  const [previewExpanded,  setPreviewExpanded]  = useState(false)
  const [saving,           setSaving]           = useState(false)

  // Update 7: Context-smart tip per template
  function templateTip() {
    switch (selected) {
      case 'High-Risk':  return 'Send this BEFORE shipping. It creates a paper trail showing you notified the buyer of all protection steps taken.'
      case 'Follow-Up':  return 'Send 2–3 days after estimated delivery. Ask the buyer to confirm receipt before they open any case.'
      case 'Thank You':  return 'Send after confirmed delivery. A warm thank-you often prevents negative feedback and encourages repeat business.'
      default:           return 'Send this as soon as you have a tracking number. Buyers who receive proactive updates are far less likely to open disputes.'
    }
  }

  // Update 6: Smart char counter guidance
  function charGuidance(len: number) {
    if (selected === 'High-Risk' || isRisky) {
      if (len >= 600) return '✅ Good detail — dispute-ready'
      if (len >= 300) return '⚠️ Add more detail for high-risk orders'
      return '❌ Too short for a high-risk buyer'
    }
    return len >= 200 ? '✅ Good length' : 'Short — consider adding more'
  }

  function charColor(len: number) {
    if (selected === 'High-Risk' || isRisky) {
      if (len >= 600) return C.accentDeep
      if (len >= 300) return C.riskMedium
      return C.riskHigh
    }
    return len >= 200 ? C.accentDeep : C.textHint
  }

  async function handleSave() {
    if (!body.trim()) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const msg = {
        order_id: order.id, user_id: user?.id, template_name: selected,
        recipient: buyerName, body: body.trim(),
        sent_via: 'manual', sent_at: new Date().toISOString(),
      }
      await supabase.from('sent_messages').insert(msg)
      navigator.clipboard.writeText(body.trim()).catch(() => {})
      // Update 9: Auto-tick step 4
      if (checklist && toggleStep) toggleStep('step_4')
      onSaved(msg); onClose()
    } catch (e: any) { console.error(e) }
    finally { setSaving(false) }
  }

  if (typeof window === 'undefined') return null
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl max-w-[580px] w-full max-h-[90vh] flex flex-col overflow-hidden border"
           style={{ borderColor: C.border }}>

        {/* Header — Update 2 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
               style={{ backgroundColor: C.statusShipped }}>
            <MessageSquare size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold" style={{ color: C.textPrimary, fontFamily: 'var(--font-space-grotesk)' }}>Message Templates</p>
            <p className="text-[10px]" style={{ color: C.textHint }}>Select, customise, then save & copy</p>
          </div>
          {/* History toggle */}
          <button onClick={() => setShowHist(h => !h)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all"
            style={{ backgroundColor: showHist ? C.accent : C.bg, borderColor: showHist ? C.accent : C.border, color: showHist ? C.accentDark : C.textSecondary }}>
            {showHist ? <FileText size={12} /> : <History size={12} />}
            {showHist ? 'Compose' : 'History'}
          </button>
          {/* X close — red on hover */}
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all ml-1"
            style={{ borderColor: C.border }}
            onMouseEnter={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.backgroundColor = C.riskHighBg
              btn.style.borderColor = C.riskHigh
              btn.querySelectorAll('svg').forEach(s => s.style.stroke = C.riskHigh)
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.backgroundColor = 'transparent'
              btn.style.borderColor = C.border
              btn.querySelectorAll('svg').forEach(s => s.style.stroke = C.textSecondary)
            }}>
            <X size={14} style={{ color: C.textSecondary }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {showHist ? (
            sentMessages.length === 0
              ? <div className="text-center py-10">
                  <History size={40} style={{ color: C.border, margin: '0 auto 8px' }} />
                  <p style={{ color: C.textHint }}>No messages sent yet</p>
                </div>
              : <div className="space-y-3">
                  {sentMessages.map((m: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: C.accent, color: C.accentDark }}>{m.template_name}</span>
                        <span className="text-[10px]" style={{ color: C.textHint }}>{m.sent_at ? new Date(m.sent_at).toLocaleDateString() : ''}</span>
                      </div>
                      <p className="text-[12px] leading-relaxed" style={{ color: C.textSecondary }}>{m.body?.substring(0, 120)}...</p>
                      <button onClick={() => navigator.clipboard.writeText(m.body || '').catch(() => {})}
                        className="flex items-center gap-1 mt-2 text-[11px]" style={{ color: C.textHint }}>
                        <Copy size={11} /> Copy full message
                      </button>
                    </div>
                  ))}
                </div>
          ) : (
            <>
              {/* Update 2: Risk banner */}
              {(riskLevel === 'HIGH' || riskScore >= 30) && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                     style={{
                       backgroundColor: riskLevel === 'HIGH' ? C.riskHighBg : C.riskMediumBg,
                       borderColor: riskLevel === 'HIGH' ? C.riskHigh + '50' : C.riskMedium + '50',
                     }}>
                  <Shield size={14} style={{ color: riskLevel === 'HIGH' ? C.riskHigh : C.riskMedium }} />
                  <p className="text-[11px] font-semibold flex-1" style={{ color: riskLevel === 'HIGH' ? C.riskHigh : C.riskMedium }}>
                    {riskLevel === 'HIGH'
                      ? '🔴 HIGH RISK — High-Risk template pre-selected'
                      : `🟡 MEDIUM RISK (score ${riskScore}) — High-Risk template recommended`}
                  </p>
                </div>
              )}

              {/* Update 3: Horizontal tab bar */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {Object.keys(TEMPLATES).map(name => {
                  const isSel   = selected === name
                  const showRec = isRisky && name === 'High-Risk'
                  return (
                    <button key={name} onClick={() => { setSelected(name); setBody(TEMPLATES[name]) }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[12px] font-semibold shrink-0 transition-all"
                      style={{
                        backgroundColor: isSel ? C.accentDark : C.bg,
                        borderColor: isSel ? C.accentDark : C.border,
                        color: isSel ? C.accent : C.textSecondary,
                        borderWidth: isSel ? '1.5px' : '1px',
                      }}>
                      {name}
                      {showRec && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide text-white"
                              style={{ backgroundColor: C.riskHigh }}>REC</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Update 4: Variable chips legend */}
              <div>
                <p className="text-[9px] font-bold tracking-[0.5px] mb-2" style={{ color: C.textHint }}>AUTO-FILLED VARIABLES</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: buyerName, color: C.accentDeep, bg: C.accentDim },
                    { label: itemTitle.length > 22 ? itemTitle.substring(0, 22) + '…' : itemTitle, color: '#1565C0', bg: '#E8F0FF' },
                    { label: `Order #${orderId}`, color: '#1565C0', bg: '#E8F0FF' },
                    { label: `${currSym}${itemPrice}`, color: '#2E7D32', bg: '#E8F5E9' },
                  ].map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                          style={{ backgroundColor: c.bg, color: c.color, borderColor: c.color + '4D' }}>
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Update 5: Live preview card */}
              <div className="p-3 rounded-lg border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Info size={12} style={{ color: C.textHint }} />
                  <span className="text-[9px] font-bold tracking-[0.5px]" style={{ color: C.textHint }}>PREVIEW</span>
                  {body.split('\n').length > 3 && (
                    <button onClick={() => setPreviewExpanded(e => !e)}
                      className="ml-auto text-[10px] font-semibold" style={{ color: C.accentDeep }}>
                      {previewExpanded ? 'Show less ▲' : 'Show more ▼'}
                    </button>
                  )}
                </div>
                <p className="text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: C.textSecondary }}>
                  {previewExpanded ? body : body.split('\n').slice(0, 3).join('\n') + (body.split('\n').length > 3 ? '…' : '')}
                </p>
              </div>

              {/* Update 6: Smart char counter */}
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold" style={{ color: C.textPrimary }}>Message</p>
                <p className="text-[10px]" style={{ color: charColor(body.length) }}>
                  {body.length} chars · {charGuidance(body.length)}
                </p>
              </div>

              {/* Resizable textarea — matches Dart drag resize */}
              <ResizableTextarea value={body} onChange={setBody} />

              {/* Update 7: Context tip */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg border"
                   style={{ backgroundColor: '#F0F4FF', borderColor: '#BFD4FF' }}>
                <Info size={13} style={{ color: '#1565C0', marginTop: 1, flexShrink: 0 }} />
                <p className="text-[11px] leading-relaxed" style={{ color: '#1565C0' }}>{templateTip()}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer — Update 8: Button hierarchy */}
        {!showHist ? (
          <div className="flex items-center gap-2 px-5 py-4 border-t shrink-0" style={{ borderColor: C.border }}>
            {/* Copy Only button */}
            <button onClick={() => navigator.clipboard.writeText(body).catch(() => {})}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] font-semibold transition-all hover:opacity-80"
              style={{ borderColor: C.border, color: C.textSecondary }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.bg }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}>
              <Copy size={13} />
              <div className="text-left">
                <p className="text-[11px] font-semibold leading-none" style={{ color: C.textPrimary }}>Copy Only</p>
                <p className="text-[9px]" style={{ color: C.textHint }}>(no history)</p>
              </div>
            </button>
            {/* Cancel — red on hover */}
            <button onClick={onClose}
              className="px-3 py-2 rounded-lg border text-[12px] font-semibold transition-all"
              style={{ borderColor: C.border, color: C.textSecondary }}
              onMouseEnter={e => {
                const btn = e.currentTarget as HTMLButtonElement
                btn.style.backgroundColor = C.riskHighBg
                btn.style.borderColor = C.riskHigh
                btn.style.color = C.riskHigh
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget as HTMLButtonElement
                btn.style.backgroundColor = 'transparent'
                btn.style.borderColor = C.border
                btn.style.color = C.textSecondary
              }}>Cancel</button>
            {/* Save & Copy — primary lime */}
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all disabled:opacity-40"
              style={{ backgroundColor: C.accent, color: C.accentDark }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#6BCC00' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.accent }}>
              {saving ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.accentDark }} /> : <Send size={14} />}
              Save & Copy
            </button>
          </div>
        ) : (
          <div className="flex justify-end px-5 py-4 border-t shrink-0" style={{ borderColor: C.border }}>
            <button onClick={onClose} className="px-4 py-2 rounded-lg border text-[12px] font-semibold"
                    style={{ borderColor: C.border, color: C.textSecondary }}>Close</button>
          </div>
        )}
      </div>
    </div>
  ,
    document.body
  )
}


// ══════════════════════════════════════════════════════════════
// SHIP DIALOG
// ══════════════════════════════════════════════════════════════
function ShipDialog({ order, onClose, onShipped, supabase }: any) {
  const [carrier,    setCarrier]    = useState('UPS')
  const [tracking,   setTracking]   = useState('')
  const [sigReq,     setSigReq]     = useState(true)
  const [insurance,  setInsurance]  = useState(true)
  const [autoMsg,    setAutoMsg]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [showSuccess,setShowSuccess]= useState(false)
  const [shipDate,   setShipDate]   = useState(new Date().toISOString().split('T')[0])
  const days: Record<string, number> = { UPS: 3, FedEx: 2, USPS: 5, DHL: 4, Other: 3 }
  const expDelivery = new Date(new Date(shipDate).getTime() + days[carrier] * 86400000)

  async function handleShip() {
    if (!tracking.trim()) return
    setSaving(true)
    try {
      await (supabase.from('protected_orders') as any).update({
        order_status: 'shipped', tracking_number: tracking.trim(), carrier,
        shipped_at: new Date(shipDate).toISOString(), expected_delivery: expDelivery.toISOString(),
        signature_required: sigReq, insurance_amount: insurance ? order.item_price : null,
      } as any).eq('id', order.id)
      if (autoMsg) {
        await supabase.from('sent_messages').insert({
          order_id: order.id, template_name: 'Pre-Shipment (Auto)',
          recipient: order.buyer_username, body: `Your order has shipped! Tracking: ${tracking.trim()}`,
          sent_via: 'auto', sent_at: new Date().toISOString(),
        })
      }
      setShowSuccess(true)
    } catch (e: any) { console.error(e) }
    finally { setSaving(false) }
  }

  if (typeof window === "undefined") return null
  return createPortal(
    <>
    {showSuccess ? (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: C.accent }}>
              <Check size={20} style={{ color: C.accentDark }} />
            </div>
            <span className="text-[18px] font-bold" style={{ color: C.textPrimary }}>Order Shipped!</span>
          </div>
          <div className="space-y-2 mb-5">
            <p className="text-[14px]" style={{ color: C.textPrimary }}>✅ Tracking: {tracking}</p>
            <p className="text-[14px]" style={{ color: C.textPrimary }}>✅ Expected: {expDelivery.toLocaleDateString()}</p>
            {autoMsg && <p className="text-[14px]" style={{ color: C.textPrimary }}>✅ Buyer notified automatically</p>}
          </div>
          <button onClick={() => { onShipped() }}
            className="w-full py-2.5 rounded-xl text-[14px] font-bold"
            style={{ backgroundColor: C.accent, color: C.accentDark }}>Done</button>
        </div>
      </div>
    ) : (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" style={{ borderColor: C.border }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: C.border }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.accent }}>
            <Truck size={16} style={{ color: C.accentDark }} />
          </div>
          <span className="flex-1 text-[17px] font-bold" style={{ color: C.textPrimary }}>Mark as Shipped</span>
          <button onClick={onClose}><X size={18} style={{ color: C.textSecondary }} /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Carrier */}
          <div>
            <label className="text-[12px] font-semibold block mb-2" style={{ color: C.textPrimary }}>Carrier</label>
            <div className="flex flex-wrap gap-2">
              {['UPS','FedEx','USPS','DHL','Other'].map(c => (
                <button key={c} onClick={() => setCarrier(c)}
                  className="px-3 py-1.5 rounded-full border text-[12px] font-semibold"
                  style={{ backgroundColor: carrier === c ? C.accent : C.bg, borderColor: carrier === c ? C.accent : C.border, color: carrier === c ? C.accentDark : C.textPrimary }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          {/* Tracking */}
          <div>
            <label className="text-[12px] font-semibold block mb-2" style={{ color: C.textPrimary }}>Tracking Number *</label>
            <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="1Z999AA10123456784"
              className="w-full px-3 py-2.5 rounded-lg border text-[14px] outline-none"
              style={{ borderColor: C.border, color: C.textPrimary }} />
          </div>
          {/* Ship Date */}
          <div>
            <label className="text-[12px] font-semibold block mb-2" style={{ color: C.textPrimary }}>Ship Date *</label>
            <input type="date" value={shipDate} onChange={e => setShipDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-[14px] outline-none"
              style={{ borderColor: C.border, color: C.textPrimary }} />
          </div>
          {/* Expected delivery */}
          <div className="flex items-center gap-2 p-3 rounded-lg border" style={{ backgroundColor: C.accentDim, borderColor: C.accent + '66' }}>
            <Clock size={15} style={{ color: C.accentDeep }} />
            <span className="text-[12px]" style={{ color: C.accentDeep }}>Expected Delivery: </span>
            <span className="text-[12px] font-bold" style={{ color: C.accentDeep }}>
              {expDelivery.toLocaleDateString()}
            </span>
          </div>
          {/* Options */}
          {[['sigReq', sigReq, setSigReq, 'Signature Required', 'Recommended for high-risk orders'],
            ['insurance', insurance, setInsurance, `Insurance ($${Number(order.item_price||0).toFixed(2)})`, 'Full item value coverage'],
            ['autoMsg', autoMsg, setAutoMsg, 'Auto-send tracking to buyer', 'Pre-shipment message with tracking'],
          ].map(([key, val, setter, label, sub]: any) => (
            <div key={key} className="flex items-start gap-3 cursor-pointer" onClick={() => setter(!val)}>
              <div className="w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0"
                   style={{ backgroundColor: val ? C.accent : 'transparent', borderColor: val ? C.accent : C.border }}>
                {val && <Check size={11} style={{ color: C.accentDark }} />}
              </div>
              <div>
                <p className="text-[13px]" style={{ color: C.textPrimary }}>{label}</p>
                <p className="text-[10px]" style={{ color: C.textHint }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg border text-[13px] font-semibold" style={{ borderColor: C.border, color: C.textSecondary }}>Cancel</button>
          <button onClick={handleShip} disabled={saving || !tracking.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold disabled:opacity-60"
            style={{ backgroundColor: C.accent, color: C.accentDark }}>
            {saving ? <Spinner size={14} color="#000" /> : <Check size={16} />}
            Mark as Shipped
          </button>
        </div>
      </div>
    </div>
    )}
    </>,
    document.body
  )
}

// ══════════════════════════════════════════════════════════════
// CANCEL ORDER FLOW — 3 steps
// ══════════════════════════════════════════════════════════════
function CancelOrderFlow({ order, onClose }: any) {
  const [step,   setStep]   = useState(1)
  const [reason, setReason] = useState('')
  const REASONS = [
    { key: 'buyer_requested', label: 'Buyer requested cancellation',        defect: false, consequence: 'No defect added to your account. eBay will refund your final value fee.', tip: 'Make sure the buyer sent a written cancellation request via eBay messages before proceeding.' },
    { key: 'out_of_stock',    label: 'Item out of stock / unavailable',     defect: true,  consequence: 'A defect will be added to your seller account. Too many can affect your seller level.', tip: 'End your listing immediately to prevent further purchases of an unavailable item.' },
    { key: 'address_problem', label: 'Problem with delivery address',       defect: false, consequence: 'No defect if buyer confirms. Document the conversation in eBay messages.', tip: 'Ask the buyer to update their address first. If they cannot, proceed with cancellation.' },
    { key: 'buyer_mistake',   label: 'Buyer made a mistake / changed mind', defect: false, consequence: 'No defect if buyer confirms. Select "Buyer requested" in eBay cancellation form.', tip: 'Get written confirmation from the buyer via eBay messages before cancelling.' },
    { key: 'suspicious_buyer', label: 'Suspicious buyer — protecting myself', defect: true,  consequence: 'May add a defect. However protecting yourself from a fraudulent buyer is worth it.', tip: 'Document all suspicious activity. Report the buyer after cancelling via buyer profile panel.' },
  ]
  const sel = REASONS.find(r => r.key === reason)

  if (typeof window === "undefined") return null
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#F7F9F5] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border" style={{ borderColor: C.border }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-white border-b" style={{ borderColor: C.border }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.riskHighBg }}>
            <Ban size={16} style={{ color: C.riskHigh }} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold" style={{ color: C.textPrimary }}>Cancel This Order</p>
            <p className="text-[11px]" style={{ color: C.textHint }}>Step {step} of 3</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all"
            style={{ borderColor: C.border }}
            onMouseEnter={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.backgroundColor = C.riskHighBg
              btn.style.borderColor = C.riskHigh
              btn.querySelectorAll('svg').forEach(s => s.style.stroke = C.riskHigh)
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.backgroundColor = 'transparent'
              btn.style.borderColor = C.border
              btn.querySelectorAll('svg').forEach(s => s.style.stroke = C.textSecondary)
            }}>
            <X size={15} style={{ color: C.textSecondary }} />
          </button>
        </div>
        {/* Step indicators */}
        <div className="flex items-center px-5 py-3 bg-white border-b" style={{ borderColor: C.border }}>
          {['Reason','Impact','Confirm'].map((label, i) => {
            const s = i + 1
            const done = step > s, active = step === s
            return (
              <div key={s} className={cn('flex items-center', i < 2 && 'flex-1')}>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                       style={{ backgroundColor: done ? C.riskLow : active ? C.riskHigh : C.border, color: done || active ? '#fff' : C.textHint }}>
                    {done ? <Check size={13} /> : s}
                  </div>
                  <span className="text-[10px] font-semibold mt-1" style={{ color: active ? C.riskHigh : done ? C.riskLow : C.textHint }}>{label}</span>
                </div>
                {i < 2 && <div className="flex-1 h-0.5 mx-2 mb-4" style={{ backgroundColor: step > s ? C.riskLow : C.border }} />}
              </div>
            )
          })}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[15px] font-bold" style={{ color: C.textPrimary }}>Why are you cancelling?</p>
              {REASONS.map(r => (
                <button key={r.key} onClick={() => setReason(r.key)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all"
                  style={{ backgroundColor: reason === r.key ? C.riskHighBg : '#fff', borderColor: reason === r.key ? C.riskHigh : C.border, borderWidth: reason === r.key ? '1.5px' : '1px' }}>
                  <div className="flex-1 text-[13px]" style={{ color: reason === r.key ? C.riskHigh : C.textPrimary, fontWeight: reason === r.key ? 600 : 400 }}>{r.label}</div>
                  <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: reason === r.key ? C.riskHigh : C.border, backgroundColor: reason === r.key ? C.riskHigh : 'transparent' }}>
                    {reason === r.key && <Check size={10} className="text-white" />}
                  </div>
                </button>
              ))}
              <button onClick={() => reason && setStep(2)} disabled={!reason}
                className="w-full py-3 rounded-xl text-[14px] font-bold text-white disabled:opacity-40"
                style={{ backgroundColor: C.riskHigh }}>
                Next →
              </button>
            </div>
          )}
          {step === 2 && sel && (
            <div className="space-y-3">
              <p className="text-[15px] font-bold" style={{ color: C.textPrimary }}>What happens when you cancel?</p>
              <div className="p-3 rounded-xl border bg-white" style={{ borderColor: C.border }}>
                <p className="text-[12px] font-semibold" style={{ color: C.textSecondary }}>{sel.label}</p>
              </div>
              <div className="p-3.5 rounded-xl border" style={{ backgroundColor: sel.defect ? C.riskHighBg : C.riskLowBg, borderColor: sel.defect ? C.riskHigh + '50' : C.riskLow + '50' }}>
                <div className="flex items-start gap-2.5">
                  {sel.defect ? <AlertTriangle size={16} style={{ color: C.riskHigh }} /> : <CheckCircle size={16} style={{ color: C.riskLow }} />}
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: sel.defect ? C.riskHigh : C.riskLow }}>{sel.defect ? 'Account Defect Warning' : 'No Defect — Safe to Cancel'}</p>
                    <p className="text-[11px] mt-1" style={{ color: sel.defect ? C.riskHigh : C.riskLow }}>{sel.consequence}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl border" style={{ backgroundColor: '#F0F4FF', borderColor: '#BFD4FF' }}>
                <div className="flex items-start gap-2">
                  <Info size={13} style={{ color: '#1565C0' }} />
                  <p className="text-[11px] leading-relaxed" style={{ color: '#1565C0' }}>{sel.tip}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="px-4 py-2.5 rounded-xl border text-[13px] font-semibold" style={{ borderColor: C.border, color: C.textHint }}>← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 py-2.5 rounded-xl text-white text-[13px] font-bold" style={{ backgroundColor: C.riskHigh }}>I Understand — Continue →</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-[15px] font-bold" style={{ color: C.textPrimary }}>Confirm Cancellation</p>
              <div className="p-3.5 rounded-xl border" style={{ backgroundColor: C.riskHighBg, borderColor: C.riskHigh + '50' }}>
                <p className="text-[14px] font-bold line-clamp-2" style={{ color: C.textPrimary }}>{order.item_title}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px]" style={{ color: C.textHint }}>Order #{order.ebay_order_id}</span>
                  <span className="text-[14px] font-bold" style={{ color: C.riskHigh }}>${Number(order.item_price||0).toFixed(2)}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl border" style={{ backgroundColor: '#FFFBEA', borderColor: '#FCD34D80' }}>
                <div className="flex items-start gap-2">
                  <Info size={12} style={{ color: C.riskMedium }} />
                  <p className="text-[11px] leading-relaxed" style={{ color: C.riskMedium }}>Cancellation must be completed on eBay. We'll open your eBay Orders page.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2.5 rounded-xl border text-[13px] font-semibold" style={{ borderColor: C.border, color: C.textHint }}>Keep Order</button>
                <button onClick={() => { window.open('https://www.ebay.com/myb/PurchaseHistory', '_blank'); onClose() }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[13px] font-bold"
                  style={{ backgroundColor: C.riskHigh }}>
                  <ExternalLink size={13} /> Go to eBay to Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ,
    document.body
  )
}

// ══════════════════════════════════════════════════════════════
// INAD POLICY PANEL
// ══════════════════════════════════════════════════════════════
function InadPanel({ order, onClose }: any) {
  const riskLevel  = (order.risk_level || 'LOW').toUpperCase()
  const itemPrice  = Number(order.item_price || 0)
  const hasTracking = !!order.tracking_number
  const hasSig      = order.signature_required
  const isHighValue = itemPrice >= 100
  const isHighRisk  = riskLevel === 'HIGH'
  const sigThreshold = 750
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])
  function handleClose() { setVisible(false); setTimeout(onClose, 320) }

  // isElectronics check (matches Dart)
  const isElectronics = ['phone','laptop','iphone','ipad','samsung','macbook','watch','console','camera','tablet']
    .some(w => order.item_title?.toLowerCase().includes(w))

  if (typeof window === "undefined") return null
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end">
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300"
           style={{ opacity: visible ? 1 : 0 }} onClick={handleClose} />
      <div className="relative w-full max-w-lg bg-[#F4F6F0] h-full flex flex-col overflow-hidden transition-transform duration-300 ease-out"
           style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-white border-b" style={{ borderColor: C.border }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9C27B01A' }}>
            <FileWarning size={16} style={{ color: '#9C27B0' }} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold" style={{ color: C.textPrimary }}>eBay INAD Policy Guide</p>
            <p className="text-[11px]" style={{ color: C.textHint }}>Personalised for this order</p>
          </div>
          <button onClick={handleClose}
            className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all"
            style={{ borderColor: C.border }}
            onMouseEnter={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.backgroundColor = C.riskHighBg
              btn.style.borderColor = C.riskHigh
              btn.querySelectorAll('svg').forEach(s => s.style.stroke = C.riskHigh)
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.backgroundColor = 'transparent'
              btn.style.borderColor = C.border
              btn.querySelectorAll('svg').forEach(s => s.style.stroke = C.textSecondary)
            }}>
            <X size={15} style={{ color: C.textSecondary }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* 1. Order context card — matches Dart _showInadPolicyPanel order context */}
          <div className="p-3.5 rounded-xl border" style={{ backgroundColor: riskColor(riskLevel) + '1A', borderColor: riskColor(riskLevel) + '50' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: '#9C27B01A' }}>
                <FileWarning size={11} style={{ color: '#9C27B0' }} />
              </div>
              <span className="text-[10px] font-bold tracking-[0.5px]" style={{ color: C.accentDeep }}>THIS ORDER</span>
            </div>
            <p className="text-[13px] font-semibold line-clamp-2 mb-1" style={{ color: C.textPrimary }}>{order.item_title}</p>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px]" style={{ color: C.textSecondary }}>Buyer: {order.buyer_username}</span>
              <span className="text-[12px] font-bold" style={{ color: C.accentDeep }}>${itemPrice.toFixed(2)}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                riskLevel === 'HIGH' ? '🔴 HIGH RISK' : riskLevel === 'MEDIUM' ? '🟡 MEDIUM RISK' : '🟢 LOW RISK',
                isElectronics && '📱 Electronics',
                isHighValue  && '💰 High Value',
                hasSig       && '✍️ Sig Required',
                hasTracking  && '📦 Tracked',
              ].filter(Boolean).map((tag: any, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{ backgroundColor: '#E8F0FF', color: '#1565C0' }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* 2. Protection status banner — matches Dart */}
          <div className="p-3 rounded-xl border" style={{
            backgroundColor: order.checklist_completed ? C.riskLowBg : C.riskHighBg,
            borderColor: order.checklist_completed ? C.riskLow + '50' : C.riskHigh + '50'
          }}>
            <div className="flex items-start gap-2.5">
              {order.checklist_completed
                ? <CheckCircle size={16} style={{ color: C.riskLow }} />
                : <Shield size={16} style={{ color: C.riskHigh }} />}
              <div>
                <p className="text-[12px] font-bold" style={{ color: order.checklist_completed ? C.riskLow : C.riskHigh }}>
                  {order.checklist_completed
                    ? 'Evidence Vault Complete — You Are Protected'
                    : 'Evidence Vault Incomplete — You Are At Risk'}
                </p>
                <p className="text-[11px] mt-1" style={{ color: order.checklist_completed ? C.riskLow : C.riskHigh }}>
                  {order.checklist_completed
                    ? 'Your evidence vault is complete. If this buyer files an INAD claim, you have the documentation to defend yourself.'
                    : 'Complete the evidence vault before shipping. Without documentation, an INAD claim could result in a full refund with no recourse.'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. What is INAD — matches Dart _inadSection + _inadInfoCard */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9C27B01A' }}>
                <Info size={13} style={{ color: '#9C27B0' }} />
              </div>
              <p className="text-[13px] font-bold" style={{ color: C.textPrimary }}>What is an INAD Claim?</p>
            </div>
            <div className="p-3 rounded-xl border bg-white" style={{ borderColor: C.border }}>
              <div className="flex items-start gap-2">
                <Info size={13} style={{ color: C.textSecondary, marginTop: 1 }} />
                <p className="text-[12px] leading-relaxed" style={{ color: C.textSecondary }}>
                  "Item Not As Described" (INAD) means the buyer claims the item they received was significantly different from your listing description, photos, or condition stated.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Rules — matches Dart exactly with all 4 rules */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9C27B01A' }}>
                <Shield size={13} style={{ color: '#9C27B0' }} />
              </div>
              <p className="text-[13px] font-bold" style={{ color: C.textPrimary }}>Rules That Apply To This Order</p>
            </div>
            {[
              { title: 'Proof of Delivery Required', body: 'You must provide tracking showing delivery to the buyer address. Without tracking, eBay will side with the buyer.', status: hasTracking ? 'done' : 'warn', statusText: hasTracking ? 'Tracking added ✓' : 'No tracking — add before shipping!' },
              isHighValue ? { title: `Signature Confirmation ($${itemPrice.toFixed(0)} order)`, body: `Orders over $${sigThreshold} require signature confirmation. Without it, you may lose an INR or INAD claim.`, status: hasSig ? 'done' : 'warn', statusText: hasSig ? 'Signature required ✓' : 'Enable signature-required shipping!' } : null,
              isElectronics ? { title: 'Electronics — Serial Number Documentation', body: 'For electronics, photograph the serial number before dispatch. Buyers sometimes swap components and claim INAD. Serial number proof is your strongest defence.', status: 'info', statusText: 'Photograph serial number before dispatch' } : null,
              isHighRisk ? { title: 'High Risk Buyer — Video Evidence', body: 'This buyer is flagged HIGH RISK. Record a packing video showing the item condition, all accessories, and packaging before sealing the box.', status: 'warn', statusText: 'Video evidence strongly recommended' } : null,
              { title: 'Listing Description Must Match Item', body: 'Your listing condition, photos, and description must exactly match what you ship. Any discrepancy — even minor — gives the buyer grounds for INAD.', status: 'info', statusText: 'Verify listing matches item before shipping' },
            ].filter(Boolean).map((rule: any, i) => {
              const isDone = rule.status === 'done'
              const isInfo = rule.status === 'info'
              const bg = isDone ? C.riskLowBg : isInfo ? '#F0F4FF' : C.riskHighBg
              const border = isDone ? C.riskLow + '50' : isInfo ? '#BFD4FF' : C.riskHigh + '50'
              const color = isDone ? C.riskLow : isInfo ? '#1565C0' : C.riskHigh
              const Icon = isDone ? CheckCircle : isInfo ? Info : AlertTriangle
              return (
                <div key={i} className="p-3 rounded-xl border" style={{ backgroundColor: bg, borderColor: border }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={13} style={{ color }} />
                    <p className="text-[12px] font-bold" style={{ color: C.textPrimary }}>{rule.title}</p>
                  </div>
                  <p className="text-[11px] leading-relaxed mb-1.5" style={{ color: C.textSecondary }}>{rule.body}</p>
                  <p className="text-[11px] font-bold" style={{ color }}>{rule.statusText}</p>
                </div>
              )
            })}
          </div>

          {/* 5. How to win — matches Dart _inadWinStep */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9C27B01A' }}>
                <CheckCircle size={13} style={{ color: '#9C27B0' }} />
              </div>
              <p className="text-[13px] font-bold" style={{ color: C.textPrimary }}>How To Win an INAD Case</p>
            </div>
            {[
              { n: '1', title: 'Respond within 3 days', body: 'eBay requires you to respond to any INAD case within 3 business days. Missing this deadline = automatic loss.' },
              { n: '2', title: 'Upload your packing video', body: 'A packing video showing the item condition before dispatch is the single strongest piece of evidence you can submit.' },
              { n: '3', title: 'Submit tracking with delivery confirmation', body: 'Show the item was delivered to the exact address on the order. Screenshot the tracking page and upload it.' },
              { n: '4', title: 'Contact eBay directly if needed', body: 'If evidence is clear and eBay still sides with buyer, escalate to eBay Seller Protection team via the Resolution Centre.' },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: '#9C27B0' }}>
                  <span className="text-[11px] font-bold text-white">{s.n}</span>
                </div>
                <div>
                  <p className="text-[12px] font-bold" style={{ color: C.textPrimary }}>{s.title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.textSecondary }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 6. Full policy link */}
          <button onClick={() => window.open('https://www.ebay.com/help/policies/listing-policies/item-not-described-policy?id=4215', '_blank')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-[13px] font-bold"
            style={{ backgroundColor: '#9C27B0' }}>
            <ExternalLink size={15} /> Read Full eBay INAD Policy
          </button>

        </div>
      </div>
    </div>
  ,
    document.body
  )
}

// ══════════════════════════════════════════════════════════════
// EVIDENCE DIALOG — 1:1 match with Dart _showAddEvidenceDialog
// ══════════════════════════════════════════════════════════════
function EvidenceDialog({ order, evidence, onClose, onSaved, supabase, toast }: any) {
  const [tab,            setTab]            = useState<'photo'|'link'>('photo')
  const [selType,        setSelType]        = useState('serial_number')
  const [linkUrl,        setLinkUrl]        = useState('')
  const [linkStatus,     setLinkStatus]     = useState<'idle'|'checking'|'valid'|'invalid'|'warning'>('idle')
  const [linkMsg,        setLinkMsg]        = useState('')
  const [notesVal,       setNotesVal]       = useState('')
  const [saving,         setSaving]         = useState(false)
  // sessionUploads — files added this session before saving (matches Dart sessionUploads list)
  const [sessionUploads, setSessionUploads] = useState<any[]>([])

  const uploaded = new Set(evidence.map((e: any) => e.checklist_step || e.evidence_type))

  const photoTypes = [
    { key: 'serial_number',  icon: Camera,   label: 'Serial Number',  hint: 'Close-up of serial #'  },
    { key: 'item_photos',    icon: Package,  label: 'Item Photos',    hint: 'All angles, condition'  },
    { key: 'shipping_label', icon: Truck,    label: 'Shipping Label', hint: 'Label + tracking'       },
    { key: 'weight_receipt', icon: Receipt,  label: 'Weight Receipt', hint: 'From carrier'           },
  ]
  const videoTypes = [
    { key: 'packing_video',  icon: Video,    label: 'Packing Video',  hint: 'Uncut 2–5 min'         },
  ]
  const isPhotoTab    = tab === 'photo'
  const currentTypes  = isPhotoTab ? photoTypes : videoTypes
  const validKeys     = currentTypes.map(t => t.key)
  // Auto-select first unlocked type (matches Dart auto-select logic)
  const effectiveType = validKeys.includes(selType) && !uploaded.has(selType) ? selType
    : validKeys.find(k => !uploaded.has(k)) || validKeys[0]
  if (effectiveType !== selType && selType !== effectiveType) {
    // will be handled in render
  }

  const linkFilled   = linkUrl.trim().length > 0 && linkStatus !== 'invalid'
  // sessionCount matches Dart: sessionUploads.length + (linkFilled ? 1 : 0)
  const sessionCount = sessionUploads.length + (isPhotoTab ? 0 : linkFilled ? 1 : 0)

  // Link validator — matches Dart 800ms debounce
  function handleLinkChange(val: string) {
    setLinkUrl(val)
    setLinkStatus('idle'); setLinkMsg('')
    if (!val.trim()) return
    setLinkStatus('checking')
    setTimeout(() => {
      if (!val.startsWith('https://')) { setLinkStatus('invalid'); setLinkMsg('Link must start with https://'); return }
      try { new URL(val) } catch { setLinkStatus('invalid'); setLinkMsg('Not a valid URL'); return }
      const known = ['drive.google.com','photos.google.com','photos.app.goo.gl','dropbox.com','icloud.com','onedrive.live.com','1drv.ms','youtube.com','youtu.be']
      const host = new URL(val).hostname
      if (known.some(p => host.includes(p))) {
        setLinkStatus('valid')
        setLinkMsg(providerName(val))
      } else {
        setLinkStatus('warning')
        setLinkMsg('Unknown provider — make sure link is public')
      }
    }, 800)
  }

  function providerName(url: string) {
    if (url.includes('drive.google.com'))  return 'Google Drive — link detected ✓'
    if (url.includes('photos.google.com') || url.includes('photos.app.goo.gl')) return 'Google Photos — link detected ✓'
    if (url.includes('dropbox.com'))       return 'Dropbox — link detected ✓'
    if (url.includes('icloud.com'))        return 'iCloud — link detected ✓'
    if (url.includes('onedrive.live.com') || url.includes('1drv.ms')) return 'OneDrive — link detected ✓'
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube — link detected ✓'
    return 'Valid link detected ✓'
  }

  function dbEvidenceType(type: string) {
    if (['serial_number','item_photos','shipping_label','weight_receipt'].includes(type)) return 'photo'
    if (type === 'packing_video') return 'video'
    return 'document'
  }

  async function handleSave() {
    if (sessionCount === 0) return
    setSaving(true)
    let saved = 0
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Save video link (tab = link)
      if (!isPhotoTab && linkUrl.trim() && linkStatus !== 'invalid') {
        let provider = 'other'
        if (linkUrl.includes('drive.google.com'))   provider = 'google_drive'
        else if (linkUrl.includes('dropbox.com'))   provider = 'dropbox'
        else if (linkUrl.includes('icloud.com'))    provider = 'icloud'
        else if (linkUrl.includes('youtube.com') || linkUrl.includes('youtu.be')) provider = 'youtube'
        // Delete existing same type
        const existing = evidence.filter((e: any) => (e.checklist_step || '') === 'packing_video')
        for (const ev of existing) await supabase.from('order_evidence').delete().eq('id', ev.id)
        await supabase.from('order_evidence').insert({
          order_id: order.id, user_id: user?.id,
          evidence_type: 'video', file_url: linkUrl.trim(), link_url: linkUrl.trim(),
          cloud_provider: provider, file_name: provider, file_size: 0,
          notes: notesVal || null, description: notesVal || linkUrl.trim(),
          checklist_step: 'packing_video', uploaded_at: new Date().toISOString(),
        })
        saved++
      }

      // Save photo session uploads
      for (const u of sessionUploads) {
        // Delete existing same type
        const existing = evidence.filter((e: any) => (e.checklist_step || '') === u.type)
        for (const ev of existing) await supabase.from('order_evidence').delete().eq('id', ev.id)
        // Upload file to Supabase storage
        let fileUrl = ''
        if (u.bytes) {
          try {
            const storagePath = `${user?.id}/${order.id}/${u.type}/${u.name}`
            await supabase.storage.from('evidence').upload(storagePath, u.bytes, { upsert: true, contentType: 'image/jpeg' })
            fileUrl = supabase.storage.from('evidence').getPublicUrl(storagePath).data.publicUrl
          } catch (e) { console.error('Storage error:', e) }
        }
        await supabase.from('order_evidence').insert({
          order_id: order.id, user_id: user?.id,
          evidence_type: dbEvidenceType(u.type),
          file_url: fileUrl, link_url: fileUrl || null,
          file_name: u.name, file_size: u.bytes?.length || 0,
          cloud_provider: 'supabase_storage',
          notes: u.name, description: u.name,
          checklist_step: u.type, uploaded_at: new Date().toISOString(),
        })
        saved++
      }

      toast.show?.(`${saved} evidence item${saved > 1 ? 's' : ''} saved — vault updated!`)
      onSaved()
    } catch (e: any) { console.error(e); toast.show?.('Error saving evidence') }
    finally { setSaving(false) }
  }

  const linkBorderColor = linkStatus === 'valid' ? C.accentDeep : linkStatus === 'invalid' ? C.riskHigh : linkStatus === 'warning' ? C.riskMedium : C.border

  if (typeof window === 'undefined') return null
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col border"
           style={{ borderColor: C.border, maxHeight: '85vh' }}>

        {/* Header — with sessionCount badge (matches Dart) */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b shrink-0" style={{ borderColor: C.border }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.accent }}>
            <Shield size={15} style={{ color: C.accentDark }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold" style={{ color: C.textPrimary }}>Evidence Vault</p>
            <p className="text-[10px]" style={{ color: C.textSecondary }}>
              {evidence.length > 0 ? `${evidence.length} saved · add more or remove` : 'Select type → upload → repeat as needed'}
            </p>
          </div>
          {/* Session count badge — matches Dart */}
          {sessionCount > 0 && (
            <div className="px-2.5 py-1 rounded-full text-[10px] font-bold mr-1"
                 style={{ backgroundColor: C.accent, color: C.accentDark }}>
              {sessionCount} saved
            </div>
          )}
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all"
            style={{ borderColor: C.border }}
            onMouseEnter={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.backgroundColor = C.riskHighBg
              btn.style.borderColor = C.riskHigh
              btn.querySelectorAll('svg').forEach(s => s.style.stroke = C.riskHigh)
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.backgroundColor = 'transparent'
              btn.style.borderColor = C.border
              btn.querySelectorAll('svg').forEach(s => s.style.stroke = C.textSecondary)
            }}>
            <X size={14} style={{ color: C.textSecondary }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Already in vault — matches Dart */}
          {evidence.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-bold tracking-[0.6px]" style={{ color: C.textHint }}>ALREADY IN VAULT</p>
              {evidence.map((ev: any) => {
                const evLabel = (['serial_number','item_photos','packing_video','shipping_label','weight_receipt'].includes(ev.checklist_step)
                  ? { serial_number: 'Serial Number Close-up', item_photos: 'Item from All Angles', packing_video: 'Packing Video', shipping_label: 'Shipping Label', weight_receipt: 'Weight Receipt' }[ev.checklist_step as string]
                  : ev.evidence_type) || 'Evidence'
                const allT = [...photoTypes, ...videoTypes]
                const evDef = allT.find(t => t.key === (ev.checklist_step || ev.evidence_type))
                const EvIcon = evDef?.icon || FolderOpen
                return (
                  <div key={ev.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border"
                       style={{ backgroundColor: C.accentDim + '80', borderColor: C.accent + '66' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                         style={{ backgroundColor: C.accentDim }}>
                      <EvIcon size={13} style={{ color: C.accentDeep }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold" style={{ color: C.accentDeep }}>{evLabel}</p>
                      <p className="text-[9px] truncate" style={{ color: C.textHint }}>{ev.file_name || ev.file_url}</p>
                    </div>
                    {ev.file_url?.startsWith('http') && (
                      <button onClick={() => window.open(ev.file_url, '_blank')} className="p-1">
                        <ExternalLink size={13} style={{ color: C.accentDeep }} />
                      </button>
                    )}
                    <button onClick={async () => {
                      await supabase.from('order_evidence').delete().eq('id', ev.id)
                      toast.deleted?.('Evidence') || toast.show?.('Evidence deleted')
                      onSaved()
                    }} className="w-6 h-6 rounded-lg flex items-center justify-center border"
                            style={{ backgroundColor: C.riskHighBg, borderColor: C.riskHigh + '4D' }}>
                      <Trash2 size={12} style={{ color: C.riskHigh }} />
                    </button>
                  </div>
                )
              })}
              <div className="border-t pt-2" style={{ borderColor: C.border }}>
                <p className="text-[9px] font-bold tracking-[0.6px]" style={{ color: C.textHint }}>ADD MORE</p>
              </div>
            </div>
          )}

          {/* Tab selector — matches Dart _evidenceTabBtn */}
          <div className="grid grid-cols-2 gap-2">
            {[['photo', UploadCloud, 'Upload Photo'], ['link', Video, 'Add Video Link']].map(([t, Icon, label]: any) => (
              <button key={t} onClick={() => {
                setTab(t as any)
                if (t === 'photo') { setSelType('serial_number'); setLinkUrl(''); setLinkStatus('idle'); setLinkMsg('') }
                else { setSelType('packing_video'); }
              }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border text-[12px] font-semibold"
                style={{ backgroundColor: tab === t ? C.accentDark : C.bg, borderColor: tab === t ? C.accentDark : C.border, color: tab === t ? C.accent : C.textSecondary }}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* Evidence type pills — matches Dart exactly including locked/inSession states */}
          <div className="space-y-2">
            <p className="text-[9px] font-bold tracking-[0.6px]" style={{ color: C.textHint }}>EVIDENCE TYPE</p>
            <p className="text-[9px]" style={{ color: C.textHint }}>Locked types are already saved — delete first to replace</p>
            <div className="flex flex-wrap gap-2">
              {currentTypes.map(({ key, icon: TypeIcon, label, hint }) => {
                const sel       = (effectiveType === key) || (selType === key && !uploaded.has(key))
                const inDB      = uploaded.has(key)
                const inSession = sessionUploads.some(u => u.type === key)
                const locked    = inDB
                return (
                  <button key={key}
                    onClick={() => !locked && setSelType(key)}
                    disabled={locked}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
                    style={{
                      backgroundColor: locked ? '#F0F0F0' : inSession ? C.accentDim : sel ? C.accent : C.bg,
                      borderColor: locked ? C.border : inSession ? C.accent : sel ? C.accent : C.border,
                      borderWidth: sel || inSession ? '1.5px' : '1px',
                      cursor: locked ? 'not-allowed' : 'pointer',
                      opacity: locked ? 0.85 : 1,
                    }}>
                    <TypeIcon size={12} style={{ color: locked ? C.textHint : inSession || sel ? C.accentDark : C.textSecondary }} />
                    <div className="text-left">
                      <p className="text-[11px] font-semibold leading-tight"
                         style={{ color: locked ? C.textHint : inSession || sel ? C.accentDark : C.textPrimary }}>
                        {label}
                      </p>
                      <p className="text-[9px] leading-tight"
                         style={{ color: locked ? C.textHint : inSession ? C.accentDeep : C.textHint }}>
                        {locked ? 'Saved — delete to replace' : inSession ? 'Ready to save ✓' : hint}
                      </p>
                    </div>
                    {locked && <Lock size={10} style={{ color: C.textHint }} />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t" style={{ borderColor: C.border }} />

          {/* Photo tab content */}
          {isPhotoTab && (
            uploaded.has(effectiveType || selType) ? (
              /* Lock screen — matches Dart */
              <div className="flex flex-col items-center justify-center py-7 rounded-xl border"
                   style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <Lock size={26} style={{ color: C.textHint }} />
                <p className="text-[12px] font-semibold mt-2.5" style={{ color: C.textSecondary }}>This type is already saved</p>
                <p className="text-[10px] text-center mt-1 px-4" style={{ color: C.textHint }}>
                  Delete it from "Already in Vault" above — then come back to upload a replacement
                </p>
              </div>
            ) : (
              /* Drop zone — matches Dart _EvidenceDropZone */
              <div>
                <p className="text-[9px] font-bold tracking-[0.6px] mb-2" style={{ color: C.textHint }}>
                  {`UPLOAD FOR: ${currentTypes.find(t => t.key === (effectiveType || selType))?.label?.toUpperCase()}`}
                </p>
                <DropZone
                  selType={effectiveType || selType}
                  alreadyAdded={sessionUploads.some(u => u.type === (effectiveType || selType))}
                  onFilePicked={(name: string, size: string, bytes: Uint8Array) => {
                    if (sessionUploads.some(u => u.type === (effectiveType || selType))) {
                      toast.show?.('Already added — select another type'); return
                    }
                    setSessionUploads(prev => [...prev, { type: effectiveType || selType, name, size, bytes, url: '' }])
                  }}
                />
              </div>
            )
          )}

          {/* Video link tab content */}
          {!isPhotoTab && (
            <div className="space-y-3">
              <p className="text-[9px] font-bold tracking-[0.6px]" style={{ color: C.textHint }}>ADD LINK FOR: PACKING VIDEO</p>
              {/* Warning */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg border" style={{ backgroundColor: '#FFFBEA', borderColor: C.riskMedium + '4D' }}>
                <AlertTriangle size={11} style={{ color: C.riskMedium, marginTop: 1 }} />
                <p className="text-[10px]" style={{ color: C.riskMedium }}>Set link to "Anyone with link can view" — private links fail in disputes</p>
              </div>
              {/* Link input with live validator */}
              <div className="relative">
                <div className="absolute left-3 top-2.5">
                  <Link size={14} style={{ color: linkStatus === 'valid' ? C.accentDeep : linkStatus === 'invalid' ? C.riskHigh : C.textHint }} />
                </div>
                <input type="url" value={linkUrl} onChange={e => handleLinkChange(e.target.value)}
                  placeholder="https://drive.google.com/file/..."
                  className="w-full pl-8 pr-8 py-2.5 rounded-lg border text-[13px] outline-none"
                  style={{ borderColor: linkBorderColor, color: C.textPrimary, borderWidth: linkStatus !== 'idle' ? '1.5px' : '1px' }} />
                <div className="absolute right-2.5 top-2.5">
                  {linkStatus === 'checking' && <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.textHint }} />}
                  {linkStatus === 'valid'    && <CheckCircle size={16} style={{ color: C.accentDeep }} />}
                  {linkStatus === 'invalid'  && <XCircle size={16} style={{ color: C.riskHigh }} />}
                  {linkStatus === 'warning'  && <AlertTriangle size={16} style={{ color: C.riskMedium }} />}
                </div>
              </div>
              {/* Status message */}
              {linkStatus !== 'idle' && linkStatus !== 'checking' && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                     style={{ backgroundColor: linkStatus === 'valid' ? C.accentDim : linkStatus === 'invalid' ? C.riskHighBg : C.riskMediumBg }}>
                  {linkStatus === 'valid'   && <CheckCircle size={12} style={{ color: C.accentDeep }} />}
                  {linkStatus === 'invalid' && <XCircle size={12} style={{ color: C.riskHigh }} />}
                  {linkStatus === 'warning' && <AlertTriangle size={12} style={{ color: C.riskMedium }} />}
                  <p className="text-[10px]" style={{ color: linkStatus === 'valid' ? C.accentDeep : linkStatus === 'invalid' ? C.riskHigh : C.riskMedium }}>{linkMsg}</p>
                </div>
              )}
              {/* Cloud chips */}
              <div className="flex gap-2 flex-wrap">
                {[['Google Drive','drive.google.com'],['Dropbox','dropbox.com'],['iCloud','icloud.com']].map(([name, domain]) => {
                  const active = linkUrl.includes(domain)
                  return (
                    <div key={name} className="flex items-center gap-1 px-2 py-1 rounded-full border text-[10px]"
                         style={{ backgroundColor: active ? C.accentDim : C.bg, borderColor: active ? C.accent : C.border, color: active ? C.accentDeep : C.textHint, fontWeight: active ? 700 : 400 }}>
                      ☁️ {name}
                    </div>
                  )
                })}
              </div>
              {/* Notes */}
              <div>
                <p className="text-[9px] font-bold tracking-[0.6px] mb-1.5" style={{ color: C.textHint }}>NOTES (optional)</p>
                <textarea value={notesVal} onChange={e => setNotesVal(e.target.value)} rows={2}
                  placeholder="e.g. Uncut 3min packing video"
                  className="w-full px-3 py-2 rounded-lg border text-[12px] outline-none resize-none"
                  style={{ borderColor: C.border, color: C.textPrimary }} />
              </div>
            </div>
          )}

          {/* Session uploads — matches Dart "UPLOADED THIS SESSION" */}
          {sessionUploads.length > 0 && (
            <div className="space-y-2">
              <div className="border-t pt-2" style={{ borderColor: C.border }}>
                <p className="text-[9px] font-bold tracking-[0.6px]" style={{ color: C.textHint }}>UPLOADED THIS SESSION</p>
              </div>
              {sessionUploads.map((u: any, idx: number) => {
                const allT = [...photoTypes, ...videoTypes]
                const def  = allT.find(t => t.key === u.type)
                const UIcon = def?.icon || FolderOpen
                return (
                  <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-lg border"
                       style={{ backgroundColor: C.accentDim + '80', borderColor: C.accent + '66' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: C.accentDim }}>
                      <UIcon size={13} style={{ color: C.accentDeep }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold" style={{ color: C.accentDeep }}>{def?.label || u.type}</p>
                      <p className="text-[9px] truncate" style={{ color: C.textSecondary }}>{u.name}</p>
                      {u.size && <p className="text-[9px]" style={{ color: C.textHint }}>{u.size}</p>}
                    </div>
                    <button onClick={() => setSessionUploads(prev => prev.filter((_: any, i: number) => i !== idx))}
                      className="w-6 h-6 rounded-lg flex items-center justify-center border"
                      style={{ backgroundColor: C.riskHighBg, borderColor: C.riskHigh + '33' }}>
                      <X size={12} style={{ color: C.riskHigh }} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer — "No minimum — upload 1 or all 5" + Save N Items button */}
        <div className="flex items-center gap-2 px-4 py-3 border-t shrink-0" style={{ borderColor: C.border }}>
          <Info size={11} style={{ color: C.textHint }} />
          <span className="flex-1 text-[10px]" style={{ color: C.textHint }}>No minimum — upload 1 or all 5</span>
          <button onClick={onClose}
            className="px-3 py-2 rounded-lg border text-[12px] font-semibold transition-all"
            style={{ borderColor: C.border, color: C.textSecondary }}
            onMouseEnter={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.backgroundColor = C.riskHighBg
              btn.style.borderColor = C.riskHigh
              btn.style.color = C.riskHigh
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.backgroundColor = 'transparent'
              btn.style.borderColor = C.border
              btn.style.color = C.textSecondary
            }}>Cancel</button>
          <button onClick={handleSave}
            disabled={saving || sessionCount === 0}
            className="px-4 py-2 rounded-lg text-[12px] font-bold disabled:opacity-40"
            style={{ backgroundColor: sessionCount > 0 ? C.accent : C.border, color: C.accentDark }}>
            {saving ? 'Saving...' : sessionCount === 0 ? 'Save' : `Save ${sessionCount} Item${sessionCount > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  ,
    document.body
  )
}

// ── Drop zone component (matches Dart _EvidenceDropZone) ──
function DropZone({ selType, alreadyAdded, onFilePicked }: any) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`
    return `${(bytes/1048576).toFixed(1)} MB`
  }

  function handleFile(file: File) {
    if (alreadyAdded) return
    if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(file.type)) {
      alert('Only JPG / PNG files allowed'); return
    }
    if (file.size > 5 * 1024 * 1024) { alert('File too large — max 5 MB'); return }
    const reader = new FileReader()
    reader.onload = e => {
      const bytes = new Uint8Array(e.target?.result as ArrayBuffer)
      onFilePicked(file.name, formatSize(file.size), bytes)
    }
    reader.readAsArrayBuffer(file)
  }

  const done = alreadyAdded
  const bg   = done ? C.accentDim + '66' : isDragging ? '#E8FFCC' : C.accentDim

  return (
    <div
      onDragOver={e => { e.preventDefault(); !done && setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={e => {
        e.preventDefault(); setIsDragging(false)
        if (done) return
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
      }}
      onClick={() => !done && inputRef.current?.click()}
      className="flex flex-col items-center justify-center py-7 rounded-xl border-2 cursor-pointer transition-all"
      style={{ backgroundColor: bg, borderColor: isDragging ? C.accentDeep : C.accent, borderWidth: isDragging ? '2.5px' : '1.5px' }}>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden"
             onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
           style={{ backgroundColor: done ? C.accentDim : isDragging ? C.accent : C.accentDim }}>
        <UploadCloud size={20} style={{ color: done || isDragging ? C.accentDark : C.accentDeep }} />
      </div>
      <p className="text-[12px] font-bold" style={{ color: C.accentDeep, fontFamily: 'var(--font-space-grotesk)' }}>
        {done ? 'Photo added ✓' : isDragging ? 'Drop photo here' : 'Tap to choose or drag & drop'}
      </p>
      <p className="text-[10px] mt-0.5" style={{ color: C.textHint }}>
        {done ? 'Select another type to add more' : 'JPG or PNG — max 5 MB'}
      </p>
    </div>
  )
}


export default OrderDetailInline