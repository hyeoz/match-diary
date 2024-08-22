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

export const hasAndroidPermission = async () => {
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission);
  return status === 'granted';
};

export const renderIconSizeWithColor = (
  Svg: React.FC<SvgProps>,
  width: number,
  height?: number,
  color?: string,
) => {
  return <Svg width={width} height={height ?? width} color={color} />;
};

export const getRandomElement = (array: string[]) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const getTeamArrayWithIcon = (iconSize?: number) => [
  {
    key: 'SSG',
    label: 'SSG 랜더스',
    icon: renderIconSizeWithColor(
      Landers,
      iconSize ?? 48,
      undefined,
      palette.teamColor.SSG,
    ),
  },
  {
    key: 'LG',
    label: 'LG 트윈스',
    icon: renderIconSizeWithColor(
      Twins,
      iconSize ?? 48,
      undefined,
      palette.teamColor.LG,
    ),
  },
  {
    key: 'KT',
    label: 'KT 위즈',
    icon: renderIconSizeWithColor(
      Wiz,
      iconSize ?? 48,
      undefined,
      palette.teamColor.KT,
    ),
  },
  {
    key: '한화',
    label: '한화 이글스',
    icon: renderIconSizeWithColor(
      Eagles,
      iconSize ?? 48,
      undefined,
      palette.teamColor.한화,
    ),
  },
  {
    key: '롯데',
    label: '롯데 자이언츠',
    icon: renderIconSizeWithColor(
      Seagull,
      iconSize ?? 48,
      undefined,
      palette.teamColor.롯데,
    ),
  },
  {
    key: '키움',
    label: '키움 히어로즈',
    icon: renderIconSizeWithColor(
      Heros,
      iconSize ?? 48,
      undefined,
      palette.teamColor.키움,
    ),
  },
  {
    key: 'NC',
    label: 'NC 다이노스',
    icon: renderIconSizeWithColor(
      Dinos,
      iconSize ?? 48,
      undefined,
      palette.teamColor.NC,
    ),
  },
  {
    key: 'KIA',
    label: '기아 타이거즈',
    icon: renderIconSizeWithColor(
      Tigers,
      iconSize ?? 48,
      undefined,
      palette.teamColor.KIA,
    ),
  },
  {
    key: '삼성',
    label: '삼성 라이온즈',
    icon: renderIconSizeWithColor(
      Lions,
      iconSize ?? 48,
      undefined,
      palette.teamColor.삼성,
    ),
  },
  {
    key: '두산',
    label: '두산 베어스',
    icon: renderIconSizeWithColor(
      Bears,
      iconSize ?? 48,
      undefined,
      palette.teamColor.두산,
    ),
  },
];
