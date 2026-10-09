// app/maintenance/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Under Maintenance | Riazify',
  description: 'Riazify is currently undergoing maintenance. Please check back soon.',
}

// -- Riazify Color Role Tokens (v2.0) ---------------------------
const T = {
  primary: '#7530fb',
  accent: '#b8fa33',
  dark: '#1e1535',
  darkCard: '#271c42',
  borderDark: '#2d1f4e',
  textLight: '#a89cc8',
}

export default function MaintenancePage() {
  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        minHeight: '100vh',
        backgroundColor: T.dark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(117,48,251,0.18) 0%, rgba(30,21,53,0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ textAlign: 'center', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Logo container with Riazify Pulse */}
        <div
          style={{
            width: 68,
            height: 68,
            background: T.primary,
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(117,48,251,0.35)',
          }}
        >
          <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 16 L11 10 L16 22 L21 12 L26 16"
              stroke={T.accent}
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="font-syne"
          style={{
            fontSize: 34,
            fontWeight: 900,
            color: '#ffffff',
            margin: '0 0 14px',
            letterSpacing: '-0.5px',
          }}
        >
          Under Maintenance
        </h1>

        <p
          style={{
            fontSize: 15,
            color: T.textLight,
            margin: '0 0 32px',
            lineHeight: 1.65,
          }}
        >
          We're currently performing scheduled system upgrades to deliver an even faster, more powerful intelligence platform. We'll be back shortly.
        </p>

        {/* Status badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 22px',
            background: 'rgba(184, 250, 51, 0.1)',
            border: '1px solid rgba(184, 250, 51, 0.28)',
            borderRadius: 100,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: T.accent,
              boxShadow: '0 0 10px #b8fa33',
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: T.accent,
              letterSpacing: '0.02em',
            }}
          >
            We'll be back online soon
          </span>
        </div>

        {/* Help & Support */}
        <p
          style={{
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.45)',
            margin: '36px 0 0',
          }}
        >
          If you need urgent assistance, contact us at{' '}
          <a
            href="mailto:support@riazify.com"
            style={{ color: T.accent, textDecoration: 'none', fontWeight: 600 }}
          >
            support@riazify.com
          </a>
        </p>
      </div>
    </div>
  )
}
