import { hasAndroidPermission } from '@/utils/helper';
import React, { forwardRef } from 'react';
import { Dimensions, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

const { width, height } = Dimensions.get('window');

const RenderCamera = forwardRef<Camera, unknown>((_, ref) => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const getAndroidPermission = async () => {
    if (Platform.OS === 'android') {
      if (!(await hasAndroidPermission('CAMERA'))) {
        requestPermission();
      }
    } else {
      requestPermission();
    }
  };

  if (hasPermission && device) {
    return (
      <Camera
        ref={ref}
        isActive={true}
        photo={true}
        style={{
          position: 'absolute',
          width,
          aspectRatio: 1 / 1.2,
          top: '7%'
        }}
        device={device}
      />
    );
  } else {
    Toast.show({
      type: 'info',
      text1: '먼저 카메라 사용을 허용해주세요!',
    });
    getAndroidPermission();
  }

  return <></>;
});

export default RenderCamera;
