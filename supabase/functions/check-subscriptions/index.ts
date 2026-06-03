// supabase/functions/check-subscriptions/index.ts
// Daily subscription expiry checker
// Called by external cron (cron-job.org) every day at midnight

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabase.rpc('check_subscription_expiry')
    if (error) throw error

    const { data: stats } = await supabase
      .from('subscriptions')
      .select('status')

    const all       = (stats ?? []) as any[]
    const active    = all.filter((s: any) => s.status === 'active').length
    const pastDue   = all.filter((s: any) => s.status === 'past_due').length
    const cancelled = all.filter((s: any) => s.status === 'cancelled').length

    return new Response(
      JSON.stringify({
        success:   true,
        timestamp: new Date().toISOString(),
        stats:     { active, pastDue, cancelled },
        message:   'Subscription expiry check completed successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})