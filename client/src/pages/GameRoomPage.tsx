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
import CheckResultPopup from "../components/common/CheckResultPopup";
import GameFinishedPopup from "../components/common/GameFinishedPopup";
import GameHistory from '../components/game/GameHistory';
import { HANDS_REQUIRING_RANK, HANDS_REQUIRING_SUIT } from '../types/game';

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
    nextRoundPenaltyPlayerId: string | null;
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
    const [gameFinished, setGameFinished] = useState<{
        standings: { id: string; username: string; standing: number | null }[];
        winnerId: string | undefined;
    } | null>(null);
    const [wasKicked, setWasKicked] = useState(false);
    const [wasRoomDeleted, setWasRoomDeleted] = useState(false);
    const [historyLog, setHistoryLog] = useState<string[]>([]);


    useEffect(() => {
        const loadGameData = async () => {
            if (!gameId) return;

            try {
                setLoading(true);
                const token = await getAccessTokenSilently();
                const gameDataRaw = await fetchGameDetails(gameId, token);
                const gameData = transformGameResponse(gameDataRaw);
                setGameState(gameData);
                setError(null);
            } catch (err) {
                console.error('Error loading game data:', err);
                setError('Failed to load game data');
            } finally {
                setLoading(false);
            }
        };

        loadGameData();
    }, [gameId]);

    useEffect(() => {
        if (!socket || !connected || !gameId) return;

        socket.emit('joinGame', { gameId: gameId, username: user?.nickname, auth0Id: user?.sub });

        socket.on('gameStateUpdate', (updatedState: GameState) => {
            const gameData = transformGameResponse(updatedState);
            console.log('Game state update received:', gameData);
            setGameState(gameData);
            console.log('game state: ', gameState)
        });

        socket.on('gameStarted', (gameStateRaw) => {
            const gameData = transformGameResponse(gameStateRaw);
            setGameState(gameData);
            addHistoryEntry('First round started');
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
            addHistoryEntry('New round started');
            setCheckResult(data);
        });

        socket.on('updateDeclarationHistory', (updatedState: GameState) => {
            const gameData = transformGameResponse(updatedState);
            if (gameData.lastDeclaredHand) {
                console.log('Last declared hand:', gameData.lastDeclaredHand);
                const playerName = gameData.players.find(p => p.id === gameData.lastDeclaredHand!.playerId)?.username || 'Unknown'
                const handName = gameData.lastDeclaredHand.declaredHand.hand;
                const ranks = gameData.lastDeclaredHand.declaredHand.ranks?.join(', ');
                const suit = gameData.lastDeclaredHand.declaredHand.suit;
    
                let declaration = `${playerName}: ${handName}`;
                if (HANDS_REQUIRING_RANK.includes(handName) && ranks) declaration += ` (${ranks})`;
                if (HANDS_REQUIRING_SUIT.includes(handName) && suit) declaration += ` (${suit})`;
    
                addHistoryEntry(declaration);
            }
        });

        socket.on('gameFinished', (data) => {
            setGameFinished(data);
        });

        // Handle being kicked from the game
        const handleKicked = () => {
            setWasKicked(true);
        };
        socket.on('kickedFromGame', handleKicked);

        // Handle game deleted by host
        const handleGameDeleted = () => {
            setWasRoomDeleted(true);
        };
        socket.on('gameDeleted', handleGameDeleted);

        return () => {
            socket.off('gameFinished');
            socket.off('gameStateUpdate');
            socket.off('gameStarted');
            socket.off('playerCards');
            socket.off('gameError');
            socket.off('gameUpdate');
            socket.off('checkResult');
            socket.off('updateDeclarationHistory');
            socket.off('kickedFromGame', handleKicked);
            socket.off('gameDeleted', handleGameDeleted);
        };
    }, [socket, connected, gameId, navigate]);

    const addHistoryEntry = (entry: string) => {
        setHistoryLog(prev => [...prev, entry]);
    };

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

    // Host cancels (deletes) the room
    const handleCancelRoom = () => {
        if (socket && connected) {
            socket.emit('deleteGame', { gameId });
        }
        navigate('/');
    };

    // --- Readiness logic ---
    const currentPlayer = gameState?.players.find(
        (player) => player.auth0Id === user?.sub
    );

    const isHost = currentPlayer?.isHost || false;

    const isEveryoneReady = gameState
        ? gameState.players.filter(p => !p.isHost).every(p => p.ready)
        : false;

    const handleReady = () => {
        if (socket && connected) socket.emit('playerReady', { gameId });
    };
    const handleUnready = () => {
        if (socket && connected) socket.emit('playerUnready', { gameId });
    };

    // --- End readiness logic ---

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

    const currentTurnPlayer = gameState.players[(gameState.currentPlayerIndex + gameState.startingPlayerIndex) % gameState.players.length];

    const isPlayerTurn =
        gameState.status === 'active' &&
        currentPlayer &&
        currentTurnPlayer &&
        currentPlayer.auth0Id === currentTurnPlayer.auth0Id;

    const getPlayerName = (id: string) => gameState.players.find(p => p.id === id)?.username || 'Unknown';

    // Find the active player for the current turn (skip inactive players)
    const getActivePlayerId = () => {
        if (!gameState) return undefined;
        const { players, startingPlayerIndex, currentPlayerIndex } = gameState;
        let activeIndex = -1;
        for (let i = 0, count = 0; i < players.length; i++) {
            const idx = (startingPlayerIndex + i) % players.length;
            if (players[idx].isActive) {
                if (count === currentPlayerIndex) {
                    activeIndex = idx;
                    break;
                }
                count++;
            }
        }
        return activeIndex !== -1 ? players[activeIndex].id : undefined;
    };

    const activePlayerId = getActivePlayerId();

    // Modal for being kicked
    if (wasKicked) {
        return (
            <div className="popup-overlay">
                <div className="popup-content">
                    <h2>You have been kicked by the host</h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/')}
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    // Modal for room deleted
    if (wasRoomDeleted) {
        return (
            <div className="popup-overlay">
                <div className="popup-content">
                    <h2>The room has been deleted by the host</h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/')}
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>

            {gameFinished && (
                <GameFinishedPopup
                    standings={gameFinished.standings}
                    winnerId={gameFinished.winnerId}
                    onReturnHome={() => {
                        setGameFinished(null);
                        navigate('/');
                    }}
                />
            )}
            {checkResult && (
                <CheckResultPopup
                    checkResult={checkResult}
                    currentPlayerName={currentPlayer?.username || ''}
                    checkedPlayerName={getPlayerName(checkResult.checkedPlayerId ?? '')}
                    onClose={() => setCheckResult(null)}
                />
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

                <div className={`game-container ${gameState.status === 'active' ? 'sidebar-active' : ''}`}>
                    <div className="sidebar">
                        <PlayerList
                            players={gameState.players}
                            currentPlayerId={currentPlayer?.id || ''}
                            activePlayerId={activePlayerId}
                            isHost={isHost}
                            onKickPlayer={(playerId) => {
                                if (socket && connected) socket.emit('kickPlayer', { gameId, playerId });
                            }}
                        />

                        {gameState.status === 'active' && (<GameHistory history={historyLog} />)}

                        {gameState.status === 'waiting' && isHost && (
                            <div className="host-controls">
                                <h3>Host Controls</h3>
                                <div className="button-group">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleStartGame}
                                    disabled={!isEveryoneReady || gameState.players.length < 2}
                                >
                                    Start Game
                                </button>
                                <button
                                    className="btn btn-danger"
                                    // style={{ marginTop: 8 }}
                                    onClick={handleCancelRoom}
                                >
                                    Cancel Room
                                </button>
                                </div>
                                {(!isEveryoneReady || gameState.players.length < 2) && (
                                    <p className="warning">All players must be ready and at least 2 players required.</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="main-game-area">
                        {gameState.status === 'waiting' ? (
                            <div className="waiting-room">
                                <h2>Waiting for players to join...</h2>
                                <p>Players: {gameState.players.length}/{gameState.maxPlayers}</p>
                                {!isHost && (
                                    currentPlayer?.ready ? (
                                        <button className="btn btn-warning" onClick={handleUnready}>Unready</button>
                                    ) : (
                                        <button className="btn btn-success" onClick={handleReady}>Ready</button>
                                    )
                                )}
                                {isHost ? (
                                    <p>
                                        You are the host. Start the game when everyone is ready.
                                    </p>
                                ) : (
                                    <p>Waiting for the host to start the game.</p>
                                )}
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