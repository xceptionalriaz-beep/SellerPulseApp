'use client'
// app/dashboard/profile/tabs/BillingTab.tsx
// Converted from: lib/user_profile/tabs/billing_tab.dart
//
// Sections (same as Dart):
//   1. Active Plan Card (PRO PLAN badge, renewal date, Change Plan / Cancel)
//   2. Secure Payment Method (virtual credit card design + Update button)
//   3. Invoice History (date, amount, status, PDF download)

import { useState } from 'react'
import { Calendar, Lock, FileText, CheckCircle, Download, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/AppToast'

export default function BillingTab() {
  const toast = useToast()
  const [openingPortal, setOpeningPortal] = useState(false)

  async function handleUpdatePayment() {
    setOpeningPortal(true)
    try {
      // BillingService.updatePaymentMethod() equivalent
      await new Promise(r => setTimeout(r, 1500))
      toast.info('Redirecting to secure payment portal...')
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong')
    } finally {
      setOpeningPortal(false)
    }
  }

  const invoices = [
    { date: 'May 01, 2026', amount: '$19.00', status: 'Paid' },
    { date: 'Apr 01, 2026', amount: '$19.00', status: 'Paid' },
    { date: 'Mar 01, 2026', amount: '$19.00', status: 'Paid' },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold text-[#0F172A]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Billing &amp; Subscription
        </h1>
        <p className="text-[14px] text-gray-400 mt-2">
          Manage your payment methods, view invoices, and upgrade your plan.
        </p>
      </div>

      {/* ── SECTION 1: Active Plan Card ── */}
      <div className="w-full p-6 bg-white rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.04)] border-[1.5px]"
           style={{ borderColor: 'rgba(143,255,0,0.4)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* PRO PLAN badge */}
            <div className="px-3 py-1.5 rounded-full text-[12px] font-black tracking-widest text-[#0F172A]"
                 style={{ backgroundColor: 'rgba(143,255,0,0.16)' }}>
              PRO PLAN
            </div>
            <span className="text-[14px] font-bold" style={{ color: '#16A34A' }}>Active</span>
          </div>
          <span className="text-[22px] font-bold text-[#0F172A]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            $19.00 / mo
          </span>
        </div>

        {/* Renewal date */}
        <div className="flex items-center gap-2 mt-4">
          <Calendar size={15} className="text-gray-400" />
          <span className="text-[14px] font-medium text-gray-400">
            Your plan renews on May 27, 2026
          </span>
        </div>

        <div className="border-t border-[#F1F5F9] my-5" />

        {/* Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => toast.info('Plan change coming soon!')}
            className="px-5 py-3 rounded-lg text-white text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0F172A' }}
          >
            Change Plan
          </button>
          <button
            onClick={() => toast.warning('Cancel subscription — are you sure?')}
            className="px-4 py-3 text-[13px] font-semibold text-red-400 hover:text-red-600 transition-colors"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* ── SECTION 2: Secure Payment Method ── */}
      <div className="w-full p-6 bg-white rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.04)] border border-gray-200">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Lock size={17} style={{ color: '#16A34A' }} />
            <h2 className="text-[16px] font-bold text-[#0F172A]">Secure Payment Method</h2>
          </div>
          <button
            onClick={handleUpdatePayment}
            disabled={openingPortal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8F0] text-[12px] font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-60"
          >
            {openingPortal
              ? <RefreshCw size={13} className="animate-spin" />
              : null
            }
            Update
          </button>
        </div>

        {/* Virtual Credit Card */}
        <div
          className="w-full max-w-[320px] p-5 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            boxShadow: '0 8px 15px rgba(15,23,42,0.16)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-7 h-7 rounded-full border-2 border-white/30 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-white/50" />
            </div>
            <span className="text-[22px] font-black italic text-white/80">VISA</span>
          </div>

          <p className="text-white text-[20px] font-medium tracking-[3px] mb-5">
            ••••  ••••  ••••  4242
          </p>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/50 text-[10px] tracking-widest mb-1">CARDHOLDER</p>
              <p className="text-white text-[14px] font-bold">Riazify LLC</p>
            </div>
            <div>
              <p className="text-white/50 text-[10px] tracking-widest mb-1">EXPIRES</p>
              <p className="text-white text-[14px] font-bold">12/28</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Invoice History ── */}
      <div className="w-full p-6 bg-white rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.04)] border border-gray-200">
        <h2 className="text-[16px] font-bold text-[#0F172A] mb-4">Invoice History</h2>

        {/* Table header */}
        <div className="grid grid-cols-4 px-4 py-3 rounded-lg mb-2 text-[11px] font-bold text-gray-400"
             style={{ backgroundColor: '#F8FAFC' }}>
          <span className="col-span-1">DATE</span>
          <span className="col-span-1">AMOUNT</span>
          <span className="col-span-1">STATUS</span>
          <span className="col-span-1" />
        </div>

        {/* Invoice rows */}
        {invoices.map((inv, i) => (
          <div key={i}
               className="grid grid-cols-4 items-center px-4 py-4 border-b border-gray-100 last:border-0">
            <span className="text-[13px] font-medium text-[#0F172A]">{inv.date}</span>
            <span className="text-[13px] font-bold text-[#0F172A]">{inv.amount}</span>
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold"
                    style={{ backgroundColor: '#EBF6D4', color: '#16A34A' }}>
                <CheckCircle size={11} />
                {inv.status}
              </span>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => toast.info('Downloading invoice PDF...')}
                className="text-[#64748B] hover:text-[#0F172A] transition-colors"
                title="Download PDF"
              >
                <FileText size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}