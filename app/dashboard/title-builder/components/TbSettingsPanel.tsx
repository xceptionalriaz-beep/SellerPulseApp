'use client'
// app/dashboard/title-builder/components/TbSettingsPanel.tsx
// Converted 1:1 from lib/pages/title_builder/tb_settings_panel.dart

import { X, SlidersHorizontal, TextCursorInput, Copy, ShieldCheck } from 'lucide-react'

const C = {
  bg:     '#F8FAFC',
  white:  '#FFFFFF',
  border: '#E5E7EB',
  text:   '#1E293B',
  muted:  '#9CA3AF',
  blue:   '#1D70F5',
  lime:   '#8FFF00',
  dark:   '#1a2410',
}

interface Props {
  autoCapitalize:          boolean
  onAutoCapitalizeChanged: (v: boolean) => void
  autoCopy:                boolean
  onAutoCopyChanged:       (v: boolean) => void
  veroMode:                string
  onVeroModeChanged:       (v: string) => void
  onClose:                 () => void
}

// â”€â”€ Toggle row (matches Dart _buildToggleRow) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ToggleRow({ icon: Icon, title, subtitle, value, onChanged }: {
  icon: React.ElementType; title: string; subtitle: string
  value: boolean; onChanged: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border"
         style={{ backgroundColor: C.white, borderColor: C.border }}>
      {/* Icon box */}
      <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: '#F1F5F9' }}>
        <Icon size={19} style={{ color: C.blue }} />
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold" style={{ color: C.text }}>{title}</p>
        <p className="text-[11px]" style={{ color: C.muted }}>{subtitle}</p>
      </div>
      {/* Toggle â€” lime track dark thumb matches Dart */}
      <div onClick={() => onChanged(!value)}
           className="relative w-11 h-6 rounded-full cursor-pointer transition-colors shrink-0"
           style={{ backgroundColor: value ? C.lime : '#E5E7EB' }}>
        <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
             style={{
               backgroundColor: value ? C.dark : '#9CA3AF',
               left: value ? '22px' : '2px',
             }} />
      </div>
    </div>
  )
}

// â”€â”€ VeRO mode button (matches Dart _buildVeroButton) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function VeroButton({ mode, currentMode, onTap }: {
  mode: string; currentMode: string; onTap: (v: string) => void
}) {
  const isActive = mode === currentMode
  return (
    <button onClick={() => onTap(mode)}
      className="flex-1 py-2.5 rounded-lg border text-[14px] font-bold transition-all"
      style={{
        backgroundColor: isActive ? '#1E293B' : C.white,
        borderColor:     isActive ? '#1E293B' : '#D1D5DB',
        color:           isActive ? C.lime    : '#9CA3AF',
      }}>
      {mode}
    </button>
  )
}

// â”€â”€ Main panel â€” slide-in drawer (matches Dart Drawer width:320) â”€
export default function TbSettingsPanel({
  autoCapitalize, onAutoCapitalizeChanged,
  autoCopy, onAutoCopyChanged,
  veroMode, onVeroModeChanged,
  onClose,
}: Props) {
  return (
    // Backdrop
    <div className="fixed inset-0 z-[9999] flex justify-end"
         style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>

      {/* Drawer â€” width:320 matches Dart */}
      <div className="h-full flex flex-col overflow-hidden"
           style={{ width: 320, backgroundColor: C.bg }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b"
             style={{ backgroundColor: C.white, borderColor: C.border }}>
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={19} style={{ color: C.text }} />
            <p className="text-[18px] font-bold" style={{ color: C.text }}>Pro Settings</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:opacity-70">
            <X size={18} style={{ color: C.muted }} />
          </button>
        </div>

        {/* Settings list */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

          {/* Section: Title Studio */}
          <p className="text-[12px] font-bold tracking-[1px]" style={{ color: C.muted }}>
            TITLE STUDIO
          </p>

          <ToggleRow
            icon={TextCursorInput}
            title="Auto-Capitalize Words"
            subtitle="Forces first letter of every word to uppercase."
            value={autoCapitalize}
            onChanged={onAutoCapitalizeChanged}
          />

          <ToggleRow
            icon={Copy}
            title="Auto-Copy at 80 Chars"
            subtitle="Automatically copies title when perfect length is hit."
            value={autoCopy}
            onChanged={onAutoCopyChanged}
          />

          {/* Section: Safety & VeRO */}
          <p className="text-[12px] font-bold tracking-[1px] mt-2" style={{ color: C.muted }}>
            SAFETY & VERO
          </p>

          {/* VeRO Warning Level card */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: C.white, borderColor: C.border }}>
            <div className="flex items-center gap-2.5 mb-4">
              <ShieldCheck size={19} style={{ color: C.text }} />
              <p className="text-[14px] font-bold" style={{ color: C.text }}>VeRO Warning Level</p>
            </div>
            <div className="flex gap-2.5">
              <VeroButton mode="Strict"  currentMode={veroMode} onTap={onVeroModeChanged} />
              <VeroButton mode="Relaxed" currentMode={veroMode} onTap={onVeroModeChanged} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
