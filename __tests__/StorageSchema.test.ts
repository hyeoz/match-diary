import {
  SCHEMA_V1,
  SCHEMA_V2,
  SCHEMA_V3,
  SCHEMA_VERSION,
} from '../src/revival/storage/schema';

describe('local SQLite schema', () => {
  const schema = SCHEMA_V1.join('\n');

  it('필수 도메인과 마이그레이션 로그를 모두 생성한다', () => {
    expect(SCHEMA_VERSION).toBe(3);
    for (const table of [
      'profile',
      'stadiums',
      'games',
      'records',
      'record_media',
      'reminders',
      'backup_history',
      'migration_log',
    ]) {
      expect(schema).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });

  it('서버 복구 기록의 출처와 중복 방지 키를 보존한다', () => {
    const migration = SCHEMA_V3.join('\n');
    expect(migration).toContain('legacy_server_record_id TEXT');
    expect(migration).toContain('source TEXT NOT NULL');
    expect(migration).toContain('CREATE UNIQUE INDEX IF NOT EXISTS');
    expect(migration).toContain('legacy_community_posts');
  });

  it('일정 결과와 비고를 보존하도록 스키마를 확장한다', () => {
    const migration = SCHEMA_V2.join('\n');
    expect(migration).toContain('home_score INTEGER');
    expect(migration).toContain('away_score INTEGER');
    expect(migration).toContain('memo TEXT NOT NULL');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS schedule_metadata');
  });

  it('사진 경로·크기·체크섬과 삭제 전파를 보장한다', () => {
    expect(schema).toContain('relative_path TEXT NOT NULL UNIQUE');
    expect(schema).toContain('byte_size INTEGER NOT NULL');
    expect(schema).toContain('checksum_sha256 TEXT NOT NULL');
    expect(schema).toContain('ON DELETE CASCADE');
  });
});
