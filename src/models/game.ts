import { v4 as uuid } from 'uuid';
import { toPublicUserData } from '../database/schemas/user';

export interface GameOptions {
  name: string;
}

export default class Game {
  public id: string;
  public name: string;
  public host: any;
  public players: any[] = [];

  constructor(options: GameOptions, host) {
    this.id = uuid();
    this.name = options.name;
    this.host = host;
  }

  public addPlayer(user) {
    this.players.push(user);
  }

  public removePlayer(user) {
    this.players = this.players.filter((player) => player.id !== user.id);
  }

  public dispose() {}

  public toOverviewObject() {
    return {
      id: this.id,
      name: this.name,
      host: toPublicUserData(this.host),
      players: this.players.map((player) => toPublicUserData(player))
    };
  }
}
