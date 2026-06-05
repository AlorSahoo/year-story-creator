import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { colors, fonts, easing } from "../theme";
import { useCountUp } from "../useCountUp";
import type { CommitsDataset } from "../types";

function useTypewriter(text: string, delay = 300, speed = 35) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setOut(text.slice(0, i));
        if (i >= text.length) clearInterval(iv);
      }, speed);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay, speed]);
  return out;
}

export default function TopRepoCard({ data }: { data: CommitsDataset }) {
  const top = data.topRepos[0];
  const typed = useTypewriter(top.name, 400);
  const commits = useCountUp(top.commits, 1200, 400 + top.name.length * 35);
  const max = top.commits;

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
          marginBottom: 16,
        }}
      >
        your most-committed repo
      </motion.div>

      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: "clamp(26px, 7vw, 36px)",
          color: colors.green4,
          fontWeight: 700,
          minHeight: 48,
          wordBreak: "break-all",
        }}
      >
        <span style={{ color: colors.muted }}>$ </span>
        {typed}
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 24,
            background: colors.green4,
            marginLeft: 2,
            verticalAlign: "middle",
            animation: "blink 1s steps(2) infinite",
          }}
        />
      </div>

      <div
        style={{
          color: colors.muted,
          fontFamily: fonts.mono,
          fontSize: 14,
          marginTop: 12,
        }}
      >
        <span style={{ color: colors.text }}>{commits.toLocaleString()}</span> commits ·{" "}
        <span style={{ color: colors.text }}>{top.lines.toLocaleString()}</span> lines
      </div>

      <div
        style={{
          marginTop: 32,
          height: 1,
          background: colors.border,
        }}
      />

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        {data.topRepos.slice(1).map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + i * 0.1 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: fonts.mono,
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              <span style={{ color: colors.text }}>{r.name}</span>
              <span style={{ color: colors.muted }}>{r.commits}</span>
            </div>
            <div style={{ height: 4, background: colors.bg, borderRadius: 2 }}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: r.commits / max }}
                transition={{ delay: 1.3 + i * 0.1, duration: 0.6, ease: easing }}
                style={{
                  height: "100%",
                  background: colors.green2,
                  transformOrigin: "left",
                  borderRadius: 2,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}
