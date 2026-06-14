'use client'

export const dynamic = 'force-dynamic'

// app/team/accept/page.tsx
// ─────────────────────────────────────────────────────────────
// Freelancer clicks invite link → lands here
// Shows invite details → [Accept & Join] button
// Redirects to dashboard after accepting
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Shield, Users, CheckCircle, AlertTriangle, Eye, ShieldCheck, Zap } from 'lucide-react'

const ROLE_CFG: Record<string, { label:string; desc:string; Icon:React.ElementType; color:string; bg:string }> = {
  viewer: {
    label: 'Viewer',
    desc:  'Can view orders and tools — cannot make changes',
    Icon:  Eye,
    color: '#1d70f5',
    bg:    '#EFF6FF',
  },
  order_manager: {
    label: 'Order Manager',
    desc:  'Can view and manage orders — cannot change settings',
    Icon:  ShieldCheck,
    color: '#4a8f00',
    bg:    '#f4ffe6',
  },
  full_access: {
    label: 'Full Access',
    desc:  'Full access to all tools — cannot see billing',
    Icon:  Zap,
    color: '#8b5cf6',
    bg:    '#F5F3FF',
  },
}

type State = 'loading' | 'found' | 'error' | 'accepted' | 'needs_login'

function AcceptInvitePageInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')
  const supabase     = createClient()

  const [state,     setState]     = useState<State>('loading')
  const [invite,    setInvite]    = useState<any>(null)
  const [ownerName, setOwnerName] = useState('')
  const [error,     setError]     = useState('')
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    async function load() {
      if (!token) { setState('error'); setError('No invite token found in the link.'); return }
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: inv } = await (supabase.from('team_invites') as any)
          .select('*, owner:owner_id(name, email, avatar_url)')
          .eq('token', token)
          .eq('status', 'pending')
          .single()

        if (!inv) { setState('error'); setError('This invite link is invalid, already used, or has expired.'); return }
        if (new Date(inv.expires_at) < new Date()) {
          setState('error')
          setError('This invite has expired. Ask the owner to send a new invite.')
          return
        }

        setInvite(inv)
        setOwnerName(inv.owner?.name ?? inv.owner?.email?.split('@')[0] ?? 'Someone')
        if (!user) {
          setState('needs_login')
        } else {
          setState('found')
        }
      } catch (e) {
        setState('error')
        setError('Something went wrong loading the invite.')
      }
    }
    load()
  }, [token])

  async function handleAccept() {
    setAccepting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/team/accept', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ inviteToken: token }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setState('accepted')
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (e: any) {
      setState('error')
      setError(e.message ?? 'Failed to accept invite')
    }
    setAccepting(false)
  }

  const rc = invite ? (ROLE_CFG[invite.role] ?? ROLE_CFG.viewer) : null

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ backgroundColor: '#F4F7FA' }}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: '#8fff00' }}>
            <Shield size={20} className="text-black" />
          </div>
          <span className="text-[22px] font-extrabold text-[#0a0d08]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Riazify
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden"
             style={{ border: '1px solid #e8ede2' }}>

          {/* LOADING */}
          {state === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-12 h-12 rounded-full border-4 border-transparent animate-spin mb-4"
                   style={{ borderTopColor: '#4a8f00' }} />
              <p className="text-[14px]" style={{ color: '#6b7280' }}>Loading invite...</p>
            </div>
          )}

          {/* ERROR */}
          {state === 'error' && (
            <div className="flex flex-col items-center text-center py-12 px-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                   style={{ backgroundColor: '#FEF2F2' }}>
                <AlertTriangle size={24} style={{ color: '#b91c1c' }} />
              </div>
              <h2 className="text-[18px] font-bold mb-2" style={{ color: '#0a0d08' }}>Invite Not Found</h2>
              <p className="text-[13px] mb-6" style={{ color: '#6b7280' }}>{error}</p>
              <button onClick={() => router.push('/dashboard')}
                className="px-6 py-2.5 rounded-xl text-[13px] font-bold"
                style={{ backgroundColor: '#0a0d08', color: '#8fff00' }}>
                Go to Dashboard
              </button>
            </div>
          )}

          {/* NEEDS LOGIN */}
          {state === 'needs_login' && invite && rc && (
            <div className="py-10 px-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                     style={{ backgroundColor: '#f4ffe6' }}>
                  <Users size={26} style={{ color: '#4a8f00' }} />
                </div>
                <h2 className="text-[20px] font-black mb-1" style={{ color: '#0a0d08' }}>You have been invited!</h2>
                <p className="text-[14px]" style={{ color: '#6b7280' }}>
                  <strong style={{ color: '#0a0d08' }}>{ownerName}</strong> invited you to manage their Riazify account
                </p>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl border mb-6"
                   style={{ backgroundColor: rc.bg, borderColor: rc.color + '40' }}>
                <rc.Icon size={20} style={{ color: rc.color }} />
                <div>
                  <p className="text-[14px] font-bold" style={{ color: rc.color }}>{rc.label}</p>
                  <p className="text-[11px]" style={{ color: '#6b7280' }}>{rc.desc}</p>
                </div>
              </div>
              <p className="text-[13px] text-center mb-4" style={{ color: '#6b7280' }}>
                Log in or create an account with <strong>{invite.email}</strong> to accept
              </p>
              <button onClick={() => router.push(`/auth/login?returnUrl=${encodeURIComponent(`/team/accept?token=${token}`)}`)}
                className="w-full py-3 rounded-2xl text-[14px] font-bold"
                style={{ backgroundColor: '#0a0d08', color: '#8fff00' }}>
                Log In to Accept
              </button>
            </div>
          )}

          {/* FOUND */}
          {state === 'found' && invite && rc && (
            <div className="py-10 px-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-[22px] font-black text-white"
                     style={{ backgroundColor: '#8b5cf6' }}>
                  {ownerName.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-[20px] font-black mb-1" style={{ color: '#0a0d08' }}>Team Invitation</h2>
                <p className="text-[14px]" style={{ color: '#6b7280' }}>
                  <strong style={{ color: '#0a0d08' }}>{ownerName}</strong> has invited you to join their team on Riazify
                </p>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl border mb-2"
                   style={{ backgroundColor: rc.bg, borderColor: rc.color + '40' }}>
                <rc.Icon size={20} style={{ color: rc.color }} />
                <div>
                  <p className="text-[14px] font-bold" style={{ color: rc.color }}>Your Role: {rc.label}</p>
                  <p className="text-[11px]" style={{ color: '#6b7280' }}>{rc.desc}</p>
                </div>
              </div>
              <p className="text-[11px] text-center mb-6" style={{ color: '#9ca3af' }}>
                You will be able to access {ownerName}&apos;s account anytime from your dashboard
              </p>
              <button onClick={handleAccept} disabled={accepting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-bold mb-3 disabled:opacity-50"
                style={{ backgroundColor: '#0a0d08', color: '#8fff00' }}>
                {accepting
                  ? <div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#8fff00' }} />
                  : <><CheckCircle size={16} /> Accept &amp; Join Team</>}
              </button>
              <button onClick={() => router.push('/dashboard')}
                className="w-full py-3 rounded-2xl text-[14px] font-semibold"
                style={{ backgroundColor: '#f7f9f5', color: '#6b7280' }}>
                Decline
              </button>
            </div>
          )}

          {/* ACCEPTED */}
          {state === 'accepted' && (
            <div className="flex flex-col items-center text-center py-14 px-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                   style={{ backgroundColor: '#f4ffe6' }}>
                <CheckCircle size={30} style={{ color: '#4a8f00' }} />
              </div>
              <h2 className="text-[20px] font-black mb-2" style={{ color: '#0a0d08' }}>You are in!</h2>
              <p className="text-[14px] mb-2" style={{ color: '#6b7280' }}>
                You have joined <strong style={{ color: '#0a0d08' }}>{ownerName}</strong>&apos;s team
              </p>
              <p className="text-[12px]" style={{ color: '#9ca3af' }}>Redirecting to dashboard...</p>
              <div className="w-8 h-8 rounded-full border-4 border-transparent animate-spin mt-4"
                   style={{ borderTopColor: '#4a8f00' }} />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
export default function AcceptInvitePage() {
  return <Suspense><AcceptInvitePageInner /></Suspense>
}