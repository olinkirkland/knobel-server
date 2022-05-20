import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { addNewUser, getUserByEmail } from '../controllers/user-controller';
import { connectToDatabase } from '../database/database';

dotenv.config();
const app = express();
app.use(express.json());

connectToDatabase();

let refreshTokens = [];

app.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ id: data.id });
    res.json({ accessToken: accessToken });
  });
});

app.post('/login', async (req, res) => {
  const user = await getUserByEmail(req.body.email);
  if (!user) return res.sendStatus(500).send('No such user');

  const passwordIsValid = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (passwordIsValid) {
    const payload = { id: user.id };
    const accessToken = generateAccessToken(payload);
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  } else {
    res.status(500).send('Invalid password');
  }
});

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    addNewUser(req.body.email, hashedPassword);

    res.status(201).send();
  } catch (err) {
    res.status(500).send();
  }
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '10m'
  });
}

app.listen(process.env.AUTH_PORT, () => {
  return console.log('Auth server is listening on port', process.env.AUTH_PORT);
});
