'use client'
// app/admin/page.tsx
// Converted 1:1 from lib/pages/admin_management_page.dart

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Shield, BarChart2, Settings, ArrowLeft, Search,
  EyeOff, Users, DollarSign, TrendingUp, TrendingDown,
  Wrench, Trophy, Zap, UserPlus, Key, FileText,
  Power, MoreVertical, Menu, X, ChevronDown,
} from 'lucide-react'
import PersistentSidebar from '@/components/admin/PersistentSidebar'
import AnalyticsHub      from '@/components/admin/AnalyticsHub'
import UserCrmTab          from '@/components/admin/settings-tabs/UserCrmTab'
import RoleBuilderTab      from '@/components/admin/settings-tabs/RoleBuilderTab'
import SecurityLogsTab     from '@/components/admin/settings-tabs/SecurityLogsTab'
import PromoManagerTab     from '@/components/admin/settings-tabs/PromoManagerTab'
import KillSwitchesTab     from '@/components/admin/settings-tabs/KillSwitchesTab'
import PlanLimitsTab       from '@/components/admin/settings-tabs/PlanLimitsTab'
import EmailAutomationsTab from '@/components/admin/settings-tabs/EmailAutomationsTab'
import WebhooksTab         from '@/components/admin/settings-tabs/WebhooksTab'
import GamificationTab     from '@/components/admin/settings-tabs/GamificationTab'
import ApiVaultPage        from '@/components/admin/settings-tabs/ApiVaultPage'
import AffiliateVaultTab   from '@/components/admin/settings-tabs/AffiliateVaultTab'
import FounderOpsTab       from '@/components/admin/settings-tabs/FounderOpsTab'

// ── Design tokens ──────────────────────────────────────────────
const C = {
  dark:   '#0F172A',
  lime:   '#8FFF00',
  border: '#E2E8F0',
  bg:     '#F8FAFC',
  text:   '#0F172A',
  muted:  '#64748B',
  hint:   '#94A3B8',
}

// ── Settings menu items ────────────────────────────────────────
const SETTINGS_MENU = [
  { title: 'User CRM',        icon: Users        },
  { title: 'Role Builder',    icon: Shield       },
  { title: 'Security Logs',   icon: Key          },
  { title: 'Promos & Codes',  icon: DollarSign   },
  { title: 'Kill Switches',   icon: Power        },
  { title: 'Plan Limits',     icon: Settings     },
  { title: 'Emails',          icon: FileText     },
  { title: 'Webhooks',        icon: Zap          },
  { title: 'Gamification',    icon: Trophy       },
  { title: 'API Vault',       icon: Key          },
  { title: 'Affiliate Vault', icon: DollarSign   },
  { title: 'Founder Ops',     icon: BarChart2    },
]

// ── Stat card data ─────────────────────────────────────────────
const STAT_CARDS = [
  { title: 'Monthly Recurring Revenue', titleMobile: 'MRR',        value: '$12,450', sub: '+14% this month',      icon: DollarSign,  isHighlight: true,  isGood: false, isToolCard: false, isTopTool: false },
  { title: 'Active Subscribers',        titleMobile: 'Users',       value: '842',     sub: '+12 new today',        icon: Users,       isHighlight: false, isGood: false, isToolCard: false, isTopTool: false },
  { title: 'Trial Conversion Rate',     titleMobile: 'Conversion',  value: '24.5%',   sub: 'Industry avg: 15%',    icon: TrendingUp,  isHighlight: false, isGood: false, isToolCard: false, isTopTool: false },
  { title: 'Churn Rate',                titleMobile: 'Churn',       value: '2.1%',    sub: 'Healthy ↓',            icon: TrendingDown,isHighlight: false, isGood: true,  isToolCard: false, isTopTool: false },
  { title: 'Total Tool Usage',          titleMobile: 'Tool Uses',   value: '1,284',   sub: 'Across all tools today',icon: Wrench,     isHighlight: false, isGood: false, isToolCard: true,  isTopTool: false },
  { title: 'Most Used Tool',            titleMobile: 'Top Tool',    value: 'Orders',  sub: '642 sessions today',   icon: Trophy,      isHighlight: false, isGood: false, isToolCard: true,  isTopTool: true  },
]

// ── Tool cards data ────────────────────────────────────────────
const TOOLS = [
  { name: 'Orders',              desc: 'Protect orders from risky buyers & disputes',  icon: Shield,   isLive: true,  accent: '#8FFF00', sessions: 642, users: 198, eta: '' },
  { name: 'Profit Calculator',   desc: 'Calculate real eBay profit after all fees',    icon: BarChart2,isLive: true,  accent: '#FBBF24', sessions: 381, users: 134, eta: '' },
  { name: 'Title Builder',       desc: 'AI-powered eBay listing title optimizer',      icon: FileText, isLive: true,  accent: '#60A5FA', sessions: 261, users: 97,  eta: '' },
  { name: 'Product Research',    desc: 'Find winning products with demand data',       icon: Search,   isLive: false, accent: '#A78BFA', sessions: 0,   users: 0,   eta: 'Q3 2025' },
  { name: 'Competitor Research', desc: 'Spy on top sellers in any niche',             icon: EyeOff,   isLive: false, accent: '#FB923C', sessions: 0,   users: 0,   eta: 'Q3 2025' },
  { name: 'Dropship Analyzer',   desc: 'Analyze dropship margins & supplier risk',    icon: Wrench,   isLive: false, accent: '#2DD4BF', sessions: 0,   users: 0,   eta: 'Q4 2025' },
]

// ── Analytics Hub button (matches Dart AnalyticsHubButton) ────
function AnalyticsHubButton({ isActive, onTap }: { isActive: boolean; onTap: () => void }) {
  return (
    <button onClick={onTap}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[13px] font-bold transition-all"
      style={{
        backgroundColor: isActive ? C.dark  : C.bg,
        borderColor:     isActive ? C.dark  : C.border,
        color:           isActive ? C.lime  : C.text,
      }}>
      <BarChart2 size={15} />
      Analytics Hub
    </button>
  )
}

// ── Stat Card (matches Dart _buildStatCard2) ───────────────────
function StatCard({ d, isMobile }: { d: typeof STAT_CARDS[0]; isMobile: boolean }) {
  const Icon = d.icon
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border transition-all"
         style={{
           backgroundColor: d.isHighlight ? C.dark : d.isToolCard ? '#0A0D08' : '#fff',
           borderColor: d.isHighlight ? 'transparent' : d.isToolCard ? 'rgba(143,255,0,0.4)' : C.border,
           borderWidth: d.isToolCard ? 1.5 : 1,
           boxShadow: d.isHighlight
             ? '0 5px 14px rgba(15,23,42,0.25)'
             : d.isToolCard ? '0 4px 12px rgba(143,255,0,0.12)' : '0 3px 8px rgba(0,0,0,0.03)',
         }}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold truncate"
              style={{ color: d.isHighlight || d.isToolCard ? 'rgba(143,255,0,0.7)' : C.muted }}>
          {isMobile ? d.titleMobile : d.title}
        </span>
        <div className="p-1.5 rounded-lg shrink-0"
             style={{ backgroundColor: d.isHighlight || d.isToolCard ? 'rgba(143,255,0,0.15)' : '#F1F5F9' }}>
          <Icon size={14} style={{ color: d.isHighlight || d.isToolCard ? C.lime : C.hint }} />
        </div>
      </div>
      <span className="text-[24px] font-extrabold tracking-tight"
            style={{ color: d.isHighlight || d.isToolCard ? '#fff' : C.text }}>
        {d.value}
      </span>
      <div className="flex items-center gap-1.5">
        {d.isTopTool && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.lime }} />}
        <span className="text-[11px] font-bold truncate"
              style={{ color: d.isHighlight ? C.lime : d.isToolCard ? 'rgba(143,255,0,0.8)' : d.isGood ? '#16A34A' : C.muted }}>
          {d.sub}
        </span>
      </div>
    </div>
  )
}

// ── Tool Card (matches Dart _buildToolCard) ────────────────────
function ToolCard({ tool, index }: { tool: typeof TOOLS[0]; index: number }) {
  const Icon    = tool.icon
  const isLime  = tool.accent === '#8FFF00'
  return (
    <div className="flex flex-col p-3.5 rounded-2xl border"
         style={{
           backgroundColor: tool.isLive ? '#fff' : '#F8FAFC',
           borderColor:     tool.isLive ? tool.accent + '59' : C.border,
           borderWidth:     tool.isLive ? 1.5 : 1,
           boxShadow:       tool.isLive ? `0 4px 12px ${tool.accent}1A` : 'none',
           opacity:         tool.isLive ? 1 : 0.62,
         }}>
      {/* Top row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="relative w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ backgroundColor: tool.accent + (tool.isLive ? '1F' : '14') }}>
          <Icon size={18} style={{ color: tool.accent }} />
          {!tool.isLive && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center">
              <span style={{ fontSize: 7, color: C.hint }}>🔒</span>
            </div>
          )}
        </div>
        {/* Status badge */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border"
             style={{
               backgroundColor: tool.isLive ? tool.accent + '1F' : '#F1F5F9',
               borderColor:     tool.isLive ? tool.accent + '66' : C.border,
             }}>
          <div className="w-1.5 h-1.5 rounded-full"
               style={{ backgroundColor: tool.isLive ? tool.accent : C.hint }} />
          <span className="text-[9px] font-extrabold tracking-[0.4px]"
                style={{ color: tool.isLive ? (isLime ? '#4A8F00' : tool.accent) : C.hint }}>
            {tool.isLive ? 'LIVE' : 'SOON'}
          </span>
        </div>
      </div>
      {/* Name + description */}
      <p className="text-[13px] font-extrabold tracking-tight mb-0.5" style={{ color: C.text }}>{tool.name}</p>
      <p className="text-[10px] leading-snug mb-3" style={{ color: C.muted }}>{tool.desc}</p>
      {/* Divider */}
      <div className="h-px mb-2.5" style={{ backgroundColor: C.border }} />
      {/* Stats or ETA */}
      {tool.isLive ? (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[15px] font-extrabold" style={{ color: isLime ? '#4A8F00' : tool.accent }}>{tool.sessions}</p>
            <p className="text-[9px] font-semibold" style={{ color: C.hint }}>sessions</p>
          </div>
          <div className="w-px h-7" style={{ backgroundColor: C.border }} />
          <div className="flex-1">
            <p className="text-[15px] font-extrabold" style={{ color: C.text }}>{tool.users}</p>
            <p className="text-[9px] font-semibold" style={{ color: C.hint }}>users</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold" style={{ color: C.hint }}>Est. {tool.eta}</span>
          <div className="ml-auto px-1.5 py-0.5 rounded-md text-[9px] font-bold"
               style={{ backgroundColor: '#F1F5F9', color: tool.accent + 'CC' }}>
            Coming Soon
          </div>
        </div>
      )}
    </div>
  )
}

// ── CMD+K Command Palette ──────────────────────────────────────
function CommandPalette({ onClose, onNavigate }: { onClose: () => void; onNavigate: (mode: string) => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[650px] rounded-2xl border overflow-hidden"
           style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: C.border }}>
          <Search size={22} style={{ color: C.muted }} />
          <input autoFocus placeholder="Search users, settings, or execute commands..."
            className="flex-1 text-[18px] outline-none" style={{ color: C.text }}
            onKeyDown={e => e.key === 'Escape' && onClose()} />
        </div>
        {/* Quick actions */}
        <div className="p-2" style={{ backgroundColor: C.bg }}>
          <p className="px-4 py-2 text-[11px] font-bold tracking-wide" style={{ color: C.hint }}>QUICK ACTIONS</p>
          {[
            { icon: UserPlus,  label: 'Search User: Mike Ross',         tag: 'CRM',        danger: false },
            { icon: Power,     label: 'Trigger Emergency Kill Switch',   tag: 'System',     danger: true  },
            { icon: EyeOff,    label: 'Toggle Investor Mode',            tag: 'Settings',   danger: false },
            { icon: BarChart2, label: 'Jump to Revenue Analytics',       tag: 'Navigation', danger: false },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <button key={i} onClick={onClose}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white transition-colors text-left">
                <div className="p-2 rounded-lg"
                     style={{ backgroundColor: item.danger ? 'rgba(239,68,68,0.08)' : C.border }}>
                  <Icon size={15} style={{ color: item.danger ? '#F87171' : C.text }} />
                </div>
                <span className="flex-1 text-[14px] font-bold"
                      style={{ color: item.danger ? '#F87171' : C.text }}>{item.label}</span>
                <div className="px-2 py-1 rounded border text-[10px] font-bold"
                     style={{ borderColor: C.border, color: C.muted, backgroundColor: '#fff' }}>
                  {item.tag}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Quick Action Dialogs ───────────────────────────────────────
function AddUserDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl border p-6 w-full max-w-sm" style={{ borderColor: C.border }}>
        <div className="flex items-center gap-2.5 mb-5">
          <UserPlus size={20} style={{ color: C.lime }} />
          <p className="text-[16px] font-bold" style={{ color: C.text }}>Add New User</p>
        </div>
        <div className="flex flex-col gap-3">
          <input placeholder="Email address" className="w-full h-10 px-3 rounded-lg border text-[13px] outline-none"
                 style={{ borderColor: C.border, color: C.text }} />
          <select className="w-full h-10 px-3 rounded-lg border text-[13px] outline-none"
                  style={{ borderColor: C.border, color: C.text }}>
            {['Free Trial', 'Pro Plan', 'Elite Plan'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-[13px] font-semibold"
                  style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-[13px] font-bold"
                  style={{ backgroundColor: C.lime, color: C.dark }}>Add User</button>
        </div>
      </div>
    </div>
  )
}

function ResetApiDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl border p-6 w-full max-w-sm" style={{ borderColor: C.border }}>
        <div className="flex items-center gap-2.5 mb-3">
          <Key size={20} style={{ color: C.lime }} />
          <p className="text-[16px] font-bold" style={{ color: C.text }}>Reset API Keys</p>
        </div>
        <p className="text-[13px] mb-5" style={{ color: C.muted }}>
          This will invalidate all current API keys and generate new ones. All connected apps will need to be updated.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-[13px] font-semibold"
                  style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-[13px] font-bold"
                  style={{ backgroundColor: C.lime, color: C.dark }}>Reset Now</button>
        </div>
      </div>
    </div>
  )
}

function KillSwitchDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl border p-6 w-full max-w-sm" style={{ backgroundColor: '#FEF2F2', borderColor: '#FFCDD2' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <Power size={20} style={{ color: '#F87171' }} />
          <p className="text-[16px] font-bold" style={{ color: '#F87171' }}>Emergency Kill Switch</p>
        </div>
        <p className="text-[13px] mb-5" style={{ color: C.muted }}>
          ⚠️ This will immediately disable ALL user access to the platform. This action is logged and cannot be undone without manual restore.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-[13px] font-semibold"
                  style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-[13px] font-bold"
                  style={{ backgroundColor: '#F87171', color: '#fff' }}>CONFIRM KILL SWITCH</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function AdminPage() {
  const supabase = createClient()
  const [authorized,       setAuthorized]       = useState(false)
  const [checking,         setChecking]         = useState(true)
  const [isSettingsMode,   setIsSettingsMode]   = useState(false)
  const [isAnalyticsMode,  setIsAnalyticsMode]  = useState(false)
  const [activeSettingsTab,setActiveSettingsTab]= useState(0)
  const [investorMode,     setInvestorMode]     = useState(false)
  const [showCmdPalette,   setShowCmdPalette]   = useState(false)
  const [showAddUser,      setShowAddUser]       = useState(false)
  const [showResetApi,     setShowResetApi]      = useState(false)
  const [showKillSwitch,   setShowKillSwitch]    = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [isMobile,         setIsMobile]         = useState(() => typeof window !== 'undefined' ? window.innerWidth < 950 : false)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Role check ──────────────────────────────────────────────
  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setChecking(false); return }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setAuthorized((data as any)?.role === 'admin')
      setChecking(false)
    }
    check()
  }, [])

  // ── Responsive ─────────────────────────────────────────────
  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setIsMobile(e.contentRect.width < 950)
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // ── CMD+K keyboard shortcut ─────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setShowCmdPalette(s => !s)
      }
      if (e.key === 'Escape') setShowCmdPalette(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (checking) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
           style={{ borderTopColor: C.lime }} />
    </div>
  )

  if (!authorized) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
           style={{ backgroundColor: C.dark }}>
        <Shield size={28} style={{ color: C.lime }} />
      </div>
      <p className="text-[18px] font-bold" style={{ color: C.text }}>Access Denied</p>
      <p className="text-[13px]" style={{ color: C.muted }}>Admin access only.</p>
    </div>
  )

  // ── Settings content router ─────────────────────────────────
  function getSettingsContent() {
    switch (activeSettingsTab) {
      case 0:  return <UserCrmTab          isInvestorMode={investorMode} isMobile={isMobile} />
      case 1:  return <RoleBuilderTab />
      case 2:  return <SecurityLogsTab     isInvestorMode={investorMode} />
      case 3:  return <PromoManagerTab     isMobile={isMobile} />
      case 4:  return <KillSwitchesTab />
      case 5:  return <PlanLimitsTab />
      case 6:  return <EmailAutomationsTab />
      case 7:  return <WebhooksTab />
      case 8:  return <GamificationTab />
      case 9:  return <ApiVaultPage />
      case 10: return <AffiliateVaultTab />
      case 11: return <FounderOpsTab />
      default: return null
    }
  }

  // ── Header ──────────────────────────────────────────────────
  function Header() {
    const subtitle = isSettingsMode
      ? 'Manage users, team access & platform security'
      : isAnalyticsMode
      ? 'Revenue, API fleet, VeRO & infrastructure'
      : 'Monitor MRR, tool analytics & platform health'

    if (isMobile) return (
      <div className="flex items-start gap-3">
        {isSettingsMode ? (
          <button onClick={() => setMobileDrawerOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border"
            style={{ borderColor: C.border }}>
            <Menu size={22} style={{ color: C.text }} />
          </button>
        ) : <div className="w-10" />}

        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
               style={{ backgroundColor: 'rgba(143,255,0,0.10)', borderColor: 'rgba(143,255,0,0.35)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.lime }} />
            <span className="text-[10px] font-bold" style={{ color: '#4A8F00' }}>All systems operational</span>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="relative">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border"
                  style={{ borderColor: C.border }}>
            <MoreVertical size={18} style={{ color: C.text }} />
          </button>
        </div>
      </div>
    )

    // Desktop header
    return (
      <div className="flex items-center gap-3 flex-wrap">
        {/* Subtitle only */}
        <div className="flex items-center gap-1.5 mr-2">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: C.lime }} />
          <p className="text-[13px] truncate" style={{ color: C.muted }}>{subtitle}</p>
        </div>

        {/* Quick stats bar */}
        <div className="flex items-center gap-0 px-3 py-1.5 rounded-full border ml-auto"
             style={{ backgroundColor: C.dark, borderColor: 'rgba(143,255,0,0.2)' }}>
          {[
            { val: '24',   label: 'online',    color: C.lime    },
            { val: '8',    label: 'signups',   color: '#60A5FA' },
            { val: '$420', label: 'rev today', color: '#FBBF24' },
          ].map((s, i) => (
            <div key={i} className="flex items-center">
              {i > 0 && <div className="w-px h-3.5 mx-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />}
              <div className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: s.color }} />
              <span className="text-[12px] font-extrabold mr-1" style={{ color: s.color }}>{s.val}</span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* CMD+K */}
        <button onClick={() => setShowCmdPalette(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
          style={{ backgroundColor: C.bg, borderColor: C.border }}>
          <Search size={12} style={{ color: C.hint }} />
          <span className="text-[11px] font-bold tracking-[0.3px]" style={{ color: C.hint }}>CMD+K</span>
        </button>

        {/* Investor mode */}
        <button onClick={() => setInvestorMode(m => !m)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all"
          style={{
            backgroundColor: investorMode ? 'rgba(168,85,247,0.08)' : 'transparent',
            borderColor:     investorMode ? 'rgba(192,132,252,0.4)' : C.border,
          }}>
          <EyeOff size={14} style={{ color: investorMode ? '#C084FC' : C.hint }} />
          <span className="text-[12px] font-bold" style={{ color: investorMode ? '#C084FC' : C.muted }}>
            Investor Mode
          </span>
          <div className="relative w-8 h-4 rounded-full transition-colors"
               style={{ backgroundColor: investorMode ? 'rgba(168,85,247,0.3)' : '#CBD5E1' }}>
            <span className="absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all"
                  style={{ left: investorMode ? '18px' : '2px' }} />
          </div>
        </button>

        {/* Analytics Hub button */}
        <AnalyticsHubButton
          isActive={isAnalyticsMode}
          onTap={() => { setIsAnalyticsMode(m => !m); setIsSettingsMode(false) }}
        />

        {/* Settings / Back button */}
        {(isSettingsMode || isAnalyticsMode) ? (
          <button onClick={() => { setIsSettingsMode(false); setIsAnalyticsMode(false) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[13px] font-bold"
            style={{ backgroundColor: '#fff', borderColor: C.border, color: C.text }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        ) : (
          <button onClick={() => { setIsSettingsMode(true); setIsAnalyticsMode(false) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold"
            style={{ backgroundColor: C.lime, color: C.dark }}>
            <Settings size={14} /> Admin Settings
          </button>
        )}
      </div>
    )
  }

  // ── Settings sidebar item ───────────────────────────────────
  function SidebarItem({ index }: { index: number }) {
    const item     = SETTINGS_MENU[index]
    const Icon     = item.icon
    const isActive = activeSettingsTab === index
    return (
      <button onClick={() => setActiveSettingsTab(index)}
        className="w-full flex items-center gap-3 mx-3 px-4 py-3 rounded-xl border transition-all text-left"
        style={{
          backgroundColor: isActive ? 'rgba(143,255,0,0.10)' : 'transparent',
          borderColor:     isActive ? 'rgba(143,255,0,0.3)' : 'transparent',
          width: 'calc(100% - 24px)',
        }}>
        <Icon size={17} style={{ color: isActive ? '#4A8F00' : C.muted }} />
        <span className="text-[13px]"
              style={{ color: isActive ? C.text : C.muted, fontWeight: isActive ? 700 : 600 }}>
          {item.title}
        </span>
      </button>
    )
  }

  // ── Quick action bar ────────────────────────────────────────
  function QuickActionBar() {
    return (
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border"
           style={{ backgroundColor: '#fff', borderColor: C.border }}>
        {!isMobile && (
          <>
            <Zap size={13} style={{ color: C.lime }} />
            <span className="text-[11px] font-bold tracking-[0.3px]" style={{ color: C.hint }}>Quick Actions</span>
            <div className="w-px h-5" style={{ backgroundColor: C.border }} />
          </>
        )}
        <div className="flex gap-2 overflow-x-auto">
          {[
            { icon: UserPlus,  label: 'Add User',      bg: C.lime,         color: C.dark,     border: null,       action: () => setShowAddUser(true)    },
            { icon: Key,       label: 'Reset API',     bg: '#F1F5F9',      color: C.text,     border: null,       action: () => setShowResetApi(true)   },
            { icon: FileText,  label: 'Export Report', bg: '#F1F5F9',      color: C.text,     border: null,       action: () => {}                      },
            { icon: Power,     label: 'Kill Switch',   bg: '#FEF2F2',      color: '#F87171',  border: '#FFCDD2',  action: () => setShowKillSwitch(true)  },
          ].map((a, i) => {
            const Icon = a.icon
            return (
              <button key={i} onClick={a.action}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-bold shrink-0 transition-all hover:opacity-80"
                style={{ backgroundColor: a.bg, color: a.color, borderColor: a.border ?? a.bg }}>
                <Icon size={12} />
                {a.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Dashboard layout ────────────────────────────────────────
  function DashboardLayout() {
    const liveCount     = TOOLS.filter(t => t.isLive).length
    const totalSessions = TOOLS.filter(t => t.isLive).reduce((s, t) => s + t.sessions, 0)
    const totalUsers    = TOOLS.filter(t => t.isLive).reduce((s, t) => s + t.users, 0)

    return (
      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-6'}`}>
          {STAT_CARDS.map((d, i) => <StatCard key={i} d={d} isMobile={isMobile} />)}
        </div>

        {/* Tools Overview */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: C.lime }} />
                <p className="text-[16px] font-extrabold tracking-tight" style={{ color: C.text }}>Tools Overview</p>
              </div>
              <p className="text-[12px] font-medium ml-3.5 mt-1" style={{ color: C.muted }}>
                {liveCount} active tools  •  {totalSessions} sessions today  •  {totalUsers} users
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                 style={{ backgroundColor: C.dark }}>
              <Wrench size={12} style={{ color: C.lime }} />
              <span className="text-[11px] font-bold text-white">Manage Tools</span>
            </div>
          </div>
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-6'}`}>
            {TOOLS.map((t, i) => <ToolCard key={i} tool={t} index={i} />)}
          </div>
        </div>

        {/* Quick actions */}
        <QuickActionBar />
      </div>
    )
  }

  // ── Settings layout ─────────────────────────────────────────
  function SettingsLayout() {
    if (isMobile) return (
      <div>{getSettingsContent()}</div>
    )
    return (
      <div className="flex gap-6 items-start">
        {/* Sidebar */}
        <div className="w-[250px] shrink-0 py-4 rounded-2xl border"
             style={{ backgroundColor: '#fff', borderColor: C.border }}>
          {SETTINGS_MENU.map((_, i) => <SidebarItem key={i} index={i} />)}
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0 p-6 rounded-2xl border"
             style={{ backgroundColor: '#fff', borderColor: C.border }}>
          {getSettingsContent()}
        </div>
      </div>
    )
  }

  // ── Mobile settings drawer ──────────────────────────────────
  function MobileDrawer() {
    if (!mobileDrawerOpen) return null
    return (
      <div className="fixed inset-0 z-[9999] flex"
           onClick={() => setMobileDrawerOpen(false)}>
        <div className="w-64 h-full bg-white flex flex-col pt-5"
             onClick={e => e.stopPropagation()}>
          <p className="px-5 pb-3 text-[14px] font-bold tracking-[1.2px]" style={{ color: C.hint }}>
            ADMIN SETTINGS
          </p>
          <div className="flex-1 overflow-y-auto">
            {SETTINGS_MENU.map((item, i) => {
              const Icon = item.icon
              const isActive = activeSettingsTab === i
              return (
                <button key={i} onClick={() => { setActiveSettingsTab(i); setMobileDrawerOpen(false) }}
                  className="w-full flex items-center gap-3 px-5 py-3 transition-colors"
                  style={{ backgroundColor: isActive ? '#F1F5F9' : 'transparent' }}>
                  <Icon size={18} style={{ color: isActive ? C.text : C.muted }} />
                  <span className="text-[14px]"
                        style={{ color: isActive ? C.text : C.muted, fontWeight: isActive ? 700 : 600 }}>
                    {item.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-full" style={{ backgroundColor: '#F7F9F5' }}>
      {/* Lime scrollbar only in dashboard mode (matches Dart RawScrollbar) */}
      <style>{`
        ${!isSettingsMode && !isAnalyticsMode ? `
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: #8FFF00; border-radius: 10px; }
        ` : `
          ::-webkit-scrollbar-thumb { background: transparent; }
        `}
      `}</style>

      <div className="w-full px-4 md:px-6 lg:px-8 pt-4 pb-20 flex flex-col gap-6">

        {/* Header */}
        <Header />

        {/* Settings mode */}
        {isSettingsMode && <SettingsLayout />}

        {/* Analytics mode */}
        {isAnalyticsMode && !isSettingsMode && (
          <AnalyticsHub
            isInvestorMode={investorMode}
            isMobile={isMobile}
            onBack={() => setIsAnalyticsMode(false)}
          />
        )}

        {/* Dashboard mode */}
        {!isSettingsMode && !isAnalyticsMode && (
          isMobile ? (
            <DashboardLayout />
          ) : (
            <div className="flex items-start gap-5">
              <div className="flex-1 min-w-0"><DashboardLayout /></div>
              <div className="w-[260px] shrink-0">
                <PersistentSidebar investorMode={investorMode} />
              </div>
            </div>
          )
        )}
      </div>

      {/* Overlays */}
      {showCmdPalette  && <CommandPalette  onClose={() => setShowCmdPalette(false)}  onNavigate={() => {}} />}
      {showAddUser     && <AddUserDialog   onClose={() => setShowAddUser(false)}     />}
      {showResetApi    && <ResetApiDialog  onClose={() => setShowResetApi(false)}    />}
      {showKillSwitch  && <KillSwitchDialog onClose={() => setShowKillSwitch(false)} />}
      <MobileDrawer />
    </div>
  )
}