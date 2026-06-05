import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf7f5',
          100: '#f3eeea',
          200: '#e8ddd4',
          300: '#d9c7b8',
          400: '#c8ab97',
          500: '#ba937d',
          600: '#ad8070',
          700: '#906b5e',
          800: '#765950',
          900: '#614a43',
          950: '#332622',
        },
        accent: {
          50: '#f5f7f6',
          100: '#dfe5e2',
          200: '#becbc5',
          300: '#95aaa1',
          400: '#6f8b80',
          500: '#557066',
          600: '#435951',
          700: '#384943',
          800: '#2f3c37',
          900: '#293430',
          950: '#151c1a',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        display: ['"Noto Serif SC"', 'Georgia', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
