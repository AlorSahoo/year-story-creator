import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { colors, fonts } from "../theme";
import type { ColdOpenSpec } from "@/adapters/types";
import { useReducedMotion } from "../useReducedMotion";

export default function ColdOpenCard({ spec }: { spec: ColdOpenSpec }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<0 | 1 | 2>(reduced ? 2 : 0);
  const [typed, setTyped] = useState(reduced ? spec.commandLine : "");

  useEffect(() => {
    if (reduced) return;
    let iv: ReturnType<typeof setInterval>;
    const t1 = setTimeout(() => {
      setPhase(1);
      let i = 0;
      iv = setInterval(() => {
        i++;
        setTyped(spec.commandLine.slice(0, i));
        if (i >= spec.commandLine.length) {
          clearInterval(iv);
          setTimeout(() => setPhase(2), 500);
        }
      }, 22);
    }, 600);
    return () => {
      clearTimeout(t1);
      clearInterval(iv);
    };
  }, [spec.commandLine, reduced]);

  return (
    <div
      style={{
        background: "#000",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0 24px",
        color: colors.text,
        fontFamily: fonts.mono,
        position: "relative",
      }}
    >
      {phase < 2 ? (
        <div style={{ fontSize: 13, color: colors.green4, wordBreak: "break-word", lineHeight: 1.5 }}>
          <span style={{ color: colors.muted }}>{spec.prompt} </span>
          {typed}
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 16,
              background: colors.green4,
              marginLeft: 2,
              verticalAlign: "middle",
              animation: "blink 1s steps(2) infinite",
            }}
          />
        </div>
      ) : (
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: fonts.sans, fontSize: 36, fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.5 }}
          >
            {spec.title}
          </motion.div>
          {spec.postBeat ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              style={{
                fontFamily: fonts.sans,
                fontSize: 22,
                fontWeight: 600,
                color: colors.muted,
                marginTop: 12,
                fontStyle: "italic",
              }}
            >
              {spec.postBeat}
            </motion.div>
          ) : null}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 2 ? 1 : 0 }}
        transition={{ delay: phase === 2 ? 0.4 : 0, duration: 0.6 }}
        style={{
          position: "absolute",
          bottom: "max(env(safe-area-inset-bottom), 56px)",
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: fonts.mono,
          fontSize: 12,
          color: colors.muted,
          letterSpacing: 2,
          textTransform: "uppercase",
          animation: phase === 2 && !reduced ? "softpulse 1.6s ease-in-out infinite" : undefined,
        }}
      >
        {spec.cta}
      </motion.div>
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes softpulse { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
      `}</style>
    </div>
  );
}
