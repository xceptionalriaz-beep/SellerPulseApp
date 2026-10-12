// app/api/inventory/check-low-stock/route.ts
// Scans all active listing drafts for a user and creates low_stock_alerts
// for any listing whose quantity is at or below the configured threshold.
// Also sends email notifications via Resend for critical items.
//
// POST /api/inventory/check-low-stock
// — Called manually from UI or on a schedule

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const adminClient = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const resend = new Resend(process.env.RESEND_API_KEY)

const DEFAULT_THRESHOLD = 5

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Load user's global/per-listing rules
    const { data: rules } = await (supabase as any)
      .from('low_stock_rules')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    // Global default threshold (rule with no listing_id)
    const globalRule = rules?.find((r: any) => !r.listing_id)
    const globalThreshold = globalRule?.threshold ?? DEFAULT_THRESHOLD
    const sendEmail = globalRule?.alert_email ?? true

    // Load all published/ready listings with qty > 0
    const { data: listings } = await (supabase as any)
      .from('listing_drafts')
      .select('id, product_name, title, quantity, status, ebay_listing_id')
      .eq('user_id', user.id)
      .in('status', ['published', 'ready', 'draft'])
      .not('quantity', 'is', null)

    if (!listings || listings.length === 0) {
      return NextResponse.json({ checked: 0, alerts: 0 })
    }

    // Find which listing IDs already have recent unread alerts (avoid duplicates)
    const { data: existingAlerts } = await (supabase as any)
      .from('low_stock_alerts')
      .select('listing_id')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // last 24h

    const alreadyAlerted = new Set((existingAlerts ?? []).map((a: any) => a.listing_id))

    const newAlerts: any[] = []
    const emailLines: string[] = []

    for (const listing of listings) {
      const perListingRule = rules?.find((r: any) => r.listing_id === listing.id)
      const threshold = perListingRule?.threshold ?? globalThreshold
      const qty = listing.quantity ?? 0

      if (qty <= threshold && !alreadyAlerted.has(listing.id)) {
        const title = listing.title || listing.product_name || 'Untitled listing'
        newAlerts.push({
          user_id: user.id,
          listing_id: listing.id,
          listing_title: title,
          current_qty: qty,
          threshold,
        })

        if (sendEmail) {
          const urgency = qty === 0 ? '🔴 OUT OF STOCK' : '🟡 LOW STOCK'
          emailLines.push(`• ${urgency}: "${title}" — ${qty} left (threshold: ${threshold})`)
        }
      }
    }

    // Insert alerts
    if (newAlerts.length > 0) {
      await (supabase as any).from('low_stock_alerts').insert(newAlerts)
    }

    // Send email summary if enabled and there are new alerts
    if (sendEmail && emailLines.length > 0) {
      try {
        const { data: profile } = await (supabase as any)
          .from('profiles').select('full_name').eq('id', user.id).single()
        const name = profile?.full_name || 'Seller'

        await resend.emails.send({
          from: 'Riazify Alerts <alerts@riazify.com>',
          to:   user.email!,
          subject: `⚠️ ${emailLines.length} low stock alert${emailLines.length > 1 ? 's' : ''} — Riazify`,
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #1e1535 0%, #2d1f5e 100%); padding: 28px 32px; border-radius: 16px 16px 0 0;">
                <h1 style="color: #b8fa33; font-size: 22px; margin: 0; font-weight: 700;">
                  ⚠️ Low Stock Alert
                </h1>
                <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 6px 0 0;">
                  Hi ${name} — the following listings need attention
                </p>
              </div>
              <div style="background: #f8f7ff; border: 1px solid #ede9fe; border-top: none; padding: 24px 32px; border-radius: 0 0 16px 16px;">
                <div style="background: white; border: 1px solid #ede9fe; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                  ${emailLines.map(line => `
                    <div style="padding: 10px 0; border-bottom: 1px solid #f3eeff; font-size: 14px; color: #1e1535; font-family: 'DM Sans', Arial, sans-serif;">
                      ${line}
                    </div>
                  `).join('')}
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/listing-generator"
                   style="display: inline-block; background: #7530fb; color: white; text-decoration: none;
                          padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px;">
                  View Listings →
                </a>
                <p style="font-size: 11px; color: #9ca3af; margin-top: 20px;">
                  You're receiving this because low-stock alerts are enabled in your Riazify settings.
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile?tab=alerts" style="color: #7530fb;">Manage alerts</a>
                </p>
              </div>
            </div>
          `,
        })
      } catch (emailErr) {
        console.warn('[check-low-stock] Email send failed:', emailErr)
        // Non-critical — alerts still created in DB
      }
    }

    return NextResponse.json({
      checked: listings.length,
      alerts:  newAlerts.length,
      emailed: sendEmail && emailLines.length > 0,
    })

  } catch (err: any) {
    console.error('[check-low-stock]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET — return unread alerts count for badge
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: alerts } = await (supabase as any)
      .from('low_stock_alerts')
      .select('id, listing_id, listing_title, current_qty, threshold, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    const unreadCount = (alerts ?? []).filter((a: any) => !a.is_read).length

    return NextResponse.json({ alerts: alerts ?? [], unreadCount })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
