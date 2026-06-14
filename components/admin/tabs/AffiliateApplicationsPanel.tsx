'use client'
// components/admin/tabs/AffiliateApplicationsPanel.tsx

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  X, CheckCircle, ExternalLink, ChevronRight, ChevronLeft,
  Globe, Mail, MapPin, Clock, AlertCircle, Search, Tag,
} from 'lucide-react'

const C = {
  dark:     '#0a0d08',
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  border:   '#e8ede2',
  bg:       '#f7f9f5',
  text:     '#1a2410',
  muted:    '#8a9e78',
  surface:  '#ffffff',
  green:    '#16a34a',
  red:      '#b91c1c',
}

const PLATFORM_LOGOS = [
  { value: 'youtube',   label: 'YouTube',        logo: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64'   },
  { value: 'tiktok',    label: 'TikTok',         logo: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=64'    },
  { value: 'instagram', label: 'Instagram',      logo: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64' },
  { value: 'twitter',   label: 'Twitter / X',    logo: 'https://www.google.com/s2/favicons?domain=x.com&sz=64'         },
  { value: 'facebook',  label: 'Facebook',       logo: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=64'  },
  { value: 'blog',      label: 'Blog / Website', logo: 'https://www.google.com/s2/favicons?domain=wordpress.com&sz=64' },
  { value: 'email',     label: 'Email List',     logo: 'https://www.google.com/s2/favicons?domain=mailchimp.com&sz=64' },
  { value: 'other',     label: 'Other'           },
]

export interface Application {
  id:               string
  full_name:        string
  email:            string
  country:          string
  platform:         string
  platform_url:     string | null
  content_niche:    string
  payout_method:    string | null
  payment_details:  string | null
  agreed_to_terms:  boolean | null
  status:           string
  rejection_reason: string | null
  reviewed_at:      string | null
  message:          string | null
  created_at:       string
}

interface Props {
  applications: Application[]
  onClose:      () => void
  onRefresh:    () => void
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatMethod(method: string | null): string {
  if (!method) return '—'
  if (method === 'paypal') return 'PayPal'
  if (method === 'bank')   return 'Bank Transfer'
  if (method === 'crypto') return 'Crypto'
  return method.charAt(0).toUpperCase() + method.slice(1)
}

export default function AffiliateApplicationsPanel({ applications, onClose, onRefresh }: Props) {
  const supabase = createClient()

  const [rejectDialog,   setRejectDialog]   = useState<Application | null>(null)
  const [rejectReason,   setRejectReason]   = useState('')
  const [processing,     setProcessing]     = useState<string | null>(null)
  const [selectedApp,    setSelectedApp]    = useState<Application | null>(null)
  const [filter,         setFilter]         = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [toast,          setToast]          = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [visible,        setVisible]        = useState(false)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [searchFocused,  setSearchFocused]  = useState(false)

  // Fix 3+4: Approve dialog with custom code + commission
  const [approveDialog,  setApproveDialog]  = useState<Application | null>(null)
  const [customCode,     setCustomCode]     = useState('')
  const [customRate,     setCustomRate]     = useState('')
  const [codeError,      setCodeError]      = useState('')
  const [dupWarning,     setDupWarning]     = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 280)
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Fix 3+4: Open approve dialog with auto-generated code
  function openApproveDialog(app: Application) {
    const prefix = app.full_name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    const suffix = Math.floor(1000 + Math.random() * 9000)
    setCustomCode(`${prefix}${suffix}`)
    setCustomRate('')
    setCodeError('')
    setDupWarning(false)
    setApproveDialog(app)
  }

  // Fix 6: Check for duplicate email
  async function checkDuplicate(email: string): Promise<boolean> {
    try {
      const { data } = await (supabase.from('affiliates') as any)
        .select('id').eq('email', email).limit(1)
      return (data?.length ?? 0) > 0
    } catch { return false }
  }

  async function confirmApprove() {
    if (!approveDialog) return
    const app = approveDialog
    const code = customCode.trim().toUpperCase()

    if (!code) { setCodeError('Coupon code is required'); return }
    if (code.length < 3) { setCodeError('Code must be at least 3 characters'); return }
    if (!/^[A-Z0-9]+$/.test(code)) { setCodeError('Only letters and numbers allowed'); return }

    setProcessing(app.id)
    try {
      // Fix 6: Duplicate email check
      const isDup = await checkDuplicate(app.email)
      if (isDup) {
        setDupWarning(true)
        setProcessing(null)
        return
      }

      // Check code uniqueness
      const { data: existing } = await (supabase.from('affiliates') as any)
        .select('id').eq('code', code).limit(1)
      if (existing?.length > 0) { setCodeError('Code already taken — try another'); setProcessing(null); return }

      const rate = customRate ? Number(customRate) / 100 : null

      await (supabase.from('affiliates') as any).insert([{
        name:            app.full_name,
        email:           app.email,
        code,
        clicks:          0,
        signups:         0,
        mrr:             0,
        payout:          0,
        tier:            'Bronze',
        status:          'active',
        payout_status:   'pending',
        payout_method:   app.payout_method   ?? 'paypal',
        payment_details: app.payment_details ?? null,
        custom_commission: rate,
        traffic_source:  app.platform        ?? null,
        country:         app.country         ?? null,
        notes:           `Approved from application · ${app.platform} · ${app.content_niche}`,
      }])

      await (supabase.from('affiliate_applications') as any)
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', app.id)

      onRefresh()
      setApproveDialog(null)
      setSelectedApp(null)
      showToast(`${app.full_name} approved with code ${code}`)
    } catch (e) {
      console.error(e)
      showToast('Failed to approve application', 'error')
    }
    setProcessing(null)
  }

  async function rejectApplication(app: Application, reason: string) {
    setProcessing(app.id)
    try {
      await (supabase.from('affiliate_applications') as any)
        .update({
          status:           'rejected',
          rejection_reason: reason || null,
          reviewed_at:      new Date().toISOString(),
        })
        .eq('id', app.id)
      onRefresh()
      setSelectedApp(null)
      setRejectDialog(null)
      setRejectReason('')
      showToast(`${app.full_name}'s application rejected`)
    } catch (e) {
      console.error(e)
      showToast('Failed to reject application', 'error')
    }
    setProcessing(null)
  }

  const pending  = applications.filter(a => a.status === 'pending').length
  const approved = applications.filter(a => a.status === 'approved').length
  const rejected = applications.filter(a => a.status === 'rejected').length

  // Fix 5: Search + filter
  const filtered = applications.filter(a => {
    const matchFilter = filter === 'all' ? true : a.status === filter
    const q = searchQuery.toLowerCase()
    const matchSearch = !q
      || a.full_name.toLowerCase().includes(q)
      || a.email.toLowerCase().includes(q)
      || a.country.toLowerCase().includes(q)
      || a.platform.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998]"
           style={{
             backgroundColor: `rgba(0,0,0,${visible ? 0.5 : 0})`,
             transition: 'background-color 0.28s ease',
           }}
           onClick={handleClose}>

        {/* Panel */}
        <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl"
             style={{
               backgroundColor: C.surface,
               maxHeight:       '85vh',
               display:         'flex',
               flexDirection:   'column',
               boxShadow:       '0 -8px 40px rgba(0,0,0,0.2)',
               transform:       visible ? 'translateY(0)' : 'translateY(100%)',
               transition:      'transform 0.28s cubic-bezier(0.32,0.72,0,1)',
             }}
             onClick={e => e.stopPropagation()}>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ backgroundColor: C.border }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 shrink-0"
               style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-3">
              <p className="text-[16px] font-bold" style={{ color: C.text }}>Affiliate Applications</p>
              {pending > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  <Clock size={11} /> {pending} pending
                </span>
              )}
            </div>
            <button onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-70"
              style={{ backgroundColor: C.bg }}>
              <X size={16} style={{ color: C.muted }} />
            </button>
          </div>

          {/* Filter tabs + Search — Fix 5+6 */}
          <div className="px-6 py-2.5 shrink-0 flex items-center gap-3 flex-wrap"
               style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg }}>
            <div className="flex gap-1.5">
              {([
                { key: 'pending',  label: 'Pending',  count: pending,              activeBg: '#FEF3C7', activeColor: '#92400E' },
                { key: 'all',      label: 'All',      count: applications.length,  activeBg: C.dark,   activeColor: C.lime    },
                { key: 'approved', label: 'Approved', count: approved,             activeBg: '#F0FDF4', activeColor: C.green  },
                { key: 'rejected', label: 'Rejected', count: rejected,             activeBg: '#FEF2F2', activeColor: C.red    },
              ] as const).map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                  style={{
                    backgroundColor: filter === f.key ? f.activeBg : 'transparent',
                    color:           filter === f.key ? f.activeColor : C.muted,
                    border:          `1px solid ${filter === f.key ? f.activeBg : 'transparent'}`,
                  }}>
                  {f.label}
                  <span className="px-1.5 py-0.5 rounded-full text-[10px]"
                        style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: 'inherit' }}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search — Fix 5 */}
            <div className="flex items-center gap-2 h-8 px-3 rounded-xl flex-1"
                 style={{
                   border:     `1.5px solid ${searchFocused ? C.lime : C.border}`,
                   boxShadow:  searchFocused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
                   backgroundColor: C.surface,
                   minWidth: 180,
                 }}>
              <Search size={13} style={{ color: searchFocused ? C.limeDeep : C.muted, flexShrink: 0 }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search name, email, platform..."
                className="flex-1 text-[12px] bg-transparent"
                style={{ color: C.text, outline: 'none', border: 'none' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X size={12} style={{ color: C.muted }} />
                </button>
              )}
            </div>
          </div>

          {/* Column headers */}
          <div className="px-6 py-2 shrink-0"
               style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.3fr', borderBottom: `1px solid ${C.border}` }}>
            {['Applicant', 'Platform', 'Applied', 'Actions'].map((h, i) => (
              <p key={i} className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-[15px] font-bold" style={{ color: C.muted }}>
                  {searchQuery ? `No results for "${searchQuery}"` : `No ${filter === 'all' ? '' : filter} applications`}
                </p>
              </div>
            ) : filtered.map(app => {
              const platform   = PLATFORM_LOGOS.find(p => p.value === app.platform)
              const isProc     = processing === app.id
              const isPending  = app.status === 'pending'
              const isApproved = app.status === 'approved'
              const isRejected = app.status === 'rejected'
              const shortUrl   = app.platform_url
                ? app.platform_url.replace('https://', '').replace('http://', '').slice(0, 28)
                : null

              return (
                <div key={app.id} className="px-6 py-3"
                     style={{
                       display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.3fr', alignItems: 'center',
                       backgroundColor: isPending ? '#FFFBEB' : C.surface,
                       borderBottom: `1px solid ${C.border}`,
                     }}>

                  {/* Applicant */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                         style={{ backgroundColor: C.dark }}>
                      <span className="text-[12px] font-bold" style={{ color: C.lime }}>
                        {app.full_name[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold truncate" style={{ color: C.text }}>{app.full_name}</p>
                      <p className="text-[11px] truncate" style={{ color: C.muted }}>{app.email} · {app.country}</p>
                    </div>
                  </div>

                  {/* Platform */}
                  <div className="flex items-center gap-2 min-w-0 pr-3">
                    {platform?.logo
                      ? <img src={platform.logo} alt="" className="w-4 h-4 rounded object-contain shrink-0"
                             onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      : <Globe size={14} style={{ color: C.muted, flexShrink: 0 }} />}
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold truncate" style={{ color: C.text }}>{platform?.label ?? app.platform}</p>
                      {shortUrl
                        ? <a href={app.platform_url!} target="_blank" rel="noreferrer"
                             className="text-[10px] flex items-center gap-0.5 hover:underline"
                             style={{ color: C.limeDeep }}>
                            <span className="truncate" style={{ maxWidth: 100 }}>{shortUrl}</span>
                            <ExternalLink size={9} style={{ flexShrink: 0 }} />
                          </a>
                        : <p className="text-[10px]" style={{ color: C.muted }}>No URL</p>}
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-[12px]" style={{ color: C.text }}>{formatDate(app.created_at)}</p>
                    <p className="text-[10px]" style={{ color: C.muted }}>{app.content_niche?.split(' ')[0] ?? '—'}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedApp(app)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all hover:opacity-80"
                      style={{ borderColor: C.border, backgroundColor: C.bg }}>
                      <ChevronRight size={13} style={{ color: C.muted }} />
                    </button>
                    {isPending && (<>
                      <button onClick={() => { setRejectDialog(app); setRejectReason('') }}
                        className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all"
                        style={{ borderColor: '#FECACA', color: C.red, backgroundColor: '#FEF2F2' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEE2E2' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}>
                        Reject
                      </button>
                      <button onClick={() => openApproveDialog(app)} disabled={isProc}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:opacity-80"
                        style={{ backgroundColor: C.limeDeep, color: '#fff' }}>
                        {isProc
                          ? <div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
                          : <CheckCircle size={11} />}
                        Approve
                      </button>
                    </>)}
                    {isApproved && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: '#F0FDF4', color: C.green }}>
                        <CheckCircle size={11} /> Approved
                      </span>
                    )}
                    {isRejected && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: '#FEF2F2', color: C.red }}>
                        <X size={11} /> Rejected
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer stats */}
          <div className="px-6 py-3 shrink-0 flex items-center gap-5"
               style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.bg }}>
            {[
              { label: 'Total',    val: applications.length, color: C.text     },
              { label: 'Pending',  val: pending,             color: '#92400E'  },
              { label: 'Approved', val: approved,            color: C.green    },
              { label: 'Rejected', val: rejected,            color: C.red      },
            ].map(s => (
              <p key={s.label} className="text-[12px]" style={{ color: C.muted }}>
                {s.label}: <strong style={{ color: s.color }}>{s.val}</strong>
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      {selectedApp && (() => {
        const app      = selectedApp
        const platform = PLATFORM_LOGOS.find(p => p.value === app.platform)
        const isProc   = processing === app.id
        const isPending  = app.status === 'pending'
        const isApproved = app.status === 'approved'
        const isRejected = app.status === 'rejected'

        return (
          <div className="fixed inset-0 z-[9999] flex justify-end"
               onClick={e => e.target === e.currentTarget && setSelectedApp(null)}>
            <style>{`
              @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
              @keyframes fadeInBg     { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
            <div className="absolute inset-0"
                 style={{ backgroundColor: 'rgba(0,0,0,0.3)', animation: 'fadeInBg 0.25s ease' }}
                 onClick={() => setSelectedApp(null)} />
            <div className="relative flex flex-col h-full w-full max-w-md"
                 style={{ backgroundColor: C.surface, boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', animation: 'slideInRight 0.3s cubic-bezier(0.32,0.72,0,1)' }}
                 onClick={e => e.stopPropagation()}>

              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 shrink-0"
                   style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedApp(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70"
                    style={{ backgroundColor: C.bg }}>
                    <ChevronLeft size={16} style={{ color: C.muted }} />
                  </button>
                  <p className="text-[15px] font-bold" style={{ color: C.text }}>Application Details</p>
                </div>
                <button onClick={() => setSelectedApp(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70"
                  style={{ backgroundColor: C.bg }}>
                  <X size={16} style={{ color: C.muted }} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

                {/* Status */}
                <div className="flex justify-center">
                  {isPending  && <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}><Clock size={13} /> Pending Review</span>}
                  {isApproved && <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold" style={{ backgroundColor: '#F0FDF4', color: C.green }}><CheckCircle size={13} /> Approved</span>}
                  {isRejected && <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold" style={{ backgroundColor: '#FEF2F2', color: C.red }}><X size={13} /> Rejected{app.rejection_reason ? ` — ${app.rejection_reason}` : ''}</span>}
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: C.dark }}>
                    <span className="text-[24px] font-bold" style={{ color: C.lime }}>{app.full_name[0].toUpperCase()}</span>
                  </div>
                  <p className="text-[18px] font-bold" style={{ color: C.text }}>{app.full_name}</p>
                  <p className="text-[13px]" style={{ color: C.muted }}>Applied {formatDate(app.created_at)}</p>
                </div>

                {/* Personal info */}
                <div className="p-4 rounded-2xl" style={{ backgroundColor: C.bg }}>
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>Personal Info</p>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      <Mail size={14} style={{ color: C.muted, flexShrink: 0 }} />
                      <p className="text-[13px]" style={{ color: C.text }}>{app.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={14} style={{ color: C.muted, flexShrink: 0 }} />
                      <p className="text-[13px]" style={{ color: C.text }}>{app.country}</p>
                    </div>
                    {/* Fix 2: agreed_to_terms */}
                    <div className="flex items-center gap-3">
                      <CheckCircle size={14} style={{ color: app.agreed_to_terms ? C.green : C.muted, flexShrink: 0 }} />
                      <p className="text-[13px]" style={{ color: app.agreed_to_terms ? C.green : C.muted }}>
                        {app.agreed_to_terms ? 'Agreed to terms' : 'Terms not confirmed'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Platform */}
                <div className="p-4 rounded-2xl" style={{ backgroundColor: C.bg }}>
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>Platform</p>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      {platform?.logo
                        ? <img src={platform.logo} alt="" className="w-5 h-5 rounded object-contain shrink-0"
                               onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        : <Globe size={14} style={{ color: C.muted }} />}
                      <p className="text-[13px] font-bold" style={{ color: C.text }}>{platform?.label ?? app.platform}</p>
                    </div>
                    {app.platform_url && (
                      <div className="flex items-start gap-3">
                        <ExternalLink size={14} style={{ color: C.muted, flexShrink: 0, marginTop: 2 }} />
                        <a href={app.platform_url} target="_blank" rel="noreferrer"
                           className="text-[13px] break-all hover:underline" style={{ color: C.limeDeep }}>
                          {app.platform_url}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: C.lime }} />
                      <p className="text-[13px]" style={{ color: C.text }}>{app.content_niche}</p>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                {(app.payout_method || app.payment_details) && (
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: C.bg }}>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>Preferred Payment</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px]" style={{ color: C.muted }}>Method</p>
                        <p className="text-[13px] font-bold" style={{ color: C.text }}>{formatMethod(app.payout_method)}</p>
                      </div>
                      {app.payment_details && (
                        <div className="flex items-center justify-between">
                          <p className="text-[12px]" style={{ color: C.muted }}>Pay to</p>
                          <p className="text-[13px] font-bold" style={{ color: C.limeDeep }}>{app.payment_details}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Message */}
                {app.message && (
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: C.bg }}>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>Message from Applicant</p>
                    <p className="text-[13px] leading-relaxed px-3 py-3 rounded-xl"
                       style={{ backgroundColor: C.surface, color: C.text, border: `1px solid ${C.border}`, fontStyle: 'italic' }}>
                      "{app.message}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {isPending && (
                <div className="p-5 shrink-0 flex flex-col gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
                  <button onClick={() => openApproveDialog(app)} disabled={isProc}
                    className="w-full py-3 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ backgroundColor: C.limeDeep, color: '#fff' }}>
                    {isProc ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} /> : <CheckCircle size={16} />}
                    Approve & Create Affiliate
                  </button>
                  <button onClick={() => { setRejectDialog(app); setRejectReason('') }}
                    className="w-full py-3 rounded-xl border text-[14px] font-bold transition-all"
                    style={{ borderColor: '#FECACA', color: C.red, backgroundColor: '#FEF2F2' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEE2E2' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}>
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Fix 3+4: Approve Dialog with custom code + commission */}
      {approveDialog && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
             onClick={e => e.target === e.currentTarget && setApproveDialog(null)}>
          <div className="bg-white rounded-2xl border w-full max-w-sm overflow-hidden"
               style={{ borderColor: C.border, boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <p className="text-[15px] font-bold" style={{ color: C.text }}>Approve Application</p>
              <p className="text-[12px] mt-0.5" style={{ color: C.muted }}>{approveDialog.full_name} · {approveDialog.email}</p>
            </div>
            <div className="p-5 flex flex-col gap-4">

              {/* Duplicate warning */}
              {dupWarning && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                     style={{ backgroundColor: '#FEF3C7', border: `1px solid #FDE68A` }}>
                  <AlertCircle size={14} style={{ color: '#92400E', flexShrink: 0 }} />
                  <p className="text-[12px] font-bold" style={{ color: '#92400E' }}>
                    This email already has an affiliate account. Approve anyway?
                  </p>
                </div>
              )}

              {/* Coupon code */}
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
                  Coupon Code <span style={{ color: C.red }}>*</span>
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-xl"
                       style={{ border: `1.5px solid ${codeError ? C.red : C.border}`, backgroundColor: C.bg }}>
                    <Tag size={14} style={{ color: C.muted, flexShrink: 0 }} />
                    <input
                      value={customCode}
                      onChange={e => { setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setCodeError('') }}
                      placeholder="e.g. FLIPKING"
                      maxLength={12}
                      className="flex-1 text-[13px] font-bold bg-transparent tracking-wider"
                      style={{ color: C.text, outline: 'none', border: 'none', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
                {codeError && <p className="text-[11px] mt-1" style={{ color: C.red }}>{codeError}</p>}
                <p className="text-[10px] mt-1" style={{ color: C.muted }}>Auto-generated — edit to customize</p>
              </div>

              {/* Custom commission */}
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
                  Custom Commission Rate (optional)
                </p>
                <div className="flex items-center gap-2 h-10 px-3 rounded-xl"
                     style={{ border: `1.5px solid ${C.border}`, backgroundColor: C.bg }}>
                  <input
                    value={customRate}
                    onChange={e => setCustomRate(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="Leave blank to use default (25%)"
                    className="flex-1 text-[13px] bg-transparent"
                    style={{ color: C.text, outline: 'none', border: 'none' }}
                  />
                  <span className="text-[13px] font-bold" style={{ color: C.muted }}>%</span>
                </div>
                <p className="text-[10px] mt-1" style={{ color: C.muted }}>Default: 25% · Enter 30 for 30%</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setApproveDialog(null)}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                  style={{ borderColor: C.border, color: C.muted }}>
                  Cancel
                </button>
                <button onClick={confirmApprove} disabled={processing === approveDialog.id}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2"
                  style={{ backgroundColor: C.limeDeep, color: '#fff' }}>
                  {processing === approveDialog.id
                    ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
                    : <><CheckCircle size={14} /> Confirm Approve</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {rejectDialog && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={e => e.target === e.currentTarget && setRejectDialog(null)}>
          <div className="bg-white rounded-2xl border p-6 w-full max-w-sm" style={{ borderColor: C.border }}>
            <p className="text-[15px] font-bold mb-1" style={{ color: C.text }}>Reject Application</p>
            <p className="text-[12px] mb-4" style={{ color: C.muted }}>{rejectDialog.full_name} · {rejectDialog.email}</p>
            <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Reason (optional)</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Content not related to eBay selling..."
              rows={3} className="w-full px-3 py-2 rounded-xl text-[13px] resize-none outline-none mb-4"
              style={{ border: `1.5px solid ${C.border}`, color: C.text, backgroundColor: C.bg }}
              onFocus={e  => { e.target.style.borderColor = C.lime;   e.target.style.boxShadow = '0 0 0 3px rgba(143,255,0,0.15)' }}
              onBlur={e   => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }} />
            <div className="flex gap-2">
              <button onClick={() => setRejectDialog(null)}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
              <button onClick={() => rejectApplication(rejectDialog, rejectReason)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold"
                style={{ backgroundColor: C.red, color: '#fff' }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
             style={{ backgroundColor: toast.type === 'error' ? '#FEF2F2' : C.dark, border: `1px solid ${toast.type === 'error' ? '#FECACA' : C.lime}`, color: toast.type === 'error' ? C.red : C.lime }}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          <p className="text-[13px] font-bold">{toast.msg}</p>
        </div>
      )}
    </>
  )
}