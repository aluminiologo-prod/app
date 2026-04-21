import type { Client } from '../types/client';

/**
 * The 7 fields that feed profile completeness, grouped by profile section so
 * the UI can show a per-section "N/M completos" counter.
 */
export const SECTION_FIELDS = {
  personal: ['first_name', 'last_name', 'person_type', 'client_type_id'],
  contact: ['phone', 'email'],
  billing: ['rif', 'address'],
} as const satisfies Record<string, readonly (keyof Client)[]>;

/**
 * Which i18n key to use when mentioning a missing field in the completeness
 * card body (e.g. "necesitas email, cédula/RIF y dirección"). Multiple Client
 * columns can map to the same human-readable field (first/last name → name).
 */
export const MISSING_FIELD_I18N: Record<string, string> = {
  first_name: 'name',
  last_name: 'name',
  person_type: 'personType',
  client_type_id: 'clientType',
  phone: 'phone',
  email: 'email',
  rif: 'fiscalDoc',
  address: 'address',
};

const ALL_FIELDS = Object.values(SECTION_FIELDS).flat() as (keyof Client)[];

function isEmpty(client: Client, field: keyof Client): boolean {
  const value = client[field];
  return value === null || value === undefined || String(value).trim() === '';
}

export interface SectionStats {
  filled: number;
  total: number;
  complete: boolean;
}

export interface Completeness {
  /** Rounded to nearest 5% for a clean read-out. */
  percent: number;
  filled: number;
  total: number;
  sections: { personal: SectionStats; contact: SectionStats; billing: SectionStats };
  /** i18n keys of missing fields, de-duplicated and ordered. */
  missingKeys: string[];
}

export function computeCompleteness(client: Client | undefined | null): Completeness {
  const total = ALL_FIELDS.length;
  if (!client) {
    return {
      percent: 0,
      filled: 0,
      total,
      sections: emptySections(),
      missingKeys: Array.from(new Set(Object.values(MISSING_FIELD_I18N))),
    };
  }

  const sectionStats = (fields: readonly (keyof Client)[]): SectionStats => {
    const filled = fields.filter((f) => !isEmpty(client, f)).length;
    return { filled, total: fields.length, complete: filled === fields.length };
  };

  const sections = {
    personal: sectionStats(SECTION_FIELDS.personal),
    contact: sectionStats(SECTION_FIELDS.contact),
    billing: sectionStats(SECTION_FIELDS.billing),
  };

  const filled =
    sections.personal.filled + sections.contact.filled + sections.billing.filled;
  const raw = (filled / total) * 100;
  const percent = Math.round(raw / 5) * 5;

  const missingFieldsRaw = ALL_FIELDS.filter((f) => isEmpty(client, f));
  const missingKeys = Array.from(
    new Set(missingFieldsRaw.map((f) => MISSING_FIELD_I18N[f])),
  );

  return { percent, filled, total, sections, missingKeys };
}

function emptySections() {
  return {
    personal: {
      filled: 0,
      total: SECTION_FIELDS.personal.length,
      complete: false,
    },
    contact: { filled: 0, total: SECTION_FIELDS.contact.length, complete: false },
    billing: { filled: 0, total: SECTION_FIELDS.billing.length, complete: false },
  };
}
