import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleMegaEthRpc } from "./routes/megaeth-rpc";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // RPC proxy (avoids browser CORS limits against MegaETH RPC)
  app.post("/api/megaeth-rpc", handleMegaEthRpc);

  // Legacy: also expose /api/monad-rpc so deployed Netlify function and frontend can use a stable path
  app.post("/api/monad-rpc", handleMegaEthRpc);

  return app;
}
