// emails/ConfirmationEmail.tsx
// Email verification / confirmation code email

import {
  Body, Button, Container, Head, Heading, Hr,
  Html, Preview, Section, Text, Row, Column,
} from '@react-email/components'

interface ConfirmationEmailProps {
  userName:        string
  confirmationUrl: string
  otp?:            string   // 6-digit code if using OTP flow
}

export function ConfirmationEmail({
  userName        = 'Seller',
  confirmationUrl = 'https://riazify.com/auth/confirm',
  otp,
}: ConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your Riazify account — one click away</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>⚡ Riazify</Text>
          </Section>

          {/* Body */}
          <Section style={body}>
            <div style={iconWrap}>🔐</div>
            <Heading style={h1}>Confirm your email</Heading>
            <Text style={bodyText}>
              Hey {userName}, you're almost in! Just confirm your email address
              to activate your Riazify account and start scanning niches.
            </Text>

            {/* OTP code if provided */}
            {otp && (
              <Section style={otpCard}>
                <Text style={otpLabel}>YOUR CONFIRMATION CODE</Text>
                <Text style={otpCode}>{otp}</Text>
                <Text style={otpExpiry}>Expires in 10 minutes</Text>
              </Section>
            )}

            {/* Button */}
            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={ctaButton} href={confirmationUrl}>
                ✅ Confirm My Account
              </Button>
            </Section>

            <Text style={disclaimer}>
              If you didn't create a Riazify account, you can safely ignore this email.
              This link expires in 24 hours.
            </Text>
          </Section>

          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>© 2026 Riazify — Built for eBay operators.</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default ConfirmationEmail

const main        = { backgroundColor: '#f7f9f5', fontFamily: "'Inter', sans-serif" }
const container   = { maxWidth: 560, margin: '0 auto', backgroundColor: '#ffffff',
                       borderRadius: 16, overflow: 'hidden' as const, border: '1px solid #e8ede2' }
const header      = { backgroundColor: '#1a2410', padding: '20px 32px', textAlign: 'center' as const }
const logoText    = { color: '#8fff00', fontSize: 22, fontWeight: 900, margin: 0 }
const body        = { padding: '40px 32px', textAlign: 'center' as const }
const iconWrap    = { fontSize: 48, marginBottom: 16 }
const h1          = { color: '#1a2410', fontSize: 26, fontWeight: 900, margin: '0 0 16px' }
const bodyText    = { color: '#8a9e78', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }
const otpCard     = { backgroundColor: '#f7f9f5', border: '2px solid #8fff00',
                       borderRadius: 16, padding: '24px', margin: '0 0 24px' }
const otpLabel    = { color: '#4a8f00', fontSize: 11, fontWeight: 900,
                       letterSpacing: 2, margin: '0 0 12px', textTransform: 'uppercase' as const }
const otpCode     = { color: '#1a2410', fontSize: 48, fontWeight: 900,
                       letterSpacing: 12, margin: '0 0 8px', fontFamily: 'monospace' }
const otpExpiry   = { color: '#8a9e78', fontSize: 12, margin: 0 }
const ctaButton   = { backgroundColor: '#8fff00', color: '#0a0d08', fontSize: 15,
                       fontWeight: 900, padding: '14px 36px', borderRadius: 12,
                       textDecoration: 'none', display: 'inline-block' as const }
const disclaimer  = { color: '#8a9e78', fontSize: 12, lineHeight: 1.5 }
const divider     = { borderColor: '#e8ede2', margin: '0 32px' }
const footer      = { padding: '20px 32px', textAlign: 'center' as const }
const footerText  = { color: '#8a9e78', fontSize: 12, margin: 0 }