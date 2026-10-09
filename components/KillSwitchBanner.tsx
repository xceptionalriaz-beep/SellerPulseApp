'use client'
// components/KillSwitchBanner.tsx
// Shows maintenance banner when a tool is killed
// Usage: <KillSwitchBanner toolKey="product_research" />

import { useKillSwitch, TOOL_KILL_MAP } from '@/hooks/useKillSwitch'
import { Wrench, AlertTriangle, EyeOff, Lock } from 'lucide-react'

interface Props {
  toolKey:  string
  children: React.ReactNode
}

export default function KillSwitchBanner({ toolKey, children }: Props) {
  const { isKilled, isReadOnly, isHidden, message, loading } = useKillSwitch(toolKey)

  if (loading) return <>{children}</>
  if (isHidden) return null

  if (isKilled) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
           style={{ backgroundColor: 'rgba(217,119,6,0.1)' }}>
        <Wrench size={32} style={{ color: '#d97706' }} />
      </div>
      <div>
        <p className="text-[20px] font-black mb-2" style={{ color: '#1a2410' }}>
          Tool Under Maintenance
        </p>
        <p className="text-[14px] max-w-md" style={{ color: '#8a9e78' }}>
          {message ?? `${TOOL_KILL_MAP[toolKey] ?? toolKey} is temporarily unavailable. We're working on it and will be back shortly.`}
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
           style={{ backgroundColor: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}>
        <AlertTriangle size={14} style={{ color: '#d97706' }} />
        <span className="text-[12px] font-semibold" style={{ color: '#d97706' }}>
          Temporarily Disabled by Admin
        </span>
      </div>
    </div>
  )

  return (
    <>
      {isReadOnly && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-4 rounded-xl"
             style={{ backgroundColor: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)' }}>
          <Lock size={14} style={{ color: '#d97706', flexShrink: 0 }} />
          <p className="text-[12px] font-semibold" style={{ color: '#d97706' }}>
            {message ?? 'This tool is in read-only mode. Some features may be limited.'}
          </p>
        </div>
      )}
      {children}
    </>
  )
}

// Compact badge for stats cards
export function KillSwitchBadge({ toolKey }: { toolKey: string }) {
  const { isKilled, isReadOnly, loading } = useKillSwitch(toolKey)
  if (loading || (!isKilled && !isReadOnly)) return null

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold"
          style={{
            backgroundColor: isKilled ? 'rgba(217,119,6,0.1)' : 'rgba(29,78,216,0.1)',
            color:           isKilled ? '#d97706'              : '#1d4ed8',
          }}>
      {isKilled ? <Wrench size={9} /> : <Lock size={9} />}
      {isKilled ? 'Maintenance' : 'Read Only'}
    </span>
  )
}
