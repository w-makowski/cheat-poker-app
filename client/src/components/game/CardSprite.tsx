import React from 'react';

interface CardSpriteProps {
    rank: string;
    suit: string;
    value?: string;
}

function getSuitSymbol(suit: string): string {
    switch (suit.toLowerCase()) {
        case 'hearts': return '♥';
        case 'diamonds': return '♦';
        case 'clubs': return '♣';
        case 'spades': return '♠';
        default: return suit;
    }
}

const CardSprite: React.FC<CardSpriteProps> = ({ rank, suit, value }) => (
    <div className={`card ${suit.toLowerCase()}`}>
        <span className="card-value">{value || rank}</span>
        <span className="card-suit">{getSuitSymbol(suit)}</span>
    </div>
);

export default CardSprite;