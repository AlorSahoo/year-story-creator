export const colors = {
  bg: "#0d1117",
  surface: "#0d1117", // unified — same canvas for every card; differentiation comes from content
  border: "#30363d",
  text: "#e6edf3",
  muted: "#8b949e",
  green4: "#39d353",
  green3: "#3fb950",
  green2: "#26a641",
  green1: "#0e4429",
  blue: "#58a6ff",
  slate: "#7d8590",
  cool: "#5a6c8a",
};

export const fonts = {
  sans: '"Mona Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", "SF Mono", "Cascadia Code", ui-monospace, monospace',
};

export const easing = [0.16, 1, 0.3, 1] as const;

// One motion language used by every card.
export const cardTransition = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 30 },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -48 : 48,
    transition: { duration: 0.25, ease: easing },
  }),
};

export const stage = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing } },
};
