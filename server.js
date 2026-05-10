const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ path: '.env.local' });

const server = http.createServer();

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

// ==========================================
// SOCKET.IO RELAY SERVER
// Track unique users by a custom userId, not by socket count
// ==========================================

const activeConnections = new Map(); // socketId -> userId

function broadcastActiveUsers() {
  // Hitung user UNIK (bukan jumlah koneksi socket)
  const uniqueUsers = new Set([...activeConnections.values()].filter(Boolean));
  const count = uniqueUsers.size || activeConnections.size;
  io.emit('active_users', count);
  console.log(`👥 Active users: ${count} (${activeConnections.size} connections)`);
}

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);
  activeConnections.set(socket.id, null);

  // Client akan kirim userId setelah connect
  socket.on('register_user', (userId) => {
    activeConnections.set(socket.id, userId);
    broadcastActiveUsers();
  });

  // Broadcast setelah sedikit delay agar koneksi lama sempat disconnect
  setTimeout(() => broadcastActiveUsers(), 500);

  socket.on('seat_changed', () => {
    console.log(`🔄 Seat change from ${socket.id}, broadcasting...`);
    io.emit('seat_updated');
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    activeConnections.delete(socket.id);
    // Delay broadcast agar refresh tidak menyebabkan angka naik-turun
    setTimeout(() => broadcastActiveUsers(), 1000);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
  🔌 ==========================================
     Socket.io Relay Server aktif di port ${PORT}
     Menunggu koneksi dari frontend...
  ==============================================
  `);
});
