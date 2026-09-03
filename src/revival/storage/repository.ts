import {
  Game,
  LocalReminder,
  LocalProfile,
  LocalRecord,
  ScheduledGame,
  Stadium,
  StoredRecordInput,
} from './types';

export type LocalRepository = {
  initialize: () => Promise<void>;
  getProfile: () => Promise<LocalProfile | null>;
  upsertProfile: (profile: LocalProfile) => Promise<void>;
  listRecords: () => Promise<LocalRecord[]>;
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
  listStadiums: () => Promise<Stadium[]>;
  listGames: (fromDate?: string, toDate?: string) => Promise<ScheduledGame[]>;
  listReminders: () => Promise<LocalReminder[]>;
  upsertReminder: (reminder: LocalReminder) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
  hasMigration: (sourceKey: string) => Promise<boolean>;
  markMigration: (sourceKey: string) => Promise<void>;
};
