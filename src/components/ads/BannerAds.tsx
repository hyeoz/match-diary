import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

import {
  REACT_APP_ANDROID_MAIN_BANNER_ID,
  REACT_APP_IOS_MAIN_BANNER_ID,
  REACT_APP_ANDROID_SPLASH_BANNER_ID,
  REACT_APP_IOS_SPLASH_BANNER_ID,
} from '@env';

const BannerAdComponent = ({ isSplash }: { isSplash: boolean }) => {
  const bannerId = isSplash
    ? Platform.OS === 'android'
      ? REACT_APP_ANDROID_SPLASH_BANNER_ID
      : REACT_APP_IOS_SPLASH_BANNER_ID
    : Platform.OS === 'android'
    ? REACT_APP_ANDROID_MAIN_BANNER_ID
    : REACT_APP_IOS_MAIN_BANNER_ID;

  return (
    <View style={isSplash ? styles.splashContainer : styles.mainContainer}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : bannerId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'absolute',
    top: 80,
  },
  splashContainer: {
    top: -400,
  },
});

export default BannerAdComponent;
