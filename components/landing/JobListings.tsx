'use client'
// components/landing/JobListings.tsx
import { useState } from 'react'
import { MapPin, Clock, ArrowRight, X } from 'lucide-react'
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applyJob, setApplyJob]       = useState<string | null>(null)

  if (jobs.length === 0) return null

  return (
    <>
      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {jobs.map(job => (
          <button key={job.id} onClick={() => setSelectedJob(job)}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16, transition: 'all .2s', aspectRatio: '1 / 1', boxSizing: 'border-box' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = `1px solid ${C.lime}`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = `1px solid ${C.border}`; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>

            {/* Top — department badge only */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: C.limeTint, color: C.limeDeep, border: `1px solid ${C.lime}` }}>
                {job.department}
              </span>
            </div>

            {/* Middle — title + description */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 18, fontWeight: 900, color: C.dark, margin: '0 0 10px', lineHeight: 1.2 }}>{job.title}</p>
              {job.description && (
                <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.6,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description.replace(/•\s*/g, '').split('\n')[0]}
                </p>
              )}
            </div>

            {/* Bottom — location + type + arrow */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11}/>{job.location}
                </span>
                <span style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11}/>{job.type}
                </span>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ArrowRight size={13} style={{ color: C.dark }}/>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Job detail modal */}
      {selectedJob && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
             onClick={() => setSelectedJob(null)}>
          <div style={{ background: C.surface, borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}
               onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <p style={{ fontSize: 20, fontWeight: 900, color: C.dark, margin: '0 0 8px' }}>{selectedJob.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: C.limeTint, color: C.limeDeep, border: `1px solid ${C.lime}` }}>
                    {selectedJob.department}
                  </span>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: C.bg, color: C.muted, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={10}/>{selectedJob.location}
                  </span>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: C.bg, color: C.muted, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10}/>{selectedJob.type}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={15} style={{ color: C.muted }}/>
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {selectedJob.description && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 10px' }}>About the role</p>
                  <p style={{ fontSize: 14, color: C.dark, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{selectedJob.description}</p>
                </div>
              )}
              {selectedJob.requirements && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 10px' }}>Requirements</p>
                  <p style={{ fontSize: 14, color: C.dark, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{selectedJob.requirements}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>We respond to all applications within 5 business days.</p>
              <button onClick={() => { setApplyJob(selectedJob.title); setSelectedJob(null) }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 42, padding: '0 22px', borderRadius: 100, background: C.lime, color: C.dark, fontSize: 14, fontWeight: 900, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Apply now <ArrowRight size={14}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {applyJob && <ApplyModal role={applyJob} onClose={() => setApplyJob(null)}/>}
    </>
  )
}