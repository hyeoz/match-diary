import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import FastImage from 'react-native-fast-image';

import animation from '@assets/loading_animation.json';
import SignInGif from '@assets/logo_moving.gif';

export default function Loading({
  type = 'lottie',
}: {
  type?: 'lottie' | 'gif';
}) {
  if (type === 'lottie') {
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
  return (
    <FastImage
      source={SignInGif}
      style={{
        width: '65%',
        height: '40%',
      }}
      resizeMode="cover"
    />
  );
}
