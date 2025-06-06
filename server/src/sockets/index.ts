import { Server, Socket } from 'socket.io';
import { getUpdatedGameState } from '../utils/utils';
import {
  activeGames,
  checkPreviousPlayer,
  declareHand, getCheckResultData, handlePlayerLeaveInMemory,
  initializeGame,
  startNewRound
} from "../services/gameService";
import {getPlayersByGameId, removePlayerFromGame} from "../repositories/playerRepository";
import {CardRank, PokerHand} from "../types/game";
import {deleteGame, setPlayerAsHost} from "../repositories/gameRepository";

const playerIdToSocketId = new Map<string, string>();


export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Joining game
    socket.on('joinGame', async ({gameId, username, auth0Id}) => {
      socket.join(gameId);

      try {
        const updatedGameState = await getUpdatedGameState(gameId);
        io.to(gameId).emit('gameStateUpdate', updatedGameState);
      } catch (err) {
        socket.emit('gameError', 'Failed to update game state');
      }
      const players = await getPlayersByGameId(gameId);
      const player = players.find(p => p.auth0Id === auth0Id);

      if (player) {
        playerIdToSocketId.set(player.id, socket.id);
      }
    });

    // Obsługa rozpoczęcia gry
    socket.on('startGame', async ({ gameId }) => {
      try {
        const players = await getPlayersByGameId(gameId); // <-- await here
        const decks = 1;

        const gameState = await initializeGame(gameId, players, decks);

        io.to(gameId).emit('gameStarted', gameState);

        gameState.players.forEach(player => {
          const playerSocketId = playerIdToSocketId.get(player.id);
          if (playerSocketId) {
            io.to(playerSocketId).emit('playerCards', player.cards);
          }
        });
      } catch (err) {
        console.error('Failed to start game:', err);
        socket.emit('gameError', 'Failed to start game');
      }
    });

    // Obsługa rozgrywki - gracz zgłasza swój układ pokerowy
    // server/src/sockets/index.ts

    socket.on('declareHand', async (data: { gameId: string, completeHand: { hand: string, ranks: string[] } }) => {
      try {
        // Find the player by socket ID
        const gameIdNum = Number(data.gameId);
        const players = await getPlayersByGameId(gameIdNum);
        const player = players.find(p => playerIdToSocketId.get(p.id) === socket.id);

        if (!player) {
          socket.emit('gameError', 'Player not found');
          return;
        }

        // Convert hand and ranks to correct types
        const completeHand = {
          hand: data.completeHand.hand as PokerHand,
          ranks: data.completeHand.ranks.map(r => r as CardRank)
        };

        const success = declareHand(data.gameId, player.id, completeHand);

        if (!success) {
          socket.emit('gameError', 'Invalid hand declaration or not your turn');
          return;
        }

        // Fetch and emit updated game state
        const updatedGameState = await getUpdatedGameState(data.gameId);
        io.to(data.gameId).emit('gameStateUpdate', updatedGameState);
      } catch (err) {
        socket.emit('gameError', 'Server error during hand declaration');
      }
    });
    // Obsługa sprawdzania poprzedniego gracza
    // Inside setupSocketHandlers, replace the checkPreviousPlayer handler:

    socket.on('checkPreviousPlayer', async (data: { gameId: string }) => {
      try {
        const gameIdNum = Number(data.gameId);
        const players = await getPlayersByGameId(gameIdNum);
        const player = players.find(p => playerIdToSocketId.get(p.id) === socket.id);

        if (!player) {
          socket.emit('gameError', 'Player not found');
          return;
        }

        // Run the challenge logic
        const { players_cards, checkedHand, checkedPlayerId } = getCheckResultData(data.gameId);
        const { isBluffing, nextRoundPenaltyPlayer } = checkPreviousPlayer(data.gameId, player.id);
        io.to(data.gameId).emit('checkResult', {
          isBluffing,
          nextRoundPenaltyPlayer,
          checkedHand,
          checkedPlayerId,
          players: players_cards
        });

        // Start a new round (deal new cards)
        const roundStarted = startNewRound(data.gameId);

        // After startNewRound(data.gameId)
        const game = activeGames.get(data.gameId);
        if (game) {
          game.players.forEach(p => {
            if (p.isActive) {
              const playerSocketId = playerIdToSocketId.get(p.id);
              if (playerSocketId) {
                io.to(playerSocketId).emit('playerCards', p.cards);
              }
            }
          });
        }

        // Emit updated game state
        const updatedGameState = await getUpdatedGameState(data.gameId);
        io.to(data.gameId).emit('gameStateUpdate', updatedGameState);

      } catch (err) {
        socket.emit('gameError', 'Server error during challenge');
      }
    });

    socket.on('leaveGame', async ({ gameId }) => {
      try {
        const players = await getPlayersByGameId(gameId);
        const leavingPlayer = players.find(p => playerIdToSocketId.get(p.id) === socket.id);

        if (!leavingPlayer) return;

        // Remove player from game in DB and memory
        await removePlayerFromGame(gameId, leavingPlayer.id); // Implement this in your repository/service
        handlePlayerLeaveInMemory(gameId, leavingPlayer.id);
        // Remove from socket map
        playerIdToSocketId.delete(leavingPlayer.id);

        // Fetch updated players
        const updatedPlayers = await getPlayersByGameId(gameId);

        // If no players left, delete game
        if (updatedPlayers.length === 0) {
          await deleteGame(gameId); // Implement this in your repository/service
          activeGames.delete(gameId);
          io.to(gameId).emit('gameDeleted');
          return;
        }

        // If host left, assign new host
        if (leavingPlayer.isHost) {
          // Assign first player as new host
          const newHost = updatedPlayers[0];
          await setPlayerAsHost(gameId, newHost.id); // Implement this in your repository/service
          // Optionally update in-memory game state
          const game = activeGames.get(gameId);
          if (game) {
            game.players.forEach(p => p.isHost = (p.id === newHost.id));
          }
          io.to(gameId).emit('hostChanged', { newHostId: newHost.id });
        }

        // Emit updated game state
        const updatedGameState = await getUpdatedGameState(gameId);
        io.to(gameId).emit('gameStateUpdate', updatedGameState);

      } catch (err) {
        socket.emit('gameError', 'Error leaving game');
      }
    });

    // Obsługa rozłączenia
    socket.on('disconnect', () => {
      for (const [playerId, sId] of playerIdToSocketId.entries()) {
        if (sId === socket.id) {
          playerIdToSocketId.delete(playerId);
        }
      }
    });
  });
}
