import { motion } from "framer-motion";
import { useEffect } from "react";
import { CardShell } from "./CardShell";
import { colors, fonts, fadeUp } from "../theme";
import type { CompositionSpec } from "@/adapters/types";
import { useWrappedState } from "../state";
import { useCountUp } from "../useCountUp";

export default function CompositionCard({ spec }: { spec: CompositionSpec }) {
  const { setDna } = useWrappedState();
  useEffect(() => {
    const a = spec.segments[0]?.color ?? "#39d353";
    const b = spec.segments[1]?.color ?? "#3fb950";
    setDna(a, b);
  }, [spec, setDna]);

  return (
    <CardShell
      eyebrow={spec.eyebrow}
      footer={
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.5 }}>
          {spec.caption}
        </motion.span>
      }
    >
      <motion.div variants={fadeUp} style={{ width: "100%" }}>
        {/* DNA strand */}
        <div
          style={{
            width: "100%",
            height: 14,
            display: "flex",
            borderRadius: 999,
            overflow: "hidden",
            background: colors.surface,
          }}
        >
          {spec.segments.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ width: 0 }}
              animate={{ width: `${s.value * 100}%` }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: s.color, height: "100%" }}
            />
          ))}
        </div>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          {spec.segments.map((s, i) => (
            <Row key={s.label} s={s} delay={0.4 + i * 0.1} />
          ))}
        </div>
      </motion.div>
    </CardShell>
  );
}

function Row({ s, delay }: { s: { label: string; value: number; color: string }; delay: number }) {
  const pct = useCountUp(Math.round(s.value * 100), 900, delay * 1000);
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: fonts.sans }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block" }} />
        <span style={{ color: colors.text, fontSize: 14 }}>{s.label}</span>
      </div>
      <span
        style={{
          color: colors.muted,
          fontFamily: fonts.mono,
          fontSize: 13,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {pct}%
      </span>
    </motion.div>
  );
}
