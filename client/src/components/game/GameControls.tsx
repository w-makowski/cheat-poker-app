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
                            onChange={e => setSelectedHand(e.target.value as PokerHand)}
                        >
                            <option value="">Select a hand</option>
                            {allHands.map(hand => (
                                <option key={hand} value={hand}>
                                    {hand.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                        {showRankSelector && (
                            <>
                                <select
                                    value={selectedRank}
                                    onChange={e => setSelectedRank(e.target.value as CardRank)}
                                >
                                    {RANKS.map(rank => (
                                        <option key={rank} value={rank}>
                                            {rank}
                                        </option>
                                    ))}
                                </select>
                                {HANDS_REQUIRING_2_RANKS.includes(selectedHand as PokerHand) && (
                                    <select
                                        value={selectedRank2}
                                        onChange={e => setSelectedRank2(e.target.value as CardRank)}
                                    >
                                        {RANKS.filter(rank => rank !== selectedRank).map(rank => (
                                            <option key={rank} value={rank}>
                                                {rank}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </>
                        )}
                        {showSuitSelector && (
                            <select
                                value={selectedSuit || ''}
                                onChange={e => setSelectedSuit(e.target.value as CardSuit)}
                            >
                                <option value="">Select a suit</option>
                                {SUITS.map(suit => (
                                    <option key={suit} value={suit}>{suit}</option>
                                ))}
                            </select>
                        )}
                        <button
                            className="btn btn-primary"
                            onClick={handleDeclare}
                            disabled={
                                !selectedHand ||
                                (HANDS_REQUIRING_2_RANKS.includes(selectedHand as PokerHand) && selectedRank === selectedRank2) ||
                                !isDeclarationValid()
                            }
                        >
                            Declare
                        </button>
                    </div>
                    <div className="or-divider">OR</div>
                    <div className="challenge-section">
                        <h4>Challenge Previous Declaration</h4>
                        <p>
                            Current declaration:{' '}
                            <strong>
                                {lastDeclaredHand.declaredHand.hand.replace(/_/g, ' ')}
                                {HANDS_REQUIRING_SUIT.includes(lastDeclaredHand.declaredHand.hand) && lastDeclaredHand.declaredHand.suit && (
                                    <> ({lastDeclaredHand.declaredHand.suit})</>
                                )}
                                {lastDeclaredHand.declaredHand.ranks &&
                                    HANDS_REQUIRING_RANK.includes(lastDeclaredHand.declaredHand.hand) &&
                                    lastDeclaredHand.declaredHand.ranks.length > 0 && (
                                        <> ({lastDeclaredHand.declaredHand.ranks.join(', ')})</>
                                    )
                                }
                            </strong>
                        </p>
                        <button className="btn btn-danger" onClick={onChallengeDeclaration}>
                            Challenge
                        </button>
                    </div>
                </div>
            ) : (
                <div className="first-move">
                    <h4>Make First Declaration</h4>
                    <select value={selectedHand} onChange={e => setSelectedHand(e.target.value as PokerHand)}>
                        <option value="">Select a hand</option>
                        {allHands.map(hand => (
                            <option key={hand} value={hand}>
                                {hand.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                    {showRankSelector && (
                        <>
                            <select
                                value={selectedRank}
                                onChange={e => setSelectedRank(e.target.value as CardRank)}
                            >
                                {RANKS.map(rank => (
                                    <option key={rank} value={rank}>
                                        {rank}
                                    </option>
                                ))}
                            </select>
                            {HANDS_REQUIRING_2_RANKS.includes(selectedHand as PokerHand) && (
                                <select
                                    value={selectedRank2}
                                    onChange={e => setSelectedRank2(e.target.value as CardRank)}
                                >
                                    {RANKS.filter(rank => rank !== selectedRank).map(rank => (
                                        <option key={rank} value={rank}>
                                            {rank}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </>
                    )}
                    {showSuitSelector && (
                        <select
                            value={selectedSuit || ''}
                            onChange={e => setSelectedSuit(e.target.value as CardSuit)}
                        >
                            <option value="">Select a suit</option>
                            {SUITS.map(suit => (
                                <option key={suit} value={suit}>{suit}</option>
                            ))}
                        </select>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={handleDeclare}
                        disabled={
                            !selectedHand ||
                            (HANDS_REQUIRING_2_RANKS.includes(selectedHand as PokerHand) && selectedRank === selectedRank2)
                        }
                    >
                        Declare
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameControls;