import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, CheckCircle } from 'lucide-react';
import DestinationCard from '../components/booking/DestinationCard';
import SlotCard from '../components/booking/SlotCard';
import BookingModal from '../components/booking/BookingModal';
import DigitalPass from '../components/booking/DigitalPass';
import { SectionHeader, LoadingSkeleton } from '../components/ui';
import { getDestinations, getSlots } from '../services/api';
import toast from 'react-hot-toast';

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export default function Booking() {
  const [destinations, setDestinations] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loadingDests, setLoadingDests] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Load destinations
  useEffect(() => {
    getDestinations().then(d => { setDestinations(d); setLoadingDests(false); });
  }, []);

  // Load slots when dest/date changes
  useEffect(() => {
    if (!selectedDest) return;
    setLoadingSlots(true);
    setSlots([]);
    getSlots(selectedDest._id, selectedDate)
      .then(s => setSlots(s))
      .finally(() => setLoadingSlots(false));
  }, [selectedDest, selectedDate]);

  const handleBookingSuccess = (b) => {
    setBooking(b);
    setShowModal(false);
    setSelectedSlot(null);
  };

  // If we have a confirmed booking, show the pass
  if (booking) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: 32 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
              style={{
                width: 48, height: 48, background: 'rgba(16,185,129,0.1)',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px'
              }}
            >
              <CheckCircle size={24} color="var(--safe)" />
            </motion.div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>
              BOOKING CONFIRMED
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Show this pass at the entry gate.
            </p>
          </motion.div>

          <DigitalPass
            booking={booking}
            destination={selectedDest}
            slotTime={selectedSlot?.time_label}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ marginTop: 24, textAlign: 'center' }}
          >
            <button
              onClick={() => { setBooking(null); setSelectedSlot(null); }}
              style={{
                background: 'none', border: '1px solid var(--border)',
                color: 'var(--text-muted)', cursor: 'pointer',
                borderRadius: 'var(--radius)', padding: '8px 20px',
                fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                letterSpacing: '0.08em'
              }}
            >
              BOOK ANOTHER VISIT
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 24px 80px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>

        {/* Step 1: Destination */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
          <SectionHeader number={1} title="SELECT DESTINATION" subtitle="Choose a UNESCO heritage monument to visit." />
          {loadingDests ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} height={160} radius={8} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
              {destinations.map(dest => (
                <DestinationCard
                  key={dest._id}
                  dest={dest}
                  selected={selectedDest?._id === dest._id}
                  onClick={d => { setSelectedDest(d); setSelectedSlot(null); setBooking(null); }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Step 2: Date + Slots */}
        <AnimatePresence>
          {selectedDest && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            >
              {/* Date selector */}
              <div style={{ marginBottom: 32 }}>
                <SectionHeader number={2} title="SELECT DATE" />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[today, tomorrow].map(d => {
                    const label = d === today ? 'TODAY' : 'TOMORROW';
                    const display = new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                    const active = selectedDate === d;
                    return (
                      <motion.button
                        key={d}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          background: active ? 'rgba(248,250,252,0.06)' : 'var(--surface)',
                          border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-lg)', padding: '12px 18px',
                          cursor: 'pointer', color: active ? 'var(--text-primary)' : 'var(--text-muted)'
                        }}
                      >
                        <Calendar size={13} color="var(--info)" />
                        <div style={{ textAlign: 'left' }}>
                          <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', fontWeight: 700 }}>{label}</div>
                          <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>{display}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Slot grid */}
              <div>
                <SectionHeader
                  number={3}
                  title="AVAILABLE SLOTS"
                  subtitle={`AI-enriched entry slots for ${selectedDest.name}`}
                />

                {loadingSlots ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {[...Array(8)].map((_, i) => <LoadingSkeleton key={i} height={130} radius={8} />)}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {slots.map(slot => (
                      <SlotCard
                        key={slot._id}
                        slot={slot}
                        selected={selectedSlot?._id === slot._id}
                        onClick={s => { setSelectedSlot(s); setShowModal(true); }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking modal */}
        <AnimatePresence>
          {showModal && selectedSlot && (
            <BookingModal
              slot={selectedSlot}
              destination={selectedDest}
              onClose={() => { setShowModal(false); setSelectedSlot(null); }}
              onSuccess={handleBookingSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
