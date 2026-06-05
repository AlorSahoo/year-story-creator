import { motion } from "framer-motion";
import { colors, fonts } from "../theme";
import { useCountUp } from "../useCountUp";
import type { CommitsDataset } from "../types";

export default function CommitVolumeCard({ data }: { data: CommitsDataset }) {
  const count = useCountUp(data.totalCommits, 1600, 500);
  return (
    <div
      style={{
        background: colors.bg,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{
          color: colors.muted,
          fontFamily: fonts.sans,
          fontSize: 14,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        {data.year} in code
      </motion.div>
      <div
        style={{
          color: colors.green4,
          fontFamily: fonts.mono,
          fontSize: "clamp(72px, 24vw, 140px)",
          fontWeight: 800,
          letterSpacing: -3,
          lineHeight: 1,
          textShadow: `0 0 60px ${colors.green4}40`,
        }}
      >
        {count.toLocaleString()}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        style={{
          color: colors.text,
          fontFamily: fonts.sans,
          fontSize: 22,
          marginTop: 16,
          fontWeight: 500,
        }}
      >
        commits shipped
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.5 }}
        style={{
          color: colors.muted,
          fontFamily: fonts.sans,
          fontSize: 14,
          marginTop: 12,
        }}
      >
        across {data.totalRepos} repos
      </motion.div>
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 4,
          opacity: 0.25,
          filter: "blur(1px)",
        }}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: [colors.green1, colors.green2, colors.green3, colors.green4][i % 4],
            }}
          />
        ))}
      </div>
    </div>
  );
}
