import 'dotenv/config'; // должен быть первым: переменные нужны остальным модулям
import http from 'http';
import connectDB from './config/db.js';
import app from './app.js';
import { initSocket } from './sockets/socket.js';

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in .env');
  process.exit(1);
}

await connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files: http://localhost:${PORT}/uploads`);
});
