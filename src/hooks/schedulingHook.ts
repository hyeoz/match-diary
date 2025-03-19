import { API } from '@/api';
import { useUserState } from '@/stores/user';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import Toast from 'react-native-toast-message';

export async function onCreateTriggerNotification(selectedDate: string) {
  const { uniqueId } = useUserState.getState();
  const date = new Date(selectedDate + 'T00:00:00.000Z'); // UTC 기준으로 생성

  // offset을 적용하여 시간 조정
  // 정오에 알림 가도록
  date.setHours(12);
  date.setMinutes(0);

  // Request permissions (required for iOS)
  await notifee.requestPermission();

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'match_schedule_noti',
    name: 'match_schedule_noti',
  });

  // // NOTE TEST
  // const date = new Date(Date.now());
  // date.setHours(19);
  // date.setMinutes(11);

  // Create a time-based trigger
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
  };
  try {
    // Create a trigger notification
    await notifee.createTriggerNotification(
      {
        title: '설레는 직관 날짜가 다가왔어요!',
        body: '승리요정이 간다🧚🏻',
        android: {
          channelId,
        },
      },
      trigger,
    );
    await API.post('/create-booking', { userId: uniqueId, date: date });
    Toast.show({
      type: 'success',
      text1: '직관 알림 예약이 완료되었어요!',
      text2: '선택한 날짜에 알려드릴게요!',
    });
  } catch (error) {
    console.error(error);
  }
}
