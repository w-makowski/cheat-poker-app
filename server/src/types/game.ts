export enum CardSuit {
    HEARTS = 'hearts',
    DIAMONDS = 'diamonds',
    CLUBS = 'clubs',
    SPADES = 'spades'
}

export enum CardRank {
    TWO = '2',
    THREE = '3',
    FOUR = '4',
    FIVE = '5',
    SIX = '6',
    SEVEN = '7',
    EIGHT = '8',
    NINE = '9',
    TEN = '10',
    JACK = 'J',
    QUEEN = 'Q',
    KING = 'K',
    ACE = 'A'
}

export const RANK_VALUES: Record<CardRank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

export interface Card {
    suit: CardSuit;
    rank: CardRank;
}

// export interface AnalyzedHand {
//     hand: PokerHand;
//     ranks: CardRank[];  // from most important to least
// }

export interface CompleteHand {
    hand: PokerHand;
    ranks: CardRank[];  // from most important to least
}

export type DealConfig = {
    [playerIndex: number]: number;
}

export enum PokerHand {
    HIGH_CARD = 'HIGH_CARD',
    PAIR = 'PAIR',
    TWO_PAIR = 'TWO_PAIR',
    THREE_OF_A_KIND = 'THREE_OF_A_KIND',
    STRAIGHT = 'STRAIGHT',
    FLUSH = 'FLUSH',
    FULL_HOUSE = 'FULL_HOUSE',
    FOUR_OF_A_KIND = 'FOUR_OF_A_KIND',
    STRAIGHT_FLUSH = 'STRAIGHT_FLUSH',
    ROYAL_FLUSH = 'ROYAL_FLUSH'
}

export interface Player {
    id: string;
    username: string;
    cards: Card[];
    cardsCount: number;
    isActive: boolean;
    position: number;
    auth0Id: string;
}

export interface GameState {
    id: string;
    name: string;
    maxPlayers: number;
    players: Player[];
    currentTurn: number;
    startingPlayerIndex: number;
    currentPlayerIndex: number;
    lastDeclaredHand: {
        playerId: string;
        declaredHand: CompleteHand;
    } | null;
    status: 'waiting' | 'active' | 'finished';
    winner: string | null;
    deckCount: number;
}
