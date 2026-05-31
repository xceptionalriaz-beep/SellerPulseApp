'use client'
// app/dashboard/product-research/components/shared/AnimatedActionButton.tsx
// Converted 1:1 from lib/pages/product_research/shared/animated_action_button.dart

import { useState } from 'react'

interface Props {
  icon:   React.ElementType
  label:  string
  onTap:  () => void
}

export default function AnimatedActionButton({ icon: Icon, label, onTap }: Props) {
  const [hover, setHover] = useState(false)

  return (
    <button
      onClick={onTap}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border transition-all"
      style={{
        backgroundColor: hover ? '#8FFF00' : '#FFFFFF',
        borderColor:     hover ? '#8FFF00' : '#D1D5DB',
        transitionDuration: '150ms',
      }}>
      <Icon size={15} style={{ color: '#131B2F' }} />
      <span className="text-[14px] font-bold" style={{ color: '#131B2F' }}>{label}</span>
    </button>
  )
}