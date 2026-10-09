'use client'
// components/dashboard/SupportModal.tsx
import { useState } from 'react'
import { X, Send, CheckCircle, Bug, HelpCircle, Lightbulb } from 'lucide-react'
import { createClient } from '@/lib/supabase'

type TicketType = 'bug' | 'question' | 'feature'

interface SupportModalProps {
  onClose: () => void
}

const TYPE_OPTIONS: { value: TicketType; label: string; icon: React.ElementType }[] = [
  { value: 'bug',      label: 'Bug Report',     icon: Bug        },
  { value: 'question', label: 'Question',        icon: HelpCircle },
  { value: 'feature',  label: 'Feature Request', icon: Lightbulb  },
]

export default function SupportModal({ onClose }: SupportModalProps) {
  const supabase = createClient()

  const [type,        setType]        = useState<TicketType>('bug')
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [success,     setSuccess]     = useState(false)
  const [error,       setError]       = useState('')

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) return
    setLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError('You must be logged in.'); setLoading(false); return }

      const res = await fetch('/api/tickets/create', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title, description, type }),
      })

      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Something went wrong.'); setLoading(false); return }

      setSuccess(true)
      setTimeout(() => onClose(), 3000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !loading

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-lg"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e8ede2' }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e8ede2' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#0a0d08' }}>
            Contact Support
          </span>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-gray-100" style={{ color: '#8a9e78' }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <CheckCircle size={48} style={{ color: '#4a8f00' }} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#0a0d08', textAlign: 'center' }}>
                Ticket submitted!
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8a9e78', textAlign: 'center' }}>
                We will get back to you soon.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#8a9e78', display: 'block', marginBottom: 8 }}>
                  TYPE
                </label>
                <div className="flex gap-2">
                  {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => {
                    const active = type === value
                    return (
                      <button
                        key={value}
                        onClick={() => setType(value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
                        style={{
                          fontFamily:      'Inter, sans-serif',
                          fontSize:        12,
                          fontWeight:      500,
                          backgroundColor: active ? '#0a0d08' : '#f4ffe6',
                          color:           active ? '#8fff00' : '#4a8f00',
                          border:          `1px solid ${active ? '#0a0d08' : '#e8ede2'}`,
                        }}
                      >
                        <Icon size={13} />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#8a9e78', display: 'block', marginBottom: 8 }}>
                  TITLE
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of your issue..."
                  className="w-full px-3 py-2.5 rounded-xl outline-none transition-all"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#0a0d08', backgroundColor: '#f9fdf4', border: '1px solid #e8ede2' }}
                  onFocus={(e) => { e.target.style.borderColor = '#8fff00' }}
                  onBlur={(e)  => { e.target.style.borderColor = '#e8ede2' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#8a9e78', display: 'block', marginBottom: 8 }}>
                  DETAILS
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more details..."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl outline-none transition-all resize-none"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#0a0d08', backgroundColor: '#f9fdf4', border: '1px solid #e8ede2' }}
                  onFocus={(e) => { e.target.style.borderColor = '#8fff00' }}
                  onBlur={(e)  => { e.target.style.borderColor = '#e8ede2' }}
                />
              </div>

              {error && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#dc2626' }}>{error}</p>
              )}
            </>
          )}
        </div>

        {!success && (
          <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid #e8ede2' }}>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-gray-50"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#8a9e78', border: '1px solid #e8ede2' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
              style={{
                fontFamily:      'Inter, sans-serif',
                fontSize:        13,
                fontWeight:      600,
                backgroundColor: canSubmit ? '#8fff00' : '#e8ede2',
                color:           canSubmit ? '#0a0d08' : '#8a9e78',
                cursor:          canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#0a0d08]/30 border-t-[#0a0d08] animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
