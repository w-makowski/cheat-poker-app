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


const GameRoomPage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [playerCards, setPlayerCards] = useState<Card[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { socket, connected } = useSocket();
    const { user, getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();

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
            setError('Failed to load game data');
            console.error(err);
          } finally {
            setLoading(false);
          }
        };
    
        loadGameData();
    }, [gameId]);

    useEffect(() => {
        if (!socket || !connected || !gameId) return;
    
        // Join the game room
        socket.emit('joinGame', { gameId: gameId, username: user?.nickname });
    
        // Listen for game state updates
        socket.on('gameStateUpdate', (updatedState: GameState) => {
            const gameData = transformGameResponse(updatedState);
            setGameState(gameData);
        });
    
        // Listen for player cards
        socket.on('playerCards', (cards: Card[]) => {
            setPlayerCards(cards);
        });
    
        // Listen for errors
        socket.on('gameError', (errorMsg: string) => {
            setError(errorMsg);
        });
    
        return () => {
            socket.off('gameStateUpdate');
            socket.off('playerCards');
            socket.off('gameError');
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
            socket.emit('challengeDeclaration', { gameId });
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
    console.log('Game State:', gameState);
    // Find current player
    const currentPlayer = gameState.players.find(
        (player) => player.auth === user?.sub
    );

    const isPlayerTurn = gameState.status === 'active' && currentPlayer && gameState.players[gameState.currentPlayerIndex]?.id === currentPlayer.id;

    const isHost = currentPlayer?.isHost || false;

    return (
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
    );
}

export default GameRoomPage;
