// app/api/admin/gamification/leaderboard/rebuild-manual/route.ts
// ─────────────────────────────────────────────────────────────
// Manual leaderboard rebuild — triggered by an admin from the UI.
// Separate from the cron-only /rebuild route (which uses CRON_SECRET).
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const auth = req.headers.get('authorization')
        const token = auth?.replace('Bearer ', '')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        const { data: { user } } = await adminClient.auth.getUser(token)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await adminClient
            .from('profiles').select('role').eq('id', user.id).single()
        if ((profile as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        await adminClient.rpc('rebuild_leaderboard_cache')

        try {
            await (adminClient.from('admin_logs') as any).insert({
                admin_id: user.id,
                action: 'rebuild_leaderboard',
                details: 'Manually rebuilt leaderboard cache',
                created_at: new Date().toISOString(),
            })
        } catch { /* non-critical */ }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('[leaderboard/rebuild-manual]', err)
        return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
    }
}
