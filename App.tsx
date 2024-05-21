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
import BackgroundGeolocation from 'react-native-background-geolocation';
import Toast from 'react-native-toast-message';

import Router from './src/router';
import { STADIUM_GEO } from '@/utils/STATIC_DATA';
import PushNotification, {
  ReceivedNotification,
} from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

function App(): React.JSX.Element {
  const navigationRef = useNavigationContainerRef();
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    // NOTE geofence 설정 및 시작
    BackgroundGeolocation.ready({}, state => {
      if (!state.enabled) {
        showLocationAlert();
      } else {
        BackgroundGeolocation.addGeofences(
          Object.entries(STADIUM_GEO).map(item => ({
            identifier: item[0],
            longitude: item[1].lon,
            latitude: item[1].lat,
            radius: 350,
            notifyOnEntry: true,
          })),
        )
          .then(success => {
            BackgroundGeolocation.start();
          })
          .catch(error => console.log({ error }));
      }
    });

    // NOTE permission 관련
    requestLocationPermission();

    // NOTE push 알림 설정
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        // 기본 알림 처리 막기
        notification.finish(PushNotificationIOS.FetchResult.NoData);

        // 커스텀 알림 생성
        showNotificationAlert(notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // clean up
    return () => {
      BackgroundGeolocation.stop();
    };
  }, []);

  // NOTE geofence 기능
  BackgroundGeolocation.onGeofence(event => {
    // console.log({ event });
    if (event.action === 'ENTER') {
      // TODO
      PushNotification.localNotification({
        message: '오늘의 직관 일기를 기록해봐요!',
        title: `혹시 ${event.identifier}경기장이신가요?`,
      });
    }
  });

  const showLocationAlert = () => {
    return Alert.alert(
      '위치 서비스 비활성화',
      '더 많은 기능을 위해 위치 정보 이용을 허용해주세요!',
      [
        { text: '취소', style: 'cancel' },
        { text: '설정으로 이동', onPress: () => openSettings() },
      ],
    );
  };

  const showNotificationAlert = (
    notification: Omit<ReceivedNotification, 'userInfo'>,
  ) => {
    // const { message } = notification;

    // 커스텀 알림 생성
    PushNotification.localNotification({
      title: '"직관일기" 가 알림을 보내고 싶어합니다.',
      message: '경기장 근처에서 알림을 보내드릴게요!',
      playSound: true, // 사운드 재생 여부
      soundName: 'default', // 사용할 사운드 파일
      vibrate: true, // 진동 여부
      priority: 'high', // 알림 우선순위
      visibility: 'public', // 알림의 공개 범위
      channelId: 'custom-channel-id', // Android에서 필요한 채널 ID
      userInfo: {}, // 사용자 정의 데이터
    });
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      // IOS 13부터는 WHEN_IN_USE 부터 확인해야 함
      const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

      // WHEN_IN_USE === TRUE
      if (status === RESULTS.GRANTED) {
        // ALWAYS CHECK
        const statusAlways = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);

        // ALWAYS === FALSE
        if (statusAlways !== RESULTS.GRANTED) {
          // ALWAYS REQUESTS
          const statusAlwaysRequest = await request(
            PERMISSIONS.IOS.LOCATION_ALWAYS,
          );

          if (statusAlwaysRequest !== RESULTS.GRANTED) {
            showLocationAlert();
          }
        }
      } else {
        // WHEN_IN_USE === FALSE
        const statusInUseRequest = await request(
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        );
        if (statusInUseRequest !== RESULTS.GRANTED) {
          showLocationAlert();
        }
      }
    }
  };

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
