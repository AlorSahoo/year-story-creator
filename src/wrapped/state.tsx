import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface WrappedState {
  /** Privacy mode — hides primary names across Devotion + Share. */
  hidePrivateNames: boolean;
  setHidePrivateNames: (v: boolean) => void;
  dna: { a: string; b: string };
  setDna: (a: string, b: string) => void;
}

const Ctx = createContext<WrappedState | null>(null);

export function WrappedStateProvider({ children }: { children: React.ReactNode }) {
  const [hidePrivateNames, setHidePrivateNames] = useState(false);
  const [dna, setDnaState] = useState({ a: "#39d353", b: "#3fb950" });

  const setDna = useCallback((a: string, b: string) => {
    setDnaState((prev) => (prev.a === a && prev.b === b ? prev : { a, b }));
  }, []);

  const value = useMemo<WrappedState>(
    () => ({ hidePrivateNames, setHidePrivateNames, dna, setDna }),
    [hidePrivateNames, dna, setDna]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWrappedState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("WrappedStateProvider missing");
  return v;
}
