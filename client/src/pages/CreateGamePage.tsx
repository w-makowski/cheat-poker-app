import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGameRoom } from '../services/gameService';
import { useAuth0 } from '@auth0/auth0-react';

const CreateGamePage: React.FC = () => {
    const [name, setName] = useState('');
    const [deckCount, setDeckCount] = useState(1);
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } = useAuth0();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isAuthenticated) {
            console.log('[CreateGamePage] Not authenticated, redirecting...');

            loginWithRedirect();
            return;
        }

        try {
            setLoading(true);
            const token = await getAccessTokenSilently();
            console.log('[CreateGamePage] Creating game room:', { name, maxPlayers, deckCount });
            const newRoom = await createGameRoom({ name: name, maxPlayers: maxPlayers, decks: deckCount }, token);
            console.log('[CreateGamePage] Game room created:', newRoom);
            navigate(`/games/${newRoom.gameId}`);
        } catch (err) {
            console.error(err);
            console.error('[CreateGamePage] Failed to create game room:', err);
            setError('Failed to create game room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-game-page">
            <section className="form-section">
                <h1 className="page-title">Create a New Game Room</h1>
                <form onSubmit={handleSubmit} className="game-form">
                    <div className="form-field">
                        <label htmlFor="name">Room Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="maxPlayers">Max Players</label>
                        <select
                            id="maxPlayers"
                            value={maxPlayers}
                            onChange={(e) => setMaxPlayers(Number(e.target.value))}
                        >
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((count) => (
                                <option key={count} value={count}>
                                    {count}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="deckCount">Number of Decks</label>
                        <select
                            id="deckCount"
                            value={deckCount}
                            onChange={(e) => setDeckCount(Number(e.target.value))}
                        >
                            {[1, 2, 3, 4].map((count) => (
                                <option key={count} value={count}>
                                    {count}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && <p className="error">{error}</p>}

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Game'}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default CreateGamePage;
