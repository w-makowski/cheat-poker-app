import axios from 'axios'
//import { getToken } from './authService'

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001'

interface GameRoom {
    id: string;
    name: string;
    status: string;
    maxPlayers: number;
    currentPlayers: number;
}

interface GameRoomCreate {
    name: string;
    maxPlayers: number;
    decks: number;
}

const api = axios.create({
    baseURL: API_URL
})

// api.interceptors.request.use(async (config) => {
//     const token = await getToken()
//     console.log('Adding token to request:', token);
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`
//     }
//     return config;
// });

export const fetchGameRooms = async (): Promise<GameRoom[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/games/waiting`);
        return response.data;
    } catch (error) {
        console.error('Error fetching game rooms:', error);
        throw error;
    }
};

export const fetchGameDetails = async (gameId: string, token: string): Promise<any> => {
    try {
      const response = await api.get(`/api/games/${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching game details:', error);
      throw error;
    }
  };

export const createGameRoom = async (roomData: GameRoomCreate, token: string): Promise<any> => {
    try {
        console.log('token:', token);
        const response = await api.post('/api/games/', roomData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        return response.data;
    } catch (error) {
        console.error('Error creating game room:', error);
        throw error;
    }
};
  
export const joinGameRoom = async (gameId: string, token: string): Promise<any> => {
    try {
        console.log('token:', token);
        const response = await api.post(`/api/games/join`, {gameId}, {
            headers: {
            Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
      console.error('Error joining game room:', error);
      throw error;
    }
};
  
  export const leaveGameRoom = async (gameId: string, token: string): Promise<any> => {
    try {
      const response = await api.post(`/api/games/${gameId}/leave`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error leaving game room:', error);
      throw error;
    }
};

export const startGame = async (gameId: string, token: string): Promise<any> => {
    try {
      const response = await api.post(`/api/games/${gameId}/start`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
};
