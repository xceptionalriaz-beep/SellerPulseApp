// app/unsubscribe/page.tsx
'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Activity, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

// -- Riazify Color Role Tokens (v2.0) ---------------------------
const T = {
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

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle')

  useEffect(() => {
    if (!email) return
    setStatus('loading')
    fetch('/api/blog/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(r => r.json())
      .then(d => setStatus(d.success ? 'success' : 'error'))
      .catch(() => setStatus('error'))
  }, [email])

  return (
    <div
      className="rounded-3xl border p-8 sm:p-12 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
      style={{
        backgroundColor: T.dark,
        borderColor: T.borderDark,
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'rgba(117,48,251,0.25)',
          pointerEvents: 'none',
        }}
      />

      {/* Brand Header */}
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 mb-8 text-decoration-none transition-transform hover:scale-105"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
          style={{ backgroundColor: T.primary }}
        >
          <Activity size={18} style={{ color: T.accent }} />
        </div>
        <span className="text-[22px] font-black font-syne text-white tracking-tight">
          Riazify
        </span>
      </Link>

      {/* ── 1. INVALID LINK STATE ── */}
      {!email && (
        <div className="relative z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border"
            style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
          >
            <AlertCircle size={28} style={{ color: '#dc2626' }} />
          </div>
          <h1 className="text-[22px] font-black font-syne text-white mb-2 tracking-tight">
            Invalid Link
          </h1>
          <p className="text-[14px] leading-relaxed mb-6" style={{ color: T.textLight }}>
            This unsubscribe link is missing the subscriber email address. Please click the direct unsubscribe link inside your newsletter email.
          </p>
          <Link
            href="/blog"
            className="inline-block px-7 py-3 rounded-xl font-black text-[13px] transition-all hover:scale-105 shadow-sm"
            style={{ backgroundColor: T.accent, color: T.dark }}
          >
            ← Return to Blog
          </Link>
        </div>
      )}

      {/* ── 2. LOADING STATE ── */}
      {status === 'loading' && (
        <div className="relative z-10 py-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border shadow-sm"
            style={{ backgroundColor: 'rgba(117,48,251,0.2)', borderColor: T.primary }}
          >
            <RefreshCw size={26} style={{ color: T.accent }} className="animate-spin" />
          </div>
          <h1 className="text-[22px] font-black font-syne text-white mb-2 tracking-tight">
            Unsubscribing...
          </h1>
          <p className="text-[14px] font-medium" style={{ color: T.textLight }}>
            Updating your newsletter preferences across our clusters.
          </p>
        </div>
      )}

      {/* ── 3. SUCCESS STATE ── */}
      {status === 'success' && (
        <div className="relative z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border shadow-sm"
            style={{ backgroundColor: 'rgba(184,250,51,0.12)', borderColor: 'rgba(184,250,51,0.3)' }}
          >
            <CheckCircle2 size={30} style={{ color: T.accent }} />
          </div>
          <h1 className="text-[22px] font-black font-syne text-white mb-2 tracking-tight">
            You&apos;ve Been Unsubscribed
          </h1>
          <p className="text-[14px] leading-relaxed mb-2" style={{ color: T.textLight }}>
            <strong style={{ color: T.accent }}>{email}</strong> has been removed from the Riazify newsletter list.
          </p>
          <p className="text-[13px] leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
            You will no longer receive weekly eBay intelligence digests. You can resubscribe anytime on our blog.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/blog"
              className="w-full py-3.5 rounded-xl font-black text-[13px] transition-all hover:scale-[1.02] shadow-sm"
              style={{ backgroundColor: T.accent, color: T.dark }}
            >
              ← Back to Blog
            </Link>
            <button
              onClick={() => {
                fetch('/api/blog/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, source: 'resubscribe' }),
                }).then(() => setStatus('idle'))
              }}
              className="w-full py-3 rounded-xl font-bold text-[12.5px] border transition-colors hover:bg-[#271c42] cursor-pointer"
              style={{ borderColor: T.borderDark, color: T.textLight }}
            >
              Accident? Resubscribe me
            </button>
          </div>
        </div>
      )}

      {/* ── 4. ERROR STATE ── */}
      {status === 'error' && (
        <div className="relative z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border"
            style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
          >
            <AlertCircle size={28} style={{ color: '#dc2626' }} />
          </div>
          <h1 className="text-[22px] font-black font-syne text-white mb-2 tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-[14px] leading-relaxed mb-6" style={{ color: T.textLight }}>
            We could not process your unsubscribe request right now. Please try again or reach out to support@riazify.com.
          </p>
          <Link
            href="/blog"
            className="inline-block px-7 py-3 rounded-xl font-black text-[13px] transition-all hover:scale-105 shadow-sm"
            style={{ backgroundColor: T.accent, color: T.dark }}
          >
            ← Return to Blog
          </Link>
        </div>
      )}
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: T.bg,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Suspense
        fallback={
          <div
            className="rounded-3xl border p-10 max-w-md w-full text-center shadow-xl"
            style={{ backgroundColor: T.dark, borderColor: T.borderDark }}
          >
            <p className="text-[14px] font-medium" style={{ color: T.textLight }}>
              Loading preferences...
            </p>
          </div>
        }
      >
        <UnsubscribeContent />
      </Suspense>
    </div>
  )
}
