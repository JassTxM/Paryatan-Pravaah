const Destination = require('../models/Destination');
const SlotAllocation = require('../models/SlotAllocation');
const { generate24HCurve, predictTwoHourInflow } = require('../services/predictionService');
const { detectChokePoint, getZoneStatus } = require('../services/alertService');
const { calculateDynamicPrice } = require('../services/pricingService');

const getTelemetry = async (req, res, next) => {
  try {
    const { destination_id } = req.query;
    if (!destination_id) return res.status(400).json({ success: false, message: 'destination_id required' });

    const dest = await Destination.findById(destination_id).lean();
    if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });

    const currentHour = new Date().getHours();
    const twoHourInflow = predictTwoHourInflow(dest, currentHour);
    const estimatedExits = Math.round(dest.live_occupancy * 0.15); // 15% exit rate per window
    const chokeResult = detectChokePoint(dest.live_occupancy, estimatedExits, twoHourInflow, dest.total_capacity);

    // Enrich zones with status
    const zones = (dest.zones || []).map(z => ({
      ...z,
      saturation_pct: Math.round((z.live_headcount / z.capacity) * 100 * 10) / 10,
      status: getZoneStatus(z.live_headcount, z.capacity)
    }));

    const chokeZone = zones.find(z => z.status === 'CRITICAL');

    res.json({
      success: true,
      data: {
        destination: {
          _id: dest._id,
          name: dest.name,
          location: dest.location
        },
        current_visitors: dest.live_occupancy,
        capacity: dest.total_capacity,
        safe_threshold: dest.safe_threshold,
        saturation_pct: Math.round((dest.live_occupancy / dest.total_capacity) * 100 * 10) / 10,
        predicted_two_hour_inflow: twoHourInflow,
        choke_point: chokeZone ? {
          zone: chokeZone.name,
          alert: chokeResult.alert,
          confidence: chokeResult.confidence,
          actions: chokeResult.actions
        } : null,
        alert: chokeResult.alert,
        alert_confidence: chokeResult.confidence,
        alert_actions: chokeResult.actions,
        environment: dest.environment,
        zones,
        last_sync: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};

const getForecastCurve = async (req, res, next) => {
  try {
    const { destination_id } = req.query;
    if (!destination_id) return res.status(400).json({ success: false, message: 'destination_id required' });

    const dest = await Destination.findById(destination_id).lean();
    if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });

    const today = new Date().toISOString().split('T')[0];
    const curve = generate24HCurve(dest, today);

    // Generate "historical" (past hours) vs "projected" (future hours)
    const currentHour = new Date().getHours();

    const enriched = curve.map((point, hour) => ({
      ...point,
      is_historical: hour < currentHour,
      is_current: hour === currentHour,
      is_projected: hour > currentHour,
      // Historical has slight variance from prediction
      actual_flow: hour < currentHour
        ? Math.round(point.predicted_flow * (0.9 + Math.random() * 0.2))
        : null
    }));

    res.json({ success: true, data: enriched, safe_limit: dest.safe_threshold });
  } catch (err) {
    next(err);
  }
};

const throttleSlot = async (req, res, next) => {
  try {
    const { slot_id, destination_id } = req.body;

    if (slot_id) {
      await SlotAllocation.findByIdAndUpdate(slot_id, { status: 'THROTTLED', throttled: true });
    } else if (destination_id) {
      // Throttle all surge-risk slots for this destination today
      const today = new Date().toISOString().split('T')[0];
      await SlotAllocation.updateMany(
        { destination_id, date: today, risk_level: 'SURGE_RISK' },
        { status: 'THROTTLED', throttled: true }
      );
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('slot.updated', { slot_id, status: 'THROTTLED', action: 'THROTTLE' });
      io.emit('critical.alert', {
        type: 'THROTTLE_ACTIVE',
        message: 'Online inventory throttled. Pressure mitigation active.',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Slot inventory throttled. Online bookings restricted.',
      action: 'THROTTLE_SLOT'
    });
  } catch (err) {
    next(err);
  }
};

const dispatchMarshals = async (req, res, next) => {
  try {
    const { destination_id, zone } = req.body;

    const io = req.app.get('io');
    const eta = Math.floor(Math.random() * 4) + 3; // 3-7 min
    if (io) {
      io.emit('critical.alert', {
        type: 'MARSHALS_DISPATCHED',
        message: `Field team dispatched to ${zone || 'Gate 2'}. ETA ${eta} minutes.`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Field marshals dispatched',
      eta_minutes: eta,
      zone: zone || 'Gate 2',
      team_size: 6
    });
  } catch (err) {
    next(err);
  }
};

const deployOffPeak = async (req, res, next) => {
  try {
    const { destination_id } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Apply 25% off to LOW risk slots
    const lowSlots = await SlotAllocation.find({
      destination_id, date: today, risk_level: 'LOW', throttled: false
    });

    for (const slot of lowSlots) {
      const discountedPrice = Math.round(slot.base_price * 0.75);
      await SlotAllocation.findByIdAndUpdate(slot._id, {
        dynamic_price: discountedPrice,
        discount_pct: 25,
        recommendation: 'SPECIAL OFFER — 25% off + Express Access'
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('forecast.updated', { destination_id, action: 'OFF_PEAK_DEPLOYED' });
      io.emit('critical.alert', {
        type: 'OFF_PEAK_DEPLOYED',
        message: `Off-peak incentives deployed. ${lowSlots.length} slots discounted 25%.`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Off-peak discounts deployed to ${lowSlots.length} slots`,
      slots_affected: lowSlots.length
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTelemetry, getForecastCurve, throttleSlot, dispatchMarshals, deployOffPeak };
