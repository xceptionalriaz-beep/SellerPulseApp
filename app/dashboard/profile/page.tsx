'use client'
// app/dashboard/profile/page.tsx

import { useState } from 'react'
import { Shield, User, Globe, Bookmark, CreditCard, Lock, DollarSign, Users } from 'lucide-react'
import OverviewTab    from './tabs/OverviewTab'
import EbayManagerTab from './tabs/EbayManagerTab'
import VaultTab       from './tabs/VaultTab'
import BillingTab     from './tabs/BillingTab'
import SecurityTab    from './tabs/SecurityTab'
import AffiliateTab   from './tabs/AffiliateTab'
import TeamTab        from '@/components/admin/settings-tabs/TeamTab'

const pageBg    = '#F4F7FA'
const sidebarBg = '#0F172A'
const accent    = '#8FFF00'

const TABS = [
  { icon: User,       label: 'Overview'    },
  { icon: Globe,      label: 'Marketplace' },
  { icon: Bookmark,   label: 'Vault'       },
  { icon: CreditCard, label: 'Billing'     },
  { icon: Lock,       label: 'Security'    },
  { icon: DollarSign, label: 'Affiliate'   },
  { icon: Users,      label: 'Team'        },
]

export default function UserProfilePage() {
  const [selectedTab, setSelectedTab] = useState(0)

  function renderContent() {
    switch (selectedTab) {
      case 0: return <OverviewTab    onTabChange={setSelectedTab} />
      case 1: return <EbayManagerTab />
      case 2: return <VaultTab       />
      case 3: return <BillingTab     />
      case 4: return <SecurityTab    />
      case 5: return <AffiliateTab   />
      case 6: return <TeamTab        />
      default: return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-[18px] font-bold text-gray-400">Coming Soon</p>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-full" style={{ backgroundColor: pageBg }}>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex flex-col shrink-0 m-3 h-fit"
           style={{ width: 220, backgroundColor: sidebarBg, borderRadius: 20, paddingTop: 28, paddingBottom: 20 }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent }}>
            <Shield size={16} className="text-black" />
          </div>
          <span className="text-[16px] font-extrabold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            Settings
          </span>
        </div>

        {/* Tab items */}
        {TABS.map((tab, i) => {
          const isActive     = selectedTab === i
          const isNextActive = selectedTab === i + 1
          const isPrevActive = selectedTab === i - 1
          return (
            <div key={i} onClick={() => setSelectedTab(i)} className="relative cursor-pointer">
              {isActive && (
                <div className="absolute" style={{ left: 10, right: 0, top: 0, bottom: 0, backgroundColor: pageBg, borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }} />
              )}
              {isPrevActive && (
                <div className="absolute" style={{ top: 0, right: 0, width: 16, height: 16, backgroundColor: pageBg }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: sidebarBg, borderTopRightRadius: 16 }} />
                </div>
              )}
              {isNextActive && (
                <div className="absolute" style={{ bottom: 0, right: 0, width: 16, height: 16, backgroundColor: pageBg }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: sidebarBg, borderBottomRightRadius: 16 }} />
                </div>
              )}
              <div className="relative flex items-center" style={{ padding: '10px 18px' }}>
                <tab.icon size={19} style={{ color: isActive ? sidebarBg : 'rgba(255,255,255,0.5)' }} />
                <span className="ml-3 text-[13px]"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: isActive ? 700 : 500, color: isActive ? sidebarBg : 'rgba(255,255,255,0.6)' }}>
                  {tab.label}
                </span>
                {isActive && (
                  <>
                    <div className="flex-1" />
                    <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accent, marginRight: 2 }} />
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* MOBILE TOP BAR */}
      <div className="lg:hidden flex items-center mx-3 mt-3"
           style={{ height: 60, backgroundColor: sidebarBg, borderRadius: 20 }}>
        {TABS.map((tab, i) => {
          const isActive        = selectedTab === i
          const isLeftOfActive  = selectedTab === i + 1
          const isRightOfActive = selectedTab === i - 1
          return (
            <div key={i} onClick={() => setSelectedTab(i)}
                 className="flex-1 flex items-center justify-center relative cursor-pointer"
                 style={{ height: '100%' }}>
              {isActive && (
                <div className="absolute" style={{ left: 0, right: 0, top: 8, bottom: 0, backgroundColor: pageBg, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
              )}
              {isLeftOfActive && (
                <div className="absolute" style={{ bottom: 0, right: 0, width: 16, height: 16, backgroundColor: pageBg }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: sidebarBg, borderBottomRightRadius: 16 }} />
                </div>
              )}
              {isRightOfActive && (
                <div className="absolute" style={{ bottom: 0, left: 0, width: 16, height: 16, backgroundColor: pageBg }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: sidebarBg, borderBottomLeftRadius: 16 }} />
                </div>
              )}
              <tab.icon size={22} className="relative z-10"
                        style={{ color: isActive ? sidebarBg : 'rgba(255,255,255,0.5)' }} />
            </div>
          )
        })}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div style={{ padding: '20px 28px 28px 24px' }}>
          {renderContent()}
        </div>
      </div>

    </div>
  )
}