export type ThemeMode = 'system' | 'light' | 'dark';

type AccentShades = {
  // Light mode uses the darkest shade that still carries the hue, so white text on it stays readable.
  light: string;
  // Dark mode uses the 400 shade with dark text on top.
  dark: string;
};

const DARK_FOREGROUND = 'oklch(0.208 0.042 265.755)';
const LIGHT_FOREGROUND = 'oklch(0.984 0.003 247.858)';

// Tailwind v4 palette values (no gray families). Warm and green hues use 700 in light mode,
// since their 600 shade is too bright for white text.
export const accentColors = {
  red: { light: 'oklch(0.577 0.245 27.325)', dark: 'oklch(0.704 0.191 22.216)' },
  orange: { light: 'oklch(0.553 0.195 38.402)', dark: 'oklch(0.75 0.183 55.934)' },
  amber: { light: 'oklch(0.555 0.163 48.998)', dark: 'oklch(0.828 0.189 84.429)' },
  yellow: { light: 'oklch(0.554 0.135 66.442)', dark: 'oklch(0.852 0.199 91.936)' },
  lime: { light: 'oklch(0.532 0.157 131.589)', dark: 'oklch(0.841 0.238 128.85)' },
  green: { light: 'oklch(0.527 0.154 150.069)', dark: 'oklch(0.792 0.209 151.711)' },
  emerald: { light: 'oklch(0.508 0.118 165.612)', dark: 'oklch(0.765 0.177 163.223)' },
  teal: { light: 'oklch(0.511 0.096 186.391)', dark: 'oklch(0.777 0.152 181.912)' },
  cyan: { light: 'oklch(0.52 0.105 223.128)', dark: 'oklch(0.789 0.154 211.53)' },
  sky: { light: 'oklch(0.5 0.134 242.749)', dark: 'oklch(0.746 0.16 232.661)' },
  blue: { light: 'oklch(0.546 0.245 262.881)', dark: 'oklch(0.707 0.165 254.624)' },
  indigo: { light: 'oklch(0.511 0.262 276.966)', dark: 'oklch(0.673 0.182 276.935)' },
  violet: { light: 'oklch(0.541 0.281 293.009)', dark: 'oklch(0.702 0.183 293.541)' },
  purple: { light: 'oklch(0.558 0.288 302.321)', dark: 'oklch(0.714 0.203 305.504)' },
  fuchsia: { light: 'oklch(0.591 0.293 322.896)', dark: 'oklch(0.74 0.238 322.16)' },
  pink: { light: 'oklch(0.592 0.249 0.584)', dark: 'oklch(0.718 0.202 349.761)' },
  rose: { light: 'oklch(0.586 0.253 17.585)', dark: 'oklch(0.712 0.194 13.428)' },
} satisfies Record<string, AccentShades>;

// 'default' keeps the stock primary tokens from tailwind.css.
export type AccentColor = 'default' | keyof typeof accentColors;

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

export function resolveDark(theme: ThemeMode) {
  return theme === 'dark' || (theme === 'system' && darkQuery.matches);
}

export type Appearance = {
  theme: ThemeMode;
  accent: AccentColor;
};

export function applyAppearance(appearance: Appearance) {
  const { theme, accent } = appearance;
  const root = document.documentElement;
  const dark = resolveDark(theme);

  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  // Matches the main layout background (slate-400 / slate-900) so the PWA status bar blends in.
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0f172b' : '#90a1b9');

  if (accent === 'default') {
    root.style.removeProperty('--primary');
    root.style.removeProperty('--primary-foreground');
    root.style.removeProperty('--ring');
    return;
  }

  const color = accentColors[accent][dark ? 'dark' : 'light'];
  root.style.setProperty('--primary', color);
  root.style.setProperty('--primary-foreground', dark ? DARK_FOREGROUND : LIGHT_FOREGROUND);
  root.style.setProperty('--ring', color);
}

export function onSystemThemeChange(listener: () => void) {
  darkQuery.addEventListener('change', listener);
  return () => darkQuery.removeEventListener('change', listener);
}
