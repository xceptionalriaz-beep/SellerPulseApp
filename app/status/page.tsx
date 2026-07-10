// app/status/page.tsx
// Public system status page â€” readable by anyone

import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export const dynamic    = 'force-dynamic'
export const revalidate = 0

interface SystemStatus {
  status:     'operational' | 'degraded' | 'major_outage'
  message:    string
  updated_at: string
}

interface Component {
  id:          string
  name:        string
  status:      string
  order_index: number
}

const STATUS_CONFIG = {
  operational: {
    label:  'All Systems Operational',
    color:  '#16a34a',
    bg:     '#F0FDF4',
    border: '#BBF7D0',
    icon:   CheckCircle,
    dot:    '#16a34a',
  },
  degraded: {
    label:  'Degraded Performance',
    color:  '#F97316',
    bg:     '#FFF7ED',
    border: '#FED7AA',
    icon:   AlertTriangle,
    dot:    '#F97316',
  },
  major_outage: {
    label:  'Major Outage',
    color:  '#b91c1c',
    bg:     '#FEF2F2',
    border: '#FECACA',
    icon:   XCircle,
    dot:    '#EF4444',
  },
}

const COMPONENT_STATUS_CONFIG = {
  operational:  { label: 'Operational',  color: '#16a34a', dot: '#16a34a' },
  degraded:     { label: 'Degraded',     color: '#F97316', dot: '#F97316' },
  major_outage: { label: 'Major Outage', color: '#b91c1c', dot: '#EF4444' },
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) === 1 ? '' : 's'} ago`
}

export default async function StatusPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: statusData }, { data: componentsData }] = await Promise.all([
    (supabase as any)
      .from('system_status')
      .select('status, message, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1),
    (supabase as any)
      .from('system_components')
      .select('id, name, status, order_index')
      .order('order_index', { ascending: true }),
  ])

  const status: SystemStatus = statusData?.[0] ?? {
    status:     'operational',
    message:    'All systems are fully operational.',
    updated_at: new Date().toISOString(),
  }

  const components: Component[] = componentsData ?? []
  const cfg  = STATUS_CONFIG[status.status]
  const Icon = cfg.icon

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f7f9f5', fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      <Navbar/>

      {/* Hero status banner */}
      <div className="text-center px-4 pt-20 pb-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute pointer-events-none" style={{ top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(143,255,0,0.08)' }}/>
        <div className="absolute pointer-events-none" style={{ bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(143,255,0,0.06)' }}/>
        <div className="absolute pointer-events-none" style={{ top: 20, left: '30%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(143,255,0,0.04)' }}/>

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
               style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: cfg.dot }}/>
            <span className="text-[12px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
          </div>

          <h1 className="font-black mb-3" style={{ color: '#1a2410', fontSize: 'clamp(28px, 5vw, 48px)' }}>
            System Status
          </h1>

          <p className="text-[15px] max-w-md mx-auto mb-2" style={{ color: '#8a9e78' }}>
            {status.message}
          </p>
          <p className="text-[12px] mb-8" style={{ color: '#8a9e78' }}>
            Last updated {timeAgo(status.updated_at)}
          </p>

          {/* Stats */}
          <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl border mx-auto"
               style={{ backgroundColor: '#fff', borderColor: '#e8ede2' }}>
            {[
              { label: 'API', status: 'operational' },
              { label: 'Dashboard', status: 'operational' },
              { label: 'Database', status: 'operational' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#16a34a' }}/>
                <span className="text-[12px] font-semibold" style={{ color: '#1a2410' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual component statuses */}
      <div className="max-w-2xl mx-auto w-full px-6 pb-16 flex flex-col gap-3">
        {components.length > 0 ? components.map(component => {
          const compCfg = COMPONENT_STATUS_CONFIG[component.status as keyof typeof COMPONENT_STATUS_CONFIG]
            ?? COMPONENT_STATUS_CONFIG.operational
          return (
            <div key={component.id}
                 className="flex items-center justify-between p-4 rounded-2xl border"
                 style={{ backgroundColor: '#fff', borderColor: '#e8ede2' }}>
              <p className="text-[14px] font-semibold" style={{ color: '#1a2410' }}>{component.name}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full"
                     style={{
                       backgroundColor: compCfg.dot,
                       boxShadow: component.status === 'operational' ? `0 0 6px ${compCfg.dot}` : 'none',
                     }} />
                <span className="text-[12px] font-bold" style={{ color: compCfg.color }}>
                  {compCfg.label}
                </span>
              </div>
            </div>
          )
        }) : (
          ['eBay Product Search', 'VeRO Protection Engine', 'Profit Calculator',
           'AI Title Builder', 'Orders Manager', 'Inventory Tracking', 'Analytics Dashboard']
          .map(name => (
            <div key={name}
                 className="flex items-center justify-between p-4 rounded-2xl border"
                 style={{ backgroundColor: '#fff', borderColor: '#e8ede2' }}>
              <p className="text-[14px] font-semibold" style={{ color: '#1a2410' }}>{name}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full"
                     style={{ backgroundColor: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }} />
                <span className="text-[12px] font-bold" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    {/* Subscribe */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-16">
        <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: '#1a2410' }}>
          <h3 className="text-[16px] font-black text-white mb-2">Get status updates</h3>
          <p className="text-[13px] mb-4" style={{ color: '#8a9e78' }}>Get notified when incidents occur or resolve.</p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input type="email" placeholder="your@email.com"
                   className="flex-1 h-10 px-4 rounded-xl text-[13px] outline-none"
                   style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}/>
            <button className="h-10 px-4 rounded-xl text-[13px] font-black shrink-0"
                    style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
