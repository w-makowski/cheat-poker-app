import Game from '../models/Game';
import Player from "../models/Player";

// If you have a type or enum for status, import it. Example:
type GameStatus = 'waiting' | 'active' | 'finished';

export async function updateGameStatus(gameId: string, status: GameStatus): Promise<void> {
    await Game.update(
        { status },
        { where: { id: gameId } }
    );
}

export async function deleteGame(gameId: string | number): Promise<void> {
    await Player.destroy({
        where: { gameId }
    });
    await Game.destroy({
        where: { id: gameId }
    });
}

export async function setPlayerAsHost(gameId: string | number, playerId: string | number): Promise<void> {
    // Remove host from all players in the game
    await Player.update(
        { isHost: false },
        { where: { gameId } }
    );
    // Set the new host
    await Player.update(
        { isHost: true },
        { where: { gameId, id: playerId } }
    );
}

export async function getAllGames() {
    return Game.findAll({
        where: { status: 'waiting' }
    });
}