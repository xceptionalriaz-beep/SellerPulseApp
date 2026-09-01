'use client'

// app/onboarding/page.tsx
// ══════════════════════════════════════════════════════════════
// Riazify Post-Signup Onboarding Flow
// Slide 1: Welcome + Account verification confirmation
// Slide 2: Acquisition channel attribution
// Slide 3: Seller objective mapping
// Slide 4: Provisioning & Trial initialization
// ══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Activity, CheckCircle2, ChevronRight, ChevronLeft,
  ShieldCheck, Calculator, Type, BarChart2,
  Search, Youtube, Users, MessageCircle, Globe,
  Target, TrendingUp, DollarSign, LayoutDashboard,
  Sparkles, Check
} from 'lucide-react'

// -- Riazify Color Role Tokens (v2.0) ---------------------------
const C = {
  primary: '#7530fb',
  primaryHover: '#6020e0',
  primaryLight: '#f3eeff',
  accent: '#b8fa33',
  accentHover: '#a3e635',
  dark: '#1e1535',
  darkHover: '#2d1f4e',
  darkCard: '#271c42',
  border: '#ede9fe',
  borderDark: '#2d1f4e',
  borderInput: '#e5e0f5',
  bg: '#f8f7ff',
  surface: '#ffffff',
  text: '#1f1d2e',
  textDark: '#1e1535',
  muted: '#6b7280',
  textLight: '#a89cc8',
}

// ── Slide types ────────────────────────────────────────────────
type Slide = 'welcome' | 'source' | 'goal' | 'done'
const SLIDES: Slide[] = ['welcome', 'source', 'goal', 'done']

const SOURCES = [
  { id: 'google', label: 'Google Search', icon: Search },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'social', label: 'Facebook / Instagram', icon: Globe },
  { id: 'friend', label: 'Friend / Referral', icon: Users },
  { id: 'ebay', label: 'eBay Community', icon: MessageCircle },
  { id: 'other', label: 'Other', icon: Sparkles },
]

const GOALS = [
  { id: 'protect', label: 'Protect orders from risky buyers', icon: ShieldCheck },
  { id: 'research', label: 'Research profitable products', icon: Search },
  { id: 'titles', label: 'Build Cassini-optimized titles', icon: Type },
  { id: 'profit', label: 'Track profit & analytics', icon: DollarSign },
  { id: 'scale', label: 'Scale eBay business velocity', icon: TrendingUp },
  { id: 'all', label: 'All of the above!', icon: Target },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [slide, setSlide] = useState<Slide>('welcome')
  const [source, setSource] = useState<string | null>(null)
  const [goals, setGoals] = useState<string[]>([])
  const [userName, setUserName] = useState('there')
  const [saving, setSaving] = useState(false)
  const [animating, setAnimating] = useState(false)

  const slideIndex = SLIDES.indexOf(slide)

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'there'
          setUserName(name.split(' ')[0])
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadUser()
  }, [])

  function goNext() {
    if (animating || slideIndex >= SLIDES.length - 1) return
    setAnimating(true)
    setTimeout(() => {
      setSlide(SLIDES[slideIndex + 1])
      setAnimating(false)
    }, 180)
  }

  function goBack() {
    if (animating || slideIndex === 0) return
    setAnimating(true)
    setTimeout(() => {
      setSlide(SLIDES[slideIndex - 1])
      setAnimating(false)
    }, 180)
  }

  function toggleGoal(id: string) {
    if (id === 'all') {
      if (goals.length === GOALS.length) {
        setGoals([])
      } else {
        setGoals(GOALS.map(g => g.id))
      }
      return
    }

    setGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  async function handleFinish() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await (supabase.from('profiles') as any).update({
          onboarding_completed: true,
          onboarding_source: source,
          onboarding_goals: goals,
          updated_at: new Date().toISOString(),
        }).eq('id', user.id)

        await (supabase.from('user_events') as any).insert({
          user_id: user.id,
          event_type: 'onboarding_completed',
          event_title: 'Onboarding Completed',
          event_desc: `Source: ${source ?? 'unknown'} · Goals: ${goals.join(', ')}`,
          created_at: new Date().toISOString(),
        })
      }
    } catch {
      // Non-blocking catch
    } finally {
      setSaving(false)
      router.push('/dashboard')
    }
  }

  // ── Progress Bar ───────────────────────────────────────────
  function ProgressBar() {
    return (
      <div className="flex items-center gap-2 mb-8">
        {SLIDES.map((s, i) => (
          <div
            key={s}
            className="flex-1 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= slideIndex ? C.primary : C.border,
            }}
          />
        ))}
      </div>
    )
  }

  // ── Slide 1: Welcome ───────────────────────────────────────
  function SlideWelcome() {
    return (
      <div className="flex flex-col items-center text-center gap-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          style={{ backgroundColor: C.primary }}
        >
          <Activity size={40} style={{ color: C.accent }} />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-3"
            style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
            <CheckCircle2 size={14} style={{ color: C.primary }} />
            <span className="text-[12px] font-extrabold tracking-tight" style={{ color: C.primary }}>
              Email Verified Successfully
            </span>
          </div>

          <h1 className="text-[28px] sm:text-[32px] font-black font-syne mb-2 tracking-tight" style={{ color: C.textDark }}>
            Welcome to Riazify, {userName}!
          </h1>
          <p className="text-[14px] sm:text-[15px] max-w-md mx-auto leading-relaxed" style={{ color: C.muted }}>
            You are now part of the premier eBay operator community. Let’s personalize your workspace in under 60 seconds.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {[
            { icon: ShieldCheck, label: 'Order Protection' },
            { icon: Calculator, label: 'Profit Calculator' },
            { icon: Type, label: 'AI Title Builder' },
            { icon: BarChart2, label: 'Analytics Dashboard' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border transition-all"
              style={{ borderColor: C.border, backgroundColor: C.bg }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                style={{ backgroundColor: C.primaryLight, borderColor: C.border }}
              >
                <Icon size={16} style={{ color: C.primary }} />
              </div>
              <span className="text-[12px] font-bold text-left" style={{ color: C.textDark }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={goNext}
          className="w-full max-w-md py-4 rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer"
          style={{ backgroundColor: C.accent, color: C.dark }}
        >
          <span>Let&apos;s get started</span>
          <ChevronRight size={18} className="stroke-[2.5]" />
        </button>
      </div>
    )
  }

  // ── Slide 2: Source ────────────────────────────────────────
  function SlideSource() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider mb-1 font-syne" style={{ color: C.primary }}>
            QUESTION 1 OF 2
          </p>
          <h2 className="text-[24px] sm:text-[28px] font-black font-syne" style={{ color: C.textDark }}>
            How did you hear about Riazify?
          </h2>
          <p className="text-[14px] mt-1" style={{ color: C.muted }}>
            Helps us understand how scaling sellers discover our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOURCES.map(({ id, label, icon: Icon }) => {
            const isSelected = source === id
            return (
              <button
                key={id}
                onClick={() => setSource(id)}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
                style={{
                  borderColor: isSelected ? C.primary : C.border,
                  backgroundColor: isSelected ? C.primaryLight : C.surface,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors"
                  style={{
                    backgroundColor: isSelected ? C.primary : C.bg,
                    borderColor: isSelected ? C.primary : C.border,
                  }}
                >
                  <Icon size={18} style={{ color: isSelected ? '#ffffff' : C.primary }} />
                </div>
                <span className="text-[13px] font-bold" style={{ color: isSelected ? C.primary : C.textDark }}>
                  {label}
                </span>
                {isSelected && (
                  <div className="ml-auto w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: C.primary }}>
                    <Check size={14} style={{ color: '#ffffff' }} className="stroke-[3]" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border text-[13px] font-bold transition-all hover:bg-[#f8f7ff] cursor-pointer"
            style={{ borderColor: C.border, color: C.muted }}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          <button
            onClick={goNext}
            disabled={!source}
            className="flex-1 py-3.5 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shadow-sm"
            style={{ backgroundColor: C.accent, color: C.dark }}
          >
            <span>Continue</span>
            <ChevronRight size={18} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    )
  }

  // ── Slide 3: Goals ─────────────────────────────────────────
  function SlideGoals() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider mb-1 font-syne" style={{ color: C.primary }}>
            QUESTION 2 OF 2
          </p>
          <h2 className="text-[24px] sm:text-[28px] font-black font-syne" style={{ color: C.textDark }}>
            What is your main goal with Riazify?
          </h2>
          <p className="text-[14px] mt-1" style={{ color: C.muted }}>
            Select all that apply — we&apos;ll configure your default dashboard widgets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GOALS.map(({ id, label, icon: Icon }) => {
            const isSelected = goals.includes(id)
            return (
              <button
                key={id}
                onClick={() => toggleGoal(id)}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
                style={{
                  borderColor: isSelected ? C.primary : C.border,
                  backgroundColor: isSelected ? C.primaryLight : C.surface,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors"
                  style={{
                    backgroundColor: isSelected ? C.primary : C.bg,
                    borderColor: isSelected ? C.primary : C.border,
                  }}
                >
                  <Icon size={18} style={{ color: isSelected ? '#ffffff' : C.primary }} />
                </div>
                <span className="text-[13px] font-bold" style={{ color: isSelected ? C.primary : C.textDark }}>
                  {label}
                </span>
                {isSelected && (
                  <div className="ml-auto w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: C.primary }}>
                    <Check size={14} style={{ color: '#ffffff' }} className="stroke-[3]" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border text-[13px] font-bold transition-all hover:bg-[#f8f7ff] cursor-pointer"
            style={{ borderColor: C.border, color: C.muted }}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          <button
            onClick={goNext}
            disabled={goals.length === 0}
            className="flex-1 py-3.5 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shadow-sm"
            style={{ backgroundColor: C.accent, color: C.dark }}
          >
            <span>Almost done</span>
            <ChevronRight size={18} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    )
  }

  // ── Slide 4: Done ──────────────────────────────────────────
  function SlideDone() {
    return (
      <div className="flex flex-col items-center text-center gap-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}
        >
          <span className="text-[38px]">🎉</span>
        </div>

        <div>
          <h2 className="text-[28px] sm:text-[32px] font-black font-syne mb-2 tracking-tight" style={{ color: C.textDark }}>
            You&apos;re all set, {userName}!
          </h2>
          <p className="text-[14px] sm:text-[15px] max-w-md mx-auto" style={{ color: C.muted }}>
            Your Riazify workspace is fully provisioned. Your 14-day free trial starts right now — no credit card needed.
          </p>
        </div>

        {/* Summary Card */}
        <div
          className="w-full max-w-md rounded-2xl border p-5 text-left shadow-xs"
          style={{ borderColor: C.border, backgroundColor: C.bg }}
        >
          <p className="text-[11px] font-black uppercase tracking-wider mb-3 font-syne" style={{ color: C.primary }}>
            WORKSPACE SUMMARY
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              { label: 'Active Plan', value: 'Free 14-Day Trial' },
              { label: 'Protected Orders', value: '30 orders/mo' },
              { label: 'VeRO Risk Audits', value: '5 instant scans' },
              { label: 'AI Title Builder', value: '3 generations/day' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1 border-b border-[#ede9fe]/50 last:border-0">
                <span className="text-[13px] font-medium" style={{ color: C.muted }}>{label}</span>
                <span className="text-[13px] font-bold" style={{ color: C.textDark }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleFinish}
          disabled={saving}
          className="w-full max-w-md py-4 rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-md"
          style={{ backgroundColor: C.accent, color: C.dark }}
        >
          {saving ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#1e1535] border-t-transparent animate-spin" />
          ) : (
            <>
              <LayoutDashboard size={18} />
              <span>Enter Dashboard</span>
            </>
          )}
        </button>

        <button
          onClick={goBack}
          className="text-[12px] font-semibold transition-colors hover:text-[#7530fb] cursor-pointer"
          style={{ color: C.muted }}
        >
          ← Edit preferences
        </button>
      </div>
    )
  }

  // ── Render Frame ───────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: C.bg,
      }}
    >
      <div className="w-full max-w-xl">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ backgroundColor: C.primary }}
          >
            <Activity size={20} style={{ color: C.accent }} />
          </div>
          <span className="text-[24px] font-black font-syne tracking-tight" style={{ color: C.textDark }}>
            Riazify
          </span>
        </div>

        {/* Container Box */}
        <div
          className="rounded-3xl shadow-xl p-6 sm:p-10 border"
          style={{
            backgroundColor: C.surface,
            borderColor: C.border,
          }}
        >
          <ProgressBar />

          <div
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? 'translateY(6px)' : 'translateY(0)',
              transition: 'opacity 0.18s ease, transform 0.18s ease',
            }}
          >
            {slide === 'welcome' && <SlideWelcome />}
            {slide === 'source' && <SlideSource />}
            {slide === 'goal' && <SlideGoals />}
            {slide === 'done' && <SlideDone />}
          </div>
        </div>

        {/* Skip Link */}
        {slide !== 'done' && (
          <div className="text-center mt-5">
            <button
              onClick={handleFinish}
              className="text-[12px] font-semibold transition-colors hover:text-[#7530fb] cursor-pointer"
              style={{ color: C.muted }}
            >
              Skip configuration for now →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
