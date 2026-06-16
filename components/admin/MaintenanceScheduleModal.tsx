'use client'
// components/admin/MaintenanceScheduleModal.tsx
// ── Modal for creating/viewing maintenance schedules per switch

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { X, Calendar, Clock, Trash2, Plus, AlertTriangle } from 'lucide-react'

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

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const TIMEZONES = [
  { label: 'UTC',                    value: 'UTC'                    },
  { label: 'Dhaka (UTC+6)',          value: 'Asia/Dhaka'             },
  { label: 'London (UTC+0/+1)',      value: 'Europe/London'          },
  { label: 'New York (UTC-5/-4)',    value: 'America/New_York'       },
  { label: 'Los Angeles (UTC-8/-7)', value: 'America/Los_Angeles'    },
  { label: 'Dubai (UTC+4)',          value: 'Asia/Dubai'             },
  { label: 'Singapore (UTC+8)',      value: 'Asia/Singapore'         },
  { label: 'Sydney (UTC+10/+11)',    value: 'Australia/Sydney'       },
  { label: 'Tokyo (UTC+9)',          value: 'Asia/Tokyo'             },
  { label: 'Paris (UTC+1/+2)',       value: 'Europe/Paris'           },
  { label: 'Mumbai (UTC+5:30)',      value: 'Asia/Kolkata'           },
]

interface Schedule {
  id:                string
  switch_id:         string
  label:             string
  frequency:         string
  day_of_week:       number | null
  day_of_month:      number | null
  start_time:        string
  end_time:          string
  timezone:          string
  custom_message:    string | null
  is_active:         boolean
  next_run_at:       string | null
  last_triggered_at: string | null
  created_at:        string
}

interface Props {
  switchId:    string
  switchTitle: string
  onClose:     () => void
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000)    return 'Just now'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function formatNextRun(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function schedulePreview(form: {
  frequency: string; day_of_week: number; day_of_month: number;
  start_time: string; end_time: string; timezone: string
}): string {
  const tz = TIMEZONES.find(t => t.value === form.timezone)?.label ?? form.timezone
  if (form.frequency === 'weekly') {
    return `Every ${DAYS[form.day_of_week]} ${form.start_time}–${form.end_time} (${tz})`
  }
  if (form.frequency === 'monthly') {
    return `Monthly on day ${form.day_of_month}, ${form.start_time}–${form.end_time} (${tz})`
  }
  return `Once at ${form.start_time}–${form.end_time} (${tz})`
}

export default function MaintenanceScheduleModal({ switchId, switchTitle, onClose }: Props) {
  const supabase = createClient()

  const [schedules,  setSchedules]  = useState<Schedule[]>([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState<string | null>(null)
  const [showForm,   setShowForm]   = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const [form, setForm] = useState({
    label:          '',
    frequency:      'weekly',
    day_of_week:    0,
    day_of_month:   1,
    start_time:     '02:00',
    end_time:       '04:00',
    timezone:       'Asia/Dhaka',
    custom_message: '',
  })

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  async function loadSchedules() {
    try {
      const { data } = await (supabase.from('maintenance_schedules') as any)
        .select('*')
        .eq('switch_id', switchId)
        .order('created_at', { ascending: false })
      setSchedules(data ?? [])
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { loadSchedules() }, [switchId])

  async function handleSave() {
    if (!form.label.trim()) { setError('Label is required'); return }
    if (form.start_time >= form.end_time) { setError('End time must be after start time'); return }

    setSaving(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/maintenance/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({
          switch_id:      switchId,
          label:          form.label.trim(),
          frequency:      form.frequency,
          day_of_week:    form.frequency === 'weekly'  ? form.day_of_week  : null,
          day_of_month:   form.frequency === 'monthly' ? form.day_of_month : null,
          start_time:     form.start_time,
          end_time:       form.end_time,
          timezone:       form.timezone,
          custom_message: form.custom_message.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to save schedule'); return }
      setShowForm(false)
      setForm({ label: '', frequency: 'weekly', day_of_week: 0, day_of_month: 1, start_time: '02:00', end_time: '04:00', timezone: 'Asia/Dhaka', custom_message: '' })
      await loadSchedules()
    } catch { setError('Network error') }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/admin/maintenance/delete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id }),
      })
      await loadSchedules()
    } catch { /* silent */ }
    setDeleting(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{
           backgroundColor: `rgba(0,0,0,${visible ? 0.5 : 0})`,
           transition: 'background-color 0.25s ease',
         }}
         onClick={handleClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
           style={{
             backgroundColor: C.surface,
             transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(16px)',
             opacity: visible ? 1 : 0,
             transition: 'transform 0.25s ease, opacity 0.25s ease',
           }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b"
             style={{ borderColor: C.border }}>
          <Calendar size={16} style={{ color: C.limeDeep }} />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-black" style={{ color: C.dark }}>Maintenance Schedules</p>
            <p className="text-[11px]" style={{ color: C.muted }}>{switchTitle}</p>
          </div>
          <button onClick={handleClose} className="hover:opacity-70">
            <X size={18} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">

          {/* Existing schedules */}
          {loading ? (
            <div className="flex flex-col gap-2">
              {[1,2].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: C.bg }} />)}
            </div>
          ) : schedules.length === 0 && !showForm ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <Calendar size={24} style={{ color: C.border }} />
              <p className="text-[12px]" style={{ color: C.muted }}>No schedules yet</p>
              <p className="text-[11px] text-center" style={{ color: C.muted }}>
                Add a schedule to automatically take this tool offline during maintenance windows
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {schedules.map(s => (
                <div key={s.id} className="flex flex-col gap-2 p-4 rounded-2xl border"
                     style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold" style={{ color: C.dark }}>{s.label}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                        {schedulePreview({
                          frequency:    s.frequency,
                          day_of_week:  s.day_of_week ?? 0,
                          day_of_month: s.day_of_month ?? 1,
                          start_time:   s.start_time?.slice(0,5) ?? '00:00',
                          end_time:     s.end_time?.slice(0,5)   ?? '00:00',
                          timezone:     s.timezone,
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deleting === s.id}
                      className="p-1.5 rounded-lg hover:opacity-70 disabled:opacity-40"
                      style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                      {deleting === s.id
                        ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.red }} />
                        : <Trash2 size={13} style={{ color: C.red }} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {s.next_run_at && (
                      <div className="flex items-center gap-1">
                        <Clock size={10} style={{ color: C.muted }} />
                        <span className="text-[10px]" style={{ color: C.muted }}>
                          Next: {formatNextRun(s.next_run_at)}
                        </span>
                      </div>
                    )}
                    {s.last_triggered_at && (
                      <span className="text-[10px]" style={{ color: C.muted }}>
                        Last ran: {timeAgo(s.last_triggered_at)}
                      </span>
                    )}
                    {s.custom_message && (
                      <span className="text-[10px] italic" style={{ color: C.muted }}>
                        "{s.custom_message}"
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add schedule form */}
          {showForm && (
            <div className="flex flex-col gap-3 p-4 rounded-2xl border"
                 style={{ borderColor: C.limeDeep + '40', backgroundColor: C.limeTint }}>
              <p className="text-[12px] font-black" style={{ color: C.limeDeep }}>NEW SCHEDULE</p>

              {/* Label */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold" style={{ color: C.muted }}>LABEL</label>
                <input
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Sunday night maintenance"
                  className="h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: C.surface, color: C.dark }}
                />
              </div>

              {/* Frequency */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold" style={{ color: C.muted }}>FREQUENCY</label>
                <select
                  value={form.frequency}
                  onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                  className="h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: C.surface, color: C.dark }}>
                  <option value="once">Once</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Day selector */}
              {form.frequency === 'weekly' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold" style={{ color: C.muted }}>DAY</label>
                  <select
                    value={form.day_of_week}
                    onChange={e => setForm(f => ({ ...f, day_of_week: Number(e.target.value) }))}
                    className="h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: C.border, backgroundColor: C.surface, color: C.dark }}>
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              )}
              {form.frequency === 'monthly' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold" style={{ color: C.muted }}>DAY OF MONTH</label>
                  <input
                    type="number" min={1} max={31}
                    value={form.day_of_month}
                    onChange={e => setForm(f => ({ ...f, day_of_month: Number(e.target.value) }))}
                    className="h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: C.border, backgroundColor: C.surface, color: C.dark }}
                  />
                </div>
              )}

              {/* Time range */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold" style={{ color: C.muted }}>START TIME</label>
                  <input type="time" value={form.start_time}
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                    className="h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: C.border, backgroundColor: C.surface, color: C.dark }} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold" style={{ color: C.muted }}>END TIME</label>
                  <input type="time" value={form.end_time}
                    onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                    className="h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: C.border, backgroundColor: C.surface, color: C.dark }} />
                </div>
              </div>

              {/* Timezone */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold" style={{ color: C.muted }}>YOUR TIMEZONE</label>
                <select
                  value={form.timezone}
                  onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
                  className="h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: C.surface, color: C.dark }}>
                  {TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* User message */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold" style={{ color: C.muted }}>
                  USER MESSAGE <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  value={form.custom_message}
                  onChange={e => setForm(f => ({ ...f, custom_message: e.target.value }))}
                  placeholder="e.g. Upgrading database — back by 4am your time"
                  className="h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: C.surface, color: C.dark }}
                />
              </div>

              {/* Preview */}
              <div className="px-3 py-2 rounded-xl border"
                   style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.muted }}>PREVIEW</p>
                <p className="text-[12px] font-semibold" style={{ color: C.dark }}>
                  {schedulePreview(form)}
                </p>
                <p className="text-[10px] mt-1" style={{ color: C.muted }}>
                  Users will see their local equivalent time automatically
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                     style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                  <AlertTriangle size={13} style={{ color: C.red }} />
                  <p className="text-[11px]" style={{ color: C.red }}>{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { setShowForm(false); setError(null) }}
                  className="flex-1 py-2 rounded-xl text-[12px] font-semibold border"
                  style={{ borderColor: C.border, color: C.muted }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2 rounded-xl text-[12px] font-bold disabled:opacity-40"
                  style={{ backgroundColor: C.dark, color: C.lime }}>
                  {saving
                    ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin mx-auto" style={{ borderTopColor: C.lime }} />
                    : 'Save Schedule'}
                </button>
              </div>
            </div>
          )}

          {/* Add button */}
          {!showForm && (
            <button onClick={() => { setShowForm(true); setError(null) }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold hover:opacity-80"
              style={{ borderColor: C.limeDeep, color: C.limeDeep, backgroundColor: C.limeTint }}>
              <Plus size={14} />
              Add Schedule
            </button>
          )}
        </div>
      </div>
    </div>
  )
}