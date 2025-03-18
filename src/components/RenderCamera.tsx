import React, { RefObject, useRef } from 'react';
import { Dimensions, View } from 'react-native';
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
  const tempRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission } = useCameraPermission();
  console.log(cameraRef.current);
  if (hasPermission && device) {
    return (
      <Camera
        ref={tempRef}
        isActive={true}
        style={{
          width,
          aspectRatio: 1 / 1,
          position: 'absolute',
          top: '25%',
          transform: [{ translateY: -height / 4 }],
        }}
        device={device}
      />
    );
  }

  return <></>;
}
