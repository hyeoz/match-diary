import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs2';
import Share from 'react-native-share';
import {
  getUncompressedSize,
  listContents,
  unzip,
  zip,
} from 'react-native-zip-archive';

import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
} from '../src/revival/storage/backupFormat';
import { AppBackupService } from '../src/revival/storage/backupService';
import type { MediaStorage } from '../src/revival/storage/mediaStorage';
import type { LocalRepository } from '../src/revival/storage/repository';
import type { LocalRecord, StoredMedia } from '../src/revival/storage/types';

const mediaChecksum = 'a'.repeat(64);
const dataChecksum = 'b'.repeat(64);
const checksumsChecksum = 'c'.repeat(64);
const archiveChecksum = 'd'.repeat(64);
const createdAt = '2026-09-03T10:00:00.000Z';

const photo: StoredMedia = {
  id: 'photo-1',
  kind: 'photo',
  relativePath: 'media/photos/photo-1.jpg',
  mimeType: 'image/jpeg',
  originalName: 'photo.jpg',
  byteSize: 1024,
  checksumSha256: mediaChecksum,
  width: 1200,
  height: 900,
  createdAt,
};

const record: LocalRecord = {
  id: 'record-1',
  gameId: null,
  date: '2026-09-03',
  opponent: 'LG 트윈스',
  time: '18:30',
  stadium: '문학',
  seat: '1루',
  memo: '승리',
  result: 'win',
  photo,
  ticket: null,
  createdAt,
  updatedAt: createdAt,
};

const makeRepository = (): jest.Mocked<LocalRepository> =>
  ({
    initialize: jest.fn(async () => undefined),
    getProfile: jest.fn(async () => null),
    upsertProfile: jest.fn(async () => undefined),
    listRecords: jest.fn(async () => []),
    createRecord: jest.fn(async () => undefined),
    createMigratedRecord: jest.fn(async () => true),
    updateRecord: jest.fn(async () => undefined),
    deleteRecord: jest.fn(async () => []),
    deleteAllRecords: jest.fn(async () => []),
    deleteAllUserData: jest.fn(async () => []),
    replaceSchedule: jest.fn(async () => undefined),
    getScheduleSourceVersion: jest.fn(async () => null),
    listStadiums: jest.fn(async () => []),
    listGames: jest.fn(async () => []),
    listReminders: jest.fn(async () => []),
    upsertReminder: jest.fn(async () => undefined),
    deleteReminder: jest.fn(async () => undefined),
    mergeBackup: jest.fn(async () => ({
      importedRecordIds: ['record-1'],
      importedReminderIds: [],
      skippedRecordCount: 0,
    })),
    addBackupHistory: jest.fn(async () => undefined),
    getLatestBackupHistory: jest.fn(async () => null),
    hasMigration: jest.fn(async () => false),
    markMigration: jest.fn(async () => undefined),
  } as jest.Mocked<LocalRepository>);

const makeMediaStorage = (): jest.Mocked<MediaStorage> => ({
  initialize: jest.fn(async () => undefined),
  persist: jest.fn(async () => ({
    ...photo,
    id: 'restored-photo',
    relativePath: 'media/photos/restored-photo.jpg',
  })),
  remove: jest.fn(async () => undefined),
  removeMany: jest.fn(async () => undefined),
  cleanupOrphans: jest.fn(async () => undefined),
  resolveUri: jest.fn(() => 'file:///documents/matchdiary/photo.jpg'),
});

const fileSystem = RNFS as jest.Mocked<typeof RNFS>;
const picker = DocumentPicker as jest.Mocked<typeof DocumentPicker>;
const share = Share as jest.Mocked<typeof Share>;
const zipArchive = {
  getUncompressedSize: getUncompressedSize as jest.Mock,
  listContents: listContents as jest.Mock,
  unzip: unzip as jest.Mock,
  zip: zip as jest.Mock,
};

describe('AppBackupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fileSystem.getFSInfo.mockResolvedValue({
      freeSpace: 1024 * 1024 * 1024,
      totalSpace: 1024 * 1024 * 1024,
    });
    fileSystem.exists.mockResolvedValue(true);
    fileSystem.stat.mockImplementation(
      async path =>
        ({ size: path.endsWith('.matchdiary') ? 2048 : 1024 } as never),
    );
    fileSystem.hash.mockImplementation(async path => {
      if (path.endsWith('checksums.json')) return checksumsChecksum;
      if (path.endsWith('data.json')) return dataChecksum;
      if (path.endsWith('.matchdiary')) return archiveChecksum;
      return mediaChecksum;
    });
    share.open.mockResolvedValue({ message: '', success: true });
  });

  it('DB와 사진을 검증한 뒤 하나의 백업 파일로 공유한다', async () => {
    const repository = makeRepository();
    const service = new AppBackupService(repository, makeMediaStorage());

    const result = await service.createAndShare({
      profile: { nickname: '야구팬', teamId: 1 },
      records: [record],
      games: [],
      stadiums: [],
      reminders: [],
    });

    expect(zipArchive.zip).toHaveBeenCalledTimes(1);
    expect(share.open).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: expect.stringMatching(/\.matchdiary$/),
        saveToFiles: true,
      }),
    );
    expect(repository.addBackupHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        checksumSha256: archiveChecksum,
        recordCount: 1,
      }),
    );
    expect(result).toMatchObject({ recordCount: 1, mediaCount: 1 });
  });

  it('체크섬까지 통과한 파일만 기존 데이터와 병합한다', async () => {
    const repository = makeRepository();
    const mediaStorage = makeMediaStorage();
    const service = new AppBackupService(repository, mediaStorage);
    const payload = {
      profile: { nickname: '야구팬', teamId: 1 },
      records: [record],
      stadiums: [],
      games: [],
      reminders: [],
    };
    const manifest = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      createdAt,
      appVersion: '2.3.4',
      recordCount: 1,
      mediaCount: 1,
      reminderCount: 0,
      totalMediaBytes: 1024,
      checksumsSha256: checksumsChecksum,
    };
    const checksums = {
      algorithm: 'sha256',
      files: {
        'data.json': dataChecksum,
        'media/photos/photo-1.jpg': mediaChecksum,
      },
    };
    picker.pickSingle.mockResolvedValue({
      uri: 'content://backup',
      fileCopyUri: 'file:///caches/backup.matchdiary',
      name: 'backup.matchdiary',
      type: null,
      size: 2048,
    });
    zipArchive.listContents.mockResolvedValue([
      { path: 'manifest.json', isDirectory: false, isEncrypted: false },
      { path: 'data.json', isDirectory: false, isEncrypted: false },
      { path: 'checksums.json', isDirectory: false, isEncrypted: false },
      {
        path: 'media/photos/photo-1.jpg',
        isDirectory: false,
        isEncrypted: false,
      },
    ]);
    zipArchive.getUncompressedSize.mockResolvedValue(4096);
    fileSystem.readFile.mockImplementation(async path => {
      if (path.endsWith('manifest.json')) return JSON.stringify(manifest);
      if (path.endsWith('checksums.json')) return JSON.stringify(checksums);
      return JSON.stringify(payload);
    });

    const result = await service.pickAndRestore();

    expect(zipArchive.unzip).toHaveBeenCalledTimes(1);
    expect(mediaStorage.persist).toHaveBeenCalledTimes(1);
    expect(repository.mergeBackup).toHaveBeenCalledWith(
      expect.objectContaining({
        records: [
          expect.objectContaining({
            id: 'record-1',
            photo: expect.objectContaining({ id: 'restored-photo' }),
          }),
        ],
      }),
    );
    expect(result).toMatchObject({
      recordCount: 1,
      mediaCount: 1,
      skippedRecordCount: 0,
    });
  });

  it('손상된 체크섬이면 DB와 기존 사진을 건드리지 않는다', async () => {
    const repository = makeRepository();
    const mediaStorage = makeMediaStorage();
    const service = new AppBackupService(repository, mediaStorage);
    picker.pickSingle.mockResolvedValue({
      uri: 'content://backup',
      fileCopyUri: 'file:///caches/backup.matchdiary',
      name: 'backup.matchdiary',
      type: null,
      size: 2048,
    });
    zipArchive.listContents.mockResolvedValue([
      { path: 'manifest.json', isDirectory: false, isEncrypted: false },
      { path: 'data.json', isDirectory: false, isEncrypted: false },
      { path: 'checksums.json', isDirectory: false, isEncrypted: false },
    ]);
    zipArchive.getUncompressedSize.mockResolvedValue(4096);
    fileSystem.readFile.mockImplementation(async path => {
      if (path.endsWith('manifest.json')) {
        return JSON.stringify({
          format: BACKUP_FORMAT,
          version: BACKUP_VERSION,
          createdAt,
          appVersion: '2.3.4',
          recordCount: 0,
          mediaCount: 0,
          reminderCount: 0,
          totalMediaBytes: 0,
          checksumsSha256: 'e'.repeat(64),
        });
      }
      if (path.endsWith('checksums.json')) {
        return JSON.stringify({
          algorithm: 'sha256',
          files: { 'data.json': dataChecksum },
        });
      }
      return JSON.stringify({
        profile: null,
        records: [],
        stadiums: [],
        games: [],
        reminders: [],
      });
    });

    await expect(service.pickAndRestore()).rejects.toThrow(
      'BACKUP_CHECKSUM_MISMATCH',
    );
    expect(mediaStorage.persist).not.toHaveBeenCalled();
    expect(repository.mergeBackup).not.toHaveBeenCalled();
  });
});
