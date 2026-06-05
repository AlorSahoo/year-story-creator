import { motion } from "framer-motion";
import { colors, fonts, fadeUp } from "../theme";
import { useCountUp } from "../useCountUp";
import { CardShell } from "./CardShell";
import type { HeroSpec } from "@/adapters/types";

export default function HeroCard({ spec }: { spec: HeroSpec }) {
  const count = useCountUp(spec.value, 1200, 200);
  return (
    <CardShell
      eyebrow={spec.eyebrow}
      footer={
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          {spec.caption}
        </motion.span>
      }
    >
      <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            color: colors.green4,
            fontFamily: fonts.mono,
            fontSize: "clamp(72px, 24vw, 132px)",
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1,
            textShadow: `0 0 60px ${colors.green4}40`,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count.toLocaleString()}
        </div>
        <div style={{ color: colors.text, fontSize: 20, marginTop: 14, fontWeight: 500 }}>{spec.unit}</div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          style={{ color: colors.muted, fontSize: 14, marginTop: 10 }}
        >
          {spec.meta}
        </motion.div>
      </motion.div>
    </CardShell>
  );
}
