import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

import {
  REACT_APP_ANDROID_MAIN_BANNER_ID,
  REACT_APP_ANDROID_SPLASH_BANNER_ID,
  REACT_APP_ANDROID_HISTORY_BANNER_ID,
  REACT_APP_ANDROID_MAP_BANNER_ID,
  REACT_APP_IOS_MAIN_BANNER_ID,
  REACT_APP_IOS_SPLASH_BANNER_ID,
  REACT_APP_IOS_HISTORY_BANNER_ID,
  REACT_APP_IOS_MAP_BANNER_ID,
} from '@env';

const BannerAdComponent = ({ adsType }: { adsType: string }) => {
  const getBannerId = () => {
    switch (adsType) {
      case 'splash':
        return Platform.OS === 'android'
          ? REACT_APP_ANDROID_SPLASH_BANNER_ID
          : REACT_APP_IOS_SPLASH_BANNER_ID;
      case 'main':
        return Platform.OS === 'android'
          ? REACT_APP_ANDROID_MAIN_BANNER_ID
          : REACT_APP_IOS_MAIN_BANNER_ID;
      case 'history':
        return Platform.OS === 'android'
          ? REACT_APP_ANDROID_HISTORY_BANNER_ID
          : REACT_APP_IOS_HISTORY_BANNER_ID;
      case 'map':
        return Platform.OS === 'android'
          ? REACT_APP_ANDROID_MAP_BANNER_ID
          : REACT_APP_IOS_MAP_BANNER_ID;
      default:
        return Platform.OS === 'android'
          ? REACT_APP_ANDROID_MAIN_BANNER_ID
          : REACT_APP_IOS_MAIN_BANNER_ID;
    }
  };

  return (
    <View
      style={
        adsType === 'splash'
          ? styles.splashContainer
          : adsType === 'main'
          ? styles.mainContainer
          : styles.defaultContainer
      }>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : getBannerId()}
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
  defaultContainer: {},
});

export default BannerAdComponent;
