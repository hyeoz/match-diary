import { migrateLegacyAsyncStorage } from './legacyMigration';
import { AppMediaStorage, MediaStorage } from './mediaStorage';
import { LocalRepository } from './repository';
import { SQLiteLocalRepository } from './sqliteRepository';
import { bundledStadiums } from '../scheduleCatalog';
import { fetchScheduleUpdate } from '../scheduleSync';
import { AppBackupService } from './backupService';
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
  StoredMedia,
} from './types';

export class LocalDataService {
  private initializationPromise: Promise<void> | null = null;
  private readonly backupService: AppBackupService;

  constructor(
    private readonly repository: LocalRepository,
    private readonly mediaStorage: MediaStorage,
  ) {
    this.backupService = new AppBackupService(repository, mediaStorage);
  }

  initialize = async (): Promise<void> => {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeStorage().catch(error => {
        this.initializationPromise = null;
        throw error;
      });
    }
    return this.initializationPromise;
  };

  private initializeStorage = async (): Promise<void> => {
    await Promise.all([
      this.repository.initialize(),
      this.mediaStorage.initialize(),
      this.backupService.cleanupStaleWorkspaces(),
    ]);
    await this.repository.replaceSchedule(bundledStadiums, []);
    await migrateLegacyAsyncStorage(this.repository, this.mediaStorage);
    const records = await this.repository.listRecords();
    await this.mediaStorage.cleanupOrphans(
      records.flatMap(record =>
        [record.photo, record.ticket]
          .filter((item): item is StoredMedia => item !== null)
          .map(item => item.relativePath),
      ),
    );
  };

  getSnapshot = async (): Promise<{
    profile: LocalProfile | null;
    records: LocalRecord[];
    games: ScheduledGame[];
    stadiums: Stadium[];
    reminders: LocalReminder[];
    latestBackup: BackupHistory | null;
  }> => {
    await this.initialize();
    const [profile, records, games, stadiums, reminders, latestBackup] =
      await Promise.all([
        this.repository.getProfile(),
        this.repository.listRecords(),
        this.repository.listGames(),
        this.repository.listStadiums(),
        this.repository.listReminders(),
        this.repository.getLatestBackupHistory(),
      ]);
    return { profile, records, games, stadiums, reminders, latestBackup };
  };

  createBackup = async (): Promise<BackupExportResult | null> => {
    const snapshot = await this.getSnapshot();
    return this.backupService.createAndShare(snapshot);
  };

  restoreBackup = async (): Promise<BackupRestoreResult | null> => {
    await this.initialize();
    return this.backupService.pickAndRestore();
  };

  saveProfile = async (profile: LocalProfile): Promise<void> => {
    await this.initialize();
    await this.repository.upsertProfile(profile);
  };

  createRecord = async (
    draft: LocalRecordDraft,
    attachments: RecordAttachments = {},
  ): Promise<LocalRecord> => {
    await this.initialize();
    const media: StoredMedia[] = [];
    try {
      if (attachments.photo) {
        media.push(await this.mediaStorage.persist(attachments.photo, 'photo'));
      }
      if (attachments.ticket) {
        media.push(
          await this.mediaStorage.persist(attachments.ticket, 'ticket'),
        );
      }
      const now = new Date().toISOString();
      const record: LocalRecord = {
        ...draft,
        id: createLocalId('record'),
        gameId: draft.gameId ?? null,
        photo: media.find(item => item.kind === 'photo') ?? null,
        ticket: media.find(item => item.kind === 'ticket') ?? null,
        createdAt: now,
        updatedAt: now,
      };
      await this.repository.createRecord({
        ...record,
        media,
      });
      return record;
    } catch (error) {
      await this.mediaStorage.removeMany(media.map(item => item.relativePath));
      throw error;
    }
  };

  updateRecord = async (
    record: LocalRecord,
    attachments: RecordAttachments = {},
  ): Promise<LocalRecord> => {
    await this.initialize();
    const newlyStored: StoredMedia[] = [];
    const removedPaths: string[] = [];
    try {
      let photo = record.photo;
      let ticket = record.ticket;
      if (attachments.photo !== undefined) {
        if (record.photo) removedPaths.push(record.photo.relativePath);
        photo = attachments.photo
          ? await this.mediaStorage.persist(attachments.photo, 'photo')
          : null;
        if (photo) newlyStored.push(photo);
      }
      if (attachments.ticket !== undefined) {
        if (record.ticket) removedPaths.push(record.ticket.relativePath);
        ticket = attachments.ticket
          ? await this.mediaStorage.persist(attachments.ticket, 'ticket')
          : null;
        if (ticket) newlyStored.push(ticket);
      }
      const updated = {
        ...record,
        photo,
        ticket,
        updatedAt: new Date().toISOString(),
      };
      await this.repository.updateRecord({
        ...updated,
        media: [updated.photo, updated.ticket].filter(
          (item): item is StoredMedia => item !== null,
        ),
      });
      await this.mediaStorage.removeMany(removedPaths);
      return updated;
    } catch (error) {
      await this.mediaStorage.removeMany(
        newlyStored.map(item => item.relativePath),
      );
      throw error;
    }
  };

  deleteRecord = async (recordId: string): Promise<void> => {
    await this.initialize();
    const paths = await this.repository.deleteRecord(recordId);
    await this.mediaStorage.removeMany(paths);
  };

  deleteAllRecords = async (): Promise<void> => {
    await this.initialize();
    const paths = await this.repository.deleteAllRecords();
    await this.mediaStorage.removeMany(paths);
  };

  deleteAllUserData = async (): Promise<void> => {
    await this.initialize();
    const paths = await this.repository.deleteAllUserData();
    await this.mediaStorage.removeMany(paths);
  };

  getGames = async (
    fromDate?: string,
    toDate?: string,
  ): Promise<ScheduledGame[]> => {
    await this.initialize();
    return this.repository.listGames(fromDate, toDate);
  };

  refreshSchedule = async (): Promise<{
    games: ScheduledGame[];
    stadiums: Stadium[];
  } | null> => {
    await this.initialize();
    const currentVersion = await this.repository.getScheduleSourceVersion();
    const update = await fetchScheduleUpdate(currentVersion);
    if (!update) return null;
    await this.repository.replaceSchedule(update.stadiums, update.games);
    return {
      stadiums: update.stadiums,
      games: await this.repository.listGames(),
    };
  };

  replaceSchedule = async (
    stadiums: Stadium[],
    games: ScheduledGame[],
  ): Promise<void> => {
    await this.initialize();
    await this.repository.replaceSchedule(stadiums, games);
  };

  saveReminder = async (reminder: LocalReminder): Promise<void> => {
    await this.initialize();
    await this.repository.upsertReminder(reminder);
  };

  deleteReminder = async (reminderId: string): Promise<void> => {
    await this.initialize();
    await this.repository.deleteReminder(reminderId);
  };

  resolveMediaUri = (relativePath: string): string =>
    this.mediaStorage.resolveUri(relativePath);
}

export const localDataService = new LocalDataService(
  new SQLiteLocalRepository(),
  new AppMediaStorage(),
);
