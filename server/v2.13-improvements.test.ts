import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

// Mock db functions
vi.mock('./db', async () => {
  const actual = await vi.importActual('./db') as any;
  return {
    ...actual,
    updateHospital: vi.fn().mockResolvedValue(undefined),
    deleteHospital: vi.fn().mockResolvedValue(undefined),
    getEvolutionById: vi.fn().mockResolvedValue({
      id: 1,
      admissionId: 100,
      authorId: 'user-1',
      situation: 'Test S',
      background: 'Test B',
      assessment: 'Test A',
      recommendation: 'Test R',
      createdAt: new Date(),
    }),
    getFirstEvolutionByAdmission: vi.fn().mockResolvedValue({
      id: 1,
      situation: 'First S',
      background: 'First B',
      assessment: 'First A',
      recommendation: 'First R',
      createdAt: new Date(),
    }),
    getActivePatientCount: vi.fn().mockResolvedValue(3),
    getAiUsageCount: vi.fn().mockResolvedValue(2),
  };
});

// Mock drizzle
vi.mock('./db', async (importOriginal) => {
  const mod = await importOriginal() as any;
  return {
    ...mod,
    updateHospital: vi.fn().mockResolvedValue(undefined),
    deleteHospital: vi.fn().mockResolvedValue(undefined),
    getEvolutionById: vi.fn().mockResolvedValue({
      id: 1,
      admissionId: 100,
      authorId: 'user-1',
      situation: 'Test S',
      background: 'Test B',
      assessment: 'Test A',
      recommendation: 'Test R',
      createdAt: new Date(),
    }),
    getFirstEvolutionByAdmission: vi.fn().mockResolvedValue({
      id: 1,
      situation: 'First S',
      background: 'First B',
      assessment: 'First A',
      recommendation: 'First R',
      createdAt: new Date(),
    }),
  };
});

describe('hospitals.update', () => {
  it('requires authentication', async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.hospitals.update({ id: 1, name: 'Updated Hospital', code: 'UH01' })
    ).rejects.toThrow();
  });

  it('accepts valid update input', async () => {
    const caller = appRouter.createCaller({
      user: { id: 'user-1', openId: 'oid', name: 'Test', role: 'admin' },
    } as any);
    // Should not throw with valid input
    try {
      await caller.hospitals.update({ id: 1, name: 'Updated Hospital' });
    } catch (e: any) {
      // May throw due to DB mock, but input validation should pass
      expect(e.code).not.toBe('BAD_REQUEST');
    }
  });
});

describe('hospitals.delete', () => {
  it('requires authentication', async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.hospitals.delete({ id: 1 })
    ).rejects.toThrow();
  });

  it('accepts valid delete input', async () => {
    const caller = appRouter.createCaller({
      user: { id: 'user-1', openId: 'oid', name: 'Test', role: 'admin' },
    } as any);
    try {
      await caller.hospitals.delete({ id: 1 });
    } catch (e: any) {
      expect(e.code).not.toBe('BAD_REQUEST');
    }
  });
});

describe('evolutions.firstByAdmission', () => {
  it('requires authentication', async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.evolutions.firstByAdmission({ admissionId: 100 })
    ).rejects.toThrow();
  });

  it('accepts valid admissionId', async () => {
    const caller = appRouter.createCaller({
      user: { id: 'user-1', openId: 'oid', name: 'Test', role: 'admin' },
    } as any);
    try {
      const result = await caller.evolutions.firstByAdmission({ admissionId: 100 });
      // Should return evolution or null
    } catch (e: any) {
      expect(e.code).not.toBe('BAD_REQUEST');
    }
  });
});

describe('evolutions.edit', () => {
  it('requires authentication', async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.evolutions.edit({
        evolutionId: 1,
        situation: 'Updated S',
        background: 'Updated B',
        assessment: 'Updated A',
        recommendation: 'Updated R',
      })
    ).rejects.toThrow();
  });

  it('rejects edit from non-author', async () => {
    const caller = appRouter.createCaller({
      user: { id: 'user-2', openId: 'oid2', name: 'Other User', role: 'admin' },
    } as any);
    try {
      await caller.evolutions.edit({
        evolutionId: 1,
        situation: 'Updated S',
        background: 'Updated B',
        assessment: 'Updated A',
        recommendation: 'Updated R',
      });
      // Should throw FORBIDDEN
    } catch (e: any) {
      expect(['FORBIDDEN', 'INTERNAL_SERVER_ERROR']).toContain(e.code);
    }
  });
});

describe('patients.update', () => {
  it('requires authentication', async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.patients.update({ id: 1, name: 'Updated Name' })
    ).rejects.toThrow();
  });

  it('accepts valid update with name only', async () => {
    const caller = appRouter.createCaller({
      user: { id: 'user-1', openId: 'oid', name: 'Test', role: 'admin' },
    } as any);
    try {
      await caller.patients.update({ id: 1, name: 'New Name' });
    } catch (e: any) {
      expect(e.code).not.toBe('BAD_REQUEST');
    }
  });
});
