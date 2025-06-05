import Game from '../models/Game';

// If you have a type or enum for status, import it. Example:
type GameStatus = 'waiting' | 'active' | 'finished';

export async function updateGameStatus(gameId: string, status: GameStatus): Promise<void> {
    await Game.update(
        { status },
        { where: { id: gameId } }
    );
}