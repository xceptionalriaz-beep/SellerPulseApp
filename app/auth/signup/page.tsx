'use client'
// app/auth/signup/page.tsx
// ═══════════════════════════════════════════════════════════════
// Converted from: lib/pages/signup_page.dart
//
// What the Dart version had:
//   ✅ Riazify logo top center
//   ✅ 3-step progress pill (Create Account → Verify Email → Start Trial)
//   ✅ Dark card #131B2F, two columns on desktop
//   ✅ STEP 1: Full name, email, password + strength bar, gender, terms
//   ✅ STEP 2: Verify email — tips box, resend button, check verified
//   ✅ STEP 3: Success — trial features list, go to dashboard
//   ✅ Google OAuth button with real SVG logo
//   ✅ Password strength bar (Weak/Fair/Good/Strong)
//   ✅ Gender dropdown (Unspecified/Male/Female)
//   ✅ Terms of Service checkbox (lime)
//   ✅ Loading button with spinner + optional icon
//   ✅ Hover effects on Google button + Log In link
//   ✅ Testimonial panel (same as login page)
//   ✅ Session tracking on signup
//   ✅ AppToast on all events
//   ✅ Resend verification email
//   ✅ Check email verified before going to step 3
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, Eye, EyeOff, Mail, Lock, User, ChevronDown,
  Star, BadgeCheck, ArrowLeft, MailOpen, CheckCircle,
  ShieldCheck, Calculator, Type, BarChart2, PartyPopper,
  LayoutDashboard,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/email'
import { SessionTracker } from '@/lib/session-tracker'
import { useToast } from '@/components/ui/AppToast'
import { cn } from '@/lib/utils'

// ── Google SVG Logo ────────────────────────────────────────────
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" width="22" height="22">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

// ── Progress Pill (converted from AnimatedProgressPill widget) ─
function ProgressPill({ currentStep, onStepTap }: {
  currentStep: number
  onStepTap: (step: number) => void
}) {
  const steps = ['Create Account', 'Verify Email', 'Start Trial']
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            onClick={() => i < currentStep && onStepTap(i)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300',
              i === currentStep
                ? 'bg-lime text-dark shadow-lime'
                : i < currentStep
                  ? 'bg-lime/20 text-lime cursor-pointer hover:bg-lime/30'
                  : 'bg-white/10 text-white/40 cursor-default'
            )}
          >
            <span className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
              i === currentStep ? 'bg-dark text-lime' :
              i < currentStep  ? 'bg-lime text-dark'  : 'bg-white/20 text-white/40'
            )}>
              {i < currentStep ? '✓' : i + 1}
            </span>
            {label}
          </button>
          {i < steps.length - 1 && (
            <div className={cn(
              'h-px w-6 transition-all duration-300',
              i < currentStep ? 'bg-lime/50' : 'bg-white/20'
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Stat Pill ──────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center px-3.5 py-2 rounded-[10px] border border-white/10 bg-white/5">
      <span className="text-lime text-base font-extrabold leading-tight">{value}</span>
      <span className="text-white/50 text-[10px] leading-tight">{label}</span>
    </div>
  )
}

// ── Password strength calculator ───────────────────────────────
function getPasswordStrength(password: string): {
  strength: number; label: string; color: string
} {
  let strength = 0
  if (password.length >= 8)                          strength += 0.25
  if (/[A-Z]/.test(password))                        strength += 0.25
  if (/[0-9]/.test(password))                        strength += 0.25
  if (/[!@#$%^&*(),.?]/.test(password))              strength += 0.25

  if (strength <= 0.25) return { strength, label: 'Weak',   color: '#EF4444' }
  if (strength <= 0.50) return { strength, label: 'Fair',   color: '#F59E0B' }
  if (strength <= 0.75) return { strength, label: 'Good',   color: '#3B82F6' }
  return                       { strength, label: 'Strong', color: '#8FFF00' }
}

// ── NEW: Read referral from localStorage ───────────────────────
function readReferral(): Record<string, any> | null {
  try {
    const raw = localStorage.getItem('riazify_referral')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// ── NEW: Clear referral after use (one-time capture) ──────────
function clearReferral() {
  try { localStorage.removeItem('riazify_referral') } catch {}
}

// ══════════════════════════════════════════════════════════════
// MAIN SIGNUP PAGE
// ══════════════════════════════════════════════════════════════
export default function SignupPage() {
  const router   = useRouter()
  const toast    = useToast()
  const supabase = createClient()

  // ── State ──────────────────────────────────────────────────
  const [currentStep,     setCurrentStep]     = useState(0)
  const [name,            setName]            = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [showPassword,    setShowPassword]    = useState(false)
  const [gender,          setGender]          = useState('Unspecified')
  const [termsAccepted,   setTermsAccepted]   = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [googleLoading,   setGoogleLoading]   = useState(false)
  const [resending,       setResending]       = useState(false)
  const [errors,          setErrors]          = useState<Record<string, string>>({})

  const pwStrength = password ? getPasswordStrength(password) : null

  // ── Validation ─────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim())                                          e.name     = 'Full name is required'
    else if (name.trim().length < 2)                           e.name     = 'Name must be at least 2 characters'
    if (!email.trim())                                         e.email    = 'Email is required'
    else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email.trim())) e.email    = 'Enter a valid email address'
    if (!password.trim())                                      e.password = 'Password is required'
    else if (password.length < 6)                              e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Create Account ─────────────────────────────────────────
  async function handleCreateAccount() {
    if (!validate()) return
    if (!termsAccepted) {
      toast.warning('Please accept the Terms of Service to continue')
      return
    }
    setLoading(true)
    try {
      const metadata = await SessionTracker.getLoginMetadata()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name:  name.trim(),
            gender,
            avatar_url: '',
          },
        },
      })

      if (error) { toast.error(error.message); return }

      if (data.user) {
        // Track session metadata
        try {
          await supabase.from('profiles').update({
            last_login_ip:   metadata.last_login_ip,
            device_platform: metadata.device_platform,
            browser_agent:   metadata.browser_agent,
          } as never).eq('id', data.user.id)
        } catch { /* non-critical */ }

        // ── NEW: Capture referral source ──────────────────────
        // Reads UTM params stored by ReferralCapture component
        // in localStorage. Saves to profiles + logs to timeline.
        try {
          const referral = readReferral() ?? { source: 'direct' }

          // Save referral_source to profiles table
          await (supabase.from('profiles') as any)
            .update({ referral_source: referral })
            .eq('id', data.user.id)

          // Log signup event to user journey timeline
          await (supabase.from('user_events') as any).insert({
            user_id:     data.user.id,
            event_type:  'signup',
            event_title: 'Signed up for Riazify',
            event_desc:  `${referral.source ?? 'Direct'} · Free Trial started`,
            metadata:    {
              source:   referral.source   ?? 'direct',
              medium:   referral.medium   ?? null,
              ref:      referral.ref      ?? null,
              campaign: referral.campaign ?? null,
            },
            created_at: new Date().toISOString(),
          })

          // Clear after saving — one-time capture only
          clearReferral()
        } catch { /* non-critical — don't block signup */ }
        // ─────────────────────────────────────────────────────

        // Send welcome email via Resend
        try {
          await sendWelcomeEmail({
            to:       email,
            userName: name.trim() || 'Seller',
          })
        } catch { /* non-critical — don't block signup */ }

        // Trigger Welcome Sequence email flow
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
          await fetch(appUrl + '/api/email/enqueue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_SECRET ?? '' },
            body: JSON.stringify({ trigger_event: 'user.signup', user_id: data.user.id, to_email: email, to_name: name.trim() || 'Seller' }),
          })
        } catch (e) { /* non-critical */ }

        setCurrentStep(1)
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google Sign Up ─────────────────────────────────────────
  async function handleGoogleSignup() {
    setGoogleLoading(true)
    try {
      toast.info('Opening Google Sign-In...')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) toast.error('Google Sign-In failed. Please try again.')
    } catch {
      toast.error('Google Sign-In failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  // ── Resend Email ───────────────────────────────────────────
  async function handleResendEmail() {
    if (!email) { toast.error('No email address found.'); return }
    setResending(true)
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) toast.error('Failed to resend. Try again.')
      else toast.show('Verification email resent!')
    } catch {
      toast.error('Failed to resend. Try again.')
    } finally {
      setResending(false)
    }
  }

  // ── Check Email Verified ───────────────────────────────────
  async function handleCheckVerified() {
    setLoading(true)
    try {
      await supabase.auth.refreshSession()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email_confirmed_at) {

        // ── Affiliate signup tracking ─────────────────────────
        // Reads riazify_ref cookie → credits affiliate +1 signup
        // Last Click Wins: whoever's link they clicked last gets credit
        try {
          await fetch('/api/affiliate/signup', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ newUserId: user.id, newUserEmail: user.email }),
          })
        } catch { /* non-critical — don't block signup flow */ }
        // ─────────────────────────────────────────────────────

        // ── NEW: Log email verified event to journey timeline ─
        try {
          await (supabase.from('user_events') as any).insert({
            user_id:     user.id,
            event_type:  'email_verified',
            event_title: 'Email Address Verified',
            event_desc:  'Account fully activated',
            created_at:  new Date().toISOString(),
          })
        } catch { /* non-critical */ }
        // ─────────────────────────────────────────────────────

        setCurrentStep(2)
      } else {
        toast.warning('Email not verified yet. Please check your inbox.')
      }
    } catch {
      // Allow proceeding — verification check is best effort
      setCurrentStep(2)
    } finally {
      setLoading(false)
    }
  }

  // ── Input field shared style ───────────────────────────────
  function inputClass(field: string) {
    return cn(
      'w-full h-[50px] pl-10 pr-4 rounded-xl border bg-[#F8FAFC] text-sm text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all',
      errors[field]
        ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
        : 'border-[#E2E8F0] focus:border-lime focus:ring-2 focus:ring-lime/20'
    )
  }

  // ════════════════════════════════════════════════════════════
  // STEP 1 — CREATE ACCOUNT
  // ════════════════════════════════════════════════════════════
  function Step1() {
    return (
      <div className="flex flex-col">
        <h1 className="text-[26px] font-bold text-[#1E293B]">Create your account</h1>
        <p className="text-[#64748B] text-[13px] mt-1.5 mb-6">
          Start your 7-day free trial. No credit card required.
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          className="w-full h-[50px] flex items-center justify-center gap-2.5 bg-white border border-[#E2E8F0] rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-150 disabled:opacity-60 mb-4"
        >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <GoogleLogo />
          </div>
          <span className="text-sm font-semibold text-[#1E293B]">
            {googleLoading ? 'Opening...' : 'Continue with Google'}
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-[11px] text-gray-400">or sign up with email</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        {/* Full Name */}
        <label className="text-[13px] font-bold text-[#1E293B] mb-1.5 block">Full Name</label>
        <div className="relative mb-3">
          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
            placeholder="Enter your name"
            className={inputClass('name')}
          />
          {errors.name && <p className="text-[11px] text-[#EF4444] mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <label className="text-[13px] font-bold text-[#1E293B] mb-1.5 block">Business Email</label>
        <div className="relative mb-3">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
            placeholder="email@example.com"
            className={inputClass('email')}
          />
          {errors.email && <p className="text-[11px] text-[#EF4444] mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <label className="text-[13px] font-bold text-[#1E293B] mb-1.5 block">Create Password</label>
        <div className="relative mb-1">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
            placeholder="••••••••"
            className={cn(inputClass('password'), 'pr-10')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.password && <p className="text-[11px] text-[#EF4444] mt-1">{errors.password}</p>}
        </div>

        {/* Password Strength Bar */}
        {pwStrength && password.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pwStrength.strength * 100}%`, backgroundColor: pwStrength.color }}
              />
            </div>
            <span className="text-[10px] font-semibold" style={{ color: pwStrength.color }}>
              {pwStrength.label}
            </span>
          </div>
        )}

        {/* Gender */}
        <label className="text-[13px] font-bold text-[#1E293B] mb-1.5 block">Gender</label>
        <div className="relative mb-3">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full h-[50px] pl-4 pr-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#1E293B] outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 appearance-none transition-all"
          >
            <option value="Unspecified">Prefer not to say</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-2 cursor-pointer mb-5">
          <div className="mt-0.5 shrink-0">
            <div
              onClick={() => setTermsAccepted(!termsAccepted)}
              className={cn(
                'w-5 h-5 rounded border-[1.5px] border-lime flex items-center justify-center transition-colors cursor-pointer',
                termsAccepted ? 'bg-lime' : 'bg-white'
              )}
            >
              {termsAccepted && (
                <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                  <path d="M1 4L4 7L10 1" stroke="#0A0D08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <span className="text-[11px] text-[#64748B] leading-relaxed">
            I agree to the{' '}
            <a href="#" className="text-blue-600 underline font-semibold">Terms of Service</a>
            {' & '}
            <a href="#" className="text-blue-600 underline font-semibold">Privacy Policy</a>
          </span>
        </label>

        {/* Create Account Button */}
        <button
          onClick={handleCreateAccount}
          disabled={loading}
          className="w-full h-[50px] bg-lime text-dark font-bold text-base rounded-xl hover:shadow-lime transition-all duration-200 disabled:opacity-50 flex items-center justify-center mb-4"
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : 'Create Account'}
        </button>

        {/* Log In Link */}
        <p className="text-center text-[13px] text-[#64748B]">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-bold text-black hover:text-lime transition-colors">
            Log In
          </Link>
        </p>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // STEP 2 — VERIFY EMAIL
  // ════════════════════════════════════════════════════════════
  function Step2() {
    return (
      <div className="flex flex-col">
        <button
          onClick={() => setCurrentStep(0)}
          className="flex items-center gap-1 text-[#64748B] hover:text-dark transition-colors mb-4 w-fit"
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* Email icon */}
        <div className="w-16 h-16 rounded-[16px] bg-lime/10 flex items-center justify-center mb-5">
          <MailOpen size={32} className="text-lime" />
        </div>

        <h1 className="text-[26px] font-bold text-[#1E293B] mb-2">Verify your email</h1>
        <p className="text-[#64748B] text-[13px] leading-relaxed mb-6">
          We sent a verification link to{' '}
          <span className="font-bold text-[#1E293B]">{email}</span>.
          {' '}Click the link in the email to continue.
        </p>

        {/* Tips box */}
        <div className="p-3.5 rounded-xl border border-lime/20 bg-lime/5 mb-6">
          <p className="text-[12px] font-bold text-[#1E293B] mb-2">Didn&apos;t get it? Check:</p>
          {[
            'Your spam or junk folder',
            'The email is from noreply@mail.app.supabase.io',
            'Wait a minute and check again',
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-1.5 mt-1">
              <CheckCircle size={12} className="text-lime shrink-0" />
              <span className="text-[11px] text-[#64748B]">{tip}</span>
            </div>
          ))}
        </div>

        {/* Verified Button */}
        <button
          onClick={handleCheckVerified}
          disabled={loading}
          className="w-full h-[50px] bg-lime text-dark font-bold text-base rounded-xl hover:shadow-lime transition-all duration-200 disabled:opacity-50 flex items-center justify-center mb-3"
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : 'I have verified my email'}
        </button>

        {/* Resend */}
        <div className="flex justify-center">
          {resending ? (
            <svg className="animate-spin w-4 h-4 text-lime" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : (
            <button
              onClick={handleResendEmail}
              className="text-[13px] font-bold text-black hover:text-lime transition-colors"
            >
              Resend verification email
            </button>
          )}
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // STEP 3 — SUCCESS
  // ════════════════════════════════════════════════════════════
  function Step3() {
    const features = [
      { icon: ShieldCheck,  title: 'Order Protection',      sub: 'Protect orders from risky buyers'  },
      { icon: Calculator,   title: 'Profit Calculator',     sub: 'Calculate real eBay profit'         },
      { icon: Type,         title: 'Title Builder',         sub: 'AI-powered listing optimizer'       },
      { icon: BarChart2,    title: 'Analytics Dashboard',   sub: 'Full platform insights'             },
    ]

    return (
      <div className="flex flex-col items-center text-center">
        <div className="mt-5 mb-5 w-20 h-20 rounded-full bg-lime/10 flex items-center justify-center">
          <PartyPopper size={42} className="text-lime" />
        </div>

        <h1 className="text-[28px] font-bold text-[#1E293B]">You&apos;re all set! 🎉</h1>
        <p className="text-[#64748B] text-sm mt-2 mb-6 leading-relaxed">
          Your Riazify account is active.<br/>Your 7-day free trial has started.
        </p>

        {/* Trial features */}
        <div className="w-full text-left p-4 rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] mb-6">
          <p className="text-[13px] font-bold text-[#1E293B] mb-3">What&apos;s included in your trial:</p>
          {features.map(({ icon: Icon, title, sub }, i) => (
            <div key={i} className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-lime/10 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-limeDeep" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-[#1E293B]">{title}</p>
                <p className="text-[10px] text-[#64748B]">{sub}</p>
              </div>
              <CheckCircle size={16} className="text-lime shrink-0" />
            </div>
          ))}
        </div>

        {/* Go to Dashboard */}
        <button
          onClick={() => { router.push('/dashboard'); router.refresh() }}
          className="w-full h-[50px] bg-lime text-dark font-bold text-base rounded-xl hover:shadow-lime transition-all duration-200 flex items-center justify-center gap-2"
        >
          <LayoutDashboard size={20} />
          Go to Dashboard
        </button>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // TESTIMONIAL PANEL (same as login page)
  // ════════════════════════════════════════════════════════════
  function Testimonial() {
    return (
      <div className="px-[50px] py-10 flex flex-col justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-lime/30 bg-lime/15 w-fit mb-6">
          <BadgeCheck size={14} className="text-lime" />
          <span className="text-lime text-[11px] font-semibold">Trusted by eBay sellers worldwide</span>
        </div>
        <div className="flex gap-0.5 mb-4">
          {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-lime fill-lime" />)}
        </div>
        <p className="text-white text-[18px] font-semibold leading-relaxed mb-4">
          &ldquo;Riazify revolutionized my eBay business! We scaled from $2k to $45k monthly sales within just 4 months using these tools.&rdquo;
        </p>
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-full bg-lime/20 flex items-center justify-center">
            <span className="text-lime text-xs font-extrabold">AT</span>
          </div>
          <div>
            <p className="text-white text-[13px] font-bold">Alex Thompson</p>
            <p className="text-[#64748B] text-xs">Top-Rated eBay Seller</p>
          </div>
        </div>
        <div className="flex gap-3">
          <StatPill value="10K+" label="Sellers"   />
          <StatPill value="$2M+" label="Protected" />
          <StatPill value="98%"  label="Win Rate"  />
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-5 py-10">

      {/* Top bar — back link + logo */}
      <div className="flex items-center justify-between w-full max-w-[1000px] mb-6">
        <button onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[13px] font-semibold transition-all hover:opacity-70 group"
          style={{ color: '#64748B' }}>
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Riazify
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-dark rounded-lg flex items-center justify-center">
            <Shield size={15} className="text-lime" />
          </div>
          <span className="text-[16px] font-extrabold text-dark tracking-tight">Riazify</span>
        </div>
      </div>

      {/* Progress Pill */}
      <div className="mb-8">
        <ProgressPill currentStep={currentStep} onStepTap={setCurrentStep} />
      </div>

      {/* Main Card */}
      <div
        className="w-full max-w-[1100px] rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden"
        style={{ backgroundColor: '#131B2F' }}
      >
        <div className="flex flex-col lg:flex-row lg:min-h-[720px]">

          {/* Left: Form */}
          <div className="flex-[5] p-6">
            <div className="bg-white rounded-[24px] px-10 py-8 h-full">
              {currentStep === 0 && Step1()}
              {currentStep === 1 && Step2()}
              {currentStep === 2 && Step3()}
            </div>
          </div>

          {/* Right: Testimonial */}
          <div className="flex-[4]">
            {Testimonial()}
          </div>

        </div>
      </div>
    </div>
  )
}