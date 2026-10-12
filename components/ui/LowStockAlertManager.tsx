'use client'
// components/ui/LowStockAlertManager.tsx
//
// Low Stock Alert Manager panel.
// Shows active alerts, lets user set global threshold, send email alerts.
// Designed for use in the listing dashboard or a settings tab.

import { useState, useEffect, useCallback } from 'react'
import { Bell, BellOff, AlertTriangle, CheckCircle2, Package, Settings, RefreshCw, Mail, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'

// ── Color tokens — Riazify v2 ──────────────────────────────────────────
const C = {
  primary:      '#7530fb',
  primaryLight: '#f3eeff',
  primaryHover: '#6020e0',
  accent:       '#b8fa33',
  dark:         '#1e1535',
  border:       '#ede9fe',
  surface:      '#ffffff',
  bg:           '#f8f7ff',
  txt1:         '#1e1535',
  txt2:         '#6b7280',
  txt3:         '#9ca3af',
  success:      '#16a34a',
  successBg:    '#dcfce7',
  warning:      '#d97706',
  warningBg:    '#fef3c7',
  danger:       '#ef4444',
  dangerBg:     '#fee2e2',
}

interface LowStockAlert {
  id: string
  listing_id: string | null
  listing_title: string | null
  current_qty: number | null
  threshold: number | null
  is_read: boolean
  created_at: string
}

interface LowStockRule {
  id: string
  listing_id: string | null
  threshold: number
  alert_email: boolean
  alert_in_app: boolean
  is_active: boolean
}

interface Props {
  /** If true, shows as a compact badge-only mode */
  compact?: boolean
  /** Called when badge count changes */
  onUnreadChange?: (count: number) => void
}

export default function LowStockAlertManager({ compact = false, onUnreadChange }: Props) {
  const supabase = createClient()

  const [alerts,          setAlerts]          = useState<LowStockAlert[]>([])
  const [globalRule,      setGlobalRule]       = useState<LowStockRule | null>(null)
  const [threshold,       setThreshold]        = useState(5)
  const [emailEnabled,    setEmailEnabled]     = useState(true)
  const [isOpen,          setIsOpen]           = useState(false)
  const [isChecking,      setIsChecking]       = useState(false)
  const [isSavingRule,    setIsSavingRule]      = useState(false)
  const [showSettings,    setShowSettings]     = useState(false)
  const [checkResult,     setCheckResult]      = useState<string | null>(null)

  const unreadCount = alerts.filter(a => !a.is_read).length

  // ── Load alerts + rule ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [alertsRes, rulesRes] = await Promise.all([
      (supabase as any)
        .from('low_stock_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30),
      (supabase as any)
        .from('low_stock_rules')
        .select('*')
        .eq('user_id', user.id)
        .is('listing_id', null)
        .limit(1),
    ])

    const fetchedAlerts = alertsRes.data ?? []
    const fetchedRules  = rulesRes.data ?? []

    setAlerts(fetchedAlerts)

    if (fetchedRules.length > 0) {
      const rule = fetchedRules[0]
      setGlobalRule(rule)
      setThreshold(rule.threshold)
      setEmailEnabled(rule.alert_email)
    }

    const unread = fetchedAlerts.filter((a: LowStockAlert) => !a.is_read).length
    onUnreadChange?.(unread)
  }, [supabase, onUnreadChange])

  useEffect(() => { loadData() }, [loadData])

  // ── Save global rule ──────────────────────────────────────────────────
  async function saveRule() {
    setIsSavingRule(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const payload = {
        user_id:      user.id,
        listing_id:   null,
        threshold,
        alert_email:  emailEnabled,
        alert_in_app: true,
        is_active:    true,
        updated_at:   new Date().toISOString(),
      }

      if (globalRule?.id) {
        await (supabase as any).from('low_stock_rules').update(payload).eq('id', globalRule.id)
      } else {
        const { data } = await (supabase as any).from('low_stock_rules').insert(payload).select().single()
        setGlobalRule(data)
      }
      setShowSettings(false)
    } finally { setIsSavingRule(false) }
  }

  // ── Run stock check ───────────────────────────────────────────────────
  async function runCheck() {
    setIsChecking(true)
    setCheckResult(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/inventory/check-low-stock', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })
      const json = await res.json()
      if (res.ok) {
        await loadData()
        setCheckResult(
          json.alerts === 0
            ? `✓ All ${json.checked} listings have sufficient stock`
            : `Found ${json.alerts} low-stock alert${json.alerts > 1 ? 's' : ''}${json.emailed ? ' — email sent' : ''}`
        )
      } else {
        setCheckResult(`Error: ${json.error}`)
      }
    } catch (e: any) {
      setCheckResult(`Error: ${e.message}`)
    } finally { setIsChecking(false) }
  }

  // ── Mark alert as read ────────────────────────────────────────────────
  async function markRead(id: string) {
    await (supabase as any).from('low_stock_alerts').update({ is_read: true }).eq('id', id)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
    onUnreadChange?.(Math.max(0, unreadCount - 1))
  }

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await (supabase as any).from('low_stock_alerts').update({ is_read: true }).eq('user_id', user.id)
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
    onUnreadChange?.(0)
  }

  // ── Compact badge mode ────────────────────────────────────────────────
  if (compact) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 10,
          border: `1px solid ${unreadCount > 0 ? C.warning + '80' : C.border}`,
          backgroundColor: unreadCount > 0 ? C.warningBg : C.bg,
          cursor: 'pointer',
        }}
        title={`${unreadCount} low-stock alert${unreadCount !== 1 ? 's' : ''}`}
      >
        <Bell size={16} style={{ color: unreadCount > 0 ? C.warning : C.txt3 }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 16, height: 16, borderRadius: 8,
            backgroundColor: C.danger, color: '#fff',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
    )
  }

  return (
    <div style={{
      backgroundColor: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      overflow: 'hidden',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        backgroundColor: C.bg,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            backgroundColor: unreadCount > 0 ? C.warningBg : C.primaryLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bell size={15} style={{ color: unreadCount > 0 ? C.warning : C.primary }} />
          </div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.txt1 }}>Low Stock Alerts</span>
            {unreadCount > 0 && (
              <span style={{
                marginLeft: 8, fontSize: 10, fontWeight: 700,
                padding: '2px 6px', borderRadius: 6,
                backgroundColor: C.dangerBg, color: C.danger,
              }}>{unreadCount} new</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Settings toggle */}
          <button
            onClick={() => setShowSettings(s => !s)}
            style={{
              width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
              backgroundColor: showSettings ? C.primaryLight : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
            <Settings size={14} style={{ color: showSettings ? C.primary : C.txt3 }} />
          </button>
          {/* Run check */}
          <button
            onClick={runCheck}
            disabled={isChecking}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              border: `1px solid ${C.border}`,
              backgroundColor: C.surface,
              color: C.primary, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            }}>
            <RefreshCw size={12} style={{ animation: isChecking ? 'spin 1s linear infinite' : 'none' }} />
            {isChecking ? 'Checking...' : 'Check Now'}
          </button>
        </div>
      </div>

      {/* ── Settings panel ──────────────────────────────────────── */}
      {showSettings && (
        <div style={{
          padding: '14px 16px',
          backgroundColor: C.primaryLight,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.txt1, marginBottom: 10 }}>Global Alert Settings</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Threshold input */}
            <div>
              <label style={{ fontSize: 11, color: C.txt2, display: 'block', marginBottom: 4 }}>
                Stock threshold
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={threshold}
                  onChange={e => setThreshold(Number(e.target.value))}
                  style={{
                    width: 64, padding: '6px 10px', borderRadius: 8,
                    border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 600,
                    color: C.txt1, backgroundColor: C.surface, fontFamily: 'DM Sans, sans-serif',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: 12, color: C.txt2 }}>units</span>
              </div>
            </div>

            {/* Email toggle */}
            <div>
              <label style={{ fontSize: 11, color: C.txt2, display: 'block', marginBottom: 4 }}>
                Email alerts
              </label>
              <button
                onClick={() => setEmailEnabled(e => !e)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8,
                  border: `1.5px solid ${emailEnabled ? C.primary : C.border}`,
                  backgroundColor: emailEnabled ? C.primary : C.surface,
                  color: emailEnabled ? '#fff' : C.txt2,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                <Mail size={12} />
                {emailEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Save button */}
            <div style={{ marginTop: 16, flexBasis: '100%' }}>
              <button
                onClick={saveRule}
                disabled={isSavingRule}
                style={{
                  padding: '8px 20px', borderRadius: 8,
                  backgroundColor: C.primary, color: '#fff',
                  fontSize: 13, fontWeight: 700, border: 'none',
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  opacity: isSavingRule ? 0.7 : 1,
                }}>
                {isSavingRule ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Check result banner ──────────────────────────────────── */}
      {checkResult && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: checkResult.startsWith('✓') ? C.successBg : C.dangerBg,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: checkResult.startsWith('✓') ? C.success : C.danger, fontWeight: 600 }}>
            {checkResult}
          </span>
          <button onClick={() => setCheckResult(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.txt3 }}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Alerts list ──────────────────────────────────────────── */}
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {alerts.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <Package size={32} style={{ color: C.txt3, margin: '0 auto 8px' }} />
            <p style={{ fontSize: 13, color: C.txt2, margin: 0 }}>
              No low-stock alerts.<br />Click "Check Now" to scan your listings.
            </p>
          </div>
        ) : (
          <>
            {unreadCount > 0 && (
              <div style={{ padding: '8px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={markAllRead}
                  style={{ fontSize: 11, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Mark all read
                </button>
              </div>
            )}
            {alerts.map(alert => {
              const isOos = (alert.current_qty ?? 0) === 0
              const color = isOos ? C.danger : C.warning
              const bgColor = isOos ? C.dangerBg : C.warningBg
              return (
                <div
                  key={alert.id}
                  style={{
                    padding: '11px 16px',
                    borderBottom: `1px solid ${C.border}`,
                    backgroundColor: alert.is_read ? C.surface : bgColor + '60',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    backgroundColor: bgColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <AlertTriangle size={13} style={{ color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 12, fontWeight: 600, color: C.txt1, margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {alert.listing_title || 'Unknown listing'}
                    </p>
                    <p style={{ fontSize: 11, color, margin: '2px 0 0', fontWeight: 600 }}>
                      {isOos ? '⚠ Out of stock' : `${alert.current_qty} left`}
                      {alert.threshold != null && (
                        <span style={{ color: C.txt3, fontWeight: 400 }}> · threshold: {alert.threshold}</span>
                      )}
                    </p>
                  </div>
                  {!alert.is_read && (
                    <button
                      onClick={() => markRead(alert.id)}
                      title="Mark as read"
                      style={{
                        width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.border}`,
                        backgroundColor: C.surface, cursor: 'pointer', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <CheckCircle2 size={13} style={{ color: C.success }} />
                    </button>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
