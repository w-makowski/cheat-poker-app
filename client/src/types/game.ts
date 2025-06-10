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

export interface Card {
    suit: CardSuit;
    rank: CardRank;
}

export enum PokerHand {
    HIGH_CARD = 'HIGH_CARD',
    PAIR = 'PAIR',
    TWO_PAIR = 'TWO_PAIR',
    FLUSH = 'FLUSH',
    THREE_OF_A_KIND = 'THREE_OF_A_KIND',
    STRAIGHT = 'STRAIGHT',
    FULL_HOUSE = 'FULL_HOUSE',
    FOUR_OF_A_KIND = 'FOUR_OF_A_KIND',
    STRAIGHT_FLUSH = 'STRAIGHT_FLUSH',
    ROYAL_FLUSH = 'ROYAL_FLUSH'
}

export interface CompleteHand {
    hand: PokerHand;
    ranks: CardRank[];  // from most important to least
    suit: CardSuit | null; // only for flushes, straight flushes and royal flushes
}

// --- Consolidated interfaces ---

export interface Player {
    id: string;
    username: string;
    cardsCount: number;
    isActive: boolean;
    position: number; // table position
    standing?: number | null; // final place in game
    auth0Id: string;
    isHost: boolean;
    ready?: boolean;
    banned?: boolean; // for admin page
}

export interface Game {
    id: string;
    name: string;
    players: string[];
}

export interface GameRoom {
    id: string;
    name: string;
    status: string;
    maxPlayers: number;
    currentPlayers: number;
}

export interface GameState {
    id: string;
    name: string;
    players: Player[];
    currentTurn: number;
    startingPlayerIndex: number;
    currentPlayerIndex: number;
    maxPlayers: number;
    lastDeclaredHand: {
        playerId: string;
        declaredHand: CompleteHand;
    } | null;
    status: 'waiting' | 'active' | 'finished';
    winner: string | null;
    deckCount: number;
}

export interface GameControlsProps {
    isPlayerTurn: boolean;
    lastDeclaredHand: {
        playerId: string;
        declaredHand: CompleteHand;
    } | null;
    onDeclareHand: (completeHand: CompleteHand) => void;
    onChallengeDeclaration: () => void;
}

export interface GameBoardProps {
    gameState: GameState;
    playerCards: Card[] | null;
}

// --- Utility constants and functions ---

export const RANK_VALUES: Record<CardRank, number> = {
    [CardRank.TWO]: 2,
    [CardRank.THREE]: 3,
    [CardRank.FOUR]: 4,
    [CardRank.FIVE]: 5,
    [CardRank.SIX]: 6,
    [CardRank.SEVEN]: 7,
    [CardRank.EIGHT]: 8,
    [CardRank.NINE]: 9,
    [CardRank.TEN]: 10,
    [CardRank.JACK]: 11,
    [CardRank.QUEEN]: 12,
    [CardRank.KING]: 13,
    [CardRank.ACE]: 14,
};

export function handStrength(hand: PokerHand): number {
    switch (hand) {
        case PokerHand.HIGH_CARD: return 1;
        case PokerHand.PAIR: return 2;
        case PokerHand.TWO_PAIR: return 3;
        case PokerHand.FLUSH: return 4;
        case PokerHand.THREE_OF_A_KIND: return 5;
        case PokerHand.STRAIGHT: return 6;
        case PokerHand.FULL_HOUSE: return 7;
        case PokerHand.FOUR_OF_A_KIND: return 8;
        case PokerHand.STRAIGHT_FLUSH: return 9;
        case PokerHand.ROYAL_FLUSH: return 10;
        default: return 0;
    }
}

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

export const RANKS: CardRank[] = [
    CardRank.TWO, CardRank.THREE, CardRank.FOUR, CardRank.FIVE, CardRank.SIX,
    CardRank.SEVEN, CardRank.EIGHT, CardRank.NINE, CardRank.TEN,
    CardRank.JACK, CardRank.QUEEN, CardRank.KING, CardRank.ACE
];

export const SUITS: CardSuit[] = [
    CardSuit.HEARTS, CardSuit.DIAMONDS, CardSuit.CLUBS, CardSuit.SPADES
];

export const HANDS_REQUIRING_RANK = [
    PokerHand.HIGH_CARD,
    PokerHand.PAIR,
    PokerHand.THREE_OF_A_KIND,
    PokerHand.FOUR_OF_A_KIND,
    PokerHand.TWO_PAIR,
    PokerHand.FULL_HOUSE,
    PokerHand.STRAIGHT,
    PokerHand.STRAIGHT_FLUSH,
];

export const HANDS_REQUIRING_2_RANKS = [
    PokerHand.TWO_PAIR,
    PokerHand.FULL_HOUSE,
];

export const HANDS_REQUIRING_SUIT = [
    PokerHand.FLUSH,
    PokerHand.STRAIGHT_FLUSH,
    PokerHand.ROYAL_FLUSH
];

export interface CheckResultPlayer {
    id: string;
    username: string;
    cards: Card[];
}

export interface CheckResult {
    checkedHand: {
        hand: string;
        ranks?: string[];
    } | null;
    checkedPlayerId: string | null;
    nextRoundPenaltyPlayerId: string | null;
    isBluffing: boolean;
    players: CheckResultPlayer[];
}

export interface GameRoomCreate {
    name: string;
    maxPlayers: number;
    decks: number;
}