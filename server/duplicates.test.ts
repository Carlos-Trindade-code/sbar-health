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
  getHospitals: vi.fn(() => Promise.resolve([])),
  getHospitalById: vi.fn(() => Promise.resolve({ id: 1, name: "Hospital Demo" })),
  searchHospitals: vi.fn(() => Promise.resolve([])),
  getPreRegisteredHospitals: vi.fn(() => Promise.resolve([])),
  getHospitalsByNetwork: vi.fn(() => Promise.resolve([])),
  updateHospital: vi.fn(() => Promise.resolve()),
  deleteHospital: vi.fn(() => Promise.resolve()),
  linkUserToHospital: vi.fn(() => Promise.resolve()),
  getUserHospitals: vi.fn(() => Promise.resolve([])),
  unlinkUserFromHospital: vi.fn(() => Promise.resolve()),
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
  checkBatchDuplicates: vi.fn(() => Promise.resolve([])),
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
  getHospitalsByAdmin: vi.fn(() => Promise.resolve([])),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn(() => Promise.resolve({ key: "test-key", url: "https://storage.example.com/test.pdf" })),
  storageGet: vi.fn(() => Promise.resolve({ key: "test-key", url: "https://storage.example.com/test.pdf" })),
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
    onboardingCompleted: true,
    trialEndsAt: null,
    createdAt: new Date("2024-01-01"),
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

describe("Duplicate Detection - v2.20.0", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkBatchDuplicates procedure", () => {
    it("should call checkBatchDuplicates with the provided names", async () => {
      const db = await import("./db");
      (db.checkBatchDuplicates as any).mockResolvedValueOnce([]);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patients.checkBatchDuplicates({
        names: ["Maria Silva", "João Santos", "Ana Oliveira"],
      });

      expect(db.checkBatchDuplicates).toHaveBeenCalledWith(["Maria Silva", "João Santos", "Ana Oliveira"]);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return duplicate matches when found", async () => {
      const db = await import("./db");
      (db.checkBatchDuplicates as any).mockResolvedValueOnce([
        {
          inputName: "Maria Silva",
          matches: [
            { id: 5, name: "Maria da Silva Santos", cpf: "123.456.789-00", birthDate: new Date("1980-05-15") },
          ],
        },
      ]);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patients.checkBatchDuplicates({
        names: ["Maria Silva", "João Santos"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].inputName).toBe("Maria Silva");
      expect(result[0].matches).toHaveLength(1);
      expect(result[0].matches[0].id).toBe(5);
      expect(result[0].matches[0].name).toBe("Maria da Silva Santos");
    });

    it("should return empty array when no duplicates found", async () => {
      const db = await import("./db");
      (db.checkBatchDuplicates as any).mockResolvedValueOnce([]);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patients.checkBatchDuplicates({
        names: ["Paciente Novo Único"],
      });

      expect(result).toHaveLength(0);
    });

    it("should handle empty names array", async () => {
      const db = await import("./db");
      (db.checkBatchDuplicates as any).mockResolvedValueOnce([]);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patients.checkBatchDuplicates({
        names: [],
      });

      expect(result).toHaveLength(0);
    });

    it("should handle multiple duplicates from same import", async () => {
      const db = await import("./db");
      (db.checkBatchDuplicates as any).mockResolvedValueOnce([
        {
          inputName: "Maria Silva",
          matches: [
            { id: 5, name: "Maria da Silva", cpf: null, birthDate: null },
          ],
        },
        {
          inputName: "João Santos",
          matches: [
            { id: 10, name: "João Pedro Santos", cpf: "987.654.321-00", birthDate: new Date("1975-03-20") },
            { id: 12, name: "João Santos Filho", cpf: null, birthDate: null },
          ],
        },
      ]);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patients.checkBatchDuplicates({
        names: ["Maria Silva", "João Santos", "Ana Oliveira"],
      });

      expect(result).toHaveLength(2);
      expect(result[0].inputName).toBe("Maria Silva");
      expect(result[0].matches).toHaveLength(1);
      expect(result[1].inputName).toBe("João Santos");
      expect(result[1].matches).toHaveLength(2);
    });

    it("should enforce max 100 names limit", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const tooManyNames = Array.from({ length: 101 }, (_, i) => `Paciente ${i}`);

      await expect(
        caller.patients.checkBatchDuplicates({ names: tooManyNames })
      ).rejects.toThrow();
    });

    it("should require authentication", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
      };

      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.patients.checkBatchDuplicates({ names: ["Test"] })
      ).rejects.toThrow();
    });
  });

  describe("Duplicate detection logic (unit)", () => {
    it("should correctly identify duplicate by exact name match", () => {
      const duplicateResults = [
        { inputName: "Maria Silva", matches: [{ id: 1, name: "Maria Silva", cpf: null, birthDate: null }] },
      ];

      const isDuplicate = (name: string) =>
        duplicateResults.some(d => d.inputName.toLowerCase() === name.trim().toLowerCase());

      expect(isDuplicate("Maria Silva")).toBe(true);
      expect(isDuplicate("maria silva")).toBe(true);
      expect(isDuplicate("  Maria Silva  ")).toBe(true);
      expect(isDuplicate("João Santos")).toBe(false);
    });

    it("should correctly count duplicate selected patients", () => {
      const patients = [
        { name: "Maria Silva", selected: true },
        { name: "João Santos", selected: true },
        { name: "Ana Oliveira", selected: false },
        { name: "Pedro Lima", selected: true },
      ];

      const duplicateResults = [
        { inputName: "Maria Silva", matches: [{ id: 1, name: "Maria Silva", cpf: null, birthDate: null }] },
        { inputName: "Ana Oliveira", matches: [{ id: 2, name: "Ana Oliveira", cpf: null, birthDate: null }] },
      ];

      const isDuplicate = (name: string) =>
        duplicateResults.some(d => d.inputName.toLowerCase() === name.trim().toLowerCase());

      const duplicateSelectedCount = patients.filter(p => p.selected && isDuplicate(p.name)).length;

      // Maria Silva is selected and duplicate, Ana Oliveira is duplicate but not selected
      expect(duplicateSelectedCount).toBe(1);
    });

    it("should deselect all duplicates correctly", () => {
      const patients = [
        { name: "Maria Silva", selected: true },
        { name: "João Santos", selected: true },
        { name: "Ana Oliveira", selected: true },
      ];

      const duplicateResults = [
        { inputName: "Maria Silva", matches: [] },
        { inputName: "Ana Oliveira", matches: [] },
      ];

      const duplicateNames = new Set(duplicateResults.map(d => d.inputName.toLowerCase()));
      const updated = patients.map(p =>
        duplicateNames.has(p.name.trim().toLowerCase()) ? { ...p, selected: false } : p
      );

      expect(updated[0].selected).toBe(false); // Maria Silva - deselected
      expect(updated[1].selected).toBe(true);  // João Santos - kept
      expect(updated[2].selected).toBe(false); // Ana Oliveira - deselected
    });
  });
});
