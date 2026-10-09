'use client'
// components/admin/settings/AdminIntegrationsSettings.tsx

const C = {
  dark:         '#1a2410',
  border:       '#e8ede2',
  muted:        '#8a9e78',
  bg:           '#f7f9f5',
  surface:      '#ffffff',
  text:         '#1a2410',
  green:        '#15803d',
  greenBg:      '#f0fdf4',
  greenBorder:  '#bbf7d0',
}

const INTEGRATIONS = [
  { name: 'Resend',        desc: 'Email delivery service',          connected: true,  url: 'https://resend.com'        },
  { name: 'Supabase',      desc: 'Database, auth and storage',      connected: true,  url: 'https://supabase.com'      },
  { name: 'Lemon Squeezy', desc: 'Payments and billing',            connected: true,  url: 'https://lemonsqueezy.com'  },
  { name: 'Vercel',        desc: 'Hosting and deployment',          connected: true,  url: 'https://vercel.com'        },
  { name: 'Google Search', desc: 'Search Console and SEO',          connected: false, url: 'https://search.google.com' },
]

export default function AdminIntegrationsSettings() {
  return (
    <div style={{ padding: '24px 28px' }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: '0 0 4px' }}>Integrations</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 24px' }}>Third-party services connected to Riazify</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {INTEGRATIONS.map(item => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 10 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 1px' }}>{item.name}</p>
              <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{item.desc}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, background: item.connected ? C.greenBg : C.bg, border: `0.5px solid ${item.connected ? C.greenBorder : C.border}`, borderRadius: 100, padding: '3px 10px', color: item.connected ? C.green : C.muted }}>
                {item.connected ? '● Connected' : '○ Not connected'}
              </span>
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                 style={{ fontSize: 11, color: C.muted, textDecoration: 'none', padding: '3px 8px', border: `0.5px solid ${C.border}`, borderRadius: 6, background: C.surface }}>
                Open ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}