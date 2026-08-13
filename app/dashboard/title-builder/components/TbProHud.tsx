'use client'
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Plus, Info } from 'lucide-react'
import { AnimatedBar, AnimatedGauge, AnimatedRangeBar, AnimatedNumber, AnimatedCounter } from '@/components/ui/Animations'
import { AddButton } from '@/components/ui/Buttons'
import Tooltip from '@/components/ui/Tooltip'

const DC = {
  dark: '#1e1535',
  primary: '#7530fb',
  lime: '#7530fb',
  accent: '#b8fa33',
  muted: '#9ca3af',
  border: '#ede9fe',
  surface: '#ffffff',
  bg: '#f8f7ff',
  tint: '#f3eeff',
  green: '#16a34a',
  amber: '#d97706',
  red: '#b91c1c',
  blue: '#7530fb',
  teal: '#7530fb',
  text: '#1f1d2e',
}

interface VeroFlag { name: string; risk_level: string; evidence_url: string | null }
interface KeywordRow { kw: string; search: string; comp: string; avgSearches?: number; estSalesUnits?: number }

interface Props {
  flaggedVero: VeroFlag[]
  currentTitle: string
  saturScore: number
  trendData: number[]
  totalListings: number
  isLoading: boolean
  topWords: { word: string; percent: string; searches: number }[]
  longTailData: KeywordRow[]
  genericData: KeywordRow[]
  onInject: (kw: string) => void
}

// ── Score Calculator v3 — intelligent scoring with/without search ──
// Conditions enforced:
//  • Short titles (< 5 words) are always penalised — can't score 100% on position/quality
//  • Keyword Position checks meaningful words only, requires minimum word count
//  • Title Quality checks word count, filler words, duplicates, merged words
//  • All 4 factors are always meaningful regardless of search state
function calcScore(title: string, genericData: KeywordRow[]) {
  const empty = { total: 0, breakdown: [] as { label: string; score: number; max: number; tip: string }[] }
  if (!title.trim()) return empty

  // ── Fix #4: Clean special characters before processing ───────
  // Replace (&)/- with spaces, remove emojis and symbols, normalise whitespace
  const cleanTitle = title
    .replace(/[&()/\-_|•·★☆♦♥♠♣⭐🌟💥🔥✨]/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const tl = cleanTitle.toLowerCase()
  const words = cleanTitle.split(/\s+/)
  const wordCount = words.length
  const first33 = cleanTitle.slice(0, 33).toLowerCase()
  const hasSearch = genericData.length > 0
  const stopWords = new Set(['for', 'with', 'and', 'the', 'in', 'on', 'a', 'to', 'of', 'by', 'at', 'is', 'it', 'as', 'an', 'or'])
  const fillerWords = new Set([
    'amazing', 'premium', 'best', 'top', 'great', 'nice', 'good', 'super', 'ultra',
    'excellent', 'perfect', 'fantastic', 'brilliant', 'special', 'ultimate', 'incredible',
    'beautiful', 'gorgeous', 'stunning', 'wow', 'hot', 'deal', 'sale', 'cheap', 'bargain',
    'quality', 'fast', 'quick', 'easy', 'free', 'high', 'low', 'full', 'smart', 'auto',
  ])

  // ── Fix #1: Stem-based duplicate detection ───────────────────
  // Words in the same family count as ONE keyword to Cassini
  // e.g. Chew/Chewing/Chewer/Chewers → stem "chew"
  function getStem(word: string): string {
    const w = word.toLowerCase()
    // Remove common suffixes to find the root word
    if (w.endsWith('ers')) return w.slice(0, -3)  // chewers → chew
    if (w.endsWith('ing')) return w.slice(0, -3)  // chewing → chew
    if (w.endsWith('ings')) return w.slice(0, -4)  // chewings → chew
    if (w.endsWith('er')) return w.slice(0, -2)  // chewer → chew
    if (w.endsWith('ed')) return w.slice(0, -2)  // chewed → chew
    if (w.endsWith('es')) return w.slice(0, -2)  // chewes → chew (rare)
    if (w.endsWith('ies')) return w.slice(0, -3) + 'y' // puppies → puppy
    if (w.endsWith('s') && w.length > 4) return w.slice(0, -1)  // toys → toy
    return w
  }

  // ── 1. Title Length (20pts) ──────────────────────────────────
  // Use ORIGINAL title length (with special chars) — that's what eBay counts
  const len = title.length
  const lengthScore = len >= 75 ? 20 : len >= 60 ? 15 : len >= 40 ? 8 : len >= 20 ? 4 : 2

  // ── 2. Keyword Position (30pts) ──────────────────────────────
  // Only count REAL product words — not fillers, not duplicates, not stop words
  let positionScore = 0

  // ALL CAPS check — if most words are caps, title is policy-violating
  const capsWords = words.filter(w => w === w.toUpperCase() && w.length > 1 && !/^\d+$/.test(w))
  const isAllCaps = capsWords.length / words.length > 0.5

  // Real words = not stop words, not filler, not number-only, not stem-duplicate, not ALL CAPS
  const seenStems = new Set<string>()
  const realWords = words.filter(w => {
    const wl = w.toLowerCase()
    const stem = getStem(wl)
    if (isAllCaps && w === w.toUpperCase() && w.length > 1) return false
    if (stopWords.has(wl)) return false
    if (fillerWords.has(wl)) return false
    if (/^\d+$/.test(w)) return false
    if (w.length < 2) return false
    if (seenStems.has(stem)) return false  // stem duplicate — e.g. Chew + Chewer = same
    seenStems.add(stem)
    return true
  })
  const realCount = realWords.length

  if (hasSearch) {
    const topKws = genericData.slice(0, 10).map(k => k.kw.toLowerCase())
    const inFirst33 = topKws.filter(kw => first33.includes(kw))
    const baseScore = Math.round((inFirst33.length / Math.max(Math.min(topKws.length, 5), 1)) * 30)
    const wordPenalty = wordCount < 5 ? 0.3 : wordCount < 8 ? 0.6 : 1
    positionScore = Math.min(30, Math.round(baseScore * wordPenalty))
  } else {
    if (realCount < 2) {
      positionScore = realCount * 2
    } else {
      const inFirst33 = realWords.filter(w => first33.includes(w.toLowerCase()))
      const ratio = inFirst33.length / Math.min(realCount, 5)
      const baseScore = Math.round(ratio * 30)
      const wordPenalty = realCount < 3 ? 0.15 : realCount < 5 ? 0.3 : realCount < 8 ? 0.65 : 1
      positionScore = Math.min(30, Math.round(baseScore * wordPenalty))
    }
  }

  // ── 3. Keyword Coverage / Title Quality (25pts) ──────────────
  let coverageScore = 0
  if (hasSearch) {
    const top10 = genericData.slice(0, 10)
    const covered = top10.filter(k => tl.includes(k.kw.toLowerCase()))
    coverageScore = top10.length > 0
      ? Math.min(25, Math.round((covered.length / Math.min(top10.length, 8)) * 25))
      : 0
  } else {
    let quality = 25

    // Word count penalty
    if (realCount < 2) quality -= 23
    else if (realCount < 4) quality -= 18
    else if (realCount < 6) quality -= 10
    else if (realCount < 8) quality -= 5
    else if (realCount < 10) quality -= 2

    // ALL CAPS penalty — eBay doesn't allow all caps, Cassini ignores them
    if (isAllCaps) quality -= 15
    else {
      const capsCount = words.filter(w => w === w.toUpperCase() && w.length > 2 && !/^\d+$/.test(w)).length
      quality -= capsCount * 3
    }

    // Filler words — each one wastes character space
    const fillerCount = words.filter(w => fillerWords.has(w.toLowerCase())).length
    quality -= fillerCount * 5

    // Weak seller codes — "Level 2", "Type A", "Grade B", "Screaming", "Shrieking"
    const weakPatterns = [
      /\blevel\s*\d*\b/i, /\bsize\s*\d*\b/i, /\btype\s*[a-z\d]?\b/i,
      /\bgrade\s*[a-z\d]?\b/i, /\bseries\s*\d*\b/i, /\bgen\s*\d*\b/i,
      /\bscreaming\b/i, /\bshrieking\b/i, /\bwacky\b/i, /\bzany\b/i,
    ]
    const weakCount = weakPatterns.filter(p => p.test(title)).length
    quality -= weakCount * 4

    // Duplicates — stem-based (Chew/Chewing/Chewer all count as same)
    const allStems = words.map(w => getStem(w.toLowerCase()))
    const dupCount = allStems.length - new Set(allStems).size
    quality -= dupCount * 7

    // Merged words
    const mergedCount = words.filter(w => /[a-z][A-Z]/.test(w) && w.length > 5).length
    quality -= mergedCount * 4

    // Stop word ratio
    const stopCount = words.filter(w => stopWords.has(w.toLowerCase())).length
    if (wordCount > 0 && stopCount / wordCount > 0.4) quality -= 8

    coverageScore = Math.max(0, Math.min(25, quality))
  }

  // ── 4. Item Specifics (15pts) ────────────────────────────────
  // Detects 4 specifics buyers actually search for:
  // Condition (5pts) — New/Used/Refurbished
  // Size/Model (4pts) — Small/Large/XL/Pro/Max etc
  // Material (3pts) — Steel/Rubber/Silicone etc
  // Quantity/Pack (3pts) — 2 Pack/10Pcs/Set of 5 etc
  let specificsScore = 0

  const hasCondition = /\b(new|used|refurbished|faulty|genuine|original|pre-owned|preowned)\b/i.test(cleanTitle)
  const hasSize = /\b(small|medium|large|xl|xxl|xxl|xs|mini|plus|max|ultra|pro|lite|standard|compact|heavy\s*duty|heavy-duty)\b/i.test(cleanTitle)
  const hasMaterial = /\b(steel|stainless|aluminum|aluminium|carbon|rubber|plastic|metal|leather|silicone|glass|titanium|nylon|polyester|cotton|wood|bamboo|ceramic|copper|brass|zinc|iron)\b/i.test(cleanTitle)
  const hasQuantity = /\b(\d+\s*(pack|pcs|pcs|piece|pieces|pairs?|set|sets|count|ct|oz|ml|mm|inch|cm|ft|yards?|meters?|kg|lb|lbs))\b/i.test(cleanTitle) ||
    /\b(twin|double|triple|quad|duo|pair|bundle|multipack|multi-pack|value\s*pack)\b/i.test(cleanTitle)

  if (hasCondition) specificsScore += 5
  if (hasSize) specificsScore += 4
  if (hasMaterial) specificsScore += 3
  if (hasQuantity) specificsScore += 3

  // ── Generate tips for each factor ───────────────────────────
  const lengthTip = len >= 75 ? '✅ Perfect length'
    : len >= 60 ? `⚠ Add ${75 - len} more chars to reach optimal length`
      : len >= 40 ? '⚠ Too short — add more keywords'
        : '❌ Very short — title needs much more detail'

  let positionTip = ''
  if (hasSearch) {
    const topKwsForTip = genericData.slice(0, 5).map(k => k.kw)
    const missingFromFirst33 = topKwsForTip.filter(kw => !first33.includes(kw.toLowerCase()))
    positionTip = missingFromFirst33.length === 0
      ? '✅ Key keywords visible on mobile'
      : `⚠ Move "${missingFromFirst33[0]}" to first 33 chars`
  } else {
    const missingWords = realWords.filter(w => !first33.includes(w.toLowerCase())).slice(0, 2)
    positionTip = missingWords.length === 0
      ? '✅ Main words visible on mobile'
      : `⚠ Move "${missingWords[0]}" to start of title`
  }

  const qualityTip = (() => {
    const allStems2 = words.map(w => getStem(w.toLowerCase()))
    const dups2 = allStems2.length - new Set(allStems2).size
    const fillerC = words.filter(w => fillerWords.has(w.toLowerCase())).length
    if (isAllCaps) return '❌ Avoid ALL CAPS — eBay penalises this'
    if (dups2 > 0) return `⚠ ${dups2} duplicate word${dups2 > 1 ? 's' : ''} found — remove to free space`
    if (fillerC > 0) return `⚠ ${fillerC} filler word${fillerC > 1 ? 's' : ''} detected — replace with keywords`
    if (realCount < 6) return '⚠ Too few keywords — add more product words'
    return '✅ Clean title — no issues found'
  })()

  const specificsTip = (() => {
    const missing = []
    if (!hasCondition) missing.push('Condition')
    if (!hasSize) missing.push('Size')
    if (!hasQuantity) missing.push('Quantity')
    if (!hasMaterial) missing.push('Material')
    if (missing.length === 0) return '✅ Good specifics coverage'
    return `⚠ Missing: ${missing.slice(0, 2).join(' & ')}`
  })()

  const total = Math.min(100, lengthScore + positionScore + coverageScore + specificsScore)

  return {
    total,
    breakdown: [
      { label: 'Title Length', score: lengthScore, max: 20, tip: lengthTip },
      { label: 'Keyword Position', score: positionScore, max: 30, tip: positionTip },
      { label: hasSearch ? 'Keyword Coverage' : 'Title Quality', score: coverageScore, max: 25, tip: qualityTip },
      { label: 'Item Specifics', score: specificsScore, max: 15, tip: specificsTip },
    ]
  }
}

// ── Detect Specifics ───────────────────────────────────────────
function detectSpecifics(title: string): { label: string; value: string }[] {
  if (!title.trim()) return []
  const t = title.toLowerCase()
  const res: { label: string; value: string }[] = []

  // Condition
  for (const c of ['New', 'Used', 'Refurbished', 'Faulty', 'Pre-Owned', 'Genuine', 'Original']) {
    if (t.includes(c.toLowerCase())) { res.push({ label: 'Condition', value: c }); break }
  }

  // Size / Model
  for (const s of ['Small', 'Medium', 'Large', 'XL', 'XXL', 'XS', 'Mini', 'Plus', 'Max', 'Ultra', 'Pro', 'Lite', 'Standard', 'Compact', 'Heavy Duty']) {
    if (new RegExp(`\\b${s}\\b`, 'i').test(t)) { res.push({ label: 'Size', value: s.toUpperCase() }); break }
  }

  // Material
  for (const m of ['Leather', 'Silicone', 'Plastic', 'Metal', 'Aluminum', 'Aluminium', 'Carbon', 'Rubber', 'Fabric', 'Glass', 'Titanium', 'Steel', 'Nylon', 'Cotton', 'Wood', 'Bamboo', 'Ceramic', 'Copper']) {
    if (t.includes(m.toLowerCase())) { res.push({ label: 'Material', value: m }); break }
  }

  // Quantity / Pack size
  const qtyMatch = t.match(/\b(\d+\s*(pack|pcs|pieces?|pairs?|set|count|ct|oz|ml|mm|cm|inch|ft|kg|lb|lbs))\b/i)
  if (qtyMatch) {
    res.push({ label: 'Quantity', value: qtyMatch[0].trim() })
  } else {
    for (const q of ['Twin', 'Double', 'Triple', 'Quad', 'Duo', 'Bundle', 'Multipack', 'Multi-Pack', 'Value Pack']) {
      if (t.includes(q.toLowerCase())) { res.push({ label: 'Quantity', value: q }); break }
    }
  }

  // Colour
  for (const c of ['Black', 'White', 'Red', 'Blue', 'Green', 'Silver', 'Gold', 'Purple', 'Yellow', 'Pink', 'Clear', 'Brown', 'Grey', 'Gray', 'Orange']) {
    if (t.includes(c.toLowerCase())) { res.push({ label: 'Colour', value: c }); break }
  }

  // Compatibility
  if (t.includes('universal')) res.push({ label: 'Compatibility', value: 'Universal' })
  else if (t.includes('iphone')) res.push({ label: 'Compatibility', value: 'iPhone' })
  else if (t.includes('samsung')) res.push({ label: 'Compatibility', value: 'Samsung' })
  else if (t.includes('android')) res.push({ label: 'Compatibility', value: 'Android' })

  return res.slice(0, 6)
}

// ── Main ───────────────────────────────────────────────────────
export default function TbProHud({ flaggedVero, currentTitle, trendData, totalListings, isLoading, topWords, longTailData, genericData, onInject }: Props) {

  const isEmpty = !currentTitle.trim()
  const tl = currentTitle.toLowerCase()
  const { total: optScore, breakdown } = calcScore(currentTitle, genericData)
  const specifics = detectSpecifics(currentTitle)
  const isSafe = flaggedVero.length === 0

  const hasCritical = flaggedVero.some(f => f.risk_level === 'Critical Ban')
  const hasHighRisk = flaggedVero.some(f => f.risk_level === 'High Risk')
  const veroColor = hasCritical ? DC.red : hasHighRisk ? DC.amber : DC.blue

  const listingsLabel = totalListings >= 1_000_000 ? `${(totalListings / 1_000_000).toFixed(1)}M`
    : totalListings >= 1_000 ? `${(totalListings / 1_000).toFixed(1)}K` : `${totalListings}`
  const compColor = totalListings > 100_000 ? DC.red : totalListings > 30_000 ? DC.amber : DC.green
  const compLabel = totalListings > 100_000 ? 'HIGH' : totalListings > 30_000 ? 'MODERATE' : totalListings > 0 ? 'LOW' : '—'
  const compBg = totalListings > 100_000 ? '#fef2f2' : totalListings > 30_000 ? '#fffbeb' : '#f0fdf4'
  const isGrowing = totalListings > 0 && totalListings < 100_000

  const priceMin = trendData.length > 0 ? Math.min(...trendData) : null
  const priceMax = trendData.length > 0 ? Math.max(...trendData) : null
  const priceAvg = trendData.length > 0 ? trendData.reduce((a, b) => a + b, 0) / trendData.length : null

  const coverageKws = genericData.slice(0, 8)
  const missing = coverageKws.filter(k => !tl.includes(k.kw.toLowerCase()))

  // Combine generic + long-tail missing keywords, sort by density
  const allMissing = [
    ...genericData.filter(k => !tl.includes(k.kw.toLowerCase())),
    ...longTailData.filter(k => !tl.includes(k.kw.toLowerCase())),
  ]
  // Deduplicate by kw
  const seen = new Set<string>()
  const dedupedMissing = allMissing.filter(k => {
    const key = k.kw.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  // Sort by density (comp %)
  const quickWins = dedupedMissing
    .sort((a, b) => (parseInt(b.comp) || 0) - (parseInt(a.comp) || 0))
    .slice(0, 5)

  // Opportunity score — inverse of competition × price room
  const priceRange = (priceMax && priceMin) ? priceMax - priceMin : 0
  const hasWidePrice = priceRange > 20
  const opportunityScore = totalListings > 0
    ? Math.round(Math.max(0, Math.min(10,
      (totalListings > 100_000 ? 3 : totalListings > 30_000 ? 6 : 9) +
      (hasWidePrice ? 1 : 0) +
      (missing.length > 3 ? 1 : 0)
    )))
    : null

  return (
    <div className="flex gap-3" style={{ height: '100%' }}>
      <style>{`.sp-noscroll::-webkit-scrollbar{display:none}`}</style>

      {/* ── LEFT — Title Analysis ── */}
      <div className="flex-1 rounded-xl border p-4 flex flex-col gap-4 sp-noscroll"
        style={{ backgroundColor: DC.surface, borderColor: DC.border, boxShadow: '0 2px 8px rgba(117,48,251,0.08)', overflow: 'hidden' }}>

        {/* Item Specifics + VeRO — side by side */}
        <div className="flex gap-3">

          {/* Left — Item Specifics */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: DC.muted }}>
              Item Specifics Detected <Tooltip text="Product details detected from your title." position="top"><Info size={11} style={{ display: 'inline', verticalAlign: 'middle', color: DC.muted, cursor: 'pointer' }} /></Tooltip>
            </p>
            {isEmpty ? (
              <p className="text-[11px] italic" style={{ color: DC.muted }}>Start typing...</p>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Detected specifics */}
                {specifics.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {specifics.map((s, i) => (
                      <div key={i}>
                        <p className="text-[9px] font-black tracking-widest uppercase mb-0.5" style={{ color: DC.primary }}>{s.label}</p>
                        <p className="text-[13px] font-bold" style={{ color: DC.dark }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* Missing hints */}
                {(() => {
                  const tl = currentTitle.toLowerCase()
                  const missing: { label: string; hint: string }[] = []
                  if (!/\b(new|used|refurbished|faulty|pre-owned|genuine|original)\b/i.test(currentTitle))
                    missing.push({ label: 'Condition', hint: 'Add "New" or "Used"' })
                  if (!/\b(small|medium|large|xl|xxl|xs|mini|plus|max|ultra|pro|lite|heavy\s*duty)\b/i.test(currentTitle))
                    missing.push({ label: 'Size', hint: 'Add size like "Large" or "Mini"' })
                  if (!/\b(\d+\s*(pack|pcs|piece|pairs?|set|count)|twin|double|triple|bundle|multipack)\b/i.test(tl))
                    missing.push({ label: 'Quantity', hint: 'Add "2 Pack" or "10Pcs"' })
                  if (missing.length === 0) return null
                  return (
                    <div className="flex flex-col gap-1">
                      {missing.map((m, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="text-[9px]" style={{ color: DC.amber }}>⚠</span>
                          <span className="text-[10px]" style={{ color: DC.muted }}>
                            <span style={{ color: DC.amber, fontWeight: 700 }}>{m.label}:</span> {m.hint}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Vertical divider */}
          <div style={{ width: 1, backgroundColor: DC.border, alignSelf: 'stretch' }} />

          {/* Right — VeRO */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: DC.muted }}>
              VeRO Risk Assessment <Tooltip text="Flagged brands can get your listing removed." position="top"><Info size={11} style={{ display: 'inline', verticalAlign: 'middle', color: DC.muted, cursor: 'pointer' }} /></Tooltip>
            </p>
            {isEmpty ? (
              <p className="text-[11px] italic" style={{ color: DC.muted }}>Awaiting title...</p>
            ) : isSafe ? (
              <div className="flex items-center gap-2 rounded-lg p-2" style={{ backgroundColor: '#f0fdf4', border: `1px solid #bbf7d0` }}>
                <ShieldCheck size={13} style={{ color: DC.green, flexShrink: 0 }} />
                <p className="text-[11px] font-bold" style={{ color: DC.green }}>VeRO SECURE</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {flaggedVero.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg p-2"
                    style={{ backgroundColor: hasCritical ? '#fef2f2' : '#fffbeb', border: `1px solid ${hasCritical ? '#fecaca' : '#fde68a'}` }}>
                    <AlertTriangle size={13} style={{ color: veroColor, flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p className="text-[11px] font-bold" style={{ color: veroColor }}>{f.name}</p>
                      <p className="text-[9px]" style={{ color: DC.muted }}>{f.risk_level}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-px" style={{ backgroundColor: DC.border }} />

        {/* Keywords In Your Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: DC.muted }}>
              Keywords In Your Title <Tooltip text="Top searched keywords — cover more to get found by more buyers." position="top"><Info size={11} style={{ display: 'inline', verticalAlign: 'middle', color: DC.muted, cursor: 'pointer' }} /></Tooltip>
            </p>
            {coverageKws.length > 0 && (
              <span className="text-[10px] font-bold" style={{ color: DC.primary }}>
                {coverageKws.filter(k => tl.includes(k.kw.toLowerCase())).length} of {coverageKws.length}
              </span>
            )}
          </div>
          {coverageKws.length === 0 ? (
            <p className="text-[11px] italic" style={{ color: DC.muted }}>Search a keyword to see coverage...</p>
          ) : (
            <div className="flex flex-col gap-2">
              {/* In title */}
              {coverageKws.some(k => tl.includes(k.kw.toLowerCase())) && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: DC.green }}>✓ In Title</p>
                  <div className="flex flex-wrap gap-1.5">
                    {coverageKws.filter(k => tl.includes(k.kw.toLowerCase())).map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ backgroundColor: '#f0fdf4', color: DC.green, border: '1px solid #bbf7d0' }}>
                        {kw.kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Missing — clickable */}
              {coverageKws.some(k => !tl.includes(k.kw.toLowerCase())) && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: DC.red }}>✗ Missing — tap to add</p>
                  <div className="flex flex-wrap gap-1.5">
                    {coverageKws.filter(k => !tl.includes(k.kw.toLowerCase())).map((kw, i) => {
                      const wouldExceed = currentTitle.length + kw.kw.length + 1 > 80
                      return (
                        <button key={i}
                          onClick={() => !wouldExceed && onInject(kw.kw)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{
                            backgroundColor: wouldExceed ? '#fafafa' : '#fef2f2',
                            color: wouldExceed ? DC.muted : DC.red,
                            border: `1px solid ${wouldExceed ? DC.border : '#fecaca'}`,
                            cursor: wouldExceed ? 'not-allowed' : 'pointer',
                            opacity: wouldExceed ? 0.5 : 1,
                          }}>
                          {kw.kw}
                          {kw.avgSearches ? (
                            <span className="text-[9px] ml-1" style={{ color: wouldExceed ? DC.muted : '#f87171' }}>
                              {kw.avgSearches >= 1000 ? `${(kw.avgSearches / 1000).toFixed(1)}K` : kw.avgSearches}
                            </span>
                          ) : null}
                          {!wouldExceed && <span className="text-[9px]"> +</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Wins */}
        {quickWins.length > 0 && !isEmpty && (
          <>
            <div className="h-px shrink-0" style={{ backgroundColor: DC.border }} />
            <div className="flex flex-col min-h-0 flex-1">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: DC.muted }}>
                  Quick Wins <Tooltip text="Missing keywords from top listings. Click ADD to inject." position="top"><Info size={11} style={{ display: 'inline', verticalAlign: 'middle', color: DC.muted, cursor: 'pointer' }} /></Tooltip>
                </p>
                <span className="text-[9px]" style={{ color: DC.muted }}>{currentTitle.length}/80 chars used</span>
              </div>
              {/* Scrollable list only */}
              <div className="sp-noscroll" style={{ overflowY: 'auto', scrollbarWidth: 'none' }}>
                <div className="flex flex-col gap-1.5">
                  {quickWins.map((kw, i) => {
                    const charsNeeded = kw.kw.length + 1
                    const wouldExceed = currentTitle.length + charsNeeded > 80
                    const density = parseInt(kw.comp) || 0
                    return (
                      <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2"
                        style={{ backgroundColor: wouldExceed ? '#fafafa' : DC.bg, border: `1px solid ${DC.border}` }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-semibold" style={{ color: wouldExceed ? DC.muted : DC.primary }}>
                              + {kw.kw}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: density >= 50 ? '#f0fdf4' : '#f8f7ff', color: density >= 50 ? DC.green : DC.muted }}>
                              {density}%
                            </span>
                            <span className="text-[9px]" style={{ color: DC.muted }}>+{charsNeeded} chars</span>
                          </div>
                        </div>
                        {wouldExceed ? (
                          <span className="text-[9px] font-bold px-2 py-1 rounded-lg shrink-0"
                            style={{ backgroundColor: '#fef2f2', color: DC.red }}>
                            Title full
                          </span>
                        ) : (
                          <AddButton onClick={() => onInject(kw.kw)} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 rounded-xl border p-4 flex flex-col gap-4"
        style={{ backgroundColor: DC.surface, borderColor: DC.border, boxShadow: '0 2px 8px rgba(117,48,251,0.08)', overflow: 'hidden' }}>

        {/* Gauge */}
        <AnimatedGauge
          score={optScore}
          color={optScore >= 80 ? DC.green : optScore >= 60 ? DC.blue : optScore >= 40 ? DC.amber : DC.red}
          label={optScore >= 80 ? 'OPTIMIZED' : optScore >= 60 ? 'GOOD' : optScore >= 40 ? 'NEEDS WORK' : optScore === 0 ? 'AWAITING' : 'WEAK'}
        />

        {/* Score breakdown — 2 column grid — always visible */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {(isEmpty ? [
            { label: 'Title Length', score: 0, max: 20, tip: '' },
            { label: 'Keyword Position', score: 0, max: 30, tip: '' },
            { label: 'Keyword Coverage', score: 0, max: 25, tip: '' },
            { label: 'Item Specifics', score: 0, max: 15, tip: '' },
          ] : breakdown).map((b, i) => {
            const pct = Math.round((b.score / b.max) * 100)
            const tipColor = b.tip?.startsWith('✅') ? DC.green
              : b.tip?.startsWith('❌') ? DC.red
                : DC.amber
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px]" style={{ color: DC.muted }}>{b.label}</span>
                  <AnimatedCounter
                    value={pct}
                    format={n => `${Math.round(n)}%`}
                    className="text-[10px] font-bold"
                    style={{ color: DC.primary }}
                  />
                </div>
                <AnimatedBar value={pct} color={'#7530fb'} height={6} delay={i * 80} />
                {b.tip && !isEmpty && (
                  <p className="text-[9px] mt-1 leading-tight" style={{ color: tipColor }}>
                    {b.tip}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="h-px" style={{ backgroundColor: DC.border }} />

        {/* Competition + Opportunity */}
        <div>
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[10px] mb-0.5" style={{ color: DC.muted }}>Competition <Tooltip text="Total live eBay listings for this keyword." position="top"><Info size={11} style={{ display: 'inline', verticalAlign: 'middle', color: DC.muted, cursor: 'pointer' }} /></Tooltip></p>
              <p className="text-[16px] font-extrabold" style={{ color: DC.dark }}>
                {totalListings > 0
                  ? <><AnimatedNumber value={listingsLabel} style={{ color: DC.dark }} /> Live Listings</>
                  : 'Awaiting search...'}
              </p>
            </div>
            {totalListings > 0 && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg"
                  style={{ backgroundColor: compBg, color: compColor }}>{compLabel}</span>
                {opportunityScore !== null && (
                  <span className="text-[10px] font-bold" style={{ color: opportunityScore >= 7 ? DC.green : opportunityScore >= 5 ? DC.amber : DC.red }}>
                    Opportunity {opportunityScore}/10
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price Distribution */}
          {priceMin !== null && priceAvg !== null && priceMax !== null ? (
            <div className="mt-3">
              <p className="text-[10px] mb-2" style={{ color: DC.muted }}>Price Distribution <Tooltip text="Min, average and max prices from live listings." position="top"><Info size={11} style={{ display: 'inline', verticalAlign: 'middle', color: DC.muted, cursor: 'pointer' }} /></Tooltip></p>
              <AnimatedRangeBar min={priceMin} avg={priceAvg} max={priceMax} />
            </div>
          ) : (
            <p className="text-[11px] italic mt-2" style={{ color: DC.muted }}>Price data loads after search...</p>
          )}
        </div>

        <div className="h-px" style={{ backgroundColor: DC.border }} />

        {/* Top Keywords In Listings — scrollable only */}
        <div className="flex flex-col min-h-0 flex-1">
          <p className="text-[10px] font-black tracking-widest uppercase mb-2 shrink-0" style={{ color: DC.muted }}>
            Top Keywords In Listings <Tooltip text="Words used most in competing listing titles." position="top"><Info size={11} style={{ display: 'inline', verticalAlign: 'middle', color: DC.muted, cursor: 'pointer' }} /></Tooltip>
          </p>
          <div className="flex-1 sp-noscroll" style={{ overflowY: 'auto', scrollbarWidth: 'none' }}>
            {topWords.length === 0 ? (
              <p className="text-[11px] italic" style={{ color: DC.muted }}>Search a keyword to see data...</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {topWords.slice(0, 10).map((w, i) => {
                  const pct = parseInt(w.percent) || 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold" style={{ color: DC.dark }}>{w.word}</span>
                        <span className="text-[11px] font-bold" style={{ color: DC.primary }}>{w.percent} of listings</span>
                      </div>
                      <AnimatedBar value={Math.min(pct * 2, 100)} color={'#7530fb'} height={8} delay={i * 100} duration={700} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
