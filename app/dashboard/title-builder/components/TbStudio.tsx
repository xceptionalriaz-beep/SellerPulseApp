'use client'
// app/dashboard/title-builder/components/TbStudio.tsx
// Converted 1:1 from lib/pages/title_builder/tb_studio.dart

import { useState, useEffect } from 'react'
import { Copy, CheckCircle, RotateCcw, Sparkles, Wand2, Lightbulb, AlertCircle, AlertTriangle, Info, Scissors, XCircle, MinusCircle, ArrowLeftRight } from 'lucide-react'
import { TitleCleanerEngine } from './engines/titleCleanerEngine'
import { TitleSpinnerEngine, SpinMode, DiffToken } from './engines/titleSpinnerEngine'
import { AIButton, SecondaryButton, GhostButton, PillButton, PrimaryButton } from '@/components/ui/Buttons'

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
  categoryName?: string
  activeLocation?: string
  recentTitles?: string[]
  onRestoreTitle?: (t: string) => void
}
export default function TbStudio({
  value, onChange, charCount, flaggedVero, duplicateCount, onCopy,
  keywordContext = [], aiOptimizeLimit, aiOptimizeUsed, onAiOptimizeUsed,
  categoryName = '', activeLocation = 'US',
  recentTitles = [], onRestoreTitle,
}: Props) {
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [isCutting, setIsCutting] = useState(false)
  const [isTryAgain, setIsTryAgain] = useState(false)
  const [showSpinMode, setShowSpinMode] = useState(false)

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

  // Spin — upgraded: uses selected mode + category awareness + stores diff
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

  // ── Design constants (brand colours) ────────────────────────
  const DC = {
    lime: '#7530fb',
    dark: '#1e1535',
    border: '#ede9fe',
    muted: '#9ca3af',
    surface: '#ffffff',
    bg: '#f8f7ff',
    text: '#1e1535',
    red: '#b91c1c',
    amber: '#d97706',
    green: '#16a34a',
    blue: '#1d4ed8',
  }

  return (
    <div className="flex flex-col gap-3" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── LIVE TITLE WORKSPACE CARD ── */}
      <div className="rounded-xl border p-4" style={{ backgroundColor: '#ffffff', borderColor: C.border }}>

        {/* Card header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#16a34a' }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#1e1535' }}>
              Live Title Workspace
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* VeRO badge */}
            {flaggedVero.length === 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border"
                style={{ color: '#16a34a', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                VeRO: SECURE
              </span>
            ) : (
              flaggedVero.map((flag, i) => {
                const col = RISK_COLOR[flag.risk_level] ?? RISK_COLOR['High Risk']
                return (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded border"
                    style={{ color: col.text, backgroundColor: col.bg, borderColor: col.border }}>
                    {flag.name}
                    {flag.evidence_url && (
                      <a href={flag.evidence_url} target="_blank" rel="noopener noreferrer"
                        className="ml-1 underline opacity-70 hover:opacity-100">Why?</a>
                    )}
                  </span>
                )
              })
            )}
            {/* Duplicate badge */}
            {duplicateCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border"
                style={{ color: '#d97706', backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                {duplicateCount} Duplicate{duplicateCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Title input — single line */}
        <div className="rounded-lg border mb-1 relative"
          style={{ borderColor: '#1e1535', backgroundColor: '#f8f7ff' }}>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            maxLength={80}
            placeholder="Start typing or paste a competitor ID to extract a title..."
            className="w-full bg-transparent p-3 pr-10 text-[15px] font-medium"
            style={{ color: '#1f1d2e', fontFamily: 'Inter, sans-serif', outline: 'none' }}
          />
          {/* Copy icon */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(value)
              onCopy?.()
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
            title="Copy title"
            className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-lg transition-all hover:opacity-70"
            style={{
              backgroundColor: copied ? '#f3eeff' : '#f8f7ff',
              border: `1px solid ${C.border}`,
            }}>
            {copied
              ? <CheckCircle size={13} style={{ color: '#16a34a' }} />
              : <Copy size={13} style={{ color: '#7530fb' }} />
            }
          </button>
        </div>

        {/* Char progress bar */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((charCount / 80) * 100, 100)}%`,
                backgroundColor: charCount > 80 ? '#ef4444' : charCount >= 65 ? '#16a34a' : '#d97706',
              }} />
          </div>
          <span className="text-[12px] font-bold shrink-0" style={{
            fontFamily: 'Inter, sans-serif',
            color: charCount > 80 ? '#ef4444' : charCount >= 65 ? '#16a34a' : '#d97706'
          }}>
            {charCount > 80 ? `⚠ ${charCount - 80} over limit` : `${charCount}/80 Chars`}
          </span>
        </div>

        {/* ── RECENT TITLES ── */}
        {recentTitles.length > 0 && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-[10px] font-black tracking-widest uppercase shrink-0" style={{ color: C.muted }}>
              Recent:
            </span>
            {recentTitles.map((t, i) => (
              <button key={i}
                onClick={() => onRestoreTitle?.(t)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full transition-opacity hover:opacity-70 truncate max-w-[200px]"
                style={{ backgroundColor: '#f8f7ff', color: C.muted, border: `1px solid ${C.border}` }}
                title={t}>
                {t.slice(0, 30)}{t.length > 30 ? '…' : ''}
              </button>
            ))}
          </div>
        )}

        {/* ── SPIN RESULT — inline ── */}
        {showSpinPanel && spinSuggestion && (
          <div className="mb-3 rounded-lg border overflow-hidden" style={{ borderColor: C.border }}>
            <div className="px-3 py-2.5" style={{ backgroundColor: '#ffffff' }}>
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: spinSuggestion.length > 80 ? '#fee2e2' : '#f3eeff',
                    color: spinSuggestion.length > 80 ? '#ef4444' : '#16a34a',
                  }}>
                  {spinSuggestion.length}/80{spinSuggestion.length > 80 ? ' ⚠ over' : ''}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f3eeff', color: '#16a34a' }}>+ added</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>~ swapped</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <button onClick={handleSpinKeep}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: '#b8fa33', color: '#1e1535', border: 'none' }}>
                    <CheckCircle size={10} /> Keep
                  </button>
                  <button onClick={() => { setIsTryAgain(true); setTimeout(() => setIsTryAgain(false), 600); handleSpinAgain() }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ backgroundColor: '#f3eeff', color: '#0ea5e9', border: '1px solid #ddd6fe' }}>
                    <RotateCcw size={10} style={{
                      transition: isTryAgain ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
                      transform: isTryAgain ? 'rotate(-360deg)' : 'rotate(0deg)',
                    }} /> Try Again
                  </button>
                  <button onClick={handleSpinRevert}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ backgroundColor: '#ffffff', color: C.muted, border: `1px solid ${C.border}` }}>
                    Revert
                  </button>
                </div>
              </div>
              {/* Text row with copy at end */}
              <div className="flex items-start gap-2">
                <p className="flex-1 text-[13px] font-semibold leading-relaxed flex flex-wrap gap-x-1">
                  {spinDiff.filter(t => t.type !== 'removed').map((token, i) => {
                    const s: React.CSSProperties =
                      token.type === 'added' ? { backgroundColor: '#f3eeff', color: '#16a34a', borderRadius: 4, padding: '0 3px' } :
                        token.type === 'swapped' ? { backgroundColor: '#fffbeb', color: '#d97706', borderRadius: 4, padding: '0 3px' } :
                          { color: '#1e1535' }
                    return <span key={i} style={s}>{token.text}</span>
                  })}
                  {spinDiff.filter(t => t.type === 'removed').map((token, i) => (
                    <span key={`r${i}`} style={{ textDecoration: 'line-through', color: C.muted, fontSize: 11 }}>{token.text}</span>
                  ))}
                </p>
                <button
                  onClick={() => { if (spinSuggestion) { navigator.clipboard.writeText(spinSuggestion); setSpinCopied(true); setTimeout(() => setSpinCopied(false), 1500) } }}
                  className="shrink-0 p-1 rounded-lg transition-all hover:opacity-70"
                  style={{ backgroundColor: spinCopied ? '#f3eeff' : '#f8f7ff', border: `1px solid ${C.border}` }}>
                  {spinCopied
                    ? <CheckCircle size={11} style={{ color: '#16a34a' }} />
                    : <Copy size={11} style={{ color: '#7530fb' }} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Spin no-change message */}
        {spinNoChange && (
          <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-lg border"
            style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
            <Lightbulb size={12} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
            <p className="text-[11px]" style={{ color: '#78350f' }}>{spinNoChange}</p>
          </div>
        )}

        {/* ── ACTIONS ROW — Spin Mode pills slide in when Spin clicked ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold shrink-0" style={{ color: C.muted }}>Actions:</span>
          <AIButton onClick={runAIOptimize} disabled={aiAtLimit} loading={aiLoading}>
            {aiAtLimit ? 'AI Optimize (Limit)' : 'AI Optimize'}
          </AIButton>
          <SecondaryButton onClick={() => { setIsCutting(true); setTimeout(() => setIsCutting(false), 400); cleanTitle() }}
            icon={<Scissors size={13} style={{ transition: 'transform 0.2s', transform: isCutting ? 'rotate(-20deg) scale(0.8)' : 'rotate(0deg) scale(1)' }} />}>
            Clean
          </SecondaryButton>
          <SecondaryButton
            onClick={() => {
              setIsSpinning(true)
              setTimeout(() => setIsSpinning(false), 600)
              spinTitle()
            }}
            icon={<RotateCcw size={13} style={{
              transition: isSpinning ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
              transform: isSpinning ? 'rotate(-360deg)' : 'rotate(0deg)',
            }} />}>
            Spin
          </SecondaryButton>

          {/* Vertical divider */}
          <div style={{ width: 1, height: 24, backgroundColor: C.border, flexShrink: 0 }} />

          {/* Mode pills — always visible */}
          <div className="flex gap-1.5 flex-wrap">
            {([
              { mode: 'DUPLICATE_SAFE', label: 'Duplicate Safe' },
              { mode: 'AB_TEST', label: 'A/B Test' },
              { mode: 'FILL_TO_80', label: 'Fill to 80' },
              { mode: 'CLEAN_TIGHTEN', label: 'Clean & Tighten' },
            ] as const).map(({ mode, label }) => (
              <PillButton key={mode} active={spinMode === mode}
                onClick={() => { setSpinMode(mode); setSpinNoChange(null) }}>
                {label}
              </PillButton>
            ))}
          </div>
        </div>

        {/* Mode description */}
        <p className="text-[11px] mt-1.5 flex items-start gap-1.5" style={{ color: C.muted }}>
          <Lightbulb size={12} style={{ color: '#d97706', flexShrink: 0 }} />
          <span>{SPIN_MODE_DESC[spinMode]}</span>
        </p>

        {/* ── CLEAN RESULT — inline ── */}
        {cleanLog.length > 0 && (
          <div className="mt-2 rounded-lg border px-3 py-2.5"
            style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: '#0ea5e9' }}>
                <Scissors size={12} /> Cleaned
              </span>
              <button onClick={() => setCleanLog([])}
                className="text-[14px] hover:opacity-60" style={{ color: '#0ea5e9' }}>×</button>
            </div>
            {cleanLog.map((e, i) => (
              <div key={i} className="flex items-center gap-1.5 mb-1">
                <span style={{ color: e.type === 'removed' ? '#ef4444' : e.type === 'deduped' ? '#d97706' : e.type === 'trimmed' ? '#7c3aed' : '#0ea5e9' }}>
                  {e.type === 'removed' ? <XCircle size={11} /> : e.type === 'deduped' ? <MinusCircle size={11} /> : e.type === 'trimmed' ? <ArrowLeftRight size={11} /> : <CheckCircle size={11} />}
                </span>
                <span className="text-[11px]" style={{ color: '#1e1535' }}>
                  <strong>{e.label}:</strong> {e.detail}
                </span>
              </div>
            ))}
          </div>
        )}
        {cleanNoChange && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ backgroundColor: '#f3eeff', borderColor: C.border }}>
            <CheckCircle size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
            <p className="flex-1 text-[11px] font-medium" style={{ color: '#1e1535' }}>
              Already clean — no issues found
            </p>
            <button onClick={() => setCleanNoChange(false)}
              className="text-[14px] hover:opacity-60" style={{ color: C.muted }}>×</button>
          </div>
        )}

      </div>

      {aiNeedsInfo && !showAiPanel && (
        <div className="rounded-xl border overflow-hidden"
          style={{ borderColor: '#fde68a' }}>
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ backgroundColor: '#fffbeb' }}>
            <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: '#92400e' }}>
              <Info size={13} /> Add a few details for a better AI result
            </span>
            <button onClick={() => { setAiNeedsInfo(null); setQuickCondition(''); setQuickCategory('') }}
              className="text-[16px] hover:opacity-60" style={{ color: '#92400e' }}>×</button>
          </div>
          <div className="px-4 py-3">
            <p className="text-[12px] mb-3" style={{ color: '#78350f' }}>{aiNeedsInfo?.message}</p>
            <p className="text-[11px] font-bold mb-1.5" style={{ color: '#92400e' }}>What condition is the item?</p>
            <div className="flex gap-2 flex-wrap mb-3">
              {(['new', 'used', 'faulty'] as const).map(c => (
                <button key={c} onClick={() => setQuickCondition(prev => prev === c ? '' : c)}
                  className="px-3 py-1.5 rounded-lg border text-[12px] font-bold transition-all"
                  style={{
                    backgroundColor: quickCondition === c ? '#92400e' : '#ffffff',
                    color: quickCondition === c ? '#fff' : '#92400e',
                    borderColor: '#fde68a',
                  }}>
                  {c === 'new' ? 'New' : c === 'used' ? 'Used' : 'For Parts'}
                </button>
              ))}
            </div>
            {!categoryName && (
              <>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: '#92400e' }}>Category?</p>
                <div className="flex gap-2 flex-wrap mb-3">
                  {['Electronics', 'Clothing', 'Toys', 'Home Garden', 'Auto Parts', 'Collectibles', 'Sport', 'Other'].map(val => (
                    <button key={val} onClick={() => setQuickCategory(prev => prev === val ? '' : val)}
                      className="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all"
                      style={{
                        backgroundColor: quickCategory === val ? '#92400e' : '#ffffff',
                        color: quickCategory === val ? '#fff' : '#92400e',
                        borderColor: '#fde68a',
                      }}>
                      {val}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="px-4 py-3 border-t" style={{ borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
            <button onClick={() => runAIOptimize()} disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: '#b8fa33', color: '#1e1535' }}>
              {aiLoading ? 'Optimizing...' : 'Optimize Now'}
            </button>
          </div>
        </div>
      )}

      {/* ── AI BEFORE / AFTER PANEL ── */}
      {showAiPanel && (
        <div className="rounded-xl border overflow-hidden"
          style={{ borderColor: '#ede9fe' }}>
          <div className="px-4 py-2.5 flex items-center justify-between flex-wrap gap-2"
            style={{ backgroundColor: '#f3eeff' }}>
            <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: '#1e1535' }}>
              <Sparkles size={13} style={{ color: '#b8fa33' }} /> AI SUGGESTION
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {aiProvider && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ backgroundColor: '#ffffff', borderColor: C.border, color: C.muted }}>
                  {aiProvider === 'anthropic' ? 'Claude' : aiProvider === 'openai' ? 'GPT-4o' : 'Gemini'}
                </span>
              )}
              {aiSellerType && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ backgroundColor: '#ffffff', borderColor: C.border, color: C.muted }}>
                  {aiSellerType === 'dropshipper' ? 'Supplier rewrite'
                    : aiSellerType === 'domestic' ? 'Casual reformatted'
                      : 'Professional optimised'}
                </span>
              )}
              <span className="text-[10px]" style={{ color: C.muted }}>Credit used on Keep</span>
            </div>
          </div>
          <div className="px-4 py-3 border-b" style={{ borderColor: C.border, backgroundColor: '#f8f7ff' }}>
            <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: C.muted }}>BEFORE</p>
            <p className="text-[13px] font-medium leading-snug" style={{ color: C.muted }}>{aiOriginal}</p>
          </div>
          <div className="px-4 py-3" style={{ backgroundColor: '#ffffff' }}>
            <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: '#1e1535' }}>AFTER</p>
            <p className="text-[14px] font-semibold leading-snug" style={{ color: '#1e1535' }}>{aiSuggestion}</p>
          </div>
          <div className="flex gap-2 px-4 py-3 border-t" style={{ borderColor: C.border, backgroundColor: '#f8f7ff' }}>
            <button onClick={handleKeep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: '#b8fa33', color: '#1e1535' }}>
              <CheckCircle size={13} /> Keep this
            </button>
            <button onClick={handleRevert}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[12px] font-medium transition-all hover:opacity-80"
              style={{ color: C.muted, backgroundColor: '#ffffff', borderColor: C.border }}>
              <RotateCcw size={13} /> Revert
            </button>
          </div>
        </div>
      )}

      {aiError && (
        <p className="text-[12px] font-semibold px-1" style={{ color: '#ef4444' }}>{aiError}</p>
      )}

    </div>
  )
}
