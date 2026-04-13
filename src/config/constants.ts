export const USER_STORAGE_KEY = 'aluminiologo_user';
export const THEME_STORAGE_KEY = 'aluminiologo_theme';

// Phone country codes — sorted by dial code length (longest first to avoid greedy match issues)
export const PHONE_COUNTRY_CODES = [
  { code: 'VE', dial: '+58',  label: '🇻🇪 +58'  },
  { code: 'US', dial: '+1',   label: '🇺🇸 +1'   },
  { code: 'MX', dial: '+52',  label: '🇲🇽 +52'  },
  { code: 'CO', dial: '+57',  label: '🇨🇴 +57'  },
  { code: 'AR', dial: '+54',  label: '🇦🇷 +54'  },
  { code: 'CL', dial: '+56',  label: '🇨🇱 +56'  },
  { code: 'PE', dial: '+51',  label: '🇵🇪 +51'  },
  { code: 'EC', dial: '+593', label: '🇪🇨 +593' },
  { code: 'PA', dial: '+507', label: '🇵🇦 +507' },
  { code: 'CR', dial: '+506', label: '🇨🇷 +506' },
  { code: 'DO', dial: '+1',   label: '🇩🇴 +1'   },
  { code: 'ES', dial: '+34',  label: '🇪🇸 +34'  },
] as const;

export const DEFAULT_COUNTRY_CODE = '+58';
