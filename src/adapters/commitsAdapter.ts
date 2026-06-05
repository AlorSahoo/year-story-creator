import type { WrappedStory, CardSpec, ClockSpec } from "./types";
import { langColor } from "./languageColors";

export interface RawCommitsDataset {
  kind: "commits";
  user: string;
  year: number;
  totalCommits: number;
  totalRepos: number;
  languages: { name: string; commits: number; share: number }[];
  /** 24 hour-of-day bins */
  hourOfDayCommits: number[];
  /** 365 daily bins, chronological */
  dailyCommits: number[];
  topRepos: { name: string; commits: number; lines: number; weeklyCommits: number[] }[];
  longestStreakDays: number;
  longestStreakStart: string; // ISO date
}

function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function rangeLabel(startDayOfYear: number, len: number, year: number) {
  const start = new Date(year, 0, 1);
  start.setDate(start.getDate() + startDayOfYear);
  const end = new Date(start);
  end.setDate(end.getDate() + len - 1);
  const sm = start.toLocaleDateString("en-US", { month: "long" });
  const em = end.toLocaleDateString("en-US", { month: "long" });
  if (sm === em) return `${sm} ${start.getDate()}–${end.getDate()}`;
  return `${sm} ${start.getDate()} – ${em} ${end.getDate()}`;
}

function findLongestZeroGap(daily: number[]): { start: number; len: number } {
  let best = { start: 0, len: 0 };
  let curStart = 0;
  let curLen = 0;
  for (let i = 0; i < daily.length; i++) {
    if (daily[i] === 0) {
      if (curLen === 0) curStart = i;
      curLen++;
      if (curLen > best.len) best = { start: curStart, len: curLen };
    } else {
      curLen = 0;
    }
  }
  return best;
}

function classifyArchetype(hours: number[]): ClockSpec["archetype"] {
  const total = hours.reduce((a, b) => a + b, 0) || 1;
  const inRange = (from: number, to: number) => {
    let s = 0;
    for (let h = 0; h < 24; h++) {
      const inside = from <= to ? h >= from && h < to : h >= from || h < to;
      if (inside) s += hours[h];
    }
    return s / total;
  };
  if (inRange(22, 4) >= 0.35) return "Night Owl";
  if (inRange(5, 9) >= 0.35) return "Dawn Patrol";
  if (inRange(9, 18) >= 0.5) return "The Professional";
  return "Chaos Gremlin";
}

/** Expand hourOfDayCommits into a chronologically-ordered list of event hours. */
function expandEventHours(hourCounts: number[]): number[] {
  const out: number[] = [];
  for (let h = 0; h < 24; h++) {
    const n = hourCounts[h] || 0;
    for (let i = 0; i < n; i++) {
      // jitter inside the hour for visual variety, deterministic per index
      const jitter = ((i * 37 + h * 13) % 100) / 100;
      out.push(h + jitter);
    }
  }
  // shuffle deterministically into "chronological-ish" order across the year
  return out.sort((a, b) => {
    const ha = Math.floor(a),
      hb = Math.floor(b);
    if (ha === hb) return a - b;
    // interleave hours so the dot-rain feels like time passing, not bin-by-bin
    return ((ha * 17) % 24) - ((hb * 17) % 24);
  });
}

export function commitsAdapter(raw: RawCommitsDataset): WrappedStory {
  const cards: CardSpec[] = [];

  // 0 cold open
  cards.push({
    kind: "cold-open",
    commandLine: `git log --since="${raw.year}-01-01" --until="${raw.year}-12-31" --pretty=oneline`,
    title: `${raw.user}'s Year in Code.`,
    cta: "tap to begin",
  });

  // 1 hero
  const wakingHours = 16;
  const perCommitHrs = (365 * wakingHours) / raw.totalCommits;
  cards.push({
    kind: "hero",
    eyebrow: `${raw.year} in code`,
    value: raw.totalCommits,
    unit: "commits shipped",
    meta: `across ${raw.totalRepos} repos`,
    caption: `That's one commit every ${perCommitHrs.toFixed(1)} waking hours.`,
  });

  // 2 clock
  const archetype = classifyArchetype(raw.hourOfDayCommits);
  const afterMidnight =
    raw.hourOfDayCommits[0] + raw.hourOfDayCommits[1] + raw.hourOfDayCommits[2] + raw.hourOfDayCommits[3];
  cards.push({
    kind: "clock",
    eyebrow: "WHEN YOU SHIP",
    hourCounts: raw.hourOfDayCommits,
    eventHours: expandEventHours(raw.hourOfDayCommits),
    archetype,
    caption:
      afterMidnight > 0
        ? `${afterMidnight} of those were after midnight. We won't ask.`
        : "Not one commit after midnight. Disciplined. Suspicious.",
  });

  // 3 composition (DNA)
  const top = raw.languages[0];
  const c = langColor(top.name);
  cards.push({
    kind: "composition",
    eyebrow: "YOUR CODE DNA",
    segments: raw.languages.map((l) => ({
      label: l.name,
      value: l.share,
      color: langColor(l.name).hex,
    })),
    caption: `${Math.round(top.share * 100)}% ${top.name}. The ${c.word} runs deep.`,
  });

  // 4 devotion
  const repo = raw.topRepos[0];
  const weeks = repo.weeklyCommits.map((n) => n > 0);
  const weeksWith = weeks.filter(Boolean).length;
  const shareOfTotal = Math.round((repo.commits / raw.totalCommits) * 100);
  const fling = raw.topRepos.find((r) => r.commits === 1);
  cards.push({
    kind: "devotion",
    eyebrow: "THE REPO THAT HAD YOUR HEART",
    primaryName: repo.name,
    weeks,
    weeksWith,
    weeksTotal: 52,
    shareOfTotalPct: shareOfTotal,
    flingName: fling?.name ?? null,
    flingLine: fling ? `Your fling: ${fling.name}. One commit. Never again.` : null,
  });

  // 5 streak + gap
  const gap = findLongestZeroGap(raw.dailyCommits);
  const startDoy = Math.floor(
    (new Date(raw.longestStreakStart).getTime() - new Date(raw.year, 0, 1).getTime()) / 86400000
  );
  cards.push({
    kind: "streak",
    eyebrow: "LONGEST STREAK",
    streakDays: raw.longestStreakDays,
    streakStartLabel: fmtShortDate(raw.longestStreakStart),
    streakCaption: `You started ${fmtShortDate(raw.longestStreakStart)} and didn't stop.`,
    gapEyebrow: "LONGEST QUIET",
    gapDays: gap.len,
    gapRangeLabel: rangeLabel(gap.start, gap.len, raw.year),
    gapCaption: `And from ${rangeLabel(gap.start, gap.len, raw.year)}: nothing. ${
      numberWord(gap.len)
    } days. The repos survived.`,
    gapClosing: "Good.",
  });
  void startDoy;

  // 6 share — trading card
  cards.push({
    kind: "share",
    user: raw.user,
    year: raw.year,
    archetype: `${archetype} · ${raw.longestStreakDays}-Day Streak`,
    stats: [
      { label: "COMMITS", value: raw.totalCommits.toLocaleString() },
      { label: "REPOS", value: String(raw.totalRepos) },
      { label: "TOP LANG", value: `${shortLang(top.name)} ${Math.round(top.share * 100)}%` },
      { label: "DEVOTION", value: `${weeksWith}/52 wks` },
    ],
    footer: `github.com/${raw.user.toLowerCase()} · Year in Code`,
    hourCounts: raw.hourOfDayCommits,
    dnaColors: [c.hex, langColor(raw.languages[1]?.name ?? "Other").hex],
  });

  return { user: raw.user, year: raw.year, cards };
}

function shortLang(name: string) {
  const m: Record<string, string> = { TypeScript: "TS", JavaScript: "JS", Python: "PY", Rust: "RS", Go: "GO" };
  return m[name] ?? name.slice(0, 4).toUpperCase();
}

function numberWord(n: number) {
  const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
  return words[n] ?? String(n);
}
