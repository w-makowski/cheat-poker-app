import React from 'react';
import CardSprite from './CardSprite';

import type { GameBoardProps } from '../../types/game';
import { HANDS_REQUIRING_RANK, HANDS_REQUIRING_SUIT } from '../../types/game';


const GameBoard: React.FC<GameBoardProps> = ({ gameState, playerCards, isPlayerTurn }) => {
    return (
        <div className="game-board">
            <div className="game-info">
                <h2>Game in Progress</h2>
                {gameState.lastDeclaredHand && (
                    <div className="last-declaration">
                        <h3>Last Declaration</h3>
                        <p>
                            <strong>Hand:</strong>
                            {gameState.lastDeclaredHand.declaredHand.hand.replace(/_/g, ' ')}
                            {HANDS_REQUIRING_SUIT.includes(gameState.lastDeclaredHand.declaredHand.hand) && gameState.lastDeclaredHand.declaredHand.suit && (
                                    <> ({gameState.lastDeclaredHand.declaredHand.suit})</>
                                )}
                                {gameState.lastDeclaredHand.declaredHand.ranks &&
                                    HANDS_REQUIRING_RANK.includes(gameState.lastDeclaredHand.declaredHand.hand) &&
                                    gameState.lastDeclaredHand.declaredHand.ranks.length > 0 && (
                                        <> ({gameState.lastDeclaredHand.declaredHand.ranks.join(', ')})</>
                                    )
                            }
                        </p>
                    </div>
                )}
            </div>

            <div className="player-hand">
                <h3>Your Cards</h3>
                {playerCards && playerCards.length > 0 ? (
                    <div className="cards-container">
                        {playerCards.map((card, index) => (
                            <CardSprite key={index} rank={card.rank} suit={card.suit} value={card.rank} />
                        ))}
                    </div>
                ) : (
                    <p>Waiting for cards...</p>
                )}
            </div>

            <div className="turn-indicator">
                {isPlayerTurn ? (
                    <div className="your-turn">It's your turn!</div>
                ) : (
                    <div className="waiting-turn">
                        Waiting for player {gameState.players[gameState.currentTurn]?.username} to make a move...
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameBoard;