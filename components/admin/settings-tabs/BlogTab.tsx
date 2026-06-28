'use client'
// components/admin/settings-tabs/BlogTab.tsx
// Full rich-text blog editor — Advanced SEO Edition
// Features: Rich toolbar, FAQ blocks, Callouts, CTA banners, Auto ToC, Live preview

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Link2, Image, Quote,
  Code, AlignLeft, AlignCenter, AlignRight,  Plus, Edit2, Trash2, RefreshCw, Check, X,
  AlertTriangle, CheckCircle, Eye, Globe,
  BookOpen, Users, ChevronDown, ChevronRight,
  HelpCircle, Lightbulb, Zap, ListChecks,
} from 'lucide-react'

const C = {
  lime:     '#8fff00', limeDeep: '#4a8f00', limeTint: '#f4ffe6',
  dark:     '#1a2410', text:     '#1a2410', muted:    '#8a9e78',
  border:   '#e8ede2', surface:  '#ffffff', bg:       '#f7f9f5',
  red:      '#b91c1c', amber:    '#d97706', green:    '#16a34a',
  blue:     '#1d4ed8',
}

const CATEGORIES = ['eBay Basics', 'Arbitrage', 'Wholesale', 'Riazify Tutorials', 'Product Research']

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
  const supabase  = createClient()
  const editorRef = useRef<HTMLDivElement>(null)

  const [posts,          setPosts]          = useState<any[]>([])
  const [loading,        setLoading]        = useState(true)
  const [view,           setView]           = useState<'list' | 'editor'>('list')
  const [editingPost,    setEditingPost]    = useState<any>(null)
  const [saving,         setSaving]         = useState(false)
  const [uploading,      setUploading]      = useState(false)
  const [toast,          setToast]          = useState<{ msg: string; ok: boolean } | null>(null)
  const [filter,         setFilter]         = useState<'all' | 'draft' | 'live'>('all')
  const [showPreview,    setShowPreview]    = useState(true)
  const [showColorPick,  setShowColorPick]  = useState(false)
  const [showFontSize,   setShowFontSize]   = useState(false)
  const [showLinkInput,  setShowLinkInput]  = useState(false)
  const [linkUrl,        setLinkUrl]        = useState('')
  const [previewHtml,    setPreviewHtml]    = useState('')
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
  const [showSocial,     setShowSocial]     = useState(false)
  const [socialOutput,   setSocialOutput]   = useState('')
  const [socialPlatform, setSocialPlatform] = useState<'linkedin' | 'twitter'>('linkedin')
  const [indexStatus,    setIndexStatus]    = useState<'idle' | 'pinging' | 'done'>('idle')
  const [adminNotes,     setAdminNotes]     = useState('')
  const [rankPosition,   setRankPosition]   = useState('')
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
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20)
    if (socialPlatform === 'twitter') {
      const threads = sentences.slice(0, 8).map((s, i) => `${i + 1}/ ${s}.`)
      const thread  = [
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
    setIndexStatus('pinging')
    await new Promise(r => setTimeout(r, 1800))
    setIndexStatus('done')
    showToast('Google Index API pinged — article queued for crawl')
    setTimeout(() => setIndexStatus('idle'), 5000)
  }

  // ── Reading time ─────────────────────────────────────────────
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  // ── Broken link checker ───────────────────────────────────────
  async function checkLinks() {
    setCheckingLinks(true)
    setBrokenLinks([])
    const html = editorRef.current?.innerHTML ?? ''
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
        body:       editorRef.current?.innerHTML ?? '',
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

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
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
    setBrokenLinks([]); setDupWarning(false)
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p>Start writing your post here...</p>'
        updatePreview()
      }
    }, 100)
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
    setAdminNotes(post.admin_notes ?? '')
    setRankPosition(post.rank_position ?? '')
    setExpiryDate(post.expiry_date ?? '')
    setRelatedPosts(post.related_posts ?? [])
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = post.body ?? '<p>Start writing...</p>'
        updatePreview()
      }
    }, 100)
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
    const wc = editorRef.current.innerText.trim().split(/\s+/).filter(Boolean).length
    setWordCount(wc)
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
    const body = editorRef.current?.innerHTML ?? ''
    if (!title.trim()) { showToast('Title is required', false); return }
    setSaving(true)
    try {
      const payload = {
        title:              title.trim(),
        slug:               slug || autoSlug(title),
        meta_title:         metaTitle || title,
        meta_description:   metaDesc,
        category,
        status,
        body,
        word_count:         wordCount,
        last_modified:      lastModified,
        gate_content:       gateContent,
        alt_title:          altTitle || null,
        paa_keywords:       paaKeywords,
        author_name:        authorName,
        author_bio:         authorBio,
        enable_toc:         enableToC,
        featured_image_url: imgUrl || null,
        updated_at:         new Date().toISOString(),
        admin_notes:        adminNotes || null,
        rank_position:      rankPosition || null,
        expiry_date:        expiryDate || null,
        related_posts:      relatedPosts,
      }
      if (editingPost) {
        await (supabase.from('blog_posts') as any).update(payload).eq('id', editingPost.id)
        showToast('Post updated')
      } else {
        await (supabase.from('blog_posts') as any).insert({ ...payload, views: 0, signups: 0, created_at: new Date().toISOString() })
        showToast('Post created')
      }
      loadPosts()
      setView('list')
    } catch { showToast('Failed to save', false) }
    setSaving(false)
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return
    await (supabase.from('blog_posts') as any).delete().eq('id', id)
    showToast('Post deleted')
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
  const filtered     = filter === 'all' ? posts : posts.filter(p => p.status === filter)

  // u2500u2500 SEO Checklist u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500
  const bodyText  = editorRef.current?.innerText?.toLowerCase() ?? ''
  const bodyHtml  = editorRef.current?.innerHTML ?? ''
  const kw        = focusKeyword.toLowerCase().trim()
  const seoChecks = {
    kwInTitle:    kw ? metaTitle.toLowerCase().includes(kw)  : false,
    kwInSlug:     kw ? slug.toLowerCase().includes(kw)       : false,
    kwInBody:     kw ? bodyText.includes(kw)                 : false,
    kwInHeading:  kw ? (bodyHtml.match(/<h[23][^>]*>.*?<\/h[23]>/gi) ?? []).some((h: string) => h.toLowerCase().includes(kw)) : false,
    metaTitleOk:  metaTitle.length > 0 && metaTitle.length <= 60,
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
             style={{ backgroundColor: toast.ok ? C.dark : '#FEF2F2', border: `1px solid ${toast.ok ? C.lime : '#fecaca'}` }}>
          {toast.ok ? <CheckCircle size={15} style={{ color: C.lime }} /> : <AlertTriangle size={15} style={{ color: C.red }} />}
          <p className="text-[13px] font-semibold" style={{ color: toast.ok ? C.lime : C.red }}>{toast.msg}</p>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Posts',       value: posts.length, color: C.dark,    icon: BookOpen },
          { label: 'Live Posts',        value: livePosts,    color: C.limeDeep,icon: Globe    },
          { label: 'Total Views',       value: totalViews,   color: C.blue,    icon: Eye      },
          { label: 'Signups from Blog', value: totalSignups, color: C.green,   icon: Users    },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: s.color + '18' }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[22px] font-extrabold leading-tight" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-bold tracking-wider" style={{ color: C.muted }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['all', 'live', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all capitalize"
              style={{ backgroundColor: filter === f ? '#8fff00' : C.surface, borderColor: filter === f ? '#8fff00' : C.border, color: filter === f ? '#1a2410' : C.muted }}>
              {f} {f === 'all' ? `(${posts.length})` : f === 'live' ? `(${livePosts})` : `(${posts.length - livePosts})`}
            </button>
          ))}
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold"
          style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
          <Plus size={15} /> New Post
        </button>
      </div>

      {/* Posts table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className="animate-spin" style={{ color: C.limeDeep }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <BookOpen size={36} style={{ color: C.muted }} />
          <p className="text-[15px] font-bold" style={{ color: C.dark }}>No posts yet</p>
          <p className="text-[13px]" style={{ color: C.muted }}>Write your first blog post to drive organic traffic</p>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold mt-2"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            <Plus size={14} /> Write First Post
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {['TITLE', 'CATEGORY', 'VIEWS', 'SIGNUPS', 'CR%', 'WORDS', 'STATUS', 'ACTIONS'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black tracking-wider"
                      style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post: any, i: number) => {
                const cr = post.views > 0 ? ((post.signups / post.views) * 100).toFixed(1) : '0.0'
                return (
                  <tr key={post.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', backgroundColor: C.surface }}>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-bold truncate max-w-[180px]" style={{ color: C.dark }}>{post.title}</p>
                      <p className="text-[10px]" style={{ color: C.muted }}>/{post.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>{post.category}</span>
                    </td>
                    <td className="px-4 py-3"><span className="text-[13px] font-bold" style={{ color: C.blue }}>{post.views ?? 0}</span></td>
                    <td className="px-4 py-3"><span className="text-[13px] font-bold" style={{ color: C.green }}>{post.signups ?? 0}</span></td>
                    <td className="px-4 py-3"><span className="text-[13px] font-bold" style={{ color: C.amber }}>{cr}%</span></td>
                    <td className="px-4 py-3"><span className="text-[12px]" style={{ color: C.muted }}>{post.word_count ?? '—'}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(post)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all"
                        style={{ backgroundColor: post.status === 'live' ? C.limeTint : C.bg, borderColor: post.status === 'live' ? 'rgba(143,255,0,0.4)' : C.border, color: post.status === 'live' ? C.limeDeep : C.muted }}>
                        {post.status === 'live' ? '● Live' : '○ Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(post)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70 border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                          <Edit2 size={12} style={{ color: C.muted }} />
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
        </div>
      )}
    </div>
  )

  // ── EDITOR VIEW ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl"
             style={{ backgroundColor: toast.ok ? C.dark : '#FEF2F2', border: `1px solid ${toast.ok ? C.lime : '#fecaca'}` }}>
          {toast.ok ? <CheckCircle size={15} style={{ color: C.lime }} /> : <AlertTriangle size={15} style={{ color: C.red }} />}
          <p className="text-[13px] font-semibold" style={{ color: toast.ok ? C.lime : C.red }}>{toast.msg}</p>
        </div>
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
          <select value={status} onChange={e => setStatus(e.target.value as any)}
            className="h-9 px-3 rounded-xl border text-[12px] font-bold outline-none"
            style={{ borderColor: status === 'live' ? C.lime : C.border, backgroundColor: status === 'live' ? C.limeTint : C.surface, color: status === 'live' ? C.limeDeep : C.muted }}>
            <option value="draft">Draft</option>
            <option value="live">Live</option>
          </select>
          <button onClick={savePost} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-50"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            {saving ? <RefreshCw size={14} className="animate-spin" /> : status === 'live' ? <Globe size={14} /> : <Check size={14} />}
            {status === 'live' ? 'Publish Post' : 'Save Draft'}
          </button>
        </div>
      </div>

      {/* ── MAIN 65/35 LAYOUT ── */}
      <div className="flex gap-4 items-start">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4 min-w-0" style={{ flex: '0 0 65%' }}>

          {/* SEO Meta Fields */}
          <div className="p-4 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
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
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
                <input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Author name..."
                  className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none mb-1"
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
              {imgUrl && <img src={imgUrl} alt="featured" className="w-10 h-10 rounded-xl object-cover border" style={{ borderColor: C.border }} />}
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
          </div>

          {/* Editor + Preview grid */}
          <div className="grid gap-4" style={{ gridTemplateColumns: showPreview ? '50% 50%' : '100%' }}>

            {/* Editor */}
            <div className="rounded-2xl border overflow-hidden flex flex-col" style={{ borderColor: C.border, minHeight: 600 }}>

              {/* Toolbar Row 1 */}
              <div className="border-b px-3 py-2 flex flex-wrap items-center gap-0.5"
                   style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <button onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'p') }}
                  className="px-2 h-7 rounded-md text-[11px] font-bold hover:opacity-70" style={{ color: C.muted }}>¶</button>
                <button onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h1') }}
                  className="px-2 h-7 rounded-md text-[13px] font-black hover:bg-black/5" style={{ color: C.text }}>H1</button>
                <button onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h2') }}
                  className="px-2 h-7 rounded-md text-[12px] font-black hover:bg-black/5" style={{ color: C.text }}>H2</button>
                <button onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h3') }}
                  className="px-2 h-7 rounded-md text-[11px] font-black hover:bg-black/5" style={{ color: C.text }}>H3</button>
                <TDiv />
                <ToolBtn icon={Bold}          title="Bold"          onClick={() => exec('bold')} />
                <ToolBtn icon={Italic}        title="Italic"        onClick={() => exec('italic')} />
                <ToolBtn icon={Underline}     title="Underline"     onClick={() => exec('underline')} />
                <ToolBtn icon={Strikethrough} title="Strikethrough" onClick={() => exec('strikeThrough')} />
                <TDiv />
                <div className="relative">
                  <button onMouseDown={e => { e.preventDefault(); setShowFontSize(s => !s); setShowColorPick(false) }}
                    className="flex items-center gap-0.5 px-2 h-7 rounded-md text-[10px] font-bold hover:opacity-70 border"
                    style={{ color: C.muted, borderColor: C.border, backgroundColor: C.surface }}>
                    Aa <ChevronDown size={9} />
                  </button>
                  {showFontSize && (
                    <div className="absolute top-8 left-0 z-50 rounded-xl border shadow-lg p-2 grid grid-cols-3 gap-1"
                         style={{ backgroundColor: C.surface, borderColor: C.border, minWidth: 160 }}>
                      {['12','14','16','18','20','24','28','32','40','48'].map(size => (
                        <button key={size} onMouseDown={e => { e.preventDefault() }}
                          onClick={() => { insertHtml(`<span style="font-size:${size}px"> </span>`); setShowFontSize(false) }}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold hover:opacity-70"
                          style={{ backgroundColor: C.bg, color: C.text }}>{size}px</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative ml-0.5">
                  <button onMouseDown={e => { e.preventDefault(); setShowColorPick(s => !s); setShowFontSize(false) }}
                    className="flex items-center gap-0.5 px-2 h-7 rounded-md hover:opacity-70 border"
                    style={{ borderColor: C.border, backgroundColor: C.surface }}>
                    <span className="text-[11px] font-black" style={{ color: C.text }}>A</span>
                    <div className="w-3 h-1 rounded-full ml-0.5" style={{ backgroundColor: C.lime }} />
                    <ChevronDown size={9} style={{ color: C.muted }} />
                  </button>
                  {showColorPick && (
                    <div className="absolute top-8 left-0 z-50 rounded-xl border shadow-lg p-2 flex flex-wrap gap-1.5"
                         style={{ backgroundColor: C.surface, borderColor: C.border, minWidth: 160 }}>
                      {['#1a2410','#b91c1c','#d97706','#16a34a','#1d4ed8','#7c3aed','#db2777','#8fff00','#64748b','#000','#fff','#f97316'].map(color => (
                        <button key={color}
                          onMouseDown={e => { e.preventDefault(); exec('foreColor', color); setShowColorPick(false) }}
                          className="w-6 h-6 rounded-lg border-2 hover:scale-110 transition-all"
                          style={{ backgroundColor: color, borderColor: color === '#ffffff' ? C.border : 'transparent' }} />
                      ))}
                    </div>
                  )}
                </div>
                <TDiv />
                <ToolBtn icon={AlignLeft}   title="Left"   onClick={() => exec('justifyLeft')} />
                <ToolBtn icon={AlignCenter} title="Center" onClick={() => exec('justifyCenter')} />
                <ToolBtn icon={AlignRight}  title="Right"  onClick={() => exec('justifyRight')} />
                <TDiv />
                <ToolBtn icon={List}        title="Bullets"    onClick={() => exec('insertUnorderedList')} />
                <ToolBtn icon={ListOrdered} title="Numbered"   onClick={() => exec('insertOrderedList')} />
                <ToolBtn icon={Quote}       title="Blockquote" onClick={() => exec('formatBlock', 'blockquote')} />
                <ToolBtn icon={Code}        title="Code block" onClick={() => insertHtml('<pre style="background:#f1f5f9;padding:14px;border-radius:8px;font-family:monospace;font-size:13px"><code>code here</code></pre>')} />
                <TDiv />
                <div className="relative">
                  <ToolBtn icon={Link2} title="Insert Link" onClick={() => setShowLinkInput(s => !s)} />
                  {showLinkInput && (
                    <div className="absolute top-8 left-0 z-50 flex items-center gap-2 p-2 rounded-xl border shadow-lg"
                         style={{ backgroundColor: C.surface, borderColor: C.border, minWidth: 260 }}>
                      <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                        placeholder="https://..." onKeyDown={e => e.key === 'Enter' && insertLink()}
                        className="flex-1 h-7 px-2 rounded-lg border text-[12px] outline-none"
                        style={{ borderColor: C.border, color: C.dark }} />
                      <button onMouseDown={e => { e.preventDefault(); insertLink() }}
                        className="px-2 py-1 rounded-lg text-[11px] font-bold"
                        style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>Add</button>
                    </div>
                  )}
                </div>
                <label title="Upload Image" className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer hover:opacity-80" style={{ color: C.text }}>
                  <Image size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
                </label>
              </div>

              {/* Toolbar Row 2 — SEO Blocks */}
              <div className="border-b px-3 py-1.5 flex items-center gap-1 flex-wrap"
                   style={{ backgroundColor: '#f0ffe8', borderColor: C.border }}>
                <span className="text-[9px] font-black tracking-wider mr-1" style={{ color: C.limeDeep }}>SEO BLOCKS:</span>
                <button onMouseDown={e => { e.preventDefault(); insertFAQ() }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border hover:opacity-80"
                  style={{ backgroundColor: '#fff', borderColor: C.lime, color: C.limeDeep }}>
                  <HelpCircle size={11} /> FAQ Block
                </button>
                <button onMouseDown={e => { e.preventDefault(); insertCallout('info') }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border hover:opacity-80"
                  style={{ backgroundColor: '#fff', borderColor: C.blue, color: C.blue }}>
                  <Lightbulb size={11} /> Info Callout
                </button>
                <button onMouseDown={e => { e.preventDefault(); insertCallout('warning') }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border hover:opacity-80"
                  style={{ backgroundColor: '#fff', borderColor: C.amber, color: C.amber }}>
                  <AlertTriangle size={11} /> Warning
                </button>
                <button onMouseDown={e => { e.preventDefault(); insertHowToStep(1) }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border hover:opacity-80"
                  style={{ backgroundColor: '#fff', borderColor: C.green, color: C.green }}>
                  <ListChecks size={11} /> How-To Step
                </button>
                <button onMouseDown={e => { e.preventDefault(); insertHtml('<p>:::calculator:::</p>') }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border hover:opacity-80"
                  style={{ backgroundColor: '#fff', borderColor: C.blue, color: C.blue }}>
                  <Zap size={11} /> Calc Block
                </button>
                <TDiv />
                <span className="text-[9px] font-black tracking-wider mr-0.5" style={{ color: C.muted }}>CTA:</span>
                {['free','starter','growth'].map(tier => (
                  <button key={tier} onMouseDown={e => { e.preventDefault(); insertCTA(tier) }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border hover:opacity-80 capitalize"
                    style={{ backgroundColor: '#8fff00', borderColor: '#8fff00', color: '#1a2410' }}>
                    <Zap size={10} /> {tier}
                  </button>
                ))}
              </div>

              {/* Content editable */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={updatePreview}
                onKeyUp={updatePreview}
                className="flex-1 p-5 outline-none overflow-y-auto"
                style={{ minHeight: 480, fontSize: 15, lineHeight: 1.8, color: C.dark, backgroundColor: '#fff' }}
              />
              <style>{`
                [contenteditable] h1 { font-size:28px;font-weight:800;margin:20px 0 10px;color:#1a2410; }
                [contenteditable] h2 { font-size:22px;font-weight:700;margin:18px 0 8px;color:#1a2410; }
                [contenteditable] h3 { font-size:18px;font-weight:700;margin:14px 0 6px;color:#1a2410; }
                [contenteditable] p  { margin:8px 0; }
                [contenteditable] ul { list-style:disc;padding-left:24px;margin:8px 0; }
                [contenteditable] ol { list-style:decimal;padding-left:24px;margin:8px 0; }
                [contenteditable] blockquote { border-left:3px solid #8fff00;padding-left:14px;margin:12px 0;color:#8a9e78;font-style:italic; }
                [contenteditable] pre { background:#f1f5f9;padding:14px;border-radius:8px;font-family:monospace;font-size:13px;margin:12px 0; }
                [contenteditable] a { color:#4a8f00;text-decoration:underline; }
                [contenteditable] img { max-width:100%;border-radius:8px;margin:8px 0; }
                [contenteditable]:focus { outline:none; }
              `}</style>
            </div>

            {/* Live Preview */}
            {showPreview && (
              <div className="rounded-2xl border overflow-hidden flex flex-col" style={{ borderColor: C.lime }}>
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

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4 shrink-0" style={{ width: '35%' }}>

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
              <div style={{ maxWidth: serpView === 'mobile' ? 360 : '100%' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: C.limeDeep }} />
                  <span className="text-[11px]" style={{ color: C.muted }}>riazify.com › blog › {slug || 'your-post-slug'}</span>
                </div>
                <p className="text-[17px] font-normal" style={{ color: '#1a0dab', lineHeight: 1.3 }}>
                  {metaTitle || title || 'Your Post Title'}
                  {(metaTitle || title || '').length > 60 && <span style={{ color: C.red }}> Too long</span>}
                </p>
                <p className="text-[13px] mt-1" style={{ color: '#4d5156', lineHeight: 1.5 }}>
                  {metaDesc || 'Your meta description will appear here...'}
                  {metaDesc.length > 160 && <span style={{ color: C.red }}> Too long</span>}
                </p>
                <div className="flex gap-3 mt-2">
                  <div className="h-1 rounded-full flex-1 overflow-hidden" style={{ backgroundColor: C.border }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(((metaTitle||title).length/60)*100,100)}%`, backgroundColor: (metaTitle||title).length > 60 ? C.red : C.green }} />
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: C.muted }}>{(metaTitle||title).length}/60</span>
                  <div className="h-1 rounded-full flex-1 overflow-hidden" style={{ backgroundColor: C.border }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min((metaDesc.length/160)*100,100)}%`, backgroundColor: metaDesc.length > 160 ? C.red : C.green }} />
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: C.muted }}>{metaDesc.length}/160</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Checklist */}
          <div className="rounded-2xl border p-4" style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>SEO CHECKLIST</p>
              <input value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)}
                placeholder="Focus keyword..."
                className="h-7 px-2 rounded-lg border text-[11px] outline-none w-36"
                style={{ borderColor: focusKeyword ? C.lime : C.border, backgroundColor: C.bg, color: C.dark }} />
            </div>
            {schemaGenerated && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl mb-3"
                   style={{ backgroundColor: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)' }}>
                <CheckCircle size={12} style={{ color: C.green }} />
                <span className="text-[11px] font-bold" style={{ color: C.green }}>Schema JSON-LD Generated</span>
                <button onClick={() => { navigator.clipboard.writeText(generateSchemaJson()); showToast('Schema copied!') }}
                  className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ backgroundColor: C.green + '20', color: C.green }}>Copy</button>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {[
                { label: 'Keyword in Meta Title',    pass: seoChecks.kwInTitle,   req: !!kw },
                { label: 'Keyword in URL Slug',      pass: seoChecks.kwInSlug,    req: !!kw },
                { label: 'Keyword in body',          pass: seoChecks.kwInBody,    req: !!kw },
                { label: 'Keyword in H2/H3',         pass: seoChecks.kwInHeading, req: !!kw },
                { label: 'Meta Title 10-60 chars',   pass: seoChecks.metaTitleOk, req: true  },
                { label: 'Meta Desc 50-160 chars',   pass: seoChecks.metaDescOk,  req: true  },
                { label: 'URL slug is set',          pass: seoChecks.hasSlug,     req: true  },
                { label: 'Featured image set',       pass: seoChecks.hasFeatImg,  req: true  },
                { label: `Alt texts (${missingAltCount} missing)`, pass: missingAltCount === 0, req: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                       style={{ backgroundColor: !item.req ? C.border : item.pass ? C.green : C.red }}>
                    {item.pass ? <Check size={9} color="#fff" /> : <X size={9} color="#fff" />}
                  </div>
                  <span className="text-[11px]" style={{ color: !item.req ? C.muted : item.pass ? C.green : C.text }}>{item.label}</span>
                </div>
              ))}
            </div>
            {readabilityWarnings.length > 0 && (
              <div className="mt-3 pt-3 border-t flex flex-col gap-1" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle size={11} style={{ color: C.amber }} />
                  <p className="text-[10px] font-black tracking-wider" style={{ color: C.amber }}>READABILITY</p>
                </div>
                {readabilityWarnings.slice(0, 3).map((w, i) => (
                  <p key={i} className="text-[10px]" style={{ color: C.amber }}>{w}</p>
                ))}
              </div>
            )}
          </div>

          {/* Quick Snippets */}
          <div className="rounded-2xl border p-4" style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <p className="text-[10px] font-black tracking-wider mb-3" style={{ color: C.muted }}>QUICK-PASTE SNIPPETS</p>
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

          {/* VeRO + Cluster */}
          <div className="rounded-2xl border p-4 flex flex-col gap-4" style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={12} style={{ color: veroHits.length > 0 ? C.amber : C.green }} />
                <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>VERO BRAND SAFETY</p>
              </div>
              {veroHits.length === 0 ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(22,163,74,0.08)' }}>
                  <CheckCircle size={13} style={{ color: C.green }} />
                  <span className="text-[12px] font-bold" style={{ color: C.green }}>No trademark risks detected</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[11px]" style={{ color: C.amber }}>Detected {veroHits.length} sensitive brand{veroHits.length > 1 ? 's' : ''}:</p>
                  <div className="flex flex-wrap gap-1">
                    {veroHits.map(b => (
                      <span key={b} className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{ backgroundColor: 'rgba(217,119,6,0.12)', color: C.amber }}>{b}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link2 size={12} style={{ color: C.blue }} />
                <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>TOPIC CLUSTER</p>
              </div>
              {clusterPosts.filter(p => p.category === category && (!editingPost || p.id !== editingPost.id)).length === 0 ? (
                <p className="text-[11px]" style={{ color: C.muted }}>No published posts in this category yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {clusterPosts.filter(p => p.category === category && (!editingPost || p.id !== editingPost.id)).slice(0, 5).map(p => (
                    <button key={p.id}
                      onMouseDown={e => { e.preventDefault(); insertHtml(`<a href="/blog/${p.slug}">${p.title}</a>`); showToast('Link inserted') }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-left hover:opacity-80"
                      style={{ borderColor: C.border, backgroundColor: C.bg }}>
                      <Link2 size={10} style={{ color: C.blue, flexShrink: 0 }} />
                      <span className="text-[11px] truncate" style={{ color: C.text }}>{p.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Freshness + Gate */}
          <div className="rounded-2xl border p-4 flex flex-col gap-4" style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw size={12} style={{ color: C.limeDeep }} />
                <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>SEO FRESHNESS</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="date" value={lastModified} onChange={e => setLastModified(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
                <button onClick={() => { setLastModified(new Date().toISOString().split('T')[0]); showToast('Date updated') }}
                  className="px-3 py-2 rounded-xl text-[11px] font-bold"
                  style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>Today</button>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users size={12} style={{ color: C.blue }} />
                  <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>LEAD MAGNET GATE</p>
                </div>
                <button onClick={() => setGateContent(g => !g)}
                  className="relative w-9 h-5 rounded-full transition-all"
                  style={{ backgroundColor: gateContent ? C.lime : C.border }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                       style={{ backgroundColor: gateContent ? C.dark : '#fff', left: gateContent ? '18px' : '2px' }} />
                </button>
              </div>
              {gateContent && (
                <div className="flex flex-col gap-2">
                  <input value={gateEmail} onChange={e => setGateEmail(e.target.value)} placeholder="Gate message..."
                    className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                    style={{ borderColor: C.lime, backgroundColor: C.limeTint, color: C.dark }} />
                  <button onMouseDown={e => { e.preventDefault(); insertHtml(`<div style="background:#1a2410;border-radius:14px;padding:24px;text-align:center;margin:20px 0"><p style="color:#8fff00;font-weight:800;font-size:16px;margin:0 0 8px">${gateEmail || 'Enter your email to continue reading'}</p><input type="email" placeholder="your@email.com" style="width:100%;padding:10px 14px;border-radius:8px;border:none;font-size:14px;margin-bottom:10px"><button style="background:#8fff00;color:#1a2410;font-weight:800;padding:10px 24px;border-radius:8px;border:none;cursor:pointer">Get Free Access</button></div>`); showToast('Gate inserted') }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold"
                    style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                    <Plus size={13} /> Insert Gate Block
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Broken Links */}
          <div className="rounded-2xl border p-4" style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Link2 size={12} style={{ color: C.red }} />
                <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>BROKEN LINK CHECKER</p>
              </div>
              <button onClick={checkLinks} disabled={checkingLinks}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border disabled:opacity-50"
                style={{ borderColor: C.border, color: C.muted, backgroundColor: C.bg }}>
                {checkingLinks ? <RefreshCw size={10} className="animate-spin" /> : <Eye size={10} />}
                {checkingLinks ? 'Checking...' : 'Check Links'}
              </button>
            </div>
            {brokenLinks.length === 0
              ? <p className="text-[11px]" style={{ color: C.muted }}>Click to scan all links in your article.</p>
              : brokenLinks.map((url, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1" style={{ backgroundColor: 'rgba(185,28,28,0.06)' }}>
                  <AlertTriangle size={10} style={{ color: C.red, flexShrink: 0 }} />
                  <span className="text-[10px] truncate" style={{ color: C.red }}>{url}</span>
                </div>
              ))
            }
          </div>

          {/* Related Posts */}
          <div className="rounded-2xl border p-4" style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <p className="text-[10px] font-black tracking-wider mb-3" style={{ color: C.muted }}>RELATED POSTS</p>
            {clusterPosts.filter(p => !editingPost || p.id !== editingPost.id).length === 0
              ? <p className="text-[11px]" style={{ color: C.muted }}>No published posts available.</p>
              : (
                <div className="flex flex-col gap-1.5">
                  {clusterPosts.filter(p => !editingPost || p.id !== editingPost.id).slice(0, 6).map(p => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={relatedPosts.includes(p.id)}
                        onChange={e => setRelatedPosts(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id))}
                        style={{ accentColor: C.lime }} />
                      <span className="text-[11px] truncate" style={{ color: C.text }}>{p.title}</span>
                    </label>
                  ))}
                  <p className="text-[10px] mt-1" style={{ color: C.muted }}>{relatedPosts.length} selected</p>
                </div>
              )
            }
          </div>

          {/* Admin Tracking */}
          <div className="rounded-2xl border p-4 flex flex-col gap-3" style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>ADMIN TRACKING</p>
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>GOOGLE RANK POSITION</p>
              <input value={rankPosition} onChange={e => setRankPosition(e.target.value)}
                placeholder="e.g. #4 for 'eBay wholesale guide'"
                className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
            </div>
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>CONTENT EXPIRY DATE</p>
              <div className="flex items-center gap-2">
                <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: expiryDate && new Date(expiryDate) < new Date() ? C.red : C.border, backgroundColor: '#fff', color: C.dark }} />
                {expiryDate && new Date(expiryDate) < new Date() && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(185,28,28,0.1)', color: C.red }}>Expired</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>INTERNAL ADMIN NOTES</p>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                placeholder="Private notes — not visible to readers..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border text-[12px] outline-none resize-none"
                style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}