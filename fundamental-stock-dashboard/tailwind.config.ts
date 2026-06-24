import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0b0d',
        card: '#14161a',
        border: '#262a31',
        accent: '#4da3ff',
        muted: '#9da7b4',
        good: '#39d98a',
        bad: '#ff6b6b',
        amber: '#f5b14c'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        card: '0 10px 30px rgba(0,0,0,0.35)'
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        rise: 'rise 450ms ease-out both'
      }
    }
  },
  plugins: []
} satisfies Config;
