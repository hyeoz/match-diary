import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';

import animation from '@assets/loading_animation.json';

export default function Loading() {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
      <LottieView
        source={animation}
        autoPlay
        loop
        style={{
          width: 300,
          height: 100,
        }}
      />
    </View>
  );
}
