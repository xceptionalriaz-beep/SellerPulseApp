// app/dashboard/listing-generator/barcode-import/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Riazify — /dashboard/listing-generator/barcode-import
// Next.js App Router page wrapper — renders the BarcodeImport component
// ──────────────────────────────────────────────────────────────────────────────

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import BarcodeImportPageClient from './BarcodeImportPageClient'

export const metadata: Metadata = {
    title: 'Barcode to Listing — Riazify',
    description: 'Scan product barcodes and let AI build eBay listings instantly.',
}

// ── Auth guard ────────────────────────────────────────────────────────────────
export default async function BarcodeImportPage() {
    const cookieStore = cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => cookieStore.get(name)?.value,
                set: () => { },
                remove: () => { },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    return <BarcodeImportPageClient />
}
