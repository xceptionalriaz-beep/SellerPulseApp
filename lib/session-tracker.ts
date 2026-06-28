'use client'
// lib/session-tracker.ts
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Converted from: lib/services/session_tracker.dart
//
// What the Dart version did:
//   1. Fetched user's IP from ipify.org (with ipapi.co as backup)
//   2. Detected platform (Windows, macOS, iPhone, iPad, Android)
//   3. Detected browser name (Chrome, Firefox, Safari, etc.)
//   4. Returned { last_login_ip, device_platform, browser_agent }
//
// In Next.js this is much simpler â€” we're always on web,
// so no kIsWeb check needed. Browser APIs give us everything.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export interface LoginMetadata {
  last_login_ip:   string
  device_platform: string
  browser_agent:   string
}

export class SessionTracker {
  // â”€â”€ 1. Get IP Address (with fallback) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private static async getIP(): Promise<string> {
    // Primary: ipify.org
    try {
      const res = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(3000),
      })
      if (res.ok) {
        const data = await res.json()
        return data.ip ?? 'No IP Logged'
      }
    } catch {
      // Primary failed â€” try backup
    }

    // Backup: ipapi.co (same as Dart fallback)
    try {
      const res = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(3000),
      })
      if (res.ok) {
        const data = await res.json()
        return data.ip ?? 'No IP Logged'
      }
    } catch {
      // Both failed
    }

    return 'No IP Logged'
  }

  // â”€â”€ 2. Detect Platform â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Mirrors the Dart platform detection logic exactly
  private static getPlatform(): string {
    if (typeof window === 'undefined') return 'Server'

    const platform  = navigator.platform ?? ''
    const userAgent = navigator.userAgent ?? ''

    if (platform.includes('Win32') || platform.includes('Windows')) return 'Windows'
    if (platform.includes('MacIntel') || platform.includes('Mac'))   return 'macOS'
    if (platform.includes('iPhone') || userAgent.includes('iPhone')) return 'iPhone'
    if (platform.includes('iPad')   || userAgent.includes('iPad'))   return 'iPad'
    if (userAgent.includes('Android'))                                return 'Android'
    if (platform.includes('Linux'))                                   return 'Linux'

    return platform || 'Web'
  }

  // â”€â”€ 3. Detect Browser â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Mirrors the Dart browserName detection
  private static getBrowser(): string {
    if (typeof window === 'undefined') return 'Server'

    const ua = navigator.userAgent

    if (ua.includes('Edg/'))          return 'Edge'
    if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera'
    if (ua.includes('Chrome/'))       return 'Chrome'
    if (ua.includes('Firefox/'))      return 'Firefox'
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'

    return 'Web Browser'
  }

  // â”€â”€ Public API â€” matches Dart SessionTracker.getLoginMetadata() â”€â”€
  static async getLoginMetadata(): Promise<LoginMetadata> {
    const [ip, platform, browser] = await Promise.all([
      SessionTracker.getIP(),
      Promise.resolve(SessionTracker.getPlatform()),
      Promise.resolve(SessionTracker.getBrowser()),
    ])

    return {
      last_login_ip:   ip,
      device_platform: platform,
      browser_agent:   browser,
    }
  }
}
