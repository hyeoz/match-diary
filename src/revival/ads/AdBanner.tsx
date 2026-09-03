import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { colors } from '../theme';
import { adUnitIds } from './config';

export default function AdBanner() {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={[styles.container, loaded && styles.loaded]}>
      <BannerAd
        onAdFailedToLoad={() => setLoaded(false)}
        onAdLoaded={() => setLoaded(true)}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        unitId={adUnitIds.banner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.canvas,
  },
  loaded: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
