import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ["class"],
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}'
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
        heading: ["Fredoka", "Nunito", "sans-serif"],
        display: ["Quicksand", "Nunito", "sans-serif"],
        mono: [
          "monospace"
        ]
      },
      colors: {
        // Nebu color palette - Juguetona y vibrante
        text: 'var(--color-text)',
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        gold: 'var(--color-gold)',
        secondary: 'var(--color-secondary)',
        muted: 'var(--color-muted)',
        surface: 'var(--color-surface)',
        bg: 'var(--color-bg)',
        yellow: 'var(--color-yellow)',
        
        // Color de fondo cálido Nebu
        'nebu-bg': '#FFF7F0', // rgb(255, 247, 240)
        
        // Shadcn/ui required colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { "0%": { opacity: "0", transform: "translateY(-10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-out": { "0%": { opacity: "1", transform: "translateY(0)" }, "100%": { opacity: "0", transform: "translateY(-10px)" } },
        "slide-in": { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(0)" } },
        "scale-in": { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        "scrollHorizontal": { "0%": { transform: "translateX(100%)" }, "100%": { transform: "translateX(-100%)" } },
        scrollUp: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        scrollDown: {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0%)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "scroll-horizontal": "scrollHorizontal 10s linear infinite",
        "scroll-down": "scrollDown 15s linear infinite",
        "scroll-up": "scrollUp 15s linear infinite",
        "animate-scroll-up": "scrollUp var(--animation-duration, 30s) linear infinite",
        "animate-scroll-down": "scrollDown var(--animation-duration, 30s) linear infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: {addUtilities: any}) {
      const newUtilities = {
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        }
      }
      addUtilities(newUtilities)
    }
  ]
};

export default config; 