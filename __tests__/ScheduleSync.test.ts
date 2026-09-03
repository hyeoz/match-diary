import {
  fetchScheduleUpdate,
  ScheduleFetcher,
  sha256Hex,
} from '../src/revival/scheduleSync';

const stadium = {
  id: 'jamsil',
  name: '잠실야구장',
  shortName: '잠실',
  latitude: 37.5122,
  longitude: 127.0719,
  updatedAt: '2026-09-03T00:00:00Z',
};

const games = Array.from({ length: 100 }, (_, index) => ({
  id: `game-${index}`,
  date: '2026-09-03',
  time: '18:30',
  homeTeamId: 1,
  awayTeamId: 2,
  stadiumId: 'jamsil',
  status: 'scheduled',
  homeScore: null,
  awayScore: null,
  memo: '',
  updatedAt: '2026-09-03T00:00:00Z',
}));

const seasonDocument = {
  schemaVersion: 1,
  season: 2026,
  dataVersion: 'a'.repeat(64),
  generatedAt: '2026-09-03T00:00:00Z',
  stadiums: [stadium],
  games,
};
const seasonText = `${JSON.stringify(seasonDocument)}\n`;
const manifest = {
  schemaVersion: 1,
  currentSeason: 2026,
  generatedAt: '2026-09-03T00:00:00Z',
  seasons: [
    {
      season: 2026,
      path: 'schedules/2026.json',
      sha256: sha256Hex(seasonText),
      dataVersion: 'a'.repeat(64),
      gameCount: games.length,
      generatedAt: '2026-09-03T00:00:00Z',
    },
  ],
};

const fetcher = (checksum = manifest.seasons[0].sha256) => {
  const changedManifest = {
    ...manifest,
    seasons: [{ ...manifest.seasons[0], sha256: checksum }],
  };
  return jest.fn(async (url: string) => ({
    ok: true,
    status: 200,
    text: async () =>
      url.endsWith('latest.json')
        ? JSON.stringify(changedManifest)
        : seasonText,
  })) as jest.MockedFunction<ScheduleFetcher>;
};

describe('schedule sync', () => {
  it('UTF-8 문자열의 SHA-256을 계산한다', () => {
    expect(sha256Hex('직관일기')).toBe(
      '1c927181b45b2b7d7aa1a2b0ae83ee4633dfb9f8a48a87e14226a2967e2c93f8',
    );
  });

  it('새 버전만 내려받아 앱 저장 타입으로 변환한다', async () => {
    const request = fetcher();
    const update = await fetchScheduleUpdate(null, request);

    expect(request).toHaveBeenCalledTimes(2);
    expect(update?.games).toHaveLength(100);
    expect(update?.games[0].sourceVersion).toBe('a'.repeat(64));
  });

  it('현재 버전과 같으면 시즌 파일을 다시 받지 않는다', async () => {
    const request = fetcher();
    const update = await fetchScheduleUpdate('a'.repeat(64), request);

    expect(update).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('체크섬이 다르면 기존 캐시를 교체하지 않는다', async () => {
    await expect(
      fetchScheduleUpdate(null, fetcher('b'.repeat(64))),
    ).rejects.toThrow('SCHEDULE_CHECKSUM_MISMATCH');
  });
});
