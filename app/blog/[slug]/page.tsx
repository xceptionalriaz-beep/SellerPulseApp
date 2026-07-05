// app/blog/[slug]/page.tsx
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  surface:  '#fafcf7',
  bg:       '#f7f9f5',
}

async function getPost(slug: string) {
  const supabase = createClient()
  const { data } = await (supabase.from('blog_posts') as any)
    .select('*').eq('slug', slug).eq('status', 'live').single()
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
  // If less than 3 in same category, fill with other posts
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
    .eq('status', 'live').neq('id', currentId)
    .order('views', { ascending: false }).limit(4)
  return data ?? []
}

export const revalidate = 0

async function getPrevNext(slug: string) {
  const supabase = createClient()
  const { data: current } = await (supabase.from('blog_posts') as any)
    .select('created_at').eq('slug', slug).single()
  if (!current) return { prev: null, next: null }
  const [{ data: prev }, { data: next }] = await Promise.all([
    (supabase.from('blog_posts') as any)
      .select('title,slug').eq('status','live')
      .lt('created_at', current.created_at)
      .order('created_at', { ascending: false }).limit(1).single(),
    (supabase.from('blog_posts') as any)
      .select('title,slug').eq('status','live')
      .gt('created_at', current.created_at)
      .order('created_at', { ascending: true }).limit(1).single(),
  ])
  return { prev: prev || null, next: next || null }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Post Not Found' }
  const ogImage = post.og_image || post.featured_image_url || 'https://riazify.com/og-default.jpg'
  return {
    title: post.meta_title || post.title,
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

function readingTime(words: number) { return Math.max(1, Math.ceil((words || 500) / 200)) }
function formatDate(date: string) { return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }

function extractToc(html: string) {
  const matches = [...(html || '').matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gi)]
  return matches.map((m, i) => ({ level: parseInt(m[1]), text: m[2].replace(/<[^>]+>/g, ''), id: `heading-${i}` }))
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
  } catch {}
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

  const toc  = extractToc(post.body || '')
  const body = injectHeadingIds(post.body || '')
  const rt   = readingTime(post.word_count)
  const postUrl = `https://riazify.com/blog/${post.slug}`

  const schema = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: post.title,
    description: post.meta_description || post.excerpt || '',
    image: post.featured_image_url || '',
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Person', name: post.author_name || 'Reaz Uddin' },
    publisher: { '@type': 'Organization', name: 'Riazify', logo: { '@type': 'ImageObject', url: 'https://riazify.com/logo.png' } },
  }

  // Client-side JS for progress bar, back to top, copy link — injected as inline script
  const clientScript = `
    function initPage() {
      var bar = document.getElementById('rp-bar');
      var backTop = document.getElementById('back-top');
      var copyBtn = document.getElementById('copy-link');
      var nlSubmit = document.getElementById('nl-submit');
      var nlMsg = document.getElementById('nl-msg');
      if(!copyBtn){ setTimeout(initPage, 200); return; }
      window.addEventListener('scroll', function(){
        var el = document.documentElement;
        var top = el.scrollTop || document.body.scrollTop;
        var h = el.scrollHeight - el.clientHeight;
        if(bar) bar.style.width = (h > 0 ? Math.min((top/h)*100,100) : 0) + '%';
        if(backTop) backTop.style.display = top > 600 ? 'flex' : 'none';
      }, {passive:true});
      if(backTop) backTop.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });
      if(copyBtn) copyBtn.addEventListener('click', function(){
        var url = window.location.href;
        navigator.clipboard.writeText(url).then(function(){
          copyBtn.textContent = 'Copied! ✓';
          copyBtn.style.color = '#4a8f00';
          copyBtn.style.borderColor = '#8fff00';
          copyBtn.style.backgroundColor = '#f4ffe6';
          setTimeout(function(){ copyBtn.textContent = 'Copy Link'; copyBtn.style.color=''; copyBtn.style.borderColor=''; copyBtn.style.backgroundColor=''; }, 2000);
        }).catch(function(){
          // Fallback for browsers that block clipboard
          var el = document.createElement('textarea');
          el.value = url;
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
          copyBtn.textContent = 'Copied! ✓';
          copyBtn.style.color = '#4a8f00';
          copyBtn.style.borderColor = '#8fff00';
          copyBtn.style.backgroundColor = '#f4ffe6';
          setTimeout(function(){ copyBtn.textContent = 'Copy Link'; copyBtn.style.color=''; copyBtn.style.borderColor=''; copyBtn.style.backgroundColor=''; }, 2000);
        });
      });
      if(nlSubmit) nlSubmit.addEventListener('click', function(){
        var email = document.getElementById('nl-email').value.trim();
        if(!email || !email.includes('@')){ if(nlMsg){ nlMsg.textContent='Please enter a valid email'; nlMsg.style.color='#ef4444'; } return; }
        nlSubmit.textContent='Subscribing...';
        fetch('/api/blog/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email, source:'blog-post'}) })
          .then(function(r){ return r.json(); })
          .then(function(d){
            if(d.success && !d.alreadySubscribed){ if(nlMsg){ nlMsg.textContent='Subscribed! Welcome to Riazify Blog.'; nlMsg.style.color='#4a8f00'; } nlSubmit.textContent='Subscribed ✓'; nlSubmit.style.backgroundColor='#4a8f00'; }
            else if(d.alreadySubscribed){ if(nlMsg){ nlMsg.textContent='You are already subscribed!'; nlMsg.style.color='#f59e0b'; } nlSubmit.textContent='Subscribe →'; }
            else { if(nlMsg){ nlMsg.textContent='Error — please try again'; nlMsg.style.color='#ef4444'; } nlSubmit.textContent='Subscribe →'; }
          }).catch(function(){ if(nlMsg){ nlMsg.textContent='Error — please try again'; nlMsg.style.color='#ef4444'; } nlSubmit.textContent='Subscribe →'; });
      });
    }
    initPage();
  `

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script dangerouslySetInnerHTML={{ __html: clientScript }} />

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
        <div id="rp-bar" style={{ width: '0%', height: '100%', backgroundColor: C.lime, boxShadow: '0 0 8px rgba(143,255,0,0.6)', transition: 'width 75ms' }} />
      </div>

      {/* Back to top button */}
      <button id="back-top" aria-label="Back to top"
        className="fixed bottom-8 right-6 z-50 w-11 h-11 rounded-full items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
        style={{ display: 'none', backgroundColor: C.dark, border: `2px solid ${C.lime}` }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
      </button>

      <Navbar />

      <div style={{ paddingTop: '80px' }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">

            {/* ── Main content ── */}
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-6">
                <Link href="/blog" className="text-[12px] font-bold hover:opacity-70" style={{ color: C.muted }}>Blog</Link>
                <span style={{ color: C.border }}>›</span>
                <span className="text-[12px] font-bold line-clamp-1" style={{ color: C.dark }}>{post.title}</span>
              </div>

              {/* Category + meta */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[11px] font-black" style={{ backgroundColor: C.lime, color: C.dark }}>{post.category}</span>
                <span className="text-[12px] font-bold" style={{ color: C.muted }}>{formatDate(post.created_at)}</span>
                <span style={{ color: C.border }}>·</span>
                <span className="text-[12px] font-bold" style={{ color: C.muted }}>{rt} min read</span>
                {post.word_count && <span style={{ color: C.border }}>·</span>}
                {post.word_count && <span className="text-[12px] font-bold" style={{ color: C.muted }}>{post.word_count.toLocaleString()} words</span>}
                {post.views > 0 && <span style={{ color: C.border }}>·</span>}
                {post.views > 0 && <span className="text-[12px] font-bold" style={{ color: C.muted }}>👁 {post.views.toLocaleString()} views</span>}
              </div>

              {/* Title */}
              <h1 className="text-[32px] md:text-[40px] font-black leading-tight mb-4" style={{ color: C.dark }}>{post.title}</h1>

              {/* Excerpt */}
              {(post.excerpt || post.meta_description) && (
                <p className="text-[16px] leading-relaxed mb-6 pb-6 border-b" style={{ color: C.muted, borderColor: C.border }}>
                  {post.excerpt || post.meta_description}
                </p>
              )}

              {/* Author + reading time */}
              <div className="flex items-center justify-between gap-4 mb-8 p-4 rounded-2xl border flex-wrap"
                   style={{ backgroundColor: '#fff', borderColor: C.border }}>
                <div className="flex items-center gap-3">
                  {post.author_image ? (
                    <img src={post.author_image} alt={post.author_name || 'Author'}
                      className="w-11 h-11 rounded-full object-cover" style={{ border: `2px solid ${C.lime}` }}/>
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-[16px]"
                         style={{ backgroundColor: C.lime, color: C.dark }}>
                      {(post.author_name || 'R').charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-[13px] font-black" style={{ color: C.dark }}>{post.author_name || 'Reaz Uddin'}</p>
                    <p className="text-[11px]" style={{ color: C.muted }}>{post.author_bio || 'eBay seller & founder of Riazify'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: C.limeTint }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.limeDeep} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="text-[12px] font-black" style={{ color: C.limeDeep }}>{rt} min read</span>
                </div>
              </div>

              {/* Featured image */}
              {post.featured_image_url && (
                <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1px solid ${C.border}` }}>
                  <img src={post.featured_image_url} alt={post.title} className="w-full object-cover" style={{ maxHeight: 480 }}/>
                </div>
              )}

              {/* TOC mobile */}
              {toc.length >= 3 && (
                <div className="lg:hidden mb-8 p-5 rounded-2xl border" style={{ backgroundColor: C.limeTint, borderColor: 'rgba(143,255,0,0.3)' }}>
                  <p className="text-[11px] font-black tracking-wider mb-3" style={{ color: C.limeDeep }}>TABLE OF CONTENTS</p>
                  <ol className="space-y-1.5">
                    {toc.map((item, i) => (
                      <li key={i} style={{ paddingLeft: item.level === 3 ? 16 : 0 }}>
                        <a href={`#${item.id}`} className="text-[13px] font-bold hover:opacity-70" style={{ color: C.limeDeep }}>{item.text}</a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Post body */}
              <div className="prose-blog" dangerouslySetInnerHTML={{ __html: body }} />

              {/* Share buttons */}
              <div className="mt-10 pt-8 border-t" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>SHARE</span>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border hover:opacity-80 transition-all"
                    style={{ borderColor: '#000', color: '#fff', backgroundColor: '#000' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border hover:opacity-80 transition-all"
                    style={{ borderColor: '#0077b5', color: '#fff', backgroundColor: '#0077b5' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border hover:opacity-80 transition-all"
                    style={{ borderColor: '#1877f2', color: '#fff', backgroundColor: '#1877f2' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + postUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border hover:opacity-80 transition-all"
                    style={{ borderColor: '#25d366', color: '#fff', backgroundColor: '#25d366' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                  <button id="copy-link"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border hover:opacity-80 transition-all"
                    style={{ borderColor: C.border, color: C.dark, backgroundColor: '#fff' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Author bio */}
              {post.author_bio && (
                <div className="mt-8 p-6 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>
                  <div className="flex items-start gap-4">
                    {post.author_image ? (
                      <img src={post.author_image} alt={post.author_name || 'Author'}
                        className="w-14 h-14 rounded-full object-cover shrink-0" style={{ border: `2px solid ${C.lime}` }}/>
                    ) : (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-[18px] shrink-0"
                           style={{ backgroundColor: C.lime, color: C.dark }}>
                        {(post.author_name || 'R').charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-black tracking-wider mb-1" style={{ color: C.muted }}>WRITTEN BY</p>
                      <p className="text-[16px] font-black mb-2" style={{ color: C.dark }}>{post.author_name || 'Reaz Uddin'}</p>
                      <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{post.author_bio}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Related posts */}
              {related.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.lime }} />
                    <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>RELATED ARTICLES</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {related.map((r: any) => (
                      <Link key={r.id} href={`/blog/${r.slug}`}
                        className="group p-4 rounded-2xl border hover:shadow-md transition-all"
                        style={{ backgroundColor: '#fff', borderColor: C.border }}>
                        {r.featured_image_url && (
                          <div className="rounded-xl overflow-hidden mb-3 h-32">
                            <img src={r.featured_image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                          </div>
                        )}
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>{r.category}</span>
                        <p className="text-[13px] font-black mt-2 line-clamp-2 group-hover:text-[#4a8f00] transition-colors" style={{ color: C.dark }}>{r.title}</p>
                        <p className="text-[11px] mt-1" style={{ color: C.muted }}>{readingTime(r.word_count)} min read</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="hidden lg:block">
              <div className="sticky top-24 flex flex-col gap-5" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>

                {/* TOC */}
                {toc.length >= 3 && (
                  <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.limeTint, borderColor: 'rgba(143,255,0,0.3)' }}>
                    <p className="text-[10px] font-black tracking-wider mb-4" style={{ color: C.limeDeep }}>TABLE OF CONTENTS</p>
                    <ol className="space-y-2">
                      {toc.map((item, i) => (
                        <li key={i} style={{ paddingLeft: item.level === 3 ? 12 : 0 }}>
                          <a href={`#${item.id}`} className="text-[12px] font-bold leading-snug hover:opacity-70 transition-opacity block" style={{ color: C.limeDeep }}>{item.text}</a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* CTA */}
                <div className="p-5 rounded-2xl" style={{ backgroundColor: C.dark }}>
                  <p className="text-[13px] font-black mb-2" style={{ color: C.lime }}>Try Riazify Free</p>
                  <p className="text-[12px] mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Protect your eBay orders, research products and calculate real profits.</p>
                  <Link href="/auth/signup" className="block text-center py-2.5 rounded-xl text-[12px] font-black hover:opacity-90 transition-all" style={{ backgroundColor: C.lime, color: C.dark }}>
                    Get Started Free →
                  </Link>
                </div>

                {/* Popular */}
                {popular.length > 0 && (
                  <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#fff', borderColor: C.border }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: C.border }}>
                      <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>POPULAR ARTICLES</p>
                    </div>
                    {popular.map((p: any, i: number) => (
                      <div key={p.id} className="p-3" style={{ borderBottom: i < popular.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <div className="flex items-start gap-2">
                          <span className="text-[16px] font-black shrink-0 w-5 text-center" style={{ color: C.lime }}>{i + 1}</span>
                          <div>
                            <Link href={`/blog/${p.slug}`} className="text-[12px] font-black leading-snug hover:text-[#4a8f00] transition-colors line-clamp-2 block" style={{ color: C.dark }}>{p.title}</Link>
                            <p className="text-[10px] mt-1" style={{ color: C.muted }}>{readingTime(p.word_count)} min · 👁 {p.views}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Article info */}
                <div className="p-5 rounded-2xl border" style={{ backgroundColor: '#fff', borderColor: C.border }}>
                  <p className="text-[10px] font-black tracking-wider mb-3" style={{ color: C.muted }}>ARTICLE INFO</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[12px]" style={{ color: C.muted }}>Published</span>
                      <span className="text-[12px] font-bold" style={{ color: C.dark }}>{formatDate(post.created_at)}</span>
                    </div>
                    {post.updated_at && post.updated_at !== post.created_at && (
                      <div className="flex justify-between">
                        <span className="text-[12px]" style={{ color: C.muted }}>Updated</span>
                        <span className="text-[12px] font-bold" style={{ color: C.dark }}>{formatDate(post.updated_at)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[12px]" style={{ color: C.muted }}>Reading time</span>
                      <span className="text-[12px] font-bold" style={{ color: C.dark }}>{rt} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[12px]" style={{ color: C.muted }}>Category</span>
                      <span className="text-[12px] font-bold" style={{ color: C.limeDeep }}>{post.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[12px]" style={{ color: C.muted }}>Views</span>
                      <span className="text-[12px] font-bold" style={{ color: C.dark }}>{(post.views || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Prev/Next navigation ── */}
          {(prev || next) && (
            <div className="max-w-6xl mx-auto px-6 pb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.lime }} />
                <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>MORE ARTICLES</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prev && (
                  <a href={`/blog/${prev.slug}`}
                    className="group flex items-center gap-4 p-5 rounded-2xl border hover:shadow-md transition-all"
                    style={{ borderColor: C.border, backgroundColor: '#fff' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: C.limeTint }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.limeDeep} strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black tracking-wider block mb-1" style={{ color: C.muted }}>PREVIOUS ARTICLE</span>
                      <span className="text-[13px] font-black line-clamp-2 group-hover:text-[#4a8f00] transition-colors" style={{ color: C.dark }}>{prev.title}</span>
                    </div>
                  </a>
                )}
                {next && (
                  <a href={`/blog/${next.slug}`}
                    className="group flex items-center gap-4 p-5 rounded-2xl border hover:shadow-md transition-all"
                    style={{ borderColor: C.border, backgroundColor: '#fff' }}>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black tracking-wider block mb-1 text-right" style={{ color: C.muted }}>NEXT ARTICLE</span>
                      <span className="text-[13px] font-black line-clamp-2 group-hover:text-[#4a8f00] transition-colors text-right block" style={{ color: C.dark }}>{next.title}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: C.limeTint }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.limeDeep} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats + Newsletter */}
        <div style={{ backgroundColor: '#ffffff', borderTop: `1px solid ${C.border}` }}>
          <div className="max-w-6xl mx-auto px-6 py-14">
            <p className="text-center text-[13px] font-black tracking-wider mb-8" style={{ color: C.muted }}>OUR IMPACT FOR EBAY SELLERS</p>
            <div className="grid grid-cols-3 gap-8 mb-10 text-center">
              {[
                { val: '12,000+', label: 'eBay sellers use Riazify' },
                { val: '$2.4M+',  label: 'Profit generated by sellers' },
                { val: '98%',     label: 'Order protection rate' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-[36px] md:text-[44px] font-black mb-1" style={{ color: C.limeDeep }}>{s.val}</p>
                  <p className="text-[13px]" style={{ color: C.muted }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: C.dark, border: '1px solid rgba(143,255,0,0.15)' }}>
              <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.lime }}>FREE NEWSLETTER</p>
              <h2 className="text-[22px] font-black mb-2" style={{ color: '#fff' }}>Subscribe to Riazify Blog</h2>
              <p className="text-[13px] mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>Free eBay selling resources, insights and strategies. New articles every week.</p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input type="email" id="nl-email" placeholder="Enter your email..."
                  className="flex-1 h-12 px-4 rounded-xl border text-[13px] outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
                <button id="nl-submit"
                  className="h-12 px-6 rounded-xl text-[13px] font-black hover:opacity-90 transition-all flex items-center shrink-0"
                  style={{ backgroundColor: C.lime, color: C.dark }}>
                  Subscribe →
                </button>
              </div>
              <p id="nl-msg" className="text-[12px] mt-2" style={{ minHeight: 20 }}></p>
              <p className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>You may opt-out at any time.</p>
              <div className="text-center mt-6">
                <Link href="/blog" className="text-[13px] font-bold hover:opacity-80" style={{ color: 'rgba(255,255,255,0.4)' }}>← Back to all articles</Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      <style dangerouslySetInnerHTML={{ __html: [
        '.prose-blog { color: #1a2410; font-size: 16px; line-height: 1.85; }',
        '.prose-blog h1 { font-size: 32px; font-weight: 900; margin: 32px 0 16px; color: #1a2410; }',
        '.prose-blog h2 { font-size: 24px; font-weight: 800; margin: 40px 0 16px; color: #1a2410; }',
        '.prose-blog h3 { font-size: 19px; font-weight: 700; margin: 28px 0 12px; color: #1a2410; }',
        '.prose-blog p { margin: 0 0 18px; }',
        '.prose-blog a { color: #4a8f00; text-decoration: underline; font-weight: 700; }',
        '.prose-blog a:hover { opacity: 0.75; }',
        '.prose-blog ul { list-style: disc; padding-left: 24px; margin: 16px 0; }',
        '.prose-blog ol { list-style: decimal; padding-left: 24px; margin: 16px 0; }',
        '.prose-blog li { margin: 8px 0; }',
        '.prose-blog blockquote { border-left: 4px solid #8fff00; padding: 12px 20px; margin: 24px 0; background: #f4ffe6; border-radius: 0 12px 12px 0; color: #4a8f00; font-style: italic; }',
        '.prose-blog pre { background: #1a2410; color: #8fff00; padding: 20px; border-radius: 12px; overflow-x: auto; font-size: 14px; margin: 20px 0; }',
        '.prose-blog code { background: #f4ffe6; color: #4a8f00; padding: 2px 6px; border-radius: 4px; font-size: 14px; }',
        '.prose-blog pre code { background: transparent; color: #8fff00; padding: 0; }',
        '.prose-blog img { max-width: 100%; border-radius: 12px; margin: 20px 0; }',
        '.prose-blog table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }',
        '.prose-blog th { background: #1a2410; color: #8fff00; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 900; }',
        '.prose-blog td { border-bottom: 1px solid #e8ede2; padding: 10px 14px; }',
        '.prose-blog tr:nth-child(even) td { background: #f7f9f5; }',
        '.prose-blog hr { border: none; border-top: 1px solid #e8ede2; margin: 32px 0; }',
        '.prose-blog details { border: 1px solid #e8ede2; border-radius: 10px; overflow: hidden; margin: 8px 0; }',
        '.prose-blog summary { padding: 12px 16px; font-weight: 700; cursor: pointer; background: #f7f9f5; }',
        '.prose-blog details[open] summary { background: #f4ffe6; color: #4a8f00; }',
      ].join(' ')}} />
    </div>
  )
}