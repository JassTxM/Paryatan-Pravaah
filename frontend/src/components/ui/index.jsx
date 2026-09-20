import { motion } from 'framer-motion';

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status, size = 'sm' }) {
  const map = {
    LOW: { cls: 'badge-safe', label: 'LOW FLOW' },
    MODERATE: { cls: 'badge-warning', label: 'MODERATE' },
    SURGE_RISK: { cls: 'badge-critical', label: 'SURGE RISK' },
    SAFE: { cls: 'badge-safe', label: 'SAFE' },
    WARNING: { cls: 'badge-warning', label: 'WARNING' },
    CRITICAL: { cls: 'badge-critical', label: 'CRITICAL' },
    ONLINE: { cls: 'badge-safe', label: 'ONLINE' },
    DEMO: { cls: 'badge-info', label: 'DEMO MODE' },
    CONFIRMED: { cls: 'badge-safe', label: 'CONFIRMED' },
    THROTTLED: { cls: 'badge-critical', label: 'THROTTLED' },
    FULL: { cls: 'badge-critical', label: 'FULL' },
    AVAILABLE: { cls: 'badge-safe', label: 'AVAILABLE' },
    LIMITED: { cls: 'badge-warning', label: 'LIMITED' },
  };

  const cfg = map[status] || { cls: 'badge-info', label: status };

  return (
    <span className={cfg.cls} style={{ fontSize: size === 'xs' ? '0.6rem' : undefined }}>
      {cfg.label}
    </span>
  );
}

// ── MetricValue ───────────────────────────────────────────────────────────────
export function MetricValue({ value, unit, size = 'xl', color, label }) {
  const sizeClass = { xl: 'metric-xl', lg: 'metric-lg', md: 'metric-md' }[size] || 'metric-lg';
  return (
    <div>
      {label && <div className="label-xs" style={{ marginBottom: 6 }}>{label}</div>}
      <div className={`mono ${sizeClass}`} style={{ color: color || 'var(--text-primary)' }}>
        {value}
        {unit && <span style={{ fontSize: '0.55em', color: 'var(--text-muted)', marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
}

// ── TelemetryCard ─────────────────────────────────────────────────────────────
export function TelemetryCard({ number, title, children, className = '', accent }) {
  const accentColor = {
    critical: 'var(--critical)',
    warning: 'var(--warning)',
    safe: 'var(--safe)',
    info: 'var(--info)',
  }[accent] || 'var(--border-strong)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      style={{
        background: 'var(--surface)',
        border: `1px solid var(--border)`,
        borderTop: `2px solid ${accentColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}
      className={className}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {number && (
          <span className="mono" style={{
            fontSize: '0.6rem', color: accentColor, fontWeight: 700,
            letterSpacing: '0.08em', opacity: 0.8
          }}>
            {String(number).padStart(2, '0')}
          </span>
        )}
        <span className="label-sm" style={{ color: 'var(--text-muted)' }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

// ── GlassPanel ────────────────────────────────────────────────────────────────
export function GlassPanel({ children, className = '', style = {}, ...props }) {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{ padding: 'var(--space-4)', ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ number, title, subtitle, accent }) {
  const accentColor = {
    critical: 'var(--critical)',
    warning: 'var(--warning)',
    safe: 'var(--safe)',
    info: 'var(--info)',
  }[accent] || 'var(--text-muted)';

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      {number && (
        <div className="mono" style={{
          fontSize: '0.6rem', color: accentColor, fontWeight: 700,
          letterSpacing: '0.15em', marginBottom: 4, opacity: 0.7
        }}>
          — {String(number).padStart(2,'0')}
        </div>
      )}
      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.1rem',
        fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em'
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── ActionButton ──────────────────────────────────────────────────────────────
export function ActionButton({ children, onClick, variant = 'primary', icon: Icon, disabled, loading }) {
  const styles = {
    primary: {
      background: 'var(--text-primary)', color: 'var(--bg)',
      border: 'none', fontWeight: 600
    },
    critical: {
      background: 'var(--critical)', color: '#fff',
      border: 'none', fontWeight: 600
    },
    ghost: {
      background: 'transparent', color: 'var(--text-secondary)',
      border: '1px solid var(--border)'
    },
    warning: {
      background: 'rgba(245,158,11,0.12)', color: 'var(--warning)',
      border: '1px solid rgba(245,158,11,0.3)', fontWeight: 600
    },
    safe: {
      background: 'rgba(16,185,129,0.12)', color: 'var(--safe)',
      border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600
    },
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--transition)',
        ...styles[variant]
      }}
    >
      {loading ? (
        <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      ) : Icon && <Icon size={12} />}
      {children}
    </motion.button>
  );
}

// ── LoadingSkeleton ───────────────────────────────────────────────────────────
export function LoadingSkeleton({ width = '100%', height = 20, radius = 4, style = {} }) {
  return (
    <div className="skeleton" style={{
      width, height, borderRadius: radius, ...style
    }} />
  );
}

// ── DemoBanner ────────────────────────────────────────────────────────────────
export function DemoBanner() {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        background: 'rgba(56,189,248,0.08)',
        borderBottom: '1px solid rgba(56,189,248,0.2)',
        padding: '6px 24px',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        color: 'var(--info)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }}
    >
      ◈ DEMO MODE — Backend not connected. Displaying deterministic demo data. Real data requires MongoDB + backend.
    </motion.div>
  );
}
