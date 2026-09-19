/**
 * Dynamic Pricing Service — Paryatan Pravaah
 * Implements exact pricing formula from spec.
 */

/**
 * Calculate dynamic price based on predicted flow vs safe capacity.
 * C_safe = 0.85 * destination_capacity
 *
 * flow < 0.40 * C_safe  →  price = round(base * 0.75)   [LOW — 25% off]
 * flow < 0.80 * C_safe  →  price = base                  [MODERATE]
 * flow >= 0.80 * C_safe →  price = round(base * 1.40)   [SURGE — 40% premium]
 */
function calculateDynamicPrice(predictedFlow, capacity, basePrice) {
  const cSafe = 0.85 * capacity;

  if (predictedFlow < 0.40 * cSafe) {
    return {
      price: Math.round(basePrice * 0.75),
      base_price: basePrice,
      discount_pct: 25,
      risk_level: 'LOW',
      recommendation: 'BEST VALUE — Low crowds expected'
    };
  } else if (predictedFlow < 0.80 * cSafe) {
    return {
      price: basePrice,
      base_price: basePrice,
      discount_pct: 0,
      risk_level: 'MODERATE',
      recommendation: 'MODERATE FLOW — Pleasant visit expected'
    };
  } else {
    return {
      price: Math.round(basePrice * 1.40),
      base_price: basePrice,
      discount_pct: -40, // surcharge indicator
      risk_level: 'SURGE_RISK',
      recommendation: 'HIGH DEMAND — Expect wait times ~45 min'
    };
  }
}

/**
 * Get slot status from risk level and occupancy
 */
function getSlotStatus(riskLevel, bookedCount, maxCapacity, throttled) {
  if (throttled) return 'THROTTLED';
  if (bookedCount >= maxCapacity) return 'FULL';
  const pct = bookedCount / maxCapacity;
  if (riskLevel === 'SURGE_RISK') return 'SURGE_RISK';
  if (pct > 0.85) return 'LIMITED';
  return 'AVAILABLE';
}

module.exports = { calculateDynamicPrice, getSlotStatus };
