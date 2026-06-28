'use client'
// app/unsubscribe/page.tsx
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Handles email unsubscribe requests
// Adds email to suppression list in DB
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Mail, Check, X } from 'lucide-react'

const T = {
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
}

function UnsubscribeInner() {
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') ?? ''

  const [state,   setState]   = useState<'confirm' | 'loading' | 'done' | 'error'>('confirm')
  const [resubscribed, setResubscribed] = useState(false)

  async function handleUnsubscribe() {
    if (!email) { setState('error'); return }
    setState('loading')
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      // Add to suppression list
      await (supabase.from('email_suppressions') as any).upsert({
        email:        email.toLowerCase(),
        reason:       'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      }, { onConflict: 'email' })

      // Cancel all pending queue emails for this address
      await (supabase.from('email_queue') as any)
        .update({ status: 'cancelled', error: 'User unsubscribed' })
        .eq('to_email', email.toLowerCase())
        .eq('status', 'pending')

      setState('done')
    } catch {
      setState('error')
    }
  }

  async function handleResubscribe() {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await (supabase.from('email_suppressions') as any)
        .delete().eq('email', email.toLowerCase())
      setResubscribed(true)
    } catch { /* silent */ }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ backgroundColor: T.bg }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: T.dark }}>
            <span style={{ color: T.lime, fontSize: 18, fontWeight: 900 }}>R</span>
          </div>
          <span className="text-[22px] font-extrabold" style={{ color: T.dark }}>Riazify</span>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl"
             style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>

          {/* Confirm state */}
          {state === 'confirm' && (
            <div className="flex flex-col items-center p-8 gap-5 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: T.limeTint }}>
                <Mail size={28} style={{ color: T.limeDeep }} />
              </div>
              <div>
                <h2 className="text-[20px] font-black mb-2" style={{ color: T.dark }}>
                  Unsubscribe from Riazify emails
                </h2>
                <p className="text-[13px]" style={{ color: T.muted }}>
                  You will no longer receive automated emails from Riazify at:
                </p>
                <p className="text-[14px] font-bold mt-1" style={{ color: T.dark }}>{email}</p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <button onClick={handleUnsubscribe}
                  className="w-full py-3 rounded-2xl text-[14px] font-bold"
                  style={{ backgroundColor: T.dark, color: T.lime }}>
                  Yes, unsubscribe me
                </button>
                <a href="/"
                  className="w-full py-3 rounded-2xl text-[14px] font-semibold text-center border"
                  style={{ borderColor: T.border, color: T.muted }}>
                  No, keep me subscribed
                </a>
              </div>
            </div>
          )}

          {/* Loading state */}
          {state === 'loading' && (
            <div className="flex flex-col items-center py-16 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-transparent animate-spin"
                   style={{ borderTopColor: T.limeDeep }} />
              <p style={{ color: T.muted }}>Processing your request...</p>
            </div>
          )}

          {/* Done state */}
          {state === 'done' && (
            <div className="flex flex-col items-center p-8 gap-5 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: T.limeTint }}>
                <Check size={28} style={{ color: T.limeDeep }} />
              </div>
              <div>
                <h2 className="text-[20px] font-black mb-2" style={{ color: T.dark }}>
                  You've been unsubscribed
                </h2>
                <p className="text-[13px]" style={{ color: T.muted }}>
                  We've removed <strong>{email}</strong> from our email list.
                  You won't receive any more automated emails from Riazify.
                </p>
              </div>
              {!resubscribed ? (
                <button onClick={handleResubscribe}
                  className="text-[12px] underline hover:opacity-70"
                  style={{ color: T.muted }}>
                  Changed your mind? Re-subscribe
                </button>
              ) : (
                <p className="text-[12px] font-bold" style={{ color: T.limeDeep }}>
                  You've been re-subscribed successfully
                </p>
              )}
              <a href="/dashboard"
                className="w-full py-3 rounded-2xl text-[14px] font-bold text-center"
                style={{ backgroundColor: T.dark, color: T.lime }}>
                Go to Dashboard
              </a>
            </div>
          )}

          {/* Error state */}
          {state === 'error' && (
            <div className="flex flex-col items-center p-8 gap-5 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                <X size={28} style={{ color: T.red }} />
              </div>
              <div>
                <h2 className="text-[20px] font-black mb-2" style={{ color: T.dark }}>
                  Something went wrong
                </h2>
                <p className="text-[13px]" style={{ color: T.muted }}>
                  We couldn't process your unsubscribe request.
                  Please try again or contact support.
                </p>
              </div>
              <button onClick={() => setState('confirm')}
                className="w-full py-3 rounded-2xl text-[14px] font-bold"
                style={{ backgroundColor: T.dark, color: T.lime }}>
                Try Again
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: T.muted }}>
          Riazify Â· eBay Seller Intelligence Platform
        </p>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return <Suspense><UnsubscribeInner /></Suspense>
}
