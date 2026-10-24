// lib/ai/credit-actions.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for every AI credit action in the app.
//
// HOW IT WORKS
// ─────────────────────────────────────────────────────────────────────────────
// • CREDIT_ACTIONS defines every feature key + its default cost + display info.
// • The REAL cost at runtime comes from the `ai_action_costs` Supabase table.
//   The defaults here are only used as fallbacks (e.g. table row is missing).
// • API routes call  deductCredits(userId, AI_ACTIONS.xxx)  from lib/ai/credits.ts
//   which reads cost from the DB automatically.
// • UI components call  getCreditCost(key)  (below) to show the correct cost.
//
// TO CONNECT TO THE ADMIN PANEL LATER
// ─────────────────────────────────────────────────────────────────────────────
// Build an admin page that:
//   1. SELECTs * FROM ai_action_costs  (all rows)
//   2. Renders each row with an editable `credits_cost` and `is_enabled` toggle
//   3. On save, UPDATEs that row in Supabase
// The change takes effect immediately — no code deploy needed.
// ─────────────────────────────────────────────────────────────────────────────

// ── All feature keys ──────────────────────────────────────────────────────────
export const AI_ACTIONS = {
    FILL_TEMPLATE_FULL:   'ai_fill_template',         // AI fills all blocks at once
    FILL_TEMPLATE_SINGLE: 'ai_fill_template_single',  // AI fills one selected block
    COPY_OPTIMIZER:       'ai_copy_optimizer',         // AI rewrites listing copy
    POLICY_WRITER:        'ai_policy_writer',          // AI generates policy text
    DESIGN_TEMPLATE:      'ai_design_template',        // AI generates design template
    PHOTO_STUDIO:         'ai_photo_studio',           // AI photo background removal
} as const

export type AIActionKey = typeof AI_ACTIONS[keyof typeof AI_ACTIONS]

// ── Default costs (fallback if DB row is missing) ─────────────────────────────
// To change costs in production: update the `ai_action_costs` table in Supabase.
// These defaults are only used when the DB lookup fails or returns no row.
export const DEFAULT_CREDIT_COSTS: Record<AIActionKey, number> = {
    [AI_ACTIONS.FILL_TEMPLATE_FULL]:   20,
    [AI_ACTIONS.FILL_TEMPLATE_SINGLE]: 10,
    [AI_ACTIONS.COPY_OPTIMIZER]:       15,
    [AI_ACTIONS.POLICY_WRITER]:        10,
    [AI_ACTIONS.DESIGN_TEMPLATE]:      20,
    [AI_ACTIONS.PHOTO_STUDIO]:         5,
}

// ── Display metadata (used in admin panel + UI tooltips) ──────────────────────
export const ACTION_META: Record<AIActionKey, { label: string; description: string; category: string }> = {
    [AI_ACTIONS.FILL_TEMPLATE_FULL]: {
        label:       'AI Fill Template (Full)',
        description: 'Fill all blocks in a template with AI-generated content',
        category:    'Template Editor',
    },
    [AI_ACTIONS.FILL_TEMPLATE_SINGLE]: {
        label:       'AI Fill Block (Single)',
        description: 'Fill one selected block with AI-generated content',
        category:    'Template Editor',
    },
    [AI_ACTIONS.COPY_OPTIMIZER]: {
        label:       'AI Copy Optimizer',
        description: 'Rewrite and optimize listing copy for conversion',
        category:    'Template Editor',
    },
    [AI_ACTIONS.POLICY_WRITER]: {
        label:       'AI Policy Writer',
        description: 'Generate returns/shipping policy text',
        category:    'Template Editor',
    },
    [AI_ACTIONS.DESIGN_TEMPLATE]: {
        label:       'AI Design Template',
        description: 'Generate a full visual design template',
        category:    'Design Studio',
    },
    [AI_ACTIONS.PHOTO_STUDIO]: {
        label:       'AI Photo Studio',
        description: 'Remove background and enhance product photos',
        category:    'Photo Studio',
    },
}

// ── Client-side cost fetcher ──────────────────────────────────────────────────
// Fetches the live credit cost for an action from the `ai_action_costs` table.
// Falls back to DEFAULT_CREDIT_COSTS if the DB is unavailable.
//
// Usage in a React component:
//   const cost = await getCreditCost(AI_ACTIONS.FILL_TEMPLATE_SINGLE)
//
import { createClient } from '@/lib/supabase'

export async function getCreditCost(action: AIActionKey): Promise<number> {
    try {
        const supabase = createClient()
        const { data } = await (supabase as any)
            .from('ai_action_costs')
            .select('credits_cost, is_enabled')
            .eq('feature_key', action)
            .single() as { data: { credits_cost: number; is_enabled: boolean } | null }

        if (data && data.is_enabled) return data.credits_cost
        return DEFAULT_CREDIT_COSTS[action] ?? 0
    } catch {
        return DEFAULT_CREDIT_COSTS[action] ?? 0
    }
}

// ── Bulk fetch (load all costs at once — used by admin panel) ─────────────────
// Returns a map of feature_key → cost for every row in the DB.
//
export async function getAllCreditCosts(): Promise<Record<string, { cost: number; enabled: boolean; name: string }>> {
    try {
        const supabase = createClient()
        const { data } = await (supabase as any)
            .from('ai_action_costs')
            .select('feature_key, credits_cost, is_enabled, name') as {
                data: Array<{ feature_key: string; credits_cost: number; is_enabled: boolean; name: string }> | null
            }

        if (!data) return {}
        return Object.fromEntries(
            data.map(row => [row.feature_key, {
                cost:    row.credits_cost,
                enabled: row.is_enabled,
                name:    row.name,
            }])
        )
    } catch {
        return {}
    }
}
