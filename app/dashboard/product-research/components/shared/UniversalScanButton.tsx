'use client'
// app/dashboard/product-research/components/shared/UniversalScanButton.tsx
// Converted 1:1 from lib/pages/product_research/shared/universal_scan_button.dart

import { useState } from 'react'

interface Props {
  onTap:        () => void
  text?:        string   // default: "SCAN"
  width?:       number
  borderRadius?: number  // default: 11
  fontSize?:    number   // default: 16
}

export default function UniversalScanButton({
  onTap,
  text         = 'SCAN',
  width,
  borderRadius = 11,
  fontSize     = 16,
}: Props) {
  const [hover, setHover] = useState(false)

  return (
    <button
      onClick={onTap}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center justify-center h-full transition-all"
      style={{
        width:            width ?? undefined,
        padding:          width == null ? '0 16px' : undefined,
        backgroundColor:  hover ? '#8FFF00' : '#131B2F',
        // matches Dart BorderRadius.horizontal(right: Radius.circular(borderRadius))
        borderRadius:     `0 ${borderRadius}px ${borderRadius}px 0`,
        transitionDuration: '200ms',
        flexShrink: 0,
      }}>
      <span style={{
        color:      hover ? '#000' : '#fff',
        fontWeight: 700,
        fontSize,
      }}>
        {text}
      </span>
    </button>
  )
}