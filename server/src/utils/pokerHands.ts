import { Card, CardSuit, CardRank, PokerHand, RANK_VALUES, CompleteHand } from '../types/game';

// ========== MAIN ALANYZE FUNCTION ==========

export function analyzePokerHand(cards: Card[]): CompleteHand {
    // Returns best possible hand from given cards

    const rankCounts = countRanks(cards);
    const suitCounts = countSuits(cards);
    const sortedRanks = getSortedRanks(cards);

    const isFlush = Object.values(suitCounts).some(count => count >= 5);
    const straightHigh = getStraightHighCard(sortedRanks);

    if (isFlush && straightHigh) {
        const flushCards = cards.filter(c => suitCounts[c.suit] >= 5);
        const flushSorted = getSortedRanks(flushCards);
        const flushStraightHigh = getStraightHighCard(flushSorted);
        if (flushStraightHigh) {
            if (flushStraightHigh === CardRank.ACE) {
                return { hand: PokerHand.ROYAL_FLUSH, ranks: [CardRank.ACE], suit: flushCards[0].suit };
            }
            return { hand: PokerHand.STRAIGHT_FLUSH, ranks: [flushStraightHigh], suit: flushCards[0].suit };
        }
    }

    const fourKind = findOfAKind(rankCounts, 4);
    if (fourKind) {
        return { hand: PokerHand.FOUR_OF_A_KIND, ranks: [fourKind, ...kickers(rankCounts, [fourKind])], suit: null };
    }

    const threeKind = findOfAKind(rankCounts, 3);
    const pair = findOfAKind(rankCounts, 2, threeKind ? [threeKind] : []);
    
    if (threeKind && pair) {
        return { hand: PokerHand.FULL_HOUSE, ranks: [threeKind, pair], suit: null };
    }

    if (straightHigh) {
        return { hand: PokerHand.STRAIGHT, ranks: [straightHigh], suit: null };
    }

    if (threeKind) {
        return { hand: PokerHand.THREE_OF_A_KIND, ranks: [threeKind, ...kickers(rankCounts, [threeKind], 2)], suit: null  };
    }

    if (isFlush) {
        return { hand: PokerHand.FLUSH, ranks: getSortedRanks(cards.filter(c => suitCounts[c.suit] >= 5)).slice(0, 5), suit: Object.keys(suitCounts).find(suit => suitCounts[suit as CardSuit] >= 5) as CardSuit || null };
    }

    const firstPair = findOfAKind(rankCounts, 2);
    const secondPair = findOfAKind(rankCounts, 2, firstPair ? [firstPair] : []);
    if (firstPair && secondPair) {
        return { hand: PokerHand.TWO_PAIR, ranks: [firstPair, secondPair, ...kickers(rankCounts, [firstPair, secondPair], 1)], suit: null  };
    }

    if (firstPair) {
        return { hand: PokerHand.PAIR, ranks: [firstPair, ...kickers(rankCounts, [firstPair], 3)], suit: null  };
    }

    return { hand: PokerHand.HIGH_CARD, ranks: getSortedRanks(cards).slice(0, 5), suit: null  };
}

// ========== VALIDATION OF DECLARATION ==========
export function validateDeclaredHand(
    cards: Card[],
    declaredHand: PokerHand,
    declaredRanks: CardRank[]
): boolean {
    const analyzed = analyzePokerHand(cards);

    if (analyzed.hand !== declaredHand) return false;
    return compareDeclaredRanks(analyzed.ranks, declaredRanks);
}

function compareDeclaredRanks(actual: CardRank[], declared: CardRank[]): boolean {
    const ac = countRankOccurrences(actual);
    const dc = countRankOccurrences(declared);
    
    for (const rank in dc) {
        if ((ac[rank as CardRank] || 0) < dc[rank as CardRank]) return false;
    }
    return true;
}


// ========== COMPARE TWO HANDS ==========

export function compareHands(a: CompleteHand, b: CompleteHand): -1 | 0 | 1 {
    const strengthA = handStrength(a.hand);
    const strengthB = handStrength(b.hand);
  
    if (strengthA !== strengthB) {
        return strengthA > strengthB ? 1 : -1;
    }
  
    for (let i = 0; i < Math.max(a.ranks.length, b.ranks.length); i++) {
        const aVal = RANK_VALUES[a.ranks[i]];
        const bVal = RANK_VALUES[b.ranks[i]];
        if (aVal !== bVal) {
            return aVal > bVal ? 1 : -1;
        }
    }
  
    return 0;
}


// ========== PREVIOUS ==========

export function checkPokerHand(cards: Card[], declaredHand: PokerHand, highlightRank?: CardRank): boolean {
    switch (declaredHand) {
        case PokerHand.HIGH_CARD:
            return true;
        
        case PokerHand.PAIR:
            return hasPair(cards, highlightRank);
        
        case PokerHand.THREE_OF_A_KIND:
            return hasThreeOfAKind(cards, highlightRank);
        
        // TODO: rest of possible poker hands:
        
        default:
            return false;
    }
}

function hasPair(cards: Card[], rank?: CardRank): boolean {
    const rankCounts = countRanks(cards);

    if (rank) {
        return rankCounts[rank] >= 2;
    } else {
        return Object.values(rankCounts).some(count => count >= 2);
    }
}

function hasThreeOfAKind(cards: Card[], rank?: CardRank): boolean {
    const rankCounts = countRanks(cards);

    if (rank) {
        return rankCounts[rank] >= 3;
    } else {
        return Object.values(rankCounts).some(count => count >= 3);
    }
}

// ========== HELPERS ==========

function countRanks(cards: Card[]): Record<CardRank, number> {
    const result: Record<CardRank, number> = {} as any;
    for (const card of cards) {
        result[card.rank] = (result[card.rank] || 0) + 1;
    }
    return result;
}
  
function countSuits(cards: Card[]): Record<CardSuit, number> {
    const result: Record<CardSuit, number> = {} as any;
    for (const card of cards) {
        result[card.suit] = (result[card.suit] || 0) + 1;
    }
    return result;
}

function getSortedRanks(cards: Card[]): CardRank[] {
    const uniqueRanks = Array.from(new Set(cards.map(c => c.rank)));
    return uniqueRanks.sort((a, b) => RANK_VALUES[b] - RANK_VALUES[a]);
}

function getStraightHighCard(sorted: CardRank[]): CardRank | null {
    const uniqueVals = Array.from(new Set(sorted.map(r => RANK_VALUES[r]))).sort((a, b) => a - b);

    for (let i = 0; i <= uniqueVals.length - 5; i++) {
        const slice = uniqueVals.slice(i, i + 5);
        if (slice[4] - slice[0] == 4) return Object.keys(RANK_VALUES).find(r => RANK_VALUES[r as CardRank] === slice[4]) as CardRank; 
    }

    if (uniqueVals.includes(14) && [2, 3, 4, 5].every(v => uniqueVals.includes(v))) return '5' as CardRank;

    return null;
}

function findOfAKind(rankCounts: Record<CardRank, number>, count: number, exclude: CardRank[] = []): CardRank | null {
    return Object.entries(rankCounts)
        .filter(([rank, cnt]) => cnt === count && !exclude.includes(rank as CardRank))
        .sort((a, b) => RANK_VALUES[b[0] as CardRank] - RANK_VALUES[a[0] as CardRank])
        .map(([rank]) => rank as CardRank)[0] || null;
}

function kickers(rankCounts: Record<CardRank, number>, exclude: CardRank[], amount = 1): CardRank[] {
    return Object.entries(rankCounts)
        .filter(([rank]) => !exclude.includes(rank as CardRank))
        .sort((a, b) => RANK_VALUES[b[0] as CardRank] - RANK_VALUES[a[0] as CardRank])
        .map(([rank]) => rank as CardRank)
        .slice(0, amount);
}
  
function countRankOccurrences(ranks: CardRank[]): Record<CardRank, number> {
    const counts: Record<CardRank, number> = {} as any;
    for (const rank of ranks) {
        counts[rank] = (counts[rank] || 0) + 1;
    }
    return counts;
}

export function handStrength(hand: PokerHand): number {
    const strengths: Record<PokerHand, number> = {
      [PokerHand.HIGH_CARD]: 1,
      [PokerHand.PAIR]: 2,
      [PokerHand.TWO_PAIR]: 3,
      [PokerHand.FLUSH]: 4,
      [PokerHand.THREE_OF_A_KIND]: 5,
      [PokerHand.STRAIGHT]: 6,
      [PokerHand.FULL_HOUSE]: 7,
      [PokerHand.FOUR_OF_A_KIND]: 8,
      [PokerHand.STRAIGHT_FLUSH]: 9,
      [PokerHand.ROYAL_FLUSH]: 10
    };
  
    return strengths[hand] || 0;
}
