'use client'
// components/admin/settings-tabs/BlogTab.tsx

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  BookOpen, Globe, Eye, Plus, Edit2, Trash2,
  RefreshCw, Check, X, AlertTriangle, CheckCircle,
  Users,
} from 'lucide-react'

const C = {
  lime:     '#8fff00', limeDeep: '#4a8f00', limeTint: '#f4ffe6',
  dark:     '#0a0d08', text:     '#1a2410', muted:    '#8a9e78',
  border:   '#e8ede2', surface:  '#ffffff', bg:       '#f7f9f5',
  red:      '#b91c1c', amber:    '#d97706', green:    '#16a34a',
  blue:     '#1d4ed8',
}

const CATEGORIES = ['eBay Basics', 'Arbitrage', 'Wholesale', 'Riazify Tutorials', 'Product Research']

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;margin:16px 0 8px">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:20px;font-weight:700;margin:20px 0 10px">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:24px;font-weight:700;margin:24px 0 12px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,    '<em>$1</em>')
    .replace(/`(.+?)`/g,      '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px">$1</code>')
    .replace(/^> (.+)$/gm,    '<blockquote style="border-left:3px solid #8fff00;padding-left:12px;margin:12px 0;color:#8a9e78">$1</blockquote>')
    .replace(/^- (.+)$/gm,    '<li style="margin:4px 0 4px 20px">$1</li>')
    .replace(/\n\n/g,         '<br/><br/>')
}

export default function BlogTab() {
  const supabase = createClient()

  const [posts,       setPosts]       = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [view,        setView]        = useState<'list' | 'editor'>('list')
  const [editingPost, setEditingPost] = useState<any>(null)
  const [saving,      setSaving]      = useState(false)
  const [toast,       setToast]       = useState<{ msg: string; ok: boolean } | null>(null)
  const [filter,      setFilter]      = useState<'all' | 'draft' | 'live'>('all')
  const [uploading,   setUploading]   = useState(false)

  // Editor state
  const [title,     setTitle]     = useState('')
  const [slug,      setSlug]      = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc,  setMetaDesc]  = useState('')
  const [category,  setCategory]  = useState('eBay Basics')
  const [status,    setStatus]    = useState<'draft' | 'live'>('draft')
  const [body,      setBody]      = useState('')
  const [imgUrl,    setImgUrl]    = useState('')

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
    setCategory('eBay Basics'); setStatus('draft'); setBody(''); setImgUrl('')
    setView('editor')
  }

  function openEdit(post: any) {
    setEditingPost(post)
    setTitle(post.title ?? ''); setSlug(post.slug ?? '')
    setMetaTitle(post.meta_title ?? ''); setMetaDesc(post.meta_description ?? '')
    setCategory(post.category ?? 'eBay Basics'); setStatus(post.status ?? 'draft')
    setBody(post.body ?? ''); setImgUrl(post.featured_image_url ?? '')
    setView('editor')
  }

  async function savePost() {
    if (!title.trim() || !body.trim()) { showToast('Title and body are required', false); return }
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
        featured_image_url: imgUrl || null,
        updated_at:         new Date().toISOString(),
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
        setImgUrl(publicUrl)
        showToast('Image uploaded')
      } else { showToast('Upload failed', false) }
    } catch { showToast('Upload failed', false) }
    setUploading(false)
  }

  const totalViews   = posts.reduce((s, p) => s + (p.views ?? 0), 0)
  const totalSignups = posts.reduce((s, p) => s + (p.signups ?? 0), 0)
  const livePosts    = posts.filter(p => p.status === 'live').length
  const filtered     = filter === 'all' ? posts : posts.filter(p => p.status === filter)
  const wordCount    = body.trim().split(/\s+/).filter(Boolean).length

  // ── LIST VIEW ──────────────────────────────────────────────
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
              style={{ backgroundColor: filter === f ? C.dark : C.surface, borderColor: filter === f ? C.dark : C.border, color: filter === f ? C.lime : C.muted }}>
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
                {['TITLE', 'CATEGORY', 'VIEWS', 'SIGNUPS', 'CR%', 'STATUS', 'ACTIONS'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black tracking-wider"
                      style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post: any, i: number) => {
                const cr = post.views > 0 ? ((post.signups / post.views) * 100).toFixed(1) : '0.0'
                return (
                  <tr key={post.id}
                      style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', backgroundColor: C.surface }}>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-bold truncate max-w-[200px]" style={{ color: C.dark }}>{post.title}</p>
                      <p className="text-[10px]" style={{ color: C.muted }}>/{post.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>{post.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-bold" style={{ color: C.blue }}>{post.views ?? 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-bold" style={{ color: C.green }}>{post.signups ?? 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-bold" style={{ color: C.amber }}>{cr}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(post)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all"
                        style={{
                          backgroundColor: post.status === 'live' ? C.limeTint : C.bg,
                          borderColor:     post.status === 'live' ? 'rgba(143,255,0,0.4)' : C.border,
                          color:           post.status === 'live' ? C.limeDeep : C.muted,
                        }}>
                        {post.status === 'live' ? '● Live' : '○ Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(post)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70 border"
                          style={{ borderColor: C.border, backgroundColor: C.bg }}>
                          <Edit2 size={12} style={{ color: C.muted }} />
                        </button>
                        <button onClick={() => deletePost(post.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
                          style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
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

  // ── EDITOR VIEW ────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl"
             style={{ backgroundColor: toast.ok ? C.dark : '#FEF2F2', border: `1px solid ${toast.ok ? C.lime : '#fecaca'}` }}>
          {toast.ok ? <CheckCircle size={15} style={{ color: C.lime }} /> : <AlertTriangle size={15} style={{ color: C.red }} />}
          <p className="text-[13px] font-semibold" style={{ color: toast.ok ? C.lime : C.red }}>{toast.msg}</p>
        </div>
      )}

      {/* Editor header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setView('list')}
          className="flex items-center gap-2 text-[13px] font-bold hover:opacity-70"
          style={{ color: C.muted }}>
          <X size={16} /> Cancel
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[12px]" style={{ color: C.muted }}>{wordCount} words</span>
          <select value={status} onChange={e => setStatus(e.target.value as any)}
            className="h-9 px-3 rounded-xl border text-[12px] font-bold outline-none"
            style={{ borderColor: status === 'live' ? C.lime : C.border, backgroundColor: status === 'live' ? C.limeTint : C.surface, color: status === 'live' ? C.limeDeep : C.muted }}>
            <option value="draft">Draft</option>
            <option value="live">Live</option>
          </select>
          <button onClick={savePost} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-50"
            style={{ backgroundColor: C.lime, color: C.dark }}>
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            {status === 'live' ? 'Publish to Live Site' : 'Save Draft'}
          </button>
        </div>
      </div>

      {/* SEO Fields */}
      <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <p className="text-[11px] font-black tracking-wider mb-3" style={{ color: C.muted }}>SEO & META</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold" style={{ color: C.muted }}>META TITLE</p>
              <span className="text-[10px]" style={{ color: metaTitle.length > 60 ? C.red : C.muted }}>{metaTitle.length}/60</span>
            </div>
            <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
              placeholder="SEO title (leave blank to use post title)"
              className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
              style={{ borderColor: metaTitle.length > 60 ? C.red : C.border, backgroundColor: '#fff', color: C.dark }} />
          </div>
          <div>
            <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>URL SLUG</p>
            <input value={slug} onChange={e => setSlug(e.target.value)}
              placeholder={autoSlug(title) || 'auto-generated-from-title'}
              className="w-full h-9 px-3 rounded-xl border text-[12px] font-mono outline-none"
              style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
          </div>
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold" style={{ color: C.muted }}>META DESCRIPTION</p>
              <span className="text-[10px]" style={{ color: metaDesc.length > 160 ? C.red : C.muted }}>{metaDesc.length}/160</span>
            </div>
            <input value={metaDesc} onChange={e => setMetaDesc(e.target.value)}
              placeholder="Short description for Google search results..."
              className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
              style={{ borderColor: metaDesc.length > 160 ? C.red : C.border, backgroundColor: '#fff', color: C.dark }} />
          </div>
        </div>
      </div>

      {/* Title + Category + Image */}
      <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="col-span-2">
            <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>POST TITLE</p>
            <input value={title}
              onChange={e => { setTitle(e.target.value); if (!editingPost) setSlug(autoSlug(e.target.value)) }}
              placeholder="Write a compelling title..."
              className="w-full h-10 px-3 rounded-xl border text-[14px] font-bold outline-none"
              style={{ borderColor: title ? C.lime : C.border, backgroundColor: '#fff', color: C.dark }} />
          </div>
          <div>
            <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>CATEGORY</p>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border text-[12px] font-bold outline-none"
              style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Featured image */}
        <div>
          <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>FEATURED IMAGE</p>
          <div className="flex items-center gap-3">
            {imgUrl && (
              <img src={imgUrl} alt="featured" className="w-16 h-16 rounded-xl object-cover border"
                   style={{ borderColor: C.border }} />
            )}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer hover:opacity-70 text-[12px] font-bold"
                   style={{ borderColor: C.border, color: C.muted, backgroundColor: C.bg }}>
              {uploading ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
              {uploading ? 'Uploading...' : imgUrl ? 'Change Image' : 'Upload Image'}
              <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
            </label>
            {imgUrl && (
              <button onClick={() => setImgUrl('')}
                className="text-[11px] font-bold px-2 py-1 rounded-lg border"
                style={{ borderColor: C.border, color: C.muted }}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Split pane */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '45% 55%' }}>
        {/* Markdown editor */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b"
               style={{ backgroundColor: C.bg, borderColor: C.border }}>
            <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>MARKDOWN</p>
            <span className="text-[10px]" style={{ color: C.muted }}>{wordCount} words</span>
          </div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={`# Your heading\n\nStart writing...\n\n## Section\n\nContent here...\n\n- Bullet point\n\n**Bold** and *italic*`}
            className="w-full outline-none resize-none p-4 text-[13px] leading-relaxed"
            style={{ backgroundColor: '#fff', color: C.dark, fontFamily: 'monospace', minHeight: 500, border: 'none' }}
          />
        </div>

        {/* Live preview */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.lime }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b"
               style={{ backgroundColor: C.limeTint, borderColor: 'rgba(143,255,0,0.3)' }}>
            <p className="text-[11px] font-black tracking-wider" style={{ color: C.limeDeep }}>LIVE PREVIEW</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: status === 'live' ? C.lime : C.border, color: status === 'live' ? C.dark : C.muted }}>
              {status === 'live' ? '● Live' : '○ Draft'}
            </span>
          </div>
          <div className="p-5 overflow-y-auto text-[13px] leading-relaxed"
               style={{ minHeight: 500, backgroundColor: '#fff', color: C.dark }}
               dangerouslySetInnerHTML={{ __html: body ? renderMarkdown(body) : '<p style="color:#8a9e78">Your preview will appear here as you type...</p>' }}
          />
        </div>
      </div>
    </div>
  )
}
