"use client";

interface IcebergLogoProps {
  /** 0 = fully public (blue), 1 = fully private (purple) */
  nightOpacity: number;
  size?: number;
}

function lerp(a: number, b: number, t: number) {
  return Math.round(a * t + b * (1 - t));
}

export function IcebergLogo({ nightOpacity, size = 96 }: IcebergLogoProps) {
  // Private palette: purple #7C3AED → indigo #6366F1
  // Public palette:  blue #2563EB  → sky   #3B82F6
  const stroke1 = [
    lerp(124, 37,  nightOpacity), // R
    lerp(58,  99,  nightOpacity), // G
    lerp(237, 235, nightOpacity), // B
  ];
  const stroke2 = [
    lerp(99,  59,  nightOpacity),
    lerp(102, 130, nightOpacity),
    lerp(241, 246, nightOpacity),
  ];
  const strokeColor  = `rgb(${stroke1.join(",")})`;
  const strokeColor2 = `rgb(${stroke2.join(",")})`;

  // Fill: dark transparent purple (night) → light transparent blue (day)
  const fillR = lerp(124, 37,  nightOpacity);
  const fillG = lerp(58,  99,  nightOpacity);
  const fillB = lerp(237, 235, nightOpacity);
  const fillOpacity = 0.12;
  const fill = `rgba(${fillR},${fillG},${fillB},${fillOpacity})`;

  // Waterline color
  const wlR = lerp(167, 96,  nightOpacity);
  const wlG = lerp(139, 165, nightOpacity);
  const wlB = lerp(250, 250, nightOpacity);
  const waterlineColor = `rgba(${wlR},${wlG},${wlB},0.55)`;

  // Glow: purple glow at night, blue glow at day
  const glowR = lerp(124, 37, nightOpacity);
  const glowG = lerp(58, 99, nightOpacity);
  const glowB = lerp(237, 235, nightOpacity);
  const glowColor = `rgba(${glowR},${glowG},${glowB},${0.3 + nightOpacity * 0.25})`;

  const id = `ig-grad-${nightOpacity.toFixed(2).replace(".", "")}`;

  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 100 135"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 ${8 + nightOpacity * 8}px ${glowColor})` }}
    >
      <defs>
        <linearGradient id={id} x1="50" y1="0" x2="50" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={strokeColor} />
          <stop offset="100%" stopColor={strokeColor2} />
        </linearGradient>
      </defs>

      {/* ── ABOVE WATER ─────────────────────────────── */}

      {/* Outer silhouette */}
      <path
        d="M50,5 L14,64 L86,64 Z"
        fill={fill}
        stroke={`url(#${id})`}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Left inner facet */}
      <line
        x1="50" y1="5"
        x2="32" y2="64"
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeOpacity="0.55"
      />

      {/* Right inner facet */}
      <line
        x1="50" y1="5"
        x2="68" y2="64"
        stroke={strokeColor2}
        strokeWidth="1.2"
        strokeOpacity="0.55"
      />

      {/* Horizontal mid-facet line */}
      <line
        x1="27" y1="42"
        x2="73" y2="42"
        stroke={strokeColor}
        strokeWidth="1"
        strokeOpacity="0.35"
      />

      {/* ── WATERLINE ───────────────────────────────── */}
      <line
        x1="4" y1="67"
        x2="96" y2="67"
        stroke={waterlineColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* ── BELOW WATER ─────────────────────────────── */}

      {/* Submerged mass */}
      <path
        d="M18,70 Q8,92 50,128 Q92,92 82,70 Z"
        fill={fill}
        stroke={`url(#${id})`}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Inner vertical line of submerged part */}
      <line
        x1="50" y1="70"
        x2="50" y2="128"
        stroke={strokeColor}
        strokeWidth="1"
        strokeOpacity="0.3"
      />

      {/* Inner horizontal line of submerged part */}
      <line
        x1="20" y1="90"
        x2="80" y2="90"
        stroke={strokeColor2}
        strokeWidth="1"
        strokeOpacity="0.3"
      />
    </svg>
  );
}
