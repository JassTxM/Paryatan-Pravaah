/**
 * Socket.IO event handlers — Paryatan Pravaah
 */
const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    socket.on('subscribe:destination', (destinationId) => {
      socket.join(`destination:${destinationId}`);
      console.log(`[SOCKET] ${socket.id} subscribed to destination:${destinationId}`);
    });

    socket.on('subscribe:admin', () => {
      socket.join('admin');
      console.log(`[SOCKET] Admin client: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });

  // Broadcast telemetry simulation every 30s (for live feel)
  setInterval(() => {
    io.emit('telemetry.tick', { timestamp: new Date().toISOString() });
  }, 30000);
};

module.exports = { setupSocketHandlers };
