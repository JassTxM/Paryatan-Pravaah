import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, Users } from 'lucide-react';
import { ActionButton } from '../ui';

export default function AlertCard({ alert, confidence, actions = [], onThrottle, onDispatch, onOffPeak, chokePoint }) {
  const isActive = alert === 'CRITICAL_SURGE' || alert === 'WARNING_APPROACHING';
  const isCritical = alert === 'CRITICAL_SURGE';

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="alert-card"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        style={{
          position: 'relative',
          background: isCritical ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
          border: `1px solid ${isCritical ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.35)'}`,
          borderLeft: `3px solid ${isCritical ? 'var(--critical)' : 'var(--warning)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          overflow: 'hidden',
        }}
      >
        {/* Pulsing glow */}
        {isCritical && (
          <motion.div
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.25) 0%, transparent 70%)',
              pointerEvents: 'none', borderRadius: 'var(--radius-lg)'
            }}
          />
        )}

        {/* Expanding ring */}
        {isCritical && (
          <motion.div
            animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: 18, left: 18, width: 8, height: 8,
              borderRadius: '50%', border: '1px solid var(--critical)',
              pointerEvents: 'none'
            }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative' }}>
          {/* Icon with pulse */}
          <motion.div
            animate={isCritical ? { opacity: [0.6, 1, 0.6] } : {}}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{
              width: 32, height: 32, borderRadius: 'var(--radius)',
              background: isCritical ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={16} color={isCritical ? 'var(--critical)' : 'var(--warning)'} />
          </motion.div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <span className="mono" style={{
                fontSize: '0.7rem', fontWeight: 700,
                color: isCritical ? 'var(--critical)' : 'var(--warning)',
                letterSpacing: '0.1em'
              }}>
                {isCritical ? 'CRITICAL PRESSURE WARNING' : 'SURGE APPROACHING'}
              </span>
              {confidence && (
                <span className="badge-critical" style={{ fontSize: '0.58rem' }}>
                  CONFIDENCE {confidence}%
                </span>
              )}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: 16 }}>
              {chokePoint?.zone || 'Gate 2'} projected to breach safe threshold between{' '}
              <span className="mono" style={{ color: 'var(--text-primary)' }}>10:30 AM — 11:30 AM</span>.
              Immediate action recommended.
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {actions.includes('THROTTLE_SLOT') && (
                <ActionButton variant="critical" icon={Zap} onClick={onThrottle}>
                  Throttle Bookings
                </ActionButton>
              )}
              {actions.includes('DEPLOY_MARSHALS') && (
                <ActionButton variant="warning" icon={Users} onClick={onDispatch}>
                  Dispatch Marshals
                </ActionButton>
              )}
              {actions.includes('PUSH_OFF_PEAK_PROMOS') && (
                <ActionButton variant="safe" onClick={onOffPeak}>
                  Deploy Off-Peak
                </ActionButton>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
