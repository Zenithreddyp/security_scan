import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUser } from './UserContext';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useUser();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // user._id or user.id depending on your auth payload structure
        // Let's check if user object has an id
        if (user && (user._id || user.id || user.userId)) {
            const userId = user._id || user.userId || user.id;
            const newSocket = io("http://localhost:5000", {
                query: { userId }
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
