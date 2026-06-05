// Safe numeric formatting — keeps NaN/Infinity out of the JSX.
export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString();
}

export function pct(share: number | null | undefined): number {
  if (share === null || share === undefined || !Number.isFinite(share)) return 0;
  return Math.max(0, Math.min(100, Math.round(share * 100)));
}

export function safeNum(n: unknown, fallback = 0): number {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return fallback;
  return x;
}

export function safeArr<T>(a: unknown, len?: number, fill?: T): T[] {
  if (!Array.isArray(a)) return len ? new Array(len).fill(fill) : [];
  if (len && a.length < len) return [...a, ...new Array(len - a.length).fill(fill)] as T[];
  return a as T[];
}
