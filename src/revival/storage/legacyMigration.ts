import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs2';

import { MediaStorage } from './mediaStorage';
import { LocalRepository } from './repository';
import {
  createLocalId,
  LocalProfile,
  LocalRecordDraft,
  MediaSource,
  StoredMedia,
  StoredRecordInput,
} from './types';

const PROFILE_KEY = 'REVIVAL_PROFILE_V1';
const RECORDS_KEY = 'REVIVAL_RECORDS_UI_V1';
const LEGACY_DATE_KEY = /^\d{4}-\d{2}-\d{2}(\s*\(\d+\))?$/;

type PreviousUiRecord = LocalRecordDraft & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

type LegacyImage = {
  path?: string;
  uri?: string;
  filename?: string;
  name?: string;
  mime?: string;
  type?: string;
  size?: number;
  width?: number;
  height?: number;
};

type LegacyRecord = {
  date?: string;
  memo?: string;
  selectedStadium?: string;
  image?: LegacyImage | string | null;
  ticket_image?: LegacyImage | string | null;
};

const parseJson = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const toMediaSource = async (
  value: LegacyImage | string | null | undefined,
): Promise<MediaSource | null> => {
  if (!value) return null;
  const path = typeof value === 'string' ? value : value.path || value.uri;
  if (!path) return null;
  const normalizedPath = path.startsWith('file://') ? path.slice(7) : path;
  if (!(await RNFS.exists(normalizedPath))) return null;
  if (typeof value === 'string') return { uri: value };
  return {
    uri: path,
    fileName: value.filename || value.name,
    mimeType: value.mime || value.type,
    fileSize: value.size,
    width: value.width,
    height: value.height,
  };
};

const migrateRecord = async (
  repository: LocalRepository,
  mediaStorage: MediaStorage,
  sourceKey: string,
  record: StoredRecordInput,
): Promise<void> => {
  try {
    const created = await repository.createMigratedRecord(sourceKey, record);
    if (!created) {
      await mediaStorage.removeMany(
        record.media.map(media => media.relativePath),
      );
    }
  } catch (error) {
    await mediaStorage.removeMany(
      record.media.map(media => media.relativePath),
    );
    throw error;
  }
};

export const migrateLegacyAsyncStorage = async (
  repository: LocalRepository,
  mediaStorage: MediaStorage,
): Promise<void> => {
  const profile = parseJson<LocalProfile>(
    await AsyncStorage.getItem(PROFILE_KEY),
  );
  if (profile && !(await repository.hasMigration(`async:${PROFILE_KEY}`))) {
    await repository.upsertProfile(profile);
    await repository.markMigration(`async:${PROFILE_KEY}`);
  }

  const previousRecords =
    parseJson<PreviousUiRecord[]>(await AsyncStorage.getItem(RECORDS_KEY)) ??
    [];
  for (const previous of previousRecords) {
    const id = previous.id || createLocalId('record');
    const createdAt = previous.createdAt || new Date().toISOString();
    await migrateRecord(
      repository,
      mediaStorage,
      `async:${RECORDS_KEY}:${id}`,
      {
        id,
        legacyServerRecordId: null,
        source: 'legacy_device',
        gameId: previous.gameId ?? null,
        date: previous.date,
        opponent: previous.opponent,
        time: previous.time,
        stadium: previous.stadium,
        seat: previous.seat,
        memo: previous.memo,
        result: previous.result,
        createdAt,
        updatedAt: previous.updatedAt || createdAt,
        media: [],
      },
    );
  }

  const keys = await AsyncStorage.getAllKeys();
  for (const key of keys.filter(candidate => LEGACY_DATE_KEY.test(candidate))) {
    const sourceKey = `async:legacy-record:${key}`;
    if (await repository.hasMigration(sourceKey)) continue;
    const legacy = parseJson<LegacyRecord>(await AsyncStorage.getItem(key));
    if (!legacy) {
      await repository.markMigration(sourceKey);
      continue;
    }

    const media: StoredMedia[] = [];
    try {
      const photoSource = await toMediaSource(legacy.image);
      const ticketSource = await toMediaSource(legacy.ticket_image);
      if (photoSource) {
        media.push(await mediaStorage.persist(photoSource, 'photo'));
      }
      if (ticketSource) {
        media.push(await mediaStorage.persist(ticketSource, 'ticket'));
      }
      const now = new Date().toISOString();
      await migrateRecord(repository, mediaStorage, sourceKey, {
        id: createLocalId('legacy'),
        legacyServerRecordId: null,
        source: 'legacy_device',
        gameId: null,
        date: legacy.date || key.slice(0, 10),
        opponent: '기존 기록',
        time: '-',
        stadium: legacy.selectedStadium || '경기장 정보 없음',
        seat: '',
        memo: legacy.memo || '',
        result: 'unknown',
        createdAt: now,
        updatedAt: now,
        media,
      });
    } catch (error) {
      await mediaStorage.removeMany(media.map(item => item.relativePath));
      throw error;
    }
  }
};
