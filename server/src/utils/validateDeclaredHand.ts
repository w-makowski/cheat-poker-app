import { Card, CardRank, CompleteHand, PokerHand } from '../types/game';
import {
    hasHighCard,
    hasOfAKind,
    hasTwoPair,
    hasFullHouse,
    hasFlush,
    hasStraight,
    hasStraightFlush,
    hasRoyalFlush
} from './handCheckers';

export function validateDeclaredHand(cards: Card[], declaredHand: CompleteHand): boolean {
    switch (declaredHand.hand) {
        case PokerHand.HIGH_CARD:
            return hasHighCard(cards, declaredHand.ranks[0]);
        case PokerHand.PAIR:
            return hasOfAKind(cards, declaredHand.ranks, 2);
        case PokerHand.TWO_PAIR:
            return hasTwoPair(cards, declaredHand.ranks);
        case PokerHand.THREE_OF_A_KIND:
            return hasOfAKind(cards, declaredHand.ranks, 3);
        case PokerHand.FOUR_OF_A_KIND:
            return hasOfAKind(cards, declaredHand.ranks, 4);
        case PokerHand.FULL_HOUSE:
            return hasFullHouse(cards, declaredHand.ranks);
        case PokerHand.FLUSH:
            return hasFlush(cards, declaredHand.ranks);
        case PokerHand.STRAIGHT:
            return hasStraight(cards, declaredHand.ranks[0]);
        case PokerHand.STRAIGHT_FLUSH:
            return hasStraightFlush(cards, declaredHand.ranks[0]);
        case PokerHand.ROYAL_FLUSH:
            return hasRoyalFlush(cards);
        default:
            return false;
    }
}
