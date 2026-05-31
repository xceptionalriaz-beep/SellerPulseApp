'use client'
// components/admin/tabs/FeatureRoadmapTab.tsx
// Converted 1:1 from lib/pages/admin_tabs/feature_roadmap_tab.dart

import { ArrowUp, ExternalLink } from 'lucide-react'

const C = {
  border: '#E2E8F0', bg: '#F8FAFC', text: '#0F172A', muted: '#64748B',
}

interface Props { isInvestorMode?: boolean; isMobile?: boolean; startChartAnimation?: boolean }

function RoadmapItem({ title, desc, votes, status, statusColor }: {
  title: string; desc: string; votes: number; status: string; statusColor: string
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border mb-3"
         style={{ backgroundColor: C.bg, borderColor: C.border }}>
      {/* Vote box */}
      <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-lg border bg-white shrink-0"
           style={{ borderColor: C.border }}>
        <ArrowUp size={15} style={{ color: C.muted }} />
        <span className="text-[16px] font-bold" style={{ color: C.text }}>{votes}</span>
      </div>
      {/* Title + desc */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold" style={{ color: C.text }}>{title}</p>
        <p className="text-[12px]" style={{ color: C.muted }}>{desc}</p>
      </div>
      {/* Status badge */}
      <div className="px-3 py-1.5 rounded-full border shrink-0"
           style={{ backgroundColor: statusColor + '14', borderColor: statusColor + '33' }}>
        <span className="text-[11px] font-bold" style={{ color: statusColor }}>{status}</span>
      </div>
    </div>
  )
}

export default function FeatureRoadmapTab(_props: Props) {
  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <h2 className="text-[18px] font-bold flex-1" style={{ color: C.text }}>
          User Roadmap & Feature Voting
        </h2>
        <button className="flex items-center gap-1.5 text-[13px] font-semibold"
                style={{ color: C.muted }}>
          <ExternalLink size={13} /> View Public Board
        </button>
      </div>
      <p className="text-[13px] mb-6" style={{ color: C.muted }}>
        Stop guessing. Build exactly what your paying customers are begging for.
      </p>

      {/* Roadmap items */}
      <RoadmapItem title="Amazon CA & UK Integration"  desc="Allow users to fetch products from Amazon CA."    votes={412} status="In Progress"  statusColor="#1D70F5" />
      <RoadmapItem title="Walmart Drop Shipping Support" desc="Add Walmart as a source supplier."               votes={385} status="Planned"      statusColor="#FB923C" />
      <RoadmapItem title="Dark Mode UI"                 desc="A toggle for night mode in the dashboard."        votes={150} status="Under Review" statusColor="#8B5CF6" />

    </div>
  )
}