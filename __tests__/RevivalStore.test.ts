jest.mock('../src/revival/storage/service', () => ({
  localDataService: {
    createRecord: jest.fn(),
    createBackup: jest.fn(),
    deleteAllRecords: jest.fn(),
    deleteAllUserData: jest.fn(),
    deleteRecord: jest.fn(),
    deleteReminder: jest.fn(),
    getSnapshot: jest.fn(),
    refreshSchedule: jest.fn(),
    restoreBackup: jest.fn(),
    saveProfile: jest.fn(),
    saveReminder: jest.fn(),
    updateRecord: jest.fn(),
  },
}));

import { localDataService } from '../src/revival/storage/service';
import { useRevivalStore } from '../src/revival/store';
import type { LocalRecord } from '../src/revival/storage/types';

const service = localDataService as jest.Mocked<typeof localDataService>;

const record: LocalRecord = {
  id: 'record-1',
  gameId: null,
  date: '2026-09-02',
  opponent: 'LG 트윈스',
  time: '18:30',
  stadium: '랜더스필드',
  seat: '1루 123블록',
  memo: '첫 기록',
  result: 'win',
  photo: null,
  ticket: null,
  createdAt: '2026-09-02T09:00:00.000Z',
  updatedAt: '2026-09-02T09:00:00.000Z',
};

const resetStore = () => {
  useRevivalStore.setState({
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
  });
};

describe('revival local UI store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    service.refreshSchedule.mockResolvedValue(null);
    resetStore();
  });

  it('persists and hydrates a profile', async () => {
    service.getSnapshot.mockResolvedValue({
      profile: { nickname: '야구덕후', teamId: 1 },
      records: [],
      games: [],
      stadiums: [],
      reminders: [],
      latestBackup: null,
    });
    await useRevivalStore.getState().hydrate();

    expect(useRevivalStore.getState()).toMatchObject({
      hydrated: true,
      profile: { nickname: '야구덕후', teamId: 1 },
    });
  });

  it('persists and deletes a record', async () => {
    service.createRecord.mockResolvedValue(record);
    service.deleteAllRecords.mockResolvedValue();
    await useRevivalStore.getState().saveRecord({
      date: '2026-09-02',
      opponent: 'LG 트윈스',
      time: '18:30',
      stadium: '랜더스필드',
      seat: '1루 123블록',
      memo: '첫 기록',
      result: 'win',
    });

    expect(useRevivalStore.getState().records).toHaveLength(1);

    await useRevivalStore.getState().deleteAllRecords();

    expect(useRevivalStore.getState().records).toEqual([]);
    expect(service.deleteAllRecords).toHaveBeenCalledTimes(1);
  });

  it('로컬 DB 열기 실패를 표시하고 기존 상태를 보존한다', async () => {
    service.getSnapshot.mockRejectedValue(new Error('DB_OPEN_FAILED'));

    await useRevivalStore.getState().hydrate();

    expect(useRevivalStore.getState()).toMatchObject({
      hydrated: true,
      hydrationError: 'DB_OPEN_FAILED',
      profile: null,
      records: [],
      games: [],
      stadiums: [],
      reminders: [],
    });
  });
});
