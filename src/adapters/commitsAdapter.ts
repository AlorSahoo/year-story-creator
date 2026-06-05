import type { WrappedStory, CardSpec, ClockSpec, StoryVariant, ShareBack } from "./types";
import { langColor } from "./languageColors";
import { fmt, pct, safeArr, safeNum } from "@/wrapped/fmt";

export interface RawCommitsDataset {
  kind: "commits";
  user: string;
  year: number;
  totalCommits: number;
  totalRepos: number;
  languages: { name: string; commits: number; share: number }[];
  hourOfDayCommits: number[];
  dailyCommits: number[];
  topRepos: { name: string; commits: number; lines: number; weeklyCommits: number[] }[];
  longestStreakDays: number;
  longestStreakStart: string;
}

type Archetype = ClockSpec["archetype"];

function fmtShortDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function rangeLabel(startDayOfYear: number, len: number, year: number) {
  const start = new Date(year, 0, 1);
  start.setDate(start.getDate() + startDayOfYear);
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(0, len - 1));
  const sm = start.toLocaleDateString("en-US", { month: "long" });
  const em = end.toLocaleDateString("en-US", { month: "long" });
  if (sm === em) return `${sm} ${start.getDate()}–${end.getDate()}`;
  return `${sm} ${start.getDate()} – ${em} ${end.getDate()}`;
}

function findLongestZeroGap(daily: number[]) {
  let best = { start: 0, len: 0 };
  let curStart = 0;
  let curLen = 0;
  for (let i = 0; i < daily.length; i++) {
    if (daily[i] === 0) {
      if (curLen === 0) curStart = i;
      curLen++;
      if (curLen > best.len) best = { start: curStart, len: curLen };
    } else curLen = 0;
  }
  return best;
}

function classifyArchetype(hours: number[]): Archetype {
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

function expandEventHours(hourCounts: number[]): number[] {
  const out: number[] = [];
  for (let h = 0; h < 24; h++) {
    const n = Math.max(0, hourCounts[h] || 0);
    for (let i = 0; i < n; i++) {
      const jitter = ((i * 37 + h * 13) % 100) / 100;
      out.push(h + jitter);
    }
  }
  return out.sort((a, b) => {
    const ha = Math.floor(a),
      hb = Math.floor(b);
    if (ha === hb) return a - b;
    return ((ha * 17) % 24) - ((hb * 17) % 24);
  });
}

const TIME_COMPLEMENT: Record<Archetype, { partner: string; line: string }> = {
  "Night Owl": { partner: "dawn patrol", line: "together we cover all 24 hours and someone finally writes the tests" },
  "Dawn Patrol": { partner: "night owl", line: "together we cover all 24 hours and someone finally writes the tests" },
  "The Professional": { partner: "chaos gremlin", line: "someone has to push to prod on friday" },
  "Chaos Gremlin": { partner: "the professional", line: "you need adult supervision" },
  "The Sniper": { partner: "a daily-driver", line: "one of us shows up every day, the other shows up when it matters" },
};

const LANG_COMPLEMENT: Record<string, string> = {
  TypeScript: "rust",
  JavaScript: "typescript",
  Python: "go",
  Go: "python",
  Rust: "typescript",
};

function langComplement(name: string) {
  return LANG_COMPLEMENT[name] ?? "someone who writes documentation";
}

function shortLang(name: string) {
  const m: Record<string, string> = { TypeScript: "TS", JavaScript: "JS", Python: "PY", Rust: "RS", Go: "GO" };
  return m[name] ?? name.slice(0, 4).toUpperCase();
}

function numberWord(n: number) {
  const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
  return words[n] ?? String(n);
}

function rankBy<T>(arr: T[], score: (t: T) => number, name: (t: T) => string): T[] {
  return [...arr].sort((a, b) => {
    const s = score(b) - score(a);
    if (s !== 0) return s;
    return name(a).localeCompare(name(b));
  });
}

export function commitsAdapter(rawIn: RawCommitsDataset): WrappedStory {
  const raw: RawCommitsDataset = {
    kind: "commits",
    user: typeof rawIn?.user === "string" && rawIn.user ? rawIn.user : "you",
    year: safeNum(rawIn?.year, new Date().getFullYear()),
    totalCommits: Math.max(0, safeNum(rawIn?.totalCommits, 0)),
    totalRepos: Math.max(0, safeNum(rawIn?.totalRepos, 0)),
    languages: safeArr<{ name: string; commits: number; share: number }>(rawIn?.languages)
      .filter((l) => l && typeof l.name === "string")
      .map((l) => ({
        name: l.name,
        commits: Math.max(0, safeNum(l.commits, 0)),
        share: Math.max(0, Math.min(1, safeNum(l.share, 0))),
      })),
    hourOfDayCommits: safeArr<number>(rawIn?.hourOfDayCommits, 24, 0).map((n) => Math.max(0, safeNum(n, 0))).slice(0, 24),
    dailyCommits: safeArr<number>(rawIn?.dailyCommits, 365, 0).map((n) => Math.max(0, safeNum(n, 0))).slice(0, 365),
    topRepos: safeArr<RawCommitsDataset["topRepos"][number]>(rawIn?.topRepos)
      .filter((r) => r && typeof r.name === "string")
      .map((r) => ({
        name: r.name,
        commits: Math.max(0, safeNum(r.commits, 0)),
        lines: Math.max(0, safeNum(r.lines, 0)),
        weeklyCommits: safeArr<number>(r.weeklyCommits, 52, 0).map((n) => Math.max(0, safeNum(n, 0))).slice(0, 52),
      })),
    longestStreakDays: Math.max(0, safeNum(rawIn?.longestStreakDays, 0)),
    longestStreakStart:
      typeof rawIn?.longestStreakStart === "string" && !isNaN(new Date(rawIn.longestStreakStart).getTime())
        ? rawIn.longestStreakStart
        : `${safeNum(rawIn?.year, new Date().getFullYear())}-01-01`,
  };

  if (raw.hourOfDayCommits.length < 24)
    raw.hourOfDayCommits = [...raw.hourOfDayCommits, ...new Array(24 - raw.hourOfDayCommits.length).fill(0)];
  if (raw.dailyCommits.length < 365)
    raw.dailyCommits = [...raw.dailyCommits, ...new Array(365 - raw.dailyCommits.length).fill(0)];

  const sortedLangs = rankBy(raw.languages, (l) => l.commits, (l) => l.name);
  const sortedRepos = rankBy(raw.topRepos, (r) => r.commits, (r) => r.name);

  const variant: StoryVariant = raw.totalCommits === 0 ? "empty" : raw.totalCommits < 10 ? "sparse" : "normal";

  if (variant === "empty") return buildEmptyStory(raw);
  return buildNormalStory(raw, sortedLangs, sortedRepos, variant);
}

function buildNormalStory(
  raw: RawCommitsDataset,
  sortedLangs: RawCommitsDataset["languages"],
  sortedRepos: RawCommitsDataset["topRepos"],
  variant: StoryVariant
): WrappedStory {
  const cards: CardSpec[] = [];

  cards.push({
    kind: "cold-open",
    prompt: "$",
    commandLine: `git log --since="${raw.year}-01-01" --until="${raw.year}-12-31" --pretty=oneline`,
    title: `${raw.user}'s Year in Code.`,
    cta: "tap to begin",
  });

  const wakingHours = 16;
  const perCommitHrs = (365 * wakingHours) / raw.totalCommits;
  let heroCaption = `That's one commit every ${perCommitHrs.toFixed(1)} waking hours.`;
  if (variant === "sparse") heroCaption = `${numberWord(raw.totalCommits)} commits. All killer, no filler.`;
  cards.push({
    kind: "hero",
    eyebrow: `${raw.year} in code`,
    value: raw.totalCommits,
    unit: "commits shipped",
    meta: raw.totalRepos > 0 ? `across ${fmt(raw.totalRepos)} repos` : "and counting",
    caption: heroCaption,
    flexLine: `You were in the top 1% of contributors named ${raw.user}.*`,
    flexFootnote: "*of 1.",
  });

  const archetype: Archetype = variant === "sparse" ? "The Sniper" : classifyArchetype(raw.hourOfDayCommits);
  const afterMidnight = raw.hourOfDayCommits[0] + raw.hourOfDayCommits[1] + raw.hourOfDayCommits[2] + raw.hourOfDayCommits[3];
  let clockCaption =
    afterMidnight > 0
      ? `${fmt(afterMidnight)} of those were after midnight. We won't ask.`
      : "Not one commit after midnight. Disciplined. Suspicious.";
  if (variant === "sparse") clockCaption = "You don't commit often. You commit on purpose.";
  cards.push({
    kind: "clock",
    eyebrow: "WHEN YOU SHIP",
    hourCounts: raw.hourOfDayCommits,
    eventHours: expandEventHours(raw.hourOfDayCommits),
    archetype,
    caption: clockCaption,
  });

  const top = sortedLangs[0] ?? { name: "Other", commits: 0, share: 1 };
  const c = langColor(top.name);
  const isMono = sortedLangs.length <= 1;
  const segments = isMono
    ? [{ label: top.name, value: 1, color: c.hex }]
    : sortedLangs.map((l) => ({ label: l.name, value: l.share, color: langColor(l.name).hex }));
  cards.push({
    kind: "composition",
    eyebrow: "YOUR CODE DNA",
    segments,
    caption: isMono ? `100% ${top.name}. A purist.` : `${pct(top.share)}% ${top.name}. The ${c.word} runs deep.`,
  });

  const repo = sortedRepos[0];
  let fling: { name: string; commits: number } | undefined;
  if (repo) {
    const weeks = repo.weeklyCommits.map((n) => n > 0);
    const weeksWith = weeks.filter(Boolean).length;
    const shareOfTotal = raw.totalCommits > 0 ? Math.round((repo.commits / raw.totalCommits) * 100) : 100;
    fling = sortedRepos.slice(1).find((r) => r.commits === 1);
    const flingLine: string | null = fling ? `Your fling: ${fling.name}. One commit. Never again.` : null;

    cards.push({
      kind: "devotion",
      eyebrow: sortedRepos.length === 1 ? "THE ONLY REPO YOU TOUCHED" : "THE REPO THAT HAD YOUR HEART",
      primaryName: repo.name,
      privateName: "your #1 repo",
      weeks,
      weeksWith,
      weeksTotal: 52,
      weeksLine: `You came back ${weeksWith} of 52 weeks.`,
      shareLine: `${sortedRepos.length === 1 ? 100 : shareOfTotal}% of everything you shipped lived here.`,
      flingName: fling?.name ?? null,
      flingLine: sortedRepos.length === 1 ? "One repo. 100% devotion. Monogamy looks good on you." : flingLine,
      flingLineWhenHidden: fling ? "Your fling: a one-commit repo. Never again." : sortedRepos.length === 1 ? "One repo. 100% devotion. Monogamy looks good on you." : null,
      privacyHideLabel: "hide repo names",
      privacyHiddenLabel: "✓ repo names hidden",
    });
  }

  const gap = findLongestZeroGap(raw.dailyCommits);
  if (raw.longestStreakDays <= 1) {
    cards.push({
      kind: "streak",
      eyebrow: "YOUR PATTERN",
      streakDays: Math.max(1, raw.longestStreakDays),
      streakStartLabel: fmtShortDate(raw.longestStreakStart),
      streakCaption: "You don't do streaks. You make appearances.",
      streakUnitLabel: "days straight",
      gapEyebrow: null,
      gapDays: null,
      gapRangeLabel: null,
      gapCaption: null,
      gapClosing: null,
      gapUnitLabel: null,
    });
  } else if (gap.len === 0) {
    cards.push({
      kind: "streak",
      eyebrow: "LONGEST STREAK",
      streakDays: raw.longestStreakDays,
      streakStartLabel: fmtShortDate(raw.longestStreakStart),
      streakCaption: `You started ${fmtShortDate(raw.longestStreakStart)} and didn't stop.`,
      streakUnitLabel: "days straight",
      gapEyebrow: "365 FOR 365",
      gapDays: 0,
      gapRangeLabel: "no quiet days",
      gapCaption: "365 for 365. Please drink water.",
      gapClosing: "",
      gapUnitLabel: "days quiet",
    });
  } else {
    cards.push({
      kind: "streak",
      eyebrow: "LONGEST STREAK",
      streakDays: raw.longestStreakDays,
      streakStartLabel: fmtShortDate(raw.longestStreakStart),
      streakCaption:
        variant === "sparse"
          ? "Mostly quiet this year. The repos survived. They always do."
          : `You started ${fmtShortDate(raw.longestStreakStart)} and didn't stop.`,
      streakUnitLabel: "days straight",
      gapEyebrow: "LONGEST QUIET",
      gapDays: gap.len,
      gapRangeLabel: rangeLabel(gap.start, gap.len, raw.year),
      gapCaption: `And from ${rangeLabel(gap.start, gap.len, raw.year)}: nothing. ${numberWord(gap.len)} days. The repos survived.`,
      gapClosing: "Good.",
      gapUnitLabel: "days quiet",
    });
  }

  const weeksWith = repo ? repo.weeklyCommits.filter((n) => n > 0).length : 0;
  cards.push(buildShareCard(raw, sortedLangs, sortedRepos, archetype, weeksWith, gap, fling));

  return { user: raw.user, year: raw.year, variant, cards };
}

function buildShareCard(
  raw: RawCommitsDataset,
  sortedLangs: RawCommitsDataset["languages"],
  sortedRepos: RawCommitsDataset["topRepos"],
  archetype: Archetype,
  weeksWith: number,
  gap: { start: number; len: number },
  fling: { name: string; commits: number } | undefined
): CardSpec {
  const top = sortedLangs[0] ?? { name: "Other", commits: 0, share: 1 };
  const c = langColor(top.name);

  const stats = [
    { label: "COMMITS", value: fmt(raw.totalCommits) },
    { label: "REPOS", value: String(Math.max(1, raw.totalRepos)) },
    { label: "TOP LANG", value: `${shortLang(top.name)} ${pct(top.share)}%` },
    { label: "DEVOTION", value: `${weeksWith}/52 wks` },
  ];

  const tc = TIME_COMPLEMENT[archetype];
  const seeking = `seeking: a ${tc.partner} ${langComplement(top.name)} dev. ${tc.line}.`;
  const afterMidnight =
    raw.hourOfDayCommits[0] + raw.hourOfDayCommits[1] + raw.hourOfDayCommits[2] + raw.hourOfDayCommits[3];
  const greenFlags: string[] = [];
  if (weeksWith > 0) greenFlags.push(`showed up ${weeksWith} of 52 weeks`);
  if (gap.len > 1) {
    const monthLong = new Date(raw.year, 0, 1);
    monthLong.setDate(monthLong.getDate() + gap.start);
    greenFlags.push(`took ${numberWord(gap.len).toLowerCase()} whole days off in ${monthLong.toLocaleDateString("en-US", { month: "long" }).toLowerCase()}`);
  }
  greenFlags.push("0 commits abandoned mid-streak");

  const redFlags: string[] = [];
  const redFlagsRedacted: string[] = [];
  if (afterMidnight > 0) {
    redFlags.push(`${fmt(afterMidnight)} commits after midnight`);
    redFlagsRedacted.push(`${fmt(afterMidnight)} commits after midnight`);
  }
  const topRepo = sortedRepos[0];
  if (topRepo && raw.totalCommits > 0) {
    const sharePct = Math.round((topRepo.commits / raw.totalCommits) * 100);
    redFlags.push(`gave one repo ${sharePct}% of myself`);
    redFlagsRedacted.push("gave my #1 repo a lot of myself");
  }
  if (raw.longestStreakDays > 7) {
    redFlags.push(`${raw.longestStreakDays}-day benders`);
    redFlagsRedacted.push(`${raw.longestStreakDays}-day benders`);
  }
  void fling;

  const back: ShareBack = {
    header: "📋 PAIR PROGRAMMER WANTED",
    est: `est. ${raw.year}`,
    profileLine: `${raw.user.toLowerCase()}, ${fmt(raw.totalCommits)} commits. ${archetype.toLowerCase()}. ${pct(top.share)}% ${top.name.toLowerCase()}.`,
    seeking,
    greenFlags: greenFlags.slice(0, 3),
    redFlags: redFlags.slice(0, 3),
    redFlagsRedacted: redFlagsRedacted.slice(0, 3),
    gagLine: "compatibility with someone who reviews PRs within the hour: 100%.",
    footer: `apply within → github.com/${raw.user.toLowerCase()}`,
    footerRedacted: `apply within → github.com/private`,
    greenLabel: "🟢 green flags",
    redLabel: "🚩 red flags",
  };

  return {
    kind: "share",
    brandTag: "● GITHUB",
    user: raw.user,
    year: raw.year,
    archetype: `${archetype} · ${raw.longestStreakDays}-Day Streak`,
    stats,
    footer: `github.com/${raw.user.toLowerCase()} · Year in Code`,
    footerRedacted: `github.com/private · Year in Code`,
    hourCounts: raw.hourOfDayCommits,
    dnaColors: [c.hex, langColor(sortedLangs[1]?.name ?? "Other").hex],
    back,
    backFilenameSuffix: "pair-wanted",
    frontFilenameSuffix: "year-in-code",
  };
}

function buildEmptyStory(raw: RawCommitsDataset): WrappedStory {
  const cards: CardSpec[] = [];
  cards.push({
    kind: "cold-open",
    prompt: "$",
    commandLine: `git log --since="${raw.year}-01-01" --until="${raw.year}-12-31" --pretty=oneline`,
    title: `${raw.user}'s Year in Code.`,
    postBeat: "Well. Almost.",
    cta: "tap to begin",
  });
  cards.push({
    kind: "hero",
    eyebrow: `${raw.year} in code`,
    value: 0,
    unit: "commits",
    meta: "Zero commits.",
    caption: "Which means the next one is your first.",
    emptyHeroSquare: false,
  });
  cards.push({
    kind: "hero",
    eyebrow: "DAY ONE",
    value: 0,
    unit: "",
    meta: "",
    caption: "Every graph you've ever admired started exactly here.",
    emptyHeroSquare: true,
    emptyLabel: "day 1",
  });

  const back: ShareBack = {
    header: "📋 PAIR PROGRAMMER WANTED",
    est: `est. ${raw.year}`,
    profileLine: `${raw.user.toLowerCase()}, 0 commits. fully available.`,
    seeking: "seeking: literally anyone. zero commits. fully available. no baggage (no repos).",
    greenFlags: ["free every evening", "no merge conflicts (yet)"],
    redFlags: ["untested"],
    gagLine: "compatibility with someone who reviews PRs within the hour: 100%.",
    footer: `apply within → github.com/${raw.user.toLowerCase()}`,
    footerRedacted: `apply within → github.com/private`,
    greenLabel: "🟢 green flags",
    redLabel: "🚩 red flags",
  };

  cards.push({
    kind: "share",
    brandTag: "● GITHUB",
    user: raw.user,
    year: raw.year,
    archetype: "Day One",
    stats: [
      { label: "COMMITS", value: "0" },
      { label: "REPOS", value: "0" },
      { label: "POTENTIAL", value: "∞" },
      { label: "STATUS", value: "open" },
    ],
    footer: `github.com/${raw.user.toLowerCase()} · Day One`,
    footerRedacted: `github.com/private · Day One`,
    hourCounts: new Array(24).fill(0),
    dnaColors: ["#39d353", "#3fb950"],
    back,
    frontTitleOverride: `${raw.user.toUpperCase()} — Day One`,
    backFilenameSuffix: "day-one-wanted",
    frontFilenameSuffix: "day-one",
  });

  return { user: raw.user, year: raw.year, variant: "empty", cards };
}
