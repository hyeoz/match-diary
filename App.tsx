/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

import Router from './src/router';
import Toast from 'react-native-toast-message';

function App(): React.JSX.Element {
  const navigationRef = useNavigationContainerRef();
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'ios') {
        const status = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
        // if (status === RESULTS.DENIED) {
        // } else if (status !== RESULTS.GRANTED) {
        // const statusWhenInUse = await request(
        //   PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        // );
        // if (statusWhenInUse === RESULTS.GRANTED) {
        // 위치 "항상" 권한 요청
        // const statusAlways = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
        // if (statusAlways !== RESULTS.GRANTED) {
        //   console.log('위치 "항상" 권한이 거부되었습니다.');
        // }
        // } else {
        //   Alert.alert(
        //     '위치 서비스 비활성화',
        //     '위치 서비스가 비활성화되어 있습니다. 활성화하려면 설정으로 이동하십시오.',
        //     [
        //       { text: '취소', style: 'cancel' },
        //       { text: '설정으로 이동', onPress: () => openSettings() },
        //     ],
        //   );
        //   console.log('위치 "앱을 사용하는 동안" 권한이 거부되었습니다.');
        // }
        // }
      }
    };

    requestLocationPermission();
  }, []);

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Router />
      </NavigationContainer>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({});

export default App;
