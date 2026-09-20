const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  booking_ref: { type: String, unique: true, default: () => `PP-2026-${String(Math.floor(Math.random() * 90000) + 10000)}` },
  destination_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  slot_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SlotAllocation', required: true },
  visitor_name: { type: String, required: true, trim: true },
  visitor_email: { type: String, trim: true },
  ticket_count: { type: Number, required: true, min: 1, max: 10 },
  price_per_ticket: { type: Number, required: true },
  total_amount: { type: Number, required: true },
  qr_token: { type: String, default: () => uuidv4() },
  gate: { type: String, default: 'GATE 2' },
  status: { type: String, enum: ['CONFIRMED', 'CANCELLED', 'USED'], default: 'CONFIRMED' },
  slot_time_label: { type: String },
  destination_name: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
