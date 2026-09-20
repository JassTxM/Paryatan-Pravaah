/**
 * Prediction Service — interfaces with ML inference or uses deterministic fallback.
 * Paryatan Pravaah
 */

const { calculateDynamicPrice } = require('./pricingService');

/**
 * Generate a deterministic 24-hour flow curve for a destination.
 * Uses a realistic tourist arrival pattern with festival/weekend modifiers.
 * This is the demo/fallback path when the ML model is not available.
 */
function generate24HCurve(destination, date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const baseCapacity = destination.total_capacity;
  const safeLimit = destination.safe_threshold || Math.round(baseCapacity * 0.85);
  const festival = destination.environment?.festival || false;

  // Hourly distribution pattern (normalized, 0-1 scale)
  // Models real heritage monument visitor patterns: peak 10am-12pm, secondary 3-5pm
  const hourlyPattern = [
    0.02, 0.01, 0.01, 0.01, 0.02, 0.05,  // 00-05
    0.15, 0.35, 0.55, 0.75, 0.95, 1.00,  // 06-11 (morning peak)
    0.90, 0.80, 0.70, 0.78, 0.82, 0.72,  // 12-17 (afternoon)
    0.55, 0.40, 0.28, 0.18, 0.10, 0.05   // 18-23 (evening decline)
  ];

  const weekendMultiplier = isWeekend ? 1.25 : 1.0;
  const festivalMultiplier = festival ? 1.45 : 1.0;
  const combinedMultiplier = weekendMultiplier * festivalMultiplier;

  // Add some deterministic "noise" based on date seed
  const seed = d.getDate() + d.getMonth() * 31;

  return hourlyPattern.map((pattern, hour) => {
    const noiseFactor = 1 + ((Math.sin(seed * hour * 0.37) * 0.08));
    const predictedFlow = Math.round(baseCapacity * pattern * combinedMultiplier * noiseFactor);
    const { risk_level } = calculateDynamicPrice(predictedFlow, baseCapacity, destination.base_price);

    return {
      hour,
      predicted_flow: predictedFlow,
      safe_limit: safeLimit,
      risk_level,
      confidence: Math.round(85 + Math.sin(hour * 0.5) * 8)
    };
  });
}

/**
 * Generate predicted inflow for next 2 hours
 */
function predictTwoHourInflow(destination, currentHour) {
  const curve = generate24HCurve(destination, new Date().toISOString().split('T')[0]);
  const h1 = curve[Math.min(currentHour + 1, 23)];
  const h2 = curve[Math.min(currentHour + 2, 23)];
  return (h1?.predicted_flow || 0) + (h2?.predicted_flow || 0);
}

module.exports = { generate24HCurve, predictTwoHourInflow };
