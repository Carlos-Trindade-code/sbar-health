import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { translateClinicalContent, translateBatch, detectLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from "./translation";
import * as webPush from "./webPush";
import { sql, eq, gte, desc } from "drizzle-orm";
import { users, patients, admissions, evolutions, hospitals, teams, aiPredictions, activityLogs, supportTickets } from "../drizzle/schema";
import { getDb } from "./db";

// Plan limits
const PLAN_LIMITS = {
  free: { patients: 10, teams: 1, aiCredits: 5 },
  trial: { patients: -1, teams: -1, aiCredits: -1 }, // Trial: 30 dias ilimitado
  pro: { patients: 100, teams: 10, aiCredits: 100 },
  enterprise: { patients: -1, teams: -1, aiCredits: -1 }
};

// Check if user is in active trial period (30 days from creation)
function getUserPlanWithTrial(user: { plan: string; trialEndsAt?: Date | null; createdAt: Date }): string {
  // If user has explicit pro/enterprise plan, use it
  if (user.plan === 'pro' || user.plan === 'enterprise') return user.plan;
  
  // Check trial period
  const trialEnd = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
  if (trialEnd && trialEnd > new Date()) {
    return 'trial';
  }
  
  // If no trialEndsAt set yet, auto-set 30 days from creation
  if (!user.trialEndsAt && user.createdAt) {
    const createdDate = new Date(user.createdAt);
    const thirtyDaysLater = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (thirtyDaysLater > new Date()) {
      return 'trial';
    }
  }
  
  return user.plan || 'free';
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== USER PROFILE ====================
  profile: router({
    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        specialty: z.string().optional(),
        crm: z.string().optional(),
        phone: z.string().optional(),
        cpf: z.string().optional(),
        professionalType: z.enum(['medico', 'enfermeiro', 'fisioterapeuta', 'nutricionista', 'farmaceutico', 'psicologo', 'fonoaudiologo', 'terapeuta_ocupacional', 'estudante', 'gestor', 'outro']).optional(),
        councilType: z.enum(['CRM', 'COREN', 'CREFITO', 'CRN', 'CRF', 'CRP', 'CRFa', 'COFFITO', 'outro']).optional(),
        councilNumber: z.string().optional(),
        councilState: z.string().max(2).optional(),
        rqeNumber: z.string().optional(),
        rqeSpecialty: z.string().optional(),
        university: z.string().optional(),
        graduationYear: z.number().optional(),
        enrollmentNumber: z.string().optional(),
        institutionalRole: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Se está enviando dados profissionais, marcar como pendente de verificação
        const updateData: any = { ...input };
        if (input.councilNumber || input.cpf) {
          updateData.verificationStatus = 'pending';
        }
        // Se é médico, copiar councilNumber para crm para compatibilidade
        if (input.professionalType === 'medico' && input.councilNumber) {
          updateData.crm = input.councilNumber;
        }
        await db.updateUserProfile(ctx.user.id, updateData);
        return { success: true };
      }),

    // Validar CPF via BrasilAPI
    validateCpf: protectedProcedure
      .input(z.object({ cpf: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const cleanCpf = input.cpf.replace(/\D/g, '');
          if (cleanCpf.length !== 11) return { valid: false, error: 'CPF deve ter 11 dígitos' };
          // Validação algorítmica do CPF
          let sum = 0;
          for (let i = 0; i < 9; i++) sum += parseInt(cleanCpf[i]) * (10 - i);
          let remainder = (sum * 10) % 11;
          if (remainder === 10) remainder = 0;
          if (remainder !== parseInt(cleanCpf[9])) return { valid: false, error: 'CPF inválido' };
          sum = 0;
          for (let i = 0; i < 10; i++) sum += parseInt(cleanCpf[i]) * (11 - i);
          remainder = (sum * 10) % 11;
          if (remainder === 10) remainder = 0;
          if (remainder !== parseInt(cleanCpf[10])) return { valid: false, error: 'CPF inválido' };
          // Verificar se todos os dígitos são iguais
          if (/^(\d)\1{10}$/.test(cleanCpf)) return { valid: false, error: 'CPF inválido' };
          return { valid: true };
        } catch {
          return { valid: false, error: 'Erro ao validar CPF' };
        }
      }),

    // Consultar CRM no CFM (simulado - em produção usar API real)
    verifyCRM: protectedProcedure
      .input(z.object({ crm: z.string(), state: z.string().max(2) }))
      .mutation(async ({ input }) => {
        try {
          // Tentar consultar via BrasilAPI
          const response = await fetch(`https://brasilapi.com.br/api/cvm/v1/${input.crm}`);
          // A BrasilAPI não tem endpoint de CRM, então fazemos validação básica
          // Em produção, integrar com portal.cfm.org.br
          const crmNumber = input.crm.replace(/\D/g, '');
          if (crmNumber.length < 4 || crmNumber.length > 8) {
            return { valid: false, error: 'Número de CRM deve ter entre 4 e 8 dígitos' };
          }
          const validStates = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
          if (!validStates.includes(input.state.toUpperCase())) {
            return { valid: false, error: 'UF inválida' };
          }
          // Formato válido - marcar como pendente de verificação manual
          return { valid: true, message: 'CRM com formato válido. Verificação completa será realizada pela equipe.' };
        } catch {
          return { valid: false, error: 'Erro ao verificar CRM' };
        }
      }),

    // Verificação profissional (admin)
    getVerificationStatus: protectedProcedure.query(async ({ ctx }) => {
      return {
        status: ctx.user.verificationStatus || 'unverified',
        verificationDate: ctx.user.verificationDate,
        notes: ctx.user.verificationNotes,
      };
    }),
    
    completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
      await db.completeOnboarding(ctx.user.id);
      return { success: true };
    }),

    updateLanguage: protectedProcedure
      .input(z.object({
        language: z.enum(['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'zh-CN']),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserLanguage(ctx.user.id, input.language);
        return { success: true, language: input.language };
      }),

    getLanguage: protectedProcedure.query(async ({ ctx }) => {
      const language = await db.getUserLanguage(ctx.user.id);
      return { language: language || 'pt-BR' };
    }),

    planStats: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      const effectivePlan = getUserPlanWithTrial(user as any);
      const limits = PLAN_LIMITS[effectivePlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
      const activePatients = await db.getActivePatientCount(user.id);
      const aiUsed = await db.getAiUsageCount(user.id);
      
      // Calculate trial info
      let trialDaysLeft: number | null = null;
      if (effectivePlan === 'trial') {
        const trialEnd = (user as any).trialEndsAt 
          ? new Date((user as any).trialEndsAt) 
          : new Date(new Date(user.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
        trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        
        // Auto-set trialEndsAt if not set
        if (!(user as any).trialEndsAt) {
          const drizzleDb = await getDb();
          if (drizzleDb) {
            await drizzleDb.update(users).set({ trialEndsAt: trialEnd }).where(eq(users.id, user.id));
          }
        }
      }
      
      return {
        plan: effectivePlan,
        activePatients,
        maxPatients: limits.patients,
        aiUsed,
        maxAi: limits.aiCredits,
        trialDaysLeft,
        isTrialActive: effectivePlan === 'trial',
      };
    }),
  }),

  // ==================== HOSPITAL NETWORKS ====================
  hospitalNetworks: router({
    list: protectedProcedure.query(async () => {
      return db.getHospitalNetworks();
    }),
    
    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return db.searchHospitalNetworks(input.query);
      }),
  }),

  // ==================== HOSPITALS ====================
  hospitals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // Return only hospitals linked to the user (via teams or hospitalAdmins)
      return db.getUserHospitals(ctx.user.id);
    }),
    
    listAll: protectedProcedure.query(async () => {
      // Return all active hospitals (for search/selection purposes)
      return db.getHospitals();
    }),
    
    listPreRegistered: protectedProcedure.query(async () => {
      return db.getPreRegisteredHospitals();
    }),
    
    search: protectedProcedure
      .input(z.object({ 
        query: z.string(),
        city: z.string().optional(),
        state: z.string().optional(),
        networkId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.searchHospitals(input);
      }),
    
    byNetwork: protectedProcedure
      .input(z.object({ networkId: z.number() }))
      .query(async ({ input }) => {
        return db.getHospitalsByNetwork(input.networkId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        code: z.string().optional(),
        networkId: z.number().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        neighborhood: z.string().optional(),
        phone: z.string().optional(),
        type: z.enum(["public", "private", "mixed"]).default("private"),
        bedsTotal: z.number().optional(),
        bedsIcu: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // Auto-generate code from hospital name if not provided
        let code = input.code;
        if (!code) {
          const words = input.name.replace(/Hospital/gi, 'H').replace(/Universit[aá]rio/gi, 'U').split(/\s+/);
          const baseCode = words.map(w => w[0]?.toUpperCase()).filter(Boolean).join('').slice(0, 6);
          code = `${baseCode}${input.state || ''}`.toUpperCase();
          // Check uniqueness and add suffix if needed
          const existing = await db.getHospitals();
          const existingCodes = new Set(existing.map(h => h.code));
          if (existingCodes.has(code)) {
            for (let i = 2; i < 100; i++) {
              const candidate = `${code}${i}`;
              if (!existingCodes.has(candidate)) { code = candidate; break; }
            }
          }
        }
        const id = await db.createHospital({ ...input, code });
        return { id };
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getHospitalById(input.id);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        code: z.string().min(1).optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        phone: z.string().optional(),
        type: z.enum(["public", "private", "mixed"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateHospital(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteHospital(input.id);
      }),

    linkToUser: protectedProcedure
      .input(z.object({ hospitalId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Check if already linked
        const existing = await db.getUserHospitals(ctx.user.id);
        const alreadyLinked = existing.some(h => h.id === input.hospitalId);
        if (alreadyLinked) {
          return { success: true, alreadyLinked: true };
        }
        await db.linkUserToHospital(ctx.user.id, input.hospitalId);
        return { success: true, alreadyLinked: false };
      }),

    // Unlink hospital from user (remove from hospitalAdmins)
    unlinkFromUser: protectedProcedure
      .input(z.object({ hospitalId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.unlinkUserFromHospital(ctx.user.id, input.hospitalId);
        return { success: true };
      }),
  }),

  // ==================== TEAMS ====================
  teams: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTeamsByUser(ctx.user.id);
    }),
    
    byHospital: protectedProcedure
      .input(z.object({ hospitalId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamsByHospital(input.hospitalId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        hospitalId: z.number().optional(),
        hospitalIds: z.array(z.number()).optional(),
        specialty: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { hospitalIds, ...teamData } = input;
        const id = await db.createTeam({ ...teamData, leaderId: ctx.user.id });
        await db.addTeamMember({ teamId: id, userId: ctx.user.id, role: "admin", isCreator: true });
        
        // Link hospitals via pivot table
        const idsToLink = hospitalIds || (input.hospitalId ? [input.hospitalId] : []);
        for (let i = 0; i < idsToLink.length; i++) {
          await db.addTeamHospital(id, idsToLink[i], i === 0);
        }
        
        return { id };
      }),
    
    createPersonal: protectedProcedure
      .input(z.object({
        hospitalId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already has a personal team
        const existingTeams = await db.getTeamsByUser(ctx.user.id);
        const existingPersonal = existingTeams.find((t: any) => t.isPersonal);
        if (existingPersonal) {
          // Just link the hospital if not already linked
          try {
            await db.addTeamHospital(existingPersonal.id, input.hospitalId, true);
          } catch (e) { /* already linked */ }
          return { id: existingPersonal.id };
        }
        // Create personal team
        const userName = ctx.user.name || 'Minha';
        const firstName = userName.split(' ')[0];
        const id = await db.createTeam({
          name: `Equipe ${firstName}`,
          leaderId: ctx.user.id,
          isPersonal: true,
        });
        await db.addTeamMember({ teamId: id, userId: ctx.user.id, role: "admin", isCreator: true });
        await db.addTeamHospital(id, input.hospitalId, true);
        return { id };
      }),

    quickSetup: protectedProcedure
      .input(z.object({
        mode: z.enum(['personal', 'team']),
        hospitalId: z.number().optional(),
        newHospitalName: z.string().optional(),
        newHospitalCity: z.string().optional(),
        newHospitalState: z.string().optional(),
        newHospitalType: z.enum(['public', 'private', 'mixed']).optional(),
        teamName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let hospitalId = input.hospitalId;
        
        // Create hospital if needed
        if (!hospitalId && input.newHospitalName) {
          const words = input.newHospitalName.replace(/Hospital/gi, 'H').split(/\s+/);
          const baseCode = words.map(w => w[0]?.toUpperCase()).filter(Boolean).join('').slice(0, 6);
          const code = `${baseCode}${input.newHospitalState || ''}`.toUpperCase();
          hospitalId = await db.createHospital({
            name: input.newHospitalName,
            code,
            city: input.newHospitalCity,
            state: input.newHospitalState,
            type: input.newHospitalType || 'private',
          });
        }
        
        if (!hospitalId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Selecione ou cadastre um hospital' });
        }
        
        let teamId: number;
        
        if (input.mode === 'personal') {
          // Create personal team (invisible to user)
          const userName = ctx.user.name || 'Minha';
          const firstName = userName.split(' ')[0];
          teamId = await db.createTeam({
            name: `Equipe ${firstName}`,
            leaderId: ctx.user.id,
            isPersonal: true,
          });
        } else {
          // Create named team
          const teamName = input.teamName || 'Minha Equipe';
          teamId = await db.createTeam({
            name: teamName,
            leaderId: ctx.user.id,
            isPersonal: false,
          });
        }
        
        await db.addTeamMember({ teamId, userId: ctx.user.id, role: "admin", isCreator: true });
        await db.addTeamHospital(teamId, hospitalId, true);
        
        // Complete onboarding
        await db.completeOnboarding(ctx.user.id);
        
        return { teamId, hospitalId };
      }),

    addHospital: protectedProcedure
      .input(z.object({ teamId: z.number(), hospitalId: z.number() }))
      .mutation(async ({ input }) => {
        await db.addTeamHospital(input.teamId, input.hospitalId);
        return { success: true };
      }),
    
    removeHospital: protectedProcedure
      .input(z.object({ teamId: z.number(), hospitalId: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeTeamHospital(input.teamId, input.hospitalId);
        return { success: true };
      }),
    
    hospitals: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamHospitals(input.teamId);
      }),
    
    addMember: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        userId: z.number(),
        role: z.enum(["admin", "editor", "reader", "data_user"]).default("editor"),
      }))
      .mutation(async ({ input }) => {
        await db.addTeamMember(input);
        return { success: true };
      }),
    
    members: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamMembers(input.teamId);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        specialty: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTeam(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTeam(input.id);
        return { success: true };
      }),

    // ==================== INVITES ====================
    createInvite: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        email: z.string().email().optional(),
        suggestedRole: z.enum(["admin", "editor", "reader", "data_user"]).default("editor"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify user is admin of the team
        const members = await db.getTeamMembers(input.teamId);
        const currentMember = members.find((m: any) => m.userId === ctx.user.id);
        if (!currentMember || (currentMember.role !== 'admin' && !currentMember.isCreator)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores podem gerar convites' });
        }
        
        // Generate unique invite code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = 'SBAR-';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Expires in 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        const id = await db.createTeamInvite({
          teamId: input.teamId,
          inviteCode: code,
          email: input.email,
          invitedById: ctx.user.id,
          suggestedRole: input.suggestedRole,
          expiresAt,
        });
        
        return { id, code };
      }),

    getInvite: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const invite = await db.getTeamInviteByCode(input.code);
        if (!invite) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Convite n\u00e3o encontrado' });
        }
        
        // Check if expired
        if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Convite expirado' });
        }
        
        if (invite.status !== 'pending') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Convite j\u00e1 foi ${invite.status === 'accepted' ? 'aceito' : invite.status === 'rejected' ? 'rejeitado' : 'expirado'}` });
        }
        
        // Get team info
        const teamsList = await db.getTeamsByUser(invite.invitedById);
        const team = teamsList.find((t: any) => t.id === invite.teamId);
        
        return {
          id: invite.id,
          teamId: invite.teamId,
          teamName: team?.name || 'Equipe',
          suggestedRole: invite.suggestedRole,
          email: invite.email,
          expiresAt: invite.expiresAt,
        };
      }),

    acceptInvite: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const invite = await db.getTeamInviteByCode(input.code);
        if (!invite) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Convite n\u00e3o encontrado' });
        }
        
        // Check if expired
        if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Convite expirado' });
        }
        
        if (invite.status !== 'pending') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Convite j\u00e1 utilizado' });
        }
        
        // Check if user is already a member
        const members = await db.getTeamMembers(invite.teamId);
        const alreadyMember = members.find((m: any) => m.userId === ctx.user.id);
        if (alreadyMember) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Voc\u00ea j\u00e1 \u00e9 membro desta equipe' });
        }
        
        // Add user to team with suggested role
        await db.addTeamMember({
          teamId: invite.teamId,
          userId: ctx.user.id,
          role: invite.suggestedRole,
        });
        
        // Mark invite as accepted
        await db.acceptTeamInvite(invite.id, ctx.user.id, invite.suggestedRole);
        
        await db.logActivity({
          userId: ctx.user.id,
          action: "accept_invite",
          entityType: "team",
          entityId: invite.teamId,
        });
        
        return { teamId: invite.teamId, role: invite.suggestedRole };
      }),

    listInvites: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamInvitesByTeam(input.teamId);
      }),

    revokeInvite: protectedProcedure
      .input(z.object({ inviteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.revokeTeamInvite(input.inviteId);
        return { success: true };
      }),
  }),

  // ==================== PATIENTS ====================
  patients: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        birthDate: z.date().optional(),
        gender: z.enum(["M", "F", "O"]).optional(),
        cpf: z.string().optional(),
        phone: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
        bloodType: z.string().optional(),
        allergies: z.string().optional(),
        comorbidities: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createPatient({ ...input, createdById: ctx.user.id });
        await db.logActivity({
          userId: ctx.user.id,
          action: "create_patient",
          entityType: "patient",
          entityId: id,
        });
        return { id };
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getPatientById(input.id);
      }),
    
    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return db.searchPatients(input.query);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        birthDate: z.date().optional(),
        gender: z.enum(["M", "F", "O"]).optional(),
        cpf: z.string().optional(),
        phone: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
        bloodType: z.string().optional(),
        allergies: z.string().optional(),
        comorbidities: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updatePatient(id, data);
        await db.logActivity({
          userId: ctx.user.id,
          action: "update_patient",
          entityType: "patient",
          entityId: id,
        });
        return { success: true };
      }),

    checkDuplicate: protectedProcedure
      .input(z.object({ name: z.string(), cpf: z.string().optional() }))
      .query(async ({ input }) => {
        return db.checkDuplicatePatient(input.name, input.cpf);
      }),

    checkBatchDuplicates: protectedProcedure
      .input(z.object({ names: z.array(z.string()).max(100) }))
      .mutation(async ({ input }) => {
        return db.checkBatchDuplicates(input.names);
      }),

    // Analyze document and extract patient data using AI
    analyzeDocument: protectedProcedure
      .input(z.object({
        fileData: z.string(), // Base64 encoded file
        fileName: z.string(),
        fileType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { fileData, fileName, fileType } = input;
        
        // Build prompt for LLM to extract patient data
        const systemPrompt = `Você é um assistente médico especializado em extrair dados de pacientes de documentos clínicos.

INSTRUÇÕES CRÍTICAS:
1. Extraia ABSOLUTAMENTE TODOS os pacientes do documento, sem exceção. Não pare em 10 ou qualquer número arbitrário.
2. Se o documento tiver 24 pacientes, retorne 24. Se tiver 50, retorne 50. NUNCA truncar a lista.
3. Percorra TODAS as páginas do documento até o final.

Para cada paciente, extraia:
- name: Nome completo do paciente (exatamente como escrito no documento)
- age: Idade (ex: "45 anos")
- diagnosis: Descrição do diagnóstico principal em português (ex: "Pneumonia adquirida na comunidade")
- diagnosisCode: Código CID-10 no formato correto (letra maiúscula + números + ponto + números, ex: "J18.9", "M54.5", "I10"). Se o CID não estiver explícito no documento, tente inferir pelo diagnóstico. Se não for possível, deixe vazio.
- bed: Número do leito (ex: "201-A", "UTI-03")
- insurance: Convênio/plano de saúde
- situation: Situação clínica atual do paciente (estado geral, queixas, sinais vitais, nível de consciência). Extraia TUDO que descreva o estado atual. Se não houver informação, deixe vazio.
- background: Histórico relevante (motivo da internação, comorbidades, medicações em uso, procedimentos realizados, alergias). Extraia TUDO que descreva o histórico. Se não houver informação, deixe vazio.
- confidence: Número de 0 a 100 indicando confiança na extração

REGRAS PARA CID-10:
- Formato correto: Letra maiúscula (A-Z) + 2 dígitos + ponto + 1-2 dígitos (ex: J18.9, M54.5, G43.0)
- Alguns CIDs não têm subcategoria (ex: I10, E11)
- NUNCA invente CIDs. Se não souber o código exato, deixe o campo diagnosisCode vazio e preencha apenas o campo diagnosis com a descrição.
- O campo diagnosis deve conter a DESCRIÇÃO por extenso do diagnóstico, não o código.

Retorne um JSON válido. Se não encontrar nenhum paciente, retorne {"patients": []}.
Se um campo não estiver disponível, deixe como string vazia.`;

        // Handle different file types
        let userMessage: { role: "user"; content: string | Array<{type: "text"; text: string} | {type: "image_url"; image_url: {url: string}} | {type: "file_url"; file_url: {url: string; mime_type?: "application/pdf" | "audio/mpeg" | "audio/wav" | "audio/mp4" | "video/mp4"}}> };
        
        if (fileType.startsWith("image/")) {
          // For images, use vision capability with base64 data URL
          userMessage = {
            role: "user",
            content: [
              { type: "text" as const, text: "Extraia todos os pacientes deste documento médico:" },
              { type: "image_url" as const, image_url: { url: `data:${fileType};base64,${fileData}` } }
            ]
          };
        } else if (fileType === "application/pdf") {
          // For PDFs, upload to S3 first then send as file_url
          const pdfBuffer = Buffer.from(fileData, "base64");
          const randomSuffix = Math.random().toString(36).substring(2, 10);
          const fileKey = `document-imports/${Date.now()}-${randomSuffix}.pdf`;
          const { url: pdfUrl } = await storagePut(fileKey, pdfBuffer, "application/pdf");
          
          userMessage = {
            role: "user",
            content: [
              { type: "text" as const, text: `Extraia TODOS os pacientes deste documento médico (${fileName}). É OBRIGATÓRIO percorrer TODAS as páginas do PDF até o final e listar cada paciente encontrado. Não pare antes de chegar ao fim do documento. Se houver 20, 30 ou mais pacientes, liste todos sem exceção.` },
              { type: "file_url" as const, file_url: { url: pdfUrl, mime_type: "application/pdf" as const } }
            ]
          };
        } else {
          // For other text documents, send content as text
          const textContent = Buffer.from(fileData, "base64").toString("utf-8");
          userMessage = {
            role: "user",
            content: `Extraia todos os pacientes do seguinte documento (${fileName}):\n\n${textContent}`
          };
        }

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              userMessage
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "patient_extraction",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    patients: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          age: { type: "string" },
                          diagnosis: { type: "string" },
                          diagnosisCode: { type: "string" },
                          bed: { type: "string" },
                          insurance: { type: "string" },
                          situation: { type: "string" },
                          background: { type: "string" },
                          confidence: { type: "number" }
                        },
                        required: ["name", "age", "diagnosis", "diagnosisCode", "bed", "insurance", "situation", "background", "confidence"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["patients"],
                  additionalProperties: false
                }
              }
            }
          });

          const messageContent = response.choices[0].message.content;
          const contentStr = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
          const result = JSON.parse(contentStr || '{"patients": []}');
          return result as { patients: Array<{
            name: string;
            age: string;
            diagnosis: string;
            diagnosisCode: string;
            bed: string;
            insurance: string;
            situation: string;
            background: string;
            confidence: number;
          }> };
        } catch (error) {
          console.error("Error analyzing document:", error);
          // Return empty array on error
          return { patients: [] };
        }
      }),

    // Analyze voice transcript and extract patient data using AI
    analyzeVoice: protectedProcedure
      .input(z.object({
        transcript: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { transcript } = input;
        
        const systemPrompt = `Você é um assistente especializado em extrair dados de pacientes de texto falado.
Analise o texto transcrito e extraia os dados do paciente mencionado.
Extraia: nome, idade, diagnóstico (com código CID-10 se possível inferir), leito e convênio.
Retorne um JSON válido com a estrutura:
{
  "name": "Nome do Paciente",
  "age": "45 anos",
  "diagnosis": "Pneumonia",
  "diagnosisCode": "J18.9",
  "bed": "201-A",
  "insurance": "Unimed",
  "confidence": 85
}
O campo "confidence" deve ser um número de 0 a 100 indicando sua confiança na extração.
Se um campo não for mencionado, deixe como string vazia.
Se o diagnóstico for mencionado, tente inferir o código CID-10 correspondente.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Extraia os dados do paciente do seguinte texto falado:\n\n"${transcript}"` }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "patient_voice_extraction",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    age: { type: "string" },
                    diagnosis: { type: "string" },
                    diagnosisCode: { type: "string" },
                    bed: { type: "string" },
                    insurance: { type: "string" },
                    confidence: { type: "number" }
                  },
                  required: ["name", "age", "diagnosis", "diagnosisCode", "bed", "insurance", "confidence"],
                  additionalProperties: false
                }
              }
            }
          });

          const messageContent = response.choices[0].message.content;
          const contentStr = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
          const result = JSON.parse(contentStr || '{}');
          return result as {
            name: string;
            age: string;
            diagnosis: string;
            diagnosisCode: string;
            bed: string;
            insurance: string;
            confidence: number;
          };
        } catch (error) {
          console.error("Error analyzing voice:", error);
          return {
            name: "",
            age: "",
            diagnosis: "",
            diagnosisCode: "",
            bed: "",
            insurance: "",
            confidence: 0
          };
        }
      }),

    // Analyze pasted text and extract patient data (supports multiple patients)
    analyzeText: protectedProcedure
      .input(z.object({
        text: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const { text } = input;
        
        const systemPrompt = `Você é um assistente especializado em extrair dados de pacientes de textos clínicos.
Analise o texto fornecido e identifique TODOS os pacientes mencionados.
O texto pode conter dados de um ou múltiplos pacientes — evoluções, passagens de plantão, resumos clínicos, listas de leitos, etc.

Para cada paciente encontrado, extraia:
- nome: Nome completo do paciente
- age: Idade (ex: "45 anos")
- diagnosis: Diagnóstico principal
- diagnosisCode: Código CID-10 (infira se possível)
- bed: Leito/quarto
- insurance: Convênio/plano de saúde
- situation: Situação atual (S do SBAR) — o que está acontecendo agora
- background: Contexto clínico (B do SBAR) — história, antecedentes
- assessment: Avaliação (A do SBAR) — sua análise
- recommendation: Recomendação (R do SBAR) — plano de ação
- confidence: Número de 0 a 100 indicando confiança na extração
- priority: "critical" | "high" | "medium" | "low" — baseado na gravidade descrita

Retorne um JSON válido com a estrutura:
{
  "patients": [
    {
      "name": "Nome do Paciente",
      "age": "45 anos",
      "diagnosis": "Pneumonia",
      "diagnosisCode": "J18.9",
      "bed": "UTI-01",
      "insurance": "Unimed",
      "situation": "Paciente em ventilação mecânica...",
      "background": "Admitido há 3 dias com quadro de...",
      "assessment": "Melhora do padrão respiratório...",
      "recommendation": "Manter antibioticoterapia...",
      "confidence": 85,
      "priority": "high"
    }
  ],
  "totalDetected": 1,
  "summary": "Breve resumo do que foi encontrado no texto"
}

Regras:
- Se não encontrar nenhum paciente, retorne {"patients": [], "totalDetected": 0, "summary": "Nenhum paciente identificado no texto."}
- Se um campo não estiver disponível, deixe como string vazia
- Tente sempre estruturar em SBAR mesmo que o texto original não siga esse formato
- Identifique separadores naturais entre pacientes (quebras de linha, numeração, nomes diferentes, leitos diferentes)
- Para o campo insurance (convênio), procure por: nome de operadora (Unimed, Bradesco Saúde, SulAmérica, Amil, NotreDame, Hapvida, etc.), "particular", "SUS", "convênio", "plano de saúde", ou qualquer menção a cobertura médica. Se o texto mencionar "particular" ou "pagamento direto", use "Particular". Se mencionar "SUS" ou "público", use "SUS".
- Infira a prioridade com base em: UTI/CTI = critical ou high; enfermaria = medium; alta programada/pós-operatório estável = low`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Analise o seguinte texto clínico e extraia todos os pacientes com seus dados estruturados em SBAR:\n\n${text}` }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "text_patient_extraction",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    patients: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          age: { type: "string" },
                          diagnosis: { type: "string" },
                          diagnosisCode: { type: "string" },
                          bed: { type: "string" },
                          insurance: { type: "string" },
                          situation: { type: "string" },
                          background: { type: "string" },
                          assessment: { type: "string" },
                          recommendation: { type: "string" },
                          confidence: { type: "number" },
                          priority: { type: "string" }
                        },
                        required: ["name", "age", "diagnosis", "diagnosisCode", "bed", "insurance", "situation", "background", "assessment", "recommendation", "confidence", "priority"],
                        additionalProperties: false
                      }
                    },
                    totalDetected: { type: "number" },
                    summary: { type: "string" }
                  },
                  required: ["patients", "totalDetected", "summary"],
                  additionalProperties: false
                }
              }
            }
          });

          const messageContent = response.choices[0].message.content;
          const contentStr = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
          const result = JSON.parse(contentStr || '{"patients": [], "totalDetected": 0, "summary": ""}');
          return result as {
            patients: Array<{
              name: string;
              age: string;
              diagnosis: string;
              diagnosisCode: string;
              bed: string;
              insurance: string;
              situation: string;
              background: string;
              assessment: string;
              recommendation: string;
              confidence: number;
              priority: string;
            }>;
            totalDetected: number;
            summary: string;
          };
        } catch (error) {
          console.error("Error analyzing text:", error);
          return { patients: [], totalDetected: 0, summary: "Erro ao analisar o texto." };
        }
      }),
  }),

  // ==================== ADMISSIONS ====================
  admissions: router({
    create: protectedProcedure
      .input(z.object({
        patientId: z.number(),
        hospitalId: z.number(),
        teamId: z.number(),
        bed: z.string().min(1),
        sector: z.string().optional(),
        mainDiagnosis: z.string().optional(),
        secondaryDiagnoses: z.array(z.string()).optional(),
        insuranceProvider: z.string().optional(),
        insuranceNumber: z.string().optional(),
        priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check plan limits (with trial support)
        const user = ctx.user;
        const effectivePlan = getUserPlanWithTrial(user as any);
        const limits = PLAN_LIMITS[effectivePlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
        
        if (limits.patients !== -1) {
          const currentCount = await db.getActivePatientCount(user.id);
          if (currentCount >= limits.patients) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: `Limite de ${limits.patients} pacientes ativos atingido. Faça upgrade do plano.`
            });
          }
        }
        
        const id = await db.createAdmission({ ...input, createdById: ctx.user.id });
        await db.logActivity({
          userId: ctx.user.id,
          action: "create_admission",
          entityType: "admission",
          entityId: id,
        });
        return { id };
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getAdmissionById(input.id);
      }),
    
    byTeam: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getActiveAdmissionsByTeam(input.teamId);
      }),

    byPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return db.getAdmissionsByPatient(input.patientId);
      }),
    
    byHospital: protectedProcedure
      .input(z.object({ hospitalId: z.number() }))
      .query(async ({ input }) => {
        return db.getActiveAdmissionsByHospital(input.hospitalId);
      }),

    byMultipleHospitals: protectedProcedure
      .input(z.object({ hospitalIds: z.array(z.number()) }))
      .query(async ({ input }) => {
        return db.getActiveAdmissionsByMultipleHospitals(input.hospitalIds);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        bed: z.string().optional(),
        sector: z.string().optional(),
        mainDiagnosis: z.string().optional(),
        priority: z.enum(["critical", "high", "medium", "low"]).optional(),
        estimatedDischargeDate: z.date().optional(),
        hospitalId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateAdmission(id, data);
        await db.logActivity({
          userId: ctx.user.id,
          action: "update_admission",
          entityType: "admission",
          entityId: id,
        });
        return { success: true };
      }),
    
    discharge: protectedProcedure
      .input(z.object({
        id: z.number(),
        dischargeType: z.enum(["improved", "cured", "transferred", "deceased", "other"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.dischargePatient(input.id, input.dischargeType);
        await db.logActivity({
          userId: ctx.user.id,
          action: "discharge_patient",
          entityType: "admission",
          entityId: input.id,
        });
        return { success: true };
      }),

    archive: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.archivePatient(input.id);
        await db.logActivity({
          userId: ctx.user.id,
          action: "archive_patient",
          entityType: "admission",
          entityId: input.id,
        });
        return { success: true };
      }),

    latestEvolutions: protectedProcedure
      .input(z.object({ admissionIds: z.array(z.number()) }))
      .query(async ({ input }) => {
        return await db.getLatestEvolutionForAdmissions(input.admissionIds);
      }),

    exportReport: protectedProcedure
      .input(z.object({ admissionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const admission = await db.getAdmissionById(input.admissionId);
        if (!admission) throw new TRPCError({ code: "NOT_FOUND" });
        const patient = await db.getPatientById(admission.patientId);
        const evolutions = await db.getEvolutionsByAdmission(input.admissionId);
        const author = await db.getUserById(ctx.user.id);
        
        return {
          patient: {
            name: patient?.name || "Paciente",
            birthDate: patient?.birthDate,
            gender: patient?.gender,
            bloodType: patient?.bloodType,
            allergies: patient?.allergies,
            comorbidities: patient?.comorbidities,
          },
          admission: {
            bed: admission.bed,
            mainDiagnosis: admission.mainDiagnosis,
            priority: admission.priority,
            admissionDate: admission.admissionDate,
            status: admission.status,
            insuranceProvider: admission.insuranceProvider,
          },
          evolutions: evolutions.map(e => ({
            situation: e.situation,
            background: e.background,
            assessment: e.assessment,
            recommendation: e.recommendation,
            vitalSigns: e.vitalSigns,
            createdAt: e.createdAt,
            isDraft: e.isDraft,
          })),
          author: {
            name: author?.name || "Médico",
            specialty: author?.specialty,
            crm: author?.crm,
          },
          generatedAt: new Date(),
        };
      }),
  }),
  // ==================== EVOLUTIONS (SBAR) =====================
  evolutions: router({
    todayCount: protectedProcedure
      .query(async ({ ctx }) => {
        const count = await db.getTodayEvolutionCount(ctx.user.id);
        return { count };
      }),
    
    byAdmission: protectedProcedure
      .input(z.object({ admissionId: z.number() }))
      .query(async ({ input }) => {
        return db.getEvolutionsByAdmission(input.admissionId);
      }),

    firstByAdmission: protectedProcedure
      .input(z.object({ admissionId: z.number() }))
      .query(async ({ input }) => {
        return db.getFirstEvolutionByAdmission(input.admissionId);
      }),
    
    getDraft: protectedProcedure
      .input(z.object({ admissionId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getDraftEvolution(input.admissionId, ctx.user.id);
      }),
    
    saveDraft: protectedProcedure
      .input(z.object({
        admissionId: z.number(),
        situation: z.string().optional(),
        background: z.string().optional(),
        assessment: z.string().optional(),
        recommendation: z.string().optional(),
        vitalSigns: z.object({
          temperature: z.number().optional(),
          heartRate: z.number().optional(),
          bloodPressure: z.string().optional(),
          respiratoryRate: z.number().optional(),
          oxygenSaturation: z.number().optional(),
          painLevel: z.number().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { admissionId, ...data } = input;
        const id = await db.saveDraft(admissionId, ctx.user.id, data);
        return { id };
      }),
    
    finalize: protectedProcedure
      .input(z.object({
        admissionId: z.number(),
        situation: z.string(),
        background: z.string(),
        assessment: z.string(),
        recommendation: z.string(),
        vitalSigns: z.object({
          temperature: z.number().optional(),
          heartRate: z.number().optional(),
          bloodPressure: z.string().optional(),
          respiratoryRate: z.number().optional(),
          oxygenSaturation: z.number().optional(),
          painLevel: z.number().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { admissionId, ...data } = input;
        
        // Check for existing draft
        const draft = await db.getDraftEvolution(admissionId, ctx.user.id);
        let evolutionId: number;
        
        if (draft) {
          await db.updateEvolution(draft.id, { ...data, isDraft: false, lockedAt: new Date() });
          evolutionId = draft.id;
        } else {
          evolutionId = await db.createEvolution({
            admissionId,
            authorId: ctx.user.id,
            ...data,
            isDraft: false,
            lockedAt: new Date(),
          });
        }
        
        await db.logActivity({
          userId: ctx.user.id,
          action: "create_evolution",
          entityType: "evolution",
          entityId: evolutionId,
        });
        
        return { id: evolutionId };
      }),

    edit: protectedProcedure
      .input(z.object({
        evolutionId: z.number(),
        situation: z.string().optional(),
        background: z.string().optional(),
        assessment: z.string().optional(),
        recommendation: z.string().optional(),
        vitalSigns: z.object({
          temperature: z.number().optional(),
          heartRate: z.number().optional(),
          bloodPressure: z.string().optional(),
          respiratoryRate: z.number().optional(),
          oxygenSaturation: z.number().optional(),
          painLevel: z.number().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { evolutionId, ...data } = input;
        
        // Get the evolution to check authorship
        const evolution = await db.getEvolutionById(evolutionId);
        
        if (!evolution) throw new TRPCError({ code: 'NOT_FOUND', message: 'Evolução não encontrada' });
        if (evolution.authorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas o autor pode editar esta evolução' });
        }
        
        await db.updateEvolution(evolutionId, {
          ...data,
          lastEditedById: ctx.user.id,
          lastEditedAt: new Date(),
        });
        
        await db.logActivity({
          userId: ctx.user.id,
          action: "update_evolution" as any,
          entityType: "evolution",
          entityId: evolutionId,
        });
        
        return { success: true };
      }),
  }),

  // ==================== AI PREDICTIONS ====================
  ai: router({
    predictDischarge: protectedProcedure
      .input(z.object({ admissionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const admission = await db.getAdmissionById(input.admissionId);
        if (!admission) throw new TRPCError({ code: "NOT_FOUND" });
        
        const patient = await db.getPatientById(admission.patientId);
        const evolutions = await db.getEvolutionsByAdmission(input.admissionId);
        
        const prompt = `Você é um médico especialista analisando dados de um paciente internado.
        
Paciente: ${patient?.name}
Diagnóstico principal: ${admission.mainDiagnosis || "Não informado"}
Diagnósticos secundários: ${admission.secondaryDiagnoses?.join(", ") || "Nenhum"}
Comorbidades: ${patient?.comorbidities || "Nenhuma"}
Data de internação: ${admission.admissionDate}
Prioridade atual: ${admission.priority}

Últimas evoluções (SBAR):
${evolutions.slice(0, 5).map(e => `
- Situação: ${e.situation}
- Background: ${e.background}
- Avaliação: ${e.assessment}
- Recomendação: ${e.recommendation}
`).join("\n")}

Com base nestes dados, forneça:
1. Probabilidade de alta nos próximos 3 dias (0-100%)
2. Tempo estimado de internação restante (em dias)
3. Principais fatores que influenciam esta previsão
4. Recomendações para acelerar a alta

Responda em formato JSON.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um assistente médico especializado em análise preditiva hospitalar. Responda sempre em JSON válido." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "discharge_prediction",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  dischargeProbability3Days: { type: "number", description: "Probabilidade de alta em 3 dias (0-100)" },
                  estimatedDaysRemaining: { type: "number", description: "Dias estimados de internação restante" },
                  factors: { 
                    type: "array", 
                    items: { 
                      type: "object",
                      properties: {
                        factor: { type: "string" },
                        impact: { type: "string", enum: ["positive", "negative", "neutral"] }
                      },
                      required: ["factor", "impact"],
                      additionalProperties: false
                    }
                  },
                  recommendations: { type: "array", items: { type: "string" } }
                },
                required: ["dischargeProbability3Days", "estimatedDaysRemaining", "factors", "recommendations"],
                additionalProperties: false
              }
            }
          }
        });

        const content = response.choices[0].message.content;
        const prediction = JSON.parse(typeof content === 'string' ? content : "{}");
        
        await db.createAiPrediction({
          admissionId: input.admissionId,
          predictionType: "discharge",
          predictedValue: JSON.stringify(prediction),
          confidence: String(prediction.dischargeProbability3Days),
          factors: prediction.factors,
          modelVersion: "v1.0"
        });
        
        return prediction;
      }),
    
    getLatestPrediction: protectedProcedure
      .input(z.object({ admissionId: z.number(), type: z.enum(["discharge", "prognosis", "risk"]) }))
      .query(async ({ input }) => {
        const prediction = await db.getLatestPrediction(input.admissionId, input.type);
        if (!prediction) return null;
        return {
          ...prediction,
          predictedValue: JSON.parse(prediction.predictedValue)
        };
      }),
  }),

  // ==================== ANALYTICS ====================
  analytics: router({
    teamProductivity: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return db.getTeamProductivityStats(input.teamId, input.startDate, input.endDate);
      }),
    
    hospitalDashboard: protectedProcedure
      .input(z.object({
        hospitalId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return db.getHospitalAnalytics(input.hospitalId, input.startDate, input.endDate);
      }),
  }),

  // ==================== NOTIFICATIONS ====================
  notifications: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(20),
        category: z.enum(['system', 'patient', 'team', 'recovery_room']).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (input?.category) {
          return db.getNotificationsByCategory(ctx.user.id, input.category, input.limit);
        }
        return db.getUserNotifications(ctx.user.id, input?.limit || 20);
      }),
    
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount(ctx.user.id);
    }),
    
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationRead(input.id);
        return { success: true };
      }),
    
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteNotification(input.id);
        return { success: true };
      }),
    
    // Enviar notificação de passagem de plantão
    sendHandoff: protectedProcedure
      .input(z.object({
        toUserId: z.number(),
        patientName: z.string(),
        patientId: z.number(),
        sbarSummary: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createHandoffNotification(
          input.toUserId,
          ctx.user.name || 'Usuário',
          ctx.user.id,
          input.patientName,
          input.patientId,
          input.sbarSummary
        );
        return { success: true };
      }),
    
    // Enviar notificação de alta da RPA
    sendDischarge: protectedProcedure
      .input(z.object({
        toUserId: z.number(),
        patientName: z.string(),
        patientId: z.number(),
        destination: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createDischargeNotification(
          input.toUserId,
          ctx.user.name || 'Usuário',
          input.patientName,
          input.patientId,
          input.destination
        );
        return { success: true };
      }),
    
    // Enviar notificação de atualização de status
    sendStatusUpdate: protectedProcedure
      .input(z.object({
        toUserId: z.number(),
        patientName: z.string(),
        patientId: z.number(),
        newStatus: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createStatusUpdateNotification(
          input.toUserId,
          ctx.user.name || 'Usuário',
          input.patientName,
          input.patientId,
          input.newStatus,
          input.priority
        );
        return { success: true };
      }),

    // ==================== WEB PUSH ====================
    
    // Obter chave pública VAPID
    getVapidPublicKey: publicProcedure.query(() => {
      return { publicKey: webPush.getVapidPublicKey() };
    }),

    // Registrar subscription de push
    subscribePush: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
        userAgent: z.string().optional(),
        deviceName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.savePushSubscription(
          ctx.user.id,
          input.endpoint,
          input.p256dh,
          input.auth,
          input.userAgent,
          input.deviceName
        );
        return { success: true, subscriptionId: id };
      }),

    // Remover subscription de push
    unsubscribePush: protectedProcedure
      .input(z.object({ endpoint: z.string() }))
      .mutation(async ({ input }) => {
        await db.removePushSubscription(input.endpoint);
        return { success: true };
      }),

    // Listar subscriptions do usuário
    listPushSubscriptions: protectedProcedure.query(async ({ ctx }) => {
      const subscriptions = await db.getUserPushSubscriptions(ctx.user.id);
      return subscriptions.map(s => ({
        id: s.id,
        deviceName: s.deviceName || 'Dispositivo desconhecido',
        active: s.active,
        lastUsed: s.lastUsed,
        createdAt: s.createdAt,
      }));
    }),

    // Testar push notification
    testPush: protectedProcedure.mutation(async ({ ctx }) => {
      const subscriptions = await db.getUserPushSubscriptions(ctx.user.id);
      
      if (subscriptions.length === 0) {
        throw new TRPCError({ 
          code: 'NOT_FOUND', 
          message: 'Nenhuma subscription de push encontrada. Ative as notificações primeiro.' 
        });
      }

      const payload: webPush.PushNotificationPayload = {
        title: '🔔 Teste de Notificação',
        body: 'Se você está vendo isso, as notificações push estão funcionando!',
        icon: '/icons/notification-icon.png',
        tag: 'test-notification',
        data: {
          type: 'test',
          url: '/settings'
        }
      };

      const results = await webPush.sendPushToMultiple(
        subscriptions.map(s => ({
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth }
        })),
        payload
      );

      // Desativar subscriptions expiradas
      for (const endpoint of results.expiredEndpoints) {
        await db.deactivatePushSubscription(endpoint);
      }

      return { 
        success: results.success > 0,
        sent: results.success,
        failed: results.failed
      };
    }),

    // Enviar push de passagem de plantão
    sendHandoffPush: protectedProcedure
      .input(z.object({
        toUserId: z.number(),
        patientName: z.string(),
        patientId: z.number(),
        sbarSummary: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Criar notificação no banco
        await db.createHandoffNotification(
          input.toUserId,
          ctx.user.name || 'Usuário',
          ctx.user.id,
          input.patientName,
          input.patientId,
          input.sbarSummary || ''
        );

        // Enviar push notification
        const subscriptions = await db.getUserPushSubscriptions(input.toUserId);
        if (subscriptions.length > 0) {
          const payload = webPush.createHandoffPushPayload(
            ctx.user.name || 'Usuário',
            input.patientName,
            input.patientId,
            input.sbarSummary
          );

          const results = await webPush.sendPushToMultiple(
            subscriptions.map(s => ({
              endpoint: s.endpoint,
              keys: { p256dh: s.p256dh, auth: s.auth }
            })),
            payload
          );

          // Desativar subscriptions expiradas
          for (const endpoint of results.expiredEndpoints) {
            await db.deactivatePushSubscription(endpoint);
          }
        }

        return { success: true };
      }),

    // Enviar push de alta da RPA
    sendDischargePush: protectedProcedure
      .input(z.object({
        toUserId: z.number(),
        patientName: z.string(),
        patientId: z.number(),
        destination: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Criar notificação no banco
        await db.createDischargeNotification(
          input.toUserId,
          ctx.user.name || 'Usuário',
          input.patientName,
          input.patientId,
          input.destination
        );

        // Enviar push notification
        const subscriptions = await db.getUserPushSubscriptions(input.toUserId);
        if (subscriptions.length > 0) {
          const payload = webPush.createDischargePushPayload(
            ctx.user.name || 'Usuário',
            input.patientName,
            input.patientId,
            input.destination
          );

          await webPush.sendPushToMultiple(
            subscriptions.map(s => ({
              endpoint: s.endpoint,
              keys: { p256dh: s.p256dh, auth: s.auth }
            })),
            payload
          );
        }

        return { success: true };
      }),

    // Enviar push de status crítico
    sendCriticalPush: protectedProcedure
      .input(z.object({
        toUserIds: z.array(z.number()),
        patientName: z.string(),
        patientId: z.number(),
        statusMessage: z.string(),
      }))
      .mutation(async ({ input }) => {
        const allSubscriptions = await db.getMultipleUsersPushSubscriptions(input.toUserIds);
        
        if (allSubscriptions.length > 0) {
          const payload = webPush.createCriticalStatusPushPayload(
            input.patientName,
            input.patientId,
            input.statusMessage
          );

          await webPush.sendPushToMultiple(
            allSubscriptions.map(s => ({
              endpoint: s.endpoint,
              keys: { p256dh: s.p256dh, auth: s.auth }
            })),
            payload
          );
        }

        return { success: true };
      }),
  }),

  // ==================== TRANSLATION ====================
  translation: router({
    // Get supported languages
    languages: publicProcedure.query(() => {
      return Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
        code: code as SupportedLanguage,
        name,
      }));
    }),

    // Detect language of text
    detect: publicProcedure
      .input(z.object({ text: z.string() }))
      .query(({ input }) => {
        const detected = detectLanguage(input.text);
        return {
          language: detected,
          languageName: SUPPORTED_LANGUAGES[detected],
        };
      }),

    // Translate single text
    translate: protectedProcedure
      .input(z.object({
        text: z.string().min(1).max(10000),
        targetLanguage: z.enum(['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'zh-CN']),
        context: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await translateClinicalContent(
          input.text,
          input.targetLanguage,
          input.context
        );
        return result;
      }),

    // Translate SBAR evolution
    translateEvolution: protectedProcedure
      .input(z.object({
        evolutionId: z.number(),
        targetLanguage: z.enum(['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'zh-CN']),
      }))
      .mutation(async ({ input }) => {
        const evolution = await db.getEvolutionById(input.evolutionId);
        if (!evolution) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Evolution not found' });
        }

        const fieldsToTranslate = [
          { key: 'situation', value: evolution.situation },
          { key: 'background', value: evolution.background },
          { key: 'assessment', value: evolution.assessment },
          { key: 'recommendation', value: evolution.recommendation },
        ].filter(f => f.value);

        const translations: Record<string, string> = {};
        
        for (const field of fieldsToTranslate) {
          if (field.value) {
            const result = await translateClinicalContent(
              field.value,
              input.targetLanguage,
              `SBAR ${field.key} section`
            );
            translations[field.key] = result.translatedText;
          }
        }

        return {
          evolutionId: input.evolutionId,
          targetLanguage: input.targetLanguage,
          translations,
        };
      }),

    // Batch translate multiple texts
    translateBatch: protectedProcedure
      .input(z.object({
        texts: z.array(z.string().min(1).max(5000)).max(10),
        targetLanguage: z.enum(['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'zh-CN']),
      }))
      .mutation(async ({ input }) => {
        const results = await translateBatch(input.texts, input.targetLanguage);
        return results;
      }),
  }),

  // ==================== ADMIN MONITORING ====================
  admin: router({
    // Dashboard de monitoramento - apenas admin
    systemStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Banco de dados indisponível' });
      
      const [usersCount] = await database.select({ count: sql<number>`count(*)` }).from(users);
      const [patientsCount] = await database.select({ count: sql<number>`count(*)` }).from(patients);
      const [admissionsActive] = await database.select({ count: sql<number>`count(*)` }).from(admissions).where(eq(admissions.status, 'active'));
      const [admissionsTotal] = await database.select({ count: sql<number>`count(*)` }).from(admissions);
      const [evolutionsTotal] = await database.select({ count: sql<number>`count(*)` }).from(evolutions);
      const [evolutionsToday] = await database.select({ count: sql<number>`count(*)` }).from(evolutions).where(gte(evolutions.createdAt, sql`CURDATE()`));
      const [hospitalsCount] = await database.select({ count: sql<number>`count(*)` }).from(hospitals);
      const [teamsCount] = await database.select({ count: sql<number>`count(*)` }).from(teams);
      const [aiPredictionsCount] = await database.select({ count: sql<number>`count(*)` }).from(aiPredictions);
      
      return {
        usuarios: usersCount.count,
        pacientes: patientsCount.count,
        internacoesAtivas: admissionsActive.count,
        internacoesTotal: admissionsTotal.count,
        evolucoesTotal: evolutionsTotal.count,
        evolucoesHoje: evolutionsToday.count,
        hospitais: hospitalsCount.count,
        equipes: teamsCount.count,
        analisesIA: aiPredictionsCount.count,
      };
    }),

    recentActivity: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
        const database = await getDb();
        if (!database) return [];
        
        const logs = await database
          .select({
            id: activityLogs.id,
            action: activityLogs.action,
            entityType: activityLogs.entityType,
            entityId: activityLogs.entityId,
            metadata: activityLogs.metadata,
            ipAddress: activityLogs.ipAddress,
            createdAt: activityLogs.createdAt,
            userName: users.name,
          })
          .from(activityLogs)
          .leftJoin(users, eq(activityLogs.userId, users.id))
          .orderBy(desc(activityLogs.createdAt))
          .limit(input.limit);
        
        return logs;
      }),

    evolutionsByDay: protectedProcedure
      .input(z.object({ days: z.number().min(1).max(90).default(30) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
        const database = await getDb();
        if (!database) return [];
        
        try {
          const result = await database
            .select({
              date: sql<string>`DATE(\`evolutions\`.\`createdAt\`)`,
              count: sql<number>`CAST(count(*) AS UNSIGNED)`,
            })
            .from(evolutions)
            .where(sql`\`evolutions\`.\`createdAt\` >= DATE_SUB(CURDATE(), INTERVAL ${input.days} DAY)`)
            .groupBy(sql`DATE(\`evolutions\`.\`createdAt\`)`)
            .orderBy(sql`DATE(\`evolutions\`.\`createdAt\`)`);
          
          return result.map(r => ({ date: String(r.date), count: Number(r.count) }));
        } catch (e) {
          console.error('evolutionsByDay query error:', e);
          return [];
        }
      }),

    usersList: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
      const database = await getDb();
      if (!database) return [];
      
      const usersList = await database
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          plan: users.plan,
          specialty: users.specialty,
          crm: users.crm,
          professionalType: users.professionalType,
          councilType: users.councilType,
          councilNumber: users.councilNumber,
          councilState: users.councilState,
          cpf: users.cpf,
          verificationStatus: users.verificationStatus,
          verificationDate: users.verificationDate,
          verificationNotes: users.verificationNotes,
          university: users.university,
          enrollmentNumber: users.enrollmentNumber,
          lastSignedIn: users.lastSignedIn,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.lastSignedIn));
      
      return usersList;
    }),

    // Verificar/aprovar/rejeitar usuário
    updateUserVerification: protectedProcedure
      .input(z.object({
        userId: z.number(),
        status: z.enum(['verified', 'rejected', 'pending', 'unverified']),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const updateData: any = {
          verificationStatus: input.status,
          verificationNotes: input.notes || null,
        };
        if (input.status === 'verified') {
          updateData.verificationDate = new Date();
        }
        
        await database.update(users).set(updateData).where(eq(users.id, input.userId));
        return { success: true };
      }),

    // Support tickets management
    supportTickets: protectedProcedure
      .input(z.object({ status: z.enum(['open', 'in_progress', 'resolved', 'closed', 'all']).default('all') }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
        const database = await getDb();
        if (!database) return [];
        
        let query = database
          .select({
            id: supportTickets.id,
            type: supportTickets.type,
            subject: supportTickets.subject,
            description: supportTickets.description,
            status: supportTickets.status,
            priority: supportTickets.priority,
            adminNotes: supportTickets.adminNotes,
            userAgent: supportTickets.userAgent,
            pageUrl: supportTickets.pageUrl,
            createdAt: supportTickets.createdAt,
            updatedAt: supportTickets.updatedAt,
            resolvedAt: supportTickets.resolvedAt,
            userName: users.name,
            userEmail: users.email,
          })
          .from(supportTickets)
          .leftJoin(users, eq(supportTickets.userId, users.id))
          .orderBy(desc(supportTickets.createdAt));
        
        if (input.status !== 'all') {
          query = query.where(eq(supportTickets.status, input.status)) as any;
        }
        
        return query;
      }),

    updateTicket: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const updateData: any = {};
        if (input.status) updateData.status = input.status;
        if (input.priority) updateData.priority = input.priority;
        if (input.adminNotes !== undefined) updateData.adminNotes = input.adminNotes;
        if (input.status === 'resolved') {
          updateData.resolvedAt = new Date();
          updateData.resolvedById = ctx.user.id;
        }
        
        await database.update(supportTickets).set(updateData).where(eq(supportTickets.id, input.id));
        return { success: true };
      }),
  }),

  // Support tickets - user-facing
  support: router({
    submit: protectedProcedure
      .input(z.object({
        type: z.enum(['bug', 'suggestion', 'question', 'security']),
        subject: z.string().min(3).max(256),
        description: z.string().min(10).max(5000),
        pageUrl: z.string().optional(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Banco de dados indisponível' });
        
        await database.insert(supportTickets).values({
          userId: ctx.user.id,
          type: input.type,
          subject: input.subject,
          description: input.description,
          pageUrl: input.pageUrl || null,
          userAgent: input.userAgent || null,
        });
        
        // Notify admin via system notification
        try {
          const { notifyOwner } = await import('./_core/notification');
          await notifyOwner({
            title: `Novo ticket de suporte: ${input.type === 'bug' ? 'Bug' : input.type === 'suggestion' ? 'Sugest\u00e3o' : input.type === 'security' ? 'Seguran\u00e7a' : 'D\u00favida'}`,
            content: `**${input.subject}**\n\nDe: ${ctx.user.name || 'Usu\u00e1rio'}\n\n${input.description.slice(0, 200)}${input.description.length > 200 ? '...' : ''}`,
          });
        } catch (e) {
          console.error('Failed to notify owner about support ticket:', e);
        }
        
        return { success: true, message: 'Ticket enviado com sucesso!' };
      }),

    myTickets: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return [];
      
      return database
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.userId, ctx.user.id))
        .orderBy(desc(supportTickets.createdAt));
    }),
  }),
});

export type AppRouter = typeof appRouter;
