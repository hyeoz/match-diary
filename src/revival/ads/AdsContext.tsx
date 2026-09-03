import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import mobileAds, {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';

type AdsState = {
  ready: boolean;
  privacyOptionsRequired: boolean;
  showPrivacyOptions: () => Promise<void>;
};

const AdsContext = createContext<AdsState | null>(null);

const startAds = async () => {
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.PG,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
  });
  await mobileAds().initialize();
};

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);

  const refreshConsent = useCallback(async () => {
    const info = await AdsConsent.getConsentInfo();
    setPrivacyOptionsRequired(
      info.privacyOptionsRequirementStatus ===
        AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    );
    return info;
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        await AdsConsent.requestInfoUpdate({
          tagForUnderAgeOfConsent: false,
        });
        await AdsConsent.loadAndShowConsentFormIfRequired();
      } catch (error) {
        if (!__DEV__) console.warn('[ads] consent update failed', error);
      }

      try {
        const info = await refreshConsent();
        // Development builds only use Google's test units, so previews remain
        // testable even before this app has a UMP message configured.
        if (!info.canRequestAds && !__DEV__) return;
        await startAds();
        if (active) setReady(true);
      } catch (error) {
        console.warn('[ads] initialization skipped', error);
      }
    };

    initialize();
    return () => {
      active = false;
    };
  }, [refreshConsent]);

  const showPrivacyOptions = useCallback(async () => {
    const info = await AdsConsent.showPrivacyOptionsForm();
    setPrivacyOptionsRequired(
      info.privacyOptionsRequirementStatus ===
        AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    );
    if (info.canRequestAds && !ready) {
      await startAds();
      setReady(true);
    } else if (!info.canRequestAds) {
      setReady(false);
    }
  }, [ready]);

  return (
    <AdsContext.Provider
      value={{ ready, privacyOptionsRequired, showPrivacyOptions }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdsContext);
  if (!context) throw new Error('useAds must be used inside AdsProvider');
  return context;
}
