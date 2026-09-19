import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Radio, Clock, RefreshCw } from 'lucide-react';
import { TelemetryCard, MetricValue, SectionHeader, LoadingSkeleton } from '../components/ui';
import CapacityGauge from '../components/dashboard/CapacityGauge';
import AlertCard from '../components/dashboard/AlertCard';
import ZoneTable from '../components/dashboard/ZoneTable';
import ResponseProtocol from '../components/dashboard/ResponseProtocol';
import EnvironmentModule from '../components/dashboard/EnvironmentModule';
import ForecastChart from '../components/charts/ForecastChart';
import { getTelemetry, getForecastCurve, throttleSlot, dispatchMarshals, deployOffPeak } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';
import { DEMO_DESTINATIONS } from '../services/api';

const DEFAULT_DEST = DEMO_DESTINATIONS[0];

function LiveIndicator({ connected }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? 'var(--safe)' : 'var(--critical)' }}
      />
      <span className="mono" style={{ fontSize: '0.6rem', color: connected ? 'var(--safe)' : 'var(--critical)', letterSpacing: '0.1em' }}>
        {connected ? 'LIVE' : 'POLLING'}
      </span>
    </div>
  );
}

export default function CommandCenter() {
  const [telemetry, setTelemetry] = useState(null);
  const [forecast, setForecast] = useState({ data: [], safe_limit: 2125 });
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const { connected, on } = useSocket();

  const destId = DEFAULT_DEST._id;

  const fetchData = useCallback(async () => {
    try {
      const [tel, fore] = await Promise.all([
        getTelemetry(destId),
        getForecastCurve(destId)
      ]);
      setTelemetry(tel);
      setForecast(fore);
      setLastSync(new Date());
    } finally {
      setLoading(false);
    }
  }, [destId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Real-time socket updates
  useEffect(() => {
    const cleanup1 = on('occupancy.updated', ({ delta }) => {
      setTelemetry(prev => prev ? {
        ...prev,
        current_visitors: prev.current_visitors + delta,
        saturation_pct: Math.round(((prev.current_visitors + delta) / prev.capacity) * 1000) / 10
      } : prev);
    });
    const cleanup2 = on('forecast.updated', () => getForecastCurve(destId).then(setForecast));
    return () => { cleanup1?.(); cleanup2?.(); };
  }, [on, destId]);

  const handleThrottle = async () => {
    const result = await throttleSlot({ destination_id: destId });
    toast.success(`ONLINE INVENTORY THROTTLED\n${result.message}`, { duration: 5000 });
    fetchData();
  };

  const handleDispatch = async () => {
    const result = await dispatchMarshals({ destination_id: destId, zone: 'Gate 2' });
    toast.success(`FIELD MARSHALS DISPATCHED\nETA ${result.eta_minutes} minutes.`, { duration: 6000 });
  };

  const handleOffPeak = async () => {
    const result = await deployOffPeak({ destination_id: destId });
    toast.success(`OFF-PEAK INCENTIVES DEPLOYED\n${result.slots_affected} slots discounted.`, { duration: 5000 });
    fetchData();
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '20px 20px 60px' }}>
      <div style={{ maxWidth: 1340, margin: '0 auto' }}>

        {/* Command Center Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderBottom: '2px solid var(--critical)',
            borderRadius: 'var(--radius-lg)', padding: '16px 20px',
            marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
          }}
        >
          <div>
            <div className="mono" style={{ fontSize: '0.58rem', color: 'var(--critical)', letterSpacing: '0.18em', marginBottom: 3, fontWeight: 700 }}>
              PARYATAN PRAVAAH · HERITAGE OPERATIONS COMMAND CENTER
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {DEFAULT_DEST.name}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'SITE', value: 'TAJ MAHAL' },
              { label: 'ZONE', value: 'AGRA' },
              { label: 'MODEL', value: 'v1.0' },
              { label: 'SYNC', value: lastSync ? lastSync.toLocaleTimeString('en-IN', { hour12: false }) : '--:--:--' }
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="label-xs" style={{ marginBottom: 1 }}>{label}</div>
                <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{value}</div>
              </div>
            ))}
            <LiveIndicator connected={connected} />
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4 }}
              onClick={fetchData}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              title="Refresh"
            >
              <RefreshCw size={14} />
            </motion.button>
          </div>
        </motion.div>

        {/* Critical Alert */}
        {telemetry && (
          <div style={{ marginBottom: 20 }}>
            <AlertCard
              alert={telemetry.alert}
              confidence={telemetry.alert_confidence}
              actions={telemetry.alert_actions}
              chokePoint={telemetry.choke_point}
              onThrottle={handleThrottle}
              onDispatch={handleDispatch}
              onOffPeak={handleOffPeak}
            />
          </div>
        )}

        {/* Primary Telemetry Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
          {/* Module 01 — Capacity */}
          <TelemetryCard number={1} title="SITE CAPACITY" accent={
            telemetry && telemetry.saturation_pct >= 90 ? 'critical' :
            telemetry && telemetry.saturation_pct >= 75 ? 'warning' : 'safe'
          }>
            {loading ? <LoadingSkeleton height={140} /> : telemetry ? (
              <CapacityGauge
                current={telemetry.current_visitors}
                capacity={telemetry.capacity}
                safeThreshold={telemetry.safe_threshold}
                size={150}
              />
            ) : null}
          </TelemetryCard>

          {/* Module 02 — Predicted Inflow */}
          <TelemetryCard number={2} title="PREDICTED INFLOW" accent="info">
            {loading ? <LoadingSkeleton height={80} /> : telemetry ? (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <MetricValue
                    value={`+${telemetry.predicted_two_hour_inflow.toLocaleString()}`}
                    size="xl"
                    color="var(--info)"
                  />
                  <div className="label-xs" style={{ marginTop: 4 }}>NEXT 2 HOURS</div>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
                  borderRadius: 'var(--radius-sm)', padding: '3px 8px'
                }}>
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--info)' }}
                  />
                  <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--info)', letterSpacing: '0.1em' }}>
                    AI PROJECTED
                  </span>
                </div>
              </div>
            ) : null}
          </TelemetryCard>

          {/* Module 03 — Choke Point */}
          <TelemetryCard number={3} title="CHOKE POINT" accent={telemetry?.choke_point ? 'critical' : 'safe'}>
            {loading ? <LoadingSkeleton height={80} /> : telemetry ? (
              <div>
                {telemetry.choke_point ? (
                  <>
                    <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--critical)', marginBottom: 4 }}>
                      {telemetry.choke_point.zone?.split(' ').slice(0, 1).join(' ') || 'GATE 2'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>
                      {telemetry.choke_point.zone}
                    </div>
                    <motion.div
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="badge-critical"
                    >
                      PRESSURE RISING
                    </motion.div>
                  </>
                ) : (
                  <div>
                    <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--safe)', marginBottom: 4 }}>
                      ALL CLEAR
                    </div>
                    <span className="badge-safe">NORMAL FLOW</span>
                  </div>
                )}
              </div>
            ) : null}
          </TelemetryCard>

          {/* Module 04 — Environment */}
          <TelemetryCard number={4} title="ENVIRONMENT" accent="info">
            {loading ? <LoadingSkeleton height={100} /> : telemetry ? (
              <EnvironmentModule env={telemetry.environment} />
            ) : null}
          </TelemetryCard>
        </div>

        {/* 24H Forecast Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 26 }}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: 20
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div className="label-xs" style={{ marginBottom: 4 }}>24-HOUR FLOW FORECAST</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 20, height: 2, background: 'var(--text-dim)' }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Historical</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 20, height: 2, background: 'var(--info)' }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>AI Projected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 20, height: 2, background: 'var(--critical)', borderStyle: 'dashed', borderWidth: '0 0 2px 0' }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Safe Limit</span>
                </div>
              </div>
            </div>
            <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              SAFE CAPACITY: {forecast.safe_limit?.toLocaleString()} VISITORS
            </div>
          </div>
          <ForecastChart data={forecast.data} safeLimit={forecast.safe_limit} />
        </motion.div>

        {/* Bottom row: Zone Table + Response Protocol */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
          {/* Zone Telemetry */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 280, damping: 26 }}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '20px'
            }}
          >
            <SectionHeader title="ZONE TELEMETRY" subtitle="Live headcount and flow speed per zone" />
            {loading ? (
              <LoadingSkeleton height={160} />
            ) : telemetry?.zones ? (
              <ZoneTable zones={telemetry.zones} />
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No zone data available.</div>
            )}
          </motion.div>

          {/* Response Protocol */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 280, damping: 26 }}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '20px',
              minWidth: 220, maxWidth: 260
            }}
          >
            <SectionHeader title="RESPONSE PROTOCOL" />
            <ResponseProtocol
              activeActions={telemetry?.alert_actions || []}
              onAction={(id) => {
                if (id === 'THROTTLE') handleThrottle();
                else if (id === 'MARSHALS') handleDispatch();
                else if (id === 'REDIRECT') handleOffPeak();
                else toast('Monitoring mode active.', { icon: '👁' });
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
