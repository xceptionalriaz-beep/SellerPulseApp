import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Core Brand ──────────────────────────────────────────────────────
        primary: '#7530fb',
        'primary-hover': '#6020e0',
        'primary-light': '#f3eeff',
        accent: '#b8fa33',
        'accent-hover': '#a3e635',
        dark: '#1e1535',
        'dark-hover': '#2d1f4e',

        // ── Backgrounds ─────────────────────────────────────────────────────
        'bg-app': '#f8f7ff',
        'bg-white': '#ffffff',
        'bg-tint': '#f3eeff',

        // ── Legacy aliases (keeps old code working) ──────────────────────────
        lime: '#b8fa33',
        limeDeep: '#7530fb',
        limeTint: '#f3eeff',
        limeMuted: '#a89cc8',
        surface: '#ffffff',
        bg: '#f8f7ff',
        border: '#ede9fe',
        admindark: '#1e1535',

        // ── Text ────────────────────────────────────────────────────────────
        'text-primary': '#1f1d2e',
        'text-secondary': '#6b7280',
        'text-muted': '#9ca3af',
        muted: '#9ca3af',

        // ── Borders ─────────────────────────────────────────────────────────
        'border-input': '#e5e0f5',
        'border-focus': '#7530fb',

        // ── Status ──────────────────────────────────────────────────────────
        success: '#16a34a',
        'success-bg': '#dcfce7',
        warning: '#d97706',
        'warning-bg': '#fef3c7',
        danger: '#ef4444',
        'danger-bg': '#fee2e2',
        info: '#0ea5e9',
        'info-bg': '#e0f2fe',

        // ── Risk levels ─────────────────────────────────────────────────────
        risk: {
          high: '#b91c1c',
          highBg: '#fee2e2',
          highText: '#b91c1c',
          medium: '#92400e',
          medBg: '#fef3c7',
          medText: '#92400e',
          low: '#166534',
          lowBg: '#dcfce7',
          lowText: '#166534',
        },

        // ── Sidebar ─────────────────────────────────────────────────────────
        sidebar: {
          bg: '#1e1535',
          activeBg: '#2d1f4e',
          text: '#a89cc8',
          active: '#ffffff',
          indicator: '#b8fa33',
        },
      },

      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },

      boxShadow: {
        // New violet shadows
        primary: '0 0 20px rgba(117, 48, 251, 0.3)',
        primarySm: '0 0 10px rgba(117, 48, 251, 0.2)',
        primaryGlow: '0 0 40px rgba(117, 48, 251, 0.4)',
        card: '0 1px 4px rgba(117, 48, 251, 0.06)',
        cardHover: '0 4px 20px rgba(117, 48, 251, 0.12)',
        panel: '0 8px 32px rgba(117, 48, 251, 0.10)',
        // Legacy aliases
        lime: '0 0 20px rgba(117, 48, 251, 0.3)',
        limeSm: '0 0 10px rgba(117, 48, 251, 0.2)',
        limeGlow: '0 0 40px rgba(117, 48, 251, 0.4)',
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-primary': 'pulsePrimary 2s infinite',
        'pulse-lime': 'pulsePrimary 2s infinite',  // legacy alias
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulsePrimary: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(117, 48, 251, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(117, 48, 251, 0.5)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },

      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #7530fb 0%, #6020e0 100%)',
        'accent-gradient': 'linear-gradient(135deg, #b8fa33 0%, #a3e635 100%)',
        'brand-gradient': 'linear-gradient(135deg, #7530fb 0%, #b8fa33 100%)',
        'dark-gradient': 'linear-gradient(135deg, #1e1535 0%, #2d1f4e 100%)',
        'surface-gradient': 'linear-gradient(180deg, #ffffff 0%, #f8f7ff 100%)',
        // Legacy aliases
        'lime-gradient': 'linear-gradient(135deg, #7530fb 0%, #b8fa33 100%)',
      },

      spacing: {
        'sidebar': '60px',
        'sidebar-expanded': '240px',
      },

      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        '*:focus': {
          outline: 'none !important',
          'box-shadow': 'none !important',
        },
        '*:focus-visible': {
          outline: 'none !important',
          'box-shadow': 'none !important',
        },
      })
    })
  ],
}

export default config
