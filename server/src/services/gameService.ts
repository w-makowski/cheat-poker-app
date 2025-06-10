import { Server } from 'socket.io';
import { GameState, Player, PokerHand, CardRank, DealConfig, CompleteHand } from '../types/game';
import { createDeck, shuffleDeck, dealCards } from '../utils/deck';
import { getNextActivePlayerIndex } from '../utils/gameHelpers';
import { handStrength, compareHands } from '../utils/pokerHands';
import { validateDeclaredHand } from '../utils/validateDeclaredHand';
import { updateGameStatus } from "../repositories/gameRepository";
import {getPlayersByGameId, removePlayerFromGame, updatePlayerReady} from "../repositories/playerRepository";

export const activeGames = new Map<string, GameState>();

export async function initializeGame(
    gameId: string,
    players: Player[],
    decks: number,
    name?: string,
    maxPlayers?: number
): Promise<GameState> {
    console.log(`[initializeGame] Initializing game ${gameId} with ${players.length} players`);
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
        name: name || '',
        maxPlayers: maxPlayers || players.length,
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

    await updateGameStatus(gameId, 'active');

    return gameState;
}

export function declareHand(gameId: string, playerId: string, declaredHand: CompleteHand): boolean {
    const game = activeGames.get(gameId);

    if (!game) return false;

    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;

    const actualIndex = (game.startingPlayerIndex + game.currentPlayerIndex) % game.players.length;
    if (playerIndex !== actualIndex) return false;

    if (game.lastDeclaredHand) {
        const comparison = compareHands(declaredHand, game.lastDeclaredHand.declaredHand);
        if (comparison <= 0) return false;
    }

    game.lastDeclaredHand = { playerId, declaredHand };
    game.currentPlayerIndex = getNextActivePlayerIndex(game, game.currentPlayerIndex);
    game.currentTurn = game.currentPlayerIndex;
    return true;
}

export async function checkPreviousPlayer(
    gameId: string,
    playerId: string
): Promise<{ isBluffing: boolean, nextRoundPenaltyPlayer: string, isGameFinished: boolean }> {
    const game = activeGames.get(gameId);
    if (!game || !game.lastDeclaredHand) throw new Error('Invalid game state');

    const allCards = game.players.flatMap(p => p.cards);
    const isBluffing = !validateDeclaredHand(allCards, game.lastDeclaredHand.declaredHand);

    const previousPlayerId = game.lastDeclaredHand.playerId;
    const nextRoundPenaltyPlayer = isBluffing ? previousPlayerId : playerId;

    const { isGameFinished } = await endRound(gameId, nextRoundPenaltyPlayer);

    return { isBluffing, nextRoundPenaltyPlayer, isGameFinished };
}

export async function endRound(
    gameId: string,
    penaltyPlayerId: string
): Promise<{ PenaltyPlayerId: string | null, isGameFinished: boolean }> {
    console.log(`[endRound] Called for gameId=${gameId}, penaltyPlayerId=${penaltyPlayerId}`);
    const game = activeGames.get(gameId);
    if (!game) return { PenaltyPlayerId: null, isGameFinished: false };

    const penaltyPlayer = game.players.find(player => player.id === penaltyPlayerId);
    if (!penaltyPlayer) throw new Error('Penalty player not found');
    penaltyPlayer.cardsCount += 1;

    if (penaltyPlayer.cardsCount >= 7) {
        const { isGameFinished } = await removePlayerFromGame(gameId, penaltyPlayerId);
        penaltyPlayer.isActive = false;

        const activePlayers = game.players.filter(player => player.isActive);
        if (activePlayers.length === 1) {
            game.status = 'finished';
            game.winner = activePlayers[0].id;
        } else {
            console.log('[EndRound] activePlaers', activePlayers);
            console.log('[EndRound] First starting player index:', game.startingPlayerIndex);
            do {
                game.startingPlayerIndex = (game.startingPlayerIndex + 1) % game.players.length;
                console.log('[EndRound] New starting player index:', game.startingPlayerIndex);
            } while (!game.players[game.startingPlayerIndex].isActive);
        }

        game.currentPlayerIndex = 0;
        return { PenaltyPlayerId: penaltyPlayerId, isGameFinished };
    }

    game.lastDeclaredHand = null;

    do {
        game.startingPlayerIndex = (game.startingPlayerIndex + 1) % game.players.length;
    } while (!game.players[game.startingPlayerIndex].isActive);

    return { PenaltyPlayerId: null, isGameFinished: false };
}

export function startNewRound(gameId: string): boolean {
    const game = activeGames.get(gameId);
    if (!game || game.status !== 'active') return false;

    const deck = shuffleDeck(createDeck(game.deckCount));
    const activePlayers = game.players.filter(p => p.isActive);

    const dealConfig: DealConfig = {};
    activePlayers.forEach((player, index) => {
        dealConfig[index] = player.cardsCount;
    });

    const playerHands = dealCards(deck, dealConfig);

    activePlayers.forEach((player, index) => {
        player.cards = playerHands[index] || [];
    });

    game.players.forEach(player => {
        if (!player.isActive) player.cards = [];
    });

    game.currentPlayerIndex = 0;
    game.lastDeclaredHand = null;

    return true;
}

export function getCheckResultData(gameId: string) {
    const game = activeGames.get(gameId);
    if (!game || !game.lastDeclaredHand) {
        return {
            players_cards: [],
            checkedHand: null,
            checkedPlayerId: null
        };
    }
    return {
        players_cards: game.players.map(player => ({
            id: player.id,
            username: player.username,
            cards: player.cards
        })),
        checkedHand: game.lastDeclaredHand.declaredHand,
        checkedPlayerId: game.lastDeclaredHand.playerId
    };
}

export function handlePlayerLeaveInMemory(gameId: string, playerId: string) {
    const game = activeGames.get(gameId);
    if (!game) return;

    const memPlayer = game.players.find(p => p.id === playerId);
    if (!memPlayer) return;

    if (game.status === 'active') {
        const wasCurrentTurn = (() => {
            const idx = game.players.findIndex(p => p.id === playerId);
            return idx === (game.startingPlayerIndex + game.currentPlayerIndex) % game.players.length;
        })();

        memPlayer.isActive = false;

        if (wasCurrentTurn) {
            game.currentPlayerIndex = getNextActivePlayerIndex(game, game.currentPlayerIndex);
        }
    } else {
        game.players = game.players.filter(p => p.id !== playerId);
    }
}

export function markPlayerReadyInMemory(gameId: string, playerId: string, ready: boolean) {
    const game = activeGames.get(gameId);
    if (!game) return false;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return false;
    player.ready = ready;
    return true;
}

export async function handlePlayerReady(
    gameId: string,
    socketId: string,
    playerIdToSocketId: Map<string, string>,
    ready: boolean
) {
    const numGameId = Number(gameId);
    const players = await getPlayersByGameId(numGameId);
    const player = players.find(p => playerIdToSocketId.get(p.id) === socketId);
    if (player) {
        await updatePlayerReady(player.id, ready); // DB
        markPlayerReadyInMemory(gameId, player.id, ready); // In-memory
    }
    return player;
}

export async function handleKickPlayer(
    gameId: string,
    kickerSocketId: string,
    playerIdToSocketId: Map<string, string>,
    playerIdToKick: string
) {
    const numGameId = Number(gameId);
    const players = await getPlayersByGameId(numGameId);
    const host = players.find(p => p.isHost);
    if (!host) return { error: 'No host found' };
    if (String(playerIdToKick) === String(host.id)) return { error: 'Host cannot kick themselves' };
    if (playerIdToSocketId.get(String(host.id)) !== kickerSocketId) return { error: 'Only host can kick' };

    const { isGameFinished } = await removePlayerFromGame(gameId, playerIdToKick);
    handlePlayerLeaveInMemory(gameId, playerIdToKick);

    return { isGameFinished, kickedPlayerId: playerIdToKick };
}