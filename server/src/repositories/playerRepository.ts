import Player from '../models/Player';
import User from '../models/User';
import Game from "../models/Game";
import {updateGameStatus} from "./gameRepository";

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
        cards: [],
        standing: player.standing ?? null // <-- Add this line
    }));
}

// Removes a player from a game by gameId and playerId

export async function removePlayerFromGame(gameId: string, playerId: string): Promise<{isGameFinished: boolean}> {
    console.log(`[removePlayerFromGame] Called with gameId=${gameId}, playerId=${playerId}`);
    const game = await Game.findByPk(gameId);
    if (!game) {
        console.log(`[removePlayerFromGame] Game not found: ${gameId}`);
        return { isGameFinished: true };
    }

    if (game.status === 'active') {
        const players = await Player.findAll({ where: { gameId } });
        const finishedCount = players.filter(p => p.standing !== null && p.standing !== undefined).length;
        const nextStanding = players.length - finishedCount;

        await Player.update(
            { isActive: false, standing: nextStanding },
            { where: { id: playerId } }
        );
        console.log(`[removePlayerFromGame] Player ${playerId} set inactive, standing=${nextStanding}`);

        const activePlayers = await Player.findAll({
            where: { gameId, isActive: true }
        });
        console.log(`[removePlayerFromGame] Active players left: ${activePlayers.length}`);

        if (activePlayers.length === 1) {
            console.log(`[removePlayerFromGame] Only one player left, finishing game`);
            updateGameStatus(gameId, 'finished');
            markPlayerAsWinner(activePlayers[0].id, gameId);
            return { isGameFinished: true };
        } else {
            return { isGameFinished: false };
        }
    } else {
        await Player.destroy({ where: { id: playerId } });
        console.log(`[removePlayerFromGame] Player ${playerId} removed from DB`);
        return { isGameFinished: false };
    }
}

export async function markPlayerAsWinner(playerId: number, gameId: string): Promise<boolean> {
    const [updatedCount] = await Player.update(
        { standing: 1 },
        { where: { id: playerId, gameId } }
    );
    return updatedCount > 0;
}