'use client'
// components/admin/settings-tabs/UserCrmTab.tsx
// Converted 1:1 from lib/pages/admin_settings_tabs/user_crm_tab.dart

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { UserPlus, X, User, Mail, ChevronDown } from 'lucide-react'
import AdminHudSection      from './crm_widgets/AdminHudSection'
import AdminControlsBar     from './crm_widgets/AdminControlsBar'
import AdminUserTable       from './crm_widgets/AdminUserTable'

interface Props {
  isInvestorMode?: boolean
  isMobile?:       boolean
}

const C = {
  dark: '#0F172A', lime: '#8FFF00', border: '#E2E8F0',
  bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', hint: '#94A3B8',
}

// ── Add User Dialog (matches Dart _showAddUserDialog) ─────────
function AddUserDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const supabase = createClient()
  const [name,             setName]             = useState('')
  const [email,            setEmail]            = useState('')
  const [gender,           setGender]           = useState('Unspecified')
  const [plan,             setPlan]             = useState('Free Trial')
  const [sendWelcome,      setSendWelcome]       = useState(true)
  const [isSubmitting,     setIsSubmitting]      = useState(false)
  const [showGenderMenu,   setShowGenderMenu]    = useState(false)
  const [showPlanMenu,     setShowPlanMenu]      = useState(false)

  const isValidEmail = (e: string) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(e)
  const isFormValid  = name.trim().length >= 3 && isValidEmail(email.trim())

  function generateTempPassword(n: string) {
    const safe   = n.trim().replace(/\s/g, '')
    const prefix = safe.length >= 3 ? safe.substring(0, 3) : 'User'
    const suffix = Math.floor(Math.random() * 899) + 100
    return `${prefix}#${suffix}`
  }

  async function handleCreate() {
    if (!isFormValid || isSubmitting) return
    setIsSubmitting(true)
    const tempPass = generateTempPassword(name)
    try {
      // Create user via Supabase admin — matches Dart CrmService.createNewUser
      const { error } = await supabase.auth.admin.createUser({
        email: email.trim(),
        password: tempPass,
        user_metadata: { full_name: name.trim(), plan, gender, send_welcome: sendWelcome },
        email_confirm: true,
      })
      if (error) throw error
      onCreated()
      onClose()
      // Show temp password in console (matches Dart SnackBar with COPY PASS)
      console.info(`User Created! Temp Pass: ${tempPass}`)
    } catch (e) {
      console.error('Failed to create user:', e)
    }
    setIsSubmitting(false)
  }

  const genderLabel = gender === 'Male' ? 'Male' : gender === 'Female' ? 'Female' : 'Prefer not to say'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-[450px] shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <UserPlus size={22} style={{ color: C.dark }} />
            <span className="text-[20px] font-bold" style={{ color: C.dark }}>Add New User</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={18} style={{ color: C.hint }} />
          </button>
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <p className="text-[12px] font-bold mb-2" style={{ color: '#1E293B' }}>Full Name</p>
          <div className="flex items-center gap-2 h-12 px-4 rounded-xl border"
               style={{ backgroundColor: C.bg, borderColor: C.border }}>
            <UserPlus size={16} style={{ color: C.hint }} />
            <input value={name} onChange={e => setName(e.target.value)}
              className="flex-1 text-[14px] outline-none bg-transparent" style={{ color: C.text }} />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <p className="text-[12px] font-bold mb-2" style={{ color: '#1E293B' }}>Email Address</p>
          <div className="flex items-center gap-2 h-12 px-4 rounded-xl border"
               style={{ backgroundColor: C.bg, borderColor: C.border }}>
            <Mail size={16} style={{ color: C.hint }} />
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              className="flex-1 text-[14px] outline-none bg-transparent" style={{ color: C.text }} />
          </div>
        </div>

        {/* Gender dropdown */}
        <div className="mb-4">
          <p className="text-[12px] font-bold mb-2" style={{ color: '#1E293B' }}>Select Gender</p>
          <div className="relative">
            <button onClick={() => { setShowGenderMenu(s => !s); setShowPlanMenu(false) }}
              className="w-full flex items-center justify-between h-12 px-4 rounded-xl border text-[14px]"
              style={{ backgroundColor: C.bg, borderColor: '#CBD5E1', color: C.text }}>
              {genderLabel}
              <ChevronDown size={18} style={{ color: C.hint }} />
            </button>
            {showGenderMenu && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-2xl border shadow-lg z-50 p-1"
                   style={{ borderColor: '#E2E8F0' }}>
                {[['Unspecified','Prefer not to say'],['Male','Male'],['Female','Female']].map(([val, label]) => (
                  <button key={val} onClick={() => { setGender(val); setShowGenderMenu(false) }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-[13px] transition-all"
                    style={{
                      backgroundColor: gender === val ? C.lime : 'transparent',
                      color: gender === val ? '#000' : '#1E293B',
                      fontWeight: gender === val ? 700 : 500,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Plan dropdown */}
        <div className="mb-5">
          <p className="text-[12px] font-bold mb-2" style={{ color: '#1E293B' }}>Select Initial Plan</p>
          <div className="relative">
            <button onClick={() => { setShowPlanMenu(s => !s); setShowGenderMenu(false) }}
              className="w-full flex items-center justify-between h-12 px-4 rounded-xl border text-[14px]"
              style={{ backgroundColor: C.bg, borderColor: '#CBD5E1', color: C.text }}>
              {plan}
              <ChevronDown size={18} style={{ color: C.hint }} />
            </button>
            {showPlanMenu && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-2xl border shadow-lg z-50 p-1"
                   style={{ borderColor: '#E2E8F0' }}>
                {['Free Trial','Pro Plan','Elite Plan'].map(p => (
                  <button key={p} onClick={() => { setPlan(p); setShowPlanMenu(false) }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-[13px] transition-all"
                    style={{
                      backgroundColor: plan === p ? C.lime : 'transparent',
                      color: plan === p ? '#000' : '#1E293B',
                      fontWeight: plan === p ? 700 : 500,
                    }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Welcome email toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border mb-7"
             style={{ backgroundColor: '#F1F5F9', borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <Mail size={19} style={{ color: C.muted }} />
            <div>
              <p className="text-[13px] font-bold" style={{ color: C.dark }}>Send Welcome Email</p>
              <p className="text-[11px]" style={{ color: C.muted }}>Includes an auto-generated password.</p>
            </div>
          </div>
          {/* Toggle — lime thumb dark track matches Dart Switch */}
          <div onClick={() => setSendWelcome(s => !s)}
               className="relative w-11 h-6 rounded-full cursor-pointer transition-colors"
               style={{ backgroundColor: sendWelcome ? C.dark : '#CBD5E1' }}>
            <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                 style={{ backgroundColor: sendWelcome ? C.lime : '#fff', left: sendWelcome ? '22px' : '2px' }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2.5 text-[13px] font-bold"
            style={{ color: C.hint }}>Cancel</button>
          <button onClick={handleCreate} disabled={!isFormValid || isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-black transition-all"
            style={{
              backgroundColor: isFormValid ? C.lime : C.border,
              color: isFormValid ? C.dark : C.hint,
              minWidth: 120,
            }}>
            {isSubmitting
              ? <div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.dark }} />
              : 'Create User'}
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Main Tab ──────────────────────────────────────────────────
export default function UserCrmTab({ isInvestorMode = false }: Props) {
  const supabase = createClient()

  const [allUsers,      setAllUsers]      = useState<any[]>([])
  const [isLoading,     setIsLoading]     = useState(true)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [selectedFilter,setSelectedFilter]= useState('All')
  const [showAddUser,   setShowAddUser]   = useState(false)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      setAllUsers((data ?? []) as any[])
    } catch (e) { console.error(e) }
    setIsLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  // matches Dart _updateUserLocally
  function updateUserLocally(userId: string, field: string, newValue: any) {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: newValue } : u))
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
           style={{ borderTopColor: C.dark }} />
    </div>
  )

  return (
    <div className="flex flex-col gap-6 pb-20">

      {/* HUD section */}
      <AdminHudSection allUsers={allUsers} />

      {/* Controls bar */}
      <AdminControlsBar
        allUsers={allUsers}
        onSearch={setSearchQuery}
        onAddUser={() => setShowAddUser(true)}
        selectedFilter={selectedFilter}
        onFilterChanged={setSelectedFilter}
        onRefresh={loadUsers}
      />

      {/* User table */}
      <AdminUserTable
        allUsers={allUsers}
        isInvestorMode={isInvestorMode}
        searchQuery={searchQuery}
        selectedFilter={selectedFilter}
        onUserUpdated={updateUserLocally}
      />

      {/* Add user dialog */}
      {showAddUser && (
        <AddUserDialog
          onClose={() => setShowAddUser(false)}
          onCreated={loadUsers}
        />
      )}

    </div>
  )
}