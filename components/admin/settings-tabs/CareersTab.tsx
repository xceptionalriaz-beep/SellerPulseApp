'use client'
// components/admin/settings-tabs/CareersTab.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useTabPermissions } from '@/hooks/useTabPermissions'
import {
  Plus, Edit2, Trash2, Eye, EyeOff, RefreshCw,
  Check, X, Briefcase, MapPin, Clock, Copy, ExternalLink,
  HeadphonesIcon, Code2, Megaphone, Pen, BarChart, FileText
} from 'lucide-react'
import ProDropdown from '@/components/ui/ProDropdown'
import CareerEmailTemplates from '@/components/admin/settings-tabs/CareerEmailTemplates'

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
  ai_score?:   AIScore | null
  notes?:      string | null
}

interface AIScore {
  overall:       number
  relevance:     number
  experience:    number
  communication: number
  culture:       number
  motivation:    number
  recommendation: 'invite' | 'maybe' | 'pass'
  summary:       string
  green_flags:   string[]
  red_flags:     string[]
  screened_at:   string
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
  const { can } = useTabPermissions('careers')
  const supabase = createClient()
  const [mainTab, setMainTab]       = useState<'jobs' | 'applications'>('jobs')
  const [apps, setApps]             = useState<Application[]>([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [selectedApp, setSelectedApp]     = useState<Application | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [screeningId, setScreeningId]       = useState<string | null>(null)
  const [screeningAll, setScreeningAll]     = useState(false)
  const [aiScores, setAiScores]             = useState<Record<string, AIScore>>({})
  const [jobs, setJobs]                     = useState<Job[]>([])
  const [loading, setLoading]               = useState(true)
  const [filter, setFilter]                 = useState<'all' | 'published' | 'draft' | 'closed'>('all')
  const [appFilter, setAppFilter]           = useState<'all' | 'open' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'>('all')
  const [appSearch, setAppSearch]           = useState('')
  const [appSort, setAppSort]               = useState<'score' | 'date' | 'name' | 'status'>('score')
  const [editingNote, setEditingNote]       = useState<string | null>(null)
  const [noteText, setNoteText]             = useState('')
  const [savingNote, setSavingNote]         = useState(false)
  const [view, setView]                     = useState<'list' | 'template' | 'edit'>('list')
  const [editJob, setEditJob]               = useState<Partial<Job>>(emptyJob())
  const [isNew, setIsNew]                   = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [deleting, setDeleting]             = useState<string | null>(null)
  const [duplicating, setDuplicating]       = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete]   = useState<{ id: string; label: string; type: 'job' | 'app' } | null>(null)
  const [toast, setToast]                   = useState<string | null>(null)

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
      .select('id, title, description, user_email, status, created_at, ai_score, notes')
      .like('title', 'Job Application:%')
      .order('created_at', { ascending: false })
    const appData = data ?? []
    setApps(appData)
    // Restore saved AI scores from DB
    const savedScores: Record<string, AIScore> = {}
    appData.forEach((a: any) => {
      if (a.ai_score) savedScores[a.id] = a.ai_score
    })
    setAiScores(prev => ({ ...savedScores, ...prev }))
    setLoadingApps(false)
  }, [supabase])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadApps() }, [loadApps]) // load apps always for job applicant counts


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
    setConfirmDelete(null)
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

  async function saveNote(id: string) {
    setSavingNote(true)
    await (supabase.from('tickets') as any).update({ notes: noteText }).eq('id', id)
    setApps(prev => prev.map(a => a.id === id ? { ...a, notes: noteText } : a))
    if (selectedApp?.id === id) setSelectedApp(prev => prev ? { ...prev, notes: noteText } : prev)
    showToast('Note saved!')
    setEditingNote(null)
    setSavingNote(false)
  }

  async function deleteApp(id: string) {
    setDeleting(id)
    await (supabase.from('tickets') as any).delete().eq('id', id)
    setApps(prev => prev.filter(a => a.id !== id))
    if (selectedApp?.id === id) setSelectedApp(null)
    showToast('Application deleted')
    setDeleting(null)
    setConfirmDelete(null)
  }

  async function updateAppStatus(id: string, status: string) {
    setUpdatingStatus(id)
    await (supabase.from('tickets') as any).update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    showToast('Status updated!')
    setUpdatingStatus(null)
  }

  function ruleBasedScreen(app: Application, jobDesc?: string): AIScore {
    const parsed    = parseApplication(app.description)
    const roleTitle = app.title.replace('Job Application: ', '')
    const roleLower = roleTitle.toLowerCase()

    const normalize = (t: string) => t.toLowerCase()
      .replace(/e-commerce/g, 'ecommerce').replace(/saas/gi, 'saas')

    const why         = normalize(parsed.whyRiazify ?? '').trim()
    const about       = normalize(parsed.about ?? '').trim()
    const currentRole = normalize(parsed.currentRole ?? '')
    const full        = `${why} ${about} ${currentRole}`

    // ── EXPERIENCE ──────────────────────────────────────────────
    const expRaw = (parsed.experience ?? '').toLowerCase()
    let expScore = 30
    if (expRaw.includes('10'))                              expScore = 100
    else if (expRaw.includes('5') && expRaw.includes('10')) expScore = 85
    else if (expRaw.includes('3') && expRaw.includes('5'))  expScore = 68
    else if (expRaw.includes('1') && expRaw.includes('2'))  expScore = 42
    else if (expRaw.includes('less') || expRaw.includes('0')) expScore = 18

    // ── RELEVANCE ───────────────────────────────────────────────
    const stopWords = new Set(['the','and','for','with','that','this','have','will','from','they','been','their','into','also','more','some','what','about','which','when','your','our','are','was','were'])
    const roleWords = roleLower.split(/\W+/).filter((w: string) => w.length > 3 && !stopWords.has(w))
    const jdNorm    = normalize(jobDesc ?? '')
    const jdWords   = jdNorm.split(/\W+/).filter((w: string) => w.length > 4 && !stopWords.has(w))
    const domainMap: Record<string, string[]> = {
      marketing: ['marketing','growth','acquisition','content','seo','paid','organic','campaign','brand','social','analytics','conversion','retention','ecommerce','saas'],
      developer: ['developer','engineer','react','typescript','nextjs','supabase','api','frontend','backend','software','code'],
      support:   ['support','customer','service','help','ticket','resolve','satisfaction','communication','ebay','seller'],
      design:    ['design','figma','ui','ux','visual','prototype','wireframe','interface'],
      analyst:   ['data','analyst','analytics','sql','dashboard','report','insight','metrics','kpi'],
    }
    const domainKey     = Object.keys(domainMap).find((k: string) => roleLower.includes(k)) ?? ''
    const extraKeywords = domainMap[domainKey] ?? []
    const allKeywords   = [...new Set([...roleWords, ...jdWords, ...extraKeywords])].slice(0, 50)
    const hits          = allKeywords.filter((kw: string) => full.includes(kw)).length
    let relevanceScore  = allKeywords.length > 0
      ? Math.round((hits / allKeywords.length) * 140)
      : 35
    const roleAlignWords = roleWords.filter((w: string) => currentRole.includes(w))
    if (roleAlignWords.length >= 2)           relevanceScore += 25
    else if (roleAlignWords.length === 1)     relevanceScore += 12
    if (domainKey && full.includes(domainKey)) relevanceScore += 15
    relevanceScore = Math.max(10, Math.min(100, relevanceScore))

    // ── MOTIVATION ──────────────────────────────────────────────
    const riazifySpecific   = ['ebay','riazify','seller','ecommerce','marketplace','listing','saas']
    const motivationSignals = ['mission','passionate','excited','believe','opportunity','product','platform','solve','problem','help','impact','build','fast growing','fast-growing','startup','small team','big mission']
    const specificHits      = riazifySpecific.filter((kw: string) => why.includes(kw)).length
    const generalHits       = motivationSignals.filter((kw: string) => why.includes(kw)).length
    const whyLength         = why.length
    const genericPhrases    = ['great company','exciting opportunity','dream job','always wanted','perfect fit','love to join']
    const genericHits       = genericPhrases.filter((p: string) => why.includes(p)).length

    let motivationScore = specificHits * 20 + generalHits * 7
    if (whyLength > 300)      motivationScore += 18
    else if (whyLength > 150) motivationScore += 10
    else if (whyLength > 80)  motivationScore += 4
    else if (whyLength < 40)  motivationScore -= 25
    if (why.includes('riazify')) motivationScore += 10
    if (why.includes('ebay'))    motivationScore += 10
    motivationScore -= genericHits * 10
    motivationScore = Math.max(5, Math.min(100, motivationScore))

    // ── COMMUNICATION ───────────────────────────────────────────
    const totalLength  = why.length + about.length
    const hasNumbers   = /\d+\s*%|\d+\s*(years?|months?|people|team|million|k\b|revenue|users?|customers?)/i.test(full)
    const hasAchieve   = /\b(built|grew|led|managed|launched|increased|reduced|delivered|achieved|created|improved|scaled|saved)\b/i.test(full)
    const hasSpecifics = /\b(at [A-Z][a-z]+|[A-Z][a-z]+\.com|shopify|amazon|noon|flipkart|alibaba|google|meta|microsoft)\b/i.test(full)
    const sentences    = (why + ' ' + about).split(/[.!?]+/).filter((s: string) => s.trim().length > 10).length

    let commScore = 0
    if (totalLength > 400)      commScore += 38
    else if (totalLength > 200) commScore += 26
    else if (totalLength > 100) commScore += 16
    else                        commScore += 5
    if (sentences >= 6)  commScore += 15
    else if (sentences >= 3) commScore += 8
    if (hasNumbers)   commScore += 22
    if (hasAchieve)   commScore += 16
    if (hasSpecifics) commScore += 12
    commScore = Math.max(5, Math.min(100, commScore))

    // ── CULTURE FIT ─────────────────────────────────────────────
    const culturePositive = ['ownership','accountability','initiative','self-starter','autonomous','ship','iterate','move fast','startup','founder','remote','async','results','outcome','fast','impact']
    const cultureNegative = ['corporate','bureaucracy','approval chain','stable job','9 to 5','9-to-5']
    const posHits    = culturePositive.filter((kw: string) => full.includes(kw)).length
    const negHits    = cultureNegative.filter((kw: string) => full.includes(kw)).length
    const startStr   = normalize(parsed.startDate ?? '')
    const startBonus = startStr.includes('immediately') ? 20 : startStr.includes('2 week') ? 12 : startStr.includes('1 month') ? 6 : 0
    let cultureScore = 30 + (posHits * 10) - (negHits * 15) + startBonus
    cultureScore = Math.max(10, Math.min(100, cultureScore))

    // ── OVERALL ─────────────────────────────────────────────────
    const overall = Math.round(
      expScore * 0.30 + relevanceScore * 0.25 +
      motivationScore * 0.20 + commScore * 0.15 + cultureScore * 0.10
    )

    const recommendation: 'invite' | 'maybe' | 'pass' =
      overall >= 68 ? 'invite' : overall >= 44 ? 'maybe' : 'pass'

    // ── FLAGS ───────────────────────────────────────────────────
    const green: string[] = []
    if (expScore >= 82)              green.push(`Strong experience: ${parsed.experience}`)
    if (specificHits >= 2)           green.push('Specifically mentions eBay/ecommerce/Riazify')
    else if (specificHits === 1)     green.push('Shows awareness of the ecommerce/Riazify space')
    if (hasNumbers)                  green.push('Uses specific numbers and metrics')
    if (hasAchieve)                  green.push('Mentions concrete achievements (built, grew, led)')
    if (whyLength > 200)             green.push('Detailed and thoughtful Why Riazify answer')
    if (startBonus >= 12)            green.push(`Available to start ${parsed.startDate?.toLowerCase() ?? 'soon'}`)
    if (roleAlignWords.length >= 2)  green.push('Current role directly aligns with this position')
    if (parsed.linkedin && parsed.linkedin !== 'Not provided') green.push('LinkedIn profile provided')
    if (parsed.cv && parsed.cv !== 'Not provided')             green.push('CV/Resume provided')

    const red: string[] = []
    if (expScore < 42)               red.push(`Experience (${parsed.experience ?? 'unknown'}) may be insufficient`)
    if (whyLength < 60)              red.push('Why Riazify answer is very short')
    if (about.length < 60)           red.push('About section is too brief')
    if (specificHits === 0)          red.push('No mention of eBay, ecommerce or Riazify')
    if (!parsed.linkedin || parsed.linkedin === 'Not provided') red.push('No LinkedIn profile provided')
    if (!parsed.cv || parsed.cv === 'Not provided')             red.push('No CV/Resume provided')
    if (genericHits >= 2)            red.push('Why Riazify answer feels generic')
    if (relevanceScore < 30)         red.push('Background does not closely match role requirements')

    const topGreen = green[0] ?? 'Some positive signals noted'
    const topRed   = red[0]   ?? 'no critical concerns'
    const summaryMap = {
      invite: `Strong candidate for ${roleTitle}. ${topGreen}. ${red.length === 0 ? 'No major concerns.' : `Minor concern: ${topRed.toLowerCase()}.`}`,
      maybe:  `Potential candidate for ${roleTitle} with some gaps. ${topGreen}. Key concern: ${topRed.toLowerCase()}.`,
      pass:   `Weak match for ${roleTitle}. ${topRed}. ${green.length > 0 ? `One positive: ${topGreen.toLowerCase()}.` : 'Does not meet key requirements.'}`,
    }

    return {
      overall, relevance: relevanceScore, experience: expScore,
      communication: commScore, culture: cultureScore, motivation: motivationScore,
      recommendation, summary: summaryMap[recommendation],
      green_flags: green.slice(0, 5), red_flags: red.slice(0, 4),
      screened_at: new Date().toISOString(),
    }
  }

  async function screenOne(app: Application) {
    setScreeningId(app.id)
    await new Promise(r => setTimeout(r, 600))
    const job   = jobs.find(j => j.title === app.title.replace('Job Application: ', ''))
    const score = ruleBasedScreen(app, job ? `${job.description}\n${job.requirements}` : '')
    setAiScores(prev => ({ ...prev, [app.id]: score }))
    // Save to DB
    await (supabase.from('tickets') as any).update({ ai_score: score }).eq('id', app.id)
    if (selectedApp?.id === app.id) setSelectedApp({ ...app })
    showToast(`${parseApplication(app.description).name || 'Applicant'} screened!`)
    setScreeningId(null)
  }

  async function screenAll() {
    setScreeningAll(true)
    for (const app of apps) {
      setScreeningId(app.id)
      await new Promise(r => setTimeout(r, 300))
      const job   = jobs.find(j => j.title === app.title.replace('Job Application: ', ''))
      const score = ruleBasedScreen(app, job ? `${job.description}\n${job.requirements}` : '')
      setAiScores(prev => ({ ...prev, [app.id]: score }))
      // Save to DB
      await (supabase.from('tickets') as any).update({ ai_score: score }).eq('id', app.id)
    }
    setScreeningId(null)
    setScreeningAll(false)
    showToast('All applications screened!')
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
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: C.dark, border: `1px solid ${C.lime}`, borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <Check size={14} style={{ color: C.lime }}/><span style={{ fontSize: 13, fontWeight: 700, color: C.lime }}>{toast}</span>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
             onClick={() => setConfirmDelete(null)}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 24, maxWidth: 400, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}
               onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 16, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>Delete {confirmDelete.type === 'job' ? 'job posting' : 'application'}?</p>
            <p style={{ fontSize: 13, color: C.muted, margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>"{confirmDelete.label}"</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)}
                      style={{ height: 36, padding: '0 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => confirmDelete.type === 'job' ? deleteJob(confirmDelete.id) : deleteApp(confirmDelete.id)}
                      disabled={!!deleting}
                      style={{ height: 36, padding: '0 16px', borderRadius: 8, border: 'none', background: C.red, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {deleting ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }}/> : <Trash2 size={13}/>} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main tabs + actions bar */}
      {view === 'list' && !selectedApp && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
          {/* Tabs left */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { key: 'jobs' as const,        label: 'Job Postings', count: jobs.length },
              { key: 'applications' as const, label: 'Applications', count: apps.length },
            ].map(t => {
              const isActive = mainTab === t.key
              return (
                <button key={t.key} onClick={() => setMainTab(t.key)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '8px 8px 0 0', border: 'none', borderBottom: isActive ? `2px solid ${C.lime}` : '2px solid transparent', background: isActive ? C.limeTint : 'transparent', color: isActive ? C.dark : C.muted, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: 'pointer' }}>
                  {t.label}
                  {t.count > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: isActive ? C.lime : C.border, color: isActive ? C.dark : C.muted, borderRadius: 100, padding: '0 6px' }}>{t.count}</span>}
                  {t.key === 'jobs' && jobs.filter(j => j.is_published && j.status === 'Open').length > 0 && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: C.green, background: C.greenBg, border: `0.5px solid ${C.greenBorder}`, borderRadius: 100, padding: '0 5px' }}>
                      {jobs.filter(j => j.is_published && j.status === 'Open').length} live
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {/* Actions right */}
          <div style={{ display: 'flex', gap: 6, paddingBottom: 4 }}>
            {mainTab === 'jobs' && (
              <>
                <a href="/careers" target="_blank" rel="noopener noreferrer"
                   style={{ fontSize: 12, color: C.muted, background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                  <ExternalLink size={11}/> Preview
                </a>
                <button onClick={load} style={{ fontSize: 12, color: C.muted, background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <RefreshCw size={11}/> Refresh
                </button>
                {can('create_job') && <button onClick={openNew} style={{ fontSize: 12, fontWeight: 700, background: C.lime, color: C.dark, border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Plus size={13}/> New Job
                </button>}
              </>
            )}
            {mainTab === 'applications' && (
              <>
                <button onClick={loadApps} style={{ fontSize: 12, color: C.muted, background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <RefreshCw size={11}/> Refresh
                </button>
                {apps.length > 0 && can('run_ai_screening') && (
                  <button onClick={screenAll} disabled={screeningAll}
                          style={{ fontSize: 12, fontWeight: 700, background: screeningAll ? C.border : C.dark, color: screeningAll ? C.muted : C.lime, border: 'none', borderRadius: 8, padding: '5px 12px', cursor: screeningAll ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {screeningAll ? <><RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }}/> Screening...</> : '✦ AI Screen All'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Applications view */}
      {mainTab === 'applications' && view === 'list' && !selectedApp && (
        <>
          {/* App filter tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}` }}>
            {([
              { key: 'all',         label: 'All',          count: apps.length },
              { key: 'open',        label: 'New',          count: apps.filter(a => a.status === 'open').length },
              { key: 'reviewing',   label: 'Under Review', count: apps.filter(a => a.status === 'reviewing').length },
              { key: 'shortlisted', label: 'Shortlisted',  count: apps.filter(a => a.status === 'shortlisted').length },
              { key: 'rejected',    label: 'Rejected',     count: apps.filter(a => a.status === 'rejected').length },
              { key: 'hired',       label: 'Hired',        count: apps.filter(a => a.status === 'hired').length },
            ] as const).map(f => {
              const isActive = appFilter === f.key
              return (
                <button key={f.key} onClick={() => setAppFilter(f.key)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: '6px 6px 0 0', border: 'none', borderBottom: isActive ? `2px solid ${C.lime}` : '2px solid transparent', background: isActive ? C.limeTint : 'transparent', color: isActive ? C.dark : C.muted, fontSize: 12, fontWeight: isActive ? 700 : 500, cursor: 'pointer' }}>
                  {f.label}
                  {f.count > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: isActive ? C.lime : C.border, color: isActive ? C.dark : C.muted, borderRadius: 100, padding: '0 5px' }}>{f.count}</span>}
                </button>
              )
            })}
          </div>

          {/* Search + Sort bar */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by name, role or email..."
                value={appSearch}
                onChange={e => setAppSearch(e.target.value)}
                style={{ width: '100%', height: 36, padding: '0 12px 0 34px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.dark, outline: 'none', fontFamily: 'Inter, sans-serif', background: C.surface, boxSizing: 'border-box' }}
              />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" style={{ position: 'absolute', left: 10, top: 11 }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              {appSearch && (
                <button onClick={() => setAppSearch('')}
                        style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 14, lineHeight: 1 }}>×</button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Sort:</span>
              {([
                { key: 'score', label: 'AI Score' },
                { key: 'date',  label: 'Date'     },
                { key: 'name',  label: 'Name'     },
                { key: 'status',label: 'Status'   },
              ] as const).map(s => (
                <button key={s.key} onClick={() => setAppSort(s.key)}
                        style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${appSort === s.key ? C.lime : C.border}`, background: appSort === s.key ? C.limeTint : 'transparent', color: appSort === s.key ? C.limeDeep : C.muted, cursor: 'pointer' }}>
                  {s.label}
                </button>
              ))}
            </div>
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
                      {['Applicant', 'Role', 'AI Score', 'Status', 'Date', ''].map(h => (
                        <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...apps]
                    .filter(a => appFilter === 'all' || a.status === appFilter)
                    .filter(a => {
                      if (!appSearch) return true
                      const parsed = parseApplication(a.description)
                      const search = appSearch.toLowerCase()
                      return (
                        (parsed.name ?? '').toLowerCase().includes(search) ||
                        a.title.toLowerCase().includes(search) ||
                        (parsed.email ?? '').toLowerCase().includes(search) ||
                        a.user_email.toLowerCase().includes(search)
                      )
                    })
                    .sort((a, b) => {
                      if (appSort === 'score') {
                        const sa = aiScores[a.id]?.overall ?? -1
                        const sb = aiScores[b.id]?.overall ?? -1
                        return sb - sa
                      }
                      if (appSort === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      if (appSort === 'name') {
                        const na = parseApplication(a.description).name ?? ''
                        const nb = parseApplication(b.description).name ?? ''
                        return na.localeCompare(nb)
                      }
                      if (appSort === 'status') return a.status.localeCompare(b.status)
                      return 0
                    }).map((app) => {
                      const parsed = parseApplication(app.description)
                      const statusCfg = APP_STATUSES.find(s => s.val === app.status) ?? APP_STATUSES[0]
                      const score = aiScores[app.id]
                      const isScreening = screeningId === app.id
                      const recColor = score?.recommendation === 'invite' ? C.green : score?.recommendation === 'maybe' ? '#b45309' : C.red
                      const recBg = score?.recommendation === 'invite' ? C.greenBg : score?.recommendation === 'maybe' ? '#fffbeb' : C.redBg
                      const recBorder = score?.recommendation === 'invite' ? C.greenBorder : score?.recommendation === 'maybe' ? '#fde68a' : C.redBorder
                      const recLabel = score?.recommendation === 'invite' ? '🟢 Invite' : score?.recommendation === 'maybe' ? '🟡 Maybe' : '🔴 Pass'
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
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                            {isScreening ? (
                              <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }}/> Screening...
                              </span>
                            ) : score ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: 16, fontWeight: 900, color: score.overall >= 75 ? C.green : score.overall >= 50 ? '#b45309' : C.red }}>{score.overall}</span>
                                  <span style={{ fontSize: 11, color: C.muted }}>/100</span>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, color: recColor, background: recBg, border: `0.5px solid ${recBorder}` }}>
                                  {recLabel}
                                </span>
                              </div>
                            ) : can('run_ai_screening') ? (
                              <button onClick={e => { e.stopPropagation(); screenOne(app) }}
                                      style={{ fontSize: 11, fontWeight: 700, color: C.limeDeep, background: C.limeTint, border: `0.5px solid ${C.lime}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                                ✦ Screen
                              </button>
                            ) : null}
                          </td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '3px 10px', color: statusCfg.color, background: statusCfg.bg, border: `0.5px solid ${statusCfg.border}` }}>
                              {statusCfg.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                            {formatDate(app.created_at)}
                          </td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: 12, color: C.muted }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {app.notes && <span style={{ fontSize: 10, color: C.limeDeep, background: C.limeTint, border: `0.5px solid ${C.lime}`, borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>Note</span>}
                            <span style={{ color: C.muted, fontSize: 12 }}>View →</span>
                          </div>
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
        const score = aiScores[app.id]
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
                  <CareerEmailTemplates
                    applicantName={parsed.name || 'Applicant'}
                    applicantEmail={parsed.email || app.user_email}
                    role={role}
                  />
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

            {/* AI Score card */}
            {score ? (
              <div style={{ background: C.dark, borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.lime }}>✦ AI SCREENING RESULT</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Screened {new Date(score.screened_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: score.overall >= 75 ? C.lime : score.overall >= 50 ? '#fbbf24' : '#f87171' }}>{score.overall}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>/100</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, marginLeft: 4,
                      background: score.recommendation === 'invite' ? 'rgba(143,255,0,0.15)' : score.recommendation === 'maybe' ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)',
                      color: score.recommendation === 'invite' ? C.lime : score.recommendation === 'maybe' ? '#fbbf24' : '#f87171',
                      border: `0.5px solid ${score.recommendation === 'invite' ? 'rgba(143,255,0,0.3)' : score.recommendation === 'maybe' ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    }}>
                      {score.recommendation === 'invite' ? '🟢 Invite to call' : score.recommendation === 'maybe' ? '🟡 Maybe' : '🔴 Pass'}
                    </span>
                  </div>
                </div>

                {/* Score bars */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 16 }}>
                  {[
                    { label: 'Relevance',     val: score.relevance     },
                    { label: 'Experience',    val: score.experience    },
                    { label: 'Communication', val: score.communication },
                    { label: 'Culture fit',   val: score.culture       },
                    { label: 'Motivation',    val: score.motivation    },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', width: 100, flexShrink: 0 }}>{s.label}</span>
                      <div style={{ flex: 1, height: 6, borderRadius: 100, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 100, width: `${s.val}%`,
                          background: s.val >= 75 ? C.lime : s.val >= 50 ? '#fbbf24' : '#f87171',
                          transition: 'width 0.8s ease' }}/>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', width: 28, textAlign: 'right' }}>{s.val}</span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 12px', lineHeight: 1.6, fontStyle: 'italic' }}>"{score.summary}"</p>

                {/* Flags */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {score.green_flags.length > 0 && (
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: C.lime, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Green flags</p>
                      {score.green_flags.map((f, i) => (
                        <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 3px', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: C.lime, flexShrink: 0 }}>✓</span>{f}
                        </p>
                      ))}
                    </div>
                  )}
                  {score.red_flags.length > 0 && (
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#f87171', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Red flags</p>
                      {score.red_flags.map((f, i) => (
                        <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 3px', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: '#f87171', flexShrink: 0 }}>✗</span>{f}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ background: C.bg, border: `1px dashed ${C.border}`, borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>✦ AI Screening not run yet</p>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Run AI screening to get a score, recommendation and flag analysis</p>
                </div>
                {can('run_ai_screening') && <button onClick={() => screenOne(selectedApp!)} disabled={screeningId === app.id}
                        style={{ height: 38, padding: '0 18px', borderRadius: 10, background: C.dark, color: C.lime, border: 'none', fontSize: 13, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {screeningId === app.id ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/> Screening...</> : '✦ Run AI Screen'}
                </button>}
              </div>
            )}

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

            {/* Notes */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>Private notes</p>
                {editingNote !== app.id ? (
                  <button onClick={() => { setEditingNote(app.id); setNoteText(app.notes ?? '') }}
                          style={{ fontSize: 11, fontWeight: 700, color: C.limeDeep, background: C.limeTint, border: `0.5px solid ${C.lime}`, borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>
                    {app.notes ? 'Edit note' : '+ Add note'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditingNote(null)}
                            style={{ fontSize: 11, color: C.muted, background: 'transparent', border: `0.5px solid ${C.border}`, borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={() => saveNote(app.id)} disabled={savingNote}
                            style={{ fontSize: 11, fontWeight: 700, color: C.dark, background: C.lime, border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>
                      {savingNote ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
              {editingNote === app.id ? (
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add private notes about this applicant — only visible to your team..."
                  rows={4}
                  autoFocus
                  style={{ width: '100%', fontSize: 13, color: C.dark, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', outline: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box' }}
                />
              ) : app.notes ? (
                <p style={{ fontSize: 13, color: C.dark, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{app.notes}</p>
              ) : (
                <p style={{ fontSize: 13, color: C.muted, margin: 0, fontStyle: 'italic' }}>No notes yet. Click "Add note" to add private comments about this applicant.</p>
              )}
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
              {can('delete_application') && <button onClick={() => setConfirmDelete({ id: app.id, label: parseApplication(app.description).name || 'this application', type: 'app' })}
                      style={{ height: 34, padding: '0 14px', borderRadius: 8, border: `0.5px solid ${C.redBorder}`, background: C.redBg, color: C.red, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Trash2 size={13}/> Delete application
              </button>}
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
              {filter === 'all' && can('create_job') && (
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
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{job.title}</span>
                          {apps.filter(a => a.title === `Job Application: ${job.title}`).length > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.limeDeep, background: C.limeTint, border: `0.5px solid ${C.lime}`, borderRadius: 100, padding: '1px 6px', flexShrink: 0 }}>
                              {apps.filter(a => a.title === `Job Application: ${job.title}`).length} applied
                            </span>
                          )}
                        </div>
                      </td>
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
                          {can('publish_job') && <button onClick={() => togglePublish(job)} title={job.is_published ? 'Unpublish' : 'Publish'}
                                  style={{ width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {job.is_published ? <EyeOff size={12} style={{ color: C.muted }}/> : <Eye size={12} style={{ color: C.muted }}/>}
                          </button>}
                          {can('edit_job') && <button onClick={() => openEdit(job)} title="Edit"
                                  style={{ width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Edit2 size={12} style={{ color: C.muted }}/>
                          </button>}
                          <button onClick={() => duplicateJob(job)} disabled={duplicating === job.id} title="Duplicate"
                                  style={{ width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {duplicating === job.id ? <RefreshCw size={10} style={{ color: C.muted, animation: 'spin 1s linear infinite' }}/> : <Copy size={12} style={{ color: C.muted }}/>}
                          </button>
                          {can('delete_job') && <button onClick={() => setConfirmDelete({ id: job.id, label: job.title, type: 'job' })} title="Delete"
                                  style={{ width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${C.redBorder}`, background: C.redBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={12} style={{ color: C.red }}/>
                          </button>}
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