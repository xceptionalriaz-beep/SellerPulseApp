'use client'
// components/ui/VersionHistoryPanel.tsx
//
// Slide-in drawer that shows the last 20 saved versions of a template.
// Users can restore any version with one click.
// Used by both html-editor and visual-editor.

import { useState, useEffect, useCallback } from 'react'
import { History, X, RotateCcw, Clock, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'

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
  danger:       '#ef4444',
  dangerBg:     '#fee2e2',
}

interface Version {
  id: string
  name: string
  created_at: string
  html: string
}

interface Props {
  templateId: string | null
  onRestore: (html: string) => void
  onClose: () => void
}

function timeAgo(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`

  return new Date(isoString).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

export default function VersionHistoryPanel({ templateId, onRestore, onClose }: Props) {
  const supabase = createClient()
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const loadVersions = useCallback(async () => {
    if (!templateId) { setLoading(false); return }
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('template_versions')
        .select('id, name, created_at, html')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false })
        .limit(20)
      setVersions(data ?? [])
    } catch (e) {
      console.error('[VersionHistoryPanel] load error:', e)
    } finally {
      setLoading(false)
    }
  }, [templateId, supabase])

  useEffect(() => { loadVersions() }, [loadVersions])

  function handleRestore(v: Version) {
    if (confirmId !== v.id) {
      setConfirmId(v.id)
      return
    }
    setRestoring(v.id)
    onRestore(v.html)
    setConfirmId(null)
    setTimeout(() => {
      setRestoring(null)
    }, 800)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1100,
      width: 320, backgroundColor: C.surface,
      borderLeft: `1px solid ${C.border}`,
      boxShadow: '-8px 0 32px rgba(117,48,251,0.10)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
        backgroundColor: C.primaryLight,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={16} style={{ color: C.primary }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Version History</span>
        </div>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 8, border: 'none',
            backgroundColor: 'transparent', cursor: 'pointer', color: C.txt2,
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ede9fe' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Subheader ── */}
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg }}>
        <p style={{ margin: 0, fontSize: 11, color: C.txt3, lineHeight: 1.5 }}>
          Versions are saved automatically each time you save a draft. Restore any version to roll back.
        </p>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                height: 58, borderRadius: 10, backgroundColor: C.primaryLight,
                marginBottom: 8, animation: 'pulse 1.5s infinite',
              }} />
            ))}
          </div>
        ) : !templateId ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <History size={32} style={{ color: C.txt3, marginBottom: 8 }} />
            <p style={{ fontSize: 13, color: C.txt2, margin: 0 }}>
              Save the template first to start tracking versions.
            </p>
          </div>
        ) : versions.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <History size={32} style={{ color: C.txt3, marginBottom: 8 }} />
            <p style={{ fontSize: 13, color: C.txt2, margin: 0 }}>
              No saved versions yet.<br />Save a draft to create the first one.
            </p>
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {versions.map((v, i) => {
              const isConfirm = confirmId === v.id
              const isRestoring = restoring === v.id
              return (
                <div
                  key={v.id}
                  style={{
                    margin: '0 10px 4px',
                    borderRadius: 10,
                    border: `1px solid ${isConfirm ? C.primary : C.border}`,
                    backgroundColor: isConfirm ? C.primaryLight : C.surface,
                    transition: 'all 0.15s',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '10px 12px' }}>
                    {/* Version name row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {i === 0 && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, padding: '1px 6px',
                              borderRadius: 4, backgroundColor: C.successBg, color: C.success,
                              letterSpacing: '0.4px', textTransform: 'uppercase',
                            }}>Latest</span>
                          )}
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {v.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          <Clock size={10} style={{ color: C.txt3, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: C.txt3 }}>
                            {timeAgo(v.created_at)} · {formatTime(v.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Restore button */}
                      <button
                        onClick={() => handleRestore(v)}
                        disabled={!!restoring}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '5px 9px', borderRadius: 7,
                          border: `1px solid ${isConfirm ? C.primary : C.border}`,
                          backgroundColor: isConfirm ? C.primary : C.bg,
                          color: isConfirm ? '#fff' : C.txt2,
                          fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'DM Sans, sans-serif',
                          transition: 'all 0.12s',
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                          if (!isConfirm) {
                            e.currentTarget.style.backgroundColor = C.primaryLight
                            e.currentTarget.style.borderColor = C.primary
                            e.currentTarget.style.color = C.primary
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isConfirm) {
                            e.currentTarget.style.backgroundColor = C.bg
                            e.currentTarget.style.borderColor = C.border
                            e.currentTarget.style.color = C.txt2
                          }
                        }}
                      >
                        {isRestoring ? (
                          <>✓ Restored</>
                        ) : isConfirm ? (
                          <><RotateCcw size={11} /> Confirm</>
                        ) : (
                          <><RotateCcw size={11} /> Restore</>
                        )}
                      </button>
                    </div>

                    {/* Confirm warning */}
                    {isConfirm && (
                      <div style={{
                        marginTop: 8, padding: '7px 10px', borderRadius: 7,
                        backgroundColor: '#fff8e1', border: '1px solid #d97706',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <ChevronRight size={11} style={{ color: '#d97706', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: '#92400e' }}>
                          This will replace your current editor content. Click Confirm to continue or{' '}
                          <button
                            onClick={() => setConfirmId(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', fontWeight: 700, fontSize: 11, padding: 0 }}
                          >
                            cancel
                          </button>.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}`, backgroundColor: C.bg }}>
        <p style={{ margin: 0, fontSize: 11, color: C.txt3, textAlign: 'center' }}>
          Showing up to 20 most recent saves
        </p>
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// Helper: call this inside saveDraft() in either editor to persist a version
// ─────────────────────────────────────────────────────────────────────────────
export async function saveTemplateVersion(
  templateId: string,
  userId: string,
  html: string,
  name: string,
) {
  try {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('template_versions').insert({
      template_id: templateId,
      user_id: userId,
      html,
      name: `${name} — ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
    })

    // Keep only the latest 20 versions per template to avoid bloat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: oldest } = await (supabase as any)
      .from('template_versions')
      .select('id, created_at')
      .eq('template_id', templateId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(20, 999)

    if (oldest && oldest.length > 0) {
      const ids = oldest.map((r: { id: string }) => r.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('template_versions').delete().in('id', ids)
    }
  } catch (e) {
    // Version save is non-critical — silently ignore
    console.warn('[saveTemplateVersion]', e)
  }
}
