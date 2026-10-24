import {
  Game,
  LocalProfile,
  LocalRecord,
  LocalReminder,
  LegacyCommunityPost,
  Stadium,
  StoredMedia,
} from './types';

export const BACKUP_FORMAT = 'com.matchdiary.backup';
export const BACKUP_VERSION = 2;
export const BACKUP_APP_VERSION = '2.3.4';
export const BACKUP_EXTENSION = '.matchdiary';
export const BACKUP_MIME_TYPE = 'application/vnd.matchdiary.backup';

export type BackupManifest = {
  format: typeof BACKUP_FORMAT;
  version: number;
  createdAt: string;
  appVersion: string;
  recordCount: number;
  mediaCount: number;
  reminderCount: number;
  communityPostCount?: number;
  totalMediaBytes: number;
  checksumsSha256: string;
};

export type BackupPayload = {
  profile: LocalProfile | null;
  records: LocalRecord[];
  stadiums: Stadium[];
  games: Game[];
  reminders: LocalReminder[];
  legacyCommunityPosts?: LegacyCommunityPost[];
  recovery?: {
    source: 'legacy_server';
    missingMediaCount: number;
  };
};

export type BackupChecksums = {
  algorithm: 'sha256';
  files: Record<string, string>;
};

export type ValidatedBackup = {
  manifest: BackupManifest;
  payload: BackupPayload;
  checksums: BackupChecksums;
  media: StoredMedia[];
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isNullableString = (value: unknown): value is string | null =>
  value === null || isString(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isIsoDate = (value: unknown): value is string =>
  isString(value) && !Number.isNaN(Date.parse(value));

const isGameDate = (value: unknown): value is string =>
  isString(value) && /^\d{4}-\d{2}-\d{2}$/.test(value);

const isSha256 = (value: unknown): value is string =>
  isString(value) && /^[a-f0-9]{64}$/i.test(value);

export const isSafeArchivePath = (path: string): boolean =>
  path.length > 0 &&
  !path.startsWith('/') &&
  !path.startsWith('\\') &&
  !/^[A-Za-z]:/.test(path) &&
  !path.includes('\\') &&
  !path.split('/').some(segment => segment === '..' || segment === '');

const isMediaPath = (value: unknown): value is string =>
  isString(value) &&
  isSafeArchivePath(value) &&
  /^media\/(photos|tickets)\/[A-Za-z0-9._-]+$/.test(value);

const parseStoredMedia = (value: unknown): StoredMedia => {
  if (
    !isObject(value) ||
    !isString(value.id) ||
    (value.kind !== 'photo' && value.kind !== 'ticket') ||
    !isMediaPath(value.relativePath) ||
    !isString(value.mimeType) ||
    !isString(value.originalName) ||
    !isFiniteNumber(value.byteSize) ||
    value.byteSize < 0 ||
    !isSha256(value.checksumSha256) ||
    !(value.width === null || isFiniteNumber(value.width)) ||
    !(value.height === null || isFiniteNumber(value.height)) ||
    !isIsoDate(value.createdAt)
  ) {
    throw new Error('BACKUP_DATA_INVALID');
  }
  const expectedFolder = value.kind === 'photo' ? 'photos' : 'tickets';
  if (!value.relativePath.startsWith(`media/${expectedFolder}/`)) {
    throw new Error('BACKUP_DATA_INVALID');
  }
  return value as StoredMedia;
};

const parseRecord = (value: unknown): LocalRecord => {
  if (
    !isObject(value) ||
    !isString(value.id) ||
    !isNullableString(value.gameId) ||
    !isGameDate(value.date) ||
    !isString(value.opponent) ||
    !isString(value.time) ||
    !isString(value.stadium) ||
    !isString(value.seat) ||
    !isString(value.memo) ||
    !['win', 'lose', 'draw', 'unknown'].includes(String(value.result)) ||
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt)
  ) {
    throw new Error('BACKUP_DATA_INVALID');
  }
  return {
    ...(value as Omit<LocalRecord, 'photo' | 'ticket'>),
    legacyServerRecordId: isNullableString(value.legacyServerRecordId)
      ? value.legacyServerRecordId
      : null,
    source: ['new', 'legacy_device', 'legacy_server'].includes(
      String(value.source),
    )
      ? (value.source as LocalRecord['source'])
      : 'new',
    photo: value.photo === null ? null : parseStoredMedia(value.photo),
    ticket: value.ticket === null ? null : parseStoredMedia(value.ticket),
  };
};

const parseLegacyCommunityPost = (value: unknown): LegacyCommunityPost => {
  if (
    !isObject(value) ||
    !isString(value.id) ||
    !isString(value.legacyServerPostId) ||
    !isNullableString(value.stadiumId) ||
    !isGameDate(value.date) ||
    !isString(value.content) ||
    !isIsoDate(value.createdAt)
  ) {
    throw new Error('BACKUP_DATA_INVALID');
  }
  return value as LegacyCommunityPost;
};

const parseStadium = (value: unknown): Stadium => {
  if (
    !isObject(value) ||
    !isString(value.id) ||
    !isString(value.name) ||
    !isString(value.shortName) ||
    !(value.latitude === null || isFiniteNumber(value.latitude)) ||
    !(value.longitude === null || isFiniteNumber(value.longitude)) ||
    !isIsoDate(value.updatedAt)
  ) {
    throw new Error('BACKUP_DATA_INVALID');
  }
  return value as Stadium;
};

const parseGame = (value: unknown): Game => {
  if (
    !isObject(value) ||
    !isString(value.id) ||
    !isGameDate(value.date) ||
    !isString(value.time) ||
    !Number.isInteger(value.homeTeamId) ||
    !Number.isInteger(value.awayTeamId) ||
    !isString(value.stadiumId) ||
    !isString(value.status) ||
    !(value.homeScore === null || isFiniteNumber(value.homeScore)) ||
    !(value.awayScore === null || isFiniteNumber(value.awayScore)) ||
    !isString(value.memo) ||
    !isString(value.sourceVersion) ||
    !isIsoDate(value.updatedAt)
  ) {
    throw new Error('BACKUP_DATA_INVALID');
  }
  return value as Game;
};

const parseReminder = (value: unknown): LocalReminder => {
  if (
    !isObject(value) ||
    !isString(value.id) ||
    !isNullableString(value.gameId) ||
    !isNullableString(value.recordId) ||
    !isIsoDate(value.scheduledAt) ||
    !isNullableString(value.nativeNotificationId) ||
    typeof value.enabled !== 'boolean' ||
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt)
  ) {
    throw new Error('BACKUP_DATA_INVALID');
  }
  return value as LocalReminder;
};

const assertUnique = (values: string[]): void => {
  if (new Set(values).size !== values.length) {
    throw new Error('BACKUP_DATA_DUPLICATED');
  }
};

export const parseBackupManifest = (value: unknown): BackupManifest => {
  if (!isObject(value)) throw new Error('BACKUP_MANIFEST_INVALID');
  if (value.format !== BACKUP_FORMAT) throw new Error('BACKUP_FORMAT_INVALID');
  if (!Number.isInteger(value.version)) {
    throw new Error('BACKUP_MANIFEST_INVALID');
  }
  if (Number(value.version) > BACKUP_VERSION) {
    throw new Error('BACKUP_VERSION_NEWER');
  }
  if (Number(value.version) < 1) throw new Error('BACKUP_VERSION_UNSUPPORTED');
  if (
    !isIsoDate(value.createdAt) ||
    !isString(value.appVersion) ||
    !Number.isInteger(value.recordCount) ||
    Number(value.recordCount) < 0 ||
    !Number.isInteger(value.mediaCount) ||
    Number(value.mediaCount) < 0 ||
    !Number.isInteger(value.reminderCount) ||
    Number(value.reminderCount) < 0 ||
    (Number(value.version) >= 2 &&
      (!Number.isInteger(value.communityPostCount) ||
        Number(value.communityPostCount) < 0)) ||
    !isFiniteNumber(value.totalMediaBytes) ||
    Number(value.totalMediaBytes) < 0 ||
    !isSha256(value.checksumsSha256)
  ) {
    throw new Error('BACKUP_MANIFEST_INVALID');
  }
  return value as BackupManifest;
};

export const parseBackupChecksums = (value: unknown): BackupChecksums => {
  if (
    !isObject(value) ||
    value.algorithm !== 'sha256' ||
    !isObject(value.files)
  ) {
    throw new Error('BACKUP_CHECKSUMS_INVALID');
  }
  for (const [path, checksum] of Object.entries(value.files)) {
    if (!isSafeArchivePath(path) || !isSha256(checksum)) {
      throw new Error('BACKUP_CHECKSUMS_INVALID');
    }
  }
  return value as BackupChecksums;
};

export const parseBackupPayload = (
  value: unknown,
  manifest: BackupManifest,
): { payload: BackupPayload; media: StoredMedia[] } => {
  if (
    !isObject(value) ||
    !(value.profile === null || isObject(value.profile)) ||
    !Array.isArray(value.records) ||
    !Array.isArray(value.stadiums) ||
    !Array.isArray(value.games) ||
    !Array.isArray(value.reminders) ||
    !(
      value.legacyCommunityPosts === undefined ||
      Array.isArray(value.legacyCommunityPosts)
    )
  ) {
    throw new Error('BACKUP_DATA_INVALID');
  }

  const profile = value.profile as Record<string, unknown> | null;
  if (
    profile !== null &&
    (!isString(profile.nickname) ||
      !Number.isInteger(profile.teamId) ||
      Number(profile.teamId) < 1 ||
      Number(profile.teamId) > 10)
  ) {
    throw new Error('BACKUP_DATA_INVALID');
  }

  const records = value.records.map(parseRecord);
  const stadiums = value.stadiums.map(parseStadium);
  const games = value.games.map(parseGame);
  const reminders = value.reminders.map(parseReminder);
  const legacyCommunityPosts = (
    (value.legacyCommunityPosts as unknown[] | undefined) ?? []
  ).map(parseLegacyCommunityPost);
  const media = records.flatMap(record =>
    [record.photo, record.ticket].filter(
      (item): item is StoredMedia => item !== null,
    ),
  );

  assertUnique(records.map(record => record.id));
  assertUnique(stadiums.map(stadium => stadium.id));
  assertUnique(games.map(game => game.id));
  assertUnique(reminders.map(reminder => reminder.id));
  assertUnique(media.map(item => item.id));
  assertUnique(media.map(item => item.relativePath));
  assertUnique(legacyCommunityPosts.map(item => item.id));
  assertUnique(legacyCommunityPosts.map(item => item.legacyServerPostId));

  if (
    manifest.recordCount !== records.length ||
    manifest.mediaCount !== media.length ||
    manifest.reminderCount !== reminders.length ||
    (manifest.communityPostCount ?? 0) !== legacyCommunityPosts.length ||
    manifest.totalMediaBytes !==
      media.reduce((total, item) => total + item.byteSize, 0)
  ) {
    throw new Error('BACKUP_MANIFEST_MISMATCH');
  }

  const stadiumIds = new Set(stadiums.map(stadium => stadium.id));
  const gameIds = new Set(games.map(game => game.id));
  const recordIds = new Set(records.map(record => record.id));
  if (games.some(game => !stadiumIds.has(game.stadiumId))) {
    throw new Error('BACKUP_DATA_INVALID');
  }
  if (records.some(record => record.gameId && !gameIds.has(record.gameId))) {
    throw new Error('BACKUP_DATA_INVALID');
  }
  if (
    reminders.some(
      reminder =>
        (reminder.gameId && !gameIds.has(reminder.gameId)) ||
        (reminder.recordId && !recordIds.has(reminder.recordId)),
    )
  ) {
    throw new Error('BACKUP_DATA_INVALID');
  }

  return {
    payload: {
      profile: profile as LocalProfile | null,
      records,
      stadiums,
      games,
      reminders,
      legacyCommunityPosts,
      recovery:
        isObject(value.recovery) &&
        value.recovery.source === 'legacy_server' &&
        Number.isInteger(value.recovery.missingMediaCount) &&
        Number(value.recovery.missingMediaCount) >= 0
          ? {
              source: 'legacy_server',
              missingMediaCount: Number(value.recovery.missingMediaCount),
            }
          : undefined,
    },
    media,
  };
};
