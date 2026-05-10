const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

// ==========================================
// SOCKET.IO: UNIQUE USER TRACKING
// ==========================================
const activeConnections = new Map();

function broadcastActiveUsers(io) {
  const uniqueUsers = new Set([...activeConnections.values()].filter(Boolean));
  const count = uniqueUsers.size || activeConnections.size;
  io.emit('active_users', count);
  console.log(`👥 Active users: ${count} (${activeConnections.size} connections)`);
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: false,
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 10000,
    pingInterval: 5000,
  });

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);
    activeConnections.set(socket.id, null);

    socket.on('register_user', (userId) => {
      activeConnections.set(socket.id, userId);
      broadcastActiveUsers(io);
    });

    setTimeout(() => broadcastActiveUsers(io), 500);

    socket.on('seat_changed', () => {
      console.log(`🔄 Seat change from ${socket.id}, broadcasting...`);
      io.emit('seat_updated');
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
      activeConnections.delete(socket.id);
      setTimeout(() => broadcastActiveUsers(io), 1000);
    });
  });

  server.listen(PORT, () => {
    console.log(`
  🚀 ==========================================
     LibSpace Server aktif di port ${PORT}
     Mode: ${dev ? 'Development' : 'Production'}
     Next.js + Socket.io berjalan bersama
  ==============================================
    `);

    // Periodic check: auto-release expired seats setiap 30 detik
    setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:${PORT}/api/seats`);
        const { seats } = await res.json();
        // Jika ada kursi yang baru di-release, broadcast ke semua client
        const hasExpired = seats?.some(s => s.status === 'available' && !s.locked_by);
        if (hasExpired) {
          io.emit('seat_updated');
        }
      } catch (err) {
        // Ignore errors during periodic check
      }
    }, 30000); // Setiap 30 detik
  });
});
