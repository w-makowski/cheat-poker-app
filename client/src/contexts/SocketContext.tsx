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
    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();

    useEffect(() => {
        let newSocket: Socket | null = null;

        if (isAuthenticated) {
            const setupSocket = async () => {
                try {
                    const token = await getAccessTokenSilently();

                    newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
                        auth: { token }
                    });

                    // On connect, register user by user.sub (Auth0 user id)
                    newSocket.on('connect', () => {
                        setConnected(true);
                        if (user?.sub) {
                            newSocket!.emit('registerUser', user.sub);
                        }
                        console.log('Socket connected');
                    });

                    newSocket.on('disconnect', () => {
                        setConnected(false);
                        console.log('Socket disconnected');
                    });

                    // Listen for private event (e.g., yourCard)
                    newSocket.on('yourCard', (data) => {
                        // You can handle the card in context, dispatch to state, or show a UI
                        alert(`You drew a card: ${data.card}`);
                    });

                    setSocket(newSocket);

                    return () => {
                        newSocket?.disconnect();
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
            if (newSocket) {
                newSocket.disconnect();
                setConnected(false);
                console.log('Socket disconnected');
            }
        }
    }, [isAuthenticated, getAccessTokenSilently, user]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    )
}