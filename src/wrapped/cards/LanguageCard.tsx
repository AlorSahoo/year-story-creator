import { motion } from "framer-motion";
import { colors, fonts, easing } from "../theme";
import { useCountUp } from "../useCountUp";
import type { CommitsDataset } from "../types";

export default function LanguageCard({ data }: { data: CommitsDataset }) {
  const top = data.languages[0];
  const pct = useCountUp(Math.round(top.share * 100), 1400, 400);
  const max = data.languages[0].share;

  return (
    <div
      style={{
        background: colors.surface,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 28px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easing }}
        style={{
          color: colors.muted,
          fontFamily: fonts.sans,
          fontSize: 13,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        your language
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: easing }}
        style={{
          color: colors.text,
          fontFamily: fonts.sans,
          fontSize: 36,
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {top.name} was your language.
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          color: colors.green4,
          fontFamily: fonts.mono,
          fontSize: 20,
          marginTop: 8,
        }}
      >
        {pct}% of your commits
      </motion.div>

      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
        {data.languages.map((lang, i) => {
          const color = i === 0 ? colors.green4 : i === 1 ? colors.green3 : colors.green2;
          return (
            <div key={lang.name}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <span style={{ color: colors.text }}>{lang.name}</span>
                <span style={{ color: colors.muted, fontFamily: fonts.mono }}>
                  {Math.round(lang.share * 100)}%
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: colors.bg,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: lang.share / max }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5 + i * 0.08,
                    ease: easing,
                  }}
                  style={{
                    height: "100%",
                    background: color,
                    transformOrigin: "left",
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
