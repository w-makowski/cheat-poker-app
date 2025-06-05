import { Server } from 'socket.io';
import { GameState, Player, PokerHand, CardRank, DealConfig, CompleteHand } from '../types/game';
import { createDeck, shuffleDeck, dealCards } from '../utils/deck';
import { getNextActivePlayerIndex } from '../utils/gameHelpers';
import { handStrength, compareHands } from '../utils/pokerHands';
import { validateDeclaredHand } from '../utils/validateDeclaredHand';

const activeGames = new Map<string, GameState>();


export function initializeGame(
    gameId: string,
    players: Player[],
    decks: number,
    name?: string,
    maxPlayers?: number
): GameState {
    const deck = shuffleDeck(createDeck(decks));
    const dealConfig: DealConfig = {};
    for (let i = 0; i < players.length; i++) {
        dealConfig[i] = players[i].cardsCount;
    }
    const playerHands = dealCards(deck, dealConfig);

    players.forEach((player, index) => {
        player.cards = playerHands[index];
    });

    const gameState: GameState = {
        id: gameId,
        name: name || '', // <-- add this
        maxPlayers: maxPlayers || players.length, // <-- add this
        players,
        currentTurn: 1,
        startingPlayerIndex: 0,
        currentPlayerIndex: 0,
        lastDeclaredHand: null,
        status: 'active',
        winner: null,
        deckCount: decks,
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

    if (playerIndex === -1) {
        return false;
    }

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
    // game.currentPlayerIndex = (game.startingPlayerIndex + game.currentPlayerIndex + 1) % game.players.length;
    game.currentPlayerIndex = getNextActivePlayerIndex(game, game.currentPlayerIndex);

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

function endRound(gameId: string, penaltyPlayerId: string): string | null {
    const game = activeGames.get(gameId);
  
    if (!game) {
        return null;
    }

    const penaltyPlayer = game.players.find(player => player.id === penaltyPlayerId);
    if (!penaltyPlayer) {
        throw new Error('Penalty player not found');
    }
    penaltyPlayer.cardsCount += 1;

    if (penaltyPlayer.cardsCount >= 7) {
        // remove player from game
        penaltyPlayer.isActive = false;

        const activePlayers = game.players.filter(player => player.isActive);
        if (activePlayers.length === 1) {
            game.status = 'finished';
            game.winner = activePlayers[0].id;
        }

        game.currentPlayerIndex = 0;
        return penaltyPlayerId;
    }

    game.lastDeclaredHand = null;

    // update starting player index for the next round:
    do {
        game.startingPlayerIndex = (game.startingPlayerIndex + 1) % game.players.length;
    } while (!game.players[game.startingPlayerIndex].isActive);

    return null
}

export function startNewRound(gameId: string): boolean {
    const game = activeGames.get(gameId);
    if (!game || game.status !== 'active') {
        return false;
    }

    const deck = shuffleDeck(createDeck(game.deckCount));
    const dealConfig: DealConfig = {};

    const activePlayers = game.players.filter(p => p.isActive);

    activePlayers.forEach((player, index) => {
        dealConfig[index] = player.cardsCount;
    })

    const playerHands = dealCards(deck, dealConfig);

    let acitveIndex = 0;
    for(let i = 0; i < game.players.length; i++) {
        const player = game.players[i];
        if (player.isActive) {
            player.cards = playerHands[acitveIndex];
            acitveIndex++;
        } else {
            player.cards = [];
        }
    }

    game.currentPlayerIndex = 0;
    game.lastDeclaredHand = null;

    return true;
}
