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
import authenticate from '../middlewares/authenticate';

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

let refreshTokensWithUserIds: Array<{ id: string; token: string }> = [];

app.post('/token', (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  if (!refreshTokensWithUserIds.find((t) => t.token === refreshToken))
    return res.sendStatus(401);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
    if (err) return res.sendStatus(401);
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
  if (!user) return res.status(401).send('Incorrect email or password.');

  // Either the user is a guest or the password matches
  if (isGuest || (await bcrypt.compare(req.body.password, user.password))) {
    const payload = { id: user.id };
    const accessToken = generateAccessToken(payload);

    // If a refresh token already exists, remove it; This logs out any concurrent sessions
    refreshTokensWithUserIds = refreshTokensWithUserIds.filter(
      (t) => t.id !== user.id
    );

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    refreshTokensWithUserIds.push({ id: user.id, token: refreshToken });

    console.log(
      'refreshTokensWithUserIds:',
      refreshTokensWithUserIds.map((t) => {
        return {
          id: t.id.substring(0, 6),
          token: t.token.substring(t.token.length - 4, t.token.length)
        };
      })
    );

    res.json({
      id: user.id,
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  } else {
    res.status(401).send('Incorrect Email or password.');
  }
});

app.post('/logout', (req, res) => {
  const t = req.body.refreshToken;
  console.log(
    'Logging out user with refresh token:',
    t.substring(t.length - 4, t.length)
  );
  refreshTokensWithUserIds = refreshTokensWithUserIds.filter(
    (t) => t.token !== req.body.refreshToken
  );
  res.sendStatus(204);
});

app.post('/register', authenticate, async (req, res) => {
  // Authenticate is required because an existing guest user is upgrading to a registered account
  try {
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password, 10);

    console.log('🆕', 'Registering email', email, '...');

    // Is the email already registered?
    const user = await getUserByEmail(email);
    if (user) {
      console.log('❌', email, 'is already registered');
      return res.status(409).send(`The Email ${email} is already registered.`);
    }

    const isRegistered = await registerUser(req.id, email, password);
    if (isRegistered) {
      console.log('✔️', email, 'registered successfully');
    } else {
      console.log('❌', email, 'failed to register');
      res.status(409).send();
    }

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
