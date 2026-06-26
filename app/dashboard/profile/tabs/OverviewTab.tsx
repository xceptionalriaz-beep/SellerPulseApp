'use client'
// app/dashboard/profile/tabs/OverviewTab.tsx

import { useState, useEffect, useCallback } from 'react'
import {
  ShoppingBag, FileText, TrendingUp, Shield, BarChart2,
  RefreshCw, CheckCircle, AlertTriangle, Edit, User, Mail,
  Building2, ChevronDown, X, Check,
} from 'lucide-react'
import { PageSpinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/AppToast'
import UserAvatar from '@/components/ui/UserAvatar'

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

interface HealthCheckItem { label: string; passed: boolean; pts: string }

export default function OverviewTab({ onTabChange }: { onTabChange?: (i: number) => void }) {
  const supabase = createClient()
  const toast    = useToast()

  const [userName,        setUserName]        = useState('Seller')
  const [userEmail,       setUserEmail]       = useState('')
  const [userGender,      setUserGender]      = useState('Unspecified')
  const [joinedDate,      setJoinedDate]      = useState('')
  const [avatarUrl,       setAvatarUrl]       = useState<string | null>(null)
  const [userId,          setUserId]          = useState('')
  const [avatarStyle,     setAvatarStyle]     = useState('avataaars')
  const [isEditing,       setIsEditing]       = useState(false)
  const [isSaving,        setIsSaving]        = useState(false)
  const [isLoading,       setIsLoading]       = useState(true)
  const [showGender,      setShowGender]      = useState(false)
  const [editName,        setEditName]        = useState('')
  const [editBusiness,    setEditBusiness]    = useState('')
  const [editGender,      setEditGender]      = useState('Unspecified')
  const [ordersCount,     setOrdersCount]     = useState(0)
  const [ordersLimit,     setOrdersLimit]     = useState(-1)
  const [resetDate,       setResetDate]       = useState<string | null>(null)
  const [titlesCount,     setTitlesCount]     = useState(0)
  const [titlesLimit,     setTitlesLimit]     = useState(10)
  const [profitsCount,    setProfitsCount]    = useState(0)
  const [profitsLimit,    setProfitsLimit]    = useState(10)
  const [ebayConnected,   setEbayConnected]   = useState(false)
  const [ebayUsername,    setEbayUsername]    = useState('')
  const [healthScore,     setHealthScore]     = useState(0)
  const [healthChecks,    setHealthChecks]    = useState<HealthCheckItem[]>([])
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

  const healthColor = healthScore >= 80 ? C.lime : healthScore >= 60 ? C.orange : C.red
  const healthLabel = healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Needs Attention'

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      const name   = user.user_metadata?.full_name || 'Seller'
      const email  = user.email || ''
      const gender = user.user_metadata?.gender || 'Unspecified'
      const biz    = user.user_metadata?.business_name || ''
      setUserName(name); setUserEmail(email); setUserGender(gender)
      setJoinedDate(formatJoinDate(user.created_at))
      setAvatarUrl(user.user_metadata?.picture ?? null)
      setEditName(name); setEditBusiness(biz); setEditGender(gender)

      const { data: profile } = await (supabase.from('profiles') as any)
        .select('ebay_marketplace, plan_name, subscription_status, ebay_username, ebay_access_token, avatar_url')
        .eq('id', user.id).single()
      const connected = !!(profile as any)?.ebay_marketplace && !!(profile as any)?.ebay_access_token
      setEbayConnected(connected)
      setEbayUsername((profile as any)?.ebay_username || name)
      if ((profile as any)?.avatar_url) setAvatarStyle((profile as any).avatar_url)
      setPlanName((profile as any)?.plan_name ?? 'Free')
      setSubStatus((profile as any)?.subscription_status ?? 'inactive')

      const { count: oCount } = await supabase.from('protected_orders')
        .select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      const ordersCnt = oCount || 0
      setOrdersCount(ordersCnt)

      const { data: rawToolData } = await (supabase.from('user_tool_usage') as any)
        .select('*').eq('user_id', user.id)
      const toolData = (rawToolData || []) as any[]
      for (const t of toolData) {
        if (t.tool_name === 'title_builder')     { setTitlesCount(t.usage_count || 0); if (t.reset_date) setResetDate(t.reset_date) }
        if (t.tool_name === 'profit_calculator') { setProfitsCount(t.usage_count || 0) }
      }

      // Load real limits from plan_limits table
      const pNameForLimits = ((profile as any)?.plan_name ?? 'Free').toLowerCase()
      const { data: planLimits } = await (supabase.from('plan_limits') as any)
        .select('max_title_generations, max_profit_calcs, max_orders_protected')
        .eq('tier', pNameForLimits)
        .maybeSingle()
      if (planLimits) {
        setTitlesLimit((planLimits as any).max_title_generations ?? 10)
        setProfitsLimit((planLimits as any).max_profit_calcs ?? 10)
      }

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
      await (supabase.from('profiles') as any).update({ name: editName, gender: editGender, avatar_url: avatarStyle }).eq('id', user.id)
      setUserName(editName); setUserGender(editGender)
      setAvatarUrl(user.user_metadata?.picture ?? null)
      setIsEditing(false); toast.saved()
    } catch { toast.error('Failed to save profile') }
    finally { setIsSaving(false) }
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

      {/* ── TWO COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">

      {/* ── PROFILE CARD — left (3 cols) ── */}
      <div className="lg:col-span-3 rounded-2xl" style={{ backgroundColor:C.surface, border:`1px solid ${C.border}` }}>

        {/* Header row */}
        <div className="flex items-center gap-4 px-6 py-5" style={{ backgroundColor:C.bg, borderBottom:`1px solid ${C.border}` }}>
          {/* Avatar */}
          <UserAvatar
            name={userName}
            userId={userId}
            email={userEmail}
            gender={userGender}
            photoUrl={avatarUrl}
            avatarStyle={avatarStyle}
            size={48}
          />

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:16, fontWeight:700, color:C.dark, marginBottom:3 }}>{userName}</p>
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:12, color:C.muted }}>{joinedDate}</p>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            <span style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:700, backgroundColor:C.lime, color:C.dark, padding:'3px 12px', borderRadius:20 }}>
              {planName}
            </span>
            {subStatus === 'active' && (
              <span className="flex items-center gap-1.5" style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:600, backgroundColor:'rgba(143,255,0,0.1)', color:C.limeD, padding:'3px 10px', borderRadius:20, border:`1px solid rgba(143,255,0,0.3)` }}>
                <span style={{ width:5, height:5, borderRadius:'50%', backgroundColor:C.lime, display:'inline-block' }} />
                Active
              </span>
            )}
          </div>

          {/* Edit button */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl hover:opacity-80 transition-opacity"
              style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:600, color:C.dark, backgroundColor:C.surface, border:`1px solid ${C.border}` }}
            >
              <Edit size={13} />
              Edit profile
            </button>
          )}
        </div>

        {/* Profile fields — view mode */}
        {!isEditing && (
          <>
            <div className="flex items-center px-6 py-3.5" style={{ borderBottom:`1px solid ${C.border}` }}>
              <div className="flex items-center gap-2" style={{ width:160, flexShrink:0 }}>
                <User size={14} style={{ color:C.muted }} />
                <span style={{ fontFamily:'Inter,sans-serif', fontSize:12, color:C.muted }}>Full name</span>
              </div>
              <span style={{ fontFamily:'Inter,sans-serif', fontSize:13, color:C.dark }}>{userName}</span>
            </div>
            <div className="flex items-center px-6 py-3.5" style={{ borderBottom:`1px solid ${C.border}` }}>
              <div className="flex items-center gap-2" style={{ width:160, flexShrink:0 }}>
                <Mail size={14} style={{ color:C.muted }} />
                <span style={{ fontFamily:'Inter,sans-serif', fontSize:12, color:C.muted }}>Email</span>
              </div>
              <span style={{ fontFamily:'Inter,sans-serif', fontSize:13, color:C.dark }}>{userEmail}</span>
            </div>
            <div className="flex items-center px-6 py-3.5" style={{ borderBottom:`1px solid ${C.border}` }}>
              <div className="flex items-center gap-2" style={{ width:160, flexShrink:0 }}>
                <Building2 size={14} style={{ color:C.muted }} />
                <span style={{ fontFamily:'Inter,sans-serif', fontSize:12, color:C.muted }}>Business name</span>
              </div>
              <span style={{ fontFamily:'Inter,sans-serif', fontSize:13, color: editBusiness ? C.dark : C.muted }}>
                {editBusiness || 'Not set'}
              </span>
            </div>
            <div className="flex items-center px-6 py-3.5" style={{ borderBottom:`1px solid ${C.border}` }}>
              <div className="flex items-center gap-2" style={{ width:160, flexShrink:0 }}>
                <Shield size={14} style={{ color:C.muted }} />
                <span style={{ fontFamily:'Inter,sans-serif', fontSize:12, color:C.muted }}>eBay store</span>
              </div>
              {ebayConnected
                ? <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:700, color:C.dark, backgroundColor:C.lime }}>
                    <span style={{ width:18, height:18, borderRadius:'50%', backgroundColor:C.dark, display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Check size={11} strokeWidth={3} style={{ color:C.lime }} />
                    </span>
                    Connected
                  </span>
                : <div className="flex items-center gap-3">
                    <span style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:600, color:'#92400E', backgroundColor:'#FFF9E6', border:'1px solid #FCD34D', padding:'3px 10px', borderRadius:20 }}>
                      Not connected
                    </span>
                    <button
                      onClick={() => onTabChange?.(1)}
                      style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:600, color:C.blue }}
                    >
                      Connect store →
                    </button>
                  </div>
              }
            </div>
            <div className="flex items-center px-6 py-3.5">
              <div className="flex items-center gap-2" style={{ width:160, flexShrink:0 }}>
                <RefreshCw size={14} style={{ color:C.muted }} />
                <span style={{ fontFamily:'Inter,sans-serif', fontSize:12, color:C.muted }}>Subscription</span>
              </div>
              <span style={{ fontFamily:'Inter,sans-serif', fontSize:13, color:C.dark }}>
                {planName} &middot; {subStatus === 'active' ? 'Active' : subStatus}
              </span>
            </div>
          </>
        )}

        {/* Edit mode */}
        {isEditing && (
          <div className="px-6 py-5">

            {/* Avatar style picker */}
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:700, color:'#0a0d08', marginBottom:10 }}>Choose Avatar</p>
            <div className="flex gap-3 overflow-x-auto pb-3 mb-5">
              {[
                { key:'avataaars',   label:'Classic',   bg:'b6e3f4' },
                { key:'big-smile',   label:'Smile',     bg:'ffd5dc' },
                { key:'adventurer',  label:'Adventure', bg:'c0aede' },
                { key:'notionists',  label:'Notion',    bg:'d1fae5' },
                { key:'lorelei',     label:'Lorelei',   bg:'ffdfbf' },
                { key:'micah',       label:'Micah',     bg:'dbeafe' },
                { key:'open-peeps',  label:'Peeps',     bg:'fde68a' },
                { key:'personas',    label:'Persona',   bg:'e0e7ff' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => setAvatarStyle(s.key)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                  style={{ flexShrink:0, minWidth:84, border:`2px solid ${avatarStyle===s.key?'#8fff00':'#e8ede2'}`, backgroundColor:avatarStyle===s.key?'#f4ffe6':'#ffffff' }}
                >
                  <img
                    src={`https://api.dicebear.com/9.x/${s.key}/svg?seed=${encodeURIComponent(userId||userEmail||userName)}&backgroundColor=${s.bg}&backgroundType=solid`}
                    alt={s.label}
                    style={{ width:52, height:52, borderRadius:'50%' }}
                  />
                  <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:600, color:avatarStyle===s.key?'#4a8f00':'#8a9e78' }}>{s.label}</span>
                </button>
              ))}
            </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <Field label="Full Name"     value={editName}     onChange={setEditName}     icon={User}      />
              <Field label="Email Address" value={userEmail}                               icon={Mail}      readOnly />
              <Field label="Business Name" value={editBusiness} onChange={setEditBusiness} icon={Building2} />
              <div className="flex flex-col gap-2">
                <label style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:700, color:C.dark }}>Gender</label>
                <div className="relative">
                  <button
                    onClick={() => setShowGender(!showGender)}
                    className="w-full h-[48px] px-4 rounded-xl border text-[14px] flex items-center justify-between"
                    style={{ fontFamily:'Inter,sans-serif', backgroundColor:C.bg, borderColor:C.border, color:C.dark }}
                  >
                    <span>{editGender === 'Male' ? 'Male' : editGender === 'Female' ? 'Female' : 'Prefer not to say'}</span>
                    <ChevronDown size={16} style={{ color:C.muted }} />
                  </button>
                  {showGender && (
                    <div className="absolute top-[52px] left-0 z-20 rounded-xl border shadow-md" style={{ backgroundColor:C.surface, borderColor:C.border, minWidth:160 }}>
                      {[['Unspecified','Prefer not to say'],['Male','Male'],['Female','Female']].map(([v,l]) => (
                        <button key={v} onClick={() => { setEditGender(v); setShowGender(false) }}
                          className="w-full px-3 py-2 text-left transition-colors"
                          style={{ fontFamily:'Inter,sans-serif', fontSize:12, backgroundColor: editGender === v ? C.lime : 'transparent', color:C.dark, fontWeight: editGender === v ? 700 : 400 }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
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
                Save changes
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── STATS — right (2 cols) ── */}
      <div className="lg:col-span-2 grid grid-cols-2 gap-3" style={{ gridTemplateRows:'1fr 1fr' }}>
        <div className="p-4 rounded-2xl flex flex-col justify-between" style={{ backgroundColor:C.surface, border:`1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor:'rgba(29,112,245,0.1)' }}>
              <ShoppingBag size={18} style={{ color:C.blue }} />
            </div>
            <span style={{ fontFamily:'Inter,sans-serif', fontSize:20, fontWeight:800, color:C.dark }}>
              {ordersLimit === -1 ? ordersCount : `${ordersCount}/${ordersLimit}`}
            </span>
          </div>
          {ordersLimit !== -1 && (
            <div className="h-1 rounded-full mb-2" style={{ backgroundColor:C.border }}>
              <div className="h-full rounded-full" style={{ width:`${Math.min(100,(ordersCount/(ordersLimit||1))*100)}%`, backgroundColor:ordersCount/(ordersLimit||1)>0.8?C.red:C.blue, transition:'width 0.5s ease' }} />
            </div>
          )}
          <div>
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:600, color:C.dark }}>Orders Tracked</p>
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:11, color:ordersLimit===-1?C.limeD:C.muted, marginTop:2 }}>{ordersLimit===-1?'Unlimited':ebayConnected?'Auto-syncing':'Connect eBay'}</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl flex flex-col" style={{ backgroundColor:C.surface, border:`1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor:'rgba(0,196,140,0.1)' }}>
              <FileText size={18} style={{ color:C.green }} />
            </div>
            <span style={{ fontFamily:'Inter,sans-serif', fontSize:20, fontWeight:800, color:C.dark }}>
              {titlesLimit === -1 ? titlesCount : `${titlesCount}/${titlesLimit}`}
            </span>
          </div>
          {titlesLimit !== -1 && (
            <div className="h-1 rounded-full mb-2" style={{ backgroundColor:C.border }}>
              <div className="h-full rounded-full" style={{ width:`${Math.min(100,(titlesCount/(titlesLimit||1))*100)}%`, backgroundColor:titlesCount/(titlesLimit||1)>0.8?C.red:C.green, transition:'width 0.5s ease' }} />
            </div>
          )}
          <p style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:600, color:C.dark }}>Titles Built</p>
          <p style={{ fontFamily:'Inter,sans-serif', fontSize:11, color:titlesLimit===-1?C.limeD:C.muted, marginTop:2 }}>{titlesLimit===-1?'Unlimited':'Title builder usage'}</p>
        </div>
        <div className="p-4 rounded-2xl flex flex-col" style={{ backgroundColor:C.surface, border:`1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor:'rgba(255,184,0,0.1)' }}>
              <TrendingUp size={18} style={{ color:C.orange }} />
            </div>
            <span style={{ fontFamily:'Inter,sans-serif', fontSize:20, fontWeight:800, color:C.dark }}>
              {profitsLimit === -1 ? profitsCount : `${profitsCount}/${profitsLimit}`}
            </span>
          </div>
          {profitsLimit !== -1 && (
            <div className="h-1 rounded-full mb-2" style={{ backgroundColor:C.border }}>
              <div className="h-full rounded-full" style={{ width:`${Math.min(100,(profitsCount/(profitsLimit||1))*100)}%`, backgroundColor:profitsCount/(profitsLimit||1)>0.8?C.red:C.orange, transition:'width 0.5s ease' }} />
            </div>
          )}
          <p style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:600, color:C.dark }}>Profit Calcs</p>
          <p style={{ fontFamily:'Inter,sans-serif', fontSize:11, color:profitsLimit===-1?C.limeD:C.muted, marginTop:2 }}>{profitsLimit===-1?'Unlimited':'Calculator usage'}</p>
        </div>
        <div className="p-4 rounded-2xl flex flex-col" style={{ backgroundColor:C.surface, border:`1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor:'rgba(143,255,0,0.1)' }}>
              <Shield size={18} style={{ color:C.limeD }} />
            </div>
            <span style={{ fontFamily:'Inter,sans-serif', fontSize:20, fontWeight:800, color:healthScore>=80?C.limeD:healthScore>=60?C.orange:C.red }}>{healthScore}</span>
          </div>
          <p style={{ fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:600, color:C.dark }}>Account Score</p>
          <p style={{ fontFamily:'Inter,sans-serif', fontSize:11, color:healthScore>=80?C.limeD:C.orange, marginTop:2 }}>{healthLabel}</p>
        </div>
      </div>

      </div>{/* end two-column grid */}

      {/* ── TOOL USAGE ── */}
      <div className="w-full rounded-2xl overflow-hidden" style={{ backgroundColor:C.surface, border:`1px solid ${C.border}` }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:`1px solid ${C.border}` }}>
          <div className="flex items-center gap-2">
            <BarChart2 size={15} style={{ color:C.muted }} />
            <h3 style={{ fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:700, color:C.dark }}>Tool Usage</h3>
          </div>
          <div className="flex items-center gap-2">
            {resetDate && (() => {
              const days = Math.ceil((new Date(resetDate).getTime() - Date.now()) / 86400000)
              return days > 0 ? (
                <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:600, color:C.limeD, backgroundColor:C.limeTint, padding:'2px 8px', borderRadius:20 }}>
                  Resets in {days}d
                </span>
              ) : null
            })()}
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-5 px-5 py-2" style={{ borderBottom:`1px solid ${C.border}`, backgroundColor:C.bg }}>
          <div className="col-span-2" style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:700, color:C.muted, letterSpacing:'.06em' }}>TOOL</div>
          <div className="text-center" style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:700, color:C.muted, letterSpacing:'.06em' }}>USED</div>
          <div className="text-center" style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:700, color:C.muted, letterSpacing:'.06em' }}>LIMIT</div>
          <div className="text-center" style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:700, color:C.muted, letterSpacing:'.06em' }}>STATUS</div>
        </div>

        {/* Tool rows */}
        {[
          { icon: FileText,    color: C.green,  iconBg: 'rgba(0,196,140,0.1)',  label: 'Title Builder',     used: titlesCount,  limit: titlesLimit  },
          { icon: TrendingUp,  color: C.orange, iconBg: 'rgba(255,184,0,0.1)', label: 'Profit Calculator', used: profitsCount, limit: profitsLimit },
          { icon: ShoppingBag, color: C.blue,   iconBg: 'rgba(29,112,245,0.1)',label: 'eBay Orders',       used: ordersCount,  limit: ordersLimit  },
        ].map((tool, i) => {
          const isUnlimited = tool.limit === -1
          const remaining   = isUnlimited ? null : Math.max(0, tool.limit - tool.used)
          const pct         = isUnlimited ? 0 : Math.min(1, tool.used / (tool.limit || 1))
          const isAtLimit   = !isUnlimited && pct >= 1
          const isNear      = !isUnlimited && pct >= 0.8 && !isAtLimit
          const barColor    = isAtLimit ? C.red : isNear ? C.orange : tool.color

          return (
            <div key={i} style={{ borderBottom: i < 2 ? `1px solid ${C.border}` : 'none', backgroundColor: isAtLimit ? 'rgba(255,77,106,0.02)' : isNear ? 'rgba(255,184,0,0.02)' : 'transparent' }}>
              {/* Main row */}
              <div className="grid grid-cols-5 items-center px-5 py-3.5">
                {/* Tool name */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor:tool.iconBg }}>
                    <tool.icon size={15} style={{ color:tool.color }} />
                  </div>
                  <span style={{ fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:600, color:C.dark }}>{tool.label}</span>
                </div>
                {/* Used */}
                <div className="text-center">
                  <span style={{ fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:800, color:isAtLimit?C.red:C.dark }}>{tool.used}</span>
                </div>
                {/* Limit */}
                <div className="text-center">
                  {isUnlimited
                    ? <span style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:700, color:C.limeD, backgroundColor:C.limeTint, padding:'2px 8px', borderRadius:20 }}>Unlimited</span>
                    : <span style={{ fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:600, color:C.muted }}>{tool.limit}</span>
                  }
                </div>
                {/* Status */}
                <div className="flex justify-center">
                  {isUnlimited ? (
                    <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:600, color:C.limeD }}>No limit</span>
                  ) : isAtLimit ? (
                    <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:700, color:C.red, backgroundColor:'rgba(255,77,106,0.1)', padding:'2px 8px', borderRadius:20 }}>Limit hit</span>
                  ) : isNear ? (
                    <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:700, color:C.orange, backgroundColor:'rgba(255,184,0,0.1)', padding:'2px 8px', borderRadius:20 }}>{remaining} left</span>
                  ) : (
                    <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:600, color:C.muted }}>{remaining} left</span>
                  )}
                </div>
              </div>

              {/* Progress bar row — only for limited tools */}
              {!isUnlimited && (
                <div className="px-5 pb-3">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:C.border }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct*100}%`, backgroundColor:barColor }} />
                  </div>
                  {(isAtLimit || isNear) && (
                    <p style={{ fontFamily:'Inter,sans-serif', fontSize:10, color:isAtLimit?C.red:C.orange, marginTop:4, fontWeight:600 }}>
                      {isAtLimit ? 'You have reached your limit — upgrade your plan to continue.' : `You are ${(pct*100).toFixed(0)}% through your monthly limit.`}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── ACCOUNT HEALTH ── */}
      <div className="w-full p-5 rounded-2xl" style={{ backgroundColor:C.surface, border:`1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={15} style={{ color:C.muted }} />
            <h3 style={{ fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:700, color:C.dark }}>Account Health</h3>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily:'Inter,sans-serif', fontSize:22, fontWeight:800, color:healthScore>=80?C.limeD:healthScore>=60?C.orange:C.red }}>{healthScore}</span>
            <span style={{ fontFamily:'Inter,sans-serif', fontSize:11, color:C.muted }}>/100</span>
            <span style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:700, backgroundColor:healthScore>=80?'rgba(143,255,0,0.12)':'rgba(255,184,0,0.12)', color:healthScore>=80?C.limeD:C.orange, padding:'2px 8px', borderRadius:20 }}>
              {healthLabel}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {healthChecks.map((check, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl" style={{ backgroundColor:check.passed?'rgba(143,255,0,0.06)':'rgba(255,184,0,0.06)', border:`1px solid ${check.passed?'rgba(143,255,0,0.2)':'rgba(255,184,0,0.2)'}` }}>
              {check.passed
                ? <span style={{ width:18, height:18, borderRadius:'50%', backgroundColor:C.lime, display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Check size={11} strokeWidth={3} style={{ color:C.dark }} />
                  </span>
                : <AlertTriangle size={16} style={{ color:C.orange }} />
              }
              <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:600, color:check.passed?C.dark:C.dark, textAlign:'center', lineHeight:1.3 }}>{check.label}</span>
              <span style={{ fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:700, color:check.passed?C.limeD:C.orange }}>{check.pts}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}