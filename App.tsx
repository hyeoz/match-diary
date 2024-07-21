import React, { useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import Router from './src/router';
// import GeoNotification from '@/components/GeoNotification';

function App(): React.JSX.Element {
  const navigationRef = useNavigationContainerRef();
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

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
