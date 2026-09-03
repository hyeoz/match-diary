import { ImageSourcePropType } from 'react-native';

const nicknameAdjectives = [
  '빠른',
  '힘찬',
  '용감한',
  '반짝이는',
  '끈기 있는',
  '침착한',
];
const nicknameNouns = [
  '야구공',
  '직관러',
  '응원단장',
  '홈런',
  '더그아웃',
  '승부사',
];

export const getRandomNickname = () => {
  const adjective =
    nicknameAdjectives[Math.floor(Math.random() * nicknameAdjectives.length)];
  const noun = nicknameNouns[Math.floor(Math.random() * nicknameNouns.length)];
  return `${adjective} ${noun}`;
};

export type TeamOption = {
  id: number;
  name: string;
  shortName: string;
  color: string;
  mascot: ImageSourcePropType;
};

export const teams: TeamOption[] = [
  {
    id: 1,
    name: 'SSG 랜더스',
    shortName: '랜더스',
    color: '#CE3139',
    mascot: require('@/assets/mascots/dog.png'),
  },
  {
    id: 2,
    name: 'LG 트윈스',
    shortName: '트윈스',
    color: '#292929',
    mascot: require('@/assets/mascots/twins.png'),
  },
  {
    id: 4,
    name: 'KT 위즈',
    shortName: '위즈',
    color: '#333333',
    mascot: require('@/assets/mascots/wizard.png'),
  },
  {
    id: 10,
    name: '한화 이글스',
    shortName: '이글스',
    color: '#F47B20',
    mascot: require('@/assets/mascots/eagle.png'),
  },
  {
    id: 8,
    name: '롯데 자이언츠',
    shortName: '자이언츠',
    color: '#173B69',
    mascot: require('@/assets/mascots/seagull.png'),
  },
  {
    id: 3,
    name: '키움 히어로즈',
    shortName: '히어로즈',
    color: '#8B1E2D',
    mascot: require('@/assets/mascots/hero.png'),
  },
  {
    id: 6,
    name: 'NC 다이노스',
    shortName: '다이노스',
    color: '#2F67A9',
    mascot: require('@/assets/mascots/dinosaur.png'),
  },
  {
    id: 5,
    name: 'KIA 타이거즈',
    shortName: '타이거즈',
    color: '#E43E37',
    mascot: require('@/assets/mascots/tiger.png'),
  },
  {
    id: 7,
    name: '삼성 라이온즈',
    shortName: '라이온즈',
    color: '#285EA8',
    mascot: require('@/assets/mascots/lion.png'),
  },
  {
    id: 9,
    name: '두산 베어스',
    shortName: '베어스',
    color: '#152D4F',
    mascot: require('@/assets/mascots/bear.png'),
  },
];

export const stadiums = [
  { id: 'incheon', name: '인천SSG랜더스필드', shortName: '랜더스필드' },
  { id: 'jamsil', name: '잠실야구장', shortName: '잠실야구장' },
  { id: 'suwon', name: '수원KT위즈파크', shortName: '위즈파크' },
  { id: 'daejeon', name: '대전한화생명볼파크', shortName: '볼파크' },
  { id: 'sajik', name: '사직야구장', shortName: '사직야구장' },
  { id: 'gocheok', name: '고척스카이돔', shortName: '고척스카이돔' },
  { id: 'changwon', name: '창원NC파크', shortName: 'NC파크' },
  { id: 'gwangju', name: '광주기아챔피언스필드', shortName: '챔피언스필드' },
  { id: 'daegu', name: '대구삼성라이온즈파크', shortName: '라이온즈파크' },
];

export const teamById = (teamId: number) =>
  teams.find(team => team.id === teamId) ?? teams[0];
