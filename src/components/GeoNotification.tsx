import { useEffect, useRef } from 'react';
import PushNotification, {
  ReceivedNotification,
} from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import uuid from 'react-native-uuid';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { Alert, AppState, Platform } from 'react-native';

import { STADIUM_GEO } from '@/utils/STATIC_DATA';

export default function GeoNotification() {
  const geoSwitch = useRef(false);

  useEffect(() => {
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

    addGeofences();

    // NOTE geofence 기능
    const onGeo = BackgroundGeolocation.onGeofence(event => {
      if (event.action === 'ENTER') {
        PushNotification.localNotification({
          id: uuid.v4() as string,
          title: `혹시 ${event.identifier}경기장이신가요?`,
          message: '오늘의 직관 일기를 기록해봐요!',
          priority: 'high',
          visibility: 'private',
        });
        // BackgroundGeolocation.setConfig({
        //   notification: {
        //     title: `혹시 ${event.identifier}경기장이신가요?`,
        //     text: '오늘의 직관 일기를 기록해봐요!',
        //   },
        // });
      }
    });
    // NOTE geofence 설정 및 시작
    BackgroundGeolocation.ready(
      {
        reset: true,
        distanceFilter: 50,
        stopTimeout: 1,
        debug: false, // Authorization status changed 3 자동 알림 수정 숨기기
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        stopOnTerminate: false,
        startOnBoot: true,
        geofenceProximityRadius: 500, // 지오펜스 근접 반경 설정
        notification: {
          title: '',
          text: '',
          priority: BackgroundGeolocation.NOTIFICATION_PRIORITY_MIN,
          channelId: 'custom-channel-id', // Ensure custom channelId to avoid default notifications
        },
      },
      state => {
        if (!geoSwitch.current) {
          BackgroundGeolocation.start();
        }
        geoSwitch.current = true;
      },
    );

    // clean up
    return () => {
      BackgroundGeolocation.stop();
      onGeo.remove();
      geoSwitch.current = false;
    };
  }, []);

  const addGeofences = async () => {
    await BackgroundGeolocation.addGeofences(
      Object.entries(STADIUM_GEO).map(item => ({
        identifier: item[0],
        longitude: item[1].lon,
        latitude: item[1].lat,
        radius: 500,
        notifyOnEntry: true,
      })),
    );
  };

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

  return null;
}
