// Static SVG re-render of the 24-hour clock for the share card art.
import { colors, fonts } from "../theme";

const SIZE = 140;
const C = SIZE / 2;
const RO = SIZE / 2 - 10;
const RI = 26;

export function MiniClock({ hourCounts, accent = colors.green4 }: { hourCounts: number[]; accent?: string }) {
  const max = Math.max(...hourCounts, 1);
  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {Array.from({ length: 24 }).map((_, h) => {
        const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
        return (
          <line
            key={h}
            x1={C + Math.cos(a) * (RO + 1)}
            y1={C + Math.sin(a) * (RO + 1)}
            x2={C + Math.cos(a) * (RO + (h % 6 === 0 ? 6 : 3))}
            y2={C + Math.sin(a) * (RO + (h % 6 === 0 ? 6 : 3))}
            stroke={colors.border}
            strokeWidth={0.8}
          />
        );
      })}
      {hourCounts.map((count, h) => {
        const dots = Math.max(1, Math.round((count / max) * 12));
        const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
        return (
          <g key={h}>
            {Array.from({ length: dots }).map((_, i) => {
              const seed = (h * 17 + i * 31) % 100;
              const r = RI + 2 + (seed / 100) * (RO - RI - 6);
              return (
                <circle
                  key={i}
                  cx={C + Math.cos(a) * r}
                  cy={C + Math.sin(a) * r}
                  r={1.1}
                  fill={accent}
                  opacity={0.85}
                />
              );
            })}
          </g>
        );
      })}
      <text
        x={C}
        y={C + 3}
        textAnchor="middle"
        fontFamily={fonts.mono}
        fontSize={9}
        fill={colors.muted}
        letterSpacing={1}
      >
        24H
      </text>
    </svg>
  );
}
