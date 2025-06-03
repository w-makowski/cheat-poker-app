import React from 'react';

interface GameBoardProps {
    gameState: any;
    playerCards: any;
    isPlayerTurn: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, playerCards, isPlayerTurn }) => {
    return (
        <div className="game-board">
            <div className="game-info">
            <h2>Game in Progress</h2>
            {gameState.lastDeclaration && (
                <div className="last-declaration">
                <h3>Last Declaration</h3>
                <p><strong>Hand:</strong> {gameState.lastDeclaration.handType}</p>
                </div>
            )}
            </div>
    
            <div className="player-hand">
            <h3>Your Cards</h3>
            {playerCards ? (
                <div className="cards-container">
                {playerCards.cards.map((card: any, index: number) => (
                    <div key={index} className={`card ${card.suit.toLowerCase()}`}>
                    <span className="card-value">{card.value}</span>
                    <span className="card-suit">{getSuitSymbol(card.suit)}</span>
                    </div>
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
  

function getSuitSymbol(suit: string): string {
    switch (suit.toLowerCase()) {
        case 'hearts': return '♥';
        case 'diamonds': return '♦';
        case 'clubs': return '♣';
        case 'spades': return '♠';
        default: return suit;
    }
}
  
export default GameBoard;
