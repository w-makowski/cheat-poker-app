import Player from '../models/Player';
import User from '../models/User';
import Game from "../models/Game";

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

export async function removePlayerFromGame(gameId: string, playerId: string) {
    const game = await Game.findByPk(gameId);
    if (!game) return;

    if (game.status === 'active') {
        // Set isActive to false
        await Player.update({ isActive: false }, { where: { id: playerId } });
    } else {
        // Remove player from DB
        await Player.destroy({ where: { id: playerId } });
    }
}