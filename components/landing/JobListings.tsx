'use client'
// components/landing/JobListings.tsx
import { useState } from 'react'
import { ChevronDown, ChevronUp, ArrowRight, MapPin, Clock } from 'lucide-react'
import ApplyModal from '@/components/landing/ApplyModal'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  bg:       '#f7f9f5',
  surface:  '#ffffff',
}

interface Job {
  id:           string
  title:        string
  department:   string
  location:     string
  type:         string
  description:  string
  requirements: string
}

export default function JobListings({ jobs }: { jobs: Job[] }) {
  const [openId, setOpenId]       = useState<string | null>(null)
  const [applyJob, setApplyJob]   = useState<string | null>(null)

  if (jobs.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {jobs.map(job => {
        const isOpen = openId === job.id
        return (
          <div key={job.id} style={{ background: C.surface, border: `1px solid ${isOpen ? C.lime : C.border}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color .2s' }}>

            {/* Card header — clickable */}
            <button onClick={() => setOpenId(isOpen ? null : job.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 900, color: C.dark, margin: '0 0 10px' }}>{job.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: C.limeTint, color: C.limeDeep, border: `1px solid ${C.lime}` }}>
                    {job.department}
                  </span>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: C.bg, color: C.muted, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={10}/>{job.location}
                  </span>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: C.bg, color: C.muted, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10}/>{job.type}
                  </span>
                </div>
              </div>
              <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isOpen
                  ? <ChevronUp size={16} style={{ color: C.limeDeep }}/>
                  : <ChevronDown size={16} style={{ color: C.muted }}/>
                }
              </div>
            </button>

            {/* Expanded details */}
            {isOpen && (
              <div style={{ borderTop: `1px solid ${C.border}`, padding: '24px' }}>
                {job.description && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 10px' }}>About the role</p>
                    <p style={{ fontSize: 14, color: C.dark, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{job.description}</p>
                  </div>
                )}
                {job.requirements && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 10px' }}>Requirements</p>
                    <p style={{ fontSize: 14, color: C.dark, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{job.requirements}</p>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 16, borderTop: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>We respond to all applications within 5 business days.</p>
                  <button onClick={() => setApplyJob(job.title)}
                          className="apply-btn"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 40, padding: '0 20px', borderRadius: 100, background: C.lime, color: C.dark, fontSize: 13, fontWeight: 900, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Apply now <ArrowRight size={14}/>
                  </button>
                </div>
                <style>{`@media (max-width: 640px) { .apply-btn { align-self: center; margin: 0 auto; } }`}</style>
              </div>
            )}
          </div>
        )
      })}
      {applyJob && <ApplyModal role={applyJob} onClose={() => setApplyJob(null)}/>}
    </div>
  )
}