const Booking = require('../models/Booking');
const SlotAllocation = require('../models/SlotAllocation');
const Destination = require('../models/Destination');

const createBooking = async (req, res, next) => {
  try {
    const { destination_id, slot_id, visitor_name, visitor_email, ticket_count } = req.body;

    if (!destination_id || !slot_id || !visitor_name || !ticket_count) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (ticket_count < 1 || ticket_count > 10) {
      return res.status(400).json({ success: false, message: 'Ticket count must be 1-10' });
    }

    // ATOMIC booking — prevents overselling via findOneAndUpdate with $expr guard
    const updatedSlot = await SlotAllocation.findOneAndUpdate(
      {
        _id: slot_id,
        status: { $nin: ['FULL', 'THROTTLED', 'CLOSED'] },
        $expr: {
          $lte: [
            { $add: ['$booked_count', ticket_count] },
            '$max_capacity'
          ]
        }
      },
      { $inc: { booked_count: ticket_count } },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(409).json({
        success: false,
        code: 'SLOT_UNAVAILABLE',
        message: 'This slot is full or no longer available. Please select another slot.'
      });
    }

    // Update slot status if now full
    if (updatedSlot.booked_count >= updatedSlot.max_capacity) {
      await SlotAllocation.findByIdAndUpdate(slot_id, { status: 'FULL' });
    }

    const dest = await Destination.findById(destination_id).lean();
    const totalAmount = updatedSlot.dynamic_price * ticket_count;

    const booking = await Booking.create({
      destination_id,
      slot_id,
      visitor_name,
      visitor_email,
      ticket_count,
      price_per_ticket: updatedSlot.dynamic_price,
      total_amount: totalAmount,
      gate: 'GATE 2',
      slot_time_label: updatedSlot.time_label,
      destination_name: dest?.name || 'Heritage Site'
    });

    // Update destination live occupancy
    await Destination.findByIdAndUpdate(destination_id, {
      $inc: { live_occupancy: ticket_count }
    });

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      io.emit('booking.created', {
        booking_ref: booking.booking_ref,
        slot_id,
        destination_id,
        ticket_count,
        slot_time_label: updatedSlot.time_label
      });
      io.emit('slot.updated', {
        slot_id,
        booked_count: updatedSlot.booked_count,
        remaining: Math.max(0, updatedSlot.max_capacity - updatedSlot.booked_count),
        status: updatedSlot.status
      });
      io.emit('occupancy.updated', {
        destination_id,
        delta: ticket_count
      });
    }

    res.status(201).json({
      success: true,
      data: {
        booking_ref: booking.booking_ref,
        visitor_name: booking.visitor_name,
        ticket_count: booking.ticket_count,
        total_amount: booking.total_amount,
        price_per_ticket: booking.price_per_ticket,
        qr_token: booking.qr_token,
        gate: booking.gate,
        slot_time_label: booking.slot_time_label,
        destination_name: booking.destination_name,
        status: booking.status,
        created_at: booking.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking };
