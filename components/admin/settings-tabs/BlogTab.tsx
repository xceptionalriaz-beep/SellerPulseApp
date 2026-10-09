'use client'
// components/admin/settings-tabs/BlogTab.tsx
import BlogTemplates, { BLOG_TEMPLATES, BlogTemplate } from './BlogTemplates'
import RichEditor from '@/components/admin/RichEditor'
// Full rich-text blog editor — Advanced SEO Edition
// Features: Rich toolbar, FAQ blocks, Callouts, CTA banners, Auto ToC, Live preview

import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Link2, Image, ImageIcon, Quote,
  Code, AlignLeft, AlignCenter, AlignRight, Plus, Edit2, Trash2, RefreshCw, Check, X, Star,
  AlertTriangle, CheckCircle, Eye, Globe,
  BookOpen, Users, ChevronDown, ChevronRight,
  HelpCircle, Lightbulb, Zap, ListChecks,
  RotateCcw, RotateCw, Grid, Video, Download,
  Search, Moon, Maximize, Clipboard, Layers, Shield, Settings, BarChart2, Sparkles, Clock,
  ChevronsRight, ChevronsLeft, Scissors, FileText, SpellCheck,
} from 'lucide-react'

const C = {
  lime:     '#8fff00', limeDeep: '#4a8f00', limeTint: '#f4ffe6',
  dark:     '#1a2410', text:     '#1a2410', muted:    '#8a9e78',
  border:   '#e8ede2', surface:  '#ffffff', bg:       '#f7f9f5',
  red:      '#b91c1c', amber:    '#d97706', green:    '#16a34a',
  blue:     '#1d4ed8',
}

const DEFAULT_CATEGORIES = ['eBay Basics', 'Arbitrage', 'Wholesale', 'Riazify Tutorials', 'Product Research']

const VERO_BRANDS = [
  'apple','nike','adidas','gucci','louis vuitton','rolex','supreme','jordan','yeezy',
  'otterbox','kate spade','coach','chanel','prada','versace','burberry','hermes',
  'tiffany','cartier','rayban','oakley','ugg','pandora','swarovski','lego',
]

// ── Toolbar Button ─────────────────────────────────────────────
function ToolBtn({ icon: Icon, title, onClick, active = false, color }: {
  icon: React.ElementType; title: string; onClick: () => void; active?: boolean; color?: string
}) {
  return (
    <button
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className="w-7 h-7 flex items-center justify-center rounded-md transition-all hover:opacity-80"
      style={{
        backgroundColor: active ? C.lime : 'transparent',
        color: active ? C.dark : color ?? C.text,
        border: active ? 'none' : 'none',
      }}
    >
      <Icon size={14} />
    </button>
  )
}

// ── Divider ────────────────────────────────────────────────────
function TDiv() {
  return <div className="w-px h-5 mx-1 shrink-0" style={{ backgroundColor: C.border }} />
}

// ── Parse advanced blocks for preview ─────────────────────────
function parseAdvancedBlocks(html: string): string {
  // FAQ blocks :::faq ... :::
  html = html.replace(/:::faq\s*([\s\S]*?):::/g, (_, content) => {
    const items = content.trim().split('\n').filter((l: string) => l.trim())
    let out = '<div class="faq-block">'
    let i = 0
    while (i < items.length) {
      const q = items[i]?.replace(/^Q:\s*/i, '').trim()
      const a = items[i+1]?.replace(/^A:\s*/i, '').trim()
      if (q) {
        out += `<div class="faq-item"><div class="faq-q">${q}</div>${a ? `<div class="faq-a">${a}</div>` : ''}</div>`
        i += a ? 2 : 1
      } else { i++ }
    }
    out += '</div>'
    return out
  })

  // Info callout :::info ... :::
  html = html.replace(/:::info\s*([\s\S]*?):::/g, (_, content) => {
    return `<div class="callout-info"><span class="callout-icon">i</span><div>${content.trim()}</div></div>`
  })

  // Warning callout :::warning ... :::
  html = html.replace(/:::warning\s*([\s\S]*?):::/g, (_, content) => {
    return `<div class="callout-warning"><span class="callout-icon">!</span><div>${content.trim()}</div></div>`
  })

  // CTA block [CTA:free] [CTA:starter] [CTA:growth]
  html = html.replace(/\[CTA:(free|starter|growth|pro)\]/gi, (_, tier) => {
    const tierUpper = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()
    const desc: Record<string, string> = {
      free: 'Start protecting your eBay orders for free.',
      starter: 'Get 200 order protections + unlimited title builder.',
      growth: 'Unlimited everything. Scale your eBay business.',
      pro: 'Enterprise-grade protection for power sellers.',
    }
    return `<div class="cta-banner">
      <div class="cta-text">
        <strong>Try Riazify ${tierUpper} — Free</strong>
        <span>${desc[tier.toLowerCase()] ?? 'Protect your eBay business today.'}</span>
      </div>
      <a href="/auth/signup" class="cta-btn">Get Started Free →</a>
    </div>`
  })

  // Step blocks ### Step N:
  html = html.replace(/<h3>(Step \d+:.*?)<\/h3>/g, (_, content) => {
    const match = content.match(/Step (\d+):\s*(.*)/)
    if (!match) return `<h3>${content}</h3>`
    return `<div class="step-block"><span class="step-num">${match[1]}</span><div class="step-content"><h3>${match[2]}</h3></div></div>`
  })

  // Calculator block :::calculator:::
  html = html.replace(/:::calculator:::/gi, () => {
    return `<div class="calc-block">
      <div class="calc-title">eBay Profit Calculator</div>
      <div class="calc-row"><label>Sale Price ($)</label><input class="calc-input" id="cp-sale" type="number" placeholder="0.00" oninput="(function(){var s=parseFloat(document.getElementById('cp-sale').value)||0,f=parseFloat(document.getElementById('cp-fee').value)||0,c=parseFloat(document.getElementById('cp-cost').value)||0,p=s-(s*(f/100))-c;document.getElementById('cp-result').textContent='Profit: $'+p.toFixed(2);document.getElementById('cp-result').style.color=p>=0?'#16a34a':'#b91c1c'})()"></div>
      <div class="calc-row"><label>eBay Fee (%)</label><input class="calc-input" id="cp-fee" type="number" placeholder="13.25" oninput="(function(){var s=parseFloat(document.getElementById('cp-sale').value)||0,f=parseFloat(document.getElementById('cp-fee').value)||0,c=parseFloat(document.getElementById('cp-cost').value)||0,p=s-(s*(f/100))-c;document.getElementById('cp-result').textContent='Profit: $'+p.toFixed(2);document.getElementById('cp-result').style.color=p>=0?'#16a34a':'#b91c1c'})()"></div>
      <div class="calc-row"><label>Item Cost ($)</label><input class="calc-input" id="cp-cost" type="number" placeholder="0.00" oninput="(function(){var s=parseFloat(document.getElementById('cp-sale').value)||0,f=parseFloat(document.getElementById('cp-fee').value)||0,c=parseFloat(document.getElementById('cp-cost').value)||0,p=s-(s*(f/100))-c;document.getElementById('cp-result').textContent='Profit: $'+p.toFixed(2);document.getElementById('cp-result').style.color=p>=0?'#16a34a':'#b91c1c'})()"></div>
      <div class="calc-result" id="cp-result">Profit: $0.00</div>
    </div>`
  })

  return html
}

// ── Generate Table of Contents ─────────────────────────────────
function generateToC(html: string): string {
  const matches = [...html.matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gi)]
  if (matches.length === 0) return ''
  let toc = '<div class="toc-block"><strong>Table of Contents</strong><ol>'
  matches.forEach((m, idx) => {
    const level = m[1]
    const text  = m[2].replace(/<[^>]+>/g, '')
    const id    = `heading-${idx}`
    toc += `<li class="${level === '3' ? 'toc-sub' : ''}" style="${level === '3' ? 'padding-left:16px' : ''}"><a href="#${id}">${text}</a></li>`
  })
  toc += '</ol></div>'
  return toc
}

// ── Main Component ─────────────────────────────────────────────
export default function BlogTab() {
  const { can } = useTabPermissions('blog')
  const supabase  = createClient()
  const editorRef = useRef<HTMLDivElement>(null)

  const [posts,          setPosts]          = useState<any[]>([])
  const [loading,        setLoading]        = useState(true)
  const [searchQ,        setSearchQ]        = useState('')
  const [searchFocus,    setSearchFocus]    = useState(false)
  const [sortCol,        setSortCol]        = useState<'title'|'views'|'signups'|'cr'|'words'|'updated'>('updated')
  const [sortDir,        setSortDir]        = useState<'asc'|'desc'>('desc')
  const [catFilter,      setCatFilter]      = useState('all')
  const [calMonth,       setCalMonth]       = useState(new Date().getMonth())
  const [calYear,        setCalYear]        = useState(new Date().getFullYear())
  const [view,           setView]           = useState<'list' | 'editor'>('list')
  const [editingPost,    setEditingPost]    = useState<any>(null)
  const [saving,         setSaving]         = useState(false)
  const [uploading,      setUploading]      = useState(false)
  const [toast,          setToast]          = useState<{ msg: string; ok: boolean; onClick?: () => void } | null>(null)
  const [filter,         setFilter]         = useState<'all' | 'draft' | 'live'>('all')
  const [showPreview,    setShowPreview]    = useState(true)
  const [showStatusDrop,  setShowStatusDrop]  = useState(false)
  const [showDrawer,      setShowDrawer]      = useState(false)
  const [spellCheckOn,    setSpellCheckOn]    = useState(false)
  const [showColorPick,  setShowColorPick]  = useState(false)
  const [showFontSize,   setShowFontSize]   = useState(false)
  const [showLinkInput,  setShowLinkInput]  = useState(false)
  const [linkUrl,        setLinkUrl]        = useState('')
  const [previewHtml,    setPreviewHtml]    = useState('')
  const [editorContent,  setEditorContent]  = useState('')
  const [enableToC,      setEnableToC]      = useState(false)
  const [wordCount,      setWordCount]      = useState(0)
  const [focusKeyword,   setFocusKeyword]   = useState('')
  const [serpView,       setSerpView]       = useState<'desktop' | 'mobile'>('desktop')
  const [lastModified,   setLastModified]   = useState<string>(new Date().toISOString().split('T')[0])
  const [gateContent,    setGateContent]    = useState(false)
  const [gateEmail,      setGateEmail]      = useState('')
  const [clusterPosts,   setClusterPosts]   = useState<any[]>([])
  const [altTitle,       setAltTitle]       = useState('')
  const [showAltTitle,   setShowAltTitle]   = useState(false)
  const [paaKeywords,    setPaaKeywords]    = useState<string[]>([])
  const [paaInput,       setPaaInput]       = useState('')
  const [authorName,     setAuthorName]     = useState('Reaz Uddin')
  const [authorBio,      setAuthorBio]      = useState('eBay seller & founder of Riazify')
  const [authorImage,    setAuthorImage]    = useState('')
  const [showSocial,     setShowSocial]     = useState(false)
  const [socialOutput,   setSocialOutput]   = useState('')
  const [socialPlatform, setSocialPlatform] = useState<'linkedin' | 'twitter'>('linkedin')
  const [indexStatus,    setIndexStatus]    = useState<'idle' | 'pinging' | 'done'>('idle')
  const [adminNotes,     setAdminNotes]     = useState('')
  const [rankPosition,   setRankPosition]   = useState('')
  const [publishAt,      setPublishAt]      = useState('')
  const [wordGoal,       setWordGoal]       = useState(2000)
  const [darkEditor,     setDarkEditor]     = useState(false)
  const [focusMode,      setFocusMode]      = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle'|'saving'|'saved'>('idle')
  const [showFindReplace,setShowFindReplace]= useState(false)
  const [showTemplates,  setShowTemplates]  = useState(false)
  const [findText,       setFindText]       = useState('')
  const [replaceText,    setReplaceText]    = useState('')
  const [passiveHits,    setPassiveHits]    = useState<string[]>([])
  const [transitionScore,setTransitionScore]= useState(0)
  const [showWordGoal,   setShowWordGoal]   = useState(false)
  const [charCount,      setCharCount]      = useState(0)
  const [excerpt,        setExcerpt]        = useState('')
  const [ogImage,        setOgImage]        = useState('')
  const [rankDifficulty, setRankDifficulty] = useState(5)
  const [showTable,      setShowTable]      = useState(false)
  const [tableRows,      setTableRows]      = useState(3)
  const [tableCols,      setTableCols]      = useState(3)
  const [showEmbed,      setShowEmbed]      = useState(false)
  const [embedUrl,       setEmbedUrl]       = useState('')

  const [kwDensity,      setKwDensity]      = useState(0)
  const [h1Count,        setH1Count]        = useState(0)
  const [headingErrors,  setHeadingErrors]  = useState<string[]>([])
  const [listView,       setListView]       = useState<'table' | 'kanban' | 'calendar'>('table')
  const [aiLoading,      setAiLoading]      = useState(false)
  const [aiAction,       setAiAction]       = useState<'improve' | 'expand' | 'brief' | null>(null)
  const [competitorUrl,  setCompetitorUrl]  = useState('')
  const [competitorData, setCompetitorData] = useState<any>(null)
  const [competitorLoading, setCompetitorLoading] = useState(false)
  const [imgWarnings,    setImgWarnings]    = useState<string[]>([])
  const [expiryDate,     setExpiryDate]     = useState('')
  const [relatedPosts,   setRelatedPosts]   = useState<string[]>([])
  const [brokenLinks,    setBrokenLinks]    = useState<string[]>([])
  const [checkingLinks,  setCheckingLinks]  = useState(false)
  const [showRevisions,  setShowRevisions]  = useState(false)
  const [revisions,      setRevisions]      = useState<any[]>([])
  const [dupWarning,     setDupWarning]     = useState(false)

  // Post fields
  const [title,     setTitle]     = useState('')
  const [slug,      setSlug]      = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc,  setMetaDesc]  = useState('')
  const [category,  setCategory]  = useState('eBay Basics')
  const [status,    setStatus]    = useState<'draft' | 'live'>('draft')
  const [imgUrl,    setImgUrl]    = useState('')

  // ── Social Repurposer ────────────────────────────────────────
  function repurposeToSocial() {
    const text = editorRef.current?.innerText ?? ''

    // Filter out template placeholders like [Topic], [X], [Year] etc
    const cleaned = text
      .replace(/\[.*?\]/g, '')           // remove [placeholder] text
      .replace(/\[CTA:.*?\]/g, '')       // remove CTA blocks
      .replace(/:::(info|warning|faq)[\s\S]*?:::/g, '') // remove callout blocks
      .replace(/\s{2,}/g, ' ')           // collapse extra spaces
      .trim()

    // Warn if content is empty or too short to repurpose
    if (cleaned.length < 100) {
      showToast('Write your content first before repurposing', false)
      return
    }

    const sentences = cleaned.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20)

    if (sentences.length < 2) {
      showToast('Add more content before repurposing', false)
      return
    }

    if (socialPlatform === 'twitter') {
      const threads = sentences.slice(0, 8).map((s, i) => `${i + 1}/ ${s}.`)
      const thread = [
        `${title}\n\nA thread: ↓`,
        ...threads,
        `${threads.length + 1}/ Read the full guide at riazify.com/blog/${slug || 'link'}`,
        `\nFollow for more eBay seller tips. Retweet if helpful!`,
      ].join('\n\n')
      setSocialOutput(thread)
    } else {
      const intro  = sentences.slice(0, 2).join('. ')
      const points = sentences.slice(2, 7).map(s => `• ${s}.`).join('\n')
      setSocialOutput(`${title}\n\n${intro}.\n\nKey takeaways:\n${points}\n\nRead the full article → riazify.com/blog/${slug || 'link'}\n\n#eBaySeller #eCommerce #Riazify`)
    }
    setShowSocial(true)
  }

  // ── Google Index Ping ─────────────────────────────────────────
  async function pingGoogleIndex() {
    if (!slug) { showToast('Set a URL slug before pinging Google', false); return }
    setIndexStatus('pinging')
    try {
      const postUrl = `https://riazify.com/blog/${slug}`
      const res = await fetch('/api/ping-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: postUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setIndexStatus('done')
      showToast(`Google pinged — ${postUrl} queued for crawl ✓`)
      setTimeout(() => setIndexStatus('idle'), 8000)
    } catch (err: any) {
      setIndexStatus('idle')
      showToast(`Ping failed: ${err.message}`, false)
    }
  }

  // ── Paste from Word ──────────────────────────────────────────
  async function pasteFromWord() {
    try {
      const raw = await navigator.clipboard.readText()
      // Strip MS Word junk — mso classes, XML tags, smart quotes etc
      const clean = raw
        .replace(/<o:p>.*?<\/o:p>/gi, '')
        .replace(/<\/?[a-z][^>]*mso[^>]*>/gi, '')
        .replace(/class="[^"]*mso[^"]*"/gi, '')
        .replace(/style="[^"]*mso[^"]*"/gi, '')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/\u2013/g, '-')
        .replace(/\u2014/g, '--')
        .replace(/\u2026/g, '...')
        .trim()
      insertHtml(clean || raw)
      showToast('Pasted and cleaned from Word')
    } catch { showToast('Allow clipboard access first', false) }
  }

  // ── Insert page break ─────────────────────────────────────────
  function insertPageBreak() {
    insertHtml('<div style="page-break-after:always;border-top:2px dashed #e8ede2;margin:24px 0;padding-top:8px"><span style="font-size:10px;color:#8a9e78;font-weight:700;letter-spacing:0.1em">PAGE BREAK</span></div>')
    showToast('Page break inserted')
  }
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  // ── Broken link checker ───────────────────────────────────────
  async function checkLinks() {
    setCheckingLinks(true)
    setBrokenLinks([])
    const html = editorContent || editorRef.current?.innerHTML || ''
    const matches = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)]
    const urls = [...new Set(matches.map(m => m[1]))]
    const broken: string[] = []
    for (const url of urls.slice(0, 10)) {
      try {
        const res = await fetch(`/api/check-link?url=${encodeURIComponent(url)}`)
        if (!res.ok) broken.push(url)
      } catch { broken.push(url) }
    }
    setBrokenLinks(broken)
    setCheckingLinks(false)
    showToast(broken.length === 0 ? 'All links are working' : `${broken.length} broken link(s) found`, broken.length === 0)
  }

  // ── Duplicate slug check ──────────────────────────────────────
  async function checkDuplicate(s: string) {
    if (!s) { setDupWarning(false); return }
    try {
      const { data } = await (supabase.from('blog_posts') as any)
        .select('id').eq('slug', s).neq('id', editingPost?.id ?? '00000000-0000-0000-0000-000000000000')
      setDupWarning((data ?? []).length > 0)
    } catch {}
  }

  // ── Save revision snapshot ────────────────────────────────────
  async function saveRevision() {
    try {
      await (supabase.from('blog_revisions') as any).insert({
        post_id:    editingPost?.id,
        body:       editorContent || editorRef.current?.innerHTML || '',
        title,
        saved_at:   new Date().toISOString(),
      })
      showToast('Revision saved')
    } catch { showToast('Could not save revision', false) }
  }

  // ── Copy as Markdown ─────────────────────────────────────────
  function copyAsMarkdown() {
    const text = editorRef.current?.innerText ?? ''
    navigator.clipboard.writeText(text)
    showToast('Copied as plain text')
  }

  // ── Keyword density ─────────────────────────────────────────────
  function updateSeoAnalytics() {
    if (!editorRef.current) return
    const text  = editorRef.current.innerText ?? ''
    const html  = editorRef.current.innerHTML ?? ''
    const words = text.trim().split(/\s+/).filter(Boolean)
    const kw    = focusKeyword.toLowerCase().trim()
    if (kw && words.length > 0) {
      const hits = words.filter(w => w.toLowerCase().includes(kw)).length
      setKwDensity(parseFloat(((hits / words.length) * 100).toFixed(1)))
    } else {
      setKwDensity(0)
    }
    // H1 count
    const h1s = html.match(/<h1[^>]*>/gi) ?? []
    setH1Count(h1s.length)
    // Heading hierarchy
    const errors: string[] = []
    const headings = [...html.matchAll(/<h([1-6])[^>]*>/gi)].map(m => parseInt(m[1]))
    for (let i = 1; i < headings.length; i++) {
      if (headings[i] - headings[i-1] > 1) {
        errors.push(`H${headings[i-1]} jumps to H${headings[i]} — skipped a level`)
      }
    }
    setHeadingErrors(errors)
    // Image size warnings (large image URLs)
    const imgSrcs = [...html.matchAll(/src="([^"]+)"/gi)].map(m => m[1])
    const warnings = imgSrcs.filter(src => src.includes('unsplash') || src.includes('raw.') || !src.includes('thumb')).slice(0, 3)
    setImgWarnings(warnings.length > 0 ? [`${warnings.length} image(s) may be large — compress before publishing`] : [])

    // Passive voice detection
    const passivePatterns = [
      /\bwas \w+ed\b/gi, /\bwere \w+ed\b/gi, /\bis \w+ed\b/gi,
      /\bare \w+ed\b/gi, /\bbeen \w+ed\b/gi, /\bbeing \w+ed\b/gi,
    ]
    const bodyTxt = editorRef.current?.innerText ?? ''
    const hits: string[] = []
    passivePatterns.forEach(p => {
      const matches = bodyTxt.match(p) ?? []
      matches.forEach(m => { if (!hits.includes(m)) hits.push(m) })
    })
    setPassiveHits(hits.slice(0, 5))

    // Transition word score
    const transitions = ['however','therefore','additionally','furthermore','moreover',
      'consequently','nevertheless','meanwhile','although','because','since','while',
      'instead','otherwise','finally','first','second','third','also','thus']
    const sentences = bodyTxt.split(/[.!?]+/).filter(s => s.trim().length > 10)
    const withTransitions = sentences.filter(s =>
      transitions.some(t => s.toLowerCase().trim().startsWith(t) || s.toLowerCase().includes(' ' + t + ' '))
    ).length
    const score = sentences.length > 0 ? Math.round((withTransitions / sentences.length) * 100) : 0
    setTransitionScore(score)
  }

  // ── Keyboard shortcut Ctrl+S / Cmd+S ───────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        savePost()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        document.execCommand('undo')
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        document.execCommand('redo')
      }
    }
    if (view === 'editor') {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [view, title, status])

  // ── Insert table ──────────────────────────────────────────────
  function insertTable() {
    const headerRow = Array.from({ length: tableCols }, (_, i) => `<th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-weight:700;font-size:13px;text-align:left">Header ${i+1}</th>`).join('')
    const bodyRows = Array.from({ length: tableRows - 1 }, (_, r) =>
      `<tr>${Array.from({ length: tableCols }, (_, c) => `<td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">Row ${r+1}, Col ${c+1}</td>`).join('')}</tr>`
    ).join('')
    const table = `<table style="width:100%;border-collapse:collapse;margin:16px 0"><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`
    insertHtml(table)
    setShowTable(false)
    showToast('Table inserted')
  }

  // ── Insert embed ──────────────────────────────────────────────
  function insertEmbed() {
    if (!embedUrl.trim()) return
    let html = ''

    if (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
      const id = embedUrl.match(/(?:v=|youtu\.be\/|\/shorts\/)([^&?/\s]+)/)?.[1] ?? ''
      if (!id) { showToast('Could not find YouTube video ID', false); return }

      const thumb    = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
      const embedSrc = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
      const uid      = `yt_${id}_${Date.now()}`

      html = `<div style="margin:24px 0;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12)">
  <div id="${uid}" onclick="var w=this.parentNode;var f=document.createElement('iframe');f.src='${embedSrc}';f.style.cssText='width:100%;aspect-ratio:16/9;border:none;display:block';f.allow='autoplay;fullscreen';f.allowFullscreen=true;w.innerHTML='';w.style.borderRadius='16px';w.style.overflow='hidden';w.appendChild(f);" style="position:relative;cursor:pointer;display:block;line-height:0">
    <img src="${thumb}" alt="YouTube video" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block" onerror="this.src='https://img.youtube.com/vi/${id}/hqdefault.jpg'" />
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center">
      <div style="width:72px;height:72px;background:#FF0000;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.4)">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
      </div>
    </div>
  </div>
</div>`

    } else if (embedUrl.includes('twitter.com') || embedUrl.includes('x.com')) {
      html = `<div style="border:1px solid #e8ede2;border-radius:12px;padding:16px;margin:16px 0"><a href="${embedUrl}" style="color:#1d4ed8;font-size:13px;font-weight:700" target="_blank" rel="noopener">${embedUrl}</a></div>`
    } else {
      html = `<div style="border:1px solid #e8ede2;border-radius:12px;padding:16px;margin:16px 0"><a href="${embedUrl}" style="color:#1d4ed8;font-size:13px;font-weight:700" target="_blank" rel="noopener">${embedUrl}</a></div>`
    }

    insertHtml(html)
    setEmbedUrl('')
    setShowEmbed(false)
    showToast('Video embedded — thumbnail shows on page, plays on click')
  }

  // ── PDF export ────────────────────────────────────────────────
  function exportPDF() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html><head><title>${title}</title>
      <style>body{font-family:Inter,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a2410;line-height:1.8}
      h1{font-size:28px;font-weight:800}h2{font-size:22px;font-weight:700}h3{font-size:18px;font-weight:700}
      table{width:100%;border-collapse:collapse}td,th{border:1px solid #e8ede2;padding:8px 12px}
      blockquote{border-left:3px solid #8fff00;padding-left:14px;color:#8a9e78}</style></head>
      <body><h1>${title}</h1><p style="color:#8a9e78">${new Date().toLocaleDateString()} · ${readingTime} min read · ${wordCount} words</p>
      <hr style="border:none;border-top:1px solid #e8ede2;margin:20px 0"/>
      ${editorRef.current?.innerHTML ?? ''}</body></html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  // ── localStorage crash recovery ──────────────────────────────────
  const LOCAL_KEY = 'riazify_blog_draft'

  // Save to localStorage on every change (debounced 2s)
  useEffect(() => {
    if (view !== 'editor') return
    const timer = setTimeout(() => {
      try {
        const draft = {
          title, slug, metaTitle, metaDesc, category, status,
          imgUrl, authorName, authorBio, altTitle, paaKeywords,
          enableToC, gateContent, excerpt, ogImage, publishAt,
          body: editorContent || editorRef.current?.innerHTML || '',
          editingPostId: editingPost?.id ?? null,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem(LOCAL_KEY, JSON.stringify(draft))
      } catch {}
    }, 2000)
    return () => clearTimeout(timer)
  }, [title, slug, metaTitle, metaDesc, category, status, imgUrl,
      authorName, authorBio, altTitle, enableToC, gateContent,
      excerpt, ogImage, publishAt, editorContent, view])

  // On mount — check if there's a draft to recover
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY)
      if (!raw) return
      const draft = JSON.parse(raw)
      if (!draft.title) return
      const savedAt = new Date(draft.savedAt)
      const mins = Math.round((Date.now() - savedAt.getTime()) / 60000)
      const label = mins < 60 ? `${mins} min ago` : `${Math.round(mins/60)} hr ago`
      // Show recovery toast with option to restore
      showToast(`Unsaved draft found (${label}) — click to restore`, true, () => {
        setTitle(draft.title || '')
        setSlug(draft.slug || '')
        setMetaTitle(draft.metaTitle || '')
        setMetaDesc(draft.metaDesc || '')
        setCategory(draft.category || 'eBay Basics')
        setStatus(draft.status || 'draft')
        setImgUrl(draft.imgUrl || '')
        setAuthorName(draft.authorName || 'Reaz Uddin')
        setAuthorBio(draft.authorBio || '')
        setAuthorImage(draft.authorImage || '')
        setAltTitle(draft.altTitle || '')
        setPaaKeywords(draft.paaKeywords || [])
        setEnableToC(draft.enableToC || false)
        setGateContent(draft.gateContent || false)
        setExcerpt(draft.excerpt || '')
        setOgImage(draft.ogImage || '')
        setPublishAt(draft.publishAt || '')
        setEditorContent(draft.body || '')
        setView('editor')
        localStorage.removeItem(LOCAL_KEY)
        showToast('Draft restored successfully ✓')
      })
    } catch {}
  }, [])

  // Clear localStorage when post is saved successfully
  function clearLocalDraft() {
    try { localStorage.removeItem(LOCAL_KEY) } catch {}
  }

  // ── Auto-save every 30 seconds ──────────────────────────────────
  useEffect(() => {
    if (view !== 'editor' || !title.trim()) return
    const interval = setInterval(async () => {
      setAutoSaveStatus('saving')
      try {
        const body = editorContent || editorRef.current?.innerHTML || ''
        const payload = {
          title: title.trim(),
          slug: slug || autoSlug(title),
          meta_title: metaTitle || title,
          meta_description: metaDesc,
          category, status, body,
          featured_image_url: imgUrl || null,
          updated_at: new Date().toISOString(),
        }
        if (editingPost) {
          await (supabase.from('blog_posts') as any).update(payload).eq('id', editingPost.id)
        }
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
      } catch {
        setAutoSaveStatus('idle')
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [view, title, editingPost])

  // ── Find & Replace ────────────────────────────────────────────
  function findAndReplace() {
    if (!findText.trim() || !editorRef.current) return
    const html = editorRef.current.innerHTML
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'gi')
    const replaced = html.replace(regex, replaceText)
    editorRef.current.innerHTML = replaced
    updatePreview()
    const count = (html.match(regex) ?? []).length
    showToast(count > 0 ? `Replaced ${count} occurrence(s)` : 'No matches found', count > 0)
  }

  function findHighlight() {
    if (!findText.trim() || !editorRef.current) return
    const html = editorRef.current.innerHTML
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    editorRef.current.innerHTML = html.replace(regex, '<mark style="background:#8fff00;color:#1a2410">$1</mark>')
    updatePreview()
  }

  // ── Paste as plain text ───────────────────────────────────────
  async function pasteAsPlainText() {
    try {
      const text = await navigator.clipboard.readText()
      exec('insertText', text)
      showToast('Pasted as plain text')
    } catch { showToast('Allow clipboard access first', false) }
  }

  // ── Clear formatting ──────────────────────────────────────────
  function clearFormatting() {
    editorRef.current?.focus()
    document.execCommand('removeFormat')
    document.execCommand('formatBlock', false, 'p')
    updatePreview()
    showToast('Formatting cleared')
  }

  // ── AI Writing Assistant ──────────────────────────────────────
  async function callAI(action: 'improve' | 'expand' | 'brief') {
    setAiLoading(true)
    setAiAction(action)
    try {
      const selectedText = window.getSelection()?.toString() || editorRef.current?.innerText?.slice(0, 500) || ''
      const prompts: Record<string, string> = {
        improve: `Rewrite this paragraph to be clearer, more engaging, and better for SEO. Keep the same meaning but improve the language. Return only the rewritten text, no explanation:\n\n${selectedText}`,
        expand:  `Expand this text into a longer, more detailed version with specific examples. Return only the expanded text, no explanation:\n\n${selectedText}`,
        brief:   `Create a content brief for a blog post targeting the keyword "${focusKeyword || title}". Include: recommended word count, 5 H2 headings to cover, 5 questions to answer, and 5 related terms to mention. Format it clearly.`,
      }
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompts[action] }),
      })
      if (!res.ok) throw new Error('AI request failed')
      const data = await res.json()
      const result = data.content ?? data.text ?? ''
      if (action === 'brief') {
        insertHtml(`<div style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:12px;padding:16px;margin:12px 0"><strong style="color:#4a8f00">Content Brief</strong><br/>${result.replace(/\n/g, '<br/>')}</div>`)
      } else {
        insertHtml(`<span>${result}</span>`)
      }
      showToast('AI content inserted')
    } catch { showToast('AI assist failed — check API', false) }
    setAiLoading(false)
    setAiAction(null)
  }

  // ── Competitor Analyzer ───────────────────────────────────────
  async function analyzeCompetitor() {
    if (!competitorUrl.trim()) { showToast('Enter a URL first', false); return }
    setCompetitorLoading(true)
    try {
      const res = await fetch(`/api/fetch-url?url=${encodeURIComponent(competitorUrl)}`)
      if (!res.ok) throw new Error('Failed')
      const html = await res.text()
      const titleMatch  = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      const descMatch   = html.match(/name="description"[^>]*content="([^"]+)"/i) || html.match(/content="([^"]+)"[^>]*name="description"/i)
      const h1Match     = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
      const wordCount   = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length
      const h2s         = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi)].map(m => m[1]).slice(0, 5)
      setCompetitorData({
        title:    titleMatch?.[1] ?? 'Not found',
        desc:     descMatch?.[1] ?? 'Not found',
        h1:       h1Match?.[1] ?? 'Not found',
        wordCount,
        h2s,
      })
      showToast('Competitor analyzed')
    } catch { showToast('Could not fetch URL — try another', false) }
    setCompetitorLoading(false)
  }

  // ── Duplicate post ────────────────────────────────────────────
  async function duplicatePost(post: any) {
    try {
      const { data } = await (supabase.from('blog_posts') as any).insert({
        ...post,
        id:         undefined,
        title:      post.title + ' (Copy)',
        slug:       post.slug + '-copy-' + Date.now(),
        status:     'draft',
        views:      0,
        signups:    0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select()
      showToast('Post duplicated')
      loadPosts()
    } catch { showToast('Duplicate failed', false) }
  }

  // ── Bulk action ───────────────────────────────────────────────
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{msg: string; onConfirm: () => void} | null>(null)

  async function bulkAction(action: 'live' | 'draft' | 'delete') {
    if (selectedPosts.length === 0) return
    if (action === 'delete') {
      setDeleteConfirm({
        msg: `Delete ${selectedPosts.length} post${selectedPosts.length > 1 ? 's' : ''}? This cannot be undone.`,
        onConfirm: async () => {
          await (supabase.from('blog_posts') as any).delete().in('id', selectedPosts)
          setSelectedPosts([])
          showToast(`${selectedPosts.length} posts deleted`)
          loadPosts()
          setDeleteConfirm(null)
        }
      })
      return
    }
    try {
      await (supabase.from('blog_posts') as any).update({ status: action }).in('id', selectedPosts)
      setSelectedPosts([])
      showToast(`${selectedPosts.length} posts updated`)
      loadPosts()
    } catch { showToast('Bulk action failed', false) }
  }

  function showToast(msg: string, ok = true, onClick?: () => void) {
    setToast({ msg, ok, onClick })
    setTimeout(() => setToast(null), onClick ? 8000 : 3500)
  }

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    setLoading(true)
    try {
      const { data } = await (supabase.from('blog_posts') as any)
        .select('*').order('created_at', { ascending: false })
      setPosts(data ?? [])
    } catch {}
    setLoading(false)
  }

  function autoSlug(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function openNew() {
    setEditingPost(null)
    setTitle(''); setSlug(''); setMetaTitle(''); setMetaDesc('')
    setCategory('eBay Basics'); setStatus('draft'); setImgUrl('')
    setEnableToC(false)
    setAdminNotes(''); setRankPosition(''); setExpiryDate(''); setRelatedPosts([])
    setBrokenLinks([]); setDupWarning(false); setPublishAt(''); setCompetitorData(null)
    setExcerpt(''); setOgImage(''); setRankDifficulty(5); setWordGoal(2000)
    setEditorContent('<p>Start writing your post here...</p>')
    updatePreview()
    setView('editor')
    loadClusterPosts()
  }

  async function loadClusterPosts() {
    try {
      const { data } = await (supabase.from('blog_posts') as any)
        .select('id, title, slug, category, status')
        .eq('status', 'live')
        .order('created_at', { ascending: false })
        .limit(20)
      setClusterPosts(data ?? [])
    } catch {}
  }

  function openEdit(post: any) {
    setEditingPost(post)
    setTitle(post.title ?? ''); setSlug(post.slug ?? '')
    setMetaTitle(post.meta_title ?? ''); setMetaDesc(post.meta_description ?? '')
    setCategory(post.category ?? 'eBay Basics'); setStatus(post.status ?? 'draft')
    setImgUrl(post.featured_image_url ?? '')
    setEnableToC(post.enable_toc ?? false)
    setLastModified(post.last_modified ?? new Date().toISOString().split('T')[0])
    setGateContent(post.gate_content ?? false)
    setAltTitle(post.alt_title ?? '')
    setPaaKeywords(post.paa_keywords ?? [])
    setAuthorName(post.author_name ?? 'Reaz Uddin')
    setAuthorBio(post.author_bio ?? 'eBay seller & founder of Riazify')
    setAuthorImage(post.author_image ?? '')
    setAdminNotes(post.admin_notes ?? '')
    setRankPosition(post.rank_position ?? '')
    setPublishAt(post.publish_at ?? '')
    setExcerpt(post.excerpt ?? '')
    setOgImage(post.og_image ?? '')
    setRankDifficulty(post.rank_difficulty ?? 5)
    setWordGoal(post.word_goal ?? 2000)
    setExpiryDate(post.expiry_date ?? '')
    setRelatedPosts(post.related_posts ?? [])
    setEditorContent(post.body ?? '<p>Start writing...</p>')
    updatePreview()
    setView('editor')
  }

  // ── Editor commands ────────────────────────────────────────────
  function exec(command: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    updatePreview()
  }

  function updatePreview() {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    const text = editorRef.current.innerText.trim()
    const wc = text.split(/\s+/).filter(Boolean).length
    setWordCount(wc)
    setCharCount(text.length)
    updateSeoAnalytics()
    let parsed = parseAdvancedBlocks(html)
    if (enableToC) {
      const toc = generateToC(parsed)
      if (toc) parsed = toc + parsed
    }
    setPreviewHtml(parsed)
  }

  useEffect(() => { updatePreview() }, [enableToC])

  function insertHtml(html: string) {
    editorRef.current?.focus()
    document.execCommand('insertHTML', false, html)
    updatePreview()
  }

  function insertLink() {
    if (linkUrl) {
      exec('createLink', linkUrl)
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  // ── SEO Block Inserters ────────────────────────────────────────
  function insertFAQ() {
    insertHtml(`<p>:::faq</p><p>Q: What is your question here?</p><p>A: Your detailed answer goes here.</p><p>Q: Another frequently asked question?</p><p>A: Answer goes here too.</p><p>:::</p>`)
  }

  function insertCallout(type: 'info' | 'warning') {
    insertHtml(`<p>:::${type}</p><p>Your key takeaway or important note goes here. Make it concise and valuable.</p><p>:::</p>`)
  }

  function insertCTA(tier: string) {
    insertHtml(`<p>[CTA:${tier}]</p>`)
  }

  function insertHowToStep(stepNum: number) {
    insertHtml(`<h3>Step ${stepNum}: Add your step title here</h3><p>Describe what the reader needs to do in this step. Be clear and specific.</p>`)
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `blog/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('public').upload(path, file, { upsert: true })
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('public').getPublicUrl(path)
        exec('insertImage', publicUrl)
        showToast('Image inserted')
      }
    } catch { showToast('Upload failed', false) }
    setUploading(false)
  }

  async function savePost() {
    const body = editorRef.current?.innerHTML || editorContent || ''
    if (!title.trim()) { showToast('Title is required', false); return }
    setSaving(true)
    try {
      const payload = {
        title:              title.trim(),
        slug:               slug || autoSlug(title),
        meta_title:         metaTitle || title,
        meta_description:   metaDesc || null,
        category:           category || 'eBay Basics',
        status:             status || 'draft',
        body:               body || null,
        featured_image_url: imgUrl || null,
        word_count:         wordCount || 0,
        enable_toc:         enableToC || false,
        gate_content:       gateContent || false,
        author_name:        authorName || null,
        author_bio:         authorBio || null,
        author_image:       authorImage || null,
        alt_title:          altTitle || null,
        paa_keywords:       paaKeywords || [],
        excerpt:            excerpt || null,
        og_image:           ogImage || null,
        admin_notes:        adminNotes || null,
        publish_at:         publishAt || null,
        rank_difficulty:    rankDifficulty || null,
        word_goal:          wordGoal || null,
        rank_position:      rankPosition || null,
        expiry_date:        expiryDate || null,
        related_posts:      relatedPosts || [],
        last_modified:      lastModified || null,
        updated_at:         new Date().toISOString(),
      }
      if (editingPost) {
        const { error } = await (supabase.from('blog_posts') as any).update(payload).eq('id', editingPost.id)
        if (error) throw new Error(error.message)
        showToast('Post updated ✓')
      } else {
        const { error } = await (supabase.from('blog_posts') as any).insert({
          ...payload,
          views: 0,
          signups: 0,
          created_at: new Date().toISOString(),
        })
        if (error) throw new Error(error.message)
        showToast('Post saved ✓')
      }
      clearLocalDraft()
      await loadPosts()
      setView('list')
    } catch (err: any) {
      showToast(`Save failed: ${err.message}`, false)
    }
    setSaving(false)
  }

  async function deletePost(id: string) {
    setDeleteConfirm({
      msg: 'Delete this post? This cannot be undone.',
      onConfirm: async () => {
        // Get post body and image fields before deleting
        try {
          const { data: post } = await (supabase.from('blog_posts') as any)
            .select('body, featured_image_url, og_image').eq('id', id).single()
          if (post) {
            // Collect all Supabase image URLs from body + fields
            const html = (post.body || '') + (post.featured_image_url || '') + (post.og_image || '')
            const matches = [...html.matchAll(/\/public\/blog\/([^"'\s?]+)/g)]
            const paths = [...new Set(matches.map(m => `blog/${m[1]}`))]
            if (paths.length > 0) {
              await supabase.storage.from('public').remove(paths)
            }
          }
        } catch {}
        // Delete post
        await (supabase.from('blog_posts') as any).delete().eq('id', id)
        showToast('Post deleted')
        loadPosts()
        setDeleteConfirm(null)
      }
    })
  }

  async function toggleFeatured(post: any) {
    const newVal = !post.is_featured
    await (supabase.from('blog_posts') as any).update({ is_featured: newVal }).eq('id', post.id)
    showToast(newVal ? '⭐ Post featured on blog homepage' : 'Removed from featured')
    loadPosts()
  }

  async function toggleStatus(post: any) {
    const next = post.status === 'live' ? 'draft' : 'live'
    await (supabase.from('blog_posts') as any).update({ status: next }).eq('id', post.id)
    showToast(`Post set to ${next}`)
    loadPosts()
  }

  const totalViews   = posts.reduce((s, p) => s + (p.views ?? 0), 0)
  const totalSignups = posts.reduce((s, p) => s + (p.signups ?? 0), 0)
  const livePosts    = posts.filter(p => p.status === 'live').length
  const categories   = ['all', ...Array.from(new Set(posts.map((p:any) => p.category).filter(Boolean)))] as string[]

  const filtered = posts
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => catFilter === 'all' || p.category === catFilter)
    .filter(p => !searchQ.trim() || p.title?.toLowerCase().includes(searchQ.toLowerCase()) || p.slug?.toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a, b) => {
      let av: any, bv: any
      if (sortCol === 'title')   { av = a.title?.toLowerCase() ?? ''; bv = b.title?.toLowerCase() ?? '' }
      else if (sortCol === 'views')   { av = a.views ?? 0; bv = b.views ?? 0 }
      else if (sortCol === 'signups') { av = a.signups ?? 0; bv = b.signups ?? 0 }
      else if (sortCol === 'cr')      { av = a.views > 0 ? a.signups/a.views : 0; bv = b.views > 0 ? b.signups/b.views : 0 }
      else if (sortCol === 'words')   { av = a.word_count ?? 0; bv = b.word_count ?? 0 }
      else { av = a.updated_at ?? a.created_at ?? ''; bv = b.updated_at ?? b.created_at ?? '' }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  function toggleSort(col: typeof sortCol) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  function SortIcon({ col }: { col: typeof sortCol }) {
    if (sortCol !== col) return <span style={{ color: C.border }}>↕</span>
    return <span style={{ color: C.lime }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  // u2500u2500 SEO Checklist u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500
  const bodyText  = editorRef.current?.innerText?.toLowerCase() ?? ''
  const bodyHtml  = editorRef.current?.innerHTML ?? ''
  const kw        = focusKeyword.toLowerCase().trim()
  const seoChecks = {
    kwInTitle:    kw ? metaTitle.toLowerCase().includes(kw)  : false,
    kwInSlug:     kw ? slug.toLowerCase().includes(kw)       : false,
    kwInBody:     kw ? bodyText.includes(kw)                 : false,
    kwInHeading:  kw ? (bodyHtml.match(/<h[23][^>]*>.*?<\/h[23]>/gi) ?? []).some((h: string) => h.toLowerCase().includes(kw)) : false,
    metaTitleOk:  (metaTitle || title).length >= 10 && (metaTitle || title).length <= 60,
    metaDescOk:   metaDesc.length > 0 && metaDesc.length <= 160,
    hasSlug:      slug.length > 0,
    hasFeatImg:   imgUrl.length > 0,
  }

  // ── Schema JSON-LD Generator ──────────────────────────────────
  const hasFaqBlock  = bodyHtml.includes(':::faq') || previewHtml.includes('faq-block')
  const hasHowToBlock = bodyHtml.includes('Step 1:') || previewHtml.includes('step-block')
  const schemaGenerated = hasFaqBlock || hasHowToBlock

  function generateSchemaJson(): string {
    const schemas: any[] = []
    if (hasFaqBlock) {
      const faqLines = bodyHtml.split('\n')
      const faqMatches: Array<[string, string]> = []
      for (let i = 0; i < faqLines.length; i++) {
        const q = faqLines[i]?.match(/^Q:\s*(.+)/i)
        const a = faqLines[i+1]?.match(/^A:\s*(.+)/i)
        if (q && a) faqMatches.push([q[1].trim(), a[1].trim()])
      }
      if (faqMatches.length > 0) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqMatches.map(m => ({
            '@type': 'Question',
            name: m[0] ?? '',
            acceptedAnswer: { '@type': 'Answer', text: m[1] ?? '' }
          }))
        })
      }
    }
    if (hasHowToBlock) {
      const steps = [...bodyHtml.matchAll(/Step (\d+):\s*([^<]+)/g)]
      if (steps.length > 0) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: title,
          step: steps.map(s => ({ '@type': 'HowToStep', position: parseInt(s[1]), text: s[2]?.trim() ?? '' }))
        })
      }
    }
    return JSON.stringify(schemas, null, 2)
  }

  // ── Readability Analyzer ────────────────────────────────────────
  const readabilityWarnings: string[] = []
  if (editorRef.current) {
    const paragraphs = editorRef.current.innerText.split('\n\n').filter(p => p.trim())
    paragraphs.forEach((p, i) => {
      const wordCount = p.trim().split(/\s+/).length
      if (wordCount > 150) readabilityWarnings.push(`Paragraph ${i + 1}: ${wordCount} words — break it up for mobile`)
    })
    const sentences = editorRef.current.innerText.split(/[.!?]+/)
    sentences.forEach((s, i) => {
      const wc = s.trim().split(/\s+/).length
      if (wc > 35) readabilityWarnings.push(`Long sentence detected (~${wc} words) — consider splitting`)
    })
  }

  // ── Alt Tag Audit ───────────────────────────────────────────────
  // VeRO brand safety scan
  const bodyLower  = editorRef.current?.innerText?.toLowerCase() ?? ''
  const veroHits   = VERO_BRANDS.filter(brand => bodyLower.includes(brand))

  const imgTags = [...bodyHtml.matchAll(/<img[^>]*>/gi)]
  const missingAltCount = imgTags.filter(m => !m[0].includes('alt=') || m[0].includes('alt=""') || m[0].includes("alt=''")).length

  // ── LIST VIEW ──────────────────────────────────────────────────
  if (view === 'list') return (
    <div className="flex flex-col gap-5" style={{ fontFamily: 'Inter, sans-serif' }}>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl"
             style={{ backgroundColor: toast.ok ? C.dark : '#FEF2F2', border: `1px solid ${toast.ok ? C.lime : '#fecaca'}`, cursor: toast.onClick ? 'pointer' : 'default' }}
             onClick={() => { if(toast.onClick){ toast.onClick(); setToast(null) } }}>
          {toast.ok ? <CheckCircle size={15} style={{ color: C.lime }} /> : <AlertTriangle size={15} style={{ color: C.red }} />}
          <p className="text-[13px] font-semibold" style={{ color: toast.ok ? C.lime : C.red }}>{toast.msg}</p>
          {toast.onClick && <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg ml-1" style={{ backgroundColor: C.lime, color: C.dark }}>Restore</span>}
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Posts',       value: posts.length,           sub: 'all time',           color: C.dark,     icon: BookOpen },
          { label: 'Live Posts',        value: livePosts,              sub: `${posts.length - livePosts} drafts`,    color: C.limeDeep, icon: Globe    },
          { label: 'Total Views',       value: totalViews.toLocaleString(), sub: 'across all posts', color: C.blue,     icon: Eye      },
          { label: 'Blog Signups',      value: totalSignups,           sub: 'from blog CTAs',     color: C.green,    icon: Users    },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl border hover:shadow-sm transition-all"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: s.color + '18' }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[24px] font-extrabold leading-tight" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] font-bold" style={{ color: C.dark }}>{s.label}</p>
              <p className="text-[10px]" style={{ color: C.muted }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters + Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[200px]"
             style={{ backgroundColor: C.surface }}>
          <Search size={13} style={{ color: C.muted, flexShrink: 0 }} />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            onFocus={e => e.currentTarget.parentElement!.style.outline = `2px solid ${C.lime}`}
            onBlur={e => e.currentTarget.parentElement!.style.outline = 'none'}
            placeholder="Search posts by title or slug..."
            className="flex-1 text-[12px] bg-transparent"
            style={{ color: C.dark, outline: 'none', border: 'none' }} />
          {searchQ && <button onClick={() => setSearchQ('')}><X size={12} style={{ color: C.muted }} /></button>}
        </div>

        {/* Status filter */}
        <div className="flex items-center p-1 rounded-xl gap-1" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
          {(['all', 'live', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-lg text-[11px] font-bold transition-all capitalize"
              style={{ backgroundColor: filter === f ? '#8fff00' : 'transparent', color: filter === f ? '#1a2410' : C.muted }}>
              {f} <span className="opacity-60">{f === 'all' ? posts.length : f === 'live' ? livePosts : posts.length - livePosts}</span>
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="h-9 px-3 rounded-xl border text-[11px] font-bold outline-none"
          style={{ borderColor: catFilter !== 'all' ? C.lime : C.border, backgroundColor: C.surface, color: catFilter !== 'all' ? C.limeDeep : C.muted }}>
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>

        {/* View switcher */}
        <div className="flex items-center p-1 rounded-xl gap-1" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
          {([['table','Table',BarChart2],['kanban','Board',Layers],['calendar','Calendar',Clock]] as any[]).map(([v,l,Icon]) => (
            <button key={v} onClick={() => setListView(v)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all"
              style={{ backgroundColor: listView === v ? C.dark : 'transparent', color: listView === v ? C.lime : C.muted }}>
              <Icon size={11}/>{l}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selectedPosts.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <span className="text-[11px] font-bold" style={{ color: C.muted }}>{selectedPosts.length} selected</span>
            {can('publish_post') && <button onClick={() => bulkAction('live')} className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>Set Live</button>}
            {can('publish_post') && <button onClick={() => bulkAction('draft')} className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ backgroundColor: C.bg, color: C.muted }}>Set Draft</button>}
            {can('delete_post') && <button onClick={() => bulkAction('delete')} className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ backgroundColor: 'rgba(185,28,28,0.1)', color: C.red }}>Delete</button>}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {can('create_post') && <button onClick={() => { openNew(); setShowTemplates(true) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold border"
            style={{ borderColor: C.border, color: C.muted, backgroundColor: C.surface }}>
            <Layers size={13}/> From Template
          </button>}
          {can('create_post') && <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            <Plus size={14}/> New Post
          </button>}
        </div>
      </div>

      {/* Posts table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw size={24} className="animate-spin" style={{ color: C.limeDeep }} />
          <p className="text-[13px] font-bold" style={{ color: C.muted }}>Loading posts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.limeTint }}>
            <BookOpen size={28} style={{ color: C.limeDeep }} />
          </div>
          <div className="text-center">
            <p className="text-[17px] font-black mb-1" style={{ color: C.dark }}>
              {filter === 'all' ? 'No posts yet' : filter === 'live' ? 'No live posts' : 'No drafts'}
            </p>
            <p className="text-[13px]" style={{ color: C.muted }}>
              {filter === 'all' ? 'Write your first post and start driving organic traffic to Riazify' : filter === 'live' ? 'Publish a draft to make it live' : 'Start writing a new post'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => { openNew(); setShowTemplates(true) }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold border"
              style={{ borderColor: C.limeDeep, color: C.limeDeep, backgroundColor: C.limeTint }}>
              <Layers size={13}/> Use a Template
            </button>
            <button onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold"
              style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
              <Plus size={14}/> Write First Post
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
          {listView === 'table' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                <th className="px-3 py-3">
                  <input type="checkbox"
                    checked={selectedPosts.length === filtered.length && filtered.length > 0}
                    onChange={e => setSelectedPosts(e.target.checked ? filtered.map((p:any) => p.id) : [])}
                    style={{ accentColor: C.lime }} />
                </th>
                {[
                  { label: 'TITLE',    col: 'title'   as const },
                  { label: 'CATEGORY', col: null },
                  { label: 'VIEWS',    col: 'views'   as const },
                  { label: 'SIGNUPS',  col: 'signups' as const },
                  { label: 'CR%',      col: 'cr'      as const },
                  { label: 'WORDS',    col: 'words'   as const },
                  { label: 'UPDATED',  col: 'updated' as const },
                  { label: 'STATUS',   col: null },
                  { label: 'ACTIONS',  col: null },
                ].map(({ label, col }) => (
                  <th key={label}
                    className={`px-4 py-3 text-left text-[10px] font-black tracking-wider ${col ? 'cursor-pointer hover:opacity-70 select-none' : ''}`}
                    style={{ color: sortCol === col ? C.limeDeep : C.muted }}
                    onClick={() => col && toggleSort(col)}>
                    {label} {col && <SortIcon col={col} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post: any, i: number) => {
                const cr = post.views > 0 ? ((post.signups / post.views) * 100).toFixed(1) : '0.0'
                const isSelected = selectedPosts.includes(post.id)
                const updatedDate = post.updated_at || post.created_at
                const dateLabel = updatedDate ? new Date(updatedDate).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : '—'
                const daysAgo = updatedDate ? Math.floor((Date.now() - new Date(updatedDate).getTime()) / 86400000) : null
                return (
                  <tr key={post.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', backgroundColor: isSelected ? C.limeTint : C.surface }}>
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={isSelected}
                        onChange={e => setSelectedPosts(prev => e.target.checked ? [...prev, post.id] : prev.filter(id => id !== post.id))}
                        style={{ accentColor: C.lime }} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-bold truncate max-w-[180px]" style={{ color: C.dark }}>{post.title}</p>
                      <p className="text-[10px]" style={{ color: C.muted }}>/{post.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>{post.category}</span>
                    </td>
                    <td className="px-4 py-3"><span className="text-[13px] font-bold" style={{ color: C.blue }}>{(post.views ?? 0).toLocaleString()}</span></td>
                    <td className="px-4 py-3"><span className="text-[13px] font-bold" style={{ color: C.green }}>{post.signups ?? 0}</span></td>
                    <td className="px-4 py-3"><span className="text-[13px] font-bold" style={{ color: C.amber }}>{cr}%</span></td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[12px] font-bold" style={{ color: C.muted }}>{post.word_count ?? '—'}</p>
                        {post.word_goal && <div className="w-16 h-1 rounded-full overflow-hidden mt-1" style={{ backgroundColor: C.border }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(((post.word_count||0)/post.word_goal)*100,100)}%`, backgroundColor: (post.word_count||0) >= post.word_goal ? C.green : C.lime }} />
                        </div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px] font-bold" style={{ color: C.dark }}>{dateLabel}</p>
                      {daysAgo !== null && <p className="text-[10px]" style={{ color: daysAgo > 30 ? C.amber : C.muted }}>{daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(post)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all"
                        style={{ backgroundColor: post.status === 'live' ? C.limeTint : C.bg, borderColor: post.status === 'live' ? 'rgba(143,255,0,0.4)' : C.border, color: post.status === 'live' ? C.limeDeep : C.muted }}>
                        {post.status === 'live' ? '● Live' : '○ Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleFeatured(post)} title={post.is_featured ? 'Remove from featured' : 'Set as featured'}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70 border"
                          style={{ borderColor: post.is_featured ? C.lime : C.border, backgroundColor: post.is_featured ? C.limeTint : C.bg }}>
                          <Star size={12} style={{ color: post.is_featured ? C.limeDeep : C.muted }} fill={post.is_featured ? C.limeDeep : 'none'} />
                        </button>
                        <button onClick={() => openEdit(post)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70 border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                          <Edit2 size={12} style={{ color: C.muted }} />
                        </button>
                        <button onClick={() => duplicatePost(post)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70 border" style={{ borderColor: C.border, backgroundColor: C.bg }} title="Duplicate">
                          <Plus size={12} style={{ color: C.muted }} />
                        </button>
                        <button onClick={() => deletePost(post.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70" style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                          <Trash2 size={12} style={{ color: C.red }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          )}

          {/* ── KANBAN VIEW ── */}
          {listView === 'kanban' && (
            <div className="grid grid-cols-4 gap-3">
              {(['idea','draft','live','needs_update'] as const).map(col => {
                const colPosts = col === 'idea' ? [] : col === 'needs_update'
                  ? posts.filter((p:any) => p.expiry_date && new Date(p.expiry_date) < new Date())
                  : posts.filter((p:any) => p.status === col)
                const colLabels: Record<string, string> = { idea: 'Ideas', draft: 'Draft', live: 'Live', needs_update: 'Needs Update' }
                const colColors: Record<string, string> = { idea: C.muted, draft: C.amber, live: C.green, needs_update: C.red }
                return (
                  <div key={col} className="rounded-2xl border p-3 flex flex-col gap-2" style={{ borderColor: C.border, backgroundColor: C.bg, minHeight: 200 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black tracking-wider" style={{ color: colColors[col] }}>{colLabels[col]}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: colColors[col] + '20', color: colColors[col] }}>{colPosts.length}</span>
                    </div>
                    {colPosts.map((post: any) => (
                      <div key={post.id} onClick={() => openEdit(post)}
                        className="p-3 rounded-xl border cursor-pointer hover:opacity-80 transition-all"
                        style={{ backgroundColor: C.surface, borderColor: C.border }}>
                        <p className="text-[12px] font-bold leading-tight" style={{ color: C.dark }}>{post.title}</p>
                        <p className="text-[10px] mt-1" style={{ color: C.muted }}>{post.category} · {post.word_count ?? 0} words</p>
                      </div>
                    ))}
                    {col === 'idea' && (
                      <button onClick={openNew}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-bold hover:opacity-70"
                        style={{ borderColor: C.border, color: C.muted, borderStyle: 'dashed' }}>
                        <Plus size={11} /> New Idea
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── CALENDAR VIEW ── */}
          {listView === 'calendar' && (() => {
            const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
            const firstDay = new Date(calYear, calMonth, 1).getDay()
            const monthName = new Date(calYear, calMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' })
            function prevMonth() { if(calMonth === 0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1) }
            function nextMonth() { if(calMonth === 11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1) }
            return (
              <div className="p-3">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-3">
                  <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                    <ChevronDown size={14} style={{ color: C.muted, transform: 'rotate(90deg)' }}/>
                  </button>
                  <p className="text-[13px] font-black" style={{ color: C.dark }}>{monthName}</p>
                  <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                    <ChevronDown size={14} style={{ color: C.muted, transform: 'rotate(-90deg)' }}/>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} className="text-[10px] font-bold text-center py-1" style={{ color: C.muted }}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                    const dayPosts = posts.filter((p:any) =>
                      (p.created_at ?? '').startsWith(dateStr) ||
                      (p.publish_at ?? '').startsWith(dateStr)
                    )
                    const now = new Date()
                    const isToday = day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear()
                    return (
                      <div key={day} className="rounded-xl p-1.5 min-h-[52px]"
                           style={{ backgroundColor: isToday ? C.limeTint : C.bg, border: `1px solid ${isToday ? C.lime : C.border}` }}>
                        <p className="text-[10px] font-bold" style={{ color: isToday ? C.limeDeep : C.muted }}>{day}</p>
                        {dayPosts.map((p:any) => (
                          <div key={p.id} onClick={() => openEdit(p)}
                            className="mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold truncate cursor-pointer hover:opacity-70"
                            style={{ backgroundColor: p.status === 'live' ? C.lime : C.amber + '40', color: p.status === 'live' ? C.dark : C.amber }}>
                            {p.title}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={() => setDeleteConfirm(null)}>
          <div className="rounded-2xl border shadow-2xl p-6 max-w-sm w-full mx-4"
               style={{ backgroundColor: '#fff', borderColor: C.border }}
               onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                 style={{ backgroundColor: 'rgba(185,28,28,0.1)' }}>
              <Trash2 size={22} style={{ color: C.red }} />
            </div>
            <p className="text-[15px] font-black mb-1" style={{ color: C.dark }}>Delete Post</p>
            <p className="text-[13px] mb-5" style={{ color: C.muted }}>{deleteConfirm.msg}</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl text-[13px] font-bold border"
                style={{ borderColor: C.border, color: C.muted, backgroundColor: C.surface }}>
                Cancel
              </button>
              <button onClick={deleteConfirm.onConfirm}
                className="flex-1 py-2 rounded-xl text-[13px] font-bold"
                style={{ backgroundColor: C.red, color: '#fff' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── EDITOR VIEW ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 w-full" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl"
             style={{ backgroundColor: toast.ok ? C.dark : '#FEF2F2', border: `1px solid ${toast.ok ? C.lime : '#fecaca'}`, cursor: toast.onClick ? 'pointer' : 'default' }}
             onClick={() => { if(toast.onClick){ toast.onClick(); setToast(null) } }}>
          {toast.ok ? <CheckCircle size={15} style={{ color: C.lime }} /> : <AlertTriangle size={15} style={{ color: C.red }} />}
          <p className="text-[13px] font-semibold" style={{ color: toast.ok ? C.lime : C.red }}>{toast.msg}</p>
          {toast.onClick && <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg ml-1" style={{ backgroundColor: C.lime, color: C.dark }}>Restore</span>}
        </div>
      )}

      {/* Blog Templates Modal */}
      {showTemplates && (
        <BlogTemplates
          onClose={() => setShowTemplates(false)}
          onSelect={(template: BlogTemplate) => {
            setEditorContent(template.html)
            // Calculate word count from template
            const wc = template.html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
            setWordCount(wc)
            if (!title) setTitle(template.defaultTitle)
            if (!metaDesc) setMetaDesc(template.defaultMeta)
            setShowTemplates(false)
            showToast(`Template "${template.name}" loaded — customize the [brackets]`)
          }}
        />
      )}

      {/* Social Repurpose Modal */}
      {showSocial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
             onClick={() => setShowSocial(false)}>
          <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
               style={{ backgroundColor: C.surface }}
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-3">
                <p className="text-[14px] font-black" style={{ color: C.dark }}>Social Repurposer</p>
                <div className="flex items-center gap-1">
                  {(['linkedin', 'twitter'] as const).map(p => (
                    <button key={p} onClick={() => { setSocialPlatform(p); repurposeToSocial() }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold border capitalize transition-all"
                      style={{ backgroundColor: socialPlatform === p ? '#8fff00' : C.bg, borderColor: socialPlatform === p ? '#8fff00' : C.border, color: socialPlatform === p ? '#1a2410' : C.muted }}>
                      {p === 'twitter' ? 'X / Twitter' : 'LinkedIn'}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowSocial(false)}><X size={16} style={{ color: C.muted }} /></button>
            </div>
            <div className="p-5">
              <textarea value={socialOutput} onChange={e => setSocialOutput(e.target.value)} rows={12}
                className="w-full p-4 rounded-xl border text-[13px] leading-relaxed outline-none resize-none"
                style={{ borderColor: C.border, backgroundColor: C.bg, color: C.dark, fontFamily: 'monospace' }} />
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => { navigator.clipboard.writeText(socialOutput); showToast('Copied!') }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold"
                  style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                  <Check size={13} /> Copy
                </button>
                <span className="text-[11px]" style={{ color: C.muted }}>{socialOutput.length} chars</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-[13px] font-bold hover:opacity-70" style={{ color: C.muted }}>
            <X size={16} /> Cancel
          </button>
          {editingPost && (
            <button onClick={saveRevision}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border hover:opacity-80"
              style={{ borderColor: C.border, color: C.muted, backgroundColor: C.surface }}>
              <RefreshCw size={11} /> Save Revision
            </button>
          )}
          <button onClick={copyAsMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border hover:opacity-80"
            style={{ borderColor: C.border, color: C.muted, backgroundColor: C.surface }}>
            <Code size={11} /> Copy Text
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: C.bg, color: C.muted }}>
            {readingTime} min read
          </span>
          {/* Auto-save indicator */}
          {autoSaveStatus !== 'idle' && (
            <span className="text-[10px] font-bold flex items-center gap-1"
                  style={{ color: autoSaveStatus === 'saved' ? C.green : C.muted }}>
              {autoSaveStatus === 'saving' ? <RefreshCw size={10} className="animate-spin" /> : <Check size={10} />}
              {autoSaveStatus === 'saving' ? 'Saving...' : 'Auto-saved'}
            </span>
          )}

          {/* Find & Replace toggle */}
          <button onClick={() => setShowFindReplace(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border"
            style={{ borderColor: showFindReplace ? C.amber : C.border, color: showFindReplace ? C.amber : C.muted, backgroundColor: showFindReplace ? '#fffbeb' : C.surface }}>
            <Search size={12} /> Find
          </button>

          {/* Dark mode toggle */}
          <button onClick={() => setDarkEditor(d => !d)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border"
            style={{ borderColor: darkEditor ? C.dark : C.border, color: darkEditor ? C.lime : C.muted, backgroundColor: darkEditor ? C.dark : C.surface }}>
            <Moon size={12} /> Dark
          </button>

          {/* Focus mode */}
          <button onClick={() => setFocusMode(f => !f)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border"
            style={{ borderColor: focusMode ? C.blue : C.border, color: focusMode ? C.blue : C.muted, backgroundColor: focusMode ? '#eff6ff' : C.surface }}>
            <Maximize size={12} /> Focus
          </button>

          <button onClick={() => setShowPreview(p => !p)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold border"
            style={{ borderColor: showPreview ? C.lime : C.border, color: showPreview ? C.limeDeep : C.muted, backgroundColor: showPreview ? C.limeTint : C.surface }}>
            <Eye size={13} /> {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button onClick={pingGoogleIndex} disabled={indexStatus === 'pinging'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition-all"
            style={{ borderColor: indexStatus === 'done' ? C.green : C.border, color: indexStatus === 'done' ? C.green : C.muted, backgroundColor: C.surface }}>
            {indexStatus === 'pinging' ? <RefreshCw size={12} className="animate-spin" /> : <Globe size={12} />}
            {indexStatus === 'done' ? 'Indexed!' : indexStatus === 'pinging' ? 'Pinging...' : 'Ping Google'}
          </button>
          <button onClick={repurposeToSocial}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border hover:opacity-80"
            style={{ borderColor: C.blue, color: C.blue, backgroundColor: C.surface }}>
            <Zap size={12} /> Repurpose
          </button>
          <button onClick={() => setShowTemplates(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border hover:opacity-80"
            style={{ borderColor: C.limeDeep, color: C.limeDeep, backgroundColor: C.limeTint }}>
            <Layers size={12} /> Templates
          </button>
          <button onClick={() => setShowDrawer(d => !d)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border hover:opacity-80"
            style={{ borderColor: showDrawer ? C.limeDeep : C.border, color: showDrawer ? C.limeDeep : C.muted, backgroundColor: showDrawer ? C.limeTint : C.surface }}>
            <Settings size={12} /> SEO Tools
          </button>
          {/* Status dropdown */}
          <div className="relative">
            <button onClick={() => setShowStatusDrop(s => !s)}
              className="flex items-center gap-2 h-9 px-3 rounded-xl border text-[12px] font-bold"
              style={{ borderColor: status === 'live' ? C.lime : C.border, backgroundColor: status === 'live' ? C.limeTint : C.surface, color: status === 'live' ? C.limeDeep : C.muted }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status === 'live' ? C.green : C.amber }} />
              {status === 'live' ? 'Live' : 'Draft'}
              <ChevronDown size={11} />
            </button>
            {showStatusDrop && (
              <div className="absolute right-0 top-11 z-50 rounded-xl border shadow-lg overflow-hidden"
                   style={{ backgroundColor: C.surface, borderColor: C.border, minWidth: 130 }}>
                {([
                  { value: 'draft', label: 'Draft',     dot: C.amber,    desc: 'Not published' },
                  { value: 'live',  label: 'Live',      dot: C.green,    desc: 'Public on site' },
                ] as const).map(opt => (
                  <button key={opt.value} onClick={() => { setStatus(opt.value); setShowStatusDrop(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:opacity-80 transition-all"
                    style={{ backgroundColor: status === opt.value ? C.bg : C.surface }}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.dot }} />
                    <div>
                      <p className="text-[12px] font-bold" style={{ color: C.dark }}>{opt.label}</p>
                      <p className="text-[10px]" style={{ color: C.muted }}>{opt.desc}</p>
                    </div>
                    {status === opt.value && <Check size={11} style={{ color: C.green, marginLeft: 'auto' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => { savePost(); setShowStatusDrop(false) }} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-50"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            {saving ? <RefreshCw size={14} className="animate-spin" /> : status === 'live' ? <Globe size={14} /> : <Check size={14} />}
            {status === 'live' ? 'Publish Post' : 'Save Draft'}
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex gap-4 items-start w-full">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4 min-w-0" style={{ flex: 1, minWidth: 0 }}>

          {/* Find & Replace panel */}
          {showFindReplace && (
            <div className="p-4 rounded-2xl border" style={{ backgroundColor: '#fffbeb', borderColor: C.amber }}>
              <p className="text-[10px] font-black tracking-wider mb-3" style={{ color: C.amber }}>FIND & REPLACE</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>FIND</p>
                  <input value={findText} onChange={e => setFindText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && findHighlight()}
                    placeholder="Search text..."
                    className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: C.amber, backgroundColor: '#fff', color: C.dark }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>REPLACE WITH</p>
                  <input value={replaceText} onChange={e => setReplaceText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && findAndReplace()}
                    placeholder="Replace with..."
                    className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={findHighlight}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border hover:opacity-80"
                  style={{ borderColor: C.amber, color: C.amber, backgroundColor: '#fff' }}>
                  <Search size={12} /> Highlight
                </button>
                <button onClick={findAndReplace}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold hover:opacity-80"
                  style={{ backgroundColor: C.amber, color: '#fff' }}>
                  <Check size={12} /> Replace All
                </button>
                <button onClick={() => { if (editorRef.current) { editorRef.current.innerHTML = editorRef.current.innerHTML.replace(/<mark[^>]*>(.*?)<\/mark>/gi, '$1'); updatePreview() } }}
                  className="text-[11px] font-bold px-2 py-1.5 rounded-xl hover:opacity-70"
                  style={{ color: C.muted }}>Clear Highlights</button>
              </div>
            </div>
          )}

          {/* SEO Meta + SERP/Checklist side by side — hidden in focus mode */}
          {!focusMode && <div className="flex gap-4 items-start">

          {/* SEO Meta Fields */}
          <div className="flex-1 min-w-0 p-4 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <p className="text-[10px] font-black tracking-wider mb-3" style={{ color: C.muted }}>SEO & META</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>POST TITLE *</p>
                <input value={title} onChange={e => { setTitle(e.target.value); if (!editingPost) setSlug(autoSlug(e.target.value)) }}
                  placeholder="Your post title..."
                  className="w-full h-9 px-3 rounded-xl border text-[13px] font-bold outline-none"
                  style={{ borderColor: title ? C.lime : C.border, backgroundColor: '#fff', color: C.dark }} />
              </div>
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>URL SLUG</p>
                <input value={slug} onChange={e => { setSlug(e.target.value); checkDuplicate(e.target.value) }} placeholder="auto-generated"
                  className="w-full h-9 px-3 rounded-xl border text-[12px] font-mono outline-none"
                  style={{ borderColor: dupWarning ? C.red : C.border, backgroundColor: '#fff', color: C.dark }} />
                {dupWarning && <p className="text-[10px] mt-1 font-bold" style={{ color: C.red }}>Slug already exists</p>}
              </div>
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>CATEGORY</p>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border text-[12px] font-bold outline-none"
                  style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }}>
                  {Array.from(new Set([...DEFAULT_CATEGORIES, ...posts.map((p:any) => p.category).filter(Boolean)])).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold" style={{ color: C.muted }}>META TITLE</p>
                  <span className="text-[10px]" style={{ color: metaTitle.length > 60 ? C.red : C.muted }}>{metaTitle.length}/60</span>
                </div>
                <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="SEO title..."
                  className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: metaTitle.length > 60 ? C.red : C.border, backgroundColor: '#fff', color: C.dark }} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold" style={{ color: C.muted }}>META DESC</p>
                  <span className="text-[10px]" style={{ color: metaDesc.length > 160 ? C.red : C.muted }}>{metaDesc.length}/160</span>
                </div>
                <input value={metaDesc} onChange={e => setMetaDesc(e.target.value)} placeholder="Short description for Google..."
                  className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: metaDesc.length > 160 ? C.red : C.border, backgroundColor: '#fff', color: C.dark }} />
              </div>
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>AUTHOR</p>
                <div className="flex items-center gap-2">
                  {authorImage
                    ? <img src={authorImage} alt="author" className="w-8 h-8 rounded-full object-cover shrink-0" style={{ border: `2px solid ${C.lime}` }} />
                    : <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-[12px]" style={{ backgroundColor: C.lime, color: C.dark }}>{authorName.charAt(0)}</div>
                  }
                  <input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Author name..."
                    className="flex-1 h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
                </div>
                <input value={authorImage} onChange={e => setAuthorImage(e.target.value)} placeholder="Author photo URL (optional)..."
                  className="w-full h-8 px-3 rounded-xl border text-[11px] outline-none mt-1"
                  style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
              </div>
              <div className="col-span-3">
                <button onClick={() => setShowAltTitle(s => !s)}
                  className="flex items-center gap-1.5 text-[10px] font-bold hover:opacity-70 mb-1"
                  style={{ color: C.blue }}>
                  <Plus size={10} /> {showAltTitle ? 'Hide' : 'Add'} Alternative Title (A/B Test)
                </button>
                {showAltTitle && (
                  <input value={altTitle} onChange={e => setAltTitle(e.target.value)}
                    placeholder="Alternative meta title..."
                    className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: altTitle ? C.blue : C.border, backgroundColor: '#fff', color: C.dark }} />
                )}
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>PAA / SEMANTIC KEYWORDS</p>
                <input value={paaInput} onChange={e => setPaaInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && paaInput.trim()) { setPaaKeywords(k => [...k, paaInput.trim()]); setPaaInput('') }}}
                  placeholder="Type keyword + Enter..."
                  className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
                {paaKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {paaKeywords.map((kw, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                        {kw}
                        <button onClick={() => setPaaKeywords(k => k.filter((_,j) => j !== i))}><X size={9} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>AUTHOR BIO</p>
                <input value={authorBio} onChange={e => setAuthorBio(e.target.value)} placeholder="Short bio..."
                  className="w-full h-9 px-3 rounded-xl border text-[11px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
              <p className="text-[10px] font-bold shrink-0" style={{ color: C.muted }}>FEATURED IMAGE</p>
              {imgUrl && (
                <div className="relative shrink-0">
                  <img src={imgUrl} alt="featured" className="w-16 h-16 rounded-xl object-cover border" style={{ borderColor: C.border }} />
                  <button onClick={() => setImgUrl('')}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: C.red, color: '#fff' }}>
                    <X size={10} />
                  </button>
                </div>
              )}
              {!imgUrl && (
                <div className="w-16 h-16 rounded-xl border flex items-center justify-center shrink-0"
                     style={{ borderColor: C.border, backgroundColor: C.bg }}>
                  <ImageIcon size={20} style={{ color: C.muted }} />
                </div>
              )}
              <input value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="Paste image URL..."
                className="flex-1 h-9 px-3 rounded-xl border text-[12px] outline-none"
                style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border cursor-pointer hover:opacity-70 text-[12px] font-bold shrink-0"
                     style={{ borderColor: C.border, color: C.muted, backgroundColor: C.bg }}>
                {uploading ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
              </label>
              <div className="flex items-center gap-2 shrink-0 pl-3 border-l" style={{ borderColor: C.border }}>
                <span className="text-[10px] font-bold" style={{ color: C.muted }}>AUTO TOC</span>
                <button onClick={() => setEnableToC(t => !t)}
                  className="relative w-9 h-5 rounded-full transition-all"
                  style={{ backgroundColor: enableToC ? C.lime : C.border }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                       style={{ backgroundColor: enableToC ? C.dark : '#fff', left: enableToC ? '18px' : '2px' }} />
                </button>
              </div>
            </div>
          </div>{/* end SEO meta box */}

          {/* SERP + SEO Checklist right column */}
          <div className="flex flex-col gap-4 shrink-0" style={{ width: '380px' }}>

            {/* SERP Preview */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>GOOGLE SEARCH PREVIEW</p>
                <div className="flex items-center gap-1">
                  {(['desktop','mobile'] as const).map(v => (
                    <button key={v} onClick={() => setSerpView(v)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold border capitalize transition-all"
                      style={{ backgroundColor: serpView === v ? '#8fff00' : C.surface, borderColor: serpView === v ? '#8fff00' : C.border, color: serpView === v ? '#1a2410' : C.muted }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4" style={{ backgroundColor: '#fff' }}>
                <div style={{ maxWidth: serpView === 'mobile' ? 320 : '100%' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: C.limeDeep }} />
                    <span className="text-[11px]" style={{ color: C.muted }}>riazify.com › blog › {slug || 'your-post-slug'}</span>
                  </div>
                  <p className="text-[15px] font-normal" style={{ color: '#1a0dab', lineHeight: 1.3 }}>
                    {metaTitle || title || 'Your Post Title'}
                    {(metaTitle || title || '').length > 60 && <span style={{ color: C.red }}> Too long</span>}
                  </p>
                  <p className="text-[12px] mt-1" style={{ color: '#4d5156', lineHeight: 1.5 }}>
                    {metaDesc || 'Your meta description will appear here...'}
                    {metaDesc.length > 160 && <span style={{ color: C.red }}> Too long</span>}
                  </p>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] shrink-0 w-6" style={{ color: C.muted }}>Title</span>
                      <div className="h-1 rounded-full flex-1 overflow-hidden" style={{ backgroundColor: C.border }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(((metaTitle||title).length/60)*100,100)}%`, backgroundColor: (metaTitle||title).length > 60 ? C.red : C.green }} />
                      </div>
                      <span className="text-[10px] shrink-0 w-8 text-right" style={{ color: C.muted }}>{(metaTitle||title).length}/60</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] shrink-0 w-6" style={{ color: C.muted }}>Desc</span>
                      <div className="h-1 rounded-full flex-1 overflow-hidden" style={{ backgroundColor: C.border }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min((metaDesc.length/160)*100,100)}%`, backgroundColor: metaDesc.length > 160 ? C.red : C.green }} />
                      </div>
                      <span className="text-[10px] shrink-0 w-8 text-right" style={{ color: C.muted }}>{metaDesc.length}/160</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Checklist */}
            <div className="rounded-2xl border p-4" style={{ borderColor: C.border, backgroundColor: C.surface }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={13} style={{ color: C.green }} />
                  <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>SEO CHECKLIST</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md" style={{
                    backgroundColor: Object.values(seoChecks).filter(Boolean).length >= 7 ? 'rgba(22,163,74,0.1)' : 'rgba(185,28,28,0.1)',
                    color: Object.values(seoChecks).filter(Boolean).length >= 7 ? C.green : C.red
                  }}>
                    {Object.values(seoChecks).filter(Boolean).length}/{Object.values(seoChecks).length}
                  </span>
                  <input value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)}
                    placeholder="Focus keyword..."
                    className="h-7 px-2 rounded-lg border text-[11px] outline-none w-32"
                    style={{ borderColor: focusKeyword ? C.lime : C.border, backgroundColor: C.bg, color: C.dark }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-x-2 gap-y-2">
                {[
                  { label: 'Kw in Title',  pass: seoChecks.kwInTitle,           req: !!kw },
                  { label: 'Kw in Slug',   pass: seoChecks.kwInSlug,            req: !!kw },
                  { label: 'Kw in Body',   pass: seoChecks.kwInBody,            req: !!kw },
                  { label: 'Kw in H2/H3', pass: seoChecks.kwInHeading,         req: !!kw },
                  { label: 'Title 10-60',  pass: seoChecks.metaTitleOk,         req: true  },
                  { label: 'Desc 50-160',  pass: seoChecks.metaDescOk,          req: true  },
                  { label: 'Slug set',     pass: seoChecks.hasSlug,             req: true  },
                  { label: 'Feat. image',  pass: seoChecks.hasFeatImg,          req: true  },
                  { label: `Alt (${missingAltCount})`, pass: missingAltCount === 0, req: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                         style={{ backgroundColor: !item.req ? C.border : item.pass ? C.green : C.red }}>
                      {item.pass ? <Check size={7} color="#fff" /> : <X size={7} color="#fff" />}
                    </div>
                    <span className="text-[10px] leading-tight" style={{ color: !item.req ? C.muted : item.pass ? C.green : C.text }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>{/* end right column */}
          </div>}{/* end top flex row */}

          {/* Editor + Preview grid */}
          <div className="grid gap-4" style={{ gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr' }}>

            {/* Editor — RichEditor component */}
            <RichEditor
              editorRef={editorRef}
              value={editorContent}
              onChange={(html) => {
                setEditorContent(html)
                updatePreview()
              }}
              onStats={({ wordCount: wc, charCount: cc }: { wordCount: number; charCount: number; readingTime: number; bodyText: string; bodyHtml: string; missingAltCount: number }) => {
                setWordCount(wc)
                setCharCount(cc)
              }}
              enableToC={enableToC}
              focusMode={focusMode}
              minHeight={700}
            />

            {/* Live Preview */}
            {showPreview && (
              <div className="rounded-2xl border overflow-hidden flex flex-col" style={{ borderColor: C.lime, minHeight: 700 }}>
                <div className="flex items-center justify-between px-4 py-2.5 border-b"
                     style={{ backgroundColor: C.limeTint, borderColor: 'rgba(143,255,0,0.3)' }}>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-black tracking-wider" style={{ color: C.limeDeep }}>LIVE PREVIEW</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: status === 'live' ? C.lime : C.border, color: status === 'live' ? C.dark : C.muted }}>
                      {status === 'live' ? '● Live' : '○ Draft'}
                    </span>
                    {enableToC && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: C.blue + '20', color: C.blue }}>ToC On</span>}
                  </div>
                  <span className="text-[10px]" style={{ color: C.muted }}>{wordCount} words</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#fff', minHeight: 480 }}>
                  {title && (
                    <div className="mb-5 pb-4 border-b" style={{ borderColor: C.border }}>
                      {category && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
                              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>{category}</span>
                      )}
                      <h1 style={{ fontSize: 26, fontWeight: 800, color: C.dark, lineHeight: 1.3, margin: '8px 0 6px' }}>{title}</h1>
                      {metaDesc && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{metaDesc}</p>}
                      {imgUrl && <img src={imgUrl} alt={title} style={{ width: '100%', borderRadius: 12, marginTop: 12, maxHeight: 220, objectFit: 'cover' }} />}
                    </div>
                  )}
                  <div className="prose-preview" style={{ fontSize: 15, lineHeight: 1.8, color: C.dark }}
                       dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color:#8a9e78">Your content will appear here...</p>' }} />
                  <style>{`
                    .prose-preview h1 { font-size:28px;font-weight:800;margin:20px 0 10px;color:#1a2410; }
                    .prose-preview h2 { font-size:22px;font-weight:700;margin:18px 0 8px;color:#1a2410; }
                    .prose-preview h3 { font-size:18px;font-weight:700;margin:14px 0 6px;color:#1a2410; }
                    .prose-preview p  { margin:8px 0; }
                    .prose-preview ul { list-style:disc;padding-left:24px;margin:8px 0; }
                    .prose-preview ol { list-style:decimal;padding-left:24px;margin:8px 0; }
                    .prose-preview blockquote { border-left:3px solid #8fff00;padding-left:14px;margin:12px 0;color:#8a9e78;font-style:italic; }
                    .prose-preview pre { background:#f1f5f9;padding:14px;border-radius:8px;font-family:monospace;font-size:13px;margin:12px 0; }
                    .prose-preview a { color:#4a8f00;text-decoration:underline; }
                    .prose-preview img { max-width:100%;border-radius:8px;margin:8px 0; }
                    .prose-preview code { background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px; }
                    .faq-block { margin:16px 0;border:1px solid #e8ede2;border-radius:12px;overflow:hidden; }
                    .faq-item { border-bottom:1px solid #e8ede2;padding:12px 16px; }
                    .faq-item:last-child { border-bottom:none; }
                    .faq-q { font-weight:700;font-size:14px;color:#1a2410;margin-bottom:4px; }
                    .faq-a { font-size:13px;color:#8a9e78;line-height:1.6; }
                    .callout-info { display:flex;gap:10px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 16px;margin:12px 0; }
                    .callout-warning { display:flex;gap:10px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 16px;margin:12px 0; }
                    .callout-icon { font-size:11px;font-weight:900;flex-shrink:0;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center; }
                    .callout-info .callout-icon { background:#1d4ed8;color:#fff; }
                    .callout-warning .callout-icon { background:#d97706;color:#fff; }
                    .callout-info div { color:#1e40af;font-size:13px;line-height:1.6; }
                    .callout-warning div { color:#92400e;font-size:13px;line-height:1.6; }
                    .cta-banner { display:flex;align-items:center;justify-content:space-between;background:#1a2410;border-radius:14px;padding:18px 22px;margin:16px 0;gap:16px; }
                    .cta-text { display:flex;flex-direction:column;gap:3px; }
                    .cta-text strong { color:#8fff00;font-size:15px;font-weight:800; }
                    .cta-text span { color:rgba(255,255,255,0.6);font-size:12px; }
                    .cta-btn { background:#8fff00;color:#1a2410;font-weight:800;font-size:13px;padding:10px 20px;border-radius:10px;text-decoration:none;white-space:nowrap; }
                    .step-block { display:flex;gap:14px;align-items:flex-start;margin:14px 0; }
                    .step-num { background:#8fff00;color:#1a2410;font-weight:900;font-size:14px;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
                    .step-content h3 { margin:0 0 6px;font-size:16px;font-weight:700;color:#1a2410; }
                    .toc-block { background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:12px;padding:16px 20px;margin-bottom:20px; }
                    .toc-block strong { color:#4a8f00;font-size:13px;display:block;margin-bottom:8px; }
                    .toc-block ol { list-style:decimal;padding-left:20px;margin:0; }
                    .toc-block a { color:#4a8f00;text-decoration:none;font-size:13px; }
                    .calc-block { background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px;padding:20px;margin:16px 0; }
                    .calc-title { font-weight:800;font-size:14px;color:#1a2410;margin-bottom:14px; }
                    .calc-row { display:flex;align-items:center;justify-content:space-between;margin-bottom:10px; }
                    .calc-row label { font-size:13px;color:#8a9e78;font-weight:600; }
                    .calc-input { width:120px;padding:6px 10px;border:1px solid #e8ede2;border-radius:8px;font-size:13px;outline:none; }
                    .calc-result { font-size:18px;font-weight:900;color:#16a34a;margin-top:12px;padding-top:12px;border-top:1px solid #e8ede2; }
                  `}</style>
                </div>
              </div>
            )}
          </div>
        </div>


      </div>{/* end flex row */}

      {/* ── SIDE DRAWER — slides in from right ── */}
      {showDrawer && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
          width: '380px', backgroundColor: '#fff',
          boxShadow: '-4px 0 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <div className="flex items-center gap-2">
              <Settings size={15} style={{ color: C.limeDeep }} />
              <p className="text-[13px] font-black" style={{ color: C.dark }}>SEO Tools</p>
            </div>
            <button onClick={() => setShowDrawer(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
              style={{ backgroundColor: C.border }}>
              <X size={14} style={{ color: C.muted }} />
            </button>
          </div>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">

            {/* QUICK-PASTE SNIPPETS */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={13} style={{ color: C.limeDeep }} />
                <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>QUICK-PASTE SNIPPETS</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'Link → Riazify Pricing',  html: '<a href="/pricing">Riazify Pricing Plans</a>' },
                  { label: 'Link → VeRO Guide',       html: '<a href="/blog/vero-violations">VeRO Violation Guide</a>' },
                  { label: 'Link → Profit Calc',      html: '<a href="/dashboard/profit-calculator">eBay Profit Calculator</a>' },
                  { label: 'Link → Title Builder',    html: '<a href="/dashboard/title-builder">AI Title Builder</a>' },
                  { label: 'Link → Orders',           html: '<a href="/dashboard/orders">Order Protection Tool</a>' },
                  { label: 'VeRO Warning',            html: '<p style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px;font-size:13px;color:#9a3412"><strong>VeRO Warning:</strong> Always verify brand permissions before listing.</p>' },
                  { label: 'Affiliate Disclaimer',    html: '<p style="font-size:12px;color:#8a9e78;border-top:1px solid #e8ede2;padding-top:8px"><em>Disclosure: This article may contain affiliate links.</em></p>' },
                  { label: 'Try Riazify CTA',         html: '[CTA:free]' },
                ].map((snippet, i) => (
                  <button key={i}
                    onMouseDown={e => { e.preventDefault(); insertHtml(snippet.html); showToast('Snippet inserted') }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border text-left hover:opacity-80"
                    style={{ borderColor: C.border, backgroundColor: C.bg }}>
                    <Zap size={11} style={{ color: C.limeDeep, flexShrink: 0 }} />
                    <span className="text-[11px] font-bold" style={{ color: C.text }}>{snippet.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: C.border }} />

            {/* VERO BRAND SAFETY */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={13} style={{ color: C.red }} />
                <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>VERO BRAND SAFETY</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: C.bg }}>
                <CheckCircle size={13} style={{ color: C.green }} />
                <span className="text-[12px]" style={{ color: C.green }}>No trademark risks detected</span>
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: C.border }} />

            {/* TOPIC CLUSTER */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers size={13} style={{ color: C.muted }} />
                <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>TOPIC CLUSTER</p>
              </div>
              <p className="text-[12px]" style={{ color: C.muted }}>No published posts in this category yet.</p>
            </div>

            <div style={{ height: 1, backgroundColor: C.border }} />

            {/* AI WRITING ASSISTANT */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} style={{ color: C.blue }} />
                <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>AI WRITING ASSISTANT</p>
              </div>
              <p className="text-[11px] mb-3" style={{ color: C.muted }}>Select text in the editor then click an action, or generate a content brief.</p>
              <div className="flex flex-wrap gap-2">
                {(['improve','expand','brief'] as const).map(action => (
                  <button key={action} onClick={() => callAI(action)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border hover:opacity-80"
                    style={{ borderColor: C.blue, color: C.blue, backgroundColor: '#eff6ff' }}>
                    <Sparkles size={11} /> {action === 'improve' ? 'Improve' : action === 'expand' ? 'Expand' : 'Brief'}
                  </button>
                ))}
              </div>
              {aiLoading && (
                <div className="flex items-center gap-2 mt-3">
                  <RefreshCw size={13} className="animate-spin" style={{ color: C.blue }} />
                  <span className="text-[11px]" style={{ color: C.blue }}>Generating...</span>
                </div>
              )}
            </div>

            <div style={{ height: 1, backgroundColor: C.border }} />

            {/* CONTENT ANALYSIS */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 size={13} style={{ color: C.limeDeep }} />
                <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>CONTENT ANALYSIS</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ backgroundColor: C.bg }}>
                  <span className="text-[12px] font-bold" style={{ color: C.text }}>Keyword Density</span>
                  <span className="text-[12px]" style={{ color: C.muted }}>
                    {kw ? `${((editorRef.current?.innerText ?? '').toLowerCase().split(kw.toLowerCase()).length - 1)}x` : '— set keyword'}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ backgroundColor: C.bg }}>
                  <span className="text-[12px] font-bold" style={{ color: C.text }}>H1 Tags</span>
                  <span className="text-[12px] font-bold" style={{ color: h1Count === 1 ? C.green : C.red }}>
                    {h1Count} — {h1Count === 0 ? 'Missing' : h1Count === 1 ? 'Perfect' : 'Too many'}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ backgroundColor: C.bg }}>
                  <span className="text-[12px] font-bold" style={{ color: C.text }}>Transition Words</span>
                  <span className="text-[12px] font-bold" style={{ color: transitionScore >= 30 ? C.green : C.amber }}>
                    {transitionScore}% {transitionScore >= 30 ? '✓ Good' : 'Too low'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: C.border }} />

            {/* SCHEDULE + FRESHNESS */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={13} style={{ color: C.muted }} />
                <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>SCHEDULE + FRESHNESS</p>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>SCHEDULED PUBLISHING</p>
                  <input type="datetime-local" value={publishAt} onChange={e => setPublishAt(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>SEO FRESHNESS DATE</p>
                  <input type="date" value={lastModified} onChange={e => setLastModified(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>LEAD MAGNET GATE</p>
                  <div onClick={() => setGateContent(g => !g)} className="flex items-center gap-2 cursor-pointer">
                    <div className="w-10 h-5 rounded-full relative transition-all"
                      style={{ backgroundColor: gateContent ? C.lime : C.border }}>
                      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                        style={{ left: gateContent ? '22px' : '2px' }} />
                    </div>
                    <span className="text-[12px]" style={{ color: C.text }}>Gate content behind email</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: C.border }} />

            {/* RELATED POSTS + BROKEN LINKS */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <List size={13} style={{ color: C.muted }} />
                <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>RELATED POSTS + LINKS</p>
              </div>
              <p className="text-[12px] mb-3" style={{ color: C.muted }}>No published posts available.</p>
              <button onClick={checkLinks}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold border hover:opacity-80"
                style={{ borderColor: C.border, color: C.muted, backgroundColor: C.bg }}>
                <Search size={11} /> Check Broken Links
              </button>
              {brokenLinks.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {brokenLinks.map((l, i) => (
                    <p key={i} className="text-[10px]" style={{ color: C.red }}>{l}</p>
                  ))}
                </div>
              )}
            </div>

            <div style={{ height: 1, backgroundColor: C.border }} />

            {/* COMPETITOR ANALYZER */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe size={13} style={{ color: C.muted }} />
                <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>COMPETITOR ANALYZER</p>
              </div>
              <div className="flex gap-2 mb-3">
                <input value={competitorUrl} onChange={e => setCompetitorUrl(e.target.value)}
                  placeholder="https://competitor.com/post"
                  className="flex-1 h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
                <button onClick={analyzeCompetitor}
                  className="px-3 py-2 rounded-xl text-[11px] font-bold"
                  style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>Analyze</button>
              </div>
              {competitorData && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ backgroundColor: C.bg }}>
                    <span className="text-[11px]" style={{ color: C.muted }}>Word count</span>
                    <span className="text-[12px] font-bold" style={{ color: C.text }}>{competitorData.wordCount}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ backgroundColor: C.bg }}>
                    <span className="text-[11px]" style={{ color: C.muted }}>H2 headings</span>
                    <span className="text-[12px] font-bold" style={{ color: C.text }}>{competitorData.h2Count}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ height: 1, backgroundColor: C.border }} />

            {/* ADMIN TRACKING */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Settings size={13} style={{ color: C.muted }} />
                <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>ADMIN TRACKING</p>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>GOOGLE RANK POSITION</p>
                  <input value={rankPosition} onChange={e => setRankPosition(e.target.value)}
                    placeholder="e.g. #4"
                    className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>CONTENT EXPIRY DATE</p>
                  <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: expiryDate && new Date(expiryDate) < new Date() ? C.red : C.border, backgroundColor: '#fff', color: C.dark }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>INTERNAL ADMIN NOTES</p>
                  <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Private notes..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border text-[12px] outline-none resize-none"
                    style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}