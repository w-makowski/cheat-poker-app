import { Server, Socket } from 'socket.io';
import { getUpdatedGameState } from '../utils/utils';
import { initializeGame} from "../services/gameService";
import {getPlayersByGameId} from "../repositories/playerRepository";

const playerIdToSocketId = new Map<string, string>();


export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Joining game
    socket.on('joinGame', async ({gameId, username, auth0Id}) => {
      socket.join(gameId);
      console.log(`${username} joined game ${gameId}`);

      try {
        const updatedGameState = await getUpdatedGameState(gameId);
        io.to(gameId).emit('gameStateUpdate', updatedGameState);
      } catch (err) {
        console.error('Failed to fetch game state after join:', err);
        socket.emit('gameError', 'Failed to update game state');
      }
      // Find the player by auth0Id (from socket.request.user or username)
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

        const gameState = initializeGame(gameId, players, decks);

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
    socket.on('declareHand', (data: { gameId: string, hand: string }) => {
      // Logika sprawdzania deklaracji i aktualizacja stanu gry
      io.to(data.gameId).emit('gameUpdate', {
        playerId: socket.id,
        declaredHand: data.hand
        // więcej danych o stanie gry
      });
    })

    // Obsługa sprawdzania poprzedniego gracza
    socket.on('checkPreviousPlayer', (data: { gameId: string }) => {
      // Logika sprawdzania czy poprzedni gracz blefował
      io.to(data.gameId).emit('checkResult', {
        // wynik sprawdzania
      });
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
