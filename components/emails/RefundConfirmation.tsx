// components/emails/RefundConfirmation.tsx
// Refund confirmation email template using react-email

import {
  Html, Head, Body, Container, Section,
  Text, Hr, Row, Column, Img,
} from '@react-email/components'

interface RefundConfirmationProps {
  customerName:  string
  customerEmail: string
  amount:        string
  plan:          string
  invoice:       string
  reason:        string
  refundDate:    string
}

export default function RefundConfirmation({
  customerName  = 'Valued Customer',
  customerEmail = '',
  amount        = '$0.00',
  plan          = 'Starter',
  invoice       = 'â€”',
  reason        = 'Customer request',
  refundDate    = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
}: RefundConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f4ffe6', fontFamily: 'Inter, sans-serif', margin: 0, padding: '40px 0' }}>
        <Container style={{ maxWidth: 520, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8ede2' }}>

          {/* Header */}
          <Section style={{ backgroundColor: '#0a0d08', padding: '28px 32px' }}>
            <Text style={{ color: '#8fff00', fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
              Riazify
            </Text>
            <Text style={{ color: '#8a9e78', fontSize: 12, margin: '4px 0 0' }}>
              eBay Seller Intelligence Platform
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px' }}>

            {/* Icon + title */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                backgroundColor: '#f4ffe6', border: '1px solid #e8ede2',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Text style={{ fontSize: 24, margin: 0 }}>â†©</Text>
              </div>
              <Text style={{ fontSize: 22, fontWeight: 900, color: '#0a0d08', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                Refund Processed
              </Text>
              <Text style={{ fontSize: 14, color: '#8a9e78', margin: 0 }}>
                Hi {customerName}, your refund has been processed successfully.
              </Text>
            </div>

            {/* Amount highlight */}
            <Section style={{ backgroundColor: '#f4ffe6', borderRadius: 12, padding: '20px 24px', textAlign: 'center', marginBottom: 24, border: '1px solid #e8ede2' }}>
              <Text style={{ fontSize: 36, fontWeight: 900, color: '#4a8f00', margin: '0 0 4px' }}>
                {amount}
              </Text>
              <Text style={{ fontSize: 12, color: '#8a9e78', margin: 0 }}>
                Full refund â€” {plan} plan
              </Text>
            </Section>

            {/* Details table */}
            <Section style={{ backgroundColor: '#fafcf8', borderRadius: 12, padding: '16px 20px', marginBottom: 24, border: '1px solid #e8ede2' }}>
              {[
                { label: 'Invoice',      value: invoice       },
                { label: 'Plan',         value: plan          },
                { label: 'Refund date',  value: refundDate    },
                { label: 'Reason',       value: reason        },
                { label: 'Account',      value: customerEmail },
              ].map((row, i) => (
                <Row key={i} style={{ marginBottom: i < 4 ? 10 : 0 }}>
                  <Column style={{ width: '40%' }}>
                    <Text style={{ fontSize: 11, fontWeight: 700, color: '#8a9e78', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {row.label}
                    </Text>
                  </Column>
                  <Column>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: '#0a0d08', margin: 0 }}>
                      {row.value}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            {/* Timeline note */}
            <Section style={{ backgroundColor: 'rgba(217,119,6,0.06)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, border: '1px solid rgba(217,119,6,0.2)' }}>
              <Text style={{ fontSize: 12, color: '#d97706', margin: 0, fontWeight: 600 }}>
                â± Please allow 5â€“10 business days for the refund to appear in your account, depending on your bank or payment provider.
              </Text>
            </Section>

            {/* Message */}
            <Text style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6, margin: '0 0 24px' }}>
              Your {plan} plan has been downgraded to the Free tier. You can continue using Riazify with the free plan, or upgrade again at any time.
            </Text>

            {/* CTA */}
            <Section style={{ textAlign: 'center', marginBottom: 24 }}>
              <a href="https://xceptionalriazebaysellertoolreazify.vercel.app/pricing"
                 style={{
                   display: 'inline-block', backgroundColor: '#0a0d08',
                   color: '#8fff00', padding: '12px 28px', borderRadius: 12,
                   fontWeight: 900, fontSize: 13, textDecoration: 'none',
                 }}>
                View Pricing Plans â†’
              </a>
            </Section>

            <Hr style={{ borderColor: '#e8ede2', margin: '0 0 20px' }} />

            {/* Footer */}
            <Text style={{ fontSize: 11, color: '#8a9e78', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
              Questions? Reply to this email or contact us at{' '}
              <a href="mailto:support@riazify.com" style={{ color: '#4a8f00' }}>support@riazify.com</a>
              <br />
              Riazify Â· eBay Seller Intelligence Platform
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
