import { motion } from 'framer-motion';
import { Thermometer, Droplets, CloudRain, Star } from 'lucide-react';

export default function EnvironmentModule({ env = {} }) {
  const items = [
    { icon: Thermometer, label: 'TEMP', value: `${env.temperature_c ?? 29}°C`, color: env.temperature_c > 35 ? 'var(--warning)' : 'var(--text-primary)' },
    { icon: Droplets, label: 'HUMIDITY', value: `${env.humidity_pct ?? 61}%`, color: 'var(--info)' },
    { icon: CloudRain, label: 'RAIN', value: `${env.rainfall_mm ?? 0}mm`, color: env.rainfall_mm > 0 ? 'var(--info)' : 'var(--text-muted)' },
    { icon: Star, label: 'FESTIVAL', value: env.festival ? 'YES' : 'NO', color: env.festival ? 'var(--warning)' : 'var(--text-muted)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {items.map(({ icon: Icon, label, value, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 26 }}
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '10px 12px',
            display: 'flex', flexDirection: 'column', gap: 4
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon size={10} color="var(--text-muted)" />
            <span className="label-xs">{label}</span>
          </div>
          <span className="mono" style={{ fontSize: '1rem', fontWeight: 700, color }}>
            {value}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
