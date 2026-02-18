import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do banco de dados
vi.mock('./db', () => ({
  createNotification: vi.fn().mockResolvedValue({ insertId: 1 }),
  getUserNotifications: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      title: 'Passagem de Plantão - Maria Silva',
      message: 'Dr. Carlos transferiu a responsabilidade do paciente Maria Silva para você.',
      type: 'handoff',
      category: 'recovery_room',
      read: false,
      createdAt: new Date(),
      metadata: {
        patientId: 1,
        patientName: 'Maria Silva',
        fromUserName: 'Dr. Carlos',
        priority: 'high'
      }
    },
    {
      id: 2,
      userId: 1,
      title: 'Alta da RPA - João Santos',
      message: 'Dra. Ana deu alta ao paciente João Santos. Destino: Enfermaria.',
      type: 'discharge',
      category: 'recovery_room',
      read: true,
      createdAt: new Date(Date.now() - 3600000),
      metadata: {
        patientId: 2,
        patientName: 'João Santos',
        fromUserName: 'Dra. Ana',
        priority: 'medium'
      }
    }
  ]),
  getUnreadNotificationCount: vi.fn().mockResolvedValue(1),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  deleteNotification: vi.fn().mockResolvedValue(undefined),
  createHandoffNotification: vi.fn().mockResolvedValue({ insertId: 3 }),
  createDischargeNotification: vi.fn().mockResolvedValue({ insertId: 4 }),
  createStatusUpdateNotification: vi.fn().mockResolvedValue({ insertId: 5 }),
}));

import * as db from './db';

describe('Notification System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should return list of notifications for user', async () => {
      const notifications = await db.getUserNotifications(1);
      
      expect(notifications).toHaveLength(2);
      expect(notifications[0].type).toBe('handoff');
      expect(notifications[1].type).toBe('discharge');
    });

    it('should include metadata with patient info', async () => {
      const notifications = await db.getUserNotifications(1);
      
      expect(notifications[0].metadata).toBeDefined();
      expect(notifications[0].metadata.patientName).toBe('Maria Silva');
      expect(notifications[0].metadata.priority).toBe('high');
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return count of unread notifications', async () => {
      const count = await db.getUnreadNotificationCount(1);
      
      expect(count).toBe(1);
    });
  });

  describe('markNotificationRead', () => {
    it('should mark notification as read', async () => {
      await db.markNotificationRead(1);
      
      expect(db.markNotificationRead).toHaveBeenCalledWith(1);
    });
  });

  describe('markAllNotificationsRead', () => {
    it('should mark all notifications as read for user', async () => {
      await db.markAllNotificationsRead(1);
      
      expect(db.markAllNotificationsRead).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification by id', async () => {
      await db.deleteNotification(1);
      
      expect(db.deleteNotification).toHaveBeenCalledWith(1);
    });
  });

  describe('createHandoffNotification', () => {
    it('should create handoff notification with correct data', async () => {
      await db.createHandoffNotification(
        2, // toUserId
        'Dr. Carlos',
        1, // fromUserId
        'Maria Silva',
        1, // patientId
        'Paciente estável, Aldrete 9/10'
      );
      
      expect(db.createHandoffNotification).toHaveBeenCalledWith(
        2,
        'Dr. Carlos',
        1,
        'Maria Silva',
        1,
        'Paciente estável, Aldrete 9/10'
      );
    });
  });

  describe('createDischargeNotification', () => {
    it('should create discharge notification with destination', async () => {
      await db.createDischargeNotification(
        99, // toUserId (surgeon)
        'Dra. Ana',
        'João Santos',
        2, // patientId
        'Enfermaria'
      );
      
      expect(db.createDischargeNotification).toHaveBeenCalledWith(
        99,
        'Dra. Ana',
        'João Santos',
        2,
        'Enfermaria'
      );
    });
  });

  describe('createStatusUpdateNotification', () => {
    it('should create status update notification with priority', async () => {
      await db.createStatusUpdateNotification(
        1, // toUserId
        'Enf. Maria',
        'Pedro Lima',
        3, // patientId
        'Atenção - SpO2 baixo',
        'high'
      );
      
      expect(db.createStatusUpdateNotification).toHaveBeenCalledWith(
        1,
        'Enf. Maria',
        'Pedro Lima',
        3,
        'Atenção - SpO2 baixo',
        'high'
      );
    });
  });
});

describe('Notification Types', () => {
  it('should support handoff notification type', async () => {
    const notifications = await db.getUserNotifications(1);
    const handoffNotification = notifications.find(n => n.type === 'handoff');
    
    expect(handoffNotification).toBeDefined();
    expect(handoffNotification?.category).toBe('recovery_room');
  });

  it('should support discharge notification type', async () => {
    const notifications = await db.getUserNotifications(1);
    const dischargeNotification = notifications.find(n => n.type === 'discharge');
    
    expect(dischargeNotification).toBeDefined();
    expect(dischargeNotification?.category).toBe('recovery_room');
  });

  it('should track read status correctly', async () => {
    const notifications = await db.getUserNotifications(1);
    
    expect(notifications[0].read).toBe(false);
    expect(notifications[1].read).toBe(true);
  });
});

describe('Notification Priority', () => {
  it('should support high priority for handoff', async () => {
    const notifications = await db.getUserNotifications(1);
    const handoffNotification = notifications.find(n => n.type === 'handoff');
    
    expect(handoffNotification?.metadata.priority).toBe('high');
  });

  it('should support medium priority for discharge', async () => {
    const notifications = await db.getUserNotifications(1);
    const dischargeNotification = notifications.find(n => n.type === 'discharge');
    
    expect(dischargeNotification?.metadata.priority).toBe('medium');
  });
});
