// components/profit/CountryLedgerRows.tsx
// All per-country ledger rows extracted from page.tsx
// No logic changes — pure cut & paste

// ── Brand palette ─────────────────────────────────────────────
const C = {
    amber: '#d97706',
    red: '#b91c1c',
    green: '#16a34a',
}

function LedgerRow({ label, amount, color, symbol }: { label: string; amount: number; color: string; symbol: string }) {
    const fmt = (n: number) => symbol + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
            <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color }}>{amount >= 0 ? '+' : '−'}{fmt(amount)}</span>
        </div>
    )
}

export interface CountryLedgerRowsProps {
    state: any
    sym: string
    ukIntlFee: number
    caIntlFee: number
    auIntlFee: number
    auGSTSaving: number
    deIntlFee: number
    deVATOnFees: number
    frIntlFee: number
    frVATOnFees: number
    itIntlFee: number
    itVATOnFees: number
    esIntlFee: number
    esVATOnFees: number
    atIntlFee: number
    atVATOnFees: number
    ieIntlFee: number
    ieVATOnFees: number
    nlIntlFee: number
    nlVATOnFees: number
    plIntlFee: number
    plVATOnFees: number
    beIntlFee: number
    beVATOnFees: number
    chIntlFee: number
    chVATOnFees: number
}

export function CountryLedgerRows({
    state, sym,
    ukIntlFee, caIntlFee, auIntlFee, auGSTSaving,
    deIntlFee, deVATOnFees, frIntlFee, frVATOnFees,
    itIntlFee, itVATOnFees, esIntlFee, esVATOnFees,
    atIntlFee, atVATOnFees, ieIntlFee, ieVATOnFees,
    nlIntlFee, nlVATOnFees, plIntlFee, plVATOnFees,
    beIntlFee, beVATOnFees, chIntlFee, chVATOnFees,
}: CountryLedgerRowsProps) {
    return (
        <>
            {ukIntlFee > 0 && (
                <LedgerRow
                    label={`International fee (${state.ukIntlDestination === 'eurozone' ? '1.05%' : state.ukIntlDestination === 'us_canada' ? '1.8%' : '2.0%'})`}
                    amount={-ukIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {caIntlFee > 0 && (
                <LedgerRow
                    label={`International fee (${state.caIntlDestination === 'us' ? '0.4%' : '1.0%'})`}
                    amount={-caIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {auIntlFee > 0 && (
                <LedgerRow
                    label="International fee (1.1% incl. GST)"
                    amount={-auIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {auGSTSaving > 0 && (
                <LedgerRow
                    label="GST saving (ABN registered — 10% claimed back)"
                    amount={auGSTSaving} color={C.green} symbol={sym}
                />
            )}
            {deIntlFee > 0 && (
                <LedgerRow
                    label={`International fee (${state.deIntlDestination === 'europe_other' ? '1.6%' : state.deIntlDestination === 'uk' ? '1.2%' : '3.3%'})`}
                    amount={-deIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {deVATOnFees > 0 && (
                <LedgerRow
                    label="19% German VAT on fees (not VAT registered)"
                    amount={-deVATOnFees} color={C.red} symbol={sym}
                />
            )}
            {frIntlFee > 0 && (
                <LedgerRow
                    label={`International fee (${state.frIntlDestination === 'europe_other' ? '1.6%' : state.frIntlDestination === 'uk' ? '1.2%' : '3.3%'})`}
                    amount={-frIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {frVATOnFees > 0 && (
                <LedgerRow
                    label="20% French VAT on fees (not VAT registered)"
                    amount={-frVATOnFees} color={C.red} symbol={sym}
                />
            )}
            {itIntlFee > 0 && (
                <LedgerRow
                    label={`International fee (${state.itIntlDestination === 'europe_other' ? '1.6%' : state.itIntlDestination === 'uk' ? '1.2%' : '3.3%'})`}
                    amount={-itIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {itVATOnFees > 0 && (
                <LedgerRow
                    label="22% Italian VAT on fees (not VAT registered)"
                    amount={-itVATOnFees} color={C.red} symbol={sym}
                />
            )}
            {esIntlFee > 0 && (
                <LedgerRow
                    label={`International fee (${state.esIntlDestination === 'europe_other' ? '1.6%' : state.esIntlDestination === 'uk' ? '1.2%' : '3.3%'})`}
                    amount={-esIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {esVATOnFees > 0 && (
                <LedgerRow
                    label="21% Spanish VAT on fees (not VAT registered)"
                    amount={-esVATOnFees} color={C.red} symbol={sym}
                />
            )}
            {atIntlFee > 0 && (
                <LedgerRow
                    label={`International fee (${state.atIntlDestination === 'europe_other' ? '1.6%' : state.atIntlDestination === 'uk' ? '1.2%' : '3.3%'})`}
                    amount={-atIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {atVATOnFees > 0 && (
                <LedgerRow
                    label="20% Austrian VAT on fees (not VAT registered)"
                    amount={-atVATOnFees} color={C.red} symbol={sym}
                />
            )}
            {ieIntlFee > 0 && (
                <LedgerRow
                    label={`International fee (${state.ieIntlDestination === 'europe_other' ? '1.6%' : state.ieIntlDestination === 'uk' ? '1.2%' : '3.3%'})`}
                    amount={-ieIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {ieVATOnFees > 0 && (
                <LedgerRow
                    label="23% Irish VAT on fees (not VAT registered)"
                    amount={-ieVATOnFees} color={C.red} symbol={sym}
                />
            )}
            {nlIntlFee > 0 && (
                <LedgerRow
                    label={`International fee (${state.nlIntlDestination === 'europe_other' ? '1.6%' : state.nlIntlDestination === 'uk' ? '1.2%' : '3.3%'})`}
                    amount={-nlIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {nlVATOnFees > 0 && (
                <LedgerRow
                    label="21% Dutch VAT on fees (not VAT registered)"
                    amount={-nlVATOnFees} color={C.red} symbol={sym}
                />
            )}
            {plIntlFee > 0 && (
                <LedgerRow
                    label={`Opłata zagraniczna (${state.plIntlDestination === 'europe_other' ? '1,6%' : state.plIntlDestination === 'uk' ? '1,2%' : '3,3%'})`}
                    amount={-plIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {plVATOnFees > 0 && (
                <LedgerRow
                    label="23% polskiego VAT od opłat (brak rejestracji VAT)"
                    amount={-plVATOnFees} color={C.red} symbol={sym}
                />
            )}
            {beIntlFee > 0 && (
                <LedgerRow
                    label={`International fee (${state.beIntlDestination === 'europe_other' ? '1.6%' : state.beIntlDestination === 'uk' ? '1.2%' : '3.3%'})`}
                    amount={-beIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {beVATOnFees > 0 && (
                <LedgerRow
                    label="21% Belgian VAT on fees (not VAT registered)"
                    amount={-beVATOnFees} color={C.red} symbol={sym}
                />
            )}
            {chIntlFee > 0 && (
                <LedgerRow
                    label={`International fee (${state.chIntlDestination === 'europe_other' ? '1.6%' : state.chIntlDestination === 'us_canada' ? '1.2%' : '3.3%'})`}
                    amount={-chIntlFee} color={C.amber} symbol={sym}
                />
            )}
            {chVATOnFees > 0 && (
                <LedgerRow
                    label="8.1% Swiss VAT on fees (not MWST registered)"
                    amount={-chVATOnFees} color={C.red} symbol={sym}
                />
            )}

        </>
    )
}
