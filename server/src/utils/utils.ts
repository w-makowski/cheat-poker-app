import Game from '../models/Game';
import Player from '../models/Player';
import User from '../models/User';

import { activeGames } from '../services/gameService'; // Make sure this is exported

export async function getUpdatedGameState(gameId: string) {
  // Check in-memory first
  if (activeGames.has(gameId)) {
    return activeGames.get(gameId);
  }
  // Fallback to DB
  const game = await Game.findByPk(gameId, {
    include: [
      {
        model: Player,
        include: [User],
        order: [['position', 'ASC']]
      },
    ]
  });

  if (!game) {
    throw new Error('Game not found');
  }

  return game.get({ plain: true });
}

export async function generateUniqueUsername() {
  const prefix = 'user';
  let username: string = prefix;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    username = `${prefix}${randomNumber}`;

    // check if the username already exists in the database
    const user = await User.findOne({ where: { username } });
    exists = !!user;
  }

  return username;
}

