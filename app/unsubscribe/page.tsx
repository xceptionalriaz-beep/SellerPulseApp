// app/unsubscribe/page.tsx
'use client'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  bg:       '#f7f9f5',
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
    <div style={{ backgroundColor: C.dark, borderRadius: 24, border: '1px solid rgba(143,255,0,0.2)', padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, textDecoration: 'none' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>Riazify</span>
      </Link>

      {!email && (
        <>
          <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Invalid link</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>This unsubscribe link is missing the email address. Please use the link from your email.</p>
          <Link href="/blog" style={{ display: 'inline-block', backgroundColor: C.dark, color: C.lime, fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 12, textDecoration: 'none' }}>← Back to Blog</Link>
        </>
      )}

      {status === 'loading' && (
        <>
          <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: C.limeTint, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.limeDeep} strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Unsubscribing...</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Please wait a moment.</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: C.limeTint, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.limeDeep} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8 }}>You've been unsubscribed</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
            <strong style={{ color: C.lime }}>{email}</strong> has been removed from the Riazify Blog newsletter.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>You won't receive any more emails from us. You can resubscribe anytime from the blog.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/blog" style={{ display: 'block', backgroundColor: C.dark, color: C.lime, fontWeight: 700, fontSize: 13, padding: '12px 24px', borderRadius: 12, textDecoration: 'none' }}>← Back to Blog</Link>
            <button onClick={() => { fetch('/api/blog/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'resubscribe' }) }).then(() => setStatus('idle')) }}
              style={{ backgroundColor: 'transparent', border: `1px solid ${C.border}`, color: C.muted, fontWeight: 600, fontSize: 13, padding: '12px 24px', borderRadius: 12, cursor: 'pointer' }}>
              Actually, resubscribe me
            </button>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>We couldn't process your request. Please try again.</p>
          <Link href="/blog" style={{ display: 'inline-block', backgroundColor: C.dark, color: C.lime, fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 12, textDecoration: 'none' }}>← Back to Blog</Link>
        </>
      )}
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f7f9f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <Suspense fallback={
        <div style={{ backgroundColor: C.dark, borderRadius: 24, border: '1px solid rgba(143,255,0,0.2)', padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <p style={{ color: '#8a9e78', fontSize: 14 }}>Loading...</p>
        </div>
      }>
        <UnsubscribeContent />
      </Suspense>
    </div>
  )
}