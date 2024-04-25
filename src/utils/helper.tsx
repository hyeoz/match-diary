import { PermissionsAndroid } from 'react-native';
import { SvgProps } from 'react-native-svg';

export const hasAndroidPermission = async () => {
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission);
  return status === 'granted';
};

export const renderIconSize = (
  Svg: React.FC<SvgProps>,
  width: number,
  height?: number,
) => {
  return <Svg width={width} height={height ?? width} />;
};
