// ApiceLogoIcon.tsx
// vectorEffect="non-scaling-stroke" garante strokeWidth em px de tela em qualquer tamanho
// Usage: <ApiceLogoIcon /> (preenche container) | <ApiceLogoIcon size={40} />

import React from "react";

interface ApiceLogoIconProps {
  /** Tamanho em px. Omita para preencher o container via CSS. */
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  /** Cor de fundo do círculo interno do logo. Deve casar com o container. */
  background?: string;
}

type Point = [number, number];

export default function ApiceLogoIcon({
  size,
  className = "",
  style = {},
  background = "#000000",
}: ApiceLogoIconProps) {
  const A: Point = [540, 175];
  const BL: Point = [240, 700];
  const BR: Point = [840, 700];
  const N = 4;

  const pts: Point[][] = [];
  for (let r = 0; r <= N; r++) {
    pts[r] = [];
    for (let p = 0; p <= r; p++) {
      const x = A[0] + (BL[0] - A[0]) * (r / N) + (BR[0] - BL[0]) * (p / N);
      const y = A[1] + (BL[1] - A[1]) * (r / N);
      pts[r][p] = [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
    }
  }

  const edgeSet = new Set<string>();
  const edges: [Point, Point][] = [];
  const addEdge = (p1: Point, p2: Point) => {
    const key = `${p1[0]},${p1[1]}-${p2[0]},${p2[1]}`;
    const rev = `${p2[0]},${p2[1]}-${p1[0]},${p1[1]}`;
    if (!edgeSet.has(key) && !edgeSet.has(rev)) {
      edgeSet.add(key);
      edges.push([p1, p2]);
    }
  };
  for (let r = 0; r < N; r++) {
    for (let p = 0; p <= r; p++) {
      addEdge(pts[r][p], pts[r + 1][p]);
      addEdge(pts[r][p], pts[r + 1][p + 1]);
      addEdge(pts[r + 1][p], pts[r + 1][p + 1]);
    }
  }

  const nodes: Point[] = [];
  for (let r = 1; r <= N; r++) {
    for (let p = 0; p <= r; p++) {
      nodes.push(pts[r][p]);
    }
  }

  // strokeWidth em px de tela (não escala com viewBox)
  const SW_LINE = 0.9; // linhas da grade
  const SW_RING = 1.1; // anel externo
  const SW_STAR = 0.7; // raios da estrela
  const R_NODE = 3.5; // raio dos nós
  const R_APEX = 4;

  return (
    <svg
      width={size ?? "100%"}
      height={size ?? "100%"}
      viewBox="0 0 1080 1080"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Ápice logo"
      role="img"
    >
      <defs>
        {/* Dourado sólido e uniforme, fiel à referência */}
        <radialGradient
          id="al-gCenterGlow"
          cx="540"
          cy="470"
          r="240"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#7a5a10" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="al-gBg" cx="540" cy="540" r="510" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a1208" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Glow muito sutil */}
        <filter
          id="al-fLine"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter
          id="al-fApex"
          x="-120%"
          y="-120%"
          width="340%"
          height="340%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter
          id="al-fRing"
          x="-3%"
          y="-3%"
          width="106%"
          height="106%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <clipPath id="al-clip">
          <circle cx="540" cy="540" r="508" />
        </clipPath>
      </defs>

      {/* Fundo */}
      <circle cx="540" cy="540" r="508" fill={background} />
      <ellipse
        cx="540"
        cy="470"
        rx="240"
        ry="200"
        fill="url(#al-gCenterGlow)"
        clipPath="url(#al-clip)"
      />

      {/* Anel externo único e fino */}
      <circle
        cx="540"
        cy="540"
        r="500"
        fill="none"
        stroke="#c9a84c"
        strokeWidth={SW_RING}
        opacity="0.7"
        vectorEffect="non-scaling-stroke"
      />

      {/* Grade triangular — dourado uniforme */}
      <g filter="url(#al-fLine)">
        {edges.map(([p1, p2], i) => (
          <line
            key={i}
            x1={p1[0]}
            y1={p1[1]}
            x2={p2[0]}
            y2={p2[1]}
            stroke="#c9a84c"
            strokeWidth={SW_LINE}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      {/* Nós dourados */}
      {nodes.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={R_NODE} fill="#d4b35a" />
      ))}

      {/* Apex: brilho discreto */}
      <g filter="url(#al-fApex)">
        <line
          x1={A[0]}
          y1={A[1] - 18}
          x2={A[0]}
          y2={A[1] + 18}
          stroke="#fff8d6"
          strokeWidth={SW_STAR}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={A[0] - 18}
          y1={A[1]}
          x2={A[0] + 18}
          y2={A[1]}
          stroke="#fff8d6"
          strokeWidth={SW_STAR}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={A[0]} cy={A[1]} r={R_APEX} fill="#ffffff" />
      </g>
    </svg>
  );
}
