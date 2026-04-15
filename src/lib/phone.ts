import type { Country } from '../types/country';

/** E.164: leading +, non-zero country digit, 7–14 more digits (total 8–15). */
export const E164_REGEX = /^\+[1-9]\d{7,14}$/;

/**
 * Parses an E.164 phone string into its components.
 * Uses longest-first dial code matching to avoid greedy errors (+507 before +5).
 */
export function parsePhone(
  fullPhone: string,
  countries: Country[],
  defaultCode = 'VE',
): { dial_code: string; country: Country | null; number: string } {
  const defaultCountry = countries.find((c) => c.code === defaultCode) ?? countries[0] ?? null;

  if (!fullPhone) {
    return { dial_code: defaultCountry?.dial_code ?? '+58', country: defaultCountry, number: '' };
  }

  // Sort by dial_code length descending to avoid greedy prefix match
  const sorted = [...countries].sort((a, b) => b.dial_code.length - a.dial_code.length);
  for (const country of sorted) {
    if (fullPhone.startsWith(country.dial_code)) {
      return {
        dial_code: country.dial_code,
        country,
        number: fullPhone.slice(country.dial_code.length),
      };
    }
  }

  return { dial_code: defaultCountry?.dial_code ?? '+58', country: defaultCountry, number: fullPhone };
}

/**
 * Builds an E.164 string from a dial code and local number (digits only).
 * Returns empty string when number is empty.
 */
export function buildPhone(dialCode: string, number: string): string {
  const digits = number.replace(/\D/g, '');
  if (!digits) return '';
  return `${dialCode}${digits}`;
}

/**
 * Extracts the local number part from an E.164 phone string.
 * Falls back to stripping the leading '+XX' prefix via regex if countries are unavailable.
 */
export function extractPhoneNumber(fullPhone: string, countries?: Country[]): string {
  if (!fullPhone) return '';
  if (countries && countries.length > 0) {
    const { number } = parsePhone(fullPhone, countries);
    return number;
  }
  // Fallback: strip leading + and up to 3 country-code digits
  return fullPhone.replace(/^\+\d{1,3}/, '');
}

/**
 * Returns true when fullPhone is a valid E.164 string (+[country][number], 8–15 digits).
 * The `countries` parameter is kept for API compatibility but is no longer used.
 */
export function isValidPhone(fullPhone: string, _countries?: Country[]): boolean {
  return E164_REGEX.test(fullPhone);
}
