// app/api/send/route.ts
// Central Resend email API route — handles all transactional emails

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { WelcomeEmail }      from '@/emails/WelcomeEmail'
import { ConfirmationEmail } from '@/emails/ConfirmationEmail'
import { ResetPasswordEmail } from '@/emails/ResetPasswordEmail'
import { AlertEmail }        from '@/emails/AlertEmail'

// ── Init Resend ───────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'Riazify <noreply@riazify.com>'

// ── Email types ───────────────────────────────────────────────
type EmailType = 'welcome' | 'confirmation' | 'reset_password' | 'alert'

interface EmailPayload {
  type:            EmailType
  to:              string
  // welcome
  userName?:       string
  userEmail?:      string
  // confirmation
  confirmationUrl?: string
  otp?:            string
  // reset
  resetUrl?:       string
  // alert
  alertType?:      'saturation_spike' | 'price_drop' | 'trend_surge' | 'dead_stock_risk'
  nicheKeyword?:   string
  metric?:         string
  detail?:         string
  loginUrl?:       string
}

// ── POST handler ──────────────────────────────────────────────
export async function POST(req: NextRequest) {

  // 1. Check API key
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not configured' },
      { status: 500 }
    )
  }

  // 2. Parse body
  let payload: EmailPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { type, to, userName = 'Seller' } = payload

  if (!type || !to) {
    return NextResponse.json(
      { error: 'Missing required fields: type, to' },
      { status: 400 }
    )
  }

  // 3. Build email based on type
  try {
    let subject: string
    let react:   React.ReactElement

    switch (type) {

      case 'welcome':
        subject = '🎉 Welcome to Riazify — Your dashboard is ready'
        react   = WelcomeEmail({
          userName,
          userEmail:  payload.userEmail ?? to,
          loginUrl:   payload.loginUrl,
        }) as React.ReactElement
        break

      case 'confirmation':
        subject = '🔐 Confirm your Riazify account'
        react   = ConfirmationEmail({
          userName,
          confirmationUrl: payload.confirmationUrl ?? '',
          otp:             payload.otp,
        }) as React.ReactElement
        break

      case 'reset_password':
        subject = '🔑 Reset your Riazify password'
        react   = ResetPasswordEmail({
          userName,
          resetUrl: payload.resetUrl ?? '',
        }) as React.ReactElement
        break

      case 'alert':
        subject = `⚡ Market Alert — ${payload.nicheKeyword ?? 'Your niche'} | Riazify`
        react   = AlertEmail({
          userName,
          alertType:    payload.alertType    ?? 'trend_surge',
          nicheKeyword: payload.nicheKeyword ?? '',
          metric:       payload.metric       ?? '',
          detail:       payload.detail       ?? '',
          loginUrl:     payload.loginUrl,
        }) as React.ReactElement
        break

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        )
    }

    // 4. Send via Resend
    const { data, error } = await resend.emails.send({
      from:    FROM,
      to:      [to],
      subject,
      react,
    })

    if (error) {
      console.error('[Resend error]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      id:      data?.id,
      type,
      to,
    })

  } catch (err: any) {
    console.error('[Send email error]', err)
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}

// ── GET — health check ────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status:   'ok',
    service:  'Riazify Email API',
    provider: 'Resend',
    types:    ['welcome', 'confirmation', 'reset_password', 'alert'],
  })
}