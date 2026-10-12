// app/api/ebay/refresh-token/route.ts
// Manually trigger an eBay access token refresh.
// Called from EbayManagerTab when the user's token is near expiry.

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { refreshEbayAccessToken } from '@/lib/ebay-refresh'

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll() } } }
        )
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const result = await refreshEbayAccessToken(user.id)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            expiresAt: result.expiresAt,
        })
    } catch (err: any) {
        console.error('[refresh-token]', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
