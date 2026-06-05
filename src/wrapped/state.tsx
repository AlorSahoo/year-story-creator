import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface WrappedState {
  hideRepoNames: boolean;
  setHideRepoNames: (v: boolean) => void;
  dna: { a: string; b: string };
  setDna: (a: string, b: string) => void;
}

const Ctx = createContext<WrappedState | null>(null);

export function WrappedStateProvider({ children }: { children: React.ReactNode }) {
  const [hideRepoNames, setHideRepoNames] = useState(false);
  const [dna, setDnaState] = useState({ a: "#39d353", b: "#3fb950" });

  const setDna = useCallback((a: string, b: string) => {
    setDnaState((prev) => (prev.a === a && prev.b === b ? prev : { a, b }));
  }, []);

  const value = useMemo<WrappedState>(
    () => ({ hideRepoNames, setHideRepoNames, dna, setDna }),
    [hideRepoNames, dna, setDna]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWrappedState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("WrappedStateProvider missing");
  return v;
}
