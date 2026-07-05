'use client'
// components/landing/BlogStrip.tsx
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
}

function rt(words: number) { return Math.max(1, Math.ceil((words || 400) / 200)) }

export default function BlogStrip() {
  const [posts, setPosts] = useState<any[]>([])
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    fetch('/api/blog/posts')
      .then(r => r.json())
      .then(d => setPosts(d.posts ?? []))
      .catch(() => {})
  }, [])

  // Duplicate posts for seamless loop
  const items = posts.length > 0 ? [...posts, ...posts, ...posts] : []

  return (
    <section style={{ backgroundColor: '#fff', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '48px 0', overflow: 'hidden' }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8 flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.lime }} />
          <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>FROM THE BLOG</p>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.lime }} />
        </div>
        <h2 className="text-[28px] font-black" style={{ color: C.dark }}>Latest eBay selling tips</h2>
        <p className="text-[14px] max-w-md" style={{ color: C.muted }}>Expert guides, strategies and real-world advice to help you sell smarter on eBay</p>
      </div>

      {/* Scrolling track */}
      {posts.length === 0 ? (
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl border flex-shrink-0 w-72 h-32 animate-pulse"
                   style={{ borderColor: C.border, backgroundColor: C.limeTint }} />
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={trackRef}
          className="flex gap-4 px-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{
            display: 'flex',
            gap: 16,
            paddingLeft: 24,
            animation: `blogScroll 40s linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
            width: 'max-content',
          }}>
          {items.map((post: any, i: number) => (
            <Link key={`${post.id}-${i}`} href={`/blog/${post.slug}`}
              className="group flex-shrink-0 rounded-2xl border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              style={{ borderColor: C.border, backgroundColor: '#fff', width: 260 }}>
              {/* Image */}
              <div className="h-40 overflow-hidden flex-shrink-0" style={{ backgroundColor: C.dark }}>
                {post.featured_image_url
                  ? <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  : <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #2d4020 100%)` }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="1.5"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                    </div>
                }
              </div>
              {/* Content */}
              <div style={{ padding: '14px 16px', flex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: C.limeDeep, backgroundColor: C.limeTint, padding: '3px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>
                  {post.category}
                </span>
                <p className="group-hover:text-[#4a8f00] transition-colors line-clamp-2"
                   style={{ fontSize: 13, fontWeight: 800, color: C.dark, lineHeight: 1.4, marginBottom: 8 }}>
                  {post.title}
                </p>
                <p style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{rt(post.word_count)} min read →</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @keyframes blogScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </section>
  )
}