import { createContext, useContext, useMemo, useState } from "react";

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
  const value = useMemo<WrappedState>(
    () => ({
      hideRepoNames,
      setHideRepoNames,
      dna,
      setDna: (a, b) => setDnaState({ a, b }),
    }),
    [hideRepoNames, dna]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWrappedState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("WrappedStateProvider missing");
  return v;
}
