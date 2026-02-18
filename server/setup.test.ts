import { describe, it, expect, vi, beforeEach } from "vitest";
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
  getHospitalById: vi.fn(() => Promise.resolve({ id: 1, name: "Hospital Demo" })),
  searchHospitals: vi.fn(() => Promise.resolve([])),
  getPreRegisteredHospitals: vi.fn(() => Promise.resolve([])),
  getHospitalsByNetwork: vi.fn(() => Promise.resolve([])),
  updateHospital: vi.fn(() => Promise.resolve()),
  deleteHospital: vi.fn(() => Promise.resolve()),
  linkUserToHospital: vi.fn(() => Promise.resolve()),
  createTeam: vi.fn(() => Promise.resolve(1)),
  getTeamsByUser: vi.fn(() => Promise.resolve([])),
  getTeamsByHospital: vi.fn(() => Promise.resolve([])),
  addTeamMember: vi.fn(() => Promise.resolve()),
  addTeamHospital: vi.fn(() => Promise.resolve(1)),
  removeTeamHospital: vi.fn(() => Promise.resolve()),
  getTeamHospitals: vi.fn(() => Promise.resolve([])),
  getTeamMembers: vi.fn(() => Promise.resolve([])),
  updateTeam: vi.fn(() => Promise.resolve()),
  deleteTeam: vi.fn(() => Promise.resolve()),
  createPatient: vi.fn(() => Promise.resolve(1)),
  getPatientById: vi.fn(() => Promise.resolve({ id: 1, name: "Maria Silva" })),
  searchPatients: vi.fn(() => Promise.resolve([])),
  checkDuplicatePatient: vi.fn(() => Promise.resolve([])),
  createAdmission: vi.fn(() => Promise.resolve(1)),
  getAdmissionById: vi.fn(() => Promise.resolve(null)),
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
  getAiUsageCount: vi.fn(() => Promise.resolve(0)),
  updatePatient: vi.fn(() => Promise.resolve()),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "doctor@hospital.com",
    name: "Dr. Carlos",
    loginMethod: "manus",
    role: "user",
    plan: "free",
    specialty: "Cardiologia",
    crm: "123456-SP",
    phone: null,
    cpf: null,
    professionalType: "medico",
    councilType: "CRM",
    councilNumber: "123456",
    councilState: "SP",
    rqeNumber: null,
    rqeSpecialty: null,
    university: null,
    graduationYear: null,
    enrollmentNumber: null,
    institutionalRole: null,
    verificationStatus: "unverified",
    verificationDate: null,
    verificationNotes: null,
    documentUrl: null,
    avatarUrl: null,
    preferredLanguage: "pt-BR",
    onboardingCompleted: false,
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

describe("Setup & Onboarding Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("teams.quickSetup - Personal Mode", () => {
    it("should create personal team with existing hospital", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const db = await import("./db");

      const result = await caller.teams.quickSetup({
        mode: "personal",
        hospitalId: 1,
      });

      expect(result).toHaveProperty("teamId");
      expect(result).toHaveProperty("hospitalId");
      expect(result.hospitalId).toBe(1);
      
      // Should create team with isPersonal: true
      expect(db.createTeam).toHaveBeenCalledWith(
        expect.objectContaining({
          isPersonal: true,
          leaderId: 1,
        })
      );
      
      // Should add team member
      expect(db.addTeamMember).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          role: "admin",
          isCreator: true,
        })
      );
      
      // Should link hospital
      expect(db.addTeamHospital).toHaveBeenCalled();
      
      // Should complete onboarding
      expect(db.completeOnboarding).toHaveBeenCalledWith(1);
    });

    it("should create personal team with new hospital", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const db = await import("./db");

      const result = await caller.teams.quickSetup({
        mode: "personal",
        newHospitalName: "Hospital São Lucas",
        newHospitalCity: "São Paulo",
        newHospitalState: "SP",
        newHospitalType: "private",
      });

      expect(result).toHaveProperty("teamId");
      expect(result).toHaveProperty("hospitalId");
      
      // Should create hospital
      expect(db.createHospital).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Hospital São Lucas",
          city: "São Paulo",
          state: "SP",
          type: "private",
        })
      );
      
      // Should create personal team
      expect(db.createTeam).toHaveBeenCalledWith(
        expect.objectContaining({
          isPersonal: true,
        })
      );
    });
  });

  describe("teams.quickSetup - Team Mode", () => {
    it("should create named team with existing hospital", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const db = await import("./db");

      const result = await caller.teams.quickSetup({
        mode: "team",
        hospitalId: 1,
        teamName: "Equipe UTI Adulto",
      });

      expect(result).toHaveProperty("teamId");
      expect(result.hospitalId).toBe(1);
      
      // Should create team with isPersonal: false
      expect(db.createTeam).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Equipe UTI Adulto",
          isPersonal: false,
          leaderId: 1,
        })
      );
    });

    it("should use default team name if not provided", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const db = await import("./db");

      await caller.teams.quickSetup({
        mode: "team",
        hospitalId: 1,
      });

      expect(db.createTeam).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Minha Equipe",
        })
      );
    });
  });

  describe("teams.quickSetup - Error Handling", () => {
    it("should fail when no hospital is provided or created", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.teams.quickSetup({
          mode: "personal",
          // No hospitalId and no newHospitalName
        })
      ).rejects.toThrow("Selecione ou cadastre um hospital");
    });
  });

  describe("teams.createPersonal", () => {
    it("should create personal team linked to hospital", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const db = await import("./db");

      const result = await caller.teams.createPersonal({
        hospitalId: 1,
      });

      expect(result).toHaveProperty("id");
      
      // Should create team with isPersonal: true
      expect(db.createTeam).toHaveBeenCalledWith(
        expect.objectContaining({
          isPersonal: true,
          leaderId: 1,
        })
      );
      
      // Should add member
      expect(db.addTeamMember).toHaveBeenCalled();
      
      // Should link hospital
      expect(db.addTeamHospital).toHaveBeenCalled();
    });

    it("should reuse existing personal team if one exists", async () => {
      const db = await import("./db");
      // Mock existing personal team
      (db.getTeamsByUser as any).mockResolvedValueOnce([
        { id: 5, name: "Equipe Carlos", isPersonal: true }
      ]);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.teams.createPersonal({
        hospitalId: 2,
      });

      expect(result.id).toBe(5);
      
      // Should NOT create a new team
      expect(db.createTeam).not.toHaveBeenCalled();
      
      // Should link the new hospital to existing team
      expect(db.addTeamHospital).toHaveBeenCalledWith(5, 2, true);
    });
  });
});
