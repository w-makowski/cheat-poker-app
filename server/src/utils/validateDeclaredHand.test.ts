import { validateDeclaredHand } from './validateDeclaredHand';
import { Card, CardRank, CardSuit, PokerHand } from '../types/game';

const c = (rank: CardRank, suit: CardSuit): Card => ({ rank, suit });

// 20 test cases for validateDeclaredHand function

describe('validateDeclaredHand', () => {
  test('HIGH_CARD - valid', () => {
    const cards = [
        c(CardRank.ACE, CardSuit.HEARTS),
        c(CardRank.THREE, CardSuit.CLUBS), 
        c(CardRank.FOUR, CardSuit.SPADES),
        c(CardRank.TWO, CardSuit.SPADES)
    ];
    const declared = { hand: PokerHand.HIGH_CARD, ranks: [CardRank.ACE], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(true);
  });

  test('HIGH_CARD - invalid', () => {
    const cards = [
        c(CardRank.THREE, CardSuit.CLUBS), 
        c(CardRank.FOUR, CardSuit.SPADES)
    ];
    const declared = { hand: PokerHand.HIGH_CARD, ranks: [CardRank.ACE], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(false);
  });

  test('PAIR - valid', () => {
    const cards = [
        c(CardRank.FIVE, CardSuit.HEARTS), 
        c(CardRank.THREE, CardSuit.CLUBS), 
        c(CardRank.FOUR, CardSuit.SPADES),
        c(CardRank.FIVE, CardSuit.CLUBS)
    ];
    const declared = { hand: PokerHand.PAIR, ranks: [CardRank.FIVE], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(true);
  });

  test('PAIR - invalid', () => {
    const cards = [
        c(CardRank.FIVE, CardSuit.HEARTS),
        c(CardRank.THREE, CardSuit.CLUBS), 
        c(CardRank.FOUR, CardSuit.SPADES), 
        c(CardRank.SIX, CardSuit.CLUBS)
    ];
    const declared = { hand: PokerHand.PAIR, ranks: [CardRank.FIVE], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(false);
  });

  test('TWO_PAIR - valid', () => {
    const cards = [
      c(CardRank.THREE, CardSuit.HEARTS),
      c(CardRank.FOUR, CardSuit.SPADES),
      c(CardRank.THREE, CardSuit.SPADES),
      c(CardRank.SEVEN, CardSuit.DIAMONDS),
      c(CardRank.FOUR, CardSuit.HEARTS),
      c(CardRank.SEVEN, CardSuit.CLUBS),
      c(CardRank.THREE, CardSuit.DIAMONDS)
    ];
    const declared = { hand: PokerHand.TWO_PAIR, ranks: [CardRank.SEVEN, CardRank.THREE], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(true);
  });

  test('TWO_PAIR - invalid', () => {
    const cards = [
        c(CardRank.THREE, CardSuit.HEARTS), 
        c(CardRank.THREE, CardSuit.SPADES)
    ];
    const declared = { hand: PokerHand.TWO_PAIR, ranks: [CardRank.SEVEN, CardRank.THREE], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(false);
  });

  test('THREE_OF_A_KIND - valid', () => {
    const cards = [
      c(CardRank.SIX, CardSuit.HEARTS),
      c(CardRank.SIX, CardSuit.CLUBS),
      c(CardRank.THREE, CardSuit.HEARTS),
      c(CardRank.FOUR, CardSuit.SPADES),
      c(CardRank.THREE, CardSuit.SPADES),
      c(CardRank.SIX, CardSuit.SPADES),
    ];
    const declared = { hand: PokerHand.THREE_OF_A_KIND, ranks: [CardRank.SIX], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(true);
  });

  test('THREE_OF_A_KIND - invalid', () => {
    const cards = [
        c(CardRank.SIX, CardSuit.HEARTS),
        c(CardRank.THREE, CardSuit.HEARTS),
        c(CardRank.THREE, CardSuit.DIAMONDS),
        c(CardRank.THREE, CardSuit.SPADES),
        c(CardRank.SIX, CardSuit.CLUBS)
    ];
    const declared = { hand: PokerHand.THREE_OF_A_KIND, ranks: [CardRank.SIX], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(false);
  });

  test('STRAIGHT - valid', () => {
    const cards = [
        c(CardRank.SIX, CardSuit.HEARTS),
        c(CardRank.THREE, CardSuit.HEARTS),
        c(CardRank.THREE, CardSuit.DIAMONDS),
        c(CardRank.THREE, CardSuit.SPADES),
        c(CardRank.SIX, CardSuit.CLUBS),
        c(CardRank.FIVE, CardSuit.HEARTS),
        c(CardRank.SIX, CardSuit.DIAMONDS),
        c(CardRank.SEVEN, CardSuit.SPADES),
        c(CardRank.EIGHT, CardSuit.CLUBS),
        c(CardRank.NINE, CardSuit.HEARTS),
    ];
    const declared = { hand: PokerHand.STRAIGHT, ranks: [CardRank.NINE], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(true);
  });

  test('STRAIGHT - invalid', () => {
    const cards = [
      c(CardRank.FIVE, CardSuit.HEARTS),
      c(CardRank.SIX, CardSuit.DIAMONDS),
      c(CardRank.SEVEN, CardSuit.SPADES),
      c(CardRank.EIGHT, CardSuit.CLUBS),
      c(CardRank.TEN, CardSuit.HEARTS),
    ];
    const declared = { hand: PokerHand.STRAIGHT, ranks: [CardRank.NINE], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(false);
  });

  test('FLUSH - valid', () => {
    const cards = [
      c(CardRank.TWO, CardSuit.HEARTS),
      c(CardRank.FIVE, CardSuit.HEARTS),
      c(CardRank.EIGHT, CardSuit.CLUBS),
      c(CardRank.NINE, CardSuit.HEARTS),
      c(CardRank.SIX, CardSuit.DIAMONDS),
      c(CardRank.JACK, CardSuit.HEARTS),
      c(CardRank.KING, CardSuit.HEARTS),
    ];
    const declared = { hand: PokerHand.FLUSH, ranks: [CardRank.KING], suit: CardSuit.HEARTS };
    expect(validateDeclaredHand(cards, declared)).toBe(true);
  });

  test('FLUSH - invalid', () => {
    const cards = [
      c(CardRank.TWO, CardSuit.HEARTS),
      c(CardRank.FIVE, CardSuit.HEARTS),
      c(CardRank.NINE, CardSuit.CLUBS),
      c(CardRank.JACK, CardSuit.HEARTS),
      c(CardRank.KING, CardSuit.HEARTS),
      c(CardRank.EIGHT, CardSuit.CLUBS),
    ];
    const declared = { hand: PokerHand.FLUSH, ranks: [CardRank.KING], suit: CardSuit.HEARTS };
    expect(validateDeclaredHand(cards, declared)).toBe(false);
  });

  test('FULL_HOUSE - valid', () => {
    const cards = [
      c(CardRank.FOUR, CardSuit.HEARTS),
      c(CardRank.FOUR, CardSuit.CLUBS),
      c(CardRank.EIGHT, CardSuit.DIAMONDS),
      c(CardRank.FOUR, CardSuit.SPADES),
      c(CardRank.EIGHT, CardSuit.CLUBS),
      c(CardRank.SEVEN, CardSuit.DIAMONDS),
      c(CardRank.SEVEN, CardSuit.CLUBS),
    ];
    const declared = { hand: PokerHand.FULL_HOUSE, ranks: [CardRank.FOUR, CardRank.SEVEN], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(true);
  });

  test('FULL_HOUSE - invalid', () => {
    const cards = [
      c(CardRank.FOUR, CardSuit.HEARTS),
      c(CardRank.EIGHT, CardSuit.CLUBS),
      c(CardRank.FOUR, CardSuit.CLUBS),
      c(CardRank.SEVEN, CardSuit.DIAMONDS),
      c(CardRank.SEVEN, CardSuit.CLUBS),
      c(CardRank.SEVEN, CardSuit.HEARTS),

    ];
    const declared = { hand: PokerHand.FULL_HOUSE, ranks: [CardRank.FOUR, CardRank.SEVEN], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(false);
  });

  test('FOUR_OF_A_KIND - valid', () => {
    const cards = [
      c(CardRank.NINE, CardSuit.HEARTS),
      c(CardRank.NINE, CardSuit.CLUBS),
      c(CardRank.ACE, CardSuit.CLUBS),
      c(CardRank.NINE, CardSuit.SPADES),
      c(CardRank.NINE, CardSuit.DIAMONDS),
      c(CardRank.EIGHT, CardSuit.CLUBS),
    ];
    const declared = { hand: PokerHand.FOUR_OF_A_KIND, ranks: [CardRank.NINE], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(true);
  });

  test('FOUR_OF_A_KIND - invalid', () => {
    const cards = [
      c(CardRank.NINE, CardSuit.HEARTS),
      c(CardRank.NINE, CardSuit.CLUBS),
      c(CardRank.ACE, CardSuit.CLUBS),
      c(CardRank.EIGHT, CardSuit.CLUBS),
      c(CardRank.NINE, CardSuit.SPADES),
    ];
    const declared = { hand: PokerHand.FOUR_OF_A_KIND, ranks: [CardRank.NINE], suit: null };
    expect(validateDeclaredHand(cards, declared)).toBe(false);
  });

  test('STRAIGHT_FLUSH - valid', () => {
    const cards = [
      c(CardRank.FIVE, CardSuit.HEARTS),
      c(CardRank.SIX, CardSuit.HEARTS),
      c(CardRank.SEVEN, CardSuit.HEARTS),
      c(CardRank.EIGHT, CardSuit.HEARTS),
      c(CardRank.NINE, CardSuit.HEARTS),
      c(CardRank.TEN, CardSuit.HEARTS),
    ];
    const declared = { hand: PokerHand.STRAIGHT_FLUSH, ranks: [CardRank.NINE], suit: CardSuit.HEARTS };
    expect(validateDeclaredHand(cards, declared)).toBe(true);
  });

  test('STRAIGHT_FLUSH - invalid', () => {
    const cards = [
      c(CardRank.FIVE, CardSuit.HEARTS),
      c(CardRank.SIX, CardSuit.HEARTS),
      c(CardRank.SEVEN, CardSuit.HEARTS),
      c(CardRank.EIGHT, CardSuit.HEARTS),
      c(CardRank.NINE, CardSuit.CLUBS),
    ];
    const declared = { hand: PokerHand.STRAIGHT_FLUSH, ranks: [CardRank.NINE], suit: CardSuit.HEARTS };
    expect(validateDeclaredHand(cards, declared)).toBe(false);
  });

  test('ROYAL_FLUSH - valid', () => {
    const cards = [
      c(CardRank.TEN, CardSuit.SPADES),
      c(CardRank.JACK, CardSuit.SPADES),
      c(CardRank.QUEEN, CardSuit.SPADES),
      c(CardRank.KING, CardSuit.SPADES),
      c(CardRank.ACE, CardSuit.SPADES),
    ];
    const declared = { hand: PokerHand.ROYAL_FLUSH, ranks: [CardRank.ACE], suit: CardSuit.SPADES };
    expect(validateDeclaredHand(cards, declared)).toBe(true);
  });

  test('ROYAL_FLUSH - invalid', () => {
    const cards = [
      c(CardRank.TEN, CardSuit.SPADES),
      c(CardRank.JACK, CardSuit.SPADES),
      c(CardRank.QUEEN, CardSuit.SPADES),
      c(CardRank.KING, CardSuit.SPADES),
      c(CardRank.NINE, CardSuit.SPADES),
    ];
    const declared = { hand: PokerHand.ROYAL_FLUSH, ranks: [CardRank.ACE], suit: CardSuit.SPADES };
    expect(validateDeclaredHand(cards, declared)).toBe(false);
  });
});
