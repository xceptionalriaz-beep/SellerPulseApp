'use client'
// app/dashboard/title-builder/components/TbStudio.tsx
// Converted 1:1 from lib/pages/title_builder/tb_studio.dart

import { useState, useEffect } from 'react'
import { Copy, CheckCircle, RotateCcw } from 'lucide-react'
import { TitleCleanerEngine } from './engines/titleCleanerEngine'
import { TitleSpinnerEngine, SpinMode, DiffToken } from './engines/titleSpinnerEngine'

const C = {
  border: '#E2E8F0', text: '#0F172A', muted: '#9CA3AF',
}

// VeroFlag type matches the richer detection output from page.tsx
interface VeroFlag { name: string; risk_level: string; evidence_url: string | null }

// Risk level → colour mapping used in the pills
const RISK_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  'Critical Ban': { text: '#991B1B', bg: '#FEF2F2', border: '#FECACA' },
  'High Risk': { text: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  'Caution': { text: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
}

interface Props {
  value: string
  onChange: (v: string) => void
  charCount: number
  flaggedVero: VeroFlag[]
  duplicateCount: number
  onCopy?: () => void
  keywordContext?: string[]
  aiOptimizeLimit: number | null
  aiOptimizeUsed: number
  onAiOptimizeUsed: () => void
  categoryName?: string   // from eBay Extract — drives category-aware spin
  activeLocation?: string   // 'US' | 'UK' | 'CA' | 'AU' — drives filler locale in Fill to 80
}
export default function TbStudio({
  value, onChange, charCount, flaggedVero, duplicateCount, onCopy,
  keywordContext = [], aiOptimizeLimit, aiOptimizeUsed, onAiOptimizeUsed,
  categoryName = '', activeLocation = 'US',
}: Props) {
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Fix 11: AI before/after comparison state
  const [aiOriginal, setAiOriginal] = useState<string | null>(null)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [aiProvider, setAiProvider] = useState<string | null>(null)
  const [aiSellerType, setAiSellerType] = useState<string | null>(null)
  const [aiPreviousSuggestion, setAiPreviousSuggestion] = useState<string | null>(null)

  // Pre-call quality gate — shown when title is too vague for good AI results
  const [aiNeedsInfo, setAiNeedsInfo] = useState<{ missing: string[]; message: string } | null>(null)
  const [quickCondition, setQuickCondition] = useState<string>('')   // 'new'|'used'|'faulty'|''
  const [quickCategory, setQuickCategory] = useState<string>('')   // quick-selected category

  // Fix 13 upgrade: spin state — includes mode selector and word-level diff
  const [spinMode, setSpinMode] = useState<SpinMode>('DUPLICATE_SAFE')
  const [spinOriginal, setSpinOriginal] = useState<string | null>(null)
  const [spinSuggestion, setSpinSuggestion] = useState<string | null>(null)
  const [spinDiff, setSpinDiff] = useState<DiffToken[]>([])
  const [spinCopied, setSpinCopied] = useState(false)
  // History stores title + its own diff so restoring always shows correct highlighting
  const [spinHistory, setSpinHistory] = useState<Array<{ title: string; diff: DiffToken[] }>>([])
  // No-change feedback — shown when the engine can't improve the title in the selected mode
  const [spinNoChange, setSpinNoChange] = useState<string | null>(null)

  // Mode-specific no-change messages — tells the seller WHY and what to do instead
  const NO_CHANGE_MSG: Record<SpinMode, string> = {
    DUPLICATE_SAFE: 'Your title has too few words to shuffle into a meaningfully different order. Try adding more keywords first, then spin again.',
    AB_TEST: 'Could not generate a different market angle for this title. Try again — the engine picks a different buyer segment each attempt.',
    FILL_TO_80: 'Your title is already at or near the 80-character eBay limit. There\'s no room to add keywords. Try Duplicate Safe or A/B Test instead.',
    CLEAN_TIGHTEN: 'Your title is already clean — no vague words, no internal codes, and no room to add power keywords at 80 chars. It\'s already optimal. Try A/B Test to reach new buyer segments, or Duplicate Safe to create a relist variation.',
  }

  // Mode descriptions — shown as a one-line explainer below the pill selector
  const SPIN_MODE_DESC: Record<SpinMode, string> = {
    DUPLICATE_SAFE: 'Relisting a sold item? This keeps the same meaning but changes word order enough that eBay won\'t treat it as a duplicate listing.',
    AB_TEST: 'Creates a different keyword angle from the same title — useful for testing which buyer search intent converts better.',
    FILL_TO_80: 'Only adds relevant words, never reorders. Use this when your title is short and you want to hit the 80-char eBay sweet spot.',
    CLEAN_TIGHTEN: 'Strips vague filler words (amazing, premium, best) and tightens to 75 chars. Good for old or supplier-copied titles.',
  }

  // Dismiss all panels when seller edits the title manually
  useEffect(() => {
    if (aiOriginal !== null && value !== aiOriginal) {
      setAiOriginal(null); setAiSuggestion(null)
    }
    if (spinOriginal !== null && value !== spinOriginal) {
      setSpinOriginal(null); setSpinSuggestion(null); setSpinDiff([]); setSpinHistory([])
    }
    if (spinNoChange !== null) setSpinNoChange(null)
    if (aiNeedsInfo !== null) setAiNeedsInfo(null) // clear pre-call panel on edit
  }, [value])

  const aiAtLimit = aiOptimizeLimit !== null && aiOptimizeLimit !== -1 && aiOptimizeUsed >= aiOptimizeLimit
  const showAiPanel = aiOriginal !== null && aiSuggestion !== null
  const showSpinPanel = spinOriginal !== null && spinSuggestion !== null

  // Clean state — shows what the engine changed after running
  const [cleanLog, setCleanLog] = useState<Array<{ type: string; label: string; detail: string }>>([])
  const [cleanNoChange, setCleanNoChange] = useState(false)

  // Dismiss clean log when seller edits title
  useEffect(() => {
    if (cleanLog.length > 0 || cleanNoChange) {
      setCleanLog([])
      setCleanNoChange(false)
    }
  }, [value])

  // 🚀 Clean trigger
  function cleanTitle() {
    if (!value) return
    const result = TitleCleanerEngine.clean(value)
    if (!result.changed) {
      setCleanNoChange(true)
      setCleanLog([])
      return
    }
    setCleanNoChange(false)
    setCleanLog(result.log)
    onChange(result.title)
  }

  // 🔄 Spin — upgraded: uses selected mode + category awareness + stores diff
  function spinTitle() {
    if (!value.trim()) return
    setSpinNoChange(null) // clear any previous no-change message
    const original = value
    const res = TitleSpinnerEngine.spin(value, 3, spinMode, categoryName, activeLocation)

    // Engine returned empty — something went wrong
    if (!res.title) {
      setSpinNoChange(NO_CHANGE_MSG[spinMode])
      return
    }

    // Strip policy guard from original for an apples-to-apples comparison
    // (the engine always applies policy guard internally, so we compare against
    // the cleaned version, not the raw textarea value)
    const cleanedOriginal = value.trim().replace(/\s+/g, ' ')
    if (res.title === cleanedOriginal || res.title === value.trim()) {
      // Engine ran fine but couldn't improve the title in this mode
      setSpinNoChange(NO_CHANGE_MSG[spinMode])
      return
    }

    setSpinOriginal(original)
    setSpinSuggestion(res.title)
    setSpinDiff(res.diff)
    setSpinHistory([]) // fresh spin always starts with a clean history
  }

  function handleSpinKeep() {
    if (!spinSuggestion) return
    onChange(spinSuggestion)
    setSpinOriginal(null); setSpinSuggestion(null); setSpinDiff([])
    setSpinCopied(false); setSpinHistory([]); setSpinNoChange(null)
  }

  // Try Again: push current to history (with its diff), get a new result
  function handleSpinAgain() {
    if (!spinOriginal) return
    const res = TitleSpinnerEngine.spin(spinOriginal, 3, spinMode, categoryName, activeLocation)
    if (res.title && res.title !== spinSuggestion) {
      if (spinSuggestion) {
        setSpinHistory(prev => [{ title: spinSuggestion, diff: spinDiff }, ...prev].slice(0, 3))
      }
      setSpinSuggestion(res.title)
      setSpinDiff(res.diff)
      setSpinCopied(false)
    }
  }

  function handleSpinRevert() {
    setSpinOriginal(null); setSpinSuggestion(null); setSpinDiff([])
    setSpinCopied(false); setSpinHistory([]); setSpinNoChange(null)
  }

  // 🚀 AI Optimize — shows before/after panel instead of immediately replacing (fix 11)
  // 🚀 AI Optimize — full context-aware call with quality gate + seller type detection
  async function runAIOptimize() {
    if (!value.trim() || aiLoading) return
    if (aiAtLimit) {
      setAiError(`You've used all ${aiOptimizeLimit} AI Optimize credits for this period. Upgrade to get more.`)
      return
    }
    setAiLoading(true)
    setAiError(null)
    setAiNeedsInfo(null)
    const original = value
    try {
      const res = await fetch('/api/title-builder/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: value,
          keywords: keywordContext,
          categoryName: categoryName,
          charCount: charCount,
          marketplace: activeLocation,
          previousSuggestion: aiPreviousSuggestion ?? '',
          // quickContext: sent when seller filled the pre-call question panel
          quickContext: (quickCondition || quickCategory) ? {
            condition: quickCondition || 'unknown',
            category: quickCategory || categoryName,
          } : null,
        }),
      })
      const data = await res.json()

      if (res.ok && data.needsMoreInfo) {
        // Title too vague — show quick question panel, save the API credit
        setAiNeedsInfo({ missing: data.missing ?? [], message: data.message ?? '' })
      } else if (res.ok && data.optimizedTitle) {
        setAiOriginal(original)
        setAiSuggestion(data.optimizedTitle)
        setAiProvider(data.provider ?? null)
        setAiSellerType(data.sellerType ?? null)
        setAiPreviousSuggestion(data.optimizedTitle)
        setAiNeedsInfo(null)
        setQuickCondition('')
        setQuickCategory('')
      } else {
        const msg = data.error?.includes('No AI provider')
          ? 'No AI provider configured. Ask your admin to set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in Vercel environment variables.'
          : (data.error ?? 'AI Optimize failed — try again.')
        setAiError(msg)
      }
    } catch {
      setAiError('AI Optimize failed — check your connection.')
    }
    setAiLoading(false)
  }

  function handleKeep() {
    if (!aiSuggestion) return
    onChange(aiSuggestion)
    onAiOptimizeUsed()
    setAiOriginal(null); setAiSuggestion(null); setAiProvider(null); setAiSellerType(null)
    // Keep aiPreviousSuggestion so if they optimize again after keeping,
    // AI knows what was already tried
  }

  function handleRevert() {
    setAiOriginal(null); setAiSuggestion(null); setAiProvider(null); setAiSellerType(null)
    setAiPreviousSuggestion(null) // full revert = fresh start for next AI call
  }

  // Strength meter
  const progress = Math.min(charCount / 80, 1)
  const strengthColor = charCount > 80
    ? '#EF4444'
    : charCount >= 65 ? '#10B981' : '#F97316'

  // Pill badge helper
  function PillBadge({ text, textColor, bgColor }: { text: string; textColor: string; bgColor: string }) {
    return (
      <div className="px-2.5 py-1 rounded-full border text-[12px] font-bold"
        style={{ color: textColor, backgroundColor: bgColor, borderColor: textColor + '4D' }}>
        {text}
      </div>
    )
  }

  // Action button helper
  function ActionBtn({ text, textColor, bgColor, onTap }: { text: string; textColor: string; bgColor: string; onTap: () => void }) {
    return (
      <button onClick={onTap}
        className="px-4 py-2 rounded-lg border text-[13px] font-bold transition-all hover:opacity-80"
        style={{ color: textColor, backgroundColor: bgColor, borderColor: textColor + '4D' }}>
        {text}
      </button>
    )
  }

  return (
    <div className="p-6 rounded-2xl border"
      style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 0 10px rgba(0,0,0,0.03)' }}>

      {/* Section label */}
      <p className="text-[13px] font-bold mb-4" style={{ color: C.muted }}>THE AUTO TITLE BUILDER</p>

      {/* Text box area */}
      <div className="rounded-xl border mb-5" style={{ borderColor: '#93C5FD', borderWidth: 1.5 }}>
        <div className="flex items-start gap-2 pl-4 pr-1 pt-1.5">
          <textarea value={value} onChange={e => onChange(e.target.value)} rows={2}
            maxLength={110}
            className="flex-1 text-[18px] font-semibold outline-none resize-none bg-transparent py-1"
            style={{ color: C.text }} />
          <button onClick={() => { navigator.clipboard.writeText(value); onCopy?.() }}
            title="Copy Title"
            className="p-2 hover:opacity-70 shrink-0">
            <Copy size={18} style={{ color: '#3B82F6' }} />
          </button>
        </div>

        {/* Fix 5: Mobile Cutoff at real eBay truncation point (~33 chars) */}
        <div className="relative mx-2.5 my-1" style={{ height: 16 }}>
          <div className="absolute top-1/2 -translate-y-1/2 h-px"
            style={{ left: 0, width: `${(33 / 80) * 100}%`, backgroundColor: '#BFDBFE' }} />
          <div className="absolute top-1/2 -translate-y-1/2 text-[10px] font-bold bg-white px-1"
            style={{ left: `calc(${(33 / 80) * 100}% - 2px)`, color: '#3B82F6', transform: 'translate(-100%, -50%)' }}>
            Mobile Cutoff
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 h-px"
            style={{ left: `${(33 / 80) * 100}%`, right: 0, backgroundColor: '#E5E7EB' }} />
        </div>
        <div className="pb-2" />
      </div>

      {/* Fix 11: AI Before / After comparison panel */}
      {/* ── Needs More Info panel — shown when title is too vague for good AI results ── */}
      {aiNeedsInfo && !showAiPanel && (
        <div className="rounded-xl border mb-5 overflow-hidden"
          style={{ borderColor: '#FDE68A', borderWidth: 1.5 }}>
          {/* Header */}
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ backgroundColor: '#FFFBEB' }}>
            <p className="text-[12px] font-black tracking-wide" style={{ color: '#92400E' }}>
              💡 Add a few details for a better AI result
            </p>
            <button onClick={() => { setAiNeedsInfo(null); setQuickCondition(''); setQuickCategory('') }}
              className="text-[16px] hover:opacity-60" style={{ color: '#92400E' }}>×</button>
          </div>

          {/* Message */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-[12px] leading-relaxed mb-3" style={{ color: '#78350F' }}>
              {aiNeedsInfo.message}
            </p>

            {/* Quick question 1 — Condition */}
            <div className="mb-3">
              <p className="text-[11px] font-bold mb-1.5" style={{ color: '#92400E' }}>
                What condition is the item?
              </p>
              <div className="flex gap-2 flex-wrap">
                {(['new', 'used', 'faulty'] as const).map(c => (
                  <button key={c} onClick={() => setQuickCondition(prev => prev === c ? '' : c)}
                    className="px-3 py-1.5 rounded-lg border text-[12px] font-bold transition-all"
                    style={{
                      backgroundColor: quickCondition === c ? '#92400E' : '#fff',
                      color: quickCondition === c ? '#fff' : '#92400E',
                      borderColor: '#FDE68A',
                    }}>
                    {c === 'new' ? '✨ New' : c === 'used' ? '👍 Used' : '🔧 For Parts'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick question 2 — Category (only if not already known) */}
            {!categoryName && (
              <div className="mb-3">
                <p className="text-[11px] font-bold mb-1.5" style={{ color: '#92400E' }}>
                  What category is this product?
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { val: 'Electronics', label: '📱 Electronics' },
                    { val: 'Clothing', label: '👕 Clothing' },
                    { val: 'Toys', label: '🧸 Toys' },
                    { val: 'Home Garden', label: '🏠 Home/Garden' },
                    { val: 'Auto Parts', label: '🚗 Auto' },
                    { val: 'Collectibles', label: '🏅 Collectibles' },
                    { val: 'Sport', label: '⚽ Sport' },
                    { val: 'Other', label: '📦 Other' },
                  ].map(({ val, label }) => (
                    <button key={val} onClick={() => setQuickCategory(prev => prev === val ? '' : val)}
                      className="px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all"
                      style={{
                        backgroundColor: quickCategory === val ? '#92400E' : '#fff',
                        color: quickCategory === val ? '#fff' : '#92400E',
                        borderColor: '#FDE68A',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Proceed button */}
          <div className="px-4 py-3 border-t" style={{ borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }}>
            <button
              onClick={() => runAIOptimize()}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all hover:opacity-80"
              style={{ backgroundColor: '#7C3AED', color: '#fff' }}>
              {aiLoading ? '⏳ Optimizing...' : '✨ Optimize Now'}
            </button>
            <p className="text-[10px] mt-1.5" style={{ color: '#9CA3AF' }}>
              You can also just add more words to your title and click Optimize again.
            </p>
          </div>
        </div>
      )}

      {/* ── AI Before / After comparison panel ── */}
      {showAiPanel && (
        <div className="rounded-xl border mb-5 overflow-hidden"
          style={{ borderColor: '#C4B5FD', borderWidth: 1.5 }}>
          <div className="px-4 py-2.5 flex items-center justify-between flex-wrap gap-2"
            style={{ backgroundColor: '#F5F3FF' }}>
            <p className="text-[12px] font-black tracking-wide" style={{ color: '#7C3AED' }}>
              ✨ AI SUGGESTION — Keep or Revert?
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Provider badge */}
              {aiProvider && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
                  {aiProvider === 'anthropic' ? '🤖 Claude'
                    : aiProvider === 'openai' ? '🟢 GPT-4o'
                      : aiProvider === 'gemini' ? '🔵 Gemini'
                        : aiProvider}
                </span>
              )}
              {/* Seller type badge — educates sellers about what the AI detected */}
              {aiSellerType && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#F3F4F6', color: '#374151' }}>
                  {aiSellerType === 'dropshipper' ? '📦 Supplier title rewritten'
                    : aiSellerType === 'domestic' ? '🏠 Casual listing reformatted'
                      : '⚡ Professional title optimised'}
                </span>
              )}
              <p className="text-[11px]" style={{ color: '#9CA3AF' }}>
                Credit only used if you Keep
              </p>
            </div>
          </div>
          <div className="px-4 py-3 border-b" style={{ borderColor: '#F3F4F6', backgroundColor: '#FAFAFA' }}>
            <p className="text-[10px] font-black tracking-widest mb-1.5" style={{ color: '#9CA3AF' }}>BEFORE</p>
            <p className="text-[14px] font-semibold leading-snug" style={{ color: '#6B7280' }}>{aiOriginal}</p>
          </div>
          <div className="px-4 py-3" style={{ backgroundColor: '#fff' }}>
            <p className="text-[10px] font-black tracking-widest mb-1.5" style={{ color: '#7C3AED' }}>AFTER</p>
            <p className="text-[14px] font-semibold leading-snug" style={{ color: '#0F172A' }}>{aiSuggestion}</p>
          </div>
          <div className="flex gap-2 px-4 py-3 border-t" style={{ borderColor: '#F3F4F6', backgroundColor: '#FAFAFA' }}>
            <button onClick={handleKeep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold transition-all hover:opacity-80"
              style={{ backgroundColor: '#7C3AED', color: '#fff' }}>
              <CheckCircle size={14} /> Keep this
            </button>
            <button onClick={handleRevert}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[13px] font-bold transition-all hover:opacity-80"
              style={{ color: '#6B7280', backgroundColor: '#fff', borderColor: '#E5E7EB' }}>
              <RotateCcw size={14} /> Revert
            </button>
          </div>
        </div>
      )}

      {/* Fix 13 upgrade: Spin preview panel with diff highlighting */}
      {showSpinPanel && (
        <div className="rounded-xl border mb-5 overflow-hidden"
          style={{ borderColor: '#6EE7B7', borderWidth: 1.5 }}>
          {/* Header */}
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ backgroundColor: '#F0FDFA' }}>
            <p className="text-[12px] font-black tracking-wide" style={{ color: '#0F766E' }}>
              🔄 SPIN PREVIEW — {spinMode.replace('_', ' ')}
            </p>
            <p className="text-[11px]" style={{ color: '#9CA3AF' }}>Each spin is a fresh variation</p>
          </div>
          {/* Original */}
          <div className="px-4 py-3 border-b" style={{ borderColor: '#F3F4F6', backgroundColor: '#FAFAFA' }}>
            <p className="text-[10px] font-black tracking-widest mb-1.5" style={{ color: '#9CA3AF' }}>ORIGINAL</p>
            <p className="text-[14px] font-semibold leading-snug" style={{ color: '#6B7280' }}>{spinOriginal}</p>
          </div>

          {/* Spin history — last 3 previous results with correct diff, click to restore */}
          {spinHistory.length > 0 && (
            <div className="px-4 py-2.5 border-b" style={{ borderColor: '#F3F4F6', backgroundColor: '#F8FFFE' }}>
              <p className="text-[10px] font-black tracking-widest mb-2" style={{ color: '#9CA3AF' }}>
                PREVIOUS SPINS — click to restore
              </p>
              <div className="flex flex-col gap-1.5">
                {spinHistory.map((entry, i) => (
                  <button key={i} onClick={() => {
                    // Swap current into history at this position, restore the clicked entry
                    setSpinHistory(h => {
                      const next = [...h]
                      next[i] = { title: spinSuggestion!, diff: spinDiff }
                      return next
                    })
                    setSpinSuggestion(entry.title)
                    setSpinDiff(entry.diff) // restores correct diff — no more blank highlighting
                    setSpinCopied(false)
                  }}
                    className="text-left px-3 py-2 rounded-lg border text-[13px] font-semibold transition-all hover:opacity-80"
                    style={{ color: '#374151', backgroundColor: '#fff', borderColor: '#D1FAE5' }}>
                    <span className="text-[10px] font-black mr-2" style={{ color: '#9CA3AF' }}>
                      #{spinHistory.length - i}
                    </span>
                    {entry.title}
                    <span className="ml-2 text-[10px]" style={{ color: '#9CA3AF' }}>{entry.title.length}/80</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Spin result with diff highlighting */}
          <div className="px-4 py-3" style={{ backgroundColor: '#fff' }}>
            {/* Label row — SPIN + char count + diff legend */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <p className="text-[10px] font-black tracking-widest" style={{ color: '#0F766E' }}>SPIN</p>
              {/* Char count on the result — seller can see at a glance if it's within limit */}
              {spinSuggestion && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: spinSuggestion.length > 80 ? '#FEE2E2' : '#DCFCE7',
                    color: spinSuggestion.length > 80 ? '#991B1B' : '#15803D',
                  }}>
                  {spinSuggestion.length}/80
                  {spinSuggestion.length > 80 && ` ⚠ ${spinSuggestion.length - 80} over`}
                </span>
              )}
              <div className="flex items-center gap-2 text-[10px]" style={{ color: '#9CA3AF' }}>
                <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>+ added</span>
                <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: '#FEF9C3', color: '#854D0E' }}>~ swapped</span>
                <span className="line-through px-1.5 py-0.5 rounded" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>removed</span>
              </div>
            </div>
            {/* Spin text + copy icon pinned to far right of the same line */}
            <div className="flex items-start gap-2">
              <p className="flex-1 text-[14px] font-semibold leading-snug flex flex-wrap gap-x-1">
                {spinDiff.filter(t => t.type !== 'removed').map((token, i) => {
                  const style: React.CSSProperties =
                    token.type === 'added' ? { backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: 4, padding: '0 3px' } :
                      token.type === 'swapped' ? { backgroundColor: '#FEF9C3', color: '#854D0E', borderRadius: 4, padding: '0 3px' } :
                        { color: '#0F172A' }
                  return <span key={i} style={style}>{token.text}</span>
                })}
                {spinDiff.filter(t => t.type === 'removed').map((token, i) => (
                  <span key={`r${i}`} style={{ textDecoration: 'line-through', color: '#9CA3AF', fontSize: 12 }}>{token.text}</span>
                ))}
              </p>
              {/* Copy button — far right of the spin text line */}
              <button
                onClick={() => {
                  if (spinSuggestion) {
                    navigator.clipboard.writeText(spinSuggestion)
                    setSpinCopied(true)
                    setTimeout(() => setSpinCopied(false), 1500)
                  }
                }}
                title="Copy spin result"
                className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded hover:opacity-70 transition-all"
                style={{
                  backgroundColor: spinCopied ? '#DCFCE7' : '#F0FDFA',
                  border: `1px solid ${spinCopied ? '#6EE7B7' : '#A7F3D0'}`,
                }}>
                {spinCopied
                  ? <><CheckCircle size={11} style={{ color: '#15803D' }} /><span className="text-[10px] font-bold" style={{ color: '#15803D' }}>Copied!</span></>
                  : <><Copy size={11} style={{ color: '#0F766E' }} /><span className="text-[10px] font-bold" style={{ color: '#0F766E' }}>Copy</span></>
                }
              </button>
            </div>
          </div>
          {/* Buttons */}
          <div className="flex gap-2 px-4 py-3 border-t flex-wrap" style={{ borderColor: '#F3F4F6', backgroundColor: '#FAFAFA' }}>
            <button onClick={handleSpinKeep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold hover:opacity-80"
              style={{ backgroundColor: '#0F766E', color: '#fff' }}>
              <CheckCircle size={14} /> Keep this
            </button>
            <button onClick={handleSpinAgain}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[13px] font-bold hover:opacity-80"
              style={{ color: '#0F766E', backgroundColor: '#F0FDFA', borderColor: '#6EE7B7' }}>
              <RotateCcw size={14} /> Try Again
            </button>
            <button onClick={handleSpinRevert}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[13px] font-bold hover:opacity-80"
              style={{ color: '#6B7280', backgroundColor: '#fff', borderColor: '#E5E7EB' }}>
              Revert
            </button>
          </div>
        </div>
      )}

      {/* Alerts row */}
      <div className="flex items-start gap-2 flex-wrap mb-4">
        <p className="text-[13px] font-bold mt-1" style={{ color: C.muted }}>Alerts:</p>
        <PillBadge
          text={`${duplicateCount} Duplicate${duplicateCount !== 1 ? 's' : ''}`}
          textColor={duplicateCount > 0 ? '#C2410C' : '#4B5563'}
          bgColor={duplicateCount > 0 ? '#FFF7ED' : '#F3F4F6'}
        />
        {flaggedVero.length === 0 ? (
          <PillBadge text="0 VeRO Risks" textColor="#15803D" bgColor="#F0FDF4" />
        ) : (
          flaggedVero.map((flag, i) => {
            const color = RISK_COLOR[flag.risk_level] ?? RISK_COLOR['High Risk']
            const label = flag.risk_level === 'Critical Ban' ? '🔴' : flag.risk_level === 'High Risk' ? '🟠' : '🟡'
            return (
              <div key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full border text-[12px] font-bold"
                style={{ color: color.text, backgroundColor: color.bg, borderColor: color.border }}>
                {label} {flag.name}
                {flag.evidence_url && (
                  <a href={flag.evidence_url} target="_blank" rel="noopener noreferrer"
                    className="ml-1 underline text-[11px] opacity-70 hover:opacity-100">
                    Why?
                  </a>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Strength meter + character counter */}
      <div className="flex items-center gap-2 mb-6">
        <p className="text-[13px] font-bold shrink-0" style={{ color: C.muted }}>Strength:</p>
        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%`, backgroundColor: strengthColor }} />
        </div>
        {charCount > 80 ? (
          <p className="text-[13px] font-bold shrink-0 whitespace-nowrap" style={{ color: '#EF4444' }}>
            ⚠ {charCount - 80} over limit
          </p>
        ) : (
          <p className="text-[13px] font-bold shrink-0 whitespace-nowrap" style={{ color: strengthColor }}>
            {charCount}/80
          </p>
        )}
      </div>

      {/* Spin mode selector — compact pills + always-visible one-line explainer */}
      <div className="mb-3">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <p className="text-[12px] font-bold shrink-0" style={{ color: C.muted }}>Spin Mode:</p>
          {([
            { mode: 'DUPLICATE_SAFE', label: 'Duplicate Safe' },
            { mode: 'AB_TEST', label: 'A/B Test' },
            { mode: 'FILL_TO_80', label: 'Fill to 80' },
            { mode: 'CLEAN_TIGHTEN', label: 'Clean & Tighten' },
          ] as const).map(({ mode, label }) => (
            <button key={mode} onClick={() => { setSpinMode(mode); setSpinNoChange(null) }}
              className="px-3 py-1 rounded-full text-[11px] font-bold border transition-all"
              style={{
                backgroundColor: spinMode === mode ? '#0F766E' : '#F0FDFA',
                color: spinMode === mode ? '#fff' : '#0F766E',
                borderColor: spinMode === mode ? '#0F766E' : '#6EE7B7',
              }}>
              {label}
            </button>
          ))}
        </div>
        {/* One-line explainer — updates instantly when mode changes */}
        <p className="text-[11px] leading-snug" style={{ color: '#6B7280' }}>
          💡 {SPIN_MODE_DESC[spinMode]}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <p className="text-[13px] font-bold" style={{ color: C.muted }}>Actions:</p>
        <ActionBtn
          text={aiLoading ? '⏳ Optimizing...' : aiAtLimit ? '✨ AI Optimize (Limit Reached)' : '✨ AI Optimize'}
          textColor={aiAtLimit ? '#9CA3AF' : '#7C3AED'}
          bgColor={aiAtLimit ? '#F3F4F6' : '#F5F3FF'}
          onTap={runAIOptimize}
        />
        <ActionBtn text="🧹 Clean" textColor="#1D4ED8" bgColor="#EFF6FF" onTap={cleanTitle} />
        <ActionBtn text="🔄 Spin" textColor="#0F766E" bgColor="#F0FDFA" onTap={spinTitle} />
      </div>

      {/* Clean change log — shows what the engine did after a successful clean */}
      {cleanLog.length > 0 && (
        <div className="mt-3 px-3 py-2.5 rounded-xl border"
          style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[12px] font-bold" style={{ color: '#1D4ED8' }}>
              🧹 Cleaned — here's what changed
            </p>
            <button onClick={() => setCleanLog([])}
              className="text-[16px] leading-none hover:opacity-60"
              style={{ color: '#1D4ED8' }}>×</button>
          </div>
          <div className="flex flex-col gap-1">
            {cleanLog.map((entry, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] font-black mt-0.5 shrink-0"
                  style={{
                    color: entry.type === 'removed' ? '#DC2626'
                      : entry.type === 'deduped' ? '#D97706'
                        : entry.type === 'trimmed' ? '#7C3AED'
                          : '#1D4ED8',
                  }}>
                  {entry.type === 'removed' ? '✕' : entry.type === 'deduped' ? '⊘' : entry.type === 'trimmed' ? '↔' : '✓'}
                </span>
                <div>
                  <span className="text-[11px] font-bold" style={{ color: '#1E40AF' }}>{entry.label}: </span>
                  <span className="text-[11px]" style={{ color: '#374151' }}>{entry.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clean no-change message */}
      {cleanNoChange && (
        <div className="flex items-start gap-2.5 mt-3 px-3 py-2.5 rounded-xl border"
          style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}>
          <span className="text-[15px] shrink-0 mt-0.5">✨</span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold mb-0.5" style={{ color: '#1D4ED8' }}>
              Your title is already clean
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: '#1E40AF' }}>
              No policy words, no duplicates, casing looks correct. Nothing to fix.
            </p>
          </div>
          <button onClick={() => setCleanNoChange(false)}
            className="shrink-0 text-[16px] leading-none hover:opacity-60 mt-0.5"
            style={{ color: '#1D4ED8' }}>×</button>
        </div>
      )}

      {/* Spin no-change feedback */}
      {spinNoChange && (
        <div className="flex items-start gap-2.5 mt-3 px-3 py-2.5 rounded-xl border"
          style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
          <span className="text-[15px] shrink-0 mt-0.5">💡</span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold mb-0.5" style={{ color: '#92400E' }}>
              Nothing changed in {spinMode.replace(/_/g, ' ')} mode
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: '#78350F' }}>
              {spinNoChange}
            </p>
          </div>
          <button onClick={() => setSpinNoChange(null)}
            className="shrink-0 text-[16px] leading-none hover:opacity-60 mt-0.5"
            style={{ color: '#92400E' }}>×</button>
        </div>
      )}
      {aiError && (
        <p className="text-[12px] font-semibold mt-2" style={{ color: '#DC2626' }}>{aiError}</p>
      )}

    </div>
  )
}
