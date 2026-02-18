import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getVapidPublicKey,
  createHandoffPushPayload,
  createDischargePushPayload,
  createCriticalStatusPushPayload,
  type PushNotificationPayload
} from './webPush';

describe('Web Push Service', () => {
  describe('getVapidPublicKey', () => {
    it('should return a non-empty string', () => {
      const publicKey = getVapidPublicKey();
      expect(typeof publicKey).toBe('string');
      expect(publicKey.length).toBeGreaterThan(0);
    });

    it('should return a base64url encoded key', () => {
      const publicKey = getVapidPublicKey();
      // VAPID public keys are base64url encoded
      expect(publicKey).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('createHandoffPushPayload', () => {
    it('should create a valid handoff notification payload', () => {
      const payload = createHandoffPushPayload(
        'Dr. Silva',
        'João Santos',
        123,
        'Paciente estável, monitorar PA'
      );

      expect(payload.title).toContain('Passagem de Plantão');
      expect(payload.body).toContain('Dr. Silva');
      expect(payload.body).toContain('João Santos');
      expect(payload.tag).toBe('handoff-123');
      expect(payload.data?.type).toBe('handoff');
      expect(payload.data?.patientId).toBe(123);
      expect(payload.requireInteraction).toBe(true);
    });

    it('should include patient name in body', () => {
      const payload = createHandoffPushPayload(
        'Dr. Silva',
        'João Santos',
        123,
        'Paciente estável'
      );

      expect(payload.body).toContain('João Santos');
      expect(payload.body).toContain('Dr. Silva');
    });

    it('should work without SBAR summary', () => {
      const payload = createHandoffPushPayload(
        'Dr. Silva',
        'João Santos',
        123
      );

      expect(payload.title).toContain('Passagem de Plantão');
      expect(payload.body).toBeDefined();
    });
  });

  describe('createDischargePushPayload', () => {
    it('should create a valid discharge notification payload', () => {
      const payload = createDischargePushPayload(
        'Dr. Silva',
        'João Santos',
        123,
        'Enfermaria 3B'
      );

      expect(payload.title).toContain('Alta');
      expect(payload.body).toContain('João Santos');
      expect(payload.body).toContain('Enfermaria 3B');
      expect(payload.tag).toBe('discharge-123');
      expect(payload.data?.type).toBe('discharge');
      expect(payload.data?.patientId).toBe(123);
    });
  });

  describe('createCriticalStatusPushPayload', () => {
    it('should create a valid critical status notification payload', () => {
      const payload = createCriticalStatusPushPayload(
        'João Santos',
        123,
        'Queda de saturação para 88%'
      );

      expect(payload.title).toContain('ALERTA CRÍTICO');
      expect(payload.body).toContain('João Santos');
      expect(payload.body).toContain('Queda de saturação');
      expect(payload.tag).toBe('critical-123');
      expect(payload.data?.type).toBe('critical');
      expect(payload.data?.patientId).toBe(123);
      expect(payload.requireInteraction).toBe(true);
    });

    it('should have vibration pattern for critical alerts', () => {
      const payload = createCriticalStatusPushPayload(
        'João Santos',
        123,
        'Queda de saturação'
      );

      expect(payload.vibrate).toBeDefined();
      expect(Array.isArray(payload.vibrate)).toBe(true);
    });
  });

  describe('PushNotificationPayload structure', () => {
    it('should have required fields', () => {
      const payload: PushNotificationPayload = {
        title: 'Test',
        body: 'Test body',
        tag: 'test-tag',
        data: { type: 'test', url: '/test' }
      };

      expect(payload.title).toBeDefined();
      expect(payload.body).toBeDefined();
      expect(payload.tag).toBeDefined();
      expect(payload.data).toBeDefined();
    });

    it('should support optional fields', () => {
      const payload: PushNotificationPayload = {
        title: 'Test',
        body: 'Test body',
        icon: '/icon.png',
        badge: '/badge.png',
        tag: 'test-tag',
        requireInteraction: true,
        vibrate: [100, 50, 100],
        actions: [
          { action: 'view', title: 'Ver' }
        ],
        data: { type: 'test' }
      };

      expect(payload.icon).toBe('/icon.png');
      expect(payload.badge).toBe('/badge.png');
      expect(payload.requireInteraction).toBe(true);
      expect(payload.vibrate).toEqual([100, 50, 100]);
      expect(payload.actions).toHaveLength(1);
    });
  });
});
