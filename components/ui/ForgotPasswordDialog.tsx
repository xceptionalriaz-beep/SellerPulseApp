'use client'
// components/ui/ForgotPasswordDialog.tsx
// ═══════════════════════════════════════════════════════════════
// Converted from: lib/widgets/forgot_password_dialog.dart
//
// What the Dart version had:
//   ✅ Modal dialog — white, rounded-[24px], max-width 450px
//   ✅ Lock icon + "Reset Password" heading
//   ✅ Description text
//   ✅ Email field — pre-filled with email from login page
//   ✅ Lime "Send Reset Link" button with loading spinner
//   ✅ Cancel button
//   ✅ Success toast (lime) on send
//   ✅ Error toast (red) on failure
//   ✅ Closes dialog on success
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { KeyRound, Mail, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { sendResetPasswordEmail } from '@/lib/email'
import { useToast } from '@/components/ui/AppToast'

interface ForgotPasswordDialogProps {
  initialEmail?: string   // pre-filled from login page (same as Dart)
  onClose: () => void
}

export default function ForgotPasswordDialog({
  initialEmail = '',
  onClose,
}: ForgotPasswordDialogProps) {
  const toast    = useToast()
  const supabase = createClient()

  const [email,    setEmail]    = useState(initialEmail)
  const [loading,  setLoading]  = useState(false)

  async function handleSend() {
    const trimmed = email.trim()
    if (!trimmed) {
      toast.error('Please enter your email.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      // Send branded reset email via Resend
      try {
        await sendResetPasswordEmail({
          to:       trimmed,
          userName: 'Seller',
          resetUrl: `${window.location.origin}/auth/reset-password`,
        })
      } catch { /* non-critical */ }

      // Close dialog + show success toast (same as Dart)
      onClose()
      toast.show('Password reset link sent! Check your inbox.')

    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // ── Backdrop ──────────────────────────────────────────────
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ── Dialog Box ── */}
      <div className="bg-white rounded-[24px] w-full max-w-[450px] p-[30px] shadow-panel mx-4 animate-slide-down">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <KeyRound size={28} className="text-dark" />
            <h2 className="text-[24px] font-bold text-[#1E293B]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Reset Password
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-dark transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <p className="text-[#64748B] text-sm leading-relaxed mb-7">
          Enter your business email address below and we will send you a
          secure link to reset your password.
        </p>

        {/* Email Field */}
        <label className="text-[13px] font-bold text-[#1E293B] block mb-1.5">
          Business Email
        </label>
        <div className="relative mb-7">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="email@example.com"
            className="w-full h-[50px] pl-10 pr-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-sm text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full h-[50px] bg-lime text-dark font-bold text-base rounded-xl hover:shadow-lime transition-all duration-200 disabled:opacity-50 flex items-center justify-center mb-4"
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : 'Send Reset Link'}
        </button>

        {/* Cancel */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="text-[#64748B] font-bold text-sm hover:text-dark transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}