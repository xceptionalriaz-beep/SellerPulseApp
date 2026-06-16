// app/api/admin/notify/kill-switch/route.ts
// ══════════════════════════════════════════════════════════════
// Sends email notification when a kill switch goes offline
// Uses Resend API (already configured)
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'

const FOUNDER_EMAIL = 'xceptionalriaz@gmail.com'
const FROM_EMAIL    = 'notifications@dropnrest.com'
const APP_URL       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://seller-pulse-app-git-main-xceptionalriaz-3369s-projects.vercel.app'

interface NotifyPayload {
  switchTitle:  string
  adminName:    string
  reason:       string | null
  userMessage:  string | null
  reEnableMins: number | null
  action:       'disabled' | 'kill_all' | 'auto_disabled'
  time:         string
}

export async function POST(req: NextRequest) {
  try {
    // Internal only — verify request comes from our own API
    const secret = req.headers.get('x-internal-secret')
    if (secret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: NotifyPayload = await req.json()
    const {
      switchTitle, adminName, reason, userMessage,
      reEnableMins, action, time,
    } = body

    const actionLabel = action === 'kill_all'
      ? 'KILL ALL — All Switches Offline'
      : action === 'auto_disabled'
      ? `AUTO-DISABLED — ${switchTitle}`
      : `OFFLINE — ${switchTitle}`

    const urgencyColor = action === 'kill_all' ? '#b91c1c' : '#d97706'

    const reEnableText = reEnableMins
      ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Auto Re-enable</td><td style="padding:8px 0;font-size:13px;font-weight:600;color:#4a8f00;">In ${reEnableMins >= 60 ? `${reEnableMins/60}h` : `${reEnableMins}m`}</td></tr>`
      : ''

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f7f9f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8ede2;">
    
    <!-- Header -->
    <div style="background:${urgencyColor};padding:24px 32px;">
      <p style="margin:0;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
        ${action === 'kill_all' ? '🚨 Emergency Kill All' : action === 'auto_disabled' ? '⏰ Scheduled Maintenance' : '🔴 Kill Switch Alert'}
      </p>
      <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:900;">
        ${switchTitle === 'ALL' ? 'All Systems Offline' : switchTitle} — OFFLINE
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #e8ede2;">
          <td style="padding:8px 0;color:#6b7280;font-size:13px;width:140px;">Switch</td>
          <td style="padding:8px 0;font-size:13px;font-weight:700;color:#0a0d08;">${switchTitle}</td>
        </tr>
        <tr style="border-bottom:1px solid #e8ede2;">
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Action</td>
          <td style="padding:8px 0;font-size:13px;font-weight:600;color:${urgencyColor};">${actionLabel}</td>
        </tr>
        <tr style="border-bottom:1px solid #e8ede2;">
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Disabled by</td>
          <td style="padding:8px 0;font-size:13px;font-weight:600;color:#0a0d08;">${adminName}</td>
        </tr>
        <tr style="border-bottom:1px solid #e8ede2;">
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Time</td>
          <td style="padding:8px 0;font-size:13px;color:#0a0d08;">${time}</td>
        </tr>
        ${reason ? `
        <tr style="border-bottom:1px solid #e8ede2;">
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Internal Reason</td>
          <td style="padding:8px 0;font-size:13px;font-style:italic;color:#0a0d08;">"${reason}"</td>
        </tr>` : ''}
        ${userMessage ? `
        <tr style="border-bottom:1px solid #e8ede2;">
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">User Message</td>
          <td style="padding:8px 0;font-size:13px;color:#0a0d08;">"${userMessage}"</td>
        </tr>` : ''}
        ${reEnableText}
      </table>

      <!-- CTA -->
      <div style="margin-top:24px;text-align:center;">
        <a href="${APP_URL}/dashboard/admin?tab=kill-switches"
           style="display:inline-block;background:#0a0d08;color:#8fff00;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:700;">
          View Kill Switches →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;background:#f7f9f5;border-top:1px solid #e8ede2;">
      <p style="margin:0;font-size:11px;color:#8a9e78;text-align:center;">
        Riazify Admin Notifications · You receive this because you are a Riazify admin
      </p>
    </div>

  </div>
</body>
</html>`

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [FOUNDER_EMAIL],
        subject: `[Riazify] ${switchTitle} — OFFLINE${reEnableMins ? ` (auto-enables in ${reEnableMins >= 60 ? `${reEnableMins/60}h` : `${reEnableMins}m`})` : ''}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[notify/kill-switch] Resend error:', err)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('[notify/kill-switch]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}