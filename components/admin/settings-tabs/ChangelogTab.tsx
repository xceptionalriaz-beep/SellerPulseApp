'use client'
// components/admin/settings-tabs/ChangelogTab.tsx
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, RefreshCw, X, Check } from 'lucide-react'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  bg:       '#f7f9f5',
  surface:  '#ffffff',
  text:     '#1a2410',
  red:      '#b91c1c',
  green:    '#15803d',
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  feature:      { label: 'New Feature',   color: C.limeDeep,  bg: C.limeTint },
  improvement:  { label: 'Improvement',   color: '#1d4ed8',   bg: '#eff6ff'  },
  fix:          { label: 'Bug Fix',       color: '#b91c1c',   bg: '#fef2f2'  },
  announcement: { label: 'Announcement',  color: '#7c3aed',   bg: '#f5f3ff'  },
}

interface Entry {
  id: string
  title: string
  description: string
  type: string
  version: string
  is_published: boolean
  published_at: string
  created_at: string
}

const EMPTY: Omit<Entry, 'id' | 'created_at'> = {
  title: '',
  description: '',
  type: 'feature',
  version: '',
  is_published: false,
  published_at: new Date().toISOString().split('T')[0],
}

export default function ChangelogTab() {
  const [entries, setEntries]         = useState<Entry[]>([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [editing, setEditing]         = useState<Entry | null>(null)
  const [form, setForm]               = useState(EMPTY)
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState<string | null>(null)
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [filter, setFilter]           = useState('all')
  const [search, setSearch]           = useState('')
  const [sortAsc, setSortAsc]         = useState(false)
  const [selected, setSelected]       = useState<Set<string>>(new Set())

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/changelog?all=true')
      const data = await res.json()
      setEntries(data.entries ?? [])
    } catch {
      setEntries([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm({ ...EMPTY, published_at: new Date().toISOString().split('T')[0] })
    setShowForm(true)
  }

  function openEdit(entry: Entry) {
    setEditing(entry)
    setForm({
      title:        entry.title,
      description:  entry.description,
      type:         entry.type,
      version:      entry.version || '',
      is_published: entry.is_published,
      published_at: entry.published_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    })
    setShowForm(true)
  }

  async function save() {
    if (!form.title.trim()) { showToast('Please enter a title'); return }
    if (!form.description.trim()) { showToast('Please enter a description'); return }
    setSaving(true)
    try {
      const payload = { ...form, published_at: new Date(form.published_at).toISOString() }
      if (editing) {
        await fetch('/api/changelog', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
        showToast('Entry updated ✓')
      } else {
        await fetch('/api/changelog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        showToast('Entry created ✓')
      }
      setShowForm(false)
      load()
    } catch {
      showToast('Error saving entry')
    }
    setSaving(false)
  }

  async function togglePublish(entry: Entry) {
    await fetch('/api/changelog', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: entry.id, is_published: !entry.is_published }) })
    showToast(entry.is_published ? 'Entry unpublished' : 'Entry published ✓')
    load()
  }

  async function deleteEntry(id: string) {
    await fetch('/api/changelog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    showToast('Entry deleted')
    setDeleteId(null)
    load()
  }

  async function bulkPublish() {
    await Promise.all([...selected].map(id =>
      fetch('/api/changelog', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_published: true }) })
    ))
    showToast(`${selected.size} entries published ✓`)
    setSelected(new Set())
    load()
  }

  async function bulkDelete() {
    await Promise.all([...selected].map(id =>
      fetch('/api/changelog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    ))
    showToast(`${selected.size} entries deleted`)
    setSelected(new Set())
    load()
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(e => e.id)))
  }

  const filtered = entries
    .filter(e => {
      if (filter !== 'all' && e.type !== filter) return false
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      const diff = new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
      return sortAsc ? diff : -diff
    })

  const published = entries.filter(e => e.is_published).length
  const drafts    = entries.filter(e => !e.is_published).length

  return (
    <div className="flex flex-col gap-6 px-6 py-6" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2"
             style={{ backgroundColor: C.dark, border: `1px solid ${C.lime}` }}>
          <Check size={14} style={{ color: C.lime }}/>
          <p className="text-[13px] font-bold" style={{ color: C.lime }}>{toast}</p>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="p-6 rounded-2xl border shadow-2xl" style={{ backgroundColor: C.surface, borderColor: C.border, maxWidth: 380 }}>
            <h3 className="text-[16px] font-black mb-2" style={{ color: C.text }}>Delete entry?</h3>
            <p className="text-[13px] mb-5" style={{ color: C.muted }}>This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border text-[13px] font-bold" style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
              <button onClick={() => deleteEntry(deleteId)} className="flex-1 py-2 rounded-xl text-[13px] font-black" style={{ backgroundColor: C.red, color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[24px] font-black" style={{ color: C.text }}>Changelog</h1>
          <p className="text-[13px]" style={{ color: C.muted }}>Manage public product updates and release notes</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSortAsc(s => !s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:opacity-70 transition-all text-[12px] font-bold"
                  style={{ backgroundColor: C.bg, borderColor: C.border, color: C.muted }}
                  title={sortAsc ? 'Oldest first' : 'Newest first'}>
            {sortAsc ? '↑' : '↓'} {sortAsc ? 'Oldest' : 'Newest'}
          </button>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:opacity-70 transition-all text-[12px] font-bold"
                  style={{ backgroundColor: C.bg, borderColor: C.border, color: C.muted }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''}/>Refresh
          </button>
          <a href="/changelog" target="_blank"
             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:opacity-70 transition-all text-[12px] font-bold"
             style={{ backgroundColor: C.bg, borderColor: C.border, color: C.muted }}>
            Preview ↗
          </a>
          <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-black hover:opacity-90 transition-all"
                  style={{ backgroundColor: C.lime, color: C.dark }}>
            <Plus size={14}/>New Entry
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'TOTAL',       value: entries.length,                                    color: C.text     },
          { label: 'PUBLISHED',   value: entries.filter(e => e.is_published).length,        color: C.limeDeep },
          { label: 'DRAFTS',      value: entries.filter(e => !e.is_published).length,       color: C.muted    },
          { label: 'FEATURES',    value: entries.filter(e => e.type === 'feature').length,  color: C.limeDeep },
          { label: 'IMPROVEMENTS',value: entries.filter(e => e.type === 'improvement').length, color: '#1d4ed8' },
          { label: 'BUG FIXES',   value: entries.filter(e => e.type === 'fix').length,      color: '#b91c1c'  },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl border flex flex-col gap-1"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <p className="text-[22px] font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-xl flex-wrap" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
          {['all', 'feature', 'improvement', 'fix', 'announcement'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-black capitalize transition-all"
                    style={{ backgroundColor: filter === f ? C.lime : 'transparent', color: filter === f ? C.dark : C.muted }}>
              {f === 'all' ? 'All' : TYPE_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[200px]"
             style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, transition: 'border-color 0.2s' }}
             onFocus={() => {}} onBlur={() => {}}
             ref={el => {
               if (!el) return
               el.addEventListener('focusin', () => el.style.borderColor = C.lime)
               el.addEventListener('focusout', () => el.style.borderColor = C.border)
             }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Search entries..."
                 className="flex-1 text-[12px] bg-transparent"
                 style={{ color: C.text, border: 'none', outline: 'none', boxShadow: 'none' }}/>
        </div>
      </div>

      {/* Entry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
             onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="w-full max-w-lg rounded-2xl border flex flex-col gap-4 p-6 shadow-2xl"
               style={{ backgroundColor: C.surface, borderColor: C.lime, maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-black" style={{ color: C.text }}>{editing ? 'Edit Entry' : 'New Entry'}</h2>
            <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70"
                    style={{ backgroundColor: C.bg }}>
              <X size={14} style={{ color: C.muted }}/>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>TITLE *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                     placeholder="e.g. Order Protection v2.0 launched"
                     className="h-10 px-3 rounded-xl border text-[13px] outline-none"
                     style={{ borderColor: C.border, color: C.text, backgroundColor: C.bg }}/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>VERSION (OPTIONAL)</label>
              <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                     placeholder="e.g. v1.2.0"
                     className="h-10 px-3 rounded-xl border text-[13px] outline-none"
                     style={{ borderColor: C.border, color: C.text, backgroundColor: C.bg }}/>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>DESCRIPTION *</label>
              <span className="text-[10px]" style={{ color: form.description.length > 300 ? '#b91c1c' : C.muted }}>{form.description.length}/300</span>
            </div>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe what changed and why it matters for sellers..."
                      rows={4}
                      className="px-3 py-2.5 rounded-xl border text-[13px] outline-none resize-none"
                      style={{ borderColor: C.border, color: C.text, backgroundColor: C.bg }}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>TYPE</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="h-10 px-3 rounded-xl border text-[13px] outline-none"
                      style={{ borderColor: C.border, color: C.text, backgroundColor: C.bg }}>
                {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>PUBLISH DATE</label>
              <input type="date" value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))}
                     className="h-10 px-3 rounded-xl border text-[13px] outline-none"
                     style={{ borderColor: C.border, color: C.text, backgroundColor: C.bg }}/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>STATUS</label>
              <button onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                      className="h-10 px-3 rounded-xl border text-[13px] font-bold flex items-center gap-2"
                      style={{ borderColor: form.is_published ? C.lime : C.border, backgroundColor: form.is_published ? C.limeTint : C.bg, color: form.is_published ? C.limeDeep : C.muted }}>
                {form.is_published ? <Eye size={14}/> : <EyeOff size={14}/>}
                {form.is_published ? 'Published' : 'Draft'}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border text-[13px] font-bold"
                    style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
            <button onClick={save} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-black hover:opacity-90 transition-all"
                    style={{ backgroundColor: C.lime, color: C.dark }}>
              {saving ? 'Saving...' : editing ? 'Update Entry' : 'Create Entry'}
            </button>
          </div>
          </div>
        </div>
      )}

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
             style={{ backgroundColor: C.limeTint, borderColor: 'rgba(143,255,0,0.3)' }}>
          <span className="text-[12px] font-black" style={{ color: C.limeDeep }}>{selected.size} selected</span>
          <button onClick={bulkPublish}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black hover:opacity-70"
                  style={{ backgroundColor: C.dark, color: C.lime }}>
            <Eye size={11}/>Publish All
          </button>
          <button onClick={bulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black hover:opacity-70"
                  style={{ backgroundColor: 'rgba(185,28,28,0.1)', color: C.red }}>
            <Trash2 size={11}/>Delete All
          </button>
          <button onClick={() => setSelected(new Set())}
                  className="ml-auto text-[11px] font-bold hover:opacity-70"
                  style={{ color: C.muted }}>
            Clear
          </button>
        </div>
      )}

      {/* Entries list */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={20} className="animate-spin" style={{ color: C.limeDeep }}/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-[14px] font-bold" style={{ color: C.text }}>No entries yet</p>
            <p className="text-[12px]" style={{ color: C.muted }}>Click "New Entry" to add your first changelog entry</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                <th className="px-4 py-3">
                  <input type="checkbox"
                         checked={selected.size === filtered.length && filtered.length > 0}
                         onChange={toggleSelectAll}
                         style={{ accentColor: C.lime, width: 14, height: 14, cursor: 'pointer' }}/>
                </th>
                {['TYPE', 'TITLE', 'STATUS', 'DATE', 'VERSION', 'ACTIONS'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black tracking-wider"
                      style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <tr key={entry.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', backgroundColor: selected.has(entry.id) ? 'rgba(143,255,0,0.05)' : 'transparent' }}
                    className="hover:bg-gray-50 transition-colors">
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <input type="checkbox"
                           checked={selected.has(entry.id)}
                           onChange={() => toggleSelect(entry.id)}
                           style={{ accentColor: C.lime, width: 14, height: 14, cursor: 'pointer' }}/>
                  </td>
                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{ backgroundColor: TYPE_CONFIG[entry.type]?.bg || C.limeTint, color: TYPE_CONFIG[entry.type]?.color || C.limeDeep }}>
                      {TYPE_CONFIG[entry.type]?.label || entry.type}
                    </span>
                  </td>
                  {/* Title + Description */}
                  <td className="px-4 py-3" style={{ maxWidth: 280 }}>
                    <p className="text-[13px] font-black mb-0.5" style={{ color: C.text }}>{entry.title}</p>
                    <p className="text-[11px] line-clamp-1" style={{ color: C.muted }}>{entry.description}</p>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                          style={{ backgroundColor: entry.is_published ? C.limeTint : C.bg, color: entry.is_published ? C.limeDeep : C.muted, border: `1px solid ${entry.is_published ? 'rgba(143,255,0,0.3)' : C.border}` }}>
                      {entry.is_published ? '● Published' : '○ Draft'}
                    </span>
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3 text-[11px] whitespace-nowrap" style={{ color: C.muted }}>
                    {new Date(entry.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  {/* Version */}
                  <td className="px-4 py-3">
                    {entry.version ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}` }}>
                        {entry.version}
                      </span>
                    ) : <span style={{ color: C.border }}>—</span>}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => togglePublish(entry)} title={entry.is_published ? 'Unpublish' : 'Publish'}
                              className="w-7 h-7 flex items-center justify-center rounded-lg border hover:opacity-70"
                              style={{ borderColor: C.border, backgroundColor: C.bg }}>
                        {entry.is_published ? <EyeOff size={12} style={{ color: C.muted }}/> : <Eye size={12} style={{ color: C.limeDeep }}/>}
                      </button>
                      <button onClick={() => openEdit(entry)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg border hover:opacity-70"
                              style={{ borderColor: C.border, backgroundColor: C.bg }}>
                        <Edit2 size={12} style={{ color: C.muted }}/>
                      </button>
                      <button onClick={() => setDeleteId(entry.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
                              style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                        <Trash2 size={12} style={{ color: C.red }}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}