import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

import { REACT_APP_ANDROID_APP_ID, REACT_APP_IOS_APP_ID } from '@env';

const BannerAdComponent = () => {
  return (
    <View style={styles.container}>
      <BannerAd
        // TODO 배포 시 실제 ID 로 수정
        unitId={TestIds.BANNER}
        // unitId={
        //   Platform.OS === 'android'
        //     ? REACT_APP_ANDROID_APP_ID
        //     : REACT_APP_IOS_APP_ID
        // }
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'absolute',
    top: 80,
  },
});

export default BannerAdComponent;
