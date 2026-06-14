'use client'
// components/TeamSwitcherBanner.tsx
// ─────────────────────────────────────────────────────────────
// Shows a lime banner when member is viewing an owner's account
// Add this to app/dashboard/layout.tsx
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { createClient }        from '@/lib/supabase'
import { Users, ArrowLeftRight, ChevronDown } from 'lucide-react'

export default function TeamSwitcherBanner() {
  const router   = useRouter()
  const supabase = createClient()

  const [profile,      setProfile]      = useState<any>(null)
  const [ownerProfile, setOwnerProfile] = useState<any>(null)
  const [myTeams,      setMyTeams]      = useState<any[]>([])
  const [showMenu,     setShowMenu]     = useState(false)
  const [switching,    setSwitching]    = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await (supabase.from('profiles') as any)
        .select('*, active_team_owner:active_team_owner_id(id, name, email, avatar_url)')
        .eq('id', user.id)
        .single()

      setProfile(prof)

      if ((prof as any)?.active_team_owner_id) {
        setOwnerProfile((prof as any)?.active_team_owner)
      }

      // Load all teams I belong to
      const { data: teams } = await (supabase.from('team_members') as any)
        .select('*, owner:owner_id(id, name, email)')
        .eq('member_id', user.id)
        .eq('status', 'active')

      setMyTeams(teams ?? [])
    }
    load()
  }, [])

  async function switchTo(ownerId: string | null) {
    setSwitching(true)
    setShowMenu(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/team/switch', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ ownerId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      // Reload page to refresh all data
      router.refresh()
      window.location.reload()
    } catch (e: any) {
      console.error('Switch error:', e.message)
    }
    setSwitching(false)
  }

  // Don't show if:
  // 1. Profile not loaded yet
  // 2. Not viewing anyone's account AND has no teams to switch to
  const isViewing  = !!(profile as any)?.active_team_owner_id
  const hasTeams   = myTeams.length > 0

  if (!profile || (!isViewing && !hasTeams)) return null

  const ownerName = ownerProfile?.name
    ?? ownerProfile?.email?.split('@')[0]
    ?? 'Team Account'

  return (
    <div className="relative">
      {/* Banner */}
      <div className="flex items-center justify-between px-4 py-2"
           style={{
             backgroundColor: isViewing ? '#0a0d08' : '#f4ffe6',
             borderBottom:    `1px solid ${isViewing ? '#8fff00' : '#4a8f00'}`,
           }}>
        <div className="flex items-center gap-2">
          <Users size={14} style={{ color: isViewing ? '#8fff00' : '#4a8f00' }} />
          <span className="text-[12px] font-bold"
                style={{ color: isViewing ? '#8fff00' : '#4a8f00' }}>
            {isViewing
              ? `Viewing: ${ownerName}'s Account`
              : 'You have team access'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch back button (when viewing someone's account) */}
          {isViewing && (
            <button
              onClick={() => switchTo(null)}
              disabled={switching}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold hover:opacity-80"
              style={{ backgroundColor: 'rgba(143,255,0,0.15)', color: '#8fff00' }}>
              {switching
                ? <div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin"
                       style={{ borderTopColor: '#8fff00' }} />
                : <><ArrowLeftRight size={11} /> My Account</>}
            </button>
          )}

          {/* Switch to another account dropdown */}
          {hasTeams && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(s => !s)}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold hover:opacity-80"
                style={{
                  backgroundColor: isViewing ? 'rgba(143,255,0,0.1)' : 'rgba(74,143,0,0.1)',
                  color:           isViewing ? '#8fff00'              : '#4a8f00',
                }}>
                Switch <ChevronDown size={11} />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-2xl border shadow-xl overflow-hidden"
                       style={{ borderColor: '#e8ede2', minWidth: 220 }}>

                    {/* Own account option */}
                    <button
                      onClick={() => switchTo(null)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                      style={{ borderBottom: '1px solid #e8ede2' }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-bold text-white"
                           style={{ backgroundColor: '#4a8f00' }}>
                        Me
                      </div>
                      <div>
                        <p className="text-[13px] font-bold" style={{ color: '#0a0d08' }}>
                          My Account
                        </p>
                        <p className="text-[10px]" style={{ color: '#6b7280' }}>Your personal workspace</p>
                      </div>
                      {!isViewing && (
                        <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: '#4a8f00' }} />
                      )}
                    </button>

                    {/* Team accounts */}
                    {myTeams.map(t => {
                      const owner    = t.owner ?? {}
                      const name     = owner.name ?? owner.email?.split('@')[0] ?? 'Account'
                      const initials = name.slice(0, 2).toUpperCase()
                      const active   = (profile as any)?.active_team_owner_id === t.owner_id
                      return (
                        <button key={t.id}
                          onClick={() => switchTo(t.owner_id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-bold text-white"
                               style={{ backgroundColor: '#8b5cf6' }}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold" style={{ color: '#0a0d08' }}>{name}</p>
                            <p className="text-[10px]" style={{ color: '#6b7280' }}>
                              {t.role === 'order_manager' ? 'Order Manager'
                                : t.role === 'full_access' ? 'Full Access' : 'Viewer'}
                            </p>
                          </div>
                          {active && (
                            <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}