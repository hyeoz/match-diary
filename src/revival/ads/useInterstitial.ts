import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import Storage from '@react-native-async-storage/async-storage';
import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';
import { useAds } from './AdsContext';
import { adUnitIds } from './config';
import { createInterstitialPolicy } from './interstitialPolicy';
import { createInterstitialController } from './interstitialController';

// Shared by every hook instance; remounts do not reset frequency limits.
const policy = createInterstitialPolicy(Storage, 2);
const events = {
  loaded: AdEventType.LOADED,
  opened: AdEventType.OPENED,
  closed: AdEventType.CLOSED,
  error: AdEventType.ERROR,
};

export function useInterstitial(enabled = true) {
  const { ready: canRequestAds } = useAds();
  const allowed = enabled && canRequestAds && !!adUnitIds.interstitial;
  const allowedRef = useRef(allowed);
  allowedRef.current = allowed;
  const controller = useRef<ReturnType<typeof createInterstitialController> | null>(null);
  if (!controller.current) {
    controller.current = createInterstitialController({
      createAd: () => {
        const ad = InterstitialAd.createForAdRequest(adUnitIds.interstitial, {
          requestNonPersonalizedAdsOnly: true,
        });
        return {
          listen: (event, callback) => ad.addAdEventListener(events[event], callback),
          load: () => ad.load(),
          show: () => ad.show(),
        };
      },
      reserve: available => policy.reserve(available && allowedRef.current),
      isActive: () => allowedRef.current && AppState.currentState === 'active',
    });
  }
  useEffect(() => {
    const current = controller.current!;
    if (allowed) current.start();
    else current.stop();
    return () => current.stop();
  }, [allowed]);

  const show = useCallback(() => controller.current!.show(), []);
  return { show };
}
