'use client'
// components/ui/VisualEditor/SidebarPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Sidebar Panel
//
// The sliding content panel that sits between the IconRail and the Canvas.
// Renders whichever tab is active, passing the correct props to each.
//
// Layout in context:
//   [IconRail 44px] [SidebarPanel 260px] [Canvas flex-1] [PropertiesPanel 280px]
//
// The panel can be collapsed (width 0, overflow hidden) — controlled by
// IconRail's collapse button. Transition is smooth (CSS transition on width).
//
// Props received from VisualEditor.tsx:
//   activeTab        — which tab to show
//   isOpen           — panel visible or collapsed
//   All tab-specific props (see below)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { RailTabId } from './IconRail'
import { Block, BlockType, CanvasSettings } from './blocks'
import BlockLibrary from './BlockLibrary'
import TemplatesTab from './TemplatesTab'
import BodySettings from './BodySettings'
import ImagesTab from './ImagesTab'
import AuditTab from './AuditTab'
import TokensTab from './TokensTab'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    dark: '#1e1535',
    primary: '#7530fb',
    muted: '#9ca3af',
}

// ── Placeholder group types (mirrors page.tsx) ────────────────────────────────
interface PlaceholderItem {
    label: string
    value: string
    example?: string
}

interface PlaceholderGroup {
    group: string
    items: PlaceholderItem[]
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface SidebarPanelProps {
    // Panel state
    activeTab: RailTabId | null
    isOpen: boolean

    // BlockLibrary props
    onAddBlock: (type: BlockType) => void
    onDragStart: (type: BlockType) => void
    onDragEnd: () => void
    draggedType: BlockType | null

    // TemplatesTab props
    onInsertTemplate: (blocks: Block[]) => void

    // BodySettings props
    canvasSettings: CanvasSettings
    onUpdateSettings: (settings: CanvasSettings) => void

    // ImagesTab props
    onInsertImage: (url: string, alt: string) => void
    selectedId: string | null
    blocks: Block[]

    // AuditTab props
    html: string
    blockCount: number

    // TokensTab props
    placeholders: PlaceholderGroup[]
    onInsertToken: (value: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SidebarPanel({
    activeTab,
    isOpen,
    onAddBlock,
    onDragStart,
    onDragEnd,
    draggedType,
    onInsertTemplate,
    canvasSettings,
    onUpdateSettings,
    onInsertImage,
    selectedId,
    blocks,
    html,
    blockCount,
    placeholders,
    onInsertToken,
}: SidebarPanelProps) {
    return (
        <div style={{
            width: isOpen ? 260 : 0,
            minWidth: isOpen ? 260 : 0,
            height: '100%',
            overflow: 'hidden',
            transition: 'width 0.25s ease, min-width 0.25s ease',
            flexShrink: 0,
            borderRight: isOpen ? `1px solid ${C.border}` : 'none',
            backgroundColor: C.bg,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
        }}>
            {/* Inner container — always 260px wide, hidden by parent overflow:hidden */}
            <div style={{
                width: 260,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>
                {/* ── Tab header strip ── */}
                {activeTab && (
                    <TabHeader activeTab={activeTab} />
                )}

                {/* ── Active tab content ── */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    {activeTab === 'blocks' && (
                        <BlockLibrary
                            onAddBlock={onAddBlock}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            draggedType={draggedType}
                        />
                    )}

                    {activeTab === 'templates' && (
                        <TemplatesTab
                            onInsert={onInsertTemplate}
                        />
                    )}

                    {activeTab === 'body' && (
                        <BodySettings
                            settings={canvasSettings}
                            onUpdate={onUpdateSettings}
                        />
                    )}

                    {activeTab === 'images' && (
                        <ImagesTab
                            onInsert={onInsertImage}
                            selectedId={selectedId}
                            blocks={blocks}
                        />
                    )}

                    {activeTab === 'audit' && (
                        <AuditTab
                            html={html}
                            blockCount={blockCount}
                        />
                    )}

                    {activeTab === 'tokens' && (
                        <TokensTab
                            placeholders={placeholders}
                            onInsert={onInsertToken}
                        />
                    )}

                    {/* Null state — no tab selected (panel shouldn't open, but safety fallback) */}
                    {!activeTab && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            gap: 8,
                            padding: 24,
                        }}>
                            <p style={{
                                margin: 0,
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 12,
                                color: C.muted,
                                textAlign: 'center',
                            }}>
                                Select a tab from the left
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB HEADER STRIP
// Thin dark header showing the active tab name — matches icon rail design
// ─────────────────────────────────────────────────────────────────────────────
const TAB_LABELS: Record<RailTabId, string> = {
    blocks: 'Content & Blocks',
    templates: 'Section Templates',
    body: 'Canvas Settings',
    images: 'Images',
    audit: 'eBay Audit',
    tokens: 'Dynamic Tokens',
}

function TabHeader({ activeTab }: { activeTab: RailTabId }) {
    return (
        <div style={{
            height: 36,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 14,
            backgroundColor: C.dark,
            borderBottom: `1px solid #2d1f4e`,
            flexShrink: 0,
        }}>
            <p style={{
                margin: 0,
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: 11,
                color: '#ffffff',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
            }}>
                {TAB_LABELS[activeTab]}
            </p>
        </div>
    )
}
