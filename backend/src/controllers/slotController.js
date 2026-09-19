const SlotAllocation = require('../models/SlotAllocation');
const Destination = require('../models/Destination');
const { generate24HCurve } = require('../services/predictionService');
const { calculateDynamicPrice, getSlotStatus } = require('../services/pricingService');

const getSlots = async (req, res, next) => {
  try {
    const { destination_id, date } = req.query;
    if (!destination_id || !date) {
      return res.status(400).json({ success: false, message: 'destination_id and date required' });
    }

    let slots = await SlotAllocation.find({ destination_id, date }).sort({ hour_of_day: 1 }).lean();

    // Auto-generate slots if none exist for this date
    if (slots.length === 0) {
      const dest = await Destination.findById(destination_id).lean();
      if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });

      const curve = generate24HCurve(dest, date);
      const slotDocs = [];

      for (let hour = 6; hour <= 19; hour++) {
        const hourData = curve[hour];
        const pricing = calculateDynamicPrice(hourData.predicted_flow, dest.total_capacity, dest.base_price);
        const maxCap = Math.floor(dest.total_capacity / 14); // 14 slots across the day
        const timeLabel = `${String(hour).padStart(2, '0')}:00`;

        slotDocs.push({
          destination_id,
          date,
          hour_of_day: hour,
          time_label: timeLabel,
          max_capacity: maxCap,
          booked_count: Math.floor(Math.random() * maxCap * 0.3), // some pre-booked for realism
          predicted_flow: hourData.predicted_flow,
          base_price: dest.base_price,
          dynamic_price: pricing.price,
          discount_pct: pricing.discount_pct > 0 ? pricing.discount_pct : 0,
          risk_level: pricing.risk_level,
          status: getSlotStatus(pricing.risk_level, 0, maxCap, false),
          recommendation: pricing.recommendation
        });
      }

      slots = await SlotAllocation.insertMany(slotDocs, { ordered: false }).catch(() => slotDocs);
      slots = await SlotAllocation.find({ destination_id, date }).sort({ hour_of_day: 1 }).lean();
    }

    const enriched = slots.map(s => ({
      ...s,
      remaining_tickets: Math.max(0, s.max_capacity - s.booked_count)
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSlots };
