import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isLocalRequest(req: Request) {
  return LOCAL_HOSTS.has(req.hostname);
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "httpOnly" | "path" | "sameSite" | "secure"> {
  const isLocal = isLocalRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // "lax" is correct for same-domain apps (frontend + API on same host).
    // "none" requires Secure=true and is for cross-site embeds — not needed here.
    sameSite: "lax",
    // In production the app is always behind HTTPS (Railway terminates SSL).
    // Locally, secure:false so the browser accepts the cookie over http://localhost.
    secure: !isLocal,
  };
}
