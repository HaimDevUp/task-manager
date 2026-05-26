import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { createServer } from "http";
import { parse } from "url";
import next from "next";

// טוען .env / .env.local לפני Next (חשוב ל-custom server)
loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });
import { Server as SocketIOServer } from "socket.io";
import { setIO } from "./src/lib/io";
import { initSocketHandlers } from "./src/sockets/handlers";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request", err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://${hostname}:${port}`,
      methods: ["GET", "POST"],
    },
  });

  setIO(io);
  initSocketHandlers(io);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io path: /api/socketio`);
  });
});
