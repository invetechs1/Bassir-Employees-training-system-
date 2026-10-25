/**
 * Small, dependency-free chart primitives rendered as inline SVG.
 * These are server components (no client JS) — safe to use in RSC pages.
 */

export function Avatar({
  seed,
  label,
  size = 30,
  color,
}: {
  seed: string;
  label: string;
  size?: number;
  color: string;
}) {
  return (
    <span
      title={label}
      style={{ background: color, width: size, height: size, fontSize: size * 0.38 }}
      className="inline-grid flex-none place-items-center rounded-full font-bold text-white"
    >
      {label}
    </span>
  );
}

export function ProgressBar({
  pct,
  variant = "green",
}: {
  pct: number;
  variant?: "green" | "blue" | "amber";
}) {
  const fill =
    variant === "blue"
      ? "linear-gradient(90deg,#2953d9,#1c3aa8)"
      : variant === "amber"
        ? "linear-gradient(90deg,#b9760a,#e0a53c)"
        : "linear-gradient(90deg,#0f9d6e,#14b57f)";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: fill }}
      />
    </div>
  );
}

export function Donut({
  pct,
  color,
  label,
}: {
  pct: number;
  color: string;
  label?: string;
}) {
  const r = 48;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <svg viewBox="0 0 120 120" width={112} height={112} className="flex-none">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#eef2f8" strokeWidth="13" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="13"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="58" textAnchor="middle" fontSize="25" fontWeight="750" fill="currentColor">
        {pct}%
      </text>
      {label ? (
        <text x="60" y="78" textAnchor="middle" fontSize="10.5" fill="#7a869c">
          {label}
        </text>
      ) : null}
    </svg>
  );
}

export function AreaChart({
  values,
  color = "#2953d9",
}: {
  values: number[];
  color?: string;
}) {
  const w = 300;
  const h = 90;
  const max = Math.max(...values) * 1.15 || 1;
  const step = w / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => [i * step, h - (v / max) * h] as const);
  const line = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const fill =
    `M0 ${h} ` +
    pts.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") +
    ` L${w} ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <path d={fill} fill={color} opacity="0.13" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="2.6" fill={color} />
      ))}
    </svg>
  );
}
