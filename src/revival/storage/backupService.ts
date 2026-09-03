import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs2';
import Share from 'react-native-share';
import {
  getUncompressedSize,
  listContents,
  unzip,
  zip,
} from 'react-native-zip-archive';

import { MediaStorage } from './mediaStorage';
import { LocalRepository } from './repository';
import {
  BACKUP_APP_VERSION,
  BACKUP_EXTENSION,
  BACKUP_FORMAT,
  BACKUP_MIME_TYPE,
  BACKUP_VERSION,
  BackupChecksums,
  BackupManifest,
  BackupPayload,
  isSafeArchivePath,
  parseBackupChecksums,
  parseBackupManifest,
  parseBackupPayload,
  ValidatedBackup,
} from './backupFormat';
import {
  BackupExportResult,
  BackupRestoreResult,
  createLocalId,
  Game,
  LocalProfile,
  LocalRecord,
  LocalReminder,
  ScheduledGame,
  Stadium,
  StoredMedia,
} from './types';

const MINIMUM_FREE_SPACE = 20 * 1024 * 1024;
const MAXIMUM_BACKUP_SIZE = 8 * 1024 * 1024 * 1024;
const MANIFEST_FILE = 'manifest.json';
const DATA_FILE = 'data.json';
const CHECKSUMS_FILE = 'checksums.json';

type BackupSnapshot = {
  profile: LocalProfile | null;
  records: LocalRecord[];
  games: ScheduledGame[];
  stadiums: Stadium[];
  reminders: LocalReminder[];
};

const normalizeFilePath = (uri: string): string => {
  const path = uri.startsWith('file://') ? uri.slice('file://'.length) : uri;
  return decodeURI(path);
};

const parseJson = (value: string, errorCode: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(errorCode);
  }
};

const mediaForRecords = (records: LocalRecord[]): StoredMedia[] =>
  records.flatMap(record =>
    [record.photo, record.ticket].filter(
      (item): item is StoredMedia => item !== null,
    ),
  );

const uniqueParentFolders = (paths: string[]): string[] => [
  ...new Set(paths.map(path => path.split('/').slice(0, -1).join('/'))),
];

const backupFileName = (createdAt: string): string =>
  `matchdiary-${createdAt
    .replace(/[-:]/g, '')
    .replace('T', '-')
    .replace(/\.\d{3}Z$/, 'Z')}${BACKUP_EXTENSION}`;

const toPayload = (snapshot: BackupSnapshot): BackupPayload => ({
  profile: snapshot.profile,
  records: snapshot.records,
  stadiums: snapshot.stadiums,
  games: snapshot.games.map(({ stadium: _stadium, ...game }) => game as Game),
  reminders: snapshot.reminders.map(reminder => ({
    ...reminder,
    nativeNotificationId: null,
  })),
});

export class AppBackupService {
  constructor(
    private readonly repository: LocalRepository,
    private readonly mediaStorage: MediaStorage,
  ) {}

  cleanupStaleWorkspaces = async (): Promise<void> => {
    const root = `${RNFS.CachesDirectoryPath}/matchdiary`;
    if (!(await RNFS.exists(root))) return;
    const entries = await RNFS.readDir(root);
    await Promise.all(
      entries.map(entry => RNFS.unlink(entry.path).catch(() => undefined)),
    );
  };

  createAndShare = async (
    snapshot: BackupSnapshot,
  ): Promise<BackupExportResult | null> => {
    await this.cleanupStaleWorkspaces();
    const createdAt = new Date().toISOString();
    const operationId = createLocalId('backup');
    const workspace = `${RNFS.CachesDirectoryPath}/matchdiary/${operationId}`;
    const payloadFolder = `${workspace}/payload`;
    const fileName = backupFileName(createdAt);
    const archivePath = `${workspace}/${fileName}`;
    const payload = toPayload(snapshot);
    const media = mediaForRecords(payload.records);
    const totalMediaBytes = media.reduce(
      (total, item) => total + item.byteSize,
      0,
    );
    let keepWorkspaceForSharedFile = false;

    await this.assertFreeSpace(totalMediaBytes * 2 + MINIMUM_FREE_SPACE);
    await RNFS.mkdir(payloadFolder);

    try {
      const mediaPaths = media.map(item => item.relativePath);
      for (const folder of uniqueParentFolders(mediaPaths)) {
        await RNFS.mkdir(`${payloadFolder}/${folder}`);
      }

      const checksums: BackupChecksums = {
        algorithm: 'sha256',
        files: {},
      };
      for (const item of media) {
        const source = normalizeFilePath(
          this.mediaStorage.resolveUri(item.relativePath),
        );
        if (!(await RNFS.exists(source))) {
          throw new Error('BACKUP_MEDIA_MISSING');
        }
        const stats = await RNFS.stat(source);
        if (stats.size !== item.byteSize)
          throw new Error('BACKUP_MEDIA_MISSING');
        const sourceChecksum = await RNFS.hash(source, 'sha256');
        if (
          sourceChecksum.toLowerCase() !== item.checksumSha256.toLowerCase()
        ) {
          throw new Error('BACKUP_MEDIA_CORRUPTED');
        }
        const destination = `${payloadFolder}/${item.relativePath}`;
        await RNFS.copyFile(source, destination);
        checksums.files[item.relativePath] = await RNFS.hash(
          destination,
          'sha256',
        );
      }

      const dataPath = `${payloadFolder}/${DATA_FILE}`;
      await RNFS.writeFile(dataPath, JSON.stringify(payload), 'utf8');
      checksums.files[DATA_FILE] = await RNFS.hash(dataPath, 'sha256');

      const checksumsPath = `${payloadFolder}/${CHECKSUMS_FILE}`;
      await RNFS.writeFile(checksumsPath, JSON.stringify(checksums), 'utf8');
      const checksumsSha256 = await RNFS.hash(checksumsPath, 'sha256');
      const manifest: BackupManifest = {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        createdAt,
        appVersion: BACKUP_APP_VERSION,
        recordCount: payload.records.length,
        mediaCount: media.length,
        reminderCount: payload.reminders.length,
        totalMediaBytes,
        checksumsSha256,
      };
      await RNFS.writeFile(
        `${payloadFolder}/${MANIFEST_FILE}`,
        JSON.stringify(manifest),
        'utf8',
      );

      await zip(payloadFolder, archivePath);
      const [archiveStats, checksumSha256] = await Promise.all([
        RNFS.stat(archivePath),
        RNFS.hash(archivePath, 'sha256'),
      ]);
      const shareResult = await Share.open({
        failOnCancel: false,
        filename: fileName,
        saveToFiles: true,
        title: '직관일기 전체 백업 저장',
        type: BACKUP_MIME_TYPE,
        url: `file://${archivePath}`,
      });
      if (!shareResult.success || shareResult.dismissedAction) return null;
      // Android recipients can open the content URI after the share promise
      // resolves. Keep the cache file until the next app start/backup.
      keepWorkspaceForSharedFile = true;

      const history: BackupExportResult = {
        id: operationId,
        fileName,
        checksumSha256,
        recordCount: payload.records.length,
        mediaCount: media.length,
        byteSize: archiveStats.size,
        createdAt,
      };
      await this.repository.addBackupHistory(history);
      return history;
    } finally {
      if (!keepWorkspaceForSharedFile) {
        await RNFS.unlink(workspace).catch(() => undefined);
      }
    }
  };

  pickAndRestore = async (): Promise<BackupRestoreResult | null> => {
    let picked;
    try {
      picked = await DocumentPicker.pickSingle({
        copyTo: 'cachesDirectory',
        type: [DocumentPicker.types.allFiles],
      });
    } catch (error) {
      if (DocumentPicker.isCancel(error)) return null;
      throw error;
    }
    if (picked.copyError || !picked.fileCopyUri) {
      throw new Error('BACKUP_FILE_COPY_FAILED');
    }

    const operationId = createLocalId('restore');
    const workspace = `${RNFS.CachesDirectoryPath}/matchdiary/${operationId}`;
    const extractedFolder = `${workspace}/extracted`;
    await RNFS.mkdir(extractedFolder);

    const archivePath = normalizeFilePath(picked.fileCopyUri);
    try {
      const entries = await listContents(archivePath);
      const archiveFiles = entries.filter(entry => !entry.isDirectory);
      if (
        !archiveFiles.length ||
        entries.some(
          entry =>
            entry.isEncrypted ||
            !isSafeArchivePath(
              entry.isDirectory ? entry.path.replace(/\/$/, '') : entry.path,
            ),
        )
      ) {
        throw new Error('BACKUP_ARCHIVE_UNSAFE');
      }
      const uncompressedSize = await getUncompressedSize(archivePath);
      if (uncompressedSize <= 0 || uncompressedSize > MAXIMUM_BACKUP_SIZE) {
        throw new Error('BACKUP_SIZE_INVALID');
      }
      await this.assertFreeSpace(uncompressedSize + MINIMUM_FREE_SPACE);
      await unzip(archivePath, extractedFolder);

      const validated = await this.validateExtractedBackup(
        extractedFolder,
        archiveFiles.map(entry => entry.path),
      );
      return await this.mergeValidatedBackup(extractedFolder, validated);
    } finally {
      await Promise.all([
        RNFS.unlink(workspace).catch(() => undefined),
        RNFS.unlink(archivePath).catch(() => undefined),
      ]);
    }
  };

  private validateExtractedBackup = async (
    extractedFolder: string,
    archiveFiles: string[],
  ): Promise<ValidatedBackup> => {
    for (const required of [MANIFEST_FILE, DATA_FILE, CHECKSUMS_FILE]) {
      if (!archiveFiles.includes(required)) {
        throw new Error('BACKUP_FILE_MISSING');
      }
    }

    const [manifestText, dataText, checksumsText] = await Promise.all([
      RNFS.readFile(`${extractedFolder}/${MANIFEST_FILE}`, 'utf8'),
      RNFS.readFile(`${extractedFolder}/${DATA_FILE}`, 'utf8'),
      RNFS.readFile(`${extractedFolder}/${CHECKSUMS_FILE}`, 'utf8'),
    ]);
    const manifest = parseBackupManifest(
      parseJson(manifestText, 'BACKUP_MANIFEST_INVALID'),
    );
    const checksums = parseBackupChecksums(
      parseJson(checksumsText, 'BACKUP_CHECKSUMS_INVALID'),
    );
    const checksumsHash = await RNFS.hash(
      `${extractedFolder}/${CHECKSUMS_FILE}`,
      'sha256',
    );
    if (
      checksumsHash.toLowerCase() !== manifest.checksumsSha256.toLowerCase()
    ) {
      throw new Error('BACKUP_CHECKSUM_MISMATCH');
    }
    const parsed = parseBackupPayload(
      parseJson(dataText, 'BACKUP_DATA_INVALID'),
      manifest,
    );

    const expectedFiles = new Set([
      MANIFEST_FILE,
      CHECKSUMS_FILE,
      ...Object.keys(checksums.files),
    ]);
    if (
      expectedFiles.size !== archiveFiles.length ||
      archiveFiles.some(path => !expectedFiles.has(path))
    ) {
      throw new Error('BACKUP_ARCHIVE_CONTENT_INVALID');
    }
    const expectedChecksumPaths = new Set([
      DATA_FILE,
      ...parsed.media.map(item => item.relativePath),
    ]);
    if (
      expectedChecksumPaths.size !== Object.keys(checksums.files).length ||
      Object.keys(checksums.files).some(
        path => !expectedChecksumPaths.has(path),
      )
    ) {
      throw new Error('BACKUP_CHECKSUMS_INVALID');
    }

    for (const [path, expectedChecksum] of Object.entries(checksums.files)) {
      const absolutePath = `${extractedFolder}/${path}`;
      if (!(await RNFS.exists(absolutePath))) {
        throw new Error('BACKUP_FILE_MISSING');
      }
      const checksum = await RNFS.hash(absolutePath, 'sha256');
      if (checksum.toLowerCase() !== expectedChecksum.toLowerCase()) {
        throw new Error('BACKUP_CHECKSUM_MISMATCH');
      }
    }

    return {
      manifest,
      payload: parsed.payload,
      checksums,
      media: parsed.media,
    };
  };

  private mergeValidatedBackup = async (
    extractedFolder: string,
    backup: ValidatedBackup,
  ): Promise<BackupRestoreResult> => {
    const currentRecords = await this.repository.listRecords();
    const existingRecordIds = new Set(currentRecords.map(record => record.id));
    const recordsToImport = backup.payload.records.filter(
      record => !existingRecordIds.has(record.id),
    );
    const skippedBeforeMerge =
      backup.payload.records.length - recordsToImport.length;
    const importedMedia: StoredMedia[] = [];
    const adaptedRecords: LocalRecord[] = [];

    try {
      for (const record of recordsToImport) {
        const adapted: LocalRecord = { ...record, photo: null, ticket: null };
        for (const item of [record.photo, record.ticket]) {
          if (!item) continue;
          const stored = await this.mediaStorage.persist(
            {
              uri: `file://${extractedFolder}/${item.relativePath}`,
              fileName: item.originalName,
              mimeType: item.mimeType,
              fileSize: item.byteSize,
              width: item.width ?? undefined,
              height: item.height ?? undefined,
            },
            item.kind,
          );
          importedMedia.push(stored);
          adapted[item.kind] = stored;
        }
        adaptedRecords.push(adapted);
      }

      const result = await this.repository.mergeBackup({
        ...backup.payload,
        records: adaptedRecords,
      });
      const importedIds = new Set(result.importedRecordIds);
      const unusedPaths = adaptedRecords
        .filter(record => !importedIds.has(record.id))
        .flatMap(record => [record.photo, record.ticket])
        .filter((item): item is StoredMedia => item !== null)
        .map(item => item.relativePath);
      await this.mediaStorage.removeMany(unusedPaths);

      const importedMediaCount = adaptedRecords
        .filter(record => importedIds.has(record.id))
        .flatMap(record => [record.photo, record.ticket])
        .filter((item): item is StoredMedia => item !== null).length;
      return {
        recordCount: result.importedRecordIds.length,
        skippedRecordCount: skippedBeforeMerge + result.skippedRecordCount,
        mediaCount: importedMediaCount,
        reminderCount: result.importedReminderIds.length,
        notificationFailureCount: 0,
      };
    } catch (error) {
      await this.mediaStorage.removeMany(
        importedMedia.map(item => item.relativePath),
      );
      throw error;
    }
  };

  private assertFreeSpace = async (requiredBytes: number): Promise<void> => {
    const fileSystem = await RNFS.getFSInfo();
    if (fileSystem.freeSpace < requiredBytes) {
      throw new Error('BACKUP_STORAGE_SPACE_INSUFFICIENT');
    }
  };
}
