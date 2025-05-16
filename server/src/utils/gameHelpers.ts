import { GameState } from '../types/game';


export function getNextActivePlayerIndex(game: GameState, currentRelativeIndex: number): number {
    const totalPlayers = game.players.length;
    let nextIndex = currentRelativeIndex;

    do {
        nextIndex = (nextIndex + 1) % totalPlayers;
        const actualIndex = (game.startingPlayerIndex + nextIndex) % totalPlayers;
        if (game.players[actualIndex].isActive) {
            return nextIndex;
        }
    } while (true);
}
