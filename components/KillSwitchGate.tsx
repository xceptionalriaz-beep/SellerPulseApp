'use client'
// components/KillSwitchGate.tsx
// ══════════════════════════════════════════════════════════════
// Wraps any tool page with a kill switch check
// If the switch is OFF → shows maintenance screen
// If the switch is ON  → renders children normally
// Usage:
//   <KillSwitchGate switchTitle="Title Builder">
//     <YourToolPage />
//   </KillSwitchGate>
// ══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { ShieldOff, RefreshCw, Clock } from 'lucide-react'

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
}

interface Props {
  switchTitle: string
  children:    React.ReactNode
}

export default function KillSwitchGate({ switchTitle, children }: Props) {
  const supabase = createClient()
  const [status,  setStatus]  = useState<'loading' | 'online' | 'offline'>('loading')
  const [note,    setNote]    = useState<string | null>(null)
  const [checking,setChecking]= useState(false)

  async function checkSwitch() {
    try {
      const { data } = await (supabase
        .from('kill_switches') as any)
        .select('is_enabled, change_note')
        .eq('title', switchTitle)
        .single()

      if (!data) {
        setStatus('online')
        return
      }
      setStatus((data as any).is_enabled ? 'online' : 'offline')
      setNote((data as any).change_note ?? null)
    } catch {
      // If check fails — allow access (fail open)
      setStatus('online')
    }
  }

  useEffect(() => { checkSwitch() }, [switchTitle])

  // Loading state — subtle spinner, not full page block
  if (status === 'loading') return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
           style={{ borderTopColor: C.limeDeep }} />
    </div>
  )

  // Online — render tool normally
  if (status === 'online') return <>{children}</>

  // Offline — maintenance screen
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4">
      <div className="flex flex-col items-center gap-5 max-w-md w-full text-center">

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
             style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
          <ShieldOff size={36} style={{ color: C.red }} />
        </div>

        {/* Title */}
        <div>
          <p className="text-[22px] font-black mb-2" style={{ color: C.dark }}>
            {switchTitle} Unavailable
          </p>
          <p className="text-[14px]" style={{ color: C.muted }}>
            This feature has been temporarily disabled by the admin team.
            We are working to restore it as quickly as possible.
          </p>
        </div>

        {/* Reason note if available */}
        {note && (
          <div className="w-full px-4 py-3 rounded-2xl border"
               style={{ backgroundColor: 'rgba(185,28,28,0.04)', borderColor: 'rgba(185,28,28,0.2)' }}>
            <p className="text-[11px] font-black tracking-wider mb-1" style={{ color: C.red }}>
              ADMIN NOTE
            </p>
            <p className="text-[13px]" style={{ color: C.muted }}>"{note}"</p>
          </div>
        )}

        {/* What to do */}
        <div className="w-full flex flex-col gap-2 px-4 py-3 rounded-2xl border"
             style={{ backgroundColor: C.bg, borderColor: C.border }}>
          <div className="flex items-center gap-2">
            <Clock size={13} style={{ color: C.muted }} />
            <p className="text-[12px]" style={{ color: C.muted }}>
              Check back in a few minutes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldOff size={13} style={{ color: C.muted }} />
            <p className="text-[12px]" style={{ color: C.muted }}>
              Contact support if this persists
            </p>
          </div>
        </div>

        {/* Retry button */}
        <button
          onClick={async () => { setChecking(true); await checkSwitch(); setChecking(false) }}
          disabled={checking}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
          style={{ backgroundColor: C.dark, color: C.lime }}>
          <RefreshCw size={14} style={{ animation: checking ? 'spin 0.8s linear infinite' : 'none' }} />
          {checking ? 'Checking...' : 'Check Again'}
        </button>

      </div>
    </div>
  )
}