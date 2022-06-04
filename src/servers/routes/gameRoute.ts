import express from 'express';
import {
  games,
  hostGame,
  addUserToGame,
  removeUserFromGame
} from '../../controllers/game-controller';
import authenticate from '../../middlewares/authenticate';
import identify from '../../middlewares/identify';
const router = express.Router();
export default router;

router.get('/list', authenticate, identify, (req, res) => {
  // Send a list of current games
  res.send(games.map((game) => game));
});

router.post('/host', authenticate, identify, (req, res) => {
  // Host a new game with options
  const options = req.body;
  const gameId = hostGame(req.user, options);
  if (gameId) res.status(200).send(gameId);
  else res.status(400).send('Failed to host game');
});

router.post('/join', authenticate, identify, (req, res) => {
  // Join a game by id
  const gameId = req.body.id;
  console.log(gameId);
  addUserToGame(req.user, gameId)
    ? res.status(200).send('Joined game')
    : res.status(400).send('Failed to join game');
});

router.post('/leave', authenticate, identify, (req, res) => {
  // Leave the current game
  removeUserFromGame(req.user);
});

router.get('/', authenticate, identify, (req, res) => {
  // Get the state of the current game
  // TODO
});

router.get('/start', authenticate, identify, (req, res) => {
  // Start the current game
  // TODO
});

router.get('/answer', authenticate, identify, (req, res) => {
  // Answer the current game
  // TODO
});
