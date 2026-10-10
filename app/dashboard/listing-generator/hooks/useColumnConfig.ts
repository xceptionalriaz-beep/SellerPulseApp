'use client'
// app/dashboard/listing-generator/hooks/useColumnConfig.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Column Config Hook
//
// Manages per-segment column visibility and order.
// State is persisted to localStorage under lg_column_config_v1.
// SSR-safe: localStorage read deferred until after mount.
//
// Returns:
//   visibleColumns   — ordered ColumnDef[] the table should render
//   allColumns       — full COLUMN_DEFS list (for the panel)
//   toggleColumn     — show/hide a column by id
//   moveColumn       — reorder by dragging (from index → to index, visible list only)
//   resetToDefaults  — wipe user customisation for this segment
//   isDefault        — true when the current config matches the segment default
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    COLUMN_DEFS,
    COLUMN_BY_ID,
    getDefaultColumnsForSegment,
} from '../data/column-definitions'
import type { ColumnDef } from '../data/column-definitions'

// ── Storage schema ────────────────────────────────────────────
const STORAGE_KEY = 'lg_column_config_v1'

// { [segmentId: string]: { visibleIds: string[] } }
type StoredConfig = Record<string, { visibleIds: string[] }>

function readStorage(): StoredConfig {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return {}
        return JSON.parse(raw) as StoredConfig
    } catch {
        return {}
    }
}

function writeStorage(config: StoredConfig) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
        // storage full / blocked — silently degrade
    }
}

// ── Hook ──────────────────────────────────────────────────────
export function useColumnConfig(segmentId: string) {
    // visibleIds — ordered list of column IDs that are shown.
    // null = not yet hydrated from localStorage (SSR guard).
    const [visibleIds, setVisibleIds] = useState<string[] | null>(null)

    // ── Hydrate from localStorage after mount ─────────────────
    useEffect(() => {
        const stored = readStorage()
        if (stored[segmentId]) {
            // Validate — filter out any IDs no longer in COLUMN_DEFS
            const valid = stored[segmentId].visibleIds.filter(id => COLUMN_BY_ID[id])
            setVisibleIds(valid)
        } else {
            setVisibleIds(getDefaultColumnsForSegment(segmentId))
        }
    }, [segmentId])

    // ── Reset when segment switches + not yet customised ──────
    // (The effect above handles it via the segmentId dep)

    // ── Derived: current ids, falling back to defaults pre-hydration
    const currentIds = visibleIds ?? getDefaultColumnsForSegment(segmentId)

    // ── Derived: ordered ColumnDef[] for visible columns ──────
    const visibleColumns = useMemo<ColumnDef[]>(
        () => currentIds.map(id => COLUMN_BY_ID[id]).filter(Boolean),
        [currentIds],
    )

    // ── isDefault ─────────────────────────────────────────────
    const isDefault = useMemo(() => {
        const defaults = getDefaultColumnsForSegment(segmentId)
        return JSON.stringify(currentIds) === JSON.stringify(defaults)
    }, [currentIds, segmentId])

    // ── Persist whenever visibleIds changes ───────────────────
    const persist = useCallback((ids: string[]) => {
        setVisibleIds(ids)
        const stored = readStorage()
        stored[segmentId] = { visibleIds: ids }
        writeStorage(stored)
    }, [segmentId])

    // ── toggleColumn ──────────────────────────────────────────
    const toggleColumn = useCallback((id: string) => {
        const next = currentIds.includes(id)
            ? currentIds.filter(c => c !== id)           // hide
            : [...currentIds, id]                         // show — appended at end
        persist(next)
    }, [currentIds, persist])

    // ── moveColumn: drag-to-reorder within the visible list ───
    // fromIdx and toIdx are indices in the visible list
    const moveColumn = useCallback((fromIdx: number, toIdx: number) => {
        if (fromIdx === toIdx) return
        const next = [...currentIds]
        const [moved] = next.splice(fromIdx, 1)
        next.splice(toIdx, 0, moved)
        persist(next)
    }, [currentIds, persist])

    // ── resetToDefaults ───────────────────────────────────────
    const resetToDefaults = useCallback(() => {
        const defaults = getDefaultColumnsForSegment(segmentId)
        persist(defaults)
        // Also remove from storage so future loads pick up defaults cleanly
        const stored = readStorage()
        delete stored[segmentId]
        writeStorage(stored)
        setVisibleIds(defaults)
    }, [segmentId, persist])

    return {
        visibleColumns,
        allColumns: COLUMN_DEFS,
        visibleIds: currentIds,
        isDefault,
        toggleColumn,
        moveColumn,
        resetToDefaults,
    }
}
