'use client'
// components/dashboard/AnnouncementBanner.tsx
// Shows admin broadcast announcements at top of dashboard

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
  const [loaded,        setLoaded]        = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch('/api/admin/broadcast', {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        })
        const data = await res.json()
        setAnnouncements(data.announcements ?? [])
        setLoaded(true)
      } catch {
        setLoaded(true)
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

    // Save dismissal to DB
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

  if (!loaded || announcements.length === 0) return null

  const ann = announcements[current]

  return (
    <div
      className="w-full transition-all duration-300"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(-10px)',
      }}>
      <div className="flex items-center gap-3 px-4 py-3"
           style={{
             backgroundColor: '#0a0d08',
             borderBottom:    '1px solid rgba(143,255,0,0.2)',
           }}>
        {/* Icon */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
             style={{ backgroundColor: 'rgba(143,255,0,0.15)' }}>
          <Megaphone size={14} style={{ color: '#8fff00' }} />
        </div>

        {/* Message */}
        <p className="flex-1 text-[13px] font-semibold min-w-0 truncate"
           style={{ color: '#ffffff' }}>
          {ann.message}
        </p>

        {/* Action link */}
        {ann.action_url && ann.action_text && (
          <a href={ann.action_url}
             className="flex items-center gap-1 px-3 py-1 rounded-lg text-[12px] font-bold shrink-0 hover:opacity-80 transition-opacity"
             style={{ backgroundColor: '#8fff00', color: '#0a0d08' }}>
            {ann.action_text}
            <ArrowRight size={12} />
          </a>
        )}

        {/* Multiple announcements indicator */}
        {announcements.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            {announcements.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ backgroundColor: i === current ? '#8fff00' : 'rgba(143,255,0,0.3)' }} />
            ))}
          </div>
        )}

        {/* Dismiss */}
        <button onClick={() => dismiss(ann.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70 transition-opacity shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <X size={13} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </button>
      </div>
    </div>
  )
}