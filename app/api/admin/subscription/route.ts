// app/api/admin/subscription/route.ts
// Manages subscriptions via LemonSqueezy API
// Actions: cancel, resume, change_plan

import { createClient }         from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Get LS API key from DB ─────────────────────────────────────
async function getLSKey(): Promise<string | null> {
  const { data } = await (adminClient.from('api_fleet_config') as any)
    .select('primary_key_1, status')
    .eq('platform_name', 'lemonsqueezy')
    .single()
  if ((data as any)?.status !== 'connected') return null
  return (data as any)?.primary_key_1 ?? null
}

// ── Get variant ID for plan change ────────────────────────────
async function getVariantId(plan: string, billing: string): Promise<string | null> {
  const { data } = await (adminClient.from('ls_config') as any)
    .select('value')
    .eq('key', `${plan}_${billing}`)
    .single()
  return (data as any)?.value ?? null
}

export async function POST(req: NextRequest) {
  try {
    const { action, lsSubId, userId, plan, billing, cancelAtPeriodEnd } = await req.json()

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    // Preview data check
    if (!lsSubId || lsSubId === '—') {
      return NextResponse.json({ error: 'No LemonSqueezy subscription ID — preview data only' }, { status: 400 })
    }

    const lsKey = await getLSKey()
    if (!lsKey) {
      return NextResponse.json({ error: 'LemonSqueezy not connected' }, { status: 500 })
    }

    const lsHeaders = {
      'Authorization': `Bearer ${lsKey}`,
      'Content-Type':  'application/vnd.api+json',
      'Accept':        'application/vnd.api+json',
    }

    switch (action) {

      // ── Cancel subscription ──────────────────────────────────
      case 'cancel': {
        const res = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${lsSubId}`, {
          method:  'DELETE',
          headers: lsHeaders,
        })

        if (!res.ok) {
          const err = await res.json()
          return NextResponse.json({ error: err?.errors?.[0]?.detail ?? 'Cancel failed' }, { status: 400 })
        }

        // Update DB
        if (userId) {
          await (adminClient.from('profiles') as any).update({
            subscription_status:  cancelAtPeriodEnd ? 'cancelled' : 'inactive',
            cancel_at_period_end: cancelAtPeriodEnd ?? true,
            updated_at:           new Date().toISOString(),
          }).eq('id', userId)
        }

        await (adminClient.from('transactions') as any).update({
          status:     'cancelled',
          updated_at: new Date().toISOString(),
        }).eq('sub_id', lsSubId)

        return NextResponse.json({ success: true, message: 'Subscription cancelled' })
      }

      // ── Change plan (upgrade/downgrade) ──────────────────────
      case 'change_plan': {
        if (!plan || !billing) {
          return NextResponse.json({ error: 'Missing plan or billing' }, { status: 400 })
        }

        const variantId = await getVariantId(plan, billing)
        if (!variantId) {
          return NextResponse.json({ error: 'Variant not found for this plan' }, { status: 404 })
        }

        const res = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${lsSubId}`, {
          method:  'PATCH',
          headers: lsHeaders,
          body: JSON.stringify({
            data: {
              type:       'subscriptions',
              id:         String(lsSubId),
              attributes: {
                variant_id: parseInt(variantId),
              }
            }
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          return NextResponse.json({ error: err?.errors?.[0]?.detail ?? 'Plan change failed' }, { status: 400 })
        }

        // Update DB
        if (userId) {
          await (adminClient.from('profiles') as any).update({
            plan_name:           plan,
            subscription_status: 'active',
            updated_at:          new Date().toISOString(),
          }).eq('id', userId)
        }

        await (adminClient.from('transactions') as any).update({
          plan:       plan,
          updated_at: new Date().toISOString(),
        }).eq('sub_id', lsSubId)

        return NextResponse.json({ success: true, message: `Plan changed to ${plan}` })
      }

      // ── Resume cancelled subscription ────────────────────────
      case 'resume': {
        const res = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${lsSubId}`, {
          method:  'PATCH',
          headers: lsHeaders,
          body: JSON.stringify({
            data: {
              type:       'subscriptions',
              id:         String(lsSubId),
              attributes: { cancelled: false }
            }
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          return NextResponse.json({ error: err?.errors?.[0]?.detail ?? 'Resume failed' }, { status: 400 })
        }

        if (userId) {
          await (adminClient.from('profiles') as any).update({
            subscription_status:  'active',
            cancel_at_period_end: false,
            updated_at:           new Date().toISOString(),
          }).eq('id', userId)
        }

        return NextResponse.json({ success: true, message: 'Subscription resumed' })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

  } catch (err: any) {
    console.error('[subscription] Error:', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}