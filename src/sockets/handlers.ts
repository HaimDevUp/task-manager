import type { Server as SocketIOServer } from "socket.io";

/** חיבורי Socket.io — כרגע רק לוג; האירועים נשלחים מהשרת */
export function initSocketHandlers(io: SocketIOServer): void {
  io.on("connection", (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });
}
