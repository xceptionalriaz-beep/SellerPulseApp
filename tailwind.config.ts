import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        lime:      '#8FFF00',
        limeDeep:  '#4A8F00',
        limeTint:  '#F4FFE6',
        limeMuted: '#D4FF80',

        // Base
        dark:      '#0A0D08',
        surface:   '#FFFFFF',
        bg:        '#F7F9F5',
        border:    '#E8EDE2',

        // Admin
        adminDark: '#0F172A',

        // Risk levels
        risk: {
          high:     '#FF0000',
          highBg:   '#FFEEEE',
          highText: '#FF0000',
          medium:   '#92400E',
          medBg:    '#FFFBEA',
          medText:  '#92400E',
          low:      '#2D6A00',
          lowBg:    '#F4FFE6',
          lowText:  '#2D6A00',
        },

        // Semantic aliases
        primary:   '#8FFF00',
        secondary: '#4A8F00',
        muted:     '#6B7280',
        accent:    '#8FFF00',
      },

      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        body:    ['var(--font-inter)', 'sans-serif'],
        sans:    ['var(--font-inter)', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      borderRadius: {
        DEFAULT: '8px',
        sm:      '4px',
        md:      '8px',
        lg:      '12px',
        xl:      '16px',
        '2xl':   '20px',
      },

      boxShadow: {
        lime:    '0 0 20px rgba(143, 255, 0, 0.3)',
        limeSm:  '0 0 10px rgba(143, 255, 0, 0.2)',
        limeGlow:'0 0 40px rgba(143, 255, 0, 0.4)',
        card:    '0 1px 3px rgba(10, 13, 8, 0.06), 0 1px 2px rgba(10, 13, 8, 0.04)',
        cardHover:'0 4px 12px rgba(10, 13, 8, 0.08), 0 2px 4px rgba(10, 13, 8, 0.06)',
        panel:   '0 8px 32px rgba(10, 13, 8, 0.12)',
      },

      animation: {
        'fade-in':      'fadeIn 0.2s ease-out',
        'slide-down':   'slideDown 0.3s ease-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'slide-right':  'slideRight 0.3s ease-out',
        'pulse-lime':   'pulseLime 2s infinite',
        'spin-slow':    'spin 3s linear infinite',
        'bounce-subtle':'bounceSubtle 1s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseLime: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(143, 255, 0, 0.2)' },
          '50%':      { boxShadow: '0 0 25px rgba(143, 255, 0, 0.5)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-3px)' },
        },
      },

      backgroundImage: {
        'lime-gradient':  'linear-gradient(135deg, #8FFF00 0%, #4A8F00 100%)',
        'dark-gradient':  'linear-gradient(135deg, #0A0D08 0%, #1a2012 100%)',
        'surface-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F7F9F5 100%)',
      },

      // Sidebar width token
      spacing: {
        'sidebar':     '60px',
        'sidebar-expanded': '240px',
      },

      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
}

export default config
