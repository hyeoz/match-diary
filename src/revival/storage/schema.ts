export const DATABASE_NAME = 'matchdiary-v1.sqlite';
export const SCHEMA_VERSION = 1;

export const SCHEMA_V1 = [
  `CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    nickname TEXT NOT NULL,
    team_id INTEGER NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS stadiums (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    home_team_id INTEGER NOT NULL,
    away_team_id INTEGER NOT NULL,
    stadium_id TEXT NOT NULL,
    status TEXT NOT NULL,
    source_version TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (stadium_id) REFERENCES stadiums(id)
  )`,
  'CREATE INDEX IF NOT EXISTS games_date_idx ON games(date)',
  `CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    game_id TEXT,
    date TEXT NOT NULL,
    opponent TEXT NOT NULL,
    time TEXT NOT NULL,
    stadium TEXT NOT NULL,
    seat TEXT NOT NULL DEFAULT '',
    memo TEXT NOT NULL DEFAULT '',
    result TEXT NOT NULL CHECK (result IN ('win', 'lose', 'draw', 'unknown')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id)
  )`,
  'CREATE INDEX IF NOT EXISTS records_date_idx ON records(date)',
  `CREATE TABLE IF NOT EXISTS record_media (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('photo', 'ticket')),
    relative_path TEXT NOT NULL UNIQUE,
    mime_type TEXT NOT NULL,
    original_name TEXT NOT NULL,
    byte_size INTEGER NOT NULL,
    checksum_sha256 TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE,
    UNIQUE (record_id, kind)
  )`,
  `CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    game_id TEXT,
    record_id TEXT,
    scheduled_at TEXT NOT NULL,
    native_notification_id TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS backup_history (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    checksum_sha256 TEXT NOT NULL,
    record_count INTEGER NOT NULL,
    byte_size INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS migration_log (
    source_key TEXT PRIMARY KEY,
    migrated_at TEXT NOT NULL
  )`,
];
