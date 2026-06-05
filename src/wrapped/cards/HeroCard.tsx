import { motion } from "framer-motion";
import { colors, fonts, fadeUp } from "../theme";
import { useCountUp } from "../useCountUp";
import { CardShell } from "./CardShell";
import type { HeroSpec } from "@/adapters/types";

export default function HeroCard({ spec }: { spec: HeroSpec }) {
  const count = useCountUp(spec.value, 1200, 200);

  if (spec.emptyHeroSquare) {
    return (
      <CardShell
        eyebrow={spec.eyebrow}
        footer={
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.6 }}>
            {spec.caption}
          </motion.span>
        }
      >
        <motion.div
          variants={fadeUp}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}
        >
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 110,
              height: 110,
              borderRadius: 12,
              background: colors.green2,
              boxShadow: `0 0 60px ${colors.green4}66`,
              border: `1px solid ${colors.green4}`,
            }}
          />
          <div style={{ color: colors.muted, fontSize: 14, fontFamily: fonts.mono, letterSpacing: 1 }}>day 1</div>
        </motion.div>
      </CardShell>
    );
  }

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
        {spec.flexLine ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4, duration: 0.5 }}
              style={{ color: colors.slate, fontSize: 12, marginTop: 22, textAlign: "center", maxWidth: 280 }}
            >
              {spec.flexLine}
            </motion.div>
            {spec.flexFootnote ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.2, duration: 0.5 }}
                style={{ color: colors.slate, fontSize: 10, marginTop: 4, fontStyle: "italic" }}
              >
                {spec.flexFootnote}
              </motion.div>
            ) : null}
          </>
        ) : null}
      </motion.div>
    </CardShell>
  );
}
