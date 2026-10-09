'use client'
// app/components/LocationCapture.tsx
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Shows a notification bar on the dashboard.
// Layer 1: Browser GPS (most accurate â€” city level)
// Layer 2: IP geolocation (silent fallback if denied)
//
// Add to your dashboard layout:
//   import { LocationCapture } from '@/components/LocationCapture'
//   <LocationCapture />
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { useEffect, useState } from 'react'
import { MapPin, X, Check, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase'

// â”€â”€ Convert country code to flag emoji â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// BD â†’ ðŸ‡§ðŸ‡©,  US â†’ ðŸ‡ºðŸ‡¸,  GB â†’ ðŸ‡¬ðŸ‡§
function toFlag(code: string): string {
  if (!code || code.length !== 2) return ''
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  ).join('')
}

// â”€â”€ Reverse geocode lat/lng â†’ city + country â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function reverseGeocode(lat: number, lon: number) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
    { headers: { 'Accept-Language': 'en' } }
  )
  if (!res.ok) throw new Error('Reverse geocode failed')
  const data = await res.json()

  // Extract city â€” try multiple fields in order
  const city =
    data.address?.city         ??  // large city
    data.address?.town         ??  // medium town
    data.address?.village      ??  // small village
    data.address?.municipality ??  // municipality
    data.address?.county       ??  // county fallback
    data.address?.state_district ?? // district fallback
    null

  // country_code from Nominatim is lowercase (e.g. "bd") â†’ uppercase "BD"
  const country_code = (data.address?.country_code ?? '').toUpperCase() || null

  return {
    city,
    country:      data.address?.country  ?? null,
    country_code,
    timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
  }
}

export function LocationCapture() {
  const supabase = createClient()

  // dismissed: user clicked "Not now"
  // done: location already saved this session
  const [show,      setShow]      = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [cityLabel, setCityLabel] = useState('')

  useEffect(() => {
    async function init() {
      // Already dismissed this session
      if (sessionStorage.getItem('loc_dismissed')) return

      // Check if location already set accurately
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('location_source, country')
        .eq('id', user.id)
        .single()

      // Already have browser-accurate location â€” skip
      if ((profile as any)?.location_source === 'browser') {
        // Still run IP geo silently for timezone refresh
        runIpGeo(user)
        return
      }

      // No location at all â€” try silent IP geo first
      await runIpGeo(user)

      // Then show notification to get better browser GPS data
      setShow(true)
    }
    init()
  }, [])

  // â”€â”€ Silent IP geolocation (no user interaction needed) â”€â”€â”€â”€â”€
  async function runIpGeo(user: any) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      await fetch('/api/geo', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
    } catch { /* non-critical */ }
  }

  // â”€â”€ Browser GPS â†’ reverse geocode â†’ save â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleAllow() {
    setLoading(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout:            10000,
          maximumAge:         86400000, // cache for 24hrs
          enableHighAccuracy: false,    // city-level is enough
        })
      )

      const { latitude, longitude } = position.coords
      const geo = await reverseGeocode(latitude, longitude)

      // Save to Supabase profiles
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await (supabase.from('profiles') as any).update({
        country:         geo.country,
        verified_city:   geo.city,
        country_code:    geo.country_code,
        timezone:        geo.timezone,
        location_source: 'browser',
      }).eq('id', user.id)

      const flag  = toFlag(geo.country_code ?? '')
      const label = [geo.city, geo.country].filter(Boolean).join(', ')
      setCityLabel(`${flag} ${label}`.trim())
      setSaved(true)

      // Auto-hide after 3 seconds
      setTimeout(() => setShow(false), 3000)

    } catch (err: any) {
      // User denied OR timeout â€” fall back to IP geo silently
      const { data: { user } } = await supabase.auth.getUser()
      if (user) runIpGeo(user)
      setShow(false)
    } finally {
      setLoading(false)
    }
  }

  function handleDismiss() {
    sessionStorage.setItem('loc_dismissed', '1')
    // Still run IP geo silently
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) runIpGeo(user)
    })
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed top-4 left-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl"
      style={{
        transform:       'translateX(-50%)',
        backgroundColor: '#0a0d08',
        border:          '1px solid rgba(143,255,0,0.25)',
        boxShadow:       '0 8px 32px rgba(0,0,0,0.4)',
        minWidth:        340,
        maxWidth:        480,
      }}
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
           style={{ backgroundColor: 'rgba(143,255,0,0.10)' }}>
        {saved
          ? <Check  size={16} style={{ color: '#8fff00' }} />
          : <MapPin size={16} style={{ color: '#8fff00' }} />}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        {saved ? (
          <>
            <p className="text-[13px] font-bold text-white">Location saved</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {cityLabel}
            </p>
          </>
        ) : (
          <>
            <p className="text-[13px] font-bold text-white">
              Allow location access?
            </p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Helps personalise your Riazify experience
            </p>
          </>
        )}
      </div>

      {/* Buttons */}
      {!saved && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAllow}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#8fff00', color: '#0a0d08' }}
          >
            {loading
              ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
                     style={{ borderTopColor: '#0a0d08' }} />
              : <><Globe size={12} /> Allow</>}
          </button>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 flex items-center justify-center rounded-xl transition-all hover:opacity-70"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X size={13} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>
      )}
    </div>
  )
}
