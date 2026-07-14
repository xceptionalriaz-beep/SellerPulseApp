'use client'
import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'

const C = {
  border: '#E2E8F0',
  bg:     '#F1F5F9',
  text:   '#1E293B',
  muted:  '#94A3B8',
  lime:   '#8FFF00',
  dark:   '#1a2410',
}

export interface DropdownOption {
  val:     string
  label:   string
  enabled: boolean
}

function DropdownPill({ option, isSelected, onTap }: {
  option: DropdownOption; isSelected: boolean; onTap?: () => void
}) {
  const [hover, setHover] = useState(false)
  const enabled   = option.enabled
  const bgColor   = !enabled ? 'transparent' : isSelected ? C.lime    : 'transparent'
  const textColor = !enabled ? '#CBD5E1'      : isSelected ? C.dark    : C.text
  const border    = !enabled ? 'transparent'  : hover && !isSelected ? C.lime : 'transparent'
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onTap}
         className="px-4 py-2.5 rounded-full text-[13px] transition-all mb-0.5"
         style={{ backgroundColor: bgColor, color: textColor, fontWeight: isSelected ? 700 : 500, fontStyle: enabled ? 'normal' : 'italic', cursor: enabled ? 'pointer' : 'default', border: `1.5px solid ${border}` }}>
      {option.label}
    </div>
  )
}

export default function ProDropdown({ prefix, currentValue, options, onChanged, width = 220, maxItems = 8 }: {
  prefix:       string
  currentValue: string
  options:      DropdownOption[]
  onChanged:    (v: string) => void
  width?:       number | 'full' | 'half'
  maxItems?:    number
}) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const displayLabel = (() => {
    const match = options.find(o => o.val === currentValue)
    return match ? match.label : currentValue
  })()
  // Button width style
  const btnWidth = width === 'full' ? '100%' : width === 'half' ? '50%' : undefined
  // Dropdown menu width
  const menuWidth = width === 'full' || width === 'half' ? '100%' : width

  function toggleOpen() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    setOpen(s => !s)
  }

  return (
    <div className="relative" style={{ width: btnWidth }}>
      <button
        ref={btnRef}
        onClick={toggleOpen}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] font-semibold transition-all"
        style={{
          backgroundColor: open ? C.bg : '#fff',
          borderColor:     open ? C.lime : C.border,
          color:           C.text,
          width:           '100%',
          justifyContent:  'space-between',
        }}>
        <span>{`${prefix} ${displayLabel}`.trim()}</span>
        {open
          ? <ChevronUp   size={15} style={{ color: C.lime, flexShrink: 0 }}/>
          : <ChevronDown size={15} style={{ color: C.muted, flexShrink: 0 }}/>}
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-[10500]" onClick={() => setOpen(false)}/>
          <div className="fixed z-[10501] rounded-2xl border shadow-xl overflow-hidden"
               style={{
                 top: menuPos.top,
                 left: menuPos.left,
                 width: typeof menuWidth === 'number' ? menuWidth : menuPos.width,
                 backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
               }}>
            <div className="p-2 flex flex-col gap-1" style={{ maxHeight: maxItems * 38, overflowY: 'auto' }}>
              {options.map((o, i) => (
                <DropdownPill key={i} option={o} isSelected={o.val === currentValue}
                  onTap={o.enabled ? () => { onChanged(o.val); setOpen(false) } : undefined}/>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}