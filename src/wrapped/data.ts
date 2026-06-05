import type { CommitsDataset } from "./types";

export const commitsData: CommitsDataset = {
  kind: "commits",
  userName: "Avery",
  year: 2026,
  totalCommits: 1842,
  totalRepos: 27,
  totalLinesAdded: 184293,
  totalLinesDeleted: 92117,
  languages: [
    { name: "TypeScript", commits: 829, share: 0.45 },
    { name: "Python", commits: 516, share: 0.28 },
    { name: "Rust", commits: 184, share: 0.10 },
    { name: "Go", commits: 147, share: 0.08 },
    { name: "Shell", commits: 92, share: 0.05 },
    { name: "Other", commits: 74, share: 0.04 },
  ],
  monthlyCommits: [98, 124, 187, 156, 142, 178, 134, 121, 165, 198, 174, 165],
  dayOfWeekCommits: [342, 389, 412, 358, 251, 52, 38],
  longestStreakDays: 47,
  longestStreakStart: "2026-02-12",
  topRepos: [
    { name: "litmus-monorepo", commits: 612, lines: 84210 },
    { name: "design-system", commits: 287, lines: 31204 },
    { name: "edge-runtime", commits: 198, lines: 24817 },
    { name: "infra-tools", commits: 143, lines: 12048 },
    { name: "docs-site", commits: 89, lines: 6204 },
  ],
  funFacts: [
    { kind: "night-owl", text: "23% of your commits were after 10pm." },
    { kind: "monday", text: "Mondays were your most productive day." },
  ],
};
