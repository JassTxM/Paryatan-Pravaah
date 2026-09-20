require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const destinationsRouter = require('./routes/destinations');
const slotsRouter = require('./routes/slots');
const bookingsRouter = require('./routes/bookings');
const adminRouter = require('./routes/admin');
const { errorHandler } = require('./middleware/errorHandler');
const { setupSocketHandlers } = require('./sockets/socketHandlers');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});
app.set('io', io);
setupSocketHandlers(io);

// Security & middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  message: { success: false, message: 'Too many requests' }
});
app.use('/api', limiter);

// Routes
app.use('/api/v1/destinations', destinationsRouter);
app.use('/api/v1/slots', slotsRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/admin', adminRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Paryatan Pravaah API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handler (must be last)
app.use(errorHandler);

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paryatan_pravaah';
const PORT = process.env.PORT || 5001;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`[DB] MongoDB connected: ${MONGO_URI}`);
    server.listen(PORT, () => {
      console.log(`\n[SERVER] Paryatan Pravaah API running on port ${PORT}`);
      console.log(`[SERVER] Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`[SERVER] Health: http://localhost:${PORT}/health\n`);
    });
  })
  .catch((err) => {
    console.error('[DB] MongoDB connection failed:', err.message);
    console.log('[SERVER] Starting in DEMO mode (no DB)...');
    server.listen(PORT, () => {
      console.log(`[SERVER] Running on port ${PORT} (demo/no-db mode)`);
    });
  });

module.exports = app;
