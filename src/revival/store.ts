import { create } from 'zustand';

import { localDataService } from './storage/service';
import {
  cancelLocalNotification,
  scheduleLocalNotification,
} from './notifications';
import {
  BackupExportResult,
  BackupHistory,
  BackupRestoreResult,
  createLocalId,
  LocalReminder,
  LocalProfile,
  LocalRecord,
  LocalRecordDraft,
  RecordAttachments,
  ScheduledGame,
  Stadium,
} from './storage/types';

export type { LocalProfile, LocalRecord } from './storage/types';

type RevivalState = {
  hydrated: boolean;
  hydrationError: string | null;
  scheduleRefreshing: boolean;
  scheduleSyncError: string | null;
  profile: LocalProfile | null;
  records: LocalRecord[];
  games: ScheduledGame[];
  stadiums: Stadium[];
  reminders: LocalReminder[];
  latestBackup: BackupHistory | null;
  hydrate: () => Promise<void>;
  refreshSchedule: () => Promise<void>;
  saveProfile: (profile: LocalProfile) => Promise<void>;
  saveRecord: (
    record: LocalRecordDraft,
    attachments?: RecordAttachments,
  ) => Promise<LocalRecord>;
  updateRecord: (
    record: LocalRecord,
    attachments?: RecordAttachments,
  ) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  deleteAllRecords: () => Promise<void>;
  deleteAllUserData: () => Promise<void>;
  createBackup: () => Promise<BackupExportResult | null>;
  restoreBackup: () => Promise<BackupRestoreResult | null>;
  scheduleReminder: (date: string, gameId?: string | null) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
};

export const useRevivalStore = create<RevivalState>((set, get) => ({
  hydrated: false,
  hydrationError: null,
  scheduleRefreshing: false,
  scheduleSyncError: null,
  profile: null,
  records: [],
  games: [],
  stadiums: [],
  reminders: [],
  latestBackup: null,
  hydrate: async () => {
    try {
      const snapshot = await localDataService.getSnapshot();
      set({
        hydrated: true,
        hydrationError: null,
        profile: snapshot.profile,
        records: snapshot.records,
        games: snapshot.games,
        stadiums: snapshot.stadiums,
        reminders: snapshot.reminders,
        latestBackup: snapshot.latestBackup,
      });
      get()
        .refreshSchedule()
        .catch(() => undefined);
    } catch (error) {
      set({
        hydrated: true,
        hydrationError:
          error instanceof Error
            ? error.message
            : '로컬 저장소를 열 수 없습니다.',
      });
    }
  },
  refreshSchedule: async () => {
    if (get().scheduleRefreshing) return;
    set({ scheduleRefreshing: true, scheduleSyncError: null });
    try {
      const update = await localDataService.refreshSchedule();
      if (update) {
        set({ games: update.games, stadiums: update.stadiums });
      }
      set({ scheduleRefreshing: false });
    } catch (error) {
      set({
        scheduleRefreshing: false,
        scheduleSyncError:
          error instanceof Error ? error.message : '일정 갱신에 실패했습니다.',
      });
    }
  },
  saveProfile: async profile => {
    await localDataService.saveProfile(profile);
    set({ profile });
  },
  saveRecord: async (draft, attachments) => {
    const record = await localDataService.createRecord(draft, attachments);
    set({ records: [...get().records, record] });
    return record;
  },
  updateRecord: async (record, attachments) => {
    const updated = await localDataService.updateRecord(record, attachments);
    set({
      records: get().records.map(item =>
        item.id === record.id ? updated : item,
      ),
    });
  },
  deleteRecord: async recordId => {
    const linked = get().reminders.filter(item => item.recordId === recordId);
    await Promise.all(
      linked.map(item =>
        cancelLocalNotification(item.nativeNotificationId).catch(
          () => undefined,
        ),
      ),
    );
    await localDataService.deleteRecord(recordId);
    set({
      records: get().records.filter(record => record.id !== recordId),
      reminders: get().reminders.filter(item => item.recordId !== recordId),
    });
  },
  deleteAllRecords: async () => {
    await localDataService.deleteAllRecords();
    set({ records: [] });
  },
  deleteAllUserData: async () => {
    await Promise.all(
      get().reminders.map(item =>
        cancelLocalNotification(item.nativeNotificationId).catch(
          () => undefined,
        ),
      ),
    );
    await localDataService.deleteAllUserData();
    set({ profile: null, records: [], reminders: [], latestBackup: null });
  },
  createBackup: async () => {
    const backup = await localDataService.createBackup();
    if (backup) set({ latestBackup: backup });
    return backup;
  },
  restoreBackup: async () => {
    const result = await localDataService.restoreBackup();
    if (!result) return null;

    const snapshot = await localDataService.getSnapshot();
    let notificationFailureCount = 0;
    const reminders = await Promise.all(
      snapshot.reminders.map(async reminder => {
        if (
          !reminder.enabled ||
          reminder.nativeNotificationId ||
          new Date(reminder.scheduledAt).getTime() <= Date.now()
        ) {
          return reminder;
        }
        try {
          const nativeNotificationId = await scheduleLocalNotification({
            id: reminder.id,
            scheduledAt: reminder.scheduledAt,
            title: '오늘은 직관 가는 날! ⚾',
            body: '좌석과 사진을 직관일기에 남겨보세요.',
          });
          const restored = {
            ...reminder,
            nativeNotificationId,
            updatedAt: new Date().toISOString(),
          };
          await localDataService.saveReminder(restored);
          return restored;
        } catch {
          notificationFailureCount += 1;
          return reminder;
        }
      }),
    );
    set({
      profile: snapshot.profile,
      records: snapshot.records,
      games: snapshot.games,
      stadiums: snapshot.stadiums,
      reminders,
      latestBackup: snapshot.latestBackup,
    });
    return { ...result, notificationFailureCount };
  },
  scheduleReminder: async (date, gameId = null) => {
    const scheduled = new Date(`${date}T10:00:00`);
    const now = new Date();
    if (scheduled.getTime() <= now.getTime()) {
      throw new Error('REMINDER_DATE_PASSED');
    }
    const id = createLocalId('reminder');
    const scheduledAt = scheduled.toISOString();
    const nativeNotificationId = await scheduleLocalNotification({
      id,
      scheduledAt,
      title: '오늘은 직관 가는 날! ⚾',
      body: '좌석과 사진을 직관일기에 남겨보세요.',
    });
    const createdAt = new Date().toISOString();
    const reminder: LocalReminder = {
      id,
      gameId,
      recordId: null,
      scheduledAt,
      nativeNotificationId,
      enabled: true,
      createdAt,
      updatedAt: createdAt,
    };
    try {
      await localDataService.saveReminder(reminder);
      set({ reminders: [...get().reminders, reminder] });
    } catch (error) {
      await cancelLocalNotification(nativeNotificationId).catch(
        () => undefined,
      );
      throw error;
    }
  },
  deleteReminder: async reminderId => {
    const reminder = get().reminders.find(item => item.id === reminderId);
    await cancelLocalNotification(reminder?.nativeNotificationId ?? null);
    await localDataService.deleteReminder(reminderId);
    set({
      reminders: get().reminders.filter(item => item.id !== reminderId),
    });
  },
}));
