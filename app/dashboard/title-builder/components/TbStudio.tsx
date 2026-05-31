'use client'
// app/dashboard/title-builder/components/TbStudio.tsx
// Converted 1:1 from lib/pages/title_builder/tb_studio.dart

import { Copy } from 'lucide-react'
import { TitleCleanerEngine } from './engines/titleCleanerEngine'
import { TitleSpinnerEngine }  from './engines/titleSpinnerEngine'

const C = {
  border: '#E2E8F0', text: '#0F172A', muted: '#9CA3AF',
}

interface Props {
  value:          string
  onChange:       (v: string) => void
  charCount:      number
  veroCount:      number
  duplicateCount: number
}

export default function TbStudio({ value, onChange, charCount, veroCount, duplicateCount }: Props) {

  // 🚀 Clean trigger — matches Dart _cleanTitle()
  function cleanTitle() {
    if (!value) return
    onChange(TitleCleanerEngine.clean(value))
  }

  // 🚀 Spin trigger — matches Dart _spinTitle()
  function spinTitle() {
    if (!value) return
    onChange(TitleSpinnerEngine.spin(value, 3))
  }

  // 🚀 AI Optimize simulator — matches Dart _runAIOptimize()
  function runAIOptimize() {
    // Ready for real API connection
    alert('🚀 AI Engine warming up... (Ready for API connection!)')
  }

  // Strength meter — matches Dart progress + strengthColor logic
  const progress      = Math.min(charCount / 80, 1)
  const strengthColor = charCount > 80
    ? '#EF4444'
    : charCount >= 65 ? '#10B981' : '#F97316'

  // Pill badge helper — matches Dart _pillBadge()
  function PillBadge({ text, textColor, bgColor }: { text: string; textColor: string; bgColor: string }) {
    return (
      <div className="px-2.5 py-1 rounded-full border text-[12px] font-bold"
           style={{ color: textColor, backgroundColor: bgColor, borderColor: textColor + '4D' }}>
        {text}
      </div>
    )
  }

  // Action button helper — matches Dart _actionBtn()
  function ActionBtn({ text, textColor, bgColor, onTap }: { text: string; textColor: string; bgColor: string; onTap: () => void }) {
    return (
      <button onClick={onTap}
        className="px-4 py-2 rounded-lg border text-[13px] font-bold transition-all hover:opacity-80"
        style={{ color: textColor, backgroundColor: bgColor, borderColor: textColor + '4D' }}>
        {text}
      </button>
    )
  }

  return (
    <div className="p-6 rounded-2xl border"
         style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 0 10px rgba(0,0,0,0.03)' }}>

      {/* Section label */}
      <p className="text-[13px] font-bold mb-4" style={{ color: C.muted }}>THE AUTO TITLE BUILDER</p>

      {/* Text box area — matches Dart Container with blue border */}
      <div className="rounded-xl border mb-5" style={{ borderColor: '#93C5FD', borderWidth: 1.5 }}>
        <div className="flex items-start gap-2 pl-4 pr-1 pt-1.5">
          <textarea value={value} onChange={e => onChange(e.target.value)} rows={2}
            className="flex-1 text-[18px] font-semibold outline-none resize-none bg-transparent py-1"
            style={{ color: C.text }} />
          <button onClick={() => navigator.clipboard.writeText(value)}
            title="Copy Title"
            className="p-2 hover:opacity-70 shrink-0">
            <Copy size={18} style={{ color: '#3B82F6' }} />
          </button>
        </div>

        {/* Mobile Cutoff line — matches Dart Stack visual */}
        <div className="relative flex items-center mx-2.5 my-1">
          <div className="flex-1 h-px" style={{ backgroundColor: '#BFDBFE' }} />
          <div className="px-2 text-[10px] font-bold absolute left-1/2 -translate-x-1/2 bg-white"
               style={{ color: '#3B82F6' }}>
            Mobile Cutoff
          </div>
        </div>
        <div className="pb-2" />
      </div>

      {/* Alerts row — matches Dart Row with pill badges */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <p className="text-[13px] font-bold" style={{ color: C.muted }}>Alerts:</p>
        <PillBadge
          text={`${duplicateCount} Duplicate${duplicateCount !== 1 ? 's' : ''}`}
          textColor={duplicateCount > 0 ? '#C2410C' : '#4B5563'}
          bgColor={duplicateCount  > 0 ? '#FFF7ED' : '#F3F4F6'}
        />
        <PillBadge
          text={`${veroCount} VeRO Risk${veroCount !== 1 ? 's' : ''}`}
          textColor={veroCount > 0 ? '#B91C1C' : '#15803D'}
          bgColor={veroCount  > 0 ? '#FEF2F2' : '#F0FDF4'}
        />
      </div>

      {/* Strength meter — matches Dart LinearProgressIndicator */}
      <div className="flex items-center gap-2 mb-6">
        <p className="text-[13px] font-bold shrink-0" style={{ color: C.muted }}>Strength:</p>
        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
          <div className="h-full rounded-full transition-all duration-300"
               style={{ width: `${progress * 100}%`, backgroundColor: strengthColor }} />
        </div>
        <p className="text-[14px] font-bold shrink-0" style={{ color: strengthColor }}>
          {Math.round(progress * 100)}%
        </p>
      </div>

      {/* Action buttons — matches Dart Row */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <p className="text-[13px] font-bold" style={{ color: C.muted }}>Actions:</p>
        <ActionBtn text="✨ AI Optimize" textColor="#7C3AED" bgColor="#F5F3FF" onTap={runAIOptimize} />
        <ActionBtn text="🧹 Clean"       textColor="#1D4ED8" bgColor="#EFF6FF" onTap={cleanTitle}    />
        <ActionBtn text="🔄 Spin"        textColor="#0F766E" bgColor="#F0FDFA" onTap={spinTitle}     />
      </div>

    </div>
  )
}