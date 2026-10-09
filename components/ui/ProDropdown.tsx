'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'

const C = {
  border: '#ede9fe',
  bg: '#f3eeff',
  text: '#1f1d2e',
  muted: '#9ca3af',
  lime: '#7530fb',
  dark: '#f3eeff',
}

export interface DropdownOption {
  val: string
  label: string
  enabled: boolean
  flagCode?: string    // country code e.g. 'us', 'gb', 'cn'
  shortLabel?: string  // short display when selected e.g. 'USD', 'GBP'
}

// ── Menu position ─────────────────────────────────────────────────────────────
interface MenuPos {
  top: number
  bottom: number
  left: number
  width: number
  openUp: boolean
  maxMenuHeight: number
}

// ── Pill option ───────────────────────────────────────────────────────────────
function DropdownPill({
  option, isSelected, onTap,
}: {
  option: DropdownOption
  isSelected: boolean
  onTap?: () => void
}) {
  const [hover, setHover] = useState(false)
  const enabled = option.enabled
  // Selected: purple bg + WHITE text (high contrast)
  // Hover: light purple tint, no border change — calm, no jumping
  const bgColor = !enabled ? 'transparent'
    : isSelected ? C.lime
      : hover ? C.bg
        : 'transparent'
  const textColor = !enabled ? '#CBD5E1'
    : isSelected ? '#ffffff'
      : C.text
  // No border on hover — background does the work
  const border = isSelected ? C.lime : 'transparent'

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onTap}
      className="px-4 py-2.5 rounded-full text-[13px] transition-all mb-0.5"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontWeight: isSelected ? 700 : 500,
        fontStyle: enabled ? 'normal' : 'italic',
        cursor: enabled ? 'pointer' : 'default',
        border: `1.5px solid ${border}`,
        transition: 'background-color 0.12s',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {option.flagCode && (
          <span
            className={`fi fi-${option.flagCode}`}
            style={{
              width: 16, height: 16, borderRadius: '50%',
              display: 'inline-block', backgroundSize: 'cover', flexShrink: 0,
            }}
          />
        )}
        {option.label}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProDropdown({
  prefix,
  currentValue,
  options,
  onChanged,
  width = 220,
  maxItems = 8,
  inline = false,
}: {
  prefix: string
  currentValue: string
  options: DropdownOption[]
  onChanged: (v: string) => void
  width?: number | 'full' | 'half'
  maxItems?: number
  inline?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<MenuPos>({
    top: 0, bottom: 0, left: 0, width: 0, openUp: false, maxMenuHeight: 300,
  })

  const btnRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ── Compute menu position ────────────────────────────────────────────────
  const computePos = useCallback((): MenuPos | null => {
    if (!btnRef.current) return null
    const rect = btnRef.current.getBoundingClientRect()
    const viewportH = window.innerHeight
    const MENU_PADDING = 8
    const SAFE_MARGIN = 12  // keep this px away from viewport edges

    // Cap visible items to maxItems prop
    const visibleCount = Math.min(options.length, maxItems)
    const ITEM_HEIGHT = 42
    const idealHeight = visibleCount * ITEM_HEIGHT + 16  // +16 for padding

    const spaceBelow = viewportH - rect.bottom - MENU_PADDING - SAFE_MARGIN
    const spaceAbove = rect.top - MENU_PADDING - SAFE_MARGIN

    // Open upward when not enough space below AND more space is available above
    const openUp = spaceBelow < idealHeight && spaceAbove > spaceBelow

    // Available space in the chosen direction — never exceed idealHeight
    const availableSpace = openUp ? spaceAbove : spaceBelow
    const maxMenuHeight = Math.min(idealHeight, Math.max(availableSpace, ITEM_HEIGHT * 2))

    return {
      top: openUp ? 0 : rect.bottom + MENU_PADDING,
      bottom: openUp ? viewportH - rect.top + MENU_PADDING : 0,
      left: rect.left,
      width: rect.width,
      openUp,
      maxMenuHeight,
    }
  }, [options.length, maxItems])

  // ── Toggle open ──────────────────────────────────────────────────────────
  function toggleOpen() {
    if (!open) {
      const pos = computePos()
      if (pos) setMenuPos(pos)
    }
    setOpen(s => !s)
  }

  // ── Scroll selected item into view when menu opens ───────────────────────
  useEffect(() => {
    if (!open || !scrollRef.current) return
    const selectedIndex = options.findIndex(o => o.val === currentValue)
    if (selectedIndex < 0) return
    // Small delay to let the DOM render first
    const t = setTimeout(() => {
      const container = scrollRef.current
      if (!container) return
      const items = container.querySelectorAll<HTMLDivElement>('[data-option]')
      const target = items[selectedIndex]
      if (target) {
        target.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }, 30)
    return () => clearTimeout(t)
  }, [open, currentValue, options])

  // ── Close on Escape key ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // ── Reposition on scroll or resize while open ────────────────────────────
  useEffect(() => {
    if (!open) return
    const handler = () => {
      const pos = computePos()
      if (pos) setMenuPos(pos)
    }
    window.addEventListener('scroll', handler, true)
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler, true)
      window.removeEventListener('resize', handler)
    }
  }, [open, computePos])

  // ── Derived values ───────────────────────────────────────────────────────
  const displayLabel = options.find(o => o.val === currentValue)?.label ?? currentValue
  const btnWidth = width === 'full' ? '100%' : width === 'half' ? '50%' : undefined
  const menuWidth = width === 'full' || width === 'half' ? '100%' : width

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative" style={{ width: btnWidth }}>

      {/* Trigger button */}
      <button
        ref={btnRef}
        onClick={toggleOpen}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] font-semibold transition-all"
        style={{
          // Border is STATIC — only purple when open, light when closed
          // Background does the hover/active work — no jumping border
          backgroundColor: inline ? 'transparent' : open ? C.bg : '#fff',
          borderColor: inline ? 'transparent' : open ? C.lime : C.border,
          color: C.text,
          width: '100%',
          justifyContent: 'space-between',
          boxShadow: open ? `0 0 0 3px ${C.lime}18` : 'none',
          height: inline ? '100%' : undefined,
          borderRadius: inline ? 0 : undefined,
          padding: inline ? '0 10px' : undefined,
          outline: 'none',
          transition: 'background-color 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => {
          if (!open && !inline) {
            e.currentTarget.style.backgroundColor = C.bg
            e.currentTarget.style.borderColor = C.border
          }
        }}
        onMouseLeave={e => {
          if (!open && !inline) {
            e.currentTarget.style.backgroundColor = '#fff'
            e.currentTarget.style.borderColor = C.border
          }
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {(() => {
            const match = options.find(o => o.val === currentValue)
            return match?.flagCode
              ? <span
                className={`fi fi-${match.flagCode}`}
                style={{ width: 16, height: 16, borderRadius: '50%', display: 'inline-block', backgroundSize: 'cover', flexShrink: 0 }}
              />
              : null
          })()}
          {(() => {
            const match = options.find(o => o.val === currentValue)
            return match?.shortLabel ?? `${prefix} ${displayLabel}`.trim()
          })()}
        </span>
        {open
          ? <ChevronUp size={15} style={{ color: C.lime, flexShrink: 0 }} />
          : <ChevronDown size={15} style={{ color: C.muted, flexShrink: 0 }} />
        }
      </button>

      {/* Portal menu */}
      {open && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop — closes on click outside */}
          <div
            className="fixed inset-0 z-[10500]"
            onClick={() => setOpen(false)}
          />

          {/* Menu container — opens up or down based on available space */}
          <div
            className="fixed z-[10501] rounded-2xl border shadow-xl"
            style={{
              ...(menuPos.openUp
                ? { bottom: menuPos.bottom, top: 'auto' }
                : { top: menuPos.top, bottom: 'auto' }
              ),
              left: menuPos.left,
              width: typeof menuWidth === 'number' ? menuWidth : 'max-content',
              minWidth: menuPos.width,
              backgroundColor: '#fff',
              borderColor: C.border,
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
              // No overflow:hidden here — let scrollbar render cleanly
              borderRadius: 16,
            }}
          >
            {/* Scrollable pill list */}
            <div
              ref={scrollRef}
              className="p-2 flex flex-col gap-1"
              style={{
                maxHeight: menuPos.maxMenuHeight,
                overflowY: 'auto',
                overflowX: 'hidden',
                borderRadius: 16,
                // Thin scrollbar
                scrollbarWidth: 'thin',
                scrollbarColor: `${C.border} transparent`,
              }}
            >
              {options.map((o, i) => (
                <div key={i} data-option>
                  <DropdownPill
                    option={o}
                    isSelected={o.val === currentValue}
                    onTap={o.enabled ? () => { onChanged(o.val); setOpen(false) } : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
