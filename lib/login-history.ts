'use client'
// lib/login-history.ts
import { createClient } from '@/lib/supabase'
import { SessionTracker } from '@/lib/session-tracker'

export async function logLogin(): Promise<void> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const metadata = await SessionTracker.getLoginMetadata()

    // 1. Update profiles — include last_active_date for streak tracking
    await (supabase.from('profiles') as any)
      .update({
        last_login_ip:    metadata.last_login_ip,
        device_platform:  metadata.device_platform,
        browser_agent:    metadata.browser_agent,
        last_active_date: new Date().toISOString().slice(0, 10),
      })
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
    } catch { /* non-critical */ }

  } catch (err) {
    console.error('logLogin failed:', err)
  }
}