import { motion } from 'framer-motion';
import { CheckCircle, Download } from 'lucide-react';
import { ActionButton } from '../ui';

// Minimal QR code using SVG path (no library needed)
function QRCode({ value, size = 90 }) {
  // Generate a deterministic visual QR-like pattern from the value
  const hash = Array.from(value).reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0);
  const seed = Math.abs(hash);
  const cells = 9;
  const cellSize = size / cells;

  const grid = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      // Force corner squares (QR finder patterns)
      if ((r < 3 && c < 3) || (r < 3 && c >= cells - 3) || (r >= cells - 3 && c < 3)) return true;
      // Random based on seed
      const v = (seed * (r * cells + c + 1) * 2654435761) >>> 0;
      return (v % 3) !== 0;
    })
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect width={size} height={size} fill="white" rx={4} />
      {grid.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize + 1}
              y={r * cellSize + 1}
              width={cellSize - 2}
              height={cellSize - 2}
              fill="#0B0F17"
              rx={1}
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function DigitalPass({ booking, destination, slotTime }) {
  if (!booking) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #172033 50%, #0B0F17 100%)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        maxWidth: 400,
        width: '100%',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, var(--safe), var(--info), var(--safe))' }} />

      {/* Decorative architectural lines */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%',
        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.015) 8px, rgba(255,255,255,0.015) 9px)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="mono" style={{ fontSize: '0.55rem', letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: 2 }}>
              PARYATAN PRAVAAH
            </div>
            <div className="mono" style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--text-secondary)' }}>
              ENTRY PASS
            </div>
          </div>
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle size={20} color="var(--safe)" />
          </motion.div>
        </div>

        {/* Monument name */}
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '0.02em', lineHeight: 1.2,
          marginBottom: 20
        }}>
          {booking.destination_name || destination?.name}
        </h2>

        {/* Time slot */}
        <div style={{
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 'var(--radius)',
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16
        }}>
          <span className="mono" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--safe)', letterSpacing: '0.04em' }}>
            {booking.slot_time_label || slotTime} — {addHalfHour(booking.slot_time_label || slotTime)}
          </span>
        </div>

        {/* Dashed separator */}
        <div style={{
          margin: '0 -20px 16px',
          borderTop: '1px dashed var(--border-strong)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute', left: -8, top: -8, width: 16, height: 16,
            background: 'var(--bg)', borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute', right: -8, top: -8, width: 16, height: 16,
            background: 'var(--bg)', borderRadius: '50%'
          }} />
        </div>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'VISITORS', value: String(booking.ticket_count).padStart(2,'0') },
            { label: 'GATE', value: booking.gate || 'GATE 2' },
            { label: 'AMOUNT', value: `₹${booking.total_amount}` }
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="label-xs" style={{ marginBottom: 4, fontSize: '0.55rem' }}>{label}</div>
              <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR + booking ref */}
      <div style={{
        background: 'var(--bg)', borderTop: '1px dashed var(--border)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 16
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 24 }}
        >
          <QRCode value={booking.qr_token || booking.booking_ref} size={80} />
        </motion.div>

        <div>
          <div className="label-xs" style={{ marginBottom: 4 }}>BOOKING ID</div>
          <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            {booking.booking_ref}
          </div>
          <div className="label-xs" style={{ marginBottom: 2 }}>STATUS</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 'var(--radius-sm)', padding: '2px 8px'
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--safe)' }} />
            <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--safe)', letterSpacing: '0.08em', fontWeight: 700 }}>
              CONFIRMED
            </span>
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, var(--border-strong), transparent)' }} />
    </motion.div>
  );
}

function addHalfHour(timeStr) {
  if (!timeStr) return '';
  const [h] = timeStr.split(':');
  const hour = parseInt(h, 10);
  return `${String(hour).padStart(2,'0')}:30`;
}
