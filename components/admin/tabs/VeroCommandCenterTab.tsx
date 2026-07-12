'use client'
// components/admin/tabs/VeroCommandCenterTab.tsx
// Fixed: confirm delete, CORS proxy, success feedback, click-outside, loading states, brand colors, CSV errors

import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Shield, Link, Search, X, Upload, RefreshCw,
  CheckCircle, XCircle, Inbox, Filter, Cloud,
  AlertTriangle, Trash2, ChevronDown,
} from 'lucide-react'

// â”€â”€ Brand colors (from Riazify design PDF) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  dark:     '#0a0d08',
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  border:   '#e8ede2',
  bg:       '#f7f9f5',
  text:     '#1a2410',
  muted:    '#8a9e78',
  hint:     '#8a9e78',
  surface:  '#ffffff',
}

function getRiskColor(risk: string) {
  if (risk === 'Critical Ban') return '#b91c1c'  // red text   â€” brand PDF
  if (risk === 'High Risk')    return '#92400e'  // amber text â€” brand PDF
  return '#2d6a00'                               // lime text  â€” brand PDF
}
function getRiskBg(risk: string) {
  if (risk === 'Critical Ban') return '#fff0f0'  // red tint
  if (risk === 'High Risk')    return '#fffbea'  // amber tint
  return '#f4ffe6'                               // lime tint
}
function getRiskBorder(risk: string) {
  if (risk === 'Critical Ban') return 'rgba(252,165,165,0.5)'
  if (risk === 'High Risk')    return 'rgba(252,211,77,0.5)'
  return 'rgba(143,255,0,0.3)'
}

interface Props {
  isInvestorMode?:      boolean
  isMobile?:            boolean
  startChartAnimation?: boolean
}

// â”€â”€ Confirm delete dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ConfirmDialog({ brand, onClose, onConfirm }: {
  brand: string; onClose: () => void; onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl border p-6 w-full max-w-sm" style={{ borderColor: C.border }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: '#FEF2F2' }}>
            <Trash2 size={18} style={{ color: '#f87171' }} />
          </div>
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.text }}>Remove Brand?</p>
            <p className="text-[12px]" style={{ color: C.muted }}>This cannot be undone</p>
          </div>
        </div>
        <p className="text-[13px] mb-5 px-1" style={{ color: C.muted }}>
          Are you sure you want to remove <strong style={{ color: C.text }}>{brand}</strong> from the VeRO database?
          Users will no longer be protected from this brand.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-lg border text-[13px] font-semibold"
            style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
          <button onClick={() => { onConfirm(); onClose() }}
            className="flex-1 py-2 rounded-lg text-[13px] font-bold text-white"
            style={{ backgroundColor: '#f87171' }}>Remove</button>
        </div>
      </div>
    </div>
  )
}

// â”€â”€ Reusable FocusInput â€” lime border outside on focus â”€â”€â”€â”€â”€â”€â”€â”€
function FocusInput({ value, onChange, placeholder, onKeyDown, className, type }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  className?: string
  type?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      value={value}
      type={type ?? 'text'}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`h-11 px-4 rounded-xl text-[13px] ${className ?? ''}`}
      style={{
        backgroundColor: C.bg,
        color:           C.text,
        outline:         'none',
        border:          `1.5px solid ${focused ? C.lime : C.border}`,
        boxShadow:       focused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
        transition:      'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    />
  )
}

// â”€â”€ Search bar â€” smooth lime border outside on focus â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SearchBar({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex-1 flex items-center gap-2 h-11 px-3 rounded-xl bg-white transition-all"
         style={{
           border:     `1.5px solid ${focused ? C.lime : C.border}`,
           boxShadow:  focused ? `0 0 0 3px rgba(143,255,0,0.15)` : 'none',
           transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
         }}>
      <Search size={16} style={{ color: focused ? C.limeDeep : C.muted }} />
      <input
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search database for a specific brand..."
        className="flex-1 text-[14px] bg-transparent"
        style={{ color: C.text, outline: 'none', border: 'none', boxShadow: 'none' }}
      />
      {searchQuery && (
        <button onClick={() => setSearchQuery('')}>
          <X size={16} style={{ color: C.hint }} />
        </button>
      )}
    </div>
  )
}

// â”€â”€ Risk Dropdown â€” pill style matching admin page design â”€â”€â”€â”€â”€
function RiskDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const options = ['Critical Ban', 'High Risk', 'Caution']

  return (
    <div className="relative flex-[2]">
      <button onClick={() => setOpen(s => !s)}
        className="w-full flex items-center justify-between h-11 px-4 rounded-xl border text-[13px] font-semibold transition-all"
        style={{
          backgroundColor: C.bg,
          borderColor:     open ? C.lime : C.border,
          color:           C.text,
        }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0"
               style={{ backgroundColor: getRiskColor(value) }} />
          <span>{value}</span>
        </div>
        <ChevronDown size={14} style={{
          color:     C.muted,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border overflow-hidden py-2 px-2 flex flex-col gap-1"
               style={{
                 backgroundColor: '#fff',
                 borderColor:     C.border,
                 boxShadow:       '0 8px 24px rgba(0,0,0,0.10)',
               }}>
            {options.map(o => {
              const isSelected = o === value
              return (
                <button key={o} onClick={() => { onChange(o); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all text-left"
                  style={{
                    backgroundColor: isSelected ? C.lime : 'transparent',
                    color:           isSelected ? C.dark : C.text,
                  }}>
                  <div className="w-2 h-2 rounded-full shrink-0"
                       style={{ backgroundColor: isSelected ? C.dark : getRiskColor(o) }} />
                  {o}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
function GoogleSheetDialog({ onClose, onSync }: { onClose: () => void; onSync: (url: string) => void }) {
  const [url, setUrl] = useState('')
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl border p-6 w-full max-w-md" style={{ borderColor: C.border }}>
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw size={18} style={{ color: C.dark }} />
          <p className="text-[16px] font-bold" style={{ color: C.dark }}>Sync Google Sheet</p>
        </div>
        <p className="text-[13px] mb-2" style={{ color: C.muted }}>
          Ensure your sheet is set to <strong>'Anyone with the link can view'</strong>. Paste the link below.
        </p>
        <div className="flex items-start gap-2 p-3 rounded-lg border mb-4"
             style={{ backgroundColor: C.limeTint, borderColor: C.lime+'40' }}>
          <AlertTriangle size={13} style={{ color: C.limeDeep, marginTop: 1, flexShrink: 0 }} />
          <p className="text-[11px]" style={{ color: C.limeDeep }}>
            Sheet must have columns: Brand Name, Risk Level (Critical Ban / High Risk / Caution), Evidence URL
          </p>
        </div>
        <FocusInput
          value={url}
          onChange={setUrl}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          className="w-full mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-lg border text-[13px] font-semibold"
            style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
          <button onClick={() => { if (url.trim()) { onSync(url.trim()); onClose() } }}
            disabled={!url.trim()}
            className="flex-1 py-2 rounded-lg text-[13px] font-bold text-white"
            style={{ backgroundColor: C.dark, opacity: url.trim() ? 1 : 0.5 }}>
            Start Sync
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VeroCommandCenterTab({ isMobile }: Props) {
  const { can } = useTabPermissions('vero_center')
  const supabase = createClient()

  const [loading,        setLoading]        = useState(true)
  const [isAdding,       setIsAdding]       = useState(false)
  const [isSyncing,      setIsSyncing]      = useState(false)
  const [isDragging,     setIsDragging]     = useState(false)
  const [showGSheet,     setShowGSheet]     = useState(false)
  const [removingBrand,  setRemovingBrand]  = useState<string | null>(null)
  const [confirmBrand,   setConfirmBrand]   = useState<string | null>(null)  // Fix 1

  // Fix 3 â€” success/error feedback states
  const [addSuccess,     setAddSuccess]     = useState(false)
  const [syncFeedback,   setSyncFeedback]   = useState<{ ok: boolean; msg: string } | null>(null)
  const [csvError,       setCsvError]       = useState<string | null>(null)  // Fix 7

  const [brands,         setBrands]         = useState<any[]>([])
  const [pendingReports, setPendingReports] = useState<any[]>([])

  const [brandName,      setBrandName]      = useState('')
  const [evidenceUrl,    setEvidenceUrl]    = useState('')
  const [selectedRisk,   setSelectedRisk]   = useState('High Risk')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [activeFilter,   setActiveFilter]   = useState('All')
  const [showFilter,     setShowFilter]     = useState(false)

  const fileRef      = useRef<HTMLInputElement>(null)
  const filterRef    = useRef<HTMLDivElement>(null)  // Fix 4

  // Fix 4 â€” close filter on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => { fetchLiveDatabase() }, [])

  async function fetchLiveDatabase() {
    try {
      const [{ data: brandsData }, { data: reportsData }] = await Promise.all([
        supabase.from('vero_brands').select('*').order('created_at', { ascending: false }),
        supabase.from('vero_reports').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      ])
      setBrands(brandsData ?? [])
      setPendingReports(reportsData ?? [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function addNewBrand() {
    if (!brandName.trim()) return
    setIsAdding(true)
    try {
      const { error } = await (supabase.from('vero_brands') as any).insert([{
        brand_name:   brandName.trim(),
        risk_level:   selectedRisk,
        evidence_url: evidenceUrl.trim() || null,
        added_by:     'Admin',
      }])
      if (error?.code === '23505') {
        alert('This brand is already in the database!')
      } else {
        setBrandName(''); setEvidenceUrl('')
        // Fix 3 â€” success feedback
        setAddSuccess(true)
        setTimeout(() => setAddSuccess(false), 3000)
        await fetchLiveDatabase()
      }
    } catch (e) { console.error(e) }
    setIsAdding(false)
  }

  // Fix 7 â€” CSV error feedback + validation
  async function processCSVData(csv: string, source: string) {
    setCsvError(null)
    const lines = csv.split('\n')
    const toUpload: any[] = []

    for (const line of lines) {
      const clean = line.trim().replace(/"/g, '')
      if (!clean) continue
      const parts = clean.split(',')
      const name  = parts[0].trim()
      if (!name || name.toLowerCase() === 'brand name' || name.toLowerCase() === 'brand') continue
      let risk = 'High Risk'
      if (parts.length > 1) {
        const r = parts[1].trim()
        if (['Critical Ban', 'High Risk', 'Caution'].includes(r)) risk = r
      }
      toUpload.push({
        brand_name:   name,
        risk_level:   risk,
        evidence_url: parts[2]?.trim() || null,
        added_by:     `Bulk Sync (${source})`,
      })
    }

    if (toUpload.length === 0) {
      setCsvError('âŒ No valid brands found in file. Check CSV format: Brand Name, Risk Level, Evidence URL')
      setIsSyncing(false)
      return
    }

    try {
      await (supabase.from('vero_brands') as any).upsert(toUpload, { onConflict: 'brand_name' })
      setSyncFeedback({ ok: true, msg: `âœ… ${toUpload.length} brands synced successfully!` })
      setTimeout(() => setSyncFeedback(null), 4000)
      await fetchLiveDatabase()
    } catch (e) {
      setSyncFeedback({ ok: false, msg: 'âŒ Sync failed â€” check Supabase connection' })
      setTimeout(() => setSyncFeedback(null), 4000)
      console.error(e)
    }
    setIsSyncing(false)
  }

  async function handleReport(report: any, approve: boolean) {
    if (approve) {
      await (supabase.from('vero_brands') as any).upsert([{
        brand_name:   report.brand_name,
        risk_level:   'High Risk',
        evidence_url: report.reason,
        added_by:     `Community: ${report.reported_by}`,
      }], { onConflict: 'brand_name' })
    }
    await (supabase.from('vero_reports') as any)
      .update({ status: approve ? 'approved' : 'rejected' })
      .eq('id', report.id)
    await fetchLiveDatabase()
  }

  // Fix 1 + 5 â€” confirm dialog + loading state on remove
  async function removeBrand(name: string) {
    setRemovingBrand(name)
    try {
      await supabase.from('vero_brands').delete().eq('brand_name', name)
      await fetchLiveDatabase()
    } catch (e) { console.error(e) }
    setRemovingBrand(null)
  }

  function convertToCSVLink(url: string) {
    if (url.includes('/pub?output=csv') || url.includes('export?format=csv')) return url
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
    if (match) return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`
    return url
  }

  // Fix 2 â€” Google Sheets CORS: use Supabase Edge Function as proxy
  async function syncGoogleSheet(url: string) {
    setIsSyncing(true)
    setCsvError(null)
    try {
      const csvLink = convertToCSVLink(url)

      // Try via Supabase Edge Function proxy first (avoids CORS)
      let text = ''
      try {
        const result = await supabase.functions.invoke('csv-proxy', {
          body: { url: csvLink }
        })
        if (result.data?.csv) {
          text = result.data.csv
        } else {
          throw new Error('No CSV from proxy')
        }
      } catch {
        // Fallback: direct fetch (works if sheet is truly public)
        const res = await fetch(csvLink)
        if (!res.ok) throw new Error('Failed to load sheet')
        text = await res.text()
        if (text.toLowerCase().includes('<!doctype html')) {
          throw new Error('HTML returned â€” make sure sheet is public')
        }
      }

      await processCSVData(text, 'Google Sheets')
    } catch (e: any) {
      setSyncFeedback({ ok: false, msg: `âŒ ${e.message ?? 'Sync failed â€” make sheet public first'}` })
      setTimeout(() => setSyncFeedback(null), 5000)
      setIsSyncing(false)
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setCsvError('âŒ Only CSV files are supported')
      return
    }
    setIsSyncing(true)
    setCsvError(null)
    const reader = new FileReader()
    reader.onload = ev => processCSVData(ev.target?.result as string, 'File Upload')
    reader.readAsText(file)
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragging(true) }
  function onDragLeave() { setIsDragging(false) }
  async function onDrop(e: React.DragEvent) {
    e.preventDefault(); setIsDragging(false); setIsSyncing(true)
    const file = e.dataTransfer.files[0]
    if (!file) { setIsSyncing(false); return }
    const text = await file.text()
    await processCSVData(text, 'Dragged File')
  }

  const filteredBrands = brands.filter(b => {
    const nameMatch   = b.brand_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const filterMatch = activeFilter === 'All' || b.risk_level === activeFilter
    return nameMatch && filterMatch
  })

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
           style={{ borderTopColor: C.dark }} />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">

      {/* Pending reports banner */}
      {pendingReports.length > 0 && (
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
          <div className="flex items-center gap-2 mb-3">
            <Inbox size={18} style={{ color: '#D97706' }} />
            <p className="text-[16px] font-bold" style={{ color: '#92400E' }}>
              {pendingReports.length} Community Report{pendingReports.length > 1 ? 's' : ''} Pending Review
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {pendingReports.map((report, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border"
                   style={{ borderColor: '#FDE68A' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-bold" style={{ color: C.text }}>{report.brand_name}</span>
                    <span className="text-[12px]" style={{ color: C.hint }}>
                      Reported by {report.reported_by ?? 'User'}
                    </span>
                  </div>
                  {report.reason && (
                    <p className="text-[13px] italic mt-0.5" style={{ color: C.muted }}>
                      Reason: {report.reason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {can('approve_report') && <button onClick={() => handleReport(report, false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80"
                    style={{ backgroundColor: '#FEF2F2' }}>
                    <XCircle size={16} style={{ color: '#f87171' }} />
                  </button>}
                  {can('approve_report') && <button onClick={() => handleReport(report, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-white"
                    style={{ backgroundColor: C.dark }}>
                    <CheckCircle size={13} /> Approve & Ban
                  </button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add brand card */}
      <div className="p-6 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <h2 className="text-[18px] font-bold mb-1" style={{ color: C.text }}>Global VeRO Command Center</h2>
        <p className="text-[13px] mb-5" style={{ color: C.muted }}>
          Add restricted brands here. Changes apply globally to all users instantly.
        </p>

        {/* Fix 3 â€” Add success banner */}
        {addSuccess && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border mb-4"
               style={{ backgroundColor: C.limeTint, borderColor: C.lime+'50' }}>
            <CheckCircle size={14} style={{ color: C.limeDeep }} />
            <p className="text-[12px] font-bold" style={{ color: C.limeDeep }}>
              âœ… Brand added successfully! All users are now protected.
            </p>
          </div>
        )}

        {/* Add brand form */}
        <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'items-center'}`}>
          <FocusInput
            value={brandName}
            onChange={setBrandName}
            placeholder="Enter brand name..."
            onKeyDown={e => e.key === 'Enter' && addNewBrand()}
            className={isMobile ? 'w-full' : 'flex-[2]'}
          />
          <FocusInput
            value={evidenceUrl}
            onChange={setEvidenceUrl}
            placeholder="Evidence Link (Optional)"
            className={isMobile ? 'w-full' : 'flex-[2]'}
          />
          <RiskDropdown value={selectedRisk} onChange={setSelectedRisk} />
          {can('add_brand') && <button onClick={addNewBrand} disabled={isAdding || !brandName.trim()}
            className={`h-11 flex items-center justify-center gap-2 rounded-xl text-[13px] font-bold transition-all ${isMobile ? 'w-full' : 'px-5'}`}
            style={{
              backgroundColor: C.dark,
              opacity: !brandName.trim() ? 0.5 : 1,
            }}>
            {isAdding
              ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
              : <Shield size={16} style={{ color: C.lime }} />}
            <span style={{ color: C.lime }}>{isAdding ? 'Saving...' : 'Ban Brand'}</span>
          </button>}
        </div>

        {/* Bulk import divider */}
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
          <span className="text-[11px] font-bold tracking-widest" style={{ color: C.hint }}>BULK IMPORT</span>
          <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
        </div>

        {/* Fix 7 â€” CSV error banner */}
        {csvError && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border mb-4"
               style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
            <XCircle size={14} style={{ color: '#f87171' }} />
            <p className="text-[12px] font-bold" style={{ color: '#b91c1c' }}>{csvError}</p>
          </div>
        )}

        {/* Sync feedback banner */}
        {syncFeedback && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border mb-4"
               style={{
                 backgroundColor: syncFeedback.ok ? C.limeTint : '#FEF2F2',
                 borderColor:     syncFeedback.ok ? C.lime+'50' : '#FECACA',
               }}>
            {syncFeedback.ok
              ? <CheckCircle size={14} style={{ color: C.limeDeep }} />
              : <XCircle     size={14} style={{ color: '#f87171'  }} />}
            <p className="text-[12px] font-bold"
               style={{ color: syncFeedback.ok ? C.limeDeep : '#b91c1c' }}>
              {syncFeedback.msg}
            </p>
          </div>
        )}

        {/* Drag & drop + Google Sheets */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col' : ''}`}>
          <div className={isMobile ? 'w-full' : 'flex-[2]'}
               onDragOver={can('import_csv') ? onDragOver : undefined}
               onDragLeave={can('import_csv') ? onDragLeave : undefined}
               onDrop={can('import_csv') ? onDrop : undefined}
               onClick={() => can('import_csv') && !isSyncing && fileRef.current?.click()}
               style={{
                 padding: '24px 0', textAlign: 'center',
                 backgroundColor: isDragging ? 'rgba(143,255,0,0.08)' : C.bg,
                 borderRadius: 12,
                 border: `1.5px dashed ${isDragging ? C.lime : '#CBD5E1'}`,
                 cursor: can('import_csv') ? (isSyncing ? 'not-allowed' : 'pointer') : 'not-allowed',
                 opacity: can('import_csv') ? 1 : 0.5,
                 display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
               }}>
            {isSyncing
              ? <div className="w-7 h-7 rounded-full border-2 border-transparent animate-spin"
                     style={{ borderTopColor: C.dark }} />
              : <Upload size={26} style={{ color: isDragging ? C.dark : C.muted }} />}
            <p className="text-[14px] font-bold" style={{ color: isDragging ? C.dark : '#334155' }}>
              {isSyncing ? 'Syncing to Cloud...' : isDragging ? 'Drop CSV Here!' : 'Drag & Drop CSV File'}
            </p>
            <p className="text-[11px]" style={{ color: C.muted }}>
              Format: Brand Name, Risk Level, Evidence URL
            </p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </div>

          {/* Fix 2 â€” Google Sheets with proxy info */}
          <div className={isMobile ? 'w-full' : 'flex-1'}
               onClick={() => can('sync_sheet') && !isSyncing && setShowGSheet(true)}
               style={{
                 padding: '24px 0', borderRadius: 12, cursor: can('sync_sheet') ? 'pointer' : 'not-allowed',
                 backgroundColor: C.dark,
                 opacity: can('sync_sheet') ? 1 : 0.5,
                 display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                 border: `1px solid rgba(143,255,0,0.2)`,
               }}>
            <RefreshCw size={26} style={{ color: C.lime }} />
            <p className="text-[14px] font-bold" style={{ color: '#fff' }}>Google Sheets Sync</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Via csv-proxy edge function</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Fix 4 â€” click-outside ref on filter */}
        <div className="relative" ref={filterRef}>
          <button onClick={() => setShowFilter(s => !s)}
            className="h-11 w-11 flex items-center justify-center rounded-xl border transition-all"
            style={{
              backgroundColor: activeFilter !== 'All' ? C.limeTint : '#fff',
              borderColor:     activeFilter !== 'All' ? C.lime    : C.border,
            }}>
            <Filter size={16} style={{ color: activeFilter !== 'All' ? C.limeDeep : C.muted }} />
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border bg-white shadow-lg overflow-hidden"
                 style={{ borderColor: C.border, minWidth: 180 }}>
              {['All', 'Critical Ban', 'High Risk', 'Caution'].map(f => (
                <button key={f} onClick={() => { setActiveFilter(f); setShowFilter(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[13px] hover:bg-gray-50"
                  style={{ color: C.text, fontWeight: f === activeFilter ? 700 : 500 }}>
                  {f !== 'All' && (
                    <div className="w-2 h-2 rounded-full"
                         style={{ backgroundColor: getRiskBg(f), border: `1.5px solid ${getRiskColor(f)}` }} />
                  )}
                  {f === 'All' ? 'Show All Brands' : f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Brand list header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-[16px] font-bold" style={{ color: C.text }}>Live Cloud Database</p>
          {activeFilter !== 'All' && (
            <span className="px-2 py-1 rounded-md text-[10px] font-bold text-white"
                  style={{ backgroundColor: C.dark }}>
              Filtered: {activeFilter}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold" style={{ color: C.hint }}>
            {filteredBrands.length} Protected
          </span>
          <button onClick={fetchLiveDatabase}
            className="w-7 h-7 flex items-center justify-center rounded-lg border"
            style={{ borderColor: C.border }}>
            <RefreshCw size={13} style={{ color: C.muted }} />
          </button>
        </div>
      </div>

      {/* Brand tags */}
      {filteredBrands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 rounded-2xl border"
             style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <Cloud size={48} style={{ color: '#E2E8F0' }} />
          <p className="text-[16px] font-bold mt-4" style={{ color: C.muted }}>
            {searchQuery || activeFilter !== 'All' ? 'No brands match your filter' : 'Cloud Database is empty.'}
          </p>
          <p className="text-[13px]" style={{ color: C.hint }}>
            {searchQuery || activeFilter !== 'All'
              ? 'Try clearing the search or filter'
              : 'Sync your sheet or add a brand to protect your users.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {filteredBrands.map((b, i) => {
            const riskColor  = getRiskColor(b.risk_level ?? 'High Risk')
            const isRemoving = removingBrand === b.brand_name
            return (
              <div key={i}
                title={b.evidence_url ? `Evidence: ${b.evidence_url}` : 'No evidence attached'}
                className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-full border bg-white"
                style={{
                  borderColor: getRiskBorder(b.risk_level ?? 'High Risk'),
                  backgroundColor: getRiskBg(b.risk_level ?? 'High Risk'),
                  maxWidth: 250,
                  opacity: isRemoving ? 0.5 : 1,
                }}>
                <Shield size={13} style={{ color: riskColor }} />
                <span className="text-[13px] font-bold truncate" style={{ color: C.text }}>
                  {b.brand_name}
                </span>
                {b.evidence_url && <Link size={11} style={{ color: C.hint }} />}
                {/* Fix 1 â€” confirm before delete */}
                {can('remove_brand') && <button
                  onClick={() => setConfirmBrand(b.brand_name)}
                  disabled={isRemoving}
                  className="ml-1 w-5 h-5 flex items-center justify-center rounded-full hover:opacity-80 transition-all"
                  style={{ backgroundColor: '#F1F5F9' }}>
                  {isRemoving
                    ? <div className="w-3 h-3 rounded-full border border-transparent animate-spin"
                           style={{ borderTopColor: C.muted }} />
                    : <X size={12} style={{ color: C.muted }} />}
                </button>}
              </div>
            )
          })}
        </div>
      )}

      {/* Fix 1 â€” confirm delete dialog */}
      {confirmBrand && (
        <ConfirmDialog
          brand={confirmBrand}
          onClose={() => setConfirmBrand(null)}
          onConfirm={() => removeBrand(confirmBrand)}
        />
      )}

      {/* Google Sheet dialog */}
      {showGSheet && (
        <GoogleSheetDialog
          onClose={() => setShowGSheet(false)}
          onSync={syncGoogleSheet}
        />
      )}

    </div>
  )
}
