'use client'
// app/auth/reset-password/page.tsx
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Converted from: lib/pages/auth/reset_password_page.dart
//
// What the Dart version had:
//   âœ… Shield logo top center
//   âœ… New password + confirm password fields with show/hide
//   âœ… Password strength bar (Weak/Fair/Good/Strong/Very Strong)
//   âœ… Password match indicator (green check / red cross)
//   âœ… Password tips checklist (8 chars, uppercase, number, special)
//   âœ… Loading button (dark #0F172A)
//   âœ… Success view â€” green check, "Password Updated!", go to app
//   âœ… Animated switch between form and success
//   âœ… Validation (empty, mismatch, min 8 chars)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, CheckCircle, XCircle, Check, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/AppToast'
import { cn } from '@/lib/utils'

// â”€â”€ Password strength calculator (mirrors Dart exactly) â”€â”€â”€â”€â”€â”€â”€â”€
function getStrength(pass: string): { value: number; color: string; label: string } {
  if (!pass) return { value: 0, color: '#94A3B8', label: '' }
  let score = 0
  if (pass.length >= 8)                    score++
  if (pass.length >= 12)                   score++
  if (/[A-Z]/.test(pass))                  score++
  if (/[0-9]/.test(pass))                  score++
  if (/[!@#$%^&*]/.test(pass))             score++

  if (score <= 1) return { value: 0.2, color: '#FF4D6A', label: 'Weak'      }
  if (score <= 2) return { value: 0.4, color: '#FFB800', label: 'Fair'      }
  if (score <= 3) return { value: 0.6, color: '#FFB800', label: 'Good'      }
  if (score <= 4) return { value: 0.8, color: '#00C48C', label: 'Strong'    }
  return               { value: 1.0, color: '#00C48C', label: 'Very Strong' }
}

// â”€â”€ Password Tip Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Tip({ text, met }: { text: string; met: boolean }) {
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {met
        ? <Check size={12} className="text-[#00C48C] shrink-0" />
        : <Circle size={12} className="text-[#94A3B8] shrink-0" />
      }
      <span className={cn('text-[11px]', met ? 'text-[#00C48C]' : 'text-[#94A3B8]')}>
        {text}
      </span>
    </div>
  )
}

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ResetPasswordPage() {
  const router   = useRouter()
  const toast    = useToast()
  const supabase = createClient()

  const [newPass,     setNewPass]     = useState('')
  const [confPass,    setConfPass]    = useState('')
  const [showNew,     setShowNew]     = useState(false)
  const [showConf,    setShowConf]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [isDone,      setIsDone]      = useState(false)

  const strength  = getStrength(newPass)
  const isMatch   = newPass && confPass && newPass === confPass
  const isMismatch = newPass && confPass && newPass !== confPass

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleSubmit() {
    if (!newPass || !confPass) {
      toast.warning('Please fill all fields')
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
    } catch (e) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // â”€â”€ Password field shared style â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function PassField({
    value, onChange, show, onToggle, placeholder
  }: {
    value: string
    onChange: (v: string) => void
    show: boolean
    onToggle: () => void
    placeholder: string
  }) {
    return (
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-[48px] px-4 pr-10 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 transition-all"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col items-center justify-center p-6">

      {/* Shield Logo */}
      <div className="w-16 h-16 bg-[#0F172A] rounded-[16px] flex items-center justify-center mb-6">
        <Shield size={32} className="text-lime" />
      </div>

      <div className="w-full max-w-[440px]">

        {/* â”€â”€ SUCCESS VIEW â”€â”€ */}
        {isDone ? (
          <div className="bg-white rounded-[20px] shadow-[0_8px_20px_rgba(0,0,0,0.06)] p-7 flex flex-col items-center text-center animate-fade-in">
            <div className="w-[72px] h-[72px] rounded-full bg-[#00C48C]/10 flex items-center justify-center mb-5">
              <CheckCircle size={40} className="text-[#00C48C]" />
            </div>
            <h1 className="text-[22px] font-bold text-[#0F172A] mb-2"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Password Updated!
            </h1>
            <p className="text-sm text-[#64748B] leading-relaxed mb-7">
              Your password has been changed successfully.{' '}
              You can now sign in with your new password.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full h-[50px] bg-[#0F172A] text-white font-bold text-[15px] rounded-xl hover:bg-dark/90 transition-all"
            >
              Go to Login
            </button>
          </div>

        ) : (

          /* â”€â”€ FORM VIEW â”€â”€ */
          <div className="bg-white rounded-[20px] shadow-[0_8px_20px_rgba(0,0,0,0.06)] p-7">

            <h1 className="text-[24px] font-bold text-[#0F172A] mb-2"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Set New Password
            </h1>
            <p className="text-sm text-[#64748B] mb-7">
              Choose a strong password for your Riazify account.
            </p>

            {/* New Password */}
            <label className="text-[12px] font-semibold text-[#475569] block mb-1.5">
              New Password
            </label>
            <PassField
              value={newPass}
              onChange={setNewPass}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              placeholder="Enter new password"
            />

            {/* Strength Bar */}
            {newPass && (
              <div className="flex items-center gap-2.5 mt-2.5">
                <div className="flex-1 h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${strength.value * 100}%`, backgroundColor: strength.color }}
                  />
                </div>
                <span className="text-[11px] font-semibold" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}

            {/* Confirm Password */}
            <label className="text-[12px] font-semibold text-[#475569] block mt-4 mb-1.5">
              Confirm New Password
            </label>
            <PassField
              value={confPass}
              onChange={setConfPass}
              show={showConf}
              onToggle={() => setShowConf(!showConf)}
              placeholder="Confirm new password"
            />

            {/* Match Indicator */}
            {confPass && newPass && (
              <div className="flex items-center gap-1.5 mt-2">
                {isMatch
                  ? <><CheckCircle size={14} className="text-[#00C48C]" /><span className="text-[11px] text-[#00C48C] font-medium">Passwords match</span></>
                  : <><XCircle size={14} className="text-[#FF4D6A]" /><span className="text-[11px] text-[#FF4D6A] font-medium">Passwords do not match</span></>
                }
              </div>
            )}

            {/* Password Tips */}
            <div className="mt-6 p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
              <p className="text-[11px] font-bold text-[#64748B] mb-1">Password Tips:</p>
              <Tip text="At least 8 characters"         met={newPass.length >= 8} />
              <Tip text="One uppercase letter"           met={/[A-Z]/.test(newPass)} />
              <Tip text="One number"                     met={/[0-9]/.test(newPass)} />
              <Tip text="One special character (!@#$)"   met={/[!@#$%^&*]/.test(newPass)} />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-[50px] mt-6 bg-[#0F172A] text-white font-bold text-[15px] rounded-xl hover:bg-dark/90 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : 'Set New Password'}
            </button>

          </div>
        )}
      </div>
    </div>
  )
}
