import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';

export async function onCreateTriggerNotification(selectedDate: string) {
  // const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
  // const date = new Date(selectedDate + 'T00:00:00.000Z'); // UTC 기준으로 생성
  // const offsetHours = Math.floor(timezoneOffset / 60);
  // const offsetMinutesRemainder = timezoneOffset % 60;

  // offset을 적용하여 시간 조정
  // 정오에 알림 가도록
  // date.setHours(date.getHours() + offsetHours + 12);
  // date.setMinutes(date.getMinutes() + offsetMinutesRemainder);
  const date = new Date(Date.now());
  date.setMinutes(50);

  // Create a time-based trigger
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
  };

  // Create a trigger notification
  await notifee.createTriggerNotification(
    {
      title: '설레는 직관 날짜가 다가왔어요!',
      body: '승리요정이 간다🧚🏻',
      android: {
        channelId: 'match_schedule_noti',
      },
    },
    trigger,
  );
}
