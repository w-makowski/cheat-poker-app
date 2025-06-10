import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface Player {
    id: string;
    username: string;
    banned?: boolean;
}

interface Game {
    id: string;
    name: string;
    players: string[];
}

const API_URL = import.meta.env.VITE_APP_API_URL;

const AdminPage: React.FC = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [players, setPlayers] = useState<Player[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlayers = async (token: string) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/players`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                setError('Failed to fetch players');
                return;
            }
            const data = await res.json();
            setPlayers(data);
        } catch (e) {
            setError('Failed to fetch players');
        }
    };

    const fetchGames = async (token: string) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/games`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                setError('Failed to fetch games');
                return;
            }
            const data = await res.json();
            setGames(data);
        } catch (e) {
            setError('Failed to fetch games');
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!isAuthenticated) return;
                const token = await getAccessTokenSilently();
                await Promise.all([fetchPlayers(token), fetchGames(token)]);
            } catch (e) {
                setError('Failed to load admin data');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isAuthenticated, getAccessTokenSilently]);

    const handleBan = async (playerId: string) => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${API_URL}/api/admin/banPlayer/${playerId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                setError('Failed to ban player');
                return;
            }
            await fetchPlayers(token);
        } catch (e) {
            setError('Failed to ban player');
        }
    };

    const handleUnban = async (playerId: string) => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${API_URL}/api/admin/unbanPlayer/${playerId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                setError('Failed to unban player');
                return;
            }
            await fetchPlayers(token);
        } catch (e) {
            setError('Failed to unban player');
        }
    };

    const handleDeleteGame = async (gameId: string) => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${API_URL}/api/admin/deleteGame/${gameId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                setError('Failed to delete game');
                return;
            }
            await fetchGames(token);
        } catch (e) {
            setError('Failed to delete game');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="admin-page">
            <h1>Admin Dashboard</h1>
            <div className="admin-section">
                <h2>Players</h2>
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>Username</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {players.map(player => (
                        <tr key={player.id}>
                            <td>{player.username}</td>
                            <td>{player.banned ? 'Banned' : 'Active'}</td>
                            <td className="admin-actions">
                                {player.banned ? (
                                    <button
                                        className="btn"
                                        onClick={() => handleUnban(player.id)}
                                    >
                                        Unban
                                    </button>
                                ) : (
                                    <button
                                        className="btn"
                                        onClick={() => handleBan(player.id)}
                                    >
                                        Ban
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="admin-section">
                <h2>Games</h2>
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Players</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {games.map(game => (
                        <tr key={game.id}>
                            <td>{game.name}</td>
                            <td>{game.players.join(', ')}</td>
                            <td className="admin-actions">
                                <button
                                    className="btn"
                                    onClick={() => handleDeleteGame(game.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPage;