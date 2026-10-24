import { NativeModules } from 'react-native';
import dayjs from 'dayjs';

import { LocalRecord } from './store';
import { bundledStadiums } from './scheduleCatalog';
import type { ScheduledGame } from './storage/types';

export type PreviewScreen =
  | 'intro'
  | 'form'
  | 'today'
  | 'calendar'
  | 'records'
  | 'map'
  | 'settings'
  | 'editor'
  | 'detail'
  | 'notifications';

export const getPreviewScreen = (): PreviewScreen | null => {
  if (!__DEV__) return null;

  const value = NativeModules.SettingsManager?.settings
    ?.REVIVAL_PREVIEW_SCREEN as PreviewScreen | undefined;

  return value ?? null;
};

export const isPreviewBannerHidden = (): boolean => {
  if (!__DEV__) return false;

  return Boolean(
    NativeModules.SettingsManager?.settings?.REVIVAL_PREVIEW_HIDE_BANNER,
  );
};

export const previewRecords = (): LocalRecord[] => [
  {
    id: 'preview-1',
    legacyServerRecordId: null,
    source: 'new',
    gameId: null,
    date: dayjs().subtract(4, 'day').format('YYYY-MM-DD'),
    opponent: '라이온즈',
    time: '18:30',
    stadium: '잠실야구장',
    seat: '1루 123블록',
    memo: '끝내기 승리! 오래 기억하고 싶은 경기.',
    result: 'win',
    photo: null,
    ticket: null,
    createdAt: dayjs().subtract(4, 'day').toISOString(),
    updatedAt: dayjs().subtract(4, 'day').toISOString(),
  },
  {
    id: 'preview-2',
    legacyServerRecordId: null,
    source: 'new',
    gameId: null,
    date: dayjs().subtract(18, 'day').format('YYYY-MM-DD'),
    opponent: '타이거즈',
    time: '14:00',
    stadium: '인천SSG랜더스필드',
    seat: '외야 4블록',
    memo: '노을이 예뻤던 주말 경기.',
    result: 'lose',
    photo: null,
    ticket: null,
    createdAt: dayjs().subtract(18, 'day').toISOString(),
    updatedAt: dayjs().subtract(18, 'day').toISOString(),
  },
  {
    id: 'preview-3',
    legacyServerRecordId: null,
    source: 'new',
    gameId: null,
    date: dayjs().subtract(32, 'day').format('YYYY-MM-DD'),
    opponent: '베어스',
    time: '18:30',
    stadium: '고척스카이돔',
    seat: '3루 207구역',
    memo: '친구와 함께한 첫 고척 직관.',
    result: 'win',
    photo: null,
    ticket: null,
    createdAt: dayjs().subtract(32, 'day').toISOString(),
    updatedAt: dayjs().subtract(32, 'day').toISOString(),
  },
  {
    id: 'preview-4',
    legacyServerRecordId: null,
    source: 'new',
    gameId: null,
    date: dayjs().subtract(47, 'day').format('YYYY-MM-DD'),
    opponent: '이글스',
    time: '17:00',
    stadium: '대구삼성라이온즈파크',
    seat: '중앙 테이블석',
    memo: '응원가를 실컷 부른 날.',
    result: 'draw',
    photo: null,
    ticket: null,
    createdAt: dayjs().subtract(47, 'day').toISOString(),
    updatedAt: dayjs().subtract(47, 'day').toISOString(),
  },
];

export const previewGames = (): ScheduledGame[] => [
  {
    id: 'preview-game-today',
    date: dayjs().format('YYYY-MM-DD'),
    time: '18:30',
    homeTeamId: 1,
    awayTeamId: 2,
    stadiumId: bundledStadiums[0].id,
    stadium: bundledStadiums[0],
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    memo: '',
    sourceVersion: 'preview',
    updatedAt: dayjs().toISOString(),
  },
];
