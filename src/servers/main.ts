import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { getUserById } from '../controllers/user-controller';
import { connectToDatabase } from '../database/database';
import { toPersonalUserData, toPublicUserData } from '../database/schemas/user';
import authenticate from '../middlewares/authenticate';
import meRoute from './routes/me';

dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3002', 'https://localhost:3002'],
    credentials: true
  })
);

connectToDatabase();

app.use('/me', meRoute);

app.get('/user/:id', authenticate, async (req, res) => {
  const targetUser = await getUserById(req.params.id);
  if (!targetUser) return res.status(404);

  res.json(toPublicUserData(targetUser));
});

app.listen(process.env.SERVER_PORT, () => {
  return console.log('Main server is listening on port', process.env.AUTH_PORT);
});
