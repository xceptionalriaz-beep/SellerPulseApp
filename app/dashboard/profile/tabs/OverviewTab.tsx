'use client'
// app/dashboard/profile/tabs/OverviewTab.tsx

import { useState, useEffect, useCallback } from 'react'
import {
  ShoppingBag, Search, Store, Shield, BarChart2, History,
  RefreshCw, CheckCircle, AlertTriangle, Edit, User, Mail,
  Building2, ChevronDown, X,
} from 'lucide-react'
import { PageSpinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/AppToast'
import { cn, timeAgo } from '@/lib/utils'

const C = {
  lime:    '#8fff00',
  limeD:   '#4a8f00',
  limeTint:'#f4ffe6',
  dark:    '#0a0d08',
  border:  '#e8ede2',
  muted:   '#8a9e78',
  surface: '#ffffff',
  bg:      '#f9fdf4',
  green:   '#00C48C',
  orange:  '#FFB800',
  red:     '#FF4D6A',
  blue:    '#1D70F5',
  purple:  '#8B5CF6',
}

function Field({ label, value, onChange, icon: Icon, readOnly }: {
  label: string; value: string; onChange?: (v: string) => void
  icon: React.ElementType; readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <label style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:700, color:C.dark }}>{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
        <input
          type="text" value={value} readOnly={readOnly}
          onChange={e => onChange?.(e.target.value)}
          className="w-full h-[48px] pl-10 pr-4 rounded-xl border text-[14px] outline-none transition-all"
          style={{
            fontFamily:'Inter,sans-serif', backgroundColor:C.bg,
            color: readOnly ? C.muted : C.dark,
            borderColor: C.border,
            cursor: readOnly ? 'not-allowed' : 'text',
          }}
          onFocus={e => { if (!readOnly) e.target.style.borderColor = C.lime }}
          onBlur={e  => { e.target.style.borderColor = C.border }}
        />
      </div>
    </div>
  )
}

interface ActivityItem {
  icon: React.ElementType; color: string; title: string
  timeAgoStr: string; tag?: string; tagColor?: string
}
interface HealthCheckItem { label: string; passed: boolean; pts: string }

export default function OverviewTab({ onTabChange }: { onTabChange?: (i: number) => void }) {
  const supabase = createClient()
  const toast    = useToast()

  const [userName,        setUserName]        = useState('Seller')
  const [userEmail,       setUserEmail]       = useState('')
  const [userGender,      setUserGender]      = useState('Unspecified')
  const [joinedDate,      setJoinedDate]      = useState('')
  const [avatarUrl,       setAvatarUrl]       = useState<string | null>(null)
  const [isEditing,       setIsEditing]       = useState(false)
  const [isSaving,        setIsSaving]        = useState(false)
  const [isLoading,       setIsLoading]       = useState(true)
  const [showGender,      setShowGender]      = useState(false)
  const [editName,        setEditName]        = useState('')
  const [editBusiness,    setEditBusiness]    = useState('')
  const [editGender,      setEditGender]      = useState('Unspecified')
  const [ordersCount,     setOrdersCount]     = useState(0)
  const [productScans,    setProductScans]    = useState(0)
  const [productLimit,    setProductLimit]    = useState(100)
  const [competitorCount, setCompetitorCount] = useState(0)
  const [competitorLimit, setCompetitorLimit] = useState(50)
  const [ebayConnected,   setEbayConnected]   = useState(false)
  const [ebayUsername,    setEbayUsername]    = useState('')
  const [activity,        setActivity]        = useState<ActivityItem[]>([])
  const [healthScore,     setHealthScore]     = useState(0)
  const [healthChecks,    setHealthChecks]    = useState<HealthCheckItem[]>([])
  const [toolUsage,       setToolUsage]       = useState<any[]>([])
  const [planName,        setPlanName]        = useState('Free')
  const [subStatus,       setSubStatus]       = useState('inactive')

  function getInitials(name: string) {
    if (!name.trim()) return 'S'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.length >= 2 ? name.substring(0, 2).toUpperCase() : name.toUpperCase()
  }

  function formatJoinDate(iso?: string) {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      return `Joined ${m[d.getMonth()]} ${d.getFullYear()}`
    } catch { return '' }
  }

  function buildAvatarUrl(email: string, gender: string) {
    const seed = email || 'default'
    if (gender === 'Male')   return `https://api.dicebear.com/9.x/adventurer-neutral/png?seed=${seed}male&backgroundColor=b6e3f4`
    if (gender === 'Female') return `https://api.dicebear.com/9.x/lorelei/png?seed=${seed}female&backgroundColor=ffdfbf`
    return null
  }

  const healthColor = healthScore >= 80 ? C.lime : healthScore >= 60 ? C.orange : C.red
  const healthLabel = healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Needs Attention'

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const name   = user.user_metadata?.full_name || 'Seller'
      const email  = user.email || ''
      const gender = user.user_metadata?.gender || 'Unspecified'
      const biz    = user.user_metadata?.business_name || ''
      setUserName(name); setUserEmail(email); setUserGender(gender)
      setJoinedDate(formatJoinDate(user.created_at))
      setAvatarUrl(user.user_metadata?.picture || buildAvatarUrl(email, gender))
      setEditName(name); setEditBusiness(biz); setEditGender(gender)

      const { data: profile } = await (supabase.from('profiles') as any)
        .select('ebay_marketplace, plan_name, subscription_status, ebay_username')
        .eq('id', user.id).single()
      const connected = !!(profile as any)?.ebay_marketplace
      setEbayConnected(connected)
      setEbayUsername((profile as any)?.ebay_username || name)
      setPlanName((profile as any)?.plan_name ?? 'Free')
      setSubStatus((profile as any)?.subscription_status ?? 'inactive')

      const { count: oCount } = await supabase.from('protected_orders')
        .select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      const ordersCnt = oCount || 0
      setOrdersCount(ordersCnt)

      const { data: orders } = await supabase.from('protected_orders')
        .select('item_title, created_at, risk_level').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(6)
      setActivity((orders || []).map((o: any) => ({
        icon: ShoppingBag, color: C.blue,
        title: `New order: ${(o.item_title || 'Item').substring(0, 40)}${(o.item_title || '').length > 40 ? '...' : ''}`,
        timeAgoStr: o.created_at ? timeAgo(o.created_at) : '—',
        tag: (o.risk_level || '').toUpperCase() === 'HIGH' ? 'HIGH RISK' : undefined,
        tagColor: C.red,
      })))

      const { data: rawToolData } = await (supabase.from('user_tool_usage') as any)
        .select('*').eq('user_id', user.id)
      const toolData = (rawToolData || []) as any[]
      for (const t of toolData) {
        if (t.tool_name === 'product_research')   { setProductScans(t.usage_count || 0); setProductLimit(t.usage_limit || 100) }
        if (t.tool_name === 'competitor_research') { setCompetitorCount(t.usage_count || 0); setCompetitorLimit(t.usage_limit || 50) }
      }
      setToolUsage(toolData)

      const { count: apiCount } = await (supabase.from('api_fleet_config') as any)
        .select('*', { count: 'exact', head: true }).eq('status', 'connected')
      const hasApiKeys = (apiCount || 0) > 0
      const pStatus = (profile as any)?.subscription_status ?? 'inactive'
      const pName   = (profile as any)?.plan_name ?? 'Free'

      const checks: HealthCheckItem[] = []
      let score = 0
      if (connected)                                       { score += 20; checks.push({ label: 'eBay Store Connected',  passed: true,  pts: '+20pts' }) }
      else                                                 {              checks.push({ label: 'eBay Not Connected',    passed: false, pts: '0pts'   }) }
      if (ordersCnt > 0)                                   { score += 15; checks.push({ label: 'Orders Being Tracked', passed: true,  pts: '+15pts' }) }
      else                                                 {              checks.push({ label: 'No Orders Synced',     passed: false, pts: '0pts'   }) }
      if (hasApiKeys)                                      { score += 20; checks.push({ label: 'API Keys Configured',  passed: true,  pts: '+20pts' }) }
      else                                                 {              checks.push({ label: 'API Keys Not Set',     passed: false, pts: '0pts'   }) }
      if (pStatus === 'active' || pStatus === 'trialing')  { score += 20; checks.push({ label: `${pName} Plan Active`, passed: true,  pts: '+20pts' }) }
      else                                                 {              checks.push({ label: 'No Active Plan',       passed: false, pts: '0pts'   }) }
      if (connected)                                       { score += 15; checks.push({ label: 'eBay Token Healthy',   passed: true,  pts: '+15pts' }) }
      else                                                 {              checks.push({ label: 'eBay Token Missing',   passed: false, pts: '0pts'   }) }
      setHealthScore(Math.min(100, Math.max(0, score)))
      setHealthChecks(checks)

    } catch (e) { console.error('Overview load error:', e) }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  async function handleSave() {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.auth.updateUser({ data: { full_name: editName, business_name: editBusiness, gender: editGender } })
      await supabase.from('profiles').update({ name: editName, gender: editGender } as never).eq('id', user.id)
      setUserName(editName); setUserGender(editGender)
      setAvatarUrl(user.user_metadata?.picture || buildAvatarUrl(userEmail, editGender))
      setIsEditing(false); toast.saved()
    } catch { toast.error('Failed to save profile') }
    finally { setIsSaving(false) }
  }

  const toolConfig: Record<string, { label: string; color: string }> = {
    product_research:    { label: 'Product Research',   color: C.blue   },
    competitor_research: { label: 'Competitor Research', color: C.orange },
    deep_dive_analysis:  { label: 'Deep Dive Analysis',  color: C.purple },
    title_builder:       { label: 'Title Builder',       color: C.green  },
  }

  const planBadge: Record<string, { text: string; bg: string; color: string }> = {
    'Free':       { text: 'Free Plan',  bg: C.bg,                       color: C.muted   },
    'Free Trial': { text: 'Free Trial', bg: 'rgba(99,102,241,0.1)',      color: '#6366f1' },
    'Starter':    { text: 'Starter',    bg: 'rgba(59,130,246,0.1)',      color: C.blue    },
    'Growth':     { text: 'Growth',     bg: 'rgba(143,255,0,0.15)',      color: C.limeD   },
    'Custom':     { text: 'Custom',     bg: 'rgba(245,158,11,0.1)',      color: '#D97706' },
  }
  const pb = planBadge[planName] ?? planBadge['Free']

  const subBadge = subStatus === 'active'    ? { text: 'Active',    bg: 'rgba(143,255,0,0.12)', color: C.limeD,  dot: C.lime    }
                 : subStatus === 'trialing'  ? { text: 'Trial',     bg: 'rgba(99,102,241,0.1)', color: '#6366f1', dot: '#6366f1' }
                 : subStatus === 'past_due'  ? { text: 'Past Due',  bg: 'rgba(255,77,106,0.1)', color: C.red,    dot: C.red     }
                 : subStatus === 'cancelled' ? { text: 'Cancelled', bg: 'rgba(255,77,106,0.1)', color: C.red,    dot: C.red     }
                 : null

  const userInitials = getInitials(userName)

  if (isLoading) return <PageSpinner />

  // ── MAIN VIEW ──────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5" style={{ fontFamily:'Inter,sans-serif' }}>

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor:'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsEditing(false) }}
        >
          <div
            className="w-full max-w-lg rounded-2xl shadow-2xl"
            style={{ backgroundColor:C.surface, border:`1px solid ${C.border}` }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:`1px solid ${C.border}` }}>
              <div className="flex items-center gap-2">
                <User size={16} style={{ color:C.dark }} />
                <span style={{ fontFamily:'Inter,sans-serif', fontSize:15, fontWeight:700, color:C.dark }}>Edit Profile</span>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={16} style={{ color:C.muted }} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor:C.lime }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    : <span style={{ fontSize:22, fontWeight:800, color:C.dark, fontFamily:'Inter,sans-serif' }}>{userInitials}</span>
                  }
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name"     value={editName}     onChange={setEditName}     icon={User}      />
                <Field label="Email Address" value={userEmail}                               icon={Mail}      readOnly />
                <Field label="Business Name" value={editBusiness} onChange={setEditBusiness} icon={Building2} />
                <div className="flex flex-col gap-2">
                  <label style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:700, color:C.dark }}>Gender</label>
                  <div className="relative">
                    <button onClick={() => setShowGender(!showGender)}
                      className="w-full h-[48px] px-4 rounded-xl border text-[14px] flex items-center justify-between"
                      style={{ fontFamily:'Inter,sans-serif', backgroundColor:C.bg, borderColor:C.border, color:C.dark }}>
                      <span>{editGender === 'Male' ? 'Male' : editGender === 'Female' ? 'Female' : 'Prefer not to say'}</span>
                      <ChevronDown size={16} style={{ color:C.muted }} />
                    </button>
                    {showGender && (
                      <div className="absolute top-[52px] left-0 right-0 z-20 rounded-xl border overflow-hidden" style={{ backgroundColor:C.surface, borderColor:C.border }}>
                        {[['Unspecified','Prefer not to say'],['Male','Male'],['Female','Female']].map(([v,l]) => (
                          <button key={v} onClick={() => { setEditGender(v); setShowGender(false) }}
                            className="w-full px-4 py-3 text-left text-[13px] transition-colors"
                            style={{ fontFamily:'Inter,sans-serif', backgroundColor: editGender === v ? C.lime : 'transparent', color:C.dark, fontWeight: editGender === v ? 700 : 500 }}>
                            {l}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop:`1px solid ${C.border}` }}>
              <button
                onClick={() => setIsEditing(false)}
                style={{ fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:600, color:C.muted }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl disabled:opacity-50"
                style={{ fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:700, backgroundColor:C.dark, color:C.lime }}
              >
                {isSaving && <RefreshCw size={13} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE HEADER — Lime accent ── */}
      <div
        className="w-full p-6 rounded-2xl"
        style={{ backgroundColor: C.limeTint, border: `1.5px solid rgba(143,255,0,0.4)` }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0"
            style={{ backgroundColor: C.dark, border: `2px solid ${C.lime}` }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              : <span style={{ fontSize:20, fontWeight:800, color:C.lime, fontFamily:'Inter,sans-serif' }}>{userInitials}</span>
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 style={{ fontFamily:'Inter,sans-serif', fontSize:18, fontWeight:800, color:C.dark, marginBottom:4 }}>
              {userName}
            </h2>
            <div style={{ fontFamily:'Inter,sans-serif', fontSize:12, color:C.muted, marginBottom:8 }}>
              {userEmail}
              {joinedDate && ` · ${joinedDate}`}
              {ebayConnected && ` · eBay Connected`}
            </div>
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:700, backgroundColor:C.lime, color:C.dark, padding:'3px 12px', borderRadius:20 }}
              >
                {pb.text}
              </span>
              {subBadge && (
                <span
                  className="flex items-center gap-1.5"
                  style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:700, backgroundColor:subBadge.bg, color:subBadge.color, padding:'3px 10px', borderRadius:20, border:`1px solid ${subBadge.dot}40` }}
                >
                  <span style={{ width:6, height:6, borderRadius:'50%', backgroundColor:subBadge.dot, display:'inline-block' }} />
                  {subBadge.text}
                </span>
              )}
              {ebayConnected && (
                <span
                  style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:600, backgroundColor:C.bg, color:C.muted, padding:'3px 10px', borderRadius:20, border:`1px solid ${C.border}` }}
                >
                  eBay Connected
                </span>
              )}
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all hover:opacity-80 shrink-0"
            style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:700, backgroundColor:C.dark, color:C.lime }}
          >
            <Edit size={13} />
            Edit Profile
          </button>
        </div>

        {/* eBay not connected warning */}
        {!ebayConnected && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mt-4"
            style={{ backgroundColor:'#FFF9E6', border:'1px solid #FCD34D' }}
          >
            <AlertTriangle size={15} style={{ color:'#F59E0B', flexShrink:0 }} />
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:500, color:'#92400E', flex:1 }}>
              Connect your eBay store to unlock full features
            </p>
            <button
              onClick={() => onTabChange?.(1)}
              style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:700, color:'#F59E0B' }}
            >
              Connect →
            </button>
          </div>
        )}
      </div>

      {/* ── STATS ROW — Icon cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: ShoppingBag, iconColor: C.blue,   iconBg: 'rgba(29,112,245,0.1)',  value: ordersCount.toString(),                   label: 'Orders Tracked',    sub: ebayConnected ? 'Auto-syncing' : 'Connect eBay', bar: null },
          { icon: Search,      iconColor: C.green,  iconBg: 'rgba(0,196,140,0.1)',   value: `${productScans}/${productLimit}`,         label: 'Product Research',  sub: 'Searches used',  bar: { val: productScans / (productLimit || 1), color: productScans / (productLimit || 1) > 0.8 ? C.red : C.green } },
          { icon: Store,       iconColor: C.orange, iconBg: 'rgba(255,184,0,0.1)',   value: `${competitorCount}/${competitorLimit}`,   label: 'Competitor Scans',  sub: 'Stores analyzed', bar: { val: competitorCount / (competitorLimit || 1), color: competitorCount / (competitorLimit || 1) > 0.8 ? C.red : C.orange } },
          { icon: Shield,      iconColor: C.purple, iconBg: 'rgba(139,92,246,0.1)',  value: '—',                                      label: 'Safe Sourcing',     sub: 'Low-risk buyers', bar: null },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-2xl" style={{ backgroundColor:C.surface, border:`1px solid ${C.border}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor:s.iconBg }}>
                <s.icon size={18} style={{ color:s.iconColor }} />
              </div>
              <span style={{ fontFamily:'Inter,sans-serif', fontSize:20, fontWeight:800, color:C.dark }}>{s.value}</span>
            </div>
            {s.bar && (
              <div className="h-1 rounded-full mb-2" style={{ backgroundColor:C.border }}>
                <div className="h-full rounded-full" style={{ width:`${Math.min(100, s.bar.val * 100)}%`, backgroundColor:s.bar.color, transition:'width 0.5s ease' }} />
              </div>
            )}
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:600, color:C.dark }}>{s.label}</p>
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:11, color:C.muted, marginTop:2 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── ACTIVITY + USAGE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent Activity */}
        <div className="lg:col-span-3 p-5 rounded-2xl" style={{ backgroundColor:C.surface, border:`1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History size={15} style={{ color:C.muted }} />
              <h3 style={{ fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:700, color:C.dark }}>Recent Activity</h3>
            </div>
            <button onClick={loadAll} className="hover:opacity-70 transition-opacity">
              <RefreshCw size={14} style={{ color:C.muted }} />
            </button>
          </div>
          {activity.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <History size={36} style={{ color:C.border }} />
              <p style={{ fontFamily:'Inter,sans-serif', fontSize:13, color:C.muted }}>No activity yet</p>
              <p style={{ fontFamily:'Inter,sans-serif', fontSize:11, color:C.muted }}>Start using your tools to see activity</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {activity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom: i < activity.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + '1A' }}>
                    <item.icon size={15} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:600, color:C.dark }}>{item.title}</p>
                    {item.tag && (
                      <span style={{ fontFamily:'Inter,sans-serif', fontSize:9, fontWeight:700, backgroundColor:(item.tagColor||C.red)+'1A', color:item.tagColor||C.red, padding:'2px 6px', borderRadius:4, display:'inline-block', marginTop:2 }}>
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, color:C.muted, flexShrink:0 }}>{item.timeAgoStr}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column — Health + Usage */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Account Health */}
          <div className="p-5 rounded-2xl" style={{ backgroundColor:C.surface, border:`1px solid ${C.border}` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={15} style={{ color:C.muted }} />
                <h3 style={{ fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:700, color:C.dark }}>Account Health</h3>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily:'Inter,sans-serif', fontSize:22, fontWeight:800, color:healthScore >= 80 ? C.limeD : healthScore >= 60 ? C.orange : C.red }}>{healthScore}</span>
                <span style={{ fontFamily:'Inter,sans-serif', fontSize:11, color:C.muted }}>/100</span>
                <span style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:700, backgroundColor: healthScore >= 80 ? 'rgba(143,255,0,0.12)' : 'rgba(255,184,0,0.12)', color: healthScore >= 80 ? C.limeD : C.orange, padding:'2px 8px', borderRadius:20 }}>
                  {healthLabel}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {healthChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-2">
                  {check.passed
                    ? <CheckCircle size={13} style={{ color:C.lime, flexShrink:0 }} />
                    : <AlertTriangle size={13} style={{ color:C.orange, flexShrink:0 }} />
                  }
                  <span style={{ fontFamily:'Inter,sans-serif', fontSize:11, color: check.passed ? C.muted : C.dark, fontWeight: check.passed ? 400 : 600, flex:1 }}>{check.label}</span>
                  <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:700, color: check.passed ? C.limeD : C.orange }}>{check.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* This Month's Usage */}
          <div className="p-5 rounded-2xl" style={{ backgroundColor:C.surface, border:`1px solid ${C.border}` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 size={15} style={{ color:C.muted }} />
                <h3 style={{ fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:700, color:C.dark }}>This Month's Usage</h3>
              </div>
              <button onClick={() => onTabChange?.(2)} style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:600, color:C.blue }}>
                Details →
              </button>
            </div>
            {toolUsage.filter(t => toolConfig[t.tool_name]).length === 0 ? (
              <p style={{ fontFamily:'Inter,sans-serif', fontSize:13, color:C.muted, textAlign:'center', padding:'16px 0' }}>Start using tools to see stats</p>
            ) : (
              <div className="flex flex-col gap-4">
                {toolUsage.filter(t => toolConfig[t.tool_name]).map((tool, i) => {
                  const config = toolConfig[tool.tool_name]
                  const used   = tool.usage_count || 0
                  const limit  = tool.usage_limit || 100
                  const pct    = Math.min(1, used / (limit || 1))
                  const color  = pct > 0.8 ? C.red : config.color
                  return (
                    <div key={i}>
                      <div className="flex justify-between mb-1.5">
                        <span style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:500, color:C.muted }}>{config.label}</span>
                        <span style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:700, color:C.dark }}>{used}/{limit}</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ backgroundColor:C.border }}>
                        <div className="h-full rounded-full" style={{ width:`${pct*100}%`, backgroundColor:color, transition:'width 0.5s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}