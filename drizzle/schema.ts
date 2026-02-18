import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

// ==================== USERS ====================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "hospital_admin"]).default("user").notNull(),
  plan: mysqlEnum("plan", ["free", "pro", "enterprise"]).default("free").notNull(),
  specialty: varchar("specialty", { length: 128 }),
  crm: varchar("crm", { length: 32 }),
  phone: varchar("phone", { length: 32 }),
  cpf: varchar("cpf", { length: 14 }),
  professionalType: mysqlEnum("professionalType", ["medico", "enfermeiro", "fisioterapeuta", "nutricionista", "farmaceutico", "psicologo", "fonoaudiologo", "terapeuta_ocupacional", "estudante", "gestor", "outro"]).default("medico"),
  councilType: mysqlEnum("councilType", ["CRM", "COREN", "CREFITO", "CRN", "CRF", "CRP", "CRFa", "COFFITO", "outro"]),
  councilNumber: varchar("councilNumber", { length: 32 }),
  councilState: varchar("councilState", { length: 2 }),
  rqeNumber: varchar("rqeNumber", { length: 32 }),
  rqeSpecialty: varchar("rqeSpecialty", { length: 128 }),
  university: varchar("university", { length: 256 }),
  graduationYear: int("graduationYear"),
  enrollmentNumber: varchar("enrollmentNumber", { length: 64 }),
  institutionalRole: varchar("institutionalRole", { length: 128 }),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "pending", "verified", "rejected"]).default("unverified").notNull(),
  verificationDate: timestamp("verificationDate"),
  verificationNotes: text("verificationNotes"),
  documentUrl: text("documentUrl"),
  avatarUrl: text("avatarUrl"),
  preferredLanguage: mysqlEnum("preferredLanguage", ["pt-BR", "en-US", "es-ES", "fr-FR", "zh-CN"]).default("pt-BR"),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  trialEndsAt: timestamp("trialEndsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== HOSPITAL NETWORKS (Redes Hospitalares) ====================
export const hospitalNetworks = mysqlTable("hospital_networks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  logoUrl: text("logoUrl"),
  website: varchar("website", { length: 256 }),
  type: mysqlEnum("type", ["public", "private", "mixed", "university"]).default("private").notNull(),
  isPreRegistered: boolean("isPreRegistered").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HospitalNetwork = typeof hospitalNetworks.$inferSelect;
export type InsertHospitalNetwork = typeof hospitalNetworks.$inferInsert;

// ==================== HOSPITALS (Unidades Hospitalares) ====================
export const hospitals = mysqlTable("hospitals", {
  id: int("id").autoincrement().primaryKey(),
  networkId: int("networkId"),
  name: varchar("name", { length: 256 }).notNull(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  address: text("address"),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 64 }),
  neighborhood: varchar("neighborhood", { length: 128 }),
  zipCode: varchar("zipCode", { length: 16 }),
  phone: varchar("phone", { length: 32 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  type: mysqlEnum("type", ["public", "private", "mixed"]).default("private").notNull(),
  bedsTotal: int("bedsTotal").default(0),
  bedsIcu: int("bedsIcu").default(0),
  isPreRegistered: boolean("isPreRegistered").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Hospital = typeof hospitals.$inferSelect;
export type InsertHospital = typeof hospitals.$inferInsert;

// ==================== TEAMS ====================
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  hospitalId: int("hospitalId"),
  specialty: varchar("specialty", { length: 128 }),
  color: varchar("color", { length: 16 }).default("#0F766E"),
  leaderId: int("leaderId"),
  isPersonal: boolean("isPersonal").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  archived: boolean("archived").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// ==================== TEAM HOSPITALS (Relação N:N entre Equipes e Hospitais) ====================
export const teamHospitals = mysqlTable("team_hospitals", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  hospitalId: int("hospitalId").notNull(),
  isPrimary: boolean("isPrimary").default(false).notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type TeamHospital = typeof teamHospitals.$inferSelect;
export type InsertTeamHospital = typeof teamHospitals.$inferInsert;

// ==================== TEAM MEMBERS ====================
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["admin", "editor", "reader", "data_user"]).default("editor").notNull(),
  isCreator: boolean("isCreator").default(false).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

// ==================== TEAM INVITES ====================
export const teamInvites = mysqlTable("team_invites", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  inviteCode: varchar("inviteCode", { length: 32 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  invitedById: int("invitedById").notNull(),
  suggestedRole: mysqlEnum("suggestedRole", ["admin", "editor", "reader", "data_user"]).default("editor").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "expired"]).default("pending").notNull(),
  acceptedById: int("acceptedById"),
  acceptedRole: mysqlEnum("acceptedRole", ["admin", "editor", "reader", "data_user"]),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamInvite = typeof teamInvites.$inferSelect;
export type InsertTeamInvite = typeof teamInvites.$inferInsert;

// ==================== HOSPITAL ADMINS ====================
export const hospitalAdmins = mysqlTable("hospital_admins", {
  id: int("id").autoincrement().primaryKey(),
  hospitalId: int("hospitalId").notNull(),
  userId: int("userId").notNull(),
  permissions: json("permissions").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HospitalAdmin = typeof hospitalAdmins.$inferSelect;
export type InsertHospitalAdmin = typeof hospitalAdmins.$inferInsert;

// ==================== PATIENTS ====================
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  birthDate: timestamp("birthDate"),
  gender: mysqlEnum("gender", ["M", "F", "O"]),
  cpf: varchar("cpf", { length: 14 }),
  phone: varchar("phone", { length: 32 }),
  emergencyContact: varchar("emergencyContact", { length: 256 }),
  emergencyPhone: varchar("emergencyPhone", { length: 32 }),
  bloodType: varchar("bloodType", { length: 8 }),
  allergies: text("allergies"),
  comorbidities: text("comorbidities"),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

// ==================== ADMISSIONS ====================
export const admissions = mysqlTable("admissions", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  hospitalId: int("hospitalId").notNull(),
  teamId: int("teamId").notNull(),
  bed: varchar("bed", { length: 32 }).notNull(),
  sector: varchar("sector", { length: 128 }),
  admissionDate: timestamp("admissionDate").defaultNow().notNull(),
  dischargeDate: timestamp("dischargeDate"),
  mainDiagnosis: text("mainDiagnosis"),
  secondaryDiagnoses: json("secondaryDiagnoses").$type<string[]>(),
  insuranceProvider: varchar("insuranceProvider", { length: 128 }),
  insuranceNumber: varchar("insuranceNumber", { length: 64 }),
  priority: mysqlEnum("priority", ["critical", "high", "medium", "low"]).default("medium").notNull(),
  status: mysqlEnum("status", ["active", "discharged", "transferred", "deceased", "archived"]).default("active").notNull(),
  dischargeType: mysqlEnum("dischargeType", ["improved", "cured", "transferred", "deceased", "other"]),
  estimatedDischargeDate: timestamp("estimatedDischargeDate"),
  aiPredictedDischarge: timestamp("aiPredictedDischarge"),
  aiDischargeConfidence: decimal("aiDischargeConfidence", { precision: 5, scale: 2 }),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Admission = typeof admissions.$inferSelect;
export type InsertAdmission = typeof admissions.$inferInsert;

// ==================== EVOLUTIONS (SBAR) ====================
export const evolutions = mysqlTable("evolutions", {
  id: int("id").autoincrement().primaryKey(),
  admissionId: int("admissionId").notNull(),
  authorId: int("authorId").notNull(),
  situation: text("situation"),
  background: text("background"),
  assessment: text("assessment"),
  recommendation: text("recommendation"),
  vitalSigns: json("vitalSigns").$type<{
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    painLevel?: number;
  }>(),
  isDraft: boolean("isDraft").default(false).notNull(),
  draftSavedAt: timestamp("draftSavedAt"),
  lockedAt: timestamp("lockedAt"),
  lockedFields: json("lockedFields").$type<string[]>(),
  lastEditedById: int("lastEditedById"),
  lastEditedAt: timestamp("lastEditedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Evolution = typeof evolutions.$inferSelect;
export type InsertEvolution = typeof evolutions.$inferInsert;

// ==================== AI PREDICTIONS ====================
export const aiPredictions = mysqlTable("ai_predictions", {
  id: int("id").autoincrement().primaryKey(),
  admissionId: int("admissionId").notNull(),
  predictionType: mysqlEnum("predictionType", ["discharge", "prognosis", "risk"]).notNull(),
  predictedValue: text("predictedValue").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  factors: json("factors").$type<{ factor: string; weight: number }[]>(),
  modelVersion: varchar("modelVersion", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiPrediction = typeof aiPredictions.$inferSelect;
export type InsertAiPrediction = typeof aiPredictions.$inferInsert;

// ==================== ACTIVITY LOGS ====================
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  entityType: varchar("entityType", { length: 64 }).notNull(),
  entityId: int("entityId"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// ==================== SUBSCRIPTIONS ====================
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  hospitalId: int("hospitalId"),
  plan: mysqlEnum("plan", ["free", "pro", "enterprise"]).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "trial"]).default("active").notNull(),
  patientsLimit: int("patientsLimit").default(10).notNull(),
  teamMembersLimit: int("teamMembersLimit").default(3).notNull(),
  aiCredits: int("aiCredits").default(0).notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ==================== NOTIFICATIONS ====================
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "warning", "critical", "success", "handoff", "discharge", "status_update"]).default("info").notNull(),
  category: mysqlEnum("category", ["system", "patient", "team", "recovery_room"]).default("system").notNull(),
  read: boolean("read").default(false).notNull(),
  actionUrl: text("actionUrl"),
  metadata: json("metadata").$type<{
    patientId?: number;
    patientName?: string;
    fromUserId?: number;
    fromUserName?: string;
    sbarSummary?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }>(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;


// ==================== PUSH SUBSCRIPTIONS ====================
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("userAgent"),
  deviceName: varchar("deviceName", { length: 128 }),
  active: boolean("active").default(true).notNull(),
  lastUsed: timestamp("lastUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;


// ==================== SUPPORT TICKETS ====================
export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["bug", "suggestion", "question", "security"]).default("bug").notNull(),
  subject: varchar("subject", { length: 256 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  adminNotes: text("adminNotes"),
  resolvedAt: timestamp("resolvedAt"),
  resolvedById: int("resolvedById"),
  userAgent: text("userAgent"),
  pageUrl: varchar("pageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;
