import { Server, Socket } from 'socket.io';
import { getUpdatedGameState } from '../utils/utils';
import {
  activeGames,
  checkPreviousPlayer,
  declareHand, getCheckResultData, handlePlayerLeaveInMemory, handlePlayerReady,
  initializeGame,
  markPlayerReadyInMemory,
  startNewRound
} from "../services/gameService";
import { getPlayersByGameId, removePlayerFromGame, updatePlayerReady } from "../repositories/playerRepository";
import { CardRank, CardSuit, PokerHand } from "../types/game";
import { deleteGame, setPlayerAsHost } from "../repositories/gameRepository";

const playerIdToSocketId = new Map<string, string>();
const leftPlayers = new Set<string>();

let ioRef: Server | null = null;




export function setupSocketHandlers(io: Server) {
  ioRef = io;
  io.on('connection', (socket: Socket) => {
    console.log('[SOCKET] User connected:', socket.id);

    // Joining game
    socket.on('joinGame', async ({gameId, auth0Id}) => {
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

    socket.on('declareHand', async (data: { gameId: string, completeHand: { hand: string, ranks: string[], suit: string | null } }) => {
      console.log(`[SOCKET] declareHand:`, data);
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
          ranks: data.completeHand.ranks.map(r => r as CardRank),
          suit: data.completeHand.suit ? data.completeHand.suit as CardSuit : null
        };

        const success = declareHand(data.gameId, player.id, completeHand);

        if (!success) {
          socket.emit('gameError', 'Invalid hand declaration or not your turn');
          return;
        }

        // Fetch and emit updated game state
        const updatedGameState = await getUpdatedGameState(data.gameId);
        io.to(data.gameId).emit('gameStateUpdate', updatedGameState);
        io.to(data.gameId).emit('updateDeclarationHistory', updatedGameState)
      } catch (err) {
        socket.emit('gameError', 'Server error during hand declaration');
      }
    });
    // Obsługa sprawdzania poprzedniego gracza
    // Inside setupSocketHandlers, replace the checkPreviousPlayer handler:

    socket.on('checkPreviousPlayer', async (data: { gameId: string }) => {
      console.log(`[SOCKET] checkPreviousPlayer:`, data);
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
        const { isBluffing, nextRoundPenaltyPlayer, isGameFinished } = await checkPreviousPlayer(data.gameId, player.id);

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

        // Emit gameFinished if needed
        if (isGameFinished) {
          const standings = await getPlayersByGameId(gameIdNum);
          // Try to find the winner by standing, fallback to in-memory winner if needed
          const winnerId =
              standings.find(p => p.standing === 1)?.id ||
              (game && game.winner);

          io.to(data.gameId).emit('gameFinished', {
            standings: standings.map(p => ({
              id: p.id,
              username: p.username,
              standing: p.standing ?? null
            })),
            winnerId
          });
        }

      } catch (err) {
        socket.emit('gameError', 'Server error during challenge');
      }
    });

    // Add this inside setupSocketHandlers
    socket.on('playerReady', async ({ gameId }) => {
      const player = await handlePlayerReady(gameId, socket.id, playerIdToSocketId, true);
      if (player) {
        io.to(gameId).emit('gameStateUpdate', await getUpdatedGameState(gameId));
      }
    });

    socket.on('playerUnready', async ({ gameId }) => {
      const player = await handlePlayerReady(gameId, socket.id, playerIdToSocketId, false);
      if (player) {
        io.to(gameId).emit('gameStateUpdate', await getUpdatedGameState(gameId));
      }
    });

    // Add this inside setupSocketHandlers

    socket.on('playerReady', async ({ gameId }) => {
      console.log(`[SOCKET] playerReady: gameId=${gameId}, socketId=${socket.id}`);
      const players = await getPlayersByGameId(gameId);
      const player = players.find(p => playerIdToSocketId.get(p.id) === socket.id);
      if (player) {
        await updatePlayerReady(player.id, true); // DB
        markPlayerReadyInMemory(gameId, player.id, true); // In-memory
        io.to(gameId).emit('gameStateUpdate', await getUpdatedGameState(gameId));
        }
    });

    socket.on('playerUnready', async ({ gameId }) => {
        console.log(`[SOCKET] playerUnready: gameId=${gameId}, socketId=${socket.id}`);
      const players = await getPlayersByGameId(gameId);
      const player = players.find(p => playerIdToSocketId.get(p.id) === socket.id);
      if (player) {
        await updatePlayerReady(player.id, false); // DB
        markPlayerReadyInMemory(gameId, player.id, false); // In-memory
        io.to(gameId).emit('gameStateUpdate', await getUpdatedGameState(gameId));
      }
    });

    socket.on('kickPlayer', async ({ gameId, playerId }) => {
      console.log(`[SOCKET] kickPlayer called: gameId=${gameId}, playerId=${playerId}, by socket.id=${socket.id}`);

      const players = await getPlayersByGameId(gameId);
      console.log('[SOCKET] All players in game:', players.map(p => ({ id: p.id, username: p.username })));
      const host = players.find(p => p.isHost);
      const kickedPlayer = players.find(p => String(p.id) === String(playerId));

      console.log(`[SOCKET] Host:`, host);
      console.log(`[SOCKET] Kicked Player:`, kickedPlayer);

      if (!host) {
        console.log('[SOCKET] No host found, aborting kick.');
        return;
      }
      if (String(playerId) === String(host.id)) {
        console.log('[SOCKET] Host tried to kick themselves, aborting.');
        return;
      }
      if (playerId == null) {
        console.log('[SOCKET] No playerId provided, aborting.');
        return;
      }
      if (playerIdToSocketId.get(String(host.id)) !== socket.id) {
        console.log('[SOCKET] Non-host tried to kick, aborting.');
        return;
      }

      const kickedSocketId = playerIdToSocketId.get(String(playerId));
      console.log(`[SOCKET] kickedSocketId for playerId ${playerId}:`, kickedSocketId);
      if (kickedSocketId) {
        io.to(kickedSocketId).emit('kickedFromGame');
        console.log(`[SOCKET] Emitted 'kickedFromGame' to socketId: ${kickedSocketId}`);
        playerIdToSocketId.delete(String(playerId));
      } else {
        console.log(`[SOCKET] No socketId found for kicked player, could not emit 'kickedFromGame'.`);
      }

      const { isGameFinished } = await removePlayerFromGame(gameId, playerId);
      handlePlayerLeaveInMemory(gameId, playerId);

      const updatedGameState = await getUpdatedGameState(gameId);
      io.to(gameId).emit('gameStateUpdate', updatedGameState);
    });


    socket.on('leaveGame', async ({ gameId }) => {
      console.log(`[SOCKET] leaveGame: gameId=${gameId}, socketId=${socket.id}`);
      try {
        const players = await getPlayersByGameId(gameId);
        const leavingPlayer = players.find(p => playerIdToSocketId.get(p.id) === socket.id);

        if (!leavingPlayer) return;
        if (leftPlayers.has(leavingPlayer.id)) return; // Prevent double leave
        leftPlayers.add(leavingPlayer.id);

        // Remove player from game in DB and memory
        const { isGameFinished } = await removePlayerFromGame(gameId, leavingPlayer.id);
        handlePlayerLeaveInMemory(gameId, leavingPlayer.id);
        playerIdToSocketId.delete(leavingPlayer.id);

        // Fetch updated players
        const updatedPlayers = await getPlayersByGameId(gameId);

        // If no players left, delete game
        if (updatedPlayers.length === 0) {
          await deleteGame(gameId);
          activeGames.delete(gameId);
          io.to(gameId).emit('gameDeleted');
          return;
        }

        // If host left, assign new host
        if (leavingPlayer.isHost) {
          const newHost = updatedPlayers[0];
          await setPlayerAsHost(gameId, newHost.id);
          const game = activeGames.get(gameId);
          if (game) {
            game.players.forEach(p => p.isHost = (p.id === newHost.id));
          }
          io.to(gameId).emit('hostChanged', { newHostId: newHost.id });
        }

        // Emit updated game state
        const updatedGameState = await getUpdatedGameState(gameId);
        io.to(gameId).emit('gameStateUpdate', updatedGameState);

        // Emit gameFinished if needed
        if (isGameFinished) {
          const standings = await getPlayersByGameId(gameId);
          io.to(gameId).emit('gameFinished', {
            standings: standings.map(p => ({
              id: p.id,
              username: p.username,
              standing: p.standing ?? null
            })),
            winnerId: standings.find(p => p.standing === 1)?.id
          });
        }

      } catch (err) {
        socket.emit('gameError', 'Error leaving game');
      }
    });

    socket.on('deleteGame', async ({ gameId }) => {
      const players = await getPlayersByGameId(gameId);
      const host = players.find(p => p.isHost);
      if (!host || playerIdToSocketId.get(String(host.id)) !== socket.id) return;

      await deleteGame(gameId);
      activeGames.delete(gameId);
      io.to(gameId).emit('gameDeleted');
    });

    socket.on('deleteGameByAdmin', async ({ gameId }) => {
      const players = await getPlayersByGameId(gameId);
      const host = players.find(p => p.isHost);
      if (!host || playerIdToSocketId.get(String(host.id)) !== socket.id) return;

      await deleteGame(gameId);
      activeGames.delete(gameId);
      io.to(gameId).emit('gameDeletedByAdmin');
    });

    // Obsługa rozłączenia
    socket.on('disconnect', () => {
      console.log('[SOCKET] disconnect:', socket.id);
      for (const [playerId, sId] of playerIdToSocketId.entries()) {
        if (sId === socket.id) {
          playerIdToSocketId.delete(playerId);
        }
      }
    });
  });
}

export function emitGameDeletedByAdmin(gameId: string) {
  if (ioRef) {
    ioRef.to(gameId).emit('gameDeletedByAdmin');
  }
}
