// hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch } from "react-redux";
import { setOnlineUsers } from "@/slices/authSlice";

let socket: Socket | null = null;

export const useSocket = (userId?: string) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId || socket?.connected) return;

        socket = io(import.meta.env.VITE_BACKEND_URI, {
            query: { userId },
        });

        socket.connect();

        socket.on("connect", () => {
            console.log("🔌 Socket connected:", socket?.id);
            socket?.emit("addUser", userId);
        });

        socket.on("getOnlineUsers", (userIds: string[]) => {
            dispatch(setOnlineUsers(userIds));
        });

        return () => {
            socket?.disconnect();
            console.log("❌ Socket disconnected");
        };
    }, [userId]);

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
