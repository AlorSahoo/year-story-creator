export interface CommitsDataset {
  kind: "commits";
  userName: string;
  year: number;
  totalCommits: number;
  totalRepos: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  languages: Array<{ name: string; commits: number; share: number }>;
  monthlyCommits: number[];
  dayOfWeekCommits: number[];
  longestStreakDays: number;
  longestStreakStart: string;
  topRepos: Array<{ name: string; commits: number; lines: number }>;
  funFacts: Array<{ kind: string; text: string }>;
}
