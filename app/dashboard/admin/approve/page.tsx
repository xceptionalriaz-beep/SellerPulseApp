'use client'
// app/dashboard/admin/approve/page.tsx
// ══════════════════════════════════════════════════════════════
// Approval page for Kill All requests
// Admin clicks link in email → lands here → approve or reject
// ══════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

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
  red:      '#b91c1c',
  green:    '#16a34a',
  amber:    '#d97706',
}

function ApprovePageInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')
  const autoAction   = searchParams.get('action') // 'approve' | 'reject' from email link
  const supabase     = createClient()

  const [state,      setState]      = useState<'loading' | 'pending' | 'processing' | 'done' | 'error'>('loading')
  const [approval,   setApproval]   = useState<any>(null)
  const [result,     setResult]     = useState<any>(null)
  const [error,      setError]      = useState<string | null>(null)
  const [timeLeft,   setTimeLeft]   = useState<string>('')

  useEffect(() => {
    if (token) loadApproval()
  }, [token])

  // Auto-action from email link
  useEffect(() => {
    if (autoAction && state === 'pending' && approval) {
      handleAction(autoAction as 'approve' | 'reject')
    }
  }, [autoAction, state, approval])

  // Countdown timer
  useEffect(() => {
    if (!approval?.expires_at) return
    const tick = setInterval(() => {
      const diff = new Date(approval.expires_at).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Expired'); clearInterval(tick); return }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${mins}m ${secs}s`)
    }, 1000)
    return () => clearInterval(tick)
  }, [approval])

  async function loadApproval() {
    try {
      const { data } = await (supabase.from('kill_switch_approvals') as any)
        .select('*').eq('token', token).single()
      if (!data) { setState('error'); setError('Approval request not found or expired.'); return }
      setApproval(data)
      if (data.status !== 'pending') {
        setState('done')
        setResult({ status: data.status, message: `This request was already ${data.status}.` })
      } else {
        setState('pending')
      }
    } catch {
      setState('error')
      setError('Failed to load approval request.')
    }
  }

  async function handleAction(action: 'approve' | 'reject') {
    setState('processing')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/kill-switches/approve', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ token, action }),
      })
      const json = await res.json()
      if (!res.ok) { setState('error'); setError(json.error); return }
      setState('done')
      setResult({ status: action === 'approve' ? 'approved' : 'rejected', killed: json.killed, message: json.message })
    } catch {
      setState('error')
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ backgroundColor: C.bg }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: C.dark }}>
            <Shield size={20} style={{ color: C.lime }} />
          </div>
          <span className="text-[22px] font-extrabold" style={{ color: C.dark }}>Riazify</span>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl"
             style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>

          {/* Loading */}
          {state === 'loading' && (
            <div className="flex flex-col items-center py-16 px-6 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-transparent animate-spin"
                   style={{ borderTopColor: C.limeDeep }} />
              <p style={{ color: C.muted }}>Loading request...</p>
            </div>
          )}

          {/* Pending — show approval form */}
          {state === 'pending' && approval && (
            <>
              <div style={{ backgroundColor: C.red, padding: '24px 32px' }}>
                <p style={{ margin: 0, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                  Approval Required
                </p>
                <h1 style={{ margin: '8px 0 0', color: '#fff', fontSize: 22, fontWeight: 900 }}>
                  Kill All Switches
                </h1>
              </div>
              <div className="p-8 flex flex-col gap-4">
                <div className="flex flex-col gap-3 p-4 rounded-2xl border"
                     style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <div className="flex justify-between">
                    <span style={{ color: C.muted, fontSize: 13 }}>Requested by</span>
                    <span style={{ color: C.dark, fontSize: 13, fontWeight: 700 }}>{approval.requester_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: C.muted, fontSize: 13 }}>Reason</span>
                    <span style={{ color: C.dark, fontSize: 13, fontStyle: 'italic' }}>"{approval.reason}"</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: C.muted, fontSize: 13 }}>Expires in</span>
                    <span className="flex items-center gap-1" style={{ color: C.amber, fontSize: 13, fontWeight: 700 }}>
                      <Clock size={13} /> {timeLeft || 'Calculating...'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border"
                     style={{ backgroundColor: 'rgba(185,28,28,0.04)', borderColor: 'rgba(185,28,28,0.2)' }}>
                  <p style={{ margin: 0, fontSize: 12, color: C.red }}>
                    Approving will immediately disable ALL tools for ALL users.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handleAction('reject')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-[14px] hover:opacity-80"
                    style={{ backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}` }}>
                    <XCircle size={16} /> Reject
                  </button>
                  <button onClick={() => handleAction('approve')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-[14px] hover:opacity-80"
                    style={{ backgroundColor: C.red, color: '#fff' }}>
                    <CheckCircle size={16} /> Approve Kill All
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Processing */}
          {state === 'processing' && (
            <div className="flex flex-col items-center py-16 px-6 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-transparent animate-spin"
                   style={{ borderTopColor: C.red }} />
              <p style={{ color: C.muted }}>Processing...</p>
            </div>
          )}

          {/* Done */}
          {state === 'done' && result && (
            <div className="flex flex-col items-center py-12 px-6 gap-4 text-center">
              {result.status === 'approved' ? (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                    <CheckCircle size={32} style={{ color: C.red }} />
                  </div>
                  <h2 style={{ color: C.dark, fontSize: 20, fontWeight: 900 }}>Kill All Approved</h2>
                  <p style={{ color: C.muted, fontSize: 14 }}>
                    {result.killed > 0 ? `${result.killed} switches are now offline.` : result.message ?? 'Done.'}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: C.limeTint }}>
                    <XCircle size={32} style={{ color: C.limeDeep }} />
                  </div>
                  <h2 style={{ color: C.dark, fontSize: 20, fontWeight: 900 }}>Request Rejected</h2>
                  <p style={{ color: C.muted, fontSize: 14 }}>
                    {result.message ?? 'The Kill All request has been rejected.'}
                  </p>
                </>
              )}
              <button onClick={() => router.push('/dashboard/admin')}
                className="mt-2 px-6 py-3 rounded-2xl font-bold text-[14px]"
                style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                Go to Admin Panel
              </button>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="flex flex-col items-center py-12 px-6 gap-4 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                <AlertTriangle size={32} style={{ color: C.red }} />
              </div>
              <h2 style={{ color: C.dark, fontSize: 20, fontWeight: 900 }}>Something went wrong</h2>
              <p style={{ color: C.muted, fontSize: 14 }}>{error}</p>
              <button onClick={() => router.push('/dashboard/admin')}
                className="mt-2 px-6 py-3 rounded-2xl font-bold text-[14px]"
                style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                Go to Admin Panel
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function ApprovePage() {
  return <Suspense><ApprovePageInner /></Suspense>
}
