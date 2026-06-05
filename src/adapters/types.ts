// Normalized story shape. Card components consume ONLY this — never raw dataset fields.

export type CardKind = "cold-open" | "hero" | "clock" | "composition" | "devotion" | "streak" | "share";

export interface Series {
  label: string;
  value: number;
  color: string; // hex
}

export interface ColdOpenSpec {
  kind: "cold-open";
  commandLine: string; // monospace text typed
  title: string;
  cta: string;
}

export interface HeroSpec {
  kind: "hero";
  eyebrow: string;
  value: number;
  unit: string; // "commits shipped" or "minutes listened"
  meta: string; // "across 27 repos"
  caption: string; // "That's one commit every 4.7 waking hours."
}

export interface ClockSpec {
  kind: "clock";
  eyebrow: string;
  /** length 24, count of events per hour-of-day */
  hourCounts: number[];
  /** every event timestamp in hours [0..24), in chronological order — used to rain dots in */
  eventHours: number[];
  archetype: "Night Owl" | "Dawn Patrol" | "The Professional" | "Chaos Gremlin";
  caption: string;
}

export interface CompositionSpec {
  kind: "composition";
  eyebrow: string;
  /** all segments summing to ~1 */
  segments: Series[]; // value = share
  caption: string; // "45% TypeScript. The blue runs deep."
}

export interface DevotionSpec {
  kind: "devotion";
  eyebrow: string;
  primaryName: string; // repo or artist
  /** 52 booleans — weeks with activity */
  weeks: boolean[];
  weeksWith: number; // 41
  weeksTotal: number; // 52
  shareOfTotalPct: number; // 62
  flingName: string | null;
  flingLine: string | null; // "Your fling: tax-scripts-2025. One commit. Never again."
}

export interface StreakSpec {
  kind: "streak";
  eyebrow: string;
  streakDays: number;
  streakStartLabel: string; // "Feb 11"
  streakCaption: string;
  gapEyebrow: string; // LONGEST QUIET
  gapDays: number;
  gapRangeLabel: string; // "July 8–19"
  gapCaption: string; // "And from July 8–19: nothing. Eleven days. The repos survived."
  gapClosing: string; // "Good."
}

export interface ShareSpec {
  kind: "share";
  user: string;
  year: number;
  archetype: string;
  stats: { label: string; value: string }[]; // ["COMMITS","1,842"] etc
  footer: string; // "github.com/avery · Year in Code"
}

export type CardSpec =
  | ColdOpenSpec
  | HeroSpec
  | ClockSpec
  | CompositionSpec
  | DevotionSpec
  | StreakSpec
  | ShareSpec;

export interface WrappedStory {
  user: string;
  year: number;
  cards: CardSpec[];
}
