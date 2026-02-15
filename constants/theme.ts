/**
 * This file is the single source of truth for colors and theme constants.
 * It aligns with the CSS variables in global.css and Tailwind config.
 */

export const Palette = {
  // Brand
  primary: '#6366f1', // Indigo 500
  trac: {
    blue: '#3b82f6',
    purple: '#8b5cf6',
  },
  
  // Feedback
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  
  // Neutrals (Zinc)
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  }
} as const;

export const Colors = {
  light: {
    background: Palette.zinc[50],
    foreground: Palette.zinc[950],
    text: Palette.zinc[950],
    card: '#ffffff',
    cardForeground: Palette.zinc[950],
    primary: Palette.primary,
    primaryForeground: '#ffffff',
    muted: Palette.zinc[100],
    mutedForeground: Palette.zinc[500],
    border: Palette.zinc[200],
    input: Palette.zinc[200],
    ring: Palette.primary,
    tint: Palette.primary,
    icon: Palette.zinc[500],
    tabIconDefault: Palette.zinc[400],
    tabIconSelected: Palette.primary,
  },
  dark: {
    background: Palette.zinc[950],
    foreground: Palette.zinc[50],
    text: Palette.zinc[50],
    card: Palette.zinc[900],
    cardForeground: Palette.zinc[50],
    primary: Palette.primary,
    primaryForeground: Palette.zinc[50],
    muted: Palette.zinc[800],
    mutedForeground: Palette.zinc[400],
    border: Palette.zinc[800],
    input: Palette.zinc[800],
    ring: Palette.primary,
    tint: Palette.zinc[50],
    icon: Palette.zinc[400],
    tabIconDefault: Palette.zinc[500],
    tabIconSelected: Palette.zinc[50],
  },
};

export const Theme = {
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  animation: {
    spring: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
    timing: {
      duration: 250,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  }
} as const;