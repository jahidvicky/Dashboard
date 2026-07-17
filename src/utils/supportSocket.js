import { io } from "socket.io-client";
import { SOCKET_URL } from "../API/Api";

let socket = null;

// Returns a shared socket instance, creating it once on first call.
export function getSupportSocket() {
    if (!socket) {
        socket = io(SOCKET_URL, {
            path: "/socket.io/",
            transports: ["websocket"],
        });
    }
    return socket;
}

// Only call this on true app teardown (rarely needed) —
// components should just remove their own listeners, not kill the shared socket.
export function disconnectSupportSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}