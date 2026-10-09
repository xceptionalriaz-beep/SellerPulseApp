// lib/b2b-auth.ts
// Validates B2B API keys, tracks usage, resets monthly

import { createClient } from '@supabase/supabase-js'

interface ApiKey {
  id:             string
  partner_name:   string
  usage_count:    number
  rate_limit:     number
  is_active:      boolean
  last_used_at:   string | null
}

interface B2BAuthResult {
  success:     boolean
  key?:        ApiKey
  error?:      string
  statusCode?: number
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// â”€â”€ Fix 1: CORS headers for all B2B responses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

// â”€â”€ Fix 1: Handle OPTIONS preflight requests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function handleCors() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function validateB2BKey(request: Request): Promise<B2BAuthResult> {
  // â”€â”€ 1. Extract API key â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey) {
    return { success: false, error: 'Missing x-api-key header', statusCode: 401 }
  }

  if (!apiKey.startsWith('sk_live_')) {
    return { success: false, error: 'Invalid API key format', statusCode: 401 }
  }

  // â”€â”€ 2. Look up key â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const supabase = getServiceClient()
  const { data: key, error } = await (supabase as any)
    .from('api_keys')
    .select('id, partner_name, usage_count, rate_limit, is_active, last_used_at')
    .eq('api_key', apiKey)
    .single()

  if (error || !key) {
    return { success: false, error: 'API key not found', statusCode: 401 }
  }

  // â”€â”€ 3. Check active â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!key.is_active) {
    return { success: false, error: 'API key has been revoked', statusCode: 403 }
  }

  // â”€â”€ Fix 2: Monthly reset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const now      = new Date()
  const lastUsed = key.last_used_at ? new Date(key.last_used_at) : null
  const isNewMonth = !lastUsed ||
    lastUsed.getMonth()    !== now.getMonth() ||
    lastUsed.getFullYear() !== now.getFullYear()

  if (isNewMonth && key.usage_count > 0) {
    // New month â†’ reset usage back to 0
    await (supabase as any)
      .from('api_keys')
      .update({ usage_count: 0 })
      .eq('id', key.id)
    key.usage_count = 0
  }

  // â”€â”€ 4. Check rate limit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (key.usage_count >= key.rate_limit) {
    return {
      success:    false,
      error:      `Monthly rate limit of ${key.rate_limit.toLocaleString()} calls exceeded. Contact support to upgrade.`,
      statusCode: 429,
    }
  }

  // â”€â”€ 5. Increment usage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await (supabase as any)
    .from('api_keys')
    .update({
      usage_count:  key.usage_count + 1,
      last_used_at: now.toISOString(),
    })
    .eq('id', key.id)

  return { success: true, key }
}

// â”€â”€ Standard error response with CORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function b2bError(message: string, statusCode: number = 400) {
  return Response.json(
    { success: false, error: message, docs: 'https://riazify.com/docs/api' },
    { status: statusCode, headers: CORS_HEADERS }
  )
}

// â”€â”€ Standard success response with CORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function b2bSuccess(data: object, meta?: object) {
  return Response.json(
    {
      success: true,
      data,
      meta: { timestamp: new Date().toISOString(), ...meta },
    },
    { headers: CORS_HEADERS }
  )
}
