import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CardShell } from "./CardShell";
import { colors, fonts, fadeUp } from "../theme";
import type { DevotionSpec } from "@/adapters/types";
import { useWrappedState } from "../state";
import { useReducedMotion } from "../useReducedMotion";

export default function DevotionCard({ spec }: { spec: DevotionSpec }) {
  const { hidePrivateNames, setHidePrivateNames } = useWrappedState();
  const reduced = useReducedMotion();
  const displayName = hidePrivateNames ? spec.privateName : spec.primaryName;

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
  const encore = spec.encore;
  const encoreText = encore
    ? hidePrivateNames
      ? { headline: `Most replayed: one song — ${encore.headline.match(/— (.+)$/)?.[1] ?? ""}`, sub: encore.sub }
      : encore
    : null;

  return (
    <CardShell
      eyebrow={spec.eyebrow}
      footer={
        spec.flingLine ? (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6, duration: 0.5 }}>
            {hidePrivateNames && spec.flingLineWhenHidden ? spec.flingLineWhenHidden : spec.flingLine}
          </motion.span>
        ) : null
      }
    >
      <motion.div variants={fadeUp} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: "clamp(20px, 6vw, 28px)",
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

        <div style={{ display: "flex", gap: 3, width: "100%" }}>
          {spec.weeks.map((w, i) => (
            <motion.div
              key={i}
              initial={{ background: colors.surface, opacity: 0.3 }}
              animate={{ background: w ? colors.green4 : "#161b22", opacity: 1 }}
              transition={{ delay: reduced ? 0 : (fillStart + i * 20) / 1000, duration: 0.2 }}
              style={{ flex: 1, height: 20, borderRadius: 3, border: `1px solid ${colors.border}` }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (fillStart + 52 * 20 + 200) / 1000 }}
          style={{ color: colors.text, fontSize: 15, lineHeight: 1.5, textAlign: "center" }}
        >
          {spec.weeksLine}
          <br />
          <span style={{ color: colors.muted, fontSize: 13 }}>{spec.shareLine}</span>
        </motion.div>

        {encoreText ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (fillStart + 52 * 20 + 800) / 1000, duration: 0.6 }}
            style={{
              borderTop: `1px solid ${colors.border}`,
              paddingTop: 12,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ color: colors.green4, fontFamily: fonts.mono, fontSize: 13, fontWeight: 600 }}>
              {encoreText.headline}
            </div>
            <div style={{ color: colors.muted, fontSize: 12, fontStyle: "italic", lineHeight: 1.4 }}>
              {encoreText.sub}
            </div>
          </motion.div>
        ) : null}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setHidePrivateNames(!hidePrivateNames);
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
          {hidePrivateNames ? spec.privacyHiddenLabel : spec.privacyHideLabel}
        </button>
      </motion.div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </CardShell>
  );
}
