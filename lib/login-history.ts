'use client'
// lib/login-history.ts
// Converted from: lib/services/login_history_service.dart

import { createClient } from '@/lib/supabase'
import { SessionTracker } from '@/lib/session-tracker'

export async function logLogin(): Promise<void> {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Collect metadata (IP, platform, browser)
    const metadata = await SessionTracker.getLoginMetadata()

    // 1. Update profiles table
    await supabase
      .from('profiles')
      .update({
        last_login_ip:   metadata.last_login_ip,
        device_platform: metadata.device_platform,
        browser_agent:   metadata.browser_agent,
      } as never)
      .eq('id', user.id)

    // 2. Insert into login_history table
    await supabase
      .from('login_history')
      .insert({
        user_id:     user.id,
        ip_address:  metadata.last_login_ip,
        device_info: `${metadata.device_platform} — ${metadata.browser_agent}`,
      } as never)

    // 3. Fire webhook if admin login
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name, email')
        .eq('id', user.id)
        .single()

      if ((profile as any)?.role === 'admin') {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
        await fetch(`${appUrl}/api/admin/webhooks`, {
          method:  'POST',
          headers: {
            'Content-Type':      'application/json',
            'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_SECRET ?? '',
          },
          body: JSON.stringify({
            event_type: 'admin.login',
            data: {
              name:    (profile as any)?.name    ?? 'Admin',
              email:   (profile as any)?.email   ?? user.email ?? '—',
              ip:      metadata.last_login_ip    ?? '—',
              device:  metadata.device_platform  ?? '—',
              time:    new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
            }
          }),
        })
      }
    } catch { /* non-critical — never block login */ }

  } catch (err) {
    // Non-critical — never block the user if this fails
    console.error('logLogin failed:', err)
  }
}