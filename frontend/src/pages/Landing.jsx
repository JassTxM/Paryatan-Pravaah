import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, LayoutDashboard, ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';

// ── Animated particle canvas ──────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1
    }));

    let raf;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${p.opacity})`;
        ctx.fill();
      });
      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56,189,248,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

// ── Monument SVG silhouette (Taj Mahal wireframe) ─────────────────────────────
function MonumentSilhouette() {
  return (
    <motion.svg
      viewBox="0 0 400 260"
      width="100%"
      height="100%"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 0.8 }}
      style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', maxWidth: 480 }}
    >
      <defs>
        <linearGradient id="silhouette-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(56,189,248,0.15)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </linearGradient>
      </defs>
      {/* Main dome */}
      <motion.path
        d="M200 40 Q240 10 280 60 L275 100 L125 100 L120 60 Q160 10 200 40Z"
        fill="none" stroke="rgba(56,189,248,0.2)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 3, delay: 1, ease: 'easeInOut' }}
      />
      {/* Minarets */}
      <motion.path
        d="M80 180 L80 120 Q88 100 96 120 L96 180Z M304 180 L304 120 Q312 100 320 120 L320 180Z"
        fill="none" stroke="rgba(56,189,248,0.15)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, delay: 1.5 }}
      />
      {/* Main structure */}
      <motion.path
        d="M120 100 L120 180 L280 180 L280 100Z"
        fill="url(#silhouette-grad)" stroke="rgba(56,189,248,0.15)" strokeWidth="1"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      />
      {/* Decorative arches */}
      <motion.path
        d="M145 180 L145 145 Q160 130 175 145 L175 180 M225 180 L225 145 Q240 130 255 145 L255 180"
        fill="none" stroke="rgba(56,189,248,0.12)" strokeWidth="0.8"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 2.2 }}
      />
      {/* Reflecting pool */}
      <motion.path
        d="M140 200 L260 200 L270 220 L130 220 Z"
        fill="none" stroke="rgba(56,189,248,0.1)" strokeWidth="1"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.8 }}
      />
    </motion.svg>
  );
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ value, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 26 }}
      style={{
        background: 'rgba(17,24,39,0.6)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '10px 18px',
        backdropFilter: 'blur(12px)',
        textAlign: 'center'
      }}
    >
      <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="label-xs" style={{ marginTop: 2 }}>{label}</div>
    </motion.div>
  );
}

// ── Comparison Row ────────────────────────────────────────────────────────────
function ComparisonSection() {
  const legacyItems = ['Static schedules', 'Fixed pricing', 'Reactive crowd control', 'Manual monitoring', 'Late intervention'];
  const predictiveItems = ['AI demand forecasting', 'Dynamic slot allocation', 'Demand shifting', 'Live telemetry', 'Early intervention'];

  return (
    <section style={{ padding: '80px 24px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="label-sm" style={{ marginBottom: 8, color: 'var(--info)' }}>HOW IT WORKS</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, letterSpacing: '-0.02em' }}>
          From Guesswork to Intelligence
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Legacy */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderTop: '2px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: 24
          }}
        >
          <div className="mono" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 12 }}>
            LEGACY GUESSWORK
          </div>
          {legacyItems.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 0', borderBottom: i < legacyItems.length - 1 ? '1px solid var(--border)' : 'none'
              }}
            >
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-strong)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{item}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Predictive */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.1 }}
          style={{
            background: 'var(--surface)', border: '1px solid rgba(16,185,129,0.25)',
            borderTop: '2px solid var(--safe)', borderRadius: 'var(--radius-lg)', padding: 24
          }}
        >
          <div className="mono" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--safe)', marginBottom: 12 }}>
            PREDICTIVE FLOW
          </div>
          {predictiveItems.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.08 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 0', borderBottom: i < predictiveItems.length - 1 ? '1px solid var(--border)' : 'none'
              }}
            >
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--safe)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{item}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Feature Pills Row ─────────────────────────────────────────────────────────
function FeaturePills() {
  const features = [
    { icon: TrendingUp, label: 'ML Crowd Prediction', desc: 'AI forecasts visitor pressure 2–24 hours ahead' },
    { icon: Zap, label: 'Dynamic Slot Pricing', desc: 'Incentivizes off-peak visits via price signals' },
    { icon: Shield, label: 'Choke-Point Alerts', desc: 'Detects surge before it becomes dangerous' },
  ];

  return (
    <section style={{ padding: '40px 24px 80px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {features.map(({ icon: Icon, label, desc }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 26 }}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '20px'
            }}
          >
            <div style={{
              width: 36, height: 36, background: 'rgba(56,189,248,0.1)',
              borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: 12
            }}>
              <Icon size={16} color="var(--info)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 600, marginBottom: 6 }}>
              {label}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────
const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { type: 'spring', stiffness: 300, damping: 26 } }
};

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', padding: '80px 24px 0'
      }}>
        {/* Dark radial gradient bg */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(23,32,51,0.8) 0%, var(--bg) 70%)',
          pointerEvents: 'none'
        }} />

        <ParticleCanvas />
        <MonumentSilhouette />

        {/* Content */}
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          style={{ textAlign: 'center', maxWidth: 680, position: 'relative', zIndex: 2 }}
        >
          {/* Live badge */}
          <motion.div variants={stagger.item} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(17,24,39,0.7)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '4px 12px',
              backdropFilter: 'blur(12px)'
            }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--safe)' }}
              />
              <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--safe)', letterSpacing: '0.12em' }}>
                SYSTEM ONLINE · HERITAGE INTELLIGENCE ACTIVE
              </span>
            </div>
          </motion.div>

          {/* Brand */}
          <motion.div variants={stagger.item}>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginBottom: 8,
              background: 'linear-gradient(135deg, var(--text-primary) 0%, rgba(248,250,252,0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              PARYATAN<br />PRAVAAH
            </h1>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: 'var(--text-muted)', marginBottom: 24 }}>
              पर्यटन प्रवाह
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div variants={stagger.item}>
            <p style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', fontWeight: 600, letterSpacing: '-0.02em',
              color: 'var(--text-secondary)', lineHeight: 1.3, marginBottom: 16
            }}>
              Preserving Heritage<br />Through Intelligent Flow
            </p>
          </motion.div>

          <motion.div variants={stagger.item}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.6 }}>
              AI-powered dynamic slot allocation eliminating bottlenecks before they form.
              Predict pressure before it becomes a crowd.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={stagger.item} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link to="/booking" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{
                  background: 'var(--text-primary)', color: 'var(--bg)',
                  border: 'none', borderRadius: 'var(--radius)',
                  padding: '12px 24px', fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                <Ticket size={13} /> BOOK A TIMED VISIT
              </motion.button>
            </Link>
            <Link to="/admin" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{
                  background: 'transparent', color: 'var(--text-secondary)',
                  border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)',
                  padding: '12px 24px', fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  backdropFilter: 'blur(8px)'
                }}
              >
                <LayoutDashboard size={13} /> LAUNCH COMMAND CENTER
              </motion.button>
            </Link>
          </motion.div>

          {/* Stat Pills */}
          <motion.div variants={stagger.item} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <StatPill value="116" label="ASI PROTECTED SITES" delay={0.5} />
            <StatPill value="48M+" label="ANNUAL FOOTFALL" delay={0.6} />
            <StatPill value="0" label="PREVENTABLE CHOKE POINTS" delay={0.7} />
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)' }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--text-muted), transparent)', margin: '0 auto' }}
          />
        </motion.div>
      </section>

      {/* Comparison + Features */}
      <ComparisonSection />
      <FeaturePills />

      {/* Bottom CTA */}
      <section style={{
        padding: '60px 24px 80px', textAlign: 'center',
        borderTop: '1px solid var(--border)'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        >
          <div className="label-sm" style={{ marginBottom: 12, color: 'var(--info)' }}>GET STARTED</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 12 }}>
            Ready to visit a heritage site?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>
            Book a timed entry slot and skip the crowds.
          </p>
          <Link to="/booking" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{
                background: 'var(--text-primary)', color: 'var(--bg)',
                border: 'none', borderRadius: 'var(--radius)',
                padding: '12px 28px', fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8
              }}
            >
              BOOK NOW <ArrowRight size={13} />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
