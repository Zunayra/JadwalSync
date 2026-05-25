import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        unpad: {
          yellow: '#F4A21C',
          'yellow-hover': '#E09610',
          red: '#DF1923',
          'red-hover': '#C01520',
          darkred: '#A0112B',
        },
        surface: {
          DEFAULT: '#F9FAFB',
          elevated: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#1E1E1E',
          muted: '#6B7280',
          subtle: '#9CA3AF',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
        float: '0 4px 16px rgba(0,0,0,0.10), 0 16px 48px rgba(0,0,0,0.08)',
        'yellow-glow': '0 4px 12px rgba(244,162,28,0.35)',
      },
    },
  },
  plugins: [],
}

export default config
