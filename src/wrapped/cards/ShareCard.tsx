import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { colors, fonts } from "../theme";
import type { ShareSpec } from "@/adapters/types";
import { MiniClock } from "./MiniClock";
import { useWrappedState } from "../state";

const CARD_W = 300;
const CARD_H = 400;

export default function ShareCard({ spec }: { spec: ShareSpec }) {
  const cleanRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const { hideRepoNames } = useWrappedState();

  async function download() {
    if (!cleanRef.current) return;
    setBusy(true);
    try {
      const docFonts = (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts;
      if (docFonts?.ready) await docFonts.ready;
      const url = await toPng(cleanRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.download = `${spec.user.toLowerCase()}-year-in-code-${spec.year}.png`;
      a.href = url;
      a.click();
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } finally {
      setBusy(false);
    }
  }

  const footer = hideRepoNames
    ? spec.footer.replace(/github\.com\/[^ ]+/, "github.com/private")
    : spec.footer;
  const patched: ShareSpec = { ...spec, footer };
  const staticBorder = `linear-gradient(135deg, ${spec.dnaColors[0]} 0%, ${colors.green4} 50%, ${spec.dnaColors[1]} 100%)`;

  return (
    <div
      style={{
        background: colors.bg,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "max(env(safe-area-inset-top), 64px) 16px max(env(safe-area-inset-bottom), 24px)",
        gap: 20,
      }}
    >
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.1 }}
        style={{ perspective: 1000 }}
      >
        <TradingCard spec={patched} animated />
      </motion.div>

      {/* hidden static clone used for export */}
      <div style={{ position: "absolute", left: -9999, top: 0 }} aria-hidden>
        <div ref={cleanRef}>
          <TradingCard spec={patched} animated={false} staticBorder={staticBorder} />
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onClick={(e) => {
          e.stopPropagation();
          download();
        }}
        disabled={busy}
        whileTap={{ scale: 0.95 }}
        style={{
          background: saved ? colors.green4 : colors.green3,
          color: colors.bg,
          border: "none",
          borderRadius: 999,
          padding: "12px 28px",
          fontFamily: fonts.sans,
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          opacity: busy ? 0.7 : 1,
          letterSpacing: 0.3,
          position: "relative",
          zIndex: 30,
        }}
      >
        {busy ? "Generating…" : saved ? "saved ✓" : "Download share card"}
      </motion.button>
    </div>
  );
}

function TradingCard({
  spec,
  animated,
  staticBorder,
}: {
  spec: ShareSpec;
  animated: boolean;
  staticBorder?: string;
}) {
  const animatedBorder = `linear-gradient(120deg, ${spec.dnaColors[0]}, ${colors.green4}, ${spec.dnaColors[1]}, ${colors.green4}, ${spec.dnaColors[0]})`;
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        borderRadius: 18,
        padding: 2,
        background: staticBorder ?? animatedBorder,
        backgroundSize: staticBorder ? "100% 100%" : "300% 300%",
        animation: animated && !staticBorder ? "holosweep 6s ease-in-out infinite" : undefined,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 16,
          background: colors.bg,
          backgroundImage: `radial-gradient(circle, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          color: colors.text,
          fontFamily: fonts.sans,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: fonts.mono,
            fontSize: 11,
            color: colors.muted,
            letterSpacing: 1.5,
          }}
        >
          <span>● GITHUB</span>
          <span>{spec.year}</span>
        </div>

        <div style={{ marginTop: 10 }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: -1,
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            {spec.user}
          </div>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: colors.green4,
              marginTop: 4,
              letterSpacing: 1,
            }}
          >
            {spec.archetype}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
          <MiniClock hourCounts={spec.hourCounts} accent={spec.dnaColors[0]} />
        </div>

        <div
          style={{
            marginTop: "auto",
            borderTop: `1px solid ${colors.border}`,
            paddingTop: 10,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            rowGap: 6,
            columnGap: 14,
            fontFamily: fonts.mono,
            fontSize: 11,
          }}
        >
          {spec.stats.map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: colors.muted }}>{s.label}</span>
              <span style={{ color: colors.text, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 10,
            fontFamily: fonts.mono,
            fontSize: 9,
            color: colors.muted,
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          {spec.footer}
        </div>
      </div>
      <style>{`@keyframes holosweep { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }`}</style>
    </div>
  );
}
