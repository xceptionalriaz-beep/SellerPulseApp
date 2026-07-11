'use client'
// components/ui/TypewriterText.tsx
// Reusable typewriter animation — types text when scrolled into view
// Usage: <TypewriterText text="Build the future of eBay selling" />

import { useEffect, useRef, useState } from 'react'

interface Props {
  text:       string
  speed?:     number          // ms per character (default 50)
  delay?:     number          // delay before starting in ms (default 0)
  className?: string
  style?:     React.CSSProperties
  cursor?:    boolean         // show blinking cursor (default true)
  tag?:       'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export default function TypewriterText({
  text, speed = 50, delay = 0, className, style, cursor = true, tag = 'span'
}: Props) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted]     = useState(false)
  const [done, setDone]           = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || started) return

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        obs.disconnect()
        setTimeout(() => {
          setStarted(true)
          let i = 0
          const interval = setInterval(() => {
            i++
            setDisplayed(text.slice(0, i))
            if (i >= text.length) {
              clearInterval(interval)
              setDone(true)
            }
          }, speed)
        }, delay)
      }
    }, { threshold: 0.3 })

    obs.observe(el)
    return () => obs.disconnect()
  }, [text, speed, delay, started])

  const Tag = tag as any
  return (
    <Tag ref={ref} className={className} style={style}>
      {displayed}
      {cursor && !done && (
        <span style={{
          display: 'inline-block',
          width: '2px',
          height: '0.9em',
          background: 'currentColor',
          marginLeft: '2px',
          verticalAlign: 'middle',
          animation: 'twBlink 0.7s step-end infinite',
        }}/>
      )}
      <style>{`@keyframes twBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </Tag>
  )
}