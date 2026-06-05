import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import { colors, cardTransition, fonts } from "./theme";
import { rawCommits } from "./rawData";
import { commitsAdapter } from "@/adapters/commitsAdapter";
import { listeningAdapter } from "@/adapters/listeningAdapter";
import { WrappedStateProvider } from "./state";
import { useReducedMotion } from "./useReducedMotion";
import { useSound } from "./useSound";
import ColdOpenCard from "./cards/ColdOpenCard";
import HeroCard from "./cards/HeroCard";
import ClockCard from "./cards/ClockCard";
import CompositionCard from "./cards/CompositionCard";
import DevotionCard from "./cards/DevotionCard";
import StreakGapCard from "./cards/StreakGapCard";
import ShareCard from "./cards/ShareCard";
import MergeConflictCard from "./cards/MergeConflictCard";
import type { CardSpec, MergeConflictSpec, WrappedStory } from "@/adapters/types";
import { getDemoFixture, type DemoKey } from "./fixtures";

function renderCard(spec: CardSpec, onRetry: () => void) {
  switch (spec.kind) {
    case "cold-open":
      return <ColdOpenCard spec={spec} />;
    case "hero":
      return <HeroCard spec={spec} />;
    case "clock":
      return <ClockCard spec={spec} />;
    case "composition":
      return <CompositionCard spec={spec} />;
    case "devotion":
      return <DevotionCard spec={spec} />;
    case "streak":
      return <StreakGapCard spec={spec} />;
    case "share":
      return <ShareCard spec={spec} />;
    case "merge-conflict":
      return <MergeConflictCard spec={spec} onRetry={onRetry} />;
  }
}

// Per-card error boundary. Swallows render errors and signals removal.
class CardBoundary extends Component<{ children: ReactNode; onError: () => void }, { errored: boolean }> {
  state = { errored: false };
  static getDerivedStateFromError() {
    return { errored: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.errored) return null;
    return this.props.children;
  }
}

function parseDemoKey(search: string): DemoKey | null {
  const params = new URLSearchParams(search);
  const k = params.get("demo");
  if (k === "empty" || k === "sparse" || k === "single" || k === "dense" || k === "broken" || k === "listening")
    return k;
  const ds = params.get("dataset");
  if (ds === "listening") return "listening";
  return null;
}

type DatasetKind = "commits" | "listening";

function buildStory(demo: DemoKey | null): WrappedStory {
  const fix = getDemoFixture(demo);
  try {
    if (!fix) return commitsAdapter(rawCommits);
    if (fix.kind === "commits") return commitsAdapter(fix.data);
    if (fix.kind === "listening") return listeningAdapter(fix.data);
    throw new Error("broken fixture");
  } catch {
    return mergeConflictStory();
  }
}

function mergeConflictStory(): WrappedStory {
  const merge: MergeConflictSpec = {
    kind: "merge-conflict",
    eyebrow: "MERGE CONFLICT",
    title: "Year in Code",
    body: "Something broke, and git blame says it wasn't you. The data didn't parse.",
    cta: "git reset --hard",
  };
  return { user: "you", year: new Date().getFullYear(), variant: "empty", cards: [merge] };
}

function WrappedInner() {
  const [demoKey, setDemoKey] = useState<DemoKey | null>(() =>
    typeof window === "undefined" ? null : parseDemoKey(window.location.search)
  );
  const [reloadTick, setReloadTick] = useState(0);

  const initialStory = useMemo(() => buildStory(demoKey), [demoKey, reloadTick]);

  // Live mutable card list (per-card error boundary may drop one).
  const [cards, setCards] = useState<CardSpec[]>(initialStory.cards);
  useEffect(() => {
    setCards(initialStory.cards);
  }, [initialStory]);

  const total = cards.length;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [toast, setToast] = useState<string | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const reduced = useReducedMotion();
  const sound = useSound();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 1600);
  };

  const advance = () => {
    setCurrent((c) => {
      if (c >= total - 1) {
        showToast("Already up to date");
        return c;
      }
      setDirection(1);
      sound.play("tick-forward", { pitch: 1.1 });
      return c + 1;
    });
  };
  const retreat = () =>
    setCurrent((c) => {
      if (c <= 0) return c;
      setDirection(-1);
      sound.play("tick-back", { pitch: 0.9 });
      if (!hintShown) setHintShown(true);
      return c - 1;
    });

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") advance();
      if (e.key === "ArrowLeft") retreat();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // Reveal the "← git revert" hint once when there's somewhere to go back to.
  useEffect(() => {
    if (current > 0 && !hintShown) {
      const t = setTimeout(() => setHintShown(true), 1200);
      return () => clearTimeout(t);
    }
  }, [current, hintShown]);

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) advance();
    else if (info.offset.x > 60 || info.velocity.x > 400) retreat();
  };

  const variants = reduced
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1, transition: { duration: 0.25 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : cardTransition;

  const onCardError = (idx: number) => {
    setCards((prev) => {
      // Backfill guarantee: never drop below 5.
      if (prev.length <= 5) return prev;
      const next = prev.filter((_, i) => i !== idx);
      return next;
    });
    setCurrent((c) => Math.max(0, Math.min(c, cards.length - 2)));
  };

  const onRetry = () => {
    setDemoKey(null);
    setReloadTick((t) => t + 1);
    setCurrent(0);
  };

  // Unlock audio on first interaction
  const unlockOnce = () => sound.unlock();

  const currentSpec = cards[current];
  const isColdOpen = currentSpec?.kind === "cold-open";
  const isShare = currentSpec?.kind === "share";
  const isMerge = currentSpec?.kind === "merge-conflict";
  const hideTapZones = isColdOpen || isShare || isMerge;

  return (
    <div
      onPointerDown={unlockOnce}
      style={{
        minHeight: "100dvh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100vw",
          maxWidth: 430,
          height: "100dvh",
          maxHeight: 932,
          position: "relative",
          background: colors.bg,
          overflow: "hidden",
        }}
      >
        {/* progress dots */}
        <div
          role="progressbar"
          aria-label={`commit ${current + 1} of ${total}`}
          style={{
            position: "absolute",
            top: "max(env(safe-area-inset-top), 20px)",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 4,
            zIndex: 20,
          }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === current ? 24 : 6,
                backgroundColor:
                  i === current ? "rgba(230,237,243,1)" : "rgba(230,237,243,0.35)",
              }}
              transition={{ duration: 0.3 }}
              style={{ height: 3, borderRadius: 2 }}
            />
          ))}
        </div>

        {/* dataset + sound toggles */}
        <div
          style={{
            position: "absolute",
            top: "max(env(safe-area-inset-top), 16px)",
            right: 16,
            display: "flex",
            gap: 6,
            zIndex: 30,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next: DatasetKind = demoKey === "listening" ? "commits" : "listening";
              setDemoKey(next === "listening" ? "listening" : null);
              setCurrent(0);
            }}
            title="swap dataset"
            aria-label="swap dataset"
            style={{
              background: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.muted,
              fontFamily: fonts.mono,
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 999,
              cursor: "pointer",
            }}
          >
            {demoKey === "listening" ? "🎧 sound" : "● code"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.toggle();
            }}
            title="--verbose"
            aria-label="--verbose"
            style={{
              background: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.muted,
              fontFamily: fonts.mono,
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 999,
              cursor: "pointer",
            }}
          >
            {sound.enabled ? "🔊" : "🔈"}
          </button>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragElastic={0.2}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={onDragEnd}
            style={{ position: "absolute", inset: 0, touchAction: "pan-y" }}
          >
            <CardBoundary onError={() => onCardError(current)}>
              {currentSpec ? renderCard(currentSpec, onRetry) : null}
            </CardBoundary>
          </motion.div>
        </AnimatePresence>

        {/* one-time "← git revert" hint */}
        <AnimatePresence>
          {hintShown && current === 1 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.4, times: [0, 0.15, 0.7, 1] }}
              onAnimationComplete={() => setHintShown(true)}
              style={{
                position: "absolute",
                bottom: "max(env(safe-area-inset-bottom), 28px)",
                left: 16,
                color: colors.muted,
                fontFamily: fonts.mono,
                fontSize: 11,
                letterSpacing: 1,
                pointerEvents: "none",
                zIndex: 25,
              }}
            >
              ← git revert
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* tap zones */}
        {!isColdOpen ? (
          <>
            <div
              onClick={retreat}
              style={{
                position: "absolute",
                top: 64,
                left: 0,
                width: "40%",
                bottom: 0,
                zIndex: 10,
                cursor: "pointer",
              }}
            />
            <div
              onClick={advance}
              style={{
                position: "absolute",
                top: 64,
                right: 0,
                width: "60%",
                bottom: 0,
                zIndex: 10,
                cursor: "pointer",
              }}
            />
          </>
        ) : (
          <div
            onClick={advance}
            style={{ position: "absolute", inset: 0, zIndex: 10, cursor: "pointer" }}
          />
        )}

        <AnimatePresence>
          {toast ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                bottom: "max(env(safe-area-inset-bottom), 110px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(13,17,23,0.95)",
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontFamily: fonts.mono,
                fontSize: 12,
                padding: "8px 14px",
                borderRadius: 999,
                zIndex: 50,
                whiteSpace: "nowrap",
              }}
            >
              {toast}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Wrapped() {
  return (
    <WrappedStateProvider>
      <WrappedInner />
    </WrappedStateProvider>
  );
}
