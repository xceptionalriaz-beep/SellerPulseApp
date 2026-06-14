'use client'

export const dynamic = 'force-dynamic'

// app/auth/login/page.tsx — updated to use ForgotPasswordDialog
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Shield, Eye, EyeOff, Mail, Lock, Star, BadgeCheck, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { logLogin } from '@/lib/login-history'
import { useToast } from '@/components/ui/AppToast'
import ForgotPasswordDialog from '@/components/ui/ForgotPasswordDialog'
import { cn } from '@/lib/utils'

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

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center px-3.5 py-2 rounded-[10px] border border-white/10 bg-white/5">
      <span className="text-lime text-base font-extrabold leading-tight">{value}</span>
      <span className="text-white/50 text-[10px] leading-tight">{label}</span>
    </div>
  )
}

function LoginPageInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const toast        = useToast()
  const supabase     = createClient()

  const nextUrl = searchParams.get('next') ?? '/dashboard'

  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPassword,  setShowPassword]  = useState(false)
  const [rememberMe,    setRememberMe]    = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showForgot,    setShowForgot]    = useState(false)
  const [errors,        setErrors]        = useState<{ email?: string; password?: string }>({})

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {}
    if (!email.trim())                                         newErrors.email    = 'Email is required'
    else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email.trim())) newErrors.email    = 'Enter a valid email address'
    if (!password.trim())                                      newErrors.password = 'Password is required'
    else if (password.length < 6)                              newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleLogin() {
    if (!validate()) return
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(), password: password.trim(),
      })
      if (error) { toast.error(error.message); return }
      if (data.user) {
        await logLogin()
        toast.show('Welcome back!')
        router.push(nextUrl)
        router.refresh()
      }
    } catch {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    try {
      toast.info('Opening Google Sign-In...')
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-5 py-10">
      {showForgot && (
        <ForgotPasswordDialog
          initialEmail={email}
          onClose={() => setShowForgot(false)}
        />
      )}

      <div className="flex items-center justify-between w-full max-w-[1000px] mb-8">
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

      <div className="w-full max-w-[1000px] rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden"
           style={{ backgroundColor: '#131B2F' }}>
        <div className="flex flex-col lg:flex-row lg:min-h-[660px]">

          {/* Left: Form */}
          <div className="flex-[5] p-6">
            <div className="bg-white rounded-[24px] px-10 py-9 h-full flex flex-col justify-center">
              <h1 className="text-[28px] font-bold text-[#1E293B] leading-tight">Welcome back</h1>
              <p className="text-[#64748B] text-sm mt-1.5 mb-7">Log in to your Riazify account.</p>

              <button onClick={handleGoogleLogin} disabled={googleLoading}
                className="w-full h-[50px] flex items-center justify-center gap-2.5 bg-white border border-[#E2E8F0] rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-150 disabled:opacity-60">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center"><GoogleLogo /></div>
                <span className="text-sm font-semibold text-[#1E293B]">{googleLoading ? 'Opening...' : 'Continue with Google'}</span>
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#E2E8F0]" />
                <span className="text-xs text-gray-400">or continue with email</span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>

              <label className="text-[13px] font-bold text-[#1E293B] mb-1.5 block">Business Email</label>
              <div className="relative mb-4">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="email@example.com"
                  className={cn('w-full h-[50px] pl-10 pr-4 rounded-xl border bg-[#F8FAFC] text-sm text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all',
                    errors.email ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20' : 'border-[#E2E8F0] focus:border-lime focus:ring-2 focus:ring-lime/20')} />
                {errors.email && <p className="text-[11px] text-[#EF4444] mt-1">{errors.email}</p>}
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-bold text-[#1E293B]">Password</label>
                <button onClick={() => setShowForgot(true)}
                  className="text-[13px] font-bold text-black hover:text-lime transition-colors">
                  Forgot Password?
                </button>
              </div>
              <div className="relative mb-3">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  className={cn('w-full h-[50px] pl-10 pr-10 rounded-xl border bg-[#F8FAFC] text-sm text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all',
                    errors.password ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20' : 'border-[#E2E8F0] focus:border-lime focus:ring-2 focus:ring-lime/20')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && <p className="text-[11px] text-[#EF4444] mt-1">{errors.password}</p>}
              </div>

              <label className="flex items-center gap-2 cursor-pointer mb-6">
                <div className={cn('w-5 h-5 rounded border-[1.5px] border-lime flex items-center justify-center transition-colors cursor-pointer', rememberMe ? 'bg-lime' : 'bg-white')}
                  onClick={() => setRememberMe(!rememberMe)}>
                  {rememberMe && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4L4 7L10 1" stroke="#0A0D08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="text-[13px] text-[#64748B]">Remember me</span>
              </label>

              <button onClick={handleLogin} disabled={loading}
                className="w-full h-[50px] bg-lime text-dark font-bold text-base rounded-xl hover:shadow-lime transition-all duration-200 disabled:opacity-50 flex items-center justify-center">
                {loading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : 'Log In'}
              </button>

              <p className="text-center text-sm text-[#64748B] mt-6">
                Don&apos;t have an account?{' '}
                <Link href={`/auth/signup${nextUrl !== '/dashboard' ? `?next=${nextUrl}` : ''}`}
                  className="font-bold text-black hover:text-lime transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

          {/* Right: Testimonial */}
          <div className="flex-[4] px-[50px] py-10 flex flex-col justify-center">
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
              <StatPill value="10K+" label="Sellers" />
              <StatPill value="$2M+" label="Protected" />
              <StatPill value="98%"  label="Win Rate" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
export default function LoginPage() {
  return <Suspense><LoginPageInner /></Suspense>
}