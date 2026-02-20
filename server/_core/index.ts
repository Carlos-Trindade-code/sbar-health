import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

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

// All tables in dependency order (children before parents) so FK constraints
// don't block the drops.
const ALL_TABLES = [
  "support_tickets",
  "push_subscriptions",
  "notifications",
  "subscriptions",
  "activity_logs",
  "ai_predictions",
  "evolutions",
  "admissions",
  "patients",
  "hospital_admins",
  "team_invites",
  "team_members",
  "team_hospitals",
  "teams",
  "hospitals",
  "hospital_networks",
  "users",
];

async function dropAllTables(connection: mysql.Connection) {
  console.log("[DB] Dropping all tables...");
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const table of ALL_TABLES) {
    await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
    console.log(`[DB] Dropped: ${table}`);
  }
  // Also drop drizzle's internal migrations tracking table so it re-applies all
  await connection.query("DROP TABLE IF EXISTS `__drizzle_migrations`");
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
  console.log("[DB] All tables dropped");
}

async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[DB] DATABASE_URL is not set — skipping migrations");
    return;
  }
  const masked = url.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
  console.log("[DB] Running migrations, connecting to:", masked);

  // Use a dedicated single connection for migrations (separate from the app pool).
  let connection: mysql.Connection | undefined;
  try {
    connection = await mysql.createConnection(url);
    console.log("[DB] Migration connection established");

    if (process.env.NODE_ENV === "production" && process.env.RESET_DB === "true") {
      await dropAllTables(connection);
    }

    const migrationDb = drizzle(connection);
    const migrationsFolder = path.resolve(process.cwd(), "drizzle");
    console.log("[DB] Migrations folder:", migrationsFolder);
    await migrate(migrationDb, { migrationsFolder });
    console.log("[DB] Migrations applied successfully");
  } catch (err) {
    console.error("[DB] Migration FAILED:", err);
  } finally {
    if (connection) {
      await connection.end().catch(() => {});
      console.log("[DB] Migration connection closed");
    }
  }
}

async function startServer() {
  console.log("=== SERVER STARTUP ===");
  console.log("PORT env:", process.env.PORT);
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("======================");
  await runMigrations();
  const app = express();
  // Trust Railway's reverse proxy so req.ip, req.protocol and
  // req.hostname reflect the real client values.
  app.set("trust proxy", 1);
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
