'use client'
// app/dashboard/integrations/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Integrations hub — connect third-party platforms and AI assistants.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  CheckCircle2, Plug, ExternalLink, Sparkles, ChevronRight,
  ShoppingCart, Package, BarChart2, Zap, Clock,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type IntegrationStatus = 'connected' | 'available' | 'coming_soon'

interface Integration {
  id: string
  name: string
  description: string
  logo: string            // inline SVG or emoji fallback
  status: IntegrationStatus
  category: string
  actionLabel?: string
  actionHref?: string
  badge?: string
}

// ── Logo SVGs ────────────────────────────────────────────────────────────────

const EbayLogo = () => (
  <svg viewBox="0 0 100 40" width="72" height="29" role="img" aria-label="eBay">
    <text x="0" y="34" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="38" fill="#e53238">e</text>
    <text x="22" y="34" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="38" fill="#0064d2">b</text>
    <text x="44" y="34" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="38" fill="#f5af02">a</text>
    <text x="67" y="34" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="38" fill="#86b817">y</text>
  </svg>
)

const ClaudeLogo = () => (
  <svg viewBox="0 0 40 40" width="40" height="40" fill="none" role="img" aria-label="Claude">
    <rect width="40" height="40" rx="10" fill="#D97757" />
    <path
      d="M27.2 10.4c-1.2 0-2.2.5-2.9 1.3L20 17.2l-4.3-5.5c-.7-.8-1.7-1.3-2.9-1.3C10.2 10.4 8 12.6 8 15.2c0 1 .3 1.9.9 2.6l8.5 10.7c.7.9 1.7 1.4 2.8 1.4 1.1 0 2.1-.5 2.8-1.4l8.5-10.7c.6-.7.9-1.6.9-2.6-.2-2.6-2.4-4.8-5.2-4.8z"
      fill="white"
    />
  </svg>
)

const ShopifyLogo = () => (
  <svg viewBox="0 0 109 124" width="32" height="37" role="img" aria-label="Shopify">
    <path d="M95.5 23.6c-.1-.7-.7-1.1-1.2-1.1s-9.9-.7-9.9-.7-6.6-6.5-7.3-7.2c-.7-.7-2.1-.5-2.6-.3-.1 0-1.4.4-3.6 1.1C69.1 10.7 66 8 61.5 8c-.1 0-.2 0-.3 0-1.3-1.7-2.9-2.5-4.4-2.5-11 0-16.3 13.7-17.9 20.7-4.3 1.3-7.3 2.3-7.7 2.4-2.4.7-2.5.8-2.8 3.1-.2 1.7-6.4 49.3-6.4 49.3l51.4 9.6 27.8-6C101 84.6 95.6 24.3 95.5 23.6zM67 17.3c-1.7.5-3.6 1.1-5.6 1.7 0-2.9-.4-6.9-1.7-10.3C63.2 9.5 66 13.5 67 17.3zM57 8.9c1.4 3.4 1.9 8.1 1.9 10.9-2.6.8-5.4 1.7-8.2 2.5C52.6 16.3 55.1 10 57 8.9zM49.5 9.7c.4-.2.7-.3 1-.3-2.4 4.3-5 10.7-6 16.8-2.4.7-4.7 1.4-6.8 2.1C39.7 22.1 44.2 11.8 49.5 9.7z" fill="#96BF48"/>
    <path d="M94.3 22.5c-.5 0-9.9-.7-9.9-.7s-6.6-6.5-7.3-7.2c-.3-.3-.6-.4-.9-.4l-4.7 96.1 27.8-6S94.8 25 94.7 24.3c-.1-.9-.4-1.8-1.1-1.8H94.3z" fill="#5E8E3E"/>
    <path d="M61.5 42.5l-3.4 10.2s-3-1.6-6.7-1.6c-5.4 0-5.7 3.4-5.7 4.2 0 4.6 12 6.4 12 17.2 0 8.5-5.4 14-12.6 14-8.7 0-13.1-5.4-13.1-5.4l2.3-7.7s4.6 3.9 8.4 3.9c2.5 0 3.6-2 3.6-3.4 0-6-9.8-6.2-9.8-16.2 0-8.3 6-16.4 18.1-16.4 4.6 0 6.9 1.2 6.9 1.2z" fill="white"/>
  </svg>
)

const AmazonLogo = () => (
  <svg viewBox="0 0 603 181" width="80" height="24" role="img" aria-label="Amazon">
    <path d="M373.2 140c-32.2 23.7-79 36.4-119.2 36.4-56.4 0-107.2-20.8-145.6-55.5-3-2.7-.3-6.4 3.3-4.3 41.5 24.1 92.8 38.6 145.8 38.6 35.7 0 75-7.4 111.2-22.7 5.4-2.4 9.9 3.6 4.5 7.5zm12.6-14.5c-4.1-5.3-27.3-2.5-37.7-1.3-3.2.4-3.7-2.4-.8-4.4 18.4-13 48.7-9.2 52.2-4.9 3.6 4.4-1 34.8-18.2 49.4-2.7 2.3-5.2 1.1-4-1.8 3.9-9.6 12.6-31.5 8.5-37z" fill="#FF9900"/>
    <path d="M349 20.5V9.4c0-1.7 1.3-2.8 2.8-2.8h49.7c1.6 0 2.9 1.2 2.9 2.8v9.6c0 1.6-1.3 3.7-3.7 7l-25.8 36.8c9.6-.2 19.7 1.2 28.4 6.1 2 1.1 2.5 2.8 2.6 4.4v11.8c0 1.6-1.8 3.5-3.6 2.5-15.2-8-35.5-8.9-52.4.1-1.7 1-3.6-.9-3.6-2.5V74.5c0-1.8 0-4.9 1.8-7.6L375.7 23h-23.9c-1.6 0-2.8-1.1-2.8-2.5zM124 87.2H108.4c-1.4-.1-2.6-1.3-2.7-2.7V9.5c0-1.6 1.3-2.8 3-2.8h14.6c1.5.1 2.7 1.3 2.8 2.8V20h.3c3.8-10 10.9-14.6 20.5-14.6 9.7 0 15.8 4.7 20.1 14.6 3.8-10 12.4-14.6 21.6-14.6 6.5 0 13.7 2.7 18.1 8.7 5 6.7 3.9 16.5 3.9 25.1l-.1 44.8c0 1.6-1.3 2.8-3 2.8h-15.5c-1.6-.1-2.8-1.3-2.8-2.8V45.5c0-3.4.3-11.7-.4-14.9-.8-5.3-3.5-6.8-7.3-6.8-2.9 0-6 1.9-7.2 5.1-1.3 3.2-1.1 8.5-1.1 11.7v43.7c0 1.6-1.3 2.8-3 2.8h-15.5c-1.6-.1-2.9-1.3-2.9-2.8l-.1-39c0-8.2 1.4-20.2-7.7-20.2-9.2 0-8.8 11.7-8.8 20.2v39c0 1.6-1.3 2.8-3 2.8zm205.8-82.6c19 0 29.3 16.3 29.3 37.1 0 20-11.4 36-29.3 36-18.7 0-28.8-16.3-28.8-36.6 0-20.5 10.2-36.5 28.8-36.5zm.1 13.5c-9.5 0-10 12.9-10 21s-.1 25.6 9.9 25.6c9.9 0 10.3-13.9 10.3-22.3 0-5.6-.2-12.2-2-17.5-1.6-4.7-4.7-6.8-8.2-6.8zM463 87.2h-15.5c-1.6-.1-2.9-1.3-2.9-2.8l-.1-74.9c.1-1.5 1.4-2.7 3-2.7h14.4c1.4.1 2.5 1 2.8 2.3v11.4h.3c4.4-10.4 10.5-15.3 21.3-15.3 7 0 13.8 2.5 18.2 9.5 4.1 6.5 4.1 17.5 4.1 25.4v44.6c-.2 1.5-1.5 2.6-3 2.6H490c-1.4-.1-2.6-1.2-2.8-2.6V44.7c0-8 .9-19.9-7.9-19.9-3.1 0-6 2-7.4 5.2-1.8 4-2 8-2 11.7v42.7c-.1 1.6-1.4 2.8-3 2.8zM279 53c0 5.6.1 10.2-2.7 15.2-2.3 4.1-5.9 6.6-9.9 6.6-5.5 0-8.7-4.2-8.7-10.4 0-12.2 10.9-14.4 21.3-14.4V53zm14.4 34.8c-1 .9-2.4 1-3.5.4-4.9-4.1-5.8-6-8.5-9.9-8.1 8.3-13.9 10.8-24.4 10.8-12.5 0-22.2-7.7-22.2-23.1 0-12 6.5-20.2 15.8-24.2 8.1-3.5 19.3-4.2 27.9-5.1v-1.9c0-3.5.3-7.6-1.8-10.6-1.8-2.7-5.2-3.8-8.2-3.8-5.6 0-10.6 2.9-11.8 8.8-.3 1.3-1.1 2.6-2.4 2.6l-15-1.6c-1.3-.3-2.7-1.3-2.3-3.2 3.4-18.1 19.8-23.6 34.5-23.6 7.5 0 17.3 2 23.2 7.7 7.5 7 6.8 16.3 6.8 26.4v23.9c0 7.2 3 10.4 5.8 14.3 1 1.4 1.2 3-.1 4L293.4 87.8zm-149 0c-1 .9-2.4 1-3.5.4-4.9-4.1-5.8-6-8.5-9.9-8.1 8.3-13.9 10.8-24.4 10.8-12.5 0-22.2-7.7-22.2-23.1 0-12 6.5-20.2 15.8-24.2 8.1-3.5 19.3-4.2 27.9-5.1v-1.9c0-3.5.3-7.6-1.8-10.6-1.8-2.7-5.2-3.8-8.2-3.8-5.6 0-10.6 2.9-11.8 8.8-.3 1.3-1.1 2.6-2.4 2.6l-15-1.6c-1.3-.3-2.7-1.3-2.3-3.2C97.3 11.5 113.8 6 128.4 6c7.5 0 17.3 2 23.2 7.7 7.5 7 6.8 16.3 6.8 26.4v23.9c0 7.2 3 10.4 5.8 14.3 1 1.4 1.2 3-.1 4l-19.7 15.5zm-24.4-34c0 5.6.1 10.2-2.7 15.2-2.3 4.1-5.9 6.6-9.9 6.6-5.5 0-8.7-4.2-8.7-10.4 0-12.2 10.9-14.4 21.3-14.4V53z" fill="#221F1F"/>
  </svg>
)

// ── Integration data ──────────────────────────────────────────────────────────

const MCP_SERVER_URL = 'https://sellerpulseapp.com/api/mcp'
const ADD_TO_CLAUDE_URL = `https://claude.ai/integrations/connect?server_url=${encodeURIComponent(MCP_SERVER_URL)}&name=${encodeURIComponent('SellerPulse')}&description=${encodeURIComponent('Access your eBay listings, orders, analytics and inventory directly inside Claude.')}`

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: IntegrationStatus }) {
  if (status === 'connected') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
        style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
        <CheckCircle2 size={11} />
        Connected
      </span>
    )
  }
  if (status === 'coming_soon') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
        style={{ backgroundColor: '#fefce8', color: '#ca8a04', border: '1px solid #fde047' }}>
        <Clock size={11} />
        Coming Soon
      </span>
    )
  }
  return null
}

// ── Category pill ─────────────────────────────────────────────────────────────

function CategoryPill({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
      style={{ backgroundColor: '#f3eeff', color: '#7530fb' }}>
      {label}
    </span>
  )
}

// ── Integration card ─────────────────────────────────────────────────────────

function IntegrationCard({
  name, description, logo, status, category, actionLabel, actionHref, badge,
  onConnect,
}: Integration & { onConnect?: () => void }) {

  const [hovered, setHovered] = useState(false)
  const isDisabled = status === 'coming_soon'

  return (
    <div
      className="relative flex flex-col rounded-2xl transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#ffffff',
        border: `1.5px solid ${hovered && !isDisabled ? '#c4b5fd' : '#ede9fe'}`,
        boxShadow: hovered && !isDisabled ? '0 8px 24px rgba(117,48,251,0.10)' : '0 1px 4px rgba(30,21,53,0.06)',
        opacity: isDisabled ? 0.65 : 1,
      }}
    >
      {/* Top section */}
      <div className="p-5 flex-1">
        {/* Logo + status row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl"
            style={{ backgroundColor: '#f8f7ff', border: '1px solid #ede9fe' }}>
            {logo}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={status} />
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#7530fb', color: '#b8fa33' }}>
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="mb-2">
          <CategoryPill label={category} />
        </div>

        {/* Name + description */}
        <h3 className="text-[15px] font-bold mb-1.5" style={{ color: '#1e1535' }}>{name}</h3>
        <p className="text-[13px] leading-relaxed" style={{ color: '#6b7280' }}>{description}</p>
      </div>

      {/* Action footer */}
      <div className="px-5 pb-5">
        {status === 'connected' && actionHref && (
          <Link
            href={actionHref}
            className="flex items-center justify-center gap-2 w-full h-9 rounded-xl text-[13px] font-semibold transition-all"
            style={{
              backgroundColor: hovered ? '#f3eeff' : '#f8f7ff',
              color: '#7530fb',
              border: '1px solid #ede9fe',
              textDecoration: 'none',
            }}
          >
            Manage Connection
            <ChevronRight size={14} />
          </Link>
        )}

        {status === 'available' && (
          <button
            onClick={onConnect}
            className="flex items-center justify-center gap-2 w-full h-9 rounded-xl text-[13px] font-bold transition-all"
            style={{
              backgroundColor: hovered ? '#6a20f0' : '#7530fb',
              color: '#ffffff',
            }}
          >
            {actionLabel || 'Connect'}
            <ExternalLink size={13} />
          </button>
        )}

        {status === 'coming_soon' && (
          <div className="flex items-center justify-center gap-2 w-full h-9 rounded-xl text-[13px] font-semibold cursor-not-allowed"
            style={{ backgroundColor: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb' }}>
            Notify Me
          </div>
        )}
      </div>
    </div>
  )
}

// ── Claude MCP feature list ───────────────────────────────────────────────────

function ClaudeFeatureList() {
  const features = [
    'Ask Claude about your best-selling products',
    'Get listing optimisation suggestions',
    'Review orders and track performance',
    'Generate eBay descriptions from Claude',
    'Query your inventory and pricing data',
  ]
  return (
    <ul className="space-y-2">
      {features.map(f => (
        <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: '#4b5563' }}>
          <span style={{ color: '#7530fb', marginTop: 1, flexShrink: 0 }}>✓</span>
          {f}
        </li>
      ))}
    </ul>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [ebayConnected, setEbayConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [claudeAdded, setClaudeAdded] = useState(false)

  useEffect(() => {
    async function checkConnections() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        // Check if eBay is connected via profiles table
        const { data } = await (supabase.from('profiles') as any)
          .select('ebay_access_token')
          .eq('id', user.id)
          .maybeSingle()

        setEbayConnected(!!(data as any)?.ebay_access_token)
      } catch {
        // Non-critical — default to showing connect option
      } finally {
        setLoading(false)
      }
    }
    checkConnections()
  }, [])

  function handleAddToClaude() {
    window.open(ADD_TO_CLAUDE_URL, '_blank', 'noopener,noreferrer')
    setClaudeAdded(true)
  }

  const integrations: Integration[] = [
    {
      id: 'ebay',
      name: 'eBay',
      description: 'Your primary sales channel. Connect your eBay seller account to sync listings, orders, feedback, and analytics.',
      logo: (
        <div className="flex items-center justify-center w-full h-full">
          <EbayLogo />
        </div>
      ),
      status: ebayConnected ? 'connected' : 'available',
      category: 'Marketplace',
      actionLabel: 'Connect eBay',
      actionHref: '/dashboard/profile?tab=marketplace',
    },
    {
      id: 'claude',
      name: 'Claude AI',
      description: 'Let Claude access your SellerPulse data directly — ask questions about your listings, orders, and performance in plain English.',
      logo: (
        <div className="flex items-center justify-center w-full h-full">
          <ClaudeLogo />
        </div>
      ),
      status: 'available',
      category: 'AI Assistant',
      actionLabel: claudeAdded ? 'Reconnect Claude' : 'Add to Claude',
      badge: 'NEW',
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Sync your Shopify store products, orders and inventory with SellerPulse for cross-channel analytics.',
      logo: (
        <div className="flex items-center justify-center w-full h-full p-2">
          <ShopifyLogo />
        </div>
      ),
      status: 'coming_soon',
      category: 'E-commerce',
    },
    {
      id: 'amazon',
      name: 'Amazon Seller',
      description: 'Pull Amazon marketplace data into SellerPulse and manage your listings alongside eBay.',
      logo: (
        <div className="flex items-center justify-center w-full h-full p-1.5">
          <AmazonLogo />
        </div>
      ),
      status: 'coming_soon',
      category: 'Marketplace',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#7530fb', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length

  return (
    <div className="flex flex-col min-h-0 p-6 gap-6" style={{ backgroundColor: '#f8f7ff' }}>

      {/* ── Page header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f3eeff' }}>
            <Plug size={16} style={{ color: '#7530fb' }} />
          </div>
          <h1 className="text-[22px] font-extrabold" style={{ color: '#1e1535', fontFamily: 'Inter, sans-serif' }}>
            Integrations
          </h1>
        </div>
        <p className="text-[14px] mt-1" style={{ color: '#6b7280' }}>
          Connect your tools and platforms to supercharge your SellerPulse workflow.
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold"
            style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
            <CheckCircle2 size={13} />
            {connectedCount} connected
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold"
            style={{ backgroundColor: '#f8f7ff', color: '#9ca3af', border: '1px solid #ede9fe' }}>
            {integrations.length - connectedCount} available
          </div>
        </div>
      </div>

      {/* ── Claude spotlight banner ── */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1535 0%, #2d1b69 100%)', padding: '1px' }}>
        <div className="rounded-2xl" style={{ background: 'linear-gradient(135deg, #1e1535 0%, #2d1b69 100%)' }}>
          <div className="flex flex-col lg:flex-row gap-6 p-6">

            {/* Left: description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <ClaudeLogo />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[18px] font-extrabold text-white">Claude AI</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#b8fa33', color: '#1e1535' }}>
                      NEW
                    </span>
                  </div>
                  <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>AI Assistant · MCP Integration</span>
                </div>
              </div>

              <p className="text-[14px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
                Connect SellerPulse to Claude and ask questions about your store in plain English — no dashboards, just answers.
              </p>

              <ClaudeFeatureList />
            </div>

            {/* Right: action */}
            <div className="flex flex-col items-start lg:items-end justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
                style={{ backgroundColor: 'rgba(184,250,51,0.15)', color: '#b8fa33', border: '1px solid rgba(184,250,51,0.25)' }}>
                <Zap size={13} />
                Powered by MCP
              </div>

              <div className="flex flex-col gap-2 w-full lg:w-auto">
                <button
                  onClick={handleAddToClaude}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold transition-all duration-150 whitespace-nowrap"
                  style={{
                    backgroundColor: '#b8fa33',
                    color: '#1e1535',
                    boxShadow: '0 4px 16px rgba(184,250,51,0.35)',
                  }}
                >
                  <Sparkles size={15} />
                  Add to Claude
                  <ExternalLink size={13} />
                </button>
                <p className="text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Opens claude.ai — free to use
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── All integrations grid ── */}
      <div>
        <h2 className="text-[13px] font-bold uppercase tracking-wider mb-4" style={{ color: '#9ca3af' }}>
          All Integrations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {integrations.map(integration => (
            <IntegrationCard
              key={integration.id}
              {...integration}
              onConnect={integration.id === 'claude' ? handleAddToClaude
                : integration.id === 'ebay' ? () => router.push('/dashboard/profile?tab=marketplace')
                : undefined}
            />
          ))}
        </div>
      </div>

      {/* ── How MCP works explainer ── */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: '#ffffff', border: '1.5px solid #ede9fe' }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={16} style={{ color: '#7530fb' }} />
          <h3 className="text-[14px] font-bold" style={{ color: '#1e1535' }}>How the Claude integration works</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: '1',
              title: 'Click "Add to Claude"',
              desc: 'This opens claude.ai and registers SellerPulse as a connected tool in your Claude account.',
            },
            {
              step: '2',
              title: 'Claude connects securely',
              desc: 'Claude uses the MCP protocol to call SellerPulse tools on your behalf — only your account data, nothing else.',
            },
            {
              step: '3',
              title: 'Ask Claude anything',
              desc: 'Type "What are my top 5 listings this month?" or "Suggest a better title for my camera listing." Claude does the rest.',
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[13px] font-black"
                style={{ backgroundColor: '#f3eeff', color: '#7530fb' }}>
                {step}
              </div>
              <div>
                <p className="text-[13px] font-bold mb-1" style={{ color: '#1e1535' }}>{title}</p>
                <p className="text-[12px] leading-relaxed" style={{ color: '#6b7280' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
