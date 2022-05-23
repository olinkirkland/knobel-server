import bcrypt from 'bcrypt';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import {
  createGuestUser,
  getUserByEmail,
  registerUser
} from '../controllers/user-controller';
import { connectToDatabase } from '../database/database';

dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3002', 'https://localhost:3002'],
    credentials: true
  })
);

// Add 0.5 seconds of delay to every response
app.use(function (req, res, next) {
  setTimeout(next, 500);
});

connectToDatabase();

let refreshTokens = [];

app.post('/token', (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ id: data.id });
    res.json({ id: data.id, accessToken: accessToken });
  });
});

app.post('/login', async (req, res) => {
  // Either login with email and password combination or create a new guest
  const isGuest = !(req.body.email && req.body.password);
  const user = isGuest
    ? await createGuestUser()
    : await getUserByEmail(req.body.email);

  // If user is not found, return 401
  if (!user) return res.sendStatus(401);

  // Either the user is a guest or the password matches
  if (isGuest || (await bcrypt.compare(req.body.password, user.password))) {
    const payload = { id: user.id };
    const accessToken = generateAccessToken(payload);
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    console.log(
      'refreshTokens:',
      refreshTokens.map((t) => t.substring(t.length - 4, t.length))
    );
    res.json({
      id: user.id,
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  } else {
    res.sendStatus(401);
  }
});

app.post('/logout', (req, res) => {
  const t = req.body.refreshToken;
  console.log(
    'Logging out user with refresh token:',
    t.substring(t.length - 4, t.length)
  );
  refreshTokens = refreshTokens.filter(
    (refreshToken) => refreshToken !== req.body.refreshToken
  );
  res.sendStatus(204);
});

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    registerUser(req.body.id, req.body.email, hashedPassword);
    res.status(201).send();
  } catch (err) {
    res.status(500).send();
  }
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m'
  });
}

app.listen(process.env.AUTH_PORT, () => {
  return console.log('Auth server is listening on port', process.env.AUTH_PORT);
});
