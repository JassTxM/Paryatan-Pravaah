import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: 'var(--surface-elevated)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius)',
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.7rem',
      minWidth: 180
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: '0.65rem', letterSpacing: '0.08em' }}>
        {String(label).padStart(2,'0')}:00
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}>
          <span style={{ color: p.stroke || p.color }}>{p.name}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
      {d?.risk_level && (
        <div style={{
          marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)',
          color: d.risk_level === 'SURGE_RISK' ? 'var(--critical)' : d.risk_level === 'MODERATE' ? 'var(--warning)' : 'var(--safe)',
          fontSize: '0.62rem', letterSpacing: '0.08em', fontWeight: 700
        }}>
          RISK: {d.risk_level.replace('_', ' ')}
          {d.confidence && ` · CONF ${d.confidence}%`}
        </div>
      )}
    </div>
  );
};

export default function ForecastChart({ data = [], safeLimit }) {
  const currentHour = new Date().getHours();

  // Split into historical + projected
  const chartData = data.map(d => ({
    hour: d.hour,
    label: `${String(d.hour).padStart(2, '0')}`,
    actual: d.actual_flow ?? null,
    predicted: d.predicted_flow,
    safe: safeLimit,
    risk_level: d.risk_level,
    confidence: d.confidence,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{ width: '100%', height: 240 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            interval={1}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
            width={44}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Safe capacity dashed reference line */}
          {safeLimit && (
            <ReferenceLine
              y={safeLimit}
              stroke="var(--critical)"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: 'SAFE LIMIT',
                position: 'insideTopRight',
                fill: 'var(--critical)',
                fontSize: 9,
                fontFamily: 'var(--font-mono)',
                letterSpacing: 1
              }}
            />
          )}

          {/* Current hour reference */}
          <ReferenceLine
            x={String(currentHour).padStart(2,'0')}
            stroke="var(--text-dim)"
            strokeDasharray="3 3"
            strokeWidth={1}
          />

          {/* Historical actual (muted) */}
          <Area
            type="monotone"
            dataKey="actual"
            name="Historical"
            stroke="var(--text-dim)"
            strokeWidth={1.5}
            fill="url(#actualGrad)"
            dot={false}
            connectNulls={false}
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
          />

          {/* AI Projection (bright, animated draw) */}
          <Area
            type="monotone"
            dataKey="predicted"
            name="AI Projected"
            stroke="var(--info)"
            strokeWidth={2}
            fill="url(#predictedGrad)"
            dot={false}
            connectNulls
            isAnimationActive
            animationDuration={1800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
