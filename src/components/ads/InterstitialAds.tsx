import { Platform } from 'react-native';
import { InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { REACT_APP_ANDROID_APP_ID, REACT_APP_IOS_APP_ID } from '@env';

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'android'
  ? REACT_APP_ANDROID_APP_ID
  : REACT_APP_IOS_APP_ID;

export const interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});
