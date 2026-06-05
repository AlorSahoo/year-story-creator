import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { colors, fonts } from "../theme";
import type { CommitsDataset } from "../types";

export default function ShareCard({ data }: { data: CommitsDataset }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const max = data.languages[0].share;
  const topLangs = data.languages.slice(0, 3);

  async function download() {
    if (!ref.current) return;
    setBusy(true);
    try {
      if ((document as any).fonts?.ready) await (document as any).fonts.ready;
      const url = await toPng(ref.current, { pixelRatio: 3, cacheBust: true });
      const a = document.createElement("a");
      a.download = `${data.userName}-year-in-code-${data.year}.png`;
      a.href = url;
      a.click();
    } finally {
      setBusy(false);
    }
  }

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
        padding: "40px 16px",
        gap: 20,
        overflow: "auto",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ width: 320, transformOrigin: "center top" }}
      >
        <div
          ref={ref}
          style={{
            width: 320,
            height: 568,
            backgroundColor: colors.bg,
            backgroundImage: `radial-gradient(circle, ${colors.border} 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
            borderRadius: 16,
            border: `1px solid ${colors.border}`,
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            color: colors.text,
            fontFamily: fonts.sans,
          }}
        >
          <div
            style={{
              color: colors.muted,
              fontFamily: fonts.mono,
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            ● github
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 80,
                fontWeight: 800,
                color: colors.green4,
                letterSpacing: -2,
                lineHeight: 1,
              }}
            >
              {data.totalCommits.toLocaleString()}
            </div>
            <div style={{ color: colors.muted, fontSize: 16, marginTop: 8 }}>commits</div>
            <div style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
              across {data.totalRepos} repos
            </div>
          </div>

          <div style={{ height: 1, background: colors.border, margin: "12px 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topLangs.map((l, i) => (
              <div key={l.name}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    marginBottom: 3,
                    fontFamily: fonts.mono,
                  }}
                >
                  <span style={{ color: colors.text }}>{l.name}</span>
                  <span style={{ color: colors.muted }}>{Math.round(l.share * 100)}%</span>
                </div>
                <div style={{ height: 5, background: colors.surface, borderRadius: 3 }}>
                  <div
                    style={{
                      width: `${(l.share / max) * 100}%`,
                      height: "100%",
                      background: i === 0 ? colors.green4 : i === 1 ? colors.green3 : colors.green2,
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: colors.border, margin: "16px 0 12px" }} />

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: colors.text,
                letterSpacing: -0.5,
              }}
            >
              {data.userName}
            </div>
            <div
              style={{
                fontSize: 12,
                color: colors.muted,
                marginTop: 2,
                fontFamily: fonts.mono,
              }}
            >
              Year in Code · {data.year}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={download}
        disabled={busy}
        style={{
          background: colors.green3,
          color: colors.bg,
          border: "none",
          borderRadius: 8,
          padding: "12px 28px",
          fontFamily: fonts.sans,
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? "Generating…" : "Download share card"}
      </motion.button>
    </div>
  );
}
