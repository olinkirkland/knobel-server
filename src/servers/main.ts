import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { startSocketServer } from '../controllers/socket-controller';
import { getUserById } from '../controllers/user-controller';
import { connectToDatabase } from '../database/database';
import { toPublicUserData } from '../database/schemas/user';
import authenticate from '../middlewares/authenticate';
import meRoute from './routes/me';
import shopRoute from './routes/shop';

dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:4000', 'https://localhost:4000'],
    credentials: true
  })
);

connectToDatabase();
startSocketServer();

app.use('/me', meRoute);
app.use('/shop', shopRoute);

app.get('/user/:id', authenticate, async (req, res) => {
  const targetUser = await getUserById(req.params.id);
  if (!targetUser) return res.status(404);

  res.json(toPublicUserData(targetUser));
});

app.listen(process.env.PORT, () => {
  return console.log('Main server is listening on port', process.env.PORT);
});
