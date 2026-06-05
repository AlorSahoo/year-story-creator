export const colors = {
  bg: "#0d1117",
  surface: "#161b22",
  border: "#30363d",
  text: "#e6edf3",
  muted: "#8b949e",
  green4: "#39d353",
  green3: "#26a641",
  green2: "#006d32",
  green1: "#0e4429",
  blue: "#58a6ff",
  yellow: "#d29922",
};

export const fonts = {
  sans: '"Mona Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"Monaspace Neon", "SF Mono", "Cascadia Code", ui-monospace, monospace',
};

export const easing = [0.16, 1, 0.3, 1] as const;

export const cardVariants = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easing } },
  exit: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? -24 : 24,
    transition: { duration: 0.3, ease: easing },
  }),
};
