import type { RawCommitsDataset } from "@/adapters/commitsAdapter";

// Deterministic pseudo-random — keeps the synthesized arrays stable.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCommits(): RawCommitsDataset {
  const rng = mulberry32(2026);
  const totalCommits = 1842;
  // Night-owl weighted hour distribution (heavier 22-02)
  const hourWeights = [
    1.6, 1.2, 0.8, 0.4, 0.2, 0.2, 0.4, 0.8, 1.6, 2.0, 2.4, 2.6, 2.4, 2.6, 2.8, 2.6, 2.2, 1.8, 1.6, 1.8, 2.2, 2.6, 2.4,
    2.0,
  ];
  const sumW = hourWeights.reduce((a, b) => a + b, 0);
  const hourOfDayCommits = hourWeights.map((w) => Math.round((w / sumW) * totalCommits));
  // fix rounding drift
  let drift = totalCommits - hourOfDayCommits.reduce((a, b) => a + b, 0);
  hourOfDayCommits[12] += drift;

  // Daily commits: 365 days, with a known 11-day gap July 8–19 (doy 188..198 inclusive = 11 days)
  const dailyCommits = new Array(365).fill(0);
  let remaining = totalCommits;
  for (let d = 0; d < 365; d++) {
    if (d >= 188 && d <= 198) continue; // gap
    // baseline 4-7 commits/day, but Mondays heavier, weekends lighter
    const dow = (d + 3) % 7; // arbitrary anchor
    const base = dow === 0 ? 7 : dow >= 5 ? 1 : 5;
    const jitter = Math.floor(rng() * 4);
    dailyCommits[d] = base + jitter;
  }
  // scale to total
  const curSum = dailyCommits.reduce((a, b) => a + b, 0);
  const scale = totalCommits / curSum;
  for (let d = 0; d < 365; d++) dailyCommits[d] = Math.round(dailyCommits[d] * scale);
  // restore gap
  for (let d = 188; d <= 198; d++) dailyCommits[d] = 0;
  // patch total
  drift = totalCommits - dailyCommits.reduce((a, b) => a + b, 0);
  dailyCommits[10] += drift;
  void remaining;

  // Top repo weekly: 52 weeks, present in 41 of them
  const litmusWeekly = new Array(52).fill(0);
  const absent = new Set([3, 8, 14, 21, 27, 30, 36, 41, 46, 49, 51]); // 11 weeks dark
  let litmusCommits = 0;
  for (let w = 0; w < 52; w++) {
    if (absent.has(w)) continue;
    const n = 8 + Math.floor(rng() * 14);
    litmusWeekly[w] = n;
    litmusCommits += n;
  }
  // normalize to ~62% share
  const targetLitmus = Math.round(totalCommits * 0.62);
  const k = targetLitmus / litmusCommits;
  for (let w = 0; w < 52; w++) litmusWeekly[w] = Math.round(litmusWeekly[w] * k);
  litmusCommits = litmusWeekly.reduce((a, b) => a + b, 0);

  const evenly = (commits: number) => {
    const arr = new Array(52).fill(0);
    let left = commits;
    while (left > 0) {
      const w = Math.floor(rng() * 52);
      const add = Math.min(left, 1 + Math.floor(rng() * 4));
      arr[w] += add;
      left -= add;
    }
    return arr;
  };

  const topRepos = [
    { name: "litmus-monorepo", commits: litmusCommits, lines: 84210, weeklyCommits: litmusWeekly },
    { name: "design-system", commits: 287, lines: 31204, weeklyCommits: evenly(287) },
    { name: "edge-runtime", commits: 198, lines: 24817, weeklyCommits: evenly(198) },
    { name: "infra-tools", commits: 143, lines: 12048, weeklyCommits: evenly(143) },
    { name: "docs-site", commits: 89, lines: 6204, weeklyCommits: evenly(89) },
    { name: "tax-scripts-2025", commits: 1, lines: 42, weeklyCommits: (() => {
      const a = new Array(52).fill(0); a[12] = 1; return a;
    })() },
  ];

  return {
    kind: "commits",
    user: "Avery",
    year: 2026,
    totalCommits,
    totalRepos: 27,
    languages: [
      { name: "TypeScript", commits: 829, share: 0.45 },
      { name: "Python", commits: 516, share: 0.28 },
      { name: "Rust", commits: 184, share: 0.1 },
      { name: "Go", commits: 147, share: 0.08 },
      { name: "Shell", commits: 92, share: 0.05 },
      { name: "Other", commits: 74, share: 0.04 },
    ],
    hourOfDayCommits,
    dailyCommits,
    topRepos,
    longestStreakDays: 47,
    longestStreakStart: "2026-02-11",
  };
}

export const rawCommits = buildCommits();
