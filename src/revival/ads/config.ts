import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// Debug builds always use Google's test units. Production keeps the existing
// Match Diary ad units in the current AdMob publisher account.
const production = {
  banner: Platform.select({
    android: 'ca-app-pub-6998718430585981/6457292164',
    ios: 'ca-app-pub-6998718430585981/1396537170',
    default: '',
  })!,
  interstitial: Platform.select({
    android: 'ca-app-pub-6998718430585981/5144210498',
    ios: 'ca-app-pub-6998718430585981/5899617912',
    default: '',
  })!,
};

export const adUnitIds = {
  banner: __DEV__ ? TestIds.BANNER : production.banner,
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : production.interstitial,
};
