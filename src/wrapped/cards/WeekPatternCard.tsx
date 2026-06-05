import { motion } from "framer-motion";
import { colors, fonts, easing } from "../theme";
import type { CommitsDataset } from "../types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeekPatternCard({ data }: { data: CommitsDataset }) {
  const weekend = data.dayOfWeekCommits[5] + data.dayOfWeekCommits[6];
  const heavyWeekend = weekend > data.totalCommits * 0.15;
  const headline = heavyWeekend ? "You don't take weekends off." : "You live for weekdays.";
  const max = Math.max(...data.dayOfWeekCommits);
  const peakIdx = data.dayOfWeekCommits.indexOf(max);

  return (
    <div
      style={{
        background: colors.bg,
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
          marginBottom: 12,
        }}
      >
        your rhythm
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: easing }}
        style={{
          color: colors.text,
          fontFamily: fonts.sans,
          fontSize: 32,
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.15,
        }}
      >
        {headline}
      </motion.h1>

      <div
        style={{
          marginTop: 40,
          height: 220,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
          position: "relative",
        }}
      >
        {[0.25, 0.5, 0.75].map((p) => (
          <div
            key={p}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: `${p * 100}%`,
              height: 1,
              background: colors.border,
              opacity: 0.4,
            }}
          />
        ))}
        {data.dayOfWeekCommits.map((count, i) => {
          const h = (count / max) * 100;
          const isWeekend = i >= 5;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                justifyContent: "flex-end",
                position: "relative",
                zIndex: 1,
              }}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.7, delay: 0.4 + i * 0.06, ease: easing }}
                style={{
                  width: "100%",
                  background: isWeekend ? colors.green1 : colors.green3,
                  borderRadius: "4px 4px 0 0",
                  minHeight: 4,
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
        {DAYS.map((d, i) => (
          <div
            key={d}
            style={{
              flex: 1,
              textAlign: "center",
              color: i === peakIdx ? colors.green4 : colors.muted,
              fontFamily: fonts.sans,
              fontSize: 11,
              fontWeight: i === peakIdx ? 700 : 400,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          marginTop: 28,
          color: colors.muted,
          fontFamily: fonts.sans,
          fontSize: 14,
          textAlign: "center",
        }}
      >
        {DAYS[peakIdx]} was your peak.{" "}
        <span style={{ color: colors.text, fontFamily: fonts.mono }}>{max}</span> commits.
      </motion.div>
    </div>
  );
}
