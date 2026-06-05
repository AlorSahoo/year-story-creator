// GitHub linguist colors + a human color word for the DNA caption.
export const LANG_COLORS: Record<string, { hex: string; word: string }> = {
  TypeScript: { hex: "#3178c6", word: "blue" },
  JavaScript: { hex: "#f1e05a", word: "yellow" },
  Python: { hex: "#3572A5", word: "blue" },
  Rust: { hex: "#dea584", word: "amber" },
  Go: { hex: "#00ADD8", word: "cyan" },
  Java: { hex: "#b07219", word: "rust" },
  Ruby: { hex: "#701516", word: "crimson" },
  Swift: { hex: "#F05138", word: "coral" },
  Kotlin: { hex: "#A97BFF", word: "violet" },
  Shell: { hex: "#89e051", word: "green" },
  CSS: { hex: "#563d7c", word: "purple" },
  HTML: { hex: "#e34c26", word: "orange" },
  Other: { hex: "#8b949e", word: "grey" },
};

export function langColor(name: string) {
  return LANG_COLORS[name] ?? LANG_COLORS.Other;
}
