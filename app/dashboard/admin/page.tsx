'use client'
// app/dashboard/admin/page.tsx
// Updated: stat cards, tool stats, quick stats bar — all real Supabase data

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Shield, BarChart2, Settings, ArrowLeft, Search,
  EyeOff, Users, DollarSign, TrendingUp, TrendingDown,
  Wrench, Trophy, Zap, UserPlus, Key, FileText, Image, Briefcase,
  Power, MoreVertical, Menu, X, ChevronDown, Globe, Mail, CreditCard,
  MessageCircle,
} from 'lucide-react'
import PersistentSidebar   from '@/components/admin/PersistentSidebar'
import AnalyticsHub        from '@/components/admin/AnalyticsHub'
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
import MarketingTab        from '@/components/admin/settings-tabs/MarketingTab'
import BlogTab             from '@/components/admin/settings-tabs/BlogTab'
import ChangelogTab        from '@/components/admin/settings-tabs/ChangelogTab'
import PageEditorTab from '@/components/admin/settings-tabs/PageEditorTab'
import CareersTab    from '@/components/admin/settings-tabs/CareersTab'
import PermissionWrapper from '@/components/admin/PermissionWrapper'
import PaymentsTab        from '@/components/admin/settings-tabs/PaymentsTab'
import TicketManagerTab   from '@/components/admin/settings-tabs/TicketManagerTab'
import GlobalApiFleetTab        from '@/components/admin/tabs/GlobalApiFleetTab'
import VeroCommandCenterTab     from '@/components/admin/tabs/VeroCommandCenterTab'
import FeatureRoadmapTab        from '@/components/admin/tabs/FeatureRoadmapTab'
import InfrastructureMonitorTab from '@/components/admin/tabs/InfrastructureMonitorTab'
import CompetitorXRayTab        from '@/components/admin/tabs/CompetitorXRayTab'
import ChromeExtensionTab       from '@/components/admin/tabs/ChromeExtensionTab'

// -- Design tokens ----------------------------------------------
const C = {
  dark:   '#1a2410',
  lime:   '#8FFF00',
  border: '#E2E8F0',
  bg:     '#F8FAFC',
  text:   '#0F172A',
  muted:  '#64748B',
  hint:   '#94A3B8',
}

// -- Settings menu ----------------------------------------------
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
  { title: 'Marketing',       icon: Mail         },
  { title: 'Payments',        icon: CreditCard   },
  { title: 'Tickets',         icon: MessageCircle, badge: 0 },
  { title: 'Blog',            icon: FileText     },
  { title: 'Changelog',       icon: Wrench       },
  { title: 'Careers',         icon: Briefcase    },
  { title: 'Page Editor', icon: FileText         },
]

// -- Tool definitions (static metadata only — no dummy stats) --
const TOOL_DEFS = [
  { name: 'Orders',              dbKey: 'ebay_orders',         desc: 'Protect orders from risky buyers & disputes',  icon: Shield,   isLive: true,  accent: '#8FFF00', eta: '' },
  { name: 'Profit Calculator',   dbKey: 'profit_calculator',   desc: 'Calculate real eBay profit after all fees',    icon: BarChart2,isLive: true,  accent: '#FBBF24', eta: '' },
  { name: 'Title Builder',       dbKey: 'title_builder',       desc: 'AI-powered eBay listing title optimizer',      icon: FileText, isLive: true,  accent: '#60A5FA', eta: '' },
  { name: 'Product Research',    dbKey: 'product_research',    desc: 'Find winning products with demand data',       icon: Search,   isLive: false, accent: '#A78BFA', eta: 'Q3 2025' },
  { name: 'Competitor Research', dbKey: 'competitor_research', desc: 'Spy on top sellers in any niche',             icon: EyeOff,   isLive: false, accent: '#FB923C', eta: 'Q3 2025' },
  { name: 'Dropship Analyzer',   dbKey: 'dropship_analyzer',   desc: 'Analyze dropship margins & supplier risk',    icon: Wrench,   isLive: false, accent: '#2DD4BF', eta: 'Q4 2025' },
]

// -- Admin stats shape ------------------------------------------
interface AdminStats {
  mrr:           number
  activeSubs:    number
  totalUsers:    number
  convRate:      number
  churnRate:     number
  totalUsage:    number
  mostUsedTool:  string
  mostUsedCount: number
  onlineNow:     number
  signupsToday:  number
  revToday:      number
  toolStats:     Record<string, { sessions: number; users: number }>
  countryStats:  { country: string; count: number }[]
  recentTx:      any[]
  loading:       boolean
}

const DEFAULT_STATS: AdminStats = {
  mrr: 0, activeSubs: 0, totalUsers: 0,
  convRate: 0, churnRate: 0,
  totalUsage: 0, mostUsedTool: '—', mostUsedCount: 0,
  onlineNow: 0, signupsToday: 0, revToday: 0,
  toolStats: {}, countryStats: [], recentTx: [],
  loading: true,
}

// -- Analytics Hub button ---------------------------------------
function AnalyticsHubButton({ isActive, onTap }: { isActive: boolean; onTap: () => void }) {
  return (
    <button onClick={onTap}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[13px] font-bold transition-all"
      style={{
        backgroundColor: isActive ? '#8fff00' : C.bg,
        borderColor: isActive ? '#8fff00' : C.border,
        color:           isActive ? C.lime  : C.text,
      }}>
      <BarChart2 size={15} />
      Analytics Hub
    </button>
  )
}

// -- Stat Card --------------------------------------------------
interface StatCardData {
  title: string; titleMobile: string; value: string; sub: string
  icon: React.ElementType
  isHighlight: boolean; isGood: boolean; isToolCard: boolean; isTopTool: boolean
}

function StatCard({ d, isMobile }: { d: StatCardData; isMobile: boolean }) {
  const Icon = d.icon
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border transition-all"
         style={{
           backgroundColor: d.isHighlight ? '#1a2410' : d.isToolCard ? '#1a2410' : '#fff',
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

// -- Tool Card --------------------------------------------------
function ToolCard({ tool }: { tool: typeof TOOL_DEFS[0] & { sessions: number; users: number } }) {
  const Icon   = tool.icon
  const isLime = tool.accent === '#8FFF00'
  return (
    <div className="flex flex-col p-3.5 rounded-2xl border"
         style={{
           backgroundColor: tool.isLive ? '#fff' : '#F8FAFC',
           borderColor:     tool.isLive ? tool.accent + '59' : C.border,
           borderWidth:     tool.isLive ? 1.5 : 1,
           boxShadow:       tool.isLive ? `0 4px 12px ${tool.accent}1A` : 'none',
           opacity:         tool.isLive ? 1 : 0.62,
         }}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="relative w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ backgroundColor: tool.accent + (tool.isLive ? '1F' : '14') }}>
          <Icon size={18} style={{ color: tool.accent }} />
          {!tool.isLive && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center">
              <span style={{ fontSize: 7, color: C.hint }}>??</span>
            </div>
          )}
        </div>
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
      <p className="text-[13px] font-extrabold tracking-tight mb-0.5" style={{ color: C.text }}>{tool.name}</p>
      <p className="text-[10px] leading-snug mb-3" style={{ color: C.muted }}>{tool.desc}</p>
      <div className="h-px mb-2.5" style={{ backgroundColor: C.border }} />
      {tool.isLive ? (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[15px] font-extrabold" style={{ color: isLime ? '#4A8F00' : tool.accent }}>
              {tool.sessions.toLocaleString()}
            </p>
            <p className="text-[9px] font-semibold" style={{ color: C.hint }}>sessions</p>
          </div>
          <div className="w-px h-7" style={{ backgroundColor: C.border }} />
          <div className="flex-1">
            <p className="text-[15px] font-extrabold" style={{ color: C.text }}>
              {tool.users.toLocaleString()}
            </p>
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

// -- CMD+K Palette ----------------------------------------------
function CommandPalette({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[650px] rounded-2xl border overflow-hidden"
           style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: C.border }}>
          <Search size={22} style={{ color: C.muted }} />
          <input autoFocus placeholder="Search users, settings, or execute commands..."
            className="flex-1 text-[18px] outline-none" style={{ color: C.text }}
            onKeyDown={e => e.key === 'Escape' && onClose()} />
        </div>
        <div className="p-2" style={{ backgroundColor: C.bg }}>
          <p className="px-4 py-2 text-[11px] font-bold tracking-wide" style={{ color: C.hint }}>QUICK ACTIONS</p>
          {[
            { icon: UserPlus,  label: 'Add New User',               tag: 'CRM',        danger: false },
            { icon: Power,     label: 'Emergency Kill Switch',       tag: 'System',     danger: true  },
            { icon: EyeOff,    label: 'Toggle Investor Mode',        tag: 'Settings',   danger: false },
            { icon: BarChart2, label: 'Jump to Revenue Analytics',   tag: 'Navigation', danger: false },
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

// -- Quick Action Dialogs ---------------------------------------
// -- Custom Dropdown (matches tool design) ---------------------
function CustomDropdown({ value, options, onChange }: {
  value:   string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="relative">
      {/* Trigger */}
      <button onClick={() => setOpen(s => !s)}
        className="w-full flex items-center justify-between h-10 px-3 rounded-xl border text-[13px] font-semibold transition-all"
        style={{
          backgroundColor: '#fff',
          borderColor:     open ? C.lime : C.border,
          color:           C.text,
        }}>
        <span>{selected?.label ?? 'Select...'}</span>
        <ChevronDown size={15}
          style={{
            color:     C.hint,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border overflow-hidden"
               style={{
                 backgroundColor: '#fff',
                 borderColor:     C.border,
                 boxShadow:       '0 8px 24px rgba(0,0,0,0.10)',
                 animation:       'slideUp 0.2s cubic-bezier(0.34,1.56,0.64,1)',
               }}>
            {options.map((o, i) => {
              const isSelected = o.value === value
              return (
                <button key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false) }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] font-semibold transition-all hover:bg-gray-50"
                  style={{
                    backgroundColor: isSelected ? C.lime : 'transparent',
                    color:           isSelected ? C.dark : C.text,
                    borderBottom:    i < options.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                  {o.label}
                  {isSelected && (
                    <span style={{ fontSize: 12 }}>?</span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function AddUserDialog({ onClose, onCreated }: { onClose: () => void; onCreated?: () => void }) {
  const supabase = createClient()

  const [name,         setName]         = useState('')
  const [email,        setEmail]        = useState('')
  const [gender,       setGender]       = useState('Unspecified')
  const [plan,         setPlan]         = useState('Free')
  const [role,         setRole]         = useState('user')
  const [sendWelcome,  setSendWelcome]  = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState(false)
  const [tempPassword, setTempPassword] = useState('')
  const [copied,       setCopied]       = useState(false)

  // -- Generate temp password ---------------------------------
  function generatePassword(n: string) {
    const safe   = (n ?? '').trim().replace(/\s/g, '')
    const prefix = safe.length >= 3 ? safe.substring(0, 3) : 'Usr'
    const suffix = Math.floor(Math.random() * 8999) + 1000
    return `${prefix}#${suffix}`
  }

  useEffect(() => {
    setTempPassword(generatePassword(name || 'User'))
  }, [name])

  // -- Validation ---------------------------------------------
  const isValidEmail = (e: string) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(e.trim())
  const isFormValid  = name.trim().length >= 2 && isValidEmail(email)

  // -- Copy password ------------------------------------------
  function copyPassword() {
    navigator.clipboard.writeText(tempPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // -- Create user --------------------------------------------
  async function handleCreate() {
    if (!isFormValid || isSubmitting) return
    setError(''); setIsSubmitting(true)

    try {
      // Get current session token to pass to API route
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Call server-side API route (uses service role key safely)
      const res = await fetch('/api/admin/create-user', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name,
          email:       email.trim(),
          password:    tempPassword,
          gender,
          plan,
          role,
          sendWelcome,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Failed to create user')
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
      onCreated?.()
      setTimeout(() => onClose(), 2500)

    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.25s ease-out' }}
         onClick={e => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(28px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      <div className="bg-white rounded-2xl border w-full max-w-[480px] overflow-hidden shadow-2xl"
           style={{ borderColor: C.border, animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
             style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ backgroundColor: C.dark }}>
              <UserPlus size={16} style={{ color: C.lime }} />
            </div>
            <p className="text-[17px] font-bold" style={{ color: C.text }}>Add New User</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all group"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <X size={16} className="transition-colors"
               style={{ color: C.hint }}
               onMouseEnter={e => ((e.currentTarget as SVGElement).style.color = '#F87171')}
               onMouseLeave={e => ((e.currentTarget as SVGElement).style.color = C.hint)} />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 px-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                 style={{ backgroundColor: 'rgba(143,255,0,0.1)' }}>
              <span className="text-3xl">??</span>
            </div>
            <p className="text-[18px] font-bold mb-1" style={{ color: C.text }}>User Created!</p>
            <p className="text-[13px] text-center mb-4" style={{ color: C.muted }}>
              {name} has been added successfully.
            </p>
            {/* Show temp password */}
            <div className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border"
                 style={{ backgroundColor: C.bg, borderColor: C.border }}>
              <Key size={14} style={{ color: C.hint }} />
              <span className="flex-1 text-[13px] font-mono font-bold" style={{ color: C.text }}>
                {tempPassword}
              </span>
              <button onClick={copyPassword}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold"
                style={{ backgroundColor: copied ? 'rgba(143,255,0,0.1)' : C.border, color: copied ? '#4A8F00' : C.muted }}>
                {copied ? '? Copied!' : '?? Copy'}
              </button>
            </div>
            <p className="text-[11px] mt-2" style={{ color: C.hint }}>
              Share this temporary password with the user
            </p>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-4">

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border"
                   style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
                <span className="text-[12px] font-semibold" style={{ color: '#F87171' }}>?? {error}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>FULL NAME</p>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full h-10 px-3 rounded-lg border text-[13px] outline-none"
                style={{ borderColor: name.trim().length >= 2 ? C.lime : C.border, color: C.text, backgroundColor: C.bg }} />
            </div>

            {/* Email */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>EMAIL ADDRESS</p>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com" type="email"
                className="w-full h-10 px-3 rounded-lg border text-[13px] outline-none"
                style={{ borderColor: email && !isValidEmail(email) ? '#F87171' : email && isValidEmail(email) ? C.lime : C.border, color: C.text, backgroundColor: C.bg }} />
              {email && !isValidEmail(email) && (
                <p className="text-[11px] mt-1" style={{ color: '#F87171' }}>Enter a valid email address</p>
              )}
            </div>

            {/* Gender + Plan — one row side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>GENDER</p>
                <CustomDropdown
                  value={gender}
                  options={[
                    { value: 'Unspecified', label: 'Prefer not to say' },
                    { value: 'Male',        label: 'Male'              },
                    { value: 'Female',      label: 'Female'            },
                  ]}
                  onChange={setGender}
                />
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>INITIAL PLAN</p>
                <CustomDropdown
                  value={plan}
                  options={[
                    { value: 'Free', label: 'Free' },
                    { value: 'Starter',   label: 'Starter'   },
                    { value: 'Growth', label: 'Growth' },
                  ]}
                  onChange={setPlan}
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>ROLE</p>
              <div className="grid grid-cols-2 gap-2">
                {['user', 'admin'].map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    className="py-2 rounded-lg border text-[12px] font-bold transition-all"
                    style={{
                      backgroundColor: role === r ? C.dark : C.bg,
                      borderColor:     role === r ? C.dark : C.border,
                      color:           role === r ? C.lime : C.muted,
                    }}>
                    {r === 'admin' ? '?? Admin' : '?? User'}
                  </button>
                ))}
              </div>
            </div>

            {/* Temp password preview */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>TEMP PASSWORD</p>
              <div className="flex items-center gap-2 h-10 px-3 rounded-lg border"
                   style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <Key size={13} style={{ color: C.hint }} />
                <span className="flex-1 text-[13px] font-mono font-bold" style={{ color: C.text }}>
                  {tempPassword}
                </span>
                <button onClick={() => setTempPassword(generatePassword(name || 'User'))}
                  className="text-[11px] px-2 py-1 rounded hover:bg-gray-100"
                  style={{ color: C.hint }}>??</button>
                <button onClick={copyPassword}
                  className="text-[11px] px-2 py-1 rounded hover:bg-gray-100"
                  style={{ color: copied ? '#4A8F00' : C.hint }}>
                  {copied ? '?' : '??'}
                </button>
              </div>
            </div>

            {/* Send Welcome Email toggle */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border"
                 style={{ backgroundColor: '#F8FAFC', borderColor: C.border }}>
              <div>
                <p className="text-[13px] font-bold" style={{ color: C.text }}>Send Welcome Email</p>
                <p className="text-[11px]" style={{ color: C.muted }}>Includes temporary password</p>
              </div>
              <div onClick={() => setSendWelcome(s => !s)}
                   className="relative w-11 h-6 rounded-full cursor-pointer transition-colors"
                   style={{ backgroundColor: sendWelcome ? C.dark : '#CBD5E1' }}>
                <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                     style={{ backgroundColor: sendWelcome ? C.lime : '#fff', left: sendWelcome ? '22px' : '2px' }} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold transition-all"
                style={{ borderColor: C.border, color: C.muted, backgroundColor: '#fff' }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#FEF2F2'
                  e.currentTarget.style.borderColor     = '#FECACA'
                  e.currentTarget.style.color           = '#F87171'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#fff'
                  e.currentTarget.style.borderColor     = C.border
                  e.currentTarget.style.color           = C.muted
                }}>
                Cancel
              </button>
              <button onClick={handleCreate}
                disabled={!isFormValid || isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: isFormValid ? C.lime : C.border,
                  color:           isFormValid ? C.dark : C.hint,
                }}>
                {isSubmitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                       style={{ borderTopColor: C.dark }} />
                ) : '? Create User'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

function ResetApiDialog({ onClose }: { onClose: () => void }) {
  const supabase = createClient()
  const [resetting,  setResetting]  = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [resetDaily, setResetDaily] = useState(true)
  const [resetRate,  setResetRate]  = useState(true)

  async function handleReset() {
    if (!resetDaily && !resetRate) return
    setResetting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch('/api/admin/reset-api', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Reset failed')

      setSuccess(true)
      setTimeout(() => onClose(), 2000)
    } catch (e: any) {
      console.error('Reset error:', e)
    }
    setResetting(false)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}
         onClick={e => e.target === e.currentTarget && !resetting && onClose()}>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      <div className="bg-white rounded-2xl border w-full max-w-sm overflow-hidden shadow-2xl"
           style={{ borderColor: C.border, animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
             style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ backgroundColor: C.dark }}>
              <Key size={15} style={{ color: C.lime }} />
            </div>
            <p className="text-[16px] font-bold" style={{ color: C.text }}>Reset API Counters</p>
          </div>
          <button onClick={onClose} disabled={resetting}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}>
            <X size={15} style={{ color: C.hint }} />
          </button>
        </div>

        {success ? (
          /* Success state */
          <div className="flex flex-col items-center py-8 px-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                 style={{ backgroundColor: 'rgba(143,255,0,0.1)' }}>
              <span className="text-2xl">?</span>
            </div>
            <p className="text-[16px] font-bold mb-1" style={{ color: C.text }}>Reset Complete!</p>
            <p className="text-[12px] text-center" style={{ color: C.muted }}>
              API counters have been reset successfully.
            </p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            <p className="text-[13px]" style={{ color: C.muted }}>
              Select what you want to reset:
            </p>

            {/* Checkboxes */}
            {[
              { label: 'Daily request counters',  sub: 'Resets requests_today to 0',   val: resetDaily, set: setResetDaily },
              { label: 'Rate limit usage',        sub: 'Resets rate_limit_used to 0',  val: resetRate,  set: setResetRate  },
            ].map((item, i) => (
              <div key={i}
                onClick={() => item.set(s => !s)}
                className="flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all"
                style={{
                  backgroundColor: item.val ? 'rgba(143,255,0,0.05)' : C.bg,
                  borderColor:     item.val ? C.lime : C.border,
                }}>
                <div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                     style={{
                       backgroundColor: item.val ? C.lime : '#fff',
                       borderColor:     item.val ? C.lime : C.border,
                     }}>
                  {item.val && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: C.text }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>{item.sub}</p>
                </div>
              </div>
            ))}

            {/* Warning */}
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border"
                 style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
              <span className="text-[13px]">??</span>
              <p className="text-[11px]" style={{ color: '#92400E' }}>
                This affects all platforms in your API Fleet. This action cannot be undone.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button onClick={onClose} disabled={resetting}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold transition-all"
                style={{ borderColor: C.border, color: C.muted, backgroundColor: '#fff' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = '#F87171'; e.currentTarget.style.borderColor = '#FECACA' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border }}>
                Cancel
              </button>
              <button onClick={handleReset}
                disabled={resetting || (!resetDaily && !resetRate)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: (!resetDaily && !resetRate) ? C.border : C.lime,
                  color:           (!resetDaily && !resetRate) ? C.hint   : C.dark,
                }}>
                {resetting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                       style={{ borderTopColor: C.dark }} />
                ) : '?? Reset Now'}
              </button>
            </div>
          </div>
        )}
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
          ?? This will immediately disable ALL user access. This action is logged and cannot be undone without manual restore.
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

// --------------------------------------------------------------
// MAIN PAGE
// --------------------------------------------------------------
function AdminPage() {
  const supabase     = createClient()
  const searchParams = useSearchParams()

  const [authorized,        setAuthorized]        = useState(false)
  const [checking,          setChecking]          = useState(true)
  const [isSettingsMode,    setIsSettingsMode]    = useState(() => !!searchParams.get('settings'))
  const [isAnalyticsMode, setIsAnalyticsMode] = useState(() => !!searchParams.get('analytics'))
  const [activeSettingsTab, setActiveSettingsTab] = useState(() => {
    const tab = searchParams.get('settings')
    const tabMap: Record<string, number> = {
      'user-crm': 0, 'role-builder': 1, 'security': 2, 'promos': 3,
      'kill-switches': 4, 'plan-limits': 5, 'emails': 6, 'webhooks': 7,
      'gamification': 8, 'api-vault': 9, 'affiliate': 10, 'founder-ops': 11,
      'marketing': 12, 'payments': 13, 'tickets': 14, 'blog': 15, 'changelog': 16,
    }
    return tab ? (tabMap[tab] ?? 0) : 0
  })
  const [investorMode,      setInvestorMode]      = useState(false)
  const [showCmdPalette,    setShowCmdPalette]    = useState(false)
  const [showAddUser,       setShowAddUser]       = useState(false)
  const [showResetApi,      setShowResetApi]      = useState(false)
  const [analyticsTab, setAnalyticsTab] = useState(() => {
    const tab = searchParams.get('analytics')
    const analyticsMap: Record<string, number> = {
      'revenue': 0, 'api': 1, 'vero': 2, 'affiliate': 3,
      'roadmap': 4, 'infra': 5, 'competitor': 6, 'chrome': 7,
    }
    return tab ? (analyticsMap[tab] ?? 0) : 0
  })
  const [showKillSwitch,    setShowKillSwitch]    = useState(false)
  const [mobileDrawerOpen,  setMobileDrawerOpen]  = useState(false)
  const [tabPermissions,    setTabPermissions]    = useState<Record<string, any>>({})
  const [isSuperAdmin,      setIsSuperAdmin]      = useState(false)
  const [marketingUsers,    setMarketingUsers]    = useState<any[]>([])
  const [openTickets,       setOpenTickets]       = useState(0)
  const [isMobile,          setIsMobile]          = useState(
    () => typeof window !== 'undefined' ? window.innerWidth < 950 : false
  )
  // -- Real stats state ---------------------------------------
  const [stats, setStats] = useState<AdminStats>(DEFAULT_STATS)

  useEffect(() => {
    function handleSettingsTab(e: Event) {
      const tab = (e as CustomEvent).detail
      setActiveSettingsTab(tab)
      setIsSettingsMode(true)
      setIsAnalyticsMode(false)
    }
    function handleAnalyticsTab(e: Event) {
      const tab = (e as CustomEvent).detail
      setAnalyticsTab(tab)
      setIsAnalyticsMode(true)
      setIsSettingsMode(false)
    }
    window.addEventListener('admin-settings-tab', handleSettingsTab)
    window.addEventListener('admin-analytics-tab', handleAnalyticsTab)
    return () => {
      window.removeEventListener('admin-settings-tab', handleSettingsTab)
      window.removeEventListener('admin-analytics-tab', handleAnalyticsTab)
    }
  }, [])

  useEffect(() => {
    const settingsParam  = searchParams.get('settings')
    const analyticsParam = searchParams.get('analytics')
    const analyticsMap: Record<string, number> = {
      'revenue': 0, 'api': 1, 'vero': 2, 'affiliate': 3,
      'roadmap': 4, 'infra': 5, 'competitor': 6, 'chrome': 7,
    }
    if (analyticsParam !== null) {
      setAnalyticsTab(analyticsMap[analyticsParam] ?? 0)
      setIsAnalyticsMode(true)
      setIsSettingsMode(false)
    } else if (settingsParam !== null) {
      setActiveSettingsTab(Number(settingsParam))
      setIsSettingsMode(true)
      setIsAnalyticsMode(false)
    } else {
      setIsSettingsMode(false)
      setIsAnalyticsMode(false)
    }
  }, [searchParams])

  const containerRef = useRef<HTMLDivElement>(null)

  // -- Role check ---------------------------------------------
  useEffect(() => {
    async function check() {
      const cookie = document.cookie.split(';').find(c => c.trim().startsWith('riazify_role='))
      const role = cookie ? cookie.split('=')[1].trim() : null
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setChecking(false); return }
      const { data } = await supabase.from('profiles').select('role, is_super_admin, tab_permissions, section_permissions').eq('id', user.id).single()
      setAuthorized((data as any)?.role === 'admin')
      setIsSuperAdmin((data as any)?.is_super_admin ?? false)
      // Fetch via API to bypass RLS
      const res = await fetch('/api/admin/get-my-permissions')
      const permsData = await res.json()
      setTabPermissions(permsData?.tab_permissions ?? (data as any)?.tab_permissions ?? {})
      console.log('TAB PERMISSIONS:', permsData?.tab_permissions ?? (data as any)?.tab_permissions)
      console.log('IS SUPER ADMIN:', (data as any)?.is_super_admin)
      setChecking(false)
    }
    check()
  }, [])

  // -- Load real admin stats ----------------------------------
  const loadAdminStats = useCallback(async () => {
    try {
      // 1. Fetch all profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('plan_name, account_status, subscription_status, created_at, last_seen, country')

      const all   = (profiles ?? []) as any[]
      const total = all.length

      // 2. MRR — from transactions table (real payments)
      const { data: txns } = await supabase
        .from('transactions')
        .select('amount, status, plan, billing, created_at, user_id')

      const allTxns = (txns ?? []) as any[]

      // Active MRR = sum of paid transactions
      const mrr = Math.round(
        allTxns
          .filter((t: any) => t.status === 'paid')
          .reduce((sum: number, t: any) => {
            const amount = Number(t.amount ?? 0)
            return sum + (t.billing === 'annual' ? amount / 12 : amount)
          }, 0)
      )

      // Active subscribers = paid users from profiles
      const activeSubs = all.filter((p: any) =>
        ['starter', 'growth', 'custom'].includes((p.plan_name ?? '').toLowerCase()) &&
        p.subscription_status === 'active'
      ).length

      // Cancelled/churned
      const churned = all.filter((p: any) =>
        p.subscription_status === 'cancelled' ||
        p.subscription_status === 'past_due'
      ).length

      // Conversion rate
      const everPaid = all.filter((p: any) =>
        ['starter', 'growth', 'custom'].includes((p.plan_name ?? '').toLowerCase())
      ).length
      const convRate  = total > 0 ? (everPaid / total) * 100 : 0
      const churnRate = total > 0 ? (churned  / total) * 100 : 0

      // Online now — last_seen within 5 minutes
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const onlineNow  = all.filter((p: any) =>
        p.last_seen && p.last_seen > fiveMinAgo
      ).length

      // Signups today
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const signupsToday = all.filter((p: any) =>
        p.created_at && new Date(p.created_at) >= todayStart
      ).length

      // Rev today — real payments where paid_at >= today midnight
      const todayMidnight = new Date()
      todayMidnight.setHours(0, 0, 0, 0)
      const revToday = allTxns
        .filter((t: any) =>
          t.created_at && new Date(t.created_at) >= todayMidnight
        )
        .reduce((sum: number, t: any) => sum + (Number(t.amount) ?? 0), 0)

      // 2. Fetch tool usage from tool_usage (today only)
      const { data: usageRows } = await supabase
        .from('tool_usage')
        .select('tool_name, user_id, used_at')
        .gte('used_at', todayStart.toISOString())

      const toolMap: Record<string, { sessions: number; users: Set<string> }> = {}
      for (const row of (usageRows ?? []) as any[]) {
        const key = (row.tool_name ?? 'unknown').toLowerCase()
        if (!toolMap[key]) toolMap[key] = { sessions: 0, users: new Set() }
        toolMap[key].sessions += row.count ?? 1
        if (row.user_id) toolMap[key].users.add(row.user_id)
      }

      // Flatten for easier consumption
      const toolStats: Record<string, { sessions: number; users: number }> = {}
      let totalUsage = 0
      let mostUsedTool  = '—'
      let mostUsedCount = 0

      for (const [key, data] of Object.entries(toolMap)) {
        toolStats[key] = { sessions: data.sessions, users: data.users.size }
        totalUsage += data.sessions
        if (data.sessions > mostUsedCount) {
          mostUsedCount = data.sessions
          mostUsedTool = key
            .split('_')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
        }
      }

      // 3. Country stats — from transactions + profiles
      const { data: txCountries } = await supabase
        .from('transactions')
        .select('country')
        .eq('status', 'paid')
        .not('country', 'is', null)

      const { data: profileCountries } = await supabase
        .from('profiles')
        .select('country')
        .not('country', 'is', null)

      const countryMap: Record<string, number> = {}

      // Count from transactions first
      for (const t of (txCountries ?? []) as any[]) {
        const c = (t.country ?? '').trim()
        if (c) countryMap[c] = (countryMap[c] ?? 0) + 1
      }

      // Add profile countries (avoid double counting)
      for (const p of (profileCountries ?? []) as any[]) {
        const c = (p.country ?? '').trim()
        if (c && !countryMap[c]) countryMap[c] = 1
      }

      const countryStats = Object.entries(countryMap)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)

      // 4. Recent transactions from transactions table
      const { data: txData } = await supabase
        .from('transactions')
        .select('user_id, user_email, plan, amount, status, billing, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      const recentTx = (txData ?? []) as any[]

      setStats({
        mrr, activeSubs, totalUsers: total,
        convRate, churnRate,
        totalUsage, mostUsedTool, mostUsedCount,
        onlineNow, signupsToday, revToday,
        toolStats, countryStats, recentTx,
        loading: false,
      })
    } catch (e) {
      console.error('Admin stats error:', e)
      setStats(s => ({ ...s, loading: false }))
    }
  }, [])

  useEffect(() => {
    if (authorized) loadAdminStats()
  }, [authorized, loadAdminStats])

  // -- Responsive ---------------------------------------------
  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setIsMobile(e.contentRect.width < 950)
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // -- CMD+K ---------------------------------------------------
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

  // -- Computed stat cards from real data ---------------------
  const statCards: StatCardData[] = [
    {
      title: 'Monthly Recurring Revenue', titleMobile: 'MRR',
      value: stats.loading ? '—' : `$${stats.mrr.toLocaleString()}`,
      sub: stats.loading ? 'Loading...' : `+${stats.signupsToday} signups today`,
      icon: DollarSign, isHighlight: true, isGood: false, isToolCard: false, isTopTool: false,
    },
    {
      title: 'Active Subscribers', titleMobile: 'Users',
      value: stats.loading ? '—' : String(stats.activeSubs),
      sub: stats.loading ? 'Loading...' : `${stats.totalUsers} total accounts`,
      icon: Users, isHighlight: false, isGood: false, isToolCard: false, isTopTool: false,
    },
    {
      title: 'Trial Conversion Rate', titleMobile: 'Conversion',
      value: stats.loading ? '—' : `${stats.convRate.toFixed(1)}%`,
      sub: 'Industry avg: 15%',
      icon: TrendingUp, isHighlight: false, isGood: false, isToolCard: false, isTopTool: false,
    },
    {
      title: 'Churn Rate', titleMobile: 'Churn',
      value: stats.loading ? '—' : `${stats.churnRate.toFixed(1)}%`,
      sub: stats.loading ? 'Loading...' : stats.churnRate < 5 ? 'Healthy ?' : 'Action needed ?',
      icon: TrendingDown, isHighlight: false, isGood: stats.churnRate < 5, isToolCard: false, isTopTool: false,
    },
    {
      title: 'Total Tool Usage', titleMobile: 'Tool Uses',
      value: stats.loading ? '—' : stats.totalUsage.toLocaleString(),
      sub: 'Across all tools today',
      icon: Wrench, isHighlight: false, isGood: false, isToolCard: true, isTopTool: false,
    },
    {
      title: 'Most Used Tool', titleMobile: 'Top Tool',
      value: stats.loading ? '—' : stats.mostUsedTool,
      sub: stats.loading ? 'Loading...' : `${stats.mostUsedCount.toLocaleString()} sessions today`,
      icon: Trophy, isHighlight: false, isGood: false, isToolCard: true, isTopTool: true,
    },
  ]

  // -- Tools with real sessions/users ------------------------
  const tools = TOOL_DEFS.map(t => {
    const data = stats.toolStats[t.dbKey] ?? { sessions: 0, users: 0 }
    return { ...t, sessions: data.sessions, users: data.users }
  })

  const permsLoaded = isSuperAdmin || Object.keys(tabPermissions).length > 0

  // Block direct URL access to restricted tabs — only on initial load, not on every click
  const didInitialRedirect = useRef(false)
  useEffect(() => {
    if (!permsLoaded) return
    if (isSuperAdmin) return
    if (didInitialRedirect.current) return
    didInitialRedirect.current = true
    const tabKeyMap: Record<number, string> = {
      0:'user_crm', 1:'role_builder', 2:'security_logs', 3:'promos',
      4:'kill_switches', 5:'plan_limits', 6:'emails', 7:'webhooks',
      8:'gamification', 9:'api_vault', 10:'affiliate_vault', 11:'founder_ops',
      12:'marketing', 13:'payments', 14:'tickets', 15:'blog',
      16:'changelog', 17:'careers', 18:'page_editor',
      19:'api_fleet', 20:'feature_roadmap', 21:'vero_center', 22:'infra_monitor', 23:'competitor_xray', 24:'chrome_extension'
    }
    const key = tabKeyMap[activeSettingsTab]
    if (key && tabPermissions[key]?.access === 'none') {
      // Redirect to first allowed tab — only for the initial deep-link/page-load case
      const firstAllowed = Object.entries(tabKeyMap).find(([, k]) =>
        tabPermissions[k]?.access !== 'none'
      )
      if (firstAllowed) setActiveSettingsTab(Number(firstAllowed[0]))
    }
  }, [permsLoaded])

  if (checking) return null
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

  // -- Settings content router --------------------------------
  function getSettingsContent() {
    const tabKeyMap: Record<number, string> = {
        0:'user_crm', 1:'role_builder', 2:'security_logs', 3:'promos',
        4:'kill_switches', 5:'plan_limits', 6:'emails', 7:'webhooks',
        8:'gamification', 9:'api_vault', 10:'affiliate_vault', 11:'founder_ops',
        12:'marketing', 13:'payments', 14:'tickets', 15:'blog',
        16:'changelog', 17:'careers', 18:'page_editor',
        19:'api_fleet', 20:'feature_roadmap', 21:'vero_center', 22:'infra_monitor', 23:'competitor_xray', 24:'chrome_extension'
      }
      const key = tabKeyMap[activeSettingsTab]
      if (!isSuperAdmin && key && tabPermissions[key]?.access === 'none') {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.dark }}>
            <Shield size={26} style={{ color: C.lime }} />
          </div>
          <p className="text-[16px] font-bold" style={{ color: C.text }}>You don't have access to this tab</p>
          <p className="text-[13px]" style={{ color: C.muted }}>Contact your admin if you think this is a mistake.</p>
        </div>
      )
    }
    switch (activeSettingsTab) {
      case 0:  return <UserCrmTab
        isInvestorMode={investorMode}
        isMobile={isMobile}
        onGoToMarketing={(users) => {
          setMarketingUsers(users)
          setActiveSettingsTab(12)
        }}
        viewOnly={!isSuperAdmin && tabPermissions?.user_crm?.access === 'view'}
        canDo={(action: string) => {
          if (isSuperAdmin) return true
          if (!tabPermissions?.user_crm) return true
          const key = `user_crm__${action}`
          if (tabPermissions[key] === true) return true
          if (tabPermissions?.user_crm?.access === 'view' || tabPermissions?.user_crm?.access === 'none') return false
          return tabPermissions[key] !== false
        }}
      />
      case 1:  return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.role_builder?.access === 'view'} tabLabel="Role Builder"><RoleBuilderTab /></PermissionWrapper>
      case 2:  return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.security_logs?.access === 'view'} tabLabel="Security Logs"><SecurityLogsTab isInvestorMode={investorMode} /></PermissionWrapper>
      case 3:  return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.promos?.access === 'view'} tabLabel="Promos"><PromoManagerTab /></PermissionWrapper>
      case 4:  return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.kill_switches?.access === 'view'} tabLabel="Kill Switches"><KillSwitchesTab /></PermissionWrapper>
      case 5:  return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.plan_limits?.access === 'view'} tabLabel="Plan Limits"><PlanLimitsTab /></PermissionWrapper>
      case 6:  return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.emails?.access === 'view'} tabLabel="Emails"><EmailAutomationsTab /></PermissionWrapper>
      case 7:  return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.webhooks?.access === 'view'} tabLabel="Webhooks"><WebhooksTab /></PermissionWrapper>
      case 8:  return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.gamification?.access === 'view'} tabLabel="Gamification"><GamificationTab /></PermissionWrapper>
      case 9:  return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.api_vault?.access === 'view'} tabLabel="API Vault"><ApiVaultPage /></PermissionWrapper>
      case 10: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.affiliate_vault?.access === 'view'} tabLabel="Affiliate Vault"><AffiliateVaultTab /></PermissionWrapper>
      case 11: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.founder_ops?.access === 'view'} tabLabel="Founder Ops"><FounderOpsTab onNavigate={(tab) => { setIsSettingsMode(true); setIsAnalyticsMode(false); setActiveSettingsTab(tab) }} /></PermissionWrapper>
      case 12: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.marketing?.access === 'view'} tabLabel="Marketing"><MarketingTab initialUsers={marketingUsers} /></PermissionWrapper>
      case 13: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.payments?.access === 'view'} tabLabel="Payments"><PaymentsTab onNavigate={(tab) => { setIsSettingsMode(true); setIsAnalyticsMode(false); setActiveSettingsTab(tab) }} /></PermissionWrapper>
      case 14: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.tickets?.access === 'view'} tabLabel="Tickets"><TicketManagerTab onOpenCount={setOpenTickets} /></PermissionWrapper>
      case 15: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.blog?.access === 'view'} tabLabel="Blog"><BlogTab /></PermissionWrapper>
      case 16: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.changelog?.access === 'view'} tabLabel="Changelog"><ChangelogTab /></PermissionWrapper>
      case 17: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.careers?.access === 'view'} tabLabel="Careers"><CareersTab /></PermissionWrapper>
      case 18: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.page_editor?.access === 'view'} tabLabel="Page Editor"><PageEditorTab /></PermissionWrapper>
      case 19: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.api_fleet?.access === 'view'} tabLabel="API Fleet"><GlobalApiFleetTab isInvestorMode={investorMode} isMobile={isMobile} startChartAnimation={true} /></PermissionWrapper>
      case 20: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.feature_roadmap?.access === 'view'} tabLabel="Feature Roadmap"><FeatureRoadmapTab isInvestorMode={investorMode} isMobile={isMobile} startChartAnimation={true} /></PermissionWrapper>
      case 21: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.vero_center?.access === 'view'} tabLabel="VeRO Command Center"><VeroCommandCenterTab isInvestorMode={investorMode} isMobile={isMobile} startChartAnimation={true} /></PermissionWrapper>
      case 22: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.infra_monitor?.access === 'view'} tabLabel="Infrastructure Monitor"><InfrastructureMonitorTab isInvestorMode={investorMode} isMobile={isMobile} startChartAnimation={true} /></PermissionWrapper>
      case 23: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.competitor_xray?.access === 'view'} tabLabel="Competitor X-Ray"><CompetitorXRayTab isInvestorMode={investorMode} isMobile={isMobile} startChartAnimation={true} /></PermissionWrapper>
      case 24: return <PermissionWrapper viewOnly={!isSuperAdmin && tabPermissions?.chrome_extension?.access === 'view'} tabLabel="Chrome Extension"><ChromeExtensionTab isInvestorMode={investorMode} isMobile={isMobile} startChartAnimation={true} /></PermissionWrapper>
      default: return null
    }
  }

  // -- Header -------------------------------------------------
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
        <button className="w-10 h-10 flex items-center justify-center rounded-lg border"
                style={{ borderColor: C.border }}>
          <MoreVertical size={18} style={{ color: C.text }} />
        </button>
      </div>
    )

    return (
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 mr-2">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: C.lime }} />
          <p className="text-[13px] truncate" style={{ color: C.muted }}>{subtitle}</p>
        </div>

        {/* Real quick stats bar */}
        <div className="flex items-center gap-0 px-3 py-1.5 rounded-full border ml-auto"
             style={{ backgroundColor: C.dark, borderColor: 'rgba(143,255,0,0.2)' }}>
          {[
            { val: stats.loading ? '—' : String(stats.onlineNow),           label: 'online',    color: C.lime    },
            { val: stats.loading ? '—' : String(stats.signupsToday),        label: 'signups',   color: '#60A5FA' },
            { val: stats.loading ? '—' : `$${stats.revToday.toLocaleString()}`, label: 'rev today', color: '#FBBF24' },
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

        {/* Buttons moved to sidebar */}
      </div>
    )
  }

  // -- Settings sidebar item ----------------------------------
  function SidebarItem({ index }: { index: number }) {
    const item     = SETTINGS_MENU[index]
    const badge    = index === 14 ? openTickets : (item.badge ?? 0)
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
        <span className="text-[13px] flex-1"
              style={{ color: isActive ? C.text : C.muted, fontWeight: isActive ? 700 : 600 }}>
          {item.title}
        </span>
        {badge > 0 && (
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: '#b91c1c', color: '#fff' }}>
            {badge}
          </span>
        )}
      </button>
    )
  }

  // -- Quick Action Bar ---------------------------------------
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
            { icon: UserPlus, label: 'Add User',      bg: C.lime,    color: C.dark,    border: null,       action: () => setShowAddUser(true)   },
            { icon: Key,      label: 'Reset API',     bg: '#F1F5F9', color: C.text,    border: null,       action: () => setShowResetApi(true)  },
            { icon: FileText, label: 'Export Report', bg: '#F1F5F9', color: C.text,    border: null,       action: () => {}                     },
            { icon: Power,    label: 'Kill Switch',   bg: '#FEF2F2', color: '#F87171', border: '#FFCDD2',  action: () => { setIsSettingsMode(true); setIsAnalyticsMode(false); setActiveSettingsTab(4) } },
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

  // -- Dashboard Layout ---------------------------------------
  function DashboardLayout() {
    const liveCount     = tools.filter(t => t.isLive).length
    const totalSessions = tools.filter(t => t.isLive).reduce((s, t) => s + t.sessions, 0)
    const totalUsers    = tools.filter(t => t.isLive).reduce((s, t) => s + t.users, 0)

    return (
      <div className="flex flex-col gap-6">
        {/* Stat cards — real data */}
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-6'}`}>
          {statCards.map((d, i) => <StatCard key={i} d={d} isMobile={isMobile} />)}
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
                {liveCount} active tools  •  {totalSessions.toLocaleString()} sessions today  •  {totalUsers.toLocaleString()} users
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                 style={{ backgroundColor: C.dark }}>
              <Wrench size={12} style={{ color: C.lime }} />
              <span className="text-[11px] font-bold text-white">Manage Tools</span>
            </div>
          </div>
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-6'}`}>
            {tools.map((t, i) => <ToolCard key={i} tool={t} />)}
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActionBar />

        {/* Row 4: Live Transaction Ledger + Geographic Heatmap */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>

          {/* Live Transaction Ledger */}
          <div className="p-5 rounded-2xl border"
               style={{ backgroundColor: '#fff', borderColor: C.border }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: C.lime }} />
                <p className="text-[14px] font-bold" style={{ color: C.text }}>Live Transactions</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[11px]" style={{ color: C.muted }}>Recent payment activity</p>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.lime }} />
              </div>
            </div>
            {stats.recentTx.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <DollarSign size={28} style={{ color: C.border }} />
                <p className="text-[13px]" style={{ color: C.muted }}>No transactions yet</p>
                <p className="text-[11px]" style={{ color: C.hint }}>Payments will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['USER', 'PLAN', 'AMOUNT', 'STATUS', 'BILLING', 'DATE'].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-[9px] font-black tracking-wider"
                            style={{ color: C.muted }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentTx.map((tx: any, i: number) => {
                      const isPaid     = tx.status === 'paid'
                      const isFailed   = tx.status === 'failed'
                      const statusColor = isPaid ? '#16A34A' : isFailed ? '#EF4444' : '#F59E0B'
                      const statusDot   = isPaid ? '#16A34A' : isFailed ? '#EF4444' : '#F59E0B'
                      const planColor   = tx.plan === 'growth' ? { bg: 'rgba(143,255,0,0.1)', color: '#4a8f00' }
                                        : tx.plan === 'starter' ? { bg: 'rgba(99,102,241,0.1)', color: '#6366f1' }
                                        : tx.plan === 'custom'  ? { bg: 'rgba(217,119,6,0.1)', color: '#d97706' }
                                        : { bg: C.bg, color: C.muted }
                      return (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                            className="hover:opacity-80 transition-opacity">
                          {/* User */}
                          <td className="px-3 py-3">
                            <p className="text-[12px] font-semibold truncate" style={{ color: C.text, maxWidth: 160 }}>
                              {tx.user_email ?? (tx.user_id?.slice(0, 8) + '...')}
                            </p>
                            {tx.invoice && (
                              <p className="text-[10px] font-mono" style={{ color: C.muted }}>{tx.invoice}</p>
                            )}
                          </td>
                          {/* Plan */}
                          <td className="px-3 py-3">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg capitalize"
                                  style={{ backgroundColor: planColor.bg, color: planColor.color }}>
                              {tx.plan ?? '—'}
                            </span>
                          </td>
                          {/* Amount */}
                          <td className="px-3 py-3 text-[13px] font-black"
                              style={{ color: Number(tx.amount) > 0 ? '#16A34A' : C.muted }}>
                            {Number(tx.amount) > 0 ? `+$${Number(tx.amount).toFixed(2)}` : '$0'}
                          </td>
                          {/* Status */}
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusDot }} />
                              <span className="text-[11px] font-bold capitalize" style={{ color: statusColor }}>
                                {tx.status ?? '—'}
                              </span>
                            </div>
                          </td>
                          {/* Billing */}
                          <td className="px-3 py-3 text-[11px] font-semibold capitalize"
                              style={{ color: C.muted }}>
                            {tx.billing ?? '—'}
                          </td>
                          {/* Date */}
                          <td className="px-3 py-3 text-[11px]" style={{ color: C.muted }}>
                            {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Geographic Heatmap */}
          <div className="p-5 rounded-2xl border"
               style={{ backgroundColor: '#fff', borderColor: C.border }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: '#60A5FA' }} />
                <div>
                  <p className="text-[14px] font-bold" style={{ color: C.text }}>Geographic Overview</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>Users by country</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                    style={{ backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}` }}>
                {stats.countryStats.length} {stats.countryStats.length === 1 ? 'country' : 'countries'}
              </span>
            </div>
            {stats.countryStats.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <Globe size={28} style={{ color: C.border }} />
                <p className="text-[13px]" style={{ color: C.muted }}>No location data yet</p>
                <p className="text-[11px] text-center" style={{ color: C.hint }}>
                  Location data will appear here when users verify their country in profile settings
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.countryStats.map((c: any, i: number) => {
                  const pct = stats.totalUsers > 0
                    ? Math.round((c.count / stats.totalUsers) * 100)
                    : 0
                  const barColor = i === 0 ? C.lime : i === 1 ? '#60A5FA' : i === 2 ? '#FB923C' : i === 3 ? '#A78BFA' : C.border
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0"
                               style={{ backgroundColor: barColor }} />
                          <span className="text-[12px] font-semibold" style={{ color: C.text }}>
                            {c.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px]" style={{ color: C.muted }}>{c.count} users</span>
                          <span className="text-[11px] font-bold" style={{ color: C.text }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden"
                           style={{ backgroundColor: C.border }}>
                        <div className="h-full rounded-full transition-all"
                             style={{ width: `${pct}%`, backgroundColor: barColor }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    )
  }

  // -- Settings Layout ----------------------------------------
  function SettingsLayout() {
    return (
      <div className="flex-1 min-w-0">
        {permsLoaded ? getSettingsContent() : null}
      </div>
    )
  }

  // -- Mobile Drawer ------------------------------------------
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
              const Icon     = item.icon
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
      <style>{`
        ${!isSettingsMode && !isAnalyticsMode ? `
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: #8FFF00; border-radius: 10px; }
        ` : `
          ::-webkit-scrollbar-thumb { background: transparent; }
        `}
      `}</style>

      <div className="w-full px-4 md:px-6 lg:px-8 pt-4 pb-20 flex flex-col gap-6">
        <Header />

        {isSettingsMode && <SettingsLayout />}

        {isAnalyticsMode && !isSettingsMode && (
          <AnalyticsHub
            isInvestorMode={investorMode}
            isMobile={isMobile}
            initialTab={analyticsTab}
            onBack={() => { setIsAnalyticsMode(false); setAnalyticsTab(0) }}
          />
        )}

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

      {showCmdPalette  && <CommandPalette  onClose={() => setShowCmdPalette(false)}  />}
      {showAddUser     && <AddUserDialog   onClose={() => setShowAddUser(false)} onCreated={loadAdminStats} />}
      {showResetApi    && <ResetApiDialog  onClose={() => setShowResetApi(false)}    />}
      {showKillSwitch  && <KillSwitchDialog onClose={() => setShowKillSwitch(false)} />}
      <MobileDrawer />
    </div>
  )
}
export default function AdminPageWrapper() {
  return (
    <Suspense fallback={null}>
      <AdminPage />
    </Suspense>
  )
}
