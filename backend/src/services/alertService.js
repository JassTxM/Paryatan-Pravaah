/**
 * Alert Service — Choke-point detection and surge prediction.
 * Paryatan Pravaah
 */

/**
 * Calculate projected occupancy and determine if threshold breach is imminent.
 * projected = current_visitors - estimated_exits + predicted_inflow
 */
function detectChokePoint(currentVisitors, estimatedExits, predictedInflow, capacity) {
  const cSafe = capacity * 0.85;
  const projectedOccupancy = currentVisitors - estimatedExits + predictedInflow;
  const saturation = projectedOccupancy / capacity;

  if (projectedOccupancy >= cSafe) {
    return {
      alert: 'CRITICAL_SURGE',
      projected_occupancy: projectedOccupancy,
      safe_capacity: cSafe,
      saturation_pct: Math.round(saturation * 100 * 10) / 10,
      actions: ['THROTTLE_SLOT', 'DEPLOY_MARSHALS', 'PUSH_OFF_PEAK_PROMOS'],
      confidence: Math.min(98, Math.round(70 + saturation * 30))
    };
  } else if (projectedOccupancy >= cSafe * 0.85) {
    return {
      alert: 'WARNING_APPROACHING',
      projected_occupancy: projectedOccupancy,
      safe_capacity: cSafe,
      saturation_pct: Math.round(saturation * 100 * 10) / 10,
      actions: ['MONITOR', 'PREPARE_MARSHALS'],
      confidence: Math.min(95, Math.round(60 + saturation * 35))
    };
  }

  return {
    alert: 'NORMAL',
    projected_occupancy: projectedOccupancy,
    safe_capacity: cSafe,
    saturation_pct: Math.round(saturation * 100 * 10) / 10,
    actions: [],
    confidence: null
  };
}

/**
 * Get zone saturation status
 */
function getZoneStatus(headcount, capacity) {
  const pct = (headcount / capacity) * 100;
  if (pct >= 90) return 'CRITICAL';
  if (pct >= 75) return 'WARNING';
  return 'SAFE';
}

module.exports = { detectChokePoint, getZoneStatus };
