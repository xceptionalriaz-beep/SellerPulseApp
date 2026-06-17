'use client'
// app/onboarding/page.tsx
// ══════════════════════════════════════════════════════════════
// Post-signup onboarding flow
// Slide 1: Welcome + email verified confirmation
// Slide 2: How did you hear about us?
// Slide 3: What's your main goal?
// Slide 4: You're all set!
// ══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Shield, CheckCircle, ChevronRight, ChevronLeft,
  ShieldCheck, Calculator, Type, BarChart2,
  Search, Youtube, Users, MessageCircle, Globe,
  Target, TrendingUp, DollarSign, LayoutDashboard,
  Sparkles,
} from 'lucide-react'

const C = {
  dark:     '#0a0d08',
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  border:   '#e8ede2',
  bg:       '#f7f9f5',
  text:     '#1a2410',
  muted:    '#8a9e78',
  surface:  '#ffffff',
}

// ── Slide types ────────────────────────────────────────────────
type Slide = 'welcome' | 'source' | 'goal' | 'done'
const SLIDES: Slide[] = ['welcome', 'source', 'goal', 'done']

const SOURCES = [
  { id: 'google',    label: 'Google Search',       icon: Search          },
  { id: 'youtube',   label: 'YouTube',              icon: Youtube         },
  { id: 'social',    label: 'Facebook / Instagram', icon: Globe           },
  { id: 'friend',    label: 'Friend / Referral',    icon: Users           },
  { id: 'ebay',      label: 'eBay Community',       icon: MessageCircle   },
  { id: 'other',     label: 'Other',                icon: Sparkles        },
]

const GOALS = [
  { id: 'protect',   label: 'Protect orders from risky buyers',  icon: ShieldCheck  },
  { id: 'research',  label: 'Research profitable products',       icon: Search       },
  { id: 'titles',    label: 'Build better eBay titles',           icon: Type         },
  { id: 'profit',    label: 'Track profit & analytics',           icon: DollarSign   },
  { id: 'scale',     label: 'Scale my eBay business faster',      icon: TrendingUp   },
  { id: 'all',       label: 'All of the above!',                  icon: Target       },
]

export default function OnboardingPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [slide,      setSlide]      = useState<Slide>('welcome')
  const [source,     setSource]     = useState<string | null>(null)
  const [goals,      setGoals]      = useState<string[]>([])
  const [userName,   setUserName]   = useState('there')
  const [saving,     setSaving]     = useState(false)
  const [animating,  setAnimating]  = useState(false)

  const slideIndex  = SLIDES.indexOf(slide)
  const totalSlides = SLIDES.length

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'there'
        setUserName(name.split(' ')[0])
      }
      // No session yet is fine — user just signed up with email confirmation
    }
    loadUser()
  }, [])

  function goNext() {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setSlide(SLIDES[slideIndex + 1])
      setAnimating(false)
    }, 200)
  }

  function goBack() {
    if (animating || slideIndex === 0) return
    setAnimating(true)
    setTimeout(() => {
      setSlide(SLIDES[slideIndex - 1])
      setAnimating(false)
    }, 200)
  }

  function toggleGoal(id: string) {
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
          onboarding_source:    source,
          onboarding_goals:     goals,
          updated_at:           new Date().toISOString(),
        }).eq('id', user.id)

        // Log to user events
        await (supabase.from('user_events') as any).insert({
          user_id:     user.id,
          event_type:  'onboarding_completed',
          event_title: 'Onboarding Completed',
          event_desc:  `Source: ${source ?? 'unknown'} · Goals: ${goals.join(', ')}`,
          created_at:  new Date().toISOString(),
        })
      }
    } catch { /* non-critical */ }
    setSaving(false)
    router.push('/auth/login?message=account_created')
  }

  // ── Progress bar ───────────────────────────────────────────
  function ProgressBar() {
    return (
      <div className="flex items-center gap-2 mb-8">
        {SLIDES.map((s, i) => (
          <div key={s} className="flex-1 h-1 rounded-full transition-all duration-300"
               style={{ backgroundColor: i <= slideIndex ? C.lime : C.border }} />
        ))}
      </div>
    )
  }

  // ── Slide 1: Welcome ───────────────────────────────────────
  function SlideWelcome() {
    return (
      <div className="flex flex-col items-center text-center gap-6">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
             style={{ backgroundColor: C.dark }}>
          <Shield size={48} style={{ color: C.lime }} />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                 style={{ backgroundColor: C.limeTint }}>
              <CheckCircle size={14} style={{ color: C.limeDeep }} />
              <span className="text-[12px] font-bold" style={{ color: C.limeDeep }}>
                Email Verified Successfully
              </span>
            </div>
          </div>
          <h1 className="text-[32px] font-black mb-2" style={{ color: C.dark }}>
            Welcome to Riazify, {userName}!
          </h1>
          <p className="text-[15px]" style={{ color: C.muted }}>
            You're now part of the smartest eBay seller community.
            Let's set up your account in 60 seconds.
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {[
            { icon: ShieldCheck, label: 'Order Protection'    },
            { icon: Calculator,  label: 'Profit Calculator'   },
            { icon: Type,        label: 'AI Title Builder'    },
            { icon: BarChart2,   label: 'Analytics Dashboard' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
                 style={{ borderColor: C.border, backgroundColor: C.bg }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: C.limeTint }}>
                <Icon size={14} style={{ color: C.limeDeep }} />
              </div>
              <span className="text-[12px] font-semibold" style={{ color: C.text }}>{label}</span>
            </div>
          ))}
        </div>

        <button onClick={goNext}
          className="w-full max-w-sm py-4 rounded-2xl font-black text-[15px] flex items-center justify-center gap-2"
          style={{ backgroundColor: C.dark, color: C.lime }}>
          Let's get started <ChevronRight size={18} />
        </button>
      </div>
    )
  }

  // ── Slide 2: Source ────────────────────────────────────────
  function SlideSource() {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-[12px] font-black tracking-wider mb-1" style={{ color: C.muted }}>
            QUICK QUESTION 1 OF 2
          </p>
          <h2 className="text-[26px] font-black" style={{ color: C.dark }}>
            How did you hear about Riazify?
          </h2>
          <p className="text-[14px] mt-1" style={{ color: C.muted }}>
            This helps us understand where our community comes from
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SOURCES.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSource(id)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all"
              style={{
                borderColor:     source === id ? C.limeDeep : C.border,
                backgroundColor: source === id ? C.limeTint : C.surface,
              }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                   style={{ backgroundColor: source === id ? C.limeDeep : C.bg }}>
                <Icon size={16} style={{ color: source === id ? C.lime : C.muted }} />
              </div>
              <span className="text-[13px] font-bold" style={{ color: source === id ? C.limeDeep : C.text }}>
                {label}
              </span>
              {source === id && (
                <CheckCircle size={16} style={{ color: C.limeDeep, marginLeft: 'auto', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={goBack}
            className="flex items-center gap-1 px-4 py-3 rounded-2xl border text-[13px] font-semibold"
            style={{ borderColor: C.border, color: C.muted }}>
            <ChevronLeft size={16} /> Back
          </button>
          <button onClick={goNext} disabled={!source}
            className="flex-1 py-3 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ backgroundColor: C.dark, color: C.lime }}>
            Continue <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // ── Slide 3: Goals ─────────────────────────────────────────
  function SlideGoals() {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-[12px] font-black tracking-wider mb-1" style={{ color: C.muted }}>
            QUICK QUESTION 2 OF 2
          </p>
          <h2 className="text-[26px] font-black" style={{ color: C.dark }}>
            What's your main goal with Riazify?
          </h2>
          <p className="text-[14px] mt-1" style={{ color: C.muted }}>
            Select all that apply — we'll personalise your experience
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {GOALS.map(({ id, label, icon: Icon }) => {
            const selected = goals.includes(id)
            return (
              <button key={id} onClick={() => toggleGoal(id)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all"
                style={{
                  borderColor:     selected ? C.limeDeep : C.border,
                  backgroundColor: selected ? C.limeTint : C.surface,
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                     style={{ backgroundColor: selected ? C.limeDeep : C.bg }}>
                  <Icon size={16} style={{ color: selected ? C.lime : C.muted }} />
                </div>
                <span className="text-[13px] font-bold" style={{ color: selected ? C.limeDeep : C.text }}>
                  {label}
                </span>
                {selected && (
                  <CheckCircle size={16} style={{ color: C.limeDeep, marginLeft: 'auto', flexShrink: 0 }} />
                )}
              </button>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={goBack}
            className="flex items-center gap-1 px-4 py-3 rounded-2xl border text-[13px] font-semibold"
            style={{ borderColor: C.border, color: C.muted }}>
            <ChevronLeft size={16} /> Back
          </button>
          <button onClick={goNext} disabled={goals.length === 0}
            className="flex-1 py-3 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ backgroundColor: C.dark, color: C.lime }}>
            Almost done <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // ── Slide 4: Done ──────────────────────────────────────────
  function SlideDone() {
    return (
      <div className="flex flex-col items-center text-center gap-6">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
             style={{ backgroundColor: C.limeTint }}>
          <span style={{ fontSize: 48 }}>🎉</span>
        </div>
        <div>
          <h2 className="text-[32px] font-black mb-2" style={{ color: C.dark }}>
            You're all set, {userName}!
          </h2>
          <p className="text-[15px]" style={{ color: C.muted }}>
            Your Riazify account is ready. Your free trial starts now —
            no credit card required.
          </p>
        </div>

        {/* Summary */}
        <div className="w-full max-w-sm rounded-2xl border p-4 text-left"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <p className="text-[11px] font-black tracking-wider mb-3" style={{ color: C.muted }}>
            YOUR ACCOUNT SUMMARY
          </p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Plan',          value: 'Free (14-day trial)' },
              { label: 'Orders/month',  value: '30 protected'        },
              { label: 'VeRO checks',   value: '5/month'             },
              { label: 'Title Builder', value: '3/day'               },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: C.muted }}>{label}</span>
                <span className="text-[12px] font-bold" style={{ color: C.text }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleFinish} disabled={saving}
          className="w-full max-w-sm py-4 rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ backgroundColor: C.dark, color: C.lime }}>
          {saving ? (
            <div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin"
                 style={{ borderTopColor: C.lime }} />
          ) : (
            <><LayoutDashboard size={18} /> Go to Dashboard</>
          )}
        </button>

        <button onClick={goBack}
          className="text-[12px]" style={{ color: C.muted }}>
          ← Go back
        </button>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ backgroundColor: C.bg }}>
      <div className="w-full max-w-2xl">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: C.dark }}>
            <Shield size={20} style={{ color: C.lime }} />
          </div>
          <span className="text-[22px] font-extrabold" style={{ color: C.dark }}>Riazify</span>
        </div>

        {/* Card */}
        <div className="rounded-3xl shadow-xl p-8"
             style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>

          <ProgressBar />

          <div style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.2s ease' }}>
            {slide === 'welcome' && <SlideWelcome />}
            {slide === 'source'  && <SlideSource  />}
            {slide === 'goal'    && <SlideGoals   />}
            {slide === 'done'    && <SlideDone    />}
          </div>
        </div>

        {/* Skip link */}
        {slide !== 'done' && (
          <div className="text-center mt-4">
            <button onClick={handleFinish}
              className="text-[12px] hover:opacity-70"
              style={{ color: C.muted }}>
              Skip for now →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}