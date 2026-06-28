// lib/email.ts
// Helper functions to send emails from anywhere in the app
// Usage: await sendWelcomeEmail({ to: 'user@email.com', userName: 'James' })

const API = '/api/send'

async function send(body: Record<string, unknown>) {
  const res = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Email send failed')
  }
  return res.json()
}

// â”€â”€ Send welcome email after signup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function sendWelcomeEmail(opts: { to: string; userName: string }) {
  return send({ type: 'welcome', ...opts, userEmail: opts.to })
}

// â”€â”€ Send email confirmation / OTP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function sendConfirmationEmail(opts: {
  to:              string
  userName:        string
  confirmationUrl: string
  otp?:            string
}) {
  return send({ type: 'confirmation', ...opts })
}

// â”€â”€ Send password reset email â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function sendResetPasswordEmail(opts: {
  to:       string
  userName: string
  resetUrl: string
}) {
  return send({ type: 'reset_password', ...opts })
}

// â”€â”€ Send market alert email â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function sendAlertEmail(opts: {
  to:           string
  userName:     string
  alertType:    'saturation_spike' | 'price_drop' | 'trend_surge' | 'dead_stock_risk'
  nicheKeyword: string
  metric:       string
  detail:       string
}) {
  return send({ type: 'alert', loginUrl: 'https://riazify.com/dashboard', ...opts })
}
