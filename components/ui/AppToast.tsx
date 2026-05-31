'use client'
// components/ui/AppToast.tsx
// ═══════════════════════════════════════════════════════════════
// Converted from: lib/widgets/app_toast.dart
//
// What the Dart version did:
//   - Showed toast at top-center (above everything incl. dialogs)
//   - 4 types: success (lime), error (red), warning (amber), info (dark)
//   - Slide in from top + fade, then reverse out
//   - Convenience shortcuts: copied, saved, deleted, sending, noInternet, loading
//
// In React this uses a context + portal so it works everywhere,
// exactly like rootOverlay: true in Flutter.
//
// Usage (same API as Dart version):
//   toast.show('Saved successfully')
//   toast.error('Something went wrong')
//   toast.warning('Check your connection')
//   toast.info('Syncing orders...')
//   toast.copied()
//   toast.saved()
//   toast.deleted('Item')
//   toast.sending()
//   toast.noInternet()
//   toast.loading()
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  CheckCircle, XCircle, AlertTriangle, Info,
  Copy, Trash2, Send, WifiOff, Loader2, Save
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  icon?: React.ReactNode
  duration: number
}

interface ToastContextValue {
  show:       (message: string, icon?: React.ReactNode, duration?: number) => void
  error:      (message: string, icon?: React.ReactNode, duration?: number) => void
  warning:    (message: string, icon?: React.ReactNode, duration?: number) => void
  info:       (message: string, icon?: React.ReactNode, duration?: number) => void
  copied:     () => void
  saved:      () => void
  deleted:    (item?: string) => void
  sending:    () => void
  noInternet: () => void
  loading:    () => void
}

// ── Context ────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null)

// ── Hook ───────────────────────────────────────────────────────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// ── Colors (matches Dart exactly) ─────────────────────────────
const TOAST_STYLES: Record<ToastType, { bg: string; text: string; border: string }> = {
  success: { bg: '#8FFF00', text: '#0A0D08', border: '#6FCC00' }, // Lime — dark text
  error:   { bg: '#EF4444', text: '#FFFFFF', border: '#DC2626' }, // Red
  warning: { bg: '#F59E0B', text: '#0A0D08', border: '#D97706' }, // Amber — dark text
  info:    { bg: '#0F172A', text: '#FFFFFF', border: '#1E293B' }, // Dark navy
}

// ── Single Toast Item ──────────────────────────────────────────
function ToastBubble({
  item,
  onRemove,
}: {
  item: ToastItem
  onRemove: (id: string) => void
}) {
  const styles = TOAST_STYLES[item.type]

  return (
    <div
      className="animate-slide-down pointer-events-auto"
      style={{ animation: 'toastIn 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-panel"
        style={{
          backgroundColor: styles.bg,
          color: styles.text,
          border: `1px solid ${styles.border}`,
          maxWidth: '420px',
          minWidth: '160px',
        }}
      >
        {/* Icon */}
        <span className="shrink-0" style={{ color: styles.text }}>
          {item.icon}
        </span>

        {/* Message */}
        <span
          className="text-[13px] font-semibold leading-snug line-clamp-2"
          style={{ fontFamily: 'var(--font-inter)', color: styles.text }}
        >
          {item.message}
        </span>
      </div>
    </div>
  )
}

// ── Toast Container (portal — renders above everything) ────────
function ToastContainer({ toasts, onRemove }: {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}) {
  if (typeof window === 'undefined') return null
  if (toasts.length === 0) return null

  return createPortal(
    <div
      className="fixed top-5 left-0 right-0 z-[9999] flex flex-col items-center gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <ToastBubble key={t.id} item={t} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  )
}

// ── Provider ───────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counterRef = useRef(0)

  const addToast = useCallback((
    message: string,
    type: ToastType,
    icon: React.ReactNode,
    duration: number
  ) => {
    const id = `toast-${++counterRef.current}`
    setToasts((prev) => [...prev, { id, message, type, icon, duration }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── Public API (mirrors Dart AppToast exactly) ───────────────
  const toast: ToastContextValue = {
    show: (msg, icon, dur = 2000) =>
      addToast(msg, 'success', icon ?? <CheckCircle size={15} />, dur),

    error: (msg, icon, dur = 3000) =>
      addToast(msg, 'error', icon ?? <XCircle size={15} />, dur),

    warning: (msg, icon, dur = 3000) =>
      addToast(msg, 'warning', icon ?? <AlertTriangle size={15} />, dur),

    info: (msg, icon, dur = 2000) =>
      addToast(msg, 'info', icon ?? <Info size={15} />, dur),

    // Shortcuts
    copied:     () => addToast('Copied to clipboard',    'success', <Copy size={15} />,    2000),
    saved:      () => addToast('Saved successfully',     'success', <Save size={15} />,    2000),
    deleted:    (item = 'Item') =>
                     addToast(`${item} deleted`,         'success', <Trash2 size={15} />,  2000),
    sending:    () => addToast('Sending...',             'info',    <Send size={15} />,     2000),
    noInternet: () => addToast('No internet connection', 'error',   <WifiOff size={15} />, 3000),
    loading:    () => addToast('Loading...',             'info',    <Loader2 size={15} />, 2000),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}