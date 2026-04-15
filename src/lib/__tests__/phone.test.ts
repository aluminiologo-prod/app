/**
 * src/lib/__tests__/phone.test.ts
 *
 * Tests for all exported symbols in src/lib/phone.ts, with particular focus
 * on the post-refactor behaviour:
 *
 *  - E164_REGEX / isValidPhone: E.164 validation (replaces old 10-digit local rule)
 *  - parsePhone: longest-first dial-code matching
 *  - buildPhone: dial code + local digits → E.164
 *  - extractPhoneNumber: strips dial code with or without country list
 */

import {
  E164_REGEX,
  isValidPhone,
  parsePhone,
  buildPhone,
  extractPhoneNumber,
} from '../phone';
import type { Country } from '../../types/country';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeCountry(
  overrides: Partial<Country> & Pick<Country, 'code' | 'dial_code'>,
): Country {
  return {
    id: overrides.code,
    name: overrides.code,
    flag_emoji: '',
    is_active: true,
    ...overrides,
  };
}

const VE = makeCountry({ code: 'VE', dial_code: '+58' });
const US = makeCountry({ code: 'US', dial_code: '+1' });
const PA = makeCountry({ code: 'PA', dial_code: '+507' });   // longer prefix that starts with +5
const CO = makeCountry({ code: 'CO', dial_code: '+57' });
const COUNTRIES = [VE, US, PA, CO];

// ---------------------------------------------------------------------------
// E164_REGEX
// ---------------------------------------------------------------------------

describe('E164_REGEX', () => {
  it.each([
    ['+584141234567', true],
    ['+12125551234', true],
    ['+5078001234', true],
    ['+12345678', true],        // exactly 8 digits (min valid)
    ['+123456789012345', true], // exactly 15 digits (max valid)
  ])('accepts valid E.164 %s', (phone, expected) => {
    expect(E164_REGEX.test(phone)).toBe(expected);
  });

  it.each([
    ['', false],
    ['+', false],
    ['+0123456789', false],
    ['584141234567', false],
    ['+1234567', false],         // 7 digits — too short
    ['+1234567890123456', false], // 16 digits — too long
    ['not-a-phone', false],
  ])('rejects invalid value %s', (phone, expected) => {
    expect(E164_REGEX.test(phone)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// isValidPhone
// ---------------------------------------------------------------------------

describe('isValidPhone', () => {
  describe('valid E.164 strings return true', () => {
    it('accepts Venezuelan number +584141234567', () => {
      expect(isValidPhone('+584141234567')).toBe(true);
    });

    it('accepts US number +12125551234', () => {
      expect(isValidPhone('+12125551234')).toBe(true);
    });

    it('accepts Panama +5078001234 (longer country code)', () => {
      expect(isValidPhone('+5078001234')).toBe(true);
    });

    it('accepts minimum-length number (8 total digits)', () => {
      expect(isValidPhone('+12345678')).toBe(true);
    });

    it('accepts maximum-length number (15 total digits)', () => {
      expect(isValidPhone('+123456789012345')).toBe(true);
    });
  });

  describe('invalid values return false', () => {
    it('rejects empty string', () => {
      expect(isValidPhone('')).toBe(false);
    });

    it('rejects bare + sign', () => {
      expect(isValidPhone('+')).toBe(false);
    });

    it('rejects number without leading +', () => {
      expect(isValidPhone('584141234567')).toBe(false);
    });

    it('rejects number with leading +0 (country code cannot start with zero)', () => {
      expect(isValidPhone('+0584141234567')).toBe(false);
    });

    it('rejects number too short (7 total digits)', () => {
      expect(isValidPhone('+1234567')).toBe(false);
    });

    it('rejects number too long (16 total digits)', () => {
      expect(isValidPhone('+1234567890123456')).toBe(false);
    });

    it('rejects non-numeric string', () => {
      expect(isValidPhone('not-a-phone')).toBe(false);
    });

    it('rejects local 10-digit number (old PHONE_NUMBER_LENGTH=10 format)', () => {
      // The old validator accepted bare "0412..." style; the new one requires E.164
      expect(isValidPhone('04121234567')).toBe(false);
    });
  });

  describe('_countries parameter is ignored (backward-compat shim)', () => {
    it('returns same result when countries array is passed', () => {
      expect(isValidPhone('+584141234567', COUNTRIES)).toBe(true);
      expect(isValidPhone('04121234567', COUNTRIES)).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// parsePhone
// ---------------------------------------------------------------------------

describe('parsePhone', () => {
  it('splits a Venezuela number correctly', () => {
    const result = parsePhone('+584141234567', COUNTRIES);
    expect(result.dial_code).toBe('+58');
    expect(result.country?.code).toBe('VE');
    expect(result.number).toBe('4141234567');
  });

  it('splits a US number correctly', () => {
    const result = parsePhone('+12125551234', COUNTRIES);
    expect(result.dial_code).toBe('+1');
    expect(result.country?.code).toBe('US');
    expect(result.number).toBe('2125551234');
  });

  it('uses longest dial_code first to avoid greedy match (+507 before +5)', () => {
    // +507 starts with +5 — without longest-first, it would be mis-parsed as VE (+58)
    const result = parsePhone('+5078001234', COUNTRIES);
    expect(result.country?.code).toBe('PA');
    expect(result.dial_code).toBe('+507');
    expect(result.number).toBe('8001234');
  });

  it('returns default country and empty number for empty string', () => {
    const result = parsePhone('', COUNTRIES, 'VE');
    expect(result.country?.code).toBe('VE');
    expect(result.number).toBe('');
  });

  it('falls back to default country when no dial code matches', () => {
    const result = parsePhone('+9991234567', COUNTRIES, 'VE');
    expect(result.country?.code).toBe('VE');
    expect(result.number).toBe('+9991234567');
  });

  it('honours the defaultCode argument when no match found', () => {
    const result = parsePhone('+9991234567', COUNTRIES, 'US');
    expect(result.country?.code).toBe('US');
  });
});

// ---------------------------------------------------------------------------
// buildPhone
// ---------------------------------------------------------------------------

describe('buildPhone', () => {
  it('concatenates dial code and local number', () => {
    expect(buildPhone('+58', '4141234567')).toBe('+584141234567');
  });

  it('strips non-digit characters from the local number', () => {
    expect(buildPhone('+1', '212-555-1234')).toBe('+12125551234');
  });

  it('returns empty string when local number has no digits', () => {
    expect(buildPhone('+58', '')).toBe('');
    expect(buildPhone('+58', '   ')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// extractPhoneNumber
// ---------------------------------------------------------------------------

describe('extractPhoneNumber', () => {
  it('extracts national number using countries list (accurate dial-code matching)', () => {
    // parsePhone finds +58 (VE) → number is the remaining digits
    expect(extractPhoneNumber('+584141234567', COUNTRIES)).toBe('4141234567');
  });

  it('extracts national number for US using countries list', () => {
    expect(extractPhoneNumber('+12125551234', COUNTRIES)).toBe('2125551234');
  });

  it('falls back to regex stripping when no countries provided', () => {
    // Fallback regex: /^\+\d{1,3}/ — greedy, strips + plus up to 3 digit chars.
    // +584141234567 → strips "+584" (3 digits) → "141234567"
    expect(extractPhoneNumber('+584141234567')).toBe('141234567');
    // +12125551234 → strips "+12" (but greedy: actually "+121") → "25551234"
    // Regex is greedy so \d{1,3} matches as many as 3 digits: "+12" → strips "+121"
    // Node evaluation: '+12125551234'.replace(/^\+\d{1,3}/, '') = '25551234'
    expect(extractPhoneNumber('+12125551234')).toBe('25551234');
  });

  it('returns empty string for empty input', () => {
    expect(extractPhoneNumber('')).toBe('');
    expect(extractPhoneNumber('', COUNTRIES)).toBe('');
  });
});
