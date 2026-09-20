import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, MapPin, LayoutDashboard, Ticket, Menu, X } from 'lucide-react';
import { isDemoMode } from '../../services/api';

const navLinks = [
  { to: '/', label: 'Overview', icon: Activity },
  { to: '/booking', label: 'Book Visit', icon: Ticket },
  { to: '/admin', label: 'Command Center', icon: LayoutDashboard },
];

export default function NavBar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setDemo(isDemoMode()), 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.1 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? 'rgba(11,15,23,0.96)' : 'rgba(11,15,23,0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
          transition: 'background 300ms ease, border-color 300ms ease',
          padding: '0 24px',
          height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700,
            color: 'var(--text-primary)', letterSpacing: '0.04em', lineHeight: 1.1
          }}>
            PARYATAN PRAVAAH
          </div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '0.6rem', color: 'var(--text-muted)',
            letterSpacing: '0.06em'
          }}>
            पर्यटन प्रवाह
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hide-mobile">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} style={{ textDecoration: 'none', position: 'relative', padding: '6px 14px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                  letterSpacing: '0.06em', fontWeight: active ? 600 : 400,
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'color var(--transition)',
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <Icon size={11} />
                  {label}
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: 2, background: 'var(--text-primary)',
                      borderRadius: '2px 2px 0 0'
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {/* Status dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12, paddingLeft: 12, borderLeft: '1px solid var(--border)' }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: demo ? 'var(--info)' : 'var(--safe)' }}
            />
            <span className="mono" style={{ fontSize: '0.6rem', color: demo ? 'var(--info)' : 'var(--safe)', letterSpacing: '0.08em' }}>
              {demo ? 'DEMO' : 'LIVE'}
            </span>
          </div>
        </div>

        {/* Book CTA */}
        <Link to="/booking" style={{ textDecoration: 'none' }} className="hide-mobile">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'var(--text-primary)', color: 'var(--bg)',
              border: 'none', borderRadius: 'var(--radius)',
              padding: '7px 16px', fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Ticket size={11} />
            BOOK VISIT
          </motion.button>
        </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'none', padding: 4 }}
          className="show-mobile"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
            style={{
              position: 'fixed', top: 56, left: 0, right: 0, zIndex: 99,
              background: 'rgba(11,15,23,0.98)', backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border)', padding: '16px 24px',
              display: 'flex', flexDirection: 'column', gap: 8
            }}
          >
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} style={{
                textDecoration: 'none', padding: '10px 0',
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.06em',
                color: location.pathname === to ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10
              }}>
                <Icon size={14} /> {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div style={{ height: 56 }} />

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
