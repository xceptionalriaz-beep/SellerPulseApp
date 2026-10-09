// app/api/admin/send-email/route.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Sends a templated email to a user via Resend.
// Admin picks a template â†’ fills with user's name â†’ sends.
// Logs to user_events timeline and admin_logs automatically.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { createClient } from '@supabase/supabase-js'
import { Resend }       from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY!)

// â”€â”€ Email templates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TEMPLATES: Record<string, {
  label:   string
  subject: (name: string) => string
  html:    (name: string, customNote?: string) => string
}> = {
  nudge_inactive: {
    label: 'Nudge â€” Inactive User',
    subject: (name) => `We miss you on Riazify, ${name}!`,
    html: (name, note) => `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#0a0d08;font-size:22px;margin-bottom:8px;">Hey ${name} ðŸ‘‹</h2>
        <p style="color:#4a5568;font-size:15px;line-height:1.6;">
          We noticed you haven't logged into Riazify in a while.
          Your eBay business doesn't stop â€” and neither should your protection.
        </p>
        <p style="color:#4a5568;font-size:15px;line-height:1.6;">
          Log back in to check your orders, run a VeRO scan, and see what's changed since your last visit.
        </p>
        ${note ? `<p style="color:#4a5568;font-size:15px;line-height:1.6;padding:12px 16px;background:#f7f9f5;border-left:3px solid #8fff00;border-radius:4px;">${note}</p>` : ''}
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
           style="display:inline-block;margin-top:20px;padding:12px 28px;background:#8fff00;color:#0a0d08;font-weight:700;border-radius:12px;text-decoration:none;font-size:14px;">
          Log Back In â†’
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px;">The Riazify Team</p>
      </div>
    `,
  },
  trial_ending: {
    label: 'Trial Ending Soon',
    subject: (name) => `Your Riazify trial is ending, ${name}`,
    html: (name, note) => `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#0a0d08;font-size:22px;margin-bottom:8px;">Hey ${name}, your trial is ending soon</h2>
        <p style="color:#4a5568;font-size:15px;line-height:1.6;">
          Your free trial is coming to an end. Don't lose access to the tools that protect your eBay business.
        </p>
        <ul style="color:#4a5568;font-size:15px;line-height:1.8;padding-left:20px;">
          <li>Order Protection â€” keep your buyers safe</li>
          <li>VeRO Scanner â€” avoid listing bans</li>
          <li>Profit Calculator â€” know your real margins</li>
          <li>Title Builder â€” get found on eBay</li>
        </ul>
        ${note ? `<p style="color:#4a5568;font-size:15px;line-height:1.6;padding:12px 16px;background:#f7f9f5;border-left:3px solid #8fff00;border-radius:4px;">${note}</p>` : ''}
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/pricing"
           style="display:inline-block;margin-top:20px;padding:12px 28px;background:#8fff00;color:#0a0d08;font-weight:700;border-radius:12px;text-decoration:none;font-size:14px;">
          Upgrade Now â†’
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px;">The Riazify Team</p>
      </div>
    `,
  },
  upgrade_offer: {
    label: 'Special Upgrade Offer',
    subject: (name) => `A special offer just for you, ${name}`,
    html: (name, note) => `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#0a0d08;font-size:22px;margin-bottom:8px;">Hey ${name}, here's something special</h2>
        <p style="color:#4a5568;font-size:15px;line-height:1.6;">
          We've been watching your progress on Riazify and we think you're ready to take your eBay business to the next level.
        </p>
        ${note ? `<p style="color:#4a5568;font-size:15px;line-height:1.6;padding:12px 16px;background:#f7f9f5;border-left:3px solid #8fff00;border-radius:4px;">${note}</p>` : ''}
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/pricing"
           style="display:inline-block;margin-top:20px;padding:12px 28px;background:#8fff00;color:#0a0d08;font-weight:700;border-radius:12px;text-decoration:none;font-size:14px;">
          See Your Offer â†’
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px;">The Riazify Team</p>
      </div>
    `,
  },
  ebay_reconnect: {
    label: 'eBay Reconnect Required',
    subject: (name) => `Action needed: Your eBay connection, ${name}`,
    html: (name, note) => `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#0a0d08;font-size:22px;margin-bottom:8px;">Hey ${name}, your eBay connection needs attention</h2>
        <p style="color:#4a5568;font-size:15px;line-height:1.6;">
          Your eBay store connection has expired or been disconnected. Until you reconnect, your order protection and tools won't work properly.
        </p>
        ${note ? `<p style="color:#4a5568;font-size:15px;line-height:1.6;padding:12px 16px;background:#fff7ed;border-left:3px solid #f97316;border-radius:4px;">${note}</p>` : ''}
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings"
           style="display:inline-block;margin-top:20px;padding:12px 28px;background:#8fff00;color:#0a0d08;font-weight:700;border-radius:12px;text-decoration:none;font-size:14px;">
          Reconnect eBay â†’
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px;">The Riazify Team</p>
      </div>
    `,
  },
  welcome_back: {
    label: 'Welcome Back',
    subject: (name) => `We'd love to have you back, ${name}`,
    html: (name, note) => `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#0a0d08;font-size:22px;margin-bottom:8px;">Welcome back, ${name}</h2>
        <p style="color:#4a5568;font-size:15px;line-height:1.6;">
          It's been a while and we want you to know â€” your account is still here, your data is safe, and we'd love to have you back protecting your eBay business.
        </p>
        ${note ? `<p style="color:#4a5568;font-size:15px;line-height:1.6;padding:12px 16px;background:#f7f9f5;border-left:3px solid #8fff00;border-radius:4px;">${note}</p>` : ''}
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
           style="display:inline-block;margin-top:20px;padding:12px 28px;background:#8fff00;color:#0a0d08;font-weight:700;border-radius:12px;text-decoration:none;font-size:14px;">
          Come Back â†’
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px;">The Riazify Team</p>
      </div>
    `,
  },
}

// â”€â”€ Route handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // â”€â”€ 1. Verify admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user: caller }, error: authErr } = await adminClient.auth.getUser(token)
    if (authErr || !caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: callerProfile } = await adminClient
      .from('profiles').select('role, name').eq('id', caller.id).single()
    if ((callerProfile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // â”€â”€ 2. Parse body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { userId, templateKey, customNote } = await req.json()
    if (!userId || !templateKey) {
      return NextResponse.json({ error: 'userId and templateKey required' }, { status: 400 })
    }

    const template = TEMPLATES[templateKey]
    if (!template) {
      return NextResponse.json({ error: `Unknown template: ${templateKey}` }, { status: 400 })
    }

    // â”€â”€ 3. Get target user details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: targetProfile } = await adminClient
      .from('profiles').select('name, email, account_status').eq('id', userId).single()

    const { data: authUser } = await adminClient.auth.admin.getUserById(userId)

    const userEmail = authUser?.user?.email ?? (targetProfile as any)?.email
    const userName  = (targetProfile as any)?.name
                   ?? userEmail?.split('@')[0]
                   ?? 'there'

    if (!userEmail) {
      return NextResponse.json({ error: 'No email found for this user' }, { status: 400 })
    }

    // â”€â”€ 4. Send via Resend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'Riazify <support@riazify.com>'

    const { data: emailData, error: emailErr } = await resend.emails.send({
      from:    fromAddress,
      to:      [userEmail],
      subject: template.subject(userName),
      html:    template.html(userName, customNote),
    })

    if (emailErr) throw new Error(emailErr.message)

    // â”€â”€ 5. Get caller IP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      null

    // â”€â”€ 6. Log to admin_logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   caller.id,
        target_id:  userId,
        action:     'send_email',
        details:    `Sent "${template.label}" email to ${userName}`,
        metadata:   {
          admin_name:     (callerProfile as any)?.name ?? 'Admin',
          target_name:    userName,
          target_email:   userEmail,
          template_key:   templateKey,
          template_label: template.label,
          resend_id:      emailData?.id ?? null,
        },
        ip_address: ipAddress,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    // â”€â”€ 7. Log to user journey timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      await adminClient.from('user_events').insert({
        user_id:     userId,
        event_type:  'admin_email_sent',
        event_title: `Email Sent: ${template.label}`,
        event_desc:  `Admin sent "${template.subject(userName)}"`,
        metadata:    {
          template_key:   templateKey,
          template_label: template.label,
          sent_by:        caller.id,
          admin_name:     (callerProfile as any)?.name ?? 'Admin',
          resend_id:      emailData?.id,
        },
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({
      success:  true,
      message:  `Email sent to ${userEmail}`,
      template: template.label,
    })

  } catch (err: any) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: err.message ?? 'Failed to send email' }, { status: 500 })
  }
}
