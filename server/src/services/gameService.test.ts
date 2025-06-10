import { PokerHand, CardSuit, CardRank, CompleteHand, GameState, Player } from '../types/game';
import * as gameService from '../services/gameService';

jest.mock('../repositories/gameRepository', () => ({
    updateGameStatus: jest.fn().mockResolvedValue(undefined),
  }));
  
  jest.mock('../repositories/playerRepository', () => ({
    removePlayerFromGame: jest.fn().mockResolvedValue({ isGameFinished: false }),
  }));
  

function generatePlayer(id: string, username: string, cardsCount = 5): Player {
return {
    id,
    username,
    cards: [],
    cardsCount,
    isActive: true,
    position: 0,
    auth0Id: id,
    isHost: false
};
}

describe('gameService core functions', () => {
  let players: Player[];
  let gameId = 'game1';

  beforeEach(() => {
    players = [generatePlayer('1', 'A'), generatePlayer('2', 'B'), generatePlayer('6', 'C')];
  });

    test('initializeGame should create game with correct number of players and cards', async () => {
        const players = [generatePlayer('1', 'A'), generatePlayer('2', 'B'), generatePlayer('3', 'C')];
        const game = await gameService.initializeGame(gameId, players, 1);

        expect(game.players).toHaveLength(3);
        game.players.forEach(p => {
            expect(p.cards.length).toBe(p.cardsCount);
        });
        expect(game.status).toBe('active');
    });

  describe('declareHand', () => {
    it('should allow declaring a stronger hand than the last one', () => {
      const game = {
        id: gameId,
        name: '',
        maxPlayers: 3,
        players,
        currentTurn: 1,
        startingPlayerIndex: 0,
        currentPlayerIndex: 0,
        lastDeclaredHand: null,
        status: 'active',
        winner: null,
        deckCount: 1
      } as GameState;

      gameService.activeGames.set(gameId, game);

      const hand: CompleteHand = {
        hand: PokerHand.PAIR,
        ranks: [CardRank.KING],
        suit: null
      };

      const result = gameService.declareHand(gameId, players[0].id, hand);
      expect(result).toBe(true);
      expect(game.lastDeclaredHand?.declaredHand.hand).toBe(PokerHand.PAIR);
      expect(game.lastDeclaredHand?.declaredHand.ranks).toStrictEqual([CardRank.KING]);
    });

    it('should reject if it is not player’s turn', () => {
      const game = {
        ...gameService.activeGames.get(gameId)!,
        currentPlayerIndex: 1
      };

      gameService.activeGames.set(gameId, game);
      const hand: CompleteHand = {
        hand: PokerHand.PAIR,
        ranks: [CardRank.ACE],
        suit: null
      };

      const result = gameService.declareHand(gameId, players[0].id, hand);
      expect(result).toBe(false);
    });
  });

  describe('startNewRound', () => {
    it('should deal new cards to active players only', async () => {
      await gameService.initializeGame(gameId, players, 1);
      const game = gameService.activeGames.get(gameId)!;

      players[1].isActive = false;
      players[1].cards = [{ suit: CardSuit.HEARTS, rank: CardRank.TWO }];

      const result = gameService.startNewRound(gameId);
      expect(result).toBe(true);
      expect(players[0].cards.length).toBeGreaterThan(0);
      expect(players[1].cards.length).toBe(0); // should be cleared
    });
  });

  test("declareHand should reject if it's not player's turn", async () => {
    const players = [generatePlayer('1', 'Alice'), generatePlayer('2', 'Bob')];
    const game = await gameService.initializeGame(gameId, players, 1);

    const hand = {
      hand: PokerHand.PAIR,
      ranks: [CardRank.TWO],
      suit: null
    };
    // Tura: gracz 1, ale deklaruje gracz 2
    const result = gameService.declareHand(gameId, '2', hand);
    expect(result).toBe(false);
  });

  test('checkPreviousPlayer should detect bluff correctly', async () => {
    const players = [generatePlayer('1', 'A'), generatePlayer('2', 'B')];
    const game = await gameService.initializeGame(gameId, players, 1);

    const bluffHand = { hand: PokerHand.FOUR_OF_A_KIND, ranks: [CardRank.ACE], suit: null };
    // Deklaracja z ręki, która nie ma 4 asów
    gameService.declareHand(gameId, '1', bluffHand);

    const result = await gameService.checkPreviousPlayer(gameId, '2');
    expect(result.isBluffing).toBe(true);
    expect(result.nextRoundPenaltyPlayer).toBe('1');
  });

  test('getCheckResultData returns current player hands and declared hand', async () => {
    const players = [generatePlayer('1', 'A'), generatePlayer('2', 'B')];
    const game = await gameService.initializeGame(gameId, players, 1);

    const hand = { hand: PokerHand.PAIR, ranks: [CardRank.FIVE], suit: null };
    gameService.declareHand(gameId, '1', hand);

    const result = gameService.getCheckResultData(gameId);
    expect(result.checkedHand).toEqual(hand);
    expect(result.checkedPlayerId).toBe('1');
    expect(result.players_cards.length).toBe(2);
  });

  test('handlePlayerLeaveInMemory deactivates player and advances turn if needed', async () => {
    const players = [generatePlayer('1', 'A'), generatePlayer('2', 'B')];
    const game = await gameService.initializeGame(gameId, players, 1);

    const hand = { hand: PokerHand.PAIR, ranks: [CardRank.THREE], suit: null };
    gameService.declareHand(gameId, '1', hand);

    gameService.handlePlayerLeaveInMemory(gameId, '2');
    expect(game.players[1].isActive).toBe(false);
  });

  test('markPlayerReadyInMemory sets ready state properly', async () => {
    const players = [generatePlayer('1', 'X')];
    const game = await gameService.initializeGame(gameId, players, 1);

    const result = gameService.markPlayerReadyInMemory(gameId, '1', true);
    expect(result).toBe(true);
    expect(game.players[0].ready).toBe(true);
  });

  test('should eliminate player with 7 cards and skip them in next round (full round flow)', async () => {
    const gameId = 'game-elimination-flow';
    const players: Player[] = [
        {
            id: 'p0', username: 'Player0', auth0Id: 'auth0|p0', isHost: true,
            cardsCount: 5, isActive: true, position: 0, cards: []
        },
        {
            id: 'p1', username: 'Player1', auth0Id: 'auth0|p1', isHost: false,
            cardsCount: 5, isActive: true, position: 1, cards: []
        },
        {
            id: 'p2', username: 'Player2', auth0Id: 'auth0|p2', isHost: false,
            cardsCount: 6, isActive: true, position: 2, cards: []
        }
    ];

    await gameService.initializeGame(gameId, players, 1);

    players[0].cards = [
        { suit: CardSuit.HEARTS, rank: CardRank.TWO },
        { suit: CardSuit.CLUBS, rank: CardRank.TWO },
        { suit: CardSuit.SPADES, rank: CardRank.FOUR },
        { suit: CardSuit.DIAMONDS, rank: CardRank.FIVE },
        { suit: CardSuit.HEARTS, rank: CardRank.SIX }
    ];
    players[1].cards = [
        { suit: CardSuit.HEARTS, rank: CardRank.THREE },
        { suit: CardSuit.CLUBS, rank: CardRank.THREE },
        { suit: CardSuit.SPADES, rank: CardRank.FOUR },
        { suit: CardSuit.DIAMONDS, rank: CardRank.SIX },
        { suit: CardSuit.HEARTS, rank: CardRank.SEVEN }
    ];
    players[2].cards = [
        { suit: CardSuit.HEARTS, rank: CardRank.EIGHT },
        { suit: CardSuit.HEARTS, rank: CardRank.NINE },
        { suit: CardSuit.HEARTS, rank: CardRank.TEN },
        { suit: CardSuit.HEARTS, rank: CardRank.JACK },
        { suit: CardSuit.HEARTS, rank: CardRank.QUEEN },
        { suit: CardSuit.HEARTS, rank: CardRank.KING } // 6 cards
    ];

    gameService.activeGames.get(gameId)!.startingPlayerIndex = 1; // p1 starts the game

    // === Turn 1 === player p1 declares a stronger hand
    const hand1: CompleteHand = {
        hand: PokerHand.PAIR,
        ranks: [CardRank.THREE],
        suit: null
    };
    expect(gameService.declareHand(gameId, 'p1', hand1)).toBe(true);

    // === Turn 2 === player p2 is checking previous player, p2 is wrong so he gets a penalty
    const result = await gameService.checkPreviousPlayer(gameId, 'p2');
    expect(result.isBluffing).toBe(false);
    expect(result.nextRoundPenaltyPlayer).toBe('p2');

    // p2 gets a penalty card - now has 7 cards so he is eliminated
    const game = gameService.activeGames.get(gameId)!;
    const p2 = game.players.find(p => p.id === 'p2')!;
    expect(p2.cardsCount).toBe(7);
    expect(p2.isActive).toBe(false);

    // Starts new round
    const success = gameService.startNewRound(gameId);
    expect(success).toBe(true);

    const updated = gameService.activeGames.get(gameId)!;
    const currentPlayerIndex = updated.startingPlayerIndex;
    const currentPlayer = updated.players[currentPlayerIndex];
    expect(currentPlayer.id).toBe('p0'); // because p2 is inactive, p0 should start
});


});
