import { gameStatusCaption } from '../src/revival/schedule';
import type { ScheduledGame } from '../src/revival/storage/types';

const game: ScheduledGame = {
  id: '20260901LGOB0',
  date: '2026-09-01',
  time: '18:30',
  homeTeamId: 9,
  awayTeamId: 2,
  stadiumId: 'jamsil',
  status: 'scheduled',
  homeScore: null,
  awayScore: null,
  memo: '',
  sourceVersion: 'test',
  updatedAt: '2026-09-03T00:00:00Z',
  stadium: {
    id: 'jamsil',
    name: '잠실야구장',
    shortName: '잠실',
    latitude: 37.5122,
    longitude: 127.0719,
    updatedAt: '2026-09-03T00:00:00Z',
  },
};

describe('schedule display', () => {
  it('예정 경기의 시간과 경기장을 표시한다', () => {
    expect(gameStatusCaption(game)).toBe('18:30 · 잠실야구장');
  });

  it('종료 경기의 점수를 표시한다', () => {
    expect(
      gameStatusCaption({
        ...game,
        status: 'final',
        awayScore: 3,
        homeScore: 1,
      }),
    ).toBe('3 : 1 · 경기 종료 · 잠실야구장');
  });

  it('취소 사유를 표시한다', () => {
    expect(
      gameStatusCaption({ ...game, status: 'canceled', memo: '우천취소' }),
    ).toBe('경기 취소 · 우천취소 · 잠실야구장');
  });
});
