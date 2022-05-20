import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { connectToDatabase, users } from './database/database';

dotenv.config();
const app = express();
app.use(express.json());

connectToDatabase();

let refreshTokens = [];

app.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post('/login', async (req, res) => {
  const user = await users.findOne({ username: req.body.username });
  if (!user) return res.sendStatus(500).send('Invalid username or password');

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = generateAccessToken(user);
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
      refreshTokens.push(refreshToken);
      res.json({ accessToken: accessToken, refreshToken: refreshToken });
    } else {
      res.status(500).send('Invalid username or password');
    }
  } catch {
    res.status(500).send('Invalid username or password');
  }
});

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    console.log(hashedPassword);

    const user = { name: req.body.name, password: hashedPassword };
    users.insertOne(user);

    res.status(201).send();
  } catch (err) {
    res.status(500).send();
  }
});

app.get('/users', (req, res) => {
  console.log(users);
  res.json(users);
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '30s'
  });
}

app.listen(4000, () => {
  return console.log('Express is listening at', `http://localhost:${4000}`);
});
