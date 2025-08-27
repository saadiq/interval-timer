import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
        workout: {
          circuit: "rgb(var(--circuit) / <alpha-value>)",
          amrap: "rgb(var(--amrap) / <alpha-value>)",
          tabata: "rgb(var(--tabata) / <alpha-value>)",
          emom: "rgb(var(--emom) / <alpha-value>)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "var(--gradient-primary)",
        "gradient-secondary": "var(--gradient-secondary)",
        "gradient-accent": "var(--gradient-accent)",
      },
      fontSize: {
        '10xl': '10rem',
        '11xl': '12rem',
        '12xl': '14rem',
        '13xl': '16rem',
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-in-up": "fadeInUp 0.5s ease-in-out",
        "scale-in": "scaleIn 0.3s ease-in-out",
        "pulse-scale": "pulseScale 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseScale: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    // Warm-up and cool-down colors
    'bg-amber-300', 'bg-amber-400', 'bg-amber-500',
    // Rest period colors
    'bg-gray-300', 'bg-slate-300', 'bg-slate-400',
    // Circuit workout colors - indigo/blue palette
    'bg-indigo-400', 'bg-indigo-500', 'bg-indigo-600', 'bg-blue-400', 'bg-blue-500',
    // AMRAP workout colors - teal/cyan palette
    'bg-teal-400', 'bg-teal-500', 'bg-cyan-400',
    // Tabata workout colors - amber/orange palette
    'bg-amber-400', 'bg-amber-500', 'bg-orange-400',
    // EMOM workout colors - violet/purple palette
    'bg-violet-300', 'bg-violet-400', 'bg-purple-300',
    // Additional colors for variety
    'bg-indigo-300',
    'bg-rose-300',
    'bg-emerald-300',
    // Workout type badge colors with opacity and text
    'bg-indigo-500/20', 'text-indigo-600', 'border-indigo-500/30', 'dark:text-indigo-400',
    'bg-teal-400/20', 'text-teal-600', 'border-teal-400/30', 'dark:text-teal-400',
    'bg-amber-500/20', 'text-amber-600', 'border-amber-500/30', 'dark:text-amber-400',
    'bg-violet-400/20', 'text-violet-600', 'border-violet-400/30', 'dark:text-violet-400',
  ],
};
export default config;
