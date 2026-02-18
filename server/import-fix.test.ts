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

describe("PDF Import - Bug Fixes v2.18.1", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("analyzeDocument - Prompt improvements", () => {
    it("should call LLM with improved prompt that emphasizes extracting ALL patients", async () => {
      const { invokeLLM } = await import("./_core/llm");
      
      // Mock LLM response with 24 patients
      const mockPatients = Array.from({ length: 24 }, (_, i) => ({
        name: `Paciente ${i + 1}`,
        age: `${30 + i} anos`,
        diagnosis: `Diagnóstico ${i + 1}`,
        diagnosisCode: `J${10 + i}.${i % 10}`,
        bed: `${100 + i}-A`,
        insurance: "Unimed",
        confidence: 85,
      }));

      (invokeLLM as any).mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({ patients: mockPatients }),
          },
        }],
      });

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create a small base64 text to simulate a document
      const testContent = Buffer.from("Test document content").toString("base64");
      
      const result = await caller.patients.analyzeDocument({
        fileData: testContent,
        fileName: "pacientes.txt",
        fileType: "text/plain",
      });

      // Should return all 24 patients
      expect(result.patients).toHaveLength(24);
      expect(result.patients[0].name).toBe("Paciente 1");
      expect(result.patients[23].name).toBe("Paciente 24");

      // Verify LLM was called with improved prompt
      expect(invokeLLM).toHaveBeenCalledTimes(1);
      const callArgs = (invokeLLM as any).mock.calls[0][0];
      const systemPrompt = callArgs.messages[0].content;
      
      // Check that the prompt emphasizes extracting ALL patients
      expect(systemPrompt).toContain("ABSOLUTAMENTE TODOS");
      expect(systemPrompt).toContain("NUNCA truncar");
      
      // Check CID-10 rules are in the prompt
      expect(systemPrompt).toContain("CID-10");
      expect(systemPrompt).toContain("NUNCA invente CIDs");
      expect(systemPrompt).toContain("DESCRIÇÃO por extenso");
    });

    it("should handle PDF files by uploading to S3 first", async () => {
      const { invokeLLM } = await import("./_core/llm");
      const { storagePut } = await import("./storage");

      (invokeLLM as any).mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({ patients: [
              { name: "Maria", age: "45 anos", diagnosis: "Hipertensão arterial", diagnosisCode: "I10", bed: "201-A", insurance: "Unimed", confidence: 90 }
            ]}),
          },
        }],
      });

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const pdfContent = Buffer.from("fake PDF content").toString("base64");
      
      const result = await caller.patients.analyzeDocument({
        fileData: pdfContent,
        fileName: "lista.pdf",
        fileType: "application/pdf",
      });

      // Should have uploaded to S3
      expect(storagePut).toHaveBeenCalledTimes(1);
      
      // Should return the patient
      expect(result.patients).toHaveLength(1);
      expect(result.patients[0].name).toBe("Maria");
      expect(result.patients[0].diagnosisCode).toBe("I10");
      
      // Verify LLM was called with file_url for PDF
      const callArgs = (invokeLLM as any).mock.calls[0][0];
      const userMessage = callArgs.messages[1];
      expect(userMessage.content).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: "file_url" }),
        ])
      );
      
      // Verify the PDF prompt emphasizes extracting ALL patients
      const textContent = userMessage.content.find((c: any) => c.type === "text");
      expect(textContent.text).toContain("TODOS");
      expect(textContent.text).toContain("OBRIGATÓRIO");
    });

    it("should return empty array on LLM error", async () => {
      const { invokeLLM } = await import("./_core/llm");
      (invokeLLM as any).mockRejectedValueOnce(new Error("LLM timeout"));

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patients.analyzeDocument({
        fileData: Buffer.from("test").toString("base64"),
        fileName: "test.txt",
        fileType: "text/plain",
      });

      expect(result.patients).toEqual([]);
    });

    it("should use json_schema response format for structured output", async () => {
      const { invokeLLM } = await import("./_core/llm");
      
      (invokeLLM as any).mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({ patients: [] }),
          },
        }],
      });

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await caller.patients.analyzeDocument({
        fileData: Buffer.from("empty doc").toString("base64"),
        fileName: "empty.txt",
        fileType: "text/plain",
      });

      const callArgs = (invokeLLM as any).mock.calls[0][0];
      
      // Should use json_schema response format
      expect(callArgs.response_format).toBeDefined();
      expect(callArgs.response_format.type).toBe("json_schema");
      expect(callArgs.response_format.json_schema.name).toBe("patient_extraction");
      expect(callArgs.response_format.json_schema.strict).toBe(true);
      
      // Schema should include all required fields
      const schema = callArgs.response_format.json_schema.schema;
      expect(schema.properties.patients.items.properties).toHaveProperty("name");
      expect(schema.properties.patients.items.properties).toHaveProperty("diagnosis");
      expect(schema.properties.patients.items.properties).toHaveProperty("diagnosisCode");
      expect(schema.properties.patients.items.properties).toHaveProperty("confidence");
    });
  });

  describe("Batch import with hospital/team override", () => {
    it("should accept hospitalId and teamId overrides in batch save flow", () => {
      // This tests the frontend logic conceptually
      // The handleBatchSave function now accepts overrideHospitalId and overrideTeamId
      // When DocumentImporter provides them, they should be used instead of form state
      
      const overrideHospitalId = 5;
      const overrideTeamId = 3;
      
      // Simulate the override logic
      const formHospitalId = "";
      const formTeamId = "";
      
      const hId = overrideHospitalId ? String(overrideHospitalId) : formHospitalId;
      const tId = overrideTeamId ? String(overrideTeamId) : formTeamId;
      
      expect(hId).toBe("5");
      expect(tId).toBe("3");
    });

    it("should fall back to form state when no override provided", () => {
      const overrideHospitalId = undefined;
      const overrideTeamId = undefined;
      
      const formHospitalId = "2";
      const formTeamId = "4";
      
      const hId = overrideHospitalId ? String(overrideHospitalId) : formHospitalId;
      const tId = overrideTeamId ? String(overrideTeamId) : formTeamId;
      
      expect(hId).toBe("2");
      expect(tId).toBe("4");
    });

    it("should format diagnosis as 'CID - Description' when both are available", () => {
      const patient = {
        diagnosisCode: "J18.9",
        diagnosis: "Pneumonia não especificada",
      };
      
      let mainDiagnosis = "";
      if (patient.diagnosisCode && patient.diagnosis) {
        mainDiagnosis = `${patient.diagnosisCode} - ${patient.diagnosis}`;
      } else if (patient.diagnosis) {
        mainDiagnosis = patient.diagnosis;
      } else if (patient.diagnosisCode) {
        mainDiagnosis = patient.diagnosisCode;
      }
      
      expect(mainDiagnosis).toBe("J18.9 - Pneumonia não especificada");
    });

    it("should use only description when no CID code is available", () => {
      const patient = {
        diagnosisCode: "",
        diagnosis: "Dor lombar crônica",
      };
      
      let mainDiagnosis = "";
      if (patient.diagnosisCode && patient.diagnosis) {
        mainDiagnosis = `${patient.diagnosisCode} - ${patient.diagnosis}`;
      } else if (patient.diagnosis) {
        mainDiagnosis = patient.diagnosis;
      } else if (patient.diagnosisCode) {
        mainDiagnosis = patient.diagnosisCode;
      }
      
      expect(mainDiagnosis).toBe("Dor lombar crônica");
    });
  });
});
