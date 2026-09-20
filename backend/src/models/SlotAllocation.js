const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  destination_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  hour_of_day: { type: Number, required: true, min: 0, max: 23 },
  time_label: { type: String, required: true }, // "10:00 AM"
  max_capacity: { type: Number, required: true },
  booked_count: { type: Number, default: 0 },
  predicted_flow: { type: Number, default: 0 },
  base_price: { type: Number, required: true },
  dynamic_price: { type: Number, required: true },
  discount_pct: { type: Number, default: 0 },
  risk_level: { type: String, enum: ['LOW', 'MODERATE', 'SURGE_RISK'], default: 'LOW' },
  status: { type: String, enum: ['AVAILABLE', 'LIMITED', 'SURGE_RISK', 'FULL', 'THROTTLED', 'CLOSED'], default: 'AVAILABLE' },
  recommendation: { type: String, default: '' },
  throttled: { type: Boolean, default: false }
}, { timestamps: true });

slotSchema.index({ destination_id: 1, date: 1 });
slotSchema.index({ destination_id: 1, date: 1, hour_of_day: 1 }, { unique: true });

slotSchema.virtual('remaining_tickets').get(function() {
  return Math.max(0, this.max_capacity - this.booked_count);
});

module.exports = mongoose.model('SlotAllocation', slotSchema);
