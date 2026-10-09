'use client'
// app/dashboard/product-research/page.tsx
// Converted 1:1 from lib/pages/product_research/product_research_master.dart

import { useState } from 'react'
import KeywordSearchScreen from './components/keyword-search/KeywordSearchScreen'
import DeepDiveScreen      from './components/deep-dive/DeepDiveScreen'
import KillSwitchGate from '@/components/KillSwitchGate'

const C = {
  bg:     '#F8FAFC',
  white:  '#FFFFFF',
  lime:   '#8FFF00',
  dark:   '#1a2410',
  muted:  '#94A3B8',
  border: '#E5E7EB',
}

const TABS = [
  'Marketplace Research',
  'Deep Dive Analysis',
]

export default function ProductResearchMaster() {
  const [activeTab,   setActiveTab]   = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [productUrl,  setProductUrl]  = useState('')

  return (
    <KillSwitchGate switchTitle="eBay Product Research Tool">
    <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>

      {/* Tab bar — matches Dart TabBar isScrollable + tabAlignment:start */}
      <div style={{ backgroundColor: C.white, width: '100%' }}>
        <div className="flex pl-7 pt-5 overflow-x-auto">
          {TABS.map((tab, i) => {
            const active = activeTab === i
            return (
              <button key={i} onClick={() => setActiveTab(i)}
                className="relative pb-3 mr-8 shrink-0 transition-all"
                style={{
                  fontSize:     15,
                  fontWeight:   active ? 900 : 600,
                  color:        active ? C.dark : C.muted,
                  borderBottom: active ? `4px solid ${C.lime}` : '4px solid transparent',
                }}>
                {tab}
              </button>
            )
          })}
        </div>
      </div>

      {/* Subtle divider line — matches Dart Container(height:1, color:grey.shade200) */}
      <div style={{ height: 1, backgroundColor: C.border }} />

      {/* Tab content — NeverScrollableScrollPhysics = no swipe, just click */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 0 && (
          <KeywordSearchScreen
            searchQuery={searchQuery}
            onSearch={val => setSearchQuery(val)}
          />
        )}
        {activeTab === 1 && (
          <DeepDiveScreen productUrl={productUrl} />
        )}
      </div>

    </div>
    </KillSwitchGate>
  )
}
