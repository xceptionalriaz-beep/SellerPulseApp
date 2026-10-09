// app/blog/[slug]/page.tsx
// Riazify Blog Post Detail View — v2.0

import { createClient } from '@/lib/supabase'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  Package, Clock, Eye, Calendar, ArrowRight, ArrowLeft,
  Share2, CheckCircle2, ChevronRight
} from 'lucide-react'

// ── Riazify Color Role Tokens (v2.0) ──────────────────────────
const C = {
  primary: '#7530fb',
  primaryHover: '#6020e0',
  primaryLight: '#f3eeff',
  accent: '#b8fa33',
  accentHover: '#a3e635',
  dark: '#1e1535',
  darkHover: '#2d1f4e',
  darkCard: '#271c42',
  border: '#ede9fe',
  borderDark: '#2d1f4e',
  borderInput: '#e5e0f5',
  bg: '#f8f7ff',
  surface: '#ffffff',
  text: '#1f1d2e',
  textDark: '#1e1535',
  muted: '#6b7280',
  textLight: '#a89cc8',
}

async function getPost(slug: string) {
  const supabase = createClient()
  const { data } = await (supabase.from('blog_posts') as any)
    .select('*')
    .eq('slug', slug)
    .eq('status', 'live')
    .single()
  return data
}

async function getRelatedPosts(category: string, currentId: string) {
  const supabase = createClient()
  const { data } = await (supabase.from('blog_posts') as any)
    .select('id,title,slug,featured_image_url,category,word_count,created_at,excerpt,meta_description')
    .eq('status', 'live')
    .eq('category', category)
    .neq('id', currentId)
    .order('views', { ascending: false })
    .limit(3)

  if ((data ?? []).length < 3) {
    const { data: more } = await (supabase.from('blog_posts') as any)
      .select('id,title,slug,featured_image_url,category,word_count,created_at,excerpt,meta_description')
      .eq('status', 'live')
      .neq('id', currentId)
      .neq('category', category)
      .order('views', { ascending: false })
      .limit(3 - (data ?? []).length)
    return [...(data ?? []), ...(more ?? [])]
  }
  return data ?? []
}

async function getPopularPosts(currentId: string) {
  const supabase = createClient()
  const { data } = await (supabase.from('blog_posts') as any)
    .select('id,title,slug,word_count,views')
    .eq('status', 'live')
    .neq('id', currentId)
    .order('views', { ascending: false })
    .limit(4)
  return data ?? []
}

export const revalidate = 0

async function getPrevNext(slug: string) {
  const supabase = createClient()
  const { data: current } = await (supabase.from('blog_posts') as any)
    .select('created_at')
    .eq('slug', slug)
    .single()

  if (!current) return { prev: null, next: null }

  const [{ data: prev }, { data: next }] = await Promise.all([
    (supabase.from('blog_posts') as any)
      .select('title,slug')
      .eq('status', 'live')
      .lt('created_at', current.created_at)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    (supabase.from('blog_posts') as any)
      .select('title,slug')
      .eq('status', 'live')
      .gt('created_at', current.created_at)
      .order('created_at', { ascending: true })
      .limit(1)
      .single(),
  ])
  return { prev: prev || null, next: next || null }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Post Not Found | Riazify' }
  const ogImage = post.og_image || post.featured_image_url || 'https://riazify.com/og-default.jpg'
  return {
    title: `${post.meta_title || post.title} | Riazify Blog`,
    description: post.meta_description || post.excerpt || '',
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      url: `https://riazify.com/blog/${post.slug}`,
      type: 'article',
    },
    alternates: {
      canonical: `https://riazify.com/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      images: [ogImage],
    },
  }
}

function readingTime(words: number) {
  return Math.max(1, Math.ceil((words || 500) / 200))
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function extractToc(html: string) {
  const matches = [...(html || '').matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gi)]
  return matches.map((m, i) => ({
    level: parseInt(m[1]),
    text: m[2].replace(/<[^>]+>/g, ''),
    id: `heading-${i}`
  }))
}

function injectHeadingIds(html: string): string {
  let i = 0
  let result = html.replace(/<h([23])([^>]*)>(.*?)<\/h[23]>/gi, (_, level, attrs, text) =>
    `<h${level}${attrs} id="heading-${i++}">${text}</h${level}>`)
  result = result.replace(/<a\s+([^>]*href=[^>]*)>/gi, (match, attrs) =>
    attrs.includes('target=') ? match : `<a ${attrs} target="_blank" rel="noopener noreferrer">`)
  return result
}

async function trackView(id: string) {
  try {
    const supabase = createClient()
    const { data: post } = await (supabase.from('blog_posts') as any).select('views').eq('id', id).single()
    if (post) await (supabase.from('blog_posts') as any).update({ views: (post.views ?? 0) + 1 }).eq('id', id)
  } catch { }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  trackView(post.id)

  const [related, popular, { prev, next }] = await Promise.all([
    getRelatedPosts(post.category, post.id),
    getPopularPosts(post.id),
    getPrevNext(params.slug),
  ])

  const toc = extractToc(post.body || '')
  const body = injectHeadingIds(post.body || '')
  const rt = readingTime(post.word_count)
  const postUrl = `https://riazify.com/blog/${post.slug}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description || post.excerpt || '',
    image: post.featured_image_url || '',
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Person', name: post.author_name || 'Reaz Uddin' },
    publisher: { '@type': 'Organization', name: 'Riazify', logo: { '@type': 'ImageObject', url: 'https://riazify.com/logo.png' } },
  }

  // Client-side interactions for reading progress, back to top, and link copying
  const clientScript = `
    function initPostPage() {
      var bar = document.getElementById('rp-bar');
      var backTop = document.getElementById('back-top');
      var copyBtn = document.getElementById('copy-link');
      var nlSubmit = document.getElementById('nl-submit');
      var nlMsg = document.getElementById('nl-msg');

      window.addEventListener('scroll', function() {
        var el = document.documentElement;
        var top = el.scrollTop || document.body.scrollTop;
        var h = el.scrollHeight - el.clientHeight;
        if(bar) bar.style.width = (h > 0 ? Math.min((top/h)*100, 100) : 0) + '%';
        if(backTop) backTop.style.display = top > 500 ? 'flex' : 'none';
      }, { passive: true });

      if(backTop) {
        backTop.addEventListener('click', function() {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      if(copyBtn) {
        copyBtn.addEventListener('click', function() {
          var url = window.location.href;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function() {
              copyBtn.textContent = 'Copied! ✓';
              copyBtn.style.color = '#7530fb';
              setTimeout(function() { copyBtn.textContent = 'Copy Link'; copyBtn.style.color = ''; }, 2000);
            });
          }
        });
      }

      if(nlSubmit) {
        nlSubmit.addEventListener('click', function() {
          var emailEl = document.getElementById('nl-email');
          if(!emailEl) return;
          var email = emailEl.value.trim();
          if(!email || !email.includes('@')) {
            if(nlMsg) { nlMsg.textContent = 'Please enter a valid email address'; nlMsg.style.color = '#dc2626'; }
            return;
          }
          nlSubmit.textContent = 'Subscribing...';
          fetch('/api/blog/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, source: 'blog-post' })
          }).then(function(r) { return r.json(); })
            .then(function(d) {
              if(d.success && !d.alreadySubscribed) {
                if(nlMsg) { nlMsg.textContent = '✓ Subscribed to Riazify Weekly.'; nlMsg.style.color = '#b8fa33'; }
                nlSubmit.textContent = 'Subscribed ✓';
              } else if(d.alreadySubscribed) {
                if(nlMsg) { nlMsg.textContent = 'You are already subscribed.'; nlMsg.style.color = '#b8fa33'; }
                nlSubmit.textContent = 'Subscribed';
              } else {
                if(nlMsg) { nlMsg.textContent = 'Error — please try again.'; nlMsg.style.color = '#dc2626'; }
                nlSubmit.textContent = 'Subscribe →';
              }
            }).catch(function() {
              if(nlMsg) { nlMsg.textContent = 'Error — please try again.'; nlMsg.style.color = '#dc2626'; }
              nlSubmit.textContent = 'Subscribe →';
            });
        });
      }
    }
    initPostPage();
  `

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg, minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script dangerouslySetInnerHTML={{ __html: clientScript }} />

      {/* Reading Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
        <div id="rp-bar" style={{ width: '0%', height: '100%', backgroundColor: C.primary, transition: 'width 75ms' }} />
      </div>

      {/* Back to Top Trigger */}
      <button
        id="back-top"
        aria-label="Back to top"
        className="fixed bottom-8 right-6 z-50 w-10 h-10 rounded-xl items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer border"
        style={{ display: 'none', backgroundColor: C.dark, borderColor: C.borderDark }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      <Navbar />

      <div style={{ paddingTop: '72px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 items-start">

            {/* ── Main Article Body ── */}
            <article className="min-w-0">

              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 mb-4 text-[12px] font-medium" style={{ color: C.muted }}>
                <Link href="/blog" className="hover:text-[#7530fb] transition-colors">
                  Blog
                </Link>
                <span>›</span>
                <span className="truncate max-w-xs" style={{ color: C.textDark }}>
                  {post.category || 'Seller Guides'}
                </span>
              </nav>

              {/* Category & Meta Badges */}
              <div className="flex items-center gap-3 mb-4 flex-wrap text-[12px]">
                <span
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-black font-syne uppercase"
                  style={{ backgroundColor: C.primaryLight, color: C.primary }}
                >
                  {post.category}
                </span>
                <span className="font-medium" style={{ color: C.muted }}>{formatDate(post.created_at)}</span>
                <span style={{ color: C.border }}>•</span>
                <span className="font-medium" style={{ color: C.muted }}>{rt} min read</span>
                {post.views > 0 && (
                  <>
                    <span style={{ color: C.border }}>•</span>
                    <span className="font-medium flex items-center gap-1" style={{ color: C.muted }}>
                      <Eye size={12} />
                      {post.views.toLocaleString()} views
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-[28px] md:text-[38px] font-black font-syne leading-tight mb-4 tracking-tight" style={{ color: C.textDark }}>
                {post.title}
              </h1>

              {/* Excerpt Lead */}
              {(post.excerpt || post.meta_description) && (
                <p className="text-[15px] leading-relaxed mb-6 pb-6 border-b font-medium" style={{ color: C.muted, borderColor: C.border }}>
                  {post.excerpt || post.meta_description}
                </p>
              )}

              {/* Author & Header Metadata Box */}
              <div
                className="flex items-center justify-between gap-4 mb-8 p-4 rounded-xl border bg-white shadow-xs flex-wrap"
                style={{ borderColor: C.border }}
              >
                <div className="flex items-center gap-3">
                  {post.author_image ? (
                    <img
                      src={post.author_image}
                      alt={post.author_name || 'Author'}
                      className="w-10 h-10 rounded-lg object-cover border"
                      style={{ borderColor: C.border }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-black font-syne text-[14px]"
                      style={{ backgroundColor: C.primary, color: '#ffffff' }}
                    >
                      {(post.author_name || 'R').charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-[13px] font-bold font-syne" style={{ color: C.textDark }}>
                      {post.author_name || 'Reaz Uddin'}
                    </p>
                    <p className="text-[11.5px]" style={{ color: C.muted }}>
                      {post.author_bio || 'eBay seller & founder of Riazify'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-bold font-syne"
                  style={{ backgroundColor: C.bg, borderColor: C.border, color: C.primary }}>
                  <Clock size={13} />
                  <span>{rt} min read</span>
                </div>
              </div>

              {/* Featured Cover Image */}
              {post.featured_image_url && (
                <div className="rounded-2xl overflow-hidden mb-8 border shadow-xs" style={{ borderColor: C.border }}>
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full object-cover"
                    style={{ maxHeight: 440 }}
                  />
                </div>
              )}

              {/* Mobile Table of Contents */}
              {toc.length >= 3 && (
                <div className="lg:hidden mb-8 p-4 rounded-xl border bg-white" style={{ borderColor: C.border }}>
                  <p className="text-[11px] font-black font-syne uppercase tracking-wider mb-2.5" style={{ color: C.primary }}>
                    TABLE OF CONTENTS
                  </p>
                  <ol className="space-y-1.5">
                    {toc.map((item, i) => (
                      <li key={i} style={{ paddingLeft: item.level === 3 ? 14 : 0 }}>
                        <a href={`#${item.id}`} className="text-[12.5px] font-medium hover:underline block" style={{ color: C.textDark }}>
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Article Content Render */}
              <div className="prose-blog" dangerouslySetInnerHTML={{ __html: body }} />

              {/* Social Sharing Bar */}
              <div className="mt-10 pt-6 border-t flex items-center justify-between gap-4 flex-wrap" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase font-syne" style={{ color: C.muted }}>
                    SHARE GUIDE:
                  </span>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-colors hover:bg-black hover:text-white"
                    style={{ borderColor: C.border, color: C.textDark, backgroundColor: '#ffffff' }}
                  >
                    X (Twitter)
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-colors hover:bg-[#0077b5] hover:text-white"
                    style={{ borderColor: C.border, color: C.textDark, backgroundColor: '#ffffff' }}
                  >
                    LinkedIn
                  </a>
                  <button
                    id="copy-link"
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-colors hover:bg-[#f8f7ff] cursor-pointer"
                    style={{ borderColor: C.border, color: C.textDark, backgroundColor: '#ffffff' }}
                  >
                    Copy Link
                  </button>
                </div>

                <Link href="/blog" className="text-[12.5px] font-bold hover:underline font-syne" style={{ color: C.primary }}>
                  ← Back to All Guides
                </Link>
              </div>

              {/* Author Bio Box */}
              {post.author_bio && (
                <div className="mt-8 p-6 rounded-2xl border bg-white shadow-xs" style={{ borderColor: C.border }}>
                  <div className="flex items-start gap-4">
                    {post.author_image ? (
                      <img
                        src={post.author_image}
                        alt={post.author_name || 'Author'}
                        className="w-12 h-12 rounded-xl object-cover border shrink-0"
                        style={{ borderColor: C.border }}
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black font-syne text-[16px] shrink-0"
                        style={{ backgroundColor: C.primaryLight, color: C.primary }}
                      >
                        {(post.author_name || 'R').charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-[10.5px] font-black uppercase font-syne tracking-wider mb-0.5" style={{ color: C.primary }}>
                        PUBLISHED BY
                      </p>
                      <p className="text-[15px] font-bold font-syne mb-1" style={{ color: C.textDark }}>
                        {post.author_name || 'Reaz Uddin'}
                      </p>
                      <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>
                        {post.author_bio}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Posts Grid */}
              {related.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.primary }} />
                    <p className="text-[11px] font-black font-syne uppercase tracking-wider" style={{ color: C.primary }}>
                      RELATED ARTICLES
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {related.map((r: any) => (
                      <Link
                        key={r.id}
                        href={`/blog/${r.slug}`}
                        className="group p-4 rounded-xl border bg-white hover:border-[#7530fb] transition-all shadow-xs"
                        style={{ borderColor: C.border }}
                      >
                        {r.featured_image_url && (
                          <div className="rounded-lg overflow-hidden mb-3 h-28 bg-[#1e1535]">
                            <img
                              src={r.featured_image_url}
                              alt={r.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md font-syne uppercase"
                          style={{ backgroundColor: C.primaryLight, color: C.primary }}
                        >
                          {r.category}
                        </span>
                        <p className="text-[13px] font-bold font-syne mt-2 line-clamp-2 group-hover:text-[#7530fb] transition-colors" style={{ color: C.textDark }}>
                          {r.title}
                        </p>
                        <p className="text-[11px] mt-1" style={{ color: C.muted }}>
                          {readingTime(r.word_count)} min read
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* ── Sticky Right Sidebar ── */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 flex flex-col gap-5" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>

                {/* Table of Contents */}
                {toc.length >= 3 && (
                  <div className="p-4 rounded-2xl border bg-white shadow-xs" style={{ borderColor: C.border }}>
                    <p className="text-[11px] font-black font-syne uppercase tracking-wider mb-3" style={{ color: C.primary }}>
                      TABLE OF CONTENTS
                    </p>
                    <ol className="space-y-1.5">
                      {toc.map((item, i) => (
                        <li key={i} style={{ paddingLeft: item.level === 3 ? 12 : 0 }}>
                          <a
                            href={`#${item.id}`}
                            className="text-[12px] font-medium leading-snug hover:text-[#7530fb] transition-colors block"
                            style={{ color: C.muted }}
                          >
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Sidebar Callout */}
                <div className="p-5 rounded-2xl border text-center" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
                  <p className="text-[13px] font-black font-syne text-white mb-1">Protect Your Orders</p>
                  <p className="text-[11.5px] mb-4" style={{ color: C.textLight }}>
                    Scan incoming orders against 47 fraudulent buyer risk indicators.
                  </p>
                  <Link
                    href="/auth/signup"
                    className="block w-full py-2.5 rounded-lg text-[12px] font-black font-syne transition-transform hover:scale-105"
                    style={{ backgroundColor: C.accent, color: C.dark }}
                  >
                    Start Free Trial →
                  </Link>
                </div>

                {/* Popular Posts */}
                {popular.length > 0 && (
                  <div className="rounded-2xl border bg-white p-4 shadow-xs" style={{ borderColor: C.border }}>
                    <p className="text-[11px] font-black font-syne uppercase tracking-wider mb-3" style={{ color: C.primary }}>
                      POPULAR ARTICLES
                    </p>
                    <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
                      {popular.map((p: any, i: number) => (
                        <div key={p.id} className="py-2.5 flex items-start gap-2.5">
                          <span className="text-[13px] font-black font-syne w-4 text-center shrink-0" style={{ color: C.primary }}>
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <Link
                              href={`/blog/${p.slug}`}
                              className="text-[12px] font-bold font-syne leading-snug hover:text-[#7530fb] transition-colors line-clamp-2"
                              style={{ color: C.textDark }}
                            >
                              {p.title}
                            </Link>
                            <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>
                              {readingTime(p.word_count)} min read
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article Metadata Spec Sheet */}
                <div className="p-4 rounded-2xl border bg-white shadow-xs" style={{ borderColor: C.border }}>
                  <p className="text-[11px] font-black font-syne uppercase tracking-wider mb-2.5" style={{ color: C.primary }}>
                    ARTICLE INFO
                  </p>
                  <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between">
                      <span style={{ color: C.muted }}>Published</span>
                      <span className="font-bold" style={{ color: C.textDark }}>{formatDate(post.created_at)}</span>
                    </div>
                    {post.updated_at && post.updated_at !== post.created_at && (
                      <div className="flex justify-between">
                        <span style={{ color: C.muted }}>Updated</span>
                        <span className="font-bold" style={{ color: C.textDark }}>{formatDate(post.updated_at)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span style={{ color: C.muted }}>Reading Time</span>
                      <span className="font-bold" style={{ color: C.textDark }}>{rt} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: C.muted }}>Category</span>
                      <span className="font-bold font-syne" style={{ color: C.primary }}>{post.category}</span>
                    </div>
                  </div>
                </div>

              </div>
            </aside>
          </div>

          {/* ── Prev / Next Navigation Strip ── */}
          {(prev || next) && (
            <div className="mt-12 pt-8 border-t" style={{ borderColor: C.border }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prev && (
                  <Link
                    href={`/blog/${prev.slug}`}
                    className="group p-4 rounded-xl border bg-white hover:border-[#7530fb] transition-all shadow-xs flex items-center gap-3"
                    style={{ borderColor: C.border }}
                  >
                    <ArrowLeft size={16} className="shrink-0 group-hover:-translate-x-1 transition-transform" style={{ color: C.primary }} />
                    <div className="min-w-0">
                      <span className="text-[10px] font-black font-syne uppercase tracking-wider block" style={{ color: C.muted }}>
                        PREVIOUS
                      </span>
                      <span className="text-[13px] font-bold font-syne line-clamp-1 group-hover:text-[#7530fb] transition-colors" style={{ color: C.textDark }}>
                        {prev.title}
                      </span>
                    </div>
                  </Link>
                )}
                {next && (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="group p-4 rounded-xl border bg-white hover:border-[#7530fb] transition-all shadow-xs flex items-center justify-between gap-3 text-right"
                    style={{ borderColor: C.border }}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black font-syne uppercase tracking-wider block" style={{ color: C.muted }}>
                        NEXT ARTICLE
                      </span>
                      <span className="text-[13px] font-bold font-syne line-clamp-1 group-hover:text-[#7530fb] transition-colors" style={{ color: C.textDark }}>
                        {next.title}
                      </span>
                    </div>
                    <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: C.primary }} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Newsletter Footer Card ── */}
        <section className="border-t bg-white py-14" style={{ borderColor: C.border }}>
          <div className="max-w-3xl mx-auto px-6">
            <div className="rounded-2xl p-8 text-center border shadow-lg" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-3 text-[11px] font-bold font-syne uppercase"
                style={{ backgroundColor: 'rgba(117,48,251,0.25)', color: C.accent }}>
                <CheckCircle2 size={13} />
                <span>FREE SELLER NEWSLETTER</span>
              </div>
              <h2 className="text-[20px] md:text-[24px] font-black font-syne text-white mb-2">
                Subscribe to Riazify Blog Intelligence
              </h2>
              <p className="text-[13px] mb-5 max-w-md mx-auto" style={{ color: C.textLight }}>
                Get notified when new fee updates, VeRO alerts, and listing strategies go live.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  id="nl-email"
                  placeholder="seller@store.com"
                  className="flex-1 h-11 px-3.5 rounded-lg border text-[13px] outline-none"
                  style={{ backgroundColor: C.darkCard, borderColor: C.borderDark, color: '#ffffff' }}
                />
                <button
                  id="nl-submit"
                  className="h-11 px-5 rounded-lg text-[13px] font-black font-syne transition-transform hover:scale-105 shrink-0 cursor-pointer shadow-sm"
                  style={{ backgroundColor: C.accent, color: C.dark }}
                >
                  Subscribe →
                </button>
              </div>
              <p id="nl-msg" className="text-[12px] mt-2 font-medium" style={{ minHeight: 18 }} />
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Prose CSS for Article Content */}
      <style dangerouslySetInnerHTML={{
        __html: [
          '.prose-blog { color: #1f1d2e; font-size: 15.5px; line-height: 1.8; }',
          '.prose-blog h1 { font-family: "Syne", sans-serif; font-size: 26px; font-weight: 900; margin: 32px 0 14px; color: #1e1535; }',
          '.prose-blog h2 { font-family: "Syne", sans-serif; font-size: 21px; font-weight: 800; margin: 36px 0 14px; color: #1e1535; border-bottom: 1px solid #ede9fe; padding-bottom: 6px; }',
          '.prose-blog h3 { font-family: "Syne", sans-serif; font-size: 17px; font-weight: 700; margin: 26px 0 10px; color: #1e1535; }',
          '.prose-blog p { margin: 0 0 16px; }',
          '.prose-blog a { color: #7530fb; text-decoration: underline; font-weight: 600; }',
          '.prose-blog a:hover { opacity: 0.8; }',
          '.prose-blog ul { list-style: disc; padding-left: 22px; margin: 14px 0; }',
          '.prose-blog ol { list-style: decimal; padding-left: 22px; margin: 14px 0; }',
          '.prose-blog li { margin: 6px 0; }',
          '.prose-blog blockquote { border-left: 3.5px solid #7530fb; padding: 10px 18px; margin: 20px 0; background: #f3eeff; border-radius: 0 8px 8px 0; color: #1e1535; font-style: italic; }',
          '.prose-blog pre { background: #1e1535; color: #b8fa33; padding: 18px; border-radius: 12px; overflow-x: auto; font-size: 13.5px; margin: 20px 0; border: 1px solid #2d1f4e; }',
          '.prose-blog code { background: #f3eeff; color: #7530fb; padding: 2px 6px; border-radius: 4px; font-size: 13.5px; font-weight: 600; }',
          '.prose-blog pre code { background: transparent; color: #b8fa33; padding: 0; }',
          '.prose-blog img { max-width: 100%; border-radius: 12px; margin: 20px 0; border: 1px solid #ede9fe; }',
          '.prose-blog table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13.5px; }',
          '.prose-blog th { background: #1e1535; color: #ffffff; padding: 9px 12px; text-align: left; font-size: 11px; font-weight: 800; font-family: "Syne", sans-serif; }',
          '.prose-blog td { border-bottom: 1px solid #ede9fe; padding: 9px 12px; }',
          '.prose-blog tr:nth-child(even) td { background: #f8f7ff; }',
          '.prose-blog hr { border: none; border-top: 1px solid #ede9fe; margin: 28px 0; }',
        ].join(' ')
      }} />
    </div>
  )
}
