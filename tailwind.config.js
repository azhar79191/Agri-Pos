/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // === Premium Agri Brand Palette ===
        brand: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        lime: {
          400: "#a3e635",
          500: "#84cc16",
          600: "#65a30d",
        },
        gold: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        slate: {
          925: "#0b1220",
          950: "#080f1a",
          975: "#050b12",
        },
        // Dark UI surface tokens
        surface: {
          0:   "#050c14",
          50:  "#071020",
          100: "#0c1829",
          200: "#112032",
          300: "#172a3e",
          400: "#1e3448",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "3xl": "1.5rem",
        "2xl": "1rem",
        xl:   "0.875rem",
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "xs":          "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "card":        "0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.04)",
        "card-hover":  "0 8px 32px rgba(0,0,0,0.24), 0 0 0 1px rgba(16,185,129,0.12)",
        "glow-xs":     "0 0 8px rgba(16,185,129,0.2)",
        "glow-sm":     "0 0 16px rgba(16,185,129,0.28)",
        "glow":        "0 0 28px rgba(16,185,129,0.35)",
        "glow-lg":     "0 0 48px rgba(16,185,129,0.4)",
        "glow-xl":     "0 0 72px rgba(16,185,129,0.45)",
        "gold-glow":   "0 0 24px rgba(245,158,11,0.35)",
        "inner":       "inset 0 1px 3px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.04)",
        "premium":     "0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.04)",
        "premium-lg":  "0 16px 48px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.12)",
        "premium-xl":  "0 32px 80px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)",
        "sidebar":     "8px 0 40px rgba(0,0,0,0.5), inset -1px 0 0 rgba(16,185,129,0.08)",
        "header":      "0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.25)",
      },
      backgroundImage: {
        "gradient-radial":  "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":   "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-shimmer": "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
        // Sidebar
        "sidebar-gradient": "linear-gradient(160deg, #061b2e 0%, #071f35 30%, #050d1a 65%, #030810 100%)",
        // Brand mesh
        "brand-mesh": "radial-gradient(at 20% 20%, hsla(158,80%,35%,0.18) 0px, transparent 55%), radial-gradient(at 85% 5%, hsla(43,96%,56%,0.1) 0px, transparent 45%), radial-gradient(at 5% 75%, hsla(210,80%,30%,0.08) 0px, transparent 55%)",
        // Card
        "card-gradient": "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        "card-gradient-hover": "linear-gradient(145deg, rgba(16,185,129,0.07) 0%, rgba(16,185,129,0.02) 100%)",
      },
      keyframes: {
        // Accordion
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to:   { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to:   { height: "0", opacity: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%":     { opacity: "0" },
        },
        // Page transitions
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "0%":   { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%":   { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "scale-out": {
          "0%":   { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.92)" },
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(28px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%":   { opacity: "0", transform: "translateX(-28px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-up-fade": {
          "0%":   { opacity: "0", transform: "translateY(10px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        // Loaders
        "spin-ring": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // Glows & pulses
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16,185,129,0.45)" },
          "50%":       { boxShadow: "0 0 0 10px rgba(16,185,129,0)" },
        },
        "pulse-glow-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245,158,11,0.4)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(245,158,11,0)" },
        },
        "breathe": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%":       { opacity: "1",   transform: "scale(1.06)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-6px)" },
        },
        // Orbs
        "orb-drift": {
          "0%":   { transform: "translate(0, 0) scale(1)" },
          "33%":  { transform: "translate(20px, -15px) scale(1.05)" },
          "66%":  { transform: "translate(-10px, 10px) scale(0.97)" },
          "100%": { transform: "translate(0, 0) scale(1)" },
        },
        // Number count-up visual
        "count-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Dot loading
        "dot-bounce": {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%":            { transform: "scale(1)",   opacity: "1" },
        },
        // Bar chart grow
        "bar-grow": {
          "0%":   { transform: "scaleY(0)", transformOrigin: "bottom" },
          "100%": { transform: "scaleY(1)", transformOrigin: "bottom" },
        },
        // Nav highlight sweep
        "nav-sweep": {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        // Toast slide in
        "toast-in": {
          "0%":   { opacity: "0", transform: "translateX(100%) scale(0.9)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "toast-out": {
          "0%":   { opacity: "1", transform: "translateX(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateX(100%) scale(0.9)" },
        },
        // Gradient shift
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":       { backgroundPosition: "100% 50%" },
        },
        "gradient-xy": {
          "0%, 100%": { backgroundPosition: "0% 0%" },
          "25%":       { backgroundPosition: "100% 0%" },
          "50%":       { backgroundPosition: "100% 100%" },
          "75%":       { backgroundPosition: "0% 100%" },
        },
        // Scan line (barcode)
        "scan": {
          "0%":   { top: "5%" },
          "50%":  { top: "90%" },
          "100%": { top: "5%" },
        },
        // Star twinkle
        "twinkle": {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%":       { opacity: "1",   transform: "scale(1.1)" },
        },
      },
      animation: {
        // Accordion
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "caret-blink":    "caret-blink 1.25s ease-out infinite",
        // Transitions
        "fade-up":        "fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both",
        "fade-down":      "fade-down 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":        "fade-in 0.3s ease both",
        "fade-out":       "fade-out 0.25s ease both",
        "scale-in":       "scale-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "scale-out":      "scale-out 0.25s ease both",
        "slide-right":    "slide-in-right 0.38s cubic-bezier(0.16,1,0.3,1) both",
        "slide-left":     "slide-in-left 0.38s cubic-bezier(0.16,1,0.3,1) both",
        "slide-up-fade":  "slide-up-fade 0.3s cubic-bezier(0.16,1,0.3,1) both",
        // Loaders
        "shimmer":        "shimmer 1.8s infinite linear",
        "spin":           "spin-ring 0.8s linear infinite",
        "dot-1":          "dot-bounce 1.2s ease-in-out 0s infinite",
        "dot-2":          "dot-bounce 1.2s ease-in-out 0.2s infinite",
        "dot-3":          "dot-bounce 1.2s ease-in-out 0.4s infinite",
        // Decorative
        "pulse-glow":      "pulse-glow 2.5s ease-in-out infinite",
        "pulse-glow-gold": "pulse-glow-gold 2.5s ease-in-out infinite",
        "breathe":         "breathe 3s ease-in-out infinite",
        "float":           "float 4s ease-in-out infinite",
        "orb-drift":       "orb-drift 8s ease-in-out infinite",
        "bar-grow":        "bar-grow 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "count-in":        "count-in 0.4s ease both",
        "gradient-x":      "gradient-x 4s ease infinite",
        "gradient-xy":     "gradient-xy 6s ease infinite",
        "scan":            "scan 2.2s ease-in-out infinite",
        "twinkle":         "twinkle 2s ease-in-out infinite",
        // Toasts
        "toast-in":        "toast-in 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "toast-out":       "toast-out 0.3s ease both",
      },
      transitionTimingFunction: {
        "spring":    "cubic-bezier(0.16, 1, 0.3, 1)",
        "spring-sm": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-in-expo":  "cubic-bezier(0.7, 0, 0.84, 0)",
      },
      backdropBlur: {
        xs: "2px",
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "7.5": "1.875rem",
        "13":  "3.25rem",
        "15":  "3.75rem",
        "18":  "4.5rem",
        "22":  "5.5rem",
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
        "3xs": ["0.55rem", { lineHeight: "0.85rem" }],
      },
      zIndex: {
        "1": "1",
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
        "9999": "9999",
        "10000": "10000",
        "99999": "99999",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
