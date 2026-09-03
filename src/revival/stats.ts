import dayjs from 'dayjs';

import type { LocalRecord, RecordResult } from './storage/types';

export type SeasonStats = {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  undecided: number;
  winRate: number;
  stadiums: number;
};

export const getSeasonYears = (records: LocalRecord[]): number[] => {
  const years = Array.from(
    new Set(records.map(record => dayjs(record.date).year())),
  ).sort((a, b) => b - a);
  return years.length ? years : [dayjs().year()];
};

export const getSeasonStats = (
  records: LocalRecord[],
  year: number,
): SeasonStats => {
  const season = records.filter(record => dayjs(record.date).year() === year);
  const count = (result: RecordResult) =>
    season.filter(record => record.result === result).length;
  const wins = count('win');
  const losses = count('lose');
  const draws = count('draw');
  const decided = wins + losses;
  return {
    total: season.length,
    wins,
    losses,
    draws,
    undecided: count('unknown'),
    winRate: decided ? Math.round((wins / decided) * 100) : 0,
    stadiums: new Set(season.map(record => record.stadium)).size,
  };
};
