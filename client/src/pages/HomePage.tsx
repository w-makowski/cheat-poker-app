import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchGameRooms, joinGameRoom } from '../services/gameService';
import type { GameRoom } from '../types/game';


const HomePage: React.FC = () => {
    const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, getAccessTokenSilently, loginWithRedirect, logout } = useAuth0();
    const [isBanned, setIsBanned] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const getGameRooms = async () => {
            try {
                setLoading(true);
                console.log('[HomePage] Fetching game rooms...');
                const rooms = await fetchGameRooms();
                console.log('[HomePage] Fetched game rooms:', rooms);
                setGameRooms(rooms);
                setError(null);
            } catch (err) {
                setError('Failed to fetch game rooms');
                console.error('[HomePage] Error fetching game rooms:', err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        getGameRooms();
        const interval = setInterval(getGameRooms, 10000); // Fetch every 10 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        (async () => {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('res:', res);
            const data = await res.json();
            setIsBanned(data.isBanned);
        })();
    }, [isAuthenticated]);

    const handleJoinRoom = async (roomId: string) => {
        if (!isAuthenticated) {
            loginWithRedirect();
            return;
        }
    
        try {
            const token = await getAccessTokenSilently();
            await joinGameRoom(roomId, token);
            navigate(`/games/${roomId}`);
        } catch (err) {
            setError('Failed to join game room');
            console.error(err);
        }
    };

    const handleLogout = () => {
        logout({ logoutParams: { returnTo: window.location.origin } });
    };

    if (isBanned) {
        return (
            <div className="popup-overlay">
                <div className="popup-content">
                    <h2>You have been banned by the admin</h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleLogout()}
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <section className="hero">
                <h1>Welcome to Cheat Poker Game</h1>
                <p>Test your bluffing skills and poker knowledge in this exciting card game!</p>
                <Link to="/create" className="btn btn-primary">
                    Create New Game
                </Link>
            </section>

            <section className="game-rooms">
                <h2>Available Game Rooms</h2>
                {loading ? (<p>Loading game rooms...</p>) : 
                error ? (<p className="error">{error}</p>) : 
                gameRooms.length === 0 ? (<p className="no-game-info">No game rooms available. Create one to get started!</p>) : (
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
