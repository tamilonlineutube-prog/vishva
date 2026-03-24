import { io } from "socket.io-client";

// Initialize Socket.io connection to backend
// The URL should match your backend server address
export const socket = io("https://vishva-backend.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Connection events for debugging
socket.on("connect", () => {
  console.log("[Socket.io] Connected to backend:", socket.id);
});

socket.on("disconnect", () => {
  console.log("[Socket.io] Disconnected from backend");
});

socket.on("connect_error", (error) => {
  console.error("[Socket.io] Connection error:", error);
});

export default socket;
