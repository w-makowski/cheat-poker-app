import { Server, Socket } from 'socket.io';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Joining game
    socket.on('joinGame', (gameId: string, username: string) => {
      socket.join(gameId);
      console.log(`${username} joined game ${gameId}`);
      
      // Powiadom innych graczy o nowym graczu
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
    });
  });
}
