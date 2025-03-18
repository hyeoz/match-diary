import React, { RefObject, useRef } from 'react';
import { Dimensions, View } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

const { width, height } = Dimensions.get('window');

export default function RenderCamera({
  cameraRef,
}: {
  cameraRef: RefObject<Camera>;
}) {
  const device = useCameraDevice('back');
  const { hasPermission } = useCameraPermission();

  if (hasPermission && device) {
    return (
      <Camera
        ref={cameraRef}
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
    return <></>;
  }
}
