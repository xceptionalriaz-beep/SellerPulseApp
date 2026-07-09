// app/maintenance/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Under Maintenance | Riazify',
  description: 'Riazify is currently undergoing maintenance. Please check back soon.',
}

export default function MaintenancePage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', backgroundColor: '#1a2410', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ width: 64, height: 64, background: '#8fff00', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 16 L12 10 L16 18 L20 12 L24 16" stroke="#1a2410" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          Under Maintenance
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', margin: '0 0 32px', lineHeight: 1.6 }}>
          We're currently performing scheduled maintenance to improve your experience. We'll be back shortly.
        </p>

        {/* Status badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(143,255,0,0.1)', border: '1px solid rgba(143,255,0,0.25)', borderRadius: 100 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8fff00' }}/>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#8fff00' }}>We'll be back soon</span>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: '32px 0 0' }}>
          If you need urgent help, contact us at support@riazify.com
        </p>
      </div>
    </div>
  )
}