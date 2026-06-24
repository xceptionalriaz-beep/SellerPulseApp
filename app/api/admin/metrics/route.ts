// app/api/admin/metrics/route.ts
// Fetches real server metrics:
// → Supabase DB size + active connections (via RPC)
// → Vercel bandwidth (via Vercel API)

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase Free tier DB limit = 500 MB
const DB_LIMIT_GB       = 0.5
const DB_LIMIT_BYTES    = DB_LIMIT_GB * 1024 ** 3
// Supabase Pro max connections
const CONN_LIMIT        = 60
// Vercel Pro bandwidth limit = 1 TB, use 100 GB as soft warning threshold
const BW_LIMIT_GB       = 100

function formatBytes(bytes: number): string {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

export async function GET() {
  const result = {
    // DB metrics
    db_size_bytes:           0,
    db_size_pretty:          '0 MB',
    db_limit_bytes:          DB_LIMIT_BYTES,
    db_limit_pretty:         `${DB_LIMIT_GB} GB`,
    db_percent:              0,
    // Connection metrics
    active_connections:      0,
    connection_limit:        CONN_LIMIT,
    connection_percent:      0,
    // Vercel metrics
    vercel_bw_gb:            0,
    vercel_bw_limit_gb:      BW_LIMIT_GB,
    vercel_bw_percent:       0,
    vercel_available:        false,
    vercel_project_name:     '',
    vercel_framework:        '',
    vercel_deployments:      0,
    vercel_last_deployed_at: null as number | null,
    vercel_last_deploy_state:null as string | null,
    // Query stats
    query_total_calls:       0,
    query_count:             0,
    query_avg_ms:            0,
    // Meta
    fetched_at:              new Date().toISOString(),
    error:                   null as string | null,
  }

  // ── Supabase metrics ──────────────────────────────────────────
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const [{ data, error }, { data: queryData }] = await Promise.all([
      supabase.rpc('get_db_metrics'),
      supabase.rpc('get_query_stats'),
    ])
    if (!error && data) {
      result.db_size_bytes      = data.db_size_bytes ?? 0
      result.db_size_pretty     = formatBytes(data.db_size_bytes ?? 0)
      result.active_connections = data.active_connections ?? 0
      result.db_percent         = Math.min((result.db_size_bytes / DB_LIMIT_BYTES), 1)
      result.connection_percent = Math.min((result.active_connections / CONN_LIMIT), 1)
    }
    if (queryData) {
      result.query_total_calls = queryData.total_calls ?? 0
      result.query_count       = queryData.query_count ?? 0
      result.query_avg_ms      = queryData.avg_time_ms ?? 0
    }
  } catch (e) {
    console.error('[metrics] Supabase error:', e)
    result.error = 'Supabase metrics unavailable'
  }

  // ── Vercel metrics ─────────────────────────────────────────
  try {
    const token     = process.env.VERCEL_TOKEN
    const projectId = process.env.VERCEL_PROJECT_ID

    if (token && projectId) {
      // Get project info + recent deployments
      const [projectRes, deploymentsRes] = await Promise.all([
        fetch(`https://api.vercel.com/v9/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=10&state=READY`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      console.log('[vercel] projectRes status:', projectRes.status)
      if (!projectRes.ok) {
        const err = await projectRes.text()
        console.log('[vercel] projectRes error:', err)
      }

      if (projectRes.ok) {
        const project       = await projectRes.json()
        result.vercel_available = true
        result.vercel_project_name = project.name ?? ''
        result.vercel_framework    = project.framework ?? 'nextjs'
      }

      if (deploymentsRes.ok) {
        const depData       = await deploymentsRes.json()
        const deployments   = depData.deployments ?? []
        result.vercel_deployments       = deployments.length
        result.vercel_last_deployed_at  = deployments[0]?.createdAt ?? null
        result.vercel_last_deploy_state = deployments[0]?.state ?? null
      }
    }
  } catch (e) {
    console.error('[vercel] Error:', e)
  }

  return NextResponse.json(result)
}