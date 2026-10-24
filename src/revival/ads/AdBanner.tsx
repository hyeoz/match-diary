import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { colors } from '../theme';
import { adUnitIds } from './config';

export type AdBannerHandle = { showOnNavigation: () => void };

const AdBanner = forwardRef<AdBannerHandle>(function AdBanner(_props, ref) {
  const loadedAt = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      // Reveal only as part of an explicit tab change. A late LOADED event must
      // never move content or put an ad under a finger already using the screen.
      showOnNavigation: () => {
        if (
          failed ||
          loadedAt.current === null ||
          AppState.currentState !== 'active'
        )
          return;
        if (Date.now() - loadedAt.current >= 55 * 60_000) {
          setFailed(true);
          return;
        }
        setVisible(true);
      },
    }),
    [failed],
  );

  if (failed) return null;

  return (
    <View
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[styles.container, visible ? styles.visible : styles.collapsed]}
      testID="ad-banner-container">
      {visible ? <Text style={styles.label}>광고</Text> : null}
      <BannerAd
        onAdFailedToLoad={() => {
          loadedAt.current = null;
          setFailed(true);
        }}
        onAdLoaded={() => {
          loadedAt.current = Date.now();
        }}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        unitId={adUnitIds.banner}
      />
    </View>
  );
});

export default AdBanner;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F0EEE8',
  },
  collapsed: {
    height: 0,
    overflow: 'hidden',
    opacity: 0,
  },
  visible: {
    // These are noninteractive buffers, not a claim of a policy-safe minimum.
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: colors.line,
    borderBottomColor: colors.line,
  },
  label: {
    color: '#68645C',
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 8,
  },
});
