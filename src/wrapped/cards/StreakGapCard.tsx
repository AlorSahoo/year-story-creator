import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CardShell } from "./CardShell";
import { colors, fonts, fadeUp } from "../theme";
import { useCountUp } from "../useCountUp";
import type { StreakSpec } from "@/adapters/types";
import { useReducedMotion } from "../useReducedMotion";

export default function StreakGapCard({ spec }: { spec: StreakSpec }) {
  const reduced = useReducedMotion();
  const [beat, setBeat] = useState<0 | 1>(0);

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setBeat(1), 3500);
    return () => clearTimeout(t);
  }, [reduced]);

  return (
    <CardShell
      eyebrow={
        <AnimatePresence mode="wait">
          <motion.span
            key={beat}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.5 }}
          >
            {beat === 0 ? spec.eyebrow : spec.gapEyebrow}
          </motion.span>
        </AnimatePresence>
      }
      footer={
        <AnimatePresence mode="wait">
          <motion.span
            key={beat}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: beat === 0 ? 1.8 : 0.6, duration: 0.6 }}
          >
            {beat === 0 ? (
              spec.streakCaption
            ) : (
              <>
                {spec.gapCaption}
                <br />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.7 }}
                  style={{ color: colors.text, fontWeight: 600 }}
                >
                  {spec.gapClosing}
                </motion.span>
              </>
            )}
          </motion.span>
        </AnimatePresence>
      }
    >
      <Beat beat={beat} spec={spec} reduced={reduced} onSkip={() => setBeat(1)} />
    </CardShell>
  );
}

function Beat({
  beat,
  spec,
  reduced,
  onSkip,
}: {
  beat: 0 | 1;
  spec: StreakSpec;
  reduced: boolean;
  onSkip: () => void;
}) {
  const days = useCountUp(beat === 0 ? spec.streakDays : spec.gapDays, 1200, 100);
  const accent = beat === 0 ? colors.green4 : colors.cool;
  return (
    <motion.div
      variants={fadeUp}
      onClick={(e) => {
        e.stopPropagation();
        if (beat === 0) onSkip();
      }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
    >
      <motion.div
        animate={{ background: `radial-gradient(circle, ${accent}55, transparent 65%)` }}
        transition={{ duration: 1.2 }}
        style={{
          position: "absolute",
          width: 460,
          height: 460,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
      <motion.div
        animate={{ color: accent, textShadow: `0 0 80px ${accent}80` }}
        transition={{ duration: 0.8 }}
        style={{
          fontFamily: fonts.mono,
          fontSize: "clamp(88px, 30vw, 160px)",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: -4,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {days}
      </motion.div>
      <motion.div animate={{ color: colors.text }} style={{ fontSize: 20, marginTop: 8 }}>
        {beat === 0 ? "days straight" : "days quiet"}
      </motion.div>

      <div
        style={{
          marginTop: 28,
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          maxWidth: 280,
          justifyContent: "center",
        }}
      >
        {Array.from({ length: spec.streakDays }).map((_, i) => {
          const filled = beat === 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                background: filled ? colors.green4 : "transparent",
                borderColor: filled ? colors.green4 : colors.border,
              }}
              transition={{ delay: reduced ? 0 : 0.4 + i * 0.012, duration: 0.25 }}
              style={{ width: 10, height: 10, borderRadius: 2, border: "1px solid" }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
