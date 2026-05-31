'use client'
// components/admin/tabs/VeroCommandCenterTab.tsx
// Converted 1:1 from lib/pages/admin_tabs/vero_command_center_tab.dart

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Shield, Link, Search, X, Upload, RefreshCw,
  CheckCircle, XCircle, Inbox, Filter, Cloud,
  AlertTriangle,
} from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────
const C = {
  dark:   '#0F172A',
  lime:   '#8FFF00',
  border: '#E2E8F0',
  bg:     '#F8FAFC',
  text:   '#0F172A',
  muted:  '#64748B',
  hint:   '#94A3B8',
}

function getRiskColor(risk: string) {
  if (risk === 'Critical Ban') return '#F87171'
  if (risk === 'High Risk')    return '#FB923C'
  return '#FBBF24' // Caution
}

interface Props {
  isInvestorMode?:      boolean
  isMobile?:            boolean
  startChartAnimation?: boolean
}

// ── Google Sheets sync dialog ──────────────────────────────────
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
        <p className="text-[13px] mb-4" style={{ color: C.muted }}>
          Ensure your sheet is set to 'Anyone with the link can view'. Paste the normal link below.
        </p>
        <input value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          className="w-full h-10 px-3 rounded-lg border text-[13px] outline-none mb-4"
          style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-lg border text-[13px] font-semibold"
            style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
          <button onClick={() => { if (url.trim()) { onSync(url.trim()); onClose() } }}
            className="flex-1 py-2 rounded-lg text-[13px] font-bold text-white"
            style={{ backgroundColor: C.dark }}>Start Sync</button>
        </div>
      </div>
    </div>
  )
}

export default function VeroCommandCenterTab({ isMobile }: Props) {
  const supabase = createClient()

  const [loading,       setLoading]       = useState(true)
  const [isAdding,      setIsAdding]      = useState(false)
  const [isSyncing,     setIsSyncing]     = useState(false)
  const [isDragging,    setIsDragging]    = useState(false)
  const [showGSheet,    setShowGSheet]    = useState(false)

  const [brands,        setBrands]        = useState<any[]>([])
  const [pendingReports,setPendingReports]= useState<any[]>([])

  const [brandName,     setBrandName]     = useState('')
  const [evidenceUrl,   setEvidenceUrl]   = useState('')
  const [selectedRisk,  setSelectedRisk]  = useState('High Risk')
  const [searchQuery,   setSearchQuery]   = useState('')
  const [activeFilter,  setActiveFilter]  = useState('All')
  const [showFilter,    setShowFilter]    = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

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
        alert('This brand is already banned!')
      } else {
        setBrandName(''); setEvidenceUrl('')
        await fetchLiveDatabase()
      }
    } catch (e) { console.error(e) }
    setIsAdding(false)
  }

  async function processCSVData(csv: string, source: string) {
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
      toUpload.push({ brand_name: name, risk_level: risk, evidence_url: parts[2]?.trim() || null, added_by: `Bulk Sync (${source})` })
    }
    try {
      await (supabase.from('vero_brands') as any).upsert(toUpload, { onConflict: 'brand_name' })
      await fetchLiveDatabase()
    } catch (e) { console.error(e) }
    setIsSyncing(false)
  }

  async function handleReport(report: any, approve: boolean) {
    if (approve) {
      await (supabase.from('vero_brands') as any).upsert([{
        brand_name: report.brand_name, risk_level: 'High Risk',
        evidence_url: report.reason, added_by: `Community: ${report.reported_by}`,
      }], { onConflict: 'brand_name' })
    }
    await (supabase.from('vero_reports') as any).update({ status: approve ? 'approved' : 'rejected' }).eq('id', report.id)
    await fetchLiveDatabase()
  }

  async function removeBrand(name: string) {
    await supabase.from('vero_brands').delete().eq('brand_name', name)
    await fetchLiveDatabase()
  }

  function convertToCSVLink(url: string) {
    if (url.includes('/pub?output=csv') || url.includes('export?format=csv')) return url
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
    if (match) return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`
    return url
  }

  async function syncGoogleSheet(url: string) {
    setIsSyncing(true)
    try {
      const csvLink = convertToCSVLink(url)
      const res = await fetch(csvLink)
      if (!res.ok) throw new Error('Failed to load')
      const text = await res.text()
      if (text.toLowerCase().startsWith('<!doctype html') || text.toLowerCase().startsWith('<html')) throw new Error('HTML returned')
      await processCSVData(text, 'Google Sheets')
    } catch (e) { setIsSyncing(false) }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsSyncing(true)
    const reader = new FileReader()
    reader.onload = ev => processCSVData(ev.target?.result as string, 'File Upload')
    reader.readAsText(file)
  }

  // Drag and drop
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
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.dark }} />
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
              {pendingReports.length} Community Reports Pending Review
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {pendingReports.map((report, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border" style={{ borderColor: '#FDE68A' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-bold" style={{ color: C.text }}>{report.brand_name}</span>
                    <span className="text-[12px]" style={{ color: C.hint }}>Reported by {report.reported_by ?? 'User'}</span>
                  </div>
                  {report.reason && <p className="text-[13px] italic mt-0.5" style={{ color: C.muted }}>Reason: {report.reason}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleReport(report, false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80"
                    style={{ backgroundColor: '#FEF2F2' }}>
                    <XCircle size={16} style={{ color: '#F87171' }} />
                  </button>
                  <button onClick={() => handleReport(report, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-white"
                    style={{ backgroundColor: C.dark }}>
                    <CheckCircle size={13} /> Approve & Ban
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add brand card */}
      <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>
        <h2 className="text-[18px] font-bold mb-1" style={{ color: C.text }}>Global VeRO Command Center</h2>
        <p className="text-[13px] mb-6" style={{ color: C.muted }}>
          Add restricted brands here. Changes apply globally to all users instantly.
        </p>

        {/* Add brand form */}
        <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'items-center'}`}>
          <input value={brandName} onChange={e => setBrandName(e.target.value)}
            placeholder="Enter brand name..."
            onKeyDown={e => e.key === 'Enter' && addNewBrand()}
            className={`h-11 px-4 rounded-xl border text-[13px] outline-none ${isMobile ? 'w-full' : 'flex-[2]'}`}
            style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }} />
          <input value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)}
            placeholder="Evidence Link (Optional)"
            className={`h-11 px-4 rounded-xl border text-[13px] outline-none ${isMobile ? 'w-full' : 'flex-[2]'}`}
            style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }} />
          <div className={`h-11 px-4 rounded-xl border flex items-center ${isMobile ? 'w-full' : 'flex-[2]'}`}
               style={{ backgroundColor: C.bg, borderColor: C.border }}>
            <select value={selectedRisk} onChange={e => setSelectedRisk(e.target.value)}
              className="w-full text-[13px] font-bold outline-none bg-transparent"
              style={{ color: C.text }}>
              {['Critical Ban', 'High Risk', 'Caution'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button onClick={addNewBrand} disabled={isAdding}
            className={`h-11 flex items-center justify-center gap-2 rounded-xl text-[13px] font-bold text-white transition-all ${isMobile ? 'w-full' : 'px-5'}`}
            style={{ backgroundColor: C.dark }}>
            {isAdding
              ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
              : <Shield size={16} style={{ color: C.lime }} />}
            {isAdding ? 'Saving...' : 'Ban Brand'}
          </button>
        </div>

        {/* Bulk import divider */}
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
          <span className="text-[11px] font-bold tracking-widest" style={{ color: C.hint }}>BULK IMPORT</span>
          <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
        </div>

        {/* Drag & drop + Google Sheets */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col' : ''}`}>
          {/* Drag & Drop zone */}
          <div className={isMobile ? 'w-full' : 'flex-[2]'}
               onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
               onClick={() => !isSyncing && fileRef.current?.click()}
               style={{
                 padding: '24px 0',
                 backgroundColor: isDragging ? 'rgba(143,255,0,0.08)' : C.bg,
                 borderRadius: 12,
                 border: `1.5px dashed ${isDragging ? C.lime : '#CBD5E1'}`,
                 cursor: isSyncing ? 'not-allowed' : 'pointer',
                 textAlign: 'center',
                 display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
               }}>
            {isSyncing
              ? <div className="w-7 h-7 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.dark }} />
              : <Upload size={26} style={{ color: isDragging ? C.dark : C.muted }} />}
            <p className="text-[14px] font-bold" style={{ color: isDragging ? C.dark : '#334155' }}>
              {isSyncing ? 'Syncing to Cloud...' : isDragging ? 'Drop CSV Here!' : 'Drag & Drop CSV File'}
            </p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </div>

          {/* Google Sheets */}
          <div className={isMobile ? 'w-full' : 'flex-1'}
               onClick={() => !isSyncing && setShowGSheet(true)}
               style={{
                 padding: '24px 0',
                 backgroundColor: C.dark, borderRadius: 12, cursor: 'pointer',
                 display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
               }}>
            <RefreshCw size={26} style={{ color: C.lime }} />
            <p className="text-[14px] font-bold text-white">Google Sheets Sync</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 h-11 px-3 rounded-xl border bg-white"
             style={{ borderColor: C.border }}>
          <Search size={16} style={{ color: C.muted }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search database for a specific brand..."
            className="flex-1 text-[14px] outline-none bg-transparent"
            style={{ color: C.text }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={16} style={{ color: C.hint }} />
            </button>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setShowFilter(s => !s)}
            className="h-11 w-11 flex items-center justify-center rounded-xl border transition-all"
            style={{
              backgroundColor: activeFilter !== 'All' ? '#F1F5F9' : '#fff',
              borderColor:     activeFilter !== 'All' ? C.hint : C.border,
            }}>
            <Filter size={16} style={{ color: activeFilter !== 'All' ? C.text : C.muted }} />
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border bg-white shadow-lg overflow-hidden"
                 style={{ borderColor: C.border, minWidth: 180 }}>
              {['All', 'Critical Ban', 'High Risk', 'Caution'].map(f => (
                <button key={f} onClick={() => { setActiveFilter(f); setShowFilter(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[13px] font-semibold hover:bg-gray-50"
                  style={{ color: f === activeFilter ? C.text : C.muted, fontWeight: f === activeFilter ? 700 : 500 }}>
                  {f !== 'All' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRiskColor(f) }} />}
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
            <span className="px-2 py-1 rounded-md text-[10px] font-bold text-white" style={{ backgroundColor: C.dark }}>
              Filtered: {activeFilter}
            </span>
          )}
        </div>
        <span className="text-[12px] font-bold" style={{ color: C.hint }}>{filteredBrands.length} Protected</span>
      </div>

      {/* Brand tags */}
      {filteredBrands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 rounded-2xl border"
             style={{ backgroundColor: '#fff', borderColor: C.border }}>
          <Cloud size={48} style={{ color: '#E2E8F0' }} />
          <p className="text-[16px] font-bold mt-4" style={{ color: C.muted }}>Cloud Database is empty.</p>
          <p className="text-[13px]" style={{ color: C.hint }}>Sync your sheet or add a brand to protect your users.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {filteredBrands.map((b, i) => {
            const riskColor = getRiskColor(b.risk_level ?? 'High Risk')
            return (
              <div key={i} title={b.evidence_url ? `Evidence: ${b.evidence_url}` : 'No evidence attached'}
                className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-full border bg-white"
                style={{ borderColor: C.border, maxWidth: 250 }}>
                <Shield size={13} style={{ color: riskColor }} />
                <span className="text-[13px] font-bold truncate" style={{ color: C.text }}>{b.brand_name}</span>
                {b.evidence_url && <Link size={11} style={{ color: C.hint }} />}
                <button onClick={() => removeBrand(b.brand_name)}
                  className="ml-1 w-5 h-5 flex items-center justify-center rounded-full hover:opacity-80"
                  style={{ backgroundColor: '#F1F5F9' }}>
                  <X size={12} style={{ color: C.muted }} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Google Sheet dialog */}
      {showGSheet && (
        <GoogleSheetDialog onClose={() => setShowGSheet(false)} onSync={syncGoogleSheet} />
      )}

    </div>
  )
}