'use client'

export const dynamic = 'force-dynamic'

// app/team/accept/page.tsx
// ─────────────────────────────────────────────────────────────
// Operator clicks invite link → lands here
// Shows invite details → [Accept & Join Team] button
// Redirects to dashboard after accepting
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Activity, Users, CheckCircle2, AlertTriangle, Eye, ShieldCheck, Zap
} from 'lucide-react'

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

const ROLE_CFG: Record<string, { label: string; desc: string; Icon: React.ElementType; color: string; bg: string }> = {
  viewer: {
    label: 'Viewer',
    desc: 'Can view orders, listings and analytics — cannot modify records',
    Icon: Eye,
    color: '#2563eb',
    bg: '#eff6ff',
  },
  order_manager: {
    label: 'Order Manager',
    desc: 'Can manage orders & audits — cannot alter billing or global settings',
    Icon: ShieldCheck,
    color: T.primary,
    bg: T.primaryLight,
  },
  full_access: {
    label: 'Full Access',
    desc: 'Full execution access across all intelligence tools — billing restricted',
    Icon: Zap,
    color: '#7530fb',
    bg: '#f3eeff',
  },
}

type State = 'loading' | 'found' | 'error' | 'accepted' | 'needs_login'

function AcceptInvitePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const supabase = createClient()

  const [state, setState] = useState<State>('loading')
  const [invite, setInvite] = useState<any>(null)
  const [ownerName, setOwnerName] = useState('')
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    async function load() {
      if (!token) {
        setState('error')
        setError('No invite token found in the link.')
        return
      }
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: inv } = await (supabase.from('team_invites') as any)
          .select('*, owner:owner_id(name, email, avatar_url)')
          .eq('token', token)
          .eq('status', 'pending')
          .single()

        if (!inv) {
          setState('error')
          setError('This invite link is invalid, already claimed, or has been revoked.')
          return
        }
        if (new Date(inv.expires_at) < new Date()) {
          setState('error')
          setError('This invite has expired. Please ask the account owner to send a new invite.')
          return
        }

        setInvite(inv)
        setOwnerName(inv.owner?.name ?? inv.owner?.email?.split('@')[0] ?? 'An operator')
        if (!user) {
          setState('needs_login')
        } else {
          setState('found')
        }
      } catch (e) {
        setState('error')
        setError('Something went wrong loading the team invitation.')
      }
    }
    load()
  }, [token])

  async function handleAccept() {
    setAccepting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/team/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ inviteToken: token }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setState('accepted')
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (e: any) {
      setState('error')
      setError(e.message ?? 'Failed to accept invitation')
    }
    setAccepting(false)
  }

  const rc = invite ? (ROLE_CFG[invite.role] ?? ROLE_CFG.viewer) : null

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: T.bg }}
    >
      <div className="w-full max-w-md">

        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ backgroundColor: T.primary }}
          >
            <Activity size={20} style={{ color: T.accent }} />
          </div>
          <span className="text-[24px] font-black font-syne tracking-tight" style={{ color: T.textDark }}>
            Riazify
          </span>
        </div>

        <div
          className="rounded-3xl shadow-xl overflow-hidden border"
          style={{ backgroundColor: T.surface, borderColor: T.border }}
        >

          {/* ── 1. LOADING STATE ── */}
          {state === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div
                className="w-10 h-10 rounded-full border-3 border-transparent animate-spin mb-4"
                style={{ borderTopColor: T.primary }}
              />
              <p className="text-[14px] font-medium" style={{ color: T.muted }}>
                Verifying team invitation token...
              </p>
            </div>
          )}

          {/* ── 2. ERROR STATE ── */}
          {state === 'error' && (
            <div className="flex flex-col items-center text-center py-12 px-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border"
                style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
              >
                <AlertTriangle size={24} style={{ color: '#dc2626' }} />
              </div>
              <h2 className="text-[20px] font-black font-syne mb-2" style={{ color: T.textDark }}>
                Invitation Not Found
              </h2>
              <p className="text-[13.5px] leading-relaxed mb-6 max-w-xs" style={{ color: T.muted }}>
                {error}
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-7 py-3 rounded-xl text-[13px] font-black transition-transform hover:scale-105 cursor-pointer shadow-sm"
                style={{ backgroundColor: T.dark, color: T.accent }}
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* ── 3. NEEDS LOGIN STATE ── */}
          {state === 'needs_login' && invite && rc && (
            <div className="py-10 px-7">
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border shadow-xs"
                  style={{ backgroundColor: T.primaryLight, borderColor: T.border }}
                >
                  <Users size={24} style={{ color: T.primary }} />
                </div>
                <h2 className="text-[22px] font-black font-syne mb-1.5" style={{ color: T.textDark }}>
                  You Have Been Invited!
                </h2>
                <p className="text-[14px] leading-relaxed" style={{ color: T.muted }}>
                  <strong style={{ color: T.textDark }}>{ownerName}</strong> has invited you to collaborate on their Riazify eBay store workspace.
                </p>
              </div>

              <div
                className="flex items-center gap-3.5 p-4 rounded-2xl border mb-5 shadow-2xs"
                style={{ backgroundColor: rc.bg, borderColor: T.border }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{ backgroundColor: T.surface, borderColor: T.border }}
                >
                  <rc.Icon size={18} style={{ color: rc.color }} />
                </div>
                <div>
                  <p className="text-[14px] font-bold font-syne" style={{ color: rc.color }}>
                    Assigned Role: {rc.label}
                  </p>
                  <p className="text-[12px] leading-tight mt-0.5" style={{ color: T.muted }}>
                    {rc.desc}
                  </p>
                </div>
              </div>

              <p className="text-[12.5px] text-center mb-5 font-medium" style={{ color: T.muted }}>
                Sign in with <strong style={{ color: T.textDark }}>{invite.email}</strong> to accept and connect.
              </p>

              <button
                onClick={() => router.push(`/auth/login?returnUrl=${encodeURIComponent(`/team/accept?token=${token}`)}`)}
                className="w-full py-3.5 rounded-2xl text-[14px] font-black transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md"
                style={{ backgroundColor: T.accent, color: T.dark }}
              >
                Log In to Accept Invite
              </button>
            </div>
          )}

          {/* ── 4. FOUND & READY TO ACCEPT ── */}
          {state === 'found' && invite && rc && (
            <div className="py-10 px-7">
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-[20px] font-black text-white font-syne shadow-md"
                  style={{ backgroundColor: T.primary }}
                >
                  {ownerName.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-[22px] font-black font-syne mb-1.5" style={{ color: T.textDark }}>
                  Team Collaboration Invite
                </h2>
                <p className="text-[14px] leading-relaxed" style={{ color: T.muted }}>
                  <strong style={{ color: T.textDark }}>{ownerName}</strong> has invited you to join their operator workspace on Riazify.
                </p>
              </div>

              <div
                className="flex items-center gap-3.5 p-4 rounded-2xl border mb-3 shadow-2xs"
                style={{ backgroundColor: rc.bg, borderColor: T.border }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{ backgroundColor: T.surface, borderColor: T.border }}
                >
                  <rc.Icon size={18} style={{ color: rc.color }} />
                </div>
                <div>
                  <p className="text-[14px] font-bold font-syne" style={{ color: rc.color }}>
                    Your Role: {rc.label}
                  </p>
                  <p className="text-[12px] leading-tight mt-0.5" style={{ color: T.muted }}>
                    {rc.desc}
                  </p>
                </div>
              </div>

              <p className="text-[11.5px] text-center mb-6" style={{ color: T.muted }}>
                You will be able to switch into {ownerName}&apos;s workspace directly from your top navigation.
              </p>

              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-black mb-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-md"
                style={{ backgroundColor: T.accent, color: T.dark }}
              >
                {accepting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[#1e1535] border-t-transparent animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={17} className="stroke-[2.5]" />
                    <span>Accept &amp; Join Workspace</span>
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 rounded-2xl text-[13px] font-bold transition-colors hover:bg-[#ede9fe]/50 cursor-pointer border"
                style={{ backgroundColor: T.bg, borderColor: T.border, color: T.muted }}
              >
                Decline Invitation
              </button>
            </div>
          )}

          {/* ── 5. ACCEPTED STATE ── */}
          {state === 'accepted' && (
            <div className="flex flex-col items-center text-center py-14 px-7">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border shadow-sm"
                style={{ backgroundColor: T.primaryLight, borderColor: T.border }}
              >
                <CheckCircle2 size={32} style={{ color: T.primary }} />
              </div>
              <h2 className="text-[22px] font-black font-syne mb-2" style={{ color: T.textDark }}>
                You&apos;re Connected!
              </h2>
              <p className="text-[14px] mb-2 leading-relaxed" style={{ color: T.muted }}>
                You have successfully joined <strong style={{ color: T.textDark }}>{ownerName}</strong>&apos;s team.
              </p>
              <p className="text-[12px] font-medium" style={{ color: T.primary }}>
                Redirecting to your dashboard...
              </p>
              <div
                className="w-7 h-7 rounded-full border-3 border-transparent animate-spin mt-5"
                style={{ borderTopColor: T.primary }}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInvitePageInner />
    </Suspense>
  )
}
