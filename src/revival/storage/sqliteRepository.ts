import SQLite from 'react-native-sqlite-storage';
import type { ResultSet, SQLiteDatabase } from 'react-native-sqlite-storage';

import { DATABASE_NAME, SCHEMA_V1, SCHEMA_V2, SCHEMA_VERSION } from './schema';
import { LocalRepository } from './repository';
import {
  Game,
  LocalReminder,
  LocalProfile,
  LocalRecord,
  MediaKind,
  ScheduledGame,
  Stadium,
  StoredMedia,
  StoredRecordInput,
} from './types';

SQLite.enablePromise(true);

type RecordRow = {
  id: string;
  game_id: string | null;
  date: string;
  opponent: string;
  time: string;
  stadium: string;
  seat: string;
  memo: string;
  result: LocalRecord['result'];
  created_at: string;
  updated_at: string;
};

type MediaRow = {
  id: string;
  record_id: string;
  kind: MediaKind;
  relative_path: string;
  mime_type: string;
  original_name: string;
  byte_size: number;
  checksum_sha256: string;
  width: number | null;
  height: number | null;
  created_at: string;
};

type StadiumRow = {
  id: string;
  name: string;
  short_name: string;
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
};

type GameRow = {
  id: string;
  date: string;
  time: string;
  home_team_id: number;
  away_team_id: number;
  stadium_id: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  memo: string;
  source_version: string;
  updated_at: string;
  stadium_name: string;
  stadium_short_name: string;
  stadium_latitude: number | null;
  stadium_longitude: number | null;
  stadium_updated_at: string;
};

type ReminderRow = {
  id: string;
  game_id: string | null;
  record_id: string | null;
  scheduled_at: string;
  native_notification_id: string | null;
  enabled: number;
  created_at: string;
  updated_at: string;
};

const rows = <T>(result: ResultSet): T[] => result.rows.raw() as T[];

const mapMedia = (row: MediaRow): StoredMedia => ({
  id: row.id,
  kind: row.kind,
  relativePath: row.relative_path,
  mimeType: row.mime_type,
  originalName: row.original_name,
  byteSize: row.byte_size,
  checksumSha256: row.checksum_sha256,
  width: row.width,
  height: row.height,
  createdAt: row.created_at,
});

export class SQLiteLocalRepository implements LocalRepository {
  private databasePromise: Promise<SQLiteDatabase> | null = null;
  private initializationPromise: Promise<void> | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  initialize = async (): Promise<void> => {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeDatabase().catch(error => {
        this.initializationPromise = null;
        this.databasePromise = null;
        throw error;
      });
    }
    return this.initializationPromise;
  };

  private getDatabase = (): Promise<SQLiteDatabase> => {
    if (!this.databasePromise) {
      this.databasePromise = SQLite.openDatabase({
        name: DATABASE_NAME,
        location: 'Library',
      });
    }
    return this.databasePromise;
  };

  private initializeDatabase = async (): Promise<void> => {
    const database = await this.getDatabase();
    await database.executeSql('PRAGMA foreign_keys = ON');
    const [versionResult] = await database.executeSql('PRAGMA user_version');
    const version = Number(versionResult.rows.item(0).user_version ?? 0);

    if (version >= SCHEMA_VERSION) return;

    await this.withTransaction(async transactionDatabase => {
      if (version < 1) {
        for (const statement of SCHEMA_V1) {
          await transactionDatabase.executeSql(statement);
        }
      }
      if (version < 2) {
        for (const statement of SCHEMA_V2) {
          await transactionDatabase.executeSql(statement);
        }
      }
      await transactionDatabase.executeSql(
        `PRAGMA user_version = ${SCHEMA_VERSION}`,
      );
    });
  };

  private enqueueWrite = <T>(work: () => Promise<T>): Promise<T> => {
    const operation = this.writeQueue.then(work, work);
    this.writeQueue = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  };

  private withTransaction = <T>(
    work: (database: SQLiteDatabase) => Promise<T>,
  ): Promise<T> =>
    this.enqueueWrite(async () => {
      const database = await this.getDatabase();
      await database.executeSql('BEGIN IMMEDIATE');
      try {
        const value = await work(database);
        await database.executeSql('COMMIT');
        return value;
      } catch (error) {
        await database.executeSql('ROLLBACK').catch(() => undefined);
        throw error;
      }
    });

  getProfile = async (): Promise<LocalProfile | null> => {
    await this.initialize();
    const database = await this.getDatabase();
    const [result] = await database.executeSql(
      'SELECT nickname, team_id FROM profile WHERE id = 1',
    );
    if (!result.rows.length) return null;
    const row = result.rows.item(0) as { nickname: string; team_id: number };
    return { nickname: row.nickname, teamId: row.team_id };
  };

  upsertProfile = async (profile: LocalProfile): Promise<void> => {
    await this.initialize();
    await this.enqueueWrite(async () => {
      const database = await this.getDatabase();
      await database.executeSql(
        `INSERT INTO profile (id, nickname, team_id, updated_at)
         VALUES (1, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           nickname = excluded.nickname,
           team_id = excluded.team_id,
           updated_at = excluded.updated_at`,
        [profile.nickname, profile.teamId, new Date().toISOString()],
      );
    });
  };

  listRecords = async (): Promise<LocalRecord[]> => {
    await this.initialize();
    const database = await this.getDatabase();
    const [recordResult] = await database.executeSql(
      'SELECT * FROM records ORDER BY date ASC, created_at ASC',
    );
    const [mediaResult] = await database.executeSql(
      'SELECT * FROM record_media ORDER BY created_at ASC',
    );
    const mediaByRecord = new Map<string, StoredMedia[]>();
    for (const row of rows<MediaRow>(mediaResult)) {
      const media = mediaByRecord.get(row.record_id) ?? [];
      media.push(mapMedia(row));
      mediaByRecord.set(row.record_id, media);
    }

    return rows<RecordRow>(recordResult).map(row => {
      const media = mediaByRecord.get(row.id) ?? [];
      return {
        id: row.id,
        gameId: row.game_id,
        date: row.date,
        opponent: row.opponent,
        time: row.time,
        stadium: row.stadium,
        seat: row.seat,
        memo: row.memo,
        result: row.result,
        photo: media.find(item => item.kind === 'photo') ?? null,
        ticket: media.find(item => item.kind === 'ticket') ?? null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });
  };

  private insertRecord = async (
    database: SQLiteDatabase,
    record: StoredRecordInput,
  ): Promise<void> => {
    await database.executeSql(
      `INSERT INTO records (
        id, game_id, date, opponent, time, stadium, seat, memo, result,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.gameId,
        record.date,
        record.opponent,
        record.time,
        record.stadium,
        record.seat,
        record.memo,
        record.result,
        record.createdAt,
        record.updatedAt,
      ],
    );
    await this.insertMedia(database, record.id, record.media);
  };

  private insertMedia = async (
    database: SQLiteDatabase,
    recordId: string,
    mediaItems: StoredMedia[],
  ): Promise<void> => {
    for (const media of mediaItems) {
      await database.executeSql(
        `INSERT INTO record_media (
          id, record_id, kind, relative_path, mime_type, original_name,
          byte_size, checksum_sha256, width, height, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          media.id,
          recordId,
          media.kind,
          media.relativePath,
          media.mimeType,
          media.originalName,
          media.byteSize,
          media.checksumSha256,
          media.width,
          media.height,
          media.createdAt,
        ],
      );
    }
  };

  createRecord = async (record: StoredRecordInput): Promise<void> => {
    await this.initialize();
    await this.withTransaction(database => this.insertRecord(database, record));
  };

  createMigratedRecord = async (
    sourceKey: string,
    record: StoredRecordInput,
  ): Promise<boolean> => {
    await this.initialize();
    return this.withTransaction(async database => {
      const [migrationResult] = await database.executeSql(
        'SELECT 1 FROM migration_log WHERE source_key = ? LIMIT 1',
        [sourceKey],
      );
      if (migrationResult.rows.length) return false;

      await this.insertRecord(database, record);
      await database.executeSql(
        'INSERT INTO migration_log (source_key, migrated_at) VALUES (?, ?)',
        [sourceKey, new Date().toISOString()],
      );
      return true;
    });
  };

  updateRecord = async (record: StoredRecordInput): Promise<void> => {
    await this.initialize();
    await this.withTransaction(async database => {
      const [result] = await database.executeSql(
        `UPDATE records SET
          game_id = ?, date = ?, opponent = ?, time = ?, stadium = ?,
          seat = ?, memo = ?, result = ?, updated_at = ?
         WHERE id = ?`,
        [
          record.gameId,
          record.date,
          record.opponent,
          record.time,
          record.stadium,
          record.seat,
          record.memo,
          record.result,
          record.updatedAt,
          record.id,
        ],
      );
      if (!result.rowsAffected) {
        throw new Error(`Record not found: ${record.id}`);
      }
      await database.executeSql(
        'DELETE FROM record_media WHERE record_id = ?',
        [record.id],
      );
      await this.insertMedia(database, record.id, record.media);
    });
  };

  deleteRecord = async (recordId: string): Promise<string[]> => {
    await this.initialize();
    return this.withTransaction(async database => {
      const [mediaResult] = await database.executeSql(
        'SELECT relative_path FROM record_media WHERE record_id = ?',
        [recordId],
      );
      await database.executeSql('DELETE FROM records WHERE id = ?', [recordId]);
      return rows<{ relative_path: string }>(mediaResult).map(
        row => row.relative_path,
      );
    });
  };

  deleteAllRecords = async (): Promise<string[]> => {
    await this.initialize();
    return this.withTransaction(async database => {
      const [mediaResult] = await database.executeSql(
        'SELECT relative_path FROM record_media',
      );
      await database.executeSql('DELETE FROM records');
      return rows<{ relative_path: string }>(mediaResult).map(
        row => row.relative_path,
      );
    });
  };

  deleteAllUserData = async (): Promise<string[]> => {
    await this.initialize();
    return this.withTransaction(async database => {
      const [mediaResult] = await database.executeSql(
        'SELECT relative_path FROM record_media',
      );
      await database.executeSql('DELETE FROM reminders');
      await database.executeSql('DELETE FROM records');
      await database.executeSql('DELETE FROM profile');
      return rows<{ relative_path: string }>(mediaResult).map(
        row => row.relative_path,
      );
    });
  };

  replaceSchedule = async (
    stadiums: Stadium[],
    games: Game[],
  ): Promise<void> => {
    await this.initialize();
    await this.withTransaction(async database => {
      for (const stadium of stadiums) {
        await database.executeSql(
          `INSERT INTO stadiums (
            id, name, short_name, latitude, longitude, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            short_name = excluded.short_name,
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            updated_at = excluded.updated_at`,
          [
            stadium.id,
            stadium.name,
            stadium.shortName,
            stadium.latitude,
            stadium.longitude,
            stadium.updatedAt,
          ],
        );
      }
      for (const game of games) {
        await database.executeSql(
          `INSERT INTO games (
            id, date, time, home_team_id, away_team_id, stadium_id,
            status, home_score, away_score, memo, source_version, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            date = excluded.date,
            time = excluded.time,
            home_team_id = excluded.home_team_id,
            away_team_id = excluded.away_team_id,
            stadium_id = excluded.stadium_id,
            status = excluded.status,
            home_score = excluded.home_score,
            away_score = excluded.away_score,
            memo = excluded.memo,
            source_version = excluded.source_version,
            updated_at = excluded.updated_at`,
          [
            game.id,
            game.date,
            game.time,
            game.homeTeamId,
            game.awayTeamId,
            game.stadiumId,
            game.status,
            game.homeScore,
            game.awayScore,
            game.memo,
            game.sourceVersion,
            game.updatedAt,
          ],
        );
      }
      if (games.length) {
        await database.executeSql(
          `INSERT INTO schedule_metadata (id, source_version, updated_at)
           VALUES (1, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             source_version = excluded.source_version,
             updated_at = excluded.updated_at`,
          [games[0].sourceVersion, new Date().toISOString()],
        );
      }
    });
  };

  getScheduleSourceVersion = async (): Promise<string | null> => {
    await this.initialize();
    const database = await this.getDatabase();
    const [result] = await database.executeSql(
      'SELECT source_version FROM schedule_metadata WHERE id = 1',
    );
    if (!result.rows.length) return null;
    return (result.rows.item(0) as { source_version: string }).source_version;
  };

  listStadiums = async (): Promise<Stadium[]> => {
    await this.initialize();
    const database = await this.getDatabase();
    const [result] = await database.executeSql(
      'SELECT * FROM stadiums ORDER BY name ASC',
    );
    return rows<StadiumRow>(result).map(row => ({
      id: row.id,
      name: row.name,
      shortName: row.short_name,
      latitude: row.latitude,
      longitude: row.longitude,
      updatedAt: row.updated_at,
    }));
  };

  listGames = async (
    fromDate?: string,
    toDate?: string,
  ): Promise<ScheduledGame[]> => {
    await this.initialize();
    const database = await this.getDatabase();
    const clauses: string[] = [];
    const params: string[] = [];
    if (fromDate) {
      clauses.push('g.date >= ?');
      params.push(fromDate);
    }
    if (toDate) {
      clauses.push('g.date <= ?');
      params.push(toDate);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const [result] = await database.executeSql(
      `SELECT
        g.*,
        s.name AS stadium_name,
        s.short_name AS stadium_short_name,
        s.latitude AS stadium_latitude,
        s.longitude AS stadium_longitude,
        s.updated_at AS stadium_updated_at
       FROM games g
       INNER JOIN stadiums s ON s.id = g.stadium_id
       ${where}
       ORDER BY g.date ASC, g.time ASC`,
      params,
    );
    return rows<GameRow>(result).map(row => ({
      id: row.id,
      date: row.date,
      time: row.time,
      homeTeamId: row.home_team_id,
      awayTeamId: row.away_team_id,
      stadiumId: row.stadium_id,
      status: row.status,
      homeScore: row.home_score,
      awayScore: row.away_score,
      memo: row.memo,
      sourceVersion: row.source_version,
      updatedAt: row.updated_at,
      stadium: {
        id: row.stadium_id,
        name: row.stadium_name,
        shortName: row.stadium_short_name,
        latitude: row.stadium_latitude,
        longitude: row.stadium_longitude,
        updatedAt: row.stadium_updated_at,
      },
    }));
  };

  listReminders = async (): Promise<LocalReminder[]> => {
    await this.initialize();
    const database = await this.getDatabase();
    const [result] = await database.executeSql(
      'SELECT * FROM reminders ORDER BY scheduled_at ASC',
    );
    return rows<ReminderRow>(result).map(row => ({
      id: row.id,
      gameId: row.game_id,
      recordId: row.record_id,
      scheduledAt: row.scheduled_at,
      nativeNotificationId: row.native_notification_id,
      enabled: row.enabled === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  };

  upsertReminder = async (reminder: LocalReminder): Promise<void> => {
    await this.initialize();
    await this.enqueueWrite(async () => {
      const database = await this.getDatabase();
      await database.executeSql(
        `INSERT INTO reminders (
          id, game_id, record_id, scheduled_at, native_notification_id,
          enabled, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          game_id = excluded.game_id,
          record_id = excluded.record_id,
          scheduled_at = excluded.scheduled_at,
          native_notification_id = excluded.native_notification_id,
          enabled = excluded.enabled,
          updated_at = excluded.updated_at`,
        [
          reminder.id,
          reminder.gameId,
          reminder.recordId,
          reminder.scheduledAt,
          reminder.nativeNotificationId,
          reminder.enabled ? 1 : 0,
          reminder.createdAt,
          reminder.updatedAt,
        ],
      );
    });
  };

  deleteReminder = async (reminderId: string): Promise<void> => {
    await this.initialize();
    await this.enqueueWrite(async () => {
      const database = await this.getDatabase();
      await database.executeSql('DELETE FROM reminders WHERE id = ?', [
        reminderId,
      ]);
    });
  };

  hasMigration = async (sourceKey: string): Promise<boolean> => {
    await this.initialize();
    const database = await this.getDatabase();
    const [result] = await database.executeSql(
      'SELECT 1 FROM migration_log WHERE source_key = ? LIMIT 1',
      [sourceKey],
    );
    return result.rows.length > 0;
  };

  markMigration = async (sourceKey: string): Promise<void> => {
    await this.initialize();
    await this.enqueueWrite(async () => {
      const database = await this.getDatabase();
      await database.executeSql(
        'INSERT OR IGNORE INTO migration_log (source_key, migrated_at) VALUES (?, ?)',
        [sourceKey, new Date().toISOString()],
      );
    });
  };
}
