import { useEffect, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import BackgroundFetch from 'react-native-background-fetch';
import Geolocation from '@react-native-community/geolocation';

import { getDistanceFromLatLonToKm } from '@/utils/helper';
import { StadiumType } from '@/type/team';
import { CoordinateType } from '@/type/default';
import { STATIC_STADIUMS } from '@/utils/STATIC_DATA';

const DISTANCE_THRESHOLD = 100; // m
const MINIMUM_FETCH_TIME = 60; // 분

export default function GeoNotification() {
  useEffect(() => {
    backgroundAction();
  });

  const checkLocation = async () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        let currentStadium: StadiumType | null = null;
        let currentDistance: number = Infinity;

        for (const stadium of STATIC_STADIUMS) {
          const distance = getDistanceFromLatLonToKm(
            { lat: latitude, lon: longitude },
            { lat: stadium.latitude, lon: stadium.longitude },
          );
          if (distance < currentDistance) {
            currentDistance = distance;
            currentStadium = stadium;
          }
        }
        console.log(currentDistance, currentStadium);
        // TODO
        if (currentDistance <= DISTANCE_THRESHOLD) {
          PushNotification.localNotification({
            channelId: 'matchdiary-background-location-alert',
            title: `📍혹시 ${currentStadium?.stadium_name} 이신가요?`,
            message: '오늘의 직관일기를 기록해봐요!',
          });
        }
      },
      error => console.log('위치 가져오기 실패', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const setupBackgroundFetch = async () => {
    await BackgroundFetch.configure(
      {
        minimumFetchInterval: MINIMUM_FETCH_TIME, // 기본 15분마다 실행 (Android만 조정 가능)
        stopOnTerminate: false,
        startOnBoot: true,
      },
      async (taskId: string) => {
        console.log('⏳ 백그라운드 작업 실행 중...');
        await checkLocation();
        BackgroundFetch.finish(taskId);
      },
      error => console.log('백그라운드 작업 설정 실패', error),
    );

    await BackgroundFetch.start();
  };

  const backgroundAction = async () => {
    let appState = AppState.currentState;

    AppState.addEventListener('change', nextAppState => {
      appState = nextAppState;
    });

    // NOTE permission 관련
    requestLocationPermission();

    // NOTE push 알림 설정
    PushNotification.configure({
      onNotification: function (notification) {
        // 기본 알림 처리 막기
        notification.finish(PushNotificationIOS.FetchResult.NoData);

        // 커스텀 알림 생성
        showNotificationAlert();
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // NOTE background notification
    await setupBackgroundFetch();

    // TODO
    BackgroundFetch.scheduleTask({
      taskId: 'matchdiary-background-location',
      forceAlarmManager: true,
      delay: 60 * 60 * 1000, // <-- milliseconds
    });
  };

  return null;
}

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

const showNotificationAlert = () => {
  // 커스텀 알림 생성
  PushNotification.localNotification({
    title: '"직관일기" 가 알림을 보내고 싶어합니다.',
    message: '경기장 근처에서 알림을 보내드릴게요!',
    playSound: true, // 사운드 재생 여부
    soundName: 'default', // 사용할 사운드 파일
    vibrate: true, // 진동 여부
    priority: 'high', // 알림 우선순위
    visibility: 'public', // 알림의 공개 범위
    channelId: 'matchdiary-background-location-alert', // Android에서 필요한 채널 ID
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
