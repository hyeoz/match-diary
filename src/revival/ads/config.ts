import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// Debug builds always use Google's test units. Production keeps the existing
// Match Diary ad units so the revived app remains attached to the same AdMob
// app instead of creating a second property.
const production = {
  banner: Platform.select({
    android: 'ca-app-pub-9889330849837260/5847172714',
    ios: 'ca-app-pub-9889330849837260/6327115488',
    default: '',
  })!,
  interstitial: Platform.select({
    android: 'ca-app-pub-9889330849837260/3428531549',
    ios: 'ca-app-pub-9889330849837260/2115449876',
    default: '',
  })!,
};

export const adUnitIds = {
  banner: __DEV__ ? TestIds.BANNER : production.banner,
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : production.interstitial,
};
