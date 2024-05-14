const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_FORMAT_SLASH = 'YYYY/MM/DD';

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

const stadiumObject: { [key: string]: string } = {
  KIA: '광주',
  NC: '마산',
  KT: '수원',
  SSG: '인천',
  LG: '잠실',
  삼성: '대구',
  롯데: '사직',
  두산: '잠실',
  한화: '대전',
  키움: '고척',
};

export {
  DATE_FORMAT,
  DATE_FORMAT_SLASH,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  MY_TEAM_KEY,
  MONTH_LIST,
  DAYS_NAME_KOR,
  DAYS_NAME_KOR_SHORT,
  stadiumObject,
};
