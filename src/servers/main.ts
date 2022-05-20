import dotenv from 'dotenv';
import express from 'express';
import { getUserById } from '../controllers/user-controller';
import { connectToDatabase } from '../database/database';
import { toPersonalUserData, toPublicUserData } from '../database/schemas/user';
import authenticate from '../middlewares/authenticate';

dotenv.config();
const app = express();
app.use(express.json());

connectToDatabase();

app.get('/posts', authenticate, (req, res) => {
  // res.json(posts.filter((post) => post.username === req.user.username));
});

app.get('/me', authenticate, async (req, res) => {
  console.log('me', req.id);

  const user = await getUserById(req.id);
  if (!user) return res.sendStatus(404);

  res.json(toPersonalUserData(user));
});

app.get('/user/:id', authenticate, async (req, res) => {
  const targetUser = await getUserById(req.params.id);
  if (!targetUser) return res.status(404);

  res.json(toPublicUserData(targetUser));
});

app.listen(process.env.SERVER_PORT, () => {
  return console.log('Main server is listening on port', process.env.AUTH_PORT);
});
