'use client'
// components/admin/tabs/AffiliateApplicationsPanel.tsx
// Slide-up panel for reviewing affiliate applications

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { X, CheckCircle, ExternalLink, ChevronRight, ChevronLeft, Globe, Mail, MapPin, DollarSign } from 'lucide-react'

// ── Brand colors ──────────────────────────────────────────────
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
  id:              string
  full_name:       string
  email:           string
  country:         string
  platform:        string
  platform_url:    string
  content_niche:   string
  payout_method:   string | null
  payment_details: string | null
  status:          string
  rejection_reason:string | null
  message:         string | null
  created_at:      string
}

interface Props {
  applications: Application[]
  onClose:      () => void
  onRefresh:    () => void
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatMethod(method: string): string {
  if (method === 'paypal') return 'PayPal'
  if (method === 'bank')   return 'Bank Transfer'
  if (method === 'crypto') return 'Crypto'
  return method.charAt(0).toUpperCase() + method.slice(1)
}

export default function AffiliateApplicationsPanel({ applications, onClose, onRefresh }: Props) {
  const supabase = createClient()

  const [rejectDialog, setRejectDialog] = useState<Application | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing,   setProcessing]   = useState<string | null>(null)
  const [selectedApp,  setSelectedApp]  = useState<Application | null>(null)

  async function approveApplication(app: Application) {
    setProcessing(app.id)
    try {
      // Auto-generate referral code from name
      const prefix = app.full_name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
      const suffix = Math.floor(1000 + Math.random() * 9000)
      const code   = `${prefix}${suffix}`

      // Create affiliate from application
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
        notes:           `Approved from application · ${app.platform} · ${app.country}`,
      }])

      // Mark application as approved
      await (supabase.from('affiliate_applications') as any)
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', app.id)

      onRefresh()
      setSelectedApp(null)   // close drawer ✅
    } catch (e) { console.error(e) }
    setProcessing(null)
  }

  async function rejectApplication(app: Application, reason: string) {
    setProcessing(app.id)
    try {
      await (supabase.from('affiliate_applications') as any)
        .update({
          status:           'rejected',
          rejection_reason: reason,
          reviewed_at:      new Date().toISOString(),
        })
        .eq('id', app.id)
      onRefresh()
      setSelectedApp(null)   // close drawer ✅
    } catch (e) { console.error(e) }
    setRejectDialog(null)
    setRejectReason('')
    setProcessing(null)
  }

  const pending  = applications.filter(a => a.status === 'pending').length
  const approved = applications.filter(a => a.status === 'approved').length
  const rejected = applications.filter(a => a.status === 'rejected').length

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998]"
           style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
           onClick={onClose}>

        {/* Panel — slides up from bottom */}
        <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl"
             style={{
               backgroundColor: C.surface,
               maxHeight:       '85vh',
               display:         'flex',
               flexDirection:   'column',
               boxShadow:       '0 -8px 40px rgba(0,0,0,0.2)',
             }}
             onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0"
               style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-3">
              <p className="text-[16px] font-bold" style={{ color: C.text }}>
                Affiliate Applications
              </p>
              {pending > 0 && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  {pending} pending
                </span>
              )}
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-70"
              style={{ backgroundColor: C.bg }}>
              <X size={16} style={{ color: C.muted }} />
            </button>
          </div>

          {/* Column headers */}
          <div className="px-6 py-2.5 shrink-0"
               style={{
                 display:             'grid',
                 gridTemplateColumns: '2fr 1.5fr 1fr 1.2fr',
                 borderBottom:        `1px solid ${C.border}`,
                 backgroundColor:     C.bg,
               }}>
            {['Applicant', 'Platform', 'Applied', 'Actions'].map((h, i) => (
              <p key={i} className="text-[11px] font-bold uppercase tracking-wide"
                 style={{ color: C.muted }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          <div className="overflow-y-auto flex-1">
            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-[15px] font-bold" style={{ color: C.muted }}>No applications yet</p>
                <p className="text-[13px] mt-1" style={{ color: C.muted }}>
                  Share your affiliate apply page to get applicants
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
                {applications.map(app => {
                  const platform   = PLATFORM_LOGOS.find(p => p.value === app.platform)
                  const isProc     = processing === app.id
                  const isPending  = app.status === 'pending'
                  const isApproved = app.status === 'approved'
                  const isRejected = app.status === 'rejected'

                  return (
                    <div key={app.id}
                         className="px-6 py-3"
                         style={{
                           display:             'grid',
                           gridTemplateColumns: '2fr 1.5fr 1fr 1.2fr',
                           alignItems:          'center',
                           backgroundColor:     isPending ? '#FFFBEB' : C.surface,
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
                          <p className="text-[13px] font-bold truncate" style={{ color: C.text }}>
                            {app.full_name}
                          </p>
                          <p className="text-[11px] truncate" style={{ color: C.muted }}>
                            {app.email} · {app.country}
                          </p>
                        </div>
                      </div>

                      {/* Platform */}
                      <div className="flex items-center gap-2 min-w-0 pr-3">
                        {platform?.logo && (
                          <img src={platform.logo} alt="" className="w-4 h-4 rounded object-contain shrink-0"
                               onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        )}
                        <div className="min-w-0">
                          <p className="text-[12px] font-bold truncate" style={{ color: C.text }}>
                            {platform?.label ?? app.platform}
                          </p>
                          <a href={app.platform_url} target="_blank" rel="noreferrer"
                             className="text-[10px] flex items-center gap-0.5 hover:underline"
                             style={{ color: C.limeDeep }}>
                            <span className="truncate" style={{ maxWidth: 100 }}>
                              {app.platform_url.replace('https://', '').slice(0, 25)}
                              {app.platform_url.length > 30 ? '...' : ''}
                            </span>
                            <ExternalLink size={9} style={{ flexShrink: 0 }} />
                          </a>
                        </div>
                      </div>
                      {/* Date */}
                      <div>
                        <p className="text-[12px]" style={{ color: C.text }}>
                          {formatDate(app.created_at)}
                        </p>
                        <p className="text-[10px]" style={{ color: C.muted }}>
                          {app.content_niche.split(' ')[0]}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* View details button */}
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all hover:opacity-80"
                          style={{ borderColor: C.border, backgroundColor: C.bg }}>
                          <ChevronRight size={13} style={{ color: C.muted }} />
                        </button>
                        {isPending && (
                          <>
                            <button
                              onClick={() => { setRejectDialog(app); setRejectReason('') }}
                              className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all"
                              style={{ borderColor: '#FECACA', color: C.red, backgroundColor: '#FEF2F2' }}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEE2E2' }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}>
                              Reject
                            </button>
                            <button
                              onClick={() => approveApplication(app)}
                              disabled={isProc}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:opacity-80"
                              style={{ backgroundColor: C.limeDeep, color: '#fff' }}>
                              {isProc
                                ? <div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin"
                                       style={{ borderTopColor: '#fff' }} />
                                : <CheckCircle size={11} />}
                              Approve
                            </button>
                          </>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                                style={{ backgroundColor: '#F0FDF4', color: C.green }}>
                            ✅ Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                                style={{ backgroundColor: '#FEF2F2', color: C.red }}>
                            ❌ Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="px-6 py-3 shrink-0 flex items-center gap-5"
               style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.bg }}>
            <p className="text-[12px]" style={{ color: C.muted }}>
              Total: <strong style={{ color: C.text }}>{applications.length}</strong>
            </p>
            <p className="text-[12px]" style={{ color: C.muted }}>
              Pending: <strong style={{ color: '#92400E' }}>{pending}</strong>
            </p>
            <p className="text-[12px]" style={{ color: C.muted }}>
              Approved: <strong style={{ color: C.green }}>{approved}</strong>
            </p>
            <p className="text-[12px]" style={{ color: C.muted }}>
              Rejected: <strong style={{ color: C.red }}>{rejected}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ── Side Drawer — Detailed Review ── */}
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

            {/* Animation keyframes */}
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0.6; }
                to   { transform: translateX(0);    opacity: 1;   }
              }
              @keyframes fadeInOverlay {
                from { opacity: 0; }
                to   { opacity: 1; }
              }
            `}</style>

            {/* Dim background */}
            <div className="absolute inset-0"
                 style={{ backgroundColor: 'rgba(0,0,0,0.3)', animation: 'fadeInOverlay 0.25s ease' }}
                 onClick={() => setSelectedApp(null)} />

            {/* Drawer slides from right */}
            <div className="relative flex flex-col h-full w-full max-w-md"
                 style={{
                   backgroundColor: C.surface,
                   boxShadow:       '-8px 0 40px rgba(0,0,0,0.15)',
                   animation:       'slideInRight 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                 }}
                 onClick={e => e.stopPropagation()}>

              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 shrink-0"
                   style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedApp(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-70"
                    style={{ backgroundColor: C.bg }}>
                    <ChevronLeft size={16} style={{ color: C.muted }} />
                  </button>
                  <p className="text-[15px] font-bold" style={{ color: C.text }}>Application Details</p>
                </div>
                <button onClick={() => setSelectedApp(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-70"
                  style={{ backgroundColor: C.bg }}>
                  <X size={16} style={{ color: C.muted }} />
                </button>
              </div>

              {/* Drawer content — scrollable */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

                {/* Status badge */}
                <div className="flex justify-center">
                  {isPending && (
                    <span className="px-4 py-1.5 rounded-full text-[12px] font-bold"
                          style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                      ⏳ Pending Review
                    </span>
                  )}
                  {isApproved && (
                    <span className="px-4 py-1.5 rounded-full text-[12px] font-bold"
                          style={{ backgroundColor: '#F0FDF4', color: C.green }}>
                      ✅ Approved
                    </span>
                  )}
                  {isRejected && (
                    <span className="px-4 py-1.5 rounded-full text-[12px] font-bold"
                          style={{ backgroundColor: '#FEF2F2', color: C.red }}>
                      ❌ Rejected{app.rejection_reason ? ` — ${app.rejection_reason}` : ''}
                    </span>
                  )}
                </div>

                {/* Avatar + name */}
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: C.dark }}>
                    <span className="text-[24px] font-bold" style={{ color: C.lime }}>
                      {app.full_name[0].toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[18px] font-bold" style={{ color: C.text }}>{app.full_name}</p>
                  <p className="text-[13px]" style={{ color: C.muted }}>
                    Applied {formatDate(app.created_at)}
                  </p>
                </div>

                {/* Personal info */}
                <div className="p-4 rounded-2xl" style={{ backgroundColor: C.bg }}>
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>
                    Personal Info
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      <Mail size={14} style={{ color: C.muted, flexShrink: 0 }} />
                      <p className="text-[13px]" style={{ color: C.text }}>{app.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={14} style={{ color: C.muted, flexShrink: 0 }} />
                      <p className="text-[13px]" style={{ color: C.text }}>{app.country}</p>
                    </div>
                  </div>
                </div>

                {/* Platform info */}
                <div className="p-4 rounded-2xl" style={{ backgroundColor: C.bg }}>
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>
                    Platform
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      {platform?.logo
                        ? <img src={platform.logo} alt="" className="w-5 h-5 rounded object-contain shrink-0"
                               onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        : <Globe size={14} style={{ color: C.muted }} />}
                      <p className="text-[13px] font-bold" style={{ color: C.text }}>
                        {platform?.label ?? app.platform}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <ExternalLink size={14} style={{ color: C.muted, flexShrink: 0, marginTop: 2 }} />
                      <a href={app.platform_url} target="_blank" rel="noreferrer"
                         className="text-[13px] break-all hover:underline"
                         style={{ color: C.limeDeep }}>
                        {app.platform_url}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full shrink-0"
                           style={{ backgroundColor: C.lime }} />
                      <p className="text-[13px]" style={{ color: C.text }}>{app.content_niche}</p>
                    </div>
                  </div>
                </div>

                {/* Message from applicant */}
                {app.message && (
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: C.bg }}>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-3"
                       style={{ color: C.muted }}>
                      Message from Applicant
                    </p>
                    <p className="text-[13px] leading-relaxed px-3 py-3 rounded-xl"
                       style={{
                         backgroundColor: C.surface,
                         color:           C.text,
                         border:          `1px solid ${C.border}`,
                         fontStyle:       'italic',
                       }}>
                      "{app.message}"
                    </p>
                  </div>
                )}

              </div>

              {/* Drawer footer — action buttons */}
              {isPending && (
                <div className="p-5 shrink-0 flex flex-col gap-2"
                     style={{ borderTop: `1px solid ${C.border}` }}>
                  <button
                    onClick={() => approveApplication(app)}
                    disabled={isProc}
                    className="w-full py-3 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ backgroundColor: C.limeDeep, color: '#fff' }}>
                    {isProc
                      ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                             style={{ borderTopColor: '#fff' }} />
                      : <CheckCircle size={16} />}
                    Approve & Create Affiliate
                  </button>
                  <button
                    onClick={() => { setRejectDialog(app); setRejectReason('') }}
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

      {/* Reject Dialog */}
      {rejectDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={e => e.target === e.currentTarget && setRejectDialog(null)}>
          <div className="bg-white rounded-2xl border p-6 w-full max-w-sm"
               style={{ borderColor: C.border }}>
            <p className="text-[15px] font-bold mb-1" style={{ color: C.text }}>
              Reject Application
            </p>
            <p className="text-[12px] mb-4" style={{ color: C.muted }}>
              {rejectDialog.full_name} · {rejectDialog.email}
            </p>
            <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
              Reason (optional)
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Content not related to eBay selling, platform not active..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl text-[13px] resize-none outline-none mb-4"
              style={{ border: `1.5px solid ${C.border}`, color: C.text, backgroundColor: C.bg }}
              onFocus={e => { e.target.style.borderColor = C.lime; e.target.style.boxShadow = '0 0 0 3px rgba(143,255,0,0.15)' }}
              onBlur={e =>  { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
            />
            <div className="flex gap-2">
              <button onClick={() => setRejectDialog(null)}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold transition-all"
                style={{ borderColor: C.border, color: C.muted, backgroundColor: '#fff' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = '#FECACA' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border }}>
                Cancel
              </button>
              <button onClick={() => rejectApplication(rejectDialog, rejectReason)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold"
                style={{ backgroundColor: C.red, color: '#fff' }}>
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}