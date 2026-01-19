import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // G2 Primary Colors
        rorange: {
          DEFAULT: '#FF492C',
          dark: '#B21800',
          light: '#FF7761',
        },
        yellow: {
          DEFAULT: '#FFC800',
          dark: '#CCA000',
          light: '#FFD747',
        },
        green: {
          DEFAULT: '#27D3BC',
          dark: '#177D6F',
          light: '#5BE1CF',
        },
        blue: {
          DEFAULT: '#0073F5',
          dark: '#005BC2',
          light: '#2E90FF',
        },
        purple: {
          DEFAULT: '#5746B2',
          dark: '#45388F',
          light: '#7769C4',
        },
        navy: {
          DEFAULT: '#062846',
        },
        // Extended Gray Scale
        gray: {
          900: '#2F2E33',
          800: '#4C4B53',
          700: '#6F6D78',
          600: '#898792',
          500: '#B0AFB6',
          400: '#CACACE',
          300: '#DFDFE2',
          200: '#F2F2F3',
        }
      },
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
      },
      fontSize: {
        'headline1': ['56px', { lineHeight: '64px', letterSpacing: '0px' }],
        'headline2': ['44px', { lineHeight: '52px', letterSpacing: '0px' }],
        'headline3': ['36px', { lineHeight: '44px', letterSpacing: '0.3px' }],
        'headline4': ['32px', { lineHeight: '40px', letterSpacing: '0.3px' }],
        'headline5': ['28px', { lineHeight: '36px', letterSpacing: '0.6px' }],
        'headline6': ['24px', { lineHeight: '32px', letterSpacing: '0.6px' }],
        'body1': ['20px', { lineHeight: '30px', letterSpacing: '0.6px' }],
        'body2': ['18px', { lineHeight: '28px', letterSpacing: '0.6px' }],
        'body3': ['16px', { lineHeight: '24px', letterSpacing: '0.6px' }],
        'eyebrow1': ['20px', { lineHeight: '30px', letterSpacing: '2px' }],
        'eyebrow2': ['16px', { lineHeight: '24px', letterSpacing: '2px' }],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      }
    },
  },
  plugins: [],
};
export default config;
