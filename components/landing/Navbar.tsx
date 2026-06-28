'use client'
// components/landing/Navbar.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity, ChevronDown, Menu, X,
  Search, BarChart2, Eye, ShoppingBag, DollarSign, Package,
} from 'lucide-react'

const T = {
  white:       '#ffffff',
  surface:     '#f7f9f5',
  border:      '#e8ede2',
  accentBorder:'rgba(143,255,0,0.35)',
  lime:        '#8fff00',
  limeDeep:    '#4a8f00',
  limeMid:     '#6bcc00',
  limeTint:    '#f4ffe6',
  limePale:    '#e8ffcc',
  carbon:      '#1a2410',
  sage:        '#8a9e78',
  black:       '#0a0d08',
}

export default function Navbar() {
  const router = useRouter()
  const [open,      setOpen]      = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [scrolled,  setScrolled]  = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const tools = [
    { icon: Search,      label: 'Product Research',  desc: 'Find winning niches fast'      },
    { icon: BarChart2,   label: 'Title Builder',      desc: 'AI-optimized eBay titles'      },
    { icon: Eye,         label: 'Competitor X-Ray',   desc: 'Scan any eBay seller'          },
    { icon: ShoppingBag, label: 'Orders Manager',     desc: 'Risk-scored order tracking'    },
    { icon: DollarSign,  label: 'Profit Calculator',  desc: 'Real-time margin analysis'     },
    { icon: Package,     label: 'Inventory Manager',  desc: 'Stock control & forecasting'   },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
         style={{
           background:     scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
           backdropFilter: scrolled ? 'blur(16px)' : 'none',
           borderBottom:   scrolled ? `1px solid ${T.border}` : 'none',
         }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.lime }}>
            <Activity size={16} style={{ color: T.black }} />
          </div>
          <span className="text-[18px] font-black tracking-tight" style={{ color: T.carbon }}>Riazify</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <button className="flex items-center gap-1 text-[14px] font-medium transition-colors" style={{ color: T.carbon }}>
              Tools <ChevronDown size={14} />
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] rounded-2xl border p-4 grid grid-cols-2 gap-2"
                   style={{ background: T.white, borderColor: T.border, boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}>
                {tools.map((t, i) => {
                  const Icon = t.icon
                  return (
                    <div key={i} onClick={() => router.push('/auth/signup')}
                         className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:opacity-80 transition-all"
                         style={{ background: T.surface }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                           style={{ background: T.limeTint }}>
                        <Icon size={14} style={{ color: T.limeDeep }} />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold" style={{ color: T.carbon }}>{t.label}</p>
                        <p className="text-[10px]" style={{ color: T.sage }}>{t.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {['Pricing', 'How It Works', 'Blog'].map(item => (
            <a key={item}
               href={item === 'Pricing' ? '/pricing' : `#${item.toLowerCase().replace(' ', '-')}`}
               className="text-[14px] font-medium hover:opacity-70 transition-opacity"
               style={{ color: T.carbon }}>{item}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => router.push('/auth/login')}
            className="text-[14px] font-semibold px-4 py-2 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: T.carbon }}>Log In</button>
          <button onClick={() => router.push('/auth/signup')}
            className="text-[14px] font-black px-5 py-2.5 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
            style={{ background: T.lime, color: T.black }}>
            Get Started Free â†’
          </button>
        </div>

        <button className="md:hidden" onClick={() => setOpen(s => !s)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4 border-t"
             style={{ background: T.white, borderColor: T.border }}>
          {['Tools', 'Pricing', 'How It Works', 'Blog'].map(item => (
            <a key={item}
               href={item === 'Pricing' ? '/pricing' : `#${item.toLowerCase().replace(' ', '-')}`}
               className="text-[15px] font-medium py-1" style={{ color: T.carbon }}>{item}</a>
          ))}
          <button onClick={() => router.push('/auth/signup')}
            className="mt-2 py-3 rounded-xl font-black text-[15px]"
            style={{ background: T.lime, color: T.black }}>
            Get Started Free â†’
          </button>
        </div>
      )}
    </nav>
  )
}
