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
        nimble: {
          bg: "#F7FAFF",
          surface: "#FFFFFF",
          blue: {
            DEFAULT: "#3979E6",
            hover: "#2B68D1",
            soft: "#E5F0FF",
            light: "#F0F6FF",
          },
          mint: {
            DEFAULT: "#36A879",
            soft: "#DDF5E9",
            hover: "#2F946A",
          },
          yellow: {
            DEFAULT: "#E5A910",
            soft: "#FFE7A3",
            light: "#FFF8E7",
          },
          coral: {
            DEFAULT: "#E5634D",
            soft: "#FFB6A6",
            light: "#FFF0ED",
          },
          text: {
            primary: "#203247",
            secondary: "#64748B",
            muted: "#94A3B8",
          },
          border: {
            DEFAULT: "#E5EAF1",
            subtle: "#EFF3F8",
            focus: "#3979E6",
          },
        },
        brand: {
          50: "#E5F0FF",
          100: "#D3E4FF",
          200: "#ABC9FE",
          300: "#83ADFD",
          400: "#5B92FC",
          500: "#3979E6",
          600: "#2B68D1",
          700: "#2052AB",
          800: "#183D81",
          900: "#112C5E",
          950: "#0B1D40",
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
