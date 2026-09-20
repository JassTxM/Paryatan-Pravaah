import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Users, Ticket, AlertTriangle } from 'lucide-react';
import { ActionButton } from '../ui';
import { createBooking } from '../../services/api';
import toast from 'react-hot-toast';

export default function BookingModal({ slot, destination, onClose, onSuccess }) {
  const [ticketCount, setTicketCount] = useState(1);
  const [visitorName, setVisitorName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!slot || !destination) return null;

  const maxTickets = Math.min(10, slot.remaining_tickets ?? 10);
  const total = ticketCount * slot.dynamic_price;

  const handleBook = async () => {
    if (!visitorName.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      const booking = await createBooking({
        destination_id: destination._id,
        slot_id: slot._id,
        visitor_name: visitorName.trim(),
        ticket_count: ticketCount
      });
      onSuccess(booking);
      toast.success(`Booking confirmed! ${booking.booking_ref}`);
    } catch (err) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 0 0 0'
        }}
      >
        <motion.div
          key="modal-panel"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            padding: '28px 24px 36px',
            width: '100%',
            maxWidth: 520,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {/* Handle */}
          <div style={{
            width: 36, height: 3, background: 'var(--border-strong)',
            borderRadius: 2, margin: '0 auto 24px'
          }} />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div className="label-xs" style={{ marginBottom: 4 }}>BOOKING</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600 }}>
                {destination.name}
              </h2>
              <div className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                {slot.time_label} · ₹{slot.dynamic_price}/ticket
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 'var(--radius)', padding: 6 }}>
              <X size={14} />
            </button>
          </div>

          <div className="divider" style={{ marginBottom: 20 }} />

          {/* Visitor Name */}
          <div style={{ marginBottom: 20 }}>
            <label className="label-xs" style={{ display: 'block', marginBottom: 8 }}>
              LEAD VISITOR NAME
            </label>
            <input
              type="text"
              value={visitorName}
              onChange={e => setVisitorName(e.target.value)}
              placeholder="Enter full name"
              style={{
                width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none',
                transition: 'border-color var(--transition)'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--info)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Ticket count */}
          <div style={{ marginBottom: 20 }}>
            <label className="label-xs" style={{ display: 'block', marginBottom: 8 }}>
              NUMBER OF VISITORS
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => setTicketCount(c => Math.max(1, c - 1))}
                disabled={ticketCount <= 1}
                style={{
                  width: 36, height: 36, background: 'var(--bg)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: ticketCount <= 1 ? 0.4 : 1
                }}
              >
                <Minus size={14} />
              </button>
              <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
                {String(ticketCount).padStart(2,'0')}
              </span>
              <button
                onClick={() => setTicketCount(c => Math.min(maxTickets, c + 1))}
                disabled={ticketCount >= maxTickets}
                style={{
                  width: 36, height: 36, background: 'var(--bg)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: ticketCount >= maxTickets ? 0.4 : 1
                }}
              >
                <Plus size={14} />
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                max {maxTickets} per booking
              </span>
            </div>
          </div>

          {/* Price summary */}
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                ₹{slot.dynamic_price} × {ticketCount} visitors
              </span>
              <span className="mono" style={{ color: 'var(--text-secondary)' }}>₹{total}</span>
            </div>
            {slot.discount_pct > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--safe)', fontSize: '0.78rem' }}>Off-peak discount ({slot.discount_pct}%)</span>
                <span className="mono" style={{ color: 'var(--safe)' }}>
                  -₹{Math.round((slot.base_price - slot.dynamic_price) * ticketCount)}
                </span>
              </div>
            )}
            <div className="divider" style={{ margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>TOTAL</span>
              <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ₹{total}
              </span>
            </div>
          </div>

          {/* Surge warning */}
          {slot.risk_level === 'SURGE_RISK' && (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius)', padding: '10px 12px', marginBottom: 16
            }}>
              <AlertTriangle size={13} color="var(--critical)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                High wait times expected (~45 min) for this slot. Consider an off-peak slot for a better experience.
              </span>
            </div>
          )}

          <ActionButton
            variant="primary"
            icon={Ticket}
            onClick={handleBook}
            loading={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            CONFIRM BOOKING · ₹{total}
          </ActionButton>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
