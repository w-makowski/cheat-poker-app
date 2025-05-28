import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth0 } from '@auth0/auth0-react';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false
})

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        if (isAuthenticated) {
            const setupSocket = async () => {
                try {
                    const token = await getAccessTokenSilently();

                    const newSocket = io(import.meta.env.VITE_APP_SOCKET_URL || 'http://localhost:5001', {
                        auth: {
                            token
                        }
                    });

                    newSocket.on('connect', () => {
                        setConnected(true);
                        console.log('Socket connected');
                    });

                    newSocket.on('disconnect', () => {
                        setConnected(false);
                        console.log('Socket disconnected');
                    });

                    setSocket(newSocket);

                    return () => {
                        newSocket.disconnect();
                        setConnected(false);
                        console.log('Socket disconnected');
                    }
                } catch (error) {
                    console.error('Error setting up socket:', error);
                }
            }

            setupSocket();
        }

        return () => {
            if (socket) {
                socket.disconnect();
                setConnected(false);
                console.log('Socket disconnected');
            }
        }
    }, [isAuthenticated, getAccessTokenSilently]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    )
}
