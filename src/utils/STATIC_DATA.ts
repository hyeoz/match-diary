import { StadiumType } from '@/type/team';

const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_FORMAT_SLASH = 'YYYY/MM/DD';
const API_DATE_FORMAT = 'YYYY.MM.DD(ddd)';

const IMAGE_WIDTH = 1080;
const IMAGE_HEIGHT = 1080;

const MY_TEAM_KEY = 'MY_TEAM';

const MONTH_LIST = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];

const DAYS_NAME_KOR = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
];

const DAYS_NAME_KOR_SHORT = ['일', '월', '화', '수', '목', '금', '토'];

// 인스타그램 링크
const INSTAGRAM_LINK = 'instagram://user?username=match_diary_official';
// 인스타그램이 설치되어 있지 않을 때 웹 링크
const INSTAGRAM_WEB_LINK = 'https://www.instagram.com/match_diary_official/';
// 메일 링크
const EMAIL_LINK = 'mailto:match.diary24@gmail.com';

const RESET_RECORD = {
  user_id: '',
  date: '',
  image: null,
  user_note: '',
  stadium_id: undefined,
};

const SERVER_ERROR_MSG = '오류가 발생했어요! 잠시 후 다시 시도해주세요.';

const NO_MATCH_STADIUM_KEY = 13;

const STATIC_STADIUMS: StadiumType[] = [
  {
    stadium_id: 0,
    stadium_name: '인천SSG랜더스필드_test',
    stadium_short_name: '인천',
    latitude: 37.476568,
    longitude: 126.981649,
  },
  {
    stadium_id: 1,
    stadium_name: '인천SSG랜더스필드',
    stadium_short_name: '인천',
    latitude: 37.4370423,
    longitude: 126.6932617,
  },
  {
    stadium_id: 2,
    stadium_name: '잠실야구장',
    stadium_short_name: '잠실',
    latitude: 37.5122579,
    longitude: 127.0719011,
  },
  {
    stadium_id: 3,
    stadium_name: '수원KT위즈파크',
    stadium_short_name: '수원',
    latitude: 37.2997553,
    longitude: 127.0096685,
  },
  {
    stadium_id: 4,
    stadium_name: '대전한화생명볼파크',
    stadium_short_name: '대전',
    latitude: 36.3163364,
    longitude: 127.4306331,
  },
  {
    stadium_id: 5,
    stadium_name: '대구삼성라이온즈파크',
    stadium_short_name: '대구',
    latitude: 35.8410136,
    longitude: 128.6819955,
  },
  {
    stadium_id: 6,
    stadium_name: '사직야구장',
    stadium_short_name: '사직',
    latitude: 35.1940316,
    longitude: 129.0615183,
  },
  {
    stadium_id: 7,
    stadium_name: '광주기아챔피언스필드',
    stadium_short_name: '광주',
    latitude: 35.1682592,
    longitude: 126.8884114,
  },
  {
    stadium_id: 8,
    stadium_name: '창원NC파크',
    stadium_short_name: '창원',
    latitude: 35.2225335,
    longitude: 128.5823895,
  },
  {
    stadium_id: 9,
    stadium_name: '고척스카이돔',
    stadium_short_name: '고척',
    latitude: 37.498182,
    longitude: 126.8670082,
  },
  {
    stadium_id: 10,
    stadium_name: '포항야구장',
    stadium_short_name: '포항',
    latitude: 36.0081953,
    longitude: 129.3593993,
  },
  {
    stadium_id: 11,
    stadium_name: '울산문수야구장',
    stadium_short_name: '울산',
    latitude: 35.5321681,
    longitude: 129.2655749,
  },
  {
    stadium_id: 12,
    stadium_name: '청주종합운동장야구장',
    stadium_short_name: '청주',
    latitude: 36.6394554,
    longitude: 127.4701387,
  },
];

export {
  DATE_FORMAT,
  DATE_FORMAT_SLASH,
  API_DATE_FORMAT,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  MY_TEAM_KEY,
  MONTH_LIST,
  DAYS_NAME_KOR,
  DAYS_NAME_KOR_SHORT,
  INSTAGRAM_LINK,
  INSTAGRAM_WEB_LINK,
  EMAIL_LINK,
  RESET_RECORD,
  SERVER_ERROR_MSG,
  NO_MATCH_STADIUM_KEY,
  STATIC_STADIUMS,
};
