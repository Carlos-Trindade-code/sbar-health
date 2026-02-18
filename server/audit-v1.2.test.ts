import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createUnauthContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("profile.planStats", () => {
  it("returns plan stats for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.profile.planStats();
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty("activePatients");
    expect(result).toHaveProperty("maxPatients");
    expect(result).toHaveProperty("aiUsed");
    expect(result).toHaveProperty("maxAi");
    expect(result).toHaveProperty("plan");
    expect(typeof result.activePatients).toBe("number");
    expect(typeof result.maxPatients).toBe("number");
    expect(typeof result.aiUsed).toBe("number");
    expect(typeof result.maxAi).toBe("number");
    expect(result.activePatients).toBeGreaterThanOrEqual(0);
    // maxPatients can be -1 (unlimited) during trial
    expect(result.maxPatients === -1 || result.maxPatients > 0).toBe(true);
    expect(result.aiUsed).toBeGreaterThanOrEqual(0);
    // maxAi can be -1 (unlimited) during trial
    expect(result.maxAi === -1 || result.maxAi > 0).toBe(true);
  });

  it("rejects unauthenticated access", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.profile.planStats()).rejects.toThrow();
  });
});

describe("admissions.byPatient", () => {
  it("returns admissions for a given patient ID", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    // Use a non-existent patient ID to test the empty case
    const result = await caller.admissions.byPatient({ patientId: 999999 });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("rejects unauthenticated access", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.admissions.byPatient({ patientId: 1 })).rejects.toThrow();
  });
});

describe("patients.get", () => {
  it("returns null for non-existent patient", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.patients.get({ id: 999999 });
    
    expect(result).toBeUndefined();
  });

  it("rejects unauthenticated access", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.patients.get({ id: 1 })).rejects.toThrow();
  });
});

describe("evolutions.byAdmission", () => {
  it("returns empty array for non-existent admission", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.evolutions.byAdmission({ admissionId: 999999 });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("rejects unauthenticated access", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.evolutions.byAdmission({ admissionId: 1 })).rejects.toThrow();
  });
});

describe("admissions.discharge", () => {
  it("rejects unauthenticated access", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.admissions.discharge({ 
      admissionId: 1, 
      dischargeType: "improved" 
    })).rejects.toThrow();
  });
});

describe("admissions.archive", () => {
  it("rejects unauthenticated access", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.admissions.archive({ 
      admissionId: 1 
    })).rejects.toThrow();
  });
});
