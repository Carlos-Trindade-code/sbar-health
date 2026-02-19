import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

export function registerOAuthRoutes(app: Express) {
  // Confirm the routes are registered
  console.log("[Auth] Registering POST /api/auth/register and /api/auth/login");

  // POST /api/auth/register — Cria conta com email + senha
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    console.log("[Register] Request received");
    console.log("[Register] Content-Type:", req.headers["content-type"]);
    console.log("[Register] Body:", JSON.stringify({ ...req.body, password: "[REDACTED]" }));

    try {
      const { name, email, password } = req.body ?? {};

      if (!name || !email || !password) {
        console.log("[Register] Validation failed: missing fields", { name: !!name, email: !!email, password: !!password });
        res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
        return;
      }
      if (password.length < 8) {
        console.log("[Register] Validation failed: password too short");
        res.status(400).json({ error: "Senha deve ter ao menos 8 caracteres" });
        return;
      }

      console.log("[Register] Checking existing user for email:", email);
      const existing = await db.getUserByEmail(email);
      if (existing) {
        console.log("[Register] Email already in use");
        res.status(409).json({ error: "Este email já está cadastrado" });
        return;
      }

      console.log("[Register] Hashing password...");
      const passwordHash = await bcrypt.hash(password, 12);
      const openId = nanoid(21);
      const role: "admin" | "user" =
        ENV.adminEmail && email === ENV.adminEmail ? "admin" : "user";

      console.log("[Register] Saving user to DB, openId:", openId, "role:", role);
      await db.upsertUser({
        openId,
        name,
        email,
        passwordHash,
        loginMethod: "email",
        role,
        lastSignedIn: new Date(),
      });
      console.log("[Register] User saved successfully");

      console.log("[Register] Creating session token...");
      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = {
        ...getSessionCookieOptions(req),
        maxAge: ONE_YEAR_MS,
      };
      console.log("[Register] Setting cookie:", COOKIE_NAME, "options:", JSON.stringify(cookieOptions));
      res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

      console.log("[Register] Sending success response");
      res.json({ success: true });
    } catch (error) {
      console.error("[Register] FAILED:", error);
      res.status(500).json({ error: "Erro interno ao criar conta" });
    }
  });

  // POST /api/auth/login — Login com email + senha
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    console.log("[Login] Request received for email:", req.body?.email);
    try {
      const { email, password } = req.body ?? {};

      if (!email || !password) {
        res.status(400).json({ error: "Email e senha são obrigatórios" });
        return;
      }

      console.log("[Login] Looking up user...");
      const user = await db.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        console.log("[Login] User not found or no passwordHash");
        res.status(401).json({ error: "Email ou senha incorretos" });
        return;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        console.log("[Login] Wrong password");
        res.status(401).json({ error: "Email ou senha incorretos" });
        return;
      }

      db.upsertUser({ openId: user.openId, lastSignedIn: new Date() }).catch(() => {});

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = {
        ...getSessionCookieOptions(req),
        maxAge: ONE_YEAR_MS,
      };
      console.log("[Login] Setting cookie, options:", JSON.stringify(cookieOptions));
      res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("[Login] FAILED:", error);
      res.status(500).json({ error: "Erro interno ao fazer login" });
    }
  });
}
