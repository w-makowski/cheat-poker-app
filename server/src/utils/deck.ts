import { Card, CardRank, CardSuit, DealConfig } from '../types/game'

export function createDeck(decks: number = 1): Card[] {
    const deck: Card[] = [];

    for (let i = 0; i < decks; i++) {
        Object.values(CardSuit).forEach(suit => {
            Object.values(CardRank).forEach(rank => {
                deck.push({ suit, rank });
            });
        });
    }
      
    return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

export function dealCards(deck: Card[], dealConfig: DealConfig): Record<number, Card[]> {
    const hands: Record<number, Card[]> = {};
  
    for (const [playerIndexStr, cardsToDeal] of Object.entries(dealConfig)) {
      const playerIndex = parseInt(playerIndexStr, 10);
      hands[playerIndex] = [];
  
      for (let i = 0; i < cardsToDeal; i++) {
        if (deck.length > 0) {
          hands[playerIndex].push(deck.pop()!);
        }
      }
    }
  
    return hands;
}
  
