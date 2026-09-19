import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CapacityGauge({ current, capacity, safeThreshold, size = 180 }) {
  const pct = Math.min(1, current / capacity);
  const safePct = safeThreshold / capacity;

  // SVG arc math
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = size * 0.38;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle; // 240 degrees

  function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx, cy, r, startAngle, endAngle) {
    const s = polarToCartesian(cx, cy, r, startAngle);
    const e = polarToCartesian(cx, cy, r, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  // Color based on saturation
  let fillColor = '#10B981'; // safe
  if (pct >= 0.90) fillColor = '#EF4444';
  else if (pct >= safePct * 0.95) fillColor = '#F59E0B';

  const fillAngle = startAngle + totalAngle * pct;
  const safeAngle = startAngle + totalAngle * safePct;

  const trackPath = describeArc(cx, cy, r, startAngle, endAngle);
  const fillPath = describeArc(cx, cy, r, startAngle, fillAngle);
  const safeTickPos = polarToCartesian(cx, cy, r, safeAngle);

  const satPct = Math.round(pct * 1000) / 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size * 0.82} viewBox={`0 0 ${size} ${size * 0.82}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path d={trackPath} fill="none" stroke="var(--border-strong)" strokeWidth={size * 0.06} strokeLinecap="round" />

        {/* Fill — animated */}
        <motion.path
          d={fillPath}
          fill="none"
          stroke={fillColor}
          strokeWidth={size * 0.06}
          strokeLinecap="round"
          filter={pct >= 0.9 ? 'url(#glow)' : undefined}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Safe threshold tick */}
        <circle
          cx={safeTickPos.x}
          cy={safeTickPos.y}
          r={size * 0.025}
          fill="#EF4444"
          opacity={0.9}
        />

        {/* Center metric */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text-primary)"
          fontFamily="var(--font-mono)" fontSize={size * 0.13} fontWeight="700">
          {satPct}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-muted)"
          fontFamily="var(--font-mono)" fontSize={size * 0.06} letterSpacing="1">
          {current.toLocaleString()} / {capacity.toLocaleString()}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
        <span className="label-xs">SAFE THRESHOLD {Math.round(safePct * 100)}%</span>
      </div>
    </div>
  );
}
