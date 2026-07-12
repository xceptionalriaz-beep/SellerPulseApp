'use client'
// components/admin/settings-tabs/PageEditorTab.tsx
import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X, Save, RotateCcw, Copy, Check, ChevronLeft,
  ChevronRight, RefreshCw, Maximize2, Minimize2,
  Monitor, Smartphone, ExternalLink
} from 'lucide-react'

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
}

const PAGES = [
  { id: 'landing',   label: 'Landing Page',  url: '/'           },
  { id: 'about',     label: 'About',          url: '/about'      },
  { id: 'affiliate', label: 'Affiliate',      url: '/affiliate'  },
  { id: 'careers',   label: 'Careers',        url: '/careers'    },
  { id: 'presskit',  label: 'Press Kit',      url: '/press-kit'  },
  { id: 'changelog', label: 'Changelog',      url: '/changelog'  },
]

interface EditPanel {
  sectionId: string
  label:     string
  fields:    { key: string; label: string; value: string; type: 'text' | 'textarea' }[]
}

export default function PageEditorTab() {
  const { can } = useTabPermissions('page_editor')
  const iframeRef                         = useRef<HTMLIFrameElement>(null)
  const [activePage, setActivePage]       = useState(PAGES[0])
  const [iframeKey, setIframeKey]         = useState(0)
  const [loading, setLoading]             = useState(true)
  const [editPanel, setEditPanel]         = useState<EditPanel | null>(null)
  const [editValues, setEditValues]       = useState<Record<string, string>>({})
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [viewport, setViewport]           = useState<'desktop' | 'mobile'>('desktop')
  const [fullscreen, setFullscreen]       = useState(false)
  const [toast, setToast]                 = useState<string | null>(null)
  const [allChanges, setAllChanges]       = useState<Record<string, Record<string, string>>>({})
  const [dbLoaded, setDbLoaded]           = useState(false)

  // Load ALL saved changes from DB on mount
  useEffect(() => {
    async function loadAllFromDB() {
      try {
        const res = await fetch('/api/page-editor')
        const data = await res.json()
        // Convert flat DB rows to nested { pageId: { key: value } }
        const nested: Record<string, Record<string, string>> = {}
        for (const row of data.raw ?? []) {
          if (!nested[row.page]) nested[row.page] = {}
          nested[row.page][`${row.section}.${row.field}`] = row.value ?? ''
        }
        setAllChanges(nested)
      } catch {}
      setDbLoaded(true)
    }
    loadAllFromDB()
  }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  // Listen for messages from iframe
  useEffect(() => {
    async function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'RIAZIFY_SAVE_ALL') {
        const { changes, page } = e.data
        for (const [key, val] of Object.entries(changes as Record<string, { old: string; new: string; tag: string }>)) {
          const section = val.tag?.toLowerCase() || 'content'
          await fetch('/api/page-editor', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ page, section, field: key, value: JSON.stringify(val) })
          })
        }
        setAllChanges(prev => ({
          ...prev,
          [page]: { ...(prev[page] ?? {}), ...Object.fromEntries(Object.entries(changes as Record<string, {old:string;new:string;tag:string}>).map(([k,v]) => [k, JSON.stringify(v)])) }
        }))
        showToast('Changes saved ✓')
      }
      if (e.data?.type === 'RIAZIFY_EDIT_CLICK') {
        setEditPanel({
          sectionId: e.data.sectionId,
          label:     e.data.label,
          fields:    e.data.fields,
        })
        setEditValues(
          Object.fromEntries(e.data.fields.map((f: any) => [f.key, f.value]))
        )
      }
      if (e.data?.type === 'RIAZIFY_PAGE_READY') {
        setLoading(false)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [activePage, allChanges])

  // Inject inline editing directly into iframe
  function injectEditScript() {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    const doc = iframe.contentDocument

    // Inject CSS
    const style = doc.createElement('style')
    style.textContent = `
      .rz-el { cursor: text; }
      .rz-el:hover { outline: 1px dashed rgba(143,255,0,0.6) !important; outline-offset: 3px; border-radius: 3px; }
      .rz-el[contenteditable="true"] {
        outline: 2px solid #8fff00 !important;
        outline-offset: 2px;
        border-radius: 4px;
        background: rgba(143,255,0,0.05) !important;
        cursor: text !important;
      }
      .rz-save-btn {
        position: fixed; bottom: 24px; right: 24px;
        background: #8fff00; color: #1a2410;
        font-size: 14px; font-weight: 900;
        padding: 12px 28px; border-radius: 14px;
        border: none; cursor: pointer; z-index: 99999;
        font-family: Inter, sans-serif;
        box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        display: none;
      }
      .rz-toast {
        position: fixed; bottom: 24px; right: 24px;
        background: #1a2410; color: #8fff00;
        font-size: 13px; font-weight: 700;
        padding: 12px 20px; border-radius: 14px;
        z-index: 99999; font-family: Inter, sans-serif;
        border: 1px solid #8fff00; display: none;
      }
    `
    doc.head.appendChild(style)

    // Track changes with OLD and NEW text
    const changes: Record<string, { old: string; new: string; tag: string }> = {}

    // Save button
    const saveBtn = doc.createElement('button')
    saveBtn.className = 'rz-save-btn'
    saveBtn.textContent = '\u2713 Save Changes'
    doc.body.appendChild(saveBtn)

    const toastEl = doc.createElement('div')
    toastEl.className = 'rz-toast'
    toastEl.textContent = 'Changes saved!'
    doc.body.appendChild(toastEl)

    // Use data attribute set by admin to identify page
    const pageId = iframe.dataset.pageId || 'landing'

    saveBtn.addEventListener('click', () => {
      const exportChanges: Record<string, { old: string; new: string; tag: string }> = {}
      for (const [k, v] of Object.entries(changes)) {
        if (v.old !== v.new) exportChanges[k] = v
      }
      window.parent.postMessage({
        type:    'RIAZIFY_SAVE_ALL',
        changes: exportChanges,
        page:    pageId,
      }, '*')
      saveBtn.style.display = 'none'
      toastEl.style.display = 'block'
      setTimeout(() => { toastEl.style.display = 'none' }, 2500)
    })

    // Target only leaf text elements
    const selectors = ['h1', 'h2', 'h3', 'h4', 'p', 'span', 'a', 'button', 'label']
    let counter = 0

    selectors.forEach(sel => {
      doc.querySelectorAll(sel).forEach((el: any) => {
        if (el.closest('nav') || el.closest('footer') || el.closest('.rz-save-btn') || el.closest('.rz-toast')) return
        if (el.querySelector('h1,h2,h3,h4,p,span,a,button')) return
        if (el.querySelector('svg,img')) return
        const text = el.textContent.trim()
        if (text.length < 3) return
        if (el.dataset.rzId) return

        const id = sel.toUpperCase() + '_' + counter++ + '_' + text.slice(0, 20).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
        el.dataset.rzId = id
        el.classList.add('rz-el')

        // Store original text as data attribute BEFORE any edit
        el.dataset.rzOriginal = text

        el.addEventListener('click', (e: any) => {
          // Read original from data attribute (always preserved)
          const originalText = el.dataset.rzOriginal || text
          e.stopPropagation()
          if (el.getAttribute('contenteditable')) return
          el.setAttribute('contenteditable', 'true')
          el.focus()
          try {
            const range = doc.createRange()
            range.selectNodeContents(el)
            const s = window.getSelection()
            if (s) { s.removeAllRanges(); s.addRange(range) }
          } catch {}
        })

        el.addEventListener('blur', () => {
          el.removeAttribute('contenteditable')
          const origText = el.dataset.rzOriginal || ''
          const newText = el.textContent.trim()
          if (newText !== origText && newText.length > 0) {
            changes[id] = { old: origText, new: newText, tag: sel.toUpperCase() }
            saveBtn.style.display = 'block'
          }
        })

        el.addEventListener('keydown', (e: any) => {
          if (e.key === 'Enter') { e.preventDefault(); el.blur() }
          if (e.key === 'Escape') {
            el.textContent = el.dataset.rzOriginal || ''
            el.removeAttribute('contenteditable')
          }
        })
      })
    })

    window.parent.postMessage({ type: 'RIAZIFY_PAGE_READY' }, '*')
  }
  function handleFieldChange(key: string, value: string) {
    setEditValues(prev => ({ ...prev, [key]: value }))
    iframeRef.current?.contentWindow?.postMessage({
      type:      'RIAZIFY_LIVE_UPDATE',
      sectionId: editPanel?.sectionId,
      key,
      value,
    }, '*')
  }

  // Save changes
  async function saveChanges() {
    if (!editPanel) return
    setSaving(true)
    try {
      // Save all fields to DB
      for (const [key, value] of Object.entries(editValues)) {
        const [section, field] = editPanel.sectionId.split('.')
        await fetch('/api/page-editor', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ page: activePage.id, section: section || editPanel.sectionId, field: key, value })
        })
      }
      // Store locally
      setAllChanges(prev => ({
        ...prev,
        [activePage.id]: {
          ...(prev[activePage.id] ?? {}),
          ...Object.fromEntries(
            Object.entries(editValues).map(([k, v]) => [`${editPanel.sectionId}.${k}`, v])
          )
        }
      }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      showToast('Changes saved ✓')
    } catch {
      showToast('Error saving changes')
    }
    setSaving(false)
  }

  // Reset section to defaults
  function resetSection() {
    if (!editPanel) return
    iframeRef.current?.contentWindow?.postMessage({
      type:      'RIAZIFY_RESET_SECTION',
      sectionId: editPanel.sectionId,
    }, '*')
    setEditPanel(null)
    showToast('Section reset to default')
  }

  // Export all changes with full AI prompt
  function exportChanges() {
    const projectPath = 'C:\\Users\\Xceptional Riaz\\Downloads\\riazify-phase1\\riazify\\'

    const pageFileMap: Record<string, string> = {
      landing:   'app/page.tsx',
      about:     'app/about/page.tsx',
      affiliate: 'app/affiliate/page.tsx',
      careers:   'app/careers/page.tsx',
      presskit:  'app/press-kit/page.tsx',
      changelog: 'app/changelog/page.tsx',
    }

    const lines: string[] = [
      '=== RIAZIFY PAGE EDITOR — CODE UPDATE REQUEST ===',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '──────────────────────────────────────────────────',
      'PROMPT FOR AI ASSISTANT:',
      '──────────────────────────────────────────────────',
      'You are helping update the Riazify SaaS project.',
      'Stack: Next.js 14 + TypeScript + Tailwind CSS + Supabase',
      `Project path: ${projectPath}`,
      '',
      'The user has edited text on public pages using the Riazify Page Editor.',
      'The changes need to be permanently updated in the code files.',
      '',
      'FOR EACH CHANGE BELOW:',
      '1. Find the file specified',
      '2. Use PowerShell to locate the OLD TEXT:',
      '   Select-String -Path "FILE_PATH" -Pattern "OLD TEXT"',
      '3. Replace OLD TEXT with NEW TEXT exactly',
      '4. After ALL changes are done run: npm run build',
      '5. Confirm build succeeded with no errors',
      '',
      'If you cannot find OLD TEXT exactly, ask the user to share the file.',
      '──────────────────────────────────────────────────',
      '',
    ]

    let hasChanges = false

    for (const [pageId, changes] of Object.entries(allChanges)) {
      if (!Object.keys(changes).length) continue
      hasChanges = true
      const page = PAGES.find(p => p.id === pageId) ?? { label: pageId, url: '/' }
      const file = pageFileMap[pageId] || 'app/page.tsx'

      lines.push(`=== PAGE: ${page.label} ===`)
      lines.push(`FILE: ${file}`)
      lines.push(`FULL PATH: ${projectPath}${file.replace(/\//g, '\\')}`)
      lines.push('')

      let changeNum = 1
      for (const [key, rawValue] of Object.entries(changes)) {
        let oldText = ''
        let newText = ''
        let tag = ''
        try {
          const parsed = JSON.parse(String(rawValue))
          oldText = parsed.old || ''
          newText = parsed.new || String(rawValue)
          tag = parsed.tag || ''
        } catch {
          newText = String(rawValue)
        }
        lines.push(`CHANGE ${changeNum}:`)
        lines.push(`Element: ${tag}`)
        lines.push(`OLD TEXT: ${oldText}`)
        lines.push(`NEW TEXT: ${newText}`)
        lines.push(`PowerShell to find: Select-String -Path "${file}" -Pattern "${oldText.slice(0, 40).replace(/['"]/g, '')}"`)
        lines.push('')
        changeNum++
      }
    }

    if (!hasChanges) {
      showToast('No changes to export yet')
      return
    }

    lines.push('──────────────────────────────────────────────────')
    lines.push('AFTER ALL CHANGES:')
    lines.push(`cd "${projectPath}"`)
    lines.push('npm run build')
    lines.push('── Verify build succeeds with no errors ──')
    lines.push('──────────────────────────────────────────────────')
    lines.push('')
    lines.push('Generated by Riazify Page Editor')

    navigator.clipboard.writeText(lines.join('\n'))
    showToast('Export copied! Clearing changes...')

    // Auto-clear ALL changes from DB after export
    setTimeout(async () => {
      try {
        // Delete everything from page_editor table
        await fetch('/api/page-editor?clearAll=true', {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ clearAll: true })
        })
        setAllChanges({})
        showToast('Changes exported & cleared ✓')
      } catch {
        showToast('Export copied ✓')
      }
    }, 500)
  }

  // Clear all changes from DB after export
  async function clearAllChanges() {
    try {
      // Delete all rows for all pages
      for (const pageId of Object.keys(allChanges)) {
        const page = PAGES.find(p => p.id === pageId)
        if (!page) continue
        await fetch('/api/page-editor', {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ page: pageId, section: '__all__', field: '__all__' })
        })
      }
      setAllChanges({})
      showToast('All changes cleared ✓ Fresh start!')
    } catch {
      showToast('Error clearing changes')
    }
  }

  // Change page
  function changePage(p: typeof PAGES[0]) {
    setActivePage(p)
    setEditPanel(null)
    setLoading(true)
    setIframeKey(k => k + 1)
  }

  const iframeUrl = `${activePage.url}?edit=true`
  const totalChanges = Object.values(allChanges).reduce((acc: number, c) => acc + Object.keys(c).length, 0)

  return (
    <div style={{
      fontFamily:    'Inter, sans-serif',
      height:        fullscreen ? 'calc(100vh)' : 'calc(100vh - 120px)',
      display:       'flex',
      flexDirection: 'column',
      gap:           0,
      position:      fullscreen ? 'fixed' : 'relative',
      top:           fullscreen ? 0 : 'auto',
      left:          fullscreen ? '220px' : 'auto',
      right:         fullscreen ? 0 : 'auto',
      bottom:        fullscreen ? 0 : 'auto',
      zIndex:        fullscreen ? 9998 : 'auto',
    }}>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2"
             style={{ backgroundColor: C.dark, border: `1px solid ${C.lime}`, zIndex: 9999 }}>
          <Check size={14} style={{ color: C.lime }}/>
          <p className="text-[13px] font-bold" style={{ color: C.lime }}>{toast}</p>
        </div>
      )}

      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
           style={{ backgroundColor: C.dark, borderColor: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
        {/* Page tabs */}
        <div className="flex items-center gap-1">
          {PAGES.map(page => (
            <button key={page.id} onClick={() => changePage(page)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                    style={{
                      backgroundColor: activePage.id === page.id ? C.lime : 'rgba(255,255,255,0.08)',
                      color: activePage.id === page.id ? C.dark : 'rgba(255,255,255,0.6)',
                    }}>
              {page.label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Viewport toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <button onClick={() => setViewport('desktop')}
                    className="p-1.5 rounded"
                    style={{ backgroundColor: viewport === 'desktop' ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
              <Monitor size={14} style={{ color: '#fff' }}/>
            </button>
            <button onClick={() => setViewport('mobile')}
                    className="p-1.5 rounded"
                    style={{ backgroundColor: viewport === 'mobile' ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
              <Smartphone size={14} style={{ color: '#fff' }}/>
            </button>
          </div>
          {/* Fullscreen */}
          <button onClick={() => setFullscreen(f => !f)}
                  className="p-2 rounded-lg hover:opacity-70"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {fullscreen ? <Minimize2 size={14} style={{ color: '#fff' }}/> : <Maximize2 size={14} style={{ color: '#fff' }}/>}
          </button>
          {/* Refresh */}
          <button onClick={() => { setLoading(true); setIframeKey(k => k + 1) }}
                  className="p-2 rounded-lg hover:opacity-70"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <RefreshCw size={14} style={{ color: '#fff' }}/>
          </button>
          {/* Open in new tab */}
          <a href={activePage.url} target="_blank" rel="noopener noreferrer"
             className="p-2 rounded-lg hover:opacity-70"
             style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <ExternalLink size={14} style={{ color: '#fff' }}/>
          </a>
          {/* Export */}
          {totalChanges > 0 && can('edit_content') && (
            <button onClick={exportChanges}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-black hover:opacity-90"
                    style={{ backgroundColor: C.lime, color: C.dark }}>
              <Copy size={12}/>Export ({totalChanges})
            </button>
          )}
        </div>
      </div>

      {/* Main editor area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* iframe */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#e5e7eb',
          overflow: 'auto',
          padding: viewport === 'mobile' ? '20px' : '0',
          transition: 'all 0.3s ease',
        }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg, zIndex: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <RefreshCw size={32} style={{ color: C.lime, animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}/>
                <p style={{ color: C.muted, fontSize: 14 }}>Loading page editor...</p>
              </div>
            </div>
          )}
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={iframeUrl}
            data-page-id={activePage.id}
            style={{
              width:        viewport === 'mobile' ? '390px' : '100%',
              height:       viewport === 'mobile' ? '844px' : '100%',
              border:       'none',
              borderRadius: viewport === 'mobile' ? '16px' : '0',
              boxShadow:    viewport === 'mobile' ? '0 20px 60px rgba(0,0,0,0.3)' : 'none',
              display:      'block',
              flexShrink:   0,
            }}
            onLoad={() => { setLoading(false); setTimeout(injectEditScript, 500) }}
          />
        </div>

        {/* Edit panel — slides in from right */}
        {editPanel && (
          <div style={{
            width:           360,
            height:          '100%',
            backgroundColor: C.surface,
            borderLeft:      `1px solid ${C.border}`,
            display:         'flex',
            flexDirection:   'column',
            flexShrink:      0,
            overflow:        'hidden',
          }}>
            {/* Panel header */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{editPanel.label}</p>
                <button onClick={() => setEditPanel(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <X size={16} style={{ color: C.muted }}/>
                </button>
              </div>
              <p style={{ fontSize: 11, color: C.muted }}>Changes update live in the preview</p>
            </div>

            {/* Fields */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {editPanel.fields.map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                    {field.label.toUpperCase()}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={editValues[field.key] ?? field.value}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                      rows={4}
                      style={{
                        width:           '100%',
                        padding:         '10px 12px',
                        borderRadius:    12,
                        border:          `1.5px solid ${C.lime}`,
                        backgroundColor: C.limeTint,
                        color:           C.text,
                        fontSize:        13,
                        outline:         'none',
                        resize:          'vertical',
                        fontFamily:      'Inter, sans-serif',
                        boxSizing:       'border-box',
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={editValues[field.key] ?? field.value}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                      style={{
                        width:           '100%',
                        height:          40,
                        padding:         '0 12px',
                        borderRadius:    12,
                        border:          `1.5px solid ${C.lime}`,
                        backgroundColor: C.limeTint,
                        color:           C.text,
                        fontSize:        13,
                        outline:         'none',
                        fontFamily:      'Inter, sans-serif',
                        boxSizing:       'border-box',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Panel footer */}
            <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
              {can('edit_content') && <button onClick={resetSection}
                      style={{ flex: 1, height: 40, borderRadius: 12, border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <RotateCcw size={13}/>Reset
              </button>}
              {can('publish_changes') && <button onClick={saveChanges} disabled={saving}
                      style={{ flex: 2, height: 40, borderRadius: 12, border: 'none', backgroundColor: saved ? C.limeDeep : C.lime, color: C.dark, fontSize: 13, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {saving ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/> : saved ? <Check size={13}/> : <Save size={13}/>}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </button>}
            </div>
          </div>
        )}

        {/* Helper hint when no panel open */}
        {!editPanel && !loading && (
          <div style={{
            position:        'absolute',
            bottom:          24,
            left:            '50%',
            transform:       'translateX(-50%)',
            backgroundColor: C.dark,
            color:           '#fff',
            padding:         '10px 20px',
            borderRadius:    100,
            fontSize:        13,
            fontWeight:      600,
            border:          `1px solid rgba(143,255,0,0.3)`,
            pointerEvents:   'none',
            whiteSpace:      'nowrap',
          }}>
            👆 Hover over any section to edit it
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}