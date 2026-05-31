// emails/WelcomeEmail.tsx
// Sent when a new user signs up to Riazify

import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Img, Link, Preview, Section, Text, Row, Column,
} from '@react-email/components'

interface WelcomeEmailProps {
  userName:  string
  userEmail: string
  loginUrl?: string
}

export function WelcomeEmail({
  userName  = 'Seller',
  userEmail = '',
  loginUrl  = 'https://riazify.com/auth/login',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Riazify — Your eBay intelligence dashboard is ready</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <div style={logoWrap}>
                  <span style={logoIcon}>⚡</span>
                  <span style={logoText}>Riazify</span>
                </div>
              </Column>
            </Row>
          </Section>

          {/* Hero */}
          <Section style={hero}>
            <Heading style={h1}>Welcome to Riazify, {userName}! 🎉</Heading>
            <Text style={subtitle}>
              Your next-gen eBay intelligence dashboard is ready. Start scanning niches,
              tracking competitors, and forecasting demand — all in one place.
            </Text>
          </Section>

          {/* Stats card */}
          <Section style={card}>
            <Text style={cardTitle}>What's waiting for you inside:</Text>
            <Row style={featureRow}>
              {[
                { icon: '🔍', label: 'Product Research',  desc: 'Scan any niche in seconds'       },
                { icon: '📈', label: 'AI Forecasting',    desc: '7, 30 & 90-day predictions'     },
                { icon: '🎯', label: 'Title Builder',     desc: 'Optimize eBay titles with AI'   },
                { icon: '🛡️', label: 'Order Protection',  desc: 'Risk-score every buyer'         },
              ].map((f, i) => (
                <Column key={i} style={featureCol}>
                  <div style={featureIcon}>{f.icon}</div>
                  <Text style={featureLabel}>{f.label}</Text>
                  <Text style={featureDesc}>{f.desc}</Text>
                </Column>
              ))}
            </Row>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={loginUrl}>
              Launch My Dashboard →
            </Button>
            <Text style={ctaNote}>Takes less than 30 seconds to run your first scan</Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you signed up at Riazify with {userEmail}.
            </Text>
            <Text style={footerText}>
              <Link href="https://riazify.com/unsubscribe" style={footerLink}>Unsubscribe</Link>
              {' · '}
              <Link href="https://riazify.com/privacy" style={footerLink}>Privacy Policy</Link>
            </Text>
            <Text style={footerText}>© 2026 Riazify — Built for eBay operators.</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

// ── Styles ─────────────────────────────────────────────────────
const main        = { backgroundColor: '#f7f9f5', fontFamily: "'Inter', sans-serif" }
const container   = { maxWidth: 600, margin: '0 auto', backgroundColor: '#ffffff',
                       borderRadius: 16, overflow: 'hidden' as const,
                       border: '1px solid #e8ede2' }
const header      = { backgroundColor: '#1a2410', padding: '20px 32px' }
const logoWrap    = { display: 'flex' as const, alignItems: 'center', gap: 8 }
const logoIcon    = { fontSize: 20 }
const logoText    = { color: '#8fff00', fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }
const hero        = { padding: '40px 32px 24px' }
const h1          = { color: '#1a2410', fontSize: 28, fontWeight: 900, margin: '0 0 12px',
                       lineHeight: 1.2 }
const subtitle    = { color: '#8a9e78', fontSize: 15, lineHeight: 1.6, margin: 0 }
const card        = { margin: '0 32px 24px', backgroundColor: '#f7f9f5',
                       borderRadius: 12, padding: '24px', border: '1px solid #e8ede2' }
const cardTitle   = { color: '#4a8f00', fontSize: 13, fontWeight: 700,
                       letterSpacing: 1, margin: '0 0 20px', textTransform: 'uppercase' as const }
const featureRow  = { width: '100%' }
const featureCol  = { width: '25%', textAlign: 'center' as const, padding: '0 8px' }
const featureIcon = { fontSize: 24, marginBottom: 8 }
const featureLabel= { color: '#1a2410', fontSize: 12, fontWeight: 700, margin: '0 0 4px' }
const featureDesc = { color: '#8a9e78', fontSize: 11, margin: 0, lineHeight: 1.4 }
const ctaSection  = { padding: '8px 32px 32px', textAlign: 'center' as const }
const ctaButton   = { backgroundColor: '#8fff00', color: '#0a0d08', fontSize: 15,
                       fontWeight: 900, padding: '14px 32px', borderRadius: 12,
                       textDecoration: 'none', display: 'inline-block' as const }
const ctaNote     = { color: '#8a9e78', fontSize: 12, margin: '12px 0 0' }
const divider     = { borderColor: '#e8ede2', margin: '0 32px' }
const footer      = { padding: '24px 32px', textAlign: 'center' as const }
const footerText  = { color: '#8a9e78', fontSize: 12, margin: '4px 0', lineHeight: 1.5 }
const footerLink  = { color: '#4a8f00', textDecoration: 'none' }