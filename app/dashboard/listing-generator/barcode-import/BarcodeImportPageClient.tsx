'use client'

// app/dashboard/listing-generator/barcode-import/BarcodeImportPageClient.tsx
// Client shell that mounts BarcodeImport and handles back navigation

import { useRouter } from 'next/navigation'
import BarcodeImport from '../components/ai-import/barcode-import/BarcodeImport'

export default function BarcodeImportPageClient() {
    const router = useRouter()

    return (
        <BarcodeImport
            onBack={() => router.push('/dashboard/listing-generator')}
        />
    )
}
