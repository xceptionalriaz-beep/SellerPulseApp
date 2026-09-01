// app/changelog/page.tsx
// Riazify Release Notes & Changelog — v2.0

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Sparkles, ArrowRight, Search, CheckCircle2, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Changelog — New Features & Improvements | Riazify',
  description: 'Track the latest features, engine upgrades, Cassini algorithm improvements, and fixes shipped to Riazify.',
}

export const revalidate = 0

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

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  feature: { label: 'Feature', color: '#7530fb', bg: '#f3eeff' },
  improvement: { label: 'Improvement', color: '#2563eb', bg: '#eff6ff' },
  fix: { label: 'Bug Fix', color: '#dc2626', bg: '#fef2f2' },
  announcement: { label: 'Announcement', color: '#16a34a', bg: '#f0fdf4' },
}

async function getEntries() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/changelog`, { cache: 'no-store' })
    const data = await res.json()
    return data.entries ?? []
  } catch {
    return []
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function groupByMonth(entries: any[]) {
  const groups: Record<string, any[]> = {}
  entries.forEach(entry => {
    const key = new Date(entry.published_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  })
  return groups
}

export default async function ChangelogPage() {
  const entries = await getEntries()
  const grouped = groupByMonth(entries)

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '72px' }}>

        {/* ── 1. Hero Header ── */}
        <header className="border-b" style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
          <div className="max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 border"
              style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}>
              <Sparkles size={13} style={{ color: C.accent }} />
              <span className="text-[11px] font-black tracking-wider uppercase font-syne" style={{ color: C.accent }}>
                PRODUCT RELEASE LOG
              </span>
            </div>

            <h1 className="text-[36px] md:text-[50px] font-black leading-tight mb-3 font-syne text-white tracking-tight">
              Platform Changelog
            </h1>

            <p className="text-[15px] leading-relaxed max-w-lg mx-auto mb-8 font-medium" style={{ color: C.textLight }}>
              A continuous timeline of all feature releases, algorithm updates, and performance optimizations shipped to Riazify.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap text-[13px]">
              <span className="font-semibold" style={{ color: C.textLight }}>
                {entries.length} published update{entries.length !== 1 ? 's' : ''}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <Link href="/auth/signup" className="font-bold font-syne hover:underline" style={{ color: C.accent }}>
                Create Free Account for Live Updates →
              </Link>
            </div>

          </div>
        </header>

        {/* ── 2. Sticky Filter & Search Toolbar ── */}
        <div className="bg-white border-b sticky top-[72px] z-30 shadow-2xs" style={{ borderColor: C.border }}>
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl border bg-[#f8f7ff]" style={{ borderColor: C.border }}>
              <button
                id="filter-all"
                className="cl-filter px-3 py-1.5 rounded-lg text-[12px] font-bold font-syne transition-colors cursor-pointer"
                data-filter="all"
                style={{ backgroundColor: C.primary, color: '#ffffff' }}
              >
                All
              </button>
              {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                <button
                  key={key}
                  id={`filter-${key}`}
                  className="cl-filter px-3 py-1.5 rounded-lg text-[12px] font-bold font-syne transition-colors cursor-pointer hover:bg-white"
                  data-filter={key}
                  style={{ backgroundColor: 'transparent', color: C.muted }}
                >
                  {val.label}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[200px] max-w-xs bg-white"
              style={{ borderColor: C.borderInput }}>
              <Search size={14} style={{ color: C.muted }} />
              <input
                id="cl-search"
                placeholder="Search releases..."
                className="flex-1 text-[12.5px] bg-transparent outline-none border-none"
                style={{ color: C.textDark }}
              />
            </div>

          </div>
        </div>

        {/* ── 3. Changelog Entries Feed ── */}
        <main className="max-w-4xl mx-auto px-6 py-14">
          {entries.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border bg-white p-8" style={{ borderColor: C.border }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border"
                style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
                <Tag size={22} style={{ color: C.primary }} />
              </div>
              <p className="text-[17px] font-bold font-syne mb-1" style={{ color: C.textDark }}>No updates recorded yet</p>
              <p className="text-[13px]" style={{ color: C.muted }}>New release notes will be logged here automatically.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {Object.entries(grouped).map(([month, monthEntries]) => (
                <section key={month} className="cl-month">

                  {/* Month Header Divider */}
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-[13px] font-black uppercase font-syne tracking-wider" style={{ color: C.primary }}>
                      {month}
                    </h2>
                    <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md border font-syne"
                      style={{ backgroundColor: C.primaryLight, borderColor: C.border, color: C.primary }}>
                      {monthEntries.length} {monthEntries.length === 1 ? 'Release' : 'Releases'}
                    </span>
                  </div>

                  {/* Cards Grid for Month */}
                  <div className="flex flex-col gap-4">
                    {monthEntries.map((entry: any) => {
                      const typeConfig = TYPE_CONFIG[entry.type] ?? { label: entry.type, color: C.primary, bg: C.primaryLight }
                      return (
                        <div
                          key={entry.id}
                          className="cl-entry rounded-2xl border bg-white p-6 shadow-xs hover:border-[#7530fb] transition-colors"
                          data-type={entry.type}
                          data-title={entry.title.toLowerCase()}
                          data-desc={(entry.description || '').toLowerCase()}
                          style={{ borderColor: C.border }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-[11px] font-bold px-2.5 py-0.5 rounded-md font-syne uppercase"
                                style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}
                              >
                                {typeConfig.label}
                              </span>
                              {entry.version && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md border font-mono"
                                  style={{ borderColor: C.border, color: C.muted, backgroundColor: C.bg }}>
                                  v{entry.version.replace(/^v/, '')}
                                </span>
                              )}
                            </div>
                            <span className="text-[12px] font-medium" style={{ color: C.muted }}>
                              {formatDate(entry.published_at)}
                            </span>
                          </div>

                          <h3 className="text-[17px] font-bold font-syne mb-2" style={{ color: C.textDark }}>
                            {entry.title}
                          </h3>

                          <p className="text-[13.5px] leading-relaxed" style={{ color: C.muted }}>
                            {entry.description}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                </section>
              ))}
            </div>
          )}
        </main>

        {/* ── 4. Subscription Callout ── */}
        <section className="py-14" style={{ backgroundColor: C.bg }}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="rounded-3xl p-10 text-center border shadow-xl"
              style={{ backgroundColor: C.dark, borderColor: C.borderDark }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-4 text-[11px] font-bold font-syne uppercase"
                style={{ backgroundColor: 'rgba(117,48,251,0.25)', color: C.accent }}>
                <CheckCircle2 size={13} />
                <span>REAL-TIME RELEASE ALERTS</span>
              </div>
              <h2 className="text-[26px] md:text-[32px] font-black font-syne text-white mb-2 tracking-tight">
                Never miss an algorithmic update
              </h2>
              <p className="text-[14px] mb-8 max-w-md mx-auto" style={{ color: C.textLight }}>
                Create your free Riazify workspace to receive automated notifications when we launch new seller capabilities.
              </p>
              <div className="flex items-center justify-center gap-3.5 flex-wrap">
                <Link
                  href="/auth/signup"
                  className="px-8 py-3.5 rounded-xl font-black font-syne text-[13.5px] transition-transform hover:scale-105 shadow-md cursor-pointer"
                  style={{ backgroundColor: C.accent, color: C.dark }}
                >
                  Create Free Workspace →
                </Link>
                <Link
                  href="/"
                  className="px-7 py-3.5 rounded-xl font-bold text-[13.5px] border transition-colors hover:bg-[#271c42] cursor-pointer"
                  style={{ borderColor: C.borderDark, color: '#ffffff' }}
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Back to Top Floating Button */}
        <button
          id="cl-back-top"
          aria-label="Back to top"
          className="fixed bottom-8 right-8 w-11 h-11 rounded-xl items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer border"
          style={{ backgroundColor: C.dark, borderColor: C.borderDark, color: C.accent, display: 'none', zIndex: 50 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>

        <Footer />

        {/* Client-side Instant Filter & Search Script */}
        <script dangerouslySetInnerHTML={{
          __html: `
          function initChangelog() {
            var entries = document.querySelectorAll('.cl-entry');
            var filters = document.querySelectorAll('.cl-filter');
            var search = document.getElementById('cl-search');
            var backTop = document.getElementById('cl-back-top');

            if (!entries.length || !filters.length) {
              setTimeout(initChangelog, 150);
              return;
            }

            var activeFilter = 'all';
            var searchQuery = '';

            function applyFilters() {
              entries.forEach(function(el) {
                var type = el.getAttribute('data-type') || '';
                var title = el.getAttribute('data-title') || '';
                var desc = el.getAttribute('data-desc') || '';
                var matchFilter = activeFilter === 'all' || type === activeFilter;
                var matchSearch = !searchQuery || title.includes(searchQuery) || desc.includes(searchQuery);
                el.style.display = matchFilter && matchSearch ? '' : 'none';
              });

              document.querySelectorAll('.cl-month').forEach(function(month) {
                var visible = Array.from(month.querySelectorAll('.cl-entry')).some(function(e) {
                  return e.style.display !== 'none';
                });
                month.style.display = visible ? '' : 'none';
              });
            }

            filters.forEach(function(btn) {
              btn.addEventListener('click', function() {
                activeFilter = btn.getAttribute('data-filter') || 'all';
                filters.forEach(function(b) {
                  b.style.backgroundColor = 'transparent';
                  b.style.color = '#6b7280';
                });
                btn.style.backgroundColor = '#7530fb';
                btn.style.color = '#ffffff';
                applyFilters();
              });
            });

            if (search) {
              search.addEventListener('input', function() {
                searchQuery = search.value.toLowerCase().trim();
                applyFilters();
              });
            }

            if (backTop) {
              window.addEventListener('scroll', function() {
                backTop.style.display = window.scrollY > 350 ? 'flex' : 'none';
              }, { passive: true });
              backTop.addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              });
            }
          }
          initChangelog();
        ` }} />
      </div>
    </div>
  )
}
