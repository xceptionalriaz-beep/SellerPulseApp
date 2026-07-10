'use client'
// components/admin/settings-tabs/CareersTab.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Plus, Edit2, Trash2, Eye, EyeOff, RefreshCw,
  Check, X, Briefcase, MapPin, Clock, Copy, ExternalLink,
  HeadphonesIcon, Code2, Megaphone, Pen, BarChart, FileText
} from 'lucide-react'
import ProDropdown from '@/components/ui/ProDropdown'

const C = {
  lime:        '#8fff00',
  limeDeep:    '#4a8f00',
  limeTint:    '#f4ffe6',
  dark:        '#1a2410',
  border:      '#e8ede2',
  muted:       '#8a9e78',
  bg:          '#f7f9f5',
  surface:     '#ffffff',
  text:        '#1a2410',
  red:         '#b91c1c',
  redBg:       '#fef2f2',
  redBorder:   '#fecaca',
  blue:        '#1d4ed8',
  blueBg:      '#eff6ff',
  green:       '#15803d',
  greenBg:     '#f0fdf4',
  greenBorder: '#bbf7d0',
}

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Support', 'Operations', 'Finance', 'Sales']
const LOCATIONS   = ['Remote', 'Hybrid', 'On-site', 'Anywhere']
const TYPES       = ['Full-time', 'Part-time', 'Contract', 'Internship']
const STATUSES    = ['Open', 'Closed']

const JOB_TEMPLATES = [
  {
    id: 'support',
    label: 'Support Agent',
    icon: HeadphonesIcon,
    department: 'Support',
    location: 'Remote',
    type: 'Full-time',
    title: 'Customer Support Agent',
    description: `We're looking for a passionate Customer Support Agent to join our remote team. You'll be the first point of contact for our sellers, helping them get the most out of Riazify.\n\nResponsibilities:\n• Respond to user inquiries via email and live chat\n• Troubleshoot product issues and escalate when needed\n• Document common issues and help improve our FAQ\n• Maintain high customer satisfaction scores`,
    requirements: `• Excellent written communication skills\n• Empathy and patience when dealing with frustrated users\n• Experience with support tools (Intercom, Zendesk or similar)\n• Ability to work independently in a remote environment\n• Knowledge of eBay selling is a plus`,
  },
  {
    id: 'developer',
    label: 'Developer',
    icon: Code2,
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    title: 'Full Stack Developer',
    description: `We're looking for a Full Stack Developer to help build and scale Riazify. You'll work on our Next.js frontend, Supabase backend, and everything in between.\n\nResponsibilities:\n• Build and maintain features across the full stack\n• Write clean, well-tested code\n• Collaborate with the product team on new features\n• Optimize performance and reliability`,
    requirements: `• Strong experience with React/Next.js\n• Experience with TypeScript\n• Familiarity with PostgreSQL/Supabase\n• Experience with REST APIs\n• Self-motivated and comfortable working remotely`,
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    title: 'Growth Marketing Manager',
    description: `We're looking for a Growth Marketing Manager to help us reach more eBay sellers. You'll own our acquisition channels and drive measurable growth.\n\nResponsibilities:\n• Own paid and organic acquisition channels\n• Create and distribute content for eBay seller communities\n• Run experiments to improve conversion rates\n• Track and report on key growth metrics`,
    requirements: `• 2+ years of growth marketing experience\n• Experience with SEO, paid ads and content marketing\n• Data-driven mindset with strong analytical skills\n• Knowledge of the eBay seller community is a big plus\n• Excellent written communication`,
  },
  {
    id: 'designer',
    label: 'Designer',
    icon: Pen,
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    title: 'Product Designer',
    description: `We're looking for a Product Designer to help shape the Riazify experience. You'll work closely with engineering and product to design intuitive tools for eBay sellers.\n\nResponsibilities:\n• Design new features from concept to final spec\n• Create and maintain our design system\n• Conduct user research and usability testing\n• Collaborate with engineers during implementation`,
    requirements: `• Strong portfolio showing product design work\n• Proficiency in Figma\n• Experience designing for web applications\n• Understanding of frontend capabilities and constraints\n• Ability to balance aesthetics with usability`,
  },
  {
    id: 'analyst',
    label: 'Data Analyst',
    icon: BarChart,
    department: 'Operations',
    location: 'Remote',
    type: 'Full-time',
    title: 'Data Analyst',
    description: `We're looking for a Data Analyst to help us make better decisions with data. You'll work across the business to surface insights that drive product and growth.\n\nResponsibilities:\n• Analyze user behavior and product metrics\n• Build dashboards and reports for the team\n• Identify trends and opportunities in seller data\n• Partner with product and engineering on data needs`,
    requirements: `• Strong SQL skills\n• Experience with data visualization tools\n• Ability to translate data into actionable insights\n• Familiarity with product analytics\n• Self-directed and able to define your own projects`,
  },
]

interface Job {
  id:           string
  title:        string
  department:   string
  location:     string
  type:         string
  status:       string
  description:  string
  requirements: string
  is_published: boolean
  created_at:   string
}

const emptyJob = (): Omit<Job, 'id' | 'created_at'> => ({
  title: '', department: 'Engineering', location: 'Remote',
  type: 'Full-time', status: 'Open', description: '', requirements: '', is_published: false,
})

interface Application {
  id:          string
  title:       string
  description: string
  user_email:  string
  status:      string
  created_at:  string
}

const APP_STATUSES = [
  { val: 'open',       label: 'New',           color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  { val: 'reviewing',  label: 'Under Review',  color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  { val: 'shortlisted',label: 'Shortlisted',   color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  { val: 'rejected',   label: 'Rejected',      color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  { val: 'hired',      label: 'Hired',         color: '#4a8f00', bg: '#f4ffe6', border: '#8fff00' },
]

function parseApplication(desc: string) {
  const lines = desc.split('\n')
  const get = (key: string) => {
    const line = lines.find(l => l.startsWith(key + ':'))
    return line ? line.replace(key + ':', '').trim() : ''
  }
  const getBlock = (startKey: string, endKey?: string) => {
    const startIdx = lines.findIndex(l => l.trim() === startKey)
    if (startIdx === -1) return ''
    const result: string[] = []
    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      if (line.startsWith('---') || (endKey && line.trim() === endKey)) break
      result.push(line)
    }
    return result.join('\n').trim()
  }
  return {
    role:        get('Role Applied'),
    name:        get('Name'),
    email:       get('Email'),
    phone:       get('Phone'),
    address:     get('Address'),
    linkedin:    get('LinkedIn'),
    cv:          get('CV/Resume'),
    currentRole: get('Current Role'),
    experience:  get('Years of Experience'),
    employment:  get('Employment Type Preference'),
    startDate:   get('Available to Start'),
    source:      get('How they heard about us'),
    whyRiazify:  getBlock('Why Riazify?', 'About Yourself:'),
    about:       getBlock('About Yourself:'),
  }
}

export default function CareersTab() {
  const supabase = createClient()
  const [mainTab, setMainTab]       = useState<'jobs' | 'applications'>('jobs')
  const [apps, setApps]             = useState<Application[]>([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [jobs, setJobs]           = useState<Job[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<'all' | 'published' | 'draft' | 'closed'>('all')
  const [view, setView]           = useState<'list' | 'template' | 'edit'>('list')
  const [editJob, setEditJob]     = useState<Partial<Job>>(emptyJob())
  const [isNew, setIsNew]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const [toast, setToast]         = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await (supabase.from('job_postings') as any)
      .select('*').order('created_at', { ascending: false })
    setJobs(data ?? [])
    setLoading(false)
  }, [supabase])

  const loadApps = useCallback(async () => {
    setLoadingApps(true)
    const { data } = await (supabase.from('tickets') as any)
      .select('id, title, description, user_email, status, created_at')
      .like('title', 'Job Application:%')
      .order('created_at', { ascending: false })
    setApps(data ?? [])
    setLoadingApps(false)
  }, [supabase])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (mainTab === 'applications') loadApps() }, [mainTab, loadApps])

  const filtered = jobs.filter(j => {
    if (filter === 'published') return j.is_published && j.status === 'Open'
    if (filter === 'draft')     return !j.is_published
    if (filter === 'closed')    return j.status === 'Closed'
    return true
  })

  function openNew() {
    setView('template')
  }

  function applyTemplate(template: typeof JOB_TEMPLATES[0] | null) {
    if (template) {
      setEditJob({
        title:       template.title,
        department:  template.department,
        location:    template.location,
        type:        template.type,
        status:      'Open',
        description: template.description,
        requirements:template.requirements,
        is_published:false,
      })
    } else {
      setEditJob(emptyJob())
    }
    setIsNew(true)
    setView('edit')
  }

  function openEdit(job: Job) {
    setEditJob({ ...job }); setIsNew(false); setView('edit')
  }

  async function save(publish?: boolean) {
    if (!editJob.title?.trim()) { showToast('Job title is required'); return }
    setSaving(true)
    try {
      const payload = {
        ...editJob,
        is_published: publish !== undefined ? publish : editJob.is_published,
        updated_at: new Date().toISOString(),
      }
      if (isNew) {
        const { error } = await (supabase.from('job_postings') as any).insert({ ...payload, created_at: new Date().toISOString() })
        if (error) throw error
        showToast(publish ? 'Job published!' : 'Job saved as draft!')
      } else {
        const { error } = await (supabase.from('job_postings') as any).update(payload).eq('id', editJob.id)
        if (error) throw error
        showToast(publish ? 'Job published!' : 'Changes saved!')
      }
      await load()
      setView('list')
    } catch (e: any) { showToast(`Error: ${e.message}`) }
    setSaving(false)
  }

  async function togglePublish(job: Job) {
    await (supabase.from('job_postings') as any)
      .update({ is_published: !job.is_published, updated_at: new Date().toISOString() })
      .eq('id', job.id)
    showToast(job.is_published ? 'Job unpublished' : 'Job published!')
    await load()
  }

  async function deleteJob(id: string) {
    setDeleting(id)
    await (supabase.from('job_postings') as any).delete().eq('id', id)
    showToast('Job deleted')
    await load()
    setDeleting(null)
  }

  async function duplicateJob(job: Job) {
    setDuplicating(job.id)
    try {
      const { error } = await (supabase.from('job_postings') as any).insert({
        title:        `${job.title} (Copy)`,
        department:   job.department,
        location:     job.location,
        type:         job.type,
        status:       job.status,
        description:  job.description,
        requirements: job.requirements,
        is_published: false,
        created_at:   new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      })
      if (error) throw error
      showToast('Job duplicated as draft!')
      await load()
    } catch (e: any) { showToast(`Error: ${e.message}`) }
    setDuplicating(null)
  }

  async function updateAppStatus(id: string, status: string) {
    setUpdatingStatus(id)
    await (supabase.from('tickets') as any).update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    showToast('Status updated!')
    setUpdatingStatus(null)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 40, padding: '0 12px', borderRadius: 10,
    border: `1px solid ${C.border}`, fontSize: 13, color: C.text,
    outline: 'none', fontFamily: 'Inter, sans-serif', background: C.surface,
    boxSizing: 'border-box',
  }

  const textareaStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: `1px solid ${C.border}`, fontSize: 13, color: C.text,
    outline: 'none', fontFamily: 'Inter, sans-serif', background: C.surface,
    resize: 'vertical', boxSizing: 'border-box',
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: C.dark, border: `1px solid ${C.lime}`, borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <Check size={14} style={{ color: C.lime }}/><span style={{ fontSize: 13, fontWeight: 700, color: C.lime }}>{toast}</span>
        </div>
      )}

      {/* Main tabs */}
      {view === 'list' && (
        <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}` }}>
          {[
            { key: 'jobs' as const,         label: 'Job Postings',  count: jobs.length },
            { key: 'applications' as const,  label: 'Applications',  count: apps.length },
          ].map(t => {
            const isActive = mainTab === t.key
            return (
              <button key={t.key} onClick={() => setMainTab(t.key)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '8px 8px 0 0', border: 'none', borderBottom: isActive ? `2px solid ${C.lime}` : '2px solid transparent', background: isActive ? C.limeTint : 'transparent', color: isActive ? C.dark : C.muted, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: 'pointer' }}>
                {t.label}
                {t.count > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: isActive ? C.lime : C.border, color: isActive ? C.dark : C.muted, borderRadius: 100, padding: '0 6px' }}>{t.count}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Applications view */}
      {mainTab === 'applications' && view === 'list' && !selectedApp && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: '0 0 4px' }}>Applications</h2>
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{apps.length} application{apps.length !== 1 ? 's' : ''} received</p>
            </div>
            <button onClick={loadApps} style={{ fontSize: 12, color: C.muted, background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <RefreshCw size={12}/> Refresh
            </button>
          </div>

          {loadingApps ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <RefreshCw size={20} style={{ color: C.muted, animation: 'spin 1s linear infinite' }}/>
            </div>
          ) : apps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
              <Briefcase size={32} style={{ color: C.muted, marginBottom: 12 }}/>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>No applications yet</p>
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Applications submitted via the careers page will appear here</p>
            </div>
          ) : (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                      {['Applicant', 'Role', 'Email', 'Date', 'Status', ''].map(h => (
                        <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((app) => {
                      const parsed = parseApplication(app.description)
                      const statusCfg = APP_STATUSES.find(s => s.val === app.status) ?? APP_STATUSES[0]
                      return (
                        <tr key={app.id}
                            onClick={() => setSelectedApp(app)}
                            style={{ borderBottom: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background .1s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.limeTint}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: C.lime, flexShrink: 0 }}>
                                {(parsed.name || 'A')[0].toUpperCase()}
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{parsed.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                            {app.title.replace('Job Application: ', '')}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                            {parsed.email || app.user_email}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                            {formatDate(app.created_at)}
                          </td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '3px 10px', color: statusCfg.color, background: statusCfg.bg, border: `0.5px solid ${statusCfg.border}` }}>
                              {statusCfg.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: 12, color: C.muted }}>
                            View →
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Full application detail view */}
      {mainTab === 'applications' && selectedApp && (() => {
        const app = selectedApp
        const parsed = parseApplication(app.description)
        const statusCfg = APP_STATUSES.find(s => s.val === app.status) ?? APP_STATUSES[0]
        const role = app.title.replace('Job Application: ', '')
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Back */}
            <button onClick={() => setSelectedApp(null)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer', padding: 0, width: 'fit-content' }}>
              ← Back to applications
            </button>

            {/* Header card */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: C.lime, flexShrink: 0 }}>
                    {(parsed.name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 17, fontWeight: 900, color: C.text, margin: '0 0 3px' }}>{parsed.name || 'Unknown'}</p>
                    <p style={{ fontSize: 13, color: C.muted, margin: '0 0 6px' }}>{parsed.currentRole || '—'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      {parsed.email && <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>{parsed.email}</span>}
                      {parsed.phone && <span style={{ fontSize: 12, color: C.muted }}>· {parsed.phone}</span>}
                      {parsed.address && <span style={{ fontSize: 12, color: C.muted }}>· {parsed.address}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, color: statusCfg.color, background: statusCfg.bg, border: `0.5px solid ${statusCfg.border}` }}>{statusCfg.label}</span>
                  <a href={`mailto:${parsed.email || app.user_email}?subject=Re: Your application for ${role}`}
                     style={{ height: 34, padding: '0 14px', borderRadius: 8, background: C.lime, color: C.dark, fontSize: 13, fontWeight: 900, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Reply
                  </a>
                </div>
              </div>

              {/* Quick stats bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                {[
                  { label: 'Role',        value: role             },
                  { label: 'Experience',  value: parsed.experience },
                  { label: 'Start date',  value: parsed.startDate },
                  { label: 'Found us via',value: parsed.source    },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: 10, color: C.muted, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700 }}>{s.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{s.value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Riazify + About */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 10px' }}>Why Riazify?</p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{parsed.whyRiazify || '—'}</p>
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 10px' }}>About themselves</p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{parsed.about || '—'}</p>
              </div>
            </div>

            {/* Links + details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 12px' }}>Professional links</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {parsed.linkedin && parsed.linkedin !== 'Not provided' ? (
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, margin: '0 0 2px', textTransform: 'uppercase' }}>LinkedIn</p>
                      <a href={parsed.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.limeDeep, textDecoration: 'none', wordBreak: 'break-all' }}>{parsed.linkedin}</a>
                    </div>
                  ) : <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>No LinkedIn provided</p>}
                  {parsed.cv && parsed.cv !== 'Not provided' ? (
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, margin: '0 0 2px', textTransform: 'uppercase' }}>CV / Resume</p>
                      <a href={parsed.cv} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.limeDeep, textDecoration: 'none', wordBreak: 'break-all' }}>{parsed.cv}</a>
                    </div>
                  ) : <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>No CV provided</p>}
                </div>
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 12px' }}>Employment details</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Employment type', value: parsed.employment  },
                    { label: 'Available to start', value: parsed.startDate },
                    { label: 'Applied on', value: formatDate(app.created_at) },
                  ].map(f => (
                    <div key={f.label}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, margin: '0 0 2px', textTransform: 'uppercase' }}>{f.label}</p>
                      <p style={{ fontSize: 13, color: C.text, margin: 0 }}>{f.value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Move to:</p>
                <ProDropdown
                  prefix=""
                  currentValue={app.status || 'open'}
                  options={APP_STATUSES.map(s => ({ val: s.val, label: s.label, enabled: true }))}
                  onChanged={async v => { await updateAppStatus(app.id, v); setSelectedApp({ ...app, status: v }) }}
                  width={160}
                  maxItems={5}
                />
              </div>
              <button onClick={async () => {
                await (supabase.from('tickets') as any).delete().eq('id', app.id)
                setApps(prev => prev.filter(a => a.id !== app.id))
                setSelectedApp(null)
                showToast('Application deleted')
              }} style={{ height: 34, padding: '0 14px', borderRadius: 8, border: `0.5px solid ${C.redBorder}`, background: C.redBg, color: C.red, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Trash2 size={13}/> Delete application
              </button>
            </div>

          </div>
        )
      })()}

      {mainTab === 'jobs' && view === 'template' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <button onClick={() => setView('list')} style={{ fontSize: 12, color: C.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              ← Back
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>Choose a template</h2>
          </div>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 20px' }}>Start from a pre-filled template or create from scratch</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {/* Blank option */}
            <button onClick={() => applyTemplate(null)}
                    style={{ padding: '20px 16px', borderRadius: 14, border: `2px dashed ${C.border}`, background: 'transparent', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Plus size={24} style={{ color: C.muted }}/>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>Blank</p>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Start from scratch</p>
            </button>

            {JOB_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => applyTemplate(t)}
                      style={{ padding: '20px 16px', borderRadius: 14, border: `1px solid ${C.border}`, background: C.surface, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8, transition: 'all .15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = `1px solid ${C.lime}`; (e.currentTarget as HTMLElement).style.background = C.limeTint }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = `1px solid ${C.border}`; (e.currentTarget as HTMLElement).style.background = C.surface }}>
                <t.icon size={22} style={{ color: C.limeDeep }}/>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{t.label}</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{t.department} · {t.location}</p>
                </div>
                <p style={{ fontSize: 11, color: C.limeDeep, margin: 0, fontWeight: 600 }}>Use template →</p>
              </button>
            ))}
          </div>
        </>
      )}

      {mainTab === 'jobs' && view === 'list' ? (
        <>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: '0 0 4px' }}>Careers Manager</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{jobs.length} posting{jobs.length !== 1 ? 's' : ''} total</p>
                {jobs.filter(j => j.is_published && j.status === 'Open').length > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenBg, border: `0.5px solid ${C.greenBorder}`, borderRadius: 100, padding: '1px 8px' }}>
                    {jobs.filter(j => j.is_published && j.status === 'Open').length} live
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href="/careers" target="_blank" rel="noopener noreferrer"
                 style={{ fontSize: 12, color: C.muted, background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                <ExternalLink size={12}/> Preview page
              </a>
              <button onClick={load} style={{ fontSize: 12, color: C.muted, background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <RefreshCw size={12}/> Refresh
              </button>
              <button onClick={openNew} style={{ fontSize: 12, fontWeight: 700, background: C.lime, color: C.dark, border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Plus size={14}/> New Job
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}` }}>
            {([
              { key: 'all',       label: 'All',       count: jobs.length },
              { key: 'published', label: 'Published',  count: jobs.filter(j => j.is_published && j.status === 'Open').length },
              { key: 'draft',     label: 'Draft',      count: jobs.filter(j => !j.is_published).length },
              { key: 'closed',    label: 'Closed',     count: jobs.filter(j => j.status === 'Closed').length },
            ] as const).map(f => {
              const isActive = filter === f.key
              return (
                <button key={f.key} onClick={() => setFilter(f.key)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: '8px 8px 0 0', border: 'none', borderBottom: isActive ? `2px solid ${C.lime}` : '2px solid transparent', background: isActive ? C.limeTint : 'transparent', color: isActive ? C.dark : C.muted, fontSize: 12, fontWeight: isActive ? 700 : 500, cursor: 'pointer' }}>
                  {f.label}
                  <span style={{ fontSize: 10, fontWeight: 700, background: isActive ? C.lime : C.border, color: isActive ? C.dark : C.muted, borderRadius: 100, padding: '0 5px' }}>{f.count}</span>
                </button>
              )
            })}
          </div>

          {/* Job list */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <RefreshCw size={20} style={{ color: C.muted, animation: 'spin 1s linear infinite' }}/>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
              <Briefcase size={32} style={{ color: C.muted, marginBottom: 12 }}/>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>
                {filter === 'published' ? 'No published jobs' : filter === 'draft' ? 'No draft jobs' : filter === 'closed' ? 'No closed jobs' : 'No job postings yet'}
              </p>
              <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px' }}>
                {filter === 'all' ? 'Click "New Job" to create your first posting' : `No ${filter} postings found`}
              </p>
              {filter === 'all' && (
                <button onClick={openNew} style={{ fontSize: 12, fontWeight: 700, background: C.lime, color: C.dark, border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>
                  + New Job
                </button>
              )}
            </div>
          ) : (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                    {['Title', 'Department', 'Location', 'Type', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job, idx) => (
                    <tr key={job.id} style={{ borderBottom: idx < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title}</td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.limeDeep, background: C.limeTint, border: `0.5px solid ${C.lime}`, borderRadius: 100, padding: '2px 8px' }}>{job.department}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>{job.location}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>{job.type}</td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '2px 8px',
                          color: job.is_published && job.status === 'Open' ? C.green : !job.is_published ? C.muted : C.red,
                          background: job.is_published && job.status === 'Open' ? C.greenBg : !job.is_published ? C.bg : C.redBg,
                          border: `0.5px solid ${job.is_published && job.status === 'Open' ? C.greenBorder : !job.is_published ? C.border : C.redBorder}`,
                        }}>
                          {job.is_published && job.status === 'Open' ? 'Published' : !job.is_published ? 'Draft' : 'Closed'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>{formatDate(job.created_at)}</td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button onClick={() => togglePublish(job)} title={job.is_published ? 'Unpublish' : 'Publish'}
                                  style={{ width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {job.is_published ? <EyeOff size={12} style={{ color: C.muted }}/> : <Eye size={12} style={{ color: C.muted }}/>}
                          </button>
                          <button onClick={() => openEdit(job)} title="Edit"
                                  style={{ width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Edit2 size={12} style={{ color: C.muted }}/>
                          </button>
                          <button onClick={() => duplicateJob(job)} disabled={duplicating === job.id} title="Duplicate"
                                  style={{ width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {duplicating === job.id ? <RefreshCw size={10} style={{ color: C.muted, animation: 'spin 1s linear infinite' }}/> : <Copy size={12} style={{ color: C.muted }}/>}
                          </button>
                          <button onClick={() => deleteJob(job.id)} disabled={deleting === job.id} title="Delete"
                                  style={{ width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${C.redBorder}`, background: C.redBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {deleting === job.id ? <RefreshCw size={10} style={{ color: C.red, animation: 'spin 1s linear infinite' }}/> : <Trash2 size={12} style={{ color: C.red }}/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </>
      ) : mainTab === 'jobs' && view === 'edit' ? (
        <>
          {/* Edit form */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <button onClick={() => setView('list')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              ← Back
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>{isNew ? 'New Job Posting' : 'Edit Job Posting'}</h2>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Job Title *</label>
              <input type="text" placeholder="e.g. Senior Frontend Developer" value={editJob.title ?? ''}
                     onChange={e => setEditJob(j => ({ ...j, title: e.target.value }))} style={inputStyle}/>
            </div>

            {/* Department + Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Department</label>
                <ProDropdown prefix="" currentValue={editJob.department ?? 'Engineering'}
                             options={DEPARTMENTS.map(d => ({ val: d, label: d, enabled: true }))}
                             onChanged={v => setEditJob(j => ({ ...j, department: v }))} width="full"/>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Location</label>
                <ProDropdown prefix="" currentValue={editJob.location ?? 'Remote'}
                             options={LOCATIONS.map(l => ({ val: l, label: l, enabled: true }))}
                             onChanged={v => setEditJob(j => ({ ...j, location: v }))} width="full"/>
              </div>
            </div>

            {/* Type + Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Type</label>
                <ProDropdown prefix="" currentValue={editJob.type ?? 'Full-time'}
                             options={TYPES.map(t => ({ val: t, label: t, enabled: true }))}
                             onChanged={v => setEditJob(j => ({ ...j, type: v }))} width="full"/>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Status</label>
                <ProDropdown prefix="" currentValue={editJob.status ?? 'Open'}
                             options={STATUSES.map(s => ({ val: s, label: s, enabled: true }))}
                             onChanged={v => setEditJob(j => ({ ...j, status: v }))} width="full"/>
              </div>
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Description</label>
              <textarea rows={5} placeholder="Describe the role, responsibilities and what success looks like..."
                        value={editJob.description ?? ''} onChange={e => setEditJob(j => ({ ...j, description: e.target.value }))}
                        style={textareaStyle}/>
            </div>

            {/* Requirements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Requirements</label>
              <textarea rows={4} placeholder="List required skills, experience and qualifications..."
                        value={editJob.requirements ?? ''} onChange={e => setEditJob(j => ({ ...j, requirements: e.target.value }))}
                        style={textareaStyle}/>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
              <button onClick={() => setView('list')} style={{ height: 38, padding: '0 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => save(false)} disabled={saving}
                      style={{ height: 38, padding: '0 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button onClick={() => save(true)} disabled={saving}
                      style={{ height: 38, padding: '0 20px', borderRadius: 10, border: 'none', background: C.lime, color: C.dark, fontSize: 13, fontWeight: 900, cursor: 'pointer' }}>
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </>
      ) : null}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}