import { getSeasonStats, getSeasonYears } from '../src/revival/stats';
import type { LocalRecord } from '../src/revival/storage/types';

const record = (
  id: string,
  date: string,
  result: LocalRecord['result'],
  stadium: string,
): LocalRecord => ({
  id,
  gameId: null,
  date,
  opponent: '상대 팀',
  time: '18:30',
  stadium,
  seat: '',
  memo: '',
  result,
  photo: null,
  ticket: null,
  createdAt: `${date}T00:00:00.000Z`,
  updatedAt: `${date}T00:00:00.000Z`,
});

describe('revival season stats', () => {
  const records = [
    record('1', '2026-04-01', 'win', '잠실야구장'),
    record('2', '2026-04-02', 'lose', '잠실야구장'),
    record('3', '2026-05-03', 'draw', '사직야구장'),
    record('4', '2025-05-03', 'win', '고척스카이돔'),
  ];

  it('시즌 목록을 최근 연도 순으로 만든다', () => {
    expect(getSeasonYears(records)).toEqual([2026, 2025]);
  });

  it('무승부를 제외한 승패 경기로 승률을 계산한다', () => {
    expect(getSeasonStats(records, 2026)).toEqual({
      total: 3,
      wins: 1,
      losses: 1,
      draws: 1,
      undecided: 0,
      winRate: 50,
      stadiums: 2,
    });
  });
});
