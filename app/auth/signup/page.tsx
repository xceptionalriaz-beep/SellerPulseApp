'use client'

// app/auth/signup/page.tsx
// Riazify Merchant Onboarding & Registration — v2.0

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, Eye, EyeOff, Mail, Lock, User, ChevronDown,
  Star, BadgeCheck, ArrowLeft, Check
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/email'
import { SessionTracker } from '@/lib/session-tracker'
import { useToast } from '@/components/ui/AppToast'
import { cn } from '@/lib/utils'

// ── Riazify Color Role Tokens (v2.0) ──────────────────────────
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
  red: '#dc2626',
}

// ── Google SVG Logo ────────────────────────────────────────────
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

// ── Metric Stat Pill ───────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex flex-col items-center px-3.5 py-2.5 rounded-xl border"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
    >
      <span className="text-[16px] font-black font-syne leading-tight" style={{ color: C.accent }}>
        {value}
      </span>
      <span className="text-[11px] leading-tight font-medium mt-0.5" style={{ color: C.textLight }}>
        {label}
      </span>
    </div>
  )
}

// ── Password Strength Calculator ───────────────────────────────
function getPasswordStrength(password: string): {
  strength: number; label: string; color: string
} {
  let strength = 0
  if (password.length >= 8) strength += 0.25
  if (/[A-Z]/.test(password)) strength += 0.25
  if (/[0-9]/.test(password)) strength += 0.25
  if (/[!@#$%^&*(),.?]/.test(password)) strength += 0.25

  if (strength <= 0.25) return { strength, label: 'Weak', color: '#dc2626' }
  if (strength <= 0.50) return { strength, label: 'Fair', color: '#f59e0b' }
  if (strength <= 0.75) return { strength, label: 'Good', color: '#2563eb' }
  return { strength, label: 'Strong', color: '#b8fa33' }
}

function readReferral(): Record<string, any> | null {
  try {
    const raw = localStorage.getItem('riazify_referral')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearReferral() {
  try {
    localStorage.removeItem('riazify_referral')
  } catch { }
}

export default function SignupPage() {
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()

  // ── State ──────────────────────────────────────────────────
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [gender, setGender] = useState('Unspecified')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const pwStrength = password ? getPasswordStrength(password) : null

  // ── Validation ─────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) {
      e.name = 'Full legal name is required'
    } else if (name.trim().length < 2) {
      e.name = 'Name must be at least 2 characters'
    }
    if (!email.trim()) {
      e.email = 'Business email is required'
    } else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email.trim())) {
      e.email = 'Please enter a valid email address'
    }
    if (!password.trim()) {
      e.password = 'Password is required'
    } else if (password.length < 6) {
      e.password = 'Password must be at least 6 characters'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Create Account Handler ─────────────────────────────────
  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (!termsAccepted) {
      toast.warning('Please agree to the Terms of Service to continue')
      return
    }
    setLoading(true)
    try {
      const metadata = await SessionTracker.getLoginMetadata()

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: name.trim(),
            gender,
            avatar_url: '',
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      // Auto sign-in immediately upon registration
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })

      // Track session metadata
      try {
        await supabase.from('profiles').update({
          last_login_ip: metadata.last_login_ip,
          device_platform: metadata.device_platform,
          browser_agent: metadata.browser_agent,
        } as never).eq('id', data.user?.id ?? '')
      } catch { }

      // Capture referral source
      try {
        const referral = readReferral() ?? { source: 'direct' }

        if (referral.ref) {
          const { data: referrer } = await (supabase.from('profiles') as any)
            .select('id, referral_count')
            .eq('referral_code', referral.ref)
            .single()

          if (referrer) {
            await (supabase.from('profiles') as any)
              .update({
                referral_count: ((referrer as any).referral_count ?? 0) + 1,
                updated_at: new Date().toISOString(),
              })
              .eq('id', (referrer as any).id)

            await (supabase.from('profiles') as any)
              .update({ referred_by: (referrer as any).id })
              .eq('id', data.user?.id)
          }
        }

        await (supabase.from('profiles') as any)
          .update({ referral_source: referral })
          .eq('id', data.user?.id)

        await (supabase.from('user_events') as any).insert({
          user_id: data.user?.id,
          event_type: 'signup',
          event_title: 'Signed up for Riazify',
          event_desc: `${referral.source ?? 'Direct'} · Trial Initialized`,
          metadata: {
            source: referral.source ?? 'direct',
            medium: referral.medium ?? null,
            ref: referral.ref ?? null,
            campaign: referral.campaign ?? null,
          },
          created_at: new Date().toISOString(),
        })

        clearReferral()
      } catch { }

      // Send welcome email via Resend
      try {
        await sendWelcomeEmail({
          to: email.trim().toLowerCase(),
          userName: name.trim() || 'Seller',
        })
      } catch { }

      // Fire webhook
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
        await fetch(appUrl + '/api/admin/webhooks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_SECRET ?? '',
          },
          body: JSON.stringify({
            event_type: 'user.signup',
            data: {
              email: email.trim().toLowerCase(),
              name: name.trim() || 'New Merchant',
              plan: 'Free',
            },
          }),
        })
      } catch { }

      toast.show('Account created successfully!')
      router.push('/onboarding')
    } catch {
      toast.error('Something went wrong during account creation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google Sign Up ─────────────────────────────────────────
  async function handleGoogleSignup() {
    setGoogleLoading(true)
    try {
      toast.info('Connecting to Google Sign-In...')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) toast.error('Google registration failed. Please try again.')
    } catch {
      toast.error('Google registration failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg }} className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-10">

      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-[1000px] mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[13px] font-bold font-syne transition-colors group cursor-pointer"
          style={{ color: C.muted }}
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" style={{ color: C.primary }} />
          <span>Back to Home</span>
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center border"
            style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
            <Shield size={14} style={{ color: C.accent }} />
          </div>
          <span className="text-[16px] font-black font-syne tracking-tight" style={{ color: C.textDark }}>
            Riazify
          </span>
        </Link>
      </div>

      {/* Main Dual Card Shell */}
      <div
        className="w-full max-w-[1000px] rounded-3xl shadow-xl overflow-hidden border"
        style={{ backgroundColor: C.dark, borderColor: C.borderDark }}
      >
        <div className="flex flex-col lg:flex-row lg:min-h-[700px]">

          {/* Left Column: Form Panel */}
          <div className="flex-[5] p-3 sm:p-5">
            <div className="bg-white rounded-2xl p-6 sm:p-10 h-full flex flex-col justify-center border" style={{ borderColor: C.border }}>

              <div className="mb-5">
                <h1 className="text-[26px] sm:text-[28px] font-black font-syne tracking-tight" style={{ color: C.textDark }}>
                  Create your workspace
                </h1>
                <p className="text-[13.5px] mt-1" style={{ color: C.muted }}>
                  Start your 14-day free trial. No credit card required.
                </p>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="w-full h-11 flex items-center justify-center gap-3 bg-white border rounded-xl shadow-2xs hover:bg-[#f8f7ff] transition-all duration-150 disabled:opacity-60 cursor-pointer mb-4"
                style={{ borderColor: C.borderInput }}
              >
                <GoogleLogo />
                <span className="text-[13.5px] font-bold font-syne" style={{ color: C.textDark }}>
                  {googleLoading ? 'Opening Google...' : 'Continue with Google'}
                </span>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
                <span className="text-[11px] font-bold font-syne uppercase tracking-wider" style={{ color: C.muted }}>
                  or sign up with email
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
              </div>

              <form onSubmit={handleCreateAccount} className="flex flex-col gap-3.5">

                {/* Full Name */}
                <div>
                  <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                    FULL LEGAL NAME *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
                      placeholder="Alex Morgan"
                      className="w-full h-10 pl-10 pr-4 rounded-xl border text-[13.5px] outline-none transition-colors bg-white"
                      style={{
                        color: C.textDark,
                        borderColor: errors.name ? C.red : C.borderInput,
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.name ? C.red : C.borderInput }}
                    />
                  </div>
                  {errors.name && <p className="text-[11px] font-medium mt-1" style={{ color: C.red }}>{errors.name}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                    BUSINESS EMAIL *
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
                      placeholder="alex@store.com"
                      className="w-full h-10 pl-10 pr-4 rounded-xl border text-[13.5px] outline-none transition-colors bg-white"
                      style={{
                        color: C.textDark,
                        borderColor: errors.email ? C.red : C.borderInput,
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.email ? C.red : C.borderInput }}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] font-medium mt-1" style={{ color: C.red }}>{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                    CREATE PASSWORD *
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                      placeholder="••••••••••••"
                      className="w-full h-10 pl-10 pr-10 rounded-xl border text-[13.5px] outline-none transition-colors bg-white"
                      style={{
                        color: C.textDark,
                        borderColor: errors.password ? C.red : C.borderInput,
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.password ? C.red : C.borderInput }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ color: C.muted }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[11px] font-medium mt-1" style={{ color: C.red }}>{errors.password}</p>}

                  {/* Password Strength Meter */}
                  {pwStrength && password.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1 bg-[#ede9fe] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pwStrength.strength * 100}%`,
                            backgroundColor: pwStrength.color,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold font-syne uppercase" style={{ color: pwStrength.color }}>
                        {pwStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Gender Selector */}
                <div>
                  <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                    GENDER PREFERENCE <span className="font-normal text-[#8a9e78]">(optional)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-10 pl-3.5 pr-10 rounded-xl border text-[13px] outline-none transition-colors bg-white appearance-none cursor-pointer"
                      style={{ color: C.textDark, borderColor: C.borderInput }}
                      onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
                      onBlur={e => { e.currentTarget.style.borderColor = C.borderInput }}
                    >
                      <option value="Unspecified">Prefer not to say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.muted }} />
                  </div>
                </div>

                {/* Terms of Service Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer mt-1 select-none">
                  <div
                    onClick={() => setTermsAccepted(!termsAccepted)}
                    className="w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: termsAccepted ? C.primary : '#ffffff',
                      borderColor: termsAccepted ? C.primary : C.borderInput,
                    }}
                  >
                    {termsAccepted && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[11.5px] leading-relaxed" style={{ color: C.muted }}>
                    I agree to the{' '}
                    <Link href="/terms-of-service" className="font-bold underline hover:text-[#7530fb]" style={{ color: C.textDark }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy-policy" className="font-bold underline hover:text-[#7530fb]" style={{ color: C.textDark }}>
                      Privacy Policy
                    </Link>.
                  </span>
                </label>

                {/* Create Account CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl text-[14px] font-bold font-syne flex items-center justify-center transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-md cursor-pointer mt-2"
                  style={{ backgroundColor: C.dark, color: C.accent }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Create Free Workspace'
                  )}
                </button>

              </form>

              <p className="text-center text-[13px] mt-5" style={{ color: C.muted }}>
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-bold font-syne hover:underline ml-1"
                  style={{ color: C.primary }}
                >
                  Log In →
                </Link>
              </p>

            </div>
          </div>

          {/* Right Column: Platform Testimonial & Social Proof */}
          <div className="flex-[4] px-6 sm:px-10 py-10 flex flex-col justify-center" style={{ backgroundColor: C.dark }}>

            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 w-fit"
              style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}
            >
              <BadgeCheck size={14} style={{ color: C.accent }} />
              <span className="text-[11px] font-black uppercase font-syne tracking-wider" style={{ color: C.accent }}>
                TRUSTED BY 12,000+ SELLERS
              </span>
            </div>

            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} style={{ color: C.accent, fill: C.accent }} />
              ))}
            </div>

            <p className="text-[16px] sm:text-[17px] font-semibold leading-relaxed mb-6 text-white">
              &ldquo;Riazify transformed our entire eBay operation. Our dispute win rate jumped to 98%, and Cassini title scoring unlocked a 3x lift in organic impressions.&rdquo;
            </p>

            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border font-bold font-syne text-[12px]"
                style={{ backgroundColor: C.darkCard, borderColor: C.borderDark, color: C.accent }}
              >
                AT
              </div>
              <div>
                <p className="text-[13.5px] font-bold font-syne text-white">Alex Thompson</p>
                <p className="text-[11.5px]" style={{ color: C.textLight }}>Top-Rated PowerSeller ($2.4M GMV)</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <StatPill value="12K+" label="Sellers" />
              <StatPill value="$14M+" label="Protected" />
              <StatPill value="98.4%" label="Win Rate" />
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
