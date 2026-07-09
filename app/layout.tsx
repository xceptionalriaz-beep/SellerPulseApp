import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { ToastProvider } from '@/components/ui/AppToast'
import AffiliateTracker from '@/components/AffiliateTracker'
import { createClient } from '@supabase/supabase-js'
import './globals.css'

async function getBrand() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await (supabase.from('brand_settings') as any).select('key, value')
    const brand: Record<string, string> = {}
    for (const row of data ?? []) { brand[row.key] = row.value ?? '' }
    return brand
  } catch { return {} }
}

// â”€â”€â”€ Fonts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Metadata â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand()
  const ogImage = brand.og_image || '/brand/og-image.svg'
  const favicon = brand.favicon || '/brand/logo-icon.svg'
  const brandName = brand.brand_name || 'Riazify'

  return {
    title: {
      default: `${brandName} — eBay Seller Tools`,
      template: `%s | ${brandName}`,
    },
    description:
      'Riazify is the all-in-one SaaS tool for eBay sellers. Protect orders, calculate profits, research products, and grow your eBay business.',
    keywords: ['eBay seller tools', 'eBay profit calculator', 'eBay order protection', 'product research'],
    authors: [{ name: brandName }],
    creator: brandName,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      title: `${brandName} — eBay Seller Tools`,
      description: 'The all-in-one SaaS platform for serious eBay sellers.',
      siteName: brandName,
      images: [{ url: ogImage, width: 1200, height: 630, alt: brandName }],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// â”€â”€â”€ Root Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      <head>
        <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
      </head>
      <body className="font-body antialiased bg-bg text-dark min-h-screen">
        {/* Affiliate click tracker â€” reads cookie set by middleware */}
        <AffiliateTracker />
        {/* ToastProvider wraps everything â€” toast works on every page */}
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
