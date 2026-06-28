'use client'
// app/dashboard/inventory/page.tsx
// ═══════════════════════════════════════════════════════════════
// Converted from: lib/pages/inventory_page.dart
//
// What the Dart version had:
//   ✅ Left sidebar — folder list (All Saved, Amazon Arbitrage, AliExpress, Q4 Pet Toys)
//   ✅ Active folder — lime left border + highlight
//   ✅ Create New Folder button
//   ✅ Main area — header, search, Export CSV, Sync Prices buttons
//   ✅ Table header — checkbox, PRODUCT, SUPPLIER, COST/SELL, MARGIN, STATUS, UPDATED, DELETE
//   ✅ Table rows — hover effect, checkbox, image, title, copy icon on hover
//   ✅ Status dropdown — 🟡 Researching / 🟢 Listed / 🔴 Out of Stock
//   ✅ Delete button (trash icon) — appears on row hover
//   ✅ Empty state — icon + message when no products
//   ✅ Select all checkbox
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import {
  Folder, FolderOpen, Search, Download, RefreshCw,
  Package, Copy, Trash2, ChevronDown, Plus,
} from 'lucide-react'
import { useToast } from '@/components/ui/AppToast'
import { cn } from '@/lib/utils'
import KillSwitchGate from '@/components/KillSwitchGate'

// ── Types ──────────────────────────────────────────────────────
interface InventoryItem {
  id: string
  imageUrl: string
  title: string
  supplier: string
  cost: string
  sell: string
  margin: string
  status: '🟡 Researching' | '🟢 Listed' | '🔴 Out of Stock'
  updated: string
  folder: string
}

// ── Mock data (mirrors InventoryStore in Dart) ─────────────────
const MOCK_ITEMS: InventoryItem[] = [
  { id: '1', imageUrl: '', title: 'USB-C Fast Charger 65W GaN Compact Design', supplier: 'AliExpress', cost: '$8.50', sell: '$24.99', margin: '+66%', status: '🟢 Listed', updated: '2h ago', folder: 'AliExpress Dropship (80)' },
  { id: '2', imageUrl: '', title: 'Wireless Earbuds Bluetooth 5.3 TWS Noise Cancel', supplier: 'Amazon', cost: '$12.00', sell: '$39.99', margin: '+70%', status: '🟡 Researching', updated: '1d ago', folder: 'Amazon Arbitrage (35)' },
  { id: '3', imageUrl: '', title: 'Dog Chew Toy Durable Rubber Indestructible', supplier: 'AliExpress', cost: '$3.20', sell: '$14.99', margin: '+79%', status: '🟡 Researching', updated: 'Just now', folder: 'Q4 Pet Toys (27)' },
  { id: '4', imageUrl: '', title: 'Laptop Stand Adjustable Aluminum Portable Foldable', supplier: 'Amazon', cost: '$9.00', sell: '$29.99', margin: '+70%', status: '🔴 Out of Stock', updated: '3d ago', folder: 'Amazon Arbitrage (35)' },
  { id: '5', imageUrl: '', title: 'Phone Case iPhone 15 Pro Shockproof Military Grade', supplier: 'AliExpress', cost: '$2.50', sell: '$12.99', margin: '+81%', status: '🟢 Listed', updated: '5h ago', folder: 'AliExpress Dropship (80)' },
]

const FOLDERS = [
  'All Saved (142)',
  'Amazon Arbitrage (35)',
  'AliExpress Dropship (80)',
  'Q4 Pet Toys (27)',
]

const STATUS_OPTIONS = ['🟡 Researching', '🟢 Listed', '🔴 Out of Stock'] as const

// ── Status badge colors ────────────────────────────────────────
function statusStyle(status: string) {
  if (status.includes('🟢')) return { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' }
  if (status.includes('🔴')) return { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' }
  return { bg: '#fefce8', border: '#fde68a', color: '#854d0e' }
}

// ── Table header cell ──────────────────────────────────────────
function HeaderCell({ label, flex }: { label: string; flex: number }) {
  return (
    <div style={{ flex }} className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide">
      {label}
    </div>
  )
}

// ── Inventory row ──────────────────────────────────────────────
function InventoryRow({
  item, isSelected, onToggle, onDelete, onStatusChange
}: {
  item: InventoryItem
  isSelected: boolean
  onToggle: () => void
  onDelete: () => void
  onStatusChange: (id: string, status: InventoryItem['status']) => void
}) {
  const [hovering, setHovering] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const toast = useToast()
  const ss = statusStyle(item.status)

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setShowStatus(false) }}
      className="flex items-center gap-3 px-4 py-3 border-b border-[#F1F5F9] transition-colors"
      style={{ backgroundColor: hovering ? '#F8FAFC' : 'transparent' }}
    >
      {/* Checkbox */}
      <div
        onClick={onToggle}
        className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center cursor-pointer shrink-0 transition-colors"
        style={{ backgroundColor: isSelected ? '#8FFF00' : '#fff', borderColor: isSelected ? '#8FFF00' : '#E2E8F0' }}
      >
        {isSelected && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="#0A0D08" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {/* Product — flex:4 */}
      <div style={{ flex: 4 }} className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center shrink-0 overflow-hidden">
          {item.imageUrl
            ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
            : <Package size={16} className="text-[#94A3B8]" />
          }
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[13px] font-bold text-[#1E293B] truncate">{item.title}</span>
          {hovering && (
            <button
              onClick={() => { navigator.clipboard.writeText(item.title); toast.copied() }}
              className="shrink-0 text-[#64748B] hover:text-dark transition-colors"
            >
              <Copy size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Supplier — flex:2 */}
      <div style={{ flex: 2 }}>
        <span className="text-[13px] font-bold text-blue-600 underline cursor-pointer">
          {item.supplier}
        </span>
      </div>

      {/* Cost/Sell — flex:2 */}
      <div style={{ flex: 2 }}>
        <span className="text-[13px] font-semibold text-[#1E293B]">
          {item.cost} → {item.sell}
        </span>
      </div>

      {/* Margin — flex:1 */}
      <div style={{ flex: 1 }}>
        <span className="text-[14px] font-black text-green-700">{item.margin}</span>
      </div>

      {/* Status dropdown — flex:2 */}
      <div style={{ flex: 2 }} className="relative">
        <button
          onClick={() => setShowStatus(!showStatus)}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-[12px] font-bold transition-colors"
          style={{ backgroundColor: ss.bg, borderColor: ss.border, color: ss.color }}
        >
          {item.status}
          <ChevronDown size={12} />
        </button>
        {showStatus && (
          <div className="absolute top-8 left-0 z-20 bg-white rounded-lg border border-[#E2E8F0] shadow-panel overflow-hidden min-w-[160px]">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => { onStatusChange(item.id, opt); setShowStatus(false) }}
                className="w-full text-left px-3 py-2 text-[12px] font-semibold hover:bg-[#F8FAFC] transition-colors"
                style={{ color: statusStyle(opt).color }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Updated — flex:1 */}
      <div style={{ flex: 1 }}>
        <span className="text-[12px] text-green-600">{item.updated}</span>
      </div>

      {/* Delete — fixed 32px */}
      <div className="w-8 flex items-center justify-center">
        {hovering && (
          <button onClick={onDelete} className="text-red-400 hover:text-red-600 transition-colors">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function InventoryPage() {
  const toast = useToast()

  const [activeFolder, setActiveFolder] = useState('All Saved (142)')
  const [selectAll,    setSelectAll]    = useState(false)
  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const [search,       setSearch]       = useState('')
  const [items,        setItems]        = useState<InventoryItem[]>(MOCK_ITEMS)
  const [folders,      setFolders]      = useState(FOLDERS)

  // ── Filter by folder + search ─────────────────────────────
  const filtered = items.filter(item => {
    const inFolder = activeFolder === 'All Saved (142)' || item.folder === activeFolder
    const matchSearch = search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase())
    return inFolder && matchSearch
  })

  // ── Toggle select ─────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSelectAll(val: boolean) {
    setSelectAll(val)
    if (val) setSelected(new Set(filtered.map(i => i.id)))
    else setSelected(new Set())
  }

  // ── Delete item ───────────────────────────────────────────
  function deleteItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next })
    toast.deleted('Product')
  }

  // ── Status change ─────────────────────────────────────────
  function changeStatus(id: string, status: InventoryItem['status']) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  return (
    <KillSwitchGate switchTitle="Inventory Manager">
    <div className="flex h-full" style={{ backgroundColor: '#F8FAFC' }}>

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-[260px] shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h2 className="text-[18px] font-bold text-[#1E293B]">📁 My Folders</h2>
        </div>

        <div className="flex-1 overflow-auto">
          {folders.map(folder => {
            const isActive = activeFolder === folder
            return (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className="w-full flex items-center gap-2.5 px-6 py-3.5 text-left transition-colors border-r-[3px]"
                style={{
                  backgroundColor: isActive ? 'rgba(143,255,0,0.1)' : 'transparent',
                  borderRightColor: isActive ? '#8FFF00' : 'transparent',
                }}
              >
                {isActive
                  ? <FolderOpen size={17} className="text-[#1E293B] shrink-0" />
                  : <Folder size={17} className="text-[#94A3B8] shrink-0" />
                }
                <span className={cn('text-[14px]',
                  isActive ? 'font-bold text-[#1E293B]' : 'font-normal text-[#64748B]')}>
                  {folder}
                </span>
              </button>
            )
          })}
        </div>

        <div className="border-t border-gray-200">
          <button
            onClick={() => toast.info('Create folder coming soon!')}
            className="w-full p-6 text-center text-[14px] font-bold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
          >
            <Plus size={14} className="inline mr-1.5" />
            Create New Folder
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 p-7">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <h1 className="text-[26px] font-bold text-[#1E293B]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Saved Inventory
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-300 bg-white w-[250px]">
              <Search size={16} className="text-[#94A3B8] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search inventory..."
                className="flex-1 text-[13px] bg-transparent outline-none text-[#1E293B] placeholder:text-[#94A3B8]"
              />
            </div>
            {/* Export CSV */}
            <button
              onClick={() => toast.info('Exporting CSV...')}
              className="flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-300 bg-white text-[13px] font-bold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
            >
              <Download size={15} />
              Export CSV
            </button>
            {/* Sync Prices */}
            <button
              onClick={() => toast.info('Syncing prices...')}
              className="flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[#131B2F] text-white text-[13px] font-bold hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={15} />
              Sync Prices
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

          {/* Table header */}
          <div className="flex items-center gap-3 px-4 py-4 bg-[#F1F5F9]">
            <div
              onClick={() => handleSelectAll(!selectAll)}
              className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center cursor-pointer shrink-0 transition-colors"
              style={{ backgroundColor: selectAll ? '#8FFF00' : '#fff', borderColor: selectAll ? '#8FFF00' : '#E2E8F0' }}
            >
              {selectAll && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="#0A0D08" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="flex items-center gap-3 flex-1">
              <HeaderCell label="Product"   flex={4} />
              <HeaderCell label="Supplier"  flex={2} />
              <HeaderCell label="Cost / Sell" flex={2} />
              <HeaderCell label="Margin"    flex={1} />
              <HeaderCell label="Status"    flex={2} />
              <HeaderCell label="Updated"   flex={1} />
              <div className="w-8" />
            </div>
          </div>

          <div className="h-px bg-[#E2E8F0]" />

          {/* Rows */}
          <div className="flex-1 overflow-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
                <Package size={60} className="text-gray-300" />
                <div className="text-center">
                  <p className="text-[16px] font-bold text-[#64748B]">No products saved yet.</p>
                  <p className="text-[13px] text-gray-400 mt-1">
                    Go to Product Research and click &apos;Save&apos; on a winner!
                  </p>
                </div>
              </div>
            ) : (
              filtered.map(item => (
                <InventoryRow
                  key={item.id}
                  item={item}
                  isSelected={selected.has(item.id)}
                  onToggle={() => toggleSelect(item.id)}
                  onDelete={() => deleteItem(item.id)}
                  onStatusChange={changeStatus}
                />
              ))
            )}
          </div>

        </div>
      </div>
    </div>
    </KillSwitchGate>
  )
}
