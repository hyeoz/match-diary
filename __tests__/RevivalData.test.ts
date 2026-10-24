import { getRandomNickname, teamById, teams } from '../src/revival/data';

describe('revival static data', () => {
  it('keeps the approved ten-team mascot order', () => {
    expect(teams.map(team => team.name)).toEqual([
      'SSG 랜더스',
      'LG 트윈스',
      'KT 위즈',
      '한화 이글스',
      '롯데 자이언츠',
      '키움 히어로즈',
      'NC 다이노스',
      'KIA 타이거즈',
      '삼성 라이온즈',
      '두산 베어스',
    ]);
  });

  it('falls back to the first team for an unknown id', () => {
    expect(teamById(999)).toBe(teams[0]);
  });

  it('creates a non-empty local nickname', () => {
    expect(getRandomNickname().trim().length).toBeGreaterThan(0);
  });
});
