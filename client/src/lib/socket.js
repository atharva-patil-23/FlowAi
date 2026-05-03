import { io } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:7070";

let socket = null;

export const getSocket = () => {
    const token = useAuthStore.getState().token;
    if (!token) return null;

    if (!socket) {
        socket = io(SOCKET_URL, {
            auth: { token },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 500,
            transports: ["websocket", "polling"],
        });
        socket.on("connect_error", (err) => {
            console.warn("[socket] connect_error:", err.message);
        });
    } else if (!socket.connected) {
        socket.auth = { token };
        socket.connect();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
};
