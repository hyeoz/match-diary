import AsyncStorage from '@react-native-async-storage/async-storage';

import { LocalDataService } from '../src/revival/storage/service';
import type { MediaStorage } from '../src/revival/storage/mediaStorage';
import type { LocalRepository } from '../src/revival/storage/repository';
import type {
  LocalProfile,
  LocalRecord,
  StoredMedia,
  StoredRecordInput,
} from '../src/revival/storage/types';

const photo: StoredMedia = {
  id: 'photo-1',
  kind: 'photo',
  relativePath: 'media/photos/photo-1.jpg',
  mimeType: 'image/jpeg',
  originalName: 'day.jpg',
  byteSize: 2048,
  checksumSha256: 'abc123',
  width: 1200,
  height: 900,
  createdAt: '2026-09-02T09:00:00.000Z',
};

const makeRepository = () => {
  let profile: LocalProfile | null = null;
  let records: LocalRecord[] = [];
  const repository: LocalRepository = {
    initialize: jest.fn(async () => undefined),
    getProfile: jest.fn(async () => profile),
    upsertProfile: jest.fn(async value => {
      profile = value;
    }),
    listRecords: jest.fn(async () => records),
    createRecord: jest.fn(async (input: StoredRecordInput) => {
      records.push({
        ...input,
        photo: input.media.find(item => item.kind === 'photo') ?? null,
        ticket: input.media.find(item => item.kind === 'ticket') ?? null,
      });
    }),
    createMigratedRecord: jest.fn(async () => true),
    updateRecord: jest.fn(async () => undefined),
    deleteRecord: jest.fn(async recordId => {
      const record = records.find(item => item.id === recordId);
      records = records.filter(item => item.id !== recordId);
      return [record?.photo, record?.ticket]
        .filter((item): item is StoredMedia => item != null)
        .map(item => item.relativePath);
    }),
    deleteAllRecords: jest.fn(async () => {
      const paths = records
        .flatMap(record => [record.photo, record.ticket])
        .filter((item): item is StoredMedia => item != null)
        .map(item => item.relativePath);
      records = [];
      return paths;
    }),
    deleteAllUserData: jest.fn(async () => []),
    replaceSchedule: jest.fn(async () => undefined),
    listStadiums: jest.fn(async () => []),
    listGames: jest.fn(async () => []),
    listReminders: jest.fn(async () => []),
    upsertReminder: jest.fn(async () => undefined),
    deleteReminder: jest.fn(async () => undefined),
    hasMigration: jest.fn(async () => false),
    markMigration: jest.fn(async () => undefined),
  };
  return repository;
};

const makeMediaStorage = (): jest.Mocked<MediaStorage> => ({
  initialize: jest.fn(async () => undefined),
  persist: jest.fn(async () => photo),
  remove: jest.fn(async () => undefined),
  removeMany: jest.fn(async () => undefined),
  cleanupOrphans: jest.fn(async () => undefined),
  resolveUri: jest.fn(path => `file:///documents/matchdiary/${path}`),
});

const draft = {
  date: '2026-09-02',
  opponent: 'LG 트윈스',
  time: '18:30',
  stadium: '랜더스필드',
  seat: '1루 123블록',
  memo: '첫 기록',
  result: 'win' as const,
};

describe('LocalDataService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('사진을 앱 전용 공간에 복사한 뒤 DB 기록을 저장한다', async () => {
    const repository = makeRepository();
    const mediaStorage = makeMediaStorage();
    const service = new LocalDataService(repository, mediaStorage);

    const saved = await service.createRecord(draft, {
      photo: { uri: 'file:///tmp/day.jpg', fileSize: 2048 },
    });

    expect(mediaStorage.persist).toHaveBeenCalledWith(
      { uri: 'file:///tmp/day.jpg', fileSize: 2048 },
      'photo',
    );
    expect(repository.createRecord).toHaveBeenCalledTimes(1);
    expect(saved.photo).toEqual(photo);
  });

  it('DB 저장이 실패하면 먼저 복사한 사진을 롤백한다', async () => {
    const repository = makeRepository();
    const mediaStorage = makeMediaStorage();
    (repository.createRecord as jest.Mock).mockRejectedValueOnce(
      new Error('DB_WRITE_FAILED'),
    );
    const service = new LocalDataService(repository, mediaStorage);

    await expect(
      service.createRecord(draft, { photo: { uri: 'file:///tmp/day.jpg' } }),
    ).rejects.toThrow('DB_WRITE_FAILED');
    expect(mediaStorage.removeMany).toHaveBeenCalledWith([
      'media/photos/photo-1.jpg',
    ]);
  });

  it('DB 기록을 먼저 삭제하고 연결된 앱 사진을 정리한다', async () => {
    const repository = makeRepository();
    const mediaStorage = makeMediaStorage();
    const service = new LocalDataService(repository, mediaStorage);
    const saved = await service.createRecord(draft, {
      photo: { uri: 'file:///tmp/day.jpg' },
    });

    await service.deleteRecord(saved.id);

    expect(repository.deleteRecord).toHaveBeenCalledWith(saved.id);
    expect(mediaStorage.removeMany).toHaveBeenLastCalledWith([
      'media/photos/photo-1.jpg',
    ]);
  });

  it('사진 교체가 성공한 뒤에만 이전 앱 사진을 정리한다', async () => {
    const repository = makeRepository();
    const mediaStorage = makeMediaStorage();
    const service = new LocalDataService(repository, mediaStorage);
    const saved = await service.createRecord(draft, {
      photo: { uri: 'file:///tmp/old.jpg' },
    });
    const replacement = {
      ...photo,
      id: 'photo-2',
      relativePath: 'media/photos/photo-2.jpg',
    };
    mediaStorage.persist.mockResolvedValueOnce(replacement);

    const updated = await service.updateRecord(saved, {
      photo: { uri: 'file:///tmp/new.jpg' },
    });

    expect(updated.photo).toEqual(replacement);
    expect(repository.updateRecord).toHaveBeenCalledTimes(1);
    expect(mediaStorage.removeMany).toHaveBeenLastCalledWith([
      photo.relativePath,
    ]);
  });
});
