// hooks/useKillSwitch.ts
// Checks kill switch status for a tool
// Usage: const { isKilled, isReadOnly, message } = useKillSwitch('Orders Management')

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

interface KillSwitchState {
  isKilled:   boolean
  isReadOnly: boolean
  isHidden:   boolean
  message:    string | null
  loading:    boolean
}

// Map tool keys to kill_switches.title
export const TOOL_KILL_MAP: Record<string, string> = {
  'orders':               'Orders Management',
  'ebay_orders':          'Orders Management',
  'product_research':     'eBay Product Research Tool',
  'competitor_research':  'Competitor Research',
  'profit_calculator':    'Profit Calculator',
  'title_builder':        'Title Builder',
  'vero':                 'VeRO Brand Scanner',
  'inventory':            'Inventory Manager',
}

// Check a single kill switch by title
export async function checkKillSwitch(title: string): Promise<KillSwitchState> {
  try {
    const supabase = createClient()
    const { data } = await (supabase.from('kill_switches') as any)
      .select('is_enabled, is_read_only, is_visible, user_message')
      .eq('title', title)
      .single()

    if (!data) return { isKilled: false, isReadOnly: false, isHidden: false, message: null, loading: false }

    return {
      isKilled:   !data.is_enabled,
      isReadOnly: data.is_read_only && !data.is_enabled,
      isHidden:   !data.is_visible,
      message:    data.user_message ?? null,
      loading:    false,
    }
  } catch {
    return { isKilled: false, isReadOnly: false, isHidden: false, message: null, loading: false }
  }
}

// Check all kill switches at once — returns map of title → state
export async function checkAllKillSwitches(): Promise<Record<string, KillSwitchState>> {
  try {
    const supabase = createClient()
    const { data } = await (supabase.from('kill_switches') as any)
      .select('title, is_enabled, is_read_only, is_visible, user_message')

    const map: Record<string, KillSwitchState> = {}
    for (const row of (data ?? []) as any[]) {
      map[row.title] = {
        isKilled:   !row.is_enabled,
        isReadOnly: row.is_read_only && !row.is_enabled,
        isHidden:   !row.is_visible,
        message:    row.user_message ?? null,
        loading:    false,
      }
    }
    return map
  } catch {
    return {}
  }
}

// React hook for a single tool
export function useKillSwitch(toolKey: string): KillSwitchState {
  const title = TOOL_KILL_MAP[toolKey] ?? toolKey
  const [state, setState] = useState<KillSwitchState>({
    isKilled: false, isReadOnly: false, isHidden: false, message: null, loading: true,
  })

  useEffect(() => {
    checkKillSwitch(title).then(setState)
  }, [title])

  return state
}

// React hook for all tools at once
export function useAllKillSwitches(): { switches: Record<string, KillSwitchState>; loading: boolean } {
  const [switches, setSwitches] = useState<Record<string, KillSwitchState>>({})
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    checkAllKillSwitches().then(result => {
      setSwitches(result)
      setLoading(false)
    })
  }, [])

  return { switches, loading }
}