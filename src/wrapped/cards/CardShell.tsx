import { motion } from "framer-motion";
import { colors, fonts, stage, fadeUp } from "../theme";

/**
 * One vertical template every story card uses.
 * - eyebrow (uppercase label) below the progress dots
 * - stage (vertically centered)
 * - footer caption anchored near the bottom
 */
export function CardShell({
  eyebrow,
  children,
  footer,
}: {
  eyebrow?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <motion.div
      variants={stage}
      initial="hidden"
      animate="show"
      style={{
        background: colors.bg,
        height: "100%",
        width: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        padding:
          "max(env(safe-area-inset-top), 64px) 24px max(env(safe-area-inset-bottom), 88px)",
        position: "relative",
        overflow: "hidden",
        color: colors.text,
        fontFamily: fonts.sans,
      }}
    >
      <motion.div
        variants={fadeUp}
        style={{
          color: colors.muted,
          fontFamily: fonts.sans,
          fontSize: 12,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontWeight: 600,
          minHeight: 16,
        }}
      >
        {eyebrow ?? "\u00A0"}
      </motion.div>
      <motion.div
        variants={fadeUp}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 0,
        }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={fadeUp}
        style={{
          color: colors.muted,
          fontFamily: fonts.sans,
          fontSize: 14,
          textAlign: "center",
          lineHeight: 1.4,
          minHeight: 20,
        }}
      >
        {footer}
      </motion.div>
    </motion.div>
  );
}
