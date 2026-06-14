'use client'
// app/admin/view-as/page.tsx
// ─────────────────────────────────────────────────────────────
// Correctly extracts tokens from URL hash BEFORE any other
// Supabase client can consume them, then stores in sessionStorage
// (tab-isolated) so the admin's original tab is unaffected.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Users, X, AlertTriangle, RefreshCw } from 'lucide-react'

// ── Isolated client — sessionStorage only ─────────────────────
function makeIsolatedClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage:            typeof window !== 'undefined' ? window.sessionStorage : undefined,
        autoRefreshToken:   true,
        persistSession:     true,
        detectSessionInUrl: false, // we handle this manually below
      },
    }
  )
}

export default function ViewAsPage() {
  const [status,    setStatus]    = useState<'loading'|'ready'|'error'>('loading')
  const [userName,  setUserName]  = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [error,     setError]     = useState('')

  useEffect(() => {
    async function init() {
      try {
        // ── Step 1: Extract tokens from URL hash ──────────────
        // Supabase puts them after # like:
        // /admin/view-as#access_token=...&refresh_token=...
        const rawHash = window.location.hash.replace('#', '')
        const params  = new URLSearchParams(rawHash)

        const accessToken  = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        // ── Step 2: Clear hash immediately ────────────────────
        // Prevents the app's default Supabase client (localStorage)
        // from also consuming and storing these tokens
        window.history.replaceState(
          null, '',
          window.location.pathname + window.location.search
        )

        if (!accessToken || !refreshToken) {
          throw new Error(
            'Session tokens not found in URL.\n' +
            'The magic link may have expired (24hr limit)\n' +
            'or already been used once. Generate a new one.'
          )
        }

        // ── Step 3: Set session in isolated client ────────────
        const supabase = makeIsolatedClient()

        const { data, error: sessionErr } = await supabase.auth.setSession({
          access_token:  accessToken,
          refresh_token: refreshToken,
        })

        if (sessionErr) throw sessionErr
        if (!data.user)  throw new Error('Failed to establish session — no user returned')

        // ── Step 4: Load their profile name ───────────────────
        const name =
          data.user.user_metadata?.full_name ??
          data.user.user_metadata?.name ??
          data.user.email?.split('@')[0] ??
          'Unknown User'

        setUserName(name)
        setUserEmail(data.user.email ?? '')

        // ── Step 5: Mark tab as impersonation ─────────────────
        // So app's Supabase client can detect and use sessionStorage
        sessionStorage.setItem('__riazify_impersonating__', '1')

        setStatus('ready')

      } catch (e: any) {
        console.error('Impersonation error:', e)
        setError(e.message ?? 'Unknown error')
        setStatus('error')
      }
    }

    init()
  }, [])

  // ── Loading ────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-transparent animate-spin"
               style={{ borderTopColor: '#7c3aed' }} />
          <p className="text-sm font-semibold text-gray-500">
            Starting impersonation session...
          </p>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-5">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-sm w-full text-center">
          <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Impersonation Failed</h2>
          <p className="text-sm text-gray-500 whitespace-pre-line mb-4">{error}</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => window.close()}
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-700">
              Close Tab
            </button>
            <p className="text-xs text-gray-400">
              Go back to admin panel and generate a new impersonation link.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Ready — show banner + redirect ─────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* Purple admin banner */}
      <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between px-5 py-3"
           style={{ backgroundColor: '#7c3aed', boxShadow: '0 2px 16px rgba(124,58,237,0.5)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Users size={15} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-black text-white leading-tight">
              Admin Mode — Viewing as {userName}
            </p>
            <p className="text-[10px] text-purple-200">
              {userEmail} · Isolated session · Close this tab to exit
            </p>
          </div>
        </div>
        <button onClick={() => window.close()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-white/15 text-white hover:bg-white/25">
          <X size={12} /> Close & Exit
        </button>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 56 }}>
        <ImpersonationDashboard
          userName={userName}
          userEmail={userEmail}
        />
      </div>
    </div>
  )
}

// ── Auto-navigate to dashboard ─────────────────────────────────
function ImpersonationDashboard({
  userName, userEmail
}: { userName: string; userEmail: string }) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          window.location.href = '/dashboard'
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white rounded-2xl border border-purple-100 p-8 max-w-sm w-full text-center shadow-lg">
        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
          <Users size={28} style={{ color: '#7c3aed' }} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Session established
        </h2>
        <p className="text-sm text-gray-500 mb-1">
          You are now viewing as:
        </p>
        <p className="text-base font-bold mb-0.5" style={{ color: '#7c3aed' }}>
          {userName}
        </p>
        <p className="text-xs text-gray-400 mb-6">{userEmail}</p>
        <div className="flex items-center justify-center gap-2 mb-4">
          <RefreshCw size={14} className="animate-spin text-purple-400" />
          <p className="text-sm text-gray-500">
            Loading their dashboard in {countdown}...
          </p>
        </div>
        <button
          onClick={() => { window.location.href = '/dashboard' }}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: '#7c3aed' }}>
          Go Now
        </button>
      </div>
    </div>
  )
}