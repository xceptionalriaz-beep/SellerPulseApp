// emails/AlertEmail.tsx
// Market alert / niche intelligence notification email

import {
  Body, Button, Container, Head, Heading, Hr,
  Html, Preview, Section, Text, Row, Column,
} from '@react-email/components'

interface AlertEmailProps {
  userName:     string
  alertType:    'saturation_spike' | 'price_drop' | 'trend_surge' | 'dead_stock_risk'
  nicheKeyword: string
  metric:       string
  detail:       string
  loginUrl?:    string
}

const ALERT_CONFIG = {
  saturation_spike: { emoji: '📈', color: '#ef4444', label: 'Saturation Spike Detected'  },
  price_drop:       { emoji: '📉', color: '#f59e0b', label: '$5 Price Drop Event'         },
  trend_surge:      { emoji: '🚀', color: '#4a8f00', label: 'Demand Surge Detected'       },
  dead_stock_risk:  { emoji: '⚠️', color: '#ef4444', label: 'Dead Stock Risk Alert'       },
}

export function AlertEmail({
  userName     = 'Seller',
  alertType    = 'trend_surge',
  nicheKeyword = 'Cat Brushes',
  metric       = '+48%',
  detail       = 'Demand has surged significantly in this niche.',
  loginUrl     = 'https://riazify.com/auth/login',
}: AlertEmailProps) {
  const cfg = ALERT_CONFIG[alertType]

  return (
    <Html>
      <Head />
      <Preview>{cfg.emoji} {cfg.label} — {nicheKeyword} | Riazify Intelligence</Preview>
      <Body style={main}>
        <Container style={container}>

          <Section style={header}>
            <Text style={logoText}>⚡ Riazify</Text>
            <Text style={headerSub}>Market Intelligence Alert</Text>
          </Section>

          {/* Alert badge */}
          <Section style={{ padding: '32px 32px 0', textAlign: 'center' as const }}>
            <div style={{ ...alertBadge, borderColor: cfg.color, backgroundColor: cfg.color + '15' }}>
              <span style={{ fontSize: 20 }}>{cfg.emoji}</span>
              <span style={{ ...alertBadgeText, color: cfg.color }}>{cfg.label}</span>
            </div>
          </Section>

          <Section style={body}>
            <Heading style={h1}>Hey {userName}, heads up!</Heading>
            <Text style={bodyText}>
              Riazify detected a significant market event for your tracked niche.
              Here's what you need to know:
            </Text>

            {/* Metric card */}
            <Section style={metricCard}>
              <Row>
                <Column style={{ width: '60%' }}>
                  <Text style={metricLabel}>NICHE KEYWORD</Text>
                  <Text style={metricKeyword}>"{nicheKeyword}"</Text>
                  <Text style={metricDetail}>{detail}</Text>
                </Column>
                <Column style={{ width: '40%', textAlign: 'center' as const }}>
                  <Text style={metricLabel}>CHANGE</Text>
                  <Text style={{ ...metricValue, color: cfg.color }}>{metric}</Text>
                </Column>
              </Row>
            </Section>

            {/* Saturation meter visual */}
            <Section style={meterWrap}>
              <Text style={meterLabel}>Market Saturation</Text>
              <div style={meterTrack}>
                <div style={{ ...meterFill, width: alertType === 'saturation_spike' ? '72%' : '24%' }} />
              </div>
              <Text style={meterNote}>
                {alertType === 'saturation_spike' ? '⚠️ High — review before sourcing' : '✅ Low (Ideal) — good entry point'}
              </Text>
            </Section>

            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <Button style={ctaButton} href={loginUrl}>
                View Full Analysis →
              </Button>
            </Section>
          </Section>

          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you have market alerts enabled on Riazify.
            </Text>
            <Text style={footerText}>© 2026 Riazify — Built for eBay operators.</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default AlertEmail

const main        = { backgroundColor: '#f7f9f5', fontFamily: "'Inter', sans-serif" }
const container   = { maxWidth: 580, margin: '0 auto', backgroundColor: '#ffffff',
                       borderRadius: 16, overflow: 'hidden' as const, border: '1px solid #e8ede2' }
const header      = { backgroundColor: '#1a2410', padding: '20px 32px', textAlign: 'center' as const }
const logoText    = { color: '#8fff00', fontSize: 22, fontWeight: 900, margin: '0 0 4px' }
const headerSub   = { color: '#8a9e78', fontSize: 11, letterSpacing: 2, margin: 0,
                       textTransform: 'uppercase' as const }
const alertBadge  = { display: 'inline-flex' as const, alignItems: 'center', gap: 8,
                       padding: '8px 16px', borderRadius: 100, border: '1.5px solid',
                       marginBottom: 4 }
const alertBadgeText = { fontSize: 13, fontWeight: 700 }
const body        = { padding: '24px 32px 32px' }
const h1          = { color: '#1a2410', fontSize: 24, fontWeight: 900, margin: '0 0 12px' }
const bodyText    = { color: '#8a9e78', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }
const metricCard  = { backgroundColor: '#f7f9f5', border: '1px solid #e8ede2',
                       borderRadius: 12, padding: '20px 24px', margin: '0 0 20px' }
const metricLabel = { color: '#8a9e78', fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                       margin: '0 0 6px', textTransform: 'uppercase' as const }
const metricKeyword = { color: '#1a2410', fontSize: 18, fontWeight: 900, margin: '0 0 8px' }
const metricDetail  = { color: '#8a9e78', fontSize: 13, margin: 0, lineHeight: 1.4 }
const metricValue   = { fontSize: 36, fontWeight: 900, margin: 0 }
const meterWrap   = { margin: '0 0 8px' }
const meterLabel  = { color: '#8a9e78', fontSize: 12, fontWeight: 600, margin: '0 0 8px' }
const meterTrack  = { backgroundColor: '#f4ffe6', borderRadius: 100, height: 8,
                       overflow: 'hidden' as const, margin: '0 0 6px' }
const meterFill   = { height: '100%', borderRadius: 100,
                       background: 'linear-gradient(to right, #4a8f00, #8fff00)' }
const meterNote   = { color: '#8a9e78', fontSize: 11, margin: 0 }
const ctaButton   = { backgroundColor: '#8fff00', color: '#0a0d08', fontSize: 15,
                       fontWeight: 900, padding: '14px 36px', borderRadius: 12,
                       textDecoration: 'none', display: 'inline-block' as const }
const divider     = { borderColor: '#e8ede2', margin: '0 32px' }
const footer      = { padding: '20px 32px', textAlign: 'center' as const }
const footerText  = { color: '#8a9e78', fontSize: 12, margin: '4px 0' }