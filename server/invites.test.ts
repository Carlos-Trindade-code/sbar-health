import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { TRPCError } from "@trpc/server";

// Mock db
vi.mock("./db", () => {
  const mockTeamMembers = [
    { userId: 1, role: "admin", isCreator: true },
  ];
  const mockInvite = {
    id: 1,
    teamId: 10,
    inviteCode: "SBAR-TEST1234",
    email: "test@hospital.com",
    invitedById: 1,
    suggestedRole: "editor",
    status: "pending",
    acceptedById: null,
    acceptedRole: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockTeams = [
    { id: 10, name: "Equipe Teste", isPersonal: false },
  ];

  return {
    getTeamMembers: vi.fn().mockResolvedValue(mockTeamMembers),
    createTeamInvite: vi.fn().mockResolvedValue(1),
    getTeamInviteByCode: vi.fn().mockResolvedValue(mockInvite),
    getTeamInvitesByTeam: vi.fn().mockResolvedValue([mockInvite]),
    acceptTeamInvite: vi.fn().mockResolvedValue(true),
    revokeTeamInvite: vi.fn().mockResolvedValue(true),
    addTeamMember: vi.fn().mockResolvedValue(undefined),
    getTeamsByUser: vi.fn().mockResolvedValue(mockTeams),
    logActivity: vi.fn().mockResolvedValue(undefined),
    // Other mocks needed by routers
    getDb: vi.fn().mockResolvedValue({}),
    getUserHospitals: vi.fn().mockResolvedValue([]),
    getHospitalsByAdmin: vi.fn().mockResolvedValue([]),
    getTeamsByHospital: vi.fn().mockResolvedValue([]),
    createTeam: vi.fn().mockResolvedValue(1),
    createHospital: vi.fn().mockResolvedValue(1),
    addTeamHospital: vi.fn().mockResolvedValue(undefined),
    completeOnboarding: vi.fn().mockResolvedValue(undefined),
    updateTeam: vi.fn().mockResolvedValue(undefined),
    deleteTeam: vi.fn().mockResolvedValue(undefined),
    removeTeamHospital: vi.fn().mockResolvedValue(undefined),
    getTeamHospitals: vi.fn().mockResolvedValue([]),
    unlinkUserFromHospital: vi.fn().mockResolvedValue(true),
    createPatient: vi.fn().mockResolvedValue(1),
    getPatientById: vi.fn().mockResolvedValue(null),
    getPatientsByTeam: vi.fn().mockResolvedValue([]),
    createAdmission: vi.fn().mockResolvedValue(1),
    getAdmissionsByTeam: vi.fn().mockResolvedValue([]),
    getAdmissionsByHospital: vi.fn().mockResolvedValue([]),
    getAdmissionById: vi.fn().mockResolvedValue(null),
    createEvolution: vi.fn().mockResolvedValue(1),
    getEvolutionsByAdmission: vi.fn().mockResolvedValue([]),
    getLatestEvolutionByAdmission: vi.fn().mockResolvedValue(null),
    updateEvolution: vi.fn().mockResolvedValue(undefined),
    getAiCreditsUsedToday: vi.fn().mockResolvedValue(0),
    getActiveAdmissionCount: vi.fn().mockResolvedValue(0),
    getActiveTeamCount: vi.fn().mockResolvedValue(0),
    checkDuplicatePatient: vi.fn().mockResolvedValue([]),
    checkBatchDuplicates: vi.fn().mockResolvedValue([]),
    updateAdmission: vi.fn().mockResolvedValue(undefined),
    updatePatient: vi.fn().mockResolvedValue(undefined),
    getAdmissionsByPatient: vi.fn().mockResolvedValue([]),
    searchPatients: vi.fn().mockResolvedValue([]),
    getNotifications: vi.fn().mockResolvedValue([]),
    markNotificationRead: vi.fn().mockResolvedValue(undefined),
    createNotification: vi.fn().mockResolvedValue(1),
    getUnreadNotificationCount: vi.fn().mockResolvedValue(0),
    getPushSubscriptionsByUser: vi.fn().mockResolvedValue([]),
    savePushSubscription: vi.fn().mockResolvedValue(1),
    removePushSubscription: vi.fn().mockResolvedValue(undefined),
    updatePushSubscriptionLastUsed: vi.fn().mockResolvedValue(undefined),
    getMultipleUsersPushSubscriptions: vi.fn().mockResolvedValue([]),
  };
});

function createAuthContext(userId = 1) {
  return {
    user: {
      id: userId,
      openId: `test-open-id-${userId}`,
      name: "Dr. Teste",
      email: "teste@hospital.com",
      role: "user" as const,
      plan: "free" as const,
      createdAt: new Date("2025-01-01"),
      onboardingCompleted: true,
    },
  };
}

const caller = appRouter.createCaller(createAuthContext(1));
const publicCaller = appRouter.createCaller({ user: null });

describe("Team Invites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createInvite", () => {
    it("should create an invite with a generated code", async () => {
      const result = await caller.teams.createInvite({
        teamId: 10,
        suggestedRole: "editor",
      });
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("code");
      expect(result.code).toMatch(/^SBAR-/);
      expect(result.code.length).toBe(13); // SBAR- + 8 chars
    });

    it("should create an invite with email", async () => {
      const result = await caller.teams.createInvite({
        teamId: 10,
        email: "novo@hospital.com",
        suggestedRole: "reader",
      });
      expect(result).toHaveProperty("code");
    });

    it("should reject non-admin users", async () => {
      const db = await import("./db");
      (db.getTeamMembers as any).mockResolvedValueOnce([
        { userId: 1, role: "reader", isCreator: false },
      ]);

      await expect(
        caller.teams.createInvite({ teamId: 10, suggestedRole: "editor" })
      ).rejects.toThrow("administradores");
    });
  });

  describe("getInvite", () => {
    it("should return invite details for valid code (public)", async () => {
      const result = await publicCaller.teams.getInvite({ code: "SBAR-TEST1234" });
      expect(result).toHaveProperty("teamId", 10);
      expect(result).toHaveProperty("teamName", "Equipe Teste");
      expect(result).toHaveProperty("suggestedRole", "editor");
    });

    it("should throw for non-existent code", async () => {
      const db = await import("./db");
      (db.getTeamInviteByCode as any).mockResolvedValueOnce(null);

      await expect(
        publicCaller.teams.getInvite({ code: "INVALID" })
      ).rejects.toThrow("não encontrado");
    });

    it("should throw for expired invite", async () => {
      const db = await import("./db");
      (db.getTeamInviteByCode as any).mockResolvedValueOnce({
        id: 1,
        teamId: 10,
        inviteCode: "SBAR-EXPIRED1",
        invitedById: 1,
        suggestedRole: "editor",
        status: "pending",
        expiresAt: new Date("2020-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        publicCaller.teams.getInvite({ code: "SBAR-EXPIRED1" })
      ).rejects.toThrow("expirado");
    });
  });

  describe("acceptInvite", () => {
    it("should accept a valid invite", async () => {
      const db = await import("./db");
      // User 2 accepting (not already a member)
      (db.getTeamMembers as any).mockResolvedValueOnce([]); // For acceptInvite check
      const caller2 = appRouter.createCaller(createAuthContext(2));

      const result = await caller2.teams.acceptInvite({ code: "SBAR-TEST1234" });
      expect(result).toHaveProperty("teamId", 10);
      expect(result).toHaveProperty("role", "editor");
    });

    it("should reject if already a member", async () => {
      const db = await import("./db");
      (db.getTeamMembers as any).mockResolvedValueOnce([
        { userId: 1, role: "admin" },
      ]);

      await expect(
        caller.teams.acceptInvite({ code: "SBAR-TEST1234" })
      ).rejects.toThrow("já é membro");
    });
  });

  describe("listInvites", () => {
    it("should list invites for a team", async () => {
      const result = await caller.teams.listInvites({ teamId: 10 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("revokeInvite", () => {
    it("should revoke an invite", async () => {
      const result = await caller.teams.revokeInvite({ inviteId: 1 });
      expect(result).toHaveProperty("success", true);
    });
  });
});
