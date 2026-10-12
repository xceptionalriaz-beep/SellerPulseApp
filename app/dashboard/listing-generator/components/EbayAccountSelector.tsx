'use client'
// app/dashboard/listing-generator/components/EbayAccountSelector.tsx
//
// Dropdown account-picker button for the Listing Studio header.
// Shows: eBay logo + flag + username + marketplace + ⚠️ if token expired/expiring.
// Dropdown: account card, renew link if needed, + Add Account CTA.
//
// Fully self-contained — fetches its own profile data.

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronDown, AlertTriangle, Plus, CheckCircle2, ExternalLink } from 'lucide-react'
import NextLink from 'next/link'
import { createClient } from '@/lib/supabase'
import { getFlagCode, getMarketplaceLabel } from '@/lib/ebay-marketplace'

// ── Design tokens ─────────────────────────────────────────────────────
const C = {
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryHover: '#6020e0',
    accent: '#b8fa33',
    dark: '#1e1535',
    border: '#ede9fe',
    surface: '#ffffff',
    bg: '#f8f7ff',
    txt1: '#1e1535',
    txt2: '#6b7280',
    txt3: '#9ca3af',
    warning: '#d97706',
    warningBg: '#fef3c7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    success: '#16a34a',
    successBg: '#dcfce7',
}

// ── eBay brand logo ────────────────────────────────────────────────────
function EbayLogo({ size = 13 }: { size?: number }) {
    const s: React.CSSProperties = {
        fontSize: size,
        fontWeight: 900,
        fontFamily: '"Arial Black", Arial, sans-serif',
        letterSpacing: '-0.5px',
        lineHeight: 1,
    }
    return (
        <span style={s} aria-label="eBay">
            <span style={{ color: '#e53238' }}>e</span>
            <span style={{ color: '#0064d2' }}>b</span>
            <span style={{ color: '#f5af02' }}>a</span>
            <span style={{ color: '#86b817' }}>y</span>
        </span>
    )
}

// ── Flag emoji from marketplace id ────────────────────────────────────
function flagEmoji(marketplaceId: string): string {
    try {
        const code = getFlagCode(marketplaceId).toUpperCase()
        return String.fromCodePoint(...code.split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
    } catch {
        return '🌐'
    }
}

// ── Types ─────────────────────────────────────────────────────────────
interface Profile {
    username: string
    marketplace: string
    tokenExpiresAt: string | null
    connected: boolean
}

function tokenStatus(expiresAt: string | null): 'ok' | 'expiring' | 'expired' | 'unknown' {
    if (!expiresAt) return 'unknown'
    const exp = new Date(expiresAt).getTime()
    const now = Date.now()
    const days = (exp - now) / (1000 * 60 * 60 * 24)
    if (days < 0) return 'expired'
    if (days < 7) return 'expiring'
    return 'ok'
}

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function EbayAccountSelector() {
    const supabase = createClient()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<Profile | null>(null)
    const dropRef = useRef<HTMLDivElement>(null)

    // ── Fetch profile ──────────────────────────────────────────────────
    const loadProfile = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }

            const { data } = await (supabase.from('profiles') as any)
                .select('ebay_username, ebay_marketplace, ebay_access_token, ebay_token_expires_at')
                .eq('id', user.id)
                .single()

            if (data?.ebay_access_token && data?.ebay_marketplace) {
                setProfile({
                    username: data.ebay_username || 'eBay Seller',
                    marketplace: data.ebay_marketplace,
                    tokenExpiresAt: data.ebay_token_expires_at ?? null,
                    connected: true,
                })
            } else {
                setProfile({ username: '', marketplace: 'EBAY_US', tokenExpiresAt: null, connected: false })
            }
        } catch { }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { loadProfile() }, [loadProfile])

    // ── Close on outside click ─────────────────────────────────────────
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
        }
        if (open) document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    // ── Loading skeleton ───────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl animate-pulse"
            style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}`, width: 160, height: 36 }} />
    )

    const status = profile?.connected ? tokenStatus(profile.tokenExpiresAt) : null

    // ── Trigger button ─────────────────────────────────────────────────
    const triggerContent = profile?.connected ? (
        <>
            <EbayLogo size={13} />
            <span style={{ fontSize: 16, lineHeight: 1 }}>{flagEmoji(profile.marketplace)}</span>
            <span className="text-[12px] font-semibold max-w-[90px] truncate"
                style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                {profile.username}
            </span>
            {(status === 'expired' || status === 'expiring') && (
                <AlertTriangle size={13} style={{ color: C.warning, flexShrink: 0 }} />
            )}
            <ChevronDown size={13} style={{ color: C.txt3, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </>
    ) : (
        <>
            <EbayLogo size={13} />
            <span className="text-[12px] font-semibold" style={{ color: C.txt2, fontFamily: 'DM Sans, sans-serif' }}>
                Not connected
            </span>
            <ChevronDown size={13} style={{ color: C.txt3, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </>
    )

    return (
        <div ref={dropRef} style={{ position: 'relative', display: 'inline-block' }}>
            {/* ── Trigger ── */}
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all hover:opacity-85 active:scale-[0.98]"
                style={{
                    backgroundColor: open ? C.primaryLight : C.surface,
                    border: `1px solid ${open ? C.primary : C.border}`,
                    outline: 'none',
                    cursor: 'pointer',
                }}>
                {triggerContent}
            </button>

            {/* ── Dropdown ── */}
            {open && (
                <div
                    className="absolute right-0 z-50 rounded-2xl overflow-hidden"
                    style={{
                        top: 'calc(100% + 8px)',
                        minWidth: 240,
                        backgroundColor: C.surface,
                        border: `1px solid ${C.border}`,
                        boxShadow: '0 12px 40px rgba(117,48,251,0.14)',
                    }}>

                    {/* Header */}
                    <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.primaryLight }}>
                        <p className="text-[11px] font-bold tracking-[0.6px]"
                            style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase' }}>
                            eBay accounts
                        </p>
                    </div>

                    {/* Account row */}
                    {profile?.connected ? (
                        <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                            <div className="flex items-center gap-2.5">
                                {/* eBay logo + flag */}
                                <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg"
                                    style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                                    <EbayLogo size={12} />
                                    <span style={{ fontSize: 14, lineHeight: 1 }}>{flagEmoji(profile.marketplace)}</span>
                                </div>

                                {/* Username + marketplace */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[13px] font-bold truncate"
                                            style={{ color: C.txt1, fontFamily: 'DM Sans, sans-serif' }}>
                                            {profile.username}
                                        </span>
                                        {status === 'ok' && <CheckCircle2 size={12} style={{ color: C.success, flexShrink: 0 }} />}
                                        {(status === 'expired' || status === 'expiring') && (
                                            <AlertTriangle size={12} style={{ color: C.warning, flexShrink: 0 }} />
                                        )}
                                    </div>
                                    <span className="text-[11px]" style={{ color: C.txt3, fontFamily: 'DM Sans, sans-serif' }}>
                                        {getMarketplaceLabel(profile.marketplace)}
                                    </span>
                                </div>

                                {/* Status badge */}
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                                    style={
                                        status === 'expired' ? { backgroundColor: C.dangerBg, color: C.danger } :
                                            status === 'expiring' ? { backgroundColor: C.warningBg, color: C.warning } :
                                                { backgroundColor: C.successBg, color: C.success }
                                    }>
                                    {status === 'expired' ? 'Expired' : status === 'expiring' ? 'Expiring' : 'Live'}
                                </span>
                            </div>

                            {/* Token warning with renew link */}
                            {(status === 'expired' || status === 'expiring') && (
                                <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-2 rounded-lg"
                                    style={{ backgroundColor: C.warningBg, border: `1px solid ${C.warning}33` }}>
                                    <AlertTriangle size={11} style={{ color: C.warning, flexShrink: 0 }} />
                                    <span className="text-[11px]" style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                                        Token {status === 'expired' ? 'expired' : 'expiring soon'},{' '}
                                        <NextLink
                                            href="/dashboard/profile?tab=ebay"
                                            className="font-bold underline"
                                            style={{ color: C.warning }}
                                            onClick={() => setOpen(false)}>
                                            click here to renew
                                        </NextLink>.
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Not connected row */
                        <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg"
                                    style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                                    <EbayLogo size={12} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[12px] font-medium" style={{ color: C.txt2, fontFamily: 'DM Sans, sans-serif' }}>
                                        No account connected
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* + Add Account */}
                    <NextLink
                        href="/dashboard/profile?tab=ebay"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 transition-colors hover:bg-[#f3eeff]"
                        style={{ textDecoration: 'none' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: C.primaryLight, border: `1px dashed ${C.primary}55` }}>
                            <Plus size={13} style={{ color: C.primary }} />
                        </div>
                        <span className="text-[13px] font-semibold"
                            style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                            {profile?.connected ? 'Add / Reconnect Account' : 'Add Account'}
                        </span>
                        <ExternalLink size={11} style={{ color: C.txt3, marginLeft: 'auto' }} />
                    </NextLink>

                    {/* Manage in settings */}
                    <NextLink
                        href="/dashboard/profile?tab=ebay"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 transition-colors hover:bg-[#f8f7ff]"
                        style={{ textDecoration: 'none', borderTop: `1px solid ${C.border}` }}>
                        <span className="text-[12px]" style={{ color: C.txt3, fontFamily: 'DM Sans, sans-serif' }}>
                            Manage in Settings →
                        </span>
                    </NextLink>
                </div>
            )}
        </div>
    )
}
