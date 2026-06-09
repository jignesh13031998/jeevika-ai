/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas:    '#F7F2EE',
        surface:   '#FFFFFF',
        'surface-2': '#FBF8F5',
        'surface-3': '#F3EDE8',
        border:    '#E2D5CC',
        'border-strong': '#C9B8AD',
        'text-primary':   '#1A0A0D',
        'text-secondary': '#5C3D45',
        'text-muted':     '#9E7A82',
        'header-bg':      '#8E1B2E',
        'accent-primary':   '#8E1B2E',
        'accent-secondary': '#A67B2A',
        'accent-gold':      '#C9A86A',
        'prio-critical': '#C41E3A',
        'prio-high':     '#D97706',
        'prio-medium':   '#0369A1',
        'prio-low':      '#059669',
        'prio-opp':      '#7C3AED',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 1px 4px rgba(142,27,46,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        hover: '0 4px 20px rgba(142,27,46,0.12), 0 8px 32px rgba(0,0,0,0.08)',
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.25' },
        },
      },
    },
  },
  plugins: [],
}
