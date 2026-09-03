import type { Stadium } from './storage/types';

const updatedAt = '2026-09-03T00:00:00.000Z';

/**
 * 앱에 항상 포함되는 KBO 1군 홈구장 좌표입니다.
 * 경기 일정 파일이 아직 내려오지 않아도 지도와 기존 기록 매칭에 사용합니다.
 */
export const bundledStadiums: Stadium[] = [
  {
    id: 'incheon',
    name: '인천SSG랜더스필드',
    shortName: '랜더스필드',
    latitude: 37.4369,
    longitude: 126.6933,
    updatedAt,
  },
  {
    id: 'jamsil',
    name: '잠실야구장',
    shortName: '잠실',
    latitude: 37.5122,
    longitude: 127.0719,
    updatedAt,
  },
  {
    id: 'suwon',
    name: '수원KT위즈파크',
    shortName: '수원',
    latitude: 37.2998,
    longitude: 127.0097,
    updatedAt,
  },
  {
    id: 'daejeon',
    name: '대전한화생명볼파크',
    shortName: '대전',
    latitude: 36.3171,
    longitude: 127.4292,
    updatedAt,
  },
  {
    id: 'sajik',
    name: '사직야구장',
    shortName: '사직',
    latitude: 35.194,
    longitude: 129.0615,
    updatedAt,
  },
  {
    id: 'gocheok',
    name: '고척스카이돔',
    shortName: '고척',
    latitude: 37.4982,
    longitude: 126.8671,
    updatedAt,
  },
  {
    id: 'changwon',
    name: '창원NC파크',
    shortName: '창원',
    latitude: 35.2225,
    longitude: 128.5823,
    updatedAt,
  },
  {
    id: 'gwangju',
    name: '광주기아챔피언스필드',
    shortName: '광주',
    latitude: 35.1681,
    longitude: 126.8891,
    updatedAt,
  },
  {
    id: 'daegu',
    name: '대구삼성라이온즈파크',
    shortName: '대구',
    latitude: 35.8412,
    longitude: 128.6812,
    updatedAt,
  },
];

const normalize = (value: string) => value.replace(/\s/g, '').toLowerCase();

export const findStadium = (name: string): Stadium | undefined => {
  const target = normalize(name);
  return bundledStadiums.find(stadium => {
    const full = normalize(stadium.name);
    const short = normalize(stadium.shortName);
    return full === target || short === target || full.includes(target);
  });
};
