'use client'
// components/ui/VisualEditor/IconRail.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Icon Rail
//
// The narrow (40px) dark icon navigation rail on the far left of the editor.
// Matches the Riazify sidebar design system exactly:
//   Background:       #1e1535  (sidebar-bg)
//   Inactive icons:   #a89cc8  (sidebar-text)
//   Active icons:     #b8fa33  (sidebar-indicator / accent)
//   Active item bg:   #2d1f4e  (sidebar-active-bg)
//   Active indicator: 2px left border in #b8fa33
//
// Six tabs:
//   Blocks      ← LayoutTemplate icon
//   Templates   ← Layers icon
//   Body        ← Settings icon
//   Images      ← Image icon
//   Audit       ← ShieldCheck icon  (shows error badge when issues found)
//   Tokens      ← Tag icon
//
// Props:
//   activeTab       — currently active tab id
//   onTabChange     — called with new tab id when icon clicked
//   auditErrors     — number of audit errors (shows red badge on Audit icon)
//   panelOpen       — whether the content panel is open
//   onTogglePanel   — collapse/expand the content panel
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import {
    LayoutTemplate, Layers, Settings, Image,
    ShieldCheck, Tag, Bookmark, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'

// ── Design tokens — exact Riazify sidebar system ──────────────────────────────
const C = {
    sidebarBg: '#1e1535',
    sidebarActive: '#2d1f4e',
    sidebarText: '#a89cc8',
    sidebarAccent: '#ffffff',
    indicator: '#b8fa33',
    border: '#2d1f4e',
    danger: '#ef4444',
    tooltipBg: '#1e1535',
    tooltipText: '#ffffff',
    tooltipBorder: '#2d1f4e',
}

// ── Tab definition ────────────────────────────────────────────────────────────
export type RailTabId = 'blocks' | 'templates' | 'body' | 'images' | 'audit' | 'tokens' | 'saved'

interface RailTab {
    id: RailTabId
    label: string
    Icon: React.ElementType
    shortcut?: string
}

const TABS: RailTab[] = [
    { id: 'blocks', label: 'Blocks', Icon: LayoutTemplate, shortcut: 'B' },
    { id: 'templates', label: 'Templates', Icon: Layers, shortcut: 'T' },
    { id: 'body', label: 'Body', Icon: Settings, shortcut: 'O' },
    { id: 'images', label: 'Images', Icon: Image, shortcut: 'I' },
    { id: 'audit', label: 'Audit', Icon: ShieldCheck, shortcut: 'A' },
    { id: 'tokens', label: 'Tokens', Icon: Tag, shortcut: 'K' },
    { id: 'saved', label: 'Saved', Icon: Bookmark, shortcut: 'S' },
]

// ── Props ─────────────────────────────────────────────────────────────────────
interface IconRailProps {
    activeTab: RailTabId | null
    onTabChange: (tab: RailTabId) => void
    auditErrors: number
    panelOpen: boolean
    onTogglePanel: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function IconRail({
    activeTab,
    onTabChange,
    auditErrors,
    panelOpen,
    onTogglePanel,
}: IconRailProps) {
    return (
        <div style={{
            width: 44,
            minWidth: 44,
            height: '100%',
            backgroundColor: C.sidebarBg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 8,
            paddingBottom: 8,
            flexShrink: 0,
            borderRight: `1px solid ${C.border}`,
            zIndex: 2,
        }}>
            {/* ── Tab icons ── */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                flex: 1,
            }}>
                {TABS.map(tab => (
                    <RailIcon
                        key={tab.id}
                        tab={tab}
                        isActive={activeTab === tab.id}
                        badge={tab.id === 'audit' && auditErrors > 0 ? auditErrors : 0}
                        onClick={() => {
                            if (activeTab === tab.id) {
                                // Clicking active tab toggles panel
                                onTogglePanel()
                            } else {
                                onTabChange(tab.id)
                                if (!panelOpen) onTogglePanel()
                            }
                        }}
                    />
                ))}
            </div>

            {/* ── Collapse toggle at bottom ── */}
            <div style={{ paddingBottom: 4 }}>
                <CollapseButton panelOpen={panelOpen} onToggle={onTogglePanel} />
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// RAIL ICON
// Individual tab icon button with tooltip + optional badge
// ─────────────────────────────────────────────────────────────────────────────
function RailIcon({
    tab, isActive, badge, onClick,
}: {
    tab: RailTab
    isActive: boolean
    badge: number
    onClick: () => void
}) {
    const [hovered, setHovered] = useState(false)
    const { Icon } = tab

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Active indicator — left border */}
            {isActive && (
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 2,
                    height: 20,
                    backgroundColor: C.indicator,
                    borderRadius: '0 2px 2px 0',
                }} />
            )}

            {/* Icon button */}
            <button
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                title={`${tab.label}${tab.shortcut ? ` (${tab.shortcut})` : ''}`}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 0,
                    backgroundColor: isActive
                        ? C.sidebarActive
                        : hovered
                            ? C.sidebarActive + 'aa'
                            : 'transparent',
                    transition: 'background-color 0.15s',
                }}
            >
                <Icon
                    size={18}
                    style={{
                        color: isActive
                            ? C.indicator
                            : hovered
                                ? '#d4cce8'
                                : C.sidebarText,
                        transition: 'color 0.15s',
                        flexShrink: 0,
                    }}
                />

                {/* Error badge */}
                {badge > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        minWidth: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: C.danger,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 3px',
                    }}>
                        <span style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 9,
                            fontWeight: 700,
                            color: '#ffffff',
                            lineHeight: 1,
                        }}>
                            {badge > 9 ? '9+' : badge}
                        </span>
                    </div>
                )}
            </button>

            {/* Tooltip */}
            {hovered && (
                <div style={{
                    position: 'fixed',
                    left: 52,
                    // We use a fixed pixel top — component is always in the same vertical
                    // range so we calculate approximate offset via the tab index
                    // This is handled by the parent via CSS transform
                    zIndex: 1000,
                    backgroundColor: C.tooltipBg,
                    border: `1px solid ${C.tooltipBorder}`,
                    borderRadius: 7,
                    padding: '5px 10px',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap' as const,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    // Position is set by wrapping div below
                    transform: 'translateY(-50%)',
                    top: '50%',
                }}>
                    <p style={{
                        margin: 0,
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.tooltipText,
                    }}>
                        {tab.label}
                    </p>
                    {tab.shortcut && (
                        <p style={{
                            margin: '1px 0 0',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 9,
                            color: C.sidebarText,
                        }}>
                            Press {tab.shortcut}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLAPSE BUTTON
// At the bottom of the rail — collapses/expands the content panel
// ─────────────────────────────────────────────────────────────────────────────
function CollapseButton({
    panelOpen, onToggle,
}: {
    panelOpen: boolean
    onToggle: () => void
}) {
    const [hovered, setHovered] = useState(false)
    const Icon = panelOpen ? PanelLeftClose : PanelLeftOpen

    return (
        <button
            onClick={onToggle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={panelOpen ? 'Collapse panel' : 'Expand panel'}
            style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: `1px solid ${hovered ? C.sidebarText + '44' : 'transparent'}`,
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.15s',
                backgroundColor: hovered ? C.sidebarActive : 'transparent',
            }}
        >
            <Icon
                size={15}
                style={{
                    color: hovered ? '#d4cce8' : C.sidebarText,
                    transition: 'color 0.15s',
                }}
            />
        </button>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED TAB LIST — used by SidebarPanel to know the order
// ─────────────────────────────────────────────────────────────────────────────
export { TABS }
export type { RailTab }
