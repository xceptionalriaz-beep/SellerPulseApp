'use client'
'use client'
// app/dashboard/profile/tabs/OverviewTab.tsx
// Converted from: lib/user_profile/tabs/overview_tab.dart
// Sections: 1. Profile Header + eBay Status  2. Quick Stats
//           3. Recent Activity + Account Health Score  4. Plan Usage Mini

import { useState, useEffect, useCallback } from 'react'
import { ShoppingBag, Search, Store, Shield, BarChart2, History,
  RefreshCw, CheckCircle, AlertTriangle, Edit, User, Mail,
  Building2, ChevronDown } from 'lucide-react'
import { PageSpinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/AppToast'
import { cn, timeAgo } from '@/lib/utils'

const C = {
  bg:'#F4F7FA', surface:'#FFFFFF', navy:'#0F172A', navy2:'#1E293B',
  accent:'#8FFF00', accentD:'#E8FFB0', txt1:'#0F172A', txt2:'#64748B',
  txt3:'#94A3B8', border:'#E2E8F0', green:'#00C48C', orange:'#FFB800',
  red:'#FF4D6A', blue:'#1D70F5',
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('w-full p-5 bg-white rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.04)]', className)}>
      {children}
    </div>
  )
}

function Badge({ icon: Icon, text, bg, color }: { icon: React.ElementType; text: string; bg: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold" style={{ backgroundColor: bg, color }}>
      <Icon size={11} />{text}
    </span>
  )
}

function StatCard({ icon: Icon, iconBg, iconColor, value, label, sub, showBar, barValue, barColor }: {
  icon: React.ElementType; iconBg: string; iconColor: string; value: string
  label: string; sub: string; showBar?: boolean; barValue?: number; barColor?: string
}) {
  return (
    <div className="flex flex-col p-4 bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <span className="text-[18px] font-bold" style={{ color: C.txt1, fontFamily: 'var(--font-space-grotesk)' }}>{value}</span>
      </div>
      {showBar && barValue !== undefined && (
        <div className="h-1 rounded-full mb-2" style={{ backgroundColor: C.border }}>
          <div className="h-full rounded-full transition-all duration-500"
               style={{ width: `${Math.min(100, barValue * 100)}%`, backgroundColor: barColor || C.green }} />
        </div>
      )}
      <p className="text-[11px] font-semibold" style={{ color: C.txt2 }}>{label}</p>
      <p className="text-[10px] mt-0.5" style={{ color: C.txt3 }}>{sub}</p>
    </div>
  )
}

function Field({ label, value, onChange, icon: Icon, readOnly }: {
  label: string; value: string; onChange?: (v: string) => void; icon: React.ElementType; readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] font-bold text-[#1E293B]">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={value} onChange={e => onChange?.(e.target.value)} readOnly={readOnly}
          className={cn('w-full h-[50px] pl-10 pr-4 rounded-[10px] border text-[14px] outline-none transition-all',
            readOnly ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                     : 'bg-[#F8FAFC] text-black border-gray-300 focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10')} />
      </div>
    </div>
  )
}

interface ActivityItem { icon: React.ElementType; color: string; title: string; timeAgoStr: string; tag?: string; tagColor?: string }
interface HealthCheckItem { label: string; passed: boolean; pts: string }

export default function OverviewTab({ onTabChange }: { onTabChange?: (i: number) => void }) {
  const supabase = createClient()
  const toast = useToast()

  const [userName, setUserName]       = useState('Seller')
  const [userEmail, setUserEmail]     = useState('')
  const [userGender, setUserGender]   = useState('Unspecified')
  const [joinedDate, setJoinedDate]   = useState('')
  const [avatarUrl, setAvatarUrl]     = useState<string | null>(null)
  const [isEditing, setIsEditing]     = useState(false)
  const [isSaving, setIsSaving]       = useState(false)
  const [isLoading, setIsLoading]     = useState(true)
  const [showGender, setShowGender]   = useState(false)
  const [editName, setEditName]       = useState('')
  const [editBusiness, setEditBusiness] = useState('')
  const [editGender, setEditGender]   = useState('Unspecified')
  const [ordersCount, setOrdersCount] = useState(0)
  const [productScans, setProductScans]     = useState(0)
  const [productLimit, setProductLimit]     = useState(100)
  const [competitorCount, setCompetitorCount] = useState(0)
  const [competitorLimit, setCompetitorLimit] = useState(50)
  const [safeSourcing, setSafeSourcing]     = useState(0)
  const [ebayConnected, setEbayConnected]   = useState(false)
  const [ebayUsername, setEbayUsername]     = useState('')
  const [ebayOrdersSync, setEbayOrdersSync] = useState(0)
  const [activity, setActivity]       = useState<ActivityItem[]>([])
  const [healthScore, setHealthScore] = useState(0)
  const [healthChecks, setHealthChecks] = useState<HealthCheckItem[]>([])
  const [toolUsage, setToolUsage]     = useState<any[]>([])

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

  const healthColor = healthScore >= 80 ? C.green : healthScore >= 60 ? C.orange : C.red
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

      const { count: oCount } = await supabase.from('protected_orders')
        .select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      const ordersCnt = oCount || 0
      setOrdersCount(ordersCnt)

      const { data: orders } = await supabase.from('protected_orders')
        .select('item_title, created_at, risk_level').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(6)
      setActivity((orders || []).map((o: any) => ({
        icon: ShoppingBag, color: C.blue,
        title: `New order: ${(o.item_title || 'Item').substring(0, 35)}${(o.item_title || '').length > 35 ? '...' : ''}`,
        timeAgoStr: o.created_at ? timeAgo(o.created_at) : '—',
        tag: (o.risk_level || '').toUpperCase() === 'HIGH' ? 'HIGH RISK' : undefined,
        tagColor: C.red,
      })))

      const { data: rawToolData } = await supabase.from('user_tool_usage').select('*').eq('user_id', user.id)
      const toolData = (rawToolData || []) as any[]
      for (const t of toolData || []) {
        if (t.tool_name === 'product_research')   { setProductScans(t.usage_count || 0); setProductLimit(t.usage_limit || 100) }
        if (t.tool_name === 'competitor_research') { setCompetitorCount(t.usage_count || 0); setCompetitorLimit(t.usage_limit || 50) }
      }
      setToolUsage(toolData)

      const { data: profile } = await supabase.from('profiles').select('ebay_marketplace').eq('id', user.id).single() as any
      const connected = !!profile?.ebay_marketplace
      setEbayConnected(connected); setEbayUsername(name); setEbayOrdersSync(ordersCnt)

      // Build health score
      const checks: HealthCheckItem[] = []
      let score = 0
      if (connected) { score += 20; checks.push({ label: 'eBay Store Connected', passed: true, pts: '+20pts' }) }
      else { checks.push({ label: 'eBay Store Not Connected', passed: false, pts: '-20pts' }) }
      if (ordersCnt > 0) { score += 15; checks.push({ label: 'Orders Being Tracked', passed: true, pts: '+15pts' }) }
      else { checks.push({ label: 'No Orders Synced Yet', passed: false, pts: '0pts' }) }
      score += 20; checks.push({ label: 'API Keys Configured', passed: true, pts: '+20pts' })
      score += 20; checks.push({ label: 'Pro Plan Active', passed: true, pts: '+20pts' })
      if (connected) { score += 15; checks.push({ label: 'eBay Token Healthy', passed: true, pts: '+15pts' }) }
      setHealthScore(Math.min(100, Math.max(0, score))); setHealthChecks(checks)
    } catch (e) { console.error('Overview load error:', e) }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  async function handleSave() {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.auth.updateUser({ data: { full_name: editName, business_name: editBusiness, gender: editGender }})
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
    deep_dive_analysis:  { label: 'Deep Dive Analysis',  color: '#8B5CF6'},
    title_builder:       { label: 'Title Builder',       color: C.green  },
  }

  const userInitials = getInitials(userName)

  if (isLoading) return (
    <PageSpinner />
  )

  // ── EDIT VIEW ──────────────────────────────────────────────
  if (isEditing) return (
    <Card>
      <div className="flex items-center gap-2.5 mb-6">
        <User size={20} style={{ color: C.txt1 }} />
        <h2 className="text-[20px] font-bold" style={{ color: C.txt1, fontFamily: 'var(--font-space-grotesk)' }}>Edit Profile</h2>
      </div>
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: C.accent }}>
          {avatarUrl
            ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            : <span className="text-[28px] font-black" style={{ color: C.navy, fontFamily: 'var(--font-space-grotesk)' }}>{userInitials}</span>
          }
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Field label="Full Name"     value={editName}     onChange={setEditName}     icon={User}      />
        <Field label="Email Address" value={userEmail}                               icon={Mail}      readOnly />
        <Field label="Business Name" value={editBusiness} onChange={setEditBusiness} icon={Building2} />
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-bold text-[#1E293B]">Gender</label>
          <div className="relative">
            <button onClick={() => setShowGender(!showGender)}
              className="w-full h-[50px] px-4 rounded-[10px] border border-gray-300 bg-[#F8FAFC] text-[14px] text-black flex items-center justify-between">
              <span>{editGender === 'Male' ? 'Male' : editGender === 'Female' ? 'Female' : 'Prefer not to say'}</span>
              <ChevronDown size={18} className="text-[#94A3B8]" />
            </button>
            {showGender && (
              <div className="absolute top-[54px] left-0 right-0 z-20 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                {[['Unspecified','Prefer not to say'],['Male','Male'],['Female','Female']].map(([v,l]) => (
                  <button key={v} onClick={() => { setEditGender(v); setShowGender(false) }}
                    className="w-full px-4 py-3 text-left text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors"
                    style={{ backgroundColor: editGender === v ? C.accent : 'transparent', color: editGender === v ? 'black' : C.navy2, fontWeight: editGender === v ? 700 : 500 }}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-[13px] font-bold text-gray-500 hover:text-dark">Cancel</button>
        <button onClick={handleSave} disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-[10px] text-white text-[13px] font-bold disabled:opacity-50"
          style={{ backgroundColor: C.navy }}>
          {isSaving && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
          Save Changes
        </button>
      </div>
    </Card>
  )

  // ── MAIN VIEW ──────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* Section 1: Profile Card */}
      <Card>
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0"
               style={{ backgroundColor: C.accent, border: `3px solid ${ebayConnected ? C.accent + '99' : C.border}` }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              : <span className="text-[28px] font-black" style={{ color: C.navy, fontFamily: 'var(--font-space-grotesk)' }}>{userInitials}</span>
            }
          </div>
          <div className="flex-1 min-w-[200px]">
            <h2 className="text-[22px] font-bold mb-2" style={{ color: C.txt1, fontFamily: 'var(--font-space-grotesk)' }}>{userName}</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge icon={Shield}       text="Pro Member"  bg="#FFF9E6" color="#D97706" />
              {joinedDate && <Badge icon={User} text={joinedDate} bg="#F1F5F9" color={C.txt2} />}
              <Badge icon={CheckCircle}  text="Active Sub"  bg="#EBF6D4" color="#16A34A" />
            </div>
            {userEmail && (
              <div className="flex items-center gap-1.5 mt-1">
                <Mail size={12} style={{ color: C.txt3 }} />
                <span className="text-[12px]" style={{ color: C.txt3 }}>{userEmail}</span>
              </div>
            )}
          </div>
          <button onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] text-[12px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
            <Edit size={13} />Edit Profile
          </button>
        </div>

        {/* eBay status */}
        {ebayConnected ? (
          <div className="mt-5 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: C.navy }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center border"
                 style={{ backgroundColor: C.accent + '26', borderColor: C.accent + '66' }}>
              <Store size={15} style={{ color: C.accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-white">{ebayUsername}</span>
                <CheckCircle size={12} className="text-blue-400" />
              </div>
              <span className="text-[11px] text-gray-400">{ebayOrdersSync} orders · Recently</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                 style={{ backgroundColor: C.accent + '26', borderColor: C.accent + '66' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.accent }} />
              <span className="text-[10px] font-bold" style={{ color: C.accent }}>Connected</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border"
               style={{ backgroundColor: '#FFF9E6', borderColor: '#FCD34D' }}>
            <AlertTriangle size={17} className="text-orange-500 shrink-0" />
            <p className="flex-1 text-[13px] font-medium" style={{ color: '#9A3412' }}>
              Connect your eBay store to unlock full features
            </p>
            <button onClick={() => onTabChange?.(1)} className="text-[12px] font-bold text-orange-500 hover:underline shrink-0">
              Connect →
            </button>
          </div>
        )}
      </Card>

      {/* Section 2: Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={ShoppingBag} iconBg={C.blue + '1A'} iconColor={C.blue}
          value={ordersCount.toString()} label="Orders Tracked" sub={ebayConnected ? 'Auto-syncing' : 'Connect eBay'} />
        <StatCard icon={Search} iconBg={C.green + '1A'} iconColor={C.green}
          value={`${productScans}/${productLimit}`} label="Product Research" sub="Searches used"
          showBar barValue={productLimit > 0 ? productScans / productLimit : 0}
          barColor={productScans / (productLimit || 1) > 0.8 ? C.red : C.green} />
        <StatCard icon={Store} iconBg={C.orange + '1A'} iconColor={C.orange}
          value={`${competitorCount}/${competitorLimit}`} label="Competitor Scans" sub="Stores analyzed"
          showBar barValue={competitorLimit > 0 ? competitorCount / competitorLimit : 0}
          barColor={competitorCount / (competitorLimit || 1) > 0.8 ? C.red : C.orange} />
        <StatCard icon={Shield} iconBg="#8B5CF61A" iconColor="#8B5CF6"
          value={safeSourcing > 0 ? `${safeSourcing.toFixed(0)}%` : '—'}
          label="Safe Sourcing" sub="Low-risk buyers" />
      </div>

      {/* Section 3: Activity + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History size={15} style={{ color: C.txt3 }} />
              <h3 className="text-[14px] font-bold" style={{ color: C.txt1 }}>Recent Activity</h3>
            </div>
            <button onClick={loadAll} className="text-[#94A3B8] hover:text-dark transition-colors"><RefreshCw size={14} /></button>
          </div>
          {activity.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <History size={38} className="text-gray-200" />
              <p className="text-[13px]" style={{ color: C.txt3 }}>No activity yet</p>
              <p className="text-[11px]" style={{ color: C.txt3 }}>Start using your tools to see activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                       style={{ backgroundColor: item.color + '1A' }}>
                    <item.icon size={15} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate" style={{ color: C.txt1 }}>{item.title}</p>
                    {item.tag && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold"
                            style={{ backgroundColor: (item.tagColor || C.red) + '1A', color: item.tagColor || C.red }}>
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: C.txt3 }}>{item.timeAgoStr}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={15} style={{ color: C.txt3 }} />
            <h3 className="text-[14px] font-bold" style={{ color: C.txt1 }}>Account Health</h3>
          </div>
          <div className="flex justify-center mb-2">
            <div className="relative w-[90px] h-[90px]">
              <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
                <circle cx="45" cy="45" r="35" fill="none" stroke={C.border} strokeWidth="8" />
                <circle cx="45" cy="45" r="35" fill="none" stroke={healthColor} strokeWidth="8"
                  strokeDasharray={`${(healthScore / 100) * 220} 220`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[24px] font-extrabold leading-none" style={{ color: healthColor, fontFamily: 'var(--font-space-grotesk)' }}>{healthScore}</span>
                <span className="text-[10px]" style={{ color: C.txt3 }}>/ 100</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center mb-5">
            <span className="px-3 py-1 rounded-full text-[12px] font-bold" style={{ backgroundColor: healthColor + '1A', color: healthColor }}>{healthLabel}</span>
          </div>
          <div className="space-y-2.5">
            {healthChecks.map((check, i) => (
              <div key={i} className="flex items-center gap-2">
                {check.passed ? <CheckCircle size={13} style={{ color: C.green }} /> : <AlertTriangle size={13} style={{ color: C.orange }} />}
                <span className="flex-1 text-[11px]" style={{ color: check.passed ? C.txt2 : C.txt1, fontWeight: check.passed ? 400 : 600 }}>{check.label}</span>
                <span className="text-[10px] font-bold" style={{ color: check.passed ? C.green : C.orange }}>{check.pts}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Section 4: Plan Usage Mini */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={15} style={{ color: C.txt3 }} />
            <h3 className="text-[14px] font-bold" style={{ color: C.txt1 }}>This Month&apos;s Usage</h3>
          </div>
          <button onClick={() => onTabChange?.(2)} className="text-[12px] font-semibold hover:underline" style={{ color: C.blue }}>
            View Details →
          </button>
        </div>
        {toolUsage.filter(t => toolConfig[t.tool_name]).length === 0 ? (
          <p className="text-center text-[13px] py-4" style={{ color: C.txt3 }}>Start using tools to see usage stats</p>
        ) : (
          <div className="space-y-4">
            {toolUsage.filter(t => toolConfig[t.tool_name]).map((tool, i) => {
              const config = toolConfig[tool.tool_name]
              const used = tool.usage_count || 0
              const limit = tool.usage_limit || 100
              const pct = Math.min(1, used / (limit || 1))
              const color = pct > 0.8 ? C.red : config.color
              return (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[12px] font-semibold" style={{ color: C.txt2 }}>{config.label}</span>
                    <span className="text-[12px] font-bold" style={{ color: C.txt1 }}>{used} / {limit}</span>
                  </div>
                  <div className="h-[5px] rounded-full" style={{ backgroundColor: C.border }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}