import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      colors: {
        black: '#000000',
        white: '#ffffff',
        charcoal: '#1a1a1a',
        'grey-dark': '#2d2d2d',
        'grey-mid': '#666666',
        'grey-light': '#a0a0a0',
        'grey-faint': '#f0f0f0',
        'red-accent': '#cc0000',
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}

export default config
