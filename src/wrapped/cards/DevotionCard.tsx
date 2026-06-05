import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CardShell } from "./CardShell";
import { colors, fonts, fadeUp } from "../theme";
import type { DevotionSpec } from "@/adapters/types";
import { useWrappedState } from "../state";
import { useReducedMotion } from "../useReducedMotion";

export default function DevotionCard({ spec }: { spec: DevotionSpec }) {
  const { hideRepoNames, setHideRepoNames } = useWrappedState();
  const reduced = useReducedMotion();
  const displayName = hideRepoNames ? "your #1 repo" : spec.primaryName;

  const [typed, setTyped] = useState(reduced ? displayName : "");
  useEffect(() => {
    if (reduced) {
      setTyped(displayName);
      return;
    }
    setTyped("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(displayName.slice(0, i));
      if (i >= displayName.length) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, [displayName, reduced]);

  const fillStart = 400 + displayName.length * 40 + 200;

  return (
    <CardShell
      eyebrow={spec.eyebrow}
      footer={
        spec.flingLine ? (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6, duration: 0.5 }}>
            {hideRepoNames && spec.flingName ? "Your fling: a one-commit repo. Never again." : spec.flingLine}
          </motion.span>
        ) : null
      }
    >
      <motion.div variants={fadeUp} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: "clamp(22px, 6.5vw, 30px)",
            color: colors.green4,
            fontWeight: 700,
            wordBreak: "break-all",
            lineHeight: 1.2,
          }}
        >
          <span style={{ color: colors.muted }}>$ </span>
          {typed}
          <span
            style={{
              display: "inline-block",
              width: 9,
              height: 22,
              background: colors.green4,
              marginLeft: 2,
              verticalAlign: "middle",
              animation: "blink 1s steps(2) infinite",
            }}
          />
        </div>

        {/* 52-week strip */}
        <div style={{ display: "flex", gap: 3, width: "100%" }}>
          {spec.weeks.map((w, i) => (
            <motion.div
              key={i}
              initial={{ background: colors.surface, opacity: 0.3 }}
              animate={{
                background: w ? colors.green4 : "#161b22",
                opacity: 1,
              }}
              transition={{ delay: reduced ? 0 : (fillStart + i * 20) / 1000, duration: 0.2 }}
              style={{
                flex: 1,
                height: 22,
                borderRadius: 3,
                border: `1px solid ${colors.border}`,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (fillStart + 52 * 20 + 200) / 1000 }}
          style={{ color: colors.text, fontSize: 16, lineHeight: 1.5, textAlign: "center" }}
        >
          You came back{" "}
          <span style={{ color: colors.green4, fontFamily: fonts.mono, fontVariantNumeric: "tabular-nums" }}>
            {spec.weeksWith} of {spec.weeksTotal}
          </span>{" "}
          weeks.
          <br />
          <span style={{ color: colors.muted, fontSize: 14 }}>
            {spec.shareOfTotalPct}% of everything you shipped lived here.
          </span>
        </motion.div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setHideRepoNames(!hideRepoNames);
          }}
          style={{
            alignSelf: "center",
            background: "transparent",
            border: `1px solid ${colors.border}`,
            color: colors.muted,
            fontFamily: fonts.sans,
            fontSize: 11,
            padding: "6px 12px",
            borderRadius: 999,
            cursor: "pointer",
            position: "relative",
            zIndex: 30,
          }}
        >
          {hideRepoNames ? "✓ repo names hidden" : "hide repo names"}
        </button>
      </motion.div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </CardShell>
  );
}
