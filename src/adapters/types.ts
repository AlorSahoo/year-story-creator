// Normalized story shape. Card components consume ONLY this — never raw dataset fields.

export type CardKind =
  | "cold-open"
  | "hero"
  | "clock"
  | "composition"
  | "devotion"
  | "streak"
  | "share"
  | "merge-conflict";

export type StoryVariant = "normal" | "sparse" | "empty";

export interface Series {
  label: string;
  value: number;
  color: string; // hex
}

export interface ColdOpenSpec {
  kind: "cold-open";
  /** Prompt char ($, ▶, >) shown before the typed line. */
  prompt: string;
  commandLine: string;
  title: string;
  postBeat?: string;
  cta: string;
}

export interface HeroSpec {
  kind: "hero";
  eyebrow: string;
  value: number;
  unit: string;
  meta: string;
  caption: string;
  flexLine?: string;
  flexFootnote?: string;
  /** Day-zero pulsing square variant (no count-up). */
  emptyHeroSquare?: boolean;
  /** Label under the pulsing square (e.g. "day 1"). */
  emptyLabel?: string;
}

export interface ClockSpec {
  kind: "clock";
  eyebrow: string;
  hourCounts: number[];
  eventHours: number[];
  archetype: "Night Owl" | "Dawn Patrol" | "The Professional" | "Chaos Gremlin" | "The Sniper";
  caption: string;
}

export interface CompositionSpec {
  kind: "composition";
  eyebrow: string;
  segments: Series[];
  caption: string;
}

export interface DevotionSpec {
  kind: "devotion";
  eyebrow: string;
  primaryName: string;
  /** Replacement name when privacy is on (e.g. "your #1 repo" / "your top artist"). */
  privateName: string;
  weeks: boolean[];
  weeksWith: number;
  weeksTotal: number;
  /** Templated lines from the adapter — components do not invent copy. */
  weeksLine: string; // "You came back {x} of {y} weeks."
  shareLine: string; // "62% of everything you shipped lived here."
  flingName: string | null;
  flingLine: string | null;
  flingLineWhenHidden: string | null;
  /** "hide repo names" / "hide artist names" */
  privacyHideLabel: string;
  privacyHiddenLabel: string;
  /** Optional second beat (Most Replayed Track on listening). */
  encore?: { headline: string; sub: string };
}

export interface StreakSpec {
  kind: "streak";
  eyebrow: string;
  streakDays: number;
  streakStartLabel: string;
  streakCaption: string;
  streakUnitLabel: string; // "days straight" / "consecutive days"
  gapEyebrow: string | null;
  gapDays: number | null;
  gapRangeLabel: string | null;
  gapCaption: string | null;
  gapClosing: string | null;
  gapUnitLabel: string | null; // "days quiet" / "days of silence"
}

export interface ShareBack {
  header: string;
  est: string;
  profileLine: string;
  seeking: string;
  greenFlags: string[];
  redFlags: string[];
  /** Privacy-safe variants used when names are hidden. */
  redFlagsRedacted?: string[];
  gagLine: string;
  footer: string;
  footerRedacted?: string;
  greenLabel: string;
  redLabel: string;
  /** "anthem: 92 bpm · D minor" — printed on both sides. */
  anthemLine?: string;
}

export interface ShareSpec {
  kind: "share";
  /** Top-left brand tag on the trading card front (e.g. "● GITHUB" / "♪ SOUND"). */
  brandTag: string;
  user: string;
  year: number;
  archetype: string;
  stats: { label: string; value: string }[];
  footer: string;
  footerRedacted?: string;
  hourCounts: number[];
  dnaColors: [string, string];
  back: ShareBack;
  frontTitleOverride?: string;
  backFilenameSuffix: string;
  /** Filename slug for the FRONT side (e.g. "year-in-code", "year-in-sound"). */
  frontFilenameSuffix: string;
}

export interface MergeConflictSpec {
  kind: "merge-conflict";
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
}

export type CardSpec =
  | ColdOpenSpec
  | HeroSpec
  | ClockSpec
  | CompositionSpec
  | DevotionSpec
  | StreakSpec
  | ShareSpec
  | MergeConflictSpec;

export interface WrappedStory {
  user: string;
  year: number;
  variant: StoryVariant;
  cards: CardSpec[];
}
