import { motion } from "framer-motion";
import { colors, fonts, easing } from "../theme";
import { useCountUp } from "../useCountUp";
import type { CommitsDataset } from "../types";

export default function StreakCard({ data }: { data: CommitsDataset }) {
  const days = useCountUp(data.longestStreakDays, 1400, 500);
  const dateStr = new Date(data.longestStreakStart).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      style={{
        background: colors.surface,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: easing }}
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.green2}55, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          color: colors.muted,
          fontFamily: fonts.sans,
          fontSize: 13,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 16,
          zIndex: 1,
        }}
      >
        longest streak
      </div>
      <div
        style={{
          color: colors.green4,
          fontFamily: fonts.mono,
          fontSize: "clamp(96px, 32vw, 180px)",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: -4,
          zIndex: 1,
          textShadow: `0 0 80px ${colors.green4}60`,
        }}
      >
        {days}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0 }}
        style={{
          color: colors.text,
          fontFamily: fonts.sans,
          fontSize: 22,
          marginTop: 12,
          zIndex: 1,
        }}
      >
        days straight
      </motion.div>

      <div
        style={{
          marginTop: 32,
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          maxWidth: 280,
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        {Array.from({ length: data.longestStreakDays }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.025, duration: 0.2 }}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: colors.green4,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4 }}
        style={{
          color: colors.muted,
          fontFamily: fonts.sans,
          fontSize: 14,
          marginTop: 28,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        You started <span style={{ color: colors.text }}>{dateStr}</span> and didn't stop.
      </motion.div>
    </div>
  );
}
