'use client'
'use client'
// app/dashboard/profile/tabs/SecurityTab.tsx
// Converted from: lib/user_profile/tabs/security_tab.dart
// Sections: 1. Security Score  2. Change Password  3. Two-Factor Auth
//           4. Login History  5. Active Sessions  6. Danger Zone

import { useState, useEffect, useCallback } from 'react'
import {
  Lock, Shield, Smartphone, History, Monitor, LogOut,
  AlertTriangle, CheckCircle, Eye, EyeOff, RefreshCw,
  QrCode, Laptop, Tablet, Mail, BadgeCheck, Phone,
  MapPin, Computer, KeyRound,
} from 'lucide-react'
import { PageSpinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/AppToast'
import { cn } from '@/lib/utils'

// ── Color tokens (exact match to Dart _C) ──────────────────────
const C = {
  surface: '#FFFFFF', navy: '#0F172A', txt1: '#0F172A',
  txt2: '#64748B', txt3: '#94A3B8', border: '#E2E8F0',
  green: '#00C48C', orange: '#FFB800', red: '#FF4D6A',
  blue: '#1D70F5', accent: '#8FFF00',
}

// ── Card (matches Dart _Card) ───────────────────────────────────
function Card({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div className="w-full p-5 rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] border"
         style={{ borderColor: danger ? C.red + '4D' : C.border }}>
      {children}
    </div>
  )
}

// ── Card title (matches Dart _cardTitle) ────────────────────────
function CardTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="p-2 rounded-lg" style={{ backgroundColor: C.navy + '0F' }}>
        <Icon size={18} style={{ color: C.navy }} />
      </div>
      <span className="text-[15px] font-bold" style={{ color: C.txt1 }}>{title}</span>
    </div>
  )
}

// ── Benefit row (matches Dart _benefit) ────────────────────────
function Benefit({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={15} style={{ color: C.green }} />
      <span className="text-[12px]" style={{ color: C.txt2 }}>{text}</span>
    </div>
  )
}

// ── Step indicator (matches Dart _step in scanning view) ────────
function Step({ num, label, active }: { num: string; label: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
           style={{ backgroundColor: active ? C.navy : C.border, color: active ? '#fff' : C.txt3 }}>
        {num}
      </div>
      <span className="text-[9px] font-bold" style={{ color: active ? C.navy : C.txt3 }}>
        {label}
      </span>
    </div>
  )
}

// ── Pass field ──────────────────────────────────────────────────
function PassField({ label, value, onChange, show, onToggle, onChanged }: {
  label: string; value: string; onChange: (v: string) => void
  show: boolean; onToggle: () => void; onChanged?: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold" style={{ color: '#475569' }}>{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value}
          onChange={e => { onChange(e.target.value); onChanged?.() }}
          placeholder="••••••••"
          className="w-full h-[46px] px-3.5 pr-10 rounded-lg border bg-[#F8FAFC] text-[13px] outline-none transition-all"
          style={{ borderColor: C.border, color: C.txt1 }}
          onFocus={e => (e.target as HTMLInputElement).style.borderColor = C.navy}
          onBlur={e => (e.target as HTMLInputElement).style.borderColor = C.border} />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.txt3 }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

// ── Types ───────────────────────────────────────────────────────
interface SecurityCheck { label: string; passed: boolean; pts: string; icon: React.ElementType }
interface LoginRecord { id?: string; device_info?: string; ip_address?: string; login_at?: string; location_name?: string }

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function SecurityTab() {
  const supabase = createClient()
  const toast    = useToast()

  const [isLoading,    setIsLoading]    = useState(true)
  const [isSavingPass, setIsSavingPass] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([])
  const [secScore,     setSecScore]     = useState(0)
  const [checks,       setChecks]       = useState<SecurityCheck[]>([])
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [hasPassword,     setHasPassword]     = useState(true)

  // Password fields
  const [currPass, setCurrPass] = useState('')
  const [newPass,  setNewPass]  = useState('')
  const [confPass, setConfPass] = useState('')
  const [showCurr, setShowCurr] = useState(false)
  const [showNew,  setShowNew]  = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [passChanged, setPassChanged] = useState(0) // trigger re-render for strength

  // 2FA
  const [twoFAStep,    setTwoFAStep]    = useState<'idle'|'scanning'|'enabled'>('idle')
  const [is2FALoading, setIs2FALoading] = useState(false)
  const [qrCodeUrl,    setQrCodeUrl]    = useState('')
  const [totpSecret,   setTotpSecret]   = useState('')
  const [factorId,     setFactorId]     = useState('')
  const [otpCode,      setOtpCode]      = useState('')

  // Dialogs
  const [showDisable2FA,    setShowDisable2FA]    = useState(false)
  const [showSignOutAll,    setShowSignOutAll]     = useState(false)
  const [showDeleteAcct,    setShowDeleteAcct]    = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Password strength (mirrors Dart _passStrength)
  function passStrength(pass: string) {
    if (!pass) return { value: 0, color: C.border, label: '' }
    let score = 0
    if (pass.length >= 8)               score++
    if (pass.length >= 12)              score++
    if (/[A-Z]/.test(pass))            score++
    if (/[0-9]/.test(pass))            score++
    if (/[!@#$%^&*]/.test(pass))       score++
    if (score <= 1) return { value: 0.2, color: C.red,    label: 'Weak'       }
    if (score <= 2) return { value: 0.4, color: C.orange, label: 'Fair'       }
    if (score <= 3) return { value: 0.6, color: C.orange, label: 'Good'       }
    if (score <= 4) return { value: 0.8, color: C.green,  label: 'Strong'     }
    return               { value: 1.0, color: C.green,  label: 'Very Strong' }
  }

  const strength = passStrength(newPass)

  // ── Time ago helper (mirrors Dart timeStr logic) ────────────
  function fmtTime(iso?: string): string {
    if (!iso) return '—'
    try {
      const dt   = new Date(iso)
      const diff = Date.now() - dt.getTime()
      const m    = Math.floor(diff / 60000)
      if (m < 1)   return 'Just now'
      if (m < 60)  return `${m}m ago`
      const h = Math.floor(m / 60)
      if (h < 24)  return `${h}h ago`
      const d = Math.floor(h / 24)
      if (d === 1) return 'Yesterday'
      if (d < 7)   return `${d}d ago`
      return `${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`
    } catch { return '—' }
  }

  // ── Load all data ────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const emailVerified = !!user.email_confirmed_at
      const hasPwd = (user.identities || []).some((i: any) => i.provider === 'email')
      setIsEmailVerified(emailVerified)
      setHasPassword(hasPwd)

      // Login history — try login_at column (matches Dart)
      const { data: history } = await supabase
        .from('login_history').select('*').eq('user_id', user.id)
        .order('login_at', { ascending: false }).limit(8)
      setLoginHistory((history || []) as LoginRecord[])

      // Check 2FA
      try {
        const { data: factors } = await (supabase.auth as any).mfa.listFactors()
        const totp = (factors?.totp || []) as any[]
        const verified   = totp.filter((f: any) => f.status === 'verified')
        const unverified = totp.filter((f: any) => f.status !== 'verified')
        // Clean up orphan unverified factors (mirrors Dart)
        for (const orphan of unverified) {
          try { await (supabase.auth as any).mfa.unenroll(orphan.id) } catch {}
        }
        if (verified.length > 0) {
          setTwoFAStep('enabled'); setFactorId(verified[0].id)
        } else {
          setTwoFAStep('idle')
        }
      } catch {}

      // Build security score (mirrors Dart _calculateSecurityScore)
      const newChecks: SecurityCheck[] = []
      let score = 0
      if (emailVerified) { score += 30; newChecks.push({ label: 'Email Verified',          passed: true,  pts: '+30pts',         icon: Mail      }) }
      else               {               newChecks.push({ label: 'Email Not Verified',       passed: false, pts: '-30pts',         icon: Mail      }) }
      if (hasPwd)        { score += 25; newChecks.push({ label: 'Password Set',             passed: true,  pts: '+25pts',         icon: Lock      }) }
      else               {               newChecks.push({ label: 'No Password Set',          passed: false, pts: '-25pts',         icon: Lock      }) }
      score += 20;        newChecks.push({ label: 'Pro Plan Active',                         passed: true,  pts: '+20pts',         icon: BadgeCheck })
      if ((history || []).length > 0) { score += 15; newChecks.push({ label: 'Account Activity Normal', passed: true, pts: '+15pts', icon: History }) }
      newChecks.push({ label: '2FA Not Enabled', passed: false, pts: '+10pts if enabled', icon: Phone })
      setSecScore(Math.min(100, Math.max(0, score)))
      setChecks(newChecks)

    } catch (e) { console.error('Security load error:', e) }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Change password (mirrors Dart _changePassword) ──────────
  async function handleChangePassword() {
    if (!currPass || !newPass || !confPass) { toast.warning('Please fill all fields'); return }
    if (newPass !== confPass)              { toast.error('New passwords do not match'); return }
    if (newPass.length < 8)               { toast.error('Password must be at least 8 characters'); return }
    if (newPass === currPass)             { toast.warning('New password must be different from current'); return }
    setIsSavingPass(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) { toast.error('Could not get account email'); return }
      // Verify current password by re-signing in (mirrors Dart approach)
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: currPass })
      if (signInErr) {
        const msg = signInErr.message.toLowerCase()
        if (msg.includes('invalid') || msg.includes('wrong') || msg.includes('credentials'))
          toast.error('Current password is incorrect')
        else toast.error(`Could not verify password: ${signInErr.message}`)
        return
      }
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) { toast.error(error.message); return }
      setCurrPass(''); setNewPass(''); setConfPass(''); setPassChanged(0)
      toast.show('✅ Password updated successfully!')
    } catch (e: any) { toast.error(e.message || 'Error updating password') }
    finally { setIsSavingPass(false) }
  }

  // ── Forgot password (mirrors Dart _sendPasswordReset) ───────
  async function handleForgotPassword() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { toast.error('No email found on your account'); return }
    try {
      await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`
      })
      toast.show(`📧 Reset link sent to ${user.email}! Check your inbox.`)
    } catch (e: any) { toast.error(e.message) }
  }

  // ── 2FA: Start enrollment ────────────────────────────────────
  async function handle2FAEnable() {
    setIs2FALoading(true); setTwoFAStep('scanning')
    try {
      const { data, error } = await (supabase.auth as any).mfa.enroll({
        factorType: 'totp', issuer: 'SellerPulse', friendlyName: 'SellerPulse Authenticator'
      })
      if (error) throw error
      if (!data?.id) throw new Error('Could not start 2FA setup')
      setQrCodeUrl(data?.totp?.qr_code || '')
      setTotpSecret(data?.totp?.secret || '')
      setFactorId(data.id)
    } catch (e: any) {
      const msg = (e.message || '').toLowerCase()
      if (msg.includes('already') || msg.includes('enrolled')) {
        // Clean up orphan factors (mirrors Dart)
        try {
          const { data: factors } = await (supabase.auth as any).mfa.listFactors()
          for (const f of factors?.totp || []) {
            if (f.status !== 'verified') await (supabase.auth as any).mfa.unenroll(f.id)
          }
          toast.show('Ready! Please click Enable 2FA again.')
        } catch {}
      } else { toast.error(e.message || 'Could not start 2FA setup') }
      setTwoFAStep('idle')
    } finally { setIs2FALoading(false) }
  }

  // ── 2FA: Verify ──────────────────────────────────────────────
  async function handle2FAVerify() {
    const code = otpCode.trim().replace(/\s/g, '')
    if (code.length !== 6 || isNaN(Number(code))) { toast.warning('Enter the 6-digit code from your authenticator app'); return }
    setIs2FALoading(true)
    try {
      const { data: challenge } = await (supabase.auth as any).mfa.challenge({ factorId })
      await (supabase.auth as any).mfa.verify({ factorId, challengeId: challenge.id, code })
      setTwoFAStep('enabled'); setOtpCode('')
      toast.show('🔐 2FA enabled successfully!')
    } catch { toast.error('Invalid code — try again') }
    finally { setIs2FALoading(false) }
  }

  // ── 2FA: Disable ─────────────────────────────────────────────
  async function handle2FADisable() {
    setIs2FALoading(true); setShowDisable2FA(false)
    try {
      await (supabase.auth as any).mfa.unenroll(factorId)
      setTwoFAStep('idle'); setFactorId(''); setQrCodeUrl(''); setTotpSecret('')
      toast.warning('2FA has been disabled')
    } catch (e: any) { toast.error(e.message) }
    finally { setIs2FALoading(false) }
  }

  // ── Sign out all sessions ────────────────────────────────────
  async function handleSignOutAll() {
    setIsSigningOut(true); setShowSignOutAll(false)
    try {
      await supabase.auth.signOut()
      window.location.reload()
    } catch { setIsSigningOut(false) }
  }

  // ── Delete account ───────────────────────────────────────────
  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') { toast.error('You must type DELETE exactly to confirm'); return }
    setShowDeleteAcct(false)
    try {
      await supabase.auth.signOut()
      toast.show('Account deleted. Goodbye!')
    } catch (e: any) { toast.error(e.message) }
  }

  const scoreColor = secScore >= 80 ? C.green : secScore >= 60 ? C.orange : C.red
  const scoreLabel = secScore >= 80 ? 'Strong' : secScore >= 60 ? 'Good' : 'Needs Attention'

  if (isLoading) return (
    <PageSpinner />
  )

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold" style={{ color: C.txt1, fontFamily: 'var(--font-space-grotesk)' }}>Security</h1>
        <p className="text-[14px] mt-1.5" style={{ color: C.txt2 }}>Manage your password, sessions and account security.</p>
      </div>

      {/* ── 1. SECURITY SCORE ── */}
      <Card>
        <div className="flex items-center gap-5 mb-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke={C.border} strokeWidth="7" />
              <circle cx="40" cy="40" r="32" fill="none" stroke={scoreColor} strokeWidth="7"
                strokeDasharray={`${(secScore/100)*201} 201`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[22px] font-extrabold leading-none" style={{ color: scoreColor, fontFamily: 'var(--font-space-grotesk)' }}>{secScore}</span>
              <span className="text-[9px]" style={{ color: C.txt3 }}>/100</span>
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold mb-1.5" style={{ color: C.txt2 }}>Security Score</p>
            <span className="px-3 py-1 rounded-full text-[13px] font-bold"
                  style={{ backgroundColor: scoreColor + '1A', color: scoreColor }}>{scoreLabel}</span>
          </div>
        </div>
        <div className="border-t pt-4" style={{ borderColor: C.border }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {checks.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                {c.passed ? <CheckCircle size={15} style={{ color: C.green }} /> : <AlertTriangle size={15} style={{ color: C.orange }} />}
                <c.icon size={13} style={{ color: C.txt3 }} />
                <span className="flex-1 text-[12px]" style={{ color: c.passed ? C.txt2 : C.txt1, fontWeight: c.passed ? 400 : 600 }}>{c.label}</span>
                <span className="text-[10px] font-bold" style={{ color: c.passed ? C.green : C.orange }}>{c.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── 2+3. Password + 2FA side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Change Password */}
        <Card>
          <CardTitle icon={Lock} title="Change Password" />
          <div className="space-y-3">
            <PassField label="Current Password"     value={currPass} onChange={setCurrPass} show={showCurr} onToggle={() => setShowCurr(!showCurr)} />
            <div className="flex justify-end">
              <button onClick={handleForgotPassword} className="text-[11px] font-semibold underline" style={{ color: C.blue }}>
                Forgot current password?
              </button>
            </div>
            <PassField label="New Password"         value={newPass}  onChange={setNewPass}  show={showNew}  onToggle={() => setShowNew(!showNew)}  onChanged={() => setPassChanged(p => p+1)} />
            <PassField label="Confirm New Password" value={confPass} onChange={setConfPass} show={showConf} onToggle={() => setShowConf(!showConf)} />
            {newPass && (
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: C.border }}>
                  <div className="h-full rounded-full transition-all duration-300"
                       style={{ width: `${strength.value * 100}%`, backgroundColor: strength.color }} />
                </div>
                <span className="text-[11px] font-semibold" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>
          <button onClick={handleChangePassword} disabled={isSavingPass}
            className="w-full mt-5 h-11 rounded-[10px] text-white text-[13px] font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: C.navy }}>
            {isSavingPass && <RefreshCw size={14} className="animate-spin" />}
            Update Password
          </button>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          {twoFAStep === 'enabled' ? (
            /* 2FA ENABLED STATE */
            <div key="enabled">
              <CardTitle icon={BadgeCheck} title="Two-Factor Authentication" />
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl border mb-4"
                   style={{ backgroundColor: C.green + '14', borderColor: C.green + '4D' }}>
                <CheckCircle size={18} style={{ color: C.green }} />
                <div>
                  <p className="text-[13px] font-bold" style={{ color: C.green }}>2FA is Active!</p>
                  <p className="text-[11px]" style={{ color: C.green }}>Your account is protected with two-factor authentication.</p>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                <Benefit icon={Shield}     text="Password theft protection active" />
                <Benefit icon={Smartphone} text="Authenticator app configured" />
                <Benefit icon={Lock}       text="Extra verification on every login" />
              </div>
              <button onClick={() => setShowDisable2FA(true)} disabled={is2FALoading}
                className="w-full h-11 rounded-[10px] border text-[13px] font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ borderColor: C.red + '66', color: C.red }}>
                Disable 2FA
              </button>
            </div>
          ) : twoFAStep === 'scanning' ? (
            /* 2FA SCANNING STATE */
            <div key="scanning">
              <div className="flex items-center justify-between mb-4">
                <CardTitle icon={QrCode} title="Scan QR Code" />
                <button onClick={() => { setTwoFAStep('idle'); setQrCodeUrl('') }}
                  className="text-[12px]" style={{ color: C.txt2 }}>Cancel</button>
              </div>
              {/* Step indicators (mirrors Dart _step widget) */}
              <div className="flex items-center gap-2 mb-5">
                <Step num="1" label="Scan QR"    active={true}  />
                <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
                <Step num="2" label="Enter Code" active={false} />
                <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
                <Step num="3" label="Done"       active={false} />
              </div>
              <p className="text-[13px] mb-4" style={{ color: C.txt2 }}>Open your authenticator app and scan this QR code:</p>
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-2xl border-[3px] bg-white" style={{ borderColor: C.navy }}>
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-[200px] h-[200px]" />
                  ) : (
                    <div className="w-[200px] h-[200px] flex flex-col items-center justify-center gap-2">
                      <QrCode size={80} className="text-gray-200" />
                      <p className="text-[12px] text-center" style={{ color: C.txt3 }}>Use manual code below</p>
                    </div>
                  )}
                </div>
              </div>
              {totpSecret && (
                <div className="p-3 rounded-lg mb-3 text-center" style={{ backgroundColor: '#F8FAFC', border: `1px solid ${C.border}` }}>
                  <p className="text-[10px] mb-1" style={{ color: C.txt3 }}>Manual entry code:</p>
                  <p className="text-[13px] font-bold tracking-widest select-all" style={{ color: C.navy, fontFamily: 'monospace' }}>{totpSecret}</p>
                </div>
              )}
              <p className="text-[13px] mb-2" style={{ color: C.txt2 }}>Enter the 6-digit code from your authenticator app:</p>
              <input type="number" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="000000" maxLength={6}
                className="w-full h-14 rounded-xl border text-center text-[24px] font-bold tracking-[10px] outline-none mb-4"
                style={{ borderColor: C.border, backgroundColor: '#F8FAFC', color: C.txt1, fontFamily: 'monospace' }} />
              <button onClick={handle2FAVerify} disabled={is2FALoading}
                className="w-full h-11 rounded-[10px] text-black text-[13px] font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: C.accent }}>
                {is2FALoading && <RefreshCw size={13} className="animate-spin" />}
                Verify and Enable 2FA
              </button>
            </div>
          ) : (
            /* 2FA IDLE STATE */
            <div key="idle">
              <CardTitle icon={Phone} title="Two-Factor Authentication" />
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl border mb-4"
                   style={{ backgroundColor: C.orange + '14', borderColor: C.orange + '40' }}>
                <AlertTriangle size={16} style={{ color: C.orange }} />
                <p className="text-[12px] font-medium" style={{ color: C.orange }}>2FA is not enabled. Enable it for extra security.</p>
              </div>
              <p className="text-[13px] mb-4 leading-relaxed" style={{ color: C.txt2 }}>When enabled, you will need your phone to sign in.</p>
              <div className="space-y-2 mb-5">
                <Benefit icon={Shield}   text="Protects against password theft" />
                <Benefit icon={Phone}    text="Works with Google Authenticator and Authy" />
                <Benefit icon={KeyRound} text="30-second rotating codes" />
              </div>
              <button onClick={handle2FAEnable} disabled={is2FALoading}
                className="w-full h-11 rounded-[10px] text-white text-[13px] font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: C.navy }}>
                {is2FALoading ? <RefreshCw size={13} className="animate-spin" /> : <QrCode size={15} />}
                {is2FALoading ? 'Setting up...' : 'Enable 2FA'}
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* ── 4. LOGIN HISTORY ── */}
      <Card>
        <div className="flex items-center justify-between">
          <CardTitle icon={History} title="Login History" />
          {loginHistory.length > 0 && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold mb-4"
                  style={{ backgroundColor: C.navy + '14', color: C.txt2 }}>
              {loginHistory.length} records
            </span>
          )}
        </div>
        {loginHistory.length === 0 ? (
          <p className="text-center py-5 text-[13px]" style={{ color: C.txt3 }}>No login history found</p>
        ) : (
          <>
            {/* Table header (matches Dart layout exactly) */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-t-lg border-x border-t text-[10px] font-bold"
                 style={{ backgroundColor: '#F8FAFC', borderColor: C.border, color: C.txt3 }}>
              <div className="w-7 shrink-0" />
              <div className="w-3 shrink-0" />
              <div className="flex-1">DEVICE</div>
              <div className="w-36 shrink-0">LOCATION</div>
              <div className="w-16 shrink-0 text-right">TIME</div>
            </div>
            <div className="rounded-b-lg border overflow-hidden" style={{ borderColor: C.border }}>
              {loginHistory.map((log, i) => {
                const device  = log.device_info || 'Unknown Device'
                const dl      = device.toLowerCase()
                const DevIcon = dl.includes('mobile') || dl.includes('iphone') || dl.includes('android') ? Smartphone
                              : dl.includes('tablet') || dl.includes('ipad') ? Tablet : Monitor
                const isFirst = i === 0
                const location = log.location_name || ''
                return (
                  <div key={log.id || i}
                       className="flex items-center gap-3 px-3 py-3 border-b last:border-0"
                       style={{ borderColor: C.border + '80', backgroundColor: isFirst ? C.green + '08' : 'transparent' }}>
                    <div className="w-7 shrink-0">
                      <DevIcon size={16} style={{ color: isFirst ? C.green : C.txt3 }} />
                    </div>
                    <div className="w-3 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: C.txt1 }}>{device}</p>
                      {isFirst && <p className="text-[10px] font-semibold" style={{ color: C.green }}>Current session</p>}
                    </div>
                    <div className="w-36 shrink-0 flex items-center gap-1">
                      {location ? (
                        <>
                          <MapPin size={11} style={{ color: C.txt3 }} />
                          <span className="text-[11px] truncate" style={{ color: C.txt2 }}>{location}</span>
                        </>
                      ) : (
                        <span className="text-[11px]" style={{ color: C.txt3 }}>—</span>
                      )}
                    </div>
                    <div className="w-16 shrink-0 text-right text-[11px]" style={{ color: C.txt3 }}>
                      {fmtTime(log.login_at)}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Card>

      {/* ── 5+6. Sessions + Danger Zone ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Active Sessions */}
        <Card>
          <CardTitle icon={Monitor} title="Active Sessions" />
          <div className="flex items-center gap-3 p-3.5 rounded-xl border mb-4"
               style={{ backgroundColor: C.blue + '0D', borderColor: C.blue + '33' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: C.blue + '1A' }}>
              <Laptop size={20} style={{ color: C.blue }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold" style={{ color: C.txt1 }}>Current Session</span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                      style={{ backgroundColor: C.green + '1A', color: C.green }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: C.green }} />
                  Active
                </span>
              </div>
              <p className="text-[11px]" style={{ color: C.txt3 }}>You are currently signed in</p>
            </div>
          </div>
          <p className="text-[13px] mb-4 leading-relaxed" style={{ color: C.txt2 }}>
            Sign out of all other devices if you think your account has been compromised.
          </p>
          <button onClick={() => setShowSignOutAll(true)} disabled={isSigningOut}
            className="w-full h-11 rounded-[10px] border text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ borderColor: C.red + '66', color: C.red }}>
            {isSigningOut ? <RefreshCw size={14} className="animate-spin" /> : <LogOut size={15} />}
            Sign Out All Sessions
          </button>
        </Card>

        {/* Danger Zone */}
        <div className="w-full p-5 rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] border"
             style={{ borderColor: C.red + '4D' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: C.red + '1A' }}>
              <AlertTriangle size={18} style={{ color: C.red }} />
            </div>
            <span className="text-[15px] font-bold" style={{ color: C.red }}>Danger Zone</span>
          </div>
          <div className="border-t mb-4" style={{ borderColor: '#FFE2E8' }} />
          <p className="text-[13px] font-bold mb-1.5" style={{ color: C.txt1 }}>Delete Account</p>
          <p className="text-[12px] mb-4 leading-relaxed" style={{ color: C.txt2 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button onClick={() => setShowDeleteAcct(true)}
            className="w-full h-11 rounded-[10px] border text-[13px] font-bold"
            style={{ borderColor: C.red, color: C.red }}>
            Delete My Account
          </button>
        </div>
      </div>

      {/* ── CONFIRM DIALOGS ── */}

      {/* Disable 2FA */}
      {showDisable2FA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
             onClick={e => e.target === e.currentTarget && setShowDisable2FA(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-[17px] font-bold mb-2" style={{ color: C.txt1, fontFamily: 'var(--font-space-grotesk)' }}>Disable 2FA?</h3>
            <p className="text-[13px] mb-5" style={{ color: C.txt2 }}>This will remove two-factor authentication. Your account will be less secure.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDisable2FA(false)} className="flex-1 h-10 rounded-lg border text-[13px] font-semibold" style={{ borderColor: C.border, color: C.txt2 }}>Cancel</button>
              <button onClick={handle2FADisable} className="flex-1 h-10 rounded-lg text-white text-[13px] font-bold" style={{ backgroundColor: C.red }}>Disable</button>
            </div>
          </div>
        </div>
      )}

      {/* Sign out all */}
      {showSignOutAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
             onClick={e => e.target === e.currentTarget && setShowSignOutAll(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-[17px] font-bold mb-2" style={{ color: C.txt1, fontFamily: 'var(--font-space-grotesk)' }}>Sign Out Everywhere?</h3>
            <p className="text-[13px] mb-5" style={{ color: C.txt2 }}>You will be signed out of all devices and browsers. You&apos;ll need to sign in again.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSignOutAll(false)} className="flex-1 h-10 rounded-lg border text-[13px] font-semibold" style={{ borderColor: C.border, color: C.txt2 }}>Cancel</button>
              <button onClick={handleSignOutAll} className="flex-1 h-10 rounded-lg text-white text-[13px] font-bold" style={{ backgroundColor: C.red }}>Sign Out All</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account */}
      {showDeleteAcct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
             onClick={e => e.target === e.currentTarget && setShowDeleteAcct(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-[17px] font-bold mb-2" style={{ color: C.red, fontFamily: 'var(--font-space-grotesk)' }}>Delete Account?</h3>
            <p className="text-[13px] mb-4" style={{ color: C.txt2 }}>This will permanently delete your account, all orders, research history, and saved data. Type <strong>DELETE</strong> to confirm:</p>
            <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full h-10 px-3 rounded-lg border text-[13px] font-bold outline-none mb-4"
              style={{ borderColor: C.border, backgroundColor: '#F8FAFC', color: C.txt1 }} />
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteAcct(false); setDeleteConfirmText('') }}
                className="flex-1 h-10 rounded-lg border text-[13px] font-semibold" style={{ borderColor: C.border, color: C.txt2 }}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE'}
                className="flex-1 h-10 rounded-lg text-white text-[13px] font-bold disabled:opacity-40"
                style={{ backgroundColor: C.red }}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}