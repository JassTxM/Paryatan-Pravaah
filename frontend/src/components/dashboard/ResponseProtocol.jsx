import { motion } from 'framer-motion';
import { Zap, Users, Navigation, Eye } from 'lucide-react';

const PROTOCOLS = [
  { num: '01', id: 'THROTTLE', title: 'THROTTLE', desc: 'Reduce online inventory', icon: Zap, color: 'var(--critical)' },
  { num: '02', id: 'MARSHALS', title: 'MARSHALS', desc: 'Deploy field team', icon: Users, color: 'var(--warning)' },
  { num: '03', id: 'REDIRECT', title: 'REDIRECT', desc: 'Push to low-flow slots', icon: Navigation, color: 'var(--info)' },
  { num: '04', id: 'MONITOR', title: 'MONITOR', desc: 'Recalculate pressure', icon: Eye, color: 'var(--safe)' },
];

export default function ResponseProtocol({ activeActions = [], onAction }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
      {PROTOCOLS.map(({ num, id, title, desc, icon: Icon, color }, i) => {
        const isActive = activeActions.some(a => a.includes(id.slice(0, 5)));
        return (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, borderColor: color }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 26 }}
            onClick={() => onAction?.(id)}
            style={{
              background: isActive ? `rgba(${hexToRgb(color)}, 0.08)` : 'var(--bg)',
              border: `1px solid ${isActive ? color : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '12px',
              cursor: 'pointer',
              transition: 'border-color 200ms ease, background 200ms ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="mono" style={{ fontSize: '0.6rem', color, opacity: 0.8, fontWeight: 700 }}>
                {num}
              </span>
              <Icon size={11} color={color} />
            </div>
            <div className="mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              {title}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{desc}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

function hexToRgb(hex) {
  // Handles css variable names or actual hex
  const map = {
    'var(--critical)': '239,68,68',
    'var(--warning)': '245,158,11',
    'var(--info)': '56,189,248',
    'var(--safe)': '16,185,129',
  };
  return map[hex] || '255,255,255';
}
