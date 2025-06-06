import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchGameDetails } from '../services/gameService';
import { transformGameResponse } from '../utils/utils';
import type { GameState, Card, CompleteHand } from '../types/game';
import GameBoard from '../components/game/GameBoard';
import PlayerList from '../components/game/PlayerList';
import GameControls from '../components/game/GameControls';
import CardSprite from '../components/game/CardSprite';

interface CheckResultPlayer {
    id: string;
    username: string;
    cards: Card[];
}

interface CheckResult {
    checkedHand: {
        hand: string;
        ranks?: string[];
    } | null;
    checkedPlayerId: string | null;
    isBluffing: boolean;
    players: CheckResultPlayer[];
}

const GameRoomPage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [playerCards, setPlayerCards] = useState<Card[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { socket, connected } = useSocket();
    const { user, getAccessTokenSilently } = useAuth0();
    const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadGameData = async () => {
            if (!gameId) return;

            try {
                setLoading(true);
                const token = await getAccessTokenSilently();
                console.log('[CLIENT] Fetching game details for', gameId);
                const gameDataRaw = await fetchGameDetails(gameId, token);
                console.log('[CLIENT] Raw game data:', gameDataRaw);
                const gameData = transformGameResponse(gameDataRaw);
                setGameState(gameData);
                setError(null);
            } catch (err) {
                setError('Failed to load game data');
                console.error('[CLIENT] Failed to load game data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadGameData();
    }, [gameId]);

    useEffect(() => {
        if (!socket || !connected || !gameId) return;

        console.log('[CLIENT] Emitting joinGame', { gameId, username: user?.nickname, auth0Id: user?.sub });
        socket.emit('joinGame', { gameId: gameId, username: user?.nickname, auth0Id: user?.sub });

        socket.on('gameStateUpdate', (updatedState: GameState) => {
            console.log('[CLIENT] Received gameStateUpdate:', updatedState);
            const gameData = transformGameResponse(updatedState);
            setGameState(gameData);
        });

        socket.on('gameStarted', (gameStateRaw) => {
            const gameData = transformGameResponse(gameStateRaw);
            setGameState(gameData);
        });

        socket.on('playerCards', (cards: Card[]) => {
            setPlayerCards(cards);
        });

        socket.on('gameError', (errorMsg: string) => {
            setError(errorMsg);
        });

        socket.on('gameUpdate', (data) => {
            setGameState(prev => prev ? {
                ...prev,
                lastDeclaredHand: {
                    playerId: data.playerId,
                    declaredHand: data.declaredHand
                }
            } : prev);
        });

        socket.on('checkResult', (data: CheckResult) => {
            setCheckResult(data);
        });

        return () => {
            socket.off('gameStateUpdate');
            socket.off('gameStarted');
            socket.off('playerCards');
            socket.off('gameError');
            socket.off('gameUpdate');
            socket.off('checkResult');
            socket.emit('leaveGame', { gameId });
        };
    }, [socket, connected, gameId]);

    const handleStartGame = () => {
        if (socket && connected) {
            socket.emit('startGame', { gameId });
        }
    };

    const handleDeclareHand = (completeHand: CompleteHand) => {
        if (socket && connected) {
            socket.emit('declareHand', { gameId, completeHand });
        }
    };

    const handleChallengeDeclaration = () => {
        if (socket && connected) {
            socket.emit('checkPreviousPlayer', { gameId });
        }
    };

    const handleLeaveGame = () => {
        if (socket && connected) {
            socket.emit('leaveGame', { gameId });
        }
        navigate('/');
    };

    if (loading) {
        return <div className="loading">Loading game...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Return to Home
                </button>
            </div>
        );
    }

    if (!gameState) {
        return (
            <div className="error-container">
                <h2>Game Not Found</h2>
                <p>The game you're looking for doesn't exist or has ended.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Return to Home
                </button>
            </div>
        );
    }

    const currentPlayer = gameState.players.find(
        (player) => player.auth0Id === user?.sub
    );

    const currentTurnPlayer = gameState.players[(gameState.currentPlayerIndex + gameState.startingPlayerIndex) % gameState.players.length];

    const isPlayerTurn =
        gameState.status === 'active' &&
        currentPlayer &&
        currentTurnPlayer &&
        currentPlayer.auth0Id === currentTurnPlayer.auth0Id;

    const isHost = currentPlayer?.isHost || false;

    const getPlayerName = (id: string) => gameState.players.find(p => p.id === id)?.username || 'Unknown';

    return (
        <>
            {checkResult && (
                <div className="check-result-popup" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        minWidth: '320px',
                        maxWidth: '90vw'
                    }}>
                        <h2>RESULT CHECK</h2>
                        <p>
                            Checked Hand: {checkResult.checkedHand?.hand.replace(/_/g, ' ')}
                            {checkResult.checkedHand?.ranks && checkResult.checkedHand.ranks.length > 0 &&
                                ` (${checkResult.checkedHand.ranks.join(', ')})`}
                        </p>
                        <p>
                            Result: {checkResult.isBluffing ? 'False, ' : 'True, '}
                            {checkResult.isBluffing
                                ? `${getPlayerName(checkResult.checkedPlayerId ?? '')} gets a penalty card`
                                : `${currentPlayer?.username} gets a penalty card`}
                        </p>
                        <ul>
                            {checkResult.players.map((player) => (
                                <li key={player.id}>
                                    {player.username}:
                                    <div className="cards-container" style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
                                        {player.cards.map((card, idx) => (
                                            <CardSprite key={idx} rank={card.rank} suit={card.suit} value={card.rank} />
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button className="btn btn-primary" onClick={() => setCheckResult(null)}>Close</button>
                    </div>
                </div>
            )}
            <div className="game-room-page">
                <div className="game-header">
                    <h1>{gameState.name}</h1>
                    <div className="game-status">
                        <span>Status: {gameState.status}</span>
                        <button className="btn btn-danger" onClick={handleLeaveGame}>
                            Leave Game
                        </button>
                    </div>
                </div>

                <div className="game-container">
                    <div className="sidebar">
                        <PlayerList
                            players={gameState.players}
                            currentTurn={gameState.currentTurn}
                            currentPlayerId={currentPlayer?.id || ''}
                        />

                        {gameState.status === 'waiting' && isHost && (
                            <div className="host-controls">
                                <h3>Host Controls</h3>
                                <button className="btn btn-primary" onClick={handleStartGame} disabled={gameState.players.length < 2}>
                                    Start Game
                                </button>
                                {gameState.players.length < 2 && (
                                    <p className="warning">Need at least 2 players to start</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="main-game-area">
                        {gameState.status === 'waiting' ? (
                            <div className="waiting-room">
                                <h2>Waiting for players to join...</h2>
                                <p>Players: {gameState.players.length}/{gameState.maxPlayers}</p>
                                {isHost ? (<p>You are the host. Start the game when everyone is ready.</p>) : (<p>Waiting for the host to start the game.</p>)}
                            </div>
                        ) : (
                            <>
                                <GameBoard
                                    gameState={gameState}
                                    playerCards={playerCards}
                                    isPlayerTurn={isPlayerTurn!}
                                />

                                {gameState.status === 'active' && (
                                    <GameControls
                                        isPlayerTurn={isPlayerTurn!}
                                        lastDeclaredHand={gameState.lastDeclaredHand}
                                        onDeclareHand={handleDeclareHand}
                                        onChallengeDeclaration={handleChallengeDeclaration}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GameRoomPage;