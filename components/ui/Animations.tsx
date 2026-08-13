'use client'
// components/ui/Animations.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable animation components for SellerPulse UI.
// All animations respect prefers-reduced-motion.
// Usage examples:
//
//   <AnimatedBar value={75} color="#8fff00" delay={0} />
//   <AnimatedGauge score={84} color="#16a34a" label="OPTIMIZED" size={200} />
//   <AnimatedCounter value={13253} duration={800} />
//   <AnimatedRangeBar min={9.99} avg={12.50} max={69.99} />
//   <AnimatedPill label="Electronics" color="#0d9488" active />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'

// ── Detect reduced motion preference ──────────────────────────
function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false)
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        setReduced(mq.matches)
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])
    return reduced
}

// ── useMountTrigger — fires false→true on mount or value change ─
function useMountTrigger(deps: any[] = []): boolean {
    const [active, setActive] = useState(false)
    const reduced = useReducedMotion()

    useEffect(() => {
        if (reduced) { setActive(true); return }
        setActive(false)
        const t = setTimeout(() => setActive(true), 40)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    return active
}

// ── Easing presets ─────────────────────────────────────────────
export const EASING = {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',   // Material Design standard
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // slight overshoot
    decel: 'cubic-bezier(0, 0, 0.2, 1)',      // fast start, slow end
    linear: 'linear',
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedBar
// A horizontal progress bar that animates from 0 to `value` on mount
// and re-animates smoothly whenever `value` changes.
//
// Props:
//   value      — 0–100 percentage
//   color      — bar fill color (default: lime green)
//   trackColor — background track color
//   height     — bar height in px (default: 6)
//   delay      — animation delay in ms for staggering (default: 0)
//   duration   — animation duration in ms (default: 600)
//   easing     — CSS easing string (default: EASING.smooth)
//   rounded    — border radius (default: 999)
// ─────────────────────────────────────────────────────────────────────────────
interface AnimatedBarProps {
    value: number
    color?: string
    trackColor?: string
    height?: number
    delay?: number
    duration?: number
    easing?: string
    rounded?: number | string
    className?: string
}

export function AnimatedBar({
    value,
    color = '#7530fb',
    trackColor = '#ede9fe',
    height = 6,
    delay = 0,
    duration = 600,
    easing = EASING.smooth,
    rounded = 999,
    className = '',
}: AnimatedBarProps) {
    const active = useMountTrigger([value])
    const pct = Math.max(0, Math.min(100, value))

    return (
        <div
            className={className}
            style={{
                width: '100%',
                height,
                borderRadius: rounded,
                backgroundColor: trackColor,
                overflow: 'hidden',
            }}
        >
            <div style={{
                height: '100%',
                borderRadius: rounded,
                backgroundColor: color,
                width: active ? `${pct}%` : '0%',
                transition: `width ${duration}ms ${easing} ${delay}ms`,
            }} />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedCounter
// Counts up (or down) from the previous value to the new value.
//
// Props:
//   value    — target number
//   duration — animation duration in ms (default: 800)
//   format   — optional formatter (default: toLocaleString)
// ─────────────────────────────────────────────────────────────────────────────
interface AnimatedCounterProps {
    value: number
    duration?: number
    format?: (n: number) => string
    className?: string
    style?: React.CSSProperties
}

export function AnimatedCounter({
    value,
    duration = 800,
    format = (n) => Math.round(n).toLocaleString(),
    className = '',
    style,
}: AnimatedCounterProps) {
    const [displayed, setDisplayed] = useState(value)
    const prevRef = useRef(value)
    const reduced = useReducedMotion()

    useEffect(() => {
        if (reduced) { setDisplayed(value); prevRef.current = value; return }
        const start = prevRef.current
        const end = value
        const diff = end - start
        if (diff === 0) return
        const steps = Math.round(duration / 16)
        let step = 0
        const interval = setInterval(() => {
            step++
            const progress = step / steps
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplayed(start + diff * eased)
            if (step >= steps) {
                clearInterval(interval)
                setDisplayed(end)
                prevRef.current = end
            }
        }, 16)
        return () => clearInterval(interval)
    }, [value, duration, reduced])

    return (
        <span className={className} style={style}>
            {format(displayed)}
        </span>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedGauge
// Semicircle SVG gauge that sweeps from 0 to score.
// Number inside counts up using AnimatedCounter.
//
// Props:
//   score    — 0–100
//   color    — arc color
//   label    — text below score (OPTIMIZED / GOOD etc.)
//   size     — SVG height in px (default: 125)
// ─────────────────────────────────────────────────────────────────────────────
interface AnimatedGaugeProps {
    score: number
    color: string
    label: string
    size?: number
}

export function AnimatedGauge({ score, color, label, size = 125 }: AnimatedGaugeProps) {
    const [arc, setArc] = useState(0)
    const prevRef = useRef(0)
    const reduced = useReducedMotion()

    useEffect(() => {
        if (reduced) { setArc(score); prevRef.current = score; return }
        const start = prevRef.current
        const end = score
        const diff = end - start
        if (diff === 0) return
        const steps = 40
        let step = 0
        const interval = setInterval(() => {
            step++
            const progress = step / steps
            const eased = 1 - Math.pow(1 - progress, 2)
            setArc(start + diff * eased)
            if (step >= steps) {
                clearInterval(interval)
                setArc(end)
                prevRef.current = end
            }
        }, 16)
        return () => clearInterval(interval)
    }, [score, reduced])

    const r = 95, cx = 130, cy = 105
    const circ = Math.PI * r
    const fill = (arc / 100) * circ
    const empty = circ - fill

    return (
        <div style={{ width: '100%' }}>
            <svg width="100%" height={size} viewBox="0 0 260 125">
                {/* Track */}
                <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none" stroke="#ede9fe" strokeWidth={16} strokeLinecap="round" />
                {/* Arc */}
                {arc > 0 && (
                    <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                        fill="none" stroke={color} strokeWidth={16} strokeLinecap="round"
                        strokeDasharray={`${fill} ${empty}`} />
                )}
                {/* Score number */}
                <text x={cx} y={cy - 14} textAnchor="middle"
                    fontSize={42} fontWeight={800} fill="#1e1535" fontFamily="Inter">
                    <AnimatedCounterSVG value={score} />
                </text>
                {/* Label */}
                <text x={cx} y={cy + 16} textAnchor="middle"
                    fontSize={11} fontWeight={700} fill={color} fontFamily="Inter" letterSpacing={3}>
                    {label}
                </text>
            </svg>
        </div>
    )
}

// SVG text doesn't support React children easily — use a simple tspan approach
function AnimatedCounterSVG({ value }: { value: number }) {
    const [displayed, setDisplayed] = useState(value)
    const prevRef = useRef(value)
    const reduced = useReducedMotion()

    useEffect(() => {
        if (reduced) { setDisplayed(value); prevRef.current = value; return }
        const start = prevRef.current
        const end = value
        const diff = end - start
        if (diff === 0) return
        const steps = 40
        let step = 0
        const interval = setInterval(() => {
            step++
            const eased = 1 - Math.pow(1 - step / steps, 2)
            setDisplayed(Math.round(start + diff * eased))
            if (step >= steps) { clearInterval(interval); setDisplayed(end); prevRef.current = end }
        }, 16)
        return () => clearInterval(interval)
    }, [value, reduced])

    return <>{Math.round(displayed)}</>
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedRangeBar
// Price distribution bar with animated dot sliding to avg position.
//
// Props:
//   min, avg, max — price values
//   minColor      — left color  (default: green)
//   maxColor      — right color (default: red)
//   midColor      — middle color (default: teal)
// ─────────────────────────────────────────────────────────────────────────────
interface AnimatedRangeBarProps {
    min: number
    avg: number
    max: number
    minColor?: string
    midColor?: string
    maxColor?: string
}

export function AnimatedRangeBar({
    min, avg, max,
    minColor = '#16a34a',
    midColor = '#0d9488',
    maxColor = '#b91c1c',
}: AnimatedRangeBarProps) {
    const active = useMountTrigger([min, avg, max])
    const range = max - min || 1
    const pct = ((avg - min) / range) * 100

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span style={{ fontSize: 13, fontWeight: 700, color: minColor }}>${min.toFixed(2)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: midColor }}>${avg.toFixed(2)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: maxColor }}>${max.toFixed(2)}</span>
            </div>
            <div style={{ position: 'relative', height: 8, borderRadius: 999, backgroundColor: '#ede9fe' }}>
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: 999,
                    background: `linear-gradient(to right, ${minColor}, ${midColor}, ${maxColor})`,
                }} />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    backgroundColor: '#1e1535',
                    left: active ? `${pct}%` : '0%',
                    transform: 'translate(-50%, -50%)',
                    transition: `left 0.8s ${EASING.smooth}`,
                }} />
            </div>
            <div className="flex items-center justify-between mt-1">
                <span style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Min</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Avg</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Max</span>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedPill
// A pill/badge that scales in on mount.
//
// Props:
//   label    — text inside pill
//   color    — text + border color
//   bg       — background color
//   active   — if true, filled; if false, outlined
// ─────────────────────────────────────────────────────────────────────────────
interface AnimatedPillProps {
    label: string
    color: string
    bg?: string
    active?: boolean
    onClick?: () => void
    className?: string
}

export function AnimatedPill({ label, color, bg, active, onClick, className = '' }: AnimatedPillProps) {
    const [ready, setReady] = useState(false)
    useEffect(() => { const t = setTimeout(() => setReady(true), 30); return () => clearTimeout(t) }, [])

    return (
        <button
            onClick={onClick}
            className={className}
            style={{
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${active ? color : '#99f6e4'}`,
                backgroundColor: active ? color : (bg ?? '#f0fdfa'),
                color: active ? '#ffffff' : color,
                cursor: onClick ? 'pointer' : 'default',
                transform: ready ? 'scale(1)' : 'scale(0.85)',
                opacity: ready ? 1 : 0,
                transition: `transform 0.25s ${EASING.spring}, opacity 0.2s ease`,
            }}
        >
            {label}
        </button>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedNumber
// Fades + slides up when value changes — good for stats like "47.1K listings"
// ─────────────────────────────────────────────────────────────────────────────
interface AnimatedNumberProps {
    value: string | number
    className?: string
    style?: React.CSSProperties
}

export function AnimatedNumber({ value, className = '', style }: AnimatedNumberProps) {
    const [current, setCurrent] = useState(value)
    const [visible, setVisible] = useState(true)
    const reduced = useReducedMotion()

    useEffect(() => {
        if (value === current) return
        if (reduced) { setCurrent(value); return }
        setVisible(false)
        const t = setTimeout(() => { setCurrent(value); setVisible(true) }, 200)
        return () => clearTimeout(t)
    }, [value, reduced])

    return (
        <span className={className} style={{
            ...style,
            display: 'inline-block',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(6px)',
            transition: `opacity 0.2s ease, transform 0.2s ${EASING.decel}`,
        }}>
            {current}
        </span>
    )
}
