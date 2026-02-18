import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

export function registerOAuthRoutes(app: Express) {
  // POST /api/auth/register — Cria conta com email + senha
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body ?? {};

      if (!name || !email || !password) {
        res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
        return;
      }
      if (password.length < 8) {
        res.status(400).json({ error: "Senha deve ter ao menos 8 caracteres" });
        return;
      }

      const existing = await db.getUserByEmail(email);
      if (existing) {
        res.status(409).json({ error: "Este email já está cadastrado" });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const openId = nanoid(21);
      const role: "admin" | "user" =
        ENV.adminEmail && email === ENV.adminEmail ? "admin" : "user";

      await db.upsertUser({
        openId,
        name,
        email,
        passwordHash,
        loginMethod: "email",
        role,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });
      res.cookie(COOKIE_NAME, sessionToken, {
        ...getSessionCookieOptions(req),
        maxAge: ONE_YEAR_MS,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      res.status(500).json({ error: "Erro interno ao criar conta" });
    }
  });

  // POST /api/auth/login — Login com email + senha
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body ?? {};

      if (!email || !password) {
        res.status(400).json({ error: "Email e senha são obrigatórios" });
        return;
      }

      const user = await db.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Email ou senha incorretos" });
        return;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Email ou senha incorretos" });
        return;
      }

      db.upsertUser({ openId: user.openId, lastSignedIn: new Date() }).catch(() => {});

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      res.cookie(COOKIE_NAME, sessionToken, {
        ...getSessionCookieOptions(req),
        maxAge: ONE_YEAR_MS,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Erro interno ao fazer login" });
    }
  });
}
