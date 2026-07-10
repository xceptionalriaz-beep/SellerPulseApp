'use client'
// components/landing/ApplyModal.tsx
import React, { useState } from 'react'
import { X, Check, ArrowRight } from 'lucide-react'
import ProDropdown from '@/components/ui/ProDropdown'

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


// Country + State/Province data
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'OTHER', name: 'Other' },
]

const STATES: Record<string, { code: string; name: string }[]> = {
  US: [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  ],
  CA: [
    { code: 'AB', name: 'Alberta' }, { code: 'BC', name: 'British Columbia' }, { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' }, { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NS', name: 'Nova Scotia' }, { code: 'ON', name: 'Ontario' }, { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' }, { code: 'SK', name: 'Saskatchewan' },
  ],
  AU: [
    { code: 'ACT', name: 'Australian Capital Territory' }, { code: 'NSW', name: 'New South Wales' },
    { code: 'NT', name: 'Northern Territory' }, { code: 'QLD', name: 'Queensland' },
    { code: 'SA', name: 'South Australia' }, { code: 'TAS', name: 'Tasmania' },
    { code: 'VIC', name: 'Victoria' }, { code: 'WA', name: 'Western Australia' },
  ],
  GB: [
    { code: 'ENG', name: 'England' }, { code: 'SCT', name: 'Scotland' },
    { code: 'WLS', name: 'Wales' }, { code: 'NIR', name: 'Northern Ireland' },
  ],
  IN: [
    { code: 'AP', name: 'Andhra Pradesh' }, { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'AS', name: 'Assam' }, { code: 'BR', name: 'Bihar' }, { code: 'CT', name: 'Chhattisgarh' },
    { code: 'GA', name: 'Goa' }, { code: 'GJ', name: 'Gujarat' }, { code: 'HR', name: 'Haryana' },
    { code: 'HP', name: 'Himachal Pradesh' }, { code: 'JK', name: 'Jammu and Kashmir' },
    { code: 'JH', name: 'Jharkhand' }, { code: 'KA', name: 'Karnataka' }, { code: 'KL', name: 'Kerala' },
    { code: 'MP', name: 'Madhya Pradesh' }, { code: 'MH', name: 'Maharashtra' }, { code: 'MN', name: 'Manipur' },
    { code: 'ML', name: 'Meghalaya' }, { code: 'MZ', name: 'Mizoram' }, { code: 'NL', name: 'Nagaland' },
    { code: 'OR', name: 'Odisha' }, { code: 'PB', name: 'Punjab' }, { code: 'RJ', name: 'Rajasthan' },
    { code: 'SK', name: 'Sikkim' }, { code: 'TN', name: 'Tamil Nadu' }, { code: 'TG', name: 'Telangana' },
    { code: 'TR', name: 'Tripura' }, { code: 'UP', name: 'Uttar Pradesh' }, { code: 'UT', name: 'Uttarakhand' },
    { code: 'WB', name: 'West Bengal' },
  ],
  PK: [
    { code: 'BA', name: 'Balochistan' }, { code: 'GB', name: 'Gilgit-Baltistan' },
    { code: 'IS', name: 'Islamabad Capital Territory' }, { code: 'KP', name: 'Khyber Pakhtunkhwa' },
    { code: 'PB', name: 'Punjab' }, { code: 'SD', name: 'Sindh' },
  ],
  BD: [
    { code: 'BAR', name: 'Barisal' }, { code: 'CHI', name: 'Chittagong' }, { code: 'DHA', name: 'Dhaka' },
    { code: 'KHU', name: 'Khulna' }, { code: 'MYM', name: 'Mymensingh' }, { code: 'RAJ', name: 'Rajshahi' },
    { code: 'RAN', name: 'Rangpur' }, { code: 'SYL', name: 'Sylhet' },
  ],
  BR: [
    { code: 'AC', name: 'Acre' }, { code: 'AL', name: 'Alagoas' }, { code: 'AM', name: 'Amazonas' },
    { code: 'BA', name: 'Bahia' }, { code: 'CE', name: 'Ceará' }, { code: 'DF', name: 'Federal District' },
    { code: 'ES', name: 'Espírito Santo' }, { code: 'GO', name: 'Goiás' }, { code: 'MA', name: 'Maranhão' },
    { code: 'MG', name: 'Minas Gerais' }, { code: 'PA', name: 'Pará' }, { code: 'PR', name: 'Paraná' },
    { code: 'RJ', name: 'Rio de Janeiro' }, { code: 'RS', name: 'Rio Grande do Sul' },
    { code: 'SC', name: 'Santa Catarina' }, { code: 'SP', name: 'São Paulo' },
  ],
}

const CITY_PLACEHOLDERS: Record<string, string> = {
  US: 'New York', GB: 'London', CA: 'Toronto', AU: 'Sydney',
  DE: 'Berlin', FR: 'Paris', IN: 'Mumbai', PK: 'Karachi',
  BD: 'Dhaka', NG: 'Lagos', ZA: 'Cape Town', BR: 'São Paulo',
  MX: 'Mexico City', ES: 'Madrid', IT: 'Rome', NL: 'Amsterdam',
  SE: 'Stockholm', NO: 'Oslo', DK: 'Copenhagen', FI: 'Helsinki',
  PL: 'Warsaw', PT: 'Lisbon', SG: 'Singapore', MY: 'Kuala Lumpur',
  PH: 'Manila', ID: 'Jakarta', AE: 'Dubai', SA: 'Riyadh',
  EG: 'Cairo', KE: 'Nairobi', GH: 'Accra', NZ: 'Auckland',
  JP: 'Tokyo', KR: 'Seoul',
}

const POSTAL_PLACEHOLDERS: Record<string, string> = {
  US: '10001', GB: 'SW1A 1AA', CA: 'M5V 3A8', AU: '2000',
  DE: '10115', FR: '75001', IN: '400001', PK: '75500',
  BD: '1000', NG: '100001', ZA: '8001', BR: '01310-100',
  MX: '06600', ES: '28001', IT: '00100', NL: '1011 AB',
  SE: '111 20', NO: '0150', DK: '1050', FI: '00100',
  PL: '00-001', PT: '1000-001', SG: '018956', MY: '50000',
  PH: '1000', ID: '10110', AE: '00000', SA: '11564',
  EG: '11511', KE: '00100', GH: 'GA-144', NZ: '1010',
  JP: '100-0001', KR: '03000',
}

function getStateLabel(countryCode: string): string {
  const labels: Record<string, string> = {
    US: 'State', CA: 'Province', AU: 'State/Territory',
    GB: 'Country/Region', IN: 'State', PK: 'Province',
    BD: 'Division', BR: 'State',
  }
  return labels[countryCode] ?? 'State / Region'
}

const EXPERIENCE_OPTIONS = [
  { val: '0-1',  label: 'Less than 1 year' },
  { val: '1-2',  label: '1-2 years'        },
  { val: '3-5',  label: '3-5 years'        },
  { val: '5-10', label: '5-10 years'       },
  { val: '10+',  label: '10+ years'        },
]

const EMPLOYMENT_OPTIONS = [
  { val: 'full-time',  label: 'Full-time'  },
  { val: 'part-time',  label: 'Part-time'  },
  { val: 'contract',   label: 'Contract'   },
  { val: 'freelance',  label: 'Freelance'  },
]

const SOURCE_OPTIONS = [
  { val: 'linkedin',   label: 'LinkedIn'        },
  { val: 'twitter',    label: 'Twitter / X'     },
  { val: 'google',     label: 'Google Search'   },
  { val: 'friend',     label: 'Friend / Referral'},
  { val: 'ebay',       label: 'eBay Community'  },
  { val: 'blog',       label: 'Blog / Article'  },
  { val: 'other',      label: 'Other'           },
]

const START_OPTIONS = [
  { val: 'immediately',  label: 'Immediately'    },
  { val: '2weeks',       label: 'In 2 weeks'     },
  { val: '1month',       label: 'In 1 month'     },
  { val: '2months',      label: 'In 2 months'    },
  { val: '3months+',     label: '3+ months'      },
]

interface Props {
  role: string
  onClose: () => void
}

interface FormData {
  name:           string
  email:          string
  phone:          string
  address1:       string
  address2:       string
  city:           string
  state:          string
  postalCode:     string
  country:        string
  linkedin:       string
  cv:             string
  currentRole:    string
  experience:     string
  employmentType: string
  whyRiazify:     string
  about:          string
  startDate:      string
  source:         string
}

const emptyForm = (): FormData => ({
  name: '', email: '', phone: '',
  address1: '', address2: '', city: '', state: '', postalCode: '', country: '',
  linkedin: '', cv: '', currentRole: '', experience: '', employmentType: '',
  whyRiazify: '', about: '', startDate: '', source: '',
})

export default function ApplyModal({ role, onClose }: Props) {
  const [form, setForm]     = useState<FormData>(emptyForm())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep]     = useState<1 | 2>(1)

  function set(key: keyof FormData, val: string) {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!form.name.trim())     e.name     = 'Name is required'
    if (!form.email.trim())    e.email    = 'Email is required'
    else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email.trim())) e.email = 'Enter a valid email'
    if (!form.phone.trim())    e.phone    = 'Phone number is required'
    if (!form.address1.trim()) e.address1 = 'Address is required'
    if (!form.city.trim())     e.city     = 'City is required'
    if (!form.country)         e.country  = 'Country is required'
    if (STATES[form.country]?.length > 0 && !form.state) e.state = 'Please select a state/region'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e: Record<string, string> = {}
    if (!form.currentRole.trim()) e.currentRole = 'Current role is required'
    if (!form.experience)         e.experience  = 'Please select experience'
    if (!form.whyRiazify.trim())  e.whyRiazify  = 'Please tell us why you want to join'
    if (!form.about.trim())       e.about       = 'Please tell us about yourself'
    if (!form.startDate)          e.startDate   = 'Please select when you can start'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validateStep1()) setStep(2)
  }

  async function handleSubmit() {
    if (!validateStep2()) return
    setLoading(true)
    try {
      const fullAddress = [form.address1, form.address2, form.city, form.state, form.postalCode, COUNTRIES.find(c => c.code === form.country)?.name].filter(Boolean).join(', ')

      const message = `
Role Applied: ${role}

--- PERSONAL INFORMATION ---
Name: ${form.name}
Email: ${form.email}
Phone: ${form.phone}
Address: ${fullAddress}

--- PROFESSIONAL LINKS ---
LinkedIn: ${form.linkedin || 'Not provided'}
CV/Resume: ${form.cv || 'Not provided'}

--- EXPERIENCE ---
Current Role: ${form.currentRole}
Years of Experience: ${EXPERIENCE_OPTIONS.find(o => o.val === form.experience)?.label}
Employment Type Preference: ${EMPLOYMENT_OPTIONS.find(o => o.val === form.employmentType)?.label ?? 'Not specified'}
Available to Start: ${START_OPTIONS.find(o => o.val === form.startDate)?.label}
How they heard about us: ${SOURCE_OPTIONS.find(o => o.val === form.source)?.label ?? 'Not specified'}

--- APPLICATION QUESTIONS ---
Why Riazify?
${form.whyRiazify}

About Yourself:
${form.about}
      `.trim()

      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    form.name.trim(),
          email:   form.email.trim(),
          subject: `Job Application: ${role}`,
          type:    'question',
          message,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setSuccess(true)
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    }
    setLoading(false)
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%', height: 42, padding: '0 14px', borderRadius: 10,
    border: `1px solid ${hasError ? C.red : C.border}`, fontSize: 14,
    color: C.dark, outline: 'none', fontFamily: 'Inter, sans-serif',
    background: C.surface, boxSizing: 'border-box',
  })

  const textareaStyle = (hasError?: boolean): React.CSSProperties => ({
    ...inputStyle(hasError), height: 'auto', padding: '12px 14px', resize: 'vertical' as const,
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.surface, borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '92vh', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, background: C.surface, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 900, color: C.dark, margin: 0 }}>Apply for this role</p>
            <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{role}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {[1, 2].map(s => (
                <div key={s} style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                  background: step >= s ? C.lime : C.bg,
                  color: step >= s ? C.dark : C.muted,
                  border: `1px solid ${step >= s ? C.lime : C.border}` }}>
                  {s}
                </div>
              ))}
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={15} style={{ color: C.muted }}/>
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.limeTint, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={32} style={{ color: C.limeDeep }}/>
              </div>
              <p style={{ fontSize: 20, fontWeight: 900, color: C.dark, margin: '0 0 8px' }}>Application sent!</p>
              <p style={{ fontSize: 14, color: C.muted, margin: '0 0 24px' }}>Thanks {form.name.split(' ')[0]}! We'll review your application and get back to you within 5 business days.</p>
              <button onClick={onClose} style={{ height: 40, padding: '0 20px', borderRadius: 100, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 13, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          ) : step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: '0 0 4px', paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                Step 1 — Personal information
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Full name <span style={{ color: C.red }}>*</span></label>
                  <input type="text" placeholder="John Smith" value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle(!!errors.name)}/>
                  {errors.name && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.name}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Email address <span style={{ color: C.red }}>*</span></label>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle(!!errors.email)}/>
                  {errors.email && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.email}</p>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Phone number <span style={{ color: C.red }}>*</span></label>
                  <input type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={e => set('phone', e.target.value)} style={inputStyle(!!errors.phone)}/>
                  {errors.phone && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.phone}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Country <span style={{ color: C.red }}>*</span></label>
                  <ProDropdown
                    prefix=""
                    currentValue={form.country || 'select'}
                    options={[{ val: 'select', label: 'Select country...', enabled: false }, ...COUNTRIES.map(c => ({ val: c.code, label: c.name, enabled: true }))]}
                    onChanged={v => { if (v !== 'select') { set('country', v); set('state', '') } }}
                    width="full"
                    maxItems={8}
                  />
                  {errors.country && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.country}</p>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Address line 1 <span style={{ color: C.red }}>*</span></label>
                  <input type="text" placeholder="123 Main Street" value={form.address1} onChange={e => set('address1', e.target.value)} style={inputStyle(!!errors.address1)}/>
                  {errors.address1 && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.address1}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Address line 2 <span style={{ fontSize: 10, fontWeight: 400 }}>(optional)</span></label>
                  <input type="text" placeholder="Apartment, suite, unit etc." value={form.address2} onChange={e => set('address2', e.target.value)} style={inputStyle()}/>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>City <span style={{ color: C.red }}>*</span></label>
                  <input type="text" placeholder={CITY_PLACEHOLDERS[form.country] ?? 'Your city'} value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle(!!errors.city)}/>
                  {errors.city && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.city}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    {form.country && STATES[form.country]?.length > 0 ? `${getStateLabel(form.country)} ` : 'State / Region '}
                    {form.country && STATES[form.country]?.length > 0 && <span style={{ color: C.red }}>*</span>}
                  </label>
                  {form.country && STATES[form.country]?.length > 0 ? (
                    <>
                      <ProDropdown
                        prefix=""
                        currentValue={form.state || 'select'}
                        options={[{ val: 'select', label: `Select...`, enabled: false }, ...STATES[form.country].map(s => ({ val: s.code, label: s.name, enabled: true }))]}
                        onChanged={v => { if (v !== 'select') set('state', v) }}
                        width="full"
                        maxItems={8}
                      />
                      {errors.state && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.state}</p>}
                    </>
                  ) : (
                    <input type="text" placeholder="State / Region" value={form.state} onChange={e => set('state', e.target.value)} style={inputStyle()}/>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Postal code</label>
                  <input type="text" placeholder={POSTAL_PLACEHOLDERS[form.country] ?? 'Postal code'} value={form.postalCode} onChange={e => set('postalCode', e.target.value)} style={inputStyle()}/>
                </div>
              </div>

              <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: '8px 0 4px', paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                Professional links
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>LinkedIn profile URL</label>
                <input type="url" placeholder="https://linkedin.com/in/yourname" value={form.linkedin} onChange={e => set('linkedin', e.target.value)} style={inputStyle(!!errors.linkedin)}/>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>CV / Resume link</label>
                <input type="url" placeholder="https://drive.google.com/..." value={form.cv} onChange={e => set('cv', e.target.value)} style={inputStyle(!!errors.cv)}/>
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Google Drive, Dropbox, or any public link</p>
              </div>

              <button onClick={handleNext}
                      style={{ height: 46, borderRadius: 12, border: 'none', background: C.lime, color: C.dark, fontSize: 14, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                Continue <ArrowRight size={16}/>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: '0 0 4px', paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                Step 2 — Your experience
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Role</label>
                <input type="text" value={role} disabled style={{ ...inputStyle(), background: C.bg, color: C.muted, cursor: 'not-allowed' }}/>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Current job title / company <span style={{ color: C.red }}>*</span></label>
                  <input type="text" placeholder="Developer at Acme Inc." value={form.currentRole} onChange={e => set('currentRole', e.target.value)} style={inputStyle(!!errors.currentRole)}/>
                  {errors.currentRole && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.currentRole}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Years of experience <span style={{ color: C.red }}>*</span></label>
                  <ProDropdown
                    prefix=""
                    currentValue={form.experience || 'select'}
                    options={[{ val: 'select', label: 'Select...', enabled: false }, ...EXPERIENCE_OPTIONS.map(o => ({ val: o.val, label: o.label, enabled: true }))]}
                    onChanged={v => { if (v !== 'select') set('experience', v) }}
                    width="full"
                    maxItems={5}
                  />
                  {errors.experience && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.experience}</p>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Employment type preference</label>
                  <ProDropdown
                    prefix=""
                    currentValue={form.employmentType || 'select'}
                    options={[{ val: 'select', label: 'Select...', enabled: false }, ...EMPLOYMENT_OPTIONS.map(o => ({ val: o.val, label: o.label, enabled: true }))]}
                    onChanged={v => { if (v !== 'select') set('employmentType', v) }}
                    width="full"
                    maxItems={4}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>How did you hear about us?</label>
                  <ProDropdown
                    prefix=""
                    currentValue={form.source || 'select'}
                    options={[{ val: 'select', label: 'Select...', enabled: false }, ...SOURCE_OPTIONS.map(o => ({ val: o.val, label: o.label, enabled: true }))]}
                    onChanged={v => { if (v !== 'select') set('source', v) }}
                    width="full"
                    maxItems={7}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Why do you want to work at Riazify? <span style={{ color: C.red }}>*</span></label>
                <textarea placeholder="Tell us what excites you about Riazify and this role..."
                          value={form.whyRiazify} onChange={e => set('whyRiazify', e.target.value)} rows={4}
                          style={textareaStyle(!!errors.whyRiazify)}/>
                {errors.whyRiazify && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.whyRiazify}</p>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Tell us about yourself <span style={{ color: C.red }}>*</span></label>
                <textarea placeholder="Your background, what you've built, your biggest achievements..."
                          value={form.about} onChange={e => set('about', e.target.value)} rows={4}
                          style={textareaStyle(!!errors.about)}/>
                {errors.about && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.about}</p>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>When can you start? <span style={{ color: C.red }}>*</span></label>
                <ProDropdown
                  prefix=""
                  currentValue={form.startDate || 'select'}
                  options={[{ val: 'select', label: 'Select...', enabled: false }, ...START_OPTIONS.map(o => ({ val: o.val, label: o.label, enabled: true }))]}
                  onChanged={v => { if (v !== 'select') set('startDate', v) }}
                  width="full"
                  maxItems={5}
                />
                {errors.startDate && <p style={{ fontSize: 11, color: C.red, margin: 0 }}>{errors.startDate}</p>}
              </div>

              {errors.submit && (
                <div style={{ padding: '10px 14px', background: C.redBg, border: `1px solid ${C.red}`, borderRadius: 10 }}>
                  <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{errors.submit}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)}
                        style={{ height: 46, padding: '0 20px', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={loading}
                        style={{ flex: 1, height: 46, borderRadius: 12, border: 'none', background: loading ? C.border : C.lime, color: loading ? C.muted : C.dark, fontSize: 14, fontWeight: 900, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? 'Sending...' : <><ArrowRight size={16}/> Send application</>}
                </button>
              </div>

              <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', margin: 0 }}>
                We respond to all strong applications within 5 business days.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}