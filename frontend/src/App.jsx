import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import NavBar from './components/navigation/NavBar';
import { LoadingSkeleton, DemoBanner } from './components/ui';
import { isDemoMode } from './services/api';
import { useState, useEffect } from 'react';
import './index.css';

const Landing = lazy(() => import('./pages/Landing'));
const Booking = lazy(() => import('./pages/Booking'));
const CommandCenter = lazy(() => import('./pages/CommandCenter'));

function PageSkeleton() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: 1060, margin: '0 auto' }}>
      {[...Array(3)].map((_, i) => (
        <LoadingSkeleton key={i} height={80} radius={8} style={{ marginBottom: 16 }} />
      ))}
    </div>
  );
}

export default function App() {
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    // Check after initial load
    const t = setTimeout(() => setDemo(isDemoMode()), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <BrowserRouter>
      {demo && <DemoBanner />}
      <NavBar />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            letterSpacing: '0.03em',
            maxWidth: 360
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: 'var(--bg)' },
            style: {
              background: 'var(--surface-elevated)',
              borderLeft: '3px solid var(--safe)',
              color: 'var(--text-primary)'
            }
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: 'var(--bg)' },
            style: {
              background: 'var(--surface-elevated)',
              borderLeft: '3px solid var(--critical)',
              color: 'var(--text-primary)'
            }
          }
        }}
      />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/admin" element={<CommandCenter />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
