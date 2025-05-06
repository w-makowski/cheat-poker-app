import { Card, CardRank, CardSuit, RANK_VALUES } from '../types/game';

const sortedRanks = Object.keys(RANK_VALUES) as CardRank[];

function countRanks(cards: Card[]): Record<CardRank, number> {
    const counts: Partial<Record<CardRank, number>> = {}

    for (const card of cards) {
        counts[card.rank] = (counts[card.rank] || 0) + 1;
    }
    return counts as Record<CardRank, number>;
}

function countSuits(cards: Card[]): Record<CardSuit, Card[]> {
    return {
      [CardSuit.HEARTS]: cards.filter(c => c.suit === CardSuit.HEARTS),
      [CardSuit.DIAMONDS]: cards.filter(c => c.suit === CardSuit.DIAMONDS),
      [CardSuit.CLUBS]: cards.filter(c => c.suit === CardSuit.CLUBS),
      [CardSuit.SPADES]: cards.filter(c => c.suit === CardSuit.SPADES),
    };
}

export function hasHighCard(cards: Card[], rank: CardRank): boolean {
    return cards.some(card => card.rank === rank);
}

export function hasOfAKind(cards: Card[], [rank]: CardRank[], count: number): boolean {
    return countRanks(cards)[rank] >= count;
}

export function hasTwoPair(cards: Card[], [r1, r2]: CardRank[]): boolean {
    const counts = countRanks(cards);
    return counts[r1] >= 2 && counts[r2] >= 2;
}

export function hasFullHouse(cards: Card[], [r1, r2]: CardRank[]): boolean {
    const counts = countRanks(cards);
    return counts[r1] >= 3 && counts[r2] >= 2;
}

export function hasFlush(cards: Card[], ranks: CardRank[]): boolean {
    const suits = countSuits(cards);
    return Object.values(suits).some(cardsInSuit => {
      const suitRanks = cardsInSuit.map(c => c.rank);
      return ranks.every(r => suitRanks.includes(r));
    });
}
  
export function hasStraight(cards: Card[], highestRank: CardRank): boolean {
    const index = sortedRanks.indexOf(highestRank);
    if (index < 4) return false;
  
    const neededRanks = sortedRanks.slice(index - 4, index + 1);
    const cardRanksSet = new Set(cards.map(c => c.rank));
    return neededRanks.every(r => cardRanksSet.has(r));
}

export function hasStraightFlush(cards: Card[], highestRank: CardRank): boolean {
    const suits = countSuits(cards);
    return Object.values(suits).some(cardsInSuit =>
        hasStraight(cardsInSuit, highestRank)
    );
}
  
export function hasRoyalFlush(cards: Card[]): boolean {
    const required: CardRank[] = [CardRank.TEN, CardRank.JACK, CardRank.QUEEN, CardRank.KING, CardRank.ACE];
    const suits = countSuits(cards);
    return Object.values(suits).some(cardsInSuit => {
        const ranks = cardsInSuit.map(c => c.rank);
        return required.every(r => ranks.includes(r));
    });
}
