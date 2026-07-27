'use client'
// components/profit/CountrySettings.tsx
// All per-country settings panels extracted from page.tsx

import { Info } from 'lucide-react'
import ProDropdown from '@/components/ui/ProDropdown'

// ── Brand palette (must match page.tsx) ───────────────────────
const C = {
    lime: '#8fff00',
    dark: '#1a2410',
    border: '#e8ede2',
    muted: '#8a9e78',
    surface: '#ffffff',
    bg: '#f7f9f5',
    text: '#1a2410',
    red: '#b91c1c',
    amber: '#d97706',
    green: '#16a34a',
}

function SectionLabel({ children }: { children: string }) {
    return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', color: C.muted, margin: 0 }}>{children}</p>
}

// SelectField replaced by ProDropdown

// ── Props — everything the panels need from page.tsx ──────────
export interface CountrySettingsProps {
    country: string
    state: any
    patch: (updates: any) => void
}

// ══════════════════════════════════════════════════════════════
// COUNTRY SETTINGS PANELS
// ══════════════════════════════════════════════════════════════
export function CountrySettings({ country, state, patch }: CountrySettingsProps) {
    return (
        <>
            {country === 'UK' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>UK SELLER SETTINGS</SectionLabel>

                    {/* UK store tier note */}
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>
                            UK Shop subscription does not change your FVF %
                        </p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>
                            Unlike US, eBay UK shop tiers only provide free listing allowances and marketing tools — not reduced final value fee rates. All UK sellers pay the same FVF % regardless of shop level.
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>VAT registered business</span>
                            <span style={{ fontSize: 10, color: C.muted }}>
                                {state.isVATRegistered
                                    ? 'VAT registered — no 20% VAT surcharge on your eBay fees'
                                    : '⚠️ Not VAT registered — eBay adds 20% VAT to all your fees'}
                            </span>
                        </div>
                        <button
                            onClick={() => patch({ isVATRegistered: !state.isVATRegistered })}
                            style={{
                                position: 'relative', width: 38, height: 21, borderRadius: 999,
                                border: 'none', cursor: 'pointer', flexShrink: 0,
                                background: state.isVATRegistered ? C.lime : C.red,
                                transition: 'background 0.2s',
                            }}>
                            <span style={{
                                position: 'absolute', top: 2.5,
                                left: state.isVATRegistered ? 19 : 2,
                                width: 16, height: 16, borderRadius: '50%',
                                background: C.surface, transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block',
                            }} />
                        </button>
                    </div>

                    {/* International destination selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>International sale destination</label>
                        <ProDropdown
                            prefix=""
                            currentValue={state.ukIntlDestination}
                            options={[
                                { val: 'none', label: 'Domestic (UK buyer) — no international fee', enabled: true },
                                { val: 'eurozone', label: 'Eurozone + Northern Europe — 1.05%', enabled: true },
                                { val: 'us_canada', label: 'US & Canada — 1.8%', enabled: true },
                                { val: 'other', label: 'All other countries — 2.0%', enabled: true },
                            ]}
                            onChanged={v => patch({ ukIntlDestination: v })}
                            width="full"
                            maxItems={8}
                        />
                    </div>

                    {/* VAT warning banner */}
                    {!state.isVATRegistered && (
                        <div style={{
                            background: '#fef2f2', border: `1px solid ${C.red}`,
                            borderRadius: 8, padding: 10,
                        }}>
                            <p style={{ fontSize: 11, color: C.red, fontWeight: 600, margin: 0 }}>
                                20% VAT added to all eBay fees
                            </p>
                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>
                                Your effective FVF rate is 20% higher than shown. Register for VAT or provide your VAT ID to eBay to avoid this surcharge.
                            </p>
                        </div>
                    )}

                    {/* UK reduced per-order fee info */}
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                                Reduced per-order fee
                            </span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: C.green, background: '#dcfce7', padding: '2px 6px', borderRadius: 999 }}>
                                AUTO
                            </span>
                        </div>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                            For orders <strong>£10 or under</strong>, eBay charges <strong>£0.10</strong> per order (instead of £0.30/£0.40) in select categories: Coins, Collectables, Home & DIY, Appliances, Furniture. This is applied automatically when your category and price match.
                        </p>
                    </div>
                </div>
            )}

            {/* ── CA-specific controls ── */}
            {country === 'CA' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>CA SELLER SETTINGS</SectionLabel>

                    {/* CA store note */}
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>
                            CA store subscription lowers your FVF rates
                        </p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>
                            Unlike UK, Canada store subscribers get lower FVF % and the price threshold drops from C$7,500 to C$2,500. Select your store tier above to apply the correct rates.
                        </p>
                    </div>

                    {/* CA international destination */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>International sale destination</label>
                        <ProDropdown
                            prefix=""
                            currentValue={state.caIntlDestination}
                            options={[
                                { val: 'none', label: 'Domestic (Canadian buyer) — no international fee', enabled: true },
                                { val: 'us', label: 'United States — 0.4%', enabled: true },
                                { val: 'other', label: 'All other countries — 1.0%', enabled: true },
                            ]}
                            onChanged={v => patch({ caIntlDestination: v })}
                            width="full"
                            maxItems={8}
                        />
                    </div>

                    {/* CA INAD note */}
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, margin: '0 0 3px' }}>
                            CA INAD penalty is flat +5% — no scaling
                        </p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>
                            Unlike US/UK where the INAD penalty increases after 4+ months, Canada uses a flat +5 percentage points regardless of duration.
                        </p>
                    </div>
                </div>
            )}

            {/* ── AU-specific controls ── */}
            {country === 'AU' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>AU SELLER SETTINGS</SectionLabel>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>All AU fees are inclusive of 10% GST</p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Select your Pro plan above — it drives your FVF rate. Pro Starter applies to sellers with A$25,000+ annual sales.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>ABN / GST registered</span>
                            <span style={{ fontSize: 10, color: C.muted }}>{state.isGSTRegistered ? 'GST registered — 10% GST claimed back, showing true net fees' : 'Not GST registered — fees shown as-is (GST included in rates)'}</span>
                        </div>
                        <button onClick={() => patch({ isGSTRegistered: !state.isGSTRegistered })} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: state.isGSTRegistered ? C.lime : C.border, transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: 2.5, left: state.isGSTRegistered ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>International sale</span>
                            <span style={{ fontSize: 10, color: C.muted }}>Adds 1.1% international fee (incl. GST) for delivery outside Australia</span>
                        </div>
                        <button onClick={() => patch({ auIsInternational: !state.auIsInternational })} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: state.auIsInternational ? C.lime : C.border, transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: 2.5, left: state.auIsInternational ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                        </button>
                    </div>
                    {state.isGSTRegistered && (
                        <div style={{ background: '#f0fdf4', border: `1px solid ${C.green}`, borderRadius: 8, padding: 10 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: C.green, margin: 0 }}>GST saving applied — your effective fees are 9.09% lower</p>
                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>As a GST-registered business you can claim back the 10% GST included in all eBay AU fees. The ledger shows your true net cost after reclaim.</p>
                        </div>
                    )}
                </div>
            )}


            {/* DE-specific controls */}
            {country === 'DE' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>DE SELLER SETTINGS</SectionLabel>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>All DE fees are exclusive of 19% German VAT</p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Platin-Shop gives 10% off ALL FVF including the fixed per-order fee.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>VAT registered (USt-IdNr.)</span>
                            <span style={{ fontSize: 10, color: C.muted }}>{state.deIsVATRegistered ? 'VAT registered — fees shown exclusive of VAT' : 'Not VAT registered — eBay adds 19% German VAT to all fees'}</span>
                        </div>
                        <button onClick={() => patch({ deIsVATRegistered: !state.deIsVATRegistered })} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: state.deIsVATRegistered ? C.lime : C.red, transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: 2.5, left: state.deIsVATRegistered ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>International sale destination</label>
                        <ProDropdown
                            prefix=""
                            currentValue={state.deIntlDestination}
                            options={[
                                { val: 'none', label: 'Domestic / Eurozone + Sweden — FREE', enabled: true },
                                { val: 'europe_other', label: 'Europe (non-Eurozone, non-UK) — 1.6%', enabled: true },
                                { val: 'uk', label: 'United Kingdom — 1.2%', enabled: true },
                                { val: 'other', label: 'All other countries — 3.3%', enabled: true },
                            ]}
                            onChanged={v => patch({ deIntlDestination: v })}
                            width="full"
                            maxItems={8}
                        />
                    </div>
                    {state.isBelowStandard && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>Below Standard penalty group</label>
                            <ProDropdown
                                prefix=""
                                currentValue={state.deBelowStdGroup}
                                options={[
                                    { val: 'standard', label: 'Standard categories (20% up to €990 → 14%)', enabled: true },
                                    { val: 'recommerce', label: 'Re-Commerce / Used (11% up to €990 → 5%)', enabled: true },
                                    { val: 'tech', label: 'Tech categories (11% up to €990 → 3%)', enabled: true },
                                    { val: 'fashion_jewelry', label: 'Fashion / Jewelry / Coins (18% up to €990 → 3%)', enabled: true },
                                ]}
                                onChanged={v => patch({ deBelowStdGroup: v })}
                                width="full"
                                maxItems={8}
                            />
                        </div>
                    )}
                    {state.isVeryHighINAD && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>INAD penalty group</label>
                            <ProDropdown
                                prefix=""
                                currentValue={state.deINADGroup}
                                options={[
                                    { val: 'standard', label: 'Standard categories (17% up to €990 → 3%)', enabled: true },
                                    { val: 'auto_parts', label: 'Auto parts (16% up to €990 → 3%)', enabled: true },
                                ]}
                                onChanged={v => patch({ deINADGroup: v })}
                                width="full"
                                maxItems={8}
                            />
                        </div>
                    )}
                    {!state.deIsVATRegistered && (
                        <div style={{ background: '#fef2f2', border: `1px solid ${C.red}`, borderRadius: 8, padding: 10 }}>
                            <p style={{ fontSize: 11, color: C.red, fontWeight: 600, margin: 0 }}>19% German VAT added to all eBay fees</p>
                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>Provide your USt-IdNr. to eBay to remove this surcharge.</p>
                        </div>
                    )}
                </div>
            )}

            {/* CH-specific controls */}
            {country === 'CH' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>CH SELLER SETTINGS</SectionLabel>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>All CH fees are in CHF — exclusive of 8.1% Swiss VAT (lowest of all markets)</p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Per-order: CHF 0.55 (≤CHF 10) / CHF 0.65 (&gt;CHF 10). Regulatory: 0.35%. Switzerland itself is in the FREE international tier.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>MWST-registriert (UID-Nummer)</span>
                            <span style={{ fontSize: 10, color: C.muted }}>{state.chIsVATRegistered ? 'MWST-registriert — Gebühren exklusive MWST' : 'Nicht MWST-registriert — eBay addiert 8.1% Schweizer MWST'}</span>
                        </div>
                        <button onClick={() => patch({ chIsVATRegistered: !state.chIsVATRegistered })} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: state.chIsVATRegistered ? C.lime : C.red, transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: 2.5, left: state.chIsVATRegistered ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>Internationale Lieferadresse</label>
                        <ProDropdown
                            prefix=""
                            currentValue={state.chIntlDestination}
                            options={[
                                { val: 'none', label: 'Schweiz / Eurozone + Schweden — KOSTENLOS', enabled: true },
                                { val: 'europe_other', label: 'Europa (excl. Eurozone/Schweden/CH/UK) — 1.6%', enabled: true },
                                { val: 'us_canada', label: 'USA & Kanada — 1.2%', enabled: true },
                                { val: 'uk_other', label: 'UK + Alle anderen Länder — 3.3%', enabled: true },
                            ]}
                            onChanged={v => patch({ chIntlDestination: v })}
                            width="full"
                            maxItems={8}
                        />
                    </div>
                    {!state.chIsVATRegistered && (
                        <div style={{ background: '#fef2f2', border: `1px solid ${C.red}`, borderRadius: 8, padding: 10 }}>
                            <p style={{ fontSize: 11, color: C.red, fontWeight: 600, margin: 0 }}>8.1% Schweizer MWST auf alle eBay-Gebühren</p>
                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>Geben Sie Ihre UID-Nummer bei eBay an, um diesen Aufschlag zu vermeiden.</p>
                        </div>
                    )}
                </div>
            )}

            {/* BE-specific controls */}
            {country === 'BE' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>BE SELLER SETTINGS</SectionLabel>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>All BE fees are exclusive of 21% Belgian VAT (TVA/BTW)</p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Covers both benl.ebay.be and befr.ebay.be — identical fees. Per-order: €0.35 (≤€10) / €0.45 (&gt;€10). Regulatory: 0.35%.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>VAT registered (BE VAT / BTW-nummer)</span>
                            <span style={{ fontSize: 10, color: C.muted }}>{state.beIsVATRegistered ? 'VAT registered — fees shown exclusive of VAT' : 'Not VAT registered — eBay adds 21% Belgian VAT to all fees'}</span>
                        </div>
                        <button onClick={() => patch({ beIsVATRegistered: !state.beIsVATRegistered })} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: state.beIsVATRegistered ? C.lime : C.red, transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: 2.5, left: state.beIsVATRegistered ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>International sale destination</label>
                        <ProDropdown
                            prefix=""
                            currentValue={state.beIntlDestination}
                            options={[
                                { val: 'none', label: 'Domestic / Eurozone + Sweden — FREE', enabled: true },
                                { val: 'europe_other', label: 'Europe (non-Eurozone, non-UK) — 1.6%', enabled: true },
                                { val: 'uk', label: 'United Kingdom — 1.2%', enabled: true },
                                { val: 'other', label: 'All other countries — 3.3%', enabled: true },
                            ]}
                            onChanged={v => patch({ beIntlDestination: v })}
                            width="full"
                            maxItems={8}
                        />
                    </div>
                    {!state.beIsVATRegistered && (
                        <div style={{ background: '#fef2f2', border: `1px solid ${C.red}`, borderRadius: 8, padding: 10 }}>
                            <p style={{ fontSize: 11, color: C.red, fontWeight: 600, margin: 0 }}>21% Belgian VAT (TVA/BTW) added to all eBay fees</p>
                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>Provide your BE VAT number to eBay to remove this surcharge.</p>
                        </div>
                    )}
                </div>
            )}

            {/* PL-specific controls */}
            {country === 'PL' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>PL SELLER SETTINGS</SectionLabel>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>Wszystkie opłaty PL są w złotych (PLN) i bez VAT 23%</p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Per-order: 1,35 zł (≤45 zł) / 1,90 zł (&gt;45 zł). Opłata operacyjna: 0,35%. Sklep nie zmienia prowizji.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Zarejestrowany jako płatnik VAT (NIP)</span>
                            <span style={{ fontSize: 10, color: C.muted }}>{state.plIsVATRegistered ? 'Zarejestrowany VAT — opłaty bez podatku VAT' : 'Niezarejestrowany VAT — eBay dolicza 23% VAT do wszystkich opłat'}</span>
                        </div>
                        <button onClick={() => patch({ plIsVATRegistered: !state.plIsVATRegistered })} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: state.plIsVATRegistered ? C.lime : C.red, transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: 2.5, left: state.plIsVATRegistered ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>Cel sprzedaży zagranicznej</label>
                        <ProDropdown
                            prefix=""
                            currentValue={state.plIntlDestination}
                            options={[
                                { val: 'none', label: 'Krajowy / Strefa euro + Szwecja — BEZPŁATNIE', enabled: true },
                                { val: 'europe_other', label: 'Europa (poza strefą euro, poza UK) — 1,6%', enabled: true },
                                { val: 'uk', label: 'Wielka Brytania — 1,2%', enabled: true },
                                { val: 'other', label: 'Pozostałe kraje — 3,3%', enabled: true },
                            ]}
                            onChanged={v => patch({ plIntlDestination: v })}
                            width="full"
                            maxItems={8}
                        />
                    </div>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, margin: '0 0 3px' }}>Status Nie spełnia standardów: tylko +6 punktów</p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Polska nie stosuje podwyższenia do +7 punktów po 4 miesiącach — zawsze obowiązuje +6 punktów procentowych.</p>
                    </div>
                    {!state.plIsVATRegistered && (
                        <div style={{ background: '#fef2f2', border: `1px solid ${C.red}`, borderRadius: 8, padding: 10 }}>
                            <p style={{ fontSize: 11, color: C.red, fontWeight: 600, margin: 0 }}>23% polskiego VAT doliczony do wszystkich opłat eBay</p>
                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>Podaj swój NIP w eBay, aby usunąć tę dopłatę.</p>
                        </div>
                    )}
                </div>
            )}

            {/* NL-specific controls */}
            {country === 'NL' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>NL SELLER SETTINGS</SectionLabel>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>All NL fees are exclusive of 21% Dutch VAT (BTW)</p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Shop subscription does NOT change FVF %. Per-order: €0.35 (≤€10) / €0.45 (&gt;€10). Regulatory: 0.35%.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>BTW-geregistreerd (BTW-nummer)</span>
                            <span style={{ fontSize: 10, color: C.muted }}>{state.nlIsVATRegistered ? 'BTW-geregistreerd — kosten exclusief btw' : 'Niet BTW-geregistreerd — eBay voegt 21% BTW toe aan alle kosten'}</span>
                        </div>
                        <button onClick={() => patch({ nlIsVATRegistered: !state.nlIsVATRegistered })} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: state.nlIsVATRegistered ? C.lime : C.red, transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: 2.5, left: state.nlIsVATRegistered ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>Internationale verkoop bestemming</label>
                        <ProDropdown
                            prefix=""
                            currentValue={state.nlIntlDestination}
                            options={[
                                { val: 'none', label: 'Binnenland / Eurozone + Zweden — GRATIS', enabled: true },
                                { val: 'europe_other', label: 'Europa (niet-Eurozone, niet-VK) — 1,6%', enabled: true },
                                { val: 'uk', label: 'Verenigd Koninkrijk — 1,2%', enabled: true },
                                { val: 'other', label: 'Alle andere landen — 3,3%', enabled: true },
                            ]}
                            onChanged={v => patch({ nlIntlDestination: v })}
                            width="full"
                            maxItems={8}
                        />
                    </div>
                    {!state.nlIsVATRegistered && (
                        <div style={{ background: '#fef2f2', border: `1px solid ${C.red}`, borderRadius: 8, padding: 10 }}>
                            <p style={{ fontSize: 11, color: C.red, fontWeight: 600, margin: 0 }}>21% Nederlandse BTW toegevoegd aan alle eBay-kosten</p>
                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>Geef uw BTW-nummer op bij eBay om deze toeslag te verwijderen.</p>
                        </div>
                    )}
                </div>
            )}

            {/* IE-specific controls */}
            {country === 'IE' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>IE SELLER SETTINGS</SectionLabel>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>All IE fees are exclusive of 23% Irish VAT (highest of all markets)</p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Shop subscription does NOT change FVF %. Per-order: €0.35 (≤€10) / €0.45 (&gt;€10). Regulatory: 0.35%.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>VAT registered (Irish VAT number)</span>
                            <span style={{ fontSize: 10, color: C.muted }}>{state.ieIsVATRegistered ? 'VAT registered — fees shown exclusive of VAT' : 'Not VAT registered — eBay adds 23% Irish VAT to all fees'}</span>
                        </div>
                        <button onClick={() => patch({ ieIsVATRegistered: !state.ieIsVATRegistered })} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: state.ieIsVATRegistered ? C.lime : C.red, transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: 2.5, left: state.ieIsVATRegistered ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>International sale destination</label>
                        <ProDropdown
                            prefix=""
                            currentValue={state.ieIntlDestination}
                            options={[
                                { val: 'none', label: 'Domestic / Eurozone + Sweden — FREE', enabled: true },
                                { val: 'europe_other', label: 'Europe (non-Eurozone, non-UK) — 1.6%', enabled: true },
                                { val: 'uk', label: 'United Kingdom — 1.2%', enabled: true },
                                { val: 'other', label: 'All other countries — 3.3%', enabled: true },
                            ]}
                            onChanged={v => patch({ ieIntlDestination: v })}
                            width="full"
                            maxItems={8}
                        />
                    </div>
                    {!state.ieIsVATRegistered && (
                        <div style={{ background: '#fef2f2', border: `1px solid ${C.red}`, borderRadius: 8, padding: 10 }}>
                            <p style={{ fontSize: 11, color: C.red, fontWeight: 600, margin: 0 }}>23% Irish VAT added to all eBay fees</p>
                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>Provide your Irish VAT number to eBay to remove this surcharge.</p>
                        </div>
                    )}
                </div>
            )}

            {/* AT-specific controls */}
            {country === 'AT' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>AT SELLER SETTINGS</SectionLabel>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>All AT fees are exclusive of 20% Austrian VAT (USt)</p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>AT shop subscription changes thresholds on some categories (similar to DE). Per-order: €0.35 (≤€10) / €0.45 (&gt;€10). Regulatory: 0.35%.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>VAT registered (UID-Nummer)</span>
                            <span style={{ fontSize: 10, color: C.muted }}>{state.atIsVATRegistered ? 'VAT registered — fees shown exclusive of VAT' : 'Not VAT registered — eBay adds 20% Austrian VAT to all fees'}</span>
                        </div>
                        <button onClick={() => patch({ atIsVATRegistered: !state.atIsVATRegistered })} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: state.atIsVATRegistered ? C.lime : C.red, transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: 2.5, left: state.atIsVATRegistered ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>International sale destination</label>
                        <ProDropdown
                            prefix=""
                            currentValue={state.atIntlDestination}
                            options={[
                                { val: 'none', label: 'Domestic / Eurozone + Sweden — FREE', enabled: true },
                                { val: 'europe_other', label: 'Europe (non-Eurozone, non-UK) — 1.6%', enabled: true },
                                { val: 'uk', label: 'United Kingdom — 1.2%', enabled: true },
                                { val: 'other', label: 'All other countries — 3.3%', enabled: true },
                            ]}
                            onChanged={v => patch({ atIntlDestination: v })}
                            width="full"
                            maxItems={8}
                        />
                    </div>
                    {!state.atIsVATRegistered && (
                        <div style={{ background: '#fef2f2', border: `1px solid ${C.red}`, borderRadius: 8, padding: 10 }}>
                            <p style={{ fontSize: 11, color: C.red, fontWeight: 600, margin: 0 }}>20% Austrian VAT (USt) added to all eBay fees</p>
                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>Provide your UID-Nummer to eBay to remove this surcharge.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ES-specific controls */}
            {country === 'ES' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>ES SELLER SETTINGS</SectionLabel>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>All ES fees are exclusive of 21% Spanish VAT (IVA)</p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>Shop subscription does NOT change FVF %. Per-order: €0.35 (≤€10) / €0.45 (&gt;€10). Regulatory: 0.35%.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>VAT registered (NIF/CIF)</span>
                            <span style={{ fontSize: 10, color: C.muted }}>{state.esIsVATRegistered ? 'VAT registered — fees shown exclusive of VAT' : 'Not VAT registered — eBay adds 21% Spanish VAT to all fees'}</span>
                        </div>
                        <button onClick={() => patch({ esIsVATRegistered: !state.esIsVATRegistered })} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: state.esIsVATRegistered ? C.lime : C.red, transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: 2.5, left: state.esIsVATRegistered ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>International sale destination</label>
                        <ProDropdown
                            prefix=""
                            currentValue={state.esIntlDestination}
                            options={[
                                { val: 'none', label: 'Domestic / Eurozone + Sweden — FREE', enabled: true },
                                { val: 'europe_other', label: 'Europe (non-Eurozone, non-UK) — 1.6%', enabled: true },
                                { val: 'uk', label: 'United Kingdom — 1.2%', enabled: true },
                                { val: 'other', label: 'All other countries — 3.3%', enabled: true },
                            ]}
                            onChanged={v => patch({ esIntlDestination: v })}
                            width="full"
                            maxItems={8}
                        />
                    </div>
                    {!state.esIsVATRegistered && (
                        <div style={{ background: '#fef2f2', border: `1px solid ${C.red}`, borderRadius: 8, padding: 10 }}>
                            <p style={{ fontSize: 11, color: C.red, fontWeight: 600, margin: 0 }}>21% Spanish VAT (IVA) added to all eBay fees</p>
                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>Provide your NIF/CIF to eBay to remove this surcharge.</p>
                        </div>
                    )}
                </div>
            )}

            {/* IT-specific controls */}
            {country === 'IT' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>IT SELLER SETTINGS</SectionLabel>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>All IT fees are exclusive of 22% Italian VAT (IVA)</p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>IT shop subscription does NOT change your FVF %. Regulatory fee: 0.35% on all sales.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>VAT registered (Partita IVA)</span>
                            <span style={{ fontSize: 10, color: C.muted }}>{state.itIsVATRegistered ? 'VAT registered — fees shown exclusive of VAT' : 'Not VAT registered — eBay adds 22% Italian VAT to all fees'}</span>
                        </div>
                        <button onClick={() => patch({ itIsVATRegistered: !state.itIsVATRegistered })} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: state.itIsVATRegistered ? C.lime : C.red, transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: 2.5, left: state.itIsVATRegistered ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>International sale destination</label>
                        <ProDropdown
                            prefix=""
                            currentValue={state.itIntlDestination}
                            options={[
                                { val: 'none', label: 'Domestic / Eurozone + Sweden — FREE', enabled: true },
                                { val: 'europe_other', label: 'Europe (non-Eurozone, non-UK) — 1.6%', enabled: true },
                                { val: 'uk', label: 'United Kingdom — 1.2%', enabled: true },
                                { val: 'other', label: 'All other countries — 3.3%', enabled: true },
                            ]}
                            onChanged={v => patch({ itIntlDestination: v })}
                            width="full"
                            maxItems={8}
                        />
                    </div>
                    {!state.itIsVATRegistered && (
                        <div style={{ background: '#fef2f2', border: `1px solid ${C.red}`, borderRadius: 8, padding: 10 }}>
                            <p style={{ fontSize: 11, color: C.red, fontWeight: 600, margin: 0 }}>22% Italian VAT (IVA) added to all eBay fees</p>
                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>Provide your Partita IVA to eBay to remove this surcharge.</p>
                        </div>
                    )}
                </div>
            )}

            {/* FR-specific controls */}
            {country === 'FR' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>FR SELLER SETTINGS</SectionLabel>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>All FR fees are exclusive of 20% French VAT (TVA)</p>
                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>FR shop subscription does NOT change your FVF %. Regulatory fee: 0.35% on all sales.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>VAT registered (SIRET / Numéro TVA)</span>
                            <span style={{ fontSize: 10, color: C.muted }}>{state.frIsVATRegistered ? 'VAT registered — fees shown exclusive of VAT' : 'Not VAT registered — eBay adds 20% French VAT to all fees'}</span>
                        </div>
                        <button onClick={() => patch({ frIsVATRegistered: !state.frIsVATRegistered })} style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: state.frIsVATRegistered ? C.lime : C.red, transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: 2.5, left: state.frIsVATRegistered ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>International sale destination</label>
                        <ProDropdown
                            prefix=""
                            currentValue={state.frIntlDestination}
                            options={[
                                { val: 'none', label: 'Domestic / Eurozone + Sweden — FREE', enabled: true },
                                { val: 'europe_other', label: 'Europe (non-Eurozone, non-UK) — 1.6%', enabled: true },
                                { val: 'uk', label: 'United Kingdom — 1.2%', enabled: true },
                                { val: 'other', label: 'All other countries — 3.3%', enabled: true },
                            ]}
                            onChanged={v => patch({ frIntlDestination: v })}
                            width="full"
                            maxItems={8}
                        />
                    </div>
                    {!state.frIsVATRegistered && (
                        <div style={{ background: '#fef2f2', border: `1px solid ${C.red}`, borderRadius: 8, padding: 10 }}>
                            <p style={{ fontSize: 11, color: C.red, fontWeight: 600, margin: 0 }}>20% French VAT (TVA) added to all eBay fees</p>
                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>Provide your SIRET or TVA number to eBay to remove this surcharge.</p>
                        </div>
                    )}
                </div>
            )}

        </>
    )
}
