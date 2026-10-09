'use client'
// components/landing/Navbar.tsx
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useBrand } from '@/hooks/useBrand'
import ToolsMegaMenu from './ToolsMegaMenu'
import { ChevronDown, Menu, X } from 'lucide-react'

const T = {
  white: '#ffffff',
  border: '#e8ede2',
  carbon: '#1a2410',
  lime: '#b8fa33',
  black: '#0a0d08',
}

export default function Navbar() {
  const router = useRouter()
  const { brand } = useBrand()
  const [open, setOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToolsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setToolsOpen(false)
    }, 150)
  }

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? `1px solid ${T.border}` : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
          <img src={brand.logo_full_dark} alt={brand.brand_name} style={{ height: 32, width: 'auto' }} />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">

          {/* Tools Mega-Menu Container */}
          <div
            className="relative py-2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 text-[14px] font-medium transition-colors" style={{ color: T.carbon }}>
              Tools <ChevronDown size={14} className={`transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
            </button>

            {toolsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                {/* Hit Bridge */}
                <div className="absolute -top-3 left-0 right-0 h-5 bg-transparent" />

                {/* Integrated Mega-Menu Component */}
                <ToolsMegaMenu onItemClick={() => setToolsOpen(false)} />
              </div>
            )}
          </div>

          {['Features', 'Pricing', 'How It Works', 'Blog'].map(item => (
            <a
              key={item}
              href={item === 'Pricing' ? '/pricing' : item === 'Features' ? '/features' : `#${item.toLowerCase().replace(' ', '-')}`}
              className="text-[14px] font-medium hover:opacity-70 transition-opacity"
              style={{ color: T.carbon }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-[14px] font-semibold px-4 py-2 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: T.carbon }}
          >
            Log In
          </button>
          <button
            onClick={() => router.push('/auth/signup')}
            className="text-[14px] font-black px-5 py-2.5 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
            style={{ background: T.lime, color: T.black }}
          >
            Get Started Free →
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setOpen(s => !s)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4 border-t" style={{ background: T.white, borderColor: T.border }}>
          {['Features', 'Tools', 'Pricing', 'How It Works', 'Blog'].map(item => (
            <a
              key={item}
              href={item === 'Pricing' ? '/pricing' : item === 'Features' ? '/features' : `#${item.toLowerCase().replace(' ', '-')}`}
              className="text-[15px] font-medium py-1"
              style={{ color: T.carbon }}
            >
              {item}
            </a>
          ))}
          <button
            onClick={() => router.push('/auth/signup')}
            className="mt-2 py-3 rounded-xl font-black text-[15px]"
            style={{ background: T.lime, color: T.black }}
          >
            Get Started Free →
          </button>
        </div>
      )}
    </nav>
  )
}
