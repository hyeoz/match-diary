import React from 'react';
import { PermissionsAndroid } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { palette } from '@/style/palette';
// @assets
import {
  Landers,
  Bears,
  Dinos,
  Eagles,
  Heros,
  Lions,
  Twins,
  Seagull,
  Tigers,
  Wiz,
} from '@assets/svg';
import { CoordinateType } from '@/type/default';
import { NICKNAME_ADJECTIVE, NICKNAME_NOUN } from './NICKNAME_STATIC_DATA';

const hasAndroidPermission = async () => {
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission);
  return status === 'granted';
};

const renderIconSizeWithColor = (
  Svg: React.FC<SvgProps>,
  width: number,
  height?: number,
  color?: string,
) => {
  return <Svg width={width} height={height ?? width} color={color} />;
};

const getRandomElement = (array: string[]) => {
  return array[Math.floor(Math.random() * array.length)];
};

// NOTE 하버사인 공식
const radiusOfEarth = 6371;

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

const getDistanceFromLatLonToKm = (
  start: CoordinateType,
  goal: CoordinateType,
) => {
  const dLat = deg2rad(goal.lat - start.lat); // 위도 차이 (라디안으로 변환)
  const dLon = deg2rad(goal.lon - start.lon); // 경도 차이 (라디안으로 변환)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(start.lat)) *
      Math.cos(deg2rad(goal.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = radiusOfEarth * c; // 두 지점 사이의 거리 (단위: km)
  return distance;
};

const getTeamArrayWithIcon = (iconSize?: number) => [
  {
    key: 1,
    label: 'SSG 랜더스',
    icon: renderIconSizeWithColor(
      Landers,
      iconSize ?? 48,
      undefined,
      palette.teamColor.SSG,
    ),
  },
  {
    key: 2,
    label: 'LG 트윈스',
    icon: renderIconSizeWithColor(
      Twins,
      iconSize ?? 48,
      undefined,
      palette.teamColor.LG,
    ),
  },
  {
    key: 4,
    label: 'KT 위즈',
    icon: renderIconSizeWithColor(
      Wiz,
      iconSize ?? 48,
      undefined,
      palette.teamColor.KT,
    ),
  },
  {
    key: 10,
    label: '한화 이글스',
    icon: renderIconSizeWithColor(
      Eagles,
      iconSize ?? 48,
      undefined,
      palette.teamColor.한화,
    ),
  },
  {
    key: 8,
    label: '롯데 자이언츠',
    icon: renderIconSizeWithColor(
      Seagull,
      iconSize ?? 48,
      undefined,
      palette.teamColor.롯데,
    ),
  },
  {
    key: 3,
    label: '키움 히어로즈',
    icon: renderIconSizeWithColor(
      Heros,
      iconSize ?? 48,
      undefined,
      palette.teamColor.키움,
    ),
  },
  {
    key: 6,
    label: 'NC 다이노스',
    icon: renderIconSizeWithColor(
      Dinos,
      iconSize ?? 48,
      undefined,
      palette.teamColor.NC,
    ),
  },
  {
    key: 5,
    label: '기아 타이거즈',
    icon: renderIconSizeWithColor(
      Tigers,
      iconSize ?? 48,
      undefined,
      palette.teamColor.KIA,
    ),
  },
  {
    key: 7,
    label: '삼성 라이온즈',
    icon: renderIconSizeWithColor(
      Lions,
      iconSize ?? 48,
      undefined,
      palette.teamColor.삼성,
    ),
  },
  {
    key: 9,
    label: '두산 베어스',
    icon: renderIconSizeWithColor(
      Bears,
      iconSize ?? 48,
      undefined,
      palette.teamColor.두산,
    ),
  },
];

const filterDuplicatedArray = (array: Array<any>) => {
  return array.filter(
    (item, index, self) => index === self.findIndex(t => t.id === item.id),
  );
};

const getStadiumName = (selectedStadium: string) => {
  const stadium = selectedStadium.includes('DH')
    ? selectedStadium.split(' - DH')[0]
    : selectedStadium;
  return changeStadiumLongNameToNickname(stadium);
};

const getRandomNickname = () => {
  const randomAdj = getRandomElement(NICKNAME_ADJECTIVE);
  const randomNoun = getRandomElement(NICKNAME_NOUN);
  return `${randomAdj} ${randomNoun}`;
};

const changeStadiumLongNameToNickname = (name?: string) => {
  switch (name) {
    case '잠실야구장':
      return '잠실야구장';
    case '인천SSG랜더스필드':
      return '랜더스필스';
    case '수원KT위즈파크':
      return '위즈파크';
    case '대전한화생명볼파크':
      return '이글스파크';
    case '대구삼성라이온즈파크':
      return '라이온즈파크';
    case '사직야구장':
      return '사직야구장';
    case '광주기아챔피언스필드':
      return '챔피언스필드';
    case '창원NC파크':
      return 'NC파크';
    case '고척스카이돔':
      return '고척스카이돔';
    // 제2구장추가
    case '포항야구장':
      return '포항야구장';
    case '울산문수야구장':
      return '문수야구장';
    case '청주종합운동장야구장':
      return '청주야구장';
    default:
      return '경기가 없어요!';
  }
};

export {
  getRandomElement,
  getRandomNickname,
  getTeamArrayWithIcon,
  renderIconSizeWithColor,
  hasAndroidPermission,
  getDistanceFromLatLonToKm,
  filterDuplicatedArray,
  getStadiumName,
  changeStadiumLongNameToNickname,
};
