'use client'
// components/ui/AnimatedCounter.tsx
// Reusable animated number counter — counts up from 0 when scrolled into view
// Usage: <AnimatedCounter value={100} suffix="%" duration={1800} />
// For non-numeric display: <AnimatedCounter value={0} word="Async" />

import { useEffect, useRef, useState } from 'react'

interface Props {
  value:     number       // target number to count to
  suffix?:   string       // e.g. "%" or "+"
  prefix?:   string       // e.g. "Day " or "$"
  word?:     string       // if set, shows this word instead of counting (e.g. "Async", "∞")
  duration?: number       // animation duration in ms (default 1800)
  className?: string      // optional className for the span
  style?:    React.CSSProperties
}

export default function AnimatedCounter({ value, suffix, prefix, word, duration = 1800, className, style }: Props) {
  const [count, setCount]     = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || word) return

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true)
        // Small delay so animation is visible even if element is in view on load
        setTimeout(() => {
          const start = performance.now()
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const ease     = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(ease * value))
            if (progress < 1) requestAnimationFrame(animate)
            else setCount(value)
          }
          requestAnimationFrame(animate)
        }, 200)
        obs.disconnect()
      }
    }, { threshold: 0.1 })

    obs.observe(el)
    return () => obs.disconnect()
  }, [value, duration, word])

  return (
    <span ref={ref} className={className} style={style}>
      {word ? word : `${prefix ?? ''}${count}${suffix ?? ''}`}
    </span>
  )
}