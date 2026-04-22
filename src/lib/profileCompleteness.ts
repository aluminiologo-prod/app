import type { Client } from '../types/client';

/**
 * Each "slot" represents one profile row the user sees. A slot is considered
 * filled when every column in `fields` has a non-empty value — that's how
 * `first_name` + `last_name` collapse into the single "Full name" row the UI
 * renders (2 DB columns, 1 UI row, 1 completeness slot).
 *
 * `i18n` is the key under `profile.missingFieldName.*` used in the "you still
 * need X, Y and Z" copy on the completeness card.
 */
interface Slot {
  fields: readonly (keyof Client)[];
  i18n: string;
}

export const SECTION_SLOTS: Record<'personal' | 'contact' | 'billing', Slot[]> = {
  personal: [
    { fields: ['first_name', 'last_name'], i18n: 'name' },
    { fields: ['person_type'], i18n: 'personType' },
    { fields: ['client_type_id'], i18n: 'clientType' },
  ],
  contact: [
    { fields: ['phone'], i18n: 'phone' },
    { fields: ['email'], i18n: 'email' },
  ],
  billing: [
    { fields: ['rif'], i18n: 'fiscalDoc' },
    { fields: ['address'], i18n: 'address' },
  ],
};

function isEmpty(client: Client, field: keyof Client): boolean {
  const value = client[field];
  return value === null || value === undefined || String(value).trim() === '';
}

function isSlotFilled(client: Client, slot: Slot): boolean {
  return slot.fields.every((f) => !isEmpty(client, f));
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
  /** i18n keys of missing slots, in section-then-slot order. */
  missingKeys: string[];
}

const ALL_SLOTS: Slot[] = [
  ...SECTION_SLOTS.personal,
  ...SECTION_SLOTS.contact,
  ...SECTION_SLOTS.billing,
];

export function computeCompleteness(client: Client | undefined | null): Completeness {
  const total = ALL_SLOTS.length;
  if (!client) {
    return {
      percent: 0,
      filled: 0,
      total,
      sections: emptySections(),
      missingKeys: ALL_SLOTS.map((s) => s.i18n),
    };
  }

  const sectionStats = (slots: Slot[]): SectionStats => {
    const filled = slots.filter((s) => isSlotFilled(client, s)).length;
    return { filled, total: slots.length, complete: filled === slots.length };
  };

  const sections = {
    personal: sectionStats(SECTION_SLOTS.personal),
    contact: sectionStats(SECTION_SLOTS.contact),
    billing: sectionStats(SECTION_SLOTS.billing),
  };

  const filled =
    sections.personal.filled + sections.contact.filled + sections.billing.filled;
  const raw = (filled / total) * 100;
  const percent = Math.round(raw / 5) * 5;

  const missingKeys = ALL_SLOTS.filter((s) => !isSlotFilled(client, s)).map(
    (s) => s.i18n,
  );

  return { percent, filled, total, sections, missingKeys };
}

function emptySections() {
  return {
    personal: {
      filled: 0,
      total: SECTION_SLOTS.personal.length,
      complete: false,
    },
    contact: {
      filled: 0,
      total: SECTION_SLOTS.contact.length,
      complete: false,
    },
    billing: {
      filled: 0,
      total: SECTION_SLOTS.billing.length,
      complete: false,
    },
  };
}
