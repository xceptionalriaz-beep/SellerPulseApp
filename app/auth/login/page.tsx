'use client'

// app/auth/login/page.tsx
// Riazify Merchant Authentication — v2.0

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Shield, Eye, EyeOff, Mail, Lock, Star, BadgeCheck, ArrowLeft, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { logLogin } from '@/lib/login-history'
import { useToast } from '@/components/ui/AppToast'
import ForgotPasswordDialog from '@/components/ui/ForgotPasswordDialog'
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

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const supabase = createClient()

  const nextUrl = searchParams.get('next') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {}
    if (!email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleLogin() {
    if (!validate()) return
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })
      if (error) {
        toast.error(error.message)
        return
      }
      if (data.user) {
        await logLogin()
        toast.show('Welcome back to Riazify!')
        router.push(nextUrl)
        router.refresh()
      }
    } catch {
      toast.error('Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    try {
      toast.info('Redirecting to Google Authentication...')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${nextUrl}`,
        },
      })
      if (error) toast.error('Google Sign-In failed. Please try again.')
    } catch {
      toast.error('Google Sign-In failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg }} className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-10">
      {showForgot && (
        <ForgotPasswordDialog
          initialEmail={email}
          onClose={() => setShowForgot(false)}
        />
      )}

      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-[960px] mb-6">
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
        className="w-full max-w-[960px] rounded-3xl shadow-xl overflow-hidden border"
        style={{ backgroundColor: C.dark, borderColor: C.borderDark }}
      >
        <div className="flex flex-col lg:flex-row lg:min-h-[620px]">

          {/* Left Column: Form Panel */}
          <div className="flex-[5] p-3 sm:p-5">
            <div className="bg-white rounded-2xl p-6 sm:p-10 h-full flex flex-col justify-center border" style={{ borderColor: C.border }}>

              <div className="mb-6">
                <h1 className="text-[26px] sm:text-[28px] font-black font-syne tracking-tight" style={{ color: C.textDark }}>
                  Welcome back
                </h1>
                <p className="text-[13.5px] mt-1" style={{ color: C.muted }}>
                  Access your eBay intelligence workspace and order defense suite.
                </p>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full h-11 flex items-center justify-center gap-3 bg-white border rounded-xl shadow-2xs hover:bg-[#f8f7ff] transition-all duration-150 disabled:opacity-60 cursor-pointer"
                style={{ borderColor: C.borderInput }}
              >
                <GoogleLogo />
                <span className="text-[13.5px] font-bold font-syne" style={{ color: C.textDark }}>
                  {googleLoading ? 'Connecting...' : 'Continue with Google'}
                </span>
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
                <span className="text-[11px] font-bold font-syne uppercase tracking-wider" style={{ color: C.muted }}>
                  or continue with email
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
              </div>

              {/* Business Email Field */}
              <div className="mb-4">
                <label className="text-[12px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                  BUSINESS EMAIL
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="seller@store.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border text-[13.5px] outline-none transition-colors bg-white"
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

              {/* Password Field */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] font-bold font-syne" style={{ color: C.textDark }}>
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-[12px] font-bold font-syne hover:underline cursor-pointer"
                    style={{ color: C.primary }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border text-[13.5px] outline-none transition-colors bg-white"
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                    style={{ color: C.muted }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] font-medium mt-1" style={{ color: C.red }}>{errors.password}</p>}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2.5 mb-6 select-none cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                <div
                  className="w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: rememberMe ? C.primary : '#ffffff',
                    borderColor: rememberMe ? C.primary : C.borderInput,
                  }}
                >
                  {rememberMe && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-[12.5px] font-medium" style={{ color: C.muted }}>
                  Keep me logged in for 30 days
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-11 rounded-xl text-[14px] font-bold font-syne flex items-center justify-center transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-md cursor-pointer"
                style={{ backgroundColor: C.dark, color: C.accent }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sign In to Workspace'
                )}
              </button>

              <p className="text-center text-[13px] mt-6" style={{ color: C.muted }}>
                Don&apos;t have an account yet?{' '}
                <Link
                  href={`/auth/signup${nextUrl !== '/dashboard' ? `?next=${nextUrl}` : ''}`}
                  className="font-bold font-syne hover:underline ml-1"
                  style={{ color: C.primary }}
                >
                  Create Free Account →
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: C.bg }} />}>
      <LoginPageInner />
    </Suspense>
  )
}
