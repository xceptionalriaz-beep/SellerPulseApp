'use client'
// components/ui/VisualEditor/BodySettings.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Body Settings Tab
//
// Global canvas controls — affect the document shell, not individual blocks.
// Changes call onUpdate(settings) which triggers assembleDocument() with
// the new settings in VisualEditor.tsx.
//
// Controls:
//   Canvas Max-Width    — 600 / 700 / 800 / custom px
//   Canvas Background   — inner table bg colour
//   Body Background     — outer page bg colour
//   Global Font Stack   — Arial / Inter / Roboto / Montserrat / Trebuchet MS
//   Global Text Colour  — body text colour
//   Global Link Colour  — <a> colour
//   Content Alignment   — center / left
//
// Props:
//   settings   — current CanvasSettings
//   onUpdate   — called with full updated CanvasSettings on every change
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { CanvasSettings, DEFAULT_CANVAS_SETTINGS } from './blocks'
import { Monitor, Type, AlignCenter, AlignLeft, RotateCcw } from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    inputBorder: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryBorder: '#ddd6fe',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    accent: '#b8fa33',
    success: '#16a34a',
    successLight: '#dcfce7',
}

// ── Font options ──────────────────────────────────────────────────────────────
const FONT_OPTIONS = [
    { label: 'Arial (Default)', value: 'Arial, Helvetica, sans-serif', preview: 'Arial' },
    { label: 'Inter', value: 'Inter, Arial, sans-serif', preview: 'Inter' },
    { label: 'Roboto', value: 'Roboto, Arial, sans-serif', preview: 'Roboto' },
    { label: 'Montserrat', value: 'Montserrat, Arial, sans-serif', preview: 'Montserrat' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS, Arial, sans-serif', preview: 'Trebuchet MS' },
    { label: 'Georgia (Serif)', value: 'Georgia, Times New Roman, serif', preview: 'Georgia' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif', preview: 'Verdana' },
    { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif', preview: 'Tahoma' },
]

// ── Width presets ─────────────────────────────────────────────────────────────
const WIDTH_PRESETS = [
    { label: '600px', value: 600 },
    { label: '700px', value: 700 },
    { label: '800px', value: 800 },
]

// ── Props ─────────────────────────────────────────────────────────────────────
interface BodySettingsProps {
    settings: CanvasSettings
    onUpdate: (settings: CanvasSettings) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BodySettings({ settings, onUpdate }: BodySettingsProps) {
    const [customWidth, setCustomWidth] = useState(String(settings.maxWidth))
    const [customWidthFocused, setCustomWidthFocused] = useState(false)
    const [resetConfirm, setResetConfirm] = useState(false)

    // Patch one or more keys and emit
    const patch = (delta: Partial<CanvasSettings>) => {
        onUpdate({ ...settings, ...delta })
    }

    // Reset to defaults
    const handleReset = () => {
        if (resetConfirm) {
            onUpdate({ ...DEFAULT_CANVAS_SETTINGS })
            setCustomWidth('700')
            setResetConfirm(false)
        } else {
            setResetConfirm(true)
            setTimeout(() => setResetConfirm(false), 2500)
        }
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: C.bg,
        }}>
            {/* ── Header ── */}
            <div style={{
                padding: '14px 14px 12px',
                borderBottom: `1px solid ${C.border}`,
                backgroundColor: C.surface,
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{
                        margin: 0,
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 700,
                        fontSize: 13,
                        color: C.dark,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                    }}>
                        Canvas Settings
                    </p>
                    {/* Reset button */}
                    <button
                        onClick={handleReset}
                        title={resetConfirm ? 'Click again to confirm reset' : 'Reset to defaults'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            border: `1px solid ${resetConfirm ? '#fecaca' : C.border}`,
                            borderRadius: 6,
                            backgroundColor: resetConfirm ? '#fee2e2' : 'transparent',
                            color: resetConfirm ? '#ef4444' : C.muted,
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                    >
                        <RotateCcw size={10} />
                        {resetConfirm ? 'Confirm' : 'Reset'}
                    </button>
                </div>
                <p style={{
                    margin: '4px 0 0',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 11,
                    color: C.muted,
                    lineHeight: 1.5,
                }}>
                    Global settings affect the entire template
                </p>
            </div>

            {/* ── Settings content ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 24px' }}>

                {/* ── Canvas Width ── */}
                <Section title="Canvas Width" Icon={Monitor}>
                    {/* Width preset buttons */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                        {WIDTH_PRESETS.map(preset => (
                            <button
                                key={preset.value}
                                onClick={() => {
                                    patch({ maxWidth: preset.value })
                                    setCustomWidth(String(preset.value))
                                }}
                                style={{
                                    flex: 1,
                                    padding: '6px 0',
                                    border: `1px solid ${settings.maxWidth === preset.value ? C.primary : C.border}`,
                                    borderRadius: 7,
                                    backgroundColor: settings.maxWidth === preset.value ? C.primaryLight : 'transparent',
                                    color: settings.maxWidth === preset.value ? C.primary : C.secondary,
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontSize: 11,
                                    fontWeight: settings.maxWidth === preset.value ? 700 : 400,
                                    cursor: 'pointer',
                                    transition: 'all 0.12s',
                                }}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom width input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.secondary, flexShrink: 0 }}>
                            Custom:
                        </span>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="number"
                                value={customWidthFocused ? customWidth : settings.maxWidth}
                                min={400}
                                max={900}
                                onChange={e => setCustomWidth(e.target.value)}
                                onFocus={() => {
                                    setCustomWidthFocused(true)
                                    setCustomWidth(String(settings.maxWidth))
                                }}
                                onBlur={() => {
                                    setCustomWidthFocused(false)
                                    const v = Math.max(400, Math.min(900, parseInt(customWidth) || 700))
                                    patch({ maxWidth: v })
                                    setCustomWidth(String(v))
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        const v = Math.max(400, Math.min(900, parseInt(customWidth) || 700))
                                        patch({ maxWidth: v })
                                        e.currentTarget.blur()
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box' as const,
                                    padding: '5px 32px 5px 8px',
                                    border: `1px solid ${customWidthFocused ? C.primary : C.inputBorder}`,
                                    borderRadius: 6,
                                    backgroundColor: C.surface,
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontSize: 12,
                                    color: C.body,
                                    outline: 'none',
                                    boxShadow: customWidthFocused ? `0 0 0 3px ${C.primary}22` : 'none',
                                }}
                            />
                            <span style={{
                                position: 'absolute', right: 8, top: '50%',
                                transform: 'translateY(-50%)',
                                fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                                color: C.muted, pointerEvents: 'none',
                            }}>
                                px
                            </span>
                        </div>
                    </div>

                    <p style={{ margin: '5px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                        eBay recommended: 700px · Range: 400–900px
                    </p>
                </Section>

                {/* ── Background Colours ── */}
                <Section title="Background Colours" Icon={Monitor}>
                    <ColorRow
                        label="Canvas background"
                        hint="Inner content area"
                        value={settings.canvasBg}
                        onChange={v => patch({ canvasBg: v })}
                    />
                    <ColorRow
                        label="Page background"
                        hint="Outer body bg (email clients)"
                        value={settings.bgColor}
                        onChange={v => patch({ bgColor: v })}
                    />

                    {/* Quick colour swatches for canvas bg */}
                    <div style={{ marginTop: 6 }}>
                        <p style={{ margin: '0 0 5px', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                            Quick canvas bg:
                        </p>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' as const }}>
                            {[
                                { color: '#ffffff', label: 'White' },
                                { color: '#f8f7ff', label: 'Purple tint' },
                                { color: '#f8f8f8', label: 'Light grey' },
                                { color: '#1e1535', label: 'Dark' },
                                { color: '#f0fdf4', label: 'Green tint' },
                                { color: '#eff6ff', label: 'Blue tint' },
                            ].map(swatch => (
                                <button
                                    key={swatch.color}
                                    onClick={() => patch({ canvasBg: swatch.color })}
                                    title={swatch.label}
                                    style={{
                                        width: 24, height: 24,
                                        borderRadius: 6,
                                        backgroundColor: swatch.color,
                                        border: `2px solid ${settings.canvasBg === swatch.color ? C.primary : C.border}`,
                                        cursor: 'pointer',
                                        transition: 'border-color 0.12s',
                                        flexShrink: 0,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </Section>

                {/* ── Typography ── */}
                <Section title="Typography" Icon={Type}>
                    {/* Font stack */}
                    <div style={{ marginBottom: 10 }}>
                        <p style={{ margin: '0 0 6px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.body }}>
                            Font Family
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                            {FONT_OPTIONS.map(font => (
                                <button
                                    key={font.value}
                                    onClick={() => patch({ fontStack: font.value })}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '7px 10px',
                                        border: `1px solid ${settings.fontStack === font.value ? C.primary : C.border}`,
                                        borderRadius: 7,
                                        backgroundColor: settings.fontStack === font.value ? C.primaryLight : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.12s',
                                        textAlign: 'left' as const,
                                    }}
                                >
                                    <span style={{
                                        fontFamily: font.value,
                                        fontSize: 13,
                                        color: settings.fontStack === font.value ? C.primary : C.body,
                                        fontWeight: settings.fontStack === font.value ? 700 : 400,
                                    }}>
                                        {font.preview}
                                    </span>
                                    <span style={{
                                        fontFamily: 'DM Sans, sans-serif',
                                        fontSize: 9,
                                        color: settings.fontStack === font.value ? C.primary : C.muted,
                                        fontWeight: 600,
                                    }}>
                                        {font.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text + link colour */}
                    <ColorRow
                        label="Global text colour"
                        hint="Default body text"
                        value={settings.textColor}
                        onChange={v => patch({ textColor: v })}
                    />
                    <ColorRow
                        label="Global link colour"
                        hint="Hyperlink colour"
                        value={settings.linkColor}
                        onChange={v => patch({ linkColor: v })}
                    />
                </Section>

                {/* ── Alignment ── */}
                <Section title="Content Alignment" Icon={AlignCenter}>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {([
                            { val: 'center', label: 'Center', Icon: AlignCenter },
                            { val: 'left', label: 'Left', Icon: AlignLeft },
                        ] as const).map(opt => (
                            <button
                                key={opt.val}
                                onClick={() => patch({ align: opt.val })}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    padding: '8px 0',
                                    border: `1px solid ${settings.align === opt.val ? C.primary : C.border}`,
                                    borderRadius: 8,
                                    backgroundColor: settings.align === opt.val ? C.primaryLight : 'transparent',
                                    color: settings.align === opt.val ? C.primary : C.secondary,
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontSize: 12,
                                    fontWeight: settings.align === opt.val ? 700 : 400,
                                    cursor: 'pointer',
                                    transition: 'all 0.12s',
                                }}
                            >
                                <opt.Icon size={13} />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <p style={{ margin: '6px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                        Controls how the canvas sits inside the email client
                    </p>
                </Section>

                {/* ── Live preview strip ── */}
                <div style={{
                    marginTop: 4,
                    padding: 12,
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    backgroundColor: settings.bgColor,
                }}>
                    <p style={{ margin: '0 0 8px', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                        Preview
                    </p>
                    <div style={{
                        backgroundColor: settings.canvasBg,
                        maxWidth: Math.min(settings.maxWidth, 200),
                        margin: settings.align === 'center' ? '0 auto' : '0',
                        padding: '10px 14px',
                        borderRadius: 6,
                        border: `1px solid ${C.border}`,
                    }}>
                        <p style={{
                            margin: '0 0 4px',
                            fontFamily: settings.fontStack,
                            fontSize: 13,
                            fontWeight: 700,
                            color: settings.textColor,
                        }}>
                            {'{{PRODUCT_TITLE}}'}
                        </p>
                        <p style={{ margin: '0 0 4px', fontFamily: settings.fontStack, fontSize: 11, color: settings.textColor, opacity: 0.7 }}>
                            Preview of your font and colours
                        </p>
                        <a href="#" style={{ fontFamily: settings.fontStack, fontSize: 11, color: settings.linkColor }}>
                            Sample link →
                        </a>
                    </div>
                    <p style={{ margin: '6px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted, textAlign: 'center' as const }}>
                        Max width: {settings.maxWidth}px · {settings.align === 'center' ? 'Centred' : 'Left-aligned'}
                    </p>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE SECTION WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function Section({
    title, Icon, children,
}: {
    title: string
    Icon: React.ElementType
    children: React.ReactNode
}) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: 10, paddingBottom: 6,
                borderBottom: `1px solid ${C.border}`,
            }}>
                <Icon size={12} style={{ color: C.primary, flexShrink: 0 }} />
                <p style={{
                    margin: 0,
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 10, fontWeight: 700,
                    color: C.secondary,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.07em',
                }}>
                    {title}
                </p>
            </div>
            {children}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOUR ROW
// ─────────────────────────────────────────────────────────────────────────────
function ColorRow({
    label, hint, value, onChange,
}: {
    label: string
    hint?: string
    value: string
    onChange: (v: string) => void
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.body, display: 'block' }}>
                    {label}
                </span>
                {hint && (
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 9, color: C.muted }}>
                        {hint}
                    </span>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    style={{
                        width: 72, padding: '3px 6px',
                        border: `1px solid ${C.inputBorder}`,
                        borderRadius: 5,
                        fontFamily: 'monospace', fontSize: 10,
                        color: C.body, backgroundColor: C.surface,
                        outline: 'none',
                    }}
                />
                <input
                    type="color"
                    value={value.startsWith('#') && value.length >= 4 ? value : '#ffffff'}
                    onChange={e => onChange(e.target.value)}
                    style={{
                        width: 26, height: 26, padding: 2,
                        border: `1px solid ${C.inputBorder}`,
                        borderRadius: 6, cursor: 'pointer',
                        backgroundColor: 'transparent',
                    }}
                />
            </div>
        </div>
    )
}
