const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  destination_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  timestamp: { type: Date, default: Date.now },
  hour_of_day: { type: Number, required: true },
  day_of_week: { type: String },
  visitor_count: { type: Number, required: true },
  predicted_flow: { type: Number },
  safe_limit: { type: Number },
  risk_level: { type: String, enum: ['LOW', 'MODERATE', 'SURGE_RISK'], default: 'LOW' },
  temperature_c: { type: Number },
  humidity_pct: { type: Number },
  rainfall_mm: { type: Number },
  is_weekend: { type: Boolean, default: false },
  is_holiday: { type: Boolean, default: false },
  festival_flag: { type: Boolean, default: false }
}, { timestamps: false });

telemetrySchema.index({ destination_id: 1, timestamp: -1 });

module.exports = mongoose.model('TelemetryLog', telemetrySchema);
