import React, { useRef } from 'react';
import { Dimensions } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

const { width } = Dimensions.get('window');

export default function RenderCamera() {
  const cameraRef = useRef<Camera>(null);

  const device = useCameraDevice('back');
  const { hasPermission } = useCameraPermission();

  if (hasPermission && device) {
    return (
      <Camera
        ref={cameraRef}
        isActive={true}
        style={{
          width,
          aspectRatio: 1 / 1,
          position: 'absolute',
          // top: '25%',
          zIndex: 99,
        }}
        device={device}
      />
    );
  }

  return <></>;
}
