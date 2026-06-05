import type { WrappedStory, CardSpec, ClockSpec, StoryVariant, ShareBack } from "./types";
import { fmt, pct as toPct, safeArr, safeNum } from "@/wrapped/fmt";

export interface RawListeningDataset {
  kind: "listening";
  user: string;
  year: number;
  totalMinutes: number;
  totalArtists: number;
  genres: { name: string; share: number; color?: string }[];
  hourOfDayMinutes: number[];
  dailyMinutes: number[];
  topArtists: { name: string; minutes: number; weeklyMinutes: number[] }[];
  /** Optional explicit most-replayed track. Adapter falls back to top artist + count if missing. */
  mostReplayedTrack?: { name: string; artist: string; plays: number };
  longestStreakDays: number;
  longestStreakStart: string;
}

type Archetype = ClockSpec["archetype"];

const GENRE_COLOR: Record<string, string> = {
  pop: "#ff6ec7",
  "hip-hop": "#f5a623",
  hiphop: "#f5a623",
  rap: "#f5a623",
  indie: "#7ed6a5",
  electronic: "#4fc3f7",
  edm: "#4fc3f7",
  rock: "#e05c5c",
  classical: "#c9bd9a",
  jazz: "#dea584",
  metal: "#a371f7",
  country: "#d4a373",
  ambient: "#8bd6c0",
};

function genreColor(name: string): string {
  return GENRE_COLOR[name.toLowerCase().trim()] ?? "#8b949e";
}

const GENRE_COMPLEMENT: Record<string, string> = {
  indie: "electronic",
  pop: "hip-hop",
  "hip-hop": "jazz",
  hiphop: "jazz",
  rap: "jazz",
  rock: "classical",
  electronic: "ambient",
  edm: "ambient",
  classical: "indie",
  jazz: "rock",
  ambient: "pop",
  metal: "classical",
  country: "indie",
};

function genreComplement(name: string): string {
  return GENRE_COMPLEMENT[name.toLowerCase().trim()] ?? "someone with a podcast phase";
}

function shortGenre(name: string) {
  return name.slice(0, 4).toUpperCase();
}

function numberWord(n: number) {
  const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
  return words[n] ?? String(n);
}

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
  const total = hourCounts.reduce((a, b) => a + b, 0) || 1;
  const scale = Math.min(1, 200 / total); // cap dot count
  const out: number[] = [];
  for (let h = 0; h < 24; h++) {
    const n = Math.max(0, Math.round((hourCounts[h] || 0) * scale));
    for (let i = 0; i < n; i++) {
      const jitter = ((i * 37 + h * 13) % 100) / 100;
      out.push(h + jitter);
    }
  }
  return out;
}

function rankBy<T>(arr: T[], score: (t: T) => number, name: (t: T) => string): T[] {
  return [...arr].sort((a, b) => {
    const s = score(b) - score(a);
    if (s !== 0) return s;
    return name(a).localeCompare(name(b));
  });
}

export function listeningAdapter(rawIn: RawListeningDataset): WrappedStory {
  const raw: RawListeningDataset = {
    kind: "listening",
    user: typeof rawIn?.user === "string" && rawIn.user ? rawIn.user : "you",
    year: safeNum(rawIn?.year, new Date().getFullYear()),
    totalMinutes: Math.max(0, safeNum(rawIn?.totalMinutes, 0)),
    totalArtists: Math.max(0, safeNum(rawIn?.totalArtists, 0)),
    genres: safeArr<{ name: string; share: number; color?: string }>(rawIn?.genres)
      .filter((g) => g && typeof g.name === "string")
      .map((g) => ({
        name: g.name,
        share: Math.max(0, Math.min(1, safeNum(g.share, 0))),
        color: g.color,
      })),
    hourOfDayMinutes: safeArr<number>(rawIn?.hourOfDayMinutes, 24, 0).map((n) => Math.max(0, safeNum(n, 0))).slice(0, 24),
    dailyMinutes: safeArr<number>(rawIn?.dailyMinutes, 365, 0).map((n) => Math.max(0, safeNum(n, 0))).slice(0, 365),
    topArtists: safeArr<RawListeningDataset["topArtists"][number]>(rawIn?.topArtists)
      .filter((a) => a && typeof a.name === "string")
      .map((a) => ({
        name: a.name,
        minutes: Math.max(0, safeNum(a.minutes, 0)),
        weeklyMinutes: safeArr<number>(a.weeklyMinutes, 52, 0).map((n) => Math.max(0, safeNum(n, 0))).slice(0, 52),
      })),
    mostReplayedTrack: rawIn?.mostReplayedTrack && typeof rawIn.mostReplayedTrack.name === "string"
      ? {
          name: rawIn.mostReplayedTrack.name,
          artist: typeof rawIn.mostReplayedTrack.artist === "string" ? rawIn.mostReplayedTrack.artist : "",
          plays: Math.max(0, safeNum(rawIn.mostReplayedTrack.plays, 0)),
        }
      : undefined,
    longestStreakDays: Math.max(0, safeNum(rawIn?.longestStreakDays, 0)),
    longestStreakStart:
      typeof rawIn?.longestStreakStart === "string" && !isNaN(new Date(rawIn.longestStreakStart).getTime())
        ? rawIn.longestStreakStart
        : `${safeNum(rawIn?.year, new Date().getFullYear())}-01-01`,
  };

  if (raw.hourOfDayMinutes.length < 24)
    raw.hourOfDayMinutes = [...raw.hourOfDayMinutes, ...new Array(24 - raw.hourOfDayMinutes.length).fill(0)];
  if (raw.dailyMinutes.length < 365)
    raw.dailyMinutes = [...raw.dailyMinutes, ...new Array(365 - raw.dailyMinutes.length).fill(0)];

  const variant: StoryVariant = raw.totalMinutes === 0 ? "empty" : raw.totalMinutes < 60 ? "sparse" : "normal";
  if (variant === "empty") return buildEmptyListening(raw);

  const sortedGenres = rankBy(raw.genres, (g) => g.share, (g) => g.name);
  const sortedArtists = rankBy(raw.topArtists, (a) => a.minutes, (a) => a.name);
  return buildNormalListening(raw, sortedGenres, sortedArtists, variant);
}

function buildNormalListening(
  raw: RawListeningDataset,
  sortedGenres: RawListeningDataset["genres"],
  sortedArtists: RawListeningDataset["topArtists"],
  variant: StoryVariant
): WrappedStory {
  const cards: CardSpec[] = [];

  cards.push({
    kind: "cold-open",
    prompt: "▶",
    commandLine: `press play on ${raw.year} …`,
    title: `${raw.user}'s Year in Sound.`,
    cta: "tap to begin",
  });

  // Hero — minutes, convert to days
  const days = Math.round(raw.totalMinutes / 1440);
  let heroCaption =
    days > 0
      ? `That's ${days} full ${days === 1 ? "day" : "days"} of audio.`
      : `${raw.totalMinutes} minutes. Every one of them counted.`;
  if (variant === "sparse") heroCaption = `${numberWord(raw.totalMinutes)} minutes. Selective.`;
  cards.push({
    kind: "hero",
    eyebrow: `${raw.year} in sound`,
    value: raw.totalMinutes,
    unit: "minutes listened",
    meta: raw.totalArtists > 0 ? `across ${fmt(raw.totalArtists)} artists` : "and counting",
    caption: heroCaption,
    flexLine: `You were in the top 1% of listeners named ${raw.user}.*`,
    flexFootnote: "*of 1.",
  });

  // Clock
  const archetype: Archetype = variant === "sparse" ? "The Sniper" : classifyArchetype(raw.hourOfDayMinutes);
  // Use plays-equivalent: approximate "plays" by minutes / 3.5
  const playsByHour = raw.hourOfDayMinutes.map((m) => Math.round(m / 3.5));
  const afterMidnight = playsByHour[0] + playsByHour[1] + playsByHour[2] + playsByHour[3];
  let clockCaption =
    afterMidnight > 0
      ? `${fmt(afterMidnight)} plays after midnight. We won't ask.`
      : "Not one play after midnight. Disciplined. Suspicious.";
  if (variant === "sparse") clockCaption = "You don't press play often. You press play on purpose.";
  cards.push({
    kind: "clock",
    eyebrow: "WHEN YOU LISTEN",
    hourCounts: raw.hourOfDayMinutes,
    eventHours: expandEventHours(playsByHour),
    archetype,
    caption: clockCaption,
  });

  // Composition — genres with color lookup
  const isMono = sortedGenres.length <= 1;
  const topG = sortedGenres[0] ?? { name: "Other", share: 1 };
  const topColor = topG.color ?? genreColor(topG.name);
  const segments = isMono
    ? [{ label: topG.name, value: 1, color: topColor }]
    : sortedGenres.map((g) => ({ label: g.name, value: g.share, color: g.color ?? genreColor(g.name) }));
  cards.push({
    kind: "composition",
    eyebrow: "YOUR SOUND DNA",
    segments,
    caption: isMono ? `100% ${topG.name}. A purist.` : `${toPct(topG.share)}% ${topG.name}. The green runs deep.`,
  });

  // Devotion — top artist + most replayed encore
  const artist = sortedArtists[0];
  if (artist) {
    const weeks = artist.weeklyMinutes.map((m) => m > 0);
    const weeksWith = weeks.filter(Boolean).length;
    const shareOfTotal = raw.totalMinutes > 0 ? Math.round((artist.minutes / raw.totalMinutes) * 100) : 100;
    const track = raw.mostReplayedTrack;
    const encoreSpec = track
      ? {
          headline: `Most replayed: "${track.name}" — ${fmt(track.plays)} plays.`,
          sub: "At some point it stopped being a song and became a setting.",
        }
      : undefined;

    cards.push({
      kind: "devotion",
      eyebrow: sortedArtists.length === 1 ? "THE ONLY ARTIST YOU PLAYED" : "THE ARTIST YOU COULDN'T QUIT",
      primaryName: artist.name,
      privateName: "your top artist",
      weeks,
      weeksWith,
      weeksTotal: 52,
      weeksLine: `You came back ${weeksWith} of 52 weeks.`,
      shareLine: `${shareOfTotal}% of everything you played was them.`,
      flingName: null,
      flingLine: sortedArtists.length === 1 ? "One artist. Monogamous." : null,
      flingLineWhenHidden: sortedArtists.length === 1 ? "One artist. Monogamous." : null,
      privacyHideLabel: "hide artist & track names",
      privacyHiddenLabel: "✓ names hidden",
      encore: encoreSpec,
    });
  }

  // Streak + gap
  const gap = findLongestZeroGap(raw.dailyMinutes);
  if (raw.longestStreakDays <= 1) {
    cards.push({
      kind: "streak",
      eyebrow: "YOUR PATTERN",
      streakDays: Math.max(1, raw.longestStreakDays),
      streakStartLabel: fmtShortDate(raw.longestStreakStart),
      streakCaption: "You don't do streaks. You curate moods.",
      streakUnitLabel: "consecutive days",
      gapEyebrow: null,
      gapDays: null,
      gapRangeLabel: null,
      gapCaption: null,
      gapClosing: null,
      gapUnitLabel: null,
    });
  } else {
    cards.push({
      kind: "streak",
      eyebrow: "LONGEST STREAK",
      streakDays: raw.longestStreakDays,
      streakStartLabel: fmtShortDate(raw.longestStreakStart),
      streakCaption: `You started ${fmtShortDate(raw.longestStreakStart)} and didn't stop.`,
      streakUnitLabel: "consecutive days",
      gapEyebrow: gap.len > 0 ? "LONGEST SILENCE" : "NO QUIET DAYS",
      gapDays: gap.len,
      gapRangeLabel: gap.len > 0 ? rangeLabel(gap.start, gap.len, raw.year) : "always on",
      gapCaption:
        gap.len > 0
          ? `And from ${rangeLabel(gap.start, gap.len, raw.year)}: silence. ${numberWord(gap.len)} days. The playlists survived.`
          : "365 for 365. Even the speakers needed a break.",
      gapClosing: "Good.",
      gapUnitLabel: "days of silence",
    });
  }

  const weeksWith = artist ? artist.weeklyMinutes.filter((m) => m > 0).length : 0;
  cards.push(buildShareListening(raw, sortedGenres, sortedArtists, archetype, weeksWith, gap));

  return { user: raw.user, year: raw.year, variant, cards };
}

function buildShareListening(
  raw: RawListeningDataset,
  sortedGenres: RawListeningDataset["genres"],
  sortedArtists: RawListeningDataset["topArtists"],
  archetype: Archetype,
  weeksWith: number,
  gap: { start: number; len: number }
): CardSpec {
  const topG = sortedGenres[0] ?? { name: "Other", share: 1 };
  const topColor = topG.color ?? genreColor(topG.name);
  const secondColor = sortedGenres[1]?.color ?? genreColor(sortedGenres[1]?.name ?? "ambient");
  const topArtist = sortedArtists[0];

  const stats = [
    { label: "MINUTES", value: fmt(raw.totalMinutes) },
    { label: "ARTISTS", value: String(Math.max(1, raw.totalArtists)) },
    { label: "TOP GENRE", value: `${shortGenre(topG.name)} ${toPct(topG.share)}%` },
    { label: "DEVOTION", value: `${weeksWith}/52 wks` },
  ];

  const tcMap: Record<Archetype, { partner: string; line: string }> = {
    "Night Owl": { partner: "daylight", line: "together we keep the playlist running" },
    "Dawn Patrol": { partner: "after-hours", line: "together we keep the playlist running" },
    "The Professional": { partner: "weekend chaos", line: "someone has to DJ the after-party" },
    "Chaos Gremlin": { partner: "a curator", line: "you need adult supervision" },
    "The Sniper": { partner: "a daily-driver", line: "one of us plays every day, the other plays when it matters" },
  };
  const tc = tcMap[archetype];
  const seeking = `seeking: a ${tc.partner} ${genreComplement(topG.name)} listener. ${tc.line}.`;

  const greenFlags: string[] = [];
  if (weeksWith > 0) greenFlags.push(`showed up ${weeksWith} of 52 weeks`);
  if (gap.len > 1) {
    const monthLong = new Date(raw.year, 0, 1);
    monthLong.setDate(monthLong.getDate() + gap.start);
    greenFlags.push(`took ${numberWord(gap.len).toLowerCase()} whole days off in ${monthLong.toLocaleDateString("en-US", { month: "long" }).toLowerCase()}`);
  }
  greenFlags.push("0 songs skipped at the chorus");

  const redFlags: string[] = [];
  const redFlagsRedacted: string[] = [];
  const track = raw.mostReplayedTrack;
  if (track && track.plays > 50) {
    redFlags.push(`played one song ${fmt(track.plays)} times`);
    redFlagsRedacted.push(`played one song ${fmt(track.plays)} times`);
  }
  if (topArtist && raw.totalMinutes > 0) {
    const sharePct = Math.round((topArtist.minutes / raw.totalMinutes) * 100);
    redFlags.push(`gave one artist ${sharePct}% of myself`);
    redFlagsRedacted.push("gave my top artist a lot of myself");
  }
  const afterMidnight = raw.hourOfDayMinutes[0] + raw.hourOfDayMinutes[1] + raw.hourOfDayMinutes[2] + raw.hourOfDayMinutes[3];
  if (afterMidnight > 0) {
    redFlags.push(`${fmt(Math.round(afterMidnight / 3.5))} plays after midnight`);
    redFlagsRedacted.push(`${fmt(Math.round(afterMidnight / 3.5))} plays after midnight`);
  }

  // anthem from total minutes + top genre
  const bpm = 60 + Math.round((raw.totalMinutes % 4000) / 40);
  const minorGenres = new Set(["hip-hop", "hiphop", "rap", "electronic", "edm", "rock", "metal"]);
  const mode = minorGenres.has(topG.name.toLowerCase()) ? "minor" : "major";
  const keys = ["C", "D", "E", "F", "G", "A"];
  const keyIdx = topG.name.length % keys.length;
  const anthemLine = `anthem: ${bpm} bpm · ${keys[keyIdx]} ${mode}`;

  const back: ShareBack = {
    header: "🎧 AUX CORD APPLICATIONS OPEN",
    est: `est. ${raw.year}`,
    profileLine: `${raw.user.toLowerCase()}, ${fmt(raw.totalMinutes)} minutes. ${archetype.toLowerCase()}. ${toPct(topG.share)}% ${topG.name.toLowerCase()}.`,
    seeking,
    greenFlags: greenFlags.slice(0, 3),
    redFlags: redFlags.slice(0, 3),
    redFlagsRedacted: redFlagsRedacted.slice(0, 3),
    gagLine: "compatibility with someone who shares aux without asking: 100%.",
    footer: `apply within → ${raw.user.toLowerCase()}`,
    footerRedacted: `apply within → private`,
    greenLabel: "🟢 green flags",
    redLabel: "🚩 red flags",
    anthemLine,
  };

  return {
    kind: "share",
    brandTag: "♪ SOUND",
    user: raw.user,
    year: raw.year,
    archetype: `${archetype} · ${raw.longestStreakDays}-Day Streak`,
    stats,
    footer: `${raw.user.toLowerCase()} · Year in Sound`,
    footerRedacted: `private · Year in Sound`,
    hourCounts: raw.hourOfDayMinutes,
    dnaColors: [topColor, secondColor],
    back,
    backFilenameSuffix: "aux-wanted",
    frontFilenameSuffix: "year-in-sound",
  };
}

function buildEmptyListening(raw: RawListeningDataset): WrappedStory {
  const cards: CardSpec[] = [];
  cards.push({
    kind: "cold-open",
    prompt: "▶",
    commandLine: `press play on ${raw.year} …`,
    title: `${raw.user}'s Year in Sound.`,
    postBeat: "Well. Almost.",
    cta: "tap to begin",
  });
  cards.push({
    kind: "hero",
    eyebrow: `${raw.year} in sound`,
    value: 0,
    unit: "minutes",
    meta: "Zero minutes.",
    caption: "Which means the next play is your first.",
    emptyHeroSquare: false,
  });
  cards.push({
    kind: "hero",
    eyebrow: "DAY ONE",
    value: 0,
    unit: "",
    meta: "",
    caption: "Every playlist you've ever loved started exactly here.",
    emptyHeroSquare: true,
    emptyLabel: "press ▶",
  });

  const back: ShareBack = {
    header: "🎧 AUX CORD APPLICATIONS OPEN",
    est: `est. ${raw.year}`,
    profileLine: `${raw.user.toLowerCase()}, 0 minutes. fully available.`,
    seeking: "seeking: an aux cord. fully available. no skips on record.",
    greenFlags: ["free every evening", "no bad takes (yet)"],
    redFlags: ["untested"],
    gagLine: "compatibility with someone who shares aux without asking: 100%.",
    footer: `apply within → ${raw.user.toLowerCase()}`,
    footerRedacted: `apply within → private`,
    greenLabel: "🟢 green flags",
    redLabel: "🚩 red flags",
    anthemLine: "anthem: 0 bpm · silence",
  };

  cards.push({
    kind: "share",
    brandTag: "♪ SOUND",
    user: raw.user,
    year: raw.year,
    archetype: "Day One",
    stats: [
      { label: "MINUTES", value: "0" },
      { label: "ARTISTS", value: "0" },
      { label: "POTENTIAL", value: "∞" },
      { label: "STATUS", value: "open" },
    ],
    footer: `${raw.user.toLowerCase()} · Day One`,
    footerRedacted: `private · Day One`,
    hourCounts: new Array(24).fill(0),
    dnaColors: ["#39d353", "#3fb950"],
    back,
    frontTitleOverride: `${raw.user.toUpperCase()} — Day One`,
    backFilenameSuffix: "day-one-wanted",
    frontFilenameSuffix: "day-one",
  });

  return { user: raw.user, year: raw.year, variant: "empty", cards };
}
