// app/blog/page.tsx
// Riazify Blog & Seller Intelligence Guides — v2.0

import { createClient } from '@/lib/supabase'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Package, FileText, Eye, Star, Search, ArrowRight, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog — eBay Selling Strategies, Margins & Guides | Riazify',
  description: 'Expert guides on eBay order protection, Cassini title optimization, wholesale sourcing, fee calculation and marketplace risk prevention.',
  openGraph: {
    title: 'Riazify Blog — eBay Seller Resources',
    description: 'Practical tactics and data-driven guides to grow and protect your eBay business.',
    url: 'https://riazify.com/blog',
  },
}

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

function rt(words: number) {
  return Math.max(1, Math.ceil((words || 400) / 200))
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function getPosts() {
  const supabase = createClient()
  const { data } = await (supabase.from('blog_posts') as any)
    .select('id,title,slug,meta_description,excerpt,category,featured_image_url,word_count,created_at,views,is_featured')
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as any[]
}

export const revalidate = 0 // Dynamic data fetch

// ── Clean Post Card Component ──────────────────────────────────
function PostCard({ post, size = 'normal' }: { post: any; size?: 'featured' | 'normal' | 'small' }) {
  const mins = rt(post.word_count)
  const excerpt = post.excerpt || post.meta_description || ''

  if (size === 'featured') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group grid md:grid-cols-2 rounded-2xl overflow-hidden border bg-white shadow-xs hover:border-[#7530fb] transition-all"
        style={{ borderColor: C.border }}
      >
        <div className="relative h-64 md:h-full min-h-[240px] overflow-hidden" style={{ backgroundColor: C.dark }}>
          {post.featured_image_url ? (
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: C.darkCard }}>
              <Package size={52} style={{ color: C.accent }} />
            </div>
          )}
          <span
            className="absolute top-3.5 left-3.5 px-3 py-1 rounded-md text-[11px] font-black font-syne uppercase"
            style={{ backgroundColor: C.accent, color: C.dark }}
          >
            {post.category}
          </span>
          <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-black/60 text-white backdrop-blur-xs">
              {mins} min read
            </span>
            {post.views > 0 && (
              <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                <Eye size={11} />
                {post.views}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-center">
          <span className="text-[11.5px] font-semibold mb-2" style={{ color: C.muted }}>
            {fmtDate(post.created_at)}
          </span>
          <h2 className="text-[20px] md:text-[24px] font-black font-syne leading-tight mb-3 group-hover:text-[#7530fb] transition-colors" style={{ color: C.textDark }}>
            {post.title}
          </h2>
          {excerpt && (
            <p className="text-[13.5px] leading-relaxed mb-6 line-clamp-3" style={{ color: C.muted }}>
              {excerpt}
            </p>
          )}
          <div className="flex items-center gap-1.5 font-bold font-syne text-[13px] mt-auto" style={{ color: C.primary }}>
            <span>Read Article</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    )
  }

  if (size === 'small') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex items-center gap-3.5 p-3 rounded-xl border bg-white hover:border-[#7530fb] transition-colors"
        style={{ borderColor: C.border }}
      >
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: C.dark }}>
          {post.featured_image_url ? (
            <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={22} style={{ color: C.accent }} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-bold font-syne leading-snug line-clamp-2 group-hover:text-[#7530fb] transition-colors" style={{ color: C.textDark }}>
            {post.title}
          </p>
          <p className="text-[10.5px] mt-1 font-medium" style={{ color: C.muted }}>
            {mins} min read
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border bg-white shadow-xs hover:border-[#7530fb] hover:-translate-y-0.5 transition-all"
      style={{ borderColor: C.border }}
    >
      <div className="relative h-44 overflow-hidden" style={{ backgroundColor: C.dark }}>
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: C.darkCard }}>
            <Package size={34} style={{ color: C.accent }} />
          </div>
        )}
        {post.category && (
          <span
            className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-black font-syne uppercase"
            style={{ backgroundColor: C.accent, color: C.dark }}
          >
            {post.category}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 text-[11px] font-medium" style={{ color: C.muted }}>
          <span>{fmtDate(post.created_at)}</span>
          <span>•</span>
          <span>{mins} min read</span>
        </div>
        <h3 className="text-[14.5px] font-black font-syne leading-snug mb-2 group-hover:text-[#7530fb] transition-colors line-clamp-2" style={{ color: C.textDark }}>
          {post.title}
        </h3>
        {excerpt && (
          <p className="text-[12.5px] leading-relaxed line-clamp-2 flex-1 mb-3" style={{ color: C.muted }}>
            {excerpt}
          </p>
        )}
        <div className="flex items-center gap-1 font-bold font-syne text-[12px] mt-auto" style={{ color: C.primary }}>
          <span>Read more</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

// ── Main Page Layout ───────────────────────────────────────────
export default async function BlogPage({ searchParams }: { searchParams: { q?: string } }) {
  const searchQ = searchParams.q?.toLowerCase().trim() || ''
  const allPosts = await getPosts()
  const posts = searchQ
    ? allPosts.filter((p: any) =>
      p.title?.toLowerCase().includes(searchQ) ||
      p.excerpt?.toLowerCase().includes(searchQ) ||
      p.meta_description?.toLowerCase().includes(searchQ) ||
      p.category?.toLowerCase().includes(searchQ) ||
      p.author_name?.toLowerCase().includes(searchQ)
    )
    : allPosts

  const featuredPosts = posts.filter((p: any) => p.is_featured).slice(0, 2)
  const featured = featuredPosts[0] || posts[0]
  const featured2 = featuredPosts[1] || posts[1]
  const popular = [...posts].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 4)

  const categories = Array.from(new Set(posts.map((p: any) => p.category).filter(Boolean))) as string[]

  const byCat: Record<string, any[]> = {}
  for (const p of posts) {
    if (!byCat[p.category]) byCat[p.category] = []
    byCat[p.category].push(p)
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '72px' }}>

        {/* ── 1. Hero Header ── */}
        <header className="border-b" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-4 text-[11px] font-black uppercase tracking-wider font-syne"
                  style={{ backgroundColor: 'rgba(117,48,251,0.25)', color: C.accent }}>
                  <span>SELLER INTELLIGENCE KNOWLEDGE BASE</span>
                </div>
                <h1 className="text-[36px] md:text-[48px] font-black leading-tight font-syne text-white tracking-tight">
                  eBay Seller <span style={{ color: C.accent }}>Resources</span>
                </h1>
                <p className="text-[15px] leading-relaxed mt-2" style={{ color: C.textLight }}>
                  Actionable guides on risk defense, Cassini listing SEO, fee audits, and margin optimization.
                </p>
              </div>

              {/* Quick Metric Badges */}
              <div className="flex items-center gap-6 sm:gap-8 pt-4 md:pt-0 border-t md:border-t-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-center">
                  <p className="text-[32px] md:text-[36px] font-black font-syne text-white leading-none mb-1">{posts.length}</p>
                  <p className="text-[12px] font-bold font-syne" style={{ color: C.accent }}>Articles</p>
                  <p className="text-[10px]" style={{ color: C.textLight }}>Live guides</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[32px] md:text-[36px] font-black font-syne text-white leading-none mb-1">{categories.length}</p>
                  <p className="text-[12px] font-bold font-syne" style={{ color: C.accent }}>Categories</p>
                  <p className="text-[10px]" style={{ color: C.textLight }}>Specialized topics</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[32px] md:text-[36px] font-black font-syne leading-none mb-1" style={{ color: C.accent }}>100%</p>
                  <p className="text-[12px] font-bold font-syne text-white">Free</p>
                  <p className="text-[10px]" style={{ color: C.textLight }}>Open access</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── 2. Content Container ── */}
        <main className="max-w-6xl mx-auto px-6 py-12">

          {/* Search Query Pill */}
          {searchQ && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border mb-6 bg-white" style={{ borderColor: C.border }}>
              <p className="text-[13px] font-bold font-syne" style={{ color: C.textDark }}>
                Showing {posts.length} result{posts.length !== 1 ? 's' : ''} for &ldquo;{searchParams.q}&rdquo;
              </p>
              <Link href="/blog" className="text-[12px] font-bold hover:underline" style={{ color: C.primary }}>
                Clear Search ✕
              </Link>
            </div>
          )}

          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl border bg-white text-center p-6" style={{ borderColor: C.border }}>
              <FileText size={44} style={{ color: C.muted }} />
              <h2 className="text-[18px] font-bold font-syne" style={{ color: C.textDark }}>No articles found</h2>
              <p className="text-[13px] max-w-sm" style={{ color: C.muted }}>Try modifying your search term or browse all seller categories.</p>
              <Link href="/blog" className="px-5 py-2.5 rounded-lg font-bold text-[13px] text-white transition-opacity hover:opacity-90 mt-2" style={{ backgroundColor: C.dark }}>
                View All Articles
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-14">

              {/* ── Featured & Sidebar Grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

                {/* Left Column: Featured & Sub-Featured */}
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.primary }} />
                      <p className="text-[11px] font-black uppercase tracking-wider font-syne" style={{ color: C.primary }}>
                        FEATURED ARTICLE
                      </p>
                    </div>
                    {featured && <PostCard post={featured} size="featured" />}
                  </div>

                  {/* Sub-featured Card */}
                  {featured2 && (
                    <Link
                      href={`/blog/${featured2.slug}`}
                      className="group grid md:grid-cols-2 rounded-2xl overflow-hidden border bg-white shadow-xs hover:border-[#7530fb] transition-all"
                      style={{ borderColor: C.border }}
                    >
                      <div className="p-6 md:p-7 flex flex-col justify-center order-2 md:order-1">
                        <div className="flex items-center gap-2 mb-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md font-bold font-syne uppercase" style={{ backgroundColor: C.primaryLight, color: C.primary }}>
                            {featured2.category}
                          </span>
                          <span style={{ color: C.muted }}>•</span>
                          <span style={{ color: C.muted }}>{rt(featured2.word_count)} min read</span>
                        </div>
                        <h2 className="text-[17px] font-black font-syne leading-snug mb-2 group-hover:text-[#7530fb] transition-colors" style={{ color: C.textDark }}>
                          {featured2.title}
                        </h2>
                        {(featured2.excerpt || featured2.meta_description) && (
                          <p className="text-[13px] leading-relaxed mb-4 line-clamp-2" style={{ color: C.muted }}>
                            {featured2.excerpt || featured2.meta_description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 font-bold font-syne text-[12px]" style={{ color: C.primary }}>
                          <span>Read Guide</span>
                          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                      <div className="relative h-48 md:h-auto overflow-hidden order-1 md:order-2" style={{ backgroundColor: C.dark }}>
                        {featured2.featured_image_url ? (
                          <img src={featured2.featured_image_url} alt={featured2.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: C.darkCard }}>
                            <Package size={40} style={{ color: C.accent }} />
                          </div>
                        )}
                      </div>
                    </Link>
                  )}

                  {/* 2x2 Recent Feed */}
                  {posts.slice(2, 6).length > 0 && (
                    <div className="rounded-2xl border bg-white overflow-hidden shadow-xs" style={{ borderColor: C.border }}>
                      <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.primary }} />
                        <p className="text-[11px] font-black uppercase tracking-wider font-syne" style={{ color: C.primary }}>
                          LATEST DISPATCHES
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: C.border }}>
                        <div className="divide-y" style={{ borderColor: C.border }}>
                          {posts.slice(2, 4).map((p: any) => (
                            <Link key={p.id} href={`/blog/${p.slug}`} className="group flex items-center gap-3 p-4 hover:bg-[#f8f7ff] transition-colors">
                              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border" style={{ backgroundColor: C.dark, borderColor: C.border }}>
                                {p.featured_image_url ? (
                                  <img src={p.featured_image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Package size={16} style={{ color: C.accent }} /></div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[12px] font-bold font-syne line-clamp-2 group-hover:text-[#7530fb] transition-colors" style={{ color: C.textDark }}>
                                  {p.title}
                                </p>
                                <span className="text-[10.5px] mt-0.5 block" style={{ color: C.muted }}>{rt(p.word_count)} min read</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="divide-y" style={{ borderColor: C.border }}>
                          {posts.slice(4, 6).map((p: any) => (
                            <Link key={p.id} href={`/blog/${p.slug}`} className="group flex items-center gap-3 p-4 hover:bg-[#f8f7ff] transition-colors">
                              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border" style={{ backgroundColor: C.dark, borderColor: C.border }}>
                                {p.featured_image_url ? (
                                  <img src={p.featured_image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Package size={16} style={{ color: C.accent }} /></div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[12px] font-bold font-syne line-clamp-2 group-hover:text-[#7530fb] transition-colors" style={{ color: C.textDark }}>
                                  {p.title}
                                </p>
                                <span className="text-[10.5px] mt-0.5 block" style={{ color: C.muted }}>{rt(p.word_count)} min read</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Search, Categories & Trending */}
                <aside className="flex flex-col gap-5">
                  {/* Search Bar */}
                  <div className="rounded-xl border bg-white p-1.5 shadow-xs" style={{ borderColor: C.borderInput }}>
                    <form action="/blog" method="get" className="flex items-center gap-2 px-2.5">
                      <Search size={14} style={{ color: C.muted }} />
                      <input
                        type="text"
                        name="q"
                        placeholder="Search seller guides..."
                        className="flex-1 text-[12.5px] bg-transparent outline-none py-1.5"
                        style={{ color: C.textDark }}
                      />
                      <button
                        type="submit"
                        className="w-7 h-7 flex items-center justify-center rounded-lg font-bold transition-opacity hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: C.primary, color: '#ffffff' }}
                      >
                        <ArrowRight size={13} />
                      </button>
                    </form>
                  </div>

                  {/* Categories List */}
                  <div className="rounded-2xl border bg-white p-4 shadow-xs" style={{ borderColor: C.border }}>
                    <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-3" style={{ color: C.primary }}>
                      CATEGORIES
                    </p>
                    <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
                      {categories.map((cat) => (
                        <div key={cat} className="flex items-center justify-between py-2 text-[12.5px]">
                          <span className="font-semibold" style={{ color: C.textDark }}>{cat}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: C.primaryLight, color: C.primary }}>
                            {byCat[cat]?.length ?? 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Most Read Articles */}
                  <div className="rounded-2xl border bg-white p-4 shadow-xs" style={{ borderColor: C.border }}>
                    <p className="text-[11px] font-black uppercase tracking-wider font-syne mb-3" style={{ color: C.primary }}>
                      TRENDING TOPICS
                    </p>
                    <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
                      {popular.map((p, i) => (
                        <div key={p.id} className="py-2.5 flex items-start gap-2.5">
                          <span className="text-[13px] font-black font-syne w-4 text-center shrink-0" style={{ color: C.primary }}>
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <Link href={`/blog/${p.slug}`} className="text-[12px] font-bold font-syne leading-snug hover:text-[#7530fb] transition-colors line-clamp-2" style={{ color: C.textDark }}>
                              {p.title}
                            </Link>
                            <span className="text-[10px] mt-0.5 block" style={{ color: C.muted }}>{rt(p.word_count)} min read</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Sidebar Promo Box */}
                  <div className="rounded-2xl p-5 border text-center" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
                    <p className="text-[13px] font-black font-syne text-white mb-1">Audit Your Orders</p>
                    <p className="text-[11.5px] mb-4" style={{ color: C.textLight }}>Prevent fraudulent buyer returns and track true margins.</p>
                    <Link
                      href="/auth/signup"
                      className="block w-full py-2.5 rounded-lg text-[12px] font-black font-syne transition-transform hover:scale-105"
                      style={{ backgroundColor: C.accent, color: C.dark }}
                    >
                      Start Free Trial →
                    </Link>
                  </div>
                </aside>
              </div>

              {/* ── 3. Category Article Shelves ── */}
              {categories.map((catName) => {
                const catPosts = byCat[catName] ?? []
                if (catPosts.length === 0) return null
                return (
                  <section key={catName} className="pt-4">
                    <div className="flex items-center justify-between pb-3 border-b mb-6" style={{ borderColor: C.border }}>
                      <div>
                        <h2 className="text-[18px] font-black font-syne" style={{ color: C.textDark }}>{catName}</h2>
                        <p className="text-[11px]" style={{ color: C.muted }}>{catPosts.length} published guides</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {catPosts.map((p: any) => (
                        <PostCard key={p.id} post={p} />
                      ))}
                    </div>
                  </section>
                )
              })}

            </div>
          )}
        </main>

        {/* ── 4. Newsletter & Footer CTA ── */}
        <section className="border-t bg-white py-16" style={{ borderColor: C.border }}>
          <div className="max-w-3xl mx-auto px-6">
            <div className="rounded-2xl p-8 md:p-10 text-center border shadow-xl" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-3 text-[11px] font-bold font-syne uppercase"
                style={{ backgroundColor: 'rgba(117,48,251,0.25)', color: C.accent }}>
                <CheckCircle2 size={13} />
                <span>WEEKLY SELLER DISPATCH</span>
              </div>
              <h2 className="text-[22px] md:text-[26px] font-black font-syne text-white mb-2">
                Subscribe to Riazify Intelligence
              </h2>
              <p className="text-[13px] mb-6 max-w-md mx-auto" style={{ color: C.textLight }}>
                Get notified when new fee updates, VeRO policies, and marketplace research guides drop.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  id="blog-nl-email"
                  placeholder="seller@store.com"
                  className="flex-1 h-11 px-3.5 rounded-lg border text-[13px] outline-none transition-colors"
                  style={{ backgroundColor: C.darkCard, borderColor: C.borderDark, color: '#ffffff' }}
                />
                <button
                  id="blog-nl-submit"
                  className="h-11 px-5 rounded-lg text-[13px] font-black font-syne transition-transform hover:scale-105 shrink-0 cursor-pointer shadow-sm"
                  style={{ backgroundColor: C.accent, color: C.dark }}
                >
                  Subscribe →
                </button>
              </div>
              <p id="blog-nl-msg" className="text-[12px] mt-2 font-medium" style={{ minHeight: 18 }} />
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
