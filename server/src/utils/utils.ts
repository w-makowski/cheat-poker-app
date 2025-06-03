import Game from '../models/Game';
import Player from '../models/Player';
import User from '../models/User';

export async function getUpdatedGameState(gameId: string) {
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

  return game;
}

  