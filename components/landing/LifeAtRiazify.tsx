'use client'
// components/landing/LifeAtRiazify.tsx
import { useEffect } from 'react'

const C = {
  limeDeep: '#4a8f00',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  bg:       '#f7f9f5',
  surface:  '#ffffff',
}

const STATS = [
  { num: 100, suffix: '%',  prefix: '',     word: '',      label: 'Remote',          desc: 'Work from anywhere'    },
  { num: 1,   suffix: '',   prefix: 'Day ', word: '',      label: 'Equity',          desc: 'From your first day'   },
  { num: 0,   suffix: '',   prefix: '',     word: 'Async', label: 'Communication',   desc: 'No pointless meetings' },
  { num: 0,   suffix: '',   prefix: '',     word: '∞',     label: 'Learning budget', desc: 'Courses, books, tools' },
]

export default function LifeAtRiazify() {
  useEffect(() => {
    // Counter animation
    const counters = document.querySelectorAll('.life-counter')
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        const target = parseFloat(el.getAttribute('data-num') || '0')
        const suffix = el.getAttribute('data-suffix') || ''
        const prefix = el.getAttribute('data-prefix') || ''
        let start: number | null = null
        const step = (ts: number) => {
          if (!start) start = ts
          const progress = Math.min((ts - start) / 1800, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          el.textContent = prefix + Math.floor(target * ease) + suffix
          if (progress < 1) requestAnimationFrame(step)
          else el.textContent = prefix + target + suffix
        }
        requestAnimationFrame(step)
        cObs.unobserve(el)
      })
    }, { threshold: 0.5 })
    counters.forEach(el => cObs.observe(el))

    // Fade-in-up animation for cards
    const cards = document.querySelectorAll('.life-card')
    const cardObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('life-visible')
          cardObs.unobserve(e.target)
        }
      })
    }, { threshold: 0.1 })
    cards.forEach((el, i) => {
      ;(el as HTMLElement).style.transitionDelay = `${i * 100}ms`
      cardObs.observe(el)
    })

    return () => { cObs.disconnect(); cardObs.disconnect() }
  }, [])

  return (
    <div style={{ backgroundColor: C.bg }}>
      <style>{`
        .life-card { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .life-card.life-visible { opacity: 1; transform: translateY(0); }
      `}</style>
      <div className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>LIFE AT RIAZIFY</p>
        <h2 className="text-[32px] font-black mb-10" style={{ color: C.dark }}>What working here looks like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="life-card flex flex-col items-center text-center p-6 rounded-2xl border"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <p className="text-[32px] font-black mb-1" style={{ color: C.limeDeep }}>
                {s.word ? (
                  <span>{s.word}</span>
                ) : (
                  <span
                    className="life-counter"
                    data-num={s.num}
                    data-suffix={s.suffix}
                    data-prefix={s.prefix}
                  >{s.prefix}0{s.suffix}</span>
                )}
              </p>
              <p className="text-[13px] font-black mb-1" style={{ color: C.dark }}>{s.label}</p>
              <p className="text-[11px]" style={{ color: C.muted }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}