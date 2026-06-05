import type { RawCommitsDataset } from "@/adapters/commitsAdapter";
import type { RawListeningDataset } from "@/adapters/listeningAdapter";
import { rawCommits } from "@/wrapped/rawData";

function zeros(n: number) {
  return new Array(n).fill(0);
}

export const empty: RawCommitsDataset = {
  kind: "commits",
  user: "Avery",
  year: 2026,
  totalCommits: 0,
  totalRepos: 0,
  languages: [],
  hourOfDayCommits: zeros(24),
  dailyCommits: zeros(365),
  topRepos: [],
  longestStreakDays: 0,
  longestStreakStart: "2026-01-01",
};

export const sparse: RawCommitsDataset = {
  kind: "commits",
  user: "Avery",
  year: 2026,
  totalCommits: 9,
  totalRepos: 2,
  languages: [{ name: "TypeScript", commits: 9, share: 1.0 }],
  hourOfDayCommits: (() => {
    const a = zeros(24);
    a[14] = 3;
    a[16] = 2;
    a[10] = 2;
    a[21] = 2;
    return a;
  })(),
  dailyCommits: (() => {
    const a = zeros(365);
    [12, 47, 89, 120, 155, 190, 220, 260, 310].forEach((d) => (a[d] = 1));
    return a;
  })(),
  topRepos: [
    {
      name: "side-project",
      commits: 9,
      lines: 412,
      weeklyCommits: (() => {
        const a = zeros(52);
        [2, 7, 13, 17, 22, 27, 32, 37, 44].forEach((w) => (a[w] = 1));
        return a;
      })(),
    },
  ],
  longestStreakDays: 1,
  longestStreakStart: "2026-04-12",
};

export const single: RawCommitsDataset = {
  ...rawCommits,
  totalRepos: 1,
  languages: [{ name: "TypeScript", commits: rawCommits.totalCommits, share: 1.0 }],
  topRepos: [rawCommits.topRepos[0]],
};

export const dense = rawCommits;

export const broken = "{ this is not json — merge conflict <<<<<< HEAD" as unknown as RawCommitsDataset;

const listeningFixture: RawListeningDataset = {
  kind: "listening",
  user: "Avery",
  year: 2026,
  totalMinutes: 43_800,
  totalArtists: 312,
  genres: [
    { name: "indie", share: 0.38 },
    { name: "electronic", share: 0.24 },
    { name: "hip-hop", share: 0.18 },
    { name: "jazz", share: 0.12 },
    { name: "rock", share: 0.08 },
  ],
  hourOfDayMinutes: (() => {
    const w = [
      1.6, 1.4, 0.8, 0.4, 0.3, 0.2, 0.4, 0.8, 1.4, 1.8, 2.2, 2.4, 2.2, 2.4, 2.6, 2.4, 2.0, 1.6, 1.6, 1.8, 2.4, 2.8, 2.6,
      2.0,
    ];
    const sum = w.reduce((a, b) => a + b, 0);
    return w.map((x) => Math.round((x / sum) * 43800));
  })(),
  dailyMinutes: (() => {
    const a = zeros(365);
    for (let i = 0; i < 365; i++) a[i] = i >= 189 && i <= 199 ? 0 : 100 + Math.round(Math.sin(i) * 30 + 40);
    return a;
  })(),
  topArtists: [
    {
      name: "The Midnight",
      minutes: 12_702,
      weeklyMinutes: (() => {
        const a = zeros(52);
        for (let w = 0; w < 52; w++) a[w] = [5, 11, 19, 27, 35, 43, 49, 50, 51, 17, 28].includes(w) ? 0 : 140 + (w % 7) * 30;
        return a;
      })(),
    },
    {
      name: "Phoebe Bridgers",
      minutes: 4210,
      weeklyMinutes: zeros(52).map((_, w) => (w % 3 === 0 ? 80 : 0)),
    },
  ],
  mostReplayedTrack: { name: "Sunset", artist: "The Midnight", plays: 212 },
  longestStreakDays: 73,
  longestStreakStart: "2026-03-04",
};

export const emptyListening: RawListeningDataset = {
  kind: "listening",
  user: "Avery",
  year: 2026,
  totalMinutes: 0,
  totalArtists: 0,
  genres: [],
  hourOfDayMinutes: zeros(24),
  dailyMinutes: zeros(365),
  topArtists: [],
  longestStreakDays: 0,
  longestStreakStart: "2026-01-01",
};

export const sparseListening: RawListeningDataset = {
  kind: "listening",
  user: "Avery",
  year: 2026,
  totalMinutes: 42,
  totalArtists: 1,
  genres: [{ name: "ambient", share: 1.0 }],
  hourOfDayMinutes: (() => {
    const a = zeros(24);
    a[23] = 14;
    a[0] = 18;
    a[1] = 10;
    return a;
  })(),
  dailyMinutes: (() => {
    const a = zeros(365);
    [40, 90, 180, 250].forEach((d) => (a[d] = 10));
    return a;
  })(),
  topArtists: [
    {
      name: "Tycho",
      minutes: 42,
      weeklyMinutes: (() => {
        const a = zeros(52);
        a[6] = 12;
        a[12] = 8;
        a[26] = 10;
        a[36] = 12;
        return a;
      })(),
    },
  ],
  mostReplayedTrack: { name: "Awake", artist: "Tycho", plays: 7 },
  longestStreakDays: 1,
  longestStreakStart: "2026-06-15",
};

export type DemoKey =
  | "empty"
  | "sparse"
  | "single"
  | "dense"
  | "broken"
  | "listening"
  | "empty-listening"
  | "sparse-listening";

export function getDemoFixture(
  key: DemoKey | null
):
  | { kind: "commits"; data: RawCommitsDataset }
  | { kind: "broken" }
  | { kind: "listening"; data: RawListeningDataset }
  | null {
  switch (key) {
    case "empty":
      return { kind: "commits", data: empty };
    case "sparse":
      return { kind: "commits", data: sparse };
    case "single":
      return { kind: "commits", data: single };
    case "dense":
      return { kind: "commits", data: dense };
    case "broken":
      return { kind: "broken" };
    case "listening":
      return { kind: "listening", data: listeningFixture };
    case "empty-listening":
      return { kind: "listening", data: emptyListening };
    case "sparse-listening":
      return { kind: "listening", data: sparseListening };
    default:
      return null;
  }
}

/** Shape-sniff: detect dataset kind from raw JSON without trusting filename or .kind. */
export function parseDataset(
  raw: unknown
):
  | { kind: "commits"; data: RawCommitsDataset }
  | { kind: "listening"; data: RawListeningDataset }
  | { kind: "broken" } {
  if (!raw || typeof raw !== "object") return { kind: "broken" };
  const o = raw as Record<string, unknown>;
  const hasCommits =
    "totalCommits" in o ||
    "dailyCommits" in o ||
    "hourOfDayCommits" in o ||
    Array.isArray(o.topRepos) ||
    Array.isArray(o.languages);
  const hasListening =
    "totalMinutes" in o ||
    "dailyMinutes" in o ||
    "hourOfDayMinutes" in o ||
    Array.isArray(o.topArtists) ||
    Array.isArray(o.genres);
  if (hasCommits && !hasListening) return { kind: "commits", data: raw as RawCommitsDataset };
  if (hasListening && !hasCommits) return { kind: "listening", data: raw as RawListeningDataset };
  // tie-break on explicit .kind
  if (o.kind === "commits") return { kind: "commits", data: raw as RawCommitsDataset };
  if (o.kind === "listening") return { kind: "listening", data: raw as RawListeningDataset };
  return { kind: "broken" };
}

export { listeningFixture };
