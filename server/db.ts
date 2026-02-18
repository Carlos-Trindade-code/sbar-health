import { eq, and, desc, sql, like, or, gte, lte, count, avg, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  hospitalNetworks, InsertHospitalNetwork, HospitalNetwork,
  hospitals, InsertHospital, Hospital,
  teams, InsertTeam, Team,
  teamMembers, InsertTeamMember,
  teamHospitals, InsertTeamHospital,
  hospitalAdmins, InsertHospitalAdmin,
  patients, InsertPatient, Patient,
  admissions, InsertAdmission, Admission,
  evolutions, InsertEvolution, Evolution,
  aiPredictions, InsertAiPrediction,
  activityLogs, InsertActivityLog,
  subscriptions, InsertSubscription,
  notifications, InsertNotification,
  pushSubscriptions, InsertPushSubscription, PushSubscription,
  teamInvites, InsertTeamInvite, TeamInvite
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER OPERATIONS ====================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "passwordHash", "loginMethod", "specialty", "crm", "phone", "avatarUrl"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.email && ENV.adminEmail && user.email === ENV.adminEmail) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.plan !== undefined) {
      values.plan = user.plan;
      updateSet.plan = user.plan;
    }
    if (user.onboardingCompleted !== undefined) {
      values.onboardingCompleted = user.onboardingCompleted;
      updateSet.onboardingCompleted = user.onboardingCompleted;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function completeOnboarding(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ onboardingCompleted: true }).where(eq(users.id, userId));
}

export async function updateUserLanguage(userId: number, language: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ preferredLanguage: language as any }).where(eq(users.id, userId));
}

export async function getUserLanguage(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({ preferredLanguage: users.preferredLanguage })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result[0]?.preferredLanguage || null;
}

// ==================== HOSPITAL NETWORK OPERATIONS ====================
export async function getHospitalNetworks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hospitalNetworks).where(eq(hospitalNetworks.active, true));
}

export async function searchHospitalNetworks(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hospitalNetworks)
    .where(and(
      eq(hospitalNetworks.active, true),
      like(hospitalNetworks.name, `%${query}%`)
    ))
    .limit(20);
}

// ==================== HOSPITAL OPERATIONS ====================
export async function createHospital(data: InsertHospital) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(hospitals).values(data);
  return result[0].insertId;
}

export async function getHospitals() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hospitals).where(eq(hospitals.active, true));
}

export async function getPreRegisteredHospitals() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hospitals)
    .where(and(
      eq(hospitals.active, true),
      eq(hospitals.isPreRegistered, true)
    ))
    .orderBy(hospitals.state, hospitals.city, hospitals.name);
}

export async function searchHospitals(params: { query: string; city?: string; state?: string; networkId?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    eq(hospitals.active, true),
    like(hospitals.name, `%${params.query}%`)
  ];
  
  if (params.city) {
    conditions.push(eq(hospitals.city, params.city));
  }
  if (params.state) {
    conditions.push(eq(hospitals.state, params.state));
  }
  if (params.networkId) {
    conditions.push(eq(hospitals.networkId, params.networkId));
  }
  
  return db.select().from(hospitals)
    .where(and(...conditions))
    .limit(50);
}

export async function getHospitalsByNetwork(networkId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hospitals)
    .where(and(
      eq(hospitals.active, true),
      eq(hospitals.networkId, networkId)
    ));
}

export async function updateHospital(id: number, data: { name?: string; code?: string; address?: string; city?: string; state?: string; phone?: string; type?: "public" | "private" | "mixed" }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(hospitals).set(data).where(eq(hospitals.id, id));
  return { success: true };
}

export async function deleteHospital(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(hospitals).set({ active: false }).where(eq(hospitals.id, id));
  return { success: true };
}

export async function getHospitalById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(hospitals).where(eq(hospitals.id, id)).limit(1);
  return result[0];
}

export async function getHospitalsByAdmin(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const adminRecords = await db.select().from(hospitalAdmins).where(eq(hospitalAdmins.userId, userId));
  if (adminRecords.length === 0) return [];
  const hospitalIds = adminRecords.map(a => a.hospitalId);
  return db.select().from(hospitals).where(inArray(hospitals.id, hospitalIds));
}

export async function getUserHospitals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get hospitals from user's teams (via team_hospitals pivot)
  const memberships = await db.select().from(teamMembers).where(eq(teamMembers.userId, userId));
  const teamIds = memberships.map(m => m.teamId);
  
  let hospitalIdsFromTeams: number[] = [];
  if (teamIds.length > 0) {
    const pivotRows = await db.select().from(teamHospitals).where(inArray(teamHospitals.teamId, teamIds));
    hospitalIdsFromTeams = pivotRows.map(r => r.hospitalId);
  }
  
  // Get hospitals from hospitalAdmins
  const adminRecords = await db.select().from(hospitalAdmins).where(eq(hospitalAdmins.userId, userId));
  const hospitalIdsFromAdmin = adminRecords.map(a => a.hospitalId);
  
  // Merge unique IDs
  const allIds = Array.from(new Set([...hospitalIdsFromTeams, ...hospitalIdsFromAdmin]));
  if (allIds.length === 0) return [];
  
  return db.select().from(hospitals).where(and(inArray(hospitals.id, allIds), eq(hospitals.active, true)));
}

export async function linkUserToHospital(userId: number, hospitalId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if already linked
  const existing = await db.select().from(hospitalAdmins)
    .where(and(eq(hospitalAdmins.userId, userId), eq(hospitalAdmins.hospitalId, hospitalId)))
    .limit(1);
  if (existing.length > 0) return; // Already linked
  await db.insert(hospitalAdmins).values({
    userId,
    hospitalId,
    permissions: ['view', 'manage_teams']
  });
}

export async function unlinkUserFromHospital(userId: number, hospitalId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(hospitalAdmins).where(
    and(eq(hospitalAdmins.userId, userId), eq(hospitalAdmins.hospitalId, hospitalId))
  );
}

// ==================== TEAM OPERATIONS ====================
export async function createTeam(data: InsertTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teams).values(data);
  return result[0].insertId;
}

export async function getTeamsByHospital(hospitalId: number) {
  const db = await getDb();
  if (!db) return [];
  // Search in team_hospitals pivot table
  const pivotRows = await db.select().from(teamHospitals).where(eq(teamHospitals.hospitalId, hospitalId));
  if (pivotRows.length === 0) {
    // Fallback: also check legacy hospitalId column
    return db.select().from(teams).where(and(eq(teams.hospitalId, hospitalId), eq(teams.active, true)));
  }
  const teamIds = pivotRows.map(r => r.teamId);
  return db.select().from(teams).where(and(inArray(teams.id, teamIds), eq(teams.active, true)));
}

export async function getTeamsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const memberships = await db.select().from(teamMembers).where(eq(teamMembers.userId, userId));
  if (memberships.length === 0) return [];
  const teamIds = memberships.map(m => m.teamId);
  const teamList = await db.select().from(teams).where(inArray(teams.id, teamIds));
  
  // Enrich with hospitals from pivot table (many-to-many)
  const allTeamHospitals = teamIds.length > 0 
    ? await db.select().from(teamHospitals).where(inArray(teamHospitals.teamId, teamIds))
    : [];
  
  const hospitalIds = Array.from(new Set([
    ...allTeamHospitals.map(th => th.hospitalId),
    ...teamList.filter(t => t.hospitalId).map(t => t.hospitalId!)
  ]));
  
  let hospitalMap: Record<number, { id: number; name: string }> = {};
  if (hospitalIds.length > 0) {
    const hospitalList = await db.select({ id: hospitals.id, name: hospitals.name })
      .from(hospitals)
      .where(inArray(hospitals.id, hospitalIds));
    hospitalMap = Object.fromEntries(hospitalList.map(h => [h.id, { id: h.id, name: h.name }]));
  }
  
  return teamList.map(t => {
    // Get hospitals from pivot table
    const pivotHospitals = allTeamHospitals
      .filter(th => th.teamId === t.id)
      .map(th => hospitalMap[th.hospitalId])
      .filter(Boolean);
    
    // Fallback: if no pivot entries, use legacy hospitalId
    if (pivotHospitals.length === 0 && t.hospitalId && hospitalMap[t.hospitalId]) {
      pivotHospitals.push(hospitalMap[t.hospitalId]);
    }
    
    return {
      ...t,
      hospitals: pivotHospitals,
      hospitalName: pivotHospitals.map(h => h.name).join(", ") || null
    };
  });
}

// ==================== TEAM-HOSPITAL PIVOT OPERATIONS ====================
export async function addTeamHospital(teamId: number, hospitalId: number, isPrimary = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if already exists
  const existing = await db.select().from(teamHospitals)
    .where(and(eq(teamHospitals.teamId, teamId), eq(teamHospitals.hospitalId, hospitalId)))
    .limit(1);
  if (existing.length > 0) return existing[0].id;
  const result = await db.insert(teamHospitals).values({ teamId, hospitalId, isPrimary });
  return result[0].insertId;
}

export async function removeTeamHospital(teamId: number, hospitalId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(teamHospitals).where(and(eq(teamHospitals.teamId, teamId), eq(teamHospitals.hospitalId, hospitalId)));
}

export async function getTeamHospitals(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  const pivotRows = await db.select().from(teamHospitals).where(eq(teamHospitals.teamId, teamId));
  if (pivotRows.length === 0) return [];
  const hospitalIds = pivotRows.map(r => r.hospitalId);
  return db.select().from(hospitals).where(inArray(hospitals.id, hospitalIds));
}

export async function addTeamMember(data: InsertTeamMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(teamMembers).values(data);
}

export async function getTeamMembers(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  const members = await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
  const userIds = members.map(m => m.userId);
  if (userIds.length === 0) return [];
  const userList = await db.select().from(users).where(inArray(users.id, userIds));
  return members.map(m => ({
    ...m,
    user: userList.find(u => u.id === m.userId)
  }));
}

// ==================== PATIENT OPERATIONS ====================
export async function createPatient(data: InsertPatient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(patients).values(data);
  return result[0].insertId;
}

export async function getPatientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result[0];
}

export async function searchPatients(query: string, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patients)
    .where(or(
      like(patients.name, `%${query}%`),
      like(patients.cpf, `%${query}%`)
    ))
    .limit(limit);
}

export async function checkDuplicatePatient(name: string, cpf?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [like(patients.name, `%${name}%`)];
  if (cpf) conditions.push(eq(patients.cpf, cpf));
  return db.select().from(patients).where(or(...conditions)).limit(5);
}

export async function checkBatchDuplicates(names: string[]) {
  const db = await getDb();
  if (!db) return [];
  if (names.length === 0) return [];
  
  // For each name, search for similar patients in the database
  const results: Array<{ inputName: string; matches: Array<{ id: number; name: string; cpf: string | null; birthDate: Date | null }> }> = [];
  
  for (const name of names) {
    if (!name || name.trim().length < 3) continue;
    
    // Normalize: remove extra spaces, split into parts for flexible matching
    const normalizedName = name.trim();
    const nameParts = normalizedName.split(/\s+/).filter(p => p.length >= 3);
    
    // Search by full name similarity first
    const fullNameMatches = await db.select({
      id: patients.id,
      name: patients.name,
      cpf: patients.cpf,
      birthDate: patients.birthDate,
    }).from(patients).where(like(patients.name, `%${normalizedName}%`)).limit(5);
    
    // If no full match, try matching by first + last name parts
    let partialMatches: typeof fullNameMatches = [];
    if (fullNameMatches.length === 0 && nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      partialMatches = await db.select({
        id: patients.id,
        name: patients.name,
        cpf: patients.cpf,
        birthDate: patients.birthDate,
      }).from(patients).where(
        and(
          like(patients.name, `%${firstName}%`),
          like(patients.name, `%${lastName}%`)
        )
      ).limit(5);
    }
    
    // Merge and deduplicate
    const allMatches = [...fullNameMatches];
    for (const pm of partialMatches) {
      if (!allMatches.some(m => m.id === pm.id)) {
        allMatches.push(pm);
      }
    }
    
    if (allMatches.length > 0) {
      results.push({ inputName: normalizedName, matches: allMatches });
    }
  }
  
  return results;
}

// ==================== ADMISSION OPERATIONS ====================
export async function createAdmission(data: InsertAdmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(admissions).values(data);
  return result[0].insertId;
}

export async function getAdmissionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(admissions).where(eq(admissions.id, id)).limit(1);
  return result[0];
}

export async function getActiveAdmissionsByTeam(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  const admissionList = await db.select().from(admissions)
    .where(and(eq(admissions.teamId, teamId), eq(admissions.status, "active")))
    .orderBy(sql`FIELD(${admissions.priority}, 'critical', 'high', 'medium', 'low')`, admissions.bed);
  
  const patientIds = admissionList.map(a => a.patientId);
  if (patientIds.length === 0) return [];
  
  const patientList = await db.select().from(patients).where(inArray(patients.id, patientIds));
  
  return admissionList.map(a => ({
    ...a,
    patient: patientList.find(p => p.id === a.patientId)
  }));
}

export async function getActiveAdmissionsByHospital(hospitalId: number) {
  const db = await getDb();
  if (!db) return [];
  const admissionList = await db.select().from(admissions)
    .where(and(eq(admissions.hospitalId, hospitalId), eq(admissions.status, "active")))
    .orderBy(sql`FIELD(${admissions.priority}, 'critical', 'high', 'medium', 'low')`, admissions.bed);
  
  const patientIds = admissionList.map(a => a.patientId);
  if (patientIds.length === 0) return [];
  
  const patientList = await db.select().from(patients).where(inArray(patients.id, patientIds));
  const teamIds = Array.from(new Set(admissionList.map(a => a.teamId)));
  const teamList = teamIds.length > 0 ? await db.select().from(teams).where(inArray(teams.id, teamIds)) : [];
  
  return admissionList.map(a => ({
    ...a,
    patient: patientList.find(p => p.id === a.patientId),
    team: teamList.find(t => t.id === a.teamId)
  }));
}

export async function getActiveAdmissionsByMultipleHospitals(hospitalIds: number[]) {
  const db = await getDb();
  if (!db || hospitalIds.length === 0) return [];
  const admissionList = await db.select().from(admissions)
    .where(and(inArray(admissions.hospitalId, hospitalIds), eq(admissions.status, "active")))
    .orderBy(sql`FIELD(${admissions.priority}, 'critical', 'high', 'medium', 'low')`, admissions.bed);
  
  const patientIds = admissionList.map(a => a.patientId);
  if (patientIds.length === 0) return [];
  
  const patientList = await db.select().from(patients).where(inArray(patients.id, patientIds));
  const teamIds = Array.from(new Set(admissionList.map(a => a.teamId)));
  const teamList = teamIds.length > 0 ? await db.select().from(teams).where(inArray(teams.id, teamIds)) : [];
  
  return admissionList.map(a => ({
    ...a,
    patient: patientList.find(p => p.id === a.patientId),
    team: teamList.find(t => t.id === a.teamId)
  }));
}

export async function updateAdmission(id: number, data: Partial<InsertAdmission>) {
  const db = await getDb();
  if (!db) return;
  await db.update(admissions).set(data).where(eq(admissions.id, id));
}

export async function updatePatient(id: number, data: Partial<InsertPatient>) {
  const db = await getDb();
  if (!db) return;
  await db.update(patients).set(data).where(eq(patients.id, id));
}

export async function dischargePatient(admissionId: number, dischargeType: "improved" | "cured" | "transferred" | "deceased" | "other") {
  const db = await getDb();
  if (!db) return;
  await db.update(admissions).set({
    status: "discharged",
    dischargeType,
    dischargeDate: new Date()
  }).where(eq(admissions.id, admissionId));
}

export async function archivePatient(admissionId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(admissions).set({
    status: "archived"
  }).where(eq(admissions.id, admissionId));
}

export async function getLatestEvolutionForAdmissions(admissionIds: number[]) {
  const db = await getDb();
  if (!db || admissionIds.length === 0) return [];
  // Get the latest finalized evolution for each admission
  const result = await db.select({
    admissionId: evolutions.admissionId,
    situation: evolutions.situation,
    background: evolutions.background,
    assessment: evolutions.assessment,
    recommendation: evolutions.recommendation,
    createdAt: evolutions.createdAt,
    isDraft: evolutions.isDraft,
  }).from(evolutions)
    .where(and(
      inArray(evolutions.admissionId, admissionIds),
      eq(evolutions.isDraft, false)
    ))
    .orderBy(desc(evolutions.createdAt));
  
  // Group by admissionId and take the latest
  const latestByAdmission = new Map<number, typeof result[0]>();
  for (const evo of result) {
    if (!latestByAdmission.has(evo.admissionId)) {
      latestByAdmission.set(evo.admissionId, evo);
    }
  }
  return Array.from(latestByAdmission.values());
}

export async function getAdmissionsByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  const admissionList = await db.select().from(admissions)
    .where(eq(admissions.patientId, patientId))
    .orderBy(desc(admissions.admissionDate));
  
  const teamIds = Array.from(new Set(admissionList.map(a => a.teamId)));
  const hospitalIds = Array.from(new Set(admissionList.map(a => a.hospitalId)));
  
  const teamList = teamIds.length > 0 ? await db.select().from(teams).where(inArray(teams.id, teamIds)) : [];
  const hospitalList = hospitalIds.length > 0 ? await db.select().from(hospitals).where(inArray(hospitals.id, hospitalIds)) : [];
  
  return admissionList.map(a => ({
    ...a,
    team: teamList.find(t => t.id === a.teamId),
    hospital: hospitalList.find(h => h.id === a.hospitalId),
  }));
}

// ==================== EVOLUTION OPERATIONS ====================
export async function createEvolution(data: InsertEvolution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(evolutions).values(data);
  return result[0].insertId;
}

export async function getEvolutionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(evolutions).where(eq(evolutions.id, id)).limit(1);
  return result[0] || null;
}

export async function getFirstEvolutionByAdmission(admissionId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(evolutions)
    .where(eq(evolutions.admissionId, admissionId))
    .orderBy(evolutions.createdAt)
    .limit(1);
  return result[0] || null;
}

export async function getEvolutionsByAdmission(admissionId: number) {
  const db = await getDb();
  if (!db) return [];
  const evolutionList = await db.select().from(evolutions)
    .where(eq(evolutions.admissionId, admissionId))
    .orderBy(desc(evolutions.createdAt));
  
  const authorIds = Array.from(new Set(evolutionList.map(e => e.authorId)));
  const editorIds = Array.from(new Set(evolutionList.filter(e => e.lastEditedById).map(e => e.lastEditedById!)));
  const allUserIds = Array.from(new Set([...authorIds, ...editorIds]));
  if (allUserIds.length === 0) return evolutionList;
  
  const userList = await db.select().from(users).where(inArray(users.id, allUserIds));
  
  return evolutionList.map(e => ({
    ...e,
    author: userList.find(a => a.id === e.authorId),
    lastEditorName: e.lastEditedById ? userList.find(u => u.id === e.lastEditedById)?.name : null,
  }));
}

export async function getDraftEvolution(admissionId: number, authorId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(evolutions)
    .where(and(
      eq(evolutions.admissionId, admissionId),
      eq(evolutions.authorId, authorId),
      eq(evolutions.isDraft, true)
    ))
    .limit(1);
  return result[0] ?? null;
}

export async function updateEvolution(id: number, data: Partial<InsertEvolution>) {
  const db = await getDb();
  if (!db) return;
  await db.update(evolutions).set(data).where(eq(evolutions.id, id));
}

export async function saveDraft(admissionId: number, authorId: number, data: Partial<InsertEvolution>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getDraftEvolution(admissionId, authorId);
  if (existing) {
    await db.update(evolutions).set({ ...data, draftSavedAt: new Date() }).where(eq(evolutions.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(evolutions).values({
      ...data,
      admissionId,
      authorId,
      isDraft: true,
      draftSavedAt: new Date()
    });
    return result[0].insertId;
  }
}

export async function finalizeEvolution(evolutionId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(evolutions).set({
    isDraft: false,
    lockedAt: new Date()
  }).where(eq(evolutions.id, evolutionId));
}

export async function getTodayEvolutionCount(authorId: number) {
  const db = await getDb();
  if (!db) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = await db.select({ count: count(evolutions.id) })
    .from(evolutions)
    .where(and(
      eq(evolutions.authorId, authorId),
      eq(evolutions.isDraft, false),
      gte(evolutions.createdAt, today)
    ));
  return result[0]?.count ?? 0;
}

export async function updateTeam(id: number, data: { name?: string; specialty?: string; color?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(teams).set(data).where(eq(teams.id, id));
}

export async function deleteTeam(id: number) {
  const db = await getDb();
  if (!db) return;
  // Delete team-hospital links first
  await db.delete(teamHospitals).where(eq(teamHospitals.teamId, id));
  // Delete team members
  await db.delete(teamMembers).where(eq(teamMembers.teamId, id));
  // Then delete the team
  await db.delete(teams).where(eq(teams.id, id));
}

// ==================== AI PREDICTION OPERATIONS ====================
export async function createAiPrediction(data: InsertAiPrediction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiPredictions).values(data);
  return result[0].insertId;
}

export async function getLatestPrediction(admissionId: number, type: "discharge" | "prognosis" | "risk") {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(aiPredictions)
    .where(and(eq(aiPredictions.admissionId, admissionId), eq(aiPredictions.predictionType, type)))
    .orderBy(desc(aiPredictions.createdAt))
    .limit(1);
  return result[0];
}

// ==================== ACTIVITY LOG OPERATIONS ====================
export async function logActivity(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(data);
}

export async function getActivityLogs(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

// ==================== ANALYTICS OPERATIONS ====================
export async function getTeamProductivityStats(teamId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;
  
  const evolutionStats = await db.select({
    authorId: evolutions.authorId,
    count: count(evolutions.id)
  }).from(evolutions)
    .innerJoin(admissions, eq(evolutions.admissionId, admissions.id))
    .where(and(
      eq(admissions.teamId, teamId),
      gte(evolutions.createdAt, startDate),
      lte(evolutions.createdAt, endDate),
      eq(evolutions.isDraft, false)
    ))
    .groupBy(evolutions.authorId);
  
  const admissionStats = await db.select({
    total: count(admissions.id),
    discharged: sql<number>`SUM(CASE WHEN ${admissions.status} = 'discharged' THEN 1 ELSE 0 END)`,
    avgStay: sql<number>`AVG(DATEDIFF(COALESCE(${admissions.dischargeDate}, NOW()), ${admissions.admissionDate}))`
  }).from(admissions)
    .where(and(
      eq(admissions.teamId, teamId),
      gte(admissions.admissionDate, startDate),
      lte(admissions.admissionDate, endDate)
    ));
  
  return {
    evolutionsByAuthor: evolutionStats,
    admissions: admissionStats[0]
  };
}

export async function getHospitalAnalytics(hospitalId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;
  
  const teamStats = await db.select({
    teamId: admissions.teamId,
    totalAdmissions: count(admissions.id),
    dischargedImproved: sql<number>`SUM(CASE WHEN ${admissions.dischargeType} IN ('improved', 'cured') THEN 1 ELSE 0 END)`,
    avgStay: sql<number>`AVG(DATEDIFF(COALESCE(${admissions.dischargeDate}, NOW()), ${admissions.admissionDate}))`
  }).from(admissions)
    .where(and(
      eq(admissions.hospitalId, hospitalId),
      gte(admissions.admissionDate, startDate),
      lte(admissions.admissionDate, endDate)
    ))
    .groupBy(admissions.teamId);
  
  const insuranceStats = await db.select({
    provider: admissions.insuranceProvider,
    count: count(admissions.id)
  }).from(admissions)
    .where(and(
      eq(admissions.hospitalId, hospitalId),
      gte(admissions.admissionDate, startDate),
      lte(admissions.admissionDate, endDate)
    ))
    .groupBy(admissions.insuranceProvider);
  
  const dailyStats = await db.select({
    date: sql<string>`DATE(${admissions.admissionDate})`,
    count: count(admissions.id)
  }).from(admissions)
    .where(and(
      eq(admissions.hospitalId, hospitalId),
      gte(admissions.admissionDate, startDate),
      lte(admissions.admissionDate, endDate)
    ))
    .groupBy(sql`DATE(${admissions.admissionDate})`);
  
  return {
    teamStats,
    insuranceStats,
    dailyStats
  };
}

// ==================== SUBSCRIPTION OPERATIONS ====================
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1);
  return result[0];
}

export async function getActivePatientCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const userTeams = await getTeamsByUser(userId);
  if (userTeams.length === 0) return 0;
  
  const teamIds = userTeams.map(t => t.id);
  const result = await db.select({ count: count(admissions.id) })
    .from(admissions)
    .where(and(
      inArray(admissions.teamId, teamIds),
      eq(admissions.status, "active")
    ));
  
  return result[0]?.count || 0;
}

export async function getAiUsageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count(aiPredictions.id) })
    .from(aiPredictions)
    .innerJoin(admissions, eq(aiPredictions.admissionId, admissions.id))
    .where(eq(admissions.createdById, userId));
  return result[0]?.count || 0;
}

// ==================== NOTIFICATION OPERATIONS ====================
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(notifications).values(data);
  return result;
}

export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count(notifications.id) })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.read, false)
    ));
  return result[0]?.count || 0;
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, userId));
}

export async function deleteNotification(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(notifications).where(eq(notifications.id, id));
}

export async function getNotificationsByCategory(userId: number, category: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.category, category as any)
    ))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

// Função para criar notificação de passagem de plantão
export async function createHandoffNotification(
  toUserId: number,
  fromUserName: string,
  fromUserId: number,
  patientName: string,
  patientId: number,
  sbarSummary: string
) {
  return createNotification({
    userId: toUserId,
    title: `Passagem de Plantão - ${patientName}`,
    message: `${fromUserName} transferiu a responsabilidade do paciente ${patientName} para você.`,
    type: 'handoff',
    category: 'recovery_room',
    metadata: {
      patientId,
      patientName,
      fromUserId,
      fromUserName,
      sbarSummary,
      priority: 'high'
    }
  });
}

// Função para criar notificação de alta da RPA
export async function createDischargeNotification(
  toUserId: number,
  fromUserName: string,
  patientName: string,
  patientId: number,
  destination: string
) {
  return createNotification({
    userId: toUserId,
    title: `Alta da RPA - ${patientName}`,
    message: `${fromUserName} deu alta ao paciente ${patientName}. Destino: ${destination}.`,
    type: 'discharge',
    category: 'recovery_room',
    metadata: {
      patientId,
      patientName,
      fromUserName,
      priority: 'medium'
    }
  });
}

// Função para criar notificação de atualização de status
export async function createStatusUpdateNotification(
  toUserId: number,
  fromUserName: string,
  patientName: string,
  patientId: number,
  newStatus: string,
  priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) {
  return createNotification({
    userId: toUserId,
    title: `Atualização de Status - ${patientName}`,
    message: `${fromUserName} atualizou o status do paciente ${patientName} para: ${newStatus}.`,
    type: 'status_update',
    category: 'recovery_room',
    metadata: {
      patientId,
      patientName,
      fromUserName,
      priority
    }
  });
}


// ==================== PUSH SUBSCRIPTION OPERATIONS ====================

// Salvar ou atualizar subscription de push
export async function savePushSubscription(
  userId: number,
  endpoint: string,
  p256dh: string,
  auth: string,
  userAgent?: string,
  deviceName?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save push subscription: database not available");
    return null;
  }

  try {
    // Verificar se já existe uma subscription com este endpoint
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);

    if (existing.length > 0) {
      // Atualizar subscription existente
      await db
        .update(pushSubscriptions)
        .set({
          userId,
          p256dh,
          auth,
          userAgent,
          deviceName,
          active: true,
          lastUsed: new Date()
        })
        .where(eq(pushSubscriptions.endpoint, endpoint));
      
      return existing[0].id;
    } else {
      // Criar nova subscription
      const result = await db.insert(pushSubscriptions).values({
        userId,
        endpoint,
        p256dh,
        auth,
        userAgent,
        deviceName,
        active: true
      });
      
      return result[0].insertId;
    }
  } catch (error) {
    console.error("[Database] Error saving push subscription:", error);
    throw error;
  }
}

// Obter todas as subscriptions ativas de um usuário
export async function getUserPushSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.active, true)
      ))
      .orderBy(desc(pushSubscriptions.lastUsed));
  } catch (error) {
    console.error("[Database] Error getting push subscriptions:", error);
    return [];
  }
}

// Obter subscription por endpoint
export async function getPushSubscriptionByEndpoint(endpoint: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting push subscription:", error);
    return null;
  }
}

// Remover subscription
export async function removePushSubscription(endpoint: string) {
  const db = await getDb();
  if (!db) {
    return;
  }

  try {
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
  } catch (error) {
    console.error("[Database] Error removing push subscription:", error);
    throw error;
  }
}

// Desativar subscription (quando expira)
export async function deactivatePushSubscription(endpoint: string) {
  const db = await getDb();
  if (!db) {
    return;
  }

  try {
    await db
      .update(pushSubscriptions)
      .set({ active: false })
      .where(eq(pushSubscriptions.endpoint, endpoint));
  } catch (error) {
    console.error("[Database] Error deactivating push subscription:", error);
  }
}

// Atualizar último uso da subscription
export async function updatePushSubscriptionLastUsed(endpoint: string) {
  const db = await getDb();
  if (!db) {
    return;
  }

  try {
    await db
      .update(pushSubscriptions)
      .set({ lastUsed: new Date() })
      .where(eq(pushSubscriptions.endpoint, endpoint));
  } catch (error) {
    console.error("[Database] Error updating push subscription last used:", error);
  }
}

// Obter todas as subscriptions ativas de múltiplos usuários
export async function getMultipleUsersPushSubscriptions(userIds: number[]) {
  const db = await getDb();
  if (!db || userIds.length === 0) {
    return [];
  }

  try {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(and(
        inArray(pushSubscriptions.userId, userIds),
        eq(pushSubscriptions.active, true)
      ));
  } catch (error) {
    console.error("[Database] Error getting multiple users push subscriptions:", error);
    return [];
  }
}


// ==================== TEAM INVITES ====================

export async function createTeamInvite(data: { teamId: number; inviteCode: string; email?: string; invitedById: number; suggestedRole: "admin" | "editor" | "reader" | "data_user"; expiresAt: Date }) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(teamInvites).values({
      teamId: data.teamId,
      inviteCode: data.inviteCode,
      email: data.email || null,
      invitedById: data.invitedById,
      suggestedRole: data.suggestedRole,
      status: "pending",
      expiresAt: data.expiresAt,
    });
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Error creating team invite:", error);
    return null;
  }
}

export async function getTeamInviteByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const results = await db
      .select()
      .from(teamInvites)
      .where(eq(teamInvites.inviteCode, code))
      .limit(1);
    return results[0] || null;
  } catch (error) {
    console.error("[Database] Error getting team invite:", error);
    return null;
  }
}

export async function getTeamInvitesByTeam(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(teamInvites)
      .where(eq(teamInvites.teamId, teamId))
      .orderBy(desc(teamInvites.createdAt));
  } catch (error) {
    console.error("[Database] Error getting team invites:", error);
    return [];
  }
}

export async function acceptTeamInvite(inviteId: number, userId: number, role: "admin" | "editor" | "reader" | "data_user") {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .update(teamInvites)
      .set({
        status: "accepted",
        acceptedById: userId,
        acceptedRole: role,
      })
      .where(eq(teamInvites.id, inviteId));
    return true;
  } catch (error) {
    console.error("[Database] Error accepting team invite:", error);
    return false;
  }
}

export async function revokeTeamInvite(inviteId: number) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .update(teamInvites)
      .set({ status: "expired" })
      .where(eq(teamInvites.id, inviteId));
    return true;
  } catch (error) {
    console.error("[Database] Error revoking team invite:", error);
    return false;
  }
}
