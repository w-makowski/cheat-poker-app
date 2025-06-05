import type { GameState } from '../types/game';

export const transformGameResponse = (game: any): GameState => {
    if (!game) {
        throw new Error('No game data provided');
    }

    // Support both Players (from DB) and players (from server/game logic)
    const playersArray = Array.isArray(game.Players)
        ? game.Players
        : Array.isArray(game.players)
            ? game.players
            : [];

    return {
        id: game.id,
        name: game.name,
        status: game.status,
        currentTurn: game.currentTurn,
        maxPlayers: game.maxPlayers,
        deckCount: game.numberOfDecks ?? game.deckCount ?? 1,
        players: playersArray.map((player: any) => ({
            id: player.id,
            username: player.User?.username ?? player.username ?? '',
            cardsCount: player.cardsCount,
            isActive: player.isActive,
            position: player.position,
            auth: player.User?.auth0Id ?? player.auth ?? '',
            isHost: player.isHost,
        })),
        startingPlayerIndex: game.startingPlayerIndex ?? 0,
        currentPlayerIndex: game.currentPlayerIndex ?? 0,
        lastDeclaredHand: game.lastDeclaredHand
            ? {
                playerId: game.lastDeclaredHand.playerId,
                declaredHand: game.lastDeclaredHand.declaredHand,
            }
            : null,
        winner: game.winner || null,
    };
};