export const Colors = {
  primary: '#3874FF',
  primaryLight: '#EBF1FF',
  secondary: '#31374A',
  secondaryDark: '#9BA1B0',
  success: '#25B003',
  warning: '#E5780B',
  danger: '#EC1F00',

  // Registration / onboarding flow palette (serif headings, cream bg, navy ink)
  brand: {
    orange: '#E5780B',        // CTA, active icons, progress bar, italic serif accent
    orangeDeep: '#C86306',    // pressed state
    orangeSoft: '#FDEBD4',    // icon card background
    orangeGlow: 'rgba(229,120,11,0.25)', // drop-shadow for active CTA
    cream: '#FAF7F2',         // light-variant screen bg
    creamSoft: '#F3EFE7',     // divider on cream
    navy: '#1A2A4A',          // primary ink on cream
    navyMuted: '#62728B',     // secondary copy on cream
    navyDark: '#0C1B30',      // dark-variant screen bg (step 2)
    navyDarker: '#0A1629',    // deeper shade for box-shadow layers
    navySurface: '#223558',   // surfaces above navyDark (OTP boxes)
    dotLight: '#E8E1D3',      // dotted pattern on cream
    dotDark: '#1B2B48',       // dotted pattern on navyDark
  },

  // Light mode surfaces
  light: {
    background: '#FFFFFF',
    foreground: '#11181C',
    content1: '#FFFFFF',
    content2: '#F4F4F5',
    content3: '#E4E4E7',
    content4: '#D4D4D8',
    border: '#E4E4E7',
    muted: '#71717A',
    secondary: '#31374A',
  },

  // Dark mode surfaces
  dark: {
    background: '#0F1117',
    foreground: '#ECEDEE',
    content1: '#18191F',
    content2: '#1F2028',
    content3: '#272831',
    content4: '#30313A',
    border: '#272831',
    muted: '#71717A',
    secondary: '#9BA1B0',
  },
} as const;

// Status chip colors
export const STATUS_COLORS = {
  DRAFT:      { bg: '#F4F4F5', text: '#31374A', border: '#E4E4E7' },
  IN_TRANSIT: { bg: '#FEF3E2', text: '#E5780B', border: '#FDDCB5' },
  RECEIVED:   { bg: '#E8F8E3', text: '#25B003', border: '#C3EEB8' },
  DISPATCHED: { bg: '#EBF1FF', text: '#3874FF', border: '#ADC8FF' },
  CANCELLED:  { bg: '#FEEBE7', text: '#EC1F00', border: '#F9C0B5' },
} as const;

export const STATUS_COLORS_DARK = {
  DRAFT:      { bg: '#1F2028', text: '#9BA1B0', border: '#272831' },
  IN_TRANSIT: { bg: '#2A1F0A', text: '#E5780B', border: '#4A3210' },
  RECEIVED:   { bg: '#0D2007', text: '#25B003', border: '#1A3D0F' },
  DISPATCHED: { bg: '#0B1833', text: '#5B91FF', border: '#172F66' },
  CANCELLED:  { bg: '#2A0803', text: '#EC1F00', border: '#4A1208' },
} as const;
