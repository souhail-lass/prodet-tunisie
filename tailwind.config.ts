import type { Config } from 'tailwindcss';

const config = {
  theme: {
    extend: {
      colors: {
        'prodet-blue': '#1B5FA7',
        'prodet-green': '#1F9C49',
        'prodet-navy': '#0D3B73',
        'prodet-sky': '#33B5F6',
        'prodet-surface': '#F4F6F8',
        'prodet-text': '#1C2B3A',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'sans-serif'],
        display: ['var(--font-plus-jakarta)', 'sans-serif'],
      },
    },
  },
} satisfies Config;

export default config;
