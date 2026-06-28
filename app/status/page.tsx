// app/status/page.tsx
// Public system status page â€” readable by anyone

import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react'

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

      {/* Nav */}
      <nav className="px-6 py-4 border-b flex items-center justify-between"
           style={{ backgroundColor: '#0a0d08', borderColor: 'rgba(143,255,0,0.2)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ backgroundColor: '#8fff00' }}>
            <Activity size={14} color="#0a0d08" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-bold text-white">Riazify</span>
          <span className="text-[13px] ml-1" style={{ color: '#8a9e78' }}>/ Status</span>
        </Link>
        <Link href="/dashboard"
          className="text-[12px] font-semibold px-3 py-1.5 rounded-xl border transition-all hover:opacity-80"
          style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
          â† Back to App
        </Link>
      </nav>

      {/* Hero status banner */}
      <div className="text-center py-16 px-6">
        <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl mb-6"
             style={{ backgroundColor: cfg.bg, border: `2px solid ${cfg.border}` }}>
          <Icon size={28} style={{ color: cfg.color }} />
          <span className="text-[22px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
        </div>
        <p className="text-[15px] max-w-md mx-auto" style={{ color: '#8a9e78' }}>
          {status.message}
        </p>
        <p className="text-[12px] mt-3" style={{ color: '#8a9e78' }}>
          Last updated {timeAgo(status.updated_at)}
        </p>
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

      {/* Footer â€” matches landing page */}
      <footer className="py-16 border-t" style={{ background: '#1a2410', borderColor: '#1a2410' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                     style={{ background: '#8fff00' }}>
                  <Activity size={13} color="#0a0d08" />
                </div>
                <span className="text-[16px] font-black text-white">Riazify</span>
              </div>
              <p className="text-[13px] leading-relaxed mb-5" style={{ color: '#8a9e78' }}>
                Next-gen eBay intelligence for scaling operators. Built by sellers, for sellers.
              </p>
              <div className="flex rounded-xl overflow-hidden border"
                   style={{ borderColor: 'rgba(143,255,0,0.2)' }}>
                <input placeholder="Your email..."
                  className="flex-1 px-4 py-2.5 text-[13px] outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                <button className="px-4 py-2.5 text-[12px] font-black shrink-0"
                        style={{ background: '#8fff00', color: '#0a0d08' }}>
                  Subscribe
                </button>
              </div>
            </div>
            {[
              { title: 'Product', links: [
                  { label: 'Features',         href: '/#features' },
                  { label: 'Pricing',          href: '/#pricing'  },
                  { label: 'Changelog',        href: '#'          },
                  { label: 'Roadmap',          href: '/roadmap'   },
                  { label: 'Status',           href: '/status'    },
                  { label: 'Chrome Extension', href: '#'          },
                ]},
              { title: 'Company', links: [
                  { label: 'About',     href: '#' },
                  { label: 'Blog',      href: '#' },
                  { label: 'Careers',   href: '#' },
                  { label: 'Press Kit', href: '#' },
                ]},
              { title: 'Legal', links: [
                  { label: 'Privacy Policy',   href: '#' },
                  { label: 'Terms of Service', href: '#' },
                  { label: 'Cookie Policy',    href: '#' },
                  { label: 'GDPR',             href: '#' },
                ]},
            ].map(col => (
              <div key={col.title}>
                <p className="text-[12px] font-black tracking-wider mb-4 text-white">
                  {col.title.toUpperCase()}
                </p>
                <div className="flex flex-col gap-2.5">
                  {col.links.map(l => (
                    <Link key={l.label} href={l.href}
                      className="text-[13px] transition-opacity hover:opacity-100 opacity-60"
                      style={{ color: l.label === 'Roadmap' || l.label === 'Status' ? '#8fff00' : '#8a9e78' }}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t flex items-center justify-between flex-wrap gap-4"
               style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[12px]" style={{ color: '#8a9e78' }}>
              Â© {new Date().getFullYear()} Riazify â€” All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {['Twitter', 'LinkedIn', 'YouTube', 'Discord'].map(s => (
                <a key={s} href="#"
                   className="text-[12px] font-semibold transition-opacity hover:opacity-100 opacity-50"
                   style={{ color: '#8a9e78' }}>{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
