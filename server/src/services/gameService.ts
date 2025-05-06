import { Server } from 'socket.io';
import { GameState, Player, PokerHand, CardRank, DealConfig, CompleteHand } from '../types/game';
import { createDeck, shuffleDeck, dealCards } from '../utils/deck';
import { handStrength, compareHands } from '../utils/pokerHands';
import { validateDeclaredHand } from '../utils/validateDeclaredHand';

const activeGames = new Map<string, GameState>();

export function initializeGame(gameId: string, players: Player[], decks: number): GameState {
    const deck = shuffleDeck(createDeck(decks));
    const dealConfig: DealConfig = {};
    for (const player of players) {
        dealConfig[player.position] = player.cardsCount;
    }
    const playerHands = dealCards(deck, dealConfig);

    players.forEach((player, index) => {
        player.cards = playerHands[player.position];
    })

    const gameState: GameState = {
        id: gameId,
        players,
        currentTurn: 1,
        startingPlayerIndex: 0,
        currentPlayerIndex: 0,
        lastDeclaredHand: null,
        status: 'active',
        winner: null
    };

    activeGames.set(gameId, gameState);

    return gameState;
}

export function declareHand(gameId: string, playerId: string, declaredHand: CompleteHand): boolean {
    const game = activeGames.get(gameId);

    if (!game) {
        return false;
    }

    const playerIndex = game.players.findIndex(p => p.id === playerId);

    const actualIndex = (game.startingPlayerIndex + game.currentPlayerIndex) % game.players.length;

    if (playerIndex !== actualIndex) {
        return false;
    }

    if (game.lastDeclaredHand) {

        // if (handStrength(hand) <= handStrength(game.lastDeclaredHand.hand))
        const comparison = compareHands(declaredHand, game.lastDeclaredHand.declaredHand);
        if (comparison <= 0) {
            return false;
        }
    }

    game.lastDeclaredHand = { playerId, declaredHand };
    game.currentPlayerIndex = (game.startingPlayerIndex + game.currentPlayerIndex + 1) % game.players.length;

    return true;
}

export function checkPreviousPlayer(gameId: string, playerId: string): { isBluffing: boolean, nextRoundPenaltyPlayer: string } {
    const game = activeGames.get(gameId);

    if (!game || !game.lastDeclaredHand) {
        throw new Error('Invalid game state');
    }

    const previousPlayerIndex = (game.startingPlayerIndex + game.currentPlayerIndex - 1 + game.players.length) % game.players.length;
    const previousPlayerId = game.players[previousPlayerIndex].id;

    const allCards = game.players.flatMap(p => p.cards);

    const isBluffing = !validateDeclaredHand(
        allCards,
        game.lastDeclaredHand.declaredHand
    )

    const nextRoundPenaltyPlayer = isBluffing ? previousPlayerId : playerId;

    endRound(gameId, nextRoundPenaltyPlayer);

    return { isBluffing, nextRoundPenaltyPlayer };
}

function endRound(gameId: string, penaltyPlayerId: string): void {
    const game = activeGames.get(gameId);
  
    if (!game) {
        return;
    }

    // TODO: add card to player with penalty

    // update starting player index for the next round:
    game.startingPlayerIndex = (game.startingPlayerIndex + 1) % game.players.length;

    
}
