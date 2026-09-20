const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  live_headcount: { type: Number, default: 0 },
  flow_speed_kmh: { type: Number, default: 2.0 }
}, { _id: false });

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  state: { type: String, required: true },
  annual_visitors: { type: Number, required: true },
  total_capacity: { type: Number, required: true },
  safe_threshold: { type: Number, required: true },
  base_price: { type: Number, required: true },
  description: { type: String },
  image_url: { type: String },
  zones: [zoneSchema],
  live_occupancy: { type: Number, default: 0 },
  status: { type: String, enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE'], default: 'ONLINE' },
  environment: {
    temperature_c: { type: Number, default: 29 },
    humidity_pct: { type: Number, default: 61 },
    rainfall_mm: { type: Number, default: 0 },
    festival: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
