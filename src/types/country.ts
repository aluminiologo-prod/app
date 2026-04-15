export interface Country {
  id: string;
  name: string;
  code: string;       // ISO-3166-1 alpha-2 (VE, CO, US…)
  dial_code: string;  // "+58", "+1", "+507"
  flag_emoji: string; // "🇻🇪"
  is_active: boolean;
}
