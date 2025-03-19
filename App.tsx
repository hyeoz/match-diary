import React from 'react';
import { useColorScheme } from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// import GeoNotification from '@/components/GeoNotification';
import Router from '@/router';

function App(): React.JSX.Element {
  const navigationRef = useNavigationContainerRef();
  const isDarkMode = useColorScheme() === 'dark';

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
