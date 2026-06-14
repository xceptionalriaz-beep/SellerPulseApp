import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { ToastProvider } from '@/components/ui/AppToast'
import AffiliateTracker from '@/components/AffiliateTracker'
import './globals.css'

// ─── Fonts ────────────────────────────────────────────────────────────────────
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'Riazify — eBay Seller Tools',
    template: '%s | Riazify',
  },
  description:
    'Riazify is the all-in-one SaaS tool for eBay sellers. Protect orders, calculate profits, research products, and grow your eBay business.',
  keywords: ['eBay seller tools', 'eBay profit calculator', 'eBay order protection', 'product research'],
  authors: [{ name: 'Riazify' }],
  creator: 'Riazify',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Riazify — eBay Seller Tools',
    description: 'The all-in-one SaaS platform for serious eBay sellers.',
    siteName: 'Riazify',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased bg-bg text-dark min-h-screen">
        {/* Affiliate click tracker — reads cookie set by middleware */}
        <AffiliateTracker />
        {/* ToastProvider wraps everything — toast works on every page */}
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}