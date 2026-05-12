// ApiceLogoIcon.tsx
// vectorEffect="non-scaling-stroke" garante strokeWidth em px de tela em qualquer tamanho
// Usage: <ApiceLogoIcon /> (preenche container) | <ApiceLogoIcon size={40} />

import React from "react";

interface ApiceLogoIconProps {
  /** Tamanho em px. Omita para preencher o container via CSS. */
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

type Point = [number, number];

export default function ApiceLogoIcon({ size, className = "", style = {} }: ApiceLogoIconProps) {
  const A: Point = [540, 155];
  const BL: Point = [163, 714];
  const BR: Point = [917, 714];
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
  const SW_LINE = 0.65; // linhas da grade
  const SW_RING = 0.6; // anel externo
  const SW_RING2 = 0.35; // anel interno
  const SW_STAR = 0.8; // raios da estrela
  const R_NODE = 4; // raio dos nós (viewBox units — escala com o ícone)
  const R_APEX = 5;

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
        {/* Gradiente dourado — userSpaceOnUse mapeia correto em qualquer escala */}
        <linearGradient
          id="al-gMain"
          gradientUnits="userSpaceOnUse"
          x1="540"
          y1="155"
          x2="540"
          y2="714"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="10%" stopColor="#fff176" />
          <stop offset="35%" stopColor="#fdd835" />
          <stop offset="65%" stopColor="#f9a825" />
          <stop offset="100%" stopColor="#e65100" />
        </linearGradient>

        <radialGradient
          id="al-gCenterGlow"
          cx="540"
          cy="430"
          r="280"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#fdd835" stopOpacity="0.50" />
          <stop offset="45%" stopColor="#f9a825" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#e65100" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="al-gBg" cx="540" cy="460" r="480" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5a3a00" stopOpacity="0.40" />
          <stop offset="60%" stopColor="#2a1a00" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Glow suave nas linhas — stdDeviation pequeno para não borrar demais */}
        <filter
          id="al-fLine"
          x="-8%"
          y="-8%"
          width="116%"
          height="116%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
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
      <circle cx="540" cy="540" r="508" fill="#0d0d0b" />
      <circle cx="540" cy="540" r="508" fill="url(#al-gBg)" />
      <ellipse
        cx="540"
        cy="430"
        rx="270"
        ry="220"
        fill="url(#al-gCenterGlow)"
        clipPath="url(#al-clip)"
      />

      {/* Anéis */}
      <circle
        cx="540"
        cy="540"
        r="499"
        fill="none"
        stroke="#fdd835"
        strokeWidth={SW_RING}
        opacity="0.85"
        filter="url(#al-fRing)"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="540"
        cy="540"
        r="490"
        fill="none"
        stroke="#f9a825"
        strokeWidth={SW_RING2}
        opacity="0.45"
        vectorEffect="non-scaling-stroke"
      />

      {/* Grade triangular */}
      <g filter="url(#al-fLine)">
        {edges.map(([p1, p2], i) => (
          <line
            key={i}
            x1={p1[0]}
            y1={p1[1]}
            x2={p2[0]}
            y2={p2[1]}
            stroke="url(#al-gMain)"
            strokeWidth={SW_LINE}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      {/* Nós — r em viewBox units escala proporcionalmente (desejado) */}
      {nodes.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={R_NODE} fill="url(#al-gMain)" opacity="0.9" />
      ))}

      {/* Apex: estrela + ponto */}
      <g filter="url(#al-fApex)">
        <line
          x1={A[0]}
          y1={A[1] - 32}
          x2={A[0]}
          y2={A[1] + 32}
          stroke="#ffffff"
          strokeWidth={SW_STAR}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={A[0] - 32}
          y1={A[1]}
          x2={A[0] + 32}
          y2={A[1]}
          stroke="#ffffff"
          strokeWidth={SW_STAR}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={A[0] - 15}
          y1={A[1] - 15}
          x2={A[0] + 15}
          y2={A[1] + 15}
          stroke="#fffbe0"
          strokeWidth={SW_STAR * 0.7}
          strokeLinecap="round"
          opacity="0.7"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={A[0] + 15}
          y1={A[1] - 15}
          x2={A[0] - 15}
          y2={A[1] + 15}
          stroke="#fffbe0"
          strokeWidth={SW_STAR * 0.7}
          strokeLinecap="round"
          opacity="0.7"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={A[0]} cy={A[1]} r={R_APEX} fill="#ffffff" />
      </g>
    </svg>
  );
}
