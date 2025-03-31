import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
// import GeoNotification from '@/components/GeoNotification';
import Router from '@/router';

function App(): React.JSX.Element {
  const navigationRef = useNavigationContainerRef();
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        // 초기화 완료 후 구성 설정
        mobileAds().setRequestConfiguration({
          maxAdContentRating: MaxAdContentRating.G,
          tagForChildDirectedTreatment: true,
          tagForUnderAgeOfConsent: true,
          // TODO 실제 배포 시 테스트 디바이스 제거
          testDeviceIdentifiers: ['EMULATOR'],
        });
      });
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
