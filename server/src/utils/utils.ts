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