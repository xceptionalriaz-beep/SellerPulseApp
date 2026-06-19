// lib/api-tracker.ts
// Tracks API usage in api_fleet_config + api_usage_logs tables
// Call this whenever a tool uses an external API

import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Log a single API call ──────────────────────────────────────
// Call this after every external API call in your routes
export async function logApiCall(options: {
  userId?:         string | null
  platformName:    string          // 'ebay' | 'openai' | 'resend' etc
  toolName:        string          // 'orders' | 'product_research' etc
  callName:        string          // 'GetOrders' | 'FindItemsByKeywords' etc
  endpoint?:       string          // full endpoint path
  success:         boolean
  responseTimeMs:  number
  errorMessage?:   string | null
}): Promise<void> {
  try {
    const {
      userId, platformName, toolName, callName,
      endpoint, success, responseTimeMs, errorMessage,
    } = options

    // 1. Write to api_usage_logs (feeds GlobalApiFleetTab activity)
    await (adminClient.from('api_usage_logs') as any).insert({
      user_id:          userId ?? null,
      platform_name:    platformName,
      tool_name:        toolName,
      call_name:        callName,
      endpoint:         endpoint ?? null,
      success_count:    success ? 1 : 0,
      error_count:      success ? 0 : 1,
      response_time_ms: responseTimeMs,
      error_message:    errorMessage ?? null,
      logged_at:        new Date().toISOString(),
    })

    // 2. Update api_fleet_config counters (feeds ApiVaultPage + GlobalApiFleetTab HUD)
    const { data: curr } = await (adminClient.from('api_fleet_config') as any)
      .select('rate_limit_used, requests_today')
      .eq('platform_name', platformName)
      .single()

    if (curr) {
      await (adminClient.from('api_fleet_config') as any)
        .update({
          last_used_at:    new Date().toISOString(),
          last_request_at: new Date().toISOString(),
          last_tested_at:  new Date().toISOString(),
          status:          success ? 'connected' : 'error',
          rate_limit_used: ((curr as any).rate_limit_used ?? 0) + 1,
          requests_today:  ((curr as any).requests_today  ?? 0) + 1,
          updated_at:      new Date().toISOString(),
        })
        .eq('platform_name', platformName)
    }

  } catch (err) {
    // Non-critical — never block tool functionality
    console.error('[api-tracker]', err)
  }
}

// ── Reset daily counters (called from daily cron) ──────────────
export async function resetDailyCounters(): Promise<void> {
  try {
    await (adminClient.from('api_fleet_config') as any)
      .update({ requests_today: 0, rate_limit_used: 0 })
      .not('platform_name', 'like', '%affiliate%')
  } catch (err) {
    console.error('[api-tracker] reset error:', err)
  }
}