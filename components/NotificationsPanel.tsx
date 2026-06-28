'use client'
// components/NotificationsPanel.tsx
// Converted 1:1 from lib/widgets/notifications_panel.dart
// Auto-detects admin vs user role â€” works everywhere

import { useState, useEffect } from 'react'
import {
  Bell, X, Clock, Shield, CreditCard, AlertTriangle,
  Ticket, TrendingUp, Bug, Power, UserPlus, CheckCheck,
  BellOff
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

const supabase = createClient()

const C = {
  dark:   '#131B2F',
  lime:   '#8FFF00',
  bg:     '#F8FAFC',
  white:  '#FFFFFF',
  border: '#E2E8F0',
  muted:  '#94A3B8',
  text:   '#64748B',
}

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface AppNotification {
  id:          string
  type:        string
  title:       string
  message:     string
  isRead:      boolean
  createdAt:   Date
  actionUrl?:  string
  ebayOrderId: string
}

interface NotifConfig {
  icon:  React.ElementType
  color: string
  label: string
}

// â”€â”€ Admin notification type config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ADMIN_TYPE_CONFIG: Record<string, NotifConfig> = {
  new_user:        { icon: UserPlus,    color: '#8B5CF6', label: 'New User'  },
  payment_failed:  { icon: CreditCard,  color: '#EF4444', label: 'Payment'   },
  api_limit:       { icon: AlertTriangle, color: '#F59E0B', label: 'API'     },
  new_ticket:      { icon: Ticket,      color: '#3B82F6', label: 'Ticket'    },
  high_risk_order: { icon: Shield,      color: '#EF4444', label: 'Risk'      },
  kill_switch:     { icon: Power,       color: '#EF4444', label: 'System'    },
  tool_spike:      { icon: TrendingUp,  color: '#8FFF00', label: 'Tools'     },
  new_bug:         { icon: Bug,         color: '#F59E0B', label: 'Bug'       },
}

// â”€â”€ User notification type config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const USER_TYPE_CONFIG: Record<string, NotifConfig> = {
  high_risk:     { icon: AlertTriangle, color: '#FF4D6A', label: 'High Risk' },
  ship_deadline: { icon: Clock,         color: '#FFB800', label: 'Deadline'  },
}

// â”€â”€ Time ago helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function timeAgo(d: Date): string {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m ago`
  if (hrs  < 24) return `${hrs}h ago`
  if (days < 7)  return `${days}d ago`
  const dt = new Date(d)
  return `${dt.getDate()}/${dt.getMonth()+1}`
}

// â”€â”€ Mock notifications (replaced by Supabase when deployed) â”€â”€
function getMockNotifications(isAdmin: boolean): AppNotification[] {
  if (isAdmin) return [
    { id: '1', type: 'new_user',        title: 'New user registered',        message: 'john@example.com just signed up for Pro.',          isRead: false, createdAt: new Date(Date.now() - 300000),   actionUrl: '/dashboard/admin', ebayOrderId: '' },
    { id: '2', type: 'payment_failed',  title: 'Payment failed',             message: 'Card declined for user sarah@example.com.',         isRead: false, createdAt: new Date(Date.now() - 900000),   actionUrl: '/dashboard/admin', ebayOrderId: '' },
    { id: '3', type: 'api_limit',       title: 'eBay API limit at 80%',      message: 'You have used 8,000 of 10,000 calls today.',        isRead: true,  createdAt: new Date(Date.now() - 3600000),  ebayOrderId: '' },
    { id: '4', type: 'new_ticket',      title: 'New support ticket',         message: 'User reports bug in title builder export.',         isRead: false, createdAt: new Date(Date.now() - 7200000),  ebayOrderId: '' },
    { id: '5', type: 'tool_spike',      title: 'Product Research spike',     message: '340% usage increase in the last hour.',            isRead: true,  createdAt: new Date(Date.now() - 10800000), ebayOrderId: '' },
    { id: '6', type: 'new_bug',         title: 'Bug reported',               message: 'Competitor scan crashes on mobile Safari.',         isRead: false, createdAt: new Date(Date.now() - 14400000), ebayOrderId: '' },
  ]
  return [
    { id: '7', type: 'high_risk',     title: 'High Risk Order #1234',   message: 'Buyer has 3 disputes in the last 30 days. Review before shipping.', isRead: false, createdAt: new Date(Date.now() - 600000),  ebayOrderId: 'ORD-1234567890' },
    { id: '8', type: 'ship_deadline', title: 'Ship by 5PM today',       message: 'Order #5678 â€” MacBook Charger. Estimated delivery in 3 days.',      isRead: false, createdAt: new Date(Date.now() - 1800000), ebayOrderId: 'ORD-5678901234' },
    { id: '9', type: 'ship_deadline', title: 'Deadline tomorrow 9AM',   message: 'Order #9012 â€” USB-C Cable 3-Pack. Customer paid for express.',      isRead: true,  createdAt: new Date(Date.now() - 86400000),ebayOrderId: 'ORD-9012345678' },
  ]
}

// â”€â”€ Section header (matches Dart _sectionHeader) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SectionHeader({ icon: Icon, title, subtitle, color }: {
  icon: React.ElementType; title: string; subtitle: string; color: string
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border mb-2"
         style={{ backgroundColor: color + '12', borderColor: color + '33' }}>
      <div className="rounded shrink-0" style={{ width: 4, height: 32, backgroundColor: color }} />
      <Icon size={14} style={{ color }} />
      <div>
        <p className="text-[13px] font-bold" style={{ color: C.dark }}>{title}</p>
        <p className="text-[11px]"           style={{ color: C.text }}>{subtitle}</p>
      </div>
    </div>
  )
}

// â”€â”€ Admin card (matches Dart _adminCard) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AdminCard({ n, config, onRead }: { n: AppNotification; config: NotifConfig; onRead: (id: string) => void }) {
  const Icon   = config.icon
  const isRead = n.isRead
  return (
    <div onClick={() => onRead(n.id)}
         className="flex gap-3 p-3.5 rounded-xl border mb-2 cursor-pointer transition-all"
         style={{
           backgroundColor: isRead ? C.white : config.color + '0D',
           borderColor:     isRead ? C.border : config.color + '40',
           borderWidth:     isRead ? 1 : 1.5,
         }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
           style={{ backgroundColor: config.color + '1F' }}>
        <Icon size={16} style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="flex-1 text-[13px] font-bold truncate" style={{ color: C.dark }}>{n.title}</p>
          {!isRead && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: config.color }} />}
        </div>
        <p className="text-[12px] mb-1.5 leading-snug" style={{ color: C.text }}>{n.message}</p>
        <div className="flex items-center gap-1.5">
          <Clock size={10} style={{ color: C.muted }} />
          <span className="text-[10px]" style={{ color: C.muted }}>{timeAgo(n.createdAt)}</span>
          {n.actionUrl && (
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: config.color + '1A', color: config.color }}>
              View â†’
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// â”€â”€ User card (matches Dart _userCard) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function UserCard({ n, onRead }: { n: AppNotification; onRead: (id: string) => void }) {
  const isHighRisk = n.type === 'high_risk'
  const color      = isHighRisk ? '#FF4D6A' : '#FFB800'
  const bgColor    = isHighRisk ? '#FFEE F1' : '#FFF8E1'
  const Icon       = isHighRisk ? AlertTriangle : Clock
  const isRead     = n.isRead

  return (
    <div onClick={() => onRead(n.id)}
         className="flex gap-3 p-3.5 rounded-xl border mb-2 cursor-pointer transition-all"
         style={{
           backgroundColor: isRead ? C.white : (isHighRisk ? '#FFEEF1' : '#FFF8E1'),
           borderColor:     isRead ? C.border : color + '4D',
           borderWidth:     isRead ? 1 : 1.5,
         }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
           style={{ backgroundColor: color + '26' }}>
        <Icon size={17} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="flex-1 text-[13px] font-bold truncate" style={{ color: C.dark }}>{n.title}</p>
          {!isRead && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />}
        </div>
        <p className="text-[12px] mb-2 leading-snug" style={{ color: C.text }}>{n.message}</p>
        <div className="flex items-center gap-2">
          <Clock size={11} style={{ color: C.muted }} />
          <span className="text-[10px]" style={{ color: C.muted }}>{timeAgo(n.createdAt)}</span>
          {n.ebayOrderId && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: color + '1A', color }}>
              #{n.ebayOrderId.length > 12 ? n.ebayOrderId.slice(0,12)+'...' : n.ebayOrderId}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// â”€â”€ Main NotificationsPanel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isLoading,     setIsLoading]     = useState(true)
  const [isAdmin,       setIsAdmin]       = useState(false)
  const [activeFilter,  setActiveFilter]  = useState('all')
  const [readIds,       setReadIds]       = useState<Set<string>>(new Set())

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      const admin = (profile as any)?.role === 'admin'
      setIsAdmin(admin)

      // Load notifications from Supabase
      const table = admin ? 'admin_notifications' : 'user_notifications'
      const { data } = await supabase.from(table).select('*')
        .eq(admin ? 'is_active' : 'user_id', admin ? true : user.id)
        .order('created_at', { ascending: false }).limit(50)

      if (data && data.length > 0) {
        setNotifications(data.map((d: any) => ({
          id: d.id, type: d.type, title: d.title,
          message: d.message, isRead: d.is_read ?? false,
          createdAt: new Date(d.created_at),
          actionUrl: d.action_url, ebayOrderId: d.ebay_order_id ?? '',
        })))
      } else {
        // Fallback to mock data
        setNotifications(getMockNotifications(admin))
      }
    } catch {
      // Fallback to mock data
      const mockAdmin = false
      setNotifications(getMockNotifications(mockAdmin))
    }
    setIsLoading(false)
  }

  function markRead(id: string) {
    setReadIds(prev => new Set([...prev, id]))
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  function markAllRead() {
    const ids = notifications.map(n => n.id)
    setReadIds(new Set(ids))
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications.filter(n => !readIds.has(n.id) && !n.isRead).length

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter)

  // Group admin notifications by type
  const groupedAdmin = filtered.reduce((acc, n) => {
    if (!acc[n.type]) acc[n.type] = []
    acc[n.type].push(n)
    return acc
  }, {} as Record<string, AppNotification[]>)

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b"
           style={{ backgroundColor: C.white, borderColor: C.border,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        {/* Bell icon with badge */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: isAdmin ? C.dark : C.lime }}>
            {isAdmin
              ? <Shield size={19} style={{ color: C.lime }} />
              : <Bell   size={19} style={{ color: C.dark }} />}
          </div>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-[9px] font-black text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="flex-1">
          <p className="text-[16px] font-bold" style={{ color: C.dark }}>
            {isAdmin ? 'Admin Alerts' : 'Notifications'}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[12px]" style={{ color: C.muted }}>{unreadCount} unread</p>
            {isAdmin && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: C.dark + '14', color: C.dark, letterSpacing: '0.5px' }}>
                ADMIN
              </span>
            )}
          </div>
        </div>

        {/* Mark all read */}
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1 text-[12px] font-semibold"
            style={{ color: C.lime }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}

        {/* Close */}
        <button onClick={onClose} className="p-1.5 hover:opacity-70">
          <X size={19} style={{ color: C.muted }} />
        </button>
      </div>

      {/* Admin filter chips */}
      {isAdmin && !isLoading && (
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b overflow-x-auto"
             style={{ backgroundColor: C.white, borderColor: C.border }}>
          {['all', ...Object.keys(ADMIN_TYPE_CONFIG)].map(type => {
            const count  = type === 'all' ? notifications.length : notifications.filter(n => n.type === type).length
            if (count === 0 && type !== 'all') return null
            const cfg    = ADMIN_TYPE_CONFIG[type]
            const active = activeFilter === type
            const Icon   = cfg?.icon
            return (
              <button key={type} onClick={() => setActiveFilter(type)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shrink-0 transition-all text-[10px] font-semibold"
                style={{
                  backgroundColor: active ? '#8fff00' : 'transparent',
                  borderColor:     active ? C.lime + '66' : C.border,
                  color:           active ? C.white : C.text,
                }}>
                {Icon && <Icon size={10} style={{ color: active ? cfg.color : C.muted }} />}
                {type === 'all' ? `All (${count})` : cfg?.label ?? type}
              </button>
            )
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-7 h-7 rounded-full border-2 animate-spin"
                 style={{ borderColor: C.lime, borderTopColor: 'transparent' }} />
          </div>
        ) : notifications.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                 style={{ backgroundColor: '#EEFFCC' }}>
              <BellOff size={38} style={{ color: C.lime }} />
            </div>
            <p className="text-[18px] font-bold" style={{ color: C.dark }}>
              {isAdmin ? 'No alerts right now' : 'All caught up! ðŸŽ‰'}
            </p>
            <p className="text-[13px] text-center" style={{ color: C.muted }}>
              {isAdmin ? 'Platform is running smoothly.' : 'No alerts or reminders right now.'}
            </p>
            <p className="text-[12px]" style={{ color: C.muted }}>Pull down to refresh</p>
          </div>
        ) : isAdmin ? (
          // Admin grouped list
          <div>
            {Object.entries(groupedAdmin).map(([type, items]) => {
              const config = ADMIN_TYPE_CONFIG[type]
              if (!config) return null
              return (
                <div key={type} className="mb-4">
                  <SectionHeader icon={config.icon} title={config.label} color={config.color}
                    subtitle={`${items.length} alert${items.length > 1 ? 's' : ''}`} />
                  {items.map(n => (
                    <AdminCard key={n.id} n={{ ...n, isRead: readIds.has(n.id) || n.isRead }}
                      config={config} onRead={markRead} />
                  ))}
                </div>
              )
            })}
          </div>
        ) : (
          // User list â€” high risk + deadlines
          <div>
            {['high_risk', 'ship_deadline'].map(type => {
              const items  = filtered.filter(n => n.type === type)
              const config = USER_TYPE_CONFIG[type]
              if (!items.length || !config) return null
              return (
                <div key={type} className="mb-4">
                  <SectionHeader icon={config.icon} title={config.label} color={config.color}
                    subtitle={`${items.length} order${items.length > 1 ? 's' : ''} ${type === 'high_risk' ? 'need attention' : 'pending'}`} />
                  {items.map(n => (
                    <UserCard key={n.id} n={{ ...n, isRead: readIds.has(n.id) || n.isRead }}
                      onRead={markRead} />
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// â”€â”€ Slide-in panel wrapper (matches Dart showNotificationsPanel) â”€â”€
export function NotificationsPanelOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex justify-end"
         style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="h-full flex flex-col overflow-hidden transition-all"
           style={{
             width: 420,
             backgroundColor: C.bg,
             boxShadow: '-4px 0 30px rgba(0,0,0,0.12)',
             animation: 'slideInRight 300ms cubic-bezier(0.33,1,0.68,1)',
           }}>
        <NotificationsPanel onClose={onClose} />
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
