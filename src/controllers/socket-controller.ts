import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { getUserById } from './user-controller';

const sockets = {};
let socketsToInvalidate = [];

export function startSocketServer() {
  const httpServer = createServer();

  const config = {
    cors: {
      origin: ['http://localhost:4000', 'https://localhost:4000'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
    }
  };

  setInterval(() => {
    if (socketsToInvalidate.length === 0) return;

    // Reduce invalidations to unique strings
    socketsToInvalidate = [...new Set(socketsToInvalidate)];

    socketsToInvalidate.forEach((id) => {
      sockets[id].emit('invalidate');
    });

    socketsToInvalidate = [];
  }, 100);

  const io = new Server(httpServer, config);

  io.on('connection', (socket) => {
    // Is socket authenticated?
    const token: string = socket.handshake.query.token as string;
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, data) => {
      const id = data['id'];
      const user = await getUserById(id);
      user.socket = socket.id;
      await user.save();
      sockets[socket.id] = socket;
    });
  });

  io.on('disconnect', async (socket) => {
    const id = sockets[socket.id].handshake.query.id as string;
    const user = await getUserById(id);
    user.socket = null;
    await user.save();
    delete sockets[socket.id];
  });

  httpServer.listen(process.env.SOCKET_PORT, () => {
    console.log(
      '💻',
      'Socket server is listening on port',
      process.env.SOCKET_PORT
    );
  });
}

export function invalidateUser(user) {
  const socketId: string = user.socket;
  const socket: Socket = sockets[socketId];
  if (!socket) return;

  socketsToInvalidate.push(socketId);
}
