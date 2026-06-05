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
  commandLine: string;
  title: string;
  /** optional beat that fades in 600ms after the title (e.g. "Well. Almost.") */
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
  /** Self-referential parody flex shown on Card 1 only. */
  flexLine?: string;
  flexFootnote?: string;
  /** When true, render a single pulsing contribution square instead of the count-up. */
  emptyHeroSquare?: boolean;
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
  weeks: boolean[];
  weeksWith: number;
  weeksTotal: number;
  shareOfTotalPct: number;
  flingName: string | null;
  flingLine: string | null;
}

export interface StreakSpec {
  kind: "streak";
  eyebrow: string;
  streakDays: number;
  streakStartLabel: string;
  streakCaption: string;
  /** When null, the gap beat is skipped (e.g. streak <= 1 or no quiet stretch). */
  gapEyebrow: string | null;
  gapDays: number | null;
  gapRangeLabel: string | null;
  gapCaption: string | null;
  gapClosing: string | null;
}

export interface ShareBack {
  header: string; // "📋 PAIR PROGRAMMER WANTED"
  est: string; // "est. 2026"
  profileLine: string; // "avery, 1,842 commits. night owl. 45% typescript."
  seeking: string;
  greenFlags: string[];
  redFlags: string[];
  gagLine: string;
  footer: string; // "apply within → github.com/avery"
  greenLabel: string; // "🟢 green flags"
  redLabel: string; // "🚩 red flags"
}

export interface ShareSpec {
  kind: "share";
  user: string;
  year: number;
  archetype: string;
  stats: { label: string; value: string }[];
  footer: string;
  hourCounts: number[];
  dnaColors: [string, string];
  back: ShareBack;
  /** Title to use on the front when the deck is "Year Zero". */
  frontTitleOverride?: string;
  /** Slug suffix for the back-side download filename, e.g. "pair-wanted". */
  backFilenameSuffix: string;
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
