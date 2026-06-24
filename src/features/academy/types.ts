/**
 * Shared types for the Académie Prodet (internal training).
 *
 * Safe to import from client components — contains NO data, only type shapes.
 * The confidential data itself lives in `range-data.ts`, which is server-only.
 */

export type AcademyFamilyKey =
  | 'linge'
  | 'vaisselle'
  | 'cuisine'
  | 'desinfectant'
  | 'sanitaire'
  | 'mains'
  | 'special';

export type AcademyFamily = {
  key: AcademyFamilyKey;
  fr: string;
  en: string;
  emoji: string;
  /** Tint background for the family chip / emoji tile. */
  col: string;
};

/** One ingredient line in a formula table. */
export type FormulaRow = {
  ing: string;
  qty: string;
  pct: string;
  role: string;
  /** New formula only: true = added or changed vs the old formula. */
  changed?: boolean;
};

export type BilingualText = { fr: string; en: string };

export type Reform = {
  /** Why the formula was changed (bullet list). */
  why: BilingualText[];
  newF: FormulaRow[];
  newF_en: FormulaRow[];
  oldF: FormulaRow[];
  oldF_en: FormulaRow[];
  proc: BilingualText[];
  /** Material cost, DT per kg. */
  unitOld?: string;
  unitNew?: string;
  /** Material cost, DT per 5 kg batch (optional). */
  costOld?: string;
  costNew?: string;
  verdict_fr: string;
  verdict_en: string;
};

export type AcademyProduct = {
  /** Commercial name. */
  n: string;
  f: AcademyFamilyKey;
  d_fr: string;
  d_en: string;
  cl_fr: string;
  cl_en: string;
  /** Formula logic (non-quantified rationale). */
  lo_fr: string;
  lo_en: string;
  ph: string;
  foam: string;
  foam_en: string;
  /** One-line reformulation note (drives the orange dot). */
  note_fr?: string;
  note_en?: string;
  /** Full reformulation dossier (old vs new formula, procedure, cost). */
  reform?: Reform;
};
