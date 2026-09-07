'use client'

export default function ListingGeneratorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7ff' }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-[40px] font-black mb-4 font-syne" style={{ color: '#1f1d2e' }}>
          Listing Generator
        </h1>
        <p className="text-[18px] mb-8" style={{ color: '#6b7280' }}>
          Create beautiful, SEO-optimized eBay listings in seconds.
        </p>
        <div className="rounded-3xl border-2 border-dashed flex flex-col items-center justify-center py-20"
          style={{ borderColor: '#ede9fe', background: '#ffffff' }}>
          <p className="text-[14px] font-semibold" style={{ color: '#7530fb' }}>
            🚧 Coming Soon — Full Listing Generator is under construction
          </p>
          <p className="text-[13px] mt-2" style={{ color: '#a89cc8' }}>
            We&rsquo;re building the most powerful listing tool for eBay sellers.
          </p>
        </div>
      </div>
    </main>
  )
}
