'use client'
// app/dashboard/product-research/components/keyword-search/ProfitSettingsDialog.tsx
// Converted 1:1 from lib/pages/product_research/keyword_search/widgets/profit_settings_dialog.dart

import { useState } from 'react'
import { Calculator, X, DollarSign } from 'lucide-react'

const C = {
  dark:   '#0F172A',
  lime:   '#8FFF00',
  border: '#E2E8F0',
  bg:     '#F8FAFC',
  input:  '#F1F5F9',
  text:   '#475569',
  muted:  '#64748B',
}

export interface ProfitSettings {
  categoryFeePercent: number  // default 13.25
  fixedFee:           number  // default 0.30
  adRatePercent:      number  // default 2.0
  sourcingTaxPercent: number  // default 7.0
  defaultShipping:    number  // default 5.0
  intlFeePercent:     number  // default 1.65
  fxFeePercent:       number  // default 2.0
  isAdvancedEnabled:  boolean
  defectRatePercent:  number  // default 2.0
  payoutFeePercent:   number  // default 1.5
  cashbackPercent:    number  // default 2.0
}

export function defaultProfitSettings(): ProfitSettings {
  return {
    categoryFeePercent: 13.25,
    fixedFee:           0.30,
    adRatePercent:      2.0,
    sourcingTaxPercent: 7.0,
    defaultShipping:    5.0,
    intlFeePercent:     1.65,
    fxFeePercent:       2.0,
    isAdvancedEnabled:  false,
    defectRatePercent:  2.0,
    payoutFeePercent:   1.5,
    cashbackPercent:    2.0,
  }
}

interface Props {
  currentSettings: ProfitSettings
  onSave:          (s: ProfitSettings) => void
  onClose:         () => void
}

// ── Input field (matches Dart _buildInput) ────────────────────
function SettingsInput({ label, value, onChange, isCurrency = false }: {
  label: string; value: string; onChange: (v: string) => void; isCurrency?: boolean
}) {
  const [focus, setFocus] = useState(false)
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <p className="text-[12px] font-semibold" style={{ color: C.text }}>{label}</p>
      <div className="flex items-center rounded-md overflow-hidden"
           style={{
             backgroundColor: C.input,
             border: `2px solid ${focus ? C.lime : 'transparent'}`,
           }}>
        {isCurrency && (
          <div className="pl-2">
            <DollarSign size={14} style={{ color: C.muted }} />
          </div>
        )}
        <input value={value}
          onChange={e => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          type="text" inputMode="decimal"
          className="flex-1 px-3 py-3 text-[13px] outline-none bg-transparent"
          style={{ color: C.dark }} />
        {!isCurrency && (
          <span className="pr-2 text-[12px]" style={{ color: C.muted }}>%</span>
        )}
      </div>
    </div>
  )
}

export default function ProfitSettingsDialog({ currentSettings, onSave, onClose }: Props) {
  const s = currentSettings

  const [categoryFee,     setCategoryFee]     = useState(String(s.categoryFeePercent))
  const [fixedFee,        setFixedFee]        = useState(String(s.fixedFee))
  const [adRate,          setAdRate]          = useState(String(s.adRatePercent))
  const [sourcingTax,     setSourcingTax]     = useState(String(s.sourcingTaxPercent))
  const [defaultShipping, setDefaultShipping] = useState(String(s.defaultShipping))
  const [intlFee,         setIntlFee]         = useState(String(s.intlFeePercent))
  const [fxFee,           setFxFee]           = useState(String(s.fxFeePercent))
  const [advancedEnabled, setAdvancedEnabled] = useState(s.isAdvancedEnabled)
  const [defectRate,      setDefectRate]      = useState(String(s.defectRatePercent))
  const [payoutFee,       setPayoutFee]       = useState(String(s.payoutFeePercent))
  const [cashback,        setCashback]        = useState(String(s.cashbackPercent))

  function saveSettings() {
    onSave({
      categoryFeePercent: parseFloat(categoryFee)     || 13.25,
      fixedFee:           parseFloat(fixedFee)         || 0.30,
      adRatePercent:      parseFloat(adRate)           || 2.0,
      sourcingTaxPercent: parseFloat(sourcingTax)      || 7.0,
      defaultShipping:    parseFloat(defaultShipping)  || 5.0,
      intlFeePercent:     parseFloat(intlFee)          || 1.65,
      fxFeePercent:       parseFloat(fxFee)            || 2.0,
      isAdvancedEnabled:  advancedEnabled,
      defectRatePercent:  parseFloat(defectRate)       || 2.0,
      payoutFeePercent:   parseFloat(payoutFee)        || 1.5,
      cashbackPercent:    parseFloat(cashback)         || 2.0,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>

      {/* Dialog — width:500 maxHeight:700 */}
      <div className="w-full flex flex-col rounded-2xl overflow-hidden"
           style={{ maxWidth: 500, maxHeight: 700, backgroundColor: '#fff' }}>

        {/* Dark header — matches Dart Container(color:0xFF0F172A) */}
        <div className="flex items-center gap-2.5 px-5 py-5"
             style={{ backgroundColor: C.dark }}>
          <Calculator size={20} style={{ color: C.lime }} />
          <p className="flex-1 text-[18px] font-bold text-white">Global Profit Settings</p>
          <button onClick={onClose}>
            <X size={18} style={{ color: 'rgba(255,255,255,0.54)' }} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

          {/* Core Platform Fees */}
          <p className="text-[15px] font-bold" style={{ color: C.muted }}>🏢 Core Platform Fees</p>
          <div className="flex gap-4">
            <SettingsInput label="eBay Category (%)"   value={categoryFee}     onChange={setCategoryFee}     />
            <SettingsInput label="Fixed Fee ($)"       value={fixedFee}        onChange={setFixedFee}        isCurrency />
          </div>
          <div className="flex gap-4">
            <SettingsInput label="Promoted Ad Rate (%)" value={adRate}         onChange={setAdRate}          />
            <SettingsInput label="Default Shipping ($)" value={defaultShipping} onChange={setDefaultShipping} isCurrency />
          </div>

          <div className="h-px" style={{ backgroundColor: C.border }} />

          {/* Global Sourcing & FX */}
          <p className="text-[15px] font-bold" style={{ color: C.muted }}>🌍 Global Sourcing & FX</p>
          <div className="flex gap-4">
            <SettingsInput label="Sourcing Tax (%)"  value={sourcingTax} onChange={setSourcingTax} />
            <SettingsInput label="Bank FX Fee (%)"   value={fxFee}       onChange={setFxFee}       />
          </div>
          <SettingsInput label="eBay Intl. Cross-Border Fee (%)" value={intlFee} onChange={setIntlFee} />

          <div className="h-px" style={{ backgroundColor: C.border }} />

          {/* Advanced toggle — matches Dart toggle_on/toggle_off */}
          <button onClick={() => setAdvancedEnabled(s => !s)}
            className="flex items-center gap-2.5 hover:opacity-80">
            <div className="relative w-9 h-5 rounded-full transition-colors"
                 style={{ backgroundColor: advancedEnabled ? C.lime : '#CBD5E1' }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                   style={{ left: advancedEnabled ? '18px' : '2px' }} />
            </div>
            <p className="text-[15px] font-bold" style={{ color: C.dark }}>
              Enable Advanced Pro Factors
            </p>
          </button>

          {/* Advanced panel */}
          {advancedEnabled && (
            <div className="p-4 rounded-lg border flex flex-col gap-4"
                 style={{ backgroundColor: C.bg, borderColor: C.border }}>
              <div className="flex gap-4">
                <SettingsInput label="Defect/Return Buffer (%)" value={defectRate} onChange={setDefectRate} />
                <SettingsInput label="Payout/Withdrawal (%)"    value={payoutFee}  onChange={setPayoutFee}  />
              </div>
              <SettingsInput label="Cashback/Rewards (+) (%)" value={cashback} onChange={setCashback} />
            </div>
          )}
        </div>

        {/* Footer — lime Save button */}
        <div className="px-5 py-4 border-t" style={{ borderColor: C.border }}>
          <button onClick={saveSettings}
            className="w-full h-11 rounded-lg text-[15px] font-bold"
            style={{ backgroundColor: C.lime, color: '#000' }}>
            Save & Recalculate
          </button>
        </div>
      </div>
    </div>
  )
}