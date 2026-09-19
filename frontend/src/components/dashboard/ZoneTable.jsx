import { motion } from 'framer-motion';
import { StatusBadge } from '../ui';

export default function ZoneTable({ zones = [] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ minWidth: 560 }}>
        <thead>
          <tr>
            <th>ZONE</th>
            <th>LIVE COUNT</th>
            <th>CAPACITY</th>
            <th>SATURATION</th>
            <th>FLOW SPEED</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone, i) => {
            const satPct = zone.saturation_pct ?? Math.round((zone.live_headcount / zone.capacity) * 100 * 10) / 10;
            const status = zone.status || (satPct >= 90 ? 'CRITICAL' : satPct >= 75 ? 'WARNING' : 'SAFE');
            const barColor = status === 'CRITICAL' ? 'var(--critical)' : status === 'WARNING' ? 'var(--warning)' : 'var(--safe)';

            return (
              <motion.tr
                key={zone.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 24 }}
              >
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{zone.name}</td>
                <td className="mono" style={{ color: 'var(--text-primary)' }}>
                  {zone.live_headcount.toLocaleString()}
                </td>
                <td className="mono" style={{ color: 'var(--text-muted)' }}>
                  {zone.capacity.toLocaleString()}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="saturation-bar">
                      <motion.div
                        className="saturation-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, satPct)}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
                        style={{ background: barColor }}
                      />
                    </div>
                    <span className="mono" style={{ color: barColor, minWidth: 44, fontSize: '0.72rem' }}>
                      {satPct}%
                    </span>
                  </div>
                </td>
                <td className="mono" style={{ color: 'var(--text-secondary)' }}>
                  {zone.flow_speed_kmh} km/h
                </td>
                <td><StatusBadge status={status} size="xs" /></td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
