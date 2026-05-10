const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const PORT = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

const activeConnections = new Map();

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
    path: '/socket.io/',
  });

  function broadcastActiveUsers() {
    const uniqueUsers = new Set([...activeConnections.values()].filter(Boolean));
    const count = uniqueUsers.size || activeConnections.size;
    io.emit('active_users', count);
  }

  io.on('connection', (socket) => {
    activeConnections.set(socket.id, null);

    socket.on('register_user', (userId) => {
      activeConnections.set(socket.id, userId);
      broadcastActiveUsers();
    });

    setTimeout(() => broadcastActiveUsers(), 500);

    socket.on('seat_changed', () => {
      io.emit('seat_updated');
    });

    socket.on('disconnect', () => {
      activeConnections.delete(socket.id);
      setTimeout(() => broadcastActiveUsers(), 1000);
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    // Server ready
  });
});
