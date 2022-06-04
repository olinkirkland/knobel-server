import Game, { GameOptions } from '../models/game';
import Signal from '../Signal';
import { SocketEvent } from './socket-controller';

// Ongoing games are kept in this array
export let games = [];

Signal.instance.addListener(SocketEvent.DISCONNECT, (user) => {
  if (user.game) removeUserFromGame(user);
});

export function hostGame(user, options: GameOptions) {
  console.log(`🎮 ${user.name} is creating game '${options.name}' ...`);

  // A user cannot host a game if they are already in a game
  if (user.game) {
    console.log(`❌ ${user.name} is already in a game`);
    return false;
  }

  // A user cannot host a game if they are already hosting a game
  if (games.find((g) => g.host.id === user.id)) {
    console.log(`❌ ${user.name} is already hosting a game`);
    return false;
  }

  const game = new Game(options, user);
  games.push(game);

  console.log(`✔️ Game '${options.name}' was created`);
  return game.id;
}

export function addUserToGame(user, gameId: string) {
  console.log(`🎮 User ${user.name} is joining game ${gameId} ...`);

  // A user cannot join a game if they are already in a game
  if (user.game) {
    console.log(`🎮 ${user.name} is already in a game`);
    return false;
  }

  const game = getGameById(gameId);
  if (!game) return false;

  // Add user to game
  game.addPlayer(user);

  console.log(`🎮 User ${user.name} joined game ${gameId}`);
  return true;
}

export function removeUserFromGame(user) {
  console.log(`🎮 ${user.name} is leaving their current game ...`);

  const game: Game = getGameById(user.game);
  if (!game) return false;

  game.removePlayer(user);

  console.log(`🎮 User ${user.username} left game ${user.gameID}`);

  if (game.players.length === 0) {
    // Delete the game if there are no players left
    game.dispose();

    games = games.filter((g) => g.id !== game.id);

    console.log(
      `🗑️ Game ${game.name} was deleted because there were no players`
    );
  }

  if (user.id === game.host.id) {
    // TODO If the host left, pick a new host
    // game.hostUser = getUserSchemaBySocketID(game.players[0].socketID);
    // Connection.invalidateGameData();
  }

  return true;
}

function getGameById(id: string): Game {
  return games.find((game) => game.id === id);
}
