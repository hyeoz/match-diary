import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  isSafeArchivePath,
  parseBackupManifest,
  parseBackupPayload,
} from '../src/revival/storage/backupFormat';

const checksum = 'a'.repeat(64);
const createdAt = '2026-09-03T10:00:00.000Z';

const manifest = {
  format: BACKUP_FORMAT,
  version: BACKUP_VERSION,
  createdAt,
  appVersion: '2.3.4',
  recordCount: 1,
  mediaCount: 1,
  reminderCount: 0,
  communityPostCount: 0,
  totalMediaBytes: 1024,
  checksumsSha256: checksum,
} as const;

const payload = {
  profile: { nickname: '야구팬', teamId: 1 },
  stadiums: [
    {
      id: 'incheon',
      name: '인천SSG랜더스필드',
      shortName: '문학',
      latitude: 37.437,
      longitude: 126.693,
      updatedAt: createdAt,
    },
  ],
  games: [
    {
      id: 'game-1',
      date: '2026-09-03',
      time: '18:30',
      homeTeamId: 1,
      awayTeamId: 2,
      stadiumId: 'incheon',
      status: 'completed',
      homeScore: 4,
      awayScore: 2,
      memo: '',
      sourceVersion: '2026-test',
      updatedAt: createdAt,
    },
  ],
  records: [
    {
      id: 'record-1',
      legacyServerRecordId: null,
      source: 'new',
      gameId: 'game-1',
      date: '2026-09-03',
      opponent: 'LG 트윈스',
      time: '18:30',
      stadium: '문학',
      seat: '1루',
      memo: '승리',
      result: 'win',
      photo: {
        id: 'photo-1',
        kind: 'photo',
        relativePath: 'media/photos/photo-1.jpg',
        mimeType: 'image/jpeg',
        originalName: 'photo.jpg',
        byteSize: 1024,
        checksumSha256: checksum,
        width: 1200,
        height: 900,
        createdAt,
      },
      ticket: null,
      createdAt,
      updatedAt: createdAt,
    },
  ],
  reminders: [],
  legacyCommunityPosts: [],
};

describe('matchdiary backup format', () => {
  it('버전·개수·참조가 일치하는 전체 백업을 검증한다', () => {
    const parsedManifest = parseBackupManifest(manifest);
    const parsed = parseBackupPayload(payload, parsedManifest);

    expect(parsed.payload.records).toHaveLength(1);
    expect(parsed.media[0].relativePath).toBe('media/photos/photo-1.jpg');
  });

  it('현재 앱보다 새로운 버전의 백업은 거부한다', () => {
    expect(() =>
      parseBackupManifest({ ...manifest, version: BACKUP_VERSION + 1 }),
    ).toThrow('BACKUP_VERSION_NEWER');
  });

  it('경로 이탈과 절대 경로를 거부한다', () => {
    expect(isSafeArchivePath('../records.json')).toBe(false);
    expect(isSafeArchivePath('/private/photo.jpg')).toBe(false);
    expect(isSafeArchivePath('media/photos/photo.jpg')).toBe(true);
  });

  it('파일 개수와 manifest가 다르면 복원 전에 거부한다', () => {
    expect(() =>
      parseBackupPayload(payload, { ...manifest, mediaCount: 2 }),
    ).toThrow('BACKUP_MANIFEST_MISMATCH');
  });
});
