'use client'
// app/dashboard/design/StudioSettings.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Design Studio Settings Tab
// Saves to user_settings.design_studio (JSONB) in Supabase
// Auto-fills placeholders when creating/editing templates
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
    Store, Palette, Package, Code2,
    FileOutput, Save, Check, Loader2,
    RefreshCw,
} from 'lucide-react'
import ProDropdown from '@/components/ui/ProDropdown'
import type { DropdownOption } from '@/components/ui/ProDropdown'

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    accent: '#b8fa33',
    success: '#16a34a',
    successBg: '#dcfce7',
    danger: '#ef4444',
}

// ── Settings type ──────────────────────────────────────────────────────────
interface DesignStudioSettings {
    // Store Branding
    storeName: string
    storeLogoUrl: string
    primaryColour: string
    secondaryColour: string
    // eBay Defaults
    returnPeriod: string
    shippingText: string
    vatNumber: string
    ebayStoreUrl: string
    // Template Defaults
    defaultCategory: string
    canvasWidth: string
    defaultBgColour: string
    defaultFont: string
    // Editor Preferences
    autoSave: boolean
    defaultDevice: string
    showLineNumbers: boolean
    tabSize: string
    // Export
    includeComments: boolean
    minifyHtml: boolean
    addBranding: boolean
}

const DEFAULT_SETTINGS: DesignStudioSettings = {
    storeName: '',
    storeLogoUrl: '',
    primaryColour: '#7530fb',
    secondaryColour: '#b8fa33',
    returnPeriod: '30',
    shippingText: 'Free UK Shipping',
    vatNumber: '',
    ebayStoreUrl: '',
    defaultCategory: 'general',
    canvasWidth: '700',
    defaultBgColour: '#ffffff',
    defaultFont: 'Arial, Helvetica, sans-serif',
    autoSave: true,
    defaultDevice: 'desktop',
    showLineNumbers: true,
    tabSize: '2',
    includeComments: false,
    minifyHtml: false,
    addBranding: false,
}

// ── UI helpers ─────────────────────────────────────────────────────────────
function Section({ icon: Icon, title, description, children }: {
    icon: React.ElementType
    title: string
    description: string
    children: React.ReactNode
}) {
    return (
        <div className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: C.primaryLight }}>
                    <Icon size={15} style={{ color: C.primary }} />
                </div>
                <div>
                    <p className="text-[13px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                        {title}
                    </p>
                    <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                        {description}
                    </p>
                </div>
            </div>
            {/* Body */}
            <div className="p-5 flex flex-col gap-4">
                {children}
            </div>
        </div>
    )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                {label}
            </label>
            {children}
            {hint && (
                <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                    {hint}
                </p>
            )}
        </div>
    )
}

function Input({ value, onChange, placeholder, type = 'text' }: {
    value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
    return (
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-[13px] px-3 py-2.5 rounded-xl outline-none transition-all"
            style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, color: C.body, fontFamily: 'DM Sans, sans-serif' }}
            onFocus={e => e.currentTarget.style.borderColor = C.primary}
            onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
        />
    )
}

function Select({ value, onChange, options }: {
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
}) {
    const ddOptions: DropdownOption[] = options.map(o => ({
        val: o.value, label: o.label, enabled: true,
    }))
    return (
        <ProDropdown
            prefix=""
            currentValue={value}
            options={ddOptions}
            onChanged={onChange}
            width="full"
        />
    )
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
            <button
                onClick={() => onChange(!value)}
                className="relative shrink-0 transition-all"
                style={{
                    width: 40, height: 22, borderRadius: 11,
                    backgroundColor: value ? C.primary : C.border,
                    border: 'none', cursor: 'pointer',
                }}>
                <span style={{
                    position: 'absolute', top: 3,
                    left: value ? 21 : 3,
                    width: 16, height: 16,
                    borderRadius: '50%', backgroundColor: '#fff',
                    transition: 'left 0.2s ease',
                }} />
            </button>
        </div>
    )
}

function ColourInput({ value, onChange }: { value: string; onChange: (v: string) => void; label: string }) {
    return (
        <div className="relative w-full">
            <label className="flex items-center gap-2 w-full rounded-xl overflow-hidden cursor-pointer"
                style={{ border: `2px solid ${value}`, transition: 'border-color 0.2s' }}>
                <input
                    type="color"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                />
                <div style={{
                    width: 40, height: 40, backgroundColor: value,
                    borderRadius: '10px 0 0 10px', flexShrink: 0,
                }} />
                <span className="flex-1 text-[13px] font-semibold px-2"
                    style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                    {value}
                </span>
            </label>
        </div>
    )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function StudioSettings() {
    const supabase = createClient()
    const [settings, setSettings] = useState<DesignStudioSettings>(DEFAULT_SETTINGS)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Load settings
    useEffect(() => {
        async function load() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                const { data } = await supabase
                    .from('user_settings')
                    .select('design_studio')
                    .eq('id', user.id)
                    .single() as { data: { design_studio: Record<string, unknown> } | null, error: unknown }
                if (data?.design_studio && Object.keys(data.design_studio).length > 0) {
                    setSettings({ ...DEFAULT_SETTINGS, ...(data.design_studio as Partial<DesignStudioSettings>) })
                }
            } catch (e) {
                console.error('Failed to load settings:', e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Save settings
    const save = useCallback(async (s: DesignStudioSettings) => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('user_settings') as any)
                .upsert({ id: user.id, design_studio: s, updated_at: new Date().toISOString() })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (e) {
            console.error('Failed to save:', e)
        } finally {
            setSaving(false)
        }
    }, [])

    // Update a field
    function update<K extends keyof DesignStudioSettings>(key: K, value: DesignStudioSettings[K]) {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    // Reset to defaults
    function resetDefaults() {
        setSettings(DEFAULT_SETTINGS)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 size={20} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto" style={{ backgroundColor: C.bg }}>
            <div className="max-w-2xl mx-auto px-6 py-8">

                {/* Page header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-[22px] font-bold mb-0.5"
                            style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                            Studio Settings
                        </h1>
                        <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            Configure your template editor preferences and store defaults
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={resetDefaults}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
                            style={{ backgroundColor: C.surface, color: C.secondary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            <RefreshCw size={12} /> Reset
                        </button>
                        <button onClick={() => save(settings)}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all hover:opacity-90 disabled:opacity-60"
                            style={{ backgroundColor: saved ? C.success : C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            {saving
                                ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                                : saved
                                    ? <><Check size={13} /> Saved!</>
                                    : <><Save size={13} /> Save Settings</>
                            }
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-5">

                    {/* 1. Store Branding */}
                    <Section icon={Store} title="Store Branding"
                        description="Your store details — auto-fills {{SELLER_NAME}}, {{STORE_LOGO_URL}} placeholders">
                        <Field label="Store / Seller Name"
                            hint="Used in {{SELLER_NAME}} placeholder across all templates">
                            <Input value={settings.storeName} onChange={v => update('storeName', v)}
                                placeholder="My eBay Store" />
                        </Field>
                        <Field label="Store Logo URL"
                            hint="Direct image URL used in {{STORE_LOGO_URL}} placeholder">
                            <Input value={settings.storeLogoUrl} onChange={v => update('storeLogoUrl', v)}
                                placeholder="https://your-store.com/logo.png" />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Primary Brand Colour">
                                <ColourInput value={settings.primaryColour}
                                    onChange={v => update('primaryColour', v)} label="Primary" />
                            </Field>
                            <Field label="Secondary Brand Colour">
                                <ColourInput value={settings.secondaryColour}
                                    onChange={v => update('secondaryColour', v)} label="Secondary" />
                            </Field>
                        </div>
                        <Field label="eBay Store URL">
                            <Input value={settings.ebayStoreUrl} onChange={v => update('ebayStoreUrl', v)}
                                placeholder="https://www.ebay.co.uk/str/your-store-name" />
                        </Field>
                    </Section>

                    {/* 2. eBay Defaults */}
                    <Section icon={Package} title="eBay Defaults"
                        description="Auto-fills {{RETURNS_PERIOD}}, {{SHIPPING_INFO}}, {{VAT_NUMBER}} placeholders">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Default Return Period">
                                <Select value={settings.returnPeriod}
                                    onChange={v => update('returnPeriod', v)}
                                    options={[
                                        { value: '14', label: '14 Days' },
                                        { value: '30', label: '30 Days' },
                                        { value: '60', label: '60 Days' },
                                        { value: '90', label: '90 Days' },
                                    ]} />
                            </Field>
                            <Field label="Tab Size (Code Editor)">
                                <Select value={settings.tabSize}
                                    onChange={v => update('tabSize', v)}
                                    options={[
                                        { value: '2', label: '2 Spaces' },
                                        { value: '4', label: '4 Spaces' },
                                    ]} />
                            </Field>
                        </div>
                        <Field label="Default Shipping Text"
                            hint="Used in {{SHIPPING_INFO}} placeholder">
                            <Input value={settings.shippingText} onChange={v => update('shippingText', v)}
                                placeholder="Free UK Shipping · Dispatched within 24 hours" />
                        </Field>
                        <Field label="VAT Number" hint="Used in {{VAT_NUMBER}} placeholder">
                            <Input value={settings.vatNumber} onChange={v => update('vatNumber', v)}
                                placeholder="GB123456789" />
                        </Field>
                    </Section>

                    {/* 3. Template Defaults */}
                    <Section icon={Palette} title="Template Defaults"
                        description="Default values when creating a new template">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Default Category">
                                <Select value={settings.defaultCategory}
                                    onChange={v => update('defaultCategory', v)}
                                    options={[
                                        { value: 'general', label: 'General' },
                                        { value: 'electronics', label: 'Electronics' },
                                        { value: 'fashion', label: 'Fashion & Beauty' },
                                        { value: 'home', label: 'Home & Garden' },
                                        { value: 'auto', label: 'Auto Parts' },
                                        { value: 'collectibles', label: 'Collectibles' },
                                        { value: 'sports', label: 'Sports & Outdoors' },
                                        { value: 'books', label: 'Books & Media' },
                                    ]} />
                            </Field>
                            <Field label="Canvas Width">
                                <Select value={settings.canvasWidth}
                                    onChange={v => update('canvasWidth', v)}
                                    options={[
                                        { value: '600', label: '600px' },
                                        { value: '700', label: '700px (Recommended)' },
                                        { value: '800', label: '800px' },
                                    ]} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Default Background Colour">
                                <ColourInput value={settings.defaultBgColour}
                                    onChange={v => update('defaultBgColour', v)} label="BG" />
                            </Field>
                            <Field label="Default Font Family">
                                <Select value={settings.defaultFont}
                                    onChange={v => update('defaultFont', v)}
                                    options={[
                                        { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
                                        { value: 'Georgia, serif', label: 'Georgia' },
                                        { value: 'Verdana, sans-serif', label: 'Verdana' },
                                        { value: 'Tahoma, sans-serif', label: 'Tahoma' },
                                        { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
                                    ]} />
                            </Field>
                        </div>
                    </Section>

                    {/* 4. Editor Preferences */}
                    <Section icon={Code2} title="Editor Preferences"
                        description="Configure the HTML code editor behaviour">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Default Preview Device">
                                <Select value={settings.defaultDevice}
                                    onChange={v => update('defaultDevice', v)}
                                    options={[
                                        { value: 'desktop', label: 'Desktop' },
                                        { value: 'tablet', label: 'Tablet' },
                                        { value: 'mobile', label: 'Mobile' },
                                    ]} />
                            </Field>
                            <Field label="Tab Size (Code Editor)">
                                <Select value={settings.tabSize}
                                    onChange={v => update('tabSize', v)}
                                    options={[
                                        { value: '2', label: '2 Spaces' },
                                        { value: '4', label: '4 Spaces' },
                                    ]} />
                            </Field>
                        </div>
                        <div className="rounded-xl p-4 flex flex-col gap-3"
                            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                            <Toggle value={settings.autoSave}
                                onChange={v => update('autoSave', v)}
                                label="Auto-save drafts while editing" />
                            <Toggle value={settings.showLineNumbers}
                                onChange={v => update('showLineNumbers', v)}
                                label="Show line numbers in code editor" />
                        </div>
                    </Section>

                    {/* 5. Export Settings */}
                    <Section icon={FileOutput} title="Export Settings"
                        description="Control how HTML is exported from templates">
                        <div className="rounded-xl p-4 flex flex-col gap-3"
                            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                            <Toggle value={settings.includeComments}
                                onChange={v => update('includeComments', v)}
                                label="Include block comments in exported HTML" />
                            <Toggle value={settings.minifyHtml}
                                onChange={v => update('minifyHtml', v)}
                                label="Minify HTML on export (removes whitespace)" />
                            <Toggle value={settings.addBranding}
                                onChange={v => update('addBranding', v)}
                                label="Add <!-- Built with Riazify --> footer comment" />
                        </div>
                    </Section>

                    {/* Placeholder reference */}
                    <div className="rounded-2xl p-5"
                        style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}>
                        <p className="text-[12px] font-bold mb-3"
                            style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                            PLACEHOLDER REFERENCE — Your settings auto-fill these:
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                            {[
                                ['{{SELLER_NAME}}', settings.storeName || 'Not set'],
                                ['{{STORE_LOGO_URL}}', settings.storeLogoUrl ? 'Set ✓' : 'Not set'],
                                ['{{SHIPPING_INFO}}', settings.shippingText || 'Not set'],
                                ['{{RETURNS_PERIOD}}', `${settings.returnPeriod} days`],
                                ['{{VAT_NUMBER}}', settings.vatNumber || 'Not set'],
                                ['{{EBAY_STORE_URL}}', settings.ebayStoreUrl ? 'Set ✓' : 'Not set'],
                            ].map(([ph, val]) => (
                                <div key={ph} className="flex items-center gap-2 py-1">
                                    <code className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                        style={{ backgroundColor: 'rgba(117,48,251,0.1)', color: C.primary, fontFamily: 'monospace' }}>
                                        {ph}
                                    </code>
                                    <span className="text-[11px] truncate"
                                        style={{ color: val === 'Not set' ? C.muted : C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                        {val}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save button bottom */}
                    <button onClick={() => save(settings)}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold transition-all hover:opacity-90 disabled:opacity-60"
                        style={{ backgroundColor: saved ? C.success : C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        {saving
                            ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                            : saved
                                ? <><Check size={15} /> Settings Saved!</>
                                : <><Save size={15} /> Save All Settings</>
                        }
                    </button>

                </div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
