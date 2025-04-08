import { Platform } from 'react-native';
import { InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import {
  REACT_APP_ANDROID_INTERSTITIAL_ID,
  REACT_APP_IOS_INTERSTITIAL_ID,
} from '@env';

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'android'
  ? REACT_APP_ANDROID_INTERSTITIAL_ID
  : REACT_APP_IOS_INTERSTITIAL_ID;

export const interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});
