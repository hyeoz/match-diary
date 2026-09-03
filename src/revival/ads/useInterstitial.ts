import { useCallback, useEffect, useRef, useState } from 'react';
import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';

import { adUnitIds } from './config';

export function useInterstitial(enabled = true) {
  const adRef = useRef<InterstitialAd | null>(null);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);

  const setReadyState = (value: boolean) => {
    readyRef.current = value;
    setReady(value);
  };

  useEffect(() => {
    if (!enabled) {
      setReadyState(false);
      adRef.current = null;
      return;
    }

    const ad = InterstitialAd.createForAdRequest(adUnitIds.interstitial, {
      requestNonPersonalizedAdsOnly: true,
    });
    adRef.current = ad;

    const onLoaded = ad.addAdEventListener(AdEventType.LOADED, () =>
      setReadyState(true),
    );
    const onClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setReadyState(false);
      ad.load();
    });
    const onError = ad.addAdEventListener(AdEventType.ERROR, () =>
      setReadyState(false),
    );

    ad.load();
    return () => {
      setReadyState(false);
      adRef.current = null;
      onLoaded();
      onClosed();
      onError();
    };
  }, [enabled]);

  const show = useCallback(() => {
    if (readyRef.current && adRef.current) {
      adRef.current.show().catch(() => {});
    }
  }, []);

  return { ready, show };
}
