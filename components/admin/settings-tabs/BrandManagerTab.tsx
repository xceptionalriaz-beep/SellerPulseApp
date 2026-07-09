'use client'
// components/admin/settings-tabs/BrandManagerTab.tsx
import React, { useState, useEffect, useRef } from 'react'
import { RefreshCw, Check, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const C = {
  lime:        '#8fff00',
  limeDeep:    '#4a8f00',
  limeTint:    '#f4ffe6',
  dark:        '#1a2410',
  border:      '#e8ede2',
  muted:       '#8a9e78',
  bg:          '#f7f9f5',
  surface:     '#ffffff',
  text:        '#1a2410',
  red:         '#b91c1c',
  redBg:       '#fef2f2',
  redBorder:   '#fecaca',
  green:       '#15803d',
  greenBg:     '#f0fdf4',
  greenBorder: '#bbf7d0',
  blue:        '#1d4ed8',
  blueBg:      '#eff6ff',
  blueBorder:  '#bfdbfe',
}

// Checkered transparency background for logo preview areas
const CHECKER_BG = `
  repeating-conic-gradient(#e8ede2 0% 25%, transparent 0% 50%)
  0 0 / 16px 16px
`

interface Brand {
  logo_icon:       string
  logo_full_dark:  string
  logo_full_light: string
  logo_email:      string
  favicon:         string
  og_image:        string
  brand_name:      string
  brand_color:     string
}

const DEFAULTS: Brand = {
  logo_icon:       '/brand/logo-icon.svg',
  logo_full_dark:  '/brand/logo-full-dark.svg',
  logo_full_light: '/brand/logo-full-light.svg',
  logo_email:      '',
  favicon:         '',
  og_image:        '/brand/og-image.svg',
  brand_name:      'Riazify',
  brand_color:     '#8fff00',
}

// All 6 logo assets — unified card design
const ALL_LOGOS = [
  {
    key:     'logo_icon',
    label:   'Logo icon',
    desc:    'Sidebar, app icon, favicon fallback',
    size:    '32 × 32px',
    hint:    'SVG preferred · Max 1MB',
    bg:      C.dark,
    preview: 'icon',
    accept:  '.svg,.png,.webp',
  },
  {
    key:     'logo_full_dark',
    label:   'Full logo (dark text)',
    desc:    'Landing navbar, light backgrounds',
    size:    '140 × 32px',
    hint:    'SVG preferred · Max 1MB',
    bg:      C.bg,
    preview: 'full-dark',
    accept:  '.svg,.png,.webp',
  },
  {
    key:     'logo_full_light',
    label:   'Full logo (light text)',
    desc:    'Dark sections, footers, email headers',
    size:    '140 × 32px',
    hint:    'SVG preferred · Max 1MB',
    bg:      C.dark,
    preview: 'full-light',
    accept:  '.svg,.png,.webp',
  },
  {
    key:     'og_image',
    label:   'OG image',
    desc:    'Twitter, LinkedIn, WhatsApp link previews',
    size:    '1200 × 630px',
    hint:    'PNG or JPG recommended · Max 1MB',
    bg:      C.dark,
    preview: 'og',
    accept:  '.png,.jpg,.jpeg,.webp',
  },
  {
    key:     'favicon',
    label:   'Favicon',
    desc:    'Browser tab icon, bookmarks',
    size:    '32 × 32px',
    hint:    'ICO, PNG or SVG · Max 1MB',
    bg:      '#dee1e6',
    preview: 'favicon',
    accept:  '.ico,.png,.svg',
  },
  {
    key:     'logo_email',
    label:   'Email logo',
    desc:    'Email templates and notifications',
    size:    '200 × 50px',
    hint:    'SVG or PNG · Max 1MB',
    bg:      C.surface,
    preview: 'email',
    accept:  '.svg,.png,.webp',
  },
]

export default function BrandManagerTab() {
  const supabase  = createClient()
  const [brand, setBrand]       = useState<Brand>(DEFAULTS)
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [saved, setSaved]       = useState<string | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [savedAll, setSavedAll] = useState(false)
  const [toast, setToast]       = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/brand')
      const d   = await res.json()
      if (d.brand) {
        setBrand({
          logo_icon:       d.brand.logo_icon       || DEFAULTS.logo_icon,
          logo_full_dark:  d.brand.logo_full_dark  || DEFAULTS.logo_full_dark,
          logo_full_light: d.brand.logo_full_light || DEFAULTS.logo_full_light,
          logo_email:      d.brand.logo_email      || '',
          favicon:         d.brand.favicon         || '',
          og_image:        d.brand.og_image        || DEFAULTS.og_image,
          brand_name:      d.brand.brand_name      || DEFAULTS.brand_name,
          brand_color:     d.brand.brand_color     || DEFAULTS.brand_color,
        })
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function isCustom(key: keyof Brand) {
    const val = brand[key] as string
    return !!val && !val.startsWith('/brand/')
  }

  async function uploadFile(key: string, file: File) {
    // Check 1MB limit
    if (file.size > 1024 * 1024) { showToast('File too large — max 1MB'); return }
    setUploading(key)
    try {
      const ext  = file.name.split('.').pop()
      const path = `${key}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('brand').upload(path, file, { upsert: true, contentType: file.type })
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('brand').getPublicUrl(path)
      const url = urlData.publicUrl
      await fetch('/api/brand', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: url }),
      })
      setBrand(prev => ({ ...prev, [key]: url }))
      setSaved(key); setTimeout(() => setSaved(null), 3000)
      showToast('Uploaded ✓')
    } catch (e: any) { showToast(`Upload failed: ${e.message}`) }
    setUploading(null)
  }

  async function removeUpload(key: string) {
    await fetch('/api/brand', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: '' }),
    })
    setBrand(prev => ({ ...prev, [key]: DEFAULTS[key as keyof Brand] || '' }))
    showToast('Removed — using default file')
  }

  async function saveAllSettings() {
    setSavingAll(true)
    await Promise.all([
      fetch('/api/brand', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'brand_name', value: brand.brand_name }) }),
      fetch('/api/brand', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'brand_color', value: brand.brand_color }) }),
    ])
    setSavedAll(true); setTimeout(() => setSavedAll(false), 2000)
    showToast('Brand settings saved ✓')
    setSavingAll(false)
  }

  async function resetAll() {
    const keys = ALL_LOGOS.map(l => l.key)
    await Promise.all(keys.map(k =>
      fetch('/api/brand', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: k, value: '' }) })
    ))
    setBrand(prev => ({ ...prev, ...Object.fromEntries(keys.map(k => [k, DEFAULTS[k as keyof Brand] || ''])) }))
    showToast('All logos reset to default files ✓')
  }

  const hasAnyCustom = ALL_LOGOS.some(l => isCustom(l.key as keyof Brand))

  // Unified logo card component
  function LogoCard({ item }: { item: typeof ALL_LOGOS[0] }) {
    const custom  = isCustom(item.key as keyof Brand)
    const url     = brand[item.key as keyof Brand] as string
    const isUp    = uploading === item.key
    const isSaved = saved === item.key
    const isDark  = item.bg === C.dark

    return (
      <div style={{ background: C.surface, border: `0.5px solid ${custom ? C.blueBorder : C.border}`, borderRadius: 14, overflow: 'hidden' }}>

        {/* Preview zone — checkered background for transparency */}
        <div style={{ position: 'relative', minHeight: item.key === 'og_image' ? 100 : 90, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16,
          background: item.bg === C.surface || item.bg === C.bg || item.bg === '#dee1e6'
            ? `${item.bg}`
            : item.bg,
          backgroundImage: `${CHECKER_BG}`,
          backgroundBlendMode: item.bg === C.dark ? 'overlay' : 'normal',
        }}>
          {/* Dark overlay for dark bg items */}
          {isDark && <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,36,16,0.92)', borderRadius: 0 }}/>}

          {/* Uploaded badge */}
          {custom && (
            <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, background: C.greenBg, border: `0.5px solid ${C.greenBorder}`, borderRadius: 20, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Check size={10} style={{ color: C.green }}/>
              <span style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>Uploaded</span>
            </div>
          )}

          {/* Logo preview */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {custom ? (
              <img src={url} alt={item.label} style={{ maxHeight: item.key === 'og_image' ? 60 : 36, maxWidth: '90%', objectFit: 'contain' }}/>
            ) : item.preview === 'icon' ? (
              <div style={{ width: 40, height: 40, background: brand.brand_color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: C.dark }}>R</span>
              </div>
            ) : item.preview === 'full-dark' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: brand.brand_color, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: C.dark }}>R</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 900, color: C.dark, letterSpacing: '-.5px' }}>{brand.brand_name}</span>
              </div>
            ) : item.preview === 'full-light' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: brand.brand_color, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: C.dark }}>R</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-.5px' }}>{brand.brand_name}</span>
              </div>
            ) : item.preview === 'og' ? (
              <div style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '8px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 12, fontWeight: 900, color: brand.brand_color, margin: 0 }}>{brand.brand_name}</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>Next-gen eBay intelligence</p>
              </div>
            ) : item.preview === 'favicon' ? (
              <div style={{ width: 32, height: 32, background: brand.brand_color, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: C.dark }}>R</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 20, background: brand.brand_color, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 8, fontWeight: 900, color: C.dark }}>R</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 900, color: C.dark }}>{brand.brand_name}</span>
              </div>
            )}
            <span style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', fontFamily: 'monospace', position: 'relative', zIndex: 1 }}>{item.size}</span>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{item.label}</p>
            <span style={{ fontSize: 10, color: custom ? C.blue : C.muted, background: custom ? C.blueBg : C.bg, border: `0.5px solid ${custom ? C.blueBorder : C.border}`, borderRadius: 4, padding: '2px 6px' }}>
              {custom ? 'Custom' : 'Default'}
            </span>
          </div>
          <p style={{ fontSize: 11, color: C.muted, margin: '0 0 10px' }}>{item.desc}</p>

          {/* Upload area */}
          <input type="file" accept={item.accept}
                 ref={el => { fileRefs.current[item.key] = el }}
                 onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(item.key, f) }}
                 style={{ display: 'none' }}/>

          {custom ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => fileRefs.current[item.key]?.click()}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, background: C.blueBg, border: `0.5px solid ${C.blueBorder}`, color: C.blue, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Replace
              </button>
              <button onClick={() => removeUpload(item.key)}
                      style={{ padding: '8px 12px', borderRadius: 8, background: C.redBg, border: `0.5px solid ${C.redBorder}`, color: C.red, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          ) : (
            <div onClick={() => !isUp && fileRefs.current[item.key]?.click()}
                 style={{ border: `1.5px dashed ${C.border}`, borderRadius: 8, padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
              {isUp ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <RefreshCw size={14} style={{ color: C.muted, animation: 'spin 1s linear infinite' }}/>
                  <span style={{ fontSize: 11, color: C.muted }}>Uploading...</span>
                </div>
              ) : isSaved ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Check size={14} style={{ color: C.limeDeep }}/>
                  <span style={{ fontSize: 11, color: C.limeDeep, fontWeight: 600 }}>Uploaded!</span>
                </div>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" style={{ margin: '0 auto 6px', display: 'block' }}>
                    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
                  </svg>
                  <p style={{ fontSize: 11, color: C.muted, margin: '0 0 3px' }}>Click to upload or drag & drop</p>
                  <p style={{ fontSize: 10, color: C.muted, margin: 0, opacity: .65 }}>{item.hint}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: C.dark, border: `1px solid ${C.lime}`, borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <Check size={14} style={{ color: C.lime }}/>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.lime }}>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: '0 0 4px' }}>Brand manager</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Upload logos and brand assets — updates everywhere instantly, no redeploy needed</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {hasAnyCustom && (
            <button onClick={resetAll}
                    style={{ fontSize: 12, color: C.red, background: C.redBg, border: `0.5px solid ${C.redBorder}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
              Reset all
            </button>
          )}
          <button onClick={saveAllSettings} disabled={savingAll}
                  style={{ height: 34, padding: '0 16px', borderRadius: 100, border: 'none', background: savedAll ? C.limeDeep : C.lime, color: C.dark, fontSize: 12, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'background .2s' }}>
            {savingAll ? 'Saving...' : savedAll ? 'Saved!' : 'Save configuration'}
          </button>
          <button onClick={load}
                  style={{ fontSize: 12, color: C.muted, background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 14, padding: '16px 20px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', margin: '0 0 14px' }}>Live preview</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {/* Navbar */}
          <div>
            <p style={{ fontSize: 11, color: C.muted, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="11" rx="1"/></svg>
              Navbar
            </p>
            <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {isCustom('logo_full_dark') ? (
                <img src={brand.logo_full_dark} alt="logo" style={{ height: 22, width: 'auto' }}/>
              ) : (
                <>
                  <div style={{ width: 22, height: 22, background: brand.brand_color, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 900, color: C.dark }}>R</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 900, color: C.dark }}>{brand.brand_name}</span>
                </>
              )}
            </div>
          </div>
          {/* Sidebar */}
          <div>
            <p style={{ fontSize: 11, color: C.muted, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              Sidebar
            </p>
            <div style={{ background: C.dark, borderRadius: 8, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isCustom('logo_icon') ? (
                <img src={brand.logo_icon} alt="logo" style={{ width: 26, height: 26 }}/>
              ) : (
                <div style={{ width: 26, height: 26, background: brand.brand_color, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: C.dark }}>R</span>
                </div>
              )}
            </div>
          </div>
          {/* Browser tab */}
          <div>
            <p style={{ fontSize: 11, color: C.muted, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20"/></svg>
              Browser tab
            </p>
            <div style={{ background: '#dee1e6', borderRadius: '8px 8px 0 0', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, background: brand.brand_color, borderRadius: 3, flexShrink: 0 }}/>
              <span style={{ fontSize: 11, color: '#3c4043', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 }}>{brand.brand_name}</span>
              <span style={{ fontSize: 13, color: '#5f6368', marginLeft: 'auto' }}>×</span>
            </div>
          </div>
        </div>
      </div>

      {/* All logo cards — unified 3-column grid */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', margin: '0 0 10px' }}>Logo assets</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {ALL_LOGOS.map((item) => <LogoCard key={item.key} item={item}/>)}
        </div>
      </div>

      {/* Unified brand settings footer */}
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 14, padding: '20px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', margin: '0 0 16px' }}>Brand configuration</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Brand name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 13, color: C.muted, minWidth: 90, flexShrink: 0 }}>Brand name</label>
            <input value={brand.brand_name}
                   onChange={e => setBrand(p => ({ ...p, brand_name: e.target.value }))}
                   style={{ flex: 1, height: 36, fontSize: 13, padding: '0 12px', borderRadius: 8, border: `0.5px solid ${C.border}`, outline: 'none', color: C.text, fontFamily: 'Inter, sans-serif', background: C.bg }}/>
          </div>
          {/* Brand color */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 13, color: C.muted, minWidth: 90, flexShrink: 0 }}>Brand color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <input type="color" value={brand.brand_color}
                     onChange={e => setBrand(p => ({ ...p, brand_color: e.target.value }))}
                     style={{ width: 36, height: 36, borderRadius: 8, border: `0.5px solid ${C.border}`, cursor: 'pointer', padding: 2, background: 'none', flexShrink: 0 }}/>
              <input value={brand.brand_color}
                     onChange={e => setBrand(p => ({ ...p, brand_color: e.target.value }))}
                     style={{ flex: 1, height: 36, fontSize: 13, padding: '0 12px', borderRadius: 8, border: `0.5px solid ${C.border}`, outline: 'none', color: C.text, fontFamily: 'monospace', background: C.bg }}/>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}