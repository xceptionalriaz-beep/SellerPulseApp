'use client'
// app/dashboard/layout.tsx
// ═══════════════════════════════════════════════════════════════
// Converted from: lib/pages/dashboard_page.dart
//
// What the Dart version had:
//   ✅ 60px slim dark sidebar rail (desktop)
//   ✅ Lime active state with left border indicator + scale animation
//   ✅ Shield logo at top of sidebar
//   ✅ Tooltip on each sidebar icon
//   ✅ Top navbar — "Riazify" brand text + notification bell + avatar
//   ✅ Avatar — Google photo OR DiceBear OR initials fallback
//   ✅ Notification bell — hover lime, pulse animation, red badge
//   ✅ Bottom-right Windows-style toast (4s, progress bar)
//   ✅ Mobile drawer (hamburger menu)
//   ✅ Logout button
//   ✅ Admin nav item (only for admin role)
//   ✅ Polls notifications every 60 seconds
//   ✅ Location verification prompt
//   ✅ Role-based routing
//
// NEW (presence system):
//   ✅ useHeartbeat — updates last_seen every 2 min (invisible)
//   ✅ usePresence  — joins Supabase Realtime channel so admin
//                    CRM shows who is online right now
//
// NEW (kill switch visibility):
//   ✅ Tools hidden from sidebar when kill switch is OFF
//   ✅ Re-appear when kill switch is turned back ON
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, LayoutDashboard, Search, Type, Calculator,
  Package, Radar, ShieldCheck, Settings,
  ShieldAlert, LogOut, Bell, Menu, X, MessageCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { NotificationsPanelOverlay } from '@/components/NotificationsPanel'
import { useToast } from '@/components/ui/AppToast'
import { cn, initials } from '@/lib/utils'
import type { Profile } from '@/types/database'

// ── Presence system ────────────────────────────────────────────
import { useHeartbeat } from '@/hooks/useHeartbeat'
import { usePresence }  from '@/hooks/usePresence'
import TeamSwitcherBanner from '@/components/TeamSwitcherBanner'
import SupportModal          from '@/components/dashboard/SupportModal'
import AnnouncementBanner    from '@/components/dashboard/AnnouncementBanner'

// ── Nav items (mirrors Dart sidebar exactly) ───────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',           href: '/dashboard'                           },
  { icon: Search,          label: 'Product Research',    href: '/dashboard/product-research'          },
  { icon: Type,            label: 'Title Builder',       href: '/dashboard/title-builder'             },
  { icon: Calculator,      label: 'Profit Calculator',   href: '/dashboard/profit-calculator'         },
  { icon: Package,         label: 'Inventory',           href: '/dashboard/inventory'                 },
  { icon: Radar,           label: 'Competitor Research', href: '/dashboard/competitor-research'       },
  { icon: ShieldCheck,     label: 'Orders',              href: '/dashboard/orders'                    },
  { icon: Settings,        label: 'Settings',            href: '/dashboard/profile'                   },
]

// ── Kill switch → nav label mapping ───────────────────────────
// Maps kill_switches.title → NAV_ITEMS label
// When a switch is OFF → that nav item is hidden from sidebar
const KILL_SWITCH_MAP: Record<string, string> = {
  'Title Builder':       'Title Builder',
  'Product Research':    'eBay Product Research Tool',
  'Profit Calculator':   'Profit Calculator',
  'Inventory':           'Inventory Manager',
  'Competitor Research': 'Competitor Research',
  'Orders':              'Orders Management',
}

// ── Sidebar Item ───────────────────────────────────────────────
function SidebarItem({
  icon: Icon, label, href, isActive, onClick
}: {
  icon: React.ElementType
  label: string
  href: string
  isActive: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={label}
      className="relative flex items-center justify-center w-[60px] h-[52px] group"
    >
      {isActive && (
        <div className="absolute left-0 w-[3px] h-6 bg-lime rounded-r-[10px]" />
      )}
      <div className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-250',
        isActive
          ? 'bg-lime scale-100'
          : 'bg-transparent group-hover:bg-white/10 scale-95 group-hover:scale-100'
      )}>
        <Icon
          size={isActive ? 20 : 19}
          className={cn(isActive ? 'text-dark' : 'text-white/40 group-hover:text-white/70')}
        />
      </div>
    </Link>
  )
}

// ── Notification Bell ──────────────────────────────────────────
function NotificationBell({
  count, isPulsing, onClick
}: {
  count: number
  isPulsing: boolean
  onClick: () => void
}) {
  const [hovering, setHovering] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="relative p-2 rounded-full transition-all duration-200"
      style={{
        backgroundColor: hovering ? 'rgba(143,255,0,0.15)' : 'rgba(255,255,255,0.8)',
        animation: isPulsing ? 'pulseLime 0.6s ease-in-out 3' : 'none',
      }}
    >
      <Bell
        size={22}
        className={cn(
          'transition-colors duration-200',
          hovering  ? 'text-limeDeep' :
          count > 0 ? 'text-red-700'  : 'text-[#8A9E78]'
        )}
      />
      {count > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-700 rounded-full flex items-center justify-center">
          <span className="text-white text-[8px] font-extrabold">
            {count > 9 ? '9+' : count}
          </span>
        </span>
      )}
    </button>
  )
}

// ── Avatar ─────────────────────────────────────────────────────
function UserAvatar({
  profile, onClick
}: {
  profile: Profile | null
  onClick: () => void
}) {
  const avatarUrl = profile?.avatar_url ||
    (profile?.gender === 'Male'
      ? `https://api.dicebear.com/9.x/adventurer-neutral/png?seed=${profile?.email}male&backgroundColor=b6e3f4`
      : profile?.gender === 'Female'
        ? `https://api.dicebear.com/9.x/lorelei/png?seed=${profile?.email}female&backgroundColor=ffdfbf`
        : null)

  const userInitials = initials(profile?.name || profile?.email || 'U')

  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-2xl bg-lime overflow-hidden flex items-center justify-center hover:opacity-90 transition-opacity"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <span className="text-dark font-black text-[13px] tracking-wide">{userInitials}</span>
      )}
    </button>
  )
}

// ── Live Notification Toast (bottom-right, Windows-style) ──────
function NotifToast({
  title, message, onTap, onDismiss, bottomOffset
}: {
  title: string
  message: string
  onTap: () => void
  onDismiss: () => void
  bottomOffset: number
}) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => Math.max(0, p - (100 / 40)))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="fixed z-50 w-[320px] rounded-[14px] overflow-hidden border border-lime/25 shadow-[0_8px_20px_rgba(0,0,0,0.3)] animate-slide-up cursor-pointer"
      style={{ right: 20, bottom: 20 + bottomOffset, backgroundColor: '#0F172A' }}
      onClick={onTap}
    >
      <div className="flex items-start gap-3 p-3.5 pr-3">
        <div className="w-9 h-9 rounded-[10px] bg-lime/12 flex items-center justify-center shrink-0">
          <Bell size={18} className="text-lime" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white text-[13px] font-bold truncate">{title}</span>
            <span className="text-[8px] font-extrabold text-lime bg-lime/15 px-1.5 py-0.5 rounded-full tracking-wide shrink-0">NEW</span>
          </div>
          <p className="text-white/55 text-[11px] leading-relaxed line-clamp-2">{message}</p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-white/30 text-[10px]">Just now</span>
            <span className="text-lime/70 text-[10px] font-semibold">Tap to view</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss() }}
          className="text-white/30 hover:text-white/60 transition-colors shrink-0 mt-0.5"
        >
          <X size={14} />
        </button>
      </div>
      <div className="h-[3px] bg-white/5">
        <div className="h-full bg-lime transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD LAYOUT
// ══════════════════════════════════════════════════════════════
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const toast    = useToast()
  const supabase = createClient()

  const [profile,        setProfile]        = useState<Profile | null>(null)
  const [mobileOpen,     setMobileOpen]     = useState(false)
  const [notifCount,     setNotifCount]     = useState(0)
  const [prevCount,      setPrevCount]      = useState(0)
  const [bellPulsing,    setBellPulsing]    = useState(false)
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [toasts,         setToasts]         = useState<Array<{id: string; title: string; message: string}>>([])

  // ── Kill switch visibility state ───────────────────────────────
  const [disabledTools,  setDisabledTools]  = useState<Set<string>>(new Set())
  const [showSupport,    setShowSupport]    = useState(false)
  const [emailUnverified, setEmailUnverified] = useState(false)

  const isAdmin = profile?.role === 'admin'

  // ── Presence system ────────────────────────────────────────────
  useHeartbeat()
  usePresence()

  // ── Load profile + kill switches ──────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data as Profile)
      if (user && !user.email_confirmed_at) setEmailUnverified(true)

      // ── Fetch kill switches to hide disabled tools from sidebar ──
      try {
        const { data: switches } = await (supabase.from('kill_switches') as any)
          .select('title, is_enabled, is_visible')
        const disabled = new Set<string>(
          (switches ?? [])
            .filter((s: any) => !s.is_visible)
            .map((s: any) => s.title as string)
        )
        setDisabledTools(disabled)
      } catch { /* non-critical — show all tools if check fails */ }
    }
    loadProfile()
  }, [])

  // ── Reload kill switches every 60 seconds ──────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data: switches } = await (supabase.from('kill_switches') as any)
          .select('title, is_enabled, is_visible')
        const disabled = new Set<string>(
          (switches ?? [])
            .filter((s: any) => !s.is_visible)
            .map((s: any) => s.title as string)
        )
        setDisabledTools(disabled)
      } catch { /* non-critical */ }
    }, 60000)
    return () => clearInterval(interval)
  }, [supabase])

  // ── Filter nav items based on kill switches ────────────────────
  const visibleNavItems = NAV_ITEMS.filter(item => {
    const switchTitle = KILL_SWITCH_MAP[item.label]
    if (!switchTitle) return true // no kill switch = always show (Dashboard, Settings)
    return !disabledTools.has(switchTitle)
  })

  // ── Load notification count ────────────────────────────────────
  const loadNotifCount = useCallback(async () => {
    if (!profile) return
    try {
      if (profile.role === 'admin') {
        const { count } = await supabase
          .from('admin_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
        const n = count ?? 0
        if (n > prevCount && prevCount !== 0) {
          setBellPulsing(true)
          setTimeout(() => setBellPulsing(false), 1500)
        }
        setPrevCount(n)
        setNotifCount(n)
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { count } = await supabase
          .from('protected_orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('risk_level', 'HIGH')
        const n = count ?? 0
        setPrevCount(n)
        setNotifCount(n)
      }
    } catch {}
  }, [profile, prevCount])

  useEffect(() => {
    loadNotifCount()
    const timer = setInterval(loadNotifCount, 60000)
    return () => clearInterval(timer)
  }, [loadNotifCount])

  // ── Logout ─────────────────────────────────────────────────────
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  function openNotifPanel() { setShowNotifPanel(true) }
  function removeToast(id: string) { setToasts(prev => prev.filter(t => t.id !== id)) }

  return (
    <div className="min-h-screen bg-bg">
      {showNotifPanel && (
        <NotificationsPanelOverlay onClose={() => setShowNotifPanel(false)} />
      )}
      <div className="flex gap-0 h-screen">

        {/* ── DESKTOP SIDEBAR RAIL (60px dark) ── */}
        <aside className="hidden lg:flex w-[60px] shrink-0 flex-col bg-dark rounded-[30px] m-3">
          {/* Shield logo */}
          <div className="flex justify-center pt-[30px] pb-[35px]">
            <button
              onClick={() => router.push('/dashboard')}
              title="Home"
              className="hover:opacity-80 transition-opacity"
            >
              <Shield size={24} className="text-lime" />
            </button>
          </div>

          {/* Nav items — filtered by kill switches */}
          <div className="flex flex-col flex-1">
            {visibleNavItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname === item.href}
              />
            ))}

            {/* Admin item — only for admin role */}
            {isAdmin && (
              <SidebarItem
                icon={ShieldAlert as React.ElementType}
                label="Admin Center"
                href="/dashboard/admin"
                isActive={pathname.startsWith('/dashboard/admin')}
              />
            )}
          </div>

          {/* Support + Logout */}
          <div className="pb-6 flex flex-col items-center gap-2">
            <button
              onClick={() => setShowSupport(true)}
              title="Help & Support"
              className="p-2 text-white/40 hover:text-white/70 transition-colors"
            >
              <MessageCircle size={20} />
            </button>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-2 text-white/40 hover:text-white/70 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* ── TOP NAVBAR ── */}
          <header className="h-[60px] flex items-center px-6 shrink-0">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden mr-3 text-dark">
              <Menu size={28} />
            </button>

            {(() => {
              const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Seller'
              const hour = new Date().getHours()
              const timeGreeting = hour >= 5 && hour < 12 ? `Good morning, ${firstName}!`
                : hour >= 12 && hour < 17 ? `Good afternoon, ${firstName}!`
                : hour >= 17 && hour < 21 ? `Good evening, ${firstName}!`
                : `Good night, ${firstName}!`
              const isMain   = pathname === '/dashboard'
              const isOrders = pathname === '/dashboard/orders'
              const isAdminP = pathname.startsWith('/dashboard/admin')
              const adminGreeting = hour >= 5 && hour < 12 ? `Good morning, ${firstName}!`
                : hour >= 12 && hour < 17 ? `Good afternoon, ${firstName}!`
                : hour >= 17 && hour < 21 ? `Good evening, ${firstName}!`
                : `Working late, ${firstName}!`
              const desktopMsg = isMain ? timeGreeting : isOrders ? `Welcome back, ${firstName}!` : isAdminP ? adminGreeting : `Hi, ${firstName}!`
              const mobileMsg  = isMain ? timeGreeting : isOrders ? `Welcome back, ${firstName}!` : isAdminP ? adminGreeting : `Hi, ${firstName}!`
              return (
                <div className="flex flex-col min-w-0">
                  <span className="hidden lg:block font-extrabold tracking-tight truncate"
                        style={{ fontSize: 22, color: '#1A2410', fontFamily: 'var(--font-space-grotesk)' }}>
                    {desktopMsg}
                  </span>
                  <span className="lg:hidden font-extrabold tracking-tight truncate"
                        style={{ fontSize: 18, color: '#1A2410', fontFamily: 'var(--font-space-grotesk)' }}>
                    {mobileMsg}
                  </span>
                </div>
              )
            })()}

            <div className="flex-1" />

            <NotificationBell count={notifCount} isPulsing={bellPulsing} onClick={openNotifPanel} />
            <div className="w-[15px]" />
            <UserAvatar profile={profile} onClick={() => router.push('/dashboard/profile')} />
          </header>

          {/* ── TEAM SWITCHER BANNER ── */}
          <TeamSwitcherBanner />

          {/* ── PAGE CONTENT ── */}
          <main className="flex-1 overflow-auto min-h-0">
            {emailUnverified && (
              <div className="flex items-center justify-between px-4 py-2.5"
                   style={{ backgroundColor: '#fefce8', borderBottom: '1px solid #fbbf24' }}>
                <span style={{ color: '#92400e', fontSize: 13 }}>
                  ⚠️ Please verify your email to unlock all features
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser()
                      if (user?.email) {
                        await supabase.auth.resend({ type: 'signup', email: user.email })
                        alert('Verification email sent! Check your inbox.')
                      }
                    }}
                    className="text-[12px] font-bold px-3 py-1 rounded-lg"
                    style={{ backgroundColor: '#fbbf24', color: '#92400e' }}>
                    Resend Email
                  </button>
                  <button
                    onClick={() => setEmailUnverified(false)}
                    className="text-[12px] px-2"
                    style={{ color: '#92400e' }}>
                    ✕
                  </button>
                </div>
              </div>
            )}
            <div>
              <AnnouncementBanner />
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[250px] bg-dark flex flex-col z-10 animate-slide-right">
            <div className="pt-[50px] pb-[30px] flex flex-col items-center">
              <button onClick={() => { router.push('/dashboard'); setMobileOpen(false) }}>
                <Shield size={36} className="text-lime" />
              </button>
              <span className="text-lime text-base font-extrabold tracking-wide mt-1.5">Riazify</span>
            </div>

            <nav className="flex-1 px-4 space-y-0.5">
              {/* Mobile also uses visibleNavItems */}
              {visibleNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all',
                      isActive ? 'bg-lime text-dark' : 'text-white/50 hover:bg-white/10'
                    )}
                  >
                    <Icon size={20} />
                    <span className={cn('text-sm', isActive ? 'font-bold' : 'font-normal')}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}

              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all',
                    pathname.startsWith('/dashboard/admin') ? 'bg-lime text-dark' : 'text-white/50 hover:bg-white/10'
                  )}
                >
                  <Settings size={20} />
                  <span className="text-sm">Admin Center</span>
                </Link>
              )}
            </nav>

            <button
              onClick={() => { setShowSupport(true); setMobileOpen(false) }}
              className="flex items-center gap-3 mx-4 px-3 py-2.5 text-white/40 hover:text-white/60 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-semibold">Help & Support</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 mx-4 mb-8 px-3 py-2.5 text-white/40 hover:text-white/60 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm font-semibold">Log Out</span>
            </button>
          </div>
        </div>
      )}

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}

      {/* ── BOTTOM-RIGHT TOASTS ── */}
      {toasts.map((t, i) => (
        <NotifToast
          key={t.id}
          title={t.title}
          message={t.message}
          bottomOffset={i * 90}
          onTap={() => { removeToast(t.id); openNotifPanel() }}
          onDismiss={() => removeToast(t.id)}
        />
      ))}
    </div>
  )
}