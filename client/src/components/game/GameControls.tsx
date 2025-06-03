import React, { useState } from 'react';
import type { GameControlsProps, CompleteHand } from '../../types/game';
import { PokerHand, handStrength } from '../../types/game';


const GameControls: React.FC<GameControlsProps> = ({ isPlayerTurn, lastDeclaredHand, onDeclareHand, onChallengeDeclaration }) => {
    const [selectedHand, setSelectedHand] = useState<PokerHand | ''>('');
  
    // Filter available hand types based on the last declared hand
    const allHands = Object.values(PokerHand);

    const availableHands = allHands.filter((hand) => {
        if (!lastDeclaredHand) return true;
        return handStrength(hand) > handStrength(lastDeclaredHand.declaredHand.hand);
    });

    const handleDeclare = () => {
        if (!selectedHand) return;
    
        const completeHand: CompleteHand = {
            hand: selectedHand,
            ranks: []
        };
    
        onDeclareHand(completeHand);
        setSelectedHand('');
    };
  
    if (!isPlayerTurn) {
        return (
            <div className="game-controls disabled">
                <p>Wait for your turn...</p>
            </div>
        );
    }
  
    return (
        <div className="game-controls">
            <h3>Your Turn</h3>
            
            {lastDeclaredHand ? (
            <div className="action-choices">
                <div className="declare-section">
                <h4>Declare a Higher Hand</h4>
                <select 
                    value={selectedHand} 
                    onChange={(e) => setSelectedHand(e.target.value as PokerHand)}
                    disabled={availableHands.length === 0}
                >
                    <option value="">Select a hand</option>
                    {availableHands.map((hand) => (
                        <option key={hand} value={hand}>
                            {hand.replace(/_/g, ' ')}
                        </option>
                    ))}
                </select>
                <button className="btn btn-primary" onClick={handleDeclare} disabled={!selectedHand}>
                    Declare
                </button>
                </div>
                
                <div className="or-divider">OR</div>
                
                <div className="challenge-section">
                    <h4>Challenge Previous Declaration</h4>
                    <p>
                    Current declaration:{' '}
                    <strong>{lastDeclaredHand.declaredHand.hand.replace(/_/g, ' ')}</strong>
                    </p>
                    <button className="btn btn-danger" onClick={onChallengeDeclaration}>
                        Challenge
                    </button>
                </div>
            </div>
            ) : (
            <div className="first-move">
                <h4>Make First Declaration</h4>
                <select value={selectedHand} onChange={(e) => setSelectedHand(e.target.value as PokerHand)}>
                    <option value="">Select a hand</option>
                        {allHands.map((hand) => (
                        <option key={hand} value={hand}>
                            {hand.replace(/_/g, ' ')}
                        </option>
                        ))}
                </select>
                <button className="btn btn-primary" onClick={handleDeclare} disabled={!selectedHand}>
                    Declare
                </button>
            </div>
            )}
        </div>
    );
};
  
export default GameControls;
