import { motion } from 'framer-motion';
import { StatusBadge } from '../ui';
import { Clock, Users, Tag } from 'lucide-react';

export default function SlotCard({ slot, onClick, selected }) {
  const remaining = slot.remaining_tickets ?? Math.max(0, slot.max_capacity - slot.booked_count);
  const isFull = slot.status === 'FULL' || remaining === 0;
  const isThrottled = slot.status === 'THROTTLED';
  const disabled = isFull || isThrottled;

  const riskColor = {
    LOW: 'var(--safe)', MODERATE: 'var(--warning)', SURGE_RISK: 'var(--critical)'
  }[slot.risk_level] || 'var(--text-muted)';

  const borderColor = selected ? riskColor : (disabled ? 'var(--border)' : 'var(--border)');
  const pctBooked = Math.round(((slot.booked_count) / slot.max_capacity) * 100);

  return (
    <motion.div
      onClick={disabled ? undefined : () => onClick(slot)}
      whileHover={disabled ? {} : { scale: 1.025, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      style={{
        background: selected ? `rgba(${riskToRgb(slot.risk_level)}, 0.07)` : 'var(--surface)',
        border: `1px solid ${borderColor}`,
        borderTop: `2px solid ${selected ? riskColor : (disabled ? 'var(--border)' : riskColor)}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Off-peak promo badge */}
      {slot.discount_pct > 0 && !disabled && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'var(--safe)', color: 'var(--bg)',
          fontSize: '0.58rem', fontFamily: 'var(--font-mono)',
          fontWeight: 700, letterSpacing: '0.06em',
          padding: '3px 8px', borderRadius: '0 var(--radius-md) 0 var(--radius)',
        }}>
          {slot.discount_pct}% OFF
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {slot.time_label}
        </div>
        <StatusBadge status={slot.risk_level} size="xs" />
      </div>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
        <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          ₹{slot.dynamic_price}
        </span>
        {slot.discount_pct > 0 && (
          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
            ₹{slot.base_price}
          </span>
        )}
      </div>

      {/* Booked bar */}
      <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pctBooked}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '100%', background: riskColor, borderRadius: 2 }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {disabled ? (isThrottled ? 'THROTTLED' : 'SOLD OUT') : `${remaining} tickets left`}
        </span>
        {slot.risk_level === 'SURGE_RISK' && (
          <span style={{ fontSize: '0.6rem', color: 'var(--critical)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            ~45 MIN WAIT
          </span>
        )}
      </div>

      {/* Recommendation */}
      {slot.recommendation && !disabled && (
        <div style={{
          marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)',
          fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
          letterSpacing: '0.04em'
        }}>
          {slot.recommendation}
        </div>
      )}
    </motion.div>
  );
}

function riskToRgb(risk) {
  if (risk === 'SURGE_RISK') return '239,68,68';
  if (risk === 'MODERATE') return '245,158,11';
  return '16,185,129';
}
