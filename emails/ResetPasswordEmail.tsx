// emails/ResetPasswordEmail.tsx
// Password reset email

import {
  Body, Button, Container, Head, Heading, Hr,
  Html, Preview, Section, Text,
} from '@react-email/components'

interface ResetPasswordEmailProps {
  userName: string
  resetUrl: string
}

export function ResetPasswordEmail({
  userName = 'Seller',
  resetUrl = 'https://riazify.com/auth/reset-password',
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Riazify password â€” link expires in 1 hour</Preview>
      <Body style={main}>
        <Container style={container}>

          <Section style={header}>
            <Text style={logoText}>âš¡ Riazify</Text>
          </Section>

          <Section style={body}>
            <div style={iconWrap}>ðŸ”‘</div>
            <Heading style={h1}>Reset your password</Heading>
            <Text style={bodyText}>
              Hey {userName}, we received a request to reset your Riazify password.
              Click the button below to create a new one.
            </Text>

            <Section style={warningCard}>
              <Text style={warningText}>
                â° This link expires in <strong>1 hour</strong> for your security.
              </Text>
            </Section>

            <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
              <Button style={ctaButton} href={resetUrl}>
                Reset My Password â†’
              </Button>
            </Section>

            <Text style={disclaimer}>
              If you didn't request a password reset, ignore this email â€” your
              account is safe and your password hasn't changed.
            </Text>
          </Section>

          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>Â© 2026 Riazify â€” Built for eBay operators.</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export default ResetPasswordEmail

const main      = { backgroundColor: '#f7f9f5', fontFamily: "'Inter', sans-serif" }
const container = { maxWidth: 560, margin: '0 auto', backgroundColor: '#ffffff',
                     borderRadius: 16, overflow: 'hidden' as const, border: '1px solid #e8ede2' }
const header    = { backgroundColor: '#1a2410', padding: '20px 32px', textAlign: 'center' as const }
const logoText  = { color: '#8fff00', fontSize: 22, fontWeight: 900, margin: 0 }
const body      = { padding: '40px 32px', textAlign: 'center' as const }
const iconWrap  = { fontSize: 48, marginBottom: 16 }
const h1        = { color: '#1a2410', fontSize: 26, fontWeight: 900, margin: '0 0 16px' }
const bodyText  = { color: '#8a9e78', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }
const warningCard = { backgroundColor: '#fff8e1', border: '1px solid #fbbf24',
                       borderRadius: 10, padding: '14px 20px', margin: '0 0 8px' }
const warningText = { color: '#92400e', fontSize: 13, margin: 0 }
const ctaButton = { backgroundColor: '#8fff00', color: '#0a0d08', fontSize: 15,
                     fontWeight: 900, padding: '14px 36px', borderRadius: 12,
                     textDecoration: 'none', display: 'inline-block' as const }
const disclaimer= { color: '#8a9e78', fontSize: 12, lineHeight: 1.5 }
const divider   = { borderColor: '#e8ede2', margin: '0 32px' }
const footer    = { padding: '20px 32px', textAlign: 'center' as const }
const footerText= { color: '#8a9e78', fontSize: 12, margin: 0 }
