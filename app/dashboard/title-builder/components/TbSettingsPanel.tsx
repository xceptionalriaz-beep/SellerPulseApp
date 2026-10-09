'use client'
import { useState } from 'react'
import { X, SlidersHorizontal, TextCursorInput, Copy, Plus, Info } from 'lucide-react'
import { ToggleButton } from '@/components/ui/Buttons'
import Tooltip from '@/components/ui/Tooltip'

const DC = {
  dark: '#1e1535',
  lime: '#7530fb',
  teal: '#0ea5e9',
  border: '#ede9fe',
  muted: '#9ca3af',
  surface: '#ffffff',
  bg: '#f8f7ff',
}

interface Props {
  autoCapitalize: boolean
  onAutoCapitalizeChanged: (v: boolean) => void
  autoCopy: boolean
  onAutoCopyChanged: (v: boolean) => void
  veroMode: string
  onVeroModeChanged: (v: string) => void
  filterExclude: string
  onFilterExcludeChanged: (v: string) => void
  onClose: () => void
}

// ── Toggle Switch — matches Buttons.tsx PillButton style ──────
function ToggleRow({ icon: Icon, title, subtitle, tooltip, value, onChanged }: {
  icon: React.ElementType
  title: string
  subtitle: string
  tooltip: string
  value: boolean
  onChanged: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border"
      style={{ backgroundColor: DC.surface, borderColor: DC.border }}>
      <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: DC.bg }}>
        <Icon size={18} style={{ color: DC.teal }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold flex items-center gap-1" style={{ color: '#1e1535' }}>
          {title}
          <Tooltip text={tooltip} position="top">
            <Info size={11} style={{ color: DC.muted, cursor: 'pointer', flexShrink: 0 }} />
          </Tooltip>
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: DC.muted }}>{subtitle}</p>
      </div>
      <ToggleButton value={value} onChanged={onChanged} />
    </div>
  )
}

export default function TbSettingsPanel({
  autoCapitalize, onAutoCapitalizeChanged,
  autoCopy, onAutoCopyChanged,
  filterExclude, onFilterExcludeChanged,
  onClose,
}: Props) {
  const [newWord, setNewWord] = useState('')

  const excludeList = filterExclude
    ? filterExclude.split(',').map(w => w.trim()).filter(Boolean)
    : []

  function addWord() {
    const w = newWord.trim().toLowerCase()
    if (!w || excludeList.includes(w)) { setNewWord(''); return }
    onFilterExcludeChanged([...excludeList, w].join(','))
    setNewWord('')
  }

  function removeWord(word: string) {
    onFilterExcludeChanged(excludeList.filter(w => w !== word).join(','))
  }

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="h-full flex flex-col"
        style={{ width: 320, backgroundColor: DC.bg, boxShadow: '-4px 0 24px rgba(0,0,0,0.08)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ backgroundColor: DC.surface, borderColor: DC.border }}>
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={17} style={{ color: '#1e1535' }} />
            <p className="text-[16px] font-black" style={{ color: '#1e1535' }}>Settings</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            style={{ backgroundColor: DC.bg }}>
            <X size={16} style={{ color: DC.muted }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

          {/* Title Studio */}
          <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: DC.muted }}>
            Title Studio
          </p>

          <ToggleRow
            icon={TextCursorInput}
            title="Auto-Capitalize Words"
            subtitle="Forces first letter of every word to uppercase as you type."
            tooltip="Automatically capitalises every word as you type — e.g. 'dog toy' becomes 'Dog Toy'."
            value={autoCapitalize}
            onChanged={onAutoCapitalizeChanged}
          />

          <ToggleRow
            icon={Copy}
            title="Auto-Copy at 80 Chars"
            subtitle="Automatically copies title to clipboard when it hits 80 characters."
            tooltip="When your title reaches 80 characters it is automatically copied to your clipboard."
            value={autoCopy}
            onChanged={onAutoCopyChanged}
          />

          <p className="text-[10px] font-black tracking-widest uppercase mt-2" style={{ color: DC.muted }}>
            Exclude Words <Tooltip text="Words added here are filtered out from all keyword tables." position="top"><Info size={11} style={{ display: 'inline', verticalAlign: 'middle', color: DC.muted, cursor: 'pointer' }} /></Tooltip>
          </p>

          <div className="rounded-xl border p-4 flex flex-col gap-3"
            style={{ backgroundColor: DC.surface, borderColor: DC.border }}>

            {/* Input + Add button on same row */}
            <div className="flex gap-2">
              <input
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addWord()}
                placeholder="Word to exclude..."
                className="flex-1 px-3 py-2 rounded-lg text-[12px] outline-none"
                style={{
                  border: `1px solid ${DC.border}`,
                  backgroundColor: DC.bg,
                  color: '#1e1535',
                  fontFamily: 'Inter, sans-serif',
                  minWidth: 0,
                }}
              />
              <button onClick={addWord}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-[12px] font-bold shrink-0"
                style={{ backgroundColor: '#b8fa33', color: '#1e1535', border: 'none' }}>
                <Plus size={12} /> Add
              </button>
            </div>

            {/* Exclude list */}
            {excludeList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {excludeList.map((word, i) => (
                  <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <span className="text-[11px] font-medium" style={{ color: '#b91c1c' }}>{word}</span>
                    <button onClick={() => removeWord(word)} className="hover:opacity-70">
                      <X size={10} style={{ color: '#b91c1c' }} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] italic" style={{ color: DC.muted }}>No words excluded yet.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
