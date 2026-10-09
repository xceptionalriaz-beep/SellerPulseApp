'use client'
// app/dashboard/title-builder/components/TbSaturMeter.tsx
// Converted 1:1 from lib/pages/title_builder/tb_satur_meter.dart

import { useEffect, useRef } from 'react'

interface Props {
  score: number  // 0.0 to 1.0
  label: string
}

function getScoreColor(score: number): string {
  if (score < 0.33) return '#8FFF00'
  if (score < 0.66) return '#F97316'
  return '#F87171'
}

// â”€â”€ Gauge painter (matches Dart _GaugePainter exactly) â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GaugeCanvas({ score }: { score: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx    = canvas.getContext('2d'); if (!ctx) return

    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const cx          = W / 2
    const cy          = H           // center at bottom â€” matches Dart Offset(width/2, height)
    const radius      = W / 2
    const strokeWidth = 15
    const arcRadius   = radius - 10 // matches Dart radius - 10

    // 1. Background track â€” grey, half circle from Ï€ to 2Ï€
    ctx.beginPath()
    ctx.arc(cx, cy, arcRadius, Math.PI, 2 * Math.PI)
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth   = strokeWidth
    ctx.lineCap     = 'round'
    ctx.stroke()

    // 2. Gradient fill track
    const clampedScore = Math.min(Math.max(score, 0), 1)
    if (clampedScore > 0) {
      // Matches Dart SweepGradient colors: lime â†’ orange â†’ red
      const grad = ctx.createLinearGradient(0, cy, W, cy)
      grad.addColorStop(0,    '#8FFF00')
      grad.addColorStop(0.33, '#8FFF00')
      grad.addColorStop(0.66, '#F97316')
      grad.addColorStop(1,    '#F87171')

      ctx.beginPath()
      ctx.arc(cx, cy, arcRadius, Math.PI, Math.PI + Math.PI * clampedScore)
      ctx.strokeStyle = grad
      ctx.lineWidth   = strokeWidth
      ctx.lineCap     = 'round'
      ctx.stroke()
    }

    // 3. Needle â€” matches Dart needle angle + line + base circle
    const needleAngle = Math.PI + Math.PI * clampedScore
    const needleLen   = arcRadius - 20  // matches Dart radius - 30
    const needleEndX  = cx + needleLen * Math.cos(needleAngle)
    const needleEndY  = cy + needleLen * Math.sin(needleAngle)

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(needleEndX, needleEndY)
    ctx.strokeStyle = '#0F172A'
    ctx.lineWidth   = 3
    ctx.lineCap     = 'round'
    ctx.stroke()

    // Needle base circle
    ctx.beginPath()
    ctx.arc(cx, cy, 6, 0, 2 * Math.PI)
    ctx.fillStyle = '#0F172A'
    ctx.fill()

  }, [score])

  return <canvas ref={canvasRef} width={150} height={80} className="w-full" />
}

// â”€â”€ Main TbSaturMeter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function TbSaturMeter({ score, label }: Props) {
  const scoreColor = getScoreColor(score)

  return (
    <div className="flex flex-col items-center">
      {/* SizedBox(height:80, width:150) with CustomPaint + Align bottomCenter */}
      <div className="relative" style={{ width: 150, height: 80 }}>
        <GaugeCanvas score={score} />
        {/* Overlaid text â€” Align bottomCenter with Column */}
        <div className="absolute bottom-2.5 left-0 right-0 flex flex-col items-center">
          <p className="text-[22px] font-bold" style={{ color: '#0F172A' }}>
            {Math.round(score * 100)}%
          </p>
          <p className="text-[12px] font-bold" style={{ color: scoreColor }}>
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}
