import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { colors, cardTransition } from "./theme";
import { rawCommits } from "./rawData";
import { commitsAdapter } from "@/adapters/commitsAdapter";
import { WrappedStateProvider } from "./state";
import { useReducedMotion } from "./useReducedMotion";
import ColdOpenCard from "./cards/ColdOpenCard";
import HeroCard from "./cards/HeroCard";
import ClockCard from "./cards/ClockCard";
import CompositionCard from "./cards/CompositionCard";
import DevotionCard from "./cards/DevotionCard";
import StreakGapCard from "./cards/StreakGapCard";
import ShareCard from "./cards/ShareCard";
import type { CardSpec } from "@/adapters/types";

function renderCard(spec: CardSpec) {
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
  }
}

function WrappedInner() {
  // DATASET SWAP POINT: replace with listeningAdapter(rawListening) for the listening story.
  const story = useMemo(() => commitsAdapter(rawCommits), []);
  const total = story.cards.length;

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const reduced = useReducedMotion();

  const advance = () =>
    setCurrent((c) => {
      if (c >= total - 1) return c;
      setDirection(1);
      return c + 1;
    });
  const retreat = () =>
    setCurrent((c) => {
      if (c <= 0) return c;
      setDirection(-1);
      return c - 1;
    });

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") advance();
      if (e.key === "ArrowLeft") retreat();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

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

  return (
    <div
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
            {renderCard(story.cards[current])}
          </motion.div>
        </AnimatePresence>

        {/* tap zones */}
        <div
          onClick={retreat}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "40%",
            height: "100%",
            zIndex: 10,
            cursor: "pointer",
          }}
        />
        <div
          onClick={advance}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "60%",
            height: "100%",
            zIndex: 10,
            cursor: "pointer",
          }}
        />
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
