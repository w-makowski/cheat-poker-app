import { Server, Socket } from 'socket.io';
import {Card} from "../types/game";

// Map to keep track of userId <-> socketId
const userToSocketId = new Map<string, string>();

// Export this function to use in gameService.ts
export function sendCardToUser(io: Server, userId: string, cards: Card[]) {
  const recipientSocketId = userToSocketId.get(userId);
  if (recipientSocketId) {
    io.to(recipientSocketId).emit('yourCards', { cards });
  }
}

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Register userId with socket.id
    socket.on('registerUser', (userId: string) => {
      userToSocketId.set(userId, socket.id);
      // Optionally: store socketId on the socket for cleanup
      (socket as any).userId = userId;
      console.log(`Registered user ${userId} to socket ${socket.id}`);
    });

    // Joining game
    socket.on('joinGame', (gameId: string, username: string) => {
      socket.join(gameId);
      console.log(`${username} joined game ${gameId}`);
      socket.to(gameId).emit('playerJoined', { id: socket.id, username });
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
      console.log('User disconnected:', socket.id);
      // Dodatkowa logika dla obsługi rozłączenia gracza
      // Cleanup: Remove userId <-> socket.id mapping
      const userId = (socket as any).userId;
      if (userId) {
        userToSocketId.delete(userId);
        console.log(`Unregistered user ${userId} from socket ${socket.id}`);
      }
    });
  });}