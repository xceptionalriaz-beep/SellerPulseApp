// app/api/webhooks/lemonsqueezy/route.ts
// LemonSqueezy webhook handler — merged complete version

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Verify signature ───────────────────────────────────────────
function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))
  } catch { return false }
}

// ── Map variant ID to plan name ────────────────────────────────
function getPlanFromVariantId(variantId: string): string {
  const map: Record<string, string> = {
    '1816372': 'starter',
    '1816460': 'starter',
    '1816599': 'growth',
    '1816810': 'growth',
    '1816827': 'custom',
    '1816837': 'custom',
  }
  return map[variantId] ?? 'free'
}

// ── Map variant/product name to plan ──────────────────────────
function getPlanFromName(variantName: string | null, productName: string | null): string {
  const name = (variantName ?? productName ?? '').toLowerCase()
  if (name.includes('growth'))  return 'growth'
  if (name.includes('starter')) return 'starter'
  if (name.includes('custom'))  return 'custom'
  return 'starter'
}

// ── Fire internal webhook (Discord notifications) ─────────────
async function fireWebhook(req: NextRequest, event_type: string, data: Record<string, any>) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`
    await fetch(`${appUrl}/api/admin/webhooks`, {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
      },
      body: JSON.stringify({ event_type, data }),
    })
  } catch {}
}

// ── Save transaction to DB ─────────────────────────────────────
async function saveTransaction(data: {
  userId?:        string | null
  userEmail?:     string | null
  plan:           string
  amount:         number
  status:         string
  billing?:       string
  lsSubId?:       string
  lsOrderId?:     string
  paymentMethod?: string
  coupon?:        string
  country?:       string
  nextBilling?:   string
  trialEnd?:      string
  invoiceUrl?:    string
}) {
  try {
    // Get existing LTV
    const { data: existing } = await (adminClient.from('transactions') as any)
      .select('ltv')
      .eq('user_email', data.userEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const prevLtv = (existing as any)?.ltv ?? 0
    const newLtv  = prevLtv + (data.amount ?? 0)

    await (adminClient.from('transactions') as any).insert({
      user_id:        data.userId,
      user_email:     data.userEmail,
      invoice:        data.invoiceUrl ?? `INV-${Date.now()}`,
      plan:           data.plan,
      amount:         data.amount,
      status:         data.status,
      billing:        data.billing ?? 'monthly',
      payment_method: data.paymentMethod ?? '—',
      sub_id:         data.lsSubId,
      ls_sub_id:      data.lsSubId,
      ls_order_id:    data.lsOrderId,
      ltv:            newLtv,
      coupon:         data.coupon ?? null,
      country:        data.country ?? null,
      next_billing:   data.nextBilling ?? null,
      trial_end:      data.trialEnd ?? null,
      created_at:     new Date().toISOString(),
      updated_at:     new Date().toISOString(),
    })
  } catch (e) {
    console.error('[webhook] saveTransaction error:', e)
  }
}

// ── Update promo code usage count ─────────────────────────────
async function updatePromoUsage(couponCode: string) {
  try {
    const { count } = await (adminClient.from('transactions') as any)
      .select('*', { count: 'exact', head: true })
      .eq('coupon', couponCode.toUpperCase())
      .eq('status', 'paid')

    await (adminClient.from('promo_codes') as any)
      .update({ uses_count: count ?? 0 })
      .eq('code', couponCode.toUpperCase())
  } catch (e) {
    console.error('[webhook] promo count update error:', e)
  }
}

// ── Update profile by user_id (preferred) or email ────────────
async function updateProfile(
  userId:  string | null,
  email:   string | null,
  updates: Record<string, any>
) {
  try {
    const q = (adminClient.from('profiles') as any).update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    if (userId) {
      await q.eq('id', userId)
    } else if (email) {
      await q.eq('email', email)
    }
  } catch (e) {
    console.error('[webhook] Profile update error:', e)
  }
}

// ── Enqueue email flow ─────────────────────────────────────────
async function enqueueEmail(
  req:           NextRequest,
  trigger_event: string,
  userId:        string | null,
  userEmail:     string | null,
  variables?:    Record<string, any>
) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`
    await fetch(`${appUrl}/api/email/enqueue`, {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
      },
      body: JSON.stringify({
        trigger_event,
        user_id:   userId,
        to_email:  userEmail,
        variables: variables ?? {},
      }),
    })
  } catch (e) {
    console.error('[webhook] enqueueEmail error:', e)
  }
}

// ── Insert admin notification ──────────────────────────────────
async function notifyAdmin(type: string, title: string, message: string) {
  try {
    await (adminClient.from('admin_notifications') as any).insert({
      type,
      title,
      message,
      is_read:    false,
      created_at: new Date().toISOString(),
    })
  } catch (e) {
    console.error('[webhook] notifyAdmin error:', e)
  }
}

// ── Main handler ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const payload   = await req.text()
  const signature = req.headers.get('x-signature') ?? ''
  const secret    = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? ''

  // Verify signature
  if (secret) {
    if (!verifySignature(payload, signature, secret)) {
      console.error('[webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  }

  let event: any
  try { event = JSON.parse(payload) }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const eventName    = event.meta?.event_name ?? ''
  const obj          = event.data?.attributes ?? {}
  const custom       = event.meta?.custom_data ?? {}
  const userId       = custom?.user_id ?? null
  const userEmail    = obj.user_email ?? obj.customer_email ?? null
  const lsSubId      = String(event.data?.id ?? '')
  const lsCustomerId = String(obj.customer_id ?? '')
  const variantId    = String(obj.first_subscription_item?.variant_id ?? obj.variant_id ?? '')
  const periodEnd    = obj.renews_at ?? obj.ends_at ?? null
  const cancelAtEnd  = obj.cancelled ?? false
  const coupon       = obj.discount_code ?? custom?.coupon ?? null

  console.log(`[webhook] ${eventName} | user: ${userId ?? userEmail} | variant: ${variantId}`)

  try {
    switch (eventName) {

      case 'order_created': {
        const plan = variantId
          ? getPlanFromVariantId(variantId)
          : getPlanFromName(obj.first_order_item?.variant_name, obj.first_order_item?.product_name)
        const amount = obj.total ? `$${(obj.total / 100).toFixed(2)}` : '—'

        await updateProfile(userId, userEmail, {
          plan_name:           plan,
          subscription_status: 'active',
          ls_customer_id:      lsCustomerId,
        })
        await saveTransaction({
          userId, userEmail, plan,
          amount:    obj.total ? obj.total / 100 : 0,
          status:    'paid',
          billing:   'monthly',
          lsOrderId: lsSubId,
          coupon:    coupon ?? undefined,
        })
        if (coupon) await updatePromoUsage(coupon)
        await fireWebhook(req, 'plan.upgraded', {
          email: userEmail, plan, amount, status: 'Order completed',
        })
        break
      }

      case 'subscription_created': {
        const plan = variantId
          ? getPlanFromVariantId(variantId)
          : getPlanFromName(obj.variant_name, obj.product_name)
        const amount = obj.unit_price ? `$${(obj.unit_price / 100).toFixed(2)}` : '—'
        const cardBrand    = obj.card_brand     ?? obj.payment_method_brand     ?? null
        const cardLastFour = obj.card_last_four ?? obj.payment_method_last_four ?? null

        await updateProfile(userId, userEmail, {
          plan_name:            plan,
          subscription_status:  'active',
          ls_customer_id:       lsCustomerId,
          ls_subscription_id:   lsSubId,
          subscription_id:      lsSubId,
          current_period_end:   periodEnd,
          cancel_at_period_end: false,
          card_brand:           cardBrand,
          card_last_four:       cardLastFour,
        })
        await saveTransaction({
          userId, userEmail, plan,
          amount:      obj.unit_price ? obj.unit_price / 100 : 0,
          status:      'paid',
          billing:     obj.billing_anchor ? 'annual' : 'monthly',
          lsSubId,
          nextBilling: periodEnd,
          coupon:      coupon ?? undefined,
          invoiceUrl:  obj.urls?.invoice_url ?? obj.receipt_url ?? null,
        })
        if (coupon) await updatePromoUsage(coupon)
        await enqueueEmail(req, 'plan.upgraded', userId, userEmail, { plan })
        await notifyAdmin('new_subscriber', 'New Subscriber', `${userEmail} upgraded to ${plan}`)
        await fireWebhook(req, 'plan.upgraded', {
          email: userEmail, plan, amount: `${amount}/mo`, status: 'Subscription started',
        })
        break
      }

      case 'subscription_updated':
      case 'subscription_plan_changed': {
        const plan = variantId
          ? getPlanFromVariantId(variantId)
          : getPlanFromName(obj.variant_name, obj.product_name)
        const amount = obj.unit_price ? `$${(obj.unit_price / 100).toFixed(2)}` : '—'

        if (obj.status === 'active') {
          await updateProfile(userId, userEmail, {
            plan_name:            plan,
            subscription_status:  'active',
            current_period_end:   periodEnd,
            cancel_at_period_end: cancelAtEnd,
          })
          await fireWebhook(req, 'plan.upgraded', {
            email: userEmail, plan, amount: `${amount}/mo`, status: 'Subscription updated',
          })
        }
        break
      }

      case 'subscription_cancelled': {
        await updateProfile(userId, userEmail, {
          subscription_status:  'cancelled',
          cancel_at_period_end: true,
        })
        await enqueueEmail(req, 'plan.cancelled', userId, userEmail)
        await notifyAdmin('cancellation', 'Subscription Cancelled', `${userEmail} cancelled their subscription`)
        await fireWebhook(req, 'plan.cancelled', {
          email: userEmail, ends_at: periodEnd, reason: 'Cancelled by user',
        })
        break
      }

      case 'subscription_expired': {
        await updateProfile(userId, userEmail, {
          plan_name:           'free',
          subscription_status: 'expired',
        })
        await fireWebhook(req, 'plan.cancelled', {
          email: userEmail, reason: 'Subscription expired',
        })
        break
      }

      case 'subscription_resumed': {
        const plan = variantId
          ? getPlanFromVariantId(variantId)
          : getPlanFromName(obj.variant_name, obj.product_name)

        await updateProfile(userId, userEmail, {
          plan_name:            plan,
          subscription_status:  'active',
          cancel_at_period_end: false,
          current_period_end:   periodEnd,
        })
        await fireWebhook(req, 'plan.upgraded', {
          email: userEmail, plan, status: 'Subscription resumed',
        })
        break
      }

      case 'subscription_payment_failed': {
        await updateProfile(userId, userEmail, {
          subscription_status: 'past_due',
        })
        await enqueueEmail(req, 'payment.failed', userId, userEmail)
        await notifyAdmin('payment_failed', 'Payment Failed', `Payment failed for ${userEmail}`)
        const amount = obj.billing_price ? `$${(obj.billing_price / 100).toFixed(2)}` : '—'
        await fireWebhook(req, 'payment.failed', {
          email: userEmail, amount,
          next_attempt: obj.next_billing_date ?? 'Unknown',
        })
        break
      }

      case 'subscription_payment_success':
      case 'subscription_payment_recovered': {
        await updateProfile(userId, userEmail, {
          subscription_status: 'active',
          current_period_end:  periodEnd,
        })
        const amount = obj.billing_price ? `$${(obj.billing_price / 100).toFixed(2)}` : '—'
        await fireWebhook(req, 'payment.recovered', {
          email: userEmail, amount, status: 'Payment succeeded',
        })
        break
      }

      case 'order_refunded': {
        await updateProfile(userId, userEmail, {
          plan_name:           'free',
          subscription_status: 'refunded',
        })
        await notifyAdmin('refund', 'Refund Issued', `Refund issued for ${userEmail}`)
        await fireWebhook(req, 'plan.cancelled', {
          email: userEmail, reason: 'Order refunded',
        })
        break
      }

      default:
        console.log(`[webhook] Unhandled event: ${eventName}`)
    }

    // Log to api_usage_logs
    try {
      await (adminClient.from('api_usage_logs') as any).insert({
        platform_name:    'lemonsqueezy',
        tool_name:        'payments',
        call_name:        eventName,
        endpoint:         'webhooks',
        success_count:    1,
        error_count:      0,
        response_time_ms: 0,
        logged_at:        new Date().toISOString(),
      })
    } catch {}

    return NextResponse.json({ received: true, event: eventName })

  } catch (err: any) {
    console.error('[webhook] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}