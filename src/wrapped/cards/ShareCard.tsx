import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { colors, fonts } from "../theme";
import type { ShareSpec, ShareBack } from "@/adapters/types";
import { MiniClock } from "./MiniClock";
import { useWrappedState } from "../state";

const CARD_W = 300;
const CARD_H = 400;

export default function ShareCard({ spec }: { spec: ShareSpec }) {
  const frontCleanRef = useRef<HTMLDivElement>(null);
  const backCleanRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { hideRepoNames } = useWrappedState();

  const footer = hideRepoNames
    ? spec.footer.replace(/github\.com\/[^ ]+/, "github.com/private")
    : spec.footer;
  const patched: ShareSpec = { ...spec, footer };

  // Privacy: scrub repo-name reference from back flags too.
  const backPatched: ShareBack = hideRepoNames
    ? {
        ...spec.back,
        redFlags: spec.back.redFlags.map((f) =>
          /one repo \d+%/.test(f) ? "gave my #1 repo a lot of myself" : f
        ),
        footer: spec.back.footer.replace(/github\.com\/[^ ]+/, "github.com/private"),
      }
    : spec.back;

  async function download() {
    const node = flipped ? backCleanRef.current : frontCleanRef.current;
    if (!node) return;
    setBusy(true);
    try {
      const docFonts = (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts;
      if (docFonts?.ready) await docFonts.ready;
      const url = await toPng(node, { pixelRatio: 2, cacheBust: true });
      const slug = flipped
        ? `${spec.user.toLowerCase()}-${spec.backFilenameSuffix}-${spec.year}.png`
        : `${spec.user.toLowerCase()}-year-in-code-${spec.year}.png`;
      const a = document.createElement("a");
      a.download = slug;
      a.href = url;
      a.click();
      setSaved(true);
      setToast("pushed to camera roll ✓");
      setTimeout(() => {
        setSaved(false);
        setToast(null);
      }, 2400);
    } catch {
      try {
        const url = await toPng(node, { pixelRatio: 2, cacheBust: true });
        window.open(url, "_blank");
        setToast("long-press to save");
        setTimeout(() => setToast(null), 2400);
      } catch {
        setToast("export failed — try again");
        setTimeout(() => setToast(null), 2400);
      }
    } finally {
      setBusy(false);
    }
  }

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
        gap: 14,
      }}
    >
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.1 }}
        style={{ perspective: 1200 }}
      >
        <motion.div
          onClick={(e) => {
            e.stopPropagation();
            setFlipped((f) => !f);
          }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          style={{
            width: CARD_W,
            height: CARD_H,
            position: "relative",
            transformStyle: "preserve-3d",
            cursor: "pointer",
            zIndex: 30,
          }}
        >
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
            <TradingCardFront spec={patched} animated />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <TradingCardBack spec={patched} back={backPatched} animated />
          </div>
        </motion.div>
      </motion.div>

      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 11,
          color: colors.muted,
          letterSpacing: 1.5,
          textTransform: "lowercase",
        }}
      >
        tap to flip ↻
      </div>

      {/* hidden static clones for export */}
      <div style={{ position: "absolute", left: -9999, top: 0 }} aria-hidden>
        <div ref={frontCleanRef}>
          <TradingCardFront spec={patched} animated={false} staticBorder={staticBorder} />
        </div>
        <div ref={backCleanRef}>
          <TradingCardBack spec={patched} back={backPatched} animated={false} staticBorder={staticBorder} />
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
        {busy ? "Generating…" : saved ? "saved ✓" : flipped ? "Download back side" : "Download share card"}
      </motion.button>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              bottom: 90,
              background: "rgba(13,17,23,0.95)",
              border: `1px solid ${colors.border}`,
              color: colors.text,
              fontFamily: fonts.mono,
              fontSize: 12,
              padding: "8px 14px",
              borderRadius: 999,
              zIndex: 50,
            }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CardFrame({
  spec,
  animated,
  staticBorder,
  children,
}: {
  spec: ShareSpec;
  animated: boolean;
  staticBorder?: string;
  children: React.ReactNode;
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
        {children}
      </div>
      <style>{`@keyframes holosweep { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }`}</style>
    </div>
  );
}

function TradingCardFront({
  spec,
  animated,
  staticBorder,
}: {
  spec: ShareSpec;
  animated: boolean;
  staticBorder?: string;
}) {
  const displayName = spec.frontTitleOverride ?? spec.user.toUpperCase();
  return (
    <CardFrame spec={spec} animated={animated} staticBorder={staticBorder}>
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
            fontSize: spec.frontTitleOverride ? 22 : 30,
            fontWeight: 800,
            letterSpacing: -1,
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {displayName}
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
    </CardFrame>
  );
}

function TradingCardBack({
  spec,
  back,
  animated,
  staticBorder,
}: {
  spec: ShareSpec;
  back: ShareBack;
  animated: boolean;
  staticBorder?: string;
}) {
  return (
    <CardFrame spec={spec} animated={animated} staticBorder={staticBorder}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: fonts.mono,
          fontSize: 9,
          color: colors.muted,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        <span>{back.header}</span>
        <span>{back.est}</span>
      </div>

      <div
        style={{
          marginTop: 10,
          fontFamily: fonts.mono,
          fontSize: 10.5,
          color: colors.text,
          lineHeight: 1.45,
        }}
      >
        {back.profileLine}
      </div>

      <div
        style={{
          marginTop: 10,
          fontFamily: fonts.mono,
          fontSize: 10.5,
          color: colors.muted,
          lineHeight: 1.5,
          fontStyle: "italic",
        }}
      >
        {back.seeking}
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          fontFamily: fonts.mono,
          fontSize: 9.5,
        }}
      >
        <div>
          <div style={{ color: colors.green4, marginBottom: 4 }}>{back.greenLabel}</div>
          {back.greenFlags.map((f, i) => (
            <div key={i} style={{ color: colors.text, lineHeight: 1.4 }}>
              · {f}
            </div>
          ))}
        </div>
        <div>
          <div style={{ color: "#f85149", marginBottom: 4 }}>{back.redLabel}</div>
          {back.redFlags.map((f, i) => (
            <div key={i} style={{ color: colors.text, lineHeight: 1.4 }}>
              · {f}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 10,
          borderTop: `1px solid ${colors.border}`,
          fontFamily: fonts.mono,
          fontSize: 10,
          color: colors.text,
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        {back.gagLine}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: fonts.mono,
          fontSize: 9,
          color: colors.muted,
          textAlign: "center",
          letterSpacing: 0.5,
        }}
      >
        {back.footer}
      </div>
    </CardFrame>
  );
}
