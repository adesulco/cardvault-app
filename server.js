const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: { origin: ['https://beta.cardvault.id', 'https://admin.cardvault.id', 'http://localhost:3000'] }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Handle new messages and broadcast
    socket.on('send_message', (data) => {
      // We broadcast to everyone in the room (including sender if we don't manually append on client)
      // Usually, we emit to the room, but the sender might have already appended it optimistically
      // io.to(data.conversationId).emit('receive_message', data);
      socket.to(data.conversationId).emit('receive_message', data); // Broadcast to everyone ELSE in room
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port} with Socket.io Enabled`);
  });
});
