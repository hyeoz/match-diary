import React from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Router from '@/router';
import { AdsProvider } from '@/revival/ads/AdsContext';
// import GeoNotification from '@/components/GeoNotification';

function App(): React.JSX.Element {
  const navigationRef = useNavigationContainerRef();

  return (
    <SafeAreaProvider>
      <AdsProvider>
        <NavigationContainer ref={navigationRef}>
          <Router />
        </NavigationContainer>
      </AdsProvider>
    </SafeAreaProvider>
  );
}

export default App;
