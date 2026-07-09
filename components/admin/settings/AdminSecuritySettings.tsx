'use client'
// components/admin/settings/AdminSecuritySettings.tsx
import { useState, useEffect } from 'react'
import { RefreshCw, Check, Shield, Clock, Mail, Lock } from 'lucide-react'
import ProDropdown from '@/components/ui/ProDropdown'
import { createClient } from '@/lib/supabase'

const C = {
  lime:        '#8fff00',
  limeDeep:    '#4a8f00',
  limeTint:    '#f4ffe6',
  dark:        '#1a2410',
  border:      '#e8ede2',
  muted:       '#8a9e78',
  bg:          '#f7f9f5',
  surface:     '#ffffff',
  text:        '#1a2410',
  blueBg:      '#eff6ff',
  blueBorder:  '#bfdbfe',
  blue:        '#1d4ed8',
}

interface LoginEntry {
  id:          string
  ip_address:  string
  device_info: string
  login_at:    string
}

export default function AdminSecuritySettings() {
  const supabase = createClient()
  const [loading, setLoading]               = useState(true)
  const [saving, setSaving]                 = useState<string | null>(null)
  const [saved, setSaved]                   = useState<string | null>(null)
  const [sessionTimeout, setSessionTimeout] = useState(true)
  const [loginNotif, setLoginNotif]         = useState(true)
  const [timeoutHours, setTimeoutHours]     = useState('24')
  const [loginHistory, setLoginHistory]     = useState<LoginEntry[]>([])
  const [toast, setToast]                   = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Load admin settings
        const { data } = await (supabase.from('admin_settings') as any).select('key, value')
        if (data) {
          data.forEach((row: any) => {
            if (row.key === 'session_timeout_enabled')     setSessionTimeout(row.value === 'true')
            if (row.key === 'login_notifications_enabled') setLoginNotif(row.value === 'true')
            if (row.key === 'session_timeout_hours')       setTimeoutHours(row.value || '24')
          })
        }

        // Load recent login history
        const { data: logins } = await (supabase.from('login_history') as any)
          .select('id, ip_address, device_info, login_at')
          .order('login_at', { ascending: false })
          .limit(5)
        if (logins) setLoginHistory(logins)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  async function saveSetting(key: string, value: string, label: string) {
    setSaving(key)
    await fetch('/api/admin-settings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ key, value }),
    })
    setSaved(key); setTimeout(() => setSaved(null), 2000)
    setSaving(null)
    showToast(`${label} saved ✓`)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  function Toggle({ enabled, onToggle, disabled = false }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
    return (
      <div onClick={disabled ? undefined : onToggle}
           style={{ width: 36, height: 20, borderRadius: 100, background: enabled ? C.lime : C.border, position: 'relative', cursor: disabled ? 'default' : 'pointer', flexShrink: 0, transition: 'background .2s', opacity: disabled ? 0.5 : 1 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: C.surface, position: 'absolute', top: 3, left: enabled ? 19 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 28px', fontFamily: 'Inter, sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: C.dark, border: `1px solid ${C.lime}`, borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <Check size={14} style={{ color: C.lime }}/>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.lime }}>{toast}</span>
        </div>
      )}

      <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: '0 0 4px' }}>Security</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 24px' }}>Admin security settings and access control</p>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <RefreshCw size={20} style={{ color: C.muted, animation: 'spin 1s linear infinite' }}/>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Two-factor auth — coming soon */}
          <div style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Lock size={16} style={{ color: C.dark }}/>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 2px' }}>Two-factor authentication</p>
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Add an extra layer of security to admin login</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.blue, background: C.blueBg, border: `0.5px solid ${C.blueBorder}`, borderRadius: 100, padding: '3px 8px' }}>Coming soon</span>
              <Toggle enabled={false} onToggle={() => {}} disabled/>
            </div>
          </div>

          {/* Session timeout */}
          <div style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: sessionTimeout ? 12 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={16} style={{ color: C.dark }}/>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 2px' }}>Session timeout</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Auto logout after inactivity</p>
                </div>
              </div>
              <Toggle enabled={sessionTimeout} onToggle={() => {
                const newVal = !sessionTimeout
                setSessionTimeout(newVal)
                saveSetting('session_timeout_enabled', String(newVal), 'Session timeout')
              }}/>
            </div>
            {sessionTimeout && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 48, marginTop: 12 }}>
                <label style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>Timeout after</label>
                <ProDropdown
                  prefix=""
                  currentValue={timeoutHours}
                  options={[
                    { val: '1',   label: '1 hour',   enabled: true },
                    { val: '6',   label: '6 hours',  enabled: true },
                    { val: '12',  label: '12 hours', enabled: true },
                    { val: '24',  label: '24 hours', enabled: true },
                    { val: '48',  label: '48 hours', enabled: true },
                    { val: '168', label: '7 days',   enabled: true },
                  ]}
                  onChanged={val => {
                    setTimeoutHours(val)
                    saveSetting('session_timeout_hours', val, 'Session timeout')
                  }}
                  width={160}
                />
                {saved === 'session_timeout_hours' && <Check size={14} style={{ color: C.limeDeep }}/>}
              </div>
            )}
          </div>

          {/* Login notifications */}
          <div style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={16} style={{ color: C.dark }}/>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 2px' }}>Login notifications</p>
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Send email alert on new admin login</p>
              </div>
            </div>
            <Toggle enabled={loginNotif} onToggle={() => {
              const newVal = !loginNotif
              setLoginNotif(newVal)
              saveSetting('login_notifications_enabled', String(newVal), 'Login notifications')
            }}/>
          </div>

          {/* Recent login history */}
          <div style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={16} style={{ color: C.dark }}/>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 2px' }}>Recent admin logins</p>
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Last 5 admin login events</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 8, overflow: 'hidden', border: `0.5px solid ${C.border}` }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '8px 12px', background: C.bg, borderBottom: `0.5px solid ${C.border}` }}>
                {['Device', 'IP Address', 'Date & Time'].map(h => (
                  <p key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, margin: 0, letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</p>
                ))}
              </div>
              {loginHistory.length === 0 ? (
                <p style={{ fontSize: 12, color: C.muted, margin: 0, padding: '12px' }}>No login history found</p>
              ) : loginHistory.map((entry, i) => (
                <div key={entry.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 12px', background: C.surface, borderBottom: i < loginHistory.length - 1 ? `0.5px solid ${C.border}` : 'none', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.lime, flexShrink: 0 }}/>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>{(entry.device_info || 'Unknown device').replace('•', ' — ')}</p>
                  </div>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0, fontFamily: 'monospace' }}>{entry.ip_address}</p>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{formatDate(entry.login_at)}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}