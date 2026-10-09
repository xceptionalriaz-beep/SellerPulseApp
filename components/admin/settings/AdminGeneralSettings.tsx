'use client'
// components/admin/settings/AdminGeneralSettings.tsx
import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import ProDropdown from '@/components/ui/ProDropdown'
import { useTabPermissions } from '@/hooks/useTabPermissions'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  bg:       '#f7f9f5',
  surface:  '#ffffff',
  text:     '#1a2410',
}

export default function AdminGeneralSettings() {
  const { can } = useTabPermissions('settings_general')
  const [status, setStatus]       = useState<{id:string; status:string; message:string; updated_at:string; updated_by:string|null} | null>(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [lsConfig, setLsConfig]   = useState<Record<string,string>>({})
  const [maintenance, setMaintenance] = useState(false)
  const [savingMaint, setSavingMaint] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: statusData } = await (supabase.from('system_status') as any)
          .select('*').order('updated_at', { ascending: false }).limit(1).single()
        if (statusData) setStatus(statusData)

        const { data: lsData } = await (supabase.from('ls_config') as any).select('key, value')
        if (lsData) {
          const config: Record<string,string> = {}
          lsData.forEach((r: any) => { config[r.key] = r.value })
          setLsConfig(config)
        }

        // Get maintenance kill switch
        const { data: ksData } = await (supabase.from('kill_switches') as any)
          .select('id, is_enabled').eq('title', 'Maintenance Mode').single()
        if (ksData) setMaintenance(ksData.is_enabled)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  async function saveStatus() {
    if (!status) return
    setSaving(true)
    await (supabase.from('system_status') as any)
      .update({ status: status.status, message: status.message, updated_at: new Date().toISOString() })
      .eq('id', status.id)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  async function toggleMaintenance() {
    setSavingMaint(true)
    const newVal = !maintenance
    await (supabase.from('kill_switches') as any)
      .update({ is_enabled: newVal, updated_at: new Date().toISOString() })
      .eq('title', 'Maintenance Mode')
    setMaintenance(newVal)
    setSavingMaint(false)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: '0 0 4px' }}>General</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 24px' }}>System status and platform configuration</p>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <RefreshCw size={20} style={{ color: C.muted, animation: 'spin 1s linear infinite' }}/>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* System Status */}
          <div style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', margin: '0 0 14px' }}>System status</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ fontSize: 13, color: C.muted, minWidth: 100, flexShrink: 0 }}>Status</label>
                <ProDropdown
                  prefix="Status:"
                  currentValue={status?.status || 'operational'}
                  options={[
                    { val: 'operational', label: 'Operational', enabled: true },
                    { val: 'maintenance', label: 'Maintenance',  enabled: true },
                    { val: 'degraded',    label: 'Degraded',    enabled: true },
                  ]}
                  onChanged={val => setStatus(s => s ? { ...s, status: val } : s)}
                  width={200}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <label style={{ fontSize: 13, color: C.muted, minWidth: 100, flexShrink: 0, paddingTop: 8 }}>Message</label>
                <textarea value={status?.message || ''}
                          onChange={e => setStatus(s => s ? { ...s, message: e.target.value } : s)}
                          rows={2}
                          style={{ flex: 1, fontSize: 13, padding: '8px 12px', borderRadius: 8, border: `0.5px solid ${C.border}`, outline: 'none', color: C.text, background: C.surface, fontFamily: 'Inter, sans-serif', resize: 'none' }}/>
              </div>
              {can('save_general') && <button onClick={saveStatus} disabled={saving}
                      style={{ alignSelf: 'flex-start', height: 34, padding: '0 16px', borderRadius: 100, border: 'none', background: saved ? C.limeDeep : C.lime, color: C.dark, fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>
                {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save status'}
              </button>}
              {status?.updated_at && (
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                  Last updated: {formatDate(status.updated_at)}
                  {status.updated_by && ` · ${status.updated_by}`}
                </p>
              )}
            </div>
          </div>

          {/* Maintenance mode */}
          <div style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', margin: '0 0 14px' }}>Maintenance mode</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 2px' }}>Enable maintenance mode</p>
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Temporarily disable access for non-admin users</p>
              </div>
              <div onClick={!savingMaint && can('edit_maintenance') ? toggleMaintenance : undefined}
                   style={{ width: 36, height: 20, borderRadius: 100, background: maintenance ? C.lime : C.border, position: 'relative', cursor: !can('edit_maintenance') ? 'not-allowed' : savingMaint ? 'wait' : 'pointer', flexShrink: 0, transition: 'background .2s', opacity: can('edit_maintenance') ? 1 : 0.5 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: C.surface, position: 'absolute', top: 3, left: maintenance ? 19 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
              </div>
            </div>
            {maintenance && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef3c7', border: '0.5px solid #fcd34d', borderRadius: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#92400e', margin: 0 }}>Maintenance mode is ON — users cannot access the platform</p>
              </div>
            )}
          </div>

          {/* Billing config */}
          <div style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '.07em', textTransform: 'uppercase', margin: '0 0 14px' }}>Billing configuration (Lemon Squeezy)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(lsConfig).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ fontSize: 12, color: C.muted, minWidth: 140, flexShrink: 0, fontFamily: 'monospace' }}>{key}</label>
                  <div style={{ flex: 1, height: 32, fontSize: 12, padding: '0 12px', borderRadius: 8, border: `0.5px solid ${C.border}`, color: C.text, background: C.surface, display: 'flex', alignItems: 'center', fontFamily: 'monospace' }}>
                    {value}
                  </div>
                </div>
              ))}
              <p style={{ fontSize: 11, color: C.muted, margin: '4px 0 0' }}>These values are managed in Supabase directly.</p>
            </div>
          </div>

        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}