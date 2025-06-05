import React, { useState } from 'react';
import type { GameControlsProps, CompleteHand } from '../../types/game';
import { PokerHand, CardRank, compareHands } from '../../types/game';

const RANKS: CardRank[] = [
    CardRank.TWO, CardRank.THREE, CardRank.FOUR, CardRank.FIVE, CardRank.SIX,
    CardRank.SEVEN, CardRank.EIGHT, CardRank.NINE, CardRank.TEN,
    CardRank.JACK, CardRank.QUEEN, CardRank.KING, CardRank.ACE
];

const HANDS_REQUIRING_RANK = [
    PokerHand.HIGH_CARD,
    PokerHand.PAIR,
    PokerHand.THREE_OF_A_KIND,
    PokerHand.FOUR_OF_A_KIND,
    PokerHand.TWO_PAIR
];

const GameControls: React.FC<GameControlsProps> = ({
                                                       isPlayerTurn,
                                                       lastDeclaredHand,
                                                       onDeclareHand,
                                                       onChallengeDeclaration
                                                   }) => {
    const [selectedHand, setSelectedHand] = useState<PokerHand | ''>('');
    const [selectedRank, setSelectedRank] = useState<CardRank>(CardRank.ACE);
    const [selectedRank2, setSelectedRank2] = useState<CardRank>(CardRank.KING);

    const allHands = Object.values(PokerHand);

    const showRankSelector = selectedHand && HANDS_REQUIRING_RANK.includes(selectedHand as PokerHand);

    // Check if the declaration is valid (strictly higher)
    const isDeclarationValid = () => {
        if (!selectedHand) return false;
        if (!lastDeclaredHand) return true;
        let ranks: CardRank[] = [];
        if (selectedHand === PokerHand.TWO_PAIR) {
            if (selectedRank === selectedRank2) return false;
            ranks = [selectedRank, selectedRank2];
        } else if (showRankSelector) {
            ranks = [selectedRank];
        }
        const newHand = { hand: selectedHand as PokerHand, ranks };
        return compareHands(newHand, lastDeclaredHand.declaredHand) > 0;
    };

    const handleDeclare = () => {
        if (!selectedHand) return;
        let ranks: CardRank[] = [];
        if (selectedHand === PokerHand.TWO_PAIR) {
            if (selectedRank === selectedRank2) return;
            ranks = [selectedRank, selectedRank2];
        } else if (showRankSelector) {
            ranks = [selectedRank];
        }
        const completeHand: CompleteHand = {
            hand: selectedHand as PokerHand,
            ranks
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
                                {selectedHand === PokerHand.TWO_PAIR && (
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
                        <button
                            className="btn btn-primary"
                            onClick={handleDeclare}
                            disabled={
                                !selectedHand ||
                                (selectedHand === PokerHand.TWO_PAIR && selectedRank === selectedRank2) ||
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
                                {lastDeclaredHand.declaredHand.ranks && lastDeclaredHand.declaredHand.ranks.length > 0 && (
                                    <> ({lastDeclaredHand.declaredHand.ranks.join(', ')})</>
                                )}
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
                            {selectedHand === PokerHand.TWO_PAIR && (
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
                    <button
                        className="btn btn-primary"
                        onClick={handleDeclare}
                        disabled={
                            !selectedHand ||
                            (selectedHand === PokerHand.TWO_PAIR && selectedRank === selectedRank2)
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