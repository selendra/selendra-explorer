/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class", // or 'media' based on preference
    theme: {
      extend: {
        colors: {
          primary: {
            50: "#F7E9FF",
            100: "#EAD0FF",
            200: "#D4A1FF",
            300: "#BC71FF",
            400: "#A76DF7", // Light Purple
            500: "#8C30F5", // Selendra Purple
            600: "#6A26B6", // Deep Purple
            700: "#5C00B8",
            800: "#47008E",
            900: "#310064",
            950: "#1F0044",
            DEFAULT: "#8C30F5", // Selendra Purple
            light: "#A76DF7", // Light Purple
            dark: "#6A26B6", // Deep Purple
          },
          secondary: {
            50: "#E0FBFD",
            100: "#C2F7FB",
            200: "#85EFF7",
            300: "#4FD1DB", // Light Blue
            400: "#1CDBEA",
            500: "#0CCBD6", // Selendra Blue
            600: "#08979D", // Deep Teal
            700: "#087A80",
            800: "#065256",
            900: "#032A2C",
            950: "#011415",
            DEFAULT: "#0CCBD6", // Selendra Blue
            light: "#4FD1DB", // Light Blue
            dark: "#08979D", // Deep Teal
          },
          navy: {
            50: "#E8EAF6",
            100: "#C5CAE9",
            200: "#9FA8DA",
            300: "#7986CB",
            400: "#5C6BC0",
            500: "#3F51B5",
            600: "#3949AB",
            700: "#303F9F",
            800: "#283593",
            900: "#1A237E", // Selendra Navy
            950: "#0D1257",
            DEFAULT: "#1A237E", // Selendra Navy
            light: "#3F51B5",
            dark: "#0D1257",
          },
          success: {
            50: "#ECFDF5",
            100: "#D1FAE5",
            200: "#A7F3D0",
            300: "#6EE7B7",
            400: "#34D399",
            500: "#10B981", // Success Green
            600: "#059669",
            700: "#047857",
            800: "#065F46",
            900: "#064E3B",
            950: "#022C22",
            DEFAULT: "#10B981", // Success Green
            light: "#34D399",
            dark: "#047857",
          },
          warning: {
            50: "#FFFBEB",
            100: "#FEF3C7",
            200: "#FDE68A",
            300: "#FCD34D",
            400: "#FBBF24",
            500: "#F59E0B", // Warning Amber
            600: "#D97706",
            700: "#B45309",
            800: "#92400E",
            900: "#78350F",
            950: "#451A03",
            DEFAULT: "#F59E0B", // Warning Amber
            light: "#FBBF24",
            dark: "#B45309",
          },
          danger: {
            50: "#FEF2F2",
            100: "#FEE2E2",
            200: "#FECACA",
            300: "#FCA5A5",
            400: "#F87171",
            500: "#EF4444", // Danger Red
            600: "#DC2626",
            700: "#B91C1C",
            800: "#991B1B",
            900: "#7F1D1D",
            950: "#450A0A",
            DEFAULT: "#EF4444", // Danger Red
            light: "#F87171",
            dark: "#B91C1C",
          },
          info: {
            50: "#EFF6FF",
            100: "#DBEAFE",
            200: "#BFDBFE",
            300: "#93C5FD",
            400: "#60A5FA",
            500: "#3B82F6", // Info Blue
            600: "#2563EB",
            700: "#1D4ED8",
            800: "#1E40AF",
            900: "#1E3A8A",
            950: "#172554",
            DEFAULT: "#3B82F6", // Info Blue
            light: "#60A5FA",
            dark: "#1D4ED8",
          },
          gray: {
            50: "#F9FAFB", // Off White
            100: "#F3F4F6",
            200: "#E5E7EB", // Light Gray
            300: "#D1D5DB",
            400: "#9CA3AF",
            500: "#6B7280",
            600: "#4B5563", // Medium Gray
            700: "#374151",
            800: "#1F2937", // Dark Gray
            900: "#111827",
            950: "#030712",
            DEFAULT: "#4B5563", // Medium Gray
            light: "#E5E7EB", // Light Gray
            dark: "#1F2937", // Dark Gray
          },
          // Keep the additional color sets for compatibility and gradual migration
          accent: {
            50: "#E8F5E9",
            100: "#C8E6C9",
            200: "#A5D6A7",
            300: "#81C784",
            400: "#66BB6A",
            500: "#4CAF50",
            600: "#43A047",
            700: "#388E3C",
            800: "#2E7D32",
            900: "#1B5E20",
            950: "#0A3D0A",
            DEFAULT: "#43A047", // Complementary green
            light: "#66BB6A",
            dark: "#2E7D32",
          },
          neutral: {
            50: "#F9FAFB", // Off White
            100: "#F5F5F5",
            200: "#E5E7EB", // Light Gray
            300: "#D1D5DB",
            400: "#9CA3AF",
            500: "#6B7280",
            600: "#4B5563", // Medium Gray
            700: "#374151",
            800: "#1F2937", // Dark Gray
            900: "#111827",
            950: "#030712",
            lightest: "#F9FAFB", // Off-white for backgrounds
            lighter: "#E5E7EB", // Light grey for borders
            DEFAULT: "#4B5563", // Medium grey for text
            darker: "#1F2937", // Dark grey for headings
            darkest: "#111827", // Near black
          },
          error: {
            50: "#FEF2F2",
            100: "#FEE2E2",
            200: "#FECACA",
            300: "#FCA5A5",
            400: "#F87171",
            500: "#EF4444", // Danger Red
            600: "#DC2626",
            700: "#B91C1C",
            800: "#991B1B",
            900: "#7F1D1D",
            950: "#450A0A",
            DEFAULT: "#EF4444", // Danger Red
            light: "#F87171",
            dark: "#B91C1C",
          },
          background: {
            light: "#F9FAFB", // Off White
            dark: "#111827", // Dark Gray
          },
          text: {
            light: "#1F2937", // Dark Gray
            dark: "#F9FAFB", // Off White
          },
          selendra: {
            purple: "#8C30F5", // Selendra Purple
            lightPurple: "#A76DF7", // Light Purple
            deepPurple: "#6A26B6", // Deep Purple
            blue: "#0CCBD6", // Selendra Blue
            lightBlue: "#4FD1DB", // Light Blue
            deepTeal: "#08979D", // Deep Teal
            navy: "#1A237E", // Selendra Navy
          },
        },
        fontFamily: {
          sans: ["Inter", "sans-serif"], // Example: Using Inter as a modern sans-serif font
        },
        // Custom animations
        keyframes: {
          wave: {
            '100%': { transform: 'translateX(100%)' }
          },
          'float-slow': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' }
          },
          'float-medium': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-15px)' }
          },
          'float-fast': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-20px)' }
          },
          'pulse-glow': {
            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
            '50%': { opacity: 0.85, transform: 'scale(0.98)' }
          },
          'spin-slow': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          },
          'spin-medium': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          },
          'spin-slow-reverse': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(-360deg)' }
          },
          'spin-medium-reverse': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(-360deg)' }
          },
          'fade-in': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 }
          }
        },
        animation: {
          'wave': 'wave 1.5s infinite',
          'float-slow': 'float-slow 6s ease-in-out infinite',
          'float-medium': 'float-medium 5s ease-in-out infinite',
          'float-fast': 'float-fast 4s ease-in-out infinite',
          'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
          'spin-slow': 'spin-slow 20s linear infinite',
          'spin-medium': 'spin-medium 15s linear infinite',
          'spin-slow-reverse': 'spin-slow-reverse 25s linear infinite',
          'spin-medium-reverse': 'spin-medium-reverse 18s linear infinite',
          'fade-in': 'fade-in 0.5s ease-out'
        },
        // Container padding consistent with many designs
        container: {
          center: true,
          padding: {
            DEFAULT: "1rem",
            sm: "2rem",
            lg: "4rem",
            xl: "5rem",
          },
        },
        // Custom gradient definitions
        backgroundImage: {
          'primary-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
          'hero-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
          'card-gradient': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
          'dark-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
        },
      },
    },
    plugins: [],
  };