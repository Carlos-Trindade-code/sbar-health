import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getDb } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[DB] ERROR: DATABASE_URL is not set — skipping migrations");
    return;
  }
  const masked = url.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
  console.log("[DB] Connecting to:", masked);
  try {
    const db = await getDb();
    if (!db) {
      console.error("[DB] ERROR: getDb() returned null");
      return;
    }
    await db.execute(sql`SELECT 1`);
    console.log("[DB] Connection OK");
    // Resolve migrations folder relative to the running file
    const migrationsFolder = path.resolve(import.meta.dirname, "../../drizzle");
    console.log("[DB] Running migrations from:", migrationsFolder);
    await migrate(db as any, { migrationsFolder });
    console.log("[DB] Migrations applied successfully");
  } catch (err) {
    console.error("[DB] Migration FAILED:", err);
  }
}

async function startServer() {
  console.log("=== SERVER STARTUP ===");
  console.log("PORT env:", process.env.PORT);
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("======================");
  await runMigrations();
  const app = express();
  const server = createServer(app);
  // Simple health endpoint for Railway healthcheck (before tRPC)
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Auth routes
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  let port: number;
  if (process.env.NODE_ENV === "production") {
    port = parseInt(process.env.PORT || "8080");
  } else {
    const preferredPort = parseInt(process.env.PORT || "3000");
    port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
