import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { colors } from '../theme';
import { adUnitIds } from './config';

export default function AdBanner() {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <View
      pointerEvents={loaded ? 'auto' : 'none'}
      style={[styles.container, loaded ? styles.loaded : styles.collapsed]}
      testID="ad-banner-container">
      <BannerAd
        onAdFailedToLoad={() => {
          setLoaded(false);
          setFailed(true);
        }}
        onAdLoaded={() => {
          setFailed(false);
          setLoaded(true);
        }}
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
  collapsed: {
    height: 0,
    overflow: 'hidden',
    opacity: 0,
  },
  loaded: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
