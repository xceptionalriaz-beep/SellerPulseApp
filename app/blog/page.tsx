// app/blog/page.tsx
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

import { Package, FileText, Eye, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog — eBay Selling Tips, Strategies & Guides | Riazify',
  description: 'Learn how to sell smarter on eBay. Expert guides on arbitrage, wholesale, product research, profit calculation and more.',
  openGraph: {
    title: 'Riazify Blog — eBay Seller Resources',
    description: 'Expert eBay selling tips, strategies and guides to grow your business.',
    url: 'https://riazify.com/blog',
  },
}

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  limePale: '#e8ffcc',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  surface:  '#fafcf7',
  bg:       '#f7f9f5',
}

// Categories are built dynamically from actual posts in DB

function rt(words: number) { return Math.max(1, Math.ceil((words || 400) / 200)) }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }

async function getPosts() {
  const supabase = createClient()
  const { data } = await (supabase.from('blog_posts') as any)
    .select('id,title,slug,meta_description,excerpt,category,featured_image_url,word_count,created_at,views,is_featured')
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as any[]
}

export const revalidate = 0 // Always fetch fresh data

// ── Post card ──────────────────────────────────────────────────
function PostCard({ post, size = 'normal' }: { post: any; size?: 'featured' | 'normal' | 'small' }) {
  const mins = rt(post.word_count)
  const excerpt = post.excerpt || post.meta_description || ''

  if (size === 'featured') {
    return (
      <Link href={`/blog/${post.slug}`}
        className="group grid md:grid-cols-2 rounded-3xl overflow-hidden border hover:shadow-2xl transition-all duration-300"
        style={{ borderColor: C.border, backgroundColor: '#fff' }}>
        <div className="relative h-64 overflow-hidden" style={{ backgroundColor: C.dark }}>
          {post.featured_image_url
            ? <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
            : <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #2d4020 100%)` }}><Package size={64} style={{ color: C.lime }}/></div>
          }
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-black" style={{ backgroundColor: C.lime, color: C.dark }}>{post.category}</span>
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}>{mins} min read</span>
            {post.views > 0 && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}><Eye size={10} style={{ display: "inline", marginRight: 2 }}/>{post.views}</span>}
          </div>
        </div>
        <div className="p-8 flex flex-col justify-center">
          <span className="text-[11px] font-bold mb-3 block" style={{ color: C.muted }}>{fmtDate(post.created_at)}</span>
          <h2 className="text-[24px] font-black leading-tight mb-3 group-hover:text-[#4a8f00] transition-colors" style={{ color: C.dark }}>{post.title}</h2>
          {excerpt && <p className="text-[14px] leading-relaxed mb-6 line-clamp-3" style={{ color: C.muted }}>{excerpt}</p>}
          <div className="flex items-center gap-2 font-black text-[13px]" style={{ color: C.limeDeep }}>
            Read Article <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </div>
        </div>
      </Link>
    )
  }

  if (size === 'small') {
    return (
      <Link href={`/blog/${post.slug}`} className="group flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-all" style={{ backgroundColor: C.bg }}>
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: C.dark }}>
          {post.featured_image_url
            ? <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center"><Package size={28} style={{ color: C.lime }}/></div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-black leading-snug line-clamp-2 group-hover:text-[#4a8f00] transition-colors" style={{ color: C.dark }}>{post.title}</p>
          <p className="text-[10px] mt-1" style={{ color: C.muted }}>{mins} min read</p>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      style={{ borderColor: C.border, backgroundColor: '#fff' }}>
      <div className="relative h-44 overflow-hidden" style={{ backgroundColor: C.dark }}>
        {post.featured_image_url
          ? <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          : <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #2d4020 100%)` }}><Package size={36} style={{ color: C.lime }}/></div>
        }
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold" style={{ color: C.muted }}>{fmtDate(post.created_at)}</span>
          <span style={{ color: C.border }}>·</span>
          <span className="text-[10px] font-bold" style={{ color: C.muted }}>{mins} min read</span>
        </div>
        <h3 className="text-[14px] font-black leading-snug mb-2 group-hover:text-[#4a8f00] transition-colors line-clamp-2" style={{ color: C.dark }}>{post.title}</h3>
        {excerpt && <p className="text-[12px] leading-relaxed line-clamp-2 flex-1" style={{ color: C.muted }}>{excerpt}</p>}
        <div className="flex items-center gap-1 font-bold text-[12px] mt-3" style={{ color: C.limeDeep }}>
          Read more <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
        </div>
      </div>
    </Link>
  )
}

// ── Main page ──────────────────────────────────────────────────
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
  const featured  = featuredPosts[0] || posts[0]
  const featured2 = featuredPosts[1] || posts[1]
  const popular   = [...posts].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 4)

  // Build categories dynamically from actual posts
  const categories = Array.from(new Set(posts.map((p:any) => p.category).filter(Boolean))) as string[]

  // Group by category
  const byCat: Record<string, any[]> = {}
  for (const p of posts) {
    if (!byCat[p.category]) byCat[p.category] = []
    byCat[p.category].push(p)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh' }}>
      <script dangerouslySetInnerHTML={{ __html: `
        function initNewsletter() {
          var btn = document.getElementById('blog-nl-submit');
          var msg = document.getElementById('blog-nl-msg');
          if(!btn){ setTimeout(initNewsletter, 100); return; }
          btn.addEventListener('click', function(){
            var emailEl = document.getElementById('blog-nl-email');
            if(!emailEl) return;
            var email = emailEl.value.trim();
            if(!email || !email.includes('@')){ if(msg){ msg.textContent='Please enter a valid email'; msg.style.color='#ef4444'; } return; }
            btn.textContent='Subscribing...';
            fetch('/api/blog/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email, source:'blog-listing'}) })
              .then(function(r){ return r.json(); })
              .then(function(d){
                if(d.success && !d.alreadySubscribed){ if(msg){ msg.textContent='✓ Subscribed! Welcome to Riazify Blog.'; msg.style.color='#4a8f00'; } btn.textContent='Subscribed ✓'; btn.style.backgroundColor='#4a8f00'; }
                else if(d.alreadySubscribed){ if(msg){ msg.textContent='You are already subscribed!'; msg.style.color='#f59e0b'; } btn.textContent='Subscribe →'; }
                else { if(msg){ msg.textContent='Error — please try again'; msg.style.color='#ef4444'; } btn.textContent='Subscribe →'; }
              }).catch(function(){ if(msg){ msg.textContent='Error — please try again'; msg.style.color='#ef4444'; } btn.textContent='Subscribe →'; });
          });
        }
        initNewsletter();
      `}} />
      <Navbar />
      <div style={{ paddingTop: '80px' }}>

      {/* ── Hero ── */}
      <div style={{ backgroundColor: C.dark }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1">
              <h1 className="text-[42px] md:text-[52px] font-black leading-tight mb-4" style={{ color: '#fff' }}>
                eBay Seller<br/><span style={{ color: C.lime }}>Resources</span>
              </h1>
              <p className="text-[15px] leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Expert guides, strategies and tips to help you sell smarter on eBay and grow your business.
              </p>
            </div>
            <div className="flex items-center gap-8 shrink-0">
              {[
                { val: posts.length, label: 'Articles', sub: 'published' },
                { val: categories.length, label: 'Topics', sub: 'covered' },
                { val: '100%', label: 'Free', sub: 'always' },
              ].map((s, i) => (
                <div key={s.label} className="text-center">
                  {i > 0 && <div className="absolute h-10 w-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: -16, marginTop: -4 }}/>}
                  <p className="text-[38px] font-black leading-none mb-1" style={{ color: C.lime }}>{s.val}</p>
                  <p className="text-[13px] font-black" style={{ color: '#fff' }}>{s.label}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">

        {searchQ && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border mb-6" style={{ backgroundColor: C.dark, borderColor: 'rgba(143,255,0,0.2)' }}>
            <p className="text-[13px] font-bold" style={{ color: C.lime }}>
              {posts.length} result{posts.length !== 1 ? 's' : ''} for &quot;{searchParams.q}&quot;
            </p>
            <Link href="/blog" className="text-[12px] ml-auto hover:opacity-70" style={{ color: 'rgba(255,255,255,0.5)' }}>Clear ✕</Link>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-3xl border" style={{ borderColor: C.border, backgroundColor: '#fff' }}>
            <FileText size={56} style={{ color: C.lime }}/>
            <h2 className="text-[22px] font-black" style={{ color: C.dark }}>No posts yet</h2>
            <p className="text-[14px]" style={{ color: C.muted }}>Check back soon for eBay selling tips and guides.</p>
            <Link href="/auth/signup" className="px-6 py-3 rounded-xl font-black text-[13px] mt-2" style={{ backgroundColor: C.lime, color: C.dark }}>Start Selling Smarter →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-16">

            {/* ── Featured + Popular ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.lime }} />
                  <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>LATEST ARTICLE</p>
                </div>
                <div className="flex flex-col gap-6">
                {featured && <PostCard post={featured} size="featured" />}

                {/* Second featured — text left, image right */}
                {featured2 && (
                  <Link href={`/blog/${featured2.slug}`}
                    className="group grid md:grid-cols-2 rounded-3xl overflow-hidden border hover:shadow-xl transition-all duration-300"
                    style={{ borderColor: C.border, backgroundColor: '#fff' }}>
                    <div className="p-7 flex flex-col justify-center order-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black" style={{ backgroundColor: C.lime, color: C.dark }}>{featured2.category}</span>
                        <span className="text-[11px] font-bold" style={{ color: C.muted }}>{rt(featured2.word_count)} min read</span>
                      </div>
                      <h2 className="text-[20px] font-black leading-tight mb-3 group-hover:text-[#4a8f00] transition-colors" style={{ color: C.dark }}>{featured2.title}</h2>
                      {(featured2.excerpt || featured2.meta_description) && (
                        <p className="text-[13px] leading-relaxed mb-5 line-clamp-2" style={{ color: C.muted }}>{featured2.excerpt || featured2.meta_description}</p>
                      )}
                      <div className="flex items-center gap-1 font-black text-[12px]" style={{ color: C.limeDeep }}>
                        Read Article <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                      </div>
                    </div>
                    <div className="relative h-64 overflow-hidden order-2" style={{ backgroundColor: C.dark }}>
                      {featured2.featured_image_url
                        ? <img src={featured2.featured_image_url} alt={featured2.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        : <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #2d4020 100%)` }}><Package size={48} style={{ color: C.lime }}/></div>
                      }
                    </div>
                  </Link>
                )}

                {/* Recent posts 2x2 grid */}
                {posts.slice(2, 6).length > 0 && (
                  <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#fff', borderColor: C.border }}>
                    <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.lime }}/>
                      <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>RECENT POSTS</p>
                    </div>
                    <div className="grid grid-cols-2">
                      {posts.slice(2, 6).map((p: any, i: number) => (
                        <Link key={p.id} href={`/blog/${p.slug}`}
                          className="group flex items-center gap-3 p-4 hover:opacity-80 transition-all"
                          style={{
                            borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
                            borderRight: i % 2 === 0 ? `1px solid ${C.border}` : 'none',
                          }}>
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: C.dark }}>
                            {p.featured_image_url
                              ? <img src={p.featured_image_url} alt={p.title} className="w-full h-full object-cover"/>
                              : <div className="w-full h-full flex items-center justify-center"><Package size={16} style={{ color: C.lime }}/></div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black line-clamp-2 group-hover:text-[#4a8f00] transition-colors mb-1" style={{ color: C.dark }}>{p.title}</p>
                            <span className="text-[10px]" style={{ color: C.muted }}>{rt(p.word_count)} min read</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="flex flex-col gap-4">

                {/* Search bar */}
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', boxShadow: `0 0 0 1px ${C.border}` }}>
                  <form action="/blog" method="get" className="flex items-center gap-2 px-3 py-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input type="text" name="q" placeholder="Search articles..."
                      className="flex-1 text-[12px] bg-transparent"
                      style={{ color: C.dark, outline: 'none', border: 'none' }} />
                    <button type="submit" className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg"
                      style={{ backgroundColor: C.lime, color: C.dark }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </form>
                </div>

                {/* Categories */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.lime }} />
                    <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>CATEGORIES</p>
                  </div>
                  <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#fff', borderColor: C.border }}>
                    {categories.map((cat, i) => (
                      <div key={cat} className="flex items-center justify-between px-4 py-2.5 hover:opacity-80 transition-all"
                           style={{ borderBottom: i < categories.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <span className="text-[12px] font-bold" style={{ color: C.dark }}>{cat}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                          {byCat[cat]?.length ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular articles */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.lime }} />
                    <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>POPULAR ARTICLES</p>
                  </div>
                  <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#fff', borderColor: C.border }}>
                    {popular.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-[13px]" style={{ color: C.muted }}>Coming soon</p>
                      </div>
                    ) : (
                      <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
                        {popular.map((p, i) => (
                          <div key={p.id} className="p-3">
                            <div className="flex items-start gap-3">
                              <span className="text-[18px] font-black shrink-0 w-6 text-center" style={{ color: C.limeTint, WebkitTextStroke: `1px ${C.limeDeep}` }}>{i + 1}</span>
                              <div className="min-w-0">
                                <Link href={`/blog/${p.slug}`} className="text-[12px] font-black leading-snug hover:text-[#4a8f00] transition-colors line-clamp-2 block" style={{ color: C.dark }}>{p.title}</Link>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px]" style={{ color: C.muted }}>{rt(p.word_count)} min</span>
                                  {p.views > 0 && <span className="text-[10px]" style={{ color: C.muted }}><Eye size={10} style={{ display: "inline", marginRight: 2 }}/>{p.views}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick CTA */}
                <div className="p-5 rounded-2xl" style={{ backgroundColor: C.dark }}>
                  <p className="text-[13px] font-black mb-1" style={{ color: C.lime }}>Try Riazify Free</p>
                  <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Join 12,000+ eBay sellers. No credit card needed.</p>
                  <Link href="/auth/signup" className="block text-center py-2 rounded-xl text-[12px] font-black hover:opacity-90 transition-all" style={{ backgroundColor: C.lime, color: C.dark }}>Get Started Free →</Link>
                </div>
              </div>
            </div>

            {/* ── Banner 1 — Dark, after featured posts ── */}
            <div className="rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
                 style={{ backgroundColor: C.dark, border: '1px solid rgba(143,255,0,0.2)' }}>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                     style={{ backgroundColor: 'rgba(143,255,0,0.12)', border: '1px solid rgba(143,255,0,0.25)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.lime }}/>
                  <span className="text-[11px] font-black tracking-wider" style={{ color: C.lime }}>RIAZIFY PROTECTION</span>
                </div>
                <h2 className="text-[22px] font-black leading-snug mb-3" style={{ color: '#fff' }}>
                  Are you losing money on eBay<br/>without knowing it?
                </h2>
                <p className="text-[13px] mb-5" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                  Riazify scans every order for fraud risk, calculates real profit and finds winning products — all in one dashboard.
                </p>
                <div className="flex items-center gap-5 flex-wrap">
                  <Link href="/auth/signup"
                    className="px-6 py-2.5 rounded-xl text-[13px] font-black hover:opacity-90 transition-all"
                    style={{ backgroundColor: C.lime, color: C.dark }}>
                    Start Free — No Card Needed
                  </Link>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-[18px] font-black" style={{ color: C.lime }}>12,000+</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>sellers</p>
                    </div>
                    <div className="w-px h-7" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}/>
                    <div className="text-center">
                      <p className="text-[18px] font-black" style={{ color: C.lime }}>98%</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>protection</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="shrink-0 p-6 rounded-2xl flex flex-col items-center gap-2"
                   style={{ backgroundColor: 'rgba(143,255,0,0.08)', border: '1px solid rgba(143,255,0,0.15)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <p className="text-[13px] font-black" style={{ color: '#fff' }}>Order Protection</p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>47 risk signals</p>
              </div>
            </div>

            {/* ── Category sections ── */}
            {categories.map((catName, catIdx) => {
              const catPosts = byCat[catName] ?? []
              if (catPosts.length === 0) return null
              return (
                <div key={catName}>
                  {/* Category header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-[20px] font-black" style={{ color: C.dark }}>{catName}</h2>
                      <p className="text-[11px]" style={{ color: C.muted }}>{catPosts.length} articles</p>
                    </div>
                  </div>

                  {/* Posts grid — 4 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {catPosts.map((p: any) => (
                      <div key={p.id}><PostCard post={p} /></div>
                    ))}
                  </div>

                  {/* Banner 2 after 3rd category */}
                  {catIdx === 2 && (
                    <div className="mt-8 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
                         style={{ backgroundColor: C.dark, border: '1px solid rgba(143,255,0,0.2)' }}>
                      <div className="flex items-center gap-5 flex-1">
                        <div className="rounded-xl p-4 shrink-0" style={{ backgroundColor: 'rgba(143,255,0,0.1)', border: '1px solid rgba(143,255,0,0.2)' }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="1.5">
                            <rect x="2" y="3" width="20" height="14" rx="2"/>
                            <path d="M8 21h8M12 17v4"/>
                            <path d="M7 8h2M7 11h2M11 8h6M11 11h6"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.lime }}>FREE TOOL</p>
                          <h3 className="text-[18px] font-black mb-1" style={{ color: '#fff' }}>eBay Profit Calculator</h3>
                          <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Calculate your exact profit after eBay fees, shipping and cost of goods in seconds.</p>
                        </div>
                      </div>
                      <Link href="/auth/signup"
                        className="shrink-0 px-6 py-3 rounded-xl text-[13px] font-black hover:opacity-90 transition-all whitespace-nowrap"
                        style={{ backgroundColor: C.lime, color: C.dark }}>
                        Try Calculator Free →
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}

            {/* ── Trust section ── */}
            <div className="rounded-3xl p-8 md:p-12" style={{ backgroundColor: C.dark }}>
              <div className="text-center mb-8">
                <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>TRUSTED BY EBAY SELLERS</p>
                <h2 className="text-[26px] font-black" style={{ color: '#fff' }}>Real sellers. Real results.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { quote: 'Riazify flagged a hidden saturation spike on a pet grooming line I was about to bulk buy. Saved me $3,500 in dead stock on day one.', name: 'James R.', role: '7-Figure eBay Seller' },
                  { quote: 'I used the AI forecast to source 200 units 3 weeks before it went viral on eBay. Sold out in 4 days. Game changer.', name: 'Sarah K.', role: 'eBay Dropshipper' },
                  { quote: 'Finally a tool built for eBay operators, not Amazon sellers. The Title Builder alone saves me 10 hours a week.', name: 'Marcus T.', role: 'eBay Power Seller' },
                ].map((t, i) => (
                  <div key={i} className="p-5 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, j) => <Star key={j} size={12} style={{ color: C.lime }} fill={C.lime}/>)}
                    </div>
                    <p className="text-[13px] leading-relaxed mb-4 italic" style={{ color: "rgba(255,255,255,0.8)" }}>"{t.quote}"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[13px]" style={{ backgroundColor: C.lime, color: C.dark }}>{t.name[0]}</div>
                      <div>
                        <p className="text-[12px] font-black" style={{ color: "#fff" }}>{t.name}</p>
                        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link href="/auth/signup"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-[15px] hover:opacity-90 transition-all"
                  style={{ backgroundColor: C.lime, color: C.dark }}>
                  Start Selling Smarter →
                </Link>
                <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>No credit card required · Cancel anytime</p>
              </div>
            </div>

          </div>
        )}
      </div>
      </div>

      {/* ── Stats + Newsletter ── */}
      <div style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e8ede2" }}>
        <div className="max-w-6xl mx-auto px-6 py-14">
          <p className="text-center text-[13px] font-black tracking-wider mb-8" style={{ color: C.muted }}>OUR IMPACT FOR EBAY SELLERS</p>
          <div className="grid grid-cols-3 gap-8 mb-10 text-center">
            {[
              { val: '12,000+', label: 'eBay sellers use Riazify'    },
              { val: '$2.4M+',  label: 'Profit generated by sellers' },
              { val: '98%',     label: 'Order protection rate'       },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[36px] md:text-[44px] font-black mb-1" style={{ color: C.limeDeep }}>{s.val}</p>
                <p className="text-[13px]" style={{ color: C.muted }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: C.dark, border: '1px solid rgba(143,255,0,0.2)' }}>
            <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.lime }}>FREE NEWSLETTER</p>
            <h2 className="text-[22px] font-black mb-2" style={{ color: '#fff' }}>Subscribe to Riazify Blog</h2>
            <p className="text-[13px] mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>Free eBay selling resources, insights and strategies. New articles every week.</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input type="email" id="blog-nl-email" placeholder="Enter your email..."
                className="flex-1 h-12 px-4 rounded-xl border text-[13px] outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
              <button id="blog-nl-submit"
                className="h-12 px-6 rounded-xl text-[13px] font-black hover:opacity-90 transition-all flex items-center shrink-0"
                style={{ backgroundColor: C.lime, color: C.dark }}>
                Subscribe →
              </button>
            </div>
            <p id="blog-nl-msg" className="text-[12px] mt-2" style={{ minHeight: 20 }}></p>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>You may opt-out at any time. Privacy Policy</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}