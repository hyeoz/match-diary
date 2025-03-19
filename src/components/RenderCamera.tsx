import React, { forwardRef } from 'react';
import { Dimensions } from 'react-native';
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

  if (hasPermission && device) {
    return (
      <Camera
        ref={ref}
        isActive={true}
        style={{
          position: 'absolute',
          width,
          height,
        }}
        device={device}
      />
    );
  } else {
    Toast.show({
      type: 'info',
      text1: '먼저 카메라 사용을 허용해주세요!',
    });
    requestPermission();
    return <></>;
  }
});

export default RenderCamera;
