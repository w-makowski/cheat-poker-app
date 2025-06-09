import React, { useState } from 'react';
import type { GameControlsProps, CompleteHand } from '../../types/game';
import { PokerHand, CardRank, CardSuit, compareHands,
     RANKS, SUITS, HANDS_REQUIRING_RANK, HANDS_REQUIRING_SUIT, HANDS_REQUIRING_2_RANKS } from '../../types/game';


const GameControls: React.FC<GameControlsProps> = ({isPlayerTurn, lastDeclaredHand, onDeclareHand, onChallengeDeclaration}) => {
    const [selectedHand, setSelectedHand] = useState<PokerHand | ''>('');
    const [selectedRank, setSelectedRank] = useState<CardRank>(CardRank.ACE);
    const [selectedRank2, setSelectedRank2] = useState<CardRank>(CardRank.KING);
    const [selectedSuit, setSelectedSuit] = useState<CardSuit | null>(null);

    const allHands = Object.values(PokerHand);

    const showRankSelector = selectedHand && HANDS_REQUIRING_RANK.includes(selectedHand as PokerHand);
    const showSuitSelector = selectedHand && HANDS_REQUIRING_SUIT.includes(selectedHand as PokerHand);
    const showSecondRank = selectedHand && HANDS_REQUIRING_2_RANKS.includes(selectedHand as PokerHand);

    // Check if the declaration is valid (strictly higher)
    const isDeclarationValid = () => {
        if (!selectedHand) return false;
        if (!lastDeclaredHand) return true;

        if (selectedHand === PokerHand.STRAIGHT || selectedHand === PokerHand.STRAIGHT_FLUSH) {
            if (RANKS.indexOf(selectedRank) < 4) return false;
        }

        let ranks: CardRank[] = [];
        if (HANDS_REQUIRING_2_RANKS.includes(selectedHand as PokerHand)) {
            if (selectedRank === selectedRank2) return false;
            ranks = [selectedRank, selectedRank2];
        } else if (showRankSelector) {
            ranks = [selectedRank];
        } else {
            ranks = [CardRank.TWO]; // fallback for hands not needing rank
        }
    
        const newHand = { hand: selectedHand as PokerHand, ranks, suit: selectedSuit || null } as CompleteHand;
        return compareHands(newHand, lastDeclaredHand.declaredHand) > 0;
    };

    const handleDeclare = () => {
        if (!selectedHand) return;
        let ranks: CardRank[] = [];
        if (HANDS_REQUIRING_2_RANKS.includes(selectedHand as PokerHand)) {
            if (selectedRank === selectedRank2) return;
            ranks = [selectedRank, selectedRank2];
        } else if (showRankSelector) {
            ranks = [selectedRank];
        } else {
            ranks = [CardRank.TWO];
        }

        const completeHand: CompleteHand = {
            hand: selectedHand as PokerHand,
            ranks,
            suit: selectedSuit
        };
        onDeclareHand(completeHand);
        setSelectedHand('');
    };

    const formatHandName = (hand: string) => {
        return hand.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    if (!isPlayerTurn) {
        return (
            <div className="game-controls disabled">
                <div className="waiting-message">
                    <h3>Waiting for your turn...</h3>
                    <div className="waiting-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="game-controls">
            <h2 className="controls-title">Your Turn</h2>
            
            {lastDeclaredHand ? (
                <div className="action-choices">
                    <div className="declare-section">
                        <h3>Declare a Higher Hand</h3>
                        
                        {/* Hand Selection */}
                        <div className="hand-selection">
                            <h4>Choose Hand Type:</h4>
                            <div className="hand-grid">
                                {allHands.map(hand => (
                                    <button
                                        key={hand}
                                        className={`hand-button ${selectedHand === hand ? 'selected' : ''}`}
                                        onClick={() => setSelectedHand(hand)}
                                    >
                                        {formatHandName(hand)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rank Selection */}
                        {showRankSelector && (
                            <div className="rank-selection">
                                <h4>Choose {showSecondRank ? 'First ' : ''}Rank:</h4>
                                <div className="rank-grid">
                                    {RANKS.map(rank => (
                                        <button
                                            key={rank}
                                            className={`rank-button ${selectedRank === rank ? 'selected' : ''}`}
                                            onClick={() => setSelectedRank(rank)}
                                        >
                                            {rank}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Second Rank Selection for pairs, two pairs, full house */}
                        {showSecondRank && (
                            <div className="rank-selection">
                                <h4>Choose Second Rank:</h4>
                                <div className="rank-grid">
                                    {RANKS.filter(rank => rank !== selectedRank).map(rank => (
                                        <button
                                            key={rank}
                                            className={`rank-button ${selectedRank2 === rank ? 'selected' : ''}`}
                                            onClick={() => setSelectedRank2(rank)}
                                        >
                                            {rank}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suit Selection */}
                        {showSuitSelector && (
                            <div className="suit-selection">
                                <h4>Choose Suit:</h4>
                                <div className="suit-grid">
                                    {SUITS.map(suit => (
                                        <button
                                            key={suit}
                                            className={`suit-button ${suit.toLowerCase()} ${selectedSuit === suit ? 'selected' : ''}`}
                                            onClick={() => setSelectedSuit(suit)}
                                        >
                                            <span className="suit-symbol">
                                                {suit === CardSuit.HEARTS ? '♥' : 
                                                 suit === CardSuit.DIAMONDS ? '♦' : 
                                                 suit === CardSuit.CLUBS ? '♣' : '♠'}
                                            </span>
                                            <span className="suit-name">{suit}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            className="btn btn-primary declare-btn"
                            onClick={handleDeclare}
                            disabled={
                                !selectedHand ||
                                (showSecondRank && selectedRank === selectedRank2) ||
                                (showSuitSelector && !selectedSuit) ||
                                !isDeclarationValid()
                            }
                        >
                            <span className="btn-icon">🎯</span>
                            Declare Hand
                        </button>
                    </div>

                    <div className="or-divider">
                        <span>OR</span>
                    </div>

                    <div className="challenge-section">
                        <h3>Challenge Previous Declaration</h3>
                        <div className="current-declaration">
                            <p className="declaration-label">Current declaration:</p>
                            <div className="declaration-display">
                                <span className="hand-name">
                                    {formatHandName(lastDeclaredHand.declaredHand.hand)}
                                </span>
                                {HANDS_REQUIRING_SUIT.includes(lastDeclaredHand.declaredHand.hand) && lastDeclaredHand.declaredHand.suit && (
                                    <span className="suit-info">
                                        ({lastDeclaredHand.declaredHand.suit})
                                    </span>
                                )}
                                {lastDeclaredHand.declaredHand.ranks &&
                                    HANDS_REQUIRING_RANK.includes(lastDeclaredHand.declaredHand.hand) &&
                                    lastDeclaredHand.declaredHand.ranks.length > 0 && (
                                        <span className="rank-info">
                                            ({lastDeclaredHand.declaredHand.ranks.join(', ')})
                                        </span>
                                    )
                                }
                            </div>
                        </div>
                        <button className="btn btn-danger challenge-btn" onClick={onChallengeDeclaration}>
                            <span className="btn-icon">⚔️</span>
                            Challenge Declaration
                        </button>
                    </div>
                </div>
            ) : (
                <div className="first-move">
                    <h3>Make First Declaration</h3>
                    
                    {/* Hand Selection */}
                    <div className="hand-selection">
                        <h4>Choose Hand Type:</h4>
                        <div className="hand-grid">
                            {allHands.map(hand => (
                                <button
                                    key={hand}
                                    className={`hand-button ${selectedHand === hand ? 'selected' : ''}`}
                                    onClick={() => setSelectedHand(hand)}
                                >
                                    {formatHandName(hand)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rank Selection */}
                    {showRankSelector && (
                        <div className="rank-selection">
                            <h4>Choose {showSecondRank ? 'First ' : ''}Rank:</h4>
                            <div className="rank-grid">
                                {RANKS.map(rank => (
                                    <button
                                        key={rank}
                                        className={`rank-button ${selectedRank === rank ? 'selected' : ''}`}
                                        onClick={() => setSelectedRank(rank)}
                                    >
                                        {rank}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Second Rank Selection */}
                    {showSecondRank && (
                        <div className="rank-selection">
                            <h4>Choose Second Rank:</h4>
                            <div className="rank-grid">
                                {RANKS.filter(rank => rank !== selectedRank).map(rank => (
                                    <button
                                        key={rank}
                                        className={`rank-button ${selectedRank2 === rank ? 'selected' : ''}`}
                                        onClick={() => setSelectedRank2(rank)}
                                    >
                                        {rank}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suit Selection */}
                    {showSuitSelector && (
                        <div className="suit-selection">
                            <h4>Choose Suit:</h4>
                            <div className="suit-grid">
                                {SUITS.map(suit => (
                                    <button
                                        key={suit}
                                        className={`suit-button ${suit.toLowerCase()} ${selectedSuit === suit ? 'selected' : ''}`}
                                        onClick={() => setSelectedSuit(suit)}
                                    >
                                        <span className="suit-symbol">
                                            {suit === CardSuit.HEARTS ? '♥' : 
                                             suit === CardSuit.DIAMONDS ? '♦' : 
                                             suit === CardSuit.CLUBS ? '♣' : '♠'}
                                        </span>
                                        <span className="suit-name">{suit}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        className="btn btn-primary declare-btn"
                        onClick={handleDeclare}
                        disabled={
                            !selectedHand ||
                                (HANDS_REQUIRING_2_RANKS.includes(selectedHand as PokerHand) && selectedRank === selectedRank2)
                        }
                    >
                        <span className="btn-icon">🎯</span>
                        Make Declaration
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameControls;

//     if (!isPlayerTurn) {
//         return (
//             <div className="game-controls disabled">
//                 <p>Wait for your turn...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="game-controls">
//             <h3>Your Turn</h3>
//             {lastDeclaredHand ? (
//                 <div className="action-choices">
//                     <div className="declare-section">
//                         <h4>Declare a Higher Hand</h4>
//                         <select
//                             value={selectedHand}
//                             onChange={e => setSelectedHand(e.target.value as PokerHand)}
//                         >
//                             <option value="">Select a hand</option>
//                             {allHands.map(hand => (
//                                 <option key={hand} value={hand}>
//                                     {hand.replace(/_/g, ' ')}
//                                 </option>
//                             ))}
//                         </select>
//                         {showRankSelector && (
//                             <>
//                                 <select
//                                     value={selectedRank}
//                                     onChange={e => setSelectedRank(e.target.value as CardRank)}
//                                 >
//                                     {RANKS.map(rank => (
//                                         <option key={rank} value={rank}>
//                                             {rank}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {HANDS_REQUIRING_2_RANKS.includes(selectedHand as PokerHand) && (
//                                     <select
//                                         value={selectedRank2}
//                                         onChange={e => setSelectedRank2(e.target.value as CardRank)}
//                                     >
//                                         {RANKS.filter(rank => rank !== selectedRank).map(rank => (
//                                             <option key={rank} value={rank}>
//                                                 {rank}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 )}
//                             </>
//                         )}
//                         {showSuitSelector && (
//                             <select
//                                 value={selectedSuit || ''}
//                                 onChange={e => setSelectedSuit(e.target.value as CardSuit)}
//                             >
//                                 <option value="">Select a suit</option>
//                                 {SUITS.map(suit => (
//                                     <option key={suit} value={suit}>{suit}</option>
//                                 ))}
//                             </select>
//                         )}
//                         <button
//                             className="btn btn-primary"
//                             onClick={handleDeclare}
//                             disabled={
//                                 !selectedHand ||
//                                 (HANDS_REQUIRING_2_RANKS.includes(selectedHand as PokerHand) && selectedRank === selectedRank2) ||
//                                 !isDeclarationValid()
//                             }
//                         >
//                             Declare
//                         </button>
//                     </div>
//                     <div className="or-divider">OR</div>
//                     <div className="challenge-section">
//                         <h4>Challenge Previous Declaration</h4>
//                         <p>
//                             Current declaration:{' '}
//                             <strong>
//                                 {lastDeclaredHand.declaredHand.hand.replace(/_/g, ' ')}
//                                 {HANDS_REQUIRING_SUIT.includes(lastDeclaredHand.declaredHand.hand) && lastDeclaredHand.declaredHand.suit && (
//                                     <> ({lastDeclaredHand.declaredHand.suit})</>
//                                 )}
//                                 {lastDeclaredHand.declaredHand.ranks &&
//                                     HANDS_REQUIRING_RANK.includes(lastDeclaredHand.declaredHand.hand) &&
//                                     lastDeclaredHand.declaredHand.ranks.length > 0 && (
//                                         <> ({lastDeclaredHand.declaredHand.ranks.join(', ')})</>
//                                     )
//                                 }
//                             </strong>
//                         </p>
//                         <button className="btn btn-danger" onClick={onChallengeDeclaration}>
//                             Challenge
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <div className="first-move">
//                     <h4>Make First Declaration</h4>
//                     <select value={selectedHand} onChange={e => setSelectedHand(e.target.value as PokerHand)}>
//                         <option value="">Select a hand</option>
//                         {allHands.map(hand => (
//                             <option key={hand} value={hand}>
//                                 {hand.replace(/_/g, ' ')}
//                             </option>
//                         ))}
//                     </select>
//                     {showRankSelector && (
//                         <>
//                             <select
//                                 value={selectedRank}
//                                 onChange={e => setSelectedRank(e.target.value as CardRank)}
//                             >
//                                 {RANKS.map(rank => (
//                                     <option key={rank} value={rank}>
//                                         {rank}
//                                     </option>
//                                 ))}
//                             </select>
//                             {HANDS_REQUIRING_2_RANKS.includes(selectedHand as PokerHand) && (
//                                 <select
//                                     value={selectedRank2}
//                                     onChange={e => setSelectedRank2(e.target.value as CardRank)}
//                                 >
//                                     {RANKS.filter(rank => rank !== selectedRank).map(rank => (
//                                         <option key={rank} value={rank}>
//                                             {rank}
//                                         </option>
//                                     ))}
//                                 </select>
//                             )}
//                         </>
//                     )}
//                     {showSuitSelector && (
//                         <select
//                             value={selectedSuit || ''}
//                             onChange={e => setSelectedSuit(e.target.value as CardSuit)}
//                         >
//                             <option value="">Select a suit</option>
//                             {SUITS.map(suit => (
//                                 <option key={suit} value={suit}>{suit}</option>
//                             ))}
//                         </select>
//                     )}
//                     <button
//                         className="btn btn-primary"
//                         onClick={handleDeclare}
//                         disabled={
//                             !selectedHand ||
//                             (HANDS_REQUIRING_2_RANKS.includes(selectedHand as PokerHand) && selectedRank === selectedRank2)
//                         }
//                     >
//                         Declare
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default GameControls;