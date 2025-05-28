import { Request, Response, RequestHandler } from 'express';
import Game from '../models/Game';
import Player from '../models/Player';
import User from '../models/User';
// import { v4 as uuidv4 } from 'uuid';
import { createDeck, shuffleDeck } from '../utils/deck';

export async function createGame(req: Request, res: Response) {
    try {
        // const { name, userId, maxPlayers, numberOfDecks } = req.body;

        // if (!name || !userId) {
        //     return res.status(400).json({ error: 'Name and userId are required' });
        // }

        // const user = await User.findByPk(userId);
        // if (!user) {
        //     return res.status(404).json({ error: 'User not found' });
        // }

        const auth0Id = (req as any).auth?.sub;
        const { name, maxPlayers, numberOfDecks } = req.body;

        if (!auth0Id || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await User.findOne({ where: { auth0Id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const game = await Game.create({
            name,
            status: 'waiting',
            currentTurn: 0,
            maxPlayers: maxPlayers,
            numberOfDecks: numberOfDecks
        });

        await Player.create({
            // userId,
            userId: user.id,
            gameId: game.id,
            position: 0,
            cardsCount: 1,
            isActive: true
        });

        res.status(201).json({
            success: true,
            gameId: game.id,
            message: 'Game created successfully'
        });
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
}

export async function getWaitingGames(req: Request, res: Response) {
    try {
        const waitingGames = await Game.findAll({
            where: { status: 'waiting' },
            include: [
                {
                    model: Player,
                    include: [{ model: User, attributes: ['username'] }]
                }
            ]
        });

        res.json(waitingGames);
    } catch (error) {
        console.error('Error fetching waiting games:', error);
        res.status(500).json({ error: 'Failed to fetch waiting games' });
    }
}

export async function joinGame(req: Request, res: Response) {
    try {
        const { gameId } = req.body;

        const auth0Id = (req as any).auth?.sub;

        const user = await User.findOne({ where: { auth0Id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = user.id;

        if (!gameId || !userId) {
            return res.status(400).json({ error: 'GameId and userId are required' });
        }

        const game = await Game.findOne({
            where: { id: gameId, status: 'waiting' }
        });

        if (!game) {
            return res.status(404).json({ error: 'Game not found or already started '});
        }

        const existingPlayer = await Player.findOne({
            where: { gameId, userId }
        });

        if (existingPlayer) {
            return res.status(400).json({ error: 'User already joined this game' });
        }

        const playerCount = await Player.count({ where: { gameId } });

        await Player.create({
            userId,
            gameId,
            position: playerCount,
            cardsCount: 1,
            isActive: true
        });

        res.json({
            success: true,
            message: 'Successfully joined the game'
        });
    } catch (error) {
        console.error('Error joining game:', error);
        res.status(500).json({ error: 'Failed to join game' });
    }
}

export async function startGame(req: Request, res: Response) {
    try {
        const { gameId } = req.params;

        const game = await Game.findOne({
            where: { id: gameId, status: 'waiting' }
        });

        if (!game) {
            return res.status(404).json({ error: 'Game not found or already started' });
        }

        await game.update({ status: 'active' });

        res.json({
            success: true,
            message: 'Game started successfully'
        });
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ error: 'Failed to start game' });
    }
}

export async function getGameDetails(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
  
      const game = await Game.findByPk(gameId, {
        include: [
          {
            model: Player,
            include: [{ model: User, attributes: ['id', 'username'] }]
          }
        ]
      });
  
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
  
      res.json(game);
    } catch (error) {
      console.error('Error fetching game details:', error);
      res.status(500).json({ error: 'Failed to fetch game details' });
    }
}
