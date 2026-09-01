'use client'

// app/auth/reset-password/page.tsx
// Riazify Password Reset & Credential Update — v2.0

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Eye, EyeOff, CheckCircle2, XCircle, Check, Circle, ArrowLeft, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase'
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

// ── Password Strength Calculator ───────────────────────────────
function getStrength(pass: string): { value: number; color: string; label: string } {
  if (!pass) return { value: 0, color: '#94a3b8', label: '' }
  let score = 0
  if (pass.length >= 8) score++
  if (pass.length >= 12) score++
  if (/[A-Z]/.test(pass)) score++
  if (/[0-9]/.test(pass)) score++
  if (/[!@#$%^&*]/.test(pass)) score++

  if (score <= 1) return { value: 0.2, color: '#dc2626', label: 'Weak' }
  if (score <= 2) return { value: 0.4, color: '#f59e0b', label: 'Fair' }
  if (score <= 3) return { value: 0.6, color: '#f59e0b', label: 'Good' }
  if (score <= 4) return { value: 0.8, color: '#7530fb', label: 'Strong' }
  return { value: 1.0, color: '#b8fa33', label: 'Very Strong' }
}

// ── Password Tip Checklist Item ────────────────────────────────
function Tip({ text, met }: { text: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2 mt-1.5">
      {met ? (
        <CheckCircle2 size={13} className="shrink-0" style={{ color: '#16a34a' }} />
      ) : (
        <Circle size={13} className="shrink-0" style={{ color: '#94a3b8' }} />
      )}
      <span className={cn('text-[12px] font-medium', met ? 'text-[#16a34a]' : 'text-[#6b7280]')}>
        {text}
      </span>
    </div>
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()

  const [newPass, setNewPass] = useState('')
  const [confPass, setConfPass] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const strength = getStrength(newPass)
  const isMatch = newPass && confPass && newPass === confPass
  const isMismatch = newPass && confPass && newPass !== confPass

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newPass || !confPass) {
      toast.warning('Please complete all password fields')
      return
    }
    if (newPass !== confPass) {
      toast.error('Passwords do not match')
      return
    }
    if (newPass.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) {
        toast.error(error.message)
      } else {
        setIsDone(true)
      }
    } catch {
      toast.error('Something went wrong updating password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg }} className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">

      {/* Brand Icon Header */}
      <Link href="/" className="flex items-center gap-2 mb-6 group">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-md transition-transform group-hover:scale-105"
          style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
          <Shield size={24} style={{ color: C.accent }} />
        </div>
      </Link>

      <div className="w-full max-w-[440px]">

        {/* ── Success View ── */}
        {isDone ? (
          <div className="bg-white rounded-3xl border p-8 text-center shadow-lg" style={{ borderColor: C.border }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border"
              style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
              <CheckCircle2 size={34} style={{ color: C.primary }} />
            </div>

            <h1 className="text-[22px] font-black font-syne mb-2 tracking-tight" style={{ color: C.textDark }}>
              Password Updated!
            </h1>

            <p className="text-[13.5px] leading-relaxed mb-6" style={{ color: C.muted }}>
              Your account password has been updated securely. You may now sign in using your new credentials.
            </p>

            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="w-full h-11 rounded-xl text-[14px] font-bold font-syne flex items-center justify-center transition-transform hover:scale-[1.01] shadow-md cursor-pointer"
              style={{ backgroundColor: C.dark, color: C.accent }}
            >
              Go to Login →
            </button>
          </div>
        ) : (

          /* ── Reset Form View ── */
          <div className="bg-white rounded-3xl border p-7 sm:p-8 shadow-lg" style={{ borderColor: C.border }}>

            <div className="mb-6">
              <h1 className="text-[22px] font-black font-syne tracking-tight" style={{ color: C.textDark }}>
                Set New Password
              </h1>
              <p className="text-[13px] mt-1" style={{ color: C.muted }}>
                Choose a secure password for your Riazify workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* New Password Field */}
              <div>
                <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                  NEW PASSWORD *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border text-[13.5px] outline-none transition-colors bg-white"
                    style={{ color: C.textDark, borderColor: C.borderInput }}
                    onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
                    onBlur={e => { e.currentTarget.style.borderColor = C.borderInput }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: C.muted }}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPass && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-[#ede9fe] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${strength.value * 100}%`,
                          backgroundColor: strength.color,
                        }}
                      />
                    </div>
                    <span className="text-[10.5px] font-bold font-syne uppercase" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="text-[11.5px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
                  CONFIRM NEW PASSWORD *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                  <input
                    type={showConf ? 'text' : 'password'}
                    value={confPass}
                    onChange={(e) => setConfPass(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border text-[13.5px] outline-none transition-colors bg-white"
                    style={{ color: C.textDark, borderColor: isMismatch ? C.red : C.borderInput }}
                    onFocus={e => { e.currentTarget.style.borderColor = isMismatch ? C.red : C.primary }}
                    onBlur={e => { e.currentTarget.style.borderColor = isMismatch ? C.red : C.borderInput }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConf(!showConf)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: C.muted }}
                  >
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Match Indicator */}
                {confPass && newPass && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {isMatch ? (
                      <>
                        <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
                        <span className="text-[11.5px] font-bold text-[#16a34a]">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={13} style={{ color: C.red }} />
                        <span className="text-[11.5px] font-bold" style={{ color: C.red }}>Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Password Requirements Card */}
              <div className="p-3.5 rounded-xl border bg-[#f8f7ff]" style={{ borderColor: C.border }}>
                <p className="text-[11px] font-black uppercase font-syne tracking-wider mb-1" style={{ color: C.primary }}>
                  PASSWORD REQUIREMENTS:
                </p>
                <Tip text="At least 8 characters" met={newPass.length >= 8} />
                <Tip text="One uppercase letter (A-Z)" met={/[A-Z]/.test(newPass)} />
                <Tip text="One numeric digit (0-9)" met={/[0-9]/.test(newPass)} />
                <Tip text="One special symbol (!@#$%^&*)" met={/[!@#$%^&*]/.test(newPass)} />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-[14px] font-bold font-syne flex items-center justify-center transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-md cursor-pointer mt-2"
                style={{ backgroundColor: C.dark, color: C.accent }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Update Password'
                )}
              </button>

              <div className="text-center mt-2">
                <Link
                  href="/auth/login"
                  className="text-[12.5px] font-bold font-syne hover:underline"
                  style={{ color: C.muted }}
                >
                  ← Return to Login
                </Link>
              </div>

            </form>

          </div>
        )}

      </div>
    </div>
  )
}
