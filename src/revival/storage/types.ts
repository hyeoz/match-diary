export type RecordResult = 'win' | 'lose' | 'draw' | 'unknown';

export type LocalProfile = {
  nickname: string;
  teamId: number;
};

export type MediaKind = 'photo' | 'ticket';

export type MediaSource = {
  uri: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
};

export type StoredMedia = {
  id: string;
  kind: MediaKind;
  relativePath: string;
  mimeType: string;
  originalName: string;
  byteSize: number;
  checksumSha256: string;
  width: number | null;
  height: number | null;
  createdAt: string;
};

export type LocalRecord = {
  id: string;
  gameId: string | null;
  date: string;
  opponent: string;
  time: string;
  stadium: string;
  seat: string;
  memo: string;
  result: RecordResult;
  photo: StoredMedia | null;
  ticket: StoredMedia | null;
  createdAt: string;
  updatedAt: string;
};

export type LocalRecordDraft = Pick<
  LocalRecord,
  'date' | 'opponent' | 'time' | 'stadium' | 'seat' | 'memo' | 'result'
> & {
  gameId?: string | null;
};

export type StoredRecordInput = Omit<LocalRecord, 'photo' | 'ticket'> & {
  media: StoredMedia[];
};

export type RecordAttachments = {
  /** undefined keeps the current attachment while editing; null removes it. */
  photo?: MediaSource | null;
  ticket?: MediaSource | null;
};

export type Stadium = {
  id: string;
  name: string;
  shortName: string;
  latitude: number | null;
  longitude: number | null;
  updatedAt: string;
};

export type Game = {
  id: string;
  date: string;
  time: string;
  homeTeamId: number;
  awayTeamId: number;
  stadiumId: string;
  status: string;
  sourceVersion: string;
  updatedAt: string;
};

export type ScheduledGame = Game & {
  stadium: Stadium;
};

export type LocalReminder = {
  id: string;
  gameId: string | null;
  recordId: string | null;
  scheduledAt: string;
  nativeNotificationId: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export const createLocalId = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 12)}`;
