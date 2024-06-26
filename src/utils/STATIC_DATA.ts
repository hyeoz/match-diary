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

const STADIUM_SHORT_NAME: { [key: string]: string } = {
  LG: '잠실',
  두산: '잠실',
  SSG: '문학',
  KT: '수원',
  한화: '대전',
  삼성: '대구',
  롯데: '사직',
  KIA: '광주',
  NC: '창원',
  키움: '고척',
};

const STADIUM_SHORT_TO_LONG: { [key: string]: string } = {
  잠실: '잠실야구장',
  문학: '인천SSG랜더스필드',
  수원: '수원KT위즈파크',
  대전: '한화생명이글스파크',
  대구: '대구삼성라이온즈파크',
  사직: '사직야구장',
  광주: '광주기아챔피언스필드',
  창원: '창원NC파크',
  고척: '고척스카이돔',
};

const STADIUM_GEO: {
  [key: string]: {
    lat: number;
    lon: number;
  };
} = {
  잠실: {
    lat: 37.5122579,
    lon: 127.0719011,
  },
  문학: {
    lat: 37.4370423,
    lon: 126.6932617,
  },
  수원: {
    lat: 37.2997553,
    lon: 127.0096685,
  },
  대전: {
    lat: 36.3172026,
    lon: 127.4285703,
  },
  대구: {
    lat: 35.8410136,
    lon: 128.6819955,
  },
  사직: {
    lat: 35.1940316,
    lon: 129.0615183,
  },
  광주: {
    lat: 35.1682592,
    lon: 126.8884114,
  },
  창원: {
    lat: 35.2225335,
    lon: 128.5823895,
  },
  고척: {
    lat: 37.498182,
    lon: 126.8670082,
  },
};

// 인스타그램 링크
const INSTAGRAM_LINK = 'instagram://user?username=match_diary_official';
// 인스타그램이 설치되어 있지 않을 때 웹 링크
const INSTAGRAM_WEB_LINK = 'https://www.instagram.com/match_diary_official/';
// 메일 링크
const EMAIL_LINK = 'mailto:match.diary24@gmail.com';

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
  STADIUM_GEO,
  STADIUM_SHORT_NAME,
  STADIUM_SHORT_TO_LONG,
  INSTAGRAM_LINK,
  INSTAGRAM_WEB_LINK,
  EMAIL_LINK,
};
