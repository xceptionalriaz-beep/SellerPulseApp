'use client'
// components/dashboard/AnnouncementBanner.tsx

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { X, Megaphone, ArrowRight } from 'lucide-react'

interface Announcement {
  id:          string
  message:     string
  action_url:  string | null
  action_text: string | null
  target:      string
}

export default function AnnouncementBanner() {
  const supabase = createClient()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [current,       setCurrent]       = useState(0)
  const [visible,       setVisible]       = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Wait for auth to be ready
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get user plan
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('plan_name')
          .eq('id', user.id)
          .single()

        const plan = ((profile as any)?.plan_name ?? '').toLowerCase()

        // Get active non-expired announcements
        const now = new Date().toISOString()
        const { data: all } = await (supabase.from('announcements') as any)
          .select('*')
          .eq('is_active', true)
          .gt('expires_at', now)
          .order('created_at', { ascending: false })

        if (!all || all.length === 0) return

        // Get dismissed announcements
        const { data: dismissed } = await (supabase.from('announcement_dismissals') as any)
          .select('announcement_id')
          .eq('user_id', user.id)

        const dismissedIds = new Set((dismissed ?? []).map((d: any) => d.announcement_id))

        // Filter by target and not dismissed
        const filtered = all.filter((a: any) => {
          if (dismissedIds.has(a.id)) return false
          if (a.target === 'all')     return true
          if (a.target === 'starter') return plan === 'starter'
          if (a.target === 'growth')  return plan === 'growth'
          if (a.target === 'custom')  return plan === 'custom'
          if (a.target === 'free')    return plan === 'free' || plan === 'free trial'
          return true
        })

        setAnnouncements(filtered)
      } catch (e) {
        console.error('[AnnouncementBanner]', e)
      }
    }
    load()
  }, [])

  async function dismiss(id: string) {
    setVisible(false)
    setTimeout(() => {
      setAnnouncements(prev => {
        const next = prev.filter(a => a.id !== id)
        setCurrent(0)
        return next
      })
      setVisible(true)
    }, 300)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await (supabase.from('announcement_dismissals') as any).insert({
        user_id:         user.id,
        announcement_id: id,
        dismissed_at:    new Date().toISOString(),
      })
    } catch { /* non-critical */ }
  }

  if (announcements.length === 0) return null

  const ann = announcements[current]

  return (
    <div
      className="w-full transition-all duration-300"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-10px)',
      }}>
      <div className="flex items-center gap-3 px-4 py-2.5"
           style={{
             backgroundColor: '#8fff00',
             borderBottom:    '2px solid #4a8f00',
           }}>
        {/* Icon */}
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
             style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <Megaphone size={12} style={{ color: '#0a0d08' }} />
        </div>

        {/* Message */}
        <p className="flex-1 text-[13px] font-semibold min-w-0 text-center"
           style={{ color: '#0a0d08' }}>
          {ann.message}
        </p>

        {/* Action link */}
        {ann.action_url && ann.action_text && (
          <a href={ann.action_url}
             className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold shrink-0 hover:opacity-80"
             style={{ backgroundColor: '#0a0d08', color: '#8fff00' }}>
            {ann.action_text}
            <ArrowRight size={11} />
          </a>
        )}

        {/* Multiple indicators */}
        {announcements.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            {announcements.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ backgroundColor: i === current ? '#0a0d08' : 'rgba(0,0,0,0.3)' }} />
            ))}
          </div>
        )}

        {/* Dismiss */}
        <button onClick={() => dismiss(ann.id)}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:opacity-70 shrink-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <X size={12} style={{ color: '#0a0d08' }} />
        </button>
      </div>
    </div>
  )
}
