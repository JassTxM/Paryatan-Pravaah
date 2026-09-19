import { motion } from 'framer-motion';
import { MapPin, Users, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../ui';

const DEST_COLORS = {
  'taj-mahal': '#C8A97A',
  'qutub-minar': '#8FA89C',
  'red-fort': '#C47860',
  'hampi': '#A89070',
  'konark': '#B8904A',
};

const DEST_PATTERNS = {
  'taj-mahal': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M30 5 L45 20 L40 20 L40 55 L20 55 L20 20 L15 20 Z M27 10 Q30 6 33 10 L35 20 L25 20 Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
};

export default function DestinationCard({ dest, onClick, selected }) {
  const satPct = Math.round((dest.live_occupancy / dest.total_capacity) * 100);
  const risk = satPct >= 90 ? 'SURGE_RISK' : satPct >= 70 ? 'MODERATE' : 'LOW';
  const accentColor = DEST_COLORS[dest.slug] || '#94A3B8';

  return (
    <motion.div
      onClick={() => onClick(dest)}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${selected ? accentColor : 'var(--border)'}`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color var(--transition)',
        boxShadow: selected ? `0 0 20px rgba(${hexToRgbStr(accentColor)}, 0.2)` : 'none'
      }}
    >
      {/* Subtle architectural pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.4,
        backgroundImage: DEST_PATTERNS[dest.slug] || 'none',
        pointerEvents: 'none'
      }} />

      {selected && (
        <motion.div
          layoutId="dest-selected"
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 8, height: 8, borderRadius: '50%',
            background: accentColor
          }}
        />
      )}

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <StatusBadge status={risk} size="xs" />
          <ArrowRight size={13} color="var(--text-dim)" />
        </div>

        <h3 style={{
          fontFamily: 'var(--font-heading)', fontSize: '0.88rem',
          fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3
        }}>
          {dest.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
          <MapPin size={10} color="var(--text-muted)" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{dest.location}</span>
        </div>

        <div className="divider" style={{ marginBottom: 12 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div className="label-xs" style={{ marginBottom: 2 }}>ANNUAL VISITORS</div>
            <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: accentColor }}>
              {(dest.annual_visitors / 1000000).toFixed(1)}M
            </div>
          </div>
          <div>
            <div className="label-xs" style={{ marginBottom: 2 }}>TODAY'S LOAD</div>
            <div className="mono" style={{
              fontSize: '0.9rem', fontWeight: 700,
              color: risk === 'SURGE_RISK' ? 'var(--critical)' : risk === 'MODERATE' ? 'var(--warning)' : 'var(--safe)'
            }}>
              {satPct}%
            </div>
          </div>
        </div>

        {/* Occupancy bar */}
        <div style={{ marginTop: 10 }}>
          <div style={{
            height: 3, background: 'var(--border)',
            borderRadius: 2, overflow: 'hidden', marginTop: 6
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, satPct)}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: '100%', borderRadius: 2,
                background: risk === 'SURGE_RISK' ? 'var(--critical)' : risk === 'MODERATE' ? 'var(--warning)' : 'var(--safe)'
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function hexToRgbStr(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
