import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { colors, cardVariants } from "./theme";
import { commitsData } from "./data";
import CommitVolumeCard from "./cards/CommitVolumeCard";
import LanguageCard from "./cards/LanguageCard";
import WeekPatternCard from "./cards/WeekPatternCard";
import StreakCard from "./cards/StreakCard";
import TopRepoCard from "./cards/TopRepoCard";
import ShareCard from "./cards/ShareCard";

const TOTAL = 6;

export default function Wrapped() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const advance = () => {
    if (current < TOTAL - 1) {
      setDirection(1);
      setCurrent((c) => c + 1);
    }
  };
  const retreat = () => {
    if (current > 0) {
      setDirection(-1);
      setCurrent((c) => c - 1);
    }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") advance();
      if (e.key === "ArrowLeft") retreat();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [current]);

  const cards = [
    <CommitVolumeCard key="0" data={commitsData} />,
    <LanguageCard key="1" data={commitsData} />,
    <WeekPatternCard key="2" data={commitsData} />,
    <StreakCard key="3" data={commitsData} />,
    <TopRepoCard key="4" data={commitsData} />,
    <ShareCard key="5" data={commitsData} />,
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: '"Mona Sans", -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: "100vw",
          maxWidth: 430,
          height: "100vh",
          maxHeight: 932,
          position: "relative",
          background: colors.bg,
          overflow: "hidden",
        }}
      >
        {/* Progress dots */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 4,
            zIndex: 20,
          }}
        >
          {Array.from({ length: TOTAL }).map((_, i) => (
            <motion.div
              key={i}
              layout
              animate={{
                width: i === current ? 24 : 6,
                backgroundColor:
                  i === current ? "rgba(230,237,243,1)" : "rgba(230,237,243,0.4)",
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
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ position: "absolute", inset: 0 }}
          >
            {cards[current]}
          </motion.div>
        </AnimatePresence>

        {/* Tap zones */}
        <div
          onClick={retreat}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "38%",
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
            width: "62%",
            height: "100%",
            zIndex: 10,
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}
