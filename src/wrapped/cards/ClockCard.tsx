import { motion } from "framer-motion";
import { useMemo } from "react";
import { CardShell } from "./CardShell";
import { colors, fonts } from "../theme";
import type { ClockSpec } from "@/adapters/types";
import { useReducedMotion } from "../useReducedMotion";

const SIZE = 280;
const CENTER = SIZE / 2;
const R_OUTER = SIZE / 2 - 18;
const R_INNER = 60;

export default function ClockCard({ spec }: { spec: ClockSpec }) {
  const reduced = useReducedMotion();

  // pre-compute dot positions
  const dots = useMemo(() => {
    return spec.eventHours.map((h, i) => {
      // angle: hour 0 at top, clockwise
      const angle = (h / 24) * Math.PI * 2 - Math.PI / 2;
      // radial jitter, deterministic
      const seed = (i * 9301 + 49297) % 233280;
      const jitter = (seed / 233280) * (R_OUTER - R_INNER - 8);
      const r = R_INNER + 4 + jitter;
      return { x: CENTER + Math.cos(angle) * r, y: CENTER + Math.sin(angle) * r, h };
    });
  }, [spec.eventHours]);

  // densest hour arc
  const peakHour = useMemo(() => spec.hourCounts.indexOf(Math.max(...spec.hourCounts)), [spec.hourCounts]);
  const peakAngle = ((peakHour + 0.5) / 24) * 360 - 90;

  const animDuration = 2.0; // seconds for full rain
  const total = dots.length || 1;

  return (
    <CardShell
      eyebrow={spec.eyebrow}
      footer={
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.0, duration: 0.5 }}>
          {spec.caption}
        </motion.span>
      }
    >
      <div style={{ position: "relative", width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* ticks */}
          {Array.from({ length: 24 }).map((_, h) => {
            const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
            const r1 = R_OUTER + 2;
            const r2 = R_OUTER + (h % 6 === 0 ? 10 : 5);
            return (
              <line
                key={h}
                x1={CENTER + Math.cos(a) * r1}
                y1={CENTER + Math.sin(a) * r1}
                x2={CENTER + Math.cos(a) * r2}
                y2={CENTER + Math.sin(a) * r2}
                stroke={colors.border}
                strokeWidth={1}
              />
            );
          })}
          {/* hour labels */}
          {[0, 6, 12, 18].map((h) => {
            const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
            const r = R_OUTER + 22;
            return (
              <text
                key={h}
                x={CENTER + Math.cos(a) * r}
                y={CENTER + Math.sin(a) * r + 4}
                fill={colors.muted}
                fontSize={10}
                fontFamily={fonts.mono}
                textAnchor="middle"
              >
                {String(h).padStart(2, "0")}
              </text>
            );
          })}
          {/* dots */}
          {dots.map((d, i) => {
            const delay = reduced ? 0 : (i / total) * animDuration;
            return (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={1.4}
                fill={colors.green4}
                style={{
                  opacity: reduced ? 0.8 : 0,
                  animation: reduced ? undefined : `dotIn 0.4s ease-out ${delay}s forwards`,
                }}
              />
            );
          })}
          {/* peak glow sweep */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ delay: animDuration + 0.2, duration: 1.2 }}
            style={{ transformOrigin: `${CENTER}px ${CENTER}px`, transform: `rotate(${peakAngle}deg)` }}
          >
            <path
              d={`M ${CENTER} ${CENTER} L ${CENTER - 40} ${CENTER - R_OUTER - 4} A ${R_OUTER + 4} ${R_OUTER + 4} 0 0 1 ${
                CENTER + 40
              } ${CENTER - R_OUTER - 4} Z`}
              fill={`${colors.green4}55`}
            />
          </motion.g>
        </svg>

        {/* archetype stamp */}
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: animDuration + 0.6, type: "spring", stiffness: 280, damping: 16 }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: 22,
              fontWeight: 800,
              color: colors.text,
              padding: "8px 16px",
              borderRadius: 8,
              background: "rgba(13,17,23,0.85)",
              border: `1px solid ${colors.green4}80`,
              letterSpacing: -0.3,
            }}
          >
            {spec.archetype}
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes dotIn { from { opacity: 0; transform: scale(0); transform-origin: center } to { opacity: 0.9; transform: scale(1) } }`}</style>
    </CardShell>
  );
}
