'use client'
// components/admin/PricingEditorModal.tsx
// ══════════════════════════════════════════════════════════════
// Edit landing page pricing cards from admin panel
// No code changes needed — saves directly to DB
// ══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { X, Plus, Trash2, Save, Eye, GripVertical, Check } from 'lucide-react'

const C = {
  dark:     '#0a0d08',
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  border:   '#e8ede2',
  bg:       '#f7f9f5',
  text:     '#1a2410',
  muted:    '#8a9e78',
  surface:  '#ffffff',
  red:      '#b91c1c',
  amber:    '#d97706',
  green:    '#16a34a',
}

interface Feature {
  text:     string
  included: boolean
}

interface PricingPlan {
  id:          string
  plan_id:     string
  sort_order:  number
  name:        string
  price:       string
  period:      string
  description: string
  features:    Feature[]
  cta_text:    string
  highlight:   boolean
  is_active:   boolean
}

interface Props {
  onClose: () => void
}

export default function PricingEditorModal({ onClose }: Props) {
  const supabase = createClient()

  const [plans,    setPlans]    = useState<PricingPlan[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState<string | null>(null)
  const [saved,    setSaved]    = useState<string | null>(null)
  const [visible,  setVisible]  = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    loadPlans()
  }, [])

  async function loadPlans() {
    setLoading(true)
    const { data } = await (supabase.from('landing_pricing') as any)
      .select('*').order('sort_order', { ascending: true })
    const loaded = (data ?? []) as PricingPlan[]
    setPlans(loaded)
    if (loaded.length > 0) setSelected(loaded[0].id)
    setLoading(false)
  }

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  function updatePlan(id: string, key: keyof PricingPlan, value: any) {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [key]: value } : p))
  }

  function updateFeature(planId: string, idx: number, key: keyof Feature, value: any) {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p
      const features = [...p.features]
      features[idx] = { ...features[idx], [key]: value }
      return { ...p, features }
    }))
  }

  function addFeature(planId: string) {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p
      return { ...p, features: [...p.features, { text: 'New feature', included: true }] }
    }))
  }

  function removeFeature(planId: string, idx: number) {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p
      return { ...p, features: p.features.filter((_, i) => i !== idx) }
    }))
  }

  function moveFeature(planId: string, fromIdx: number, toIdx: number) {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p
      const features = [...p.features]
      const [moved]  = features.splice(fromIdx, 1)
      features.splice(toIdx, 0, moved)
      return { ...p, features }
    }))
  }

  const [dragIdx,  setDragIdx]  = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  async function savePlan(plan: PricingPlan) {
    setSaving(plan.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/pricing/update', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({
          id:          plan.id,
          name:        plan.name,
          price:       plan.price,
          period:      plan.period,
          description: plan.description,
          features:    plan.features,
          cta_text:    plan.cta_text,
          highlight:   plan.highlight,
          is_active:   plan.is_active,
        }),
      })
      if (res.ok) {
        setSaved(plan.id)
        setTimeout(() => setSaved(null), 2000)
      }
    } catch { /* silent */ }
    setSaving(null)
  }

  const currentPlan = plans.find(p => p.id === selected)

  return (
    <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4"
         style={{ backgroundColor: `rgba(0,0,0,${visible ? 0.6 : 0})`, transition: 'background-color 0.25s ease' }}
         onClick={handleClose}>
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
           style={{
             backgroundColor: C.surface,
             maxHeight: '90vh',
             transform: visible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(16px)',
             opacity:   visible ? 1 : 0,
             transition: 'transform 0.25s ease, opacity 0.25s ease',
           }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <Eye size={16} style={{ color: C.limeDeep }} />
          <div className="flex-1">
            <p className="text-[15px] font-black" style={{ color: C.dark }}>Pricing Page Editor</p>
            <p className="text-[11px]" style={{ color: C.muted }}>Edit landing page pricing cards — changes go live instantly</p>
          </div>
          <a href="/" target="_blank"
             className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold hover:opacity-80"
             style={{ backgroundColor: C.limeTint, color: C.limeDeep, border: `1px solid ${C.limeDeep}33` }}>
            <Eye size={12} /> Preview Page
          </a>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Left — Plan selector */}
          <div className="w-48 border-r flex flex-col shrink-0"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <p className="text-[9px] font-black tracking-wider px-4 py-3" style={{ color: C.muted }}>PLANS</p>
            {loading ? (
              <div className="flex flex-col gap-2 px-3">
                {[0,1,2,3].map(i => <div key={i} className="h-10 rounded-xl animate-pulse" style={{ backgroundColor: C.border }} />)}
              </div>
            ) : (
              plans.map(plan => (
                <button key={plan.id} onClick={() => setSelected(plan.id)}
                  className="flex items-center justify-between px-4 py-3 text-left hover:opacity-80 transition-colors"
                  style={{
                    backgroundColor: selected === plan.id ? C.limeTint : 'transparent',
                    borderLeft:      selected === plan.id ? `3px solid ${C.limeDeep}` : '3px solid transparent',
                  }}>
                  <div>
                    <p className="text-[12px] font-black" style={{ color: selected === plan.id ? C.limeDeep : C.text }}>
                      {plan.name}
                    </p>
                    <p className="text-[10px]" style={{ color: C.muted }}>{plan.price}{plan.period}</p>
                  </div>
                  {plan.highlight && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>★</span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Right — Edit panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {!currentPlan ? (
              <div className="flex items-center justify-center h-full">
                <p style={{ color: C.muted }}>Select a plan to edit</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">

                {/* Basic info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>PLAN NAME</p>
                    <input value={currentPlan.name}
                      onChange={e => updatePlan(currentPlan.id, 'name', e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border text-[13px] font-bold outline-none"
                      style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>PRICE</p>
                    <input value={currentPlan.price}
                      onChange={e => updatePlan(currentPlan.id, 'price', e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border text-[13px] font-bold outline-none"
                      style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>PERIOD</p>
                    <input value={currentPlan.period}
                      onChange={e => updatePlan(currentPlan.id, 'period', e.target.value)}
                      placeholder="/month, forever, etc."
                      className="w-full h-9 px-3 rounded-xl border text-[13px] outline-none"
                      style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>CTA BUTTON TEXT</p>
                    <input value={currentPlan.cta_text}
                      onChange={e => updatePlan(currentPlan.id, 'cta_text', e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border text-[13px] outline-none"
                      style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>DESCRIPTION</p>
                    <input value={currentPlan.description}
                      onChange={e => updatePlan(currentPlan.id, 'description', e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border text-[13px] outline-none"
                      style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold" style={{ color: C.muted }}>Most Popular</p>
                    <div onClick={() => updatePlan(currentPlan.id, 'highlight', !currentPlan.highlight)}
                         className="relative w-10 h-5 rounded-full cursor-pointer"
                         style={{ backgroundColor: currentPlan.highlight ? C.dark : 'rgba(100,116,139,0.35)' }}>
                      <div style={{
                        position: 'absolute', top: 2, left: 2,
                        width: 16, height: 16, borderRadius: '50%',
                        backgroundColor: currentPlan.highlight ? C.lime : '#fff',
                        transform: currentPlan.highlight ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.25s ease',
                      }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold" style={{ color: C.muted }}>Active</p>
                    <div onClick={() => updatePlan(currentPlan.id, 'is_active', !currentPlan.is_active)}
                         className="relative w-10 h-5 rounded-full cursor-pointer"
                         style={{ backgroundColor: currentPlan.is_active ? C.dark : 'rgba(100,116,139,0.35)' }}>
                      <div style={{
                        position: 'absolute', top: 2, left: 2,
                        width: 16, height: 16, borderRadius: '50%',
                        backgroundColor: currentPlan.is_active ? C.lime : '#fff',
                        transform: currentPlan.is_active ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.25s ease',
                      }} />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>FEATURES</p>
                    <button onClick={() => addFeature(currentPlan.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold hover:opacity-80"
                      style={{ backgroundColor: C.limeTint, color: C.limeDeep, border: `1px solid ${C.limeDeep}33` }}>
                      <Plus size={11} /> Add Feature
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {currentPlan.features.map((f, idx) => (
                      <div key={idx}
                           draggable
                           onDragStart={() => setDragIdx(idx)}
                           onDragOver={e => { e.preventDefault(); setDragOver(idx) }}
                           onDrop={() => {
                             if (dragIdx !== null && dragIdx !== idx) {
                               moveFeature(currentPlan.id, dragIdx, idx)
                             }
                             setDragIdx(null)
                             setDragOver(null)
                           }}
                           onDragEnd={() => { setDragIdx(null); setDragOver(null) }}
                           className="flex items-center gap-2 p-2 rounded-xl border transition-all"
                           style={{
                             borderColor:     dragOver === idx ? C.limeDeep : C.border,
                             backgroundColor: dragOver === idx ? C.limeTint : C.bg,
                             opacity:         dragIdx  === idx ? 0.4 : 1,
                             cursor:          'grab',
                           }}>
                        <GripVertical size={13} style={{ color: C.muted, flexShrink: 0, cursor: 'grab' }} />
                        {/* Included toggle */}
                        <div onClick={() => updateFeature(currentPlan.id, idx, 'included', !f.included)}
                             className="relative w-8 h-4 rounded-full cursor-pointer shrink-0"
                             style={{ backgroundColor: f.included ? C.limeDeep : 'rgba(185,28,28,0.3)' }}>
                          <div style={{
                            position: 'absolute', top: 1, left: 1,
                            width: 12, height: 12, borderRadius: '50%',
                            backgroundColor: '#fff',
                            transform: f.included ? 'translateX(16px)' : 'translateX(0)',
                            transition: 'transform 0.2s ease',
                          }} />
                        </div>
                        <input value={f.text}
                          onChange={e => updateFeature(currentPlan.id, idx, 'text', e.target.value)}
                          className="flex-1 h-7 px-2 rounded-lg border text-[12px] outline-none"
                          style={{ borderColor: C.border, backgroundColor: C.surface, color: C.text }}
                          onClick={e => e.stopPropagation()} />
                        <button onClick={() => removeFeature(currentPlan.id, idx)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:opacity-70 shrink-0"
                          style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                          <Trash2 size={11} style={{ color: C.red }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save button */}
                <button onClick={() => savePlan(currentPlan)} disabled={!!saving}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-[14px] disabled:opacity-40"
                  style={{ backgroundColor: C.dark, color: C.lime }}>
                  {saving === currentPlan.id ? (
                    <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                  ) : saved === currentPlan.id ? (
                    <><Check size={16} /> Saved!</>
                  ) : (
                    <><Save size={16} /> Save Changes — Goes Live Instantly</>
                  )}
                </button>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}