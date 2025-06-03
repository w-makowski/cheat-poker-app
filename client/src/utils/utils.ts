import type { GameState } from '../types/game';

export const transformGameResponse = (game: any): GameState => ({
    id: game.id,
    name: game.name,
    status: game.status,
    currentTurn: game.currentTurn,
    maxPlayers: game.maxPlayers,
    deckCount: game.numberOfDecks,
    players: game.Players.map((player: any) => ({
        id: player.id,
        username: player.User.username,
        cardsCount: player.cardsCount,
        isActive: player.isActive,
        position: player.position,
        auth: player.User.auth0Id,
        isHost: player.isHost,
    })),
    startingPlayerIndex: game.startingPlayerIndex,
    currentPlayerIndex: game.currentPlayerIndex,
    lastDeclaredHand: game.lastDeclaredHand
      ? {
          playerId: game.lastDeclaredHand.playerId,
          declaredHand: game.lastDeclaredHand.declaredHand,
        }
      : null,
    winner: game.winner || null,
});
  