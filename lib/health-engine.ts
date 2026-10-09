// lib/health-engine.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Listing Health Score Engine
// Single source of truth — used in LgStudio (live bar) + Step4 (detailed score)
//
// Max 100 points:
//   Required  50pts  — can't rank without these
//   Quality   35pts  — makes listing rank better
//   Boost     15pts  — separates good from great
// ─────────────────────────────────────────────────────────────────────────────

export interface HealthBreakdown {
    score: number          // 0-100 total
    label: string          // Excellent / Good / Fair / Needs Work / Incomplete
    color: string          // hex
    required: HealthItem[]
    quality: HealthItem[]
    boost: HealthItem[]
}

export interface HealthItem {
    key: string
    label: string
    points: number             // points earned
    max: number             // max possible
    done: boolean            // full points earned
    partial: boolean            // some points earned
    tip: string             // what to do to improve
}

export function calcHealth(draft: Record<string, any>): HealthBreakdown {
    const required: HealthItem[] = []
    const quality: HealthItem[] = []
    const boost: HealthItem[] = []

    // ── REQUIRED (50pts) ────────────────────────────────────────

    // Title — 15pts
    const titleLen = (draft.title?.length ?? 0)
    const titlePts = titleLen === 0 ? 0 : titleLen < 40 ? 8 : titleLen < 60 ? 12 : 15
    required.push({
        key: 'title', label: 'Title',
        points: titlePts, max: 15,
        done: titlePts === 15, partial: titlePts > 0 && titlePts < 15,
        tip: titleLen === 0 ? 'Add a title' : titleLen < 40 ? 'Aim for 60-80 characters' : titleLen < 60 ? 'Add more keywords to reach 60+ characters' : 'Great title!',
    })

    // Category — 10pts
    const hasCat = !!draft.category
    required.push({
        key: 'category', label: 'Category',
        points: hasCat ? 10 : 0, max: 10,
        done: hasCat, partial: false,
        tip: hasCat ? 'Category set' : 'Select an eBay category',
    })

    // Condition — 10pts
    const hasCond = !!draft.condition
    required.push({
        key: 'condition', label: 'Condition',
        points: hasCond ? 10 : 0, max: 10,
        done: hasCond, partial: false,
        tip: hasCond ? 'Condition set' : 'Select item condition',
    })

    // Sell Price — 10pts
    const price = Number(draft.sell_price ?? 0)
    const pricePts = price >= 0.99 ? 10 : price > 0 ? 3 : 0
    required.push({
        key: 'price', label: 'Sell Price',
        points: pricePts, max: 10,
        done: pricePts === 10, partial: pricePts > 0 && pricePts < 10,
        tip: price === 0 ? 'Set a sell price' : price < 0.99 ? 'Minimum eBay price is $0.99' : 'Price set',
    })

    // At least 1 photo — 5pts
    const photoCount = draft.photo_urls?.length ?? 0
    required.push({
        key: 'photo_min', label: 'Photo',
        points: photoCount >= 1 ? 5 : 0, max: 5,
        done: photoCount >= 1, partial: false,
        tip: photoCount >= 1 ? 'Photo uploaded' : 'Upload at least 1 photo',
    })

    // ── QUALITY (35pts) ─────────────────────────────────────────

    // Photos count — 10pts (2pts each up to 5)
    const photoPts = Math.min(photoCount * 2, 10)
    quality.push({
        key: 'photos', label: 'Photos (5+)',
        points: photoPts, max: 10,
        done: photoPts === 10, partial: photoPts > 0 && photoPts < 10,
        tip: photoCount >= 5 ? '5+ photos — great!' : `Add ${5 - photoCount} more photo${5 - photoCount === 1 ? '' : 's'} for max points`,
    })

    // Description — 10pts
    const descLen = draft.description_html?.replace(/<[^>]*>/g, '').trim().length ?? 0
    const descPts = descLen === 0 ? 0 : descLen < 50 ? 3 : descLen < 150 ? 7 : 10
    quality.push({
        key: 'description', label: 'Description',
        points: descPts, max: 10,
        done: descPts === 10, partial: descPts > 0 && descPts < 10,
        tip: descLen === 0 ? 'Write a product description' : descLen < 50 ? 'Description is too short' : descLen < 150 ? 'Expand description to 150+ words for full points' : 'Great description!',
    })

    // Item Specifics — 8pts (2pts each up to 4)
    const specCount = Object.keys(draft.item_specifics ?? {}).length
    const specPts = Math.min(specCount * 2, 8)
    quality.push({
        key: 'specifics', label: 'Item Specifics',
        points: specPts, max: 8,
        done: specPts === 8, partial: specPts > 0 && specPts < 8,
        tip: specCount >= 4 ? '4+ specifics — great!' : `Add ${4 - specCount} more item specific${4 - specCount === 1 ? '' : 's'}`,
    })

    // Item Location — 4pts
    const hasZip = !!(draft.item_zip?.trim())
    quality.push({
        key: 'location', label: 'Item Location',
        points: hasZip ? 4 : 0, max: 4,
        done: hasZip, partial: false,
        tip: hasZip ? 'Location set' : 'Add your postal/zip code',
    })

    // Shipping — 3pts
    const hasShipping = draft.free_shipping || !!draft.shipping_type
    quality.push({
        key: 'shipping', label: 'Shipping',
        points: hasShipping ? 3 : 0, max: 3,
        done: hasShipping, partial: false,
        tip: hasShipping ? 'Shipping configured' : 'Configure shipping',
    })

    // ── BOOST (15pts) ────────────────────────────────────────────

    // UPC/EAN/MPN — 3pts (1 each)
    const identPts = (draft.upc?.trim() ? 1 : 0) + (draft.ean?.trim() ? 1 : 0) + (draft.mpn?.trim() ? 1 : 0)
    boost.push({
        key: 'identifiers', label: 'UPC / EAN / MPN',
        points: identPts, max: 3,
        done: identPts === 3, partial: identPts > 0 && identPts < 3,
        tip: identPts === 3 ? 'All identifiers set' : 'Add product barcodes/identifiers',
    })

    // Subtitle — 2pts
    const hasSub = (draft.subtitle?.trim()?.length ?? 0) > 0
    boost.push({
        key: 'subtitle', label: 'Subtitle',
        points: hasSub ? 2 : 0, max: 2,
        done: hasSub, partial: false,
        tip: hasSub ? 'Subtitle added' : 'Add a subtitle to boost search visibility',
    })

    // SKU — 2pts
    const hasSku = !!(draft.sku?.trim())
    boost.push({
        key: 'sku', label: 'SKU / Label',
        points: hasSku ? 2 : 0, max: 2,
        done: hasSku, partial: false,
        tip: hasSku ? 'SKU set' : 'Add a SKU for inventory tracking',
    })

    // Buy price — 2pts
    const hasBuy = (draft.buy_price ?? 0) > 0
    boost.push({
        key: 'buy_price', label: 'Cost Price',
        points: hasBuy ? 2 : 0, max: 2,
        done: hasBuy, partial: false,
        tip: hasBuy ? 'Cost price set — profit tracking enabled' : 'Add buy cost for profit tracking',
    })

    // Returns — 2pts (any policy except no_returns)
    const goodReturns = draft.returns_policy && draft.returns_policy !== 'no_returns'
    boost.push({
        key: 'returns', label: 'Returns Policy',
        points: goodReturns ? 2 : 0, max: 2,
        done: !!goodReturns, partial: false,
        tip: goodReturns ? 'Returns policy set' : 'Offer returns to improve search ranking',
    })

    // Immediate payment — 2pts
    const hasImmediate = draft.immediate_payment !== false
    boost.push({
        key: 'immediate_pay', label: 'Immediate Payment',
        points: hasImmediate ? 2 : 0, max: 2,
        done: hasImmediate, partial: false,
        tip: hasImmediate ? 'Immediate payment required' : 'Enable immediate payment to prevent unpaid orders',
    })

    // Fast dispatch — 1pt
    const fastDispatch = (draft.dispatch_days ?? 3) <= 2
    boost.push({
        key: 'dispatch', label: 'Fast Dispatch',
        points: fastDispatch ? 1 : 0, max: 1,
        done: fastDispatch, partial: false,
        tip: fastDispatch ? 'Fast dispatch — eligible for badge' : 'Set dispatch to 1-2 days for fast dispatch badge',
    })

    // Condition description for used items — 1pt
    const isUsed = draft.condition?.toLowerCase().includes('used') || draft.condition === 'For parts or not working'
    if (isUsed) {
        const hasCondDesc = (draft.condition_description?.trim()?.length ?? 0) > 10
        boost.push({
            key: 'cond_desc', label: 'Condition Notes',
            points: hasCondDesc ? 1 : 0, max: 1,
            done: hasCondDesc, partial: false,
            tip: hasCondDesc ? 'Condition described' : 'Describe defects/wear for used items',
        })
    }

    // ── Total ────────────────────────────────────────────────────
    const score = Math.min(
        required.reduce((a, i) => a + i.points, 0) +
        quality.reduce((a, i) => a + i.points, 0) +
        boost.reduce((a, i) => a + i.points, 0),
        100
    )

    const label = score >= 90 ? 'Excellent'
        : score >= 75 ? 'Good'
            : score >= 50 ? 'Fair'
                : score >= 25 ? 'Needs Work'
                    : 'Incomplete'

    const color = score >= 90 ? '#16a34a'
        : score >= 75 ? '#7530fb'
            : score >= 50 ? '#d97706'
                : '#ef4444'

    return { score, label, color, required, quality, boost }
}
