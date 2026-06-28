'use client'
// components/admin/AnalyticsHub.tsx

import { useState, useEffect } from 'react'
import {
  BarChart2, Globe, Shield, Handshake, Map,
  Server, Eye, Chrome, ArrowLeft,
} from 'lucide-react'

import RevenueAnalyticsTab      from './tabs/RevenueAnalyticsTab'
import GlobalApiFleetTab        from './tabs/GlobalApiFleetTab'
import VeroCommandCenterTab     from './tabs/VeroCommandCenterTab'
import AffiliateCenterTab       from './tabs/AffiliateCenterTab'
import FeatureRoadmapTab        from './tabs/FeatureRoadmapTab'
import InfrastructureMonitorTab from './tabs/InfrastructureMonitorTab'
import CompetitorXRayTab        from './tabs/CompetitorXRayTab'
import ChromeExtensionTab       from './tabs/ChromeExtensionTab'

const C = {
  dark:       '#0F172A',
  lime:       '#8FFF00',
  limeTint:   'rgba(143,255,0,0.10)',
  limeBorder: 'rgba(143,255,0,0.20)',
  border:     '#E2E8F0',
  surface:    '#fff',
  bg:         '#F8FAFC',
  textPri:    '#0F172A',
  textMuted:  '#64748B',
}

interface TabItem {
  title: string; description: string
  icon: React.ElementType
  hasAlert?: boolean; alertText?: string
}

const TABS: TabItem[] = [
  { title: 'Revenue Analytics',      description: 'MRR, subscriptions & financial overview',  icon: BarChart2 },
  { title: 'Global API Fleet',       description: 'eBay API usage, limits & health',           icon: Globe,    hasAlert: true, alertText: 'New brands added'   },
  { title: 'VeRO Command Center',    description: 'Brand protection & VeRO violations',        icon: Shield,   hasAlert: true, alertText: 'New brands added'   },
  { title: 'Affiliate Center',       description: 'Partner performance & commissions',         icon: Handshake },
  { title: 'Feature Roadmap',        description: 'Planned features & release timeline',       icon: Map       },
  { title: 'Infrastructure Monitor', description: 'Server health, uptime & monitoring',        icon: Server,   hasAlert: true, alertText: 'Service degraded'  },
  { title: 'Competitor X-Ray',       description: 'Competitor tracking & market analysis',     icon: Eye,      hasAlert: true, alertText: 'New data available' },
  { title: 'Chrome Extension',       description: 'Extension analytics & install stats',       icon: Chrome    },
]

interface AnalyticsHubProps {
  isInvestorMode: boolean
  isMobile:       boolean
  onBack:         () => void
  initialTab?:    number
}

export default function AnalyticsHub({ isInvestorMode, isMobile, onBack, initialTab }: AnalyticsHubProps) {
  const [activeTab,           setActiveTab]           = useState(initialTab ?? 0)
  const [startChartAnimation, setStartChartAnimation] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStartChartAnimation(true), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (initialTab !== undefined) {
      setActiveTab(initialTab)
      setStartChartAnimation(false)
      setTimeout(() => setStartChartAnimation(true), 100)
    }
  }, [initialTab])

  function switchTab(index: number) {
    if (activeTab === index) return
    setActiveTab(index)
    setStartChartAnimation(false)
    setTimeout(() => setStartChartAnimation(true), 100)
  }

  function getTabContent() {
    const props = { isInvestorMode, isMobile, startChartAnimation }
    switch (activeTab) {
      case 0: return <RevenueAnalyticsTab      {...props} isDesktop={!isMobile} />
      case 1: return <GlobalApiFleetTab        {...props} />
      case 2: return <VeroCommandCenterTab     {...props} />
      case 3: return <AffiliateCenterTab       {...props} />
      case 4: return <FeatureRoadmapTab        {...props} />
      case 5: return <InfrastructureMonitorTab {...props} />
      case 6: return <CompetitorXRayTab        {...props} />
      case 7: return <ChromeExtensionTab       {...props} />
      default: return null
    }
  }

  const alertCount = TABS.filter(t => t.hasAlert).length

  function SidebarItem({ t, index }: { t: TabItem; index: number }) {
    const Icon = t.icon; const isActive = activeTab === index
    return (
      <button onClick={() => switchTab(index)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1 text-left transition-all"
        style={{
          backgroundColor: isActive ? 'rgba(143,255,0,0.12)' : 'transparent',
          borderLeft: `3px solid ${isActive ? C.lime : 'transparent'}`,
        }}>
        <Icon size={15} style={{ color: isActive ? C.lime : 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
        <span className="flex-1 text-[12px] truncate"
              style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: isActive ? 700 : 500 }}>
          {t.title}
        </span>
        {t.hasAlert && !isActive && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#F87171' }} />}
        {isActive           && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: C.lime }} />}
      </button>
    )
  }

  if (!isMobile) return (
    <div className="flex-1 min-w-0">
      <div key={activeTab}>{getTabContent()}</div>
    </div>
  )

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2.5">
        <button onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
          style={{ backgroundColor: C.dark, borderColor: C.limeBorder }}>
          <ArrowLeft size={13} style={{ color: C.lime }} />
          <span className="text-[12px] font-bold text-white">Back</span>
        </button>
        <span className="text-[16px] font-extrabold" style={{ color: C.textPri }}>Analytics Hub</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((t, i) => {
          const Icon = t.icon; const isActive = activeTab === i
          return (
            <button key={i} onClick={() => switchTab(i)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border shrink-0 transition-all"
              style={{
                backgroundColor: isActive ? C.dark : C.surface,
                borderColor:     isActive ? 'rgba(143,255,0,0.5)' : C.border,
              }}>
              <Icon size={12} style={{ color: isActive ? C.lime : C.textMuted }} />
              <span className="text-[11px] font-semibold" style={{ color: isActive ? '#fff' : C.textMuted }}>{t.title}</span>
              {t.hasAlert && !isActive && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#F87171' }} />}
            </button>
          )
        })}
      </div>
      {/* TabHeader removed — content renders directly */}
      <div key={activeTab}>{getTabContent()}</div>
    </div>
  )
}