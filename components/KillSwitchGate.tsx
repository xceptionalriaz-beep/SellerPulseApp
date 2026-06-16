'use client'
// components/KillSwitchGate.tsx
// ══════════════════════════════════════════════════════════════
// Wraps tool pages — shows maintenance screen if switch is OFF
// Fails open (allows access if DB check fails)
// Shows user_message if set, otherwise shows default message
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { ShieldOff, RefreshCw, Clock, MessageSquare } from 'lucide-react'

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
  amber:    '#d97706',
}

interface Props {
  switchTitle: string
  children:    React.ReactNode
}

interface SwitchState {
  is_enabled:   boolean
  is_read_only: boolean
  change_note:  string | null
  user_message: string | null
  updated_at:   string
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  <  1) return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function KillSwitchGate({ switchTitle, children }: Props) {
  const supabase                    = createClient()
  const [state,    setState]        = useState<SwitchState | null>(null)
  const [loading,  setLoading]      = useState(true)
  const [checking, setChecking]     = useState(false)
  const [dotCount, setDotCount]     = useState(0)
  const intervalRef                 = useRef<NodeJS.Timeout | null>(null)

  // Animate dots while loading
  useEffect(() => {
    const t = setInterval(() => setDotCount(d => (d + 1) % 4), 400)
    return () => clearInterval(t)
  }, [])

  async function checkSwitch() {
    try {
      const { data } = await (supabase.from('kill_switches') as any)
        .select('is_enabled, is_read_only, change_note, user_message, updated_at')
        .eq('title', switchTitle)
        .single()
      if (data) setState(data as SwitchState)
    } catch {
      // Fail open — if DB check fails, allow access
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  useEffect(() => {
    checkSwitch()
    // Re-check every 60 seconds
    intervalRef.current = setInterval(checkSwitch, 60000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [switchTitle])

  async function handleRetry() {
    setChecking(true)
    await checkSwitch()
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3"
           style={{ backgroundColor: C.bg }}>
        <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
             style={{ borderTopColor: C.limeDeep }} />
        <p className="text-[13px]" style={{ color: C.muted }}>
          Loading{'.'.repeat(dotCount)}
        </p>
      </div>
    )
  }

  // Tool is enabled — show children normally or with read-only banner
  if (!state || state.is_enabled) {
    if (state?.is_read_only) {
      return (
        <div className="flex flex-col h-full">
          {/* Read-only banner */}
          <div className="flex items-center justify-center gap-3 px-6 py-3 shrink-0"
               style={{ backgroundColor: '#d97706', borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
            <p className="text-[13px] font-black text-white tracking-wide text-center">
              READ-ONLY MODE — Viewing only · New actions are temporarily disabled
            </p>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
          </div>
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      )
    }
    return <>{children}</>
  }

  // Tool is disabled — show maintenance screen
  const offlineTime = timeAgo(state.updated_at)
  const userMsg     = state.user_message?.trim()
  const adminNote   = state.change_note?.trim()

  return (
    <div className="flex flex-col items-center justify-center h-full px-6"
         style={{ backgroundColor: C.bg }}>
      <div className="w-full max-w-md flex flex-col items-center gap-6">

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
             style={{ backgroundColor: 'rgba(185,28,28,0.08)', border: '2px solid rgba(185,28,28,0.2)' }}>
          <ShieldOff size={36} style={{ color: C.red }} />
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="text-[22px] font-black mb-1" style={{ color: C.dark }}>
            {switchTitle}
          </p>
          <p className="text-[14px] font-semibold" style={{ color: C.red }}>
            Temporarily Unavailable
          </p>
        </div>

        {/* User message or default */}
        <div className="w-full px-5 py-4 rounded-2xl border text-center"
             style={{ backgroundColor: C.surface, borderColor: C.border }}>
          {userMsg ? (
            <div className="flex flex-col items-center gap-2">
              <MessageSquare size={16} style={{ color: C.muted }} />
              <p className="text-[14px] leading-relaxed" style={{ color: C.text }}>
                {userMsg}
              </p>
            </div>
          ) : (
            <p className="text-[14px] leading-relaxed" style={{ color: C.muted }}>
              This tool is temporarily unavailable while we perform maintenance.
              Please check back shortly.
            </p>
          )}
        </div>

        {/* Status info */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl"
               style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2">
              <Clock size={13} style={{ color: C.muted }} />
              <p className="text-[12px]" style={{ color: C.muted }}>Offline since</p>
            </div>
            <p className="text-[12px] font-semibold" style={{ color: C.text }}>{offlineTime}</p>
          </div>

          {/* Admin note — only shown if no user message */}
          {!userMsg && adminNote && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                 style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
              <p className="text-[12px]" style={{ color: C.muted }}>Admin note</p>
              <p className="text-[12px] font-semibold italic truncate max-w-[200px]"
                 style={{ color: C.text }}>"{adminNote}"</p>
            </div>
          )}
        </div>

        {/* Check again button */}
        <button
          onClick={handleRetry}
          disabled={checking}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-[14px] disabled:opacity-50 transition-all hover:opacity-80"
          style={{ backgroundColor: C.dark, color: C.lime }}>
          <RefreshCw size={15} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Checking...' : 'Check Again'}
        </button>

        <p className="text-[11px] text-center" style={{ color: C.muted }}>
          Page refreshes automatically every 60 seconds
        </p>
      </div>
    </div>
  )
}