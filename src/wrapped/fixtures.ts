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

// "broken" — intentionally malformed
export const broken = "{ this is not json — merge conflict <<<<<< HEAD" as unknown as RawCommitsDataset;

export type DemoKey = "empty" | "sparse" | "single" | "dense" | "broken" | "listening";

export function getDemoFixture(
  key: DemoKey | null
): { kind: "commits"; data: RawCommitsDataset } | { kind: "broken" } | { kind: "listening"; data: RawListeningDataset } | null {
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
    default:
      return null;
  }
}

const listeningFixture: RawListeningDataset = {
  kind: "listening",
  user: "Avery",
  year: 2026,
  totalMinutes: 41_280,
  totalArtists: 312,
  genres: [
    { name: "Indie", share: 0.42, color: "#39d353" },
    { name: "Electronic", share: 0.28, color: "#58a6ff" },
    { name: "Jazz", share: 0.18, color: "#dea584" },
    { name: "Other", share: 0.12, color: "#8b949e" },
  ],
  hourOfDayMinutes: (() => {
    const w = [
      1.4, 1.0, 0.6, 0.3, 0.2, 0.2, 0.4, 0.8, 1.4, 1.8, 2.2, 2.4, 2.2, 2.4, 2.6, 2.4, 2.0, 1.6, 1.4, 1.8, 2.4, 2.8, 2.6,
      2.0,
    ];
    const sum = w.reduce((a, b) => a + b, 0);
    return w.map((x) => Math.round((x / sum) * 41280));
  })(),
  dailyMinutes: (() => {
    const a = zeros(365);
    for (let i = 0; i < 365; i++) a[i] = i >= 200 && i <= 214 ? 0 : 100 + Math.round(Math.sin(i) * 30 + 40);
    return a;
  })(),
  topArtists: [
    {
      name: "The Midnight",
      minutes: 8420,
      weeklyMinutes: (() => {
        const a = zeros(52);
        for (let w = 0; w < 52; w++) a[w] = [5, 11, 19, 27, 35, 43, 49].includes(w) ? 0 : 120 + (w % 7) * 40;
        return a;
      })(),
    },
  ],
  longestStreakDays: 73,
  longestStreakStart: "2026-03-04",
};

export { listeningFixture };
