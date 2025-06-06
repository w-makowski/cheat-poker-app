import Player from '../models/Player';
import User from '../models/User';

export async function getPlayersByGameId(gameId: number) {
    const players = await Player.findAll({
        where: { gameId },
        order: [['position', 'ASC']],
        include: [{ model: User, attributes: ['username', 'auth0Id'] }]
    });

    return players.map(player => ({
        id: String(player.id),
        userId: String(player.userId),
        gameId: String(player.gameId),
        position: player.position,
        cardsCount: player.cardsCount,
        isActive: player.isActive,
        isHost: player.isHost,
        username: (player as any).User?.username || '',
        auth0Id: (player as any).User?.auth0Id || '',
        cards: []
    }));
}

// Removes a player from a game by gameId and playerId
export async function removePlayerFromGame(gameId: string | number, playerId: string | number): Promise<void> {
    await Player.destroy({
        where: {
            gameId,
            id: playerId
        }
    });
}