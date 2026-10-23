'use client'
// app/dashboard/integrations/page.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { CheckCircle2, ExternalLink, Clock } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = 'connected' | 'available' | 'coming_soon'

interface Integration {
  id: string
  name: string
  category: string
  description: string
  status: Status
  isNew?: boolean
  logo: React.ReactNode
}

// ── Logos ─────────────────────────────────────────────────────────────────────

const EbayLogo = () => (
  <svg viewBox="0 0 120 50" width="64" height="27">
    <text x="0" y="42" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="46" fill="#e53238">e</text>
    <text x="27" y="42" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="46" fill="#0064d2">b</text>
    <text x="54" y="42" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="46" fill="#f5af02">a</text>
    <text x="82" y="42" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="46" fill="#86b817">y</text>
  </svg>
)

const ClaudeLogo = () => (
  <svg viewBox="0 0 36 36" width="36" height="36" fill="none">
    <rect width="36" height="36" rx="8" fill="#D97757" />
    <path
      d="M24.5 9.5c-1 0-1.9.4-2.5 1.1L18 16.2l-3.8-5.1c-.6-.7-1.5-1.1-2.5-1.1C9.5 10 7.5 12 7.5 14.2c0 .8.3 1.6.8 2.3l7.7 9.6c.6.8 1.5 1.2 2.5 1.2s1.9-.4 2.5-1.2l7.7-9.6c.5-.6.8-1.4.8-2.3 0-2.2-2-4.2-4.5-4.2l-.5.6z"
      fill="white"
    />
  </svg>
)

const ShopifyLogo = () => (
  <svg viewBox="0 0 50 56" width="28" height="32">
    <path d="M43.5 10.9c0-.3-.3-.5-.6-.5s-4.5-.3-4.5-.3-3-3.3-3.3-3.6c-.3-.3-1-.2-1.2-.1l-1.6.5C31.7 5 30.2 4 28.2 4c0 0-.1 0-.1 0-.6-.8-1.3-1.1-2-1.1C21 2.9 18.5 9.1 17.7 12.5l-3.5 1.1c-1.1.3-1.1.4-1.3 1.4C12.7 16.2 10 37.7 10 37.7l23.4 4.4 12.7-2.7c-.1 0-2.7-28.2-2.6-28.5zM32.3 8.3c-.8.2-1.6.5-2.6.8 0-1.3-.2-3.1-.8-4.7C31 4.9 32 7 32.3 8.3zm-4.2 1.3c-1.2.4-2.5.8-3.7 1.1.4-1.5 1.1-3 2.1-4.1.4.9.8 2.1 1.6 3zm-3.3-5c.6 1.5.9 3.7.9 5C23.8 10.2 21.9 11 19.8 12c.7-3.3 2.8-7.5 5-7.4z" fill="#96BF48"/>
    <path d="M42.9 10.4c-.5 0-4.5-.3-4.5-.3s-3-3.3-3.3-3.6c-.1-.1-.3-.2-.5-.2l-2.1 43.8 12.7-2.7S42.9 10.7 42.8 10c-.1-.4-.4-.7-.9-.8.1 0 .1.8 1 1.2z" fill="#5E8E3E"/>
    <path d="M28 19.5l-1.5 4.6s-1.4-.7-3-.7c-2.5 0-2.6 1.5-2.6 1.9 0 2.1 5.5 2.9 5.5 7.8 0 3.9-2.5 6.4-5.7 6.4-4 0-6-2.5-6-2.5l1.1-3.5s2.1 1.8 3.8 1.8c1.1 0 1.6-.9 1.6-1.5 0-2.7-4.5-2.8-4.5-7.4 0-3.8 2.7-7.5 8.2-7.5 2.2 0 3.1.6 3.1.6z" fill="white"/>
  </svg>
)

const AmazonLogo = () => (
  <svg viewBox="0 0 120 38" width="80" height="25">
    <text x="0" y="28" fontFamily="Amazon Ember,Arial" fontWeight="700" fontSize="28" fill="#232F3E">amazon</text>
    <path d="M8 34c14 5 36 7 54 0" stroke="#FF9900" strokeWidth="3" fill="none" strokeLinecap="round"/>
  </svg>
)

// ── Card ──────────────────────────────────────────────────────────────────────

function Card({ name, category, description, status, isNew, logo, onAction, actionHref }: Integration & {
  onAction?: () => void
  actionHref?: string
}) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* Logo row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 10,
          border: '1px solid #f3f4f6',
          backgroundColor: '#fafafa',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {logo}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isNew && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
              color: '#7530fb', backgroundColor: '#f3eeff',
              padding: '2px 8px', borderRadius: 20, border: '1px solid #ede9fe',
            }}>
              NEW
            </span>
          )}
          {status === 'connected' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
              <CheckCircle2 size={13} />
              Connected
            </span>
          )}
          {status === 'coming_soon' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: '#9ca3af' }}>
              <Clock size={12} />
              Soon
            </span>
          )}
        </div>
      </div>

      {/* Text */}
      <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
        {category}
      </p>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{name}</h3>
      <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55, flex: 1, marginBottom: 20 }}>
        {description}
      </p>

      {/* Action */}
      {status === 'connected' && actionHref && (
        <Link href={actionHref} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          height: 36, borderRadius: 8, fontSize: 13, fontWeight: 600,
          color: '#374151', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb',
          textDecoration: 'none',
        }}>
          Manage
        </Link>
      )}

      {status === 'available' && (
        <button
          onClick={onAction}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: 36, borderRadius: 8, fontSize: 13, fontWeight: 600,
            color: '#ffffff', backgroundColor: '#7530fb', border: 'none', cursor: 'pointer',
            width: '100%',
          }}
        >
          {name === 'Claude AI' ? (
            <><span>Add to Claude</span><ExternalLink size={13} /></>
          ) : (
            <span>Connect</span>
          )}
        </button>
      )}

      {status === 'coming_soon' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 36, borderRadius: 8, fontSize: 13, fontWeight: 500,
          color: '#d1d5db', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6',
        }}>
          Notify me
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const MCP_SERVER_URL = 'https://sellerpulseapp.com/api/mcp'
const ADD_TO_CLAUDE_URL =
  `https://claude.ai/integrations/connect` +
  `?server_url=${encodeURIComponent(MCP_SERVER_URL)}` +
  `&name=${encodeURIComponent('SellerPulse')}` +
  `&description=${encodeURIComponent('Access your eBay listings, orders, analytics and inventory directly inside Claude.')}`

export default function IntegrationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [ebayConnected, setEbayConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }
        const { data } = await (supabase.from('profiles') as any)
          .select('ebay_access_token').eq('id', user.id).maybeSingle()
        setEbayConnected(!!(data as any)?.ebay_access_token)
      } catch { /* non-critical */ }
      finally { setLoading(false) }
    }
    check()
  }, [])

  const integrations: Integration[] = [
    {
      id: 'ebay',
      name: 'eBay',
      category: 'Marketplace',
      description: 'Connect your eBay seller account to sync listings, orders, feedback, and performance data.',
      status: ebayConnected ? 'connected' : 'available',
      logo: <EbayLogo />,
    },
    {
      id: 'claude',
      name: 'Claude AI',
      category: 'AI Assistant',
      description: 'Ask Claude questions about your store in plain English — listings, orders, analytics, all without opening a dashboard.',
      status: 'available',
      isNew: true,
      logo: <ClaudeLogo />,
    },
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'E-commerce',
      description: 'Sync your Shopify store with SellerPulse for cross-channel product and order management.',
      status: 'coming_soon',
      logo: <ShopifyLogo />,
    },
    {
      id: 'amazon',
      name: 'Amazon Seller',
      category: 'Marketplace',
      description: 'Pull Amazon marketplace data into SellerPulse and manage listings alongside eBay.',
      status: 'coming_soon',
      logo: <AmazonLogo />,
    },
  ]

  const connectedCount = integrations.filter(i => i.status === 'connected').length

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          border: '2px solid #ede9fe', borderTopColor: '#7530fb',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 28px', maxWidth: 960, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
          Integrations
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Connect your tools and accounts.
          {' '}
          <span style={{ color: connectedCount > 0 ? '#16a34a' : '#9ca3af', fontWeight: 600 }}>
            {connectedCount} of {integrations.length} connected.
          </span>
        </p>
      </div>

      {/* Claude callout — clean, minimal */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: '16px 20px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ClaudeLogo />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Claude AI</span>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                color: '#7530fb', backgroundColor: '#f3eeff',
                padding: '2px 7px', borderRadius: 20, border: '1px solid #ede9fe',
              }}>NEW</span>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
              Ask Claude about your listings, orders and analytics — in plain English.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.open(ADD_TO_CLAUDE_URL, '_blank', 'noopener,noreferrer')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '0 18px', height: 36, borderRadius: 8,
            fontSize: 13, fontWeight: 600, color: '#ffffff',
            backgroundColor: '#7530fb', border: 'none', cursor: 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          Add to Claude
          <ExternalLink size={13} />
        </button>
      </div>

      {/* Section label */}
      <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
        All integrations
      </p>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: 12,
        marginBottom: 36,
      }}>
        {integrations.map(integration => (
          <Card
            key={integration.id}
            {...integration}
            actionHref={integration.status === 'connected' ? '/dashboard/profile?tab=marketplace' : undefined}
            onAction={
              integration.id === 'claude'
                ? () => window.open(ADD_TO_CLAUDE_URL, '_blank', 'noopener,noreferrer')
                : integration.id === 'ebay'
                ? () => router.push('/dashboard/profile?tab=marketplace')
                : undefined
            }
          />
        ))}
      </div>

      {/* How MCP works — plain, no boxes within boxes */}
      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
          How the Claude integration works
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {[
            { n: '1', title: 'Click "Add to Claude"', body: 'Opens claude.ai and registers SellerPulse as a connected tool in your Claude account.' },
            { n: '2', title: 'Claude connects securely', body: 'Claude calls SellerPulse tools on your behalf via MCP — only your own data, nothing else.' },
            { n: '3', title: 'Ask Claude anything', body: '"What are my top 5 listings this month?" or "Write a better title for my camera listing."' },
          ].map(({ n, title, body }) => (
            <div key={n} style={{ display: 'flex', gap: 12 }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                backgroundColor: '#f3eeff', color: '#7530fb',
                fontSize: 11, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{n}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
