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
};
