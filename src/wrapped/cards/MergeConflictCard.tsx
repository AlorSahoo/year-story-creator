import { motion } from "framer-motion";
import { CardShell } from "./CardShell";
import { colors, fonts } from "../theme";
import type { MergeConflictSpec } from "@/adapters/types";

export default function MergeConflictCard({ spec, onRetry }: { spec: MergeConflictSpec; onRetry: () => void }) {
  return (
    <CardShell eyebrow={spec.eyebrow}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 13,
            color: colors.muted,
            background: "#000",
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: 16,
            width: "100%",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
          }}
        >
{`<<<<<<< HEAD
${spec.title}
=======
${spec.body}
>>>>>>> data`}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          style={{
            background: colors.green3,
            color: colors.bg,
            border: "none",
            borderRadius: 999,
            padding: "10px 22px",
            fontFamily: fonts.sans,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            position: "relative",
            zIndex: 30,
          }}
        >
          {spec.cta}
        </button>
      </motion.div>
    </CardShell>
  );
}
