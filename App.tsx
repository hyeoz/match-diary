import React, { useEffect } from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import mobileAds, {
  MaxAdContentRating,
  AdsConsent,
} from 'react-native-google-mobile-ads';

import Router from '@/router';
// import GeoNotification from '@/components/GeoNotification';

function App(): React.JSX.Element {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const initializeAds = async () => {
      await mobileAds().initialize();

      // 초기화 완료 후 구성 설정
      mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.G,
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
        // TODO 실제 배포 시 테스트 디바이스 제거
        testDeviceIdentifiers: ['EMULATOR'],
      });

      // NOTE UMP 설정
      if (__DEV__) {
        // UMP 테스트를 위한 설정
        await AdsConsent.requestInfoUpdate();
        const consentInfo = await AdsConsent.getConsentInfo();

        if (consentInfo.isConsentFormAvailable) {
          await AdsConsent.showForm();
        }
      }
    };

    initializeAds().catch(console.error);
  }, []);

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Router />
      </NavigationContainer>
      <Toast />
      {/* <GeoNotification /> */}
    </>
  );
}

export default App;
