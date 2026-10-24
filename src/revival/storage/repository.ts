import {
  BackupHistory,
  Game,
  LocalReminder,
  LocalProfile,
  LocalRecord,
  LegacyCommunityPost,
  ScheduledGame,
  Stadium,
  StoredRecordInput,
} from './types';
import type { BackupPayload } from './backupFormat';

export type BackupMergeResult = {
  importedRecordIds: string[];
  importedReminderIds: string[];
  skippedRecordCount: number;
};

export type LocalRepository = {
  initialize: () => Promise<void>;
  getProfile: () => Promise<LocalProfile | null>;
  upsertProfile: (profile: LocalProfile) => Promise<void>;
  listRecords: () => Promise<LocalRecord[]>;
  listLegacyCommunityPosts: () => Promise<LegacyCommunityPost[]>;
  createRecord: (record: StoredRecordInput) => Promise<void>;
  createMigratedRecord: (
    sourceKey: string,
    record: StoredRecordInput,
  ) => Promise<boolean>;
  updateRecord: (record: StoredRecordInput) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<string[]>;
  deleteAllRecords: () => Promise<string[]>;
  deleteAllUserData: () => Promise<string[]>;
  replaceSchedule: (stadiums: Stadium[], games: Game[]) => Promise<void>;
  getScheduleSourceVersion: () => Promise<string | null>;
  listStadiums: () => Promise<Stadium[]>;
  listGames: (fromDate?: string, toDate?: string) => Promise<ScheduledGame[]>;
  listReminders: () => Promise<LocalReminder[]>;
  upsertReminder: (reminder: LocalReminder) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
  mergeBackup: (payload: BackupPayload) => Promise<BackupMergeResult>;
  addBackupHistory: (history: BackupHistory) => Promise<void>;
  getLatestBackupHistory: () => Promise<BackupHistory | null>;
  hasMigration: (sourceKey: string) => Promise<boolean>;
  markMigration: (sourceKey: string) => Promise<void>;
};
