'use client'
// app/dashboard/listing-generator/hooks/useSegments.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Segments: data hook
//
// Responsibilities:
//   • Load the user's custom segments from Supabase on mount
//   • Expose CRUD: createSegment, updateSegment, deleteSegment
//   • Track which segment is currently active (activeSegmentId)
//   • Merge built-in + custom into a single ordered list
//   • Expose segment reordering (drag-and-drop ready)
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

import { BUILT_IN_SEGMENTS } from '../data/built-in-segments'
import type {
    Segment,
    CustomSegment,
    SegmentRow,
    SegmentUpsert,
} from '../types/segments.types'

// ── Shape returned by the hook ────────────────────────────────
export interface UseSegmentsReturn {
    /** All segments in sidebar order: built-ins first, then custom */
    segments: Segment[]
    /** Custom segments only (from Supabase) */
    customSegments: CustomSegment[]
    /** id of the currently-selected segment */
    activeSegmentId: string
    /** true while the initial Supabase load is in flight */
    loading: boolean
    /** non-null when the last operation failed */
    error: string | null

    // ── Selection ───────────────────────────────────────────
    setActiveSegmentId: (id: string) => void

    // ── CRUD ────────────────────────────────────────────────
    createSegment: (payload: SegmentUpsert) => Promise<CustomSegment | null>
    updateSegment: (id: string, payload: Partial<SegmentUpsert>) => Promise<boolean>
    deleteSegment: (id: string) => Promise<boolean>

    // ── Reorder ─────────────────────────────────────────────
    /** Pass the new ordered array of custom segments after a drag */
    reorderSegments: (ordered: CustomSegment[]) => Promise<void>

    /** Force a re-fetch from Supabase */
    refresh: () => Promise<void>
}

// ── Row → CustomSegment adapter ───────────────────────────────
function rowToSegment(row: SegmentRow): CustomSegment {
    return {
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        filters: row.filters,
        logic: row.logic,
        sort_order: row.sort_order,
        created_at: row.created_at,
        isBuiltIn: false,
    }
}

// ─────────────────────────────────────────────────────────────
export function useSegments(): UseSegmentsReturn {
    const [customSegments, setCustomSegments] = useState<CustomSegment[]>([])
    const [activeSegmentId, setActiveSegmentId] = useState<string>('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // ── Merged list: built-ins first, then custom ─────────────
    const segments: Segment[] = [
        ...BUILT_IN_SEGMENTS,
        ...customSegments,
    ]

    // ── Load custom segments from Supabase ────────────────────
    const refresh = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setCustomSegments([])
                return
            }

            const { data, error: dbErr } = await (supabase
                .from('listing_segments') as any)
                .select('*')
                .eq('user_id', user.id)
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: true })

            if (dbErr) throw dbErr

            setCustomSegments((data as SegmentRow[]).map(rowToSegment))
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load segments')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { refresh() }, [refresh])

    // ── Create ────────────────────────────────────────────────
    const createSegment = useCallback(async (
        payload: SegmentUpsert,
    ): Promise<CustomSegment | null> => {
        setError(null)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Place new segment at the end
            const maxOrder = customSegments.reduce(
                (m, s) => Math.max(m, s.sort_order),
                -1,
            )

            const insert = {
                user_id: user.id,
                name: payload.name,
                icon: payload.icon,
                color: payload.color,
                filters: payload.filters,
                logic: payload.logic,
                sort_order: payload.sort_order ?? maxOrder + 1,
            }

            const { data, error: dbErr } = await (supabase
                .from('listing_segments') as any)
                .insert(insert)
                .select()
                .single()

            if (dbErr) throw dbErr

            const newSeg = rowToSegment(data as SegmentRow)
            setCustomSegments(prev => [...prev, newSeg])
            return newSeg
        } catch (e: any) {
            setError(e?.message ?? 'Failed to create segment')
            return null
        }
    }, [customSegments])

    // ── Update ────────────────────────────────────────────────
    const updateSegment = useCallback(async (
        id: string,
        payload: Partial<SegmentUpsert>,
    ): Promise<boolean> => {
        setError(null)
        try {
            const supabase = createClient()
            const { error: dbErr } = await (supabase
                .from('listing_segments') as any)
                .update(payload)
                .eq('id', id)

            if (dbErr) throw dbErr

            setCustomSegments(prev =>
                prev.map(s => s.id === id ? { ...s, ...payload } : s)
            )
            return true
        } catch (e: any) {
            setError(e?.message ?? 'Failed to update segment')
            return false
        }
    }, [])

    // ── Delete ────────────────────────────────────────────────
    const deleteSegment = useCallback(async (id: string): Promise<boolean> => {
        setError(null)
        try {
            const supabase = createClient()
            const { error: dbErr } = await (supabase
                .from('listing_segments') as any)
                .delete()
                .eq('id', id)

            if (dbErr) throw dbErr

            setCustomSegments(prev => prev.filter(s => s.id !== id))

            // If the deleted segment was active, fall back to 'all'
            setActiveSegmentId(prev => prev === id ? 'all' : prev)
            return true
        } catch (e: any) {
            setError(e?.message ?? 'Failed to delete segment')
            return false
        }
    }, [])

    // ── Reorder (optimistic) ──────────────────────────────────
    const reorderSegments = useCallback(async (
        ordered: CustomSegment[],
    ): Promise<void> => {
        // Optimistic update first
        setCustomSegments(ordered)

        try {
            const supabase = createClient()
            const updates = ordered.map((s, i) => ({
                id: s.id,
                sort_order: i,
            }))

            for (const u of updates) {
                await (supabase
                    .from('listing_segments') as any)
                    .update({ sort_order: u.sort_order })
                    .eq('id', u.id)
            }
        } catch (e: any) {
            // Revert on failure
            setError(e?.message ?? 'Failed to reorder segments')
            refresh()
        }
    }, [refresh])

    return {
        segments,
        customSegments,
        activeSegmentId,
        loading,
        error,
        setActiveSegmentId,
        createSegment,
        updateSegment,
        deleteSegment,
        reorderSegments,
        refresh,
    }
}
