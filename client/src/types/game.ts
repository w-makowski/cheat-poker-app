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

export interface CompleteHand {
    hand: PokerHand;
    ranks: CardRank[];  // from most important to least
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
    // cards: Card[];
    cardsCount: number;
    isActive: boolean;
    position: number;
    auth0Id: string
    isHost: boolean;
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
