import { Request, Response } from 'express';
import { getAllUsers, banUserById } from '../repositories/userRepository';
import { getAllGames, deleteGame } from '../repositories/gameRepository';
import Player from '../models/Player';

import { unbanUserById } from '../repositories/userRepository';
import { emitGameDeletedByAdmin } from '../sockets';

export const getAllPlayersHandler = async (_req: Request, res: Response) => {
    try {
        const users = await getAllUsers();
        // Add banned status if you have such a field, else default to false
        const players = users.map(u => ({
            id: u.id,
            username: u.username,
            banned: u.accountStatus === 'banned'
        }));
        res.json(players);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch players' });
    }
};

export const getAllGamesHandler = async (_req: Request, res: Response) => {
    try {
        const games = await getAllGames();
        // Optionally include player usernames
        const gamesWithPlayers = await Promise.all(games.map(async (g: any) => {
            const players = await Player.findAll({ where: { gameId: g.id } });
            return {
                id: g.id,
                name: g.name,
                players: players.map((p: any) => p.username)
            };
        }));
        res.json(gamesWithPlayers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch games' });
    }
};

export const banPlayerHandler = async (req: Request, res: Response) => {
    try {
        const { playerId } = req.params;
        await banUserById(playerId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to ban player' });
    }
};

export const deleteGameHandler = async (req: Request, res: Response) => {
    try {
        const { gameId } = req.params;
        await deleteGame(gameId);
        emitGameDeletedByAdmin(gameId); // Notify all players
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete game' });
    }
};

export const unbanPlayerHandler = async (req: Request, res: Response) => {
    try {
        const { playerId } = req.params;
        await unbanUserById(playerId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unban player' });
    }
};