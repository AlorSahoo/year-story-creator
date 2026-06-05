import type { WrappedStory, CardSpec } from "./types";

export interface RawListeningDataset {
  kind: "listening";
  user: string;
  year: number;
  totalMinutes: number;
  totalArtists: number;
  genres: { name: string; share: number; color: string }[];
  hourOfDayMinutes: number[]; // 24
  dailyMinutes: number[]; // 365
  topArtists: { name: string; minutes: number; weeklyMinutes: number[] }[];
  longestStreakDays: number;
  longestStreakStart: string;
}

function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function findLongestZeroGap(daily: number[]) {
  let best = { start: 0, len: 0 };
  let s = 0,
    l = 0;
  for (let i = 0; i < daily.length; i++) {
    if (daily[i] === 0) {
      if (l === 0) s = i;
      l++;
      if (l > best.len) best = { start: s, len: l };
    } else l = 0;
  }
  return best;
}

export function listeningAdapter(raw: RawListeningDataset): WrappedStory {
  const cards: CardSpec[] = [];
  cards.push({
    kind: "cold-open",
    commandLine: `play --since="${raw.year}-01-01" --shuffle=off`,
    title: `${raw.user}'s Year in Sound.`,
    cta: "tap to begin",
  });

  cards.push({
    kind: "hero",
    eyebrow: `${raw.year} in sound`,
    value: raw.totalMinutes,
    unit: "minutes listened",
    meta: `across ${raw.totalArtists} artists`,
    caption: `That's ${(raw.totalMinutes / 60 / 365).toFixed(1)} hours every single day.`,
  });

  const total = raw.hourOfDayMinutes.reduce((a, b) => a + b, 0) || 1;
  const nightShare =
    (raw.hourOfDayMinutes[22] + raw.hourOfDayMinutes[23] + raw.hourOfDayMinutes[0] + raw.hourOfDayMinutes[1]) / total;
  const archetype = nightShare > 0.35 ? "Night Owl" : "The Professional";
  const eventHours: number[] = [];
  raw.hourOfDayMinutes.forEach((m, h) => {
    const dots = Math.round(m / 30);
    for (let i = 0; i < dots; i++) eventHours.push(h + ((i * 37) % 100) / 100);
  });

  cards.push({
    kind: "clock",
    eyebrow: "WHEN YOU LISTEN",
    hourCounts: raw.hourOfDayMinutes,
    eventHours,
    archetype: archetype as never,
    caption: `${Math.round(nightShare * 100)}% of your listening was after dark.`,
  });

  const topGenre = raw.genres[0];
  cards.push({
    kind: "composition",
    eyebrow: "YOUR SOUND DNA",
    segments: raw.genres.map((g) => ({ label: g.name, value: g.share, color: g.color })),
    caption: `${Math.round(topGenre.share * 100)}% ${topGenre.name}. No notes.`,
  });

  const artist = raw.topArtists[0];
  const weeks = artist.weeklyMinutes.map((m) => m > 0);
  const weeksWith = weeks.filter(Boolean).length;
  const sharePct = Math.round((artist.minutes / raw.totalMinutes) * 100);
  cards.push({
    kind: "devotion",
    eyebrow: "THE ARTIST YOU COULDN'T QUIT",
    primaryName: artist.name,
    weeks,
    weeksWith,
    weeksTotal: 52,
    shareOfTotalPct: sharePct,
    flingName: null,
    flingLine: null,
  });

  const gap = findLongestZeroGap(raw.dailyMinutes);
  cards.push({
    kind: "streak",
    eyebrow: "LONGEST STREAK",
    streakDays: raw.longestStreakDays,
    streakStartLabel: fmtShortDate(raw.longestStreakStart),
    streakCaption: `You started ${fmtShortDate(raw.longestStreakStart)} and didn't stop.`,
    gapEyebrow: "LONGEST SILENCE",
    gapDays: gap.len,
    gapRangeLabel: `${gap.len} days`,
    gapCaption: `And for ${gap.len} days: silence. The headphones rested.`,
    gapClosing: "Good.",
  });

  cards.push({
    kind: "share",
    user: raw.user,
    year: raw.year,
    archetype: `${archetype} · ${raw.longestStreakDays}-Day Streak`,
    stats: [
      { label: "MINUTES", value: raw.totalMinutes.toLocaleString() },
      { label: "ARTISTS", value: String(raw.totalArtists) },
      { label: "TOP GENRE", value: `${topGenre.name.slice(0, 4).toUpperCase()} ${Math.round(topGenre.share * 100)}%` },
      { label: "DEVOTION", value: `${weeksWith}/52 wks` },
    ],
    footer: `${raw.user.toLowerCase()} · Year in Sound`,
    hourCounts: raw.hourOfDayMinutes,
    dnaColors: [topGenre.color, raw.genres[1]?.color ?? "#3fb950"],
  });

  return { user: raw.user, year: raw.year, cards };
}
