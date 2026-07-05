'use client'
// components/admin/settings-tabs/PageEditorTab.tsx
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

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  // Listen for messages from iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'RIAZIFY_SAVE_ALL') {
        // Save all changes from inline editing
        const { changes, page } = e.data
        Object.entries(changes).forEach(async ([key, value]) => {
          const parts = key.split('_')
          await fetch('/api/page-editor', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ page, section: parts[0] || 'content', field: key, value })
          })
        })
        setAllChanges(prev => ({ ...prev, [page]: { ...(prev[page] ?? {}), ...changes as Record<string, string> } }))
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

    // Inject CSS for inline editing
    const style = doc.createElement('style')
    style.textContent = `
      [contenteditable="true"] {
        outline: 2px solid #8fff00 !important;
        outline-offset: 2px;
        border-radius: 4px;
        cursor: text !important;
        min-width: 20px;
        transition: outline 0.15s ease;
      }
      [contenteditable="true"]:focus {
        outline: 3px solid #8fff00 !important;
        background: rgba(143,255,0,0.05) !important;
      }
      .rz-editable-wrap {
        position: relative;
        cursor: pointer;
      }
      .rz-editable-wrap:hover > .rz-hover-label {
        display: flex !important;
      }
      .rz-hover-label {
        display: none;
        position: absolute;
        top: -24px;
        left: 0;
        background: #8fff00;
        color: #1a2410;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px 4px 4px 0;
        z-index: 99999;
        font-family: Inter, sans-serif;
        white-space: nowrap;
        pointer-events: none;
        align-items: center;
        gap: 4px;
      }
      .rz-save-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #8fff00;
        color: #1a2410;
        font-size: 14px;
        font-weight: 900;
        padding: 12px 24px;
        border-radius: 14px;
        border: none;
        cursor: pointer;
        z-index: 99999;
        font-family: Inter, sans-serif;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        display: none;
        align-items: center;
        gap: 8px;
      }
      .rz-saved-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #1a2410;
        color: #8fff00;
        font-size: 13px;
        font-weight: 700;
        padding: 12px 20px;
        border-radius: 14px;
        z-index: 99999;
        font-family: Inter, sans-serif;
        border: 1px solid #8fff00;
        display: none;
      }
    `
    doc.head.appendChild(style)

    // Track changes
    const changes: Record<string, string> = {}
    let hasChanges = false

    // Save button
    const saveBtn = doc.createElement('button')
    saveBtn.className = 'rz-save-btn'
    saveBtn.innerHTML = '✓ Save Changes'
    doc.body.appendChild(saveBtn)

    const toast = doc.createElement('div')
    toast.className = 'rz-saved-toast'
    toast.textContent = 'Changes saved!'
    doc.body.appendChild(toast)

    saveBtn.addEventListener('click', async () => {
      saveBtn.textContent = 'Saving...'
      // Send all changes to parent
      window.parent.postMessage({
        type:    'RIAZIFY_SAVE_ALL',
        changes,
        page:    window.location.pathname === '/' ? 'landing' : window.location.pathname.replace('/', ''),
      }, '*')
      saveBtn.style.display = 'none'
      toast.style.display = 'block'
      setTimeout(() => { toast.style.display = 'none' }, 2500)
      hasChanges = false
    })

    // Make text elements editable on click
    const editableSelectors = [
      'h1', 'h2', 'h3', 'h4',
      'p:not(footer p):not(nav p)',
      'button:not([type="submit"]):not(.rz-save-btn)',
      'a.font-black', 'span.font-black',
      '[class*="font-black"]',
      '[class*="font-bold"]',
    ]

    editableSelectors.forEach(sel => {
      doc.querySelectorAll(sel).forEach((el: any) => {
        // Skip nav, footer, tiny text
        if (el.closest('nav') || el.closest('footer') || el.closest('.rz-save-btn')) return
        if (el.textContent.trim().length < 2) return
        if (el.querySelector('svg') || el.querySelector('img')) return

        // Wrap in editable container
        el.title = 'Click to edit'

        el.addEventListener('click', (e: any) => {
          e.stopPropagation()
          el.setAttribute('contenteditable', 'true')
          el.focus()

          // Select all text
          const range = doc.createRange()
          range.selectNodeContents(el)
          const sel2 = window.getSelection()
          if (sel2) { sel2.removeAllRanges(); sel2.addRange(range) }
        })

        el.addEventListener('blur', () => {
          el.removeAttribute('contenteditable')
          const key = el.tagName + '_' + el.textContent.trim().slice(0, 20).replace(/\s/g, '_')
          changes[key] = el.textContent.trim()
          hasChanges = true
          saveBtn.style.display = 'flex'
        })

        el.addEventListener('keydown', (e: any) => {
          if (e.key === 'Enter' && el.tagName !== 'TEXTAREA') {
            e.preventDefault()
            el.blur()
          }
          if (e.key === 'Escape') {
            el.blur()
          }
        })

        // Hover effect
        el.style.cursor = 'text'
        el.addEventListener('mouseenter', () => {
          if (!el.getAttribute('contenteditable')) {
            el.style.outline = '1px dashed rgba(143,255,0,0.5)'
            el.style.outlineOffset = '3px'
            el.style.borderRadius = '3px'
          }
        })
        el.addEventListener('mouseleave', () => {
          if (!el.getAttribute('contenteditable')) {
            el.style.outline = 'none'
          }
        })
      })
    })

    // Notify parent ready
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

  // Export all changes
  function exportChanges() {
    const lines: string[] = ['=== Riazify Page Editor Export ===', `Date: ${new Date().toLocaleString()}`, '']
    for (const [pageId, changes] of Object.entries(allChanges)) {
      if (!Object.keys(changes).length) continue
      const page = PAGES.find(p => p.id === pageId)
      lines.push(`--- ${page?.label ?? pageId} ---`)
      for (const [key, value] of Object.entries(changes)) {
        lines.push(`${key}: ${value}`)
      }
      lines.push('')
    }
    navigator.clipboard.writeText(lines.join('\n'))
    showToast('All changes copied to clipboard ✓')
  }

  // Change page
  function changePage(page: typeof PAGES[0]) {
    setActivePage(page)
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
          {totalChanges > 0 && (
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
              <button onClick={resetSection}
                      style={{ flex: 1, height: 40, borderRadius: 12, border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <RotateCcw size={13}/>Reset
              </button>
              <button onClick={saveChanges} disabled={saving}
                      style={{ flex: 2, height: 40, borderRadius: 12, border: 'none', backgroundColor: saved ? C.limeDeep : C.lime, color: C.dark, fontSize: 13, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {saving ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/> : saved ? <Check size={13}/> : <Save size={13}/>}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </button>
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