'use client'
// components/admin/settings-tabs/CareerEmailTemplates.tsx
import React, { useState } from 'react'
import { X, Mail, ChevronDown } from 'lucide-react'

const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#1a2410',
  border:   '#e8ede2',
  muted:    '#8a9e78',
  bg:       '#f7f9f5',
  surface:  '#ffffff',
  red:      '#b91c1c',
  redBg:    '#fef2f2',
}

export interface EmailTemplate {
  id:      string
  label:   string
  subject: (name: string, role: string) => string
  body:    (name: string, role: string) => string
  color:   string
  bg:      string
  border:  string
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id:      'received',
    label:   'Application Received',
    color:   '#1d4ed8',
    bg:      '#eff6ff',
    border:  '#bfdbfe',
    subject: (name: string, role: string) => `We received your application — ${role}`,
    body: (name, role) => `Hi ${name},

Thank you for applying for the ${role} position at Riazify.

We have received your application and our team will review it carefully. We aim to get back to all applicants within 5 business days.

In the meantime, feel free to learn more about us at https://riazify.com.

Best regards,
The Riazify Team
careers@riazify.com`,
  },
  {
    id:      'reviewing',
    label:   'Under Review',
    color:   '#b45309',
    bg:      '#fffbeb',
    border:  '#fde68a',
    subject: (name: string, role: string) => `Your application is under review — ${role}`,
    body: (name, role) => `Hi ${name},

We wanted to let you know that your application for the ${role} position is currently being reviewed by our team.

We are taking our time to carefully consider all candidates and will be in touch with you soon.

Thank you for your patience.

Best regards,
The Riazify Team
careers@riazify.com`,
  },
  {
    id:      'invite',
    label:   'Invite to Call',
    color:   '#15803d',
    bg:      '#f0fdf4',
    border:  '#bbf7d0',
    subject: (name: string, role: string) => `We'd love to chat — ${role} at Riazify`,
    body: (name, role) => `Hi ${name},

Great news! After reviewing your application for the ${role} position, we would love to schedule a quick intro call to learn more about you and tell you more about Riazify.

The call will be around 20-30 minutes and completely informal. Just a chance for us to get to know each other.

Please reply to this email with your availability over the next few days and we will get something scheduled.

Looking forward to speaking with you!

Best regards,
The Riazify Team
careers@riazify.com`,
  },
  {
    id:      'shortlisted',
    label:   'Shortlisted',
    color:   '#4a8f00',
    bg:      '#f4ffe6',
    border:  '#8fff00',
    subject: (name: string, role: string) => `You have been shortlisted — ${role} at Riazify`,
    body: (name, role) => `Hi ${name},

We are excited to let you know that you have been shortlisted for the ${role} position at Riazify!

Your background and experience stood out to us and we are very impressed with your application. We will be in touch shortly with the next steps in our hiring process.

Thank you for your interest in joining our team.

Best regards,
The Riazify Team
careers@riazify.com`,
  },
  {
    id:      'rejected',
    label:   'Not Moving Forward',
    color:   '#b91c1c',
    bg:      '#fef2f2',
    border:  '#fecaca',
    subject: (name: string, role: string) => `Your application for ${role} at Riazify`,
    body: (name, role) => `Hi ${name},

Thank you for taking the time to apply for the ${role} position at Riazify and for your interest in joining our team.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs. This was a difficult decision as we received many strong applications.

We genuinely appreciate the time you invested in your application and encourage you to apply again in the future as we grow our team.

We wish you all the best in your job search.

Kind regards,
The Riazify Team
careers@riazify.com`,
  },
  {
    id:      'hired',
    label:   'Offer Letter',
    color:   '#4a8f00',
    bg:      '#f4ffe6',
    border:  '#8fff00',
    subject: (name: string, role: string) => `Job Offer — ${role} at Riazify`,
    body: (name, role) => `Hi ${name},

We are thrilled to offer you the ${role} position at Riazify!

We were very impressed throughout our hiring process and we believe you will be a fantastic addition to our team. We would love to have you on board.

Please reply to this email to confirm your acceptance and we will send over the formal offer letter with all the details including start date, compensation and next steps.

Welcome to the Riazify family!

Best regards,
The Riazify Team
careers@riazify.com`,
  },
]

interface Props {
  applicantName:  string
  applicantEmail: string
  role:           string
}

export default function CareerEmailTemplates({ applicantName, applicantEmail, role }: Props) {
  const [open, setOpen]               = useState(false)
  const [selected, setSelected]       = useState<EmailTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody]       = useState('')

  function selectTemplate(t: EmailTemplate) {
    setSelected(t)
    setEditSubject(t.subject(applicantName, role))
    setEditBody(t.body(applicantName, role))
    setShowPreview(true)
    setOpen(false)
  }

  function sendEmail() {
    if (!selected) return
    window.open(
      `mailto:${applicantEmail}?subject=${encodeURIComponent(editSubject)}&body=${encodeURIComponent(editBody)}`,
      '_blank'
    )
    setShowPreview(false)
    setSelected(null)
  }

  return (
    <>
      {/* Trigger button */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button onClick={() => setOpen(o => !o)}
                style={{ height: 34, padding: '0 14px', borderRadius: 8, background: C.lime, color: C.dark, border: 'none', fontSize: 13, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Mail size={13}/> Send Email <ChevronDown size={12}/>
        </button>

        {/* Dropdown */}
        {open && (
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 999, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 220, overflow: 'hidden' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', padding: '10px 14px 6px', margin: 0 }}>Select template</p>
            {EMAIL_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => selectTemplate(t)}
                      style={{ width: '100%', padding: '9px 14px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }}/>
                <span style={{ fontSize: 13, color: C.dark, fontWeight: 500 }}>{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {showPreview && selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
             onClick={() => setShowPreview(false)}>
          <div style={{ background: C.surface, borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}
               onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: selected.color }}/>
                <p style={{ fontSize: 15, fontWeight: 900, color: C.dark, margin: 0 }}>{selected.label}</p>
              </div>
              <button onClick={() => setShowPreview(false)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} style={{ color: C.muted }}/>
              </button>
            </div>

            {/* Email preview */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* To */}
              <div style={{ background: C.bg, borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, width: 56, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '.06em' }}>To</span>
                <span style={{ fontSize: 13, color: C.dark }}>{applicantName} &lt;{applicantEmail}&gt;</span>
              </div>

              {/* Subject — editable */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: C.bg, borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, width: 56, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '.06em' }}>Subject</span>
                <input
                  type="text"
                  value={editSubject}
                  onChange={e => setEditSubject(e.target.value)}
                  style={{ flex: 1, fontSize: 13, color: C.dark, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              {/* Body — editable */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Message</span>
                  <button onClick={() => { if (selected) setEditBody(selected.body(applicantName, role)) }}
                          style={{ fontSize: 11, color: C.limeDeep, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Reset to template
                  </button>
                </div>
                <textarea
                  value={editBody}
                  onChange={e => setEditBody(e.target.value)}
                  rows={12}
                  style={{ width: '100%', fontSize: 13, color: C.dark, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', outline: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPreview(false)}
                      style={{ height: 36, padding: '0 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={sendEmail}
                      style={{ height: 36, padding: '0 20px', borderRadius: 8, border: 'none', background: C.lime, color: C.dark, fontSize: 13, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={14}/> Open in email client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)}/>
      )}
    </>
  )
}