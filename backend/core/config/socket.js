import { Server } from "socket.io";

let io;
export const userSockets = new Map();

export const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "http://localhost:5173", credentials: true }
    });

    io.on("connection", (socket) => {
        // When client connects, they must send their userId
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSockets.set(userId, socket.id);
            console.log(`User ${userId} connected with socket ${socket.id}`);
        }

        socket.on("disconnect", () => {
            if (userId) {
                userSockets.delete(userId);
                console.log(`User ${userId} disconnected`);
            }
        });
    });
    return io;
};

export const getIo = () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
};
