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

const STADIUM_LONG_TO_NICK: { [key: string]: string } = {
  잠실야구장: '잠실야구장',
  인천SSG랜더스필드: '랜더스필스',
  수원KT위즈파크: '위즈파크',
  한화생명이글스파크: '이글스파크',
  대구삼성라이온즈파크: '라이온즈파크',
  사직야구장: '사직야구장',
  광주기아챔피언스필드: '챔피언스필드',
  창원NC파크: 'NC파크',
  고척스카이돔: '고척스카이돔',
  // 제2구장추가
  포항야구장: '포항야구장',
  울산문수야구장: '문수야구장',
  청주종합운동장야구장: '청주야구장',
};

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
  STADIUM_LONG_TO_NICK,
  INSTAGRAM_LINK,
  INSTAGRAM_WEB_LINK,
  EMAIL_LINK,
  RESET_RECORD,
  SERVER_ERROR_MSG,
};
