import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchGameRooms, createGameRoom } from '../services/gameService';

interface GameRoom {
    id: string;
    name: string;
    status: string;
    maxPlayers: number;
    currentPlayers: number;
}

const HomePage: React.FC = () => {
    const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, loginWithRedirect } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        const getGameRooms = async () => {
            try {
                setLoading(true);
                const rooms = await fetchGameRooms();
                setGameRooms(rooms);
                setError(null);
            } catch (err) {
                setError('Failed to fetch game rooms');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        getGameRooms();
        const interval = setInterval(getGameRooms, 10000); // Fetch every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const handleJoinRoom = (roomId: string) => {
        if (!isAuthenticated) {
            loginWithRedirect();
            return;
        }
        navigate(`/game/${roomId}`);
      };

    const handleCreateRoom = async () => {
        if (!isAuthenticated) {
            loginWithRedirect();
            return;
        }

        try {
            const newRoom = await createGameRoom({
                name: `Game Room ${Math.floor(Math.random() * 1000)}`,
                maxPlayers: 4,
                decks: 1
            });
            navigate(`/game/${newRoom.id}`);
        } catch (err) {
            setError('Failed to create game room');
            console.error(err);
        }
    }

    return (
        <div className="home-page">
            <section className="hero">
                <h1>Welcome to Cheat Poker Game</h1>
                <p>Test your bluffing skills and poker knowledge in this exciting card game!</p>
                <button className="btn btn-primary" onClick={handleCreateRoom}>
                    Create New Game
                </button>
            </section>

            <section className="game-rooms">
                <h2>Available Game Rooms</h2>
                {loading ? (<p>Loading game rooms...</p>) : 
                error ? (<p className="error">{error}</p>) : 
                gameRooms.length === 0 ? (<p>No game rooms available. Create one to get started!</p>) : (
                <div className="room-list">
                    {gameRooms.map((room) => (
                    <div key={room.id} className="room-card">
                        <h3>{room.name}</h3>
                        <p>Players: {room.currentPlayers}/{room.maxPlayers}</p>
                        <p>Status: {room.status}</p>
                        {room.status === 'waiting' && (
                        <button className="btn btn-secondary" onClick={() => handleJoinRoom(room.id)}>
                            Join Room
                        </button>
                        )}
                    </div>
                    ))}
                </div>
                )}
            </section>
        </div>
  );
}

export default HomePage;
