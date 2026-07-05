// app/changelog/page.tsx
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog | Riazify',
  description: 'See what\'s new in Riazify — latest features, improvements and bug fixes.',
}

export const revalidate = 0

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  bg:       '#f7f9f5',
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  feature:      { label: 'New Feature',   color: '#4a8f00', bg: '#f4ffe6' },
  improvement:  { label: 'Improvement',   color: '#1d4ed8', bg: '#eff6ff' },
  fix:          { label: 'Bug Fix',       color: '#b91c1c', bg: '#fef2f2' },
  announcement: { label: 'Announcement',  color: '#7c3aed', bg: '#f5f3ff' },
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
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
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
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '80px' }}>

        {/* ── HERO ── */}
        <div style={{ backgroundColor: C.dark }}>
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                 style={{ backgroundColor: 'rgba(143,255,0,0.12)', border: '1px solid rgba(143,255,0,0.25)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.lime }}/>
              <span className="text-[11px] font-black tracking-wider" style={{ color: C.lime }}>WHAT'S NEW</span>
            </div>
            <h1 className="text-[44px] md:text-[56px] font-black leading-tight mb-4" style={{ color: '#fff' }}>
              Changelog
            </h1>
            <p className="text-[16px] leading-relaxed max-w-xl mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Every update, new feature and improvement we ship to Riazify. We update this regularly — check back often.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <p className="text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {entries.length} update{entries.length !== 1 ? 's' : ''} published
              </p>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <Link href="/auth/signup"
                    className="text-[13px] font-bold hover:opacity-80 transition-all"
                    style={{ color: C.lime }}>
                Get notified of updates →
              </Link>
            </div>
          </div>
        </div>

        {/* ── FILTER + SEARCH BAR ── */}
        <div style={{ backgroundColor: '#fff', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <button id="filter-all" className="cl-filter px-3 py-1.5 rounded-lg text-[11px] font-black transition-all"
                      data-filter="all"
                      style={{ backgroundColor: C.lime, color: C.dark }}>
                All
              </button>
              {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                <button key={key} id={`filter-${key}`} className="cl-filter px-3 py-1.5 rounded-lg text-[11px] font-black transition-all"
                        data-filter={key}
                        style={{ backgroundColor: 'transparent', color: C.muted }}>
                  {val.label}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[180px]"
                 style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input id="cl-search" placeholder="Search changelog..."
                     className="flex-1 text-[12px] bg-transparent"
                     style={{ border: 'none', outline: 'none', color: C.dark }}/>
            </div>
          </div>
        </div>

        {/* ── ENTRIES ── */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          {entries.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                   style={{ backgroundColor: C.dark }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <p className="text-[18px] font-black mb-2" style={{ color: C.dark }}>No updates yet</p>
              <p className="text-[14px]" style={{ color: C.muted }}>We're working on something great. Check back soon.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {Object.entries(grouped).map(([month, monthEntries]) => (
                <div key={month} className="cl-month">
                  {/* Month header */}
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-[14px] font-black tracking-wider" style={{ color: C.muted }}>{month.toUpperCase()}</h2>
                    <div className="flex-1 h-px" style={{ backgroundColor: C.border }}/>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                      {monthEntries.length} update{monthEntries.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Entries for this month */}
                  <div className="flex flex-col gap-4">
                    {monthEntries.map((entry: any) => (
                      <div key={entry.id} className="cl-entry group rounded-2xl border hover:shadow-md transition-all duration-300 overflow-hidden"
                           data-type={entry.type} data-title={entry.title.toLowerCase()} data-desc={entry.description.toLowerCase()}
                           style={{ backgroundColor: '#fff', borderColor: C.border }}>
                        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] divide-y md:divide-y-0 md:divide-x"
                             style={{ borderColor: C.border }}>
                          {/* Left column — type, date, version */}
                          <div className="p-5 flex flex-col gap-3" style={{ backgroundColor: C.dark }}>
                            <span className="text-[11px] font-black"
                                  style={{ color: C.lime }}>
                              {TYPE_CONFIG[entry.type]?.label || entry.type}
                            </span>
                            <p className="text-[12px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{formatDate(entry.published_at)}</p>
                            {entry.version && (
                              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border w-fit"
                                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', backgroundColor: 'transparent' }}>
                                {entry.version}
                              </span>
                            )}
                          </div>
                          {/* Right column — title, description */}
                          <div className="p-6 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: C.lime }}/>
                              <h3 className="text-[18px] font-black" style={{ color: C.dark }}>{entry.title}</h3>
                            </div>
                            <p className="text-[14px] leading-relaxed" style={{ color: C.muted }}>{entry.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SUBSCRIBE CTA ── */}
        <div style={{ backgroundColor: C.bg, paddingBottom: 40 }}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="rounded-3xl p-10 text-center"
                 style={{ backgroundColor: C.dark, border: '1px solid rgba(143,255,0,0.2)' }}>
              <p className="text-[11px] font-black tracking-wider mb-3" style={{ color: C.muted }}>STAY UPDATED</p>
              <h2 className="text-[28px] font-black mb-3" style={{ color: '#fff' }}>
                Never miss an update
              </h2>
              <p className="text-[14px] mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Create a free Riazify account to get notified when we ship new features and improvements.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/auth/signup"
                      className="px-8 py-3.5 rounded-xl font-black text-[14px] hover:opacity-90 transition-all"
                      style={{ backgroundColor: C.lime, color: C.dark }}>
                  Create Free Account →
                </Link>
                <Link href="/"
                      className="px-8 py-3.5 rounded-xl font-bold text-[14px] border hover:opacity-80 transition-all"
                      style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Back to top */}
        <button id="cl-back-top"
                className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all"
                style={{ backgroundColor: C.dark, color: C.lime, display: 'none', zIndex: 50 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>

        <Footer />

        <script dangerouslySetInnerHTML={{ __html:
          'function initChangelog() {' +
          '  var entries = document.querySelectorAll(".cl-entry");' +
          '  var filters = document.querySelectorAll(".cl-filter");' +
          '  var search = document.getElementById("cl-search");' +
          '  var backTop = document.getElementById("cl-back-top");' +
          '  if(!entries.length || !filters.length){ setTimeout(initChangelog, 200); return; }' +
          '  var activeFilter = "all";' +
          '  var searchQuery = "";' +
          '  function applyFilters() {' +
          '    entries.forEach(function(el) {' +
          '      var type = el.getAttribute("data-type") || "";' +
          '      var title = el.getAttribute("data-title") || "";' +
          '      var desc = el.getAttribute("data-desc") || "";' +
          '      var matchFilter = activeFilter === "all" || type === activeFilter;' +
          '      var matchSearch = !searchQuery || title.includes(searchQuery) || desc.includes(searchQuery);' +
          '      el.style.display = matchFilter && matchSearch ? "" : "none";' +
          '    });' +
          '    document.querySelectorAll(".cl-month").forEach(function(month) {' +
          '      var visible = [...month.querySelectorAll(".cl-entry")].some(e => e.style.display !== "none");' +
          '      month.style.display = visible ? "" : "none";' +
          '    });' +
          '  }' +
          '  filters.forEach(function(btn) {' +
          '    btn.addEventListener("click", function() {' +
          '      activeFilter = btn.getAttribute("data-filter") || "all";' +
          '      filters.forEach(function(b) { b.style.backgroundColor = "transparent"; b.style.color = "#8a9e78"; });' +
          '      btn.style.backgroundColor = "#8fff00"; btn.style.color = "#1a2410";' +
          '      applyFilters();' +
          '    });' +
          '  });' +
          '  if(search) search.addEventListener("input", function() { searchQuery = search.value.toLowerCase(); applyFilters(); });' +
          '  if(backTop) {' +
          '    window.addEventListener("scroll", function() { backTop.style.display = window.scrollY > 400 ? "flex" : "none"; });' +
          '    backTop.addEventListener("click", function() { window.scrollTo({ top: 0, behavior: "smooth" }); });' +
          '  }' +
          '}' +
          'initChangelog();'
        }}/>
      </div>
    </div>
  )
}