// components/profit/CountryCategoryOptions.ts
// Category and store tier option arrays for all 14 countries
// Extracted from page.tsx — no logic changes

import {
    USCategoryKey, US_TIERED_FEES,
    UKCategoryKey, UK_TIERED_FEES,
    CACategoryKey, CA_TIERED_FEES,
    AUCategoryTier, AU_FVF_TABLE, AU_CATEGORY_TIERS, AU_PRO_PLAN_LABELS, AUProPlan,
    DECategoryKey, DE_TIERED_FEES,
    FRCategoryKey, FR_TIERED_FEES,
    ITCategoryKey, IT_TIERED_FEES,
    ESCategoryKey, ES_TIERED_FEES,
    ATCategoryKey, AT_TIERED_FEES,
    IECategoryKey, IE_TIERED_FEES,
    PLCategoryKey, PL_TIERED_FEES,
    CHCategoryKey, CH_TIERED_FEES,
} from '@/lib/profit-engine'

export function getCategoryOptions(country: string, state: any): { label: string; value: string }[] {
    if (country === 'US') {
        return (Object.keys(US_TIERED_FEES) as USCategoryKey[]).map(key => {
            const structure = state.hasStore ? US_TIERED_FEES[key].hasStore : US_TIERED_FEES[key].noStore
            const rateDisplay = structure.type === 'flat'
                ? `${(structure as any).rate}% flat`
                : structure.type === 'switch'
                    ? `${(structure as any).rateBelow}% / ${(structure as any).rateAbove}%`
                    : `${(structure as any).brackets[0].rate}%${(structure as any).brackets.length > 1 ? '+' : ''}`
            return { label: `${US_TIERED_FEES[key].label} — ${rateDisplay}`, value: key }
        })
    }
    if (country === 'UK') {
        return (Object.keys(UK_TIERED_FEES) as UKCategoryKey[]).map(key => {
            const s = UK_TIERED_FEES[key].structure
            const rateDisplay = s.type === 'flat'
                ? `${(s as any).rate}%`
                : s.type === 'switch'
                    ? `${(s as any).rateBelow}% / ${(s as any).rateAbove}%`
                    : `${(s as any).brackets[0].rate}%${(s as any).brackets.length > 1 ? '+' : ''}`
            return { label: `${UK_TIERED_FEES[key].label} — ${rateDisplay}`, value: key }
        })
    }
    if (country === 'CA') {
        return (Object.keys(CA_TIERED_FEES) as CACategoryKey[]).map(key => {
            const structure = state.caHasStore ? CA_TIERED_FEES[key].hasStore : CA_TIERED_FEES[key].noStore
            const rateDisplay = structure.type === 'flat'
                ? `${(structure as any).rate}% flat`
                : structure.type === 'switch'
                    ? `${(structure as any).rateBelow}% / ${(structure as any).rateAbove}%`
                    : `${(structure as any).brackets[0].rate}%${(structure as any).brackets.length > 1 ? '+' : ''}`
            return { label: `${CA_TIERED_FEES[key].label} — ${rateDisplay}`, value: key }
        })
    }
    if (country === 'AU') {
        return ([1, 2, 3, 4] as AUCategoryTier[]).map(tier => ({
            label: `${AU_CATEGORY_TIERS[tier]} — ${AU_FVF_TABLE[tier][state.auProPlan as AUProPlan]}%`,
            value: String(tier),
        }))
    }
    if (country === 'DE') {
        return (Object.keys(DE_TIERED_FEES) as DECategoryKey[]).map(key => {
            const s = state.deHasShop ? DE_TIERED_FEES[key].hasShop : DE_TIERED_FEES[key].noShop
            const rateDisplay = s.type === 'flat'
                ? `${(s as any).rate}% flat`
                : `${(s as any).brackets[0].rate}%+`
            return { label: `${DE_TIERED_FEES[key].label} — ${rateDisplay}`, value: key }
        })
    }
    if (country === 'FR') {
        return (Object.keys(FR_TIERED_FEES) as FRCategoryKey[]).map(key => {
            const s = FR_TIERED_FEES[key].structure
            const rateDisplay = s.type === 'flat' ? `${(s as any).rate}% flat` : `${(s as any).brackets[0].rate}%+`
            return { label: `${FR_TIERED_FEES[key].label} — ${rateDisplay}`, value: key }
        })
    }
    if (country === 'IT') {
        return (Object.keys(IT_TIERED_FEES) as ITCategoryKey[]).map(key => {
            const s = IT_TIERED_FEES[key].structure
            const rateDisplay = s.type === 'flat' ? `${(s as any).rate}% flat` : `${(s as any).brackets[0].rate}%+`
            return { label: `${IT_TIERED_FEES[key].label} — ${rateDisplay}`, value: key }
        })
    }
    if (country === 'ES') {
        return (Object.keys(ES_TIERED_FEES) as ESCategoryKey[]).map(key => {
            const s = ES_TIERED_FEES[key].structure
            const rateDisplay = `${(s as any).brackets[0].rate}%+`
            return { label: `${ES_TIERED_FEES[key].label} — ${rateDisplay}`, value: key }
        })
    }
    if (country === 'AT') {
        return (Object.keys(AT_TIERED_FEES) as ATCategoryKey[]).map(key => {
            const s = state.atHasShop ? AT_TIERED_FEES[key].hasShop : AT_TIERED_FEES[key].noShop
            const rateDisplay = s.type === 'flat' ? `${(s as any).rate}% flat` : `${(s as any).brackets[0].rate}%+`
            return { label: `${AT_TIERED_FEES[key].label} — ${rateDisplay}`, value: key }
        })
    }
    if (country === 'IE' || country === 'NL' || country === 'BE') {
        return (Object.keys(IE_TIERED_FEES) as IECategoryKey[]).map(key => {
            const s = IE_TIERED_FEES[key].structure
            const rateDisplay = s.type === 'flat' ? `${(s as any).rate}% flat` : `${(s as any).brackets[0].rate}%+`
            return { label: `${IE_TIERED_FEES[key].label} — ${rateDisplay}`, value: key }
        })
    }
    if (country === 'PL') {
        return (Object.keys(PL_TIERED_FEES) as PLCategoryKey[]).map(key => {
            const s = PL_TIERED_FEES[key].structure
            const rateDisplay = `${(s as any).brackets[0].rate}%+`
            return { label: `${PL_TIERED_FEES[key].label} — ${rateDisplay}`, value: key }
        })
    }
    if (country === 'CH') {
        return (Object.keys(CH_TIERED_FEES) as CHCategoryKey[]).map(key => {
            const s = CH_TIERED_FEES[key].structure
            const rateDisplay = s.type === 'flat' ? `${(s as any).rate}% flat` : `${(s as any).brackets[0].rate}%+`
            return { label: `${CH_TIERED_FEES[key].label} — ${rateDisplay}`, value: key }
        })
    }
    return []
}

export function getStoreTierOptions(country: string): { label: string; value: string }[] {
    switch (country) {
        case 'US': return [
            { label: 'No store / Starter', value: 'no_store' },
            { label: 'Basic / Premium / Anchor / Enterprise', value: 'has_store' },
        ]
        case 'UK': return [
            { label: 'No Shop (pay as you sell)', value: '0' },
            { label: 'Basic Shop — £27/mo', value: '0' },
            { label: 'Featured Shop — £77/mo', value: '0' },
            { label: 'Anchor Shop — £437/mo', value: '0' },
        ]
        case 'CA': return [
            { label: 'No store', value: 'no_store' },
            { label: 'Basic — C$19.95/mo', value: 'has_store' },
            { label: 'Premium — C$59.95/mo', value: 'has_store' },
            { label: 'Anchor — C$299.95/mo', value: 'has_store' },
        ]
        case 'AU': return (Object.keys(AU_PRO_PLAN_LABELS) as AUProPlan[]).map(plan => ({
            label: AU_PRO_PLAN_LABELS[plan], value: plan,
        }))
        case 'DE': return [
            { label: 'No shop', value: 'no_shop' },
            { label: 'Basis-Shop — €39.95/mo', value: 'has_shop' },
            { label: 'Top-Shop — €79.95/mo', value: 'has_shop' },
            { label: 'Premium-Shop — €299.95/mo', value: 'has_shop' },
            { label: 'Platin-Shop — €4,999.95/mo', value: 'platin' },
        ]
        case 'FR': return [
            { label: 'No Boutique', value: '0' },
            { label: 'Boutique Basique — €19.50/mo', value: '0' },
            { label: 'Boutique À la Une — €39.50/mo', value: '0' },
            { label: 'Boutique Premium — €149.50/mo', value: '0' },
        ]
        case 'IT': return [
            { label: 'No Negozio', value: '0' },
            { label: 'Negozio Base — €24.95/mo', value: '0' },
            { label: 'Negozio Premium — €49.95/mo', value: '0' },
            { label: 'Negozio Premium Plus — €179.95/mo', value: '0' },
        ]
        case 'ES': return [
            { label: 'Sin tienda', value: '0' },
            { label: 'Tienda Básica — €19.50/mo', value: '0' },
            { label: 'Tienda Avanzada — €39.50/mo', value: '0' },
            { label: 'Tienda Premium — €149.50/mo', value: '0' },
        ]
        case 'AT': return [
            { label: 'Kein Shop', value: 'no_shop' },
            { label: 'Basis-Shop — €39.95/mo', value: 'has_shop' },
            { label: 'Top-Shop — €79.95/mo', value: 'has_shop' },
            { label: 'Premium-Shop — €299.95/mo', value: 'has_shop' },
        ]
        case 'IE': return [
            { label: 'No Shop', value: '0' },
            { label: 'Basic Shop — €19.50/mo', value: '0' },
            { label: 'Featured Shop — €39.50/mo', value: '0' },
            { label: 'Anchor Shop — €149.50/mo', value: '0' },
        ]
        case 'NL': return [
            { label: 'Geen winkel', value: '0' },
            { label: 'Basiswinkel — €19.50/mo', value: '0' },
            { label: 'Topwinkel — €39.50/mo', value: '0' },
            { label: 'Topwinkel Plus — €149.50/mo', value: '0' },
        ]
        case 'PL': return [
            { label: 'Bez sklepu', value: '0' },
            { label: 'Mały sklep — 89 zł/mies.', value: '0' },
            { label: 'Duży sklep — 179 zł/mies.', value: '0' },
            { label: 'Megasklep — 669 zł/mies.', value: '0' },
        ]
        case 'BE': return [
            { label: 'Sans boutique / Zonder winkel', value: '0' },
            { label: 'Boutique Classique — €19.50/mo', value: '0' },
            { label: 'Boutique À la Une — €39.50/mo', value: '0' },
            { label: 'Boutique Premium — €149.50/mo', value: '0' },
        ]
        case 'CH': return [
            { label: 'Kein Shop', value: '0' },
            { label: 'Basis-Shop — CHF 19.50/mo', value: '0' },
            { label: 'Top-Shop — CHF 49.50/mo', value: '0' },
            { label: 'Premium-Shop — CHF 159.50/mo', value: '0' },
        ]
        default: return [
            { label: 'No store', value: '0' },
            { label: 'Basic (–0.5%)', value: '0.5' },
            { label: 'Premium (–1%)', value: '1' },
            { label: 'Anchor (–1.5%)', value: '1.5' },
            { label: 'Enterprise (–2%)', value: '2' },
        ]
    }
}

export function getSellerLevelOptions(country: string): { label: string; value: string }[] {
    switch (country) {
        case 'US': return [
            { label: 'Standard', value: 'standard' },
            { label: 'Top Rated Plus (–10% FVF)', value: 'trp' },
            { label: 'Below Standard 1–3 months (+6%)', value: 'bs_short' },
            { label: 'Below Standard 4+ months (+7%)', value: 'bs_long' },
            { label: 'Very High INAD 1–3 months (+5%)', value: 'inad_short' },
            { label: 'Very High INAD 4+ months (+6%)', value: 'inad_long' },
        ]
        case 'UK': return [
            { label: 'Standard', value: 'standard' },
            { label: 'Top Rated Premium Service (–10%)', value: 'trp' },
            { label: 'Below Standard 1–3 months (+6pts)', value: 'bs_short' },
            { label: 'Below Standard 4+ months (+7pts)', value: 'bs_long' },
            { label: 'Very High INAD 1–3 months (+4pts)', value: 'inad_short' },
            { label: 'Very High INAD 4+ months (+5pts)', value: 'inad_long' },
        ]
        case 'CA': return [
            { label: 'Standard', value: 'standard' },
            { label: 'Top Rated Plus (–10% FVF)', value: 'trp' },
            { label: 'Below Standard 1–3 months (+6%)', value: 'bs_short' },
            { label: 'Below Standard 4+ months (+7%)', value: 'bs_long' },
            { label: 'Very High INAD (+5% flat)', value: 'inad_short' },
        ]
        case 'AU': return [
            { label: 'Standard', value: 'standard' },
            { label: 'Top Rated (–10% FVF)', value: 'trp' },
            { label: 'Below Standard 1–3 months (+5.5% of sale)', value: 'bs_short' },
            { label: 'Below Standard 4+ months (+6.6% of sale)', value: 'bs_long' },
            { label: 'Very High INAD 1–3 months (+5.5% of sale)', value: 'inad_short' },
            { label: 'Very High INAD 4+ months (+6.6% of sale)', value: 'inad_long' },
        ]
        case 'DE': return [
            { label: 'Standard / Top Rated (same base rates)', value: 'standard' },
            { label: 'eBay Premium Service (–10% variable FVF)', value: 'trp' },
            { label: 'Below Standard 1–3 months (override rates)', value: 'bs_short' },
            { label: 'Below Standard 4+ months (+1% on override)', value: 'bs_long' },
            { label: 'Very High INAD 1–3 months (override rates)', value: 'inad_short' },
            { label: 'Very High INAD 4+ months (+1% on override)', value: 'inad_long' },
        ]
        case 'FR': return [
            { label: 'Standard', value: 'standard' },
            { label: 'Top Rated (–10% variable FVF)', value: 'trp' },
            { label: 'Below Standard 1–3 months (+6pts)', value: 'bs_short' },
            { label: 'Below Standard 4+ months (+7pts)', value: 'bs_long' },
            { label: 'Very High INAD 1–3 months (+4pts)', value: 'inad_short' },
            { label: 'Very High INAD 4+ months (+5pts)', value: 'inad_long' },
        ]
        case 'IT': return [
            { label: 'Standard', value: 'standard' },
            { label: 'Top Rated Affidabilità (–10% FVF)', value: 'trp' },
            { label: 'Below Standard 1–3 months (+6pts)', value: 'bs_short' },
            { label: 'Below Standard 4+ months (+7pts)', value: 'bs_long' },
            { label: 'Very High INAD 1–3 months (+4pts)', value: 'inad_short' },
            { label: 'Very High INAD 4+ months (+5pts)', value: 'inad_long' },
        ]
        case 'ES': return [
            { label: 'Standard', value: 'standard' },
            { label: 'Top Rated Excelente (–10% FVF)', value: 'trp' },
            { label: 'Below Standard 1–3 months (+6pts)', value: 'bs_short' },
            { label: 'Below Standard 4+ months (+7pts)', value: 'bs_long' },
            { label: 'Very High INAD 1–3 months (+4pts)', value: 'inad_short' },
            { label: 'Very High INAD 4+ months (+5pts)', value: 'inad_long' },
        ]
        case 'AT': return [
            { label: 'Standard', value: 'standard' },
            { label: 'Top Rated (–10% FVF)', value: 'trp' },
            { label: 'Below Standard 1–3 months (+6pts)', value: 'bs_short' },
            { label: 'Below Standard 4+ months (+7pts)', value: 'bs_long' },
            { label: 'Very High INAD 1–3 months (+4pts)', value: 'inad_short' },
            { label: 'Very High INAD 4+ months (+5pts)', value: 'inad_long' },
        ]
        case 'IE': return [
            { label: 'Standard', value: 'standard' },
            { label: 'Top Rated (–10% FVF)', value: 'trp' },
            { label: 'Below Standard 1–3 months (+6pts)', value: 'bs_short' },
            { label: 'Below Standard 4+ months (+7pts)', value: 'bs_long' },
            { label: 'Very High INAD 1–3 months (+4pts)', value: 'inad_short' },
            { label: 'Very High INAD 4+ months (+5pts)', value: 'inad_long' },
        ]
        case 'NL': return [
            { label: 'Standaard', value: 'standard' },
            { label: 'Top beoordeeld (–10% FVF)', value: 'trp' },
            { label: 'Ondermaats 1–3 maanden (+6pts)', value: 'bs_short' },
            { label: 'Ondermaats 4+ maanden (+7pts)', value: 'bs_long' },
            { label: 'Zeer hoog INAD 1–3 maanden (+4pts)', value: 'inad_short' },
            { label: 'Zeer hoog INAD 4+ maanden (+5pts)', value: 'inad_long' },
        ]
        case 'PL': return [
            { label: 'Standardowy', value: 'standard' },
            { label: 'Najlepszy Sprzedawca (–10% FVF)', value: 'trp' },
            { label: 'Nie spełnia standardów (+6 pkt)', value: 'bs_short' },
            { label: 'Bardzo wysoki wskaźnik INAD (+4 pkt)', value: 'inad_short' },
            { label: 'Bardzo wysoki INAD 4+ mies. (+5 pkt)', value: 'inad_long' },
        ]
        case 'BE': return [
            { label: 'Standard', value: 'standard' },
            { label: 'Top Rated / Top Fiabilité (–10% FVF)', value: 'trp' },
            { label: 'Below Standard (+6pts)', value: 'bs_short' },
            { label: 'Very High INAD 1–3 months (+4pts)', value: 'inad_short' },
            { label: 'Very High INAD 4+ months (+5pts)', value: 'inad_long' },
        ]
        case 'CH': return [
            { label: 'Standard / Überdurchschnittlich', value: 'standard' },
            { label: 'Top-Bewertung (–10% FVF)', value: 'trp' },
            { label: 'Unterdurchschnittlich 1–3 Monate (+6pts)', value: 'bs_short' },
            { label: 'Unterdurchschnittlich 4+ Monate (+7pts)', value: 'bs_long' },
            { label: 'Very High INAD 1–3 months (+4pts)', value: 'inad_short' },
            { label: 'Very High INAD 4+ months (+5pts)', value: 'inad_long' },
        ]
        default: return [
            { label: 'Standard', value: '0' },
            { label: 'Top Rated (–10% FVF)', value: '-1.36' },
            { label: 'Below Standard (+6%)', value: '6' },
        ]
    }
}
