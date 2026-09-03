import { SCHEMA_V1, SCHEMA_VERSION } from '../src/revival/storage/schema';

describe('local SQLite schema', () => {
  const schema = SCHEMA_V1.join('\n');

  it('필수 도메인과 마이그레이션 로그를 모두 생성한다', () => {
    expect(SCHEMA_VERSION).toBe(1);
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

  it('사진 경로·크기·체크섬과 삭제 전파를 보장한다', () => {
    expect(schema).toContain('relative_path TEXT NOT NULL UNIQUE');
    expect(schema).toContain('byte_size INTEGER NOT NULL');
    expect(schema).toContain('checksum_sha256 TEXT NOT NULL');
    expect(schema).toContain('ON DELETE CASCADE');
  });
});
