import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve({})),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getUserById: vi.fn(),
  updateUserProfile: vi.fn(() => Promise.resolve()),
  completeOnboarding: vi.fn(() => Promise.resolve()),
  createHospital: vi.fn(() => Promise.resolve(1)),
  getHospitals: vi.fn(() => Promise.resolve([
    { id: 1, name: "Hospital Demo", code: "DEMO", type: "private", active: true }
  ])),
  getUserHospitals: vi.fn(() => Promise.resolve([
    { id: 1, name: "Hospital Demo", code: "DEMO", type: "private", active: true }
  ])),
  unlinkUserFromHospital: vi.fn(() => Promise.resolve()),
  getHospitalById: vi.fn(() => Promise.resolve({ id: 1, name: "Hospital Demo" })),
  createTeam: vi.fn(() => Promise.resolve(1)),
  getTeamsByUser: vi.fn(() => Promise.resolve([
    { id: 1, name: "Equipe Cardiologia", hospitalId: 1 }
  ])),
  getTeamsByHospital: vi.fn(() => Promise.resolve([])),
  addTeamMember: vi.fn(() => Promise.resolve()),
  addTeamHospital: vi.fn(() => Promise.resolve(1)),
  removeTeamHospital: vi.fn(() => Promise.resolve()),
  getTeamHospitals: vi.fn(() => Promise.resolve([])),
  getTeamMembers: vi.fn(() => Promise.resolve([])),
  createPatient: vi.fn(() => Promise.resolve(1)),
  getPatientById: vi.fn(() => Promise.resolve({ id: 1, name: "Maria Silva" })),
  searchPatients: vi.fn(() => Promise.resolve([])),
  checkDuplicatePatient: vi.fn(() => Promise.resolve([])),
  createAdmission: vi.fn(() => Promise.resolve(1)),
  getAdmissionById: vi.fn(() => Promise.resolve({
    id: 1,
    patientId: 1,
    hospitalId: 1,
    teamId: 1,
    bed: "UTI-01",
    priority: "medium",
    status: "active"
  })),
  getActiveAdmissionsByTeam: vi.fn(() => Promise.resolve([])),
  getActiveAdmissionsByHospital: vi.fn(() => Promise.resolve([])),
  updateAdmission: vi.fn(() => Promise.resolve()),
  dischargePatient: vi.fn(() => Promise.resolve()),
  createEvolution: vi.fn(() => Promise.resolve(1)),
  getEvolutionsByAdmission: vi.fn(() => Promise.resolve([])),
  getDraftEvolution: vi.fn(() => Promise.resolve(null)),
  updateEvolution: vi.fn(() => Promise.resolve()),
  saveDraft: vi.fn(() => Promise.resolve(1)),
  finalizeEvolution: vi.fn(() => Promise.resolve()),
  createAiPrediction: vi.fn(() => Promise.resolve(1)),
  getLatestPrediction: vi.fn(() => Promise.resolve(null)),
  logActivity: vi.fn(() => Promise.resolve()),
  getActivityLogs: vi.fn(() => Promise.resolve([])),
  getTeamProductivityStats: vi.fn(() => Promise.resolve(null)),
  getHospitalAnalytics: vi.fn(() => Promise.resolve(null)),
  getUserSubscription: vi.fn(() => Promise.resolve(null)),
  getActivePatientCount: vi.fn(() => Promise.resolve(0)),
  createNotification: vi.fn(() => Promise.resolve()),
  getUserNotifications: vi.fn(() => Promise.resolve([])),
  markNotificationRead: vi.fn(() => Promise.resolve()),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "doctor@hospital.com",
    name: "Dr. Test",
    loginMethod: "manus",
    role: "user",
    plan: "free",
    specialty: "Cardiologia",
    crm: "123456-SP",
    phone: null,
    avatarUrl: null,
    onboardingCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("SBAR Health - Core Functionality Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Profile Management", () => {
    it("should update user profile successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.profile.update({
        name: "Dr. Updated Name",
        specialty: "Pneumologia",
        crm: "654321-RJ",
      });

      expect(result).toEqual({ success: true });
    });

    it("should complete onboarding", async () => {
      const ctx = createAuthContext({ onboardingCompleted: false });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.profile.completeOnboarding();

      expect(result).toEqual({ success: true });
    });
  });

  describe("Hospital Management", () => {
    it("should list hospitals", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const hospitals = await caller.hospitals.list();

      // hospitals.list now returns only user-linked hospitals (may be 0 in test)
      expect(Array.isArray(hospitals)).toBe(true);
    });

    it("should create a new hospital", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.hospitals.create({
        name: "Hospital São Lucas",
        code: "HSL",
        type: "private",
      });

      expect(result).toHaveProperty("id");
      expect(result.id).toBe(1);
    });

    it("should get hospital by id", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const hospital = await caller.hospitals.get({ id: 1 });

      expect(hospital).toBeDefined();
      expect(hospital?.name).toBe("Hospital Demo");
    });
  });

  describe("Team Management", () => {
    it("should list user teams", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const teams = await caller.teams.list();

      expect(teams).toHaveLength(1);
      expect(teams[0].name).toBe("Equipe Cardiologia");
    });

    it("should create a new team", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.teams.create({
        name: "Equipe UTI",
        hospitalId: 1,
        specialty: "Intensivismo",
      });

      expect(result).toHaveProperty("id");
    });
  });

  describe("Patient Management", () => {
    it("should create a new patient", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patients.create({
        name: "João Silva",
        gender: "M",
      });

      expect(result).toHaveProperty("id");
      expect(result.id).toBe(1);
    });

    it("should get patient by id", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const patient = await caller.patients.get({ id: 1 });

      expect(patient).toBeDefined();
      expect(patient?.name).toBe("Maria Silva");
    });

    it("should search patients", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const results = await caller.patients.search({ query: "Maria" });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should check for duplicate patients", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const duplicates = await caller.patients.checkDuplicate({ 
        name: "Maria Silva",
        cpf: "123.456.789-00"
      });

      expect(Array.isArray(duplicates)).toBe(true);
    });
  });

  describe("Admission Management", () => {
    it("should create a new admission", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.admissions.create({
        patientId: 1,
        hospitalId: 1,
        teamId: 1,
        bed: "UTI-01",
        priority: "high",
        mainDiagnosis: "Pneumonia",
      });

      expect(result).toHaveProperty("id");
    });

    it("should get admission by id", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const admission = await caller.admissions.get({ id: 1 });

      expect(admission).toBeDefined();
      expect(admission?.bed).toBe("UTI-01");
    });

    it("should update admission priority", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.admissions.update({
        id: 1,
        priority: "critical",
      });

      expect(result).toEqual({ success: true });
    });

    it("should discharge patient", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.admissions.discharge({
        id: 1,
        dischargeType: "improved",
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("Evolution (SBAR) Management", () => {
    it("should get evolutions by admission", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const evolutions = await caller.evolutions.byAdmission({ admissionId: 1 });

      expect(Array.isArray(evolutions)).toBe(true);
    });

    it("should save draft evolution", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.evolutions.saveDraft({
        admissionId: 1,
        situation: "Paciente estável",
        background: "Internado há 3 dias",
        assessment: "Melhora clínica",
        recommendation: "Manter tratamento",
      });

      expect(result).toHaveProperty("id");
    });

    it("should finalize evolution", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.evolutions.finalize({
        admissionId: 1,
        situation: "Paciente estável, afebril",
        background: "Pneumonia comunitária, D4 de antibiótico",
        assessment: "Boa evolução clínica",
        recommendation: "Alta hospitalar amanhã",
      });

      expect(result).toHaveProperty("id");
    });
  });

  describe("Notifications", () => {
    it("should list user notifications", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const notifications = await caller.notifications.list();

      expect(Array.isArray(notifications)).toBe(true);
    });

    it("should mark notification as read", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.markRead({ id: 1 });

      expect(result).toEqual({ success: true });
    });
  });

  describe("Authentication", () => {
    it("should return current user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const user = await caller.auth.me();

      expect(user).toBeDefined();
      expect(user?.name).toBe("Dr. Test");
      expect(user?.specialty).toBe("Cardiologia");
    });

    it("should logout successfully", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
    });
  });
});

describe("Plan Limits", () => {
  it("should enforce free plan patient limit", async () => {
    // Mock to return 10 active patients (free plan limit)
    const db = await import("./db");
    vi.mocked(db.getActivePatientCount).mockResolvedValue(10);

    // Set createdAt to 60 days ago so trial is expired
    const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const ctx = createAuthContext({ plan: "free", createdAt: oldDate, trialEndsAt: oldDate } as any);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admissions.create({
      patientId: 1,
      hospitalId: 1,
      teamId: 1,
      bed: "UTI-02",
      priority: "medium",
    })).rejects.toThrow("Limite de 10 pacientes ativos atingido");
  });

  it("should allow pro plan with more patients", async () => {
    const db = await import("./db");
    vi.mocked(db.getActivePatientCount).mockResolvedValue(50);

    const ctx = createAuthContext({ plan: "pro" });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admissions.create({
      patientId: 1,
      hospitalId: 1,
      teamId: 1,
      bed: "UTI-02",
      priority: "medium",
    });

    expect(result).toHaveProperty("id");
  });
});
